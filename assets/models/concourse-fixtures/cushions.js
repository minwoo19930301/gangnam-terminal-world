// Every three-column bay shares a shape with bays that stock the same three fabric runs.
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {loadFixtureScene} from '../onebailey/load.js';
import {boxSilhouette} from '../interior-architecture/box-silhouette.js';
import {relief} from '../../../js/banpo_relief.js';

const names=['CushionLinen','CushionSage','CushionRose','CushionIvory'];
const tones=[0xdabf91,0x92ac96,0xc990a1,0xe5e1d3];
const coarse=new Map(),fine=new Map(),layouts=new Map();
let source,pending,retryAt=0,paint;
function shell(T,tone){
  // Same inflated 4.5-exponent contour as the Blender pattern. At aisle distance
  // the 3 mm raised embroidery has subpixel width, but the stuffed profile is visible.
  const slices=6,segments=16,positions=[0,.204,.174],indices=[],colors=[];
  for(let j=1;j<slices;j++){
    const a=j*Math.PI/slices;
    for(let i=0;i<segments;i++){
      const t=i*2*Math.PI/segments,cs=Math.cos(t),sn=Math.sin(t);
      positions.push(.256*Math.sign(cs)*Math.pow(Math.abs(cs),2/4.5)*Math.sin(a),
        .204+.204*Math.sign(sn)*Math.pow(Math.abs(sn),2/4.5)*Math.sin(a),.174*Math.cos(a));
    }
  }
  const back=positions.length/3;positions.push(0,.204,-.174);
  for(let i=0;i<segments;i++){
    const k=(i+1)%segments;
    indices.push(0,1+i,1+k);
    for(let j=0;j<slices-2;j++){
      const p=1+j*segments;
      indices.push(p+i,p+i+segments,p+k+segments,p+i,p+k+segments,p+k);
    }
    const p=1+(slices-2)*segments;indices.push(p+i,back,p+k);
  }
  const col=new T.Color(tone);
  for(let i=0;i<positions.length;i+=3)colors.push(col.r,col.g,col.b);
  const geometry=new T.BufferGeometry();
  geometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));
  geometry.setAttribute('color',new T.Float32BufferAttribute(colors,3));geometry.setIndex(indices);geometry.computeVertexNormals();
  return geometry;
}
function shelfFrame(T){
  const parts=[];
  for(const x of [-.932,.932])parts.push([x,.013,-.195,.037,1.69,.052,0x999e98],
    [x,0,-.015,.062,.144,.455,0x999e98]);
  for(let j=0;j<3;j++){
    const y=.254+j*.55;
    parts.push([0,y-.026,-.012,1.946,.052,.48,0xe5e4dd],
      [0,y-.024,.231,1.94,.047,.017,0xbaa387],[0,y+.108,-.205,1.9,.047,.031,0xe5e4dd]);
  }
  const geometry=boxSilhouette(T,parts);
  geometry.deleteAttribute('uv');
  return geometry;
}
function layout(starts){
  const parts=[{shape:'CushionRack',translation:[0,0,0]}];
  for(let column=0;column<3;column++)for(let tier=0;tier<3;tier++){
    parts.push({shape:names[(starts[column]+tier)%4],translation:[(column-1)*.65,.28+tier*.55,0]});
  }
  // These are the very translations used for both game meshes and the linked .blend placements.
  return parts.map(p=>({...p,subject:'다이소 패브릭 · '+p.shape}));
}
function assemble(shapes,components){
  const copy=components.map(p=>shapes[p.shape].clone().translate(...p.translation));
  const merged=mergeGeometries(copy);
  copy.forEach(g=>g.dispose());merged.computeBoundingSphere();
  return merged;
}
function readCushions(){
  if(pending||source||performance.now()<retryAt)return;
  pending=loadFixtureScene(new URL('./cushions.glb',import.meta.url)).then(scene=>{
    function shape(name){
      let geometry;
      scene.getObjectByName(name).traverse(o=>{if(o.isMesh)geometry=o.geometry.clone().applyMatrix4(o.matrixWorld);});
      return geometry;
    }
    source=Object.fromEntries(['CushionRack',...names].map(name=>[name,shape(name)]));
  }).catch(()=>{retryAt=performance.now()+10000;}).finally(()=>{pending=null;});
}
let coarseShapes;
export function placeCushionBay(K,at,angle,starts){
  const T=K.THREE,key=starts.join('');
  coarseShapes??={CushionRack:shelfFrame(T),...Object.fromEntries(names.map((name,i)=>[name,shell(T,tones[i])]))};
  if(!layouts.has(key))layouts.set(key,layout(starts));
  const components=layouts.get(key);
  if(!coarse.has(key))coarse.set(key,assemble(coarseShapes,components));
  paint??=new T.MeshLambertMaterial({vertexColors:true,side:T.DoubleSide});
  const low=coarse.get(key),mesh=new T.Mesh(low,paint),[x,y,z]=at;
  mesh.position.set(x,y,z);mesh.rotation.y=angle;mesh.name='다이소 쿠션 진열 · '+key;
  mesh.userData.nativeComponents=components;
  const floor=y+relief(x,z),nx=Math.sin(angle),nz=Math.cos(angle);
  mesh.onBeforeRender=(_renderer,_scene,camera)=>{
    const dx=camera.position.x-x,dz=camera.position.z-z;
    const width=Math.max(0,Math.abs(dx*nz-dz*nx)-.974),front=dx*nx+dz*nz;
    const limit=mesh.geometry===low?6.1:7.2;
    const close=front>-.14 && Math.abs(camera.position.y-floor-1.12)<2.25 && width*width+front*front<limit*limit;
    if(close){
      if(!source)readCushions();
      else if(!fine.has(key))fine.set(key,assemble(source,components));
    }
    mesh.geometry=close&&fine.has(key)?fine.get(key):low;
  };
  return K.addMesh(mesh);
}
