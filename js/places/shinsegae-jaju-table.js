import {mountRetailDisplay} from './shinsegae-retail-display.js';
import {relief} from '../banpo_relief.js';

const source = new URL('../../assets/models/ssg-jaju-table/gallery.glb',import.meta.url);
const batches = ['JajuGangnamSetting','JajuGangnamNewMoonPorcelain','JajuGangnamManufactureRock',
  'JajuGangnamPolishedMetal','JajuGangnamStemware','JajuGangnamWovenLinen'];

export function registerJajuTable(K,{poly,x,y,z,yaw}) {
  K.detail({floor:'9F',y0:y,y1:y+4.8,poly,name:'자주 테이블 · 빌레로이앤보흐 상차림'},()=>{
    const T=K.THREE, root=new T.Group(), fallback=new T.Group();
    root.position.set(x,y+relief(x,z),z);
    root.rotation.y=yaw;
    root.add(fallback);
    const cube=new T.BoxGeometry(), disc=new T.CylinderGeometry(1,1,1,24);
    function piece(geometry,color,position,scale,tilt=0) {
      const item=new T.Mesh(geometry,new T.MeshStandardMaterial({color}));
      item.position.set(...position);
      item.scale.set(...scale);
      item.rotation.x=tilt;
      fallback.add(item);
    }
    piece(cube,0xf1e6d6,[0,.71,0],[1.77,.25,.92]);
    for(const x of [-.70,.70])for(const z of [-.32,.32])
      piece(cube,0x68503d,[x,.30,z],[.068,.60,.068]);
    piece(cube,0xe3d9c9,[.016,.89,-.249],[.36,.12,.25]);
    for(const [r,z] of [[.146,-.306],[.127,-.222],[.094,-.138]])
      piece(disc,0xfff7ec,[.016,.96+r,z],[r,.013,r],1.34);
    for(const x of [-.56,0,.56])
      piece(disc,x===0?0xfff7ec:0x393836,[x,.849,.22],[.15,.029,.15]);
    piece(cube,0x75452e,[0,.53,-2.02],[3.42,1.06,.70]);
    piece(cube,0xe1d2bd,[0,1.083,-2.02],[3.49,.095,.77]);
    piece(cube,0xb7a78d,[.44,1.42,-3.27],[3.2,2.84,.09]);
    mountRetailDisplay(K,{root,fallback,source,batches,x,y,z});
  });
}
