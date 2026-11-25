// Outdoor vertical reference for the already stacked terminal geometry.
// The city DEM includes upper street/deck returns. Authored parking storeys
// have their own height above 1F, so they need the lower frame underneath.
// All survey heights below refer to Seoul OA-22241 N3P_F002 (2023/2025).
import { terminalSurveyHeight } from './banpo_dem.js';
export { terminalSurveyHeight };
import { gardenForkProfile } from './garden_fork.js';

const clamp = n => Math.max(0,Math.min(1,n));
const mix = (a,b,t) => a+(b-a)*t;
function blend(start,end,x) {
  const t=clamp((x-start)/(end-start));
  return t*t*(3-2*t);
}

export function gardenReference(x,z,ground) {
  const s=.89563*(x-71.26)-.4448*(z-143.25);
  const v=.4448*(x-71.26)+.89563*(z-143.25);
  // Keep the public arterial on its survey surface. The upper collector
  // turns around the end of the garage; its parallel slip rejoins the street.
  const outside=mix(52.5,27,blend(372,415,s));
  const northEdge=mix(-153,-119,blend(20,115,s));
  // At the western T beside the Starbucks dome, the collector, the hotel
  // ramp foot and the street beyond share the uncovered survey surface.
  // Keep the lower 1F reference under the occupied building and bus aisle.
  const westStreet=(1-blend(-89,-65,s))*blend(32,40,v);
  const weight=blend(-139,-95,s)*(1-blend(425,454,s))*
    blend(northEdge,northEdge+19,v)*(1-blend(outside,outside+6.5,v))*(1-westStreet);

  // Model height of the upper finished surface above authored 1F. This
  // locates the bases of separately modelled buildings, not the DEM itself.
  const hotelBase=19.08-11.5;
  const westGarageBase=19.55-12.6;
  const eastGarageBase=19.09-9.3;
  const west=mix(hotelBase,westGarageBase,blend(-28,30,s));
  const garageBase=mix(west,eastGarageBase,clamp((s-207.5)/(291.6-207.5)));
  // On the uncovered bus side, use nearby low spots (10.93 and 10.40).
  // The 18.22 m point above that aisle belongs to the blue-girder bridge.
  const low=mix(10.93,10.40,blend(20,285,s));
  const northFoot=mix(-39,-14,blend(-22,25,s));
  const foundation=mix(low,garageBase,blend(northFoot,northFoot+13,v));
  const reference=mix(ground,foundation-terminalSurveyHeight,weight);
  if (x<394 || x>495 || z< -82 || z>65) return reference;

  // The same cell can contain the hotel lane and the outer slip to the
  // arterial. Give both ribbons a continuous bed below their finished
  // surfaces, including the refuge. Otherwise a raw city DEM triangle
  // cuts diagonally up through the asphalt and zebra at the split.
  const fork=gardenForkProfile(x,z);
  const publicSide=fork.offset<0;
  const feather=1-blend(publicSide?12:9,22,fork.distance);
  const weightAtRoad=feather*blend(1,18,fork.station);

  // The upper tip merges flush into the public road. Adopt its ground
  // instead of extending the recessed island across that road.
  const clearance=mix(.55,.045,blend(16.6,17.67,fork.height));
  const bed=fork.height-terminalSurveyHeight-clearance;
  // Keep the low garage side below both rising lanes. Bring the island
  // to the outer kerb datum and feather into the uncovered public side.
  const finished=publicSide ? Math.min(ground,bed) : mix(Math.min(bed,reference),bed,
    1-blend(3,11,fork.distance));
  const island=mix(reference,finished,weightAtRoad);

  // Jamwon-ro, OSM 218681382, shares the low junction before it climbs
  // to the arterial. The centreline and markings need the same grade
  // across the carriageway. Join the existing surveyed road at its crest.
  const dx=20.04,dz=58.05,length=Math.hypot(dx,dz);
  const along=((x-452.44)*dx+(z+45.81)*dz)/length;
  const across=((x-452.44)*dz-(z+45.81)*dx)/length;
  const streetWeight=blend(-22,-8,along)*(1-blend(length-5,length+8,along))*
    (1-blend(7.6,15.5,Math.abs(across)));
  if (!streetWeight) return island;
  const u=clamp((along-4)/(length-4)), shoulder=.09;
  const rise=u<shoulder?u*u/(2*shoulder):
    u>1-shoulder?1-shoulder-(1-u)*(1-u)/(2*shoulder):u-shoulder/2;
  const street=mix(10.16,16.64,rise/(1-shoulder))-terminalSurveyHeight;
  return mix(island,street,streetWeight);
}
