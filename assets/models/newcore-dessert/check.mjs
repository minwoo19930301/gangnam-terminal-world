import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {serve} from '../../../tests/serve.mjs';
import {parts,prefix} from './layout.js';
import fs from 'node:fs';
const osm=JSON.parse(fs.readFileSync(new URL('../../../data/osm.json',import.meta.url)));
const p=osm.buildings.find(o=>o.id===413372929).poly,a=p[2],b=p[1],L=Math.hypot(b[0]-a[0],b[1]-a[1]),u=(b[0]-a[0])/L,v=(b[1]-a[1])/L;
const front=Math.abs((p[0][0]-b[0])*-v+(p[0][1]-b[1])*u)/2-3.25;
const world=(x,d)=>[(a[0]+b[0])/2-u*x-v*(front-d),(a[1]+b[1])/2-v*x+u*(front-d)];
function pose(x,d,tx,td,pitch=0,y=18.60){const [px,pz]=world(x,d),[ax,az]=world(tx,td);return [px,y,pz,Math.atan2(px-ax,pz-az),pitch*Math.PI/180];}
const server=await serve(0),base='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({channel:'chromium',args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});
async function open(floor,q){
  const page=await browser.newPage({viewport:{width:1030,height:640}}),seen=[],errors=[];
  page.on('request',r=>{if(/\/newcore-dessert\/[^?]+\.(glb|webp)$/.test(r.url()))seen.push(r.url().split('/').at(-1));});
  page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/SHADER|WebGLProgram|VALIDATE_STATUS/.test(m.text()))errors.push(m.text());});
  await page.addInitScript(()=>sessionStorage.setItem('sky-mode','day'));
  await page.goto(base+'/?fixedres=1&pos='+q.slice(0,3).join(',')+'&yaw='+q[3]*180/Math.PI+'&pitch='+q[4]*180/Math.PI+'#/newcore/'+floor);
  await page.waitForFunction(()=>window.__world?.ready,null,{timeout:120000});await page.waitForTimeout(475);return {page,seen,errors};
}
async function aim(page,q){await page.evaluate(q=>{__world.player.teleport(...q.slice(0,4));__world.player.pitch=q[4];},q);await page.waitForTimeout(410);}
async function loaded(page,key){await page.waitForFunction(name=>__world.scene.children.some(r=>r.name===name&&r.children[0].matrixAutoUpdate===false),prefix+parts[key][0]);}
async function walk(page,x,d){
  const target=world(x,d);
  await page.evaluate(([x,z])=>{const q=__world.player;q.yaw=Math.atan2(q.x-x,q.z-z);q.pitch=-.06;},target);await page.keyboard.down('w');
  try{await page.waitForFunction(([x,z])=>Math.hypot(__world.player.x-x,__world.player.z-z)<.14,target,{timeout:7000});}finally{await page.keyboard.up('w');}
}
async function timing(page){
  return page.evaluate(async()=>{let last;const times=[];for(let i=0;i<180;i++){const t=await new Promise(requestAnimationFrame);if(i>7)times.push(t-last);last=t;}
    times.sort((a,b)=>a-b);return {p95:+times[Math.floor(times.length*.95)].toFixed(1),p99:+times[Math.floor(times.length*.99)].toFixed(1),max:+times.at(-1).toFixed(1)};});
}
try{
  for(const [label,floor,q] of [['downstairs','4F',pose(.7,6.34,.4,7.83,0,14.20)],['adjoining bay','5F',pose(15.25,5.7,-.2,7.8)],['looking out','5F',pose(-1.7,-2.2,-1.7,-11)]]){
    const g=await open(floor,q);assert.deepEqual(g.seen,[],label);assert.deepEqual(g.errors,[]);await g.page.close();
  }
  const overhead=await open('5F',pose(-.30,1.27,-.30,2.29,87));
  assert.ok(overhead.seen.includes('ceiling.glb'));assert.ok(!overhead.seen.some(f=>['chocolate.glb','crunch.glb','steak.glb','gloss.webp'].includes(f)),JSON.stringify(overhead.seen));
  assert.deepEqual(overhead.errors,[]);await overhead.page.close();
  const {page,seen,errors}=await open('5F',pose(-2.83,-1.15,-2.83,5.85));await page.mouse.click(510,320);const start=await page.evaluate(()=>performance.timeOrigin);
  const frames=timing(page);await walk(page,-2.83,5.75);await walk(page,-.94,6.66);
  await aim(page,pose(-.94,6.66,-.94,7.83,-4));await loaded(page,'chocolate');await loaded(page,'fountain');
  for(const [x,d,tx,td,p,k] of [[.83,7.02,.82,7.86,-42,'berries'],[3.67,6.82,3.66,7.82,-25,'iron'],[-5.59,1.76,-5.66,2.72,-42,'steak'],[-9.23,5.57,-9.44,8.30,5,'crest'],[.04,1.44,0,3.10,-17,'dishes']]){
    await aim(page,pose(x,d,tx,td,p));await loaded(page,k);
  }
  const heights=[];for(const mode of ['night','sunrise','day']){
    await page.evaluate(m=>__world.setTimeMode(m),mode);await aim(page,pose(-.94,6.68,-.94,7.79,-3));
    heights.push(await page.evaluate(()=>__world.player.y));
  }
  assert.ok(heights.every(y=>Math.abs(y-18.60)<.07));assert.equal(await page.evaluate(()=>performance.timeOrigin),start);
  assert.equal(new Set(seen).size,seen.length);assert.deepEqual([...errors,...await page.evaluate(()=>[...__world.errors,...__world.K._.detailErrors])],[]);
  console.log(JSON.stringify({cold:3,ceilingOnly:overhead.seen,walkMetres:6.90+Math.hypot(1.89,.91),heights,frames:await frames,requests:seen}));
}finally{await browser.close();await new Promise(r=>server.close(r));}
