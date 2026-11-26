import { mountRetailDisplay } from './shinsegae-retail-display.js';
import { relief } from '../banpo_relief.js';

const source = new URL('../../assets/models/ssg-herman-miller/seating.glb', import.meta.url);
const batches = ['HMFrame', 'HMAlloy', 'HMFabric', 'HMDisplay'];

export function registerHermanMiller(K, {poly, x, y, z, yaw}) {
  K.detail({floor:'9F', y0:y, y1:y+4.8, poly, name:'허먼 밀러 의자와 마감 표본'}, () => {
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
    box(.68,.02,-.12,4.22,.175,1.24,0xdbd8cb);
    box(.68,.02,-1.40,4.28,2.17,.13,0xe5e1d6);
    for (const [px,pz,color] of [[-.70,.04,0x424848],[.67,-.075,0x386f78],[2.12,-.33,0x386f78]]) {
      box(px,.34,pz,.075,.31,.075,0x575d5d);
      box(px,.625,pz,.52,.08,.46,color);
      box(px,.70,pz-.18,.43,.48,.06,color);
      for (const side of [-.27,.27]) box(px+side,.83,pz,.07,.05,.23,0x333635);
    }
    for (let i=0;i<8;i++) box(.68+(i%4)*.467,1.36-Math.floor(i/4)*.43,-1.26,.31,.32,.04,
      [0x707a79,0x495152,0x242729,0x386f78,0x315961,0xb69a5c,0xa56151,0xd4d4ca][i]);

    mountRetailDisplay(K, {root, fallback, source, batches, x, y, z});
  });
}
