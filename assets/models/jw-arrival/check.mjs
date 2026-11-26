import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {chromium} from 'playwright';
import {serve} from '../../../tests/serve.mjs';
import {beads,center,parts,prefix} from './layout.js';
const server=await serve(0),base='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({headless:true,channel:'chromium',args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});
const world=(u,v)=>[-23.6925+.933337*u+.359001*v,99.5825-.359001*u+.933337*v];
function pose(u,v,a,b,pitch=0,y=0){
  const [x,z]=world(u,v),[ax,az]=world(a,b);return [x,y,z,Math.atan2(x-ax,z-az),pitch*Math.PI/180];
}
async function open(floor,q){
  const page=await browser.newPage({viewport:{width:1040,height:650}}),requests=[],errors=[];
  await page.addInitScript(()=>sessionStorage.setItem('sky-mode','day'));
  page.on('request',r=>{if(/(?:\/jw-arrival\/[^?]+\.(?:glb|webp)|\/(?:hotel-lattice|hotel-pendant)\.glb)$/.test(r.url()))requests.push(r.url().split('/').at(-1));});
  page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/SHADER|WebGLProgram|VALIDATE_STATUS/.test(m.text()))errors.push(m.text());});
  await page.goto(base+'/?fixedres=1&pos='+q.slice(0,3).join(',')+'&yaw='+q[3]*180/Math.PI+'&pitch='+q[4]*180/Math.PI+'#/jwmarriott/'+floor);
  await page.waitForFunction(()=>window.__world?.ready,null,{timeout:110000});await page.waitForTimeout(610);return {page,requests,errors};
}
async function aim(page,q){
  await page.evaluate(q=>{__world.player.teleport(...q.slice(0,4));__world.player.pitch=q[4];},q);await page.waitForTimeout(580);
}
async function loaded(page,key){
  await page.waitForFunction(name=>__world.scene.getObjectsByProperty('name',name).some(r=>r.children[0]?.matrixAutoUpdate===false),prefix+parts[key][0],{timeout:14000});
}
async function frames(page){
  return page.evaluate(async()=>{let prev;const times=[];for(let i=0;i<158;i++){const now=await new Promise(requestAnimationFrame);if(i>5)times.push(now-prev);prev=now;}
    times.sort((a,b)=>a-b);return {p95:+times[Math.floor(times.length*.95)].toFixed(1),p99:+times[Math.floor(times.length*.99)].toFixed(1),max:+times.at(-1).toFixed(1)};});
}
async function walk(page,u,v){
  const target=world(u,v);await page.evaluate(([x,z])=>{const p=__world.player;p.yaw=Math.atan2(p.x-x,p.z-z);p.pitch=.03;},target);
  await page.keyboard.down('w');try{await page.waitForFunction(([x,z])=>Math.hypot(__world.player.x-x,__world.player.z-z)<.19,target,{timeout:8500});}finally{await page.keyboard.up('w');}
}
async function picture(page,name){
  if(!process.env.SHOT_DIR)return;
  await fs.mkdir(process.env.SHOT_DIR,{recursive:true});await page.locator('canvas').first().screenshot({path:path.join(process.env.SHOT_DIR,name+'.jpg'),type:'jpeg',quality:93});
}
try{
  assert.equal(Object.values(beads).reduce((a,v)=>a+v.length,0),512);
  for(const [label,floor,q] of [['8F lounge','8F',pose(-1.5,22,-3,20,0,35.5)],['2F restaurant','2F',pose(-22,22,-21,16,0,6)],['lift hall','1F',pose(-14.52,31.88,-11.14,32,0)]]){
    const g=await open(floor,q);assert.deepEqual(g.requests,[],label);assert.deepEqual(g.errors,[]);await g.page.close();
  }
  const back=await open('1F',pose(-15.6,49,-12,42,-13));
  assert.deepEqual(back.requests.filter(f=>!['paving.glb','lobby-reflection.webp'].includes(f)),[]);assert.deepEqual(back.errors,[]);await back.page.close();
  const {page,requests,errors}=await open('1F',pose(-16.15,48.50,center.u,48.50,8));await page.mouse.click(510,320);
  await loaded(page,'lower');await loaded(page,'loops');await picture(page,'approach');
  await aim(page,pose(-19.90,48.34,center.u,48.50,-23));await loaded(page,'cords');await picture(page,'glass');
  await aim(page,pose(-19.34,48.40,center.u,48.50,75));await loaded(page,'crowns');await loaded(page,'gallery');await picture(page,'above');
  const voids=await page.evaluate(points=>points.map(([x,z])=>__world.phys.ceilingAbove(x,z,5.1,15.44)),[world(center.u,center.v),world(-28.60,48.45)]);
  assert.equal(voids[0],Infinity,'floor crosses sculpture');assert.ok(voids[1]>=11.15&&voids[1]<11.55,'salon floor missing '+voids[1]);
  await aim(page,pose(-16.15,48.50,-15.85,52.75));
  const t=frames(page);await walk(page,-15.85,52.75);await walk(page,-12.86,53.20);
  await aim(page,pose(-10.73,53.36,-8.25,54.40,-11));await loaded(page,'trolley');await loaded(page,'bags');await loaded(page,'coats');await picture(page,'bell');
  await aim(page,pose(-27.22,47.36,-29.415,48.50,17));await loaded(page,'golden');await loaded(page,'leaves');await picture(page,'flowers');
  await page.evaluate(()=>__world.setTimeMode('night'));await aim(page,pose(-16.15,48.50,center.u,48.50,15));await picture(page,'night');
  assert.deepEqual([...errors,...await page.evaluate(()=>[...__world.errors,...__world.K._.detailErrors])],[]);
  assert.equal(new Set(requests).size,requests.length);
  console.log(JSON.stringify({cold:3,back:back.requests,requests,voidTo15m:!Number.isFinite(voids[0]),salonSoffit:voids[1],walkMetres:Math.hypot(.30,4.25)+Math.hypot(2.99,.45),frames:await t}));
}finally{await browser.close();await new Promise(r=>server.close(r));}
