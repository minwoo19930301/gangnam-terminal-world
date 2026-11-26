import { mountRetailDisplay } from './shinsegae-retail-display.js';
import { relief } from '../banpo_relief.js';

const source = new URL('../../assets/models/ssg-outdoors/gallery.glb',import.meta.url);
const batches = ['ArcOutdoorEquipment','ArcOutdoorFixtures'];

export function registerArcteryx(K,{poly,x,y,z,yaw}) {
  K.detail({floor:'8F',y0:y,y1:y+4.8,poly,name:'아크테릭스 배낭 · 등산화 피팅'}, () => {
    const T=K.THREE, root=new T.Group(), fallback=new T.Group();
    root.position.set(x,y+relief(x,z),z);
    root.rotation.y=yaw;
    root.add(fallback);
    const box=new T.BoxGeometry(), pack=new T.SphereGeometry(.5,8,6);
    const stone=new T.CylinderGeometry(.5,.34,1,8);
    const materials=new Map();
    function add(geometry,cx,back,bottom,w,d,h,color) {
      if (!materials.has(color)) materials.set(color,new T.MeshStandardMaterial({color}));
      const part=new T.Mesh(geometry,materials.get(color));
      part.position.set(cx,bottom+h/2,-back);
      part.scale.set(w,h,d);
      fallback.add(part);
    }
    add(box,0,2.51,.02,4.74,.105,2.72,0x555554);
    add(box,1.69,2.27,.20,1.22,.11,2.45,0xc3d7f1);
    for (const h of [.72,1.52]) {
      add(box,-.56,2.24,h,3.18,.40,.045,0xb8a282);
      for (const [i,color] of [0x3e4642,0x85856c,0xb65330].entries())
        add(pack,-1.7+.92*i,2.22,h+.045,.34,.24,.56,color);
    }
    for (let i=0;i<5;i++) for (const cx of [1.4,1.94])
      add(pack,cx,2.12,.45+i*.41,.30,.11,.12,0x424449);
    add(box,-2.08,.40,2.14,.036,2.70,.036,0x202527);
    for (const [i,color] of [0xbecf48,0x202527,0xa52d2e,0x536b78,0x85856c].entries())
      add(pack,-2.08,-.62+i*.48,1.33,.42,.20,.78,color);
    add(stone,-.89,-.67,.025,1.47,1.71,.82,0xa09891);
    add(pack,-1.04,-.36,.845,.34,.24,.56,0xb65330);
    add(box,1.466,-.61,.414,1.22,.52,.047,0xb8a282);
    for (const cx of [1.02,1.91]) add(box,cx,-.61,.03,.04,.43,.39,0x202527);
    mountRetailDisplay(K,{root,fallback,source,batches,x,y,z});
  });
}
