import {boxSilhouette} from '../interior-architecture/box-silhouette.js';
import {placeSingleDetail} from '../interior-architecture/single-detail.js';
import {plan} from '../cinema-rotary/layout.js';

export function gangnamCoffeebar(K,y){
  const T=K.THREE,front=plan(872.5,798),towards=plan(872.5,790);
  const yaw=Math.atan2(towards[0]-front[0],towards[1]-front[1]);
  const location=(x,d)=>[front[0]+x*Math.cos(yaw)-d*Math.sin(yaw),
    front[1]-x*Math.sin(yaw)-d*Math.cos(yaw)];
  const edges=[[842,798],[903,798],[903,839],[842,839]].map(p=>plan(...p));
  K.hpoly(0xc6bba6,edges,y+.013,true);K.phys.addSurface(edges,y);
  K.hpoly('ssg_ceil',edges,y+4.45,false);K.phys.addCeiling(edges,y+4.45,{});
  for(const [a,b] of [[1,2],[2,3],[3,0]])K.wall(...edges[a],...edges[b],y,y+4.45,{mat:0xc7b69e,thick:.12});
  K.wall(...edges[0],...edges[1],y+3.52,y+4.45,{mat:0xc5bbac,thick:.12});
  K.zone({name:'인텔리젠시아 강남 커피바',sub:'신세계 강남점 · 마켓 맞은편',floor:'B1',poly:edges,y0:y-.2,y1:y+4.45,priority:6});
  for(const [x0,x1,d,depth,h] of [[-3.55,1.20,2.00,1.02,1.09],[1.6,4.1,1.74,.5,2.38]])
    K.phys.addWall(...location(x0,d),...location(x1,d),y,y+h,depth/2);
  const material=new T.MeshLambertMaterial({vertexColors:true,side:T.DoubleSide});
  material.onBeforeCompile=shader=>{
    shader.fragmentShader=shader.fragmentShader.replace('#include <emissivemap_fragment>',`#include <emissivemap_fragment>
      float globe=smoothstep(.94,.99,vColor.r)*smoothstep(.80,.89,vColor.g)*smoothstep(.60,.68,vColor.b);
      totalEmissiveRadiance += vec3(.52,.45,.32)*globe;`);
  };
  const silhouette=boxSilhouette(T,[[0,0,-3.92,8.8,3.2,.1,0xbea485],
    [-1.17,0,-2.0,4.76,1.06,1.04,0xb4381d],[2.84,0,-1.78,2.5,2.38,.41,0xd34816],
    [0,3.36,-2.3,8.75,.11,3.65,0x947c60]]);
  placeSingleDetail(K,{name:'인텔리젠시아 강남 · 오렌지 진열장과 커피 바',file:'../intelligentsia-gangnam/coffeebar.glb',
    at:[front[0],y,front[1]],angle:yaw,fallback:silhouette,fallbackMaterial:material,material,
    range:15,exitRange:19,floorTolerance:3.2,eyeHeight:1.7,
    viewBounds:[new T.Box3(new T.Vector3(-4.45,0,-4),new T.Vector3(4.45,3.52,-.42))]});
}
