import {placeMarketDisplay} from '../gyeongbu/market-display.js';
import {storefrontVisible} from '../gyeongbu-uniqlo/model.js';

function starter(T,upper){
  const areas=upper?[[-6.48,-21.95,-3.5,9.96],[8.5,-21.95,10.47,9.96],
    [-3.5,-21.95,8.5,-20.5],[-3.5,-15.5,8.5,9.96]]:[[-6.48,-21.95,10.47,9.96]];
  const g=new T.BufferGeometry(),position=[],colour=[],indices=[],c=new T.Color(0xb78d62);
  for(const [x,d,xx,dd] of areas){
    const first=position.length/3;
    position.push(x,.039,d,x,.039,dd,xx,.039,dd,xx,.039,d);
    for(let i=0;i<4;i++)colour.push(c.r,c.g,c.b);
    indices.push(first,first+1,first+2,first,first+2,first+3);
  }
  g.setAttribute('position',new T.Float32BufferAttribute(position,3));
  g.setAttribute('color',new T.Float32BufferAttribute(colour,3));g.setIndex(indices);g.computeVertexNormals();return g;
}

export function placeUniqloFinish(K,x,y,z,angle){
  const upper=y===6,prefix=upper?'upstairs/':'';
  return placeMarketDisplay(K,{
    name:upper?'경부선 유니클로 · 2층 참나무 판매층과 열린 계단':'경부선 유니클로 · 참나무 판매층과 흰 노출 천장',
    file:'../gyeongbu-uniqlo-finish/'+prefix+'oak-and-lighting.glb',
    at:[x,y,z],angle,range:26,exitRange:32,
    focus:[[-6.48,.035,-21.95,10.47,.045,9.96],[-6.39,3.61,-12.25,10.40,4.80,9.92]],
    localSight:storefrontVisible,initialGeometry:T=>starter(T,upper),silhouette:new URL('./'+prefix+'proxy.js',import.meta.url)
  });
}
