// From the repository root: node assets/models/famille-reserve-timber/check.mjs [--gpu]
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {serve} from '../../../tests/serve.mjs';

const server=await serve(0);
const base='http://127.0.0.1:'+server.address().port+'/?q=low&fixedres=1&traffic=0';
const browser=await chromium.launch(process.argv.includes('--gpu')
  ? {channel:'chromium',args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']}
  : {args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const errors=[];

async function walk(page,x,z){
  await page.evaluate(([x,z])=>{const p=__world.player;p.yaw=Math.atan2(p.x-x,p.z-z)},[x,z]);
  await page.keyboard.down('w');
  try{
    await page.waitForFunction(([x,z])=>{
      const p=__world.player;
      p.yaw=Math.atan2(p.x-x,p.z-z);
      return Math.hypot(p.x-x,p.z-z)<.24;
    },[x,z],{polling:'raf',timeout:16000});
  }finally{await page.keyboard.up('w')}
}

async function visit(route,check){
  const page=await browser.newPage({viewport:{width:900,height:580}});
  const requests=[];
  page.on('request',r=>{if(r.url().endsWith('/coffee-trees.glb'))requests.push(r.url())});
  page.on('pageerror',e=>errors.push(e.message));
  try{
    await page.goto(base+route);
    await page.waitForFunction(()=>window.__world?.ready,null,{timeout:90000});
    await page.locator('#start').click();await page.waitForTimeout(850);
    await check(page,requests);
    assert.deepEqual(await page.evaluate(()=>[...__world.errors,...__world.K._.detailErrors]),[]);
  }finally{await page.close()}
}

try{
  await visit('#/famille/1F?p=-42.2,0,195.8,180,12',async(page,requests)=>{
    assert.equal(requests.length,0,'FOURB court requested an upstairs finish');
    await page.keyboard.press('m');await page.locator('#map-search').fill('파미에파크R');
    const entry=page.locator('.gt-result').filter({hasText:'스타벅스 파미에파크R · 3층'});
    await entry.click();await page.locator('.gt-teleport').click();
    await page.waitForFunction(()=>Math.abs(__world.player.y-9.6)<.05&&document.querySelector('#zone').innerText.includes('스타벅스'));
    await page.waitForFunction(()=>{
      let item;__world.scene.traverse(o=>{if(o.name==='파미에파크R · 목재 기둥과 구형 조명')item=o.children[0]});
      return item?.material.map?.isTexture && !Array.isArray(item.material);
    },null,{timeout:20000});
    await page.evaluate(()=>{
      const p=__world.player;
      const track=window.cafeWalk={distance:0,min:p.y,max:p.y,x:p.x,z:p.z};
      function sample(){
        track.distance+=Math.hypot(p.x-track.x,p.z-track.z);track.x=p.x;track.z=p.z;
        track.min=Math.min(track.min,p.y);track.max=Math.max(track.max,p.y);requestAnimationFrame(sample);
      }
      requestAnimationFrame(sample);
    });
    for(const [x,z] of [[-51.8,222.05],[-52.3,220],[-51.8,222.05],[-46.9,221.56],
                        [-34.6,221.55],[-35.38,215],[-35.43,212.63]])await walk(page,x,z);
    await page.locator('#sky-mode').selectOption('night');await page.waitForTimeout(250);
    const track=await page.evaluate(()=>window.cafeWalk);
    assert.ok(track.distance>28&&track.min>9.59&&track.max<9.61,JSON.stringify(track));
    assert.equal(requests.length,1);
    console.log('M → seating → counter',track.distance.toFixed(2)+' m',track.min,track.max,'one model request');
  });
  await visit('#/famille/2F?p=-51.8,5,209.6,161,17',async(_page,requests)=>assert.equal(requests.length,0));
  await visit('#/famille/3F?p=-47,9.6,222.3,180',async(page,requests)=>{
    assert.equal(requests.length,0,'cold rear view requested the café');
    const queued=page.waitForRequest(r=>r.url().endsWith('/coffee-trees.glb'));
    await page.evaluate(()=>{__world.player.yaw=0});
    await queued;
    assert.equal(requests.length,1);
  });
  assert.deepEqual(errors,[]);console.log('Passed lower floors, rear view and ordinary map arrival.');
}finally{await browser.close();await new Promise(resolve=>server.close(resolve))}
