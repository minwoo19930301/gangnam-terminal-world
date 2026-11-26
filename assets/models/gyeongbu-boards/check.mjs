// Verify the photographed portal from the ordinary game route, using the actual render and physics loops.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {chromium} from 'playwright';
import {serve} from '../../../tests/serve.mjs';

const output=process.argv[2];
if(output)await fs.mkdir(output,{recursive:true});
const server=await serve(0),browser=await chromium.launch({channel:'chromium',
  args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});
const page=await browser.newPage({viewport:{width:1000,height:670},deviceScaleFactor:1});
const errors=[];let fetches=0;
page.on('pageerror',e=>errors.push(e.message));
page.on('response',r=>{
  if(r.url().endsWith('/gyeongbu-boards/departure-portal.glb')){assert.equal(r.status(),200);fetches++;}
});
const base='http://127.0.0.1:'+server.address().port+'/index.html?fixedres=1#/gyeongbu/';
const board='승차홈 5~10 · 출발안내 화면',modes={};
const open=async address=>{
  await page.goto('about:blank');await page.goto(base+address);
  await page.waitForFunction(()=>window.__world?.ready,null,{timeout:150000});
};
const date='2026-05-18T05:08:00Z';
async function readMode(){
  return page.evaluate(name=>{
    const w=window.__world,screen=w.scene.getObjectByName(name),day=w.daylight.state;
    return {mode:day.mode,kst:day.clock,screen:screen.userData.clock,
      revision:screen.material.map.version,shape:screen.parent.children[1].visible};
  },board);
}
async function waitForClock(expected){
  await page.waitForFunction(([name,clock])=>window.__world.scene.getObjectByName(name)?.userData.clock===clock,
    [board,expected],{timeout:15000});
}
try{
  // Only Date advances by the supplied offsets. Animation, GPU painting and movement keep real-time timing.
  await page.clock.setFixedTime(new Date(date));
  await open('2F?p=103.805,6,6.739,-69.19');
  await page.waitForTimeout(350);assert.equal(fetches,0);
  await open('1F?p=105.768,0,5.993,110.81');
  await page.waitForTimeout(450);assert.equal(fetches,0);
  await page.evaluate(()=>{document.getElementById('start').click();const p=window.__world.player;p.yaw=-69.19*Math.PI/180;p.pitch=.02;});
  await waitForClock('14:08');
  await page.waitForFunction(name=>window.__world.scene.getObjectByName(name)?.parent.children[1].visible,board,{timeout:10000});
  assert.equal(fetches,1);
  modes.live=await readMode();assert.equal(modes.live.mode,'live');
  if(output)await page.screenshot({path:path.join(output,'live-board.png')});
  for(const [next,expected] of [['2026-05-18T05:08:44Z','14:08'],['2026-05-18T05:09:00Z','14:09']]){
    await page.clock.setFixedTime(new Date(next));await page.evaluate(()=>window.__world.daylight.sync(Date.now(),true));
    await waitForClock(expected);
    const sample=await readMode();
    assert.equal(sample.kst,expected);
    if(expected==='14:08')assert.equal(sample.revision,modes.live.revision);
    else assert.equal(sample.revision,modes.live.revision+1);
  }
  for(const mode of ['sunrise','day','sunset','night']){
    const expected=await page.evaluate(mode=>{const w=window.__world;w.setTimeMode(mode);return w.daylight.state.clock;},mode);
    await waitForClock(expected);modes[mode]=await readMode();
    assert.equal(modes[mode].mode,mode);assert.equal(modes[mode].kst,modes[mode].screen);
    if(output&&mode==='night')await page.screenshot({path:path.join(output,'night-board.png')});
    // Preview position is deliberately fixed. The real minute may change while the preview stays selected.
    await page.clock.setFixedTime(new Date('2026-05-18T05:10:00Z'));await page.evaluate(()=>window.__world.daylight.sync(Date.now(),true));
    assert.equal((await readMode()).kst,expected);
  }
  assert.equal(modes.day.screen,'12:30');assert.equal(modes.night.screen,'22:00');
  const dayClocks=new Set(Object.values(modes).map(o=>o.screen));assert.equal(dayClocks.size,5);
  await page.evaluate(()=>window.__world.setTimeMode('live'));await waitForClock('14:10');
  // A 32 cm passenger capsule should meet the central housing and pass both flanking door lanes.
  const checks=await page.evaluate(()=>{
    const w=window.__world,blocked=[],failed=[];
    const resolve=(u,v)=>{const x=2.3+u*.9348+v*.3552,z=-59.24-u*.3552+v*.9348,p={x,z};
      w.phys.resolve(p,.32,0,1.75,.50);return Math.hypot(p.x-x,p.z-z);};
    for(const off of [-1.65,-1.40,-1.15,1.15,1.40,1.65]){
      for(let u=74;u<77.4;u+=.08)if(resolve(u,97.73+off)>.04)failed.push([u,off]);
    }
    for(let u=75.23;u<=75.75;u+=.05)if(resolve(u,97.73)>.04)blocked.push(u);
    return {failed,blocked:blocked.length,errors:w.errors};
  });
  // The old decoration had no collider. Raycast explicitly for its grey vertices where the left doorway was hidden.
  const overlap=await page.evaluate(async()=>{
    const T=await import('three'),w=window.__world,v=97.73-1.62;
    const origin=new T.Vector3(2.3+72*.9348+v*.3552,1.65,-59.24-72*.3552+v*.9348);
    const ray=new T.Raycaster(origin,new T.Vector3(.9348,0,-.3552).normalize(),0,3.65);
    return ray.intersectObjects(w.scene.children,true).filter(({object:o,face})=>{
      const colors=o.geometry.attributes.color;
      return colors&&new T.Color().fromBufferAttribute(colors,face.a).getHexString()==='8e9191';
    }).length;
  });
  assert.equal(overlap,0);assert.deepEqual(checks.failed,[]);assert.ok(checks.blocked>0);assert.deepEqual(checks.errors,[]);
  // Travel through both real game doors with normal input from 2 m inside the hall.
  const walks=[];
  for(const off of [-1.40,1.40]){
    const v=97.73+off,u=73.5,x=2.3+u*.9348+v*.3552,z=-59.24-u*.3552+v*.9348;
    await open('1F?p='+[x,0,z,-69.19].join(','));
    await page.evaluate(()=>document.getElementById('start').click());
    const start=await page.evaluate(()=>({x:window.__world.player.x,z:window.__world.player.z}));
    await page.keyboard.down('w');await page.waitForFunction(({x,z})=>Math.hypot(window.__world.player.x-x,window.__world.player.z-z)>4.37,start,{timeout:10000});
    await page.keyboard.up('w');
    const end=await page.evaluate(()=>({x:window.__world.player.x,y:window.__world.player.y,z:window.__world.player.z}));
    assert.ok(Math.abs(end.y)<.25);walks.push(Math.hypot(end.x-start.x,end.z-start.z));
  }
  // The original lightbox samples are visible before transfer and beyond the
  // close range. Sample the actual framebuffer at the two unobstructed prints.
  const samplePrints=async()=>page.evaluate(async name=>{
    const T=await import('three'),w=window.__world,r=w.renderer,gl=r.getContext();
    const group=w.scene.getObjectByName(name).parent;
    r.render(w.scene,w.camera);
    return {full:group.children[1].visible,colors:[-3.5,3.52].map(x=>{
      const p=group.localToWorld(new T.Vector3(x,2.18,.85)).project(w.camera);
      const rgb=new Uint8Array(4);
      gl.readPixels(Math.round((p.x+1)*.5*gl.drawingBufferWidth),Math.round((p.y+1)*.5*gl.drawingBufferHeight),
        1,1,gl.RGBA,gl.UNSIGNED_BYTE,rgb);
      return Array.from(rgb).slice(0,3);
    })};
  },board);
  const expectedColors=[[238,231,216],[201,203,232]];
  async function checkPrints(full){
    const sample=await samplePrints();
    assert.equal(sample.full,full);
    sample.colors.forEach((rgb,i)=>rgb.forEach((v,k)=>assert.ok(Math.abs(v-expectedColors[i][k])<=2)));
  }
  const beforeFar=fetches;
  await open('1F?p=100,0,20,-29');await page.waitForTimeout(400);
  await checkPrints(false);
  assert.equal(fetches,beforeFar);
  let release,notify;
  const requested=new Promise(resolve=>{notify=resolve;});
  await page.route('**/gyeongbu-boards/departure-portal.glb',async route=>{
    await new Promise(done=>{release=done;notify();});await route.continue();
  });
  await open('1F?p=103.805,0,6.739,-69.19');await requested;
  try{
    await checkPrints(false);
  }finally{release();}
  await page.waitForFunction(name=>window.__world.scene.getObjectByName(name)?.parent.children[1].visible,board);
  await checkPrints(true);
  assert.deepEqual(errors,[]);
  console.log(JSON.stringify({modes,checks,walks,errors},null,2));
}finally{await browser.close();await new Promise(r=>server.close(r));}
