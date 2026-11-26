// Visit FP204 through the normal gallery, walk to the display and check the true rear window.
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {serve} from '../../../tests/serve.mjs';
const r=Math.atan2(.3639,.9315),a=Math.sin(r),b=Math.cos(r);
const point=(s,t)=>[-135.7+a*s+b*t,9.9+b*s-a*t];
const local=(x,z)=>[(x+135.7)*a+(z-9.9)*b,(x+135.7)*b-(z-9.9)*a];
const server=await serve(0);
const browser=await chromium.launch({channel:'chromium',args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});
try{
  const page=await browser.newPage({viewport:{width:940,height:620}}), requests=[],errors=[];
  page.on('request',q=>{if(q.url().includes('/models/damccot/') && q.url().endsWith('.glb'))requests.push(q.url().split('/').pop());});
  page.on('pageerror',err=>errors.push(err.message));
  const [x,z]=point(186.8,-17);
  await page.goto('http://127.0.0.1:'+server.address().port+'/index.html#/famille/2F?p='+[x,5,z,r].join(','));
  await page.waitForFunction(()=>window.__world?.ready,null,{timeout:90000});
  await page.locator('#start').click();
  const pose=async(s,t,angle=r,pitch=0)=>{
    await page.evaluate(([x,z,angle,p])=>{const actor=__world.player;actor.teleport(x,5,z,angle);actor.pitch=p;},
      [...point(s,t),angle,pitch]);await page.waitForTimeout(360);
  };
  async function walk(key,s,t){
    await page.keyboard.down(key);
    try{
      await page.waitForFunction(([x,z])=>Math.hypot(__world.player.x-x,__world.player.z-z)<.15,point(s,t),{timeout:4500});
    }finally{await page.keyboard.up(key);}
  }
  const where=()=>page.evaluate(()=>{const {x,y,z}=__world.player;return {point:[x,z],zone:__world.phys.zoneAt(x,y+.1,z)?.name,y};});
  await pose(186.8,-17);
  assert.equal(requests.length,0,'FP204 is distant');
  await pose(187.2,20.90,r+Math.PI);
  assert.equal(requests.length,0,'FP204 is behind the player');
  await pose(187.2,20.90,r,-.09);
  await walk('w',183.30,20.90);
  const entered=await where();
  assert.equal(entered.zone,'담꽃');assert.equal(entered.y,5);
  await page.waitForFunction(()=>['담꽃 · 다기와 보자기 진열장','담꽃 · 백색 주문대와 검은 의자']
    .every(n=>{const m=__world.K.scene.getObjectByName(n)?.children[0];return m && !m.matrixAutoUpdate;}));
  // A normal sideways approach stops at the real counter, leaving the approach lane open.
  await page.keyboard.down('d');await page.waitForTimeout(900);await page.keyboard.up('d');
  const o=await where(),[,counter]=local(...o.point);
  assert.ok(counter>20.93 && counter<21.34,'counter stop t='+counter);
  await pose(184.02,18.33,r+Math.PI/2,-.06);
  await page.keyboard.down('w');await page.waitForTimeout(850);await page.keyboard.up('w');
  const [,cabinet]=local(...(await where()).point);
  assert.ok(cabinet>17.12 && cabinet<17.65,'tea display contact t='+cabinet);
  await pose(184.42,19.36,r-.53,-.62);
  await page.waitForFunction(()=>{const m=__world.K.scene.getObjectByName('담꽃 · 밤대추팥빙수 한 상')?.children[0];
    return m && !m.matrixAutoUpdate && m.geometry.index.count>1000;});
  await pose(183.30,20.90);
  await walk('s',187.19,20.90);
  const returned=await where();assert.equal(returned.zone,'파미에스테이션 2층 산책로');
  await pose(180.15,18.96,r+Math.PI,-.03);
  const visible=await page.evaluate(()=>{const pub=__world.K._.details.find(d=>d.name==='담꽃');return pub?.built && !pub.hidden;});
  assert.equal(visible,true,'the room remains visible through the rear window');
  await pose(187.1,20.90);
  assert.deepEqual(requests.sort(),['bingsu.glb','furniture.glb','tea-cabinet.glb']);
  assert.deepEqual([...errors,...await page.evaluate(()=>[...__world.errors,...__world.K._.detailErrors])],[]);
  console.log(JSON.stringify({distantRequests:0,behindPlayerRequests:0,downloads:requests,entered:entered.zone,
    returned:returned.zone,counterT:+counter.toFixed(2),cabinetT:+cabinet.toFixed(2),visibleThroughWindow:visible}));
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
