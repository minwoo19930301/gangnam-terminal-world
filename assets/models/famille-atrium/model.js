import {Float32BufferAttribute} from 'three';
import {loadArchitecture} from '../interior-architecture/model.js';
import {relief} from '../../../js/banpo_relief.js';

const source = new Map();
function library(file) {
  if (!source.has(file)) {
    source.set(file,loadArchitecture('../famille-atrium/'+file).then(parts => {
      for (const part of parts) {
        part.updateWorldMatrix(true,false);
        // Quantized glTF keeps the decode transform on the node. Restore its
        // metre-scale positions before sharing the mesh across world instances.
        for (const key of ['position','normal']) {
          const a=part.geometry.getAttribute(key);
          if (!a?.normalized) continue;
          const values=new Float32Array(3*a.count);
          for (let i=0;i<a.count;i++) {
            values[i*3]=a.getX(i); values[i*3+1]=a.getY(i); values[i*3+2]=a.getZ(i);
          }
          part.geometry.setAttribute(key,new Float32BufferAttribute(values,3));
        }
        part.geometry.applyMatrix4(part.matrixWorld);
      }
      return parts;
    }).catch(error => { source.delete(file); throw error; }));
  }
  return source.get(file);
}

export function galleryLights(K, placements) {
  const {THREE} = K;
  const stem = new THREE.CylinderGeometry(.032,.052,2.20,8).translate(0,1.1,0);
  const glass = new THREE.SphereGeometry(.16,10,6).translate(0,2.2,0);
  const shell = new THREE.InstancedMesh(stem,new THREE.MeshLambertMaterial({color:0x493e36}),placements.length);
  const globes = new THREE.InstancedMesh(glass,new THREE.MeshBasicMaterial({color:0xffdd9e}),placements.length);
  shell.name='광장 · 고리형 청동 조명'; globes.name='광장 · 유백 유리 갓';
  const pose = new THREE.Object3D();
  const centers = placements.map(([x,y,z,angle],i) => {
    pose.position.set(x,y,z); pose.rotation.y=angle; pose.updateMatrix();
    for(const group of [shell,globes]) group.setMatrixAt(i,pose.matrix);
    return new THREE.Sphere(new THREE.Vector3(x,y+2+relief(x,z),z),.65);
  });
  const frustum = new THREE.Frustum(), projection = new THREE.Matrix4();
  let waiting=false, retryAt=0, details;
  shell.onBeforeRender=(_renderer,_scene,camera)=>{
    frustum.setFromProjectionMatrix(projection.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse));
    const close=centers.some(c=>camera.position.distanceToSquared(c.center)<32*32 && frustum.intersectsSphere(c));
    if (close && !details && !waiting && performance.now()>=retryAt) {
      waiting=true;
      library('globe-lamp.glb').then(parts=>{
        details={lamp:parts.find(p=>p.name==='Surface').geometry, glass:parts.find(p=>p.name==='Diffuser').geometry};
      }).catch(()=>{retryAt=performance.now()+10000;}).finally(()=>{waiting=false;});
    }
    if (details) {
      const full=close && shell.geometry!==details.lamp, proxy=!close && shell.geometry!==stem;
      if (full || proxy) {
        shell.geometry=full?details.lamp:stem; globes.geometry=full?details.glass:glass;
        shell.material.color.set(full?0xffffff:0x493e36); shell.material.vertexColors=full; shell.material.needsUpdate=true;
        globes.material.color.set(full?0xffffff:0xffdd9e); globes.material.vertexColors=full; globes.material.needsUpdate=true;
      }
    }
  };
  for (const group of [shell,globes]) { group.computeBoundingSphere(); group.boundingSphere.radius+=.4; K.addMesh(group); }
}

