// Walk to the pottery and wood displays from the normal public Daiso aisle.
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {serve} from '../../../tests/serve.mjs';

const along=[.9348,-.3552],across=[.3552,.9348],norm=along[0]**2+along[1]**2;
const world=(u,v)=>[2.3+along[0]*u+across[0]*v,-59.24+along[1]*u+across[1]*v];
const local=(x,z)=>[((x-2.3)*along[0]+(z+59.24)*along[1])/norm,((x-2.3)*across[0]+(z+59.24)*across[1])/norm];
const pottery='다이소 · 달항아리와 압화 액자 진열',wood='다이소 · 나무 소반과 컵받침·카드꽂이';
const server=await serve(0),browser=await chromium.launch({channel:'chromium',headless:true,args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});
try {
  const page=await browser.newPage({viewport:{width:1000,height:640}}),errors=[],requests=[];
  page.on('pageerror',error=>errors.push(error.message));
  page.on('request',request=>{if(request.url().includes('/models/daiso-home/')&&request.url().endsWith('.glb')) requests.push(request.url().split('/').pop());});
  const [x,z]=world(190,6.6);
  await page.goto('http://127.0.0.1:'+server.address().port+'/index.html#/gyeongbu/B1?p='+[x,-4,z,0].join(','));
  await page.waitForFunction(()=>window.__world?.ready,null,{timeout:90000});
  await page.locator('#start').click();

  async function pose(u,v,toU,toV,pitch=-.12) {
    const [x,z]=world(u,v),[targetX,targetZ]=world(toU,toV);
    await page.evaluate(([x,z,angle,pitch])=>{
      __world.player.teleport(x,-4,z,angle);
      __world.player.pitch=pitch;
    },[x,z,Math.atan2(x-targetX,z-targetZ),pitch]);
    await page.waitForTimeout(410);
  }
  async function look(u,v) {
    await page.evaluate(([x,z])=>{const p=__world.player;p.yaw=Math.atan2(p.x-x,p.z-z);},world(u,v));
  }
  async function at() {
    const [x,z,y,zone]=await page.evaluate(()=>{const {x,y,z}=__world.player;return[x,z,y,__world.phys.zoneAt(x,y+.1,z)?.name];});
    return [...local(x,z),y,zone];
  }
  async function walk(u,v) {
    await look(u,v);
    await page.keyboard.down('w');
    try {
      await page.waitForFunction(([x,z])=>Math.hypot(__world.player.x-x,__world.player.z-z)<.15,world(u,v),{timeout:12500});
    } catch(error) {
      throw new Error('Walking to '+[u,v]+' stopped at '+await at(),{cause:error});
    } finally {
      await page.keyboard.up('w');
    }
  }
  async function geometry(name,full) {
    await page.waitForFunction(([name,full])=>{
      const n=__world.K.scene.getObjectByName(name)?.children[0].geometry.index?.count/3;
      return n>0&&(full?n>4000:n<4000);
    },[name,full],{timeout:7500});
    return page.evaluate(name=>__world.K.scene.getObjectByName(name).children[0].geometry.index.count/3,name);
  }
  async function stopAt(u,v,near,far) {
    await look(u,v);
    await page.keyboard.down('w');await page.waitForTimeout(830);await page.keyboard.up('w');
    const state=await at();
    assert.ok(state[1]>near&&state[1]<far,'display contact '+state);
    assert.equal(state[2],-4);assert.ok(state[3].includes('다이소'));
    return +state[1].toFixed(3);
  }

  await pose(190,6.6,185,6.6);
  await pose(214.6,6.73,214.6,9.9);
  assert.deepEqual(requests,[],'outside this shelf view');
  const rear=[[pottery,213.54,3.12,214.62,4.69],[wood,260.72,11.96,261.8,10.7]];
  const proxies=[];
  for(const [name,...position] of rear){await pose(...position);proxies.push(await geometry(name,false));}
  assert.deepEqual(requests,[],'opaque shelf backs');
  await pose(207.4,6.65,214.6,6.65);
  await walk(214.60,6.65);await walk(214.60,5.6);await look(214.60,4.69);
  const detailed=[await geometry(pottery,true)];assert.deepEqual(requests,['jars.glb']);
  const contact=[await stopAt(214.6,4.69,5.22,5.40)];
  await walk(214.60,6.65);await walk(231.2,6.65);await walk(245.5,6.65);
  const lower=await at();assert.ok(lower[2]<-4.2&&lower[2]>-4.66);
  await walk(259.5,6.65);await walk(261.8,8.77);await walk(261.8,9.82);await look(261.8,10.70);
  detailed.push(await geometry(wood,true));contact.push(await stopAt(261.8,10.7,9.99,10.18));
  for(const [i,[name,...position]] of rear.entries()){await pose(...position);assert.equal(await geometry(name,false),proxies[i]);}
  await pose(261.8,8.77,261.8,10.70);await geometry(wood,true);
  await pose(214.6,6.73,214.6,4.69);await geometry(pottery,true);
  assert.deepEqual(requests,['jars.glb','wood.glb']);
  assert.deepEqual([...errors,...await page.evaluate(()=>[...__world.errors,...__world.K._.detailErrors])],[]);
  console.log(JSON.stringify({remote:0,behindCamera:0,behindShelf:0,proxies,detailed,contact,lower:lower[2],requests}));
} finally {
  await browser.close();
  await new Promise(resolve=>server.close(resolve));
}
