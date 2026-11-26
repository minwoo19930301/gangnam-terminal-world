import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {loadFixtureScene} from '../onebailey/load.js';

function shopSilhouette(T) {
  const parts = [];
  function block(x,y,z,w,h,d,tone) {
    const geo = new T.BoxGeometry(w,h,d).translate(x,y,z);
    const color = new T.Color(tone), value = new Float32Array(geo.attributes.position.count*3);
    for (let i=0;i<value.length;i+=3) color.toArray(value,i);
    geo.setAttribute('color',new T.BufferAttribute(value,3));
    parts.push(geo);
  }
  for (const x of [-.91,.91]) {
    block(x,.48,-.34,.77,.74,.39,0x3a3943);
    block(x,.85,-.40,.80,.04,.50,0x655c58);
    for (let i=-1;i<=1;i++) block(x+i*.24,.97,-.24,.2,.18,.085,[0x5f6072,0x835f5d,0x515767][i+1]);
  }
  for (let i=0;i<7;i++) block(-1.12+i*.37,2.21,-.23,.25,.34,.12,[0x42434e,0x596477,0x725262][i%3]);
  for (const y of [.57,1.30,2.00]) {
    block(0,y,-3.58,2.51,.03,.34,0x4c474b);
    for (let i=0;i<6;i++) block(-1+i*.4,y+.18,-3.47,.24,.30,.11,i%2 ? 0x685754 : 0x424656);
  }
  const g = mergeGeometries(parts);parts.forEach(p=>p.dispose());return g;
}

export function placeHessed(K,x,y,z,angle,width,depth) {
  const T=K.THREE, display=new T.LOD(), coarse=shopSilhouette(T);
  display.name='헤쎄드 가방 진열';
  display.position.set(x,y,z);display.rotation.y=angle;
  display.scale.set(width/2.66,1,depth/3.9);
  const finish=new T.MeshLambertMaterial({vertexColors:true,side:T.DoubleSide});
  const placeholder=new T.Mesh(coarse,finish);
  display.addLevel(placeholder,30,.12);
  for(const [name,distance] of [['hessed',0],['distant',8.5]]){
    const mesh=new T.Mesh(coarse,finish),eye=new T.Vector3();
    mesh.name=name==='hessed'?'헤쎄드 가방 · 근거리':'헤쎄드 가방 · 중거리';
    display.addLevel(mesh,distance,.12);
    let waiting=false,retryAt=0;
    mesh.onBeforeRender=(renderer,scene,camera)=>{
      if(waiting || performance.now()<retryAt) return;
      display.worldToLocal(eye.copy(camera.position));
      if(eye.y<-.1 || eye.y>3.15 || eye.z<-4.15) return;
      waiting=true;
      loadFixtureScene(new URL(name+'.glb',import.meta.url)).then(library=>{
        const source=library.getObjectByProperty('isMesh',true);
        mesh.geometry=source.geometry;
        mesh.matrix.copy(source.matrixWorld);
        mesh.matrixAutoUpdate=false;
        mesh.matrixWorldNeedsUpdate=true;
        mesh.userData.loaded=true;
        mesh.onBeforeRender=()=>{};
      }).catch(()=>{
        waiting=false;retryAt=performance.now()+10000;
      });
    };
  }
  K.addMesh(display);
}
