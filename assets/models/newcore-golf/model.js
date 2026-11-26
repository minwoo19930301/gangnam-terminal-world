import {visor,distantKnit} from './distant.js';
import * as THREE from 'three';
import {loadArchitecture} from '../interior-architecture/model.js';
import {placeSingleDetail} from '../interior-architecture/single-detail.js';
import {boxSilhouette} from '../interior-architecture/box-silhouette.js';
import {relief} from '../../../js/banpo_relief.js';
import {catalog,rows,prefix} from './layout.js';

const colors={wine:0x672a41,ice:0xb8d0dc,black:0x363738,puffer:0x303133};
const knitColors=new Set(['wine','ice','black']);
const baked=new Set(['envelope','back','table','shelf','bench','puffer','navy','bow']);
const proxies=new Map();
function distant(key){
  if(proxies.has(key))return proxies.get(key);
  let boxes;
  if(key==='envelope'){
    boxes=[[0,.012,0,5.70,.007,8.70,0xc9c6be],[0,0,4.32,5.70,3.45,.064,0xebe9e2],
      ...[-1,1].map(side=>[side*2.824,0,0,.052,3.45,8.7,0xebe9e2]),
      ...[-1,1].map(side=>[side*1.68,3.35,-.07,.049,.049,8.15,0x242424])];
  }else if(key==='shelf'){
    boxes=[[0,.05,.18,3.63,1.73,.065,0xdcdad4],[0,.075,-.014,3.65,.45,.47,0xd1cfca],
      ...[.57,1.15,1.73].map(h=>[0,h,-.022,3.65,.033,.46,0xb28c67])];
  }else if(key==='bench'){
    boxes=[[0,.103,.24,1.89,2.36,.095,0x737570],[0,.392,-.10,1.72,.085,.44,0x323333],
      ...[-.69,.69].map(x=>[x,.087,-.10,.095,.31,.40,0xb28c67])];
  }else if(key.startsWith('fold')){
    const tone=colors[key.slice(4).toLowerCase()];
    boxes=[0,1,2].map(i=>[0,.014+i*.060,0,.30-i*.004,.057,.296-i*.005,tone]);
  }else if(key==='back'){
    boxes=[...[0,1,2,3].map(i=>[(i-1.5)*.98,.22,.15,.965,2.26,.07,i%2?0xd1cfca:0xdcdad4]),
      [0,.036,.039,3.92,.152,.42,0xdcdad4],[0,.19,-.037,4.02,.044,.61,0xb28c67],
      [0,2.057,-.22,4.04,.030,.030,0xa7a8a6],[0,2.496,-.063,4.05,.093,.53,0xdcdad4]];
  }else if(key==='table'){
    boxes=[[0,.807,0,1.96,.043,.77,0xe2dfd7],
      ...[-.851,.851].flatMap(x=>[-.275,.275].map(z=>[x,.03,z,.045,.775,.045,0xa7a8a6])),
      ...[-.52,0,.52].map(x=>[x,.853,0,.048,x===0?.11:.19,.045,0xa7a8a6])];
  }else if(key==='fascia'){
    boxes=[[0,0,0,4.90,.45,.094,0x222324],...[0,1,2].map(i=>[.92-.108*i,.168,-.054,.083,.097+.070*i,.013,0xf3f2ea])];
  }else if(key==='bow'||key==='navy'){
    const geo=visor(key==='navy');proxies.set(key,geo);return geo;
  }else{
    const c=colors[key];
    // A tapered, front-facing silhouette retains the shoulder slope and hem at the shop entrance.
    const outline=[[-.085,.645],[-.192,.621],[-.289,.547],[-.321,.29],[-.313,.013],[-.246,.009],[-.207,.36],
      [-.197,.02],[.197,.02],[.207,.36],[.246,.009],[.313,.013],[.321,.29],[.289,.547],[.192,.621],[.085,.645]];
    const shape=new THREE.Shape(outline.map(([x,y])=>new THREE.Vector2(x,y)));
    const geo=new THREE.ExtrudeGeometry(shape,{depth:.104,bevelEnabled:false});
    geo.translate(0,0,-.052);
    const tint=new THREE.Color(c),arr=new Float32Array(geo.attributes.position.count*3);
    for(let i=0;i<arr.length;i+=3)tint.toArray(arr,i);
    geo.setAttribute('color',new THREE.BufferAttribute(arr,3));const dressed=distantKnit(geo,key);proxies.set(key,dressed);return dressed;
  }
  const geo=boxSilhouette(THREE,boxes);proxies.set(key,geo);return geo;
}

