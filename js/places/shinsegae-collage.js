import {mountRetailDisplay} from './shinsegae-retail-display.js';
import {relief} from '../banpo_relief.js';

const source=new URL('../../assets/models/ssg-western-dining/gallery.glb',import.meta.url);
const batches=['CollageDining','CollageGlaze','CollageMetal','CollageBotanical','CollageHamburg'];

export function registerCollage(K,{poly,x,y,z,yaw}){
  K.detail({floor:'11F',poly,y0:y,y1:y+4.8,name:'꼴라주 함박스테이크와 부스 좌석'},()=>{
    const T=K.THREE,root=new T.Group(),fallback=new T.Group();
    root.position.set(x,y+relief(x,z),z);
    root.rotation.y=yaw;
    root.add(fallback);
    const cube=new T.BoxGeometry(),disc=new T.CylinderGeometry(.5,.48,1,20);
    const materials=new Map();
    function part(geo,px,py,pz,w,h,d,color){
      if(!materials.has(color))materials.set(color,new T.MeshStandardMaterial({color}));
      const mesh=new T.Mesh(geo,materials.get(color));
      mesh.position.set(px,py+h/2,pz);mesh.scale.set(w,h,d);fallback.add(mesh);
    }
    part(cube,0,.74,0,1.19,.05,.84,0xc6c8a8);
    part(disc,0,.03,0,.11,.71,.11,0x37332e);
    part(disc,0,0,0,.60,.04,.60,0x37332e);
    part(cube,0,.05,-.75,1.54,.39,.52,0x513426);
    part(cube,0,.44,-.70,1.55,.05,.57,0x758160);
    part(cube,0,.46,-.95,1.61,.74,.12,0x576d4f);
    part(cube,0,1.32,-1,1.54,.037,.037,0xb7a16f);
    part(disc,-.28,.425,.68,.41,.076,.41,0x423c2e);
    for(const offset of [-.16,.16])
      part(cube,-.28+offset,.46,.84,.028,.39,.028,0x322c25);
    part(cube,-.28,.83,.86,.34,.045,.035,0x322c25);
    part(disc,-.145,.79,.09,.39,.05,.31,0x413329);
    part(disc,-.145,.84,.09,.32,.045,.22,0xb0a498);
    part(disc,-.16,.88,.09,.16,.05,.13,0x83462a);
    part(disc,.181,.79,-.13,.328,.022,.328,0xfaf8ef);
    part(disc,.181,.812,-.13,.16,.032,.14,0xe9b960);
    part(cube,0,.08,-1.91,2.94,2.67,.05,0xe6ddce);
    part(cube,0,2.64,-1.84,2.95,.165,.13,0xad7958);
    mountRetailDisplay(K,{root,fallback,source,batches,x,y,z});
  });
}
