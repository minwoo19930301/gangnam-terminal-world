// Exercise the game's registered stairs, conveyors and lift stops, including lazy floors.
// node --max-old-space-size=8192 tools/audit_vertical.mjs [place ...]
import fs from 'node:fs';
import * as THREE from 'three';
import { createKit } from '../js/kit.js';
import { createPhysics, createPlayer } from '../js/physics.js';
import { PLACES } from '../js/places/index.js';

const osm = JSON.parse(fs.readFileSync(new URL('../data/osm.json', import.meta.url)));
const context = new Proxy({}, {
  get(target, key) {
    if (key === 'measureText') return text => ({ width: String(text).length * 10 });
    if (['createRadialGradient', 'createLinearGradient', 'createPattern'].includes(key)) {
      return () => ({ addColorStop() {} });
    }
    if (key === 'getImageData') return () => ({ data: new Uint8ClampedArray(4) });
    return target[key] ?? (() => {});
  },
});
globalThis.__makeCanvas = (width, height) => ({ width, height, style: {}, getContext: () => context });

const phys = createPhysics();
const kit = createKit(THREE, new THREE.Scene(), { osm, phys });
kit.onNight = () => {};
const counts = new Map(), issues = [], inclines = [], stairs = [], rides = [];
const steppedSupports = new WeakSet();
const registerRamp = phys.addRamp;
phys.addRamp = (...args) => {
  const support = registerRamp(...args);
  if (args.at(-1)?.steps) steppedSupports.add(support);
  inclines.push(support);
  return support;
};

function classify(method, options) {
  if (method === 'escalator' || (options.steps && options.move)) return 'escalators';
  if (options.move) return 'movingWalks';
  if (method === 'stairs' || options.steps) return 'stairs';
  return 'ramps';
}

function observe(place) {
  const row = { stairs: 0, escalators: 0, ramps: 0, movingWalks: 0, lifts: 0, liftStops: 0 };
  counts.set(place, row);
  // A few place modules spread the kit into a new object when switching floors.
  const api = { ...kit };
  for (const method of ['stairs', 'ramp', 'escalator']) {
    api[method] = (ax, az, bx, bz, options = {}) => {
      const type = classify(method, options);
      row[type]++;
      const start = inclines.length;
      const value = kit[method](ax, az, bx, bz, options);
      const registered = inclines.slice(start);
      const first = registered[0];
      if (!first || ![ax, az, bx, bz, first.ya, first.yb].every(Number.isFinite) ||
          Math.hypot(ax - bx, az - bz) < .01 || first.hw <= 0) {
        issues.push(place + ' has invalid support for ' + type);
        return value;
      }
      if (type === 'stairs') stairs.push({ place, support: first });
      if (type === 'movingWalks' || (type === 'escalators' && options.speed !== 0)) {
        const support = registered.find(r => r.move && Math.hypot(...r.move) > 0);
        if (support) {
          const down = method === 'escalator' ? options.dir === 'down' : (support.yb - support.ya) * options.move < 0;
          rides.push({ place, support, down });
        } else {
          issues.push(place + ' moving incline has no motor');
        }
      }
      return value;
    };
  }
  api.elevator = options => {
    row.lifts++;
    row.liftStops += options.floors.length;
    const valid = options.floors.every(f => Number.isFinite(f.y) &&
      Number.isFinite(options.x + (f.dx ?? 0)) && Number.isFinite(options.z + (f.dz ?? 0)));
    if (!valid || !options.floors.length) issues.push(place + ' lift has an invalid stop');
    return kit.elevator(options);
  };
  api.detail = (options, build) => kit.detail(options, () => build(api));
  return api;
}

const selected = process.argv.slice(2);
for (const place of selected.length ? selected : PLACES) {
  const mod = await import('../js/places/' + place + '.js');
  kit._.setCurrent(place, mod.meta);
  mod.build(observe(place));
}
kit._.buildAllDetail();

// Include places that register a conveyor directly with physics.
const recorded = new Set(rides.map(r => r.support));
for (const support of inclines) {
  if (recorded.has(support) || !support.move || !Math.hypot(...support.move)) continue;
  const forward = support.ux * support.move[0] + support.uz * support.move[1];
  const place = support.tag ?? 'unattributed';
  rides.push({ place, support, down: forward * (support.yb - support.ya) < 0 });
  if (counts.has(place)) counts.get(place)[steppedSupports.has(support) ? 'escalators' : 'movingWalks']++;
}

function pointOn(s, fraction) {
  const x = s.ax + s.ux * s.L * fraction, z = s.az + s.uz * s.L * fraction;
  return { x, z, y: s.ya + (s.yb - s.ya) * fraction + (s.heightOffset?.(x, z) ?? 0) };
}

function carriesPassenger({ support, down }) {
  const speed = Math.hypot(...support.move);
  // Stay clear of the landing even on short flights.
  const frames = Math.min(90, Math.max(10, Math.floor(support.L * .12 / speed * 60)));
  return [.2, .5, .8].every(fraction => {
    const start = pointOn(support, fraction), player = createPlayer(phys);
    Object.assign(player, start);
    for (let i = 0; i < frames; i++) player.update(1 / 60, { f: 0, s: 0 });
    const carried = ((player.x - start.x) * support.move[0] + (player.z - start.z) * support.move[1]) / speed;
    const rise = (player.y - start.y) * (down ? -1 : 1);
    return carried >= .035 && Math.abs(rise) <= .9 && (support.yb === support.ya || rise >= .012);
  });
}

function clearance({ support }) {
  const { r, step, height } = createPlayer(phys);
  return [.12, .25, .5, .75, .88].every(fraction => {
    const { x, y, z } = pointOn(support, fraction);
    // A central handrail may divide wide flights. Try both sides as well.
    return [0, -.5, .5].some(lane => {
      const offset = support.hw * lane;
      const p = { x: x - support.uz * offset, z: z + support.ux * offset };
      const floor = phys.support(p.x, p.z, y + step).y;
      if (floor - y > step + .001 || y - floor > .18) return false;
      const before = { ...p };
      phys.resolve(p, r, floor, floor + height, step);
      return Math.hypot(p.x - before.x, p.z - before.z) < .15;
    });
  });
}

function checkAll(name, items, check) {
  const bad = items.filter(item => !check(item));
  console.log(name, items.length - bad.length, 'passed,', bad.length, 'flagged');
  for (const { place, support } of bad) issues.push(place + ' ' + name +
    ' at model elevation ' + support.ya.toFixed(1) + ' to ' + support.yb.toFixed(1));
}
console.table(Object.fromEntries(counts));
const total = {};
for (const row of counts.values()) {
  for (const [key, value] of Object.entries(row)) total[key] = (total[key] || 0) + value;
}
console.log('Total', JSON.stringify(total));
checkAll('Passenger movement', rides, carriesPassenger);
checkAll('Stair cross-sections', stairs, clearance);
issues.push(...kit._.detailErrors);
for (const issue of issues) console.error(issue);
if (issues.length) process.exitCode = 1;
