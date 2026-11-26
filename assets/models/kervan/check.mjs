// Use the normal 2F hash and player controller to visit the east-gallery shop.
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {serve} from '../../../tests/serve.mjs';

const a=62/Math.hypot(62,24), b=24/Math.hypot(62,24), angle=Math.atan2(b,a);
const point=(u,v)=>[29-a*u+b*v,144+b*u+a*v];
const local=(x,z)=>[-(x-29)*a+(z-144)*b,(x-29)*b+(z-144)*a];
const server=await serve(0);
const browser=await chromium.launch({channel:'chromium',args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});
try {
  const page=await browser.newPage({viewport:{width:960,height:600}}),requests=[],errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('request',r=>{if(r.url().includes('/models/kervan/') && r.url().endsWith('.glb'))requests.push(r.url().split('/').pop());});
  const [x,z]=point(-35,19.3);
  await page.goto('http://127.0.0.1:'+server.address().port+'/index.html#/famille/2F?p='+[x,5,z,angle].join(','));
  await page.waitForFunction(()=>window.__world?.ready,null,{timeout:90000});
  await page.locator('#start').click();
  async function pose(u,v,rot=angle,pitch=-.13) {
    await page.evaluate(([x,z,yaw,pitch])=>{const p=__world.player;p.teleport(x,5,z,yaw);p.pitch=pitch;},
        [...point(u,v),rot,pitch]);
    await page.waitForTimeout(350);
  }
  async function travel(key,u,v) {
    await page.keyboard.down(key);
    try {await page.waitForFunction(([x,z])=>Math.hypot(__world.player.x-x,__world.player.z-z)<.16,point(u,v),{timeout:4500});}
    finally {await page.keyboard.up(key);}
  }
  const position=()=>page.evaluate(()=>[__world.player.x,__world.player.z,__world.player.y]);
  await pose(-35,19.3);
  assert.deepEqual(requests,[],'distant player should request no Kervan meshes');
  await pose(-3.7,20,angle+Math.PI);
  assert.deepEqual(requests,[],'near room behind the player should not start loading');
  await pose(-3.7,20);
  await page.waitForFunction(()=>['케르반 · 제과와 포장 진열','케르반 · 진열장 유리와 컵 뚜껑','케르반 · 청록색 주방창'].every(n=>{
    const m=__world.K.scene.getObjectByName(n)?.children[0];return m && !m.matrixAutoUpdate && m.geometry.index.count>500;
  }),null,{timeout:6500});
  await page.keyboard.down('w');
  await page.waitForTimeout(1450);
  await page.keyboard.up('w');
  const [px,pz,py]=await position(),[,contact]=local(px,pz);
  assert.ok(contact>16.86 && contact<17.3 && py===5,'counter should stop the customer at its front, v='+contact);
  await travel('s',-3.7,19.36);
  // This lane runs around the open end of the case and between the dining tables.
  await pose(.92,18.7);
  await travel('w',.92,14.82);
  const seated=await page.evaluate(()=>{const p=__world.player;return [__world.phys.zoneAt(p.x,p.y+.12,p.z)?.name,p.y];});
  assert.deepEqual(seated,['파미에스테이션 동관',5]);
  const [sx,sz]=point(.92,14.82),[tx,tz]=point(-.1,14.7);
  await pose(.92,14.82,Math.atan2(sx-tx,sz-tz),-.56);
  await page.waitForFunction(()=>{
    const m=__world.K.scene.getObjectByName('케르반 · 라바시와 차 한 상')?.children[0];
    return m && !m.matrixAutoUpdate && m.geometry.index.count>500;
  });
  await pose(-3.2,18.93,angle,.34);
  await page.waitForFunction(()=>{
    const items=[];__world.K.scene.traverse(o=>{if(o.name==='케르반 · 모자이크 등')items.push(o.children[0]);});
    return items.length===3 && items.every(m=>!m.matrixAutoUpdate && m.geometry.index.count>500);
  });
  await pose(.92,14.82);
  await travel('s',.92,18.67);
  await pose(-35,19.3);
  await pose(-3.7,19.3);
  assert.deepEqual(requests.sort(),['covers.glb','kitchen-window.glb','lantern.glb','showcase.glb','tea-table.glb']);
  assert.deepEqual([...errors,...await page.evaluate(()=>[...__world.errors,...__world.K._.detailErrors])],[]);
  console.log(JSON.stringify({distantRequests:0,behindPlayerRequests:0,nearRequests:requests,counterStopM:+contact.toFixed(2),seating:seated}));
}finally {
  await browser.close();
  await new Promise(resolve=>server.close(resolve));
}
