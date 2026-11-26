import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {serve} from '../../../tests/serve.mjs';
import {parts,furniture} from './layout.js';

const server=await serve(0),base='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({channel:'chromium',args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});
const s=.359001,c=.933337,P=(u,v)=>[-23.6925+c*(u-31)+s*v,99.5825-s*(u-31)+c*v];
function pose(u,v,a,b,y=6){const [x,z]=P(u,v),[tx,tz]=P(a,b);return [x,y,z,Math.atan2(x-tx,z-tz)];}
async function open(floor,p){
  const page=await browser.newPage({viewport:{width:1000,height:640}}),requests=[],errors=[];
  await page.addInitScript(()=>sessionStorage.setItem('sky-mode','day'));
  page.on('request',r=>{if(/\/tamayura\/[^?]+\.(glb|webp)$/.test(r.url()))requests.push(r.url().split('/').at(-1));});
  page.on('pageerror',e=>errors.push(e.message));
  page.on('console',m=>{if(m.type()==='error'&&/WebGLProgram|SHADER|VALIDATE_STATUS/.test(m.text()))errors.push(m.text());});
  await page.goto(base+'/?pos='+p.slice(0,3).join(',')+'&yaw='+p[3]*180/Math.PI+'#/jwmarriott/'+floor);
  await page.waitForFunction(()=>window.__world?.ready,null,{timeout:120000});
  await page.waitForTimeout(500);
  return {page,requests,errors};
}
async function aim(page,u,v,a,b,tilt=0){
  await page.evaluate(([p,tilt])=>{__world.player.teleport(...p);__world.player.pitch=tilt;},[pose(u,v,a,b),tilt*Math.PI/180]);
  await page.waitForTimeout(200);
}
async function walk(page,u,v){
  const end=P(u,v);
  await page.evaluate(([x,z])=>{const p=__world.player;p.yaw=Math.atan2(p.x-x,p.z-z);p.pitch=-.055;},end);
  await page.keyboard.down('w');
  try{
    await page.waitForFunction(([x,z])=>Math.hypot(__world.player.x-x,__world.player.z-z)<.14,end,{timeout:8000});
  }catch(e){
    const pos=await page.evaluate(()=>[__world.player.x,__world.player.y,__world.player.z]);
    throw Error('Blocked walking to '+[u,v]+' at '+pos,{cause:e});
  }finally{await page.keyboard.up('w');}
}
async function waitHigh(page,key){
  await page.waitForFunction(name=>{
    const root=__world.scene.getObjectByName(name);return root?.children[0]?.geometry.getAttribute('uv')&&
      (root.children[0].material.map?.image?.width??0)>100;
  },'타마유라 · '+parts[key][0],{timeout:11000});
}
try{
  for(const [kind,floor,start] of [
    ['above','3F',pose(21,50,21,52,11.5)],['back wall','2F',pose(20,57.8,20,54)],
    ['opposite view','2F',pose(20.5,36.3,20.5,29)]]){
    const {page,requests,errors}=await open(floor,start);
    assert.deepEqual(requests,[],kind+' cold requests');assert.deepEqual(errors,[]);await page.close();
  }
  const {page,requests,errors}=await open('2F',pose(20.5,39.90,20.5,44));
  await page.mouse.click(500,320);
  const timing=page.evaluate(async()=>{
    const ms=[];let prev;
    for(let i=0;i<235;i++){const t=await new Promise(requestAnimationFrame);if(i>2)ms.push(t-prev);prev=t;}
    ms.sort((a,b)=>a-b);return {p95Ms:+ms[Math.floor(.95*ms.length)].toFixed(1),p99Ms:+ms[Math.floor(.99*ms.length)].toFixed(1),maxMs:+ms.at(-1).toFixed(1)};
  });
  let metres=0,prev=[20.5,39.90];
  for(const stop of [[20.5,44.25],[22.76,44.43],[22.83,50.14],[21.04,50.43]]){
    await walk(page,...stop);metres+=Math.hypot(stop[0]-prev[0],stop[1]-prev[1]);prev=stop;
  }
  assert.equal(await page.evaluate(()=>__world.phys.zoneAt(__world.player.x,__world.player.y+.12,__world.player.z)?.name),'타마유라 스시 바');
  assert.ok(Math.abs(await page.evaluate(()=>__world.player.y)-6)<.08);
  await aim(page,20.94,51.56,20.94,52.36,-42);await waitHigh(page,'sushiDish');
  await aim(page,20.23,45.82,20.22,46.54,-43);await waitHigh(page,'teppanDish');
  await aim(page,23.49,46.62,24.25,46.58,-42);await waitHigh(page,'teaSet');
  for(const [u,v,a,b,key] of [[17.65,49.85,21.38,52.58,'sushi'],[21.73,43.96,19.70,47.25,'teppan'],[22.48,43.77,24.67,46.19,'tea']]){
    await aim(page,u,v,a,b,-5);await waitHigh(page,key);
  }
  const materials=await page.evaluate(labels=>labels.map(name=>{
    const mesh=__world.scene.getObjectByName('타마유라 · '+name).children[0];
    return [!!mesh.geometry.getAttribute('uv1'),mesh.material.lightMap?.channel,mesh.material.lightMap?.image?.width];
  }),['sushi','teppan','tea','room','entry'].map(key=>parts[key][0]));
  // An object behind the current camera can already have reverted to its silhouette. Query each
  // station while it is in view to check its second UV and baked light specifically.
  assert.ok(materials.some(([uv,channel,width])=>uv&&channel===1&&width>=768));
  const visits=[],brightness={};
  for(const mode of ['sunrise','day','sunset','night','live']){
    await page.evaluate(m=>__world.setTimeMode(m),mode);await page.waitForTimeout(130);
    visits.push(await page.evaluate(()=>document.querySelector('#sky-mode').value));
    brightness[mode]=await page.evaluate(()=>{
      const {renderer,scene,camera}=__world;renderer.render(scene,camera);const gl=renderer.getContext();
      const rgb=new Uint8Array(64*64*4);gl.readPixels((gl.drawingBufferWidth-64)>>1,(gl.drawingBufferHeight-64)>>1,64,64,gl.RGBA,gl.UNSIGNED_BYTE,rgb);
      let total=0;for(let i=0;i<rgb.length;i+=4)total+=.2126*rgb[i]+.7152*rgb[i+1]+.0722*rgb[i+2];
      return +(total/(64*64)).toFixed(1);
    });
  }
  assert.ok(brightness.night>32&&brightness.night>brightness.day*.4,JSON.stringify(brightness));
  assert.deepEqual(visits,['sunrise','day','sunset','night','live']);
  await aim(page,20.5,40.5,20.5,43);await waitHigh(page,'entry');
  for(const key of Object.keys(parts))assert.ok(requests.includes(key+'.glb'),key);
  assert.equal(requests.length,new Set(requests).size,'each detailed file read once');
  assert.deepEqual([...errors,...await page.evaluate(()=>[...__world.errors,...__world.K._.detailErrors])],[]);
  console.log(JSON.stringify({seats:['sushi','teppan','tea'].map(bar=>furniture.filter(p=>p.bar===bar&&['chair','teaChair'].includes(p.key)).length),
    walkMeters:+metres.toFixed(2),frames:await timing,requests:requests.length,coldElsewhere:0,modes:visits,brightness,materials}));
  await page.close();
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
