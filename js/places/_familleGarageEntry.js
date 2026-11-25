import { relief } from '../banpo_relief.js';
import { gardenPoint as P, gardenStation, hotelCourtDatum } from './_gardenGrade.js';

// Naver's March 2024 nOOQgVZmQWe4Z-qIb--3fg and the IHCF arrival
// photo place this portal opposite the hotel, at the end of the parked row.
// Below the photographed opening, the grade joins the model's existing 3F.
const mouth = -54.2, roof = -30.5, half = 3.3;
const entranceOffset = s => 9.3+.092*(s-mouth);
function axis(s) {
  if(s<=mouth)return 9.3;
  if(s<=-23)return entranceOffset(s);
  if(s<=-10)return entranceOffset(-23);
  return entranceOffset(-23)+(8.1-entranceOffset(-23))*Math.min(1,(s+10)/16);
}
const rotation = Math.atan2(.4448,.89563);
const rect = (a,b,c,d) => [P(a,b),P(c,b),P(c,d),P(a,d)];
export const familleRampOpening = [[mouth-.25,-1],[roof+.12,-1],[roof+.12,1],[mouth-.25,1]]
  .map(([s,side])=>P(s,entranceOffset(s)+side*(half+.15)));

// The upper court is assembled from two adjoining slabs. Keep their
// retaining faces out of the entrance as well as cutting their pavement.
export function garageWallOpening(a,b,y0,y1) {
  const limits = p=>{
    const s=gardenStation(...p), v=.4448*(p[0]-71.26)+.89563*(p[1]-143.25);
    const off=v-entranceOffset(s);
    return [s-mouth+.30,roof+.16-s,half+.25-off,half+.25+off];
  };
  const left=limits(a),right=limits(b);
  let lo=0,hi=1;
  for(let i=0;i<left.length;i++){
    if(left[i]<0 && right[i]<0) return [];
    if(left[i]<0)lo=Math.max(lo,-left[i]/(right[i]-left[i]));
    if(right[i]<0)hi=Math.min(hi,left[i]/(left[i]-right[i]));
  }
  if(hi<=lo)return [];
  const length=Math.hypot(b[0]-a[0],b[1]-a[1]);
  return [{at:(lo+hi)*length/2,w:(hi-lo)*length+.11,y0,y1}];
}
function height(s) {
  const court = x => 11.561 + hotelCourtDatum(...P(x,axis(x)));
  const garage = x => 9 + relief(...P(x,axis(x)));
  if (s <= mouth) return court(s);
  // Maintain the signposted 2.0 m clear height under the motor court.
  const covered = x => Math.min(garage(x),court(x)-.39-2.12);
  if (s < roof) {
    const t=(s-mouth)/(roof-mouth);
    return court(mouth)+(covered(roof)-court(mouth))*t;
  }
  if (s < -13) return covered(s);
  const t=Math.min(1,(s+13)/14);
  return covered(s)+(garage(s)-covered(s))*t;
}
const datum = (x,z) => height(gardenStation(x,z));

