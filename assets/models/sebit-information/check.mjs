// Walk from the open underground gallery to the literature, counter and digital reader.
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {serve} from '../../../tests/serve.mjs';

const length=Math.hypot(130,335),u=[-130/length,-335/length],v=[u[1],-u[0]];
const at=(s,t)=>[-410+u[0]*s+v[0]*t,-45+u[1]*s+v[1]*t];
const local=(x,z)=>[(x+410)*u[0]+(z+45)*u[1],(x+410)*v[0]+(z+45)*v[1]];
const names={shelf:'흰 다섯 단 서가와 여행 책자',reader:'다국어 책장과 세로 열람 화면',
  desk:'곡면 방문 안내대와 상담 집기',sign:'삼색 상호와 은색 안내 벽',arrival:'천장 매입등과 입구 문턱'};
const server=await serve(0),browser=await chromium.launch({channel:'chromium',headless:true,
  args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});
try{
  const p=await browser.newPage({viewport:{width:1000,height:640}}),requests=[],errors=[];
  p.on('pageerror',e=>errors.push(e.message));p.on('request',q=>{
    if(q.url().includes('/models/sebit-information/')&&q.url().endsWith('.glb'))requests.push(q.url().split('/').pop());
  });
  const [x,z]=at(116,0);
  await p.goto('http://127.0.0.1:'+server.address().port+'/index.html#/onebailey/B1?p='+[x,-6,z,0].join(','));
  await p.waitForFunction(()=>window.__world?.ready,null,{timeout:90000});await p.locator('#start').click();
  async function pose(s,t,vs,vt,pitch=0){
    const [x,z]=at(s,t),[tx,tz]=at(vs,vt),yaw=Math.atan2(x-tx,z-tz);
    await p.evaluate(([x,z,yaw,pitch])=>{__world.player.teleport(x,-6,z,yaw);__world.player.pitch=pitch;},[x,z,yaw,pitch]);
    await p.waitForTimeout(380);
  }
  async function look(s,t,pitch=0){await p.evaluate(([x,z,pitch])=>{const p=__world.player;p.yaw=Math.atan2(p.x-x,p.z-z);p.pitch=pitch;},[...at(s,t),pitch]);}
  async function where(){
    const [x,z,y,name]=await p.evaluate(()=>{const {x,y,z}=__world.player;return[x,z,y,__world.phys.zoneAt(x,y+.15,z)?.name];});
    return [...local(x,z),y,name];
  }
  async function walk(s,t){
    const start=await where();await look(s,t);await p.keyboard.down('w');
    try{await p.waitForFunction(([x,z])=>Math.hypot(__world.player.x-x,__world.player.z-z)<.14,at(s,t),{timeout:6500});}
    catch(e){throw new Error('Walk '+start+' to '+[s,t]+' ended at '+await where(),{cause:e});}
    finally{await p.keyboard.up('w');}
  }
  async function hold(){await p.keyboard.down('w');await p.waitForTimeout(470);await p.keyboard.up('w');}
  async function high(key,min){await p.waitForFunction(([name,min])=>
    (__world.K.scene.getObjectByName('세빛 안내 · '+name)?.children[0]?.geometry.index?.count??0)>3*min,[names[key],min],{timeout:5000});}
  await pose(116,0,120,0);assert.deepEqual(requests,[],'distant gallery cold');
  await pose(167.1,18.13,167.1,13.0);assert.deepEqual(requests,[],'opaque rear cold');
  await pose(161.65,12.12,166.5,12.12);assert.deepEqual(requests,[],'opaque side cold');
  await pose(167,5.25,167,0);assert.deepEqual(requests,[],'facing away cold');
  await pose(167,4.11,167,13);await high('desk',700);await high('sign',500);
  assert.ok(!requests.includes('shelf.glb')&&!requests.includes('reader.glb'),'paper and touchscreen are still distant');
  await walk(167,6.50);const outside=await where();
  await walk(167,8.1);const interior=await where();
  assert.equal(interior[3],'고터·세빛 관광안내센터');
  assert.equal(+outside[2].toFixed(2),-6);assert.equal(+interior[2].toFixed(2),-5.88);
  await look(169.2,11.54,.34);await high('arrival',400);
  await walk(167.0,11.69);await look(167.0,13.28);await hold();
  const desk=await where();assert.ok(desk[1]>11.94&&desk[1]<12.09,'desk face '+desk);
  await walk(165.11,11.54);await walk(164.20,11.81);await look(163.38,12.10,-.08);await high('shelf',3000);
  await walk(164.13,13.74);await look(162.85,13.74,-.08);await hold();
  const shelf=await where();assert.ok(shelf[0]>163.8&&shelf[0]<163.95,'brochure stand '+shelf);
  await walk(164.18,11.40);await walk(170.80,11.42);await walk(173.49,13.82);
  await look(173.57,16.04,-.05);await high('reader',1500);
  await walk(173.55,15.08);await look(173.55,16.15);await hold();
  const reader=await where();assert.ok(reader[1]>15.40&&reader[1]<15.55,'reader face '+reader);
  await walk(171.09,14.38);await walk(170.65,11.20);await walk(167.0,9.83);await walk(167.0,5.75);
  assert.ok((await where())[3]!=='고터·세빛 관광안내센터','return to gallery');
  await pose(167,18.13,167,13.40);
  const hidden=await p.evaluate(()=>__world.K._.details.filter(d=>d.name.startsWith('고터·세빛 안내센터 ')).map(d=>d.hidden));
  assert.equal(hidden.length,5);assert.ok(hidden.every(Boolean));
  await pose(173.55,15.22,173.57,16.0,-.18);await high('reader',1500);
  assert.deepEqual(requests.toSorted(),Object.keys(names).map(n=>n+'.glb').sort());
  assert.deepEqual([...errors,...await p.evaluate(()=>[...__world.errors,...__world.K._.detailErrors])],[]);
  console.log(JSON.stringify({farCold:0,rearCold:0,sideCold:0,behindCameraCold:0,warmRearHidden:hidden.length,
    downloads:requests,threshold:[outside[2],interior[2]],desk,shelf,reader}));
}finally{await browser.close();await new Promise(r=>server.close(r));}
