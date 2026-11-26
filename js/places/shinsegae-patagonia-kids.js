import {mountRetailDisplay} from './shinsegae-retail-display.js';
import {relief} from '../banpo_relief.js';

const source = new URL('../../assets/models/ssg-junior-outerwear/gallery.glb',import.meta.url);
const batches = ['PatagoniaKidsGangnamOuterwear','PatagoniaKidsGangnamWood','PatagoniaKidsGangnamFixtures'];

export function registerPatagoniaKids(K,{poly,x,y,z,yaw}) {
  K.detail({floor:'10F',y0:y,y1:y+4.8,poly,name:'파타고니아 키즈 다운 아우터 전시'}, () => {
    const T=K.THREE, root=new T.Group(), fallback=new T.Group();
    root.position.set(x,y+relief(x,z),z);
    root.rotation.y=yaw;
    root.add(fallback);
    const box=new T.BoxGeometry(), oval=new T.SphereGeometry(.5,12,8);
    const colors=new Map();
    function add(shape,cx,base,cz,w,h,d,color) {
      if (!colors.has(color)) colors.set(color,new T.MeshStandardMaterial({color}));
      const obj=new T.Mesh(shape,colors.get(color));
      obj.position.set(cx,base+h/2,cz); obj.scale.set(w,h,d);
      fallback.add(obj);
    }
    add(box,0,.03,-1.91,3.80,2.49,.11,0x935e3d);
    add(box,0,.04,-1.56,3.03,.91,.50,0x935e3d);
    add(box,0,.02,.15,2.98,.012,1.73,0xc85144);
    for (const h of [.07,.53]) add(box,-.10,h,.12,1.82,.045,.82,0x935e3d);
    for (const cx of [-.85,-.17,.64]) add(box,cx,.11,.12,.06,.42,.62,0x935e3d);
    add(box,-.68,.77,.12,.76,.045,.77,0x935e3d);
    function form(cx,cz,base,coat,collar) {
      for(const dx of [-.10,.10]) {
        add(oval,cx+dx,base,cz,.15,.61,.18,0xbc936c);
        add(oval,cx+dx*2.25,base+.54,cz,.13,.43,.16,collar);
      }
      add(oval,cx,base+.54,cz,.41,.52,.24,coat);
      add(oval,cx,base+1.04,cz,.18,.23,.18,0x292a2b);
      add(oval,cx,base+1.17,cz,.22,.13,.21,collar);
    }
    form(-.70,.09,.812,0xeaa9bd,0xeaa9bd);
    form(.95,.38,.027,0xd8a255,0x263855);
    add(box,-.37,.57,.23,.4,.20,.3,0xdf559f);
    add(box,.43,.57,.21,.4,.20,.3,0x83d2d1);
    add(oval,1.26,.84,-.84,.52,.54,.24,0x83d2d1);
    mountRetailDisplay(K,{root,fallback,source,batches,x,y,z});
  });
}
