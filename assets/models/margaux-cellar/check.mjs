// Real entry through the glass frontage, then a ten-metre walk past the racks.
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {serve} from '../../../tests/serve.mjs';
const server=await serve(0),base='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({channel:'chromium',args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});
const s=.359001,c=.933337,r=Math.atan2(s,c),P=(u,v)=>[-23.6925+c*u+s*v,99.5825-s*u+c*v];
function view(u,v,y,deg,floor){
  const [x,z]=P(u,v);
  return base+'/?pos='+[x,y,z].join(',')+'&yaw='+deg+'&pitch=-4#/jwmarriott/'+floor;
}
try{
  for(const [key,addr] of [['upper',view(-3.1,25.1,35.5,-172.7,'8F')],['wall',view(-9.2,31,30.5,-69,'7F')],
    ['visit',view(1.8,31,30.5,(r+Math.PI/2)*180/Math.PI,'7F')]]){
    const page=await browser.newPage({viewport:{width:960,height:600}});
    const requests=[],errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    page.on('request',q=>{if(/\/margaux-cellar\/[^?]+\.(?:glb|webp)$/.test(q.url()))requests.push(q.url().split('/').at(-1));});
    await page.goto(addr);
    await page.waitForFunction(()=>window.__world?.ready,null,{timeout:90000});
    await page.waitForTimeout(550);
    if(key!=='visit')assert.deepEqual(requests,[]);
    else{
      await page.mouse.click(480,300);
      async function walkTo(x,z,meters,timeout){
        await page.keyboard.down('w');
        try{await page.waitForFunction(([x,z,m])=>Math.hypot(__world.player.x-x,__world.player.z-z)>m,[x,z,meters],{timeout});}
        finally{await page.keyboard.up('w');}
      }
      await walkTo(...P(1.8,31),5.9,4500);
      const zone=await page.evaluate(()=>{const p=__world.player;return __world.phys.zoneAt(p.x,p.y+.10,p.z)?.name;});
      assert.equal(zone,'와인 셀러');
      const start=P(-5.80,25.90);
      await page.evaluate(([x,z,yaw])=>{__world.player.teleport(x,30.5,z,yaw);__world.player.pitch=0;},[...start,r+Math.PI]);
      await page.waitForFunction(()=>__world.scene.children.some(o=>o.name==='더 마고 그릴 · 병 선반'&&(o.children[0].geometry.index?.count??0)>3000));
      const frame=page.evaluate(async()=>{
        const times=[],draws=[],tris=[];let last;
        for(let i=0;i<150;i++){
          const n=await new Promise(requestAnimationFrame);
          if(i>4){times.push(n-last);draws.push(__world.renderer.info.render.calls);tris.push(__world.renderer.info.render.triangles);}
          last=n;
        }
        times.sort((a,b)=>a-b);return {p95Ms:+times[Math.floor(times.length*.95)].toFixed(1),
          maxMs:+times.at(-1).toFixed(1),maxDraws:Math.max(...draws),maxTriangles:Math.max(...tris)};
      });
      await walkTo(...start,10.1,7000);
      const timing=await frame;
      const racks=await page.evaluate(()=>{
        const all=__world.scene.children.filter(o=>o.name==='더 마고 그릴 · 병 선반');
        return {all:all.length,mesh:all.filter(o=>(o.children[0].geometry.index?.count??0)>3000).length};
      });
      assert.ok(racks.all>=10 && racks.mesh>0 && racks.mesh<racks.all);
      const ballroom=await page.evaluate(()=>__world.K._.details.find(d=>d.name==='그랜드 볼룸 · 포이어')?.built);
      assert.equal(ballroom,false,'the solid floor below the cellar hides the fifth-floor ballroom');
      assert.equal(new Set(requests).size,requests.length,'each network asset is shared');
      assert.deepEqual(requests.sort(),['cases.glb','rack-front.webp','rack.glb','trolley.glb','vault.glb']);
      assert.ok(Math.abs(await page.evaluate(()=>__world.player.y)-30.5)<.14);
      await page.evaluate(([x,z])=>__world.player.teleport(x,21,z,0),P(-14,17));
      await page.waitForFunction(()=>__world.K._.details.find(d=>d.name==='그랜드 볼룸 · 포이어')?.built);
      console.log(JSON.stringify({zone,walkM:10.1,racks,requests,timing,ballroomBuiltOnFifthFloor:true}));
    }
    assert.deepEqual([...errors,...await page.evaluate(()=>[...__world.errors,...__world.K._.detailErrors])],[]);
    await page.close();
  }
}finally{await browser.close();await new Promise(ok=>server.close(ok));}
