import {boxSilhouette} from '../interior-architecture/box-silhouette.js';
import {placeSingleDetail} from '../interior-architecture/single-detail.js';

export const landingName='센트럴시티 터미널 승강기 · 지하 문턱';

export function placeTerminalLanding(K,x,y,z,angle) {
  const T=K.THREE;
  const fallback=boxSilhouette(T,[
    [0,.008,.39,1.55,.012,.98,0xbeb3a4],
    [0,.01,-.27,1.55,.013,.32,0xb6babb],
    [-.794,.02,.225,.096,2.42,.025,0xb6babb],
    [.794,.02,.225,.096,2.42,.025,0xb6babb],
    [0,2.44,.225,1.68,.048,.025,0xb6babb],
  ]);
  const material=new T.MeshPhongMaterial({vertexColors:true,side:T.DoubleSide,shininess:34,specular:0x423e39});
  return placeSingleDetail(K,{name:landingName,file:'../central-terminal-landing/landing.glb',
    at:[x,y,z],angle,fallback,material,fallbackMaterial:material,range:9,exitRange:12,floorTolerance:2.6,eyeHeight:1.5});
}
