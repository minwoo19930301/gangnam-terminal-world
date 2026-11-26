// node tests/jw-fixture-streaming.mjs [--gpu]
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {serve} from './serve.mjs';

const server=await serve();
const origin='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch(process.argv.includes('--gpu')
  ? {channel:'chromium',args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']}
  : {args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const page=await browser.newPage({viewport:{width:840,height:525}});
const requests=[],errors=[];
const interior=/\/assets\/models\/jwmarriott\/(cakes|booth|display|herbs|tea)\.js/;
page.on('pageerror',error=>errors.push(error.message));
await page.route(interior,async route=>{
  const url=new URL(route.request().url());
  requests.push(url);
  if(url.pathname.endsWith('/tea.js')&&!url.search) return route.fulfill({status:503,body:'Try again'});
  return route.continue();
});
async function enter(hash, fresh = false) {
  const building = hash.split('/')[0];
  const query = fresh ? '&visit=' + building : '';
  await page.goto(origin + '/?q=low&traffic=0' + query + '#/' + hash);
  await page.waitForFunction(place => window.__world?.ready && __world.area.includes(place), building, {timeout:120000});
  if (await page.locator('#start').isVisible()) await page.locator('#start').click();
  await page.waitForFunction(() => performance.now() > __world.timing.ready + 500);
}
async function turnTowardTea() {
  await page.waitForFunction(() => !!document.pointerLockElement);
  await page.evaluate(() => document.dispatchEvent(new MouseEvent('mousemove', {
    bubbles: true, movementX: Math.round(Math.PI / .0022), movementY: 120,
  })));
  await page.waitForFunction(() => Math.abs(__world.player.yaw) < .01 && __world.player.pitch < -.25);
}
async function checkFixture(key) {
  await page.waitForFunction(name=>__world.K._.details.some(d=>d.name==='JW 메리어트 · '+name&&d.built&&d.renderables?.length),key,{timeout:35000});
}
try {
  for(const address of ['shinsegae/B1','gotomall/B1','jwmarriott/1F']) {
    await enter(address, true);
    assert.equal(requests.length,0,address+' loads no hotel interior fixture');
  }
  const seat='jwmarriott/8F?p=-14.0767,35.5,138.6668,';
  await enter(seat+'180,0');
  await page.waitForTimeout(1000);
  assert.equal(requests.length,0,'facing the opposite direction loads no tea service');
  await turnTowardTea();
  await checkFixture('tea');
  assert.deepEqual(requests.map(url=>[url.pathname.split('/').at(-1),url.search]),[['tea.js',''],['tea.js','?retry=2']]);
  await enter('jwmarriott/2F?p=-27.8493,6,120.1308,0,-9.44');
  await checkFixture('cakes');
  await enter(seat+'0,-15.19');
  await checkFixture('tea');
  assert.equal(requests.filter(url=>url.pathname.endsWith('/tea.js')).length,2,'same-floor address and warm revisit reuse the successful packet');
  assert.equal(requests.filter(url=>url.pathname.endsWith('/cakes.js')).length,1);
  assert.deepEqual(await page.evaluate(()=>__world.K._.detailErrors),[]);
  assert.deepEqual(errors,[]);
  console.log('Two remote malls and the hotel lobby loaded no interior packet. The 8F tea service recovered after HTTP 503 and remained available after a return from the 2F cake counter.');
} finally {
  await browser.close();
  await new Promise(resolve=>server.close(resolve));
}
