// 강남터미널 지하도상가 (GOTO MALL 고투몰) — B1 under 신반포로, on the real OSM polygon 1354860678.
// Layout: two parallel corridors, four shop lines A (north outer) · B / C (central back-to-back) · D (south outer),
// 서편 푸드코트 (west bulge under the 고가), 3호선 개찰구 홀 (G7, well W3), 9호선 개찰구 홀 (well W9) with the
// planted rest area, 동편 푸드코트 at the 잠원로 end, street gates (subway exits 1·8·8-1·8-2 + GOTO MALL G-gates).
// All layout is done in a local frame: u = along the mall (east), v = across (south). See research json for sources.
export const meta = {
  id: 'gotomall',
  name: '강남터미널 지하도상가 (고투몰)',
  claims: [1354860678],
  sources: [
    'https://sisul.or.kr/open_content/undershop/guide/terminal/gangnam.jsp',
    'https://ko.wikipedia.org/wiki/강남터미널지하도상가',
    'https://gotomall.kr/',
    'https://rurubu.jp/andmore/article/25097',
    'https://creatrip.com/en/blog/1665',
    'https://www.localnaeil.com/News/View/641446/10',
    'https://mediahub.seoul.go.kr/archives/2016771',
    'https://www.koreatodo.com/express-bus-terminal-shopping',
    'https://blog.naver.com/s9917104/224463975835',
  ],
};

// ---------- local frame ----------
const SL = Math.hypot(1, 0.3745);
const DU = [1 / SL, -0.3745 / SL];          // +u : along the mall toward 잠원로 (east-north-east)
const DV = [-DU[1], DU[0]];                  // +v : across, toward the terminal side (south-south-east)
const O = [0, -126.3];
const ROT = Math.atan2(-DU[1], DU[0]);       // box rotY whose local x = +u, local z = +v
const FACE = { '+v': ROT, '-v': ROT + Math.PI, '+u': ROT + Math.PI / 2, '-u': ROT - Math.PI / 2 };
const P = (u, v) => [O[0] + DU[0] * u + DV[0] * v, O[1] + DU[1] * u + DV[1] * v];
const UV = (x, z) => [(x - O[0]) * DU[0] + (z - O[1]) * DU[1], (x - O[0]) * DV[0] + (z - O[1]) * DV[1]];
const R = (u0, v0, u1, v1) => [P(u0, v0), P(u1, v0), P(u1, v1), P(u0, v1)];
const RUV = (u0, v0, u1, v1) => [[u0, v0], [u1, v0], [u1, v1], [u0, v1]];
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const yawOf = (du, dv) => { const dx = DU[0] * du + DV[0] * dv, dz = DU[1] * du + DV[1] * dv; return Math.atan2(-dx, -dz); };

// ---------- vertical ----------
const FL = -6;        // K.LEVELS.B1
const CY = -2.2;      // ceiling underside
const AY = -2.75;     // photo 01/19: 3.25 m aisle soffit; halls retain 3.8 m
const FY = -3.35;     // open shop lintel, 2.65 m above B1
const GRID0 = -320.8, GRID = 8.398, NB = 82; // column grid / bays along u (main section)

// ---------- shop categories ----------
const CAT = {
  women:   { label: '여성의류', bg: '#34313a', fx: 'clothes' },
  men:     { label: '남성의류', bg: '#2b3a4c', fx: 'clothes' },
  kids:    { label: '아동복', bg: '#3f78ad', fx: 'clothes' },
  shoes:   { label: '구두·신발', bg: '#5a3f2e', fx: 'shoes' },
  bags:    { label: '가방·잡화', bg: '#6a4d39', fx: 'bags' },
  acc:     { label: '액세서리', bg: '#7d4f6e', fx: 'acc' },
  socks:   { label: '양말·스타킹', bg: '#45634f', fx: 'socks' },
  hats:    { label: '모자·스카프', bg: '#6f6244', fx: 'hats' },
  cosme:   { label: '화장품', bg: '#f7f5f2', fg: '#2a2a2a', fx: 'cosme' },
  lens:    { label: '안경·렌즈', bg: '#f7f5f2', fg: '#1e6fb0', fx: 'cosme' },
  phone:   { label: '휴대폰 액세서리', bg: '#2d4b68', fx: 'phone' },
  bedding: { label: '침구·이불', bg: '#5f7590', fx: 'bedding' },
  dishes:  { label: '그릇·주방용품', bg: '#56683a', fx: 'dishes' },
  deco:    { label: '인테리어 소품', bg: '#86683f', fx: 'deco' },
  frames:  { label: '그림·액자', bg: '#6b5747', fx: 'frames' },
  flowers: { label: '조화·꽃', bg: '#4f7a36', fx: 'flowers' },
  curtain: { label: '커튼·쿠션', bg: '#77586b', fx: 'curtain' },
  souvenir:{ label: '전통소품·기념품', bg: '#8a2c2c', fx: 'deco' },
  repair:  { label: '옷수선', bg: '#4c4c4c', fx: 'repair' },
  snack:   { label: '분식', bg: '#c0392b', fx: 'food', menu: ['떡볶이 · 순대 · 튀김', '어묵 · 김밥'] },
  office:  { label: '고투몰 관리사무소', bg: '#1f3b5a', fx: 'office' },
};
const POOL = {
  west: [['deco', 14], ['bedding', 14], ['dishes', 12], ['flowers', 10], ['frames', 8], ['curtain', 8], ['women', 16], ['souvenir', 6], ['acc', 4], ['bags', 4], ['repair', 2]],
  flower: [['flowers', 62], ['deco', 16], ['frames', 10], ['curtain', 12]],
  center: [['women', 22], ['acc', 16], ['cosme', 10], ['bags', 8], ['phone', 9], ['socks', 8], ['shoes', 8], ['hats', 7], ['snack', 3]],
  east: [['women', 44], ['shoes', 10], ['bags', 9], ['acc', 11], ['socks', 6], ['hats', 5], ['men', 7], ['kids', 3], ['cosme', 2], ['phone', 2], ['repair', 1]],
};
// real tenants (research) placed by line + u (store-number letters A–D = 4 lines, per 2019 기사 C-083 / D-142)
const NAMED = [
  { row: 'A', u: -56, name: '프랭크버거', sub: '반포고투몰점', fx: 'food', bg: '#d62b1f', fg: '#fff', menu: ['프랭크버거 · 치즈버거', '감자튀김 · 음료'] },
  { row: 'D', u: -38, name: '슈퍼몬스터', sub: '반포고투몰점', fx: 'food', bg: '#2c2c2c', fg: '#9be15d', menu: ['식사 · 음료'] },
  { row: 'B', u: -47, name: '토니모리', sub: 'TONYMOLY', fx: 'cosme', bg: '#171717', fg: '#ff5c93', glass: true },
  { row: 'C', u: -47, name: '더페이스샵', sub: 'THE FACE SHOP', fx: 'cosme', bg: '#ffffff', fg: '#2f5d3c', glass: true },
  { row: 'B', u: -30, name: '오렌즈', sub: 'O-LENS 컬러렌즈', fx: 'cosme', bg: '#ffffff', fg: '#1f86c9', glass: true },
  { row: 'C', u: -22, name: '빽다방', sub: "PAIK'S COFFEE · 반포 GOTO MALL점 · T102", fx: 'cafe', bg: '#ffd21f', fg: '#1d2a5b', menu: ['아메리카노 · 앗!메리카노', '빽스치노 · 라떼 · 에이드'] },
  { row: 'D', u: 112, name: '인사동칼국수만두', sub: '경부선 터미널 연결통로 앞', fx: 'food', bg: '#6b3a1e', fg: '#fff3d6', menu: ['칼국수 · 만두', '비빔국수 · 만둣국'] },
  // Names visible in 2026 photos; exact units are not identified by the photographer.
  { row: 'D', u: -57, name: 'EDIYA COFFEE', fx: 'cafe', bg: '#153778', fg: '#fff', menu: ['커피 · 음료'], small: true },
  { row: 'A', u: 184, name: 'Bazaar', fx: 'clothes', bg: '#242526', fg: '#fff', small: true },
  { row: 'C', u: 203, name: 'Monologue', fx: 'clothes', bg: '#242526', fg: '#fff', small: true },
];

// GOTO MALL gates + subway exits. top = street-level entrance point (uv), a = descent direction (uv unit).
// side = which band edge the gate serves. Positions of OSM exits 1 / 8 / 8-1 / 8-2 are real; G-gate positions are
// placed on free sidewalk in the order of the Wikipedia G1–G16 list (guess, see research json).
const EXITS = [
  { id: 'G2', side: 'N', u: -316, a: [1, 0], kind: 'mall', dest: '경남아파트 · 한신3차' },
  { id: 'G4', side: 'N', u: -272, a: [1, 0], kind: 'mall', dest: '반포쇼핑타운 1·2동 · 한신6차' },
  { id: 'G5', side: 'S', u: -248, a: [1, 0], kind: 'mall', dest: '센트럴시티 · 신세계면세점 · 호남선' },
  { id: 'G6', side: 'N', u: -206, a: [1, 0], kind: 'mall', dest: '반포쇼핑타운 2·3동 · 한신6차' },
  { id: '8-1', side: 'N', u: -97.3, a: [1, 0], kind: 'metro', gate: 'G8-1', dest: '반포쇼핑타운 3동 · 9호선', elevator: true },
  { id: '8', side: 'S', top: [-64.3, 20.0], a: [1, 0], kind: 'metro', dest: '신세계백화점 · 센트럴시티' },
  { id: '8-2', side: 'N', u: -29.0, a: [1, 0], kind: 'metro', gate: 'G8-2', dest: '반포쇼핑타운 4동 · 신반포로23길', wheelchairLift: false },
  { id: '1', side: 'S', top: [40.9, 37.3], a: [0, -1], kind: 'metro', gate: 'G9', dest: '경부선 터미널 · 반포지구대' },
  { id: 'G10', side: 'N', u: 60, a: [1, 0], kind: 'mall', dest: '한신4차 · 반포쇼핑타운 5동' },
  { id: 'G11', side: 'N', u: 96, a: [1, 0], kind: 'mall', dest: '올에이수입상가 · 반포쇼핑타운 6동' },
  { id: 'G12', side: 'N', u: 136, a: [1, 0], kind: 'mall', dest: '한신4차 · 반포쇼핑타운 6·7동' },
  { id: 'G13', side: 'S', u: 248, a: [0, -1], kind: 'mall', dest: '삼호가든 · 경부선 터미널 동측' },
  { id: 'G15', side: 'S', u: 314, a: [0, -1], kind: 'mall', dest: '반포자이 · 잠원로' },
];
const LINE = { 3: '#EF7C1C', 7: '#747F00', 9: '#BDB092' };

