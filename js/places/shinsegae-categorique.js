import {mountRetailDisplay} from './shinsegae-retail-display.js';
import {relief} from '../banpo_relief.js';

const source=new URL('../../assets/models/ssg-family-cafe/gallery.glb',import.meta.url);
const batches=['CategoriqueBrewingBar','CategoriqueAsh','CategoriqueMetal','CategoriqueGlaze','CategoriqueGlass','CategoriqueLight'];

export function registerCategorique(K,{poly,x,y,z,yaw}){
  K.detail({floor:'11F',poly,y0:y,y1:y+4.8,name:'카테고릭 브루잉 바'},()=>{
    const T=K.THREE,root=new T.Group(),fallback=new T.Group();
    root.position.set(x,y+relief(x,z),z);
    root.rotation.y=yaw;
    root.add(fallback);
    const box=new T.BoxGeometry(),round=new T.CylinderGeometry(.44,.5,1,20);
    const colors=new Map();
    function part(geometry,a,h,b,w,height,d,color){
      if(!colors.has(color))colors.set(color,new T.MeshStandardMaterial({color}));
      const obj=new T.Mesh(geometry,colors.get(color));
      obj.position.set(a,h+height/2,b);
      obj.scale.set(w,height,d);
      fallback.add(obj);
    }
    part(box,0,.05,-.08,4.14,.93,1.18,0x292923);
    part(box,0,.98,.38,4.34,.077,.54,0xba8045);
    for(const side of [-1,1]){
      part(box,2.02*side,.98,-.36,.34,.077,.86,0xba8045);
      part(round,1.62*side,2.06,.18,.36,.25,.36,0x272923);
      part(box,.19+.43*side,.98,-.04,.04,.46,.21,0xb9b8ad);
      part(box,1.80*side,.66,.89,.46,.105,.44,0x5b5845);
    }
    part(box,.19,1.33,-.04,.90,.13,.21,0xb9b8ad);
    for(let i=-2;i<=2;i++)part(round,.19+i*.16,1.14,-.04,.115,.09,.115,0xbab6aa);
    part(round,0,2.23,-.18,1.02,.33,1.02,0xb9b8ad);
    part(box,0,0,-.90,4.43,2.93,.065,0xb6b1a1);
    part(box,0,2.44,-.84,4.44,.49,.08,0x272923);
    mountRetailDisplay(K,{root,fallback,source,batches,x,y,z});
  });
}
