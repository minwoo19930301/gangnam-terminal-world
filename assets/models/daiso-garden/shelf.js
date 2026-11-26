import {boxSilhouette} from '../interior-architecture/box-silhouette.js';
import {placeSingleDetail} from '../interior-architecture/single-detail.js';

let geometry,paint,flowerGeometry,flowerPaint;
export function gardenShelf(K,at,angle){
  if(!geometry){
    const components=[[0,0,.015,3.02,.202,.545,0xe6e8e5],[0,.198,.294,3.02,1.79,.025,0xe6e8e5],
      [0,2.218,.099,3.02,.254,.048,0x8c9f74]];
    const heights=[.21,.58,.86,1.14,1.42,1.68,1.93];
    const tones=[[0xe1e0d6,0x675851,0x877365,0xe6e2d6],[0xa37a59,0xc8a95f,0x80967d,0xc5a39d],
      [0x829279,0xc8c6b8,0x8999a0,0xaf8a6e],[0xe8e6df,0xd4b6b7,0xe6ddd6,0xa57d61],
      [0xe1ddd5,0xd8caba,0xd1cdbd,0xb1bcac],[0xafbcc4,0xcfb9b5,0xcec1b3,0xbcb6a2],
      [0xbcc6c7,0xd6c7c0,0xd1b69c,0xc4c9c7]];
    heights.forEach((h,i)=>{
      components.push([0,h,.004,3.04,.032,.584,0xebece8]);
      for(let j=0;j<4;j++)components.push([(j-1.5)*.73,h+.026,-.01,.65,i===0?.23:.142,.28,tones[i][j]]);
    });
    geometry=boxSilhouette(K.THREE,components);
    paint=new K.THREE.MeshLambertMaterial({vertexColors:true});
  }
  // The opaque backboard is also visible from the neighbouring aisle. Keep its
  // silhouette in that aisle even after close stock has already been cached.
  const [x,,z]=at,dx=Math.sin(angle),dz=Math.cos(angle);
  const closeVisibleFrom=p=>(p.x-x)*dx+(p.z-z)*dz<.21;
  return placeSingleDetail(K,{name:'다이소 · 홈가드닝 화분 진열',file:'../daiso-garden/pots.glb',
    at,angle,fallback:geometry,fallbackMaterial:paint,material:paint,closeVisibleFrom,range:7.5,exitRange:9.5,eyeHeight:1.25,floorTolerance:2.2});
}

export function gardenFlowers(K,at,angle){
  if(!flowerGeometry){
    const parts=[[0,0,-.03,1.16,.21,.65,0xb49a73],[0,.21,.16,1.16,.19,.23,0xc5aa81],
      [-.51,.4,.233,.022,1.52,.02,0xe5e8e3],[.51,.4,.233,.022,1.52,.02,0xe5e8e3],
      [0,1.91,.233,1.04,.019,.02,0xe5e8e3]];
    for(let i=0;i<4;i++)parts.push([(i-1.5)*.28,.21,-.14,.175,.25,.17,i%2?0xaf956e:0xc8ac7f],
      [(i-1.5)*.28,.46,-.14,.19,.19,.18,0x748863],[(i-1.5)*.28,.61,-.14,.22,.16,.19,i<2?0xede8d6:0xdcba4e]);
    for(let i=0;i<3;i++)for(const h of [1.02,1.37])parts.push([(i-1)*.34,h,.13,.135,.16,.10,0x72815a],
      [(i-1)*.34,h+.12,.13,.15,.105,.13,[0xcc9da6,0xd6ba68,0xe8dfc4][i]]);
    flowerGeometry=boxSilhouette(K.THREE,parts);
    flowerPaint=new K.THREE.MeshLambertMaterial({vertexColors:true,side:K.THREE.DoubleSide});
  }
  return placeSingleDetail(K,{name:'다이소 · 화분 옆 조화 진열',file:'../daiso-garden/bouquets.glb',
    at,angle,fallback:flowerGeometry,fallbackMaterial:flowerPaint,material:flowerPaint,range:6.5,exitRange:8.5,eyeHeight:1.13,floorTolerance:2.2});
}
