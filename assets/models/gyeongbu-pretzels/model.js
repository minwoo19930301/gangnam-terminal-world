import {loadFixtureScene} from '../onebailey/load.js';
import {relief} from '../../../js/banpo_relief.js';

let library, loading, retryAt=0;
function requestWarmer(){
  if(library || loading || performance.now()<retryAt)return;
  loading=loadFixtureScene(new URL('./pretzel-warmer.glb',import.meta.url)).then(scene=>{
    library={body:scene.getObjectByName('Warmer'),glass:scene.getObjectByName('Glass')};
  }).catch(()=>{retryAt=performance.now()+10000;}).finally(()=>{loading=null;});
}

function displayObject(mesh, source) {
  mesh.geometry=source.geometry;
  mesh.matrix.copy(source.matrixWorld);
  mesh.updateMatrixWorld(true);
}

export function placeWarmer(K,x,z,angle){
  const T=K.THREE,stand=new T.Group();
  stand.name='앤티앤스 · 프레즐 진열대';
  stand.position.set(x,0,z);stand.rotation.y=angle;
  const coarse=new T.BoxGeometry(6.05,.90,.76).translate(0,.45,0);
  const blue=new T.MeshLambertMaterial({color:0x005689});
  const steel=new T.MeshLambertMaterial({vertexColors:true,side:T.DoubleSide});
  const glass=new T.MeshPhongMaterial({color:0xcbdde0,transparent:true,opacity:.075,depthWrite:false,
    side:T.DoubleSide,specular:0xffffff,shininess:80});
  const body=new T.Mesh(coarse,blue),pane=new T.Mesh(coarse,glass);
  body.matrixAutoUpdate=false;pane.matrixAutoUpdate=false;pane.visible=false;
  stand.add(body,pane);
  const floor=relief(x,z);
  body.onBeforeRender=(_renderer,_scene,camera)=>{
    const eye=camera.position,range=pane.visible?14:10;
    const near=eye.y>floor-.15 && eye.y<floor+3.8 && (eye.x-x)**2+(eye.z-z)**2<range*range;
    if(near && !library)requestWarmer();
    if(near && library && !pane.visible){
      displayObject(body,library.body);body.material=steel;
      displayObject(pane,library.glass);pane.visible=true;
    }else if(!near && pane.visible){
      body.geometry=coarse;body.material=blue;body.matrix.identity();body.updateMatrixWorld(true);
      pane.visible=false;
    }
  };
  K.addMesh(stand);
}
