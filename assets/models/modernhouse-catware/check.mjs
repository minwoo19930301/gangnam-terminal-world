// Follow the public aisle from the unmodified 4F arrival and hold only the tableware GLB.
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {serve} from '../../../tests/serve.mjs';

const server=await serve(0);
const browser=await chromium.launch({headless:true,channel:'chromium',
  args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});
try{
  const page=await browser.newPage({viewport:{width:940,height:600}}),errors=[];
  const url='http://127.0.0.1:'+server.address().port+'/?q=low&traffic=0&fixedres=1#/newcore/';
  const name='모던하우스 · 고양이 식기 진열대';
  let requests=0,release;
  page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/modernhouse-catware/catware.glb',async route=>{
    requests++;await new Promise(done=>{release=done;});await route.continue();
  });
  async function open(address){
    await page.goto('about:blank');await page.goto(url+address);
    await page.waitForFunction(()=>window.__world?.ready);
    await page.waitForTimeout(250);
  }
  for(const address of ['5F','4F?p=294.27627,14.2,-332.79834,112.49,-22',
                         '4F?p=291.87749,14.2,-331.97836,106.32,0','4F?p=282.21883,14.2,-327.80629,-67.51,-4']){
    await open(address);assert.equal(requests,0,address);
  }
  await open('4F');assert.equal(requests,0);
  await page.locator('#start').click();
  await page.evaluate(()=>{if(!document.pointerLockElement)return __world.renderer.domElement.requestPointerLock();});
  await page.waitForFunction(()=>document.pointerLockElement!==null);
  async function walk(x,z,pitch){
    await page.evaluate(([x,z,pitch])=>{
      const p=__world.player,yaw=Math.atan2(p.x-x,p.z-z);
      const turn=Math.atan2(Math.sin(yaw-p.yaw),Math.cos(yaw-p.yaw));
      document.dispatchEvent(new MouseEvent('mousemove',{movementX:-Math.round(turn/.0022),
        movementY:-Math.round((pitch-p.pitch)/.0022),bubbles:true}));
    },[x,z,pitch]);
    await page.keyboard.down('w');
    try{await page.waitForFunction(([x,z])=>Math.hypot(__world.player.x-x,__world.player.z-z)<.5,[x,z],{timeout:25000});}
    finally{await page.keyboard.up('w');}
    assert.ok(Math.abs((await page.evaluate(()=>__world.player.y))-14.2)<.12);
  }
  await walk(286.28,-329.49,0);
  await walk(292.19,-331.94,-.38);
  assert.equal(requests,1);
  const count=()=>page.evaluate(n=>__world.scene.getObjectByName(n)?.children[0].geometry.index.count/3,name);
  const proxy=await count();assert.ok(proxy>0&&proxy<900);
  release();
  await page.waitForFunction(n=>__world.scene.getObjectByName(n)?.children[0].geometry.index.count>10000,name);
  assert.equal(requests,1);assert.deepEqual(errors,[]);
  console.log(JSON.stringify({requests,proxy,full:await count(),errors}));
}finally{await browser.close();await new Promise(done=>server.close(done));}
