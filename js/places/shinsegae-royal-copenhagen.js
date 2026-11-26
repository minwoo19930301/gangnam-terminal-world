import {mountRetailDisplay} from './shinsegae-retail-display.js';
import {relief} from '../banpo_relief.js';

const source = new URL('../../assets/models/ssg-blue-porcelain/display.glb', import.meta.url);
const batches = ['RoyalPrincessPorcelain','RoyalOakCabinetry','RoyalBrassDetails'];

export function registerRoyalCopenhagen(K, {poly,x,y,z,yaw}) {
  registerPrincessFigurine(K,{poly,x,y,z,yaw});
  K.detail({floor:'9F',y0:y,y1:y+4.8,poly,name:'로얄코펜하겐'}, () => {
    const T=K.THREE, root=new T.Group(), fallback=new T.Group();
    root.position.set(x,y+relief(x,z),z);
    root.rotation.y=yaw;
    root.add(fallback);
    const cube=new T.BoxGeometry(), dish=new T.CylinderGeometry(1,.72,1,20);
    function piece(shape,color,px,py,pz,w,h,d,angle=0) {
      const mesh=new T.Mesh(shape,new T.MeshStandardMaterial({color}));
      mesh.scale.set(w,h,d);
      mesh.position.set(px,py,pz);
      mesh.rotation.x=angle;
      fallback.add(mesh);
    }
    piece(cube,0xb78662,0,.85,0,2.46,.07,.92);
    piece(cube,0xe5d9c5,0,.65,0,2.31,.34,.78);
    for(const a of [-1.15,1.15]) for(const b of [-.39,.39]) piece(cube,0x986d4e,a,.42,b,.055,.84,.055);
    piece(cube,0xad7957,0,1.32,-2.22,4.56,2.64,.09);
    for(const h of [.58,1.12,1.65,2.18]) {
      piece(cube,0xce996e,0,h,-2.02,4.56,.045,.48);
      for(const a of [-1.8,-1.26,1.23,1.79]) piece(dish,0xe9e6df,a,h+.16,-2,.14,.032,.14,1.3);
    }
    piece(cube,0xe9e2cf,-2.33,1.41,-.66,.77,2.82,.58);
    for(const a of [-.84,-.48,.33,.85]) piece(dish,0xf4f1eb,a,.93,0,.09,.09,.09);
    piece(dish,0x245283,-.52,1.14,.08,.15,.025,.15,1.25);
    mountRetailDisplay(K,{root,fallback,source,batches,x,y,z});
  });
}

const figurineSource = new URL('../../assets/models/ssg-blue-porcelain/figurine.glb',import.meta.url);

function registerPrincessFigurine(K,{poly,x,y,z,yaw}) {
  // Offset from the centre of the existing table. +Z faces the visitor.
  const px=x+.115*Math.cos(yaw)+.213*Math.sin(yaw);
  const pz=z-.115*Math.sin(yaw)+.213*Math.cos(yaw);
  K.detail({floor:'9F',y0:y,y1:y+4.8,poly,name:'완두콩 공주 보석함'},()=>{
    const T=K.THREE, root=new T.Group(), fallback=new T.Group();
    root.position.set(px,y+relief(x,z)+.8985,pz);
    root.rotation.y=yaw;
    root.add(fallback);
    function shape(geometry,color,py,width,height,depth) {
      const item=new T.Mesh(geometry,new T.MeshStandardMaterial({color}));
      item.position.y=py;
      item.scale.set(width,height,depth);
      fallback.add(item);
    }
    const platform=new T.CylinderGeometry(.72,1,1,8), oval=new T.SphereGeometry(1,10,6);
    shape(platform,0xa79369,.034,.13,.068,.13);
    for(const [i,col] of [0xf1dfc6,0x83969b,0xeedec6,0x998290,0xe2d5b9].entries())
      shape(oval,col,.08+i*.029,.104-i*.004,.022,.103-i*.004);
    shape(platform,0x67646c,.260,.076,.11,.07);
    shape(oval,0xe3c7ab,.348,.016,.024,.018);
    shape(oval,0xe2d9c4,.388,.017,.039,.017);
    mountRetailDisplay(K,{root,fallback,source:figurineSource,batches:['RoyalPrincessPea'],
      x:px,y,z:pz,nearDistance:3.8,displayDistance:9});
  });
}
