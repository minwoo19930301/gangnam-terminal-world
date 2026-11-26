// Normal game routes, real key movement, production lighting and cold/re-entry LOD.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {chromium} from 'playwright';
import {serve} from '../../../tests/serve.mjs';

const out=process.argv[2];
if(out)await fs.mkdir(out,{recursive:true});
const server=await serve(0);
const browser=await chromium.launch({channel:'chromium',args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});
const page=await browser.newPage({viewport:{width:1050,height:700},deviceScaleFactor:1});
const key='경부선 대합실 · 석재 바닥과 곡면 간접 천장',requests=[],errors=[];
page.on('pageerror',e=>errors.push(e.message));
page.on('response',r=>{if(r.url().endsWith('/gyeongbu-concourse-finish/concourse-finish.glb'))requests.push(r.status());});
const base='http://127.0.0.1:'+server.address().port+'/index.html?fixedres=1#/gyeongbu/';
const xy=(u,v)=>[2.3+u*.9348+v*.3552,-59.24-u*.3552+v*.9348];
const yaw=(du,dv)=>Math.atan2(-(du*.9348+dv*.3552),-(-du*.3552+dv*.9348))*180/Math.PI;
const actor=(u,v,h,du,dv)=>{const [x,z]=xy(u,v);return {x,z,y:h,yaw:yaw(du,dv)};};
async function visit(floor,a) {
  await page.goto('about:blank');
  await page.goto(base+floor+'?p='+[a.x,a.y,a.z,a.yaw].join(','));
  await page.waitForFunction(()=>window.__world?.ready,null,{timeout:150000});
  await page.waitForTimeout(500);
}
async function pose(a){
  await page.evaluate(a=>{const p=window.__world.player;Object.assign(p,{x:a.x,z:a.z,y:a.y,pitch:0,yaw:a.yaw*Math.PI/180,vy:0});},a);
  await page.waitForTimeout(300);
}
const first=actor(60.22,25.48,0,0,1),look=actor(60.20,25.80,0,-4.55,8.80);
try {
  await visit('2F',actor(60.2,25.8,6,-4.55,8.8));
  assert.deepEqual(requests,[],'another floor requested the surface atlas');
  await visit('1F',actor(60,13,0,0,-1));
  assert.deepEqual(requests,[],'the hall entirely behind the camera requested its atlas');
  await visit('1F',actor(60.25,53.8,0,-4,-27));
  const coarse=await page.evaluate(key=>{
    const o=window.__world.scene.getObjectByName(key).children[0];
    return {triangles:o.geometry.index.count/3,map:!!o.material.map};
  },key);
  assert.deepEqual(requests,[]);assert.ok(!coarse.map&&coarse.triangles>30&&coarse.triangles<350);
  await page.evaluate(()=>document.getElementById('start').click());
  await pose(first);
  await page.waitForFunction(key=>!!window.__world.scene.getObjectByName(key)?.children[0].material.map,key,{timeout:15000});
  await page.keyboard.down('w');
  await page.waitForFunction(a=>Math.hypot(window.__world.player.x-a.x,window.__world.player.z-a.z)>3.25,first,{timeout:12000});
  await page.keyboard.up('w');
  const walk=await page.evaluate(({key,first})=>{
    const w=window.__world,p=w.player,o=w.scene.getObjectByName(key).children[0],failed=[];
    const xy=(u,v)=>[2.3+u*.9348+v*.3552,-59.24-u*.3552+v*.9348];
    for(let v=25.6;v<33.0;v+=.20)for(const u of [60.05,60.35]){
      const [x,z]=xy(u,v),test={x,z};w.phys.resolve(test,.32,0,1.75,.50);
      if(Math.hypot(test.x-x,test.z-z)>.03||Math.abs(w.phys.support(x,z,.42).y)>.10)failed.push([u,+v.toFixed(2)]);
    }
    return {distance:Math.hypot(p.x-first.x,p.z-first.z),height:p.y,failed,draws:w.scene.getObjectByName(key).children.length,
      triangles:o.geometry.index.count/3,texture:[o.material.map.image.width,o.material.map.image.height],hasUV:!!o.geometry.attributes.uv,
      bakedColours:!!o.geometry.attributes.color};
  },{key,first});
  assert.deepEqual(walk.failed,[]);assert.ok(walk.distance>=3.25&&walk.distance<4.5);assert.ok(Math.abs(walk.height)<.1);
  assert.ok(walk.triangles>3000&&walk.draws===1&&walk.hasUV&&walk.bakedColours);assert.deepEqual(walk.texture,[1024,512]);
  await pose(look);
  const modes={};
  for(const mode of ['day','sunset','night','sunrise','live']){
    modes[mode]=await page.evaluate(async(mode)=>{
      const w=window.__world;w.daylight.setMode(mode);
      await new Promise(done=>requestAnimationFrame(()=>requestAnimationFrame(done)));
      return w.daylight.state.mode;
    },mode);
    if(out&&['day','night'].includes(mode))await page.screenshot({path:path.join(out,mode+'.png')});
  }
  assert.deepEqual(Object.values(modes),Object.keys(modes));
  const frames=await page.evaluate(()=>new Promise(resolve=>{
    const times=[];let prior;
    requestAnimationFrame(function sample(now){
      if(prior!==undefined)times.push(now-prior);
      prior=now;
      if(times.length<80){requestAnimationFrame(sample);return;}
      times.sort((a,b)=>a-b);resolve({p50:times[39],p95:times[75],max:times.at(-1)});
    });
  }));
  // Face the hall at >30 m so the proxy is really submitted to the renderer.
  await pose(actor(60,61.55,0,-1,-1));
  await page.waitForFunction(key=>!window.__world.scene.getObjectByName(key).children[0].material.map,key,{timeout:8000});
  await pose(look);
  await page.waitForFunction(key=>!!window.__world.scene.getObjectByName(key).children[0].material.map,key,{timeout:8000});
  assert.deepEqual(requests,[200]);assert.deepEqual(errors,[]);
  console.log(JSON.stringify({coarse,walk,modes,requests,frames},null,2));
}finally{await browser.close();await new Promise(r=>server.close(r));}
