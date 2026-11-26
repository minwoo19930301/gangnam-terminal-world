import { relief } from '../banpo_relief.js';
import { mountRetailDisplay } from './shinsegae-retail-display.js';

const source = new URL('../../assets/models/ssg-lighting/lightnow.glb',import.meta.url);
const batches = ['LightnowFinish','LightnowMetal','LightnowDiffuser'];

export function registerLightnow(K,{poly,x,y,z,yaw}) {
  K.detail({floor:'9F',y0:y,y1:y+4.8,poly,name:'라잇나우 조명 전시'},()=>{
    const T=K.THREE, root=new T.Group(), fallback=new T.Group();
    root.position.set(x,y+relief(x,z),z);
    root.rotation.y=yaw;
    root.add(fallback);
    const cube=new T.BoxGeometry(), globe=new T.SphereGeometry(1,14,8);
    const finishes=new Map();
    function piece(shape,px,height,back,w,h,d,color) {
      if (!finishes.has(color)) finishes.set(color,new T.MeshStandardMaterial({color}));
      const part=new T.Mesh(shape,finishes.get(color));
      part.position.set(px,height,-back);
      part.scale.set(w,h,d);
      fallback.add(part);
    }
    piece(cube,0,1.57,2.66,5.15,3.14,.105,0xe7e3d9);
    piece(cube,.49,.85,0,2.71,.15,.94,0xd4cfbe);
    for(const side of [-.47,1.45]) piece(cube,side,.40,0,.21,.80,.58,0xc8c3b7);
    piece(cube,.38,.42,2.04,1.72,.81,.69,0xe7e3d9);
    for(const [side,back,bottom,s,color] of [[-.46,.02,.925,1.1,0xefe2bc],[.22,.07,.925,.76,0xffffff],
      [.75,.025,.925,.82,0xeaa124],[-.18,2.04,.825,.89,0xffffff],[.91,2.04,.825,.98,0xf8be81]]) {
      piece(cube,side,bottom+.16*s,back,.045*s,.32*s,.045*s,color);
      piece(globe,side,bottom+.35*s,back,.20*s,.105*s,.20*s,color);
    }
    piece(cube,-1.75,.19,.60,1.14,.30,.75,0x534337);
    piece(globe,-1.83,.60,.65,.41,.25,.41,0xffedbf);
    piece(globe,-1.62,2.14,1.51,.49,.30,.49,0xffedbf);
    piece(globe,.68,2.24,.08,.62,.08,.62,0xc1d2d3);
    mountRetailDisplay(K,{root,fallback,source,batches,x,y,z});
  });
  for(const [side,back,w,d,h] of [[.49,0,2.71,.94,.925],[.38,2.04,1.72,.69,.825],
    [-1.75,.60,1.14,.75,.78],[0,2.66,5.15,.105,3.14],[2.40,1.23,.04,.9,3],
    [-.07,.83,.46,.46,.86],[1.1,.83,.46,.46,.86]]) {
    K.box({x:x+side*Math.cos(yaw)-back*Math.sin(yaw),y,z:z-side*Math.sin(yaw)-back*Math.cos(yaw),
      w,d,h,rotY:yaw,mat:0xe7e3d9,skip:['top','bottom','n','s','e','w']});
  }
}
