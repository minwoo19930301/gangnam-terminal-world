import {relief} from '../banpo_relief.js';
import {mountRetailDisplay} from './shinsegae-retail-display.js';

const source = new URL('../../assets/models/ssg-silver-table/gallery.glb', import.meta.url);
const batches = ['ChristofleMoodSilver', 'ChristofleFurniture'];

export function registerChristofle(K, {poly, x, y, z, yaw}) {
  K.detail({floor:'9F', y0:y, y1:y+4.8, poly, name:'크리스토플 무드 실버웨어'}, () => {
    const T = K.THREE, root = new T.Group(), fallback = new T.Group();
    root.position.set(x, y + relief(x,z), z);
    root.rotation.y = yaw;
    root.add(fallback);
    const cube = new T.BoxGeometry(), oval = new T.SphereGeometry(.5, 10, 8);
    const wood = new T.MeshStandardMaterial({color:0x99734d});
    const olive = new T.MeshStandardMaterial({color:0x77734d});
    const silver = new T.MeshStandardMaterial({color:0xd6d8d6});
    function part(geometry, mat, px, py, pz, w, h, d) {
      const mesh = new T.Mesh(geometry, mat);
      mesh.position.set(px,py,pz);
      mesh.scale.set(w,h,d);
      fallback.add(mesh);
    }
    part(cube,wood,0,.295,-.08,2.76,.59,.48);
    part(cube,olive,0,1.36,-.285,2.76,1.60,.045);
    for (const [height,depth] of [[.60,.48],[1.05,.72],[1.62,.43],[2.12,.43]]) {
      part(cube,wood,0,height-.016,depth/2-.27,2.8,.033,depth);
    }
    for (const [side,height] of [[-.19,1.05],[.20,1.05],[-.27,1.62],[-.01,1.62]]) {
      part(oval,silver,side,height+.15,.18,.20,.30,.20);
    }
    mountRetailDisplay(K,{root,fallback,source,batches,x,y,z});
  });
}
