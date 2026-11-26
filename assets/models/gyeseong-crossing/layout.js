// Gyeseong Elementary School entrance intersection, northern landing on Sinbanpo-ro.
// The city crossing inventory identifies the intersection. The warning tile and the
// setback toward the west come from the January 2026 panorama, not a site survey.
export const crossingWay=1319203492;

export function northLanding(road){
  if(!road)return null;
  const [[x,z],[nextX,nextZ]]=road.pts;
  const length=Math.hypot(nextX-x,nextZ-z),dx=(nextX-x)/length,dz=(nextZ-z)/length;
  const at=(along,west)=>[x+dx*along-dz*west,z+dz*along+dx*west];
  return {
    corner:[x,z],
    lamp:at(-.48,3.35),
    yaw:Math.atan2(dx,dz),
    warning:[at(.32,-.78),at(.32,.78),at(-.28,.78),at(-.28,-.78)],
  };
}
