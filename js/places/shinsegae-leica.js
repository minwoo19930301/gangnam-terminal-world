import { mountRetailDisplay } from './shinsegae-retail-display.js';
import { relief } from '../banpo_relief.js';

const source = new URL('../../assets/models/ssg-camera-counter/gallery.glb', import.meta.url);
const batches = ['GangnamLeicaFixtures', 'GangnamLeicaCameras', 'GangnamLeicaPhotographs'];

export function registerLeica(K, {poly,x,y,z,yaw}) {
  // Keep aisle clearance around the demo counter, consultation table and display wall.
  for (const [side,front,w,d,h] of [[0,0,1.62,.74,1.01],[0,-2.08,5.72,.16,2.74],
      [-1.53,-1.62,2.46,.56,2.64],[1.57,-.9,1.83,.60,1.01],
      [1.18,-.42,.32,.28,.81],[1.89,-.42,.32,.28,.81]]) {
    K.box({x:x+side*Math.cos(yaw)+front*Math.sin(yaw),y,
      z:z-side*Math.sin(yaw)+front*Math.cos(yaw),w,d,h,rotY:yaw,
      mat:0xffffff,skip:['top','bottom','n','s','e','w']});
  }
  K.detail({floor:'6F',y0:y,y1:y+4.8,poly,name:'라이카 카메라와 사진 전시'}, () => {
    const T=K.THREE, root=new T.Group(), fallback=new T.Group();
    root.position.set(x,y+relief(x,z),z);
    root.rotation.y=yaw;
    root.add(fallback);
    const cube=new T.BoxGeometry(),materials=new Map();
    function box(cx,cy,cz,w,h,d,color) {
      if (!materials.has(color)) materials.set(color,new T.MeshStandardMaterial({color}));
      const part=new T.Mesh(cube,materials.get(color));
      part.scale.set(w,h,d);
      part.position.set(cx,cy,cz);
      fallback.add(part);
    }
    box(0,.54,0,1.62,.94,.74,0xf4f3f0);
    box(0,1.38,-2.08,5.72,2.73,.16,0xf5f4f1);
    box(-1.53,1.38,-1.82,2.46,2.55,.42,0x19191c);
    for (const cx of [-2.1,-.97]) for (const h of [.64,1.18,1.72])
      box(cx,h+.22,-1.59,1.05,.44,.03,0xb61c30);
    for (const cx of [.26,1.19,2.12]) {
      box(cx,1.75,-1.96,.755,.81,.06,0x414143);
      box(cx,1.75,-1.92,.58,.57,.02,0xc3c6c4);
    }
    box(1.57,.96,-.9,1.83,.1,.60,0xf5f4f1);
    for (const cx of [.70,2.44]) box(cx,.48,-.9,.09,.89,.6,0xf5f4f1);
    for (const cx of [-.51,-.01,.49]) {
      box(cx,1.07,.028,.14,.08,.05,0x292b2b);
      box(cx+.01,1.065,.083,.06,.06,.09,0x3a4143);
    }
    mountRetailDisplay(K,{root,fallback,source,batches,x,y,z});
  });
}
