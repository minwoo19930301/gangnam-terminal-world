import {boxSilhouette} from '../interior-architecture/box-silhouette.js';
import {loadArchitecture} from '../interior-architecture/model.js';
import {placeSingleDetail} from '../interior-architecture/single-detail.js';
import {plan} from '../cinema-rotary/layout.js';
import {origin,angle,point} from './layout.js';

export function gangnamMatchaStation(K,y){
  const T=K.THREE,top=y+4.45;
  // Keep the back edge inside this part of the guide's L-shaped shop.
  const guide=[[968,776],[1019,776],[1019,751],[968,751]];
  const footprint=guide.map(v=>plan(...v));
  K.hpoly(0xd4d5d1,footprint,y+.021,true);K.phys.addSurface(footprint,y);
  K.hpoly('ssg_ceil',footprint,top+.005,false);K.phys.addCeiling(footprint,top+.005,{});
  for(const [a,b] of [[1,2],[2,3],[3,0]])K.wall(...footprint[a],...footprint[b],y,top,{mat:0xd7d9d3,thick:.12});
  K.wall(...footprint[0],...footprint[1],y+3.24,top,{mat:0xd9d0c5,thick:.12});
  for(const [l,r] of [[-3.916,-1.86],[1.86,3.916]])
    K.phys.addWall(...point(l,.12),...point(r,.12),y,y+3.2,.08);
  const rectangle=(l,r,a,b)=>[[l,a],[r,a],[r,b],[l,b]].map(p=>point(...p));
  K.phys.addPolyWalls(rectangle(-1.43,2.35,1.04,1.90),y,y+1.03,.015);
  K.phys.addPolyWalls(rectangle(-2.91,2.98,2.36,3.08),y,y+2.62,.015);
  K.phys.addPolyWalls(rectangle(-2.83,-1.79,1.51,2.13),y,y+.78,.015);
  // A zone search requires its landing to lie inside the selected shop.
  const [x,z]=point(0,.24);
  K.zone({name:'오설록',sub:'강남 티샵 · 말차 스테이션',floor:'B1',y0:y-.25,y1:top,poly:footprint,priority:6,
    mapArrival:{x,z,y,yaw:angle}});
  const material=new T.MeshPhongMaterial({vertexColors:true,side:T.DoubleSide,shininess:35,specular:0x252925});
  material.onBeforeCompile=shader=>{
    shader.fragmentShader=shader.fragmentShader.replace('#include <emissivemap_fragment>',`#include <emissivemap_fragment>
      float high=smoothstep(.80,.95,diffuseColor.r)*smoothstep(.80,.94,diffuseColor.g);
      totalEmissiveRadiance+=diffuseColor.rgb*(.11+.33*high);`);
  };
  const load=async file=>{
    const [surface]=await loadArchitecture(file);
    const local=material.clone();
    local.map=surface.material.map;local.onBeforeCompile=material.onBeforeCompile;
    surface.material=local;return [surface];
  };
  const fallback=boxSilhouette(T,[[0,2.75,-.12,7.52,.45,.20,0x362f29],
    [-2.79,0,-.15,1.97,.89,.23,0x403731],[2.79,0,-.15,1.97,.89,.23,0x403731],
    [.46,.035,-1.47,3.76,.99,.85,0xc0ca9e],[-.46,1.02,-2.44,.80,1.73,.10,0x4e886d]]);
  placeSingleDetail(K,{name:'오설록 강남 · 말차 스테이션',file:'../osulloc-matcha/station.glb',
    at:[origin[0],y,origin[1]],angle,fallback,fallbackMaterial:material,loadSurface:load,range:15,exitRange:19,
    eyeHeight:1.62,floorTolerance:2.8,viewBounds:[new T.Box3(new T.Vector3(-3.8,.01,-3.25),new T.Vector3(3.8,3.28,.04))],
    closeVisibleFrom:p=>{const dx=p.x-origin[0],dz=p.z-origin[1];
      const depth=-(dx*Math.sin(angle)+dz*Math.cos(angle));
      const along=dx*Math.cos(angle)-dz*Math.sin(angle);
      // An adjacent wine bay and the facing shop backs conceal the station.
      return depth> -5.3 && depth<3.6 && (depth<=0 || Math.abs(along-depth*.25)<3.97);
    }});
}
