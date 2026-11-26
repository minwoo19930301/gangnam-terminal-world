import {placeMarketDisplay} from '../gyeongbu/market-display.js';
import {storefrontVisible} from '../gyeongbu-uniqlo/model.js';

function starter(T){
  const g=new T.PlaneGeometry(16.95,31.91).rotateX(-Math.PI/2).translate(1.995,.039,-5.995);
  const c=new T.Color(0xb78d62),colors=[];
  for(let i=0;i<4;i++)colors.push(c.r,c.g,c.b);
  g.setAttribute('color',new T.Float32BufferAttribute(colors,3));return g;
}

export function placeUniqloFinish(K,x,y,z,angle){
  return placeMarketDisplay(K,{
    name:'경부선 유니클로 · 참나무 판매층과 흰 노출 천장',file:'../gyeongbu-uniqlo-finish/oak-and-lighting.glb',
    at:[x,y,z],angle,range:26,exitRange:32,
    focus:[[-6.48,.035,-21.95,10.47,.045,9.96],[-6.39,3.61,-12.25,10.40,4.80,9.92]],
    localSight:storefrontVisible,initialGeometry:starter,silhouette:new URL('./proxy.js',import.meta.url)
  });
}
