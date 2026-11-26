import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {serve} from '../../../tests/serve.mjs';
const server=await serve(0), base='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({channel:'chromium',args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});
const expected=['corner-sofa.glb','gathered.glb'];
const view=(y,yaw,f)=>'/?pos=-10.7720,'+y+',133.4519&yaw='+yaw+'&pitch=8#/jwmarriott/'+f;
try{
  for(const [label,url] of [['9F',view(41,60.295,'9F')],['8F',view(35.5,-119.705,'8F')]]) {
    const page=await browser.newPage(),requests=[],errors=[];
    page.on('request',r=>{const file=r.url().split('/').at(-1);if(expected.includes(file))requests.push(file);});
    page.on('pageerror',e=>errors.push(e.message));
    await page.goto(base+url);
    await page.waitForFunction(()=>window.__world?.ready,null,{timeout:90000});
    await page.waitForTimeout(750);
    assert.deepEqual(requests,[],label+' facing away or on a different floor');
    if(label==='8F'){
      await page.evaluate(()=>{window.__world.player.yaw=60.295*Math.PI/180;});
      await page.waitForFunction(()=>['더 라운지 · 크림색 코너 소파','더 라운지 · 묶은 주름 커튼'].every(
        key=>(window.__world.scene.getObjectByName(key)?.children[0].geometry.index?.count??0)>2000));
      for(const a of [-119.705,60.295]){
        await page.evaluate(angle=>{window.__world.player.yaw=angle*Math.PI/180;},a);
        await page.waitForTimeout(220);
      }
      assert.deepEqual(requests.sort(),[...expected].sort());
    }
    assert.deepEqual(errors,[]);console.log(label,requests);
    await page.close();
  }
}finally{await browser.close();await new Promise(r=>server.close(r));}
