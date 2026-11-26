import {mountRetailDisplay} from './shinsegae-retail-display.js';
import {relief} from '../banpo_relief.js';

const source = new URL('../../assets/models/ssg-bag-accessories/gallery.glb', import.meta.url);
const batches = ['TumiGangnamVoyageur','TumiGangnamHardware','TumiGangnamCeramic','TumiGangnamWovenNylon'];

export function registerTumi(K,{poly,x,y,z,yaw}) {
  K.detail({floor:'6F',y0:y,y1:y+4.8,poly,name:'투미 여행 가방 진열'}, () => {
    const T=K.THREE, root=new T.Group(), fallback=new T.Group();
    root.position.set(x,y+relief(x,z),z);
    root.rotation.y=yaw;
    root.add(fallback);
    const cube=new T.BoxGeometry();
    function block(px,py,pz,w,h,d,color) {
      const mesh=new T.Mesh(cube,new T.MeshStandardMaterial({color}));
      mesh.position.set(px,py,pz);
      mesh.scale.set(w,h,d);
      fallback.add(mesh);
    }
    block(0,.5,0,1.73,1,.70,0xf2eada);
    block(-1.31,.275,-.30,.78,.55,.65,0x63aeb4);
    for (const [bx,by,bz,color] of [[-.06,1,.088,0xba9172],[-1.30,.557,-.20,0x839e92]]) {
      block(bx,by+.185,bz,.31,.37,.15,color);
      for(const s of [-1,1])block(bx+s*.09,by+.09,bz+.078,.12,.16,.045,color);
    }
    block(-.43,1.095,.11,.15,.19,.063,0xda7555);
    block(.47,1.11,-.025,.17,.22,.17,0xede6d4);
    block(.47,1.38,-.025,.20,.12,.17,0xefd26a);
    const ring=new T.Mesh(new T.TorusGeometry(.235,.064,6,24),new T.MeshStandardMaterial({color:0xaad1cf}));
    ring.position.set(-1.32,1.42,-.55);
    fallback.add(ring);
    mountRetailDisplay(K,{root,fallback,source,batches,x,y,z});
  });
}
