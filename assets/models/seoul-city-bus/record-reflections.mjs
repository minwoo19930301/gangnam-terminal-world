import fs from 'node:fs/promises';
import sharp from 'sharp';
import {chromium} from 'playwright';
const centers=[{route:'142',x:-70.72225,z:-100.49598},{route:'360',x:9.43929,z:-128.15860}];
const base=process.argv[2]??'http://127.0.0.1:8765';
const b=await chromium.launch({channel:'chromium',args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});
const sourceDir=process.argv[3]??'/tmp/seoul-city-bus-reflections';await fs.mkdir(sourceDir,{recursive:true});
try{
 const page=await b.newPage({viewport:{width:360,height:360}});
 for(const {route,x,z,angle} of centers){
  await page.goto(base+'/?area=out:core&pos='+[x+3,.05,z-3].join(',')+'#/streets');
  await page.waitForFunction(()=>window.__world?.ready,null,{timeout:90000});
  for(const mode of ['day','night']){
   await page.evaluate(m=>__world.setTimeMode(m),mode);await page.waitForTimeout(350);
   const images=await page.evaluate(async ([x,z])=>{
    const T=await import('three'),w=__world,scene=w.scene,r=w.renderer;
    const {relief}=await import('/js/banpo_relief.js');
    for(const o of scene.children)if(o.isSprite||o.userData.parkedFleet||o.userData.dynamic||o.name.startsWith('신반포로 간선버스 · '))o.visible=false;
    const pos=new T.Vector3(x,relief(x,z)+2,z),tmp=new T.PerspectiveCamera(90,1,.17,2800);
    // Six ordinary game renders. Off-screen browser only, with the camera above the stopped axle.
    const dirs=[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]],dest=[];
    const target=new T.WebGLRenderTarget(192,192,{colorSpace:T.SRGBColorSpace});
    tmp.position.copy(pos);for(const [i,v] of dirs.entries()){
      tmp.up.set(0,1,0);if(i===2)tmp.up.set(0,0,-1);if(i===3)tmp.up.set(0,0,1);
      tmp.lookAt(pos.clone().add(new T.Vector3(...v)));tmp.updateMatrixWorld(true);
      w.K._.cull(x,2,z,true,tmp);
      for(const ob of scene.children){
        if(ob.isSprite||ob.userData.parkedFleet||ob.userData.dynamic||ob.name.startsWith('신반포로 간선버스 · ')){
          ob.traverse(item=>item.layers.disable(0));
        }
      }
      r.setRenderTarget(target);r.render(scene,tmp);
      const buf=new Uint8Array(192*192*4);r.readRenderTargetPixels(target,0,0,192,192,buf);
      dest.push({pixels:Array.from(buf),matrix:tmp.matrixWorldInverse.toArray()});
    }
    r.setRenderTarget(null);target.dispose();return dest;
   },[x,z]);
   for(const [i,{pixels,matrix}] of images.entries()){
    await fs.writeFile(sourceDir+'/'+route+'-'+mode+'-'+i+'.matrix',JSON.stringify(matrix));
    await sharp(Buffer.from(pixels),{raw:{width:192,height:192,channels:4}}).flip().png().toFile(sourceDir+'/'+route+'-'+mode+'-'+i+'.png');
   }
   console.log(route,mode);
  }
 }
}finally{await b.close();}
