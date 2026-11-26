import { mountRetailDisplay } from './shinsegae-retail-display.js';
import { relief } from '../banpo_relief.js';

const source = new URL('../../assets/models/ssg-mono-menswear/gallery.glb', import.meta.url);
const batches = ['CdgGangnamLacquer','CdgGangnamCutAndSewn','CdgGangnamRepeat','CdgGangnamInk'];

export function registerCdg(K,{x,y,z,yaw,poly}) {
  // Match the projecting entrance wing, cabinet, walls and long counter.
  for (const [side,front,w,d,h] of [[-2.17,4.92,1.10,.16,3.02],[1.91,2.22,.65,5.02,.97],
    [2.22,4.06,1.0,.13,3.02],[0,-2.9,5.44,.10,3.02],[-2.72,1.625,.10,9.05,3.02],[2.72,1.625,.10,9.05,3.02]]) {
    K.box({x:x+side*Math.cos(yaw)+front*Math.sin(yaw),y,
      z:z-side*Math.sin(yaw)+front*Math.cos(yaw),w,d,h,rotY:yaw,
      skip:['top','bottom','n','s','e','w']});
  }
  // An inscribed twelve-sided footprint follows the rounded display closely.
  for(let i=0;i<12;i++) {
    const a=i*Math.PI/6,side=-.79+.80*Math.cos(a),front=-.36+.80*Math.sin(a);
    K.box({x:x+side*Math.cos(yaw)+front*Math.sin(yaw),y,
      z:z-side*Math.sin(yaw)+front*Math.cos(yaw),w:.42,d:.045,h:2.34,rotY:yaw-a+Math.PI/2,
      skip:['top','bottom','n','s','e','w']});
  }
  K.detail({floor:'6F',y0:y,y1:y+4.8,poly,name:'CDG CDG CDG'},()=>{
    const T=K.THREE,root=new T.Group(),fallback=new T.Group(),geometry=new T.BoxGeometry();
    const ivory=new T.MeshStandardMaterial({color:0xe7e5e3}),dark=new T.MeshStandardMaterial({color:0x232026});
    root.position.set(x,y+relief(x,z),z);root.rotation.y=yaw;root.add(fallback);
    function block(x,y,z,w,h,d,mat=ivory){
      const ob=new T.Mesh(geometry,mat);ob.position.set(x,y,z);ob.scale.set(w,h,d);fallback.add(ob);
    }
    block(0,1.52,-2.91,5.44,3,.08);
    for(const s of [-2.72,2.72])block(s,1.52,1.625,.08,3,9.05);
    block(0,.024,1.625,5.44,.035,9.05);
    block(1.91,.51,2.22,.65,.91,5.02);
    block(-2.17,1.52,4.92,1.1,3,.1);
    const cylinder=new T.Mesh(new T.CylinderGeometry(.83,.83,2.3,16),ivory);
    cylinder.position.set(-.79,1.19,-.36);fallback.add(cylinder);
    for(const h of [.42,1.13,1.96])block(-.79,h,.39,1.03,.26,.08,dark);
    for(const s of [-1.79,-.65,.60,1.80])block(s,1.87,-2.68,.50,.69,.11,dark);
    mountRetailDisplay(K,{root,fallback,source,batches,x,y,z});
  });
}
