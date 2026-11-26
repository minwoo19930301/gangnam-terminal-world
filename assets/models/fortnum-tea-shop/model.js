import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {placeSingleDetail} from '../interior-architecture/single-detail.js';
import {relief} from '../../../js/banpo_relief.js';

export function fortnumShop(K,x,y,z,angle){
  const T=K.THREE,parts=[];
  function box(cx,cy,cz,w,h,d,tint){
    const geometry=new T.BoxGeometry(w,h,d).translate(cx,cy,cz);
    const color=new T.Color(tint), values=new Float32Array(geometry.getAttribute('position').count*3);
    for(let i=0;i<values.length;i+=3)color.toArray(values,i);
    geometry.setAttribute('color',new T.BufferAttribute(values,3));
    parts.push(geometry);
  }
  for(const side of [-1,1])box(side*1.41,1.23,-.10,.13,2.38,.26,0x997548);
  box(0,2.62,-.10,2.96,.48,.27,0x997548);
  box(0,.035,-2.26,2.91,.018,3.48,0xa8243c);
  const fallback=mergeGeometries(parts);
  parts.forEach(geometry=>geometry.dispose());
  const paint=new T.MeshPhongMaterial({vertexColors:true,side:T.DoubleSide,specular:0x30271c,shininess:21});
  // Keep the ivory channel letters lit at night. Tea labels and timber remain matte.
  paint.onBeforeCompile=shader=>{
    shader.fragmentShader=shader.fragmentShader.replace('#include <emissivemap_fragment>',`#include <emissivemap_fragment>
    float letters=smoothstep(.98,1.,vColor.r)*smoothstep(.92,.96,vColor.g)*smoothstep(.70,.77,vColor.b);
    totalEmissiveRadiance+=letters*vec3(.50,.45,.34);`);
  };
  const bounds=new T.Box3(new T.Vector3(-1.5,0,-4),new T.Vector3(1.5,3.09,.12));
  return placeSingleDetail(K,{
    name:'포트넘앤메이슨 · 목재 입구와 홍차 진열대',file:'../fortnum-tea-shop/tea-shop.glb',
    at:[x,y,z],angle,rigidGround:relief(x,z),fallback,fallbackMaterial:paint,material:paint,
    viewBounds:[bounds],range:13,exitRange:16,floorTolerance:2.1,eyeHeight:1.65
  });
}
