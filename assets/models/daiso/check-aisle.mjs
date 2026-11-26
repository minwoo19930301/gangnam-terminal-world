// Walk a shelf run, change aisles, then approach both faces of the textile stands.
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {serve} from '../../../tests/serve.mjs';
const W=(u,v)=>[2.3+.9348*u+.3552*v,-59.24-.3552*u+.9348*v];
const server=await serve(0),browser=await chromium.launch({channel:'chromium',headless:true,args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});
try{
  const page=await browser.newPage({viewport:{width:1000,height:640}}),downloads=[],errors=[];
  page.on('request',r=>{if(r.url().includes('/concourse-fixtures/')&&r.url().endsWith('.glb'))downloads.push(r.url().split('/').pop());});
  page.on('pageerror',e=>errors.push(e.message));
  const [x,z]=W(172,6.6);
  await page.goto('http://127.0.0.1:'+server.address().port+'/index.html#/gyeongbu/B1?p='+[x,-4,z,0].join(','));
  await page.waitForFunction(()=>window.__world?.ready,null,{timeout:90000});await page.locator('#start').click();
  async function pose(u,v,tu,tv){
    const [x,z]=W(u,v),[tx,tz]=W(tu,tv);
    await page.evaluate(([x,z,a])=>{const p=__world.player;p.teleport(x,-4,z,a);p.pitch=-.12;},[x,z,Math.atan2(x-tx,z-tz)]);
    await page.waitForTimeout(520);
  }
  async function walk(u,v){
    const target=W(u,v);
    await page.evaluate(([x,z])=>{const p=__world.player;p.yaw=Math.atan2(p.x-x,p.z-z);},target);
    await page.keyboard.down('w');
    try{await page.waitForFunction(([x,z])=>Math.hypot(__world.player.x-x,__world.player.z-z)<.15,target,{timeout:14000});}
    finally{await page.keyboard.up('w');}
  }
  async function waitBank(high){
    await page.waitForFunction(high=>{
      const list=__world.K._.details,stock=list.find(d=>d.name==='다이소 매대 재고 2,1'),image=list.find(d=>d.name==='다이소 원거리 상품 2,1');
      return high ? stock.built&&!stock.hidden&&image.hidden : image.built&&!image.hidden&&(!stock.built||stock.hidden);
    },high,{timeout:8500});
  }
  async function bayTriangles(u,high){
    const target=W(u,-2.91);
    await page.waitForFunction(([x,z,high])=>{
      const o=__world.K.scene.children.find(m=>m.name.startsWith('다이소 쿠션 진열 ·')&&Math.hypot(m.position.x-x,m.position.z-z)<.03);
      const count=o?.geometry.index.count/3;return count>0&&(high?count>10000:count<3000);
    },[...target,high],{timeout:7000});
    return page.evaluate(([x,z])=>__world.K.scene.children.find(m=>m.name.startsWith('다이소 쿠션 진열 ·')&&Math.hypot(m.position.x-x,m.position.z-z)<.03).geometry.index.count/3,target);
  }
  await pose(173.6,6.6,203,8.7);await waitBank(false);
  assert.equal(await page.evaluate(()=>__world.K._.details.find(d=>d.name==='다이소 매대 재고 2,1').built),false);
  assert.deepEqual(downloads,['ticket-kiosk.glb'],'the terminal entrance must not preload its basement cushion collection');
  await walk(197.1,6.6);await waitBank(true);
  await walk(173.6,6.6);await waitBank(false);
  await pose(255.65,-5.0,255.65,-9.1);await pose(255.1,-.26,255.5,-2.91);
  const coarse=await bayTriangles(255.65,false);
  assert.ok(!downloads.includes('cushions.glb'),'turned and back-facing stands keep their fabric silhouettes');
  await pose(255.65,-5.0,255.65,-2.91);const west=await bayTriangles(255.65,true);
  await pose(255.1,-.26,255.5,-2.91);assert.equal(await bayTriangles(255.65,false),coarse);
  await pose(271.85,.58,271.82,-2.91);await walk(271.85,-.42);
  const east=await bayTriangles(271.25,true);
  assert.equal(await page.evaluate(()=>__world.phys.zoneAt(__world.player.x,__world.player.y+.12,__world.player.z)?.name),'다이소 홈·욕실·청소용품');
  await pose(173.6,6.6,203,8.7);await waitBank(false);
  assert.deepEqual(downloads,['ticket-kiosk.glb','cushions.glb']);
  assert.deepEqual([...errors,...await page.evaluate(()=>[...__world.errors,...__world.K._.detailErrors])],[]);
  console.log(JSON.stringify({downloads,farBankAtEntrance:true,walkedToStockAndBack:true,cushionBayTriangles:{far:coarse,west,east}}));
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
