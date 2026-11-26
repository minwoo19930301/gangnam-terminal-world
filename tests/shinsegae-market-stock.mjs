// Normal floor entry and camera rotation must retain the grocery stock and cull distant rows.
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { serve } from './serve.mjs';

const server=await serve(0);
const browser=await chromium.launch({channel:'chromium',args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});
const base='http://127.0.0.1:'+server.address().port;
try {
  for(const [floor,hash] of [['8F','8F'],['B1','B1?p=-60.701,-6,25.731,111.26']]){
    const page=await browser.newPage({viewport:{width:960,height:600}});
    await page.goto(base+'/?fixedres=1#/shinsegae/'+hash);
    await page.waitForFunction(()=>window.__world?.ready,null,{timeout:120000});
    await page.evaluate(()=>document.querySelector('#start').click());
    const count=await page.evaluate(()=>__world.scene.children.filter(o=>o.name==='신세계 마켓 · 그로서리 진열병').length);
    if(floor==='8F') assert.equal(count,0,'a cold upper-floor entry built B1 stock');
    else {
      assert.ok(count>1,'expected spatially divided stock');
      const checks=await page.evaluate(async()=>{
        const w=__world,stock=w.scene.children.filter(o=>o.name==='신세계 마켓 · 그로서리 진열병');
        const seen=new Set();
        for(const o of stock){o.onBeforeRender=()=>seen.add(o.id);}
        const draws=[];
        for(const angle of [0,Math.PI]){
          w.player.yaw+=angle;
          await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
          seen.clear();w.renderer.render(w.scene,w.camera);draws.push(seen.size);
        }
        return {total:stock.reduce((n,o)=>n+o.count,0),draws,errors:w.K._.detailErrors};
      });
      assert.ok(checks.total>0&&checks.total%4===0,'a bottle lost its body, neck, lid or label');
      assert.ok(checks.draws[0]>checks.draws[1],'turning away should cull the shelves');
      assert.deepEqual(checks.errors,[]);
      console.log(count+' clusters, '+checks.total/4+' bottles; visible groups '+checks.draws.join(' → '));
    }
    await page.close();
  }
}finally{await browser.close();server.close();}
