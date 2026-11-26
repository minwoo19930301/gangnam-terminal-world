import {relief} from '../../../js/banpo_relief.js';
import {boxSilhouette} from '../interior-architecture/box-silhouette.js';
import {placeSingleDetail} from '../interior-architecture/single-detail.js';

export function placeYukgakRestaurant(K,x,z,angle){
  const T=K.THREE,night={value:0};
  const proxy=boxSilhouette(T,[
    [0,2.66,-.90,3.58,.34,2.05,0xebe9db],
    ...[-1.58,1.57].map(side=>[side,0,-.075,.4,2.65,.26,0x8e8278]),
    [-1.56,1.88,.19,.47,.37,.38,0xf8f0de],
    [0,.015,-3.02,3.54,2.60,.10,0xd9d6c8],
  ]);
  const bounds=new T.Box3(new T.Vector3(-1.82,0,-3.12),new T.Vector3(1.82,3.03,.66));
  proxy.boundingSphere=bounds.getBoundingSphere(new T.Sphere());
  const finish=new T.MeshLambertMaterial({vertexColors:true,side:T.DoubleSide});
  K.onSolarAltitude?.(altitude=>{night.value=1-T.MathUtils.smoothstep(altitude,-9,-3);});
  finish.onBeforeCompile=shader=>{
    shader.uniforms.yukgakNight=night;
    shader.uniforms.shopFrame={value:new T.Vector4(x,z,Math.cos(angle),Math.sin(angle))};
    shader.uniforms.shopGround={value:43+relief(x,z)};
    shader.vertexShader=shader.vertexShader.replace('#include <common>',
      '#include <common>\nvarying vec3 shopPosition; uniform vec4 shopFrame; uniform float shopGround;')
      .replace('#include <begin_vertex>',`#include <begin_vertex>
        vec3 shopWorld=(modelMatrix*vec4(transformed,1.0)).xyz;
        vec2 offset=shopWorld.xz-shopFrame.xy;
        shopPosition=vec3(dot(offset,vec2(shopFrame.z,-shopFrame.w)),
          shopWorld.y-shopGround,dot(offset,shopFrame.wz));`);
    shader.fragmentShader=shader.fragmentShader.replace('#include <common>',
      '#include <common>\nvarying vec3 shopPosition;\nuniform float yukgakNight;')
      .replace('#include <emissivemap_fragment>',`#include <emissivemap_fragment>
        float lightBox=smoothstep(.985,1.0,vColor.r)*smoothstep(.86,.91,vColor.g)*(1.0-smoothstep(.70,.78,vColor.b));
        float cover=1.0-smoothstep(-.05,.62,shopPosition.z);
        vec3 offset=shopPosition-vec3(.15,2.5,-1.35);
        float localFill=.49*cover/(1.0+.15*dot(offset,offset));
        totalEmissiveRadiance+=vColor.rgb*(lightBox*.95+yukgakNight*localFill*vec3(1.0,.88,.72));`);
  };
  placeSingleDetail(K,{name:'경부선 육각고기 · 공개 식당 입구',file:'../gyeongbu-yukgak/shop.glb',
    at:[x,43,z],angle,material:finish,fallbackMaterial:finish,fallback:proxy,
    eyeHeight:1.62,floorTolerance:2.3,range:26,exitRange:34,viewBounds:[bounds]});
}
