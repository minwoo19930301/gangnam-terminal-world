import {placeSingleDetail} from '../interior-architecture/single-detail.js';
import {distantGeometry} from '../gyeongbu/mesh-proxy.js';
import * as proxy from './proxy.js';

let geometry;
export function placeChildrensAisle(K,x,y,z,angle){
  const T=K.THREE;
  geometry??=distantGeometry(T,proxy);
  const merchandise=[[-1.83,.53,-2.70,-1.43,2.54,2.70],[1.26,.71,-2.78,4.92,2.49,2.80]];
  return placeSingleDetail(K,{name:'경부선 6층 · 아동복 철망 진열과 접은 상품',file:'../gyeongbu-childrens-aisle/childrens-aisle.glb',
    at:[x,y,z],angle,fallback:geometry,fallbackMaterial:new T.MeshLambertMaterial({vertexColors:true}),
    range:16,exitRange:22,eyeHeight:1.6,floorTolerance:2.0,
    viewBounds:merchandise.map(b=>new T.Box3(new T.Vector3(...b.slice(0,3)),new T.Vector3(...b.slice(3))))});
}
