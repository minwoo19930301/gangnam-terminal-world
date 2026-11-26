import { mountRetailDisplay } from './shinsegae-retail-display.js';
import { relief } from '../banpo_relief.js';

const source = new URL('../../assets/models/ssg-designer-menswear/gallery.glb', import.meta.url);
const batches = ['CucinelliInterior','CucinelliTailoring','CucinelliCashmere','CucinelliSuede'];

export function registerCucinelli(K, {x,y,z,yaw,poly}) {
  K.detail({floor:'6F',y0:y,y1:y+4.8,poly,name:'브루넬로 쿠치넬리 남성 의류'}, () => {
    const T=K.THREE, root=new T.Group(), fallback=new T.Group();
    root.position.set(x,y+relief(x,z),z);
    root.rotation.y=yaw;
    root.add(fallback);
    const box=new T.BoxGeometry(), cloth=new T.SphereGeometry(.5,12,8);
    const colors=new Map();
    function add(geometry,x,y,z,w,h,d,color,tilt=0) {
      if (!colors.has(color)) colors.set(color,new T.MeshStandardMaterial({color}));
      const part=new T.Mesh(geometry,colors.get(color));
      part.position.set(x,y,z);
      part.scale.set(w,h,d);
      part.rotation.z=tilt;
      fallback.add(part);
    }
    for (const [cx,width] of [[0,3.12],[3.03,2.52]]) {
      add(box,cx,1.38,-.49,width,2.73,.115,0xf0e9df);
      for (const side of [-1,1]) add(box,cx+side*(width/2-.057),1.39,-.21,.115,2.74,.64,0xd9d3c7);
      for (const h of [.08,2.24,2.72]) add(box,cx,h,-.21,width,.065,.64,0xd9d0bf);
      add(box,cx,2.02,-.018,width-.14,.03,.03,0xaba597);
    }
    for (const [i,cx] of [-.92,0,.92,2.24,2.56,2.89,3.2,3.52,3.82].entries()) {
      const color=[0xb59d7f,0x35435a,0x6e5446][i%3],w=i<3?.47:.22;
      add(cloth,cx,1.51,0,w,.80,.19,color);
      for (const s of [-1,1]) add(cloth,cx+s*w*.46,1.49,0,.13,.62,.15,color,-s*.16);
    }
    add(box,-2.22,.29,.41,.85,.43,.79,0xb6afa1);
    add(box,-2.22,.57,.08,.84,.43,.16,0xb6afa1);
    mountRetailDisplay(K,{root,fallback,source,batches,x,y,z});
  });
}
