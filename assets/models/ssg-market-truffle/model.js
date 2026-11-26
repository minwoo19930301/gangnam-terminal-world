import {boxSilhouette} from '../interior-architecture/box-silhouette.js';
import {loadArchitecture} from '../interior-architecture/model.js';
import {placeSingleDetail} from '../interior-architecture/single-detail.js';
import {relief} from '../../../js/banpo_relief.js';

export function truffleCase(K,x,y,z,angle){
  const T=K.THREE;
  const fallback=boxSilhouette(T,[
    [0,.12,-.29,2.53,2.74,.07,0x48372c],
    [-1.2,.12,-.015,.135,2.82,.61,0x503728],[1.2,.12,-.015,.135,2.82,.61,0x503728],
    [0,.12,.01,2.25,.70,.60,0x554032],[0,.82,.01,2.37,.07,.65,0x895840],
    [.56,.89,-.23,.94,1,.05,0xb3c2c9],[.56,.96,-.01,.87,.02,.43,0xb4d1df],
    [0,1.94,-.04,2.27,.06,.49,0x78654f],[0,2.41,-.04,2.27,.06,.49,0x635749],
    [-.65,2.47,-.08,.68,.29,.12,0x687cae],[.50,2.47,-.08,1.02,.31,.12,0xeee8d2],
  ]);
  async function load(file){
    const [mesh]=await loadArchitecture(file);
    mesh.material=new T.MeshPhongMaterial({map:mesh.material.map,vertexColors:true,side:T.DoubleSide,
      specular:0x2c3033,shininess:19});
    // The photographed refrigerator has its own shelf strips. Retain their
    // low, even fill on the walnut bay and the fridge without creating a runtime light.
    mesh.material.onBeforeCompile=shader=>{
      shader.fragmentShader=shader.fragmentShader.replace('#include <emissivemap_fragment>',
        '#include <emissivemap_fragment>\n totalEmissiveRadiance += diffuseColor.rgb * vec3(.11,.12,.11);');
    };
    return [mesh];
  }
  return placeSingleDetail(K,{name:'신세계 마켓 · 타르투플랑게 생트러플 냉장장',file:'../ssg-market-truffle/counter.glb',
    at:[x,y,z],angle,rigidGround:relief(x,z),fallback,
    fallbackMaterial:new T.MeshLambertMaterial({vertexColors:true}),loadSurface:load,
    range:9,exitRange:12,floorTolerance:2.0,eyeHeight:1.24,
    viewBounds:[new T.Box3(new T.Vector3(-1.27,0,-.34),new T.Vector3(1.27,2.93,.36))],
    closeVisibleFrom:p=>(p.x-x)*Math.sin(angle)+(p.z-z)*Math.cos(angle)>-.34});
}
