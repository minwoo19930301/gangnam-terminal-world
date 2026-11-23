import { buildAtriumArt } from './famille_atrium_art.js';
import { diningRoom } from './famille_dining.js';
import { buildFourb } from './famille_dining_a.js';

const cx = -47, cz = 214.6;
const y2 = 5, y3 = 9.6, roofY = 23.4;
// The avenue past the flower shop and emart arrives from the north. The
// café and the moving stairs share that axis; the dome stays on its OSM drum.
const courtX = -42.6, boardingZ = 197.8, landingZ = 208.8, onwardZ = 212.4, reserveZ = 220.8;
const laneOffset = 5.2, flightWidth = 1.45;
const rectangle = (x0,z0,x1,z1) => [[x0,z0],[x1,z0],[x1,z1],[x0,z1]];

// The flights expose a sloping stainless underside above the ground-floor café.
function suspendedFlight(K, x, z0, z1, ya, yb, dir, tube) {
  const w = flightWidth, length = Math.abs(z1-z0), travel = Math.sign(z1-z0);
  const count = Math.round((yb-ya)/.17);
  const pos = (dx,z,y) => [x+dx,y,z];
  const span = (z,y) => [pos(-w/2,z,y),pos(w/2,z,y)];
  for (let i=0;i<count;i++) {
    const a = z0+(z1-z0)*i/count, b = z0+(z1-z0)*(i+1)/count;
    const bottom = ya+(yb-ya)*i/count, top = ya+(yb-ya)*(i+1)/count;
    const [a0,a1]=span(a,top), [b0,b1]=span(b,top);
    K.quad(0x555b5c,[a0,a1,b1,b0],[0,1,0]);
    K.quad(0x737777,[...span(a,bottom),a1,a0],[0,0,-travel]);
    const [lip0,lip1]=span(a+travel*.027,top+.003);
    K.quad(0xa9a895,[pos(-w/2,a,top+.003),pos(w/2,a,top+.003),lip1,lip0],[0,1,0]);
  }
  const skirt = .64;
  const [a0,a1] = span(z0,ya-skirt), [b0,b1] = span(z1,yb-skirt);
  K.quad(0x888f8e,[a0,a1,b1,b0],[0,-1,0]);
  for(const side of [-1,1]){
    const edge = side*(w/2+.055);
    const panel = (mat,low,high) => K.quad(mat,
      [pos(edge,z0,ya+low),pos(edge,z1,yb+low),pos(edge,z1,yb+high),pos(edge,z0,ya+high)],[side,0,0]);
    panel(0xa8adab,-skirt,.14);
    panel('glass',.14,.91);
    tube(pos(edge,z0,ya+.95),pos(edge,z1,yb+.95),.10,0x303536);
    // Physical rails stop at each comb plate and leave the area below walkable.
    const panels=Math.ceil(length);
    for(let i=0;i<panels;i++){
      const a=i/panels,b=(i+1)/panels;
      K.phys.addWall(x+edge,z0+(z1-z0)*a,x+edge,z0+(z1-z0)*b,
        ya+(yb-ya)*a-skirt,ya+(yb-ya)*b+1,.07,'centralcity');
    }
  }
  K.phys.addRamp(x,z0,x,z1,w/2,ya,yb,{move:[0,travel*(dir==='up'?.6:-.6)],tag:'centralcity'});
}

