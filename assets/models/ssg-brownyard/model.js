import {mountRetailDisplay} from '../../../js/places/shinsegae-retail-display.js';
import {relief} from '../../../js/banpo_relief.js';

const source=new URL('./gallery.glb',import.meta.url);
const batches=['BrownyardOak','BrownyardCloth','BrownyardDisplay','BrownyardGlass','BrownyardLight'];

// Standing fixtures, in the same shop coordinates as the native display.
// The centre aisle stays open between the two independent A-frame rails.
const standing=[
  [0,-2.31,2,.52,.92],[-2.71,-.09,.67,5.58,2.81],[2.12,-2.72,1.45,.36,.47],
  [-.99,-.44,.68,2.05,1.88],[.90,-.44,.68,2.05,1.88],[2.44,-.14,.68,2.05,1.88],
  [-.14,1.83,2.16,.93,1.10],[2.64,2.77,.83,.10,2.55]
];

export function registerBrownyard(K,{poly,x,y,z,yaw}){
  const co=Math.cos(yaw),si=Math.sin(yaw);
  for(const [side,depth,w,d,h] of standing){
    K.box({x:x+side*co+depth*si,z:z-side*si+depth*co,y,w,d,h,rotY:yaw,
      mat:0xbb945e,skip:['top','bottom','n','s','e','w']});
  }
  // The rear and sides are solid. Along the open frontage the public aisle
  // also sees the racks obliquely. Heights are terrain-relative in K.detail.
  function visibleFrom(px,height,pz){
    const dx=px-x,dz=pz-z,side=dx*co-dz*si,depth=dx*si+dz*co;
    return height>=y-.15 && height<=y+3.9 && depth>=-3.20 && depth<=18 &&
      Math.abs(side)<=(depth>=5.15?13:3.34);
  }
  K.detail({visibleFrom,name:'브라운야드 · 오크 행거와 입구 진열대',floor:'8F',poly,y0:y,y1:y+3.2},()=>{
    const T=K.THREE,root=new T.Group(),fallback=new T.Group();
    root.position.set(x,y+relief(x,z),z);
    root.rotation.y=yaw;
    root.add(fallback);
    const cube=new T.BoxGeometry(),materials=new Map();
    function box(a,b,d,w,h,depth,color){
      if(!materials.has(color))materials.set(color,new T.MeshStandardMaterial({color}));
      const m=new T.Mesh(cube,materials.get(color));m.position.set(a,b+h/2,d);
      m.scale.set(w,h,depth);fallback.add(m);
    }
    box(0,.04,-3.014,6.10,3.09,.095,0xcf9f64);
    box(0,.87,-2.30,2.04,.05,.56,0xd4a46b);
    box(-2.72,.09,-.10,.60,.13,5.58,0xbe965c);
    box(-2.72,2.09,-.10,.64,.05,5.58,0xd8ab70);
    for(const a of [-.99,.90,2.44]){
      for(const d of [-1.43,.53]){
        for(const side of [-1,1])box(a+side*.20,.06,d,.05,1.77,.05,0xd5a36f);
      }
      for(let i=0;i<7;i++){
        box(a,.78,.40-i*.24,.48,.78,.07,[0xe5dfc7,0xd7cfb1,0x333b43,0xb0b7bc][i%4]);
      }
    }
    for(const h of [.17,.50,.88])box(-.14,h,1.83,2.08,.036,.84,0xe5d8ba);
    for(const a of [-1.19,.91])for(const d of [1.39,2.27])box(a,.05,d,.055,1.04,.055,0xbb8c54);
    mountRetailDisplay(K,{root,fallback,source,batches,x,y,z,nearDistance:10.8,displayDistance:22});
  });
}
