import { relief } from './banpo_relief.js';

// Wheel order: rear left, rear right, front left, front right. The expected
// surface identifies the storey when a garage, ramp and street share an X/Z.
export function wheelContacts(phys, x, z, sin, cos, track, axle, expected, out, accept) {
  for (let i = 0; i < 4; i++) {
    const across = (i % 2 ? 1 : -1) * track, along = (i < 2 ? -1 : 1) * axle;
    const px = x + across * cos + along * sin, pz = z - across * sin + along * cos;
    const target = expected(px, pz), terrain = relief(px, pz);
    const hit = phys.support(px, pz, target - terrain + .45, accept);
    const height = terrain + hit.y;
    out[i] = hit.s && hit.s.kind !== 'ground' && height >= target - .45 ? height : target;
  }
  const [bl, br, fl, fr] = out;
  out.height = (bl + br + fl + fr) / 4;
  out.forward = (fl + fr - bl - br) / (4 * axle);
  out.right = (br + fr - bl - fl) / (4 * track);
  return out;
}
