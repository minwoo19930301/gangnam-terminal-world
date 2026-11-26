import {chromium} from 'playwright';
import sharp from 'sharp';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {serve} from '../../../tests/serve.mjs';

const dir=path.dirname(fileURLToPath(import.meta.url)),server=await serve(0);
const browser=await chromium.launch({channel:'chromium',headless:true,args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});
// Capture the lounge timber, cove lighting and the rug beside the coffee counter.
const u=12.8,v=7.77;
const x=-23.6925+.933337*u+.359001*v,z=99.5825-.359001*u+.933337*v;
try{
  const page=await browser.newPage({viewport:{width:860,height:600}});
  await page.addInitScript(()=>sessionStorage.setItem('sky-mode','day'));
  await page.goto('http://127.0.0.1:'+server.address().port+'/?fixedres=1&pos='+[x,41,z].join(',')+'#/jwmarriott/9F',{waitUntil:'domcontentloaded',timeout:100000});
  await page.waitForFunction(()=>window.__world?.ready,null,{timeout:110000});
  for(let k=0;k<12;k++){await page.evaluate(i=>{__world.player.yaw=i*Math.PI/6;},k);await page.waitForTimeout(100);}
  const n=192,faces=await page.evaluate(async([x,z,n])=>{
    const T=await import('three'),{renderer,scene,camera,player}=__world;
    // Exclude the piece whose material will sample this environment.
    for(const g of scene.children){if(g.name.startsWith('JW 9층 · ')&&!g.name.includes('벽장'))g.visible=false;}
    const target=new T.WebGLCubeRenderTarget(n,{colorSpace:T.SRGBColorSpace,generateMipmaps:false,depthBuffer:true});
    const cube=new T.CubeCamera(.018,120,target);
    cube.position.set(x,camera.position.y-.29,z);cube.updateMatrixWorld(true);cube.update(renderer,scene);
    const output=[];for(let i=0;i<6;i++){const bytes=new Uint8Array(n*n*4);renderer.readRenderTargetPixels(target,0,0,n,n,bytes,i);output.push(Array.from(bytes));}
    target.dispose();return output;
  },[x,z,n]);
  const tiles=await Promise.all(faces.map(async(bytes,i)=>({input:await sharp(Buffer.from(bytes),{raw:{width:n,height:n,channels:4}}).removeAlpha().blur(.75).png().toBuffer(),left:i%3*n,top:Math.floor(i/3)*n})));
  await sharp({create:{width:n*3,height:n*2,channels:3,background:'#282822'}}).composite(tiles).webp({quality:86}).toFile(path.join(dir,'lounge-reflection.webp'));
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
