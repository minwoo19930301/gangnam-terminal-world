// The arrival must retain the editable front while the full cinema mesh is in flight.
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {serve} from './serve.mjs';

const server=await serve();
const browser=await chromium.launch({channel:'chromium',args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});
const page=await browser.newPage({viewport:{width:744,height:464}});
const errors=[];
page.on('pageerror',error=>errors.push(error.message));
let release;
const hold=new Promise(resolve=>{release=resolve;});
let requests=0;
await page.route('**/megabox-central/entrance.glb',async route=>{
  requests++;
  await hold;
  await route.continue();
});
const subject='메가박스 센트럴 · 부티크 아치 입면';
const indexCount=()=>page.evaluate(name=>__world.scene.getObjectByName(name)?.geometry.index.count,subject);
try{
  await page.goto('http://127.0.0.1:'+server.address().port+'/?q=low&traffic=0#/shinsegae/B1?destination=megabox');
  await page.waitForFunction(()=>window.__world?.ready,null,{timeout:120000});
  assert.equal(await indexCount(),3771);
  await page.waitForTimeout(1200);
  assert.equal(requests,1);
  assert.equal(await indexCount(),3771);
  const response=page.waitForResponse(r=>r.url().endsWith('/megabox-central/entrance.glb'));
  release();
  const full=await response;
  assert.equal(full.status(),200);
  assert.equal((await full.body()).length,148244);
  await page.waitForFunction(name=>__world.scene.getObjectByName(name)?.geometry.index.count===43422,subject);
  assert.equal(requests,1);
  assert.deepEqual(errors,[]);
  console.log('Megabox arrival retained 1,257 front triangles throughout the delayed request, then displayed all 14,474 triangles.');
}finally{
  release();await browser.close();await new Promise(resolve=>server.close(resolve));
}
