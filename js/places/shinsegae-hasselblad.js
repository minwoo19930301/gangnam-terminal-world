import {mountRetailDisplay} from './shinsegae-retail-display.js';
import {relief} from '../banpo_relief.js';

const source=new URL('../../assets/models/ssg-hassel-store/gallery.glb',import.meta.url);
const batches=['GangnamHasselbladCabinet','GangnamHasselbladMetalwork',
  'GangnamHasselbladOptics','GangnamHasselbladScreen'];

export function registerHasselblad(K,{poly,x,y,z,yaw}) {
  // Keep the display island and panel backing solid; all three customer sides are open.
  for (const [front,w,d,h] of [[0,1.60,.753,1.129],[-3.30,6.10,.18,3.265]]) {
    K.box({x:x+front*Math.sin(yaw),y,z:z+front*Math.cos(yaw),rotY:yaw,w,h,d,
      mat:0x454443,skip:['top','bottom','n','s','e','w']});
  }
  K.detail({floor:'6F',poly,y0:y,y1:y+4.8,name:'핫셀블라드 중형 카메라 시연대'},()=>{
    const T=K.THREE,root=new T.Group(),fallback=new T.Group();
    root.position.set(x,y+relief(x,z),z);
    root.rotation.y=yaw;
    root.add(fallback);
    const cube=new T.BoxGeometry(),cylinder=new T.CylinderGeometry(1,1,1,12);
    const materials=new Map();
    function part(geometry,side,height,front,w,h,d,color,angle=0) {
      if (!materials.has(color)) materials.set(color,new T.MeshStandardMaterial({color}));
      const mesh=new T.Mesh(geometry,materials.get(color));
      mesh.position.set(side,height,front);
      mesh.scale.set(w,h,d);
      mesh.rotation.x=angle;
      fallback.add(mesh);
    }
    part(cube,0,1.64,-3.31,6.10,3.25,.12,0x65615f);
    part(cube,-1.70,1.94,-3.21,1.81,1.02,.075,0x202129);
    part(cube,0,.60,0,1.56,1.03,.706,0x303031);
    part(cube,0,1.12,0,1.51,.014,.665,0x938c84);
    for(const [side,size] of [[-.31,.15],[.015,.10],[.322,.103]]){
      part(cube,side,1.177,.09,size,.09,.05,0x373739);
      part(cylinder,side,1.175,.15,.036,.074,.036,0x2c2c2e,Math.PI/2);
    }
    part(cube,.015,1.25,.09,.08,.055,.06,0x4e4f50);
    for(const [side,h] of [[-.47,.155],[-.18,.137],[.117,.11],[.43,.14]]) {
      part(cylinder,side,1.129+h/2,-.14,.04,h,.04,0x2e2e30);
    }
    mountRetailDisplay(K,{root,fallback,source,batches,x,y,z});
  });
}
