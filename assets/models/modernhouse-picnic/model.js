import {boxSilhouette} from '../interior-architecture/box-silhouette.js';
import {placeSingleDetail} from '../interior-architecture/single-detail.js';

export function registerPicnicRack(F,u,y,v,visibleFrom) {
  const {K}=F, T=K.THREE, [x,z]=F.P(u,v), angle=F.angle+Math.PI;
  const name='모던하우스 · 딸기와 데이지 러그';
  F.B(u,y,v,2.51,.81,.83,0x484c4d,{skip:['top','bottom','n','s','e','w']});
  K.detail({name,floor:'4F',poly:F.Q(u-1.26,v-.42,u+1.26,v+.42),y0:y,y1:y+2.18,visibleFrom},()=>{
    const proxy=boxSilhouette(T,[
      [0,.14,0,2.48,.04,.79,0xc39c74],[0,.77,0,2.51,.06,.82,0x484c4d],
      [-1.2,0,.32,.05,2.15,.05,0xa27a54],[1.2,0,.32,.05,2.15,.05,0xa27a54],
      [0,2.06,.19,2.4,.035,.035,0xa9adab],[.08,.82,.12,.56,1.16,.03,0xb5ce71],
      [-.72,.82,.12,.56,1.16,.03,0x88c9f4],[.82,.93,.25,.70,1.06,.035,0xe8dcc7]
    ]);
    const material=new T.MeshLambertMaterial({vertexColors:true,side:T.DoubleSide});
    return placeSingleDetail(K,{name,file:'../modernhouse-picnic/rugs.glb',at:[x,y,z],angle,
      fallback:proxy,fallbackMaterial:material,material,range:9,exitRange:11,eyeHeight:1.34,floorTolerance:2.75,
      closeVisibleFrom:p=>(p.x-x)*Math.sin(angle)+(p.z-z)*Math.cos(angle)<.2&&visibleFrom(p.x,y,p.z)});
  });
}