export function buildFamilleGarageEntry(K) {
  const white=0xe7e5dc, yellow=0xefc143, black=0x292c2c;
  const paving=(a,b,c,d,y,mat)=>K.hpoly(mat,rect(a,b,c,d),y);
  const box=(s,v,y,w,d,h,mat,solid=false)=>{
    const [x,z]=P(s,v);
    K.box({x,z,y,w,d,h,mat,rotY:rotation,solid});
  };
  const lane=(a,vA,b,vB,halfWidth)=>{
    K.slab([P(a,vA-halfWidth),P(b,vB-halfWidth),P(b,vB+halfWidth),P(a,vA+halfWidth)],0,
      {mat:a>=roof?{tex:'asphalt',color:0x737577}:'asphalt',under:'concrete',thick:.14,edge:false});
  };
  const approach=-72, start=-60;
  K.withTerrainSurface(datum,()=>{
    lane(approach,4.6,start,axis(mouth),half);
    lane(start,axis(mouth),mouth,axis(mouth),half);
    for(let s=mouth;s<7;s+=1.5){const end=Math.min(7,s+1.5);lane(s,axis(s),end,axis(end),half);}
    // The foot of the ramp opens straight onto the third-floor parking aisle.
    K.zone({name:'파미에 주차장',floor:'3F',sub:'차량 진입로',poly:[P(roof,axis(roof)-half),P(7,axis(7)-half),P(7,axis(7)+half),P(roof,axis(roof)+half)],y0:-.1,y1:2.05,priority:12});
    // Naver shows white sidewalls, two lanes, a black/yellow island and
    // contrasting transverse pavement strips. The first section is open to sky.
    for(const side of [-1,1]){
      const v=axis(mouth)+side*(half+.04);
      for(let s=mouth;s<roof;s+=1.5){
        const end=Math.min(roof,s+1.5);
        const offset=side*(half+.04);
        const a=P(s,axis(s)+offset), b=P(end,axis(end)+offset);
        const bottom=Math.min(height(s)-hotelCourtDatum(...a),height(end)-hotelCourtDatum(...b))-.08;
        K.withTerrainSurface(hotelCourtDatum,()=>K.wall(...a,...b,bottom,11.97,{mat:white,thick:.20}));
      }
      box(mouth,v,0,.26,.28,2.5,black,true);
      for(let i=0;i<4;i++)box(mouth-.035,v,.13+i*.21,.31,.31,.1,yellow);
    }
    for(let s=mouth+1.25;s<roof-1;s+=.85){
      const end=Math.min(roof-1,s+.85);
      box((s+end)/2,axis((s+end)/2),.015,end-s,.35,.13,Math.round((s-mouth-1.25)/.85)%2?black:yellow,true);
    }
    for(let s=mouth+1.6;s<roof-1;s+=1.45){
      for(const side of [-1,1])paving(s,axis(s)+side*.31,s+.23,axis(s)+side*(half-.19),.018,0x8c8d88);
    }
    paving(mouth-.65,axis(mouth)-half,mouth-.45,axis(mouth)+half,.016,black);
    box(mouth,axis(mouth),2.02,.27,2*half+.43,.43,black);
    const [x,z]=P(mouth-.16,axis(mouth));
    K.sign(['신세계 파미에주차장     2.0m','SHINSEGAE FAMILLE PARKING LOT'],{
      x,z,y:2.24,w:5.9,h:.39,rotY:rotation-Math.PI/2,bg:'#25282a',fg:'#f5f2e5'});
    // White concrete portal and black/yellow clearance stripe at the low end.
    box(roof,axis(roof),2.09,.35,2*half+.42,.54,white);
    for(let i=0;i<12;i++)box(roof-.19,axis(roof)+(i-5.5)*.54,2.12,.05,.54,.09,i%2 ? black : yellow);
    // The asphalt continues beneath an enclosed soffit to the existing deck.
    for(let s=roof;s<5;s+=2){
      const end=Math.min(s+2,5), mid=(s+end)/2;
      const quad=[P(s,axis(s)-half),P(end,axis(end)-half),P(end,axis(end)+half),P(s,axis(s)+half)];
      K.hpoly(0x565952,quad,2.09,false);
      K.phys.addCeiling(quad,2.09);
      if(s < 1){
        for(const side of [-1,1]){
          const offset=side*(half+.04), stop=Math.min(end,1);
          K.wall(...P(s,axis(s)+offset),...P(stop,axis(stop)+offset),-.08,2.10,{mat:0x73756d,thick:.18});
        }
      }
      if(Math.round((s-roof)/2)%3===0)
        box(mid,axis(mid)+1.4,2.055,.96,.12,.035,{tex:'emit',color:0xf3ead2});
    }
  });
  // The March panorama shows a low stone bed of pines beside the mouth
  // and a freestanding black hotel sign on the opposite side.
  K.withTerrainSurface(hotelCourtDatum,()=>{
    const bed=[[mouth-.3,13.1],[mouth-.8,14.0],[mouth-.45,17.5],
      [-31.2,19.1],[-30.8,15.5],[-45.5,14.1]].map(([s,v])=>P(s,v));
    K.slab(bed,12.25,{mat:0x534f40,under:0x977a70,edgeMat:0x997f77,thick:.68});
    for(const [s,v,h] of [[-51,15.6,5.1],[-41.4,16.4,5.8],[-34.5,17.1,4.5]]){
      const [x,z]=P(s,v);
      K.tree(x,z,{y:12.25,h,kind:'pine'});
    }
    const s=mouth+1.15, v=axis(mouth)-half-2.08;
    box(s,v,11.57,.29,3.35,1.5,0x272a2a);
    const [x,z]=P(s-.16,v);
    K.sign(['JW MARRIOTT','S E O U L'],{x,z,y:12.36,w:2.9,h:.66,rotY:rotation-Math.PI/2,bg:'#272a2a',fg:'#e9e6de'});
  });
}
