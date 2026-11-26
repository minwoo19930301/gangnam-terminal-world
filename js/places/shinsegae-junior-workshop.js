import {mountRetailDisplay} from './shinsegae-retail-display.js';
import {relief} from '../banpo_relief.js';

export const toyShop = '완구 (아이큐박스/키움하우스)';
const source = new URL('../../assets/models/ssg-junior-workshop/workshop.glb',import.meta.url);
const batches = ['IQBoxGangnamBrioWorkshop'];

export function registerIQBox(K,{poly,x,y,z,yaw}) {
  K.detail({floor:'10F',y0:y,y1:y+4.8,poly,name:'아이큐박스 브리오 기차 체험대'},() => {
    const T=K.THREE, root=new T.Group(), fallback=new T.Group();
    root.position.set(x,y+relief(x,z),z);
    root.rotation.y=yaw;
    root.add(fallback);
    const cube=new T.BoxGeometry(), colors=new Map();
    function box(side,back,base,w,d,h,color) {
      if (!colors.has(color)) colors.set(color,new T.MeshStandardMaterial({color}));
      const mesh=new T.Mesh(cube,colors.get(color));
      mesh.position.set(side,base+h/2,-back);
      mesh.scale.set(w,h,d);
      fallback.add(mesh);
    }
    for (const side of [-.64,.64]) {
      for (const back of [-.36,.36]) box(side,back,.02,.045,.045,.55,0x146448);
      box(side,0,.02,.045,.76,.04,0x146448);
    }
    box(0,0,.56,1.52,.96,.085,0xf7f6ef);
    box(0,0,.645,1.48,.93,.015,0x8dc759);
    for (const back of [-.30,.30]) box(0,back,.66,.90,.08,.021,0xe1b983);
    for (const side of [-.35,-.19,-.03]) box(side,-.30,.681,.14,.07,.065,0xffb825);
    box(.25,-.30,.76,.24,.20,.075,0x146448);
    box(0,.86,0,1.66,.60,.59,0xb79956);
    for (const side of [-.48,0,.48]) box(side,.77,.59,.45,.21,.39,0x146448);
    box(-1.39,.65,.03,.89,.40,.61,0xe1b983);
    box(-1.39,.46,.12,.82,.045,.41,0xf7f6ef);
    box(-1.39,.82,.64,.82,.03,.47,0xe1b983);
    box(-1.60,.72,.89,.35,.19,.21,0xf7f6ef);
    box(1.22,.48,.02,.73,.59,.80,0xb79956);
    box(1.11,.42,.82,.23,.15,.10,0xf7f6ef);
    mountRetailDisplay(K,{root,fallback,source,batches,x,y,z});
  });
}
