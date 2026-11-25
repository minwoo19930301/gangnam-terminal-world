// The service carriageway runs beside Sapyeong-daero. Its eastern fork and
// hotel turn are real street junctions, separate from the parking-lot aisles.
import { gardenPoint, gardenStation, gardenGrade, gardenSurface, gardenTerrainEdge, gardenKerb, hotelCourtDatum, gardenSurveyY } from './_gardenGrade.js';

import { relief, exteriorReliefEnabled } from '../banpo_relief.js';
import { buildGardenArrival } from './_gardenArrival.js';
import { gardenLinkHeight } from './_gardenPublicFork.js';

export const frontageWays = [907930149, 830683723, 816395055];
const stone = {tex:'concrete',color:0xab9586};
const verge = {tex:'grass',color:0xaaba8b};

// Bank and drive share edges. Subdivide across oblique grades so both the
// player and the visible surface follow the slope through the curved fork.
function bank(K, a, b, c, d, material) {
  const vertices=[a,b,c,d].map(([x,y,z])=>[x,y+relief(x,z),z]);
  K.withTerrainSurface(0,()=>bankWorld(K,vertices,material));
}
function bankWorld(K,vertices,material) {
  const [a,b,c,d]=vertices,mix=(p,q,t)=>p.map((v,j)=>v+(q[j]-v)*t);
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
  const heights=points.map(p=>gardenGrade(gardenStation(...p),vAt(...p)));
  // The public fork helper owns the island on the outside of the east bend.
  const roadWorld=points.map((p,i)=>heights[i]+relief(...p));
  let sections;
  K.withTerrainSurface(0,()=>{
    sections=road(points,roadWorld,3.05);
  });
  // The guide bands in the January approach panorama run along the
  // collector. The pink band feeds the marked turn into the upper car park.
  K.withTerrainSurface(0,()=>{
    for(let i=1;i<points.length;i++) {
      const s=gardenStation(...points[i]);
      if(s<287 || s>388) continue;
      for(const [off,width,mat] of [[.8,.29,0xc07e94],[-.41,.27,0x8fada0],[2.88,.105,0xd9b64e]]){
        const a=sections[i-1],b=sections[i],y0=roadWorld[i-1]+.084,y1=roadWorld[i]+.084;
        K.quad(mat,[xyz(a(off),y0),xyz(b(off),y1),xyz(b(off+width),y1),xyz(a(off+width),y0)],[0,1,0]);
      }
    }
  });
  // Garden-frame offsets where the busier street's kerb and the two
  // slip lanes meet each frontage section. Road widths come from OSM.
  const edgeAt=(ids,side,inset)=>{
    const segments=[];
    for(const id of ids){
      const way=K.osm.roads.find(r=>r.id===id);
      for(let i=1;i<way.pts.length;i++){
        const a=way.pts[i-1],b=way.pts[i],sa=gardenStation(...a),sb=gardenStation(...b);
        if(Math.abs(sa-sb)<.001)continue;
        const width=(way.width/2+inset)*Math.hypot(b[0]-a[0],b[1]-a[1])/Math.abs(sb-sa);
        segments.push({sa,sb,va:vAt(...a)+side*width,vb:vAt(...b)+side*width});
      }
    }
    return s=>{
      const seg=segments.find(({sa,sb})=>s>=Math.min(sa,sb)&&s<=Math.max(sa,sb));
      return seg?seg.va+(seg.vb-seg.va)*(s-seg.sa)/(seg.sb-seg.sa):undefined;
    };
  };
  const arterialKerb=edgeAt([473798788,498559932,691602197,218870945],-1,2.6);
  const slipKerb=edgeAt([498559930],-1,0);
  const linkKerb=edgeAt([498559931],1,0);
  const linkWay=K.osm.roads.find(r=>r.id===498559931).pts;
  const link=linkWay.map(p=>gardenStation(...p));
  const linkCrest=gardenGrade(link.at(-1),vAt(...linkWay.at(-1)))+
    relief(...linkWay.at(-1))+(exteriorReliefEnabled()?.061:0);
  const linkFoot=exteriorReliefEnabled()?gardenSurveyY(17.67):.041;
  const side=(idx,offset,lift)=>{
    const p=sections[idx](offset);
    return xyz(p,roadWorld[idx]+lift-relief(...p));
  };
  function outerBank(idx){
    const s=gardenStation(...points[idx]),shoulder=sections[idx](-4.1);
    const highV=vAt(...shoulder),linkV=linkKerb(s),arterialV=arterialKerb(s);
    if(arterialV===undefined || s>link[0])return null;
    let crest=side(idx,-4.1,.052);
    if(linkV!==undefined && linkV>highV){
      const t=(s-link[0])/(link.at(-1)-link[0]);
      const p=gardenPoint(s,linkV);
      const roadP=gardenPoint(s,51.6);
      const contact=exteriorReliefEnabled()?gardenGrade(s,51.6)+relief(...roadP)+.061:undefined;
      crest=xyz(p,gardenLinkHeight(t,linkCrest,linkFoot,contact)-relief(...p));
    }
    const toeV=Math.min(arterialV,slipKerb(s)??Infinity);
    const toe=xyz(gardenPoint(s,toeV),.042);
    return toeV<=vAt(crest[0],crest[2]) ? [toe,toe]:[crest,toe];
  }
  for(let i=1;i<points.length;i++) {
    const s=gardenStation(...points[i]);
    const pair=(idx,offset)=>side(idx,offset,.052);
    const j=i-1;
    // A flush shoulder keeps every parking and hotel turn open to vehicles.
    for (const sign of [-1,1]) bank(K,pair(j,sign*3.05),pair(i,sign*3.05),
      pair(i,sign*4.1),pair(j,sign*4.1),s>=198 && s<=373.5 && sign===1?'garden-grey-paving':'sidewalk');
    const edge=(idx,v,y)=>xyz(gardenPoint(gardenStation(...points[idx]),v),y);
    if(s<=396.5 && s>=-26) {
      const inside=idx=>{
        const t=gardenStation(...points[idx]);
        const boundary=gardenTerrainEdge(t);
        return edge(idx,boundary-.12,gardenSurface(t,boundary)+.025);
      };
      bank(K,pair(j,4.1),pair(i,4.1),inside(i),inside(j),s>=198 && s<=373.5?'garden-grey-paving':s>373.5?verge:'sidewalk');
    }
    const prev=outerBank(j),next=outerBank(i);
    if(prev && next)bank(K,prev[0],next[0],next[1],prev[1],verge);
    if(s>link.at(-1) || heights[i]<1.5) continue;
    const p=sections[j](-4), q=sections[i](-4);
    const barrier=(lo,hi,color)=>K.quad(color,[side(j,-4,lo),side(i,-4,lo),
      side(i,-4,hi),side(j,-4,hi)],[.4448,0,.89563]);
    barrier(.05,.35,stone);
    K.quad(stone,[side(j,-3.84,.35),side(i,-3.84,.35),side(i,-4,.35),side(j,-4,.35)],[0,1,0]);
    K.quad(stone,[side(i,-3.84,.05),side(j,-3.84,.05),side(j,-3.84,.35),side(i,-3.84,.35)],[-.4448,0,-.89563]);
    K.withTerrainSurface(0,()=>K.phys.addWall(...p,...q,Math.min(roadWorld[i],roadWorld[j])-.06,Math.max(roadWorld[i],roadWorld[j])+.72,.1,'streets'));
  }
  // Keep the trees on the planting ledge. The east end tapers to the
  // narrow apron outside the shop; the stone face below it has no tree pits.
  for (const [s,v] of [[394,22.1],[386,26.3],[377,31]]) {
    const [x,z]=gardenPoint(s,v), y=gardenSurface(s,v);
    K.box({x,z,y:y+.05,w:3,d:1.2,h:.34,rotY:.46,mat:stone,solid:true});
    K.box({x,z,y:y+.39,w:2.9,d:1.12,h:.52,rotY:.46,mat:verge,solid:false});
    if(s!==386 && s!==341) K.tree(x,z,{y:y+.39,h:4.6,kind:'zelkova'});
  }
  // Lower flight beside the traffic refuge, visible at Naver GR-RStU….
  const foot=gardenPoint(388.8,38.2),head=gardenPoint(385.2,34.8);
  const ya=gardenSurface(388.8,38.2)+.10,yb=gardenSurface(385.2,34.8)+.10;
  K.stairs(...foot,...head,{ya,yb,w:2.1,mat:0xc3b6a9,sideMat:stone,rails:true});
  const dx=head[0]-foot[0],dz=head[1]-foot[1],run=Math.hypot(dx,dz);
  const landing=(along,side)=>[head[0]+(dx*along-dz*side)/run,head[1]+(dz*along+dx*side)/run];
  K.slab([landing(0,-1.05),landing(1.25,-1.05),landing(1.25,1.05),landing(0,1.05)],yb,
    {mat:'streets-pavers',thick:.18});
  // OSM's service loop passes the signed stop for Express Bus Terminal exit 3.
  // It rejoins the collector on either side of the platform.
  const busBay=[];
  for (const p of K.osm.roads.find(r=>r.id===593858541).pts) {
    const a=busBay.at(-1);
    if (!a) { busBay.push(p); continue; }
    const count=Math.ceil(Math.hypot(p[0]-a[0],p[1]-a[1])/2);
    for(let i=1;i<=count;i++) busBay.push(a.map((v,j)=>v+(p[j]-v)*i/count));
  }
  const bayHeight=([x,z])=>{
    const s=gardenStation(x,z),v=vAt(x,z),collector=gardenGrade(s,v);
    const t=Math.min(1,Math.max(0,(gardenKerb(s)-v)/8));
    // The bay apron shares the collector's grade until it clears the
    // through carriageway. This removes transverse ledges across both turns.
    return collector+(gardenSurface(s,v)-collector)*t*t*(3-2*t);
  };
  K.withTerrainSurface(0,()=>road(busBay,busBay.map(p=>bayHeight(p)+relief(...p)),2.65));
  for(const s of [17,27,37,70,80,90]) {
    const v=44, [x,z]=gardenPoint(s,v), y=gardenSurface(s,v);
    K.box({x,z,y:y+.02,w:6.8,d:1.35,h:.38,rotY:.461,mat:stone,solid:true});
    K.box({x,z,y:y+.40,w:6.4,d:1.05,h:.46,rotY:.461,mat:verge,solid:false});
    if(s===27||s===80) K.tree(x,z,{y:y+.41,h:4.3,kind:'pine'});
  }
  buildGardenArrival(K);
  // Models the garden between the end of the parking block and the turn
  // towards the valet. Keep the hotel parking ramp west of this apron open.
  for(let s=-26;s<0;s+=2) {
    const row=t=>[[0,12.57],[16.72,12.57],[22,12.57],[39,11.5],[46.55,11.5]].map(([v,h])=>{
      const p=gardenPoint(t,v);
      if(!exteriorReliefEnabled()) return xyz(p,11.5+(h-11.5)*(1+t/26));
      // Match the height of the hotel approach across its full width before
      // rising towards the separate parking terrace to the east.
      const court=hotelCourtDatum(...p)+11.5, blend=Math.max(0,1+t/16);
      const end=gardenPoint(0,v), terrace=gardenSurface(0,v)+relief(...end);
      return xyz(p,court+(terrace-court)*blend-relief(...p));
    });
    const a=row(s), b=row(s+2);
    for(let k=1;k<a.length;k++) bank(K,a[k-1],b[k-1],b[k],a[k],k===1?verge:'sidewalk');
  }
}
