import {boxSilhouette} from '../interior-architecture/box-silhouette.js';
import {placeSingleDetail} from '../interior-architecture/single-detail.js';
import {arc,bookEdge,bookFloor,outward,cafeFloor,cafeFront,cafePoint,centre,court,plan,rotation,shoeFront,shoeRear,shoeThreshold,westApron} from './layout.js';

import {sportsShoeEntry} from '../sports-shoe-rotary/model.js';

export function publicRotary(K,y){
  const top=y+4.45;
  const stone='megabox_plaza_stone', ceiling='ssg_ceil';
  for(const [poly,mat] of [[court,stone],[westApron,stone],[bookFloor,0x9b8f7b],[cafeFloor,0x353434],[shoeThreshold,0xb3afa8]]){
    K.hpoly(mat,poly,y+.008,true);
    K.phys.addSurface(poly,y);
    K.hpoly(ceiling,poly,top+.005,false);
    K.phys.addCeiling(poly,top+.005,{});
  }
  K.zone({name:'메가박스 앞 원형 광장',sub:'카멜커피 · 영풍문고 앞',floor:'B1',poly:court,y0:y-.25,y1:top,priority:7});
  K.zone({name:'원형 광장 옆 통로',sub:'신세계백화점 강남점 · 행사장 앞',floor:'B1',poly:westApron,y0:y-.25,y1:top,priority:4});
  K.zone({name:'카멜커피',sub:'신세계백화점 강남점',floor:'B1',poly:cafeFloor,y0:y-.25,y1:top,priority:8});
  const wall=(a,b,lo,hi,mat,solid=true)=>K.wall(...a,...b,y+lo,y+hi,{mat,thick:.1,solid});
  function edge(points,mat){
    for(let i=1;i<points.length;i++)wall(points[i-1],points[i],0,4.45,mat);
  }
  // The cinema wall and the bookstore front enclose the public side. Openings
  // on the customer guide remain open to the existing diagonal and the west.
  edge([[696,971],...arc(-32,13,8),[710,1028]].map(p=>plan(...p)),0xcac1b2);
  // Close the visible end of the B1 showroom with a recessed public bay.
  // The 2024 branch photograph shows gray masonry and bands of warm ceiling light.
  K.zone({name:'스포츠 슈 전문관',sub:'신세계 강남점 · 원형 광장 옆',floor:'B1',poly:shoeThreshold,y0:y-.25,y1:top,priority:6});
  edge([shoeFront[0],...shoeRear,shoeFront.at(-1)],0xa39d94);
  sportsShoeEntry(K,y);
  const bookArc=arc(61,130,11).map(p=>plan(...p));
  edge([plan(686,1063),...bookArc.slice(0,3)],0xc0b4a4);
  edge(bookArc.slice(7,11),0xc0b4a4);
  // Only the court-facing threshold and shelf face are modelled. The public
  // photograph shows an open doorway under a dark illuminated store sign.
  const rear=bookEdge.map(p=>outward(p,1.65));
  edge([bookEdge[0],...rear,bookEdge.at(-1)],0x9f8f74);
  const mid=outward([(bookEdge[2][0]+bookEdge[3][0])/2,(bookEdge[2][1]+bookEdge[3][1])/2],.02);
  const bookAngle=Math.atan2(centre[0]-mid[0],centre[1]-mid[1]);
  const point=(x,depth)=>[mid[0]+x*Math.cos(bookAngle)-depth*Math.sin(bookAngle),
    mid[1]-x*Math.sin(bookAngle)-depth*Math.cos(bookAngle)];
  for(const [left,right,depth,thick,high] of [[-.69,.69,.67,.59,.80],[-2.34,-1.56,.87,.67,1.72]]){
    K.phys.addWall(...point(left,depth),...point(right,depth),y,y+high,thick);
  }
  K.zone({name:'영풍문고 강남신세계점',sub:'원형 광장 쪽 매장 입구',floor:'B1',poly:bookFloor,y0:y-.25,y1:top,priority:8});
  const bookMaterial=new K.THREE.MeshLambertMaterial({vertexColors:true,side:K.THREE.DoubleSide});
  bookMaterial.onBeforeCompile=shader=>{
    shader.fragmentShader=shader.fragmentShader.replace('#include <emissivemap_fragment>',
      `#include <emissivemap_fragment>
       totalEmissiveRadiance += smoothstep(.81,.95,vColor.g)*vColor.rgb*.46;`);
  };
  const bookFallback=boxSilhouette(K.THREE,[[0,3.04,0,5.10,1.40,.15,0x969997],
    [0,3.24,.18,3.70,.26,.09,0x282a2b],[0,0,-.67,1.36,.52,.59,0x98764e]]);
  placeSingleDetail(K,{name:'영풍문고 강남신세계점 · 원형 광장 입구',file:'../ypbooks-rotary/front.glb',
    at:[mid[0],y,mid[1]],angle:bookAngle,fallback:bookFallback,fallbackMaterial:bookMaterial,material:bookMaterial,
    range:18,exitRange:22,floorTolerance:3.5,eyeHeight:1.7,
    viewBounds:[new K.THREE.Box3(new K.THREE.Vector3(-2.57,0,-1.66),new K.THREE.Vector3(2.57,4.45,.34))]});

  edge([...arc(223,227,2),[623,950],[634,946],[646,944],[659,945],[669,948],[678,950]].map(p=>plan(...p)),0xcac4b7);
  for(const side of [
    [[406,1030],[434,1057],[593,1057]],
    [[570,998],[548,984],[519,963],[496,943],[480,922],[470,896],[467,872],[467,727]],
    [[498,727],[498,872],[502,894],[513,915],[530,932],[552,947],[575,958],[594,961]]
  ])edge(side.map(p=>plan(...p)),0xd8d0c1);
  for(const side of [-1,1])wall(cafePoint(3.12*side,-.08),cafePoint(3.12*side,-2.23),0,4.45,0xbcb1a0);
  wall(cafePoint(-3.16,-2.23),cafePoint(3.16,-2.23),0,4.45,0xb49b7b);
  // Low counters and seats are contained on the cafe side of the court.
  K.phys.addWall(...cafePoint(-.39,-1.01),...cafePoint(2.53,-1.01),y,y+1.05,.73);
  K.phys.addWall(...cafePoint(-2.77,-1.34),...cafePoint(-.67,-1.34),y,y+.86,.72);
  for(const x of [-2.46,-1.02])K.phys.addWall(...cafePoint(x-.09,-.69),...cafePoint(x+.09,-.69),y,y+.48,.32);
  const border=arc(-30,110,24).map(p=>plan(...p));
  const inset=(p,amount)=>{
    const dx=centre[0]-p[0],dz=centre[1]-p[1],len=Math.hypot(dx,dz);
    return [p[0]+amount*dx/len,p[1]+amount*dz/len];
  };
  for(let i=1;i<border.length;i++){
    const a=border[i-1],b=border[i];
    K.hpoly(0x9a8d7c,[inset(a,.12),inset(b,.12),inset(b,.47),inset(a,.47)],y+.013,true);
    // Two narrow luminous lines follow the curved public soffit beside the shop.
    wall(inset(a,.48),inset(b,.48),4.03,4.41,0xc5c1b7,false);
    for(const h of [4.06,4.31])
      wall(inset(a,.545),inset(b,.545),h,h+.035,{tex:'emit',color:0xffedce},false);
  }
  const T=K.THREE,mat=new T.MeshLambertMaterial({vertexColors:true,side:T.DoubleSide});
  // Spot lighting on the photographed plywood lining, reusing the single draw.
  mat.onBeforeCompile=shader=>{
    shader.fragmentShader=shader.fragmentShader.replace('#include <emissivemap_fragment>',
      `#include <emissivemap_fragment>
       float wood = smoothstep(.12,.26,vColor.r-vColor.b);
       totalEmissiveRadiance += wood*vColor.rgb*vec3(.57,.48,.34);
       float letter = smoothstep(.85,.97,vColor.r)*smoothstep(.79,.91,vColor.g);
       totalEmissiveRadiance += letter*vec3(.45,.36,.23);`);
  };
  const fallback=boxSilhouette(T,[[0,0,-2.11,6.28,3.0,.10,0xc49761],
    [0,2.92,-.08,6.26,1.48,.15,0xc0bdb2],[1.03,0,-1.01,2.95,1.04,.76,0x353331]]);
  placeSingleDetail(K,{name:'원형 광장 · 카멜커피 입면',file:'../cinema-rotary/front.glb',at:[cafeFront[0],y,cafeFront[1]],
    angle:rotation,fallback,fallbackMaterial:mat,material:mat,range:22,exitRange:26,floorTolerance:4,
    eyeHeight:1.9,viewBounds:[new T.Box3(new T.Vector3(-3.2,0,-2.3),new T.Vector3(3.2,4.45,.3))]});
  K.spawn({name:'B1 메가박스 원형 광장',x:centre[0],z:centre[1],y,yaw:Math.atan2(centre[0]-cafeFront[0],centre[1]-cafeFront[1])});
}
