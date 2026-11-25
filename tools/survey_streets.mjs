// Export project geometry in metres and WGS84 for repeatable map review.
// Run from anywhere: node tools/survey_streets.mjs [output-directory]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { surveyElevation, relief } from '../js/banpo_relief.js';
import { terminalSurveyHeight } from '../js/banpo_dem.js';
import { JUNCTIONS } from '../js/places/_junctions.js';


const root = fileURLToPath(new URL('../', import.meta.url));
const out = process.argv[2] || path.join(root, 'docs/map-audit/network');
const osm = JSON.parse(fs.readFileSync(path.join(root, 'data/osm.json')));
const { lat, lon, kx, kz } = osm.origin;
const owners = new Map();
const places = JSON.parse(fs.readFileSync(path.join(root, 'js/places/_meta.json')));
for (const [place, meta] of Object.entries(places)) {
  for (const id of new Set(meta.claimRoads)) {
    if (!owners.has(id)) owners.set(id, []);
    owners.get(id).push(place);
  }
}
fs.mkdirSync(out, { recursive: true });
function csv(file, header, rows) {
  const quote = v => '"' + String(v ?? '').replaceAll('"', '""') + '"';
  fs.writeFileSync(path.join(out, file), [header, ...rows].map(r => r.map(quote).join(',')).join('\n') + '\n');
}
function coordinates([x, z]) {
  return [(lat - z / kz).toFixed(7), (lon + x / kx).toFixed(7)];
}
// The midpoint radii of curvature give a local ellipsoidal check on the
// project's constant metres/degree. Both lengths use the same source vertices.
function distances(pts) {
  let plan = 0, ellipsoid = 0;
  const radians = Math.PI / 180, e2 = 0.0066943799901413165;
  for (let i = 1; i < pts.length; i++) {
    const [x, z] = pts[i], [px, pz] = pts[i - 1];
    const phi = (lat - (z + pz) / (2 * kz)) * radians;
    const d = 1 - e2 * Math.sin(phi) ** 2;
    const east = 6378137 / Math.sqrt(d) * Math.cos(phi) * (x - px) / kx * radians;
    const north = 6378137 * (1 - e2) / d ** 1.5 * (pz - z) / kz * radians;
    plan += Math.hypot(x - px, z - pz);
    ellipsoid += Math.hypot(east, north);
  }
  return [plan.toFixed(2), ellipsoid.toFixed(2)];
}
const fragments = new Map();
const roads = osm.roads.map(r => {
  const fragment = (fragments.get(r.id) || 0) + 1;
  fragments.set(r.id, fragment);
  const start = r.pts[0], end = r.pts.at(-1);
  const layers = [r.tunnel && 'tunnel', r.bridge && 'bridge', r.covered && 'covered'].filter(Boolean);
  return [r.id, fragment, r.name, r.hw, r.footway, r.layer, r.level, layers.join('+'), owners.get(r.id)?.join('+') || 'city',
    ...distances(r.pts), ...coordinates(start), ...coordinates(end),
    (surveyElevation(...start) + terminalSurveyHeight).toFixed(2),
    (surveyElevation(...end) + terminalSurveyHeight).toFixed(2)];
});
csv('ways.csv', ['osm_way','fragment','name','highway','footway','layer','level','structure','claim_or_default','plan_m','ellipsoid_approx_m','start_lat','start_lon','end_lat','end_lon','ground_at_start_m','ground_at_end_m'], roads);

const points = osm.nodes.filter(n => n.k === 'traffic_signals' || n.k === 'crossing')
  .map(n => [n.k, n.name, n.x, n.z, n.crossing]);
for (const e of osm.exits) points.push(['entrance', e.ref, e.x, e.z, '']);
for (const p of points) {
  const [, , x, z] = p;
  p.push(...coordinates([x, z]), (surveyElevation(x,z) + terminalSurveyHeight).toFixed(2),
    (relief(x,z) - surveyElevation(x,z)).toFixed(2));
}
csv('controls.csv', ['type','ref_or_name','x','z','crossing_control','lat','lon','source_ground_m','model_minus_source_ground_m'], points);
const links = JUNCTIONS.flatMap(j => [j.y, ...(j.alsoY || [])].map(y => [
  j.id, j.a, j.b, y, j.streamOnly ? 'streaming' : 'passage', ...j.pa, ...j.pb,
  ...distances([j.pa, j.pb]), ...coordinates(j.pa), ...coordinates(j.pb)
]));
csv('junctions.csv',['id','place_a','place_b','model_y','type','x_a','z_a','x_b','z_b','endpoint_chord_m','ellipsoid_chord_m','lat_a','lon_a','lat_b','lon_b'], links);
console.log(roads.length + ' clipped segments (' + fragments.size + ' ways), ' + points.length + ' controls, ' + links.length + ' junction/level pairs');