export function build(K) {
  const band = K.osmBuilding(1354860678)[0].poly;
  const bandUV = band.map(p => UV(p[0], p[1]));
  const rnd = K.rand(20261106);
  const pick = (pool, r) => { let t = 0; for (const [, w] of pool) t += w; let x = r * t; for (const [k, w] of pool) { x -= w; if (x <= 0) return k; } return pool[0][0]; };

  // ---------- geometry helpers ----------
  const bx = (u0, u1, v0, v1, y, h, mat, o = {}) => K.box({ x: P((u0 + u1) / 2, (v0 + v1) / 2)[0], z: P((u0 + u1) / 2, (v0 + v1) / 2)[1], y, h, w: Math.abs(u1 - u0), d: Math.abs(v1 - v0), rotY: ROT, mat, skip: o.skip ?? ['bottom'], ...o });
  const wl = (u0, v0, u1, v1, y0, y1, o = {}) => { const a = P(u0, v0), b = P(u1, v1); K.wall(a[0], a[1], b[0], b[1], y0, y1, o); };
  // wall along u at v: plusV = material seen from +v side
  const wallU = (u0, u1, v, y0, y1, o = {}) => wl(Math.min(u0, u1), v, Math.max(u0, u1), v, y0, y1, { ...o, mat: o.plusV ?? o.mat, mat2: o.minusV ?? o.mat });
  const wallV = (u, v0, v1, y0, y1, o = {}) => wl(u, Math.min(v0, v1), u, Math.max(v0, v1), y0, y1, { ...o, mat: o.minusU ?? o.mat, mat2: o.plusU ?? o.mat });
  // tall signs are queued and drawn together at the end so the atlas shelf packer does not waste rows
  const tallSigns = [];
  const sg = (text, u, v, y, w, h, face, o = {}) => { const [x, z] = P(u, v); const opt = { x, z, y, w, h, rotY: FACE[face], pxPerM: 80, ...o }; if (h * opt.pxPerM > 50) tallSigns.push([text, opt]); else K.sign(text, opt); };
  const fq = (mat, u0, v0, u1, v1, y, up = true) => K.quad(mat, R(u0, v0, u1, v1).map(([x, z]) => [x, y, z]), [0, up ? 1 : -1, 0]);
  const vq = (mat, u0, v0, u1, v1, y0, y1, face) => { // vertical quad facing `face`
    const a = P(u0, v0), b = P(u1, v1); const n = { '+u': DU, '-u': [-DU[0], -DU[1]], '+v': DV, '-v': [-DV[0], -DV[1]] }[face];
    K.quad(mat, [[a[0], y0, a[1]], [b[0], y0, b[1]], [b[0], y1, b[1]], [a[0], y1, a[1]]], [n[0], 0, n[1]]);
  };
  const ptsXZ = (uvPoly) => uvPoly.map(([u, v]) => P(u, v));
  const xzRectUV = (x0, z0, x1, z1) => [UV(x0, z0), UV(x1, z0), UV(x1, z1), UV(x0, z1)];
  const railXZ = (ax, az, bx2, bz, y = FL) => { // glass railing with steel top rail
    K.wall(ax, az, bx2, bz, y, y + 1.05, { mat: 'glass', thick: 0.03 });
    const L = Math.hypot(bx2 - ax, bz - az), r = Math.atan2(-(bz - az), bx2 - ax);
    K.box({ x: (ax + bx2) / 2, z: (az + bz) / 2, y: y + 1.05, w: L, h: 0.06, d: 0.07, rotY: r, mat: 0x9aa1a8, solid: false, skip: ['bottom'] });
  };

  function edgesAt(u) { const vs = []; for (let i = 0; i < bandUV.length; i++) { const a = bandUV[i], b = bandUV[(i + 1) % bandUV.length]; if ((a[0] <= u) !== (b[0] <= u)) { const t = (u - a[0]) / (b[0] - a[0]); vs.push(a[1] + t * (b[1] - a[1])); } } return vs.sort((p, q) => p - q); }
  function edgesAtV(v) { const us = []; for (let i = 0; i < bandUV.length; i++) { const a = bandUV[i], b = bandUV[(i + 1) % bandUV.length]; if ((a[1] <= v) !== (b[1] <= v)) { const t = (v - a[1]) / (b[1] - a[1]); us.push(a[0] + t * (b[0] - a[0])); } } return us.sort((p, q) => p - q); }
  const vN = u => edgesAt(u)[0];
  const vS = u => { const e = edgesAt(u); return e[e.length - 1]; };
  function lay(u) { const n = vN(u), s = vS(u), mid = (n + s) / 2, half = (s - n) / 2; const cw = clamp(half - 3.4 - 4.6, 5.0, 6.0); const dO = half - 3.4 - cw; return { n, s, mid, cw, dO, fA: n + dO, fB: mid - 3.4, fC: mid + 3.4, fD: s - dO }; }

  // ---------- textures ----------
  const lcg = (s => () => (s = (s * 16807) % 2147483647) / 2147483647);
  const tx = (key, w, h, scale, draw) => K.texture(key, w, h, (g, W, H) => draw(g, W, H, lcg(key.length * 7919 + 13)), scale);
  const hsl = (h, s, l) => `hsl(${h | 0},${s | 0}%,${l | 0}%)`;
  tx('gt_floor', 256, 256, [1.2, 1.2], (g, W, H, r) => {
    g.fillStyle = '#8a8a85'; g.fillRect(0, 0, W, H);
    for (let i = 0; i < 14000; i++) { const v = 44 + r() * 170 | 0; g.fillStyle = `rgba(${v},${v},${v - 5},0.65)`; g.fillRect(r() * W, r() * H, 0.6 + r() * 1.7, 0.6 + r() * 1.4); }
    g.fillStyle = 'rgba(239,239,229,0.06)'; g.fillRect(0, 0, W / 2, H / 2); g.fillRect(W / 2, H / 2, W / 2, H / 2);
    g.fillStyle = '#646662'; for (const p of [0, W / 2]) { g.fillRect(p, 0, 0.7, H); g.fillRect(0, p, W, 0.7); }
  });
  tx('gt_apparel_floor', 256, 256, [1.2, 1.2], (g, W, H, r) => {
    g.fillStyle = '#b59a7c'; g.fillRect(0, 0, W, H);
    for (let i = 0; i < 9500; i++) { const v = 60 + r() * 130 | 0; g.fillStyle = `rgba(${v + 23},${v + 9},${v},0.35)`; g.fillRect(r() * W, r() * H, 1, 1.5); }
    g.fillStyle = '#8d7a65'; for (const p of [0, W / 2]) { g.fillRect(p, 0, 0.8, H); g.fillRect(0, p, W, 0.8); }
  });
  tx('gt_column', 128, 256, [0.9, 1.8], (g, W, H, r) => {
    g.fillStyle = '#d9c7a3'; g.fillRect(0, 0, W, H);
    for (let i = 0; i < 1800; i++) { g.fillStyle = r() < 0.5 ? '#cbb997' : '#dfcfaf'; g.fillRect(r() * W, r() * H, 1 + r() * 4, 1); }
    g.fillStyle = '#ab9c82'; for (let y = 0; y < H; y += H / 3) g.fillRect(0, y, W, 1);
  });
  tx('gt_ceil', 256, 256, [1.2, 1.2], (g, W, H, r) => {
    g.fillStyle = '#eeeae1'; g.fillRect(0, 0, W, H);
    for (let i = 0; i < 200; i++) { g.fillStyle = 'rgba(0,0,0,0.025)'; g.fillRect(r() * W, r() * H, 3, 3); }
  });
  tx('gt_wall', 128, 256, [1.2, 2.4], (g, W, H, r) => {
    g.fillStyle = '#ece6dc'; g.fillRect(0, 0, W, H);
    for (let i = 0; i < 160; i++) { g.fillStyle = 'rgba(120,100,80,0.05)'; g.fillRect(r() * W, r() * H, 4, 2); }
    g.fillStyle = '#d3cabb'; g.fillRect(0, 0, W, 2); g.fillRect(0, H / 2, W, 2); g.fillRect(0, 0, 2, H);
  });
  tx('gt_clothes', 256, 128, [1.0, 1.15], (g, W, H, r) => {
    g.fillStyle = '#e9e6e0'; g.fillRect(0, 0, W, H); g.fillStyle = '#8a8f96'; g.fillRect(0, 4, W, 4);
    let x = 0; while (x < W) { const w = 5 + r() * 9; const hue = r() < 0.35 ? 0 : r() * 360, sat = hue ? 30 + r() * 50 : 0, lit = hue ? 35 + r() * 45 : 15 + r() * 75; g.fillStyle = hsl(hue, sat, lit); const len = H * (0.55 + r() * 0.42); g.fillRect(x, 10, w - 1, len); g.fillStyle = 'rgba(0,0,0,0.18)'; g.fillRect(x + w - 2, 10, 1, len); x += w; }
  });
  tx('gt_folded', 128, 256, [1.0, 2.0], (g, W, H, r) => {
    g.fillStyle = '#f2efe9'; g.fillRect(0, 0, W, H);
    for (let s = 0; s < 4; s++) { const y0 = s * H / 4; g.fillStyle = '#c9c2b6'; g.fillRect(0, y0 + H / 4 - 6, W, 6); for (let k = 0; k < 4; k++) { const hue = r() * 360; for (let j = 0; j < 5; j++) { g.fillStyle = hsl(hue, 25 + r() * 40, 40 + r() * 40); g.fillRect(4 + k * W / 4, y0 + H / 4 - 12 - j * 7, W / 4 - 8, 6); } } }
  });
  tx('gt_shoes', 128, 256, [1.0, 2.2], (g, W, H, r) => {
    g.fillStyle = '#f3f1ec'; g.fillRect(0, 0, W, H);
    for (let s = 0; s < 6; s++) { const y = s * H / 6; g.fillStyle = '#b9b2a6'; g.fillRect(0, y + H / 6 - 4, W, 4); for (let k = 0; k < 3; k++) { g.fillStyle = r() < 0.4 ? hsl(25, 40, 15 + r() * 30) : hsl(r() * 360, 30 + r() * 40, 35 + r() * 40); g.fillRect(6 + k * W / 3, y + H / 6 - 16, W / 3 - 14, 12); g.fillRect(6 + k * W / 3, y + H / 6 - 24, 10, 10); } }
  });
  tx('gt_bags', 128, 256, [1.1, 2.2], (g, W, H, r) => {
    g.fillStyle = '#efe9df'; g.fillRect(0, 0, W, H);
    for (let s = 0; s < 4; s++) { const y = s * H / 4; g.fillStyle = '#bdb3a3'; g.fillRect(0, y + H / 4 - 4, W, 4); for (let k = 0; k < 2; k++) { g.fillStyle = r() < 0.5 ? hsl(25, 45, 18 + r() * 25) : hsl(r() * 360, 40, 30 + r() * 35); const bw = W / 2 - 14, bh = 26 + r() * 14; g.fillRect(7 + k * W / 2, y + H / 4 - 4 - bh, bw, bh); g.strokeStyle = 'rgba(0,0,0,0.5)'; g.lineWidth = 2; g.strokeRect(14 + k * W / 2, y + H / 4 - 12 - bh, bw - 14, 10); } }
  });
  tx('gt_acc', 128, 256, [1.0, 2.0], (g, W, H, r) => {
    g.fillStyle = '#2b2b2f'; g.fillRect(0, 0, W, H); g.fillStyle = '#3a3a40'; for (let y = 0; y < H; y += 8) for (let x = 0; x < W; x += 8) g.fillRect(x + 3, y + 3, 2, 2);
    for (let i = 0; i < 90; i++) { g.fillStyle = r() < 0.5 ? '#e8d27a' : hsl(r() * 360, 60, 70); const x = r() * W, y = r() * H; g.fillRect(x, y, 2, 6 + r() * 8); g.fillRect(x - 2, y + 8, 6, 4); }
  });
  tx('gt_cosme', 128, 256, [1.0, 2.0], (g, W, H, r) => {
    g.fillStyle = '#fbfaf8'; g.fillRect(0, 0, W, H);
    for (let s = 0; s < 6; s++) { const y = s * H / 6; g.fillStyle = '#dad6cf'; g.fillRect(0, y + H / 6 - 3, W, 3); let x = 3; while (x < W - 6) { const w = 5 + r() * 7; g.fillStyle = hsl(r() * 360, 30 + r() * 50, 50 + r() * 40); const h = 10 + r() * 20; g.fillRect(x, y + H / 6 - 3 - h, w - 1, h); x += w; } }
  });
  tx('gt_bedding', 128, 128, [1.0, 1.0], (g, W, H, r) => {
    g.fillStyle = '#e8e2d8'; g.fillRect(0, 0, W, H); let y = 0; while (y < H) { const h = 7 + r() * 9; g.fillStyle = hsl(r() * 360, 15 + r() * 35, 60 + r() * 30); g.fillRect(0, y, W, h - 1); g.fillStyle = 'rgba(0,0,0,0.12)'; g.fillRect(0, y + h - 2, W, 1); y += h; }
  });
  tx('gt_dishes', 128, 256, [1.0, 2.0], (g, W, H, r) => {
    g.fillStyle = '#f2efe8'; g.fillRect(0, 0, W, H);
    for (let s = 0; s < 5; s++) { const y = s * H / 5; g.fillStyle = '#a99f8f'; g.fillRect(0, y + H / 5 - 4, W, 4); for (let k = 0; k < 4; k++) { g.fillStyle = r() < 0.5 ? '#fdfdfb' : hsl(r() * 360, 30, 70); g.beginPath(); g.arc(16 + k * 31, y + H / 5 - 18, 12, 0, 6.3); g.fill(); g.strokeStyle = hsl(r() * 360, 50, 45); g.lineWidth = 2; g.stroke(); } }
  });
  tx('gt_frames', 256, 256, [1.6, 2.0], (g, W, H, r) => {
    g.fillStyle = '#eee8de'; g.fillRect(0, 0, W, H);
    for (let i = 0; i < 9; i++) { const w = 40 + r() * 50, h = 40 + r() * 60, x = r() * (W - w), y = r() * (H - h); g.fillStyle = r() < 0.5 ? '#3a2c20' : '#c9a85a'; g.fillRect(x, y, w, h); const gr = g.createLinearGradient(x, y, x + w, y + h); gr.addColorStop(0, hsl(r() * 360, 40, 55)); gr.addColorStop(1, hsl(r() * 360, 50, 35)); g.fillStyle = gr; g.fillRect(x + 5, y + 5, w - 10, h - 10); }
  });
  tx('gt_flowers', 128, 128, [0.9, 0.9], (g, W, H, r) => {
    g.fillStyle = '#3f6b2c'; g.fillRect(0, 0, W, H);
    for (let i = 0; i < 160; i++) { g.fillStyle = r() < 0.3 ? hsl(100 + r() * 40, 50, 30 + r() * 20) : hsl([350, 330, 50, 280, 20, 0, 200][(r() * 7) | 0], 70, 55 + r() * 30); g.beginPath(); g.arc(r() * W, r() * H, 3 + r() * 6, 0, 6.3); g.fill(); }
  });
  tx('gt_curtain', 128, 128, [1.2, 2.4], (g, W, H, r) => {
    let x = 0; while (x < W) { const w = 16 + r() * 22, hue = r() * 360; for (let i = 0; i < w; i++) { g.fillStyle = hsl(hue, 25, 45 + 20 * Math.sin(i / w * 6.28 * 2)); g.fillRect(x + i, 0, 1, H); } x += w; }
  });
  tx('gt_pegs', 128, 256, [1.0, 2.0], (g, W, H, r) => {
    g.fillStyle = '#efece6'; g.fillRect(0, 0, W, H);
    for (let y = 10; y < H; y += 32) for (let x = 6; x < W; x += 20) { g.fillStyle = '#999'; g.fillRect(x + 6, y, 2, 4); g.fillStyle = hsl(r() * 360, 40 + r() * 40, 35 + r() * 45); g.fillRect(x, y + 4, 14, 22); }
  });
  tx('gt_locker', 128, 128, [1.2, 1.2], (g, W, H) => {
    g.fillStyle = '#c7ccd2'; g.fillRect(0, 0, W, H); g.strokeStyle = '#7d858e'; g.lineWidth = 2;
    for (let y = 0; y < H; y += 32) for (let x = 0; x < W; x += 32) { g.strokeRect(x + 1, y + 1, 30, 30); g.fillStyle = '#2f3a46'; g.fillRect(x + 22, y + 12, 4, 8); }
  });
  tx('gt_ad', 128, 256, [1.0, 2.0], (g, W, H, r) => {
    const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, hsl(r() * 360, 50, 70)); gr.addColorStop(1, hsl(r() * 360, 50, 45)); g.fillStyle = gr; g.fillRect(0, 0, W, H);
    g.fillStyle = 'rgba(255,255,255,0.85)'; g.fillRect(14, H * 0.62, W - 28, 10); g.fillRect(14, H * 0.70, W - 50, 8);
  });

  // ---------- materials ----------
  // ceiling: unlit so the white panels read bright underground (Lambert faces pointing down get only ground light)
  K.material('gt_ceil_u', new K.THREE.MeshBasicMaterial({ map: K.T.custom('gt_ceil').tex, color: 0xdedcd6 }));
  K.material('gt_stone_polished', new K.THREE.MeshPhongMaterial({ map: K.T.custom('gt_floor').tex, shininess: 42, specular: 0x3c403e }));
  K.material('gt_apparel_polished', new K.THREE.MeshPhongMaterial({ map: K.T.custom('gt_apparel_floor').tex, shininess: 35, specular: 0x44382a }));
  K.material('gt_soffit', new K.THREE.MeshBasicMaterial({ color: 0x77716b }));
  // bp_01: pale frosted lift glazing, much less transparent than the stair canopy.
  K.material('gt_lift_glass', new K.THREE.MeshLambertMaterial({ color: 0xc9d4d1, transparent: true, opacity: 0.78, depthWrite: false, side: K.THREE.DoubleSide }));
  K.material('gt_canopy_collision', new K.THREE.MeshBasicMaterial({ visible: false }));
  const M = {
    floor: { tex: 'gt_stone_polished', scale: [1.2, 1.2] }, apparelFloor: { tex: 'gt_apparel_polished', scale: [1.2, 1.2] }, darkStone: { tex: 'gt_floor', color: 0x464943 }, ceil: { tex: 'gt_ceil_u', scale: [1.2, 1.2] }, wall: { tex: 'gt_wall' }, fascia: 0xc9c1b5, part: 0xece8e1,
    col: { tex: 'gt_column' }, spine: 0xe9e4dc, led: { tex: 'emit', color: 0xf2f5f4 }, ledWarm: { tex: 'emit', color: 0xffe5b8 },
    steel: 0xb9bec4, dark: 0x2f3337, wood: { tex: 'wood', color: 0xc8a27a }, granite: { tex: 'marble', color: 0xa9a59f },
  };

  // Downlights and oval coves traced from 01/14/16/19. All are merged geometry.
  const ellipse = (u, v, ru, rv, seg = 24) => Array.from({ length: seg }, (_, i) => P(u + Math.cos(i * Math.PI * 2 / seg) * ru, v + Math.sin(i * Math.PI * 2 / seg) * rv));
  function downlight(u, v, y = AY, warm = true) {
    K.hpoly(0xb9b4aa, ellipse(u, v, 0.135, 0.135, 8), y - 0.014, false);
    K.hpoly(warm ? M.ledWarm : M.led, ellipse(u, v, 0.10, 0.10, 8), y - 0.019, false);
  }
  function ovalCove(u, v, ru = 2.45, rv = 1.35, y = AY) {
    K.prism(ellipse(u, v, ru + 0.13, rv + 0.13), y - 0.09, y + 0.04, { mat: 0xc4beb5, holes: [ellipse(u, v, ru, rv)], solid: false, top: false });
    K.hpoly({ tex: 'emit', color: 0xe0edf1 }, ellipse(u, v, ru, rv), y + 0.025, false);
  }
  function panelCove(u, v, w, d, y = CY) {
    bx(u - w / 2, u + w / 2, v - d / 2, v + d / 2, y - 0.12, 0.12, 0xd2ccc1, { solid: false, skip: ['top'] });
    fq(M.led, u - w / 2 + 0.13, v - d / 2 + 0.13, u + w / 2 - 0.13, v + d / 2 - 0.13, y - 0.125, false);
  }

  // ---------- keep-outs (uv polygons where shop lines must not be) ----------
  const keep = [];
  const addKeep = (poly, tag) => keep.push({ poly, bb: K.polyBBox(poly), tag });
  const W3 = [-82, -104, -76, -90], W9 = [0, -136, 30, -128];
  addKeep(xzRectUV(-83.5, -105.5, -74.5, -88.5), 'W3');
  addKeep(xzRectUV(-88.5, -113, -71, -103), 'W3gates');
  addKeep(xzRectUV(-1.5, -137.5, 31.5, -126.5), 'W9');
  addKeep(xzRectUV(-8.5, -142, 1.5, -121), 'W9gates');
  addKeep(RUV(-102.4, -16, -68.6, -7), 'l3hall');      // 3호선 hall: open north side (ticket machines, gates)
  addKeep(RUV(-2.6, 1.0, 26.5, 20), 'garden');         // 중앙 식물 휴게공간 south of W9
  addKeep(RUV(-92, 4, -70, 14), 'l3south');            // keep a wide walkway south of the 3호선 well
  addKeep(RUV(-6, -14, 24, -7.0), 'l9north');          // keep the walkway north of the 9호선 well open
  function blocked(u, v0, v1) {
    const lo = Math.min(v0, v1), hi = Math.max(v0, v1);
    for (const k of keep) {
      if (u < k.bb[0] || u > k.bb[2] || hi < k.bb[1] || lo > k.bb[3]) continue;
      for (let v = lo + 0.05; v <= hi; v += 0.35) if (K.pointInPoly(u, v, k.poly)) return k.tag;
      if (K.pointInPoly(u, hi - 0.05, k.poly)) return k.tag;
    }
    return null;
  }

  // ---------- exits: resolve geometry first (they carve the shop lines) ----------
  const envOpen = []; // openings in the envelope
  for (const X of EXITS) {
    if (!X.top) { const e = X.side === 'N' ? vN(X.u + 6) : vS(X.u + 6); X.top = [X.u, X.side === 'N' ? e - 2.1 : e + 2.1]; }
    const a = X.a, c = a[1] === 0 ? [0, 1] : [1, 0];
    X.c = c; X.E = (al, ac) => [X.top[0] + a[0] * al + c[0] * ac, X.top[1] + a[1] * al + c[1] * ac];
    if (a[1] !== 0 && X.side === 'S' && !X.fixedTop) { // perpendicular gate: landing next to the band edge
      const e = vS(X.top[0]); if (X.id !== '1') X.top = [X.top[0], e + 14.85];
    }
    // landing + passage to the band
    const L0 = 11.5, L1 = 14.5;
    let pu0, pu1, pv0, pv1, uc;
    if (a[1] === 0) { // stair runs along u: passage across v from the strip to the band edge at the landing
      const [lu0] = X.E(L0, 0), [lu1] = X.E(L1, 0); pu0 = Math.min(lu0, lu1) + 0.1; pu1 = Math.max(lu0, lu1) - 0.1; uc = (pu0 + pu1) / 2;
      const bandSide = X.side === 'N' ? 1 : -1; const stripFace = X.top[1] + bandSide * 1.85; const e = X.side === 'N' ? vN(uc) : vS(uc);
      pv0 = Math.min(stripFace, e); pv1 = Math.max(stripFace, e); X.bandSideAc = bandSide; // across coordinate sign toward band (c = +v)
    } else { // stair runs along v toward the band: passage continues straight
      pu0 = X.top[0] - 1.6; pu1 = X.top[0] + 1.6; uc = X.top[0];
      const lv = X.E(L1, 0)[1]; const e = X.side === 'N' ? vN(uc) : vS(uc); pv0 = Math.min(lv, e); pv1 = Math.max(lv, e);
    }
    X.pass = [pu0, pv0, pu1, pv1]; X.uc = uc;
    const eV = X.side === 'N' ? vN(uc) : vS(uc); X.eV = eV;
    const [ox, oz] = P(uc, eV); envOpen.push({ x: ox, z: oz, w: pu1 - pu0, y0: FL, y1: -3.25 });
    // carve the outer line in front of the opening
    const inner = X.side === 'N' ? eV + 6.5 : eV - 6.5;
    addKeep(RUV(pu0 - 0.5, Math.min(eV, inner), pu1 + 0.5, Math.max(eV, inner)), 'gate:' + X.id);
  }
  // junction openings in the south wall (owners build the corridors)
  const JUNC = [{ id: 'J1', p: [-70, -89], to: '신세계백화점 강남점 B1 · 식품관' }, { id: 'J2', p: [120, -159], to: '경부선 터미널 B1 · 다이소' }, { id: 'J3', p: [-150, -57.5], to: '센트럴시티 B1 · 호남선' }];
  for (const J of JUNC) {
    const [u] = UV(J.p[0], J.p[1]); const e = vS(u); J.u = u; J.e = e;
    const [ox, oz] = P(u, e); envOpen.push({ x: ox, z: oz, w: 8.4, y0: FL, y1: -3.0 });
    addKeep(RUV(u - 4.8, e - 6.5, u + 4.8, e + 0.5), 'junc:' + J.id);
  }
  // toilets / special blocks in the main section (none) — food courts live in the end halls.

  // ---------- floor, ceiling, envelope ----------
  const holeW3 = [[W3[0], W3[1]], [W3[2], W3[1]], [W3[2], W3[3]], [W3[0], W3[3]]];
  const holeW9 = [[W9[0], W9[1]], [W9[2], W9[1]], [W9[2], W9[3]], [W9[0], W9[3]]];
  K.slab(band, FL, { mat: M.floor, under: false, thick: 0.3, holes: [holeW3, holeW9], edgeMat: 0x9a968f });
  K.slab(band, CY + 0.3, { mat: 'concrete', under: M.ceil, thick: 0.3, walk: false, edge: false });
  K.polyWalls(band, FL, CY + 0.3, { mat: 'concrete', inner: M.wall, thick: 0.25, openings: envOpen });
  // well edge railings (3 sides, open on the entry side) + fare gates
  railXZ(W3[0], W3[1], W3[0], W3[3]); railXZ(W3[0], W3[3], W3[2], W3[3]); railXZ(W3[2], W3[3], W3[2], W3[1]);
  railXZ(W9[0], W9[1], W9[2], W9[1]); railXZ(W9[0], W9[3], W9[2], W9[3]); railXZ(W9[2], W9[1], W9[2], W9[3]);

  function fareGates(axis, fixed, from, to, n, lineCol, lineNo) { // axis 'x': line along x at z=fixed ; 'z': line along z at x=fixed
    const step = (to - from) / (n - 1), lc = parseInt(lineCol.slice(1), 16);
    // line-colour floor band on both sides of the gate line
    for (const off of [-1.15, 1.15]) {
      const bxw = axis === 'x' ? to - from + 0.6 : 0.18, bxd = axis === 'x' ? 0.18 : to - from + 0.6;
      K.box({ x: axis === 'x' ? (from + to) / 2 : fixed + off, z: axis === 'x' ? fixed + off : (from + to) / 2, y: FL, w: bxw, d: bxd, h: 0.008, mat: lc, solid: false, skip: ['bottom'] });
    }
    for (let i = 0; i < n; i++) {
      const t = from + i * step; const x = axis === 'x' ? t : fixed, z = axis === 'x' ? fixed : t;
      const w = axis === 'x' ? 0.22 : 1.45, d = axis === 'x' ? 1.45 : 0.22;
      K.box({ x, z, y: FL, w, d, h: 0.95, mat: 0xc9ced3, top: 0x3a3f45, skip: ['bottom'] });
      // line-colour stripe wrapped round the cabinet + end caps
      K.box({ x, z, y: FL + 0.66, w: w + 0.02, d: d + 0.02, h: 0.1, mat: lc, solid: false, skip: ['bottom', 'top'] });
      K.box({ x, z, y: FL + 0.08, w: w + 0.015, d: d + 0.015, h: 0.06, mat: 0x30353b, solid: false, skip: ['bottom', 'top'] });
      if (i === 0 || i === n - 1) for (const sd of [-1, 1]) { // line badge on both cabinet ends
        const ex = axis === 'x' ? x : x + sd * (w / 2 + 0.005), ez = axis === 'x' ? z + sd * (d / 2 + 0.005) : z;
        K.sign(String(lineNo), { x: ex, z: ez, y: FL + 0.42, w: 0.2, h: 0.2, rotY: axis === 'x' ? (sd > 0 ? 0 : Math.PI) : (sd > 0 ? Math.PI / 2 : -Math.PI / 2), bg: lineCol, fg: '#fff', offset: 0.004 });
      }
      K.box({ x, z, y: FL + 0.95, w: axis === 'x' ? 0.16 : 0.3, d: axis === 'x' ? 0.3 : 0.16, h: 0.04, mat: { tex: 'emit', color: i % 2 ? 0x55ff88 : 0x5ab0ff }, solid: false, skip: ['bottom'] });
      if (i < n - 1) { // flap doors (thin, non-solid)
        const hx = axis === 'x' ? x + step / 2 : x, hz = axis === 'x' ? z : z + step / 2;
        K.box({ x: hx, z: hz, y: FL + 0.55, w: axis === 'x' ? 0.42 : 0.05, d: axis === 'x' ? 0.05 : 0.42, h: 0.3, mat: { tex: 'glass', color: 0xd04040 }, solid: false, skip: ['bottom'] });
      }
    }
  }
  // 3호선 (W3, entry north): gate line z=-106.4, paid area down to the well
  fareGates('x', -106.4, -84.5, -73.5, 10, LINE[3], 3); // ~1.0 m passages: wide enough for the player capsule
  railXZ(-84.6, -106.4, -84.6, -104); railXZ(-84.6, -104, W3[0], -104);
  railXZ(-73.4, -106.4, -73.4, -104); railXZ(-73.4, -104, W3[2], -104);
  // 9호선 (W9, entry west): gate line x=-2.5
  fareGates('z', -2.5, -136.5, -126.4, 9, LINE[9], 9);
  railXZ(-2.5, -136.6, 0, -136.6); railXZ(0, -136.6, 0, W9[1]);
  railXZ(-2.5, -126.3, 0, -126.3); railXZ(0, -126.3, 0, W9[3]);
  // header beams + platform direction signs
  K.box({ x: -79, z: -106.4, y: -2.95, w: 11.6, h: 0.75, d: 0.35, mat: 0x30353b, solid: false });
  K.sign('3호선 타는 곳', { x: -81.2, y: -2.57, z: -106.6, w: 5.6, h: 0.62, rotY: Math.PI, bg: LINE[3], fg: '#fff', sub: '오금 · 교대 방면 / 대화 · 잠원 방면', pxPerM: 90 });
  K.sign('G7 · 7호선 환승', { x: -75.6, y: -2.57, z: -106.6, w: 5.6, h: 0.62, rotY: Math.PI, bg: '#24282e', fg: '#fff', sub: '3·7호선 고속터미널역 · 출구 8-1 8', pxPerM: 90 });
  K.sign('나가는 곳', { x: -81.2, y: -2.57, z: -106.2, w: 5.6, h: 0.62, rotY: 0, bg: '#24282e', fg: '#ffd84a', sub: 'GOTO MALL 고투몰 · 8-1번 · 8번 출구', pxPerM: 90 });
  K.sign('신세계백화점 · 센트럴시티', { x: -75.6, y: -2.57, z: -106.2, w: 5.6, h: 0.62, rotY: 0, bg: '#24282e', fg: '#fff', sub: '신세계백화점 B1 연결통로 · 8번 출구', pxPerM: 90 });
  K.box({ x: -2.5, z: -132, y: -2.95, w: 0.35, h: 0.75, d: 11.6, mat: 0x30353b, solid: false });
  K.sign('나가는 곳', { x: -2.3, y: -2.57, z: -129.2, w: 5.2, h: 0.62, rotY: Math.PI / 2, bg: '#24282e', fg: '#ffd84a', sub: 'GOTO MALL 고투몰 · 8-2번 · 1번 출구', pxPerM: 90 });
  K.sign('경부선 터미널 · 다이소', { x: -2.3, y: -2.57, z: -134.6, w: 5.6, h: 0.62, rotY: Math.PI / 2, bg: '#24282e', fg: '#fff', sub: '고투몰 EAST ZONE 경유 · 1번 출구 (G9)', pxPerM: 90 });
  K.sign('9호선 타는 곳', { x: -2.7, y: -2.57, z: -134.6, w: 5.6, h: 0.62, rotY: -Math.PI / 2, bg: LINE[9], fg: '#1b1b1b', sub: '중앙보훈병원 · 사평 방면 / 개화 · 신반포 방면', pxPerM: 90 });
  K.sign('급행 · 일반 승차', { x: -2.7, y: -2.57, z: -129.2, w: 5.2, h: 0.62, rotY: -Math.PI / 2, bg: '#24282e', fg: '#fff', sub: '9호선 고속터미널역 923 · 1번 출구', pxPerM: 90 });

  // ---------- shop builder ----------
  // frame: front line at d=0, inward +d. a runs along u (rows) or v (end-hall stalls).
  const shops = [];
  const parts = new Set();
  function Lp(S, a, d) { const f = S.fr; return [f.pu + f.au * a + f.du * d, f.pv + f.av * a + f.dv * d]; }
  function lbox(S, a0, a1, d0, d1, y, h, mat, o) { const p = Lp(S, a0, d0), q = Lp(S, a1, d1); return bx(Math.min(p[0], q[0]), Math.max(p[0], q[0]), Math.min(p[1], q[1]), Math.max(p[1], q[1]), y, h, mat, o); }
  const outFace = S => { const f = S.fr; return f.du === 1 ? '-u' : f.du === -1 ? '+u' : f.dv === 1 ? '-v' : '+v'; };
  const inFace = S => { const f = S.fr; return f.du === 1 ? '+u' : f.du === -1 ? '-u' : f.dv === 1 ? '+v' : '-v'; };
  function lsign(S, text, a, d, y, w, h, face, o) { const [u, v] = Lp(S, a, d); sg(text, u, v, y, w, h, face, o); }
  function lquadV(S, a0, a1, d, y0, y1, mat) { const p = Lp(S, a0, d), q = Lp(S, a1, d); vq(mat, p[0], p[1], q[0], q[1], y0, y1, outFace(S)); }
  function lquadH(S, a0, a1, d0, d1, y, mat, up) { const p = Lp(S, a0, d0), q = Lp(S, a1, d1); fq(mat, Math.min(p[0], q[0]), Math.min(p[1], q[1]), Math.max(p[0], q[0]), Math.max(p[1], q[1]), y, up); }

  const fabric = [0xe6dfcf, 0x303137, 0xb6aa96, 0x677581, 0xcbb0ae, 0x4e5646, 0x9d8b74, 0xd4d0c4];
  function clothesRail(S, a, d, len, seed) {
    const pale = seed % 2 ? 0x202124 : 0xb2b3af;
    for (const aa of [a, a + len]) {
      lbox(S, aa - 0.025, aa + 0.025, d - 0.025, d + 0.025, FL + 0.08, 1.48, pale, { solid: false });
      lbox(S, aa - 0.12, aa + 0.12, d - 0.3, d + 0.3, FL + 0.04, 0.045, pale, { solid: false });
    }
    lbox(S, a - 0.03, a + len + 0.03, d - 0.03, d + 0.03, FL + 1.55, 0.04, pale, { solid: false });
    // Closely packed garments, with a narrow hanger visible above each piece.
    const n = Math.max(5, Math.floor(len / 0.15));
    for (let j = 0; j < n; j++) {
      const aa = a + 0.07 + j * (len - 0.14) / n, y = FL + 0.4 + (j % 3) * 0.06;
      lbox(S, aa, aa + 0.12, d - 0.27, d + 0.27, y, FL + 1.44 - y, fabric[(j + seed) % fabric.length], { solid: false });
      lbox(S, aa + 0.04, aa + 0.07, d - 0.23, d + 0.23, FL + 1.45, 0.035, 0xc09b60, { solid: false });
    }
    // One front-facing knit: body and long sleeves, as in 16/17.
    const mid = a + len / 2, col = fabric[seed % fabric.length];
    lbox(S, mid - 0.23, mid + 0.23, d - 0.36, d - 0.28, FL + 0.58, 0.77, col, { solid: false });
    for (const s of [-1, 1]) lbox(S, mid + s * 0.28 - 0.075, mid + s * 0.28 + 0.075, d - 0.35, d - 0.27, FL + 0.5, 0.78, col, { solid: false });
  }
  function mannequin(S, a, d, seed) {
    lbox(S, a - 0.22, a + 0.22, d - 0.22, d + 0.22, FL + 0.01, 0.05, 0x242424, { solid: false });
    for (const s of [-1, 1]) lbox(S, a + s * 0.09 - 0.065, a + s * 0.09 + 0.065, d - 0.08, d + 0.08, FL + 0.08, 0.75, 0xcac6b8, { solid: false });
    lbox(S, a - 0.2, a + 0.2, d - 0.12, d + 0.12, FL + 0.82, 0.61, fabric[seed % fabric.length], { solid: false });
    const [x, z] = P(...Lp(S, a, d)); K.cyl({ x, z, y: FL + 1.43, h: 0.12, r: 0.075, seg: 6, mat: 0xd8d4c4, solid: false });
  }

  const FX = {
    clothes(S, W, D, r) {
      const rackD0 = 0.6, rackD1 = D - 0.5;
      lbox(S, 0.08, 0.6, rackD0, rackD1, FL + 0.45, 1.15, { tex: 'gt_clothes' });
      lbox(S, W - 0.6, W - 0.08, rackD0, rackD1, FL + 0.45, 1.15, { tex: 'gt_clothes' });
      lbox(S, 0.08, 0.5, rackD0, rackD1, FL + 1.95, 0.85, { tex: 'gt_clothes' }, { solid: false });
      lbox(S, W - 0.5, W - 0.08, rackD0, rackD1, FL + 1.95, 0.85, { tex: 'gt_clothes' }, { solid: false });
      lbox(S, 0.7, W - 0.7, D - 0.45, D - 0.08, FL, 2.5, { tex: 'gt_folded' });
      if (W > 3.0) {
        lbox(S, W / 2 - 0.55, W / 2 + 0.55, D * 0.55, D * 0.55 + 0.65, FL, 0.7, 0xf0eeea);
        for (let j = 0; j < 6; j++) lbox(S, W / 2 - 0.48 + (j % 2) * 0.5, W / 2 - 0.04 + (j % 2) * 0.5, D * 0.55 + 0.05, D * 0.55 + 0.59, FL + 0.71 + Math.floor(j / 2) * 0.055, 0.045, fabric[(j + (r * 7 | 0)) % 8], { solid: false });
      }
      mannequin(S, W - 0.45, 0.1, r * 8 | 0);
    },
    shoes(S, W, D) {
      lbox(S, 0.3, W - 0.3, D - 0.4, D - 0.06, FL, 2.4, { tex: 'gt_shoes' });
      lbox(S, 0.06, 0.42, 0.5, D - 0.45, FL, 2.2, { tex: 'gt_shoes' });
      lbox(S, W - 0.42, W - 0.06, 0.5, D - 0.45, FL, 2.2, { tex: 'gt_shoes' });
      lbox(S, W / 2 - 0.6, W / 2 + 0.6, D * 0.45, D * 0.45 + 0.45, FL, 0.42, 0x7a5a44);
    },
    bags(S, W, D) {
      lbox(S, 0.3, W - 0.3, D - 0.45, D - 0.06, FL, 2.4, { tex: 'gt_bags' });
      lbox(S, 0.06, 0.45, 0.6, D - 0.5, FL, 2.1, { tex: 'gt_bags' });
      for (let j = 0; j < 3; j++) {
        const a = 0.48 + j * (W - 0.96) / 2, d = j % 2 ? 0.45 : -0.2, [x, z] = P(...Lp(S, a, d));
        K.cyl({ x, z, y: FL + 0.02, h: 0.04, r: 0.22, seg: 8, mat: 0x171819, solid: false });
        lbox(S, a - 0.018, a + 0.018, d - 0.018, d + 0.018, FL + 0.06, 1.65, 0x222326, { solid: false });
        for (let t = 0; t < 2; t++) {
          const y = FL + 0.38 + t * 0.62, col = [0x825841, 0xded9c7, 0x302c2a, 0x959c6c, 0x8c7065][(j + t * 2) % 5];
          lbox(S, a - 0.21, a + 0.21, d - 0.16, d + 0.03, y, 0.32, col, { solid: false });
          for (const da of [-0.13, 0.13]) lbox(S, a + da - 0.018, a + da + 0.018, d - 0.15, d - 0.12, y + 0.3, 0.22, col, { solid: false });
          lbox(S, a - 0.13, a + 0.13, d - 0.15, d - 0.12, y + 0.5, 0.025, col, { solid: false });
        }
        lsign(S, ['특가', ['29,900', '39,900', '49,900'][j]], a, d - 0.18, FL + 1.7, 0.32, 0.23, outFace(S), { bg: '#f8f7ed', fg: '#2d4979', pxPerM: 140 });
      }
    },
    acc(S, W, D) {
      lbox(S, 0.2, W - 0.2, D - 0.2, D - 0.05, FL + 0.9, 1.6, { tex: 'gt_acc' }, { solid: false });
      lbox(S, 0.15, 0.75, 0.5, D - 0.4, FL, 0.85, 0x2d2d31);
      lbox(S, 0.15, 0.75, 0.5, D - 0.4, FL + 0.85, 0.3, 'glass', { solid: false });
      lbox(S, W - 0.75, W - 0.15, 0.5, D - 0.4, FL, 0.85, 0x2d2d31);
      lbox(S, W - 0.75, W - 0.15, 0.5, D - 0.4, FL + 0.85, 0.3, 'glass', { solid: false });
      lbox(S, 0.9, W - 0.9, D - 0.75, D - 0.25, FL, 1.0, 0xe9e2d6, { top: { tex: 'gt_acc' } });
    },
    cosme(S, W, D) {
      lbox(S, 0.2, W - 0.2, D - 0.42, D - 0.05, FL, 2.3, { tex: 'gt_cosme' });
      lbox(S, 0.05, 0.4, 0.4, D - 0.45, FL, 2.1, { tex: 'gt_cosme' });
      lbox(S, W - 0.4, W - 0.05, 0.4, D - 0.45, FL, 2.1, { tex: 'gt_cosme' });
      if (W > 3.2) lbox(S, W / 2 - 0.35, W / 2 + 0.35, 1.0, D - 1.0, FL, 1.35, { tex: 'gt_cosme' });
      lbox(S, 0.5, 1.5, 0.55, 1.05, FL, 1.0, 0xffffff, { top: 0xdedad2 });
    },
    socks(S, W, D) { lbox(S, 0.1, W - 0.1, D - 0.15, D - 0.04, FL + 0.3, 2.1, { tex: 'gt_pegs' }, { solid: false }); lbox(S, 0.05, 0.2, 0.4, D - 0.2, FL + 0.3, 2.0, { tex: 'gt_pegs' }); lbox(S, W - 0.2, W - 0.05, 0.4, D - 0.2, FL + 0.3, 2.0, { tex: 'gt_pegs' }); lbox(S, W / 2 - 0.5, W / 2 + 0.5, 0.6, 1.4, FL, 0.85, 0xe8e0d2, { top: { tex: 'gt_pegs' } }); },
    hats(S, W, D) { FX.socks(S, W, D); },
    phone(S, W, D) { lbox(S, 0.1, W - 0.1, D - 0.15, D - 0.04, FL + 0.4, 2.0, { tex: 'gt_pegs', color: 0xdde6ff }, { solid: false }); lbox(S, 0.4, W - 0.4, 0.4, 0.95, FL, 1.0, 0x23262b, { top: 'glass' }); },
    bedding(S, W, D, r) {
      lbox(S, 0.08, 0.95, 0.4, D - 0.1, FL, 1.4 + r * 0.6, { tex: 'gt_bedding' });
      lbox(S, W - 0.95, W - 0.08, 0.4, D - 0.1, FL, 1.2 + r * 0.8, { tex: 'gt_bedding' });
      if (W > 2.6) { lbox(S, 1.05, W - 1.05, D - 1.6, D - 0.1, FL, 0.5, 0xf4f1ea, { top: { tex: 'gt_bedding', color: 0xffffff } }); lbox(S, 1.15, W - 1.15, D - 0.5, D - 0.15, FL + 0.5, 0.18, 0xffffff, { solid: false }); }
    },
    dishes(S, W, D) { lbox(S, 0.2, W - 0.2, D - 0.45, D - 0.05, FL, 2.2, { tex: 'gt_dishes' }); lbox(S, 0.05, 0.45, 0.5, D - 0.5, FL, 2.0, { tex: 'gt_dishes' }); lbox(S, W - 0.45, W - 0.05, 0.5, D - 0.5, FL, 2.0, { tex: 'gt_dishes' }); lbox(S, W / 2 - 0.7, W / 2 + 0.7, 0.8, 1.6, FL, 0.8, 0xc8b79c, { top: { tex: 'gt_dishes' } }); },
    deco(S, W, D) {
      lbox(S, 0.2, W - 0.2, D - 0.4, D - 0.05, FL, 2.3, { tex: 'gt_frames' });
      lbox(S, 0.05, 0.4, 0.5, D - 0.45, FL, 1.9, { tex: 'gt_dishes', color: 0xf3e6d6 });
      lbox(S, W / 2 - 0.65, W / 2 + 0.65, 0.8, 1.6, FL, 0.75, 0x9a7b55);
      for (const k of [-0.35, 0.05, 0.4]) { const [u, v] = Lp(S, W / 2 + k, 1.2); const [x, z] = P(u, v); K.cyl({ x, z, y: FL + 0.75, r: 0.09 + Math.abs(k) * 0.1, h: 0.25 + Math.abs(k) * 0.4, seg: 8, mat: [0x6f8fae, 0xd9c7a0, 0x9c4d3b][(k * 10 + 5) % 3 | 0], solid: false }); }
      if (S.r < 0.22) { // 20: seasonal displays are confined to a few decor stalls.
        lbox(S, 0.1, W - 0.1, -0.1, 0.1, FL + 2.65, 0.18, 0x365238, { solid: false });
        for (const a of [0.55, W - 0.55]) {
          for (let t = 0; t < 5; t++) { const rr = 0.46 - t * 0.075; lbox(S, a - rr, a + rr, 0.18 - rr, 0.18 + rr, FL + 0.2 + t * 0.3, 0.4, t % 2 ? 0x315137 : 0x3a6041, { solid: false }); }
          for (let t = 0; t < 9; t++) { const rr = 0.34 - t * 0.025; lbox(S, a + Math.sin(t * 2.4) * rr - 0.025, a + Math.sin(t * 2.4) * rr + 0.025, -0.22, -0.17, FL + 0.32 + t * 0.14, 0.05, t % 3 ? M.ledWarm : 0xb42434, { solid: false }); }
        }
        for (let a = 0.2; a < W - 0.1; a += 0.3) lbox(S, a, a + 0.04, -0.12, -0.08, FL + 2.68, 0.04, M.ledWarm, { solid: false });
      }
    },
    frames(S, W, D) {
      lbox(S, 0.1, W - 0.1, D - 0.12, D - 0.04, FL + 0.2, 2.5, { tex: 'gt_frames' }, { solid: false });
      lbox(S, 0.04, 0.12, 0.3, D - 0.2, FL + 0.2, 2.4, { tex: 'gt_frames' }, { solid: false });
      lbox(S, W - 0.12, W - 0.04, 0.3, D - 0.2, FL + 0.2, 2.4, { tex: 'gt_frames' }, { solid: false });
      lbox(S, 0.5, W - 0.5, D * 0.5, D * 0.5 + 0.12, FL, 1.1, { tex: 'gt_frames' });
    },
    flowers(S, W, D) {
      for (let t = 0; t < 3; t++) lbox(S, 0.15, W - 0.15, D - 0.45 - t * 0.45, D - 0.05 - t * 0.45, FL, 0.45 + (2 - t) * 0.45, 0x7a6a55, { top: { tex: 'gt_flowers' } });
      lbox(S, 0.05, 0.55, 0.5, D - 1.5, FL, 0.9, 0x5a5a5a, { top: { tex: 'gt_flowers' } });
      // 18/19: staggered buckets, tall white pots and discrete flower heads.
      for (let j = 0; j < 10; j++) {
        const a = 0.35 + (j % 5) * (W - 0.7) / 4, d = -0.22 + Math.floor(j / 5) * 0.7;
        const [x, z] = P(...Lp(S, a, d)), potH = 0.35 + (j % 3) * 0.13, rise = j > 4 ? 0.23 : 0;
        K.cyl({ x, z, y: FL + rise, r: 0.18, h: potH, seg: 7, mat: j % 3 ? 0xeeeeea : 0x343b38, solid: false });
        lbox(S, a - 0.075, a + 0.075, d - 0.06, d + 0.06, FL + rise + potH, 0.38, 0x3f663a, { solid: false });
        for (let t = 0; t < 3; t++) lbox(S, a - 0.2 + t * 0.12, a - 0.04 + t * 0.12, d - 0.14, d + 0.14, FL + rise + potH + 0.22 + (t % 2) * 0.09, 0.13, [0xeab5ce, 0xf2ead0, 0xf1cf28, 0x995bac, 0xc33c56][j % 5], { solid: false });
      }
      lbox(S, 0.1, W - 0.1, D - 0.08, D - 0.03, FL + 1.4, 1.2, { tex: 'gt_flowers' }, { solid: false });
      lquadV(S, 0.06, W - 0.06, D - 0.11, FL + 1.8, AY, 0xaaa69e);
      for (let y = FL + 1.8; y < AY - 0.05; y += 0.085) lbox(S, 0.06, W - 0.06, D - 0.14, D - 0.12, y, 0.023, 0x88857d, { solid: false });
      for (const a of [0.4, W - 0.4]) {
        const [x, z] = P(...Lp(S, a, 1.25)); K.cyl({ x, z, y: FL, r: 0.24, h: 0.67, seg: 8, mat: 0xf0efea, solid: false });
        for (let t = 0; t < 5; t++) lbox(S, a - 0.18 + (t % 2) * 0.16, a + 0.06 + (t % 2) * 0.16, 1.1, 1.4, FL + 0.65 + t * 0.18, 0.32, t % 2 ? 0x48633a : 0x365131, { solid: false });
      }
    },
    curtain(S, W, D) { lbox(S, 0.1, W - 0.1, D - 0.2, D - 0.05, FL + 0.1, 2.6, { tex: 'gt_curtain' }); lbox(S, 0.05, 0.25, 0.4, D - 0.3, FL + 0.1, 2.5, { tex: 'gt_curtain' }); lbox(S, W / 2 - 0.6, W / 2 + 0.6, 0.8, 1.5, FL, 0.9, { tex: 'gt_bedding' }); },
    repair(S, W, D) { lbox(S, 0.2, W - 0.2, D - 0.6, D - 0.08, FL + 0.6, 1.2, { tex: 'gt_clothes' }); lbox(S, 0.4, 1.8, 0.5, 1.2, FL, 0.78, 0x8a7a66); lbox(S, 0.8, 1.2, 0.7, 1.0, FL + 0.78, 0.3, 0x2d2d2d, { solid: false }); },
    office(S, W, D) { lbox(S, 0.3, W - 0.3, 0.4, 0.95, FL, 1.0, 0xe8e4dc, { top: 0x6b5a48 }); lbox(S, 0.4, W - 0.4, D - 0.5, D - 0.08, FL, 2.0, { tex: 'gt_folded', color: 0xdfe6ee }); lsign(S, ['고객센터 · 분실물', '고투몰 문의 02-535-8182'], W / 2, D - 0.09, FL + 2.45, Math.min(2.6, W - 0.6), 0.55, outFace(S), { bg: '#1f3b5a', fg: '#fff' }); },
    food(S, W, D, r, info) {
      lbox(S, 0.25, W - 0.25, 0.1, 0.7, FL, 0.96, 0xf1efeb, { top: 0x4b4d48 });
      for (let a = 0.35; a < W - 0.4; a += 0.8) lbox(S, a, a + 0.018, 0.08, 0.12, FL + 0.05, 0.86, 0x9c9d96, { solid: false });
      lbox(S, 0.15, W - 0.15, D - 0.75, D - 0.08, FL, 0.9, 0xc3c8cd, { top: 0xdfe3e6 });
      lbox(S, 0.3, W - 0.3, D - 0.9, D - 0.08, FL + 2.3, 0.5, 0xaab0b6, { solid: false });
      lsign(S, info.menu || ['식사'], W / 2, D - 0.09, FL + 1.75, Math.min(W - 0.4, 3.4), 0.7, outFace(S), { bg: '#1c1c1c', fg: '#ffe7a6', bold: false });
      lbox(S, W - 0.75, W - 0.18, D - 0.8, D - 0.18, FL, 1.95, 0xb7bdbe, { solid: false });
      lbox(S, W - 0.7, W - 0.23, D - 0.82, D - 0.79, FL + 0.35, 1.45, 0xd5d9d6, { solid: false });
      for (let a = 0.7; a < W - 0.5; a += 1.05) {
        const [x, z] = P(...Lp(S, a, -0.28));
        K.cyl({ x, z, y: FL + 0.42, r: 0.19, h: 0.07, seg: 10, mat: 0xad292e, solid: false });
        K.cyl({ x, z, y: FL, r: 0.035, h: 0.42, seg: 6, mat: 0x303235, solid: false });
        lsign(S, '메뉴', a, 0.05, FL + 1.15, 0.35, 0.22, outFace(S), { bg: '#f5dd32', fg: '#25231f' });
      }
      // Small image-menu-like plates are simplified geometry; names remain the researched menu.
      for (let a = 0.55; a < W - 0.25; a += 0.75) {
        lbox(S, a - 0.31, a + 0.31, 0.3, 0.35, FL + 2.0, 0.3, 0xf5f2e9, { solid: false });
        lbox(S, a - 0.22, a + 0.22, 0.28, 0.3, FL + 2.05, 0.18, 0xb5a077, { solid: false });
        lbox(S, a - 0.15, a + 0.15, 0.26, 0.28, FL + 2.08, 0.13, 0x725d3c, { solid: false });
      }
      const [pu, pv] = Lp(S, W * 0.5, 1.2); const [px, pz] = P(pu, pv); K.person(px, FL, pz, { rotY: FACE[outFace(S)] + Math.PI, shirt: 0xffffff, pants: 0x2b2b2b });
    },
    cafe(S, W, D, r, info) {
      FX.food(S, W, D, r, info);
      lbox(S, W - 1.0, W - 0.5, 0.25, 0.6, FL + 1.0, 0.45, 0x1f1f1f, { solid: false });
    },
  };

  function makeShop(o) {
    const S = { ...o };
    S.W = S.a1 - S.a0;
    shops.push(S);
    return S;
  }
  function frontDisplay(loc, W, fx, r) { // goods spilling to the shop front (typical of 지하상가)
    if (W < 2.6 || r > 0.92) return;
    const a0 = r < 0.4 ? 0.15 : W - 1.25, a1 = a0 + 1.1;
    if (fx === 'clothes') {
      clothesRail(loc, a0, -0.2, 1.1, r * 23 | 0);
      lsign(loc, ['특가', ['3,000원', '7,000원', '10,000원', '14,900원'][(r * 4) | 0]], a0 + 0.55, -0.5, FL + 1.78, 0.52, 0.35, outFace(loc), { bg: r < 0.45 ? '#fff137' : '#f5a4c4', fg: '#292521', pxPerM: 130 });
    }
    else if (fx === 'shoes' || fx === 'socks' || fx === 'hats') lbox(loc, a0, a1, -0.18, 0.72, FL, 0.75, 0xe9e2d6, { top: { tex: fx === 'shoes' ? 'gt_shoes' : 'gt_pegs' } });
    else if (fx === 'bedding' || fx === 'curtain') lbox(loc, a0, a1, 0.12, 0.8, FL, 0.6 + r * 0.5, { tex: 'gt_bedding' });
    else if (fx === 'dishes' || fx === 'deco') lbox(loc, a0, a1, 0.12, 0.72, FL, 0.8, 0xb79c78, { top: { tex: 'gt_dishes' } });
  }
  function buildShop(S, info) {
    const f = S.fr, W = S.W, r = S.r; S.fx = info.fx; S.col = S.col || info.bg;
    const depthAt = a => S.depth(S.a0 + a);
    const D = Math.min(depthAt(0), depthAt(W));
    const loc = { ...S, fr: { ...f, pu: f.pu + f.au * S.a0, pv: f.pv + f.av * S.a0 } }; // a measured from shop start
    // partitions (deduped per line)
    for (const [a, aw] of [[S.a0, 0], [S.a1, W]]) {
      const key = S.line + ':' + a.toFixed(2);
      if (parts.has(key)) continue; parts.add(key);
      const p = Lp(loc, aw, 0), q = Lp(loc, aw, depthAt(aw));
      wl(p[0], p[1], q[0], q[1], FL, CY, { mat: M.part, thick: 0.1 });
    }
    // 13–17: warm shop floors, pale ceilings, black spot tracks; no entrance doors.
    lquadH(loc, 0.05, W - 0.05, 0.02, D - 0.05, FL + 0.006, info.floor ?? (info.fx === 'clothes' ? (r < 0.5 ? { tex: 'wood', color: 0xc6b18e } : M.apparelFloor) : M.floor), true);
    lquadV(loc, 0.05, W - 0.05, D - 0.03, FL, FY, info.back ?? [0xf2ece2, 0xe8e2f0, 0xe5efe8, 0xf3e6e0, 0xf6f4ef][(r * 7 % 5) | 0]);
    lquadH(loc, 0.02, W - 0.02, 0.01, D - 0.04, AY + 0.04, M.ceil, false);
    for (const d of [0.4, Math.max(0.9, D * 0.7)]) {
      lbox(loc, 0.2, W - 0.2, d - 0.025, d + 0.025, AY - 0.07, 0.055, 0x252525, { solid: false });
      for (let a = 0.55; a < W - 0.15; a += 1.15) {
        lbox(loc, a - 0.065, a + 0.065, d - 0.075, d + 0.075, AY - 0.21, 0.15, r < 0.5 ? 0xe9e7e0 : 0x252525, { solid: false });
        const [u, v] = Lp(loc, a, d); downlight(u, v, AY - 0.21, a < W / 2);
      }
    }
    if (r < 0.18 && W > 3) {
      lbox(loc, W / 2 - 0.36, W / 2 + 0.36, D * 0.5 - 0.36, D * 0.5 + 0.36, AY - 0.045, 0.05, 0xdfdcd5, { solid: false });
      lquadH(loc, W / 2 - 0.27, W / 2 + 0.27, D * 0.5 - 0.27, D * 0.5 + 0.27, AY - 0.05, 0x9d9b94, false);
    }
    // Small black suspended shop plates, with real researched brands where known.
    const name = info.name, sub = info.sub;
    const food = ['food', 'cafe'].includes(info.fx), sw = food ? Math.min(W - 0.35, 3.3) : Math.min(W - 0.35, S.named ? 1.5 : 0.88);
    for (const a of [W / 2 - sw * 0.36, W / 2 + sw * 0.36]) lbox(loc, a - 0.012, a + 0.012, -0.17, -0.14, FL + 2.66, 0.3, 0x68645d, { solid: false });
    lsign(loc, name, W / 2, -0.18, FL + 2.48, sw, food ? 0.42 : 0.31, outFace(loc), { bg: food ? info.bg : '#242526', fg: food ? info.fg || '#ffffff' : '#ffffff', sub: food ? sub : undefined, pxPerM: 130, box: 0.055 });
    if (S.num) lsign(loc, S.num, 0.24, -0.08, FL + 2.55, 0.38, 0.16, outFace(loc), { bg: '#242526', fg: '#ddd9ca', pxPerM: 150 });
    if (info.fx === 'clothes' && r < 0.22) {
      const label = r < 0.1 ? '품목 3,000원' : '14,900';
      lsign(loc, label, W / 2, 0.16, FL + 2.12, Math.min(W - 0.3, 2.65), 0.38, outFace(loc), { bg: '#f8f5ec', fg: '#252324', pxPerM: 100 });
    }
    // glass shopfront (cosmetics etc.)
    if (info.glass) { const p = Lp(loc, 0.05, 0.05), q = Lp(loc, W - 0.05, 0.05); wl(p[0], p[1], q[0], q[1], FL, FY, { mat: 'glass', thick: 0.03, openings: [{ at: W / 2, w: Math.min(1.8, W - 0.8), y0: FL, y1: FL + 2.4 }] }); }
    // counter / cash desk for retail
    if (!['food', 'cafe', 'office', 'cosme'].includes(info.fx) && W > 2.6) lbox(loc, W - 1.15, W - 0.35, D - 1.25, D - 0.75, FL, 0.95, 0xd8cfc0, { top: 0x5b4b3c });
    (FX[info.fx] || FX.clothes)(loc, W, D, r, info);
    frontDisplay(loc, W, info.fx, (r * 13.7) % 1);
    // shop zone (HUD + map)
    const p0 = Lp(loc, 0, 0), p1 = Lp(loc, W, D);
    K.zone({ name: info.zname || name, floor: 'B1', sub: info.zsub, poly: R(Math.min(p0[0], p1[0]), Math.min(p0[1], p1[1]), Math.max(p0[0], p1[0]), Math.max(p0[1], p1[1])), y0: FL - 0.5, y1: CY, priority: 3 });
  }

  // ---------- sections ----------
  function sectionOf(u) {
    if (u < -296) return { key: 'wplaza', name: 'WEST ZONE', pool: 'west' };
    if (u < -102.2) return { key: 'west', name: 'WEST ZONE', pool: 'west' };
    if (u < -68.6) return { key: 'l3', name: '3호선 개찰구 홀', pool: 'center' };
    if (u < -10.07) return { key: 'center', name: '중앙', pool: 'center' };
    if (u < 40.6) return { key: 'l9', name: '9호선 개찰구 홀', pool: 'center' };
    if (u < 359.6) return { key: 'east', name: 'EAST ZONE', pool: 'east' };
    return { key: 'eplaza', name: '동편 휴게', pool: 'east' };
  }
  const CENTRAL = [[3, 26], [30, 37], [43, 81]]; // bay index ranges (inclusive start, exclusive end) where lines B/C exist
  const hasCentral = k => CENTRAL.some(([a, b]) => k >= a && k < b);
  const PASSAGE = new Set([7, 12, 17, 22, 33, 47, 52, 57, 62, 67, 72, 77]); // cross passages through lines B/C
  const isPassage = k => hasCentral(k) && PASSAGE.has(k);
  const counters = { A: 0, B: 0, C: 0, D: 0 };

  function namedFor(row, ua, ub) { return NAMED.find(n => n.row === row && n.u >= ua && n.u < ub); }

  function rowIntervals(ua, ub, v0, v1) {
    const out = []; let cur = null; const st = 0.2;
    for (let u = ua; u <= ub + 1e-6; u += st) { const b = blocked(u, v0, v1); if (!b) { if (!cur) cur = [u, u]; else cur[1] = u; } else if (cur) { out.push(cur); cur = null; } }
    if (cur) out.push(cur);
    return out.map(([a, b]) => [a <= ua + 1e-6 ? ua : a + 0.15, b >= ub - st ? ub : b - 0.15]).filter(([a, b]) => b - a >= 1.9);
  }

  const bays = [], guideBoards = [];
  let passN = 0;
  for (let k = 0; k < NB; k++) {
    const ua = GRID0 + k * GRID, ub = ua + GRID, uc = (ua + ub) / 2;
    const Ly = lay(uc); const sec = sectionOf(uc);
    bays.push({ k, ua, ub, uc, L: Ly, sec, central: hasCentral(k) && !isPassage(k), passage: isPassage(k) });
  }
  for (const b of bays) {
    const { ua, ub, L: Ly, sec } = b;
    const lines = [
      { line: 'A', v0: Ly.n, v1: Ly.fA, fr: { pu: 0, pv: Ly.fA, au: 1, av: 0, du: 0, dv: -1 }, depth: u => Ly.fA - vN(u) - 0.14 },
      { line: 'D', v0: Ly.fD, v1: Ly.s, fr: { pu: 0, pv: Ly.fD, au: 1, av: 0, du: 0, dv: 1 }, depth: u => vS(u) - 0.14 - Ly.fD },
    ];
    if (b.central) lines.push(
      { line: 'B', v0: Ly.fB, v1: Ly.mid, fr: { pu: 0, pv: Ly.fB, au: 1, av: 0, du: 0, dv: 1 }, depth: () => 3.3 },
      { line: 'C', v0: Ly.mid, v1: Ly.fC, fr: { pu: 0, pv: Ly.fC, au: 1, av: 0, du: 0, dv: -1 }, depth: () => 3.3 });
    for (const Ln of lines) {
      const ivs = rowIntervals(ua, ub, Ln.v0, Ln.v1);
      for (const [a, c] of ivs) {
        const nm = namedFor(Ln.line, a, c);
        let n = nm && !nm.small ? 1 : Math.max(1, Math.round((c - a) / (2.7 + rnd() * 1.5)));
        if (!nm && c - a > 7.5 && n < 2) n = 2;
        const w = (c - a) / n;
        // fascia over the whole run
        wallU(a, c, Ln.fr.pv, AY + 0.04, CY, { mat: M.fascia, thick: 0.14 });
        K.box({ x: P((a + c) / 2, Ln.fr.pv)[0], z: P((a + c) / 2, Ln.fr.pv)[1], y: FY - 0.06, w: c - a, d: 0.2, h: 0.06, rotY: ROT, mat: 0x8d939a, solid: false, skip: [] });
        for (let i = 0; i < n; i++) {
          const r = rnd();
          let poolKey = sec.pool; if (Ln.line === 'D' && b.uc > -300 && b.uc < -228) poolKey = 'flower';
          const ck = pick(POOL[poolKey], rnd());
          const no = ++counters[Ln.line]; const num = `${Ln.line}-${String(no).padStart(3, '0')}`;
          const S = makeShop({ line: Ln.line, a0: a + i * w, a1: a + (i + 1) * w, fr: Ln.fr, depth: Ln.depth, r });
          let info;
          // zone sub = store number only (short map labels; the section is named by the corridor zones)
          const tenant = nm && nm.u >= S.a0 && nm.u < S.a1 ? nm : null;
          if (tenant) info = { name: tenant.name, sub: `${tenant.sub ? tenant.sub + ' · ' : ''}${num}`, fx: tenant.fx, bg: tenant.bg, fg: tenant.fg, menu: tenant.menu, glass: tenant.glass, zsub: num };
          else if (num === 'C-083') info = { name: '주얼리 하우스', sub: `목걸이·팔찌·반지 · ${num}`, fx: 'acc', bg: '#3b2a46', fg: '#f3d98b', zsub: `${num} · 액세서리` };
          else if (num === 'D-142') info = { ...CAT.office, name: '고투몰 관리사무소', sub: `고객센터 · ${num}`, zsub: `${num} · 고객센터 · 분실물` };
          else { const C = CAT[ck]; info = { name: C.label, sub: num, fx: C.fx, bg: C.bg, fg: C.fg, menu: C.menu, glass: ck === 'cosme' || ck === 'lens', zname: C.label, zsub: num }; }
          S.num = num; S.no = no; S.uc = (S.a0 + S.a1) / 2; S.col = info.bg; S.named = !!tenant || num === 'C-083' || num === 'D-142';
          buildShop(S, info);
        }
      }
    }
    // central block: spine wall / end walls
    if (b.central) {
      wallU(ua, ub, Ly.mid, FL, CY, { mat: M.spine, thick: 0.2 });
      const prev = bays[b.k - 1], next = bays[b.k + 1];
      for (const [cond, u, face] of [[!prev || !prev.central, ua, '-u'], [!next || !next.central, ub, '+u']]) {
        if (!cond) continue;
        wallV(u, Ly.fB, Ly.fC, FL, CY, { mat: M.wall, thick: 0.25 });
        const off = face === '-u' ? -0.15 : 0.15;
        if ((b.k + (face === '-u' ? 0 : 1)) % 2) {
          guideBoards.push({ u, dir: Math.sign(off), v: Ly.mid, face, w: 6.0, sec: sec.name }); // 매장 안내도 (drawn plan), placed at the end
        } else {
          const [x, z] = P(u + off * 1.1, Ly.mid); K.box({ x, z, y: FL + 0.6, w: 0.12, d: 2.6, h: 2.0, rotY: ROT, mat: { tex: 'emit', color: 0xffffff }, solid: false });
          sg(['GOTO MALL', '강남터미널 지하쇼핑센터'], u + off * 1.6, Ly.mid, FL + 1.6, 2.4, 1.0, face, { bg: '#f7f3ec', fg: '#2a2a2a', sub: '600여 개 매장 · 상가 10:00~22:00 · 통로 24시간' });
        }
      }
    }
    // column grid on the line fronts (free-standing in halls)
    const fronts = [Ly.fA, Ly.fD, Ly.fB, Ly.fC];
    for (const v of fronts) {
      if (blocked(ua, v - 0.4, v + 0.4)) continue;
      bx(ua - 0.45, ua + 0.45, v - 0.45, v + 0.45, FL, CY - FL, M.col, { skip: ['bottom', 'top'] });
      bx(ua - 0.46, ua + 0.46, v - 0.46, v + 0.46, FL, 0.14, M.darkStone, { solid: false });
    }
    // 01/19: dark low soffit and separate oval light wells; 02: framed panels at end seating.
    for (const [c0, c1, side] of [[Ly.fA, Ly.fB, 'N'], [Ly.fC, Ly.fD, 'S']]) {
      const cm = (c0 + c1) / 2;
      const hall = ['l3', 'l9'].includes(sec.key), end = ['wplaza', 'eplaza'].includes(sec.key);
      if (!hall) {
        const hole = ellipse(b.uc, cm, 2.45, 1.35);
        K.hpoly(end ? M.ceil : 'gt_soffit', R(ua, c0, ub, c1), AY, false, end ? [] : [hole]);
        if (end) panelCove(b.uc, cm, 6.4, 3.1, AY); else ovalCove(b.uc, cm);
        for (const u of [ua + 0.9, ua + 3.0, ua + 5.1, ua + 7.2]) for (const v of [c0 + 0.65, c1 - 0.65]) downlight(u, v);
        if (sec.key === 'east' || sec.key === 'center') fq(M.apparelFloor, ua, c0, ub, c1, FL + 0.004);
        if (b.k % 4 === 0) {
          fq(0x826181, ua + 0.4, cm - 0.18, ua + 1.6, cm + 0.18, AY - 0.015, false);
          sg('출구 ↑', ua + 0.8, cm, FL + 2.51, 0.64, 0.25, '-u', { bg: '#168749', fg: '#ffffff', twoSided: true });
        }
      } else {
        for (const u of [ua + 2, ua + 6]) panelCove(u, cm, 3.1, 2.7);
      }
      const n = 3 + ((rnd() * 3) | 0);
      for (let i = 0; i < n; i++) { const u = ua + 0.6 + rnd() * (GRID - 1.2), v = c0 + 0.7 + rnd() * (c1 - c0 - 1.4); if (blocked(u, v - 0.3, v + 0.3)) continue; const [x, z] = P(u, v); K.person(x, FL, z, { rotY: (rnd() < 0.5 ? FACE['+u'] : FACE['-u']) + (rnd() - 0.5) * 0.6 }); }
    }
    if (!b.central) { // hall / passage ceiling panels
      for (let v = Ly.fB + 1.2; v < Ly.fC - 0.8; v += 2.7) panelCove(b.uc, v, 5.6, 1.8);
    }
    if (b.passage) { // cross passage: benches + hanging signs
      K.zone({ name: `가로통로 ${++passN}`, floor: 'B1', sub: '북측 ↔ 남측 통로 · 벤치·화분', poly: R(ua, Ly.fB, ub, Ly.fC), y0: FL - 0.5, y1: CY, priority: 3 });
      for (const vv of [Ly.mid - 1.2, Ly.mid + 1.2]) { bx(b.uc - 1.4, b.uc + 1.4, vv - 0.25, vv + 0.25, FL, 0.45, M.wood); }
      bx(b.uc - 0.6, b.uc + 0.6, Ly.mid - 0.6, Ly.mid + 0.6, FL, 0.7, 0x8c8277, { top: 'grass' });
      const [tx0, tz0] = P(b.uc, Ly.mid); K.tree(tx0, tz0, { y: FL + 0.7, h: 2.3, kind: 'zelkova' });
    }
  }

  // hanging direction signs over both corridors every 3rd bay
  const destE = u => u < -102 ? ['3·7·9호선 고속터미널역 →', '신세계백화점 · 센트럴시티 · G7'] : u < -3 ? ['9호선 · 경부선 터미널 →', 'EAST ZONE · 1번 출구'] : u < 300 ? ['EAST ZONE · 동편 푸드코트 →', '잠원로 · G13 · G15'] : ['동편 푸드코트 · 화장실 →', 'Cafe 헤이와'];
  const destW = u => u > 40 ? ['← 3·7·9호선 고속터미널역', '경부선 터미널 · 신세계백화점'] : u > -68 ? ['← 3호선 · 센트럴시티', 'WEST ZONE · 8-1번 출구'] : u > -300 ? ['← 서편 푸드코트 · 화장실', 'WEST ZONE · G2 · G4'] : ['← 서편 푸드코트', '얌샘김밥 · 화장실'];
  for (const b of bays) {
    if (b.k % 3 !== 1) continue;
    const Ly = b.L; const zoneTag = b.sec.key === 'west' || b.sec.key === 'wplaza' ? 'WEST ZONE' : b.sec.key === 'east' || b.sec.key === 'eplaza' ? 'EAST ZONE' : '고속터미널역';
    for (const [c0, c1] of [[Ly.fA, Ly.fB], [Ly.fC, Ly.fD]]) {
      const cm = (c0 + c1) / 2; const u = b.uc;
      if (blocked(u, cm - 1.6, cm + 1.6)) continue;
      const [x, z] = P(u, cm);
      K.box({ x, z, y: FL + 2.25, w: 0.1, d: 2.55, h: 0.43, rotY: ROT, mat: 0x252627, solid: false, skip: [] });
      for (const vv of [cm - 1.0, cm + 1.0]) { const [rx, rz] = P(u, vv); K.box({ x: rx, z: rz, y: FL + 2.68, w: 0.025, d: 0.025, h: 0.57, rotY: ROT, mat: 0x777777, solid: false }); }
      const e = destE(u), w = destW(u);
      sg(e[0], u - 0.06, cm, FL + 2.47, 2.48, 0.40, '-u', { bg: '#252627', fg: '#ffffff', sub: `${zoneTag} · ${e[1]}` });
      sg(w[0], u + 0.06, cm, FL + 2.47, 2.48, 0.40, '+u', { bg: '#252627', fg: '#ffffff', sub: `${zoneTag} · ${w[1]}` });
    }
  }

  // zone banners at the WEST / EAST ZONE thresholds (both corridors)
  for (const [u, face, title, sub, col] of [[-101.4, '+u', '서편광장', '인테리어 소품 · 침구 · 그릇 · 조화·꽃 · 여성의류', '#1d6fb8'], [41.4, '-u', '동편광장', '여성의류 · 신발 · 가방 · 액세서리 · 양말', '#3da64a']]) {
    const Ly = lay(u);
    for (const cm of [(Ly.fA + Ly.fB) / 2, (Ly.fC + Ly.fD) / 2]) {
      const [x, z] = P(u, cm); K.box({ x, z, y: FL + 2.2, w: 0.1, d: 3.2, h: 0.6, rotY: ROT, mat: 0x252627, solid: false, skip: [] });
      sg(title, u + (face === '+u' ? 0.06 : -0.06), cm, FL + 2.5, 3.1, 0.56, face, { bg: '#252627', fg: col, sub, pxPerM: 100 });
    }
  }
  // corridor / section zones (map + HUD)
  const SECT = [
    { u0: -320.8, u1: -102.2, name: '고투몰 WEST ZONE', short: 'WEST ZONE', sub: '인테리어·침구·그릇·조화·꽃 · 여성의류' },
    { u0: -102.2, u1: -68.6, name: '3호선 고속터미널역 개찰구 (G7)', short: '3호선 홀', sub: '3호선 · 7호선 환승 · 신세계 연결' },
    { u0: -68.6, u1: -10.07, name: '고투몰 중앙', short: '중앙', sub: '화장품 · 렌즈 · 카페 · 8·8-2번 출구' },
    { u0: -10.07, u1: 40.6, name: '9호선 고속터미널역 개찰구', short: '9호선 홀', sub: '9호선 · 식물 휴게공간 · 1번 출구' },
    { u0: 40.6, u1: 359.6, name: '고투몰 EAST ZONE', short: 'EAST ZONE', sub: '여성의류 · 신발 · 가방 · 액세서리' },
    { u0: 359.6, u1: 368.3, name: '고투몰 동편 휴게', short: '동편', sub: '동편 푸드코트 방면' },
  ];
  const numRange = (line, u0, u1) => { const ns = shops.filter(S => S.line === line && S.uc >= u0 && S.uc < u1).map(S => S.no); if (!ns.length) return null; const f = n => `${line}-${String(n).padStart(3, '0')}`; return `${f(Math.min(...ns))}~${f(Math.max(...ns))}`; };
  for (const s of SECT) {
    const Ls = lay((s.u0 + s.u1) / 2);
    K.zone({ name: s.name, floor: 'B1', sub: s.sub, poly: R(s.u0, Ls.n - 0.3, s.u1, Ls.s + 0.3), y0: FL - 0.5, y1: CY, priority: 1 });
    // corridor segments (~40 m) named with the store-number ranges on both sides — the map's wayfinding layer
    const nseg = Math.max(1, Math.round((s.u1 - s.u0) / 42)), step = (s.u1 - s.u0) / nseg;
    for (let i = 0; i < nseg; i++) {
      const u0 = s.u0 + i * step, u1 = u0 + step, Lq = lay((u0 + u1) / 2), part = nseg > 1 ? ` ${i + 1}구간` : '';
      for (const [c0, c1, side, l1, l2] of [[Lq.fA, Lq.fB, '북측 통로', 'A', 'B'], [Lq.fC, Lq.fD, '남측 통로', 'C', 'D']]) {
        const rg = [numRange(l1, u0, u1), numRange(l2, u0, u1)].filter(Boolean).join(' · ');
        K.zone({ name: `${s.short} ${side}${part}`, floor: 'B1', sub: rg || s.sub, poly: R(u0, c0, u1, c1), y0: FL - 0.5, y1: CY, priority: 2 });
      }
    }
  }
  { const Lp0 = lay(-308); K.zone({ name: '서편 휴게광장', floor: 'B1', sub: '벤치 · 화단 · G2 출구', poly: R(-320.8, Lp0.fB - 1.2, -296, Lp0.fC + 1.2), y0: FL - 0.5, y1: CY, priority: 2 }); }
  K.zone({ name: '강남터미널 지하도상가 (고투몰)', floor: 'B1', sub: '점포 약 620개 · 10:00~22:00 · 통로 24시간', poly: band, y0: FL - 0.5, y1: CY + 0.2, priority: 0 });

  // ---------- halls: 3호선 / 9호선 ----------
  { // ticket machines along the north wall west of the 3호선 gates
    for (let i = 0; i < 4; i++) { const u = -100 + i * 1.3, v = vN(u) + 0.14; bx(u, u + 1.0, v, v + 0.65, FL, 1.75, 0x9fa8b0, { top: 0x6d757d }); vq({ tex: 'emit', color: 0x5aa0e6 }, u + 0.2, v + 0.66, u + 0.8, v + 0.66, FL + 1.0, FL + 1.45, '+v'); }
    const v = vN(-98) + 0.2; sg('교통카드 충전 · 1회용 발매기', -97.9, v + 0.05, -3.2, 4.6, 0.42, '+v', { bg: '#24282e', fg: '#fff' });
    { const [x, z] = P(-70.2, 0.2); K.box({ x, z, y: -3.05, w: 0.12, d: 3.6, h: 0.8, rotY: ROT, mat: 0xffffff, solid: false, skip: [] }); }
    sg('고속터미널', -70.27, 0.2, -2.62, 3.4, 0.62, '-u', { bg: '#ffffff', fg: '#1b1b1b', sub: '3호선 · 고속터미널역 · 339' });
    vq({ tex: 'emit', color: LINE[3] }, -70.27, 1.9, -70.27, -1.5, -3.04, -2.96, '-u');
    sg('3호선 · 7호선 환승', -70.13, 0.2, -2.62, 3.4, 0.62, '+u', { bg: LINE[3], fg: '#fff', sub: '개찰구 ← · 8-1번 출구 · 신세계백화점 연결' });
    for (let i = 0; i < 3; i++) { const u = -98 + i * 3.2, v = 4; bx(u, u + 2.4, v - 0.25, v + 0.25, FL, 0.45, M.wood); }
    // floor arrows toward the gates
    for (const u of [-95, -67]) { const [x, z] = P(u, -9.5); K.floorText(u < -80 ? '3호선 →' : '← 3호선', { x, z, y: FL + 0.01, w: 2.6, h: 0.8, rotY: ROT - Math.PI / 2, bg: '#ebe5d9', fg: LINE[3] }); }
  }
  { // 9호선 hall: lockers, planted rest area, station sign
    const u0 = 31.5, v = vN(u0 + 2) + 0.14; bx(u0, u0 + 4.8, v, v + 0.6, FL, 2.1, { tex: 'gt_locker' }, { top: 0x7d858e });
    sg('물품보관함', u0 + 2.4, v + 0.62, -3.6, 2.4, 0.4, '+v', { bg: '#24282e', fg: '#fff' });
    // 2026-11 photos 03–05: a planted water feature and segmented granite bench rings.
    // All furniture stays south of W9; its west approach and the mall's through path stay open.
    const arcPoly = (u, v, rx, rz, a0, a1, n = 20) => Array.from({ length: n + 1 }, (_, i) => {
      const a = a0 + (a1 - a0) * i / n; return P(u + Math.cos(a) * rx, v + Math.sin(a) * rz);
    });
    const ringPoly = (u, v, rx0, rz0, rx1, rz1, a0, a1, n = 16) =>
      [...arcPoly(u, v, rx1, rz1, a0, a1, n), ...arcPoly(u, v, rx0, rz0, a1, a0, n)];
    const blackGranite = M.darkStone;
    // Polished black island with pale diagonal and circular stone inlays (photo 05).
    fq(blackGranite, 1.35, 3.55, 9.05, 11.3, FL + 0.008);
    for (const shift of [-4, -1, 2, 5, 8]) {
      const a = Math.max(1.35, 3.55 - shift), b = Math.min(9.05, 11.3 - shift);
      if (b > a) K.hpoly(0xe4e1d8, ptsXZ([[a, a + shift], [b, b + shift], [b, b + shift + 0.11], [a, a + shift + 0.11]]), FL + 0.012);
    }
    K.hpoly(0xe4e1d8, arcPoly(5.2, 7.2, 3.28, 3.28, 0, Math.PI * 2, 48), FL + 0.014, true,
      [arcPoly(5.2, 7.2, 3.16, 3.16, 0, Math.PI * 2, 48)]);
    for (let k = 0; k < 3; k++) {
      const a0 = k * Math.PI * 2 / 3 + 0.12, a1 = a0 + 1.76;
      const foot = ringPoly(5.2, 7.2, 1.38, 1.38, 2.0, 2.0, a0, a1);
      K.prism(foot, FL + 0.08, FL + 0.2, { mat: 0xc4bfb1 });
      K.prism(foot, FL + 0.2, FL + 0.5, { mat: blackGranite });
      const a = (a0 + a1) / 2, [x, z] = P(5.2 + Math.cos(a) * 1.73, 7.2 + Math.sin(a) * 1.73);
      K.person(x, FL + 0.05, z, { sit: true, rotY: yawOf(Math.cos(a), Math.sin(a)), shirt: [0x314c49, 0x6d4551, 0xbcb59c][k] });
    }
    // Glass-and-metal centre column; plants are small foliage, not full-size street trees.
    const [cx, cz] = P(5.2, 7.2);
    K.cyl({ x: cx, y: FL + 0.08, z: cz, r: 0.56, h: 0.13, mat: blackGranite, seg: 12 });
    K.cyl({ x: cx, y: FL + 0.21, z: cz, r: 0.43, h: 2.05, mat: { tex: 'glass', color: 0xb4c3ae }, seg: 12, solid: false });
    for (let i = 0; i < 6; i++) {
      const a = i * Math.PI / 3, [x, z] = P(5.2 + Math.cos(a) * 0.43, 7.2 + Math.sin(a) * 0.43);
      K.box({ x, z, y: FL + 0.18, w: 0.045, d: 0.045, h: 2.12, mat: 0xa3a8a4, solid: false });
    }
    K.cyl({ x: cx, y: FL + 2.24, z: cz, r: 0.51, h: 0.15, mat: 0x363b37, seg: 12, solid: false });
    for (let i = 0; i < 18; i++) {
      const a = i * 2.4, rr = 0.15 + (i % 4) * 0.07, [x, z] = P(5.2 + Math.cos(a) * rr, 7.2 + Math.sin(a) * rr);
      K.box({ x, z, y: FL + 2.37 + (i % 3) * 0.05, w: 0.19, d: 0.17, h: 0.16, rotY: a, mat: [0x425a34, 0x5b723b, 0x708048][i % 3], solid: false });
    }
    // White curved planter rim, dark water and irregular pale rocks, thick trailing ivy (03).
    const pondOuter = arcPoly(16.1, 10.15, 3.55, 1.2, 0, Math.PI * 2, 36);
    const pondInner = arcPoly(16.1, 10.15, 3.38, 1.02, 0, Math.PI * 2, 36);
    K.prism(pondOuter, FL, FL + 0.82, { mat: 0xe1ddd0, holes: [pondInner] });
    K.hpoly({ tex: 'water', color: 0x35443c }, pondInner, FL + 0.67);
    K.prism(ringPoly(16.1, 10.15, 3.62, 1.27, 4.15, 1.82, Math.PI, Math.PI * 2, 24), FL + 0.12, FL + 0.48, { mat: 0xd9d3c1 });
    K.prism(ringPoly(16.1, 10.15, 3.64, 1.29, 4.1, 1.77, Math.PI, Math.PI * 2, 24), FL + 0.06, FL + 0.1, { mat: { tex: 'emit', color: 0xffcd78 }, solid: false });
    for (let i = 0; i < 7; i++) {
      const u = 13.3 + i * 0.88, v0 = 10.15 + Math.sin(i * 1.9) * 0.3;
      bx(u - 0.32, u + 0.32, v0 - 0.24, v0 + 0.24, FL + 0.63, 0.18 + (i % 3) * 0.09, [0x848779, 0x9b9d8d, 0x676f61][i % 3], { solid: false });
    }
    const greens = [0x3d6336, 0x4e703b, 0x658346, 0x7f9457, 0x476831];
    for (let i = 0; i < 132; i++) {
      const u = 12.85 + (i * 0.83 % 6.4), v0 = 9.65 + (i * 0.41 % 1.35), [x, z] = P(u, v0);
      K.box({ x, z, y: FL + 0.83 + (i % 7) * 0.055, w: 0.26 + (i % 3) * 0.055, d: 0.24, h: 0.08, rotY: i * 1.9, mat: greens[i % greens.length], solid: false });
    }
    for (const u of [13.7, 16.1, 18.5]) {
      const [x, z] = P(u, 8.65); K.person(x, FL + 0.03, z, { sit: true, rotY: FACE['-v'], shirt: u === 16.1 ? 0x7b3544 : 0xc2bba3 });
    }
    // Small orange curved information desk and black GOTOMALL portal seen in 03/04.
    K.prism(ringPoly(-0.15, 10.4, 0.45, 0.5, 1.28, 1.02, Math.PI, Math.PI * 2, 18), FL, FL + 1.0, { mat: 0xe87a1c });
    K.prism(ringPoly(-0.15, 10.4, 0.41, 0.46, 1.35, 1.08, Math.PI, Math.PI * 2, 18), FL + 1.0, FL + 1.06, { mat: 0xcb793b });
    sg('안내', -0.15, 9.33, FL + 0.66, 0.88, 0.3, '-v', { bg: null, fg: '#ffffff' });
    bx(-0.8, -0.2, 9.72, 10.12, FL + 1.06, 0.025, 0x32383b, { solid: false });
    bx(-0.8, -0.2, 9.99, 10.04, FL + 1.085, 0.34, 0x313940, { solid: false });
    for (const u of [10.0, 12.7]) bx(u, u + 0.11, 11.65, 11.82, FL, 2.92, 0x2b2b2b, { solid: false });
    sg('GOTOMALL', 11.4, 11.65, FL + 2.7, 2.9, 0.52, '-v', { bg: '#23262a', fg: '#ffae20', box: 0.12 });
    sg('중앙광장', 11.4, 11.64, FL + 2.3, 1.8, 0.25, '-v', { bg: '#23262a', fg: '#eeeae0' });
    // White curved cove slits above the ring, mixed with the hall's rectangular light panels.
    for (const rr of [2.8, 3.8, 4.8]) {
      const poly = ringPoly(5.2, 7.2, rr, rr * 0.64, rr + 0.14, (rr + 0.14) * 0.64, 0.12, 3.02, 30);
      K.prism(poly, CY - 0.18, CY - 0.07, { mat: 0xe3dfd5, bottom: M.led, solid: false });
    }
    for (const [u, v0] of [[1.5, 4.5], [10.5, 5], [15.5, 7.5], [20.5, 9.6]]) {
      bx(u - 1.5, u + 1.5, v0 - 0.65, v0 + 0.65, CY - 0.12, 0.08, 0xc9c4b9, { solid: false, skip: [] });
      fq(M.led, u - 1.35, v0 - 0.53, u + 1.35, v0 + 0.53, CY - 0.125, false);
    }
    sg('고속터미널역  ↑     출구 G1 ~ G6  →', -1.8, 2.1, FL + 2.75, 5.3, 0.46, '-u', { bg: '#20262d', fg: '#ffffff', twoSided: true });
    K.zone({ name: '중앙 식물 휴게공간', floor: 'B1', sub: '곡선 화단 · 수경시설 · 벤치', poly: R(1, 1.5, 24, vS(12) - 0.5), y0: FL - 0.5, y1: CY, priority: 2 });
    K.zone({ name: '중앙광장', floor: 'B1', sub: '원형 화강석 벤치 · 안내', poly: R(-2.2, 3.4, 11.5, 12.0), y0: FL - 0.5, y1: CY, priority: 3 });
    K.zone({ name: '9호선 개찰구 (승차)', floor: 'B1', sub: '9호선 타는 곳 · 급행/일반', poly: [[-2.5, -136.6], [0, -136.6], [0, -126.3], [-2.5, -126.3]], y0: FL - 0.5, y1: CY, priority: 4 });
    K.zone({ name: '3호선 개찰구 (승차)', floor: 'B1', sub: '3호선 타는 곳 · 7호선 환승', poly: [[-84.6, -106.4], [-73.4, -106.4], [-73.4, -104], [-84.6, -104]], y0: FL - 0.5, y1: CY, priority: 4 });
    // facility zones (map layer)
    K.zone({ name: '3호선 승강장 가는 곳', floor: 'B1', sub: '계단·에스컬레이터 → B2 승강장', rect: W3, y0: FL - 0.5, y1: CY, priority: 1 });
    K.zone({ name: '9호선 승강장 가는 곳', floor: 'B1', sub: '에스컬레이터 → B4 급행·일반 승강장', rect: W9, y0: FL - 0.5, y1: CY, priority: 1 });
    K.zone({ name: '교통카드 충전 · 발매기', floor: 'B1', sub: '1회용 교통카드 · 3·7호선', poly: R(-100.2, vN(-97) + 0.1, -94.6, vN(-97) + 1.6), y0: FL - 0.5, y1: CY, priority: 4 });
    K.zone({ name: '물품보관함', floor: 'B1', sub: '9호선 개찰구 앞', poly: R(31.3, vN(33.5) + 0.1, 36.5, vN(33.5) + 1.4), y0: FL - 0.5, y1: CY, priority: 4 });
  }

  // ---------- end halls: 서편 푸드코트 (bulge) and 동편 푸드코트 ----------
  function stallRow(list, frm, a0, a1, depthFn, zsub) {
    const n = list.length, w = (a1 - a0) / n;
    const fa = frm.au !== 0 ? 'u' : 'v';
    // fascia
    const p = [frm.pu + frm.au * a0, frm.pv + frm.av * a0], q = [frm.pu + frm.au * a1, frm.pv + frm.av * a1];
    wl(p[0], p[1], q[0], q[1], FY, CY, { mat: M.fascia, thick: 0.14 });
    list.forEach((it, i) => {
      const S = makeShop({ line: 'F' + fa + frm.pu.toFixed(1) + frm.pv.toFixed(1), a0: a0 + i * w, a1: a0 + (i + 1) * w, fr: frm, depth: depthFn, r: rnd() });
      buildShop(S, { fx: it.fx || 'food', name: it.name, sub: it.sub, bg: it.bg, fg: it.fg, menu: it.menu, glass: it.glass, zsub, floor: 0xd7d0c4, back: 0xf0ebe3 });
    });
  }
  function seating(u0, u1, v0, v1, avoid) {
    for (let u = u0; u <= u1; u += 3.0) for (let v = v0; v <= v1; v += 2.8) {
      if (avoid.some(([au, av]) => Math.abs(u - au) < 1.4 && Math.abs(v - av) < 1.4)) continue;
      bx(u - 0.4, u + 0.4, v - 0.4, v + 0.4, FL + 0.72, 0.04, 0xf3f1e9, { solid: false });
      bx(u - 0.05, u + 0.05, v - 0.05, v + 0.05, FL, 0.72, 0x444444);
      for (const du of [-0.75, 0.75]) {
        bx(u + du - 0.2, u + du + 0.2, v - 0.21, v + 0.21, FL + 0.41, 0.055, 0x292a28, { solid: false });
        bx(u + du + Math.sign(du) * 0.18 - 0.025, u + du + Math.sign(du) * 0.18 + 0.025, v - 0.21, v + 0.21, FL + 0.46, 0.4, 0x292a28, { solid: false });
        for (const a of [-0.16, 0.16]) for (const b of [-0.17, 0.17]) bx(u + du + a - 0.018, u + du + a + 0.018, v + b - 0.018, v + b + 0.018, FL, 0.42, 0x353735, { solid: false });
      }
      if (rnd() < 0.45) { const [x, z] = P(u - 0.75, v); K.person(x, FL, z, { sit: true, rotY: FACE['+u'] + Math.PI }); }
    }
  }
  function toilets(u0, u1, v0, vBack, doorFace) { // block between u0..u1, front at v0, back toward vBack (outer wall)
    const um = (u0 + u1) / 2, dir = Math.sign(vBack - v0);
    wallU(u0, u1, v0, FL, CY, { mat: M.wall, thick: 0.2, openings: [{ at: (um - u0) / 2, w: 1.5, y0: FL, y1: FL + 2.3 }, { at: (um - u0) * 1.5, w: 1.5, y0: FL, y1: FL + 2.3 }] });
    for (const u of [u0, um, u1]) wallV(u, v0, (dir > 0 ? vS(u) : vN(u)) - dir * 0.14, FL, CY, { mat: M.wall, thick: 0.2 });
    for (const [ua, ub2, label, col] of [[u0, um, '남자 화장실', '#1f5fa8'], [um, u1, '여자 화장실', '#c0392b']]) {
      const c = (ua + ub2) / 2; sg(label, c, v0 - dir * 0.12, FL + 2.75, 2.2, 0.45, doorFace, { bg: col, fg: '#fff', sub: '수유실 · 장애인 화장실 옆' });
      for (let i = 0; i < 3; i++) { const uu = ua + 0.6 + i * 1.35; if (uu + 1.2 > ub2 - 0.3) break; const vb = vBack - dir * 0.2; bx(uu, uu + 0.06, Math.min(vb, vb - dir * 1.6), Math.max(vb, vb - dir * 1.6), FL, 2.0, 0xc9d3dc); }
      const su = ua === u0 ? [ua + 0.12, ua + 0.65] : [ub2 - 0.65, ub2 - 0.12]; const sv = [v0 + dir * 0.5, v0 + dir * 2.9];
      bx(su[0], su[1], Math.min(...sv), Math.max(...sv), FL, 0.85, 0xf4f4f4, { top: 0xdcdcdc });
      const mu = ua === u0 ? ua + 0.12 : ub2 - 0.12; vq({ tex: 'emit', color: 0xcfd8de }, mu, Math.min(...sv), mu, Math.max(...sv), FL + 1.15, FL + 2.1, ua === u0 ? '+u' : '-u');
      fq(M.led, ua + 0.5, Math.min(v0, vBack) + 1.2, ub2 - 0.5, Math.min(v0, vBack) + 1.5, CY - 0.012, false);
    }
    K.zone({ name: '화장실 · 수유실', floor: 'B1', sub: '남자 · 여자 화장실', poly: R(u0, Math.min(v0, vBack), u1, Math.max(v0, vBack)), y0: FL - 0.5, y1: CY, priority: 4 });
  }

  { // ---- 서편 푸드코트 (west bulge, under the 강남터미널 고가) ----
    const north = [
      { name: '얌샘김밥', sub: '얌샘김밥 플러스 · 반포고투몰점', bg: '#1f6b3a', fg: '#fff', menu: ['김밥 · 라면 · 떡볶이', '돈가스 · 덮밥'] },
      { name: '냉면', sub: '푸드코트', bg: '#2a5d8f', menu: ['물냉면 · 비빔냉면', '만두'] },
      { name: '비빔밥', sub: '푸드코트', bg: '#8a4b1f', menu: ['돌솥비빔밥 · 된장찌개', '김치찌개'] },
      { name: '도넛 · 꽈배기', sub: '푸드코트', bg: '#c97a2b', menu: ['찹쌀도넛 · 꽈배기', '고로케'] },
      { name: '분식', sub: '푸드코트', bg: '#c0392b', menu: ['떡볶이 · 순대 · 튀김', '어묵'] },
      { name: '커피 · 생과일주스', sub: '푸드코트', bg: '#3b2a20', menu: ['아메리카노 · 라떼', '생과일주스'] },
    ];
    const fv = -16.8; // front line of the north stalls
    stallRow(north, { pu: 0, pv: fv, au: 1, av: 0, du: 0, dv: -1 }, -378.5, -341.5, u => fv - vN(u) - 0.14, '서편 푸드코트');
    const west = [
      { name: '칼국수', sub: '푸드코트', bg: '#6b3a1e', menu: ['칼국수 · 만두', '수제비'] },
      { name: '떡볶이', sub: '푸드코트', bg: '#b3261e', menu: ['떡볶이 · 순대', '튀김 · 어묵'] },
      { name: '돈가스 · 덮밥', sub: '푸드코트', bg: '#4b3b2b', menu: ['돈가스 · 제육덮밥', '우동'] },
    ];
    const fu = -382.0;
    const uW = v => edgesAtV(v)[0];
    stallRow(west, { pu: fu, pv: 0, au: 0, av: 1, du: -1, dv: 0 }, -10.5, 13.5, v => fu - uW(v) - 0.14, '서편 푸드코트');
    toilets(-372, -354, 20.2, 25.6, '-v');
    const cols = [];
    for (const u of [-345.8, -354.2, -362.6, -371.0]) for (const v of [-8, 0, 8]) { cols.push([u, v]); bx(u - 0.35, u + 0.35, v - 0.35, v + 0.35, FL, CY - FL, M.col, { skip: ['bottom', 'top'] }); }
    seating(-377, -337, -11.5, 15.5, [...cols, [-363, 19]]);
    for (let u = -376; u < -334; u += 5.6) for (let v = -10; v < 16; v += 5) { panelCove(u, v, 4.6, 3.8, FL + 3.5); downlight(u - 2.4, v - 1.8, FL + 3.5); }
    K.zone({ name: '고투몰 서편 푸드코트', floor: 'B1', sub: '얌샘김밥 · 냉면 · 비빔밥 · 화장실', poly: ptsXZ(bandUV.filter(p => p[0] < -320.5).concat([[-320.8, 16.4], [-320.8, -13.6]])), y0: FL - 0.5, y1: CY, priority: 1 });
    // hanging sign at the food court entrance
    for (const [face, du] of [['+u', 0.06], ['-u', -0.06]]) sg(face === '+u' ? '서편 푸드코트 · 화장실' : '← WEST ZONE · 3·7·9호선', -330 + du, 0, -2.62, 4.2, 0.58, face, { bg: '#1f2a3d', fg: '#fff', sub: 'WEST ZONE · GOTO MALL' });
    K.box({ x: P(-330, 0)[0], z: P(-330, 0)[1], y: -2.95, w: 0.1, d: 4.3, h: 0.62, rotY: ROT, mat: 0x1f2a3d, solid: false, skip: [] });
  }
  { // ---- 서편 휴게광장: wide benches ----
    for (const u of [-316, -310, -304]) for (const v of [-2.5, 4.5]) { bx(u - 2.0, u + 2.0, v - 0.3, v + 0.3, FL, 0.45, M.wood); }
    for (const u of [-313, -307]) { bx(u - 0.7, u + 0.7, 0.3, 1.7, FL, 0.65, { tex: 'darkstone', color: 0xa9a49b }, { top: { tex: 'grass', color: 0x6f9d4f } }); const [x, z] = P(u, 1.0); K.tree(x, z, { y: FL + 0.65, h: 2.4 }); }
    for (let i = 0; i < 6; i++) { const [x, z] = P(-317 + i * 2.6, i % 2 ? -2.5 : 4.5); K.person(x, FL, z, { sit: true, rotY: FACE[i % 2 ? '+v' : '-v'] + Math.PI }); }
  }
  { // ---- 동편 푸드코트 (east end, 잠원로) ----
    const east = [
      { name: '압구정칼국수', sub: '반포고투몰점', bg: '#7a2e1f', fg: '#fff', menu: ['칼국수 · 만두', '비빔국수'] },
      { name: '김밥', sub: '푸드코트', bg: '#1f6b3a', menu: ['김밥 · 라면', '떡볶이'] },
      { name: '냉면 · 비빔밥', sub: '푸드코트', bg: '#2a5d8f', menu: ['냉면 · 비빔밥', '된장찌개'] },
      { name: '도넛', sub: '푸드코트', bg: '#c97a2b', menu: ['찹쌀도넛 · 꽈배기'] },
      { name: '분식', sub: '푸드코트', bg: '#c0392b', menu: ['떡볶이 · 순대 · 튀김'] },
    ];
    const fu = 398.6, uE = v => { const e = edgesAtV(v); return e[e.length - 1]; };
    stallRow(east, { pu: fu, pv: 0, au: 0, av: 1, du: 1, dv: 0 }, -15.5, 9.5, v => uE(v) - 0.14 - fu, '동편 푸드코트');
    stallRow([{ name: 'Cafe 헤이와', sub: '동편 가장 안쪽 · G012', bg: '#efe6d6', fg: '#4a3324', fx: 'cafe', menu: ['핸드드립 · 라떼', '디저트'] }], { pu: fu, pv: 0, au: 0, av: 1, du: 1, dv: 0 }, 10.0, 15.2, v => uE(v) - 0.14 - fu, '동편 푸드코트');
    const north = [{ name: '떡볶이 · 튀김', sub: '푸드코트', bg: '#b3261e', menu: ['떡볶이 · 튀김 · 순대'] }, { name: 'COMPOSE COFFEE', sub: '컴포즈커피', bg: '#f0c321', fg: '#252525', fx: 'cafe', menu: ['커피 · 음료'] }, { name: '돈가스', sub: '푸드코트', bg: '#4b3b2b', menu: ['돈가스 · 우동'] }];
    const fv = -14.6;
    stallRow(north, { pu: 0, pv: fv, au: 1, av: 0, du: 0, dv: -1 }, 372.5, 396.5, u => fv - vN(u) - 0.14, '동편 푸드코트');
    toilets(371, 385, 13.6, 18.9, '-v');
    const cols = [];
    for (const u of [376.6, 385.0, 393.4]) for (const v of [-8, 0, 8]) { cols.push([u, v]); bx(u - 0.35, u + 0.35, v - 0.35, v + 0.35, FL, CY - FL, M.col, { skip: ['bottom', 'top'] }); }
    seating(372, 395, -11, 10.5, cols);
    for (let u = 374; u < 397; u += 5.6) for (let v = -10; v < 12; v += 5) { panelCove(u, v, 4.6, 3.8, FL + 3.5); downlight(u - 2.4, v - 1.8, FL + 3.5); }
    // 02: timber cafe seating hugs the east hall edge, with the centre kept as a passage.
    for (const u of [388.5, 392.0, 395.5]) {
      bx(u - 1.1, u + 1.1, 11.45, 11.95, FL + 0.39, 0.07, M.wood, { solid: false });
      bx(u - 1.1, u + 1.1, 11.9, 11.98, FL + 0.46, 0.4, M.wood, { solid: false });
    }
    for (const [u, v] of cols.slice(0, 3)) {
      bx(u - 0.38, u + 0.38, v + 0.36, v + 0.64, FL + 2.15, 0.4, 0xe4e2da, { solid: false });
      bx(u - 0.31, u + 0.31, v + 0.64, v + 0.66, FL + 2.18, 0.06, 0x74766f, { solid: false });
    }
    K.hpoly(M.darkStone, ptsXZ([[370.5, -3.4], [396.5, 5.0], [396.5, 5.16], [370.5, -3.24]]), FL + 0.012);
    bx(383.9, 384.7, -13.7, -13.58, FL + 0.04, 1.55, 0x282c2a, { solid: false });
    sg(['컴포즈커피', '커피 · 음료'], 384.3, -13.54, FL + 0.88, 0.69, 1.24, '+v', { bg: '#fff9e9', fg: '#4b3524', pxPerM: 100 });
    K.zone({ name: '고투몰 동편 푸드코트', floor: 'B1', sub: 'Cafe 헤이와 · 압구정칼국수 · 화장실', poly: ptsXZ(RUV(368.3, -18.6, 404, 19.7)), y0: FL - 0.5, y1: CY, priority: 1 });
    for (const [face, du] of [['+u', 0.06], ['-u', -0.06]]) sg(face === '-u' ? '동편 푸드코트 · 화장실' : 'EAST ZONE · 3·7·9호선 →', 364 + du, 0, -2.62, 4.2, 0.58, face, { bg: '#1f2a3d', fg: '#fff', sub: 'EAST ZONE · GOTO MALL' });
    K.box({ x: P(364, 0)[0], z: P(364, 0)[1], y: -2.95, w: 0.1, d: 4.3, h: 0.62, rotY: ROT, mat: 0x1f2a3d, solid: false, skip: [] });
  }

  // ---------- exits ----------
  const ADS = [[['GOTO MALL', '신상품 입고'], '#c2185b', '강남터미널 지하쇼핑센터'], [['반포한강공원', '지하보도 →'], '#2e7d32', '스트리트갤러리 · 핑크라인 따라'], [['고투몰', '매장 안내'], '#1f3b5a', 'gotomall.kr · 02-535-8182'], [['경부선', '고속버스'], '#455a64', '서울고속버스터미널 · 1번 출구'], [['3·7·9호선', '고속터미널역'], '#6d4c41', '환승 안내']];
  let adN = 0;
  for (const X of EXITS) buildExit(X);
  function buildExit(X) {
    const a = X.a, c = X.c, E = X.E;
    const rect = (al0, al1, ac0, ac1) => { const p = E(al0, ac0), q = E(al1, ac1); return [Math.min(p[0], q[0]), Math.min(p[1], q[1]), Math.max(p[0], q[0]), Math.max(p[1], q[1])]; };
    const polyOf = r => R(r[0], r[1], r[2], r[3]);
    const wallAlong = (al0, al1, ac, y0, y1, o) => { const p = E(al0, ac), q = E(al1, ac); wl(p[0], p[1], q[0], q[1], y0, y1, o); };
    const wallAcross = (al, ac0, ac1, y0, y1, o) => { const p = E(al, ac0), q = E(al, ac1); wl(p[0], p[1], q[0], q[1], y0, y1, o); };
    const faceA = a[0] === 1 ? '+u' : a[0] === -1 ? '-u' : a[1] === 1 ? '+v' : '-v';
    const faceNA = { '+u': '-u', '-u': '+u', '+v': '-v', '-v': '+v' }[faceA];
    const HOLE = 9.0, L0 = 11.5, L1 = 14.5, END = X.elevator ? 16.9 : L1;
    const northCanopy = X.side === 'N';
    // bp_02: 8-1 extends west of the bus shelter, leaving the lift freestanding at its east end.
    // bp_34 aerial: 8-2 roof instead covers the full eastward run. Keep B1 geometry unchanged.
    const CAN0 = X.id === '8-1' ? -7 : -0.1, CAN1 = CAN0 + 16;
    const metro = X.kind === 'metro';
    const title = metro ? `${X.id}번 출구` : `${X.id} 출구`;
    // stairs (two flights) + landings
    const s0 = E(0, 0), s5 = E(5, 0), s65 = E(6.5, 0), s115 = E(L0, 0);
    const pa = P(...s5), pb = P(...s0), pc = P(...s115), pd = P(...s65);
    K.stairs(pa[0], pa[1], pb[0], pb[1], { w: 3.2, ya: -3, yb: 0, mat: { tex: 'tile', color: 0xd9d4ca }, sideMat: 0x8c8882 });
    if (X.id === 'G4') {
      // 06 shows an escalator beyond the G4 doors. Preserve the upper exterior stair flight.
      const sa = P(...E(L0, -0.55)), sb = P(...E(6.5, -0.55));
      const ea = P(...E(L0, 1.1)), eb = P(...E(6.5, 1.1));
      K.stairs(sa[0], sa[1], sb[0], sb[1], { w: 2.1, ya: FL, yb: -3, mat: M.floor, sideMat: 0x8c8882 });
      K.escalator(ea[0], ea[1], eb[0], eb[1], { w: 0.82, ya: FL, yb: -3, dir: 'up', mat: 0x626867 });
    } else K.stairs(pc[0], pc[1], pd[0], pd[1], { w: 3.2, ya: FL, yb: -3, mat: { tex: 'tile', color: 0xd9d4ca }, sideMat: 0x8c8882 });
    K.slab(polyOf(rect(5, 6.5, -1.65, 1.65)), -3, { mat: { tex: 'tile', color: 0xd9d4ca }, under: 0x9a968f, thick: 0.25, ceil: false });
    K.slab(polyOf(rect(L0, X.elevator ? L1 + 0.25 : END + 0.05, -1.65, 1.65)), FL, { mat: M.floor, under: false });
    // covered part ceiling
    K.slab(polyOf(rect(HOLE, END + 0.1, -1.85, 1.85)), CY + 0.3, { mat: 'concrete', under: M.ceil, thick: 0.3, walk: false, edge: false });
    fq(M.led, ...rect(HOLE + 0.6, END - 0.4, -0.15, 0.15), CY - 0.012, false);
    // ground hole over the open stairwell
    K.groundHole(polyOf(rect(-0.1, HOLE, -1.85, 1.85)));
    // Underground walls; north-side surface plinths are built separately below.
    const passAlong = a[1] === 0; // passage leaves through a side wall (else through the end)
    for (const sgn of [-1, 1]) {
      const toBand = passAlong && sgn === X.bandSideAc;
      wallAlong(-0.1, HOLE, sgn * 1.75, -6.3, northCanopy ? 0 : 1.0, { mat: sgn > 0 ? M.granite : M.wall, mat2: sgn > 0 ? M.wall : M.granite, thick: 0.2, capMat: 0xcfc9bf });
      wallAlong(HOLE, END, sgn * 1.75, -6.3, CY, { mat: M.wall, thick: 0.2, openings: toBand ? [{ at: (L0 + L1) / 2 - HOLE, w: 3.0, y0: FL, y1: -3.25 }] : [] });
    }
    wallAcross(HOLE, -1.85, 1.85, CY, northCanopy ? 0 : 1.0, { mat: M.wall, mat2: M.granite, thick: 0.2, capMat: 0xcfc9bf });
    if (passAlong) wallAcross(END, -1.85, 1.85, -6.3, CY, { mat: M.wall, thick: 0.2 });
    // passage to the band
    const [pu0, pv0, pu1, pv1] = X.pass;
    K.slab(R(pu0, pv0, pu1, pv1), FL, { mat: M.floor, under: false, edge: false });
    K.slab(R(pu0 - 0.1, pv0, pu1 + 0.1, pv1), CY + 0.3, { mat: 'concrete', under: M.ceil, thick: 0.3, walk: false, edge: false });
    if (pv1 - pv0 > 0.7) {
      wallV(pu0, pv0, pv1, FL, CY, { mat: M.wall, thick: 0.2 }); wallV(pu1, pv0, pv1, FL, CY, { mat: M.wall, thick: 0.2 });
      fq(M.led, (pu0 + pu1) / 2 - 0.12, pv0 + 0.3, (pu0 + pu1) / 2 + 0.12, pv1 - 0.3, CY - 0.012, false);
      if (pv1 - pv0 > 4) for (let v = pv0 + 1.2; v < pv1 - 2.2; v += 3.2) { // ad lightboxes on the passage walls
        const ad = ADS[(adN++) % ADS.length], ad2 = ADS[(adN++) % ADS.length];
        sg(ad[0], pu0 + 0.12, v + 0.9, FL + 1.7, 1.7, 1.5, '+u', { bg: ad[1], fg: '#fff', sub: ad[2] });
        sg(ad2[0], pu1 - 0.12, v + 0.9, FL + 1.7, 1.7, 1.5, '-u', { bg: ad2[1], fg: '#fff', sub: ad2[2] });
      }
    }
    // inner signage: header over the tunnel mouth (seen while descending) and over the mall-side opening
    const hm = E(HOLE - 0.12, 0);
    sg(metro ? '고속터미널역' : 'GOTO MALL 고투몰', hm[0], hm[1], -1.1, 3.0, 0.55, faceNA, { bg: '#1f2a3d', fg: '#fff', sub: metro ? '3·7·9호선 · GOTO MALL 강남터미널 지하쇼핑센터' : '강남터미널 지하쇼핑센터 · 3·7·9호선 고속터미널역' });
    const inward = X.side === 'N' ? 1 : -1; // +v into the band from a north gate
    const Ly = lay(X.uc), inHall = ['l3', 'l9'].includes(sectionOf(X.uc).key), front = inHall ? X.eV + inward * 1.0 : X.side === 'N' ? Ly.fA : Ly.fD;
    // Photos 06/07/12: blue G4, green G13 and pink 8-1 headers, glass threshold doors.
    const gateColor = X.id === 'G4' ? '#1d6fb8' : X.id === 'G13' ? '#3b8445' : X.id === '8-1' ? '#bc7380' : '#252627';
    const gateDest = X.id === 'G4' ? '반포한강공원' : X.id === 'G13' ? '고속버스터미널(경부·영동선)' : X.dest;
    sg(`${title} ↑`, X.uc, front + inward * 0.06, FL + 2.46, 3.0, 0.45, inward > 0 ? '+v' : '-v', { bg: gateColor, fg: '#ffffff', sub: (X.gate ? X.gate + ' · ' : '') + gateDest });
    // back face, read when stepping from the exit passage into the mall (facing +v at a north gate: east is on the left)
    sg('GOTO MALL 고투몰', X.uc, front - inward * 0.06, FL + 2.46, 3.0, 0.45, inward > 0 ? '-v' : '+v', { bg: gateColor, fg: '#ffffff', sub: inward > 0 ? '← EAST ZONE · 9호선    WEST ZONE · 3호선 →' : '← WEST ZONE · 3호선    EAST ZONE · 9호선 →' });
    K.box({ x: P(X.uc, front)[0], z: P(X.uc, front)[1], y: FL + 2.2, w: 3.1, d: 0.1, h: 0.5, rotY: ROT, mat: 0x333735, solid: false, skip: [] });
    if (['G4', 'G13', '8-1'].includes(X.id)) {
      const face = inward > 0 ? '+v' : '-v', gateV = X.eV + inward * 0.22;
      for (const side of [-1, 1]) {
        const u = X.uc + side * 1.16;
        bx(u - 0.24, u + 0.24, gateV - 0.02, gateV + 0.02, FL + 0.03, 2.12, 'glass', { solid: false });
        bx(u + side * 0.24 - 0.025, u + side * 0.24 + 0.025, gateV - 0.04, gateV + 0.04, FL, 2.2, 0x9da49f, { solid: false });
        // Door leaves sit open against the sides; preserve the original clear walking lane.
        bx(X.uc + side * 0.91 - 0.02, X.uc + side * 0.91 + 0.02, gateV, gateV + inward * 0.75, FL + 0.03, 2.12, 'glass', { solid: false });
        sg(side < 0 ? (X.id.startsWith('G') ? 'G' : '8') : X.id.replace(/^G|^8/, ''), u, gateV + inward * 0.035, FL + 0.67, 0.43, 0.78, face, { bg: null, fg: side < 0 ? '#eeeeec' : gateColor, pxPerM: 100 });
        bx(u - 0.03, u + 0.03, gateV + inward * 0.06, gateV + inward * 0.1, FL + 0.82, 0.48, 0xa2aaa5, { solid: false });
      }
      sg('비상구', X.uc, gateV + inward * 0.06, FL + 2.85, 0.48, 0.27, face, { bg: '#25a953', fg: '#ffffff' });
      const tv0 = Math.min(gateV, front + inward * 0.6), tv1 = Math.max(gateV, front + inward * 0.6);
      fq(0xd7ae35, X.uc - 0.19, tv0, X.uc + 0.19, tv1, FL + 0.014);
      fq(0xe0b745, X.uc - 1.4, gateV - 0.22, X.uc + 1.4, gateV + 0.22, FL + 0.015);
      for (const du of [-0.13, -0.065, 0, 0.065, 0.13]) fq(0xf0c95e, X.uc + du - 0.012, tv0, X.uc + du + 0.012, tv1, FL + 0.018);
    }
    // ---- street level: canopy, glass, header sign ----
    if (northCanopy) {
      // 2026 bp_02: low grey stone, almost full-height green glass and fine light steel.
      const BASE = 0.45, TOP = 2.8, RAKE = CAN1 - 0.75, FRAME = 0xa3a8ab;
      const glass = { tex: 'glass', color: 0x9fbfae };
      const cbx = (al0, al1, ac0, ac1, y, h, mat) => { const r = rect(al0, al1, ac0, ac1); bx(r[0], r[2], r[1], r[3], y, h, mat, { solid: false, skip: [] }); };
      const vertex = (al, ac, y) => { const [x, z] = P(...E(al, ac)); return [x, y, z]; };
      // Solid-looking 80 mm fins, sloping in the length/height plane (no dark outline).
      const fin = (al0, y0, al1, y1, ac) => {
        const da = al1 - al0, dy = y1 - y0, len = Math.hypot(da, dy), oa = dy * 0.04 / len, oy = -da * 0.04 / len;
        const section = [[al0 - oa, y0 - oy], [al1 - oa, y1 - oy], [al1 + oa, y1 + oy], [al0 + oa, y0 + oy]];
        const p = side => section.map(([al, y]) => vertex(al, ac + side * 0.04, y));
        const left = p(-1), right = p(1);
        K.quad(FRAME, left, [-DV[0], 0, -DV[1]]); K.quad(FRAME, right, [DV[0], 0, DV[1]]);
        for (let i = 0; i < 4; i++) {
          const j = (i + 1) % 4, na = section[i][1] - section[j][1], ny = section[j][0] - section[i][0], nl = Math.hypot(na, ny);
          K.quad(FRAME, [left[i], left[j], right[j], right[i]], [DU[0] * na / nl, ny / nl, DU[1] * na / nl]);
        }
      };
      for (const side of [-1, 1]) {
        wallAlong(CAN0, CAN1, side * 1.75, 0, BASE, { mat: 0x8e8f8c, thick: 0.2, capMat: 0x8e8f8c });
        wallAlong(CAN0, RAKE, side * 1.75, BASE, TOP, { mat: glass, thick: 0.03 });
        const n = [DV[0] * side, 0, DV[1] * side];
        K.quad(glass, [vertex(RAKE, side * 1.75, BASE), vertex(CAN1, side * 1.75, BASE), vertex(RAKE, side * 1.75, TOP), vertex(RAKE, side * 1.75, TOP)], n);
        for (let al = CAN0; al < RAKE - 0.04; al += 1.5) cbx(al - 0.04, al + 0.04, side * 1.75 - 0.04, side * 1.75 + 0.04, BASE, TOP - BASE, FRAME);
        cbx(RAKE - 0.04, RAKE + 0.04, side * 1.75 - 0.04, side * 1.75 + 0.04, BASE, TOP - BASE, FRAME);
        cbx(CAN0, RAKE, side * 1.75 - 0.04, side * 1.75 + 0.04, TOP - 0.08, 0.08, FRAME);
        for (let al = CAN0 + 4.5; al < RAKE; al += 4.5) fin(al, BASE, al - 0.65, TOP, side * 1.75);
        fin(CAN1, BASE, RAKE, TOP, side * 1.75);
      }
      wallAcross(CAN1, -1.85, 1.85, 0, BASE, { mat: 0x8e8f8c, thick: 0.2, capMat: 0x8e8f8c });
      // Flush roof and raked glazed closed end; transverse roof ribs at 2.5 m centres.
      K.quad(glass, [vertex(CAN0, -1.75, TOP), vertex(RAKE, -1.75, TOP), vertex(RAKE, 1.75, TOP), vertex(CAN0, 1.75, TOP)], [0, 1, 0]);
      K.quad(glass, [vertex(RAKE, -1.75, TOP), vertex(CAN1, -1.75, BASE), vertex(CAN1, 1.75, BASE), vertex(RAKE, 1.75, TOP)], [DU[0] * (TOP - BASE) / Math.hypot(TOP - BASE, 0.75), 0.75 / Math.hypot(TOP - BASE, 0.75), DU[1] * (TOP - BASE) / Math.hypot(TOP - BASE, 0.75)]);
      for (let al = CAN0; al < RAKE; al += 2.5) cbx(al - 0.04, al + 0.04, -1.75, 1.75, TOP - 0.08, 0.08, FRAME);
      for (const al of [CAN0, RAKE]) cbx(al, al + 0.08, -1.75, 1.75, TOP - 0.15, 0.15, FRAME);
      // Collision stays just inside the sloping end, without adding a visible vertical glass panel.
      wallAcross(RAKE, -1.75, 1.75, BASE, TOP, { mat: 'gt_canopy_collision', thick: 0.02 });
      const hp = ac => E(CAN0 - 0.06, ac);
      cbx(CAN0 - 0.07, CAN0 - 0.02, -1.3, 1.3, 2.18, 0.4, FRAME);
      if (metro) {
        sg(X.id, ...hp(-1.02), 2.38, 0.42, 0.3, faceNA, { bg: '#f5c400', fg: '#111', pxPerM: 110 });
        sg('고속터미널역', ...hp(-0.04), 2.38, 1.3, 0.25, faceNA, { bg: '#e5e9e6', fg: '#303a36', pxPerM: 110 });
        [3, 7, 9].forEach((ln, i) => sg(String(ln), ...hp(0.78 + i * 0.19), 2.38, 0.17, 0.21, faceNA, { bg: LINE[ln], fg: '#fff', pxPerM: 110 }));
      } else sg(`고투몰 ${X.id}`, ...hp(0), 2.38, 2.3, 0.28, faceNA, { bg: '#e5e9e6', fg: '#303a36', pxPerM: 110 });
    } else {
    for (const al of [-0.1, HOLE / 2, HOLE]) for (const sgn of [-1, 1]) { const [u, v] = E(al, sgn * 1.75); const [x, z] = P(u, v); K.box({ x, z, y: 1.0, w: 0.12, d: 0.12, h: 1.78, rotY: ROT, mat: 0x4c5258, solid: false }); }
    for (const sgn of [-1, 1]) wallAlong(-0.1, HOLE, sgn * 1.75, 1.0, 2.6, { mat: 'glass', thick: 0.03 });
    wallAcross(HOLE, -1.75, 1.75, 1.0, 2.6, { mat: 'glass', thick: 0.03 });
    { const r = rect(-0.7, HOLE + 0.3, -2.05, 2.05); bx(r[0], r[2], r[1], r[3], 2.78, 0.05, { tex: 'glass', color: 0xa8c6d8 }, { solid: false, skip: [] });
      for (const sgn of [-1, 1]) { const q = rect(-0.7, HOLE + 0.3, sgn * 2.05 - 0.06, sgn * 2.05 + 0.06); bx(q[0], q[2], q[1], q[3], 2.7, 0.12, 0x4c5258, { solid: false, skip: [] }); } }
    { const q = rect(-0.78, -0.62, -2.05, 2.05); bx(q[0], q[2], q[1], q[3], 2.12, 0.66, 0x2b3038, { solid: false, skip: [] }); }
    const hp = ac => E(-0.8, ac); // across offset: + = reading direction (right)
    if (metro) {
      sg('고속터미널역', ...hp(-0.1), 2.55, 2.1, 0.4, faceNA, { bg: '#2b3038', fg: '#fff', pxPerM: 96 });
      sg('Express Bus Terminal', ...hp(-0.1), 2.25, 2.1, 0.18, faceNA, { bg: '#2b3038', fg: '#c9d0d8', bold: false });
      sg(X.id, ...hp(-1.55), 2.45, 0.8, 0.52, faceNA, { bg: '#f5c400', fg: '#111', pxPerM: 96 });
      [3, 7, 9].forEach((ln, i) => sg(String(ln), ...hp(1.25 + i * 0.3), 2.45, 0.26, 0.26, faceNA, { bg: LINE[ln], fg: '#fff' }));
    } else {
      sg(`GOTO MALL  ${X.id}`, ...hp(0), 2.52, 3.8, 0.4, faceNA, { bg: '#2b3038', fg: '#fff', pxPerM: 96 });
      sg(`강남터미널 지하쇼핑센터 · ${X.dest}`, ...hp(0), 2.24, 3.8, 0.18, faceNA, { bg: '#2b3038', fg: '#ffd84a', bold: false });
    }
    // side sign on the parapet (outer face) for pedestrians walking along the sidewalk
    { const side = (X.side === 'N' ? -1 : 1) * (a[1] === 0 ? 1 : 0); if (side) { const p = E(HOLE / 2, side * 1.87); sg(metro ? `고속터미널역 ${X.id}` : `GOTO MALL ${X.id}`, p[0], p[1], 0.55, 2.6, 0.32, side > 0 ? '+v' : '-v', { bg: '#2b3038', fg: '#fff', sub: X.dest }); } }
    }
    // ---- step-free access ----
    const Q = (al, ac) => P(...E(al, ac));
    const ebx = (al0, al1, ac0, ac1, y, h, mat, o) => { const r = rect(al0, al1, ac0, ac1); bx(r[0], r[2], r[1], r[3], y, h, mat, o); };
    const cvec = (sgn) => { const cu = c[0] * sgn, cv = c[1] * sgn; return [DU[0] * cu + DV[0] * cv, DU[1] * cu + DV[1] * cv]; };
    const faceC = sgn => (c[0] !== 0 ? (c[0] * sgn > 0 ? '+u' : '-u') : (c[1] * sgn > 0 ? '+v' : '-v'));
    if (X.elevator) {
      // bp_01 + corrected manifest: the freestanding glass lift is beside 8-1, not 8-2.
      // Keep the B1 cabin at the existing passage end; the small horizontal offset is recorded as a guess.
      const e0 = L1 + 0.25, e1 = e0 + 2.0, ew = 1.0, dw = 0.6;
      const steel = 0xc3c8cd, frame = 0x6b7075;
      K.slab(polyOf(rect(e0, e1, -ew, ew)), FL, { mat: { tex: 'metal', color: 0xb0b5ba }, ceil: false, edge: false });
      wallAcross(e1, -ew, ew, FL, CY, { mat: steel, thick: 0.12 });
      for (const side of [-1, 1]) wallAlong(e0, e1, side * ew, FL, CY, { mat: steel, thick: 0.12 });
      for (const [p0, p1] of [[-ew, -dw], [dw, ew]]) wallAcross(e0, p0, p1, FL, CY, { mat: steel, thick: 0.12 });
      wallAcross(e0, -dw, dw, FL + 2.2, CY, { mat: steel, thick: 0.12 });
      sg('엘리베이터', ...E(e0 - 0.08, 0), FL + 2.5, 1.1, 0.22, faceNA, { bg: '#e1e5e5', fg: '#303a36' });
      // 2.6 × 2.6 m, 4 m high; north/east/west glazing and south-facing doors.
      const ex = -84, ez = -113, HALF = 1.25, TOPY = 4.0, ROOF = TOPY - 0.06;
      const x0 = ex - HALF, x1 = ex + HALF, z0 = ez - HALF, z1 = ez + HALF;
      const footprint = [[x0, z0], [x1, z0], [x1, z1], [x0, z1]];
      const sides = [[x0, z0, x1, z0], [x0, z0, x0, z1], [x1, z0, x1, z1]];
      K.slab(footprint, 0, { mat: 0x8e8f8c, thick: 0.06, ceil: false, edge: false });
      for (const edge of sides) {
        K.wall(...edge, 0, 0.4, { mat: 0x8e8f8c, thick: 0.1 });
        K.wall(...edge, 0.4, ROOF, { mat: 'gt_lift_glass', thick: 0.025 });
      }
      for (const [a0, a1] of [[x0, ex - 0.65], [ex + 0.65, x1]]) {
        K.wall(a0, z1, a1, z1, 0, 0.4, { mat: 0x8e8f8c, thick: 0.1 });
        K.wall(a0, z1, a1, z1, 0.4, ROOF, { mat: 'gt_lift_glass', thick: 0.025 });
      }
      K.wall(ex - 0.65, z1, ex + 0.65, z1, 2.25, ROOF, { mat: 'gt_lift_glass', thick: 0.025 });
      for (const x of [x0, x1]) for (const z of [z0, z1]) K.box({ x, z, y: 0.4, w: 0.1, d: 0.1, h: ROOF - 0.4, mat: frame, solid: false });
      for (const y of [0.4, 2.25]) {
        for (const z of [z0, z1]) K.box({ x: ex, z, y, w: 2.5, d: 0.06, h: 0.06, mat: frame, solid: false });
        for (const x of [x0, x1]) K.box({ x, z: ez, y, w: 0.06, d: 2.5, h: 0.06, mat: frame, solid: false });
      }
      // Open, flush threshold; thin glass door leaves are visual only, as with the other elevator cars.
      for (const side of [-1, 1]) {
        K.box({ x: ex + side * 0.65, z: z1, y: 0, w: 0.06, d: 0.08, h: 2.25, mat: frame, solid: false });
        K.box({ x: ex + side * 0.325, z: z1, y: 0.02, w: 0.63, d: 0.018, h: 2.17, mat: 'gt_lift_glass', solid: false });
      }
      K.box({ x: ex, z: ez, y: ROOF, w: 2.6, d: 2.6, h: 0.06, mat: frame, solid: false });
      const [bx1, bz1] = Q((e0 + e1) / 2, 0);
      const elevator = K.elevator({ name: `${title} 엘리베이터`, x: ex, z: ez, rotY: 0, w: 2.6, d: 2.6, shaft: false,
        floors: [{ label: '1F', y: 0, name: '신반포로 보도 · 8-1번 출구' }, { label: 'B1', y: FL, name: '고투몰 · 고속터미널역', dx: bx1 - ex, dz: bz1 - ez }] });
      K.interact({ x: bx1, z: bz1, y: FL, r: 1.5, label: elevator.name, elevator });
      K.zone({ name: elevator.name, floor: '1F', sub: 'B1 고투몰 연결', poly: footprint, y0: -0.1, y1: TOPY, priority: 4 });
      K.zone({ name: elevator.name, floor: 'B1', sub: '지상 1F · 8-1번 출구', poly: polyOf(rect(e0, e1, -ew, ew)), y0: FL - 0.5, y1: CY, priority: 4 });
    } else if (X.wheelchairLift !== false) {
      // Existing inclined lifts use the 2011 general reference; do not invent a replacement lift at 8-2.
      const ls = passAlong ? -X.bandSideAc : 1, acR = ls * 1.58, yel = 0xf2c300;
      const n = cvec(-ls), prof = [[-0.45, 0], [0, 0], [5, -3], [6.5, -3], [L0, FL], [L0 + 0.9, FL]];
      for (const [hy, hh, col] of [[0.82, 0.07, 0x9aa1a8], [0.22, 0.05, 0x7d858e]]) for (let i = 0; i < prof.length - 1; i++) {
        const [a0, y0] = prof[i], [a1, y1] = prof[i + 1]; const A0 = Q(a0, acR), A1 = Q(a1, acR), B0 = Q(a0, acR + ls * 0.07), B1 = Q(a1, acR + ls * 0.07);
        K.quad(col, [[A0[0], y0 + hy, A0[1]], [A1[0], y1 + hy, A1[1]], [A1[0], y1 + hy + hh, A1[1]], [A0[0], y0 + hy + hh, A0[1]]], [n[0], 0, n[1]]);
        K.quad(col, [[A0[0], y0 + hy + hh, A0[1]], [A1[0], y1 + hy + hh, A1[1]], [B1[0], y1 + hy + hh, B1[1]], [B0[0], y0 + hy + hh, B0[1]]], [0, 1, 0]);
      }
      for (const al of [1.5, 4.0, 8.0, 10.5]) { const y = al < 5 ? -3 * al / 5 : -3 - 3 * (al - 6.5) / 5; ebx(al - 0.04, al + 0.04, acR, acR + ls * 0.07, y, 0.85, 0x7d858e, { solid: false, skip: [] }); }
      // folded platform parked at the bottom landing (yellow safety colour) + call panels top and bottom
      ebx(L0 + 0.05, L0 + 0.95, Math.min(acR, acR - ls * 0.32), Math.max(acR, acR - ls * 0.32), FL + 0.1, 1.0, yel, { solid: false, skip: [] });
      ebx(L0 + 0.1, L0 + 0.9, Math.min(acR - ls * 0.32, acR - ls * 0.36), Math.max(acR - ls * 0.32, acR - ls * 0.36), FL + 0.15, 0.85, 0x30353b, { solid: false, skip: [] });
      ebx(-0.62, -0.5, Math.min(acR, acR - ls * 0.12), Math.max(acR, acR - ls * 0.12), 0, 1.05, 0x7d858e, { solid: false, skip: [] });
      ebx(-0.64, -0.48, Math.min(acR, acR - ls * 0.14), Math.max(acR, acR - ls * 0.14), 1.05, 0.28, yel, { solid: false, skip: [] });
      sg('휠체어리프트', ...E(-0.65, acR - ls * 0.07), 1.19, 0.15, 0.1, faceNA, { bg: '#f2c300', fg: '#111', pxPerM: 400, offset: 0.004 });
      sg(['휠체어리프트', '호출 버튼 · 직원 도움'], ...E(L0 + 1.6, acR + ls * 0.07), FL + 1.75, 0.95, 0.38, faceC(-ls), { bg: '#f2c300', fg: '#111', bold: false, offset: 0.01 });
      const [ex, ez] = Q(L0 + 0.8, ls * 0.9), top = Q(-1.0, ls * 0.9);
      K.elevator({ name: `${title} 휠체어리프트`, x: ex, z: ez, rotY: FACE[faceA], w: 2.0, d: 2.0, shaft: false, floors: [{ label: '1F', y: 0, name: `신반포로 보도 · ${title}`, dx: top[0] - ex, dz: top[1] - ez }, { label: 'B1', y: FL, name: '고투몰 지하상가' }] });
      K.portal({ x: top[0], y: 0, z: top[1], r: 1.4, label: `${title} 휠체어리프트 · B1 고투몰로`, to: { x: ex, y: FL + 0.05, z: ez, yaw: yawOf(a[0], a[1]) } });
    }
    // zone for the whole exit (stair + passage)
    const ext = rect(-0.1, END, -1.85, 1.85);
    K.zone({ name: metro ? `고속터미널역 ${title}` : `고투몰 ${title}`, floor: 'B1', sub: `${X.gate ? X.gate + ' · ' : ''}${X.dest}`, poly: polyOf(ext), y0: FL - 0.5, y1: 3.0, priority: 3 });
    if (pv1 - pv0 > 0.7) K.zone({ name: metro ? `${title} 연결통로` : `${title} 연결통로`, floor: 'B1', sub: X.dest, poly: R(pu0, pv0, pu1, pv1), y0: FL - 0.5, y1: CY, priority: 3 });
  }

  // junction signage (owners build the corridors)
  for (const J of JUNC) {
    const Ly = lay(J.u);
    // short jamb returns outside the opening so the seam to the owner's (8 m) corridor never shows the void
    for (const sg2 of [-1, 1]) wallV(J.u + sg2 * 4.3, J.e + 0.12, J.e + 1.4, FL, CY + 0.3, { mat: M.wall, thick: 0.2 });
    K.zone({ name: `${J.to.split(' · ')[0]} 연결통로`, floor: 'B1', sub: `${J.id} · ${J.to}`, poly: R(J.u - 4.2, J.e - 6.5, J.u + 4.2, J.e), y0: FL - 0.5, y1: CY, priority: 3 });
    sg(J.to.split(' · ')[0] + ' ↑', J.u, Ly.fD - 0.06, FL + 2.46, 3.6, 0.45, '-v', { bg: '#252627', fg: '#ffd84a', sub: J.to + ' · 연결통로' });
    sg('GOTO MALL 고투몰', J.u, Ly.fD + 0.06, FL + 2.46, 3.6, 0.45, '+v', { bg: '#252627', fg: '#ffffff', sub: '← WEST ZONE · 3호선    EAST ZONE · 9호선 →' });
    K.box({ x: P(J.u, Ly.fD)[0], z: P(J.u, Ly.fD)[1], y: FL + 2.2, w: 3.7, d: 0.1, h: 0.5, rotY: ROT, mat: 0x252627, solid: false, skip: [] });
  }

  // ---------- 안내도: photos 10/11, charcoal ground / three coloured zones / pale twin spine ----------
  // The photographed vertical diagram is schematic, not geographic north. Keep the OSM world frame.
  {
    const mapColors = [0x91cfe8, 0xe3a1ae, 0xa8ce4d];
    const ranges = [[0, 357 / 883], [357 / 883, 654 / 883], [654 / 883, 1]];
    const names = ['서편광장', '중앙광장', '동편광장'];
    const U0 = Math.min(...bandUV.map(p => p[0])), U1 = Math.max(...bandUV.map(p => p[0]));
    function mapBoard(B, vertical = false) {
      const rot = FACE[B.face], nx = Math.sin(rot), nz = Math.cos(rot), rx = Math.cos(rot), rz = -Math.sin(rot);
      const [cx0, cz0] = P(B.u, B.v);
      const cx = cx0 + nx * 0.18, cz = cz0 + nz * 0.18;
      const w = vertical ? 0.94 : Math.min(B.w, 3.7), h = vertical ? 2.42 : 1.68;
      const y = vertical ? FL + 1.26 : FL + 1.65;
      const at = (a, b, off = 0.055) => [cx + rx * a + nx * off, y + b, cz + rz * a + nz * off];
      K.box({ x: cx, z: cz, y: y - h / 2, w: w + 0.08, h: h + 0.08, d: 0.08, rotY: rot, mat: vertical ? 0x242627 : 0x9c3639, solid: false });
      const facePoly = (pts, col, off = 0.055) => {
        const vertices = pts.map(([a, b]) => at(a, b, off));
        for (let i = 1; i < vertices.length - 1; i++) K.quad({ tex: 'emit', color: col }, [vertices[0], vertices[i], vertices[i + 1], vertices[i + 1]], [nx, 0, nz]);
      };
      const rect = (a0, b0, a1, b1, col, off = 0.055) => facePoly([[a0, b0], [a1, b0], [a1, b1], [a0, b1]], col, off);
      const disk = (a, b, r, col, off = 0.058) => facePoly(Array.from({ length: 12 }, (_, i) => [a + Math.cos(i * Math.PI / 6) * r, b + Math.sin(i * Math.PI / 6) * r]), col, off);
      const label = (t, a, b, ww, hh, fg = '#ffffff', bg = null) => {
        const [x, yy, z] = at(a, b, 0.066);
        K.sign(t, { x, z, y: yy, w: ww, h: hh, rotY: rot, bg, fg, pxPerM: 160, offset: 0.006 });
      };
      rect(-w / 2, -h / 2, w / 2, h / 2, 0x303638);
      // Two angular brand-colour footer ribbons, as on the photographed lightboxes.
      facePoly([[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, -h / 2 + 0.16], [-w / 2, -h / 2 + 0.06]], vertical ? 0xb44e72 : 0x087eb8, 0.059);
      facePoly([[-w / 2, -h / 2], [w / 2, -h / 2 + 0.05], [-w / 2, -h / 2 + 0.18]], vertical ? 0xd77791 : 0x099ddd, 0.060);
      label(vertical ? '중앙광장' : '고투몰 매장 안내도', vertical ? -0.13 : -w * 0.24, h / 2 - 0.19, vertical ? 0.58 : w * 0.43, vertical ? 0.15 : 0.20);
      if (vertical) label('GOTO ZONE', -0.09, h / 2 - 0.37, 0.68, 0.12, '#eb91a7');
      else label('화장실  →', w * 0.30, h / 2 - 0.20, w * 0.25, 0.17);
      // Schematic plane coordinates: vertical board reads west at the top; horizontal reads west right.
      const spine = t => vertical ? [0.02, 0.66 - t * 1.50] : [w * (0.44 - 0.88 * t), -0.05];
      const stripe = (t0, t1, transverse0, transverse1, col) => {
        const [a0, b0] = spine(t0), [a1, b1] = spine(t1);
        if (vertical) rect(a0 + transverse0, b1, a1 + transverse1, b0, col, 0.059);
        else rect(a1, b0 + transverse0, a0, b1 + transverse1, col, 0.059);
      };
      ranges.forEach(([t0, t1], i) => {
        stripe(t0, t1, -0.071, 0.071, 0xdce5df);
        stripe(t0, t1, -0.053, -0.012, mapColors[i]);
        stripe(t0, t1, 0.012, 0.053, mapColors[i]);
        for (let t = t0 + 0.035; t < t1; t += 0.073) stripe(t, Math.min(t + 0.009, t1), -0.066, 0.066, 0xdce5df);
      });
      for (const [t, i] of [[0.055, 0], [357 / 883, 1], [0.92, 2]]) {
        const [a, b] = spine(t); disk(a, b, vertical ? 0.103 : 0.13, 0xdce5df);
        if (!vertical) label(names[i], a, b, 0.34, 0.09, '#354147');
      }
      // Gate order and zone lengths are visible in the source; offsets remain a schematic drawing.
      const gateGroups = [[0.055, 1, 2], [0.13, 3, 4], [0.27, 5, 6], [0.404, 7, 8], [0.52, 9, 10], [0.72, 11, 12], [0.88, 13, 14], [0.98, 15, 16]];
      for (const [t, left, right] of gateGroups) for (const [side, no] of [[-1, left], [1, right]]) {
        const [a, b] = spine(t), col = mapColors[no <= 6 ? 0 : no <= 12 ? 1 : 2];
        if (vertical) {
          rect(a + side * 0.07, b - 0.012, a + side * 0.15, b + 0.012, 0xdce5df, 0.060);
          label('G' + no, a + side * 0.18, b, 0.10, 0.065, '#263337', '#' + col.toString(16));
        } else {
          rect(a - 0.012, b + side * 0.07, a + 0.012, b + side * 0.19, 0xdce5df, 0.060);
          label('G' + no, a, b + side * 0.23, 0.14, 0.08, '#263337', '#' + col.toString(16));
        }
      }
      for (let i = 0; i < 3; i++) {
        const mid = (ranges[i][0] + ranges[i][1]) / 2, [a, b] = spine(mid);
        label(['357m', '297m', '229m'][i], vertical ? 0.33 : a, vertical ? b : -0.51, vertical ? 0.15 : 0.32, vertical ? 0.065 : 0.085, '#' + mapColors[i].toString(16));
      }
      const [stationA, stationB] = spine(357 / 883);
      for (const [i, ln] of [3, 7, 9].entries()) {
        label(String(ln), vertical ? -0.31 + i * 0.075 : stationA - 0.12 + i * 0.12, vertical ? stationB + 0.15 : stationB + 0.43, vertical ? 0.065 : 0.10, vertical ? 0.065 : 0.10, '#ffffff', LINE[ln]);
      }
      if (!vertical) label('고속터미널역', stationA, stationB + 0.56, 0.50, 0.085);
      const here = clamp((B.u - U0) / (U1 - U0), 0.02, 0.98), [ha, hb] = spine(here);
      const pa = vertical ? ha + 0.13 : ha, pb = vertical ? hb : hb - 0.20;
      disk(pa, pb, vertical ? 0.07 : 0.085, 0xd74448, 0.063);
      disk(pa, pb, vertical ? 0.049 : 0.061, 0xfff3eb, 0.064);
      label('현위치', pa, pb, vertical ? 0.08 : 0.11, vertical ? 0.032 : 0.042, '#c73339');
      label('GOTOMALL', 0, -h / 2 + 0.24, vertical ? 0.46 : 0.65, vertical ? 0.10 : 0.12);
    }
    const boards = [...guideBoards, { u: -91, v: vN(-91) + 0.14, face: '+v', w: 3.4 }, { u: 15, v: vN(15) + 0.14, face: '+v', w: 3.4 }];
    for (const B of boards) mapBoard(B);
    // Shallow central totem against the existing shop-block end, outside circulation and W9.
    mapBoard({ u: -9.9, v: lay(-10.1).mid + 2.1, face: '+u' }, true);
  }

  // ---------- spawns ----------
  const sp = (name, u, v, y, du, dv) => { const [x, z] = P(u, v); K.spawn({ name, x, y, z, yaw: yawOf(du, dv) }); };
  const Lw = lay(-200), Le = lay(200), Lc = lay(-24);
  tallSigns.sort((p, q) => q[1].h * q[1].pxPerM - p[1].h * p[1].pxPerM);
  for (const [t, o] of tallSigns) K.sign(t, o);
  sp('고투몰 서편 푸드코트', -334, -4, FL, -1, 0);
  sp('고투몰 WEST ZONE (북측 통로)', -200, (Lw.fA + Lw.fB) / 2, FL, 1, 0);
  sp('3호선 개찰구 앞 (G7)', -72, -2, FL, -1, 0);
  sp('고투몰 중앙 (빽다방 앞)', -24, (Lc.fC + Lc.fD) / 2, FL, 1, 0);
  sp('중앙광장 · 9호선 연결', -4, 4, FL, 1, 0);
  sp('고투몰 EAST ZONE (남측 통로)', 200, (Le.fC + Le.fD) / 2, FL, -1, 0);
  sp('고투몰 동편 푸드코트', 369.5, -2, FL, 1, 0);
  { const X = EXITS.find(e => e.id === '8-1'); const t = X.E(-2.5, 0); sp('고속터미널역 8-1번 출구 (지상)', t[0], t[1], 0, 1, 0); }
}
