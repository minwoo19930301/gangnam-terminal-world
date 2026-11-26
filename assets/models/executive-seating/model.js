import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {placeSingleDetail} from '../interior-architecture/single-detail.js';
import {loadReflectionAtlas} from '../interior-architecture/reflection-atlas.js';
import {loadArchitecture} from '../interior-architecture/model.js';
import {relief} from '../../../js/banpo_relief.js';
import {prefix,tables,types,seatType} from './layout.js';

let silhouette;
const farMaterial=new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide});
function roughSeat(){
  if(silhouette)return silhouette;
  const pieces=[],dark=0x443e34,colour=0xd9cdb9;
  function add(geom,c){
    const g=geom.index?geom.toNonIndexed():geom;g.deleteAttribute('uv');
    if(!g.getAttribute('normal'))g.computeVertexNormals();
    const shade=new THREE.Color(c),vals=new Float32Array(g.attributes.position.count*3);
    for(let i=0;i<vals.length;i+=3)shade.toArray(vals,i);
    g.setAttribute('color',new THREE.BufferAttribute(vals,3));pieces.push(g);
  }
  add(new THREE.CylinderGeometry(.326,.30,.089,12).scale(1,1,.88).translate(0,.39,.027),colour);
  const p=[];
  function v(a,top,inner){
    const mid=Math.cos(a*Math.PI/4.58)**1.55;
    return [Math.sin(a)*(.38-(inner?.056:0)),-.003+ (top?.586+.291*mid:.388),-Math.cos(a)*(.32-(inner?.057:0))-.027];
  }
  for(let i=0;i<14;i++){
    const a=-2.29+i*4.58/14,b=a+4.58/14;
    for(const inner of [false,true]){const c=[v(a,false,inner),v(b,false,inner),v(b,true,inner),v(a,true,inner)];for(const j of inner?[0,2,1,0,3,2]:[0,1,2,0,2,3])p.push(...c[j]);}
    const lip=[v(a,true,false),v(b,true,false),v(b,true,true),v(a,true,true)];for(const j of [0,1,2,0,2,3])p.push(...lip[j]);
  }
  const shell=new THREE.BufferGeometry();shell.setAttribute('position',new THREE.Float32BufferAttribute(p,3));add(shell,colour);
  for(const sx of [-1,1])for(const sz of [-1,1])add(new THREE.CylinderGeometry(.019,.014,.365,5).translate(sx*.25,.184,sz*.22),dark);
  const geometry=mergeGeometries(pieces);for(const g of pieces)g.dispose();silhouette=geometry;return geometry;
}
async function load(file){
  const k=file.split('/').at(-1).slice(0,-4),[[src],map]=await Promise.all([loadArchitecture(file),new THREE.TextureLoader().loadAsync(new URL('./'+k+'-light.webp',import.meta.url).href)]);
  map.colorSpace=THREE.NoColorSpace;map.flipY=false;map.anisotropy=4;
  const env=k==='table'?await loadReflectionAtlas(new URL('../executive-service/lounge-reflection.webp',import.meta.url).href):null;
  const mat=new THREE.MeshPhongMaterial({vertexColors:true,side:THREE.DoubleSide,map,envMap:env,combine:THREE.MixOperation,reflectivity:.068,shininess:k==='table'?76:34,specular:0x5d5245});mat.color.setRGB(2,2,2);
  src.updateWorldMatrix(true,false);const o=new THREE.Mesh(src.geometry,mat);o.matrixAutoUpdate=false;o.matrix.copy(src.matrixWorld);return[o];
}
let tableProxy;
function roughTable(){
  if(tableProxy)return tableProxy;
  const parts=[];
  function add(g,col){
    const mesh=g.toNonIndexed(),c=new THREE.Color(col),a=new Float32Array(mesh.attributes.position.count*3);
    for(let i=0;i<a.length;i+=3)c.toArray(a,i);
    mesh.setAttribute('color',new THREE.BufferAttribute(a,3));parts.push(mesh);g.dispose();
  }
  add(new THREE.CylinderGeometry(.67,.66,.034,24).translate(0,.721,0),0xebe8db);
  add(new THREE.CylinderGeometry(.64,.63,.116,20).translate(0,.65,0),0x37332e);
  for(const x of [-.365,.365])for(const z of [-.365,.365])add(new THREE.BoxGeometry(.05,.62,.048).translate(x,.32,z),0x37332e);
  tableProxy=mergeGeometries(parts);for(const g of parts)g.dispose();return tableProxy;
}
export function registerExecutiveSeats(K,P,RECT,angle){
  const [ox,oz]=P(0,0),co=Math.cos(angle),si=Math.sin(angle);
  const room=(x,eye,z)=>{
    if(eye<40.90||eye>44.69)return false;
    const u=(x-ox)*co-(z-oz)*si,v=(x-ox)*si+(z-oz)*co;
    return u> -7.9 && u<15.9 && v>6.0 && v<24.25;
  };
  for(const [i,[u,v]] of tables.entries()){
    const key=seatType(i),name=prefix+types[key],at=P(u,v),poly=RECT(u-1.55,v-1.52,u+1.55,v+.4);
    const bounds=[[-1.12,0],[1.12,0]];if(key.startsWith('trio'))bounds.push([0,-1.10]);
    const base=new THREE.Color(0xd9cdb9);
    const instances=bounds.map(([x,z],j)=>{
      const matrix=new THREE.Matrix4().makeRotationY(j===0?Math.PI/2:j===1?-Math.PI/2:0);matrix.setPosition(x,0,z);
      const color=new THREE.Color(j===2?0xd0c3ae:(j===0)===key.endsWith('A')?0xb1a18d:0xd9cdb9);
      color.setRGB(color.r/base.r,color.g/base.g,color.b/base.b);
      return {matrix,color};
    });
    const tableName=prefix+'아이보리 원탁과 검은 에이프런',rad=i%3?.67:.77;
    K.detail({name:tableName,floor:'9F',poly:RECT(u-rad,v-rad,u+rad,v+rad),y0:41,y1:41.75,visibleFrom:room},()=>{
      const root=placeSingleDetail(K,{name:tableName,file:'../executive-seating/table.glb',at:[at[0],41,at[1]],angle,fallback:roughTable(),fallbackMaterial:farMaterial,
        loadSurface:load,range:5.7,exitRange:7,eyeHeight:.49,floorTolerance:3.1,closeVisibleFrom:e=>room(e.x,e.y-relief(e.x,e.z),e.z)});
      root.scale.set(rad/.67,1,rad/.67);
    });
    K.detail({name,floor:'9F',poly,y0:41,y1:41.93,visibleFrom:room},()=>{
      placeSingleDetail(K,{name,file:'../executive-seating/chair.glb',at:[at[0],41,at[1]],angle,instances,fallback:roughSeat(),fallbackMaterial:farMaterial,
        loadSurface:load,range:6.0,exitRange:7.4,eyeHeight:.49,floorTolerance:3.1,
        viewBounds:bounds.map(([x,z])=>new THREE.Box3(new THREE.Vector3(x-.40,.00,z-.38),new THREE.Vector3(x+.40,.93,z+.38))),
        closeVisibleFrom:e=>room(e.x,e.y-relief(e.x,e.z),e.z)});
    });
  }
}
