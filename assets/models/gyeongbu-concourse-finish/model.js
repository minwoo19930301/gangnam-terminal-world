import {placeSingleDetail} from '../interior-architecture/single-detail.js';
import {vertices,triangles} from './proxy.js';

function distantFinish(T) {
  const bytes=text=>Uint8Array.from(atob(text),c=>c.charCodeAt(0));
  const data=bytes(vertices),reader=new DataView(data.buffer),count=data.length/9;
  const position=new Float32Array(3*count),color=new Uint8Array(3*count);
  for(let i=0;i<count;i++){
    for(let axis=0;axis<3;axis++)position[i*3+axis]=reader.getInt16(i*9+2*axis,true)/1000;
    color.set(data.subarray(i*9+6,i*9+9),i*3);
  }
  const index=new DataView(bytes(triangles).buffer),indices=new Uint16Array(index.byteLength/2);
  for(let i=0;i<indices.length;i++)indices[i]=index.getUint16(2*i,true);
  const mesh=new T.BufferGeometry();
  mesh.setAttribute('position',new T.BufferAttribute(position,3));
  mesh.setAttribute('color',new T.BufferAttribute(color,3,true));
  mesh.setIndex(new T.BufferAttribute(indices,1));
  return mesh;
}

export function placePassengerFinish(K,x,z,angle){
  const T=K.THREE;
  return placeSingleDetail(K,{name:'경부선 대합실 · 석재 바닥과 곡면 간접 천장',file:'../gyeongbu-concourse-finish/concourse-finish.glb',
    at:[x,0,z],angle,fallback:distantFinish(T),fallbackMaterial:new T.MeshBasicMaterial({vertexColors:true}),
    range:22,exitRange:30,eyeHeight:1.6,floorTolerance:2.9});
}
