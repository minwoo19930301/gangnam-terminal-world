// OSM 414891734. The brewery/parking co-location is a documented modeling inference,
// not a relocation based on the blog's uncertain compass directions. See the research ledger.
export const meta = {
  id: 'gyeongbu_east', name: '경부선 동측 주차빌딩 · 데블스도어',
  claims: [414891734], claimRoads: [], claimAreas: [],
  sources: ['data/osm.json', 'refs/roadview/manifest.json',
    'refs/roadview/gbeast_01_parking_deck.jpg', 'refs/roadview/gbeast_02_bus_yard_road.jpg',
    'refs/roadview/gbeast_03_bus_yard_hedge.jpg', 'refs/interior/famille_back/notes.json',
    'refs/interior/streets_islands/notes.json', 'data/research/gyeongbu_east.json'],
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
  K.texture('ge-rusted-steel', 256, 512, (g, w, h) => {
    const r = K.rand(414891734); g.fillStyle = '#405569'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 1150; i++) { g.fillStyle = ['#9e633e', '#bf8a58', '#75533d', '#5b6c77'][i % 4]; g.fillRect(r() * w, r() * h, 2 + r() * 15, 3 + r() * 43); }
    g.strokeStyle = '#263b49'; g.lineWidth = 3; g.strokeRect(2, 2, w - 4, h - 4);
    for (let y = 10; y < h; y += 60) { g.fillStyle = '#c3af89'; g.fillRect(6, y, 3, 3); g.fillRect(w - 9, y, 3, 3); }
  }, [1.2, 3]);
  K.texture('ge-ribbed-cladding', 128, 128, (g, w, h) => {
    g.fillStyle = '#aebfca'; g.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 16) { g.fillStyle = '#879daa'; g.fillRect(0, y, w, 2); g.fillStyle = '#d3dce0'; g.fillRect(0, y + 2, w, 1); }
    g.fillStyle = '#82939d'; g.fillRect(0, 0, 2, h);
  }, [2.5, 2.2]);
  K.texture('ge-privet', 128, 128, (g, w, h) => {
    const r = K.rand(3434); g.fillStyle = '#335338'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 1500; i++) { g.fillStyle = ['#537345', '#65834a', '#375d35', '#789554'][i % 4]; g.beginPath(); g.ellipse(r() * w, r() * h, 2, 4, r() * PI, 0, PI * 2); g.fill(); }
  }, [.9, .9]);

  // Complete footprint, with an open ground floor and two accessible parking decks.
  K.slab(footprint, 0, { mat: 'concrete', thick: .22, holes: [rect(18, 1.5, 63, 12.9)] });
  const hallVoid = rect(18, 1.4, 63, 12.9);
  const stair1 = rect(2.8, .8, 14.2, 3.6), stair2 = rect(2.8, 4, 14.2, 6.8);
  const ramp1 = rect(68.5, .65, 99.5, 5.75), ramp2 = rect(68.5, 6.35, 99.5, 11.45);
  K.slab(footprint, 3.8, { mat: 'concrete', thick: .3, holes: [hallVoid, stair1, ramp1] });
  K.slab(footprint, 7.6, { mat: 'concrete', thick: .3, holes: [hallVoid, stair2, ramp2] });
  K.slab(footprint, 11.8, { mat: { tex: 'roofgravel', color: 0xe5e3dc }, thick: .26, holes: [hallVoid], walk: false });
  // The full-height hall has a 2F gallery along the tank side, reached from both parking ends.
  slab(18, 1.5, 63, 4.25, 3.8, { mat: 'wood' });
  railing(18.4, 4.25, 62.6, 4.25, 3.8, 1.1, steel);
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
    floors: [{ label: '1F', y: 0, name: '주차장 · 데블스도어' }, { label: '2F', y: 3.8, name: '주차장 · 대관실' }, { label: '3F', y: 7.6, name: '주차장' }] });
  for (const u of [14.55, 17.05]) for (const v of [13.25, 15.75]) box(u, v, 0, .13, .13, 10.9, steel, { solid: false });
  for (const y of [2.8, 6.6, 10.4]) { box(15.8, 13.25, y, 2.6, .13, .12, steel, { solid: false }); sign('주차장 ↑', 15.8, 15.85, y, 1.7, .55, 0, { bg: '#22577b' }); }

  // Roadview: white V-braces, orange ground-column bases and open rails; the
  // enclosed blue glazing/ribbed-metal band sits only above the second deck.
  for (const v of [.25, 16.85]) {
    for (let u = 1; u < 105; u += 8.5) {
      box(u, v, 0, .36, .4, 11.55, white);
      box(u, v, 0, .39, .43, 2.65, orange, { solid: false });
      if (u < 96) for (const y of [0, 3.8]) {
        beam([u, y + .1, v], [u + 4.25, y + 3.55, v], .24, white, .32);
        beam([u + 8.5, y + .1, v], [u + 4.25, y + 3.55, v], .24, white, .32);
      }
    }
    for (const y of [3.5, 7.3]) box(52.4, v, y, 104.6, .45, .3, white, { solid: false });
    railing(.5, v, 104.2, v, 3.8);
    wall(.15, v, 104.6, v, 7.6, 9.8, { mat: 'glass', thick: .04 });
    wall(.15, v, 104.6, v, 9.8, 11.55, { mat: 'ge-ribbed-cladding', thick: .12 });
    box(52.4, v, 11.55, 105, .55, .25, white, { solid: false });
    for (let u = 1; u < 105; u += 2.83) box(u, v, 7.6, .07, .11, 2.2, white, { solid: false });
    for (const y of [7.7, 8.05, 9.7]) box(52.4, v, y, 104.5, .12, .06, white, { solid: false });
  }
  for (const u of [.18, 104.65]) {
    railing(u, .3, u, 16.8, 3.8);
    wall(u, .3, u, 16.8, 7.6, 9.8, { mat: 'glass', thick: .04 });
    wall(u, .3, u, 16.8, 9.8, 11.55, { mat: 'ge-ribbed-cladding', thick: .15 });
    box(u, 8.55, 11.55, .5, 17.2, .25, white, { solid: false });
  }
  // Clear access in the south arcade and west/east ends; no continuous ground-level fence.
  sign('데블스도어 센트럴시티', 37, 16.99, 3.1, 8.2, .65, 0, { bg: '#283231', fg: '#e1c496' });
  sign('주차장 입구 →', 100.8, 16.99, 2.8, 4.3, .8, 0, { bg: '#25475b' });
  sign(['출구 ←', '잠원 · 논현 · 신사'], 102.8, 12.5, 2.45, 2.8, 1.1, -PI / 2, { bg: '#222a2c', fg: '#f2ca45' });
  for (const y of [0, 3.8, 7.6]) {
    zone('경부선 동측 주차빌딩', y === 0 ? '1F' : y === 3.8 ? '2F' : '3F', '주차장 · 계단 · 승강기', 0, 0, 104.8, 17.2, y, y + 3.79, 1);
    sign(y === 0 ? '1층 주차장' : y === 3.8 ? '2층 주차장' : '3층 주차장', 66, 13.2, y + 2.3, 2.3, .5, 0);
  }

  // Recessed brick annex. All windows are cut out of the wall, including their
  // curved heads, so the hall is visible through the arcade and the glazing.
  slab(18, 1.5, 63, 12.9, 0, { mat: 'wood' });
  wall(18, 1.5, 63, 1.5, 0, 8.65, { mat: brick, thick: .25, openings: [{ at: 35, w: 3, y0: 0, y1: 3.1 }] });
  const endOps = [{ at: 2.65, w: 2.1, y0: 3.8, y1: 6.55 }, { at: 7, w: 2.5, y0: 0, y1: 2.8 }];
  for (const u of [18, 63]) wall(u, 1.5, u, 12.9, 0, 8.65, { mat: brick, thick: .25, openings: endOps });
  const windowUs = [21.4, 26.8, 43.4, 48.8, 59.6];
  const openings = windowUs.map(u => ({ at: u - 18, w: 2.4, y0: .65, y1: 5.8 }));
  openings.push({ at: 36 - 18, w: 4.8, y0: 0, y1: 4.8 }, { at: 35, w: 3, y0: 0, y1: 3.1 });
  wall(18, 12.9, 63, 12.9, 0, 8.65, { mat: brick, thick: .28, openings });
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
  for (const u of windowUs) archWindow(u, 12.91, .65, 2.4, 4.6);
  sign('출입구', 53, 13.08, 3.28, 1.3, .3, 0, { bg: '#303a37', fg: '#e4d7b4' });
  // Main 4.8 x 4.8 m weathered portal, with leaves folded back from a 2.5 m clear route.
  box(36, 12.86, 3.3, 4.8, .2, 1.5, 'ge-rusted-steel', { solid: false });
  for (const u of [33.9, 38.1]) box(u, 12.86, 0, .6, .22, 3.3, 'ge-rusted-steel');
  for (const [u, rot] of [[34.65, -.9], [37.35, .9]]) {
    box(u, 12.35, 0, 1.1, .12, 3.25, 'ge-rusted-steel', { rotY: ROT + rot });
    box(u, 12.36, .7, .42, .135, 2.0, 0x172427, { rotY: ROT + rot, solid: false });
    box(u, 12.43, 1.1, .04, .08, .65, copper, { rotY: ROT + rot, solid: false });
  }
  for (const u of [35.15, 36.85]) {
    box(u, 12.99, 3.4, .7, .025, .76, 0x172225, { solid: false });
    for (let i = 0; i < 8; i++) { const a = PI * i / 8, b = PI * (i + 1) / 8; beam([u + .35 * Math.cos(a), 4.16 + .35 * Math.sin(a), 13.01], [u + .35 * Math.cos(b), 4.16 + .35 * Math.sin(b), 13.01], .055, copper); }
  }
  sign("DEVIL'S DOOR", 36, 13.025, 4.53, 3.65, .35, 0, { bg: null, fg: '#bea27a', bold: true });
  sign('데블스도어 센트럴시티', 36, 13.03, 3.54, 2.65, .22, 0, { bg: null, fg: '#ddd3bf' });
  box(36, 13.2, 4.82, 5.4, .9, .22, 0x777c79, { solid: false });
  box(36, 13.14, 4.72, 1.5, .12, .08, { tex: 'emit', color: 0xe68b52 }, { solid: false });
  // West side wood/glass entry remains open in the structural wall.
  for (const v of [5.9, 10.2]) wall(17.98, v, 17.98, v + .8, 0, 2.8, { mat: 'glass', thick: .04 });
  box(18.03, 7, 0, .12, .6, 2.75, 'wood');
  sign(['데블스도어', '2층 대관실 ↑'], 17.6, 10.7, 1.7, 1.1, 1.25, -PI / 2);

  // Barrel glass roof over the atrium, expressed in narrow curved panels and ribs.
  const roofV = 7.2, roofR = 5.75, roofBase = 8.65, rise = 3.3;
  for (let j = 0; j < 14; j++) {
    const a = PI * j / 14, b = PI * (j + 1) / 14;
    const va = roofV + roofR * Math.cos(a), vb = roofV + roofR * Math.cos(b);
    const ya = roofBase + rise * Math.sin(a), yb = roofBase + rise * Math.sin(b);
    for (let u = 18; u < 62.9; u += 4.5) {
      const p = [[u, ya, va], [Math.min(63, u + 4.5), ya, va], [Math.min(63, u + 4.5), yb, vb], [u, yb, vb]].map(([s, y, t]) => { const [x, z] = W(s, t); return [x, y, z]; });
      K.quad({ tex: 'glass', color: 0x8ebfc7 }, p, [0, 1, 0]);
    }
    beam([18, ya, va], [63, ya, va], .055, 0x8bacae);
    for (let u = 18; u <= 63; u += 4.5) beam([u, ya, va], [u, yb, vb], .10, white);
  }
  // Seal the curved end profiles above the masonry, using double-sided glass panels.
  for (const u of [18, 63]) for (let j = 0; j < 14; j++) {
    const a = PI * j / 14, b = PI * (j + 1) / 14;
    const p = [[u, roofBase, roofV + roofR * Math.cos(a)], [u, roofBase, roofV + roofR * Math.cos(b)], [u, roofBase + rise * Math.sin(b), roofV + roofR * Math.cos(b)], [u, roofBase + rise * Math.sin(a), roofV + roofR * Math.cos(a)]].map(([s, y, t]) => { const [x, z] = W(s, t); return [x, y, z]; });
    K.quad('glass', p, [U[0], 0, U[1]]);
  }
  for (let u = 20; u <= 62; u += 6) {
    cylinder(u, 4.7, 0, .17, 8.6, steel);
    beam([u, 7.5, 1.7], [u, 8.7, 7.2], .22, { tex: 'wood', color: 0xa98860 });
    beam([u, 8.7, 7.2], [u, 7.5, 12.7], .22, { tex: 'wood', color: 0xa98860 });
    beam([u, 6.8, 4.7], [u, 8.2, 8.3], .18, { tex: 'wood', color: 0x9d7752 });
  }
  zone('데블스도어 센트럴시티', '1F', '브루어리 · 긴 원목 테이블 · 아치창 소파석', 18, 1.5, 63, 12.9, 0, 11.8, 4);
  zone('데블스도어 센트럴시티', '2F', '프라이빗 대관실 · 브루어리 갤러리', 18, 1.5, 63, 4.25, 3.8, 7.4, 6);

  detail('데블스도어 홀 · 양조시설과 테이블', '1F', 0, 8.6, rect(18, 1.5, 63, 12.9), () => {
    // Stainless fermentation tanks and visible copper supply/return pipes behind a glass partition.
    wall(40.2, 4.1, 61.8, 4.1, 0, 3.45, { mat: 'glass', thick: .04, openings: [{ at: 12.8, w: 3, y0: 0, y1: 3.1 }] });
    for (let u = 42; u < 61; u += 3.65) {
      if (Math.abs(u - 53) < 2.5) continue; // mapped 2.5 m north–south passage
      cylinder(u, 2.9, .55, .85, 2.4, { tex: 'metal', color: 0xc5ceca }, { seg: 20 });
      const [x, z] = W(u, 2.9);
      K.dome({ x, z, y: 2.95, rx: .85, rz: .85, ry: .4, mat: { tex: 'metal', color: 0xd7d8cf }, seg: 20, rings: 5 });
      for (const du of [-.57, .57]) box(u + du, 2.9, 0, .12, .6, .65, steel);
      for (const y of [.75, 2.7]) cylinder(u, 2.9, y, .87, .06, 0x66797b, { solid: false, seg: 20 });
      beam([u, 3.25, 2.9], [u, 3.6, 2.9], .11, copper);
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
    sign(['주차요금 정산 안내', '결제 시 주차 등록'], 28.5, 3.98, 1.48, 1.05, .65, 0, { bg: '#ddc8a4', fg: '#4b3829' });
    sign('데블스도어', 25.2, 4.02, .65, 3.6, .45, 0, { bg: null, fg: '#c6ab75' });
    function stool(u, v) {
      cylinder(u, v, .73, .22, .09, 'wood', { seg: 12 });
      for (const du of [-.14, .14]) for (const dv of [-.14, .14]) box(u + du, v + dv, 0, .035, .035, .73, steel, { solid: false });
      for (const dv of [-.15, .15]) beam([u - .16, .26, v + dv], [u + .16, .26, v + dv], .025, steel);
    }
    function table(u, v, w = 5.2) {
      box(u, v, 1.02, w, 1.05, .12, { tex: 'wood', color: 0x9e7449 });
      for (const du of [-w / 2 + .35, w / 2 - .35]) { box(u + du, v, 0, .085, .8, 1.02, steel); beam([u + du, .15, v - .4], [u + du, .9, v + .4], .045, steel); }
      for (let du = -w / 2 + .6; du < w / 2; du += 1.05) for (const dv of [-.87, .87]) stool(u + du, v + dv);
      for (const du of [-1.25, 1.25]) { box(u + du, v, 1.15, .22, .16, .12, 0xc7b392, { solid: false }); cylinder(u + du + .3, v, 1.15, .055, .18, 'glass', { solid: false, seg: 8 }); }
    }
    // Entry u34..38 and the lengthwise v9.2 aisle stay clear of seats.
    for (const u of [23.6, 30.2, 42.5, 48.7, 57.5]) table(u, 6.8);
    for (const u of [21.4, 26.8, 43.4, 48.8, 59.6]) {
      box(u, 12, 0, 2.5, .7, .42, { tex: 'wood', color: 0x5b4132 });
      box(u, 12, .42, 2.5, .75, .16, 0x675042);
      box(u, 12.35, .5, 2.5, .18, .65, 0x5a473c);
      box(u, 10.8, .68, 1.35, .75, .09, 'wood'); box(u, 10.8, 0, .12, .12, .68, steel);
    }
    for (const v of [5.3, 8.7, 11.5]) {
      for (let u = 19; u < 62; u += 1.45) { const y = 7.1 - .2 * Math.sin((u - 19) / 4.3); cylinder(u, v, y, .045, .11, { tex: 'emit', color: 0xffd18b }, { solid: false, seg: 6 }); }
      beam([19, 7.25, v], [62, 7.25, v], .018, steel);
    }
    for (const u of [31, 46, 58]) sign(['데블스도어', '수제맥주'], u, 7.8, 6.0, 1.15, 1.75, PI / 2, { bg: '#a52e3c', fg: '#f8e8c5', twoSided: true });
    for (const [u, v] of [[23, 6], [29, 7.65], [44, 12], [54, 12]]) { const [x, z] = W(u, v); K.person(x, 0, z, { sit: true, shirt: 0x7f837e, rotY: ROT }); }
    const [x, z] = W(26, 2.55); K.person(x, 0, z, { shirt: 0x333e46, rotY: ROT });
    // Menu stand is off the door approach, not in its opening.
    box(32, 14.2, 0, .75, .55, .1, steel); box(32, 14.2, .1, .07, .07, 1.45, steel);
    sign(['데블스도어', '수제맥주 · 식사', '피자 · 버거'], 32, 14.22, 1.3, .72, 1.5, 0, { bg: '#25323b', fg: '#eee5cf' });
  });
  detail('데블스도어 2층 대관실', '2F', 3.8, 7.5, rect(18, 1.5, 63, 4.25), () => {
    for (let u = 23; u < 61; u += 6.5) {
      box(u, 2.7, 4.53, 3.5, .9, .1, 'wood');
      for (const du of [-1.25, 1.25]) box(u + du, 2.7, 3.8, .07, .6, .73, steel);
      for (const du of [-1, 0, 1]) { box(u + du, 1.95, 4.2, .45, .4, .09, 'wood'); box(u + du, 1.75, 4.29, .45, .07, .55, steel, { solid: false }); }
    }
    sign('프라이빗 대관실', 40, 1.68, 5.6, 3.4, .5, 0, { bg: null, fg: '#dec69f' });
  });

  // Parking furniture is lazy, while all decks, ramps and guardrails already exist.
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
      if (i++ % 4 !== 2) { const [x, z] = W(u, v); K.vehicle({ x, z, y, rotY: ROT + (isParallel ? PI / 2 : 0), kind: i % 5 === 0 ? 'van' : 'car', color: [0xc9cecc, 0x242f39, 0xe9e6dd, 0x51565c][i % 4] }); }
    }
    for (const u of [9, 71, 84, 97]) box(u, 12.5, y + 3.15, 2.7, .2, .06, { tex: 'emit', color: 0xe2e5ce }, { solid: false });
    floorText('천천히', 65.3, 14.6, y + .025, 2, .85);
    floorText('↑', 101.7, 8.7, y + .025, 1.3, 2.5);
    if (y === 0) {
      // Attendant kiosk with its door facing the 4 m vehicle aisle.
      box(100.5, 13.4, 0, 1.8, 1.8, .85, 0xdfded2);
      box(100.5, 13.4, .85, 1.8, 1.8, 1.35, 'glass', { solid: false });
      box(100.5, 13.4, 2.2, 2.1, 2.1, .2, 0x3d6257, { solid: false });
      sign('주차 안내', 100.5, 14.4, 2.0, 1.35, .4, 0);
      for (const u of [98, 102.4]) { cylinder(u, 16, 0, .12, .85, orange, { seg: 8 }); cylinder(u, 16, .5, .125, .12, white, { solid: false, seg: 8 }); }
    }
  });

  // Front curb equipment stays inside the 3 m arcade apron; openings preserve the
  // mapped footpath at u~55 and the main portal at u36.
  for (const [a, b] of [[1, 11], [20, 29], [42, 49], [61, 91]]) {
    railing(a, 17.7, b, 17.7, 0, .62, 0x9a9e96);
    for (let u = a + 1; u < b; u += 4.5) {
      for (const du of [-.75, .75]) cylinder(u + du, 19.1, 0, .055, .68, 0xc2ae43, { seg: 8 });
      beam([u - .75, .68, 19.1], [u + .75, .68, 19.1], .11, 0xc2ae43);
      for (const du of [-.75, .75]) cylinder(u + du, 19.1, .22, .057, .18, 0x6e705d, { solid: false, seg: 8 });
    }
  }

  // Coach-yard edge is implemented below after validating it against the actual
  // OSM area boundary. Coaches and parking surfaces belong to gyeongbu alone.
  buildYardEdge(K);
  spawn('동측 주차빌딩 로드뷰', 60, -13, 0, 0, 1);
  spawn('데블스도어 정문', 36, 15.3, 0);
  spawn('데블스도어 홀', 36, 9.3, 0, 1, 0);
  spawn('데블스도어 2층 대관실', 20, 3.3, 3.8, 1, 0);
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
