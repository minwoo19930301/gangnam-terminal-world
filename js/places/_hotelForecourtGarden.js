import { gardenPoint, gardenStation, gardenSurveyY, hotelCourtDatum } from './_gardenGrade.js';
import { exteriorReliefEnabled } from '../banpo_relief.js';

// The garden between the hotel canopy and the south collector is a roof
// terrace. In the March 2024 Naver panorama nHFwOb1TMb4z9JZ7I7Mmcw its
// stone paths, basins and planting are almost level with the parked cars.
export function buildHotelForecourtGarden(K) {
  const rise = .065;
  const point = (s,q) => gardenPoint(s,q + (s+104)*rise);
  const rotation = Math.atan2(.4448,.89563) - Math.atan(rise);
  const bounds = (a,b,c,d) => [point(a,b),point(c,b),point(c,d),point(a,d)];
  const datum = (x,z) => {
    const s=gardenStation(x,z);
    const q=.4448*(x-71.26)+.89563*(z-143.25) - (s+104)*rise;
    const court=hotelCourtDatum(x,z)+11.68;
    const road=exteriorReliefEnabled()?gardenSurveyY(17.69)+.1:11.59;
    const toRoad=Math.max(0,Math.min(1,(q-36)/7.2));
    return court + (road-court)*toRoad;
  };
  // After the Famille ramp diverges, its white sidewall occupies the north
  // edge of the planted bed. Leave the open cut and both traffic lanes clear.
  const front=s=>s< -60?10.62:10.62+3.65*Math.min(1,(s+60)/5);
  const box=(s,q,y,w,d,h,mat,solid=false)=>{
    const [x,z]=point(s,q);K.box({x,z,y,w,d,h,rotY:rotation,mat,solid});
  };
  const stone=0x9d7972, coping=0xcbb2a4, hedge=0x455536;
  K.texture('jw-court-granite',192,192,(g,w,h)=>{
    const r=K.rand(7382);
    g.fillStyle='#998982';g.fillRect(0,0,w,h);
    for(let j=0;j<8;j++) for(let i=-1;i<6;i++) {
      const n=Math.floor(r()*15),x=(i+(j%2)*.5)*w/5,y=j*h/8;
      g.fillStyle='rgb('+(191+n)+','+(166+n)+','+(151+n)+')';
      g.fillRect(x+.7,y+.7,w/5-1.3,h/8-1.2);
    }
  },[3.6,3.6]);
  K.texture('jw-court-water',128,128,(g,w,h)=>{
    g.fillStyle='#695b5b';g.fillRect(0,0,w,h);
    const r=K.rand(73);
    for(let i=0;i<230;i++){
      g.fillStyle=i%3?'rgba(216,209,197,.17)':'rgba(50,63,67,.27)';
      g.fillRect(r()*w,r()*h,1+r()*14,.5+r()*.9);
    }
  },[4,3]);
  K.withTerrainSurface(datum,()=>{
    const sections=[-105,-99,-94,-89,-83,-77,-71,-65,-60,-55,-49,-43,-37,-31];
    // Short slabs follow the two surveyed approaches without the huge grass
    // wedge that formerly sank through the garden and the road behind it.
    for(let i=1;i<sections.length;i++){
      const a=sections[i-1],b=sections[i];
      const westEdge=q=>a===sections[0]?a-.085*(q-10.62):a;
      const rows=[front,()=>18,()=>28,()=>36,()=>40,()=>43.4];
      for(let j=1;j<rows.length;j++){
        const low=rows[j-1],high=rows[j];
        const patch=[point(westEdge(low(a)),low(a)),point(b,low(b)),point(b,high(b)),point(westEdge(high(a)),high(a))];
        K.slab(patch,0,{mat:'jw-court-granite',under:'concrete',thick:.34,edge:false});
        if(j===1 || j===rows.length-1 || i===1 || i===sections.length-1){
          const sides=[];
          if(j===1)sides.push([0,1]);
          if(j===rows.length-1)sides.push([2,3]);
          if(i===1)sides.push([3,0]);
          if(i===sections.length-1)sides.push([1,2]);
          for(const [k,l] of sides)K.wall(...patch[k],...patch[l],-.34,.01,{thick:.12,mat:coping,solid:false});
        }
      }
    }
    // Axial water court: five shallow rectangular basins, divided by
    // pink granite crosswalks. Cube lamps stand in pairs on low plinths.
    for(const q of [11.6,16.8,22,27.2,32.4]){
      const end=q+4.18;
      K.slab(bounds(-81.1,q,-69.2,end),.08,{mat:stone,edgeMat:stone,thick:.085,ceil:false});
      K.hpoly({tex:'jw-court-water',gloss:.85},bounds(-80.83,q+.22,-69.47,end-.22),.084);
      for(const s of [-81.1,-69.2]) {
        box(s,end-.2,.08,.9,.9,.42,stone);
        box(s,end-.2,.50,.64,.64,.49,{tex:'emit',color:0xd9ded1});
        box(s,end-.2,.99,.70,.70,.07,0x535851);
        for(const dx of [-.31,.31]) for(const dz of [-.31,.31])
          box(s+dx,end-.2+dz,.49,.035,.035,.51,0x515650);
      }
    }
    const trimmed=(s,q,h,r)=>{
      // Closed trimmed silhouette, broader and slightly rounded at its base.
      const ring=(rad,level)=>Array.from({length:12},(_,j)=>{
        const angle=j*Math.PI/6;
        const [x,z]=point(s+rad*Math.cos(angle),q+rad*Math.sin(angle));
        return [x,level,z];
      });
      const levels=[[.91,0],[1,.13],[.79,.49],[.43,.83],[.14,1]];
      for(let k=1;k<levels.length;k++){
        const A=ring(r*levels[k-1][0],.49+h*levels[k-1][1]),B=ring(r*levels[k][0],.49+h*levels[k][1]);
        for(let j=0;j<A.length;j++){
          const n=(j+1)%A.length,a=(j+.5)*Math.PI/6-rotation;
          K.quad(j%3===1?0x4c6139:0x536440,[A[j],A[n],B[n],B[j]],[Math.cos(a),.33,Math.sin(a)]);
        }
      }
      const [x,z]=point(s,q);
      K.cyl({x,z,y:.48+h,r:.14*r,h:.015,seg:12,mat:0x52623c,solid:false});
    };
    for(const [left,right] of [[-92.1,-83.5],[-66.8,-57.9]]){
      for(const q of [13.6,18.9,24.2,29.5,34.7]) {
        K.slab(bounds(left,q,right,q+3.5),.27,{mat:0x6c604d,edgeMat:stone,thick:.27,ceil:false});
        box((left+right)/2,q+1.75,.27,right-left-.35,3.12,.42,hedge);
        trimmed((left+right)/2,q+1.75,2.45,1.45);
      }
    }
    // The west and east margins are broad continuous planted beds. Preserve
    // the stone footpaths around them and the three pines at the garage mouth.
    for(const [a,b,q,end] of [[-103.8,-94.7,12.4,37.5],[-55.3,-32.3,20.3,38.3]]){
      K.slab(bounds(a,q,b,end),.26,{mat:{tex:'grass',color:0x879269},edgeMat:stone,thick:.26,ceil:false});
      for(const edge of [q+.75,end-.7])box((a+b)/2,edge,.26,b-a-.7,1.05,.68,hedge);
    }
    for(const [s,q,h,kind] of [[-99.8,14.9,7.7,'zelkova'],[-100.5,22.2,6.8,'pine'],[-98.6,29.7,7.8,'zelkova'],
      [-101,34.3,5.9,'pine'],[-52,24.6,6.8,'zelkova'],[-41.3,24,6.2,'pine'],[-35.9,30.9,6.1,'zelkova'],
      [-48.3,35.4,7.8,'zelkova'],[-91,38.8,6.5,'zelkova']]){
      const [x,z]=point(s,q);K.tree(x,z,{y:.28,h,kind});
    }
    // Row of flagpoles on the south side of the water garden.
    for(let j=0;j<9;j++){
      const s=-83.9+j*2.23,q=38.5,[x,z]=point(s,q),h=j===4?7.4:6.65;
      K.cyl({x,z,y:.04,r:.21,h:.22,mat:coping,seg:8,solid:false});
      K.cyl({x,z,y:.25,r:.045,h,mat:0x929693,seg:6,solid:false});
      const a=point(s+.04,q),b=point(s+1.1,q+.17),c=point(s+1.86,q+.07);
      for(const [p,t,offset] of [[a,b,0],[b,c,.10]]){
        const cloth=[[p[0],h-.75-offset,p[1]],[t[0],h-.86-offset,t[1]],[t[0],h+.05-offset,t[1]],[p[0],h+.16-offset,p[1]]];
        K.quad(0xe8e4d9,cloth,[.44,0,.90]);K.quad(0xe8e4d9,[...cloth].reverse(),[-.44,0,-.90]);
      }
      if(j===4){
        for(const [offset,colour] of [[-.04,0x395982],[.15,0x9b4a53]]){
          const p=point(s+.93,q+.13);K.dome({x:p[0],z:p[1],y:h-.36+offset,rx:.18,rz:.12,ry:.12,hemi:false,seg:10,rings:4,mat:colour});
        }
      }
    }
  });
}
