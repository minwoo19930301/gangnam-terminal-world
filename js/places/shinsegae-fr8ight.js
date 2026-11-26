import { mountRetailDisplay } from './shinsegae-retail-display.js';
import { relief } from '../banpo_relief.js';

const source = new URL('../../assets/models/ssg-fr8ight/gallery.glb', import.meta.url);
const batches = ['FR8IGHTGangnamFixtures', 'FR8IGHTGangnamLeather', 'FR8IGHTGangnamBlackwatch'];

export function registerFr8ight(K, {x, y, z, yaw, poly}) {
  K.detail({floor:'7F', y0:y, y1:y+4.8, poly, name:'프레이트 아우터와 신발 진열'}, () => {
    const T=K.THREE, root=new T.Group(), fallback=new T.Group();
    root.position.set(x,y+relief(x,z),z);
    root.rotation.y=yaw;
    root.add(fallback);
    const box=new T.BoxGeometry(), cloth=new T.SphereGeometry(.5,10,6), materials=new Map();
    function add(geometry,x,y,z,w,h,d,color,tilt=0) {
      if (!materials.has(color)) materials.set(color,new T.MeshStandardMaterial({color}));
      const mesh=new T.Mesh(geometry,materials.get(color));
      mesh.position.set(x,y,z);
      mesh.scale.set(w,h,d);
      mesh.rotation.z=tilt;
      fallback.add(mesh);
    }
    add(box,0,1.32,-.88,2.36,2.4,.14,0xaaa69a);
    for (const cx of [-2.65,0,2.65]) {
      const width=cx===0?2.43:2.28, cz=cx===0?0:-.21;
      add(box,cx,.072,cz,width,.08,.62,0xbd8860);
      add(box,cx,1.97,cz,width,.036,.036,0x383938);
      for (const s of [-1,1]) add(box,cx+s*(width/2-.065),1.04,cz,.053,1.89,.072,0xaaa69a);
      const colors=cx===0?[0x333334,0x36453e]:[0x65788b,0xece8dc,0xc0b5a1,0x677278,0x998b72,0x25292d];
      colors.forEach((color,i)=>{
        const p=cx+(i-(colors.length-1)/2)*(cx===0?1:.3),w=cx===0?.49:.26;
        add(cloth,p,1.45,cz,w,.76,.20,color);
        for (const s of [-1,1]) add(cloth,p+s*w*.53,1.43,cz,.14,.65,.16,color,s*.14);
      });
    }
    add(box,1.39,.31,.98,1.40,.62,.69,0xdad6c8);
    add(box,1.39,.225,.98,1.415,.105,.70,0xa96c53);
    for(let i=0;i<4;i++) add(cloth,.90+i*.32,.685,.98,.12,.12,.28,0x677278);
    mountRetailDisplay(K,{root,fallback,source,batches,x,y,z});
  });
}
