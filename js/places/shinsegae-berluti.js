import { mountRetailDisplay } from './shinsegae-retail-display.js';
import { relief } from '../banpo_relief.js';

const source = new URL('../../assets/models/ssg-florentine-leather/gallery.glb',import.meta.url);
const batches = ['BerlutiGalleryFinish','BerlutiWalnut','BerlutiVeneziaPatina','BerlutiPalladium'];

export function registerBerluti(K,{x,y,z,yaw,poly}) {
  K.detail({floor:'6F',y0:y,y1:y+4.8,poly,name:'벨루티 가죽 구두와 서류가방'},() => {
    const T=K.THREE, root=new T.Group(), fallback=new T.Group();
    root.position.set(x,y+relief(x,z),z);
    root.rotation.y=yaw;
    root.add(fallback);
    const cube=new T.BoxGeometry(), rounded=new T.SphereGeometry(.5,10,6), colors=new Map();
    function piece(shape,x,y,z,w,h,d,color) {
      if (!colors.has(color)) colors.set(color,new T.MeshStandardMaterial({color}));
      const mesh=new T.Mesh(shape,colors.get(color));
      mesh.position.set(x,y,z);
      mesh.scale.set(w,h,d);
      fallback.add(mesh);
    }
    piece(cube,0,1.47,-.22,5.08,2.72,.075,0xede0d2);
    piece(cube,0,.24,0,5.1,.44,.48,0x805741);
    for (const x of [-2.53,.55,2.55]) piece(cube,x,1.41,0,.11,2.82,.54,0x684b39);
    for (const h of [.52,1.04,1.55,2.09]) {
      piece(cube,0,h-.02,.025,5,.04,.42,0xaa8971);
      for (const x of [-2.1,-1.37,-.64,.09]) piece(rounded,x,h+.045,.04,.26,.09,.14,0x684635);
      for (const x of [1.14,1.91]) piece(cube,x,h+.14,.03,.40,.28,.08,0x75503a);
    }
    piece(cube,0,.90,1.5,1.88,.08,.65,0x8b6047);
    for (const x of [-.89,.89]) piece(cube,x,.45,1.5,.09,.90,.64,0x77533e);
    piece(cube,.43,1.08,1.45,.40,.28,.08,0x935d40);
    mountRetailDisplay(K,{root,fallback,source,batches,x,y,z});
  });
}
