import {mountRetailDisplay} from './shinsegae-retail-display.js';
import {relief} from '../banpo_relief.js';

const source = new URL('../../assets/models/ssg-coffee-table/lounge.glb', import.meta.url);
const batches = ['MolteniEmile','MolteniMaylis','MolteniMetal','MolteniGallery','MolteniRug'];

export function registerMolteni(K, {poly,x,y,z,yaw}) {
  K.detail({floor:'9F',y0:y,y1:y+4.8,poly,name:'몰테니&C 에밀 소파와 메이리스 테이블'}, () => {
    const T=K.THREE, root=new T.Group(), fallback=new T.Group();
    root.position.set(x,y+relief(x,z),z);
    root.rotation.y=yaw;
    root.add(fallback);
    const geometry=new T.BoxGeometry(), colors=new Map();
    function box(side,back,bottom,w,d,h,color,angle=0) {
      if (!colors.has(color)) colors.set(color,new T.MeshStandardMaterial({color}));
      const part=new T.Mesh(geometry,colors.get(color));
      part.position.set(side,bottom+h/2,-back);
      part.scale.set(w,h,d);
      part.rotation.y=angle;
      fallback.add(part);
    }
    box(0,-.04,.025,5.12,3.05,.03,0xa69991);
    box(0,1.86,.02,5.58,.11,2.78,0xded9cf);
    for (const h of [.25,.72,1.19,1.66,2.13,2.59]) box(0,1.64,h,5.35,.39,.03,0xc1ae96);
    for (const [side,back,w,angle] of [[-1.37,.31,1.46,.31],[.03,.55,1.39,.025],[1.19,.56,.94,-.06]]) {
      box(side,back,.13,w,1.02,.35,0xdacfbf,angle);
      box(side-.35*Math.sin(angle),back+.35*Math.cos(angle),.46,w,.32,.35,0xdacfbf,angle);
    }
    for (const [side,back,w,d,h,color] of [[.04,-.52,1.35,.9,.386,0xe7e2da],[-.78,-.92,.62,.52,.432,0x375b50]]) {
      box(side,back,h-.04,w,d,.04,color);
      for(const dx of [-w*.31,w*.31]) box(side+dx,back,.055,.07,.07,h-.095,0xb8bdbb);
    }
    for (const back of [-.82,.06]) {
      box(1.97,back,.43,.48,.50,.06,0xc49468);
      box(2.20,back,.47,.055,.48,.30,0xc49468);
    }
    mountRetailDisplay(K,{root,fallback,source,batches,x,y,z});
  });
}
