// Cold touch arrival, loaded artwork, same-scene revisit and a closed floor above.
// Run with node tests/shinsegae-market-entrance.mjs.
import assert from 'node:assert/strict';
import {chromium,devices} from 'playwright';
import {serve} from './serve.mjs';

const server=await serve(),browser=await chromium.launch({channel:'chromium',args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});
const base='http://127.0.0.1:'+server.address().port+'/?q=low&traffic=0';
const asset='**/ssg-market-entrance/entrance.glb';
const meshName='신세계 마켓 · 동측 대리석 출입구';
const context=await browser.newContext({...devices['Pixel 7'],deviceScaleFactor:1});
async function ready(page){
  await page.waitForFunction(()=>window.__world?.ready,null,{timeout:90000});
  const start=page.locator('#start button');
  if(await start.isVisible())await start.tap();
}
async function market(page){
  await page.locator('#btn-map').tap();
  await page.locator('.gt-panel-toggle').tap();
  await page.locator('#map-search').fill('신세계마켓');
  await page.locator('.gt-result').filter({has:page.getByText('신세계 마켓 입구',{exact:true})}).tap();
  await page.locator('.gt-teleport').tap();
  await page.waitForFunction(()=>window.__world?.ready&&__world.area==='in:shinsegae'&&!__world.map.isOpen()&&Math.abs(__world.player.x+58.6)<.4,null,{timeout:90000});
}
const errors=[];let release;
try{
  const page=await context.newPage();
  page.on('pageerror',e=>errors.push(e.message));
  let requests=0;const pending=new Promise(r=>release=r);
  await page.route(asset,async route=>{requests++;await pending;await route.continue();});
  await page.goto(base+'#/newcore/3F');await ready(page);await market(page);
  await page.waitForFunction(name=>__world.scene.getObjectByName(name)?.geometry,meshName);
  async function litLetterPixels(z0,z1){
    return page.evaluate(async({name,z0,z1})=>{
      const w=__world,m=w.scene.getObjectByName(name),c=w.camera;
      w.renderer.render(w.scene,c);
      const image=new Image();image.src=w.renderer.domElement.toDataURL();await image.decode();
      const canvas=document.createElement('canvas');canvas.width=image.width;canvas.height=image.height;
      const ctx=canvas.getContext('2d');ctx.drawImage(image,0,0);
      const project=(height,z)=>{
        const p=c.position.clone().set(.45,height,z).applyMatrix4(m.matrixWorld).project(c);
        return [(p.x+1)*image.width/2,(1-p.y)*image.height/2];
      };
      const a=project(3.75,z0),b=project(3.54,z1);
      const left=Math.max(0,Math.ceil(Math.min(a[0],b[0]))),right=Math.min(image.width,Math.floor(Math.max(a[0],b[0])));
      const top=Math.ceil(Math.min(a[1],b[1])),height=Math.floor(Math.abs(a[1]-b[1]));
      if(right<=left||height<=0)return 0;
      const data=ctx.getImageData(left,top,right-left,height).data;
      let bright=0;
      for(let i=0;i<data.length;i+=4)if(data[i]>100&&data[i]-data[i+2]>22)bright++;
      return bright;
    },{name:meshName,z0,z1});
  }
  assert.ok(await litLetterPixels(-1.07,1.07)>80,'visible gold strokes at the ordinary portrait arrival');
  // A narrow phone shows the centre inscription first. A normal one-finger
  // look brings the separate English name at the right end into the screen.
  const cdp=await context.newCDPSession(page);
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:193,y:428,id:1}]});
  await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:258,y:428,id:1}]});
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  await cdp.detach();await page.waitForTimeout(80);
  assert.ok(await litLetterPixels(-2.85,-1.34)>35,'English lettering visible before the detailed asset returns');
  await page.waitForTimeout(450);
  assert.ok(!(await page.locator('#toast.show').allTextContents()).some(t=>t.includes('클릭하면 계속')),
    'touch movement needs no mouse recovery hint');
  assert.equal(requests,1);
  release();
  await page.waitForFunction(name=>__world.scene.getObjectByName(name)?.geometry.index.count>3000,meshName);
  await market(page);
  await page.waitForFunction(name=>__world.scene.getObjectByName(name)?.geometry.index.count>3000,meshName);
  assert.equal(requests,1,'revisit reuses the final native model');
  await page.close();

  const covered=await context.newPage();let coveredRequests=0;
  covered.on('pageerror',e=>errors.push(e.message));
  covered.on('request',r=>{if(r.url().endsWith('/ssg-market-entrance/entrance.glb'))coveredRequests++});
  await covered.goto(base+'&pitch=-28#/shinsegae/1F?p=-58.5995,0,25.09413,110.784');
  await ready(covered);
  await covered.waitForFunction(name=>__world.scene.getObjectByName(name)&&__world.renderer.info.render.frame>12,meshName);
  assert.equal(await covered.evaluate(()=>__world.player.y),0);
  await covered.waitForTimeout(400);assert.equal(coveredRequests,0,'solid first floor covers the B1 portal');
  assert.deepEqual(errors,[]);
  console.log('B1 cold letters, 1 request on touch/return, 0 under closed 1F');
}finally{release?.();await browser.close();await new Promise(r=>server.close(r));}
