// The service carriageway runs beside Sapyeong-daero. Its eastern fork and
// hotel turn are real street junctions, separate from the parking-lot aisles.
import { gardenPoint, gardenStation, gardenGrade, gardenSurface } from './_gardenGrade.js';

export const frontageWays = [907930149, 830683723, 816395055];
const stone = {tex:'concrete',color:0xab9586};
const verge = {tex:'grass',color:0xaaba8b};
const profile = s => s >= -26 ? gardenGrade(s) :
  .05 + (11.5-.05)*Math.max(0,(s+112)/86);

// Bank and drive share edges. Subdivide across oblique grades so both the
// player and the visible surface follow the slope through the curved fork.
function bank(K, a, b, c, d, material) {
  const mix = (p,q,t) => p.map((v,j)=>v+(q[j]-v)*t);
  const vertices=[a,b,c,d];
  K.quad(material,vertices,[0,1,0],vertices.map(([x,,z])=>[gardenStation(x,z)/4,vAt(x,z)/4]));
  const count = Math.max(1,Math.ceil(Math.hypot(b[0]-a[0],b[2]-a[2])/1.5));
  for (let i=0;i<count;i++) {
    const t=(i+.5)/count, inner=mix(a,b,t), outer=mix(d,c,t);
    const length=Math.hypot(outer[0]-inner[0],outer[2]-inner[2]);
    if(length<.02) continue;
    const nx=(outer[2]-inner[2])/length, nz=(inner[0]-outer[0])/length;
    const width=Math.max(Math.abs((a[0]-b[0])*nx+(a[2]-b[2])*nz),
      Math.abs((c[0]-d[0])*nx+(c[2]-d[2])*nz));
    K.phys.addRamp(inner[0],inner[2],outer[0],outer[2],width/(2*count)+.02,inner[1],outer[1],{tag:'streets'});
  }
}
const xyz = ([x,z],y) => [x,y,z];
const vAt = (x,z) => .4448*(x-71.26)+.89563*(z-143.25);

