// The shadow behind an opaque rectangular wall is a convex volume bounded by
// the wall and four planes through the eye. Test the whole world-space AABB.
export function createWall({a,b,y0,y1,eyePoly,eyeMin,eyeMax},bounds) {
  const length = Math.hypot(b[0]-a[0],b[1]-a[1]);
  if (length <= .03 || y1-y0 <= .03) return null;
  const ux = (b[0]-a[0])/length, uz = (b[1]-a[1])/length;
  const planes = Array.from({length:5},() => new Float64Array(4));

  function project(x,y,z) {
    const dx = x-a[0], dz = z-a[1], normal = -uz*dx+ux*dz;
    if (Math.abs(normal) < .04) return false;
    const sign = Math.sign(normal), nx = -sign*uz, nz = sign*ux;
    const d = Math.abs(normal), u = ux*dx+uz*dz;
    const left = .015, right = length-.015, bottom = y0+.015, top = y1-.015;
    function plane(i,tangent,vertical,normal,offset) {
      const p = planes[i];
      p[0] = tangent*ux+normal*nx; p[1] = vertical; p[2] = tangent*uz+normal*nz;
      p[3] = offset-p[0]*a[0]-p[2]*a[1];
    }
    plane(0,0,0,-1,-.025);
    plane(1,d,0,left-u,-d*left);
    plane(2,-d,0,u-right,d*right);
    plane(3,0,d,bottom-y,-d*bottom);
    plane(4,0,-d,y-top,d*top);
    return true;
  }

  function hides({min,max}) {
    for (const p of planes) {
      // The corner with the smallest signed distance must lie strictly inside.
      if (p[0]*(p[0]>0 ? min.x : max.x) + p[1]*(p[1]>0 ? min.y : max.y) +
          p[2]*(p[2]>0 ? min.z : max.z) + p[3] <= 0) return false;
    }
    return true;
  }
  return {bounds,poly:eyePoly,eyeMin,eyeMax,project,hides};
}
