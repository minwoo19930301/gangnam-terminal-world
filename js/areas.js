import {cinemaPreview} from '../assets/models/megabox-central/layout.js';
// Area loading. The world is split into areas, and a page load builds only one of them:
//  - outdoor districts (streets, plazas, parks, building exteriors), and
//  - one interior area per building (or per connected underground cluster).
// Walking into a building, out of it, or across a district boundary reloads the page at the new address
// (#/<place>/<floor>?p=x,y,z,yaw) with a loading screen. Inside an area everything keeps full detail.
// Module bounding boxes/levels/claims come from js/places/_meta.json (node tools/gen_meta.mjs).

export const OUTDOOR = new Set(['streets', 'hangang', 'jamwon_hangang']);
// modules that are walked through as one place (their corridors interleave at many points)
export const CLUSTERS = [['gotomall', 'station'], ['famille', 'centralcity']];
// x east, z south. Cover the OSM extent and both banks of the authored Han River.
export const DISTRICTS = [
  { id: 'core', name: '고속터미널 일대', box: [-430, -330, 1000, 700] },
  { id: 'jamwon', name: '잠원 · 뉴코아 · 반원상가 · 잠원한강공원', box: [-60, -2900, 1600, -330] },
  { id: 'banpo', name: '반포한강공원 · 세빛섬 · 서래', box: [-1950, -2900, -60, 700] },
];
const CITY_MARGIN = 220;   // generic city ground clutter (roads, markings, trees) kept this far beyond the area
const EXT_MARGIN = 200;    // other buildings' exteriors kept this far beyond an interior area
const UNDER = -1.5;        // below this a primitive is underground

const inBox = (b, x, z, m = 0) => x >= b[0] - m && x <= b[2] + m && z >= b[1] - m && z <= b[3] + m;
const boxesTouch = (a, b, m = 0) => a[0] - m <= b[2] && a[2] + m >= b[0] && a[1] - m <= b[3] && a[3] + m >= b[1];
export function districtAt(x, z) {
  for (const d of DISTRICTS) if (inBox(d.box, x, z)) return d;
  // Links just beyond an imported edge should still load the nearest streets.
  let nearest, shortest = Infinity;
  for (const district of DISTRICTS) {
    const [west, north, east, south] = district.box;
    const distance = Math.hypot(Math.max(west - x, 0, x - east), Math.max(north - z, 0, z - south));
    if (distance < shortest) { nearest = district; shortest = distance; }
  }
  return nearest ?? DISTRICTS[0];
}
const clusterOf = id => CLUSTERS.find(c => c.includes(id)) || [id];
// does module m have anything (40 m cells, from _meta.json) within box b + margin?
const G = 40;
function touches(meta, b, mgn) {
  if (!meta.cells) return meta.box ? boxesTouch(meta.box, b, mgn) : false;
  for (const c of meta.cells) { const [i, j] = c.split(',').map(Number); if (boxesTouch([i * G, j * G, (i + 1) * G, (j + 1) * G], b, mgn)) return true; }
  return false;
}

// The area a player at (x,y,z) standing in zone `zn` (phys.zoneAt) belongs to.
export function areaIdAt(zn, x, y, z) {
  const place = zn && zn.place;
  if (place && place !== 'city' && !OUTDOOR.has(place)) return 'in:' + clusterOf(place).join('+');
  return 'out:' + districtAt(x, z).id;
}
// Area for an address key "<place>/<floor>" (+ optional position) — used before anything is built.
export function areaIdForKey(key, pos, META) {
  const [addressPlace, floor] = (key || '').split('/');
  const place = META[addressPlace]?.floorAliases?.[floor] ?? addressPlace;
  if (META[place] && !OUTDOOR.has(place)) return 'in:' + clusterOf(place).join('+');
  const p = pos && pos.length >= 3 ? pos : null;
  if (p) return 'out:' + districtAt(p[0], p[2]).id;
  if (META[place] && META[place].box) { const b = META[place].box; return 'out:' + districtAt((b[0] + b[2]) / 2, (b[1] + b[3]) / 2).id; }
  return 'out:core';
}
export function areaName(id, META) {
  if (id.startsWith('out:')) return (DISTRICTS.find(d => 'out:' + d.id === id) || {}).name || id;
  return id.slice(3).split('+').map(m => META[m]?.name || m).join(' · ');
}

