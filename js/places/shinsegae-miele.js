import { mountRetailDisplay } from './shinsegae-retail-display.js';
import { relief } from '../banpo_relief.js';

const source = new URL('../../assets/models/ssg-smeg/showroom.glb',import.meta.url);
const batches = ['MieleCabinet','MieleSteel','MieleGlass'];

export function registerMiele(K,{poly,x,y,z,yaw}) {
  K.detail({floor:'9F',y0:y,y1:y+4.8,poly,name:'밀레 가전 쇼룸'},()=>{
    const T=K.THREE,root=new T.Group(),fallback=new T.Group();
    root.position.set(x,y+relief(x,z),z);
    root.rotation.y=yaw;
    root.add(fallback);
    const cube=new T.BoxGeometry(),materials=new Map();
    function box(x,y,z,w,h,d,color){
      if(!materials.has(color))materials.set(color,new T.MeshStandardMaterial({color}));
      const part=new T.Mesh(cube,materials.get(color));
      part.scale.set(w,h,d);
      part.position.set(x,y,z);
      fallback.add(part);
    }
    box(0,.46,.17,2.86,.85,.86,0x353638);
    box(0,.895,.17,2.94,.052,.94,0xf2f0ea);
    for(const side of [-.93,0,.97])box(side,.93,.16,.78,.02,.53,0x202529);
    box(0,1.33,-1.88,4.51,2.66,.65,0x353638);
    box(-1.48,1.12,-1.53,1.35,2.12,.06,0xb8bdc0);
    box(-.46,1.12,-1.49,.66,2.12,.11,0x36424c);
    box(0,2.38,-1.54,.88,.30,.04,0x922234);
    for(const side of [1.18,1.84]){
      for(const height of [.50,1.35]){
        box(side,height,-1.49,.64,.83,.32,0xf2f0ea);
        box(side,height,-1.31,.36,.36,.05,0x36424c);
      }
    }
    mountRetailDisplay(K,{root,fallback,source,batches,x,y,z});
  });
}
