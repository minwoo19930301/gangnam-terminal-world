import {mountRetailDisplay} from './shinsegae-retail-display.js';
import {relief} from '../banpo_relief.js';

const source = new URL('../../assets/models/ssg-blue-porcelain/display.glb', import.meta.url);
const batches = ['RoyalPrincessPorcelain','RoyalOakCabinetry','RoyalBrassDetails'];

export function registerRoyalCopenhagen(K, {poly,x,y,z,yaw}) {
  K.detail({floor:'9F',y0:y,y1:y+4.8,poly,name:'로얄코펜하겐'}, () => {
    const T=K.THREE, root=new T.Group(), fallback=new T.Group();
    root.position.set(x,y+relief(x,z),z);
    root.rotation.y=yaw;
    root.add(fallback);
    const cube=new T.BoxGeometry(), dish=new T.CylinderGeometry(1,.72,1,20);
    function piece(shape,color,px,py,pz,w,h,d,angle=0) {
      const mesh=new T.Mesh(shape,new T.MeshStandardMaterial({color}));
      mesh.scale.set(w,h,d);
      mesh.position.set(px,py,pz);
      mesh.rotation.x=angle;
      fallback.add(mesh);
    }
    piece(cube,0xb78662,0,.85,0,2.46,.07,.92);
    piece(cube,0xe5d9c5,0,.65,0,2.31,.34,.78);
    for(const a of [-1.15,1.15]) for(const b of [-.39,.39]) piece(cube,0x986d4e,a,.42,b,.055,.84,.055);
    piece(cube,0xad7957,0,1.32,-2.22,4.56,2.64,.09);
    for(const h of [.58,1.12,1.65,2.18]) {
      piece(cube,0xce996e,0,h,-2.02,4.56,.045,.48);
      for(const a of [-1.8,-1.26,1.23,1.79]) piece(dish,0xe9e6df,a,h+.16,-2,.14,.032,.14,1.3);
    }
    piece(cube,0xe9e2cf,-2.33,1.41,-.66,.77,2.82,.58);
    for(const a of [-.84,-.48,.33,.85]) piece(dish,0xf4f1eb,a,.93,0,.09,.09,.09);
    piece(dish,0x245283,-.52,1.14,.08,.15,.025,.15,1.25);
    mountRetailDisplay(K,{root,fallback,source,batches,x,y,z});
  });
}
