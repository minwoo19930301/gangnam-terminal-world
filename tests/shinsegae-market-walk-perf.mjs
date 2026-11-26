// Cold B1 shopper entry and a fifteen-second keyboard walk. Run on each revision
// using the same Metal device, viewport and repetition count for a fair comparison.
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {serve} from './serve.mjs';

const repetitions=Number(process.argv[2]??3);
assert.ok(Number.isInteger(repetitions)&&repetitions>0);
const point=(u,v)=>[-107.07+62.61*u/67+30.43*v/84.7-.32*u*v/(67*84.7),
  -24.31-23.77*u/67+79.03*v/84.7+.13*u*v/(67*84.7)];
const route=[[27.6,63.4],[17.8,63.4],[27.6,63.4],[36.5,63.4],[39,66],[39,79],[39,67]].map(([u,v])=>point(u,v));
const [[x,z],[tx,tz]]=route;
const yaw=Math.atan2(x-tx,z-tz)*180/Math.PI;
const server=await serve(0);
const browser=await chromium.launch({channel:'chromium',args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});
try {
  for(let run=1;run<=repetitions;run++){
    const page=await browser.newPage({viewport:{width:960,height:600},deviceScaleFactor:1});
    const errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.addInitScript(()=>sessionStorage.setItem('sky-mode','day'));
    await page.goto('http://127.0.0.1:'+server.address().port+'/?fixedres=1#/shinsegae/B1?p='+[x,-6,z,yaw].join(','));
    await page.waitForFunction(()=>window.__world?.ready,null,{timeout:120000});
    const readyMs=await page.evaluate(()=>__world.timing.ready);
    await page.evaluate(()=>document.querySelector('#start').click());
    await page.keyboard.down('w');
    const result=await page.evaluate(async points=>{
      const w=__world,p=w.player,frames=[];
      const start=performance.now();let last=start,leg=1,still=0,distance=0,px=p.x,pz=p.z;
      while(performance.now()-start<15000){
        const time=await new Promise(requestAnimationFrame);
        frames.push(time-last);last=time;
        const step=Math.hypot(p.x-px,p.z-pz);
        distance+=step;still=step<.004?still+1:0;px=p.x;pz=p.z;
        const [targetX,targetZ]=points[leg];
        if((Math.hypot(targetX-p.x,targetZ-p.z)<.3||still>15)&&leg+1<points.length){leg++;still=0;}
        p.yaw=Math.atan2(p.x-points[leg][0],p.z-points[leg][1]);
      }
      frames.shift();frames.sort((a,b)=>a-b);
      const quantile=f=>Number(frames[Math.floor(f*frames.length)].toFixed(2));
      return {p95:quantile(.95),p99:quantile(.99),max:frames.at(-1),over50:frames.filter(v=>v>50.9).length,
        frames:frames.length,distance,built:w.K._.details.filter(d=>d.built).length,
        glbs:performance.getEntriesByType('resource').filter(r=>r.name.includes('.glb')).length,
        errors:[...w.errors,...w.K._.detailErrors]};
    },route);
    await page.keyboard.up('w');
    assert.ok(result.distance>45,'the shopper did not traverse the aisle');
    assert.deepEqual([...errors,...result.errors],[]);
    console.log(JSON.stringify({run,readyMs,...result}));
    await page.close();
  }
}finally{await browser.close();server.close();}
