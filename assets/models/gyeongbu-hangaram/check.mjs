// Access from the public B1 passage, floor/view streaming, and the two sample-wall approaches.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {chromium} from 'playwright';
import {serve} from '../../../tests/serve.mjs';

const out=process.argv[2];if(out)await fs.mkdir(out,{recursive:true});
const server=await serve(0),browser=await chromium.launch({channel:'chromium',
  args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});
const page=await browser.newPage({viewport:{width:1000,height:670},deviceScaleFactor:1}),hits={},errors=[];
page.on('pageerror',e=>errors.push(e.message));
page.on('response',response=>{
  const url=new URL(response.url());
  if(url.pathname.includes('/gyeongbu-hangaram/')&&url.pathname.endsWith('.glb')){
    assert.equal(response.status(),200);const n=url.pathname.split('/').at(-1);hits[n]=(hits[n]??0)+1;
  }
});
const base='http://127.0.0.1:'+server.address().port+'/index.html?fixedres=1#/gyeongbu/';
const xy=(u,v)=>[2.3+u*.9348+v*.3552,-59.24-u*.3552+v*.9348];
async function open(u,v,y,floor,yaw){
  const [x,z]=xy(u,v);await page.goto('about:blank');await page.goto(base+floor+'?p='+[x,y,z,yaw].join(','));
  await page.waitForFunction(()=>window.__world?.ready,null,{timeout:150000});await page.waitForTimeout(450);
}
try{
  await open(93.20,10.73,0,'1F',-159.19);assert.deepEqual(hits,{});
  await open(93.20,10.73,-6,'B1',20.81);assert.deepEqual(hits,{});
  // Look diagonally down the same passage first. Only the room is within its camera request radius.
  const [ax,az]=xy(83.0,9.80),[bx,bz]=xy(92.70,12.80);
  await page.evaluate(({ax,az,bx,bz})=>{document.getElementById('start').click();const w=window.__world;
    w.daylight.setMode('day');w.player.x=ax;w.player.z=az;w.player.yaw=Math.atan2(ax-bx,az-bz);},{ax,az,bx,bz});
  await page.waitForFunction(()=>window.__world.scene.getObjectByName('한가람문구 · 맞춤액자 코너')?.children[0].geometry.attributes.position.count>500,null,{timeout:12000});
  assert.equal(hits['frame-room.glb'],1);assert.equal(hits['frame-inlay.glb']??0,0);
  await page.keyboard.press('m');await page.locator('#map-search').fill('지하 1층 한가람문구 맞춤액자');
  await page.locator('.gt-result').filter({hasText:'지하 1층 한가람문구 맞춤액자'}).first().click();await page.locator('.gt-teleport').click();
  await page.waitForFunction(()=>window.__world.scene.getObjectByName('한가람문구 · 액자 금박과 견본화')?.children[0].geometry.attributes.position.count>200,null,{timeout:12000});
  const start=await page.evaluate(()=>{const p=window.__world.player;return {x:p.x,z:p.z,y:p.y,yaw:p.yaw*180/Math.PI};});
  const [x,z]=xy(93.20,10.73);assert.ok(Math.hypot(x-start.x,z-start.z)<.08);assert.ok(Math.abs(start.y+6)<.10);
  if(out)await page.screenshot({path:path.join(out,'front.png')});
  await page.keyboard.down('w');
  await page.waitForFunction(({x,z})=>Math.hypot(window.__world.player.x-x,window.__world.player.z-z)>4.14,start,{timeout:10000});
  await page.keyboard.up('w');await page.waitForTimeout(200);
  const result=await page.evaluate(async(start)=>{
    const w=window.__world,p=w.player,failed=[],world=(u,v)=>[2.3+u*.9348+v*.3552,-59.24-u*.3552+v*.9348];
    function check(u,v){
      const [x,z]=world(u,v),pp={x,z};w.phys.resolve(pp,.32,-6,-4.25,.5);
      if(Math.hypot(pp.x-x,pp.z-z)>.035||Math.abs(w.phys.support(x,z,-5.60).y+6)>.10)failed.push([u,v]);
    }
    for(let vx=10.32;vx<16.54;vx+=.13)for(const u of [92.91,93.12,93.40])check(u,vx);
    for(let u=90.08;u<95.91;u+=.14)check(u,11.63);
    for(let u=90.82;u<95.27;u+=.14)check(u,13.58);
    let prev;const frames=[];
    await new Promise(done=>requestAnimationFrame(function sample(t){if(prev!==undefined)frames.push(t-prev);prev=t;
      if(frames.length===65)done();else requestAnimationFrame(sample);}));
    frames.sort((a,b)=>a-b);
    return {walk:Math.hypot(p.x-start.x,p.z-start.z),y:p.y,zone:document.querySelector('#zone')?.textContent,
      failed,p95:frames[61],max:frames.at(-1),errors:w.errors};
  },start);
  assert.equal(hits['frame-inlay.glb'],1);assert.deepEqual(result.failed,[]);assert.deepEqual(result.errors,[]);assert.deepEqual(errors,[]);
  assert.ok(result.walk>4.14&&result.walk<4.73);assert.ok(Math.abs(result.y+6)<.1);assert.ok(result.zone.includes('맞춤액자'));
  if(out)await page.screenshot({path:path.join(out,'gallery.png')});
  console.log(JSON.stringify({hits,start,result},null,2));
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
