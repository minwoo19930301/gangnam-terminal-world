import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {serve} from '../../../tests/serve.mjs';

const len=Math.hypot(1,.3745),c=1/len,s=.3745/len,r=Math.atan2(s,c);
const at=(u,v)=>[c*u+s*v,-126.3-s*u+c*v];
const local=(x,z)=>[c*x-s*(z+126.3),s*x+c*(z+126.3)];
const server=await serve(0),browser=await chromium.launch({channel:'chromium',headless:true,
  args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});
try{
  const p=await browser.newPage({viewport:{width:940,height:600}}),requests=[],errors=[];
  p.on('pageerror',e=>errors.push(e.message));
  p.on('request',q=>{if(q.url().includes('/gotomall-west-seats/')&&q.url().endsWith('.glb'))requests.push(q.url().split('/').pop());});
  const [x,z]=at(15.67,6.25);
  await p.goto('http://127.0.0.1:'+server.address().port+'/index.html#/gotomall/B1?p='+[x,-6,z,0].join(','));
  await p.waitForFunction(()=>window.__world?.ready,null,{timeout:90000});await p.locator('#start').click();
  const where=async()=>{const [x,z,y]=await p.evaluate(()=>{const a=__world.player;return [a.x,a.z,a.y];});return [...local(x,z),y];};
  async function pose(u,v,yaw){
    await p.evaluate(([x,z,a])=>{__world.player.teleport(x,-6,z,a);__world.player.pitch=0;},[...at(u,v),yaw]);
    await p.waitForTimeout(360);
  }
  async function turn(u,v){
    await p.evaluate(([x,z])=>{const a=__world.player;a.yaw=Math.atan2(a.x-x,a.z-z);},at(u,v));
  }
  async function walk(u,v){
    const [su,sv]=await where();await turn(u,v);await p.keyboard.down('w');
    try{await p.waitForFunction(([x,z])=>Math.hypot(__world.player.x-x,__world.player.z-z)<.145,at(u,v),
      {timeout:Math.max(3600,Math.hypot(su-u,sv-v)*430+1200)});}
    catch(e){throw new Error('Walk '+[su,sv]+' to '+[u,v]+' ended at '+await where(),{cause:e});}
    finally{await p.keyboard.up('w');}
  }
  await turn(-305,0);await p.waitForTimeout(380);
  assert.deepEqual(requests,[],'the central planted area does not download west furniture');
  await pose(-298.30,5.55,r-Math.PI/2);assert.deepEqual(requests,[],'the lounge is behind the camera');
  await pose(-294.0,6.18,r+Math.PI/2);
  await walk(-300.10,6.18);await walk(-300.10,1.71);
  await turn(-304.30,-.15);await p.waitForTimeout(450);
  await p.waitForFunction(()=>__world.K.scene.getObjectsByProperty('name','고투몰 서편 · 기둥의 곡면 유리').some(o=>o.children[0].geometry.index?.count===288));
  // Walk between two ends of the curved stone sections, touch the column and return to the public aisle.
  const centre=[-304.30,-.15],rad=d=>[centre[0]+Math.sin(Math.PI/3)*d,centre[1]+.5*d];
  await walk(...rad(2.9));await walk(...rad(1.03));await turn(...centre);
  await p.keyboard.down('w');
  try{await p.waitForFunction(([x,z])=>Math.hypot(__world.player.x-x,__world.player.z-z)<.69,at(...centre),{timeout:2000});}
  finally{await p.keyboard.up('w');}
  const [cu,cv,feet]=await where(),contact=Math.hypot(cu-centre[0],cv-centre[1]);
  assert.ok(contact>.62&&contact<.76,'column contact after walking through the gap '+[cu,cv,contact]);
  assert.equal(feet,-6);
  await walk(...rad(2.9));await walk(-300.10,6.18);await walk(-311.1,6.18);await turn(-315.4,-.15);
  await p.waitForTimeout(350);
  const copies=await p.evaluate(()=>{const count={};__world.K.scene.traverse(o=>{
    if(o.isGroup&&o.name.startsWith('고투몰 서편 · '))count[o.name]=(count[o.name]??0)+1;
  });return count;});
  assert.equal(copies['고투몰 서편 · 두 줄 석재의 곡선 벤치'],8);
  assert.equal(copies['고투몰 서편 · 기둥 금속틀과 식재'],2);
  assert.equal(copies['고투몰 서편 · 기둥의 곡면 유리'],2);
  assert.equal(copies['고투몰 서편 · 바닥의 밝은 석재 상감'],1);
  const height=await p.evaluate(([x,z])=>__world.phys.support(x,z,-4.90).y,at(-304.30,1.58));
  assert.ok(Math.abs(height-(-6+.455))<1e-4,'actual top of west seat');
  await pose(15.67,6.25,r+Math.PI);
  const hidden=await p.evaluate(()=>__world.K._.details.find(d=>d.name==='고투몰 서편 화강석 휴게석')?.hidden);
  assert.equal(hidden,true,'west fixtures are hidden on returning to the planted lounge');
  const oldSeat=await p.evaluate(([x,z])=>__world.phys.support(x,z,-5.45).y,at(5.2,8.94));
  assert.equal(oldSeat,-6,'the inferred duplicate stone seat is cleared from the planted area');
  assert.deepEqual(requests.sort(),['column.glb','glass.glb','inlay.glb','seat.glb']);
  assert.deepEqual([...errors,...await p.evaluate(()=>[...__world.errors,...__world.K._.detailErrors])],[]);
  console.log(JSON.stringify({centralCold:0,behindCold:0,downloads:requests,copies,columnContact:contact,
    westSeat:height,centralFloor:oldSeat,westHiddenFromCentral:hidden}));
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
