// Normal-game approach to the #24 public pharmacy, plus street-facing and cross-floor load checks.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {chromium} from 'playwright';
import {serve} from '../../../tests/serve.mjs';

const out=process.argv[2];if(out)await fs.mkdir(out,{recursive:true});
const server=await serve(0),browser=await chromium.launch({channel:'chromium',
  args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});
const page=await browser.newPage({viewport:{width:1000,height:670},deviceScaleFactor:1});
const name='고속터미널약국 · 곡면 입구와 쇼윈도',errors=[];
let downloads=0;
page.on('pageerror',error=>errors.push(error.message));
page.on('response',response=>{
  if(response.url().endsWith('/gyeongbu-pharmacy/corner-pharmacy.glb')){
    assert.equal(response.status(),200);downloads++;
  }
});
const root='http://127.0.0.1:'+server.address().port+'/index.html?fixedres=1#/gyeongbu/';
const xy=(u,v)=>[2.3+u*.9348+v*.3552,-59.24-u*.3552+v*.9348];
async function open(u,v,height,floor,yaw){
  const [x,z]=xy(u,v);await page.goto('about:blank');await page.goto(root+floor+'?p='+[x,height,z,yaw].join(','));
  await page.waitForFunction(()=>window.__world?.ready,null,{timeout:150000});await page.waitForTimeout(350);
}
try{
  await open(41.10,134.57,6,'2F',110.81);assert.equal(downloads,0);
  await open(41.10,134.57,0,'1F',-69.19);assert.equal(downloads,0);
  await page.evaluate(()=>{document.getElementById('start').click();window.__world.daylight.setMode('day');});
  await page.keyboard.press('m');await page.locator('#map-search').fill('1층 고속터미널약국');
  await page.locator('.gt-result').filter({hasText:'1층 고속터미널약국'}).first().click();await page.locator('.gt-teleport').click();
  await page.waitForFunction(name=>window.__world.scene.getObjectByName(name)?.children[1].visible,name,{timeout:10000});
  const start=await page.evaluate(()=>{const p=window.__world.player;return {x:p.x,y:p.y,z:p.z,yaw:p.yaw*180/Math.PI};});
  const [x,z]=xy(41.10,134.57);assert.ok(Math.hypot(start.x-x,start.z-z)<.08);assert.ok(Math.abs(start.yaw-110.81)<.1);
  assert.equal(downloads,1);
  if(out)await page.screenshot({path:path.join(out,'approach.png')});
  await page.keyboard.down('w');
  await page.waitForFunction(({x,z})=>Math.hypot(window.__world.player.x-x,window.__world.player.z-z)>3.35,start,{timeout:10000});
  await page.keyboard.up('w');await page.waitForTimeout(150);
  const result=await page.evaluate(async({name,start})=>{
    const w=window.__world,failed=[],world=(u,v)=>[2.3+u*.9348+v*.3552,-59.24-u*.3552+v*.9348];
    const probe=(u,v)=>{const [x,z]=world(u,v),p={x,z};w.phys.resolve(p,.32,0,1.75,.5);
      if(Math.hypot(p.x-x,p.z-z)>.036||Math.abs(w.phys.support(x,z,.45).y)>.10)failed.push([u,v]);};
    for(const v of [134.37,134.57,134.80])for(let u=37.20;u<41.62;u+=.12)probe(u,v);
    for(let v=131;v<137;v+=.14)probe(40.60,v);
    for(let u=35.00;u<40.60;u+=.14)probe(u,130.95);
    const frames=[];let previous;
    await new Promise(done=>requestAnimationFrame(function sample(t){
      if(previous!==undefined)frames.push(t-previous);previous=t;
      if(frames.length===70)done();else requestAnimationFrame(sample);
    }));
    frames.sort((a,b)=>a-b);
    return {walk:Math.hypot(w.player.x-start.x,w.player.z-start.z),y:w.player.y,failed,
      zone:document.querySelector('#zone')?.textContent,triangles:w.scene.getObjectByName(name).children.map(m=>m.geometry.index.count/3),
      p95:frames[66],max:frames.at(-1),errors:w.errors};
  },{name,start});
  assert.deepEqual(result.failed,[]);assert.ok(result.zone.includes('고속터미널약국'));assert.deepEqual(result.errors,[]);assert.deepEqual(errors,[]);
  assert.ok(result.walk>3.35&&result.walk<3.94);assert.ok(Math.abs(result.y)<.10);
  if(out)await page.screenshot({path:path.join(out,'interior.png')});
  console.log(JSON.stringify({downloads,start,result},null,2));
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
