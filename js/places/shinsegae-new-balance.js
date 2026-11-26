import {mountRetailDisplay} from './shinsegae-retail-display.js';
import {relief} from '../banpo_relief.js';

const source=new URL('../../assets/models/ssg-specialty-sports/gallery.glb',import.meta.url);
const batches=['NBMegaGangnamFixtures','NBMegaGangnamHardware','NBMegaGangnamFootwear','NBMegaGangnamKnit'];

export function registerNewBalance(K,{poly,x,y,z,yaw}) {
  K.detail({floor:'8F',y0:y,y1:y+4.8,poly,name:'뉴발란스 메가숍 · 러닝화 전시'},()=>{
    const T=K.THREE, root=new T.Group(), fallback=new T.Group();
    root.position.set(x,y+relief(x,z),z);
    root.rotation.y=yaw;
    root.add(fallback);
    const block=new T.BoxGeometry(),oval=new T.SphereGeometry(.5,10,8);
    const colors=new Map();
    function piece(geometry,px,py,pz,w,h,d,color) {
      if(!colors.has(color)) colors.set(color,new T.MeshStandardMaterial({color}));
      const mesh=new T.Mesh(geometry,colors.get(color));
      mesh.position.set(px,py,pz);mesh.scale.set(w,h,d);fallback.add(mesh);
    }
    piece(block,0,1.32,-2.58,5.25,2.54,.11,0xf1e5ce);
    piece(block,0,2.775,-2.54,5.26,.35,.23,0x212325);
    for(let i=-2;i<=2;i++)for(let j=0;j<3;j++){
      piece(block,i*1.05,.705+j*.48,-2.38,.85,.03,.29,0xf5f2e7);
      piece(oval,i*1.05-.16,.76+j*.48,-2.35,.3,.10,.12,0x9a9a98);
    }
    piece(block,1.21,.083,.12,2.18,.15,1.23,0xc1a47f);
    for(const [px,base,shirt,shorts] of [[.70,.384,0x879eaa,0x777b80],[1.65,.724,0xdbab37,0xedebe0]]){
      piece(block,px,(base+.16)/2,.12,.62,base-.16,.61,0xf3efe2);
      for(const sign of [-1,1]){
        piece(oval,px+sign*.13,base+.38,.12,.14,.71,.16,0xecece8);
        piece(oval,px+sign*.10,base+.79,.12,.23,.28,.26,shorts);
      }
      piece(oval,px,base+1.15,.12,.47,.56,.27,shirt);
      piece(oval,px,base+1.62,.12,.18,.27,.20,0xecece8);
    }
    piece(block,-.48,.46,.93,.67,.89,.53,0xbda078);
    piece(oval,-.48,.956,.95,.31,.11,.11,0x929599);
    for(let i=0;i<8;i++)piece(block,-2.20+i*.149,1.19,-.05,.14,.55,.38,
      [0xdf713a,0xfaead2,0xedebe0,0x879eaa,0xe8c7cc][i%5]);
    mountRetailDisplay(K,{root,fallback,source,batches,x,y,z});
  });
}
