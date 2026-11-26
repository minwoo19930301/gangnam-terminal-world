import {loadFixtureScene} from '../onebailey/load.js';

import * as front from './arrival-front.js';

let source;
function loadSurface(T){
  source??=loadFixtureScene(new URL('./entrance.glb',import.meta.url)).then(scene=>{
    const part=scene.getObjectByName('Surface'),geo=part.geometry;
    // Bake the meshopt decode matrix in float space once, shared across area reloads.
    for(const name of ['position','normal']){
      const a=geo.getAttribute(name);
      if(!a.normalized)continue;
      const values=new Float32Array(a.count*3);
      for(let i=0;i<a.count;i++)values.set([a.getX(i),a.getY(i),a.getZ(i)],i*3);
      geo.setAttribute(name,new T.Float32BufferAttribute(values,3));
    }
    return geo.applyMatrix4(part.matrixWorld);
  }).catch(error=>{source=null;throw error;});
  return source;
}

// Resolve the tiny synchronous first-view mesh before any renderer can see it.
// Older browsers can use Three's bundled decompressor without adding a common dependency.
const compressed=Uint8Array.from(atob(front.packed),c=>c.charCodeAt(0));
const bytes=typeof DecompressionStream==='function'
  ? new Uint8Array(await new Response(new Blob([compressed]).stream().pipeThrough(new DecompressionStream('deflate'))).arrayBuffer())
  : (await import('three/addons/libs/fflate.module.js')).unzlibSync(compressed);
let arrivalGeometry;
function entranceFront(T){
  if(arrivalGeometry)return arrivalGeometry;
  let cursor=0;
  function unsigned(){
    let n=0,scale=1,b;
    do{b=bytes[cursor++];n+=(b&127)*scale;scale*=128;}while(b&128);
    return n;
  }
  function readDeltas(target,offset,stride,unit){
    let value=0;
    for(let i=offset;i<target.length;i+=stride){
      const n=unsigned();
      value+=n&1?-(n+1)/2:n/2;
      target[i]=value*unit;
    }
  }
  const vertices=unsigned(),entries=unsigned();
  const positions=new Float32Array(vertices*3),colors=new Uint8Array(vertices*3),indices=new Uint16Array(entries);
  for(let axis=0;axis<3;axis++)readDeltas(positions,axis,3,.001);
  for(let i=0;i<vertices;i++)colors.set(front.palette[bytes[cursor++]],i*3);
  readDeltas(indices,0,1,1);
  const geometry=new T.BufferGeometry();
  geometry.setAttribute('position',new T.BufferAttribute(positions,3));
  geometry.setAttribute('color',new T.BufferAttribute(colors,3,true));
  geometry.setIndex(new T.BufferAttribute(indices,1));
  geometry.computeVertexNormals();
  geometry.boundingSphere=new T.Sphere(new T.Vector3(0,2,-1.95),7.0);
  return arrivalGeometry=geometry;
}

export function cinemaEntrance(K,x,y,z,angle){
  const T=K.THREE,proxy=entranceFront(T);
  const material=new T.MeshPhongMaterial({vertexColors:true,side:T.DoubleSide,specular:0x28241e,shininess:33});
  // The blue-white channel letters and golden bowl liners are self-lit surfaces.
  material.onBeforeCompile=shader=>{
    shader.fragmentShader=shader.fragmentShader.replace('#include <emissivemap_fragment>',`#include <emissivemap_fragment>
    float channel=smoothstep(.62,.81,vColor.b)*smoothstep(.035,.12,vColor.b-vColor.r);
    float lamp=smoothstep(.78,.94,vColor.r)*smoothstep(.18,.36,vColor.r-vColor.b);
    totalEmissiveRadiance += channel*vec3(.34,.62,.81)+lamp*vec3(.46,.32,.12);`);
  };
  const mesh=new T.Mesh(proxy,material);
  mesh.name='메가박스 센트럴 · 부티크 아치 입면';
  mesh.position.set(x,y,z);
  mesh.rotation.y=angle;
  mesh.userData.split=true;
  const center=new T.Vector3(),frustum=new T.Frustum(),clip=new T.Matrix4();
  // The wide, shallow portal's bounding sphere surrounds a shopper just past it.
  // Test the box in portal space before fetching detail behind their camera.
  const bounds=new T.Box3(new T.Vector3(-6.1,0,-4.9),new T.Vector3(6.1,4.45,.5));
  let detailed=false,surface,pending=false,retryAt=0;
  mesh.onBeforeRender=(_renderer,_scene,camera)=>{
    center.set(0,2,0).applyMatrix4(mesh.matrixWorld);
    clip.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse).multiply(mesh.matrixWorld);
    const range=detailed?26:23;
    const near=camera.position.distanceToSquared(center)<range*range&&frustum.setFromProjectionMatrix(clip).intersectsBox(bounds);
    if(near&&!surface&&!pending&&performance.now()>=retryAt){
      pending=true;
      loadSurface(T).then(g=>{surface=g;}).catch(()=>{retryAt=performance.now()+10000;}).finally(()=>{pending=false;});
    }
    if(surface&&near!==detailed){
      mesh.geometry=near?surface:proxy;
      detailed=near;
    }
  };
  K.addMesh(mesh);
}
