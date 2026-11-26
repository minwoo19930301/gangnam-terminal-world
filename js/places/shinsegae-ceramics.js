import {mountRetailDisplay} from './shinsegae-retail-display.js';
import {relief} from '../banpo_relief.js';

const source = new URL('../../assets/models/ssg-ceramics/showroom.glb', import.meta.url);
const batches = ['KwangjuyoFixture','KwangjuyoBronze','KwangjuyoGlaze'];

export function registerKwangjuyo(K,{poly,x,y,z,yaw}) {
  K.detail({floor:'9F', y0:y, y1:y+4.8, poly, name:'광주요 도자 진열'}, () => {
    const T=K.THREE, root=new T.Group(), fallback=new T.Group();
    root.position.set(x,y+relief(x,z),z);
    root.rotation.y=yaw;
    root.add(fallback);
    const box=new T.BoxGeometry(), jar=new T.SphereGeometry(1,12,8);
    const bowl=new T.CylinderGeometry(1,.45,1,12);
    const finishes=new Map();
    function piece(geometry,color,a,h,f,w,height,d) {
      if(!finishes.has(color)) finishes.set(color,new T.MeshStandardMaterial({color}));
      const mesh=new T.Mesh(geometry,finishes.get(color));
      mesh.position.set(a,h,f);
      mesh.scale.set(w,height,d);
      fallback.add(mesh);
    }
    piece(box,0xb59c87,-.82,1.51,-.22,1.37,3,.15);
    for(const a of [-1.45,-.19]) piece(box,0xb59c87,a,1.50,0,.12,3,.40);
    for(const h of [1.14,1.55,1.97,2.42]) piece(box,0xb29879,-.82,h,0,1.15,.04,.35);
    piece(box,0x9f2d31,-.82,2.08,0,.60,.18,.22);
    for(const h of [.09,.60,.97]) piece(box,0xd7c4ad,-.6,h,.5,1.78,h<.2?.15:.04,.66);
    for(const a of [-1.42,.22]) piece(box,0x9d785d,a,.54,.76,.035,.86,.035);
    for(const a of [-1.04,-.59]) piece(jar,0xd5b5a5,a,.33,.52,.15,.17,.15);
    piece(box,0xe7d7c3,1.17,.45,.04,1.66,.83,.70);
    for(const h of [1.28,1.74]) piece(box,0xbba58e,1.17,h,.02,1.61,.045,.44);
    for(const a of [.40,1.94]) piece(box,0x9d785d,a,1.31,.20,.035,.92,.035);
    for(const a of [.64,1.14,1.67]) piece(bowl,0xe6e4d2,a,1.78,0,.12,.06,.12);
    mountRetailDisplay(K,{root,fallback,source,batches,x,y,z});
  });
}
