// Exercise the 7F shop through the game's own route, keyboard, camera, lighting, renderer and physics.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {chromium} from 'playwright';
import {serve} from '../../../tests/serve.mjs';

const output=process.argv[2];
if(output)await fs.mkdir(output,{recursive:true});
const server=await serve(0);
const browser=await chromium.launch({channel:'chromium',args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});
const page=await browser.newPage({viewport:{width:1110,height:735},deviceScaleFactor:1});
const root='경부선 7층 · 이단 신사복 행거와 소매 상품표', requests=[],errors=[];
const base='http://127.0.0.1:'+server.address().port+'/index.html?fixedres=1#/gyeongbu/';
const coords=(u,v)=>[2.3+u*.9348+v*.3552,-59.24-u*.3552+v*.9348];
const forward=-159.194;
page.on('pageerror',e=>errors.push(e.message));
page.on('response',r=>{if(r.url().endsWith('/gyeongbu-suiting-aisle/suiting-aisle.glb'))requests.push(r.status());});
async function route(floor,h,u,v,angle){
  const [x,z]=coords(u,v);
  await page.goto('about:blank');await page.goto(base+floor+'?p='+[x,h,z,angle].join(','));
  await page.waitForFunction(()=>window.__world?.ready,null,{timeout:145000});
  await page.evaluate(()=>{document.getElementById('start').click();window.__world.setTimeMode('day');});
  await page.waitForTimeout(400);
}
async function pose(u,v,angle=forward,pitch=0){
  const [x,z]=coords(u,v);
  await page.evaluate(p=>Object.assign(window.__world.player,p),{x,z,y:29.5,vy:0,yaw:angle*Math.PI/180,pitch:pitch*Math.PI/180});
  await page.waitForTimeout(300);
}
async function surface(wanted){
  await page.waitForFunction(([name,wanted])=>{
    const item=window.__world.scene.getObjectByName(name)?.children[0];return item&&!!item.material.normalMap===wanted;
  },[root,wanted],{timeout:15000});
  return page.evaluate(name=>{
    const r=window.__world.scene.getObjectByName(name),body=r.children[0],m=body.material;
    return {draws:r.children.length,triangles:body.geometry.index.count/3,color:m.map?.image.width??0,
      relief:m.normalMap?.image.width??0,roughness:m.roughnessMap?.image.width??0,lenses:m.emissiveMap?.image.width??0};
  },root);
}
try {
  await route('8F',34,38,109.55,forward);assert.deepEqual(requests,[]);
  await route('7F',29.5,38,101.23,forward+180);assert.deepEqual(requests,[]);
  await pose(38,83.5);const distant=await surface(false);
  assert.equal(distant.draws,1);assert.ok(distant.triangles>500&&distant.triangles<4500);assert.deepEqual(requests,[]);
  await pose(38,104.70);const close=await surface(true);
  assert.equal(close.draws,1);assert.ok(close.triangles>9000&&close.triangles<27000);
  assert.deepEqual([close.color,close.relief,close.roughness,close.lenses],[1024,512,256,256]);
  const start=coords(38,104.70);
  await page.keyboard.down('w');
  try {
    await page.waitForFunction(([x,z])=>Math.hypot(window.__world.player.x-x,window.__world.player.z-z)>11.5,start,{timeout:14000});
  }finally{await page.keyboard.up('w');}
  const walk=await page.evaluate(start=>{
    const w=window.__world,p=w.player;
    const xy=(u,v)=>[2.3+u*.9348+v*.3552,-59.24-u*.3552+v*.9348];
    const failures=[];
    function push(u,v){
      const [x,z]=xy(u,v),t={x,z};w.phys.resolve(t,.32,29.5,31.25,.50);
      return Math.hypot(x-t.x,z-t.z);
    }
    for(const u of [37.20,37.65,38.20,38.70])for(let v=104.70;v<116.3;v+=.22){
      const [x,z]=xy(u,v);
      if(push(u,v)>.035||Math.abs(w.phys.support(x,z,29.95).y-29.5)>.05)failures.push([u,+v.toFixed(2)]);
    }
    return {area:w.area,y:p.y,distance:Math.hypot(p.x-start[0],p.z-start[1]),failures,
      racks:[push(36.85,109.5),push(39.15,109.5)],endStands:[push(36.98,106.68),push(39.05,106.78)],
      cap:w.phys.ceilingAbove(...xy(38,109.5),31.10,33.6)};
  },start);
  assert.deepEqual(walk.failures,[]);assert.equal(walk.area,'in:gyeongbu');assert.ok(Math.abs(walk.y-29.5)<.05);
  assert.ok(walk.racks.concat(walk.endStands).every(v=>v>.05));assert.ok(Math.abs(walk.cap-32.423)<.025);
  await pose(38.05,104.76,forward,-2);
  const modes=[];
  for(const m of ['day','sunset','night','sunrise','live']){
    modes.push(await page.evaluate(async mode=>{
      window.__world.setTimeMode(mode);
      await new Promise(done=>requestAnimationFrame(()=>requestAnimationFrame(done)));
      return window.__world.daylight.state.mode;
    },m));
    if(output&&['night','day'].includes(m))await page.screenshot({path:path.join(output,m+'.png')});
  }
  assert.deepEqual(modes,['day','sunset','night','sunrise','live']);
  await pose(38,84);await surface(false);await pose(38.06,111.4,forward+180);await surface(true);
  assert.deepEqual(requests,[200]);assert.deepEqual(errors,[]);
  console.log(JSON.stringify({distant,close,walk,modes,requests,errors},null,2));
}finally{await browser.close();await new Promise(done=>server.close(done));}
