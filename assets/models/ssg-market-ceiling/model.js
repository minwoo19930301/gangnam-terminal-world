import {loadFixtureScene} from '../onebailey/load.js';

let source;
function loadCeiling(T){
  source??=Promise.all([
    loadFixtureScene(new URL('./ceiling.glb',import.meta.url)),
    new T.TextureLoader().loadAsync(new URL('./panel.jpg',import.meta.url).href),
  ]).then(([scene,map])=>{
    const part=scene.getObjectByName('Surface');
    map.flipY=false; // The standalone image uses the GLB’s top-left UV convention.
    map.colorSpace=T.SRGBColorSpace;
    map.anisotropy=4;
    // Pale plaster catches the edge cove's warm bounce even when looking up at night.
    const material=new T.MeshLambertMaterial({map,vertexColors:true,side:T.DoubleSide,
      emissive:0x887257,emissiveMap:map});
    return {geometry:part.geometry.applyMatrix4(part.matrixWorld),material};
  }).catch(error=>{source=null;throw error;});
  return source;
}

export function marketProduceCeiling(K,x,y,z,angle){
  const T=K.THREE;
  const points=[[-4,-2.52],[-2.87,-3.65],[2.87,-3.65],[4,-2.52],[4,2.52],[2.87,3.65],[-2.87,3.65],[-4,2.52]];
  const vertices=[];
  for(const [i,[px,pz]] of points.entries()){
    const [qx,qz]=points[(i+1)%points.length];
    vertices.push(0,4.23,0,px,4.23,pz,qx,4.23,qz);
  }
  const proxy=new T.BufferGeometry();
  proxy.setAttribute('position',new T.Float32BufferAttribute(vertices,3));
  proxy.computeVertexNormals();
  const distant=new T.MeshLambertMaterial({color:0xdcc7aa,side:T.DoubleSide});
  const mesh=new T.Mesh(proxy,distant);
  mesh.name='신세계 마켓 · 청과 매대 위 장식 천장';
  mesh.position.set(x,y,z);
  mesh.rotation.y=angle;
  mesh.userData.split=true;
  const center=new T.Vector3(),frustum=new T.Frustum(),clip=new T.Matrix4();
  const bounds=new T.Box3(new T.Vector3(-4.12,4.13,-3.76),new T.Vector3(4.12,4.28,3.76));
  let detail,pending=false,retryAt=0;
  mesh.onBeforeRender=(_renderer,_scene,camera)=>{
    center.set(0,4.2,0).applyMatrix4(mesh.matrixWorld);
    clip.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse).multiply(mesh.matrixWorld);
    const range=mesh.geometry===proxy?18:21;
    const close=camera.position.distanceToSquared(center)<range*range&&frustum.setFromProjectionMatrix(clip).intersectsBox(bounds);
    if(close&&!detail&&!pending&&performance.now()>=retryAt){
      pending=true;
      loadCeiling(T).then(value=>{detail=value;}).catch(()=>{retryAt=performance.now()+10000;}).finally(()=>{pending=false;});
    }
    if(detail){
      mesh.geometry=close?detail.geometry:proxy;
      mesh.material=close?detail.material:distant;
    }
  };
  K.addMesh(mesh);
}
