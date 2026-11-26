// Traverse the normal B1 aisle, inspect both gardening displays, then switch aisles and back.
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {serve} from '../../../tests/serve.mjs';
const a=[.9348,-.3552],b=[.3552,.9348],len=a[0]*a[0]+a[1]*a[1];
const W=(u,v)=>[2.3+a[0]*u+b[0]*v,-59.24+a[1]*u+b[1]*v];
const local=(x,z)=>[((x-2.3)*a[0]+(z+59.24)*a[1])/len,((x-2.3)*b[0]+(z+59.24)*b[1])/len];
const server=await serve(0),browser=await chromium.launch({channel:'chromium',headless:true,args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});
try{
  const page=await browser.newPage({viewport:{width:1000,height:640}}),downloads=[],errors=[];
  page.on('request',q=>{if(q.url().includes('/models/daiso-garden/')&&q.url().endsWith('.glb'))downloads.push(q.url().split('/').pop());});
  page.on('pageerror',e=>errors.push(e.message));
  const [x,z]=W(172,6.6);
  await page.goto('http://127.0.0.1:'+server.address().port+'/index.html#/gyeongbu/B1?p='+[x,-4,z,0].join(','));
  await page.waitForFunction(()=>window.__world?.ready,null,{timeout:90000});await page.locator('#start').click();
  const where=()=>page.evaluate(()=>{const w=__world,p=w.player;return {xz:[p.x,p.z],y:p.y,zone:w.phys.zoneAt(p.x,p.y+.12,p.z)?.name};});
  async function pose(u,v,tu,tv,pitch=-.035){
    const [x,z]=W(u,v),[xx,zz]=W(tu,tv);
    await page.evaluate(([x,z,yaw,pitch])=>{const p=__world.player;p.teleport(x,-4,z,yaw);p.pitch=pitch;},[x,z,Math.atan2(x-xx,z-zz),pitch]);
    await page.waitForTimeout(420);
  }
  async function walk(u,v,timeout=18000){
    const target=W(u,v);
    await page.evaluate(([x,z])=>{const p=__world.player;p.yaw=Math.atan2(p.x-x,p.z-z);},target);
    await page.keyboard.down('w');
    try{await page.waitForFunction(([x,z])=>Math.hypot(__world.player.x-x,__world.player.z-z)<.17,target,{timeout});}
    finally{await page.keyboard.up('w');}
  }
  const names=['다이소 · 홈가드닝 화분 진열','다이소 · 화분 옆 조화 진열'];
  async function loaded(name){
    await page.waitForFunction(n=>{const m=__world.K.scene.getObjectByName(n)?.children[0];return m && !m.matrixAutoUpdate && m.geometry.index.count>5000;},name);
  }
  await pose(172,6.6,169,6.6);
  assert.deepEqual(downloads,[],'stock at the other end of the shop must stay local');
  const firstBank=await page.evaluate(()=>__world.K._.details.find(d=>d.name==='다이소 쿠션 선반 1')?.built);
  assert.equal(firstBank,false,'cushion banks should stay unbuilt at the west entrance');
  await pose(225.3,6.55,225.3,8.7);
  assert.deepEqual(downloads,[],'the gardening displays are behind the viewer');
  await pose(225.3,1.37,225.3,4.18);
  await page.waitForFunction(n=>__world.K.scene.getObjectByName(n)?.children[0]?.geometry.index.count>0,names[0]);
  const fallbackCount=await page.evaluate(n=>__world.K.scene.getObjectByName(n).children[0].geometry.index.count,names[0]);
  assert.ok(!downloads.includes('pots.glb'),'the opaque backboard does not need front stock');
  await pose(172,6.6,180,6.6);
  await walk(194,6.6);await walk(216,6.6);await walk(225.3,6.6);
  assert.equal((await where()).zone,'다이소 강남고속버스터미널점');
  await pose(225.3,6.6,225.3,4.18,-.12);
  await loaded(names[0]);
  const contacts=[];
  for(const [u,v,expect,name] of [[225.3,5.8,4.49,names[0]],[222.98,6.1,5.10,names[1]]]){
    await pose(u,v,u,v-1,-.11);await loaded(name);
    await page.keyboard.down('w');await page.waitForTimeout(720);await page.keyboard.up('w');
    const here=await where(),[,along]=local(...here.xz);
    assert.ok(along>expect+.26&&along<expect+.44,'contact at '+along.toFixed(3));
    assert.equal(here.y,-4);contacts.push(+along.toFixed(3));
  }
  await pose(222.98,6.61,228,6.61);await walk(230.5,6.61);await walk(222.98,6.61);
  await pose(260.5,-4.7,260.5,-2.91);
  await page.waitForFunction(()=>__world.K._.details.find(d=>d.name==='다이소 쿠션 선반 1')?.built);
  await pose(225.3,6.6,225.3,4.18);await loaded(names[0]);
  await pose(225.3,1.37,225.3,4.18);
  await page.waitForFunction(([name,n])=>__world.K.scene.getObjectByName(name).children[0].geometry.index.count===n,[names[0],fallbackCount]);
  await pose(225.3,6.6,225.3,4.18);await loaded(names[0]);
  assert.deepEqual(downloads.sort(),['bouquets.glb','pots.glb']);
  assert.deepEqual([...errors,...await page.evaluate(()=>[...__world.errors,...__world.K._.detailErrors])],[]);
  console.log(JSON.stringify({westEntranceAndBackFacingRequests:0,downloads,rearProxyTriangles:fallbackCount/3,contactV:contacts,aisleRoundTrip:true,cushionAisleBuilt:true}));
}finally{await browser.close();await new Promise(r=>server.close(r));}
