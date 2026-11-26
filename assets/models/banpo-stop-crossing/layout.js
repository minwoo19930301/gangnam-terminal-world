// Match the July 2026 public street photograph on the existing crossing axis.
// Dimensions are visual proportions on the game's 4 m marking.
export const crossingWay = 665106094;
export const markingWidth = 4;
export const markingColor = 0xeeb323;

export function markingFaces(a, b) {
  const dx = b[0] - a[0], dz = b[1] - a[1], length = Math.hypot(dx, dz);
  const ux = dx / length, uz = dz / length;
  const point = (s, offset) => [a[0] + ux*s - uz*offset, a[1] + uz*s + ux*offset];
  const faces = [];
  for (const side of [-1, 1]) {
    const near = side*.13, far = side*markingWidth/2;
    const lo = Math.min(near,far), hi = Math.max(near,far);
    for (let s = 1.17; s < length-.2; s += .96) {
      const end = Math.min(length-.15,s+.48);
      faces.push([point(s,lo),point(end,lo),point(end,hi),point(s,hi)]);
    }
    // The two stencils beside the northern kerb indicate opposing directions.
    const mid = (lo+hi)/2;
    const arrow = (t,w) => point(.64+t*side,mid+w);
    faces.push([arrow(-.38,-.083),arrow(-.38,.083),arrow(.02,.083),arrow(.02,-.083)]);
    faces.push([arrow(.02,-.22),arrow(.02,.22),arrow(.41,0)]);
  }
  return faces;
}
