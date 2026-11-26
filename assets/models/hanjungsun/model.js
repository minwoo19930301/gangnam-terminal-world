import {boxSilhouette} from '../interior-architecture/box-silhouette.js';
import {placeSingleDetail} from '../interior-architecture/single-detail.js';

export function hanjungsunIsland(K,x,y,z,angle){
  const T=K.THREE,s=Math.sin(angle),c=Math.cos(angle);
  const point=(u,d)=>[x+c*u+s*d,z-s*u+c*d];
  const p3=(u,d,h)=>{const [wx,wz]=point(u,d);return [wx,y+h,wz];};
  // Restore the original counter footprint and walkable top. The jar cabinet
  // is inside the one tenant cell on the staff side of the sales counter.
  const ring=[[-2.70,-.585],[2.70,-.585],[2.925,-.36],[2.925,.36],[2.70,.585],[-2.70,.585],[-2.925,.36],[-2.925,-.36]];
  const counter=ring.map(v=>point(...v));
  K.phys.addPolyWalls(counter,y,y+.70,.02);K.phys.addSurface(counter,y+.70);
  const cabinet=[[.21,-1.4],[2.17,-1.4],[2.17,-2.09],[2.57,-2.09],[2.57,-1.01],[.21,-1.01]].map(v=>point(...v));
  K.phys.addPolyWalls(cabinet,y,y+2.09,.015);
  const l=-2.79,r=.30,f=.46,b=-.46,lo=.929,hi=1.379;
  K.quad('glass',[p3(l,f,lo),p3(r,f,lo),p3(r,f,hi),p3(l,f,hi)],[s,0,c]);
  K.quad('glass',[p3(r,f,lo),p3(r,b,lo),p3(r,b,hi),p3(r,f,hi)],[c,0,-s]);
  K.quad('glass',[p3(l,b,lo),p3(l,f,lo),p3(l,f,hi),p3(l,b,hi)],[-c,0,s]);
  K.quad('glass',[p3(l,f,hi),p3(r,f,hi),p3(r,b,hi),p3(l,b,hi)],[0,1,0]);
  const parts=[[0,.03,0,5.79,.73,1.10,0xaf875d],[0,.75,0,5.87,.105,1.16,0xe8dac4],
    [1.30,.045,-1.39,2.14,2.035,.10,0x956e4f],[2.18,.045,-1.64,.10,2.035,.88,0x956e4f],[-1.245,1.38,0,3.09,.04,.92,0xc4a978]];
  for(let row=0;row<3;row++){
    for(let i=0;i<5;i++)parts.push([.44+i*.428,.84+row*.417,-1.16,.19,.25,.16,0xefe6d8]);
    for(let i=0;i<2;i++)parts.push([2.40,.84+row*.417,-1.42-i*.44,.16,.25,.19,0xefe6d8]);
  }
  const material=new T.MeshPhongMaterial({vertexColors:true,side:T.DoubleSide,shininess:27,specular:0x23201b});
  material.onBeforeCompile=shader=>{
    shader.fragmentShader=shader.fragmentShader.replace('#include <emissivemap_fragment>',`#include <emissivemap_fragment>
      float milk=smoothstep(.89,.99,diffuseColor.r)*smoothstep(.71,.85,diffuseColor.g);
      totalEmissiveRadiance+=diffuseColor.rgb*(.09+.38*milk);`);
  };
  placeSingleDetail(K,{name:'한정선 · 달항아리장과 과일 찹쌀떡',file:'../hanjungsun/island.glb',
    at:[x,y,z],angle,material,fallbackMaterial:material,fallback:boxSilhouette(T,parts),
    range:8.5,exitRange:11,floorTolerance:2.4,eyeHeight:1.48,
    viewBounds:[new T.Box3(new T.Vector3(-2.95,.70,-1.41),new T.Vector3(2.95,2.32,.59))],
    closeVisibleFrom:p=>(p.x-x)*s+(p.z-z)*c>-.48});
}
