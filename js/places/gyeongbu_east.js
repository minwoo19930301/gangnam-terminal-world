// OSM 414891734 / authoritative pub pin (372, 8). Round 10 keeps the pin,
// but separates the photographed brick hall from the adjacent parking structures.
export const meta = {
  id: 'gyeongbu_east', name: '경부선 동측 주차빌딩 · 데블스도어',
  claims: [414891734], claimRoads: [], claimAreas: [],
  sources: ['data/osm.json', 'refs/roadview/manifest.json',
    'refs/roadview/gbeast_01_parking_deck.jpg', 'refs/roadview/gbeast_02_bus_yard_road.jpg',
    'refs/roadview/gbeast_03_bus_yard_hedge.jpg', 'refs/interior/famille_back/notes.json',
    'refs/interior/streets_islands/notes.json', '.codex-jobs/evidence/audit_gyeongbu_east.json',
    'refs/interior/audit_gyeongbu_east/03_reception_snfl_131716.jpg',
    'refs/interior/audit_gyeongbu_east/06_dd_drtitan_01.jpg', 'data/research/gyeongbu_east.json'],
};

export function build(K) {
  const PI = Math.PI, L = Math.hypot(93.92, 46.63);
  const U = [93.92 / L, -46.63 / L], V = [-U[1], U[0]], ROT = Math.atan2(V[0], V[1]);
  const W = (u, v) => [333.85 + U[0] * u + V[0] * v, 16.3 + U[1] * u + V[1] * v];
  const rect = (u0, v0, u1, v1) => [W(u0, v0), W(u1, v0), W(u1, v1), W(u0, v1)];
  const box = (u, v, y, w, d, h, mat, o = {}) => { const [x, z] = W(u, v); K.box({ x, z, y, w, d, h, rotY: ROT, mat, ...o }); };
  const slab = (u0, v0, u1, v1, y, o = {}) => K.slab(rect(u0, v0, u1, v1), y, { mat: 'concrete', thick: .26, ...o });
  const wall = (u0, v0, u1, v1, y0, y1, o = {}) => K.wall(...W(u0, v0), ...W(u1, v1), y0, y1, o);
  const sign = (text, u, v, y, w, h, face = 0, o = {}) => { const [x, z] = W(u, v); K.sign(text, { x, z, y, w, h, rotY: ROT + face, bg: '#25303a', fg: '#f3efdd', pxPerM: 100, ...o }); };
  const cylinder = (u, v, y, r, h, mat, o = {}) => { const [x, z] = W(u, v); K.cyl({ x, z, y, r, h, mat, seg: 12, ...o }); };
  const ramp = (u0, v0, u1, v1, ya, yb, w, stairs = false) => K[stairs ? 'stairs' : 'ramp'](...W(u0, v0), ...W(u1, v1), { ya, yb, w, mat: 'concrete', railMat: 0x65737a });
  const zone = (name, floor, sub, u0, v0, u1, v1, y0, y1, priority = 3) => K.zone({ name, floor, sub, poly: rect(u0, v0, u1, v1), y0, y1, priority });
  const spawn = (name, u, v, y, du = 0, dv = -1) => { const [x, z] = W(u, v); K.spawn({ name, x, y, z, yaw: Math.atan2(-du * U[0] - dv * V[0], -du * U[1] - dv * V[1]) }); };
  const floorText = (text, u, v, y, w, h, angle = 0, fg = '#ede8d9') => { const [x, z] = W(u, v); K.floorText(text, { x, z, y, w, h, rotY: ROT + angle, fg }); };
  const white = 0xdcded7, steel = 0x30383c, orange = 0xcd763b, copper = 0xa9693d;
  const brick = { tex: 'ge-brick', color: 0xffffff };
  const footprint = K.osmBuilding(414891734)[0].poly;

  // Diagonal members are real six-faced prisms, merged by the kit, without broad
  // collision boxes that would obstruct the arcade below the steel trusses.
  function beam(a, b, width, mat, depth = width) {
    const P = p => { const [x, z] = W(p[0], p[2]); return new K.THREE.Vector3(x, p[1], z); };
    const A = P(a), B = P(b), D = B.clone().sub(A).normalize();
    const ref = Math.abs(D.y) > .95 ? new K.THREE.Vector3(1, 0, 0) : new K.THREE.Vector3(0, 1, 0);
    const X = new K.THREE.Vector3().crossVectors(D, ref).normalize(), Y = new K.THREE.Vector3().crossVectors(D, X).normalize();
    const corners = p => [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([s, t]) => p.clone().addScaledVector(X, s * width / 2).addScaledVector(Y, t * depth / 2).toArray());
    const aa = corners(A), bb = corners(B);
    for (let i = 0; i < 4; i++) { const j = (i + 1) % 4; const n = [Y.clone().negate(), X, Y, X.clone().negate()][i]; K.quad(mat, [aa[i], bb[i], bb[j], aa[j]], n.toArray()); }
    K.quad(mat, [aa[3], aa[2], aa[1], aa[0]], D.clone().negate().toArray()); K.quad(mat, bb, D.toArray());
  }
  function railing(u0, v0, u1, v1, y, h = 1.05, mat = 0x89969c) {
    wall(u0, v0, u1, v1, y, y + h, { mat, thick: .045, solid: true, openings: [{ at: Math.hypot(u1 - u0, v1 - v0) / 2, w: 1000, y0: y, y1: y + h - .06 }] });
    const n = Math.ceil(Math.hypot(u1 - u0, v1 - v0) / 2.4);
    for (let i = 0; i <= n; i++) { const t = i / n; cylinder(u0 + (u1 - u0) * t, v0 + (v1 - v0) * t, y, .035, h, mat, { solid: false, seg: 6 }); }
    for (const dy of [.28, .56, .81]) beam([u0, y + dy, v0], [u1, y + dy, v1], .035, mat);
  }
  function detail(name, floor, y0, y1, poly, fn) {
    K.detail({ name, floor, y0, y1, poly }, dk => { const saved = K; K = dk; try { fn(); } finally { K = saved; } });
  }
  K.texture('ge-brick', 256, 256, (g, w, h) => {
    const r = K.rand(818); g.fillStyle = '#b4a28a'; g.fillRect(0, 0, w, h);
    const colors = ['#96634a', '#9c644b', '#b17e59', '#775845', '#ae8063', '#bd9675'];
    for (let row = 0; row < 16; row++) for (let col = -1; col < 5; col++) {
      const x = col * 64 + (row % 2) * 32, y = row * 16;
      g.fillStyle = colors[Math.floor(r() * colors.length)]; g.fillRect(x + 1, y + 1, 62, 14);
      g.fillStyle = 'rgba(238,218,182,.18)'; g.fillRect(x + 3, y + 2, 54, 2);
      for (let j = 0; j < 5; j++) { g.fillStyle = 'rgba(55,39,31,.16)'; g.fillRect(x + r() * 60, y + r() * 14, 4, 1); }
    }
  }, [1.5, 1.2]);
  let doorCanvas;
  K.texture('ge-rusted-steel', 512, 1024, (g, w, h) => {
    doorCanvas = g.canvas;
    const r = K.rand(414891734); g.fillStyle = '#405c72'; g.fillRect(0, 0, w, h);
    // Soft overlapping stains and fine vertical runs, rather than pixel blocks.
    for (let i = 0; i < 380; i++) {
      const x = r() * w, y = r() * h, radius = 12 + r() * 60;
      const stain = g.createRadialGradient(x, y, 1, x, y, radius);
      stain.addColorStop(0, ['#b87843bb', '#95552da0', '#cc9766a0', '#304e6870'][i % 4]);
      stain.addColorStop(1, '#b8784300'); g.fillStyle = stain;
      g.save(); g.translate(x, y); g.scale(.6, 1.8); g.translate(-x, -y); g.fillRect(x - radius, y - radius, radius * 2, radius * 2); g.restore();
    }
    for (let i = 0; i < 3000; i++) { g.fillStyle = i % 2 ? '#d5ad7740' : '#273d4930'; g.fillRect(r() * w, r() * h, .7, 1 + r() * 15); }
    g.strokeStyle = '#263b49'; g.lineWidth = 3; g.strokeRect(2, 2, w - 4, h - 4);
    for (let y = 10; y < h; y += 60) { g.fillStyle = '#c3af89'; g.fillRect(6, y, 3, 3); g.fillRect(w - 9, y, 3, 3); }
  }, [1.2, 3]);
  K.texture('ge-pavers', 256, 256, (g, w, h) => {
    const r = K.rand(902); g.fillStyle = '#777570'; g.fillRect(0, 0, w, h);
    for (let row = 0; row < 4; row++) for (let col = -1; col < 4; col++) {
      g.fillStyle = ['#797976', '#85837e', '#706f6c', '#8b8880'][(row + col + 4) % 4];
      g.fillRect(col * 85 + (row % 2) * 42 + 1, row * 64 + 1, 83, 62);
    }
    for (let i = 0; i < 2200; i++) { g.fillStyle = i % 2 ? '#ffffff12' : '#00000014'; g.fillRect(r() * w, r() * h, 1, 1); }
  }, [1.8, 2.4]);
  K.texture('ge-ribbed-cladding', 128, 128, (g, w, h) => {
    g.fillStyle = '#aebfca'; g.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 16) { g.fillStyle = '#879daa'; g.fillRect(0, y, w, 2); g.fillStyle = '#d3dce0'; g.fillRect(0, y + 2, w, 1); }
    g.fillStyle = '#82939d'; g.fillRect(0, 0, 2, h);
  }, [2.5, 2.2]);
  K.texture('ge-privet', 128, 128, (g, w, h) => {
    const r = K.rand(3434); g.fillStyle = '#335338'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 1500; i++) { g.fillStyle = ['#537345', '#65834a', '#375d35', '#789554'][i % 4]; g.beginPath(); g.ellipse(r() * w, r() * h, 2, 4, r() * PI, 0, PI * 2); g.fill(); }
  }, [.9, .9]);

  // Retain the claimed OSM ground footprint; upper parking stops short of the hall.
  K.slab(footprint, 0, { mat: 'concrete', thick: .22, holes: [rect(18, 1.5, 63, 15.9)] });
  // No deck, roof, fascia or truss crosses u18..63: the brick hall and its
  // parking apron are open to the sky, with daylight gaps at both ends.
  const stair1 = rect(2.8, .8, 14.2, 3.6), stair2 = rect(2.8, 4, 14.2, 6.8);
  const ramp1 = rect(68.5, .65, 99.5, 5.75), ramp2 = rect(68.5, 6.35, 99.5, 11.45);
  const deckParts = [rect(0, 0, 16.8, 17.18), rect(64.4, 0, 104.86, 17.18)];
  for (let i = 0; i < deckParts.length; i++) {
    K.slab(deckParts[i], 3.8, { mat: 'concrete', under: 0x5b5d5c, thick: .3, holes: i === 0 ? [stair1] : i === 1 ? [ramp1] : [] });
    K.slab(deckParts[i], 7.6, { mat: 'concrete', under: 0x5b5d5c, thick: .3, holes: i === 0 ? [stair2] : i === 1 ? [ramp2] : [] });
    K.slab(deckParts[i], 11.8, { mat: { tex: 'roofgravel', color: 0xe5e3dc }, under: 0x777a78, thick: .26, walk: false });
  }
  // An internal mezzanine, with a proper lounge depth, replaces the thin
  // parking-linked gallery. Its stair opening is inside the hall envelope.
  slab(18.3, 1.8, 39.8, 9.2, 3.8, { mat: { tex: 'wood', gloss: .3 } });
  slab(18.3, 9.2, 31.2, 12.2, 3.8, { mat: 'wood', holes: [rect(19.5, 9.45, 29.65, 11.35)] });
  K.stairs(...W(19.9, 10.4), ...W(29.5, 10.4), { ya: 0, yb: 3.8, w: 1.65, mat: { tex: 'wood', color: 0x514331 }, rails: true });
  slab(29.45, 9.45, 31.2, 11.35, 3.8, { mat: 'wood' });
  railing(18.4, 12.2, 31.2, 12.2, 3.8, 1.1, steel);
  railing(31.2, 9.2, 31.2, 12.2, 3.8, 1.1, steel);
  railing(31.2, 9.2, 39.8, 9.2, 3.8, 1.1, steel);
  railing(39.8, 1.8, 39.8, 9.2, 3.8, 1.1, steel);
  railing(19.5, 9.45, 29.5, 9.45, 3.8, 1.1, steel);
  railing(19.5, 11.35, 29.5, 11.35, 3.8, 1.1, steel);
  wall(27, 1.8, 27, 5.25, 3.8, 6.5, { mat: 'glass', thick: .05, openings: [{ at: 1.6, w: 1.45, y0: 3.8, y1: 6.2 }] });
  wall(18.3, 5.25, 27, 5.25, 3.8, 6.5, { mat: 'glass', thick: .05 });
  // A separate accessible lift is a modeling accommodation, not a surveyed fixture.
  const [lx, lz] = W(38.3, 7.35);
  K.elevator({ name: '데블스도어 라운지 승강기', x: lx, z: lz, rotY: ROT - PI / 2, w: 1.8, d: 1.8,
    floors: [{ label: '1F', y: 0, name: '홀' }, { label: '2F', y: 3.8, name: '라운지 · 프라이빗룸' }] });
  ramp(3, 2.2, 14, 2.2, 0, 3.8, 2.4, true);
  ramp(14, 5.4, 3, 5.4, 3.8, 7.6, 2.4, true);
  slab(13.9, .8, 16, 6.8, 3.8);
  slab(.4, 4, 3.1, 6.8, 7.6);
  railing(3, .8, 14, .8, 3.8); railing(3, 3.6, 13.8, 3.6, 3.8);
  railing(3, 4, 13.8, 4, 7.6); railing(3, 6.8, 14, 6.8, 7.6);
  ramp(69, 3.2, 99, 3.2, 0, 3.8, 4.8);
  ramp(99, 8.9, 69, 8.9, 3.8, 7.6, 4.8);
  slab(98.9, .65, 99.7, 5.75, 3.8); // overlap the ramp and the deck beyond its void
  slab(68.3, 6.35, 69.1, 11.45, 7.6);
  for (const [y, v] of [[3.8, .65], [3.8, 5.75], [7.6, 6.35], [7.6, 11.45]]) railing(69, v, 99, v, y);
  const [ex, ez] = W(15.8, 14.5);
  K.elevator({ name: '동측 주차빌딩 승강기', x: ex, z: ez, rotY: ROT, w: 2.15, d: 2.15, mat: 'glass',
    floors: [{ label: '1F', y: 0, name: '주차장' }, { label: '2F', y: 3.8, name: '주차장' }, { label: '3F', y: 7.6, name: '주차장' }] });
  for (const u of [14.55, 17.05]) for (const v of [13.25, 15.75]) box(u, v, 0, .13, .13, 10.9, steel, { solid: false });
  for (const y of [2.8, 6.6, 10.4]) { box(15.8, 13.25, y, 2.6, .13, .12, steel, { solid: false }); sign('주차장 ↑', 15.8, 15.85, y, 1.7, .55, 0, { bg: '#22577b' }); }
  // Transparent stair enclosure alongside the working elevator. Zig-zag
  // flights are visible through the glass, rather than a solid thin shaft.
  for (const y of [0, 3.8, 7.6]) slab(10.1, 13.1, 14.55, 18.8, y, { mat: 'concrete', holes: y ? [rect(10.5, 13.6, 13.9, 17.6)] : [] });
  for (const y of [0, 3.8]) {
    K.stairs(...W(10.9, 17.5), ...W(10.9, 13.8), { ya: y, yb: y + 1.9, w: 1.15, mat: 'concrete' });
    slab(10.3, 13.05, 13.9, 13.85, y + 1.9);
    K.stairs(...W(13.2, 13.8), ...W(13.2, 17.5), { ya: y + 1.9, yb: y + 3.8, w: 1.15, mat: 'concrete' });
    slab(10.3, 17.45, 14.55, 18.8, y + 3.8);
  }
  for (const u of [10.05, 14.55]) wall(u, 13, u, 18.8, 0, 10.8, { mat: 'glass', thick: .04, solid: false });
  wall(10.05, 18.8, 14.55, 18.8, 0, 10.8, { mat: 'glass', thick: .04, openings: [{ at: 2.2, w: 2.1, y0: 0, y1: 2.8 }] });
  for (const u of [10.05, 12.3, 14.55]) for (const v of [13, 18.8]) box(u, v, 0, .11, .11, 10.85, white, { solid: false });
  for (const y of [1.2, 3.8, 7.6, 10.8]) {
    box(12.3, 18.8, y, 4.5, .1, .12, white, { solid: false });
    box(12.3, 15.7, y + .16, 1.2, .12, .05, { tex: 'emit', color: 0xe7efea }, { solid: false });
  }
  for (const u of [10.5, 14.1]) box(u, 18.9, 0, .8, .18, 1.2, white);
  sign('P ↑', 12.3, 18.94, 2.6, 1.3, .85, 0, { bg: '#245a91', fg: '#ffffff' });

  // Roadview: white V-braces, orange ground-column bases and open rails; the
  // enclosed blue glazing/ribbed-metal band sits only above the second deck.
  for (const v of [.25, 16.85]) {
    for (let u = 1; u < 105; u += 8.5) {
      if (u > 16.8 && u < 64.4) continue;
      box(u, v, 0, .36, .4, 11.55, white);
      box(u, v, 0, .39, .43, 2.65, orange, { solid: false });
      box(u, v, 3.8, .39, .43, 2.65, 0x32617c, { solid: false });
      if (u < 96) for (const y of [0, 3.8]) {
        if (u + 8.5 > 16.8 && u < 64.4) continue;
        beam([u, y + .1, v], [u + 4.25, y + 3.55, v], .24, white, .32);
        beam([u + 8.5, y + .1, v], [u + 4.25, y + 3.55, v], .24, white, .32);
      }
    }
    for (const [a, b] of [[.15, 16.8], [64.4, 104.6]]) {
      for (const y of [3.5, 7.3]) box((a + b) / 2, v, y, b - a, .45, .3, white, { solid: false });
      railing(a, v, b, v, 3.8);
      wall(a, v, b, v, 7.6, 9.8, { mat: 'glass', thick: .04 });
      wall(a, v, b, v, 9.8, 11.55, { mat: 'ge-ribbed-cladding', thick: .12 });
      box((a + b) / 2, v, 11.55, b - a, .55, .25, white, { solid: false });
      for (let u = a + .8; u < b; u += 2.83) box(u, v, 7.6, .07, .11, 2.2, white, { solid: false });
      for (const y of [7.7, 8.05, 9.7]) box((a + b) / 2, v, y, b - a, .12, .06, white, { solid: false });
    }
  }
  for (const u of [.18, 16.8, 64.4, 104.65]) {
    railing(u, .3, u, 16.8, 3.8);
    wall(u, .3, u, 16.8, 7.6, 9.8, { mat: 'glass', thick: .04 });
    wall(u, .3, u, 16.8, 9.8, 11.55, { mat: 'ge-ribbed-cladding', thick: .15 });
    box(u, 8.55, 11.55, .5, 17.2, .25, white, { solid: false });
  }
  // Clear access in the south arcade and west/east ends; no continuous ground-level fence.
  sign('데블스도어 센트럴시티', 28, 13.5, 7.65, 5.2, .42, 0, { bg: null, fg: '#e1c496' });
  sign('주차장 입구 →', 100.8, 16.99, 2.8, 4.3, .8, 0, { bg: '#25475b' });
  sign(['출구 ←', '잠원 · 논현 · 신사'], 102.8, 12.5, 2.45, 2.8, 1.1, -PI / 2, { bg: '#222a2c', fg: '#f2ca45' });
  for (const y of [0, 3.8, 7.6]) {
    for (const [a, b] of [[0, 17.1], [64.4, 104.8]]) zone('경부선 동측 주차빌딩', y === 0 ? '1F' : y === 3.8 ? '2F' : '3F', '주차장 · 계단 · 승강기', a, 0, b, 18.8, y, y + 3.79, 1);
    sign(y === 0 ? '1층 주차장' : y === 3.8 ? '2층 주차장' : '3층 주차장', 66, 13.2, y + 2.3, 2.3, .5, 0);
  }

  // Freestanding brick hall at the authoritative pub pin. All windows are cut out of the wall, including their
  // curved heads, so the hall is visible through the arcade and the glazing.
  slab(18, 1.5, 63, 15.9, 0, { mat: { tex: 'wood', color: 0x5a4030, gloss: .38 }, holes: [rect(31.9, 10.2, 40.2, 15.7)] });
  wall(18, 1.5, 63, 1.5, 0, 8.65, { mat: brick, thick: .25, openings: [{ at: 35, w: 3, y0: 0, y1: 3.1 }] });
  const endOps = [{ at: 7, w: 5, y0: 0, y1: 3.4 }];
  for (const u of [18, 63]) wall(u, 1.5, u, 15.9, 0, 8.65, { mat: brick, thick: .25, openings: u === 18 ? endOps : [{ at: 7, w: 2.5, y0: 0, y1: 2.8 }] });
  const windowUs = [21.4, 25.4, 29.4, 41.2, 45.2, 49.2, 57, 61];
  const openings = windowUs.map(u => ({ at: u - 18, w: 2.15, y0: .65, y1: 4.725 }));
  openings.push({ at: 36 - 18, w: 4.8, y0: 0, y1: 4.8 }, { at: 35, w: 3, y0: 0, y1: 3.1 });
  wall(18, 15.9, 63, 15.9, 0, 6.35, { mat: brick, thick: .28, openings });
  function archWindow(u, v, sill, width, spring, glazing = true) {
    const r = width / 2, top = spring + r;
    if (glazing) box(u, v, sill, width, .035, top - sill, { tex: 'glass', color: 0x9bb6b9 }, { solid: false });
    // Bricks fill just the upper corners of each rectangular wall opening.
    for (let i = 0; i < 12; i++) {
      const a = PI * i / 12, b = PI * (i + 1) / 12;
      const ua = u + Math.cos(a) * r, ub = u + Math.cos(b) * r, ya = spring + Math.sin(a) * r, yb = spring + Math.sin(b) * r;
      const A = W(ua, v), B = W(ub, v);
      K.quad(brick, [[A[0], ya, A[1]], [B[0], yb, B[1]], [B[0], top, B[1]], [A[0], top, A[1]]], [V[0], 0, V[1]]);
      K.quad(brick, [[B[0], yb, B[1]], [A[0], ya, A[1]], [A[0], top, A[1]], [B[0], top, B[1]]], [-V[0], 0, -V[1]]);
      beam([ua, ya, v + .04], [ub, yb, v + .04], .085, steel);
    }
    for (const x of [u - r, u, u + r]) box(x, v, sill, .075, .09, spring - sill, steel, { solid: false });
    for (const y of [sill, 2.8, spring]) if (y >= sill && y <= spring) box(u, v, y, width, .09, .07, steel, { solid: false });
    for (const a of [PI / 4, PI / 2, PI * 3 / 4]) beam([u, spring, v], [u + r * Math.cos(a), spring + r * Math.sin(a), v], .055, steel);
  }
  for (const u of windowUs) {
    archWindow(u, 15.91, .65, 2.15, 3.65);
    box(u, 15.4, 3.45, 1.85, .06, .15, { tex: 'emit', color: 0xffcf80 }, { solid: false });
  }
  sign('출입구', 53, 16.08, 3.28, 1.3, .3, 0, { bg: '#303a37', fg: '#e4d7b4' });
  // Recessed steel portal: the real rounded slots belong in the door leaves,
  // not in transom windows. Leaves open on approach and leave a 2.7 m route.
  box(36, 15.86, 3.3, 4.8, .2, 1.5, 'ge-rusted-steel', { solid: false });
  for (const u of [33.9, 38.1]) box(u, 15.86, 0, .6, .22, 3.3, 'ge-rusted-steel');
  const doorMap = doorCanvas ? new K.THREE.CanvasTexture(doorCanvas) : null;
  if (doorMap) doorMap.colorSpace = K.THREE.SRGBColorSpace;
  const doorMat = new K.THREE.MeshStandardMaterial({ color: doorMap ? 0xffffff : 0x61717a, map: doorMap, roughness: .72, metalness: .38, side: K.THREE.DoubleSide });
  const slotMat = new K.THREE.MeshStandardMaterial({ color: 0x172226, transparent: true, opacity: .55, roughness: .12, side: K.THREE.DoubleSide });
  const handleMat = new K.THREE.MeshStandardMaterial({ color: 0x9e704c, roughness: .48, metalness: .65 });
  function roundedPath(Path, x, y, w, h, r) {
    const p = new Path(); p.moveTo(x + r, y); p.lineTo(x + w - r, y); p.quadraticCurveTo(x + w, y, x + w, y + r); p.lineTo(x + w, y + h - r); p.quadraticCurveTo(x + w, y + h, x + w - r, y + h); p.lineTo(x + r, y + h); p.quadraticCurveTo(x, y + h, x, y + h - r); p.lineTo(x, y + r); p.quadraticCurveTo(x, y, x + r, y); return p;
  }
  for (const side of [-1, 1]) {
    const group = new K.THREE.Group(), [x, z] = W(36 + side * 1.35, 15.84), leafX = side < 0 ? 0 : -1.35;
    group.position.set(x, 0, z); group.rotation.y = ROT;
    const shape = roundedPath(K.THREE.Shape, leafX, .04, 1.35, 3.24, .09);
    shape.holes.push(roundedPath(K.THREE.Path, leafX + .28, .28, .78, 2.72, .18));
    const leaf = new K.THREE.Mesh(new K.THREE.ExtrudeGeometry(shape, { depth: .08, bevelEnabled: false, curveSegments: 8 }), doorMat);
    const uv = leaf.geometry.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, (uv.getX(i) - leafX) / 1.35, uv.getY(i) / 3.3);
    group.add(leaf);
    const glass = new K.THREE.Mesh(new K.THREE.ShapeGeometry(roundedPath(K.THREE.Shape, leafX + .28, .28, .78, 2.72, .18)), slotMat); glass.position.z = .04; group.add(glass);
    const handle = new K.THREE.Mesh(new K.THREE.BoxGeometry(.045, 1.75, .08), handleMat); handle.position.set(side < 0 ? 1.2 : -1.2, 1.65, .15); group.add(handle);
    K.addMesh(group);
    K.onFrame((dt, t, player) => { const du = player.x - x, dv = player.z - z; const target = ROT + (du * du + dv * dv < 7.3 ? side * 1.35 : 0); group.rotation.y += (target - group.rotation.y) * Math.min(1, dt * 6); });
  }
  // Shallow offsets make the brand read as raised metal letters.
  sign("DEVIL'S DOOR", 36.02, 15.99, 4.02, 2.3, .44, 0, { bg: null, fg: '#292722', bold: true });
  sign("DEVIL'S DOOR", 36, 16.025, 4.04, 2.3, .44, 0, { bg: null, fg: '#bba180', bold: true });
  sign('BREWERY', 36, 16.03, 3.73, 1.25, .15, 0, { bg: null, fg: '#b39c7c' });
  sign(['영업시간 안내', '문 앞 안내문을 확인해 주세요'], 38.08, 16.0, 1.65, .42, .35, 0, { bg: '#e9e3d7', fg: '#382c26' });
  box(36, 16.05, 4.82, 5.4, .8, .3, 0x8c8980, { solid: false });
  cylinder(33.05, 16.1, 0, .29, 6.3, { tex: 'metal', color: 0x778184 });
  box(32.75, 16.02, .5, .045, .06, 3.7, { tex: 'emit', color: 0xa62b26 }, { solid: false });
  box(39.6, 16.02, 4.83, 2, .65, 1, 0x999990, { solid: false });
  box(39.6, 16.37, 4.98, 1.55, .05, .62, 0x2f3534, { solid: false });
  for (let y = 5.03; y < 5.55; y += .08) box(39.6, 16.42, y, 1.5, .06, .025, 0x89918a, { solid: false });
  box(38.35, 16.08, 3.15, .19, .38, .17, 0x636965, { solid: false });
  cylinder(38.35, 16.25, 3.12, .08, .08, 0x212826, { solid: false });
  sign(['데블스도어', '수제맥주', '식사 메뉴'], 39.15, 16.1, 1.9, .45, .7, 0, { bg: '#573b30', fg: '#d4ba8e', box: .04 });

  // Brick arcade, dark standing-seam eave, framed posters and warm wall lamps.
  slab(18, 15.9, 63, 18.9, 0, { mat: { tex: 'ge-pavers', gloss: .42 }, thick: .12 });
  box(40.5, 17.05, 5.85, 45, 3.4, .18, 0x353b38, { solid: false });
  for (const u of [19.1, 23.4, 27.4, 31.4, 39.2, 43.2, 47.2, 55, 59, 62.6]) {
    box(u, 16.13, 0, .66, .72, 5.85, brick);
    beam([u, 3.3, 16.55], [u, 3.3, 16.88], .045, steel);
    cylinder(u, 16.88, 3.16, .2, .07, 0x343b35, { solid: false });
    cylinder(u, 16.88, 3.14, .16, .025, { tex: 'emit', color: 0xffce7e }, { solid: false });
    if (u !== 31.4) sign(['DEVIL’S DOOR', '수제맥주 · 식사'], u, 16.55, 2.05, .44, .65, 0, { bg: '#e6d5b9', fg: '#54392a', box: .045 });
  }
  for (const [a, b] of [[19, 31], [40, 50], [55, 63]]) {
    box((a + b) / 2, 19.25, 0, b - a, .65, .62, { tex: 'darkstone', color: 0xb2a18a, gloss: .35 });
    box((a + b) / 2, 19.25, .62, b - a - .15, .6, .75, 'ge-privet');
    for (let u = a; u < b; u += 2.7) {
      box(u, 22.25, .025, .09, 4.8, .01, white, { solid: false });
      box(u + 1.25, 20.4, .025, 1.6, .14, .1, 0x333735, { solid: false });
      for (const du of [-.5, .5]) box(u + 1.25 + du, 20.4, .13, .23, .15, .012, 0xd0ad43, { solid: false });
    }
  }
  // White stalls sit on open ground parking, not beneath another parking floor.
  K.hpoly('asphalt', rect(18, 19.7, 63, 24.8), .013);
  // OSM footway 1067157385 meets this module at (339.44,32.31).
  // The narrow paved arcade joins it at ground level; no invented remote doorway.
  K.slab([[339.44, 32.31], [343, 33.25], W(18, 18.8), W(18, 16.9), W(0, 16.9)], 0, { mat: 'ge-pavers', thick: .08 });
  sign(['← 파미에스테이션 · 스타벅스', '고속터미널역 3번 출구 방면'], 3.5, 19.4, 1.8, 3.6, .7, 0, { bg: '#253b35', fg: '#eeeadd' });
  for (const u of [8, 16, 35.8]) floorText(u === 35.8 ? '데블스도어 ↑' : '← 파미에스테이션', u, 18.15, .025, 2.3, .5, 0, '#ece9d9');
  for (const v of [20.3, 21.1, 21.9, 22.7, 23.5, 24.3]) box(36, v, .028, 2.2, .32, .01, 0xe9e7dc, { solid: false });
  // Small existing apron landscaping, without rebuilding any surrounding road.
  K.hpoly('grass', rect(19, 25, 30, 27.5), .012);
  for (const u of [20.5, 28]) { const [x, z] = W(u, 26.2); K.tree(x, z, { h: 8, kind: 'pine' }); }

  // Retained photographed glass-and-wood side door; no external 2F stair.
  slab(14, 6, 18, 11.4, 0, { mat: { tex: 'wood', color: 0x795c40 } });
  wall(17.98, 6, 17.98, 11, 0, 3.4, { mat: 'glass', thick: .04, openings: [{ at: 2.5, w: 1.2, y0: 0, y1: 3.1 }] });
  for (let v = 6; v <= 11; v += .625) if (Math.abs(v - 8.5) > .6) box(17.9, v, 0, .1, .055, 3.35, steel, { solid: false });
  for (const y of [.12, .8, 1.5, 2.2, 2.9, 3.35]) for (const [a, b] of [[6, 7.9], [9.1, 11]]) box(17.9, (a + b) / 2, y, .1, b - a, .055, steel, { solid: false });
  // Wooden leaf folded into the vestibule so the route remains genuinely open.
  box(18.45, 7.92, 0, 1.05, .1, 1.05, { tex: 'wood', color: 0xa56e42 });
  box(18.45, 7.92, 1.05, 1.05, .06, 2.02, 'glass', { solid: false });
  for (const u of [17.96, 18.94]) box(u, 7.92, 1.05, .065, .12, 2.05, { tex: 'wood', color: 0xa56e42 }, { solid: false });
  for (const y of [1.05, 1.72, 2.4, 3.1]) box(18.45, 7.92, y, 1.05, .12, .065, { tex: 'wood', color: 0xa56e42 }, { solid: false });
  box(17.8, 8.5, 3.4, .35, 5.5, .35, steel, { solid: false });
  sign('DEVIL’S DOOR', 17.65, 11.45, 2.6, .65, .5, -PI / 2, { bg: null, fg: '#4768f5' });
  sign('데블스도어', 19.2, 10.6, 2.3, .55, .55, -PI / 2, { bg: '#b32632', fg: '#f8d9bc' });
  sign('2층 라운지 →', 20, 11.7, 2.1, 1.6, .4, 0);
  box(19.2, 12.3, 0, .5, .7, .08, steel);
  sign(['DEVIL’S DOOR', '데블스도어 센트럴점', '2층 프라이빗 대관', '예약 02-6282-4466'], 19.2, 12.3, .95, .72, 1.75, 0, { bg: '#202c2e', fg: '#d8cba9', box: .04 });
  sign(['DEVIL’S DOOR', '수제맥주 · 버거 · 피자'], 17.7, 13.95, 2.15, 1.6, 1.65, -PI / 2, { bg: '#293b45', fg: '#d9b887', box: .06 });

  // A low green metal eave and gridded clerestory lead to the taller glazed
  // barrel at the east end; the parking fascia no longer conceals this roof.
  const roofPoint = (u, y, v) => { const [x, z] = W(u, v); return [x, y, z]; };
  for (const [v0, v1] of [[.95, 4], [16.9, 13.4]]) {
    K.quad({ tex: 'metal', color: 0x526b61 }, [roofPoint(18, 6.25, v0), roofPoint(49.5, 6.25, v0), roofPoint(49.5, 7.35, v1), roofPoint(18, 7.35, v1)], [0, 1, 0]);
    for (let u = 18; u <= 49.5; u += .7) beam([u, 6.28, v0], [u, 7.38, v1], .035, 0x7a8a7a);
    wall(18, v1, 49.5, v1, 7.35, 8.65, { mat: 'glass', thick: .04, solid: false });
    for (let u = 18; u <= 49.5; u += .5) box(u, v1, 7.35, .045, .08, 1.3, steel, { solid: false });
    for (const y of [7.35, 7.98, 8.65]) box(33.75, v1, y, 31.5, .1, .08, steel, { solid: false });
    beam([18, 6.24, v0], [49.5, 6.24, v0], .26, 0xbebdae);
    K.quad({ tex: 'glass', color: 0x96bac2 }, [roofPoint(18, 8.65, v1), roofPoint(49.5, 8.65, v1), roofPoint(49.5, 10.35, 8.7), roofPoint(18, 10.35, 8.7)], [0, 1, 0]);
    for (let u = 18; u <= 49.5; u += 1.1) beam([u, 8.65, v1], [u, 10.35, 8.7], .055, 0x93a398);
    beam([18, 10.35, 8.7], [49.5, 10.35, 8.7], .14, 0x93a398);
  }
  const roofV = 8.7, roofR = 7.25, roofBase = 8.65, rise = 3.3;
  for (let j = 0; j < 18; j++) {
    const a = PI * j / 18, b = PI * (j + 1) / 18;
    const va = roofV + roofR * Math.cos(a), vb = roofV + roofR * Math.cos(b);
    const ya = roofBase + rise * Math.sin(a), yb = roofBase + rise * Math.sin(b);
    K.quad({ tex: 'glass', color: 0x8ebfc7 }, [roofPoint(49.5, ya, va), roofPoint(63, ya, va), roofPoint(63, yb, vb), roofPoint(49.5, yb, vb)], [0, 1, 0]);
    beam([49.5, ya, va], [63, ya, va], .055, 0x8bacae);
    for (let u = 49.5; u <= 63; u += 1.5) beam([u, ya, va], [u, yb, vb], .08, white);
    for (const u of [49.5, 63]) {
      K.quad('glass', [roofPoint(u, roofBase, va), roofPoint(u, roofBase, vb), roofPoint(u, yb, vb), roofPoint(u, ya, va)], [U[0], 0, U[1]]);
      beam([u, ya, va], [u, yb, vb], .22, 0xc7c8b8);
    }
  }
  for (const v of [1.45, 15.95]) {
    wall(49.5, v, 63, v, 6.35, 8.65, { mat: 'glass', thick: .04, solid: false });
    beam([49.5, 8.65, v], [63, 8.65, v], .3, 0xc7c8b8);
    for (const u of [49.5, 54, 58.5, 63]) {
      beam([u, 6.4, v], [u, 8.65, v], .16, steel);
      beam([u, 6.4, v], [Math.min(63, u + 2.3), 8.65, v], .12, white);
    }
  }
  for (let u = 20; u <= 62; u += 6) {
    cylinder(u, 4.7, 0, .22, 8.6, steel);
    beam([u, 7.5, 1.7], [u, 9.7, 8.7], .22, { tex: 'wood', color: 0xa98860 });
    beam([u, 9.7, 8.7], [u, 7.5, 15.7], .22, { tex: 'wood', color: 0xa98860 });
    beam([u, 6.8, 4.7], [u, 9.0, 9.8], .18, { tex: 'wood', color: 0x9d7752 });
    beam([u, 8.1, 4.7], [u, 8.1, 13.6], .16, { tex: 'wood', color: 0xa98860 });
  }
  zone('데블스도어 센트럴시티', '1F', '리셉션 · 브루어리 · 오픈주방 · 화장실', 18, 1.5, 63, 15.9, 0, 11.95, 4);
  zone('데블스도어 센트럴시티', '2F', '라운지 · 바 · 프라이빗룸', 18.3, 1.8, 39.8, 9.2, 3.8, 7.4, 6);
  zone('데블스도어 센트럴시티', '2F', '홀 내부 계단 · 라운지', 18.3, 9.2, 31.2, 12.2, 3.8, 7.4, 6);

  // Photo 03: reception is encountered immediately inside the steel entrance.
  // A left-hand opening leads into the dining hall; the right wall is gridded glass.
  wall(31.8, 10.1, 40.3, 10.1, 0, 3.35, { mat: brick, thick: .14, openings: [{ at: 1.4, w: 2.1, y0: 0, y1: 2.8 }] });
  wall(40.3, 10.1, 40.3, 15.65, 0, 3.35, { mat: 'glass', thick: .05 });
  wall(31.8, 10.1, 31.8, 15.65, 0, 3.35, { mat: brick, thick: .14, openings: [{ at: 3.1, w: 1.05, y0: 0, y1: 2.6 }] });
  slab(31.9, 10.2, 40.2, 15.7, 0, { mat: { tex: 'tile', color: 0x9c9e94, gloss: .3 }, thick: .04 });
  // Facilities exist in the evidence; their side-of-hall arrangement is inferred.
  for (const [a, b, label] of [[55, 57.5, '남자 화장실'], [57.5, 60, '여자 화장실'], [60, 62.7, '흡연실']]) {
    const glass = a === 60;
    wall(a, 10.7, b, 10.7, 0, 2.85, { mat: glass ? 'glass' : brick, thick: .12, openings: [{ at: (b - a) / 2, w: 1.1, y0: 0, y1: 2.4 }] });
    wall(a, 10.7, a, 13.2, 0, 2.85, { mat: glass ? 'glass' : brick, thick: .12 });
    wall(a, 13.2, b, 13.2, 0, 2.85, { mat: glass ? 'glass' : brick, thick: .12 });
    slab(a, 10.7, b, 13.2, 2.85, { mat: 'ceiling', walk: false, thick: .1 });
    sign(label, (a + b) / 2, 10.61, 2.57, 1.55, .29, PI, { bg: '#343b37', fg: '#f3ebdb' });
    box((a + b) / 2 + .6, 11.25, 0, .08, 1, 2.35, glass ? 'glass' : 'wood', { solid: false });
  }
  wall(62.7, 10.7, 62.7, 13.2, 0, 2.85, { mat: 'glass', thick: .05 });
  // Keep the existing north–south u53 through-route and v9.3 main aisle clear.


  // The visible roof is made of raw quads; register its covered footprint for
  // area loading as well. This is not an extra rendered flat ceiling.
  K.phys.addCeiling(rect(18, 1.5, 63, 15.9), 8.65);
  zone('데블스도어 센트럴시티', '1F', '측면 출입구', 17.1, 6, 18, 11.4, 0, 3.4, 4);
  zone('동측 주차 안내사무실', '1F', '정산 부스', 99.8, 20.4, 102.2, 22.6, 0, 3.4, 2);

  detail('데블스도어 홀 · 양조시설과 테이블', '1F', 0, 8.6, rect(18, 1.5, 63, 15.9), () => {
    // Rounded metal counter, tanks underneath, paper notices and warm pendants.
    box(37, 12.65, .72, 4.6, .8, .24, { tex: 'metal', color: 0x343c3d });
    for (const u of [34.8, 38.2, 39.2]) cylinder(u, 12.65, 0, .075, .96, steel, { solid: false });
    box(37, 12.65, .96, 4.8, .94, .16, { tex: 'metal', color: 0xb2beb9, gloss: .7 });
    beam([34.6, 1.02, 13.12], [39.4, 1.02, 13.12], .14, { tex: 'metal', color: 0xaab7b4, gloss: .7 });
    for (const u of [35.4, 36.4, 37.4]) cylinder(u, 12.65, .1, .3, .75, { tex: 'metal', color: 0xa6afaa }, { seg: 20, solid: false });
    const notices = ['메뉴 안내', '자리 안내', '음식 주문', '이용 안내', '주차 등록'];
    notices.forEach((t, i) => {
      const u = 34.95 + i * .66;
      box(u, 12.8, 1.12, .5, .09, .65, steel, { solid: false });
      sign(t, u, 12.86, 1.46, .44, .54, 0, { bg: '#e4dfcc', fg: '#493c32' });
    });
    box(39.75, 14.65, 0, .48, .42, .11, steel);
    box(39.75, 14.65, .11, .14, .14, 1.1, steel);
    sign(['대기 등록', '인원 선택'], 39.75, 14.7, 1.35, .48, .6, 0, { bg: '#f0eee2', fg: '#25322e', box: .08 });
    sign('리셉션 · 결제', 37, 13.14, .65, 2.1, .27, 0, { bg: null, fg: '#d9e2d8' });
    box(38.95, 12.7, 1.13, .48, .35, .16, steel, { solid: false });
    sign('결제', 38.95, 12.86, 1.42, .44, .32, 0, { bg: '#e8eee5', fg: '#313c37', box: .06 });
    for (let v = 10.15; v < 15.7; v += .68) box(40.25, v, 0, .08, .065, 3.35, steel, { solid: false });
    for (const y of [.8, 1.6, 2.4, 3.32]) box(40.25, 12.9, y, .08, 5.55, .065, steel, { solid: false });
    box(31.8, 13.2, 0, .08, 1.05, .8, { tex: 'wood', color: 0x754836 });
    box(31.8, 13.2, .8, .04, 1.05, 1.8, 'glass', { solid: false });
    for (const v of [12.67, 13.73]) box(31.8, v, .8, .1, .07, 1.8, 'wood', { solid: false });
    for (const y of [.8, 1.5, 2.6]) box(31.8, 13.2, y, .1, 1.05, .07, 'wood', { solid: false });
    sign('사무실', 31.91, 13.2, 1.65, .66, .22, PI / 2, { bg: '#663f2e', fg: '#e2cbb2' });
    for (const [u, v, h] of [[34.7, 12.5, 2.7], [35.5, 12.3, 2.9], [36.3, 12.7, 2.65], [37.1, 12.2, 2.85], [38, 12.5, 2.7], [38.8, 12.3, 2.9]]) {
      beam([u, 3.3, v], [u, h, v], .016, steel);
      cylinder(u, v, h - .16, .048, .16, { tex: 'emit', color: 0xffd5a0 }, { solid: false, seg: 10 });
    }
    // Existing long service counter is the open kitchen's customer-facing edge.
    for (const u of [32.5, 34.6, 36.7, 38.6]) {
      box(u, 2.25, 0, 1.65, 1, .9, { tex: 'metal', color: 0xa1aaa3 });
      box(u, 2.25, .9, 1.75, 1.1, .08, { tex: 'metal', color: 0xc2c9bf, gloss: .5 });
      if (u < 36) for (const du of [-.42, .42]) cylinder(u + du, 2.25, .99, .22, .05, steel, { solid: false, seg: 16 });
      else box(u, 2.25, .99, 1.2, .65, .04, 0x4a5553, { solid: false });
    }
    box(34.6, 2.3, 2.65, 5.9, 1.3, .42, { tex: 'metal', color: 0x8b9693 }, { solid: false });
    for (const u of [33, 36]) beam([u, 3, 2.3], [u, 3.5, 2.3], .35, { tex: 'metal', color: 0x77817c });
    sign('오픈주방', 35.1, 4.27, 2.5, 2.2, .32, 0, { bg: null, fg: '#d8ccb8' });
    const chef = W(36, 3.6); K.person(chef[0], 0, chef[1], { shirt: 0xe8e1d1, pants: 0x292d2d, rotY: ROT });
    for (const u of [56.25, 58.75]) {
      box(u, 12.7, 0, .62, .58, .43, 0xd4d7cf);
      box(u, 12.95, .43, .6, .15, .58, 0xe2e4dd);
      box(u - .65, 11.9, .8, .55, .55, .12, 0xd3d9d5);
    }
    for (const u of [60, 61.35, 62.7]) box(u, 13.2, 0, .055, .055, 2.85, steel, { solid: false });
    for (const y of [0, 2.8]) box(61.35, 13.2, y, 2.7, .06, .05, steel, { solid: false });
    cylinder(61.4, 12.3, 0, .16, .75, { tex: 'metal', color: 0x757e79 }, { seg: 16 });
    box(61.4, 13.1, 2.25, .65, .12, .35, 0x747e78, { solid: false });

    // The photos show copper brew kettles AND silver fermentation vessels.
    // Keep both finishes, the overhead pipework and a framed glass separation.
    wall(40.2, 4.1, 61.8, 4.1, 0, 3.45, { mat: 'glass', thick: .04, openings: [{ at: 12.8, w: 3, y0: 0, y1: 3.1 }] });
    for (const u of [40.2, 43.8, 47.4, 50.9, 55, 58.4, 61.8]) box(u, 4.1, 0, .06, .08, 3.45, steel, { solid: false });
    for (const [a, b] of [[40.2, 51.5], [54.5, 61.8]]) for (const y of [1.35, 2.6, 3.4]) beam([a, y, 4.1], [b, y, 4.1], .045, steel);
    for (let u = 42; u < 61; u += 3.65) {
      if (Math.abs(u - 53) < 2.5) continue; // mapped 2.5 m north–south passage
      const kettle = u < 47, tankColor = kettle ? 0xb8753d : 0xc5ceca;
      cylinder(u, 2.9, .55, .85, 2.4, { tex: 'metal', color: tankColor }, { seg: 24 });
      const [x, z] = W(u, 2.9);
      K.dome({ x, z, y: 2.95, rx: .85, rz: .85, ry: .4, mat: { tex: 'metal', color: kettle ? 0xce8d4c : 0xd7d8cf }, seg: 24, rings: 6 });
      for (const du of [-.57, .57]) box(u + du, 2.9, 0, .12, .6, .65, steel);
      for (const y of [.75, 2.7]) cylinder(u, 2.9, y, .87, .06, kettle ? 0x765336 : 0x66797b, { solid: false, seg: 24 });
      beam([u, 3.25, 2.9], [u, 3.6, 2.9], .11, copper);
      if (kettle) {
        beam([u, 3.5, 2.9], [u, 3.5, 4.55], .22, copper);
        beam([u, 3.5, 4.55], [u, 6.45, 4.55], .22, copper);
        beam([u, 6.45, 4.55], [u + .35, 6.8, 4.55], .22, copper);
        beam([u + .35, 6.8, 4.55], [u + 1.8, 6.8, 4.55], .22, copper);
      }
      beam([u, .65, 2.9], [u, .65, 3.8], .09, copper);
      box(u, 3.85, .58, .18, .08, .18, 0x963b2c, { solid: false });
    }
    beam([40.5, 3.6, 2.9], [62, 3.6, 2.9], .12, copper);
    for (const y of [5.8, 6.1]) beam([19, y, 1.9], [62, y, 1.9], .085, copper);
    // Service bar, backbar bottles, taps, glassware and a small parking-validation sign.
    box(25.2, 3.25, 0, 10, 1.25, 1.05, brick);
    box(25.2, 3.25, 1.05, 10.25, 1.45, .12, { tex: 'wood', color: 0x78512f });
    for (const y of [.7, 1.6, 2.5]) box(25.5, 1.9, y, 10, .5, .09, 'wood');
    for (let i = 0; i < 33; i++) cylinder(20.9 + (i % 11) * .85, 1.9, .8 + Math.floor(i / 11) * .9, .06, .24, [0x2b5140, 0x85572d, 0xd2b46b][i % 3], { solid: false, seg: 6 });
    for (const u of [24, 24.5, 25, 25.5, 26]) { beam([u, 1.2, 3.1], [u, 1.72, 3.1], .055, copper); beam([u, 1.7, 3.1], [u, 1.7, 3.4], .055, copper); }
    sign('데블스도어', 25.2, 4.02, .65, 3.6, .45, 0, { bg: null, fg: '#c6ab75' });
    // A long zinc-topped service counter faces the tables, with a break at the
    // mapped u53 passage. The return and original backbar make the visible L.
    for (const [a, b] of [[31.1, 50.8], [55, 61.4]]) {
      box((a + b) / 2, 4.75, 0, b - a, .75, 1.02, { tex: 'wood', color: 0x4c3627 });
      box((a + b) / 2, 4.75, 1.02, b - a + .1, .88, .12, { tex: 'metal', color: 0x858b85 });
      for (let u = a + .5; u < b - .4; u += 1.5) {
        beam([u - .5, .12, 5.14], [u + .5, .9, 5.14], .055, steel);
        beam([u + .5, .12, 5.14], [u - .5, .9, 5.14], .055, steel);
      }
    }
    box(30.3, 4.1, 0, .9, 2, 1.02, { tex: 'wood', color: 0x4c3627 });
    box(30.3, 4.1, 1.02, 1.02, 2.12, .12, { tex: 'metal', color: 0x858b85 });
    // Beverage dispenser, stacked tumblers, and a framed historical fee notice.
    box(59.6, 4.85, 1.15, .42, .4, .05, steel, { solid: false });
    cylinder(59.6, 4.85, 1.3, .23, .48, { tex: 'glass', color: 0xf0e9c7 }, { solid: false, seg: 20 });
    cylinder(59.6, 4.85, 1.78, .24, .045, steel, { solid: false, seg: 20 });
    for (const du of [-.17, .17]) box(59.6 + du, 4.85, 1.2, .025, .34, .16, steel, { solid: false });
    beam([59.6, 1.4, 5.03], [59.6, 1.4, 5.17], .025, copper);
    for (let i = 0; i < 18; i++) cylinder(58.15 + (i % 6) * .16, 4.65 + Math.floor(i / 6) * .16, 1.15, .06, .21 + .04 * (i % 3), 'glass', { solid: false, seg: 10 });
    K.texture('ge-fee-notice-2026', 768, 1024, (g, w, h) => {
      g.fillStyle = '#282a29'; g.fillRect(0, 0, w, h);
      g.fillStyle = '#ddc8a4'; g.fillRect(27, 28, w - 54, h - 56);
      g.strokeStyle = '#655446'; g.lineWidth = 3; g.strokeRect(42, 44, w - 84, h - 88);
      g.textAlign = 'center'; g.fillStyle = '#514337'; g.font = 'bold 48px sans-serif'; g.fillText('주차요금 정산 안내', w / 2, 115);
      g.textAlign = 'left'; g.font = 'bold 29px sans-serif'; g.fillText('▣ 기본요금', 65, 169);
      const row = (y, cols, widths, size = 26) => {
        let x = 64; g.font = `${size}px sans-serif`; g.textAlign = 'center';
        cols.forEach((s, i) => { g.fillStyle = '#65564d'; g.fillRect(x, y, widths[i], 53); g.strokeStyle = '#d7c4a5'; g.lineWidth = 1; g.strokeRect(x, y, widths[i], 53); g.fillStyle = '#f1e9d7'; g.fillText(s, x + widths[i] / 2, y + 36); x += widths[i]; });
      };
      row(190, ['구역', '기본요금'], [320, 320]);
      row(243, ['본관주차장', '15분당 1,500원'], [320, 320]);
      row(296, ['파미에주차장', '5분당 550원'], [320, 320]);
      g.textAlign = 'left'; g.fillStyle = '#514337'; g.font = 'bold 29px sans-serif'; g.fillText('▣ 기본요금', 65, 397);
      row(418, ['구분', '본관주차장', '파미에주차장'], [160, 240, 240], 24);
      for (let i = 1; i <= 3; i++) row(418 + 53 * i, [`${i}시간`, `${i * 5}만원 이상`, `${i * 5}만원 이상`], [160, 240, 240], 24);
      row(630, ['영화관', '3시간 3천원 할인권', '무료 불가'], [160, 240, 240], 21);
      g.fillStyle = '#514337'; g.textAlign = 'left'; g.font = '23px sans-serif';
      ['- 백화점 합산 가능', '- 주차등록 미인증시 출차 정산소에 영수증 제시', '- 무인정산소 경우 인터폰 사용', '- 주차 문의 : 02-6282-0555'].forEach((s, i) => g.fillText(s, 66, 750 + i * 40));
    }, [.34, .46], { facade: true });
    box(28.5, 3.7, 1.17, .39, .09, .52, steel, { solid: false });
    const feeCorners = [[28.33, 1.2, 3.75], [28.67, 1.2, 3.75], [28.67, 1.66, 3.75], [28.33, 1.66, 3.75]].map(([u, y, v]) => { const [x, z] = W(u, v); return [x, y, z]; });
    K.quad('ge-fee-notice-2026', feeCorners, [V[0], 0, V[1]]);
    function stool(u, v) {
      cylinder(u, v, .73, .22, .09, 'wood', { seg: 12 });
      for (const du of [-.14, .14]) for (const dv of [-.14, .14]) box(u + du, v + dv, 0, .035, .035, .73, steel, { solid: false });
      for (const dv of [-.15, .15]) beam([u - .16, .26, v + dv], [u + .16, .26, v + dv], .025, steel);
    }
    function table(u, v, w = 3.3) {
      // Across the hall, as in the photos; the previous lengthwise orientation
      // made every table collapse into one thin line in the comparison views.
      box(u, v, 1.02, 1.05, w, .12, { tex: 'wood', color: 0x785032 });
      for (const dv of [-w / 2 + .3, w / 2 - .3]) { box(u, v + dv, 0, .8, .085, 1.02, steel); beam([u - .4, .15, v + dv], [u + .4, .9, v + dv], .045, steel); }
      for (const dv of [-1.2, -.4, .4, 1.2]) for (const du of [-.87, .87]) stool(u + du, v + dv);
      for (const dv of [-.9, .9]) { box(u, v + dv, 1.15, .16, .22, .12, 0xc7b392, { solid: false }); cylinder(u + .22, v + dv, 1.15, .055, .18, 'glass', { solid: false, seg: 8 }); }
    }
    // Eight communal tables remain downstairs and two move to the lounge;
    // all eighty stools are kept. The main aisle at v9.3 and u53 stay open.
    for (const u of [23.6, 30.2, 42.5, 48.7, 57.5]) table(u, 7);
    for (const u of [42.5, 48.7]) table(u, 11.3);
    table(60.7, 7); // moved from the new toilet/smoking-room footprint
    for (const u of [21.4, 25.4, 29.4, 41.2, 45.2, 49.2, 57, 61]) {
      box(u, 15, 0, 2.5, .7, .42, { tex: 'wood', color: 0x5b4132 });
      box(u, 15, .42, 2.5, .75, .16, 0x675042);
      box(u, 15.35, .5, 2.5, .18, .65, 0x5a473c);
      box(u, 14.1, .68, 1.35, .75, .09, 'wood'); box(u, 14.1, 0, .12, .12, .68, steel);
    }
    // 176 individual bulbs on sagging cables, plus dark ventilation ducts.
    for (const v of [5.5, 8.5, 11.5, 14.5]) {
      const cableY = u => 7.18 - .36 * Math.sin(PI * ((u - 19) % 8.8) / 8.8);
      for (let i = 0; i < 44; i++) { const u = 19 + i, y = cableY(u); cylinder(u, v, y - .12, .052, .1, { tex: 'emit', color: 0xffcd80 }, { solid: false, seg: 8 }); beam([u, y, v], [u, y - .12, v], .012, steel); }
      for (let u = 19; u < 62; u += .5) beam([u, cableY(u), v], [u + .5, cableY(u + .5), v], .013, steel);
    }
    for (const v of [5, 12.8]) { beam([19, 8.05, v], [62, 8.05, v], .46, { tex: 'metal', color: 0x414b50 }); for (let u = 21; u < 62; u += 4) beam([u, 8.05, v], [u, 7.7, v + .5], .22, steel); }
    for (const u of [25, 33, 41, 49, 59]) for (const v of [5, 14.6]) sign(['쓱데이', '쓱토버페스트', "DEVIL'S DOOR"], u, v, 5.6, .8, 1.85, PI / 2, { bg: '#b52f40', fg: '#fff1d6', twoSided: true });
    sign(['쓱데이 · 쓱토버페스트', "DEVIL'S DOOR"], 18.3, 8.8, 5.0, 5.2, .95, PI / 2, { bg: '#c74150', fg: '#fff0da', twoSided: true });
    for (const u of [23.4, 43.2, 59]) {
      beam([u, 3.55, 15.55], [u, 3.55, 15.12], .045, steel);
      box(u, 15.12, 2.95, .3, .28, .48, { tex: 'emit', color: 0xffcf87 }, { solid: false });
      for (const du of [-.17, .17]) for (const dv of [-.16, .16]) box(u + du, 15.12 + dv, 2.91, .035, .035, .55, steel, { solid: false });
      for (const y of [2.91, 3.46]) box(u, 15.12, y, .4, .36, .05, steel, { solid: false });
    }
    const diners = [[22.73, 6.6], [24.47, 7.4], [29.33, 6.6], [31.07, 7.4], [41.63, 6.6], [43.37, 7.4], [47.83, 11.7], [49.57, 10.9], [56.63, 6.6], [58.37, 7.4], [25.4, 15], [45.2, 15], [57, 15]];
    diners.forEach(([u, v], i) => { const [x, z] = W(u, v); K.person(x, 0, z, { sit: true, shirt: [0x7c4540, 0x384a55, 0xc4b493, 0x55584b][i % 4], pants: 0x292f36, rotY: ROT + (i % 2 ? PI / 2 : -PI / 2) }); });
    for (const [u, v] of [[39, 13.2], [60.8, 9.2]]) { const [x, z] = W(u, v); K.person(x, 0, z, { shirt: 0x44494b, rotY: ROT + PI / 2 }); }
    const [x, z] = W(26, 2.55); K.person(x, 0, z, { shirt: 0x333e46, rotY: ROT });
    // Menu stand is off the door approach, not in its opening.
    box(32, 16.6, 0, .75, .55, .1, steel); box(32, 16.6, .1, .07, .07, 1.45, steel);
    sign(['데블스도어', '수제맥주 · 식사', '피자 · 버거'], 32, 16.62, 1.3, .72, 1.5, 0, { bg: '#25323b', fg: '#eee5cf' });
  });
  detail('데블스도어 2층 라운지 · 바 · 프라이빗룸', '2F', 3.8, 7.5, rect(18.3, 1.8, 39.8, 12.2), () => {
    // Six original gallery tables are retained, now grouped into rooms/lounges.
    for (const [u, v] of [[21, 3.25], [25, 3.25], [31, 3.25], [36, 3.25], [33.3, 7], [33.3, 5.2]]) {
      box(u, v, 4.53, 3.5, .9, .1, { tex: 'wood', gloss: .3 });
      for (const du of [-1.25, 1.25]) box(u + du, v, 3.8, .07, .6, .73, steel);
      for (const du of [-1, 0, 1]) { box(u + du, v - .75, 4.2, .45, .4, .09, 'wood'); box(u + du, v - .95, 4.29, .45, .07, .55, steel, { solid: false }); }
    }
    // Two communal tables displaced by the indoor stair are moved upstairs.
    for (const u of [21.6, 27.5]) {
      box(u, 7.2, 4.82, 1.05, 3.3, .12, { tex: 'wood', color: 0x785032, gloss: .3 });
      for (const dv of [-1.35, 1.35]) { box(u, 7.2 + dv, 3.8, .8, .085, 1.02, steel); beam([u - .4, 3.95, 7.2 + dv], [u + .4, 4.7, 7.2 + dv], .045, steel); }
      for (const dv of [-1.2, -.4, .4, 1.2]) for (const du of [-.87, .87]) {
        cylinder(u + du, 7.2 + dv, 4.53, .22, .09, 'wood');
        for (const a of [-.14, .14]) for (const b of [-.14, .14]) box(u + du + a, 7.2 + dv + b, 3.8, .035, .035, .73, steel, { solid: false });
        for (const b of [-.15, .15]) beam([u + du - .16, 4.06, 7.2 + dv + b], [u + du + .16, 4.06, 7.2 + dv + b], .025, steel);
      }
    }
    for (const u of [21.6, 27.5]) for (const dv of [-.9, .9]) { box(u, 7.2 + dv, 4.95, .16, .22, .12, 0xc7b392, { solid: false }); cylinder(u + .22, 7.2 + dv, 4.95, .055, .18, 'glass', { solid: false, seg: 8 }); }
    box(29.25, 2.35, 3.8, 1.05, .65, 1.05, { tex: 'wood', color: 0x594330 });
    box(29.25, 2.35, 4.85, 1.2, .8, .1, { tex: 'metal', gloss: .5 });
    for (const u of [28.9, 29.2, 29.5]) cylinder(u, 2.35, 4.95, .06, .26, 0x41634d, { solid: false, seg: 8 });
    sign('프라이빗룸', 22.6, 1.68, 5.6, 3.4, .5, 0, { bg: null, fg: '#dec69f' });
    sign('라운지 · 바', 34, 1.68, 5.6, 2.6, .5, 0, { bg: null, fg: '#dec69f' });
  });

  // Parking furniture is lazy, while all decks, ramps and guardrails already exist.
  // Rounded wheel profiles and sloping cabin glass replace the kit's cuboid car
  // silhouette locally; the chassis remains solid in the same parking stalls.
  function parkingCar(u, v, y, parallel, i) {
    const color = [0xd2d5d4, 0x28323c, 0xf0eee6, 0x666c72, 0x715850][i % 5];
    const P = (x, h, z) => { const q = parallel ? [u + z, v - x] : [u + x, v + z]; const p = W(...q); return [p[0], y + h, p[1]]; };
    const uv = (x, z) => parallel ? [u + z, v - x] : [u + x, v + z];
    const face = (mat, pts) => {
      let world=pts.map(p=>P(...p));
      const a=new K.THREE.Vector3(...world[0]), b=new K.THREE.Vector3(...world[1]), c=new K.THREE.Vector3(...world[2]);
      const n=b.sub(a).cross(c.sub(a)).normalize(), center=new K.THREE.Vector3(...P(0,.8,0));
      const mid=world.reduce((s,p)=>s.add(new K.THREE.Vector3(...p)),new K.THREE.Vector3()).multiplyScalar(.25);
      if(n.dot(mid.sub(center))<0){world=world.reverse();n.negate();}
      K.quad(mat,world,n.toArray());
    };
    const hull = [[-.76,-2.32],[.76,-2.32],[.94,-2.05],[.94,1.95],[.76,2.32],[-.76,2.32],[-.94,1.95],[-.94,-2.05]].map(p => W(...uv(...p)));
    K.prism(hull, y + .31, y + .88, { mat: color });
    const glazing = 0x263d4b;
    face(glazing, [[-.78,.88,-1.55],[.78,.88,-1.55],[.68,1.48,-.88],[-.68,1.48,-.88]]);
    face(glazing, [[.78,.88,1.24],[-.78,.88,1.24],[-.68,1.48,.55],[.68,1.48,.55]]);
    face(color, [[-.68,1.48,-.88],[.68,1.48,-.88],[.68,1.48,.55],[-.68,1.48,.55]]);
    for (const side of [-1, 1]) {
      face(glazing, [[side*.78,.88,-1.55],[side*.78,.88,1.24],[side*.68,1.48,.55],[side*.68,1.48,-.88]]);
      const a = uv(side*.73,-.18), b = uv(side*.73,-.18);
      beam([a[0],y+.88,a[1]], [b[0],y+1.48,b[1]], .065, color);
      for (const z of [-1.47, 1.47]) for (let j = 0; j < 16; j++) {
        const a0 = PI*2*j/16, a1 = PI*2*(j+1)/16;
        const rim = (x, a, r) => [side*x, .34 + r*Math.sin(a), z + r*Math.cos(a)];
        face(0x191c1f, [rim(.88,a0,.34),rim(1.01,a0,.34),rim(1.01,a1,.34),rim(.88,a1,.34)]);
        face(0x1d2023, [[side*1.012,.34,z],rim(1.012,a0,.34),rim(1.012,a1,.34),[side*1.012,.34,z]]);
        face(0xa4abb0, [[side*1.015,.34,z],rim(1.015,a0,.21),rim(1.015,a1,.21),[side*1.015,.34,z]]);
      }
      for (const z of [-2.325,2.325]) face(z > 0 ? 0xe8e4cb : 0xa62c2a, [[side*.29,.56,z],[side*.7,.56,z],[side*.7,.7,z],[side*.29,.7,z]]);
    }
  }
  function parkingBollard(u, v, red = true) {
    cylinder(u, v, 0, .13, .06, 0x494b48, { seg: 12 });
    cylinder(u, v, .06, .065, .82, red ? 0xda653d : 0x323b40, { seg: 10 });
    for (const y of [.45,.7]) cylinder(u, v, y, .068, .09, 0xe7e5d9, { solid: false, seg: 10 });
  }
  for (const [floor, y] of [['1F', 0], ['2F', 3.8], ['3F', 7.6]]) detail(`${floor} 주차 구획 · 차량 · 안내`, floor, y, y + 3.7, footprint, () => {
    const stalls = [];
    for (const u of [4.5, 7.3, 10.1]) stalls.push([u, 10]);
    if (y === 0) for (const u of [72, 77.6, 83.2, 88.8, 94.4]) stalls.push([u, 9.7]);
    if (y === 3.8) for (const u of [72, 77.6, 83.2, 88.8, 94.4]) stalls.push([u, 14.1]);
    if (y === 7.6) for (const u of [72, 77.6, 83.2, 88.8, 94.4]) stalls.push([u, 3.15]);
    let i = 0;
    for (const [u, v] of stalls) {
      const isParallel = u > 60 && y === 3.8;
      const w = isParallel ? 5.3 : 2.5, d = isParallel ? 2.4 : 5.05;
      for (const du of [-w / 2, w / 2]) box(u + du, v, y + .018, .08, d, .009, 0xeee9d8, { solid: false });
      box(u, v - d / 2, y + .018, w, .08, .009, 0xeee9d8, { solid: false });
      box(u, v - d / 2 + .4, y, w * .6, .14, .1, 0x333938, { solid: false });
      parkingCar(u, v, y, isParallel, i++);
    }
    for (const u of [5,10,71,77,83,89,95,102]) for (const v of [12.5,15.9]) {
      box(u, v, y + 3.23, 1.5, .17, .07, 0x6d7474, { solid: false });
      for (const dv of [-.05,.05]) box(u, v+dv, y + 3.2, 1.35, .035, .025, { tex: 'emit', color: 0xeaf0e3 }, { solid: false });
      for (const du of [-.55,.55]) beam([u+du,y+3.3,v], [u+du,y+3.48,v], .015, steel);
    }
    for (const v of [12.1,12.7]) beam([68,y+3.35,v],[103,y+3.35,v],.055,0x737c7e);
    for (let u=68;u<103;u+=.65) beam([u,y+3.35,12.1],[u,y+3.35,12.7],.035,0x737c7e);
    floorText('천천히', 65.3, 14.6, y + .025, 2, .85);
    floorText('↑', 101.7, 8.7, y + .025, 1.3, 2.5);
    if (y === 0) {
      // The photo shows a real glazed booth beside the exit, not in the lane.
      box(101,10.8,0,1.85,1.7,.14,0x5e6463);
      box(101,10.8,.14,1.75,1.6,.8,0xe1d5b8);
      box(101,10.8,.94,1.73,1.58,1.3,{tex:'glass',color:0x667d85},{solid:false});
      for (const du of [-.9,.9]) for (const dv of [-.85,.85]) box(101+du,10.8+dv,.12,.12,.12,2.55,0x717875);
      box(101,10.8,2.45,2.05,1.92,.18,0x777d7b,{solid:false});
      sign(['공영주차장','안내사무실'],101,11.68,2.22,1.55,.42,0,{bg:'#e7dfc7',fg:'#272a27'});
      sign(['반포천 공영주차장','주차 이용 안내'],101,11.68,.54,1.45,.5,0,{bg:'#e4e1d6',fg:'#383e3d'});
      sign('안내',101,11.7,1.05,.34,.17,0,{bg:'#eae8df',fg:'#3d4545'});
      parkingCar(97.7,16.9,0,false,2);
      for(const u of [102.2,102.8]) {
        box(u,12.4,0,.4,.4,.05,0x8e3a30,{solid:false});
        for(let j=0;j<10;j++) {
          const a=PI*2*j/10,b=PI*2*(j+1)/10;
          const conePoint=(r,y,t)=>{const [x,z]=W(u+r*Math.cos(t),12.4+r*Math.sin(t));return[x,y,z];};
          for(const [lo,hi,r0,r1,mat] of [[.05,.4,.19,.115,0xd85538],[.4,.53,.115,.09,0xeee7d2],[.53,.8,.09,.035,0xd85538]])
            K.quad(mat,[conePoint(r0,lo,a),conePoint(r0,lo,b),conePoint(r1,hi,b),conePoint(r1,hi,a)],[Math.cos(a),.2,Math.sin(a)]);
        }
      }
      // Beige booth reference and green-canopy reference are distinct objects.
      box(101,21.5,0,1.9,1.75,.9,0xc5c9bf);
      box(101,21.5,.9,1.9,1.75,1.05,{tex:'glass',color:0x485d61},{solid:false});
      for (const du of [-1.15,1.15]) for (const dv of [-1.05,1.05]) box(101+du,21.5+dv,0,.075,.075,3.0,0x36564a);
      for (const side of [-1,1]) {
        const pts=[[99.7,3,21.5+side*1.25],[102.3,3,21.5+side*1.25],[102.3,3.4,21.5],[99.7,3.4,21.5]].map(([u,y,v])=>{const [x,z]=W(u,v);return[x,y,z];});
        K.quad({tex:'glass',color:0x8aafa0},pts,[0,1,0]);
        beam([99.7,3,21.5+side*1.25],[99.7,3.4,21.5],.06,0x416b57);
        beam([102.3,3,21.5+side*1.25],[102.3,3.4,21.5],.06,0x416b57);
      }
      beam([99.7,3.4,21.5],[102.3,3.4,21.5],.06,0x416b57);
      box(101,21.5,1.95,2.05,1.9,.15,0x6a7471,{solid:false});
      box(100.5,21.6,2.1,.85,.55,.6,0xd1d4ca,{solid:false});
      for(let j=0;j<7;j++)box(100.5,21.9,2.15+j*.065,.65,.025,.018,0x687b78,{solid:false});
      sign('주차 관리',101,22.4,1.8,1.5,.3,0,{bg:'#263c37',fg:'#edeedf'});
      box(97.2,22.6,0,3.4,2.6,.22,0x9d9f91);
      box(97.2,22.6,.22,3.1,2.3,.12,'grass',{solid:false});
      // Broad layered pine crowns and an offset trunk, as in the entry photo.
      beam([97.2,.3,22.6],[96.9,3.7,22.4],.48,{tex:'wood',color:0x655948});
      beam([96.9,3.7,22.4],[97.5,6.8,22.9],.26,{tex:'wood',color:0x655948});
      for(const [du,dv,h,r] of [[-2,-.5,4.5,1.6],[1.9,-.8,4.9,1.8],[-1.5,1.2,5.7,1.7],[1.6,1,6.2,1.6],[.2,.2,7.1,1.6]]) {
        beam([97.1,h-1.2,22.6],[97.2+du,h,22.6+dv],.12,0x665b49);
        const [x,z]=W(97.2+du,22.6+dv); K.dome({x,z,y:h,rx:r,rz:r*.7,ry:.65,mat:0x375a3b,seg:12,rings:4});
      }
      // Directional sign on the approach island, with a clear lane each side.
      box(94.6,22.5,0,1.1,2.3,.14,0x858980);
      box(94.6,22.5,.14,.82,.23,3.15,0x202c2c);
      sign(['↖','반포천 공영주차장','(파미에)','신세계백화점','JW 메리어트 호텔','파미에스테이션','경부선 터미널 ↗'],94.46,22.5,1.84,.78,2.75,-PI/2,{bg:'#202c2c',fg:'#eff0e8'});
      sign(['↑ 반포천 공영주차장','(파미에)','← 사평로방향 출구'],99.5,23.15,1.6,.72,2.7,0,{bg:'#233c34',fg:'#f1efe4'});
      parkingBollard(93.8,22.5); parkingBollard(99.5,18.2); parkingBollard(102.3,18.2);
      // Exit control stays beside the through lane u~96..104, v~13.4.
      box(98.6,11.65,0,.52,.56,1.25,0x56656b);
      sign('출구',98.31,11.65,.96,.38,.2,-PI/2,{bg:'#17252b',fg:'#dcddc7'});
      box(98.6,11.65,1.25,.55,.58,.1,0x2d3b40,{solid:false});
      beam([98.6,1.18,11.65],[98.6,3.02,10.65],.09,white);
      for (let n=0;n<5;n++) beam([98.6,1.25+n*.34,11.61-n*.185],[98.6,1.4+n*.34,11.53-n*.185],.095,0xc64f45);
      for(const v of [10.7,15.0])parkingBollard(103.3,v,false);
      sign(['← 출구','잠원 | 논현 | 신사','이수 | 사당(지하차도)','교대 방면'],103.55,16,1.62,1.7,2.45,-PI/2,{bg:'#1e292d',fg:'#f3e2b0'});
      box(104.3,16.85,0,.2,.14,1.4,0xe4bf46,{solid:false});
      for(let j=0;j<5;j++)beam([104.22,.12+j*.26,16.77],[104.38,.23+j*.26,16.77],.09,0x323b38);
      floorText('↑',99,13.4,.035,1.1,2.9,PI/2,'#e7bc39');
      for(let u=96;u<99;u+=.48)beam([u,.035,10.9],[u+1.1,.035,11.9],.075,white);
    }
  });

  // Apron paint belongs to this entrance only; it does not rebuild the coach yard.
  for(const [v,color] of [[20.8,0xb96a83],[24.5,0x437e9d]]) K.hpoly(color,rect(72,v-.32,92.6,v+.32),.033);
  floorText('한신',77,20.8,.04,1.9,3,PI/2);
  floorText('차고',77,24.5,.04,1.9,3,PI/2);
  K.hpoly(0xd1b34f,rect(71.5,25.4,104,25.5),.034);
  for(let u=73;u<93;u+=1.7) parkingBollard(u,25.3);
  // Original curb equipment is retained, moved clear of the brick arcade and
  // planter only along the hall; the door u36 and mapped path u53 remain open.
  for (const [a, b] of [[1, 11], [20, 29], [42, 49], [61, 91]]) {
    const rv=a>=20&&a<=61?19.8:17.7;
    if(a===61){railing(a,19.8,63,19.8,0,.62,0x9a9e96);railing(63,17.7,b,17.7,0,.62,0x9a9e96);}
    else railing(a, rv, b, rv, 0, .62, 0x9a9e96);
    for (let u = a + 1; u < b; u += 4.5) {
      const bv=u>=20&&u<=63?20.9:19.1;
      for (const du of [-.75, .75]) cylinder(u + du, bv, 0, .055, .68, 0xc2ae43, { seg: 8 });
      beam([u - .75, .68, bv], [u + .75, .68, bv], .11, 0xc2ae43);
      for (const du of [-.75, .75]) cylinder(u + du, bv, .22, .057, .18, 0x6e705d, { solid: false, seg: 8 });
    }
  }

  // Coach-yard edge is implemented below after validating it against the actual
  // OSM area boundary. Coaches and parking surfaces belong to gyeongbu alone.
  buildYardEdge(K);
  spawn('동측 주차빌딩 로드뷰', 60, -13, 0, 0, 1);
  spawn('데블스도어 정문', 36, 18.3, 0);
  spawn('데블스도어 홀', 36, 9.3, 0, 1, 0);
  spawn('데블스도어 2층 라운지', 30.4, 11.55, 3.8, 0, -1);
  spawn('주차빌딩 2층', 65.3, 14.7, 3.8, 1, 0);
  spawn('주차빌딩 3층', 65.5, 14.7, 7.6, 1, 0);
  spawn('주차빌딩 계단', 2, 8, 0, 0, -1);
}

