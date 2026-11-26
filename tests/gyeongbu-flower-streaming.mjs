import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {serve} from './serve.mjs';

const point=(u,v)=>[2.3+u*.9348+v*.3552,-59.24-u*.3552+v*.9348];
const names=['1F 대합실 · 매표 · 상점 · 좌석','20차 사진 보행 · 대합실 가구와 마감'];
const server=await serve(0),browser=await chromium.launch({channel:'chromium',args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});
const page=await browser.newPage({viewport:{width:1000,height:680},deviceScaleFactor:1});
async function at(u,v,y,angle){
  const [x,z]=point(u,v);
  await page.evaluate(p=>Object.assign(__world.player,p),{x,z,y,vy:0,yaw:angle,pitch:-.08});
  await page.waitForTimeout(350);
}
async function state(){return page.evaluate(names=>names.map(name=>{
  const d=__world.K._.details.find(d=>d.name===name);return {built:d.built,hidden:!!d.hidden};
}),names);}
try{
  const [x,z]=point(50.12,103.02);
  await page.goto('http://127.0.0.1:'+server.address().port+'/index.html?fixedres=1#/gyeongbu/3F?p='+[x,11,z,20.8].join(','));
  await page.waitForFunction(()=>window.__world?.ready,null,{timeout:130000});await page.locator('#start').click();
  await page.waitForTimeout(850);const arrival=await state();assert.ok(arrival.every(s=>!s.built));
  const cases=[[20,88.1,12.65],[23.8,83.1,12.65],[36,50,12.65],[42,55,12.65],[11.4,104,12.65],[56,34,7.66],[50.12,103.02,12.65]];
  const aperture=await page.evaluate(({names,at})=>at.map(([x,z,eye])=>names.every(name=>__world.K._.details.find(d=>d.name===name).visibleFrom(x,eye,z))),{names,at:cases.map(([u,v,y])=>[...point(u,v),y])});
  assert.deepEqual(aperture,[true,true,true,true,true,true,false]);
  await at(57.7,31.8,0,.34);await page.waitForFunction(names=>names.every(n=>__world.K._.details.find(d=>d.name===n).built),names);
  const hall=await state();assert.ok(hall.every(s=>s.built&&!s.hidden));
  await at(50.12,103.02,11,.35);const returned=await state();assert.ok(returned.every(s=>s.built&&s.hidden));
  await at(62.8,42,6,-2.8);const gallery=await state();assert.ok(gallery.every(s=>s.built&&!s.hidden));
  assert.deepEqual(await page.evaluate(()=>__world.errors),[]);console.log(JSON.stringify({arrival,aperture,hall,returned,gallery}));
}finally{await browser.close();await new Promise(r=>server.close(r));}
