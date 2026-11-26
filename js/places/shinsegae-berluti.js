import { mountRetailDisplay } from './shinsegae-retail-display.js';
import { relief } from '../banpo_relief.js';

const source = new URL('../../assets/models/ssg-florentine-leather/gallery.glb',import.meta.url);
const batches = ['BerlutiGalleryFinish','BerlutiWalnut','BerlutiVeneziaPatina','BerlutiPalladium'];

const frontageSource = new URL('../../assets/models/ssg-florentine-leather/frontage.glb',import.meta.url);
const frontDepth=7.96, screenLeft=-5.15, screenRight=-.55, portalPost=3.48;

// Reuse a baked panorama of this gallery in the folded glass, with a single
// transparent draw and no additional render or request on the visitor’s device.
function finishGlass(mesh, bakeEye, angle) {
  const before=mesh.onBeforeRender;
  let last;
  mesh.onBeforeRender=function(renderer,scene,camera,geometry,material,...other) {
    before.call(this,renderer,scene,camera,geometry,material,...other);
    if(!material.isMeshStandardMaterial || material===last)return;
    last=material;
    const inherited=material.onBeforeCompile, key=material.customProgramCacheKey();
    material.onBeforeCompile=function(shader,renderer) {
      inherited.call(this,shader,renderer);
      shader.uniforms.berlutiEye={value:bakeEye};
      shader.uniforms.berlutiAngle={value:angle};
      shader.fragmentShader=shader.fragmentShader.replace('#include <common>',`
        #include <common>
        uniform vec3 berlutiEye;
        uniform vec2 berlutiAngle;
        vec2 galleryUV(vec3 direction) {
          vec3 d=normalize(direction);
          float side=dot(d.xz,vec2(berlutiAngle.x,-berlutiAngle.y));
          float forward=dot(d.xz,berlutiAngle.yx);
          return vec2(.5+atan(-forward,side)*.15915494,.5-asin(clamp(d.y,-1.,1.))*.31830989);
        }`).replace('#include <opaque_fragment>',`
        vec3 eyeDir=normalize(vViewPosition);
        vec3 eyeWorld=inverseTransformDirection(eyeDir,viewMatrix);
        vec3 atGlass=cameraPosition-eyeWorld*length(vViewPosition)-berlutiEye;
        vec3 roomRay=inverseTransformDirection(reflect(-eyeDir,normal),viewMatrix);
        vec3 bendRay=inverseTransformDirection(refract(-eyeDir,normal,.69),viewMatrix);
        float grazing=pow(1.-abs(dot(normal,eyeDir)),2.6);
        float ceiling=smoothstep(-.14,.34,roomRay.y);
        float strip=exp(-17.*abs(roomRay.y-.62+.15*roomRay.z));
        vec3 showroom=mix(vec3(.24,.18,.14),vec3(.8,.77,.68),ceiling);
        #ifdef USE_EMISSIVEMAP
          vec3 mirror=texture2D(emissiveMap,galleryUV(roomRay*7.+atGlass*.7)).rgb;
          vec3 through=texture2D(emissiveMap,galleryUV(bendRay*6.3+atGlass*.77)).rgb;
          showroom=mix(through,mirror,.21+.59*grazing);
        #endif
        float exposure=clamp(dot(outgoingLight,vec3(.213,.715,.072))*1.38+.19,.19,1.0);
        showroom=(showroom+strip*vec3(.55,.52,.45))*exposure;
        outgoingLight=mix(outgoingLight,showroom,.64+.26*grazing);
        diffuseColor.a=clamp(diffuseColor.a*(.94+grazing)+.12*strip,.14,.88);
        #include <opaque_fragment>`);
    };
    material.customProgramCacheKey=()=>key+':berluti-shopfront-panorama-v2';
    material.forceSinglePass=true;
    material.needsUpdate=true;
  };
}
function worldPosition(x,z,yaw,side,front) {
  const c=Math.cos(yaw),s=Math.sin(yaw);
  return [x+c*side+s*front,z-s*side+c*front];
}
function registerFrontage(K,{poly,x,y,z,yaw}) {
  K.detail({floor:'6F',y0:y,y1:y+4.8,poly,name:'벨루티 유리 쇼윈도'},()=>{
    const T=K.THREE,root=new T.Group(),fallback=new T.Group();
    root.position.set(x,y+relief(x,z),z);root.rotation.y=yaw;root.add(fallback);
    const cube=new T.BoxGeometry(),dark=new T.MeshStandardMaterial({color:0x302c2b});
    const wood=new T.MeshStandardMaterial({color:0x665044}),edge=new T.MeshStandardMaterial({color:0x99a39c});
    function box(m,x,y,z,w,h,d) {
      const part=new T.Mesh(cube,m);part.position.set(x,y,z);part.scale.set(w,h,d);
      fallback.add(part);return part;
    }
    const middle=(screenLeft+screenRight)*.5, width=screenRight-screenLeft;
    box(dark,middle,.043,frontDepth,width+.12,.086,.15);
    for(const side of [screenLeft,screenRight,portalPost])box(dark,side,1.46,frontDepth,.07,2.92,.155);
    box(dark,(screenLeft+portalPost)*.5,2.99,frontDepth,portalPost-screenLeft+.12,.36,.17);
    box(wood,2.906,1.408,frontDepth-.34,1.048,2.816,.169);
    // The distant drawing keeps the opening and an airy glass grid in one draw.
    for(let i=0;i<5;i++)box(edge,middle,.46+i*.48,frontDepth,width,.018,.025);
    for(let i=0;i<12;i++)box(edge,screenLeft+(i+.5)*width/12,1.43,frontDepth,.010,2.65,.02);
    const [sx,sz]=worldPosition(x,z,yaw,middle,frontDepth);
    const groups=['BerlutiFrontJoinery','BerlutiFrontGlass'];
    mountRetailDisplay(K,{root,fallback,source:frontageSource,batches:groups,x:sx,y,z:sz});
    const [ex,ez]=worldPosition(x,z,yaw,-2.85,7.68);
    finishGlass(root.getObjectByName(groups[1]),new T.Vector3(ex,root.position.y+1.57,ez),
      new T.Vector2(Math.cos(yaw),Math.sin(yaw)));
  });
  // Ground-level paths remain open between the glass and inset sign pier.
  function block(left,right,near,far) {
    const walls=[[left,near],[right,near],[right,far],[left,far]]
      .map(([side,front])=>worldPosition(x,z,yaw,side,front));
    K.phys.addPolyWalls(walls,y,y+2.82,.014,'shinsegae');
  }
  block(screenLeft-.055,screenRight+.055,frontDepth-.068,frontDepth+.068);
  block(2.382,3.430,frontDepth-.425,frontDepth-.255);
  block(portalPost-.054,portalPost+.054,frontDepth-.079,frontDepth+.079);
}

