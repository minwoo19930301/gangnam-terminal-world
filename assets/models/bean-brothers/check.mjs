// Exercise the counter, the public seating gap and the gallery behind the café.
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { serve } from '../../../tests/serve.mjs';
const r=Math.atan2(.3639,.9315), a=Math.sin(r), b=Math.cos(r);
const point=(s,t)=>[-135.7+a*s+b*t,9.9+b*s-a*t];
const local=([x,z])=>[(x+135.7)*a+(z-9.9)*b,(x+135.7)*b-(z-9.9)*a];
const server=await serve(0);
const browser=await chromium.launch({channel:'chromium',args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});
try {
  const page=await browser.newPage({viewport:{width:960,height:600}}), requests=[], errors=[];
  page.on('request',q=>{if(q.url().endsWith('/bean-brothers/fp203.glb')) requests.push(q.url());});
  page.on('pageerror',q=>errors.push(q.message));
  const [x,z]=point(177,-65);
  await page.goto('http://127.0.0.1:'+server.address().port+'/index.html#/famille/2F?p='+[x,5,z,0].join(','));
  await page.waitForFunction(()=>window.__world?.ready,null,{timeout:90000});
  await page.locator('#start').click();
  async function pose(s,t,facing=1) {
    await page.evaluate(([x,z,yaw])=>{const p=__world.player;p.teleport(x,5,z,yaw);p.pitch=-.08;},
      [...point(s,t),facing>0 ? r-Math.PI : r]);
    await page.waitForTimeout(330);
  }
  async function walkTo(key,s,t) {
    const [x,z]=point(s,t);
    await page.keyboard.down(key);
    try {
      await page.waitForFunction(([x,z])=>Math.hypot(__world.player.x-x,__world.player.z-z)<.19,[x,z],{timeout:4000});
    } finally {await page.keyboard.up(key);}
  }
  const position=()=>page.evaluate(()=>[__world.player.x,__world.player.z]);
  await pose(186.25,5.97,-1);
  assert.equal(requests.length,0,'distant arrival and solid rear wall');
  await pose(180.55,5.97);
  await page.waitForFunction(()=>{
    const m=__world.K.scene.getObjectByName('빈브라더스 · FP203 커피바와 좌석')?.children[0];
    return m && !m.matrixAutoUpdate && m.geometry.index?.count>20000;
  },null,{timeout:6000});
  await walkTo('w',183.52,5.97);
  const entered=await page.evaluate(()=>{const p=__world.player;return [__world.phys.zoneAt(p.x,p.y+.12,p.z)?.name,p.y]});
  assert.deepEqual(entered,['빈브라더스',5]);
  await walkTo('s',180.75,5.97);
  await pose(181.1,2.72);
  await page.keyboard.down('w');await page.waitForTimeout(900);await page.keyboard.up('w');
  const [contact]=local(await position());
  assert.ok(contact>182.40 && contact<182.82,'the solid counter stopped the shopper at '+contact);
  await pose(186.25,5.97,-1);
  await page.waitForFunction(()=>__world.K._.details.find(d=>d.name==='빈브라더스')?.hidden,null,{timeout:3500});
  const open=await page.evaluate(()=>{const p=__world.player;return [__world.phys.zoneAt(p.x,p.y+.12,p.z)?.name,p.y]});
  assert.ok(open[0].includes('산책로') && open[1]===5);
  await pose(180.55,5.97);
  await page.waitForFunction(()=>!__world.K._.details.find(d=>d.name==='빈브라더스').hidden);
  assert.equal(requests.length,1,'one close model for repeat visits');
  assert.deepEqual([...errors,...await page.evaluate(()=>[...__world.errors,...__world.K._.detailErrors])],[]);
  console.log(JSON.stringify({entered,counterStopM:+contact.toFixed(2),backGallery:open,modelRequests:requests.length}));
}finally {
  await browser.close();
  await new Promise(ok=>server.close(ok));
}
