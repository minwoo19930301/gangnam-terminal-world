import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {serve} from '../../../tests/serve.mjs';
import {catalog,prefix} from './layout.js';

const server=await serve(0),base='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({channel:'chromium',args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});
// Surveyed building 413372930, with offsets identical to the game shop inside its existing upper-floor bay.
const a=[232.46,-498.09],b=[257.91,-438.10],corner=[217.32,-421.12];
const L=Math.hypot(b[0]-a[0],b[1]-a[1]),ux=(b[0]-a[0])/L,uz=(b[1]-a[1])/L;
const W=Math.abs((corner[0]-b[0])*-uz+(corner[1]-b[1])*ux);
const start=-L/2+21,u=start+((L/2-1.4-start)/3)*.25,front=W*.5+3.25;
function map(x,d){return [(a[0]+b[0])/2+ux*(u+x)-uz*(front+d),(a[1]+b[1])/2+uz*(u+x)+ux*(front+d)];}
function pose(x,d,tx,td,pitch=0,y=18.6){
  const [xx,z]=map(x,d),[ax,az]=map(tx,td);
  return [xx,y,z,Math.atan2(xx-ax,z-az),pitch*Math.PI/180];
}
async function open(floor,pos){
  const page=await browser.newPage({viewport:{width:1000,height:640}}),requests=[],errors=[];
  await page.addInitScript(()=>sessionStorage.setItem('sky-mode','day'));
  page.on('request',r=>{if(/\/newcore-golf\/[^?]+\.(glb|webp)$/.test(r.url()))requests.push(r.url().split('/').at(-1));});
  page.on('pageerror',e=>errors.push(e.message));
  page.on('console',m=>{if(m.type()==='error'&&/SHADER|WebGLProgram|VALIDATE_STATUS/.test(m.text()))errors.push(m.text());});
  await page.goto(base+'/?fixedres=1&pos='+pos.slice(0,3).join(',')+'&yaw='+pos[3]*180/Math.PI+'#/newcore/'+floor);
  await page.waitForFunction(()=>window.__world?.ready,null,{timeout:110000});await page.waitForTimeout(400);
  return {page,requests,errors};
}
async function aim(page,...args){
  await page.evaluate(p=>{__world.player.teleport(...p.slice(0,4));__world.player.pitch=p[4];},pose(...args));
  await page.waitForTimeout(240);
}
async function walk(page,x,d){
  const dest=map(x,d);
  await page.evaluate(([x,z])=>{const p=__world.player;p.yaw=Math.atan2(p.x-x,p.z-z);p.pitch=-.04;},dest);
  await page.keyboard.down('w');
  try{await page.waitForFunction(([x,z])=>Math.hypot(__world.player.x-x,__world.player.z-z)<.14,dest,{timeout:7500});}
  finally{await page.keyboard.up('w');}
}
async function detail(page,key){
  await page.waitForFunction(label=>{
    const matches=__world.scene.getObjectsByProperty('name',label);
    return matches.some(root=>root.children[0]?.matrixAutoUpdate===false && root.children[0].geometry.attributes.position.count>100);
  },prefix+catalog[key][0],{timeout:11000});
}

try{
  for(const [label,floor,eye] of [
    ['lower sales floor','4F',pose(0,3.5,0,8,0,14.2)],['adjacent bay','5F',pose(4.20,5.0,0,5.0)],
    ['rear wall','5F',pose(0,9.65,0,6.0)],['opposite aisle view','5F',pose(0,-2.7,0,-8.5)]]){
    const {page,requests,errors}=await open(floor,eye);
    assert.deepEqual(requests,[],label);assert.deepEqual(errors,[]);await page.close();
  }
  const {page,requests,errors}=await open('5F',pose(-1.36,-2.42,-1.36,4.7));
  await page.locator('canvas').first().click({position:{x:500,y:320},force:true});
  const frames=page.evaluate(async()=>{
    const ms=[];let prev;
    for(let i=0;i<250;i++){const t=await new Promise(requestAnimationFrame);if(i>1)ms.push(t-prev);prev=t;}
    ms.sort((a,b)=>a-b);return {p95:+ms[Math.floor(ms.length*.95)].toFixed(1),p99:+ms[Math.floor(ms.length*.99)].toFixed(1),max:+ms.at(-1).toFixed(1),over33:ms.filter(x=>x>33).length};
  });
  let length=0,last=[-1.36,-2.42];
  for(const stop of [[-1.36,1.10],[-1.43,4.85],[-.67,5.65],[-.62,7.28]]){
    await walk(page,...stop);length+=Math.hypot(stop[0]-last[0],stop[1]-last[1]);last=stop;
  }
  assert.equal(await page.evaluate(()=>__world.phys.zoneAt(__world.player.x,__world.player.y+.1,__world.player.z)?.name),'아디다스골프');
  assert.ok(Math.abs(await page.evaluate(()=>__world.player.y)-18.6)<.09);
  for(const [view,keys] of [
    [[0,4.78,0,8.14,-2],['back','puffer','wine','ice','black']],
    [[.06,3.14,0,3.78,-44],['table','bow','navy']],
    [[1.11,5.44,2.55,5.43,-19],['shelf','foldWine','foldIce','foldBlack']],
    [[-.73,5.59,-2.45,6.24,-8],['bench']],
    [[.07,-3.84,0,.2,19],['fascia','envelope']],
  ]){
    await aim(page,...view);
    await Promise.all(keys.map(key=>detail(page,key)));
  }
  await aim(page,.39,5.02,0,8.04,-2);
  const shared=await page.evaluate(labels=>labels.map(n=>__world.scene.getObjectByName(n).children[0].geometry.uuid),['wine','ice','black'].map(k=>prefix+catalog[k][0]));
  assert.equal(new Set(shared).size,1,'three separate materials share one shirt mesh');
  for(const mode of ['sunrise','day','sunset','night','live']){
    await page.evaluate(m=>__world.setTimeMode(m),mode);await page.waitForTimeout(90);
    assert.equal(await page.locator('#sky-mode').inputValue(),mode);
  }
  for(const unique of ['folded.glb','sweater.glb',...['wine','black','ice'].map(c=>'knit-'+c+'.webp')])
    assert.equal(requests.filter(name=>name===unique).length,1,unique);
  assert.equal(new Set(requests).size,requests.length);
  assert.deepEqual([...errors,...await page.evaluate(()=>[...__world.errors,...__world.K._.detailErrors])],[]);
  console.log(JSON.stringify({walkMetres:+length.toFixed(2),frames:await frames,requests,sharedGarmentMeshes:new Set(shared).size,coldElsewhere:0}));await page.close();
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
