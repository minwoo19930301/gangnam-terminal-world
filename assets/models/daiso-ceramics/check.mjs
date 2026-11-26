import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {chromium} from 'playwright';
import {serve} from '../../../tests/serve.mjs';
import {parts,prefix} from './layout.js';
const server=await serve(0),base='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({headless:true,channel:'chromium',args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});
const W=(u,v)=>[2.3+.9348*u+.3552*v,-59.24-.3552*u+.9348*v];
function pose(u,v,a,b,p=0,y=-4){const [x,z]=W(u,v),[tx,tz]=W(a,b);return[x,y,z,Math.atan2(x-tx,z-tz),p*Math.PI/180];}
async function open(f,q){const page=await browser.newPage({viewport:{width:1000,height:650}}),errors=[],seen=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/SHADER|WebGLProgram|VALIDATE_STATUS/.test(m.text()))errors.push(m.text());});
  page.on('request',r=>{if(/\/daiso-ceramics\/[^?]+\.(glb|webp)$/.test(r.url()))seen.push(r.url().split('/').at(-1));});
  await page.addInitScript(()=>sessionStorage.setItem('sky-mode','day'));
  await page.goto(base+'/?fixedres=1&pos='+q.slice(0,3).join(',')+'&yaw='+q[3]*180/Math.PI+'&pitch='+q[4]*180/Math.PI+'#/gyeongbu/'+f,{waitUntil:'domcontentloaded',timeout:90000});
  await page.waitForFunction(()=>window.__world?.ready,null,{timeout:100000});await page.waitForTimeout(480);return {page,errors,seen};
}
async function shot(page,n){if(process.env.SHOT_DIR){await fs.mkdir(process.env.SHOT_DIR,{recursive:true});await page.locator('canvas').first().screenshot({path:process.env.SHOT_DIR+'/'+n+'.jpg',quality:91});}}
async function aim(page,q){await page.evaluate(q=>{__world.player.teleport(...q.slice(0,4));__world.player.pitch=q[4];},q);await page.waitForTimeout(380);}
async function loaded(page,k){await page.waitForFunction(n=>__world.scene.getObjectsByProperty('name',n).some(o=>o.children[0]?.matrixAutoUpdate===false),prefix+parts[k][0],{timeout:12000});}
async function walk(page,u,v){const target=W(u,v);await page.evaluate(([x,z])=>{const p=__world.player;p.yaw=Math.atan2(p.x-x,p.z-z);p.pitch=-.10;},target);
  await page.keyboard.down('w');try{await page.waitForFunction(([x,z])=>Math.hypot(__world.player.x-x,__world.player.z-z)<.15,target,{timeout:10000});}finally{await page.keyboard.up('w');}}
try{
  for(const [f,q] of [['1F',pose(257,8,257,11,-16,0)],['B1',pose(175,6.6,177,6.6)],['B1',pose(256.2,13.3,257.4,10.8,-8)],['B1',pose(257.4,9.4,257.4,6,0)]]){
    const p=await open(f,q);assert.deepEqual(p.seen,[],f);assert.deepEqual(p.errors,[]);await p.page.close();
  }
  const {page,errors,seen}=await open('B1',pose(257.36,9.50,257.43,10.80,-23));await loaded(page,'cartons');await loaded(page,'pots');await loaded(page,'lids');await shot(page,'cookers');
  await aim(page,pose(257.02,9.90,257.06,10.81,-29));await shot(page,'carton');
  await aim(page,pose(257.75,9.64,257.58,10.78,-4));await loaded(page,'painted');await shot(page,'painted');
  await page.mouse.click(480,310);await aim(page,pose(258.9,8.70,252.50,8.70,-7));
  const timing=page.evaluate(async()=>{const a=[];let last;for(let i=0;i<160;i++){const t=await new Promise(requestAnimationFrame);if(i>4)a.push(t-last);last=t;}a.sort((x,y)=>x-y);return {p95:+a[Math.floor(a.length*.95)].toFixed(1),p99:+a[Math.floor(a.length*.99)].toFixed(1),max:+a.at(-1).toFixed(1)};});
  await walk(page,252.50,8.70);await aim(page,pose(252.83,9.39,253.01,10.79,-13));await loaded(page,'dinner');await loaded(page,'bowls');await loaded(page,'ticket');await shot(page,'dishes');
  await aim(page,pose(253.04,9.82,253.06,10.77,-9));await shot(page,'rim');
  await aim(page,pose(252.5,8.70,258.9,8.70));await walk(page,258.9,8.70);
  await aim(page,pose(257.36,9.50,257.43,10.80,-23));assert.deepEqual([...errors,...await page.evaluate(()=>[...__world.errors,...__world.K._.detailErrors])],[]);assert.equal(seen.length,new Set(seen).size);
  console.log(JSON.stringify({cold:4,walk:12.8,frames:await timing,seen}));
}finally{await browser.close();await new Promise(r=>server.close(r));}
