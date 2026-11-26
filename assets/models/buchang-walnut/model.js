import {boxSilhouette} from '../interior-architecture/box-silhouette.js';
import {loadArchitecture} from '../interior-architecture/model.js';
import {placeSingleDetail} from '../interior-architecture/single-detail.js';
import {relief} from '../../../js/banpo_relief.js';

export function buchangWalnutCounter(K,x,y,z,angle){
  const T=K.THREE;
  const proxy=boxSilhouette(T,[
    [0,0,-.065,4.30,.88,.91,0x896041],[0,.85,-.04,4.44,.085,.99,0xe8e3d5],
    [-1.40,1.647,-.18,1.08,.52,.06,0xe8dfc8],
    [-1.255,.94,-.33,1.58,.68,.04,0xdcd5c5],
    [-1.255,1.615,-.07,1.58,.042,.60,0x956c48],
    [-2.025,.94,-.07,.045,.67,.60,0x946745],[-.485,.94,-.07,.045,.67,.60,0x946745],
    [-.14,.94,-.235,.49,.38,.39,0xe9dfc8],[.51,.94,-.28,.47,.61,.22,0xe9dfc8],
    [1.44,.983,-.035,.98,.07,.44,0x45443e],
  ]);
  async function loadCounter(file){
    const [mesh]=await loadArchitecture(file);
    const finish=new T.MeshPhongMaterial({map:mesh.material.map,vertexColors:true,shininess:27,specular:0x26211c});
    finish.onBeforeCompile=shader=>{
      shader.fragmentShader=shader.fragmentShader.replace('#include <emissivemap_fragment>',
        '#include <emissivemap_fragment>\n totalEmissiveRadiance += diffuseColor.rgb * vec3(.15,.14,.12);');
    };
    mesh.material=finish;return [mesh];
  }
  return placeSingleDetail(K,{name:'부창제과 · 호두과자 철판과 선물 상자',file:'../buchang-walnut/counter.glb',
    at:[x,y,z],angle,rigidGround:relief(x,z),fallback:proxy,
    fallbackMaterial:new T.MeshLambertMaterial({vertexColors:true}),loadSurface:loadCounter,
    range:9,exitRange:12,floorTolerance:2.0,eyeHeight:1.24,
    viewBounds:[new T.Box3(new T.Vector3(-2.24,0,-.55),new T.Vector3(2.24,2.19,.47))],
    closeVisibleFrom:p=>(p.x-x)*Math.sin(angle)+(p.z-z)*Math.cos(angle)>-.40});
}
