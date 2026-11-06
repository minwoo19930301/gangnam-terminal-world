// 신세계백화점 강남점 — detailed place module (B2 주차장 ~ 11F 식당가 + 1M 메자닌 + J1 지하 연결통로)
// Exterior: 2026 north/corner roadview towers and glazing; 2025 entrance and east parking.
// Main/extension split and heights remain estimates: see modeling.guesses in the research file.
// Footprint: OSM 159117108 is an almost perfect 67 m x 84.7 m rectangle rotated 20.8 deg.
// Everything inside the store is laid out in a local frame: u = 0..67 (west -> east, along the 신반포로 face),
// v = 0..84.7 (north -> south, toward JW 메리어트). Local north face (v=0) faces 신반포로, west face (u=0) is the shared
// wall with 센트럴시티, south face (v=84.7) is shared with JW 메리어트, east face (u=67) faces the 경부선 터미널 road.
export const meta = {
  id: 'shinsegae',
  name: '신세계백화점 강남점',
  claims: [159117108],
  claimRoads: [],
  claimAreas: [],
  sources: [
    'refs/official/shinsegae/floor_B1.png',
    'refs/official/shinsegae/sweetpark_B1.png',
    'refs/official/shinsegae/hos_B1.png',
    'refs/official/shinsegae/floor_1F.png',
    'refs/official/shinsegae/floor_1M.jpg',
    ...Array.from({length:10},(_,i)=>`refs/official/shinsegae/floor_${i+2}F.${i===9?'jpg':'png'}`),
    '.codex-jobs/evidence/walk_s5_ssg_b1.json',
    '.codex-jobs/evidence/walk_s6_ssg_upper.json',
    'refs/walk/s5_ssg_b1/p5QE9cVtWDM_50.jpg',
    'refs/walk/s5_ssg_b1/p5QE9cVtWDM_300.jpg',
    'refs/walk/s5_ssg_b1/M27U-isS4EA_200.jpg',
    'refs/interior/ssg_research/1f_cosmetics_popup_ionic_column_striped_marble_clodugirl.jpg',
    'refs/interior/ssg_1f/notes.json',
    'refs/interior/ssg_1f/06_floorplan_1F.jpg',
    'refs/interior/ssg_upper/notes.json',
    'refs/interior/ssg_food/notes.json',
    'refs/interior/ssg_food/01_hos_atrium_wide.jpg',
    'refs/interior/ssg_food/05_hos_corridor_ceiling_floor.jpg',
    'refs/interior/ssg_food/11_sweetpark_ceiling_queue.jpg',
    'refs/interior/ssg_food/17_market_vaulted_hall.jpg',
    'refs/interior/ssg_food/19_bluebutterfly_counter.jpg',
    'refs/interior/ssg_food/20_1f_atrium_shinsegae_sign.jpg',
    'refs/aerial/shinsegae_centralcity.jpg',
    'refs/roadview/ssg_01_main_entrance_canopy.jpg',
    'refs/roadview/ssg_02_main_entrance_wide.jpg',
    'refs/roadview/ssg_03_east_parking_wall.jpg',
    'refs/roadview/ssg_04_east_lot_north_view.jpg',
    'refs/roadview/ssg_05_sinbanporo_west_corner_tower.jpg',
    'refs/roadview/ssg_06_north_facade_from_sinbanporo_median.jpg',
    'refs/roadview/cc_01_main_gate_plaza_spheres_shinsegae_west_tower.jpg',
    'refs/photos/shinsegae/01_facade_2009_towers_signage.jpg',
    'refs/photos/shinsegae/02_facade_2008_pink_granite_logo.jpg',
    'https://namu.wiki/w/신세계백화점%20강남점',
    'https://news.bizwatch.co.kr/article/consumer/2016/02/25/0020',
    'https://www.dailian.co.kr/news/view/559092/',
    'https://newstomato.com/ReadNews.aspx?no=680212',
    'https://www.fnnews.com/news/202108201659273324',
    'https://byline.network/?p=9004111222542135',
    'https://byline.network/2025/02/27_shinsegaedpt/',
    'https://www.hankyung.com/article/2025082633761',
    'https://www.ajunews.com/view/20210731154244111',
    'https://byline.network/2024/11/28_29182763-2/',
    'https://www.dailian.co.kr/news/view/655702/',
    'https://sateconomy.co.kr/news/view/1065595387759300',
    'https://biz.newdaily.co.kr/site/data/html/2016/05/24/2016052410007.amp.html',
    'https://newstomato.com/ReadNews.aspx?no=628068',
  ],
};

// ---------------------------------------------------------------- frame
const RA = 0.3631, CA = Math.cos(RA), SA = Math.sin(RA);
const OX = -107.07, OZ = -24.31, UW = 67, VD = 84.7;
const PI = Math.PI;
// Round12 control-constrained schematic registration. Knots preserve plan-cell
// adjacency while fitting the retained8/9Gate thresholds and two B1 bank arrivals.
// The inferred icon correspondence and nonuniform scale are recorded in research.
const b1Interp=(n,knots)=>{let i=0;while(i<knots.length-2&&n>knots[i+1][0])i++;const[a,b]=knots[i],[c,d]=knots[i+1];return b+(n-a)*(d-b)/(c-a);};
const B1u=px=>b1Interp(px,[[371,67],[785,43.6],[840,39.65],[1032,0]]);
const B1v=py=>py<345?(py-345)*84.7/810:b1Interp(py,[[345,0],[443,34.71],[477,42.6],[500,51.77],[1155,84.7]]);

// floor levels (walkable top). 1F is a tall luxury hall with the 1M mezzanine inside it.
const LV = { B2: -11, B1: -6, '1F': 0, '1M': 3.6, '2F': 7, '3F': 11.8, '4F': 16.6, '5F': 21.4, '6F': 26.2, '7F': 31, '8F': 35.8, '9F': 40.6, '10F': 45.4, '11F': 50.2, RF: 55 };
// thickness of the slab whose top is at that level (its underside = ceiling of the floor below)
const TH = { B2: 0.4, B1: 0.5, '1F': 1.0, '1M': 0.4, '2F': 0.5, RF: 0.6 };
const MAIN = ['B2', 'B1', '1F', '2F', '3F', '4F', '5F', '6F', '7F', '8F', '9F', '10F', '11F']; // stacked floors (no 1M)
const thick = id => TH[id] ?? 0.6;
const nextOf = id => { const i = MAIN.indexOf(id); return i < MAIN.length - 1 ? MAIN[i + 1] : 'RF'; };
const clearH = id => LV[nextOf(id)] - thick(nextOf(id)) - LV[id];

// Upper atrium stays on the original stack; 1F has two plan-based paired banks.
const ATR = [27.6, 35, 39.4, 47];
const LANE = { A: 28.6, B: 30.2, C: 36.8, D: 38.4 };
const BEAUTY_BANKS = [33.76, 50.82]; // official icons: plan (520,689) / (520,834)
const BANK_U0 = 25.6, BANK_U1 = 43.6;
// elevator bank (3 cars) south of the atrium, doors facing north
const ELV = [30.5, 33.5, 36.5].map(u => ({ u, v: 66, w: 2.4, d: 2.2 }));
// stair cores: NE (door west) and SW (door east)
const CORES = [
  { uL: 61.4, uR: 66.75, v0: 9.8, v1: 24.2, door: 'W', lanes: [62.6, 64.8], top: '8F' },   // 본관 core
  { uL: 0.25, uR: 5.8, v0: 61.8, v1: 76.2, door: 'E', lanes: [3.6, 1.4], top: '11F' },    // 신관 core
];
const MEZZ = [0, 0, 67, 84.7];
// The retained exterior shoulder datum is VS. Official sheets show both retail
// wings through 10F and a left-wing rooftop garden at 11F; the former 8F cap is superseded.
// 2026 ssg_06 resolves the recessed north-facing curtain wall; unseen side/rear cladding stays plain stone.
// Roof55 = 7m ground hall + ten4.8m storeys; exceeds OSM34m/10levels to retain the researched11F. Both heights are unverified.
const VS = 33;
const UPPER = new Set(); // Official 9F/10F have both wings; 11F has garden + restaurants.
const UPPER_ELV = [21.5,24.5,27.5].map(u=>({u,v:58.4,w:2.4,d:2.2}));
const RIGHT_ATR = [27.6,76.5,39.4,80.3];

