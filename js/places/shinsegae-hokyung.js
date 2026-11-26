import {relief} from '../banpo_relief.js';
import {mountRetailDisplay} from './shinsegae-retail-display.js';

const source=new URL('../../assets/models/ssg-hokyung-dining/gallery.glb',import.meta.url);
const batches=['HokyungJoinery','HokyungSizzlingRice','HokyungTeaMetal','HokyungFanAndWood','HokyungLamplight'];

export function registerHokyung(K,{poly,x,y,z,yaw}){
  const floor='11F';
  // The existing first two dining positions. Blender +Y points to local -Z.
  for(const offset of [0,-2.1]){
    for(const [dx,w,d,h] of [[0,1.25,.98,.765],[-.78,.47,.46,.87],[.78,.47,.46,.87]]){
      K.box({x:x+(offset+dx)*Math.cos(yaw),y,z:z-(offset+dx)*Math.sin(yaw),
        w,d,h,rotY:yaw,mat:0x604332,skip:['top','bottom','n','s','e','w']});
    }
  }
  const benchX=-1.05,benchZ=3.38;
  K.box({x:x+benchX*Math.cos(yaw)+benchZ*Math.sin(yaw),y,z:z-benchX*Math.sin(yaw)+benchZ*Math.cos(yaw),
    w:3.12,d:.68,h:.96,rotY:yaw,mat:0x8d8374,skip:['top','bottom','n','s','e','w']});
  K.detail({floor,poly,y0:y,y1:y+4.8,name:'호경전 해물 누룽지탕과 차림상'},()=>{
    const T=K.THREE,root=new T.Group(),fallback=new T.Group();
    root.position.set(x,y+relief(x,z),z);
    root.rotation.y=yaw;
    root.add(fallback);
    const box=new T.BoxGeometry(),pot=new T.CylinderGeometry(.50,.33,1,16);
    const finishes=new Map();
    function part(shape,x,y,z,w,h,d,color){
      if(!finishes.has(color))finishes.set(color,new T.MeshStandardMaterial({color}));
      const mesh=new T.Mesh(shape,finishes.get(color));
      mesh.position.set(x,y+h/2,z);mesh.scale.set(w,h,d);fallback.add(mesh);
    }
    for(const tx of [0,-2.1]){
      part(box,tx,.717,0,1.25,.048,.98,0x73452e);
      for(const a of [-1,1]){
        for(const b of [-1,1])part(box,tx+a*.54,0,b*.43,.065,.72,.065,0x453126);
        part(box,tx+a*.78,.42,0,.44,.072,.46,0x423831);
        part(box,tx+a*.99,.46,0,.045,.39,.44,0x3b342f);
      }
    }
    part(box,.055,.765,-.205,.36,.027,.31,0x66402c);
    part(pot,.055,.792,-.205,.30,.11,.30,0x3b2b26);
    part(pot,.05,.885,-.20,.24,.018,.24,0xd4b584);
    part(pot,-.315,.765,.18,.12,.19,.12,0xb7a078);
    part(box,-1.05,0,3.73,4.8,2.93,.085,0x606d72);
    part(box,-1.05,.12,3.38,3.12,.44,.68,0x978b7b);
    part(box,-.9,2.38,1.3,.59,.16,.59,0xad9069);
    mountRetailDisplay(K,{root,fallback,source,batches,x,y,z});
  });
}
