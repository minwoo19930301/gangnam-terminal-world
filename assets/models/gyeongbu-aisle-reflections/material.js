import {DataTexture,Matrix3,SRGBColorSpace,TextureLoader} from 'three';
import {loadArchitecture} from '../interior-architecture/model.js';

const atlases=new Map(),loader=new TextureLoader();
const black=new DataTexture(new Uint8Array([0,0,0,255]),1,1);
black.needsUpdate=true;
function atlas(name) {
  if(atlases.has(name))return atlases.get(name);
  const url=new URL('./'+name+'.webp',import.meta.url).href;
  const sampler={value:black};
  let pending=false,retry=0;
  function request(){
    if(pending||sampler.value!==black||performance.now()<retry)return;
    pending=true;
    loader.load(url,texture=>{
      texture.colorSpace=SRGBColorSpace;
      sampler.value=texture;
      pending=false;
    },undefined,()=>{pending=false;retry=performance.now()+5000;});
  }
  const state={sampler,request};
  atlases.set(name,state);
  return state;
}

// Rays leaving the polished tile meet an actual baked ceiling or shopfront.
// All dimensions are in the Blender aisle's local metric frame.
const reflection=/* glsl */`
  if (abs(vAislePosition.y-.052)<.008 && abs(vAislePosition.x)<1.70) {
    vec3 ray=normalize(vAisleView)*vec3(1.,-1.,1.);
    if (ray.y>.001) {
      float ceiling=(2.923-vAislePosition.y)/ray.y;
      float side=(ray.x<0.?-1.75:1.75)-vAislePosition.x;
      float wall=abs(ray.x)<.00001?1e6:side/ray.x;
      vec3 hit=vAislePosition+min(ceiling,wall)*ray;
      float across;
      if (ceiling<=wall) across=4.+98.*clamp((hit.x+2.45)/4.9,0.,1.);
      else if (ray.x<0.) across=110.+60.*clamp(hit.y/3.,0.,1.);
      else across=178.+60.*clamp(1.-hit.y/3.,0.,1.);
      float along=(hit.z+12.80)/33.60;
      float endFade=smoothstep(0.,.038,along)*(1.-smoothstep(.962,1.,along));
      float edgeFade=1.-smoothstep(1.55,1.70,abs(vAislePosition.x));
      // The native corridor extends beyond the modeled shops. Its ceiling
      // continues, while the photographed merchandise stops at the partition.
      float sideEnd=ceiling<=wall?1.:1.-smoothstep(2.75,3.65,abs(hit.z));
      float join=clamp(abs(wall-ceiling)/max(ceiling,.01),0.,1.);
      float roughEdge=.74+.26*smoothstep(0.,.12,join);
      vec3 shopColour=texture2D(aisleReflection,vec2(across/242.,clamp(along,0.,1.))).rgb;
      float strength=.10+.57*pow(1.-ray.y,2.25);
      outgoingLight+=shopColour*strength*edgeFade*endFade*sideEnd*roughEdge;
    }
  }
`;

export function polishedAisle(name) {
  return async file=>{
    const probe=atlas(name);
    probe.request();
    const [surface]=await loadArchitecture(file);
    surface.updateWorldMatrix(true,false);
    const decode=surface.matrixWorld.clone(),inverse=new Matrix3().setFromMatrix4(decode).invert();
    const original=surface.material;
    const material=original.clone();
    // The close Blender mesh remains usable if the optional atlas is late.
    // A visible material can retry a failed image without rebuilding its shader.
    material.onBeforeRender=()=>{
      material.onBeforeRender=probe.request;
      probe.request();
      requestAnimationFrame(()=>original.dispose());
    };
    material.onBeforeCompile=shader=>{
      shader.uniforms.aisleDecode={value:decode};
      shader.uniforms.aisleFromModel={value:inverse};
      shader.uniforms.aisleReflection=probe.sampler;
      shader.vertexShader=shader.vertexShader.replace('#include <common>',
        '#include <common>\nuniform mat4 aisleDecode; uniform mat3 aisleFromModel; varying vec3 vAislePosition; varying vec3 vAisleView;');
      shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>',`
        #include <begin_vertex>
        vAislePosition=(aisleDecode*vec4(position,1.)).xyz;
        mat3 roomToWorld=mat3(modelMatrix)*aisleFromModel;
        vAisleView=((modelMatrix*vec4(position,1.)).xyz-cameraPosition)*roomToWorld;
      `);
      shader.fragmentShader=shader.fragmentShader.replace('#include <common>',
        '#include <common>\nuniform sampler2D aisleReflection; varying vec3 vAislePosition; varying vec3 vAisleView;');
      shader.fragmentShader=shader.fragmentShader.replace('#include <opaque_fragment>',reflection+'\n#include <opaque_fragment>');
    };
    material.customProgramCacheKey=()=>'banpo-polished-market-tile';
    // Let the textured Blender geometry finish its first draw before placing
    // another program on the GPU queue. The finish can link while the complete
    // shop remains on screen and is only prepared if the close mesh is shown.
    const firstDraw=original.onBeforeRender;
    original.onBeforeRender=(renderer,scene,camera,...rest)=>{
      original.onBeforeRender=firstDraw;
      firstDraw.call(original,renderer,scene,camera,...rest);
      const preview=surface.clone(false);
      preview.material=material;
      requestAnimationFrame(async()=>{
        try {
          await renderer.compileAsync(preview,camera,scene);
          surface.material=material;
        } catch {
          material.dispose();
        }
      });
    };
    return [surface];
  };
}
