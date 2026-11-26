import {boxSilhouette} from '../interior-architecture/box-silhouette.js';
import {placeSingleDetail} from '../interior-architecture/single-detail.js';
import {relief} from '../../../js/banpo_relief.js';

export const wineParts = {
  gallery:{title:'조명 선반과 와인병',collection:'WineSalesGallery',size:[1.76,.5],
    shapes:[[0,.035,.03,1.70,.37,.40,0x9c7155],[0,.42,.18,1.68,2.01,.08,0xb79270]],solid:[-.88,-.21,.88,.23,2.48]},
  wall:{title:'오크 벽등과 입체 레터링',collection:'WineInscription',size:[3.43,.32],
    shapes:[[0,.015,.08,3.42,2.68,.055,0x80543b],[-1.04,.965,-.04,.063,.81,.062,0xffebc5],[1.04,.965,-.04,.063,.81,.062,0xffebc5]]},
  island:{title:'황동 캐노피와 경사 진열대',collection:'WineDisplayIsland',size:[2.68,.56],
    shapes:[[0,.11,0,2.63,.83,.53,0x9e704f],[0,2.655,.037,2.68,.05,.56,0xd0b079]],solid:[-1.32,-.27,1.32,.28,.95]},
  desk:{title:'석재 판매대와 구형 등',collection:'WineMarbleDesk',size:[2,.42],
    shapes:[[0,.17,0,1.98,.87,.40,0xd8d1c5]],solid:[-.99,-.21,.99,.21,1.05]},
  ceiling:{title:'천장 금속 패널과 매입등',collection:'WineCeilingStrip',size:[2,.58],
    shapes:[[0,-.024,0,2,.043,.58,0xd7c3a4]]},
};

export function houseWineDisplays(K,point,rotation,y,poly,door){
  const T=K.THREE,paint=new T.MeshBasicMaterial({vertexColors:true,side:T.DoubleSide});
  // The old wall tops at +3.22 m left the next room visible beneath its high deck.
  K.hpoly({color:0xe8d7c0,gloss:.21},poly,y+3.185,false);
  const perimeter=poly.map(([ax,az],i)=>{
    const [bx,bz]=poly[(i+1)%poly.length];
    return {ax,az,dx:bx-ax,dz:bz-az};
  });
  function canSeeTarget(x,z,tx,tz){
    const dx=tx-x,dz=tz-z;
    for(const edge of perimeter){
      const cross=dx*edge.dz-dz*edge.dx;
      if(Math.abs(cross)<.00001)continue;
      const ax=edge.ax-x,az=edge.az-z;
      const hit=(ax*edge.dz-az*edge.dx)/cross;
      const along=(ax*dz-az*dx)/cross;
      if(hit<=.003 || hit>=.997 || along<0 || along>1)continue;
      // The public door cut into this outline is also the opening used by collision.
      if(Math.hypot(x+hit*dx-door.x,z+hit*dz-door.z)>door.w/2+.04)return false;
    }
    return true;
  }
  function place(key,s,t,turn,up=0,offsets){
    const {title,shapes,size:[w,d],solid}=wineParts[key];
    const [x,z]=point(s,t),angle=rotation+turn,cs=Math.cos(angle),sn=Math.sin(angle);
    const corners=(x0,d0,x1,d1)=>[[x0,d0],[x1,d0],[x1,d1],[x0,d1]].map(([u,v])=>[x+cs*u+sn*v,z-sn*u+cs*v]);
    const first=offsets?.[0]??0,last=offsets?.at(-1)??0;
    if(solid)K.phys.addPolyWalls(corners(first+solid[0],solid[1],last+solid[2],solid[3]),y,y+solid[4],.012,'centralcity');
    const name='와인셀라 · '+title;
    const left=first-w/2,right=last+w/2;
    const extent=corners(left,-d/2,right,d/2);
    const probes=[[x,z],...extent];
    let lastX,lastZ,seen;
    function visible(px,_height,pz){
      if(px!==lastX || pz!==lastZ){
        seen=probes.some(([tx,tz])=>canSeeTarget(px,pz,tx,tz));
        lastX=px;lastZ=pz;
      }
      return seen;
    }
    K.detail({name,floor:'1F',poly:extent,y0:y,y1:y+3.22,visibleFrom:visible},()=>{
      const coarse=boxSilhouette(T,shapes);
      placeSingleDetail(K,{name,file:'../house-wine-cellar/'+key+'.glb',at:[x,y+up,z],angle,
        fallback:coarse,fallbackMaterial:paint,material:paint,range:15,exitRange:19,
        floorTolerance:1.95,eyeHeight:1.45-up,rigidGround:relief(x,z),
        closeVisibleFrom:eye=>visible(eye.x,eye.y,eye.z),translations:offsets?.map(offset=>[offset,0,0])});
    });
  }
  place('gallery',7.44,-9.00,-Math.PI/2,0,[-3.52,-1.76,0,1.76,3.52]);
  place('wall',12.60,0,0);
  for(const t of [-3.13,3.13])place('island',12.49,t,0);
  place('desk',7.8,-7.16,Math.PI/2);
  place('ceiling',7.53,-8.63,-Math.PI/2,3.168,[-4,-2,0,2,4]);
  place('ceiling',12.23,-.51,0,3.168,[-6,-4,-2,0,2,4,6]);
}
