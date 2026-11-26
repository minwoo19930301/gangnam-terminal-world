import {mountRetailDisplay} from './shinsegae-retail-display.js';
import {relief} from '../banpo_relief.js';

const source=new URL('../../assets/models/ssg-focal-gallery/gallery.glb',import.meta.url);
const batches=['GangnamLegoPuuvilla','GangnamLegoEditions','GangnamLegoCabinet','GangnamLegoCartons'];

export function registerLegoStore(K,{poly,x,y,z,yaw}) {
  K.detail({floor:'10F',y0:y,y1:y+4.8,poly,name:'레고스토어 푸빌라 전시'},()=>{
    const T=K.THREE, root=new T.Group(), fallback=new T.Group();
    root.position.set(x,y+relief(x,z),z);
    root.rotation.y=yaw;
    root.add(fallback);
    const cube=new T.BoxGeometry(), oval=new T.SphereGeometry(1,12,8);
    const finishes=new Map();
    function piece(geometry,px,py,pz,w,h,d,color) {
      if(!finishes.has(color)) finishes.set(color,new T.MeshStandardMaterial({color}));
      const part=new T.Mesh(geometry,finishes.get(color));
      part.position.set(px,py,pz);
      part.scale.set(w,h,d);
      fallback.add(part);
    }
    piece(cube,-.2,1.17,-1.45,2.54,2.34,.11,0xe9b92c);
    for(const h of [.13,.65,1.17,1.69,2.28]) piece(cube,-.2,h,-1.25,2.54,.075,.47,0xf8f5e8);
    for(const h of [.35,.87,1.39,1.91]) {
      for(const [i,c] of [0xe2c367,0x39465b,0x3d8695,0x34363b,0xe3bc5a].entries())
        piece(cube,-1.18+i*.46,h,-1.18,.38,.36,.15,c);
    }
    piece(cube,.77,.42,.065,.73,.84,.63,0xeee6d3);
    piece(oval,-.27,.61,.05,.43,.56,.34,0xf7f4e9);
    piece(oval,-.27,1.29,.11,.35,.30,.30,0xf7f4e9);
    piece(oval,-.27,1.06,.10,.31,.057,.275,0xc32533);
    piece(oval,-.27,1.56,.12,.19,.12,.17,0xeec237);
    for(const side of [-1,1]) {
      piece(oval,-.27+side*.25,1.51,.07,.078,.105,.068,0x242426);
      piece(oval,-.27+side*.39,.75,.09,.105,.27,.11,0xf7f4e9);
    }
    mountRetailDisplay(K,{root,fallback,source,batches,x,y,z});
  });
}
