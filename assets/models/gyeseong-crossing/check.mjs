import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {chromium} from 'playwright';
import {serve} from '../../../tests/serve.mjs';
import {northLanding,crossingWay} from './layout.js';

const roads=JSON.parse(await fs.readFile(new URL('../../../data/osm.json',import.meta.url),'utf8')).roads;
const {corner,lamp,yaw}=northLanding(roads.find(r=>r.id===crossingWay));
const server=await serve(0),browser=await chromium.launch({headless:true,channel:'chromium'});
try{
  for(const sign of [1,-1]){
    const page=await browser.newPage({viewport:{width:800,height:500}});
    const dx=Math.sin(yaw)*sign,dz=Math.cos(yaw)*sign;
    const x=corner[0]-dx*4,z=corner[1]-dz*4,heading=Math.atan2(-dx,-dz)*180/Math.PI;
    const errors=[];page.on('pageerror',error=>errors.push(error.message));
    await page.goto('http://127.0.0.1:'+server.address().port+'/?q=low&traffic=0&pos='+[x,.15,z].join(',')+'&yaw='+heading+'#/streets');
    await page.waitForFunction(()=>window.__world?.ready);
    if(await page.locator('#start').isVisible())await page.locator('#start').click();
    else await page.mouse.click(400,250);
    const [clear,solid]=await page.evaluate(points=>points.map(([x,z])=>{
      const {phys}=__world,feet=phys.support(x,z,.5).y,p={x,z};
      phys.resolve(p,.32,feet,feet+1.75,.5);return Math.hypot(p.x-x,p.z-z);
    }),[corner,[lamp[0]+.12,lamp[1]]]);
    assert.ok(clear<.001 && solid>.15,'crossing centre clear and relocated shaft solid');
    await page.keyboard.down('w');
    try{await page.waitForFunction(([x,z,dx,dz])=>(__world.player.x-x)*dx+(__world.player.z-z)*dz>7.5,
      [x,z,dx,dz],{timeout:6000});}finally{await page.keyboard.up('w');}
    const lateral=await page.evaluate(([x,z,dx,dz])=>-(__world.player.x-x)*dz+(__world.player.z-z)*dx,[x,z,dx,dz]);
    assert.ok(Math.abs(lateral)<.14,'walk straight across the landing without deflection');
    assert.deepEqual(errors,[]);await page.close();
  }
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
