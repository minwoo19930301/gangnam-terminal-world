import {boxSilhouette} from '../interior-architecture/box-silhouette.js';
import {placeSingleDetail} from '../interior-architecture/single-detail.js';

export function cakeCounter(K,name,x,y,z,angle) {
  const T=K.THREE,kitchen=name==='키친205';
  const parts=kitchen
    ? [-.69,-.24,.24,.69].map(dx=>[dx,.014,-.24,.295,.16,.235,0xdc918c])
    : [-.76,-.38,0,.38,.76].map(dx=>[dx,.014,.29,.257,.19,.226,0xf1dec7]);
  parts.push(kitchen?[.68,.46,-.25,.14,.13,.014,0xeed7b8]:[.43,.34,-.37,.54,.21,.031,0x353028]);
  const fallback=boxSilhouette(T,parts);
  const material=new T.MeshLambertMaterial({vertexColors:true,side:T.DoubleSide});
  placeSingleDetail(K,{name:'스위트 파크 · '+name+' 케이크 진열',file:'../sweet-cake-counters/'+(kitchen?'kitchen205':'shoto')+'.glb',
    at:[x,y,z],angle,fallback,material,fallbackMaterial:material,range:7,exitRange:9,floorTolerance:2.1,
    eyeHeight:.85,viewBounds:[new T.Box3(new T.Vector3(-1,0,-.59),new T.Vector3(1,.64,.49))],
    closeVisibleFrom:p=>(p.x-x)*Math.sin(angle)+(p.z-z)*Math.cos(angle)>-.15});
}
