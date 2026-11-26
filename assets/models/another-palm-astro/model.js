import {placeSingleDetail} from '../interior-architecture/single-detail.js';
import {relief} from '../../../js/banpo_relief.js';

const start = Date.parse('2026-11-20T00:00:00+09:00');
const end = Date.parse('2026-12-11T00:00:00+09:00');

export function anotherPalmEdition(K,x,y,z,angle) {
  const T=K.THREE;
  const root=placeSingleDetail(K,{
    name:'어나더팜 · 아톰 에디션',file:'../another-palm-astro/display.glb',
    at:[x,y,z],angle,rigidGround:relief(x,z),eyeHeight:.4,range:8,exitRange:11,floorTolerance:2.1,
    fallback:new T.BoxGeometry(2.25,.065,.48).translate(0,.033,0),
    fallbackMaterial:new T.MeshLambertMaterial({color:0x242426}),
    material:new T.MeshPhongMaterial({vertexColors:true,shininess:28}),
    viewBounds:[new T.Box3(new T.Vector3(-1.15,0,-.3),new T.Vector3(1.15,1,.3))]
  });
  const display=root.children[0];
  function updateDate() {
    const now=Date.now();
    display.visible=now>=start && now<end;
  }
  updateDate();
  if (Date.now()<end) K.onFrame(updateDate);
}
