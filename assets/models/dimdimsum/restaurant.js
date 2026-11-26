import {boxSilhouette} from '../interior-architecture/box-silhouette.js';
import {placeSingleDetail} from '../interior-architecture/single-detail.js';

const banks=[.95,-6.12,5.55], rows=[2.62,4.38,6.14];
let proxies;
function silhouettes(T){
  if(proxies)return proxies;
  const welcome=[[-3.12,.03,.66,1.81,1.0,.78,0x383934],[-1.91,.13,.65,.58,.76,.60,0xae805a],
    [-3.07,1.07,.48,.35,.23,.065,0x353734],[-4.5,.48,.485,.60,.78,.045,0xe1d3b9],
    [2.9,.62,.7,.41,.48,.34,0xe0d1b5]];
  for(const x of [4.45,5.10,5.75])welcome.push([x,.425,.65,.47,.07,.43,0xae805a],[x,.48,.83,.44,.31,.06,0xaa7e55]);
  const dining=[[-.6,.045,8.57,10.46,1.02,.26,0x4b4c46],[-.6,2.17,8.51,10.48,.87,.18,0xc3cdc0],
    [-.60,3.01,8.49,10.48,.29,.17,0x333633],[2.20,1.02,4.63,.06,.40,5.28,0xbec7b9]];
  for(const [x,sign] of [[1.91,1],[-7.06,-1],[6.50,1]]){
    dining.push([x,.045,4.63,.66,.38,5.27,0x825d40],[x,.42,4.63,.68,.11,5.27,0xb0925f],
      [x+sign*.26,.52,4.63,.17,.42,5.26,0xb07e51]);
  }
  for(const [x,d] of [[-2.8,2.85],[-2.8,5.95],[4.24,4.86]])dining.push([x,2.25,d,.52,.35,.52,0xb69466]);
  const table=[[0,.035,0,.62,.035,.52,0x343635],[0,.065,0,.13,.65,.14,0x434640],
    [0,.72,0,1.24,.07,.82,0xaf8259]];
  for(const d of [-.239,.239]) table.push([-.889,.42,d,.41,.06,.37,0x303330],[-1.10,.48,d,.051,.29,.33,0x655340]);
  const meal=[[-.206,.013,-.025,.265,.069,.265,0xc0935d],[.067,.013,.157,.253,.070,.253,0xc0935d],
    [.106,.013,-.142,.245,.067,.245,0xc0935d]];
  const pig=[[-.028,.013,-.03,.331,.065,.331,0xc0935d],[-.028,.079,-.03,.21,.051,.19,0xefe4cd],
    [.252,.016,.112,.28,.05,.28,0xb89a6f]];
  proxies={welcome:boxSilhouette(T,welcome),dining:boxSilhouette(T,dining),table:boxSilhouette(T,table),
    steamers:boxSilhouette(T,meal),piggy:boxSilhouette(T,pig),paint:new T.MeshLambertMaterial({vertexColors:true})};
  return proxies;
}

