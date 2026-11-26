import {plan} from '../cinema-rotary/layout.js';
import {boxSilhouette} from '../interior-architecture/box-silhouette.js';
import {placeSingleDetail} from '../interior-architecture/single-detail.js';

export function nespressoDisplay(K,y){
  const T=K.THREE,origin=plan(1000,798),towards=plan(1000,790);
  const angle=Math.atan2(towards[0]-origin[0],towards[1]-origin[1]);
  const material=new T.MeshLambertMaterial({vertexColors:true,side:T.DoubleSide});
  const fallback=boxSilhouette(T,[[0,2.59,-.25,5.94,.76,.14,0x272625],
    [-1.34,.02,-.86,2.85,.975,.65,0x976e50],[1.45,.16,-1.31,2.48,2.68,.23,0x392e27]]);
  placeSingleDetail(K,{name:'네스프레소 · 버츄오 시음 진열대',file:'../nespresso-gangnam/display.glb',
    at:[origin[0],y,origin[1]],angle,material,fallback,fallbackMaterial:material,range:13,exitRange:17,
    floorTolerance:2.8,eyeHeight:1.7,viewBounds:[new T.Box3(new T.Vector3(-3,0,-1.45),new T.Vector3(3,3.97,.18))]});
}
