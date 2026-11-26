import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {loadFixtureScene} from '../onebailey/load.js';

let detail;
function loadChair(){
  detail??=loadFixtureScene(new URL('./chair.glb',import.meta.url)).then(scene=>{
    const chair=scene.getObjectByName('DiningChair');
    return chair.geometry.applyMatrix4(chair.matrixWorld);
  }).catch(error=>{detail=null;throw error;});
  return detail;
}

export function margauxChairs(K,rows){
  const T=K.THREE;
  const seat=new T.CylinderGeometry(.245,.22,.10,8).translate(0,.418,0);
  const back=new T.CylinderGeometry(.266,.237,.37,8,1,true,-Math.PI*.54,Math.PI*1.08).translate(0,.60,0);
  const silhouettes=[seat,back];
  for(const x of [-.18,.18])for(const z of [-.16,.16]){
    silhouettes.push(new T.BoxGeometry(.035,.39,.035).translate(x,.20,z));
  }
  const proxy=mergeGeometries(silhouettes);
  silhouettes.forEach(g=>g.dispose());
  const plain=new T.MeshLambertMaterial({color:0x554239,side:T.DoubleSide});
  const leather=new T.MeshPhongMaterial({vertexColors:true,side:T.DoubleSide,specular:0x49443c,shininess:38});
  for(const poses of rows){
    const mesh=new T.InstancedMesh(proxy,plain,poses.length);
    mesh.name='더 마고 그릴 · 다이닝 가죽 의자';
    mesh.userData.split=true;
    mesh.userData.nativePlacementInstances=true;
    const chairs=poses.map(([x,y,z,angle],i)=>{
      mesh.setMatrixAt(i,new T.Matrix4().makeRotationY(angle).setPosition(x,y,z));
      return new T.Sphere(new T.Vector3(x,y+.45,z),.54);
    });
    mesh.computeBoundingSphere();
    mesh.boundingSphere.radius+=.4;
    const clip=new T.Matrix4(),frustum=new T.Frustum(),eye=new T.Vector3();
    let surface,waiting=false,retryAt=0;
    mesh.onBeforeRender=(_renderer,_scene,camera)=>{
      eye.copy(camera.position);
      mesh.worldToLocal(eye);
      clip.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse).multiply(mesh.matrixWorld);
      frustum.setFromProjectionMatrix(clip);
      const distance=mesh.geometry===proxy?13:16;
      const close=chairs.some(s=>eye.distanceToSquared(s.center)<distance*distance&&frustum.intersectsSphere(s));
      if(close&&!surface&&!waiting&&performance.now()>=retryAt){
        waiting=true;
        loadChair().then(geo=>{surface=geo;}).catch(()=>{retryAt=performance.now()+10000;}).finally(()=>{waiting=false;});
      }
      mesh.geometry=close&&surface?surface:proxy;
      mesh.material=close&&surface?leather:plain;
    };
    K.addMesh(mesh);
  }
}
