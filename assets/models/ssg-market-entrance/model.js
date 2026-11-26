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

export function marketEntrance(K,x,y,z,angle){
  const T=K.THREE,parts=[];
  function piece(geometry,x,y,z,color){
    geometry.translate(x,y,z);
    const paint=new T.Color(color),colors=new Float32Array(geometry.attributes.position.count*3);
    for(let i=0;i<colors.length;i+=3)paint.toArray(colors,i);
    geometry.setAttribute('color',new T.Float32BufferAttribute(colors,3));
    parts.push(geometry);
  }
  for(const side of [-2.9,2.9]){
    piece(new T.BoxGeometry(.93,.21,.77),0,.105,side,0xe3ddce);
    for(const depth of [-.227,.227]){
      piece(new T.CylinderGeometry(.177,.195,2.81,8),depth,1.67,side,0x201e23);
      piece(new T.CylinderGeometry(.247,.178,.4,8),depth,3.24,side,0xb18b52);
    }
  }
  piece(new T.BoxGeometry(.9,.40,6.6),0,3.64,0,0x48423c);
  const proxy=mergeGeometries(parts);
  parts.forEach(g=>g.dispose());
  const mesh=new T.Mesh(proxy,new T.MeshPhongMaterial({vertexColors:true,side:T.DoubleSide,specular:0x28241e,shininess:39}));
  mesh.name='신세계 마켓 · 동측 대리석 출입구';
  mesh.position.set(x,y,z);
  mesh.rotation.y=angle;
  mesh.userData.split=true;
  const center=new T.Vector3(),frustum=new T.Frustum(),clip=new T.Matrix4();
  // The wide, shallow portal's bounding sphere surrounds a shopper just past it.
  // Test the box in portal space before fetching detail behind their camera.
  const bounds=new T.Box3(new T.Vector3(-.52,0,-3.32),new T.Vector3(.52,3.84,3.32));
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
