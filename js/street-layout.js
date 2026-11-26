// The base layout still runs for custom place/claim sets. Only edited source points have overrides.
import { streetEdits } from '../assets/models/world/street-edits.js';
import { relief } from './banpo_relief.js';

export function streetPlacement(K, lamps, inspect, edits = streetEdits) {
  if (!inspect && !Object.keys(edits).length) return {
    tree: (x, z, o) => K.tree(x, z, o),
    lamp: (x, z, yaw) => lamps.push([x, z, yaw]),
  };
  const occurrences = new Map();
  function keyFor(kind, x, z) {
    const base = [kind, Math.round(x * 1000), Math.round(z * 1000)].join(':');
    const index = occurrences.get(base) ?? 0;
    occurrences.set(base, index + 1);
    return index ? base + ':' + index : base;
  }
  function tree(x, z, o) {
    const key = keyFor('t', x, z), change = edits[key];
    if (change === null) return;
    if (change === undefined) K.tree(x, z, o);
    else {
      const [east, south, altitude] = change;
      K.tree(east, south, { ...o, sourceXZ: [x, z], y: altitude === null ? o.y : altitude - relief(east, south) });
    }
    // Seed extraction supplies an unrestricted kit and asks for original, unedited points.
    if (inspect) { const t = K._.trees.at(-1); inspect(key, t.kind, t.x, t.y, t.z, t.h, (x * 3 + z) % 6); }
  }
  function lamp(x, z, yaw) {
    const key = keyFor('l', x, z), change = edits[key];
    if (change === null) return;
    let y = 0;
    if (change) {
      [x, z] = change;
      if (change[2] !== null) y = change[2] - relief(x, z);
    }
    lamps.push([x, z, yaw, y]);
    inspect?.(key, 'roadLamp', x, y, z, 0, yaw);
  }
  return { tree, lamp };
}
