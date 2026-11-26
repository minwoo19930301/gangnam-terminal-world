import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {serve} from '../../../tests/serve.mjs';

const server=await serve(0);
const browser=await chromium.launch({channel:'chromium',args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});
const page=await browser.newPage({viewport:{width:1000,height:660}});
const requests=[],errors=[];
page.on('response',r=>{if(r.url().endsWith('/planted-column.glb'))requests.push(r.status());});
page.on('pageerror',e=>errors.push(e.message));
const view=(u,v,du,dv)=>{
  const x=2.3+u*.9348+v*.3552,z=-59.24-u*.3552+v*.9348;
  const yaw=Math.atan2(-du*.9348-dv*.3552,du*.3552-dv*.9348)*180/Math.PI;
  return [x,0,z,yaw].map(n=>n.toFixed(4)).join(',');
};
const route=pos=>'#/gyeongbu/1F?p='+pos;
async function visit(pos){
  await page.goto('about:blank');
  await page.goto('http://127.0.0.1:'+server.address().port+'/'+route(pos));
  await page.waitForFunction(()=>window.__world?.ready,null,{timeout:180000});
  await page.waitForTimeout(700);
}
try{
  await visit(view(60,13,0,-1));
  assert.deepEqual(requests,[]);
  const near=view(66.5,37,1.38,-2.91);
  await visit(near);
  const name='경부선 대합실 · 식물 기둥';
  await page.waitForFunction(name=>window.__world.scene.getObjectByName(name)?.children[0].geometry.hasAttribute('color'),name,{timeout:20000});
  assert.deepEqual(requests,[200]);assert.deepEqual(errors,[]);
  await page.evaluate(()=>{document.getElementById('start').click();window.__world.daylight.setMode('day');});
  await page.waitForTimeout(400);
  if(process.argv[2])await page.screenshot({path:process.argv[2]});
  console.log(route(near),await page.evaluate(name=>{const o=window.__world.scene.getObjectByName(name).children[0];return {triangles:o.geometry.index.count/3,zone:document.getElementById('zone').innerText};},name));
}finally{await browser.close();server.close();}
