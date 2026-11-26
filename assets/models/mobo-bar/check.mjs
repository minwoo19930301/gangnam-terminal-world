import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {serve} from '../../../tests/serve.mjs';

const server=await serve(0),base='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({channel:'chromium',args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});
const s=.359001,c=.933337,P=(u,v)=>[-23.6925+c*u+s*v,99.5825-s*u+c*v];
function pose(u,v,floor,a,b){
  const [x,z]=P(u,v),[tx,tz]=P(a,b);
  return [x,floor==='7F'?30.5:35.5,z,Math.atan2(x-tx,z-tz)];
}
function route(p,floor,pitch=0){
  return base+'/?pos='+p.slice(0,3).join(',')+'&yaw='+p[3]*180/Math.PI+'&pitch='+pitch+'#/jwmarriott/'+floor;
}
async function aim(page,u,v,a,b,pitch=0){
  await page.evaluate(([p,angle])=>{__world.player.teleport(...p);__world.player.pitch=angle;},[pose(u,v,'7F',a,b),pitch*Math.PI/180]);
}
async function walk(page,meters){
  const start=await page.evaluate(()=>[__world.player.x,__world.player.z]);
  await page.keyboard.down('w');
  try{await page.waitForFunction(([x,z,m])=>Math.hypot(__world.player.x-x,__world.player.z-z)>m,[...start,meters],{timeout:8500});}
  finally{await page.keyboard.up('w');}
}
try{
 for(const [key,p,floor] of [
   ['above',pose(9,12,'8F',12,14),'8F'],
   ['wall',pose(12.4,27.5,'7F',13,14),'7F'],
   ['visit',pose(4,3.4,'7F',4,10),'7F'],
 ]){
  const page=await browser.newPage({viewport:{width:1000,height:640}});
  const seen=[],errors=[];
  page.on('request',request=>{if(/\/mobo-bar\/[^?]+\.(?:glb|webp)$/.test(request.url()))seen.push(request.url().split('/').at(-1));});
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(route(p,floor));
  await page.waitForFunction(()=>window.__world?.ready,null,{timeout:90000});
  await page.waitForTimeout(650);
  if(key!=='visit')assert.deepEqual(seen,[],key);
  else{
    await page.mouse.click(500,320);
    await walk(page,5.5);
    const inside=await page.evaluate(()=>{const p=__world.player;return __world.phys.zoneAt(p.x,p.y+.1,p.z)?.name;});
    assert.equal(inside,'모보 바');
    await aim(page,9.8,8.0,9.8,20.4);
    const timing=page.evaluate(async()=>{
      const steps=[],triangles=[],calls=[];let last;
      for(let j=0;j<170;j++){
        const t=await new Promise(requestAnimationFrame);
        if(j>4){steps.push(t-last);calls.push(__world.renderer.info.render.calls);triangles.push(__world.renderer.info.render.triangles);}
        last=t;
      }
      steps.sort((a,b)=>a-b);return {p95Ms:+steps[Math.floor(steps.length*.95)].toFixed(1),maxMs:+steps.at(-1).toFixed(1),peakDraws:Math.max(...calls),peakTriangles:Math.max(...triangles)};
    });
    await walk(page,10.2);
    const frames=await timing;
    assert.ok(Math.abs(await page.evaluate(()=>__world.player.y)-30.5)<.13);
    await aim(page,11.12,12.23,11.9,12.9,-16);
    await page.waitForFunction(()=>__world.scene.getObjectByName('모보 바 · 칵테일과 바 도구')?.children[0].geometry.index.count>1000);
    await aim(page,10.9,18.2,11,20.7);
    await page.waitForFunction(()=>__world.scene.getObjectByName('모보 바 · 철제 선반의 허브 화분')?.children[0].geometry.index.count>1000);
    const active=await page.evaluate(()=>{
      const detail=__world.scene.getObjectByName('모보 바 · 석재 바닥과 접촉 그림자').children[0];
      return {width:detail.material.map.image.width,height:detail.material.map.image.height,triangles:detail.geometry.index.count/3,
        ballroom:__world.K._.details.find(d=>d.name==='그랜드 볼룸 · 포이어')?.built};
    });
    assert.equal(active.ballroom,false);assert.equal(active.width,896);assert.equal(active.height,1344);assert.equal(active.triangles,2);
    assert.equal(new Set(seen).size,seen.length);
    assert.deepEqual(seen.toSorted(),['bottles-front.webp','bottles.glb','chair.glb','counter.glb','herbs-front.webp','herbs.glb','lamps.glb','service.glb','stone.glb']);
    console.log(JSON.stringify({gardenEntryMeters:5.5,zone:inside,chairAisleMeters:10.2,frames,active,requests:seen}));
  }
  assert.deepEqual([...errors,...await page.evaluate(()=>[...__world.errors,...__world.K._.detailErrors])],[]);
  await page.close();
 }
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
