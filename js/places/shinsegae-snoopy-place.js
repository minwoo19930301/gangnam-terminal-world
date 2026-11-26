import { mountRetailDisplay } from './shinsegae-retail-display.js';
import { relief } from '../banpo_relief.js';

const source = new URL('../../assets/models/ssg-keyboard-room/snoopy-place.glb', import.meta.url);
const batches = ['GangnamSnoopyPlaceDoghouseAndGoods', 'GangnamSnoopyPlaceMosaic'];

export function registerSnoopyPlace(K,{poly,x,y,z,yaw}) {
  K.detail({floor:'10F',y0:y,y1:y+4.8,poly,name:'스누피 플레이스 굿즈 매장'}, () => {
    const T=K.THREE,root=new T.Group(),fallback=new T.Group();
    root.position.set(x,y+relief(x,z),z);
    root.rotation.y=yaw;
    root.add(fallback);
    const box=new T.BoxGeometry(),oval=new T.SphereGeometry(.5,12,8);
    const colors=new Map();
    function add(geometry,cx,cy,cz,w,h,d,color,tilt=0) {
      if(!colors.has(color))colors.set(color,new T.MeshStandardMaterial({color}));
      const mesh=new T.Mesh(geometry,colors.get(color));
      mesh.position.set(cx,cy,cz);
      mesh.scale.set(w,h,d);
      mesh.rotation.x=tilt;
      fallback.add(mesh);
    }
    add(box,-1.49,.48,0,1.92,.92,1.11,0xd83439);
    for (const side of [-1,1]) add(box,-1.49,1.31,side*.36,2.19,.075,1.08,0xe03940,side*.85);
    add(oval,-1.81,2.07,0,.56,.73,.50,0xfff9e9);
    add(oval,-1.76,2.49,0,.13,.10,.13,0x242128);
    add(oval,-1.85,1.67,.246,.15,.46,.088,0x242128);
    add(oval,-1.21,1.89,0,.92,.37,.36,0xfff9e9);
    add(oval,-.68,2.00,0,.24,.45,.35,0xfff9e9);
    const pivot=new T.Vector3(-1.49,0,0),up=new T.Vector3(0,1,0);
    for(const mesh of fallback.children) {
      mesh.position.sub(pivot).applyAxisAngle(up,-.34).add(pivot);
      mesh.rotateOnWorldAxis(up,-.34);
    }
    for(const [cz,h] of [[.46,.48],[.04,.79],[-.38,1.10]])
      add(box,1.57,h/2,cz,2.27,h,.423,0x50b6df);
    add(box,0,1.43,-2.61,7.87,2.82,.12,0xe8d7ba);
    for(const h of [.52,1.04,1.66,2.37])add(box,0,h,-2.28,7.52,.053,.55,0x373438);
    mountRetailDisplay(K,{root,fallback,source,batches,x,y,z});
  });
}
