import { mountRetailDisplay } from './shinsegae-retail-display.js';
import { relief } from '../banpo_relief.js';

const source = new URL('../../assets/models/ssg-stokke/gallery.glb', import.meta.url);
const batches = ['StokkeChairs', 'StokkeDisplay'];

export function registerStokke(K, {poly, x, y, z, yaw}) {
  K.detail({floor:'10F', y0:y, y1:y+4.8, poly, name:'스토케 트립트랩 체험 진열'}, () => {
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
    box(0,.02,0,2.95,.44,.98,0xe8dbc3);
    for(const [cx,tint] of [[-.90,0xd5aa79],[.012,0x597c80]]){
      for(const side of [-.214,.214]){
        box(cx+side,.465,0,.036,.045,.49,tint);
        box(cx+side,.49,-.016,.029,.80,.082,tint);
        fallback.children[fallback.children.length-1].rotation.x=-.40;
        fallback.children[fallback.children.length-1].position.y=.86;
      }
      box(cx,.97,0,.42,.022,.25,tint);
      box(cx,.76,.07,.42,.022,.32,tint);
      for(const h of [1.12,1.20])box(cx,h,-.13,.42,.05,.02,tint);
    }
    box(.012,1.14,.18,.45,.027,.25,0xf3ece1);
    box(.96,.46,-.16,.65,.86,.05,0x374c46);
    for(let i=0;i<6;i++)box(.76+i%3*.2,.80+Math.floor(i/3)*.21,-.12,.14,.145,.04,
      [0x587e81,0x899877,0xb15c47,0xd8b283,0x836745,0xeee3d2][i]);

    mountRetailDisplay(K, {root, fallback, source, batches, x, y, z});
  });
}
