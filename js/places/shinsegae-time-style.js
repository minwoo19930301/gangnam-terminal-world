import {mountRetailDisplay} from './shinsegae-retail-display.js';
import {relief} from '../banpo_relief.js';

const source = new URL('../../assets/models/ssg-japanese-design/dining.glb', import.meta.url);
const batches = ['TimeStyleOak','TimeStyleLinen','TimeStyleObjects','TimeStyleSpacecraft','TimeStyleStone'];

export function registerTimeStyle(K, {poly,x,y,z,yaw}) {
  K.detail({floor:'9F',y0:y,y1:y+4.8,poly,name:'타임앤스타일 원목 식탁과 화지 조명'}, () => {
    const T=K.THREE, root=new T.Group(), fallback=new T.Group();
    root.position.set(x,y+relief(x,z),z);
    root.rotation.y=yaw;
    root.add(fallback);
    const cube=new T.BoxGeometry(), round=new T.CylinderGeometry(1,1,1,16);
    const wood=new T.MeshStandardMaterial({color:0xc19868});
    const shade=new T.MeshStandardMaterial({color:0xffe1b5});
    function part(geometry,side,back,bottom,w,h,d,material=wood) {
      const mesh=new T.Mesh(geometry,material);
      mesh.position.set(side,bottom+h/2,-back);
      mesh.scale.set(w,h,d);
      fallback.add(mesh);
    }
    part(round,0,0,.715,1.32,.046,.57);
    for(const side of [-.98,.98])for(const back of [-.31,.31])
      part(cube,side,back,.02,.075,.70,.075);
    for(const side of [-.62,.62])for(const back of [-.69,.69]){
      part(cube,side,back,.40,.46,.055,.44);
      part(cube,side,back*1.30,.46,.43,.35,.035);
    }
    part(round,0,0,1.86,.42,.22,.42,shade);
    part(round,0,0,2.08,.20,.13,.20,shade);
    part(cube,0,0,2.21,.009,1.6,.009);
    for(const bottom of [.04,.47,.93,1.36,1.8,2.14])
      part(cube,0,2.85,bottom,3.2,.03,.34);
    for(let i=0;i<6;i++)part(cube,-1.58+i*.632,2.85,.04,.035,2.1,.34);
    mountRetailDisplay(K,{root,fallback,source,batches,x,y,z});
  });
}
