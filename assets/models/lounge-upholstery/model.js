import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {placeSingleDetail} from '../interior-architecture/single-detail.js';

function simpleSofa(T) {
  const parts=[],bounds=[];
  function block(x,z,y,w,d,h,color) {
    const g=new T.BoxGeometry(w,h,d);
    g.translate(x-2.70,y+h/2,z-3.0);
    const tint=new T.Color(color), rgb=new Float32Array(g.attributes.position.count*3);
    for(let i=0;i<rgb.length;i+=3)tint.toArray(rgb,i);
    g.setAttribute('color',new T.BufferAttribute(rgb,3));
    g.computeBoundingBox();
    bounds.push(g.boundingBox.clone());
    parts.push(g);
  }
  block(0,3.45,.08,.89,7.2,.36,0xd4c3aa);
  block(-.35,3.45,.43,.19,7.2,.38,0xe0d1bd);
  block(3.16,0,.08,5.45,.91,.36,0xd4c3aa);
  block(3.16,-.35,.43,5.45,.20,.38,0xe0d1bd);
  for(const z of [.85,2.55,4.8,6.2])block(-.20,z,.44,.14,.46,.41,0x986249);
  for(const x of [1.4,2.8,4.6])block(x,-.18,.44,.46,.14,.41,0xad755b);
  const g=mergeGeometries(parts);
  parts.forEach(p=>p.dispose());
  return {geometry:g,bounds};
}

export function placeCornerSofa(K,x,y,z,angle){
  const T=K.THREE;
  const coarse=simpleSofa(T);
  const material=new T.MeshLambertMaterial({vertexColors:true,side:T.DoubleSide});
  return placeSingleDetail(K,{
    name:'더 라운지 · 크림색 코너 소파',file:'../lounge-upholstery/corner-sofa.glb',at:[x,y,z],angle,
    fallback:coarse.geometry,viewBounds:coarse.bounds,fallbackMaterial:material,material,range:16,exitRange:21,floorTolerance:2.8,eyeHeight:.82,
  });
}
