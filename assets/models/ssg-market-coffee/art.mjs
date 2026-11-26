import {chromium} from 'playwright';
import {readFile,writeFile} from 'node:fs/promises';
const finish=JSON.parse(await readFile(new URL('./finish.json',import.meta.url),'utf8'));
const browser=await chromium.launch({channel:'chromium',headless:true});
try{
 const page=await browser.newPage();
 const image=await page.evaluate(({palette,regions})=>{
   const canvas=document.createElement('canvas');canvas.width=768;canvas.height=512;
   const g=canvas.getContext('2d');
   let seed=5051;const rnd=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
   function rect(x,y,w,h,c){g.fillStyle=c;g.fillRect(x,y,w,h);}
   function line(x1,y1,x2,y2,c,w=1){g.strokeStyle=c;g.lineWidth=w;g.beginPath();g.moveTo(x1,y1);g.lineTo(x2,y2);g.stroke();}
   function text(value,x,y,size,color,font='Arial, sans-serif',weight='normal'){
     g.fillStyle=color;g.font=weight+' '+size+'px '+font;g.textAlign='center';g.textBaseline='middle';g.fillText(value,x,y);
   }
   function region([l,t,r,b],fn){
     g.save();g.beginPath();g.rect(l-1,t-1,r-l+2,b-t+2);g.clip();g.translate(l,t);fn(r-l,b-t);g.restore();
   }
   rect(0,0,768,512,'#ece7d8');
   region(regions.beans,(w,h)=>{
     rect(-1,-1,w+2,h+2,'#49382a');
     const tones=['#493126','#402d23','#654535','#765643','#815e49','#563d2b'];
     for(let row=0;row<44;row++)for(let j=-1;j<35;j++){
       const x=j*7.5+(row%2)*3.4+rnd()*4,y=13+row*5.9+rnd()*3;
       g.save();g.translate(x,y);g.rotate(rnd()*Math.PI);g.fillStyle=tones[Math.floor(rnd()*tones.length)];
       g.beginPath();g.ellipse(0,0,4.2+rnd()*1.2,2.3+rnd()*.7,0,0,2*Math.PI);g.fill();
       g.strokeStyle='#352b23';g.lineWidth=.75;g.beginPath();g.moveTo(-3.6,.3);g.bezierCurveTo(-1,-1,1,1.6,3.6,-.3);g.stroke();
       line(-2.4,-1.6,.3,-2,'rgba(240,215,169,.32)',.65);g.restore();
     }
     const shine=g.createLinearGradient(0,0,w,0);
     [[0,'rgba(245,230,200,.45)'],[.035,'rgba(245,230,200,.11)'],[.075,'rgba(45,38,28,.12)'],[.49,'rgba(71,47,28,0)'],[.75,'rgba(236,221,190,.09)'],[.89,'rgba(255,250,218,.22)'],[.91,'rgba(255,250,218,.04)'],[1,'rgba(255,250,230,.31)']].forEach(([p,c])=>shine.addColorStop(p,c));
     rect(0,0,w,h,shine);line(w*.05,4,w*.09,h*.55,'rgba(255,245,210,.58)',2.5);
   });
   region(regions.stone,(w,h)=>{
     rect(-1,-1,w+2,h+2,'#69453d');
     for(let i=0;i<3700;i++){const q=rnd();rect(rnd()*w,rnd()*h,1+rnd()*3.8,1+rnd()*1.1,q>.45?'rgba(215,177,157,.26)':'rgba(48,29,25,.48)');}
     for(let k=0;k<19;k++){let x=rnd()*w,y=rnd()*h;for(let n=0;n<19;n++){
       const dx=2+rnd()*6,dy=-2.8+rnd()*6;line(x,y,x+dx,y+dy,'rgba(225,205,185,.72)',.3+rnd()*1.6);
       if(rnd()<.21)line(x,y,x+dx+5,y+dy-5,'rgba(209,184,159,.54)',.7);x+=dx;y+=dy;
     }}
   });
   region(regions.wood,(w,h)=>{
     rect(-1,-1,w+2,h+2,'#5b4231');
     for(let i=0;i<320;i++){let y=rnd()*h;g.strokeStyle=rnd()>.5?'rgba(44,27,22,.28)':'rgba(178,125,80,.18)';
       g.lineWidth=.4+rnd()*1.4;g.beginPath();g.moveTo(0,y);g.bezierCurveTo(w*.3,y-3,w*.68,y+5,w,y+(rnd()-.5)*4);g.stroke();}
   });
   const labelColors=['#ac7057','#a68b67','#a05249','#b19a82','#9d644e','#b88464'];
   for(let i=0;i<6;i++)region([208+i*93,145,298+i*93,256],(w,h)=>{
     rect(-1,-1,w+2,h+2,'#f2eee2');rect(w*.20,12,w*.61,h-27,labelColors[i]);
     text(i===0?'MARKET LANE':'WHOLE BEAN',w/2,31,7.7,'#fff4df','Arial, sans-serif','bold');text('COFFEE',w/2,41,7,'#fff4df');
     line(w*.32,51,w*.68,51,'#e9d4b7',1);
     const caption=['San Antonio','Coffee','Whole Bean','Coffee','Whole Bean','Coffee'][i];
     text(caption,w/2,65,8,'#fdf5e6','Georgia, serif');text(i===0?'DECAF':'COFFEE',w/2,76,5.2,'#f9ead4');
     line(8,4,w-8,4,'#cfc7b5',1);
   });
   region(regions.heading,(w,h)=>{rect(-1,-1,w+2,h+2,'#4c392e');text('WHOLE BEAN COFFEE',w/2,h*.53,34,'#f4ead9','Arial, sans-serif','bold');});
   region(regions.hopperTag,(w,h)=>{rect(-1,-1,w+2,h+2,'#bd9a58');rect(4,4,w-8,h-8,'#683e40');
     text('WHOLE BEAN',w/2,h*.44,16,'#f4e3bb','Arial, sans-serif','bold');text('COFFEE',w/2,h*.73,10,'#ede1c5');});
   region(regions.drip,(w,h)=>{rect(-1,-1,w+2,h+2,'#855f59');
     for(let i=0;i<10;i++){let x=rnd()*w,y=rnd()*h;g.strokeStyle='#c9b5a0';g.lineWidth=1.2;g.beginPath();g.moveTo(x,y);g.bezierCurveTo(x+12,y-20,x+28,y+8,x+28,y-10);g.stroke();}
     text('Market Lane',w/2,h*.42,19,'#eee7d7','Georgia, serif');text('AYLA  ·  DRIP BAGS',w/2,h*.70,10,'#e5d6c8');});
   region(regions.price,(w,h)=>{rect(-1,-1,w+2,h+2,'#e8e1cd');rect(10,8,w-20,h-16,'#45413a');
     text('WHOLE BEAN',w/2,h*.35,17,'#f2ebdb','Arial, sans-serif','bold');text('원두 · 커피',w/2,h*.69,19,'#ebe4d4');});
   region(regions.dial,(w,h)=>{
     const patch=g.createImageData(w,h);
     const shine=(a,centre,width)=>Math.exp(-Math.pow(Math.atan2(Math.sin(a-centre),Math.cos(a-centre))/width,2));
     for(let y=0;y<h;y++)for(let x=0;x<w;x++){
       const px=2*x/w-1,py=2*y/h-1,r=Math.hypot(px,py),a=Math.atan2(py,px);
       const ring=.20*Math.exp(-Math.pow((r-.85)/.07,2))-.22*Math.exp(-Math.pow((r-.53)/.06,2));
       const t=Math.max(0,Math.min(1,.43+ring+.38*shine(a,-1.95-r*.22,.39)+.24*shine(a,.7,.31)-.34*shine(a,-.31,.55)+.10*Math.cos(a+2*r)));
       const i=(y*w+x)*4;patch.data.set([76+177*t,47+192*t,16+168*t,255],i);
     }
     // putImageData ignores the context transform.
     g.putImageData(patch,regions.dial[0],regions.dial[1]);
   });
   region(regions.bronze,(w,h)=>{
     const glare=g.createLinearGradient(0,h*.75,w,h*.27);
     [[0,'#8f682f'],[.13,'#bd944d'],[.29,'#eed596'],[.41,'#b38c42'],[.52,'#8c652b'],[.74,'#e2bd6f'],[.88,'#f1d699'],[1,'#a37938']].forEach(([p,c])=>glare.addColorStop(p,c));
     rect(-1,-1,w+2,h+2,glare);
   });
   Object.values(palette).forEach((c,i)=>rect(4+i*27,477,25,29,'#'+c));
   return canvas.toDataURL().split(',')[1];
 },finish);
 await writeFile(process.argv[2],Buffer.from(image,'base64'));
}finally{await browser.close();}
