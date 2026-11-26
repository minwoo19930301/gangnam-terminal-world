import {mountRetailDisplay} from './shinsegae-retail-display.js';
import {relief} from '../banpo_relief.js';

const source=new URL('../../assets/models/ssg-second-workwear/gallery.glb',import.meta.url);
const batches=['OurselvesGangnamWalnut','OurselvesGangnamMilParka','OurselvesGangnamHardware'];

export function registerOurselves(K,{poly,x,y,z,yaw}) {
  K.detail({floor:'7F',y0:y,y1:y+4.8,poly,name:'아워셀브스 파카와 목재 전시틀'},()=>{
    const T=K.THREE,root=new T.Group(),fallback=new T.Group();
    root.position.set(x,y+relief(x,z),z);
    root.rotation.y=yaw;
    root.add(fallback);
    const box=new T.BoxGeometry(),oval=new T.SphereGeometry(.5,12,8);
    const materials=new Map();
    function piece(shape,x,y,z,w,h,d,color) {
      if(!materials.has(color)) materials.set(color,new T.MeshStandardMaterial({color}));
      const obj=new T.Mesh(shape,materials.get(color));
      obj.position.set(x,y,z);obj.scale.set(w,h,d);fallback.add(obj);
    }
    piece(box,-.76,1.28,-.70,2.30,2.54,.09,0xd7d0be);
    for(const cx of [-1.22,-.30]){
      piece(box,cx,.98,-.265,.78,1.79,.042,0x795640);
      for(const side of [-1,1]) piece(box,cx+side*.442,.994,.02,.044,1.988,.048,0x75523e);
      piece(box,cx,1.96,-.24,.91,.058,.55,0x805c43);
      const shell=cx<-.5?0x343437:0x74745a;
      piece(oval,cx,1.19,-.045,.55,.92,.30,shell);
      for(const side of [-1,1])piece(oval,cx+side*.29,1.24,-.045,.17,.72,.20,shell);
      piece(oval,cx,1.72,-.045,.34,.27,.22,cx<-.5?shell:0xa5997c);
    }
    for(const h of [.21,.81])piece(box,1.04,h,.33,1.29,.04,.57,0x936b50);
    for(const dx of [-.6,.6])for(const dz of [-.25,.25])
      piece(box,1.04+dx,.41,.33+dz,.046,.82,.046,0x754e38);
    for(const dx of [-.60,.60])piece(box,1.06+dx,.84,-.88,.05,1.65,.062,0x8c6249);
    piece(box,1.06,1.65,-.88,1.24,.03,.03,0xa69a84);
    for(const dx of [-.30,.075,.32])piece(oval,1.06+dx,1.20,-.88,.41,.71,.25,0x383a3d);
    mountRetailDisplay(K,{root,fallback,source,batches,x,y,z});
  });
}
