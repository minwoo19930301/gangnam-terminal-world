import {placeSingleDetail} from '../interior-architecture/single-detail.js';
import {relief} from '../../../js/banpo_relief.js';
import {rings} from './profile.js';
import {xiPortal} from '../../../js/landmarks.js';

export function placeXiPortal(K) {
  const T = K.THREE, fallback = new T.BufferGeometry(), indices = [];
  for (let i=1;i<rings.length;i++) {
    for(let j=0;j<4;j++) {
      const a=4*(i-1)+j, b=4*(i-1)+(j+1)%4;
      indices.push(a,b,b+4,a,b+4,a+4);
    }
  }
  fallback.setAttribute('position',new T.Float32BufferAttribute(rings.flat(2),3));
  fallback.setIndex(indices);
  fallback.computeVertexNormals();
  const metal = new T.MeshPhongMaterial({vertexColors:true,side:T.DoubleSide,shininess:38,specular:0x555c60});
  const distant = new T.MeshLambertMaterial({color:0xc2c8c9,side:T.DoubleSide});
  // Approximate the cold sky reflected by upward-facing folded metal. The
  // street has no environment map. Letter faces are separately tagged at export.
  const {x,z,angle}=xiPortal;
  const sky = {value:0};
  K.onSolarAltitude?.(altitude=>{sky.value=1-T.MathUtils.smoothstep(altitude,-7,4);});
  metal.onBeforeCompile=shader=>{
    shader.uniforms.portalNightSky=sky;
    shader.uniforms.portalFrame={value:new T.Vector4(x,z,Math.cos(angle),-Math.sin(angle))};
    shader.vertexShader='uniform vec4 portalFrame; varying float portalAlong;\n'+shader.vertexShader.replace(
      '#include <project_vertex>', `#include <project_vertex>
      portalAlong=dot((modelMatrix*vec4(transformed,1.)).xz-portalFrame.xy,portalFrame.zw);`);
    shader.fragmentShader='varying float portalAlong; uniform float portalNightSky;\n'+shader.fragmentShader.replace(
      '#include <opaque_fragment>',
      `float skyFacing = clamp(inverseTransformDirection(normal,viewMatrix).y*.6+.4,0.,1.);
       outgoingLight += diffuseColor.rgb*skyFacing*portalNightSky*vec3(.017,.024,.033);
       #ifdef USE_COLOR_ALPHA
         if (vColor.a < .6) {
           vec3 lettering = vColor.a < .25 ? vec3(1.,.95,.86) : vec3(.28,.74,1.);
           outgoingLight += portalNightSky*lettering;
         } else if (vColor.a < .9) {
           float pool = pow(.5+.5*cos(3.65*portalAlong),3.);
           outgoingLight += vec3(1.,.67,.30)*(.08+.48*pool)*portalNightSky;
         }
         diffuseColor.a = opacity;
       #endif
       #include <opaque_fragment>`);
  };
  metal.defines = distant.defines = {BANPO_RIGID:1};
  return placeSingleDetail(K,{
    name:'반포센트럴자이 · 은빛 문주',file:'../banpo-xi-portal/xi-portal.glb',
    at:[x,0,z],angle,rigidGround:relief(x,z),eyeHeight:2,
    range:40,exitRange:49,floorTolerance:5.5,
    closeVisibleFrom:eye=>(eye.x-x)*Math.sin(angle)+(eye.z-z)*Math.cos(angle)>-1,
    fallback,fallbackMaterial:distant,material:metal,
  });
}
