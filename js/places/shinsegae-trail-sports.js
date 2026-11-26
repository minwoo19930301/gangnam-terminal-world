import {mountRetailDisplay} from './shinsegae-retail-display.js';
import {relief} from '../banpo_relief.js';

const source = new URL('../../assets/models/ssg-trail-sports/gallery.glb',import.meta.url);
const batches = ['SalomonTrailEquipment','SalomonTrailFixtures','SalomonTrailDiffusers'];

export function registerSalomon(K,{poly,x,y,z,yaw}) {
  K.detail({floor:'8F',y0:y,y1:y+4.8,poly,name:'살로몬 트레일 러닝 진열'},()=>{
    const T=K.THREE, root=new T.Group(), fallback=new T.Group();
    root.position.set(x,y+relief(x,z),z);
    root.rotation.y=yaw;
    root.add(fallback);
    const cube=new T.BoxGeometry(), colors=new Map();
    function box(a,b,c,w,h,d,color){
      if(!colors.has(color))colors.set(color,new T.MeshStandardMaterial({color}));
      const m=new T.Mesh(cube,colors.get(color));
      m.scale.set(w,h,d); m.position.set(a,b+h/2,c); fallback.add(m);
    }
    box(0,0,-.50,5.84,2.72,.18,0xf7f1e5);
    for(const a of [-1.86,-.29]){
      box(a,.17,-.37,1.50,2.27,.09,0x928a82);
      for(let j=0;j<5;j++){
        const h=.35+.388*j;
        box(a,h,-.16,1.47,.03,.43,0xa6a8a5);
        for(let k=0;k<3;k++)box(a+(k-1)*.47,h+.03,-.12,.27,.095,.11,[0xcdcfbd,0x292b2c,0x898782][(k+j)%3]);
      }
    }
    box(1.65,0,.32,1.66,.78,.79,0xf7f1e5);
    box(-.798,.025,1.25,.69,.43,1.36,0xb27e49);
    mountRetailDisplay(K,{root,fallback,source,batches,x,y,z});
  });
}
