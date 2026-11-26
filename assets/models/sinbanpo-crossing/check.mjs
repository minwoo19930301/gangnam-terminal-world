// On the normal street page, verify the separated white bands and walk both ways.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {chromium} from 'playwright';
import {serve} from '../../../tests/serve.mjs';
import {crossingWay,markingFaces} from './layout.js';

const road=JSON.parse(fs.readFileSync(new URL('../../../data/osm.json',import.meta.url))).roads.find(r=>r.id===crossingWay);
const a=road.pts[0],b=road.pts.at(-1),length=Math.hypot(b[0]-a[0],b[1]-a[1]);
const ux=(b[0]-a[0])/length,uz=(b[1]-a[1])/length;
const probes=[];
for(const face of markingFaces(a,b).filter(f=>f.length===4)){
  const [x,z]=face.reduce(([sx,sz],[px,pz])=>[sx+px/4,sz+pz/4],[0,0]);
  const along=(x-a[0])*ux+(z-a[1])*uz,side=-(x-a[0])*uz+(z-a[1])*ux;
  if(side>0 && (along>7&&along<8 || along>17&&along<18)){
    probes.push([x,z,true],[a[0]+ux*along,a[1]+uz*along,false]);
  }
}
assert.equal(probes.length,4);
const server=await serve(),browser=await chromium.launch({channel:'chromium',
  args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});
try{
  for(const [from,to,f] of [[a,b,1],[b,a,-1]]){
    const page=await browser.newPage({viewport:{width:860,height:520}}),errors=[],loads=[];
    page.on('pageerror',e=>errors.push(e.message));
    page.on('response',r=>{if(r.url().endsWith('/sinbanpo-crossing/signal.glb'))loads.push(r.status())});
    const yaw=Math.atan2(-ux*f,-uz*f)*180/Math.PI;
    const at=[from[0]-.7*ux*f,.15,from[1]-.7*uz*f,yaw,-10];
    await page.goto('http://127.0.0.1:'+server.address().port+'/?q=low&fixedres=1&traffic=0#/street?p='+at.join(','));
    await page.waitForFunction(()=>window.__world?.ready);await page.locator('#start button').click();
    const result=await page.evaluate(async points=>{
      const w=__world,T=w.K.THREE,{relief}=await import('/js/banpo_relief.js');
      const surfaces=[]; w.scene.traverseVisible(o=>{if(o.isMesh && !o.isInstancedMesh)surfaces.push(o)});
      const paint=new T.Color(0xf4f1e6);
      return points.map(([x,z,wanted])=>{
        const ray=new T.Raycaster(new T.Vector3(x,relief(x,z)+.8,z),new T.Vector3(0,-1,0),.01,1.4);
        const hit=ray.intersectObjects(surfaces,false).find(h=>{
          for(let o=h.object;o;o=o.parent)if(!o.visible)return false;
          return h.face?.normal.y>.4;
        });
        const color=new T.Color();
        if(hit?.object.geometry.attributes.color)color.fromBufferAttribute(hit.object.geometry.attributes.color,hit.face.a);
        const white=Math.max(Math.abs(color.r-paint.r),Math.abs(color.g-paint.g),Math.abs(color.b-paint.b))<.025;
        return {wanted,white};
      });
    },probes);
    for(const row of result)assert.equal(row.white,row.wanted,JSON.stringify(result));
    const sample=()=>page.evaluate(()=>[__world.player.x,__world.player.y,__world.player.z]);
    const start=await sample();await page.keyboard.down('w');
    try{await page.waitForFunction(([x,z])=>Math.hypot(__world.player.x-x,__world.player.z-z)<.42,to,{timeout:12000});}
    finally{await page.keyboard.up('w');}
    const end=await sample();const travelled=Math.hypot(end[0]-start[0],end[2]-start[2]);
    assert.ok(travelled>24 && travelled<25);
    assert.deepEqual(loads,[200]);assert.deepEqual(errors,[]);
    console.log(JSON.stringify({direction:f,travelled,paintProbes:result,loads,errors}));
    await page.close();
  }
}finally{await browser.close();server.close();}
