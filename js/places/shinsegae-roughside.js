import {mountRetailDisplay} from './shinsegae-retail-display.js';
import {relief} from '../banpo_relief.js';

const source = new URL('../../assets/models/ssg-workwear-island/gallery.glb',import.meta.url);
const batches = ['RoughSideGangnamJoinery','RoughSideGangnamTailoring','RoughSideGangnamHardware'];

export function registerRoughSide(K,{x,y,z,yaw,poly}) {
  K.detail({floor:'7F',y0:y,y1:y+4.8,poly,name:'러프사이드 의류와 석재 격자 진열'}, () => {
    const T=K.THREE, root=new T.Group(), fallback=new T.Group();
    root.position.set(x,y+relief(x,z),z);
    root.rotation.y=yaw;
    root.add(fallback);
    const box=new T.BoxGeometry(), oval=new T.SphereGeometry(.5,10,6), colors=new Map();
    function piece(shape,x,y,z,w,h,d,color,angle=0) {
      if (!colors.has(color)) colors.set(color,new T.MeshStandardMaterial({color}));
      const mesh=new T.Mesh(shape,colors.get(color));
      mesh.position.set(x,y,z);
      mesh.scale.set(w,h,d);
      mesh.rotation.z=angle;
      fallback.add(mesh);
    }
    piece(box,0,1.24,-1.68,3.08,2.55,.32,0x715442);
    piece(box,-.10,1.25,-1.50,2.39,2.10,.08,0xeee8da);
    for (let i=0;i<4;i++) for (let j=0;j<4;j++)
      piece(box,-.901+i*.534,.588+j*.534,-1.45,.26,.26,.01,0x65574a);
    piece(box,1.47,1.42,-.61,.53,2.77,.63,0xc0b39c);
    piece(box,.60,.14,.31,1.42,.22,.52,0x735e50);
    piece(box,.60,.28,.31,1.72,.06,.62,0xd8c9ab);
    for (const xx of [-.06,1.26]) piece(box,xx,1.13,.27,.036,1.65,.036,0xb2a795);
    piece(box,.60,1.94,.27,1.32,.035,.035,0xb2a795);
    piece(box,-.91,.10,-.32,1.35,.16,.93,0x79503b);
    for (const [cx,cz,bottom,color] of [[-.91,-.32,1.10,0x454647],[.265,.555,1.16,0x454647],
      [.66,.27,1.16,0xb1a990],[.92,.27,1.16,0x686952]]) {
      const w=cx>.5?.25:.48;
      piece(oval,cx,bottom+.35,cz,w,.74,.25,color);
      for(const s of [-1,1]) piece(oval,cx+s*w*.54,bottom+.33,cz,.16,.62,.18,color,s*.13);
    }
    for(const [cx,cz,bottom,h,color] of [[-.91,-.32,.18,1.01,0x8c8775],[.265,.447,.45,.95,0x576e7e]])
      for(const s of [-1,1]) piece(oval,cx+s*.12,bottom+h/2,cz,.21,h,.22,color);
    mountRetailDisplay(K,{root,fallback,source,batches,x,y,z});
  });
}
