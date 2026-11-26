import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {chromium} from 'playwright';
import {serve} from '../../../tests/serve.mjs';
import {parts,prefix,eveningService} from './layout.js';
assert.deepEqual(['16:29','16:30','20:59','21:00','00:00'].map(eveningService),[false,true,true,false,false]);
const server=await serve(0),base='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({headless:true,channel:'chromium',args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});
const W=(u,v)=>[-23.6925+.933337*u+.359001*v,99.5825-.359001*u+.933337*v];
function pose(u,v,a,b,p=0,y=41){const [x,z]=W(u,v),[tx,tz]=W(a,b);return [x,y,z,Math.atan2(x-tx,z-tz),p*Math.PI/180];}
async function open(floor,q){
  const page=await browser.newPage({viewport:{width:1000,height:650}}),errors=[],seen=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/SHADER|WebGLProgram|VALIDATE_STATUS/.test(m.text()))errors.push(m.text());});
  page.on('request',r=>{if(/\/executive-service\/[^?]+\.(glb|webp)$/.test(r.url()))seen.push(r.url().split('/').at(-1));});
  await page.addInitScript(()=>sessionStorage.setItem('sky-mode','day'));
  await page.goto(base+'/?fixedres=1&pos='+q.slice(0,3).join(',')+'&yaw='+q[3]*180/Math.PI+'&pitch='+q[4]*180/Math.PI+'#/jwmarriott/'+floor,{waitUntil:'domcontentloaded',timeout:90000});
  await page.waitForFunction(()=>window.__world?.ready,null,{timeout:100000});await page.waitForTimeout(450);return {page,errors,seen};
}
async function shot(page,n){if(process.env.SHOT_DIR){await fs.mkdir(process.env.SHOT_DIR,{recursive:true});await page.locator('canvas').first().screenshot({path:process.env.SHOT_DIR+'/'+n+'.jpg',quality:91,timeout:12000});}}
async function aim(page,q){await page.evaluate(q=>{__world.player.teleport(...q.slice(0,4));__world.player.pitch=q[4];},q);await page.waitForTimeout(300);}
async function near(page,key){await page.waitForFunction(n=>__world.scene.getObjectsByProperty('name',n).some(r=>r.children[0]?.matrixAutoUpdate===false),prefix+parts[key][0],{timeout:12000});}
async function live(page,key){return page.evaluate(n=>__world.scene.getObjectByName(n)?.children[0]?.visible,prefix+parts[key][0]);}
try{
  for(const [f,q] of [['2F',pose(-31,36,-32,36,0,6)],['8F',pose(11.3,8.6,11.3,6.8,-8,35.5)],['9F',pose(5.8,31.2,5.8,39)]]){
    const p=await open(f,q);assert.deepEqual(p.seen,[],f);assert.deepEqual(p.errors,[]);await p.page.close();
  }
  const {page,errors,seen}=await open('9F',pose(12.91,7.99,12.80,6.86,-10));await near(page,'beans');await near(page,'coffee');await shot(page,'coffee');
  await aim(page,pose(10.24,7.84,10.52,6.82,-34));await near(page,'macarons');await near(page,'biscuits');await shot(page,'pastry');
  await aim(page,pose(9.08,7.95,9.08,6.84,-15));await near(page,'shelf');await near(page,'candyglass');assert.equal(await live(page,'evening'),false);assert.ok(!seen.includes('evening.glb'));
  const origin=await page.evaluate(()=>performance.timeOrigin);await shot(page,'day');
  await page.evaluate(()=>__world.setTimeMode('sunset'));await near(page,'evening');assert.equal(await live(page,'evening'),true);await shot(page,'sunset');
  await page.evaluate(()=>__world.setTimeMode('night'));await page.waitForTimeout(250);assert.equal(await live(page,'evening'),false);await shot(page,'night');
  await page.evaluate(()=>__world.setTimeMode('sunset'));assert.equal(await live(page,'evening'),true);
  await aim(page,pose(9.09,8.10,13.57,8.10,-8));await page.mouse.click(490,320);
  const frames=page.evaluate(async()=>{const result=[];let prev;for(let i=0;i<145;i++){const t=await new Promise(requestAnimationFrame);if(i>3)result.push(t-prev);prev=t;}result.sort((a,b)=>a-b);return {p95:+result[Math.floor(.95*result.length)].toFixed(1),p99:+result[Math.floor(.99*result.length)].toFixed(1),max:+result.at(-1).toFixed(1)};});
  const target=W(13.57,8.10);await page.keyboard.down('w');try{await page.waitForFunction(([x,z])=>Math.hypot(__world.player.x-x,__world.player.z-z)<.14,target,{timeout:9000});}finally{await page.keyboard.up('w');}
  assert.equal(await page.evaluate(()=>performance.timeOrigin),origin);assert.deepEqual([...errors,...await page.evaluate(()=>[...__world.errors,...__world.K._.detailErrors])],[]);assert.equal(seen.length,new Set(seen).size);
  console.log(JSON.stringify({cold:3,walk:4.48,frames:await frames,seen}));
}finally{await browser.close();await new Promise(r=>server.close(r));}
