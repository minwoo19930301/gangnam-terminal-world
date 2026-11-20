// The bus aisle keeps the low datum at the east end of the parking building.
// Naver's January 2026 cameras turn south past its glass stair and follow the
// wall uphill. The outer slip lane and inner hotel lane fork after that climb.
import { gardenGrade, gardenPoint, gardenStation } from './_gardenGrade.js';

export const publicForkRoads = [498559929, 498559930, 498559931, 356127035, 1232132163];
const atGrade = ([x,z]) => gardenGrade(gardenStation(x,z));
const mix = (a,b,t) => a.map((v,i) => v + (b[i]-v)*t);
const length = (a,b) => Math.hypot(a[0]-b[0],a[2]-b[2]);
const vertex = ([x,z],y) => [x,y,z];

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
  const way=id=>K.osm.roads.find(r=>r.id===id).pts;
  const outer=way(498559929), merge=outer.at(-1), turn=outer[1];
  const splitY=atGrade(turn), mergeY=8.6, ground=.08;
  const entry=[vertex(outer[0],ground),vertex([444.8,-39.2],ground),
    vertex([443,-32.0],.65),vertex([442.5,-21.2],2.0),vertex(turn,splitY)];
  // The crossing on the bend and both through lanes occupy the same level.
  const crossing=way(1232132163), crossingY=atGrade(crossing[1]);
  const fork=outer.slice(1), crossAt=fork.findIndex(p=>p[0]===crossing[2][0] && p[1]===crossing[2][1]);
  const span=(points,ya,yb)=>{
    const chain=[0];
    for(let i=1;i<points.length;i++) chain.push(chain.at(-1)+Math.hypot(points[i][0]-points[i-1][0],points[i][1]-points[i-1][1]));
    return points.map((p,i)=>vertex(p,ya+(yb-ya)*chain[i]/chain.at(-1)));
  };
  // The branches share asphalt for several metres at the western split.
  // Ease all three approaches onto the same tangent through that junction.
  function throughJunction(points) {
    const stations=[];
    for(let i=0;i<points.length;i++){
      const q=points[i], p=i?points[i-1]:q;
      const n=Math.max(1,Math.ceil(length(p,q)/4));
      for(let j=1;j<=n;j++){
        const out=mix(p,q,j/n), [x,y,z]=out;
        const blend=Math.max(0,Math.min(1,(24-Math.hypot(x-merge[0],z-merge[1]))/9));
        out[1]=y+(mergeY-.11*(x-merge[0])-y)*blend;
        stations.push(out);
      }
    }
    return stations;
  }
  const forkCurve=throughJunction(span(fork.slice(0,crossAt+1),splitY,crossingY).slice(0,-1)
    .concat(span(fork.slice(crossAt),crossingY,mergeY)));
  const uphill=entry.slice(0,-1).concat(forkCurve);
  const link=way(498559931);
  const inside=throughJunction(Array.from({length:19},(_,i)=>{
    const t=i/18, p=mix(link[0],link.at(-1),t);
    return vertex(p,atGrade(p)+(mergeY-atGrade(merge))*Math.max(0,1-t*3));
  }));
  const southExit=throughJunction(span(way(498559930),mergeY,ground));
  const eastJoin=throughJunction(span(way(356127035),ground,mergeY));
  const collector=[];
  for(const p of way(907930149)){
    const prev=collector.at(-1);
    const n=prev?Math.ceil(Math.hypot(p[0]-prev[0],p[1]-prev[2])/4):1;
    for(let i=1;i<=n;i++){
      const q=prev?mix([prev[0],prev[2]],p,i/n):p;
      collector.push(vertex(q,atGrade(q)));
    }
  }

  // A ribbon may change both width and crossfall. Emit its walk support in
  // narrow strips so the cambered verges and islands meet adjoining pavements.
  function ribbon(rows,mat,walk=false) {
    for(let i=1;i<rows.length;i++){
      const [a,b]=rows[i-1], [c,d]=rows[i];
      const span=Math.max(length(a,b),length(c,d)), run=(length(a,c)+length(b,d))/2;
      K.quad(mat,[a,c,d,b],[0,1,0],[[0,0],[0,run/5],[span/5,run/5],[span/5,0]]);
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
  const up=surface(uphill,7), linkSec=surface(inside,5), southSec=surface(southExit,7), eastSec=surface(eastJoin,5);
  function paint(sec,from,to,colour) { ribbon(sec.map(s=>[s(from,.022),s(to,.022)]),colour); }
  paint(up.slice(1),-3.24,-3.12,0xf0eeea);
  paint(up.slice(1,4),3.03,3.15,0xe1b24b);
  paint(linkSec,-2.30,-2.18,0xf0ede5);
  paint(southSec,-3.24,-3.12,0xf0eeea);
  paint(eastSec,-2.25,-2.13,0xf0eeea);

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
  const bank=[vertex([441.6,-39.0],ground),vertex([438,-33],.60),vertex([435.9,-23.5],2.0),
    vertex(gardenPoint(396.5,20),gardenGrade(396.5))];
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
    K.quad(0x988b80,[p,q,[q[0],-.06,q[2]],[p[0],-.06,p[2]]],norm);
    K.phys.addWall(p[0],p[2],q[0],q[2],-.1,Math.min(p[1],q[1]),.04,'streets');
  }
  ribbon([[raised(bank.at(-1)),raised(lip.at(-1))],[
    vertex(gardenPoint(396.5,34.5),gardenGrade(396.5)),vertex(gardenPoint(403,26),gardenGrade(403))]],planted,true);

  // Fill the island between the local hotel road and the outer slip lane.
  // Center-to-center interpolation also covers the small triangular forks.
  function kerbSample(line,width) {
    const sec=sections(line), chain=[0];
    for(let i=1;i<line.length;i++) chain.push(chain.at(-1)+length(line[i-1],line[i]));
    return (fraction,towards)=>{
      const d=fraction*chain.at(-1);
      let i=1;
      while(i<line.length-1 && chain[i]<d) i++;
      const t=(d-chain[i-1])/(chain[i]-chain[i-1]);
      const center=mix(line[i-1],line[i],t);
      if(!towards) return center;
      const left=mix(sec[i-1](1),sec[i](1),t);
      const side=Math.sign((towards[0]-center[0])*(left[0]-center[0])+(towards[2]-center[2])*(left[2]-center[2]));
      const w=typeof width==='number'?width:width(d,i);
      return mix(sec[i-1](side*w/2,-.24),sec[i](side*w/2,-.24),t);
    };
  }
  function wedge(line1,width1,line2,width2) {
    const a=kerbSample(line1,width1), b=kerbSample(line2,width2), rows=[];
    for(let i=0;i<=70;i++){
      const t=i/70, c=a(t), d=b(t), p=a(t,d), q=b(t,c);
      // At a merge both strips of asphalt already cover the tip of the island.
      if((d[0]-c[0])*(q[0]-p[0])+(d[2]-c[2])*(q[2]-p[2])<=0){
        const tip=mix(p,q,.5);
        rows.push([tip,tip]);
      } else rows.push([p,q]);
    }
    ribbon(rows,'grass',true);
  }
  wedge(collector,8.2,forkCurve.slice(0,-1).concat(inside),(_,i)=>i<forkCurve.length?7:5);

  // Verge between the public slip and Jamwon-ro; its outer kerb follows the
  // level arterial all the way round to the signal island. The remaining
  // two slip roads fan back to Sapyeong-daero's existing carriageway.
  const jamwonKerb=[[452.44,-45.81],[451.3,-29.1],[458.2,-9.1],[465.9,11.2],[473.6,31.6],[481.5,35.07]].map(p=>vertex(p,ground));
  wedge(uphill,7,jamwonKerb.slice(0,-1).concat(eastJoin),(_,i)=>i<jamwonKerb.length?0:5);
  const arterial=way(691602197), eastEnd=eastJoin[0];
  const outerKerb=[eastEnd,vertex([458.8,33.7],ground),vertex([430.0,43.3],ground),
    ...arterial.slice(1).map(p=>vertex(p,ground))];
  wedge(eastJoin.slice(0,-1).concat(southExit),(_,i)=>i<eastJoin.length?5:7,outerKerb,0);

  // The bus-yard driveway is a separate opening in the low corner. Its
  // zebra follows the pavement past the mouth (January 2026 u9mhTb...).
  const lowWay=[vertex(gardenPoint(402.8,-13.5),.03),vertex([433.3,-50.5],.04),
    vertex([438.4,-50.7],.055),vertex([444.4,-46.4],.07),vertex([448.6,-42.5],.08)];
  surface(lowWay,7);
  const mouth=sections([lowWay[1],lowWay[2],lowWay[3]])[1];
  const tangent=[lowWay[3][0]-lowWay[1][0],lowWay[3][2]-lowWay[1][2]];
  const len=Math.hypot(...tangent);
  for(let off=-2.9;off<3;off+=.9){
    const row=o=>[-1.4,1.4].map(d=>{
      const p=mouth(o,.023);
      return [p[0]+d*tangent[0]/len,p[1],p[2]+d*tangent[1]/len];
    });
    ribbon([row(off),row(off+.42)],0xebebe4);
  }

  // Drape the paint over both moving lanes and across the level refuge. The
  // crossing descends again from the outer kerb to the signal island.
  const stripes=crossing.map(p=>vertex(p,crossingY)), axes=sections(stripes);
  const crossFloor=p=>K.phys.support(p[0],p[2],crossingY+2).y;
  for(let i=1;i<stripes.length;i++){
    const a=axes[i-1],b=axes[i],d=length(stripes[i-1],stripes[i]);
    for(let s=.12;s+.43<d;s+=.97){
      const row=t=>[-1.28,1.28].map(v=>{
        const p=mix(a(v),b(v),t/d);
        p[1]=crossFloor(p)+.03;
        return p;
      });
      ribbon([row(s),row(s+.43)],0xf1efe7);
    }
  }
}
