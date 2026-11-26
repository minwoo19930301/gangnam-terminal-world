import { mountRetailDisplay } from './shinsegae-retail-display.js';
import { relief } from '../banpo_relief.js';

const source = new URL('../../assets/models/ssg-pishon-shop/gallery.glb', import.meta.url);
const batches = ['PishonPaper','PishonPorcelain','PishonSilver','PishonPrism','PishonTravertine'];

export function registerPishon(K,{poly,x,y,z,yaw}) {
  const fixtures = [[0,0,3.27,.70,2.43],[-.60,1.46,1.15,.60,.94],[.83,.83,1.20,.65,1.03]];
  for (const [side,front,w,d,h] of fixtures) {
    K.box({x:x+side*Math.cos(yaw)+front*Math.sin(yaw),y,
      z:z-side*Math.sin(yaw)+front*Math.cos(yaw),rotY:yaw,w,d,h,
      mat:0xddcfb3,skip:['top','bottom','n','s','e','w']});
  }
  K.detail({floor:'9F',y0:y,y1:y+4.8,poly,name:'피숀 선물 진열'},() => {
    const T=K.THREE, root=new T.Group(), fallback=new T.Group();
    root.position.set(x,y+relief(x,z),z);
    root.rotation.y=yaw;
    root.add(fallback);
    const cube=new T.BoxGeometry(), tumbler=new T.CylinderGeometry(.50,.40,1,10);
    const finishes=new Map();
    function add(shape,x,y,z,w,h,d,color) {
      if (!finishes.has(color)) finishes.set(color,new T.MeshStandardMaterial({color}));
      const part=new T.Mesh(shape,finishes.get(color));
      part.position.set(x,y+h/2,z);
      part.scale.set(w,h,d);
      fallback.add(part);
    }
    add(cube,0,0,-.27,3.25,2.43,.16,0xe3d6bf);
    add(cube,0,0,0,3.22,.83,.54,0xd5c6ae);
    for (const h of [1.38,1.91]) add(cube,0,h-.04,0,3.23,.04,.57,0xd7c5a3);
    for (const [side,front,w,d,h] of fixtures.slice(1)) add(cube,side,0,front,w,h,d,0xe1d5c3);
    for (const [i,color] of [0x79983d,0x976328,0x8c415a].entries())
      add(tumbler,-.98+i*.20,.94,1.62,.09,.12,.09,color);
    add(tumbler,.72,1.03,.73,.18,.16,.18,0xf6f1e8);
    for (const [x,z,h] of [[-1.22,1.91,.16],[1.12,1.91,.2],[.95,1.38,.14]])
      add(cube,x,z,0,.36,h,.22,0x6684a4);
    mountRetailDisplay(K,{root,fallback,source,batches,x,y,z});
  });
}
