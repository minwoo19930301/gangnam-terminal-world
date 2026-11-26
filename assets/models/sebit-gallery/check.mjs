// Exercise the public gallery, its permanent media and the independently switched seasonal ceiling.
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {serve} from '../../../tests/serve.mjs';
import {labels} from './gallery.js';
const len=Math.hypot(130,335),u=[-130/len,-335/len],v=[u[1],-u[0]];
const P=(s,t)=>[-410+u[0]*s+v[0]*t,-45+u[1]*s+v[1]*t];
const local=(x,z)=>[(x+410)*u[0]+(z+45)*u[1],(x+410)*v[0]+(z+45)*v[1]];
const server=await serve(0),browser=await chromium.launch({channel:'chromium',headless:true,
  args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});
try{
  const page=await browser.newPage({viewport:{width:1100,height:720}}),files=[],errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('request',r=>{if(/\/sebit-gallery\/[^/]+\.(glb|webp)$/.test(r.url()))files.push(r.url().split('/').pop());});
  const at=P(215,0);await page.goto('http://127.0.0.1:'+server.address().port+'/index.html#/onebailey/B1?p='+[at[0],-6,at[1],0].join(','));
  await page.waitForFunction(()=>__world?.ready,null,{timeout:90000});await page.locator('#start').click();
  async function pose(s,t,ss,tt,pitch=0){
    const [x,z]=P(s,t),[xx,zz]=P(ss,tt);
    await page.evaluate(([x,z,yaw,p])=>{__world.player.teleport(x,-6,z,yaw);__world.player.pitch=p;},[x,z,Math.atan2(x-xx,z-zz),pitch]);
    await page.waitForTimeout(470);
  }
  async function look(s,t,pitch=0){
    const [x,z]=P(s,t);await page.evaluate(([x,z,pitch])=>{const p=__world.player;p.yaw=Math.atan2(p.x-x,p.z-z);p.pitch=pitch;},[x,z,pitch]);
  }
  async function walk(s,t){
    const dest=P(s,t);await look(s,t);await page.keyboard.down('w');
    try{await page.waitForFunction(([x,z])=>Math.hypot(__world.player.x-x,__world.player.z-z)<.13,dest,{timeout:9000});}
    finally{await page.keyboard.up('w');}
    return where();
  }
  async function where(){
    const [x,z,h,f,zone]=await page.evaluate(()=>{const w=__world,p=w.player;return[p.x,p.z,p.y,w.phys.support(p.x,p.z,p.y+1.2).y,w.phys.zoneAt(p.x,p.y+.1,p.z)?.name];});
    return [...local(x,z),h,f,zone];
  }
  async function high(key,min){
    await page.waitForFunction(([n,min])=>{const groups=[];__world.scene.traverse(o=>{if(o.name===n)groups.push(o);});
      return groups.some(o=>(o.children[0]?.geometry.index?.count??0)>3*min);},['피카소 벽화길 · '+labels[key],min],{timeout:5500});
  }
  const builtClouds=()=>page.evaluate(()=>__world.K._.details.filter(d=>d.name.startsWith('원더스트리트 공중 색판 ')&&d.built).length);
  await pose(215,0,193,0);assert.deepEqual(files,[]);assert.equal(await builtClouds(),0);
  await pose(278,0,291,0);const approaching=await builtClouds();assert.ok(approaching<10,'distant part of the exhibition '+approaching);
  await pose(306.3,7.65,306.3,6.78);assert.ok(!files.some(f=>/program|screen-body|channel|striplamp/.test(f)));
  await pose(306.3,.25,306.3,-6.73);assert.ok(!files.some(f=>/program|screen-body|channel|striplamp/.test(f)));
  await pose(306.3,1.4,306.3,6.73);await high('screen-body',600);
  await page.waitForFunction(n=>__world.scene.getObjectByName(n)?.children[0].material.map?.image.width===960,'피카소 벽화길 · '+labels.film);
  const offsets=await page.evaluate(async n=>{
    const m=__world.scene.getObjectByName(n).children[0].material,map=m.map,offsets=new Set(),start=performance.now();
    while(offsets.size<3&&performance.now()-start<15500){offsets.add(Math.round(map.offset.x*3));await new Promise(r=>requestAnimationFrame(r));}
    return [...offsets].sort();
  },'피카소 벽화길 · '+labels.film);
  assert.deepEqual(offsets,[0,1,2]);
  await pose(302.1,2.8,302.1,6.8);await high('channel',100);await high('striplamp',180);
  await pose(310.5,2.8,310.5,6.8);await high('striplamp',180);
  const banks=await page.evaluate(n=>{
    const T=__world.K.THREE,results=[];
    __world.scene.traverse(o=>{if(o.name!==n)return;const m=o.children[0];
      const b=m.geometry.boundingBox??(m.geometry.computeBoundingBox(),m.geometry.boundingBox),v=new T.Vector3(),q=new T.Matrix4();
      const x=[];for(let i=0;i<m.count;i++){m.getMatrixAt(i,q);x.push(+b.getCenter(v).applyMatrix4(q).x.toFixed(3));}
      results.push({count:m.count,x});});return results;
  },'피카소 벽화길 · '+labels.striplamp);
  assert.equal(banks.length,2);for(const bank of banks){assert.equal(bank.count,5);assert.deepEqual(bank.x,[-1.5,-.75,0,.75,1.5]);}
  await pose(298,-1.9,298,-4.2,-.36);await high('blue',200);
  const seat=await walk(298,-4.2);assert.ok(Math.abs(seat[2]-(-6+.466))<.015,'blue seat top '+seat);
  const floorAfterSeat=await walk(298,-5.15);assert.ok(Math.abs(floorAfterSeat[2]+6)<.03,'floor after the seat '+floorAfterSeat);
  await pose(298,-2.7,302,-2.7);const path=[await walk(302,-2.7),await walk(306.4,-2.7),await walk(306.4,0),await walk(311,0)];
  for(const stop of path)assert.deepEqual(stop.slice(2),[-6,-6,'피카소 벽화길']);
  await pose(322,-2.35,322,-4.2,-.39);await high('white',200);await pose(322,-3.2,321.4,-5.88,.58);await high('track',300);
  await pose(281.1,5.30,281,5.7);await page.keyboard.press('e');await page.waitForTimeout(220);
  await pose(329,0,322,0);const clouds=await page.evaluate(()=>{const items=[];__world.scene.traverse(o=>{if(o.name.startsWith('원더스트리트 · 공중 색판 '))items.push([o.count,o.visible]);});return items;});
  assert.ok(clouds.length>0&&clouds.every(([count,visible])=>count===50&&!visible),'archive toggle after crossing cells '+JSON.stringify(clouds));
  await pose(281.1,5.30,281,5.7);await page.keyboard.press('e');await page.waitForTimeout(180);
  await pose(322,0,310,0);assert.ok(await page.evaluate(()=>__world.scene.getObjectByName('원더스트리트 · 공중 색판 4').visible));
  await pose(306.3,7.6,306.3,6.7);
  assert.ok(await page.evaluate(()=>__world.K._.details.filter(x=>/피카소 벽화길 · .*?(LED|선형등|홍보 모니터)/.test(x.name)).every(x=>x.hidden)));
  const expected=['blue.glb','white.glb','track.glb','screen-body.glb','channel.glb','striplamp.glb','program.webp'];
  assert.deepEqual(files.toSorted(),expected.sort());assert.deepEqual([...errors,...await page.evaluate(()=>[...__world.errors,...__world.K._.detailErrors])],[]);
  console.log(JSON.stringify({distant:0,coldRearScreen:0,coldFacingMural:0,offsets,banks,seat,floorAfterSeat,path,seasonalApproach:approaching,seasonalBatches:clouds.length,files}));
}finally{await browser.close();await new Promise(r=>server.close(r));}
