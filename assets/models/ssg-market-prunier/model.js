import {boxSilhouette} from '../interior-architecture/box-silhouette.js';
import {loadArchitecture} from '../interior-architecture/model.js';
import {placeSingleDetail} from '../interior-architecture/single-detail.js';
import {relief} from '../../../js/banpo_relief.js';

export function prunierCase(K,x,y,z,angle){
  const T=K.THREE;
  const fallback=boxSilhouette(T,[
    [0,0,-.30,2.54,2.92,.05,0x4b382c],[0,.39,-.217,2.075,1.79,.02,0xa9bebb],
    [-1.17,0,.19,.20,2.86,.27,0x4a382b],[1.17,0,.19,.20,2.86,.27,0x4a382b],
    [0,.12,.21,2.17,.225,.25,0x4b3829],[0,2.26,.21,2.13,.30,.24,0xbbad8f],
    [0,2.33,.336,.80,.15,.015,0x47352d],[0,1.30,.02,2.11,.04,.49,0xa7ada1],
    [0,.975,.02,2.11,.04,.49,0xa7ada1],[0,.66,.02,2.11,.04,.49,0xa7ada1],
  ]);
  async function load(file){
    const [mesh]=await loadArchitecture(file);
    mesh.material=new T.MeshPhongMaterial({map:mesh.material.map,vertexColors:true,side:T.DoubleSide,
      specular:0x373730,shininess:34});
    // The photographed refrigerator has its own shelf strips. Retain their
    // low, even fill on the silver services without creating a runtime light.
    mesh.material.onBeforeCompile=shader=>{
      shader.fragmentShader=shader.fragmentShader.replace('#include <emissivemap_fragment>',
        '#include <emissivemap_fragment>\n totalEmissiveRadiance += diffuseColor.rgb * vec3(.11,.12,.11);');
    };
    return [mesh];
  }
  return placeSingleDetail(K,{name:'신세계 마켓 · 프루니에 캐비아 진열장',file:'../ssg-market-prunier/counter.glb',
    at:[x,y,z],angle,rigidGround:relief(x,z),fallback,
    fallbackMaterial:new T.MeshLambertMaterial({vertexColors:true}),loadSurface:load,
    range:9,exitRange:12,floorTolerance:2.0,eyeHeight:1.24,
    viewBounds:[new T.Box3(new T.Vector3(-1.27,0,-.34),new T.Vector3(1.27,2.93,.36))],
    closeVisibleFrom:p=>(p.x-x)*Math.sin(angle)+(p.z-z)*Math.cos(angle)>-.34});
}
