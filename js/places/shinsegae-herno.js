import {mountRetailDisplay} from './shinsegae-retail-display.js';
import {relief} from '../banpo_relief.js';

const source=new URL('../../assets/models/ssg-shirt-shop/gallery.glb',import.meta.url);
const batches=['HernoGangnamFixtures','HernoGangnamNylon','HernoGangnamOak','HernoGangnamGlass'];

export function registerHerno(K,{poly,x,y,z,yaw}){
  K.detail({floor:'6F',y0:y,y1:y+4.8,poly,name:'에르노 남성 아우터'},()=>{
    const T=K.THREE,root=new T.Group(),fallback=new T.Group(),cube=new T.BoxGeometry();
    root.position.set(x,y+relief(x,z),z);
    root.rotation.y=yaw;
    root.add(fallback);
    function block(px,py,pz,w,h,d,color){
      const mesh=new T.Mesh(cube,new T.MeshStandardMaterial({color}));
      mesh.position.set(px,py,pz);
      mesh.scale.set(w,h,d);
      fallback.add(mesh);
    }
    block(0,1.52,-.28,5.64,3.04,.12,0x494541);
    for(const h of [.18,2,2.7])block(0,h,0,5.62,.06,.58,0xb68d62);
    for(const px of [-2.79,-.47,.47,2.79])block(px,1.4,0,.045,2.7,.6,0x494541);
    for(const side of [-1,1])for(let i=0;i<6;i++){
      const col=[0x55564b,0xc8bba4,0x3e4655][i%3];
      block(side*1.63-.83+.323*i,1.47,0,.26,.66,.19,col);
    }
    block(-2.98,1.37,1.63,.16,2.70,2.49,0x80756d);
    block(-2.91,2.01,1.63,.51,.05,2.49,0xb68d62);
    block(.60,.19,1.77,1.77,.33,.73,0x494541);
    block(.60,.64,1.77,1.77,.05,.72,0xc4a281);
    block(-1.52,.48,1.59,.36,.72,.23,0x31353d);
    block(-1.52,1.32,1.59,.51,.68,.24,0x686950);
    mountRetailDisplay(K,{root,fallback,source,batches,x,y,z});
  });
}
