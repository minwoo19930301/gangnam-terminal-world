// Check both public sides and the opaque walls through the normal 1F scene and player.
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {serve} from '../../../tests/serve.mjs';

const rotation=Math.atan2(.3639,.9315),a=Math.sin(rotation),b=Math.cos(rotation);
const W=(s,t)=>[-135.7+a*s+b*t,9.9+b*s-a*t];
const local=(x,z)=>[(x+135.7)*a+(z-9.9)*b,(x+135.7)*b-(z-9.9)*a];
const names={entry:'체크 바닥과 검은 상호 외벽',gifts:'물결 선반과 선물 상자',counter:'둥근 주문대와 사선 견본장',
  chocolates:'통초콜릿과 잘라 보인 단면',pops:'개별 포장 롤리팝과 사탕',stand:'둥근 전시대의 포장 선물'};
const server=await serve(0),browser=await chromium.launch({channel:'chromium',headless:true,
  args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});
try{
  const p=await browser.newPage({viewport:{width:1000,height:640}}),requests=[],errors=[];
  p.on('pageerror',e=>errors.push(e.message));
  p.on('request',q=>{if(q.url().includes('/models/sees/')&&q.url().endsWith('.glb'))requests.push(q.url().split('/').pop());});
  const [x,z]=W(189.45,-91);
  await p.goto('http://127.0.0.1:'+server.address().port+'/index.html#/famille/1F?p='+[x,0,z,0].join(','));
  await p.waitForFunction(()=>window.__world?.ready,null,{timeout:90000});await p.locator('#start').click();
  async function pose(s,t,vs,vt,pitch=0){
    const [x,z]=W(s,t),[tx,tz]=W(vs,vt),yaw=Math.atan2(x-tx,z-tz);
    await p.evaluate(([x,z,yaw,pitch])=>{__world.player.teleport(x,0,z,yaw);__world.player.pitch=pitch;},[x,z,yaw,pitch]);
    await p.waitForTimeout(340);
  }
  async function look(s,t,pitch=0){
    await p.evaluate(([x,z,pitch])=>{const a=__world.player;a.yaw=Math.atan2(a.x-x,a.z-z);a.pitch=pitch;},[...W(s,t),pitch]);
  }
  async function where(){
    const [x,z,y,zone]=await p.evaluate(()=>{const {x,y,z}=__world.player;return [x,z,y,__world.phys.zoneAt(x,y+.1,z)?.name];});
    return [...local(x,z),y,zone];
  }
  async function walk(s,t){
    const from=await where();await look(s,t);await p.keyboard.down('w');
    try{await p.waitForFunction(([x,z])=>Math.hypot(__world.player.x-x,__world.player.z-z)<.13,W(s,t),{timeout:7000});}
    catch(e){throw new Error('Walk '+from+' to '+[s,t]+' ended at '+await where(),{cause:e});}
    finally{await p.keyboard.up('w');}
    assert.ok(Math.abs((await where())[2])<.08,'level 1F');
  }
  async function high(key,minTris){
    await p.waitForFunction(([name,minTris])=>(__world.K.scene.getObjectByName('씨즈캔디 · '+name)?.children[0]?.geometry.index.count??0)>3*minTris,[names[key],minTris],{timeout:5000});
  }
  async function hold(ms){await p.keyboard.down('w');await p.waitForTimeout(ms);await p.keyboard.up('w');}
  await pose(189.45,-91,189.45,-95);assert.deepEqual(requests,[],'remote gallery cold');
  await pose(181.3,-43.4,181.3,-49);assert.deepEqual(requests,[],'opaque rear cold');
  await pose(177.15,-48,181,-48);assert.deepEqual(requests,[],'opaque shop partition cold');
  await pose(189.2,-54.3,193,-58);assert.deepEqual(requests,[],'facing away cold');
  await pose(181.65,-55.16,181.65,-50);await high('entry',4000);
  assert.ok(!requests.includes('chocolates.glb')&&!requests.includes('pops.glb'),'distant sweets remain in silhouette');
  await walk(181.65,-50.39);
  const inside=await where();assert.equal(inside[3],'씨즈캔디');
  await look(179.9,-48.55);await high('gifts',2000);
  await look(184.97,-51.40,-.28);await high('stand',600);
  await walk(185.58,-50.39);await walk(188.95,-50.39);await walk(188.95,-47.48);
  const gallery=await where();assert.ok(gallery[0]>188.75&&gallery[3]!=='씨즈캔디','exit the second public side');
  await look(185.9,-47.56,-.2);await high('counter',350);await high('chocolates',2000);
  await walk(187.12,-47.48);await look(185.9,-47.48,-.42);await hold(480);
  const counter=await where();assert.ok(counter[0]>186.80&&counter[0]<187.05&&Math.abs(counter[2])<.08,'counter contact '+counter);
  await walk(187.05,-49.65);await look(186.28,-49.31,-.50);await high('pops',500);
  await pose(184.97,-54.33,184.97,-50);await hold(800);
  const window=await where();assert.ok(window[1]>-52.62&&window[1]<-52.34&&Math.abs(window[2])<.08,'front glazing contact '+window);
  await pose(181.3,-43.4,181.3,-49);
  const hidden=await p.evaluate(()=>__world.K._.details.filter(d=>d.name.startsWith('씨즈캔디 ')&&!d.name.includes('체크 바닥')).map(d=>d.hidden));
  assert.equal(hidden.length,5);assert.ok(hidden.every(Boolean),'five masked warm-cache displays '+hidden);
  await pose(189.1,-47.48,185.9,-47.54,-.17);await high('chocolates',2000);
  assert.deepEqual(requests.toSorted(),Object.keys(names).map(k=>k+'.glb').sort());
  assert.deepEqual([...errors,...await p.evaluate(()=>[...__world.errors,...__world.K._.detailErrors])],[]);
  console.log(JSON.stringify({farCold:0,opaqueCold:0,behindCameraCold:0,opaqueRearWarmHidden:hidden.length,
    storefrontOnlyFarCandy:0,downloads:requests,inside,counter,window,side:gallery}));
}finally{await browser.close();await new Promise(r=>server.close(r));}
