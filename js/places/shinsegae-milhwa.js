import {mountRetailDisplay} from './shinsegae-retail-display.js';
import {relief} from '../banpo_relief.js';

const source = new URL('../../assets/models/ssg-korean-table/gallery.glb', import.meta.url);
const batches = ['MilhwaWalnut','MilhwaGangnamGuksuJeongol','MilhwaTableMetal'];

export function registerMilhwa(K,{poly,x,y,z,yaw}) {
  K.detail({floor:'11F',y0:y,y1:y+4.8,poly,name:'밀화 국수전골 식탁'},()=>{
    const T=K.THREE, root=new T.Group(), fallback=new T.Group();
    root.position.set(x,y+relief(x,z),z);
    root.rotation.y=yaw;
    root.add(fallback);
    const cube=new T.BoxGeometry(), round=new T.CylinderGeometry(1,.8,1,24);
    const colors=new Map();
    function piece(shape,x,y,z,w,h,d,color) {
      if(!colors.has(color))colors.set(color,new T.MeshStandardMaterial({color}));
      const m=new T.Mesh(shape,colors.get(color));
      m.position.set(x,y+h/2,z);
      m.scale.set(w,h,d);
      fallback.add(m);
    }
    piece(cube,0,.72,0,1.08,.052,1.35,0x775139);
    for(const s of [-1,1]){
      for(const t of [-1,1])piece(cube,s*.467,0,t*.596,.057,.72,.057,0x573a29);
      piece(cube,s*.78,.41,0,.45,.062,.46,0x644a38);
      piece(cube,s*.99,.47,0,.05,.4,.43,0x644530);
      piece(round,s*.45,.772,.17,.043,.082,.043,0xeee6cd);
    }
    piece(round,0,.772,0,.22,.025,.22,0x77736b);
    piece(round,0,.797,0,.205,.12,.205,0xc1bcb2);
    piece(round,0,.916,0,.192,.003,.192,0xc59954);
    for(const [x,z] of [[-.322,-.312],[-.116,-.392],[.101,-.397],[.304,-.31]]){
      piece(round,x,.772,z,.092,.034,.092,0xefdfc3);
    }
    mountRetailDisplay(K,{root,fallback,source,batches,x,y,z});
  });
}
