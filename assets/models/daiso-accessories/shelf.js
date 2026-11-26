import {boxSilhouette} from '../interior-architecture/box-silhouette.js';
import {placeSingleDetail} from '../interior-architecture/single-detail.js';

const catalog={
  hair:'다이소 · 머리띠와 집게핀·헤어롤 진열',
  brushes:'다이소 · 손잡이 청소솔과 틈새 브러시 진열'
};
const proxies=new Map();
let material;
function silhouette(T,kind){
  const w=kind==='hair'?1.54:1.50;
  const parts=[[0,.02,.024,w,.281,.54,0xd3d8d2],[0,.27,.151,w,1.52,.028,0xe4e7e0],
    [0,.296,-.032,w+.02,.035,.49,0xe7e9e3],[0,1.79,.082,w,.236,.076,0xe6e7df],
    [0,.221,-.25,.29,.030,.011,0x484d49]];
  if(kind==='hair'){
    parts.push([0,1.43,-.083,1.43,.065,.09,0xa7aca8]);
    for(let i=0;i<12;i++)parts.push([-.63+i*.115,1.36,-.083,.053,.21,.188,[0x534d46,0xc8b491,0xc2a3a6,0x444851][i%4]]);
    for(let row=0;row<3;row++)for(let i=0;i<5;i++){
      const x=(i-2)*.286,y=[.39,.78,1.067][row];
      parts.push([x,y,-.081,.18,.19,.022,0xe9e6db],
        [x,y+.015,-.122,.132,.089,.062,[0xc7a4af,0xb5a9bf,0x847767,0x555453,0xcab99a][(i+row)%5]]);
    }
  }else{
    for(let row=0;row<2;row++)for(let i=0;i<4;i++){
      const x=(i-1.5)*.334,y=1.04+row*.422;
      parts.push([x,y+.035,-.041,.249,.201,.019,0xeeeae2]);
      const tone=[0xebece3,0xb3b9b9,0xced4cc,0xa5b4c2][(i+row)%4];
      if(row===1||i<2)parts.push([x,y-.055,-.142,.24,.056,.069,0xaab3b0],[x,y+.014,-.131,.23,.027,.046,tone],
        [x-.083,y+.042,-.135,.034,.066,.037,tone],[x+.083,y+.042,-.135,.034,.066,.037,tone],
        [x,y+.104,-.135,.18,.029,.037,tone]);
      else for(let j=0;j<3;j++)parts.push([x+(j-1)*.063,y-.075,-.131,.025,.252,.038,[0x555962,0x809bb0,0x9fa9a6][j]]);
    }
    for(let i=0;i<8;i++)parts.push([-.58+i*.165,.41,-.13,.033,.267,.043,i<4?0x626b70:0xab9b77]);
  }
  return boxSilhouette(T,parts);
}
export function accessoryShelf(K,kind,at,angle){
  const T=K.THREE;
  if(!proxies.has(kind))proxies.set(kind,silhouette(T,kind));
  material??=new T.MeshLambertMaterial({vertexColors:true,side:T.DoubleSide});
  const [x,,z]=at,dx=Math.sin(angle),dz=Math.cos(angle);
  return placeSingleDetail(K,{name:catalog[kind],file:'../daiso-accessories/'+kind+'.glb',at,angle,
    fallback:proxies.get(kind),fallbackMaterial:material,material,range:6.6,exitRange:8.5,eyeHeight:1.18,
    floorTolerance:2.25,closeVisibleFrom:p=>(p.x-x)*dx+(p.z-z)*dz<.122});
}
