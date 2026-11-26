import {loadFixtureScene} from '../onebailey/load.js';
import {relief} from '../../../js/banpo_relief.js';

function displayObject(mesh, source) {
  mesh.geometry=source.geometry;
  mesh.matrix.copy(source.matrixWorld);
  mesh.updateMatrixWorld(true);
}

// Each counter keeps its own cached mesh library. The coarse body is the visibility probe.
export function displayCase({url,name,width,height,depth,baseColor,bodyName,lightName,enter=10,leave=14,visibleBounds}){
  let library,loading,retryAt=0;
  function request(){
    if(library || loading || performance.now()<retryAt)return;
    loading=loadFixtureScene(url).then(scene=>{
      const body=scene.getObjectByName(bodyName),glass=scene.getObjectByName('Glass');
      if(!body || !glass)throw new Error('Missing display case geometry');
      const light=lightName && scene.getObjectByName(lightName);
      if(lightName && !light)throw new Error('Missing display case lighting');
      library={body,glass,light};
    }).catch(()=>{retryAt=performance.now()+10000;}).finally(()=>{loading=null;});
  }
  return function place(K,x,z,angle){
    const T=K.THREE,stand=new T.Group();
    stand.name=name;
    stand.position.set(x,0,z);stand.rotation.y=angle;
    const coarse=new T.BoxGeometry(width,height,depth).translate(0,height/2,0);
    const base=new T.MeshLambertMaterial({color:baseColor});
    const painted=new T.MeshLambertMaterial({vertexColors:true,side:T.DoubleSide});
    const glass=new T.MeshPhongMaterial({color:0xcbdde0,transparent:true,opacity:.075,depthWrite:false,
      side:T.DoubleSide,specular:0xffffff,shininess:80});
    const body=new T.Mesh(coarse,base),pane=new T.Mesh(coarse,glass);
    body.matrixAutoUpdate=false;pane.matrixAutoUpdate=false;pane.visible=false;
    stand.add(body,pane);
    let displayLight;
    if(lightName){
      displayLight=new T.Mesh(coarse,new T.MeshBasicMaterial({vertexColors:true,side:T.DoubleSide}));
      displayLight.matrixAutoUpdate=false;displayLight.visible=false;
      stand.add(displayLight);
    }
    const floor=relief(x,z);
    // A long, shallow bank can surround the eye with its bounding sphere even when it is behind the visitor.
    let bounds,frustum,projection;
    if(visibleBounds){
      bounds=new T.Box3(new T.Vector3(...visibleBounds[0]),new T.Vector3(...visibleBounds[1]));
      frustum=new T.Frustum();projection=new T.Matrix4();
      coarse.boundingSphere=bounds.getBoundingSphere(new T.Sphere());
    }
    body.onBeforeRender=(_renderer,_scene,camera)=>{
      const eye=camera.position,range=pane.visible?leave:enter;
      let near=eye.y>floor-.15 && eye.y<floor+3.8 && (eye.x-x)**2+(eye.z-z)**2<range*range;
      if(near && bounds && !pane.visible){
        projection.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse).multiply(stand.matrixWorld);
        near=frustum.setFromProjectionMatrix(projection,camera.coordinateSystem).intersectsBox(bounds);
      }
      if(near && !library)request();
      if(near && library && !pane.visible){
        displayObject(body,library.body);body.material=painted;
        displayObject(pane,library.glass);pane.visible=true;
        if(displayLight){displayObject(displayLight,library.light);displayLight.visible=true;}
      }else if(!near && pane.visible){
        body.geometry=coarse;body.material=base;body.matrix.identity();body.updateMatrixWorld(true);
        pane.visible=false;
        if(displayLight)displayLight.visible=false;
      }
    };
    return K.addMesh(stand);
  };
}
