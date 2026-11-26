// Exercise the public forecourt and the formerly solid podium edge in both indoor scenes.
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {serve} from './serve.mjs';
import {plan,centre,cafeFront} from '../assets/models/cinema-rotary/layout.js';

const server=await serve(),browser=await chromium.launch({channel:'chromium',
  args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});
const doorway=plan(701,947);
const heading=(a,b)=>Math.atan2(a[0]-b[0],a[1]-b[1]);
const attempts=['shinsegae','centralcity'];
try{
  for(const owner of attempts){
    const page=await browser.newPage({viewport:{width:760,height:480}}),errors=[];
    const requests=[];
    page.on('pageerror',e=>errors.push(e.message));
    page.on('response',r=>{if(r.url().endsWith('/cinema-rotary/front.glb'))requests.push(r.status());});
    const pose=[centre[0],-6,centre[1],heading(centre,cafeFront)*180/Math.PI].join(',');
    const loaded=page.waitForResponse(r=>r.url().endsWith('/cinema-rotary/front.glb')&&r.status()===200,{timeout:90000});
    await page.goto('http://127.0.0.1:'+server.address().port+'/?q=low&traffic=0#/'+owner+'/B1?p='+pose);
    await page.waitForFunction(()=>window.__world?.ready,null,{timeout:120000});
    await page.locator('#start').click();
    await loaded;
    assert.deepEqual(requests,[200]);
    assert.equal(await page.evaluate(()=>{const w=__world,p=w.player;return w.phys.zoneAt(p.x,p.y+.1,p.z)?.name;}),'메가박스 앞 원형 광장');
    const areas=new Set();
    for(const dest of [doorway,centre]){
      const end=Date.now()+35000;
      let load,reached=false;
      try{
        while(Date.now()<end){
          const sample=await page.evaluate(([x,z])=>{
            const w=window.__world;if(!w?.ready)return null;
            const p=w.player;
            p.yaw=Math.atan2(p.x-x,p.z-z);
            return {origin:performance.timeOrigin,area:w.area,y:p.y,dist:Math.hypot(p.x-x,p.z-z),
              head:w.phys.ceilingAbove(p.x,p.z,p.y+.1,p.y+6),errors:w.errors};
          },dest).catch(e=>{if(e.message.includes('Execution context was destroyed'))return null;throw e;});
          if(sample){
            assert.equal(sample.y,-6);
            assert.ok(Number.isFinite(sample.head) && sample.head>-2);
            assert.deepEqual(sample.errors,[]);
            areas.add(sample.area);
            if(sample.dist<.55){reached=true;break;}
            if(load!==sample.origin){
              // Normal ownership transfer recreates the page and clears keyboard state.
              load=sample.origin;
              await page.keyboard.up('w');await page.keyboard.down('w');
            }
          }
          await page.waitForTimeout(40);
        }
      }finally{await page.keyboard.up('w');}
      assert.ok(reached,'Unable to walk to the next public floor');
    }
    assert.deepEqual(errors,[]);
    console.log(owner,'round trip at B1, supported with ceiling:',[...areas].join(' → '));
    await page.close();
  }
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