export function build(K) {
  // Bilinear survey frame: all four wall corners land on the authoritative OSM footprint.
  // Keep RA only for small rectangular fittings (the footprint has a slight skew).
  const P = (u, v) => {
    const a = u / UW, b = v / VD;
    return [OX + 62.61 * a + 30.43 * b - 0.32 * a * b,
      OZ - 23.77 * a + 79.03 * b + 0.13 * a * b];
  };
  const rect = (u0, v0, u1, v1) => [P(u0, v0), P(u1, v0), P(u1, v1), P(u0, v1)];
  const FACE = { S: RA, N: RA + PI, E: RA + PI / 2, W: RA - PI / 2 };
  const yawTo = (du, dv) => { const dx = du * CA + dv * SA, dz = -du * SA + dv * CA; return Math.atan2(-dx, -dz); };
  const rnd = K.rand(20001003);
  const FULL = rect(0, 0, UW, VD);
  // Warm gypsum for luxury/food rooms; sports floors receive a separate open coffer grid.
  K.material('ssg_ceil', new K.THREE.MeshLambertMaterial({ color: 0xf6f1e8, emissive: 0x9a9286 }));
  const CEIL = 'ssg_ceil';
  K.texture('ssg_marble', 512, 512, (g, w, h) => {
    g.fillStyle = '#d8cbb8'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 22; i++) {
      const x = i * 29 - 60;
      g.strokeStyle = i % 3 ? 'rgba(142,125,103,0.12)' : 'rgba(246,236,215,0.32)';
      g.lineWidth = i % 3 ? 1.3 : 2.2;
      g.beginPath(); g.moveTo(x, 0); g.bezierCurveTo(x + 90, 160, x - 20, 340, x + 150, h); g.stroke();
    }
    g.strokeStyle = 'rgba(124,111,94,0.16)'; g.lineWidth = 1;
    g.strokeRect(0, 0, w, h);
  }, [2.4, 2.4]);
  K.material('ssg_marble_polished', new K.THREE.MeshPhongMaterial({ map: K.T.surface('ssg_marble').tex, color: 0xffffff, shininess: 85, specular: 0xb3a68f }));

  function box(u, v, w, d, y, h, mat, o = {}) { const [x, z] = P(u, v); return K.box({ ...o, x, z, y, w, d, h, mat, rotY: RA }); }
  function boxR(u0, v0, u1, v1, y, h, mat, o) { return box((u0 + u1) / 2, (v0 + v1) / 2, Math.abs(u1 - u0), Math.abs(v1 - v0), y, h, mat, o); }
  function sign(text, u, v, y, f, w, h, o = {}) { const [x, z] = P(u, v); K.sign(text, { bold: true, pxPerM: 64, ...o, x, y, z, w, h, rotY: FACE[f] }); }
  function wall(u0, v0, u1, v1, y0, y1, o = {}) { const a = P(u0, v0), b = P(u1, v1); K.wall(a[0], a[1], b[0], b[1], y0, y1, o); }
  function hq(u0, v0, u1, v1, y, mat, up = true) { K.hpoly(mat, rect(u0, v0, u1, v1), y, up); }
  function lightPanel(u, v, y, lw = 1.2, ld = 0.6, color = 0xfffbf0) {
    const p = [P(u - lw / 2, v - ld / 2), P(u + lw / 2, v - ld / 2), P(u + lw / 2, v + ld / 2), P(u - lw / 2, v + ld / 2)];
    K.quad({ tex: 'emit', color }, p.map(q => [q[0], y, q[1]]), [0, -1, 0]);
  }
  const inR = (u, v, r, m = 0) => u > r[0] - m && u < r[2] + m && v > r[1] - m && v < r[3] + m;
  const zone = (name, floor, sub, r, y0, y1, priority = 1) => K.zone({ name, floor, sub, poly: rect(...r), y0, y1, priority });

  // One deferred furnishing batch per retail floor; structure/zones are registered immediately.
  // K.detail invokes the same construction kit, so the local survey helpers retain their frame.
  const furnishings = new Map();
  function furnish(floor, fn) {
    if (!furnishings.has(floor)) {
      const queue = []; furnishings.set(floor, queue);
      const y = LV[floor] ?? LV.B1;
      K.detail({ floor, y0: y, y1: floor === '1M' ? LV['2F'] : LV[nextOf(floor)],
        poly: floor === '1M' ? rect(...MEZZ) : UPPER.has(floor) ? rect(0, VS, UW, VD) : FULL,
        name: `${floor} 매장 집기` }, () => { for (const build of queue) build(); });
    }
    furnishings.get(floor).push(fn);
  }

  // ------------------------------------------------------------ surveyed exterior palette
  // 2026 ssg_05/06: rose-taupe stone with staggered 0.3 m courses.
  // Close-up 2025 ssg_03 resolves the same stone above the low dark pergola.
  const lcg = (s => () => (s = (s * 16807) % 2147483647) / 2147483647)(777);
  function stone(key, color) {
    K.texture(key, 512, 256, (g, w, h) => {
      g.fillStyle = color; g.fillRect(0, 0, w, h);
      for (let i = 0; i < 3600; i++) {
        g.fillStyle = lcg() < 0.5 ? 'rgba(55,39,35,0.055)' : 'rgba(237,220,210,0.08)';
        g.fillRect(lcg() * w, lcg() * h, 1, 1);
      }
      for (let row = 0; row < 4; row++) {
        const yy = row * h / 4;
        g.fillStyle = 'rgba(54,40,36,0.35)'; g.fillRect(0, yy, w, 2);
        g.fillStyle = 'rgba(239,229,231,0.35)'; g.fillRect(0, yy + 2, w, 1.5);
        g.fillStyle = 'rgba(54,40,36,0.35)';
        for (let x = (row % 2) * w / 4; x < w; x += w / 2) g.fillRect(x, yy, 1.5, h / 4);
      }
    }, [2.4, 1.2]);
  }
  stone('ssg_granite', '#c2abaf');
  // Round 5 roadview correction is restricted to the two north towers.
  stone('ssg_tower_stone', '#825d58');
  K.texture('ssg_glass', 128, 256, (g, w, h) => {
    const reflection = g.createLinearGradient(0, 0, 0, h);
    reflection.addColorStop(0, '#a9bcc4'); reflection.addColorStop(0.5, '#9cb0b9'); reflection.addColorStop(1, '#8ea3ac');
    g.fillStyle = reflection; g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(76,90,96,0.25)'; g.fillRect(0, 0, 1, h);
    g.fillStyle = '#c4cdd1'; g.fillRect(0, h - 8, w, 2);
    g.fillStyle = '#4c5a60'; g.fillRect(0, h - 6, w, 6);
  }, [1.7, 1], { facade: true });
  K.texture('ssg_rack', 128, 64, (g, w, h) => {
    g.fillStyle = '#bdbdbd'; g.fillRect(0, 0, w, h);
    for (let x = 0; x < w; x += 8) {
      const l = 160 + (lcg() * 90 | 0); g.fillStyle = `rgb(${l},${l},${l})`;
      g.fillRect(x, 5, 7, h - 5 - lcg() * 12);
    }
    g.fillStyle = '#777'; g.fillRect(0, 0, w, 3);
  }, [1.5, 1]);
  // ssg_06/cc_01: red flower and legible white capitals, only on the west tower's north face.
  K.texture('ssg_flower', 256, 256, (g, w, h) => {
    g.clearRect(0, 0, w, h); g.fillStyle = '#d7192d';
    // Rounded curling petals, separated tips and a small centre: a flower, never a star polygon.
    for (let i = 0; i < 6; i++) {
      g.save(); g.translate(w / 2, h / 2); g.rotate(i * PI / 3);
      g.beginPath(); g.moveTo(-8, -5); g.bezierCurveTo(-66, -16, -61, -99, -18, -103);
      g.bezierCurveTo(14, -106, 31, -75, 14, -52); g.bezierCurveTo(3, -33, -12, -27, -8, -5);
      g.fill(); g.restore();
    }
    g.beginPath(); g.arc(w / 2, h / 2, 13, 0, PI * 2); g.fill();
  }, [1, 1], { transparent: true });
  K.texture('ssg_wordmark', 1024, 128, (g, w, h) => {
    g.clearRect(0, 0, w, h); g.fillStyle = '#ffffff';
    g.font = '800 112px Arial,sans-serif';
    const metrics = g.measureText('SHINSEGAE');
    const ascent = metrics.actualBoundingBoxAscent || 82, descent = metrics.actualBoundingBoxDescent || 0;
    // maxWidth alone only shrinks text; scale the actual glyphs to fill the panel.
    g.save(); g.translate(w / 2, h / 2);
    g.scale((w - 16) / metrics.width, (h - 16) / (ascent + descent));
    g.textAlign = 'center'; g.textBaseline = 'alphabetic';
    g.fillText('SHINSEGAE', 0, (ascent - descent) / 2, metrics.width); g.restore();
  }, [1, 1], { transparent: true });
  const wordmarkMap = K.T.surface('ssg_wordmark').tex;
  K.material('ssg_wordmark_white', new K.THREE.MeshLambertMaterial({
    map: wordmarkMap, color: 0xffffff, emissive: 0xffffff, emissiveMap: wordmarkMap,
    emissiveIntensity: 0.25, transparent: true, alphaTest: 0.3,
  }));
  const PLANE = { N: 0, S: VD, E: UW, W: 0 };
  function faceQuad(mat, f, c, y, w, h, off = 0.12, plane = PLANE[f], tiled = false) {
    let a, b;
    if (f === 'N') { a = P(c + w / 2, plane - off); b = P(c - w / 2, plane - off); }
    else if (f === 'S') { a = P(c - w / 2, plane + off); b = P(c + w / 2, plane + off); }
    else if (f === 'E') { a = P(plane + off, c + w / 2); b = P(plane + off, c - w / 2); }
    else { a = P(plane - off, c - w / 2); b = P(plane - off, c + w / 2); }
    const n = { N: [-SA, -CA], S: [SA, CA], E: [CA, -SA], W: [-CA, SA] }[f];
    K.quad(mat, [[a[0], y, a[1]], [b[0], y, b[1]], [b[0], y + h, b[1]], [a[0], y + h, a[1]]], [n[0], 0, n[1]],
      tiled ? [[0, 0], [w, 0], [w, h], [0, h]] : undefined);
  }
  function faceBox(f, s, len, t, dep, y, h, mat, plane = PLANE[f]) {
    const o = { solid: false };
    if (f === 'N') return box(s, plane - t, len, dep, y, h, mat, o);
    if (f === 'S') return box(s, plane + t, len, dep, y, h, mat, o);
    if (f === 'E') return box(plane + t, s, dep, len, y, h, mat, o);
    return box(plane - t, s, dep, len, y, h, mat, o);
  }
  function exWall(f, plane, s0, s1, y0, y1, o) {
    const th = o.thick ?? 0.3, h = th / 2;
    const ab = f === 'N' ? [[s0, plane + h], [s1, plane + h]] : f === 'S' ? [[s0, plane - h], [s1, plane - h]]
      : f === 'E' ? [[plane - h, s0], [plane - h, s1]] : [[plane + h, s0], [plane + h, s1]];
    const A = P(...ab[0]), B = P(...ab[1]);
    const nl = { N: [0, -1], S: [0, 1], E: [1, 0], W: [-1, 0] }[f], nx = nl[0] * CA + nl[1] * SA, nz = -nl[0] * SA + nl[1] * CA;
    const L = Math.hypot(B[0] - A[0], B[1] - A[1]), ux = (B[0] - A[0]) / L, uz = (B[1] - A[1]) / L;
    const plusOut = (-uz * nx + ux * nz) > 0, inner = o.inner ?? IN;
    K.wall(A[0], A[1], B[0], B[1], y0, y1, { thick: th, floorH: o.floorH, vBase: o.vBase ?? 0, solid: o.solid,
      openings: (o.openings || []).map(p => ({ at: p.s - s0, w: p.w, y0: p.y0, y1: p.y1 })),
      mat: plusOut ? o.mat : inner, mat2: plusOut ? inner : o.mat });
  }

  // ------------------------------------------------------------ envelope
  K.groundHole(FULL);
  const ENTRY = 33.5, J4V = 42.6, J5U = 33.65;
  const IN = 0xf2eee7, YB = LV['11F'], STEEL = 0x252c2b;
  K.polyWalls(FULL, LV.B2, LV.B1, { mat: 'concrete', inner: 0xb3b1a7, thick: 0.3, openings: [
    { x: P(UW, 54.5)[0], z: P(UW, 54.5)[1], w: 6.5, y0: LV.B2, y1: -8.2 },
  ] });
  K.polyWalls(FULL, LV.B1, 0, { mat: 'concrete', inner: IN, thick: 0.3, openings: [
    { x: P(39.65, 0)[0], z: P(39.65, 0)[1], w: 9, y0: LV.B1, y1: -2.7 },
    ...[483].map(px=>({x:P(B1u(px),0)[0],z:P(B1u(px),0)[1],w:3.8,y0:LV.B1,y1:-2.7})),
    {x:P(B1u(936),0)[0],z:P(B1u(936),0)[1],w:3.8,y0:LV.B1,y1:-2.7},
    { x: -92, z: 15.5, w: 8, y0: LV.B1, y1: -3 },
  ] });
  const dOp = (s, w = 6) => ({ s, w, y0: 0, y1: 5.86 });
  // Ground contact follows OSM; the central portal alone is set back into the slot.
  exWall('N', 0, 0, 18.5, 0, 7, { mat: 'ssg_tower_stone' });
  exWall('N', 0, 18.5, 23, 0, 7, { mat: 'ssg_granite' });
  exWall('N', 0, 44, UW - 18.5, 0, 7, { mat: 'ssg_granite' });
  exWall('N', 0, UW - 18.5, UW, 0, 7, { mat: 'ssg_tower_stone' });
  exWall('N', 5, 23, 44, 0, 7, { mat: 'ssg_granite', openings: [{ ...dOp(ENTRY, 12), y1: 5.7 }] });
  for (const u of [23, 44]) wall(u, 0, u, 5, 0, 11, { mat: 'ssg_granite', thick: 0.22 });
  exWall('E', UW, 0, 18.5, 0, 7, { mat: 'ssg_tower_stone' });
  exWall('E', UW, 18.5, VS, 0, 7, { mat: 'ssg_granite', openings: [{ ...dOp(30), y1: 3.45 }] });
  exWall('E', UW, VS, VD, 0, 7, { mat: 'ssg_granite', openings: [{...dOp(42.35, 8), y1:3.4}] });
  exWall('W', 0, 0, 18.5, 0, 7, { mat: 'ssg_tower_stone' });
  exWall('W', 0, 18.5, VS, 0, 7, { mat: 'ssg_granite' });
  exWall('W', 0, VS, VD, 0, 7, { mat: 'ssg_granite', openings: [{ s: J4V, w: 8, y0: 0, y1: 3.4 }, {s:68,w:8,y0:0,y1:3.4}, {s:39.25,w:5,y0:3.6,y1:6.3}] });
  exWall('S', VD, 0, UW, 0, 7, { mat: 'ssg_granite', openings: [{ s: J5U, w: 6, y0: 0, y1: 3 }] });

  // 2026 ssg_06/05 and cc_01: narrow square end towers, lower stone shoulders.
  // Heights use the retained floor stack as a scale; tower parapets are not extra trading floors.
  const TOWER_W = 18.5;
  const TOWERS = [[0, TOWER_W, LV.RF], [UW - TOWER_W, UW, LV.RF + 2.4]];
  for (const [u0, u1, top] of TOWERS) {
    exWall('N', 0, u0, u1, 7, YB, { mat: 'ssg_tower_stone' });
    K.prism(rect(u0, 0, u1, TOWER_W), YB, top, {
      mat: 'ssg_tower_stone', top: 0x8b7871, solid: false, bottom: false, vBase: 0,
    });
    faceBox('N', (u0 + u1) / 2, TOWER_W, 0.01, 0.08, top - 0.16, 0.16, 0xa48e84);
  }
  for (const [a, b] of [[TOWER_W, 23], [44, UW - TOWER_W]])
    exWall('N', 0, a, b, 7, YB, { mat: 'ssg_granite' });
  for (const u of [23, 44]) wall(u, 0, u, 8, 7, YB, { mat: 'ssg_granite', thick: 0.22 });

  // A cylinder segment inside the stone recess, never a bow across the whole facade.
  // ssg_06 shows two glazed sections separated by a black recessed horizontal band.
  const BAY_BACK = 8, BAY_TOP = YB, GLASS_TOP = LV['11F'];
  const bay = [];
  for (let i = 0; i <= 24; i++) {
    const theta = PI * i / 24;
    bay.push([ENTRY - 6 * Math.cos(theta), BAY_BACK - 6 * Math.sin(theta)]);
  }
  const bayPlan = bay.map(p => P(...p));
  exWall('N', BAY_BACK, 23, 44, 7, BAY_TOP, { mat: 'ssg_glass', floorH: 3.2, vBase: 7 });
  for (const [y0, y1] of [[7, 20], [24, BAY_TOP]]) {
    for (let i = 0; i < bay.length - 1; i++) {
      wall(...bay[i], ...bay[i + 1], y0, y1, { mat: 'ssg_glass', thick: 0.06, floorH: 3.2, vBase: 7 });
      if (i % 2 === 0) box(bay[i][0], bay[i][1], 0.04, 0.06, y0, y1 - y0, 0x9caeb7, { solid: false });
    }
    const end = bay.at(-1);
    box(end[0], end[1], 0.04, 0.06, y0, y1 - y0, 0x9caeb7, { solid: false });
    // The 2F slab and main roof already cap y7/YB. Only cap the two recess edges here.
    for (const yy of [y0, y1].filter(yy => yy !== 7 && yy !== BAY_TOP)) K.slab(bayPlan, yy, {
      mat: 0x748783, under: 0x202a28, thick: 0.16, edgeMat: 0x85948e, walk: false, ceil: false,
    });
  }
  // Dark recess is behind the curved glazing; the upper curved soffit projects over it.
  faceQuad(0x192220, 'N', ENTRY, 20, 12, 4, 0.08, BAY_BACK);
  for (const u of [27.5, 39.5]) wall(u, 6, u, BAY_BACK, 20, 24, { mat: 0x1b2522, thick: 0.1 });
  // Separate flat curtain-wall enclosure behind/above the cylinder, per ssg_06.
  if (GLASS_TOP > YB) K.prism(rect(TOWER_W, BAY_BACK, UW - TOWER_W, VS), YB, GLASS_TOP, {
    mat: 'ssg_glass', floorH: 3.2, vBase: 7, top: 0x74817a, bottom: false, solid: false,
  });
  faceBox('N', ENTRY, UW - 2 * TOWER_W, 0.03, 0.15, GLASS_TOP, 0.16, 0x929d95, BAY_BACK);
  // Two low clusters of rooftop greenery break the glass roofline in ssg_06.
  for (const [u0, u1] of [[20, 32], [40, 47]]) {
    boxR(u0, 9, u1, 16, GLASS_TOP, 0.6, 0x5d5a55, { solid: false });
    boxR(u0 + 0.25, 9.25, u1 - 0.25, 15.75, GLASS_TOP + 0.6, 0.5, 0x3f593c, { solid: false });
  }
  for (const [u, v, h] of [[24, 11, 3.5], [27, 12.5, 4.2], [30, 11, 3.7], [42, 11, 3.6], [44, 13, 4.3], [46, 10.5, 3.8]]) {
    const [x, z] = P(u, v); K.tree(x, z, { y: GLASS_TOP + 0.6, h, kind: 'zelkova' });
  }
  for (const f of ['E', 'W']) {
    exWall(f, f === 'E' ? UW : 0, 0, TOWER_W, 7, YB, { mat: 'ssg_tower_stone' });
    exWall(f, f === 'E' ? UW : 0, TOWER_W, VS, 7, YB, { mat: 'ssg_granite' });
  }
  // Only the north-facing upper extension is resolved as glazing; unseen sides stay plain.
  for (const [f, pl, s0, s1] of [['E', UW, VS, VD], ['W', 0, VS, VD], ['S', VD, 0, UW]])
    exWall(f, pl, s0, s1, 7, LV.RF + 0.65, {mat:'ssg_granite',openings:f==='W'?[{s:75.1,w:1.8,y0:7,y1:9.6}]:[]});
  exWall('N', 57.5, 0, UW, YB, LV.RF + 0.65, { mat: 'ssg_glass', floorH: 3.2, vBase: 7, openings:[{s:40,w:10,y0:YB,y1:YB+3.8}] });
  K.slab(rect(0, 57.5, UW, VD), LV.RF, { mat: 'roofgravel', under: CEIL, thick: TH.RF, edge: false });
  for (const [f, c, len, pl] of [['N', UW / 2, UW, 57.5], ['E', (57.5 + VD) / 2, VD - 57.5, UW], ['W', (57.5 + VD) / 2, VD - 57.5, 0], ['S', UW / 2, UW, VD]])
    faceBox(f, c, len, 0, 0.12, LV.RF + 0.65, 0.12, 0xa48e84, pl);
  // Occasional thin pale courses, not alternating metre-high stripes.
  for (const yy of [7, 16.6, 26.2, 35.8]) {
    for (const [f, c, len] of [['N', 11.5, 23], ['N', 55.5, 23], ['W', VD / 2, VD]])
      faceBox(f, c, len, 0.015, 0.025, yy, 0.045, 0xd2c3c0);
  }
  for (const yy of [8, 10.5]) faceBox('E', VS / 2, VS, 0.015, 0.025, yy, 0.07, 0xd2c3c0);
  // y is the bottom of the aperture; width and height are independent.
  function squareWindow(f, c, y, w = 1.35, h = w, raised = false, plane = PLANE[f]) {
    faceBox(f, c, w + 0.22, 0.07, raised ? 0.25 : 0.08, y - 0.11, h + 0.22, 0xb09b9e, plane);
    faceQuad(0x253130, f, c, y, w, h, raised ? 0.22 : 0.135, plane);
    faceBox(f, c, 0.045, raised ? 0.23 : 0.145, 0.025, y, h, 0x68685f, plane);
  }
  for (const [u0, u1, top] of TOWERS) for (let i = 0; i < 5; i++) {
    const c = 2.6 + i * (TOWER_W - 5.2) / 4;
    squareWindow('N', u0 + c, top - 3.6 - 1.05, 1.5, 2.1);
    squareWindow(u0 === 0 ? 'W' : 'E', c, top - 3.6 - 1.05, 1.5, 2.1);
  }
  // ssg_06 confirms the small north-face apertures beside the glass bay only.
  for (let i = 0; i < 6; i++) {
    for (const u of [21.3, 45.7]) squareWindow('N', u, 10 + i * 4.8, 0.78, 0.78, true);
  }
  squareWindow('N', 2.5, 8.5, 1.6, 1.6, true);
  for (const v of [18.5, 21.5]) {
    squareWindow('E', v, 4.0, 1.3, 1.3, true);
    for (const s of [-0.3, 0.3]) faceBox('E', v + s, 0.035, 0.245, 0.025, 4, 1.3, STEEL);
    for (const yy of [4.4, 4.85]) faceBox('E', v, 1.3, 0.245, 0.025, yy, 0.035, STEEL);
  }
  squareWindow('E', 28, 10, 0.6, 0.6, true); // lone south-side vent in ssg_03
  // Piaget is on the west tower NORTH face; its west face has no confirmed logo.
  // North-face u increases to viewer-left; west-face v increases to viewer-right.
  function towerLogo(f, c, y) {
    const left = f === 'N' ? 1 : -1;
    faceQuad('ssg_flower', f, c + left * 6.9, y - 0.45, 2.8, 2.8, 0.18);
    faceQuad('ssg_wordmark_white', f, c - left * 1.4, y, 13, 1.9, 0.18);
  }
  towerLogo('N', TOWER_W / 2, TOWERS[0][2] - 8.5);

  // Simplified artwork follows the 2026 billboards' composition, with observed brand captions.
  // The portrait and fashion figures are approximations, not copies of campaign photography.
  K.texture('ssg_portrait_poster', 512, 768, (g, w, h) => {
    const bg = g.createLinearGradient(0, 0, w, h);
    bg.addColorStop(0, '#aa674c'); bg.addColorStop(0.65, '#b97c59'); bg.addColorStop(1, '#663c31');
    g.fillStyle = bg; g.fillRect(0, 0, w, h);
    const shape = (col, points) => {
      g.fillStyle = col; g.beginPath(); g.moveTo(...points[0]);
      for (const p of points.slice(1)) p.length === 6 ? g.bezierCurveTo(...p) : g.lineTo(...p);
      g.closePath(); g.fill();
    };
    shape('#ece5d8', [[-30,655],[25,480,140,462,193,461],[324,453],[430,465,520,537,546,680],[546,708],[-30,708]]);
    shape('#202329', [[60,708],[85,494],[170,459],[230,518],[315,471],[429,518],[479,708]]);
    shape('#b88e70', [[206,385],[203,473],[252,518],[316,460],[303,376]]);
    shape('#d7b394', [[160,180],[170,117,321,108,355,194],[369,272,355,355,312,399],[280,435,231,421,199,387],[158,333,141,239,160,180]]);
    shape('#272724', [[153,278],[112,152,175,77,269,76],[374,67,410,180,357,279],[343,235],[322,187,293,191,262,157],[232,193,198,193,170,220]]);
    shape('#b98e73', [[318,215],[343,254,343,341,309,375],[324,313],[314,275],[318,215]]);
    g.strokeStyle = '#54443b'; g.lineWidth = 7; g.lineCap = 'round';
    for (const x of [195, 286]) { g.beginPath(); g.moveTo(x, 256); g.quadraticCurveTo(x + 17, 245, x + 35, 255); g.stroke(); }
    g.fillStyle = '#33332e';
    for (const x of [216, 302]) { g.beginPath(); g.ellipse(x, 263, 5, 4, 0, 0, PI * 2); g.fill(); }
    g.strokeStyle = '#ad7a61'; g.lineWidth = 4; g.beginPath(); g.moveTo(270, 266); g.lineTo(262, 316); g.lineTo(278, 320); g.stroke();
    g.strokeStyle = '#8e6155'; g.lineWidth = 5; g.beginPath(); g.moveTo(237, 354); g.quadraticCurveTo(262, 363, 289, 349); g.stroke();
    shape('#ddba9c', [[111,546],[157,478],[211,421],[294,401],[327,410],[317,425],[249,443],[225,464],[191,506],[159,567]]);
    g.strokeStyle = '#bf987d'; g.lineWidth = 3;
    for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(210 + i * 8, 433 + i * 5); g.lineTo(298 + i * 4, 410 + i * 6); g.stroke(); }
    g.fillStyle = '#f0eee7'; g.fillRect(0, 708, w, 60);
    g.fillStyle = '#696861'; g.font = '32px Georgia,serif'; g.textAlign = 'center'; g.fillText('PIAGET', w / 2, 749);
  }, [1, 1]);
  K.texture('ssg_fashion_poster', 512, 768, (g, w, h) => {
    g.fillStyle = '#c6cbca'; g.fillRect(0, 0, w, h);
    for (const [x, ww, col] of [[0,92,'#8e9a98'],[105,75,'#d9dcda'],[322,110,'#a4afad'],[450,62,'#778984']]) {
      g.fillStyle = col; g.fillRect(x, 0, ww, 708);
    }
    for (const [x, yy, coat, lean] of [[118,163,'#353b45',-12],[266,116,'#e2dfce',15],[402,185,'#606568',-8]]) {
      g.strokeStyle = '#30363b'; g.lineWidth = 30; g.lineCap = 'round';
      for (const side of [-1,1]) { g.beginPath(); g.moveTo(x + side * 18, yy + 300); g.lineTo(x + side * 28 + lean, yy + 482); g.stroke(); }
      g.fillStyle = coat; g.beginPath(); g.moveTo(x - 51, yy + 75); g.lineTo(x + 50, yy + 75);
      g.lineTo(x + 62 + lean, yy + 325); g.lineTo(x - 53 + lean, yy + 325); g.closePath(); g.fill();
      g.strokeStyle = coat; g.lineWidth = 29;
      for (const side of [-1,1]) { g.beginPath(); g.moveTo(x + side * 39, yy + 91); g.lineTo(x + side * 67 + lean, yy + 246); g.stroke(); }
      g.fillStyle = '#c7a78f'; g.beginPath(); g.ellipse(x, yy + 31, 25, 35, 0.1, 0, PI * 2); g.fill();
      g.fillStyle = '#3e3b37'; g.beginPath(); g.ellipse(x - 2, yy + 10, 28, 22, -0.12, PI, PI * 2); g.fill();
      g.strokeStyle = '#7f8078'; g.lineWidth = 3; g.beginPath(); g.moveTo(x, yy + 90); g.lineTo(x + lean, yy + 313); g.stroke();
    }
    g.fillStyle = '#ecece6'; g.fillRect(0, 708, w, 60);
    g.fillStyle = '#41484b'; g.font = '500 32px Arial,sans-serif'; g.textAlign = 'center'; g.fillText('CHANEL', w / 2, 749);
  }, [1, 1]);
  function billboard(f, c, y, w, h, artwork) {
    faceBox(f, c, w + 0.42, 0.12, 0.18, y - 0.21, h + 0.42, 0x646660);
    faceBox(f, c, w + 0.22, 0.23, 0.12, y - 0.11, h + 0.22, 0xd3d0c5);
    faceQuad(artwork, f, c, y, w, h, 0.31);
  }
  billboard('N', TOWER_W / 2, 12.8, 9.1, 14.4, 'ssg_portrait_poster');
  billboard('N', UW - TOWER_W / 2, 16.2, 9.1, 14.4, 'ssg_fashion_poster');
  // cc_01: a narrow pale vertical banner on the west face, not a second portrait.
  billboard('W', TOWER_W / 2, 15.3, 3, 14, 0xd9dde0);

  // ------------------------------------------------------------ entrance (2025 roadview 01/02)
  function gridCanopy(f, c, width, depth, y, paired = false, columns = true) {
    const along = f === 'N', back = along ? -5 : 0.05, run = depth - back, middle = (depth + back) / 2;
    const B = (s, t, w, d, yy, h, mat, solid = false) => along
      ? box(c + s, -t, w, d, yy, h, mat, { solid })
      : box(UW + t, c + s, d, w, yy, h, mat, { solid });
    const Q = (s0, t0, s1, t1, yy, mat) => along
      ? hq(c + s0, -t1, c + s1, -t0, yy, mat)
      : hq(UW + t0, c + s0, UW + t1, c + s1, yy, mat);
    Q(-width / 2, back, width / 2, depth, y + 0.2, { tex: 'glass', color: 0x9ca7a1 });
    // Glass material is double-sided; transverse grid, deeper beams and outer columns below it.
    for (let s = -width / 2; s <= width / 2 + 0.01; s += 1.1) B(s, middle, 0.075, run, y, 0.2, STEEL);
    for (let t = back; t <= depth; t += 0.9) B(0, t, width, 0.08, y, 0.2, STEEL);
    for (const t of [back, depth]) B(0, t, width + 0.2, 0.24, y - (along ? 0.2 : 0.12), along ? 0.4 : 0.36, STEEL);
    for (const ss of [-width / 2, width / 2]) B(ss, middle, 0.24, run, y - (along ? 0.2 : 0.12), along ? 0.4 : 0.36, STEEL);
    for (const ss of [-width * 0.32, width * 0.32]) {
      B(ss, middle, 0.24, run, y - 0.18, 0.38, STEEL);
      if (!columns) continue;
      if (along) {
        const [x, z] = P(c + ss, -depth + 0.2);
        K.cyl({ x, z, y: 0, r: 0.21, h: y, mat: STEEL, seg: 16 });
      } else for (const offset of paired ? [-0.3, 0.3] : [0])
        B(ss + offset, depth - 0.2, 0.16, 0.16, 0, y, STEEL, true);
    }
  }
  gridCanopy('N', ENTRY, 25.4, 6.8, 5.9);
  gridCanopy('E', 19, 22, 3.4, 3.8, true);
  // Door side lights and upper transom. Two clear open passages remain through the glass doors.
  function entrance(f, c, width, plane = PLANE[f]) {
    const east = f === 'E', doorTop = east ? 2.65 : 2.9, fasciaH = east ? 0.5 : 0.55;
    const transomBase = doorTop + fasciaH, top = east ? 3.45 : 5.7;
    faceBox(f, c, width, 0.06, 0.18, doorTop, fasciaH, STEEL, plane);
    faceQuad({ tex: 'glass', color: 0xa4b0b7 }, f, c, transomBase, width, top - transomBase, 0.08, plane);
    for (const ss of [-width / 2, -width / 4, 0, width / 4, width / 2])
      faceBox(f, c + ss, 0.085, 0.1, 0.16, 0, top, STEEL, plane);
    faceBox(f, c, width, 0.1, 0.16, top, 0.1, STEEL, plane);
    if (!east) {
      for (let ss = -width / 2 + 1.2; ss < width / 2; ss += 1.2)
        faceBox(f, c + ss, 0.065, 0.13, 0.12, transomBase, top - transomBase, STEEL, plane);
      faceBox(f, c, width, 0.13, 0.12, 2.86, 0.08, STEEL, plane);
      faceBox(f, c, width, 0.13, 0.12, 4.55, 0.065, STEEL, plane);
    }
    for (const ss of [-width * 0.39, width * 0.39]) faceQuad({ tex: 'glass', color: 0x6f847b }, f, c + ss, 0.1, width * 0.2, doorTop - 0.15, 0.1, plane);
    if (f === 'N') for (const u of [c - 2.6, c + 2.6]) {
      wall(u, plane - 0.1, u, plane + 1.2, 0.05, doorTop, { mat: 'glass', thick: 0.04 });
      box(u, plane + 0.55, 0.055, 1.3, doorTop - 0.04, 0.06, STEEL, { solid: false });
    }
    const [u, v] = f === 'N' ? [c - 0.3, plane - 0.18] : [plane + 0.18, c - 0.3];
    sign('SHINSEGAE', u, v, doorTop + fasciaH / 2, f, 2.1, east ? 0.25 : 0.31, { bg: null, fg: '#e3e7dd', bold: false });
    const flowerSize = east ? 0.33 : 0.44;
    faceQuad('ssg_flower', f, c + 1.45, doorTop + (fasciaH - flowerSize) / 2, flowerSize, flowerSize, 0.2, plane);
  }
  entrance('N', ENTRY, 12, 5);
  entrance('E', 30, 6);
  // v20 intersects the preserved NE stair core; retain the v30 door. Its south
  // canopy return meets the pergola at v30 instead of stacking two grid roofs.
  // The short wall-supported return has no extra posts across the door approach.
  gridCanopy('E', 31.6, 3.2, 2.4, 3.8, false, false);
  K.texture('ssg_watch_display', 128, 128, (g, w, h) => {
    g.clearRect(0, 0, w, h);
    g.fillStyle = '#77736d'; g.fillRect(49, 0, 30, h);
    g.fillStyle = '#d6cdb9'; g.beginPath(); g.arc(w / 2, h / 2, 34, 0, PI * 2); g.fill();
    g.fillStyle = '#e8e4db'; g.beginPath(); g.arc(w / 2, h / 2, 28, 0, PI * 2); g.fill();
    g.strokeStyle = '#37332e'; g.lineWidth = 3;
    g.beginPath(); g.moveTo(48, 50); g.lineTo(64, 64); g.lineTo(80, 43); g.stroke();
  }, [1, 1], { transparent: true });
  K.material('ssg_lit_watch', new K.THREE.MeshBasicMaterial({
    map: K.T.surface('ssg_watch_display').tex, transparent: true, alphaTest: 0.3,
  }));
  function awningWindow(f, c, width = 6.5, branded = false) {
    const top = f === 'E' ? 3.0 : 4.05, front = top - Math.tan(25 * PI / 180) * 0.8;
    const frameH = f === 'E' ? 2.3 : 3.4;
    // ssg_02/03: recessed dark display, one lit watch and a sloping red fabric awning.
    const frame = 0x3b3530;
    faceQuad(0x1c1a19, f, c, 0.67, width - 0.4, frameH - 0.45, 0.035);
    for (const side of [-1, 1]) faceBox(f, c + side * (width / 2 - 0.1), 0.2, 0.15, 0.3, 0.45, frameH, frame);
    for (const yy of [0.45, 0.45 + frameH - 0.18]) faceBox(f, c, width, 0.15, 0.3, yy, 0.18, frame);
    // Deep red outer reveal and a thin pale inner frame also continue under the west tower (cc_01).
    for (const side of [-1, 1]) {
      faceBox(f, c + side * (width / 2 - 0.21), 0.06, 0.31, 0.025, 0.63, frameH - 0.36, 0xa8202c);
      faceBox(f, c + side * (width / 2 - 0.28), 0.025, 0.3, 0.025, 0.67, frameH - 0.44, 0xd0c5c2);
    }
    faceBox(f, c, 0.85, 0.15, 0.2, 0.67, 0.45, 0x4a4744);
    faceQuad('ssg_lit_watch', f, c, 1.13, 0.5, 0.5, 0.25);
    if (branded) {
      const [u, v] = f === 'N' ? [c, -0.29] : [UW + 0.29, c];
      sign('POLO CLUB', u, v, 2.12, f, Math.min(width - 0.7, 2.2), 0.26, { bg: null, fg: '#ffffff', bold: false });
    }
    faceQuad({ tex: 'glass', color: 0x3e4244 }, f, c, 0.65, width - 0.4, frameH - 0.4, 0.34);
    const ap = (s, t, yy) => {
      const [x, z] = f === 'N' ? P(c + s, -t) : P(UW + t, c + s);
      return [x, yy, z];
    };
    const slope = 25 * PI / 180, out = f === 'N' ? [-SA, -CA] : [CA, -SA];
    const awning = [ap(-width / 2, 0.1, top), ap(width / 2, 0.1, top), ap(width / 2, 0.9, front), ap(-width / 2, 0.9, front)];
    const normal = [out[0] * Math.sin(slope), Math.cos(slope), out[1] * Math.sin(slope)];
    K.quad(0xa8202c, awning, normal);
    K.quad(0x781c28, awning, normal.map(n => -n));
    faceBox(f, c, width, 0.9, 0.05, front - 0.24, 0.24, 0xa8202c);
    const [u, v] = f === 'N' ? [c, -0.92] : [UW + 0.92, c];
    sign('SHINSEGAE', u, v, front - 0.12, f, Math.min(width - 0.3, 2.2), 0.19, { bg: null, fg: '#ffffff', bold: false });
  }
  for (const u of [3.5, 7.5, 11.5, 15]) awningWindow('N', u, 3.2);
  awningWindow('N', 19.8, 5.2, true);
  awningWindow('N', 48.2, 6.5, true);
  for (const v of [18.5, 21.5]) awningWindow('E', v, 2.5);
  boxR(0, -1.6, 17, -0.2, 0.012, 0.6, 'ssg_granite');
  boxR(0.15, -1.5, 16.85, -0.3, 0.612, 1, 0x3f593c, { solid: false });
  // Local tapered primitive: K.cyl has no top radius; avoids the kit's spherical pine crown.
  function taper(u, v, y, r0, r1, h, mat, seg = 10) {
    for (let i = 0; i < seg; i++) {
      const a = i * PI * 2 / seg, b = (i + 1) * PI * 2 / seg;
      const pt = (t, r, yy) => { const [x, z] = P(u + Math.cos(t) * r, v + Math.sin(t) * r); return [x, yy, z]; };
      const nx = Math.cos((a + b) / 2), nz = Math.sin((a + b) / 2);
      K.quad(mat, [pt(a, r0, y), pt(b, r0, y), pt(b, r1, y + h), pt(a, r1, y + h)], [nx * CA + nz * SA, (r0 - r1) / h, -nx * SA + nz * CA]);
    }
  }
  for (const u of [23, 26.5, 40.5, 44]) {
    box(u, -1.5, 1.6, 1.6, 0, 0.6, 0x3a3a3a);
    box(u, -1.5, 1.45, 1.4, 0.6, 0.5, 0x304333, { solid: false });
    for (const [du, dv, hh] of [[-0.35, 0.12, 2.6], [0.35, 0.1, 2.4], [0, -0.35, 2.8]]) taper(u + du, -1.5 + dv, 0.75, 0.45, 0.02, hh, 0x26402a);
  }
  for (const [key, base, dark, light, joint] of [
    ['ssg_paving', '#4a4744', '#43413e', '#514e4b', '#3a3836'],
    ['ssg_plaza_paving', '#9d9a94', '#96938d', '#a5a29c', '#807d77'],
  ]) K.texture(key, 256, 128, (g, w, h) => {
    g.fillStyle = base; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 1200; i++) { g.fillStyle = lcg() < 0.5 ? dark : light; g.fillRect(lcg() * w, lcg() * h, 1, 1); }
    g.fillStyle = joint; g.fillRect(0, 0, w, 1); g.fillRect(0, 0, 1, h);
  }, [1.2, 0.6]);
  K.slab(rect(0, -7.4, UW, 0), 0.012, { mat: 'ssg_paving', uvRot: RA, thick: 0.12, ceil: false });
  K.slab(rect(23, 0, 44, 5), 0.012, { mat: 'ssg_paving', uvRot: RA, thick: 0.12, ceil: false });
  K.slab(rect(-10, -14.6, 77, -7.6), 0.016, { mat: 'asphalt', thick: 0.12, ceil: false });
  boxR(-10, -7.6, 77, -7.3, 0, 0.15, 0xb8b4ac);
  hq(-10, -7.96, 77, -7.84, 0.024, 0xf2f1e9);
  for (const u of [24.4, 25.5, 41.5, 42.6]) {
    box(u, -7.02, 0.42, 0.42, 0.012, 0.06, 0x242728, { solid: false });
    taper(u, -7.02, 0.072, 0.17, 0.025, 0.62, 0x242728);
    taper(u, -7.02, 0.33, 0.11, 0.08, 0.13, 0xe5e3dc);
  }
  K.slab(rect(-10, -22, 77, -14.6), 0.012, { mat: 'ssg_plaza_paving', uvRot: RA, thick: 0.12, ceil: false });
  for (const u of [-3, 18, 49, 64]) {
    box(u, -18.5, 2.7, 2.7, 0.012, 0.12, 0xb8b4ac, { solid: false });
    hq(u - 1.2, -19.7, u + 1.2, -17.3, 0.14, 0x4a483d);
    const [x, z] = P(u, -18.5); K.tree(x, z, { y: 0.14, h: 5.3, kind: 'zelkova' });
  }
  zone('신세계백화점 정문', '1F', '2게이트 · 유리 출입문', [23, 5, 44, 6], 0, 3.6, 2);
  // The forecourt is outdoors: do not extend the indoor area zone across it.

  // ------------------------------------------------------------ east surface parking (2025 ssg_03/04)
  // OSM 301889794 is the shared access aisle, not a boundary to park cars across.
  // Its 5 m carriageway lies near u80.8..82.5 over this frontage. A full two-row
  // lot therefore needs the additional east apron: row A 70.7..75.7, clear aisle
  // 75.7..85.6, row B 85.6..90.6. Gyeongbu's frontage starts beyond u~107.
  const LOT_Y = 0.035; // city service-road surface is y=.02; no coplanar asphalt
  K.slab(rect(70.7, -12, 91.2, 39.9), LOT_Y, { mat: 'asphalt', thick: 0.08, under: false, ceil: false });
  K.slab(rect(74.4, 39.9, 91.2, 55), LOT_Y, { mat: 'asphalt', thick: 0.08, under: false, ceil: false });
  const parkedColors = [0xf0f0eb, 0xc3c7c7, 0xe7e8e5, 0xaeb4b7, 0xf2f1ed, 0x292e32, 0xd4d6d4, 0xf4f4f0];
  for (const [row, u0, u1, count] of [['A', 70.7, 75.7, 17], ['B', 85.6, 90.6, 24]]) {
    for (let i = 0; i < count; i++) {
      const v = -5.75 + i * 2.5; // drop-off lane v-14.6..-7.6 remains entirely open
      if (row === 'B' && v > 25 && v < 33) continue; // east-side vehicle access
      const accessible = row === 'B' && i >= 4 && i < 8;
      if (accessible) hq(u0, v - 1.2, u1, v + 1.2, LOT_Y + 0.008, 0x326f99);
      for (const vv of [v - 1.25, v + 1.25]) hq(u0, vv - 0.045, u1, vv + 0.045, LOT_Y + 0.012, 0xe5e7e1);
      hq(row === 'A' ? u0 : u1 - 0.08, v - 1.25, row === 'A' ? u0 + 0.08 : u1, v + 1.25, LOT_Y + 0.012, 0xe5e7e1);
      if (accessible) {
        const [x, z] = P((u0 + u1) / 2, v);
        K.floorText('♿', { x, z, y: LOT_Y + 0.018, w: 1.9, h: 1.9, rotY: RA + PI / 2, fg: '#fff' });
        // ssg_04: yellow/black wheel stops at the fence end, not in the aisle.
        box(90.1, v, 0.15, 1.6, LOT_Y, 0.15, 0x222222, { solid: false });
        for (const dv of [-0.5, 0, 0.5]) box(90.1, v + dv, 0.16, 0.22, LOT_Y + 0.01, 0.15, 0xe2c23a, { solid: false });
      }
      if (accessible ? i === 5 : (i + (row === 'B' ? 1 : 0)) % 4 !== 0) {
        const [x, z] = P((u0 + u1) / 2, v);
        K.vehicle({ x, z, y: LOT_Y, kind: 'car', rotY: RA + (row === 'A' ? -PI / 2 : PI / 2), color: parkedColors[(i + (row === 'B' ? 3 : 0)) % parkedColors.length] });
      }
    }
  }
  // ssg_04 shows compact payment/barrier equipment at the north end of the lot.
  // Keep it on the building-side apron; the shared service-road aisle stays clear.
  for (const u of [71.2, 74.8]) {
    box(u, -11, 0.6, 0.6, LOT_Y, 0.18, 0xe2c23a, { solid: false });
    box(u, -11, 0.4, 0.4, LOT_Y + 0.18, 1.6, 0x2f3533);
    box(u, -11.23, 0.24, 0.035, 1.17, 0.3, 0x171c1b, { solid: false });
    for (const du of [-0.21, 0.21]) box(u + du, -11, 0.13, 0.62, LOT_Y + 0.18, 0.04, 0x222222, { solid: false });
  }
  box(71.2, -10.3, 0.48, 0.5, LOT_Y, 0.95, 0xe2c23a);
  box(72.7, -10.3, 3, 0.09, 1.0, 0.1, 0xf2f2eb, { solid: false });
  // Flat, layered red-pine silhouettes: K.tree(kind:'pine') produces a rounded
  // crown, so short offset cylinder sections give the module its own leaned trunks.
  function layeredPine(u, v) {
    for (let j = 0; j < 4; j++) {
      const [x, z] = P(u + j * 0.055, v + j * 0.025);
      K.cyl({ x, z, y: 0.45 + j * 0.75, r: 0.13, h: 0.82, mat: 0x6b4a3a, seg: 8 });
    }
    for (const [j, w, yy] of [[0, 3.6, 3.0], [1, 2.8, 3.8], [2, 2.0, 4.5], [3, 1.2, 5.1]]) {
      const [x, z] = P(u + (j % 2 ? 0.28 : -0.12), v + (j % 2 ? 0.15 : -0.12));
      K.cyl({ x, z, y: yy + 0.45, r: w / 2, h: 0.45, mat: 0x2f4a30, seg: 12, solid: false });
    }
  }
  // Leave the forecourt's drop-off continuation clear; pines screen the NE wall (ssg_03).
  for (const [v0, v1] of [[-22, -14.9], [-7.2, 6.5]]) {
    boxR(68.2, v0, 70.4, v1, 0, 0.45, 'ssg_granite');
    hq(68.3, v0 + 0.1, 70.3, v1 - 0.1, 0.46, 0x47573d);
  }
  for (const v of [-20, -16, -5, 1, 3.5, 6]) layeredPine(69.2, v);
  // Roadview's low stone planter masks only the south part of the pergola.
  box(70.6, 19, 0.3, 10, 0, 1.1, 'ssg_granite');
  boxR(68.8, 14, 70.45, 24, 0, 0.5, 'ssg_granite');
  hq(68.9, 14.1, 70.35, 23.9, 0.51, 0x42583c);

  // Green rail fence and hedge live at the outer lot edge; breaks retain both
  // the service road through route and the east-side driveway.
  function lotFence(u0, v0, u1, v1) {
    const len = Math.hypot(u1 - u0, v1 - v0), n = Math.ceil(len / 1.5);
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      box(u0 + (u1 - u0) * t, v0 + (v1 - v0) * t, 0.065, 0.065, LOT_Y, 1.2, 0x3a6052, { solid: false });
    }
    for (const yy of [0.35, 1.05]) {
      if (u0 === u1) box(u0, (v0 + v1) / 2, 0.065, len, yy, 0.055, 0x3a6052, { solid: false });
      else box((u0 + u1) / 2, v0, len, 0.065, yy, 0.055, 0x3a6052, { solid: false });
    }
  }
  for (const [v0, v1] of [[-12, 25], [33, 55]]) {
    lotFence(91.4, v0, 91.4, v1);
    box(91.9, (v0 + v1) / 2, 0.8, v1 - v0, 0.08, 0.75, 0x3f593c, { solid: false });
  }
  lotFence(85.6, -12, 91.4, -12);
  box(88.5, -12.5, 5.8, 0.8, 0.08, 0.75, 0x3f593c, { solid: false });
  for (const v of [-18, 7, 32]) {
    const [x, z] = P(69.4, v);
    K.cyl({ x, z, y: 0, r: 0.075, h: 7.6, mat: 0xa2a7a1, seg: 8 });
    box(69.4, v, 0.35, 0.35, 0, 0.18, 0x9a9993);
    box(69.8, v, 1.0, 0.24, 7.5, 0.16, 0x777d79, { solid: false });
  }
  // Outdoor parking keeps its photographed geometry without an indoor area claim.

  // Round10: the guessed exterior vehicle ramp cut crossed the official Gate1
  // threshold. No official plan/photo shows a descent here: restore the level apron.
  K.slab(rect(67, 36, 75, 50), 0, {mat:{tex:'sidewalk',color:0xbcb7ad},thick:.25});
  K.slab(rect(65.8, 51.25, 86.8, 57.75), LV.B2, {mat:'concrete',thick:.25,under:false,ceil:false});
  hq(66.8,51.25,86.8,57.75,-8.2,'concrete',false);
  for(const v of [51.25,57.75])wall(66.8,v,86.8,v,LV.B2,-8.2,{mat:'concrete',thick:.18});
  wall(86.8,51.25,86.8,57.75,LV.B2,-8.2,{mat:'concrete',thick:.18});

  K.texture('ssg_upper_tile', 512, 256, (g, w, h) => {
    g.fillStyle = '#8c8e90'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 90; i++) {
      g.strokeStyle = i % 2 ? 'rgba(222,223,222,.10)' : 'rgba(61,63,65,.09)';
      g.lineWidth = 1 + i % 3; g.beginPath(); g.moveTo(i * 13 % w, 0);
      g.bezierCurveTo(i * 19 % w, 70, i * 23 % w, 180, i * 17 % w, h); g.stroke();
    }
    g.fillStyle = '#626668'; g.fillRect(0, 0, w, 1.3); g.fillRect(0, 0, 1.3, h);
  }, [1.2, .6]);
  // ------------------------------------------------------------ slabs
  // Match the upper slab contour to the recessed glazing: no shelves protrude outside it.
  const northOutline = (vSouth, y) => {
    const front = y >= 20 && y < 24 ? [[23, BAY_BACK], [44, BAY_BACK]]
      : [[23, BAY_BACK], ...bay, [44, BAY_BACK]];
    return [P(0, 0), P(23, 0), ...front.map(p => P(...p)), P(44, 0), P(UW, 0), P(UW, vSouth), P(0, vSouth)];
  };
  const elvHoles = UPPER_ELV.map(e => rect(e.u - e.w / 2, e.v - e.d / 2, e.u + e.w / 2, e.v + e.d / 2));
  const atrHole = rect(...ATR);
  // stair hole at main-floor index s (B2=0): lane of the flight that arrives from s-1
  const stairLaneU = (c, s) => c.lanes[(s - 1) % 2];
  const stairHole = (c, s) => { const u = stairLaneU(c, s); return rect(u - 0.85, c.v0 + 2.2, u + 0.85, c.v1 - 2.2); };
  const coreTop = c => MAIN.indexOf(c.top);
  K.texture('ssg_1f_striped',512,512,(g,w,h)=>{
    g.fillStyle='#f3f0e8';g.fillRect(0,0,w,h);
    for(let i=-2;i<4;i++) {g.beginPath();g.moveTo(i*256,0);g.lineTo(i*256+85,0);g.lineTo(i*256+597,h);g.lineTo(i*256+512,h);g.closePath();g.fillStyle='#9c6552';g.fill();}
    for(let i=0;i<48;i++){g.beginPath();g.moveTo(i*23%512,0);g.bezierCurveTo(i*37%512,170,i*19%512,330,i*31%512,512);g.strokeStyle=i%3?'rgba(126,106,91,.10)':'rgba(255,255,255,.22)';g.lineWidth=.8;g.stroke();}
    g.strokeStyle='rgba(116,109,99,.15)';g.lineWidth=1;for(let i=0;i<=4;i++){g.beginPath();g.moveTo(i*128,0);g.lineTo(i*128,h);g.stroke();g.beginPath();g.moveTo(0,i*128);g.lineTo(w,i*128);g.stroke();}
  },[8,8]);
  const PLAN = (px,py) => [67*(1048-px)/1023,84.7*(py-402)/720];
  const MPLAN = (px,py) => [67*(1038-px)/853,84.7*(py-372)/600];
  // The same gate-constrained mirror used for 1F is applied independently to 1M.
  const mezzVoidPixels=[[258,452],[869,452],[869,740],[828,740]];
  for(let i=0;i<=24;i++){const a=.2+(Math.PI-.4)*i/24;mezzVoidPixels.push([607+225*Math.cos(a),738+122*Math.sin(a)]);}
  mezzVoidPixels.push([385,774],[258,774]);
  const MEZZ_VOID=mezzVoidPixels.map(p=>P(...MPLAN(...p)));
  // Lift backs touch the real north-west shared wall (u=0), doors face into the store.
  const NWLIFTS=[2,5.3].map(v=>({u:1.35,v,w:2.65,d:2.4}));
  const nwLiftHoles=NWLIFTS.map(e=>rect(e.u-e.d/2,e.v-e.w/2,e.u+e.d/2,e.v+e.w/2));
  const NW_ESC=[9.8,6.5,11.4,18.5];
  const beautyDownHoles=BEAUTY_BANKS.map(v=>rect(BANK_U0,v+.15,BANK_U1,v+1.75));
  const beautyUpHoles=BEAUTY_BANKS.map(v=>rect(BANK_U0,v-1.75,BANK_U1,v-.15));
  for(const hole of beautyDownHoles)K.groundHole(hole);
  const floorMat = { B2: { tex: 'concrete', color: 0x8c8d89 }, B1: 'ssg_marble', '1F': {tex:'ssg_1f_striped',gloss:.7}, '2F': {tex:'marble',color:0xf4efe4,gloss:.7}, '3F': {tex:'marble',color:0xf1ebdf,gloss:.5}, '11F': { tex: 'darkstone', color: 0xd4c5af } };
  for (const id of ['4F', '5F', '6F', '7F', '8F', '9F', '10F']) floorMat[id] = 'ssg_upper_tile';
  MAIN.forEach((id, s) => {
    const holes = id==='1F' ? [...nwLiftHoles] : id==='B1' ? [] : id==='B2' ? ELV.map(e=>rect(e.u-e.w/2,e.v-e.d/2,e.u+e.w/2,e.v+e.d/2)) : [...elvHoles];
    if(id==='2F')holes.push(...nwLiftHoles);
    if (id === '1F') holes.push(...beautyDownHoles);
    else if (s >= 3 && id !== '11F') holes.push(atrHole);
    if (s >= 4) holes.push(rect(...RIGHT_ATR));
    if (id === '2F') holes.push(...beautyUpHoles);
    if (s >= 1) for (const c of CORES) if (s <= coreTop(c) && !(id==='1F'||id==='2F') && !(id==='B1'&&c.door==='W')) holes.push(stairHole(c, s));
    K.slab(UPPER.has(id) ? rect(0, VS, UW, VD) : LV[id] >= LV['2F'] ? northOutline(VD, LV[id]) : FULL, LV[id], { mat: floorMat[id] ?? 'ssg_marble', thick: thick(id), holes, edge: false, under: id === 'B2' ? false : id === 'B1' ? { tex: 'concrete', color: 0xb4b2a9 } : CEIL });
  });
  // Aerial: dark membrane, mechanical penthouse, pale cooling boxes and an AC grid.
  // Roof pixels lean NW in the photograph; these ground-frame placements remain approximate.
  // The north glass enclosure now contains the central roof block; exposed services stay behind the square towers.
  boxR(20, 60, 40, 72, (LV.RF+.7), 3.5, 0x85827c, { solid: false, top: 0x99968f });
  for (const [u, v] of [[5.5, 78], [10, 78], [14.5, 78], [50, 78], [54.5, 78], [59, 78], [63, 78]]) {
    box(u, v, 3, 3, (LV.RF+.7) + 0.2, 3, 0xd8d8d4, { solid: false, top: 0xbfc1bd });
    const [x, z] = P(u, v); K.cyl({ x, z, y: (LV.RF+.7) + 3.21, r: 0.75, h: 0.12, mat: 0x777d79, seg: 12, solid: false });
    for (const dv of [-1, -0.5, 0, 0.5, 1]) box(u, v + dv, 2.6, 0.055, (LV.RF+.7) + 2.4, 0.1, 0x8f9693, { solid: false });
  }
  for (let u = 44; u <= 51; u += 2) for (let v = 64; v <= 70; v += 2) {
    box(u, v, 1.2, 1.2, (LV.RF+.7) + 0.1, 1, 0xc9ccc8, { solid: false, top: 0x7c8581 });
  }
  // mezzanine slab
  K.slab(FULL, LV['1M'], {mat:{tex:'marble',color:0xf4eee2,gloss:.5},thick:TH['1M'],holes:[MEZZ_VOID,...nwLiftHoles,rect(...NW_ESC)],edge:false,under:CEIL});

  // ------------------------------------------------------------ escalators (zigzag in the stacked atrium)
  const escH = 0.95;
  for (let i = 2; i < MAIN.length - 3; i++) { // only 2F and above; ground banks are independent
    const lo = LV[MAIN[i + 1]], hi = LV[MAIN[i + 2]];
    const even = i % 2 === 0;
    const [uu, ud] = even ? [LANE.A, LANE.B] : [LANE.C, LANE.D];
    const vLo = even ? ATR[1] : ATR[3], vHi = even ? ATR[3] : ATR[1];
    for (const [u, dir] of [[uu, 'up'], [ud, 'down']]) {
      const a = P(u, vLo), b = P(u, vHi);
      K.escalator(a[0], a[1], b[0], b[1], { ya: lo, yb: hi, w: 1.2, dir, speed: 0.6, sideMat: 0xeee7da, truss: 0xf3eee4 });
    }
    // Small destination plaque on the balustrade, below the sightline.
    sign(`${MAIN[i + 2]} ↑`, uu, vLo + (even ? -0.55 : 0.55), lo + 0.85, even ? 'N' : 'S', 0.55, 0.2, { bg: '#d8cbb8', fg: '#504638' });
  }
  // 1F guards only the B1 well; the full atrium guards on other floors stay unchanged.
  for (let k = 3; k < MAIN.length - 1; k++) {
    const id = MAIN[k], y = LV[id], th = thick(id);
    const opening = ATR;
    const gaps = { 35: [], 47: [] };
    const AB = [ATR[0], 31.0], CD = [36.0, ATR[2]];
    // pair k-1 upper end, pair k lower end
    // pair index i runs MAIN[i+1] -> MAIN[i+2]: the pair arriving at MAIN[k] is i=k-2, the departing one is i=k-1
    const arr = k === 3 ? -1 : k - 2, dep = k - 1;
    if (arr >= 0) { if (arr % 2 === 0) gaps[47].push(AB); else gaps[35].push(CD); }
    // The 1F→2F pair starts on solid floor outside the narrower B1 well.
    if (id !== '1F' && dep <= MAIN.length - 4) { if (dep % 2 === 0) gaps[35].push(AB); else gaps[47].push(CD); }
    const railSeg = (u0, v0, u1, v1) => {
      wall(u0, v0, u1, v1, y, y + 1.1, { mat: 'glass', thick: 0.04 });
      const L = Math.hypot(u1 - u0, v1 - v0); if (L < 0.05) return;
      box((u0 + u1) / 2, (v0 + v1) / 2, Math.abs(u1 - u0) + 0.06, Math.abs(v1 - v0) + 0.06, y + 1.1, 0.06, 0xb9a77f, { solid: false });
    };
    for (const v of [35, 47]) {
      let cur = opening[0];
      for (const g of gaps[v].sort((p, q) => p[0] - q[0])) { if (g[0] - cur > 0.15) railSeg(cur, v, g[0], v); cur = Math.max(cur, g[1]); }
      if (opening[2] - cur > 0.15) railSeg(cur, v, opening[2], v);
    }
    railSeg(opening[0], 35, opening[0], 47); railSeg(opening[2], 35, opening[2], 47);
    // white fascia band on the void edges
    boxR(opening[0], opening[1], opening[2], opening[1] + 0.04, y - th, th, 0xf7f4ee, { solid: false, skip: ['top', 'bottom'] });
    boxR(opening[0], opening[3] - 0.04, opening[2], opening[3], y - th, th, 0xf7f4ee, { solid: false, skip: ['top', 'bottom'] });
    boxR(opening[0], opening[1], opening[0] + 0.04, opening[3], y - th, th, 0xf7f4ee, { solid: false, skip: ['top', 'bottom'] });
    boxR(opening[2] - 0.04, opening[1], opening[2], opening[3], y - th, th, 0xf7f4ee, { solid: false, skip: ['top', 'bottom'] });
  }
  // Ground hall: each end has an UP to 2F beside a DOWN to B1, sharing one outline.
  // The two pop-up bands occupy the open interval between these banks.
  function dressedEscalator(u0,v0,u1,v1,ya,yb,dir) {
    const a=P(u0,v0),b=P(u1,v1),w=1.2;
    K.escalator(...a,...b,{ya,yb,w,dir,sideMat:0xb5b9b8,truss:0xeee7da});
    const dx=b[0]-a[0],dz=b[1]-a[1],len=Math.hypot(dx,dz),nx=-dz/len,nz=dx/len;
    // Rounded, substantial black handrail strips plus steel skirting are visible from both sides.
    for(const side of [-1,1])for(let i=0;i<24;i++) {
      const t=i/24,tt=(i+1)/24,off=side*.69;
      const q=(f,h)=>[a[0]+dx*f+nx*off,ya+(yb-ya)*f+h,a[1]+dz*f+nz*off];
      const rail=[q(t,.95),q(tt,.95),q(tt,1.06),q(t,1.06)];
      K.quad(0x202321,rail,[nx*side,0,nz*side]);K.quad(0x202321,rail.slice().reverse(),[-nx*side,0,-nz*side]);
      const steel=[q(t,.03),q(tt,.03),q(tt,.17),q(t,.17)];
      K.quad({tex:'metal',color:0xc5c5bc},steel,[nx*side,0,nz*side]);
    }
    for(const[u,v,y]of [[u0,v0,ya],[u1,v1,yb]])box(u,v,Math.abs(u1-u0)>1?1:.98,Math.abs(u1-u0)>1?.98:1,y-.035,.035,'metal',{solid:false});
  }
  function wellGuard(r,y,entry='W') {
    const[u0,v0,u1,v1]=r;
    for(const [side,a,b]of [['N',[u0,v0],[u1,v0]],['S',[u0,v1],[u1,v1]],['E',[u1,v0],[u1,v1]],['W',[u0,v0],[u0,v1]]]) {
      if(side===entry)continue;
      wall(...a,...b,y,y+1.05,{mat:'glass',thick:.045});
      box((a[0]+b[0])/2,(a[1]+b[1])/2,Math.abs(b[0]-a[0])+.06,Math.abs(b[1]-a[1])+.06,y+1.05,.055,0xa99470,{solid:false});
    }
  }
  BEAUTY_BANKS.forEach((v,i)=>{
    dressedEscalator(BANK_U0,v-.95,BANK_U1,v-.95,0,7,'up');
    dressedEscalator(BANK_U1,v+.95,BANK_U0,v+.95,-6,0,'down');
    wellGuard([BANK_U0,v+.15,BANK_U1,v+1.75],0,'W');
    wellGuard([BANK_U0,v-1.75,BANK_U1,v-.15],7,'E');
    // One polished sill encloses both lanes. No floor crosses the down opening.
    for(const vv of [v-1.8,v+1.8])box((BANK_U0+BANK_U1)/2,vv,18,.08,0,.08,'metal',{solid:false});
    sign(['2층 ↑','지하 1층 ↓'],BANK_U0-.7,v,1.45,'W',1.7,.6,{bg:'#423c32',fg:'#fff2d6',twoSided:true});
    zone(`화장품관 ${i+1}번 에스컬레이터`,'1F','2층 올라감 · 지하 1층 내려감',[24.4,v-2,44.7,v+2],0,3.6,4);
    // New B1 arrivals and 2F landings are kept clear of existing tenant stock.
    box(BANK_U1+.65,v+.95,1.3,1.5,-6.08,.08,{tex:'marble',color:0xe8dfce});
    box(BANK_U1+.65,v-.95,1.3,1.5,6.92,.08,{tex:'marble',color:0xe8dfce});
  });
  dressedEscalator(10.6,6.5,10.6,18.5,0,3.6,'up');
  zone('북서벽 중층 에스컬레이터','1F','1.5층 · 멤버스바 · 베키아에누보',[9.6,4.8,11.6,20.5],0,3.6,4);
  sign('중층 · 커피 바 ↑',10.6,5.5,1.65,'N',2,.34,{bg:'#514636',fg:'#fff1d6',twoSided:true});

  // ------------------------------------------------------------ elevators
  const ELV_FLOORS = [
    { label: 'B2', y: LV.B2, name: '주차장' },
    { label: 'B1', y: LV.B1, name: '식품관 · 스위트파크 · 하우스 오브 신세계' },
    { label: '1F', y: LV['1F'], name: '화장품 · 해외유명브랜드 · 잡화' },
    { label: '1M', y: LV['1M'], name: '액세서리 · 여행 · 식음료' },
    { label: '2F', y: LV['2F'], name: '해외유명브랜드' },
    { label: '3F', y: LV['3F'], name: '인터내셔널 디자이너 · 워치&주얼리' },
    { label: '4F', y: LV['4F'], name: '여성 컨템포러리 · 그랜드 슈' },
    { label: '5F', y: LV['5F'], name: '여성 클래식 · 영캐주얼 · 핸드백' },
    { label: '6F', y: LV['6F'], name: '남성 럭셔리 · 남성 컨템포러리' },
    { label: '7F', y: LV['7F'], name: '골프 · 남성 캐주얼 · 남성 컨템포러리 · 남성 정장' },
    { label: '8F', y: LV['8F'], name: '뉴 스트리트 · 베이직 스포츠 · 아웃도어' },
    { label: '9F', y: LV['9F'], name: '신세계홈 (가구 · 가전 · 키친)' },
    { label: '10F', y: LV['10F'], name: '리틀 신세계 · 란제리' },
    { label: '11F', y: LV['11F'], name: '전문식당가 · S GARDEN' },
  ];
  // Arrive on the level landing just north of each car, with the full floor list retained.
  const ARR = { dx: -2.2 * SA, dz: -2.2 * CA };
  const MARKET_B1_DEST=P(B1u(578),B1v(617)+1.8);
  ELV.forEach((e, i) => {
    const [x, z] = P(e.u, e.v);
    const basement=K.elevator({name:`신세계 지하 엘리베이터 ${i+1}호기`,x,z,rotY:RA+PI,w:e.w,d:e.d,topH:4.6,floors:ELV_FLOORS.filter(f=>f.label==='B2').map(f=>({...f,...ARR})),mat:0xc9c2b4});
    const ue=UPPER_ELV[i],[ux,uz]=P(ue.u,ue.v),updest=P(ue.u,ue.v-2.2);
    const upper=K.elevator({name:`신세계 상층 엘리베이터 ${i+1}호기`,x:ux,z:uz,rotY:RA+PI,w:e.w,d:e.d,floors:ELV_FLOORS.filter(f=>f.y>=7).map(f=>({...f,...ARR})),mat:0xc9c2b4});
    const nw=NWLIFTS[i%NWLIFTS.length],destination=P(nw.u+2.8,nw.v);
    // K.elevator's returned destination table is shared with its interaction menu.
    // Retain existing visible shafts, but allow a return to the relocated 1F/1M lobby.
    const menu=ELV_FLOORS.map(f=>({...f,...(f.label==='B1'?{dx:MARKET_B1_DEST[0]-x,dz:MARKET_B1_DEST[1]-z}:['1F','1M'].includes(f.label)?{dx:destination[0]-x,dz:destination[1]-z}:ARR)}));
    basement.floors=menu.map(f=>f.y>=7?{...f,dx:updest[0]-x,dz:updest[1]-z}:f);
    upper.floors=menu.map(f=>f.y>=7?{...f,...ARR}:{...f,dx:f.dx+x-ux,dz:f.dz+z-uz});

  });
  NWLIFTS.forEach((e,i)=>{
    const[x,z]=P(e.u,e.v),upper=UPPER_ELV[i],remote=P(upper.u,upper.v-2.2);
    const low=['1F','1M','2F'];
    // The visible ground lobby is relocated; existing basement/upper-floor arrivals stay intact.
    K.elevator({name:`북서벽 고객 엘리베이터 ${i+1}호기`,x,z,rotY:FACE.E,w:e.w,d:e.d,shaft:false,
      floors:ELV_FLOORS.map(f=>({...f,...(f.label==='B1'?{dx:MARKET_B1_DEST[0]-x,dz:MARKET_B1_DEST[1]-z}:low.includes(f.label)?{dx:2.8*CA,dz:-2.8*SA}:{dx:remote[0]-x,dz:remote[1]-z})}))});
    for(const label of low){
      const y=LV[label],u0=e.u-e.d/2,u1=e.u+e.d/2,v0=e.v-e.w/2,v1=e.v+e.w/2;
      for(const ab of [[u0,v0,u0,v1],[u0,v0,u1,v0],[u0,v1,u1,v1]])wall(...ab,y,y+3.1,{mat:0xeae3d6,thick:.12});
      wall(u1,v0,u1,v1,y,y+3.1,{mat:'metal',thick:.12,openings:[{at:e.w/2,w:1.4,y0:y,y1:y+2.35}]});
      K.slab(rect(u0,v0,u1,v1),y,{mat:'metal',thick:.05,ceil:false,edge:false});
      sign(label,u1+.09,e.v,y+2.55,'E',.7,.24,{bg:'#282921',fg:'#f3ca82'});
      box(u1+.1,e.v+.94,.05,.14,y+1,.24,0x4a4941,{solid:false});
      sign('↑ ↓',u1+.14,e.v+.94,y+1.13,'E',.12,.18,{bg:'#25251f',fg:'#ffe5ac'});
      lightPanel(u1+1.2,e.v,y+3.08,1.8,1.6);
    }
  });
  furnish('1F',()=>{
    sign('엘리베이터 · 전층 안내',3.1,8.5,2.48,'E',3.1,.4,{bg:'#625543',fg:'#fff4dc'});
    sign(ELV_FLOORS.slice().reverse().map(f=>`${f.label}  ${f.name}`),3.2,9.4,1.55,'E',2.2,2.45,{bg:'#eee5d5',fg:'#403c35',bold:false,pxPerM:110});
  });
  const DIRECTORY = ['층별 안내', ...ELV_FLOORS.slice().reverse().map(f => `${f.label}  ${f.name}`)];

  // ------------------------------------------------------------ stair cores (enclosed, alternating lanes)
  for (const c of CORES) {
    const vA = c.v0 + 2.2, vB = c.v1 - 2.2, uDoor = c.door === 'W' ? c.uL : c.uR, top = coreTop(c), FL = MAIN.slice(0, top + 1);
    for (let s = 0; s < top; s++) {
      if(MAIN[s]==='B1'||MAIN[s]==='1F'||(MAIN[s]==='B2'&&c.door==='W'))continue;
      const ya = LV[MAIN[s]], yb = LV[MAIN[s + 1]], lane = s % 2, u = c.lanes[lane];
      const [v0, v1] = lane === 0 ? [vA, vB] : [vB, vA];
      const a = P(u, v0), b = P(u, v1);
      K.stairs(a[0], a[1], b[0], b[1], { w: 1.6, ya, yb, mat: { tex: 'darkstone', color: 0xb0aaa2 }, railMat: 0x5c6166 });
    }
    // guards around each floor's stair hole
    for (let s = 1; s <= top; s++) {
      if(MAIN[s]==='1F'||MAIN[s]==='2F'||(MAIN[s]==='B1'&&c.door==='W'))continue;
      const y = LV[MAIN[s]], lane = (s - 1) % 2, u = c.lanes[lane];
      const farV = lane === 0 ? vA : vB; // arriving flight enters from the far (deep) end
      wall(u - 0.85, farV, u + 0.85, farV, y, y + 1.1, { mat: 0x5c6166, thick: 0.05 });
      const uMid = (c.lanes[0] + c.lanes[1]) / 2;
      wall(uMid, vA, uMid, vB, y, y + 1.1, { mat: 0x5c6166, thick: 0.05 });
    }
    // enclosure: door wall with openings at both landings on every floor, end walls
    // One wall segment per storey keeps the landing openings explicit.
    for (const id of FL) {
      if(id==='1F'||(id==='B1'&&c.door==='W'))continue;
      const y = LV[id], y1 = LV[nextOf(id)];
      wall(uDoor, c.v0, uDoor, c.v1, y, y1, { mat: 0xe4dfd6, thick: 0.25, openings: [{ at: 1.1, w: 1.8, y0: y, y1: y + 2.3 }, { at: c.v1 - c.v0 - 1.1, w: 1.8, y0: y, y1: y + 2.3 }] });
    }
    for(const [ya,yb] of [[LV.B2,c.door==='W'?LV.B1:0],[7,LV[nextOf(c.top)]]])for(const v of [c.v0,c.v1])wall(c.uL,v,c.uR,v,ya,yb,{mat:0xe4dfd6,thick:.25});
    for (const id of FL) {
      if(id==='1F'||(id==='B1'&&c.door==='W'))continue;
      const y = LV[id], fo = c.door === 'W' ? 'W' : 'E', off = c.door === 'W' ? -0.14 : 0.14;
      sign(['비상계단', id], uDoor + off, c.v0 + 1.1, y + 2.75, fo, 0.9, 0.42, { bg: '#1f7a3a', fg: '#fff' });
      sign(['비상계단', id], uDoor + off, c.v1 - 1.1, y + 2.75, fo, 0.9, 0.42, { bg: '#1f7a3a', fg: '#fff' });
      hq(c.uL + 0.15, c.v0 + 0.15, c.uR - 0.15, c.v0 + 2.2, y + 0.01, { tex: 'concrete', color: 0xcfcac2 });
      hq(c.uL + 0.15, c.v1 - 2.2, c.uR - 0.15, c.v1 - 0.15, y + 0.01, { tex: 'concrete', color: 0xcfcac2 });
    }
  }

  // ------------------------------------------------------------ shop builder
  const DARK_PORTAL = [0x1d1c1b, 0x2a2420, 0x1e2a33, 0x3a2f28];
  const LIGHT_PORTAL = [0xe8e1d4, 0xd9cbb3, 0xcfc6b8, 0xefe9df];
  const GARMENT = [0x1d1d1d, 0xf0ece4, 0x8a6a4a, 0x2b3a55, 0xa03030, 0xc9b28a, 0x6a6a6a, 0x3b5a3a, 0xe0c0c8, 0x24324a];
  // Names explicitly present in the supplied research/OSM, not a generic department-store tenant list.
  const knownNames = new Set([
    '조 말론 런던', '르 라보', '바이레도', '딥티크', '아워글래스', '디올 뷰티', '샤넬 뷰티',
    '에스티 로더', '랑콤', '설화수', '시슬리', '라 메르', '입생로랑 뷰티', '톰 포드 뷰티', '겔랑',
    '아르마니 뷰티', '끌레드뽀 보떼', '헤라', '맥', '바비 브라운', '나스', '후', '키엘', '크리니크', '시세이도', '이솝',
    'K2', '르꼬끄 스포르티브', '닥터마틴', 'BY THE GLASS', '김수사', '타치바나',
    '에르메스', '샤넬', '루이 비통', '펜디', '버버리', '메종 마르지엘라', '백 갤러리',
    '구찌', '디올', '프라다', '보테가 베네타', '셀린느', '몽클레르', '미우미우', '코치', '토즈', '페라가모',
    '디올 옴므', '셀린느 옴므', '로에베', '반클리프 아펠', '오데마 피게', '피아제', 'IWC', '예거 르쿨트르', '파네라이', '랑에 운트 죄네',
    '인텔리젠시아 커피', '조니 로켓', '오설록', '도쿄밀크치즈팩토리', '바위파스타바', '스타벅스 센트럴시티점',
    '새벽종', '수퍼판 델리', '해방촌닭', '타르투플랑게', '프루니에', '마켓 레인', '시화당', '스시도쿠', '와인하우스',
    '보앤미', '교토 오니마루', '블루 버터플라이', '서연', '화돈점정', '베지 스튜디오', '와사비 그린', '웰니스바',
    '분더샵 메자닌', '퍼스널 쇼퍼룸', '버건디&', '아스티에 드 빌라트', '아쿠아 디 파르마', '불리 1803',
    '메종 프란시스 커정', '뽀아레', '스위스퍼펙션', '더 로우', '다니엘라 그레지스', '가브리엘라 허스트',
    '체사레 아톨리니', '오라치오 루치아노', '본토니', '퓌포카', 'SI 셀렉트샵', 'S스타일 디자이너 슈즈',
    '리앤한 편집샵', '골든구스', '리비에라스', '오르픽', '나이키', '마이분', '스타일 컨템포러리', '블루핏',
    '뉴 스테이지', '분더샵 맨', '사르토', '클럽모나코 바버샵', '그랜드 슈', '신세계홈', '리틀 신세계',
    '더키친 살바토레쿠오모', '히바린', '호경전', '꼴라쥬', '타마린드', '덕인관', '평양면옥',
  ]);
  const categoryNames = { lux: '해외패션', fashion: '의류', bag: '잡화', cos: '화장품 · 향수', jewel: '주얼리',
    watch: '시계', shoe: '슈즈', rest: '식당가', cafe: '카페', food: '식품', stall: '식품', wine: '와인',
    home: '가구 · 리빙', elec: '가전', kitchen: '키친웨어', kid: '유아동', lingerie: '란제리', golf: '골프',
    sim: '시타실', sport: '스포츠', popup: '행사 공간', lounge: '휴게 공간', service: '고객 서비스' };
  let shopCount = 0;
  function shop(o) {
    const { u0, v0, u1, v1, f, y } = o;
    const H = o.H ?? 4.2, kind = o.kind || 'fashion';
    const [rawSign, koName] = String(o.name).split('|');
    const rawName = koName || rawSign;
    const supported = knownNames.has(rawName.replace(/ \(.*\)$/, '')) || /^(스위트파크|하우스 오브 신세계)/.test(rawName);
    const counterCategories = ['스킨케어', '메이크업', '향수', '뷰티 상담'];
    const signText = supported ? rawSign : (kind === 'cos' ? counterCategories[shopCount % counterCategories.length] : categoryNames[kind] || '매장');
    const zoneName = supported ? rawName : signText;
    const Wf = f === 'N' || f === 'S' ? u1 - u0 : v1 - v0, Dp = f === 'N' || f === 'S' ? v1 - v0 : u1 - u0;
    const along = f === 'N' || f === 'S';
    const ST = (s, t) => f === 'S' ? [u0 + s, v1 - t] : f === 'N' ? [u1 - s, v0 + t] : f === 'E' ? [u1 - t, v1 - s] : [u0 + t, v0 + s];
    const fb = (s, t, ls, lt, yy, h, mat, oo) => {
      const [u,v]=ST(s,t),w=along?ls:lt,d=along?lt:ls;
      // Keep the relocated north-west lift lobby clear on 2F as well as the ground floor.
      if(o.floor==='2F'&&u-w/2<7&&u+w/2>0&&v-d/2<7.5&&v+d/2>0)return;
      return box(u,v,w,d,yy,h,mat,oo);
    };
    const fsign = (text, s, t, yy, w, h, oo) => { const [u, v] = ST(s, t); sign(text, u, v, yy, f, w, h, oo); };
    const fwall = (s0, t0, s1, t1, ya, yb, oo) => { const a = ST(s0, t0), b = ST(s1, t1); wall(a[0], a[1], b[0], b[1], ya, yb, oo); };
    const person = (s, t, oo) => { const [u, v] = ST(s, t); const [x, z] = P(u, v); K.person(x, y, z, oo); };
    const r = rnd, seed = shopCount++;
    const isLux = kind === 'lux' || kind === 'jewel' || kind === 'watch';
    const portal = o.portal ?? (isLux ? (seed % 3 === 0 ? DARK_PORTAL : LIGHT_PORTAL)[seed % 4] : null);
    const portalDark = portal !== null && DARK_PORTAL.includes(portal);
    const partH = o.partH ?? (kind === 'cos' || kind === 'food' || kind === 'stall' ? 2.6 : H);
    const part = o.partMat ?? (y === LV.B1 ? { tex: 'wood', color: 0xb69a77 } : 0xe9e0d2);
    // floor finish
    const fm = { lux: { tex: 'wood', color: 0xd8c0a0 }, jewel: { tex: 'carpet', color: 0xd9cfc4 }, watch: { tex: 'darkstone', color: 0xc8c0b8 }, rest: { tex: 'wood', color: 0xc8a888 }, home: { tex: 'wood', color: 0xe0cdb2 }, kid: { tex: 'tile', color: 0xf3e8c8 }, golf: { tex: 'carpet', color: 0x9fb39a } }[kind];
    if (fm) K.hpoly(fm, rect(Math.min(u0, u1) + 0.1, Math.min(v0, v1) + 0.1, Math.max(u0, u1) - 0.1, Math.max(v0, v1) - 0.1), y + 0.012);
    // partitions
    if (o.sides !== false) { fwall(0, 0, 0, Dp, y, y + partH, { mat: part, thick: 0.12 }); fwall(Wf, 0, Wf, Dp, y, y + partH, { mat: part, thick: 0.12 }); }
    if (o.back !== false) fwall(0, Dp, Wf, Dp, y, y + (o.backH ?? partH), { mat: o.backMat ?? part, thick: 0.12 });
    // front
    const sigBg = o.bg ?? (portal !== null ? (portalDark ? '#1d1c1b' : '#efe9df') : '#262626');
    const sigFg = o.fg ?? (portal !== null ? (portalDark ? '#f1e7d2' : '#1d1d1d') : '#ffffff');
    if (portal !== null) {
      const dw = Math.min(4.2, Wf * 0.42), ww = Math.min(2.6, Wf * 0.18);
      const openings = [{ at: Wf / 2, w: dw, y0: y, y1: y + Math.min(3.4, H - 0.6) }];
      if (Wf > 9) openings.push({ at: Wf * 0.17, w: ww, y0: y + 0.5, y1: y + Math.min(3.2, H - 0.8) }, { at: Wf * 0.83, w: ww, y0: y + 0.5, y1: y + Math.min(3.2, H - 0.8) });
      fwall(0, 0.15, Wf, 0.15, y, y + H, { mat: portal, thick: 0.3, openings });
      fsign(signText, Wf / 2, -0.01, y + Math.min(3.4, H - 0.6) + (H - Math.min(3.4, H - 0.6)) / 2, Math.min(Wf * 0.7, 9), o.signH ?? Math.min(0.75, (H - Math.min(3.4, H - 0.6)) * 0.7), { bg: sigBg, fg: sigFg, bold: false, ...o.signStyle });
      if (Wf > 9) for (const s of [Wf * 0.17, Wf * 0.83]) { fb(s, 0.9, ww - 0.2, 0.9, y, 0.45, 0xf5f0e6); person(s, 0.9, { shirt: GARMENT[(seed + s | 0) % GARMENT.length] }); }
    } else if (kind === 'cos') {
      // Counter identity lives on the display back, not on a suspended blade.
    } else if (kind === 'stall' || kind === 'food' || o.sides === false) {
      const sw = Math.min(Wf * 0.72, 3.6);
      fb(Wf / 2, 1.1, sw + 0.16, 0.18, y + 1.46, 0.42, { tex: 'wood', color: 0x7b624c }, { solid: false });
      fsign(signText, Wf / 2, 0.99, y + 1.68, sw, 0.3, { bg: '#e8ddc9', fg: '#46382d', bold: false });
    } else {
      fb(Wf / 2, 0.15, Wf, 0.3, y + Math.min(3.2, H - 0.8), H - Math.min(3.2, H - 0.8), o.fascia ?? 0x2b2b2b, { solid: false, skip: ['bottom'] });
      fsign(signText, Wf / 2, -0.02, y + Math.min(3.2, H - 0.8) + (H - Math.min(3.2, H - 0.8)) / 2, Math.min(Wf * 0.8, 8), Math.min(0.62, (H - Math.min(3.2, H - 0.8)) * 0.75), { bg: sigBg, fg: sigFg });
      if (o.glass) fwall(0, 0.05, Wf, 0.05, y, y + Math.min(3.2, H - 0.8), { mat: 'glass', thick: 0.04, openings: [{ at: Wf / 2, w: Math.min(2.4, Wf * 0.4), y0: y, y1: y + 2.4 }] });
    }
    // fixtures
    const fx = FIXTURES[kind] || FIXTURES.fashion;
    furnish(o.floor, () => fx({ Wf, Dp, y, H, fb, fsign, fwall, person, r, seed, name: signText, koName: zoneName }));
    if (o.zone !== false) K.zone({ name: zoneName, floor: o.floor, sub: o.sub ?? '신세계백화점 강남점', poly: rect(Math.min(u0, u1), Math.min(v0, v1), Math.max(u0, u1), Math.max(v0, v1)), y0: y, y1: y + Math.max(2.6, H), priority: 3 });
  }
  const FIXTURES = {
    fashion({ Wf, Dp, y, fb, person, r, seed }) {
      const n = Math.max(1, Math.min(4, Math.floor((Wf - 1) / 2.4)));
      for (let i = 0; i < n; i++) {
        const s = (i + 0.5) * Wf / n, t = Dp * 0.55;
        fb(s, t, 1.7, 0.06, y + 1.55, 0.05, 0x9a9a9a, { solid: false });
        for (const end of [-.78,.78]) { fb(s+end,t,.045,.045,y,.0+1.6,0xaeb3b5,{solid:false}); fb(s+end,t,.34,.6,y,.06,0x8b9092,{solid:false}); }
        for(let garment=0;garment<8;garment++) {
          const ss=s-.63+garment*.18,col=GARMENT[(seed+i+garment)%GARMENT.length];
          fb(ss,t,.11,.42,y+.48,.96,col,{solid:false});
          for(const dt of [-.26,.26])fb(ss,t+dt,.10,.13,y+.61,.72,col,{solid:false});
          fb(ss,t,.035,.30,y+1.44,.06,0xb4a48b,{solid:false});
          fb(ss,t,.02,.02,y+1.50,.07,0xbcc1c3,{solid:false});
        }
      }
      fb(Wf / 2, Dp * 0.25, Math.min(1.6, Wf * 0.4), 0.8, y, 0.82, { tex: 'wood', color: 0xd9c4a8 });
      fb(Wf - 0.75, Dp - 0.75, 1.2, 1.2, y, 2.3, 0xe8e2d8);
      fb(Wf / 2, Dp - 0.3, Wf - 1.6, 0.35, y + 0.2, 1.9, { tex: 'ssg_rack', color: GARMENT[(seed + 3) % GARMENT.length], scale: [1.5, 1.9] }, { solid: false });
      person(Math.min(1.2, Wf * 0.2), 0.9, { shirt: GARMENT[(seed + 5) % GARMENT.length] });
      void r;
    },
    lux({ Wf, Dp, y, fb, person, seed }) {
      fb(Wf / 2, Dp - 0.35, Wf - 0.6, 0.45, y, 2.6, { tex: 'wood', color: 0xe6d6bc });
      for (let k = 0; k < 3; k++) fb(Wf / 2, Dp - 0.6, Wf - 1.2, 0.05, y + 0.7 + k * 0.6, 0.04, { tex: 'emit', color: 0xfff1d6 }, { solid: false });
      for (let row=0;row<3;row++) for(let k=0;k<Math.floor((Wf-1.4)/.65);k++) {
        const ss=.8+k*.65,yy=y+.75+row*.6,col=GARMENT[(seed+k+row)%GARMENT.length];
        fb(ss,Dp-.65,.30,.23,yy,.24,col,{solid:false});
        for(const ds of [-.08,.08])fb(ss+ds,Dp-.65,.03,.04,yy+.24,.10,col,{solid:false});
        fb(ss,Dp-.65,.19,.04,yy+.33,.025,col,{solid:false});
      }
      fb(Wf / 2 - Math.min(2, Wf * 0.18), Dp * 0.45, 1.4, 0.8, y, 0.85, { tex: 'marble', color: 0xf2ece2 }); fb(Wf / 2 + Math.min(2, Wf * 0.18), Dp * 0.45, 1.4, 0.8, y, 0.85, { tex: 'marble', color: 0xf2ece2 });
      for (let k = 0; k < 2; k++) fb(Wf / 2 + (k ? 1 : -1) * Math.min(2, Wf * 0.18), Dp * 0.45, 0.35, 0.25, y + 0.85, 0.22, GARMENT[(seed + k) % GARMENT.length], { solid: false });
      fb(Wf * 0.78, Dp * 0.75, 1.8, 0.8, y, 0.45, 0x5a4a3c); fb(Wf * 0.78, Dp * 0.75 + 0.35, 1.8, 0.15, y + 0.45, 0.45, 0x5a4a3c, { solid: false });
      for (const s of [0.6, Wf - 0.6]) fb(s, Dp * 0.5, 0.45, Dp * 0.55, y, 2.4, 0xe2d6c2);
      person(Wf * 0.3, Dp * 0.7, { shirt: 0x1d1d1d, pants: 0x1d1d1d });
    },
    jewel({ Wf, Dp, y, fb, person }) {
      const n = Math.max(2, Math.floor(Wf / 2.4));
      for (let i = 0; i < n; i++) { const s = (i + 0.5) * Wf / n; fb(s, Dp * 0.45, 1.6, 0.6, y, 0.95, { tex: 'marble', color: 0xf2ece2 }); fb(s, Dp * 0.45, 1.5, 0.5, y + 0.95, 0.3, 'glass', { solid: false }); fb(s, Dp * 0.45, 1.3, 0.3, y + 0.96, 0.03, { tex: 'emit', color: 0xfff6e0 }, { solid: false }); }
      fb(Wf / 2, Dp - 0.3, Wf - 0.6, 0.35, y, 2.4, 0x2a2622);
      for (let i = 0; i < 2; i++) fb(Wf * (0.3 + i * 0.4), Dp * 0.75, 0.5, 0.5, y, 0.48, 0x6a4f3a);
      person(Wf * 0.5, Dp * 0.65, { shirt: 0x1d1d1d, pants: 0x1d1d1d });
    },
    watch(a) { FIXTURES.jewel(a); },
    cos({ Wf, Dp, y, fb, fsign, name, seed }) {
      fb(Wf / 2, Dp - 0.25, Wf - 0.3, 0.35, y + 0.9, 1.6, 0xf6f1ea, { solid: false });
      for (let k = 0; k < 3; k++) fb(Wf / 2, Dp - 0.45, Wf - 0.6, 0.06, y + 1.2 + k * 0.45, 0.03, { tex: 'emit', color: 0xfff6ea }, { solid: false });
      fb(Wf / 2, Dp - 0.48, Math.min(Wf - 0.5, 3.4), 0.12, y + 2.15, 0.5, { tex: 'emit', color: 0xf6e9cf }, { solid: false });
      fsign(name, Wf / 2, Dp - 0.56, y + 2.4, Math.min(Wf - 0.7, 3.1), 0.3, { bg: null, fg: '#453a30', bold: false });
      fb(Wf / 2, Dp * 0.45, Math.max(1.2, Wf - 2.2), 0.6, y, 0.95, seed % 2 ? { tex: 'darkstone', color: 0x3a3634 } : { tex: 'marble', color: 0xf6f1ea });
      fb(Wf / 2, Dp * 0.45, Math.max(1.0, Wf - 2.4), 0.5, y + 0.95, 0.25, 'glass', { solid: false });
      for(let row=0;row<3;row++)for(let k=0;k<Math.max(4,Math.floor((Wf-.8)/.18));k++) {
        const ss=.45+k*.18,yy=y+1.24+row*.45;
        fb(ss,Dp-.46,.10,.12,yy,.14+(k%3)*.045,[0xe7ce9c,0xe3d9cf,0x3c3026,0xc5938f][(seed+k+row)%4],{solid:false});
        fb(ss,Dp-.46,.07,.08,yy+.14+(k%3)*.045,.04,0x9d865d,{solid:false});
      }
      for(let k=0;k<8;k++)fb(Wf*.27+k*Wf*.06,Dp*.45,.11,.12,y+.98,.13+(k%3)*.03,0xb59b75,{solid:false});
      fb(0.45, Dp * 0.5, 0.6, Dp * 0.6, y, 1.1, 0xe9e2d6); fb(Wf - 0.45, Dp * 0.5, 0.6, Dp * 0.6, y, 1.1, 0xe9e2d6);
      for (const s of [Wf * 0.35, Wf * 0.65]) fb(s, Dp * 0.18, 0.4, 0.4, y, 0.65, 0xb8a684);
    },
    shoe({ Wf, Dp, y, fb, person, seed }) {
      fb(Wf / 2, Dp - 0.25, Wf - 0.3, 0.4, y, 2.4, { tex: 'wood', color: 0xe6d6c0 });
      for (let k = 0; k < 4; k++) fb(Wf / 2, Dp - 0.5, Wf - 0.8, 0.12, y + 0.4 + k * 0.5, 0.1, GARMENT[(seed + k) % GARMENT.length], { solid: false });
      for (const s of [0.3, Wf - 0.3]) fb(s, Dp * 0.55, 0.4, Dp * 0.6, y, 2.0, { tex: 'wood', color: 0xe6d6c0 });
      fb(Wf / 2, Dp * 0.4, 1.4, 0.5, y, 0.42, 0x6f5a48); fb(Wf / 2, Dp * 0.4, 0.3, 0.2, y + 0.42, 0.12, 0xa03030, { solid: false });
      fb(Wf * 0.25, Dp * 0.2, 0.8, 0.8, y, 0.6, 0xf5f2ec); fb(Wf * 0.75, Dp * 0.2, 0.8, 0.8, y, 0.75, 0xf5f2ec);
      person(Wf * 0.6, Dp * 0.6, { sit: false });
    },
    food({ Wf, Dp, y, fb, fsign, name, seed }) {
      fb(Wf / 2, 0.7, Wf - 0.6, 0.9, y, 0.95, seed % 2 ? 0x3a2e26 : 0xf2ede4);
      fb(Wf / 2, 0.7, Wf - 0.8, 0.7, y + 0.95, 0.4, 'glass', { solid: false });
      fb(Wf / 2, 0.7, Wf - 1.0, 0.5, y + 0.96, 0.12, [0xd89048, 0xe8c070, 0x9a4a2a, 0xf0e0c0][seed % 4], { solid: false });
      fb(Wf / 2, Dp - 0.5, Wf - 0.4, 0.8, y, 0.92, 'metal');
      fb(Wf / 2, Dp - 0.5, Wf - 0.6, 0.9, y + 2.2, 0.5, 'metal', { solid: false });
      fsign([name, '라이브 키친'], Wf / 2, Dp - 0.08, y + 2.0, Math.min(Wf - 0.6, 3), 0.55, { bg: '#1e1a16', fg: '#ffd9a0' });
      fb(0.3, Dp / 2, 0.3, Dp - 0.6, y, 0.92, 'metal');
    },
    stall(a) { FIXTURES.food(a); },
    rest({ Wf, Dp, y, fb, person, seed }) {
      fb(Wf / 2, Dp - 0.6, Wf - 0.4, 0.9, y, 1.05, { tex: 'wood', color: 0x8a6448 });
      fb(Wf / 2, Dp - 0.15, Wf - 0.3, 0.2, y + 1.6, 1.2, 0x3a2e26, { solid: false });
      const cols = Math.max(1, Math.floor((Wf - 1) / 2.6)), rows = Math.max(1, Math.floor((Dp - 3.2) / 2.4));
      for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) {
        const s = (i + 0.5) * Wf / cols, t = 1.6 + (j + 0.5) * (Dp - 3.2) / rows;
        fb(s, t, 0.9, 0.9, y, 0.74, seed % 2 ? 0xf3efe8 : 0x5a4636);
        fb(s - 0.75, t, 0.42, 0.42, y, 0.45, 0x2f2a26, { solid: false }); fb(s + 0.75, t, 0.42, 0.42, y, 0.45, 0x2f2a26, { solid: false });
        if ((i + j + seed) % 3 === 0) { person(s - 0.75, t, { sit: true }); person(s + 0.75, t, { sit: true }); }
      }
    },
    cafe({ Wf, Dp, y, fb, person, seed }) {
      fb(Wf / 2, Dp - 0.7, Wf - 0.6, 0.8, y, 1.05, { tex: 'wood', color: 0x6a4a32 });
      fb(Wf / 2, Dp - 0.1, Wf - 0.4, 0.15, y + 1.8, 0.9, 0x1d2a22, { solid: false });
      const n = Math.max(1, Math.floor(Wf / 2.4));
      for (let i = 0; i < n; i++) { const s = (i + 0.5) * Wf / n; fb(s, Dp * 0.4, 0.7, 0.7, y, 0.74, 0xf0ebe2); fb(s, Dp * 0.4 - 0.6, 0.4, 0.4, y, 0.45, 0x3a3a3a, { solid: false }); if ((i + seed) % 2) person(s, Dp * 0.4 - 0.6, { sit: true }); }
    },
    home({ Wf, Dp, y, fb, seed }) {
      fb(Wf * 0.3, Dp * 0.55, 2.2, 0.9, y, 0.45, [0x8a8070, 0x4a5a6a, 0xc0b0a0][seed % 3]); fb(Wf * 0.3, Dp * 0.55 + 0.4, 2.2, 0.2, y + 0.45, 0.4, [0x8a8070, 0x4a5a6a, 0xc0b0a0][seed % 3], { solid: false });
      fb(Wf * 0.3, Dp * 0.3, 1.0, 0.6, y, 0.4, { tex: 'wood', color: 0xb08a68 });
      if (Wf > 6) { fb(Wf * 0.72, Dp * 0.5, 1.6, 2.0, y, 0.55, 0xf4f0ea); fb(Wf * 0.72, Dp * 0.5 + 1.0, 1.7, 0.12, y, 1.1, 0x6a5040); }
      fb(Wf / 2, Dp - 0.3, Wf - 0.6, 0.4, y, 2.0, { tex: 'wood', color: 0xd6c0a0 });
      fb(Wf * 0.85, Dp * 0.2, 0.4, 0.4, y, 1.5, 0xf4e6c8, { solid: false });
    },
    kitchen({ Wf, Dp, y, fb, seed }) {
      for (let i = 0; i < 2; i++) { fb(Wf * (0.3 + i * 0.4), Dp * 0.45, 1.6, 0.9, y, 0.9, 0xf3efe8); for (let k = 0; k < 3; k++) fb(Wf * (0.3 + i * 0.4) - 0.5 + k * 0.5, Dp * 0.45, 0.32, 0.32, y + 0.9, 0.22, [0xc03a2a, 0x2a4a6a, 0xe8b040, 0x3a3a3a][(seed + k) % 4], { solid: false }); }
      fb(Wf / 2, Dp - 0.3, Wf - 0.6, 0.4, y, 2.2, { tex: 'wood', color: 0xe6d6c0 });
      for (let k = 0; k < 3; k++) fb(Wf / 2, Dp - 0.55, Wf - 1.0, 0.1, y + 0.5 + k * 0.55, 0.18, GARMENT[(seed + k) % GARMENT.length], { solid: false });
    },
    elec({ Wf, Dp, y, fb }) {
      fb(Wf / 2, Dp - 0.25, Wf - 0.4, 0.3, y, 0.8, 0x2a2a2a);
      const n = Math.max(1, Math.floor(Wf / 2.2));
      for (let i = 0; i < n; i++) { const s = (i + 0.5) * Wf / n; fb(s, Dp - 0.2, 1.8, 0.06, y + 1.2, 1.05, { tex: 'emit', color: [0x4a7ab0, 0x2a5a8a, 0x6aa0c8][i % 3] }, { solid: false }); }
      for (let i = 0; i < 2; i++) { fb(Wf * (0.3 + i * 0.4), Dp * 0.45, 1.8, 0.9, y, 0.9, 0xf2f2f2); fb(Wf * (0.3 + i * 0.4), Dp * 0.45, 0.6, 0.05, y + 0.9, 0.4, { tex: 'emit', color: 0x88aacc }, { solid: false }); }
    },
    kid({ Wf, Dp, y, fb, seed }) {
      const cols = [0xe05050, 0xf0c040, 0x4a8ad0, 0x60b060, 0xf090b0];
      fb(Wf / 2, Dp - 0.3, Wf - 0.6, 0.4, y, 1.6, cols[seed % 5]);
      for (let i = 0; i < 3; i++) fb(Wf * (0.25 + i * 0.25), Dp * 0.5, 1.0, 0.7, y, 0.7, cols[(seed + i + 1) % 5]);
      fb(Wf * 0.5, Dp * 0.25, 1.4, 0.06, y + 1.2, 0.05, 0x9a9a9a, { solid: false }); fb(Wf * 0.5, Dp * 0.25, 1.3, 0.35, y + 0.6, 0.6, cols[(seed + 3) % 5]);
    },
    golf({ Wf, Dp, y, fb, fsign, seed }) {
      for (let i = 0; i < Math.max(1, Math.floor(Wf / 2.5)); i++) { const s = (i + 0.5) * 2.5; if (s > Wf - 0.5) break; fb(s, Dp - 0.4, 1.8, 0.4, y, 1.1, 0x2a2a2a); for (let k = 0; k < 6; k++) fb(s - 0.75 + k * 0.3, Dp - 0.4, 0.04, 0.04, y + 1.1, 0.35, 0xc8c8c8, { solid: false }); }
      for (let i = 0; i < 3; i++) fb(Wf * (0.25 + i * 0.25), Dp * 0.45, 0.35, 0.35, y, 0.95, GARMENT[(seed + i) % GARMENT.length]);
      fb(Wf / 2, Dp * 0.2, 1.6, 0.6, y + 0.55, 1.0, GARMENT[(seed + 4) % GARMENT.length]);
      void fsign;
    },
    sim({ Wf, Dp, y, H, fb, fsign }) { // 골프 시타실
      fb(Wf / 2, Dp - 0.2, Wf - 0.6, 0.1, y + 0.3, Math.min(3.2, H - 0.5), { tex: 'emit', color: 0x8fc890 }, { solid: false });
      fb(Wf / 2, Dp / 2, Wf - 0.4, Dp - 0.4, y, 0.04, { tex: 'grass', color: 0x6fa060 }, { solid: false });
      fb(Wf / 2, Dp * 0.3, 1.2, 1.2, y + 0.04, 0.03, 0x2a6a2a, { solid: false });
      fsign(['스크린 시타실', '골프 전문관'], Wf / 2, Dp - 0.3, y + 2.2, 2.4, 0.6, { bg: '#0f2a14', fg: '#bff0c0' });
    },
    sport({ Wf, Dp, y, fb, person, seed }) {
      fb(Wf / 2, Dp - 0.25, Wf - 0.4, 0.35, y, 2.2, 0x2e2e2e);
      for (let k = 0; k < 4; k++) fb(Wf / 2, Dp - 0.48, Wf - 0.8, 0.1, y + 0.3 + k * 0.45, 0.14, GARMENT[(seed + k * 3) % GARMENT.length], { solid: false });
      for (let i = 0; i < 2; i++) { fb(Wf * (0.3 + i * 0.4), Dp * 0.5, 1.5, 0.45, y + 0.55, 1.0, { tex: 'ssg_rack', color: GARMENT[(seed + i + 2) % GARMENT.length] }); fb(Wf * (0.3 + i * 0.4), Dp * 0.5, 1.7, 0.06, y + 1.55, 0.05, 0x9a9a9a, { solid: false }); }
      person(Wf * 0.5, Dp * 0.25, { shirt: 0xd0d0d0 });
    },
    wine({ Wf, Dp, y, fb }) {
      fb(Wf / 2, Dp - 0.3, Wf - 0.4, 0.45, y, 2.6, { tex: 'wood', color: 0x7a5038 });
      for (let k = 0; k < 6; k++) fb(Wf / 2, Dp - 0.55, Wf - 0.8, 0.06, y + 0.3 + k * 0.38, 0.12, 0x3a1a20, { solid: false });
      for (const s of [0.35, Wf - 0.35]) fb(s, Dp * 0.55, 0.5, Dp * 0.6, y, 2.2, { tex: 'wood', color: 0x7a5038 });
      fb(Wf / 2, Dp * 0.4, 2.0, 0.9, y, 0.95, { tex: 'wood', color: 0x5a3a28 });
      for (let k = 0; k < 5; k++) fb(Wf / 2 - 0.8 + k * 0.4, Dp * 0.4, 0.08, 0.08, y + 0.95, 0.32, 0x2a1418, { solid: false });
    },
    service({ Wf, Dp, y, fb }) { fb(Wf / 2, Dp * 0.35, Math.min(4, Wf - 1), 0.7, y, 1.0, 0xe9e1d2); fb(Wf / 2, Dp - 0.3, Wf - 0.6, 0.4, y, 2.2, 0xd8cdb8); },
    lounge({ Wf, Dp, y, fb, person }) {
      for (let i = 0; i < 3; i++) { fb(Wf * (0.25 + i * 0.25), Dp * 0.5, 1.8, 0.8, y, 0.45, 0x6a5444); fb(Wf * (0.25 + i * 0.25), Dp * 0.5 + 0.35, 1.8, 0.12, y + 0.45, 0.4, 0x6a5444, { solid: false }); }
      fb(Wf / 2, Dp * 0.25, 2.0, 0.7, y, 0.95, 0xe8dcc6); person(Wf * 0.5, Dp * 0.5, { sit: true });
    },
    popup({ Wf, Dp, y, fb, seed }) {
      fb(Wf / 2, Dp / 2, Wf - 0.4, Dp - 0.4, y, 0.15, 0xf6f1ea);
      for (let i = 0; i < 4; i++) fb(Wf * (0.2 + i * 0.2), Dp * 0.5, 0.9, 0.9, y + 0.15, 0.9, i % 2 ? 0xeee6da : 0x1d1d1d);
      for (let i = 0; i < 4; i++) fb(Wf * (0.2 + i * 0.2), Dp * 0.5, 0.3, 0.3, y + 1.05, 0.3, GARMENT[(seed + i) % GARMENT.length], { solid: false });
    },
    hoard({ Wf, Dp, y, H, fsign }) { fsign('매장 안내', Wf / 2, 0.02, y + 1.6, Math.min(Wf - 0.4, 5), 1.2, { bg: '#e9e1d2', fg: '#6b5434' }); void Dp; void H; },
    lingerie(a) { FIXTURES.fashion(a); },
    bag(a) { FIXTURES.lux(a); },
  };

  // generic band: split [a,b] along the band axis into the names list
  // side: 'N' band (v0..v1 strip along north wall, opens south) etc.
  function band(names, side, a, b, d0, d1, y, opts = {}) {
    if (!names.length) return;
    const n = names.length, step = (b - a) / n;
    names.forEach((nm, i) => {
      const s0 = a + i * step, s1 = a + (i + 1) * step;
      let [name, kind] = String(nm).split('#'); kind = kind || opts.kind;
      if (side === 'N') shop({ u0: s0, u1: s1, v0: d0, v1: d1, f: 'S', name, kind, y, back: opts.back ?? false, ...opts, kind });
      else if (side === 'S') shop({ u0: s0, u1: s1, v0: d0, v1: d1, f: 'N', name, kind, y, back: opts.back ?? false, ...opts, kind });
      else if (side === 'W') shop({ u0: d0, u1: d1, v0: s0, v1: s1, f: 'E', name, kind, y, back: opts.back ?? false, ...opts, kind });
      else shop({ u0: d0, u1: d1, v0: s0, v1: s1, f: 'W', name, kind, y, back: opts.back ?? false, ...opts, kind });
    });
  }
  // inner island block [u0,u1]x[v0,v1] split into a west-facing and an east-facing row
  function island(names, u0, u1, v0, v1, y, opts = {}) {
    const um = (u0 + u1) / 2, half = Math.ceil(names.length / 2);
    const west = names.slice(0, half), east = names.slice(half);
    const sideOpts = { ...opts, back: true };
    if (west.length) { const st = (v1 - v0) / west.length; west.forEach((nm, i) => { let [name, kind] = String(nm).split('#'); shop({ u0, u1: um, v0: v0 + i * st, v1: v0 + (i + 1) * st, f: 'W', name, y, ...sideOpts, kind: kind || opts.kind }); }); }
    if (east.length) { const st = (v1 - v0) / east.length; east.forEach((nm, i) => { let [name, kind] = String(nm).split('#'); shop({ u0: um, u1, v0: v0 + i * st, v1: v0 + (i + 1) * st, f: 'E', name, y, ...sideOpts, kind: kind || opts.kind }); }); }
  }

  // ------------------------------------------------------------ common per-floor furniture
  const COLS_U = [8.25, 24.1, 42.9, 58.75], COLS_V = [8.25, 20, 31.5, 50.5, 61, 76.5];
  function columns(id, y, h, skip = () => false) {
    const lux = id === '1F' || id === '2F' || id === '3F' || id === '1M';
    const cm = id === 'B2' ? 0xd9d6cf : { tex: 'marble', color: lux ? 0xf3ece0 : 0xf1ede6 };
    for (const u of COLS_U) for (const v of COLS_V) {
      if (skip(u, v) || (y >= 0 && u > 23 && u < 44 && v < 12) || (id==='2F' && u===42.9 && v===50.5)) continue;
      if (id === '1F') {
        const [x, z] = P(u, v), ch = v >= 58 ? 3.2 : h;
        K.cyl({ x, z, y, r: .6, h: ch, seg: 20, mat: 'ssg_marble' });
        K.cyl({ x, z, y, r: .63, h: .10, seg: 20, mat: 0xbbaa8c, solid: false });
        continue;
      }
      box(u, v, 0.9, 0.9, y, h, cm, { skip: ['top', 'bottom'] });
      if (id !== 'B2') { box(u, v, 0.98, 0.98, y, 0.14, lux ? 0xb9a77f : 0x8a8580, { solid: false, skip: ['bottom'] }); if (lux) box(u, v, 0.98, 0.98, y + Math.min(h, 4.6) - 0.5, 0.08, 0xb9a77f, { solid: false, skip: ['bottom'] }); }
      else for (const du of [-0.47, 0.47]) for (const dv of [-0.47, 0.47]) {
        box(u + du, v + dv, 0.16, 0.16, y + 0.08, 1.2, 0xd8b84b, { solid: false });
        for (let k = 0; k < 3; k++) box(u + du, v + dv, 0.17, 0.17, y + 0.2 + k * 0.35, 0.15, 0x292a28, { solid: false });
      }
    }
  }
  function downlight(u, v, y, r = 0.14) {
    const [x, z] = P(u, v);
    K.cyl({ x, y: y - 0.035, z, r: r + 0.035, h: 0.03, seg: 10, mat: 0x9c8b70, solid: false });
    const disc = Array.from({ length: 10 }, (_, i) => [x + Math.cos(i * PI / 5) * r, z + Math.sin(i * PI / 5) * r]);
    K.hpoly({ tex: 'emit', color: 0xfff0d9 }, disc, y - 0.04, false);
  }
  function lights(y, skipRects = [], step = 6) {
    for (let u = 3.5; u < UW - 1; u += step) for (let v = 3.5; v < VD - 1; v += step) {
      if ((y > 0 && u > 23 && u < 44 && v < 12) || inR(u, v, ATR, 0.8) || skipRects.some(r => inR(u, v, r, 0.6))) continue;
      downlight(u, v, y);
    }
  }
  function aisleBorders(y, mezz = false) {
    const bands = mezz ? [[9, 59, 59, 59.2], [9, 75.8, 59, 76], [24.5, 59, 24.7, 76], [42.3, 59, 42.5, 76]]
      : [[9, 11.8, 58, 12], [9, 31.7, 58, 31.9], [9, 50.1, 58, 50.3], [11.8, 12, 12, 50.1], [54.8, 12, 55, 50.1]];
    for (const b of bands) hq(...b, y + 0.018, 0x8b7862);
  }
  function coffer(u0, v0, u1, v1, ceilingY) {
    // Shallow gypsum perimeter with a warm recessed cove, no suspended tile grid.
    const lip = 0.25, low = ceilingY - 0.22;
    boxR(u0, v0, u1, v0 + lip, low, 0.18, CEIL, { solid: false });
    boxR(u0, v1 - lip, u1, v1, low, 0.18, CEIL, { solid: false });
    boxR(u0, v0 + lip, u0 + lip, v1 - lip, low, 0.18, CEIL, { solid: false });
    boxR(u1 - lip, v0 + lip, u1, v1 - lip, low, 0.18, CEIL, { solid: false });
    for (const [a, b, c, d] of [[u0 + lip, v0 + lip, u1 - lip, v0 + lip + 0.07], [u0 + lip, v1 - lip - 0.07, u1 - lip, v1 - lip]]) hq(a, b, c, d, low + 0.12, { tex: 'emit', color: 0xffe4ba }, false);
  }
  function restrooms(id, y, H) {
    // block behind the elevator shafts, entrance from the south aisle
    const u0 = 27.6, u1 = 39.4, v0 = 67.3, v1 = 72.5;
    wall(u0, v0, u0, v1, y, y + H, { mat: 0xe9e4da, thick: 0.2 }); wall(u1, v0, u1, v1, y, y + H, { mat: 0xe9e4da, thick: 0.2 });
    wall(u0, v1, u1, v1, y, y + H, { mat: 0xe9e4da, thick: 0.2, openings: [{ at: 2.5, w: 1.6, y0: y, y1: y + 2.3 }, { at: 9.3, w: 1.6, y0: y, y1: y + 2.3 }, { at: 5.9, w: 1.2, y0: y, y1: y + 2.2 }] });
    wall(33.5, v0, 33.5, v1, y, y + H, { mat: 0xe9e4da, thick: 0.15 });
    sign('화장실 (여)', 30.1, v1 + 0.12, y + 2.7, 'S', 1.6, 0.36, { bg: '#7a2a3a', fg: '#fff' });
    sign('화장실 (남)', 36.9, v1 + 0.12, y + 2.7, 'S', 1.6, 0.36, { bg: '#2a3a6a', fg: '#fff' });
    sign('수유실 · 장애인 화장실', 33.5, v1 + 0.12, y + 2.7, 'S', 1.6, 0.3, { bg: '#3a3a3a', fg: '#fff' });
    for (let i = 0; i < 3; i++) { box(28.6 + i * 1.4, 68.1, 1.0, 0.6, y, 0.85, 0xf4f4f2); box(34.6 + i * 1.4, 68.1, 1.0, 0.6, y, 0.85, 0xf4f4f2); }
    hq(u0 + 0.1, v0 + 0.1, u1 - 0.1, v1 - 0.1, y + 0.01, { tex: 'tile', color: 0xd8dde2 });
    zone('화장실 · 수유실', id, `고객 화장실 (여 · 남 · 장애인) · ${id}`, [u0, v0, u1, v1], y, y + H, 2);
    // back-of-house wall closing the rest of the gap between shafts and the restroom block
    wall(u0, 64.8, u0, v0, y, y + H, { mat: 0xe9e4da, thick: 0.2 }); wall(u1, 64.8, u1, v0, y, y + H, { mat: 0xe9e4da, thick: 0.2 });
    wall(u0, 64.8, 29.25, 64.8, y, y + H, { mat: 0xc9c2b4, thick: 0.15 }); wall(37.75, 64.8, u1, 64.8, y, y + H, { mat: 0xc9c2b4, thick: 0.15 });
    void id;
  }
  function elevatorHall(id, y, H) {
    // lobby facing north: directory board + bench + floor label
    if (id !== 'B1') {
      sign(DIRECTORY, 25.6, 63.6, y + 1.55, 'E', 1.8, 2.7, { bg: '#2d241c', fg: '#f3e6c8', bold: false, pxPerM: 130, align: 'left' });
      box(25.3, 63.6, 0.3, 2.0, y, 0.25, 0x2d241c, { solid: false });
    }
    const hallSign = { bg: '#3c3129', fg: '#e5c389', font: 'Georgia, "Noto Serif KR", serif', bold: false };
    sign(`${id} · 신세계 강남점`, 28.45, 64.66, y + Math.min(2.4, H - 0.6), 'N', 1.5, 0.35, hallSign);
    sign('엘리베이터', 38.55, 64.66, y + Math.min(2.4, H - 0.6), 'N', 1.5, 0.35, hallSign);
    for (const u of [28.5, 38.5]) box(u, 58.5, 2.0, 0.6, y, 0.45, 0x8a6a4a);
    zone('엘리베이터 홀', id, '고객 엘리베이터 1~3호기 · 층별 안내', [24.4, 57.6, 42.6, 64.8], y, y + H, 2);
    if (id !== 'B2') zone('에스컬레이터', id, `중앙 아트리움 에스컬레이터 · ${id}`, ATR, y, y + H, 2);
  }
  function crowdAisles(y, n, seed, extra = [], vMin = 0) {
    let polys = [rect(8.6, 8.6, 22.6, 12.0), rect(44.4, 8.6, 58.4, 12.0), rect(8.6, 72.7, 58.4, 76.2), rect(8.6, 12.4, 12.0, 72.4), rect(54.9, 12.4, 58.4, 72.4), rect(12.4, 31.7, 54.6, 34.8), rect(12.4, 47.2, 54.6, 50.3), rect(24.3, 35.2, 27.4, 46.8), rect(39.6, 35.2, 42.7, 46.8), rect(24.4, 50.8, 42.6, 57.5), ...extra];
    if (vMin > 0) polys = polys.filter(p => p.every(q => { const dx = q[0] - OX, dz = q[1] - OZ; return dx * SA + dz * CA >= vMin - 0.01; }));
    polys.forEach((p, i) => K.crowd(p, y, Math.max(1, Math.round(n * (i < 4 ? 1.2 : 0.8) / 4)), { seed: seed * 31 + i }));
  }

  // ------------------------------------------------------------ standard upper floor
  function stdFloor(id, def) {
    const y = LV[id], H = clearH(id);
    const fl = id, sub = def.sub, up = UPPER.has(id), V0 = up ? VS : 0;
    const S = (o = {}) => ({ floor: fl, H: MAIN.indexOf(id) >= MAIN.indexOf('4F') ? 3.2 : H, sub: `${def.cat} · 신세계백화점 강남점 ${fl}${up ? ' (신관)' : ''}`, ...o });
    zone('신세계백화점 강남점', fl, up ? `${sub} · 신관` : sub, [0, V0, UW, VD], y, y + H + thick(nextOf(id)), 1);
    if (!up) {
      const half = Math.ceil(def.N.length / 2);
      band(def.N.slice(0, half), 'N', 0.25, 22.7, 2.05, 8.25, y, S({ kind: def.kind }));
      band(def.N.slice(half), 'N', 44.3, 66.75, 2.05, 8.25, y, S({ kind: def.kind }));
    }
    band(def.S, 'S', 5.8, 66.75, 76.5, 84.45, y, S({ kind: def.kind }));
    band(def.W, 'W', up ? VS + 0.25 : 8.25, 61.8, 0.25, 8.25, y, S({ kind: def.kind }));
    band(def.E, 'E', up ? VS + 0.25 : 24.2, 76.5, 58.75, 66.75, y, S({ kind: def.kind }));
    const blocks = up ? [[35, 47], [50.5, 72.5]] : [[12.25, 31.5], [35, 47], [50.5, 72.5]];
    (def.IW || []).forEach((names, i) => blocks[i] && island(names, 12.25, 24.1, blocks[i][0], blocks[i][1], y, S({ kind: def.kind })));
    (def.IE || []).forEach((names, i) => blocks[i] && island(names, 42.9, 54.75, blocks[i][0], blocks[i][1], y, S({ kind: def.kind })));
    if (def.C && !up) shop({ u0: 27.6, u1: 39.4, v0: 14, v1: 29, f: 'S', name: def.C, kind: def.Ckind || 'popup', y, ...S(), sides: false, back: false });
    columns(id, y, H, up ? (u, v) => v < VS : undefined);
    furnish(fl, () => {
      if (MAIN.indexOf(id) >= MAIN.indexOf('4F')) upperRetailCeiling(id, y);
      else lights(y + H - 0.02, up ? [[0, 0, UW, VS]] : []);
    });
    restrooms(id, y, H); elevatorHall(id, y, H);
    // Labels and people are loaded with this floor's shop stock.
    furnish(fl, () => {
    if (!up) sign(`${fl}  ${def.short}`, 25.4, 33, y + 2.85, 'N', 2.4, 0.5, { bg: '#2d241c', fg: '#f3e6c8', twoSided: true });
    else sign(`${fl}  ${def.short}`, 25.4, 48.4, y + 2.85, 'S', 2.4, 0.5, { bg: '#2d241c', fg: '#f3e6c8', twoSided: true });
    crowdAisles(y, def.people ?? 16, LV[id] * 7 + 3, [], V0);
    });
    if (up) windowAisle(id, y, H, def.view);
    if (def.extra) def.extra(y, H);
  }
  // Retain plain circulation along the upper volume, without an invented observation attraction.
  function windowAisle(id, y, H) {
    zone('신관 통로', id, '매장 연결 통로', [8.25, VS, 58.75, ATR[1]], y, y + H, 2);
  }

  // ================================================================= B2 주차장
  {
    const y = LV.B2, H = clearH('B2');
    zone('신세계백화점 강남점 주차장', 'B2', '지하주차장 · 센트럴시티·JW 공용 지하주차장과 연결 · 개점 당시 3,650대', [0, 0, UW, VD], y, LV.B1, 1);
    columns('B2', y, H);
    boxR(ATR[0], ATR[1], ATR[2], ATR[3], y, H, 0xbdb8ae); // 기계실 (under the escalator stack)
    sign(['기계실', '관계자 외 출입금지'], 33.5, ATR[1] - 0.02, y + 2.2, 'N', 2.6, 0.7, { bg: '#d8d2c6', fg: '#333' });
    const obstacles = [[ATR[0] - 0.5, ATR[1] - 0.5, ATR[2] + 0.5, ATR[3] + 0.5], [27, 62, 40, 73], [24, 55, 43, 65], [58, 51.1, UW, 57.9], ...CORES.map(c => [c.uL - 0.5, c.v0 - 0.5, c.uR + 0.5, c.v1 + 0.5])];
    const colHit = (u, v) => COLS_U.some(cu => COLS_V.some(cv => Math.abs(cu - u) < 1.6 && Math.abs(cv - v) < 3));
    const rows = [[3, 'N'], [16, 'S'], [21.5, 'N'], [37, 'S'], [42.5, 'N'], [57, 'S'], [80, 'S']];
    for (const [vc, dir] of rows) {
      for (let u = 2; u < UW - 2; u += 2.6) {
        if (obstacles.some(r => inR(u, vc, r, 2.4)) || colHit(u, vc)) continue;
        // stall lines
        const lv0 = vc - 2.6, lv1 = vc + 2.6;
        hq(u - 1.32, lv0, u - 1.24, lv1, y + 0.015, 0xf2f2f2);
        if (rnd() < 0.72) { const [x, z] = P(u, vc); K.vehicle({ x, y, z, rotY: RA + (dir === 'N' ? PI : 0), kind: rnd() < 0.12 ? 'van' : 'car' }); }
      }
    }
    for (const v of [9.5, 29, 49.5, 69.5]) K.floorText('백화점 입구 →', { x: P(33, v)[0], y: y + 0.02, z: P(33, v)[1], w: 6, h: 1.2, rotY: RA - PI / 2, fg: '#f2f2f2', bg: '#4d5f54' });
    sign(['B2 주차장', '신세계백화점 강남점'], 33.5, 64.78, y + 2.7, 'N', 2.4, 0.7, { bg: '#575d52', fg: '#f5eee0' });
    sign(['엘리베이터 · 백화점 입구'], 33.5, 58.2, y + 3.2, 'N', 3.2, 0.5, { bg: '#575d52', fg: '#f5eee0', twoSided: true });
    // Exposed concrete beams and narrow strip luminaires, not retail ceiling panels.
    for (const v of [8.25, 20, 31.5, 50.5, 61, 76.5]) box(UW / 2, v, UW - 0.5, 0.45, y + H - 0.5, 0.5, { tex: 'concrete', color: 0xa6a69f }, { solid: false });
    for (const u of [10, 26, 42, 56]) for (const v of [8.8, 28.7, 49.1, 69.4]) {
      box(u, v, 0.17, 2.9, y + H - 0.62, 0.08, 0x565952, { solid: false });
      lightPanel(u, v, y + H - 0.63, 0.1, 2.75, 0xf4efe0);
    }
    sign('지상주차장 출구 →', 62, 54.5, y + 2.6, 'W', 2.8, 0.45, { bg: '#575d52', fg: '#f5eee0' });
    K.crowd(rect(24, 58.5, 43, 63.5), y, 4, { seed: 11 });
    // parking sections (map detail) + lift lobby + vehicle gate
    for (const [nm, r] of [['A구역 (신반포로 쪽)', [0, 0, 33.5, 31.5]], ['B구역 (신반포로 · 경부선 쪽)', [33.5, 0, UW, 31.5]], ['C구역 (센트럴시티 쪽)', [0, 31.5, 24, VD]], ['D구역 (JW 메리어트 쪽)', [43, 31.5, UW, VD]]]) {
      zone(`B2 주차장 ${nm.split(' ')[0]}`, 'B2', `신세계백화점 강남점 지하주차장 ${nm}`, r, y, LV.B1, 2);
      const [cu, cv] = [(r[0] + r[2]) / 2, (r[1] + r[3]) / 2];
      box(cu, cv, 0.95, 0.95, y + H - 1.3, 0.9, 0x575d52, { solid: false });
      for (const f of ['N', 'S', 'E', 'W']) { const o = { N: [0, -0.49], S: [0, 0.49], E: [0.49, 0], W: [-0.49, 0] }[f]; sign(nm.split(' ')[0].replace('구역', ''), cu + o[0], cv + o[1], y + H - 0.85, f, 0.8, 0.8, { bg: '#575d52', fg: '#fff' }); }
    }
    zone('엘리베이터 홀 · 백화점 입구', 'B2', '고객 엘리베이터 1~3호기 → B1 식품관 · 1F', [24, 57.6, 43, 64.8], y, LV.B1, 3);
  }

  // ================================================================= B1: 2026 ssg_food photographs 01–19
  {
    const y = LV.B1, H = clearH('B1'), fl = 'B1';
    const BRASS = 0xa78b51, HONEY = 'ssg_honey', CREAM = 0xefe5cf;
    const glow = { tex: 'emit', color: 0xffe6b7 };
    const serif = { font: 'Georgia, "Noto Serif KR", serif', bold: false, bg: null, fg: '#e5c389' };
    const cyl = (u, v, yy, r, h, mat, solid = false, seg = 12) => {
      const [x, z] = P(u, v); K.cyl({ x, z, y: yy, r, h, mat, solid, seg });
    };
    const globe = (u, v, yy, r = 0.15) => {
      const [x, z] = P(u, v); K.dome({ x, z, y: yy, rx: r, ry: r, rz: r, hemi: false, seg: 10, rings: 6, mat: { tex: 'emit', color: 0xfff4dd } });
    };
    // Local UVs keep parquet and 65 cm checker squares aligned to the store frame.
    function finish(r, yy, mat, repeat = 1.3) {
      const [u0, v0, u1, v1] = r, pp = rect(...r).map(q => [q[0], yy, q[1]]);
      const [ru, rv] = Array.isArray(repeat) ? repeat : [repeat, repeat];
      K.quad(mat, pp, [0, 1, 0], [[0, 0], [(u1-u0)/ru, 0], [(u1-u0)/ru, (v1-v0)/rv], [0, (v1-v0)/rv]]);
    }
    K.texture('ssg_checker', 512, 512, (g, w, h) => {
      for (let a = 0; a < 2; a++) for (let b = 0; b < 2; b++) {
        const dark = (a + b) % 2 === 0, ox = a*w/2, oy = b*h/2;
        g.save(); g.beginPath(); g.rect(ox, oy, w/2, h/2); g.clip();
        g.fillStyle = dark ? '#242326' : '#f2f0ea'; g.fillRect(ox,oy,w/2,h/2);
        for (let k = 0; k < 10; k++) {
          g.strokeStyle = dark ? (k%3 ? '#585356' : '#a39b93') : (k%3 ? '#dedbd4' : '#bfbcb5');
          g.lineWidth = k%3 ? 0.8 : 1.7;
          g.beginPath(); g.moveTo(ox-30+k*44,oy);
          g.bezierCurveTo(ox+80+k*31,oy+90,ox-80+k*24,oy+160,ox+70+k*30,oy+h/2); g.stroke();
        }
        g.restore();
      }
    }, [1.3, 1.3]);
    K.material('ssg_checker_gloss', new K.THREE.MeshPhongMaterial({ map: K.T.surface('ssg_checker').tex, color: 0xffffff, shininess: 75, specular: 0x8b8174 }));
    K.texture('ssg_honey', 256, 512, (g,w,h) => {
      g.fillStyle='#c98a3e'; g.fillRect(0,0,w,h);
      for(let i=0;i<80;i++) {
        const xx=i*3.4; g.strokeStyle=i%4?'rgba(112,55,20,0.16)':'rgba(255,203,112,0.22)'; g.lineWidth=0.8;
        g.beginPath(); g.moveTo(xx,0); g.bezierCurveTo(xx+12,160,xx-10,330,xx+4,h); g.stroke();
      }
      g.fillStyle='#a76a2d';g.fillRect(0,0,2,h);
    },[1.5,3]);
    for (const [key, dark] of [['ssg_parquet',true],['ssg_wood_parquet',false]]) K.texture(key,512,512,(g,w,h)=>{
      g.fillStyle=dark?'#38373b':'#b58d60';g.fillRect(0,0,w,h);
      for(let i=0;i<4;i++)for(let j=0;j<4;j++) {
        g.save();g.translate(i*128+64,j*128+64);if((i+j)%2)g.rotate(PI/2);
        for(let k=0;k<4;k++) {
          const yy=-63+k*32;
          g.fillStyle=dark?['#474348','#5b5452','#38383c','#6e655a'][(i+j+k)%4]:['#c6a477','#d5b78b','#b08d65','#dec199'][(i+j+k)%4];
          g.fillRect(-63,yy,125,30);
          for(let n=0;n<4;n++) {g.strokeStyle=dark?'rgba(238,224,199,0.28)':'rgba(102,70,39,0.2)';g.lineWidth=1;g.beginPath();g.moveTo(-62,yy+4+n*6);g.bezierCurveTo(-20,yy+16+n*2,15,yy-3+n*7,62,yy+7+n*5);g.stroke();}
        }
        g.restore();
        if(dark){g.fillStyle=(i+j)%2?'#d5bc78':'#e6dfc9';g.fillRect(i*128-5,j*128-5,10,10);}
      }
    },[1.4,1.4]);
    K.texture('ssg_persian',512,768,(g,w,h)=>{
      g.fillStyle='#9c3f31';g.fillRect(0,0,w,h);
      for(const [pad,col,lw] of [[10,'#dbc398',7],[25,'#344854',16],[43,'#dab77d',6],[55,'#5d302c',5]]){g.strokeStyle=col;g.lineWidth=lw;g.strokeRect(pad,pad,w-pad*2,h-pad*2);}
      function flower(x,z,r,col){g.fillStyle=col;for(let i=0;i<8;i++){g.beginPath();g.ellipse(x+Math.cos(i*PI/4)*r,z+Math.sin(i*PI/4)*r,r*.6,r*.32,i*PI/4,0,PI*2);g.fill();}}
      for(let xx=80;xx<w-70;xx+=55)for(let zz=85;zz<h-70;zz+=68)flower(xx,zz,10,(xx+zz)%3?'#d1ab77':'#59716c');
      g.fillStyle='#d6b884';g.beginPath();g.moveTo(w/2,180);g.lineTo(w-95,h/2);g.lineTo(w/2,h-180);g.lineTo(95,h/2);g.closePath();g.fill();flower(w/2,h/2,46,'#354b54');
    },[3,4.5]);
    K.texture('ssg_uplight',128,256,(g,w,h)=>{
      g.clearRect(0,0,w,h);const gr=g.createRadialGradient(w/2,h*.95,2,w/2,h*.9,h*.85);
      gr.addColorStop(0,'rgba(255,239,132,0.96)');gr.addColorStop(.23,'rgba(255,196,64,0.50)');gr.addColorStop(1,'rgba(255,176,45,0)');g.fillStyle=gr;g.fillRect(0,0,w,h);
    },[1,1],{transparent:true});
    K.texture('ssg_cream_brick',256,128,(g,w,h)=>{
      g.fillStyle='#e9ddc3';g.fillRect(0,0,w,h);g.strokeStyle='#c2b49c';g.lineWidth=2;
      for(let j=0;j<4;j++){const yy=j*32;g.beginPath();g.moveTo(0,yy);g.lineTo(w,yy);g.stroke();for(let i=-1;i<4;i++)g.strokeRect(i*85+(j%2)*42,yy,85,32);}
    },[.45,.28]);
    // Round 7: marble inlays and seasonal woven carpet sampled from the close photographs.
    K.texture('ssg_diamond_marble',512,512,(g,w,h)=>{
      g.fillStyle='#f0eee7';g.fillRect(0,0,w,h);
      for(let i=0;i<26;i++){g.strokeStyle=i%4?'rgba(155,151,140,.20)':'rgba(120,119,113,.24)';g.lineWidth=1;g.beginPath();g.moveTo(i*25-90,0);g.bezierCurveTo(i*25+70,150,i*25-60,380,i*25+20,h);g.stroke();}
      g.strokeStyle='#b7b2a7';g.lineWidth=1;g.strokeRect(0,0,w,h);
      for(const [x,z] of [[0,0],[w,0],[0,h],[w,h]]){g.fillStyle='#242527';g.beginPath();g.moveTo(x-42,z);g.lineTo(x,z-42);g.lineTo(x+42,z);g.lineTo(x,z+42);g.closePath();g.fill();}
    },[.65,.65]);
    K.material('ssg_diamond_gloss',new K.THREE.MeshPhongMaterial({map:K.T.surface('ssg_diamond_marble').tex,shininess:90,specular:0xa8a199}));
    K.texture('ssg_tartan',512,512,(g,w,h)=>{
      g.fillStyle='#ad162d';g.fillRect(0,0,w,h);
      for(let i=0;i<4;i++){const x=i*128;g.fillStyle='rgba(226,88,70,.55)';g.fillRect(x+20,0,25,h);g.fillRect(0,x+20,w,25);g.fillStyle='rgba(92,11,25,.5)';g.fillRect(x+65,0,40,h);g.fillRect(0,x+65,w,40);g.fillStyle='#daaf66';g.fillRect(x+8,0,2,h);g.fillRect(0,x+8,w,2);}
      for(let i=0;i<w;i+=4){g.fillStyle='rgba(255,192,145,.08)';g.fillRect(i,0,1,h);g.fillRect(0,i,w,1);}
    },[2.2,2.2]);
    K.texture('ssg_holiday_brick',256,128,(g,w,h)=>{
      g.fillStyle='#8a312e';g.fillRect(0,0,w,h);g.strokeStyle='#c49578';g.lineWidth=2;
      for(let j=0;j<4;j++)for(let i=-1;i<5;i++){const x=i*64+(j%2)*32,z=j*32;g.fillStyle=['#83342e','#943a32','#a4493c','#71302b'][(i+j+8)%4];g.fillRect(x+2,z+2,60,28);g.strokeRect(x,z,64,32);}
    },[.64,.32]);
    function christmas(u,v,white=false){
      const[x,z]=P(u,v);K.tree(x,z,{y:y+.12,h:3,kind:'pine'});
      cyl(u,v,y,.65,.08,white?0xddd4bc:0x423c2d,false,24);
      for(let i=0;i<64;i++){
        const yy=.5+(i%11)*.20,r=.78*(1-yy/3),aa=i*2.399,uu=u+Math.cos(aa)*r,vv=v+Math.sin(aa)*r;
        const[xx,zz]=P(uu,vv);K.dome({x:xx,z:zz,y:y+yy,rx:.055,ry:.065,rz:.055,hemi:false,seg:8,rings:4,mat:white?(i%3?0xe4d7ba:0xadada5):(i%3?0xad1d2e:0xc4a460)});
        if(i%2===0)globe(uu,vv,y+yy+.05,.018);
      }
      for(let i=0;i<7;i++){const aa=i*PI*2/7;box(u+Math.cos(aa)*.5,v+Math.sin(aa)*.5,.24,.23,y+.08,.18+(i%3)*.08,white?0xe0d9c6:0x8c3f32,{solid:false});}
    }
    // Thin 3D ribbons follow the actual groin/edge curves instead of a flat tile ceiling.
    function underside(mat, pp) {
      const a=pp[0],b=pp[1],c=pp[2],ab=b.map((n,i)=>n-a[i]),ac=c.map((n,i)=>n-a[i]);
      let nn=[ab[1]*ac[2]-ab[2]*ac[1],ab[2]*ac[0]-ab[0]*ac[2],ab[0]*ac[1]-ab[1]*ac[0]];
      if(nn[1]>0)nn=nn.map(n=>-n);
      const length=Math.hypot(...nn)||1;K.quad(mat,pp,nn.map(n=>n/length));
    }
    function ribbon(path, width, mat, offset=0) {
      for(let i=0;i<path.length-1;i++) {
        const a=path[i],b=path[i+1],du=b[0]-a[0],dv=b[2]-a[2],ll=Math.hypot(du,dv)||1;
        const nu=-dv/ll,nv=du/ll;
        const q=(p,s)=>{const [x,z]=P(p[0]+nu*s,p[2]+nv*s);return[x,p[1],z];};
        underside(mat,[q(a,offset-width/2),q(b,offset-width/2),q(b,offset+width/2),q(a,offset+width/2)]);
      }
    }
    function chandelier(u,v,ceiling) {
      const yy=ceiling-.9;
      cyl(u,v,yy,.028,.9,0x39332b,false,8);
      const [x,z]=P(u,v);K.cyl({x,z,y:yy,r:.46,h:.045,seg:16,caps:false,mat:0x39332b,solid:false});
      for(let i=0;i<6;i++){const a=i*PI/3,uu=u+Math.cos(a)*.46,vv=v+Math.sin(a)*.46; cyl(uu,vv,yy-.18,.018,.4,BRASS,false,6);globe(uu,vv,yy+(i%2?.22:-.19),.16);}
      globe(u,v,yy-.34,.18);
    }
    K.texture('ssg_fieldstone',512,256,(g,w,h)=>{
      g.fillStyle='#8a8a8a';g.fillRect(0,0,w,h);
      const sr=K.rand(1306);
      for(let row=-1;row<5;row++)for(let col=-1;col<8;col++){
        const xx=col*78+(row%2)*39,zz=row*64;
        g.fillStyle=['#4a4a4a','#3d4040','#535451','#454949'][(col+row+20)%4];
        g.beginPath();g.moveTo(xx+4,zz+12+sr()*8);g.lineTo(xx+55+sr()*16,zz+3);g.lineTo(xx+75,zz+39+sr()*9);g.lineTo(xx+43+sr()*12,zz+61);g.lineTo(xx+3,zz+53);g.closePath();g.fill();
      }
    },[1.2,.6]);
    function vault(u0,v0,u1,v1,withLamp=true) {
      const n=12,cu=(u0+u1)/2,cv=(v0+v1)/2,hu=(u1-u0)/2,hv=(v1-v0)/2;
      const height=(a,b)=>y+3.5+1.35*Math.sqrt(Math.max(0,1-Math.min(a*a,b*b)));
      const q=(a,b)=>{const [x,z]=P(cu+a*hu,cv+b*hv);return[x,height(a,b),z];};
      for(let i=0;i<n;i++)for(let j=0;j<n;j++){
        const a=-1+i*2/n,b=-1+j*2/n;
        underside(CREAM,[q(a,b),q(a+2/n,b),q(a+2/n,b+2/n),q(a,b+2/n)]);
      }
      const paths=[];
      for(const [su,sv] of [[-1,-1],[-1,1],[1,-1],[1,1]])paths.push(Array.from({length:17},(_,i)=>{const t=1-i/16;return[cu+su*t*hu,height(t,t)-.06,cv+sv*t*hv];}));
      for(const edge of ['n','s','w','e'])paths.push(Array.from({length:25},(_,i)=>{const t=-1+i/12,a=edge==='w'?-1:edge==='e'?1:t,b=edge==='n'?-1:edge==='s'?1:t;return[cu+a*hu,height(a,b)-.055,cv+b*hv];}));
      for(const pp of paths){ribbon(pp,.24,0xcbbd9f);ribbon(pp.map(q=>[q[0],q[1]-.025,q[2]]),.13,0xf3e9d4);for(const off of [-.17,.17])ribbon(pp.map(q=>[q[0],q[1]+.018,q[2]]),.035,glow,off);}
      if(withLamp)chandelier(cu,cv,y+4.78);
      for(const [a,b] of [[-.5,-.2],[.4,-.6],[-.35,.55],[.5,.3]])downlight(cu+a*hu,cv+b*hv,height(a,b)-.04,.045);
    }
    function pillar(u,v) {
      box(u,v,.58,.58,y,3.45,'ssg_cream_brick');
      for(const yy of [.08,3.16,3.35])box(u,v,.7,.7,y+yy,.07,yy===3.16?0x453a2a:BRASS,{solid:false});
    }
    // The plaster above each perimeter arch joins the vault to the slab, so no roof floats.
    function vaultFascia(u0,v0,u1,v1,sides=['n','e','s','w']) {
      const edges={n:[[u0,v0],[u1,v0]],e:[[u1,v0],[u1,v1]],s:[[u1,v1],[u0,v1]],w:[[u0,v1],[u0,v0]]};
      for(const edge of sides){
        const[a,b]=edges[edge];
        const du=b[0]-a[0],dv=b[1]-a[1],len=Math.hypot(du,dv),nx=-dv/len,nz=du/len;
        for(let i=0;i<24;i++){
          const t0=i/24,t1=(i+1)/24,low=t=>y+3.45+1.35*Math.sqrt(Math.max(0,1-(2*t-1)**2));
          const p=(t,yy)=>{const[x,z]=P(a[0]+du*t,a[1]+dv*t);return[x,yy,z];};
          const points=[p(t0,low(t0)),p(t1,low(t1)),p(t1,y+5),p(t0,y+5)],n=[nx*CA+nz*SA,0,-nx*SA+nz*CA];
          K.quad(CREAM,points,n);K.quad(CREAM,points,n.map(q=>-q));
          const line=[[a[0]+du*t0,low(t0)-.025,a[1]+dv*t0],[a[0]+du*t1,low(t1)-.025,a[1]+dv*t1]];
          ribbon(line,.06,glow);
        }
      }
    }
    const oct=(u,v,w,d,c=.24)=>[[u-w/2+c,v-d/2],[u+w/2-c,v-d/2],[u+w/2,v-d/2+c],[u+w/2,v+d/2-c],[u+w/2-c,v+d/2],[u-w/2+c,v+d/2],[u-w/2,v+d/2-c],[u-w/2,v-d/2+c]];
    function vitrine(u,v,w=2.4,d=1.2,seed=0,name='',face='N') {
      const at=(s,t)=>face==='E'?[u-t,v+s]:face==='S'?[u-s,v-t]:[u+s,v+t];
      const bb=(s,t,ww,dd,yy,hh,mat)=>{const[uu,vv]=at(s,t);box(uu,vv,face==='E'?dd:ww,face==='E'?ww:dd,yy,hh,mat,{solid:false});};
      const shape=(ww,dd)=>oct(0,0,ww,dd).map(q=>P(...at(...q)));
      K.prism(shape(w,d),y,y+.69,{mat:0x63422a});
      K.prism(shape(w+.12,d+.12),y+.69,y+.79,{mat:'ssg_marble',solid:false});
      K.prism(shape(w-.04,d-.04),y+.8,y+1.13,{mat:'glass',solid:false});
      for(const yy of [.08,.66,1.13])K.prism(shape(w+.02,d+.02),y+yy,y+yy+.025,{mat:BRASS,solid:false,top:false,bottom:false});
      for(const [s,t] of oct(0,0,w-.04,d-.04))bb(s,t,.022,.022,y+.79,.36,BRASS);
      bb(0,.05,w-.3,d*.5,y+.95,.016,'glass');
      for(const t of [-d*.2,d*.3])bb(0,t,w-.3,.02,y+.95,.02,BRASS);
      bb(0,d*.32,w-.32,.035,y+1.12,.015,{tex:'emit',color:0xfff2d6});
      const productRnd=K.rand(1306+seed+Math.round(u*31+v*17));
      for(let i=0;i<Math.floor(w/.24);i++)for(let j=0;j<2;j++){
        const s=-w/2+.2+i*.24,t=(j?1:-1)*d*.22;
        bb(s,t,.20,.22,y+.80,.025,0xe8dec7);
        bb(s,t,.16,.17,y+.83,.06+productRnd()*.08,[0xd7a05b,0xe4c58b,0x7e452c,0xf0dec0,0xa4bb76][(i+j+seed)%5]);
        if(i%3===0){const[uu,vv]=at(s,t-d*.16);sign('₩',uu,vv,y+.94,face,.08,.07,{bg:'#fffdf4',fg:'#4a3b2c',bold:false});}
      }
      for(let i=0;i<Math.floor((w-.4)/.3);i++){
        const s=-w/2+.28+i*.3;bb(s,.05,.24,.22,y+.97,.06+productRnd()*.08,[0xf1d3aa,0xb58253,0x784e39,0xc5b17d][i%4]);
        if(i%3===1){const[uu,vv]=at(s,-.11);sign('₩',uu,vv,y+1.08,face,.08,.06,{bg:'#fffdf4',fg:'#4a3b2c',bold:false});}
      }
      for(let i=0;i<Math.floor(w/.18);i++)bb(-w/2+.15+i*.18,-d/2-.012,.035,.018,y+.16,.43,0x99754b);
      if(name){const[uu,vv]=at(0,-d/2-.03);sign(name,uu,vv,y+.48,face,Math.min(w-.3,2.8),.22,{bg:null,fg:'#e6d5ad',bold:false});}
      const staff=Math.max(1,Math.floor(w/2.4));
      for(let i=0;i<staff;i++){
        const s=(i-(staff-1)/2)*1.7,t=d/2+.5,[uu,vv]=at(s,t),[x,z]=P(uu,vv);
        K.person(x,y,z,{shirt:0xf1eee5,pants:0x4b4945,h:1.65,rotY:FACE[face]});
        cyl(uu,vv,y+1.63,.12,.12,0xfffdf5);bb(s,t-.13,.3,.045,y+.48,.48,0xdfd8c6);
      }
    }
    function queue(u,v,w=3.6,d=3.5) {
      for(const du of [-w/2,w/2])for(const dv of [-d/2,0,d/2]){cyl(u+du,v+dv,y,.14,.035,0x262322);cyl(u+du,v+dv,y,.025,.91,0x242222);}
      for(const du of [-w/2,w/2])box(u+du,v,.025,d,y+.83,.065,0xcfc4ab,{solid:false});
      box(u,v+d/2,w,.025,y+.83,.065,0xcfc4ab,{solid:false});
    }
    function archStall(u,v,name,w=5,face='N',openPassage=false) {
      // 13: arched timber transom, dark masonry below, inset sign and full counter.
      const at=(s,t)=>face==='E'?[u-t,v+s]:[u+s,v+t];
      const bb=(s,t,ww,dd,yy,hh,mat,solid=false)=>{const[uu,vv]=at(s,t);box(uu,vv,face==='E'?dd:ww,face==='E'?ww:dd,yy,hh,mat,{solid});};
      const qp=(s,yy,t=0)=>{const[x,z]=P(...at(s,t));return[x,yy,z];};
      const normal=face==='E'?[CA,0,-SA]:[-SA,0,-CA];
      if(!openPassage){
        bb(0,0,w,.32,y+2.15,.45,'ssg_fieldstone');
        bb(-.95,.38,1.2,.6,y+.65,1.4,0x2b2b2b);
        bb(-.95,.065,.84,.025,y+1.1,.38,{tex:'emit',color:0xff5a3a});
        for(let row=0;row<3;row++){
          bb(.65,.2,1.3,.45,y+.75+row*.42,.06,0xb08a5a);
          for(let i=0;i<5;i++)bb(.15+i*.23,.15,.18,.24,y+.82+row*.42,.12,[0xd9aa66,0xbf8b47,0xe0bd7b][(row+i)%3]);
        }
      }
      for(const du of [-w/2,w/2])bb(du,0,.24,.55,y+(openPassage?2.65:0),openPassage?.95:3.6,HONEY,!openPassage);
      bb(0,-.2,w,.18,y+2.65,.4,HONEY);
      if(name){const[uu,vv]=at(0,-.31);sign(name,uu,vv,y+2.82,face,w*.68,.32,{...serif,bg:'#25302b',fg:'#f5e4b5',font:name==='Standard Bread'?'"Comic Sans MS", cursive':serif.font});}
      for(let i=0;i<20;i++){
        const a=PI*i/20,b=PI*(i+1)/20;
        const pp=(ang,r)=>qp(Math.cos(ang)*r,y+3.0+Math.sin(ang)*1.1*r/(w/2));
        K.quad(HONEY,[pp(a,w/2),pp(b,w/2),pp(b,w/2-.15),pp(a,w/2-.15)],normal);
        K.quad('glass',[qp(0,y+3),pp(a,w/2-.15),pp(b,w/2-.15),qp(0,y+3)],normal);
      }
      bb(0,0,w-.3,.12,y+3.02,.04,HONEY);
      for(let du=-w/2+.35;du<w/2-.2;du+=.35){const hh=Math.sqrt(Math.max(0,1-du*du/((w/2-.15)**2)))*.98;bb(du,0,.04,.1,y+3.05,hh,HONEY);}
      for(let dh=.35;dh<1;dh+=.35){const ww=2*(w/2-.15)*Math.sqrt(1-(dh/1.1)**2);bb(0,0,ww,.1,y+3+dh,.04,HONEY);}
      if(!openPassage){
        // Leave the corner in front of Standard Bread clear of the perpendicular counter.
        const corner=face==='E'&&v>44,[uu,vv]=at(corner?-.5:0,-1.1);
        vitrine(uu,vv,w-(corner?1.8:.7),1.15,2,'',face);
      }
    }
    // Round12: gray cells digitized from the official full-floor raster. Coordinates
    // use the1823x1367 display grid; source is2000x1500. No blog-derived locations.
    // This is a schematic registration, NOT a survey. Retained1F core residuals
    // and the continuous east-region shear are quantified in plan_transform_B1.
    const BPLAN=(px,py)=>[B1u(px),B1v(py)];
    const BP=(px,py)=>P(...BPLAN(px,py));
    const BRECT=(a,b,c,d)=>[[a,b],[c,b],[c,d],[a,d]];
    const BPOLY=pp=>pp.map(q=>BP(...q));
    const cells=[{"zone":"west_strip","name":"고래사어묵","rect":[428.4,346.31,468.51,371.82],"frontage_image":"S","kind":"deli"},{"zone":"west_strip","name":"JS가든 델리","rect":[401.06,362.71,420.2,406.45],"frontage_image":"E","kind":"deli"},{"zone":"west_strip","name":"동경라멘학교","rect":[401.06,413.75,420.2,440.17],"frontage_image":"E","kind":"deli"},{"zone":"west_strip","name":"에그롤린","rect":[428.4,382.76,448.46,407.37],"frontage_image":"W","kind":"deli"},{"zone":"west_strip","name":"구오 X 여경래","rect":[450.28,382.76,469.42,432.88],"frontage_image":"E","kind":"deli"},{"zone":"west_strip","name":"시아리","rect":[428.4,409.19,448.46,432.88],"frontage_image":"W","kind":"deli"},{"zone":"west_strip","name":"원디그리노스","rect":[428.4,443.82,447.55,478.45],"frontage_image":"W","kind":"deli"},{"zone":"west_strip","name":"교토 오니마루","rect":[449.37,443.82,468.51,515.81],"frontage_image":"E","kind":"deli"},{"zone":"west_strip","name":"야키토리코우키","rect":[428.4,480.27,447.55,515.81],"frontage_image":"W","kind":"deli"},{"zone":"west_strip","name":"서연","rect":[401.06,516.73,420.2,542.24],"frontage_image":"E","kind":"deli"},{"zone":"west_strip","name":"노가","rect":[428.4,527.66,447.55,552.27],"frontage_image":"W","kind":"deli"},{"zone":"west_strip","name":"하나하나","rect":[449.37,527.66,468.51,552.27],"frontage_image":"E","kind":"deli"},{"zone":"west_strip","name":"모스꼬라델리","rect":[401.06,546.8,420.2,579.61],"frontage_image":"E","kind":"deli"},{"zone":"west_strip","name":"호일당","rect":[428.4,554.09,447.55,578.7],"frontage_image":"W","kind":"deli"},{"zone":"west_strip","name":"방촌시장떡볶이","rect":[449.37,554.09,468.51,582.34],"frontage_image":"E","kind":"deli"},{"zone":"west_strip","name":"고은","rect":[401.06,595.1,432.96,619.71],"frontage_image":"N","kind":"deli"},{"zone":"west_strip","name":"오목집","rect":[434.79,595.1,467.6,619.71],"frontage_image":"N","kind":"deli"},{"zone":"north_deli","name":"도제","rect":[497.68,358.15,534.14,382.76],"frontage_image":"S","kind":"deli","label_uncertain":false},{"zone":"north_deli","name":"마음죽","rect":[535.96,358.15,572.42,382.76],"frontage_image":"S","kind":"deli","label_uncertain":false},{"zone":"north_deli","name":"더타코부스","rect":[620.73,358.15,655.37,382.76],"frontage_image":"S","kind":"deli","label_uncertain":true},{"zone":"north_deli","name":"위알 필라델피아","rect":[657.19,358.15,691.83,382.76],"frontage_image":"S","kind":"deli","label_uncertain":false},{"zone":"north_deli","name":"키키모아나","rect":[706.41,346.31,743.78,370.91],"frontage_image":"S","kind":"deli","label_uncertain":false},{"zone":"north_deli","name":"비첸향","rect":[745.61,359.07,811.24,379.11],"frontage_image":"S","kind":"deli","label_uncertain":false},{"zone":"north_deli","name":"트웰브 원더바","rect":[812.15,346.31,828.55,379.11],"frontage_image":"S","kind":"deli","label_uncertain":false},{"zone":"north_deli","name":"베통 키츠네트","rect":[853.16,346.31,915.15,379.11],"frontage_image":"S","kind":"deli","label_uncertain":false},{"zone":"north_deli","name":"온유가","rect":[499.5,400.99,529.58,423.77],"frontage_image":"S","kind":"deli","label_uncertain":false},{"zone":"north_deli","name":"델리카스타","rect":[499.5,425.59,529.58,451.11],"frontage_image":"S","kind":"deli","label_uncertain":false},{"zone":"north_deli","name":"블루버터플라이","rect":[531.4,400.99,551.46,451.11],"frontage_image":"S","kind":"deli","label_uncertain":false},{"zone":"north_deli","name":"베지스튜디오","rect":[564.22,400.99,595.21,423.77],"frontage_image":"S","kind":"deli","label_uncertain":false},{"zone":"north_deli","name":"남스델리","rect":[597.03,400.99,628.02,423.77],"frontage_image":"S","kind":"deli","label_uncertain":false},{"zone":"north_deli","name":"베키아에누보 가스트로","rect":[564.22,425.59,628.02,451.11],"frontage_image":"S","kind":"deli","label_uncertain":false},{"zone":"north_deli","name":"몰랑이수","rect":[638.05,400.99,659.01,451.11],"frontage_image":"S","kind":"deli","label_uncertain":false},{"zone":"north_deli","name":"와사비그린","rect":[660.84,400.99,691.83,423.77],"frontage_image":"S","kind":"deli","label_uncertain":false},{"zone":"north_deli","name":"파작","rect":[660.84,425.59,691.83,451.11],"frontage_image":"S","kind":"deli","label_uncertain":false},{"zone":"north_deli","name":"타마노카","rect":[709.15,400.99,749.25,423.77],"frontage_image":"S","kind":"deli","label_uncertain":false},{"zone":"north_deli","name":"오크베리 아사이","rect":[709.15,425.59,749.25,451.11],"frontage_image":"S","kind":"deli","label_uncertain":false},{"zone":"north_deli","name":"라플","rect":[853.16,400.99,883.24,425.59],"frontage_image":"S","kind":"deli","label_uncertain":false},{"zone":"north_deli","name":"pbs","rect":[885.07,400.99,915.15,425.59],"frontage_image":"S","kind":"deli","label_uncertain":false},{"zone":"north_deli","name":"베이크","rect":[853.16,427.42,915.15,451.11],"frontage_image":"S","kind":"deli","label_uncertain":false},{"zone":"north_deli","name":"본다이워시","rect":[749.25,452.93,798.47,467.51],"frontage_image":"S","kind":"retail","label_uncertain":false},{"zone":"north_deli","name":"고메시푸드","rect":[497.68,469.34,561.48,490.3],"frontage_image":"N","kind":"deli","label_uncertain":false},{"zone":"north_deli","name":"팝업","rect":[563.31,469.34,627.11,490.3],"frontage_image":"N","kind":"popup","label_uncertain":false},{"zone":"north_deli","name":"주스바","rect":[628.93,469.34,693.65,490.3],"frontage_image":"N","kind":"deli","label_uncertain":false},{"zone":"north_deli","name":"에맥앤볼리오스 / 고디바크레페","rect":[865.92,488.47,919.7,524.93],"frontage_image":"N","kind":"deli","label_uncertain":false},{"zone":"north_deli","name":"기프트 컨시어지","rect":[753.81,529.48,784.8,555.0],"frontage_image":"N","kind":"service","label_uncertain":false},{"zone":"north_deli","name":"팝업","rect":[786.62,529.48,818.53,555.0],"frontage_image":"N","kind":"popup","label_uncertain":false},{"zone":"north_deli","name":"포장 / 전통주","rect":[949.78,367.27,988.98,391.87],"frontage_image":"S","kind":"retail","label_uncertain":false},{"zone":"north_deli","name":"정관장 · 건강식품","rect":[949.78,393.7,1030.91,452.93],"frontage_image":"S","kind":"retail","brands":["정관장","강개상인","뉴트리코어","오쏘몰","GNC","솔가","콤비타","레이델","메리루스","경옥채","프로젝트라이프","발렌"],"label_uncertain":true},{"zone":"centre","name":"발효곳간","rect":[840.4,538.6,918.79,654.34],"frontage_image":"W","kind":"retail"},{"zone":"centre","name":"자주","rect":[920.62,538.6,956.16,573.23],"frontage_image":"N","kind":"retail"},{"zone":"centre","name":"보앤미","rect":[841.31,656.16,919.7,776.46],"frontage_image":"W","kind":"retail"},{"zone":"centre","name":"와인하우스","rect":[906.94,717.22,988.98,776.46],"frontage_image":"S","kind":"wine"},{"zone":"centre","name":"오설록","rect":[968.92,729.07,1018.15,776.46],"frontage_image":"S","kind":"cafe"},{"zone":"centre","name":"커피스니퍼","rect":[950.69,489.39,1030.91,533.13],"frontage_image":"N","kind":"cafe"},{"zone":"centre","name":"격물공부","rect":[780.24,776.46,813.97,798.33],"frontage_image":"S","kind":"retail"},{"zone":"centre","name":"고려당","rect":[735.58,800.15,820.35,871.23],"frontage_image":"SE","kind":"bakery"},{"zone":"centre","name":"인텔리젠시아","rect":[842.23,798.33,903.3,839.34],"frontage_image":"N","kind":"cafe"},{"zone":"centre","name":"소금집","rect":[905.12,798.33,966.19,839.34],"frontage_image":"N","kind":"deli"},{"zone":"centre","name":"네스프레소","rect":[968.01,798.33,1029.08,839.34],"frontage_image":"N","kind":"cafe"},{"zone":"market","name":"신세계 마켓","rect":[499.5,490.3,818.53,774.63],"frontage_image":"N","kind":"supermarket"},{"zone":"west_strip","name":"이벤트홀","rect":[401.06,621.53,467.6,731.8],"frontage_image":"E","kind":"event"},{"zone":"sw_plaza","name":"특설행사장","rect":[372.8,845.72,572.42,997.0],"frontage_image":"E","kind":"event"},{"zone":"sw_plaza","name":"패션 액세서리","rect":[497.68,846.63,621.64,960.55],"frontage_image":"S","kind":"accessories"},{"zone":"sw_plaza","name":"러쉬","rect":[711.88,846.63,758.37,890.37],"frontage_image":"SE","kind":"retail"},{"zone":"sw_plaza","name":"메가박스 영화관","rect":[623.47,874.88,903.3,1153.75],"frontage_image":"NW","kind":"cinema"},{"zone":"sw_plaza","name":"카멜커피","rect":[686.36,1027.98,734.67,1119.12],"frontage_image":"NW","kind":"cafe"},{"zone":"sw_plaza","name":"영풍문고","rect":[623.47,1063.53,733.76,1122.76],"frontage_image":"N","kind":"books"},{"zone":"sw_plaza","name":"스포츠 슈 전문관","rect":[373.71,1030.72,623.47,1153.75],"frontage_image":"N","kind":"shoes"},{"zone":"service","name":"북서 화장실","rect":[399.24,324.43,418.38,344.48],"frontage_image":"S","kind":"service"},{"zone":"service","name":"북동 화장실","rect":[990.8,326.26,1030.91,391.87],"frontage_image":"S","kind":"service"},{"zone":"service","name":"마켓 엘리베이터","rect":[541.43,598.75,614.35,656.16],"frontage_image":"S","kind":"service"},{"zone":"service","name":"북측 엘리베이터","rect":[914.23,313.5,958.9,345.4],"frontage_image":"S","kind":"service"},{"zone":"service","name":"소형 무인 물품 보관함","rect":[499.5,790.13,692.74,844.81],"frontage_image":"S","kind":"service"},{"zone":"service","name":"대형 캐리어 무인 물품보관함","rect":[466.69,991.53,561.48,1036.19],"frontage_image":"S","kind":"service"},{"zone":"service","name":"광장 화장실","rect":[678.16,846.63,743.78,948.7],"frontage_image":"S","kind":"service"},{"zone":"service","name":"남자 및 장애인 화장실","rect":[752.9,873.06,810.32,938.67],"frontage_image":"S","kind":"service"},{"zone":"service","name":"고객서비스데스크","rect":[801.21,844.81,840.4,894.02],"frontage_image":"S","kind":"service"}];
    const curve=(cx,cy,rx,ry,a,b,n=24)=>Array.from({length:n+1},(_,i)=>[cx+rx*Math.cos(a+(b-a)*i/n),cy+ry*Math.sin(a+(b-a)*i/n)]);
    const marketShape=[[498,491],[693,491],[753,530],[753,556],[819,556],[819,776],[724,776],[724,752],[498,752]];
    const accessoryShape=[[498,846],[622,846],[622,950],[611,958],[594,961],[575,958],[552,947],[530,932],[513,915],[502,894],[498,872]];
    const eventShape=[[372,845],[467,845],[467,872],[470,896],[480,922],[496,943],[519,963],[548,984],[571,998],[372,998]];
    const plazaShape=[[467,733],[498,733],[498,871],...curve(590,871,92,91,PI,PI*.52),[678,950],[832,811],[842,837],[696,970],...curve(650,1014,63,61,-.8,2.1),[605,1057],[434,1057],[406,1030],[372,1030],[372,998],[570,998],[514,958],...curve(626,872,159,126,2.4,PI)];
    const cinemaShape=[[839,894],[904,894],[904,1155],[623,1155],[623,1124],[736,1124],[736,1036],[710,1028],...curve(650,1014,63,61,.23,-.8),[697,969],[760,911]];
    const shoeShape=[[372,1030],[406,1030],[434,1067],[449,1057],[605,1057],[623,1066],[623,1155],[372,1155]];
    const overrides={
      '신세계 마켓':marketShape,'특설행사장':eventShape,'패션 액세서리':accessoryShape,
      '메가박스 영화관':cinemaShape,'카멜커피':[[710,1028],[736,1036],[736,1123],[686,1063]],
      '영풍문고':[[623,1067],[686,1063],[736,1124],[623,1124]],'스포츠 슈 전문관':shoeShape,
      '러쉬':[[710,846],[738,846],[760,873],[744,889]],
      '고려당':[[735,800],[820,800],[820,836],[760,876],[740,846],[735,846]],
      '발효곳간':[[841,540],[920,540],[920,595],[889,595],[889,655],[841,655]],
      '보앤미':[[841,655],[920,655],[920,717],[906,717],[906,776],[841,776]],
      '와인하우스':[[906,717],[975,717],[975,728],[990,728],[990,750],[968,750],[968,776],[906,776]],
      '오설록':[[990,728],[1019,728],[1019,776],[968,776],[968,750],[990,750]],
      '광장 화장실':[[678,846],[710,846],[744,889],[678,950]],
      '남자 및 장애인 화장실':[[753,913],[794,875],[818,900],[771,940]],
      '고객서비스데스크':[[809,869],[832,848],[841,859],[841,894],[815,894]],
    };
    for(const c of cells)c.planPolygon=overrides[c.name]||BRECT(...c.rect);
    const worldPoly=c=>BPOLY(c.planPolygon||overrides[c.name]||BRECT(...c.rect));
    const uvRect=c=>{const[a,b,d,e]=c.rect,[u1,v0]=BPLAN(a,b),[u0,v1]=BPLAN(d,e);return[u0,v0,u1,v1];};
    const officialFace=f=>({N:'N',S:'S',E:'W',W:'E',SE:'S',NW:'N'}[f]||'S');
    const oldCoreRects=CORES.filter(c=>c.door!=='W').map(c=>[c.uL-.25,c.v0-.4,c.uR+.25,c.v1+.4]);
    const reserves=[...oldCoreRects,[37.4,-1,39.6,5.5],
      ...BEAUTY_BANKS.map(v=>[24.7,v-.1,47,v+2.4])];
    const reserved=(u,v,m=.2)=>reserves.some(r=>inR(u,v,r,m))||u<2.7;
    function fits(c,u,v,w,d){
      if(reserved(u,v)||reserved(u-w/2,v-d/2)||reserved(u+w/2,v+d/2))return false;
      const poly=worldPoly(c);
      return [[0,0],[-w/2,-d/2],[w/2,-d/2],[w/2,d/2],[-w/2,d/2]].every(([a,b])=>K.pointInPoly(...P(u+a,v+b),poly));
    }
    // Five public zones: structural registration is immediate, stock/people lazy.
    const zoneSpecs=[
      ['west_strip','서측 델리 · 이벤트홀',[399,345,478,733]],
      ['north_deli','북측 델리 · 7게이트 · 8게이트',[498,345,1032,557]],
      ['market','신세계 마켓',[498,491,819,776]],
      ['centre','발효곳간 · 와인하우스 · 카페',[820,489,1032,845]],
      ['sw_plaza','메가박스 · 영풍문고 · 원형 광장',[371,775,904,1155]],
    ];
    for(const[id,name,r]of zoneSpecs)K.zone({name,floor:'B1',sub:'신세계백화점 강남점 · 지하1층',poly:BPOLY(BRECT(...r)),y0:y,y1:0,priority:3});
    for(const c of cells){
      K.zone({name:c.name,floor:'B1',sub:c.brands?c.brands.join(' · '):'신세계 강남점 지하1층',poly:worldPoly(c),y0:y,y1:-1,priority:c.kind==='service'?6:5});
    }
    // Raster core bumps extend beyond the rectangular above-ground footprint.
    // They have a basement ceiling only; the round11 street/1F slabs are unchanged.
    for(const r of [[399,324,420,345],[914,313,959,345],[990,325,1032,345]]){
      K.slab(BPOLY(BRECT(...r)),y,{mat:{tex:'marble',gloss:.5},thick:.3,under:false,edge:false});
      K.hpoly(CREAM,BPOLY(BRECT(...r)),-1,false);
      K.phys.addCeiling(BPOLY(BRECT(...r)),-1,{});
    }
    // Only black strokes in the official plan are partitions. Gray deli blocks
    // are open counters, never generic enclosed shops.
    function bw(a,b,opening=0){
      const A=BP(...a),B=BP(...b),L=Math.hypot(A[0]-B[0],A[1]-B[1]);
      const mid=BPLAN((a[0]+b[0])/2,(a[1]+b[1])/2);
      if(reserved(...mid,.6))return;
      K.wall(...A,...B,y,y+3.4,{mat:0xe7dfcf,thick:.13,openings:opening?[{at:L/2,w:Math.min(opening,L-.2),y0:y,y1:y+2.7}]:[]});
    }
    for(const[a,b,op]of [
      [[498,491],[693,491],5],[[498,491],[498,752],4],[[498,752],[724,752],5],
      [[819,557],[819,776],4],[[841,540],[920,540],0],[[841,540],[841,655],4],
      [[841,655],[920,655],0],[[841,655],[841,776],4],[[920,540],[920,595],0],
      [[889,595],[975,595],0],[[975,526],[975,717],4],[[975,717],[1019,717],0],
      [[841,841],[1032,841],4],[[904,894],[904,1155],0],[[623,1155],[904,1155],0],
      [[372,1155],[623,1155],0],[[678,846],[678,950],0],[[622,846],[622,950],0],
    ])bw(a,b,op);
    // Curved cinema/shop boundaries follow the traced white plaza, not its bbox.
    const cinemaArc=curve(650,1014,63,61,-.8,.23,20);
    for(let i=0;i<cinemaArc.length-1;i++)bw(cinemaArc[i],cinemaArc[i+1]);
    // Public wayfinding stays in the white corridors. GATE8 is no longer atJ4.
    for(const [label,px,py,face]of [['7GATE',483,346,'S'],['8GATE',840,346,'S'],['9GATE · 백화점 식품관',1026,477,'W'],['메가박스 ↓ 10GATE',481,704,'E'],['지하철 연결 ←',395,1014,'S']]){
      const[u,v]=BPLAN(px,py);sign(label,u,v,y+2.65,face,3.2,.46,{bg:'#34382e',fg:'#f4ead7',twoSided:true});
    }
    //7/8Gate both open onto a short common basement vestibule, joined toJ1.
    const northVest=rect(16,-3.8,64,0);
    K.slab(northVest,y,{mat:{tex:'marble',gloss:.5},thick:.25,under:false,edge:false});
    K.hpoly(CREAM,northVest,-2.2,false);K.phys.addCeiling(northVest,-2.2,{});
    wall(16,-3.8,29,-3.8,y,-2.2,{mat:CREAM});wall(47,-3.8,64,-3.8,y,-2.2,{mat:CREAM});
    wall(16,-3.8,16,0,y,-2.2,{mat:CREAM});wall(64,-3.8,64,0,y,-2.2,{mat:CREAM});
    K.zone({name:'7·8게이트 연결 로비',floor:'B1',sub:'고투몰 · 고속터미널역',poly:northVest,y0:y,y1:-2.2,priority:4});

    const b1People=[];
    function customer(u,v,staff=false){b1People.push({u,v,staff,shirt:staff?0xf4efe6:[0x53483d,0xb2aa99,0x737b67,0x545e72][Math.floor(rnd()*4)]});}
    function counter(c,index){
      const r=uvRect(c),[u0,v0,u1,v1]=r,W=u1-u0,D=v1-v0,face=officialFace(c.frontage_image);
      const horizontal=face==='N'||face==='S';
      let w=horizontal?Math.max(.7,Math.min(W-.45,5.4)):Math.max(.6,Math.min(W-.45,.95));
      let d=horizontal?Math.max(.55,Math.min(D-.45,.95)):Math.max(.7,Math.min(D-.45,4.8));
      const preferred=[(u0+u1)/2,(v0+v1)/2];
      if(face==='N')preferred[1]=v0+.75;if(face==='S')preferred[1]=v1-.75;
      if(face==='E')preferred[0]=u1-.75;if(face==='W')preferred[0]=u0+.75;
      let at=null;
      for(const scale of [1,.75,.5,.35,.25]){
        const ww=w*scale,dd=d*scale;
        const candidates=[preferred];
        for(let uu=u0+ww/2+.15;uu<u1-ww/2;uu+=.2)for(let vv=v0+dd/2+.15;vv<v1-dd/2;vv+=.2)candidates.push([uu,vv]);
        at=candidates.find(([u,v])=>fits(c,u,v,ww,dd));
        if(at){w=ww;d=dd;break;}
      }
      const sU=Math.max(u0+.35,Math.min(u1-.35,preferred[0])),sV=Math.max(v0+.35,Math.min(v1-.35,preferred[1]));
      const signName=c.name==='건강식품 복합셀'?'정관장 · 건강식품':c.name==='보앤미'?'Bo&Mie':c.name==='발효곳간'?'발효:곳간':c.name;
      sign(signName,sU,sV,y+2.25,face,Math.max(.8,Math.min(horizontal?W-.2:D-.2,6.4)),.40,{bg:c.kind==='popup'?'#6f2334':'#3b382d',fg:c.name==='보앤미'?'#d4ae60':'#f4e4bd',twoSided:true,pxPerM:120});
      // A retained structural core may consume a tiny schematic cell. Keep its
      // plan sign at that cell, record the exception instead of moving its shop.
      if(!at)return;
      const[u,v]=at,wood=c.kind==='wine'?0x493529:c.kind==='deli'?0xb8925d:0x7e6044;
      box(u,v,w,d,y,.83,{tex:'wood',color:wood});
      box(u,v,w+.025,d+.025,y+.83,.06,{tex:'marble',color:0xe9debf,gloss:.5},{solid:false});
      if(['deli','bakery'].includes(c.kind)){
        box(u,v,w-.04,d-.04,y+.9,.42,'glass',{solid:false});
        for(const du of [-w/2+.05,w/2-.05])for(const dv of [-d/2+.05,d/2-.05])box(u+du,v+dv,.025,.025,y+.9,.43,BRASS,{solid:false});
        box(u,v,w,d,y+1.31,.025,BRASS,{solid:false});
      }
      const nx=Math.max(2,Math.floor(w/.28)),nz=Math.max(2,Math.floor(d/.28));
      for(let a=0;a<nx;a++)for(let b=0;b<nz;b++){
        const uu=u-w*.4+(a+.5)*w*.8/nx,vv=v-d*.4+(b+.5)*d*.8/nz;
        if(c.kind==='cafe'&&Math.abs(uu-u)<.36&&Math.abs(vv-v)<.3)continue;
        box(uu,vv,Math.min(.21,w/nx*.8),Math.min(.20,d/nz*.8),y+.90,.08+(a%3)*.035,[0xdbad6a,0xf2d299,0x975c3e,0x93a16b][(a+b+index)%4],{solid:false});
      }
      box(u+w*.28,v+d*.24,.22,.16,y+1.0,.28,0x252b28,{solid:false});
      if(c.kind==='cafe'&&w>.7&&d>.5){
        // Compact espresso equipment and olive-banded cups, seen at p5QE9cVtWDM_380/620.
        box(u,v,.56,.4,y+.90,.035,{tex:'metal',color:0xbec1bd},{solid:false});
        box(u,v+.08,.49,.23,y+.94,.32,{tex:'metal',color:0x9ca4a0},{solid:false});
        box(u,v-.045,.46,.025,y+1.03,.14,0x1e2825,{solid:false});
        for(const dx of [-.16,0,.16]){
          box(u+dx,v-.09,.035,.10,y+1.01,.04,'metal',{solid:false});
          const[cx,cz]=P(u+dx,v-.12);
          K.cyl({x:cx,z:cz,y:y+.94,r:.04,h:.085,seg:8,mat:0xf4eee3,solid:false});
          K.cyl({x:cx,z:cz,y:y+.966,r:.041,h:.026,seg:8,mat:0x879253,solid:false});
        }
        for(let n=0;n<4;n++)cyl(u+.22,v+.11,y+1.27+n*.03,.045,.035,0xf5efe4,false,8);
      }
      const staff=[u+(face==='E'?-.8:face==='W'?.8:0),v+(face==='S'?-.85:face==='N'?.85:0)];
      if(fits(c,...staff,.35,.35))customer(...staff,true);
      if(c.brands)sign([c.brands.slice(0,4).join(' · '),c.brands.slice(4,8).join(' · '),c.brands.slice(8).join(' · ')],sU,sV,y+1.7,face,Math.min(7,Math.max(W,D)-.3),.8,{bg:'#e9dfcb',fg:'#55472f',twoSided:true});
      // Merchandise shelves stay inside the same official gray cell.
      if(['retail','wine','books','shoes','accessories'].includes(c.kind)){
        for(let vv=v0+1.5;vv<v1-.8;vv+=1.8)for(let uu=u0+1;uu<u1-.8;uu+=2.1){
          if(Math.hypot(uu-u,vv-v)<1.7||!fits(c,uu,vv,1.1,.45))continue;
          box(uu,vv,1.1,.45,y,1.65,{tex:'wood',color:wood});
          for(let row=0;row<4;row++)for(let k=0;k<5;k++){
            box(uu-.43+k*.21,vv-.25,.15,.12,y+.25+row*.34,.25,[0x64836a,0xb38355,0xe2d2a7,0x854a3f][(k+row)%4],{solid:false});
          }
        }
      }
      if(c.kind==='cafe')for(const du of [-1.5,1.5]){
        const tu=u+du,tv=v+2.2;if(!fits(c,tu,tv,1.5,1.5))continue;
        box(tu,tv,.8,.8,y+.72,.06,{tex:'wood',color:0x7f6045});
        for(const dd of [-.6,.6])box(tu,tv+dd,.4,.42,y+.43,.10,0x6b5845);
      }
    }
    function lockers(c){
      const[u0,v0,u1,v1]=uvRect(c),v=v0+.6;
      for(let u=u0+.5;u<u1-.5;u+=.6)if(fits(c,u,v,.55,.45)){
        box(u,v,.55,.45,y,2.1,0xc8c3b5);
        for(let row=0;row<(c.name.startsWith('소형')?4:2);row++){
          const yy=y+.08+row*(c.name.startsWith('소형')?.5:1);
          box(u,v+.235,.50,.018,yy,c.name.startsWith('소형')?.45:.91,0xe6dfcf,{solid:false});
          box(u+.14,v+.25,.035,.025,yy+.2,.10,0x4c514d,{solid:false});
        }
      }
      sign(c.name,(u0+u1)/2,v+.3,y+2.4,'S',Math.min(u1-u0,6),.4,{bg:'#454840',fg:'#fff4d6'});
    }
    function toilet(c){
      const[u0,v0,u1,v1]=uvRect(c),u=(u0+u1)/2,v=(v0+v1)/2;
      sign(c.name,u,v,y+2.6,'S',Math.min(3.6,u1-u0),.42,{bg:'#292b28',fg:'#ffffff',twoSided:true});
      // Compartments on the gray back edge, not across the white entry corridor.
      for(let uu=u0+.65;uu<u1-.5;uu+=1.05)if(fits(c,uu,v0+.6,.8,.8)){
        box(uu,v0+.6,.7,.65,y,.42,0xeeeae0);
        box(uu,v0+.25,.72,.16,y+.4,.5,0xf5f2e8,{solid:false});
        if(fits(c,uu+.45,v0+.8,.08,1.3))box(uu+.45,v0+.8,.07,1.3,y,2.1,0xbbb7ab);
      }
    }
    // Official elevator symbols become functioning B1 banks. All existing upper
    // stops remain available via destination tables; no extra1F shaft is cut.
    for(const c of cells.filter(c=>c.name.endsWith('엘리베이터'))){
      const r=uvRect(c),[u,v]=BPLAN(...(c.name==='마켓 엘리베이터'?[578,617]:[936,335])),[x,z]=P(u,v);
      const remote=P(UPPER_ELV[1].u,UPPER_ELV[1].v-2.2),nw=P(NWLIFTS[0].u+2.8,NWLIFTS[0].v);
      const floorList=ELV_FLOORS.map(f=>({...f,...(f.label==='B1'?{dx:1.8*SA,dz:1.8*CA}:['1F','1M'].includes(f.label)?{dx:nw[0]-x,dz:nw[1]-z}:{dx:remote[0]-x,dz:remote[1]-z})}));
      const lift=K.elevator({name:c.name,x,z,rotY:RA,w:2,d:1.8,topH:3.2,floors:[{label:'B1',y,dx:1.8*SA,dz:1.8*CA}]});
      lift.floors=floorList;
      K.slab(rect(u-1.3,v-1.2,u+1.3,v+2.4),y,{mat:'metal',thick:.05,ceil:false,edge:false});
      sign('엘리베이터 · 전층 안내',u,v+.95,y+2.7,'S',3.8,.4,{bg:'#373c33',fg:'#f5deb0'});
    }

    // Round14 video finishes preserve every round12 cell and every 1F slab.
    // The market ramp is visible in p5QE9cVtWDM_90 but is unlocated: no invented level change.
    K.detail({floor:'B1',y0:y,y1:0,poly:FULL,name:'B1 보행 영상 · 대리석과 마켓 포털'},()=>{
      K.hpoly('ssg_diamond_gloss',FULL,y+.006,true,CORES.filter(c=>c.door!=='W').map(c=>stairHole(c,1)));
      const [u,v]=BPLAN(595.5,491); // centre of the existing official north-market doorway
      for(const du of [-2.58,2.58]){
        box(u+du,v,.12,.22,y,3.12,0x191b1b,{solid:false});
        box(u+du*.99,v-.125,.025,.025,y+.22,2.65,BRASS,{solid:false});
        box(u+du*1.23,v,.92,.035,y+.12,2.72,'glass',{solid:false});
        box(u+du*1.40,v,.06,.16,y,3.1,0x191b1b,{solid:false});
      }
      box(u,v,6.6,.24,y+2.88,.38,0x191b1b,{solid:false});
      sign('신세계 마켓',u,v-.15,y+3.07,'N',3.7,.26,{bg:null,fg:'#f4eee1',bold:false});
      for(const du of [-2.4,2.4])hq(u+du-.055,v-1.4,u+du+.055,v+.8,y+.027,0x252627);
      hq(u-2.45,v-1.45,u+2.45,v-1.34,y+.027,0x252627);
      // Ribbed cream columns repeat beside the long white aisle, not across it.
      for(const [px,py]of [[494,447],[494,575],[494,704]]){
        const[cu,cv]=BPLAN(px,py);if(reserved(cu,cv,.7))continue;
        cyl(cu,cv,y,.32,4.72,0xeee6d9,false,20);
        for(let k=0;k<20;k++){const a=k*PI/10;cyl(cu+Math.cos(a)*.315,cv+Math.sin(a)*.315,y+.12,.012,4.45,0xd4c9b6,false,4);}
        for(const yy of [.06,4.55])cyl(cu,cv,y+yy,.39,.09,BRASS,false,20);
      }
      for(const[px0,py0,px1,py1]of [[480,385,480,728],[829,565,829,778]]){
        const[a,b]=BPLAN(px0,py0),[c,d]=BPLAN(px1,py1);
        box((a+c)/2,(b+d)/2,.45,Math.abs(d-b),y+4.65,.14,CREAM,{solid:false});
        box((a+c)/2-.2,(b+d)/2,.035,Math.abs(d-b),y+4.62,.035,glow,{solid:false});
      }
    });

    for(const[id,name,r]of zoneSpecs)K.detail({floor:'B1',y0:y,y1:0,poly:BPOLY(BRECT(...r)),name:`B1 공식도면 · ${name}`},()=>{
      const own=cells.filter(c=>c.zone===id||(c.zone==='service'&&(id==='sw_plaza'?c.rect[1]>=775:id==='north_deli'?c.rect[1]<400:id==='market'?c.name==='마켓 엘리베이터':false)));
      for(const[cindex,c]of own.entries()){
        K.hpoly(c.kind==='supermarket'?'ssg_diamond_gloss':{tex:c.kind==='wine'?'wood':'marble',color:c.kind==='event'?0xe2d3b4:0xf0e5cf,gloss:.5},worldPoly(c),y+.012,true);
        if(c.name.includes('엘리베이터'))continue;
        if(c.name.includes('보관함')){lockers(c);continue;}
        if(c.name.includes('화장실')){toilet(c);continue;}
        if(c.kind==='supermarket')continue;
        if(c.kind==='event'){
          const booth={...c,name:c.name==='이벤트홀'?'메다비타 팝업':'진도모피 스페셜 위크',kind:'popup'};
          counter(booth,cindex);continue;
        }
        counter(c,cindex);
      }
      if(id==='market'){
        const c=cells.find(c=>c.kind==='supermarket'),core=[541,598,614,656].map(Number),[cu1,cv0]=BPLAN(core[0],core[1]),[cu0,cv1]=BPLAN(core[2],core[3]);
        const clear=(u,v,w,d)=>fits(c,u,v,w,d)&&!inR(u,v,[cu0-1.2,cv0-1.2,cu1+1.2,cv1+2.5]);
        const[mU0,mV0,mU1,mV1]=uvRect(c);
        for(let u=mU0+1.8;u<mU1-1;u+=3.1)for(let v=mV0+3;v<mV1-2.2;v+=6.1){
          if(!clear(u,v,1.1,4.4))continue;
          if(u<mU0+2&&v>55&&v<60)continue; // this same fixture footprint is the dry-aging cabinet below
          // M27U-isS4EA_200: a pink-covered produce island takes a grocery fixture's
          // own footprint; its precise position within the official market cell is inferred.
          if(u<mU0+2&&v>60){
            box(u,v,1.1,4.4,y,.86,{tex:'wood',color:0x69472f});
            box(u,v,1.13,4.43,y+.78,.14,0xc98492,{solid:false});
            for(let row=0;row<4;row++)for(let n=0;n<18-row*2;n++){
              const fu=u+((n%3)-1)*.22,fv=v-1.85+n*.21+row*.05,[fx,fz]=P(fu,fv);
              K.dome({x:fx,z:fz,y:y+.94+row*.12,rx:.115,ry:.12,rz:.115,hemi:false,seg:8,rings:5,mat:[0xe1b934,0xcac54d,0xe49c30][n%3]});
            }
            sign('제철 과일',u+.57,v,y+1.02,'E',1.1,.22,{bg:'#f8f4e8',fg:'#494734',bold:false});
            b1People.push({u:u+1.2,v:v-1.7,staff:true,shirt:0x662e3a});
            continue;
          }
          box(u,v,1.1,4.4,y,1.35,{tex:'wood',color:0xa68d65});
          for(let level=0;level<4;level++){
            box(u,v,1.22,4.5,y+.18+level*.32,.045,0xe5daca,{solid:false});
            for(const side of [-1,1])for(let k=0;k<20;k++){
              box(u+side*.43,v-2.02+k*.21,.25,.16,y+.23+level*.32,.21,[0xdda45f,0x8a9c63,0xcdd0b0,0xa6533e][(k+level)%4],{solid:false});
              box(u+side*.61,v-2.02+k*.21,.018,.13,y+.21+level*.32,.075,0x656b66,{solid:false});
              box(u+side*.625,v-2.02+k*.21,.012,.105,y+.225+level*.32,.045,0xe5e7df,{solid:false});
            }
          }
        }
        // p5QE9cVtWDM_300: dark dry-aging glass cabinet, hanging meat, stainless worktop.
        const du=mU0+1.8,dv=mV0+9.1;
        if(clear(du,dv,1.1,4.4)){
          box(du-.5,dv,.1,4.4,y,2.65,0x171d1c);
          for(const vv of [dv-2.16,dv+2.16])box(du,vv,1.1,.08,y,2.65,0x171d1c);
          box(du,dv,1.1,4.4,y,.18,0x171d1c);box(du,dv,1.1,4.4,y+2.56,.09,0x171d1c,{solid:false});
          box(du+.565,dv,.025,4.15,y+.2,2.24,'glass');
          for(let k=0;k<5;k++){
            const vv=dv-1.66+k*.83;box(du+.59,vv,.035,.04,y+.16,2.39,BRASS,{solid:false});
            box(du+.47,vv+.15,.06,.025,y+1.94,.38,'metal',{solid:false});
            const[xx,zz]=P(du+.42,vv+.15);K.dome({x:xx,z:zz,y:y+1.55,rx:.15,ry:.34,rz:.23,hemi:false,seg:8,rings:5,mat:0x983f43});
            box(du+.60,vv+.32,.01,.18,y+.54,.10,0xe8e2d3,{solid:false});
          }
          for(const yy of [.32,1.1,2.5])box(du+.52,dv,.035,4.15,y+yy,.035,{tex:'emit',color:0xffe5bc},{solid:false});
          sign('숙성 정육',du+.61,dv,y+2.77,'E',2.4,.28,{bg:'#222827',fg:'#e9d1a0'});
        }
        for(const[px,py,label]of [[670,573,'청과'],[670,710,'그로서리'],[775,610,'정육 · 수산'],[705,740,'계산대']]){
          const[u,v]=BPLAN(px,py);sign(label,u,v,y+2.8,'N',4,.45,{bg:'#354735',fg:'#f3e6c6',twoSided:true});
        }
      }
      if(id==='sw_plaza'){
        K.hpoly({tex:'marble',color:0xf4e9d8,gloss:.7},BPOLY(plazaShape),y+.025,true);
        // One small popup marked in the white curved plaza, inset from the through aisle.
        const pop={name:'팝업',kind:'popup',rect:[553,969,585,992],frontage_image:'S'};counter(pop,91);
        const shoe=cells.find(c=>c.kind==='shoes');
        for(const[i,brand]of ['ABC마트 그랜드스테이지','호카','윌슨','에이치덱스','디어밸런스'].entries()){
          const[u,v]=BPLAN(395+i*43,1125);sign(brand,u,v,y+2.6,'N',3.8,.34,{bg:'#242928',fg:'#ffffff'});
        }
        const[u,v]=BPLAN(805,1000);sign('메가박스',u,v,y+2.9,'N',7,.8,{bg:'#252329',fg:'#d3aaff'});
        for(let k=0;k<4;k++){
          const[uu,vv]=BPLAN(774+k*28,1092);if(!reserved(uu,vv)){box(uu,vv,.65,.4,y,1.5,0x242327);sign('예매 · 발권',uu,vv-.22,y+1.2,'N',.55,.16,{bg:'#3e3160',fg:'#fff'});}
        }
        // Curved cornice follows the plaza without putting solid posts in its aisle.
        for(let i=0;i<cinemaArc.length-1;i++){
          const A=BP(...cinemaArc[i]),B=BP(...cinemaArc[i+1]);K.wall(...A,...B,y+3.3,y+3.48,{mat:BRASS,thick:.18,solid:false});
        }
      }
      // Keep the warm arches/chandeliers in the photographed market, clear of all
      // retained escalator trajectories. SweetPark's checker finish belongs inCC.
      const[u1,v0]=BPLAN(r[0],r[1]),[u0,v1]=BPLAN(r[2],r[3]);
      for(let u=u0+4;u<u1-3;u+=8)for(let v=v0+4;v<v1-3;v+=8){
        if(reserved(u,v,4)||v<0)continue;
        if(id==='market'||id==='north_deli')vault(u-3.5,v-3.5,u+3.5,v+3.5,true);
        else chandelier(u,v,y+4.55);
      }
      let n=0;const target=id==='market'?26:id==='sw_plaza'?22:12;
      for(let attempt=0;attempt<4000&&n<target;attempt++){
        const u=u0+.8+rnd()*Math.max(.1,u1-u0-1.6),v=v0+.8+rnd()*Math.max(.1,v1-v0-1.6);
        if(v<0||reserved(u,v,.7))continue;
        const[x,z]=P(u,v),p={x,z};K.phys.resolve(p,.36,y,y+1.75,.5);
        if(Math.hypot(p.x-x,p.z-z)>.02)continue;
        customer(u,v);n++;
      }
    });
    K.detail({floor:'B1',y0:y,y1:0,poly:FULL,name:'B1 공식 매장 고객 · 직원'},()=>{
      for(const [index,person] of b1People.entries()){const[x,z]=P(person.u,person.v),q={x,z};K.phys.resolve(q,.34,y,y+1.75,.5);
        if(Math.hypot(q.x-x,q.z-z)>1||Math.abs(K.phys.support(q.x,q.z,y+.5).y-y)>.1)continue;
        const check={...q};K.phys.resolve(check,.34,y,y+1.75,.5);if(Math.hypot(check.x-q.x,check.z-q.z)>.01)continue;
        K.person(q.x,y,q.z,{shirt:person.shirt,pants:0x383935,rotY:RA+(person.staff?0:PI)});
        if(!person.staff&&index%8===0){
          const bx=q.x+.35*CA,bz=q.z-.35*SA;
          K.box({x:bx,z:bz,y:y+.48,w:.31,d:.23,h:.20,rotY:RA,mat:0x697161,solid:false});
          for(const dx of [-.12,.12])K.box({x:bx+dx*CA,z:bz-dx*SA,y:y+.68,w:.018,d:.018,h:.14,rotY:RA,mat:0x303a32,solid:false});
          K.box({x:bx,z:bz,y:y+.81,w:.26,d:.02,h:.02,rotY:RA,mat:0x303a32,solid:false});
        }
      }
    });
    for(const[name,px,py]of [['B1 신세계 마켓',720,570],['B1 북측 델리 · 8게이트',823,388],['B1 메가박스 원형 광장',648,1008],['B1 9게이트 · 스위트 파크 연결',1024,477]]){
      const[x,z]=BP(px,py);K.spawn({name,x,z,y,yaw:RA});
    }
  }


  // ================================================================= 1F — official 2026-11-06 plan cells
  // Pixel data is retained here so each name can be checked directly against the guide.
  // The gate-constrained mirrored schematic transform is documented in research.plan_transform.
  const BEAUTY_CELLS = [
    ['프레데릭 말',143,548,176,608],['로라 메르시에',177,548,208,608],['아르마니 코스메틱',234,548,282,608],['에르메스 뷰티',283,548,355,608],
    ['연작',388,548,447,587],['클라랑스',449,548,508,587],['에이피 뷰티',530,548,591,587],['SK-Ⅱ',592,548,653,587],['헤라',682,546,750,608],['라프레리',752,546,794,608],
    ['바비 브라운',143,609,208,668],['구찌 코스메틱',234,609,282,669],['겔랑',283,609,355,669],['키엘',388,608,454,662],['산타마리아 노벨라',455,608,520,662],['시세이도',521,608,587,662],['랑콤',588,608,653,662],['시슬리 코스메틱',682,610,750,669],['끌레드뽀 보떼',752,610,794,669],
    ['맥',142,688,207,746],['나스',234,688,282,746],['톰포드 뷰티',284,688,355,746],['샤넬 코스메틱',682,688,794,746],
    ['디올화장품',143,782,207,841],['아베다',234,782,282,841],['에스티로더',283,782,355,841],['프라다 뷰티',690,786,750,843],['바이레도',752,786,802,843],
    ['메이크업 포에버',143,861,175,926],['베네피트',177,861,208,926],['오휘/후',234,861,282,926],['설화수',283,861,355,926],['로에베 퍼퓸',388,861,445,926],['크리드',447,861,492,926],['킬리안',495,861,544,926],['아쿠아 디파르마',546,861,598,926],['탬버린즈',600,861,653,926],['케이스스터디',682,861,794,926],
    ['다이슨 뷰티',143,933,208,968],['프란시스 커정',820,575,850,624],['샤넬 코스메틱',820,664,876,720],
    ['탐포드 선글라스(DK)',820,863,851,881],['레이벤 선글라스',820,882,851,900],
    ['페라가모 선글라스(룩)',820,901,851,919],['케어링 선글라스',820,920,851,938]
  ];
  const EDGE_BOUTIQUES = [
    ['루이비통 뷰티 & 프래그런스 스토어',25,515,111,688,'W'],['딥티크',220,432,320,515,'S'],['에르메스 파빌리온',321,403,445,515,'S'],
    ['뽀아레',595,426,645,515,'S'],['스위스퍼펙션',646,426,702,515,'S'],['라메르',703,426,760,515,'S'],
    ['코스메데코르테',893,508,944,585,'E'],['샤넬 코스메틱',877,586,951,684,'E'],['르라보',877,686,951,721,'S'],['이솝',952,618,1020,721,'S'],
    ['입생로랑 뷰티',820,807,927,861,'N'],['조말론',929,807,1047,861,'N'],['디올화장품',45,842,111,994,'W']
  ];
  const JEWELLERY = [
    ['타사키',233,997],['포멜라토',294,1040],['아크레도',354,1080],['메시카',429,1090],['키린',550,1098],['스피넬리킬콜린',632,1096],['골든듀',690,1087],['스와로브스키',757,1058],
    ['누니',350,965],['반조애',414,972],['페로즈',477,969],['타니바이 미네타니',536,972],['세그먼트A',570,970],['프릿',474,1017],['아르투스 베르트랑',523,1018],['리오레',578,1020]
  ];
  const planRect=(x0,y0,x1,y1,map=PLAN)=>{const a=map(x0,y0),b=map(x1,y1);return[Math.min(a[0],b[0]),Math.min(a[1],b[1]),Math.max(a[0],b[0]),Math.max(a[1],b[1])];};
  // The official cells retain their full plan footprint; furniture sits inside each cell,
  // leaving the shared aisles open. Fixtures are schematic, not surveyed brand fit-outs.
  const BEAUTY_BANK_RECTS=[[25,31.8,44.3,36],[25,48.8,44.3,53]];
  const beautyObstacles=[];
  let beautyStaff=0;
  function beautyPerson(u,v,y,rotY,staff=false,index=0,bag=false) {
    const [x,z]=P(u,v);
    K.person(x,y,z,{rotY,shirt:staff?(index%3?0x20211f:0xf5f3ed):[0xb5a892,0x2a3343,0x7a4141,0x627667,0xe3d7c6][index%5],pants:staff?0x20211f:[0x353735,0x6e6255,0x273347][index%3]});
    if(staff){
      if(y===0)beautyStaff++;
      box(u+.12,v-.16,.07,.02,y+1.33,.045,0xe8ddc0,{solid:false});
    }
    if(bag){
      box(u+.35,v,.25,.13,y+.44,.30,index%2?0xd7c2a1:0x262826,{solid:false});
      for(const du of[-.075,.075])box(u+.35+du,v,.02,.02,y+.74,.10,0xa48a63,{solid:false});
      box(u+.35,v,.17,.02,y+.83,.02,0xa48a63,{solid:false});
    }
  }
  function beautyPalette(name) {
    if(/샤넬|맥|크리드|킬리안|톰포드|프라다|바이레도|나스/.test(name))return[0x242624,0xb2a07b,'#242624','#fff8ec'];
    if(/SK-|설화수|클라랑스|시세이도/.test(name))return[0xf2e8dc,0x8e3434,'#8e3434','#fff6e6'];
    if(/라메르|라프레리|헤라|코스메데코르테/.test(name))return[0xe9eee8,0x5e776d,'#536960','#ffffff'];
    if(/겔랑|에르메스|아르마니|랑콤|입생로랑/.test(name))return[0xeee5d5,0xb0915d,'#c2a879','#292620'];
    return[0xece6dc,0x9c8c77,'#e9e1d3','#4f4234'];
  }
  function planCounter(name,r,y=0,kind='cos',floor='1F') {
    const [u0,v0,u1,v1]=r,u=(u0+u1)/2,v=(v0+v1)/2,w=u1-u0,d=v1-v0;
    const eyewear=/선글라스/.test(name);
    zone(name,floor,kind==='jewel'?'주얼리':eyewear?'선글라스':kind==='popup'?'팝업 행사':'화장품 · 향수',r,y,y+2.6,3);
    furnish(floor,()=>{
      const [base,accent,bg,fg]=beautyPalette(name),jewel=kind==='jewel';
      const cw=Math.max(.65,w-(w<2.5?.65:1.1)),dd=Math.min(.85,d*.30),cv=v-Math.min(.65,d*.13);
      // A low coloured plinth marks each plan cell separately, instead of one continuous counter row.
      hq(u0+.2,v0+.2,u1-.2,v1-.2,y+.018,{color:base,gloss:.3});
      box(u,cv,cw,dd,y,.94,{color:base,gloss:.5});
      box(u,cv,cw+.04,dd+.04,y+.94,.065,{tex:'marble',color:0xf6f0e6,gloss:.7},{solid:false});
      box(u,cv-dd/2-.025,cw,.025,y+.12,.045,accent,{solid:false});
      box(u,cv-dd/2-.04,cw-.08,.02,y+.87,.025,{tex:'emit',color:0xffefd1},{solid:false});
      if(floor==='1F')beautyObstacles.push([u-cw/2,cv-dd/2,u+cw/2,cv+dd/2]);
      const n=Math.max(3,Math.floor(cw/.25));
      for(let i=0;i<n;i++){
        const xx=u-cw*.42+i*cw*.84/(n-1);
        box(xx,cv-dd*.22,.14,.11,y+1.012,.018,0xf8f5ed,{solid:false});
        if(eyewear){
          for(const dx of[-.045,.045])box(xx+dx,cv,.065,.035,y+1.04,.045,0x242524,{solid:false});
          box(xx,cv,.025,.035,y+1.055,.015,accent,{solid:false});
        }else{
          const hh=jewel?.065:.14+i%3*.045;
          box(xx,cv,.10,.10,y+1.035,hh,i%3===0?0x282823:i%3===1?0xc9ab81:0xe8dcc4,{solid:false});
          if(!jewel)box(xx,cv,.07,.07,y+1.035+hh,.04,accent,{solid:false});
        }
      }
      if(jewel)box(u,cv,cw-.07,dd-.07,y+1.02,.28,'glass',{solid:false});
      // Every brand has an individual readable header and illuminated display within its own cell.
      const shelfV=v+Math.min(d*.33,1.72),shelfH=jewel||eyewear?1.32:1.76;
      if(d>2.5){
        box(u,shelfV,cw,.24,y,shelfH,base,{solid:false});
        for(let row=0;row<3;row++){
          const sy=y+.55+row*.35;
          box(u,shelfV-.16,cw,.12,sy,.035,accent,{solid:false});
          box(u,shelfV-.225,cw-.12,.025,sy+.04,.022,{tex:'emit',color:0xffefd6},{solid:false});
          for(let i=0;i<n;i++)box(u-cw*.40+i*cw*.80/(n-1),shelfV-.15,.09,.09,sy+.05,.14+(i%2)*.04,i%2?0xf5efde:accent,{solid:false});
        }
        if(!jewel&&!eyewear){
          box(u,shelfV-.145,Math.min(.55,cw*.45),.025,y+.91,.62,0xb5c1c2,{solid:false});
          for(const du of[-.31,.31])if(Math.abs(du)<cw/2)box(u+du,shelfV-.17,.025,.025,y+.91,.62,{tex:'emit',color:0xfff3de},{solid:false});
        }
        // Short counter returns give the cell depth without closing its staff/customer opening.
        if(w>3.4){
          for(const du of[-cw/2+.18,cw/2-.18])box(u+du,cv+.58,.35,1.16,y,.94,base);
        }
      }
      sign(name,u,d>2.5?shelfV-.15:cv-dd/2-.04,y+(d>2.5?shelfH+.20:1.38),'N',Math.max(.65,cw),name.length>13?.26:.33,{bg,fg,bold:true,twoSided:true});
      if(floor==='1F'){
        const staffN=w>5.3?2:1;
        for(let j=0;j<staffN;j++)beautyPerson(u+(j-(staffN-1)/2)*1.0,cv+dd/2+.48,y,FACE.N,true,j);
      }
    });
  }
  function planBoutique(name,r,face,y=0,floor='1F',kind='cos') {
    const[u0,v0,u1,v1]=r,H=y?2.9:3.1;
    const u=(u0+u1)/2,v=(v0+v1)/2,w=u1-u0,d=v1-v0;
    zone(name,floor,kind==='cafe'?'카페 · 식음료':kind==='service'?'고객 서비스':'화장품 · 향수',r,y,y+H,3);
    if(floor==='1F')beautyObstacles.push(r);
    const sideDoor=floor==='1F'&&name==='루이비통 뷰티 & 프래그런스 스토어';
    const back=face==='N'?'S':face==='S'?'N':face==='E'?'W':'E';
    const edges={N:[u0,v0,u1,v0],S:[u0,v1,u1,v1],W:[u0,v0,u0,v1],E:[u1,v0,u1,v1]};
    for(const f of ['N','S','E','W'])if(f!==face)wall(...edges[f],y,y+H,{thick:.12,mat:0xe8e2d7,openings:sideDoor&&f==='E'?[{at:30-v0,w:6,y0:0,y1:2.7}]:[]});
    const fp=face==='N'?[u,v0]:face==='S'?[u,v1]:face==='E'?[u1,v]:[u0,v],fw=face==='N'||face==='S'?w:d;
    furnish(floor,()=>{
      const along=face==='N'||face==='S';
      box(fp[0],fp[1],along?w:.15,along?.15:d,y+2.56,.44,0xe9e2d5,{solid:false});
      sign(name,...fp,y+2.78,face,Math.max(.7,fw*.84),.32,{bg:null,fg:'#534533',bold:false});
      if(kind==='cafe')return; // furnished to the actual frontage in the 1M coffee-room batch
      if(kind==='service') {
        if(name==='화장실'){
          for(let vv=v0+2;vv<v1-.8;vv+=2.1){box(u0+.9,vv,1.3,.8,y,.44,0xf2eee3);box(u0+.9,vv+.35,1.3,.22,y+.44,.55,0xf2eee3);wall(u0+.15,vv+1,u1-1,vv+1,y,y+2.2,{mat:0xd8cfbd,thick:.08});}
          box(u1-.65,v, .65,Math.min(d-1,3),y,.83,{tex:'marble',color:0xece5d8});sign('화장실',u,v0+.15,y+1.8,'N',1.5,.32,{bg:'#3a3732',fg:'#f4eedf'});
        }else {box(u,v,Math.min(w*.55,2.1),.7,y,.95,0xc5b394);sign(name,u,v-.38,y+1.3,'N',Math.min(w*.8,3),.24,{bg:'#e7dfd0',fg:'#514b42'});}
        return;
      }
      const palette=/디올|샤넬|루이비통/.test(name)?0x282823:0xbfa780;
      const displaySpan=sideDoor?12.5:(along?w:d),sw=along?Math.max(1,w-.5):.45,sd=along?.45:Math.max(1,displaySpan-.5);
      const bu=back==='E'?u1-.28:back==='W'?u0+.28:u,bv=sideDoor?19.9:back==='N'?v0+.28:back==='S'?v1-.28:v;
      box(bu,bv,sw,sd,y+.15,2.22,palette,{solid:false});
      for(let row=0;row<4;row++){
        box(bu,bv,sw+.03,sd+.03,y+.43+row*.45,.04,0xe7dcc7,{solid:false});
        box(bu,bv,sw+.035,sd+.035,y+.47+row*.45,.018,{tex:'emit',color:0xffefd6},{solid:false});
        const n=Math.max(3,Math.floor(displaySpan/.32));
        for(let i=0;i<n;i++){const off=(i/(n-1)-.5)*(displaySpan-.75);box(bu+(along?off:0),bv+(along?0:off),.11,.11,y+.48+row*.45,.19+(i%3)*.03,kind==='cafe'?0xf4ede0:i%2?0xf5e8cc:0xc39d68,{solid:false});}
      }
      if(w>2.5&&d>2.5){
        const cw=Math.min(w*.62,4.0),cv=kind==='cafe'?v+Math.min(d*.2,1.8):v;
        box(u,cv,cw,.85,y,.98,{tex:'marble',color:0xe8dfce,gloss:.5});
        box(u,cv-.435,cw-.1,.025,y+.83,.035,{tex:'emit',color:0xffefd3},{solid:false});
        for(let i=0;i<8;i++)box(u-cw*.4+i*cw*.8/7,cv-.15,.10,.10,y+1,.18,0xc2a77c,{solid:false});
        beautyPerson(u,cv+.92,y,FACE.N,true,0);
        if(w>7)beautyPerson(u+1.25,cv+.92,y,FACE.N,true,1);
        if(kind==='cafe'){
          // Espresso machine, cup warmer, grinders and a pastry case make the mezzanine cafe usable.
          box(u-.5,cv,.92,.42,y+1.0,.44,0x4a4d4b,{solid:false});
          box(u-.5,cv-.23,.82,.04,y+1.09,.24,0xb9bfc0,{solid:false});
          for(const du of[-.24,.08]){box(u-.5+du,cv-.28,.045,.10,y+1.12,.10,0x242523,{solid:false});box(u-.5+du,cv-.28,.09,.09,y+1.01,.10,0xf8f3e8,{solid:false});}
          box(u+.18,cv,.20,.22,y+1,.26,0x252724,{solid:false});box(u+.18,cv,.19,.19,y+1.26,.22,'glass',{solid:false});
          box(u+cw*.32,cv,.65,.5,y+1.0,.36,'glass',{solid:false});
          for(let n=0;n<4;n++)box(u+cw*.32-.22+n*.15,cv,.11,.19,y+1.04,.06,0xba8854,{solid:false});
          sign(['커피 · 베이커리','아메리카노  카페라테','에스프레소  차'],u,cv+1.4,y+2.04,'N',Math.min(cw,3.8),.64,{bg:'#383b32',fg:'#f4ead7',bold:false});
          const tableV=v-Math.min(d*.22,1.7),tableUs=w>8?[-w*.29,0,w*.29]:[-w*.25,w*.25];
          for(const [i,du]of tableUs.entries()){
            box(u+du,tableV,.78,.78,y+.72,.065,{tex:'wood',color:0xa38a68},{solid:false});box(u+du,tableV,.10,.10,y,.72,0x5b5144,{solid:false});
            for(const dv of[-.7,.7]){box(u+du,tableV+dv,.43,.45,y,.45,0xa78c6b,{solid:false});box(u+du,tableV+dv+(dv>0?.18:-.18),.43,.07,y+.45,.36,0xa78c6b,{solid:false});}
            const p=P(u+du,tableV+.7);K.person(p[0],y,p[1],{sit:true,rotY:FACE.N,shirt:i%2?0xd7cab8:0x3e5046,pants:0x41413c});
            box(u+du+.18,tableV,.09,.09,y+.79,.10,0xf6f0e3,{solid:false});
          }
        }
      }
      downlight(u,v,y+H-.06,.07);
    });
  }
  {
    const fl='1F';
    // Indoor outline stops at the photographed recessed GATE2 threshold.
    const groundZone=[P(0,0),P(23,0),P(23,5),P(44,5),P(44,0),P(67,0),P(67,VD),P(0,VD)];
    K.zone({name:'신세계백화점 강남점',floor:fl,sub:'화장품 · 향수 · 주얼리',poly:groundZone,y0:0,y1:3.6,priority:1});
    for(const [name,x0,y0,x1,y1]of BEAUTY_CELLS)planCounter(name,planRect(x0,y0,x1,y1));
    for(const [name,x0,y0,x1,y1,face]of EDGE_BOUTIQUES)planBoutique(name,planRect(x0,y0,x1,y1),face);
    for(const [name,px,py]of JEWELLERY){const[u,v]=PLAN(px,py);planCounter(name,[u-.9,v-1.2,u+.9,v+1.2],0,'jewel');}
    planBoutique('젠틀몬스터',planRect(631,947,794,1033),'N');
    // The two plan bands between the escalator banks hold three separately branded pop-ups.
    // No long counter or legacy central well cuts across these event spaces.
    for(const [n,px,py,name,col]of [[1,600,729,'설화수',0xb45a35],[2,458,729,'프라다 뷰티',0x6a8a78],[3,520,797,'다이슨 뷰티',0x63556d]]){
      const[u,v]=PLAN(px,py),r=[u-2.5,v-1.2,u+2.5,v+1.2];
      zone(`${name} 팝업`,fl,'화장품관 중앙 행사',r,0,3,3);
      furnish(fl,()=>{
        hq(...r,.024,{color:col,gloss:.3});
        box(u,v,4.4,1.0,0,.97,{color:col,gloss:.5});box(u,v,4.48,1.06,.97,.07,0xf3e7d4,{solid:false});
        for(const du of[-2.1,2.1])box(u+du,v,.065,.065,0,2.4,col,{solid:false});
        sign(`${name} · 팝업`,u,v,2.30,'N',4.5,.36,{bg:'#f3ecdf',fg:'#4b443a',twoSided:true});
        for(let j=0;j<12;j++){const xx=u-1.8+j*.33;box(xx,v,.16,.16,1.05,.22+j%3*.04,j%2?col:0xd6bd91,{solid:false});box(xx,v-.32,.18,.1,1.05,.025,0xffffff,{solid:false});}
        for(const du of[-.9,.9])beautyPerson(u+du,v+1.0,0,FACE.N,true,n);
        beautyObstacles.push([u-2.4,v-.7,u+2.4,v+1.45]);
      });
    }
    const[infoU,infoV]=PLAN(409,799);box(infoU,infoV,1.4,.9,0,1.02,0xe4d7bb);sign('안내데스크',infoU,infoV-.46,1.35,'N',1.7,.3,{bg:'#3f3830',fg:'#f4e8cc'});
    furnish(fl,()=>{beautyPerson(infoU,infoV+.95,0,FACE.N,true);});
    // Plan edge services, clear of both shared-wall doorways.
    planBoutique('화장실',planRect(877,872,948,987),'N',0,fl,'service');


    furnish(fl,()=>{
      const cream=0xf3eee4;
      // White fluted shafts and Ionic volutes from the supplied 2026 cosmetics photographs.
      for(const[px,py]of[[372,570],[666,571],[372,678],[666,678],[372,769],[666,769],[372,938],[810,770]]){
        const[u,v]=PLAN(px,py);if(BEAUTY_BANK_RECTS.some(r=>inR(u,v,r,.7)))continue;const[x,z]=P(u,v);
        K.cyl({x,z,y:0,r:.58,h:.2,mat:{tex:'marble',color:cream,gloss:.3},seg:20});
        K.cyl({x,z,y:.2,r:.43,h:5.36,mat:cream,seg:24});
        for(let k=0;k<20;k++){const a=k*PI/10,pp=P(u+.43*Math.cos(a),v+.43*Math.sin(a));K.cyl({x:pp[0],z:pp[1],y:.35,r:.042,h:5.04,mat:0xe4ded3,seg:6,solid:false});}
        K.cyl({x,z,y:5.53,r:.55,h:.18,mat:cream,seg:24,solid:false});box(u,v,1.33,1.05,5.71,.19,cream,{solid:false});box(u,v,1.50,1.17,6.03,.22,cream,{solid:false});
        for(const du of[-.48,.48])for(const dv of[-.54,.54])for(let k=0;k<16;k++){
          const a=k*PI/8,b=(k+1)*PI/8,rr=.22,ri=.145;
          const q=[[du+rr*Math.cos(a),5.87+rr*Math.sin(a)],[du+rr*Math.cos(b),5.87+rr*Math.sin(b)],[du+ri*Math.cos(b),5.87+ri*Math.sin(b)],[du+ri*Math.cos(a),5.87+ri*Math.sin(a)]];
          K.quad(cream,q.map(([uu,yy])=>{const p=P(u+uu,v+dv);return[p[0],yy,p[1]];}),[dv<0?-SA:SA,0,dv<0?-CA:CA]);
        }
        if(py===678||py===938){const p=P(u+1.0,v);K.cyl({x:p[0],z:p[1],y:0,r:.48,h:.62,mat:0xc2b39a,seg:16});K.tree(p[0],p[1],{y:.62,h:2.5,kind:'zelkova'});}
      }
      for(let u=16;u<61;u+=6.7)for(let v=12;v<67;v+=7){if(inR(u+2,v+2,ATR,3))continue;coffer(u,v,u+6.2,v+6.5,6.48);for(const du of[.7,5.5])for(const dv of[.7,5.8])downlight(u+du,v+dv,6.43,.065);}
      for(const[txt,u,v,face]of[['2게이트',33.5,5.4,'S'],['1게이트',66.6,42.35,'W'],['3게이트 · 센트럴시티',.6,42.35,'E'],['1게이트 방면 · 호남선 연결',.6,68,'E']]){
        sign(txt,u,v,2.85,face,5.6,.36,{bg:'#39352f',fg:'#eee2c6',bold:false,twoSided:true});
      }
      // Open doors: side glazing only, with a full clear central passage.
      for(const[u,v,face]of[[67,42.35,'W'],[0,42.35,'E'],[0,68,'E']])for(const dv of[-3.6,3.6]){
        box(u,v+dv,.1,.14,0,3.2,0x6c675c);box(u,v+dv*.82,.04,1.05,.1,2.8,'glass',{solid:false});
      }
      // The south promenade is an actual curved inlay, following the guide's jewellery arc.
      for(let i=0;i<36;i++){
        const a=.3+(PI-.6)*i/36,b=.3+(PI-.6)*(i+1)/36;
        const poly=[[510+301*Math.cos(a),944+129*Math.sin(a)],[510+301*Math.cos(b),944+129*Math.sin(b)],[510+304*Math.cos(b),944+132*Math.sin(b)],[510+304*Math.cos(a),944+132*Math.sin(a)]].map(p=>P(...PLAN(...p)));
        K.hpoly({color:0xa38a60,gloss:.5},poly,.025);
      }
    });
    furnish(fl,()=>{
      // Deterministic groups in the real whitespace between plan cells, with the door axes clear.
      // Together with the individually placed staff this gives exactly 204 people on 1F.
      const cells=[...BEAUTY_CELLS.map(c=>planRect(...c.slice(1))),...EDGE_BOUTIQUES.map(c=>planRect(...c.slice(1,5))),...JEWELLERY.map(c=>{const p=PLAN(c[1],c[2]);return[p[0]-1.05,p[1]-1.35,p[0]+1.05,p[1]+1.35];})];
      const rng=K.rand(111026),placed=[],target=Math.max(0,204-beautyStaff);
      const safe=(u,v)=>u>9&&u<64&&v>12&&v<78&&!(u<15&&v<24)&&!(Math.abs(v-42.35)<1.3)&&!(u<14&&Math.abs(v-68)<4.5)&&!BEAUTY_BANK_RECTS.some(r=>inR(u,v,r,1.0))&&!cells.some(r=>inR(u,v,r,.35))&&!beautyObstacles.some(r=>inR(u,v,r,.6))&&!placed.some(p=>Math.hypot(p[0]-u,p[1]-v)<.72);
      let guard=0;
      while(placed.length<target&&guard++<12000){
        const u=10+rng()*53,v=13+rng()*64;if(!safe(u,v))continue;
        const groupSize=1+Math.floor(rng()*3),angle=RA+rng()*PI*2;
        for(let j=0;j<groupSize&&placed.length<target;j++){
          const uu=u+j*.72,vv=v+(j%2)*.4;if(!safe(uu,vv))continue;
          const i=placed.length;placed.push([uu,vv]);beautyPerson(uu,vv,0,angle,false,i,i%3!==0);
        }
      }
    });
  }

  // ================================================================= Shared upper-floor furnishing helpers
  // Upper-photo helpers live inside the upper section so independent 1F edits preserve them.
  function upperBall(u,v,yy,r,mat,ry=r) {
    const [x,z]=P(u,v);K.dome({x,z,y:yy,rx:r,ry,rz:r,seg:10,rings:6,hemi:false,mat});
  }
  function upperCyl(u,v,yy,r,h,mat,solid=false) {
    const [x,z]=P(u,v);K.cyl({x,z,y:yy,r,h,mat,solid,seg:10});
  }
  function upperRetailCeiling(id,y) {
    const v0=UPPER.has(id)?VS+.2:.2, yy=y+3.2;
    const omissions=[ATR,RIGHT_ATR,[19.6,54.8,29.4,59.7],...CORES.map(c=>[c.uL,c.v0,c.uR,c.v1]),[23,0,44,9]];
    const runs=(a0,a1,fixed,horizontal)=>{
      let parts=[[a0,a1]];
      for(const r of omissions){
        const cross=horizontal?[r[1],r[3]]:[r[0],r[2]],cut=horizontal?[r[0],r[2]]:[r[1],r[3]];
        if(fixed<cross[0]-.1||fixed>cross[1]+.1)continue;
        parts=parts.flatMap(([a,b])=>b<=cut[0]||a>=cut[1]?[[a,b]]:[[a,Math.max(a,cut[0])],[Math.min(b,cut[1]),b]].filter(([c,d])=>d-c>.1));
      }return parts;
    };
    // 0.6 m open-cell ceiling grid; never bridge the atrium or stair openings.
    for(let u=.5;u<UW-.5;u+=1.2)for(let v=v0+.3;v<VD-.5;v+=1.2) {
      if(omissions.some(r=>inR(u,v,r,.65)))continue;
      hq(u-.28,v-.28,u+.88,v+.88,yy+.23,(Math.round(u*5+v*5)%3)?0x687074:0x343d41,false);
    }
    for(let v=v0;v<VD-.2;v+=.6)for(const[a,b]of runs(.2,UW-.2,v,true))box((a+b)/2,v,b-a,.035,yy,.22,0x8d9396,{solid:false});
    for(let u=.2;u<UW-.2;u+=.6)for(const[a,b]of runs(v0,VD-.2,u,false))box(u,(a+b)/2,.035,b-a,yy,.22,0x8d9396,{solid:false});
    for(let u=2;u<UW-1;u+=3)for(let v=v0+1.8;v<VD-1;v+=3.6){
      if(omissions.some(r=>inR(u,v,r,.8)))continue;
      box(u,v,.075,1.17,yy+.06,.05,{tex:'emit',color:0xf0f5ff},{solid:false});
      box(u+.10,v,.045,1.18,yy+.05,.10,0xd5d9da,{solid:false});
    }
  }
  function winterCoat(u,v,y,color=0xc4c4bf,front='N',scale=1) {
    const sw=front==='E'||front==='W',b=(a,c,w,d,h,hh,m)=>box(u+(sw?c:a),v+(sw?a:c),sw?d:w,sw?w:d,y+h,hh,m,{solid:false});
    b(0,0,.43*scale,.21*scale,.55*scale,.67*scale,color);
    for(const side of[-1,1]){b(side*.275*scale,.015,.14*scale,.20*scale,.53*scale,.60*scale,color);b(side*.275*scale,.015,.145*scale,.205*scale,.53*scale,.035*scale,0x6e7070);}
    for(let j=0;j<6;j++){
      b(0,-.111*scale,.43*scale,.008,.60*scale+j*.095*scale,.009,0x747776);
      for(const side of[-1,1])b(side*.275*scale,-.09*scale,.14*scale,.009,.58*scale+j*.09*scale,.009,0x7f8281);
    }
    b(0,-.115*scale,.012,.008,.58*scale,.60*scale,0xb6b7b3);
    b(-.105*scale,0,.14*scale,.23*scale,1.22*scale,.12*scale,color);b(.105*scale,0,.14*scale,.23*scale,1.22*scale,.12*scale,color);
    b(0,0,.025,.025,1.34*scale,.12*scale,0x8e9394);
  }
  function coatRack(u,v,y,length=3,face='N',seed=0) {
    const sw=face==='E'||face==='W';box(u,v,sw?.7:length,sw?length:.7,y,.045,0x9c9fa0);
    for(const a of[-length/2+.1,length/2-.1])box(u+(sw?0:a),v+(sw?a:0),.045,.045,y,2.15,0xa5abad,{solid:false});
    box(u,v,sw?.045:length,sw?length:.045,y+2.1,.045,seed%2?0xc46825:0xaab0b2,{solid:false});
    const n=Math.floor(length/.36);
    for(let i=0;i<n;i++){
      const a=-length/2+.22+i*.36,uu=u+(sw?0:a),vv=v+(sw?a:0);
      winterCoat(uu,vv,y+.57,[0xd7d7cf,0xaeb2b2,0x222629,0xe9e5d9,0x828785][(seed+i)%5],face);
      box(uu,vv,.022,.022,y+1.98,.14,0xb5bbbd,{solid:false});
    }
  }
  function upperMannequin(u,v,y,col=0xe7e5dd) {
    box(u,v,.78,.7,y,.08,0x1d2022);
    for(const du of[-.12,.12]){box(u+du,v,.14,.18,y+.13,.79,0xdedbd3,{solid:false});box(u+du,v-.08,.17,.34,y+.09,.11,0xf4f3ed,{solid:false});}
    winterCoat(u,v,y+.28,col,'N',1.1);upperCyl(u,v,y+1.74,.075,.09,0xc5c6c0);upperBall(u,v,y+1.96,.13,0xc4c6c2,.19);upperCyl(u,v,y+2.08,.15,.12,0x797f7e);
  }
  function upperShoe(u,v,y,color=0x202326,scale=1) {
    box(u,v,.19*scale,.34*scale,y,.035*scale,0xafa46c,{solid:false});box(u,v-.045*scale,.18*scale,.27*scale,y+.035*scale,.10*scale,color,{solid:false});
    box(u,v+.06*scale,.14*scale,.15*scale,y+.09*scale,.10*scale,color,{solid:false});
    for(let i=0;i<4;i++)box(u,v-.035*scale+i*.029*scale,.09*scale,.009,y+.142*scale,.009,0xddd8c4,{solid:false});
  }
  // ================================================================= Main-store 1M — accessories / travel / food
  {
    const y=LV['1M'],fl='1M';
    zone('신세계백화점 중층',fl,'액세서리 · 여행 · 식음료',MEZZ,y,LV['2F'],1);
    const units=[
      ['어퍼하우스',394,894,636,970,'N','cafe'],['베키아에누보',638,894,918,970,'N','cafe'],
      ['스킨케어룸',938,421,996,478,'E','service'],['멤버스바',938,480,996,550,'E','cafe'],
      ['비아신세계 트래블 컨시어지',938,553,1036,605,'E','service']
    ];
    for(const[name,x0,y0,x1,y1,face,kind]of units)planBoutique(name,planRect(x0,y0,x1,y1,MPLAN),face,y,fl,kind);
    const jewels=['스톤헨지','제이에스티나','디디에두보','어니스트서울','판도라','에떼르노','장폴클라리쎄','알로드'];
    for(let i=0;i<jewels.length;i++){
      const px=937+(i%2)*48,py=685+Math.floor(i/2)*18,[u,v]=MPLAN(px,py);
      planCounter(jewels[i],[u-.7,v-.7,u+.7,v+.7],y,'jewel',fl);
    }
    const rail=(a,b)=>{
      K.wall(...a,...b,y,y+1.02,{mat:'glass',thick:.045});
      const dx=b[0]-a[0],dz=b[1]-a[1],L=Math.hypot(dx,dz);
      K.box({x:(a[0]+b[0])/2,z:(a[1]+b[1])/2,y:y+1.02,w:.065,d:L,h:.055,rotY:Math.atan2(dx,dz),mat:0xb29d73,solid:false});
    };
    for(let i=0;i<MEZZ_VOID.length;i++)rail(MEZZ_VOID[i],MEZZ_VOID[(i+1)%MEZZ_VOID.length]);
    for(const u of[NW_ESC[0],NW_ESC[2]])wall(u,NW_ESC[1],u,NW_ESC[3],y,y+1.05,{mat:'glass',thick:.04});
    wall(NW_ESC[0],NW_ESC[1],NW_ESC[2],NW_ESC[1],y,y+1.05,{mat:'glass',thick:.04});
    // Finish both the vertical slab edge and underside in warm plaster, with a continuous cove.
    for(let i=0;i<MEZZ_VOID.length;i++) {
      const a=MEZZ_VOID[i],b=MEZZ_VOID[(i+1)%MEZZ_VOID.length],dx=b[0]-a[0],dz=b[1]-a[1],L=Math.hypot(dx,dz),rotY=Math.atan2(dx,dz);
      K.wall(...a,...b,y-TH['1M'],y,{mat:CEIL,thick:.16,solid:false});
      K.box({x:(a[0]+b[0])/2,z:(a[1]+b[1])/2,y:y-TH['1M']-.1,w:.34,d:L,h:.11,rotY,mat:CEIL,solid:false});
      K.box({x:(a[0]+b[0])/2,z:(a[1]+b[1])/2,y:y-.12,w:.04,d:L,h:.035,rotY,mat:{tex:'emit',color:0xffefd3},solid:false});
    }
    // Coffee is served immediately beside the north-west 1M arrival (멤버스바).
    // 베키아에누보 retains its separate southern curved-ring plan cell.
    furnish(fl,()=>{
      function cafeFit(name,u,v,width,depth,face) {
        const east=face==='E',counterU=u+(east?width*.25:0),counterV=v+(east?0:depth*.1);
        box(counterU,counterV,east?.8:Math.min(width-1,5.6),east?Math.min(depth-1,3.8):.85,y,1.04,{tex:'wood',color:0x77503a});
        box(counterU,counterV,east?.89:Math.min(width-.9,5.7),east?Math.min(depth-.9,3.9):.94,y+1.04,.055,{tex:'marble',color:0xece4d7,gloss:.5},{solid:false});
        const mx=counterU,my=counterV+.1;
        box(mx,my,.72,.48,y+1.1,.48,{tex:'metal',color:0xc4c5bf},{solid:false});
        box(mx,my-.25,.68,.05,y+1.17,.22,0x292a29,{solid:false});
        for(const du of[-.23,.23]){box(mx+du,my-.31,.055,.17,y+1.25,.055,0x33332f,{solid:false});box(mx+du,my-.3,.13,.12,y+1.11,.12,0xf5eee3,{solid:false});}
        box(mx+.65,my,.22,.25,y+1.1,.38,0x373a36,{solid:false});
        const p=P(mx+.65,my);K.cyl({x:p[0],z:p[1],y:y+1.48,r:.11,h:.18,mat:'glass',seg:10,solid:false});
        sign(['커피 · 티','아메리카노   라테','에스프레소   디저트'],u-(east?width*.27:0),v+(east?0:depth*.43),y+1.95,face,Math.min(width*.65,3.8),.7,{bg:'#2f352e',fg:'#f6edda',bold:false});
        const staff=P(counterU-(east?.9:0),counterV+(east?0:.9));K.person(staff[0],y,staff[1],{rotY:FACE[face],shirt:0xf1eee6,pants:0x242724});
        const seats=east?[[u+width*.25,v-depth*.34],[u+width*.25,v+depth*.34]]:[[u-width*.3,v-depth*.24],[u,v-depth*.24],[u+width*.3,v-depth*.24]];
        for(const [index,[tu,tv]]of seats.entries()){
          box(tu,tv,.8,.72,y+.73,.055,0x8f6d4b,{solid:false});box(tu,tv,.09,.09,y,.73,0x423c31,{solid:false});
          for(const dd of[-.7,.7]){
            box(tu+dd,tv,.48,.5,y,.44,0x80674d,{solid:false});box(tu+dd,tv+.2,.48,.08,y+.44,.45,0x80674d,{solid:false});
            const pp=P(tu+dd,tv);K.person(pp[0],y,pp[1],{sit:true,rotY:dd>0?FACE.W:FACE.E,shirt:index%2?0xb6977c:0x52636a,pants:0x3d403a});
          }
          const pp=P(tu,tv);K.cyl({x:pp[0],z:pp[1],y:y+.79,r:.075,h:.12,mat:0xf8efe0,seg:8,solid:false});
        }
        sign(name,u+(east?width*.5:0),v+(east?0:-depth*.5),y+2.45,face,Math.min(east?depth*.8:width*.8,7),.38,{bg:'#e7ddcb',fg:'#4f3d2c',bold:false});
      }
      cafeFit('멤버스바',5.6,20.1,4.4,8.7,'E');
      cafeFit('베키아에누보',20.3,79.2,20.6,9.6,'N');
      cafeFit('어퍼하우스',41.1,79.2,17.6,9.6,'N');
      sign('멤버스바 · 커피',9.0,20.7,y+2.15,'E',3.6,.35,{bg:'#665644',fg:'#fff3dd',twoSided:true});
      sign('베키아에누보 · 어퍼하우스 →',11.7,23.4,y+2.15,'N',4.4,.32,{bg:'#eee6d6',fg:'#514638',twoSided:true});
      // Arched openings with bronze balcony rails are photographed above the beauty hall.
      // Segment the curved edge into arcades without replacing the open void with a ceiling.
      for(let i=4;i<mezzVoidPixels.length-3;i+=3){
        const aa=MPLAN(...mezzVoidPixels[i]),bb=MPLAN(...mezzVoidPixels[Math.min(i+3,mezzVoidPixels.length-3)]),a=P(...aa),b=P(...bb);
        const dx=b[0]-a[0],dz=b[1]-a[1],L=Math.hypot(dx,dz);if(L<.8)continue;
        K.cyl({x:a[0],z:a[1],y,r:.14,h:2.78,mat:0xece6d9,seg:12,solid:false});
        const tangent=[dx/L,dz/L],mid=[(a[0]+b[0])/2,(a[1]+b[1])/2],radius=L*.47;
        for(let k=0;k<16;k++){
          const q=k*PI/16,r=(k+1)*PI/16,outer=radius+.13,inner=radius-.03;
          const ps=[[outer,q],[outer,r],[inner,r],[inner,q]].map(([rr,ang])=>[mid[0]+tangent[0]*rr*Math.cos(ang),y+1.62+.9*Math.sin(ang),mid[1]+tangent[1]*rr*Math.cos(ang)]);
          K.quad(0xeee8dd,ps,[-tangent[1],0,tangent[0]]);K.quad(0xeee8dd,ps.slice().reverse(),[tangent[1],0,-tangent[0]]);
        }
        for(let j=1;j<Math.floor(L/.24);j++){const f=j/Math.floor(L/.24);K.cyl({x:a[0]+dx*f,z:a[1]+dz*f,y:y+.12,r:.014,h:.81,mat:0x6f6859,seg:6,solid:false});}
      }
      for(let u=2;u<65;u+=4)for(let v=3;v<83;v+=4){const p=P(u,v);if(K.pointInPoly(...p,MEZZ_VOID)||inR(u,v,NW_ESC,.5))continue;downlight(u,v,6.45,.065);}
      sign('1M · 액세서리 · 여행 · 식음료',13.2,10.5,y+2.25,'S',5.2,.36,{bg:'#ded5c4',fg:'#534737',bold:false});
      sign('센트럴시티 중층 →',2.5,39.25,y+2.25,'E',4.2,.35,{bg:'#ded5c4',fg:'#534737',bold:false});
    });
  }

  // ================================================================= Round 14 official upper floors
  const upperCells = new Map();
  const upperRect=(id,r)=>{const a=upperPlanPoint(id,r[0],r[1]),b=upperPlanPoint(id,r[2],r[3]);return [b[0],a[1],a[0],b[1]];};
  const upperFace={N:'E',S:'W',E:'S',W:'N'};
  // Retained ground arrivals and the existing emergency cores are hard constraints.
  // Every cut is recorded as a schematic-registration exception, never a new tenant.
  const upperKeepClear=id=>[
    ...(id==='11F'?[]:[[26.7,34.1,40.3,47.9]]),
    [26.6,76.1,40.4,80.7], [19.6,54.8,29.4,59.7],
    ...CORES.map(c=>[c.uL-.7,c.v0-.6,c.uR+.2,c.v1+.6]),
    ...(id==='2F'?[[0,0,6.3,8.1],[0,72.6,7.5,77.5],...BEAUTY_BANKS.map(v=>[BANK_U0-1,v-2.8,BANK_U1+1,v+1])]:[]),
  ];
  function cutRect(r,c) {
    const [a,b,d,e]=r,[x,z,X,Z]=c;
    if(X<=a||x>=d||Z<=b||z>=e)return[r];
    return [[a,b,Math.min(d,x),e],[Math.max(a,X),b,d,e],[Math.max(a,x),b,Math.min(d,X),Math.min(e,z)],[Math.max(a,x),Math.max(b,Z),Math.min(d,X),e]].filter(q=>q[2]-q[0]>.55&&q[3]-q[1]>.55);
  }
  // An open shop face stays on its official white aisle. Stock is bounded to its cell.
  function buildUpperCell(id,c) {
    const y=LV[id],H=Math.min(3.4,clearH(id)),r=upperRect(id,c.rect);
    const [px,py,pX,pY]=c.rect,guide=upperGuidePlans[id];
    const edgePoint=(f,t)=>f==='N'?[px+(pX-px)*t,py-5]:f==='S'?[px+(pX-px)*t,pY+5]:f==='W'?[px-5,py+(pY-py)*t]:[pX+5,py+(pY-py)*t];
    const score=f=>[.25,.5,.75].filter(t=>{const[a,b]=edgePoint(f,t);return a>27&&a<1775&&b>guide.top&&b<guide.bottom&&!guide.cells.some(o=>o!==c&&a>o.rect[0]&&a<o.rect[2]&&b>o.rect[1]&&b<o.rect[3]);}).length;
    const frontOverrides={'3F:PSR 컨시어지':'S','3F:트리니티 라운지':'N','6F:블런드스톤':'E','9F:가게나우/스메그':'S','10F:토박스':'S','10F:트래드후스':'S','10F:컴프프로':'S'};
    const preferred=c.face,sourceFace=frontOverrides[`${id}:${c.name}`]||['N','S','E','W'].reduce((a,b)=>score(b)>score(a)?b:a,preferred),face=upperFace[sourceFace];
    let parts=[r];for(const clear of upperKeepClear(id))parts=parts.flatMap(p=>cutRect(p,clear));
    c.model={local:r,parts,face};
    upperCells.set(`${id}:${c.name}`,{...c,local:r,parts,face});
    zone(c.name,id,`${id} · 신세계백화점 강남점`,r,y,y+H,3);
    for(const q of parts){
      const [a,b,d,e]=q;
      const edges=[['N',a,b,d,b],['S',a,e,d,e],['W',a,b,a,e],['E',d,b,d,e]];
      // Islands have open perimeter displays, so all white passages remain permeable.
      // Rear dividers are confined to the actual grey cells and never span a corridor.
      for(const [f,u0,v0,u1,v1]of edges)if(f!==face&&((f==='N'&&Math.abs(b-r[1])<.01)||(f==='S'&&Math.abs(e-r[3])<.01)||(f==='W'&&Math.abs(a-r[0])<.01)||(f==='E'&&Math.abs(d-r[2])<.01)))
        wall(u0+(f==='W'?.18:f==='E'?-.18:0),v0+(f==='N'?.18:f==='S'?-.18:0),u1+(f==='W'?.18:f==='E'?-.18:0),v1+(f==='N'?.18:f==='S'?-.18:0),y,y+((id==='2F'||id==='11F')?H:.12),{mat:0xe7e1d6,thick:.08,solid:id==='2F'||id==='11F'});
    }
  }
  // Second official escalator group in the new wing, one pair at every level.
  // Direction alternates by floor, preserving unobstructed end landings.
  const rightEscFloors=['2F','3F','4F','5F','6F','7F','8F','9F','10F','11F'];
  rightEscFloors.slice(0,-1).forEach((id,i)=>{
    const next=rightEscFloors[i+1],rev=i%2,u0=rev?RIGHT_ATR[2]:RIGHT_ATR[0],u1=rev?RIGHT_ATR[0]:RIGHT_ATR[2];
    for(const [v,dir]of[[77.4,'up'],[79.0,'down']]){
      const a=P(u0,v),b=P(u1,v);K.escalator(...a,...b,{ya:LV[id],yb:LV[next],w:1.2,dir,speed:.6,sideMat:0xe6e0d3,truss:0xaaaead});
    }
  });
  for(const [i,id]of rightEscFloors.entries()){
    const y=LV[id];
    for(const v of [RIGHT_ATR[1],RIGHT_ATR[3]])wall(RIGHT_ATR[0],v,RIGHT_ATR[2],v,y,y+1.05,{mat:'glass',thick:.04});
    for(const u of [RIGHT_ATR[0],RIGHT_ATR[2]]){
      // Both ends are arrivals or departures; only short corner returns are guarded.
      for(const [a,b]of[[76.5,76.65],[79.75,80.3]])wall(u,a,u,b,y,y+1.05,{mat:'glass',thick:.04});
    }
    zone('신관 에스컬레이터',id,'층별 매장 · 식당가',[26.6,75.5,40.4,81.3],y,y+3,2);
  }
  const upperCats={
    '2F':'해외유명브랜드','3F':'인터내셔널 디자이너 · 럭셔리 워치&주얼리 · 신세계갤러리',
    '4F':'해외 컨템포러리 · 슈즈','5F':'여성 클래식 · 뉴 컨템포러리 · 핸드백',
    '6F':'남성 부티크','7F':'골프 · 남성 캐주얼 · 남성 컨템포러리 · 남성 정장',
    '8F':'뉴 스트리트 · 베이직 스포츠 · 스포츠 · 아웃도어','9F':'생활 · 가구 · 홈패션 · 가전 · 키친웨어',
    '10F':'리틀 신세계 · 아동 · 유아 · 란제리','11F':'S GARDEN · 전문식당가',
  };
  for(const [id,guide]of Object.entries(upperGuidePlans)){
    const y=LV[id];zone('신세계백화점 강남점',id,upperCats[id],[0,0,UW,VD],y,LV[nextOf(id)],1);
    for(const c of guide.cells)buildUpperCell(id,c);
    zone('본관 · 신관 연결통로',id,'층별 매장 · 엘리베이터',[29.6,55.4,44.8,60.2],y,y+3.5,2);
    zone('고객 엘리베이터',id,'본관 · 신관 연결부',[19.6,54.8,29.4,59.7],y,y+3.4,2);
  }
  zone('S GARDEN','11F','옥상 정원',[0,0,UW,56.5],LV['11F'],LV.RF+3,2);
  // Official 11F has no left-wing void: the final main-wing opening is at 10F.
  // The right-wing bank is the walkable connection to the 11F dining corridor.


  // Official service icons identify an entrance, not the unseen room behind it.
  // These trims, text panels and HUD zones add no collision walls or floor surfaces.
  for(const service of upperServicePoints){
    const {floor,name,pixel,face}=service,[u,v]=upperPlanPoint(floor,...pixel),y=LV[floor],f=upperFace[face];
    zone(name,floor,'고객 편의시설',[Math.max(.1,u-.7),Math.max(.1,v-.45),Math.min(UW-.1,u+.7),Math.min(VD-.1,v+.45)],y,y+2.8,4);
    furnish(floor,()=>{
      const along=f==='N'||f==='S';
      for(const offset of[-.52,.52])box(u+(along?offset:0),v+(along?0:offset),.055,.055,y,.0+2.25,0x9d9587,{solid:false});
      box(u,v,along?1.1:.065,along?.065:1.1,y+2.25,.065,0x9d9587,{solid:false});
      sign(name,u,v,y+2.58,f,1.75,.45,{bg:'#34332f',fg:'#f3eee3',bold:false,twoSided:true});
    });
  }

  // ------------------------------------------------------------ walk-derived upper finishes
  // All grey-cell fitting is deferred; permanent partitions/holes above stay eager.
  let upperSeed=0;
  function fitUpperCell(id,c) {
    const {parts,face}=c.model,y=LV[id],H=Math.min(3.4,clearH(id)),seed=upperSeed++;
    const largest=parts.reduce((a,b)=>(b[2]-b[0])*(b[3]-b[1])>(a[2]-a[0])*(a[3]-a[1])?b:a,parts[0]||[0,0,0,0]);
    for(const q of parts){
      const [u0,v0,u1,v1]=q,along=face==='N'||face==='S',Wf=along?u1-u0:v1-v0,Dp=along?v1-v0:u1-u0;
      if(Wf<.65||Dp<.65)continue;
      const ST=(a,b)=>face==='S'?[u0+a,v1-b]:face==='N'?[u1-a,v0+b]:face==='E'?[u1-b,v1-a]:[u0+b,v0+a];
      const fb=(a,b,w,d,yy,h,mat,o={})=>{
        if(w<=0||d<=0||h<=0)return;
        const [u,v]=ST(a,b),uw=along?w:d,vd=along?d:w;
        const r=[Math.max(u0+.16,u-uw/2),Math.max(v0+.16,v-vd/2),Math.min(u1-.16,u+uw/2),Math.min(v1-.16,v+vd/2)];
        if(r[2]-r[0]<.025||r[3]-r[1]<.025)return;
        // One continuous 1.1 m entrance-to-display aisle inside each shop.
        if(o.solid!==false&&yy<y+1.9&&Math.abs(a-Wf/2)<w/2+.55&&b-d/2<Math.min(Dp-.7,2.3))return;
        box((r[0]+r[2])/2,(r[1]+r[3])/2,r[2]-r[0],r[3]-r[1],yy,h,mat,o);
      };
      const fsign=(text,a,b,yy,w,h,o)=>{const[u,v]=ST(a,b);sign(text,u,v,yy,face,Math.min(Math.max(.4,Wf-.25),w),h,o);};
      const person=(a,b,o)=>{if(a<.4||a>Wf-.4||b<.4||b>Dp-.4)return;const[u,v]=ST(a,b),[x,z]=P(u,v);K.person(x,y,z,o);};
      const fwall=()=>{};
      const finish=c.kind==='lux'?{tex:'wood',color:0xd9c3a5}:c.kind==='rest'||c.kind==='cafe'?{tex:'wood',color:0xbfa88c}:c.kind==='home'?{tex:'wood',color:0xd2c4ac}:null;
      if(finish)hq(u0+.15,v0+.15,u1-.15,v1-.15,y+.015,finish);
      const special=id==='8F'&&['K2','르꼬끄','닥터마틴'].includes(c.name);
      if(!special){
        const kind=c.kind==='toy'?'kid':c.kind;
        (FIXTURES[kind]||FIXTURES.fashion)({Wf,Dp,y,H,fb,fsign,fwall,person,r:rnd,seed,name:c.name,koName:c.name});
      }
      if(q===largest){
        const dark=c.name==='몽클레르'||c.name==='프리스비 (애플)',portal=id==='2F';
        if(portal){
          const mat=dark?0x181b19:c.name==='펜디'?{tex:'marble',color:0xf5f4ed,gloss:.5}:0xe8e2d7;
          for(const a of [.19,Wf-.19])fb(a,.25,.26,.35,y,H,mat,{solid:false});
          fb(Wf/2,.25,Wf,.35,y+2.85,.55,mat,{solid:false});
          if(c.name==='루이비통')for(let a=.4;a<Wf-.3;a+=.32)for(let h=.2;h<2.7;h+=.35){
            if(Math.abs(a-Wf/2)<.8)continue;fb(a,.04,.17,.04,y+h,.17,0xe4d9c9,{solid:false});
          }
        }
        fsign(c.name,Wf/2,.05,y+Math.min(2.65,H-.3),Math.max(.5,Wf-.4),Math.min(.42,.15+Wf*.06),{bg:dark?'#171c19':portal?'#e9e4d9':null,fg:dark?'#d5dfcd':'#302c27',bold:false,twoSided:true});
        if(c.kind==='toy'){
          for(let i=0;i<8;i++)fb(.45+i*(Wf-.9)/8,Dp-.45,.25,.28,y+.95,.22,[0xe5332d,0xe2bc36,0x4382a8,0x65a15c][i%4],{solid:false});
        }
      }
    }
  }
  for(const [id,guide]of Object.entries(upperGuidePlans))furnish(id,()=>{
    const y=LV[id],H=clearH(id);
    for(const c of guide.cells)fitUpperCell(id,c);
    // Bright ivory corridors on 2F; beige columns and glass rails at the atrium.
    if(id==='2F'||id==='3F'){
      for(const [u,v]of(id==='2F'?[[25.6,47],[41.4,47]]:[[25.6,35],[41.4,35],[25.6,47],[41.4,47]]))box(u,v,.65,.65,y,H,{tex:'marble',color:0xe9dfcf});
      for(const [a,b,v]of[[25,42,33],[25,42,49],[30,44,57]]){
        box((a+b)/2,v,b-a,.08,y+H-.1,.06,0x272724,{solid:false});
        for(let u=a+1;u<b;u+=3)downlight(u,v-.4,y+H-.02,.11);
      }
      for(const u of [22.9,44.1]){
        box(u,41,.08,8,y+.08,2.5,0x302c25,{solid:false});
        sign('신세계 강남점',u+(u<30?.06:-.06),41,y+1.35,u<30?'E':'W',1.1,2.2,{bg:u<30?'#8e6953':'#465f74',fg:'#eee7d9'});
      }
    }else if(id!=='11F')upperRetailCeiling(id,y);
    if(id!=='11F')lights(y+H-.04,[RIGHT_ATR],7);
    sign([`${id} ${upperCats[id]}`,'본관 ↔ 신관'],39.8,57.4,y+2.8,'N',5,.5,{bg:'#f1e9da',fg:'#4d4133',twoSided:true});
    sign('엘리베이터',24.5,56.2,y+2.55,'N',2.8,.32,{bg:'#36322b',fg:'#e3ceb1'});
    sign(`${id} · 에스컬레이터`,33.5,75.9,y+2.3,'N',2.5,.32,{bg:'#35332d',fg:'#f0e7d4'});
  });

  // Retain the photographed K2, le coq and Dr. Martens objects, relocated to their
  // official 8F cells. The entire original fixture compositions are transformed.
  function inOfficialCell(name,source,draw) {
    const cell=upperCells.get(`8F:${name}`);if(!cell||!cell.parts.length)return;
    const target=cell.parts.reduce((a,b)=>(b[2]-b[0])*(b[3]-b[1])>(a[2]-a[0])*(a[3]-a[1])?b:a);
    const su=(target[2]-target[0]-.45)/(source[2]-source[0]),sv=(target[3]-target[1]-.45)/(source[3]-source[1]),ss=Math.min(su,sv);
    const T=(u,v)=>[target[0]+.225+(u-source[0])*su,target[1]+.225+(v-source[1])*sv];
    const tb=(u,v,w,d,yy,h,mat,o)=>box(...T(u,v),w*su,d*sv,yy,h,mat,o);
    const th=(a,b,c,d,yy,mat,up)=>hq(...T(a,b),...T(c,d),yy,mat,up);
    const ts=(text,u,v,yy,face,w,h,o)=>sign(text,...T(u,v),yy,face,w*(face==='N'||face==='S'?su:sv),h,o);
    const tw=(a,b,c,d,ya,yb,o)=>wall(...T(a,b),...T(c,d),ya,yb,o);
    const tp=(u,v)=>P(...T(u,v));
    const tr=(a,b,c,d)=>rect(...T(a,b),...T(c,d));
    const tc=(u,v,yy,r,h,m,solid)=>upperCyl(...T(u,v),yy,r*ss,h,m,solid);
    const tball=(u,v,yy,r,m,ry)=>upperBall(...T(u,v),yy,r*ss,m,ry);
    const tshoe=(u,v,yy,color,scale=1)=>upperShoe(...T(u,v),yy,color,scale*ss);
    const tm=(u,v,yy,col)=>upperMannequin(...T(u,v),yy,col);
    const tcoat=(u,v,yy,l,face,seed)=>coatRack(...T(u,v),yy,l*(face==='E'||face==='W'?sv:su),face,seed);
    draw({box:tb,hq:th,sign:ts,wall:tw,P:tp,rect:tr,upperCyl:tc,upperBall:tball,upperShoe:tshoe,upperMannequin:tm,coatRack:tcoat},LV['8F']);
  }

  furnish('8F',()=>{
    inOfficialCell('K2',[43.2,15,54.5,28],(f,y)=>{
      const {box,hq,sign,wall,P,rect,upperCyl,upperBall,upperShoe,upperMannequin,coatRack}=f,H=3.2;
        hq(43.2,15,54.45,28,y+.02,'ssg_upper_tile');
        box(54.36,21.5,.08,10,y+2.1,.75,0x6f787d,{solid:false});
        sign('K2',54.24,21.5,y+2.55,'W',1.8,.64,{bg:null,fg:'#8ed0ea',bold:true});
        for(let v=16;v<27;v+=1.2){box(54.29,v,.05,.035,y,3.14,0xadb4b6,{solid:false});}
        box(54.25,21.5,.04,10.5,y+1.96,.04,{tex:'emit',color:0xd9eff4},{solid:false});
        for(let j=0;j<3;j++)coatRack(46+j*3,21.5,y,3,'W',j+1);
        coatRack(53.6,17.6,y,3,'W',7);coatRack(53.6,25.4,y,3,'W',2);
        box(45.95,21.5,.73,3.05,y+.05,.015,0xa53c16,{solid:false});
        for(let j=0;j<2;j++)for(let i=0;i<5;i++)upperShoe(53.7,16.6+i*.42,y+.12+j*.34,0xe4e1d7);
        box(54.3,26.8,.09,1.1,y+.52,1.72,0x121b20,{solid:false});
        sign(['K2','아웃도어'],54.2,26.8,y+1.38,'W',1.02,1.5,{bg:'#203b4b',fg:'#8acbe3',bold:true});
        const [x,z]=P(48.4,25.1);K.person(x,y,z,{shirt:0x2e383b,rotY:FACE.W});

    });
    inOfficialCell('르꼬끄',[27.5,21.5,39.2,31.5],(f,y)=>{
      const {box,hq,sign,wall,P,rect,upperCyl,upperBall,upperShoe,upperMannequin,coatRack}=f,H=3.2;
        // 09/10: curved ivory promotion plinth, paired boots, padded mannequins.
        const plinth=[];
        for(let i=0;i<=12;i++){const u=29.3+i*.43;plinth.push(P(u,27.0+.25*Math.sin(i*PI/6)));}
        for(let i=12;i>=0;i--){const u=29.3+i*.43;plinth.push(P(u,28.2+.15*Math.cos(i*PI/6)));}
        K.prism(plinth,y+.08,y+.48,{mat:0xe8e5dc,solid:true});
        hq(28.6,26.4,35.4,29.1,y+.012,0x242a2e);
        sign('MIGNON',31.9,28.40,y+.82,'S',2.2,.44,{bg:null,fg:'#242222',bold:true});
        sign('le coq sportif',32,29.10,y+.17,'S',2.3,.21,{bg:'#242a2e',fg:'#f3f1eb',bold:true});
        for(const [u,v] of [[30.3,27.5],[31.5,27.5],[32.7,27.5],[33.8,27.5]])upperShoe(u,v,y+.49,0xa39b8f,1.7);
        for(const u of [30.5,32.4]) {
          upperCyl(u,28.1,y+.48,.36,.72,0x493a30);box(u,27.78,.6,.8,y+.49,.35,0x493a30,{solid:false});
          for(let i=0;i<7;i++)box(u,27.55,.39,.02,y+.68+i*.065,.025,0x7d6957,{solid:false});
        }
        upperMannequin(28,27.9,y,0xe8e5dc);upperMannequin(36.5,28.0,y,0x343632);
        coatRack(29.3,23.7,y,3.5,'N',4);coatRack(35,23.7,y,3.5,'N',1);
        box(38.6,24.1,.1,5.7,y,2.8,0x1b2327,{solid:false});
        for(let v=21.5;v<26.9;v+=.25)box(38.51,v,.035,.025,y,2.75,0x778183,{solid:false});
        for(let yy=.1;yy<2.8;yy+=.25)box(38.50,24.1,.035,5.6,y+yy,.025,0x778183,{solid:false});
        sign('le coq sportif',38.44,24.1,y+2.45,'W',2.4,.33,{bg:'#1f2729',fg:'#ffffff',bold:true});
        box(27.7,23.5,1.6,.12,y,2.8,0x163851,{solid:false});sign(['le coq sportif','겨울 컬렉션'],27.7,23.62,y+1.5,'S',1.4,2.4,{bg:'#477795',fg:'#e5f3f7',bold:false});

    });
    inOfficialCell('닥터마틴',[40.2,39,44.8,46.8],(f,y)=>{
      const {box,hq,sign,wall,P,rect,upperCyl,upperBall,upperShoe,upperMannequin,coatRack}=f,H=3.2;
        // 11/12: open mesh and yellow shelves; escalators remain visible behind it.
        box(41.7,43.9,1.7,.12,y,2.35,0x1c2022,{solid:false});
        for(const u of [42.76,44.53])box(u,43.78,.045,.055,y,2.4,0x202729,{solid:false});
        for(const yy of [0,2.36])box(43.65,43.78,1.82,.055,y+yy,.045,0x202729,{solid:false});
        sign('Dr. Martens',41.7,43.78,y+1.94,'N',1.5,.33,{bg:null,fg:'#ffe027',bold:true});
        for(let u=42.8;u<44.5;u+=.16)box(u,43.75,.016,.025,y+.2,2.15,0x737a78,{solid:false});
        for(let yy=.2;yy<2.35;yy+=.16)box(43.65,43.73,1.7,.025,y+yy,.016,0x737a78,{solid:false});
        for(let i=0;i<4;i++){
          const yy=y+.40+i*.46;box(43.6,43.50,.65,.38,yy,.035,0xffd521,{solid:false});
          upperShoe(43.6,43.44,yy+.04,0x161b1a,1.3);
        }
        for(const [u,v,h]of[[41.3,42.8,.6],[42.3,42.9,.92]]){
          box(u,v,.65,.65,y,h,0x22282a);for(let z=v-.3;z<=v+.3;z+=.12)box(u,z,.66,.018,y+h,.025,0xb6bfbb,{solid:false});upperShoe(u,v,y+h+.04,0x191c1b,1.5);
        }
        upperCyl(43.2,41.9,y,.39,.64,0x23292b);upperCyl(43.2,41.9,y+.64,.40,.035,0xffd922);
        sign('Dr. Martens',43.2,41.50,y+.42,'N',.65,.19,{bg:null,fg:'#ffe32a'});upperShoe(43.2,41.9,y+.68,0x202321,1.5);
        upperMannequin(40.6,45.8,y,0xd6d9d3);

    });
  });

  furnish('11F',()=>{
    const y=LV['11F'];
    // 2026 newsroom walk: an open rooftop garden, white arches, dichroic panes,
    // hydrangeas and a visitor photographing the installation. Placement is inferred.
    hq(.8,.8,66.2,56.4,y+.012,{tex:'tile',color:0xd8d4c9,gloss:.3});
    for(const [a,b,c,d]of[[5,8,15,26],[48,12,60,31],[7,42,20,49]]){
      boxR(a,b,c,d,y,.3,0xc9c5b9);hq(a+.15,b+.15,c-.15,d-.15,y+.31,{tex:'grass',color:0x5a7152});
      for(let u=a+.8;u<c-.5;u+=1.4)for(let v=b+.8;v<d-.5;v+=1.9){
        upperBall(u,v,y+.65,.45,0x54724b,.35);
        for(let k=0;k<5;k++){const a=k*PI*2/5;upperBall(u+Math.cos(a)*.23,v+Math.sin(a)*.23,y+.95,.21,k%3?0xf0eee4:0xb7bfd6,.18);}
      }
    }
    const W=(u,v,h)=>{const[x,z]=P(u,v);return[x,y+h,z];};
    const frameMat=0xf2f1e9,colors=[0xe7b3c7,0xd0c287,0x98c6b2,0xb5b4d5];
    for(let j=0;j<7;j++){
      const v=20+j*2.4;
      for(const u of [25,31])upperCyl(u,v,y,.055,2.4,frameMat);
      for(let i=0;i<16;i++){
        const a=i*PI/16,b=(i+1)*PI/16;
        const points=[W(28+3*Math.cos(a),v,2.4+1.65*Math.sin(a)),W(28+3*Math.cos(b),v,2.4+1.65*Math.sin(b)),W(28+3*Math.cos(b),v,2.49+1.65*Math.sin(b)),W(28+3*Math.cos(a),v,2.49+1.65*Math.sin(a))];
        K.quad(frameMat,points,[SA,0,CA]);K.quad(frameMat,[...points].reverse(),[-SA,0,-CA]);
        if(j<6&&i%2===0){
          const pane=[W(28+2.96*Math.cos(a),v+.08,2.42+1.61*Math.sin(a)),W(28+2.96*Math.cos(b),v+.08,2.42+1.61*Math.sin(b)),W(28+2.96*Math.cos(b),v+2.32,2.42+1.61*Math.sin(b)),W(28+2.96*Math.cos(a),v+2.32,2.42+1.61*Math.sin(a))];
          K.quad({tex:'glass',color:colors[(i+j)%4]},pane,[0,1,0]);
        }
      }
    }
    for(const u of [25,28,31])box(u,27.2,.06,14.4,y+2.4,.06,frameMat,{solid:false});
    for(let i=0;i<18;i++){
      const u=25.5+(i%6),v=21+Math.floor(i/6)*4.8;
      box(u,v,.018,.018,y+2.35,.75,0xddddcf,{solid:false});
      const a=W(u-.12,v,2.32),b=W(u+.12,v,2.56),c=W(u+.10,v,2.12),d=W(u-.10,v,1.97);
      K.quad({tex:'glass',color:colors[i%4]},[a,b,c,d],[SA,0,CA]);
    }
    for(const [u,v]of[[22,15],[37,20],[37,34],[30,46]]){
      box(u,v,2.4,.62,y,.45,{tex:'wood',color:0xa89272});box(u,v+.26,2.4,.10,y+.45,.5,{tex:'wood',color:0xa89272},{solid:false});
    }
    sign(['S GARDEN','에스 가든'],40,53.5,y+1.5,'S',3,.65,{bg:'#e3e0d4',fg:'#475745',bold:false});
    const[x,z]=P(35,26);K.person(x,y,z,{shirt:0xc3b5a1,rotY:FACE.W});
    const[a,b]=P(30.6,46);K.person(a,y,b,{shirt:0x59645c,sit:true});
    // Dining wing finishes are quiet cream stone; restaurant furnishing remains
    // generic because the walk has no usable 11F interior frame.
    for(const v of [62,70,83])for(const u of [12,24,44,56])downlight(u,v,y+4.05,.13);
    sign(['11F 전문식당가','화니 · 평양면옥 · 밀화','더 키친 일 포노 · 살롱드호우섬','꼴라주 · 카테고릭 · 호경전 · 히바린 · 키사라'],42,60.5,y+1.6,'N',4,1.2,{bg:'#e9e0cd',fg:'#463b2e',bold:false});
  });
  // ================================================================= J1: 고투몰 ↔ 신세계 B1 연결통로 (owner)
  {
    const y = LV.B1, top = -2.6;
    const gZ = x => -93.2 - 0.3984 * (x + 53.5);   // GOTO south wall line
    const sZ = x => -24.31 - 0.3797 * (x + 107.07); // 신세계 north wall line
    const env = [[-79, gZ(-79)], [-61, gZ(-61)], [-61, sZ(-61)], [-79, sZ(-79)]];
    K.slab(env, y, { mat: 'ssg_marble', thick: 0.4, edge: false, under: false });
    K.hpoly(CEIL, env, top, false);
    K.phys.addCeiling(env, top, {});
    // side walls
    K.wall(-79, gZ(-79), -79, sZ(-79), y, top, { mat: 0xe9e4da, thick: 0.25 });
    K.wall(-61, gZ(-61), -61, sZ(-61), y, top, { mat: 0xe9e4da, thick: 0.25 });
    // end walls beside the 8 m GOTO opening (GOTO's own wall may also be there)
    K.wall(-79, gZ(-79) + 0.3, -74, gZ(-74) + 0.3, y, top, { mat: 0xe9e4da, thick: 0.2 });
    K.wall(-66, gZ(-66) + 0.3, -61, gZ(-61) + 0.3, y, top, { mat: 0xe9e4da, thick: 0.2 });
    // Round12: no tenant cells are shown in this connector in the supplied official plan.
    // Remove the seven unverified category shopfronts; retain the completeJ1 passage.
    for (const x of [-74.3, -65.7]) {
      K.box({ x, y: top - 0.2, z: -61.5, w: 0.24, h: 0.18, d: 43, mat: CEIL, solid: false });
      K.hpoly(0x8b7862, [[x - 0.07, -84], [x + 0.07, -84], [x + 0.07, -39], [x - 0.07, -39]], y + 0.015);
    }
    K.sign(['신세계 식품관 →', '스위트파크 · 신세계 마켓'], { x: -74.5, y: y + 1.6, z: -84, w: 3.6, h: 0.55, rotY: PI / 2, bg: '#e4d7c2', fg: '#544536' });
    K.sign('← 고투몰 · 고속터미널역', { x: -65.5, y: y + 1.6, z: -42, w: 3.6, h: 0.4, rotY: -PI / 2, bg: '#e4d7c2', fg: '#544536' });
    for (let z = -84; z < -39; z += 4.5) for (const x of [-72, -68]) {
      K.cyl({ x, y: top - 0.04, z, r: 0.18, h: 0.03, seg: 10, mat: 0x9c8b70, solid: false });
      const disc = Array.from({ length: 10 }, (_, i) => [x + Math.cos(i * PI / 5) * 0.14, z + Math.sin(i * PI / 5) * 0.14]);
      K.hpoly({ tex: 'emit', color: 0xffefd4 }, disc, top - 0.045, false);
    }
    K.zone({ name: '신세계 강남점 연결통로', floor: 'B1', sub: '고투몰(강남터미널 지하쇼핑몰) ↔ 신세계 식품관', poly: env, y0: y, y1: top, priority: 2 });
    K.crowd([[-73.5, -84], [-66.5, -86.5], [-66.5, -42], [-73.5, -39]], y, 14, { seed: 4141 });
  }

  // ================================================================= spawns
  const sp = (name, u, v, y, du, dv) => { const [x, z] = P(u, v); K.spawn({ name, x, y, z, yaw: yawTo(du, dv) }); };
  sp('신세계 강남점 정문 (신반포로)', ENTRY, -9, 0, 0, 1);
  sp('신세계 강남점 동문 (경부선 터미널 방면)', UW + 1.2, 30, 0, -1, 0);
  sp('1F 화장품 · 주얼리', 43.5, 42.5, 0, -.3, -1);
  sp('1M 액세서리 · 여행 · 식음료', 10.6, 21.3, LV['1M'], -1, 0);




  sp('8F 겨울 매장 · 에스컬레이터', 40.8, 49.2, LV['8F'], 1, 0);
  sp('4F 그랜드 슈', 41.2, 41, LV['4F'], 0, 1);
  sp('11F 전문식당가 · S GARDEN', 26, 49.5, LV['11F'], 1, 0);
  for(const id of Object.keys(upperGuidePlans))sp(`${id} ${upperCats[id]}`,24.5,56.2,LV[id],0,-1);
  K.spawn({ name: 'B1 고투몰 ↔ 신세계 연결통로', x: -70, y: LV.B1, z: -70, yaw: PI });
}


