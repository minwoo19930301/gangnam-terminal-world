import {relief} from '../banpo_relief.js';
import {mountRetailDisplay} from './shinsegae-retail-display.js';

const source = new URL('../../assets/models/ssg-helinox/gallery.glb',import.meta.url);
const batches = ['SnowPeakGangnamCanvas','SnowPeakGangnamHardware','SnowPeakGangnamWeave'];

export function registerSnowPeak(K,{poly,x,y,z,yaw}) {
  K.detail({floor:'8F',y0:y,y1:y+4.8,poly,name:'스노우피크 · 캠핑용품 전시'}, () => {
    const T=K.THREE, root=new T.Group(), fallback=new T.Group();
    root.position.set(x,y+relief(x,z),z);
    root.rotation.y=yaw;
    root.add(fallback);
    const box=new T.BoxGeometry(), materials=new Map();
    function piece(geometry,color,x,y,z,w,h,d) {
      if (!materials.has(color)) materials.set(color,new T.MeshStandardMaterial({color,side:T.DoubleSide}));
      const mesh=new T.Mesh(geometry,materials.get(color));
      mesh.position.set(x,y,z);
      mesh.scale.set(w,h,d);
      fallback.add(mesh);
      return mesh;
    }
    piece(box,0xcea674,0,.012,-.23,4.56,.02,4.12);
    // Half a cylinder, open at the customer-facing end.
    const shelter=new T.CylinderGeometry(1,1,1,14,1,true,-Math.PI/2,Math.PI);
    shelter.rotateX(-Math.PI/2);
    piece(shelter,0xc09c70,0,.035,-1.1,1.28,1.90,2.20);
    for (const cx of [-.86,.83]) {
      piece(box,0xad9962,cx,.36,.41,.5,.055,.45);
      piece(box,0xad9962,cx,.66,.19,.50,.59,.038).rotation.x=-.20;
      for(const side of [-1,1]) {
        piece(box,0xcea674,cx+side*.26,.54,.38,.05,.03,.40);
        piece(box,0x9da5a6,cx+side*.25,.233,.36,.023,.53,.025).rotation.x=.73;
        piece(box,0x9da5a6,cx+side*.25,.23,.36,.023,.53,.025).rotation.x=-.73;
      }
    }
    piece(box,0xcea674,0,.456,1.09,1.35,.042,.51);
    for(const cx of [-.6,.6]) for(const cz of [.86,1.32])
      piece(box,0x444647,cx,.23,cz,.03,.43,.03);
    piece(box,0xd5d4c8,-1.53,.25,.92,.50,.47,.35);
    piece(box,0xbcc4c4,1.21,.22,1.34,.42,.21,.42);
    piece(box,0xbe8d54,1.47,1.845,-1.47,1.27,.43,.068);
    mountRetailDisplay(K,{root,fallback,source,batches,x,y,z});
  });
}
