// A floor address without coordinates should open on a floor the player can stand on.
// Use authored viewpoints first, especially where adjacent venues share their floor slab.
export function floorArrival(phys, kit, player, place, floor) {
  function landing(x, y, z, yaw) {
    const ground = phys.support(x, z, y + 1).y; // same snap as player.teleport
    if (!Number.isFinite(ground)) return;
    const zone = phys.zoneAt(x, ground + .1, z);
    if (zone?.place !== place || (zone.floor || '1F') !== floor) return;
    if (phys.ceilingAbove(x, z, ground + .1, ground + player.height) !== Infinity) return;
    const foot = {x, z};
    phys.resolve(foot, player.r, ground, ground + player.height, player.step);
    if (Math.hypot(foot.x - x, foot.z - z) > .04) return;
    return {x, y, z, yaw};
  }
  // Shared complexes can register outdoor landmarks before their public concourse.
  const preferred = kit.spawns.find(s => s.place === place && s.arrivalFloor === floor);
  if (preferred) {
    const spot = landing(preferred.x, preferred.y ?? 0, preferred.z, preferred.yaw);
    if (spot) return spot;
  }
  for (const s of kit.spawns) {
    const zone = phys.zoneAt(s.x, (s.y ?? 0) + .1, s.z);
    if (zone?.place !== place || (zone.floor || '1F') !== floor) continue;
    const spot = landing(s.x, s.y ?? 0, s.z, s.yaw);
    if (spot) return spot;
  }
  for (const lift of kit.elevators) {
    if (lift.place !== place) continue;
    for (const stop of lift.floors) {
      if (stop.label !== floor) continue;
      const spot = landing(lift.x + (stop.dx || 0), stop.y + .05, lift.z + (stop.dz || 0));
      if (spot) return spot;
    }
  }
  const zones = kit.zonesList.filter(z => z.place === place && (z.floor || '1F') === floor);
  for (const zone of zones) {
    const [left, top, right, bottom] = zone.bb;
    // Try the middle, then the sides. Each point is checked against the actual
    // zone, headroom, slab holes and walls, including concave footprints.
    for (const u of [.5, .25, .75, .1, .9]) {
      for (const v of [.5, .25, .75, .1, .9]) {
        const x = left + (right - left) * u, z = top + (bottom - top) * v;
        const y = zone.y0 + (zone.heightOffset?.(x,z) || 0);
        const spot = landing(x, y, z);
        if (spot) return spot;
      }
    }
  }
}
