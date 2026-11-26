// Public street view, actual 1F access and independently streamed geometry.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {chromium} from 'playwright';
import {serve} from '../../../tests/serve.mjs';

const out=process.argv[2],key='경부선 부속상가 · 이디야와 달리나인 거리 정면';
if(out)await fs.mkdir(out,{recursive:true});
const srv=await serve(0),base='http://127.0.0.1:'+srv.address().port+'/index.html?fixedres=1#/';
const browser=await chromium.launch({channel:'chromium',args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});
const page=await browser.newPage({viewport:{width:1110,height:735},deviceScaleFactor:1});
const incoming=-159.194,requests=[],errors=[];
const xy=(u,v)=>[2.3+u*.9348+v*.3552,-59.24-u*.3552+v*.9348];
page.on('response',r=>{if(r.url().endsWith('/gyeongbu-front-cafes/cafes.glb'))requests.push(r.status());});
page.on('pageerror',e=>errors.push(e.message));
async function visit(name,u,v,h,yaw){
  const [x,z]=xy(u,v);
  await page.goto('about:blank');await page.goto(base+name+'?p='+[x,h,z,yaw].join(','));
  await page.waitForFunction(()=>window.__world?.ready,null,{timeout:160000});
  await page.evaluate(()=>{document.getElementById('start').click();window.__world.setTimeMode('day');});
  await page.waitForTimeout(350);
}
async function aim(u,v,yaw,pitch=0){
  const [x,z]=xy(u,v);
  await page.evaluate(o=>Object.assign(window.__world.player,o),{x,z,y:0,vy:0,yaw:yaw*Math.PI/180,pitch:pitch*Math.PI/180});await page.waitForTimeout(300);
}
async function material(state){
  await page.waitForFunction(([k,state])=>{const o=window.__world.scene.getObjectByName(k);return o&&!!o.children[0].material.map===state;},[key,state],{timeout:12000});
}
async function stats(){
  return page.evaluate(k=>{const n=window.__world.scene.getObjectByName(k),m=n.children.filter(o=>o.visible);
    return {draws:m.length,triangles:m.reduce((a,o)=>a+o.geometry.index.count/3,0),texture:m[0].material.map?.image.width||0};},key);
}
async function across(area){
  await page.keyboard.down('w');
  try{await page.waitForFunction(a=>window.__world?.ready&&window.__world.area===a,area,{timeout:19000});}
  finally{await page.keyboard.up('w');}
}
async function walkTo(v,dir){
  await page.keyboard.down('w');
  try{await page.waitForFunction(([v,d])=>{const p=window.__world.player;return d*((p.x-2.3)*.3552+(p.z+59.24)*.9348-v)>0;},[v,dir],{timeout:11000});}
  finally{await page.keyboard.up('w');}
}
try{
  await visit('gyeongbu/B1',87.5,3,-5,incoming);assert.deepEqual(requests,[],'B1 requested the upper windows');
  await visit('street',87.5,-14,0,incoming+180);assert.deepEqual(requests,[],'behind the camera');
  const distant=await stats();assert.equal(distant.draws,1);assert.equal(distant.texture,0);
  await aim(88,-18,-160.79,10);await material(true);
  const close=await stats();assert.equal(close.draws,4);assert.ok(close.triangles<19000&&close.triangles>3500);assert.equal(close.texture,1024);
  const modes=[];
  for(const mode of ['sunrise','day','sunset','night','live']){
    modes.push(await page.evaluate(mode=>{window.__world.setTimeMode(mode);return window.__world.daylight.state.mode;},mode));
    await page.waitForTimeout(120);
    if(out&&['day','night'].includes(mode))await page.screenshot({path:path.join(out,mode+'.png')});
  }
  assert.deepEqual(modes,['sunrise','day','sunset','night','live']);
  await page.evaluate(()=>window.__world.setTimeMode('day'));
  await aim(87.5,-67,incoming,10);await material(false);await aim(88,-18,-160.79,10);await material(true);
  assert.deepEqual(requests,[200],'returning outside downloaded the same asset twice');
  const routes=await page.evaluate(()=>{
    const ph=window.__world.phys;const xy=(u,v)=>[2.3+u*.9348+v*.3552,-59.24-u*.3552+v*.9348];
    const push=(u,v,h=0)=>{const[x,z]=xy(u,v),p={x,z};ph.resolve(p,.32,h,h+1.75,.50);return Math.hypot(p.x-x,p.z-z);};
    const support=(u,v,max)=>ph.support(...xy(u,v),max).y;
    const blocks=[];
    for(const u of [79.25,79.72,80.28,80.75])for(let v=-3;v<=3.8;v+=.20)if(push(u,v)>.032)blocks.push([u,v]);
    return {blocks,beside:[push(77.88,.29),push(82.0,.29)],canopy:support(87.5,.90,8.1),
      deck:support(87.5,5.0,9.0),otherDeck:support(102,.90,9.0),guard:push(87.5,3.47,8.4)};
  });
  assert.deepEqual(routes.blocks,[]);assert.ok(routes.beside.every(x=>x>.05));
  assert.ok(Math.abs(routes.canopy-7.67)<.1&&Math.abs(routes.deck-8.4)<.1&&Math.abs(routes.otherDeck-8.4)<.1&&routes.guard>.06);
  await aim(80,-5.5,incoming);
  await across('in:gyeongbu');await walkTo(3.75,1);
  const inside=await page.evaluate(()=>({area:window.__world.area,y:window.__world.player.y}));
  await page.evaluate(()=>{window.__world.player.yaw+=Math.PI;});
  await across('out:core');await walkTo(-4,-1);
  assert.equal(inside.area,'in:gyeongbu');assert.ok(Math.abs(inside.y)<.1);assert.deepEqual(errors,[]);
  console.log(JSON.stringify({distant,close,modes,routes,inside,requests,errors},null,2));
}finally{await browser.close();await new Promise(r=>srv.close(r));}
