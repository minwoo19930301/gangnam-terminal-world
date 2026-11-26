// node tests/another-palm.mjs — verify the public pop-up across the Seoul date boundaries.
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {serve} from './serve.mjs';
import {sweetParkPoint} from '../js/places/sweet-park-plan.js';

const server=await serve();
const browser=await chromium.launch({channel:'chromium',args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});
const object='어나더팜 · 아톰 에디션';
const errorMessages=[];
async function visit(target,date) {
  const page=await browser.newPage({viewport:{width:896,height:546}});
  const requests=[];
  page.on('request',r=>{if(r.url().endsWith('/another-palm-astro/display.glb'))requests.push(r.url());});
  page.on('pageerror',e=>errorMessages.push(e.message));
  await page.clock.setFixedTime(new Date(date));
  const [x,z]=sweetParkPoint(1173,840),[tx,tz]=sweetParkPoint(1173,target);
  const yaw=Math.atan2(x-tx,z-tz)*180/Math.PI;
  await page.goto('http://127.0.0.1:'+server.address().port+'/?q=low&fixedres=1#/centralcity/B1?p='+[x,-6,z,yaw].join(','));
  await page.waitForFunction(()=>window.__world?.ready,null,{timeout:90000});
  await page.locator('#start').click();
  await page.waitForFunction(name=>!!__world.scene.getObjectByName(name),object);
  return {page,requests};
}
try {
  const {page,requests}=await visit(818,'2026-11-19T14:59:59.999Z');
  for(const [date,visible,expected] of [
    ['2026-11-19T14:59:59.999Z',false,0],['2026-11-19T15:00:00Z',true,1],
    ['2026-12-10T14:59:59.999Z',true,1],['2026-12-10T15:00:00Z',false,1]
  ]) {
    await page.clock.setFixedTime(new Date(date));
    await page.waitForFunction(([name,v])=>{
      const mesh=__world.scene.getObjectByName(name).children[0];
      return mesh.visible===v && (!v || mesh.geometry.attributes.position.count>24);
    },[object,visible]);
    assert.equal(requests.length,expected,date);
  }
  await page.close();
  for(const [target,date] of [[870,'2026-11-27T03:00:00Z'],[818,'2026-12-11T03:00:00Z']]) {
    const cold=await visit(target,date);
    await cold.page.waitForTimeout(900);
    assert.equal(cold.requests.length,0);
    await cold.page.close();
  }
  assert.deepEqual(errorMessages,[]);
  console.log('Seoul opening, final day, midnight close and cold back-facing demand passed.');
} finally {
  await browser.close();
  await new Promise(resolve=>server.close(resolve));
}
