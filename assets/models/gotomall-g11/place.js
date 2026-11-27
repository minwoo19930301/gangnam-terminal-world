import {boxSilhouette} from '../interior-architecture/box-silhouette.js';
import {placeSingleDetail} from '../interior-architecture/single-detail.js';
import {silhouette} from './silhouette.js';

export function placeG11Door(K, at, angle) {
  const T = K.THREE;
  for (const [name,file] of [['G11 · 문틀과 당김봉','frame'],['G11 · 유리문과 고정창','glass']]) {
    const material = new T.MeshLambertMaterial(file === 'glass'
      ? {vertexColors:true,transparent:true,opacity:.22,depthWrite:false}
      : {vertexColors:true});
    placeSingleDetail(K,{name,file:'../gotomall-g11/'+file+'.glb',at,angle,
      fallback:boxSilhouette(T,silhouette[name]),fallbackMaterial:material,material,
      range:25,exitRange:32,eyeHeight:1.6,floorTolerance:3.2});
  }
}
