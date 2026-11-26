import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {serve} from '../../../tests/serve.mjs';

const base=await serve(0);
const browser=await chromium.launch({headless:true,channel:'chromium',args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});
const name='경부선 대합실 좌석 · 목재 루버와 매입등';
const cases=[
  ['distance','/?pitch=0#/gyeongbu/1F?p=63.006,0,-68.400,20.806'],
  ['upper floor','/?pitch=10#/gyeongbu/2F?p=83.434,6,-40.539,20.806'],
  ['behind camera','/?pitch=0#/gyeongbu/1F?p=85.029,0,-36.863,-159.194'],
  ['seating','/?pitch=15#/gyeongbu/1F?p=80.140,0,-39.073,-5.299'],
];
try {
  for(const [location,url] of cases){
    const page=await browser.newPage({viewport:{width:960,height:600}});
    const requests=[],errors=[];
    page.on('response',r=>{if(r.url().endsWith('/waiting-ceiling.glb'))requests.push(r.status());});
    page.on('pageerror',e=>errors.push(e.message));
    await page.goto('http://127.0.0.1:'+base.address().port+url);
    await page.waitForFunction(()=>window.__world?.ready);
    await page.locator('#start').click();
    await page.waitForTimeout(650);
    if(location==='seating'){
      await page.waitForFunction(label=>__world.scene.getObjectByName(label)?.children[0].geometry.hasAttribute('color'),name);
      const pose=()=>page.evaluate(()=>{
        const {player:p,phys}=__world;
        return {x:p.x,y:p.y,z:p.z,roof:phys.ceilingAbove(p.x,p.z,p.y+.65,p.y+25)};
      });
      const start=await pose();
      for(const mode of ['day','night'])await page.selectOption('#sky-mode',mode);
      await page.keyboard.down('w');await page.waitForTimeout(420);await page.keyboard.up('w');
      const end=await pose();
      assert.ok(Math.hypot(end.x-start.x,end.z-start.z)>1, 'public aisle walking');
      assert.equal(start.y,end.y);
      assert.equal(start.roof,end.roof);
    }
    assert.deepEqual(requests,location==='seating'?[200]:[],location);
    assert.deepEqual(errors,[]);
    await page.close();
  }
} finally {
  await browser.close();
  await new Promise(resolve=>base.close(resolve));
}
