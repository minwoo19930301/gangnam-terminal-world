import {placeSingleDetail} from '../interior-architecture/single-detail.js';

export function placeDesserts(K, x, y, z, angle) {
  const T=K.THREE;
  return placeSingleDetail(K,{
    name:'파티세리 · 플랑과 마카롱',file:'../patisserie/desserts.glb',at:[x,y,z],angle,
    fallback:new T.BoxGeometry(1.5,.018,.35).translate(0,.009,0),
    fallbackMaterial:new T.MeshLambertMaterial({color:0xe5d3b5}),
    material:new T.MeshLambertMaterial({vertexColors:true}),
    range:12,exitRange:15,floorTolerance:2.7,
  });
}
