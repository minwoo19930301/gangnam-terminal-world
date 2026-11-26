import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {serve} from '../../../tests/serve.mjs';
import {parts,prefix} from './layout.js';

const server=await serve(0),base='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({channel:'chromium',args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});
const map=(u,v)=>[-23.6925+.933337*u+.359001*v,99.5825-.359001*u+.933337*v];
function pose(u,v,a,b,tilt=0,y=35.5){
  const [x,z]=map(u,v),[ax,az]=map(a,b);return [x,y,z,Math.atan2(x-ax,z-az),tilt*Math.PI/180];
}
async function open(floor,p){
  const page=await browser.newPage({viewport:{width:1000,height:640}}),requests=[],errors=[];
  await page.addInitScript(()=>sessionStorage.setItem('sky-mode','day'));
  page.on('pageerror',e=>errors.push(e.message));
  page.on('console',m=>{if(m.type()==='error'&&/SHADER|WebGLProgram|VALIDATE_STATUS/.test(m.text()))errors.push(m.text());});
  page.on('request',r=>{if(/\/lounge-table-service\/[^?]+\.(glb|webp)$/.test(r.url()))requests.push(r.url().split('/').at(-1));});
  await page.goto(base+'/?fixedres=1&pos='+p.slice(0,3).join(',')+'&yaw='+p[3]*180/Math.PI+'#/jwmarriott/'+floor);
  await page.waitForFunction(()=>window.__world?.ready,null,{timeout:110000});await page.waitForTimeout(400);
  return {page,requests,errors};
}
async function aim(page,...args){
  await page.evaluate(p=>{__world.player.teleport(...p.slice(0,4));__world.player.pitch=p[4];},pose(...args));await page.waitForTimeout(220);
}
async function closeModels(page,keys){
  for(const key of keys){
    await page.waitForFunction(name=>__world.scene.getObjectsByProperty('name',name).some(root=>{
      const child=root.children[0];return child?.geometry?.attributes.color?.itemSize===4&&child.material?.envMap?.isCubeTexture;
    }),prefix+parts[key][0],{timeout:10000});
  }
}
async function walk(page,u,v){
  const target=map(u,v);await page.evaluate(([x,z])=>{const p=__world.player;p.yaw=Math.atan2(p.x-x,p.z-z);p.pitch=-.09;},target);
  await page.keyboard.down('w');
  try{await page.waitForFunction(([x,z])=>Math.hypot(__world.player.x-x,__world.player.z-z)<.15,target,{timeout:8000});}
  finally{await page.keyboard.up('w');}
}
try{
  for(const [label,floor,eye] of [
    ['different floor','9F',pose(-3.65,35.35,-3.65,34.1,0,41.10)],
    ['reception side of partition','8F',pose(7.75,33.90,-3.60,34.15)],
    ['farther bar','8F',pose(-2.05,9.5,-3.60,34.15)],['facing away','8F',pose(-1.40,35.25,4.60,38.95)]]){
    const {page,requests,errors}=await open(floor,eye);assert.deepEqual(requests,[],label);assert.deepEqual(errors,[]);await page.close();
  }
  const {page,requests,errors}=await open('8F',pose(2.75,36.30,2.75,32.45));
  await page.locator('canvas').first().click({position:{x:500,y:320},force:true});
  const frames=page.evaluate(async()=>{
    const ms=[];let last;for(let i=0;i<320;i++){const t=await new Promise(requestAnimationFrame);if(i>1)ms.push(t-last);last=t;}
    ms.sort((a,b)=>a-b);return {p95:+ms[Math.floor(ms.length*.95)].toFixed(1),p99:+ms[Math.floor(ms.length*.99)].toFixed(1),max:+ms.at(-1).toFixed(1)};
  });
  let metres=0,last=[2.75,36.30];for(const p of [[2.75,32.45],[2.75,27.55],[2.18,25.75]]){
    await walk(page,...p);metres+=Math.hypot(last[0]-p[0],last[1]-p[1]);last=p;
  }
  assert.equal(await page.evaluate(()=>__world.phys.zoneAt(__world.player.x,__world.player.y+.12,__world.player.z)?.name),'더 라운지');
  const winter=[-3.95,35.49,-3.63,34.16,-33];
  for(const [view,keys] of [
    [winter,['stand','sweets','blueTea','scones','soda','sodaGlass','sconeGlass','flowers']],
    [[.34,24.72,.29,25.67,-44],['baskets','course','whiteTea','sticks']],
    [[-3.19,19.16,-3.78,20.05,-41],['ribs']]]){
    await aim(page,...view);await closeModels(page,keys);
  }
  await aim(page,...winter);await closeModels(page,['blueTea','sodaGlass']);
  const glass=await page.evaluate(n=>{
    const c=__world.scene.getObjectsByProperty('name',n).map(r=>r.children[0]).find(c=>c?.material.envMap);
    return {transparent:c.material.transparent,depthWrite:c.material.depthWrite,reflections:c.material.envMap.image.length};
  },prefix+parts.sodaGlass[0]);assert.deepEqual(glass,{transparent:true,depthWrite:false,reflections:6});
  for(const time of ['sunrise','day','sunset','night','live']){
    await page.evaluate(m=>__world.setTimeMode(m),time);await page.waitForTimeout(120);assert.equal(await page.locator('#sky-mode').inputValue(),time);
  }
  assert.deepEqual([...requests].sort(),[...Object.keys(parts).map(k=>k+'.glb'),'surfaces.webp','lounge-reflection.webp'].sort());
  assert.deepEqual([...errors,...await page.evaluate(()=>[...__world.errors,...__world.K._.detailErrors])],[]);
  console.log(JSON.stringify({walkMetres:+metres.toFixed(2),frames:await frames,unseenRequests:0,files:requests.length,glass}));
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
