import { mountRetailDisplay } from './shinsegae-retail-display.js';
import { relief } from '../banpo_relief.js';

const source = new URL('../../assets/models/ssg-cycle-gear/gallery.glb', import.meta.url);
const batches = ['BromptonGangnamCycles', 'BromptonGangnamFixtures'];

export function registerBrompton(K, {poly, x, y, z, yaw}) {
  K.detail({floor:'8F', y0:y, y1:y+4.8, poly, name:'브롬톤 · 접이식 자전거 전시'}, () => {
    const T = K.THREE, root = new T.Group(), fallback = new T.Group();
    root.position.set(x,y+relief(x,z),z);
    root.rotation.y = yaw;
    root.add(fallback);
    const box = new T.BoxGeometry(), wheel = new T.TorusGeometry(.194,.021,5,16);
    const materials = new Map();
    function piece(geometry,color,x,y,z) {
      if (!materials.has(color)) materials.set(color,new T.MeshStandardMaterial({color}));
      const mesh = new T.Mesh(geometry,materials.get(color));
      mesh.position.set(x,y,z);
      fallback.add(mesh);
      return mesh;
    }
    function board(x,y,z,w,h,d,color) {
      piece(box,color,x,y,z).scale.set(w,h,d);
    }
    board(0,1.24,-.71,3.30,2.45,.09,0xe7dbc8);
    board(0,.28,-.45,3.30,.52,.48,0xe7dbc8);
    board(0,2.34,-.45,3.30,.29,.48,0xf7f2e4);
    for (const x of [-1.62,-.54,.54,1.62]) board(x,1.35,-.45,.06,1.62,.52,0xf7f2e4);
    for (const h of [.55,1.36,2.17]) board(0,h,-.45,3.30,.045,.52,0xf7f2e4);
    const paints = [0x4d423b,0xab3438,0x687a86,0x3c4241,0x38624e,0xe26e3f];
    paints.forEach((paint,i) => {
      const x = (i%3-1)*1.08, h = .80+Math.floor(i/3)*.81;
      piece(wheel,0x252726,x,h,-.41);
      const tube = piece(box,paint,x+.04,h+.14,-.37);
      tube.scale.set(.35,.034,.037);
      tube.rotation.z = .32;
      board(x-.09,h+.30,-.42,.21,.04,.09,0x252726);
    });
    for (const x of [-.38,.64]) piece(wheel,0x252726,x,.25,1.13);
    board(.13,.45,1.13,.82,.044,.05,0x92ae66);
    board(.52,.72,1.13,.035,.53,.035,0x92ae66);
    board(.02,.72,1.13,.028,.49,.03,0x9da5a6);
    board(.02,.98,1.13,.25,.04,.13,0x252726);
    board(2.96,1.79,-.41,2.1,.03,.03,0x212526);
    for (let i=0;i<8;i++) board(2.14+i*.23,1.25,-.41,.14,.73,.40,[0x333943,0xdfd4b6,0xc29d74,0x6e7461][i%4]);
    mountRetailDisplay(K,{root,fallback,source,batches,x,y,z});
  });
}
