import {roadEdits} from '../assets/models/world/road-edits.js';

// OSM ways can occur as multiple clipped parts in the source. Keep that order.
export function keyedRoads(roads) {
  const counts=new Map();
  return roads.map(road=>{
    const index=counts.get(road.id) ?? 0;
    counts.set(road.id,index+1);
    return [road,index ? road.id+'#'+index : String(road.id)];
  });
}

export function applyRoadEdits(osm, edits=roadEdits) {
  if (!Object.keys(edits).length) return osm;
  for (const [road,key] of keyedRoads(osm.roads)) {
    const edit=edits[key];
    if (!edit) continue;
    if (edit.points) road.pts=edit.points.map(p=>[...p]);
    if (edit.width!==undefined) road.width=edit.width;
  }
  return osm;
}
