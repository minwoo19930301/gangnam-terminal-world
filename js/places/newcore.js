// Exact OSM footprints; photo-based elevations; official floor uses. Metre
// heights, core positions and indoor bay positions are documented estimates.
export const meta = {
  id: 'newcore', name: '뉴코아아울렛 강남점',
  // 6169292 repeats the first three ways: suppress its generic solid shells too.
  claims: [413372929, 413372930, 413372931, 443718139, 6169292],
  sources: ['data/osm.json', 'refs/aerial/newcore_banwon.jpg',
    'refs/roadview/newcore_01_front.jpg', 'refs/roadview/newcore_02_across_xi.jpg',
    'refs/roadview/newcore_03_along_SW.jpg', 'refs/interior/newcore/notes.json',
    'https://www.elandretail.com/store02.do?BDID=0003001B&branchID=00110001&lang=000600KO',
    'https://www.elandretail.com/store02.do?BDID=0003002B&branchID=00110001&lang=000600KO',
    'https://www.elandretail.com/store02.do?BDID=0003003B&branchID=00110001&lang=000600KO'],
};
const C = { cream: 0xeee8d9, trim: 0xf5efde, stone: 0xc5beae, slate: 0x899297,
  black: 0x222727, glass: 0x8da9a7, wood: { tex: 'wood', color: 0xd9bb87 }, metal: 0x434a4b };

// u runs SE along the frontage, v runs inward SW. The shell/slabs always use
// the original polygon, never its axis-aligned bounding box.
function frame(K, id) {
  const p = K.osmBuilding(id)[0].poly, a = p[2], b = p[1];
  const L = Math.hypot(b[0] - a[0], b[1] - a[1]);
  const ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L;
  const ox = (a[0] + b[0]) / 2, oz = (a[1] + b[1]) / 2;
  const W = Math.abs((p[0][0] - b[0]) * -uz + (p[0][1] - b[1]) * ux);
  const angle = Math.atan2(-uz, ux), P = (u, v) => [ox + ux * u - uz * v, oz + uz * u + ux * v];
  return localFrame(K, { p, L, W, angle, P });
}
function localFrame(K, F) {
  const { P, angle } = F;
  const B = (u, y, v, w, h, d, mat = C.cream, extra = {}) => {
    const [x, z] = P(u, v); return K.box({ x, y, z, w, h, d, rotY: angle, mat, ...extra });
  };
  const S = (text, u, y, v, w, h, bg = null, extra = {}) => {
    const [x, z] = P(u, v); K.sign(text, { x, y, z, w, h, rotY: angle + Math.PI, bg, fg: '#f4efdf', ...extra });
  };
  const Q = (u0, v0, u1, v1) => [P(u0, v0), P(u1, v0), P(u1, v1), P(u0, v1)];
  const wall = (u0, v0, u1, v1, y0, y1, opts = {}) => K.wall(...P(u0, v0), ...P(u1, v1), y0, y1, opts);
  const cyl = (u, y, v, r, h, mat, seg = 10) => { const [x, z] = P(u, v); K.cyl({ x, y, z, r, h, mat, seg, solid: false }); };
  const person = (u, y, v, opts = {}) => { const [x, z] = P(u, v); K.person(x, y, z, { rotY: angle, ...opts }); };
  return { ...F, K, B, S, Q, wall, cyl, person };
}
function textures(K) {
  K.texture('newcore-limestone', 512, 512, (g, w, h) => {
    g.fillStyle = '#e9e3d5'; g.fillRect(0, 0, w, h); g.strokeStyle = '#c9c4b8'; g.lineWidth = 2;
    for (let row = 0; row < 4; row++) {
      const y = row * 128; g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke();
      for (let col = -1; col < 3; col++) { const x = col * 256 + (row % 2) * 128; g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 128); g.stroke(); }
    }
  }, [2.4, 1.2]);
  K.texture('newcore-blue-tile', 512, 256, (g, w, h) => {
    g.fillStyle = '#879399'; g.fillRect(0, 0, w, h); g.strokeStyle = '#626e76'; g.lineWidth = 2;
    for (let j = 0; j < 4; j++) for (let i = -1; i < 5; i++) g.strokeRect(i * 128 + (j % 2) * 64, j * 64, 128, 64);
  }, [2, 1]);
  K.texture('newcore-pavers', 512, 512, (g, w, h) => {
    g.fillStyle = '#b5afa2'; g.fillRect(0, 0, w, h);
    const pal = ['#aaa79e', '#c3beb1', '#99978e', '#b2b0a6'];
    for (let j = -8; j < 20; j++) for (let i = -8; i < 20; i++) {
      g.save(); g.translate(i * 64 + j * 32, j * 64 - i * 32); g.rotate(Math.PI / 4);
      g.fillStyle = pal[(i + j + 16) % 4]; g.fillRect(1, 1, 62, 30); g.strokeStyle = '#7b7a73'; g.lineWidth = 1; g.strokeRect(1, 1, 62, 30); g.restore();
    }
  }, [2.8, 2.8]);
}

