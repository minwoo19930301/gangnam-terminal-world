import {boxSilhouette} from '../interior-architecture/box-silhouette.js';
import {placeSingleDetail} from '../interior-architecture/single-detail.js';
import {relief} from '../../../js/banpo_relief.js';
import {origin,point,steps,yaw} from './layout.js';

export function sportsShoeEntry(K,y) {
  const {left,right,start,tread,rise,count,landingEnd}=steps;
  const outline=(a,b,front,back)=>[point(a,front),point(b,front),point(b,back),point(a,back)];
  const mid=(left+right)/2;
  const boxes=[[-2.01,0,-.41,1.32,3.01,.19,0x92948c],[2.555,0,-.41,.35,3.01,.19,0x92948c],
    [.03,3.01,-.41,5.40,1.35,.19,0x9e9e95],[.45,3.14,-.22,4.31,.28,.16,0x252525]];
  for(let i=0;i<count;i++){
    const front=start+i*tread,top=rise*(i+1);
    K.phys.addSurface(outline(left,right,front,front+tread),y+top);
    boxes.push([mid,0,-front-tread/2,right-left,top,tread,0x999991]);
  }
  const end=start+count*tread, top=count*rise;
  K.phys.addSurface(outline(-2.57,2.61,end,landingEnd),y+top);
  boxes.push([.02,top-.11,-(end+landingEnd)/2,5.18,.11,landingEnd-end,0xa7a397]);
  for(const [a,b] of [[-2.67,left],[right,2.73]])
    K.phys.addWall(...point(a,.41),...point(b,.41),y,y+3.01,.095);
  K.phys.addWall(...point(-.80,3.65),...point(.12,3.65),y+top,y+top+1.57,.14);

  K.phys.addWall(...point(1.02,3.52),...point(2.34,3.52),y+top,y+top+.87,.24);
  const mat=new K.THREE.MeshLambertMaterial({vertexColors:true,side:K.THREE.DoubleSide});
  mat.onBeforeCompile=shader=>{
    shader.fragmentShader=shader.fragmentShader.replace('#include <emissivemap_fragment>',`#include <emissivemap_fragment>
      totalEmissiveRadiance+=smoothstep(.91,.99,min(vColor.r,vColor.g))*vColor.rgb*.62;`);
  };
  placeSingleDetail(K,{name:'스포츠 슈 전문관 · 브랜드 간판과 계단',file:'../sports-shoe-rotary/entry.glb',
    at:[origin[0],y,origin[1]],angle:yaw,rigidGround:relief(...origin),material:mat,
    fallback:boxSilhouette(K.THREE,boxes),fallbackMaterial:mat,range:20,exitRange:25,floorTolerance:3.1,eyeHeight:1.8});
}
