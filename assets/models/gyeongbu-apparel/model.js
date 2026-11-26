import {loadFixtureScene} from '../onebailey/load.js';
import {relief} from '../../../js/banpo_relief.js';

const coarse = new WeakMap();
const libraries = new Map();
let cloth;

// The old market and new shop files use different quantized node transforms.
// Keep each source mesh intact for other floors and bake a metric copy for this bay.
function metric(T,part) {
  const g=part.geometry.clone(), pos=g.attributes.position, xyz=new Float32Array(pos.count*3);
  const point=new T.Vector3();
  for(let i=0;i<pos.count;i++)point.fromBufferAttribute(pos,i).applyMatrix4(part.matrixWorld).toArray(xyz,3*i);
  g.setAttribute('position',new T.BufferAttribute(xyz,3));
  g.computeVertexNormals();g.computeBoundingSphere();
  return g;
}

function request(T,file,state) {
  if(state.mesh || state.loading || performance.now()<state.retryAt)return;
  state.loading=loadFixtureScene(state.url).then(scene=>{
    const part=scene.getObjectByName(file);
    state.mesh=metric(T,part);
    state.mesh.name='근접 상품 진열 · '+file;
  }).catch(()=>{state.retryAt=performance.now()+10000;}).finally(()=>{state.loading=null;});
}

export function placeUpperShowroom(K,library,key,source,x,y,z,yaw) {
  const file=source.slice(source.lastIndexOf('/')+1);
  const T=K.THREE, root=library.getObjectByName(key);
  let fallback=coarse.get(root);
  if(!fallback){
    root.traverse(p=>{if(p.isMesh)fallback=metric(T,p);});
    fallback.name='기본 상품 진열 · '+key;
    coarse.set(root,fallback);
  }
  if(!libraries.has(file))libraries.set(file,{retryAt:0,url:new URL('../'+source+'.glb',import.meta.url)});
  const state=libraries.get(file);
  cloth??=new T.MeshLambertMaterial({vertexColors:true,side:T.DoubleSide});
  const box=new T.InstancedMesh(fallback,cloth,1),pose=new T.Object3D();
  pose.position.set(x,y,z);pose.rotation.y=yaw;pose.updateMatrix();
  box.setMatrixAt(0,pose.matrix);
  box.computeBoundingSphere();
  box.boundingSphere.radius+=.15;
  box.name='경부선 도매 점포 · '+key;
  const height=y+relief(x,z);
  box.onBeforeRender=(_renderer,_scene,camera)=>{
    const range=state.mesh && box.geometry===state.mesh ? 16 : 12;
    const p=camera.position;
    const near=p.y>height-.35 && p.y<height+3.75 && (p.x-x)**2+(p.z-z)**2<range*range;
    if(near&&!state.mesh)request(T,file,state);
    box.geometry=near&&state.mesh?state.mesh:fallback;
  };
  K.addMesh(box);
}
