import {mountRetailDisplay} from './shinsegae-retail-display.js';
import {relief} from '../banpo_relief.js';

const source = new URL('../../assets/models/ssg-rimowa-gallery/gallery.glb',import.meta.url);
const batches = ['RimowaGangnamAluminium','RimowaGangnamTextiles','RimowaGangnamFittings','RimowaGangnamOak'];

export function registerRimowaGallery(K,{poly,x,y,z,yaw}) {
  K.detail({floor:'6F',y0:y,y1:y+4.8,poly,name:'리모와 여행 가방 진열벽'}, () => {
    const T=K.THREE, root=new T.Group(), fallback=new T.Group();
    root.position.set(x,y+relief(x,z),z);
    root.rotation.y=yaw;
    root.add(fallback);
    const cube=new T.BoxGeometry();
    function block(px,py,pz,w,h,d,color) {
      const part=new T.Mesh(cube,new T.MeshStandardMaterial({color}));
      part.position.set(px,py,pz);
      part.scale.set(w,h,d);
      fallback.add(part);
    }
    block(0,1.43,-.055,4.02,2.86,.12,0xa98155);
    block(-1.67,1.18,.106,.49,1.94,.024,0x9eafb6);
    for(const [height,tone] of [[.15,0x272d41],[.83,0x73838d],[1.50,0x526043]]) {
      block(-.515,height-.024,.19,1.50,.049,.415,0xb8bdbe);
      for(const side of [-.84,-.18])block(side,height+.19,.23,.40,.38,.20,tone);
    }
    for(const [base,w,h] of [[.097,.84,.33],[.503,.84,.35],[.933,.73,.285],[1.294,.62,.25],[1.632,.39,.51]]) {
      block(1.18,base+h/2,.23,w,h,.30,0xbac1c4);
    }
    mountRetailDisplay(K,{root,fallback,source,batches,x,y,z});
  });
}
