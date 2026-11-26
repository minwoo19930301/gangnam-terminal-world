import {placeSingleDetail} from '../interior-architecture/single-detail.js';
import {distantGeometry} from '../gyeongbu/mesh-proxy.js';
import * as silhouette from './proxy.js';

let geometry;
export function placeSuitingAisle(K,x,y,z,angle){
  const T=K.THREE;
  geometry??=distantGeometry(T,silhouette);
  const focus=[[-2.22,.27,-3.12,-1.09,2.74,2.88],[1.10,.24,-3.10,2.24,2.75,2.92]];
  return placeSingleDetail(K,{name:'경부선 7층 · 이단 신사복 행거와 소매 상품표',file:'../gyeongbu-suiting-aisle/suiting-aisle.glb',
    at:[x,y,z],angle,fallback:geometry,fallbackMaterial:new T.MeshLambertMaterial({vertexColors:true}),
    range:16,exitRange:22,eyeHeight:1.6,floorTolerance:2.0,
    viewBounds:focus.map(box=>new T.Box3(new T.Vector3(...box.slice(0,3)),new T.Vector3(...box.slice(3))))});
}
