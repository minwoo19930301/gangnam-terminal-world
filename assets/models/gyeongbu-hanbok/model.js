import {placeMarketDisplay} from '../gyeongbu/market-display.js';

function storefront(T){
  const positions=[],colours=[],indices=[];
  function face(vertices,hex){
    const first=positions.length/3,c=new T.Color(hex);
    for(const point of vertices){positions.push(...point);colours.push(c.r,c.g,c.b);}
    indices.push(first,first+1,first+2,first,first+2,first+3);
  }
  face([[-2.57,.045,-1.29],[-2.57,.045,1.29],[2.57,.045,1.29],[2.57,.045,-1.29]],0xb2aba3);
  face([[-2.56,.045,-1.24],[2.56,.045,-1.24],[2.56,2.82,-1.24],[-2.56,2.82,-1.24]],0xe1ded4);
  face([[-2.56,2.48,1.31],[2.56,2.48,1.31],[2.56,2.81,1.31],[-2.56,2.81,1.31]],0xece8dc);
  for(const [x,col] of [[-1.86,0x31583d],[-.91,0x65748d]]){
    face([[x-.42,.10,1.08],[x+.42,.10,1.08],[x+.14,1.19,1.08],[x-.14,1.19,1.08]],col);
    face([[x-.15,1.14,1.08],[x+.15,1.14,1.08],[x+.19,1.51,1.08],[x-.19,1.51,1.08]],0xeeeae1);
  }
  const g=new T.BufferGeometry();
  g.setAttribute('position',new T.Float32BufferAttribute(positions,3));
  g.setAttribute('color',new T.Float32BufferAttribute(colours,3));g.setIndex(indices);g.computeVertexNormals();
  return g;
}

export function placeHanbokShowroom(K,x,y,z,angle){
  return placeMarketDisplay(K,{
    name:'경부선 4층 · 고명재한복 치마와 저고리',file:'../gyeongbu-hanbok/hanbok-showroom.glb',
    at:[x,y,z],angle,focus:[[-2.53,.11,-1.24,2.53,2.82,1.31]],
    frontage:{halfWidth:2.58,back:-1.28,front:1.30},initialGeometry:storefront,silhouette:new URL('./proxy.js',import.meta.url)
  });
}
