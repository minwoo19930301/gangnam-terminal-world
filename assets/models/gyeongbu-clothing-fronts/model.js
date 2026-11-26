import {placeMarketDisplay} from '../gyeongbu/market-display.js';

const fronts={
  Suits:['seven','tailored-front','경부선 7층 · 두 단의 모직과 코트 전면'],
  Womenswear:['eight','knit-front','경부선 8층 · 긴 니트와 스카프 전면'],
};

function backPanel(T){
  const g=new T.BoxGeometry(.09,2.86,5.05).translate(1.3,1.43,0);
  const colors=new Float32Array(g.attributes.position.count*3).fill(.54);
  g.setAttribute('color',new T.BufferAttribute(colors,3));
  g.boundingSphere=new T.Sphere(new T.Vector3(-1.6,1.48,.75),4.95);
  return g;
}

export function clothingFront(K,key,x,y,z,rotation){
  const [directory,stem,name]=fronts[key];
  return placeMarketDisplay(K,{name,file:'../gyeongbu-clothing-fronts/'+directory+'/'+stem+'.glb',
    at:[x,y,z],angle:rotation,focus:[[-2.77,.01,-2.60,1.35,2.95,2.60],[-5.16,2.87,-2.87,-2.70,2.95,4.64]],
    silhouette:new URL('./'+directory+'/proxy.js',import.meta.url),
    initialGeometry:backPanel,localSight:(width,depth)=>width<1.27&&(width<=-1.3||Math.abs(depth)<2.53),
    range:13,exitRange:17});
}
