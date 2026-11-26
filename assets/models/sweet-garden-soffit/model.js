import {boxSilhouette} from '../interior-architecture/box-silhouette.js';
import {placeSingleDetail} from '../interior-architecture/single-detail.js';

export function sweetGardenSoffit(K,x,y,z,angle){
  const T=K.THREE;
  // The generic inclined cases remain visible farther away. The planting bed
  // is inside their footprint, and gives this geometry a useful coarse silhouette.
  const fallback=boxSilhouette(T,[[.15,0,-7.21,4.88,.24,6.92,0x98734f],
    [.15,.24,-7.21,4.68,.40,6.70,0x526a45]]);
  const material=new T.MeshPhongMaterial({vertexColors:true,side:T.DoubleSide,
    specular:0x45483e,shininess:36});
  material.onBeforeCompile=shader=>{
    shader.fragmentShader=shader.fragmentShader.replace('#include <opaque_fragment>',`
      float neutral=1.-smoothstep(.06,.19,max(vColor.r,max(vColor.g,vColor.b))-min(vColor.r,min(vColor.g,vColor.b)));
      float metal=neutral*smoothstep(.29,.48,vColor.r)*(1.-smoothstep(.88,.95,vColor.r));
      vec3 ray=inverseTransformDirection(reflect(-normalize(vViewPosition),normal),viewMatrix);
      // Broad, blurred reflections of the warm arcade and the planting under the
      // panels. No scene capture, reflected people or extra runtime lighting.
      float greenery=1.-smoothstep(-.72,.14,ray.y+.11*sin(ray.x*8.+ray.z*5.));
      float arcade=pow(max(0.,1.-abs(ray.y+.14)*1.75),6.);
      outgoingLight=mix(outgoingLight,outgoingLight*.64+vec3(.16,.17,.16)
        +greenery*vec3(-.042,.006,-.060)+arcade*vec3(.24,.19,.13),metal);
      outgoingLight+=.35*vColor.rgb*smoothstep(.87,.95,vColor.r)*smoothstep(.78,.85,vColor.g);
      #include <opaque_fragment>`);
  };
  placeSingleDetail(K,{name:'스위트 가든 · 에스컬레이터 공통 하부',file:'../sweet-garden-soffit/soffit.glb',
    at:[x,y,z],angle,fallback,material,fallbackMaterial:material,range:16,exitRange:19,
    eyeHeight:1.62,floorTolerance:2.7,viewBounds:[new T.Box3(new T.Vector3(-3,0,-12),new T.Vector3(3,6,-1.88))],
    closeVisibleFrom:p=>{
      const dx=p.x-x,dz=p.z-z,along=-(dx*Math.sin(angle)+dz*Math.cos(angle));
      const across=Math.abs(dx*Math.cos(angle)-dz*Math.sin(angle));
      // A rider looking up the treads cannot see the underside through them.
      return along>1.45&&(across>2.9||p.y<y+along*.5-.80);
    }});
}
