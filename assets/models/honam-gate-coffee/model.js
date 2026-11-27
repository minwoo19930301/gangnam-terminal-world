import { boxSilhouette } from '../interior-architecture/box-silhouette.js';
import { placeSingleDetail } from '../interior-architecture/single-detail.js';

const name='스타벅스 센트럴시티점';
const frontS=170.95, frontT=13.5, landing=.96;

// +x is the visitor's right and +d goes into the coffee shop.
export function buildHonamGateCoffee(K, P, rotation) {
  const T=K.THREE;
  const W=(x,d)=>P(frontS+d,frontT-x);
  const rect=(x0,d0,x1,d1)=>[W(x0,d0),W(x1,d0),W(x1,d1),W(x0,d1)];
  const wall=(x0,d0,x1,d1,lo,hi)=>K.phys.addWall(...W(x0,d0),...W(x1,d1),lo,hi,.05,'centralcity');
  const surface=(poly,height)=>K.phys.addSurface(poly,height,{tag:'centralcity'});

  surface(rect(-3.23,-.75,3.23,3.59),landing);
  for(let i=0;i<6;i++) {
    const d=-2.33+i*.265, height=(i+1)*.16;
    surface(rect(-3.2,d,2.42,d+.265),height);
    wall(-3.2,d,-3.2,d+.265,0,height);
    wall(2.42,d,2.42,d+.265,0,height);
  }
  wall(-3.16,-.43,-3.16,3.56,0,3.96);
  wall(3.16,-.43,3.16,3.56,0,3.96);
  wall(-3.16,3.53,3.16,3.53,0,3.96);
  wall(2.31,-.37,3.16,-.37,0,3.96);
  wall(-1.04,-.34,2.30,-.34,landing,3.1);
  for(const [a,b] of [[-1.04,.35],[.35,1.69],[1.69,2.30]]) {
    K.wall(...W(a,-.34),...W(b,-.34),landing+.10,3.10,{mat:'glass',thick:.012,solid:false});
  }
  const fittings=[[-1.47,1.98,2.13,2.72,1.95],[-2.80,.52,-2.06,1.13,1.70],[2.02,.52,2.76,1.13,1.70]];
  for(const [a,b,c,d,height] of fittings)K.phys.addPolyWalls(rect(a,b,c,d),landing,height,.02,'centralcity');

  // From the hall the full fascia fits a portrait screen. Aim through the
  // left-hand door at a near-integer bearing preserved by map transfer URLs.
  const [x,z]=W(0,0),[approachX,approachZ]=W(-5.23,-18.95),[shopX,shopZ]=W(-1.96,.95);
  const yaw=Math.atan2(approachX-shopX,approachZ-shopZ);
  K.zone({name,floor:'1F',sub:'파미에스테이션 1게이트 옆 · 호남선 승차장',
    poly:rect(-3.23,-2.33,3.23,3.59),y0:-.15,y1:4.18,priority:22,
    mapArrival:{x:approachX,y:0,z:approachZ,yaw}});
  K.spawn({name:name+' 입구',place:'centralcity',floor:'1F',group:'호남선 승차장 · 파미에 1게이트',
    x:approachX,y:0,z:approachZ,yaw,mapDestination:true,aliases:['스타벅스 센트럴시티','STARBUCKS Central City','스벅 호남선']});

  const nearby=rect(-3.5,-2.5,3.5,3.75);
  K.detail({name,floor:'1F',poly:nearby,y0:0,y1:4.21},()=>{
    const boxes=[[0,0,-1.42,6.46,landing,4.34,0x435149],[-.23,3.10,.47,5.87,.79,.33,0x29292a],
      [2.77,.02,.36,.91,3.96,.42,0x825538],[0,landing,-3.53,6.46,2.98,.13,0x805d40],
      [0,3.94,-1.62,6.47,.10,4.08,0xbcaa93],[.33,landing,-2.35,3.6,.91,.75,0x8e633f]];
    for(let i=0;i<6;i++)boxes.push([-.39,0,2.33-(i+.5)*.265,5.62,(i+1)*.16,.265,0x425149]);
    const material=new T.MeshPhongMaterial({vertexColors:true,side:T.DoubleSide,shininess:23,specular:0x292621});
    material.onBeforeCompile=shader=>{
      shader.fragmentShader=shader.fragmentShader.replace('#include <emissivemap_fragment>',
        '#include <emissivemap_fragment>\n totalEmissiveRadiance += vColor.rgb*(0.045+0.72*smoothstep(.94,.98,vColor.b));');
    };
    material.customProgramCacheKey=()=>'honam-coffee-lettering';
    placeSingleDetail(K,{name:'호남선 · 1게이트 스타벅스 입면',file:'../honam-gate-coffee/front.glb',
      at:[x,0,z],angle:rotation+Math.PI,range:31,exitRange:36,floorTolerance:3.7,eyeHeight:1.9,
      fallback:boxSilhouette(T,boxes),material,fallbackMaterial:material});
  });
}