function arch(F, u, span, label, awning = C.black, height = 9.65) {
  const { K, P, B, S, angle } = F, r = span / 2 - 0.65, spring = height - r;
  B(u, 3.35, -0.12, span - 1.05, height - 3.25, 0.16, 'newcore-blue-tile', { solid: false });
  B(u, 3.35, -0.24, r * 2, spring - 3.3, 0.08, C.glass, { solid: false });
  const pt = (uu, y, v) => { const [x, z] = P(uu, v); return [x, y, z]; };
  const normal = [Math.sin(angle + Math.PI), 0, Math.cos(angle + Math.PI)];
  for (let j = 0; j < 24; j++) {
    const a = j * Math.PI / 24, b = (j + 1) * Math.PI / 24;
    K.quad(C.glass, [pt(u, spring, -0.25), pt(u + Math.cos(a) * r, spring + Math.sin(a) * r, -0.25), pt(u + Math.cos(b) * r, spring + Math.sin(b) * r, -0.25), pt(u, spring, -0.25)], normal);
    for (const [rr, thick, v, mat] of [[r, 0.18, -0.38, C.stone], [r + 0.2, 0.33, -0.48, C.trim], [r + 0.55, 0.12, -0.34, C.stone]]) {
      const q = [pt(u + Math.cos(a) * rr, spring + Math.sin(a) * rr, v), pt(u + Math.cos(a) * (rr + thick), spring + Math.sin(a) * (rr + thick), v), pt(u + Math.cos(b) * (rr + thick), spring + Math.sin(b) * (rr + thick), v), pt(u + Math.cos(b) * rr, spring + Math.sin(b) * rr, v)];
      K.quad(mat, q, normal);
      K.quad(C.cream, [q[1], q[2], pt(u + Math.cos(b) * (rr + thick), spring + Math.sin(b) * (rr + thick), 0), pt(u + Math.cos(a) * (rr + thick), spring + Math.sin(a) * (rr + thick), 0)], normal);
    }
  }
  for (const side of [-1, 1]) {
    const x = u + side * (span / 2 - 0.3);
    B(x, 0, -0.25, 1.05, spring, 0.65, 'newcore-limestone'); B(x, 0, -0.40, 1.32, 0.42, 0.95, C.trim);
    B(x, spring - 0.2, -0.36, 1.4, 0.30, 0.9, C.trim, { solid: false });
    B(x, 0.85, -0.59, 0.69, spring - 1.55, 0.055, C.stone, { solid: false });
    B(x, 0.93, -0.63, 0.53, spring - 1.71, 0.055, C.cream, { solid: false });
  }
  B(u, height - 0.3, -0.53, 0.8, 0.85, 0.7, C.trim, { solid: false });
  const aw = span - 1.6;
  K.quad(awning, [pt(u - aw / 2, 3.7, -0.3), pt(u + aw / 2, 3.7, -0.3), pt(u + aw / 2, 2.95, -2), pt(u - aw / 2, 2.95, -2)], [0, 1, 0]);
  B(u, 2.77, -1.98, aw, 0.22, 0.08, awning, { solid: false }); S(label, u, 3.18, -1.72, Math.min(aw - 0.5, 6), 0.4);
}
function doors(F, u, w = 4.4) {
  for (const side of [-1, 1]) {
    F.B(u + side * (w / 2 - 0.42), 0, 0.12, 0.78, 2.65, 0.09, 'glass');
    F.B(u + side * (w / 2 - 0.04), 0, 0.1, 0.075, 2.85, 0.12, C.metal);
    F.B(u + side * 1.18, 0.9, -0.01, 0.035, 0.65, 0.06, 0xd1d5d0, { solid: false });
  }
  F.B(u, 2.72, 0, w, 0.2, 0.2, C.black, { solid: false });
}

function core(F, floors, name, roof) {
  const { K, L, W, P, Q, wall, S } = F;
  const a = -L / 2 + 4, b = a + 7.4, v0 = W - 9.4, v1 = W - 3.2;
  const hole = Q(a - 0.2, v0 - 1.4, b + 3, v1 + 1.4), [x, z] = P(b + 8, W - 3.5);
  K.elevator({ name: name + ' 엘리베이터', x, z, rotY: F.angle + Math.PI, w: 2.5, d: 2.5, floors });
  floors.forEach((f, i) => {
    const next = floors[i + 1];
    K.slab(F.p, f.y, { mat: f.y < 0 ? 'newcore-pavers' : 'tile', under: f.y === 0 ? C.black : 'ceiling', holes: i ? [hole] : [], thick: 0.28 });
    K.zone({ name, floor: f.label, sub: f.name, poly: F.p, y0: f.y, y1: next?.y ?? Math.max(roof, f.y + 3.2) });
    S([f.label, f.name], b + 7.8, f.y + 2.05, W - 1.8, 3.1, 0.8, '#3c403d');
    if (i) {
      wall(a - 0.2, v0 - 1.4, b + 3, v0 - 1.4, f.y, f.y + 1, { mat: 'glass', thick: 0.07 });
      wall(a - 0.2, v1 + 1.4, b + 3, v1 + 1.4, f.y, f.y + 1, { mat: 'glass', thick: 0.07 });
      wall(b + 3, v0 - 1.4, b + 3, v1 + 1.4, f.y, f.y + 1, { mat: C.metal, thick: 0.1 });
      K.slab(Q(a - 2.2, v0 - 1.4, a + 0.1, v1 + 1.4), f.y, { mat: 'tile', thick: 0.18 });
    }
    if (!next) return;
    const mid = (f.y + next.y) / 2;
    // The roof-parking stair is steeper than the retail-storey stair runs.
    K.stairs(...P(a, v0), ...P(b, v0), { ya: f.y, yb: mid, w: 2.4, mat: 0xb5b6ae, rails: true });
    K.slab(Q(b - 0.1, v0 - 1.25, b + 2.8, v1 + 1.25), mid, { mat: 'tile', thick: 0.18 });
    K.stairs(...P(b, v1), ...P(a, v1), { ya: mid, yb: next.y, w: 2.4, mat: 0xb5b6ae, rails: true });
  });
  if (floors[0].y < 0) K.groundHole(F.p);
  // Do not cap a roof-parking stairwell at its top landing.
  if (roof > floors[floors.length - 1].y + 0.1) K.slab(F.p, roof, { mat: 'roofgravel', under: 'ceiling', thick: 0.3 });
  return { hole, a, b, v0, v1, lift: [b + 8, W - 3.5] };
}

