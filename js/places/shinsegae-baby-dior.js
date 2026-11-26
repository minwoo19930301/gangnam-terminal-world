import { mountRetailDisplay } from './shinsegae-retail-display.js';
import { relief } from '../banpo_relief.js';

const source = new URL('../../assets/models/ssg-child-knit/gallery.glb', import.meta.url);
const batches = ['BabyDiorSalon','BabyDiorBrass','BabyDiorCardigans','BabyDiorToile','BabyDiorNicheLight'];

export function registerBabyDior(K,{poly,x,y,z,yaw}) {
  K.detail({floor:'10F',y0:y,y1:y+4.8,poly,name:'베이비 디올 아동복 진열'}, () => {
    const T=K.THREE, root=new T.Group(), fallback=new T.Group();
    root.position.set(x,y+relief(x,z),z);
    root.rotation.y=yaw;
    root.add(fallback);
    const block=new T.BoxGeometry(), oval=new T.SphereGeometry(.5,10,8);
    const disk=new T.CylinderGeometry(.5,.5,1,18);
    function add(geometry,cx,cy,cz,w,h,d,color) {
      const part=new T.Mesh(geometry,new T.MeshStandardMaterial({color}));
      part.scale.set(w,h,d);part.position.set(cx,cy,cz);fallback.add(part);
    }
    for(const cx of [-.87,.86]) {
      add(block,cx,1.26,-1.42,1.68,2.5,.12,0xe8d7bd);
      add(block,cx,.23,-1.10,1.60,.44,.65,0xf9eed9);
      add(block,cx,1.78,-1.10,1.46,.045,.48,0xfff8e6);
      for(let i=0;i<5;i++) add(oval,cx+(i-2)*.257,1.39,-.91,.18,.34,.20,
        [0xce8683,0xf0dfce,0xa85759,0xe6a69f,0xf2dddd][i]);
    }
    for(const [cx,cz,color] of [[-.94,.51,0xf6e8d9],[-.39,.77,0xea877b]]) {
      add(disk,cx,.45,cz,.42,.26,.24,0xf1ddcc);
      add(oval,cx,.85,cz,.46,.4,.22,color);
      add(oval,cx,1.19,cz,.22,.25,.21,0xeee8dd);
    }
    add(disk,.91,.704,.43,1.04,.048,1.04,0xfff7e5);
    add(oval,1.06,.99,.37,.21,.41,.21,0xf3dfdf);
    mountRetailDisplay(K,{root,fallback,source,batches,x,y,z});
  });
}