export function registerBerluti(K,{x,y,z,yaw,poly}) {
  registerFrontage(K,{x,y,z,yaw,poly});
  K.detail({floor:'6F',y0:y,y1:y+4.8,poly,name:'벨루티 가죽 구두와 서류가방'},() => {
    const T=K.THREE, root=new T.Group(), fallback=new T.Group();
    root.position.set(x,y+relief(x,z),z);
    root.rotation.y=yaw;
    root.add(fallback);
    const cube=new T.BoxGeometry(), rounded=new T.SphereGeometry(.5,10,6), colors=new Map();
    function piece(shape,x,y,z,w,h,d,color) {
      if (!colors.has(color)) colors.set(color,new T.MeshStandardMaterial({color}));
      const mesh=new T.Mesh(shape,colors.get(color));
      mesh.position.set(x,y,z);
      mesh.scale.set(w,h,d);
      fallback.add(mesh);
    }
    piece(cube,0,1.47,-.22,5.08,2.72,.075,0xede0d2);
    piece(cube,0,.24,0,5.1,.44,.48,0x805741);
    for (const x of [-2.53,.55,2.55]) piece(cube,x,1.41,0,.11,2.82,.54,0x684b39);
    for (const h of [.52,1.04,1.55,2.09]) {
      piece(cube,0,h-.02,.025,5,.04,.42,0xaa8971);
      for (const x of [-2.1,-1.37,-.64,.09]) piece(rounded,x,h+.045,.04,.26,.09,.14,0x684635);
      for (const x of [1.14,1.91]) piece(cube,x,h+.14,.03,.40,.28,.08,0x75503a);
    }
    piece(cube,0,.90,1.5,1.88,.08,.65,0x8b6047);
    for (const x of [-.89,.89]) piece(cube,x,.45,1.5,.09,.90,.64,0x77533e);
    piece(cube,.43,1.08,1.45,.40,.28,.08,0x935d40);
    mountRetailDisplay(K,{root,fallback,source,batches,x,y,z});
  });
}
