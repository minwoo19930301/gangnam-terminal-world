import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {placeSingleDetail} from '../interior-architecture/single-detail.js';
import {relief} from '../../../js/banpo_relief.js';

export function arabicaFront(K,x,y,z,yaw) {
  const T=K.THREE, parts=[];
  function panel(x,h,depth,w,height,hex) {
    const geometry=new T.BoxGeometry(w,height,.16).translate(x,h,depth);
    const color=new T.Color(hex), values=new Float32Array(geometry.attributes.position.count*3);
    for(let i=0;i<values.length;i+=3)color.toArray(values,i);
    geometry.setAttribute('color',new T.Float32BufferAttribute(values,3));
    parts.push(geometry);
  }
  for(const side of [-1,1]) {
    panel(side*3.04,1.53,-.12,1.33,3.06,0xaa8054);
    panel(side*2.36,1.43,-.14,.21,2.80,0xe9e8e3);
  }
  panel(0,3.04,-.12,7.51,.53,0xaa8054);
  panel(0,2.72,-.14,4.9,.19,0xe9e8e3);
  const proxy=mergeGeometries(parts);
  parts.forEach(p=>p.dispose());
  const paint=new T.MeshPhongMaterial({vertexColors:true,side:T.DoubleSide,specular:0x24201d,shininess:30});
  // Warm white channel letters and sidelights are illuminated in the branch photo.
  paint.onBeforeCompile=shader=>{
    shader.fragmentShader=shader.fragmentShader.replace('#include <emissivemap_fragment>',`#include <emissivemap_fragment>
    float lettering=smoothstep(.96,1.,vColor.r)*smoothstep(.08,.18,vColor.g-vColor.b);
    float pale=smoothstep(.68,.93,min(vColor.r,min(vColor.g,vColor.b)));
    totalEmissiveRadiance+=pale*vec3(.17,.17,.16);
    totalEmissiveRadiance+=lettering*vec3(.52,.47,.32);`);
  };
  placeSingleDetail(K,{
    name:'스위트 파크 · %아라비카 입면',file:'../sweet-arabica/entrance.glb',
    at:[x,y,z],angle:yaw,rigidGround:relief(x,z),fallback:proxy,
    fallbackMaterial:paint,material:paint,range:15,exitRange:19,floorTolerance:2.1,eyeHeight:1.65
  });
}
