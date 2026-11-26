import fs from 'node:fs/promises';
import path from 'node:path';
import {chromium} from 'playwright';
import {serve} from '../../../tests/serve.mjs';

const output=process.argv[2],server=await serve(0);
const browser=await chromium.launch({channel:'chromium',headless:true});
try{
  const p=await browser.newPage(),base='http://127.0.0.1:'+server.address().port;
  await p.route(base+'/wayfinding-bake',r=>r.fulfill({contentType:'text/html',body:'<script type="importmap">'+
    JSON.stringify({imports:{three:'/node_modules/three/build/three.module.js','three/addons/':'/node_modules/three/examples/jsm/'}})+'</script>'}));
  await p.goto(base+'/wayfinding-bake');
  const data=await p.evaluate(async()=>{
    const T=await import('three');
    const {houseSignParts,paintHouseLiftSign}=await import('/assets/models/house-lift-passage/wayfinding.js');
    const canvas=document.createElement('canvas');canvas.width=768;canvas.height=384;paintHouseLiftSign(canvas);
    const parts=houseSignParts(T).map(({name,geometry:g})=>({name,
      vertices:Array.from(g.attributes.position.array),uv:Array.from(g.attributes.uv.array),index:Array.from(g.index.array)}));
    const {createKit}=await import('/js/kit.js');
    const {registerHotelWalnut}=await import('/assets/models/jw-arrival/walnut.js');
    const {liftPassage,walnutWalls}=await import('/assets/models/house-lift-passage/layout.js');
    const wood=document.createElement('canvas');
    registerHotelWalnut({rand:createKit(T,new T.Scene()).rand,texture(key,w,h,draw){
      if(key==='jwWalnut'){wood.width=w;wood.height=h;draw(wood.getContext('2d'),w,h);}
    }});
    return {parts,layout:liftPassage,walls:walnutWalls(),wood:wood.toDataURL(),image:canvas.toDataURL()};
  });
  await fs.writeFile(path.join(output,'face.png'),Buffer.from(data.image.split(',')[1],'base64'));
  await fs.writeFile(path.join(output,'walnut.png'),Buffer.from(data.wood.split(',')[1],'base64'));
  await fs.writeFile(path.join(output,'fixture.json'),JSON.stringify({parts:data.parts,layout:data.layout,walls:data.walls}));
}finally{await browser.close();server.close();}
