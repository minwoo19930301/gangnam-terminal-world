import {mountRetailDisplay} from './shinsegae-retail-display.js';
import {relief} from '../banpo_relief.js';

const source = new URL('../../assets/models/ssg-sports-watch/gallery.glb', import.meta.url);
const batches = ['GarminGangnamWatches','GarminGangnamFixtures','GarminGangnamMetal'];

export function registerGarmin(K, {poly,x,y,z,yaw}) {
  K.detail({floor:'8F', y0:y, y1:y+4.8, poly, name:'가민 · 스포츠 시계 체험대'}, () => {
    const T=K.THREE, root=new T.Group(), fallback=new T.Group();
    root.position.set(x,y+relief(x,z),z);
    root.rotation.y=yaw;
    root.add(fallback);
    const cube=new T.BoxGeometry(), materials=new Map();
    function board(x,y,z,w,h,d,color) {
      if (!materials.has(color)) materials.set(color,new T.MeshStandardMaterial({color}));
      const mesh=new T.Mesh(cube,materials.get(color));
      mesh.position.set(x,y,z);
      mesh.scale.set(w,h,d);
      fallback.add(mesh);
    }
    board(.38,.55,1.89,2.84,1.04,.72,0xaba9a3);
    board(.38,1.05,1.89,2.88,.045,.75,0xf2f1ed);
    for(const x of [-.34,1.08]) board(x,1.09,1.87,1.3,.04,.42,0x36383a);
    for(const x of [-.78,-.35,.08,.67,1.08,1.49]) board(x,1.16,1.91,.063,.09,.062,0x373e40);
    board(-1.65,.14,2.23,1.15,.25,.84,0x858482);
    board(-1.65,1.06,2.23,.72,1.54,.16,0x313337);
    board(-1.65,1.06,2.32,.61,1.23,.016,0x16222c);
    board(.05,1.07,-1.40,4.74,2.11,.12,0x3b3d40);
    for(const h of [.65,1.24,1.81]) board(.70,h,-1.17,3.18,.045,.40,0xf2f1ed);
    board(-1.64,1.37,-1.08,1.17,1.48,.16,0xaba9a3);
    mountRetailDisplay(K,{root,fallback,source,batches,x,y,z});
  });
}
