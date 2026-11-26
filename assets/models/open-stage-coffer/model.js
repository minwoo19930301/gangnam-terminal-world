import {placeSingleDetail} from '../interior-architecture/single-detail.js';

export function placeStageCoffers(K,x,z,angle){
  const T=K.THREE;
  const proxy=new T.CylinderGeometry(.65,.65,.045,24);
  proxy.translate(0,-.0775,0);
  const material=new T.MeshLambertMaterial({vertexColors:true});
  return placeSingleDetail(K,{
    name:'오픈 스테이지 · 코퍼 몰딩',file:'../open-stage-coffer/coffer.glb',
    at:[x,6.30,z],angle,translations:[[-5.4,0,0],[0,0,0],[5.4,0,0]],
    fallback:proxy,fallbackMaterial:new T.MeshLambertMaterial({color:0xe9e6de}),material,
    viewBounds:[-5.4,0,5.4].map(t=>new T.Box3(new T.Vector3(t-2.26,-.18,-2.26),new T.Vector3(t+2.26,0,2.26))),
    eyeHeight:-4.7,floorTolerance:2.3,range:19,exitRange:23
  });
}
