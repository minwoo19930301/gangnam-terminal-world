// Real E-menu round trip from the public 8F main-wing landing.
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { serve } from './serve.mjs';
import { upperPlanPoint } from '../js/places/shinsegae.js';
import { departmentPoint } from '../js/places/shinsegae-b1-plan.js';

const server = await serve(0);
const browser = await chromium.launch({channel:'chromium',headless:true,args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});
try {
  const page = await browser.newPage();
  const [front,v] = upperPlanPoint('8F',264*1823/600,180*1367/450);
  const [x,z] = departmentPoint(front-1.4,v-1.35);
  const [tx,tz] = departmentPoint(front,v-1.35);
  const yaw = Math.atan2(x-tx,z-tz)*180/Math.PI;
  await page.goto(`http://127.0.0.1:${server.address().port}/?q=low#/shinsegae/8F?p=${x},35.8,${z},${yaw}`);
  await page.waitForFunction(()=>window.__world?.ready);
  await page.locator('#start').click();
  const markers = await page.evaluate(()=>{
    const cars=__world.K._.elevators.filter(e=>e.place==='shinsegae');
    return Object.fromEntries(['B1','1F','7F','8F','11F'].map(f=>[f,cars.filter(e=>e.floors.some(s=>s.label===f)).map(e=>e.name)]));
  });
  for(const floor of ['7F','8F','11F']){
    assert.equal(markers[floor].filter(n=>n.includes('신관 화장실 옆')).length,2);
    assert(!markers[floor].some(n=>/마켓 엘리베이터|남동 고객|북서 고객|신세계 지하/.test(n)));
  }
  assert(!markers['11F'].some(n=>n.includes('본관 화장실 옆')));
  await page.keyboard.down('w');
  await page.waitForTimeout(150);
  await page.keyboard.up('w');
  for(const [floor,height] of [['7F',31],['8F',35.8]]){
    await page.keyboard.press('e');
    await page.locator('#elev:not(.hidden) .elev-list button').filter({has:page.getByText(floor,{exact:true})}).click();
    await page.waitForFunction(y=>Math.abs(__world.player.y-y)<.1,height);
    const zone=await page.evaluate(()=>{const {phys,player:p}=__world;return phys.zoneAt(p.x,p.y+.1,p.z)?.name;});
    assert.equal(zone,'본관 고객 엘리베이터');
    console.log(floor,height,zone,'지도 승강기 수',markers[floor].length);
  }
} finally {
  await browser.close();
  server.close();
}
