// Verify actual shaded river pixels and lamp switching through the normal browser entry.
// node tests/river-water.mjs --gpu [--out screenshots]
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import { serve } from './serve.mjs';

const args = process.argv.slice(2);
const out = args.includes('--out') ? args[args.indexOf('--out')+1] : null;
if (out) fs.mkdirSync(out,{recursive:true});
const server = await serve(0);
const browser = await chromium.launch(args.includes('--gpu')
  ? {channel:'chromium',args:['--use-angle=metal','--ignore-gpu-blocklist','--enable-gpu']}
  : {args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try {
  const page = await browser.newPage({viewport:{width:1000,height:630}});
  const errors = [];
  page.on('pageerror',err => errors.push(err.message));
  page.on('console',msg => { if (msg.type()==='error') errors.push(msg.text()); });
  const base = 'http://127.0.0.1:'+server.address().port;
  await page.addInitScript(() => sessionStorage.setItem('sky-mode','day'));
  const shot = async name => {
    if (out) await page.screenshot({path:path.join(out,name+'.png')});
  };
  async function openView(addr,pitch) {
    await page.goto(base+'/index.html?fixedres=1'+addr);
    await page.waitForFunction(() => window.__world?.ready,null,{timeout:120000});
    const enter = page.getByRole('button',{name:'들어가기'});
    if (await enter.isVisible()) await enter.click();
    await page.evaluate(pitch => { window.__world.player.pitch=pitch*Math.PI/180; },pitch);
    await page.addStyleTag({content:'#app > :not(canvas){visibility:hidden!important}'});
    await page.waitForTimeout(1000);
  }

  await openView('#/hangang/1F?p=-706,1.6,-931.4,114',-18);
  const result = await page.evaluate(async () => {
    const w = window.__world, T = await import('three'), r = w.renderer;
    const meshes = w.scene.children.filter(m => m.material?.name==='한강 수면');
    const mat = meshes[0].material, shader = r.properties.get(mat).uniforms;
    const ray = new T.Raycaster(), gl = r.getContext(), canvas = r.domElement;
    const width = 128, height = 32, x = Math.floor(canvas.width*.55), y = Math.floor(canvas.height*.57);
    const firstHitIsWater = (px,py) => {
      ray.setFromCamera(new T.Vector2(px/canvas.width*2-1,py/canvas.height*2-1),w.camera);
      const first = ray.intersectObjects(w.scene.children,true).find(hit => {
        if (!hit.object.isMesh) return false;
        for (let o=hit.object;o;o=o.parent) if (!o.visible) return false;
        return true;
      });
      return first?.object.material===mat;
    };
    const frames = [];
    const next = () => new Promise(resolve => requestAnimationFrame(resolve));
    function read() {
      r.render(w.scene,w.camera);
      const data = new Uint8Array(width*height*4);
      gl.readPixels(x,y,width,height,gl.RGBA,gl.UNSIGNED_BYTE,data);
      return data;
    }
    const waterHits = [x,x+width/2,x+width].flatMap(px =>
      [y,y+height/2,y+height].map(py => firstHitIsWater(px,py)));
    const start = shader.hanTime.value, first = read();
    let previous = performance.now();
    while (shader.hanTime.value-start<1.25) {
      await next();
      const now = performance.now(); frames.push(now-previous); previous=now;
    }
    const second = read();
    let changed=0, delta=0;
    for (let i=0;i<first.length;i+=4) {
      const d = [0,1,2].map(k=>Math.abs(first[i+k]-second[i+k]));
      delta+=d[0]+d[1]+d[2]; if (Math.max(...d)>=3) changed++;
    }
    frames.sort((a,b)=>a-b);
    return {seconds:shader.hanTime.value-start, pixels:width*height, changed, meanDifference:delta/(width*height*3),
      waterHits, materials:new Set(meshes.map(m=>m.material)).size, draws:r.info.render.calls,
      medianFrameMs:frames[Math.floor(frames.length/2)]};
  });
  assert.equal(result.materials,1,'one shared Han water material');
  assert.ok(result.waterHits.every(Boolean),'foreground sample covers only visible Han water');
  assert.ok(result.changed>result.pixels*.12 && result.meanDifference>1.0,'water changes while the camera stays still');
  await shot('bridge-day-a');
  await page.waitForTimeout(1250);
  await shot('bridge-day-b');
  for (const mode of ['day','sunset','night']) {
    const status = await page.evaluate(mode=>{
      const w=window.__world;w.setTimeMode(mode);
      return w.scene.children.find(m=>m.material?.name==='가로등 발광렌즈')?.material.emissiveIntensity;
    },mode);
    if (mode==='day') assert.equal(status,0,'street lamps off by day');
    if (mode==='night') assert.ok(status>0,'street lamps lit by night');
    await page.waitForTimeout(300);
    if (mode!=='day') await shot('bridge-'+mode);
  }

  await openView('#/jamwon_hangang/1F?p=203,0,-1447.8,77',-8);
  await page.waitForFunction(()=>window.__world.scene.userData.riverCloudiness>.80);
  const wet = await page.evaluate(async () => {
    const T=await import('three'), w=window.__world, ray=new T.Raycaster();
    ray.setFromCamera(new T.Vector2(0,0),w.camera);
    const first = ray.intersectObjects(w.scene.children,true).find(h=>{
      for(let o=h.object;o;o=o.parent) if (!o.visible) return false;
      return h.object.isMesh;
    });
    return {material:first?.object.material.name,errors:w.errors};
  });
  assert.equal(wet.material,'한강 수면','the joined inlet is visible beyond the leaf-bank viewpoint');
  assert.deepEqual(wet.errors,[]); assert.deepEqual(errors,[]);
  await shot('jamwon-overcast');
  console.log(JSON.stringify(result));
} finally {
  await browser.close();
  await new Promise(resolve=>server.close(resolve));
}
