// Run with --gpu for Metal Chromium. Optional --shots <directory> captures the same view in four modes.
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { chromium } from 'playwright';
import { solarPosition, horizonTime, seoulClock } from '../js/daylight.js';
import { serve } from './serve.mjs';

const site={lat:37.5050371,lon:127.0049222};
const nov=Date.parse('2026-11-26T12:00:00+09:00');
for (const [rising, expected] of [[true,'07:23'],[false,'17:16']]) {
  const observed=Date.parse('2026-11-26T'+expected+':00+09:00');
  const estimated=horizonTime(nov,site,rising);
  assert.ok(Math.abs(estimated-observed)<120000,'Seoul KMA horizon within two minutes');
  assert.ok(Math.abs(solarPosition(estimated,site).altitude+.833)<.01);
}
const summer=Date.parse('2026-06-21T12:30:00+09:00'), winter=Date.parse('2026-12-21T12:30:00+09:00');
assert.ok(solarPosition(summer,site).altitude-solarPosition(winter,site).altitude>45);
assert.ok(seoulClock(horizonTime(summer,site,true))<'05:20' && seoulClock(horizonTime(summer,site,false))>'19:50');

const server=await serve(0);
const browser=await chromium.launch(process.argv.includes('--gpu')
  ? {channel:'chromium',args:['--use-angle=metal','--ignore-gpu-blocklist','--enable-gpu']}
  : {args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try {
  const shotIndex=process.argv.indexOf('--shots'), shots=shotIndex<0 ? null : process.argv[shotIndex+1];
  if (shots) await mkdir(shots,{recursive:true});
  const page=await browser.newPage({timezoneId:'America/Los_Angeles',viewport:{width:1120,height:630}});
  const errors=[];
  page.on('pageerror', e=>errors.push(e.message));
  page.on('console', m=>{if (m.text().includes('Shader Error')) errors.push(m.text());});
  await page.addInitScript(t=>{window.testInstant=t;Date.now=()=>window.testInstant;},nov);
  const base='http://127.0.0.1:'+server.address().port+'/index.html?places=hangang&traffic=0&fly=1&pos=-567,18,-805&yaw=67&pitch=1';
  const ready=()=>page.waitForFunction(()=>window.__world?.ready,null,{timeout:120000});
  const state=()=>page.evaluate(()=>window.__world.daylight.state);
  await page.goto(base);
  await ready();
  assert.equal((await state()).clock,'12:00');
  assert.equal((await state()).mode,'live');
  await page.evaluate(()=>{
    document.getElementById('start').click();
    document.exitPointerLock?.();
    window.switched=[];
    window.__world.K.onNight(value=>switched.push(value));
  });
  for (const [mode,phase,east] of [['sunrise','아침',1],['day','낮',0],['sunset','노을',-1],['night','밤',0]]) {
    await page.selectOption('#sky-mode',mode);
    const s=await state();
    assert.equal(s.phase,phase);
    assert.equal(s.mode,mode);
    if(east) assert.equal(Math.sign(s.direction[0]),east);
    if(shots){
      await page.evaluate(()=>{document.body.classList.add('shot');});
      await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
      await page.screenshot({path:join(shots,mode+'.jpg'),type:'jpeg',quality:92});
      await page.evaluate(()=>document.body.classList.remove('shot'));
    }
  }
  assert.deepEqual(await page.evaluate(()=>window.switched),[false,true]);
  await page.reload(); await ready();
  assert.equal((await state()).mode,'night');
  await page.keyboard.press('Shift+N');
  assert.equal((await state()).mode,'live');
  // Resume after Seoul midnight: one frame must pick the new day even in a different browser time zone.
  await page.evaluate(()=>{window.testInstant=Date.parse('2026-11-27T00:03:00+09:00');document.dispatchEvent(new Event('visibilitychange'));});
  assert.equal((await state()).phase,'밤');
  assert.equal((await state()).clock,'00:03');
  await page.keyboard.press('n'); assert.equal((await state()).mode,'day');
  await page.keyboard.press('n'); assert.equal((await state()).mode,'night');
  await page.goto(base+'&shot=1'); await ready(); assert.equal((await state()).mode,'day');
  await page.goto(base+'&night=1'); await ready(); assert.equal((await state()).mode,'night');
  await page.evaluate(()=>window.__world.setTimeMode('live'));
  assert.ok(!new URL(page.url()).searchParams.has('night'));
  assert.deepEqual(errors,[]);
  assert.deepEqual(await page.evaluate(()=>window.__world.errors),[]);
  console.log('Passed KMA rise/set, both solstices, four browser skies, Seoul midnight, night lights, area reload and keyboard controls.');
} finally { await browser.close(); await new Promise(r=>server.close(r)); }