function buildYardEdge(K) {
  // This southeast edge faces the gap between the coach lot and parking building.
  const a = [349.86, -16.63], b = [425.07, -53.16];
  const len = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / len, uz = (b[1] - a[1]) / len;
  const nx = -uz, nz = ux, rot = Math.atan2(nx, nz), P = (t, off) => [a[0] + ux * t + nx * off, a[1] + uz * t + nz * off];
  const areas = K.osm.areas.filter(v => [1173093432, 1173093434].includes(v.id));
  const reserved = (x, z) => areas.some(v => K.pointInPoly(x, z, v.poly));
  for (let t = 3; t < len - 3; t += 2) {
    const [x, z] = P(t, .9); if (reserved(x, z)) continue;
    K.box({ x, z, y: 0, w: 1.94, d: 1.1, h: .16, rotY: rot, mat: 0x8c9185 });
    K.box({ x, z, y: .16, w: 1.96, d: .95, h: 1.45 + Math.sin(t) * .06, rotY: rot, mat: 'ge-privet' });
    const [fx, fz] = P(t, .28);
    K.cyl({ x: fx, z: fz, y: 0, r: .025, h: 1.55, mat: 0x777d72, seg: 6, solid: false });
  }
  for (const y of [.45, .95, 1.45]) { const p = P(3, .28), q = P(len - 3, .28); K.wall(...p, ...q, y, y + .025, { mat: 0x7d8777, thick: .025, solid: false }); }
  for (let t = 7; t < len - 5; t += 9) {
    const [x, z] = P(t, .85); if (!reserved(x, z)) K.tree(x, z, { h: 9.8 + Math.sin(t) * 1.5, kind: 'ginkgo' });
  }
  // Narrow pink edge marking only; the unclaimed generic service road keeps its
  // asphalt and lane geometry. It is not labeled a cycle lane without evidence.
  const p = [P(3, 3.4), P(len - 3, 3.4), P(len - 3, 4), P(3, 4)];
  K.hpoly(0xb9717d, p, .035);
  const q = [P(3, 2.25), P(len - 3, 2.25), P(len - 3, 2.36), P(3, 2.36)]; K.hpoly(0xd7b741, q, .036);
  K.spawn({ name: '버스 차고지 생울타리 · 남서', x: 402.862, y: 0, z: -33.594, yaw: Math.atan2(ux, uz) });
  K.spawn({ name: '버스 차고지 생울타리 · 북동', x: 367.034, y: 0, z: -15.806, yaw: Math.atan2(-ux, -uz) });
  K.zone({ name: '경부선 동측 차고지 경계', floor: '1F', sub: '생울타리 · 가로수 · 보행로', poly: [P(0, 0), P(len, 0), P(len, 7), P(0, 7)], y0: 0, y1: 5, priority: 2 });
}
