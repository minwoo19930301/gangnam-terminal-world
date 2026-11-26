import {mountRetailDisplay} from './shinsegae-retail-display.js';
import {relief} from '../banpo_relief.js';

const source = new URL('../../assets/models/ssg-swim/gallery.glb',import.meta.url);
const batches = ['BarrelGangnamDisplay','BarrelGangnamPET'];

export function registerBarrel(K,{poly,x,y,z,yaw}) {
  K.detail({floor:'8F',y0:y,y1:y+4.8,poly,name:'배럴 · 수상 스포츠 전시'},()=>{
    const T=K.THREE, root=new T.Group(), fallback=new T.Group();
    root.position.set(x,y+relief(x,z),z);
    root.rotation.y=yaw;
    root.add(fallback);
    const box=new T.BoxGeometry(), oval=new T.SphereGeometry(1,10,7);
    const palette=new Map();
    function piece(geom,px,py,pz,w,h,d,color) {
      if(!palette.has(color)) palette.set(color,new T.MeshStandardMaterial({color}));
      const mesh=new T.Mesh(geom,palette.get(color));
      mesh.position.set(px,py,pz);
      mesh.scale.set(w,h,d);
      fallback.add(mesh);
      return mesh;
    }
    piece(box,0,.075,.27,2.14,.15,.96,0x183d70);
    for(let i=0;i<17;i++){
      const t=(-104+i*198/16)*Math.PI/180;
      piece(oval,.27-1.13*Math.cos(t),1.32+1.16*Math.sin(t),.27,.12,.12,.37,
        i>10?0x99d5e5:0x3781a5);
    }
    for(const [px,s,base,shirt,shorts] of [[-2.45,1.02,.1,0xeae9df,0xf87a28],
      [.2,1,.30,0x202a32,0x152640],[2.37,.77,.1,0x152640,0x183d70]]) {
      for(const side of [-1,1]){
        piece(oval,px+side*.12*s,.37*s+base,.19,.067*s,.32*s,.06*s,0xe5e8e7);
        piece(oval,px+side*.11*s,.79*s+base,.19,.11*s,.18*s,.11*s,shorts);
      }
      piece(oval,px,1.22*s+base,.19,.21*s,.26*s,.13*s,shirt);
      piece(oval,px,1.65*s+base,.19,.10*s,.14*s,.10*s,0xe5e8e7);
      if(px!==.2) {
        piece(oval,px,1.65*s+base,.27,.09*s,.105*s,.05*s,0x304e68);
        piece(box,px,1.91*s+base,.19,.039*s,.18*s,.04*s,0x243b4d);
        piece(box,px,1.18,-.55,1.39,2.31,.09,0x87cddd);
      }
    }
    mountRetailDisplay(K,{root,fallback,source,batches,x,y,z});
  });
}
