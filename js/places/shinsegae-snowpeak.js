import {relief} from '../banpo_relief.js';
import {mountRetailDisplay} from './shinsegae-retail-display.js';

const source = new URL('../../assets/models/ssg-helinox/gallery.glb',import.meta.url);
const batches = ['SnowPeakGangnamCanvas','SnowPeakGangnamHardware','SnowPeakGangnamWeave'];

// The original metal work keeps its normal PBR response. The R mask marks
// the kettle and titanium cup for the baked tent reflection in the same draw.
function tentReflections(mesh,angle) {
  const original=mesh.onBeforeRender;
  let installed;
  mesh.onBeforeRender=function(renderer,scene,camera,geometry,material,...rest) {
    original.call(this,renderer,scene,camera,geometry,material,...rest);
    if(material===installed || !material.emissiveMap || !material.roughnessMap)return;
    installed=material;
    const previous=material.onBeforeCompile, cacheKey=material.customProgramCacheKey();
    material.onBeforeCompile=function(shader,renderer) {
      previous.call(this,shader,renderer);
      shader.uniforms.campYaw={value:angle};
      shader.fragmentShader=shader.fragmentShader.replace('#include <common>',`
        #include <common>
        uniform vec2 campYaw;`).replace('#include <roughnessmap_fragment>',`
        float roughnessFactor=roughness;
        float campPolish=0.;
        #ifdef USE_ROUGHNESSMAP
          vec4 campFinish=texture2D(roughnessMap,vRoughnessMapUv);
          campPolish=campFinish.r;
          roughnessFactor*=campFinish.g;
        #endif`).replace('#include <opaque_fragment>',`
        #ifdef USE_EMISSIVEMAP
          if(campPolish>.02) {
            vec3 eye=normalize(vViewPosition);
            vec3 d=inverseTransformDirection(reflect(-eye,normal),viewMatrix);
            float side=dot(d.xz,vec2(campYaw.x,-campYaw.y));
            float front=dot(d.xz,campYaw.yx);
            vec2 uv=vec2(.5+atan(-front,side)*.15915494,.5-asin(clamp(d.y,-1.,1.))*.31830989);
            vec3 room=texture2D(emissiveMap,uv).rgb;
            float fresnel=pow(1.-abs(dot(eye,normal)),3.);
            float light=clamp(.55+dot(outgoingLight,vec3(.213,.715,.072)),.52,1.03);
            outgoingLight=mix(outgoingLight,room*light,campPolish*(.26+.30*fresnel));
          }
        #endif
        #include <opaque_fragment>`);
    };
    material.customProgramCacheKey=()=>cacheKey+':snowpeak-camp-reflection-v1';
    material.needsUpdate=true;
  };
}
export function registerSnowPeak(K,{poly,x,y,z,yaw}) {
  K.detail({floor:'8F',y0:y,y1:y+4.8,poly,name:'스노우피크 · 캠핑용품 전시'}, () => {
    const T=K.THREE, root=new T.Group(), fallback=new T.Group();
    root.position.set(x,y+relief(x,z),z);
    root.rotation.y=yaw;
    root.add(fallback);
    const box=new T.BoxGeometry(), materials=new Map();
    function piece(geometry,color,x,y,z,w,h,d) {
      if (!materials.has(color)) materials.set(color,new T.MeshStandardMaterial({color,side:T.DoubleSide}));
      const mesh=new T.Mesh(geometry,materials.get(color));
      mesh.position.set(x,y,z);
      mesh.scale.set(w,h,d);
      fallback.add(mesh);
      return mesh;
    }
    piece(box,0xcea674,0,.012,-.23,4.56,.02,4.12);
    // Half a cylinder, open at the customer-facing end.
    const shelter=new T.CylinderGeometry(1,1,1,14,1,true,-Math.PI/2,Math.PI);
    shelter.rotateX(-Math.PI/2);
    piece(shelter,0xc09c70,0,.035,-1.1,1.28,1.90,2.20);
    for (const cx of [-.86,.83]) {
      piece(box,0xad9962,cx,.36,.41,.5,.055,.45);
      piece(box,0xad9962,cx,.66,.19,.50,.59,.038).rotation.x=-.20;
      for(const side of [-1,1]) {
        piece(box,0xcea674,cx+side*.26,.54,.38,.05,.03,.40);
        piece(box,0x9da5a6,cx+side*.25,.233,.36,.023,.53,.025).rotation.x=.73;
        piece(box,0x9da5a6,cx+side*.25,.23,.36,.023,.53,.025).rotation.x=-.73;
      }
    }
    piece(box,0xcea674,0,.456,1.09,1.35,.042,.51);
    for(const cx of [-.6,.6]) for(const cz of [.86,1.32])
      piece(box,0x444647,cx,.23,cz,.03,.43,.03);
    piece(box,0xd5d4c8,-1.53,.25,.92,.50,.47,.35);
    piece(box,0xbcc4c4,1.21,.22,1.34,.42,.21,.42);
    piece(box,0xbe8d54,1.47,1.845,-1.47,1.27,.43,.068);
    mountRetailDisplay(K,{root,fallback,source,batches,x,y,z});
    tentReflections(root.getObjectByName(batches[1]),new T.Vector2(Math.cos(yaw),Math.sin(yaw)));
  });
}
