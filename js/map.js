// Minimap + full map (placeholder — a richer version replaces this file; keep the createMap() interface).
// Interface: createMap({THREE,K,osm,player,phys,spawns,places,container,zoneAt}) -> {update(dt), toggle(), isOpen()}
export function createMap({ osm, player, spawns, container }) {
  const S = 0.6; // px per meter on base canvas
  const [x0, z0, x1, z1] = osm.bbox;
  const W = Math.ceil((x1 - x0) * S), H = Math.ceil((z1 - z0) * S);
  const base = document.createElement('canvas'); base.width = W; base.height = H;
  const g = base.getContext('2d');
  const P = (x, z) => [(x - x0) * S, (z - z0) * S];
  g.fillStyle = '#e9e6df'; g.fillRect(0, 0, W, H);
  const fillPoly = (poly, c) => { g.fillStyle = c; g.beginPath(); poly.forEach((p, i) => { const [a, b] = P(p[0], p[1]); i ? g.lineTo(a, b) : g.moveTo(a, b); }); g.closePath(); g.fill(); };
  for (const a of osm.areas) { const c = { 'natural:water': '#a9cdea', 'leisure:park': '#c7e3b4', 'landuse:grass': '#d2eabd', 'amenity:parking': '#d8d8d8', 'leisure:pitch': '#b9dca2' }[a.kind]; if (c) fillPoly(a.poly, c); }
  for (const r of osm.roads) { if (r.tunnel) continue; g.strokeStyle = /primary|trunk/.test(r.hw) ? '#f6c66b' : /footway|path|cycleway|steps/.test(r.hw) ? '#d9b7b0' : '#ffffff'; g.lineWidth = Math.max(1, r.width * S); g.beginPath(); r.pts.forEach((p, i) => { const [a, b] = P(p[0], p[1]); i ? g.lineTo(a, b) : g.moveTo(a, b); }); g.stroke(); }
  for (const b of osm.buildings) if (b.layer >= 0) fillPoly(b.poly, '#c4bdb2');
  const mini = document.createElement('canvas'); mini.id = 'minimap'; mini.width = 200; mini.height = 200; container.appendChild(mini);
  const mg = mini.getContext('2d');
  const full = document.createElement('div'); full.id = 'map-full'; full.className = 'hidden'; container.appendChild(full);
  const fc = document.createElement('canvas'); full.appendChild(fc);
  const list = document.createElement('div'); list.className = 'map-list'; full.appendChild(list);
  for (const s of spawns) { const b = document.createElement('button'); b.textContent = `${s.name}`; b.onclick = () => { player.teleport(s.x, s.y, s.z, s.yaw ?? 0); toggle(); }; list.appendChild(b); }
  let open = false;
  function toggle() { open = !open; full.classList.toggle('hidden', !open); if (open) drawFull(); }
  function drawFull() {
    fc.width = full.clientWidth - 240; fc.height = full.clientHeight; const f = fc.getContext('2d');
    const sc = Math.min(fc.width / W, fc.height / H); f.drawImage(base, 0, 0, W * sc, H * sc);
    const [px, pz] = P(player.x, player.z); f.fillStyle = '#e33'; f.beginPath(); f.arc(px * sc, pz * sc, 6, 0, 7); f.fill();
    fc.onclick = e => { const r = fc.getBoundingClientRect(); const x = (e.clientX - r.left) / sc / S + x0, z = (e.clientY - r.top) / sc / S + z0; player.teleport(x, 0, z, player.yaw); toggle(); };
  }
  function update() {
    const [px, pz] = P(player.x, player.z);
    mg.save(); mg.clearRect(0, 0, 200, 200); mg.beginPath(); mg.arc(100, 100, 98, 0, 7); mg.clip();
    mg.translate(100, 100); mg.rotate(player.yaw); mg.scale(1.6, 1.6); mg.drawImage(base, -px, -pz); mg.restore();
    mg.fillStyle = '#e33'; mg.beginPath(); mg.moveTo(100, 92); mg.lineTo(106, 108); mg.lineTo(100, 104); mg.lineTo(94, 108); mg.closePath(); mg.fill();
  }
  return { update, toggle, isOpen: () => open };
}
