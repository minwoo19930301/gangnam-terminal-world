import {MeshPhongMaterial,MixOperation} from 'three';
import {placeMarketDisplay} from '../gyeongbu/market-display.js';
import {boxSilhouette} from '../interior-architecture/box-silhouette.js';
import {loadArchitecture} from '../interior-architecture/model.js';
import {loadReflectionAtlas} from '../interior-architecture/reflection-atlas.js';

const subjects={ribbon:'색상별 리본과 꽃 포장',case:'원목 진열장과 황동 촛대',crystal:'절삭 유리 화기와 고블릿'};
const colours=[0x897e7a,0x3f5283,0x815285,0x982a41,0xdc749e,0x52865b,0xa5bb82,0xe9b584];

function starter(T,key){
  if(key==='crystal')return boxSilhouette(T,[-1.18,-.90,-.64,-.37].map(x=>[x,1.77,.10,.095,.23,.08,0xc8d2cc]));
  if(key==='case')return boxSilhouette(T,[[-.01,.08,0,2.78,.055,.48,0xcac9bc],[-.01,.86,0,2.78,.045,.54,0xd5d5cb],
      ...[.94,1.33,1.74].map(h=>[-.72,h,0,1.34,.029,.50,0xbb9c76]),
      ...[.19,.59,.91,1.23].map((x,i)=>[x,.91,0,.041,.43+i%2*.15,.045,0xb2915a])]);
  return boxSilhouette(T,[...colours.map((c,i)=>[-.277,.150+i*.25,.12,2.07,.206,.19,c]),[1.08,.08,-.03,.56,.68,.42,0xb4916a]]);
}

async function litCounter(file){
  const [[mesh],reflection]=await Promise.all([loadArchitecture(file),loadReflectionAtlas(new URL('./shelf-reflection.webp',import.meta.url).href)]);
  mesh.material.envMap=reflection;
  mesh.material.envMapIntensity=file.endsWith('/crystal.glb')?1.48:.82;
  if(mesh.material.transparent){
    const original=mesh.material;
    const glass=new MeshPhongMaterial({map:original.map,vertexColors:true,envMap:reflection,combine:MixOperation,
      reflectivity:.69,specular:0xd4ddd7,shininess:91,transparent:true,opacity:.11,depthWrite:false});
    glass.onBeforeCompile=shader=>{
      shader.fragmentShader=shader.fragmentShader.replace('#include <opaque_fragment>',
        'float f=pow(1.0-abs(dot(normal,normalize(vViewPosition))),2.4); diffuseColor.a+=.66*f;\n#include <opaque_fragment>');
    };
    glass.customProgramCacheKey=()=>'florist-cut-glass';mesh.material=glass;
  }
  return [mesh];
}

export function placeFloristStock(K,x,y,z,angle,ribbon){
  const T=K.THREE;
  for(const key of ribbon?['ribbon']:['case','crystal']){
    const focus=key==='ribbon'?[[-1.36,.08,-.23,.79,2.17,.31],[.77,.53,-.22,1.40,2.02,.36]]:
      [[-1.42,.11,-.24,-.03,2.22,.28],[-.01,.12,-.24,1.39,1.65,.28]];
    const clear=key==='crystal';
    placeMarketDisplay(K,{name:`경부선 현대데코 · ${subjects[key]}`,file:`../gyeongbu-florist-stock/${key}/${key}.glb`,
      at:[x,y,z],angle,range:clear?7.4:10.5,exitRange:clear?10.8:14,focus,
      // The opaque back and seasonal display close the rear sightline between the parallel aisles.
      localSight:(_width,depth)=>depth>=.24,
      silhouette:new URL(`./${key}/proxy.js`,import.meta.url),initialGeometry:T=>starter(T,key),
      loadSurface:key==='ribbon'?undefined:litCounter,
      fallbackMaterial:clear?new T.MeshLambertMaterial({vertexColors:true,transparent:true,opacity:.24,depthWrite:false}):undefined});
  }
}
