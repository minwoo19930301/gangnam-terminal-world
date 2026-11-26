// Select the restaurant on the public map, enter the dining room and return to its mat.
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {serve} from '../../../tests/serve.mjs';

const server=await serve(),browser=await chromium.launch({channel:'chromium',
  args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});
try{
  const page=await browser.newPage({viewport:{width:900,height:560}});
  const errors=[],loads=[];
  page.on('pageerror',error=>errors.push(error.message));
  page.on('response',res=>{if(res.url().endsWith('/gyeongbu-yukgak/shop.glb'))loads.push(res.status());});
  await page.goto('http://127.0.0.1:'+server.address().port+'/?q=low&fixedres=1#/gyeongbu/8F');
  await page.waitForFunction(()=>window.__world?.ready);await page.locator('#start button').click();
  assert.deepEqual(loads,[]);
  await page.keyboard.press('m');await page.locator('#map-search').fill('육각고기');
  const row=page.locator('.gt-result').filter({has:page.locator('b').getByText('육각고기',{exact:true})});
  assert.equal(await row.count(),1);await row.click();await page.locator('.gt-teleport').click();
  await page.waitForFunction(()=>__world.scene.getObjectByName('경부선 육각고기 · 공개 식당 입구')?.children[0].geometry.attributes.position.count>1000);
  const position=()=>page.evaluate(()=>{const w=__world,p=w.player;return {x:p.x,y:p.y,z:p.z,
    zone:w.phys.zoneAt(p.x,p.y+.1,p.z)?.name,roof:w.phys.ceilingAbove(p.x,p.z,p.y+.65,p.y+9),
    lost:w.renderer.getContext().isContextLost(),errors:[...w.errors,...w.K._.detailErrors]};});
  const start=await position();
  assert.equal(start.zone,'육각고기');assert.equal(start.roof,Infinity);
  await page.keyboard.down('w');
  await page.waitForFunction(()=>{const w=__world,p=w.player;return w.phys.zoneAt(p.x,p.y+.1,p.z)?.name==='육각고기';});
  await page.waitForFunction(([x,z])=>Math.hypot(x-__world.player.x,z-__world.player.z)>3.32,[start.x,start.z],{timeout:4500});
  await page.keyboard.up('w');
  const dining=await position();assert.equal(dining.y,43);assert.equal(dining.zone,'육각고기');
  assert.ok(Math.abs(dining.roof-45.59)<.02);assert.ok(Math.hypot(start.x-dining.x,start.z-dining.z)>3.20);
  await page.keyboard.down('s');
  await page.waitForFunction(([x,z])=>Math.hypot(x-__world.player.x,z-__world.player.z)<.20,[start.x,start.z],{timeout:5000});
  await page.keyboard.up('s');const returned=await position();
  assert.equal(returned.zone,'육각고기');assert.equal(returned.roof,Infinity);
  for(const sample of [start,dining,returned]){assert.deepEqual(sample.errors,[]);assert.equal(sample.lost,false);}
  assert.deepEqual(loads,[200]);assert.deepEqual(errors,[]);
  console.log(JSON.stringify({start,dining,returned,loads,errors}));
}finally{await browser.close();server.close();}
