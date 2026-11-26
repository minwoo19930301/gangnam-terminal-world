import { mountRetailDisplay } from './shinsegae-retail-display.js';
import { relief } from '../banpo_relief.js';

const source = new URL('../../assets/models/ssg-gatevision-appliances/boutique.glb', import.meta.url);
const batches = ['GatevisionLR4Cabinet','GatevisionLR4Shell','GatevisionLR4Liner'];

export function registerGatevision(K,{poly,x,y,z,yaw}) {
  K.detail({floor:'9F',y0:y,y1:y+4.8,poly,name:'로라스타 · 리터로봇 시연대'}, () => {
    const T=K.THREE, root=new T.Group(), fallback=new T.Group();
    root.position.set(x,y+relief(x,z),z);
    root.rotation.y=yaw;
    root.add(fallback);
    const cube=new T.BoxGeometry(), globe=new T.SphereGeometry(.5,16,12);
    const colors=new Map();
    function part(geometry,color,px,py,pz,w,h,d) {
      if (!colors.has(color)) colors.set(color,new T.MeshStandardMaterial({color}));
      const mesh=new T.Mesh(geometry,colors.get(color));
      mesh.scale.set(w,h,d);
      mesh.position.set(px,py,pz);
      fallback.add(mesh);
    }
    part(cube,0xe8e5dc,0,.26,0,1.95,.50,.87);
    part(cube,0xeeeae1,0,.74,-.81,2.17,1.48,.075);
    for (const [px,color] of [[-.578,0x292b2c],[.047,0xf0eee7]]) {
      part(cube,color,px,.665,0,.40,.27,.46);
      part(globe,color,px,.98,0,.55,.57,.59);
      part(globe,0x343537,px,.98,.234,.41,.42,.13);
      part(cube,0x323333,px,.694,.23,.30,.045,.20);
    }
    part(cube,0xe9e8e0,.682,.834,-.113,.346,.586,.085);
    part(cube,0x355b70,.682,.845,-.063,.269,.453,.008);
    mountRetailDisplay(K,{root,fallback,source,batches,x,y,z});
  });
}
