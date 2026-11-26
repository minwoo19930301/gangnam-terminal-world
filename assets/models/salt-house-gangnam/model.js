import {plan} from '../cinema-rotary/layout.js';
import {boxSilhouette} from '../interior-architecture/box-silhouette.js';
import {placeSingleDetail} from '../interior-architecture/single-detail.js';
import {loadArchitecture} from '../interior-architecture/model.js';
import {origin,angle,outline,point} from './layout.js';

export function saltHouseGangnam(K,y){
  const T=K.THREE,top=y+4.45,poly=outline.map(p=>plan(...p));
  K.hpoly(0x9b9287,poly,y+.014,true);
  K.phys.addSurface(poly,y);
  K.hpoly('ssg_ceil',poly,top+.005,false);K.phys.addCeiling(poly,top+.005,{});
  for(const [a,b] of [[1,2],[2,3],[3,0]])K.wall(...poly[a],...poly[b],y,top,{mat:0xd7d1c3,thick:.12});
  K.wall(...poly[0],...poly[1],y+3.50,top,{mat:0xc8bba6,thick:.12});
  for(const [l,r] of [[-4.83,-2.18],[2.18,4.83]])
    K.phys.addWall(...point(l,.14),...point(r,.14),y,y+3.49,.11);
  function occupied(x,d,w,depth,height){
    const corners=[[-1,-1],[1,-1],[1,1],[-1,1]].map(([a,b])=>point(x+a*w/2,d+b*depth/2));
    K.phys.addPolyWalls(corners,y,y+height,.012);
  }
  occupied(-1.57,2.75,.81,2.74,1.04);
  occupied(-.83,4.41,1.11,.65,1.39);
  occupied(1.31,4.42,2.86,.83,2.51);
  occupied(-1.94,.52,.46,.40,1.21);
  for(const [x,d] of [[3.08,1.42],[3.25,3.05]]){
    occupied(x,d,1.06,.68,.79);
    for(const side of [-1,1])occupied(x,d+side*.58,.40,.36,.80);
  }
  const [x,z]=point(0,.27);
  K.zone({name:'소금집',sub:'소금집 샌드위치 · 강남점',floor:'B1',poly,y0:y-.25,y1:top,priority:6,
    mapArrival:{x,y,z,yaw:angle}});
  const proxy=boxSilhouette(T,[
    [0,2.88,-.14,9.58,.64,.25,0x40352f],
    [-3.56,0,-.13,2.55,.83,.21,0x493a34],[3.56,0,-.13,2.55,.83,.21,0x493a34],
    [-2.28,0,-.03,.24,2.90,.23,0x483b34],[2.28,0,-.03,.24,2.90,.23,0x483b34],
    [-4.79,.82,-.13,.14,2.06,.21,0x493a34],[4.79,.82,-.13,.14,2.06,.21,0x493a34],
    [-1.57,.02,-2.75,.81,1.00,2.74,0x685146],[1.31,.04,-4.43,2.85,2.44,.25,0xa39a80],
    [1.31,2.27,-4.38,2.85,.23,.72,0x615146],
  ]);
  async function loadShop(file){
    const [mesh]=await loadArchitecture(file);
    const mat=new T.MeshPhongMaterial({map:mesh.material.map,vertexColors:true,side:T.DoubleSide,shininess:30,specular:0x22201d});
    mat.onBeforeCompile=shader=>{
      shader.fragmentShader=shader.fragmentShader.replace('#include <emissivemap_fragment>',`#include <emissivemap_fragment>
        float lamp=smoothstep(.87,.99,diffuseColor.r)*smoothstep(.76,.89,diffuseColor.g);
        totalEmissiveRadiance += diffuseColor.rgb*(.15+.48*lamp);`);
    };
    mesh.material=mat;return [mesh];
  }
  placeSingleDetail(K,{name:'소금집 강남 · 샌드위치 주문대와 숙성 진열장',file:'../salt-house-gangnam/shop.glb',
    at:[origin[0],y,origin[1]],angle,fallback:proxy,fallbackMaterial:new T.MeshLambertMaterial({vertexColors:true}),
    loadSurface:loadShop,range:13,exitRange:17,floorTolerance:2.6,eyeHeight:1.62,
    viewBounds:[new T.Box3(new T.Vector3(-4.86,.01,-4.86),new T.Vector3(4.86,4.26,.11))],
    closeVisibleFrom:p=>{
      const dx=p.x-origin[0],dz=p.z-origin[1];
      const d=-dx*Math.sin(angle)-dz*Math.cos(angle),u=dx*Math.cos(angle)-dz*Math.sin(angle);
      return d> -5.15 && d<5.7 && (d<.2 || Math.abs(u-.27*d)<4.8);
    }});
}
