import {loadArchitecture} from '../interior-architecture/model.js';
import {relief} from '../../../js/banpo_relief.js';
import {boxSilhouette} from '../interior-architecture/box-silhouette.js';
import {placeSingleDetail} from '../interior-architecture/single-detail.js';

// Native local X runs along the signed wall. Local Z points out across the terrace.
export const patioTables=[[-3.80,1.25],[-.98,1.25],[1.85,1.25],[4.61,1.25],[-2.39,4.00],[.43,4.00],[3.25,4.00]];
// The same six fixtures are recorded with their native Blender lights in build.py.
const lampFixtures=[[-5.7,2.185,5.67,.166,.157,2.8],[5.48,2.185,5.67,.166,.157,2.8],
  ...[-4.95,-1.22,2.44,5.40].map(x=>[x,2.739,.622,.043,.01,1.55])];

// A small lightmap lets the uninterrupted ground receive light between its four
// vertices. The table footprints soften the light where the furniture shades it.
function floorLightMap(T){
  const width=108,height=32,data=new Uint8Array(width*height);
  for(let row=0;row<height;row++)for(let col=0;col<width;col++){
    const x=-12.58+26.86*(col+.5)/width,d=-.54+7.78*(row+.5)/height;
    let lux=0,shade=1;
    for(const [lx,h,ld, , ,power] of lampFixtures){
      const dist2=(lx-x)**2+(ld-d)**2+h*h;
      const fade=1-T.MathUtils.smoothstep(dist2,20,53);
      lux+=fade*(.12+.88*h/Math.sqrt(dist2))*power/(1+dist2);
    }
    for(const [tx,td] of patioTables){
      const edge=Math.max(Math.abs(x-tx)-.53,Math.abs(d-td)-.31);
      shade=Math.min(shade,.26+.74*T.MathUtils.smoothstep(edge,-.15,.43));
    }
    data[row*width+col]=Math.round(Math.min(1,lux*shade)*255);
  }
  const texture=new T.DataTexture(data,width,height,T.RedFormat);
  texture.magFilter=T.LinearFilter;texture.minFilter=T.LinearFilter;texture.needsUpdate=true;
  return texture;
}

function terraceFinish(K,at,yaw){
  const T=K.THREE;
  const material=new T.MeshLambertMaterial({vertexColors:true,side:T.DoubleSide});
  const night={value:0},c=Math.cos(yaw),s=Math.sin(yaw),floorMap=floorLightMap(T);
  const lamps=lampFixtures.map(([x,h,d, , ,power])=>new T.Vector4(
    at[0]+c*x+s*d,at[1]+h,at[2]-s*x+c*d,power));
  K.onSolarAltitude?.(altitude=>{night.value=T.MathUtils.clamp((-altitude-3)/6,0,1);});
  material.onBeforeCompile=shader=>{
    shader.uniforms.patioLamps={value:lamps};
    shader.uniforms.patioNight=night;
    shader.uniforms.patioFrame={value:new T.Vector4(at[0],at[2],c,s)};
    shader.uniforms.patioGround={value:at[1]};
    shader.uniforms.patioFloorMap={value:floorMap};
    shader.vertexShader=shader.vertexShader.replace('#include <common>',`
      #include <common>
      uniform vec4 patioLamps[6];
      uniform float patioNight;
      uniform vec4 patioFrame;
      varying vec3 vFloorSample;
      uniform float patioGround;
      varying float vPatioLight;`).replace('#include <project_vertex>',`
      #include <project_vertex>
      vPatioLight=0.0;
      vFloorSample=vec3(0.0);
      if(patioNight>0.0){
        vec4 patioVertex=vec4(transformed,1.0);
        #ifdef USE_INSTANCING
          patioVertex=instanceMatrix*patioVertex;
        #endif
        vec3 pos=(modelMatrix*patioVertex).xyz;
        if(pos.y<patioGround+.035){
          vec2 offset=pos.xz-patioFrame.xy;
          vec2 local=vec2(dot(offset,vec2(patioFrame.z,-patioFrame.w)),dot(offset,patioFrame.wz));
          vFloorSample=vec3((local+vec2(12.58,.54))/vec2(26.86,7.78),patioNight);
        }else{
          vec3 face=inverseTransformDirection(transformedNormal,viewMatrix);
          for(int i=0;i<6;i++){
            vec3 ray=patioLamps[i].xyz-pos;
            float distance2=dot(ray,ray);
            float diffuse=max(dot(face,ray)*inversesqrt(max(.001,distance2)),0.0);
            float cutoff=1.0-smoothstep(20.0,53.0,distance2);
            vPatioLight+=cutoff*(.12+.88*diffuse)*patioLamps[i].w/(1.0+distance2);
          }
          vPatioLight*=patioNight;
        }
      }`);
    shader.fragmentShader=shader.fragmentShader.replace('#include <common>',`
      #include <common>
      uniform sampler2D patioFloorMap;
      varying vec3 vFloorSample;
      varying float vPatioLight;`).replace('#include <opaque_fragment>',`
      float warmLight=vPatioLight;
      if(vFloorSample.z>.001)warmLight+=texture2D(patioFloorMap,vFloorSample.xy).r*vFloorSample.z;
      outgoingLight+=diffuseColor.rgb*vec3(1.0,.768,.523)*warmLight;
      #include <opaque_fragment>`);
  };
  return material;
}
let fallback,stove,signProbe,hidden,tableProxy,tableSource,pending,retryAt=0;