function streetFront(F, number, roof) {
  const { K, L, W, P, Q, B, S } = F;
  const n = Math.max(2, Math.round((L - 8) / 8.5)), bay = (L - 8) / n;
  const centers = Array.from({ length: n }, (_, i) => -L / 2 + 4 + (i + 0.5) * bay);
  const openings = centers.map(u => { const [x, z] = P(u, 0); return { x, z, w: bay - 1.8, y0: 0, y1: 3.35 }; });
  for (const [u, v, w] of [[L / 2, W * 0.27, 4], [L / 2, W * 0.58, 4.5], [L / 2, W * 0.84, 3], [0, W, 4]]) {
    const [x, z] = P(u, v); openings.push({ x, z, w, y0: 0, y1: 3.5 });
  }
  K.polyWalls(F.p, 0, roof, { mat: 'newcore-limestone', inner: 0xe9e5db, thick: 0.3, openings });
  centers.forEach((u, i) => {
    const label = number === 2 ? ['DESIGNERS', 'luxury gallery', 'Black&White', 'FRANGERIE', 'NEWCORE', '하나은행'][i % 6]
      : number === 3 ? ["KIM'S CLUB", 'CHAI797 Plus', 'CAFÉ MAMAS', 'STARBUCKS', '밀도', '백미당'][i % 6]
      : ['NEWCORE OUTLET', 'OLIVE YOUNG', 'NEWCORE'][i % 3];
    const awning = number === 3 && i === 2 ? 0x435e54 : number === 3 && i === 4 ? 0x9d343b : C.black;
    arch(F, u, bay, label, awning, Math.min(9.65, roof - 1.15)); doors(F, u, Math.min(4.4, bay - 2.2));
    if (number === 2 && i === 0) S('DESIGNERS', u, 5.1, -0.34, bay - 2, 0.52, '#62696a');
    if (i === Math.floor(n / 2)) S([String(number), '뉴코아 ' + number + '관'], u, 6.35, -0.34, 1.8, 1.35);
    for (const du of [-bay * 0.24, 0, bay * 0.24]) B(u + du, 3.5, -0.30, 0.055, 2.6, 0.08, 0x697a7c, { solid: false });
  });
  for (const [y, h, d] of [[9.9, 0.22, 0.5], [10.2, 0.35, 0.7], [roof - 0.75, 0.22, 0.55], [roof - 0.43, 0.3, 0.9]]) {
    if (y > roof - 0.3 || (number === 3 && y < roof - 1)) continue;
    B(0, y, -0.18, L + 0.2, h, d, C.trim, { solid: false });
  }
  if (number !== 3) {
    for (let u = -L / 2 + 2.3; u < L / 2 - 2; u += 5.4) {
      B(u, 10.7, -0.05, 2.65, roof - 11.6, 0.15, number === 1 ? 0x696d6b : C.cream, { solid: false });
      B(u - 2.45, 10.65, -0.22, 0.27, roof - 11.2, 0.4, C.trim, { solid: false });
    }
    S('NEWCORE', 0, roof - 6, -0.21, 11, 1.7, null, { fg: '#545959' });
  }
  // Photo02's 잠원로4길/P tower is at 3관's NORTH end, not the 1관 end.
  const towerU = number === 3 ? -L / 2 + 2.5 : L / 2 - 2.5;
  // Tower cladding remains visual, so it does not seal the corner entrance.
  B(towerU, 0, 1.25, 4.4, roof + 4, 2.3, 'newcore-limestone', { solid: false });
  B(towerU, 0.35, -0.16, 2.6, roof + 0.9, 0.15, 0x243e49, { solid: false });
  B(towerU, 0.35, -0.26, 2.42, roof + 0.9, 0.035, 'glass', { solid: false });
  for (let y = 1; y < roof; y += 2.25) B(towerU, y, -0.3, 2.6, 0.08, 0.09, 0x495b61, { solid: false });
  S(number === 3 ? 'P' : 'NEWCORE', towerU, roof + 2.35, -0.25, number === 3 ? 1.8 : 4.1, 1.15, null, { fg: number === 3 ? '#346c9c' : '#595c5b' });
  // Private paving at grade; no roads or commercial landuse replaced.
  K.slab(Q(-L / 2, -10, L / 2, 0), 0, { mat: 'sidewalk', thick: 0.08, ceil: false });
  B(0, 0.008, -1.8, L - 1, 0.014, 0.45, 'darkstone', { solid: false });
  for (const u of centers.filter((_, i) => i % 2 === 0)) {
    const [x, z] = P(u + 1.6, -7.8); K.tree(x, z, { h: 7.3, kind: 'zelkova' });
    B(u + 1.6, 0.018, -7.8, 1.6, 0.025, 1.6, 0x545e53, { solid: false });
    for (let j = -0.65; j <= 0.65; j += 0.18) B(u + 1.6 + j, 0.046, -7.8, 0.04, 0.018, 1.45, C.black, { solid: false });
  }
  for (const u of centers) {
    const len = Math.max(2.4, bay - 3.2), v = -9.5;
    for (const du of [-len / 2, 0, len / 2]) B(u + du, 0, v, 0.07, 1.05, 0.07, C.black);
    for (const y of [0.38, 0.96]) B(u, y, v, len, 0.055, 0.065, C.black, { solid: false });
    for (let du = -len / 2 + 0.25; du < len / 2; du += 0.32) B(u + du, 0.36, v, 0.025, 0.59, 0.035, C.black, { solid: false });
  }
}
function southEnd(F, roof) {
  const { K, L, W, P } = F, origin = P(L / 2, W / 2), angle = F.angle - Math.PI / 2;
  const G = localFrame(K, { ...F, angle, P: (u, v) => [origin[0] + Math.cos(angle) * u + Math.sin(angle) * v, origin[1] - Math.sin(angle) * u + Math.cos(angle) * v] });
  for (const u of [-W * 0.23, W * 0.08]) { arch(G, u, W * 0.30, 'NEWCORE OUTLET'); doors(G, u, 4); }
  for (let u = -W / 2 + 2; u < W / 2 - 2; u += 4.8) G.B(u, 10.6, -0.05, 2.4, roof - 11.5, 0.17, 0x686b69, { solid: false });
  for (const y of [10, 10.4, roof - 0.6]) G.B(0, y, -0.2, W, 0.25, 0.65, C.trim, { solid: false });
  G.S('NEWCORE', -3, roof - 5.8, -0.23, 8, 1.4, null, { fg: '#434b4c' });
  G.S(['1', '뉴코아 1관'], W * 0.08, 6.3, -0.3, 1.7, 1.3);
  G.S('우리은행 신반포금융센터', W * 0.32, 3.35, -0.33, 5.9, 0.6, '#305c78');
  K.slab(G.Q(-W / 2, -9, W / 2, 0), 0, { mat: 'sidewalk', thick: 0.08, ceil: false });
  for (const u of [-W * 0.25, -W * 0.07]) {
    const [x, z] = G.P(u, -5.7);
    G.B(u, 0.015, -5.7, 3.8, 0.025, 5.2, 0x377caf, { solid: false });
    K.floorText('장애인 전용', { x, y: 0.05, z, w: 2.8, h: 1.4, rotY: angle, fg: '#ffffff' });
    for (const du of [-1.85, 1.85]) G.B(u + du, 0.045, -5.7, 0.10, 0.018, 5.2, 0xffffff, { solid: false });
  }
}
function table(F, u, y, v, occupied = false) {
  const { B, cyl, person } = F;
  B(u, y + 0.72, v, 1.35, 0.075, 0.78, C.wood);
  for (const du of [-0.5, 0.5]) for (const dv of [-0.25, 0.25]) B(u + du, y, v + dv, 0.045, 0.72, 0.045, 0xd5ceba, { solid: false });
  for (const du of [-0.36, 0.36]) for (const side of [-1, 1]) {
    const vv = v + side * 0.66;
    B(u + du, y + 0.43, vv, 0.43, 0.065, 0.43, C.wood);
    B(u + du, y + 0.48, vv + side * 0.18, 0.43, 0.34, 0.055, 0xc7bf9f, { solid: false });
    for (const xx of [-0.15, 0.15]) B(u + du + xx, y, vv, 0.035, 0.43, 0.3, 0xc6bd9e, { solid: false });
  }
  B(u + 0.45, y + 0.8, v, 0.22, 0.03, 0.28, 0xf7e7c2, { solid: false });
  if (occupied) { person(u - 0.35, y, v + 0.68, { sit: true, shirt: 0x7e7968 }); cyl(u - 0.34, y + 0.8, v, 0.13, 0.055, 0xe8e5d8); }
}
function planter(F, u, y, v, w) {
  const { B, cyl } = F;
  B(u, y, v, w, 0.86, 0.34, C.wood);
  B(u, y + 0.12, v - 0.19, w - 0.15, 0.61, 0.035, 0xe2ded0, { solid: false });
  for (let du = -w / 2 + 0.15; du < w / 2; du += 0.55) {
    B(u + du, y + 0.08, v - 0.22, 0.045, 0.70, 0.05, 0xb89566, { solid: false });
    cyl(u + du, y + 0.86, v, 0.13, 0.28, 0x527849, 7);
    B(u + du, y + 0.90, v, 0.30, 0.16, 0.14, 0x6d9055, { solid: false });
  }
}

