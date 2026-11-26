import {loadFixtureScene} from '../onebailey/load.js';

let source;
function loadDisplay(T){
  source??=Promise.all([
    loadFixtureScene(new URL('./counter.glb',import.meta.url)),
    new T.TextureLoader().loadAsync(new URL('./garden.jpg',import.meta.url).href),
  ]).then(([scene,map])=>{
    map.colorSpace=T.SRGBColorSpace;
    map.flipY=false;
    const paint=new T.MeshPhongMaterial({map,vertexColors:true,side:T.DoubleSide,specular:0x282621,shininess:36});
    const glass=new T.MeshPhongMaterial({color:0xc6dfdb,transparent:true,opacity:.095,
      depthWrite:false,side:T.DoubleSide,shininess:84,forceSinglePass:true});
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
    return {surface:geometry('Surface'),glazing:geometry('Glazing'),paint,glass};
  }).catch(error=>{source=null;throw error;});
  return source;
}

export function giftConcierge(K,x,y,z,angle,depth,length){
  const T=K.THREE;
  const proxy=new T.BoxGeometry(.95,.88,4.07).translate(0,.44,0);
  const distant=new T.MeshLambertMaterial({color:0xcfcbc0});
  const mesh=new T.Mesh(proxy,distant);
  mesh.name='신세계 마켓 · 기프트 컨시어지 포장 진열대';
  mesh.position.set(x,y,z);
  mesh.rotation.y=angle;
  mesh.scale.set(depth/.95,1,length/4.07);
  mesh.userData.split=true;
  const bounds=new T.Box3(new T.Vector3(-.56,0,-2.04),new T.Vector3(.48,2.69,2.04));
  // Use the complete display bounds for the first draw, including the upper shelves.
  proxy.boundingSphere=bounds.getBoundingSphere(new T.Sphere());
  const clip=new T.Matrix4(),frustum=new T.Frustum(),eye=new T.Vector3();
  let display,pane,pending=false,retryAt=0;
  mesh.onBeforeRender=(_renderer,_scene,camera)=>{
    eye.copy(camera.position);
    mesh.worldToLocal(eye);
    clip.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse).multiply(mesh.matrixWorld);
    const range=mesh.geometry===proxy?15:18;
    const near=eye.x>-.6&&eye.x*eye.x+(eye.y-1.3)**2+eye.z*eye.z<range*range&&frustum.setFromProjectionMatrix(clip).intersectsBox(bounds);
    if(near&&!display&&!pending&&performance.now()>=retryAt){
      pending=true;
      loadDisplay(T).then(value=>{
        display=value;
        pane=new T.Mesh(display.glazing,display.glass);
        pane.visible=false;
        mesh.add(pane);
      }).catch(()=>{retryAt=performance.now()+10000;}).finally(()=>{pending=false;});
    }
    if(display){
      mesh.geometry=near?display.surface:proxy;
      mesh.material=near?display.paint:distant;
      pane.visible=near;
    }
  };
  K.addMesh(mesh);
}
