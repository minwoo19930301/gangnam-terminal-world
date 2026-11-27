import {boxSilhouette} from '../interior-architecture/box-silhouette.js';
import {placeSingleDetail} from '../interior-architecture/single-detail.js';

export function homewearRail(K,at,angle){
  const parts=[[0,.02,0,2.42,.09,.64,0xdddeda],[0,1.84,.18,2.39,.28,.04,0x087775],
    [-.59,.18,.04,1.2,1.47,.07,0xedede5],[.60,1.66,-.02,1.15,.055,.055,0xdddeda]];
  for(const x of [-1.15,.08,1.15])parts.push([x,.11,.12,.045,1.62,.06,0xdddeda]);
  for(const x of [-.90,-.32])parts.push([x,.36,-.06,.46,1.11,.05,0xaac4d7]);
  for(let i=0;i<11;i++)parts.push([.15+i*.092,.52,-.04,.06,1.02,.4,
    i<3?0xaac4d7:i<7?0xcfc3ae:i<10?0x252a35:0xd3afb6]);
  const material=new K.THREE.MeshLambertMaterial({vertexColors:true,side:K.THREE.DoubleSide});
  const [x,,z]=at;
  return placeSingleDetail(K,{name:'다이소 · 홈웨어 옷걸이와 잠옷 견본',file:'../daiso-homewear/homewear.glb',
    at,angle,fallback:boxSilhouette(K.THREE,parts),fallbackMaterial:material,material,range:6.3,
    exitRange:8,eyeHeight:1.15,floorTolerance:2.2,
    closeVisibleFrom:p=>(p.x-x)*Math.sin(angle)+(p.z-z)*Math.cos(angle)<.10});
}
