import {relief} from '../banpo_relief.js';
import {mountRetailDisplay} from './shinsegae-retail-display.js';

const source = new URL('../../assets/models/ssg-sushi/gallery.glb', import.meta.url);
const batches = ['KisaraGlazedServing', 'KisaraDining', 'KisaraBrushedSteel'];

export function registerKisara(K, {poly,x,y,z,yaw}) {
  K.detail({floor:'11F', y0:y, y1:y+4.8, poly, name:'키사라 모둠초밥과 사시미'}, () => {
    const T=K.THREE, root=new T.Group(), fallback=new T.Group();
    root.position.set(x,y+relief(x,z),z);
    root.rotation.y=yaw;
    root.add(fallback);
    const box=new T.BoxGeometry(), cup=new T.CylinderGeometry(.5,.40,1,16);
    const finishes=new Map();
    function part(shape,px,py,pz,w,h,d,color) {
      if (!finishes.has(color)) finishes.set(color,new T.MeshStandardMaterial({color}));
      const mesh=new T.Mesh(shape,finishes.get(color));
      mesh.scale.set(w,h,d);
      mesh.position.set(px,py+h/2,pz);
      fallback.add(mesh);
    }
    part(box,0,.716,0,1.02,.042,1.28,0x8b3e26);
    for(const side of [-1,1]){
      for(const end of [-1,1]){
        part(box,side*.451,0,end*.574,.056,.718,.056,0x613721);
        part(box,side*.715,0,end*.17,.36,.42,.035,0x613721);
      }
      part(box,side*.715,.418,0,.426,.06,.45,0x383330);
      part(box,side*.932,.478,0,.04,.375,.42,0x383330);
    }
    part(box,-.07,.758,.304,.413,.026,.378,0xe2d6c0);
    for(const [j,color] of [0xf4dfca,0xe49779,0xf4d2b9,0xef963f,0xae3445,0xf4dbcd,0xf2ba89,0xac713f,0x87542f].entries()){
      part(box,-.07+(j%3-1)*.105,.784,.304+(Math.floor(j/3)-1)*.106,.047,.027,.086,color);
    }
    part(box,.01,.758,-.213,.29,.022,.208,0x302c2a);
    part(box,.01,.780,-.213,.156,.025,.074,0xde8b76);
    part(cup,-.314,.758,-.388,.13,.20,.13,0xa99e91);
    part(cup,-.314,.958,-.388,.138,.05,.138,0x292523);
    part(cup,.286,.758,.175,.146,.082,.146,0x292523);
    mountRetailDisplay(K,{root,fallback,source,batches,x,y,z});
  });
}
