// Shared cross sections give both side walls and the soffit the same edge at a turn.
export function passageSections(points,widths) {
  const normals=points.slice(1).map(([x,z],i)=>{
    const dx=x-points[i][0],dz=z-points[i][1],length=Math.hypot(dx,dz);
    return [-dz/length,dx/length];
  });
  const edges=points.map(([x,z],i)=>{
    const a=normals[Math.max(0,i-1)],b=normals[Math.min(i,normals.length-1)];
    const scale=widths[i]/(2*(1+a[0]*b[0]+a[1]*b[1]));
    const dx=(a[0]+b[0])*scale,dz=(a[1]+b[1])*scale;
    return [[x-dx,z-dz],[x+dx,z+dz]];
  });
  return edges.slice(1).map(([left,right],i)=>[edges[i][0],left,right,edges[i][1]]);
}
