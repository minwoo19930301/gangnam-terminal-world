import {chromium} from 'playwright';
import sharp from 'sharp';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {serve} from '../../../tests/serve.mjs';

const dir=path.dirname(fileURLToPath(import.meta.url)),server=await serve(0);
const browser=await chromium.launch({channel:'chromium',args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});
// A point over the customer's side of the dark marble counter.
const a=[267.83,-413.02],b=[302.67,-328.87],l=Math.hypot(b[0]-a[0],b[1]-a[1]);
const du=(b[0]-a[0])/l,dz=(b[1]-a[1])/l,front=33.18428218*.5-3.25;
const px=-.40,depth=7.36;
const x=(a[0]+b[0])/2-du*px-dz*(front-depth),z=(a[1]+b[1])/2-dz*px+du*(front-depth);
try{
  const page=await browser.newPage({viewport:{width:860,height:600}});
  await page.addInitScript(()=>sessionStorage.setItem('sky-mode','day'));
  await page.goto('http://127.0.0.1:'+server.address().port+'/?fixedres=1&pos='+[x,18.6,z].join(',')+'#/newcore/5F');
  await page.waitForFunction(()=>window.__world?.ready,null,{timeout:110000});
  for(let k=0;k<12;k++){await page.evaluate(i=>{__world.player.yaw=i*Math.PI/6;},k);await page.waitForTimeout(100);}
  const n=128,faces=await page.evaluate(async([x,z,n])=>{
    const T=await import('three'),{renderer,scene,camera,player}=__world;
    // The glass itself sits just behind the probe and should not mirror itself.
    for(const name of ['애슐리퀸즈 · 네 단으로 흐르는 밀크초콜릿','애슐리퀸즈 · 회전 받침과 스테인리스 퐁뒤 볼','애슐리퀸즈 · 철망 유리와 디저트 안내판'])
      scene.getObjectsByProperty('name',name).forEach(g=>{g.visible=false;});
    const target=new T.WebGLCubeRenderTarget(n,{colorSpace:T.SRGBColorSpace,generateMipmaps:false,depthBuffer:true});
    const cube=new T.CubeCamera(.018,120,target);
    cube.position.set(x,camera.position.y-.10,z);cube.updateMatrixWorld(true);cube.update(renderer,scene);
    const output=[];for(let i=0;i<6;i++){const bytes=new Uint8Array(n*n*4);renderer.readRenderTargetPixels(target,0,0,n,n,bytes,i);output.push(Array.from(bytes));}
    target.dispose();return output;
  },[x,z,n]);
  const tiles=await Promise.all(faces.map(async(bytes,i)=>({input:await sharp(Buffer.from(bytes),{raw:{width:n,height:n,channels:4}}).removeAlpha().blur(.75).png().toBuffer(),left:i%3*n,top:Math.floor(i/3)*n})));
  await sharp({create:{width:n*3,height:n*2,channels:3,background:'#282822'}}).composite(tiles).webp({quality:86}).toFile(path.join(dir,'counter-reflection.webp'));
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
