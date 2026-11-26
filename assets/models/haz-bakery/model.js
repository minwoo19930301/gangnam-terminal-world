import {placeSingleDetail} from '../interior-architecture/single-detail.js';
import {relief} from '../../../js/banpo_relief.js';

export function hazBakery(K,x,y,z,angle) {
  const T=K.THREE;
  return placeSingleDetail(K,{
    name:'하츠베이커리 · 샌드베이글과 포장',file:'../haz-bakery/display.glb',
    at:[x,y,z],angle,rigidGround:relief(x,z),
    fallback:new T.BoxGeometry(2.55,.078,.77).translate(0,.012,0),
    fallbackMaterial:new T.MeshLambertMaterial({color:0xf1debe}),
    material:new T.MeshPhongMaterial({vertexColors:true,shininess:19}),
    range:9,exitRange:12,floorTolerance:2.1,eyeHeight:.42,
    viewBounds:[new T.Box3(new T.Vector3(-1.28,-.79,-.4),new T.Vector3(1.28,.61,.4))]
  });
}
