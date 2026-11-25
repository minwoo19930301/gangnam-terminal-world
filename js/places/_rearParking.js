import { parkingRoof, eastParkingSecond, eastParkingThird } from './_gardenGrade.js';
// The outdoor aisle is at terminal grade. Its roof-level neighbour is the
// restaurant garden. Naver's January 2026 drive follows the north frontage.
export function buildRearParking(K) {
  const U=.89563, V=.4448, rot=Math.atan2(V,U);
  const P=(s,v)=>[71.26+U*s+V*v,143.25-V*s+U*v];
  const rect=(a,b,c,d)=>[P(a,b),P(c,b),P(c,d),P(a,d)];
  function box(s,v,y,w,d,h,mat,solid=false) {
    const [x,z]=P(s,v);
    K.box({x,z,y,w,d,h,mat,solid,rotY:rot});
  }

  // Linked panorama centres projected onto the parking building's long axis.
  // The bend by the police pavilion clears its mapped south corner.
  const stations=[[13.6,-43.8],[22.6,-37.1],[33.3,-34],[45,-30],[55.7,-31.2],
    [67.3,-35],[78.5,-37.2],[89.7,-37.3],[112.5,-36],[134.8,-33.8],
    [156.8,-30.7],[167.5,-25.4],[176.9,-19.6],[188.1,-17.4],[210.5,-17.5],
    [232.4,-16.6],[255.6,-16.2],[278,-14.1],[300.4,-14.1],[334.8,-13.8],
    [357.6,-14.7],[380,-14.8],[402.8,-13.5]];
  for(let i=1;i<stations.length;i++){
    const [s,v]=stations[i-1], [t,w]=stations[i];
    const inner=s<43?-6.3:-2;
    K.slab([P(s,v-3.65),P(t,w-3.65),P(t,inner),P(s,inner)],.025,
      {mat:'asphalt',thick:.045,ceil:false});
    // Along the eastern bus fence the route has a single yellow edge stripe.
    if(s>=188){
      K.hpoly(0xd8bb54,[P(s,v+2.95),P(t,w+2.95),P(t,w+3.04),P(s,v+3.04)],.039);
    }
  }
  // The apron opens out west of the flyover. Marked bays sit between the
  // active vehicle aisle and the building, with turning space at each end.
  const cars=[0xe4e6e4,0x353d45,0xd5d4ce,0x262e38,0x999b98];
  for(const [a,b,v] of [[54,96,-16],[105,151,-16],[160,176,-7],
    [231,261,-6],[268,287,-6]]){
    for(let s=a, i=0;s<b;s+=2.62,i++){
      K.hpoly(0xddd9cd,rect(s,v-2.4,s+.085,v+2.4),.044);
      if(i%4===1 && s+2.62<b){
        const [x,z]=P(s+1.31,v);
        K.vehicle({x,z,y:.035,rotY:rot,kind:'car',color:cars[(i+a)%cars.length]});
      }
    }
  }

  // The street-facing parking decks continue between the two OSM buildings.
  // Retain the southern route around the transverse service block at s197.
  const runs=[[104.85,160,1,1],[160,196,1,26],[196,196.75,26,26],[207.5,270,17,17]];
  const front=-1.4, floor={tex:'concrete',color:0x999a96};
  for(const [a,b,va,vb] of runs){
    const footprint=[P(a,front),P(b,front),P(b,vb),P(a,va)];
    for(const level of [0,5,9]){
      K.slab(footprint,level,{mat:floor,under:0x46494b,thick:.32});
    }
    if(b<=197) K.slab(footprint,12.6,{mat:'sidewalk',under:0x626564,thick:.3});
  }
  // Merge the upper decks down to the east wing's actual slab heights.
  for(const [y0,y1] of [[0,0],[5,eastParkingSecond],[9,eastParkingThird]]){
    K.ramp(...P(270,7.8),...P(291.72,7.8),{ya:y0,yb:y1,w:18.4,mat:floor,rails:false});
  }
  const pale=0xd5d7d4;
  for(const [a,b] of [[104.85,196.75],[207.5,291.7]]){
    const count=Math.ceil((b-a)/7.5);
    for(let i=0;i<=count;i++){
      const s=a+(b-a)*i/count;
      box(s,front+.12,0,.35,.42,parkingRoof(s)-.15,pale,true);
      if(i===count) continue;
      const pitch=(b-a)/count, mid=s+pitch/2, blend=Math.min(1,Math.max(0,(mid-270)/21.72));
      const second=5+(eastParkingSecond-5)*blend, third=9+(eastParkingThird-9)*blend;
      box(mid,front,second-.35,pitch,.47,.35,pale);
      // Upper stair landings open into the parking deck on the west side of the tower.
      const strips=[];
      if(s<219) strips.push([s,Math.min(s+pitch,219)]);
      if(s+pitch>220.6) strips.push([Math.max(s,220.6),s+pitch]);
      for(const [left,right] of strips){
        const c=(left+right)/2, width=right-left;
        for(const h of [.28,.62,.98]) box(c,front,second+h,width,.06,.048,0x565f61);
        K.phys.addWall(...P(left,front),...P(right,front),second,second+1.05,.04,'streets');
        box(c,front,third,width,.14,parkingRoof(c)-.24-third,0x909a9e);
        box(c,front-.09,third+.28,Math.max(.1,width-.22),.07,1.46,0x4e656a);
        for(const j of [1,2,3]) box(left+width*j/4,front-.15,third+.28,.065,.07,1.46,pale);
      }
      box(mid,front,third-.33,pitch,.47,.33,pale);
      box(mid,front,parkingRoof(mid)-.23,pitch,.46,.22,pale);
    }
  }
  // Glazed pedestrian stair tower in the January panorama near station 222.
  for(const s of [219,223.2])for(const v of [-4.8,-1.5])box(s,v,0,.14,.14,15,0x768596);
  const stairRoof = parkingRoof(219.8);
  for(const [lo,hi] of [[0,5],[5,9],[9,stairRoof]]){
    const mid=(lo+hi)/2;
    K.stairs(...P(219.8,-3.92),...P(222.4,-3.92),{ya:lo,yb:mid,w:1,mat:'metal',rails:false});
    K.slab(rect(222.4,-4.6,223.2,-1.5),mid,{mat:'metal',thick:.12});
    K.stairs(...P(222.4,-2.15),...P(219.8,-2.15),{ya:mid,yb:hi,w:1,mat:'metal',rails:false});
    K.slab(rect(219,-4.8,219.82,-1.32),hi,{mat:'metal',thick:.12});
    for(const level of [mid,hi])box(221.1,-4.8,level-.12,4.36,.14,.13,0x758395);
  }
  box(221.1,-3.15,15,4.36,3.42,.13,0x758395);
  for(const s of [219,223.2])box(s,-3.15,0,.045,3.3,15,'glass',true);
  K.wall(...P(219,-4.8),...P(223.2,-4.8),0,15,{mat:'glass',thick:.045,
    openings:[{at:2.1,w:1.55,y0:0,y1:2.2}]});
}
