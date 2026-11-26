import {boxSilhouette} from '../interior-architecture/box-silhouette.js';
import {placeSingleDetail} from '../interior-architecture/single-detail.js';
import {relief} from '../../../js/banpo_relief.js';

export const signalName='신반포로 · 황색 뒷덮개 보행등';

export function placePedestrianHead(K,{curb,pole:[x,z],yaw},y){
  const rim=Array.from({length:8},(_,i)=>[x+.063*Math.cos(i*Math.PI/4),z+.063*Math.sin(i*Math.PI/4)]);
  K.phys.addPolyWalls(rim,y,y+2.91,.02,'streets');
  K.detail({name:signalName,floor:'지상',poly:curb,y0:y,y1:y+3.0,visualOnly:true,silhouetteDistance:90},kit=>{
    const T=kit.THREE;
    const proxy=boxSilhouette(T,[[0,0,0,.115,2.91,.115,0x494b46],
      [0,2.21,.2,.34,.68,.21,0xd39d3e],[0,2.23,.312,.30,.64,.025,0x272b29],
      [0,2.66,.33,.08,.12,.018,0xe4473a]]);
    const paint=new T.MeshLambertMaterial({vertexColors:true});
    paint.defines={BANPO_RIGID:1};
    paint.onBeforeCompile=shader=>{
      shader.fragmentShader=shader.fragmentShader.replace('#include <emissivemap_fragment>',
        `#include <emissivemap_fragment>
        float activeRed=smoothstep(.24,.45,vColor.r)*(1.-smoothstep(.09,.15,vColor.g));
        totalEmissiveRadiance+=vColor.rgb*activeRed*1.65;`);
    };
    placeSingleDetail(kit,{name:signalName,file:'../sinbanpo-crossing/signal.glb',at:[x,y,z],angle:yaw,rigidGround:relief(x,z),
      fallback:proxy,fallbackMaterial:paint,material:paint,range:23,exitRange:31,eyeHeight:1.9,floorTolerance:4.1,
      viewBounds:[new T.Box3(new T.Vector3(-.21,0,-.1),new T.Vector3(.21,2.95,.59))]});
  });
}
