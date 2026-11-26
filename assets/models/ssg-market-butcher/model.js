import {displayCase} from '../gyeongbu/display-case.js';
import {boxSilhouette} from '../interior-architecture/box-silhouette.js';
export const placeAgingCabinet=displayCase({
  url:new URL('./counter.glb',import.meta.url),
  name:'신세계 마켓 · 숙성 정육 진열장',bodyName:'AgingCabinet',baseColor:0xffffff,
  enter:10,leave:13,visibleBounds:[[-2.20,0,-.55],[2.20,2.65,.60]],
  bodyMaterial:(T,source)=>new T.MeshPhongMaterial({map:source.map,vertexColors:true,side:T.DoubleSide,
    shininess:35,specular:0x302e28}),
  proxy:T=>boxSilhouette(T,[
    [0,0,0,4.40,.185,1.10,0x292c29],[0,.18,-.49,4.39,2.37,.11,0x30332f],
    [0,2.54,0,4.40,.11,1.10,0x302e29],[-2.15,.18,0,.09,2.40,1.1,0x2d302c],
    [2.15,.18,0,.09,2.40,1.1,0x2d302c],[0,.42,0,4.27,.05,.79,0x77766c],
    [0,1.18,0,4.27,.05,.79,0x77766c],[-.70,.18,.54,.045,2.37,.05,0x756b55],
    [.70,.18,.54,.045,2.37,.05,0x756b55],[-1.92,1.03,-.1,.40,1.25,.12,0x9d7065],
    [1.81,1.03,-.1,.44,1.25,.12,0xa77a6a],
  ]),
});
