import { profiles } from './profiles.js';

// Geometry stays in the kit's existing material, terrain and visibility batches.
// Prepare each flight once; translating a tread preserves its face normals/UVs.
function renderer(profile, points, winding, surface, uv, quad, tri) {
  const faces=[];
  for (const [role, authoredNormal, indices] of profile.faces) {
    const vertices=indices.map(i=>points[i]);
    const [a,b,c]=vertices;
    const dx=b[0]-a[0], dy=b[1]-a[1], dz=b[2]-a[2];
    const ex=c[0]-a[0], ey=c[1]-a[1], ez=c[2]-a[2];
    const nx=dy*ez-dz*ey, ny=dz*ex-dx*ez, nz=dx*ey-dy*ex;
    const magnitude=Math.hypot(nx,ny,nz);
    if (magnitude<1e-10) continue;
    const normal=[nx*winding/magnitude,ny*winding/magnitude,nz*winding/magnitude];
    const uvs=indices.map(i=>uv(profile.vertices[i],role,authoredNormal));
    faces.push({emit:indices.length===4?quad:tri,vertices,normal,uvs,material:surface(role)});
  }
  return (x,y,z)=>{
    for (const {emit,vertices,normal,uvs,material} of faces) {
      emit(material,vertices.map(p=>[x+p[0],y+p[1],z+p[2]]),normal,uvs);
    }
  };
}

export function makeStep(quad,tri,width,run,rise,dir,ux,uz,finish,nosing) {
  const profile=profiles.step, d=profile.dimensions;
  const edge=Math.min(d.edge_depth,run*.13), bevel=Math.min(d.edge_height,rise*.25);
  // Preserve the authored edge width on long treads and its proportions on tiny steps.
  const along=v=>v<=d.edge_depth ? v*edge/d.edge_depth : edge+(v-d.edge_depth)*(run-edge)/(d.reference_run-d.edge_depth);
  const height=v=>v>=-d.edge_height ? v*bevel/d.edge_height : -bevel+(v+d.edge_height)*(rise-bevel)/(d.reference_rise-d.edge_height);
  const points=profile.vertices.map(([s,v,h])=>{
    const t=along(v)*dir;
    return [ux*t-uz*s*width,height(h),uz*t+ux*s*width];
  });
  function uv([s,v,h],role,n) {
    if (n[2]<.01) return [s+.5,(height(h)+rise)/(rise||1)*.2];
    if (role==='edge' && nosing) return [s+.5,along(v)/(edge||1)];
    const u=along(v)/(run||1);
    return [(dir>0?u:1-u)*width,(.5-s)*run];
  }
  return renderer(profile,points,dir,role=>role==='edge'&&nosing ? nosing : finish,uv,quad,tri);
}

export function drawStepRails(quad,tri,ax,az,bx,bz,ya,yb,width,ux,uz,finish) {
  const profile=profiles.rail, d=profile.dimensions;
  const points=profile.vertices.map(([s,v,h])=>{
    const t=v/d.reference_length;
    return [(bx-ax)*t-uz*s,(yb-ya)*t+d.centre_height+h,(bz-az)*t+ux*s];
  });
  const uv=([s,v,h])=>[v/d.reference_length,(Math.abs(s)+h+.05)/.12];
  const draw=renderer(profile,points,1,()=>finish,uv,quad,tri);
  for(const side of [-1,1])draw(ax-uz*width*.5*side,ya,az+ux*width*.5*side);
}
