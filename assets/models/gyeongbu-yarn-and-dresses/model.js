import {MeshPhongMaterial,MixOperation} from 'three';
import {loadReflectionAtlas} from '../interior-architecture/reflection-atlas.js';
import {boxSilhouette} from '../interior-architecture/box-silhouette.js';
import {placeMarketDisplay} from '../gyeongbu/market-display.js';
import {marketSurfaceLoader} from '../gyeongbu/shared-finishes.js';

const parts={
  booth:{name:'상점 마감과 면사 울사 전문도매 표지',range:11,exit:15,
    focus:[[-2.56,.04,-1.36,2.56,2.92,-1.23],[.23,2.43,1.13,2.37,2.85,1.22]]},
  yarn:{name:'종이띠를 두른 면사와 울사 실타래',range:7.8,exit:11,
    focus:[[.16,.11,-1.14,2.37,2.30,-.35],[.13,.13,.22,2.38,1.68,1.07]]},
  wrap:{name:'도매 묶음의 투명 봉투와 접힌 이음매',range:5.2,exit:7.8,
    focus:[[.22,.78,.34,2.22,1.52,.89]]},
  dresses:{name:'새틴 허리띠와 자수 주름 아동 드레스',range:8.1,exit:11.3,
    focus:[[-2.43,.045,-.86,.18,2.44,.42],[-2.40,.044,.46,-.45,.91,.88]]},
};
const surfaces=marketSurfaceLoader(import.meta.url);
async function shopSurface(file) {
  const [mesh]=await surfaces(file);
  const material=mesh.material;
  if (file.endsWith('/wrap.glb')) {
    const envMap=await loadReflectionAtlas(new URL('../gyeongbu-florist-stock/shelf-reflection.webp',import.meta.url).href);
    const film=new MeshPhongMaterial({color:0xe0e6e8,envMap,combine:MixOperation,reflectivity:.47,
      specular:0xe4edef,shininess:80,transparent:true,opacity:.032,depthWrite:false});
    film.onBeforeCompile=shader=>{
      shader.fragmentShader=shader.fragmentShader.replace('#include <opaque_fragment>',
        'float filmEdge=pow(1.0-abs(dot(normal,normalize(vViewPosition))),2.6); diffuseColor.a+=.36*filmEdge;\n#include <opaque_fragment>');
    };
    film.customProgramCacheKey=()=>'cotton-yarn-sleeves';
    mesh.material=film;
  } else {
    // This shopfront in the operator photo is lit by the white strip lights
    // above the goods. Keep their soft local fill when the street turns dark.
    material.onBeforeCompile=shader=>{
      shader.fragmentShader=shader.fragmentShader.replace('#include <lights_fragment_end>',
        '#include <lights_fragment_end>\nreflectedLight.indirectDiffuse += diffuseColor.rgb * vec3(.25,.27,.28);');
    };
    material.customProgramCacheKey=()=>'wholesale-shop-strip-fill';
  }
  return [mesh];
}

function starter(T,key){
  if(key==='booth')return boxSilhouette(T,[[0,.02,-1.31,5.15,2.86,.076,0xcfc7b5],
    [0,2.87,-.02,5.16,.05,2.61,0xd4d1c3],[1.295,2.456,1.17,2.11,.36,.049,0xe7dfcf]]);
  if(key==='wrap')return boxSilhouette(T,[[1.24,.80,.62,1.91,.69,.46,0xbaccd1]]);
  if(key==='yarn')return boxSilhouette(T,[[1.24,.12,.62,1.98,.66,.57,0xbb9a70],
    ...[0xe4a5b1,0xe5bc8a,0x88baa3,0xb495bf,0xd5cfa4,0xc8c1aa].map((c,i)=>[1.25,.20+i*.348,-.64,2.08,.252,.31,c]),
    ...[0xce8091,0xe5ba94,0xa4bca9,0xb8a2c1].map((c,i)=>[1.25,.80+i*.17,.64,1.96-i*.025,.17,.51,c])]);
  return boxSilhouette(T,Array.from({length:10},(_,i)=>[-2.14+(i%5)*.426,.72+Math.floor(i/5)*.91,-.49,(i%2?.36:.39),.64,.13,
    [0xd8aab5,0xe5d9b3,0xe6d5cd,0xbaa8ca,0xdac08e][i%5]]));
}

export function placeYarnAndDresses(K,x,y,z,angle,key){
  const p=parts[key];
  return placeMarketDisplay(K,{name:'경부선 6층 · '+p.name,
    file:'../gyeongbu-yarn-and-dresses/'+key+'/'+key+'.glb',at:[x,y,z],angle,
    focus:p.focus,range:p.range,exitRange:p.exit,frontage:{front:1.23,back:-1.31,halfWidth:2.56},
    loadSurface:shopSurface,initialGeometry:T=>starter(T,key),
    fallbackMaterial:key==='wrap'?new MeshPhongMaterial({transparent:true,opacity:.023,depthWrite:false}):undefined,silhouette:new URL('./'+key+'/proxy.js',import.meta.url)});
}
