import {boxSilhouette} from '../interior-architecture/box-silhouette.js';
import {loadArchitecture} from '../interior-architecture/model.js';
import {placeSingleDetail} from '../interior-architecture/single-detail.js';
import {relief} from '../../../js/banpo_relief.js';

export function placeCoffee(K,name,x,y,z,angle){
  const T=K.THREE;
  const pieces=[
    [0,.10,-.197,2.46,2.70,.09,0x563b2c],
    [-1.19,.1,0,.12,2.71,.51,0x654831],[1.19,.1,0,.12,2.71,.51,0x654831],
    [0,.015,-.015,2.46,.11,.50,0x3b2e26],[0,2.785,-.03,2.51,.09,.56,0x654831],
    [0,.798,0,2.37,.077,.55,0x754b46],[0,.18,0,2.30,.05,.48,0x574232],
  ];
  for(const h of [1.192,2.019,2.597])pieces.push([0,h,-.018,2.30,.05,.465,0x50382b]);
  for(let i=0;i<7;i++){
    const cx=(i-3)*.309;
    pieces.push([cx,1.25,.065,.285,.74,.20,0xbf934e],
      [cx,1.532,.152,.254,.414,.022,0x5b4431],[cx,1.33,.161,.163,.16,.085,0xc99b4b]);
  }
  for(let i=0;i<10;i++)pieces.push([-.99+i*.218,2.067,0,.193,.33,.15,0xece3cd]);
  for(let i=0;i<7;i++){
    pieces.push([-.96+i*.317,.876,0,.214,.258,.16,i%3===1?0x845e56:0xece3d4]);
    pieces.push([-.96+i*.32,.231,0,.26,.40,.19,i<4?0xb99b75:0xe6ddc9]);
  }
  const fallback=boxSilhouette(T,pieces);
  async function load(file){
    const [mesh]=await loadArchitecture(file);
    mesh.material=new T.MeshPhongMaterial({map:mesh.material.map,specular:0x292724,shininess:34});
    return [mesh];
  }
  const s=Math.sin(angle),c=Math.cos(angle);
  function onAisle(p){
    const dx=p.x-x,dz=p.z-z,front=dx*s+dz*c,side=dx*c-dz*s;
    // The intervening gondola stock hides the dispensers except through the cross aisle.
    return front>-.04 && (front<2.6 || Math.abs(side-.40)<1.25);
  }
  return placeSingleDetail(K,{name,file:'../ssg-market-coffee/coffee.glb',at:[x,y,z],angle,
    rigidGround:relief(x,z),fallback,fallbackMaterial:new T.MeshLambertMaterial({vertexColors:true}),
    loadSurface:load,range:8.7,exitRange:11,floorTolerance:2.25,eyeHeight:1.42,closeVisibleFrom:onAisle});
}
