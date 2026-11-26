// Enter the photographed customer frontage, walk between the tables and return through the side arch.
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {serve} from '../../../tests/serve.mjs';

const angle=Math.atan2(.3639,.9315),a=Math.sin(angle),b=Math.cos(angle),front=178.26,mid=16.30754854571214;
const at=(x,d)=>[-135.7+a*(front-d)+b*(mid+x),9.9+b*(front-d)-a*(mid+x)];
const local=(x,z)=>[(x+135.7)*b-(z-9.9)*a-mid,front-(x+135.7)*a-(z-9.9)*b];
const names={arches:'갈색 아치와 청색 커피 벽',bar:'흰 곡면 커피바와 추출 장비',seats:'각진 스툴과 창가 금속 벤치',
  pastry:'버터바와 약과 쿠키 진열장',latte:'버터크림라떼와 바통 휘낭시에'};
const server=await serve(0),browser=await chromium.launch({channel:'chromium',headless:true,
  args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});
try{
  const p=await browser.newPage({viewport:{width:960,height:620}}),requests=[],errors=[];
  p.on('pageerror',e=>errors.push(e.message));
  p.on('request',q=>{if(q.url().includes('/models/halff/')&&q.url().endsWith('.glb'))requests.push(q.url().split('/').pop());});
  const [x,z]=at(-54,-1.8);
  await p.goto('http://127.0.0.1:'+server.address().port+'/index.html#/famille/2F?p='+[x,5,z,0].join(','));
  await p.waitForFunction(()=>window.__world?.ready,null,{timeout:90000});await p.locator('#start').click();
  async function pose(x,d,yaw,height=5){
    await p.evaluate(([x,z,yaw,h])=>{__world.player.teleport(x,h,z,yaw);__world.player.pitch=0;},[...at(x,d),yaw,height]);
    await p.waitForTimeout(360);
  }
  async function look(x,d,pitch=0){
    await p.evaluate(([x,z,v])=>{const a=__world.player;a.yaw=Math.atan2(a.x-x,a.z-z);a.pitch=v;},[...at(x,d),pitch]);
  }
  async function where(){
    const [x,z,y,zone]=await p.evaluate(()=>{const {x,y,z}=__world.player;return [x,z,y,__world.phys.zoneAt(x,y+.1,z)?.name];});
    return [...local(x,z),y,zone];
  }
  async function walk(x,d){
    const start=await where();await look(x,d);await p.keyboard.down('w');
    try{await p.waitForFunction(([x,z])=>Math.hypot(__world.player.x-x,__world.player.z-z)<.14,at(x,d),
      {timeout:Math.max(3900,Math.hypot(start[0]-x,start[1]-d)*450+1300)});}
    catch(e){throw new Error('Walk '+start+' to '+[x,d]+' ended at '+await where(),{cause:e});}
    finally{await p.keyboard.up('w');}
    assert.ok(Math.abs((await where())[2]-5)<.12,'2F floor');
  }
  async function loaded(file) {
    await p.waitForFunction(n=>__world.K.scene.getObjectsByProperty('name','하프커피 · '+n).some(o=>(o.children[0].geometry.index?.count||0)>3000),names[file]);
  }
  await look(0,3);await p.waitForTimeout(310);
  assert.deepEqual(requests,[],'no cold downloads from the other end of the gallery');
  await pose(1.05,8.55,angle+Math.PI);
  assert.deepEqual(requests,[],'opaque blue rear wall hides the interior');
  await pose(-3.52,-1.87,angle+Math.PI);
  assert.deepEqual(requests,[],'facing away in the customer gallery');
  await pose(5.54,-.62,angle);await look(2.61,4.74,-.11);await p.waitForTimeout(370);
  assert.ok(!requests.includes('pastry.glb'),'solid facade pier hides the close pastry case');
  await pose(-8.26,-1.86,angle-Math.PI/2);
  await walk(-3.52,-1.86);await walk(-3.52,.80);await walk(-1.75,1.01);await walk(-1.76,2.80);
  const inside=await where();assert.equal(inside[3],'하프커피');
  await look(-.55,5.04,-.07);await loaded('bar');await loaded('arches');await loaded('seats');
  await walk(.31,2.80);await walk(1.70,3.58);
  await look(2.61,4.74,-.21);await loaded('pastry');
  await walk(2.61,3.58);await look(2.61,4.74);
  await p.keyboard.down('w');await p.waitForTimeout(520);await p.keyboard.up('w');
  const contact=await where();assert.ok(contact[1]>3.80&&contact[1]<4.02,'the real counter front '+contact);
  await walk(1.70,3.48);await walk(.3,2.80);await walk(-1.76,2.80);await walk(-1.75,1.01);
  await look(-3.54,1.92,-.55);await loaded('latte');
  await walk(-2.42,.99);await walk(-4.84,.99);await walk(-5.22,3.05);await walk(-5.17,4.65);await walk(-6.82,4.65);
  const side=await where();assert.ok(side[0]<-6.62,'exit the public side arch');
  await pose(7.37,3.95,angle+Math.PI/2);await look(3.3,4.85);await p.waitForTimeout(340);
  assert.equal(await p.evaluate(()=>{const d=__world.K._.details.find(d=>d.name==='하프커피 FP212');return !!d?.built&&!d.hidden;}),true,'visible through the real side window');
  await pose(5.54,-.62,angle);await look(2.61,4.74,-.11);await p.waitForTimeout(320);
  const hiddenPastry=await p.evaluate(()=>__world.K.scene.getObjectByName('하프커피 · 버터바와 약과 쿠키 진열장').children[0].geometry.index.count);
  assert.ok(hiddenPastry<1000,'the warm-cache pastry falls back behind the opaque pier');
  await pose(-1,9.37,angle+Math.PI);await p.waitForTimeout(280);
  assert.equal(await p.evaluate(()=>__world.K._.details.find(d=>d.name==='하프커피 FP212').hidden),true,'back wall hides the warm cache');
  const heights=await p.evaluate(points=>points.map(([x,z])=>__world.phys.support(x,z,6.2).y),
    [at(2.72,4.86),at(-3.54,1.92),at(-3.52,.80)]);
  assert.deepEqual(heights.map(v=>+v.toFixed(3)),[6.012,5.417,5]);assert.deepEqual(requests.sort(),['arches.glb','bar.glb','latte.glb','pastry.glb','seats.glb']);
  assert.deepEqual([...errors,...await p.evaluate(()=>[...__world.errors,...__world.K._.detailErrors])],[]);
  console.log(JSON.stringify({farRequest:0,behindRequest:0,opaqueRearCold:0,pierPastryCold:0,hiddenPastryTriangles:hiddenPastry/3,downloads:requests,inside:inside[3],counterDepth:contact[1],side:side[3],heights}));
}finally{await browser.close();await new Promise(r=>server.close(r));}