function foodRoom(F, ci) {
  const { K, L, W, Q, B, S, wall, cyl, person } = F, y = K.LEVELS.B1;
  const names = ['오근내 닭갈비', '봉혜자 별미요릿집', '솥내음', '한성돈까스', 'PhởVua', '육된장'];
  const us = [-30, -18, -6, 6, 18, 30];
  wall(-L / 2 + 1, 2, L / 2 - 1, 2, y, y + 3.2, { mat: 0xe7dfca });
  for (const u of us) for (const du of [-5.5, 5.5]) wall(u + du, 2, u + du, 11.4, y, y + 3.1, { mat: 0xe3dcc9, thick: 0.12 });
  K.zone({ name: '킴스 푸드 스트리트', floor: 'B1', sub: '솥내음 · 봉혜자 · 공용 좌석', poly: Q(-L / 2 + 1, 1, L / 2 - 1, 21), y0: y, y1: -2.7, priority: 2 });
  // Separate exposed ceiling below the 6m structural floor interval.
  K.hpoly(C.black, F.p, y + 3.35, false, [ci.hole]);
  for (let u = -32; u < L / 2 - 4; u += 16) B(u, y, 21.5, 0.65, 3.35, 0.65, 0xd5cbb5);
  K.detail({ name: '1관 킴스 푸드 스트리트', floor: 'B1', poly: F.p, y0: y, y1: 0 }, () => {
    // Large pale tiles in seating areas, contrasting herringbone aisle.
    K.hpoly({ tex: 'tile', color: 0xd4cebc }, Q(-L / 2 + 2, 17.5, L / 2 - 2, 21), y + 0.012, true);
    for (let u = -L / 2 + 3; u < L / 2 - 1; u += 5.5) {
      B(u, y + 3.05, W / 2, 0.15, 0.17, W - 1, C.metal, { solid: false });
      for (const v of [5, 14.3, 21]) {
        B(u, y + 2.99, v, 1.2, 0.07, 0.07, 0x292d2d, { solid: false });
        for (const du of [-0.40, 0.40]) cyl(u + du, y + 2.82, v, 0.085, 0.15, { tex: 'emit', color: 0xffedc1 }, 8);
      }
    }
    for (const v of [12.2, 19.4, W - 1.4]) {
      B(0, y + 2.90, v, L - 1, 0.24, 0.45, 0x555b5c, { solid: false });
      for (let u = -L / 2 + 1; u < L / 2; u += 1.3) B(u, y + 2.88, v, 0.045, 0.28, 0.5, 0x7b8080, { solid: false });
    }
    us.forEach((u, i) => {
      const dark = i === 1, front = 11.3;
      B(u, y + 2.3, front, 10.8, 0.75, 0.35, dark ? 0x574c43 : 0xd3c3a3, { solid: false });
      S(names[i], u, y + 2.64, front + 0.21, 8, 0.5, null, { rotY: F.angle, fg: dark ? '#fff9e9' : '#463b2c' });
      B(u, y, 3.3, 9.4, 0.93, 1.2, dark ? 0x66513e : C.wood);
      B(u, y + 0.93, 3.3, 9.6, 0.08, 1.3, 0xd7d8ce, { solid: false });
      for (let j = 0; j < 4; j++) {
        B(u - 3.3 + j * 2.1, y + 1.45, 2.2, 1.75, 0.65, 0.06, 0x263c3d, { solid: false });
        S(['차림표', ['솥밥 · 국수', '정갈한 한 끼', '따뜻한 식사', '오늘의 메뉴'][j]], u - 3.3 + j * 2.1, y + 1.77, 2.27, 1.6, 0.53, '#ede3c5', { rotY: F.angle, fg: '#342e25' });
        cyl(u - 3.3 + j * 2.1, y + 1.04, 3.4, 0.17, 0.17, 0x3d4444);
      }
      if (i === 4) {
        // Photo09: stainless counter with a line of black bar stools.
        B(u, y, 9.8, 8.3, 1.02, 0.8, 0x9aa6a4);
        B(u, y + 1.02, 9.8, 8.5, 0.08, 1.1, 0xd4dcda);
        for (let du = -3.2; du <= 3.2; du += 1.07) { cyl(u + du, y, 11.1, 0.07, 0.65, C.metal); cyl(u + du, y + 0.65, 11.1, 0.23, 0.08, C.black); }
      } else {
        for (const du of [-3.4, 0, 3.4]) table(F, u + du, y, 7.6, (i + Math.round(du)) % 2 === 0);
        planter(F, u - 2.3, y, 10.8, 5.7);
      }
      B(u + 3.9, y, 11.8, 0.85, 0.1, 0.6, C.black, { solid: false });
      B(u + 3.9, y + 0.1, 11.8, 0.075, 1, 0.08, C.metal, { solid: false });
      S(['차림표', names[i], '솥밥 · 면 · 식사'], u + 3.9, y + 1.2, 11.85, 0.95, 0.72, '#e8e7c8', { rotY: F.angle, fg: '#3e4b44' });
      B(u + 5.1, y + 0.8, 11.38, 0.68, 1.45, 0.13, 0x212829, { solid: false });
      S(['추천 메뉴', names[i]], u + 5.1, y + 1.5, 11.46, 0.56, 1.2, '#d3e7dc', { rotY: F.angle, fg: '#515e46' });
      if (i === 2) S(['솥내음', '정갈한 한 끼'], u, y + 2.62, front + 0.23, 4, 0.55, null, { rotY: F.angle, fg: '#4d3b25' });
      if (dark) for (const du of [-3.6, 0, 3.6]) { cyl(u + du, y + 2.55, 7.6, 0.03, 0.5, C.black); cyl(u + du, y + 2.35, 7.6, 0.18, 0.2, { tex: 'emit', color: 0xffdda0 }); }
      person(u + 1, y, 4.4, { shirt: 0x4c4b43 });
    });
    for (let u = -L / 2 + 5; u < L / 2 - 4; u += 3.5) table(F, u, y, 19, Math.round(u) % 3 === 0);
    for (const [i, name] of ['PizzaMall', '신차이', 'RIMINI', 'STARBUCKS'].entries()) {
      const u = -7 + i * 11;
      B(u, y, W - 3, 8.6, 0.95, 1.1, C.wood); S(name, u, y + 2.35, W - 3.65, 7.5, 0.6, '#35423c');
      for (const du of [-2.4, 1.2]) table(F, u + du, y, W - 7.4, i % 2 === 0);
    }
    // Board at north end of main aisle; no invented compass direction on map.
    S(["KIM'S FOOD STREET", '킴스 푸드 스트리트', '솥내음 · 봉혜자 · 리미니 · 피자몰'], -L / 2 + 1, y + 2.05, 16, 5, 1.3, '#353b37', { rotY: F.angle + Math.PI / 2 });
    S(['1관 B1', '킴스 푸드 스트리트', "KIM'S CLUB →"], ci.b + 4, y + 2, W - 1.4, 3.5, 1.15, null, { fg: '#262924' });
    // Small guide on the entry side, with the photographed loop/spine motif.
    B(-L / 2 + 7, y, 12.1, 2.6, 2.5, 0.14, 0xe5dfcb);
    S(["KIM'S FOOD STREET", '킴스클럽 가는 길 →', '식당가 안내'], -L / 2 + 7, y + 1.85, 12.2, 2.3, 0.85, '#eee8d5', { rotY: F.angle, fg: '#524835' });
    B(-L / 2 + 7, y + 0.75, 12.2, 2.0, 0.1, 0.04, 0x37443e, { solid: false });
    for (const du of [-0.8, 0, 0.8]) B(-L / 2 + 7 + du, y + 0.75, 12.2, 0.1, 0.45, 0.04, 0x37443e, { solid: false });
    for (let col = 0; col < 10; col++) for (let row = 0; row < 4; row++) {
      const u = -L / 2 + 1 + col * 0.44;
      B(u, y + 0.2 + row * 0.45, 1.2, 0.42, 0.43, 0.65, 0xb6b6ab);
      B(u + 0.12, y + 0.38 + row * 0.45, 1.55, 0.04, 0.08, 0.04, C.black, { solid: false });
    }
  });
}

