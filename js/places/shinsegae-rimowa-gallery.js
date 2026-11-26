import {mountRetailDisplay} from './shinsegae-retail-display.js';
import {relief} from '../banpo_relief.js';

const source = new URL('../../assets/models/ssg-rimowa-gallery/gallery.glb',import.meta.url);
const batches = ['RimowaGangnamAluminium','RimowaGangnamTextiles','RimowaGangnamFittings','RimowaGangnamOak'];

const nicheSource=new URL('../../assets/models/ssg-rimowa-gallery/niche.glb',import.meta.url);
const nicheSide=-2.70,nicheFront=.015;

// Sample the room baked at the case, including its warm oak and two light strips.
function reflectNiche(mesh,angle) {
  const previousDraw=mesh.onBeforeRender;
  let installed;
  mesh.onBeforeRender=function(renderer,scene,camera,geometry,material,...rest) {
    previousDraw.call(this,renderer,scene,camera,geometry,material,...rest);
    if(installed===material || !material.emissiveMap || !material.metalnessMap)return;
    installed=material;
    const compile=material.onBeforeCompile,key=material.customProgramCacheKey();
    material.onBeforeCompile=function(shader,renderer) {
      compile.call(this,shader,renderer);
      shader.uniforms.nicheYaw={value:angle};
      shader.fragmentShader=shader.fragmentShader.replace('#include <common>',
        '#include <common>\nuniform vec2 nicheYaw;').replace('#include <opaque_fragment>',`
        #ifdef USE_EMISSIVEMAP
          vec3 eye=normalize(vViewPosition);
          vec3 ray=inverseTransformDirection(reflect(-eye,normal),viewMatrix);
          float side=dot(ray.xz,vec2(nicheYaw.x,-nicheYaw.y));
          float front=dot(ray.xz,nicheYaw.yx);
          vec2 uv=vec2(.5+atan(-front,side)*.15915494,.5-asin(clamp(ray.y,-1.,1.))*.31830989);
          vec3 room=texture2D(emissiveMap,uv).rgb;
          float edge=pow(1.-abs(dot(eye,normal)),2.);
          float daylight=clamp(.89+dot(outgoingLight,vec3(.106,.357,.036)),.84,1.10);
          float metal=smoothstep(.24,.79,metalnessFactor);
          outgoingLight=mix(outgoingLight,room*diffuseColor.rgb*daylight,metal*(.75+.17*edge));
          float underlight=1.-texture2D(roughnessMap,vRoughnessMapUv).r;
          outgoingLight+=vec3(1.,.958,.866)*underlight;
        #endif
        #include <opaque_fragment>`);
    };
    material.customProgramCacheKey=()=>key+':rimowa-lit-niche-v1';
    material.needsUpdate=true;
  };
}

function registerCustomisationNiche(K,{poly,x,y,z,yaw}){
  const sx=x+nicheSide*Math.cos(yaw)+nicheFront*Math.sin(yaw);
  const sz=z-nicheSide*Math.sin(yaw)+nicheFront*Math.cos(yaw),angle=yaw;
  K.detail({floor:'6F',y0:y,y1:y+4.8,poly,name:'리모와 커스터마이징 실버 캐빈'},()=>{
    const T=K.THREE,root=new T.Group(),fallback=new T.Group();
    root.position.set(sx,y+relief(x,z),sz);root.rotation.y=angle;root.add(fallback);
    const cube=new T.BoxGeometry(),materials=new Map();
    function box(px,py,pz,w,h,d,col){
      if(!materials.has(col))materials.set(col,new T.MeshStandardMaterial({color:col}));
      const part=new T.Mesh(cube,materials.get(col));part.position.set(px,py,pz);
      part.scale.set(w,h,d);fallback.add(part);
    }
    for(const side of [-.5175,.5175])box(side,1.34,.058,.355,2.68,.37,0xad845b);
    box(0,.286,.058,.68,.572,.37,0xad845b);box(0,2.458,.058,.68,.444,.37,0xad845b);
    box(0,1.405,-.076,.67,1.66,.017,0xa3a49d);
    box(0,1.085,.102,.399,.51,.21,0xbfc2be);
    box(.098,1.170,.212,.105,.14,.007,0xb8879c);
    box(.098,1.032,.212,.105,.13,.007,0x619f90);
    mountRetailDisplay(K,{root,fallback,source:nicheSource,batches:['RimowaNicheFinishes','RimowaNicheAcrylic'],x:sx,y,z:sz});
    reflectNiche(root.getObjectByName('RimowaNicheFinishes'),new T.Vector2(Math.cos(angle),Math.sin(angle)));
  });
  // The customer can approach the glass riser from the public side.
  const walls=[[-.695,-.13],[.695,-.13],[.695,.248],[-.695,.248]].map(([u,v])=>[
    sx+u*Math.cos(angle)+v*Math.sin(angle),sz-u*Math.sin(angle)+v*Math.cos(angle)]);
  K.phys.addPolyWalls(walls,y,y+2.68,.012,'shinsegae');
}

export function registerRimowaGallery(K,{poly,x,y,z,yaw}) {
  registerCustomisationNiche(K,{poly,x,y,z,yaw});
  K.detail({floor:'6F',y0:y,y1:y+4.8,poly,name:'리모와 여행 가방 진열벽'}, () => {
    const T=K.THREE, root=new T.Group(), fallback=new T.Group();
    root.position.set(x,y+relief(x,z),z);
    root.rotation.y=yaw;
    root.add(fallback);
    const cube=new T.BoxGeometry();
    function block(px,py,pz,w,h,d,color) {
      const part=new T.Mesh(cube,new T.MeshStandardMaterial({color}));
      part.position.set(px,py,pz);
      part.scale.set(w,h,d);
      fallback.add(part);
    }
    block(0,1.43,-.055,4.02,2.86,.12,0xa98155);
    block(-1.67,1.18,.106,.49,1.94,.024,0x9eafb6);
    for(const [height,tone] of [[.15,0x272d41],[.83,0x73838d],[1.50,0x526043]]) {
      block(-.515,height-.024,.19,1.50,.049,.415,0xb8bdbe);
      for(const side of [-.84,-.18])block(side,height+.19,.23,.40,.38,.20,tone);
    }
    for(const [base,w,h] of [[.097,.84,.33],[.503,.84,.35],[.933,.73,.285],[1.294,.62,.25],[1.632,.39,.51]]) {
      block(1.18,base+h/2,.23,w,h,.30,0xbac1c4);
    }
    mountRetailDisplay(K,{root,fallback,source,batches,x,y,z});
  });
}