export function buildGardenFrontage(K, road) {
  const points = [];
  for (const id of frontageWays) {
    const way=K.osm.roads.find(r=>r.id===id);
    for (const p of way.pts) {
      const last=points.at(-1);
      if(!last) { points.push(p); continue; }
      const length=Math.hypot(p[0]-last[0],p[1]-last[1]);
      if(length<.01) continue;
      const n=Math.ceil(length/5);
      for (let i=1;i<=n;i++) points.push(last.map((v,j)=>v+(p[j]-v)*i/n));
    }
  }
  const heights=points.map(p=>profile(gardenStation(...p)));
  // The public fork helper owns the island on the outside of the east bend.
  const sections=road(points,heights,3.05);
  for(let i=1;i<points.length;i++) {
    const s=gardenStation(...points[i]);
    const side=(idx,offset,y)=>xyz(sections[idx](offset),heights[idx]+y);
    const pair=(idx,offset)=>side(idx,offset,.052);
    const j=i-1;
    // A flush shoulder keeps every parking and hotel turn open to vehicles.
    for (const sign of [-1,1]) bank(K,pair(j,sign*3.05),pair(i,sign*3.05),
      pair(i,sign*4.1),pair(j,sign*4.1),'sidewalk');
    const edge=(idx,v,y)=>xyz(gardenPoint(gardenStation(...points[idx]),v),y);
    if(s<=396.5 && s>=-26) {
      const inside=idx=>{
        const t=gardenStation(...points[idx]);
        const boundary=t<372?46.5:t<390?46.5-(t-372)*5.7/18:40.8-(t-390)*6.3/6.5;
        return edge(idx,boundary-.12,gardenSurface(t,boundary)+.025);
      };
      bank(K,pair(j,4.1),pair(i,4.1),inside(i),inside(j),s>360?verge:'sidewalk');
    }
    if (s>308) continue;
    // Outer verge narrows above the main road. Its crest carries a parapet;
    // the planted slope returns to the unraised outside street at the toe.
    const toe = idx => {
      const t=gardenStation(...points[idx]);
      const v=Math.max(vAt(...points[idx])+7, Math.min(74,61+(60-t)*.11));
      return edge(idx,v,.035);
    };
    bank(K,pair(j,-4.1),pair(i,-4.1),toe(i),toe(j),verge);
    if(heights[i]<1.5) continue;
    const p=sections[j](-4), q=sections[i](-4);
    const barrier=(lo,hi,color)=>K.quad(color,[xyz(p,heights[j]+lo),xyz(q,heights[i]+lo),
      xyz(q,heights[i]+hi),xyz(p,heights[j]+hi)],[.4448,0,.89563]);
    barrier(.05,.35,stone);
    K.quad(stone,[side(j,-3.84,.35),side(i,-3.84,.35),side(i,-4,.35),side(j,-4,.35)],[0,1,0]);
    K.quad(stone,[side(i,-3.84,.05),side(j,-3.84,.05),side(j,-3.84,.35),side(i,-3.84,.35)],[-.4448,0,-.89563]);
    K.phys.addWall(...p,...q,Math.min(heights[i],heights[j])-.06,Math.max(heights[i],heights[j])+.72,.1,'streets');
  }
  // Trees and planting on the garage side of the bend rise with the pavement.
  for (const [s,v] of [[394,30],[386,37],[377,37],[360,40],[341,41],[325,41]]) {
    const [x,z]=gardenPoint(s,v), y=gardenSurface(s,v);
    K.box({x,z,y:y+.05,w:3,d:1.2,h:.34,rotY:.46,mat:stone,solid:true});
    K.box({x,z,y:y+.39,w:2.9,d:1.12,h:.52,rotY:.46,mat:verge,solid:false});
    if(s!==386 && s!==341) K.tree(x,z,{y:y+.39,h:4.6,kind:'zelkova'});
  }
  // OSM's service loop passes the signed stop for Express Bus Terminal exit 3.
  // It rejoins the collector on either side of the platform.
  const busBay=K.osm.roads.find(r=>r.id===593858541).pts;
  const bayHeight=([x,z])=>gardenSurface(gardenStation(x,z),vAt(x,z));
  road(busBay,busBay.map(bayHeight),2.65);
  for(const s of [17,27,37,70,80,90]) {
    const v=44, [x,z]=gardenPoint(s,v), y=gardenSurface(s,v);
    K.box({x,z,y:y+.02,w:6.8,d:1.35,h:.38,rotY:.461,mat:stone,solid:true});
    K.box({x,z,y:y+.40,w:6.4,d:1.05,h:.46,rotY:.461,mat:verge,solid:false});
    if(s===27||s===80) K.tree(x,z,{y:y+.41,h:4.3,kind:'pine'});
  }
  // Wayfinding in the simulation: read the sign from the uphill direction.
  // Two paint strokes form a chevron flush with the rising asphalt.
  for (const target of [401,354]) {
    const i=points.findIndex(p=>gardenStation(...p)<=target);
    if(i<=0) continue;
    const a=points[i-1], b=points[i], dx=b[0]-a[0], dz=b[1]-a[1], len=Math.hypot(dx,dz);
    const off=sections[i](3.65), y=heights[i], rotY=Math.atan2(-dx,-dz);
    K.box({x:off[0],z:off[1],y,w:.12,d:.12,h:2.35,mat:0x4d5150,solid:false});
    K.sign(['오르막  ↑','데블스도어 · JW 메리어트'],{x:off[0],z:off[1],y:y+2.13,w:2.65,h:.82,
      rotY,bg:'#384b41',fg:'#fff9e8',box:.07});
    const paint=(along,across)=>{
      const p=[b[0]+(dx*along-dz*across)/len,b[1]+(dz*along+dx*across)/len];
      return xyz(p,heights[i]+(heights[i]-heights[i-1])*along/len+.085);
    };
    for(const side of [-1,1]) K.quad(0xeae8dc,[paint(-2,.88*side),paint(-2,1.18*side),
      paint(-.3,.15*side),paint(-.3,-.12*side)],[0,1,0]);
  }
  // Models the garden between the end of the parking block and the turn
  // towards the valet. Keep the hotel parking ramp west of this apron open.
  for(let s=-26;s<0;s+=2) {
    const row=t=>[[0,12.57],[16.72,12.57],[22,12.57],[39,11.5],[46.55,11.5]].map(([v,h])=>
      xyz(gardenPoint(t,v),11.5+(h-11.5)*(1+t/26)));
    const a=row(s), b=row(s+2);
    for(let k=1;k<a.length;k++) bank(K,a[k-1],b[k-1],b[k],a[k],k===1?verge:'sidewalk');
  }
}
