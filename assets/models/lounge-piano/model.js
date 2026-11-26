import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {placeSingleDetail} from '../interior-architecture/single-detail.js';

function silhouette(T) {
  const parts=[];
  function add(g,color) {
    g=g.index?g.toNonIndexed():g;
    const rgb=new T.Color(color), colors=new Float32Array(g.attributes.position.count*3);
    for(let i=0;i<colors.length;i+=3)rgb.toArray(colors,i);
    g.deleteAttribute('uv');
    g.setAttribute('color',new T.BufferAttribute(colors,3));
    parts.push(g);
  }
  function box(x,y,z,w,h,d,color) {
    add(new T.BoxGeometry(w,h,d).translate(x,y+h/2,z),color);
  }
  const points=[[-.79,.90],[.79,.90],[.79,.40],[.44,-.23],[.23,-.62],[.14,-1.08],[-.07,-1.30],[-.39,-1.38],[-.72,-1.26],[-.79,-1.09]];
  function leaf(lid) {
    const data=[],indices=[];
    for(const t of [0,1])for(const [x,z] of points) {
      data.push(lid?-.775+(x+.775)*.875:x,
        lid?1.008+(x+.775)*.485+t*.03:.68+t*.27,z);
    }
    const n=points.length;
    for(let i=0;i<n;i++){
      const j=(i+1)%n;
      indices.push(i,j,n+j,i,n+j,n+i);
      if(i>0&&i<n-1)indices.push(n,n+i+1,n+i,0,i,i+1);
    }
    const geom=new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute(data,3));
    geom.setIndex(indices);geom.computeVertexNormals();add(geom,0x292a2d);
  }
  leaf(false);leaf(true);
  box(0,.75,1.02,1.40,.044,.28,0xe6e1d6);
  for(const [x,z] of [[-.67,.815],[.67,.815],[-.38,-1.03]])box(x,.035,z,.09,.68,.09,0x232327);
  box(0,.40,1.80,.89,.11,.40,0x332e2e);
  for(const x of [-.36,.36])for(const z of [1.66,1.94])box(x,0,z,.05,.40,.05,0x232327);
  const geometry=mergeGeometries(parts);
  for(const part of parts)part.dispose();
  return geometry;
}

export function placePiano(K,x,y,z,angle) {
  const T=K.THREE;
  const polished=new T.MeshPhongMaterial({vertexColors:true,specular:0x393635,shininess:48,side:T.DoubleSide});
  return placeSingleDetail(K,{name:'더 라운지 · 그랜드 피아노와 의자',file:'../lounge-piano/grand.glb',
    at:[x,y,z],angle,fallback:silhouette(T),fallbackMaterial:polished,material:polished,
    range:14,exitRange:18,floorTolerance:2.9,eyeHeight:1.0});
}
