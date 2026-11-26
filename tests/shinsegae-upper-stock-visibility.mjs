// node tests/shinsegae-upper-stock-visibility.mjs [--gpu]
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {serve} from './serve.mjs';

const server = await serve();
const base = 'http://127.0.0.1:'+server.address().port+'/?q=low&traffic=0';
const browser = await chromium.launch(process.argv.includes('--gpu')
  ? {channel:'chromium',args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']}
  : {args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});

try {
  const page = await browser.newPage({viewport:{width:880,height:550}});
  const errors = [];
  page.on('pageerror', error=>errors.push(error.message));
  await page.goto(base+'#/shinsegae/B1?destination=megabox');
  await page.waitForFunction(()=>window.__world?.ready);
  await page.locator('#start').click();
  assert.equal(await page.evaluate(()=>__world.K._.details.some(d=>d.built && d.name.includes('매장 진열 · '))),false);

  // On the public aisle beside Barrel, the camera looks farther into the annex.
  // Previously the stock loader tested only the main wing behind this shopper.
  await page.goto(base+'&visit=annex#/shinsegae/8F?p=-38.08089,35.8,82.19013,161,0');
  await page.waitForFunction(()=>window.__world?.ready);
  await page.locator('#start').click();
  await page.waitForFunction(()=>__world.K._.details.some(d=>
    d.name==='8F 매장 진열 · 신관' && d.built && d.renderables?.length));
  const built = await page.evaluate(()=>__world.K._.details.filter(d=>d.built && d.name.includes('매장 진열 · ')).map(d=>d.name));
  assert.ok(!built.includes('8F 매장 진열 · 본관 북측'));
  assert.ok(built.every(name=>name.startsWith('8F')));
  const start = await page.evaluate(()=>({x:__world.player.x,z:__world.player.z}));
  await page.keyboard.down('w');
  try {
    await page.waitForFunction(p=>Math.hypot(__world.player.x-p.x,__world.player.z-p.z)>.48,start);
  } finally { await page.keyboard.up('w'); }
  assert.equal(await page.evaluate(()=>__world.player.y),35.8);
  assert.deepEqual(await page.evaluate(()=>__world.K._.detailErrors),[]);
  assert.deepEqual(errors,[]);
  console.log('8F annex stock is visible from the sports aisle. Distant and basement arrivals keep unused areas asleep.');
} finally {
  await browser.close();
  server.close();
}
