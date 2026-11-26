import {sweetParkCoffeeThreshold} from '../sweetpark-threshold/model.js';
import {gangnamMatchaStation} from '../osulloc-matcha/model.js';
import {saltHouseGangnam} from '../salt-house-gangnam/model.js';
import {nespressoDisplay} from '../nespresso-gangnam/model.js';
import {gangnamCoffeebar} from '../intelligentsia-gangnam/model.js';
import {plan} from '../cinema-rotary/layout.js';
import {point,transverseGuide,transverseNorth} from './layout.js';

// Public transverse aisle and customer-facing shop thresholds, traced on the
// November 25 B1 guide in its 1823 × 1367 display coordinates.
const aisles=[[[724,777],[820,777],[820,798],[735,798],[735,808],[724,808]],
  transverseGuide];
const northFront=transverseNorth-1;
const storefronts=[
  ['와인하우스',[906,northFront],[968,northFront],-1,0x6b5544],
  ['네스프레소',[968,798],[1032,798],1,0x514940],
];
export function eastShoppingArcade(K,y){
  const height=4.45,top=y+height;
  const material=0xd9d1c3;
  function wall(a,b,lo=0,hi=height,mat=material,solid=true){
    K.wall(...plan(...a),...plan(...b),y+lo,y+hi,{mat,thick:.12,solid});
  }
  function cover(outline,floor='megabox_plaza_stone'){
    const poly=outline.map(v=>plan(...v));
    K.hpoly(floor,poly,y+.009,true);K.phys.addSurface(poly,y);
    K.hpoly('ssg_ceil',poly,top+.005,false);K.phys.addCeiling(poly,top+.005,{});
    return poly;
  }
  for(const outline of aisles){
    const poly=cover(outline);
    K.zone({name:'신세계 식품관 카페 통로',sub:'신세계 강남점 · 마켓과 영화관 방면',floor:'B1',poly,y0:y-.25,y1:top,priority:4});
  }
  // BO&MIE and the market continue from their existing enclosed frontages to
  // the cross-aisle. Maintain the guide's open west and east turns at 777–798.
  wall([819,727],[819,776]);wall([841,727],[841,northFront]);
  wall([724,777],[777,777]);wall([777,777],[819,777]);
  wall([841,northFront],[906,northFront]);wall([724,777],[724,808]);
  wall([724,808],[735,808]);wall([735,808],[735,798]);
  // Each facing bay has a real opening and a shallow return into its tenant
  // area. Only the public threshold depth is represented on this cross-aisle.
  for(const [name,a,b,side,finish] of storefronts){
    const back=side<0 ? 764 : 810,left=[a[0],back],right=[b[0],back];
    const poly=cover([a,b,right,left],0xc9c2b5);
    wall(a,left);wall(left,right,0,height,finish);wall(right,b);
    wall(a,b,3.22,height);const x=(a[0]+b[0])/2;
    const centre=plan(x,a[1]-side*.67),front=plan(x,a[1]-side*2);
    if(name==='네스프레소')nespressoDisplay(K,y);
    else K.sign(name,{x:centre[0],z:centre[1],y:y+3.62,w:2.45,h:.4,bg:'#ded8cd',fg:'#3b3731',
      rotY:Math.atan2(front[0]-centre[0],front[1]-centre[1])});
    K.zone({name,sub:'신세계 강남점 · 지하1층',floor:'B1',poly,y0:y-.2,y1:top,priority:5});
  }
  saltHouseGangnam(K,y);
  gangnamCoffeebar(K,y);
  gangnamMatchaStation(K,y);
  sweetParkCoffeeThreshold(K,y);
  // The signed public entrance is between O’Sulloc and Nespresso. The island
  // counter inside Sweet Park is a different stop on the same visitor map.
  const [entryX,entryZ]=plan(973,787.5),[lookX,lookZ]=plan(1025,787.5);
  const arrival={x:entryX,z:entryZ,y,yaw:Math.atan2(entryX-lookX,entryZ-lookZ)};
  K.spawn({name:'스위트 파크 입구',place:'shinsegae',floor:'B1',destinationId:'sweet-park',
    aliases:['신세계 스위트파크','Sweet Park','오설록 네스프레소 사이'],mapDestination:true,...arrival});
  K.zone({name:'스위트 파크 카페 통로',place:'shinsegae',floor:'B1',sub:'오설록 · 네스프레소',
    poly:[[969,transverseNorth],[1032,transverseNorth],[1032,798],[969,798]].map(p=>plan(...p)),
    y0:y-.1,y1:top,priority:5,mapArrival:arrival});
  // Retain the black south boundary of the unlabelled bay east of Osulloc.
  wall([1019,northFront],[1032,northFront]);
  // The NW edge follows the clipped display corners of Koryodang and Lush.
  // End the opposite return at the existing cinema arches, never across them.
  for(const [a,b] of [[[735,798],[820,798]],[[820,798],[820,816]],
    [[820,816],[759,874]],[[759,874],[744,889]],[[744,889],[678,950]],
    [[841,799],[841,837]],[[841,837],[803,873]],[[803,873],[778,896]]])wall(a,b);
  K.wall(...plan(778,896),...point(-6.08,0),y,top,{mat:material,thick:.12});
  K.wall(...point(6.08,0),...plan(696,971),y,top,{mat:material,thick:.12});
  // The circulation ceiling is independent of the narrower rendered floor.
  // Its returns meet neighboring shop partitions above eye level.
  for(const outline of [[[816,727],[845,727],[845,817],[816,818]],
    [[816,813],[845,834],[697,973],[676,949]]])K.hpoly('ssg_ceil',outline.map(v=>plan(...v)),top+.018,false);
  // Recessed linear fixtures in the visiting path; surrounding casework uses
  // the same plaster and pale stone as the department's adjoining public area.
  for(const [a,b] of [[[825,730],[825,770]],[[845,transverseNorth+6],[1026,transverseNorth+6]],
    [[825,800],[825,814]],[[823,825],[681,958]]]){
    wall(a,b,height-.07,height-.035,{tex:'emit',color:0xfff1da},false);
  }
}
