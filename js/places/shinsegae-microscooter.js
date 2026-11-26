import {mountRetailDisplay} from './shinsegae-retail-display.js';
import {relief} from '../banpo_relief.js';

const source = new URL('../../assets/models/ssg-microscooter/gallery.glb', import.meta.url);
const batches = ['MicroGangnamScooters','MicroGangnamHardware','MicroGangnamFixtures'];

export function registerMicroScooter(K,{poly,x,y,z,yaw}) {
  K.detail({floor:'10F',y0:y,y1:y+4.8,poly,name:'마이크로 킥보드 삼륜 킥보드 전시'},()=>{
    const T=K.THREE, root=new T.Group(), fallback=new T.Group();
    root.position.set(x,y+relief(x,z),z);
    root.rotation.y=yaw;
    root.add(fallback);
    const cube=new T.BoxGeometry(), disc=new T.CylinderGeometry(1,1,1,32);
    const materials=new Map();
    function part(geometry,color,px,py,pz,w,h,d) {
      if (!materials.has(color)) materials.set(color,new T.MeshStandardMaterial({color}));
      const mesh=new T.Mesh(geometry,materials.get(color));
      mesh.position.set(px,py,pz);
      mesh.scale.set(w,h,d);
      fallback.add(mesh);
      return mesh;
    }
    part(disc,0xefebe0,0,.28,0,.735,.55,.735);
    part(disc,0x155e91,0,.32,0,.738,.045,.738);
    for(const [cx,tint] of [[-.31,0x17bac2],[.27,0x85aedd]]) {
      part(cube,tint,cx,.63,0,.43,.035,.11);
      for(const [wx,wz,r] of [[-.17,-.1,.06],[-.17,.1,.06],[.19,0,.04]]) {
        part(disc,0x63767a,cx+wx,.555+r,wz,r,.028,r).rotation.x=Math.PI/2;
      }
      part(disc,tint,cx-.16,.91,0,.017,.56,.017);
      part(cube,tint,cx-.16,1.20,0,.04,.033,.27);
    }
    part(cube,0xe9e4db,0,1.27,-1.94,4.05,2.52,.17);
    for(let i=0;i<6;i++) {
      const a=(28+i*60)*Math.PI/180;
      part(cube,[0xe85c82,0x75bfaf,0x313e43,0x447aca,0xad72aa,0xeab842][i],
        .345*Math.cos(a),1.47+.345*Math.sin(a),-1.72,.42,.11,.07).rotation.z=a;
    }
    mountRetailDisplay(K,{root,fallback,source,batches,x,y,z});
  });
}
