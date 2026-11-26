import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {placeSingleDetail} from '../interior-architecture/single-detail.js';

function distantBooth(T) {
  const parts=[];
  function box(x,y,z,w,h,d,color,slope=0){
    const g=new T.BoxGeometry(w,h,d);
    g.rotateX(slope);
    g.translate(x,y,z);
    const tint=new T.Color(color), colors=new Float32Array(g.attributes.position.count*3);
    for(let i=0;i<colors.length;i+=3)tint.toArray(colors,i);
    g.setAttribute('color',new T.BufferAttribute(colors,3));
    parts.push(g);
  }
  box(0,.46,0,3.60,.86,.96,0xe2d5bb);
  box(0,2.61,0,3.64,.045,1.12,0x99bbde,.46);
  box(0,2.35,.51,3.64,.10,.016,0x526eaa);
  box(0,2.48,.54,.91,.44,.03,0x264b93);
  for(const x of [-1.74,1.74])box(x,1.57,.395,.045,1.45,.045,0x666a67);
  for(let i=0;i<8;i++)box(-1.45+i*.41,.99,.09,.27,.18,.28,[0xe96d53,0xe9bf50,0x89ae94][i%3]);
  const result=mergeGeometries(parts);
  for(const p of parts)p.dispose();
  return result;
}

export function registerProvence(F,u,y,v,visibleFrom){
  const {K}=F,T=K.THREE;
  const name='모던하우스 · 마르셰 프로방스';
  const [x,z]=F.P(u,v),poly=F.Q(u-1.83,v-.54,u+1.83,v+.54);
  F.B(u,y,v,3.60,.89,.96,0xe2d5bb,{skip:['top','bottom','n','s','e','w']});
  K.detail({name,floor:'4F',poly,y0:y,y1:y+2.88,visibleFrom},()=>{
    const material=new T.MeshPhongMaterial({vertexColors:true,specular:0x23221f,shininess:22,side:T.DoubleSide});
    return placeSingleDetail(K,{name,file:'../modernhouse-provence/provence.glb',at:[x,y,z],angle:F.angle,
      fallback:distantBooth(T),fallbackMaterial:material,material,range:12,exitRange:15,floorTolerance:2.7,eyeHeight:1.35});
  });
}
