import * as lowPortal from './portal-proxy.js';
import * as lowTower from './tower-proxy.js';
import * as lowCafes from '../gyeongbu-front-cafes/cafes-proxy.js';
import {loadFixtureScene} from '../onebailey/load.js';
import {relief} from '../../../js/banpo_relief.js';

const sources={
  portal:{proxy:lowPortal,range:43,leave:53,behind:-12,height:12,focus:[-7.1,.12,2.48,7.9,8.67,2.68],name:'경부선 정문 · 석재 차양과 영문 명판'},
  tower:{proxy:lowTower,range:71,leave:83,behind:-7,height:51,focus:[-5.6,5.4,-.52,3.3,46,.72],name:'경부선 명판탑 · 한글 채널 문자와 적갈색 외벽'},
  cafes:{proxy:lowCafes,file:'../gyeongbu-front-cafes/cafes.glb',range:46,leave:56,behind:-3,height:19,focus:[-11.60,.10,-.27,10.75,7.67,.48],upper:[-4.8,7.67,-4.91,3.63,16.18,-1.41],name:'경부선 부속상가 · 이디야와 달리나인 거리 정면'},
};

function distantGeometry(T,source){
  const decode=text=>Uint8Array.from(atob(text),s=>s.charCodeAt(0));
  const data=decode(source.vertices),r=new DataView(data.buffer);
  const n=data.length/9,pos=new Float32Array(n*3),color=new Uint8Array(n*3);
  for(let i=0;i<n;i++){
    for(let k=0;k<3;k++)pos[3*i+k]=r.getInt16(9*i+2*k,true)/100;
    color.set(data.subarray(9*i+6,9*i+9),3*i);
  }
  const inds=new DataView(decode(source.triangles).buffer),ix=new Uint16Array(inds.byteLength/2);
  for(let i=0;i<ix.length;i++)ix[i]=inds.getUint16(2*i,true);
  const g=new T.BufferGeometry();
  g.setAttribute('position',new T.BufferAttribute(pos,3));g.setAttribute('color',new T.BufferAttribute(color,3,true));
  g.setIndex(new T.BufferAttribute(ix,1));g.computeVertexNormals();g.computeBoundingBox();g.computeBoundingSphere();
  return g;
}

export function placeGyeongbuEntrance(K,key,x,z,angle){
  const T=K.THREE,s=sources[key],base=s.low??=distantGeometry(T,s.proxy);
  const root=new T.Group(),lowMat=new T.MeshLambertMaterial({vertexColors:true});
  const body=new T.Mesh(base,lowMat);
  root.name=s.name;root.position.set(x,0,z);root.rotation.y=angle;
  body.matrixAutoUpdate=false;root.add(body);
  const plane=new T.Matrix4(),projection=new T.Matrix4(),frustum=new T.Frustum(),ground=relief(x,z);
  const focus=new T.Box3(new T.Vector3(...s.focus.slice(0,3)),new T.Vector3(...s.focus.slice(3)));
  const upper=s.upper&&new T.Box3(new T.Vector3(...s.upper.slice(0,3)),new T.Vector3(...s.upper.slice(3)));
  const overhead=new T.Box3(new T.Vector3(-4.5,5.48,-3.97),new T.Vector3(5.5,5.54,2.56));
  const outwardX=Math.sin(angle),outwardZ=Math.cos(angle);
  const enclosures=K.osmFind(b=>b.type!=='no'&&b.type!=='roof'&&b.poly.every(([bx,bz])=>
    (bx-x)*outwardX+(bz-z)*outwardZ>1&&Math.hypot(bx-x,bz-z)<s.leave+24
  )).map(b=>({bounds:K.polyBBox(b.poly),poly:b.poly,lo:b.minHeight||0,hi:b.height||8}));
  let detail,applied=false;
  body.onBeforeRender=(_renderer,_scene,camera)=>{
    const dx=camera.position.x-x,dz=camera.position.z-z,d=dx*outwardX+dz*outwardZ;
    const h=camera.position.y-ground,r=applied?s.leave:s.range;
    const allowed=h>-.20&&h<s.height&&d>s.behind&&dx*dx+dz*dz<r*r;
    let visible=false;
    if(allowed){
      plane.copy(root.matrixWorld);plane.elements[13]+=ground;
      projection.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse).multiply(plane);
      frustum.setFromProjectionMatrix(projection,camera.coordinateSystem);
      visible=frustum.intersectsBox(focus);
      if(!visible&&upper)visible=frustum.intersectsBox(upper);
      if(!visible&&key==='portal'&&d<2.60&&-camera.matrixWorld.elements[9]>.15)visible=frustum.intersectsBox(overhead);
      // From beside the lettering the player can also study the ceramic seams at arm's length.
      const along=dx*outwardZ-dz*outwardX;
      if(!visible&&key==='tower'&&d>-.1&&d<8&&along>-21&&along<15)visible=frustum.intersectsBox(base.boundingBox);
      // In a separate street building the coarse frontage suffices for a glimpse through a window.
      if(visible)for(const {bounds:[x0,z0,x1,z1],poly,lo,hi} of enclosures){
        const {x:cx,y:cy,z:cz}=camera.position;
        if(cx<x0||cx>x1||cz<z0||cz>z1)continue;
        const localHeight=cy-relief(cx,cz);
        if(localHeight>lo&&localHeight<hi&&K.pointInPoly(cx,cz,poly)){visible=false;break;}
      }
    }
    if(visible&&!s.parts&&!s.pending&&performance.now()>=(s.retryAt||0)){
      s.pending=loadFixtureScene(new URL(s.file||'./'+key+'.glb',import.meta.url)).then(scene=>{
        s.parts={stone:scene.getObjectByName(key+'_Stone'),others:scene.children.filter(p=>p.isMesh&&p.name!==key+'_Stone')};
      }).catch(()=>{s.retryAt=performance.now()+10000;}).finally(()=>{s.pending=undefined;});
    }
    const full=!!(visible&&s.parts);
    if(full===applied)return;
    if(full){
      body.geometry=s.parts.stone.geometry;body.material=s.parts.stone.material;body.matrix.copy(s.parts.stone.matrixWorld);
      if(!detail){
        detail=s.parts.others.map(p=>{
          const obj=new T.Mesh(p.geometry,p.material);obj.name=p.name;obj.matrixAutoUpdate=false;obj.matrix.copy(p.matrixWorld);
          root.add(obj);obj.updateMatrixWorld(true);return obj;
        });
      }
    }else{
      body.geometry=base;body.material=lowMat;body.matrix.identity();
    }
    if(detail)for(const piece of detail)piece.visible=full;
    body.updateWorldMatrix(true,false);applied=full;
  };
  return K.addMesh(root);
}
