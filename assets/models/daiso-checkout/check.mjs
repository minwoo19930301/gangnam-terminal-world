// Search from another building and walk to the public side of the packing counter.
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {serve} from '../../../tests/serve.mjs';

const server=await serve(), browser=await chromium.launch({channel:'chromium',headless:true});
try{
  const page=await browser.newPage({viewport:{width:390,height:844}});
  const transfers=[], errors=[];
  page.on('pageerror',err=>errors.push(err.message));
  page.on('response',r=>{if(r.url().endsWith('/daiso-checkout/counter.glb')) transfers.push(r.status());});
  await page.goto('http://127.0.0.1:'+server.address().port+'/?q=low#/newcore/5F');
  await page.waitForFunction(()=>window.__world?.ready);
  await page.locator('#start').click();
  assert.deepEqual(transfers,[]);
  await page.keyboard.press('m');
  const search=page.locator('#map-search');
  if(!await search.isVisible())await page.getByRole('button',{name:'장소 목록 열기'}).click();
  await search.fill('다이소 셀프계산대');
  const result=page.locator('.gt-result');
  await result.first().waitFor();
  assert.equal(await result.count(),1);
  assert.match(await result.innerText(),/매장 내부/);
  await result.click();
  await page.locator('.gt-teleport').click();
  await page.waitForFunction(()=>window.__world?.ready && __world.area.includes('gyeongbu') && !__world.map.isOpen());
  await page.waitForFunction(()=> {
    let ready=false;
    __world.K.scene.traverse(obj=>{
      if(obj.name==='다이소 · 셀프계산과 포장 봉투' && obj.children[0]?.matrixAutoUpdate===false)ready=true;
    });
    return ready;
  });
  const at=()=>page.evaluate(()=>{
    const {x,z,y,pitch}=__world.player;
    return {x,z,y,pitch,zone:document.querySelector('#zone').innerText};
  });
  const start=await at();
  assert.match(start.zone,/다이소/);
  assert.ok(Math.abs(start.y+4)<.05 && Math.abs(start.pitch*180/Math.PI+10)<1);
  await page.keyboard.down('w');
  try{await page.waitForFunction(([x,z])=>Math.hypot(__world.player.x-x,__world.player.z-z)>.82,[start.x,start.z]);}
  finally{await page.keyboard.up('w');}
  await page.keyboard.down('s');
  try{await page.waitForFunction(([x,z])=>Math.hypot(__world.player.x-x,__world.player.z-z)<.22,[start.x,start.z]);}
  finally{await page.keyboard.up('s');}
  assert.deepEqual(transfers,[200]);
  assert.deepEqual([...errors,...await page.evaluate(()=>__world.errors)],[]);
  console.log('뉴코아 → 지도 검색 → 다이소 4번 출입구 셀프 계산대, W/S 왕복, 상세 모델 1회');
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
