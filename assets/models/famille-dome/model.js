import {placeSingleDetail} from '../interior-architecture/single-detail.js';
import {colors, panes} from './proxy.js';

function firstPanes(T) {
  const bytes=Uint8Array.from(atob(panes),letter=>letter.charCodeAt(0));
  const source=new DataView(bytes.buffer);
  const palette=colors.map(hex=>new T.Color(hex));
  const positions=[], tints=[];
  for(let start=0;start<source.byteLength;start+=19){
    const tint=palette[source.getUint8(start+18)];
    for(let corner=0;corner<3;corner++){
      for(let axis=0;axis<3;axis++)positions.push(source.getInt16(start+corner*6+axis*2,true)/100);
      tints.push(tint.r,tint.g,tint.b);
    }
  }
  const g=new T.BufferGeometry();
  g.setAttribute('position',new T.Float32BufferAttribute(positions,3));
  g.setAttribute('color',new T.Float32BufferAttribute(tints,3));
  g.computeVertexNormals();
  return g;
}

export function placeDomeLining(K,x,z){
  const T=K.THREE;
  const material=new T.MeshLambertMaterial({vertexColors:true,side:T.DoubleSide});
  // Pale opal panes receive the cafe's electric wash as the outdoor skylight fades.
  material.onBeforeCompile=shader=>{
    shader.vertexShader='varying vec3 vPavilionPoint;\n'+shader.vertexShader.replace('#include <begin_vertex>',
      '#include <begin_vertex>\n vPavilionPoint=(modelMatrix*vec4(position,1.)).xyz;');
    shader.fragmentShader='varying vec3 vPavilionPoint;\n'+shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
      float warmWood=smoothstep(.055,.16,vColor.r-vColor.b);
      float strip=dot(vPavilionPoint,vec3(17.4,.75,11.2));
      float grain=sin(strip+1.3*sin(strip*.125)+.7*sin(vPavilionPoint.y*1.85));
      diffuseColor.rgb*=1.+warmWood*.045*grain/(1.+fwidth(strip));`);
    shader.fragmentShader=shader.fragmentShader.replace('#include <emissivemap_fragment>',
      '#include <emissivemap_fragment>\n totalEmissiveRadiance += vColor.rgb * (.13 + .19*smoothstep(.57,.72,vColor.g));');
  };
  material.customProgramCacheKey=()=>'famille-pavilion-panels';
  return placeSingleDetail(K,{
    name:'파미에파크 · 돔 안쪽 삼각 천장',file:'../famille-dome/lining.glb',
    at:[x,0,z],angle:0,fallback:firstPanes(T),fallbackMaterial:material,material,
    eyeHeight:7.5,floorTolerance:8.7,range:29,exitRange:34,
  });
}
