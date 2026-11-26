// Traverse the mall's Line 9 well with normal input, including the floor change.
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { serve } from './serve.mjs';

const server=await serve(0);
const browser=await chromium.launch({channel:'chromium',args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});
try {
  for(const [floor,start,z,y,yaw,down] of [['B1',.4,-134.4,-6.2,-90,true],['B4',29.4,-132.3,-20.7,90,false]]){
    const page=await browser.newPage({viewport:{width:750,height:450}});
    let documents=0;
    page.on('request',request=>{if(request.resourceType()==='document'&&request.frame()===page.mainFrame())documents++;});
    await page.goto('http://127.0.0.1:'+server.address().port+'/?q=low&traffic=0#/station/'+floor+'?p='+[start,y,z,yaw],{waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>window.__world?.ready,null,{timeout:120000});
    if(await page.locator('#start').isVisible())await page.locator('#start').click();
    await page.keyboard.down('w');
    try {
      await page.waitForFunction(descending=>{
        const p=window.__world?.player;
        return p&&(descending?p.x>30.5&&p.y<-20.8:p.x<-.2&&p.y>-6.2);
      },down,{timeout:30000});
    } finally { await page.keyboard.up('w'); }
    assert.equal(documents,1);
    const state=await page.evaluate(()=>({area:__world.area,errors:__world.errors}));
    assert.deepEqual(state,{area:'in:gotomall+station',errors:[]});
    await page.close();
    console.log(down?'B1 boarding → B4 landing':'B4 boarding → B1 landing');
  }
} finally {
  await browser.close();
  await new Promise(resolve=>server.close(resolve));
}
