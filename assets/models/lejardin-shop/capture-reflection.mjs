import {chromium} from 'playwright';
import sharp from 'sharp';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {serve} from '../../../tests/serve.mjs';

const dir=path.dirname(fileURLToPath(import.meta.url)),server=await serve(0);
const browser=await chromium.launch({channel:'chromium',args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});
const r=Math.atan2(.358,.934),s=Math.sin(r),c=Math.cos(r);
const x=-46+53.25*s-9.36*c,z=43.1+53.25*c+9.36*s;
try{
  const page=await browser.newPage({viewport:{width:860,height:600}});
  await page.addInitScript(()=>sessionStorage.setItem('sky-mode','day'));
  await page.goto('http://127.0.0.1:'+server.address().port+'/?fixedres=1&pos='+[x,0,z].join(',')+'#/centralcity/1F');
  await page.waitForFunction(()=>window.__world?.ready,null,{timeout:110000});
  for(let k=0;k<12;k++){await page.evaluate(i=>{__world.player.yaw=i*Math.PI/6;},k);await page.waitForTimeout(100);}
  const n=128,faces=await page.evaluate(async([x,z,n])=>{
    const T=await import('three'),{renderer,scene,camera,player}=__world;
    // The glass itself sits just behind the probe and should not mirror itself.
    for(const name of ['르자당 · 냉장고의 유리 문과 손잡이','르자당 · 세 단의 물병과 화병'])
      scene.getObjectsByProperty('name',name).forEach(g=>{g.visible=false;});
    const target=new T.WebGLCubeRenderTarget(n,{colorSpace:T.SRGBColorSpace,generateMipmaps:false,depthBuffer:true});
    const cube=new T.CubeCamera(.018,120,target);
    cube.position.set(x,camera.position.y-player.y-.38,z);cube.updateMatrixWorld(true);cube.update(renderer,scene);
    const output=[];for(let i=0;i<6;i++){const bytes=new Uint8Array(n*n*4);renderer.readRenderTargetPixels(target,0,0,n,n,bytes,i);output.push(Array.from(bytes));}
    target.dispose();return output;
  },[x,z,n]);
  const tiles=await Promise.all(faces.map(async(bytes,i)=>({input:await sharp(Buffer.from(bytes),{raw:{width:n,height:n,channels:4}}).removeAlpha().blur(.75).png().toBuffer(),left:i%3*n,top:Math.floor(i/3)*n})));
  await sharp({create:{width:n*3,height:n*2,channels:3,background:'#282822'}}).composite(tiles).webp({quality:86}).toFile(path.join(dir,'cooler-reflection.webp'));
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
