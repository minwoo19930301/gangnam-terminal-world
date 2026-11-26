import {writeFile} from 'node:fs/promises';
import path from 'node:path';
import {chromium} from 'playwright';
import {serve} from '../../../tests/serve.mjs';

const server=await serve(0);
const browser=await chromium.launch({headless:true,channel:'chromium'});
try{
  const page=await browser.newPage();
  const base='http://127.0.0.1:'+server.address().port;
  await page.route(base+'/clock-bake',route=>route.fulfill({contentType:'text/html',body:'<title>승차섬 전광판</title>'}));
  await page.goto(base+'/clock-bake');
  const result=await page.evaluate(async()=>{
    const {paintClock}=await import('/assets/models/sinbanpo-bus-shelters/clock-face.js');
    const face=document.createElement('canvas');face.width=512;face.height=128;
    const ctx=face.getContext('2d'),images={};
    paintClock(ctx,'22019','00:00');
    const width=ctx.measureText('0').width,start=498-width*5;
    const slots=[0,1,3,4].map(i=>Math.round(start+i*width));
    const cell=Math.ceil(width),top=60,height=61;
    const atlas=document.createElement('canvas');atlas.width=cell*10;atlas.height=height;
    const pen=atlas.getContext('2d');
    for(let i=0;i<10;i++){
      paintClock(ctx,'22019',i+'0:00');pen.drawImage(face,slots[0],top,cell,height,cell*i,0,cell,height);
    }
    images.digits=atlas.toDataURL();
    for(const id of ['22019','22020']){
      paintClock(ctx,id,'00:00');
      ctx.fillStyle='#101917';for(const x of slots)ctx.fillRect(x,top,cell,height);
      images[id]=face.toDataURL();
    }
    return {images,slots,cell,top,height};
  });
  const output=process.argv[2];
  for(const [name,data] of Object.entries(result.images))await writeFile(path.join(output,name+'.png'),Buffer.from(data.split(',')[1],'base64'));
  delete result.images;await writeFile(path.join(output,'slots.json'),JSON.stringify(result));
}finally{await browser.close();server.close();}
