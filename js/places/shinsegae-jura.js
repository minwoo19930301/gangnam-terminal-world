import { mountRetailDisplay } from './shinsegae-retail-display.js';
import { relief } from '../banpo_relief.js';

const source = new URL('../../assets/models/ssg-coffee-tools/gallery.glb', import.meta.url);
const batches = ['Enamel','Steel','Wood','Light','Crystal'].map(finish => 'JuraBar'+finish);

export function registerJura(K, {poly,x,y,z,yaw}) {
  K.detail({floor:'9F',y0:y,y1:y+4.8,poly,name:'유라 전자동 커피 바'}, () => {
    const T=K.THREE, root=new T.Group(), fallback=new T.Group();
    root.position.set(x,y+relief(x,z),z);
    root.rotation.y=yaw;
    root.add(fallback);
    const geometry=new T.BoxGeometry(), materials=new Map();
    function block(a,b,h,w,d,height,color) {
      if (!materials.has(color)) materials.set(color,new T.MeshStandardMaterial({color}));
      const part=new T.Mesh(geometry,materials.get(color));
      part.position.set(a,h+height/2,b);
      part.scale.set(w,height,d);
      fallback.add(part);
    }
    block(-.89,0,0,2.68,.76,.95,0xd7bd98);
    block(1.75,0,0,.96,.76,.95,0xd7bd98);
    block(0,0,.86,4.52,.82,.15,0x966341);
    for(const a of [-1.48,.15,1.46]) {
      block(a,-.54,1.01,a< -1 ? 1.6 : 1.10,.16,1.55,0xd4bb98);
      block(a,-.45,1.19,a< -1 ? 1.32 : .90,.03,.77,0xfff0d7);
    }
    for(const [a,w,h,color] of [[-1.26,.32,.415,0x232425],[-.37,.22,.323,0xf3f1e9],[.48,.22,.323,0x363739],[1.42,.32,.415,0x29292b]]) {
      block(a,-.045,1.01,w,.34,h,color);
      block(a,.10,1.01,w,.19,.044,0xbabdc0);
      block(a,.15,1.01+h*.48,w*.50,.09,.07,0xbec1c1);
    }
    mountRetailDisplay(K,{root,fallback,source,batches,x,y,z});
  });
}
