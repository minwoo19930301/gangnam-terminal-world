import {placeSingleDetail} from '../interior-architecture/single-detail.js';

export function placeWaitingCeiling(K,x,z,angle) {
  const T=K.THREE;
  // The distant underside keeps the low silhouette without drawing 87 blades.
  const fallback=new T.BoxGeometry(12.7,.13,18).translate(0,3.91,0);
  return placeSingleDetail(K,{
    name:'경부선 대합실 좌석 · 목재 루버와 매입등',file:'../gyeongbu-waiting-ceiling/waiting-ceiling.glb',
    at:[x,0,z],angle,fallback,fallbackMaterial:new T.MeshLambertMaterial({color:0x97836f}),
    range:24,exitRange:29,eyeHeight:1.6,floorTolerance:2.7
  });
}
