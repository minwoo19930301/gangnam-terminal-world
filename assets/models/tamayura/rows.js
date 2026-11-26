import {relief} from '../../../js/banpo_relief.js';

// A whole row owns two draw calls. Each chair or place setting independently selects its
// detailed mesh, its silhouette, or neither according to its own distance and frustum.
const sources=new Map();
export function placeRow(K,{key,name,rows,center,point,rotation,y,proxy,paint,range,exitRange,eyeHeight,radius,visible,loadSurface}){
  const T=K.THREE,root=new T.Group(),[u,v]=center,[x,z]=point(u,v);
  root.name=name+' · '+rows[0].bar;root.position.set(x,y,z);root.rotation.y=rotation;
  const poses=rows.map((p,i)=>{
    const pose=new T.Matrix4().makeRotationY(p.turn);pose.setPosition(p.u-u,p.h,p.v-v);
    return {pose,visible:visible[i],center:new T.Vector3(p.u-u,p.h+eyeHeight,p.v-v),high:false};
  });
  const far=new T.InstancedMesh(proxy,paint,poses.length),near=new T.InstancedMesh(proxy,paint,poses.length);
  far.name=name;far.userData.nativePlacementInstances=true;near.name=name+' · 근접';
  const bounds=new T.Box3();
  poses.forEach((p,i)=>{far.setMatrixAt(i,p.pose);bounds.expandByPoint(p.center);});
  bounds.expandByScalar(radius);
  far.boundingBox=bounds;near.boundingBox=bounds;far.boundingSphere=bounds.getBoundingSphere(new T.Sphere());near.boundingSphere=far.boundingSphere;
  near.count=0;root.add(far,near);
  let state=sources.get(key);
  if(!state){state={surface:null,pending:null,retry:0};sources.set(key,state);}
  function request(){
    if(state.surface||state.pending||performance.now()<state.retry)return;
    state.pending=loadSurface('../tamayura/'+key+'.glb').then(([surface])=>{
      surface.updateWorldMatrix(true,false);state.surface=surface;
    }).catch(()=>{state.retry=performance.now()+10000;}).finally(()=>{state.pending=null;});
  }
  const model=new T.Matrix4(),view=new T.Matrix4(),previous=new T.Matrix4(),inv=new T.Matrix4(),instance=new T.Matrix4();
  const localEye=new T.Vector3(),frustum=new T.Frustum(),test=new T.Sphere(new T.Vector3(),radius);
  const ground=relief(x,z);let frame=-1,lastSource;
  function update(renderer,scene,camera){
    if(frame===renderer.info.render.frame)return;
    frame=renderer.info.render.frame;model.copy(root.matrixWorld);model.elements[13]+=ground;
    view.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse).multiply(model);
    if(previous.equals(view)&&lastSource===state.surface&&(!state.retry||performance.now()<state.retry))return;
    lastSource=state.surface;previous.copy(view);frustum.setFromProjectionMatrix(view);
    localEye.copy(camera.position).applyMatrix4(inv.copy(model).invert());
    let lowCount=0,highCount=0;
    if(state.surface){near.geometry=state.surface.geometry;near.material=state.surface.material;}
    const {x:wx,y:wy,z:wz}=camera.position,eye=wy-relief(wx,wz);
    for(const p of poses){
      if(!p.visible(wx,eye,wz))continue;
      test.center.copy(p.center);if(!frustum.intersectsSphere(test))continue;
      const r=p.high?exitRange:range;
      const close=localEye.distanceToSquared(p.center)<r*r;
      if(close&&!state.surface)request();p.high=!!(close&&state.surface);
      if(p.high)near.setMatrixAt(highCount++,instance.copy(p.pose).multiply(state.surface.matrixWorld));
      else far.setMatrixAt(lowCount++,p.pose);
    }
    far.count=lowCount;near.count=highCount;far.instanceMatrix.needsUpdate=near.instanceMatrix.needsUpdate=true;
  }
  far.onBeforeRender=near.onBeforeRender=update;
  return K.addMesh(root);
}
