import { placeSingleDetail } from '../interior-architecture/single-detail.js';
import { boxSilhouette } from '../interior-architecture/box-silhouette.js';

export function placeWicker(K,x,y,z,angle){
  const T=K.THREE;
  const tones=[0x87353f,0xb78b52,0x6c432b,0x87353f,0xb78b52,0x6c432b,0xb78b52,0x87353f];
  const stock=tones.map((tone,j)=>[.265,.97,-1.57+j*.45,.43,.23,.40,tone]);
  for(const tier of [3,4])for(let j=0;j<8;j++){
    const base=.13+tier*.42,v=-1.57+j*.45;
    stock.push([.265,base,v,.40,.22,.39,0xb78b52],[.265,base+.37,v,.023,.026,.33,0xcfaa6f]);
  }
  for(let j=0;j<4;j++){
    for(const [side,base,v,h] of [[1.20,2.28,-1.4+j*.94,.215],[1.35,.61,-1.4+j*.92,.27]]){
      stock.push([side,base,v,.46,h,.42,tones[j+1]]);
      for(const end of [-.18,.18])stock.push([side,base+h,v+end,.025,.16,.026,tones[j+1]]);
      stock.push([side,base+h+.14,v,.026,.03,.36,tones[j+1]]);
    }
  }
  const material=new T.MeshStandardMaterial({vertexColors:true,roughness:.83});
  return placeSingleDetail(K,{name:'경부선 화기·바구니 · 등바구니 진열',
    file:new URL('./baskets.glb',import.meta.url).href,at:[x,y,z],angle,
    fallback:boxSilhouette(T,stock),fallbackMaterial:material,material,
    range:8,exitRange:10,floorTolerance:2.3,eyeHeight:1.5,
    closeVisibleFrom:eye=>(eye.x-x)*Math.cos(angle)-(eye.z-z)*Math.sin(angle)>.2});
}
