import {displayCase} from '../gyeongbu/display-case.js';
import {boxSilhouette} from '../interior-architecture/box-silhouette.js';
export const placeSpringRolls=displayCase({
  url:new URL('./counter.glb',import.meta.url),
  name:'블루버터플라이 · 스프링롤 쇼케이스',bodyName:'SpringRollCounter',
  baseColor:0xffffff,enter:9,leave:12,visibleBounds:[[-1.25,0,-.47],[1.25,2.00,.49]],
  bodyMaterial:(T,source)=>new T.MeshPhongMaterial({map:source.map,vertexColors:true,
    side:T.DoubleSide,specular:0x252420,shininess:26}),
  proxy:T=>boxSilhouette(T,[
    [0,0,0,2.45,.72,.90,0x68472f],[0,.72,0,2.48,.08,.92,0xb6b8b4],
    [0,.84,0,2.37,.04,.59,0xb7906e],[0,1.06,-.06,2.35,.05,.52,0xd1c9ac],
    [0,1.40,0,2.47,.04,.85,0xaaa9a0],[-.72,1.85,-.22,.56,.14,.03,0x505f9e],
    [.074,1.44,-.22,.83,.32,.03,0xf2e6d2],
  ]),
});
