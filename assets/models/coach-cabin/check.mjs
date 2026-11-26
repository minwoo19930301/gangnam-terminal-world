// Use the actual bay and one unrelated floor. Both run the production tile and camera logic.
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {serve} from '../../../tests/serve.mjs';

const server=await serve(0);
const origin='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({channel:'chromium',args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});
const lot='/?pos=121.1767,0,27.5406&yaw=-53.552&pitch=8#/gyeongbu/1F';
const hotel='/?pos=-15.8484,35.5,117.1902&yaw=-94.214&pitch=-13#/jwmarriott/8F';
const windowPath='/coach-cabin/windows.webp';
try {
  for(const [caseName,url] of [['hotel',hotel],['parking',lot],['offline',lot]]) {
    const page=await browser.newPage();
    const requests=[], errors=[];
    page.on('request',r=>{if(r.url().endsWith(windowPath))requests.push(r.url());});
    page.on('pageerror',e=>errors.push(e.message));
    if(caseName==='offline')await page.route('**'+windowPath,r=>r.abort());
    await page.goto(origin+url);
    await page.waitForFunction(()=>window.__world?.ready,null,{timeout:90000});
    if(caseName==='parking') {
      await page.waitForFunction(()=>window.__world.scene.children.some(o=>o.material?.name==='경부선 고속버스 · 차창' && o.material.map?.image?.width===1600));
      const state=await page.evaluate(()=>{
        const windows=window.__world.scene.children.filter(o=>o.material?.name==='경부선 고속버스 · 차창');
        return {sources:new Set(windows.map(o=>o.material.map)).size, instances:windows.length,
                width:windows[0].material.map.image.width,height:windows[0].material.map.image.height};
      });
      assert.equal(state.sources,1);assert.ok(state.instances>0);assert.equal(state.height,432);
      for (const yaw of [2.2,-53.552*Math.PI/180]) {
        await page.evaluate(value=>{window.__world.player.yaw=value;},yaw);
        await page.waitForTimeout(350);
      }
    } else {
      await page.waitForTimeout(1000);
      if(caseName==='offline')assert.ok(await page.evaluate(()=>window.__world.scene.children.some(
        o=>o.material?.name==='경부선 고속버스 · 차창' && !o.material.map && o.material.color.getHex()===0x1d3039)));
    }
    assert.deepEqual(errors,[]);assert.equal(requests.length,caseName==='hotel'?0:1);
    await page.close();
    console.log(caseName,requests.length,'passenger-window atlas requests');
  }
} finally {await browser.close();await new Promise(done=>server.close(done));}
