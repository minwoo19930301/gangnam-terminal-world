import {counterFinish,glazedSample} from './materials.js';
import * as THREE from 'three';
import {placeSingleDetail} from '../interior-architecture/single-detail.js';
import {boxSilhouette} from '../interior-architecture/box-silhouette.js';
import {loadArchitecture} from '../interior-architecture/model.js';
import {loadReflectionAtlas} from '../interior-architecture/reflection-atlas.js';
import {relief} from '../../../js/banpo_relief.js';
import {parts,prefix,rows} from './layout.js';

const bakes=new Set(['island','screen','bowls','wall','table','buffet','ceiling']);
const reflections=new Set(['fountain','chocolate','iron','batter','crest','screen']);
const colors={island:0x45544e,screen:0x6c7871,fountain:0x363936,chocolate:0x814227,iron:0x5a605e,batter:0xdfdacf,
  croffle:0xc9985a,bowls:0xe8dfcb,sauces:0xb2815c,crunch:0xa48364,berries:0xa25755,skewers:0xe3d5bc,wall:0xd4c7b2,
  crest:0x4b453a,table:0xbfae91,steak:0x7b6042};
function starter(T,key){
  let boxes;
  if(key==='paving')boxes=[[0,0,0,9.14,.013,8.48,0xc5b499]];
  else if(key==='ceiling')boxes=[[0,.12,0,9.14,.073,8.47,0x43463f]];
  else if(key==='clerestory')boxes=[[0,0,0,9.15,.55,.12,0x374339],[0,.093,-.071,9.05,.341,.014,0xb1c5b8]];
  else if(key==='buffet')boxes=[[0,.03,0,4.06,.083,1.56,0x363831],[0,.11,0,3.86,.758,1.43,0x454e45],[0,.868,0,4.10,.079,1.59,0x716b65]];
  else if(key==='dishes')boxes=[-1.25,-.51,.24,.99].map(x=>[x,.015,0,.46,.092,.44,0x413e36]);
  else if(key==='brassRail')boxes=[...[-.72,.72].map(d=>[0,.13,d,4.26,.035,.039,0xaa925f]),...[-2.13,2.13].map(x=>[x,.13,0,.036,.036,1.45,0xaa925f])];
  else if(key==='island')boxes=[[0,.02,0,6.16,.88,.88,0x3b4942],[0,.898,0,6.24,.079,1.03,0x6b655e]];
  else if(key==='screen')boxes=[[0,0,0,6.24,1.91,.069,0x74817b],[-.33,.20,-.082,2.68,.544,.04,0x262924],[1.99,.37,-.055,1.48,.94,.04,0xece6d9]];
  else if(key==='table')boxes=[[0,.691,0,.979,.058,.77,0xcbbd9f],...[.716,-.716].map(d=>[0,.397,d,.445,.078,.411,0x586661])];
  else if(key==='wall')boxes=[[0,0,0,4.26,3.01,.118,colors.wall],...[-1.42,-.82,.03,.83,1.45].map((x,i)=>[x,1.15+(i%2)*.73,-.09,.36,.37,.03,0x8a7d68])];
  else if(key==='bowls')boxes=[...Array.from({length:12},(_,i)=>[(i%4-1.5)*.295,.032,(Math.floor(i/4)-1)*.254,.264,.12,.218,colors.bowls])];
  else if(key==='iron')boxes=[[0,0,0,.89,.16,.54,0xa48256],...[-.213,.213].map(x=>[x,.15,.016,.337,.169,.35,0x474a46])];
  else if(key==='chocolate'||key==='fountain'){
    const geometry=new T.LatheGeometry((key==='fountain'?[[.155,0],[.173,.10],[.173,.28],[.13,.31],[.231,.38]]:
      [[.052,0],[.134,.18],[.058,.20],[.109,.315],[.046,.326],[.09,.438],[.037,.449],[.073,.53],[0,.549]])
      .map(([r,y])=>new T.Vector2(r,y)),16);
    geometry.computeVertexNormals();const c=new T.Color(colors[key]),attr=new Float32Array(geometry.attributes.position.count*3);
    for(let i=0;i<attr.length;i+=3)c.toArray(attr,i);geometry.setAttribute('color',new T.BufferAttribute(attr,3));return geometry;
  }else{
    const [,w,d,h]=parts[key];boxes=[[0,0,0,w*.86,h*.68,d*.78,colors[key]]];
  }
  return boxSilhouette(T,boxes);
}
function diffuseTexture(key){
  return new THREE.TextureLoader().loadAsync(new URL('./'+key+'-light.webp',import.meta.url).href).then(t=>{
    t.colorSpace=THREE.NoColorSpace;t.flipY=false;t.anisotropy=4;return t;
  });
}
const flow={value:0};
async function detail(file){
  const key=file.split('/').pop().slice(0,-4);
  const [[native],map,environment,atlas]=await Promise.all([loadArchitecture(file),bakes.has(key)?diffuseTexture(key):null,
    reflections.has(key)?loadReflectionAtlas(new URL('./counter-reflection.webp',import.meta.url).href):null,
    key==='chocolate'||key==='fountain'?glazedSample():null]);
  const shine=key==='chocolate'?88:key==='fountain'?76:key==='steak'?32:19;
  const mat=new THREE.MeshPhongMaterial({vertexColors:true,side:THREE.DoubleSide,map,envMap:environment,
    combine:THREE.MixOperation,reflectivity:key==='fountain'?.33:key==='chocolate'?.115:key==='screen'?.115:.10,
    shininess:shine,specular:key==='chocolate'?0x9b795f:key==='fountain'?0xbab8ad:0x3b3934});
  if(map)mat.color.setRGB(2,2,2);
  if(atlas||['island','buffet','screen'].includes(key)){
    mat.onBeforeCompile=shader=>counterFinish(shader,key,atlas,flow);
    mat.customProgramCacheKey=()=>key;
  }
  native.updateWorldMatrix(true,false);const surface=new THREE.Mesh(native.geometry,mat);
  surface.matrixAutoUpdate=false;surface.matrix.copy(native.matrixWorld);return [surface];
}

