import { mountRetailDisplay } from './shinsegae-retail-display.js';
import { relief } from '../banpo_relief.js';

const source = new URL('../../assets/models/ssg-heritage-shoes/gallery.glb',import.meta.url);
const batches = ['BerwickCabinetry','BerwickGoodyearCalf','BerwickFittings','BerwickWool'];

export function registerBerwick(K,{x,y,z,yaw,poly}) {
  K.detail({floor:'6F',y0:y,y1:y+4.8,poly,name:'버윅 구두와 슈케어'},() => {
    const T=K.THREE, root=new T.Group(), fallback=new T.Group();
    root.position.set(x,y+relief(x,z),z);
    root.rotation.y=yaw;
    root.add(fallback);
    const box=new T.BoxGeometry(), upper=new T.SphereGeometry(.5,10,6);
    const materials=new Map();
    function add(geometry,x,y,z,w,h,d,color,angle=0) {
      if (!materials.has(color)) materials.set(color,new T.MeshStandardMaterial({color}));
      const mesh=new T.Mesh(geometry,materials.get(color));
      mesh.position.set(x,y,z);
      mesh.rotation.y=angle;
      mesh.scale.set(w,h,d);
      fallback.add(mesh);
    }
    add(box,0,1.43,-.20,4.72,2.84,.12,0xc39d7e);
    add(box,0,.33,.03,4.58,.58,.48,0xc19f83);
    add(box,0,2.57,0,4.72,.56,.43,0xb48b6f);
    for (const side of [-1,1]) {
      add(box,side*2.32,1.38,1.27,.14,2.48,1.95,0xc4a184);
      for (const h of [.72,1.32,1.92]) add(box,side*2.24,h,1.27,.42,.047,1.95,0xe1c6a8);
    }
    for (const h of [.62,1.06,1.51,1.96]) {
      add(box,0,h+.026,.027,4.68,.052,.51,0xe5c9a7);
      for (let i=0;i<6;i++) add(upper,-1.79+Math.floor(i/2)*1.64+(i%2)*.32,h+.097,.086,.115,.094,.303,
        i%3===0?0x43302b:0x292529,-.78);
    }
    for (const [cx,cz,w,d,h] of [[-.33,1.58,1.42,.73,.83],[.46,1.12,1.04,.63,1.03]]) {
      add(box,cx,h/2,cz,w,h,d,0xac8566);
      for (const offset of [-.21,.20]) add(upper,cx+offset,h+.06,cz,.12,.12,.30,0x40302c,-.64);
    }
    mountRetailDisplay(K,{root,fallback,source,batches,x,y,z});
  });
}
