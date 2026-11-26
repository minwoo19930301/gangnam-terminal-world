import {mountRetailDisplay} from './shinsegae-retail-display.js';
import {relief} from '../banpo_relief.js';

const source=new URL('../../assets/models/ssg-classic-clog/gallery.glb',import.meta.url);
export function registerCrocs(K,{poly,x,y,z,yaw}){
  K.detail({floor:'8F',y0:y,y1:y+4.8,poly,name:'크록스 · 클래식 클로그와 지비츠'},()=>{
    const T=K.THREE,root=new T.Group(),fallback=new T.Group(),cube=new T.BoxGeometry();
    root.position.set(x,y+relief(x,z),z);root.rotation.y=yaw;root.add(fallback);
    const colors=new Map();
    function box(a,h,d,w,height,depth,color){
      if(!colors.has(color))colors.set(color,new T.MeshStandardMaterial({color}));
      const m=new T.Mesh(cube,colors.get(color));m.scale.set(w,height,depth);
      m.position.set(a,h+height/2,d);fallback.add(m);
    }
    box(0,0,-.57,3.90,2.52,.12,0xe8e6da);
    for(let j=0;j<3;j++){
      const h=.56+j*.49;box(-.48,h,-.39,2.56,.044,.47,0xf2eee0);
      for(let i=0;i<5;i++)box(-1.5+i*.51,h+.044,-.365,.16,.08,.25,[0xa7be89,0xb59acf,0xf5a378,0x8bcad2,0xeecb58][(i+j)%5]);
    }
    box(1.20,0,-.09,1.13,.80,.75,0x82b947);
    box(1.20,.8,-.09,1.19,.055,.8,0xf2eee0);
    for(let i=0;i<2;i++)box(-.81+i*.55,0,.28,.48,.34+.16*i,.53,0xd9ccb1);
    mountRetailDisplay(K,{root,fallback,source,batches:['CrocsClassicClogs'],x,y,z,nearDistance:8,displayDistance:17});
  });
}
