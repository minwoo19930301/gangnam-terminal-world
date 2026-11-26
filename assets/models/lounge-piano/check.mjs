import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {serve} from '../../../tests/serve.mjs';
const server=await serve(0), base='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({channel:'chromium',args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});
const view=(y,yaw,pitch,f)=>'/?pos=-9.8098,'+y+',142.0817&yaw='+yaw+'&pitch='+pitch+'#/jwmarriott/'+f;
const subject='더 라운지 · 그랜드 피아노와 의자';
try {
  for(const [name,url] of [['upstairs',view(41,55,-11,'9F')],['turn',view(35.5,-124.553,-11,'8F')],['offline',view(35.5,55.447,-11,'8F')]]) {
    const page=await browser.newPage(),files=[],errors=[];
    page.on('request',r=>{if(r.url().endsWith('/lounge-piano/grand.glb'))files.push(r.url());});
    page.on('pageerror',e=>errors.push(e.message));
    if(name==='offline')await page.route('**/lounge-piano/grand.glb',r=>r.abort());
    await page.goto(base+url);
    await page.waitForFunction(()=>window.__world?.ready,null,{timeout:90000});
    await page.waitForTimeout(1000);
    if(name==='turn') {
      assert.equal(files.length,0,'backs to the piano');
      await page.evaluate(()=>{window.__world.player.yaw=55.447*Math.PI/180;});
      await page.waitForFunction(key=>(window.__world.scene.getObjectByName(key)?.children[0].geometry.index?.count??0)>2000,subject);
      const count=await page.evaluate(key=>{
        const g=window.__world.scene.getObjectByName(key).children[0].geometry;
        return (g.index?.count??g.attributes.position.count)/3;
      },subject);
      for(const d of [-124.553,55.447]){
        await page.evaluate(a=>{window.__world.player.yaw=a*Math.PI/180;},d);
        await page.waitForTimeout(250);
      }
      console.log('near',count,'triangles in one mesh');
    }
    if(name==='offline'){
      const count=await page.evaluate(key=>{
        const g=window.__world.scene.getObjectByName(key).children[0].geometry;
        return (g.index?.count??g.attributes.position.count)/3;
      },subject);
      assert.ok(count>30&&count<400);
    }
    assert.deepEqual(errors,[]);assert.equal(files.length,name==='upstairs'?0:1);
    console.log(name,files.length,'piano file requests');await page.close();
  }
}finally{await browser.close();await new Promise(r=>server.close(r));}
