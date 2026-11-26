import {loadFixtureScene} from '../onebailey/load.js';
import {relief} from '../../../js/banpo_relief.js';
import {fixtures} from './bounds.js';

const displays=new Map(),features=new Map();
let displayMaterial;
const bufferUrl=(key,suffix)=>new URL(key+suffix,import.meta.url);

function request(slot,loader){
  if(slot.surface||slot.pending||performance.now()<slot.retry)return;
  slot.pending=loader().then(surface=>{slot.surface=surface;})
    .catch(()=>{slot.retry=performance.now()+5000;}).finally(()=>{slot.pending=null;});
}

function starter(T,key,record){
  const [a,y0,c,b,y1,d]=record.bounds,w=b-a,h=y1-y0;
  const pos=[],cols=[],indices=[];
  function quad(points,value){
    const first=pos.length/3,tint=new T.Color(value);
    for(const p of points){pos.push(...p);cols.push(tint.r,tint.g,tint.b);}
    indices.push(first,first+1,first+2,first,first+2,first+3);
  }
  const panel=(x0,lo,x1,hi,z,v)=>quad([[x0,lo,z],[x1,lo,z],[x1,hi,z],[x0,hi,z]],v);
  const deck=(x0,z0,x1,z1,y,v)=>quad([[x0,y,z0],[x0,y,z1],[x1,y,z1],[x1,y,z0]],v);
  if(key==='DaisoSign'){
    panel(a,y0,b,y1,d,0xb82630);
  }else if(key==='SelfCheckout'){
    panel(a,y0,b,y0+h*.59,d,0xd7d6d3);deck(a,c,b,d,y0+h*.59,0xa6a6a3);
    panel(a+w*.20,y0+h*.59,b-w*.12,y1,c+(d-c)*.60,0x484c4d);
  }else if(record.library==='market'){
    panel(a,y0,b,y1,c,0xd2cbc0);deck(a,c,b,d,y0+.026,0xc8beb0);
    panel(a,y0,b-w*.965,y1,d,0x80665c);panel(b-w*.035,y0,b,y1,d,0x80665c);
    panel(a,y1-.18,b,y1,d,0x8b7669);
  }else{
    panel(a,y0,b,y1,c,0xdddbd7);
    for(let i=0;i<5;i++){
      const y=y0+.08+i*(h-.22)/4;
      deck(a,c,b,d,y,0xd5d3d0);panel(a,y-.026,b,y+.012,d,0xa9a9a5);
    }
  }
  const g=new T.BufferGeometry();
  g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('color',new T.Float32BufferAttribute(cols,3));
  g.setIndex(indices);g.computeVertexNormals();
  g.boundingBox=new T.Box3(new T.Vector3(a,y0,c),new T.Vector3(b,y1,d));
  g.boundingSphere=g.boundingBox.getBoundingSphere(new T.Sphere());
  return g;
}

async function distant(T,key){
  const response=await fetch(bufferUrl(key,'.bin'));
  if(!response.ok)throw Error('Could not fetch '+key+' silhouette');
  const raw=new DataView(await response.arrayBuffer());
  if(raw.getUint32(0)!==0x47544652)throw Error('Invalid fixture silhouette '+key);
  const vertices=raw.getUint16(4,true),count=raw.getUint16(6,true);
  if(raw.byteLength!==8+9*vertices+2*count)throw Error('Incomplete fixture silhouette '+key);
  const xyz=new Float32Array(vertices*3),rgb=new Uint8Array(vertices*3),ids=new Uint16Array(count);
  let offset=8;
  for(let i=0;i<vertices;i++){
    for(let k=0;k<3;k++,offset+=2)xyz[i*3+k]=raw.getInt16(offset,true)/100;
    for(let k=0;k<3;k++,offset++)rgb[i*3+k]=raw.getUint8(offset);
  }
  for(let i=0;i<count;i++,offset+=2)ids[i]=raw.getUint16(offset,true);
  const g=new T.BufferGeometry();
  g.setAttribute('position',new T.BufferAttribute(xyz,3));g.setAttribute('color',new T.BufferAttribute(rgb,3,true));
  g.setIndex(new T.BufferAttribute(ids,1));g.computeVertexNormals();g.computeBoundingBox();g.computeBoundingSphere();
  g.name='원거리 상품 진열 · '+key;
  return g;
}