// Round 14: official grey cells, transcribed in the original raster coordinates.
// The sheet is rotated into the retained OSM rectangle: x -> v, y -> -u.
// Its scale is deliberately nonuniform around the existing atrium; see research.
export const upperGuidePlans = {};
{
  let p;
  const start=(id,well,top=445,bottom=1140,kind='fashion')=>{p={id,well,top,bottom,kind,cells:[]};upperGuidePlans[id]=p;};
  const c=(name,x0,y0,x1,y1,face='S',kind=p.kind)=>p.cells.push({name,rect:[x0,y0,x1,y1],face,kind});
  const r=(xs,y0,y1,names,face='S',kind=p.kind)=>names.split('|').forEach((name,i)=>c(name,xs[i],y0,xs[i+1],y1,face,kind));
  start('2F',[398,673,627,757],370,1127,'lux');
  c('모이나',27,463,165,569,'E');c('입점 준비 중',27,570,148,646,'E','popup');
  c('입점 준비 중',182,400,486,526,'S','popup');c('구찌',487,400,629,526);c('루이비통 주얼리',630,463,821,526,'S','jewel');
  c('펜디',54,647,148,732,'E');c('몽클레르',28,733,148,938,'E');
  c('프라다',179,555,342,691,'W');c('구찌',372,555,627,618);c('루이비통',658,555,964,683,'S');c('루이비통',821,493,964,555,'W');
  c('버버리 여성',179,734,342,875,'W');c('셀린느',372,811,627,876,'N');
  r([658,740,820],734,876,'발렌시아가|생 로랑','N');c('보테가 베네타',853,744,968,877,'W');c('헬렌카민스키',917,710,986,744,'N','fashion');
  c('로로피아나',179,907,469,1000,'N');c('그라프',532,907,787,968,'N','jewel');
  c('샤넬',1061,370,1259,683,'E');c('샤넬',1259,370,1412,464,'S');c('반클리프 아펠',1412,370,1689,464,'S','jewel');
  c('고야드',1301,493,1438,683,'W');c('에르메스',1477,493,1622,652,'E');c('에르메스',1477,817,1622,995,'E');
  c('불가리',1658,463,1734,730,'W','jewel');c('디올',1143,745,1263,1127,'E');c('디올',1061,900,1143,1127,'E');
  c('미우미우',1301,721,1438,863,'W');c('델보',1301,865,1438,995,'W');c('까르띠에',1264,1026,1592,1127,'N','jewel');c('티파니앤코',1658,783,1734,1127,'W','jewel');
  start('3F',[367,767,600,830],462,1140,'lux');
  r([179,338,415,490,615,802],551,614,'막스마라|브루넬로 쿠치넬리|로에베|끌로에|아크네스튜디오');
  r([27,145],582,649,'이세이미야케','E');c('조르지오 아르마니',27,650,145,731,'E');c('트리니티',27,732,145,877,'E','lounge');c('아크리스',27,878,145,943,'E');c('에르뎀',27,944,145,1001,'E');
  c('알라이아',176,643,335,703,'W');c('릭오웬스',176,731,335,785,'W');c('더로우',176,786,335,840,'W');c('르메르',176,863,335,946,'W');
  r([365,504,642],643,703,'에르노|드리스반노튼');c('꾸레쥬',690,666,803,729,'E');
  r([646,712,803],766,834,'CFCL|톰브라운 여성','E');r([646,730,803],859,938,'요지 야마모토|베르사체','E');
  r([365,471,610],894,955,'사카이|알렉산더왕','N');c('호라이즌',833,639,943,767,'W');c('분더샵 여성',833,829,943,1016,'W');
  r([176,298,430,513,594,771],986,1048,'자크뮈스|발렌티노|보테가 베네타|케이트|피비파일로','N');
  c('페라피렌체',875,768,991,788,'S','jewel');c('나니스',992,768,1090,788,'S','jewel');c('신세계 갤러리',875,803,990,826,'N','service');
  r([1146,1224,1306,1388,1470,1578,1735],462,553,'랑에운트 죄네|파네라이|블랑팡|위블로|다미아니|PSR 컨시어지','S','watch');
  c('로저드뷔',1037,582,1146,674,'E','watch');c('튜더',1037,675,1146,767,'E','watch');c('오메가',1037,829,1146,952,'E','watch');c('몽블랑',1037,953,1146,1092,'E','watch');
  r([1177,1267,1357],583,710,'바쉐론 콘스탄틴|아디르','W','jewel');c('오데마피게',1388,583,1578,674,'S','watch');
  r([1177,1267,1357],737,797,'론드/비체|예진','N','jewel');r([1177,1267,1357],797,860,'다이아미|부쉐론','S','jewel');c('갤러리 지반',1233,777,1302,820,'W','jewel');
  c('론진',1557,735,1608,860,'W','watch');r([1390,1442,1497,1551],861,891,'미꼬|윤연화|루첸리','N','jewel');
  r([1177,1267,1357],891,1017,'브레게|부쉐론','W','jewel');r([1386,1483,1581],923,1017,'예거 르쿨트르|IWC','N','watch');
  c('쇼메',1608,554,1735,613,'W','jewel');c('프레드',1608,614,1735,706,'W','jewel');c('쇼파드',1643,707,1735,784,'W','jewel');c('브라이틀링',1608,860,1694,996,'W','watch');c('태그호이어',1695,814,1735,996,'W','watch');c('포멜라토',1608,997,1694,1046,'W','jewel');
  r([1175,1493,1580,1735],1047,1140,'까르띠에|피아제|트리니티 라운지','N','jewel');
  start('4F',[392,750,628,833],445,1142,'fashion');
  r([182,318,411,498,592,681,780],537,602,'A.P.C.|이자벨 마랑|띠어리|마쥬|비비안 웨스트우드|린드버그');
  c('COS',27,570,148,744,'E');c('토리버치',27,745,148,848,'E');c('코치',27,849,148,921,'E','bag');c('이브살로몬',27,922,148,983,'E');
  c('비이커',181,634,338,697,'W');c('가니',181,698,338,755,'W');r([370,498,628],634,695,'엔폴드|씨뉴욕');
  r([660,718,780],634,694,'메종 키츠네|스튜디오 니콜슨');c('위크엔드막스마라',660,695,780,735,'E');c('입점 준비 중',809,632,965,760,'W','popup');
  c('바오바오',181,777,278,809,'W','bag');c('N°21',181,829,338,886,'W');r([181,262,338],887,954,'라움|포르테 포르테','W');
  c('쏘솔트',358,750,390,833,'W');c('팝업',631,750,663,833,'E','popup');r([370,498,628],888,954,'꼼데가르송 플레이|R13','N');
  c('일라일',663,840,780,887,'E');r([663,719,780],888,954,'준지|콜롬보','E');c('산드로',819,821,908,882,'W');c('바네사 브루노',819,883,874,941,'W');c('송지오 파리',909,821,966,941,'W');
  r([180,394,468,552,632,788],984,1077,'엠포리오아르마니|플리츠 플리츠|파비아나 필리피|쉐르|폴로 랄프 로렌','N');
  c('캐주얼 슈즈 (슈콤마보니/아쉬/라움에디션/베바이아)',1061,447,1368,632,'E','shoe');r([1369,1450,1533],447,519,'슈블루 (여성구두 전문수선실)|르무통','S','shoe');
  c('컨템포러리 슈즈 (리치오안나/류클래식/파비오루스코니)',1534,447,1734,573,'S','shoe');c('분더샵 슈 (르메르/로에베/생로랑/발렌시아가)',1534,574,1734,634,'S','shoe');
  c('헌터',1061,545,1155,663,'E','shoe');c('오트리',1061,664,1205,760,'E','shoe');r([1397,1449,1502],551,632,'지미추|버켄스탁','S','shoe');
  c('캠퍼',1237,662,1346,729,'W','shoe');c('레페토',1378,663,1483,729,'N','shoe');r([1516,1573,1645],663,727,'로저 비비에|타비오','N','shoe');
  c('미우미우',1237,762,1316,821,'W','shoe');c('샤넬 슈 부틱',1348,762,1510,821,'S','shoe');c('토즈',1679,651,1734,807,'W','shoe');
  c('롱샴',1061,822,1205,949,'E','bag');c('국내 슈즈(남/여) (닥스/탠디/미소페/소다/바바라)',1061,950,1367,1142,'E','shoe');
  c('루이비통',1237,851,1345,918,'W','shoe');c('지안비토로시',1378,851,1483,918,'N','shoe');r([1516,1579,1645],851,918,'조이앤 피스|호간','N','shoe');c('어그',1679,839,1734,929,'W','shoe');
  r([1397,1450,1503],950,1049,'프라다|페라가모','N','shoe');c('금강',1368,1077,1530,1142,'N','shoe');c('컴포트 슈즈 (에코/스타카토/제옥스/락포트/핏플랍/바이네르/스케쳐스USA)',1531,950,1734,1142,'N','shoe');
  start('5F',[359,779,603,859],513,1140,'fashion');
  r([176,228,333,422,523,612,738],573,635,'파로|사바티에|타임|구호|델라라나|클럽모나코');
  c('랑방 컬렉션',54,605,145,683,'E');c('마인',54,684,145,754,'E');c('미샤',54,755,145,897,'E');c('셀렙제이',54,898,145,964,'E');c('미스지 컬렉션',29,965,145,1036,'E');
  r([173,253,334],663,727,'키이스|데코','W');r([173,253,334],728,790,'진태옥|모조','W');r([355,487,603],663,724,'지고트|더캐시미어');
  r([632,712,793],663,726,'르몽생미셸|질스튜어트');r([632,712,793],727,790,'DKNY|캐나다 구스');
  c('자딕앤 볼테르',797,605,886,676,'W');c('뷰오리',827,677,886,790,'W');c('아스페시',887,677,936,790,'W');
  r([173,253,334],844,909,'앤디앤뎁|손정완','W');r([173,253,334],910,973,'이따리아나|아이잗바바','W');r([355,487,603],913,973,'스피치오|오일릴리','N');
  r([632,712,793],844,909,'랙앤본|팝업','E');r([632,712,793],910,973,'베르니스|위뜨','E');c('룰루레몬',827,849,937,1034,'W');c('윤진모피',942,821,1028,850,'N');
  r([176,253,322,418,510,638,752],1006,1096,'동우모피|진도모피|르베이지|쁘렝땅|닥스|보티첼리','N');
  r([1134,1261,1361,1441,1534,1622,1701],521,603,'더일마|스튜디오 톰보이|보브|시스템|라코스테|럭키슈에뜨');
  c('룩캐스트',1031,573,1155,635,'E');c('틸아이다이',1031,636,1155,683,'E');c('에레',1031,684,1155,739,'E');c('렉토',1031,849,1155,991,'E');
  r([1186,1246,1311,1378],626,703,'베네통|온앤온|포우어 아이즈온니');r([1186,1246,1278,1378],704,756,'에스실|넘버링|팝업 스테이지');
  r([1410,1513,1623],626,680,'CC콜렉트|에고이스트');r([1410,1513,1623],681,739,'써스데이 아일랜드|잇미샤');
  c('헤지스',1660,615,1734,691,'W');c('빈폴',1660,692,1734,768,'W');c('분크',1660,792,1734,850,'W','bag');c('닥스',1660,851,1734,914,'W','bag');
  c('레이브',1186,777,1278,839,'W');c('킨더살몬',1186,840,1278,919,'W');c('루에브르',1186,920,1278,991,'W');c('유메르',1279,777,1376,919,'E');c('타낫',1279,920,1376,991,'E');
  c('로서울',1402,855,1528,924,'W','bag');c('조이 그라이슨',1402,925,1528,991,'W','bag');c('멤버스바',1520,765,1623,826,'N','cafe');
  c('루즈앤 라운지',1529,855,1623,900,'E','bag');c('조셉앤 스테이시',1529,901,1623,946,'E','bag');c('쿠론',1529,947,1623,991,'E','bag');
  r([1103,1261,1338,1423,1512,1706],1021,1111,'SHOP 아모멘토|부디무드라|르917 (르셉템버)|던스트|입점 준비 중','N');
  start('6F',[372,749,626,832],443,1138,'lux');
  r([180,257,342,419,550,652,759],537,599,'듀퐁|에르노|엠포리오 아르마니|일레븐티|RRL|B&O (뱅앤올룹슨)');
  c('라이카',54,569,148,639,'E','elec');c('코넬리아니',54,640,148,703,'E');c('조르지오 아르마니',54,704,148,870,'E');c('키톤',28,871,148,943,'E');c('핫셀블라드',28,944,148,1014,'E','elec');
  c('라르디니',179,630,280,702,'W');c('폴스미스',179,703,280,775,'W');c('시즈',281,630,335,775,'E');c('보테가베네타',372,630,626,694);c('버버리',665,630,819,760,'E');c('발렌시아가',850,599,964,759,'W');
  c('로로피아나',179,806,335,950,'W');c('브루넬로 쿠치넬리',372,891,626,950,'N');c('분더샵',665,806,819,950,'E');c('프라다',852,822,966,1014,'W');
  r([180,357,513,628,787],983,1075,'톰포드|벨루티|페라가모|보스','N');
  r([1238,1334,1405,1476,1553],443,594,'셀린느|옴므 플리세|아미|CDG CDG CDG');c('콜렉트',1587,545,1710,595,'S');
  c('디올',1060,548,1275,759,'E');c('구찌',1060,822,1216,1061,'E');c('루이비통',1353,648,1495,926,'W');c('펜디',1496,648,1610,765,'E');c('톰브라운',1496,804,1610,926,'E');
  c('리모와',1660,631,1756,771,'W','bag');c('로에베',1660,861,1756,1005,'W');c('버윅',1659,1006,1727,1061,'W','shoe');
  r([1257,1330,1406,1484,1549],983,1138,'제냐|우영미|토즈|투미','N');c('로크',1550,983,1586,1061,'W','shoe');r([1550,1586,1623,1659],1062,1138,'블런드스톤|에임스 스튜디오|듀퐁 슈즈','N','shoe');
  start('7F',[359,749,595,832],445,1140,'fashion');
  r([211,294,394,501,588,769],537,608,'보스골프|타이틀리스트|PXG|G/FORE|A.P.C.골프','S','golf');
  c('퍼스트 라운지',29,537,105,1013,'E','lounge');c('랑방블랑',106,568,178,661,'E','golf');c('어메이징크리',106,662,178,769,'E','golf');c('말본골프',106,770,178,891,'E','golf');c('쉐르보',106,892,178,1013,'E','golf');
  c('제이린드버그',209,639,321,705,'W','golf');c('마크앤로나',209,706,321,769,'W','golf');r([355,424,492,554,624],639,705,'먼싱웨어|캘러웨이|빈폴골프|페어라이어','S','golf');
  c('헨리코튼',658,639,770,707,'E');r([658,715,770],708,770,'타미힐피거|헤지스','E');c('폴로 랄프 로렌',804,568,925,681,'W');r([804,856,966],682,761,'헤리티지 플로스|맨온더분','W');
  c('사우스케이프',209,807,321,900,'W','golf');c('세인트앤드류스',209,901,321,951,'W','golf');r([356,445,534,623],886,951,'람다 골프|왁|데상트 골프','N','golf');
  c('룰루레몬 남성',658,807,770,900,'E','sport');c('울프',658,901,770,951,'E');c('라코스테',804,820,884,882,'W');c('빈폴',804,883,884,974,'W');c('비이커',885,820,966,916,'E');
  c('던롭',177,983,293,1046,'N','golf');c('골프숍',294,983,575,1125,'N','golf');r([576,674,792],983,1045,'나이키골프|풋조이','N','golf');
  r([1140,1218,1289,1360,1440,1513,1590],445,542,'타임옴므|질 스튜어트 뉴욕|포스트 아카이브 팩션 (파프)|CP컴퍼니|DKNY 남성|알레그리');
  c('A.P.C. 남성',1061,542,1156,614,'E');c('솔리드옴므',1061,615,1156,683,'E');c('띠어리',1061,684,1156,760,'E');
  c('이로',1187,575,1287,635,'W');r([1187,1237,1287],636,772,'캡틴 선샤인|클럽 모나코','W');c('시스템옴므',1304,575,1432,645,'N');c('준지',1304,646,1432,718,'S');c('프레이트',1453,575,1581,645,'N');c('송지오옴므',1453,646,1581,718,'S');
  c('시리즈',1591,575,1659,711,'W');c('멤버스바 더블랙',1659,475,1734,779,'W','cafe');c('스톤 아일랜드',1322,736,1402,841,'W');c('게이즈샵',1466,815,1546,842,'N','elec');c('쌤소나이트',1639,844,1734,874,'N','bag');
  c('수트 서플라이',1091,821,1195,1074,'E');r([1187,1237,1287],815,943,'러프사이드|노비스','W');c('커스텀멜로우',1187,944,1287,1005,'W');c('아워셀브스',1305,866,1410,935,'W');c('바버',1305,936,1410,1005,'W');
  r([1429,1532,1582],866,937,'GLXY studio|듀퐁 셔츠');r([1429,1480,1532,1582],938,1005,'닥스 셔츠|카운테스 마라|레노마 셔츠','N');c('만다리나덕',1598,886,1691,950,'W','bag');c('지이크',1598,951,1691,995,'W');
  r([1187,1287,1360,1429,1499,1568,1678],1031,1140,'슬로웨어|갤럭시|닥스|캠브리지|마에스트로|샌프란시스코 마켓','N');
  start('8F',[388,755,607,838],447,1142,'sport');
  r([216,276,337,397],591,665,'펜필드|컨버스|푸마');r([397,454,509,563,619],516,614,'CK|게스|리바이스|캉골');r([619,698,765],573,645,'내셔널지오그래픽|노메뉴얼');
  c('아디다스',51,567,190,720,'E');c('프리스비 (애플)',28,721,164,845,'E','elec');c('데상트',51,845,164,965,'E');
  c('라코스테 스포츠',190,690,270,785,'W');c('휠라',271,690,350,738,'E');c('르꼬끄',271,739,350,785,'E');
  r([429,511,591],643,701,'디아도라|커버낫');c('브라운브레스',808,593,895,672,'W');c('디스커버리',808,673,895,760,'W');c('데우스 엑스 마키나',896,661,956,760,'W');
  c('슈퍼드라이',645,679,766,729,'E');c('락피쉬웨더웨어',645,730,766,775,'E');c('다이나핏',190,807,270,903,'W');c('반스',271,807,350,855,'E');c('디앤드렉션',271,856,350,903,'E');
  c('지샥',362,771,386,828,'W','watch');r([397,499,579],895,952,'엄브로|LEE','N');c('이미스',645,804,766,852,'E');c('글로니',645,853,766,897,'E');
  c('에잇디비전',794,822,888,1001,'W');c('포터리',889,822,953,932,'W');c('외국인 통합서비스센터',142,938,217,996,'E','service');c('상품권숍 · 고객서비스센터 (신한·삼성·BC카드)',246,928,397,1024,'N','service');
  r([397,481,549,577],979,1090,'MLB|마리떼 프랑소와 저버|로우로우','N');r([602,690,772],932,1024,'브라운야드|마르디 메크르디','N');
  r([1177,1289,1402,1597],477,543,'스노우피크|코오롱 스포츠|뉴발란스 메가숍');
  c('노스페이스',1052,543,1177,640,'E');c('파타고니아',1052,641,1177,760,'E');c('K2',1545,543,1641,627,'W');c('피엘라벤',1545,628,1641,719,'W');
  r([1207,1272,1338],578,672,'컬럼비아|노르디스크');r([1207,1272,1338],673,778,'브롬톤|BBC 어스','S');c('블랙야크',1361,578,1426,719,'W');c('네파',1427,578,1506,645,'E');c('화이트 라벨',1427,646,1506,719,'E');
  c('쌤소나이트 레드',1511,736,1647,755,'N','bag');c('엘리스 1871',1361,743,1506,838,'W');
  r([1207,1272,1338],800,865,'스케쳐스|젝시믹스');r([1207,1272,1338],866,935,'플랫폼 플러스|몽벨');r([1207,1272,1338],936,1000,'헬리녹스|골드윈','N');
  r([1361,1449,1541,1619],843,887,'나이키 스윔|배럴|아레나','S');c('닥터마틴',1641,853,1708,937,'W','shoe');
  c('오니츠카 타이거',1080,822,1177,918,'E','shoe');c('가민',1080,919,1177,976,'E','elec');c('크록스',1080,977,1177,1076,'E','shoe');
  r([1207,1276,1361],1032,1111,'아크테릭스|살로몬','N');c('나이키',1362,936,1641,1142,'W');
  start('9F',[342,750,566,832],446,1112,'home');
  r([137,185,234,284,338,446,554,624,692,770],538,602,'히프노스|템퍼|크리스피바바|앙드솔렌|에이스|시몬스|바세티|리베코 튀르포|피레넥스');
  c('씰리',24,601,137,660,'E');c('돌레란',24,661,137,722,'E');c('까사미아',24,723,137,845,'E');c('덕시아나',24,846,137,917,'E');c('해스텐스',24,918,137,1016,'E');
  c('RO 레스트 오브젝트',167,631,211,698,'W');c('팝업',212,631,262,665,'N','popup');c('에싸',212,666,262,698,'S');c('팝업',263,631,314,698,'E','popup');
  r([341,402,467,533,595],631,686,'프레쉬 파인드|코지네스트|세사|클라르하임');c('랄프로렌홈',624,631,772,687,'E');c('팝업',624,688,772,771,'E','popup');
  r([167,229,314],724,845,'허먼 밀러|USM','W');c('팝업',322,773,340,814,'W','popup');c('더 조선 호텔',800,569,850,671,'W');c('바카라',800,672,850,760,'W');c('피숀',851,632,962,760,'W');
  c('에르뻬 보쎄',167,885,234,952,'W');c('칼한센',235,885,314,921,'E');c('보컨셉',235,922,314,952,'E');r([341,474,595],897,952,'타임&스타일|몰테니&C','N');
  c('로쉐보보아',624,812,772,883,'E');c('보에',624,884,772,952,'E');r([800,860,913,962],823,916,'에르메스 메종|크리스토플|라리끄','N');c('생루이',800,917,860,1015,'W');
  r([143,235,327,603,699,783],976,1078,'까시나|에드라|놀/폴트로나프라우/체코티콜레지오니|비앤비 이탈리아|라잇나우','N');
  c('고객상담실 · 퇴점브랜드 수선 접수 센터',1056,447,1231,518,'S','service');c('JAJU 테이블',1231,447,1603,544,'S','rest');c('쿠킹스튜디오 (쿠쿠/에피큐리언)',1426,510,1603,546,'S','kitchen');
  c('빌레로이 앤 보흐',1088,518,1182,580,'E','kitchen');c('베르나르도',1088,581,1182,635,'E','kitchen');c('하빌랜드/제이엘 꼬께/헤렌드',1088,636,1182,700,'E','kitchen');c('웨지우드',1088,701,1182,761,'E','kitchen');c('로얄코펜하겐',986,690,1087,761,'E','kitchen');
  r([1208,1303,1397],582,626,'VBC까사|필리빗','S','kitchen');r([1208,1274,1335,1397],627,668,'솔솔 푸른솔|광주요|놋담','S','kitchen');
  c('TWL',1208,683,1307,761,'W','kitchen');c('Tea Note',1308,683,1397,722,'E','kitchen');c('팝업',1308,723,1397,761,'E','popup');
  c('리델',1426,582,1489,670,'W','kitchen');c('키친툴',1426,671,1489,738,'W','kitchen');c('WMF',1490,582,1554,687,'E','kitchen');c('팝업',1490,688,1554,738,'E','popup');c('알레시',1426,749,1532,775,'N','kitchen');
  c('마이도',1603,543,1729,594,'W','kitchen');c('휘슬러',1603,595,1729,638,'W','kitchen');c('즈윌링',1603,639,1729,682,'W','kitchen');c('모비엘',1603,683,1729,725,'W','kitchen');c('캐논/소니',1548,777,1607,822,'N','elec');
  c('드비알레/보스/세라자데/제네바',1056,823,1180,900,'E','elec');c('포칼',1056,901,1180,933,'E','elec');c('다이슨',1056,934,1180,998,'E','elec');
  r([1208,1308,1406],823,858,'유라|라마르조코','N','elec');r([1208,1308,1406],859,898,'드롱기|브레빌','N','elec');r([1208,1272,1338,1406],910,975,'로라스타|샤크 닌자|로보락','N','elec');
  c('가게나우/스메그',1425,823,1532,850,'N','elec');r([1436,1491,1548],882,927,'미닉스|루메나','N','elec');r([1436,1491,1548],928,975,'발뮤다|린나이','N','elec');
  c('크렌즈 갤러리',1651,803,1729,863,'W','home');c('디트리쉬/리페르',1578,863,1649,941,'W','elec');c('밀레',1578,942,1649,998,'W','elec');r([1056,1353,1649],999,1112,'LG|삼성','N','elec');
  start('10F',[385,808,631,917],514,1135,'kid');
  c('의류 수선실',79,618,135,664,'E','service');r([189,489,608,663,804],603,665,'버버리 칠드런|분 주니어|봉쁘앙|몽클레르 앙팡');
  c('봉통',79,665,189,713,'E');c('미샤앤 퍼프',79,714,189,779,'E');c('엠포리오 아르마니주니어',79,780,189,845,'E');c('리틀그라운드/보보쇼즈',79,846,189,914,'E');c('랄프 로렌 칠드런',79,915,189,959,'E');c('사은행사장 · 신세계 포인트 센터',29,960,189,1066,'E','service');
  r([218,293,365],703,783,'블루독|콩제슬래드');r([384,509,632],703,783,'베이비 디올|펜디키즈');c('겐조키즈',658,703,799,783,'E');c('스누피 플레이스',834,633,991,818,'W','kid');
  r([218,293,365],807,888,'IAMI|캉골키즈','W');c('팝업',658,808,799,888,'E','popup');r([218,293,365],917,997,'프렌치캣|MOLO','W');r([384,466,550,632],918,973,'토박스|트래드후스|컴프프로','N');c('마리떼 키즈',658,917,799,997,'E');
  r([197,254,314,373,463,554,642,739,817],1027,1126,'블랙야크 키즈|내셔널 키즈|파타고니아 키즈|뉴발란스 키즈|노스페이스 키즈|MLB 키즈|나이키 키즈|마이크로 킥보드','N');
  c('레고스토어',834,879,891,1096,'W','toy');c('완구 (아이큐박스/키움하우스)',892,879,991,999,'E','toy');c('팝업',999,819,1050,843,'N','popup');
  r([1193,1236,1280,1322,1380,1448,1491,1534,1631],514,607,'아티포페|아뜰리에 슈|밍크뮤|블루독 베이비|압소바/쇼콜라/에뜨와|바바라|트라이엄프|비비안');
  c('바베파파',1082,607,1204,660,'E');c('에그',1082,661,1204,709,'E');c('부가부',1082,710,1204,763,'E');c('스토케',1082,764,1204,819,'E');
  r([1236,1307,1372,1438],647,714,'무냐무냐|오르시떼|리틀 아카이브');r([1236,1348,1438],715,766,'슈슈앤크라|베네베네');r([1236,1348,1438],767,821,'아프리콧 스튜디오|팝업','S');
  c('CK 언더웨어',1468,647,1521,793,'W','lingerie');c('게스 언더웨어',1522,647,1570,700,'E','lingerie');c('코데즈 컴바인 언더웨어',1522,701,1570,748,'E','lingerie');c('EA 언더웨어',1522,749,1570,793,'E','lingerie');
  c('와코루',1600,607,1735,660,'W','lingerie');c('마더피아',1600,661,1735,686,'W','lingerie');c('비너스',1600,687,1735,746,'W','lingerie');c('팝업',1600,747,1735,787,'W','popup');
  r([1544,1581,1648],806,832,'루셀|허비쉬','N','lingerie');c('야마하',1544,834,1581,890,'W','toy');c('팝업',1582,869,1648,890,'S','popup');c('팝업',1468,832,1506,871,'W','popup');c('세컨스킨',1638,883,1735,906,'N','lingerie');
  r([1082,1144,1204],878,961,'리우드|얌이밀','N');r([1236,1334,1434],877,961,'베베드피노|미키하우스','N');
  r([1204,1392,1508,1695],962,1135,'리틀라운지&파미에스위트|멤버스 라운지|퍼스트 프라임 라운지','N','lounge');
  start('11F',[385,750,631,832],456,1142,'rest');
  r([1145,1272,1411,1609],456,615,'화니 (한정식/비빔밥)|평양면옥 (냉면/불고기)|밀화 (샤브샤브/전골)');
  c('더 키친 일 포노 (이탈리안 피자)',1200,646,1380,780,'W');c('살롱드호우섬 (딤섬/누들/홍콩식 솥밥)',1411,646,1682,733,'E');
  c('꼴라주 (프렌치 경양식)',1200,812,1380,903,'W');c('카테고릭 (카페)',1411,812,1589,903,'E','cafe');
  r([1105,1319,1481,1669],935,1142,'호경전 (모던 차이니즈 푸드)|히바린 (카츠/누들)|키사라 (초밥/생선회/냄비요리)','N');
}
// Raised outline bays are part of the grey cell, not an aligned generic shop row.
for(const [id,names,top]of[
  ['3F',['브루넬로 쿠치넬리','로에베','끌로에'],490],
  ['4F',['이자벨 마랑','띠어리','마쥬'],475],
  ['5F',['타임','구호','델라라나'],513],
  ['6F',['에르노','엠포리오 아르마니','일레븐티','RRL'],475],
  ['7F',['타이틀리스트','PXG','G/FORE'],475],
  ['9F',['에이스','시몬스'],475],
  ['10F',['분 주니어','봉쁘앙'],542],
])for(const c of upperGuidePlans[id].cells)if(names.includes(c.name))c.rect[1]=top;
export const upperRightPads={
  '2F':[1575,670,1635,805],'3F':[1370,760,1445,840],'4F':[1550,747,1620,830],
  '5F':[1410,757,1495,835],'6F':[1505,768,1595,800],'7F':[1500,744,1590,812],
  '8F':[1530,756,1610,837],'9F':[1440,776,1526,821],'10F':[1585,834,1645,866],
  '11F':[1540,738,1620,806],
};
export const upperPlanPoint = (id,px,py) => {
  const p=upperGuidePlans[id], [xa,ya,xb,yb]=p.well;
  const [rx0,ry0,rx1,ry1]=upperRightPads[id];
  const right=px>=1035;
  return [b1Interp(py,[[p.top,66.5],[right?ry0:ya,39.4],[right?ry1:yb,27.6],[p.bottom,.5]]),
    right?b1Interp(px,[[1035,59.3],[rx0,76.5],[rx1,80.3],[1775,84.2]]):b1Interp(px,[[27,.5],[xa,35],[xb,47],[965,56.5],[1035,59.3]])];
};


