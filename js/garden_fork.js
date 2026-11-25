// The two January street-view turns follow the bus-side driveway, then OSM
// 498559929 out to the arterial. The end heights are approximate: the lower
// bus-yard spots range from 10.20–10.93 m, and the arterial tie is a DEM sample.
// The intermediate split matches the separately modelled inner collector.
export const gardenForkAxis=[
  [452.44,-45.81],[444.8,-39.2],[443,-32],[442.5,-21.2],[445.56,-9.96],
  [448.85,-1.11],[448.39,8.77],[447.9,12.29],[446.54,17.2],[444.36,21.23],
  [441.95,24],[438.67,26.88],[431.8,31.82],[421.5,38.35]
];
const stations=[0];
for(let i=1;i<gardenForkAxis.length;i++){
  const [x,z]=gardenForkAxis[i],[a,b]=gardenForkAxis[i-1];
  stations.push(stations[i-1]+Math.hypot(x-a,z-b));
}
export function gardenForkProfile(x,z) {
  let best=Infinity, station=0, offset=0;
  for(let i=1;i<gardenForkAxis.length;i++){
    const [a,b]=gardenForkAxis[i-1],[c,d]=gardenForkAxis[i];
    const dx=c-a,dz=d-b,len=stations[i]-stations[i-1];
    const t=Math.min(1,Math.max(0,((x-a)*dx+(z-b)*dz)/(len*len)));
    const ex=x-a-t*dx,ez=z-b-t*dz,dist=ex*ex+ez*ez;
    if(dist<best) {
      best=dist;
      station=stations[i-1]+t*len;
      offset=(ez*dx-ex*dz)/len;
    }
  }
  const split=stations[4],end=stations.at(-1);
  const height=station<=split?10.20+(12.09-10.20)*station/split:
    12.09+(17.67-12.09)*(station-split)/(end-split);
  return {height,distance:Math.sqrt(best),station,offset};
}
