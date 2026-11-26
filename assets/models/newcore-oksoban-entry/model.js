import {boxSilhouette} from '../interior-architecture/box-silhouette.js';
import {placeSingleDetail} from '../interior-architecture/single-detail.js';

export function oksobanReception(F,u,y,front,depth,width) {
  const {K}=F,T=K.THREE,[x,z]=F.P(u,front);
  const fallback=boxSilhouette(T,[[0,2.98,-.45,7.8,.3,1.28,0x34332f],
    [-1.26,0,-.1,1.8,3,.34,0xbc594c],[-1.26,1.63,.1,1.19,1.15,.1,0x282826],
    [2.7,0,-.79,1.18,1.05,.6,0x383531]]);
  const material=new T.MeshLambertMaterial({vertexColors:true,side:T.DoubleSide});
  material.onBeforeCompile=shader=>{
    shader.fragmentShader=shader.fragmentShader.replace('#include <emissivemap_fragment>',
      '#include <emissivemap_fragment>\n totalEmissiveRadiance += vColor.rgb * (.50 * smoothstep(.84,.97,vColor.b) * smoothstep(.85,.97,vColor.g));');
  };
  placeSingleDetail(K,{name:'뉴코아 1관 5층 · 옥소반 안내 데스크',file:'../newcore-oksoban-entry/front.glb',
    at:[x,y,z],angle:F.angle,fallback,material,fallbackMaterial:material,range:16,exitRange:20,
    floorTolerance:2.9,eyeHeight:1.65,closeVisibleFrom:p=>
      (p.x-x)*Math.sin(F.angle)+(p.z-z)*Math.cos(F.angle)>-.6});
  for(const [dx,dd,w,d,h] of [[-1.26,-.1,1.8,.34,3],[2.7,-.79,1.18,.6,1.05],[-3.02,-.38,1.66,.09,1.51]]) {
    K.phys.addWall(...F.P(u+dx-w/2,front+dd),...F.P(u+dx+w/2,front+dd),y,y+h,d);
  }
  K.zone({name:'옥소반',sub:'뉴코아 강남점 1관 · 전문식당가',floor:'5F',
    poly:F.Q(u-width/2+.15,front-depth+.15,u+width/2-.15,front-.08),y0:y-.12,y1:y+3.45,priority:5});
  const [ax,az]=F.P(u+.65,front+3.25);
  K.spawn({name:'옥소반 뉴코아강남점 1관 입구',place:'newcore',floor:'5F',mapDestination:true,
    aliases:['옥소반','옥소반 더프레쉬','뉴코아 1관 샤브샤브','OKSOBAN'],x:ax,y:y-.034,z:az,yaw:F.angle});
}
