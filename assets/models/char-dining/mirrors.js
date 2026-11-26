import {mesh} from './mirror-panes.js';
import {mirrorX} from './layout.js';

let geometry,panorama,request,retry=0;
const atlas=new URL('./reflections.webp',import.meta.url);
// The three panes use one draw. A reflected ray meets the room before sampling its local Blender panorama.
export function placeMirrors(K,label,at,angle,canSee){
  const T=K.THREE;
  if(!geometry){
    geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(mesh[0],3));
    geometry.setAttribute('slot',new T.Float32BufferAttribute(mesh[2],1));geometry.setIndex(mesh[1]);geometry.computeBoundingSphere();
  }
  const uniforms={eye:{value:new T.Vector3()},probes:{value:new T.Vector3(...mirrorX)},atlas:{value:null},ready:{value:0}};
  const material=new T.ShaderMaterial({uniforms,side:T.DoubleSide,vertexShader:`
    #include <common>
    #include <logdepthbuf_pars_vertex>
    attribute float slot;varying float ix;varying vec3 hit;
    void main(){ix=slot;hit=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);
    #include <logdepthbuf_vertex>
    }`,fragmentShader:`
    #include <common>
    #include <logdepthbuf_pars_fragment>
    uniform vec3 eye,probes;uniform sampler2D atlas;uniform float ready;varying float ix;varying vec3 hit;
    void main(){
      #include <logdepthbuf_fragment>
      vec3 dir=normalize(hit-eye);dir.z=-dir.z;
      vec3 safe=mix(vec3(.00001),dir,step(vec3(.00001),abs(dir)));
      vec3 distance=max((vec3(-6.10,.042,-3.29)-hit)/safe,(vec3(6.10,3.41,5.747)-hit)/safe);
      vec3 wall=hit+dir*min(distance.x,min(distance.y,distance.z));
      float probe=ix<.5?probes.x:ix<1.5?probes.y:probes.z;
      vec3 sampled=normalize(wall-vec3(probe,1.94,5.64));
      float v=clamp(.5+asin(clamp(sampled.y,-1.,1.))/6.2831853*2.,.002,.998);
      vec2 uv=vec2(.5+atan(sampled.x,-sampled.z)/6.2831853,(v+2.-ix)/3.);
      vec3 silver=mix(vec3(.21,.25,.23),texture2D(atlas,uv).rgb,ready*.95);
      gl_FragColor=vec4(silver,1.);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
    }`});
  const surface=new T.Mesh(geometry,material);surface.name=label;surface.position.set(...at);surface.rotation.y=angle;
  surface.onBeforeRender=(_r,_s,camera)=>{
    const p=uniforms.eye.value.copy(camera.position);surface.worldToLocal(p);
    const close=p.z<5.72&&p.z>-.6&&p.y>.15&&p.y<3.32&&canSee(camera.position.x,camera.position.z);
    if(close&&!panorama&&!request&&performance.now()>retry){
      request=new T.TextureLoader().loadAsync(atlas.href).then(texture=>{
        texture.colorSpace=T.SRGBColorSpace;texture.wrapS=T.RepeatWrapping;panorama=texture;
      }).catch(()=>{retry=performance.now()+10000;}).finally(()=>{request=null;});
    }
    uniforms.atlas.value=panorama;uniforms.ready.value=Number(Boolean(close&&panorama));
  };
  return K.addMesh(surface);
}
