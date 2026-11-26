import { mountRetailDisplay } from './shinsegae-retail-display.js';
import { relief } from '../banpo_relief.js';

const source = new URL('../../assets/models/ssg-marzocco/gallery.glb', import.meta.url);
const batches = ['MarzoccoEnamel', 'MarzoccoSteel', 'MarzoccoArtwork', 'MarzoccoLettering', 'MarzoccoHopper'];

export function registerMarzocco(K, {poly, x, y, z, yaw}) {
  K.detail({floor:'9F', y0:y, y1:y+4.8, poly, name:'라마르조코 에스프레소 머신'}, () => {
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
    box(0,.02,0,3.85,.88,.71,0xb4b0a8);
    box(.29,.9,-.475,3.27,1.13,.075,0xcbd5ce);
    box(-1.65,.9,-.31,.62,1.17,.16,0x274593);
    for (const [a,color] of [[-.89,0xb22e25],[.53,0xb6bfbd]]) {
      box(a,.90,-.07,.37,.32,.23,color);
      box(a,1.16,.105,.37,.115,.19,color);
      box(a,.92,.115,.37,.065,.20,0x555956);
      box(a,1.105,.12,.068,.067,.069,0xb4bdba);
    }
    for (const a of [-.47,1.04]) {
      box(a,.90,0,.15,.23,.16,0x444949);
      box(a,1.13,0,.12,.11,.12,0x79786e);
    }

    mountRetailDisplay(K, {root, fallback, source, batches, x, y, z});
  });
}
