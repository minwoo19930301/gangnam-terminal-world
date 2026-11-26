// Walk from the public fourth-floor aisle across the showroom threshold and back.
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {serve} from '../../../tests/serve.mjs';

const server=await serve(0),browser=await chromium.launch({channel:'chromium',args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});
const page=await browser.newPage({viewport:{width:1110,height:735},deviceScaleFactor:1});
const base='http://127.0.0.1:'+server.address().port+'/index.html?fixedres=1#/gyeongbu/';
const root='경부선 4층 · 고명재한복 치마와 저고리',full=[],distant=[],errors=[];
const xy=(u,v)=>[2.3+u*.9348+v*.3552,-59.24-u*.3552+v*.9348];
const angle=(du,dv)=>Math.atan2(-(.9348*du+.3552*dv),-(-.3552*du+.9348*dv));
page.on('pageerror',e=>errors.push(e.message));
page.on('response',r=>{
  if(r.url().endsWith('/gyeongbu-hanbok/hanbok-showroom.glb'))full.push(r.status());
  if(r.url().endsWith('/gyeongbu-hanbok/proxy.js'))distant.push(r.status());
});
async function entry(floor,u,v,y,du,dv){
  const [x,z]=xy(u,v);
  await page.goto('about:blank');await page.goto(base+floor+'?p='+[x,y,z,angle(du,dv)*180/Math.PI].join(','));
  await page.waitForFunction(()=>window.__world?.ready,null,{timeout:130000});
  await page.evaluate(()=>{document.getElementById('start').click();__world.setTimeMode('day');});
  await page.waitForTimeout(425);
}
async function pose(u,v,du,dv){
  const [x,z]=xy(u,v);
  await page.evaluate(p=>Object.assign(__world.player,p),{x,z,y:16,vy:0,yaw:angle(du,dv),pitch:0});
  await page.waitForTimeout(275);
}
async function surface(near){
  await page.waitForFunction(([root,near])=>{
    const item=__world.scene.getObjectByName(root)?.children[0];
    return item&&!!item.material.normalMap===near&&(near||item.geometry.index.count>300);
  },[root,near],{timeout:12500});
  return page.evaluate(root=>{
    const group=__world.scene.getObjectByName(root),item=group.children[0],material=item.material;
    return {draws:group.children.length,triangles:item.geometry.index.count/3,
      maps:[material.map,material.normalMap,material.roughnessMap,material.emissiveMap].map(tex=>tex?.image.width??0)};
  },root);
}
async function walk(u,v){
  const [x,z]=xy(u,v);
  await page.evaluate(([x,z])=>{const p=__world.player;p.yaw=Math.atan2(p.x-x,p.z-z);},[x,z]);
  await page.keyboard.down('w');
  try{await page.waitForFunction(([x,z])=>Math.hypot(__world.player.x-x,__world.player.z-z)<.17,[x,z],{timeout:10000});}
  finally{await page.keyboard.up('w');}
  return page.evaluate(()=>{const w=__world,p=w.player;return {x:p.x,y:p.y,z:p.z,zone:w.phys.zoneAt(p.x,p.y+.12,p.z)?.name};});
}
try{
  await entry('3F',38.64,118.5,11,-1,0);assert.deepEqual(full,[]);assert.deepEqual(distant,[]);
  await entry('4F',38.64,118.5,16,1,0);assert.deepEqual(full,[]);assert.deepEqual(distant,[]);
  await pose(38,89,-3.8,29.5);const far=await surface(false);assert.ok(far.triangles>200&&far.triangles<1700);assert.deepEqual(full,[]);
  await pose(38.64,118.05,-1,0);const near=await surface(true);
  assert.equal(near.draws,1);assert.equal(far.draws,1);assert.ok(near.triangles>10000&&near.triangles<32000);
  assert.deepEqual(near.maps,[1024,512,256,256]);
  const entered=await walk(34.68,118.05);assert.equal(entered.zone,'고명재한복');assert.equal(entered.y,16);
  const exited=await walk(38.64,118.05);assert.notEqual(exited.zone,'고명재한복');assert.equal(exited.y,16);
  await pose(38.1,113.0,0,1);
  const north=await walk(38.1,124.0);assert.equal(north.y,16);
  const physical=await page.evaluate(()=>{
    const w=__world;
    function contact(u,v){
      const x=2.3+u*.9348+v*.3552,z=-59.24-u*.3552+v*.9348,p={x,z};
      w.phys.resolve(p,.32,16,17.75,.50);return Math.hypot(p.x-x,p.z-z);
    }
    const blocked=[[35.46,120.36],[35.44,119.41],[35.39,116.89],[34.14,118.32]].map(([u,v])=>contact(u,v));
    const obstructed=[];
    for(const v of [118.10,118.30,118.53])for(let u=34.69;u<38.70;u+=.18)if(contact(u,v)>.025)obstructed.push([u,v]);
    return {blocked,obstructed};
  });
  assert.deepEqual(physical.obstructed,[]);assert.ok(physical.blocked.every(n=>n>.075),JSON.stringify(physical));
  const modes=[];
  await pose(38.64,118.53,-1,0);
  for(const mode of ['day','sunset','night','sunrise','live']){
    modes.push(await page.evaluate(async mode=>{__world.setTimeMode(mode);await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));return __world.daylight.state.mode;},mode));
  }
  assert.deepEqual(modes,['day','sunset','night','sunrise','live']);
  await pose(38,90,-3.8,28.5);await surface(false);
  await pose(38.64,118.53,-1,0);await surface(true);
  assert.deepEqual(full,[200]);assert.deepEqual(distant,[200]);assert.deepEqual(errors,[]);
  console.log(JSON.stringify({far,near,entered,exited,north,physical,modes,full,distant,errors},null,2));
}finally{await browser.close();await new Promise(r=>server.close(r));}
