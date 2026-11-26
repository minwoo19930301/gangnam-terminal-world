import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {serve} from '../../../tests/serve.mjs';

const server=await serve(0),browser=await chromium.launch({headless:true,channel:'chromium',args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});
const base='http://127.0.0.1:'+server.address().port;
const name='모던하우스 · 딸기와 데이지 러그';
const rack=[280.01356,-356.83399], front=[-.92394191,.38253281],side=[.38253281,.92394191];
const at=(depth,across=0)=>rack.map((v,i)=>v+front[i]*depth+side[i]*across);
const facing=(a,b)=>Math.atan2(a[0]-b[0],a[1]-b[1])*180/Math.PI;
try{
  for(const [view,pos,height,angle] of [
    ['far',at(12),14.2,0],['back',at(-1.8),14.2,0],['above',at(2.6),18.6,0],
    ['turned',at(2.5),14.2,180],['front',at(2.55,.22),14.2,0]
  ]){
    const page=await browser.newPage({viewport:{width:1024,height:650}}),errors=[],requests=[];
    page.on('pageerror',e=>errors.push(e.message));
    page.on('request',r=>{if(r.url().endsWith('/modernhouse-picnic/rugs.glb'))requests.push(r.url());});
    await page.addInitScript(()=>sessionStorage.setItem('sky-mode','day'));
    const yaw=facing(pos,rack)+angle, route='/?pitch=-8#/newcore/'+(height===14.2?'4F':'5F')+
      '?p='+[pos[0].toFixed(4),height,pos[1].toFixed(4),yaw.toFixed(2)].join(',');
    await page.goto(base+route);await page.waitForFunction(()=>window.__world?.ready);
    await page.locator('#start').click();
    if(view==='front'){
      await page.waitForFunction(name=>(__world.scene.getObjectByName(name)?.children[0]?.geometry.index?.count??0)>2000,name);
      await page.evaluate(()=>document.body.classList.add('shot'));
      await page.waitForTimeout(300);
      if(process.argv[2])await page.locator('canvas').first().screenshot({path:process.argv[2],quality:94});
      const triangles=await page.evaluate(name=>__world.scene.getObjectByName(name).children[0].geometry.index.count/3,name);
      await page.keyboard.down('w');await page.waitForTimeout(230);await page.keyboard.up('w');
      const player=await page.evaluate(()=>[__world.player.x,__world.player.y,__world.player.z]);
      assert.ok(Math.hypot(player[0]-pos[0],player[2]-pos[1])>.35);
      assert.ok(Math.abs(player[1]-14.2)<.10);
      console.log(JSON.stringify({view,route,triangles,requests:requests.length}));
    }else await page.waitForTimeout(450);
    assert.equal(requests.length,view==='front'?1:0,view);
    assert.deepEqual([...errors,...await page.evaluate(()=>[...__world.errors,...__world.K._.detailErrors])],[]);
    await page.close();
  }
}finally{await browser.close();await new Promise(r=>server.close(r));}