function retail(F, number) {
  const { K, L, W, B, S, wall, person } = F;
  const names = number === 1 ? ['OLIVE YOUNG', '아웃도어', '우리은행'] : ['DESIGNERS', 'luxury gallery', 'Black&White', 'FRANGERIE', '하나은행'];
  const span = (L - 8) / names.length, depth = 12.5;
  for (let i = 0; i <= names.length; i++) { const u = -L / 2 + 4 + i * span; wall(u, 1, u, depth, 0, 3.45, { mat: 0xe6dfd3, thick: 0.12 }); }
  for (let u = -L / 2 + 15; u < L / 2 - 5; u += 14) B(u, 0, depth + 6, 0.62, 4.8, 0.62, 0xe4ddce);
  K.detail({ name: number + '관 1층 매장', floor: '1F', poly: F.p, y0: 0, y1: 5 }, () => {
    names.forEach((name, i) => {
      const u = -L / 2 + 4 + (i + 0.5) * span;
      S(name, u, 3, depth + 0.08, span - 1.2, 0.7, name === 'OLIVE YOUNG' ? '#678735' : '#303937', { rotY: F.angle });
      B(u, 0, depth - 1, Math.min(span - 2.4, 5), 0.92, 0.78, name.includes('은행') ? 0xd1d4cd : C.wood);
      for (const du of [-span * 0.27, span * 0.27]) {
        if (name.includes('은행')) {
          B(u + du, 0, 3, 1.3, 1.65, 0.72, 0xe7e6d9); B(u + du, 0.9, 3.38, 0.85, 0.5, 0.04, 0x284f65, { solid: false });
        } else if (name === 'OLIVE YOUNG' || name === 'FRANGERIE') {
          for (const v of [3.5, 7]) {
            B(u + du, 0, v, 1.1, 1.35, 2.5, 0xdfded0);
            for (let j = 0; j < 4; j++) for (let k = 0; k < 5; k++) B(u + du + (j % 2 ? 0.4 : -0.4), 0.25 + Math.floor(j / 2) * 0.55, v - 1 + k * 0.45, 0.14, 0.27, 0.16, [0xe0aa91, 0x8cab61, 0xe4d8ac, 0xbebcd3][k % 4], { solid: false });
          }
        } else {
          B(u + du, 0, 6.8, 0.06, 1.75, 2.8, 0x727a76, { solid: false });
          for (let j = 0; j < 8; j++) {
            B(u + du, 0.7, 5.6 + j * 0.34, 0.52, 0.8, 0.075, [0x444c54, 0xb7a88e, 0x71685e, 0xddddcd][j % 4], { solid: false });
            B(u + du, 1.5, 5.6 + j * 0.34, 0.3, 0.08, 0.025, 0x303937, { solid: false });
          }
        }
      }
      person(u + 0.9, 0, depth - 2.5, { shirt: 0x565b60 });
    });
    for (let u = -5; u < L / 2 - 5; u += 10) {
      B(u, 0, W - 6.5, 4.2, 0.78, 2, C.wood);
      for (let j = 0; j < 5; j++) B(u - 1.5 + j * 0.7, 0.78, W - 6.5, 0.5, 0.15, 0.55, 0xd5d1bb, { solid: false });
    }
    for (let u = -L / 2 + 4; u < L / 2 - 2; u += 6) for (const v of [5, 16, W - 2]) B(u, 4.25, v, 2.2, 0.08, 0.5, { tex: 'emit', color: 0xfff0cf }, { solid: false });
  });
}
function market(F) {
  const { K, L, W, B, S } = F, y = K.LEVELS.B1;
  K.detail({ name: '2관 킴스클럽 델리', floor: 'B1', poly: F.p, y0: y, y1: 0 }, () => {
    for (let u = -L / 2 + 5; u < L / 2 - 4; u += 5.8) for (const v of [6, 14, 22]) {
      B(u, y, v, 1.15, 1.45, 4.7, 0xdbd6c8);
      for (let yy = 0.2; yy < 1.4; yy += 0.38) {
        B(u, y + yy, v, 1.35, 0.04, 4.8, 0xc4c5bd, { solid: false });
        for (let k = -5; k <= 5; k++) for (const side of [-1, 1]) B(u + side * 0.52, y + yy + 0.05, v + k * 0.37, 0.23, 0.24, 0.23, [0xdab358, 0x698a60, 0xb95a43, 0xe5d9b0][(k + 5) % 4], { solid: false });
      }
    }
    S(["KIM'S CLUB", '킴스클럽 · 신선식품 · 델리'], 0, y + 3.2, W - 1, 12, 1.2, '#7c322d');
    for (let u = 0; u < L / 2 - 5; u += 5) B(u, y, W - 6, 2.8, 0.9, 1.25, 0x9caaa1);
    for (let u = -L / 2 + 4; u < L / 2 - 3; u += 6) for (const v of [7, 18, 28]) B(u, y + 3.5, v, 2.2, 0.08, 0.6, { tex: 'emit', color: 0xfff1d5 }, { solid: false });
  });
}

