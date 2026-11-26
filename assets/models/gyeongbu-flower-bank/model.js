import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {loadFixtureScene} from '../onebailey/load.js';

let source;
function loadSurface(T){
  source??=loadFixtureScene(new URL('./flower-bank.glb',import.meta.url)).then(scene=>{
    const part=scene.getObjectByName('Surface'),geo=part.geometry;
    // Bake the meshopt decode matrix in float space once, shared across area reloads.
    for(const name of ['position','normal']){
      const a=geo.getAttribute(name);
      if(!a.normalized)continue;
      const values=new Float32Array(a.count*3);
      for(let i=0;i<a.count;i++)values.set([a.getX(i),a.getY(i),a.getZ(i)],i*3);
      geo.setAttribute(name,new T.Float32BufferAttribute(values,3));
    }
    const shelf=geo.applyMatrix4(part.matrixWorld);
    scene.remove(part);
    return {shelf,stock:scene};
  }).catch(error=>{source=null;throw error;});
  return source;
}

export function flowerBank(K,x,y,z,angle){
  const T=K.THREE,parts=[];
  function piece(geometry,x,y,z,color){
    if(geometry.index){const original=geometry;geometry=original.toNonIndexed();original.dispose();}
    geometry.translate(x,y,z);
    const paint=new T.Color(color),colors=new Float32Array(geometry.attributes.position.count*3);
    for(let i=0;i<colors.length;i+=3)paint.toArray(colors,i);
    geometry.setAttribute('color',new T.Float32BufferAttribute(colors,3));
    parts.push(geometry);
  }
  const tints=[[0xc8c8ac,0x949f4d,0x8f4557,0x627b55,0xc8c8ac,0x949f4d],
    [0x8f4557,0x627b55,0x806298,0x8f4557,0x949f4d,0x627b55],
    [0xc8c8ac,0x949f4d,0x627b55,0xc8c8ac,0x949f4d,0x8f4557]];
  for(const [tier,colors] of tints.entries()){
    const height=.39+tier*.40,z=.54-tier*.50;
    piece(new T.BoxGeometry(3.8,height,.54),0,height/2,z,0x5d5540);
    colors.forEach((color,i)=>{
      const g=new T.IcosahedronGeometry(1,0).scale(.36,.18,.30);
      piece(g,-1.58+i*.63,height+.21,z+.18,color);
    });
  }
  const proxy=mergeGeometries(parts);
  parts.forEach(g=>g.dispose());
  const mesh=new T.Mesh(proxy,new T.MeshPhongMaterial({vertexColors:true,side:T.DoubleSide,specular:0x161910,shininess:15}));
  mesh.name='경부선 생화상가 · 절지와 열매 진열대';
  mesh.position.set(x,y,z);
  mesh.rotation.y=angle;
  mesh.userData.split=true;
  const center=new T.Vector3(),eye=new T.Vector3(),frustum=new T.Frustum(),clip=new T.Matrix4();
  // An oblique glance across the aisle should load the front, but not stock behind the viewer.
  const bounds=new T.Box3(new T.Vector3(-1.95,0,-.78),new T.Vector3(1.95,1.82,1.16));
  let detailed=false,surface,stock,pending=false,retryAt=0;
  mesh.onBeforeRender=(_renderer,_scene,camera)=>{
    center.set(0,1.0,0).applyMatrix4(mesh.matrixWorld);
    clip.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse).multiply(mesh.matrixWorld);
    const range=detailed?13:10;
    mesh.worldToLocal(eye.copy(camera.position));
    const near=eye.z>-.15 && camera.position.distanceToSquared(center)<range*range&&frustum.setFromProjectionMatrix(clip).intersectsBox(bounds);
    if(near&&!surface&&!pending&&performance.now()>=retryAt){
      pending=true;
      loadSurface(T).then(result=>{
        surface=result.shelf;
        stock=result.stock.clone(true);
        stock.traverse(part=>{if(part.isMesh)part.material=mesh.material;});
        stock.visible=false;
        mesh.add(stock);
      }).catch(()=>{retryAt=performance.now()+10000;}).finally(()=>{pending=false;});
    }
    if(surface&&near!==detailed){
      mesh.geometry=near?surface:proxy;
      stock.visible=near;
      detailed=near;
    }
  };
  K.addMesh(mesh);
}
