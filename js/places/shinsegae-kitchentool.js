import { mountRetailDisplay } from './shinsegae-retail-display.js';
import { relief } from '../banpo_relief.js';

const source = new URL('../../assets/models/ssg-kitchentool-shop/gallery.glb', import.meta.url);
const batches = ['KitchenToolHasamiCase', 'KitchenToolHasamiGlaze', 'KitchenToolHasamiStone'];

export function registerKitchenTool(K, {poly, x, y, z, yaw}) {
  K.detail({floor:'9F', poly, y0:y, y1:y+4.8, name:'키친툴 하사미 도자기'}, () => {
    const T = K.THREE, root = new T.Group(), fallback = new T.Group();
    root.position.set(x, y+relief(x,z), z);
    root.rotation.y = yaw;
    root.add(fallback);
    const cube = new T.BoxGeometry(), dish = new T.CylinderGeometry(.50,.39,1,16);
    function piece(shape, px, py, pz, w, h, d, color) {
      const m = new T.Mesh(shape,new T.MeshStandardMaterial({color}));
      m.position.set(px,py+h/2,pz);
      m.scale.set(w,h,d);
      fallback.add(m);
      return m;
    }
    piece(cube,0,.02,0,1.94,.82,.82,0xc5aa87);
    piece(cube,0,.84,0,2.04,.082,.90,0xeee0c7);
    piece(cube,0,.02,-1.03,1.22,.84,.41,0xd5bd9a);
    piece(cube,0,.86,-1.12,.69,1.27,.11,0xb08b66);
    for (const [i,color] of [0xb8291c,0xb0b293,0x699ab4,0x524b48,0x854123].entries()) {
      piece(dish,-.68+i*.32,.922,.20,.23,.024,.23,color);
      piece(dish,-.68+i*.32,.946,.20,.14,.040,.14,color);
    }
    for (const [i,color] of [0xdca918,0x23305b,0xdeada1].entries()) {
      piece(dish,-.13+i*.39,1.0,-.25,.22,.018,.22,color).rotation.x=-1.26;
    }
    mountRetailDisplay(K,{root,fallback,source,batches,x,y,z});
  });
}
