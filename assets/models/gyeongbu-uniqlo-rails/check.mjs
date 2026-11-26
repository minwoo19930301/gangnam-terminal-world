import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {serve} from '../../../tests/serve.mjs';

const place=(u,v)=>[2.3+u*.9348+v*.3552,-59.24-u*.3552+v*.9348];
const yaw=(du,dv)=>Math.atan2(-(.9348*du+.3552*dv),-(-.3552*du+.9348*dv));
const server=await serve(0),browser=await chromium.launch({channel:'chromium',args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});
const page=await browser.newPage({viewport:{width:1110,height:735},deviceScaleFactor:1});
const requests={parka:[],blouse:[],upstairs:[]},errors=[];
const root=(floor,style,u,v)=>`경부선 유니클로 ${floor} · ${style==='parka'?'경량 후드 파카':'시어서커 블라우스'} 행거 (${u},${v})`;
page.on('pageerror',e=>errors.push(e.message));
page.on('response',r=>{
  for(const style of ['parka','blouse'])if(r.url().endsWith(`/gyeongbu-uniqlo-rails/${style}/${style}-rail.glb`))requests[style].push(r.status());
  if(r.url().endsWith('/gyeongbu-uniqlo-finish/upstairs/oak-and-lighting.glb'))requests.upstairs.push(r.status());
});

async function entry(floor,h,u,v,du,dv){
  const [x,z]=place(u,v);
  await page.goto('about:blank');
  await page.goto('http://127.0.0.1:'+server.address().port+'/index.html?fixedres=1#/gyeongbu/'+floor+'?p='+[x,h,z,yaw(du,dv)*180/Math.PI].join(','));
  await page.waitForFunction(()=>window.__world?.ready,null,{timeout:130000});
  await page.evaluate(()=>{document.getElementById('start').click();__world.setTimeMode('day');});
  await page.waitForTimeout(350);
}
async function pose(h,u,v,du,dv,pitch=0){
  const [x,z]=place(u,v);
  await page.evaluate(p=>Object.assign(__world.player,p),{x,z,y:h,vy:0,yaw:yaw(du,dv),pitch});
  await page.waitForTimeout(230);
}
async function read(name){
  await page.waitForFunction(n=>Boolean(__world.scene.getObjectByName(n)?.children[0]?.material.normalMap),name);
  return page.evaluate(n=>{
    const g=__world.scene.getObjectByName(n),m=g.children[0],t=m.material;
    return {draws:g.children.length,triangles:m.geometry.index.count/3,maps:[t.map,t.normalMap,t.roughnessMap,t.emissiveMap].map(x=>x.image.width)};
  },name);
}
async function walk(u,v){
  const dest=place(u,v);
  await page.evaluate(([x,z])=>{const p=__world.player;p.yaw=Math.atan2(p.x-x,p.z-z);},dest);
  await page.keyboard.down('w');
  try{await page.waitForFunction(([x,z])=>Math.hypot(__world.player.x-x,__world.player.z-z)<.15,dest,{timeout:11000});}
  finally{await page.keyboard.up('w');}
  return page.evaluate(()=>{const w=__world,p=w.player;return {y:p.y,zone:w.phys.zoneAt(p.x,p.y+.12,p.z)?.name};});
}
const finish='경부선 유니클로 · 2층 참나무 판매층과 열린 계단';
try{
  await entry('3F',11,62.6,18.9,-1,.27);
  assert.deepEqual(requests,{parka:[],blouse:[],upstairs:[]});
  await entry('2F',6,63.1,15.32,1,0);
  assert.deepEqual(requests.parka,[]);assert.deepEqual(requests.blouse,[]);
  await pose(6,62.91,19.74,-1,.09);
  const parka=await read(root('2F','parka',60,20));assert.deepEqual(requests.parka,[200]);assert.deepEqual(requests.blouse,[]);
  await pose(6,54.08,8.32,-1,.23);
  const blouse=await read(root('2F','blouse',52,9));assert.deepEqual(requests.blouse,[200]);
  for(const item of [parka,blouse]){assert.equal(item.draws,1);assert.ok(item.triangles>=9000&&item.triangles<35000);assert.deepEqual(item.maps,[512,256,128,128]);}
  const finishView=await read(finish);
  const cutout=await page.evaluate(name=>{
    const w=__world,T=w.K.THREE,m=w.scene.getObjectByName(name).children[0];
    function hit(u,v){
      const x=2.3+u*.9348+v*.3552,z=-59.24-u*.3552+v*.9348;
      const ray=new T.Raycaster(new T.Vector3(x,7,z),new T.Vector3(0,-1,0),0,1.65);
      return ray.intersectObject(m)[0]?.point.y??null;
    }
    return {open:[[38,9],[38,14],[38,19.5],[35.59,8.20],[40.40,19.80]].map(p=>hit(...p)),
            wood:[[38,7.72],[38,20.30],[35.26,14],[40.75,14],[55,14.2]].map(p=>hit(...p))};
  },finish);
  assert.ok(cutout.open.every(y=>y===null),JSON.stringify(cutout));assert.ok(cutout.wood.every(y=>y>6.03&&y<6.07),JSON.stringify(cutout));
  await pose(6,61.52,14.75,-1,0);const across=await walk(45.62,14.75);assert.equal(across.y,6);
  await pose(0,38,7.02,0,1);const up=await walk(38,20.73);assert.ok(Math.abs(up.y-6)<.13,JSON.stringify(up));
  const down=await walk(38,7.02);assert.ok(Math.abs(down.y)<.1,JSON.stringify(down));
  await pose(0,54.18,8.36,-1,.23);await read(root('1F','blouse',52,9));
  await pose(0,54.18,19.76,-1,.13);await read(root('1F','parka',52,20));
  await pose(6,62.91,19.74,-1,.09);await read(root('2F','parka',60,20));
  for(const mode of ['sunrise','sunset','night','live'])assert.equal(await page.evaluate(m=>{__world.setTimeMode(m);return __world.daylight.state.mode;},mode),mode);
  assert.deepEqual(requests,{parka:[200],blouse:[200],upstairs:[200]});assert.deepEqual(errors,[]);
  console.log(JSON.stringify({parka,blouse,finishView,cutout,across,up,down,requests,errors},null,2));
}finally{await browser.close();await new Promise(r=>server.close(r));}