export function buildFamilleAtrium(K,{round,P,mouthWest,mouthEast,wallB1,ceiling,entryTubeWorld}) {
  const basement=K.LEVELS.B1, eave=11.7;
  // Exact rim segments shared with the arcade and upper terrace (OSM 593858530).
  const [east,middle,landing,north,west]=round.slice(6,11);
  const join=[mouthWest,mouthEast,east,middle,landing,north,west];
  const tile={tex:'tile',color:0xe6d9c2,gloss:.4};
  K.slab(join,0,{mat:tile,under:false,ceil:false,thick:.10});
  // The occupied exterior 2F terrace forms the middle of this ceiling. Its
  // flanks rise as clerestories, opening the lower plaza to the pavilion.
  const apronEdge=P(202.6,19), stairEdge=P(210.25,22.69);
  const axis=[Math.sin(Math.atan2(.3639,.9315)),Math.cos(Math.atan2(.3639,.9315))];
  const localS=p=>(p[0]+135.7)*axis[0]+(p[1]-9.9)*axis[1];
  const fraction=(210.25-localS(mouthEast))/(localS(east)-localS(mouthEast));
  const stairEnd=mouthEast.map((n,i)=>n+(east[i]-n)*fraction);
  const glazed={tex:'glass',color:0xaad0c0};
  const at=(p,y)=>[p[0],y,p[1]];
  function clerestory(poly,heights){
    const points=poly.map((p,i)=>at(p,heights[i]));
    for(let i=1;i<points.length-1;i++)K.quad(glazed,[points[0],points[i],points[i+1],points[i+1]],[0,1,0]);
    for(let i=0;i<points.length;i++)entryTubeWorld(points[i],points[(i+1)%points.length],.12,0x536b60);
    for(let i=2;i<points.length-1;i++)entryTubeWorld(points[0],points[i],.075,0x597467);
  }
  clerestory([mouthWest,apronEdge,landing,north,west],[4.78,4.78,8.3,8.9,9.0]);
  clerestory([stairEdge,stairEnd,east,middle],[4.79,4.79,8.9,8.3]);
  for(const [a,b] of [[mouthWest,west],[stairEnd,east],[apronEdge,landing],[stairEdge,middle]]){
    const high=(b===west||b===east)?8.9:8.3;
    const side=[at(a,4.66),at(b,4.66),at(b,high)];
    const dx=b[0]-a[0],dz=b[1]-a[1],len=Math.hypot(dx,dz);
    K.quad(glazed,[...side,side[2]],[dz/len,0,-dx/len]);
    for(const f of [.25,.50,.75]){
      const point=a.map((v,i)=>v+(b[i]-v)*f);
      entryTubeWorld(at(point,4.66),at(point,4.66+(high-4.66)*f),.075,0x586e62);
    }
  }
  for(const [a,b] of [[mouthWest,west],[mouthEast,east]]){
    K.wall(...a,...b,0,4.66,{mat:'ccFamBuffBrick',thick:.20});
    K.wall(...a,...b,.08,.26,{mat:0xc4b59a,thick:.23,solid:false});
    K.wall(...a,...b,3.92,4.06,{mat:0xece2cd,thick:.27,solid:false});
    const q=a.map((v,i)=>(v+b[i])/2);
    K.cyl({x:q[0],z:q[1],y:3.89,r:.22,h:.06,mat:{tex:'emit',color:0xffe7bc},solid:false});
  }
  K.zone({place:'famille',name:'파미에스테이션',floor:'1F',sub:'포비 · 중앙광장',poly:join,y0:-.1,y1:4.7,priority:10});

  // The slanted north rim leaves a continuous balcony behind the garden
  // bridge. It clears a standing passenger before the lower flight reaches it.
  const left = courtX-6.7, right = courtX+6.7;
  const northRim = [[left,199.7],[courtX,200.4],[right,204.2]];
  const wellTo = z => [...northRim,[right,z],[left,z]];
  const voidPoly = wellTo(reserveZ);
  const lift={x:-60.0,z:216.4}, shaft=rectangle(lift.x-1.1,lift.z-1.1,lift.x+1.1,lift.z+1.1);
  const stairWell=rectangle(-55.05,223.12,-44,226.48);
  // The B1 pair follows the southern crescent, clear of FOURB and both public flights.
  K.groundHole(stairWell);
  for(const [z,dir] of [[224,'up'],[225.6,'down']]) K.escalator(-54.4,z,-44,z,{ya:basement,yb:0,dir});
  for(const [a,b] of [[0,1],[2,3],[3,0]]) K.wall(...stairWell[a],...stairWell[b],0,1.03,{mat:'glass',thick:.04});
  K.slab(round,basement,{mat:{tex:'tile',color:0xc4b39c},under:false,ceil:false,holes:[shaft],edge:false});
  K.slab(round,0,{mat:tile,under:ceiling,holes:[shaft,stairWell]});
  const cafeDeck = round;
  const upperWell = rectangle(left,onwardZ,right,reserveZ);
  K.slab(round,y2,{mat:{tex:'wood',color:0xbf9e77},under:0xe7ddce,thick:.30,
    holes:[wellTo(landingZ),upperWell,shaft]});
  K.slab(cafeDeck,y3,{mat:{tex:'wood',color:0xad8d65},under:0xe7ddce,thick:.30,
    holes:[voidPoly,shaft]});

  function guard(a,b,level) {
    K.wall(...a,...b,level,level+1.02,{mat:'glass',thick:.04});
    entryTubeWorld(at(a,level+1.04),at(b,level+1.04),.075,0x514b42);
  }
  function railAcross(z,level,boarding=false) {
    const gap = flightWidth/2+.12;
    const lanes = [courtX-laneOffset,courtX+laneOffset];
    let from = left;
    for (const lane of boarding ? lanes : []) {
      guard([from,z],[lane-gap,z],level);
      from = lane+gap;
    }
    guard([from,z],[right,z],level);
  }
  for(const level of [y2,y3]){
    for(let i=1;i<northRim.length;i++) guard(northRim[i-1],northRim[i],level);
    for (const [x,z0] of [northRim[0],northRim.at(-1)]) {
      if (level===y2) {
        guard([x,z0],[x,landingZ],level);
        guard([x,onwardZ],[x,reserveZ],level);
      } else guard([x,z0],[x,reserveZ],level);
    }
    railAcross(reserveZ,level,level===y3);
  }
  railAcross(landingZ,y2,true);
  railAcross(onwardZ,y2,true);
  for(const side of [-1,1]){
    const x = courtX+side*laneOffset, dir = side>0?'up':'down';
    suspendedFlight(K,x,boardingZ,landingZ,0,y2,dir,entryTubeWorld);
    suspendedFlight(K,x,onwardZ,reserveZ,y2,y3,dir,entryTubeWorld);
  }
  K.elevator({name:'파미에스테이션 원형관 엘리베이터',...lift,rotY:Math.PI/2,w:2,d:2,topH:2.65,
    floors:[
      {label:'B1',y:basement,name:'7호선 연결통로'},{label:'1F',y:0,name:'포비 · 중앙광장'},
      {label:'2F',y:y2,name:'파미에 식당가'},{label:'3F',y:y3,name:'스타벅스 파미에파크R'}
    ]});

  // Leave only the rim segments actually occupied by the connecting floors open.
  const ns=K.orient(round);
  for(let i=0;i<round.length;i++){
    const a=round[i],b=round[(i+1)%round.length],mz=(a[1]+b[1])/2;
    const ix=-ns[i][0]*.15,iz=-ns[i][1]*.15;
    K.wall(a[0]+ix,a[1]+iz,b[0]+ix,b[1]+iz,mz<202.5?basement+3.4:basement,-.3,{mat:wallB1,thick:.3});
    const wall=(lo,hi,mat,options={})=>K.wall(...a,...b,lo,hi,{mat,thick:.075,...options});
    const upperBridge=i===7, arcade=i>=6&&i<=9, street=i===0;
    const glass={tex:'glass',color:0xc4d8d2};
    if(!arcade){
      const openings=street?[{at:Math.hypot(b[0]-a[0],b[1]-a[1])/2,w:3.2,y0:0,y1:2.9}]:[];
      wall(0,.35,'ccStone',{openings});
      wall(.35,y2,glass,{openings});
    }
    if(!upperBridge) {
      wall(y2,y2+.25,0xc5ae90);
      wall(y2+.25,y3,glass);
      wall(y3,y3+.25,0xb7a28b);
      wall(y3+.25,eave,glass);
    }else{
      wall(y2+3.3,y3,0xb9b7aa);
    }
    const post=(lo,hi)=>K.box({x:a[0],z:a[1],w:.14,d:.14,y:lo,h:hi-lo,mat:0x40594e,solid:false});
    post(arcade?y2:0,eave);
    for(const [lo,hi] of [[0,y2],[y2,y3],[y3,eave]]){
      if((lo===0&&arcade)||(lo>0&&upperBridge)||(lo===0&&street)) continue;
      const x=(a[0]+b[0])/2,z=(a[1]+b[1])/2;
      K.box({x,z,w:.075,d:.075,y:lo,h:hi-lo,mat:0x496053,solid:false});
    }
  }

  // The bakery turns toward the arriving arcade, tucked against the eastern
  // return. Its seating extends into the well between the moving stairs.
  const room=diningRoom(K,[-41.1,187.8],-2.45,7.4,10.5,0,12);
  K.detail({name:'포비 강남',floor:'1F',poly:room.poly,y0:0,y1:roofY},()=>{
    buildFourb(room);
    for (const point of [[courtX-2.2,204.6],[courtX+2.2,204.6],[courtX-2.2,200.8]]) {
      const tables=diningRoom(K,point,0,1.5,1.4);
      tables.table(0,0,.9,.7,0xa68060);
      tables.seat(0,-.65,1,0x786048);
      tables.seat(0,.65,-1,0x786048);
    }
  });
  K.zone({place:'famille',name:'포비 · 파미에 중앙광장',floor:'1F',sub:'FOURB',
    poly:room.poly,y0:-.1,y1:4.7,priority:12});
  const memorial={x:courtX,wallZ:landingZ,birdsZ:205.2,galleryWidth:7.65};
  buildAtriumArt(K,{cx,cz,y2,y3,roofY,round,cafeDeck,voidPoly,memorial,entryTubeWorld});
  for(const [name,floor,sub,y0,y1,priority] of [
    ['파미에스테이션 원형관','B1','7호선 연결통로',basement-.4,-.3,8],
    ['포비 · 파미에 중앙광장','1F','FOURB',-.1,y2-.3,11],
    ['파미에스테이션 중앙광장','2F','식당가 · 외부 테라스',y2-.3,y3-.3,11],
    ['스타벅스 파미에파크R','3F','파미에스테이션',y3-.3,roofY,12]
  ]) K.zone({place:'famille',name,floor,sub,poly:round,y0,y1,priority});
  K.sign(['지하철 7호선 연결','파미에스테이션 1층 ↑'],{x:-45,z:200.2,y:basement+3,w:6,h:.9,bg:'#282923',fg:'#f0e6c8'});
  K.spawn({place:'famille',group:'파미에스테이션',name:'포비 · 중앙광장',x:courtX+.4,z:195.8,y:0,yaw:Math.PI});
  K.spawn({place:'famille',group:'파미에스테이션',name:'스타벅스 파미에파크R · 3층',x:cx,z:cz+7.7,y:y3,yaw:0});
}
