// The bus aisle keeps the low datum at the east end of the parking building.
// Naver's January 2026 cameras turn south past its glass stair and follow the
// wall uphill. The outer slip lane and inner hotel lane fork after that climb.
import { gardenGrade, gardenPoint, gardenStation, gardenSurveyY } from './_gardenGrade.js';

import { exteriorReliefEnabled, relief, surveyElevation } from '../banpo_relief.js';
import { gardenForkProfile } from '../garden_fork.js';

export const publicForkRoads = [498559929, 498559930, 498559931, 356127035, 1232132163];
const atGrade = ([x,z]) => gardenGrade(gardenStation(x,z),.4448*(x-71.26)+.89563*(z-143.25));
const mix = (a,b,t) => a.map((v,i) => v + (b[i]-v)*t);
const length = (a,b) => Math.hypot(a[0]-b[0],a[2]-b[2]);
const vertex = ([x,z],y) => [x,y,z];

// The service road shares the first 18 m of its mouth with the arterial slip.
// Short vertical curves soften the transition to and from the uphill run.
export function gardenLinkHeight(t,crest,foot=.041,collector) {
  const u=Math.min(1,Math.max(0,(t-.34)/.66));
  const rise=u<.1?5*u*u:u>.9?.9-5*(1-u)*(1-u):u-.05;
  const road=foot+(crest-foot)*rise/.9;
  if(collector===undefined) return road;
  // Both lanes already share pavement before the centrelines merge.
  const join=Math.max(0,Math.min(1,(t-.54)/.20));
  return road+(collector-road)*join*join*(3-2*join);
}

function sections(points) {
  const normals = points.slice(1).map((q,i) => {
    const p=points[i], d=length(p,q);
    return [(p[2]-q[2])/d,(q[0]-p[0])/d];
  });
  return points.map((p,i) => {
    const a=normals[Math.max(i-1,0)], b=normals[Math.min(i,normals.length-1)];
    const scale=1+a[0]*b[0]+a[1]*b[1];
    return (offset,rise=0) => [p[0]+(a[0]+b[0])*offset/scale,p[1]+rise,p[2]+(a[1]+b[1])*offset/scale];
  });
}