export function dimDimsum(K,{P,RECT,R,lbox,lwall,lsign,lzone}){
  const y=5, s=193,t=10, poly=RECT(s,t-8,s+9,t+8);
  const [ox,oz]=P(s,t),sin=Math.sin(R),cos=Math.cos(R);
  const at=(x,d)=>P(s+d,t+x);
  function publicView(x,z){
    const dx=x-ox,dz=z-oz,localX=dx*cos-dz*sin,depth=dx*sin+dz*cos;
    if(depth>9.06)return false;
    if(depth>1.18)return Math.abs(localX)<8.05;
    return depth>=-13 && Math.abs(localX)<=8.05+(1.18-depth)*2.5;
  }
  for(const side of [-8,8]) lwall(s,t+side,s+9,t+side,y,y+3.44,{mat:0x958778,thick:.11});
  lwall(s+9,t-8,s+9,t+8,y,y+3.44,{mat:0x8b8579,thick:.12});
  K.hpoly({tex:'tile',color:0xb4a998},poly,y+.025,true,null,R);
  K.hpoly(0x474641,poly,y+3.45,false);
  // Public waiting area sits in front of the dining room glazing. Keep its full-width gallery approach.
  for(const [from,to] of [[-7.98,-1.48],[.88,7.98]]){
    lwall(s+1.12,t+from,s+1.12,t+to,y,y+2.65,{mat:'glass',thick:.021});
    for(const level of [.08,.98,2.61])
      lbox(s+1.12,t+(from+to)/2,.065,to-from,y+level,.045,0x373b37,{solid:false});
    const count=Math.ceil((to-from)/1.48);
    for(let i=0;i<=count;i++)
      lbox(s+1.12,t+from+(to-from)*i/count,.076,.048,y,2.67,0x373b37,{solid:false});
  }
  lbox(s+1.12,t,.22,16,y+2.66,.47,0x373935,{solid:false});
  lsign('點點心   DIMDIMSUM',s+1.002,t-.42,y+2.90,3.80,.31,'N',{bg:null,fg:'#efe3c2',pxPerM:210});
  lsign('딤딤섬',s+.254,t-3.12,y+.71,.86,.23,'N',{bg:null,fg:'#f1e6c9',pxPerM:230});
  lsign('點心廚房',s+8.387,t-.60,y+3.15,1.19,.21,'N',{bg:null,fg:'#e8d9b4',pxPerM:190});
  lzone(s,t-8,s+9,t+8,{name:'딤딤섬',floor:'1M',place:'famille',sub:'파미에스테이션 중층',y0:y,y1:y+3.5,priority:12});
  const contact=(x,d,w,depth,h)=>K.prism(RECT(s+d-depth/2,t+x-w/2,s+d+depth/2,t+x+w/2),y,y+h,
    {side:false,top:false,bottom:false,walkTop:false});
  contact(-3.12,.66,1.79,.76,1.04);contact(-1.91,.65,.57,.59,.89);contact(-4.50,.5,.58,.45,1.23);
  contact(2.90,.70,.53,.48,.99);
  for(const x of [4.45,5.10,5.75])contact(x,.65,.45,.41,.79);
  for(const x of [1.91,-7.06,6.50])contact(x,4.63,.66,5.27,.95);
  contact(-.60,8.5,10.47,.47,1.09);
  for(const x of banks)for(const d of rows){
    const side=x<0?-1:1;
    contact(x,d,1.23,.81,.79);
    for(const dd of [-.239,.239])contact(x-.89*side,d+dd,.40,.37,.78);
  }
  K.detail({name:'딤딤섬',floor:'1M',poly,y0:y,y1:y+3.5,
    visibleFrom:(px,py,pz)=>py>=y-.19 && py<y+3.50 && publicView(px,pz)},()=>{
    const f=silhouettes(K.THREE);
    const closeVisibleFrom=c=>publicView(c.x,c.z);
    function place(name,file,x,d,h,rotation,range,exitRange,eyeHeight){
      const [xx,zz]=at(x,d);
      placeSingleDetail(K,{name:'딤딤섬 · '+name,file:'../dimdimsum/'+file+'.glb',at:[xx,y+h,zz],
        angle:R+rotation,fallback:f[file],material:f.paint,fallbackMaterial:f.paint,
        range,exitRange,eyeHeight,closeVisibleFrom,floorTolerance:2.4});
    }
    place('대기 접수대와 유아의자','welcome',0,0,0,0,14,17,1.5);
    place('유리블록과 대나무 조명','dining',0,0,0,0,15,18,1.52);
    for(const x of banks)for(const d of rows){
      const rotation=x<0?Math.PI:0;
      place('목제 식탁과 곡목 의자','table',x,d,0,rotation,9.0,11.4,1.05);
    }
    for(const [x,d,file,name] of [
      [.95,2.62,'steamers','찜기 세 가지와 차'],[-6.12,6.14,'steamers','찜기 세 가지와 차'],
      [.95,4.38,'piggy','피기 커스터드 번'],[5.55,6.14,'piggy','피기 커스터드 번']]){
      place(name,file,x,d,.790,x<0?Math.PI:0,4.0,5.7,.16);
    }
  });
}
