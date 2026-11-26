import {writeFile} from 'node:fs/promises';
import {chromium} from 'playwright';
const browser=await chromium.launch({headless:true});
try{
  const page=await browser.newPage();
  const print=await page.evaluate(()=>{
    const canvas=document.createElement('canvas');canvas.width=canvas.height=512;const g=canvas.getContext('2d');
    g.fillStyle='#fff';g.fillRect(0,0,512,512);g.textAlign='center';g.textBaseline='middle';
    for(const [y,bg,fg,text,size] of [
      [0,'#29282b','#fff9ed',"I'm donut ?",72],[106,'#ffffff','#27252b',"I'm donut",86],
      [212,'#faefd8','#fffaf0',"I'm donut ?",85],[318,'#f6f0e1','#322827','?',72]]){
      g.fillStyle=bg;g.fillRect(0,y,512,102);
      g.fillStyle=fg;g.font='bold '+size+'px Arial,sans-serif';g.fillText(text,256,y+54);
    }return canvas.toDataURL('image/png').split(',')[1];
  });await writeFile(process.argv[2],Buffer.from(print,'base64'));
}finally{await browser.close();}
