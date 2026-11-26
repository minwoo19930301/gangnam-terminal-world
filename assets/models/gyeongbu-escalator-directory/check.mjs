import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {serve} from '../../../tests/serve.mjs';

const server=await serve(0),browser=await chromium.launch({headless:true,channel:'chromium'});
const name='경부선 1층 에스컬레이터 · 혼수와 홈패션';
try{
  for(const [label,floor,pose] of [
    ['back','1F',[40.532,0,-14.93,20.806]],['upper','2F',[47.20976,6,2.64424,200.806]],
    ['up','1F',[39.38222,0,-15.56288,200.806]]
  ]){
    const page=await browser.newPage({viewport:{width:960,height:600}});
    const errors=[],requests=[];
    page.on('pageerror',error=>errors.push(error.message));
    page.on('response',response=>{
      if(response.url().endsWith('/gyeongbu-escalator-directory/surface.js'))requests.push(response.status());
    });
    await page.goto('http://127.0.0.1:'+server.address().port+'/?q=low&traffic=0#/gyeongbu/'+floor+'?p='+pose.join(','));
    await page.waitForFunction(()=>window.__world?.ready);
    await page.locator('#start').click();
    if(label==='up'){
      await page.waitForFunction(name=>__world.scene.getObjectByName(name)?.geometry.index.count===192*3,name);
      await page.keyboard.down('w');
      try{await page.waitForFunction(()=>__world.player.y>5.95,null,{timeout:12000});}
      finally{await page.keyboard.up('w');}
    }else await page.waitForTimeout(600);
    assert.deepEqual(requests,label==='up'?[200]:[],label);
    assert.deepEqual(errors,[],label);
    await page.close();
  }
}finally{
  await browser.close();
  await new Promise(resolve=>server.close(resolve));
}
