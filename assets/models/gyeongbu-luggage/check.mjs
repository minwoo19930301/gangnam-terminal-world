// Walk from the public map destination to the baggage counter. Check the neighboring ticket-office connection.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {chromium} from 'playwright';
import {serve} from '../../../tests/serve.mjs';

const out=process.argv[2];if(out)await fs.mkdir(out,{recursive:true});
const server=await serve(0),browser=await chromium.launch({channel:'chromium',
  args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});
const page=await browser.newPage({viewport:{width:1000,height:670},deviceScaleFactor:1}),errors=[];
let loads=0;page.on('pageerror',e=>errors.push(e.message));
page.on('response',r=>{if(r.url().endsWith('/gyeongbu-luggage/luggage-counter.glb')){assert.equal(r.status(),200);loads++;}});
const root='http://127.0.0.1:'+server.address().port+'/index.html?fixedres=1#/gyeongbu/';
const xy=(u,v)=>[2.3+u*.9348+v*.3552,-59.24-u*.3552+v*.9348];
async function open(y,floor,yaw){
  const [x,z]=xy(52.45,26.0);await page.goto('about:blank');await page.goto(root+floor+'?p='+[x,y,z,yaw].join(','));
  await page.waitForFunction(()=>window.__world?.ready,null,{timeout:150000});await page.waitForTimeout(400);
}
try{
  await open(6,'2F',-159.19);assert.equal(loads,0);
  await open(0,'1F',20.81);assert.equal(loads,0);
  await page.evaluate(()=>{document.getElementById('start').click();window.__world.daylight.setMode('day');});
  await page.keyboard.press('m');await page.locator('#map-search').fill('1층 수하물보관 · 짐캐리');
  await page.locator('.gt-result').filter({hasText:'1층 수하물보관 · 짐캐리'}).first().click();await page.locator('.gt-teleport').click();
  await page.waitForFunction(()=>window.__world.scene.getObjectByName('짐캐리 · 수하물보관과 운송 창구')?.children[1].visible,null,{timeout:10000});
  const start=await page.evaluate(()=>{const p=window.__world.player;return {x:p.x,z:p.z,y:p.y,yaw:p.yaw*180/Math.PI};});
  const [x,z]=xy(52.45,26.0);assert.ok(Math.hypot(x-start.x,z-start.z)<.07);assert.ok(Math.abs(start.yaw+159.19)<.09);
  if(out)await page.screenshot({path:path.join(out,'approach.png')});
  await page.keyboard.down('w');
  await page.waitForFunction(({x,z})=>Math.hypot(window.__world.player.x-x,window.__world.player.z-z)>1.40,start,{timeout:10000});
  await page.waitForTimeout(320);await page.keyboard.up('w');
  const result=await page.evaluate(async(start)=>{
    const w=window.__world,failed=[],xy=(u,v)=>[2.3+u*.9348+v*.3552,-59.24-u*.3552+v*.9348];
    function clear(u,v){
      const [x,z]=xy(u,v),p={x,z};w.phys.resolve(p,.32,0,1.75,.5);
      return Math.hypot(p.x-x,p.z-z)<.035&&Math.abs(w.phys.support(x,z,.42).y)<.10;
    }
    for(let v=25.37;v<27.66;v+=.11)for(const u of [51.95,52.25,52.65])if(!clear(u,v))failed.push([u,v]);
    for(let u=50.30;u<54.42;u+=.13)if(!clear(u,26.81))failed.push([u,26.81]);
    // Validate a continuous public path to the ticket-office aisle on a 25 cm grid.
    const pending=[[0,0]],visited=new Set(['0,0']);let reachesTicket=false;
    for(let i=0;i<pending.length;i++){
      const [a,b]=pending[i];
      if(a===20&&b===48){reachesTicket=true;break;}
      for(const [da,db] of [[1,0],[-1,0],[0,1],[0,-1]]){
        const nx=a+da,nz=b+db,key=nx+','+nz;if(nx< -12||nx>38||nz< -4||nz>51||visited.has(key))continue;
        visited.add(key);if(clear(52.45+nx*.25,26+nz*.25))pending.push([nx,nz]);
      }
    }
    const p=w.player,t=[];let prev;await new Promise(done=>requestAnimationFrame(function sample(now){
      if(prev!==undefined)t.push(now-prev);prev=now;if(t.length===65)done();else requestAnimationFrame(sample);}));
    t.sort((a,b)=>a-b);return {walk:Math.hypot(p.x-start.x,p.z-start.z),height:p.y,zone:document.querySelector('#zone')?.textContent,
      failed,reachesTicket,triangles:w.scene.getObjectByName('짐캐리 · 수하물보관과 운송 창구').children.map(m=>m.geometry.index.count/3),
      p95:t[61],max:t.at(-1),errors:w.errors};
  },start);
  assert.equal(loads,1);assert.deepEqual(result.failed,[]);assert.ok(result.reachesTicket);assert.ok(result.zone.includes('짐캐리'));
  assert.ok(result.walk>1.4&&result.walk<2.0);assert.ok(Math.abs(result.height)<.1);
  assert.deepEqual(result.errors,[]);assert.deepEqual(errors,[]);
  if(out)await page.screenshot({path:path.join(out,'counter.png')});console.log(JSON.stringify({loads,start,result},null,2));
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
