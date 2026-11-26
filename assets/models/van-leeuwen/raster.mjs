import {readFile,writeFile} from 'node:fs/promises';
import {chromium} from 'playwright';
const logo=(await readFile(new URL('./wordmark.png',import.meta.url))).toString('base64');
const browser=await chromium.launch({headless:true});
try{
  const page=await browser.newPage();
  const png=await page.evaluate(async encoded=>{
    const image=new Image();image.src='data:image/png;base64,'+encoded;await image.decode();
    const canvas=document.createElement('canvas');canvas.width=canvas.height=512;
    const g=canvas.getContext('2d');
    g.fillStyle='white';g.fillRect(0,0,512,512);g.drawImage(image,12,10,248,62);
    g.fillStyle='#302c28';g.fillRect(0,268,273,82);
    const light=document.createElement('canvas');light.width=250;light.height=62;
    const ink=light.getContext('2d');ink.drawImage(image,0,0);
    ink.globalCompositeOperation='source-in';ink.fillStyle='#f8eedc';ink.fillRect(0,0,250,62);
    g.drawImage(light,12,278,248,62);
    const menu=[
      ['ICE CREAM','#d9eeef'],['FRESHLY BAKED','#eee9db'],['MILKSHAKES','#f9ede9'],['ORIGINAL','#d6e7ef']
    ];
    for(const [i,[name,fill]] of menu.entries()){
      const x=i*126;g.fillStyle=fill;g.fillRect(x,95,125,154);
      g.fillStyle='#252b31';g.font='bold 15px sans-serif';g.textAlign='center';g.fillText(name,x+62,125);
      if(i===1||i===3)g.fillText(i===1?'WAFFLE CUPS':'MILKSHAKES',x+62,143);
      for(let j=0;j<3;j++){
        const cx=x+23+j*39,cy=193;g.fillStyle=['#dbbdb1','#b7c2aa','#dbb6bf'][j];
        g.beginPath();g.arc(cx,cy-8,12,0,Math.PI*2);g.fill();g.fillStyle=i===1?'#c7945b':'#fffaf2';
        g.beginPath();g.moveTo(cx-13,cy-5);g.lineTo(cx+13,cy-5);g.lineTo(cx+8,cy+14);g.lineTo(cx-8,cy+14);g.fill();
      }
    }
    return canvas.toDataURL('image/png').split(',')[1];
  },logo);await writeFile(process.argv[2],Buffer.from(png,'base64'));
}finally{await browser.close();}
