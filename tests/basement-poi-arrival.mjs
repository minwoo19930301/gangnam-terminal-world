// Open an OSM basement pin from another area through the same map control as a shopper.
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {serve} from './serve.mjs';

const server=await serve(0);
const browser=await chromium.launch({channel:'chromium',args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});
try{
  const page=await browser.newPage({viewport:{width:960,height:600}});
  const errors=[];
  page.on('pageerror',err=>errors.push(err.message));
  const base='http://127.0.0.1:'+server.address().port+'/';
  const ready=()=>page.waitForFunction(()=>window.__world?.ready,null,{timeout:100000});
  const state=()=>page.evaluate(()=>{
    const {player:p,phys,area}=__world,s=phys.support(p.x,p.z,p.y+.5);
    return {area,x:p.x,y:p.y,z:p.z,support:s.s?s.y:null,note:document.querySelector('#toast').textContent,errors:__world.errors};
  });
  async function pick(name){
    await page.keyboard.press('m');
    await page.locator('#map-search').fill(name);
    await page.locator('#map-results button').filter({hasText:name}).first().click();
    await page.getByRole('button',{name:'여기로 이동'}).click();
  }
  await page.goto(base+'#/newcore/1F');
  await ready();
  if (await page.locator('#start').isVisible()) await page.locator('#start').click();
  await pick('신의주 순대');
  await page.waitForFunction(()=>window.__world?.ready && __world.area==='out:banpo',null,{timeout:100000});
  await page.waitForTimeout(450);
  const street=await state();
  console.log('remote pin',JSON.stringify(street));
  assert.notEqual(street.support,null,'remote pin must land on a walkable surface');
  assert.ok(Math.abs(street.y-street.support)<.15 && Math.hypot(street.x+579.48,street.z-625.11)<9);
  assert.match(street.note,/지상/);
  if (await page.locator('#start').isVisible()) await page.locator('#start').click();
  await pick('신의주 순대');
  await page.waitForTimeout(400);
  const local=await state();
  console.log('same district',JSON.stringify(local));
  assert.ok(Math.abs(local.y-street.y)<.15 && Math.abs(local.x-street.x)<.5);
  assert.match(local.note,/지상/);
  await page.keyboard.down('w');
  await page.waitForTimeout(650);
  await page.keyboard.up('w');
  const walked=await state();
  assert.ok(walked.support!==null && Math.hypot(walked.x-local.x,walked.z-local.z)>1);
  await page.goto(base+'#/shinsegae/B1');
  await ready();
  if (await page.locator('#start').isVisible()) await page.locator('#start').click();
  await pick('Tokyo Milk Cheese Factory');
  await page.waitForTimeout(1300);
  const shop=await state();
  console.log('modeled basement',JSON.stringify(shop));
  assert.equal(shop.area,'in:shinsegae');
  assert.ok(shop.y<-3 && shop.support!==null && Math.abs(shop.y-shop.support)<.1);
  assert.deepEqual([...errors,...shop.errors,...street.errors,...local.errors],[]);
}finally{await browser.close();await new Promise(r=>server.close(r))}
