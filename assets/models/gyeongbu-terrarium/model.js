import {TextureLoader,SRGBColorSpace} from 'three';
import {loadArchitecture} from '../interior-architecture/model.js';
import {placeMarketDisplay} from '../gyeongbu/market-display.js';
import {boxSilhouette} from '../interior-architecture/box-silhouette.js';

const parts={
  arch:{label:'자연목 아치와 걸이 공중식물',range:9,far:13,focus:[[-1.20,.04,.91,-.58,2.14,1.48],[.55,.04,.94,1.22,2.14,1.49],[-.73,1.49,.94,.76,2.58,1.48]]},
  stand:{label:'백색 철제 선반과 입구 마루',range:9,far:13,focus:[[-1.58,.02,-1.58,-.76,1.75,.02],[.76,.02,-1.22,1.60,.76,.86],[-.44,.006,-1.56,.44,.033,1.04]]},
  left:{label:'왼편 산세베리아와 화분',range:7,far:10.5,focus:[[-1.71,.04,-1.60,-.60,2.58,1.16]]},
  right:{label:'오른편 잎식물과 다육 트레이',range:7,far:10.5,focus:[[.46,.04,-1.63,1.79,2.04,1.16]]},
  timber:{label:'자작 통나무와 고목 진열',range:6.8,far:10.3,focus:[[-1.77,.015,-1.66,-1.04,.89,-1.08],[-1.75,.015,.09,-.96,2.17,1.48]]},
};
function starter(T,key){
  if(key==='arch')return boxSilhouette(T,[[-.96,.04,1.10,.055,1.7,.06],[.96,.04,1.16,.055,1.66,.06],
    [-.69,1.72,1.12,.24,.34,.05],[.69,1.72,1.12,.24,.34,.05],[0,2.33,1.1,1.18,.065,.06],
    ...[-.50,-.21,.24,.56].map((x,i)=>[x,1.81+(i%2)*.14,1.12,.13,.30,.11,i<2?0x8b957f:0x557041])]);
  if(key==='timber')return boxSilhouette(T,[[-1.37,.02,1.15,.65,.16,.50,0x756041],[-1.37,.17,1.13,.47,.43,.36,0xc1af87],
    [-1.40,.02,.34,.11,1.99,.11,0xa08d6e],[-1.43,.02,-1.34,.45,.49,.39,0x6e5b40]]);
  if(key==='stand')return boxSilhouette(T,[[.14,.91,1.69],[.13,.70]].flatMap((rows,i)=>rows.map(h=>[i?1.17:-1.17,h,i?-.17:-.77,.76,.035,i?2.05:1.54,0xc6cabe])));
  const stock=key==='left'?[[-1.15,1.70,-.76],[-1.17,.94,-.65],[-1.02,.22,.48]]:[[1.17,.76,-.69],[1.17,.76,.39],[1.13,.18,-.25]];
  return boxSilhouette(T,stock.map(([x,h,d])=>[x,h,d,.43,.36,.45,0x557245]));
}

let sharedMaps;
function maps(){
  if(!sharedMaps){
    const loader=new TextureLoader();
    sharedMaps=Promise.all(['surface','weave-normal','metal-rough','lamp'].map(async key=>{
      const texture=await loader.loadAsync(new URL(`./${key}.webp`,import.meta.url).href);
      texture.flipY=false;
      if(key==='surface'||key==='lamp')texture.colorSpace=SRGBColorSpace;
      return texture;
    })).catch(error=>{sharedMaps=undefined;throw error;});
  }
  return sharedMaps;
}
async function loadSurface(file){
  const [[mesh],[surface,normal,orm,emission]]=await Promise.all([loadArchitecture(file),maps()]);
  const material=mesh.material;
  material.map=surface;material.normalMap=normal;material.normalScale.set(.55,.55);
  material.roughnessMap=orm;material.metalnessMap=orm;material.emissiveMap=emission;
  return [mesh];
}

export function placeTerrarium(K,x,y,z,angle,key){
  const p=parts[key],T=K.THREE;
  return placeMarketDisplay(K,{name:'경부선 박테라리움 · '+p.label,file:`../gyeongbu-terrarium/${key}/${key}.glb`,
    at:[x,y,z],angle,loadSurface,focus:p.focus,range:p.range,exitRange:p.far,initialGeometry:T=>starter(T,key),
    silhouette:new URL(`./${key}/proxy.js`,import.meta.url),
    fallbackMaterial:key==='timber'?undefined:new T.MeshLambertMaterial({vertexColors:true,side:T.DoubleSide})});
}
