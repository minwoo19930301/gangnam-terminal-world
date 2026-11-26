import {loadFixtureScene} from '../onebailey/load.js';

let source;
export function pastryCounter(K,x,y,z,angle,w,d){
  const T=K.THREE, root=new T.Group();
  root.name='보앤미 · 비엔누아즈와 쿠키 샷 진열대';
  root.position.set(x,y,z);root.rotation.y=angle;root.scale.set(w/5.4,1,d/3);
  const lod=new T.LOD();
  const proxy=new T.BoxGeometry(4.85,.12,2.20).translate(0,.085,0);
  const paint=new T.MeshLambertMaterial({color:0xb88955});
  const far=new T.Mesh(proxy,paint),preview=new T.Mesh(proxy,paint);
  const detailed=new T.Mesh(new T.BufferGeometry(),new T.MeshLambertMaterial({vertexColors:true,side:T.DoubleSide}));
  detailed.visible=false;detailed.matrixAutoUpdate=false;
  const near=new T.Group();near.add(preview,detailed);
  lod.addLevel(near,0);lod.addLevel(far,15,.12);
  root.add(lod);K.addMesh(root);
  let waiting=false,retry=0;
  preview.onBeforeRender=()=>{
    if(waiting||performance.now()<retry)return;
    waiting=true;
    source??=loadFixtureScene(new URL('./pastries.glb',import.meta.url))
      .then(scene=>scene.getObjectByName('Surface')).catch(e=>{source=null;throw e;});
    source.then(part=>{
      detailed.geometry=part.geometry;detailed.matrix.copy(part.matrixWorld);
      detailed.matrixWorldNeedsUpdate=true;detailed.visible=true;preview.visible=false;
    }).catch(()=>{waiting=false;retry=performance.now()+10000;});
  };
}
