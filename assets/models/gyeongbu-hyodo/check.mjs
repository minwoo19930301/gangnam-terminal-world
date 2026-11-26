// Exercise the actual 1F search result, threshold, dining room and separate Gate 3 staircase.
import assert from 'node:assert/strict';
import {chromium,webkit,devices} from 'playwright';
import {serve} from '../../../tests/serve.mjs';

const isWebKit=process.argv.includes('--webkit'),mobile=isWebKit||process.argv.includes('--mobile');
const browser=isWebKit?await webkit.launch():await chromium.launch({channel:'chromium',
  args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});
const server=await serve();
const url='http://127.0.0.1:'+server.address().port+'/?q=low&fixedres=1&traffic=0';
const device=mobile?devices[isWebKit?'iPhone 13':'Pixel 7']:{viewport:{width:900,height:560}};
const errors=[],loads=[];
let page;

async function mapTo(name){
  if(mobile)await page.locator('#btn-map').tap();else await page.keyboard.press('m');
  await page.waitForFunction(()=>window.__world?.map.isOpen());
  if(mobile&&!await page.locator('#map-search').isVisible())await page.getByRole('button',{name:'장소 목록 열기'}).tap();
  await page.locator('#map-search').fill(name);
  const row=page.locator('.gt-result').filter({has:page.locator('b').getByText(name,{exact:true})});
  assert.equal(await row.count(),1,'one exact public map result for '+name);
  if(mobile){await row.tap();await page.locator('.gt-teleport').tap();}
  else{await row.click();await page.locator('.gt-teleport').click();}
  await page.waitForFunction(()=>window.__world?.ready&&!__world.map.isOpen());
}

async function pos(){
  return page.evaluate(()=>{
    const w=__world,p=w.player;
    return {x:p.x,y:p.y,z:p.z,zone:w.phys.zoneAt(p.x,p.y+.1,p.z)?.name,area:w.area,
      lost:w.renderer.getContext().isContextLost(),errors:[...w.errors,...w.K._.detailErrors]};
  });
}

async function move(direction,ms){
  if(!mobile){
    const key=direction<0?'w':'s';
    await page.keyboard.down(key);await page.waitForTimeout(ms);await page.keyboard.up(key);
    return;
  }
  const box=await page.locator('#stick').boundingBox();
  assert.ok(box?.width>0,'the touch movement pad is visible');
  const point={x:box.x+box.width/2,y:box.y+box.height/2+direction*box.height*.42};
  if(!isWebKit){
    const cdp=await page.context().newCDPSession(page);
    try{
      await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[point]});
      await page.waitForTimeout(ms);
      await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
    }finally{await cdp.detach();}
    return;
  }
  // WebKit's public Playwright API supports taps. Send the hold/release through
  // the DOM touch events consumed by the game's own on-screen pad.
  async function dispatch(type){
    await page.evaluate(({type,x,y})=>{
      const pad=document.querySelector('#stick'),touch={identifier:2,target:pad,clientX:x,clientY:y};
      const event=new Event(type,{bubbles:true,cancelable:true});
      const active=type==='touchstart'?[touch]:[];
      Object.assign(event,{touches:active,targetTouches:active,changedTouches:[touch]});
      pad.dispatchEvent(event);
    },{type,...point});
  }
  await dispatch('touchstart');await page.waitForTimeout(ms);await dispatch('touchend');
}

try{
  page=await browser.newPage({...device,deviceScaleFactor:1});
  page.on('pageerror',e=>errors.push(e.message));
  page.on('response',r=>{if(r.url().endsWith('/gyeongbu-hyodo/shop.glb'))loads.push(r.status());});
  await page.goto(url+'#/gyeongbu/1F');
  await page.waitForFunction(()=>window.__world?.ready,null,{timeout:90000});
  if(await page.locator('#start').isVisible()){
    const startButton=page.locator('#start button');
    if(mobile)await startButton.tap();else await startButton.click();
  }
  await mapTo('효도치킨');
  await page.selectOption('#sky-mode','night',{force:true});
  await page.waitForFunction(()=>{
    const model=__world.scene.getObjectByName('경부선 효도치킨 · 유리 입구와 식당');
    return model?.children[0].geometry.attributes.position.count>1000;
  },null,{timeout:20000});
  const start=await pos();assert.equal(start.zone,'효도치킨');assert.equal(start.y,0);
  await move(-1,1400);const inside=await pos();
  const distance=Math.hypot(inside.x-start.x,inside.z-start.z);
  assert.ok(distance>3.1,'walk from the covered porch through the customer door');
  assert.equal(inside.zone,'효도치킨');assert.equal(inside.y,0);
  await move(1,1400);const back=await pos();
  assert.ok(Math.hypot(back.x-start.x,back.z-start.z)<1.0,'the same entrance allows return to the porch');
  assert.deepEqual(loads,[200]);
  await mapTo('다이소 GATE 3');const gate=await pos();assert.equal(gate.zone,'다이소 GATE 3');
  await move(-1,2200);const stair=await pos();
  assert.ok(stair.y<-.40,'the neighboring public 1F to B1 staircase still descends');
  for(const state of [start,inside,back,gate,stair]){assert.equal(state.lost,false);assert.deepEqual(state.errors,[]);}
  assert.deepEqual(errors,[]);
  console.log(JSON.stringify({engine:isWebKit?'WebKit':'Chromium',mobile,metres:distance,
    returnError:Math.hypot(back.x-start.x,back.z-start.z),stairHeight:stair.y,loads,errors}));
}finally{await browser.close();server.close();}
