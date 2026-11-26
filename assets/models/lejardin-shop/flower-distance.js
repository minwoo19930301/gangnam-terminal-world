import * as T from 'three';
import {relief} from '../../../js/banpo_relief.js';
import {loadArchitecture} from '../interior-architecture/model.js';

const card=new T.PlaneGeometry(.155,.155),petalMaterial=new T.MeshLambertMaterial({vertexColors:true,side:T.DoubleSide});
const images=new Map(),nativeHeads=new Map();
export function photographedHead(name,texture){
  if(!images.has(name))images.set(name,texture(name+'-views.webp').then(map=>{
    const mat=new T.MeshBasicMaterial({map,alphaTest:.32,side:T.DoubleSide,alphaToCoverage:true});
    mat.onBeforeCompile=shader=>{
      shader.vertexShader=shader.vertexShader.replace('#include <project_vertex>',`
        vec4 anchor=modelMatrix*instanceMatrix*vec4(0.,.014,0.,1.);
        anchor.y+=banpoHeight(anchor.xz);
        vec3 axis=normalize(mat3(modelMatrix)*mat3(instanceMatrix)*vec3(0.,1.,0.));
        float elevation=dot(axis,normalize(cameraPosition-anchor.xyz));
        float slice=elevation>.83?2.:elevation>.34?1.:0.;
        vMapUv.y=(vMapUv.y+slice)/3.;
        vec4 mvPosition=viewMatrix*anchor;
        mvPosition.xy+=position.xy*length(instanceMatrix[0].xyz);
        gl_Position=projectionMatrix*mvPosition;
      `);
    };
    mat.customProgramCacheKey=()=>'lejardin-flower-three-native-elevations';
    return new T.Mesh(card,mat);
  }).catch(e=>{images.delete(name);throw e;}));return images.get(name);
}
function closeHead(name){
  let state=nativeHeads.get(name);
  if(!state){state={mesh:null,pending:null,retry:0};nativeHeads.set(name,state);}
  if(!state.mesh&&!state.pending&&performance.now()>=state.retry){
    state.pending=loadArchitecture('../lejardin-shop/'+name+'.glb').then(([mesh])=>{
      mesh.material=petalMaterial;mesh.updateWorldMatrix(true,false);state.mesh=mesh;
    }).catch(()=>{state.retry=performance.now()+10000;}).finally(()=>{state.pending=null;});
  }
  return state.mesh;
}
export function flowerDraws(root,names){
  const sets=new Map(),empty=new T.BufferGeometry();empty.setAttribute('position',new T.Float32BufferAttribute([],3));
  for(const name of names){
    const pair=['실물 꽃잎','거리에 따른 송이'].map(label=>{
      const mesh=new T.InstancedMesh(empty,petalMaterial,64);mesh.name='르자당 '+label+' · '+name;
      mesh.frustumCulled=false;mesh.count=0;mesh.visible=false;root.add(mesh);return mesh;
    });sets.set(name,{near:pair[0],middle:pair[1],stems:[]});
  }
  const matrix=new T.Matrix4(),q=new T.Quaternion(),pos=new T.Vector3(),scale=new T.Vector3(),clip=new T.Matrix4();
  const frustum=new T.Frustum(),bounds=new T.Sphere(new T.Vector3(),.103),world=new T.Matrix4(),last=new T.Matrix4();
  let ready=false,needRefresh=true,wasVisible=false;
  return (shown,data,camera)=>{
    if(!shown){if(wasVisible)for(const s of sets.values())s.near.visible=s.middle.visible=false;wasVisible=false;return;}
    if(!data)return;
    if(!ready){
      for(const [name,[preview,transforms]] of Object.entries(data)){
        const set=sets.get(name);set.middle.geometry=preview.geometry;set.middle.material=preview.material;
        set.stems=transforms.map(row=>{
          pos.fromArray(row,0);q.fromArray(row,3);scale.fromArray(row,7);
          const transform=new T.Matrix4().compose(pos,q,scale);
          return {transform,point:new T.Vector3(0,.014,0).applyMatrix4(transform),close:false};
        });
      }
      ready=true;
    }
    clip.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);
    if(wasVisible&&!needRefresh&&clip.equals(last))return;
    last.copy(clip);wasVisible=true;needRefresh=false;frustum.setFromProjectionMatrix(clip);
    world.copy(root.matrixWorld);world.elements[13]+=relief(root.position.x,root.position.z);
    for(const [name,set] of sets){
      let near=0,middle=0,full=null;
      for(const stem of set.stems){
        bounds.center.copy(stem.point).applyMatrix4(world);
        if(!frustum.intersectsSphere(bounds))continue;
        const dist=camera.position.distanceToSquared(bounds.center);
        stem.close=dist<(stem.close?1.16**2:.99**2);
        if(stem.close){full??=closeHead(name);if(!full)needRefresh=true;}
        if(stem.close&&full){
          set.near.geometry=full.geometry;set.near.material=full.material;
          set.near.setMatrixAt(near++,matrix.multiplyMatrices(stem.transform,full.matrixWorld));
        }else set.middle.setMatrixAt(middle++,stem.transform);
      }
      set.near.count=near;set.middle.count=middle;set.near.visible=near>0;set.middle.visible=middle>0;
      if(near)set.near.instanceMatrix.needsUpdate=true;if(middle)set.middle.instanceMatrix.needsUpdate=true;
    }
  };
}