// What to build for an area and what to keep of it.
//   modules: place modules to import and build (others are not downloaded at all; their claims still apply)
//   keep(owner, x, y, z, ny): keep this primitive (centroid; ny = normal y)?
//   keepDetail(group): build this lazy detail group?
//   box: the area's own extent (for the HUD/map), name
export function planArea(id, META, JUNCTIONS = []) {
  const all = Object.keys(META);
  if (id === 'all') return { id, name: '전체', modules: all, keep: null, keepDetail: null, box: null };
  if (id.startsWith('out:')) {
    const d = DISTRICTS.find(d => 'out:' + d.id === id) || DISTRICTS[0], B = d.box;
    const modules = all.filter(m => OUTDOOR.has(m) ? touches(META[m], B, 120) : touches(META[m], B, 60)); // others: far massing (main.js)
    const holes = []; // stairs/ramps down stay visible from the street: keep underground geometry close to building entrances
    for (const m of modules) for (const j of META[m].junctions || []) if (j.y < UNDER || (j.also || []).some(y => y < UNDER)) holes.push([j.x, j.z]);
    const nearHole = (x, z) => holes.some(h => Math.abs(h[0] - x) < 14 && Math.abs(h[1] - z) < 14);
    return {
      id, name: d.name, modules, box: B,
      keep(owner, x, y, z, ny) {
        if (owner === 'ground' || owner === 'lod') return true;
        if (owner === 'city' || owner === 'main') return inBox(B, x, z, CITY_MARGIN) || (Math.abs(ny) < 0.5 || y > 2.5); // far away: building walls/roofs only (skyline)
        if (OUTDOOR.has(owner)) return inBox(B, x, z, CITY_MARGIN) || y > 2.5;
        return y > -3.2 || nearHole(x, z); // above ground, plus the top of stairs and ramps and the ones right at the entrances
      },
      keepDetail(g) { return OUTDOOR.has(g.owner) ? inBox(B, (g.bb[0] + g.bb[2]) / 2, (g.bb[1] + g.bb[3]) / 2, 60) : g.y0 >= UNDER && g.y0 < 3; },
    };
  }
  // Old explicit area links may name just one half of a connected interior.
  const interior = id.slice(3);
  const own = interior.includes('+') ? interior.split('+') : clusterOf(interior);
  id = 'in:' + own.join('+');
  const ownSet = new Set(own);
  let B = null; for (const m of own) { const b = META[m]?.box; if (!b) continue; B = B ? [Math.min(B[0], b[0]), Math.min(B[1], b[1]), Math.max(B[2], b[2]), Math.max(B[3], b[3])] : b.slice(); }
  B = B || [-200, -200, 200, 200];
  // A building page builds that building only. Modules it connects to underground are built too (their floors and walls
  // make the corridors walkable up to the reload), but only the first ~28 m of each connecting corridor is shown.
  // The street right outside the doors (40 m) is kept so the entrances look right; every other building is a plain block.
  const neigh = new Set(); for (const m of own) for (const j of META[m]?.junctions || []) if (!ownSet.has(j.other)) neigh.add(j.other);
  const modules = all.filter(m => ownSet.has(m) || neigh.has(m) || (m === 'streets' && touches(META[m], B, 40)));
  // From the department's café passage, the neighbouring dessert cases and
  // vaults are visible before the shopper crosses the normal loading boundary.
  const cafeJunction=ownSet.has('shinsegae') && META.shinsegae?.junctions.find(j=>j.id==='J_SWEET_CAFE_AISLE');
  const mouths = []; for (const m of own) for (const j of META[m]?.junctions || []) if (!ownSet.has(j.other)) mouths.push([j.x, j.z, j.y, j.also || []]);
  const nearMouth = (x, y, z) => {
    for (const [mx, mz, my, also] of mouths) {
      const dx = mx-x, dz = mz-z;
      if (dx*dx + dz*dz >= 28*28) continue;
      if (Math.abs(my-y) < 7 || also.some(floor => Math.abs(floor-y) < 7)) return true;
    }
    return false;
  };
  return {
    id, name: own.map(m => META[m]?.name || m).join(' · '), modules, box: B, lodSolid: false, interiorOwners: ownSet,
    keep(owner, x, y, z, ny, sharedShell) {
      if (ownSet.has(owner) || owner === 'ground' || owner === 'lod' || (sharedShell && ownSet.has(sharedShell))) return true;
      if (owner === 'city' || owner === 'main') return inBox(B, x, z, 40) || ((Math.abs(ny) < 0.5 || y > 2.5) && inBox(B, x, z, 900)); // walls/roofs: what you see out of the windows
      if (owner === 'shinsegae' && ownSet.has('centralcity') && cinemaPreview(x,y,z)) return true;
      if (owner === 'streets') return inBox(B, x, z, 40) && (y > -3.2 || nearMouth(x, y, z));
      return nearMouth(x, y, z);
    },
    keepDetail(g) {
      if(ownSet.has(g.owner))return true;
      if(!cafeJunction || g.owner!=='centralcity' || g.floor!=='B1')return false;
      const [x0,z0,x1,z1]=g.bb;
      // Large whole-building groups remain on their own page. Local cells
      // still use the usual distance and camera checks in the detail loader.
      return x1-x0<20 && z1-z0<20 &&
        Math.hypot((x0+x1)/2-cafeJunction.x,(z0+z1)/2-cafeJunction.z)<27;
    },
  };
}
