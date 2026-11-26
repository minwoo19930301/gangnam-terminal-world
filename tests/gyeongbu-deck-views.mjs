// npm dependencies + local Chromium Metal, through the normal interactive entrance.
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {serve} from './serve.mjs';
import {compareDeckFrame} from './deck-frame-pair.mjs';

const point=(u,v)=>[2.3+u*.9348+v*.3552,-59.24-u*.3552+v*.9348];
const yaw=(u,v)=>Math.atan2(-(.9348*u+.3552*v),-(-.3552*u+.9348*v));
const views=[
  ['plant shop',35.66,131.12,11,1,0,-.12,'day'],
  ['ribbon shop',50.32,103.18,11,0,-1,-.12,'day'],
  ['glass candleholders',50.12,96.85,11,0,1,-.13,'night'],
  ['escalator opening',20,89.4,11,0,-1,-.45,'day'],
  ['perimeter',12.40,96.2,11,-1,0,-.3,'sunset'],
  ['window',69.7,105,11,1,0,-.39,'day'],
  ['2F gallery',62.8,42,6,-1,0,-.31,'day'],
  ['1F hall',57.7,31.8,0,0,-1,-.08,'day'],
];
const server=await serve(0);
const browser=await chromium.launch({channel:'chromium',args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});
try {
  const page=await browser.newPage({viewport:{width:870,height:574},deviceScaleFactor:1}),errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  const [startX,startZ]=point(35.66,131.12);
  const address=[startX,11,startZ,yaw(1,0)*180/Math.PI].join(',');
  await page.goto('http://127.0.0.1:'+server.address().port+'/index.html?fixedres=1#/gyeongbu/3F?p='+address);
  await page.waitForFunction(()=>window.__world?.ready,null,{timeout:140000});
  await page.locator('#start').click();
  for(const [name,u,v,y,du,dv,pitch,mode] of views) {
    const [x,z]=point(u,v);
    await page.evaluate(({pose,mode})=>{
      Object.assign(__world.player,pose);
      __world.setTimeMode(mode);
    },{pose:{x,z,y,vy:0,yaw:yaw(du,dv),pitch},mode});
    await page.waitForTimeout(700);
    const pair=await page.evaluate(compareDeckFrame);
    assert.equal(pair.different,0,name+' changed a visible pixel');
    assert.equal(pair.active,y===11,name+' activation');
    if(pair.active) assert.ok(pair.after[1]<pair.before[1],name+' submitted triangles');
    else assert.deepEqual(pair.before,pair.after,name+' outside the registered floors');
    console.log(name,JSON.stringify(pair));
  }
  assert.deepEqual(errors,[]);
  assert.deepEqual(await page.evaluate(()=>__world.errors),[]);
} finally {
  await browser.close();
  await new Promise(done=>server.close(done));
}
