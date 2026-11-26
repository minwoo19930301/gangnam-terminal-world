import {boxSilhouette} from '../interior-architecture/box-silhouette.js';
import {placeSingleDetail} from '../interior-architecture/single-detail.js';

export function yucheonDining(F,u,y,front,visibleFrom){
  const {K}=F,T=K.THREE,[x,z]=F.P(u,front);
  const fallback=boxSilhouette(T,[[0,3.36,0,8.05,.13,.17,0x433c35],[0,0,-8.43,8,3.45,.07,0x40594b],
    [-2.17,.48,-.42,.65,1.25,.07,0xc7bdab],[2.93,.48,-.34,.65,1.25,.07,0xc7bdab]]);
  const material=new T.MeshLambertMaterial({vertexColors:true,side:T.DoubleSide});
  material.onBeforeCompile=shader=>{
    shader.fragmentShader=shader.fragmentShader.replace('#include <emissivemap_fragment>',
      `#include <emissivemap_fragment>
       float lamp=smoothstep(.82,.94,vColor.r)*smoothstep(.58,.67,vColor.g);
       totalEmissiveRadiance+=lamp*vColor.rgb*.40;`);
  };
  placeSingleDetail(K,{name:'뉴코아 1관 5층 · 유천냉면 입구와 식당 홀',file:'../newcore-yucheon/front.glb',
    at:[x,y,z],angle:F.angle+Math.PI,fallback,material,fallbackMaterial:material,range:17,exitRange:21,
    floorTolerance:3.3,eyeHeight:1.65,viewBounds:[new T.Box3(new T.Vector3(-4.08,0,-8.48),new T.Vector3(4.08,3.55,.10))],
    closeVisibleFrom:p=>visibleFrom(p.x,p.y,p.z)});
  K.zone({name:'유천냉면',sub:'뉴코아아울렛 강남점 1관 · 전문식당가',floor:'5F',
    poly:F.Q(u-4,front+.03,u+4,front+8.43),y0:y-.12,y1:y+3.45,priority:5});
  for(const dx of [-2.05,1.86])for(const d of [2.10,4.62]){
    K.phys.addWall(...F.P(u-dx-.52,front+d),...F.P(u-dx+.52,front+d),y,y+.8,1.38);
  }
  for(const [dx,d] of [[-2.92,.24],[-2.17,.42],[2.93,.34]]){
    K.phys.addWall(...F.P(u-dx-.32,front+d),...F.P(u-dx+.32,front+d),y,y+1.74,.13);
  }
}
