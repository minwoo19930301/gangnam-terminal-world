import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {loadFixtureScene} from '../onebailey/load.js';

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

export function cinemaEntrance(K,x,y,z,angle){
  const T=K.THREE,parts=[];
  function piece(geometry,x,y,z,color){
    geometry.translate(x,y,z);
    const paint=new T.Color(color),colors=new Float32Array(geometry.attributes.position.count*3);
    for(let i=0;i<colors.length;i+=3)paint.toArray(colors,i);
    geometry.setAttribute('color',new T.Float32BufferAttribute(colors,3));
    parts.push(geometry);
  }
  for(const side of [-1,1])piece(new T.BoxGeometry(4.18,4.38,.21),side*3.96,2.19,-.16,0xcac0b1);
  piece(new T.BoxGeometry(3.76,1.85,.19),0,3.465,-.13,0xb3bcb2);
  piece(new T.BoxGeometry(12.1,.11,.24),0,2.465,.03,0x303436);
  const proxy=mergeGeometries(parts);
  parts.forEach(g=>g.dispose());
  const material=new T.MeshPhongMaterial({vertexColors:true,side:T.DoubleSide,specular:0x28241e,shininess:33});
  // The blue-white channel letters and golden bowl liners are self-lit surfaces.
  material.onBeforeCompile=shader=>{
    shader.fragmentShader=shader.fragmentShader.replace('#include <emissivemap_fragment>',`#include <emissivemap_fragment>
    float channel=smoothstep(.62,.81,vColor.b)*smoothstep(.035,.12,vColor.b-vColor.r);
    float lamp=smoothstep(.78,.94,vColor.r)*smoothstep(.18,.36,vColor.r-vColor.b);
    totalEmissiveRadiance += channel*vec3(.34,.62,.81)+lamp*vec3(.46,.32,.12);`);
  };
  const mesh=new T.Mesh(proxy,material);
  proxy.boundingSphere=new T.Sphere(new T.Vector3(0,2,-1.95),7.0);
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
