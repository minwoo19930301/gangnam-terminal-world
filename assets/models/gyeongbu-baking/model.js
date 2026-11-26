import {placeMarketDisplay} from '../gyeongbu/market-display.js';

function storefront(T){
  const positions=[],colors=[],indices=[];
  function face(vertices,hex){
    const start=positions.length/3,c=new T.Color(hex);
    for(const point of vertices){positions.push(...point);colors.push(c.r,c.g,c.b);}
    indices.push(start,start+1,start+2,start,start+2,start+3);
  }
  face([[-2.55,.05,-5.90],[-2.55,.05,5.00],[2.55,.05,5.00],[2.55,.05,-5.90]],0x9b907d);
  for(const x of [-2.51,2.51]){
    face([[x-.055,.05,5.06],[x+.055,.05,5.06],[x+.055,3.25,5.06],[x-.055,3.25,5.06]],0xb12928);
  }
  face([[-2.56,3.12,5.06],[2.56,3.12,5.06],[2.56,3.26,5.06],[-2.56,3.26,5.06]],0xb12928);
  face([[-2.46,2.75,5.015],[2.46,2.75,5.015],[2.46,3.12,5.015],[-2.46,3.12,5.015]],0x373531);
  const g=new T.BufferGeometry();
  g.setAttribute('position',new T.Float32BufferAttribute(positions,3));
  g.setAttribute('color',new T.Float32BufferAttribute(colors,3));g.setIndex(indices);g.computeVertexNormals();
  return g;
}

export function placeBakingShop(K,x,y,z,angle){
  return placeMarketDisplay(K,{name:'경부선 부속상가 · 비앤씨마켓 반죽기와 제과 도구',
    file:'../gyeongbu-baking/baking-shop.glb',at:[x,y,z],angle,
    focus:[[-2.55,.06,4.91,2.55,3.26,5.13],[-2.49,.19,-5.82,2.46,2.54,3.37]],
    frontage:{halfWidth:2.60,back:-5.94,front:5.05},initialGeometry:storefront,silhouette:new URL('./proxy.js',import.meta.url)});
}
