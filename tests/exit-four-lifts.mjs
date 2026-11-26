import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {serve} from './serve.mjs';

const server=await serve();
const browser=await chromium.launch({channel:'chromium',args:['--use-angle=metal']});
const page=await browser.newPage({viewport:{width:960,height:600}});
const errors=[],requests=[];
page.on('pageerror',err=>errors.push(err.message));
page.on('console',msg=>{if(msg.type()==='error')errors.push(msg.text());});
page.on('request',r=>{if(r.url().includes('/exit4-pavilion/') && r.url().endsWith('.glb'))requests.push(r.url().split('/').pop());});

async function open(address) {
  await page.goto('about:blank');
  await page.goto('http://127.0.0.1:'+server.address().port+'/?traffic=0&q=low&fixedres=1#/'+address);
  await page.waitForFunction(()=>window.__world?.ready,null,{timeout:90000});
  await page.locator('#start').click();
}

async function walk(x,z) {
  await page.evaluate(([x,z])=>{const p=__world.player;p.yaw=Math.atan2(p.x-x,p.z-z);},[x,z]);
  await page.keyboard.down('KeyW');
  try {
    await page.waitForFunction(([x,z])=>Math.hypot(__world.player.x-x,__world.player.z-z)<.19,[x,z],{timeout:6000,polling:'raf'});
  } finally {await page.keyboard.up('KeyW');}
}

async function ride(name,expected,floor,y) {
  await page.keyboard.press('e');
  const box=page.locator('#elev');
  await box.waitFor({state:'visible',timeout:4000});
  assert.equal(await box.locator('.elev-title').innerText(),name);
  const buttons=box.locator('.elev-list button');
  const labels=(await buttons.allTextContents()).map(label=>label.match(/(1F|B[123])/)[1]);
  assert.deepEqual(labels,expected);
  const chosen=buttons.filter({hasText:floor});
  await chosen.click();
  await page.waitForFunction(dest=>Math.abs(__world.player.y-dest)<.13,y);
  return labels;
}

try {
  await open('station/1F?p=-129,.06,246.1,111,8');
  await walk(-133.45,246.12);
  await walk(-133.8,247.76);
  await page.waitForFunction(()=>__world.scene.children.filter(o=>o.name.includes('관찰창이 있는 승강기 문짝')).length===2);
  const spread=await page.evaluate(()=>{const doors=__world.scene.children.filter(o=>o.name.includes('관찰창이 있는 승강기 문짝'));return Math.abs(doors[1].position.z-doors[0].position.z);});
  assert.ok(spread>1.03,'street doors must open before reaching the sill');
  await ride('4번 출구 · 7호선 엘리베이터',['1F','B2'],'B2',-11);
  await walk(-133.64,248);
  await walk(-135.2,248);
  await ride('4번 출구 · 7호선 엘리베이터',['1F','B2'],'1F',0);
  await walk(-133.75,247.87);
  assert.deepEqual([...new Set(requests)].sort(),['leaf.glb','pavilion.glb']);
  const interior=await page.evaluate(()=>__world.K._.elevators.filter(el=>/^7호선 (반포|내방) 방면 엘리베이터$/.test(el.name))
    .map(({name,x,z})=>({name,x,z})));
  assert.equal(interior.length,2);
  for(const lift of interior) {
    // Both public doors face the concourse between the parallel lift shafts.
    const other=interior.find(item=>item.name!==lift.name);
    const dx=other.x-lift.x,dz=other.z-lift.z,length=Math.hypot(dx,dz);
    await open('station/B2?p='+[lift.x+dx/length*3.5,-11,lift.z+dz/length*3.5,0,0].join(','));
    await walk(lift.x,lift.z);
    await ride(lift.name,['B2','B3'],'B3',-16);
    await ride(lift.name,['B2','B3'],'B2',-11);
  }
  assert.deepEqual(errors,[]);
  console.log('Street ramp, opening doors and three independent passenger lifts passed. Street files',requests);
}finally{
  await browser.close();await new Promise(resolve=>server.close(resolve));
}
