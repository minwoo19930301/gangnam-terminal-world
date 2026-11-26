// The customer can see the oak floor while the entire apparel island stays behind them.
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {serve} from '../../../tests/serve.mjs';

const server=await serve(0),browser=await chromium.launch({channel:'chromium',args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});
const p=await browser.newPage({viewport:{width:1110,height:735},deviceScaleFactor:1});
const inputs={floor:'경부선 유니클로 · 참나무 판매층과 흰 노출 천장',product:'경부선 유니클로 · 에어리즘과 입구 코디'};
const requests={floor:[],product:[],distant:[]},errors=[];
p.on('pageerror',e=>errors.push(e.message));
p.on('response',r=>{
  if(r.url().endsWith('/gyeongbu-uniqlo-finish/oak-and-lighting.glb'))requests.floor.push(r.status());
  if(r.url().endsWith('/gyeongbu-uniqlo/entrance-fashion.glb'))requests.product.push(r.status());
  if(r.url().endsWith('/gyeongbu-uniqlo/proxy.js'))requests.distant.push(r.status());
});
const u=62.87,v=15.58,x=2.3+u*.9348+v*.3552,z=-59.24-u*.3552+v*.9348;
try{
  await p.goto('http://127.0.0.1:'+server.address().port+'/index.html?fixedres=1#/gyeongbu/1F?p='+[x,0,z,-69.194].join(','));
  await p.waitForFunction(()=>window.__world?.ready,null,{timeout:130000});
  await p.evaluate(()=>{document.getElementById('start').click();__world.setTimeMode('day');__world.player.pitch=-.22;});
  await p.waitForFunction(name=>Boolean(__world.scene.getObjectByName(name)?.children[0]?.material.normalMap),inputs.floor);
  const finish=await p.evaluate(name=>{
    const w=__world,T=w.K.THREE,item=w.scene.getObjectByName(name).children[0],player=w.player;
    const ray=new T.Raycaster(new T.Vector3(player.x,player.y+1.0,player.z),new T.Vector3(0,-1,0),0,2);
    const hits=ray.intersectObject(item);
    return {renderedFloorHeight:hits[0]?.point.y,draws:item.parent.children.length,triangles:item.geometry.index.count/3,
      maps:[item.material.map,item.material.normalMap,item.material.roughnessMap,item.material.emissiveMap].map(t=>t.image.width)};
  },inputs.floor);
  assert.ok(finish.renderedFloorHeight>.032 && finish.renderedFloorHeight<.050,JSON.stringify(finish));
  assert.deepEqual(finish.maps,[512,128,128,128]);assert.equal(finish.draws,1);
  await p.waitForTimeout(450);assert.deepEqual(requests,{floor:[200],product:[],distant:[]});
  await p.evaluate(()=>{__world.player.yaw+=Math.PI;});
  await p.waitForFunction(name=>Boolean(__world.scene.getObjectByName(name)?.children[0]?.material.normalMap),inputs.product);
  await p.evaluate(names=>{
    window.__rackDraws={product:0,floor:0};
    for(const [key,name] of Object.entries(names)){
      const item=__world.scene.getObjectByName(name).children[0],old=item.onBeforeRender;
      item.onBeforeRender=function(...args){window.__rackDraws[key]++;return old.apply(this,args);};
    }
    __world.player.yaw-=Math.PI;
  },inputs);
  await p.waitForTimeout(160);
  await p.evaluate(()=>{window.__rackDraws={product:0,floor:0};});
  await p.waitForTimeout(350);
  const drawn=await p.evaluate(()=>window.__rackDraws);
  assert.ok(drawn.floor>=3,JSON.stringify(drawn));assert.equal(drawn.product,0,JSON.stringify(drawn));
  assert.deepEqual(requests,{floor:[200],product:[200],distant:[200]});assert.deepEqual(errors,[]);
  console.log(JSON.stringify({finish,drawn,requests,errors},null,2));
}finally{await browser.close();await new Promise(r=>server.close(r));}
