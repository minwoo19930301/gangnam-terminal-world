import { mountRetailDisplay } from './shinsegae-retail-display.js';
import { relief } from '../banpo_relief.js';

const source = new URL('../../assets/models/ssg-eyewear/gallery.glb', import.meta.url);
const batches = ['CollectGangnamOak', 'CollectGangnamInterior', 'CollectGangnamFrames', 'CollectGangnamGlass', 'CollectGangnamFinish'];

export function registerCollect(K, {x, y, z, yaw, poly}) {
  const cases = [[0, .12, 8, .56, 2.95], [-.62, 1.26, 2.29, .74, 1.10],
    [-1.97, .23, 1.15, .6, .915], [1.98, .23, 1.15, .6, .915]];
  for (const [side, front, w, d, h] of cases) {
    K.box({x:x+side*Math.cos(yaw)+front*Math.sin(yaw), y,
      z:z-side*Math.sin(yaw)+front*Math.cos(yaw), w,d,h,rotY:yaw,
      skip:['top','bottom','n','s','e','w']});
  }
  K.detail({floor:'6F', y0:y, y1:y+4.8, poly, name:'콜렉트 안경'}, () => {
    const T=K.THREE, root=new T.Group(), fallback=new T.Group();
    root.position.set(x,y+relief(x,z),z);
    root.rotation.y=yaw;
    root.add(fallback);
    const box=new T.BoxGeometry(), colors=new Map();
    function plate(x,y,z,w,h,d,color) {
      if (!colors.has(color)) colors.set(color,new T.MeshStandardMaterial({color}));
      const p=new T.Mesh(box,colors.get(color));
      p.position.set(x,y,z);
      p.scale.set(w,h,d);
      fallback.add(p);
    }
    plate(0,1.5,-.14,8,2.93,.10,0xc29a73);
    plate(0,1.35,-.055,2.42,1.65,.05,0xd58956);
    for (const x of [-3.35,-.61,.61,3.35]) {
      for (const height of [.86,1.35,1.81]) {
        plate(x,height,.10,1.18,.035,.39,0xe8bc92);
      }
    }
    for (const x of [-1.97,1.98]) plate(x,1.4,.08,.50,1.42,.06,0x9c9388);
    plate(-.62,.55,1.26,2.29,.61,.73,0xbb9068);
    plate(-.62,.86,1.26,2.29,.04,.74,0xd18c5d);
    plate(-1.367,1.08,1.07,.57,.33,.03,0x823f40);
    mountRetailDisplay(K,{root,fallback,source,batches,x,y,z});
  });
}
