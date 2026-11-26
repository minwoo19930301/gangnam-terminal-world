// Public crossing by the Banpo flyover, mapped from kerb to kerb.
// Paint spacing and widths are estimates from the January 2026 street photograph.
export const crossingWay=1481658423;
export const carriageways=[828782197,1033191355];
export const markingWidth=5;

export function markingFaces(a,b){
  const dx=b[0]-a[0],dz=b[1]-a[1],length=Math.hypot(dx,dz);
  const ux=dx/length,uz=dz/length;
  const point=(along,side)=>[a[0]+ux*along-uz*side,a[1]+uz*along+ux*side];
  const faces=[];
  for(const side of [-1,1]){
    const inner=.13*side,outer=markingWidth*.5*side;
    const left=Math.min(inner,outer),right=Math.max(inner,outer);
    const entry=side===1?0:length;
    for(let along=.22;along<length-.18;along+=.96){
      const end=Math.min(along+.46,length-.16);
      if(Math.min(Math.abs(along-entry),Math.abs(end-entry))<1.12)continue;
      faces.push([point(along,left),point(end,left),point(end,right),point(along,right)]);
    }
    // The photograph shows two small arrows abreast on the entry half.
    const dir=entry===0?1:-1;
    for(const across of [left+(right-left)*.31,left+(right-left)*.69]){
      const tip=(s,w)=>point(entry+dir*s,across+w);
      faces.push([tip(.28,-.065),tip(.28,.065),tip(.68,.065),tip(.68,-.065)]);
      faces.push([tip(.68,-.17),tip(.68,.17),tip(.99,0)]);
    }
  }
  return faces;
}

// The flared paving joins the footways meeting the two ends. The photograph
// gives the taper, warning strip and yellow back covers, not surveyed pole points.
export function landings(a,b){
  const dx=b[0]-a[0],dz=b[1]-a[1],length=Math.hypot(dx,dz);
  return [[a,-1],[b,1]].map(([end,sign])=>{
    const u=dx*sign/length,v=dz*sign/length;
    const point=(back,across)=>[end[0]+u*back-v*across,end[1]+v*back+u*across];
    const curb=[point(.04,-2.95),point(.04,2.95),point(.55,3.03),point(2.75,2.2),point(2.75,-1.8),point(.55,-2.98)];
    const warning=[point(.16,-2.30),point(.16,2.30),point(.61,2.30),point(.61,-2.30)];
    return {curb,warning,pole:point(1.05,2.55),yaw:Math.atan2(-u,-v)};
  });
}
