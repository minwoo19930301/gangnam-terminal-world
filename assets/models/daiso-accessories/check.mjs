// Use the normal B1 player: see the two ends, walk the five-step dip, and return.
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {serve} from '../../../tests/serve.mjs';

const a=[.9348,-.3552],b=[.3552,.9348],len=a[0]**2+a[1]**2;
const W=(u,v)=>[2.3+a[0]*u+b[0]*v,-59.24+a[1]*u+b[1]*v];
const local=(x,z)=>[((x-2.3)*a[0]+(z+59.24)*a[1])/len,((x-2.3)*b[0]+(z+59.24)*b[1])/len];
const hair='다이소 · 머리띠와 집게핀·헤어롤 진열',brushes='다이소 · 손잡이 청소솔과 틈새 브러시 진열';
const srv=await serve(0),browser=await chromium.launch({channel:'chromium',headless:true,args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});
try{
  const page=await browser.newPage({viewport:{width:1000,height:640}}),requests=[],errors=[];
  page.on('request',q=>{if(q.url().includes('/models/daiso-accessories/')&&q.url().endsWith('.glb'))requests.push(q.url().split('/').pop());});
  page.on('pageerror',e=>errors.push(e.message));
  const [x,z]=W(172,6.6);await page.goto('http://127.0.0.1:'+srv.address().port+'/index.html#/gyeongbu/B1?p='+[x,-4,z,0].join(','));
  await page.waitForFunction(()=>window.__world?.ready,null,{timeout:90000});await page.locator('#start').click();
  async function pose(u,v,tu,tv,pitch=-.095){
    const [x,z]=W(u,v),[xx,zz]=W(tu,tv);
    await page.evaluate(([x,z,yaw,pitch])=>{const p=__world.player;p.teleport(x,-4,z,yaw);p.pitch=pitch;},[x,z,Math.atan2(x-xx,z-zz),pitch]);
    await page.waitForTimeout(420);
  }
  async function player(){
    return page.evaluate(()=>{const w=__world,p=w.player;return [p.x,p.z,p.y,w.phys.zoneAt(p.x,p.y+.12,p.z)?.name]});
  }
  async function walk(u,v){
    const target=W(u,v);
    await page.evaluate(([x,z])=>{const p=__world.player;p.yaw=Math.atan2(p.x-x,p.z-z);},target);
    await page.keyboard.down('w');
    try{await page.waitForFunction(([x,z])=>Math.hypot(__world.player.x-x,__world.player.z-z)<.15,target,{timeout:12000});}
    finally{await page.keyboard.up('w');}
  }
  async function geometry(name,detail){
    await page.waitForFunction(([n,detail])=>{const count=__world.K.scene.getObjectByName(n)?.children[0]?.geometry?.index?.count;return count>0&&(detail?count>6000:count<6000);},[name,detail],{timeout:7000});
    return page.evaluate(n=>__world.K.scene.getObjectByName(n).children[0].geometry.index.count/3,name);
  }
  await pose(172,6.6,169,6.6);
  await pose(241,6.6,241,3.2);
  assert.deepEqual(requests,[],'neither a distant nor an unseen shelf should download');
  const behind=[[hair,242.06,10.05,241,8.5],[brushes,261.83,-.44,260.8,.83]],proxies=[];
  for(const [name,u,v,xx,zz] of behind){await pose(u,v,xx,zz);proxies.push(await geometry(name,false));}
  assert.deepEqual(requests,[],'opaque boards face the camera from their rear aisles');
  await pose(232,6.6,241,6.6);await walk(241,6.6);
  await pose(241,6.6,241,8.5);const counts=[await geometry(hair,true)];
  assert.deepEqual(requests,['hair.glb']);
  async function contact(u,v,tu,tv,lo,hi){
    await pose(u,v,tu,tv);await page.keyboard.down('w');await page.waitForTimeout(800);await page.keyboard.up('w');
    const [x,z,y]=await player(),[,pos]=local(x,z);assert.ok(pos>lo&&pos<hi,'display contact '+pos.toFixed(4));
    assert.ok(Math.abs(y+4)<.025);return +pos.toFixed(3);
  }
  const stopAt=[await contact(241,6.87,241,8.5,7.83,8.02)];
  await pose(241,6.6,245.48,6.6);await walk(245.48,6.6);
  const dipY=(await player())[2];assert.ok(dipY< -4.22&&dipY>=-4.65,'sunken middle landing '+dipY);
  await walk(252,6.6);await walk(260.8,6.6);await walk(260.8,2.85);
  const [,,shopY,zone]=await player();assert.equal(shopY,-4);assert.ok(zone?.includes('다이소'));
  counts.push(await geometry(brushes,true));stopAt.push(await contact(260.8,2.85,260.8,.83,1.29,1.56));
  for(const [i,[name,u,v,xx,zz]] of behind.entries()){await pose(u,v,xx,zz);assert.equal(await geometry(name,false),proxies[i]);}
  await pose(260.8,2.85,260.8,.83);await geometry(brushes,true);
  await walk(260.8,6.6);await walk(245.48,6.6);await walk(241,6.6);await pose(241,6.6,241,8.5);await geometry(hair,true);
  assert.deepEqual(requests,['hair.glb','brushes.glb']);
  assert.deepEqual([...errors,...await page.evaluate(()=>[...__world.errors,...__world.K._.detailErrors])],[]);
  console.log(JSON.stringify({requests,rearProxyTriangles:proxies,nearTriangles:counts,contactLocalV:stopAt,dipY,shopY,zone,roundTrip:true}));
}finally{await browser.close();await new Promise(resolve=>srv.close(resolve));}
