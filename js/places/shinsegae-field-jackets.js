import {mountRetailDisplay} from './shinsegae-retail-display.js';
import {relief} from '../banpo_relief.js';

const source = new URL('../../assets/models/ssg-field-jackets/gallery.glb', import.meta.url);
const batches = ['BarbourGangnamFixtures', 'BarbourGangnamHardware', 'BarbourGangnamBedale'];

export function registerBarbour(K, {poly, x, y, z, yaw}) {
  K.detail({floor:'7F', y0:y, y1:y+4.8, poly, name:'바버 왁스 재킷과 원목 진열대'}, () => {
    const T=K.THREE, root=new T.Group(), fallback=new T.Group();
    root.position.set(x,y+relief(x,z),z);
    root.rotation.y=yaw;
    root.add(fallback);
    const box=new T.BoxGeometry(), round=new T.CylinderGeometry(.5,.5,1,16);
    const cloth=new T.SphereGeometry(.5,10,8), materials=new Map();
    function piece(geometry,x,y,z,w,h,d,color,tilt=0) {
      if (!materials.has(color)) materials.set(color,new T.MeshStandardMaterial({color}));
      const mesh=new T.Mesh(geometry,materials.get(color));
      mesh.position.set(x,y,z);mesh.scale.set(w,h,d);mesh.rotation.z=tilt;
      fallback.add(mesh);
    }
    piece(box,0,1.24,-1.34,5.72,2.48,.13,0x939986);
    piece(box,.19,.022,.012,3.75,.025,2.23,0x857960);
    for (const [cx,front,h,d] of [[.19,.26,.90,1.06],[1.08,.48,.62,.778]]) {
      piece(round,cx,h-.02,front,d,.045,d,0x98623c);
      for (const side of [-1,1]) piece(box,cx+side*d*.30,h*.5,front,.045,h,.05,0x835237,-side*.18);
    }
    for (const [cx,front,color,w] of [[-.81,.25,0x66665a,.53],[.19,-.83,0xd7cebe,.49],[.91,-.69,0x393e43,.53],
      ...[0x393e43,0x454b3c,0xb3b4a9,0x535248,0x393e43,0xd7cebe].map((color,i)=>[-2.48+i*.233,-.71,color,.26])]) {
      piece(cloth,cx,1.33,front,w,.86,.28,color);
      for(const s of [-1,1])piece(cloth,cx+s*w*.48,1.32,front,.16,.76,.16,color,s*.13);
    }
    piece(cloth,.19,1.90,-.83,.19,.28,.18,0xdfd7c8);
    piece(cloth,.91,1.94,-.69,.19,.27,.18,0xdfd7c8);
    for (const cx of [-2.62,-1.13,-.81]) piece(box,cx,.98,cx===-.81?.03:-.71,.038,1.86,.038,0xaf8951);
    piece(box,-1.875,1.886,-.71,1.57,.038,.038,0xaf8951);
    mountRetailDisplay(K,{root,fallback,source,batches,x,y,z});
  });
}
