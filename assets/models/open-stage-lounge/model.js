import {boxSilhouette} from '../interior-architecture/box-silhouette.js';
import {placeSingleDetail} from '../interior-architecture/single-detail.js';

export function placeOpenStageLounge(K,x,z,angle){
  const T=K.THREE,parts=[];
  for(const side of [-1,1]){
    parts.push([0,.14,side*2.05,2.72,.32,.88,0xe4dfd4],
      [0,.39,side*2.39,2.45,.35,.19,0xf0ece2],
      [0,.47,side*.95,1.30,.07,.72,0xf0ebe1]);
    for(const end of [-1,1])parts.push([end*.52,.035,side*.95,.048,.44,.48,0xa9a28e]);
  }
  const mat=new T.MeshLambertMaterial({vertexColors:true});
  return placeSingleDetail(K,{name:'오픈 스테이지 · 흰 소파와 낮은 테이블',
    file:'../open-stage-lounge/lounge.glb',at:[x,0,z],angle,
    fallback:boxSilhouette(T,parts),fallbackMaterial:mat,material:mat,
    range:14,exitRange:18,eyeHeight:1.0,floorTolerance:1.95});
}
