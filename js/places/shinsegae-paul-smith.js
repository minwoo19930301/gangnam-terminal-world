import {mountRetailDisplay} from './shinsegae-retail-display.js';
import {relief} from '../banpo_relief.js';

const source=new URL('../../assets/models/ssg-archive-tailoring/gallery.glb',import.meta.url);
const batches=['PaulSmithGangnamScreens','PaulSmithGangnamTailoring'];

export function registerPaulSmith(K,{poly,x,y,z,yaw}){
  // The folding screen, rack, table and bench leave an open route between them.
  for(const [side,front,w,d,h] of [[-1.35,.30,3.10,.64,2.43],[1.70,.27,2.40,.78,2.28],
      [-2.32,.94,.73,.47,.89],[-.53,1.85,1.69,.74,.55],[1.55,2.11,1.71,.79,1.15],
      [-3.05,.80,.14,2.12,2.95],[3.05,.80,.14,2.12,2.95]]){
    K.box({x:x+side*Math.cos(yaw)+front*Math.sin(yaw),y,z:z-side*Math.sin(yaw)+front*Math.cos(yaw),
      w,d,h,rotY:yaw,mat:0x353137,skip:['top','bottom','n','s','e','w']});
  }
  K.detail({floor:'6F',y0:y,y1:y+4.8,poly,name:'폴스미스 남성복'},()=>{
    const T=K.THREE,root=new T.Group(),fallback=new T.Group(),cube=new T.BoxGeometry();
    root.position.set(x,y+relief(x,z),z);
    root.rotation.y=yaw;
    root.add(fallback);
    function block(px,py,pz,w,h,d,color,angle=0){
      const mesh=new T.Mesh(cube,new T.MeshStandardMaterial({color}));
      mesh.position.set(px,py,pz);
      mesh.scale.set(w,h,d);
      mesh.rotation.y=angle;
      fallback.add(mesh);
    }
    block(0,2.82,-.04,6.15,.36,.50,0x172858);
    block(-3.05,1.48,.80,.14,2.94,2.12,0x07594e);
    block(3.05,1.48,.80,.14,2.94,2.12,0x8e1735);
    for(const [px,width,col,angle] of [[-2.32,.98,0xe3bb45,.28],[-1.30,1.15,0xf3e7c6,-.28],[-.24,1.05,0xebe2cc,.28]]){
      block(px,1.24,.24,width,2.35,.08,col,angle);
    }
    block(1.68,1.33,-.17,2.55,2.64,.10,0x07594e);
    block(1.69,2.22,.18,2.29,.065,.56,0x6e493b);
    for(let i=0;i<7;i++)block(.78+.294*i,1.59,.42,.37,.78,.19,[0x586575,0xb7a898,0x34415d][i%3],.80);
    block(-.28,1.63,.66,.50,.78,.18,0x26304b);
    block(-.53,.28,1.85,1.66,.53,.72,0xe8dfc7);
    block(-2.32,.58,.94,.71,.06,.46,0xd26139);
    block(-2.32,.29,.94,.07,.56,.07,0xd26139);
    block(1.55,.845,2.11,1.71,.09,.79,0x272730);
    for(const px of [.77,2.33])for(const pz of [1.795,2.425])block(px,.41,pz,.068,.80,.068,0x172858);
    mountRetailDisplay(K,{root,fallback,source,batches,x,y,z});
  });
}
