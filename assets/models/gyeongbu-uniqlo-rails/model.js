import {placeMarketDisplay} from '../gyeongbu/market-display.js';
import {storefrontVisible} from '../gyeongbu-uniqlo/model.js';

const names={parka:'경량 후드 파카',blouse:'시어서커 블라우스'};

function starter(T,style){
  const pos=[],color=[],index=[];
  function panel(points,hex){
    const first=pos.length/3,c=new T.Color(hex);
    for(const point of points){pos.push(...point);color.push(c.r,c.g,c.b);}
    index.push(first,first+1,first+2,first,first+2,first+3);
  }
  for(const h of [.14,1.012,2.05])panel([[-1.76,h,-.40],[-1.76,h,.40],[1.76,h,.40],[1.76,h,-.40]],0xb48b5e);
  const tones=style==='parka'?[0xe0e0d7,0x737774,0x546574]:[0xe5e3d8,0x414654,0xcec4aa];
  for(const [i,x] of [-1.1,0,1.1].entries()){
    panel([[x-.20,1.11,.28],[x+.20,1.11,.28],[x+.21,1.74,.28],[x-.21,1.74,.28]],tones[i]);
  }
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));
  g.setAttribute('color',new T.Float32BufferAttribute(color,3));g.setIndex(index);g.computeVertexNormals();return g;
}

export function placeUniqloRail(K,x,y,z,angle,u,v,style){
  const width=16.5-v,depth=u-56,floor=y===0?'1F':'2F';
  const targets=[[-1.71,.36],[1.71,.36],[-1.71,-.36],[1.71,-.36]].map(([w,d])=>[w+width,d+depth]);
  const subject=`경부선 유니클로 ${floor} · ${names[style]} 행거`;
  const root=placeMarketDisplay(K,{
    name:`${subject} (${u},${v})`,file:`../gyeongbu-uniqlo-rails/${style}/${style}-rail.glb`,
    at:[x,y,z],angle,range:9,exitRange:13.5,
    focus:[[-1.76,.08,-.405,1.76,2.385,.405]],
    localSight:(w,d)=>storefrontVisible(w+width,d+depth,targets),
    initialGeometry:T=>starter(T,style),silhouette:new URL(`./${style}/proxy.js`,import.meta.url)
  });
  root.userData.nativeComponents=[{subject,translation:[0,0,0]}];
  return root;
}
