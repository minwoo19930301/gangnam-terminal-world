import { mountRetailDisplay } from './shinsegae-retail-display.js';
import { relief } from '../banpo_relief.js';

const source = new URL('../../assets/models/ssg-kids-table/gallery.glb', import.meta.url);
const batches = ['ComfProStudyGallery', 'ComfProEnamel'];

export function registerComfPro(K, {poly,x,y,z,yaw}) {
  K.detail({floor:'10F',y0:y,y1:y+4.8,poly,name:'컴프프로 성장 책상'}, () => {
    const T=K.THREE, root=new T.Group(), fallback=new T.Group();
    root.position.set(x,y+relief(x,z),z);
    root.rotation.y=yaw;
    root.add(fallback);
    const box=new T.BoxGeometry(), materials=new Map();
    function piece(cx,cy,cz,w,h,d,color,tilt=0) {
      if (!materials.has(color)) materials.set(color,new T.MeshStandardMaterial({color}));
      const mesh=new T.Mesh(box,materials.get(color));
      mesh.scale.set(w,h,d);
      mesh.position.set(cx,cy,cz);
      mesh.rotation.x=tilt;
      fallback.add(mesh);
    }
    const white=0xe4e1d6;
    for(const [cx,cz,color] of [[-1.22,-.13,0xadbfc8],[.78,.04,0xe8a7bb]]) {
      piece(cx-.18,.82,cz+.06,1.01,.037,.53,color,.4);
      piece(cx,.72,cz-.28,1.41,.043,.25,white);
      piece(cx+.77,.34,cz,.37,.47,.44,white);
      for(const dx of [-.55,.55]) piece(cx+dx,.36,cz,.09,.65,.14,white);
      piece(cx-.22,.49,cz+.65,.46,.09,.44,color);
      piece(cx-.22,.76,cz+.83,.43,.43,.055,color);
    }
    for(const h of [.34,1.38]) piece(-1.06,h,-1.25,1.87,.16,.76,0x566d60);
    piece(.98,1.84,-1.50,1.72,.28,.03,0x566d60);
    mountRetailDisplay(K,{root,fallback,source,batches,x,y,z});
  });
}
