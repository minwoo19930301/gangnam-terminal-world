import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {placeSingleDetail} from '../interior-architecture/single-detail.js';

let display;
function fixtures(T) {
  if(display) return display;
  const paint=new T.MeshLambertMaterial({vertexColors:true});
  const glass=new T.MeshPhongMaterial({color:0xe5f1f0,opacity:.13,transparent:true,depthWrite:false,shininess:70});
  const lamp=new T.MeshLambertMaterial({vertexColors:true,emissive:0x352919});
  function simple(parts) {
    const pieces=parts.map(([width,height,depth,x,y,z,tone])=>{
      const geo=new T.BoxGeometry(width,height,depth).translate(x,y,z);
      const rgb=new Float32Array(geo.attributes.position.count*3),color=new T.Color(tone);
      for(let i=0;i<rgb.length;i+=3)color.toArray(rgb,i);
      geo.setAttribute('color',new T.BufferAttribute(rgb,3));
      return geo;
    });
    const result=mergeGeometries(pieces);
    pieces.forEach(p=>p.dispose());
    return result;
  }
  const wooden=simple([[3.45,.57,1,0,.35,0,0x996943],[1.90,.05,1.02,.77,1.68,0,0x539b9b],
    [1.84,.045,.93,.77,1.10,0,0xba9763],[1.84,.045,.93,.77,.76,0,0xba9763],
    [.52,.30,.45,-1.32,.80,-.07,0x955b4d],[.54,.19,.50,-.64,.76,0,0xd3bda0]]);
  const clear=new T.BoxGeometry(1.83,.97,.945).translate(.77,1.18,0);
  const lampshade=new T.SphereGeometry(.175,9,6).scale(1,1.16,1).translate(0,.282,0);
  const setting=simple([[.325,.093,.255,-.119,.064,.016,0xc58d4d],[.073,.103,.073,.158,.067,.091,0x9c4634],
                        [.19,.068,.12,.094,.069,-.135,0xc09c63]]);
  const window=simple([[4.2,.9,.36,0,.45,0,0x926445],[4.2,.04,.09,0,2.14,-.23,0x539b9b],
                      [4.15,.46,.15,0,2.37,-.16,0x333033],[1.38,.48,.3,.95,1.21,0,0xd8ceab]]);
  display={paint,glass,lamp,wooden,clear,lampshade,setting,window,
    lampFar:new T.MeshLambertMaterial({color:0xc99f56,emissive:0x352919})};
  return display;
}

export function placeKervanCase(K,at,angle) {
  const f=fixtures(K.THREE);
  const options={at,angle,range:14,exitRange:18,floorTolerance:2.25,eyeHeight:1.25};
  placeSingleDetail(K,{...options,name:'케르반 · 제과와 포장 진열',file:'../kervan/showcase.glb',
    fallback:f.wooden,fallbackMaterial:f.paint,material:f.paint});
  placeSingleDetail(K,{...options,name:'케르반 · 진열장 유리와 컵 뚜껑',file:'../kervan/covers.glb',
    fallback:f.clear,fallbackMaterial:f.glass,material:f.glass});
}
export function placeKervanLamp(K,at,angle) {
  const f=fixtures(K.THREE);
  placeSingleDetail(K,{name:'케르반 · 모자이크 등',file:'../kervan/lantern.glb',at,angle,
    fallback:f.lampshade,fallbackMaterial:f.lampFar,material:f.lamp,range:13,exitRange:17,floorTolerance:2.65});
}
export function placeKervanMeal(K,at,angle) {
  const f=fixtures(K.THREE);
  placeSingleDetail(K,{name:'케르반 · 라바시와 차 한 상',file:'../kervan/tea-table.glb',at,angle,
    fallback:f.setting,fallbackMaterial:f.paint,material:f.paint,range:7.5,exitRange:10,floorTolerance:2.1,eyeHeight:.38});
}

export function placeKervanWindow(K,at,angle) {
  const f=fixtures(K.THREE);
  placeSingleDetail(K,{name:'케르반 · 청록색 주방창',file:'../kervan/kitchen-window.glb',at,angle,
    fallback:f.window,fallbackMaterial:f.paint,material:f.paint,range:15,exitRange:18,floorTolerance:2.20,eyeHeight:1.6});
}
