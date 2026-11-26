import {mountRetailDisplay} from './shinsegae-retail-display.js';
import {relief} from '../banpo_relief.js';

const source=new URL('../../assets/models/ssg-kids-bedding/atelier.glb',import.meta.url);
const batches=['ChouxJoinery','ChouxTextiles'];

export function registerAtelierChoux(K,{poly,x,y,z,yaw}){
  K.detail({floor:'10F',y0:y,y1:y+4.8,poly,name:'아뜰리에 슈 침구 진열'},()=>{
    const T=K.THREE,root=new T.Group(),fallback=new T.Group();
    root.position.set(x,y+relief(x,z),z);
    root.rotation.y=yaw;
    root.add(fallback);
    const cube=new T.BoxGeometry(),colors=new Map();
    function box(x,height,back,w,h,d,color){
      if(!colors.has(color))colors.set(color,new T.MeshStandardMaterial({color}));
      const part=new T.Mesh(cube,colors.get(color));
      part.position.set(x,height,-back);
      part.scale.set(w,h,d);
      fallback.add(part);
    }
    box(0,1.38,2.63,3.14,2.76,.15,0xf3e8d6);
    box(0,1.12,2.54,2.88,1.94,.025,0xe0b8ac);
    for(const h of [.19,.82,1.44])box(0,h,2.19,2.70,.04,.47,0xfff7eb);
    box(.47,.49,.54,1.55,.87,.70,0xfaf5e9);
    box(.96,1.17,.66,.36,.41,.21,0xdab8a4);
    box(-.44,.40,-1.20,1.46,.26,.78,0xc1d4d9);
    for(const back of [-1.61,-.79]){
      box(-.44,.91,back,1.49,.065,.047,0xfbf5e8);
      for(let i=0;i<8;i++)box(-1.15+i*.201,.56,back,.042,.74,.036,0xfbf5e8);
    }
    box(-.68,.78,-1.64,.48,.37,.04,0xedc5b9);
    mountRetailDisplay(K,{root,fallback,source,batches,x,y,z});
  });
}
