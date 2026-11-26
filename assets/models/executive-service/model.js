import * as THREE from 'three';
import {placeSingleDetail} from '../interior-architecture/single-detail.js';
import {boxSilhouette} from '../interior-architecture/box-silhouette.js';
import {loadArchitecture} from '../interior-architecture/model.js';
import {loadReflectionAtlas} from '../interior-architecture/reflection-atlas.js';
import {relief} from '../../../js/banpo_relief.js';
import {parts,prefix,rows,eveningService} from './layout.js';

const fallback=new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide});
const lod=new Map(), baked=new Set(['cabinet','coffee','ice','cups','macarons','shelf','wall']);
const glass=new Set(['hoppers','jars','candyglass']);
const reflective=new Set([...glass,'coffee','ice','cups','shelf','cabinet','plates','candy']);
function far(key){
  if(lod.has(key))return lod.get(key);
  const [label,w,d,h]=parts[key];
  let boxes;
  if(key==='cabinet')boxes=[[0,0,0,6.32,.10,.67,0x332a24],[0,.1,0,6.43,.74,.75,0x745944],[0,.836,0,6.48,.054,.81,0xe5dfcd]];
  else if(key==='wall')boxes=[[-2.32,0,0,1.72,1.42,.13,0xe0dbc9],[-.56,0,0,1.84,1.65,.13,0x80684e],[1.85,0,0,2.76,1.68,.14,0x73563f]];
  else if(key==='cakes')boxes=[[0,.015,.16,.28,.052,.18,0xccab73]];
  else if(key==='coffee'||key==='ice')boxes=[[0,.01,-.07,w*.94,h*.9,d*.62,0x363633],[0,h*.83,.035,w*.91,h*.13,d*.75,0x9e9e95],[0,.038,.126,w*.84,.045,.18,0xbebdb1]];
  else if(key==='shelf')boxes=[.037,.368,.859].map(y=>[0,y,0,1.56,.035,.49,0xb1b0a7]).concat([-.755,.755].map(x=>[x,0,-.21,.024,1.09,.024,0xb5b2a8]));
  else if(glass.has(key))boxes=(key==='jars'?[-1,0,1]:key==='hoppers'?[-.5,.5]:[-2,-1,0,1,2]).map(i=>[i*(key==='jars'?.333:key==='hoppers'?.316:.273),h*.68,0,key==='candyglass'?.16:.23,.017,key==='candyglass'?.16:.23,0xa6aaa0]);
  else if(key==='macarons'||key==='candy'||key==='evening')boxes=Array.from({length:5},(_,i)=>[(i-2)*w*.16,.016,0,w*.13,h*(key==='macarons'?.32:.6),d*.75,[0xd49b70,0xcf92a0,0xa6ac70,0xd6be76,0xac8269][i]]);
  else if(key==='cups')boxes=Array.from({length:8},(_,i)=>[(i%4-1.5)*.201,0,(Math.floor(i/4)-.5)*.18,.118,.16,.117,0xeae5d8]);
  else if(key==='biscuits')boxes=[0x4a302a,0xc19169,0xd6b884].map((c,i)=>[(i-1)*.333,.015,0,.215,.179,.205,c]);
  else boxes=[[0,.008,0,w*.78,h*.56,d*.68,key==='plates'?0xe8e1ce:0x544230]];
  const geo=boxSilhouette(THREE,boxes);lod.set(key,geo);return geo;
}
async function closeSurface(file){
  const k=file.split('/').at(-1).slice(0,-4);
  const [[surface],env,map]=await Promise.all([loadArchitecture(file),reflective.has(k)?loadReflectionAtlas(new URL('./lounge-reflection.webp',import.meta.url).href):null,
    baked.has(k)?new THREE.TextureLoader().loadAsync(new URL('./'+k+'-light.webp',import.meta.url).href):null]);
  if(map){map.colorSpace=THREE.NoColorSpace;map.flipY=false;map.anisotropy=4;}
  const clear=glass.has(k);
  const mat=new THREE.MeshPhongMaterial({vertexColors:true,side:THREE.DoubleSide,map,envMap:env,combine:THREE.MixOperation,
    transparent:clear,opacity:clear?.30:1,depthWrite:!clear,shininess:clear?110:58,
    specular:clear?0xdbe7de:0x877f6c,reflectivity:clear?.51:k==='ice'?.24:.075});
  mat.forceSinglePass=true;if(map)mat.color.setRGB(2,2,2);
  if(clear){
    mat.onBeforeCompile=s=>{s.fragmentShader=s.fragmentShader.replace('#include <envmap_fragment>',`#include <envmap_fragment>
        float f=pow(1.-clamp(dot(normal,normalize(vViewPosition)),0.,1.),2.4);
        diffuseColor.a=mix(.065+.57*f,.91,1.-smoothstep(.07,.26,max(vColor.r,max(vColor.g,vColor.b))));
        outgoingLight+=vec3(.055,.061,.055)*f;`);};
    mat.customProgramCacheKey=()=> 'executive-clear';
  }
  surface.updateWorldMatrix(true,false);const item=new THREE.Mesh(surface.geometry,mat);item.matrixAutoUpdate=false;item.matrix.copy(surface.matrixWorld);return [item];
}
export function registerExecutiveService(K,P,RECT,angle){
  const [ox,oz]=P(0,0),co=Math.cos(angle),si=Math.sin(angle);
  const nearRoom=(x,y,z)=>{
    if(y<40.90||y>44.7)return false;
    const u=(x-ox)*co-(z-oz)*si,v=(x-ox)*si+(z-oz)*co;
    return u> -7.86 && u<15.86 && v>5.98 && v<24.25;
  };
  // The existing solar-clock callback fires on manual previews and during real Seoul time.
  let serving=true,eveningItem;
  if(K.displayClock)K.onSolarAltitude?.(()=>{serving=eveningService(K.displayClock());if(eveningItem)eveningItem.visible=serving;});
  for(const {key,u,v,y} of rows){
    const [label,w,d,h,range]=parts[key],name=prefix+label,at=P(u,v),poly=RECT(u-w/2,v-d/2,u+w/2,v+d/2);
    if(key==='cabinet')K.phys.addPolyWalls(poly,41,41.89,.012,'jwmarriott');
    K.detail({name,floor:'9F',poly,y0:y-.012,y1:y+h+.012,visibleFrom:nearRoom},()=>{
      const root=placeSingleDetail(K,{name,file:'../executive-service/'+key+'.glb',at:[at[0],y,at[1]],angle,
        fallback:far(key),fallbackMaterial:fallback,loadSurface:closeSurface,range,exitRange:range+1.1,eyeHeight:h/2,floorTolerance:3.2,
        viewBounds:[new THREE.Box3(new THREE.Vector3(-w/2,-.02,-d/2),new THREE.Vector3(w/2,h+.02,d/2))],
        closeVisibleFrom:e=>nearRoom(e.x,e.y-relief(e.x,e.z),e.z)});
      if(key==='evening'){eveningItem=root.children[0];eveningItem.visible=serving;}
    });
  }
  const [x,z]=P(13.28,8.14),[tx,tz]=P(12.84,6.87);K.spawn({name:'9F 라운지 · 커피와 다과',x,y:41,z,yaw:Math.atan2(x-tx,z-tz)});
}