// Pixel centres of the restroom pictograms in the supplied official floor guides.
// The entrance trim follows the icon; room depth/fixtures are deliberately unknown.
export const upperServicePoints=[
  {floor:'2F',pixel:[927,454],face:'S',name:'여자 · 장애인 화장실'},
  {floor:'2F',pixel:[1762,667],face:'W',name:'여자 화장실'},
  {floor:'3F',pixel:[878,550],face:'S',name:'남자 · 여자 화장실'},
  {floor:'3F',pixel:[1768,752],face:'W',name:'여자 화장실 · 기저귀 교환대'},
  {floor:'4F',pixel:[879,532],face:'S',name:'남자 · 여자 · 장애인 화장실'},
  {floor:'4F',pixel:[1765,746],face:'W',name:'여자 화장실 · 기저귀 교환대'},
  {floor:'5F',pixel:[866,568],face:'S',name:'남자 · 여자 · 장애인 화장실'},
  {floor:'5F',pixel:[1765,767],face:'W',name:'여자 화장실'},
  {floor:'6F',pixel:[886,527],face:'S',name:'남자 · 여자 · 장애인 화장실'},
  {floor:'6F',pixel:[1772,750],face:'W',name:'여자 화장실'},
  {floor:'7F',pixel:[875,543],face:'S',name:'남자 · 여자 화장실'},
  {floor:'7F',pixel:[1763,743],face:'W',name:'남자 · 여자 화장실 · 기저귀 교환대'},
  {floor:'8F',pixel:[881,569],face:'S',name:'남자 · 여자 · 장애인 화장실'},
  {floor:'8F',pixel:[1758,706],face:'W',name:'여자 화장실 · 기저귀 교환대'},
  {floor:'9F',pixel:[896,533],face:'S',name:'남자 · 여자 화장실'},
  {floor:'9F',pixel:[1758,746],face:'W',name:'여자 화장실 · 기저귀 교환대'},
  {floor:'10F',pixel:[938,601],face:'S',name:'남자 · 여자 화장실 · 유아 동반'},
  {floor:'10F',pixel:[1770,805],face:'W',name:'여자 화장실 · 기저귀 교환대'},
  {floor:'11F',pixel:[1760,750],face:'W',name:'여자 · 장애인 화장실'},
  {floor:'11F',pixel:[1024,1063],face:'E',name:'남자 · 장애인 화장실 · 기저귀 교환대'},
];
