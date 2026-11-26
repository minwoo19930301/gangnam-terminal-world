import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {serve} from '../../../tests/serve.mjs';

const server=await serve(0),base='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({channel:'chromium',args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});
const normal='285.0725,14.2,-333.6355', far='269.8505,14.2,-323.8698', label='모던하우스 · 마르셰 프로방스';
const url=(pos,yaw,floor)=>base+'/?pos='+pos+'&yaw='+yaw+'&pitch=-3#/newcore/'+floor;
try{
  for(const [pos,yaw,floor] of [['285.0725,18.6,-333.6355',-50.31,'5F'],[far,-55.95,'4F'],['294.4816,14.2,-338.9381',112.49,'4F'],[normal,129.69,'4F']]){
    const page=await browser.newPage(),requests=[],errors=[];
    page.on('request',r=>{if(r.url().endsWith('/modernhouse-provence/provence.glb'))requests.push(r.url());});
    page.on('pageerror',e=>errors.push(e.message));
    await page.goto(url(pos,yaw,floor));
    await page.waitForFunction(()=>window.__world?.ready,null,{timeout:90000});
    await page.waitForTimeout(400);
    assert.equal(requests.length,0,'other floor, far, behind the partition or turned away');
    if(pos===normal){
      await page.mouse.click(600,360);
      await page.evaluate(()=>{__world.player.yaw=-50.31*Math.PI/180;});
      await page.waitForFunction(name=>(__world.scene.getObjectByName(name)?.children[0].geometry.index?.count??0)>20000,label);
      const model=await page.evaluate(name=>{
        const r=__world.scene.getObjectByName(name),m=r.children[0];
        return {x:r.position.x,z:r.position.z,angle:r.rotation.y,triangles:m.geometry.index.count/3};
      },label);
      const {x,z,angle}=model, forward=[Math.sin(angle),Math.cos(angle)], across=[Math.cos(angle),-Math.sin(angle)];
      for(const s of [-1,1]){
        const start=[x+s*2.33*across[0]+2.0*forward[0],z+s*2.33*across[1]+2.0*forward[1]];
        await page.evaluate(([x,z,angle])=>__world.player.teleport(x,14.2,z,angle),[...start,angle]);
        await page.keyboard.down('w');
        try{await page.waitForFunction(([x,z])=>Math.hypot(__world.player.x-x,__world.player.z-z)>3,[...start],{timeout:3500});}
        finally{await page.keyboard.up('w');}
        assert.ok(Math.abs(await page.evaluate(()=>__world.player.y)-14.2)<.16,'floor level along table');
      }
      assert.equal(requests.length,1);
      console.log(JSON.stringify({area:'NewCore 1 4F',model,sideAisles:'walked >3 m each',requests:requests.length}));
    }
    assert.deepEqual([...errors,...await page.evaluate(()=>[...__world.errors,...__world.K._.detailErrors])],[]);
    await page.close();
  }
}finally{await browser.close();await new Promise(ok=>server.close(ok));}
