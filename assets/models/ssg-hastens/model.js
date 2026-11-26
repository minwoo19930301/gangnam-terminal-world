import {boxSilhouette} from '../interior-architecture/box-silhouette.js';
import {placeSingleDetail} from '../interior-architecture/single-detail.js';

export function hastensBed(K,x,y,z,angle){
  const T=K.THREE;
  const material=new T.MeshStandardMaterial({vertexColors:true,roughness:.94,side:T.DoubleSide});
  const fallback=boxSilhouette(T,[
    [0,.13,0,1.70,.27,1.98,0x798aa4],[0,.41,0,1.70,.24,1.98,0x9caac0],
    [0,.42,1.015,1.76,.99,.125,0x6c7a94],[0,.65,0,1.70,.10,1.98,0xe9e5d8],[0,.75,-.70,1.66,.025,.42,0x788ba7],
    ...[-.41,.41].map(x=>[x,.75,.665,.71,.10,.39,0xe9e5d8]),
  ]);
  return placeSingleDetail(K,{name:'해스텐스 · 블루 체크 침대',file:'../ssg-hastens/gallery.glb',
    at:[x,y,z],angle,fallback,material,fallbackMaterial:material,range:9,exitRange:11,floorTolerance:2.05,eyeHeight:1.6});
}
