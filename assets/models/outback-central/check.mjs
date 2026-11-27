// Run from the repository root with node assets/models/outback-central/check.mjs.
// Ordinary W and the in-game lift buttons cover the arrivals hall and public dining gallery.
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {serve} from '../../../tests/serve.mjs';
import {terminalPoint} from '../../../js/places/sweet-park-plan.js';

const server=await serve(0);
const browser=await chromium.launch({channel:'chromium',args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});
const base='http://127.0.0.1:'+server.address().port+'/';
const restaurant='아웃백스테이크하우스 센트럴시티점';
const arrivals=[[167.1,8.4],[171,8.4],[171,-23.85],[170.55,-24.3],[170.1,-24.3],[169.65,-24.75],
  [169.65,-30.15],[168.3,-31.5],[167.4,-31.5],[166.95,-31.95],[166.95,-33.75],
  [167.4,-34.2],[167.4,-34.65],[167.85,-35.1],[167.85,-35.55]];
const liftApproach=[[167.85,-35.55],[167.85,-33.3],[166.95,-32.4],[166.95,-26.1],
  [167.4,-25.65],[168.3,-26.55],[168.75,-26.55],[169.2,-26.1],[169.2,-19.8],
  [166.95,-17.55],[166.95,-17.1],[164.25,-14.4],[164.25,-13.95],[162.45,-12.15],
  [162.45,-11.7],[162,-11.25],[162,-10.35],[161.55,-9.9],[161.55,-9.45],[161.1,-9],
  [161.1,-7.65],[161.55,-7.2],[161.55,-6.3],[161.1,-5.85],[160.2,-5.85]];
const gallery=[[160,-6],[160.45,-6.45],[160.9,-6],[161.35,-6],[168.55,-13.2],
  [181.15,-.6],[181.15,11.55],[180.7,12],[180.75,18.2],[180.75,23.6],[181.2,24.05],
  [184.8,24.05],[186.6,22.25],[187.05,22.25],[187.5,22.7],[191.1,22.7],
  [191.55,22.25],[191.55,20.45],[192,20],[192,-26.5]];
const errors=[];
const page=await browser.newPage({viewport:{width:900,height:600}});
page.on('pageerror',error=>errors.push(error.message));
const assets=[];
page.on('response',r=>{
  if(r.url().includes('/outback-central/') && r.url().endsWith('.glb')){
    assert.equal(r.status(),200);
    assets.push(r.url().split('/').pop());
  }
});

async function walk(label,points) {
  const targets=points.map(([s,t])=>terminalPoint(s,t));
  await page.evaluate(targets=>{
    const p=__world.player;
    const state=window.outbackTrip={i:0,metres:0,last:[p.x,p.z]};
    function steer(){
      const [lx,lz]=state.last;
      state.metres+=Math.hypot(p.x-lx,p.z-lz);
      state.last=[p.x,p.z];
      while(state.i<targets.length){
        const [x,z]=targets[state.i];
        if(Math.hypot(p.x-x,p.z-z)>=.23){
          p.yaw=Math.atan2(p.x-x,p.z-z);
          requestAnimationFrame(steer);
          return;
        }
        state.i++;
      }
    }
    steer();
  },targets);
  const start=Date.now();
  await page.keyboard.down('w');
  try {
    await page.waitForFunction(count=>window.outbackTrip?.i===count,targets.length,{timeout:65000});
  } finally {
    await page.keyboard.up('w');
  }
  const metres=await page.evaluate(()=>outbackTrip.metres);
  console.log(label,metres.toFixed(1)+' m',((Date.now()-start)/1000).toFixed(1)+' s');
}
async function selectFloor(label,floorY,hud) {
  await page.keyboard.press('e');
  assert.equal(await page.locator('#elev .elev-title').innerText(),'파미에스테이션 엘리베이터');
  await page.locator('.elev-list button').filter({has:page.locator('b',{hasText:new RegExp('^'+label+'$')})}).click();
  await page.waitForFunction(([y,text])=>Math.abs(__world.player.y-y)<.1 &&
    document.querySelector('#zone').innerText===text,[floorY,hud]);
}

try {
  await page.goto(base+'?q=low&fixedres=1&traffic=0#/newcore/5F');
  await page.waitForFunction(()=>window.__world?.ready);
  await page.locator('#start').click();
  await page.keyboard.press('m');
  await page.locator('#map-search').fill('스벅 호남선');
  const coffee=page.locator('.gt-result').filter({hasText:'스타벅스 센트럴시티점 입구'});
  assert.equal(await coffee.count(),1);
  await coffee.click();
  await page.locator('.gt-teleport').click();
  await page.waitForFunction(()=>window.__world?.ready && !__world.map.isOpen() && __world.area.includes('centralcity'));
  const navigationStart=await page.evaluate(()=>performance.timeOrigin);
  await walk('지도 입구 시점 → 스타벅스 문 안',[[171.85,15.15]]);
  await page.waitForFunction(()=>Math.abs(__world.player.y-.96)<.06 &&
    document.querySelector('#zone').innerText==='스타벅스 센트럴시티점 · 1F');
  // Leave through the same open door and descend the café steps before
  // turning along its frontage. The café side wall is continuous.
  await walk('스타벅스 문 안 → 대합실 바닥',[[167.1,15.46]]);
  assert.ok(Math.abs(await page.evaluate(()=>__world.player.y))<.06);
  await walk('대합실 → 호남선 하차장',arrivals);
  await page.waitForFunction(()=>document.querySelector('#zone').innerText==='호남선 하차장 · 1F');
  assert.ok(!assets.includes('reception.glb'));
  await walk('하차장 → 승강기',liftApproach.slice(1));
  await selectFloor('2F',5,'파미에스테이션 엘리베이터 홀 · 2F');
  await walk('2층 승강기 홀 → 중층 매장 입구',gallery);
  await walk('입구 → 접수 바',[[194.6,-26.5]]);
  await page.waitForFunction(name=>document.querySelector('#zone').innerText===name+' · 1M',restaurant);
  assert.equal(assets.filter(file=>file==='reception.glb').length,1);
  await walk('접수 바 → 승강기',[[192,-26.5],...gallery.slice(0,-1).reverse()]);
  await selectFloor('1F',0,'파미에스테이션 · 하차장 · 1F');
  await walk('승강기 → 하차장',liftApproach.slice(0,-1).reverse());
  assert.equal(await page.evaluate(()=>performance.timeOrigin),navigationStart);
  assert.deepEqual(errors,[]);
  assert.deepEqual(await page.evaluate(()=>__world.errors),[]);
  console.log('승강기 버튼 왕복, 매장 접수, 같은 장면 및 오류 검사 통과');
} finally {
  await browser.close();
  await new Promise(resolve=>server.close(resolve));
}
