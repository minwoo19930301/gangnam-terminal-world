import {relief} from '../../../js/banpo_relief.js';
import {placeSingleDetail} from '../interior-architecture/single-detail.js';
import {columns,points,colors} from './silhouette.js';

function glazingSilhouette(T) {
  const positions=[], rgb=[], color=new T.Color();
  for(let face=0;face<colors.length;face++){
    const row=Math.floor(face/(columns-1)), col=face%(columns-1), k=row*columns+col;
    color.setHex(colors[face]);
    for(const i of [k,k+1,k+columns+1,k,k+columns+1,k+columns]){
      positions.push(points[i*3]*.001,points[i*3+1]*.001,points[i*3+2]*.001);
      rgb.push(color.r,color.g,color.b,(col===0 || col===columns-2) ? .48 : 0);
    }
  }
  const geometry=new T.BufferGeometry();
  geometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));
  geometry.setAttribute('color',new T.Float32BufferAttribute(rgb,4));
  geometry.computeVertexNormals();
  return geometry;
}

export function placeNorthCanopy(K,point,angle) {
  const T=K.THREE,[x,z]=point;
  const ground=relief(x,z);
  const material=new T.MeshPhongMaterial({vertexColors:true,side:T.DoubleSide,
    specular:0x333c41,shininess:32});
  material.defines={BANPO_RIGID:1};
  // The fixed front posts meet the turned-down edge. Each foot remains on its
  // own pavement datum even where the public forecourt slopes.
  const sin=Math.sin(angle), cos=Math.cos(angle);
  for(const side of [-1,1]) {
    const px=x+side*9.62*cos+.08*sin, pz=z-side*9.62*sin+.08*cos;
    K.cyl({x:px,z:pz,y:0,r:.17,h:ground+5.61-relief(px,pz),mat:0x798384,seg:16});
  }
  const daylight={value:1};
  K.onSolarAltitude?.(altitude=>{daylight.value=T.MathUtils.smoothstep(altitude,-7,9);});
  // The glazed panels reflect different parts of the sky as a shopper passes
  // under the curve. Metal joint covers continue to use the normal street lights.
  material.onBeforeCompile=shader=>{
    shader.uniforms.gateDay=daylight;
    shader.fragmentShader='uniform float gateDay;\n'+shader.fragmentShader.replace(
      '#include <opaque_fragment>',`
      vec3 canopyReflection=inverseTransformDirection(reflect(-normalize(vViewPosition),normal),viewMatrix);
      float sky=smoothstep(-.30,.30,canopyReflection.y);
      float horizon=1.0-smoothstep(.04,.68,abs(canopyReflection.y));
      float fresnel=.45+.45*pow(1.0-abs(dot(normalize(vViewPosition),normal)),2.0);
      vec3 outside=mix(vec3(.025,.033,.041),vec3(.24,.30,.34),sky)+vec3(.15,.17,.17)*horizon;
      vec3 reflected=mix(vec3(.007,.011,.017)+vec3(.013,.014,.011)*horizon,outside,gateDay);
      outgoingLight+=(1.0-vColor.a)*fresnel*reflected;
      #include <opaque_fragment>`);
  };
  material.customProgramCacheKey=()=>'north-gate-rolled-glass';

  return placeSingleDetail(K,{name:'신세계 강남점 정문 · 곡면 유리 캐노피',
    file:'../shinsegae-gate-canopy/gate-canopy.glb',at:[x,0,z],angle,rigidGround:ground,
    fallback:glazingSilhouette(T),fallbackMaterial:material,material,
    eyeHeight:2,range:40,exitRange:47,floorTolerance:5,
    closeVisibleFrom:eye=>(eye.x-x)*sin+(eye.z-z)*cos<5.0});
}
