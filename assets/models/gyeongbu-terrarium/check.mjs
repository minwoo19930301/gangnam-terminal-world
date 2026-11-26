import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {serve} from '../../../tests/serve.mjs';

const pos=(u,v)=>[2.3+u*.9348+v*.3552,-59.24-u*.3552+v*.9348];
const yaw=(u,v)=>Math.atan2(-(.9348*u+.3552*v),-(-.3552*u+.9348*v));
const names={arch:'자연목 아치와 걸이 공중식물',stand:'백색 철제 선반과 입구 마루',left:'왼편 산세베리아와 화분',right:'오른편 잎식물과 다육 트레이',timber:'자작 통나무와 고목 진열'};
const server=await serve(0),browser=await chromium.launch({channel:'chromium',args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});
const page=await browser.newPage({viewport:{width:1110,height:735},deviceScaleFactor:1});
const requests={},errors=[];
page.on('pageerror',e=>errors.push(e.message));
page.on('response',r=>{if(r.url().includes('/gyeongbu-terrarium/')&&/\.(glb|webp)$/.test(r.url())){
  const k=r.url().split('/').at(-1);(requests[k]??=[]).push(r.status());
}});
async function entry(floor,h,u,v,du,dv){
  const [x,z]=pos(u,v);await page.goto('about:blank');
  await page.goto('http://127.0.0.1:'+server.address().port+'/index.html?fixedres=1#/gyeongbu/'+floor+'?p='+[x,h,z,yaw(du,dv)*180/Math.PI].join(','));
  await page.waitForFunction(()=>window.__world?.ready,null,{timeout:130000});await page.locator('#start').click();await page.waitForTimeout(300);
}
async function pose(u,v,du,dv,pitch=-.14){
  const [x,z]=pos(u,v);await page.evaluate(p=>Object.assign(__world.player,p),{x,z,y:11,vy:0,yaw:yaw(du,dv),pitch});await page.waitForTimeout(270);
}
async function read(key){
  const name='경부선 박테라리움 · '+names[key];await page.waitForFunction(n=>__world.scene.getObjectByName(n)?.children[0]?.material.normalMap,name);
  return page.evaluate(n=>{const r=__world.scene.getObjectByName(n),m=r.children[0];return {draws:r.children.length,triangles:m.geometry.index.count/3,
    map:m.material.map.uuid,sizes:[m.material.map,m.material.normalMap,m.material.roughnessMap,m.material.emissiveMap].map(t=>t.image.width)};},name);
}
async function walk(u,v){
  const dest=pos(u,v);await page.evaluate(([x,z])=>{const p=__world.player;p.yaw=Math.atan2(p.x-x,p.z-z);},dest);
  await page.keyboard.down('w');try{
    await page.waitForFunction(([x,z])=>Math.hypot(__world.player.x-x,__world.player.z-z)<.12,dest,{timeout:9500});
  }finally{await page.keyboard.up('w');}
  return page.evaluate(()=>({y:__world.player.y,zone:__world.phys.zoneAt(__world.player.x,__world.player.y+.12,__world.player.z)?.name}));
}
try{
  await entry('4F',16,38.45,131.25,0,1);assert.deepEqual(requests,{});
  await entry('3F',11,38.39,131.22,0,1);
  const groups={right:await read('right')};assert.equal(requests['left.glb'],undefined);assert.equal(requests['timber.glb'],undefined);
  const rightFirst={...requests};
  await pose(38.40,131.18,0,-1);groups.left=await read('left');
  await pose(35.66,131.12,1,0);for(const key of ['arch','stand','timber'])groups[key]=await read(key);
  for(const part of Object.values(groups)){assert.equal(part.draws,1);assert.deepEqual(part.sizes,[512,256,128,128]);assert.equal(part.map,groups.right.map);}
  assert.ok(groups.right.triangles<38000);assert.ok(groups.left.triangles<26000);
  await pose(35.15,131.19,1,0);const enter=await walk(41.38,131.19),exit=await walk(35.15,131.19);
  assert.equal(enter.y,11);assert.equal(exit.y,11);
  const lane=await page.evaluate(()=>{
    const w=__world,result=[];
    for(let u=35.30;u<=41;u+=.20)for(const v of [130.92,131.18,131.43]){
      const x=2.3+u*.9348+v*.3552,z=-59.24-u*.3552+v*.9348,p={x,z};w.phys.resolve(p,.32,11,12.75,.5);
      if(Math.hypot(p.x-x,p.z-z)>.045||Math.abs(w.phys.support(x,z,11.45).y-11)>.06)result.push([u,v]);
    }return result;
  });assert.deepEqual(lane,[]);
  for(const mode of ['day','sunrise','sunset','night','live'])assert.equal(await page.evaluate(m=>{__world.setTimeMode(m);return __world.daylight.state.mode;},mode),mode);
  await pose(38.39,131.22,0,1);await read('right');
  for(const key of [...Object.keys(names).map(k=>k+'.glb'),'surface.webp','weave-normal.webp','metal-rough.webp','lamp.webp'])assert.deepEqual(requests[key],[200],key);
  assert.deepEqual(errors,[]);console.log(JSON.stringify({rightFirst,groups,enter,exit,lane,requests,errors},null,2));
}finally{await browser.close();await new Promise(r=>server.close(r));}
