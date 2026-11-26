// Verify view-gated loading, recoverable failure and cached return on a normal shop page.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {chromium} from 'playwright';
import {serve} from '../../../tests/serve.mjs';

const camera = JSON.parse(await readFile(new URL('./camera.json',import.meta.url),'utf8'));
const server = await serve(0);
const origin = 'http://127.0.0.1:' + server.address().port;
let browser;
try {
  browser = await chromium.launch(process.argv.includes('--gpu')
    ? {channel:'chromium',args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']}
    : {args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  const page = await browser.newPage({viewport:{width:1100,height:720}});
  const errors = [];
  const asset = '/assets/models/ssg-marzocco/gallery.glb';
  let attempts = 0;
  page.on('pageerror',error => errors.push(error.message));
  await page.route('**/*',route => {
    const url = new URL(route.request().url());
    if (url.origin !== origin) return route.abort();
    if (url.pathname === asset && ++attempts === 1) return route.fulfill({status:503});
    return route.continue();
  });
  const query = new URLSearchParams({pos:[camera.x,40.6,camera.z],yaw:camera.yaw,pitch:85});
  await page.goto(origin + '/?' + query + '#/shinsegae/9F');
  await page.waitForFunction(name => window.__world?.ready && window.__world.scene.getObjectByName(name),
    camera.meshName,{timeout:90000});
  const look = degrees => page.evaluate(value => {window.__world.player.pitch = value*Math.PI/180;},degrees);
  await page.waitForTimeout(500);
  assert.equal(attempts,0,'looking at the ceiling downloaded the fixtures');
  const rejected = page.waitForResponse(response =>
    new URL(response.url()).pathname === asset && response.status() === 503);
  await look(camera.pitch);
  await rejected;
  assert.ok(await page.evaluate(name => {
    const slot = window.__world.scene.getObjectByName(name);
    const fallback = slot.parent.children[0];
    return !slot.visible && fallback.visible && fallback.children.length === 1 &&
      fallback.children[0].geometry.getAttribute('position').count > 0;
  },camera.meshName),'the low-detail display must remain usable after a failed request');
  await look(85);
  await page.waitForTimeout(5400);
  assert.equal(attempts,1,'the retry fired outside the view');
  await look(camera.pitch);
  await page.waitForFunction(name => {
    const slot = window.__world.scene.getObjectByName(name);
    return slot.visible && slot.geometry.getAttribute('position')?.count > 0 && !slot.parent.children[0].visible;
  },camera.meshName,{timeout:30000});
  assert.equal(attempts,2,'retry did not recover exactly once');
  const floor = y => page.evaluate(y => {const p=window.__world.player;p.teleport(p.x,y,p.z);},y);
  await floor(50.2);
  await page.waitForFunction(name => !window.__world.scene.getObjectByName(name).parent.visible,camera.meshName);
  await floor(40.6);
  await page.waitForFunction(name => {
    const mesh=window.__world.scene.getObjectByName(name);
    for (let o=mesh;o;o=o.parent) if (!o.visible || !o.layers.isEnabled(0)) return false;
    return true;
  },camera.meshName);
  assert.equal(attempts,2,'returning to the same shop fetched it again');
  assert.deepEqual(errors,[]);
  assert.deepEqual(await page.evaluate(() => window.__world.errors),[]);
  console.log('Ceiling 0 requests, recoverable error 1, hidden retry 0, visible retry 1, saved-floor return 0.');
} finally {
  if (browser) await browser.close();
  await new Promise(resolve => server.close(resolve));
}
