// Verify public garden-to-restaurant walking, guarded edges and on-screen model loading in normal play.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {chromium} from 'playwright';
import {serve} from '../../../tests/serve.mjs';

const out=process.argv[2];if(out)await fs.mkdir(out,{recursive:true});
const server=await serve(0),browser=await chromium.launch({channel:'chromium',args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});
const page=await browser.newPage({viewport:{width:1000,height:670},deviceScaleFactor:1}),errors=[],hits={};
page.on('pageerror',e=>errors.push(e.message));
page.on('response',r=>{const path=new URL(r.url()).pathname;if(path.includes('/gyeongbu-rooftop/')&&path.endsWith('.glb')){
 assert.equal(r.status(),200);const n=path.split('/').at(-1);hits[n]=(hits[n]||0)+1;}});
const base='http://127.0.0.1:'+server.address().port+'/index.html?fixedres=1#/gyeongbu/';
const xy=(u,v)=>[2.3+u*.9348+v*.3552,-59.24-u*.3552+v*.9348];
async function open(u,v,y,floor,yaw){const [x,z]=xy(u,v);await page.goto('about:blank');await page.goto(base+floor+'?p='+[x,y,z,yaw].join(','));
 await page.waitForFunction(()=>window.__world?.ready,null,{timeout:150000});}
async function step(key,m){const p=await page.evaluate(()=>{const p=window.__world.player;return[p.x,p.z]});await page.keyboard.down(key);
 await page.waitForFunction(([x,z,dist])=>Math.hypot(window.__world.player.x-x,window.__world.player.z-z)>dist,[...p,m],{timeout:10000});
 await page.keyboard.up(key);return page.evaluate(([x,z])=>{const p=window.__world.player;return {travel:Math.hypot(p.x-x,p.z-z),feet:p.y};},p);}
try{
 await open(48.3,98.3,38.5,'9F',-69.19);await page.waitForTimeout(400);assert.deepEqual(hits,{});
 await open(43.2,89.5,43,'10F',110.81);await page.waitForTimeout(400);assert.deepEqual(hits,{});
 await page.evaluate(()=>{document.getElementById('start').click();window.__world.daylight.setMode('day');window.__world.player.yaw=-69.19*Math.PI/180;});const walks=[];
 walks.push(await step('w',10.53));assert.equal(hits['terrace.glb'],1);assert.equal(hits['tabletop.glb']??0,0);
 await page.evaluate(()=>{window.__world.player.yaw=-159.19*Math.PI/180;});walks.push(await step('w',7.25));
 await page.evaluate(()=>{const p=window.__world.player;p.yaw=110.81*Math.PI/180;p.pitch=-.78;});
 await page.waitForFunction(()=>window.__world.scene.getObjectByName('포석정 · 불판과 상차림')?.children[0].geometry.attributes.position.count>70,null,{timeout:9000});
 assert.equal(hits['tabletop.glb'],1);assert.equal(hits['dining-set.glb'],1);
 const sign=await page.evaluate(()=>{const o=window.__world.scene.getObjectByName('경부선 옥상 · 대형 청색 채널 글자');return !!o;});assert.ok(sign);
 const count=await page.evaluate(()=>window.__world.scene.getObjectByName('포석정 · 공용 4인 식탁과 의자').children[0].count);assert.equal(count,7);
 if(out)await page.screenshot({path:path.join(out,'normal-meal.png')});
 const bulbs=await page.evaluate(()=>{
   const w=window.__world,o=w.scene.getObjectByName('옥상 산책로 · 유백색 구등과 처마등').children[0];
   const states={};
   for(const mode of ['morning','day','sunset','night']){
     w.daylight.setMode(mode);states[mode]={light:o.visible,night:w.daylight.state.night};
   }
   w.daylight.setMode('day');return states;
 });
 for(const status of Object.values(bulbs))assert.equal(status.light,status.night);
 assert.equal(bulbs.day.light,false);assert.equal(bulbs.night.light,true);
 const stats=await page.evaluate(async()=>{const w=window.__world,failed=[],guard=[],world=(u,v)=>[2.3+u*.9348+v*.3552,-59.24-u*.3552+v*.9348];
  const probe=(u,v)=>{const [x,z]=world(u,v),p={x,z};w.phys.resolve(p,.32,43,44.75,.5);
    const support=w.phys.support(x,z,43.3).y;if(Math.hypot(x-p.x,z-p.z)>.04||Math.abs(support-43)>.10)failed.push([u,v,support]);};
  for(const v of [89.5,107.7])for(let u=46.5;u<=58;u+=.19)probe(u,v);
  for(let v=84.9;v<=110.8;v+=.18)probe(57.6,v);
  for(let v=91.2;v<=105.3;v+=.14)probe(53.84,v);
  for(const [u,v] of [[58.36,87.3],[58.36,97.4],[58.36,107.0],[54.0,84.53],[54.0,111.17]]){
    const [x,z]=world(u,v),p={x,z};w.phys.resolve(p,.32,43,44.75,.5);
    guard.push(Math.hypot(p.x-x,p.z-z));
  }
  const t=[];let prev;await new Promise(done=>requestAnimationFrame(function sample(v){if(prev!==undefined)t.push(v-prev);prev=v;if(t.length===65)done();else requestAnimationFrame(sample);}));
  t.sort((a,b)=>a-b);return {failed,guard,p95:t[61],max:t.at(-1),errors:w.errors,feet:w.player.y};});
 assert.ok(stats.guard.every(travel=>travel>.135));assert.deepEqual(stats.failed,[]);assert.deepEqual(stats.errors,[]);assert.deepEqual(errors,[]);assert.ok(walks.every(a=>Math.abs(a.feet-43)<.11));
 await page.keyboard.press('m');await page.locator('#map-search').fill('10층 포석정 옥상 야장');
 await page.locator('.gt-result').filter({hasText:'10층 포석정 옥상 야장'}).first().click();await page.locator('.gt-teleport').click();
 const destination=await page.evaluate(()=>{const p=window.__world.player;return {x:p.x,y:p.y,z:p.z,yaw:p.yaw*180/Math.PI};});
 const [mx,mz]=xy(55,91.5);assert.ok(Math.hypot(destination.x-mx,destination.z-mz)<.08);assert.ok(Math.abs(destination.y-43)<.11);
 console.log(JSON.stringify({hits,walks,bulbs,stats,destination},null,2));
}finally{await browser.close();await new Promise(r=>server.close(r));}
