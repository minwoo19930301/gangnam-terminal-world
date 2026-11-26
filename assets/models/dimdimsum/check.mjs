import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {serve} from '../../../tests/serve.mjs';

const r=Math.atan2(.3639,.9315), a=Math.sin(r), b=Math.cos(r);
const point=(s,t)=>[-135.7+a*s+b*t,9.9+b*s-a*t];
const local=(x,z)=>[(x+135.7)*a+(z-9.9)*b,(x+135.7)*b-(z-9.9)*a];
const server=await serve(0), browser=await chromium.launch({channel:'chromium',headless:true,
  args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});
try{
  const page=await browser.newPage({viewport:{width:940,height:620}}),downloads=[],errors=[];
  page.on('request',req=>{if(req.url().includes('/models/dimdimsum/') && req.url().endsWith('.glb'))downloads.push(req.url().split('/').pop());});
  page.on('pageerror',e=>errors.push(e.message));
  const [sx,sz]=point(192.05,32);
  await page.goto('http://127.0.0.1:'+server.address().port+'/index.html#/centralcity/1M?p='+[sx,5,sz,r-Math.PI/2].join(','));
  await page.waitForFunction(()=>window.__world?.ready,null,{timeout:90000});
  await page.locator('#start').click();
  // The map entry accepts a world bookmark. The subsequent gallery and table visit uses player movement.
  const pose=async(s,t,yaw,pitch=0)=>{const [x,z]=point(s,t);await page.evaluate(([x,z,yaw,p])=>{
    const a=__world.player;a.teleport(x,5,z,yaw);a.pitch=p;
  },[x,z,yaw,pitch]);await page.waitForTimeout(320);};
  const where=async()=>{
    const [x,z,y,name]=await page.evaluate(()=>{const {x,y,z}=__world.player;return [x,z,y,__world.phys.zoneAt(x,y+.1,z)?.name];});
    const [s,t]=local(x,z);return {s,t,y,name};
  };
  async function turnTo(s,t,pitch=0){
    await page.evaluate(([tx,tz,angle])=>{const v=__world.player;v.yaw=Math.atan2(v.x-tx,v.z-tz);v.pitch=angle;},[...point(s,t),pitch]);
  }
  async function walk(s,t){
    const [tx,tz]=point(s,t),{s:fromS,t:fromT}=await where();await turnTo(s,t);
    await page.keyboard.down('w');
    try{await page.waitForFunction(([x,z])=>Math.hypot(__world.player.x-x,__world.player.z-z)<.14,[tx,tz],
      {timeout:Math.max(4000,Math.hypot(s-fromS,t-fromT)*460+1700)});}
    catch(e){throw new Error('Could not reach '+JSON.stringify({s,t,fromS,fromT,stopped:await where()}),{cause:e});}
    finally{await page.keyboard.up('w');}
    const feet=await where();assert.equal(feet.y,5,'floor throughout the restaurant approach');return feet;
  }
  await pose(192.05,32,r-Math.PI/2);
  assert.deepEqual(downloads,[],'distant gallery');
  await pose(192.05,9.55,r);
  assert.deepEqual(downloads,[],'the dining room is behind the camera');
  await pose(192.05,32,r-Math.PI/2);
  await walk(192.05,9.55);
  await turnTo(191.0,9.55);await page.waitForTimeout(300);
  await turnTo(200,9.55);
  const entered=await walk(194.85,9.55);assert.equal(entered.name,'딤딤섬');
  await walk(194.85,8.86);
  await walk(197.39,8.86);
  await turnTo(197.39,10.95,-.47);
  await page.waitForFunction(()=>{const root=__world.K.scene.getObjectByName('딤딤섬 · 피기 커스터드 번');return root && root.children[0].geometry.index.count>1000;});
  await walk(195.62,8.86);
  await turnTo(195.62,10.95,-.47);
  await page.waitForFunction(()=>__world.K.scene.getObjectByName('딤딤섬 · 찜기 세 가지와 차')?.children[0].geometry.index.count>1000);
  await page.keyboard.down('w');await page.waitForTimeout(900);await page.keyboard.up('w');
  const chair=await where();assert.ok(chair.t>9.2 && chair.t<9.7,'solid chair '+chair.t);
  await walk(194.87,9.48);await walk(192.06,9.48);
  assert.equal((await where()).name,'파미에스테이션 중층');
  await walk(192.06,6.91);
  await turnTo(197,6.91);await page.keyboard.down('w');await page.waitForTimeout(820);await page.keyboard.up('w');
  const host=await where();assert.ok(host.s>192.71 && host.s<193.20,'solid host stand '+host.s);
  // Examine the opposite side of the solid wall after warming the cache.
  await pose(202.67,9.60,r);
  const hidden=await page.evaluate(()=>__world.K._.details.find(d=>d.name==='딤딤섬')?.hidden);
  assert.equal(hidden,true,'warmed furniture hidden outside the back wall');
  const copies=await page.evaluate(()=>{
    const zones=__world.K._.details.filter(d=>d.name==='딤딤섬'),found={};
    __world.K.scene.traverse(o=>{if(o.isGroup && o.name.startsWith('딤딤섬 · '))found[o.name]=(found[o.name]??0)+1;});
    return {zones:zones.map(d=>d.floor),models:found};
  });
  assert.deepEqual(copies.zones,['1M']);
  assert.equal(copies.models['딤딤섬 · 목제 식탁과 곡목 의자'],9);
  assert.equal(copies.models['딤딤섬 · 피기 커스터드 번'],2);
  assert.deepEqual(downloads.sort(),['dining.glb','piggy.glb','steamers.glb','table.glb','welcome.glb']);
  assert.deepEqual([...errors,...await page.evaluate(()=>[...__world.errors,...__world.K._.detailErrors])],[]);
  console.log(JSON.stringify({startGalleryCold:0,backFacingCold:0,downloads,entered:entered.name,returned:'파미에스테이션 중층',
    chairContact:chair.t,hostContact:host.s,backHidden:hidden,copies}));
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
