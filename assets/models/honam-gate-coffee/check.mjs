import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {serve} from '../../../tests/serve.mjs';
import {terminalPoint as P,terminalRotation as R} from '../../../js/places/sweet-park-plan.js';

const server=await serve(0),browser=await chromium.launch({channel:'chromium',args:['--use-angle=metal','--ignore-gpu-blocklist']});
const base='http://127.0.0.1:'+server.address().port+'/?q=low&fixedres=1&traffic=0#/';
try {
  const page=await browser.newPage({viewport:{width:900,height:560}});
  const errors=[], requests=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('response',r=>{if(r.url().endsWith('/honam-gate-coffee/front.glb'))requests.push(r.status());});
  const ready=()=>page.waitForFunction(()=>window.__world?.ready,null,{timeout:90000});
  async function open(path) {
    await page.goto(base+path);await ready();
    if(await page.locator('#start').isVisible())await page.locator('#start').click();
  }
  async function walk(s,t) {
    const [x,z]=P(s,t);
    await page.evaluate(([x,z])=>{const a=__world.player;a.yaw=Math.atan2(a.x-x,a.z-z);},[x,z]);
    await page.keyboard.down('w');
    try {
      await page.waitForFunction(([x,z])=>Math.hypot(__world.player.x-x,__world.player.z-z)<.25,[x,z],{timeout:12000});
    }finally{await page.keyboard.up('w');}
    return page.evaluate(()=>({y:__world.player.y,zone:document.getElementById('zone').textContent}));
  }
  await open('newcore/5F');
  assert.equal(requests.length,0);
  await page.keyboard.press('m');await page.locator('#map-search').fill('스벅 호남선');
  const row=page.locator('.gt-result').filter({hasText:'스타벅스 센트럴시티점 입구'});
  assert.equal(await row.count(),1);
  await row.click();await page.locator('.gt-teleport').click();
  await page.waitForFunction(()=>window.__world?.ready&&!__world.map.isOpen()&&__world.area.includes('centralcity'));
  const shop=await walk(171.9,15.46);
  assert.match(shop.zone,/스타벅스 센트럴시티점/);assert.ok(Math.abs(shop.y-.96)<.05);
  await page.waitForTimeout(400);assert.deepEqual(requests,[200]);
  console.log('다른 건물에서 검색, 계단을 올라 매장 진입',shop);
  const [x,z]=P(177.1,22);
  await open('famille/1F?p='+[x,0,z,R*180/Math.PI,0].join(','));
  assert.ok((await walk(167.8,22)).y>1.28);
  await walk(149.2,22);await walk(149.2,15.46);
  const again=await walk(171.9,15.46);
  assert.match(again.zone,/스타벅스 센트럴시티점/);assert.ok(Math.abs(again.y-.96)<.05);
  await walk(160,15.46);
  console.log('파미에 → 1게이트 반계단 → 호남선 대합실 → 스타벅스 → 대합실 왕복',again);
  assert.deepEqual(errors,[]);assert.deepEqual(await page.evaluate(()=>__world.errors),[]);
}finally{await browser.close();await new Promise(r=>server.close(r));}
