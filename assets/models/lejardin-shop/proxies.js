import * as T from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {boxSilhouette} from '../interior-architecture/box-silhouette.js';
const B=(x,y,z,w,h,d,color)=>[x,y,z,w,h,d,color];
const boxes={
 shell:[B(0,.03,0,6.97,.027,4.98,0xe6e2d9),B(0,.06,2.46,6.97,3.13,.06,0xe6dfd2),...[-3.46,3.46].map(x=>B(x,.06,0,.07,3.15,4.98,0xe6dfd2))],
 front:[B(0,2.58,-.1,7,.69,.56,0xd1c1aa),B(0,3.27,-.09,6.98,.19,.46,0xc5b6a4),
  ...[-1,1].flatMap(side=>[B(side*3.3,.08,-.08,.45,3.12,.53,0xd5c8b5),B(side*2.41,.06,.024,.99,2.50,.13,0x70513f)])],
 brand:[B(0,.18,.005,3.14,.065,.018,0xfff7e3)],
 case:[B(0,0,0,3.14,.20,.81,0x302f2e),B(0,1.75,0,3.14,.27,.81,0x302f2e),
  B(0,.2,.369,3.09,1.54,.04,0x9fa191),...[-1.54,-.51,.51,1.54].map(x=>B(x,.19,-.391,.031,1.57,.034,0x383d36)),
  ...[.175,.68,1.184].map(y=>B(0,y,-.01,3.09,.035,.78,0x8d9380))],
 clear:[...[-1.017,0,1.017].map(x=>B(x+.441,.69,-.02,.021,.22,.035,0xa9b3ad))],
 vases:[...Array.from({length:27},(_,i)=>B((i%9-4)*.33,Math.floor(i/9)*.505,0,.077,.196,.072,0xb8c9bf))],
 counter:[B(0,.07,0,2.71,.85,.71,0x45403e),B(0,.90,0,2.75,.032,.78,0x353332),B(0,.05,-.362,2.61,.019,.015,0xf2dbac)],
 cards:[B(0,0,0,.38,.055,.34,0x322f2d),...Array.from({length:4},(_,j)=>B(0,.10+j*.37,0,.45,.17,.16,j%2?0xd8bcc0:0xe1cebb)),...[-.195,.195].map(x=>B(x,0,0,.014,1.37,.24,0x393834))],
 parcels:[...[[.70,-.37,.0,.30],[.65,-.39,.25,.21],[-.74,-.23,0,.29],[-.77,-.20,.24,.19],[-.04,-.42,.0,.24],[.01,-.42,.19,.16]].map(([x,z,y,w])=>B(x,y,z,w,w*.84,w*.74,0x862337))],
 bulbs:[B(0,.07,0,.005,.005,.005,0xe4c287)],
};
const colorize=(g,color)=>{const a=new Float32Array(g.attributes.position.count*3),c=new T.Color(color);for(let k=0;k<a.length;k+=3)c.toArray(a,k);g.setAttribute('color',new T.BufferAttribute(a,3));return g;};
function flowerShapes(k){
  const p=[],tones=k==='gold'?[0xd4a744,0xf2d974,0xa5ad74]:k==='pink'?[0xe49fac,0xac627c,0xe9c6ab]:[0xc2bbcb,0x8897bb,0x876ba2];
  for(let j=0;j<3;j++)for(let i=0;i<3;i++){
    const x=(i-1)*.292,y=.32+j*.505;
    p.push(colorize(new T.ConeGeometry(.063,.254,6).translate(x,y-.104,0),0x718165));
    for(let b=0;b<5;b++)p.push(colorize(new T.IcosahedronGeometry(.045,0).translate(x+.062*Math.sin(b*2.40),y+.025*Math.cos(b),.054*Math.cos(b*2.40)),tones[(i+j+b)%3]));
  }
  return p;
}
function pineShapes(key){
  const [height,r]=key==='pineHigh'?[1.94,.48]:key==='pineMid'?[1.58,.38]:[1.23,.305],p=[];
  for(let j=0;j<11;j++){
    const t=j/11,rad=r*(1-t)**.72,h=height*(.28-.11*t),g=new T.ConeGeometry(rad,h,11,2);
    g.rotateY(j*.42);g.translate(0,.15+(height-.16)*t+h*.39,0);
    p.push(colorize(g,[0x34583b,0x3b6141,0x476945][j%3]));
  }
  return p;
}
const cache=new Map();
export function proxy(key){
  if(cache.has(key))return cache.get(key);
  let out;
  if(boxes[key])out=boxSilhouette(T,boxes[key]);
  else{
    let parts;
    if(key.startsWith('pine'))parts=pineShapes(key);
    else if(key.endsWith('Wrap')){
      const paper=key==='mixedWrap'?0xcba97f:0xe6dfc6;parts=[colorize(new T.ConeGeometry(.146,.34,8).rotateX(Math.PI).translate(0,.22,0),paper)];
      for(let i=0;i<8;i++)parts.push(colorize(new T.IcosahedronGeometry(.048,0).translate(.082*Math.cos(i*2.4),.413+.032*Math.sin(i),.07*Math.sin(i*2.4)),(key==='mixedWrap'?[0xb94d6b,0xdfa24a,0x9979ab]:[0x879cbd,0xb7c6d6,0x71678c])[i%3]));
    }else parts=flowerShapes(key);
    // Polyhedra are non-indexed while the cones are indexed.
    const unified=parts.map(g=>g.index?g.toNonIndexed():g);
    out=mergeGeometries(unified);for(const g of new Set([...parts,...unified]))g.dispose();
  }
  cache.set(key,out);return out;
}