function kimsHall(F, ci) {
  const { K, L, W, B, S, Q, wall, person, cyl } = F;
  const names = ['CHAI797 Plus', 'CAFÉ MAMAS', 'STARBUCKS', '밀도', '백미당'], span = (L - 8) / names.length;
  names.forEach((name, i) => {
    const u = -L / 2 + 4 + (i + 0.5) * span;
    for (const du of [-span / 2, span / 2]) wall(u + du, 1.2, u + du, 10.3, 0, 4.2, { mat: 0xc7b99f, thick: 0.14 });
    wall(u - span / 2, 10.3, u + span / 2, 10.3, 0, 3.7, { mat: 'glass', thick: 0.08, openings: [{ at: span / 2, w: 2.2, y0: 0, y1: 2.8 }] });
    K.zone({ name, floor: '1F', sub: '뉴코아 3관', poly: Q(u - span / 2, 1, u + span / 2, 10.3), y0: 0, y1: 5.8, priority: 2 });
  });
  K.hpoly(C.black, F.p, 5.6, false, [ci.hole]);
  K.detail({ name: '3관 식당가와 킴스클럽', floor: '1F', poly: F.p, y0: 0, y1: 5.8 }, () => {
    names.forEach((name, i) => {
      const u = -L / 2 + 4 + (i + 0.5) * span;
      B(u, 3.1, 10.4, span - 0.1, 0.62, 0.2, 0x292d2c, { solid: false });
      S(name, u, 3.39, 10.55, span - 0.7, 0.48, null, { rotY: F.angle });
      for (const du of [-span / 2 + 0.1, span / 2 - 0.1, -1.16, 1.16]) B(u + du, 0, 10.45, 0.085, 3.1, 0.13, C.black);
      B(u, 0, 2.8, span - 1.6, 0.95, 1.2, i === 0 ? 0x5c4f40 : C.wood);
      for (const du of [-span * 0.24, span * 0.24]) table(F, u + du, 0, 6.6, i % 2 === 0);
      S(['차림표', name, '식사 · 음료'], u + 1.9, 1.25, 11.1, 0.8, 1.1, '#d7d0b4', { rotY: F.angle, fg: '#343a32' });
    });
    for (let u = -L / 2 + 2; u < L / 2 - 1; u += 4) {
      B(u, 5.1, W / 2, 0.14, 0.22, W - 0.5, C.metal, { solid: false });
      for (const v of [5, 13.6, 21]) cyl(u, 4.8, v, 0.12, 0.2, { tex: 'emit', color: 0xffecc8 });
    }
    B(0, 4.95, 13.8, L - 1, 0.26, 0.45, 0x5a6060, { solid: false });
    // Leave the entire north/rear stair and elevator lobby unfurnished.
    for (let u = -6; u < L / 2 - 3; u += 5.5) for (const v of [20.5, 26]) {
      B(u, 0, v, 3.5, 0.82, 1.8, C.wood);
      for (let j = 0; j < 6; j++) for (let k = 0; k < 3; k++) cyl(u - 1.3 + j * 0.5, 0.84, v - 0.55 + k * 0.5, 0.19, 0.17, [0x8fa55a, 0xc58642, 0xae4e38][k], 8);
    }
    S(["KIM'S CLUB", '킴스클럽'], 7, 3.1, W - 1, 10, 1, '#2e3c33');
    person(3, 0, 13.5, { shirt: 0x405b61 }); person(14, 0, 23.2, { shirt: 0x8b7265 });
  });
}
function parkingBlock(F) {
  const { K, L, W, B, S, P } = F;
  // OSM tags confirm parking, but deck count/height is an aerial estimate.
  const floors = [0, 3.2, 6.4, 9.6].map((y, i) => ({ label: (i + 1) + 'F', y, name: '주차장' }));
  core(F, floors, '뉴코아 주차동', 12.8);
  for (const f of floors) {
    const [x, z] = P(0, 0);
    K.polyWalls(F.p, f.y + 0.15, f.y + 1, { mat: 0xdedbd1, thick: 0.18, openings: f.y === 0 ? [{ x, z, w: 8, y0: 0, y1: 2.7 }] : [] });
    for (let u = -L / 2 + 1; u < L / 2; u += 5.7) for (const v of [0.5, W - 0.5]) B(u, f.y, v, 0.55, 3.2, 0.55, 'newcore-limestone');
    for (let v = 3; v < W - 2; v += 2.6) B(L / 2 - 3.6, f.y + 0.02, v, 5, 0.015, 0.1, 0xf4f0da, { solid: false });
    S(f.label + ' 주차장', 0, f.y + 2.6, -0.05, 6, 0.6, '#3d5661');
  }
  S('P  뉴코아 주차장', 0, 12, -0.18, 10, 1.1, '#365c7f');
  K.detail({ name: '주차동 차량', floor: '1F', poly: F.p, y0: 0, y1: 12.8 }, () => {
    for (const f of floors) for (const v of [8, 16, 24]) {
      const [x, z] = P(L / 2 - 4.2, v); K.vehicle({ x, y: f.y, z, rotY: F.angle + Math.PI / 2, color: v % 3 ? 0xd8d8ce : 0x46505d });
    }
  });
}
function streetObjects(K, F) {
  // City currently renders POI platforms with a five-digit ref, not this OSM
  // bus_stop node. Street lane markings/signals remain owned by the city.
  const { angle } = F, x = 250.47, z = -461.17, c = Math.cos(angle), s = Math.sin(angle);
  const B = (u, y, v, w, h, d, mat, extra = {}) => K.box({ x: x + c * u + s * v, y, z: z - s * u + c * v, w, h, d, rotY: angle, mat, ...extra });
  B(0, 2.68, 0, 7.4, 0.18, 2, C.black, { solid: false }); B(0, 0.1, 0.85, 7.1, 2.45, 0.06, 'glass');
  for (const u of [-3.5, 0, 3.5]) B(u, 0, 0.85, 0.08, 2.68, 0.1, C.black);
  B(0, 0.43, 0.45, 4.2, 0.08, 0.5, 0x8a8069); B(-3.35, 0.1, 0, 0.22, 2.45, 1.55, C.black);
  K.sign(['뉴코아아울렛', '버스 정류장'], { x: x - c * 3.5 - s * 0.8, y: 2.1, z: z + s * 3.5 - c * 0.8, w: 1.05, h: 0.65, rotY: angle + Math.PI, bg: '#2d688a', fg: '#ffffff' });
  K.sign(['노선 안내', '도착 정보'], { x: x - c * 3.35 - s * 0.82, y: 1.18, z: z + s * 3.35 - c * 0.82, w: 0.9, h: 0.86, rotY: angle + Math.PI, bg: '#dddccf', fg: '#303e43' });
  K.person(x + c, 0, z - s, { sit: true, shirt: 0x717b69 });
  K.person(x - c * 2 - s * 2, 0, z + s * 2 - c * 2, { shirt: 0x373f42 });
  const bx = 206.06, bz = -569.92;
  K.sign(['따릉이 2523', '뉴코아 킴스클럽 앞'], { x: bx, y: 2.1, z: bz, w: 2.3, h: 0.75, rotY: angle + Math.PI, bg: '#31866e', fg: '#ffffff', twoSided: true });
  K.cyl({ x: bx, y: 0, z: bz, r: 0.05, h: 1.75, mat: C.metal, seg: 8 });
  for (let i = 0; i < 8; i++) {
    const xx = bx + c * (i - 3.5) * 0.9, zz = bz - s * (i - 3.5) * 0.9;
    K.box({ x: xx, y: 0, z: zz, w: 0.12, h: 0.65, d: 0.12, mat: 0x97b7a5 });
    const p = (t, y) => [xx + s * t, y, zz + c * t], normal = [c, 0, -s];
    for (const t of [-0.58, 0.58]) for (let j = 0; j < 16; j++) {
      const a = j * Math.PI / 8, b = (j + 1) * Math.PI / 8, r = 0.32;
      K.quad(C.black, [p(t + Math.cos(a) * r, 0.35 + Math.sin(a) * r), p(t + Math.cos(b) * r, 0.35 + Math.sin(b) * r), p(t + Math.cos(b) * (r - 0.045), 0.35 + Math.sin(b) * (r - 0.045)), p(t + Math.cos(a) * (r - 0.045), 0.35 + Math.sin(a) * (r - 0.045))], normal);
    }
    const edge = (a, b) => K.quad(0x75b692, [p(a[0], a[1]), p(b[0], b[1]), p(b[0], b[1] + 0.045), p(a[0], a[1] + 0.045)], normal);
    for (const [a, b] of [[[-0.58, 0.35], [0, 0.32]], [[0, 0.32], [-0.2, 0.85]], [[-0.2, 0.85], [-0.58, 0.35]], [[-0.2, 0.85], [0.42, 0.88]], [[0.42, 0.88], [0, 0.32]], [[0.42, 0.88], [0.58, 0.35]]]) edge(a, b);
    const sp = p(-0.2, 0.85), hp = p(0.42, 1);
    K.box({ x: sp[0], y: sp[1], z: sp[2], w: 0.26, h: 0.05, d: 0.18, mat: C.black, solid: false });
    K.box({ x: hp[0], y: hp[1], z: hp[2], w: 0.45, h: 0.04, d: 0.05, rotY: angle, mat: C.metal, solid: false });
  }
}

