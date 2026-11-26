import {displayCase} from '../gyeongbu/display-case.js';
import {boxSilhouette} from '../interior-architecture/box-silhouette.js';
import {counterOutline} from './layout.js';

const shop=displayCase({
  url:new URL('./chocolatier.glb',import.meta.url),
  name:'피에르 마르콜리니 · 구리 쇼케이스와 봉봉',bodyName:'GangnamChocolatier',lightName:'Lit',
  baseColor:0xffffff,enter:17,leave:22,visibleBounds:[[-3.80,.02,-5.79],[3.80,3.85,-.05]],
  proxy:T=>boxSilhouette(T,[
    [0,.04,-5.67,7.55,3.72,.075,0xeba88b],[3.72,.04,-2.94,.07,3.72,5.55,0xcb7d60],
    [.25,.04,-1.10,5.22,.93,.90,0xd98363],[-2.38,.04,-2.79,.98,.93,3.37,0xd98363],
    [.04,.04,-4.54,2.90,3.40,1.72,0xa65e47],[0,3.75,-2.99,7.54,.10,5.66,0xd98363],
  ])
});

export function marcoliniShop(K,x,y,z,angle){
  const cs=Math.cos(angle),sn=Math.sin(angle);
  const point=(along,depth)=>[x+along*cs-depth*sn,z-along*sn-depth*cs];
  K.phys.addPolyWalls(counterOutline.map(([across,depth])=>point(across,depth)),y,y+1.38,.014,'centralcity');
  K.phys.addPolyWalls([[-1.44,3.62],[1.52,3.62],[1.52,5.47],[-1.44,5.47]].map(q=>point(...q)),
    y,y+3.47,.014,'centralcity');
  return ()=>{
    shop(K,x,z,angle,y);
    const [sx,sz]=point(.70,2.57);
    K.person(sx,y,sz,{rotY:angle,shirt:0x39332f});
  };
}