export function registerAshleyDessert(F,u,y,front,depth,width,bayView){
  const {K,P,Q}=F,T=K.THREE,rot=F.angle+Math.PI;
  const paint=new T.MeshLambertMaterial({vertexColors:true,side:T.DoubleSide});
  const world=(x,d)=>P(u-x,front-d);
  const [ox,oz]=world(0,0),c=Math.cos(rot),s=Math.sin(rot);
  const local=(x,z)=>[(x-ox)*c-(z-oz)*s,(x-ox)*s+(z-oz)*c];
  const zone=Q(u-width*.5,front-depth,u+width*.5,front);
  K.zone({name:'애슐리퀸즈',sub:'뉴코아 강남점 1관 · 그릴과 디저트',floor:'5F',poly:zone,y0:y-.045,y1:y+3.65,priority:2});
  function box(x,d,w,l,h){
    K.phys.addPolyWalls(Q(u-x-w/2,front-d-l/2,u-x+w/2,front-d+l/2),y,y+h,.021,'newcore');
  }
  box(1.68,7.85,6.20,.97,.97);box(0,3.1,3.90,1.43,.96);
  box(-5.65,2.68,.97,.76,.745);for(const d of [-.716,.716])box(-5.65,2.68+d,.448,.435,.86);
  const entry=world(.08,-2.75);K.spawn({name:'1관 5F · 애슐리퀸즈 디저트',x:entry[0],z:entry[1],y:y-.034,yaw:rot+Math.PI});
  for(const {key,x,d,h} of rows){
    const [label,w,l,height,range]=parts[key],name=prefix+label,[wx,wz]=world(x,d);
    const backed=bayView(front-d,w*.53,-x);
    const visible=(cx,eye,cz)=>{
      if(eye<y-.09||eye>y+3.90||!backed(cx,eye,cz))return false;
      const [px,pd]=local(cx,cz);
      if(pd>depth+.03||pd>.08&&Math.abs(px)>width*.5+.04)return false;
      if(key==='chocolate'||key==='crunch'||key==='berries'||key==='croffle'||key==='steak'){
        if(pd>d+.60&&eye<y+1.85)return false;
      }
      return true;
    };
    const area=[world(x-w/2,d-l/2),world(x+w/2,d-l/2),world(x+w/2,d+l/2),world(x-w/2,d+l/2)];
    K.detail({name,floor:'5F',poly:area,y0:y+h,y1:y+h+height,visibleFrom:visible},()=>{
      const proxy=starter(T,key);
      const root=placeSingleDetail(K,{name,file:'../newcore-dessert/'+key+'.glb',at:[wx,y+h,wz],angle:rot,
        fallback:proxy,fallbackMaterial:paint,loadSurface:detail,range,exitRange:range+1.8,eyeHeight:height/2,floorTolerance:3.65,
        viewBounds:[new T.Box3(new T.Vector3(-w/2,-.02,-l/2),new T.Vector3(w/2,height+.02,l/2))],
        closeVisibleFrom:e=>visible(e.x,e.y-relief(e.x,e.z),e.z)});
      if(key==='chocolate'){
        const o=root.children[0],select=o.onBeforeRender;
        o.onBeforeRender=(...args)=>{select(...args);if(o.geometry!==proxy)flow.value=performance.now()*.001;};
      }
    });
  }
}
