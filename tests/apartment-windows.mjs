// Run: node tests/apartment-windows.mjs
// Compare the normal street framebuffer with just apartment emission switched off.
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {serve} from './serve.mjs';
const server=await serve(0);
const browser=await chromium.launch({channel:'chromium',headless:true,
  args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});
try {
  const page=await browser.newPage({viewport:{width:700,height:440}});
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('console',m=>{if(/Shader Error|VALIDATE_STATUS/.test(m.text()))errors.push(m.text());});
  let release;
  const held=new Promise(resolve=>{release=resolve;});
  await page.route('**/assets/re/*.glb',async route=>{await held;await route.continue();});
  const url='http://127.0.0.1:'+server.address().port+'/?fixedres=1&night=1&pos=-178,0,-112&yaw=-3&pitch=18';
  await page.goto(url);
  await page.waitForFunction(()=>window.__world?.ready,null,{timeout:120000});

  async function difference(mode,select='') {
    return page.evaluate(async ([mode,select])=>{
      const w=window.__world;
      w.setTimeMode(mode);
      const {apartmentNight}=await import('/js/apartment-windows.js');
      const uniform=apartmentNight(w.K), saved=uniform.value, gl=w.renderer.getContext();
      const overrides=[];
      if(select)w.scene.traverse(o=>{
        if(!o.isMesh)return;
        const previous=o.onBeforeRender;
        overrides.push([o,previous]);
        o.onBeforeRender=function(renderer,scene,camera,geometry,material,...rest){
          previous.call(this,renderer,scene,camera,geometry,material,...rest);
          uniform.value=material.customProgramCacheKey().includes('|apartment:'+select+':')?level:0;
        };
      });
      let level=saved;
      function snapshot(amount){
        level=amount;
        uniform.value=level;
        w.renderer.render(w.scene,w.camera);
        const bytes=new Uint8Array(gl.drawingBufferWidth*gl.drawingBufferHeight*4);
        gl.readPixels(0,0,gl.drawingBufferWidth,gl.drawingBufferHeight,gl.RGBA,gl.UNSIGNED_BYTE,bytes);
        return bytes;
      }
      try{
        const normal=snapshot(saved), baseline=snapshot(0), repeated=snapshot(saved);
        let lit=0, unstable=0;
        for(let i=0;i<normal.length;i+=4){
          if(normal[i]-baseline[i]>12)lit++;
          if(Math.abs(repeated[i]-normal[i])>2)unstable++;
        }
        return {intensity:saved,lit,unstable};
      }finally{for(const [o,previous] of overrides)o.onBeforeRender=previous;uniform.value=saved;}
    },[mode,select]);
  }
  const distant=await difference('night','silhouette');
  release();
  await page.waitForFunction(()=>__world.scene.children.some(o=>o.visible&&o.userData.re?.id==='apt-a10023673'),
    null,{timeout:60000});
  const near=await difference('night','glass');
  await page.waitForFunction(()=>__world.scene.children.some(o=>o.visible&&o.userData.re?.id==='apt-a10024913'),
    null,{timeout:60000});
  const originalMaterials = await page.evaluate(() => {
    const estate = __world.scene.children.find(o => o.visible && o.userData.re?.id === 'apt-a10024913');
    const finishes = [];
    estate.traverse(o => { if (o.isMesh) finishes.push([o.material.name, o.material.roughness, o.material.metalness]); });
    return finishes;
  });
  assert.ok(originalMaterials.some(([name, roughness, metalness]) => name === 'Window glazing' &&
    Math.abs(roughness - .32) < .001 && Math.abs(metalness - .18) < .001));
  const day=await difference('day');
  // Centre Xi now retains its original PBR glazing; use a nearby streamed Lambert
  // estate on the same public street to exercise the batched window shader.
  await page.goto(url.replace('-178,0,-112&yaw=-3&pitch=18','-154,0,-383&yaw=56&pitch=17'));
  await page.waitForFunction(()=>window.__world?.ready && __world.scene.children.some(o =>
    o.visible && o.userData.re?.id === 'apt-a10023462'), null, {timeout:120000});
  const batched=await difference('night','batch');
  for(const result of [near,distant,batched]){
    assert.ok(result.lit>250,JSON.stringify(result));
    assert.equal(result.unstable,0);
  }
  assert.deepEqual(day,{intensity:0,lit:0,unstable:0});
  assert.deepEqual(await page.evaluate(()=>__world.errors),[]);
  await page.goto(url.replace('-178,0,-112&yaw=-3&pitch=18','348,0,-381&yaw=77&pitch=34'));
  await page.waitForFunction(()=>window.__world?.ready,null,{timeout:120000});
  const painted=await difference('night','paint');
  assert.ok(painted.lit>250,JSON.stringify(painted));
  assert.equal(painted.unstable,0);
  assert.deepEqual([...errors,...await page.evaluate(()=>__world.errors)],[]);
  console.log(JSON.stringify({standIns:distant,streamed:near,batched,painted,day}));
}finally{
  await browser.close();await new Promise(resolve=>server.close(resolve));
}
