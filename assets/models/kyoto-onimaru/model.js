import {displayCase} from '../gyeongbu/display-case.js';
import {boxSilhouette} from '../interior-architecture/box-silhouette.js';

export const placeOnimaru=displayCase({
  url:new URL('./counter.glb',import.meta.url),
  name:'교토 오니마루 · 곡면 진열대와 야끼무스비',bodyName:'OnimaruCounter',
  baseColor:0xffffff,enter:11,leave:14,visibleBounds:[[-2.72,0,-.51],[2.72,3.08,.51]],
  bodyMaterial:(T,source)=>new T.MeshPhongMaterial({map:source.map,vertexColors:true,
    side:T.DoubleSide,specular:0x262420,shininess:23}),
  proxy:T=>boxSilhouette(T,[
    [0,0,0,5.35,.77,.90,0x373639],[0,.77,0,5.38,.08,.94,0xc5c2b8],
    [0,.85,0,5.28,.04,.85,0xd3ae7b],[0,.88,-.40,5.24,.53,.05,0xe3dccb],
    [-2.59,1.36,-.37,.11,1.2,.11,0x302f2c],[2.59,1.36,-.37,.11,1.2,.11,0x302f2c],
    [0,2.50,0,5.42,.57,1.03,0x292826],[-1.84,2.65,.51,1.45,.28,.01,0xb9b5a7],
    [1.84,2.65,.51,1.45,.28,.01,0xb9b5a7],
  ]),
});
