// Original woodland wall artwork inspired by the shop photograph.
import sharp from 'sharp';
let seed=277;
const rnd=()=>((seed=(1664525*seed+1013904223)>>>0)/4294967296);
const ink=[];
function path(d,fill,stroke='none',width=1){ink.push('<path d="'+d+'" fill="'+fill+'" stroke="'+stroke+'" stroke-width="'+width+'"/>');}
for(let i=0;i<7;i++){
  let d='M0 '+(171+i*16);
  for(let j=0;j<13;j++)d+=' Q'+(j*72-10)+' '+(134+i*17+rnd()*21)+' '+(j*72+35)+' '+(166+i*15+rnd()*17);
  path(d+' L960 390H0Z',['#aaa38a','#aaa68b','#b2ac92','#a1a18a','#b2a68d','#a69f87','#a7a28b'][i]);
}
function branch(x,y,angle,len,radius,depth){
 const dx=Math.cos(angle)*len,dy=Math.sin(angle)*len,nx=-Math.sin(angle)*radius,ny=Math.cos(angle)*radius;
 const tx=x+dx,ty=y+dy, bend=(rnd()-.5)*len*.27;
 path('M'+(x+nx)+' '+(y+ny)+' Q'+(x+dx*.45+bend+nx*.7)+' '+(y+dy*.45+ny)+' '+(tx+nx*.45)+' '+(ty+ny*.45)+' L'+(tx-nx*.5)+' '+(ty-ny*.5)+' Q'+(x+dx*.45+bend-nx*.6)+' '+(y+dy*.5-ny*.7)+' '+(x-nx)+' '+(y-ny)+'Z',depth>2?'#765c44':'#69664e');
 if(depth>2)path('M'+(x+nx*.28)+' '+(y+ny*.28)+' Q'+(x+dx*.46+bend)+' '+(y+dy*.5)+' '+tx+' '+ty,'none','#ba9670',radius*.18);
 if(depth<=2)for(let i=0;i<20;i++){
  const f=rnd(),sx=x+f*dx+(rnd()-.5)*52,sy=y+f*dy+(rnd()-.5)*37,rx=2+rnd()*4,ry=4+rnd()*6,rot=rnd()*140-70;
  ink.push('<ellipse cx="'+sx+'" cy="'+sy+'" rx="'+rx+'" ry="'+ry+'" transform="rotate('+rot+' '+sx+' '+sy+')" fill="'+['#464e3e','#65715a','#545e4e','#758068','#89917a','#636c59'][i%6]+'"/>');
 }
 if(depth>0){branch(tx,ty,angle-.30-rnd()*.55,len*(.62+rnd()*.15),radius*.61,depth-1);branch(tx,ty,angle+.29+rnd()*.55,len*(.63+rnd()*.17),radius*.64,depth-1);}
}
for(const [x,y,h,a] of [[65,389,152,-1.29],[352,378,152,-1.83],[624,395,152,-1.34],[916,397,164,-1.76]])branch(x,y,a,h,13,5);
for(let i=0;i<1500;i++){const x=rnd()*960,y=rnd()*384;ink.push('<circle cx="'+x+'" cy="'+y+'" r=".75" fill="#c7ba9e" opacity=".26"/>');}
const svg='<svg xmlns="http://www.w3.org/2000/svg" width="960" height="384"><rect width="960" height="384" fill="#c4b9a0"/>'+ink.join('')+'<rect x="0" y="368" width="20" height="16" fill="white"/></svg>';
await sharp(Buffer.from(svg)).jpeg({quality:87}).toFile(new URL('./garden.jpg',import.meta.url).pathname);
