import {mountRetailDisplay} from './shinsegae-retail-display.js';
import {relief} from '../banpo_relief.js';

const source = new URL('../../assets/models/ssg-smart-desk/gallery.glb', import.meta.url);
const batches = ['FrisbeeGangnamAluminium','FrisbeeGangnamFixtures','FrisbeeGangnamGraphics'];

export function registerFrisbee(K,{poly,x,y,z,yaw}) {
  K.detail({floor:'8F',y0:y,y1:y+4.8,poly,name:'프리스비 (애플) · Mac 체험대'},()=>{
    const T=K.THREE, root=new T.Group(), fallback=new T.Group();
    root.position.set(x,y+relief(x,z),z);
    root.rotation.y=yaw;
    root.add(fallback);
    const cube=new T.BoxGeometry(),materials=new Map();
    function box(x,y,z,w,h,d,color,tilt=0) {
      if(!materials.has(color)) materials.set(color,new T.MeshStandardMaterial({color}));
      const mesh=new T.Mesh(cube,materials.get(color));
      mesh.position.set(x,y,z);mesh.scale.set(w,h,d);mesh.rotation.x=tilt;
      fallback.add(mesh);
    }
    for(const [cx,cz,w] of [[0,0,2.16],[-2.84,-1.45,2.14]]) {
      box(cx,.854,cz,w,.09,1.13,0xeeeae5);
      box(cx,.899,cz,w-.035,.008,1.10,0xe2cbb0);
      for(const side of [-1,1]) for(const end of [-1,1])
        box(cx+side*(w/2-.06),.41,cz+end*.50,.10,.82,.10,0xeeeae5);
    }
    for(const [i,cx] of [-.72,-.05,.64].entries()){
      box(cx,.914,.19,.32,.021,.22,0xb5b4b3);
      box(cx,1.017,.064,.32,.20,.01,0x35303c,-.32);
      box(cx,1.018,.071,.31,.186,.006,[0x7d56ab,0x634987,0xe7a54b][i],-.32);
    }
    for(const cx of [-3.37,-2.46]){
      box(cx,1.00,-1.40,.10,.20,.10,0x97aeb4);
      box(cx,1.18,-1.40,.54,.32,.025,0xabc5ce);
    }
    for(const mid of [-2.80,2.80]){
      box(mid,1.39,-4.38,2.50,2.58,.14,0xded9d2);
      for(const h of [.73,1.16,1.59,2.02]) box(mid,h,-4.215,2.36,.038,.31,0xeeeae5);
    }
    box(0,.39,-4.08,2.86,.74,.55,0xeeeae5);
    box(0,1.73,-4.27,2.88,1.60,.057,0xe7e3dc);
    mountRetailDisplay(K,{root,fallback,source,batches,x,y,z});
  });
}
