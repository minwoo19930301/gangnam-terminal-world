import {Float32BufferAttribute} from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {loadFixtureScene} from '../onebailey/load.js';

let source;
function loadIsland(){
  source??=loadFixtureScene(new URL('./fruit-island.glb',import.meta.url)).then(scene=>{
    const part=scene.getObjectByName('Surface'),geometry=part.geometry;
    // Decode to metres once, keeping the two world placements stable during LOD swaps.
    for(const key of ['position','normal']){
      const a=geometry.getAttribute(key);
      if(!a.normalized)continue;
      const values=new Float32Array(a.count*3);
      for(let i=0;i<a.count;i++){
        values[i*3]=a.getX(i);values[i*3+1]=a.getY(i);values[i*3+2]=a.getZ(i);
      }
      geometry.setAttribute(key,new Float32BufferAttribute(values,3));
    }
    return geometry.applyMatrix4(part.matrixWorld);
  })
    .catch(error=>{source=null;throw error;});
  return source;
}

export function marketFruitIslands(K,placements){
  const T=K.THREE, blocks=[];
  function block(x,y,z,w,h,d,color){
    const geo=new T.BoxGeometry(w,h,d).translate(x,y,z);
    const c=new T.Color(color),rgb=[];
    for(let i=0;i<geo.attributes.position.count;i++)rgb.push(c.r,c.g,c.b);
    geo.setAttribute('color',new T.Float32BufferAttribute(rgb,3));
    blocks.push(geo);
  }
  block(0,.36,0,1.94,.70,1.28,0x74513c);
  for(const [i,c] of [0xbd3940,0xbba84f,0xe19a31,0x75486a].entries())block(0,.82,.45-i*.30,1.66,.23,.28,c);
  const proxy=mergeGeometries(blocks);
  blocks.forEach(g=>g.dispose());
  const paint=new T.MeshLambertMaterial({vertexColors:true,side:T.DoubleSide});
  const mesh=new T.InstancedMesh(proxy,paint,placements.length);
  mesh.name='신세계 마켓 · 팔각 제철 과일 진열대';
  mesh.userData.split=true;
  placements.forEach(([x,y,z,angle],i)=>{
    const pose=new T.Matrix4().makeRotationY(angle).setPosition(x,y,z);
    mesh.setMatrixAt(i,pose);
  });
  mesh.computeBoundingSphere();mesh.boundingSphere.radius+=.3;
  const frustum=new T.Frustum(),view=new T.Matrix4();
  const centers=placements.map(([x,y,z])=>new T.Sphere(new T.Vector3(x,y+.55,z),1.4));
  let surface,waiting=false,retryAt=0,detailed=false;
  mesh.onBeforeRender=(_renderer,_scene,camera)=>{
    frustum.setFromProjectionMatrix(view.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse));
    const range=detailed?22:19;
    const close=centers.some(c=>camera.position.distanceToSquared(c.center)<range*range&&frustum.intersectsSphere(c));
    if(close&&!surface&&!waiting&&performance.now()>=retryAt){
      waiting=true;
      loadIsland().then(s=>{surface=s;}).catch(()=>{retryAt=performance.now()+10000;}).finally(()=>{waiting=false;});
    }
    if(!surface||close===detailed)return;
    detailed=close;
    mesh.geometry=close?surface:proxy;
  };
  K.addMesh(mesh);
}
