import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {serve} from './serve.mjs';

const server=await serve();
const browser=await chromium.launch({channel:'chromium',args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});
const url='http://127.0.0.1:'+server.address().port+'/?q=low&traffic=0&fixedres=1#/';
const errors=[];

async function position(page){
  return page.evaluate(()=>{
    const {player,phys}=__world;
    const {x,y,z}=player;
    const space=phys.zoneAt(x,y+.1,z);
    return {x,y,z,floor:space?.floor,name:space?.name};
  });
}
async function walk(page,key,ms){
  await page.keyboard.down(key);
  try { await page.waitForTimeout(ms); } finally { await page.keyboard.up(key); }
  return position(page);
}
async function choose(page,route,name,subtitle){
  await page.goto(url+route);
  await page.waitForFunction(()=>window.__world?.ready,null,{timeout:120000});
  if(await page.locator('#start').isVisible())await page.locator('#start').click();
  await page.keyboard.press('m');
  await page.locator('#map-search').fill(name);
  let row=page.locator('.gt-result').filter({has:page.getByText(name,{exact:true})});
  if(subtitle)row=row.filter({hasText:subtitle});
  assert.equal(await row.count(),1,name);
  await row.click();
  await page.locator('.gt-teleport').click();
  await page.waitForFunction(()=>window.__world?.ready&&!__world.map.isOpen(),null,{timeout:20000});
  return position(page);
}
try {
  const page=await browser.newPage({viewport:{width:850,height:550}});
  page.on('pageerror',e=>errors.push(e.message));
  for (const name of ['25m 6레인 수영장','키즈풀','스쿠버 다이빙 풀']){
    const start=await choose(page,'jwmarriott/B3',name);
    assert.equal(start.name,name);
    assert.equal(start.floor,'B3');
    assert.ok(Math.abs(start.y+16)<.08);
    const side=await walk(page,'a',500);
    assert.ok(Math.hypot(side.x-start.x,side.z-start.z)>1.2);
    const end=await walk(page,'d',500);
    assert.ok(Math.abs(side.y-start.y)<.08&&Math.abs(end.y-start.y)<.08);
    console.log(name,'dry deck',start.y,side.y,end.y);
  }
  const boarding=await choose(page,'jwmarriott/3F','연회장 에스컬레이터');
  assert.equal(boarding.floor,'3F');
  await walk(page,'w',540);
  await page.waitForFunction(h=>__world.player.y>h+8.5,boarding.y,{timeout:40000});
  const foyer=await walk(page,'w',650);
  assert.equal(foyer.floor,'5F');
  console.log('ballroom escalator',boarding.y,foyer.y);

  const upper=await choose(page,'gotomall/B1','G13 출구 계단','상부 계단참');
  assert.equal(upper.floor,'B1');
  assert.ok(Math.abs(upper.y+2)<.08);
  const pavement=await walk(page,'w',1300);
  assert.equal(pavement.floor,'지상');
  const lower=await choose(page,'gotomall/B1','G13 출구 계단','버스정류장');
  assert.equal(lower.floor,'B1');
  assert.ok(lower.y<upper.y-1);
  console.log('G13 lower, upper and pavement',lower.y,upper.y,pavement.y);
  assert.deepEqual(errors,[]);
} finally {
  await browser.close();
  await new Promise(resolve=>server.close(resolve));
}
