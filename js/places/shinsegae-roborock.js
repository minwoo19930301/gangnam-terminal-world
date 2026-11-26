import {mountRetailDisplay} from './shinsegae-retail-display.js';
import {relief} from '../banpo_relief.js';

const source = new URL('../../assets/models/ssg-robot-vacuum/gallery.glb', import.meta.url);
const batches = ['RoborockDisplay','RoborockOptics','RoborockOak'];

export function registerRoborock(K, {poly,x,y,z,yaw}) {
  K.detail({floor:'9F', y0:y, y1:y+4.8, poly, name:'로보락 청소기 시연대'}, () => {
    const T = K.THREE;
    const root = new T.Group(), fallback = new T.Group();
    root.position.set(x,y+relief(x,z),z);
    root.rotation.y = yaw;
    root.add(fallback);
    const cube = new T.BoxGeometry(), disk = new T.CylinderGeometry(.5,.5,1,20);
    const shell = new T.MeshStandardMaterial({color:0xe9e8e0});
    const wood = new T.MeshStandardMaterial({color:0xcaa87b});
    const rubber = new T.MeshStandardMaterial({color:0x292b30});
    function part(geometry, material, px,py,pz,w,h,d) {
      const o = new T.Mesh(geometry,material);
      o.position.set(px,py,pz);
      o.scale.set(w,h,d);
      fallback.add(o);
      return o;
    }
    part(cube,shell,0,.39,0,2.43,.72,.95);
    part(cube,wood,0,.755,0,2.40,.03,.93);
    part(cube,shell,0,.88,-.455,2.43,.285,.045);
    part(cube,rubber,.46,.99,-.145,.43,.4,.32);
    part(cube,shell,.46,1.12,-.145,.435,.3,.33);
    for (const [cx,cz] of [[.46,.14],[-.035,.13]]) {
      part(disk,shell,cx,.825,cz,.35,.09,.35);
      part(disk,shell,cx,.88,cz-.021,.095,.025,.095);
    }
    part(disk,rubber,-.59,.88,.12,.345,.07,.345).rotation.x=-.49;
    mountRetailDisplay(K,{root,fallback,source,batches,x,y,z});
  });
}