// Every colour uses the same decoded pullover geometry and its own textile. The draw mesh
// retains the glTF node's quantization transform even when it receives another material.
const shapes=new Map(),textures=new Map();
function once(cache,key,loader){
  if(!cache.has(key))cache.set(key,loader().catch(error=>{cache.delete(key);throw error;}));
  return cache.get(key);
}
function texture(file,linear){
  return once(textures,file,()=>new THREE.TextureLoader().loadAsync(new URL('./'+file,import.meta.url).href).then(map=>{
    map.flipY=false;map.colorSpace=linear?THREE.NoColorSpace:THREE.SRGBColorSpace;map.anisotropy=4;return map;
  }));
}
async function loadSurface(id){
  const key=id.split('/').at(-1),fold=key.startsWith('fold'),ink=fold?key.slice(4).toLowerCase():key;
  const cloth=knitColors.has(ink),shape=cloth?(fold?'folded':'sweater'):key;
  const [[source],map]=await Promise.all([
    once(shapes,shape,()=>loadArchitecture('../newcore-golf/'+shape+'.glb')),
    cloth?texture('knit-'+ink+'.webp',false):baked.has(key)?texture(key+'-light.webp',true):null,
  ]);
  const glossy=key==='navy'||key==='puffer';
  const mat=new THREE.MeshPhongMaterial({vertexColors:true,side:THREE.DoubleSide,map,
    specular:cloth?0x141517:glossy?0x323439:0x232422,shininess:cloth?9:glossy?28:19});
  if(baked.has(key))mat.color.setRGB(2,2,2);
  source.updateWorldMatrix(true,false);
  const mesh=new THREE.Mesh(source.geometry,mat);mesh.matrixAutoUpdate=false;mesh.matrix.copy(source.matrixWorld);return [mesh];
}

export function registerGolf(F,u,y,front,depth,width,bayView){
  const {K,P,Q,angle}=F,T=K.THREE;
  const paint=new T.MeshLambertMaterial({vertexColors:true,side:T.DoubleSide});
  K.zone({name:'아디다스골프',sub:'뉴코아 2관 · 골프웨어와 액세서리',floor:'5F',
    poly:Q(u-width/2,front,u+width/2,front+depth),y0:y-.035,y1:y+3.85,priority:2});
  const [sx,sz]=P(u,front-2.74);
  K.spawn({name:'2관 5F · 아디다스골프',x:sx,z:sz,y:y-.034,yaw:angle+Math.PI});
  function collider(x,d,w,length,h){
    K.phys.addPolyWalls(Q(u+x-w/2,front+d-length/2,u+x+w/2,front+d+length/2),y,y+h,.024,'newcore');
  }
  collider(2.56,5.43,.50,3.65,1.75);collider(-2.38,6.26,.80,2.00,2.55);
  collider(0,8.73,5.70,.07,3.45);
  for(const x of [-2.824,2.824])collider(x,4.42,.05,8.7,3.45);
  collider(0,3.78,1.96,.77,.86);collider(0,8.30,4.04,.64,2.6);
  for(const p of rows){
    const [label,w,l,h,range]=catalog[p.key],name=prefix+label,rot=p.angle??0;
    const v=front+p.d,[x,z]=P(u+p.x,v);
    const halfX=.5*(Math.abs(Math.cos(rot))*w+Math.abs(Math.sin(rot))*l);
    const halfZ=.5*(Math.abs(Math.cos(rot))*l+Math.abs(Math.sin(rot))*w);
    const backed=bayView(v,halfX,p.x),facet=p.key==='fascia';
    const [ox,oz]=P(u,front),c=Math.cos(angle),s=Math.sin(angle);
    const visible=(wx,eye,wz)=>{
      if(eye<y-.09||eye>y+4.30)return false;
      const along=(wx-ox)*s+(wz-oz)*c;
      if(along>8.82)return false;
      if(!facet)return backed(wx,eye,wz);
      const dx=wx-ox,dz=wz-oz,across=dx*c-dz*s;
      return along>-6.55 && (along<.09||Math.abs(across)<width/2)&&along<depth;
    };
    K.detail({name,floor:'5F',poly:Q(u+p.x-halfX,v-halfZ,u+p.x+halfX,v+halfZ),y0:y+p.h,y1:y+p.h+h,
      visibleFrom:visible},()=>{
      const bounds=[new T.Box3(new T.Vector3(-w/2,-.015,-l/2),new T.Vector3(w/2,h,l/2))];
      return placeSingleDetail(K,{name,file:'newcore-golf/'+p.key,loadSurface,angle:angle+rot,
        at:[x,y+p.h,z],fallback:distant(p.key),fallbackMaterial:paint,viewBounds:bounds,range,exitRange:range+1.7,
        floorTolerance:4.05,eyeHeight:h*.52,closeVisibleFrom:pos=>visible(pos.x,pos.y-relief(pos.x,pos.z),pos.z)});
    });
  }
}
