import {displayCase} from '../gyeongbu/display-case.js';
import {boxSilhouette} from '../interior-architecture/box-silhouette.js';
export const placeGuo=displayCase({
  url:new URL('./counter.glb',import.meta.url),
  name:'구오 X 여경래 · 생전포 철판과 지짐만두',bodyName:'GuoCounter',
  baseColor:0xffffff,enter:10,leave:13,visibleBounds:[[-2.71,0,-.48],[2.71,2.89,.49]],
  bodyMaterial:(T,source)=>new T.MeshPhongMaterial({map:source.map,vertexColors:true,
    side:T.DoubleSide,specular:0x292723,shininess:26}),
  proxy:T=>boxSilhouette(T,[
    [0,0,0,5.32,.76,.90,0x594b43],[0,.76,0,5.38,.061,.94,0xaeafaa],
    [-1.51,1.23,-.03,2.03,.05,.73,0xc69e63],[-1.50,.87,-.37,2.01,.72,.04,0xe9e3d4],
    [1.28,.91,0,.82,.07,.82,0x343538],[-2.63,.82,-.36,.08,1.78,.07,0x332e28],
    [2.63,.82,-.36,.08,1.78,.07,0x332e28],[0,2.60,-.03,5.37,.28,.81,0x282522],
  ]),
});
