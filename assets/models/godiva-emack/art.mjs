import {chromium} from 'playwright';
import {writeFile} from 'node:fs/promises';
const browser=await chromium.launch({headless:true});
try{
 const page=await browser.newPage();const png=await page.evaluate(()=>{
  const c=document.createElement('canvas');c.width=768;c.height=512;const g=c.getContext('2d');
  let seed=1975;const rand=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
  const rect=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(x,y,w,h)};
  function txt(str,x,y,size,ink,font='Georgia,serif'){g.fillStyle=ink;g.font=size+'px '+font;g.textAlign='center';g.fillText(str,x,y)}
  function oval(x,y,rx,ry,rot,color){g.fillStyle=color;g.beginPath();g.ellipse(x,y,rx,ry,rot,0,Math.PI*2);g.fill()}
  function fan(x,y,w,h,color){g.fillStyle=color;g.beginPath();g.moveTo(x,y+h);g.lineTo(x-w*.50,y+h*.12);g.quadraticCurveTo(x,y-h*.12,x+w*.50,y+h*.12);g.closePath();g.fill()}
  rect(0,0,768,512,'white');
  rect(0,0,374,99,'#302c28');txt("emack & bolio’s",187,57,41,'#fff4d7');txt('est. 1975',187,84,21,'#f6edd7');
  rect(383,0,380,99,'#302a25');txt('G O D I V A',574,45,35,'#fff8df','Optima, sans-serif');txt('C R Ê P E',574,80,31,'#fff8df','Optima, sans-serif');
  rect(0,108,259,124,'#302c31');rect(1,108,257,9,'#a8cbb8');rect(1,119,257,1.8,'#ba965f');
  // The mint fan, small wordmark, separate CRÊPE letters and point match the branch sleeve.
  g.beginPath();g.moveTo(99,158);g.quadraticCurveTo(132,150,161,158);g.lineTo(152,177);g.lineTo(108,177);g.closePath();g.fillStyle='#adccbb';g.fill();
  txt('G O D I V A',130,171,8,'#38363b','Arial');txt('C R Ê P E',130,190,13,'#b1d5c2','Arial');fan(130,194,21,13,'#adcfbd');
  // Small, original illustrated card, with the same mint strip and two rows of products as the local menu.
  rect(272,108,352,124,'#40383b');rect(274,111,41,118,'#a2b9a7');fan(294,122,27,21,'#f1e8cd');txt('CRÊPE',293,152,8,'#f6f3df');
  txt('CRÊPE',471,124,12,'#f6eed9');for(let j=0;j<2;j++)for(let i=0;i<4;i++){
   const x=320+i*74,y=131+j*47;rect(x,y,70,42,'#eee6ce');
   if(i===1){oval(x+28,y+15,8,10,0,j?'#b6a086':'#5d3934');rect(x+20,y+15,16,15,'#8b6960')}
   else{fan(x+33,y+8,32,25,['#c09256','#ad8755','#855a41','#835649'][(i+j)%4]);for(let n=0;n<3;n++)oval(x+26+n*7,y+14+n%2*3,3,2.8,.3,i%2?'#ede3c3':'#70503b')}
  }
  rect(630,108,133,124,'#e5dbc2');txt('E & B',697,159,29,'#5b594e','Apple Chancery,serif');txt('est. 1975',697,181,13,'#564e45');
  rect(0,245,262,123,'#242622');for(let i=0;i<62;i++){let x=rand()*257,y=247+rand()*116;g.beginPath();g.moveTo(x,y);
   for(let k=0;k<6;k++){x+=rand()*8;y+=(rand()-.57)*10;g.lineTo(Math.min(260,x),Math.max(246,Math.min(366,y)))}g.strokeStyle=i%4?'#3c3d39':'#88847a';g.lineWidth=i%4?.7:1.4;g.stroke()}
  rect(270,245,224,123,'#86563f');for(let i=0;i<2200;i++){oval(273+rand()*218,247+rand()*116,rand()*1.8+.3,rand()*1.2+.25,rand()*2,['#9b694c','#75462f','#a27555','#80533d'][i%4])}
  rect(501,245,261,123,'#644b35');for(let j=0;j<3;j++)for(let k=0;k<11;k++){
   const x=505+k*24,y=252+j*38;for(let side of [-1,1]){g.strokeStyle='#b18a5f';g.lineWidth=1;g.beginPath();g.moveTo(x+12,y+17);g.bezierCurveTo(x+side*8,y-3,x+side*8,y+25,x+12,y+12);g.stroke()}}
  rect(0,380,304,126,'#33322f');for(let i=0;i<1300;i++){const x=rand()*300,y=382+rand()*118;rect(x,y,rand()*4+.2,.7,i%2?'#41403c':'#2d2b2a')}
  rect(312,380,283,126,'#ba8350');for(let i=0;i<800;i++)oval(314+rand()*277,383+rand()*118,1+rand()*2.5,1.1,rand()*3,i%3?'#d5a56c':'#956736');
  return c.toDataURL().split(',')[1];});await writeFile(process.argv[2],Buffer.from(png,'base64'));
}finally{await browser.close()}
