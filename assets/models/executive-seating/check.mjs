import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {chromium} from 'playwright';
import {serve} from '../../../tests/serve.mjs';
import {prefix,types} from './layout.js';
const s=await serve(0),base='http://127.0.0.1:'+s.address().port, browser=await chromium.launch({headless:true,channel:'chromium',args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});
const W=(u,v)=>[-23.6925+.933337*u+.359001*v,99.5825-.359001*u+.933337*v];
function pose(u,v,a,b,p=0,y=41){const [x,z]=W(u,v),[tx,tz]=W(a,b);return[x,y,z,Math.atan2(x-tx,z-tz),p*Math.PI/180];}
async function open(f,q){const page=await browser.newPage({viewport:{width:1000,height:650}}),errors=[],seen=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/SHADER|WebGLProgram|VALIDATE_STATUS/.test(m.text()))errors.push(m.text());});
  page.on('request',r=>{if(/\/executive-seating\/[^?]+\.(glb|webp)$/.test(r.url()))seen.push(r.url().split('/').at(-1));});
  await page.addInitScript(()=>sessionStorage.setItem('sky-mode','day'));
  await page.goto(base+'/?fixedres=1&pos='+q.slice(0,3).join(',')+'&yaw='+q[3]*180/Math.PI+'&pitch='+q[4]*180/Math.PI+'#/jwmarriott/'+f,{waitUntil:'domcontentloaded',timeout:90000});
  await page.waitForFunction(()=>window.__world?.ready,null,{timeout:90000});await page.waitForTimeout(450);return {page,errors,seen};
}
async function aim(page,q){await page.evaluate(q=>{__world.player.teleport(...q.slice(0,4));__world.player.pitch=q[4];},q);await page.waitForTimeout(340);}
async function walk(page,u,v){const pt=W(u,v);await page.evaluate(([x,z])=>{let p=__world.player;p.yaw=Math.atan2(p.x-x,p.z-z);p.pitch=-.095;},pt);await page.keyboard.down('w');try{await page.waitForFunction(([x,z])=>Math.hypot(__world.player.x-x,__world.player.z-z)<.15,pt,{timeout:10000});}finally{await page.keyboard.up('w');}}
async function shot(page,n){if(process.env.SHOT_DIR){await fs.mkdir(process.env.SHOT_DIR,{recursive:true});await page.locator('canvas').first().screenshot({path:process.env.SHOT_DIR+'/'+n+'.jpg',quality:91});}}
async function near(page,k){await page.waitForFunction(n=>__world.scene.getObjectsByProperty('name',n).some(o=>o.children[0]?.matrixAutoUpdate===false),prefix+types[k],{timeout:11000});}
try{
  for(const [f,q] of [['8F',pose(-1,13,2,12,-10,35.5)],['10F',pose(-1,13,0,12,-12,45)],['9F',pose(5.7,30.9,5.7,35)]]){
    const p=await open(f,q);assert.deepEqual(p.seen,[]);assert.deepEqual(p.errors,[]);await p.page.close();
  }
  const {page,errors,seen}=await open('9F',pose(5.72,22.70,5.72,13.9));await page.mouse.click(478,312);
  const sample=page.evaluate(async()=>{const a=[];let prev;for(let i=0;i<190;i++){const t=await new Promise(requestAnimationFrame);if(i>5)a.push(t-prev);prev=t;}a.sort((x,y)=>x-y);return {p95:+a[Math.floor(a.length*.95)].toFixed(1),p99:+a[Math.floor(a.length*.99)].toFixed(1),max:+a.at(-1).toFixed(1)};});
  await walk(page,5.72,14.30);await aim(page,pose(7.36,13.72,8.05,15.07,-23));await near(page,'pairA');await shot(page,'side');
  await aim(page,pose(8.77,13.64,8.02,15.12,-33));await shot(page,'seam');
  await aim(page,pose(-1.73,12.60,-4.75,9.72,-13));await near(page,'trioA');await shot(page,'windows');
  await page.evaluate(()=>__world.setTimeMode('night'));await page.waitForTimeout(300);await shot(page,'night');
  assert.ok(await page.evaluate(()=>Math.abs(__world.player.y-41)<.06));assert.deepEqual([...errors,...await page.evaluate(()=>[...__world.errors,...__world.K._.detailErrors])],[]);assert.equal(seen.length,new Set(seen).size);
  assert.deepEqual([...new Set(seen)].sort(),['chair-light.webp','chair.glb','table-light.webp','table.glb']);
  console.log(JSON.stringify({cold:3,walk:8.4,frames:await sample,seen}));
}finally{await browser.close();await new Promise(r=>s.close(r));}
