import {placeMarketDisplay} from '../gyeongbu/market-display.js';

function starter(T){
  const positions=[],cols=[],indices=[];
  function panel(points,color){
    const first=positions.length/3,c=new T.Color(color);
    for(const p of points){positions.push(...p);cols.push(c.r,c.g,c.b);}
    indices.push(first,first+1,first+2,first,first+2,first+3);
  }
  for(const y of [.245,.60,.94])panel([[-.69,y,-1.56],[-.69,y,1.57],[.69,y,1.57],[.69,y,-1.56]],0xb3885f);
  for(const [x,col] of [[-4.05,0xc9948c],[-2.96,0xdcac80]]){
    panel([[x-.18,1.18,4.10],[x+.18,1.18,4.10],[x+.21,1.65,4.10],[x-.21,1.65,4.10]],col);
  }
  const g=new T.BufferGeometry();
  g.setAttribute('position',new T.Float32BufferAttribute(positions,3));g.setAttribute('color',new T.Float32BufferAttribute(cols,3));
  g.setIndex(indices);g.computeVertexNormals();return g;
}

// The first floor also has an opening in its side wall. From outside the
// shop, a ray to either display has to reach one of those two public fronts.
const entranceTargets=[[-.67,1.55],[.67,-1.55],[-5.22,4],[-1.78,4]];
export function storefrontVisible(width,depth,targets=entranceTargets){
  if(width>=-6.50&&width<=10.50&&depth>=-22&&depth<=10)return true;
  for(const [x,d] of targets){
    const dx=width-x,dz=depth-d;
    const tx=dx>0?(10.50-x)/dx:dx<0?(-6.50-x)/dx:Infinity;
    const tz=dz>0?(10-d)/dz:dz<0?(-22-d)/dz:Infinity;
    if(tz<=tx&&dz>0)return true; // full-height glass on the lobby side
    const crossingDepth=d+tx*dz;
    if(tx<tz&&dx<0&&crossingDepth>=-7.8&&crossingDepth<=-4.2)return true;
  }
  return false;
}

export function placeUniqloEntrance(K,x,y,z,angle){
  return placeMarketDisplay(K,{
    name:'경부선 유니클로 · 에어리즘과 입구 코디',file:'../gyeongbu-uniqlo/entrance-fashion.glb',
    at:[x,y,z],angle,focus:[[-.70,.03,-1.58,.70,1.92,1.58],[-5.28,.03,3.57,-1.70,2.05,4.43]],
    localSight:storefrontVisible,initialGeometry:starter,silhouette:new URL('./proxy.js',import.meta.url)
  });
}