function placeTableInstances(K,at,yaw,paint){
  const T=K.THREE;
  tableProxy??=boxSilhouette(T,[[0,.68,0,1.44,.075,.98,0x5f584c],[0,.07,0,.67,.61,.42,0x514e44]]);
  const root=new T.Group(),tables=new T.InstancedMesh(tableProxy,paint,patioTables.length);
  tables.name='포석정 · 일곱 식탁의 배치';
  tables.userData.nativePlacementInstances=true;
  root.name='포석정 · 공용 4인 식탁과 의자';root.position.set(...at);root.rotation.y=yaw;root.add(tables);
  const matrix=new T.Matrix4(),projection=new T.Matrix4(),frustum=new T.Frustum();
  const boxes=patioTables.map(([x,d])=>new T.Box3(new T.Vector3(x-.73,0,d-.98),new T.Vector3(x+.73,.91,d+.98)));
  const ground=relief(at[0],at[2]);
  function use(source){
    tables.geometry=source?.geometry??tableProxy;
    for(const [i,[x,d]] of patioTables.entries()){
      matrix.makeTranslation(x,0,d);if(source)matrix.multiply(source.matrixWorld);tables.setMatrixAt(i,matrix);
    }
    tables.instanceMatrix.needsUpdate=true;tables.computeBoundingSphere();
  }
  use(null);
  tables.onBeforeRender=(_renderer,_scene,camera)=>{
    const p=camera.position,range=tables.geometry===tableProxy?18:24;
    const near=Math.abs(p.y-at[1]-ground-1.3)<2.7 && (p.x-at[0])**2+(p.z-at[2])**2<range*range;
    if(near&&!tableSource&&!pending&&performance.now()>=retryAt){
      matrix.copy(root.matrixWorld);matrix.elements[13]+=ground;
      projection.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse).multiply(matrix);
      frustum.setFromProjectionMatrix(projection);
      if(boxes.some(b=>frustum.intersectsBox(b))){
        pending=loadArchitecture('../gyeongbu-rooftop/dining-set.glb').then(([source])=>{
          source.updateWorldMatrix(true,false);tableSource=source;
        }).catch(()=>{retryAt=performance.now()+10000;}).finally(()=>{pending=null;});
      }
    }
    const next=near?tableSource:null;
    if(tables.geometry!==(next?.geometry??tableProxy))use(next);
  };
  K.addMesh(root);
}
function placeNightLamps(K,at,yaw){
  if(!K.onNight)return;
  const T=K.THREE,root=new T.Group(),transform=new T.Object3D();
  const bulbs=new T.InstancedMesh(new T.SphereGeometry(1,16,10),new T.MeshBasicMaterial({color:0xffe7c2}),6);
  lampFixtures.forEach(([x,y,z,r,h],i)=>{
    transform.position.set(x,y,z);transform.scale.set(r,h,r);transform.updateMatrix();bulbs.setMatrixAt(i,transform.matrix);
  });
  bulbs.instanceMatrix.needsUpdate=true;bulbs.computeBoundingSphere();
  root.name='옥상 산책로 · 유백색 구등과 처마등';root.position.set(...at);root.rotation.y=yaw;
  root.add(bulbs);K.addMesh(root);K.onNight(night=>{bulbs.visible=night;});
}

export function placeRooftopDining(K,at,mealAt,signAt,yaw){
  const T=K.THREE;
  const paint=terraceFinish(K,at,yaw);
  fallback??=boxSilhouette(T,[
    [0,0,-.67,12.6,2.62,.14,0x726e61],[0,2.52,-.10,12.7,.14,1.32,0xd4d0bf],
    [-5.7,0,5.67,.075,2.04,.075,0x4e554e],[5.48,0,5.67,.075,2.04,.075,0x4e554e],
  ]);
  fallback.boundingSphere??=new T.Sphere(new T.Vector3(.85,1.35,3.28),14.45);
  stove??=boxSilhouette(T,[[0,.722,0,.41,.026,.42,0x737d77]]);
  hidden??=new T.MeshBasicMaterial({colorWrite:false,depthWrite:false});
  signProbe??=new T.BoxGeometry(43,4.08,.02).translate(2.3,4.69,.43);
  placeTableInstances(K,at,yaw,paint);
  placeNightLamps(K,at,yaw);
  const atRoof={angle:yaw,material:paint,fallbackMaterial:paint,eyeHeight:1.3,floorTolerance:2.7};
  placeSingleDetail(K,{...atRoof,at,name:'포석정 · 옥상 점포와 좌석',file:'../gyeongbu-rooftop/terrace.glb',
    fallback,range:18,exitRange:24,viewBounds:[
      new T.Box3(new T.Vector3(-6.40,0,-.75),new T.Vector3(6.40,2.83,5.94)),
      new T.Box3(new T.Vector3(-12.64,.30,7.22),new T.Vector3(14.34,1.12,7.28)),
    ]});
  placeSingleDetail(K,{...atRoof,at:signAt,name:'경부선 옥상 · 대형 청색 채널 글자',file:'../gyeongbu-rooftop/sign.glb',
    fallback:signProbe,fallbackMaterial:hidden,range:30,exitRange:38,viewBounds:[new T.Box3(new T.Vector3(-19.20,2.65,.41),new T.Vector3(23.80,6.74,.69))]});
  placeSingleDetail(K,{...atRoof,at:mealAt,name:'포석정 · 불판과 상차림',file:'../gyeongbu-rooftop/tabletop.glb',
    fallback:stove,range:5.25,exitRange:7.5,viewBounds:[new T.Box3(new T.Vector3(-.70,.72,-.49),new T.Vector3(.70,.99,.49))]});
}
