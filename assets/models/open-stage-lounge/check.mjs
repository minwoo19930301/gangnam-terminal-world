import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {serve} from '../../../tests/serve.mjs';

const server=await serve(0);
const browser=await chromium.launch({channel:'chromium',args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});
const page=await browser.newPage({viewport:{width:1060,height:690},deviceScaleFactor:1});
const name='오픈 스테이지 · 흰 소파와 낮은 테이블',requests=[],errors=[];
page.on('response',r=>{if(r.url().endsWith('/open-stage-lounge/lounge.glb'))requests.push(r.status());});
page.on('pageerror',e=>errors.push(e.message));
const angle=Math.atan2(.358,.934),a=Math.sin(angle),b=Math.cos(angle);
function pose(s,t,ds,dt){
  return [-46+(s-27)*a+(t-38.5)*b,0,43.1+(s-27)*b-(t-38.5)*a,Math.atan2(-ds*a-dt*b,-ds*b+dt*a)*180/Math.PI];
}
async function cold(place,pos){
  await page.goto('about:blank');
  const route='#/'+place+'?p='+pos.map(n=>n.toFixed(3)).join(',');
  await page.goto('http://127.0.0.1:'+server.address().port+'/'+route);
  await page.waitForFunction(()=>window.__world?.ready,null,{timeout:150000});
  await page.waitForTimeout(500);
  return route;
}
try{
  await cold('jwmarriott/8F',[-15.84,35.5,117.19,-94]);assert.deepEqual(requests,[]);
  await cold('centralcity/1F',pose(59.4,20.4,1,0));assert.deepEqual(requests,[],'nearby but behind visitor');
  const route=await cold('centralcity/1F',pose(58.15,20.98,-3.35,-.53));
  await page.waitForFunction(name=>(window.__world.scene.getObjectByName(name)?.children[0]?.geometry?.index?.count??0)>1000,name,{timeout:25000});
  await page.evaluate(()=>{document.getElementById('start').click();window.__world.daylight.setMode('day');window.__world.player.pitch=-.19;});
  await page.waitForTimeout(450);
  if(process.argv[2])await page.screenshot({path:process.argv[2]});
  const result=await page.evaluate(name=>{const m=window.__world.scene.getObjectByName(name).children[0];return {triangles:m.geometry.index.count/3,draws:m.geometry.groups.length||1,zone:document.querySelector('#zone').innerText};},name);
  assert.deepEqual(requests,[200]);assert.deepEqual(errors,[]);
  console.log(route,result);
}finally{await browser.close();server.close();}
