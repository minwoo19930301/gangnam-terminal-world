import { mountRetailDisplay } from './shinsegae-retail-display.js';
import { relief } from '../banpo_relief.js';

const source = new URL('../../assets/models/ssg-riedel/gallery.glb', import.meta.url);
const batches = ['BaccaratCabinet','BaccaratSilver','BaccaratCrystal','BaccaratLight'];

export function registerBaccarat(K, {poly,x,y,z,yaw}) {
  K.detail({floor:'9F', y0:y, y1:y+4.8, poly, name:'바카라 크리스털'}, () => {
    const T = K.THREE;
    const root = new T.Group(), fallback = new T.Group();
    root.position.set(x,y+relief(x,z),z);
    root.rotation.y = yaw;
    root.add(fallback);
    const cube = new T.BoxGeometry(), finishes = new Map();
    function piece(geometry,px,py,pz,w,h,d,color) {
      if (!finishes.has(color)) finishes.set(color,new T.MeshStandardMaterial({color}));
      const mesh = new T.Mesh(geometry,finishes.get(color));
      mesh.scale.set(w,h,d);
      mesh.position.set(px,py+h/2,pz);
      fallback.add(mesh);
    }
    piece(cube,0,.03,-.33,3.18,2.53,.12,0xeee7dc);
    for (const sx of [-1.05,1.05]) {
      piece(cube,sx,.03,-.12,.91,.57,.51,0x332b2a);
      piece(cube,sx,.60,-.23,.91,1.72,.085,0x989390);
      for (const level of [.60,1.13,1.66,2.27])
        piece(cube,sx,level,-.09,.91,.03,.46,0xd2c9b9);
    }
    piece(cube,0,2.18,-.219,.69,.266,.035,0xae1831);
    piece(cube,0,.815,1.78,1.88,.065,.88,0x332b2a);
    for (const sx of [-.83,.83]) for (const dz of [-.33,.33])
      piece(cube,sx,.028,1.78+dz,.07,.79,.07,0x332b2a);
    const shade = new T.CylinderGeometry(.34,.50,1,12);
    piece(cube,.19,.88,1.62,.04,.22,.04,0xb9c7c8);
    piece(shade,.19,1.10,1.62,.22,.15,.22,0xa82339);
    const bowl = new T.CylinderGeometry(.50,.15,1,8);
    for (const sx of [-.64,-.46,.44,.61]) {
      piece(cube,sx,.88,1.66,.018,.08,.018,0xbbc9ca);
      piece(bowl,sx,.96,1.66,.09,.10,.09,0x8bb9af);
    }
    mountRetailDisplay(K,{root,fallback,source,batches,x,y,z});
  });
}
