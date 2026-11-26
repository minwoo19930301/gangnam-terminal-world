import * as THREE from 'three';
import {loadReflectionAtlas} from '../interior-architecture/reflection-atlas.js';
import {loadArchitecture} from '../interior-architecture/model.js';
import {placeSingleDetail} from '../interior-architecture/single-detail.js';
import {boxSilhouette} from '../interior-architecture/box-silhouette.js';
import {relief} from '../../../js/banpo_relief.js';
import {parts,rows,prefix} from './layout.js';

const settings={
 stand:[6.8,8.4],sweets:[3.5,4.6],blueTea:[4.4,5.6],whiteTea:[4.4,5.6],scones:[3.2,4.3],
 soda:[3.5,4.4],sodaGlass:[3.5,4.4],sconeGlass:[3.2,4.3],flowers:[4.2,5.2],
 baskets:[4.3,5.5],course:[3.8,4.9],ribs:[3.4,4.5],sticks:[2.6,3.8],
};
const shapes={
 stand:[...[.045,.192,.340].map(y=>[0,y,0,.405,.0063,.254,0xece7df]),
  ...[-.184,.184].flatMap(x=>[-.109,.109].map(d=>[x,.004,d,.005,.467,.005,0xbc9854])),
  ...[-.109,.109].map(d=>[0,.467,d,.373,.0049,.0049,0xbc9854])],
 sweets:[...[-1,1].flatMap(s=>[
  [s*.145,.348,-.04,.047,.026,.048,0xe78889],[s*.101,.348,.04,.039,.055,.040,0xe6c9b7],
  [s*.03,.348,-.014,.034,.042,.033,0xc98e76],[s*.153,.20,-.047,.045,.028,.032,0xb92c4a],
  [s*.037,.20,-.005,.044,.04,.045,0x524d46],[s*.119,.20,.047,.045,.025,.025,0xbf7f68],
  [s*.145,.053,-.03,.046,.021,.025,0xd2a058],[s*.04,.053,-.035,.036,.018,.032,0xd3c4ae]])],
 blueTea:[[.056,.004,.025,.112,.10,.108,0xa7b0c9],[-.085,.008,-.049,.072,.046,.071,0xabb2c7]],
 whiteTea:[[.039,.009,.031,.103,.10,.10,0xefe9de],[-.115,.008,-.042,.071,.046,.071,0xece7da],[.121,.008,-.067,.071,.046,.071,0xece7da]],
 soda:[[0,.009,0,.052,.075,.052,0xd28a88],[0,.084,0,.058,.027,.058,0xead1bf]],
 sodaGlass:[[0,.118,0,.060,.003,.060,0xdfddd2]],sconeGlass:[[.004,.024,0,.129,.002,.118,0xc3c6bf]],
 scones:[[0,.004,0,.12,.009,.11,0xc7c6c0],[-.024,.016,0,.049,.030,.050,0xc79762],[.026,.016,0,.048,.030,.050,0xc4986d],
  [-.174,.001,-.004,.145,.007,.045,0xede8df],...[-.219,-.174,-.129].map((x,i)=>[x,.008,-.004,.028,.034,.028,[0xcacaaf,0xceaa66,0xa06664][i]])],
 flowers:[[0,.004,0,.061,.067,.052,0xb8b6ac],[0,.073,0,.066,.064,.049,0x63815d],[.018,.123,.017,.037,.052,.026,0xaa3845]],
 baskets:[...[[ -.138,-.025],[.057,.090],[.092,-.121]].map(([x,z])=>[x,0,z,.15,.047,.148,0xd6b782]),
  [-.136,.037,.095,.15,.008,.13,0xc4a36e,-.7]],
 course:[[-.063,.002,-.018,.177,.012,.168,0xe9e4d8],[.112,.002,.102,.188,.010,.081,0xece9e1],[.102,.001,-.052,.059,.023,.057,0x8d9eb5]],
 ribs:[[0,.002,0,.194,.015,.19,0xece8db],...[0,1,2,3,4].map(i=>[0,.02,(i-2)*.023,.105,.026,.026,0x744331])],
 sticks:[[-.007,.008,0,.005,.004,.19,0x282926],[.007,.008,0,.005,.004,.19,0x282926]],
};
const proxy=new Map();
function fallback(key){if(!proxy.has(key))proxy.set(key,boxSilhouette(THREE,shapes[key]));return proxy.get(key);}

