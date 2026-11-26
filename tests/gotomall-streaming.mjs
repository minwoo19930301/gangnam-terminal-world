// Exercise the live game with normal camera updates and actual GLB requests.
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { serve } from './serve.mjs';

const server = await serve(0);
const browser = await chromium.launch({channel:'chromium',
  args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});
const c = 1/Math.hypot(1,.3745), s = .3745*c;
function pose(u,v,dv) {
  return {x:c*u+s*v,z:-126.3-s*u+c*v,yaw:Math.atan2(-s*dv,-c*dv)};
}
try {
  const page = await browser.newPage({viewport:{width:960,height:600}});
  const problems = [], requests = [];
  page.on('pageerror',e=>problems.push(e.message));
  page.on('request',r=>requests.push(new URL(r.url()).pathname));
  const start = pose(95,6.25,-1);
  await page.goto('http://127.0.0.1:'+server.address().port+'/index.html#/gotomall/B1?p='+
    [start.x,-6,start.z,start.yaw*180/Math.PI].join(','));
  await page.waitForFunction(()=>window.__world?.ready,null,{timeout:90000});
  await page.locator('#start').click();
  async function move(u,v,dv) {
    await page.evaluate(({x,z,yaw})=>{
      __world.player.teleport(x,-6,z,yaw);
      __world.player.pitch = -.06;
    },pose(u,v,dv));
  }
  async function waitAisle(name,visible) {
    await page.waitForFunction(([name,visible])=>{
      const d = __world.K._.details.find(g=>g.name==='고투몰 진열 구간 '+name);
      return d?.built && d.renderables.length && d.renderables.every(o=>o.layers.isEnabled(0)===visible);
    },[name,visible],{timeout:5000});
  }
  const requested = file => requests.filter(path=>path.endsWith('/'+file));
  const sector = name => '고투몰 진열 구간 '+name;
  await waitAisle('남 24',true);
  assert.equal(await page.evaluate(name=>__world.K._.details.find(d=>d.name===name).built,sector('북 24')),false);
  for (const file of ['shop-interiors.js','mall-ceiling.glb','millinery-hat.glb','west.glb','flowers.glb','kitchen.glb','junior.glb','tarot.glb']) {
    assert.equal(requested(file).length,0,'unseen stock requested on entry: '+file);
  }

  // Walk through a real gap in the middle island and return to the opposite bank.
  await move(75.6,2.7,-1);
  await waitAisle('북 23',true);
  await page.evaluate(()=>document.dispatchEvent(new KeyboardEvent('keydown',{code:'KeyW',bubbles:true})));
  const crossingEnd = pose(75.6,-3.7,-1);
  try {
    await page.waitForFunction(({x,z})=>Math.hypot(__world.player.x-x,__world.player.z-z)<.65,
      crossingEnd,{timeout:5000});
  } finally {
    await page.evaluate(()=>document.dispatchEvent(new KeyboardEvent('keyup',{code:'KeyW',bubbles:true})));
  }
  await move(95,-5.55,1);
  await waitAisle('북 24',true);
  await waitAisle('남 24',false);
  await move(95,6.25,-1);
  await waitAisle('남 24',true);
  await waitAisle('북 24',false);

  // Each labelled address enters its real camera frustum; distant rooms keep their silhouettes.
  for (const [key,u,v,dv] of [
    ['kitchen',239.77,-5.3,-1],['flowers',290.85,-5.5,1],['linen',285.96,-5.5,-1],
    ['apparel',59.21,-5.5,-1],['junior',-213.89,-5.2,-1],['tarot',-264.11,-4.9,-1],
    ['Emet',-285.8,-5.4,1],['AnHouse',-274.6,6.8,-1],
  ]) {
    await move(u,v,dv);
    await page.waitForFunction(key=>__world.K.scene.children.some(o=>
      o.name==='고투몰 진열 · '+key && o.levels[0].object.userData.loaded),key,{timeout:6000});
    const path = key==='Emet'||key==='AnHouse' ? 'west.glb' : 'gotomall/'+key+'.glb';
    assert.equal(requested(path).length,1,'one shared geometry request for '+key);
  }
  await move(-224,-5.25,-1);
  await page.waitForFunction(()=>__world.K.scene.children.some(o=>o.name==='고투몰 리본 모자' && o.userData.loaded),null,{timeout:6000});
  assert.equal(requested('millinery-hat.glb').length,1);
  await move(-244,-5.1,1);
  await page.evaluate(()=>{__world.player.pitch=.86;});
  await page.waitForFunction(()=>__world.K.scene.children.some(o=>o.name==='고투몰 서편 핑크라인 천장' && o.userData.loaded),null,{timeout:6000});
  assert.equal(requested('mall-ceiling.glb').length,1);
  assert.deepEqual(await page.evaluate(()=>[...__world.errors,...__world.K._.detailErrors]),[]);
  assert.deepEqual(problems,[]);
  console.log('OK — cold bank, walk across passage, return layers, six Blender shelf departments, shared west textiles, hats and west ceiling');
} finally {
  await browser.close();
  await new Promise(resolve=>server.close(resolve));
}
