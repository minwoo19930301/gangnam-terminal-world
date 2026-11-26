import { relief } from '../banpo_relief.js';
import { mountRetailDisplay } from './shinsegae-retail-display.js';

const source = new URL('../../assets/models/ssg-golf-apparel/gallery.glb', import.meta.url);
const batches = ['BossGolfGangnamTextiles','BossGolfGangnamFixtures','BossGolfGangnamDiffuser'];

export function registerBossGolf(K,{poly,x,y,z,yaw}) {
  K.detail({floor:'7F',y0:y,y1:y+4.8,poly,name:'보스골프 의류와 바이저'},() => {
    const T=K.THREE, root=new T.Group(), fallback=new T.Group();
    root.position.set(x,y+relief(x,z),z);
    root.rotation.y=yaw;
    root.add(fallback);
    const cube=new T.BoxGeometry(), sphere=new T.SphereGeometry(1,10,6), materials=new Map();
    function part(px,py,pz,w,h,d,color,geometry=cube) {
      if (!materials.has(color)) materials.set(color,new T.MeshStandardMaterial({color}));
      const mesh=new T.Mesh(geometry,materials.get(color));
      mesh.scale.set(w,h,d);
      mesh.position.set(px,py,pz);
      fallback.add(mesh);
    }
    part(0,2.846,.77,5.35,.12,1.94,0xfff9e8);
    part(0,1.415,-.205,5.35,2.75,.12,0xe8dfcb);
    part(-.91,1.34,-.08,.8,2.42,.03,0xa9b5b2);
    part(1.46,1.47,.055,1.32,.035,.39,0xfcfaf1);
    for (const [cx,cz,width,count] of [[-.71,1.06,1.91,7],[-1.99,.22,.96,3]]) {
      part(cx,.065,cz,width,.08,.49,0xbeb59c);
      part(cx,1.58,cz,width,.03,.03,0xbeb59c);
      for(const s of [-1,1]) part(cx+s*(width/2-.056),.82,cz,.028,1.49,.032,0xbeb59c);
      for(let i=0;i<count;i++) {
        const color=i<count/2 ? (count===3?0xb88a5c:0xf5f1e8) : 0x202122;
        part(cx+(i/(count-1)-.5)*(width-.4),1.22,cz,.12,.28,.17,color,sphere);
      }
    }
    part(1.12,.031,1.18,.66,.061,.61,0xd6d2c4);
    for(const side of [-1,1]) part(1.12+side*.09,.41,1.18,.05,.35,.055,0xd9cbb0,sphere);
    part(1.12,.88,1.18,.23,.25,.15,0xf8f6f0,sphere);
    part(1.12,1.3,1.18,.20,.27,.13,0xf8f6f0,sphere);
    part(1.12,1.73,1.18,.095,.13,.097,0xd9cbb0,sphere);
    part(1.12,1.77,1.24,.106,.027,.13,0x202122,sphere);
    mountRetailDisplay(K,{root,fallback,source,batches,x,y,z});
  });
}
