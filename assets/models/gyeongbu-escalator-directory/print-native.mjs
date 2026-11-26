// Render the same lettering used on the web into the editable source's packed image.
import fs from 'node:fs/promises';
import {chromium} from 'playwright';
import {paintDirectory} from './print.js';

const output=process.argv[2];
if(!output) throw new Error('Usage: node print-native.mjs /path/to/directory.png');
const browser=await chromium.launch({channel:'chromium',headless:true});
try{
  const page=await browser.newPage();
  await page.addScriptTag({content:'window.paint='+paintDirectory.toString()});
  const png=await page.evaluate(()=>{
    const canvas=document.createElement('canvas');
    canvas.width=1024;canvas.height=256;
    window.paint(canvas.getContext('2d'),1024,256);
    return canvas.toDataURL('image/png').split(',')[1];
  });
  await fs.writeFile(output,Buffer.from(png,'base64'));
}finally{
  await browser.close();
}
