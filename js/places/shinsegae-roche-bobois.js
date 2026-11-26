import {mountRetailDisplay} from './shinsegae-retail-display.js';
import {relief} from '../banpo_relief.js';

const source = new URL('../../assets/models/ssg-saint-louis/gallery.glb',import.meta.url);
const batches = ['RocheBubbleUpholstery','RocheSpunMetal','RochePrintedCushions','RocheIllustratedRug','RocheShowroomTrim'];

export function registerRocheBobois(K,{poly,x,y,z,yaw}) {
  // Each footprint leaves a walking route around the seating group.
  const seats = [[-.85,-.20,2.34,1.14,12],[1.38,.54,1.26,1.06,-35]];
  for (const [side,front,w,d,angle] of [...seats,[0,-1.46,4.70,.055,0],[-.50,.89,.67,.67,0],[.32,.83,.83,.83,0]]) {
    K.box({x:x+side*Math.cos(yaw)+front*Math.sin(yaw),y,
      z:z-side*Math.sin(yaw)+front*Math.cos(yaw),w,d,h:front===-1.46?2.46:.40,
      rotY:yaw+angle*Math.PI/180,mat:0xafa9a1,skip:['top','bottom','n','s','e','w']});
  }
  K.detail({floor:'9F',y0:y,y1:y+4.8,poly,name:'로쉐보보아 버블 소파'},()=>{
    const T=K.THREE,root=new T.Group(),fallback=new T.Group();
    root.position.set(x,y+relief(x,z),z);
    root.rotation.y=yaw;
    root.add(fallback);
    const round=new T.SphereGeometry(.5,10,8);
    function piece(geometry,color,px,py,pz,w,h,d,angle=0) {
      const mesh=new T.Mesh(geometry,new T.MeshStandardMaterial({color}));
      mesh.scale.set(w,h,d);
      mesh.position.set(px,py,pz);
      mesh.rotation.y=angle*Math.PI/180;
      fallback.add(mesh);
    }
    for (const [sx,sz,w,d,angle] of seats) {
      const shade=sx<0?0xc0c0c3:0xcabf26;
      piece(round,shade,sx,.26,sz,w,.49,d,angle);
      const a=angle*Math.PI/180;
      piece(round,shade,sx-.3*Math.sin(a),.52,sz-.3*Math.cos(a),w*.94,.45,.48,angle);
    }
    piece(new T.BoxGeometry(),0x48474a,0,1.24,-1.46,4.70,2.42,.045);
    const disc=new T.CylinderGeometry(.5,.25,1,16);
    piece(disc,0x68bebc,-.5,.24,.89,.72,.16,.72);
    piece(disc,0xd69778,.32,.29,.83,.88,.18,.88);
    piece(round,0xf8e5c2,-1.93,1.67,-1.09,.72,.72,.10);
    mountRetailDisplay(K,{root,fallback,source,batches,x,y,z});
  });
}