// Keep the instance transform permanently in metres. Switching from a quantized
// glTF to a metre-based proxy can then never enlarge an object for one frame.
async function native(T,url,nodeName,name){
  const scene=await loadFixtureScene(url),root=scene.getObjectByName(nodeName);
  let source;
  root?.traverse(n=>{if(n.isMesh)source=n;});
  if(!source)throw Error('Missing native retail mesh '+nodeName);
  const old=source.geometry,m=source.matrixWorld.elements,p=old.attributes.position;
  const next=new T.BufferGeometry(),xyz=new Float32Array(p.count*3);
  for(let i=0;i<p.count;i++){
    const x=p.getX(i),y=p.getY(i),z=p.getZ(i);
    xyz[3*i]=m[0]*x+m[4]*y+m[8]*z+m[12];
    xyz[3*i+1]=m[1]*x+m[5]*y+m[9]*z+m[13];
    xyz[3*i+2]=m[2]*x+m[6]*y+m[10]*z+m[14];
  }
  for(const [attr,value] of Object.entries(old.attributes))if(attr!=='position')next.setAttribute(attr,value);
  next.setAttribute('position',new T.BufferAttribute(xyz,3));next.setIndex(old.index);
  const uniform=m[0]>0&&m[0]===m[5]&&m[0]===m[10]&&![m[1],m[2],m[4],m[6],m[8],m[9]].some(Boolean);
  if(!uniform&&old.attributes.normal){
    const n=old.attributes.normal,normal=new T.Vector3(),matrix=new T.Matrix3().getNormalMatrix(source.matrixWorld);
    const values=new Float32Array(n.count*3);
    for(let i=0;i<n.count;i++)normal.fromBufferAttribute(n,i).applyNormalMatrix(matrix).toArray(values,i*3);
    next.setAttribute('normal',new T.BufferAttribute(values,3));
  }
  next.computeBoundingBox();next.computeBoundingSphere();next.name=name;
  return next;
}

function cache(T,key,record){
  if(!displays.has(key)){
    displays.set(key,{starter:starter(T,key,record),distant:{retry:0},close:{retry:0}});
  }
  return displays.get(key);
}

export function placeFixtureDisplay(K,key,name,placements,feature){
  if(!placements.length)return;
  const T=K.THREE,record=fixtures[key];
  if(!record)throw Error('Unknown Gyeongbu fixture '+key);
  const state=cache(T,key,record),pose=new T.Object3D();
  displayMaterial??=new T.MeshLambertMaterial({vertexColors:true,side:T.DoubleSide});
  const body=new T.InstancedMesh(state.starter,displayMaterial,placements.length);
  body.name=name;body.userData.fixtureDetail='initial';
  placements.forEach(([x,y,z,angle],i)=>{
    pose.position.set(x,y,z);pose.rotation.y=angle;pose.updateMatrix();body.setMatrixAt(i,pose.matrix);
  });
  body.computeBoundingSphere();body.boundingSphere.radius+=.18;
  if(feature&&!features.has(feature.file))features.set(feature.file,{retry:0});
  const featureState=feature&&features.get(feature.file);
  const frustum=new T.Frustum(),view=new T.Matrix4(),instance=new T.Matrix4(),projection=new T.Matrix4();
  const bounds=state.starter.boundingBox,mid=bounds.getCenter(new T.Vector3());
  const items=[],rootMatrix=new T.Matrix4(),lastEye=new T.Vector3(),lastRotation=new T.Quaternion(),lastLens=new T.Matrix4();
  let poseVersion=-1,minSquared=Infinity;
  body.onBeforeRender=(_renderer,_scene,camera)=>{
    // Area pruning can compact an instance bank. Rebuild the retained poses
    // after pruning instead of testing shop locations that are no longer in it.
    const changed=poseVersion!==body.instanceMatrix.version||items.length!==body.count||!rootMatrix.equals(body.matrixWorld);
    if(changed){
      items.length=0;poseVersion=body.instanceMatrix.version;rootMatrix.copy(body.matrixWorld);
      for(let i=0;i<body.count;i++){
        body.getMatrixAt(i,instance);
        const world=new T.Matrix4().multiplyMatrices(rootMatrix,instance),e=world.elements;
        const ground=relief(e[12],e[14]),floor=(record.library==='daiso'?-4:e[13])+ground;
        e[13]+=ground;
        items.push({world,floor,center:mid.clone().applyMatrix4(world)});
      }
    }
    if(changed||camera.position.distanceToSquared(lastEye)>.015||Math.abs(camera.quaternion.dot(lastRotation))<.999985||
       !camera.projectionMatrix.equals(lastLens)){
      lastEye.copy(camera.position);lastRotation.copy(camera.quaternion);lastLens.copy(camera.projectionMatrix);
      minSquared=Infinity;
      view.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);
      for(const {world,floor,center} of items){
        const eye=camera.position.y-floor;
        if(eye<-.50||eye>4.17)continue;
        const square=center.distanceToSquared(camera.position);
        if(square>54*54||square>=minSquared)continue;
        projection.multiplyMatrices(view,world);frustum.setFromProjectionMatrix(projection,camera.coordinateSystem);
        if(frustum.intersectsBox(bounds))minSquared=square;
      }
    }
    const closeRange=body.userData.fixtureDetail==='native'?25:19;
    const featureRange=body.userData.fixtureDetail==='featured'?16:12;
    const featured=feature&&minSquared<featureRange*featureRange&&
      (!feature.visibleFrom||feature.visibleFrom(camera.position));
    if(minSquared<54*54)request(state.distant,()=>distant(T,key));
    if(featured)request(featureState,()=>native(T,feature.url,feature.file,'근접 상품 진열 · '+feature.file));
    else if(minSquared<closeRange*closeRange)request(state.close,()=>native(T,bufferUrl(key,'.glb'),key,'기본 상품 진열 · '+key));
    const useFeatured=featured&&featureState.surface;
    const useNative=minSquared<closeRange*closeRange&&state.close.surface;
    body.geometry=useFeatured||useNative||state.distant.surface||state.starter;
    body.userData.fixtureDetail=useFeatured?'featured':useNative?'native':state.distant.surface?'distant':'initial';
  };
  K.addMesh(body);
  return body;
}
