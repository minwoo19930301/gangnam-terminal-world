import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {placeSingleDetail} from '../interior-architecture/single-detail.js';
import {boxSilhouette} from '../interior-architecture/box-silhouette.js';
import {loadArchitecture} from '../interior-architecture/model.js';
import {loadReflectionAtlas} from '../interior-architecture/reflection-atlas.js';
import {relief} from '../../../js/banpo_relief.js';
import {floorOptics} from './stone-optics.js';
import {beads,center,rows,parts,prefix} from './layout.js';

export const upperWell=[-27.10,44.24,-20.22,52.78];
const ivory=['#f0e7d1','#efe3bf','#ddc9a2','#ebdbc1','#e8d6aa','#f6ebd8','#d7c29e','#e1cfad','#ebdfc6','#d0b895','#ede3cc'];
const shared=new Map();
function proxy(k){
  if(shared.has(k))return shared.get(k);
  let g;
  if(beads[k]){
    const unit=new THREE.SphereGeometry(1,7,4),up=new THREE.Vector3(0,1,0);
    g=mergeGeometries(beads[k].map(({x,d,z,rx,ry,rz,axis,variant})=>{
      const b=unit.clone(),q=new THREE.Quaternion().setFromUnitVectors(up,new THREE.Vector3(axis[0],axis[2],axis[1]));
      b.scale(rx,rz,ry).applyQuaternion(q).translate(x,z,d);
      const col=new THREE.Color(ivory[variant]),values=new Float32Array(b.attributes.position.count*3);
      for(let i=0;i<values.length;i+=3){col.toArray(values,i);}
      b.setAttribute('color',new THREE.BufferAttribute(values,3));return b;
    }));unit.dispose();
  }else if(k==='leaves'||k==='golden'){
    const m=[],unit=new THREE.IcosahedronGeometry(1,0),N=k==='leaves'?70:22;
    for(let i=0;i<N;i++){
      const a=i*2.39996,r=.21+.91*Math.sqrt(i/N),size=k==='leaves'?.20:.077,h=2.31+.91*(1-r/1.2)+.26*Math.sin(i*.68);
      const geo=unit.clone().scale(size*1.23,size*.78,size).rotateZ(i*.89).translate(r*Math.cos(a),h,r*Math.sin(a));
      const C=new THREE.Color(k==='leaves'?[0x566b3f,0x667749,0x758349][i%3]:0xcba536),v=new Float32Array(geo.attributes.position.count*3);
      for(let j=0;j<v.length;j+=3)C.toArray(v,j);geo.setAttribute('color',new THREE.BufferAttribute(v,3));m.push(geo);
    }
    g=mergeGeometries(m);m.forEach(x=>x.dispose());unit.dispose();
  }else if(['dais','column','columnShoe'].includes(k)){
    const [r,t,h,tone]=k==='dais'?[1.90,1.87,.318,0xc1a782]:k==='column'?[.572,.572,10.95,0x604638]:[.604,.662,.17,0x8d8379];
    g=new THREE.CylinderGeometry(r,t,h,k==='dais'?40:24).translate(0,h/2+.005,0);
    const col=new THREE.Color(tone),values=new Float32Array(g.attributes.position.count*3);
    for(let i=0;i<values.length;i+=3)col.toArray(values,i);
    g.setAttribute('color',new THREE.BufferAttribute(values,3));
  }else{
    const boxes={dais:[],vessel:[[0,.75,0,1.23,.065,1.23,0x3a3230],[0,.83,0,.53,.46,.53,0x302c2a],[0,.04,0,.35,.70,.35,0x453832]],
      branches:[[0,1.22,0,.073,1.57,.073,0x665939]],
      leaves:[],golden:[],paving:[[0,0,0,4.37,.014,6.48,0xc6b49b]],fins:[[0,.014,0,1.69,1.54,.071,0x71533e]],coats:[[0,.045,.048,.39,.87,.17,0x393a40]],
      cords:[...[-2.19,2.19].flatMap(x=>[-2.25,0,2.25].map(z=>[x,0,z,.014,.72,.014,0x9c967f])),...[-2.25,2.25].map(z=>[0,.69,z,4.38,.006,.006,0xa79b84])],screen:[[-.25,.078,-.2,.21,3.68,1.25,0x78513e],[.02,.078,.07,.26,3.68,1.28,0x835945],[.30,.078,.28,.11,3.68,1.03,0x7e5141]],
      trolley:[[0,.15,0,.82,.105,1.04,0x705b47],...[-.35,.35].flatMap(x=>[-.42,.42].map(d=>[x,.24,d,.033,1.27,.033,0xb69a6f])),[0,1.75,0,.038,.031,.86,0xb69a6f]],
      bags:[[-.187,.026,.017,.335,.69,.578,0x444b4b],[.172,.026,.065,.303,.54,.53,0x806957]],
      handles:[[-.01,.10,0,.435,.028,.36,0x826348]]};
    g=boxSilhouette(THREE,boxes[k]);
  }
  shared.set(k,g);return g;
}
const diffuse=new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide});
const baked=new Set(['dais','vessel','screen','trolley','columnShoe']);
const pU=-29.7+7.3*.95,pV=48.5,probe=new THREE.Vector3(-23.6925+.933337*pU+.359001*pV,0,99.5825-.359001*pU+.933337*pV);
const probeGround=relief(probe.x,probe.z);
const polished=new Set(['cords','trolley','handles','dais','screen','paving','fins','vessel']);
async function detail(file){
  const k=file.split('/').pop().slice(0,-4),useGlass=!!beads[k];
  const [[obj],env,map]=await Promise.all([loadArchitecture(file),(useGlass||polished.has(k))?loadReflectionAtlas(new URL('./lobby-reflection.webp',import.meta.url).href):null,
    baked.has(k)?new THREE.TextureLoader().loadAsync(new URL('./'+k+'-light.webp',import.meta.url).href).then(t=>{t.colorSpace=THREE.NoColorSpace;t.flipY=false;t.anisotropy=4;return t;}):null]);
  const mat=new THREE.MeshPhongMaterial({vertexColors:true,side:THREE.DoubleSide,map,envMap:env,combine:THREE.MixOperation,
    reflectivity:useGlass?.23:k==='trolley'||k==='cords'?.34:k==='dais'?.038:k==='paving'?.27:.065,shininess:useGlass?98:k==='trolley'?85:30,
    specular:useGlass?0xe4d9bf:k==='trolley'||k==='cords'?0xb5a282:0x504638});
  if(map)mat.color.setRGB(2,2,2);
  if(k==='paving'){mat.onBeforeCompile=s=>floorOptics(s,probe,probeGround);mat.customProgramCacheKey=()=>'polished-hotel-stone';}
  if(useGlass){
    // Milk glass scatters light in its core and reflects the walnut lattice and warm wall strips at grazing angles.
    mat.onBeforeCompile=shader=>{shader.fragmentShader=shader.fragmentShader.replace('#include <envmap_fragment>',`#include <envmap_fragment>
      float facing=clamp(dot(normal,normalize(vViewPosition)),0.,1.);
      float fres=pow(1.-facing,3.);
      vec3 viewDir=normalize(vViewPosition);
      vec3 refl=inverseTransformDirection(reflect(-viewDir,normal),viewMatrix);
      vec3 room=textureCube(envMap,vec3(flipEnvMap*refl.x,refl.yz)).rgb;
      outgoingLight=mix(outgoingLight,room,.12+.35*fres);
      outgoingLight+=diffuseColor.rgb*(.055+.10*pow(facing,2.));
    `);};mat.customProgramCacheKey=()=>'arrival-opaline-glass';
  }
  obj.updateWorldMatrix(true,false);const surface=new THREE.Mesh(obj.geometry,mat);surface.matrix.copy(obj.matrixWorld);surface.matrixAutoUpdate=false;return [surface];
}
export function registerArrival(K,P,RECT,R){
  const pos=P(center.u,center.v),c=Math.cos(R),s=Math.sin(R);
  function local(x,z){const dx=x-pos[0],dz=z-pos[1];return [center.u+c*dx-s*dz,center.v+s*dx+c*dz];}
  const inside=(u,v,b)=>u>=b[0]&&u<=b[2]&&v>=b[1]&&v<=b[3];
  const upperSight=[upperWell[0]-.23,upperWell[1]-.24,upperWell[2]+.23,upperWell[3]+.24];
  for(const row of rows){
    const {key,u,v,y,angle=0}=row,[label,w,d,h,range]=parts[key],name=prefix+label;
    const tall=!!beads[key],baseWorld=P(u,v);
    function visible(x,eye,z){
      if(eye<-.45||eye>15.88)return false;
      const [cu,cv]=local(x,z);
      if(eye>11.17)return (tall||key==='fins')&&inside(cu,cv,upperSight);
      if(eye>5.78)return (tall||key==='dais'||key==='fins'||key==='paving')&&inside(cu,cv,[-31.75,41.86,-13.89,55.14]);
      return cv>40&&cv<60.65&&cu>-33.27&&cu<1.8;
    }
    if(key==='columnShoe'){
      const foot=Array.from({length:28},(_,i)=>P(u+.64*(row.widthScale??1)*Math.cos(i*Math.PI/14),v+.64*(row.widthScale??1)*Math.sin(i*Math.PI/14)));
      K.phys.addPolyWalls(foot,0,11.12,.015,'jwmarriott');
    }
    if(key==='dais'){
      const foot=Array.from({length:48},(_,i)=>P(u+1.91*Math.cos(i*Math.PI/24),v+1.91*Math.sin(i*Math.PI/24)));
      K.phys.addPolyWalls(foot,0,.325,.012,'jwmarriott');
    }else if(key==='trolley')K.phys.addPolyWalls(RECT(u-w/2,v-d/2,u+w/2,v+d/2),0,1.18,.018,'jwmarriott');
    const bounds=new THREE.Box3(new THREE.Vector3(-w/2,-.15,-d/2),new THREE.Vector3(w/2,h+.25,d/2));
    K.detail({name,floor:'1F',poly:RECT(u-w/2,v-d/2,u+w/2,v+d/2),y0:tall||key==='fins'?0:y-.1,y1:tall||key==='fins'?15.56:y+h+.25,visibleFrom:visible},()=>{
      const root=placeSingleDetail(K,{name,file:'../jw-arrival/'+key+'.glb',at:[baseWorld[0],y,baseWorld[1]],angle:R+angle,
        fallback:proxy(key),fallbackMaterial:diffuse,loadSurface:detail,range,exitRange:range+1.7,eyeHeight:h*.47,
        floorTolerance:tall||key==='fins'?17:5.7,viewBounds:[bounds],closeVisibleFrom:eye=>visible(eye.x,eye.y-relief(eye.x,eye.z),eye.z)});
      if(row.widthScale)root.scale.set(row.widthScale,1,row.widthScale);
    });
  }
}