export function build(K) {
  textures(K);
  const one = frame(K, 413372929), two = frame(K, 413372930), park = frame(K, 413372931), three = frame(K, 443718139);
  const labels1 = ['킴스 푸드 스트리트 · 킴스클럽', '아웃도어 · 화장품 · 우리은행', '여성 · 마담 · 란제리', '아동 · 유아휴게실', '모던하우스', '전문식당가 · 문화센터'];
  const labels2 = ['킴스클럽 · 델리', '수입명품 · 패션잡화', '컨템포러리 · 영캐주얼', '여성', '스포츠 · 캐주얼', '남성 · 골프'];
  const ys = [K.LEVELS.B1, 0, 5, 9.8, 14.2, 18.6], roof = 23;
  for (const [F, num, labels] of [[one, 1, labels1], [two, 2, labels2]]) {
    const floors = ys.map((y, i) => ({ label: i ? i + 'F' : 'B1', y, name: labels[i] }));
    const ci = core(F, floors, '뉴코아아울렛 ' + num + '관', roof);
    streetFront(F, num, roof);
    K.polyWalls(F.p, K.LEVELS.B1, 0, { mat: 0xc8c3b9, inner: 0xe1d8c7, thick: 0.25 });
    retail(F, num);
    if (num === 1) { foodRoom(F, ci); southEnd(F, roof); } else market(F);
    // User requested upper floors as simple slabs/facade. Circulation remains
    // reachable on foot and by elevator; only verified category signs added.
    for (let i = 2; i < floors.length; i++) K.detail({ name: num + '관 ' + floors[i].label, floor: floors[i].label, poly: F.p, y0: floors[i].y, y1: floors[i].y + 4.5 }, () => {
      for (let u = -F.L / 2 + 5; u < F.L / 2 - 3; u += 8) for (const v of [7, F.W / 2]) F.B(u, floors[i].y + 3.8, v, 2.4, 0.07, 0.45, { tex: 'emit', color: 0xffedc5 }, { solid: false });
      F.S(labels[i], 8, floors[i].y + 2.7, F.W - 1, 11, 0.8, '#66685c');
    });
  }
  parkingBlock(park);
  const tc = core(three, [{ label: '1F', y: 0, name: '킴스클럽 · 식당가' }, { label: '옥상', y: 10.8, name: '옥상 주차장' }], '뉴코아 3관', 10.8);
  streetFront(three, 3, 10.8); kimsHall(three, tc);
  K.polyWalls(three.p, 10.8, 11.65, { mat: C.cream, thick: 0.2 });
  for (let u = -3; u < three.L / 2 - 3; u += 2.6) three.B(u, 10.82, 20, 0.1, 0.015, 5, 0xf4f1db, { solid: false });
  streetObjects(K, two);
  const spawn = (F, name, u, y, v, yaw = F.angle + Math.PI) => { const [x, z] = F.P(u, v); K.spawn({ name, x, y, z, yaw }); };
  spawn(one, '뉴코아 1관 정문', 12, 0, -5.8);
  spawn(one, '뉴코아 1관 화장품·아웃도어', 4, 0, 16.5, one.angle);
  spawn(one, '킴스 푸드 스트리트', -20, K.LEVELS.B1, 15, one.angle - Math.PI / 2);
  spawn(one, '솥내음 앞', -6, K.LEVELS.B1, 14.7, one.angle + Math.PI);
  spawn(two, '뉴코아 2관 DESIGNERS', -10, 0, -7);
  spawn(two, '뉴코아 2관 킴스클럽', -8, K.LEVELS.B1, 17.8, two.angle - Math.PI / 2);
  spawn(three, '뉴코아 3관 킴스클럽', 2, 0, -5.8);
  spawn(three, '차이797 앞 복도', -20.41, 0, 13.6, three.angle + Math.PI);
  K.spawn({ name: '뉴코아 로드뷰 정면', x: 257, y: 0, z: -474, yaw: 113 * Math.PI / 180 });
  K.spawn({ name: '잠원로 신반포자이 방향', x: 257, y: 0, z: -474, yaw: 293 * Math.PI / 180 });
  K.spawn({ name: '뉴코아 킴스클럽 앞 따릉이', x: 209.8, y: 0, z: -570, yaw: 113 * Math.PI / 180 });
}
