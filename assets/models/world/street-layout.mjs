// Capture city.js itself with all detailed-place OSM claims, without opening a renderer.
import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import * as THREE from 'three';
import { createPhysics } from '../../../js/physics.js';
import { createKit } from '../../../js/kit.js';
import { buildCity } from '../../../js/city.js';
import { PLACES } from '../../../js/places/index.js';
import { applyRoadEdits } from '../../../js/blender-roads.js';
import { relief } from '../../../js/banpo_relief.js';
import { streetEdits } from './street-edits.js';

export async function writeStreetLayout(directory) {
  const read = async name => JSON.parse(await fs.readFile(new URL(name, import.meta.url), 'utf8'));
  const [rawOsm, apartments, places] = await Promise.all([
    read('../../../data/osm.json'), read('../../../js/places/_re_models.json'),
    Promise.all(PLACES.map(id => import('../../../js/places/' + id + '.js'))),
  ]);
  const osm = applyRoadEdits(rawOsm);
  const claims = field => new Set(places.flatMap(({meta}) => meta[field] || []));
  const claimedBuildings = claims('claims');
  for (const model of apartments.models) for (const id of model.claims) claimedBuildings.add(id);
  const canvas = globalThis.__makeCanvas;
  const ctx = new Proxy({
    measureText: text => ({width: String(text).length * 10}),
    createLinearGradient: () => ({addColorStop(){}}),
    createRadialGradient: () => ({addColorStop(){}}),
    createPattern: () => ({addColorStop(){}}),
    getImageData: () => ({data: new Uint8ClampedArray(4)}),
  }, {get: (t, k) => t[k] ?? (() => {})});
  const points = [];
  try {
    globalThis.__makeCanvas = (width, height) => ({width, height, style:{}, getContext:()=>ctx});
    // As in the complete player scene, build the places before the city to register
    // the stairwells and river cuts that exclude planting. Skip unrelated render batches.
    const K = createKit(THREE, new THREE.Scene(), {osm, phys:createPhysics(), keep:owner => owner === 'city'});
    K.onNight = () => {};
    for (const {meta, build} of places) {
      K._.setCurrent(meta.id, meta);
      build(K);
    }
    K._.setCurrent('city');
    buildCity(K, osm, {
      claimedBuildings, claimedRoads:claims('claimRoads'), claimedAreas:claims('claimAreas'),
      streetPlacementEdits: {},
      inspectStreetPlacement(key, kind, x, y, z, h, yaw) {
        const source = [x, -z, y + relief(x,z)];
        const row = { key, kind, xyz: source, h, yaw };
        const moved = streetEdits[key];
        if (moved === null) row.edited = null;
        else if (moved) row.edited = [moved[0], -moved[1], moved[2] ?? y + relief(moved[0], moved[1])];
        if (moved) row.override = moved;
        points.push(row);
      },
    });
  } finally {
    if (canvas === undefined) delete globalThis.__makeCanvas;
    else globalThis.__makeCanvas = canvas;
  }
  await fs.mkdir(directory, {recursive:true});
  await fs.writeFile(path.join(directory, 'street-layout.json'), JSON.stringify(points));
  return points.length;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  if (!process.argv[2]) throw Error('Usage: node assets/models/world/street-layout.mjs <seed directory>');
  console.log(await writeStreetLayout(process.argv[2]), 'street points');
}
