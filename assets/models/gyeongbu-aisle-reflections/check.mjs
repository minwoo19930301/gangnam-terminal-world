import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {serve} from '../../../tests/serve.mjs';

const floors = [
  ['children', 25, '경부선 6층 · 아동복 철망 진열과 접은 상품'],
  ['tailoring', 29.5, '경부선 7층 · 이단 신사복 행거와 소매 상품표'],
  ['womenswear', 34, '경부선 8층 · 식물무늬 니트와 집게 바지 및 외투 마네킹']
];

const server = await serve(0);
const browser = await chromium.launch({
  channel:'chromium', args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']
});
const page = await browser.newPage({viewport:{width:1000,height:640}});
const errors = [], requests = [];
page.on('pageerror', e=>errors.push(e.message));
page.on('response', response=>{
  if(response.url().includes('/gyeongbu-aisle-reflections/'))requests.push(response.url().split('/').at(-1));
});

function camera(u,v,height) {
  return {x:2.3+u*.9348+v*.3552, z:-59.24-u*.3552+v*.9348, y:height,
    yaw:Math.atan2(-.3552,-.9348), pitch:-.19, vy:0};
}

function hasReflection(name) {
  const w=window.__world, root=w.scene.getObjectByName(name);
  if(!root)return false;
  const atlas=w.renderer.properties.get(root.children[0].material).uniforms?.aisleReflection?.value;
  return atlas?.isTexture && !atlas.isDataTexture;
}

// Run both draws within the same animation tick, preserving traffic, exposure
// and the camera. Only the reflection sampler changes between the two reads.
function inspectReflection(name) {
  const w=window.__world, T=w.K.THREE, renderer=w.renderer, gl=renderer.getContext();
  const root=w.scene.getObjectByName(name), material=root.children[0].material;
  const slot=renderer.properties.get(material).uniforms.aisleReflection, original=slot.value;
  const black=new T.DataTexture(new Uint8Array([0,0,0,255]),1,1);
  black.needsUpdate=true;
  const width=gl.drawingBufferWidth, height=gl.drawingBufferHeight;
  function shot() {
    renderer.render(w.scene,w.camera);
    const pixels=new Uint8Array(width*height*4);
    gl.readPixels(0,0,width,height,gl.RGBA,gl.UNSIGNED_BYTE,pixels);
    return {pixels, counts:[renderer.info.render.calls,renderer.info.render.triangles]};
  }
  let before;
  try {slot.value=black;before=shot();} finally {slot.value=original;}
  const after=shot();
  function delta(x,y) {
    const i=(y*width+x)*4;
    return Math.max(...[0,1,2].map(k=>Math.abs(before.pixels[i+k]-after.pixels[i+k])));
  }
  // Project each diffuser's mirror image about the authored horizontal tile.
  const lamps=[];
  for(const z of [-2.74,0,2.73,5.54,8.31,11.09,13.86,16.64,19.42]) {
    const p=new T.Vector3(-.08,2*.052-2.923,z).applyMatrix4(root.matrixWorld).project(w.camera);
    const x=Math.round((p.x+1)*width*.5), y=Math.round((p.y+1)*height*.5);
    if(x<32 || x+32>=width || y<5 || y>=height-6)continue;
    lamps.push({z,x,y,center:delta(x,y),edge:Math.min(delta(x-28,y),delta(x+28,y))});
  }
  black.dispose();
  return {before:before.counts,after:after.counts,lamps,texture:[original.image.width,original.image.height]};
}

let attempts=0;
await page.route('**/gyeongbu-aisle-reflections/tailoring.webp',route=>
  ++attempts===1 ? route.abort('failed') : route.continue());

try {
  const start=camera(38.02,105.10,25);
  const site='http://127.0.0.1:'+server.address().port+'/index.html?fixedres=1#/gyeongbu/6F?p=';
  await page.goto(site+[start.x,start.y,start.z,start.yaw*180/Math.PI].join(','));
  await page.waitForFunction(()=>window.__world?.ready,null,{timeout:140000});
  await page.locator('#start').click();

  for(const [key,height,name] of floors) {
    for(const [u,v] of [[38,105.18],[38.54,105.87]]) {
      const testFallback=key==='tailoring' && u===38;
      if(testFallback) {
        // Hold the finish after linking to reproduce a first-time GPU cache miss.
        await page.evaluate(()=>{
          const renderer=window.__world.renderer, compile=renderer.compileAsync.bind(renderer);
          renderer.compileAsync=(object,...args)=>{
            const pending=compile(object,...args);
            if(object.material?.customProgramCacheKey()!=='banpo-polished-market-tile')return pending;
            renderer.compileAsync=compile;
            return pending.then(result=>new Promise(resolve=>{
              window.releaseAisleFinish=()=>resolve(result);
            }));
          };
        });
      }
      await page.evaluate(pose=>Object.assign(window.__world.player,pose),camera(u,v,height));
      if(testFallback) {
        await page.waitForFunction(name=>{
          const w=window.__world, item=w.scene.getObjectByName(name)?.children[0];
          return window.releaseAisleFinish && item?.material.map &&
            !w.renderer.properties.get(item.material).uniforms?.aisleReflection;
        },name,{timeout:4000});
        await page.evaluate(()=>window.releaseAisleFinish());
        await page.waitForFunction(name=>{
          const w=window.__world, item=w.scene.getObjectByName(name).children[0];
          return item.material.map && w.renderer.properties.get(item.material).uniforms?.aisleReflection?.value?.isDataTexture;
        },name,{timeout:4000});
      }
      await page.waitForFunction(hasReflection,name,{timeout:15000});
      await page.evaluate(()=>new Promise(requestAnimationFrame));
      const stats=await page.evaluate(inspectReflection,name);
      assert.deepEqual(stats.before,stats.after,'same ordinary draw with the finish on and off');
      assert.deepEqual(stats.texture,[242,672]);
      assert.ok(stats.lamps.length>=6);
      assert.ok(stats.lamps.filter(lamp=>lamp.center>lamp.edge+12).length>=6,
        key+' lights align with the predicted floor reflections at '+u);
      console.log(key,u,v,JSON.stringify(stats));
    }
  }
  assert.equal(attempts,2,'one retry after the optional reflection download fails');
  for(const [key] of floors)assert.equal(requests.filter(url=>url===key+'.webp').length,1);
  assert.deepEqual(errors,[]);
} finally {
  await browser.close();
  await new Promise(done=>server.close(done));
}
