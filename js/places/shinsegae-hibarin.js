import {mountRetailDisplay} from './shinsegae-retail-display.js';
import {relief} from '../banpo_relief.js';

const source = new URL('../../assets/models/ssg-naengmyeon/gallery.glb',import.meta.url);
const batches = ['HibarinGangnamSampler','HibarinGangnamGlaze'];

export function registerHibarin(K,{poly,x,y,z,yaw}) {
  K.detail({floor:'11F',y0:y,y1:y+4.8,poly,name:'히바린 시그니처 샘플러'},()=>{
    const T=K.THREE, root=new T.Group(), fallback=new T.Group();
    root.position.set(x,y+relief(x,z),z);
    root.rotation.y=yaw;
    root.add(fallback);
    const cube=new T.BoxGeometry(), bowl=new T.CylinderGeometry(1,.50,1,16);
    const materials=new Map();
    function part(shape,px,py,pz,w,h,d,color) {
      if(!materials.has(color))materials.set(color,new T.MeshStandardMaterial({color}));
      const mesh=new T.Mesh(shape,materials.get(color));
      mesh.position.set(px,py+h/2,pz);
      mesh.scale.set(w,h,d);
      fallback.add(mesh);
    }
    part(cube,0,.735,0,.95,.035,1.16,0xab794d);
    for(const side of [-1,1]){
      for(const end of [-1,1])part(cube,side*.409,0,end*.502,.052,.735,.052,0x8b6344);
      part(cube,side*.69,.42,0,.43,.047,.44,0x7b695e);
      part(cube,side*.89,.47,0,.045,.35,.40,0x8b6344);
    }
    part(cube,-.026,.77,.227,.666,.012,.493,0xded9c8);
    part(cube,-.026,.782,.137,.61,.033,.214,0x252023);
    for(const dx of [-.20,0,.20])part(bowl,dx-.026,.808,.137,.064,.038,.072,0xd09a53);
    part(bowl,-.05,.782,.344,.093,.088,.093,0x252023);
    part(bowl,-.05,.869,.344,.081,.002,.081,0xb1844e);
    for(const [j,color] of [0x573b26,0xdfc7aa,0xc9a479,0x382c29].entries()){
      const px=(j-1.5)*.094;
      part(cube,px,.78,-.304,.079,.18,.072,color);
      part(cube,px,.96,-.304,.037,.089,.037,0x292527);
    }
    mountRetailDisplay(K,{root,fallback,source,batches,x,y,z});
  });
}
