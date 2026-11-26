import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {serve} from '../../../tests/serve.mjs';

const len=Math.hypot(1,.3745),c=1/len,s=.3745/len;
const at=(u,v)=>[u*c+v*s,-126.3-u*s+v*c];
const local=(x,z)=>[x*c-(z+126.3)*s,x*s+(z+126.3)*c];
const names={seat:'흰 곡면 화단 벤치',planting:'수경 화단의 바위와 늘어진 잎',stroller:'휴게광장 접이식 유아차'};
const server=await serve(0),browser=await chromium.launch({channel:'chromium',headless:true,
  args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});
try{
  const page=await browser.newPage({viewport:{width:940,height:600}}),requests=[],errors=[];
  page.on('request',req=>{if(req.url().includes('/gotomall-rest-garden/')&&req.url().endsWith('.glb'))requests.push(req.url().split('/').pop());});
  page.on('pageerror',e=>errors.push(e.message));
  const [x,z]=at(32,4.10),r=Math.atan2(s,c);
  await page.goto('http://127.0.0.1:'+server.address().port+'/index.html#/gotomall/B1?p='+[x,-6,z,(r-Math.PI/2)*180/Math.PI].join(','));
  await page.waitForFunction(()=>window.__world?.ready,null,{timeout:90000});
  await page.locator('#start').click();
  async function pose(u,v,yaw,pitch=0){
    await page.evaluate(([x,z,yaw,p])=>{const a=__world.player;a.teleport(x,-6,z,yaw);a.pitch=p;},[...at(u,v),yaw,pitch]);
    await page.waitForTimeout(340);
  }
  async function look(u,v,pitch=0){
    await page.evaluate(([tx,tz,pitch])=>{const a=__world.player;a.yaw=Math.atan2(a.x-tx,a.z-tz);a.pitch=pitch;},[...at(u,v),pitch]);
  }
  async function where(){
    const [x,z,y]=await page.evaluate(()=>{const {x,z,y}=__world.player;return [x,z,y];});
    return [...local(x,z),y];
  }
  async function walk(u,v){
    const from=await where(),dst=at(u,v);
    await look(u,v);
    await page.keyboard.down('w');
    try{await page.waitForFunction(([x,z])=>Math.hypot(__world.player.x-x,__world.player.z-z)<.15,dst,
      {timeout:Math.max(4000,Math.hypot(u-from[0],v-from[1])*420+1800)});}
    catch(e){throw new Error('Walk from '+from+' to '+[u,v]+' stopped at '+await where(),{cause:e});}
    finally{await page.keyboard.up('w');}
    assert.ok(Math.abs((await where())[2]+6)<.08,'shoppers remain on B1');
  }
  async function geometry(kind){
    return await page.evaluate(n=>{const o=__world.K.scene.getObjectByName('고투몰 · '+n);const g=o?.children[0].geometry;return g?.index?.count??g?.attributes.position.count??0;},names[kind]);
  }
  // Turn toward the area from a distant point before entering the same B1 hall on foot.
  await look(16.1,10.15);await page.waitForTimeout(400);
  assert.deepEqual(requests,[],'distant planting and stroller stay on silhouettes');
  // A cold close-up facing the other way must not request either fixture behind the camera.
  await pose(15.67,6.25,r);assert.deepEqual(requests,[],'behind the camera');
  await pose(31.85,4.10,r+Math.PI/2);
  // Follow the public side of the existing station mezzanine before turning into the seat aisle.
  await walk(31.0,7.30);await walk(30.23,9.81);await walk(22.08,9.81);
  await walk(21.26,7.53);await walk(16.10,7.53);await walk(16.10,6.55);
  await look(16.1,10.15,-.07);
  await page.waitForFunction(([a,b])=>[a,b].every(n=>__world.K.scene.getObjectByName('고투몰 · '+n)?.children[0].geometry.index?.count>3000),[names.seat,names.planting]);
  const loadedPlant=await geometry('planting');
  await walk(16.1,7.50);await walk(11.20,7.50);await walk(10.25,5.16);
  await look(7.8,5.1,-.32);
  await page.waitForFunction(n=>__world.K.scene.getObjectByName('고투몰 · '+n)?.children[0].geometry.index?.count>3000,names.stroller);
  await walk(9.08,5.1);await look(7.8,5.1,-.15);
  await page.keyboard.down('w');await page.waitForTimeout(680);await page.keyboard.up('w');
  const hit=await where();assert.ok(hit[0]>8.25&&hit[0]<8.51,'stroller frame contact '+hit);
  await walk(10.38,5.12);await walk(11.20,7.50);await walk(21.26,7.53);
  await walk(22.08,9.81);await walk(30.23,9.81);await walk(31.0,7.30);await walk(32.0,4.10);
  await look(16.1,10.15,-.015);await page.waitForTimeout(550);
  const distantPlant=await geometry('planting');
  assert.ok(distantPlant>0&&distantPlant<loadedPlant/5,'distant view returns to a silhouette');
  const surfaces=await page.evaluate(([rim,seat,walking])=>[rim,seat,walking].map(([x,z])=>__world.phys.support(x,z,-4.78).y),
    [at(16.1,8.98),at(16.1,8.60),at(16.1,7.50)]);
  assert.equal(surfaces[0],-6+.82);assert.equal(surfaces[1],-6+.45);assert.equal(surfaces[2],-6);
  assert.deepEqual(requests.sort(),['planting.glb','seat.glb','stroller.glb']);
  assert.deepEqual([...errors,...await page.evaluate(()=>[...__world.errors,...__world.K._.detailErrors])],[]);
  console.log(JSON.stringify({distantCold:0,behindCold:0,downloaded:requests,plantTriangles:loadedPlant/3,
    distantTriangles:distantPlant/3,strollerStop:hit[0],rimSeatAndWalk:surfaces}));
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
