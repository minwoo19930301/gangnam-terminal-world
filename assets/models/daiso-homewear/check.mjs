import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {serve} from '../../../tests/serve.mjs';

const before=process.argv.includes('--before');
const server=await serve(0);
const browser=await chromium.launch({channel:'chromium',headless:true,args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});
const world=(u,v)=>[2.3+.9348*u+.3552*v,-59.24-.3552*u+.9348*v];
try{
  const page=await browser.newPage({viewport:{width:960,height:600}});
  const requests=[],errors=[];
  page.on('pageerror',err=>errors.push(err.message));
  page.on('request',r=>{if(r.url().endsWith('/daiso-homewear/homewear.glb'))requests.push(r.url());});
  const [x,z]=world(186,6.6),[tx,tz]=world(193.3,6.6);
  const yaw=Math.atan2(x-tx,z-tz);
  await page.goto('http://127.0.0.1:'+server.address().port+'/index.html#/gyeongbu/B1?p='+[x,-4,z,yaw*180/Math.PI].join(','));
  await page.waitForFunction(()=>window.__world?.ready,null,{timeout:90000});
  await page.locator('#start').click();
  assert.equal(requests.length,0);
  await page.keyboard.down('w');
  try{await page.waitForFunction(([x,z])=>Math.hypot(__world.player.x-x,__world.player.z-z)<.23,[tx,tz],{timeout:15000});}
  finally{await page.keyboard.up('w');}
  const [sx,sz]=world(193.3,4.05);
  await page.evaluate(([sx,sz])=>{const p=__world.player;p.yaw=Math.atan2(p.x-sx,p.z-sz);p.pitch=-.17;},[sx,sz]);
  if(!before)await page.waitForFunction(()=>__world.K.scene.getObjectByName('다이소 · 홈웨어 옷걸이와 잠옷 견본')?.children[0]?.geometry?.index?.count>3000);
  await page.waitForTimeout(600);
  if(process.argv.includes('--capture'))await page.screenshot({path:new URL(before?'before.jpg':'after.jpg',import.meta.url).pathname,quality:86});
  const state=await page.evaluate(()=>{const w=__world,p=w.player;return [p.y,w.phys.zoneAt(p.x,p.y+.12,p.z)?.name,...w.errors,...w.K._.detailErrors]});
  assert.equal(state[0],-4);assert.match(state[1],/다이소/);assert.equal(state.length,2);
  assert.equal(requests.length,before?0:1);assert.deepEqual(errors,[]);
  console.log({before,requests:requests.length,state});
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
