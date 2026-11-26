import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {serve} from '../../../tests/serve.mjs';

const server=await serve(0);
const browser=await chromium.launch({channel:'chromium',headless:true,
  args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});
const address='http://127.0.0.1:'+server.address().port+'/?q=low&fixedres=1&traffic=0#/';
const subject='본관 8층 · 백화점 층별 안내';
const near='shinsegae/8F?p=-32.37409,35.8,21.14732,';

async function visit(path){
  const page=await browser.newPage({viewport:{width:1050,height:660}});
  const requests=[],errors=[];
  const cdp=await page.context().newCDPSession(page);
  await cdp.send('Network.enable');
  const files=new Map();
  cdp.on('Network.responseReceived',({requestId,response})=>{
    if(response.url.includes('/ssg-lift-directory/'))files.set(requestId,response.url.split('/').pop());
  });
  cdp.on('Network.loadingFinished',({requestId,encodedDataLength})=>{
    if(files.has(requestId))requests.push([files.get(requestId),encodedDataLength]);
  });
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto(address+path);
  await page.waitForFunction(()=>window.__world?.ready);
  await page.locator('#start').click();
  return {page,requests,errors};
}

try{
  for(const path of ['shinsegae/9F','shinsegae/8F','shinsegae/8F?p=-26,35.8,19,-250,0']){
    const {page,requests,errors}=await visit(path);
    await page.waitForTimeout(650);
    assert.equal(requests.length,0,path);assert.deepEqual(errors,[]);
    await page.close();
  }
  const {page,requests,errors}=await visit(near+'100.73335,4');
  await page.waitForTimeout(600);
  assert.equal(requests.length,0,'facing away');
  await page.evaluate(()=>{
    // Use the same pointer-lock mouse event that controls a normal visit.
    if(!document.pointerLockElement)return __world.renderer.domElement.requestPointerLock();
  });
  await page.waitForFunction(()=>document.pointerLockElement!==null);
  await page.evaluate(()=>document.dispatchEvent(new MouseEvent('mousemove',{movementX:1428,bubbles:true})));
  await page.waitForFunction(n=>__world.K._.details.find(d=>d.name===n)?.built,subject);
  await page.waitForTimeout(150);
  assert.deepEqual(requests.map(r=>r[0]).sort(),['model.js','print.js','surface.js']);
  console.log('front',requests);
  assert.deepEqual(errors,[]);
  await page.close();

  const trip=await visit('shinsegae/8F?p=-30.78002,35.8,19.74018,-69.21615');
  await trip.page.keyboard.down('w');await trip.page.waitForTimeout(150);await trip.page.keyboard.up('w');
  for(const [floor,height] of [['7F',31],['8F',35.8]]){
    await trip.page.keyboard.press('e');
    const button=trip.page.locator('#elev:not(.hidden) .elev-list button')
      .filter({has:trip.page.getByText(floor,{exact:true})});
    await button.click({timeout:3500});
    await trip.page.waitForFunction(([id,y])=>Math.abs(__world.player.y-y)<.08 &&
      document.querySelector('#zone').innerText.includes(id) && location.hash.includes('/'+id),[floor,height],{timeout:9000});
    console.log('arrival',await trip.page.locator('#zone').innerText());
  }
  assert.deepEqual(trip.errors,[]);await trip.page.close();
}finally{
  await browser.close();
  server.close();
}
