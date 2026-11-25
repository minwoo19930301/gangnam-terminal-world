import { relief, exteriorReliefEnabled } from '../banpo_relief.js';
import { terminalSurveyHeight } from '../garden_terrain.js';

// F002 spot heights and the terminal datum use the same survey metres.
export const gardenSurveyY=metres=>metres-terminalSurveyHeight;

// Spot heights on the upper collector and near the hotel porch bracket the
// raised motor court. The service road under it has a different elevation.
export function hotelCourtDatum(x,z) {
  if (!exteriorReliefEnabled()) return 0;
  const dx=3.64-71.54, dz=166.74-201.09;
  const t=Math.min(1,Math.max(0,((x-71.54)*dx+(z-201.09)*dz)/(dx*dx+dz*dz)));
  return gardenSurveyY(17.69+(19.08-17.69)*t)-11.5;
}

// Rear frontage frame: station increases eastward, offset increases towards
// Sapyeong-daero. Camera positions establish the alignment. Heights between
// the model's hotel, restaurant sill and terminal aisle datums are estimates.
export function gardenPoint(s,v) {
  return [71.26+.89563*s+.4448*v,143.25-.4448*s+.89563*v];
}
export function gardenStation(x,z) {
  return .89563*(x-71.26)-.4448*(z-143.25);
}
// Both the restaurant and its forecourt use this slab datum. The January panoramas show two
// open parking storeys and an enclosed upper band on the bus side, and the
// doors just above the kerb on the other. These clearances are estimates.
export const eastParkingSecond = 3.15;
export const eastParkingThird = 6.3;
export const eastGardenLevel = 9.3;
const westLevel = 12.6;
export function parkingRoof(s) {
  const t = Math.max(0, Math.min(1, (s-207.5)/(291.6-207.5)));
  return westLevel + (eastGardenLevel-westLevel)*t;
}

// Station, indoor model rise, road offset, exterior road level in the survey datum.
// The upper collector runs just below the separate 4F restaurant apron.
// The horizontal camera positions alone provide no measured vertical ordinate.
// Nearby 2023 F002 spots constrain the long upper road at three stations.
// Intermediate east-corner levels interpolate the rise from the lower bus yard.
const profile=[[-112,.05,46.8,null],[-26,11.5,51.9,17.69],[0,11.5,51.9,17.69],
  [105,12.55,52.2,17.69],[116.76,12.55,52.25,17.69],[166,12.55,52.5,17.73],
  [207.5,10.8,52.6,17.76],[263.31,8.31,50.94,17.80],[268,8.1,50.8,17.78],
  [305,6.85,50.1,17.36],[340,5.65,49,16.80],[359,4.55,48.4,16.12],
  [380,2.8,47.6,14.85],[395,.95,39.9,13.20],[403.38,.08,29.27,12.09],[416,.05,16,null]];
// Inner edge of the road builder's pavement in the rear-frontage frame.
export function gardenKerb(s) {
  for(let i=1;i<profile.length;i++) {
    const a=profile[i-1],b=profile[i];
    if(s<=b[0]) return a[2]+(b[2]-a[2])*Math.max(0,(s-a[0])/(b[0]-a[0]))-3.05;
  }
  return profile.at(-1)[2]-3.05;
}
export function gardenTerrainEdge(s) {
  if(s<=372) return Math.min(46.5,gardenKerb(s)-1.45);
  // Match the tighter radius round the stone garage end.
  const a=gardenKerb(372)-1.45;
  return s<=390?a+(40.8-a)*(s-372)/18:40.8-(s-390)*6.3/6.5;
}
function roadLevel([s,rise,v,absolute]) {
  if (!exteriorReliefEnabled()) return rise;
  return absolute===null?relief(...gardenPoint(s,v))+rise:gardenSurveyY(absolute)-.061;
}
export function gardenGrade(s,v) {
  if(s<=profile[0][0]) return profile[0][1];
  for (let i=1;i<profile.length;i++) {
    const a=profile[i-1], b=profile[i];
    if(s>b[0]) continue;
    const t=(s-a[0])/(b[0]-a[0]);
    const world=roadLevel(a)*(1-t)+roadLevel(b)*t;
    const offset=v??(a[2]*(1-t)+b[2]*t);
    return Math.max(.025,world-relief(...gardenPoint(s,offset)));
  }
  return profile.at(-1)[1];
}

export function gardenSurface(s,v) {
  const clamp=n=>Math.max(0,Math.min(1,n));
  const road=gardenGrade(s,v);
  // Carry the full parking aisle to its mapped dead end at station 372.
  // Only a pedestrian strip continues along the building beyond that bay.
  const end = clamp((s-373.5)/23);
  const innerEdge = 41-6*clamp((s-196)/24)-12*end;
  const streetEdge = 46.5-12*end;
  const deckWeight = clamp((streetEdge-v)/(streetEdge-innerEdge));
  // The upper court follows a deck. The 19.09 m spot lies on the apron
  // at station 268.71; its west continuation passes the 19.56 m spot.
  const outdoor=exteriorReliefEnabled(), ground=relief(...gardenPoint(s,v));
  const absoluteDeck=19.09+.47*clamp((268.71-s)/(268.71-52));
  const top = outdoor?gardenSurveyY(absoluteDeck)-ground-.03:parkingRoof(s)-.03;
  // At the east corner the pedestrian ledge is retained above the
  // footway. End the parking pavement at the ledge and concentrate the
  // fall at its stone face; the planted foot of the bank is shallower.
  const retained=.32*deckWeight+.68*clamp((deckWeight-.88)/.12);
  const terrace=road+(top-road)*(deckWeight+(retained-deckWeight)*clamp((s-373.5)/9));
  // A rose granite planting bed borders a paved sidewalk at the collector.
  // The surface lot behind it rises gently back to the 4F door sill. The
  // switch from the older western terrace is outside the access driveway.
  const stationBlend=clamp((s-198)/35)*clamp((390-s)/18);
  if (!stationBlend || v>=streetEdge) return terrace;
  // The pub and adjacent restaurant have a level entry arcade about 2 m
  // deep outside their sills at offset 19. Crossfall starts at its kerb.
  const apronV=21.3;
  if (v<=apronV) return terrace+(top-terrace)*stationBlend;
  const high=outdoor?gardenSurveyY(absoluteDeck)-.03:top+relief(...gardenPoint(s,apronV));
  const low=gardenGrade(s,streetEdge)+relief(...gardenPoint(s,streetEdge));
  const footwayV=gardenKerb(s)-3.55;
  // The long parking aisle stays on the apron. Only its last few metres
  // cross over to the lower, separately surveyed public road.
  const crestV=outdoor?33.8:apronV;
  const setback=clamp((footwayV-v)/(footwayV-crestV));
  const finished=low+(high-low)*setback;
  return terrace+(finished-ground-terrace)*stationBlend;
}
