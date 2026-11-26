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

export function placeGateaux(K,x,y,z,angle) {
  const T=K.THREE;
  return placeSingleDetail(K,{
    name:'파티세리 · 홀케이크와 쁘띠 가토',file:'../patisserie/gateaux.glb',at:[x,y,z],angle,
    fallback:new T.BoxGeometry(1.91,.012,.42).translate(-.008,.006,.015),
    fallbackMaterial:new T.MeshLambertMaterial({color:0xd0b383}),
    material:new T.MeshPhongMaterial({vertexColors:true,shininess:26,specular:0x35302a,side:T.DoubleSide}),
    viewBounds:[new T.Box3(new T.Vector3(-.99,0,-.26),new T.Vector3(.98,.21,.30))],
    range:6.5,exitRange:8,floorTolerance:2.7,
  });
}
