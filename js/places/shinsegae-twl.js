import { mountRetailDisplay } from './shinsegae-retail-display.js';
import { relief } from '../banpo_relief.js';

const source = new URL('../../assets/models/ssg-twl/gallery.glb', import.meta.url);
const batches = ['TWLOak', 'TWLTimber', 'TWLGlaze', 'TWLStoneware', 'TWLMetal'];

export function registerTwl(K, {poly, x, y, z, yaw}) {
  K.detail({floor:'9F', y0:y, y1:y+4.8, poly, name:'TWL 다기와 공예 그릇'}, () => {
    const T = K.THREE;
    const root = new T.Group();
    root.position.set(x, y + relief(x,z), z);
    root.rotation.y = yaw;
    const fallback = new T.Group();
    root.add(fallback);
    const boxGeometry = new T.BoxGeometry();
    const colors = new Map();
    function box(px, py, pz, w, h, d, color) {
      if (!colors.has(color)) colors.set(color, new T.MeshStandardMaterial({color}));
      const part = new T.Mesh(boxGeometry, colors.get(color));
      part.scale.set(w,h,d);
      part.position.set(px, py+h/2, pz);
      fallback.add(part);
    }
    box(0,.18,0,3.07,.07,1.02,0xb57a4b);
    box(0,.87,0,3.07,.081,1.02,0xe8d8bc);
    for (const a of [-1.49,1.49]) for (const b of [-.47,.47]) box(a,.055,b,.074,.90,.074,0xab7149);
    box(0,.08,-2.83,4.94,2.34,.075,0xb57a4b);
    box(0,.08,-2.58,4.94,.45,.57,0x97603e);
    const cup = new T.CylinderGeometry(1,.52,1,12,1,true);
    function vessel(a,h,b,r,height,color) {
      if (!colors.has(color)) colors.set(color,new T.MeshStandardMaterial({color,side:T.DoubleSide}));
      const part = new T.Mesh(cup,colors.get(color));
      part.position.set(a,h+height/2,b);
      part.scale.set(r,height,r);
      fallback.add(part);
    }
    for (const h of [.535,1.055,1.575,2.375]) {
      box(0,h,-2.58,4.96,.062,.63,0xe3c3a1);
      if (h<2) for (const a of [-1.88,-.98,.84,1.83]) vessel(a,h+.062,-2.58,.18,.16,0xb3c4aa);
    }
    vessel(-.91,.951,-.12,.15,.19,0x363d39);
    vessel(.37,.951,-.13,.25,.24,0xeae3d0);
    for (const a of [-1.22,-.77,.96,1.28]) vessel(a,.951,.17,.08,.09,0x86a99f);

    mountRetailDisplay(K, {root, fallback, source, batches, x, y, z});
  });
}
