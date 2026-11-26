// Start in the mural gallery, walk up and down the lounge terrace, then traverse its park elbow.
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {serve} from '../../../tests/serve.mjs';
const L=Math.hypot(130,335),u=[-130/L,-335/L],v=[u[1],-u[0]];
const point=(s,t)=>[-410+u[0]*s+v[0]*t,-45+u[1]*s+v[1]*t];
const server=await serve(0);
const browser=await chromium.launch({channel:'chromium',headless:true,args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});
try{
  const page=await browser.newPage({viewport:{width:1000,height:640}}),downloads=[],errors=[];
  page.on('request',q=>{if(q.url().includes('/sebit-lounge/')&&q.url().endsWith('.glb'))downloads.push(q.url().split('/').pop());});
  page.on('pageerror',e=>errors.push(e.message));
  const [x,z]=point(312,0);
  await page.goto('http://127.0.0.1:'+server.address().port+'/index.html#/onebailey/B1?p='+[x,-6,z,0].join(','));
  await page.waitForFunction(()=>window.__world?.ready,null,{timeout:90000});
  await page.locator('#start').click();
  const pose=async(from,to)=>{
    const [x,z]=from,angle=Math.atan2(x-to[0],z-to[1]);
    await page.evaluate(([x,z,angle])=>{__world.player.teleport(x,-6,z,angle);__world.player.pitch=-.05;},[x,z,angle]);
    await page.waitForTimeout(450);
  };
  const walk=async target=>{
    await page.evaluate(([x,z])=>{const p=__world.player;p.yaw=Math.atan2(p.x-x,p.z-z);},target);
    await page.keyboard.down('w');
    try{await page.waitForFunction(([x,z])=>Math.hypot(__world.player.x-x,__world.player.z-z)<.16,target,{timeout:12000});}
    finally{await page.keyboard.up('w');}
    return page.evaluate(()=>{const {x,y,z}=__world.player;return {y,zone:__world.phys.zoneAt(x,y+.17,z)?.name};});
  };
  await pose(point(312,0),point(308,0));
  assert.deepEqual(downloads,[],'the distant lounge has no GLB requests');
  await pose(point(351.15,.9),point(349,-7));
  assert.ok(!downloads.some(x=>x==='terrace.glb'||x==='plumes.glb'),'seating behind the player');
  await pose(point(351.15,.9),point(351.15,6.4));
  await page.waitForFunction(()=>{const m=__world.K.scene.getObjectByName('고터·세빛 라운지 · 계단식 휴게 좌석')?.children[0];return m&&!m.matrixAutoUpdate;});
  const levels=[];
  for(const d of [.28,.72,1.14,2.38])levels.push((await walk(point(351.15,3.08+d))).y);
  assert.deepEqual(levels.map(y=>Number(y.toFixed(2))),[-5.84,-5.68,-5.52,-5.52]);
  assert.equal((await walk(point(351.15,.9))).y,-6);
  await pose(point(351.15,.9),point(349.7,-6.9));
  await page.waitForFunction(()=>{const m=__world.K.scene.getObjectByName('고터·세빛 라운지 · 벽면 투사와 조명 레일')?.children[0];return m&&!m.matrixAutoUpdate;});
  const end=point(L,0),bend=[-526,-420],base=point(L-1,0);
  const dir=Math.hypot(bend[0]-base[0],bend[1]-base[1]);
  const park=base.map((q,i)=>q+(bend[i]-q)*12/dir);
  await pose(point(355.5,0),end);
  const zones=[];
  const a=[-513.03,-465.14],b=[-565.03,-596.26];
  const blend=(from,to,t)=>from.map((q,i)=>q+(to[i]-q)*t);
  for(const dest of [end,park,blend(park,bend,.55),bend,blend(bend,a,.5),a,blend(a,b,.04),a,blend(bend,a,.5),bend,blend(park,bend,.55),park,end,point(355.5,0)]){
    const here=await walk(dest);assert.equal(here.y,-6);zones.push(here.zone);
  }
  assert.ok(zones.includes('한강공원 연결 보행로'));
  assert.ok(zones.includes('한강공원 나들목'));
  assert.equal(zones.at(-1),'관광특구 라운지');
  assert.deepEqual(downloads.sort(),['plumes.glb','projection.glb','terrace.glb']);
  assert.deepEqual([...errors,...await page.evaluate(()=>[...__world.errors,...__world.K._.detailErrors])],[]);
  console.log(JSON.stringify({distantDownloads:0,downloads,terraceLevels:levels,roundTrip:zones}));
}finally{await browser.close();await new Promise(r=>server.close(r));}
