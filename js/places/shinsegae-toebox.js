import { mountRetailDisplay } from './shinsegae-retail-display.js';
import { relief } from '../banpo_relief.js';

const source = new URL('../../assets/models/ssg-kids-footwear/gallery.glb', import.meta.url);
const batches = ['ToeboxFootwear', 'ToeboxFixtures'];

export function registerToebox(K, {poly, x, y, z, yaw}) {
  K.detail({floor:'10F', y0:y, y1:y+4.8, poly, name:'토박스 유아 신발과 피팅 의자'}, () => {
    const T = K.THREE;
    const root = new T.Group();
    root.position.set(x,y+relief(x,z),z);
    root.rotation.y = yaw;
    const fallback = new T.Group();
    root.add(fallback);
    const box = new T.BoxGeometry(), round = new T.CylinderGeometry(.5,.5,1,20);
    const colors = new Map();
    function add(geometry, cx, base, cz, w, h, d, color) {
      if (!colors.has(color)) colors.set(color,new T.MeshStandardMaterial({color}));
      const part = new T.Mesh(geometry,colors.get(color));
      part.position.set(cx,base+h/2,cz);
      part.scale.set(w,h,d);
      fallback.add(part);
    }
    for (const [i,cx] of [-1.72,0,1.72].entries()) {
      add(box,cx,.12,-1.61,1.56,1.90,.08,0xf5eee2);
      for (const h of [.46,.93,1.40]) {
        add(box,cx,h,-1.37,1.52,.057,.42,0xc3a487);
        for (const dx of [-.54,-.29,.29,.54]) {
          const tint = [0xbb514b,0xe887a7,0xbc343e][i];
          add(round,cx+dx,h+.057,-1.34,.085,.046,.17,tint);
          if (i===2) add(round,cx+dx,h+.10,-1.37,.075,.12,.075,tint);
        }
      }
    }
    add(round,-.58,.02,.45,1.66,.55,.86,0x777681);
    add(round,.57,.02,.36,1.28,.75,.80,0x777681);
    add(box,1.97,.33,.59,.60,.13,.48,0xc98792);
    add(box,1.97,.45,.37,.56,.33,.09,0xc98792);
    mountRetailDisplay(K,{root,fallback,source,batches,x,y,z});
  });
}
