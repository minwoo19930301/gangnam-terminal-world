// The OSM road and two sidewalk axes describe one continuous public deck.
import {streamDeckIds, streamRoad} from '../../../js/banpo_stream_profile.js';
import {relief} from '../../../js/banpo_relief.js';
export const surfaceColors={asphalt:0x625f5c,sidewalk:0xa7a399,concrete:0xb6b6ae,kerb:0xc7c4b6,paint:0xedbf61,white:0xeee8d8};
const distance=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
function path(points) {
  const lengths=[0];
  for(let i=1;i<points.length;i++)lengths.push(lengths[i-1]+distance(points[i-1],points[i]));
  const total=lengths.at(-1);
  return {stops:lengths.map(x=>x/total),at(t){
    let i=1;while(i<points.length-1 && lengths[i]<t*total)i++;
    const n=(t*total-lengths[i-1])/(lengths[i]-lengths[i-1]);
    return points[i-1].map((v,k)=>v+(points[i][k]-v)*n);
  }};
}

export function bridgeLayout(roads){
  const ways=roads.filter(r=>streamDeckIds.has(r.id)),road=ways.find(r=>r.id===streamRoad);
  if(!road || ways.length!==3)return null;
  const [a,b]=[road.pts[0],road.pts.at(-1)];
  const walks=ways.filter(r=>r!==road).map(r=>path(distance(r.pts[0],a)<distance(r.pts.at(-1),a)?r.pts:[...r.pts].reverse()));
  const centre=path(road.pts),nodes=[...new Set(walks.flatMap(p=>p.stops))].sort((x,y)=>x-y);
  const y0=relief(...a)+.03,y1=relief(...b)+.03;
  const faces=[],guards=[],panels=[];
  let station=0;
  const top=(p,y)=>[p[0],y,p[1]];
  const up=(p,n)=>[p[0],p[1]+n,p[2]];
  function face(mat,points,normal){faces.push({mat,points,normal});}
  function section(t){
    const c=centre.at(t),left=walks[0].at(t),right=walks[1].at(t);
    const dx=(right[0]-left[0])/distance(left,right),dz=(right[1]-left[1])/distance(left,right);
    const offset=(p,n)=>[p[0]+dx*n,p[1]+dz*n];
    // The bridge inventory's 10 m of combined sidewalks is divided evenly for the game.
    const y=y0+(y1-y0)*t;
    return [offset(left,-2.5),offset(left,2.5),offset(c,-.075),offset(c,.075),offset(right,-2.5),offset(right,2.5)].map(p=>top(p,y));
  }
  const supports=[];
  for(let i=1;i<nodes.length;i++){
    const start=section(nodes[i-1]),end=section(nodes[i]);
    function strip(l,r,dy,mat){
      const points=[up(start[l],dy),up(end[l],dy),up(end[r],dy),up(start[r],dy)];
      face(mat,points,[0,1,0]);return points;
    }
    const asphalt=strip(1,4,0,'asphalt');supports.push({points:asphalt,kind:'road'});
    const centreA=start[2].map((v,k)=>(v+start[3][k])/2),centreB=end[2].map((v,k)=>(v+end[3][k])/2);
    const run=Math.hypot(centreB[0]-centreA[0],centreB[2]-centreA[2]);
    function stripe(from,to,offset,width,mat){
      function edge(row,at,side){
        const vx=row[5][0]-row[0][0],vz=row[5][2]-row[0][2],span=Math.hypot(vx,vz);
        return [at[0]+vx/span*side,at[1]+.012,at[2]+vz/span*side];
      }
      const leftA=edge(start,centreA,offset-width/2),leftB=edge(end,centreB,offset-width/2);
      const rightA=edge(start,centreA,offset+width/2),rightB=edge(end,centreB,offset+width/2);
      const lerp=(a,b,t)=>a.map((v,k)=>v+(b[k]-v)*t);
      face(mat,[lerp(leftA,leftB,from),lerp(leftA,leftB,to),lerp(rightA,rightB,to),lerp(rightA,rightB,from)],[0,1,0]);
    }
    for(const offset of [-.15,.15])stripe(0,1,offset,.15,'paint');
    for(let d=-(station%8);d<run;d+=8){
      const lo=Math.max(0,d),hi=Math.min(run,d+3);
      if(hi>lo)for(const offset of [-3.4,3.4])stripe(lo/run,hi/run,offset,.12,'white');
    }
    station+=run;
    face('concrete',[up(start[0],-.65),up(start[5],-.65),up(end[5],-.65),up(end[0],-.65)],[0,-1,0]);
    for(const [edge,kerb] of [[0,1],[5,4]]){
      const sidewalk=strip(Math.min(edge,kerb),Math.max(edge,kerb),.105,'sidewalk');
      supports.push({points:sidewalk,kind:'sidewalk'});
      for(const [index,base,mat] of [[edge,-.65,'concrete'],[kerb,0,'kerb']]){
        const p=start[index],q=end[index],len=Math.hypot(q[0]-p[0],q[2]-p[2]);
        const side=Math.sign((q[2]-p[2])*(p[0]-start[2][0])-(q[0]-p[0])*(p[2]-start[2][2]))*(index===kerb?-1:1);
        face(mat,[up(p,base),up(q,base),up(q,.105),up(p,.105)],[side*(q[2]-p[2])/len,0,-side*(q[0]-p[0])/len]);
      }
      const p=up(start[edge],.105),q=up(end[edge],.105);
      guards.push([p,q]);
      const count=Math.max(1,Math.round(Math.hypot(q[0]-p[0],q[2]-p[2])/2));
      const lerp=t=>p.map((v,k)=>v+(q[k]-v)*t);
      for(let j=0;j<count;j++)panels.push([lerp(j/count),lerp((j+1)/count)]);
    }
  }
  return {faces,supports,guards,panels};
}
