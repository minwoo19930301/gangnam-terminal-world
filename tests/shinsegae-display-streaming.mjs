// node tests/shinsegae-display-streaming.mjs [--gpu]
// Exercise upper-floor Blender data through the public elevator and map.
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {serve} from './serve.mjs';

const server = await serve();
const base = 'http://127.0.0.1:' + server.address().port;
const browser = await chromium.launch(process.argv.includes('--gpu')
  ? {channel:'chromium',args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']}
  : {args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const page = await browser.newPage({viewport:{width:900,height:600}});
const requests = [], errors = [];
const packet = '**/assets/models/shinsegae/displays.js*';
page.on('pageerror', error => errors.push(error.message));
await page.route(packet, route => {
  requests.push(route.request().url());
  return requests.length === 1 ? route.abort() : route.continue();
});
async function enter(address) {
  await page.goto(base+'/?q=low&traffic=0#/'+address);
  await page.waitForFunction(() => window.__world?.ready,null,{timeout:120000});
  if (await page.locator('#start').isVisible()) await page.locator('#start').click();
}
async function ride(floor) {
  await page.locator('#prompt.show').filter({hasText:'엘리베이터'}).waitFor();
  await page.keyboard.press('e');
  await page.locator('#elev button').filter({has:page.locator('b',{hasText:new RegExp('^'+floor+'$')})}).click();
  await page.waitForFunction(target => location.hash.startsWith('#/shinsegae/'+target+'?'),floor);
}
try {
  await enter('shinsegae/B1');
  const lobby = await page.evaluate(() => {
    const door = window.__world.K._.interactables.find(i => Math.abs(i.y+6)<.15 &&
      i.elevator?.floors.some(f=>f.label==='6F'));
    return [door.x,-6,door.z,0].join(',');
  });
  await enter('shinsegae/B1?p='+lobby);
  assert.equal(requests.length,0,'B1 needs no upper-floor mesh data');
  await ride('6F');
  await ride('B1');
  assert.match(await page.locator('#zone').innerText(),/B1/);
  // Reach the specific store through its normal shared-camera address.
  await enter('shinsegae/6F?p=-17.18059,26.2,92.82488,-162.672,-5');
  await page.waitForFunction(() => __world.K._.details.some(d =>
    d.name === '리모와' && d.resource?.ready && d.built && d.renderables?.length),null,{timeout:30000});
  assert.equal(requests.length,2,'one failed load and one successful retry');
  await page.waitForTimeout(300);
  assert.deepEqual(errors,[]);
  assert.deepEqual(await page.evaluate(()=>__world.K._.detailErrors),[]);
  console.log('B1 → 6F → B1 by elevator; visible RIMOWA fixtures recovered after one failed download.');
} finally {
  await browser.close();
  await new Promise(resolve=>server.close(resolve));
}
