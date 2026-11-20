// Rear frontage frame: station increases eastward, offset increases towards
// Sapyeong-daero. Camera positions establish the alignment. Heights between
// the model's hotel, restaurant sill and terminal aisle datums are estimates.
export function gardenPoint(s,v) {
  return [71.26+.89563*s+.4448*v,143.25-.4448*s+.89563*v];
}
export function gardenStation(x,z) {
  return .89563*(x-71.26)-.4448*(z-143.25);
}
const profile=[[0,11.5],[105,12.55],[325,12.55],[355.6,10],[388.6,7.1],[402,4],[415.7,.05]];
export function gardenGrade(s) {
  if(s<=profile[0][0]) return profile[0][1];
  for (let i=1;i<profile.length;i++) {
    const [start,ya]=profile[i-1], [end,yb]=profile[i];
    if(s<=end) return ya+(yb-ya)*(s-start)/(end-start);
  }
  return profile.at(-1)[1];
}

// The restaurant doors meet the parking roof. The approach falls to the
// collector outside the planted median; the garage's east stone wing stands
// above the street after the restaurant terrace ends.
export function gardenSurface(s,v) {
  const clamp=n=>Math.max(0,Math.min(1,n));
  const road=gardenGrade(s);
  return road+(12.57-road)*clamp((39-v)/17)*clamp((367-s)/20);
}
