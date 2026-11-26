import {boxSilhouette} from '../interior-architecture/box-silhouette.js';
import {placeSingleDetail} from '../interior-architecture/single-detail.js';

export function placeHyodoShop(K,point,rotation,toLocal){
  const T=K.THREE,[x,z]=point(276.5,.43);
  const fallback=boxSilhouette(T,[
    [0,3.13,1.38,6.44,.10,2.94,0x262c2d],[-.73,2.44,.035,4.73,.55,.18,0x34393b],
    [1.86,.05,-.265,2.45,2.42,.08,0x805e3b],[.20,.035,-8.05,6.82,2.94,.09,0x945f4a],
  ]);
  const bounds=new T.Box3(new T.Vector3(-3.56,0,-8.15),new T.Vector3(3.58,3.24,2.90));
  fallback.boundingSphere=bounds.getBoundingSphere(new T.Sphere());
  const mat=new T.MeshLambertMaterial({vertexColors:true,side:T.DoubleSide});
  mat.onBeforeCompile=shader=>{
    shader.fragmentShader=shader.fragmentShader.replace('#include <emissivemap_fragment>',
      `#include <emissivemap_fragment>
       float signFace=smoothstep(.975,.995,vColor.g)*smoothstep(.69,.75,vColor.r)*smoothstep(.76,.84,vColor.b);
       float warmStrip=smoothstep(.98,.995,vColor.r)*smoothstep(.80,.85,vColor.g)*(1.-smoothstep(.53,.62,vColor.b));
       totalEmissiveRadiance+=vColor.rgb*(.90*signFace+.68*warmStrip);`);
  };
  placeSingleDetail(K,{name:'경부선 효도치킨 · 유리 입구와 식당',file:'../gyeongbu-hyodo/shop.glb',
    at:[x,0,z],angle:rotation+Math.PI,fallback,fallbackMaterial:mat,material:mat,
    range:40,exitRange:49,eyeHeight:1.62,floorTolerance:2.45,viewBounds:[bounds],
    closeVisibleFrom:p=>{
      const [u,v]=toLocal(p.x,p.z);
      return v<=.85 || (u>272.75&&u<280.1&&v<8.75&&(u>277.95||v>5.36));
    }});
}
