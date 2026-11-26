import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {serve} from '../../../tests/serve.mjs';

const point=(u,v)=>[2.3+u*.9348+v*.3552,-59.24-u*.3552+v*.9348];
const yaw=(du,dv)=>Math.atan2(-(.9348*du+.3552*dv),-(-.3552*du+.9348*dv));
const labels={ribbon:'색상별 리본과 꽃 포장',case:'원목 진열장과 황동 촛대',crystal:'절삭 유리 화기와 고블릿'};
const prefix='경부선 현대데코 · ';
const server=await serve(0),browser=await chromium.launch({channel:'chromium',args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});
const page=await browser.newPage({viewport:{width:1110,height:735},deviceScaleFactor:1});
const requests={ribbon:[],case:[],crystal:[],reflection:[]},errors=[];
page.on('pageerror',e=>errors.push(e.message));
page.on('console',m=>{if(m.type()==='error'&&/shader error|validation failure/i.test(m.text()))errors.push(m.text());});
page.on('response',r=>{
  for(const key of Object.keys(labels))if(r.url().endsWith(`/gyeongbu-florist-stock/${key}/${key}.glb`))requests[key].push(r.status());
  if(r.url().endsWith('/gyeongbu-florist-stock/shelf-reflection.webp'))requests.reflection.push(r.status());
});
async function entry(floor,h,u,v,du,dv){
  const [x,z]=point(u,v);
  await page.goto('about:blank');
  await page.goto('http://127.0.0.1:'+server.address().port+'/index.html?fixedres=1#/gyeongbu/'+floor+'?p='+[x,h,z,yaw(du,dv)*180/Math.PI].join(','));
  await page.waitForFunction(()=>window.__world?.ready,null,{timeout:130000});
  await page.evaluate(()=>{document.getElementById('start').click();__world.setTimeMode('day');});await page.waitForTimeout(260);
}
async function pose(h,u,v,du,dv){
  const [x,z]=point(u,v);await page.evaluate(p=>Object.assign(__world.player,p),{x,z,y:h,vy:0,yaw:yaw(du,dv),pitch:-.075});await page.waitForTimeout(230);
}
async function read(key){
  const name=prefix+labels[key];await page.waitForFunction(n=>__world.scene.getObjectByName(n)?.children[0]?.material.map,name);
  return page.evaluate(n=>{
    const root=__world.scene.getObjectByName(n),o=root.children[0],m=o.material;
    return {draws:root.children.length,triangles:o.geometry.index.count/3,texture:m.map.image.width,
      normals:m.normalMap?.image.width,environment:m.envMap?.image[0].width,transparent:m.transparent,depthWrite:m.depthWrite};
  },name);
}
async function walk(u,v){
  const dest=point(u,v);
  await page.evaluate(([x,z])=>{const p=__world.player;p.yaw=Math.atan2(p.x-x,p.z-z);},dest);
  await page.keyboard.down('w');
  try{await page.waitForFunction(([x,z])=>Math.hypot(__world.player.x-x,__world.player.z-z)<.12,dest,{timeout:9500});}
  finally{await page.keyboard.up('w');}
  return page.evaluate(()=>__world.player.y);
}
try{
  await entry('4F',15.5,50.25,103.05,0,-1);
  assert.deepEqual(requests,{ribbon:[],case:[],crystal:[],reflection:[]});
  await entry('3F',11,50.30,103.12,0,-1);
  const ribbon=await read('ribbon');assert.deepEqual(requests,{ribbon:[200],case:[],crystal:[],reflection:[]});
  await pose(11,47.13,103.02,1,0);const front=await walk(53.43,103.02);
  assert.ok(Math.abs(front-11)<.045);
  await pose(11,50.05,96.72,0,1);
  const wood=await read('case'),glass=await read('crystal');
  assert.ok(ribbon.triangles>18000&&ribbon.triangles<60000);
  assert.ok(wood.triangles>9500&&wood.triangles<50000);
  assert.ok(glass.triangles>8000&&glass.triangles<28000);
  for(const part of [ribbon,wood,glass]){assert.equal(part.texture,512);assert.equal(part.draws,1);}
  assert.equal(ribbon.normals,256);assert.equal(wood.environment,40);assert.equal(glass.environment,40);
  assert.equal(glass.transparent,true);assert.equal(glass.depthWrite,false);
  await pose(11,53.43,96.95,-1,0);const back=await walk(47.13,96.95);assert.ok(Math.abs(back-11)<.045);
  for(const mode of ['sunrise','day','sunset','night','live'])assert.equal(await page.evaluate(m=>{__world.setTimeMode(m);return __world.daylight.state.mode;},mode),mode);
  await pose(11,50.25,103.16,0,-1);await read('ribbon');
  await pose(11,50.18,96.99,0,1);await read('crystal');
  assert.deepEqual(requests,{ribbon:[200],case:[200],crystal:[200],reflection:[200]});assert.deepEqual(errors,[]);
  console.log(JSON.stringify({ribbon,wood,glass,front,back,requests,errors},null,2));
}finally{await browser.close();await new Promise(r=>server.close(r));}
