// Visit adjacent floors, move through the shop with the real player, and watch the production renderer.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {chromium} from 'playwright';
import {serve} from '../../../tests/serve.mjs';

const worldCoords=(u,v)=>[2.3+u*.9348+v*.3552,-59.24-u*.3552+v*.9348];
const forward=-159.194;

export async function checkClothingAisle({asset,root,floor,height,otherFloor,otherHeight,clearLanes,contacts},output){
  if(output)await fs.mkdir(output,{recursive:true});
  const server=await serve(0),requests=[],proxies=[],errors=[];
  const browser=await chromium.launch({channel:'chromium',args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});
  const page=await browser.newPage({viewport:{width:1110,height:735},deviceScaleFactor:1});
  const base='http://127.0.0.1:'+server.address().port+'/index.html?fixedres=1#/gyeongbu/';
  const prefix='/gyeongbu-'+asset+'-aisle/';
  page.on('pageerror',e=>errors.push(e.message));
  page.on('response',response=>{
    const pathname=new URL(response.url()).pathname;
    if(pathname.endsWith(prefix+asset+'-aisle.glb'))requests.push(response.status());
    if(pathname.endsWith(prefix+'proxy.js'))proxies.push(response.status());
  });

  async function route(floor,y,u,v,angle){
    const [x,z]=worldCoords(u,v);
    await page.goto('about:blank');await page.goto(base+floor+'?p='+[x,y,z,angle].join(','));
    await page.waitForFunction(()=>window.__world?.ready,null,{timeout:145000});
    await page.evaluate(()=>{document.getElementById('start').click();window.__world.setTimeMode('day');});
    await page.waitForTimeout(400);
  }
  async function pose(u,v,angle=forward,pitch=0){
    const [x,z]=worldCoords(u,v);
    await page.evaluate(p=>Object.assign(window.__world.player,p),{x,z,y:height,vy:0,yaw:angle*Math.PI/180,pitch:pitch*Math.PI/180});
    await page.waitForTimeout(300);
  }
  async function surface(wanted){
    await page.waitForFunction(([name,wanted])=>{
      const item=window.__world.scene.getObjectByName(name)?.children[0];
      return item&&!!item.material.normalMap===wanted&&(wanted||item.geometry.index.count>100);
    },[root,wanted],{timeout:15000});
    return page.evaluate(name=>{
      const root=window.__world.scene.getObjectByName(name),body=root.children[0],m=body.material;
      return {draws:root.children.length,triangles:body.geometry.index.count/3,color:m.map?.image.width??0,
        relief:m.normalMap?.image.width??0,roughness:m.roughnessMap?.image.width??0,lenses:m.emissiveMap?.image.width??0};
    },root);
  }
  try {
    await route(otherFloor,otherHeight,38,109.55,forward);assert.deepEqual(requests,[]);assert.deepEqual(proxies,[]);
    await route(floor,height,38,101.23,forward+180);assert.deepEqual(requests,[]);assert.deepEqual(proxies,[]);
    await pose(38,83.5);const distant=await surface(false);
    assert.equal(distant.draws,1);assert.ok(distant.triangles>500&&distant.triangles<5000);assert.deepEqual(requests,[]);
    await pose(38,104.70);const close=await surface(true);
    assert.equal(close.draws,1);assert.ok(close.triangles>8500&&close.triangles<28000);
    assert.deepEqual([close.color,close.relief,close.roughness,close.lenses],[1024,512,256,256]);
    const start=worldCoords(38,104.70);
    await page.keyboard.down('w');
    try {
      await page.waitForFunction(([x,z])=>Math.hypot(window.__world.player.x-x,window.__world.player.z-z)>11.5,start,{timeout:14000});
    }finally{await page.keyboard.up('w');}
    const walk=await page.evaluate(({start,height,clearLanes,contacts})=>{
      const w=window.__world,p=w.player;
      const xy=(u,v)=>[2.3+u*.9348+v*.3552,-59.24-u*.3552+v*.9348];
      const failures=[];
      function push(u,v){
        const [x,z]=xy(u,v),t={x,z};w.phys.resolve(t,.32,height,height+1.75,.50);
        return Math.hypot(x-t.x,z-t.z);
      }
      for(const u of clearLanes)for(let v=104.70;v<116.3;v+=.22){
        const [x,z]=xy(u,v);
        if(push(u,v)>.035||Math.abs(w.phys.support(x,z,height+.45).y-height)>.05)failures.push([u,+v.toFixed(2)]);
      }
      return {area:w.area,y:p.y,distance:Math.hypot(p.x-start[0],p.z-start[1]),failures,
        contacts:contacts.map(([u,v])=>push(u,v)),cap:w.phys.ceilingAbove(...xy(38,109.5),height+1.6,height+4.10)};
    },{start,height,clearLanes,contacts});
    assert.deepEqual(walk.failures,[]);assert.equal(walk.area,'in:gyeongbu');assert.ok(Math.abs(walk.y-height)<.05);
    assert.ok(walk.contacts.every(v=>v>.05));assert.ok(Math.abs(walk.cap-height-2.923)<.025);
    await pose(38.05,104.76,forward,-2);
    const modes=[];
    for(const mode of ['day','sunset','night','sunrise','live']){
      modes.push(await page.evaluate(async mode=>{
        window.__world.setTimeMode(mode);
        await new Promise(done=>requestAnimationFrame(()=>requestAnimationFrame(done)));
        return window.__world.daylight.state.mode;
      },mode));
      if(output&&['night','day'].includes(mode))await page.screenshot({path:path.join(output,mode+'.png')});
    }
    assert.deepEqual(modes,['day','sunset','night','sunrise','live']);
    await pose(38,84);await surface(false);await pose(38.06,111.4,forward+180);await surface(true);
    assert.deepEqual(requests,[200]);assert.deepEqual(proxies,[200]);assert.deepEqual(errors,[]);
    const result={distant,close,walk,modes,requests,proxies,errors};
    console.log(JSON.stringify(result,null,2));return result;
  }finally{await browser.close();await new Promise(done=>server.close(done));}
}
