import {boxSilhouette} from '../interior-architecture/box-silhouette.js';
import {placeSingleDetail} from '../interior-architecture/single-detail.js';
import {loadArchitecture} from '../interior-architecture/model.js';
import {loadBakedSurface} from '../interior-architecture/baked-surface.js';
import {footprint} from '../gotomall-yogurtworld/layout.js';
import {parts} from './layout.js';
import {placeMirror} from './mirror.js';

const white=0xece9df,steel=0xa6aca9,blue=0x71b3c9,tile=0xa9a69e;
const proxies={
 banShell:[[0,.02,2.07,4.13,.025,4.14,tile],[-2.027,.04,2.08,.071,2.71,4.17,white],[2.027,.04,2.08,.071,2.71,4.17,white],[0,.04,4.115,4.12,2.71,.058,white],[0,2.747,2.065,4.13,.065,4.15,white],[-1.32,.15,3.82,1.25,1.90,.47,0xb79970],[1.3,.15,3.82,1.25,1.90,.47,0xb79970]],
 banSign:[[0,2.20,.026,3.92,.512,.046,white],[0,2.28,-.018,1.47,.28,.06,0xff7854],[1.5,2.34,-.018,.59,.18,.015,0x4fa5ae],[-1.5,2.33,-.018,.62,.21,.015,0x324965]],
 coats:[[0,.08,.026,.82,.034,.60,steel],[-.39,.09,.026,.030,1.68,.030,steel],[.39,.09,.026,.030,1.68,.030,steel],[0,1.77,.026,.80,.025,.027,steel],[-.14,.86,.14,.39,.14,.74,0x899380],[.04,.76,.04,.40,.15,.89,0xe5d9b8],[.17,.71,-.035,.40,.14,.91,white]],
 shades:[[0,.047,.10,.73,.39,.51,0x34383e],[0,.43,.10,.53,.61,.34,0xafa3bf],[-.08,1.47,.43,.79,.10,.78,white],[.25,1.35,-.06,.69,.10,.68,blue]],
 bins:[[-.19,.05,-.43,.56,.24,.48,0xb79970],[.20,.07,.17,.56,.25,.47,0xcfb389],[-.19,.04,.63,.61,.25,.49,0xb79970],[-.15,.39,-.02,.55,.21,.42,0xcfb389],[.27,.30,-.17,.43,.18,.30,0xbb9569],[-.07,.04,-1.65,.57,.22,.35,0xb79970],[.14,.04,-1.29,.57,.22,.35,0xb79970]],
 trays:[[0,.13,.15,.93,.03,.61,0x34383e],[0,.58,.15,.93,.03,.61,0x34383e],[0,.96,.15,.93,.03,.61,0x34383e],[-.195,1,.03,.39,.10,.30,white],[.20,1.02,.30,.345,.42,.06,white],[.22,.99,0,.22,.17,.22,0x9bdbde]],
 photoRoom:[[0,.02,1.49,3.99,.027,2.98,white],[-1.967,.04,1.49,.060,2.72,2.97,white],[1.967,.04,1.49,.060,2.72,2.97,white],[0,.04,2.951,3.98,2.72,.058,white],[0,2.74,1.50,4,.072,3,white],[.97,.04,.04,1.935,2.19,.09,tile],[0,2.18,.026,3.86,.533,.068,white],[1.31,.04,1.04,1.27,2.56,.056,white],[1.02,.08,1.02,.22,2.09,.07,0x858484],[-1.77,.06,1.20,.36,2.15,1.37,white],[-1.80,.18,-.253,.385,1.56,.032,blue]],
 photoSign:[[.96,2.18,-.020,1.91,.535,.055,blue],[.98,.22,-.043,1.16,1.78,.09,0xe5acb7],[.98,.73,-.093,.86,.47,.012,0xa2dfef]],
 mirror:[[-.31,.097,-.045,.065,1.89,.076,blue],[.31,.097,-.045,.065,1.89,.076,blue],[0,1.916,-.045,.63,.07,.075,0xa2dfef],[0,.097,-.045,.64,.07,.076,blue]],
 booth:[[0,.045,.018,.76,1.98,.416,white],[0,1.0,-.204,.65,.49,.019,0x34383e],[0,1.045,-.218,.60,.42,.009,0xe4e8d8],[0,1.60,-.203,.109,.11,.012,0x324965],[0,.86,-.218,.72,.045,.14,white]],
 samples:[[1.263,.69,1.006,1.12,1.30,.004,0x9fb5b6],[.07,2.27,-.026,.46,.27,.004,white]],
};
const cached=new Map();
let paint,glow;
export function placeWestCorner(K,P,rotation,floor){
  const T=K.THREE,angle=rotation-Math.PI/2;
  const W=(x,d)=>P(footprint.front-d,footprint.mid+x),at=(x,d,h)=>{const[a,b]=W(x,d);return[a,floor+h,b];};
  const poly=(a,b,c,d)=>[W(a,b),W(c,b),W(c,d),W(a,d)];
  const [ox,oz]=W(0,0),co=Math.cos(angle),si=Math.sin(angle);
  const local=(x,z)=>[(x-ox)*co-(z-oz)*si,(x-ox)*si+(z-oz)*co];
  const wall=(a,b,c,d,top=2.76)=>K.phys.addWall(...W(a,b),...W(c,d),floor,floor+top,.023,'gotomall');
  const solid=(a,b,c,d,h)=>K.phys.addPolyWalls(poly(a,b,c,d),floor,floor+h,.016,'gotomall');
  const shops=[
    {lo:-6.28,hi:-2.20,back:4.13,entry:[-6.20,-2.26],name:'반에반 고투몰점',sub:'서편 G-011 · 수입 생활용품과 의류'},
    {lo:4.98,hi:8.92,back:2.98,entry:[5.06,6.93],name:'셀프사진',sub:'서편 G-013 · 사진에 기록된 HAMA FILM'},
  ];
  for(const shop of shops){
    wall(shop.lo,0,shop.lo,shop.back);wall(shop.hi,0,shop.hi,shop.back);wall(shop.lo,shop.back,shop.hi,shop.back);
    K.zone({name:shop.name,sub:shop.sub,floor:'B1',poly:poly(shop.lo,-.01,shop.hi,shop.back),y0:floor,y1:floor+2.78,priority:12});
  }
  wall(6.96,.043,8.88,.043,2.21);wall(7.625,1.064,8.885,1.064,2.57);
  solid(5.005,.56,5.375,1.91,2.27);solid(7.72,1.90,8.48,2.307,2.04);
  solid(4.94,-.47,5.37,-.065,1.75);
  solid(5.34,-.16,5.61,.10,.48);
  for(const box of [[-3.30,-.24,-2.52,.22,1.79],[-5.91,.65,-5.22,1.20,1.8],[-3.80,1.27,-2.86,2.81,.74],[-3.77,.08,-2.88,1.30,.31],[-5.94,-.10,-5.02,.46,1.46],[-6.20,3.55,-4.91,4.04,2.23],[-3.57,3.55,-2.33,4.04,2.23]])solid(...box);
  const features=[
    ['banShell',[-6.31,-.06,-2.18,4.16],11,14,1.29,[[-4.17,.01],[-2.7,1.93],[-5.6,1.93]]],
    ['banSign',[-6.20,-.13,-2.24,.10],20,23,2.420,[[-4.23,-.04]],true],
    ['coats',[-3.37,-.40,-2.42,.24],6.1,7.7,1.08,[[-2.91,-.09]]],
    ['shades',[-6.10,.32,-4.91,1.68],6.6,8,1.24,[[-5.57,.81]]],
    ['bins',[-3.85,.04,-2.72,2.84],5.0,6.9,.38,[[-3.31,1.92]]],
    ['trays',[-5.98,-.20,-5.01,.49],5.75,7.0,.84,[[-5.48,.02]]],
    ['photoRoom',[4.94,-.51,8.97,3.02],11.6,14,1.32,[[6.22,.03],[6.5,2.19],[7.93,.03]]],
    ['photoSign',[7.22,-.13,8.90,.02],17,20,1.78,[[7.92,-.09]],true],
    ['mirror',[6.48,2.84,7.25,3.03],7.7,9,1.04,[[6.87,2.89]]],
    ['mirrorGlass',[6.58,2.884,7.15,2.90],7.7,9,1.04,[[6.87,2.89]]],
    ['booth',[7.68,1.81,8.52,2.32],5.8,7.0,1.24,[[8.10,1.88]]],
    ['samples',[6.77,-.04,8.90,1.035],4.6,5.8,1.4,[[7.96,1.025],[6.91,-.023]]],
  ];
  paint??=new T.MeshLambertMaterial({vertexColors:true,side:T.DoubleSide});
  glow??=new T.MeshBasicMaterial({vertexColors:true,side:T.DoubleSide});
  for(const [key,bounds,range,exitRange,eyeHeight,targets,facade] of features){
    const [name,x,d,h]=parts[key],shop=shops[x>0?1:0];
    function sight(px,pz){
      const [sx,sd]=local(px,pz);
      if(sd>=-.01&&sd<=shop.back&&sx>=shop.lo&&sx<=shop.hi){
        if(facade)return sd<.28;
        if(key==='booth'&&sd<1.04){
          const atPartition=sx+(targets[0][0]-sx)*(1.04-sd)/(targets[0][1]-sd);
          if(atPartition>7.625)return false;
        }
        return true;
      }
      if(sd>-.01)return false;
      if(facade)return true;
      return targets.some(([tx,td])=>{
        const cross=sd>=td?tx:sx+(tx-sx)*(-sd)/(td-sd);
        const lo=key==='photoRoom'?shop.lo:shop.entry[0],hi=key==='photoRoom'?shop.hi:shop.entry[1];
        if(cross<lo||cross>hi)return false;
        if(key==='booth'){
          const atPartition=sx+(tx-sx)*(1.04-sd)/(td-sd);
          if(atPartition>7.625)return false;
        }
        return true;
      });
    }
    const seen=p=>sight(p.x,p.z),room=key==='banShell'||key==='photoRoom';
    K.detail({name,floor:'B1',poly:poly(...bounds),y0:floor,y1:floor+2.85,
      visibleFrom:(px,py,pz)=>py>floor-.58&&py<floor+3.38&&(room||sight(px,pz))},()=>{
      if(room){
        const z=key==='banShell'?2.747:2.74,back=key==='banShell'?4.139:3.00;
        K.occludingSlab({poly:poly(shop.lo,key==='banShell'?.01:.021,shop.hi,back),y:floor+z,eyeMin:floor+.05,eyeMax:floor+z-.05});
      }
      if(key==='mirrorGlass'){placeMirror(K,name,at(x,d,h),angle,seen);return;}
      if(!cached.has(key))cached.set(key,boxSilhouette(T,proxies[key]));
      const lit=key==='banSign'||key==='photoSign'||key==='mirror',mat=lit?glow:paint;
      const labels=key==='samples';
      placeSingleDetail(K,{name,file:'../gotomall-west-corner/'+key+'.glb',at:at(x,d,h),angle,
        fallback:cached.get(key),fallbackMaterial:mat,material:room||labels?null:mat,
        loadSurface:room?file=>loadBakedSurface(T,file):labels?async file=>{
          const [mesh]=await loadArchitecture(file);mesh.material=new T.MeshLambertMaterial({map:mesh.material.map,side:T.DoubleSide});return[mesh];
        }:undefined,range,exitRange,floorTolerance:3.10,eyeHeight,closeVisibleFrom:seen});
    });
  }
}