let finishes;
const materials=new Map();
function atlas(){
  finishes??=new THREE.TextureLoader().loadAsync(new URL('./surfaces.webp',import.meta.url).href).then(t=>{
    t.flipY=false;t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;return t;
  }).catch(error=>{finishes=null;throw error;});return finishes;
}
function finish(map,env,glass){
  const mat=new THREE.MeshPhongMaterial({map,envMap:env,combine:THREE.MixOperation,reflectivity:glass?.76:.44,
    specular:glass?0xa9a9a7:0x8c8374,shininess:57,vertexColors:true,side:THREE.DoubleSide,
    transparent:glass,opacity:glass?.18:1,depthWrite:!glass});
  mat.color.setRGB(1.32,1.32,1.32);
  mat.onBeforeCompile=shader=>{
    shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',
      '#if defined(USE_COLOR_ALPHA) || defined(USE_COLOR)\n diffuseColor.rgb*=vColor.rgb;\n#endif')
    .replace('#include <specularmap_fragment>',
      '#include <specularmap_fragment>\n#ifdef USE_COLOR_ALPHA\n specularStrength=vColor.a;\n#endif')
    .replace('#include <lights_phong_fragment>',
      '#include <lights_phong_fragment>\n#ifdef USE_COLOR_ALPHA\n material.specularShininess=mix(8.0,92.0,vColor.a);\n#endif');
    if(glass)shader.fragmentShader=shader.fragmentShader.replace('#include <opaque_fragment>',
      'float rim=pow(1.0-abs(dot(normal,normalize(vViewPosition))),2.35);diffuseColor.a=clamp(diffuseColor.a+.50*rim,0.,.80);\n#include <opaque_fragment>');
  };
  mat.customProgramCacheKey=()=>glass?'lounge-clear-glass-v1':'lounge-diffuse-and-glaze-v1';
  return mat;
}
async function loadSurface(file){
  const key=file.split('/').at(-1).slice(0,-4),glass=key.endsWith('Glass');
  const [[mesh],map,env]=await Promise.all([loadArchitecture(file),atlas(),loadReflectionAtlas(new URL('./lounge-reflection.webp',import.meta.url).href)]);
  if(!materials.has(glass))materials.set(glass,finish(map,env,glass));
  mesh.material=materials.get(glass);return [mesh];
}

export function registerLoungeService(K,point,angle,y){
  const T=K.THREE,[ox,oz]=point(0,0),c=Math.cos(angle),s=Math.sin(angle);
  const paint=new T.MeshLambertMaterial({vertexColors:true,side:T.DoubleSide});
  const clear=new T.MeshPhongMaterial({color:0xe2e3df,transparent:true,opacity:.18,side:T.DoubleSide,depthWrite:false});
  for(const row of rows){
    const {key,u,v,h}=row,[label,w,d,height]=parts[key],rot=row.angle;
    const xRad=(Math.abs(Math.cos(rot))*w+Math.abs(Math.sin(rot))*d)/2;
    const zRad=(Math.abs(Math.cos(rot))*d+Math.abs(Math.sin(rot))*w)/2;
    const poly=[point(u-xRad,v-zRad),point(u+xRad,v-zRad),point(u+xRad,v+zRad),point(u-xRad,v+zRad)];
    const [x,z]=point(u,v),name=prefix+label;
    const own=(wx,eye,wz)=>{
      if(eye<y-.09||eye>y+5.25)return false;
      const dx=wx-ox,dz=wz-oz,cu=dx*c-dz*s,cv=dx*s+dz*c;
      return cu>-7.86&&cu<5.02&&cv>6.1&&cv<48.62&&(cu-u)**2+(cv-v)**2<13.6**2;
    };
    K.detail({name,floor:'8F',poly,y0:y+h,y1:y+h+height,visibleFrom:own},()=>{
      const [range,exitRange]=settings[key];
      const bounds=[new T.Box3(new T.Vector3(-w/2-.025,-.008,-d/2-.022),new T.Vector3(w/2+.025,height,d/2+.022))];
      return placeSingleDetail(K,{name,file:'../lounge-table-service/'+key+'.glb',loadSurface,at:[x,y+h,z],angle:angle+rot,
        fallback:fallback(key),fallbackMaterial:key.endsWith('Glass')?clear:paint,range,exitRange,eyeHeight:height*.55,
        viewBounds:bounds,floorTolerance:3.7,closeVisibleFrom:pos=>own(pos.x,pos.y-relief(pos.x,pos.z),pos.z)});
    });
  }
}
