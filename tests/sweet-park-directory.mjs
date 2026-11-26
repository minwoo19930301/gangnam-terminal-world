// Enter the public sales floor through the normal search UI and check a cold room load.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {chromium} from 'playwright';
import {serve} from './serve.mjs';
import {sweetParkPoint} from '../js/places/sweet-park-plan.js';

const {centralcity}=JSON.parse(await readFile(new URL('../js/places/_meta.json',import.meta.url)));
const names=['하츠베이커리','포트넘앤메이슨','어나더팜','파이브가이즈','버터베이커리'];
for(const name of names)assert.equal(centralcity.mapDestinations.filter(row=>row.name===name).length,1,name);
assert.ok(!centralcity.mapDestinations.some(row=>['스탠다드브레드','르뱅룰즈','OPENING SOON'].includes(row.name)));
const server=await serve();
const root='http://127.0.0.1:'+server.address().port+'/?q=low&fixedres=1&traffic=0';
const browser=await chromium.launch({channel:'chromium',args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});
const errors=[];
const assets=[];
async function open(route) {
  const page=await browser.newPage({viewport:{width:820,height:520}});
  page.on('pageerror',e=>errors.push(e.message));
  page.on('response',r=>{if(r.url().endsWith('/fortnum-tea-shop/tea-shop.glb'))assets.push(r.status());});
  await page.goto(root+route);
  await page.waitForFunction(()=>window.__world?.ready&&__world.player,null,{timeout:120000});
  if(await page.locator('#start').isVisible())await page.locator('#start').click();
  return page;
}
async function visit(page,query,name) {
  const expected=centralcity.mapDestinations.find(r=>r.name===name);
  await page.keyboard.press('m');
  await page.locator('#map-search').fill(query);
  const row=page.locator('.gt-result').filter({has:page.getByText(name,{exact:true})}).filter({hasText:'매장 입구'});
  assert.equal(await row.count(),1,query);
  await row.click();
  await page.locator('.gt-teleport').click();
  await page.waitForFunction(target=>{
    const w=window.__world,p=w?.player;
    return w?.ready&&p&&!w.map.isOpen()&&Math.hypot(p.x-target.x,p.z-target.z)<.3&&Math.abs(p.y+6)<.08;
  },expected,{timeout:90000});
  if(await page.locator('#start').isVisible())await page.locator('#start').click();
  const real=await page.evaluate(()=>{
    const w=__world,p=w.player,zone=w.phys.zoneAt(p.x,p.y+.1,p.z);
    return {floor:zone?.floor,place:zone?.place,pitch:p.pitch,errors:w.errors};
  });
  assert.equal(real.floor,'B1',name);
  assert.equal(real.place,'centralcity',name);
  if(expected.pitchDeg!==undefined)assert.ok(Math.abs(real.pitch-expected.pitchDeg*Math.PI/180)<.012,name);
  assert.deepEqual(real.errors,[]);
}
try{
  const page=await open('#/newcore/3F');
  await visit(page,'Fortnum & Mason','포트넘앤메이슨');
  for(let i=0;i<60&&!assets.length;i++)await page.waitForTimeout(100);
  assert.deepEqual(assets,[200],'one tea shop at the public entrance');
  for(const [query,name]of [['HAZ Bakery',names[0]],['Another Palm',names[2]],['Five Guys',names[3]],['버터베이커리',names[4]]])await visit(page,query,name);
  await page.close();
  const [x,z]=sweetParkPoint(1189,521),a=centralcity.mapDestinations.find(r=>r.name==='포트넘앤메이슨');
  const away=await open('#/centralcity/B1?p='+[x,-6,z,180+a.yaw*180/Math.PI].join(','));
  await away.waitForTimeout(1300);
  assert.deepEqual(assets,[200],'no tea shop request facing away');
  await away.close();
  assert.deepEqual(errors,[]);
  console.log('Five named Sweet Park counters, cross-area and local approaches, floor, sightline and cold loading passed.');
}finally{await browser.close();await new Promise(r=>server.close(r));}
