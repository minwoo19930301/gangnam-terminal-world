// Normal 6F play, deferred native detail and the public walking strip.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';
import { serve } from '../../../tests/serve.mjs';

const directory = process.argv[2];
if (directory) await fs.mkdir(directory, {recursive: true});
const server = await serve(0);
const browser = await chromium.launch({channel: 'chromium', args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist']});
const page = await browser.newPage({viewport: {width: 1110, height: 735}, deviceScaleFactor: 1});
const base = 'http://127.0.0.1:' + server.address().port + '/index.html?fixedres=1#/gyeongbu/';
const key = '경부선 6층 · 아동복 철망 진열과 접은 상품';
const requests = [], proxies = [], errors = [];
page.on('response', response => {
  if (response.url().endsWith('/gyeongbu-childrens-aisle/childrens-aisle.glb')) requests.push(response.status());
  if (response.url().endsWith('/gyeongbu-childrens-aisle/proxy.js')) proxies.push(response.status());
});
page.on('pageerror', error => errors.push(error.message));

const xy = (u, v) => [2.3 + u*.9348 + v*.3552, -59.24 - u*.3552 + v*.9348];
const forward = -159.194;
async function visit(floor, u, v, h, yaw) {
  const [x,z] = xy(u,v);
  await page.goto('about:blank');
  await page.goto(base + floor + '?p=' + [x,h,z,yaw].join(','));
  await page.waitForFunction(() => window.__world?.ready, null, {timeout: 150000});
  await page.evaluate(() => {
    document.getElementById('start').click();
    window.__world.setTimeMode('day');
  });
  await page.waitForTimeout(360);
}

async function pose(u,v,angle=forward,pitch=0) {
  const [x,z] = xy(u,v);
  await page.evaluate(p => Object.assign(window.__world.player,p),
    {x,z,y:25,vy:0,yaw:angle*Math.PI/180,pitch:pitch*Math.PI/180});
  await page.waitForTimeout(320);
}

async function mesh(detailed) {
  await page.waitForFunction(([key, wanted]) => {
    const body = window.__world.scene.getObjectByName(key)?.children[0];
    return body && Boolean(body.material.map) === wanted && (wanted || body.geometry.index.count > 100);
  },[key,detailed],{timeout:15000});
  return page.evaluate(key => {
    const root=window.__world.scene.getObjectByName(key), body=root.children[0], m=body.material;
    return {triangles:body.geometry.index.count/3,draws:root.children.length,
      atlas:m.map?.image.width||0, textiles:!!m.roughnessMap&&!!m.metalnessMap,
      fluorescent:!!m.emissiveMap, vertexColor:!!body.geometry.attributes.color};
  },key);
}

try {
  await visit('7F',38,109.5,29.5,forward);assert.deepEqual(requests,[],'7F requested the 6F asset');assert.deepEqual(proxies,[]);
  await visit('6F',38,101.3,25,forward+180);assert.deepEqual(requests,[],'stock was behind the player');assert.deepEqual(proxies,[]);
  await pose(38,83);const distant=await mesh(false);
  assert.deepEqual(requests,[]);assert.equal(distant.draws,1);assert.ok(distant.triangles>100&&distant.triangles<3500);
  await pose(38.05,104.72);const close=await mesh(true);
  assert.ok(close.textiles&&close.fluorescent&&close.vertexColor&&close.draws===1);
  assert.equal(close.atlas,1024);assert.ok(close.triangles>7000&&close.triangles<26000);
  await page.keyboard.down('w');
  try {
    await page.waitForFunction(([x,z]) => Math.hypot(window.__world.player.x-x,window.__world.player.z-z)>9.0,
      xy(38.05,104.72),{timeout:15000});
  } finally {await page.keyboard.up('w');}
  const walk=await page.evaluate(() => {
    const world=window.__world, p=world.player, phys=world.phys;
    const xy=(u,v)=>[2.3+u*.9348+v*.3552,-59.24-u*.3552+v*.9348];
    function push(u,v) {
      const [x,z]=xy(u,v), a={x,z};
      phys.resolve(a,.32,25,26.75,.50);
      return Math.hypot(a.x-x,a.z-z);
    }
    const blocked=[];
    for(const u of [36.75,37.30,38.0,38.80])for(let v=105.4;v<113.5;v+=.20) {
      const [x,z]=xy(u,v);
      if(push(u,v)>.035||Math.abs(phys.support(x,z,25.45).y-25)>.1)blocked.push([u,+v.toFixed(2)]);
    }
    return {area:world.area,floor:p.y,blocked,rail:push(36.44,109.5),
      tables:[push(39.09,108.12),push(39.09,111.03)],
      ceilings:[101,109,118].map(v=>phys.ceilingAbove(...xy(38,v),26.6,29.2))};
  });
  assert.equal(walk.area,'in:gyeongbu');assert.ok(Math.abs(walk.floor-25)<.1);assert.deepEqual(walk.blocked,[]);
  assert.ok(walk.rail>.06&&walk.tables.every(x=>x>.06));assert.ok(walk.ceilings.every(h=>Math.abs(h-27.925)<.015));
  await pose(38.05,104.72,-161.285,-3);
  const modes=[];
  for(const mode of ['sunrise','day','sunset','night','live']) {
    modes.push(await page.evaluate(async mode=>{
      const w=window.__world;w.setTimeMode(mode);
      await new Promise(done=>requestAnimationFrame(()=>requestAnimationFrame(done)));
      return w.daylight.state.mode;
    },mode));
    if(directory&&['day','night'].includes(mode))await page.screenshot({path:path.join(directory,mode+'.png')});
  }
  assert.deepEqual(modes,['sunrise','day','sunset','night','live']);
  await pose(38,84);await mesh(false);
  await pose(38.03,108.07,149.949,-5);await mesh(true);
  assert.deepEqual(requests,[200]);assert.deepEqual(proxies,[200]);assert.deepEqual(errors,[]);
  console.log(JSON.stringify({distant,close,walk,modes,requests,proxies,errors},null,2));
} finally {
  await browser.close();await new Promise(done=>server.close(done));
}
