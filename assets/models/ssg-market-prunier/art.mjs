import {chromium} from 'playwright';
import {readFile,writeFile} from 'node:fs/promises';
const rings=JSON.parse(await readFile(new URL('./mark.json',import.meta.url)));
const browser=await chromium.launch({headless:true});
try{
 const page=await browser.newPage();const img=await page.evaluate(rings=>{
  const c=document.createElement('canvas');c.width=768;c.height=512;const g=c.getContext('2d');
  const rect=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(x,y,w,h)};
  const circle=(x,y,r,col)=>{g.fillStyle=col;g.beginPath();g.arc(x,y,r,0,2*Math.PI);g.fill()};
  const line=(w,col)=>{g.lineWidth=w;g.strokeStyle=col};
  function txt(s,x,y,size,col,font='Georgia,serif'){g.fillStyle=col;g.font=size+'px '+font;g.textAlign='center';g.fillText(s,x,y)}
  let seed=1872;const rand=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
  function arc(x,y,r,a,b,w,col){g.beginPath();g.arc(x,y,r,a,b);line(w,col);g.stroke()}
  function medallion(x,y,r,back,ink){
    circle(x,y,r,back);arc(x,y,r*.96,0,7,1.1,ink);g.save();g.beginPath();g.arc(x,y,r*.92,0,7);g.clip();
    for(let k=0;k<7;k++){const a=k*2.4;arc(x+r*.67*Math.cos(a),y+r*.68*Math.sin(a),r*(.48+.07*(k%3)),0,7,.8,ink)}
    for(let j=0;j<155;j++)circle(x+(rand()-.5)*r*2,y+(rand()-.5)*r*2,.45,'#326e72');g.restore();
  }
  rect(0,0,768,512,'white');
  // Digitised outline of the manufacturer's arched gold PRUNIER wordmark, paired
  // with an original drawing of the geometric sea-life medallion on the tin face.
  for(let n=0;n<3;n++){
    const x=n*177+87,y=87;circle(x,y,85,'#b49549');circle(x,y,82,['#087a78','#823b41','#35343c'][n]);arc(x,y,78,0,7,.7,['#26a095','#a96764','#7b7374'][n]);
    g.save();g.translate(x-59,y-61);g.scale(.68,.67);g.beginPath();
    for(const ring of rings){ring.forEach(([a,b],i)=>g[i?'lineTo':'moveTo'](a-72,b-62));g.closePath()}g.fillStyle='#f1cf7d';g.fill('evenodd');g.restore();
    medallion(x,y+2,32,'#217c81','#c4b98c');txt('PRUNIER MANUFACTURE',x,y+48,6.5,'#f0cc81');
    const color=['#15445a','#a63844','#302a31'][n];rect(x-21,y+52,42,19,color);txt(['OSCIÈTRE','SAINT-JAMES','TRADITION'][n],x,y+64,6,'#f7d498');
    for(const side of [-1,1]){
      g.beginPath();g.moveTo(x+side*47,y-2);g.quadraticCurveTo(x+side*60,y-10,x+side*65,y-2);g.quadraticCurveTo(x+side*57,y+8,x+side*46,y);g.lineTo(x+side*42,y+4);g.closePath();g.fillStyle='#e3bd66';g.fill()}
  }
  rect(534,0,230,172,'#b5b9a8');for(let j=0;j<7;j++)for(let i=0;i<7;i++){const x=530+i*41+(j%2)*18,y=-8+j*30;medallion(x,y,20,'#a7bfbd','#dde5d6')}
  rect(0,180,763,81,'#e3d3a7');
  // Pairs of acanthus sprays surround the central plaque in the frontal photograph.
  for(const side of [1,-1]){
    g.save();g.translate(side===1?5:759,0);g.scale(side,1);
    for(let j=0;j<3;j++){
      const ox=7+j*61,oy=240-j*3,reach=75-j*9;
      g.beginPath();g.moveTo(ox,oy);g.bezierCurveTo(ox+22,oy-2,ox+14,oy-55,ox+reach,oy-45);
      line(2.5,'#8a744c');g.stroke();g.beginPath();g.moveTo(ox+15,oy-10);g.bezierCurveTo(ox+40,oy-7,ox+43,oy-32,ox+55,oy-24);g.bezierCurveTo(ox+68,oy-12,ox+43,oy-11,ox+50,oy-20);line(1.65,'#9b845b');g.stroke();
      for(let k=0;k<6;k++){
        const x=ox+6+k*7.0,y=oy-5-k*5.8,raise=k%2?8:14;
        g.beginPath();g.moveTo(x,y);g.quadraticCurveTo(x-9,y-4,x-6,y-raise);g.quadraticCurveTo(x+2,y-10,x,y);g.fillStyle='#a28b60';g.fill();
        g.beginPath();g.moveTo(x+2,y-2);g.quadraticCurveTo(x+5,y-11,x+14,y-10);g.quadraticCurveTo(x+10,y-2,x+2,y-2);g.fillStyle='#b69e71';g.fill();
      }
    }
    g.restore();
  }
  rect(234,189,297,60,'#422e25');txt('프루니에',383,216,21,'#fff5da','Apple SD Gothic Neo, sans-serif');txt('CAVIAR | PRUNIER',383,237,12,'#f3ead6');
  rect(0,271,348,108,'#46342a');for(let i=0;i<650;i++)rect(rand()*345,273+rand()*96,.5+rand(),3+rand()*8,i%3?'#514033':'#60483b');
  rect(358,271,203,108,'#925d32');for(let k=0;k<850;k++)circle(360+rand()*195,273+rand()*99,.7+rand()*2.3,['#bc713c','#d79147','#e0a368','#914b2e'][k%4]);
  rect(573,272,190,105,'#16807b');txt('PRUNIER',668,313,16,'#e8c070');txt('ŒUFS DE TRUITE',668,337,9,'#d8bc7c');
  rect(0,389,258,115,'#343532');for(let i=0;i<300;i++)rect(rand()*250,391+rand()*108,.7+rand()*5,.6,'#4a4943');
  rect(272,389,189,115,'#897e69');for(let i=0;i<180;i++)rect(274+rand()*175,390+rand()*108,1+rand()*12,.55,'#b0a28a');
  rect(472,389,155,114,'#efe4cb');txt('PRUNIER',550,437,19,'#75664c');txt('CAVIAR',550,453,10,'#867c65');
  const mirror=g.createLinearGradient(634,0,724,0);
  mirror.addColorStop(0,'#39423e');mirror.addColorStop(.19,'#68706c');mirror.addColorStop(.31,'#434a48');mirror.addColorStop(.55,'#292f2f');mirror.addColorStop(.72,'#5e6662');mirror.addColorStop(1,'#363d3c');
  g.fillStyle=mirror;g.fillRect(634,390,90,112);
  return c.toDataURL().split(',')[1];},rings);await writeFile(process.argv[2],Buffer.from(img,'base64'));
}finally{await browser.close()}
