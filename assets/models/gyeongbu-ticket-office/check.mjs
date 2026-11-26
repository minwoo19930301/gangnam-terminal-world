// Check the map destination, customer approach, visibility and Seoul clocks in a normal game.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {chromium} from 'playwright';
import {serve} from '../../../tests/serve.mjs';

const out=process.argv[2];if(out)await fs.mkdir(out,{recursive:true});
const server=await serve(0),browser=await chromium.launch({channel:'chromium',
  args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});
const page=await browser.newPage({viewport:{width:1000,height:670},deviceScaleFactor:1});
const clock='통합매표소 · 서울 시각',name='경부선 · 통합매표소',modeReads={},errors=[];
let fetches=0;
page.on('pageerror',e=>errors.push(e.message));
page.on('response',r=>{if(r.url().endsWith('/gyeongbu-ticket-office/ticket-counter.glb')){assert.equal(r.status(),200);fetches++;}});
const base='http://127.0.0.1:'+server.address().port+'/index.html?fixedres=1#/gyeongbu/';
async function open(addr){
  await page.goto('about:blank');await page.goto(base+addr);
  await page.waitForFunction(()=>window.__world?.ready,null,{timeout:150000});
}
async function read(expected){
  await page.waitForFunction(([n,expect])=>window.__world.scene.getObjectByName(n)?.userData.clock===expect,[clock,expected],{timeout:15000});
  return page.evaluate(n=>{
    const w=window.__world,o=w.scene.getObjectByName(n);
    return {clock:o.userData.clock,version:o.material.map.version,mode:w.daylight.state.mode,sky:w.daylight.state.clock};
  },clock);
}
try{
  await page.clock.setFixedTime(new Date('2026-05-18T05:08:00Z'));
  // The upper floor over the ticket aisle itself is an atrium. Stand on its west gallery slab.
  await open('2F?p=62.295,6,-43.525,-69.19');await page.waitForTimeout(350);
  assert.ok(await page.evaluate(()=>window.__world.player.y>5.8));assert.equal(fetches,0);
  await open('1F?p=70.016,0,-44.319,-69.19');await page.waitForTimeout(450);assert.equal(fetches,0);
  await page.evaluate(()=>document.getElementById('start').click());
  await page.keyboard.press('m');await page.locator('#map-search').fill('1층 매표·환불');
  await page.locator('.gt-result').filter({hasText:'1층 매표·환불'}).first().click();
  await page.locator('.gt-teleport').click();
  modeReads.live=await read('14:08');
  const pose=await page.evaluate(()=>{const p=window.__world.player;return {x:p.x,y:p.y,z:p.z,yaw:p.yaw*180/Math.PI};});
  assert.ok(Math.abs(pose.yaw-110.81)<.15);assert.equal(fetches,1);
  if(out)await page.screenshot({path:path.join(out,'map-arrival.png')});
  for(const [time,expected] of [['2026-05-18T05:08:45Z','14:08'],['2026-05-18T05:09:00Z','14:09']]){
    await page.clock.setFixedTime(new Date(time));await page.evaluate(()=>window.__world.daylight.sync(Date.now(),true));
    const state=await read(expected);
    assert.equal(state.version,modeReads.live.version+(expected==='14:09'?1:0));
  }
  for(const m of ['sunrise','day','sunset','night']){
    const expected=await page.evaluate(mode=>{const w=window.__world;w.daylight.setMode(mode);return w.daylight.state.clock;},m);
    modeReads[m]=await read(expected);assert.equal(modeReads[m].sky,expected);
  }
  if(out)await page.screenshot({path:path.join(out,'night-arrival.png')});
  await page.evaluate(()=>window.__world.daylight.setMode('day'));
  await page.keyboard.down('w');
  await page.waitForFunction(({x,z})=>Math.hypot(window.__world.player.x-x,window.__world.player.z-z)>2.37,pose,{timeout:10000});
  await page.waitForTimeout(220);await page.keyboard.up('w');await page.waitForTimeout(100);
  const stats=await page.evaluate(async({name,pose})=>{
    const w=window.__world,o=w.scene.getObjectByName(name);
    const world=(u,v)=>[2.3+u*.9348+v*.3552,-59.24-u*.3552+v*.9348],failed=[];
    // Check the public cross-aisle past all five windows and each approach from the aisle.
    const holds=(u,v)=>{
      const [x,z]=world(u,v),p={x,z};w.phys.resolve(p,.32,0,1.75,.5);
      if(Math.hypot(p.x-x,p.z-z)>.03 || Math.abs(w.phys.support(x,z,.5).y)>.1)failed.push([u,v]);
    };
    for(let v=34.7;v<=44.49;v+=.1)holds(56.20,v);
    for(const center of [-3.76,-1.88,0,1.88,3.76])for(let u=55.33;u<=58;u+=.17)holds(u,39.60-center);
    const t=[];let prev; await new Promise(done=>requestAnimationFrame(function next(now){
      if(prev!=null)t.push(now-prev);prev=now;
      if(t.length===80)done();else requestAnimationFrame(next);
    })); t.sort((a,b)=>a-b);
    return {failed,walk:Math.hypot(w.player.x-pose.x,w.player.z-pose.z),y:w.player.y,
      triangles:o.children.slice(0,3).map(m=>m.geometry.index.count/3),p95:t[75],max:t.at(-1),errors:w.errors};
  },{name,pose});
  assert.deepEqual(stats.failed,[]);assert.deepEqual(stats.errors,[]);assert.deepEqual(errors,[]);
  assert.ok(stats.walk>2.37&&stats.walk<3.0);assert.ok(Math.abs(stats.y)<.15);
  if(out)await page.screenshot({path:path.join(out,'at-window.png')});
  console.log(JSON.stringify({fetches,pose,modeReads,stats},null,2));
}finally{await browser.close();await new Promise(r=>server.close(r));}
