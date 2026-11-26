import { mountRetailDisplay } from './shinsegae-retail-display.js';
import { relief } from '../banpo_relief.js';

const source = new URL('../../assets/models/ssg-home-lyn/haller.glb', import.meta.url);
const batches = ['USMChrome', 'USMLacquer', 'USMSoftPanels'];

export function registerUSM(K, {poly, x, y, z, yaw}) {
  K.detail({floor:'9F', y0:y, y1:y+4.8, poly, name:'USM 할러 모듈 가구'}, () => {
    const T = K.THREE;
    const root = new T.Group();
    root.position.set(x,y+relief(x,z),z);
    root.rotation.y = yaw;
    const fallback = new T.Group();
    root.add(fallback);
    const geometry = new T.BoxGeometry();
    const finishes = new Map();
    function box(px, py, pz, w, h, d, color) {
      if (!finishes.has(color)) finishes.set(color,new T.MeshStandardMaterial({color}));
      const part = new T.Mesh(geometry,finishes.get(color));
      part.scale.set(w,h,d);
      part.position.set(px,py,pz);
      fallback.add(part);
    }
    const steel = 0xb5babd;
    for (const px of [-.94,-.44,.31]) {
      box(px,.86,-.245,.026,1.55,.026,steel);
      box(px,.345,.28,.026,.53,.026,steel);
    }
    box(-.315,.587,-.07,1.27,.027,.71,0xe4e3de);
    box(-.315,.76,-.22,1.24,.34,.34,0xe4e3de);
    for (const [px,w,bottom,top] of [[-.69,.48,0x66722c,0x97949b],[-.065,.73,0x7a9db6,0x265c89]]) {
      box(px,1.11,-.24,w,.33,.33,bottom);
      box(px,1.46,-.24,w,.33,.33,top);
    }
    for (const px of [-2.575,-1.825]) {
      box(px,.235,-.24,.738,.34,.34,0xc1b7aa);
      box(px,.585,-.24,.738,.34,.34,0x9f3839);
    }
    for (const px of [.59,1.09]) box(px,.39,.13,.025,.72,.025,steel);
    box(.84,.77,.13,.50,.20,.35,0xdcdad4);
    box(.84,.96,.11,.32,.26,.12,0x738242);
    mountRetailDisplay(K, {root,fallback,source,batches,x,y,z});
  });
}