export function buildGardenPublicFork(K) {
  K.withTerrainSurface(0,()=>buildForkSurfaces(K));
}
function buildForkSurfaces(K) {
  const outdoor=exteriorReliefEnabled();
  const collectorY=([x,z])=>atGrade([x,z])+relief(x,z)+(outdoor?.061:0);
  const way=id=>K.osm.roads.find(r=>r.id===id).pts;
  const outer=way(498559929), turn=outer[1];
  // The two OSM slip lanes merge directly into the surface arterial.
  // Terrain relief already raises that carriageway above the bus-yard aisle.
  const ground=.041, splitY=collectorY(turn);
  const span=(points,ya,yb)=>{
    const chain=[0];
    for(let i=1;i<points.length;i++) chain.push(chain.at(-1)+Math.hypot(points[i][0]-points[i-1][0],points[i][1]-points[i-1][1]));
    return points.map((p,i)=>vertex(p,ya+(yb-ya)*chain[i]/chain.at(-1)));
  };
  const entryPath=[outer[0],[444.8,-39.2],[443,-32.0],[442.5,-21.2],turn];
  const forkLine=path=>path.map(p=>vertex(p,gardenSurveyY(gardenForkProfile(...p).height)));
  const entry=outdoor?forkLine(entryPath):span(entryPath,ground,splitY);
  const crossing=way(1232132163), crossingY=atGrade(crossing[1]);
  const forkCurve=outdoor?forkLine(outer.slice(1)):span(outer.slice(1),splitY,ground);
  const uphill=entry.slice(0,-1).concat(forkCurve);
  const link=way(498559931);
  const inside=Array.from({length:19},(_,i)=>{
    const t=i/18, p=mix(link[0],link.at(-1),t);
    // Level tangents at the slip lane and at the raised collector.
    const station=gardenStation(...p);
    const contact=outdoor?collectorY(gardenPoint(station,51.6)):undefined;
    return vertex(p,gardenLinkHeight(t,collectorY(link.at(-1)),forkCurve.at(-1)[1],contact));
  });
  // The southern two ties are on the public road. Use its original survey
  // along the centre line and keep each asphalt cross-section level.
  const arterial=id=>{
    const path=way(id), out=[];
    for(let i=1;i<path.length;i++){
      const a=path[i-1],b=path[i],n=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/4);
      for(let j=i===1?0:1;j<=n;j++) {
        const p=mix(a,b,j/n);
        out.push(vertex(p,ground+(outdoor?surveyElevation(...p):0)));
      }
    }
    return out;
  };
  const southExit=arterial(498559930),eastJoin=arterial(356127035);
  const collector=[];
  for(const p of way(907930149)){
    const prev=collector.at(-1);
    const n=prev?Math.ceil(Math.hypot(p[0]-prev[0],p[1]-prev[2])/4):1;
    for(let i=1;i<=n;i++){
      const q=prev?mix([prev[0],prev[2]],p,i/n):p;
      collector.push(vertex(q,collectorY(q)));
    }
  }

  // A ribbon may change both width and crossfall. Emit its walk support in
  // narrow strips so the cambered verges and islands meet adjoining pavements.
  const asphalt=[];
  function ribbon(rows,mat,walk=false) {
    for(let i=1;i<rows.length;i++){
      const [a,b]=rows[i-1], [c,d]=rows[i];
      const span=Math.max(length(a,b),length(c,d)), run=(length(a,c)+length(b,d))/2;
      const corners=[a,c,d,b], uv=[[0,0],[0,run/5],[span/5,run/5],[span/5,0]];
      if(mat==='asphalt') {
        for(const ids of [[0,1,2],[0,2,3]]) {
          const tri=ids.map(j=>corners[j]);
          asphalt.push(tri);
          K.quad(mat,[...tri,tri[2]],[0,1,0],[...ids.map(j=>uv[j]),uv[ids[2]]]);
        }
      } else K.quad(mat,corners,[0,1,0],uv);
      if(!walk || run<.02) continue;
      const strips=Math.max(1,Math.ceil(span/1.6));
      for(let j=0;j<strips;j++){
        const f=(j+.5)/strips, p=mix(a,b,f), q=mix(c,d,f), dist=length(p,q);
        if(dist<.02) continue;
        const across=[(b[0]-a[0]+d[0]-c[0])*.5,(b[2]-a[2]+d[2]-c[2])*.5];
        const width=Math.abs((q[0]-p[0])*across[1]-(q[2]-p[2])*across[0])/dist;
        K.phys.addRamp(p[0],p[2],q[0],q[2],width/(strips*2)+.06,p[1],q[1],{tag:'streets'});
      }
    }
  }

  // Clip paint to each actual asphalt facet. Interpolating just the ends of a
  // stripe spanning a twisted junction can leave its middle inside the road.
  const cross=(p,q,r)=>(q[0]-p[0])*(r[2]-p[2])-(q[2]-p[2])*(r[0]-p[0]);
  function drawMark(poly,mat) {
    let remaining=[poly];
    const bounds=K.polyBBox(poly.map(p=>[p[0],p[2]]));
    function paint(piece,height) {
      const vs=piece.map(p=>[p[0],height(p)+.022,p[2]]);
      for(let i=2;i<vs.length;i++) {
        if(Math.abs(cross(vs[0],vs[i-1],vs[i]))>.00001)
          K.quad(mat,[vs[0],vs[i-1],vs[i],vs[i]],[0,1,0]);
      }
    }
    for(let k=asphalt.length-1;k>=0;k--) {
      const tri=asphalt[k];
      const [a,b,c]=tri, area=cross(a,b,c);
      if(Math.abs(area)<.00001 || tri.every(p=>p[0]<bounds[0]) || tri.every(p=>p[2]<bounds[1]) ||
        tri.every(p=>p[0]>bounds[2]) || tri.every(p=>p[2]>bounds[3])) continue;
      const outside=[];
      for(let piece of remaining) {
        for(let i=0;i<3 && piece.length>=3;i++) {
          const inside=[], rest=[], u=tri[i], v=tri[(i+1)%3];
          for(let j=0;j<piece.length;j++) {
            const p=piece[j], q=piece[(j+1)%piece.length];
            const dp=cross(u,v,p)*Math.sign(area), dq=cross(u,v,q)*Math.sign(area);
            if(dp>=0) inside.push(p);
            if(dp<=0) rest.push(p);
            if(dp*dq<0) { const hit=mix(p,q,dp/(dp-dq)); inside.push(hit); rest.push(hit); }
          }
          if(rest.length>=3) outside.push(rest);
          piece=inside;
        }
        if(piece.length>=3) paint(piece,p=>(a[1]*cross(b,c,p)+b[1]*cross(c,a,p)+c[1]*cross(a,b,p))/area);
      }
      remaining=outside;
      if(!remaining.length) break;
    }
    // A raised kerb or an island interrupts the painted crossing.
    // Leave the parts outside these asphalt facets on their paving finish.
  }

  function surface(points,width) {
    const sec=sections(points), edges=sec.map(s=>[s(-width/2),s(width/2)]);
    ribbon(edges,'asphalt');
    for(let i=1;i<points.length;i++) {
      const p=points[i-1],q=points[i];
      K.phys.addRamp(p[0],p[2],q[0],q[2],width/2+.04,p[1],q[1],{tag:'streets'});
      if(i<points.length-1){
        const next=points[i+1], prevLength=length(p,q), nextLength=length(q,next);
        const a=[(p[2]-q[2])/prevLength,(q[0]-p[0])/prevLength];
        const b=[(q[2]-next[2])/nextLength,(next[0]-q[0])/nextLength];
        const turn=a[0]*b[1]-a[1]*b[0];
        if(Math.abs(turn)>.001){
          const hw=-Math.sign(turn)*width/2, [x,,z]=sec[i](hw);
          K.phys.addSurface([[q[0],q[2]],[q[0]+a[0]*hw,q[2]+a[1]*hw],
            [x,z],[q[0]+b[0]*hw,q[2]+b[1]*hw]],q[1],{tag:'streets'});
        }
      }
    }
    return sec;
  }
  const up=surface(uphill,7), linkSec=surface(inside,5);
  surface(southExit,7);
  surface(eastJoin,5);
  function paint(sec,from,to,colour) { ribbon(sec.map(s=>[s(from,.022),s(to,.022)]),colour); }
  paint(up.slice(1),-3.24,-3.12,0xf0eeea);
  paint(up.slice(1,4),3.03,3.15,0xe1b24b);
  paint(linkSec,-2.30,-2.18,0xf0ede5);
  // Existing Sapyeong lane paint and crossings continue through these merges.

  // Raised pavement on the parking side. The level car/bus aisle enters on
  // the other side of its corner, before these guardrails start.
  const sidewalk=up.slice(1,entry.length);
  ribbon(sidewalk.map(s=>[s(3.5,.11),s(5.35,.11)]),'sidewalk',true);
  for(let i=1;i<sidewalk.length;i++){
    const a=sidewalk[i-1](5.1,.11), b=sidewalk[i](5.1,.11);
    const n=Math.max(1,Math.ceil(length(a,b)/2.4));
    for(let j=0;j<n;j++){
      const p=mix(a,b,j/n);
      K.box({x:p[0],z:p[2],y:p[1],w:.065,d:.065,h:.89,mat:0x7f8787,solid:false});
    }
    for(const h of [.42,.83]){
      const ax=a[0],bx=b[0],az=a[2],bz=b[2],norm=[(bz-az)/length(a,b),0,(ax-bx)/length(a,b)];
      const bar=[[ax,a[1]+h,az],[bx,b[1]+h,bz],[bx,b[1]+h+.055,bz],[ax,a[1]+h+.055,az]];
      K.quad(0x929999,bar,norm); K.quad(0x929999,[...bar].reverse(),norm.map(v=>-v));
    }
  }

  // Pack the east parking corner into the rising hillside with the curbed
  // pavement on top and a closed granite face down to the service aisle.
  const bank=[vertex([441.6,-39.0],outdoor?entry[1][1]:ground),vertex([438,-33],entry[2][1]),vertex([435.9,-23.5],entry[3][1]),
    vertex(gardenPoint(396.5,20),collectorY(gardenPoint(396.5,20)))];
  const lip=sidewalk.map(s=>s(5.35,.10));
  // Only the narrow railed strip is pavement. A planted retaining strip
  // stands between that footway and the corner of the parking block.
  const planted = {tex:'grass',color:0x84946c};
  const raised = p=>[p[0],p[1]+.42,p[2]];
  const plantRows=lip.map((p,i)=>[raised(p),raised(bank[i])]);
  ribbon(plantRows,planted,true);
  for (let i=1;i<lip.length;i++) {
    const a=lip[i-1],b=lip[i];
    const face=[a,b,raised(b),raised(a)], n=[(b[2]-a[2])/length(a,b),0,(a[0]-b[0])/length(a,b)];
    K.quad(0xae9b8d,face,n);
    K.quad(0xae9b8d,face.slice().reverse(),n.map(v=>-v));
    if(i>1) {
      const p=mix(plantRows[i][0],plantRows[i][1],.54);
      K.tree(p[0],p[2],{y:p[1],h:i===2?5.4:6.1,kind:'zelkova'});
    }
  }
  for(let i=1;i<bank.length;i++){
    const p=bank[i-1],q=bank[i],d=length(p,q), norm=[(p[2]-q[2])/d,0,(q[0]-p[0])/d];
    K.quad(0x988b80,[p,q,[q[0],relief(q[0],q[2])-.06,q[2]],[p[0],relief(p[0],p[2])-.06,p[2]]],norm);
    K.phys.addWall(p[0],p[2],q[0],q[2],Math.min(relief(p[0],p[2]),relief(q[0],q[2]))-.1,Math.min(p[1],q[1]),.04,'streets');
  }
  ribbon([[raised(bank.at(-1)),raised(lip.at(-1))],[
    vertex(gardenPoint(396.5,34.5),collectorY(gardenPoint(396.5,34.5))),vertex(gardenPoint(403,26),collectorY(gardenPoint(403,26)))]],planted,true);

  // Match both kerbs at the same station. Equal fractions of the two road
  // lengths join different stations around the bend and fold the island
  // over itself as it narrows at the top.
  const station=p=>gardenStation(p[0],p[2]);
  function kerbSample(line,width) {
    const sec=sections(line);
    return (s,side=0)=>{
      let best, error=Infinity;
      for(let i=1;i<line.length;i++) {
        const half=typeof width==='number'?width/2:width(i)/2;
        const a=sec[i-1](side*half,-.025), b=sec[i](side*half,-.025);
        const sa=station(a), sb=station(b);
        const t=sb===sa?0:Math.max(0,Math.min(1,(s-sa)/(sb-sa)));
        const diff=Math.abs(s-(sa+t*(sb-sa)));
        if(diff<error) {best=mix(a,b,t); error=diff;}
        if(diff<.0001) break;
      }
      return best;
    };
  }
  function wedge(line1,width1,line2,width2) {
    const a=kerbSample(line1,width1), b=kerbSample(line2,width2), rows=[];
    const start=station(line1[0]), finish=station(line1.at(-1));
    for(let i=0;i<=70;i++){
      const s=start+(finish-start)*i/70, c=a(s),d=b(s);
      const left=a(s,1);
      const side=(d[0]-c[0])*(left[0]-c[0])+(d[2]-c[2])*(left[2]-c[2])>0?1:-1;
      const p=a(s,side), q=b(s,-side);
      // At a merge both strips of asphalt already cover the tip of the island.
      if((d[0]-c[0])*(q[0]-p[0])+(d[2]-c[2])*(q[2]-p[2])<=0){
        const tip=mix(p,q,.5);
        rows.push([tip,tip]);
      } else rows.push([p,q]);
    }
    ribbon(rows,'asphalt',true);
    // The roadway panorama shows a yellow-hatched exclusion strip and
    // flexible posts separating the flows along this side of the refuge.
    for(let i=2;i+2<rows.length;i+=2){
      const [p,q]=rows[i], [r,s]=rows[i+1];
      if(Math.min(length(p,q),length(r,s))<1.6)continue;
      const left=mix(p,q,.12), right=mix(r,s,.88);
      const shifted=(v,dx,dz)=>[v[0]+dx,v[1],v[2]+dz];
      const d=length(left,right),dx=(right[2]-left[2])*.07/d,dz=(left[0]-right[0])*.07/d;
      drawMark([shifted(left,dx,dz),shifted(right,dx,dz),
        shifted(right,-dx,-dz),shifted(left,-dx,-dz)],0xe6b32f);
      const pos=mix(p,q,.18);
      K.cyl({x:pos[0],z:pos[2],y:pos[1],h:.67,r:.07,seg:6,mat:0xd5572a,solid:false});
      K.cyl({x:pos[0],z:pos[2],y:pos[1]+.44,h:.09,r:.072,seg:6,mat:0xe3d9b6,solid:false});
    }
  }
  const carriagewayFacets=asphalt.length;
  wedge(collector,8.2,forkCurve.slice(0,-1).concat(inside),i=>i<forkCurve.length?7:5);
  // Keep the zebra on the two carriageways. The skewed, hatched gore
  // between them has a different crossfall and interrupts those stripes.
  asphalt.length=carriagewayFacets;

  // Refuge inside the mapped triangle of ways 498559929, 356127035
  // and 218681382. The outline is inset by each road's half-width,
  // including both arterial carriageways and their 2.6 m footways. On the Sapyeong side
  // the carriageways already meet: there is no space for another bank.
  const refuge=[[451.53,-19.03],[449.85,-10.32],[453,-.92],[452.3,11.13],
    [450.67,18.02],[448.75,22.11],[445.01,26.81],[442.05,29.54],
    [435.26,34.44],[440.56,34.15],[467.61,26.08],[463.41,15.37]];
  function refugeTop(x,z) {
    if(!outdoor) return .15;
    const fork=gardenForkProfile(x,z), apron=gardenSurveyY(fork.height)+.115;
    const t=Math.max(0,Math.min(1,(fork.distance-6)/10));
    return apron+(surveyElevation(x,z)+.15-apron)*t*t*(3-2*t);
  }
  // The western kerb follows the climbing slip. At the far edge the
  // island meets the higher public road. Build short crossfall panels.
  const cuts=[...new Set(refuge.map(p=>p[1]))].sort((a,b)=>a-b);
  function limits(z) {
    const xs=[];
    for(let i=0;i<refuge.length;i++){
      const [x,a]=refuge[i],[y,b]=refuge[(i+1)%refuge.length];
      if(z>=Math.min(a,b)-1e-7&&z<=Math.max(a,b)+1e-7&&Math.abs(b-a)>1e-8)
        xs.push(x+(y-x)*(z-a)/(b-a));
    }
    return [Math.min(...xs),Math.max(...xs)];
  }
  function islandPoint(x,z){return [x,refugeTop(x,z),z];}
  for(let i=1;i<cuts.length;i++){
    const z0=cuts[i-1],z1=cuts[i],n=Math.ceil((z1-z0)/2);
    for(let j=0;j<n;j++){
      const a=z0+(z1-z0)*j/n,b=z0+(z1-z0)*(j+1)/n;
      const [l,r]=limits(a),[L,R]=limits(b),m=Math.max(1,Math.ceil(Math.max(r-l,R-L)/2));
      for(let k=0;k<m;k++){
        const aa=islandPoint(l+(r-l)*k/m,a),bb=islandPoint(l+(r-l)*(k+1)/m,a);
        const cc=islandPoint(L+(R-L)*k/m,b),dd=islandPoint(L+(R-L)*(k+1)/m,b);
        ribbon([[aa,bb],[cc,dd]],'streets-pavers',true);
      }
    }
  }
  for(let i=0;i<refuge.length;i++){
    const a=refuge[i],b=refuge[(i+1)%refuge.length],n=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/2);
    for(let j=0;j<n;j++){
      const p=islandPoint(...mix(a,b,j/n)),q=islandPoint(...mix(a,b,(j+1)/n));
      K.quad('concrete',[p,q,[q[0],q[1]-.12,q[2]],[p[0],p[1]-.12,p[2]]],[0,0,-1]);
    }
  }
  const end=crossing.at(-1), prev=crossing.at(-2);
  const dx=end[0]-prev[0], dz=end[1]-prev[1], dist=Math.hypot(dx,dz);
  const tile=(along,across)=>[end[0]+(dx*along-dz*across)/dist,end[1]+(dz*along+dx*across)/dist];
  for(const t of [.25,1.05])K.withTerrainSurface(refugeTop,()=>K.hpoly('streets-tactile',[tile(t,-1.35),tile(t,1.35),
    tile(t+.35,1.35),tile(t+.35,-1.35)],.016));

  // The bus-yard driveway is a separate opening in the low corner. Its
  // zebra follows the pavement past the mouth (January 2026 u9mhTb...).
  const lowWay=[vertex(gardenPoint(402.8,-13.5),.03),vertex([433.3,-50.5],.04),
    vertex([438.4,-50.7],.055),vertex([444.4,-46.4],.07),vertex([448.6,-42.5],.08)];
  if(outdoor){
    // Independent low bench at the bus-yard opening. Join the 10.20 m
    // corner progressively across the short zebra, below the upper road.
    const start=relief(lowWay[0][0],lowWay[0][2])+.03;
    for(let i=0;i<lowWay.length;i++) lowWay[i][1]=start+(entry[0][1]-start)*i/(lowWay.length-1);
  }
  surface(lowWay,7);
  const mouth=sections([lowWay[1],lowWay[2],lowWay[3]])[1];
  const tangent=[lowWay[3][0]-lowWay[1][0],lowWay[3][2]-lowWay[1][2]];
  const len=Math.hypot(...tangent);
  for(let off=-2.9;off<3;off+=.9){
    const row=o=>[-1.4,1.4].map(d=>{
      const p=mouth(o,.023);
      return [p[0]+d*tangent[0]/len,p[1],p[2]+d*tangent[1]/len];
    });
    const [a,b]=row(off),[c,d]=row(off+.42);
    drawMark([a,c,d,b],0xebebe4);
  }

  // Drape the paint over both moving lanes and across the level refuge. The
  // crossing descends again from the outer kerb to the signal island.
  const collectorKerbs=sections(collector).map(s=>[s(-3.05),s(3.05)]);
  for(let i=1;i<collectorKerbs.length;i++) {
    const [a,b]=collectorKerbs[i-1],[c,d]=collectorKerbs[i];
    asphalt.push([a,c,d],[a,d,b]);
  }
  const stripes=crossing.map(p=>vertex(p,crossingY)), axes=sections(stripes);
  for(let i=1;i<stripes.length;i++){
    const a=axes[i-1],b=axes[i],d=length(stripes[i-1],stripes[i]);
    for(let s=.12;s+.43<d;s+=.97){
      const row=t=>[-1.28,1.28].map(v=>mix(a(v),b(v),t/d));
      const [p,q]=row(s), [r,w]=row(s+.43);
      drawMark([p,r,w,q],0xf1efe7);
    }
  }
}
