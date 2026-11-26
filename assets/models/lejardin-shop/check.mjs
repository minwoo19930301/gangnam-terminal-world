import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {serve} from '../../../tests/serve.mjs';
import {parts,prefix} from './layout.js';

const server=await serve(0),base='http://127.0.0.1:'+server.address().port;
const br=await chromium.launch({channel:'chromium',args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});
const r=Math.atan2(.358,.934),s=Math.sin(r),c=Math.cos(r);
function world(x,d){return [-46+(52+d)*s+(x-8.5)*c,43.1+(52+d)*c-(x-8.5)*s];}
function pose(x,d,a,b,pitch=0,y=0){const p=world(x,d),t=world(a,b);return [p[0],y,p[1],Math.atan2(p[0]-t[0],p[1]-t[1]),pitch*Math.PI/180];}
async function open(path){
  const page=await br.newPage({viewport:{width:1000,height:640}}),requests=[],errors=[];
  await page.addInitScript(()=>sessionStorage.setItem('sky-mode','day'));
  page.on('request',r=>{if(/\/lejardin-shop\/[^?]+\.(glb|webp|json|bin)$/.test(r.url()))requests.push(r.url().split('/').at(-1));});
  page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/WebGLProgram|SHADER|VALIDATE_STATUS/.test(m.text()))errors.push(m.text());});
  await page.goto(base+path);
  await page.waitForFunction(()=>window.__world?.ready,null,{timeout:110000});await page.waitForTimeout(290);return {page,requests,errors};
}
async function look(page,...args){
  await page.evaluate(p=>{__world.player.teleport(...p.slice(0,4));__world.player.pitch=p[4];},pose(...args));await page.waitForTimeout(310);
}
async function walk(page,x,d){
  const target=world(x,d);await page.evaluate(([x,z])=>{const p=__world.player;p.yaw=Math.atan2(p.x-x,p.z-z);p.pitch=-.04;},target);
  await page.keyboard.down('w');try{await page.waitForFunction(([x,z])=>Math.hypot(__world.player.x-x,__world.player.z-z)<.15,target,{timeout:7500});}
  finally{await page.keyboard.up('w');}
}
async function draws(page,label){
  return page.evaluate(tag=>{
    let count=0;const previous=new Map();const w=__world;
    w.scene.traverse(o=>{if(o.isInstancedMesh&&o.name.startsWith(tag)){
      previous.set(o,o.onBeforeRender);o.onBeforeRender=function(...args){count+=o.count;previous.get(o).apply(o,args);};
    }});
    try{w.renderer.render(w.scene,w.camera);}finally{for(const [o,fn] of previous)o.onBeforeRender=fn;}
    return count;
  },label);
}
try{
  for(const [label,floor,eye] of [
    ['mezzanine','1M',pose(.16,1.06,-.8,1.71,0,3.60)],
    ['behind side wall','1F',pose(3.91,1.8,-.84,1.70)],['behind back wall','1F',pose(.85,5.48,-.84,1.70)],
    ['looking away from shop','1F',pose(1.1,-4.45,2,-11)]]){
    const path='/?fixedres=1&pos='+eye.slice(0,3).join(',')+'&yaw='+eye[3]*180/Math.PI+'#/centralcity/'+floor;
    const q=await open(path);if(label==='mezzanine')assert.ok(Math.abs(await q.page.evaluate(()=>__world.player.y)-3.6)<.07,'standing on the mezzanine slab');assert.deepEqual(q.requests,[],label);assert.deepEqual(q.errors,[]);await q.page.close();
  }
  const {page,errors,requests}=await open('/?fixedres=1#/newcore');
  assert.deepEqual(requests,[]);
  await page.locator('#start').click();
  await page.keyboard.press('m');
  for(const query of ['Le Jardin','르자당']){
    await page.locator('#map-search').fill(query);
    assert.equal(await page.locator('.gt-result b').first().innerText(),'르자당 센트럴시티점 입구');
  }
  await page.locator('.gt-result').first().click();
  await page.locator('.gt-teleport').click();
  await page.waitForFunction(([x,y,z,yaw])=>{
    const w=window.__world,p=w?.player;
    return w?.ready && w.area==='in:famille+centralcity' && Math.hypot(p.x-x,p.y-y,p.z-z)<.18 && Math.cos(p.yaw-yaw)>.999;
  },pose(.95,-5.68,.05,.2),{timeout:110000});
  await page.locator('canvas').first().click({position:{x:500,y:320},force:true});
  await page.waitForFunction(()=>__world.scene.getObjectByName('르자당 트리 · 작은 전구의 빛')?.geometry.attributes.position.count>1500);
  await look(page,-.08,-1.22,-1.07,1.73,-11);
  await page.waitForFunction(()=>__world.scene.getObjectsByProperty('name','르자당 거리에 따른 송이 · hydrangea').some(o=>o.visible&&o.count>0));
  const middle=await draws(page,'르자당 거리에 따른 송이');assert.ok(middle>30,String(middle));
  assert.equal(await draws(page,'르자당 실물 꽃잎'),0);
  assert.ok(!requests.includes('hydrangea.glb')&&!requests.includes('rose.glb'),'middle-distance flowers should use their photographed surfaces');
  await look(page,-.99,.94,-.99,1.69,-18);
  await page.waitForFunction(()=>__world.scene.getObjectsByProperty('name','르자당 실물 꽃잎 · hydrangea').some(o=>o.visible&&o.count>0));
  const close=await draws(page,'르자당 실물 꽃잎');assert.ok(close>0&&close<middle,String(close));
  await look(page,1.12,-4.98,1.12,3.1);
  const frames=page.evaluate(async()=>{
    const times=[];let last;for(let i=0;i<275;i++){let t=await new Promise(requestAnimationFrame);if(i>1)times.push(t-last);last=t;}
    times.sort((a,b)=>a-b);return {p95:+times[Math.floor(times.length*.95)].toFixed(1),p99:+times[Math.floor(times.length*.99)].toFixed(1),max:+times.at(-1).toFixed(1)};
  });
  let metres=0,last=[1.12,-4.98];for(const q of [[1.12,-.3],[1.12,1.10],[1.21,2.72],[1.10,3.27]]){
    await walk(page,...q);metres+=Math.hypot(last[0]-q[0],last[1]-q[1]);last=q;
  }
  assert.equal(await page.evaluate(()=>__world.phys.zoneAt(__world.player.x,__world.player.y+.12,__world.player.z)?.name),'르자당 센트럴시티점');
  const collision=await page.evaluate(pts=>pts.map(([x,z])=>{const p={x,z};__world.phys.resolve(p,.32,0,1.75,.5);return +Math.hypot(p.x-x,p.z-z).toFixed(3);}),
    [[-.97,1.49],[1.12,3.70],[-1.38,-.59],[2.42,.105],[1.17,2.06],[1.12,.05]].map(p=>world(...p)));
  assert.ok(collision.slice(0,4).every(v=>v>.1)&&collision.slice(4).every(v=>v<.02),JSON.stringify(collision));
  for(const q of [[.71,3.11,.67,3.97,-12],[1.54,3.06,1.39,4,-13],[-2.40,-1.81,-1.79,-.26,-12],[2.15,-1.04,2.84,-.12,-26],[-.99,.94,-.99,1.69,-18]])await look(page,...q);
  await page.waitForFunction(n=>__world.scene.getObjectByName(n)?.children[0].material?.envMap?.isCubeTexture,prefix+parts.clear[0]);
  for(const mode of ['sunrise','day','sunset','night','live']){await page.evaluate(m=>__world.setTimeMode(m),mode);await page.waitForTimeout(90);assert.equal(await page.locator('#sky-mode').inputValue(),mode);}
  for(const key of ['hydrangea.glb','conifer.webp','hydrangea-views.webp','cooler-reflection.webp','bulbs-mm.bin'])assert.equal(requests.filter(k=>k===key).length,1,key);
  assert.equal(requests.length,new Set(requests).size);assert.deepEqual([...errors,...await page.evaluate(()=>[...__world.errors,...__world.K._.detailErrors])],[]);
  console.log(JSON.stringify({unseenRequests:0,walkMetres:+metres.toFixed(2),middleDistanceFlowerHeads:middle,closeFlowerHeads:close,collision,frames:await frames,uniqueFiles:requests.length}));await page.close();
}finally{await br.close();await new Promise(resolve=>server.close(resolve));}
