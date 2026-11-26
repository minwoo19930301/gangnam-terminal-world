import {mountRetailDisplay} from './shinsegae-retail-display.js';
import {relief} from '../banpo_relief.js';

const source = new URL('../../assets/models/ssg-gentle-espresso/gallery.glb',import.meta.url);
const batches = ['HaoMeal','HaoGlaze'];

export function registerHaoSum(K,{poly,x,y,z,yaw}) {
  K.detail({floor:'11F',y0:y,y1:y+4.8,poly,name:'살롱드호우섬 딤섬 상차림'},()=>{
    const T=K.THREE, root=new T.Group(), fallback=new T.Group();
    root.position.set(x,y+relief(x,z),z);
    root.rotation.y=yaw;
    root.add(fallback);
    const cube=new T.BoxGeometry(), disc=new T.CylinderGeometry(1,.90,1,20);
    const materials=new Map();
    function part(geometry,px,py,pz,w,h,d,color){
      if(!materials.has(color))materials.set(color,new T.MeshStandardMaterial({color}));
      const mesh=new T.Mesh(geometry,materials.get(color));
      mesh.position.set(px,py+h/2,pz);
      mesh.scale.set(w,h,d);
      fallback.add(mesh);
    }
    part(cube,0,.72,0,1.30,.08,.91,0xe8ddc8);
    for(const a of [-.53,.53])for(const b of [-.33,.33])
      part(cube,a,0,b,.058,.72,.058,0x573c31);
    for(const b of [-.19,.17]){
      part(disc,-.27,.80,b,.15,.085,.15,0xd1a470);
      for(let i=0;i<3;i++)part(disc,-.27+.065*Math.cos(i*2.094),.885,b+.065*Math.sin(i*2.094),.036,.023,.033,b>0?0x282831:0xe6c780);
    }
    part(disc,.15,.80,-.06,.16,.12,.16,0x553322);
    part(disc,.15,.92,-.06,.14,.004,.14,0xb77442);
    for(const a of [-1.48,-.90])for(const b of [-.36,0])
      part(cube,a,.06,b,.027,.77,.027,0x343a35);
    for(const h of [.17,.49,.79])part(cube,-1.19,h,-.18,.63,.032,.40,0x573c31);
    part(disc,-1.32,.823,-.18,.117,.05,.117,0xfaf4e4);
    mountRetailDisplay(K,{root,fallback,source,batches,x,y,z});
  });
}
