// Exercise the actual street and 1F documents, independent close models and public doorway.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {chromium} from 'playwright';
import {serve} from '../../../tests/serve.mjs';

const out=process.argv[2];
if(out)await fs.mkdir(out,{recursive:true});
const srv=await serve(0),base='http://127.0.0.1:'+srv.address().port+'/index.html?fixedres=1#/';
const browser=await chromium.launch({channel:'chromium',args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});
const page=await browser.newPage({viewport:{width:1110,height:735},deviceScaleFactor:1});
const names={portal:'경부선 정문 · 석재 차양과 영문 명판',tower:'경부선 명판탑 · 한글 채널 문자와 적갈색 외벽'};
const xy=(u,v)=>[2.3+u*.9348+v*.3552,-59.24-u*.3552+v*.9348];
const incoming=-159.194, requests=[],errors=[];
page.on('pageerror',e=>errors.push(e.message));
page.on('response',r=>{const m=r.url().match(/gyeongbu-front-entrance\/(portal|tower)\.glb$/);if(m)requests.push(m[1]+' '+r.status());});
async function visit(route,coords){
  await page.goto('about:blank');
  await page.goto(base+route+'?p='+coords.join(','));
  await page.waitForFunction(()=>window.__world?.ready,null,{timeout:180000});
  await page.evaluate(()=>{document.getElementById('start').click();window.__world.setTimeMode('day');});
  await page.waitForTimeout(400);
}
function at(u,v,yaw=incoming,h=0){const [x,z]=xy(u,v);return [x,h,z,yaw];}
async function aim(u,v,yaw,pitch=0){
  const [x,z]=xy(u,v);
  await page.evaluate(({x,z,yaw,pitch})=>{
    const p=window.__world.player;
    Object.assign(p,{x,z,y:0,vy:0,yaw:yaw*Math.PI/180,pitch:pitch*Math.PI/180});
  },{x,z,yaw,pitch});
  await page.waitForTimeout(400);
}
async function waitMaterial(key,detailed){
  await page.waitForFunction(([name,detail])=>{
    const g=window.__world?.scene.getObjectByName(name);
    return g&&!!g.children[0].material.map===detail;
  },[names[key],detailed],{timeout:15000});
}
async function model(key){
  return page.evaluate(n=>{
    const g=window.__world.scene.getObjectByName(n),meshes=g.children.filter(p=>p.visible);
    return {draws:meshes.length,triangles:meshes.reduce((t,o)=>t+o.geometry.index.count/3,0),
      mapped:!!meshes[0].material.map,texture:meshes[0].material.map?.image.width||0};
  },names[key]);
}
async function shot(name){
  if(out)await page.screenshot({path:path.join(out,name+'.png')});
}
async function crossArea(key,area){
  await page.keyboard.down(key);
  try{await page.waitForFunction(a=>window.__world?.ready&&window.__world.area===a,area,{timeout:22000});}
  finally{await page.keyboard.up(key);}
}
async function walkTo(key,v,direction){
  await page.keyboard.down(key);
  try{await page.waitForFunction(([v,dir])=>{
    const p=window.__world.player;return dir*((p.x-2.3)*.3552+(p.z+59.24)*.9348-v)>0;
  },[v,direction],{timeout:14000});}
  finally{await page.keyboard.up(key);}
}
try{
  await visit('gyeongbu/B1',at(70,8,incoming,-5));
  assert.deepEqual(requests,[],'underground requested the facade');
  await visit('street',at(70.1,-10,incoming+180));
  assert.deepEqual(requests,[],'a fully hidden entrance requested a detailed file');
  const coarse={portal:await model('portal'),tower:await model('tower')};
  for(const m of Object.values(coarse)){assert.equal(m.draws,1);assert.ok(!m.mapped);}
  await aim(43.6,-38,incoming,24);
  await waitMaterial('tower',false);
  assert.deepEqual(requests,[],'a different enclosed street building requested the other building’s detail');
  await aim(70.1,-10,incoming,8);
  await waitMaterial('portal',true);assert.deepEqual(requests,['portal 200'],'tower requested from the doorway');
  const detailed={portal:await model('portal')};
  await shot('front');
  await page.evaluate(()=>window.__world.setTimeMode('night'));await page.waitForTimeout(400);await shot('night');
  await page.evaluate(()=>window.__world.setTimeMode('day'));
  await aim(70.1,-10,incoming,0);
  await crossArea('w','in:gyeongbu');
  await page.waitForTimeout(300);
  assert.deepEqual(requests,['portal 200'],'new indoor document fetched a facade behind the camera');
  await walkTo('w',8.1,1);
  const passage=await page.evaluate(()=>{
    const w=window.__world,failures=[],r=.32;
    function push(u,v){
      const x=2.3+u*.9348+v*.3552,z=-59.24-u*.3552+v*.9348;
      const p={x,z};w.phys.resolve(p,r,0,1.75,.5);
      return Math.hypot(p.x-x,p.z-z);
    }
    for(const u of [69.5,70.05,70.5])for(let v=-4;v<9;v+=.20)if(push(u,v)>.035)failures.push([u,v]);
    return {failures,jambs:[push(64.6,-1.22),push(76.0,-1.22)],height:w.player.y,indoor:w.area};
  });
  assert.deepEqual(passage.failures,[]);assert.ok(passage.jambs.every(v=>v>.08));assert.ok(Math.abs(passage.height)<.12);
  // Turn around and use the same doorway in the opposite direction, with a fresh game document.
  await page.evaluate(()=>{window.__world.player.yaw+=Math.PI;});
  await waitMaterial('portal',true);
  await crossArea('w','out:core');
  await walkTo('w',-6,-1);
  console.log('passage',JSON.stringify(passage));
  const returned=requests.length;
  await aim(54,-28,179.004,29);
  await waitMaterial('tower',true);
  detailed.tower=await model('tower');await shot('tower');
  await aim(43.6,-91,incoming,14);
  await waitMaterial('tower',false);
  await aim(54,-28,179.004,29);
  await waitMaterial('tower',true);
  assert.equal(requests.slice(returned).filter(r=>r==='tower 200').length,1,'tower downloaded on re-entry');
  assert.ok(detailed.portal.triangles<12000&&detailed.tower.triangles<12000);
  assert.deepEqual([detailed.portal.draws,detailed.tower.draws],[4,2]);assert.deepEqual(errors,[]);
  console.log(JSON.stringify({coarse,detailed,passage,requests,errors},null,2));
}finally{await browser.close();await new Promise(r=>srv.close(r));}
