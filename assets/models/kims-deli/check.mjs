import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {serve} from '../../../tests/serve.mjs';

const server=await serve(),base='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({channel:'chromium',args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});
const ux=.39054590595531,uz=.92058345376264,aisle=34.99795;
const point=(u,v)=>[245.185+ux*u-uz*v,-468.095+uz*u+ux*v];
function pose(u,v,lookU,lookV,y=-6){
  const [x,z]=point(u,v),[tx,tz]=point(lookU,lookV);
  return [x,y,z,Math.atan2(x-tx,z-tz)];
}
function href(p,pitch=0){
  return base+'/?pos='+p.slice(0,3).join(',')+'&yaw='+p[3]*180/Math.PI+'&pitch='+pitch+'#/newcore/'+(p[1]===0?'1F':'B1');
}
async function enter(p,pitch=0){
  const page=await browser.newPage({viewport:{width:1000,height:640}}),seen=[],errors=[];
  page.on('request',r=>{if(/\/kims-deli\/[^?]+\.(glb|webp)$/.test(r.url()))seen.push(r.url().split('/').at(-1));});
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(href(p,pitch));
  await page.waitForFunction(()=>window.__world?.ready,null,{timeout:90000});
  return {page,seen,errors};
}
async function aim(page,p,pitch=0){
  await page.evaluate(([p,deg])=>{__world.player.teleport(...p);__world.player.pitch=deg*Math.PI/180;},[p,pitch]);
}
async function near(page,food){
  return page.evaluate(name=>{
    let close=0,capacity=0;
    __world.scene.traverse(o=>{
      if(o.name==='킴스클럽 델리 · '+name+' · 가까운 식품 표면'&&o.parent.visible&&o.visible&&o.material.map){
        close+=o.count;capacity+=o.instanceMatrix.count;
      }
    });
    return {close,capacity};
  },food);
}
async function checkErrors({page,errors}){
  assert.deepEqual([...errors,...await page.evaluate(()=>[...__world.errors,...__world.K._.detailErrors])],[]);
}
try{
  for(const [label,p,allowSmall] of [
    ['1층 바닥 위',pose(5,aisle-1,5,aisle+1,0),false],
    ['지하 매대를 등짐',pose(4.6,aisle-1.25,4,aisle-6),true],
  ]){
    const visit=await enter(p,-16);
    await visit.page.waitForTimeout(650);
    const high=visit.seen.filter(file=>['fried.glb','sushi.glb','maki.glb','salad.glb'].includes(file));
    assert.deepEqual(allowSmall?high:visit.seen,[],label);
    await checkErrors(visit);await visit.page.close();
  }
  const visit=await enter(pose(4.6,aisle-1.25,5,aisle+.05),-24);
  const {page,seen}=visit;
  const kinds=[[5,'fried','한입새우튀김 포장'],[10,'sushi','새우롤 포장'],[15,'salad','팔각 양장피 포장'],[0,'maki','김가루 롤 포장']];
  const inspected=[];
  for(const [u,key,name] of kinds){
    await aim(page,pose(u-.10,aisle-1.16,u,aisle+.04),-24);
    await page.waitForFunction(label=>{
      let visible=false;__world.scene.traverse(o=>{
        if(o.name==='킴스클럽 델리 · '+label+' · 가까운 식품 표면'&&o.count>0&&o.geometry.index.count>600&&o.material.map)visible=true;
      });return visible;
    },name);
    const count=await near(page,name);
    assert.ok(count.close>0&&count.close<=count.capacity,JSON.stringify(count));
    if(!inspected.length)assert.deepEqual(seen.filter(e=>/^(fried|sushi|maki|salad)\.glb$/.test(e)),['fried.glb']);
    assert.equal(seen.filter(file=>file===key+'.glb').length,1);
    inspected.push({key,...count});
  }
  // At the side of the shrimp case, turning past the far corner leaves only a
  // fraction of its physical packages inside the close frustum.
  await aim(page,pose(3,aisle-.9,3.55,aisle+.48),-22);
  await page.waitForTimeout(180);
  const partial=await near(page,'한입새우튀김 포장');
  assert.ok(partial.close>0&&partial.close<partial.capacity,JSON.stringify(partial));
  await aim(page,pose(-5.55,39.45,-6,43.50));
  await page.waitForFunction(()=>performance.getEntriesByType('resource').some(e=>e.name.endsWith('kims-deli/wall.glb')));
  await aim(page,pose(1,aisle-2.6,24,aisle-2.6));
  await page.mouse.click(500,320);
  const frames=page.evaluate(async()=>{
    const samples=[],tris=[],draw=[];let last;
    for(let j=0;j<190;j++){
      const t=await new Promise(requestAnimationFrame);
      if(j>5){samples.push(t-last);tris.push(__world.renderer.info.render.triangles);draw.push(__world.renderer.info.render.calls);}
      last=t;
    }
    samples.sort((a,b)=>a-b);
    return {p95Ms:+samples[Math.floor(samples.length*.95)].toFixed(1),maxMs:+samples.at(-1).toFixed(1),peakTriangles:Math.max(...tris),peakDraws:Math.max(...draw)};
  });
  const start=await page.evaluate(()=>[__world.player.x,__world.player.z]);
  await page.keyboard.down('w');
  try{
    await page.waitForFunction(([x,z])=>Math.hypot(__world.player.x-x,__world.player.z-z)>13.1,start,{timeout:8000});
  }finally{await page.keyboard.up('w');}
  const end=await page.evaluate(()=>[__world.player.x,__world.player.y,__world.player.z]);
  assert.ok(Math.abs(end[1]+6)<.13);
  assert.equal(new Set(seen).size,seen.length);
  await checkErrors(visit);
  console.log(JSON.stringify({inspected,partial,requests:seen,aisleWalkM:+Math.hypot(end[0]-start[0],end[2]-start[1]).toFixed(2),frames:await frames}));
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
