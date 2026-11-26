import {boxSilhouette} from '../interior-architecture/box-silhouette.js';
import {placeSingleDetail} from '../interior-architecture/single-detail.js';

export function placeCafeFront(F,u){
  const {K}=F,T=K.THREE,[x,z]=F.P(u,0),[insideX,insideZ]=F.P(u,1);
  const fallback=boxSilhouette(T,[[0,6.84,.34,1.52,.05,.05,0xac9a78],
    [0,7.28,.34,1.52,.05,.05,0xac9a78]]);
  const bounds=new T.Box3(new T.Vector3(-3.52,.02,.08),new T.Vector3(3.52,9.6,2.16));
  // The street view can see the glass at walking height while the raised rules are above the frame.
  fallback.boundingSphere=bounds.getBoundingSphere(new T.Sphere());
  const material=new T.MeshLambertMaterial({vertexColors:true,side:T.DoubleSide});
  placeSingleDetail(K,{name:'뉴코아 3관 · 카페 마마스 외관',file:'../newcore-mamas/front.glb',
    at:[x,0,z],angle:F.angle+Math.PI,fallback,fallbackMaterial:material,material,
    range:65,exitRange:78,floorTolerance:8,eyeHeight:1.65,
    viewBounds:[bounds],
    closeVisibleFrom:p=>(p.x-x)*(insideX-x)+(p.z-z)*(insideZ-z)<.2});
}
