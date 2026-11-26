// Lay out original Blender food renders and confirmed dish names for the public gallery board.
import sharp from 'sharp';
import {readFile} from 'node:fs/promises';
import {join} from 'node:path';
const [work]=process.argv.slice(2),W=1024,H=680;
const image=async name=>'data:image/png;base64,'+(await readFile(join(work,name+'.png'))).toString('base64');
const shadow='#36251d',wine='#8f4936',wood='#765039',ivory='#f1e5ce';
const labels=[['차돌마라탕면','Mala Beef Noodle Soup'],['차알 볶음밥',"Cha’R Fried Rice"],['깐풍마늘가지새우','Spicy Eggplant Shrimp'],['차알 짜장면','Black Bean Sauce Noodle'],['마파두부밥','Mapo Tofu &amp; Rice'],['차우멘','Chow Mein']];
let print='<rect width="1024" height="680" fill="'+ivory+'"/><rect width="512" height="680" fill="'+wood+'"/>';
for(let i=0;i<50;i++){const y=i*14+Math.sin(i)*4;print+='<path fill="none" stroke="'+(i%3===0?'#392a22':'#a17955')+'" opacity="'+(.19+i%3*.07)+'" stroke-width="'+(i%5+1)+'" d="M0 '+y+' Q 225 '+(y-6+i%12)+' 512 '+(y+Math.cos(i)*6)+'"/>';}
for(const [i,[key,x,y,w,h]] of [['mala',10,25,292,231],['rice',243,185,252,214],['eggplant',40,382,301,235]].entries()){
  print+='<image x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" href="'+await image(key)+'"/>';
  print+='<text x="'+(x+w/2)+'" y="'+(y+h+6)+'" text-anchor="middle" font-size="16" fill="#f9edd5">'+labels[i][0]+'</text>';
}
print+='<path d="M512 0v680" stroke="#a08165" stroke-width="4"/><text x="768" y="92" text-anchor="middle" font-family="Georgia,serif" font-size="56" font-style="italic" fill="'+wine+'">Cha’R</text>';
for(const [n,[ko,en]] of labels.entries()){
  const y=168+n*86,itemColor=n%2===0?'#503e30':shadow;
  print+='<text x="565" y="'+y+'" font-size="28" font-weight="bold" fill="'+itemColor+'">'+ko+'</text><text x="566" y="'+(y+27)+'" font-size="18" fill="#735c49">'+en+'</text>';
  if(n<5)print+='<path d="M565 '+(y+43)+'h388" stroke="#b99570" stroke-width="1"/>';
}
print+='<path d="M560 116h410M560 632h410" stroke="'+wine+'" stroke-width="2"/>';
const svg='<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="'+W+'" height="'+H+'" font-family="Apple SD Gothic Neo,Noto Sans CJK KR,sans-serif">'+print.replaceAll(' href=',' xlink:href=')+'</svg>';
await sharp(Buffer.from(svg)).png().toFile(join(work,'menu.png'));
