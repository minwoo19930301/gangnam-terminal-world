import {pane} from './mirror-pane.js';

let geometry,panorama,pending,retryAfter=0;
const imageURL=new URL('./mirror-room.webp',import.meta.url);

// Reflected rays first hit the walls of the studio, then the hall through the open doorway.
// The pre-rendered panorama costs one texture sample and no additional scene render.
const fragment=`
#include <common>
#include <logdepthbuf_pars_fragment>
uniform sampler2D panorama;
uniform vec3 localEye;
uniform float ready;
varying vec3 surfacePoint;
vec3 firstBoxHit(vec3 p,vec3 ray,vec3 low,vec3 high){
  vec3 safeRay=mix(vec3(0.00001),ray,step(vec3(0.00001),abs(ray)));
  vec3 travel=max((low-p)/safeRay,(high-p)/safeRay);
  return p+ray*min(travel.x,min(travel.y,travel.z));
}
void main(){
  #include <logdepthbuf_fragment>
  vec3 ray=normalize(surfacePoint-localEye);ray.z=-ray.z;
  vec3 hit=firstBoxHit(surfacePoint,ray,vec3(-1.91,0.038,-2.93),vec3(2.05,2.735,0.042));
  if(hit.z < -2.927 && hit.x < 0.084 && hit.x > -1.81 && hit.y < 2.18)
    hit=firstBoxHit(surfacePoint,ray,vec3(-12.5,0.025,-10.43),vec3(5.39,2.77,0.045));
  vec3 dir=normalize(hit-vec3(0.,1.04,-0.105));
  vec2 uv=vec2(0.5+atan(dir.x,-dir.z)/6.2831853,0.5+asin(clamp(dir.y,-1.,1.))/3.14159265);
  vec3 reflected=texture2D(panorama,uv).rgb;
  vec3 silver=mix(vec3(.50,.56,.56),reflected*vec3(.94,.98,.98),ready);
  gl_FragColor=vec4(silver,1.);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;
export function placeMirror(K,name,at,angle,canSee){
  const T=K.THREE;
  if(!geometry){
    geometry=new T.BufferGeometry();
    geometry.setAttribute('position',new T.Float32BufferAttribute(pane[0],3));
    geometry.setIndex(pane[1]);geometry.computeBoundingSphere();
  }
  const uniforms={localEye:{value:new T.Vector3()},panorama:{value:null},ready:{value:0}};
  const material=new T.ShaderMaterial({uniforms,side:T.DoubleSide,vertexShader:`
    #include <common>
    #include <logdepthbuf_pars_vertex>
    varying vec3 surfacePoint;
    void main(){
      surfacePoint=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);
      #include <logdepthbuf_vertex>
    }`,fragmentShader:fragment});
  const mesh=new T.Mesh(geometry,material);mesh.name=name;mesh.position.set(...at);mesh.rotation.y=angle;
  mesh.onBeforeRender=(_r,_s,cam)=>{
    const eye=uniforms.localEye.value.copy(cam.position);mesh.worldToLocal(eye);
    const close=eye.z<-.075 && eye.distanceToSquared(geometry.boundingSphere.center)<62 && canSee(cam.position);
    if(close && !panorama && !pending && performance.now()>retryAfter){
      pending=new T.TextureLoader().loadAsync(imageURL.href).then(tex=>{
        tex.colorSpace=T.SRGBColorSpace;tex.wrapS=T.RepeatWrapping;panorama=tex;
      }).catch(()=>{retryAfter=performance.now()+10000;}).finally(()=>{pending=null;});
    }
    uniforms.panorama.value=panorama;uniforms.ready.value=Number(Boolean(close&&panorama));
  };
  return K.addMesh(mesh);
}
