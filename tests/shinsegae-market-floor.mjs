// Exercise both wings of the B1 grocery sales floor with normal movement and collision.
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {departmentPoint, marketWestReturn} from '../js/places/shinsegae-b1-plan.js';
import {serve} from './serve.mjs';

const server = await serve(0);
const browser = await chromium.launch(process.argv.includes('--gpu')
  ? {channel:'chromium', args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']}
  : {args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const page = await browser.newPage({viewport:{width:900,height:600}});
const errors = [];
page.on('pageerror', error => errors.push(error.message));

async function state() {
  return page.evaluate(() => {
    const {player,area,phys} = window.__world;
    return {x:player.x, z:player.z, y:player.y, area,
      shop:phys.zoneAt(player.x,player.y+.1,player.z)?.name};
  });
}

async function walk(key, reached) {
  await page.keyboard.down(key);
  try {
    for (let start=Date.now(); Date.now()-start<10000;) {
      await page.waitForTimeout(85);
      const position=await state();
      assert.equal(position.area,'in:shinsegae');
      assert.equal(position.shop,'신세계 마켓');
      assert.ok(Math.abs(position.y+6)<.05,'sales floor must remain level');
      if (reached(position)) return position;
    }
    throw Error('could not walk across the market floor');
  } finally {
    await page.keyboard.up(key);
  }
}

try {
  for (const [v,from,to] of [[22,4,3],[55,1,2]]) {
    const start=departmentPoint(1.1,v), west=departmentPoint(-1,v);
    const dx=west[0]-start[0], dz=west[1]-start[1], length=Math.hypot(dx,dz);
    const direction=[dx/length,dz/length];
    const project=(x,z)=>(x-start[0])*direction[0]+(z-start[1])*direction[1];
    // Intersect the walk with the appropriate step of the registered store edge.
    const edge=marketWestReturn[from], other=marketWestReturn[to];
    const ex=other[0]-edge[0], ez=other[1]-edge[1];
    const distance=((edge[0]-start[0])*ez-(edge[1]-start[1])*ex)/(direction[0]*ez-direction[1]*ex);
    const yaw=Math.atan2(-dx,-dz)*180/Math.PI;
    const url='http://127.0.0.1:'+server.address().port+'/?q=low&traffic=0#/shinsegae/B1?p='+[start[0],-6,start[1],yaw].join(',');
    await page.goto(url);
    await page.waitForFunction(()=>window.__world?.ready,null,{timeout:120000});
    if (await page.locator('#start').isVisible()) await page.locator('#start').click();
    await walk('w',p=>project(p.x,p.z)>distance-.95);
    await page.keyboard.down('w');
    await page.waitForTimeout(650);
    await page.keyboard.up('w');
    const atWall=await state(), travelled=project(atWall.x,atWall.z);
    assert.ok(travelled>distance-.95 && travelled<distance-.20,'stop inside the market wall');
    await walk('s',p=>project(p.x,p.z)<.5);
    console.log('B1 return walk',travelled.toFixed(2),'m',atWall.shop);
  }
  assert.deepEqual(errors,[]);
} finally {
  await browser.close();
  await new Promise(resolve=>server.close(resolve));
}
