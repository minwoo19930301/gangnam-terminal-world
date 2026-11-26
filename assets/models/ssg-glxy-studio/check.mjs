// Follow a public store search, walk past the chino display, then return to the aisle.
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {serve} from '../../../tests/serve.mjs';

const server=await serve(),browser=await chromium.launch({channel:'chromium',
  args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});
const base='http://127.0.0.1:'+server.address().port+'/?q=low&fixedres=1&traffic=0';
try{
  const page=await browser.newPage({viewport:{width:900,height:560}});
  const loads=[],errors=[];
  page.on('response',r=>{if(r.url().endsWith('/ssg-glxy-studio/gallery.glb'))loads.push(r.status());});
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base+'#/shinsegae/8F?p=-35.99510,35.8,80.70119,111.12044,0');
  await page.waitForFunction(()=>window.__world?.ready);await page.locator('#start button').click();
  await page.waitForTimeout(500);assert.deepEqual(loads,[]);
  await page.keyboard.press('m');await page.locator('#map-search').fill('GLXY');
  const row=page.locator('.gt-result').filter({has:page.locator('b').getByText('GLXY studio',{exact:true})});
  assert.equal(await row.count(),1);await row.click();await page.locator('.gt-teleport').click();
  await page.waitForFunction(()=>{
    const group=__world.scene.getObjectByName('GLXY studio · G핏 바지와 진열대');
    return group?.children[0].geometry.attributes.position.count>1000;
  },null,{timeout:30000});
  const sample=()=>page.evaluate(()=>{const w=__world,p=w.player;return {x:p.x,y:p.y,z:p.z,
    zone:w.phys.zoneAt(p.x,p.y+.10,p.z)?.name,lost:w.renderer.getContext().isContextLost(),
    errors:[...w.errors,...w.K._.detailErrors]};});
  const start=await sample();assert.equal(start.zone,'GLXY studio');assert.equal(start.y,31);
  await page.keyboard.down('w');
  await page.waitForFunction(([x,z])=>Math.hypot(__world.player.x-x,__world.player.z-z)>2.65,
    [start.x,start.z],{timeout:5000});
  await page.keyboard.up('w');
  const inside=await sample();assert.equal(inside.zone,'GLXY studio');assert.equal(inside.y,31);
  await page.keyboard.down('s');
  await page.waitForFunction(([x,z])=>Math.hypot(__world.player.x-x,__world.player.z-z)<.2,
    [start.x,start.z],{timeout:5000});await page.keyboard.up('s');
  const back=await sample();
  assert.equal(back.zone,'GLXY studio');assert.deepEqual(loads,[200]);
  for(const state of [start,inside,back]){assert.equal(state.lost,false);assert.deepEqual(state.errors,[]);}
  assert.deepEqual(errors,[]);console.log(JSON.stringify({start,inside,back,loads,errors}));
}finally{await browser.close();server.close();}
