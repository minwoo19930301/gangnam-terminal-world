// Check the ordinary courtyard entrance, far-area loads and reuse after turning.
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {serve} from '../../../tests/serve.mjs';

const server=await serve(0);
const base='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({channel:'chromium',args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});
const camera=(x,y,z,yaw,pitch,area)=>'/?pos='+[x,y,z].join(',')+'&yaw='+yaw+'&pitch='+pitch+'#/'+area;
try {
  const assets=['globe-lamp.glb','portrait-cabinet.glb','court-planter.glb','terrace-set.glb','arcade.webp','paving.webp'];
  for (const [place,url] of [
    ['hotel',camera(-15.8484,35.5,117.1902,-94.214,-13,'jwmarriott/8F')],
    ['courtyard',camera(-42.6,0,197.2,180,14,'famille/1F')],
  ]) {
    const page=await browser.newPage({viewport:{width:960,height:600},deviceScaleFactor:1});
    const requests=[],errors=[];
    page.on('request',req=>{if(req.url().includes('/famille-atrium/')) requests.push(req.url().split('/').at(-1));});
    page.on('pageerror',e=>errors.push(e.message));
    await page.goto(base+url);
    await page.waitForFunction(()=>window.__world?.ready,null,{timeout:90000});
    if(place==='courtyard') {
      await page.waitForFunction(()=>window.__world.scene.getObjectByName('포비 앞 · 석재 화분과 관엽수')?.geometry.index.count>1000 && window.__world.scene.getObjectByName('메모리얼 광장 · 전광판 원화')?.material.map);
      for(const angle of [0,Math.PI]) {
        await page.evaluate(a=>{window.__world.player.yaw=a;},angle);
        await page.waitForTimeout(350);
      }
      const result=await page.evaluate(()=>{
        const scene=window.__world.scene;
        return [scene.getObjectByName('광장 · 고리형 청동 조명').count,
          scene.getObjectByName('포비 앞 · 빨간 철제 테이블과 의자').count,
          scene.getObjectByName('포비 앞 · 석재 화분과 관엽수').count,window.__world.errors.length];
      });
      assert.deepEqual(result,[6,3,4,0]);
    } else { await page.waitForTimeout(900); }
    for(const file of assets) assert.equal(requests.filter(r=>r===file).length,place==='courtyard'?1:0,file);
    assert.deepEqual(errors,[]);
    await page.close();
    console.log(place,requests.filter(r=>assets.includes(r)).length,'courtyard asset requests');
  }
} finally {await browser.close(); await new Promise(r=>server.close(r));}
