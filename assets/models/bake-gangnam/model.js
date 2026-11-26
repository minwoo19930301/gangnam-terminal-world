import {displayCase} from '../gyeongbu/display-case.js';
import {boxSilhouette} from '../interior-architecture/box-silhouette.js';

export const bakeCounter=displayCase({
  name:'베이크 강남 · 치즈 타르트 매대',url:new URL('./counter.glb',import.meta.url),
  bodyName:'GangnamBakeCounter',baseColor:0xffffff,enter:10,leave:13,
  visibleBounds:[[-2.23,0,-1.02],[2.23,5.01,1.02]],
  proxy:T=>boxSilhouette(T,[
    [0,4.08,0,4.04,.13,1.62,0xb18d52],
    [0,0,0,3.56,.84,.67,0x302e29],[0,.84,0,3.60,.08,.71,0x292925],
    [0,.92,0,2.35,.18,.53,0xf1c849],[0,2.49,0,3.58,.40,.70,0x413b32],
    [-1.69,.92,-.29,.07,1.58,.07,0x534c40],[1.69,.92,-.29,.07,1.58,.07,0x534c40]
  ]),
  bodyMaterial:T=>{
    const finish=new T.MeshPhongMaterial({vertexColors:true,side:T.DoubleSide,
      shininess:34,specular:0x403a30});
    finish.onBeforeCompile=shader=>{
      shader.fragmentShader=shader.fragmentShader.replace('#include <emissivemap_fragment>',
        '#include <emissivemap_fragment>\n totalEmissiveRadiance += diffuseColor.rgb*(.09+.68*smoothstep(.83,.98,vColor.r)*smoothstep(.69,.84,vColor.g));');
    };
    return finish;
  }
});
