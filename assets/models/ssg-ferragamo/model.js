import {boxSilhouette} from '../interior-architecture/box-silhouette.js';
import {placeSingleDetail} from '../interior-architecture/single-detail.js';

export function ferragamoDisplay(K,x,y,z,angle){
  const T=K.THREE;
  const base=boxSilhouette(T,[
    [-1.80,0,-.15,2.70,2.98,.18,0xf3ecdf],[1.24,0,-.12,3.05,3,.16,0xded1be],
    [1.01,0,2.13,.64,.93,.69,0x73383c],[1.72,0,2.45,.69,.72,.69,0x73383c],
    [2.18,0,1.75,.72,1.10,.63,0x73383c]
  ]);
  const paint=new T.MeshPhongMaterial({vertexColors:true,shininess:27});
  // The branch photograph shows a lit white wall and pale shelf edges.
  // Confine the reflected shelf light to light finishes, within this one draw.
  paint.onBeforeCompile=shader=>{
    shader.fragmentShader=shader.fragmentShader.replace('#include <emissivemap_fragment>',
      `#include <emissivemap_fragment>
       float paleFinish=smoothstep(.40,.90,min(vColor.r,min(vColor.g,vColor.b)));
       totalEmissiveRadiance+=vColor.rgb*paleFinish*vec3(.21,.19,.16);`);
  };
  placeSingleDetail(K,{name:'6층 페라가모 · 가죽 가방과 구두 진열',file:'../ssg-ferragamo/display.glb',
    at:[x,y,z],angle,fallback:base,fallbackMaterial:paint,material:paint,range:12,exitRange:15,
    floorTolerance:2.2,eyeHeight:1.5,viewBounds:[new T.Box3(new T.Vector3(-3.16,0,-.25),new T.Vector3(2.78,3.01,3.05))],
    closeVisibleFrom:p=>(p.x-x)*Math.sin(angle)+(p.z-z)*Math.cos(angle)>-.10});
}
