import {chromium} from 'playwright';
import {writeFile} from 'node:fs/promises';
const browser=await chromium.launch({headless:true});
try{
 const page=await browser.newPage();
 const png=await page.evaluate(()=>{
  const c=document.createElement('canvas');c.width=768;c.height=512;
  const g=c.getContext('2d'),rect=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(x,y,w,h)};
  let seed=711;const rnd=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
  function text(s,x,y,size,col,font='Georgia,serif'){g.fillStyle=col;g.font=size+'px '+font;g.textAlign='center';g.fillText(s,x,y)}
  function line(x1,y1,x2,y2,w,col){g.strokeStyle=col;g.lineWidth=w;g.beginPath();g.moveTo(x1,y1);g.lineTo(x2,y2);g.stroke()}
  rect(0,0,768,512,'white');
  // Variegated russet stone with irregular branching calcite veins, photographed under the fridge.
  const w=395,h=196,stone=g.createImageData(w,h);
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
    const grain=Math.sin(x*.053+y*.010+2*Math.sin(y*.043))*.56+Math.sin(y*.095-x*.027)*.32+rnd()*.36;
    const v=(y*w+x)*4;stone.data.set([117+grain*30,57+grain*20,38+grain*17,255],v);
  }
  g.putImageData(stone,0,0);g.save();g.beginPath();g.rect(0,0,w,h);g.clip();
  for(let i=0;i<34;i++){
    let x=(rnd()-.2)*w*1.6,y=rnd()*h,dx=rnd()>.5?1:-1,dy=(rnd()-.5)*.85;
    for(let n=0;n<32;n++){
      const nx=x+dx*(2+rnd()*6),ny=y+dy*5+(rnd()-.5)*4;
      line(x,y,nx,ny,1.1+rnd()*1.65,'#af9482');line(x,y,nx,ny,.4+rnd(), '#f3e4ca');
      if(rnd()<.13)line(x,y,x+dx*(8+rnd()*17),y+(rnd()-.5)*21,.7,'#d9c5b1');
      x=nx;y=ny;
    }
  }g.restore();
  // Faceted peridium: a raised brown-black cell, with a narrow, darker valley.
  const iw=346,ih=190,tile=g.createImageData(iw,ih),step=9,cols=Math.ceil(iw/step)+3,rows=Math.ceil(ih/step)+3;
  const cells=Array.from({length:rows},(_,j)=>Array.from({length:cols},(_,i)=>[(i-1+.8*rnd())*step,(j-1+.8*rnd())*step,rnd()]));
  for(let y=0;y<ih;y++)for(let x=0;x<iw;x++){
    let a=1e6,b=1e6,best;
    for(let j=Math.floor(y/step);j<Math.floor(y/step)+3;j++)for(let i=Math.floor(x/step);i<Math.floor(x/step)+3;i++){
      const cell=cells[j][i],d=(x-cell[0])**2+(y-cell[1])**2;
      if(d<a){b=a;a=d;best=cell}else if(d<b)b=d;
    }
    const v=(y*iw+x)*4,k=Math.max(0,Math.min(1,(Math.sqrt(b)-Math.sqrt(a))*.65));
    const shade=17+k*(14+12*best[2]+(best[0]-x)*1.5+(best[1]-y)*1.5)+rnd()*5;
    tile.data.set([shade*1.08,shade*.98,shade*.85,255],v);
  }
  g.putImageData(tile,410,0);
  rect(0,207,195,112,'#f1ebd6');text('Tartuflanghe',98,246,24,'#4c553f','italic Georgia,serif');
  text('TARTUFO',98,270,13,'#5b5947');
  line(50,283,145,283,.8,'#9f9779');
  rect(204,207,166,112,'#f5efde');text('Tartuflanghe',287,230,16,'#4c553f','italic Georgia,serif');
  g.fillStyle='#e5c744';g.beginPath();g.moveTo(236,274);g.quadraticCurveTo(250,242,324,254);g.quadraticCurveTo(280,262,262,286);g.fill();
  g.fillStyle='#6b594a';g.beginPath();g.ellipse(294,284,14,12,-.42,0,Math.PI*2);g.fill();
  rect(380,207,172,112,'#617cc4');text('TRIFULÒT',466,247,27,'#f0e1bb','sans-serif');
  for(let j=0;j<5;j++){g.fillStyle=['#493726','#cab99f','#745339'][j%3];g.beginPath();g.arc(414+j*23,290-j%2*3,10+j%3,0,7);g.fill()}
  rect(562,207,189,112,'#dfd6bc');text('Tartuflanghe',656,250,26,'#49493b','italic Georgia,serif');
  rect(5,338,194,155,'#342a24');
  for(let j=0;j<290;j++){let x=rnd()*194;line(x,338,x+2*Math.sin(x),494,.5+rnd(),['#46342b','#594034','#372820'][j%3])}
  rect(210,339,184,151,'#acc5d5');const screen=g.createLinearGradient(0,345,0,490);screen.addColorStop(0,'#aad5fc');screen.addColorStop(1,'#477aab');g.fillStyle=screen;g.fillRect(219,345,165,124);
  g.fillStyle='#d7cab7';g.beginPath();g.ellipse(280,416,42,19,-.33,0,Math.PI*2);g.fill();
  for(let k=0;k<3;k++){g.fillStyle='#3d3228';g.beginPath();g.arc(257+k*18,411+k%2*8,8,0,7);g.fill()}
  rect(410,338,105,151,'#eeeee2');text('Tartuflanghe',462,371,13,'#505344','italic Georgia,serif');
  for(let j=0;j<4;j++)line(428,395+j*6,495-j%2*12,395+j*6,1,'#bab8a8');
  return c.toDataURL('image/png').split(',')[1];
 });await writeFile(process.argv[2],Buffer.from(png,'base64'));
}finally{await browser.close();}
