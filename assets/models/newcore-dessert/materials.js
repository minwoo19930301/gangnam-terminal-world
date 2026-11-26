import * as THREE from 'three';

let sample;
export function glazedSample(){
  return sample??=new THREE.TextureLoader().loadAsync(new URL('./gloss.webp',import.meta.url).href).then(tex=>{
    tex.colorSpace=THREE.SRGBColorSpace;tex.anisotropy=4;return tex;
  }).catch(e=>{sample=null;throw e;});
}
export function counterFinish(shader,key,atlas,time){
  if(key==='island'||key==='buffet'||key==='screen'){
    shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 counterPosition;')
      .replace('#include <project_vertex>','#include <project_vertex>\ncounterPosition=(modelMatrix*vec4(transformed,1.)).xyz;');
    shader.fragmentShader=shader.fragmentShader.replace('#include <common>',`#include <common>
      varying vec3 counterPosition;
      float quartzHash(vec2 p){vec3 q=fract(vec3(p.xyx)*.1031);q+=dot(q,q.yzx+33.33);return fract((q.x+q.y)*q.z);}
      float quartzNoise(vec2 p){vec2 c=floor(p),a=fract(p);a=a*a*(3.-2.*a);return mix(mix(quartzHash(c),quartzHash(c+vec2(1,0)),a.x),mix(quartzHash(c+vec2(0,1)),quartzHash(c+1.),a.x),a.y);}`);
    if(key==='screen'){
      shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
      if(vColor.g>vColor.r*1.2&&vColor.r>.1){
        vec2 glassUV=vec2(dot(counterPosition.xz,vec2(.383,.924)),counterPosition.y);
        vec2 grid=abs(fract(vec2(glassUV.x+glassUV.y,glassUV.x-glassUV.y)*68.)-.5);
        float weave=1.-smoothstep(.045,.108,min(grid.x,grid.y));
        float w=1.-smoothstep(.18,1.2,length(fwidth(glassUV)*68.));
        diffuseColor.rgb*=1.-.32*w*weave;
      }`);
    }else{
      shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
        if(vColor.r>.092&&vColor.r<.185&&vColor.r>vColor.g*1.08){
          vec2 x=counterPosition.xz*vec2(1.7,2.9);
          float wind=quartzNoise(x*1.8)+.48*quartzNoise(x*6.1)+.13*quartzNoise(x*21.);
          float grain=quartzNoise(x*39.)+.5*quartzNoise(x*96.);
          float linearVein=abs(sin(x.x*7.2+x.y*3.6+wind*8.));
          float vein=(1.-smoothstep(.016,.119,linearVein))*(.28+.72*quartzNoise(x*7.3));
          diffuseColor.rgb*=.72+.43*wind+.16*(grain-.6);
          diffuseColor.rgb+=vec3(.11,.098,.077)*vein;
        }`);
    }
  }
  if(!atlas)return;
  shader.uniforms.fondueGloss={value:atlas};
  shader.uniforms.fondueTime=time;
  shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 fondueUV;')
    .replace('#include <begin_vertex>','#include <begin_vertex>\nfondueUV=position;');
  shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nuniform sampler2D fondueGloss;uniform float fondueTime;varying vec3 fondueUV;');
  const shade=key==='chocolate'?`
    float angle=atan(fondueUV.z,fondueUV.x);
    float ribs=sin(7.*angle+1.7*fondueUV.y)+.44*sin(13.*angle-2.5*fondueUV.y);
    matUV.x+=.009*ribs;matUV.y+=.009*sin(23.*fondueUV.y+2.5*fondueTime+ribs);
    float swatch=0.;float weight=.82;
  `:`
    float silver=step(.22,min(vColor.g,vColor.b));
    float enamel=1.-smoothstep(.018,.064,max(max(vColor.r,vColor.g),vColor.b));
    float swatch=silver+2.*enamel;float weight=mix(.73,.89,enamel);
  `;
  shader.fragmentShader=shader.fragmentShader.replace('#include <envmap_fragment>',`#include <envmap_fragment>
    vec3 eye=normalize(vViewPosition);
    vec3 tangent=normalize(vec3(eye.z,0.,-eye.x));
    vec3 up=cross(eye,tangent);
    vec2 matUV=vec2(dot(tangent,normal),dot(up,normal))*.481+.5;
    `+shade+`
    vec2 uv=vec2((clamp(matUV.x,.015,.985)+swatch)/3.,clamp(matUV.y,.015,.985));
    vec3 sampledGloss=texture2D(fondueGloss,uv).rgb;
    outgoingLight=mix(outgoingLight,sampledGloss,weight);
  `);
}
