import {boxSilhouette} from '../interior-architecture/box-silhouette.js';
import {placeSingleDetail} from '../interior-architecture/single-detail.js';

export const oakberryName='오크베리 아사이 · 월넛과 대리석 매대';

export function placeOakberry(K,x,y,z,angle) {
  const T=K.THREE;
  const boxes=[[0,.06,0,4.66,.81,.85,0x855b3b],[0,.87,0,4.8,.09,.95,0xe4dccc],
    [.09,.27,.465,1.99,.51,.024,0x563159]];
  for(const post of [-2.02,-1.07,1.12,2.01]){
    boxes.push([post,.96,-.1,.13,.36,.13,0x70428a],[post,1.32,-.1,.18,.18,.18,0xfffbed]);
  }
  const material=new T.MeshPhongMaterial({vertexColors:true,side:T.DoubleSide,shininess:32,specular:0x312b25});
  material.onBeforeCompile=shader=>{
    shader.fragmentShader=shader.fragmentShader.replace('#include <emissivemap_fragment>',`
      #include <emissivemap_fragment>
      float globe=smoothstep(.96,.99,vColor.r)*smoothstep(.94,.973,vColor.g);
      totalEmissiveRadiance+=vColor.rgb*(.018+.48*globe);
    `);
  };
  material.customProgramCacheKey=()=>'oakberry-opal';
  const sin=Math.sin(angle),cos=Math.cos(angle);
  return placeSingleDetail(K,{name:oakberryName,file:'../oakberry-gangnam/counter.glb',at:[x,y,z],angle,
    fallback:boxSilhouette(T,boxes),material,fallbackMaterial:material,range:11,exitRange:14,floorTolerance:2.5,eyeHeight:1.2,
    closeVisibleFrom:p=>(p.x-x)*sin+(p.z-z)*cos>-.5});
}
