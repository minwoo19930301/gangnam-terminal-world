import {displayCase} from '../gyeongbu/display-case.js';
import {boxSilhouette} from '../interior-architecture/box-silhouette.js';
export const placeCrepeAndWaffle=displayCase({
  url:new URL('./counter.glb',import.meta.url),name:'에맥앤볼리오스 · 고디바 크레페 창가 매대',
  bodyName:'CrepeWaffleBar',baseColor:0xffffff,enter:11,leave:14,
  visibleBounds:[[-2.71,0,-2.29],[2.71,3.01,.79]],
  bodyMaterial:(T,source)=>new T.MeshPhongMaterial({map:source.map,vertexColors:true,
    side:T.DoubleSide,specular:0x383630,shininess:35}),
  proxy:T=>boxSilhouette(T,[
    [0,0,0,4.78,.81,.946,0x302f2c],[0,.80,0,4.84,.08,.99,0x474540],
    [-1.17,.88,-.06,2.16,.08,.75,0xa9ada7],[1.08,.88,-.07,.76,.16,.70,0x787a74],
    [-2.62,.87,.678,.06,1.68,.064,0x463b2e],[2.62,.87,.678,.06,1.68,.064,0x463b2e],
    [-2.62,.87,-2.19,.06,1.68,.064,0x463b2e],[2.62,.87,-2.19,.06,1.68,.064,0x463b2e],
    [0,2.55,.68,5.4,.43,.14,0x574735],[0,2.55,-2.19,5.4,.43,.14,0x574735],
    [-2.62,2.55,-.755,.14,.43,2.8,0x574735],[2.62,2.55,-.755,.14,.43,2.8,0x574735],
  ]),
});
