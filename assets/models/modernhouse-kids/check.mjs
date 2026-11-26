// Exercise shelf-specific streaming and physically walk between the pillow island and the bed.
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {serve} from '../../../tests/serve.mjs';
const server=await serve(0),root='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({channel:'chromium',args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});
const view=(p,yaw,floor)=>root+'/?pos='+p+'&yaw='+yaw+'&pitch=-4#/newcore/'+floor;
try{
  for(const [name,p,yaw,floor] of [
    ['5층','267.2103,18.6,-376.5015',-80.583,'5F'],['뒷벽','277.5972,14.2,-379.7196',112.491,'4F'],
    ['부분 시야','274.2817,14.2,-378.3469',-117.128,'4F'],
  ]){
    const page=await browser.newPage({viewport:{width:960,height:600}}), requests=[], errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    page.on('request',r=>{if(r.url().includes('/modernhouse-kids/')&&r.url().endsWith('.glb'))requests.push(r.url().split('/').at(-1));});
    await page.goto(view(p,yaw,floor));
    await page.waitForFunction(()=>window.__world?.ready,null,{timeout:90000});
    await page.waitForTimeout(700);
    if(name!=='부분 시야')assert.deepEqual(requests,[]);
    else{
      const pose=(x,z,yaw)=>page.evaluate(([x,z,yaw])=>{__world.player.teleport(x,14.2,z,yaw*Math.PI/180);__world.player.pitch=-.06;},[x,z,yaw]);
      await page.waitForFunction(()=>__world.scene.getObjectByName('모던하우스 키즈 · 노란 아치와 침대')?.children[0]?.matrixAutoUpdate===false);
      assert.deepEqual(requests,['arches.glb']);
      await pose(267.2103,-376.5015,-80.583);
      await page.waitForFunction(()=>['노란 아치와 침대','물병과 도시락','베개 진열대'].every(n=>__world.scene.getObjectByName('모던하우스 키즈 · '+n)?.children[0]?.matrixAutoUpdate===false));
      assert.deepEqual(requests.sort(),['arches.glb','gifts.glb','pillows.glb']);
      await page.mouse.click(480,300);
      // The open aisle runs between the display's right edge and the bed proper.
      const a=-1.1782602708401266,x=271.5713318603,z=-377.2247291787;
      const start=[x+2.13*Math.cos(a)+1.75*Math.sin(a),z-2.13*Math.sin(a)+1.75*Math.cos(a)];
      await pose(...start,a*180/Math.PI);
      await page.keyboard.down('w');
      try{await page.waitForFunction(([x,z])=>Math.hypot(__world.player.x-x,__world.player.z-z)>3.5,start,{timeout:3500});}
      finally{await page.keyboard.up('w');}
      assert.ok(Math.abs(await page.evaluate(()=>__world.player.y)-14.2)<.15);
      await pose(267.2103,-376.5015,-80.583);
      const timing=await page.evaluate(async()=>{
        const times=[],frames=85;let last=performance.now();
        for(let i=0;i<frames;i++){const now=await new Promise(requestAnimationFrame);if(i>3)times.push(now-last);last=now;}
        times.sort((a,b)=>a-b);
        return {p95Ms:+times[Math.floor(times.length*.95)].toFixed(1),maxMs:+times.at(-1).toFixed(1)};
      });
      console.log(JSON.stringify({modelRequests:requests,partialView:['arches.glb'],aisleMeters:3.5,frames:timing}));
    }
    assert.deepEqual([...errors,...await page.evaluate(()=>[...__world.errors,...__world.K._.detailErrors])],[]);
    await page.close();
  }
}finally{await browser.close();await new Promise(ok=>server.close(ok));}
