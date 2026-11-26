import {placeSingleDetail} from '../interior-architecture/single-detail.js';

export function placePlantedColumn(K,x,z,angle){
  const T=K.THREE;
  const fallback=new T.BoxGeometry(.58,3.75,.90).translate(0,1.875,0);
  return placeSingleDetail(K,{
    name:'경부선 대합실 · 식물 기둥',file:'../gyeongbu-planted-columns/planted-column.glb',
    at:[x,0,z],angle,fallback,fallbackMaterial:new T.MeshLambertMaterial({color:0x4b6947}),
    range:13,exitRange:17,eyeHeight:1.6,floorTolerance:2.4
  });
}
