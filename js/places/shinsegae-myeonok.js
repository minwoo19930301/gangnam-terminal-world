import {mountRetailDisplay} from './shinsegae-retail-display.js';
import {relief} from '../banpo_relief.js';

const source = new URL('../../assets/models/ssg-table-service/gallery.glb',import.meta.url);
const batches = ['MyeonokTable','MyeonokSteel'];

export function registerMyeonok(K,{poly,x,y,z,yaw}) {
  K.detail({floor:'11F',y0:y,y1:y+4.8,poly,name:'평양면옥 냉면 상차림'},()=>{
    const T=K.THREE,root=new T.Group(),fallback=new T.Group();
    root.position.set(x,y+relief(x,z),z);
    root.rotation.y=yaw;
    root.add(fallback);
    const cube=new T.BoxGeometry(),bowl=new T.CylinderGeometry(1,.48,1,20);
    const finishes=new Map();
    function piece(shape,px,py,pz,w,h,d,color){
      if(!finishes.has(color))finishes.set(color,new T.MeshStandardMaterial({color}));
      const part=new T.Mesh(shape,finishes.get(color));
      part.position.set(px,py+h/2,pz);
      part.scale.set(w,h,d);
      fallback.add(part);
    }
    const oak=0xbf905c;
    piece(cube,0,.736,0,.93,.04,1.24,oak);
    for(const side of [-1,1]){
      for(const end of [-1,1])piece(cube,side*.394,0,end*.55,.058,.736,.058,oak);
      piece(cube,side*.67,.41,0,.42,.04,.43,oak);
      piece(cube,side*.87,.45,0,.04,.38,.41,oak);
    }
    piece(bowl,-.066,.776,.323,.154,.103,.154,0xbfc4c5);
    piece(bowl,-.066,.877,.323,.142,.003,.142,0xb99d7c);
    piece(bowl,-.074,.880,.32,.031,.021,.042,0xf4ecd7);
    piece(cube,-.045,.794,.056,.235,.027,.108,0xfaf3e4);
    piece(cube,0,.776,-.372,.364,.009,.261,0xf3e6cf);
    mountRetailDisplay(K,{root,fallback,source,batches,x,y,z});
  });
}
