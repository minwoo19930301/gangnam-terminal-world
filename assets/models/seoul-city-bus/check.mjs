import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {serve} from '../../../tests/serve.mjs';
const srv=await serve(0),base='http://127.0.0.1:'+srv.address().port;
const browser=await chromium.launch({channel:'chromium',args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});
const stops={'142':[-70.72225,-100.49598,1.9361877],'360':[9.43929,-128.15860,-1.21230997]};
const files=['body.glb','glass.glb','cabin.glb','142.glb','360.glb','reflections.webp','contact.webp','seats.glb','lamps.glb','beams.webp'];
function pose(key,u,v,a,b){
  const [x,z,angle]=stops[key],s=Math.sin(angle),c=Math.cos(angle);
  const px=x+u*c+v*s,pz=z-u*s+v*c,tx=x+a*c+b*s,tz=z-a*s+b*c;
  return [px,.15,pz,Math.atan2(px-tx,pz-tz)];
}
async function open(p,place='streets'){
  const page=await browser.newPage({viewport:{width:1000,height:640}}),seen=[],errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('console',m=>{if(m.type()==='error'&&/SHADER|VALIDATE_STATUS|WebGLProgram/.test(m.text()))errors.push(m.text());});
  page.on('request',r=>{if(r.url().includes('/seoul-city-bus/')&&files.includes(r.url().split('/').at(-1)))seen.push(r.url().split('/').at(-1));});
  await page.addInitScript(()=>sessionStorage.setItem('sky-mode','day'));
  await page.goto(base+'/?pos='+p.slice(0,3).join(',')+'&yaw='+p[3]*180/Math.PI+'#/'+place);
  await page.waitForFunction(()=>window.__world?.ready,null,{timeout:100000});
  return {page,seen,errors};
}
async function aim(page,position){
  await page.evaluate(args=>{__world.player.teleport(...args);__world.player.pitch=0;},position);
}
const detail=async(page,route,name)=>page.waitForFunction(([r,n])=>{
  const p=__world.scene.getObjectByName('신반포로 간선버스 · '+r+'번')?.getObjectByName(n);
  return p?.visible&&p.geometry?.index?.count>10000;
},[route,name],{timeout:25000});
try{
  const off=await open(pose('142',6,0,16,0));
  await off.page.waitForTimeout(600);assert.deepEqual(off.seen,[]);assert.deepEqual(off.errors,[]);await off.page.close();
  const beneath=await open([112,-4,10,0],'gyeongbu/B1');
  await beneath.page.waitForTimeout(700);assert.deepEqual(beneath.seen,[]);assert.deepEqual(beneath.errors,[]);await beneath.page.close();

  const {page,seen,errors}=await open(pose('142',29,-2,0,-1));assert.equal(await page.evaluate(()=>__world.area),'out:core');
  await detail(page,'142','간선버스 · 차체와 휠');assert.ok(!seen.includes('cabin.glb'));
  assert.ok(seen.includes('142.glb'));assert.ok(!seen.includes('360.glb'));assert.ok(!seen.includes('beams.webp'));assert.ok(!seen.includes('lamps.glb'));
  await aim(page,pose('142',-4.8,10.8,0,2.32));await detail(page,'142','간선버스 · 승객석');
  await page.waitForFunction(()=>__world.scene.getObjectByName('간선버스 · 차체 인쇄')?.visible);
  const colours=await page.evaluate(()=>{const bank=__world.scene.getObjectByName('간선버스 · 좌석 색상');return {count:bank.count,perSeat:!!bank.instanceColor};});
  assert.deepEqual(colours,{count:28,perSeat:true});
  const start=await page.evaluate(()=>performance.timeOrigin);
  await page.evaluate(()=>__world.setTimeMode('night'));await page.waitForTimeout(130);
  const camera=await page.evaluate(async()=>{
    const stats=[];let prev;
    for(let i=0;i<130;i++){const n=await new Promise(requestAnimationFrame);if(i>4)stats.push(n-prev);prev=n;}
    stats.sort((a,b)=>a-b);return {p95:+stats[Math.floor(stats.length*.95)].toFixed(1),max:+stats.at(-1).toFixed(1)};
  });
  await aim(page,pose('360',-6,-4,0,-1));await detail(page,'360','간선버스 · 승객석');
  await page.waitForFunction(()=>__world.scene.getObjectByName('신반포로 간선버스 · 360번').getObjectByName('간선버스 · 차체 인쇄').visible);
  await page.evaluate(()=>__world.setTimeMode('sunrise'));
  await aim(page,pose('142',5,-1.7,0,-1.55));await detail(page,'142','간선버스 · 차체와 휠');
  assert.equal(await page.evaluate(()=>performance.timeOrigin),start);
  assert.deepEqual([...seen].sort(),[...files].sort());assert.deepEqual(errors,[]);
  const contact=await page.evaluate(async()=>{
    const T=await import('three'),{relief}=await import('/js/banpo_relief.js'),w=__world;
    return ['142','360'].map(route=>{
      const obj=w.scene.getObjectByName('신반포로 간선버스 · '+route+'번'),offsets=[];
      for(const axle of [-2.7,2.7])for(const side of [-1,1]){
        const p=obj.localToWorld(new T.Vector3(side*(axle>0?1.04:.9275),0,axle));
        const ground=relief(p.x,p.z);const sy=w.phys.support(p.x,p.z,.44).y+ground;
        offsets.push(+((p.y-sy)*1000).toFixed(2));
      }
      return {route,roadOffsetMm:offsets};
    });
  });
  assert.ok(contact.every(row=>row.roadOffsetMm.every(mm=>Math.abs(mm)<12)),JSON.stringify(contact));
  console.log(JSON.stringify({contact,camera,files:seen,offCamera:0,basement:0}));
}finally{await browser.close();await new Promise(resolve=>srv.close(resolve));}
