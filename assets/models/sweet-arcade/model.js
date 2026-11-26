import {placeSingleDetail} from '../interior-architecture/single-detail.js';
import {relief} from '../../../js/banpo_relief.js';

export function arcadePiers(K,x,y,z,angle,spacing) {
  const T=K.THREE;
  const proxy=new T.BoxGeometry(.83,3.50,.83).translate(0,1.75,0);
  const paint=new T.MeshPhongMaterial({vertexColors:true,specular:0x342e22,shininess:36});
  const stone=new T.MeshLambertMaterial({color:0xe4d4bc});
  placeSingleDetail(K,{
    name:'스위트 파크 · 디저트 홀 타일 기둥',file:'../sweet-arcade/pier.glb',
    at:[x,y,z],angle,rigidGround:relief(x,z),
    translations:[-spacing,0,spacing].map(d=>[0,0,d]),
    fallback:proxy,fallbackMaterial:stone,material:paint,
    range:22,exitRange:26,floorTolerance:2.2,eyeHeight:1.65
  });
}
