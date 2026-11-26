import {mountRetailDisplay} from './shinsegae-retail-display.js';
import {relief} from '../banpo_relief.js';

const source = new URL('../../assets/models/ssg-audio/gallery.glb', import.meta.url);
const batches = ['SchezadeDisplay', 'SchezadeHeadphones'];

export function registerAudio(K, {poly,x,y,z,yaw}) {
  K.detail({floor:'9F',y0:y,y1:y+4.8,poly,name:'셰에라자드 헤드폰 청음대'}, () => {
    const T=K.THREE, root=new T.Group(), fallback=new T.Group();
    root.position.set(x,y+relief(x,z),z);
    root.rotation.y=yaw;
    root.add(fallback);
    const cube=new T.BoxGeometry(), colors=new Map();
    function part(geometry,color,px,py,pz,w,h,d) {
      if (!colors.has(color)) colors.set(color,new T.MeshStandardMaterial({color}));
      const mesh=new T.Mesh(geometry,colors.get(color));
      mesh.position.set(px,py,pz);
      mesh.scale.set(w,h,d);
      fallback.add(mesh);
    }
    part(cube,0x795235,0,.47,0,2.34,.94,.83);
    part(cube,0xdbccb4,0,1.565,-.27,2.34,1.22,.08);
    part(cube,0x795235,0,2.152,-.24,2.35,.135,.09);
    part(cube,0xe4d8c1,0,.935,.02,2.40,.05,.94);
    const band=new T.TorusGeometry(.084,.012,5,12,Math.PI);
    const cup=new T.SphereGeometry(1,8,6);
    for (const px of [-.83,-.52,-.15,.15,.52,.83]) {
      for (const py of [1.34,1.875]) {
        const c=px===-.15||px===.52?0xe7ddcb:0x303030;
        part(band,c,px,py,-.114,1,1,1);
        for (const sign of [-1,1]) part(cup,c,px+sign*.084,py-.04,-.114,.025,.054,.048);
      }
    }
    mountRetailDisplay(K,{root,fallback,source,batches,x,y,z});
  });
}
