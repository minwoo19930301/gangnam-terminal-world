// Rasterize the original paper and bread-stamp artwork without opening a browser window.
import {readFile,writeFile} from 'node:fs/promises';
import {chromium} from 'playwright';
const svg=await readFile(new URL('./print.svg',import.meta.url),'utf8');
const browser=await chromium.launch({headless:true});
try{
  const page=await browser.newPage();
  const data=await page.evaluate(async source=>{
    const image=new Image();image.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(source);
    await image.decode();
    const canvas=document.createElement('canvas');canvas.width=512;canvas.height=512;
    canvas.getContext('2d').drawImage(image,0,0);
    return canvas.toDataURL('image/png').split(',')[1];
  },svg);
  await writeFile(process.argv[2],Buffer.from(data,'base64'));
}finally{await browser.close();}
