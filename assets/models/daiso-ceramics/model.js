import * as THREE from 'three';
import {placeSingleDetail} from '../interior-architecture/single-detail.js';
import {boxSilhouette} from '../interior-architecture/box-silhouette.js';
import {loadArchitecture} from '../interior-architecture/model.js';
import {loadReflectionAtlas} from '../interior-architecture/reflection-atlas.js';
import {relief} from '../../../js/banpo_relief.js';
import {parts,prefix,rows,bays} from './layout.js';
const silhouettes=new Map(),fallback=new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide});
const bakes=new Set(['rack','pots','storage','dinner','bowls']),reflects=new Set(['pots','lids','painted','dinner','bowls','storage']);
function far(k){
  if(silhouettes.has(k))return silhouettes.get(k);
  let shapes;
  if(k==='rack'){
    shapes=[[0,.008,0,1.288,.16,.54,0xcacbc2],[0,.16,-.222,1.262,1.74,.038,0xd8dcd2]];
    for(const y of [.177,.314,.934,1.473,1.872])shapes.push([0,y,.007,1.275,.030,.53,0xe6e4dc]);
  }else if(k==='dinner')shapes=[.144,1.300].flatMap(y=>Array.from({length:6},(_,i)=>[(i-2.5)*.207,y,.118,.159,.177,.023,0xe7e4d9]));
  else if(k==='ticket')shapes=[[0,0,0,1.26,.217,.020,0xb7404b]];
  else if(k==='cartons')shapes=[[0,0,0,.243,.345,.185,0xe8e6df]];
  else if(k==='pots'||k==='lids')shapes=Array.from({length:8},(_,i)=>[(i%4-1.6)*.212,k==='lids'?.107:.004,(Math.floor(i/4)-.5)*.20,.15,k==='lids'?.012:.098,.15,[0xd1c999,0xe0dcca,0xb0c2c3,0xe1ddcb][i%4]]);
  else shapes=Array.from({length:k==='painted'?4:6},(_,i)=>[(i-(k==='painted'?1.5:2.5))*.19,.008,.033,.145,k==='storage'?.185:k==='bowls'?.155:.13,.146,k==='storage'?0xb4bec0:k==='painted'?0xe4ded0:0xe7e4da]);
  const g=boxSilhouette(THREE,shapes);silhouettes.set(k,g);return g;
}
async function load(file){
  const k=file.split('/').at(-1).slice(0,-4);
  const [[surf],map,env]=await Promise.all([loadArchitecture(file),bakes.has(k)?new THREE.TextureLoader().loadAsync(new URL('./'+k+'-light.webp',import.meta.url).href):null,reflects.has(k)?loadReflectionAtlas(new URL('./aisle-reflection.webp',import.meta.url).href):null]);
  if(map){map.colorSpace=THREE.NoColorSpace;map.flipY=false;map.anisotropy=4;}
  const clear=k==='lids',mat=new THREE.MeshPhongMaterial({vertexColors:true,side:THREE.DoubleSide,map,envMap:env,combine:THREE.MixOperation,
    transparent:clear,opacity:clear?.63:1,depthWrite:!clear,reflectivity:clear?.32:k==='storage'?.12:.07,shininess:clear?98:66,specular:clear?0xb9c7bb:0x847e70});
  mat.forceSinglePass=true;if(map)mat.color.setRGB(2,2,2);
  if(clear){mat.onBeforeCompile=s=>{s.fragmentShader=s.fragmentShader.replace('#include <envmap_fragment>',`#include <envmap_fragment>
      float edge=pow(1.-clamp(dot(normal,normalize(vViewPosition)),0.,1.),2.);
      diffuseColor.a=.27+.49*edge;outgoingLight+=vec3(.04,.043,.041)*edge;`);};mat.customProgramCacheKey=()=>'daiso-ceramic-lids';}
  surf.updateWorldMatrix(true,false);const m=new THREE.Mesh(surf.geometry,mat);m.matrixAutoUpdate=false;m.matrix.copy(surf.matrixWorld);return [m];
}
export function registerCeramics(K,W,toLocal,rect,angle){
  for(const row of rows){
    const {u,v,y,key,bay}=row,[label,w,d,h,range]=parts[key],name=prefix+label,at=W(u,v),poly=rect(u-w/2,v-d/2,u+w/2,v+d/2);
    if(key==='rack')K.phys.addPolyWalls(poly,-4,-2.05,.01,'gyeongbu');
    const visible=(x,eye,z)=>{
      if(eye<-4.22||eye>-.77)return false;
      const [cu,cv]=toLocal(x,z),b=bays[bay];
      return cv>3.96 && cv<b.v+.03 && Math.abs(cu-b.u)<12.5;
    };
    K.detail({name,floor:'B1',poly,y0:y-.025,y1:y+h+.03,visibleFrom:visible},()=>{
      placeSingleDetail(K,{name,file:'../daiso-ceramics/'+key+'.glb',at:[at[0],y,at[1]],angle:angle+Math.PI,
        fallback:far(key),fallbackMaterial:fallback,loadSurface:load,range,exitRange:range+1.2,eyeHeight:h/2,floorTolerance:3.15,
        viewBounds:[new THREE.Box3(new THREE.Vector3(-w/2,-.02,-d/2),new THREE.Vector3(w/2,h+.02,d/2))],
        closeVisibleFrom:e=>visible(e.x,e.y-relief(e.x,e.z),e.z)});
    });
  }
  const [x,z]=W(257.5,8.90),[tx,tz]=W(257.4,10.78);
  K.spawn({name:'다이소 B1 · 도기밥솥과 식기',x,y:-4,z,yaw:Math.atan2(x-tx,z-tz)});
}
