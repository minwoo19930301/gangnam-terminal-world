// Local frame and continuous occupied 2F dining/gallery span underneath the hotel court.
export const FA=62/Math.hypot(62,24),FB=24/Math.hypot(62,24);
export const upperPoint=(u,v)=>[29-FA*u+FB*v,144+FB*u+FA*v];
export const diningSpan=[-27,11.8,-14,21.1];
export function diningWallOpening(a,b){
  const [u0,v0,u1,v1]=diningSpan;
  const local=([x,z])=>[-(x-29)*FA+(z-144)*FB,(x-29)*FB+(z-144)*FA];
  const [u,v]=local(a),[s,t]=local(b);
  let lo=0,hi=1;
  for(const [p,q,min,max] of [[u,s,u0,u1],[v,t,v0,v1]]){
    if(p===q){if(p<min||p>max)return [];continue;}
    const aa=(min-p)/(q-p),bb=(max-p)/(q-p);
    lo=Math.max(lo,Math.min(aa,bb));hi=Math.min(hi,Math.max(aa,bb));
  }
  if(hi<=lo)return [];
  const distance=Math.hypot(a[0]-b[0],a[1]-b[1]);
  return [{at:(lo+hi)*distance/2,w:(hi-lo)*distance,y0:5,y1:8.43}];
}
