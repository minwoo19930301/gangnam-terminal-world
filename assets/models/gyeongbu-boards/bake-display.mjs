// Sample the same canvas painter used by the passenger hall, without starting the game.
import path from 'node:path';
import {writeFile} from 'node:fs/promises';
import {chromium} from 'playwright';
import {serve} from '../../../tests/serve.mjs';

const output=process.argv[2],server=await serve(0);
const browser=await chromium.launch({headless:true,channel:'chromium'});
try{
  const page=await browser.newPage();
  const base='http://127.0.0.1:'+server.address().port;
  await page.route(base+'/display-bake',r=>r.fulfill({contentType:'text/html',body:
    '<script type="importmap">'+JSON.stringify({imports:{three:'/node_modules/three/build/three.module.js','three/addons/':'/node_modules/three/examples/jsm/'}})+'</script>'}));
  await page.goto(base+'/display-bake');
  const {background,digits,slots,posters}=await page.evaluate(async()=>{
    const T=await import('three');
    const {placeDeparturePortal,posterCaptions}=await import('/assets/models/gyeongbu-boards/model.js');
    let group,time='00:00';
    placeDeparturePortal({THREE:T,displayClock:()=>time,addMesh:o=>group=o},0,0,0);
    const screen=group.getObjectByName('승차홈 5~10 · 출발안내 화면');
    const face=screen.material.map.image,ctx=face.getContext('2d');
    const glyphWidth=ctx.measureText('0').width;
    const start=(face.width-ctx.measureText('00:00').width)/2;
    const slots=['','0','00:','00:0'].map(pre=>Math.round(start+ctx.measureText(pre).width));
    const size=Math.ceil(glyphWidth),height=92,top=155;
    const atlas=document.createElement('canvas');atlas.width=size*10;atlas.height=height;
    const paint=atlas.getContext('2d');
    for(let digit=0;digit<10;digit++){
      time=String(digit)+'0:00';screen.onBeforeRender();
      paint.drawImage(face,slots[0],top,size,height,digit*size,0,size,height);
    }
    for(const left of slots){ctx.fillStyle='#182228';ctx.fillRect(left,top,size,height);}
    const {createSignAtlas}=await import('/js/textures.js');
    const posterAtlas=createSignAtlas(T,{size:512,quality:1});
    const posters=posterCaptions.map(({text,x,y,w,h,fg})=>{
      const {page,uv}=posterAtlas.draw(text,{w,h,fg,bg:null,padding:.025,pxPerM:220});
      const [u0,v0,u1,v1]=uv,side=page.c.width,crop=document.createElement('canvas');
      crop.width=Math.round((u1-u0)*side+1);crop.height=Math.round((v1-v0)*side+1);
      crop.getContext('2d').drawImage(page.c,Math.round(u0*side-.5),Math.round((1-v1)*side-.5),
        crop.width,crop.height,0,0,crop.width,crop.height);
      return {x,y,w,h,image:crop.toDataURL()};
    });
    return {posters,background:face.toDataURL(),digits:atlas.toDataURL(),slots:{left:slots,width:size,top,height}};
  });
  for(const [name,data] of Object.entries({background,digits})){
    await writeFile(path.join(output,name+'.png'),Buffer.from(data.split(',')[1],'base64'));
  }
  for(const [i,poster] of posters.entries()){
    await writeFile(path.join(output,'caption-'+i+'.png'),Buffer.from(poster.image.split(',')[1],'base64'));
    delete poster.image;
  }
  await writeFile(path.join(output,'slots.json'),JSON.stringify({...slots,posters}));
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