export function portraitDisplay(K,x,y,z) {
  const {THREE}=K, scale=1.50;
  const frameMat=new THREE.MeshLambertMaterial({color:0x555452});
  const frame=new THREE.Mesh(new THREE.BoxGeometry(2.54,.18,4.57)
    .rotateX(-Math.PI/2).translate(0,4.57/2,-.06),frameMat);
  frame.position.set(x,y,z); frame.rotation.y=Math.PI; frame.scale.setScalar(scale);
  frame.name='메모리얼 광장 · 미디어 캐비닛';
  K.addMesh(frame);

  const surface=new THREE.MeshBasicMaterial({color:0x487a6c});
  const screen=new THREE.Mesh(new THREE.PlaneGeometry(2.436*scale,4.406*scale),surface);
  screen.name='메모리얼 광장 · 전광판 원화';
  screen.position.set(x,y+2.285*scale,z-.052*scale); screen.rotation.y=Math.PI;
  K.addMesh(screen);
  let frameReady=false, imageReady=false, retryAt=0, busy=false;
  screen.onBeforeRender=(_renderer,_scene,camera)=>{
    // The screen faces the open court. Visitors behind the clock should not fetch its media.
    if (busy || (frameReady && imageReady) || camera.position.z>=screen.position.z ||
        Math.hypot(camera.position.x-x,camera.position.z-z)>42 || performance.now()<retryAt) return;
    busy=true;
    const jobs=[];
    if (!frameReady) jobs.push(library('portrait-cabinet.glb').then(([part])=>{
      frame.geometry.dispose();
      frame.geometry=part.geometry; frameMat.color.set(0xffffff); frameMat.vertexColors=true; frameMat.needsUpdate=true;
      frameReady=true;
    }));
    if (!imageReady) jobs.push(new THREE.TextureLoader().loadAsync(new URL('arcade.webp',import.meta.url).href).then(texture=>{
      texture.colorSpace=THREE.SRGBColorSpace;
      surface.map=texture; surface.color.set(0xffffff); surface.needsUpdate=true; imageReady=true;
    }));
    Promise.allSettled(jobs).then(()=>{
      if (!imageReady || !frameReady) retryAt=performance.now()+10000;
      busy=false;
    });
  };
}

function courtFurnishing(K, {name,file,proxy,color,placements,radius,height}) {
  const {THREE}=K;
  const finish=new THREE.MeshLambertMaterial({color,side:THREE.DoubleSide});
  const group=new THREE.InstancedMesh(proxy,finish,placements.length);
  group.name=name;
  const pose=new THREE.Object3D();
  const centers=placements.map(([x,z,angle,scale=1],i)=>{
    pose.position.set(x,0,z); pose.rotation.y=angle; pose.scale.setScalar(scale); pose.updateMatrix();
    group.setMatrixAt(i,pose.matrix);
    return new THREE.Sphere(new THREE.Vector3(x,height*scale+relief(x,z),z),radius*scale);
  });
  group.computeBoundingSphere(); group.boundingSphere.radius+=radius;
  const frustum=new THREE.Frustum(), projection=new THREE.Matrix4();
  let full,waiting=false,retryAt=0;
  group.onBeforeRender=(_renderer,_scene,camera)=>{
    frustum.setFromProjectionMatrix(projection.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse));
    const near=centers.some(c=>camera.position.distanceToSquared(c.center)<28*28 && frustum.intersectsSphere(c));
    if (near && !full && !waiting && performance.now()>=retryAt) {
      waiting=true;
      library(file).then(([part])=>{full=part.geometry;})
        .catch(()=>{retryAt=performance.now()+10000;}).finally(()=>{waiting=false;});
    }
    if (full && group.geometry!==(near?full:proxy)) {
      group.geometry=near?full:proxy;
      finish.vertexColors=near; finish.color.set(near?0xffffff:color); finish.needsUpdate=true;
    }
  };
  K.addMesh(group);
}

export function courtTables(K, placements) {
  const proxy=new K.THREE.BoxGeometry(.72,.027,.72).translate(0,.729,0);
  courtFurnishing(K,{name:'포비 앞 · 빨간 철제 테이블과 의자',file:'terrace-set.glb',
    proxy,color:0xbc3d38,placements,radius:1.1,height:.5});
}

export function courtPlants(K, placements) {
  const proxy=new K.THREE.IcosahedronGeometry(1,0).scale(.52,.63,.48).translate(0,1.39,0);
  courtFurnishing(K,{name:'포비 앞 · 석재 화분과 관엽수',file:'court-planter.glb',
    proxy,color:0x77836a,placements,radius:1.2,height:1.05});
}

export function courtPaving(K,poly) {
  const {THREE}=K;
  const stone=new THREE.MeshLambertMaterial({color:0x676963});
  const key=K.material('familleCourtSetts',stone);
  // The stone sample is baked over a four-tile repeat. Its 45° running direction
  // stays independent of camera movement and requires no per-paver geometry.
  let pending=false,retryAt=0;
  stone.onBeforeRender=(_renderer,_scene,camera)=>{
    if(stone.map || pending || performance.now()<retryAt ||
       Math.hypot(camera.position.x+42.6,camera.position.z-203)>38) return;
    pending=true;
    new THREE.TextureLoader().loadAsync(new URL('paving.webp',import.meta.url).href).then(texture=>{
      texture.colorSpace=THREE.SRGBColorSpace;
      texture.wrapS=texture.wrapT=THREE.RepeatWrapping;
      texture.rotation=Math.PI/4;
      texture.anisotropy=Math.min(4,_renderer.capabilities.getMaxAnisotropy());
      stone.color.set(0xffffff);stone.map=texture;stone.needsUpdate=true;
    }).catch(()=>{retryAt=performance.now()+10000;}).finally(()=>{pending=false;});
  };
  K.hpoly({tex:key,scale:[.98,.98]},poly,.032,true);
}
