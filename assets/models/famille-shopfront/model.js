import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {loadFixtureScene} from '../onebailey/load.js';

let source;
function loadFinishes(T){
  source??=Promise.all([
    loadFixtureScene(new URL('./arcade.glb',import.meta.url)),
    new T.TextureLoader().loadAsync(new URL('./finishes.jpg',import.meta.url).href),
  ]).then(([scene,map])=>{
    map.colorSpace=T.SRGBColorSpace;
    map.flipY=false;
    map.anisotropy=4;
    const material=new T.MeshPhongMaterial({map,vertexColors:true,side:T.DoubleSide,specular:0x302e2a,shininess:43});
    function geometry(name){
      const part=scene.getObjectByName(name),geo=part.geometry;
      for(const key of ['position','normal']){
        const a=geo.getAttribute(key);
        if(!a.normalized)continue;
        const values=new Float32Array(a.count*3);
        for(let i=0;i<a.count;i++)values.set([a.getX(i),a.getY(i),a.getZ(i)],i*3);
        geo.setAttribute(key,new T.Float32BufferAttribute(values,3));
      }
      return geo.applyMatrix4(part.matrixWorld);
    }
    return {material,FamilleShopfrontBay:geometry('FamilleShopfrontBay'),FamilleLimestonePier:geometry('FamilleLimestonePier')};
  }).catch(error=>{source=null;throw error;});
  return source;
}

function silhouette(T,parts){
  const pieces=parts.map(([x,y,z,w,h,d,tint])=>{
    const geo=new T.BoxGeometry(w,h,d).translate(x,y,z);
    const color=new T.Color(tint),values=new Float32Array(geo.attributes.position.count*3);
    for(let i=0;i<values.length;i+=3)color.toArray(values,i);
    geo.setAttribute('color',new T.Float32BufferAttribute(values,3));
    return geo;
  });
  const result=mergeGeometries(pieces);
  pieces.forEach(g=>g.dispose());
  return result;
}

export function galleryShopfronts(K,point,rotation,bays,piers){
  const T=K.THREE,plain=new T.MeshLambertMaterial({vertexColors:true});
  function repeat(name,key,positions,blocks){
    const proxy=silhouette(T,blocks);
    proxy.computeBoundingBox();
    const [x,z]=point(positions[0],11.5);
    const mesh=new T.InstancedMesh(proxy,plain,positions.length);
    mesh.name=name;
    mesh.userData.nativePlacementInstances=true;
    mesh.userData.split=true;
    mesh.position.set(x,0,z);
    mesh.rotation.y=rotation;
    const boxes=positions.map((u,i)=>{
      // In this gallery's survey frame +u is Blender -X.
      const offset=positions[0]-u;
      mesh.setMatrixAt(i,new T.Matrix4().makeTranslation(offset,0,0));
      return proxy.boundingBox.clone().expandByScalar(.10).translate(new T.Vector3(offset,0,0));
    });
    mesh.computeBoundingSphere();
    mesh.boundingSphere.radius+=.16;
    const frustum=new T.Frustum(),clip=new T.Matrix4(),eye=new T.Vector3();
    let detail,waiting=false,retryAt=0;
    mesh.onBeforeRender=(_renderer,_scene,camera)=>{
      eye.copy(camera.position);
      mesh.worldToLocal(eye);
      clip.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse).multiply(mesh.matrixWorld);
      frustum.setFromProjectionMatrix(clip);
      const range=mesh.geometry===proxy?19:23;
      const near=eye.z<.75&&boxes.some(b=>b.distanceToPoint(eye)<range&&frustum.intersectsBox(b));
      if(near&&!detail&&!waiting&&performance.now()>=retryAt){
        waiting=true;
        loadFinishes(T).then(result=>{detail=result;}).catch(()=>{retryAt=performance.now()+10000;}).finally(()=>{waiting=false;});
      }
      mesh.geometry=near&&detail?detail[key]:proxy;
      mesh.material=near&&detail?detail.material:plain;
    };
    K.addMesh(mesh);
  }
  const shop=[[0,6.39,-.02,5.44,3.08,.10,0x38443f],[0,3.62,-.14,5.51,.65,.20,0x282725],
    [0,4.35,-.18,5.56,.83,.23,0x736e64]];
  for(let i=0;i<=6;i++)shop.push([-2.66+i*.887,6.40,-.135,.056,2.93,.06,0x282c29]);
  for(const h of [5.54,6.65,7.43])shop.push([0,h,-.135,5.34,.042,.05,0x30332f]);
  repeat('파미에 식당가 · 접이식 격자창과 점포 띠','FamilleShopfrontBay',bays,shop);
  repeat('파미에 식당가 · 석재 덧기둥','FamilleLimestonePier',piers,[
    [0,4.05,-.29,.91,7.7,.14,0xded6c6],[0,.15,-.25,1.01,.29,.24,0xcfc6b2],
    [0,7.98,-.25,1.04,.22,.25,0xdad1bf],
  ]);
}
