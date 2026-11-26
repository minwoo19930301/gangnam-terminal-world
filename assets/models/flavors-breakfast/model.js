import * as THREE from 'three';
import {placeSingleDetail} from '../interior-architecture/single-detail.js';
import {boxSilhouette} from '../interior-architecture/box-silhouette.js';
import {loadArchitecture} from '../interior-architecture/model.js';
import {loadReflectionAtlas} from '../interior-architecture/reflection-atlas.js';
import {relief} from '../../../js/banpo_relief.js';
import {parts,prefix,rows,service} from './layout.js';
const bakes=new Set(['long','short','board','pot','steamers','bowls','slicer']);
const mirrors=new Set(['juice','glass','cups','pot','stew','long','short','slicer','hot','servers','cooker']);
const proxyCache=new Map();
function proxy(k){
  if(proxyCache.has(k))return proxyCache.get(k);
  const [label,w,d,h]=parts[k],col={board:0xb78d5e,pot:0x49372c,stew:0xd8792b,steamers:0xb2956a,dimsum:0xe1c697,
    cups:0xb4c1b7,cards:0xe3dfd1,sign:0xebe4d0,cooker:0x3a3c35,hot:0x42453c,salad:0x72814d,servers:0xb4b7ac,
    bowls:0xe9e4d7,slicer:0x904b44,ham:0xcf9d8c,rail:0x4e4840};
  let boxes;
  if(k==='long'||k==='short')boxes=[[0,.008,0,w-.18,.099,d-.17,0x2b2c26],[0,.10,0,w-.05,.88,d-.10,0x42453d],[0,.974,0,w,.066,d,0x5a5650]];
  else if(k==='juice'||k==='glass')boxes=Array.from({length:10},(_,i)=>{
    const v=[0xe1b23b,0xe7983e,0x80a64d,0xe89d72,0xa73873][(i%5+Math.floor(i/5))%5],x=(i%5-2)*.604+.11*(Math.floor(i/5)-.5),z=(Math.floor(i/5)-.5)*.251;
    return [x,k==='juice'?.034:.31,z,k==='juice'?.119:.061,k==='juice'?.228:.039,k==='juice'?.117:.061,k==='juice'?v:0xd7dbce];
  });
  else if(k==='bowls'||k==='salad')boxes=Array.from({length:8},(_,i)=>[(i%4-1.5)*.58,k==='bowls'?.041:.06,(Math.floor(i/4)-.5)*.412,k==='bowls'?.34:.19,k==='bowls'?.111:.067,k==='bowls'?.30:.14,
    k==='bowls'?0xeae3cf:[0xb76d49,0x423a41,0xd49a7c,0x53654b,0xc98043,0xb45d3c,0x78844c,0x6e8551][i]]);
  else if(k==='steamers'||k==='dimsum')boxes=[-.5,0,.49].map((x,i)=>[x,.02,i===1?.115:-.09,k==='steamers'?.39:.27,k==='steamers'?.188:.078,k==='steamers'?.39:.25,col[k]]);
  else if(k==='hot')boxes=[-1.065,-.355,.355,1.065].map(x=>[x,.02,0,.44,.13,.39,col[k]]);
  else boxes=[[0,0,0,w*.87,h*.72,d*.81,col[k]]];
  const g=boxSilhouette(THREE,boxes);proxyCache.set(k,g);return g;
}
const fallback=new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide});
function illumination(k){return new THREE.TextureLoader().loadAsync(new URL('./'+k+'-light.webp',import.meta.url).href).then(t=>{
  t.colorSpace=THREE.NoColorSpace;t.flipY=false;t.anisotropy=4;return t;
});}
async function detail(file){
  const k=file.split('/').pop().slice(0,-4);
  const [[o],env,map]=await Promise.all([loadArchitecture(file),mirrors.has(k)?loadReflectionAtlas(new URL('./dining-reflection.webp',import.meta.url).href):null,bakes.has(k)?illumination(k):null]);
  const clear=k==='glass',wet=['juice','stew','pot','cups'].includes(k);
  const mat=new THREE.MeshPhongMaterial({vertexColors:true,side:THREE.DoubleSide,map,envMap:env,combine:THREE.MixOperation,transparent:clear,opacity:clear?.23:1,depthWrite:!clear,
    shininess:clear?108:k==='servers'?89:wet?73:29,specular:clear?0xe1e9e2:wet||k==='servers'?0x958d78:0x49453c,
    reflectivity:clear?.62:k==='servers'?.37:wet?.11:.065});mat.forceSinglePass=true;
  if(map)mat.color.setRGB(2,2,2);
  if(clear||k==='juice'||k==='stew'){
    mat.onBeforeCompile=s=>{
      s.fragmentShader=s.fragmentShader.replace('#include <envmap_fragment>',`#include <envmap_fragment>
        float fres=pow(1.-clamp(dot(normal,normalize(vViewPosition)),0.,1.),2.4);
        ${clear?'diffuseColor.a=.075+.63*fres;outgoingLight+=vec3(.07,.074,.066)*fres;':k==='juice'?'outgoingLight+=diffuseColor.rgb*(.09+.06*(1.-fres));':'outgoingLight+=diffuseColor.rgb*.075;'}`);
    };mat.customProgramCacheKey=()=>k;
  }
  o.updateWorldMatrix(true,false);const result=new THREE.Mesh(o.geometry,mat);result.matrixAutoUpdate=false;result.matrix.copy(o.matrixWorld);return [result];
}
export function registerFlavorsBreakfast(K,P,RECT,R){
  const [ox,oz]=P(0,0),co=Math.cos(R),si=Math.sin(R);
  const uv=(x,z)=>[(x-ox)*co-(z-oz)*si,(x-ox)*si+(z-oz)*co];
  function entryView(cu,cv,u,v){
    if(cu<-33.17||cu>-12.48||cv<11.85||cv>41.95)return false;
    if(cu<=-15.51)return true;
    const ratio=(-15.51-cu)/(u-cu),at=cv+(v-cv)*ratio;
    return Math.abs(at-18.50)<=1.72||Math.abs(at-32.0)<=1.62;
  }
  for(const {key,u,v,y} of rows){
    const [label,w,d,h,range]=parts[key],name=prefix+label,at=P(u,v);
    const shell=key==='long'||key==='short',edge=RECT(u-d/2,v-w/2,u+d/2,v+w/2);
    if(shell)K.phys.addPolyWalls(edge,6,7.035,.012,'jwmarriott');
    const visible=(x,eye,z)=>{
      if(eye<5.84||eye>10.90)return false;
      const [cu,cv]=uv(x,z);
      return entryView(cu,cv,u,v);
    };
    K.detail({name,floor:'2F',poly:edge,y0:y-.016,y1:y+h+.03,visibleFrom:visible},()=>{
      placeSingleDetail(K,{name,file:'../flavors-breakfast/'+key+'.glb',at:[at[0],y,at[1]],angle:R+Math.PI*.5,fallback:proxy(key),fallbackMaterial:fallback,
        loadSurface:detail,range,exitRange:range+1.4,eyeHeight:h/2,floorTolerance:4.1,
        viewBounds:[new THREE.Box3(new THREE.Vector3(-w/2,-.04,-d/2),new THREE.Vector3(w/2,h+.06,d/2))],
        closeVisibleFrom:e=>visible(e.x,e.y-relief(e.x,e.z),e.z)});
    });
  }
  const [x,z]=P(service.west+1.27,38.80),[tx,tz]=P(service.west,37.18);
  K.spawn({name:'플레이버즈 2F · 조식과 주스 바',x,y:6,z,yaw:Math.atan2(x-tx,z-tz)});
}
