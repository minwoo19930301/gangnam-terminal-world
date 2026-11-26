import {mountRetailDisplay} from './shinsegae-retail-display.js';
import {relief} from '../banpo_relief.js';

const source = new URL('../../assets/models/ssg-cookware/showroom.glb', import.meta.url);
const batches = ['MauvielFixture', 'MauvielMetal', 'MauvielVeneer'];

export function registerMauviel(K, {poly, x, y, z, yaw}) {
  K.detail({floor:'9F', y0:y, y1:y+4.8, poly, name:'모비엘 냄비 진열장'}, () => {
    const T = K.THREE, root = new T.Group(), fallback = new T.Group();
    root.position.set(x, y+relief(x,z), z);
    root.rotation.y = yaw;
    root.add(fallback);
    const box = new T.BoxGeometry(), bowl = new T.CylinderGeometry(1,.83,1,12);
    const oak = new T.MeshStandardMaterial({color:0xc5a782});
    const steel = new T.MeshStandardMaterial({color:0xbebdb8});
    const copper = new T.MeshStandardMaterial({color:0xd69b77});
    function part(geometry,material,x,y,z,w,h,d) {
      const mesh = new T.Mesh(geometry,material);
      mesh.position.set(x,y,z);
      mesh.scale.set(w,h,d);
      fallback.add(mesh);
    }
    for (const cx of [-.475,.475]) {
      part(box,oak,cx,.20,0,.93,.39,.50);
      part(box,oak,cx,.88,-.225,.90,1,.036);
      for (const s of [-.437,.437]) part(box,oak,cx+s,.87,0,.055,1.04,.43);
      for (const height of [.39,.72,1.05,1.38]) {
        part(box,oak,cx,height-.02,0,.938,.04,.515);
        for (const offset of [-.2,.2]) part(bowl,height>1.3?copper:steel,cx+offset,height+.055,.03,.123,.105,.123);
      }
    }
    mountRetailDisplay(K,{root,fallback,source,batches,x,y,z});
  });
}
