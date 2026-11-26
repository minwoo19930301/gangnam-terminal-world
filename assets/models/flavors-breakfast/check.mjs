import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {chromium} from 'playwright';
import {serve} from '../../../tests/serve.mjs';
import {parts,prefix,service} from './layout.js';
const baseServer=await serve(0),base='http://127.0.0.1:'+baseServer.address().port;
const browser=await chromium.launch({headless:true,channel:'chromium',args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});
const W=(u,v)=>[-23.6925+.933337*u+.359001*v,99.5825-.359001*u+.933337*v],{west,east}=service;
function pose(u,v,a,b,pitch=0,y=6){const [x,z]=W(u,v),[tx,tz]=W(a,b);return [x,y,z,Math.atan2(x-tx,z-tz),pitch*Math.PI/180];}
async function open(floor,q){
 const page=await browser.newPage({viewport:{width:1024,height:640}}),seen=[],errors=[];
 await page.addInitScript(()=>sessionStorage.setItem('sky-mode','sunrise'));
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/SHADER|WebGLProgram|VALIDATE_STATUS/.test(m.text()))errors.push(m.text());});
 page.on('request',r=>{if(/\/flavors-breakfast\/[^?]+\.(glb|webp)$/.test(r.url()))seen.push(r.url().split('/').at(-1));});
 await page.goto(base+'/?fixedres=1&pos='+q.slice(0,3).join(',')+'&yaw='+q[3]*180/Math.PI+'&pitch='+q[4]*180/Math.PI+'#/jwmarriott/'+floor);
 await page.waitForFunction(()=>__world?.ready,null,{timeout:100000});await page.waitForTimeout(540);return {page,seen,errors};
}
async function aim(page,q){await page.evaluate(q=>{__world.player.teleport(...q.slice(0,4));__world.player.pitch=q[4];},q);await page.waitForTimeout(420);}
async function close(page,k){await page.waitForFunction(n=>__world.scene.getObjectsByProperty('name',n).some(r=>r.children[0]?.matrixAutoUpdate===false),prefix+parts[k][0],{timeout:12000});}
async function shot(page,n){if(process.env.SHOT_DIR){await fs.mkdir(process.env.SHOT_DIR,{recursive:true});await page.locator('canvas').first().screenshot({path:process.env.SHOT_DIR+'/'+n+'.jpg',quality:92});}}
async function frames(page){return page.evaluate(async()=>{const a=[];let prev;for(let i=0;i<190;i++){const t=await new Promise(requestAnimationFrame);if(i>5)a.push(t-prev);prev=t;}
 a.sort((x,y)=>x-y);return {p95:+a[Math.floor(a.length*.95)].toFixed(1),p99:+a[Math.floor(a.length*.99)].toFixed(1),max:+a.at(-1).toFixed(1)};});}
async function walk(page,u,v){const target=W(u,v);await page.evaluate(([x,z])=>{let p=__world.player;p.yaw=Math.atan2(p.x-x,p.z-z);p.pitch=-.09;},target);
 await page.keyboard.down('w');try{await page.waitForFunction(([x,z])=>Math.hypot(__world.player.x-x,__world.player.z-z)<.18,target,{timeout:9000});}finally{await page.keyboard.up('w');}}
try{
 for(const [label,f,q] of [['ground floor','1F',pose(-16,48,-23,48,0,0)],['Tamayura','2F',pose(-8.16,50.1,-8.0,52)],['salon above','3F',pose(west+1.1,29.0,west,30.18,-17,11.5)],['dining room exit','2F',pose(-18.0,31.4,-15.5,32,-8)]]){
  const p=await open(f,q);assert.deepEqual(p.seen,[],label);assert.deepEqual(p.errors,[]);await p.page.close();
 }
 const {page,seen,errors}=await open('2F',pose(west+1.09,39.80,west,36.72,-11));await page.mouse.click(510,320);
 await close(page,'glass');await close(page,'juice');await shot(page,'bar');
 await aim(page,pose(west+1.035,36.58,west-.011,36.75,-20));await shot(page,'carafes');
 const stamp=await page.evaluate(()=>performance.timeOrigin);const t=frames(page);await aim(page,pose(west+1.10,39.8,west+1.10,29.7));await walk(page,west+1.10,30.00);
 await aim(page,pose(west+1.05,30.02,west+.03,30.14,-29));await close(page,'stew');await close(page,'sign');await shot(page,'stew');
 await aim(page,pose(west+1.12,31.62,west+.04,31.64,-27));await close(page,'dimsum');await shot(page,'steamers');
 await aim(page,pose(east+.89,33.26,east,33.24,-38));await close(page,'salad');await shot(page,'salad');
 await aim(page,pose(east+.98,35.78,east,35.40,-16));await close(page,'slicer');await shot(page,'slicer');
 const modes=[];for(const m of ['day','sunset','night']){await page.evaluate(m=>__world.setTimeMode(m),m);await aim(page,pose(west+1.04,36.71,west,36.9,-22));modes.push(await page.evaluate(()=>__world.player.y));}
 assert.ok(modes.every(y=>Math.abs(y-6)<.09));assert.deepEqual([...errors,...await page.evaluate(()=>[...__world.errors,...__world.K._.detailErrors])],[]);
 assert.equal(await page.evaluate(()=>performance.timeOrigin),stamp);assert.equal(seen.length,new Set(seen).size);console.log(JSON.stringify({cold:4,walkMetres:9.8,frames:await t,seen,modes}));
}finally{await browser.close();await new Promise(r=>baseServer.close(r));}
