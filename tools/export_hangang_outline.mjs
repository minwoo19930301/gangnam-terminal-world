// Export the polygon actually registered by the Banpo place, without a renderer.
import fs from 'node:fs';
import * as THREE from 'three';
import { createPhysics } from '../js/physics.js';
import { createKit } from '../js/kit.js';
import { build, meta } from '../js/places/hangang.js';

const gradients = { addColorStop() {} };
const context = new Proxy({
  measureText: text => ({ width: String(text).length * 10 }),
  createLinearGradient: () => gradients,
  createRadialGradient: () => gradients,
  createPattern: () => gradients,
  getImageData: () => ({ data: new Uint8ClampedArray(4) }),
}, { get: (target, key) => target[key] ?? (() => {}) });
globalThis.__makeCanvas = (width, height) => ({ width, height, style: {}, getContext: () => context });

const osm = JSON.parse(fs.readFileSync(new URL('../data/osm.json', import.meta.url)));
const kit = createKit(THREE, new THREE.Scene(), { osm, phys: createPhysics() });
kit.onNight = () => {};
kit._.setCurrent(meta.id, meta);
build(kit);
const parks = kit._.zonesList.filter(zone => zone.place === meta.id && zone.name === '반포한강공원');
if (parks.length !== 1) throw Error(`Expected one Banpo riverside zone, found ${parks.length}`);
console.log(JSON.stringify(parks[0].poly));
