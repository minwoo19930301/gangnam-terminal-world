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
const UPPER_ELV = [21.5,24.5,27.5].map(u=>({u,v:54,w:2.4,d:2.2}));
// The diagonal 9F→10F annex pair needs 1.6m axis spacing and a small south
// offset to clear the next flight's handrails. All other lanes keep their stack.
const upperLaneOffsets=(i,annex=false)=>annex&&i===7?[1.9,3.5]:i%2?[1.3,2.9]:[-2.9,-1.3];
const RIGHT_ATR = [27.6,74.2,39.4,78.0]; // legacy helper fallback; active wells are sheet-derived
const UPPER_BANKS = [
  {key:"본관 화장실 옆",u:61.5,v:43.61,face:"W",top:"10F"},
  {key:"신관 화장실 옆",u:32,v:82.2,face:"N",top:"11F"},
  {key:"본관 코너",u:10,v:11.95,face:"E",top:"11F"},
];

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
  exWall('N', 0, 18.5, 29.7, 0, 7, { mat: 'ssg_granite' });
  exWall('N', 0, 39.5, UW - 18.5, 0, 7, { mat: 'ssg_granite' });
  exWall('N', 0, UW - 18.5, UW, 0, 7, { mat: 'ssg_tower_stone' });
  // F07: the official 2 GATE bay is 9.8 m, between the intact north boutiques.
  exWall('N', 5, 29.7, 39.5, 0, 7, { mat: 'ssg_granite', openings: [{ ...dOp(34.6, 9.8), y1: 5.7 }] });
  for (const u of [29.7, 39.5]) wall(u, 0, u, 5, 0, 7, { mat: 'ssg_granite', thick: 0.22 });
  exWall('E', UW, 0, 18.5, 0, 7, { mat: 'ssg_tower_stone' });
  exWall('E', UW, 18.5, VS, 0, 7, { mat: 'ssg_granite', openings: [{ ...dOp(30), y1: 3.45 }] });
  exWall('E', UW, VS, VD, 0, 7, { mat: 'ssg_granite', openings: [{...dOp(42.35, 17.7), y1:3.45}] });
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
    exWall(f, pl, s0, s1, 7, LV.RF + 0.65, {mat:'ssg_granite',openings:f==='W'?[{s:75.1,w:1.8,y0:7,y1:9.6}]:f==='S'?[{s:59.2,w:3,y0:7,y1:10}]:[]});
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
  entrance('N', 34.6, 9.8, 5);
  { // F07: two clear door-pair passages flank a central revolving door.
    const center=[34.6,5.5],p=P(...center);
    K.cyl({x:p[0],z:p[1],y:2.8,r:1.05,h:.12,mat:0x1c1e1d,seg:24,solid:false});
    for(let i=0;i<24;i++){
      const a=i*PI/12,b=(i+1)*PI/12,mid=(a+b)/2;
      if(Math.abs(Math.sin(mid))>.72)continue;
      wall(center[0]+Math.cos(a),center[1]+Math.sin(a),center[0]+Math.cos(b),center[1]+Math.sin(b),.08,2.8,{mat:'glass',thick:.035,solid:false});
    }
    for(let i=0;i<3;i++){const a=i*2*PI/3;wall(...center,center[0]+.92*Math.cos(a),center[1]+.92*Math.sin(a),.08,2.78,{mat:'glass',thick:.035,solid:false});}
  }
  entrance('E', 30, 6);
  entrance('E', 42.35, 17.7);
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
  K.slab(rect(29.7, 0, 39.5, 5), 0.012, { mat: 'ssg_paving', uvRot: RA, thick: 0.12, ceil: false });
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
    g.fillStyle = '#8a8b8a'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 90; i++) {
      g.strokeStyle = i % 2 ? 'rgba(207,208,206,.32)' : 'rgba(113,113,110,.16)';
      g.lineWidth = 1 + i % 3; g.beginPath(); g.moveTo(i * 13 % w, 0);
      g.bezierCurveTo(i * 19 % w, 70, i * 23 % w, 180, i * 17 % w, h); g.stroke();
    }
    g.fillStyle = '#5e5f5e'; g.fillRect(0, 0, w, 1.3); g.fillRect(0, 0, 1.3, h);
  }, [1.2, .6]);
  // ------------------------------------------------------------ slabs
  // Match the upper slab contour to the recessed glazing: no shelves protrude outside it.
  const northOutline = (vSouth, y) => {
    const front = y >= 20 && y < 24 ? [[23, BAY_BACK], [44, BAY_BACK]]
      : [[23, BAY_BACK], ...bay, [44, BAY_BACK]];
    return [P(0, 0), P(23, 0), ...front.map(p => P(...p)), P(44, 0), P(UW, 0), P(UW, vSouth), P(0, vSouth)];
  };
  const elvHoles = UPPER_ELV.map(e => rect(e.u - e.w / 2, e.v - e.d / 2, e.u + e.w / 2, e.v + e.d / 2));
  const atrHole = rect(...ATR); // basement machinery keeps its retained position
  // stair hole at main-floor index s (B2=0): lane of the flight that arrives from s-1
  const stairLaneU = (c, s) => c.lanes[(s - 1) % 2];
  const stairHole = (c, s) => { const u = stairLaneU(c, s); return rect(u - 0.85, c.v0 + 2.2, u + 0.85, c.v1 - 2.2); };
  const coreTop = c => MAIN.indexOf(c.top);
  K.texture('ssg_1f_striped',512,512,(g,w,h)=>{
    g.fillStyle='#f6f5f1';g.fillRect(0,0,w,h);
    // Equal rust/white widths: diagonal period gives about 0.95 m per band.
    for(let i=-2;i<4;i++){g.beginPath();g.moveTo(i*256,0);g.lineTo(i*256+128,0);g.lineTo(i*256+640,h);g.lineTo(i*256+512,h);g.closePath();g.fillStyle='#934d22';g.fill();}
    for(let i=0;i<58;i++){g.beginPath();g.moveTo(i*23%512,0);g.bezierCurveTo(i*37%512,170,i*19%512,330,i*31%512,512);g.strokeStyle=i%3?'rgba(103,100,94,.12)':'rgba(255,255,255,.14)';g.lineWidth=i%3?.7:.8;g.stroke();}
    g.strokeStyle='rgba(0,0,0,.15)';g.lineWidth=1.2;
    for(let t=0;t<1024;t+=121.3){g.beginPath();g.moveTo(t,0);g.lineTo(t-512,512);g.stroke();}
  },[5.374,5.374]);
  const PLAN = (px,py) => [67*(1048-px)/1023,84.7*(py-402)/720];
  const MPLAN = (px,py) => [67*(1038-px)/853,84.7*(py-372)/600];
  // The same gate-constrained mirror used for 1F is applied independently to 1M.
  const mezzVoidPixels=[[258,452],[869,452],[869,740],[828,740]];
  for(let i=0;i<=24;i++){const a=.2+(Math.PI-.4)*i/24;mezzVoidPixels.push([607+225*Math.cos(a),738+122*Math.sin(a)]);}
  mezzVoidPixels.push([385,774],[258,774]);
  const MEZZ_VOID=mezzVoidPixels.map(p=>P(...MPLAN(...p)));
  // F03/F04: north-west lift bank backs onto the NNW wall band; doors face south.
  const NWLIFTS=[13.5,16.5].map(u=>({u,v:5.15,w:2.65,d:2.4}));
  const nwLiftHoles=NWLIFTS.map(e=>rect(e.u-e.w/2,e.v-e.d/2,e.u+e.w/2,e.v+e.d/2));
  const NW_ESC=[11.2,20,13.0,31];
  const SW_ESC=[11.25,54.4,12.85,61];
  const beautyDownHoles=BEAUTY_BANKS.map(v=>rect(BANK_U0,v+.15,BANK_U1,v+1.75));
  const beautyUpHoles=BEAUTY_BANKS.map(v=>rect(BANK_U0,v-1.75,BANK_U1,v-.15));
  // B1 plan's subway escalator icon is at (u≈62, v78.4). Its run is inferred:
  // shift the pair 1.6 m east to retain the entire wall-side luggage-locker row.
  // The lower vestibule is isolated from B2 parking; the station junction is unbuilt.
  const B1_SUBWAY_ESC={lanes:[63.0,64.2],topV:78.4,bottomV:69.7,hole:[62.3,69.55,64.9,78.5],vestibule:[61.9,66.9,65.3,69.8]};
  const b1SubwayHole=rect(...B1_SUBWAY_ESC.hole);
  for(const hole of beautyDownHoles)K.groundHole(hole);
  // F13: keep the terracotta colour; stronger environment mixing washed it pink.
  const floorMat = { B2: { tex: 'concrete', color: 0x8c8d89 }, B1: 'ssg_marble', '1F': {tex:'ssg_1f_striped',gloss:.3}, '2F': {tex:'marble',color:0xf4efe4,gloss:.7}, '3F': {tex:'marble',color:0xf1ebdf,gloss:.5}, '11F': { tex: 'darkstone', color: 0xd4c5af } };
  // Round16: the shared circulation is polished ivory; grey sports tile stays
  // inside its official tenant cells. Lower-floor finishes are untouched.
  for (const id of ['4F', '5F', '6F', '7F', '8F', '9F', '10F', '11F']) floorMat[id] = {tex:'marble',color:0xf2ede3,gloss:.5};
  floorMat['8F']={tex:'ssg_upper_tile',gloss:.3};
  MAIN.forEach((id, s) => {
    const holes = id==='1F' ? [...nwLiftHoles] : id==='B1' ? [] : id==='B2' ? ELV.map(e=>rect(e.u-e.w/2,e.v-e.d/2,e.u+e.w/2,e.v+e.d/2)) : [...elvHoles];
    // Ground NW lift bank has its own 1F/1M controls; upper banks follow their plan icons.
    if (id === '1F') holes.push(...beautyDownHoles);
    if (id === 'B1') holes.push(b1SubwayHole);
    else if (s >= 3 && id !== '11F') holes.push(rect(...upperPhysicalWell(id)));
    if (s >= 4) holes.push(rect(...upperPhysicalWell(id,true)));
    if (id === '2F') holes.push(...beautyUpHoles);
    if (s >= 1) for (const c of CORES) if (s <= coreTop(c) && !(id==='1F'||id==='2F') && !(id==='B1'&&c.door==='W')) holes.push(stairHole(c, s));
    K.slab(UPPER.has(id) ? rect(0, VS, UW, VD) : LV[id] >= LV['2F'] ? northOutline(VD, LV[id]) : FULL, LV[id], { mat: floorMat[id] ?? 'ssg_marble', thick: thick(id), holes, edge: false, walk:id!=='11F', under: id === 'B2' ? false : id === 'B1' ? { tex: 'concrete', color: 0xb4b2a9 } : CEIL });
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
  K.slab(FULL, LV['1M'], {mat:{tex:'marble',color:0xf4eee2,gloss:.5},thick:TH['1M'],holes:[MEZZ_VOID,...nwLiftHoles,rect(...NW_ESC),rect(...SW_ESC)],edge:false,under:CEIL});

  const upperFlightReservations=[];
  for(const annex of[false,true]){
    const ids=Object.keys(upperGuidePlans),fn=annex?upperAnnexAtriumRect:upperAtriumRect;
    for(let i=0;i<ids.length-(annex?1:2);i++){
      const r=fn(ids[i]),t=fn(ids[i+1]),rev=i%2;
      for(const off of upperLaneOffsets(i,annex))upperFlightReservations.push({
        a:annex?[rev?r[2]:r[0],(r[1]+r[3])/2+off]:[(r[0]+r[2])/2+off,rev?r[3]:r[1]],
        b:annex?[rev?t[0]:t[2],(t[1]+t[3])/2+off]:[(t[0]+t[2])/2+off,rev?t[1]:t[3]],ya:LV[ids[i]],yb:LV[ids[i+1]],
      });
    }
  }
  function upperSafeIntervals(u0,v0,u1,v1,y,H){
    const L=Math.hypot(u1-u0,v1-v0),n=Math.max(1,Math.ceil(L/.10)),safe=[];
    const blocked=(u,v)=>upperFlightReservations.some(f=>{
      if(f.ya>y+H+.1||f.yb<y-1.8)return false;
      const dx=f.b[0]-f.a[0],dz=f.b[1]-f.a[1],l2=dx*dx+dz*dz,t=((u-f.a[0])*dx+(v-f.a[1])*dz)/l2;
      if(t<-.06||t>1.06)return false;const h=f.ya+(f.yb-f.ya)*Math.max(0,Math.min(1,t));
      return h<y+H+.15&&h>y-1.85&&Math.abs((u-f.a[0])*dz-(v-f.a[1])*dx)/Math.sqrt(l2)<.98;
    });
    let begin=null;
    for(let i=0;i<=n;i++){
      const t=i/n,u=u0+(u1-u0)*t,v=v0+(v1-v0)*t,clear=i<n&&!blocked(u,v);
      if(clear&&begin===null)begin=Math.max(0,(i-.5)/n);
      if(!clear&&begin!==null){const end=Math.max(begin,(i-.5)/n);if((end-begin)*L>.06)safe.push([begin,end]);begin=null;}
    }
    return safe;
  }
  function upperSafeWall(u0,v0,u1,v1,y,H,options={}){
    const safe=upperSafeIntervals(u0,v0,u1,v1,y,H);
    for(const[a,b]of safe){const x=u0+(u1-u0)*a,z=v0+(v1-v0)*a,X=u0+(u1-u0)*b,Z=v0+(v1-v0)*b;wall(x,z,X,Z,y,y+H,options);}
    return safe;
  }
  function upperGuardTrim(u0,v0,u1,v1,y,H,thick,mat,safe,openings=[]){
    const L=Math.hypot(u1-u0,v1-v0);let pieces=safe;
    for(const o of openings){const lo=(o.at-o.w/2)/L,hi=(o.at+o.w/2)/L;pieces=pieces.flatMap(([a,b])=>hi<=a||lo>=b?[[a,b]]:[[a,Math.min(b,lo)],[Math.max(a,hi),b]].filter(([l,r])=>r-l>.001));}
    for(const[a,b]of pieces){const u=(u0+u1)/2+(u1-u0)*((a+b)/2-.5),v=(v0+v1)/2+(v1-v0)*((a+b)/2-.5);box(u,v,Math.abs(u1-u0)*(b-a)+thick,Math.abs(v1-v0)*(b-a)+thick,y,H,mat,{solid:false});}
  }
  // Round18 upper stack follows each official white well. Ground banks retain
  // the user's confirmed layout and therefore have separate 2F arrivals.
  const upperStack=Object.keys(upperGuidePlans);
  // The 3F swept opening is wider than its schematic pad: its piers must follow
  // that actual edge to clear the incoming/outgoing flight capsules.
  const upperPierRect=id=>id==='3F'?upperPhysicalWell(id):upperAtriumRect(id);
  function voidRail(r,y,gapsAtEnds=false,landingMid=(r[0]+r[2])/2,landingHalf=1.65){
    const [a,b,c,d]=r;
    for(const [u0,v0,u1,v1]of [[a,b,a,d],[c,b,c,d],...(gapsAtEnds?[]:[[a,b,c,b],[a,d,c,d]])]){
      const openings=y===7&&u0===u1?BEAUTY_BANKS.map(v=>({at:v-.95-Math.min(v0,v1),w:2.2,y0:y,y1:y+1.2})):[];
      const safe=upperSafeWall(u0,v0,u1,v1,y,1.1,{mat:'glass',thick:.04,openings});
      upperGuardTrim(u0,v0,u1,v1,y+1.1,.05,.05,0xa7a9a8,safe,openings);
    }
    if(gapsAtEnds)for(const v of[b,d]){
      const mid=landingMid;
      for(const [lo,hi]of [[a,mid-landingHalf],[mid+landingHalf,c]])if(hi-lo>.08){
        const safe=upperSafeWall(lo,v,hi,v,y,1.1,{mat:'glass',thick:.04});
        upperGuardTrim(lo,v,hi,v,y+1.1,.05,.05,0xa7a9a8,safe);
      }
    }
    // D8: deep banded stone fascia and a white soffit, not an emissive outline.
    for(const [u0,v0,u1,v1]of [[a,b,c,b],[a,d,c,d],[a,b,a,d],[c,b,c,d]]){
      const safe=upperSafeIntervals(u0,v0,u1,v1,y-1,1);
      upperGuardTrim(u0,v0,u1,v1,y-1,1,.08,0xc4b8a5,safe);
      for(const dy of[-.72,-.4])upperGuardTrim(u0,v0,u1,v1,y+dy,.018,.085,0xa99e8d,safe);
      upperGuardTrim(u0,v0,u1,v1,y-1.05,.05,.22,0xf5f3ee,safe);
    }
  }
  upperStack.slice(0,-2).forEach((id,i)=>{
    const next=upperStack[i+1],r=upperAtriumRect(id),t=upperAtriumRect(next),rev=i%2;
    for(const [off,dir]of upperLaneOffsets(i).map((off,j)=>[off,j?'down':'up'])){
      const a=P((r[0]+r[2])/2+off,rev?r[3]:r[1]),b=P((t[0]+t[2])/2+off,rev?t[1]:t[3]);
      K.escalator(...a,...b,{ya:LV[id],yb:LV[next],w:1.2,dir,speed:.6,sideMat:0xeee7da,truss:0xf3eee4});
    }
  });
  for(const id of upperStack.filter(id=>id!=='11F')){
    const i=upperStack.indexOf(id),r=upperAtriumRect(id),p=upperPhysicalWell(id),y=LV[id],mid=(r[0]+r[2])/2,atSouth=i%2===1;
    // Only the end containing the actual 2-lane landing is open in the parapet.
    voidRail(p,y,true,mid,3.6);
    const v=atSouth?r[3]:r[1],edge=atSouth?p[3]:p[1];
    K.slab(rect(mid-3.6,Math.min(v,edge)-.04,mid+3.6,Math.max(v,edge)+.04),y,{mat:{tex:'marble',color:0xe8dfce},thick:.16,under:CEIL,edge:false});
    for(const end of[p[1],p[3]])if(end!==edge)upperSafeWall(mid-3.6,end,mid+3.6,end,y,1.1,{mat:'glass',thick:.04});
    zone('본관 아트리움',id,'교차 에스컬레이터',p,y,y+4,2);
  }
  // R19 D8: piers follow each floor's well corners, starting above the 1F plaza.
  for(const id of upperStack.filter(id=>id!=='11F')){
    const [a,b,c,d]=upperPierRect(id),y=LV[id],H=LV[nextOf(id)]-y;
    for(const u of[a-.55,c+.55])for(const v of[b-.55,d+.55]){
      box(u,v,1.1,1.1,y,H,0xcfc0ad);
      for(let h=.6;h<H;h+=.6)box(u,v,1.112,1.112,y+h,.015,0xb4a795,{solid:false});
    }
  }
  // Ground hall: each end has an UP to 2F beside a DOWN to B1, sharing one outline.
  // The two pop-up bands occupy the open interval between these banks.
  // F14: white photographed cladding needs the same ambient lift as the coffers.
  K.material('ssg_esc_clad',new K.THREE.MeshLambertMaterial({color:0xefece6,emissive:0x9a9690}));
  function dressedEscalator(u0,v0,u1,v1,ya,yb,dir) {
    const a=P(u0,v0),b=P(u1,v1),w=1.2;
    K.escalator(...a,...b,{ya,yb,w,dir,sideMat:'ssg_esc_clad',truss:'ssg_esc_clad'});
    const dx=b[0]-a[0],dz=b[1]-a[1],len=Math.hypot(dx,dz),nx=-dz/len,nz=dx/len;
    // Rounded, substantial black handrail strips plus steel skirting are visible from both sides.
    for(const side of [-1,1])for(let i=0;i<24;i++) {
      const t=i/24,tt=(i+1)/24,off=side*.69;
      const q=(f,h)=>[a[0]+dx*f+nx*off,ya+(yb-ya)*f+h,a[1]+dz*f+nz*off];
      const rail=[q(t,.95),q(tt,.95),q(tt,1.06),q(t,1.06)];
      K.quad(0x202321,rail,[nx*side,0,nz*side]);K.quad(0x202321,rail.slice().reverse(),[-nx*side,0,-nz*side]);
      const steel=[q(t,.03),q(tt,.03),q(tt,.08),q(t,.08)];
      K.quad({tex:'metal',color:0xc5c5bc},steel,[nx*side,0,nz*side]);
    }
    for(const[u,v,y]of [[u0,v0,ya],[u1,v1,yb]])box(u,v,Math.abs(u1-u0)>1?1:.98,Math.abs(u1-u0)>1?.98:1,y-.035,.035,'metal',{solid:false});
  }
  function wellGuard(r,y,entry='W',rail=0xa99470) {
    const[u0,v0,u1,v1]=r;
    for(const [side,a,b]of [['N',[u0,v0],[u1,v0]],['S',[u0,v1],[u1,v1]],['E',[u1,v0],[u1,v1]],['W',[u0,v0],[u0,v1]]]) {
      if(side===entry)continue;
      wall(...a,...b,y,y+1.05,{mat:'glass',thick:.045});
      box((a[0]+b[0])/2,(a[1]+b[1])/2,Math.abs(b[0]-a[0])+.06,Math.abs(b[1]-a[1])+.06,y+1.05,.055,rail,{solid:false});
    }
  }
  BEAUTY_BANKS.forEach((v,i)=>{
    dressedEscalator(BANK_U0,v-.95,BANK_U1,v-.95,0,7,'up');
    dressedEscalator(BANK_U1,v+.95,BANK_U0,v+.95,-6,0,'down');
    wellGuard([BANK_U0,v+.15,BANK_U1,v+1.75],0,'W');
    wellGuard([BANK_U0,v-1.75,BANK_U1,v-.15],7,'E',0xa7a9a8);
    // One polished sill encloses both lanes. No floor crosses the down opening.
    for(const vv of [v-1.8,v+1.8])box((BANK_U0+BANK_U1)/2,vv,18,.08,0,.08,'metal',{solid:false});
    sign(['2층 ↑','지하 1층 ↓'],BANK_U0-.7,v,1.45,'W',1.7,.6,{bg:'#423c32',fg:'#fff2d6',twoSided:true});
    zone(`화장품관 ${i+1}번 에스컬레이터`,'1F','2층 올라감 · 지하 1층 내려감',[24.4,v-2,44.7,v+2],0,3.6,4);
    // New B1 arrivals and 2F landings are kept clear of existing tenant stock.
    box(BANK_U1+.65,v+.95,1.3,1.5,-6.08,.08,{tex:'marble',color:0xe8dfce});
    box(BANK_U1+.65,v-.95,1.3,1.5,6.92,.08,{tex:'marble',color:0xe8dfce});
  });
  dressedEscalator(12.1,20,12.1,31,0,3.6,'up');
  zone('북서벽 중층 에스컬레이터','1F','중층 · 멤버스바 · 베키아에누보',[11.1,18.5,13.1,32.5],0,3.6,4);
  sign('중층 · 커피 바 ↑',12.1,19,1.65,'N',2,.34,{bg:'#514636',fg:'#fff1d6',twoSided:true});
  // F02: the second official single run returns from 1M; direction is inferred.
  // A 6.6 m run stays inside the 1F slot, south of YSL's official back wall at v54.
  dressedEscalator(12.05,61,12.05,54.4,0,3.6,'down');
  zone('남서 중층 에스컬레이터','1F','1층 ↓ · 중층 ↑',[11.05,53,13.05,62.5],0,3.6,4);
  sign('1층 ↓ · 중층 ↑',12.05,62.4,1.65,'S',2,.34,{bg:'#514636',fg:'#fff1d6',twoSided:true});

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
    const upper=K.elevator({name:`신세계 고객 엘리베이터 (연결부 ${i+1}호기)`,x:ux,z:uz,rotY:RA+PI,w:e.w,d:e.d,floors:ELV_FLOORS.filter(f=>f.y>=7).map(f=>({...f,...ARR})),mat:0xc9c2b4});
    const nw=NWLIFTS[i%NWLIFTS.length],destination=P(nw.u,nw.v+2.8);
    // K.elevator's returned destination table is shared with its interaction menu.
    // Retain existing visible shafts, but allow a return to the relocated 1F/1M lobby.
    const menu=ELV_FLOORS.map(f=>({...f,...(f.label==='B1'?{dx:MARKET_B1_DEST[0]-x,dz:MARKET_B1_DEST[1]-z}:['1F','1M'].includes(f.label)?{dx:destination[0]-x,dz:destination[1]-z}:ARR)}));
    basement.floors=menu.filter(f=>f.y<7); // T2: no invisible basement call buttons in upper shops
    const basementCall=K._.interactables.find(it=>it.elevator===basement);if(basementCall)basementCall.y=LV.B2;
    upper.floors=menu.map(f=>f.y>=7?{...f,...ARR}:{...f,dx:f.dx+x-ux,dz:f.dz+z-uz});
    // Destination menus may include other lobbies, but calls only exist at
    // physically present upper cars. Explicit per-floor y prevents phantom HUD.
    const call=K._.interactables.find(it=>it.elevator===upper);
    if(call){call.y=7;for(const f of ELV_FLOORS.filter(f=>f.y>7))K.interact({...call,y:f.y});}

  });
  for(const bank of UPPER_BANKS)for(let i=0;i<2;i++){
    const side=bank.face==='N'||bank.face==='S',u=bank.u+(side?(i-.5)*2.7:0),v=bank.v+(side?0:(i-.5)*2.7),[x,z]=P(u,v);
    const du=bank.face==='E'?2.5:bank.face==='W'?-2.5:0,dv=bank.face==='N'?-1.7:bank.face==='S'?2:0,dest=P(u+du,v+dv);
    K.elevator({name:`신세계 고객 엘리베이터 (${bank.key} ${i+1}호기)`,x,z,rotY:FACE[bank.face],w:2.4,d:2.2,
      floors:ELV_FLOORS.filter(f=>f.y>=7&&f.y<=LV[bank.top]).map(f=>({...f,dx:dest[0]-x,dz:dest[1]-z})),mat:0xc9c2b4});
  }
  NWLIFTS.forEach((e,i)=>{
    const[x,z]=P(e.u,e.v),parking=P(ELV[i].u,ELV[i].v-2.2);
    const low=['1F','1M'];
    const el=K.elevator({name:`북서벽 고객 엘리베이터 ${i+1}호기`,x,z,rotY:FACE.S,w:e.w,d:e.d,shaft:false,
      floors:ELV_FLOORS.filter(f=>f.y<7).map(f=>({...f,...(f.label==='B2'?{dx:parking[0]-x,dz:parking[1]-z}:f.label==='B1'?{dx:MARKET_B1_DEST[0]-x,dz:MARKET_B1_DEST[1]-z}:{dx:2.8*SA,dz:2.8*CA})}))});
    // A remote floor menu does not make a physical call point on those floors.
    const call=K._.interactables.find(it=>it.elevator===el);if(call)call.y=1.8;
    for(const label of low){
      const y=LV[label],u0=e.u-e.w/2,u1=e.u+e.w/2,v0=e.v-e.d/2,v1=e.v+e.d/2;
      for(const ab of [[u0,v0,u0,v1],[u0,v0,u1,v0],[u1,v0,u1,v1]])wall(...ab,y,y+3.1,{mat:0xeae3d6,thick:.12});
      wall(u0,v1,u1,v1,y,y+3.1,{mat:'metal',thick:.12,openings:[{at:e.w/2,w:1.4,y0:y,y1:y+2.35}]});
      K.slab(rect(u0,v0,u1,v1),y,{mat:'metal',thick:.05,ceil:false,edge:false});
      sign(label,e.u,v1+.09,y+2.55,'S',.7,.24,{bg:'#282921',fg:'#f3ca82'});
      box(e.u+.94,v1+.1,.14,.05,y+1,.24,0x4a4941,{solid:false});
      sign('↑ ↓',e.u+.94,v1+.14,y+1.13,'S',.12,.18,{bg:'#25251f',fg:'#ffe5ac'});
      lightPanel(e.u,v1+1.2,y+3.08,1.8,1.6);
    }
  });
  // F05: the guide's SE lobby enters only from the north, between Dyson and Dior.
  wall(59.15,66.6,59.15,79.4,0,3.1,{mat:0xeae3d6,thick:.14});
  wall(59.15,79.4,67,79.4,0,3.1,{mat:0xeae3d6,thick:.14,openings:[{at:2.95,w:1.4,y0:0,y1:2.35},{at:5.95,w:1.4,y0:0,y1:2.35}]});
  [62.1,65.1].forEach((u,i)=>{
    const v=80.6,[x,z]=P(u,v),remote=P(UPPER_ELV[i].u,UPPER_ELV[i].v-2.2),parking=P(ELV[i].u,ELV[i].v-2.2),nw=P(NWLIFTS[i].u,NWLIFTS[i].v+2.8);
    const el=K.elevator({name:`남동 고객 엘리베이터 ${i+1}호기`,x,z,rotY:FACE.N,w:2.6,d:2.4,topH:3.1,floors:[{label:'1F',y:0,dx:-2.8*SA,dz:-2.8*CA}]});
    el.floors=ELV_FLOORS.map(f=>({...f,...(f.label==='1F'?{dx:-2.8*SA,dz:-2.8*CA}:f.label==='B2'?{dx:parking[0]-x,dz:parking[1]-z}:f.label==='B1'?{dx:MARKET_B1_DEST[0]-x,dz:MARKET_B1_DEST[1]-z}:f.label==='1M'?{dx:nw[0]-x,dz:nw[1]-z}:{dx:remote[0]-x,dz:remote[1]-z})}));
    const call=K._.interactables.find(it=>it.elevator===el);if(call)call.y=0;
  });
  furnish('1F',()=>{
    sign('엘리베이터 · 전층 안내',15,7.7,2.48,'S',3.1,.4,{bg:'#625543',fg:'#fff4dc'});
    sign(ELV_FLOORS.slice().reverse().map(f=>`${f.label}  ${f.name}`),18.3,7.6,1.55,'S',2.2,2.45,{bg:'#eee5d5',fg:'#403c35',bold:false,pxPerM:110});
    box(63.4,72,.85,.55,0,.86,{tex:'metal',color:0xb8bcb9});
    box(63.4,72,.9,.6,.86,.07,{tex:'metal',color:0xe0e2dc},{solid:false});
    box(63.4,72,.61,.38,.934,.025,0x727c7b,{solid:false});
    box(63.65,72.1,.045,.045,.92,.24,0xc5cbc8,{solid:false});
    sign('음수대',63.4,72.32,1.6,'S',1.2,.3,{bg:'#eae5dc',fg:'#514c43'});
    sign('엘리베이터',63,79.25,2.65,'N',3,.35,{bg:'#625543',fg:'#fff4dc'});
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
    const obstacles = [[ATR[0] - 0.5, ATR[1] - 0.5, ATR[2] + 0.5, ATR[3] + 0.5], [27, 62, 40, 73], [24, 55, 43, 65], [58, 51.1, UW, 57.9], [61.8,66.8,65.4,78.6], ...CORES.map(c => [c.uL - 0.5, c.v0 - 0.5, c.uR + 0.5, c.v1 + 0.5])];
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
    const BRASS = 0xa78b51, CREAM = 0xefe5cf;
    const glow = { tex: 'emit', color: 0xffe6b7 };
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
    // Round 7: marble inlays and seasonal woven carpet sampled from the close photographs.
    K.texture('ssg_diamond_marble',512,512,(g,w,h)=>{
      g.fillStyle='#f0eee7';g.fillRect(0,0,w,h);
      for(let i=0;i<26;i++){g.strokeStyle=i%4?'rgba(155,151,140,.20)':'rgba(120,119,113,.24)';g.lineWidth=1;g.beginPath();g.moveTo(i*25-90,0);g.bezierCurveTo(i*25+70,150,i*25-60,380,i*25+20,h);g.stroke();}
      g.strokeStyle='#b7b2a7';g.lineWidth=1;g.strokeRect(0,0,w,h);
      for(const [x,z] of [[0,0],[w,0],[0,h],[w,h]]){g.fillStyle='#242527';g.beginPath();g.moveTo(x-42,z);g.lineTo(x,z-42);g.lineTo(x+42,z);g.lineTo(x,z+42);g.closePath();g.fill();}
    },[.65,.65]);
    K.material('ssg_diamond_gloss',new K.THREE.MeshPhongMaterial({map:K.T.surface('ssg_diamond_marble').tex,shininess:90,specular:0xa8a199}));
    function chandelier(u,v,ceiling) {
      const yy=ceiling-.9;
      cyl(u,v,yy,.028,.9,0x39332b,false,8);
      const [x,z]=P(u,v);K.cyl({x,z,y:yy,r:.46,h:.045,seg:16,caps:false,mat:0x39332b,solid:false});
      for(let i=0;i<6;i++){const a=i*PI/3,uu=u+Math.cos(a)*.46,vv=v+Math.sin(a)*.46; cyl(uu,vv,yy-.18,.018,.4,BRASS,false,6);globe(uu,vv,yy+(i%2?.22:-.19),.16);}
      globe(u,v,yy-.34,.18);
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
    for(const c of cells){
      if(c.name==='보앤미')c.kind='bakery';
      c.planPolygon=overrides[c.name]||BRECT(...c.rect);
    }
    // Round19 L3: two 1 m lanes descend beside the east wall, with no 1F cut.
    // The icon fixes the upper approach only: the 8.7 m run and B2 vestibule are
    // inferred, reserving the east edge of 특설행사장 without moving that cell.
    for(const [i,u]of B1_SUBWAY_ESC.lanes.entries()){
      const a=P(u,B1_SUBWAY_ESC.bottomV),b=P(u,B1_SUBWAY_ESC.topV);
      K.escalator(...a,...b,{ya:LV.B2,yb:y,w:1,dir:i?'up':'down',sideMat:0xc9cccf,truss:0xa7aaa9});
    }
    const[eu0,ev0,eu1,ev1]=B1_SUBWAY_ESC.hole;
    for(const u of[eu0,eu1]){
      wall(u,ev0,u,ev1,y,y+1.1,{mat:'glass',thick:.065});
      box(u,(ev0+ev1)/2,.07,ev1-ev0,y+1.07,.055,0x9fa4a3,{solid:false});
    }
    wall(eu0,ev0,eu1,ev0,y,y+1.1,{mat:'glass',thick:.065});
    const[vu0,vv0,vu1,vv1]=B1_SUBWAY_ESC.vestibule;
    K.slab(rect(vu0,vv0,vu1,vv1),LV.B2,{mat:{tex:'tile',color:0xe3ded2},thick:.08,under:false,ceil:false,edge:false});
    for(const u of[vu0,vu1])wall(u,vv0,u,vv1,LV.B2,LV.B2+2.75,{mat:CREAM,thick:.13});
    wall(vu0,vv0,vu1,vv0,LV.B2,LV.B2+2.75,{mat:0x8e9491,thick:.13});
    K.hpoly(CREAM,rect(vu0,vv0,vu1,vv1),LV.B2+2.8,false);
    sign('고속터미널역 3·7·9호선',(vu0+vu1)/2,vv0+.08,LV.B2+2.25,'S',2.8,.35,{bg:'#333c37',fg:'#fff9e9'});
    lightPanel((vu0+vu1)/2,(vv0+vv1)/2,LV.B2+2.74,2.4,.09,0xf8f2df);
    zone('지하철 연결 승강장','B2','고속터미널역 3·7·9호선',B1_SUBWAY_ESC.vestibule,LV.B2,LV.B2+2.8,7);

    const worldPoly=c=>BPOLY(c.planPolygon||overrides[c.name]||BRECT(...c.rect));
    // Clip surface-only finishes as well as the structural slab around the new
    // well. Four disjoint half-plane pieces also handle a hole crossing a cell edge.
    function b1Surface(mat,poly,yy){
      const local=poly.map(q=>BPLAN(...q));
      const clip=(p,axis,edge,greater)=>{
        const out=[];for(let i=0;i<p.length;i++){
          const a=p[i],b=p[(i+1)%p.length],A=greater?a[axis]>=edge:a[axis]<=edge,B=greater?b[axis]>=edge:b[axis]<=edge;
          if(A)out.push(a);if(A!==B){const t=(edge-a[axis])/(b[axis]-a[axis]);out.push([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t]);}
        }return out;
      };
      const mid=clip(clip(local,1,ev0,true),1,ev1,false);
      for(const p of[clip(local,1,ev0,false),clip(local,1,ev1,true),clip(mid,0,eu0,false),clip(mid,0,eu1,true)])
        if(p.length>=3)K.hpoly(mat,p.map(q=>P(...q)),yy,true);
    }
    const uvRect=c=>{const[a,b,d,e]=c.rect,[u1,v0]=BPLAN(a,b),[u0,v1]=BPLAN(d,e);return[u0,v0,u1,v1];};
    const officialFace=f=>({N:'N',S:'S',E:'W',W:'E',SE:'S',NW:'N'}[f]||'S');
    const oldCoreRects=CORES.filter(c=>c.door!=='W').map(c=>[c.uL-.25,c.v0-.4,c.uR+.25,c.v1+.4]);
    const reserves=[...oldCoreRects,[37.4,-1,39.6,5.5],[61.9,69.3,65.3,79.1],
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
      K.zone({name:c.name,floor:'B1',sub:c.brands?c.brands.join(' · '):'신세계 강남점 지하1층',poly:c.name==='대형 캐리어 무인 물품보관함'?rect(...(()=>{const [u0,v0,u1]=uvRect(c);return[u0+.2,v0+.08,u1-.2,v0+.53];})()):worldPoly(c),y0:y,y1:-1,priority:c.kind==='service'?6:5});
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
    // Round18: sampled north-deli finishes (photos 16/19), kept inside the
    // official cells. These black pavilions are distinct from Sweet Park.
    K.texture('ssg_deli_tile',256,256,(g,w,h)=>{
      g.fillStyle='#1e1c1a';g.fillRect(0,0,w,h);g.strokeStyle='#3a3633';g.lineWidth=2;
      for(let k=0;k<8;k++){g.strokeRect(k*32,0,32,h);g.strokeRect(0,k*32,w,32);}
    },[1.2,1.2]);
    // Specular glaze preserves the photographed black; the generic gloss cube
    // mixes in cream and made these kiosks read as grey-brown in round18.
    K.material('ssg_deli_black_glaze',new K.THREE.MeshPhongMaterial({map:K.T.surface('ssg_deli_tile').tex,shininess:95,specular:0x8e8982}));
    K.material('ssg_camel_chrome',new K.THREE.MeshPhongMaterial({color:0xc9cccf,emissive:0x242729,shininess:110,specular:0xf2f4f5}));
    K.texture('ssg_deli_quatrefoil',256,128,(g,w,h)=>{
      g.fillStyle='#1e1c1a';g.fillRect(0,0,w,h);
      for(let i=0;i<4;i++){
        const cx=32+i*64;g.fillStyle='#fff6df';g.fillRect(cx-27,9,54,110);
        g.fillStyle='#292621';g.beginPath();g.arc(cx,64,17,0,PI*2);g.fill();
        g.fillRect(cx-1,9,2,110);g.fillRect(cx-27,63,54,2);
      }
    },[1.4,.35]);
    K.texture('ssg_deli_red_checker',256,256,(g,w,h)=>{
      for(let i=0;i<4;i++)for(let j=0;j<4;j++){
        g.fillStyle=(i+j)%2?'#f1eee5':(i%2?'#823c36':'#252421');g.fillRect(i*64,j*64,64,64);
      }
    },[1.2,1.2]);
    K.texture('ssg_bicheng_jade',256,256,(g,w,h)=>{
      g.fillStyle='#2e6b5a';g.fillRect(0,0,w,h);g.strokeStyle='#769487';g.lineWidth=1.5;
      for(let j=0;j<8;j++)for(let i=-1;i<8;i++)g.strokeRect(i*36+(j%2)*18,j*32,36,32);
    },[.8,.8]);
    K.texture('ssg_cinema_portrait',256,384,(g,w,h)=>{
      g.fillStyle='#b5b4af';g.fillRect(0,0,w,h);g.fillStyle='#2c2c2b';
      g.beginPath();g.ellipse(128,159,67,101,0,0,PI*2);g.fill();
      g.fillStyle='#dedbd2';g.beginPath();g.ellipse(122,158,50,78,-.08,0,PI*2);g.fill();
      g.fillStyle='#484845';g.fillRect(81,137,29,7);g.fillRect(138,137,29,7);g.fillRect(100,204,47,5);
      g.beginPath();g.moveTo(18,384);g.lineTo(67,265);g.lineTo(188,265);g.lineTo(238,384);g.fill();
    },[1,1.4]);
    K.texture('ssg_cinema_aerial',256,384,(g,w,h)=>{
      g.fillStyle='#c2c1b8';g.fillRect(0,0,w,h);
      for(let j=0;j<9;j++)for(let i=0;i<6;i++){
        g.fillStyle=['#4b4c48','#797b72','#92958a'][(i+j)%3];g.fillRect(i*45+7,j*44+6,27,31);
      }
      g.strokeStyle='#e2e1d6';g.lineWidth=17;g.beginPath();g.moveTo(0,330);g.lineTo(256,70);g.stroke();
    },[1,1.4]);
    K.texture('ssg_cinema_plane',256,384,(g,w,h)=>{
      // A colour aviation print complements the existing monochrome prints.
      // It is a schematic artwork, not an identification of the film poster.
      g.fillStyle='#8099a1';g.fillRect(0,0,w,h);
      for(let j=0;j<12;j++){g.fillStyle=['#9eafaf','#6c838c','#bac6c0'][j%3];g.fillRect(0,j*35,w,5+j%4*3);}
      g.fillStyle='#d9d6c7';g.beginPath();g.moveTo(133,42);g.lineTo(144,173);g.lineTo(244,239);g.lineTo(243,253);g.lineTo(141,220);g.lineTo(137,304);g.lineTo(170,329);g.lineTo(169,342);g.lineTo(128,326);g.lineTo(88,342);g.lineTo(87,329);g.lineTo(120,304);g.lineTo(116,220);g.lineTo(14,253);g.lineTo(13,239);g.lineTo(113,173);g.lineTo(124,42);g.closePath();g.fill();
      g.fillStyle='#394f5a';g.fillRect(124,72,9,45);
    },[1,1.4]);
    function cellFrame(c){
      const[u0,v0,u1,v1]=uvRect(c),face=officialFace(c.frontage_image),along=face==='N'||face==='S';
      const W=along?u1-u0:v1-v0,D=along?v1-v0:u1-u0;
      const at=(s,t)=>face==='S'?[u0+s,v1-t]:face==='N'?[u1-s,v0+t]:face==='E'?[u1-t,v1-s]:[u0+t,v0+s];
      const bb=(s,t,w,d,yy,h,mat,solid=false)=>{const[u,v]=at(s,t),uw=along?w:d,vd=along?d:w;if(fits(c,u,v,uw,vd))box(u,v,uw,vd,yy,h,mat,{solid});};
      const sg=(text,s,t,yy,w,h,style={})=>sign(text,...at(s,t),yy,face,w,h,style);
      return{W,D,at,bb,sg,face};
    }
    function bottle(u,v,yy,col=0x44472c,scale=1){
      cyl(u,v,yy,.055*scale,.22*scale,col,false,8);
      cyl(u,v,yy+.22*scale,.024*scale,.10*scale,col,false,8);
      cyl(u,v,yy+.315*scale,.027*scale,.028*scale,0x3b3226,false,8);
      cyl(u,v,yy+.065*scale,.056*scale,.085*scale,0xe9debd,false,8);
    }
    function deliCoffer(u,v,w,d){
      const pts=[[-.5,-.35],[-.35,-.5],[.35,-.5],[.5,-.35],[.5,.35],[.35,.5],[-.35,.5],[-.5,.35]];
      const poly=pts.map(([a,b])=>P(u+a*w,v+b*d));
      K.hpoly({tex:'metal',color:0xc9a35a},poly,y+4.80,false);
      for(let k=0;k<8;k++){
        const a=poly[k],b=poly[(k+1)%8];
        K.wall(...a,...b,y+4.48,y+4.78,{mat:0x9f7c42,thick:.12,solid:false});
        K.wall(...a,...b,y+4.73,y+4.77,{mat:{tex:'emit',color:0xc9a35a},thick:.04,solid:false});
      }
    }
    function deliPavilion(c){
      const{W,D,at,bb,sg}=cellFrame(c),w=Math.min(W-.12,5.4),d=Math.min(D-.12,3.0),t=d/2+.06;
      if(w<.55||d<.7)return;
      for(const s of [W/2-w/2+.04,W/2+w/2-.04])for(const tt of [.10,d-.02])bb(s,tt,.065,.065,y+1.3,1.36,0x1e1c1a);
      bb(W/2,t,w,d,y+2.6,.37,{tex:'ssg_deli_quatrefoil',gloss:.5});
      bb(W/2,t,w+.03,d+.03,y+2.98,.10,{color:0x1e1c1a,gloss:.7});
      bb(W/2,t,w,d,y+2.56,.045,0x292620);
      const name=c.name==='블루버터플라이'?'Blue butterfly':c.name;
      sg(name,W/2,.025,y+2.79,Math.max(.45,w-.10),.24,{bg:'#1e1c1a',fg:'#fff6df',bold:false,font:c.name==='블루버터플라이'?'cursive':'Georgia, serif',twoSided:false});
      deliCoffer(...at(W/2,t),Math.min(3,Math.max(.7,w)),Math.min(3,d));
      if(c.name==='블루버터플라이'){
        // Photo 19 has a red/white/black checker directly under the counter.
        const r=uvRect(c);finish([r[0]+.05,r[1]+.05,r[2]-.05,r[3]-.05],y+.019,{tex:'ssg_deli_red_checker',gloss:.7},1.2);
        for(const s of [.13,W-.13])bb(s,D-.18,.20,.28,y,3.2,{tex:'marble',color:0x718074,gloss:.5});
      }
      // A stool sits in its kiosk's cell, never across the public through aisle.
      const[u,v]=at(W-.35,Math.min(D-.4,1.8));
      if(W>1.2&&D>2.2&&fits(c,u,v,.48,.48)){
        cyl(u,v,y+.70,.23,.10,0xa3282c);cyl(u,v,y+.06,.026,.64,0x292724);
        bb(W-.35,Math.min(D-.4,1.8)+.20,.40,.065,y+.76,.32,0xa3282c);
      }
    }
    function brandInterior(c){
      const{W,D,at,bb,sg,face}=cellFrame(c);
      if(c.name==='비첸향'){
        bb(W/2,D-.14,W-.14,.16,y+.55,2.45,'ssg_bicheng_jade');
        for(let row=0;row<3;row++){
          bb(W/2,D-.45,W-.3,.65,y+.62+row*.57,.065,{color:0x972925,gloss:.5});
          for(let k=0;k<Math.max(2,Math.floor(W/.34));k++)bb(.24+k*.34,D-.47,.24,.22,y+.7+row*.57,.31,0xb52326);
        }
        bb(W/2,.04,W-.08,.12,y+3.10,.45,0x211d1a);
        sg('BEE CHENG HIANG 美珍香',W/2,-.04,y+3.32,W-.20,.28,{bg:'#211d1a',fg:'#ffffff',bold:false});
      }
      if(c.name==='보앤미'){
        for(let s=.12;s<W;s+=.27){
          const[frontU,v]=at(s,0),depth=frontU-B1u(v>B1v(717)?906:920);
          bb(s,depth/2,.09,depth-.25,y+3.35,.18,{tex:'wood',color:0xc8a77b});
        }
        for(const s of [.1,W-.1])bb(s,.10,.13,.25,y,3.25,{tex:'wood',color:0xc8a77b});
        const gap=Math.min(1.6,W*.36),panel=(W-gap)/2;
        for(const s of [panel/2,W-panel/2])bb(s,.13,panel-.12,.035,y+.08,3.12,'glass');
        sg('BO&MIE',W/2,.09,y+2.28,Math.min(W-.3,4.5),.72,{bg:null,fg:'#bc9552',bold:false,font:'Georgia, serif'});
        sg('VIENNOISERIE · PATISSERIE',W/2,.07,y+1.63,Math.min(W-.3,4.7),.25,{bg:null,fg:'#bc9552',bold:false});
        for(const[px,py0,py1]of[[920,655,717],[906,717,776]]){
          const bu=B1u(px)+.40,v0=B1v(py0)+.15,v1=B1v(py1)-.15;
          for(let row=0;row<3;row++){
            box(bu,(v0+v1)/2,.65,v1-v0,y+.48+row*.48,.045,{tex:'wood',color:0xc8a77b},{solid:false});
            for(let bv=v0+.2;bv<v1-.1;bv+=.38){
              const[x,z]=P(bu+.08,bv);K.dome({x,z,y:y+.58+row*.48,rx:.15,ry:.095,rz:.11,seg:8,rings:5,mat:0xd4a369});
            }
          }
        }
      }
      if(c.name==='발효곳간'){
        // Frame M27U_300 establishes these cream lacquer shelves. The video's
        // superimposed 발효:곳간 title is not used as evidence for a black fascia.
        for(const[px,py0,py1]of[[920,540,595],[889,595,655]]){
          const bu=B1u(px)+.10,v0=B1v(py0)+.12,v1=B1v(py1)-.12,span=v1-v0;
          box(bu,(v0+v1)/2,.08,span,y,2.42,{color:0xf0eadb,gloss:.3},{solid:false});
          for(const v of[v0,v1]){
            box(bu+.24,v,.56,.08,y,2.42,{color:0xf0eadb,gloss:.3},{solid:false});
            box(bu+.525,v,.018,.06,y+.12,2.26,0x282723,{solid:false});
          }
          for(let row=0;row<4;row++){
            box(bu+.26,(v0+v1)/2,.55,span,y+.26+row*.54,.055,{color:0xf0eadb,gloss:.3},{solid:false});
            box(bu+.54,(v0+v1)/2,.018,span,y+.26+row*.54,.025,0x272824,{solid:false});
            box(bu+.11,(v0+v1)/2,.025,span-.1,y+.70+row*.54,.025,{tex:'emit',color:0xffefcf},{solid:false});
            for(let v=v0+.20,k=0;v<v1-.15;v+=.28,k++)bottle(bu+.32,v,y+.315+row*.54,[0x6e4b32,0x454d37,0xa37b32,0x31554d][k%4],.82+(k%3)*.09);
          }
        }
        sg('발효곳간',W/2,.04,y+2.8,Math.min(W-.3,3),.30,{bg:null,fg:'#3d3932',bold:false});
      }
      if(c.name==='카멜커피'){
        // The cell is a trapezoid: a bbox-wide rear panel fails fits() and vanishes.
        // Follow its actual straight back edge beside the cinema instead.
        const pu=B1u(736)+.06,pv0=B1v(1036)+.12,pv1=B1v(1123)-.12;
        wall(pu,pv0,pu,pv1,y,y+2.8,{mat:0xd9b98a,thick:.08,solid:false});
        const[su,sv]=at(W*.68,Math.max(.5,D-1));
        if(fits(c,su,sv,.35,.35)){
          customer(su,sv,true);cyl(su,sv,y+1.67,.13,.10,0xf7f4e9);
        }
      }
    }
    function counter(c,index){
      const r=uvRect(c),[u0,v0,u1,v1]=r,W=u1-u0,D=v1-v0,face=officialFace(c.frontage_image);
      const horizontal=face==='N'||face==='S';
      let w=horizontal?Math.max(.7,Math.min(W-.45,5.4)):Math.max(.6,Math.min(W-.45,.95));
      let d=horizontal?Math.max(.55,Math.min(D-.45,.95)):Math.max(.7,Math.min(D-.45,4.8));
      const preferred=[(u0+u1)/2,(v0+v1)/2];
      if(face==='N')preferred[1]=v0+.75;if(face==='S')preferred[1]=v1-.75;
      if(face==='E')preferred[0]=u1-.75;if(face==='W')preferred[0]=u0+.75;
      if(c.name==='보앤미'){d=Math.min(D*.35,3);preferred[1]=v0+D*.25;}
      let at=null;
      for(const scale of [1,.75,.5,.35,.25]){
        const ww=w*scale,dd=d*scale;
        const candidates=[preferred];
        for(let uu=u0+ww/2+.15;uu<u1-ww/2;uu+=.2)for(let vv=v0+dd/2+.15;vv<v1-dd/2;vv+=.2)candidates.push([uu,vv]);
        at=candidates.find(([u,v])=>fits(c,u,v,ww,dd));
        if(at){w=ww;d=dd;break;}
      }
      const sU=Math.max(u0+.35,Math.min(u1-.35,preferred[0])),sV=Math.max(v0+.35,Math.min(v1-.35,preferred[1]));
      const signName=c.name==='건강식품 복합셀'?'정관장 · 건강식품':c.name;
      if(!['보앤미','발효곳간','비첸향'].includes(c.name)&&!(c.zone==='north_deli'&&c.kind==='deli'))
        sign(signName,sU,sV,y+2.25,face,Math.max(.8,Math.min(horizontal?W-.2:D-.2,6.4)),.40,{bg:c.kind==='popup'?'#6f2334':'#3b382d',fg:'#f4e4bd',twoSided:true,pxPerM:120});
      // A retained structural core may consume a tiny schematic cell. Keep its
      // plan sign at that cell, record the exception instead of moving its shop.
      if(!at){
        sign(signName,sU,sV,y+2.25,face,Math.max(.65,Math.min(horizontal?W-.2:D-.2,6.4)),.34,{bg:'#302c24',fg:'#f4ead9',twoSided:true});
        return;
      }
      const[u,v]=at,wood=c.name==='카멜커피'?0xd9b98a:c.name==='보앤미'?0xc8a77b:c.name==='블루버터플라이'?0x63422a:c.kind==='wine'?0x493529:c.kind==='deli'?0xb8925d:0x7e6044;
      const darkDeli=c.zone==='north_deli'&&c.kind==='deli';
      box(u,v,w,d,y,.83,darkDeli&&c.name!=='블루버터플라이'?'ssg_deli_black_glaze':c.name==='카멜커피'?wood:{tex:'wood',color:wood});
      box(u,v,w+.025,d+.025,y+.83,.06,{tex:'marble',color:darkDeli||c.name==='카멜커피'?0x292824:0xe9debf,gloss:.7},{solid:false});
      if(c.name==='블루버터플라이'){
        for(const du of [-w/2+.03,w/2-.03])box(u+du,v,.025,d+.015,y+.10,.65,BRASS,{solid:false});
        for(const yy of [.10,.74])box(u,v,w+.02,d+.02,y+yy,.025,BRASS,{solid:false});
      }
      if(['deli','bakery'].includes(c.kind)){
        box(u,v,w-.04,d-.04,y+.9,.42,'glass',{solid:false});
        for(const du of [-w/2+.05,w/2-.05])for(const dv of [-d/2+.05,d/2-.05])box(u+du,v+dv,.025,.025,y+.9,.43,BRASS,{solid:false});
        box(u,v,w,d,y+1.31,.025,BRASS,{solid:false});
      }
      const nx=Math.max(2,Math.floor(w/.28)),nz=Math.max(2,Math.floor(d/.28));
      for(let a=0;a<nx;a++)for(let b=0;b<nz;b++){
        const uu=u-w*.4+(a+.5)*w*.8/nx,vv=v-d*.4+(b+.5)*d*.8/nz;
        if(c.kind==='cafe'&&Math.abs(uu-u)<.36&&Math.abs(vv-v)<.3)continue;
        if(c.name==='발효곳간'){
          // Sample bottles on the counter; the stock belongs on the lit wall.
          if(b===0&&a%Math.max(1,Math.ceil(nx/8))===0)bottle(uu,vv,y+.90,[0x4b4930,0x735039,0x535c3e][a%3],.8);
          continue;
        }
        box(uu,vv,Math.min(.21,w/nx*.8),Math.min(.20,d/nz*.8),y+.90,.08+(a%3)*.035,[0xdbad6a,0xf2d299,0x975c3e,0x93a16b][(a+b+index)%4],{solid:false});
      }
      box(u+w*.28,v+d*.24,.22,.16,y+1.0,.28,0x252b28,{solid:false});
      if(c.name==='카멜커피'&&w>.7&&d>.5){
        // p5QE_620: 0.8×0.55×0.5 m chrome two-group machine, red displays.
        box(u,v,.8,.55,y+.90,.055,'ssg_camel_chrome',{solid:false});
        box(u,v+.12,.8,.31,y+.955,.400,'ssg_camel_chrome',{solid:false});
        box(u,v-.044,.72,.025,y+1.16,.18,0x3e4648,{solid:false});
        box(u,v,.8,.54,y+1.355,.045,'ssg_camel_chrome',{solid:false});
        for(const dx of[-.22,.22]){
          box(u+dx,v-.065,.13,.018,y+1.22,.075,0x242a2d,{solid:false});
          box(u+dx,v-.078,.09,.008,y+1.24,.030,{tex:'emit',color:0xe5312d},{solid:false});
          box(u+dx,v-.13,.11,.19,y+1.12,.07,'ssg_camel_chrome',{solid:false});
          box(u+dx,v-.255,.045,.16,y+1.13,.035,0x252b2a,{solid:false});
          cyl(u+dx,v-.17,y+.96,.05,.095,0xf4eee3);
        }
        for(const dx of[-.35,.35])box(u+dx,v-.14,.025,.10,y+.99,.19,'ssg_camel_chrome',{solid:false});
        for(let n=0;n<4;n++)cyl(u+.24,v+.08,y+1.40+n*.03,.045,.035,0xf5efe4,false,8);
      }else if(c.kind==='cafe'&&w>.7&&d>.5){
        // p5QE_620: chrome espresso machine and ordinary cafe cups. Olive cups
        // belong to the market soup bar (p5QE_380), not to every coffee shop.
        box(u,v,.56,.4,y+.90,.035,{tex:'metal',color:0xbec1bd},{solid:false});
        box(u,v+.08,.49,.23,y+.94,.32,{tex:'metal',color:0x9ca4a0},{solid:false});
        box(u,v-.045,.46,.025,y+1.03,.14,0x1e2825,{solid:false});
        for(const dx of [-.16,0,.16]){
          box(u+dx,v-.09,.035,.10,y+1.01,.04,'metal',{solid:false});
          const[cx,cz]=P(u+dx,v-.12);
          K.cyl({x:cx,z:cz,y:y+.94,r:.04,h:.085,seg:8,mat:0xf4eee3,solid:false});
          K.cyl({x:cx,z:cz,y:y+.966,r:.041,h:.026,seg:8,mat:0xf4eee3,solid:false});
        }
        for(let n=0;n<4;n++)cyl(u+.22,v+.11,y+1.27+n*.03,.045,.035,0xf5efe4,false,8);
      }
      const staff=[u+(face==='E'?-.8:face==='W'?.8:0),v+(face==='S'?-.85:face==='N'?.85:0)];
      if(fits(c,...staff,.35,.35))customer(...staff,true);
      if(c.brands)sign([c.brands.slice(0,4).join(' · '),c.brands.slice(4,8).join(' · '),c.brands.slice(8).join(' · ')],sU,sV,y+1.7,face,Math.min(7,Math.max(W,D)-.3),.8,{bg:'#e9dfcb',fg:'#55472f',twoSided:true});
      // Merchandise shelves stay inside the same official gray cell.
      if(['retail','wine','books','shoes','accessories'].includes(c.kind)&&c.name!=='발효곳간'){
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
      if(darkDeli&&c.name!=='비첸향')deliPavilion(c);
      brandInterior(c);
    }
    function lockers(c){
      const[u0,v0,u1,v1]=uvRect(c),v=v0+(c.name.startsWith('대형')?.305:.6);
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
      const remote=P(UPPER_ELV[1].u,UPPER_ELV[1].v-2.2),nw=P(NWLIFTS[0].u,NWLIFTS[0].v+2.8);
      const floorList=ELV_FLOORS.map(f=>({...f,...(f.label==='B1'?{dx:1.8*SA,dz:1.8*CA}:['1F','1M'].includes(f.label)?{dx:nw[0]-x,dz:nw[1]-z}:{dx:remote[0]-x,dz:remote[1]-z})}));
      const lift=K.elevator({name:c.name,x,z,rotY:RA,w:2,d:1.8,topH:3.2,floors:[{label:'B1',y,dx:1.8*SA,dz:1.8*CA}]});
      lift.floors=floorList;
      // The menu may teleport to a visible remote bank, but this B1 car has no
      // shaft on upper floors. Bound its call prompt to its actual B1 landing.
      const call=K._.interactables.find(it=>it.elevator===lift);if(call)call.y=y;
      K.slab(rect(u-1.3,v-1.2,u+1.3,v+2.4),y,{mat:'metal',thick:.05,ceil:false,edge:false});
      sign('엘리베이터 · 전층 안내',u,v+.95,y+2.7,'S',3.8,.4,{bg:'#373c33',fg:'#f5deb0'});
    }

    // Round14 video finishes preserve every round12 cell and every 1F slab.
    // The market ramp is visible in p5QE9cVtWDM_90 but is unlocated: no invented level change.
    K.detail({floor:'B1',y0:y,y1:0,poly:FULL,name:'B1 보행 영상 · 대리석과 마켓 포털'},()=>{
      K.hpoly('ssg_diamond_gloss',FULL,y+.006,true,[...CORES.filter(c=>c.door!=='W').map(c=>stairHole(c,1)),b1SubwayHole]);
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
        if(c.name.includes('보관함')){lockers(c);continue;}
        b1Surface(c.kind==='supermarket'?'ssg_diamond_gloss':{tex:c.kind==='wine'?'wood':'marble',color:c.kind==='event'?0xe2d3b4:0xf0e5cf,gloss:.5},c.planPolygon,y+.012);
        if(c.name.includes('엘리베이터'))continue;
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
              if(Math.hypot(fu-u,fv-v)<.60)continue; // the photographed fluted column rises through this island
              K.dome({x:fx,z:fz,y:y+.94+row*.12,rx:.115,ry:.12,rz:.115,hemi:false,seg:8,rings:5,mat:[0xe1b934,0xcac54d,0xe49c30][n%3]});
            }
            sign('제철 과일',u+.57,v,y+1.02,'E',1.1,.22,{bg:'#f8f4e8',fg:'#494734',bold:false});
            b1People.push({u:u+1.2,v:v-1.7,staff:true,shirt:0x662e3a});
            continue;
          }
          if(v<mV0+7){
            // Iosn_150: shallow inclined pale timber produce crates, green cards.
            box(u,v,1.1,4.4,y,.82,{tex:'wood',color:0xc9a877});
            for(let level=0;level<3;level++)for(const side of [-1,1]){
              const inner=u+side*.04,outer=u+side*.54,yy=y+.35+level*.30;
              const a=P(inner,v-2.12),b=P(outer,v-2.12),c=P(outer,v+2.12),d=P(inner,v+2.12);
              K.quad({tex:'wood',color:0xc9a877},[[a[0],yy+.13,a[1]],[b[0],yy,b[1]],[c[0],yy,c[1]],[d[0],yy+.13,d[1]]],[0,1,0]);
              box(outer,v,.035,4.32,yy-.015,.12,{tex:'wood',color:0xc9a877},{solid:false});
              for(let k=0;k<6;k++){
                const vv=v-1.78+k*.70;
                box(outer+side*.02,vv,.02,.25,yy+.005,.14,0x2f4a35,{solid:false});
                sign('제철 과일',outer+side*.04,vv,yy+.075,side===1?'E':'W',.24,.065,{bg:'#2f4a35',fg:'#f4eacb',bold:false});
                for(let n=0;n<2;n++){
                  const[xx,zz]=P(u+side*(.22+n*.15),vv),col=[0xd3b349,0xe2bb5b,0xa5ad58,0xc37352][(level+k)%4];
                  K.dome({x:xx,z:zz,y:yy+.15,rx:.095,ry:.105,rz:.11,hemi:false,seg:8,rings:4,mat:col});
                }
              }
            }
          }else if(u>mU0+7&&u<mU0+10&&v<mV0+12){
            // T3: one soup/deli bar replaces a grocery fixture; exact position
            // inside the official market is an estimate, not a located frame.
            box(u,v,1.1,4.4,y,.91,0x272727);
            box(u,v,1.13,4.43,y+.91,.06,{color:0x2a2a2a,gloss:.7},{solid:false});
            for(const vv of [v-1.45,v-.70,v+.05]){
              cyl(u+.1,vv,y+.97,.225,.055,'metal');
              cyl(u+.1,vv,y+1.025,.192,.025,{tex:'metal',color:0xd0d3ce});
              box(u+.1,vv,.10,.04,y+1.052,.035,0x424844,{solid:false});
            }
            box(u-.43,v,.025,4.0,y+1.39,.035,BRASS,{solid:false});
            for(const vv of [v-1.95,v+1.95])box(u-.43,vv,.025,.025,y+.98,.44,BRASS,{solid:false});
            for(let k=0;k<4;k++)for(let level=0;level<5;level++){
              cyl(u-.16,v+.78+k*.26,y+.98+level*.06,.065,.085,0xf6f0df);
              cyl(u-.16,v+.78+k*.26,y+1.003+level*.06,.066,.035,0x879253);
            }
            sign('수프 · 델리',u+.59,v,y+1.5,'E',1.9,.23,{bg:'#272727',fg:'#f3e8cd',bold:false});
          }else if(u<mU0+5){
            // Stainless refrigerated display and electronic shelf tickets.
            box(u,v,1.1,4.4,y,.12,'metal');box(u,v,.10,4.4,y+.12,1.88,0x5e6867);
            box(u,v,1.12,4.43,y+1.94,.08,'metal',{solid:false});
            for(let level=0;level<4;level++)for(const side of [-1,1]){
              const yy=y+.23+level*.43;box(u+side*.28,v,.56,4.4,yy,.045,'metal',{solid:false});
              for(let k=0;k<8;k++){
                const vv=v-1.88+k*.54;box(u+side*.28,vv,.31,.35,yy+.05,.21,[0xeee7c8,0xd1d5bf,0xe8dfd1][k%3],{solid:false});
                box(u+side*.58,vv,.035,.26,yy-.045,.13,0x454c48,{solid:false});
                box(u+side*.60,vv,.015,.22,yy-.025,.09,0xe8ebdf,{solid:false});
              }
              box(u+side*.12,v,.025,4.25,yy+.34,.025,{tex:'emit',color:0xf4f7ef},{solid:false});
            }
          }else{
            // p5QE_20: black steel grocery gondolas stocked with bottles.
            box(u,v,.10,4.4,y,1.55,0x222522);
            for(const vv of [v-2.16,v+2.16])box(u,vv,1.1,.05,y,1.65,0x252925);
            for(let level=0;level<3;level++){
              const yy=y+.20+level*.47;box(u,v,1.12,4.4,yy,.045,0x272b27,{solid:false});
              for(const side of [-1,1])for(let k=0;k<8;k++)bottle(u+side*.33,v-1.84+k*.52,yy+.05,[0x443a25,0x3c4634,0x6d4731][k%3],1.1);
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
        for(const [u,v]of [[mU0+6.35,mV0+6],[mU0+1.8,mV0+15.2]])if(clear(u,v,1.05,1.05)){
          cyl(u,v,y,.49,4.68,0xf0eade,false,24);
          for(let k=0;k<32;k++){const a=k*PI/16;cyl(u+Math.cos(a)*.49,v+Math.sin(a)*.49,y+.12,.013,4.40,0xd7cfc0,false,4);}
          cyl(u,v,y,.55,.12,0xf4efe2,false,24);cyl(u,v,y+4.52,.55,.16,0xf4efe2,false,24);
        }
        // Rectangular dark timber display frames around the market perimeter;
        // M27U_200 does not establish arched transoms here.
        for(let v=mV0+3;v<mV1-2;v+=3){
          const u=mU1-.35;if(!clear(u,v,.5,2.6))continue;
          box(u,v,.16,2.55,y+.12,2.8,{tex:'wood',color:0x65482f},{solid:false});
          for(const vv of [v-1.24,v+1.24])box(u-.12,vv,.23,.10,y+.14,2.78,{tex:'wood',color:0x65482f},{solid:false});
          for(const yy of [.15,1.1,2.84])box(u-.15,v,.28,2.55,y+yy,.10,{tex:'wood',color:0x65482f},{solid:false});
        }
        for(const[px,py,label]of [[670,573,'청과'],[670,710,'그로서리'],[775,610,'정육 · 수산'],[705,740,'계산대']]){
          const[u,v]=BPLAN(px,py);sign(label,u,v,y+2.8,'N',4,.45,{bg:'#354735',fg:'#f3e6c6',twoSided:true});
        }
      }
      if(id==='sw_plaza'){
        b1Surface({tex:'marble',color:0xf4e9d8,gloss:.7},plazaShape,y+.025);
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
        // p5QE_700 follows Camel Coffee: this placement along the adjacent
        // cinema wall is inferred from the video sequence and official adjacency.
        // The poster artwork is an abstract monochrome stand-in, not a film ID.
        const posterPath=[[760,911],[697,969],...cinemaArc].map(p=>BP(...p));
        const posterSegments=posterPath.slice(1).map((b,k)=>({a:posterPath[k],b,L:Math.hypot(b[0]-posterPath[k][0],b[1]-posterPath[k][1])}));
        const posterLength=posterSegments.reduce((s,p)=>s+p.L,0),plazaCentre=BP(650,1014);
        for(let k=0;k<8;k++){
          let t=(k+.5)*posterLength/8,seg=posterSegments[posterSegments.length-1];
          for(const p of posterSegments){seg=p;if(t<=p.L)break;t-=p.L;}
          const dx=(seg.b[0]-seg.a[0])/seg.L,dz=(seg.b[1]-seg.a[1])/seg.L,cx=seg.a[0]+dx*t,cz=seg.a[1]+dz*t;
          let nx=-dz,nz=dx;if(nx*(plazaCentre[0]-cx)+nz*(plazaCentre[1]-cz)<0){nx=-nx;nz=-nz;}
          const half=Math.min(.47,posterLength/16-.04),a=[cx-dx*half+nx*.07,cz-dz*half+nz*.07],b=[cx+dx*half+nx*.07,cz+dz*half+nz*.07];
          K.wall(...a,...b,y+.67,y+2.13,{mat:0x222523,thick:.08,solid:false});
          K.quad(k%2?'ssg_cinema_aerial':'ssg_cinema_portrait',[[a[0]+nx*.05,y+.72,a[1]+nz*.05],[b[0]+nx*.05,y+.72,b[1]+nz*.05],[b[0]+nx*.05,y+2.08,b[1]+nz*.05],[a[0]+nx*.05,y+2.08,a[1]+nz*.05]],[nx,0,nz],[[0,0],[1,0],[1,1],[0,1]]);
        }
        const cinema=cells.find(c=>c.kind==='cinema'),[seatU,seatV]=BPLAN(775,1095);
        for(const[du,dv]of [[-1.25,-1.2],[1.25,-1.2],[-1.25,1.2],[1.25,1.2]]){
          const uu=seatU+du,vv=seatV+dv;if(!fits(cinema,uu,vv,.65,.65))continue;
          cyl(uu,vv,y+.43,.27,.09,{tex:'wood',color:0xc9a478},false,12);
          for(const a of [-.21,.21])for(const b of [-.21,.21])box(uu+a,vv+b,.035,.035,y,.47,0x63503b,{solid:false});
          for(let n=0;n<7;n++)box(uu-.24+n*.08,vv+.22,.023,.03,y+.51,.47,0xc9a478,{solid:false});
          box(uu,vv+.22,.52,.045,y+.96,.06,0xb08b5c,{solid:false});
        }
        if(fits(cinema,seatU,seatV,1.0,1.0)){
          cyl(seatU,seatV,y+.72,.5,.06,{tex:'wood',color:0xc1a377},true,16);cyl(seatU,seatV,y,.08,.72,0x493f33);
        }
        // p5QE_700: freestanding photo prints on easels beside the seating.
        // Retain the wall prints and wooden chairs; the film/artwork is unidentified.
        for(const[du,dv,mat]of[[-3,-2.1,'ssg_cinema_portrait'],[-1.6,-2.1,'ssg_cinema_plane']]){
          const uu=seatU+du,vv=seatV+dv;if(!fits(cinema,uu,vv,1.05,.6))continue;
          box(uu,vv,1.04,.07,y+.54,1.44,0x242725,{solid:false});
          const a=P(uu-.5,vv-.041),b=P(uu+.5,vv-.041);
          K.quad(mat,[[a[0],y+.56,a[1]],[b[0],y+.56,b[1]],[b[0],y+1.96,b[1]],[a[0],y+1.96,a[1]]],[-SA,0,-CA],[[0,0],[1,0],[1,1],[0,1]]);
          for(const dx of[-.36,.36])box(uu+dx,vv,.045,.045,y,.56,0x75624a,{solid:false});
          box(uu,vv+.27,.055,.055,y,.92,0x75624a,{solid:false});
          box(uu,vv-.07,1.12,.16,y+.50,.065,0x75624a,{solid:false});
        }
        for(const du of [-2.35,2.35]){
          const uu=seatU+du,vv=seatV+1.5;if(!fits(cinema,uu,vv,.7,.7))continue;
          cyl(uu,vv,y,.32,.55,0x887454,false,12);
          for(let k=0;k<7;k++){
            const a=k*PI*2/7,[xx,zz]=P(uu+Math.cos(a)*.22,vv+Math.sin(a)*.22);
            K.dome({x:xx,z:zz,y:y+.95+(k%3)*.22,rx:.19,ry:.46,rz:.12,seg:8,rings:5,hemi:false,mat:0x57754c});
          }
        }
        const[screenU,screenV]=BPLAN(741,1127);
        for(let n=0;n<9;n++)box(screenU+.20,screenV-1+n*.25,.045,.035,y+.15,2.6,0x242725,{solid:false});
        for(let n=0;n<7;n++)box(screenU+.20,screenV,.045,2.1,y+.2+n*.4,.04,0x242725,{solid:false});
        for(const du of [-2.4,-1.2,0,1.2,2.4])lightPanel(seatU+du,seatV,y+4.64,.08,6,0xfaf5e7);
        // Curved cornice follows the plaza without putting solid posts in its aisle.
        for(let i=0;i<cinemaArc.length-1;i++){
          const A=BP(...cinemaArc[i]),B=BP(...cinemaArc[i+1]);K.wall(...A,...B,y+3.3,y+3.48,{mat:BRASS,thick:.18,solid:false});
        }
      }
      // M27U_15/200 show flat cream coves in the market. Photos 17/18 show
      // Sweet Park (FIVE GUYS / PIERRE MARCOLINI), not this market or deli hall.
      const[u1,v0]=BPLAN(r[0],r[1]),[u0,v1]=BPLAN(r[2],r[3]);
      if(id==='market'||id==='centre'||id==='west_strip'){
        hq(u0,v0,u1,v1,y+4.86,CREAM,false);
        for(let v=v0+1.1;v<v1-.5;v+=6){
          box((u0+u1)/2,v,u1-u0,.45,y+4.63,.18,CREAM,{solid:false});
          for(const dv of [-.2,.2])lightPanel((u0+u1)/2,v+dv,y+4.80,u1-u0-.25,.035,0xffe6b7);
        }
        for(let u=u0+1.5;u<u1-1;u+=3)for(let v=v0+1.5;v<v1-1;v+=3){
          const[x,z]=P(u,v);K.cyl({x,z,y:y+4.81,r:.085,h:.025,mat:0xb4a687,seg:10,solid:false});
          K.cyl({x,z,y:y+4.805,r:.07,h:.018,mat:{tex:'emit',color:0xffefd2},seg:10,solid:false});
        }
      }
      if(id==='north_deli'){
        // Tile only this hall; per-cell finishes and the market floor above it
        // cover their own footprints, retaining the official white aisles.
        finish([u0+.15,v0+.15,u1-.15,v1-.15],y+.009,{tex:'ssg_checker',gloss:.05},.6);
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
    if(/디올/.test(name))return[0xeeeae3,0xb99b5b,'#eeeae3','#8c743f'];
    if(/에르메스/.test(name))return[0xc6a47b,0xe27123,'#cfb99b','#654b31'];
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
      const brand=/샤넬/.test(name)?'CHANEL':/디올/.test(name)?'DIOR':/에르메스/.test(name)?'HERMÈS':name;
      sign(brand,u,d>2.5?shelfV-.15:cv-dd/2-.04,y+(d>2.5?shelfH+.20:1.38),'N',Math.max(.65,cw),name.length>13?.26:.33,{bg,fg,bold:true,twoSided:true});
      if(floor==='1F'){
        const staffN=w>5.3?2:1;
        for(let j=0;j<staffN;j++)beautyPerson(u+(j-(staffN-1)/2)*1.0,cv+dd/2+.48,y,FACE.N,true,j);
      }
    });
  }
  // F01/F08: outline polygons are traced from the official 1F guide, not fitted boxes.
  const jewelleryWedges=[
    ['타사키',[[209,948],[233,948],[295,992],[276,1019],[270,1009],[234,1063],[234,1100],[209,1100]],[0,1]],
    ['포멜라토',[[295,992],[346,1020],[304,1086],[234,1086],[234,1063],[270,1009],[276,1019]],[0]],
    ['아크레도',[[346,1020],[405,1049],[378,1121],[304,1121],[304,1086]],[0]],
    ['메시카',[[405,1049],[458,1064],[458,1121],[378,1121]],[0]],
    ['키린',[[511,1075],[591,1074],[599,1092],[511,1092]],[0,2]],
    ['스피넬리킬콜린',[[591,1074],[658,1061],[681,1121],[599,1121]],[0]],
    ['골든듀',[[658,1061],[724,1038],[756,1121],[681,1121]],[0]],
    ['스와로브스키',[[724,1038],[795,990],[795,1121],[756,1121]],[0]],
  ];
  // F15: deep neutral-white coffers belong to the beauty hall only.
  K.material('ssg_beauty_ceiling',new K.THREE.MeshLambertMaterial({color:0xf4f2ec,emissive:0x8f8f8b}));
  function beautyCoffer(u0,v0,u1,v1,top=6.48){
    const white='ssg_beauty_ceiling',frame=(inset,width,bottom,height,mat)=>{
      boxR(u0+inset,v0+inset,u1-inset,v0+inset+width,bottom,height,mat,{solid:false});
      boxR(u0+inset,v1-inset-width,u1-inset,v1-inset,bottom,height,mat,{solid:false});
      boxR(u0+inset,v0+inset+width,u0+inset+width,v1-inset-width,bottom,height,mat,{solid:false});
      boxR(u1-inset-width,v0+inset+width,u1-inset,v1-inset-width,bottom,height,mat,{solid:false});
    };
    hq(u0,v0,u1,v1,top,white,false);
    frame(0,.48,top-.52,.5,white);frame(.48,.035,top-.39,.035,0x47463f);
    frame(.515,.20,top-.36,.18,white);frame(.715,.12,top-.20,.12,white);
    frame(.99,.10,top-.06,.055,white);
    for(let u=u0+.7;u<u1-.5;u+=.24)for(const v of[v0+.46,v1-.46])box(u,v,.1,.11,top-.43,.09,white,{solid:false});
    for(let v=v0+.8;v<v1-.6;v+=.24)for(const u of[u0+.46,u1-.46])box(u,v,.11,.1,top-.43,.09,white,{solid:false});
    for(const t of[.15,.38,.62,.85])for(const v of[v0+.24,v1-.24])downlight(u0+(u1-u0)*t,v,top-.52,.07);
  }
  function curvedBoutique(name,pixels,openEdges,eyewear=false) {
    const points=pixels.map(p=>PLAN(...p)),poly=points.map(p=>P(...p)),H=3.1;
    const us=points.map(p=>p[0]),vs=points.map(p=>p[1]),r=[Math.min(...us),Math.min(...vs),Math.max(...us),Math.max(...vs)];
    K.zone({name,floor:'1F',sub:eyewear?'아이웨어':'주얼리',poly,y0:0,y1:H,priority:3});
    beautyObstacles.push(r);
    for(let i=0;i<points.length;i++){
      const a=points[i],b=points[(i+1)%points.length];
      if(!openEdges.includes(i))wall(...a,...b,0,H,{mat:eyewear?0x353733:0xe7dfd0,thick:.12});
    }
    furnish('1F',()=>{
      K.hpoly({tex:eyewear?'darkstone':'marble',color:eyewear?0x494b45:0xeee6d6,gloss:.5},poly,.023);
      const inside=(u,v,pad=.45)=>[-pad,pad].every(du=>[-pad,pad].every(dv=>K.pointInPoly(...P(u+du,v+dv),poly)));
      const fronts=eyewear?openEdges:name==='타사키'?[1]:[openEdges[0]],faceEdge=fronts[0];
      for(const i of fronts){
        const a=poly[i],b=poly[(i+1)%poly.length],dx=b[0]-a[0],dz=b[1]-a[1],L=Math.hypot(dx,dz),angle=Math.atan2(-dz,dx);
        K.wall(...a,...b,2.68,3.06,{mat:eyewear?0x232522:0xe8dfcf,thick:.16,solid:false});
        if(i===faceEdge||eyewear&&i===3)K.sign(name,{x:(a[0]+b[0])/2,z:(a[1]+b[1])/2,y:2.86,w:Math.min(L*.8,5),h:.3,rotY:angle,bg:null,fg:eyewear?'#f0efdf':'#71593c',twoSided:true});
      }
      // Low display islands and back-wall vitrines remain inside the traced cell.
      const candidates=[];
      for(let u=r[0]+.8;u<r[2]-.6;u+=1.6)for(let v=r[1]+1.1;v<r[3]-.55;v+=1.7)if(inside(u,v,.65))candidates.push([u,v]);
      const backCases=candidates.filter(p=>p[1]>r[3]-2.9),islands=candidates.filter(p=>p[1]<r[3]-3.1);
      const selected=[...backCases.slice(0,4),...islands.filter((_,i)=>i%3===0).slice(0,2)];
      for(const [index,[u,v]]of selected.entries()){
        const base=eyewear?0x73766b:0xc6b38f;
        box(u,v,1.1,.58,0,.86,base);box(u,v,1.13,.61,.86,.04,{color:0xe9e3d6,gloss:.7},{solid:false});
        if(!eyewear)box(u,v,1.05,.54,.90,.32,'glass',{solid:false});
        for(let j=0;j<4;j++){
          const uu=u-.36+j*.24;
          box(uu,v,.16,.15,.92,.035,eyewear?0xc2c4b9:0xf1ead9,{solid:false});
          if(eyewear){for(const du of[-.046,.046])box(uu+du,v,.07,.04,.965,.04,0x20241f,{solid:false});box(uu,v,.03,.04,.975,.02,0x33372f,{solid:false});}
          else {box(uu,v,.075,.075,.965,.055,index%2?0xb7a16d:0xd8cbbb,{solid:false});}
        }
        downlight(u,v,3.06,.065);
      }
      const person=candidates.find(([u,v])=>!selected.some(p=>Math.hypot(p[0]-u,p[1]-v)<1.25));
      if(person)beautyPerson(...person,0,FACE.N,true,1);
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
      const chanel=/샤넬/.test(name),dior=/디올/.test(name),hermes=/에르메스/.test(name);
      const fascia=chanel?0x161817:dior?0xeeeae3:hermes?0xcfb99b:0xe9e2d5;
      box(fp[0],fp[1],along?w:.15,along?.15:d,y+2.56,.44,fascia,{solid:false});
      sign(chanel?'CHANEL':dior?'DIOR':hermes?'HERMÈS':name,...fp,y+2.78,face,Math.max(.7,fw*.84),.32,{bg:null,fg:chanel?'#ffffff':dior?'#a48a50':'#534533',bold:false});
      if(kind==='cafe')return; // furnished to the actual frontage in the 1M coffee-room batch
      if(kind==='service') {
        if(name==='여자화장실'){
          for(let vv=v0+2;vv<v1-.8;vv+=2.1){box(u0+.9,vv,1.3,.8,y,.44,0xf2eee3);box(u0+.9,vv+.35,1.3,.22,y+.44,.55,0xf2eee3);wall(u0+.15,vv+1,u1-1,vv+1,y,y+2.2,{mat:0xd8cfbd,thick:.08});}
          box(u1-.65,v, .65,Math.min(d-1,3),y,.83,{tex:'marble',color:0xece5d8});sign('여자화장실',u,v0+.15,y+1.8,'N',1.5,.32,{bg:'#3a3732',fg:'#f4eedf'});
        }else {box(u,v,Math.min(w*.55,2.1),.7,y,.95,0xc5b394);sign(name,u,v-.38,y+1.3,'N',Math.min(w*.8,3),.24,{bg:'#e7dfd0',fg:'#514b42'});}
        return;
      }
      const palette=dior?0xe5e2db:chanel||/루이비통/.test(name)?0x202220:hermes?0xb98d60:0xbfa780;
      const displaySpan=sideDoor?12.5:(along?w:d),sw=along?Math.max(1,w-.5):.45,sd=along?.45:Math.max(1,displaySpan-.5);
      const bu=back==='E'?u1-.28:back==='W'?u0+.28:u,bv=sideDoor?19.9:back==='N'?v0+.28:back==='S'?v1-.28:v;
      box(bu,bv,sw,sd,y+.15,2.22,palette,{solid:false});
      for(let row=0;row<4;row++){
        box(bu,bv,sw+.03,sd+.03,y+.43+row*.45,.04,0xe7dcc7,{solid:false});
        box(bu,bv,sw+.035,sd+.035,y+.47+row*.45,.018,{tex:'emit',color:0xffefd6},{solid:false});
        const n=Math.max(3,Math.floor(displaySpan/.32));
        for(let i=0;i<n;i++){const off=(i/(n-1)-.5)*(displaySpan-.75);box(bu+(along?off:0),bv+(along?0:off),.11,.11,y+.48+row*.45,.19+(i%3)*.03,hermes?(i%3?0xe27123:0xc5ac82):chanel?(i%2?0xffffff:0x1f211f):dior?(i%2?0xf7f4ec:0xb69b64):kind==='cafe'?0xf4ede0:i%2?0xf5e8cc:0xc39d68,{solid:false});}
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
      if(hermes&&name==='에르메스 파빌리온'){
        for(const side of[-1,1])for(let sv=v0+2;sv<v1-1.3;sv+=2.4){
          const backU=side<0?u0+.12:u1-.12,shelfU=side<0?u0+.41:u1-.41,stockU=side<0?u0+.42:u1-.42;
          // F21: a shallow oak back leaves the boxes in front, on visible ledges.
          box(backU,sv,.08,1.8,y+.15,2.15,0xdcb27c,{solid:false});
          for(let row=0;row<4;row++){
            box(shelfU,sv,.5,1.86,y+.5+row*.43,.045,0xdcb27c,{solid:false});
            for(const dv of[-.55,0,.55]){box(stockU,sv+dv,.32,.4,y+.55+row*.43,.23,row%2?0xe16a1d:0xef872d,{solid:false});box(stockU,sv+dv,.33,.41,y+.76+row*.43,.025,0x9a572d,{solid:false});}
          }
        }
        box(u,v-2,2.2,1.15,y,.76,{tex:'wood',color:0xb9946b});box(u,v-2,2.3,1.25,y+.76,.06,0xe9ddc7,{solid:false});
        for(const du of[-.65,0,.65])box(u+du,v-2,.4,.35,y+.82,.24,0xe37b28,{solid:false});
      }
      downlight(u,v,y+H-.06,.07);
    });
  }
  {
    const fl='1F';
    // Indoor outline stops at the photographed recessed GATE2 threshold.
    const groundZone=[P(0,0),P(29.7,0),P(29.7,5),P(39.5,5),P(39.5,0),P(67,0),P(67,VD),P(0,VD)];
    K.zone({name:'신세계백화점 강남점',floor:fl,sub:'화장품 · 향수 · 주얼리',poly:groundZone,y0:0,y1:3.6,priority:1});
    for(const [name,x0,y0,x1,y1]of BEAUTY_CELLS)planCounter(name,planRect(x0,y0,x1,y1));
    for(const [name,x0,y0,x1,y1,face]of EDGE_BOUTIQUES)planBoutique(name,planRect(x0,y0,x1,y1),face);
    for(const [name,px,py]of JEWELLERY.slice(8)){const[u,v]=PLAN(px,py);planCounter(name,[u-.9,v-1.2,u+.9,v+1.2],0,'jewel');}
    for(const [name,pixels,fronts]of jewelleryWedges)curvedBoutique(name,pixels,fronts);
    // The rear 3.5 m service passage reaches retained J5 through the official inter-unit aisle.
    // J5 is a cross-module contract, not a door asserted by this floor guide.
    const gentlePixels=[[631,947],[810,947],[795,964],[772,984],[746,1003],[713,1021],[676,1036],[631,1048]];
    curvedBoutique('젠틀몬스터',gentlePixels,[0,1,2,3,4,5,6],true);
    // F11: the stepped non-public NE corner stops before the preserved stair core.
    for(const ab of[[54.3,0,54.3,13.3],[54.3,13.3,61.1,13.3],[61.1,13.3,61.1,9.5],[61.1,9.5,67,9.5]])wall(...ab,0,3.1,{mat:0xe8e2d7,thick:.14});
    zone('직원 전용','1F','안내도 외 비공개 구역',[54.3,0,67,9.4],0,3.1,4);
    // The two plan bands between the escalator banks hold three separately branded pop-ups.
    // No long counter or legacy central well cuts across these event spaces.
    // F20/F22: photographed 60th-anniversary booth and a loose shopper cluster.
    zone('설화수 팝업',fl,'60주년 기념 행사',[26,37,36,40],0,3,3);
    furnish(fl,()=>{
      hq(26,37,36,40,.024,{color:0xe0461e,gloss:.3});
      box(31,37.08,10,.16,0,2.42,0xd9542a);
      for(const u of[26.08,35.92])box(u,38.5,.16,3,0,2.42,0xd9542a);
      box(31,38.5,10.15,3.1,2.42,.32,0xf5f2e9,{solid:false});
      box(31,40.08,10.15,.12,2.44,.28,0xf7f5ed,{solid:false});
      sign('Sulwhasoo',31,40.16,2.59,'S',3.2,.26,{bg:null,fg:'#d94425',bold:false});
      for(const [j,u]of[27.6,30.9,34.2].entries()){
        box(u,39.6,2.5,.72,0,.98,0xe0461e);box(u,39.6,2.54,.77,.98,.06,0xef6a35,{solid:false});
        for(let k=0;k<4;k++){box(u-.85+k*.56,39.6,.2,.18,1.05,.21,0xc89544,{solid:false});box(u-.85+k*.56,39.6,.21,.19,1.26,.035,0xe2bc71,{solid:false});}
        beautyPerson(u,38.77,0,FACE.S,true,j);
      }
      for(const u of[28.1,33.8]){
        box(u,37.19,1.35,.05,.72,1.44,0xdcc49d,{solid:false});
        sign(['설화수','60주년','자음생크림'],u,37.23,1.44,'S',1.18,1.25,{bg:'#f2e9d8',fg:'#c54828',bold:false});
      }
      // Shield silhouette and gilded hero jar use the reference's visible composition.
      const shield=[[29.95,2.75],[29.95,3.65],[30.25,3.88],[31.05,3.88],[31.35,3.65],[31.35,2.95],[30.65,2.72]].map(([u,yy])=>{const p=P(u,38.6);return[p[0],yy,p[1]];});
      for(let i=1;i<shield.length-1;i++)K.quad(0xf9f7ed,[shield[0],shield[i],shield[i+1],shield[i+1]],[SA,0,CA]);
      sign('60주년',30.65,38.64,3.32,'S',1.15,.68,{bg:null,fg:'#e04421',twoSided:true});
      const jar=P(31,38.25);K.cyl({x:jar[0],z:jar[1],y:1.08,r:.27,h:.30,mat:{color:0xc59649,gloss:.7},seg:16,solid:false});
      K.cyl({x:jar[0],z:jar[1],y:1.38,r:.29,h:.06,mat:{color:0xe4bf76,gloss:.7},seg:16,solid:false});
      beautyObstacles.push([25.95,36.95,36.05,40.08]);
      for(let i=0;i<10;i++)beautyPerson(26.6+i*.94,40.65+(i%3)*.10,0,FACE.N,false,10+i,true);
    });
    for(const [n,px,py,name,col]of [[2,458,729,'팝업',0x6a8a78],[3,520,797,'팝업',0x63556d]]){
      const[u,v]=PLAN(px,py),r=[u-2.5,v-1.2,u+2.5,v+1.2];
      zone(`${name} ${n}`,fl,'화장품관 중앙 행사',r,0,3,3);
      furnish(fl,()=>{
        hq(...r,.024,{color:col,gloss:.3});
        box(u,v,4.4,1.0,0,.97,{color:col,gloss:.5});box(u,v,4.48,1.06,.97,.07,0xf3e7d4,{solid:false});
        for(const du of[-2.1,2.1])box(u+du,v,.065,.065,0,2.4,col,{solid:false});
        sign(`팝업 ${n}`,u,v,2.30,'N',4.5,.36,{bg:'#f3ecdf',fg:'#4b443a',twoSided:true});
        for(let j=0;j<12;j++){const xx=u-1.8+j*.33;box(xx,v,.16,.16,1.05,.22+j%3*.04,j%2?col:0xd6bd91,{solid:false});box(xx,v-.32,.18,.1,1.05,.025,0xffffff,{solid:false});}
        for(const du of[-.9,.9])beautyPerson(u+du,v+1.0,0,FACE.N,true,n);
        beautyObstacles.push([u-2.4,v-.7,u+2.4,v+1.45]);
      });
    }
    const[infoU,infoV]=PLAN(409,799);box(infoU,infoV,1.4,.9,0,1.02,0xe4d7bb);sign('안내데스크',infoU,infoV-.46,1.35,'N',1.7,.3,{bg:'#3f3830',fg:'#f4e8cc'});
    furnish(fl,()=>{beautyPerson(infoU,infoV+.95,0,FACE.N,true);});
    // Plan edge services, clear of both shared-wall doorways.
    planBoutique('여자화장실',planRect(877,872,948,987),'N',0,fl,'service');


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
      for(let u=16;u<61;u+=6.7)for(let v=12;v<67;v+=7){
        // Reserve the live 1F→2F landings; no decorative beam closes an escalator.
        const r=[u,v,u+6.2,v+6.5];
        if(BEAUTY_BANK_RECTS.some(b=>r[0]<b[2]+.4&&r[2]>b[0]-.4&&r[1]<b[3]+.4&&r[3]>b[1]-.4))continue;
        beautyCoffer(...r);
      }
      // F19: source frame identifies the threshold finish; gate attribution is inferred.
      hq(29.8,5,39.4,5.6,.026,{tex:'marble',color:0x8f8d88,gloss:.7});
      hq(29.8,5.6,39.4,8.1,.026,{tex:'marble',color:0xf3f2ec,gloss:.8});
      hq(66.25,33.6,66.85,51.1,.026,{tex:'marble',color:0x8f8d88,gloss:.7});
      for(const[txt,u,v,face]of[['2게이트',34.6,5.4,'S'],['1게이트',66.6,42.35,'W'],['3게이트 · 센트럴시티',.6,42.35,'E'],['1게이트 방면 · 호남선 연결',.6,68,'E']]){
        sign(txt,u,v,2.85,face,5.6,.36,{bg:'#39352f',fg:'#eee2c6',bold:false,twoSided:true});
      }
      // Open doors: side glazing only, with a full clear central passage.
      for(const[u,v,face]of[[0,42.35,'E'],[0,68,'E']])for(const dv of[-3.6,3.6]){
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
      // Bias shoppers toward the photographed popup banks, including ten at the booth.
      const cells=[...BEAUTY_CELLS.map(c=>planRect(...c.slice(1))),...EDGE_BOUTIQUES.map(c=>planRect(...c.slice(1,5))),...JEWELLERY.map(c=>{const p=PLAN(c[1],c[2]);return[p[0]-1.05,p[1]-1.35,p[0]+1.05,p[1]+1.35];})];
      const rng=K.rand(111026),placed=[],target=Math.max(0,204-beautyStaff-10);
      const safe=(u,v)=>u>9&&u<64&&v>12&&v<78&&!(u<15&&v<24)&&!(Math.abs(v-42.35)<1.3)&&!(u<14&&Math.abs(v-68)<4.5)&&!BEAUTY_BANK_RECTS.some(r=>inR(u,v,r,1.0))&&!cells.some(r=>inR(u,v,r,.35))&&!beautyObstacles.some(r=>inR(u,v,r,.6))&&!placed.some(p=>Math.hypot(p[0]-u,p[1]-v)<.72);
      let guard=0;
      while(placed.length<target&&guard++<12000){
        const u=10+rng()*53,v=rng()<.62?36+rng()*13:13+rng()*64;if(!safe(u,v))continue;
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
    const omissions=[upperPhysicalWell(id),upperPhysicalWell(id,true),[19.6,51.5,29.4,55.3],...CORES.map(c=>[c.uL,c.v0,c.uR,c.v1]),[23,0,44,9]];
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
      hq(u-.28,v-.28,u+.88,v+.88,yy+.23,(Math.round(u*5+v*5)%3)?0x434446:0x191b1d,false);
    }
    for(let v=v0;v<VD-.2;v+=.6)for(const[a,b]of runs(.2,UW-.2,v,true))box((a+b)/2,v,b-a,.035,yy,.22,0x2f3234,{solid:false});
    for(let u=.2;u<UW-.2;u+=.6)for(const[a,b]of runs(v0,VD-.2,u,false))box(u,(a+b)/2,.035,b-a,yy,.22,0x2f3234,{solid:false});
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
      ['베키아에누보',638,894,918,970,'N','cafe'],
      ['스킨케어룸',938,421,996,478,'E','service'],['멤버스바',938,480,996,550,'E','cafe'],
      ['비아신세계 트래블 컨시어지',938,553,1036,605,'E','service']
    ];
    for(const[name,x0,y0,x1,y1,face,kind]of units)planBoutique(name,planRect(x0,y0,x1,y1,MPLAN),face,y,fl,kind);
    // F10: cafe follows the curved void, rather than retreating behind a rectangular wall.
    const upperHousePixels=[[375,814],[430,814]];
    for(let px=446;px<=709;px+=17)upperHousePixels.push([px,738+122*Math.sqrt(1-((px-607)/225)**2)]);
    upperHousePixels.push([709,847],[709,894],[636,894],[636,970],[394,970],[394,894],[375,894]);
    const upperHousePoly=upperHousePixels.map(p=>P(...MPLAN(...p)));
    K.zone({name:'어퍼하우스',floor:fl,sub:'카페 · 화장품관 조망',poly:upperHousePoly,y0:y,y1:y+2.9,priority:3});
    for(let i=upperHousePixels.length-7;i<upperHousePixels.length;i++){
      const a=MPLAN(...upperHousePixels[i]),b=MPLAN(...upperHousePixels[(i+1)%upperHousePixels.length]);
      // Short return at the Vecchia side; keep a public access opening from the balcony.
      wall(...a,...b,y,y+2.8,{mat:0xe8e2d7,thick:.12,openings:i===upperHousePixels.length-7?[{at:1.3,w:2.0,y0:y,y1:y+2.5}]:[]});
    }
    furnish(fl,()=>K.hpoly({tex:'wood',color:0xc5b291,gloss:.3},upperHousePoly,y+.018));
    const jewels=['스톤헨지','제이에스티나','디디에두보','어니스트서울','판도라','에떼르노','장폴클라리쎄','알로드'];
    for(let i=0;i<jewels.length;i++){
      const px=937+(i%2)*48,py=685+Math.floor(i/2)*18,[u,v]=MPLAN(px,py);
      planCounter(jewels[i],[u-.7,v-.7,u+.7,v+.7],y,'jewel',fl);
    }
    const rail=(a,b,arcade=false)=>{
      K.wall(...a,...b,y,y+(arcade?.96:1.02),{mat:arcade?0xefe9df:'glass',thick:arcade?.18:.045});
      const dx=b[0]-a[0],dz=b[1]-a[1],L=Math.hypot(dx,dz);
      K.box({x:(a[0]+b[0])/2,z:(a[1]+b[1])/2,y:y+1.02,w:.065,d:L,h:.055,rotY:Math.atan2(dx,dz),mat:0xb29d73,solid:false});
    };
    for(let i=0;i<MEZZ_VOID.length;i++)rail(MEZZ_VOID[i],MEZZ_VOID[(i+1)%MEZZ_VOID.length],i>=4&&i<28);
    wellGuard(NW_ESC,y,'S');
    wellGuard(SW_ESC,y,'N');
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
        const east=face==='E',vecchia=name==='베키아에누보',counterU=u+(east?width*.25:0),counterV=v+(east?0:depth*.1);
        box(counterU,counterV,east?.8:Math.min(width-1,5.6),east?Math.min(depth-1,3.8):.85,y,1.04,vecchia?{tex:'marble',color:0xd8d2c5,gloss:.3}:{tex:'wood',color:0x77503a});
        box(counterU,counterV,east?.89:Math.min(width-.9,5.7),east?Math.min(depth-.9,3.9):.94,y+1.04,.055,{tex:'marble',color:0xece4d7,gloss:.5},{solid:false});
        const mx=counterU,my=counterV+.1;
        box(mx,my,.72,.48,y+1.1,.48,{tex:'metal',color:0xc4c5bf},{solid:false});
        box(mx,my-.25,.68,.05,y+1.17,.22,0x292a29,{solid:false});
        for(const du of[-.23,.23]){box(mx+du,my-.31,.055,.17,y+1.25,.055,0x33332f,{solid:false});box(mx+du,my-.3,.13,.12,y+1.11,.12,0xf5eee3,{solid:false});}
        box(mx+.65,my,.22,.25,y+1.1,.38,0x373a36,{solid:false});
        const p=P(mx+.65,my);K.cyl({x:p[0],z:p[1],y:y+1.48,r:.11,h:.18,mat:'glass',seg:10,solid:false});
        sign(vecchia?['커피 · 베이커리','샌드위치 · 케이크','음료 주문']:['커피 · 티','아메리카노   라테','에스프레소   디저트'],u-(east?width*.27:0),v+(east?0:depth*.43),y+1.95,face,Math.min(width*.65,3.8),.7,{bg:'#2f352e',fg:'#f6edda',bold:false});
        if(vecchia){
          box(counterU-2.0,counterV,1.45,.8,y+1.1,.62,'glass',{solid:false});
          for(let row=0;row<2;row++){box(counterU-2.0,counterV,1.4,.75,y+1.17+row*.27,.035,0xe5dfd4,{solid:false});for(let j=0;j<5;j++)box(counterU-2.5+j*.25,counterV,.19,.32,y+1.21+row*.27,.12,0xba945e,{solid:false});}
        }
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
      cafeFit('어퍼하우스',41.1,80,17.6,7.2,'N');
      // The guide establishes the cafe extent; table count and finishes are estimates.
      for(const px of[452,495,540,584,627,671]){
        const py=738+122*Math.sqrt(1-((px-607)/225)**2)+13,[tu,tv]=MPLAN(px,py);
        box(tu,tv,.86,.76,y+.74,.055,{tex:'wood',color:0xb39773},{solid:false});box(tu,tv,.1,.1,y,.74,0x675a48,{solid:false});
        for(const du of[-.72,.72]){
          box(tu+du,tv,.48,.5,y,.44,0xc4b396,{solid:false});box(tu+du,tv+.2,.48,.08,y+.44,.41,0xc4b396,{solid:false});
          const seat=P(tu+du,tv);K.person(...[seat[0],y,seat[1]],{sit:true,rotY:du>0?FACE.W:FACE.E,shirt:du>0?0xb6b0a3:0x667467,pants:0x4c4d44});
        }
        box(tu,tv,.10,.10,y+.8,.11,0xf5f0e5,{solid:false});
      }
      sign('멤버스바 · 커피',9.0,27.8,y+2.15,'E',3.6,.35,{bg:'#665644',fg:'#fff3dd',twoSided:true});
      sign('베키아에누보 · 어퍼하우스 →',12.1,32.4,y+2.15,'N',4.4,.32,{bg:'#eee6d6',fg:'#514638',twoSided:true});
      // F16: solid plaster arcade, with real spandrels rather than a thin pergola.
      // The photograph resolves the form; opening dimensions and retained bronze cap are estimates.
      const arcade=[];
      for(let i=0;i<=17;i++){const t=.2+(PI-.4)*i/17;arcade.push(P(...MPLAN(607+225*Math.cos(t),738+122*Math.sin(t))));}
      for(let i=0;i<arcade.length;i++){
        const a=arcade[i],b=arcade[Math.min(i+1,arcade.length-1)],prev=arcade[Math.max(0,i-1)];
        const tangent=[b[0]-prev[0],b[1]-prev[1]],rot=Math.atan2(tangent[0],tangent[1]);
        K.box({x:a[0],z:a[1],y,w:.6,d:.42,h:2.1,rotY:rot-PI/2,mat:0xefe9df,solid:false});
        K.box({x:a[0],z:a[1],y:y+1.95,w:.77,d:.55,h:.15,rotY:rot-PI/2,mat:0xf4eee4,solid:false});
        if(i===arcade.length-1)continue;
        const dx=b[0]-a[0],dz=b[1]-a[1],L=Math.hypot(dx,dz),t=[dx/L,dz/L],n=[-t[1],t[0]],mid=[(a[0]+b[0])/2,(a[1]+b[1])/2],radius=(L-.6)/2;
        for(let k=0;k<16;k++){
          const aa=PI*k/16,bb=PI*(k+1)/16;
          const at=(theta,off=0)=>[mid[0]+t[0]*radius*Math.cos(theta)+n[0]*off,y+1.96+.76*Math.sin(theta),mid[1]+t[1]*radius*Math.cos(theta)+n[1]*off];
          for(const side of[-1,1]){
            const q=at(aa,side*.15),r=at(bb,side*.15);
            K.quad(0xefe9df,[q,r,[r[0],6.49,r[2]],[q[0],6.49,q[2]]],[n[0]*side,0,n[1]*side]);
          }
          K.quad(0xf4eee5,[at(aa,-.15),at(bb,-.15),at(bb,.15),at(aa,.15)],[0,-1,0]);
          // Raised architrave on both faces, with a shallow crown keystone.
          const outer=theta=>[mid[0]+t[0]*(radius+.1)*Math.cos(theta),y+1.96+.86*Math.sin(theta),mid[1]+t[1]*(radius+.1)*Math.cos(theta)];
          for(const side of[-1,1]){
            const q=outer(aa),r=outer(bb);q[0]+=n[0]*side*.18;q[2]+=n[1]*side*.18;r[0]+=n[0]*side*.18;r[2]+=n[1]*side*.18;
            K.quad(0xf7f1e7,[at(aa,side*.18),at(bb,side*.18),r,q],[n[0]*side,0,n[1]*side]);
          }
        }
        K.box({x:mid[0],z:mid[1],y:y+2.64,w:.25,d:.43,h:.23,rotY:Math.atan2(dx,dz)-PI/2,mat:0xf8f1e5,solid:false});
      }
      for(let u=2;u<65;u+=4)for(let v=3;v<83;v+=4){const p=P(u,v);if(K.pointInPoly(...p,MEZZ_VOID)||inR(u,v,NW_ESC,.5)||inR(u,v,SW_ESC,.5))continue;downlight(u,v,6.45,.065);}
      sign('1M · 액세서리 · 여행 · 식음료',13.2,10.5,y+2.25,'S',5.2,.36,{bg:'#ded5c4',fg:'#534737',bold:false});
      sign('센트럴시티 중층 →',2.5,39.25,y+2.25,'E',4.2,.35,{bg:'#ded5c4',fg:'#534737',bold:false});
    });
  }

  // ================================================================= Round 14 official upper floors
  const upperCells = new Map();
  const upperRect=upperPlanRect;
  const upperFace={N:'E',S:'W',E:'S',W:'N'};
  // Retained ground arrivals and the existing emergency cores are hard constraints.
  // Every cut is recorded as a schematic-registration exception, never a new tenant.
  const upperKeepClear=id=>[
    ...(id==='11F'?[]:(()=>{const[a,b,c,d]=upperPierRect(id);return[[a-1.12,b-1.12,a+.02,b+.02],[c-.02,b-1.12,c+1.12,b+.02],[a-1.12,d-.02,a+.02,d+1.12],[c-.02,d-.02,c+1.12,d+1.12]];})()),
    ...(id==='11F'?[]:[upperPhysicalWell(id).map((n,i)=>n+(i<2?-.3:.3))]),
    upperPhysicalWell(id,true).map((n,i)=>n+(i<2?-.3:.3)), [19.6,51.5,29.4,55.3],
    ...(upperPhysicalWell(id,true)[3]>=81.1?[[29,79.85,upperPhysicalWell(id,true)[2]+.85,81.3]]:[]),
    ...UPPER_BANKS.filter(b=>LV[id]<=LV[b.top]).map(b=>b.face==='N'?[b.u-3,b.v-3.9,b.u+3,b.v+1.2]:b.face==='S'?[b.u-3,b.v-1.2,b.u+3,b.v+2.4]:[b.u-3.8,b.v-3,b.u+3.8,b.v+3]),
    ...CORES.map(c=>[c.uL-.7,c.v0-.6,c.uR+.2,c.v1+.6]),
    ...(id==='2F'?[[57.7,79.4,60.7,84.7],[0,72.6,7.5,77.5],...BEAUTY_BANKS.map(v=>[BANK_U0-.8,v-1.8,BANK_U1+1.5,v-.1])]:[]),
  ];
  function cutRect(r,c) {
    const [a,b,d,e]=r,[x,z,X,Z]=c;
    if(X<=a||x>=d||Z<=b||z>=e)return[r];
    return [[a,b,Math.min(d,x),e],[Math.max(a,X),b,d,e],[Math.max(a,x),b,Math.min(d,X),Math.min(e,z)],[Math.max(a,x),Math.max(b,Z),Math.min(d,X),e]].filter(q=>q[2]-q[0]>.18&&q[3]-q[1]>.18);
  }
  // Small guide concessions beside the enlarged circulation wells retain
  // merchandise in audited portions of their original cells, on level platforms.
  // Remaining envelope/circulation conflicts: 9F 알레시; 10F 루셀, 야마하,
  // and the popup at source [1582,869,1648,890]. Their guide data is preserved,
  // but no safe selling bay fits the current flights; do not render over a well.
  const upperNiches={
    '7F:게이즈샵':[29.239,70.894,31.039,72.694],
    '8F:쌤소나이트 레드':[37.291,72.837,38.691,74.637],
    '9F:가게나우/스메그':[26.504,69.123,28.304,70.923],
    '10F:허비쉬':[32.743,76.861,34.543,78.661],
    '6F:블런드스톤':[6.14,74.522,7.54,75.622],
  };
  // An open shop face stays on its official white aisle. Stock is bounded to its cell.
  function buildUpperCell(id,c) {
    const y=LV[id],H=Math.min(3.4,clearH(id)),raw=upperRect(id,c.rect),r=upperBuildRect(id,c);
    const [px,py,pX,pY]=c.rect,guide=upperGuidePlans[id];
    const edgePoint=(f,t)=>f==='N'?[px+(pX-px)*t,py-5]:f==='S'?[px+(pX-px)*t,pY+5]:f==='W'?[px-5,py+(pY-py)*t]:[pX+5,py+(pY-py)*t];
    const score=f=>[.25,.5,.75].filter(t=>{const[a,b]=edgePoint(f,t);return a>27&&a<1775&&b>guide.top&&b<guide.bottom&&!guide.cells.some(o=>o!==c&&a>o.rect[0]&&a<o.rect[2]&&b>o.rect[1]&&b<o.rect[3]);}).length;
    const frontOverrides={'11F:더 키친 일 포노 (이탈리안 피자)':'S','11F:꼴라주 (프렌치 경양식)':'N','11F:살롱드호우섬 (딤섬/누들/홍콩식 솥밥)':'S','11F:카테고릭 (카페)':'N','3F:PSR 컨시어지':'S','3F:트리니티 라운지':'N','6F:블런드스톤':'E','9F:가게나우/스메그':'S','10F:토박스':'S','10F:트래드후스':'S','10F:컴프프로':'S'};
    const dior=id==='2F'&&c.name==='디올',annex=dior&&c.rect[0]===1061;
    const preferred=c.face,sourceFace=(id==='2F'&&((c.name==='샤넬'&&c.rect[0]===1061)||(dior&&c.rect[0]===1143))?'E':null)||frontOverrides[`${id}:${c.name}`]||['N','S','E','W'].reduce((a,b)=>score(b)>score(a)?b:a,preferred),face=upperFace[sourceFace];
    // N3: the two source rectangles form ONE L-shaped boutique. Its annex
    // has neither a second storefront nor a sealed room with spawned shoppers.
    let parts=[r];
    if(dior&&!annex){
      const linked=guide.cells.find(o=>o.name==='디올'&&o.rect[0]===1061),a=upperBuildRect(id,linked);
      parts=[[r[0],a[1],a[2],r[3]],[a[2],r[1],r[2],r[3]]];
      r[1]=a[1];
    }
    if(annex){c.model={raw,local:r,parts:[],face,sourceFace,aisleEdges:[],mergedInto:[1143,745,1263,1127]};return;}
    // N2: only the actual recessed middle bay is excluded. First-row shops
    // reach the façade at v=.5 on both shoulders, with no invented public band.
    parts=parts.flatMap(q=>cutRect(q,[22.85,0,44.15,8.35]));
    for(const clear of upperKeepClear(id))parts=parts.flatMap(p=>cutRect(p,clear));
    const niche=upperNiches[`${id}:${c.name}`];
    if(niche){parts=[niche];K.slab(rect(...niche),y,{mat:{tex:'marble',color:0xe8e2d5,gloss:.3},thick:.12,under:false,ceil:false,edge:false});}
    c.model={raw,local:r,parts,face,sourceFace,aisleEdges:['N','S','E','W'].filter(f=>score(f)>=2).map(f=>upperFace[f])};
    upperCells.set(`${id}:${c.name}`,{...c,local:r,parts,face});
    zone(c.name,id,`${id} · 신세계백화점 강남점`,r,y,y+H,3);
    for(const q of parts){
      const [a,b,d,e]=q;
      const edges=[['N',a,b,d,b],['S',a,e,d,e],['W',a,b,a,e],['E',d,b,d,e]];
      // Islands have open perimeter displays, so all white passages remain permeable.
      // Rear dividers are confined to the actual grey cells and never span a corridor.
      for(const [f,u0,v0,u1,v1]of edges)if(f!==face&&((f==='N'&&Math.abs(b-r[1])<.01)||(f==='S'&&Math.abs(e-r[3])<.01)||(f==='W'&&Math.abs(a-r[0])<.01)||(f==='E'&&Math.abs(d-r[2])<.01))){
        const glazed=(id==='2F'||id==='11F')&&c.model.aisleEdges.includes(f)&&!/입점 준비/.test(c.name),L=Math.hypot(u1-u0,v1-v0);
        upperSafeWall(u0,v0,u1,v1,y,((id==='2F'||id==='11F')?H:.12),{mat:glazed?'glass':0xe7e1d6,thick:glazed?.035:.08,solid:id==='2F'||id==='11F'});
        if(glazed&&id==='2F')furnish(id,()=>{
          const count=Math.max(1,Math.floor(L/3.1));
          for(let j=0;j<count;j++){
            const t=(j+.5)/count,u=u0+(u1-u0)*t,v=v0+(v1-v0)*t,along=f==='N'||f==='S',span=Math.min(2,L/count-.65);
            box(u,v,along?.65:.18,along?.18:.65,y,H,0xcfc8bd,{solid:false});
            for(let h=.6;h<H;h+=.6)box(u,v,along?.66:.19,along?.19:.66,y+h,.015,0xb7afa4,{solid:false});
            const tu=u+(along?span/2+.35:0),tv=v+(along?0:span/2+.35),du=f==='W'?.38:f==='E'?-.38:0,dv=f==='N'?.38:f==='S'?-.38:0;
            box(tu+du,tv+dv,along?span:.5,along?.5:span,y+.08,.32,0xe7dfcf,{solid:false});
            lightPanel(tu+du,tv+dv,y+2.7,along?span:.5,along?.5:span,0xfff1db);
            box(tu+du,tv+dv,.28,.2,y+.43,.3,0x665a49,{solid:false});
          }
        });
      }
    }
    if(dior){
      const a=upperBuildRect(id,guide.cells.find(o=>o.name==='디올'&&o.rect[0]===1061));
      wall(a[2],a[1],a[2],raw[1],y,y+H,{mat:0xe7e1d6,thick:.08});
      wall(a[2],raw[1],raw[2],raw[1],y,y+H,{mat:0xe7e1d6,thick:.08});
    }
  }
  // The second pair also follows its official white pad on each floor.
  const rightEscFloors=Object.keys(upperGuidePlans);
  rightEscFloors.slice(0,-1).forEach((id,i)=>{
    const next=rightEscFloors[i+1],r=upperAnnexAtriumRect(id),t=upperAnnexAtriumRect(next),rev=i%2;
    for(const [off,dir]of upperLaneOffsets(i,true).map((off,j)=>[off,j?'down':'up'])){
      const a=P(rev?r[2]:r[0],(r[1]+r[3])/2+off),b=P(rev?t[0]:t[2],(t[1]+t[3])/2+off);
      K.escalator(...a,...b,{ya:LV[id],yb:LV[next],w:1.2,dir,speed:.6,sideMat:0xeee7da,truss:0xf3eee4});
    }
  });
  for(const id of rightEscFloors){
    const i=rightEscFloors.indexOf(id),r=upperAnnexAtriumRect(id),p=upperPhysicalWell(id,true),y=LV[id],mid=(r[1]+r[3])/2,atEast=i%2===1;
    const u=atEast?r[2]:r[0],edge=atEast?p[2]:p[0];
    K.slab(rect(Math.min(u,edge)-.04,mid-3.6,Math.max(u,edge)+.04,mid+3.6),y,{mat:{tex:'marble',color:0xe8dfce},thick:.16,under:CEIL,edge:false});
    const segments=[[p[0],p[1],p[2],p[1]],[p[0],p[3],p[2],p[3]]];
    for(const x of[p[0],p[2]]){
      if(x!==edge)segments.push([x,p[1],x,p[3]]);
      else{if(mid-3.6>p[1])segments.push([x,p[1],x,mid-3.6]);if(mid+3.6<p[3])segments.push([x,mid+3.6,x,p[3]]);}
    }
    // L5: the inward-facing annex bank needs an opening through the south
    // guard on floors where the swept well reaches its lobby.
    const bankBridge=p[3]>80,bridgeEnd=p[3]>=81.1?p[2]+.7:35;
    const bankSegments=segments.flatMap(([a,b,c,d])=>bankBridge&&b===d&&Math.abs(b-p[3])<.01?
      [[a,b,Math.min(c,29),d],[Math.max(a,bridgeEnd),b,c,d]].filter(q=>q[2]-q[0]>.05):[[a,b,c,d]])
      .flatMap(([a,b,c,d])=>bridgeEnd>p[2]&&a===c&&Math.abs(a-p[2])<.01?
        [[a,b,c,Math.min(d,80)],[a,Math.max(b,81.15),c,d]].filter(q=>q[3]-q[1]>.05):[[a,b,c,d]]);
    if(bankBridge){
      // Stop north at v80: incoming lanes on 4F/8F/10F occupy v78–79.
      // Arrivals at v80.5 remain 0.6m outside the car's north door.
      K.slab(rect(29,80,bridgeEnd,81.15),y,{mat:{tex:'marble',color:0xe8dfce},thick:.05,under:false,ceil:false,edge:false});
      if(id!=='2F'&&p[3]>80){
        upperSafeWall(Math.max(29,p[0]),80,bridgeEnd,80,y,1.1,{mat:'glass',thick:.04});
        if(bridgeEnd<p[2])upperSafeWall(bridgeEnd,80,bridgeEnd,p[3],y,1.1,{mat:'glass',thick:.04});
      }
    }
    for(const[a,b,c,d]of bankSegments){
      const safe=upperSafeWall(a,b,c,d,y,1.1,{mat:'glass',thick:.04});
      upperGuardTrim(a,b,c,d,y+1.1,.05,.05,0xa7a9a8,safe);
      upperGuardTrim(a,b,c,d,y-1,1,.08,0xc4b8a5,upperSafeIntervals(a,b,c,d,y-1,1));
    }
    zone('신관 에스컬레이터',id,'층별 매장 · 식당가',p,y,y+3,2);
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
    zone('본관 · 신관 연결통로',id,'층별 매장 · 엘리베이터',[29.6,48.1,44.8,54.5],y,y+3.5,2);
    zone('고객 엘리베이터',id,'본관 · 신관 연결부',[19.6,51.5,29.4,55.3],y,y+3.4,2);
  }
  const mainOutlineBottom={'2F':1000,'3F':1078,'4F':1077,'5F':1095,'6F':1077,'7F':1125,'8F':1089,'9F':1077,'10F':1126};
  for(const [id,bottom]of Object.entries(mainOutlineBottom)){
    const u=upperPlanPoint(id,27,bottom)[0],vEnd=upperPlanPoint(id,1035,bottom)[1],y=LV[id];
    // L6: the area outside the official outline is enclosed back-of-house.
    // Keep the actual two-car corner-bank recess rather than burying its doors.
    let serviceFill=[[0,7.2,u,vEnd]];
    for(const bank of UPPER_BANKS)if(bank.key==='본관 코너')serviceFill=serviceFill.flatMap(r=>cutRect(r,[bank.u-3.8,bank.v-3.1,bank.u+3.8,bank.v+3.1]));
    for(const r of serviceFill)if(r[2]>r[0])boxR(...r,y,3.4,0xe7e1d6);
    for(const v of[7.2,vEnd])wall(0,v,u,v,y,y+3.4,{mat:0xe7e1d6,thick:.16});
    const openings=id==='2F'?[
      {at:11.95-7.2,w:5.7,y0:y,y1:y+2.7},
      {at:upperPlanPoint(id,500,bottom)[1]-7.2,w:2.5,y0:y,y1:y+2.6},
    ]:[];
    wall(u,7.2,u,vEnd,y,y+3.4,{mat:0xe7e1d6,thick:.16,openings});
    if(id==='2F'){
      const v=upperPlanPoint(id,500,bottom)[1];
      box(u,v,.14,2.5,y,2.5,0x484944);
      sign('5 GATE · 발렛파킹 ↓',u+.10,v,y+2.7,'E',2.4,.4,{bg:'#444740',fg:'#ffffff'});
      box(12.3,14.4,.65,.55,y,.9,0xc2c4c2,{solid:false});sign('음수대',12.7,14.4,y+1.3,'E',.7,.2,{bg:null,fg:'#555851'});
    }
  }
  // L8: the plan's cross, with four inaccessible roof corners behind glazing.
  const gardenBar=upperPlanRect('11F',[35,720,1052,1021].map(n=>n/1.096)),gardenArm=upperPlanRect('11F',[376,531,686,1182].map(n=>n/1.096));
  const gardenCross=[
    [gardenBar[0],gardenBar[1]],[gardenBar[2],gardenBar[1]], [gardenBar[2],gardenArm[1]], [gardenArm[2],gardenArm[1]],
    [gardenArm[2],gardenArm[3]],[gardenBar[2],gardenArm[3]], [gardenBar[2],gardenBar[3]],[gardenBar[0],gardenBar[3]],
    [gardenBar[0],gardenArm[3]],[gardenArm[0],gardenArm[3]], [gardenArm[0],gardenArm[1]],[gardenBar[0],gardenArm[1]],
  ];
  // The structural roof plate is non-walkable. Public floor follows the cross,
  // dining wing and enclosed links; the four gravel corners have no floor.
  const gardenLink=[30.9,gardenBar[3],37,59.4],cornerLobby=[8.8,8.85,13.1,15.6],cornerLink=[12.9,13.6,gardenBar[0]+.06,15.6];
  const gardenLiftLobby=[19.6,51.2,30.95,55.3]; // guide's lift alcove; 0.6m north of the v51.8 arrival
  const gardenServiceLink=[5.4,52.97,19.6,55.3],gardenServiceEntry=[6.9,51.5,9.6,53.05];
  const gardenWalkRects=[gardenLink,cornerLobby,cornerLink,gardenLiftLobby,gardenServiceLink,gardenServiceEntry];
  const gardenFloor={mat:{tex:'tile',color:0xd8d4c9,gloss:.3},thick:.05,under:false,ceil:false,edge:false};
  K.slab(gardenCross.map(p=>P(...p)),LV['11F'],gardenFloor);
  for(const r of gardenWalkRects)K.slab(rect(...r),LV['11F'],gardenFloor);
  K.slab(rect(0,56.4,UW,VD),LV['11F'],{...gardenFloor,mat:floorMat['11F'],holes:[rect(...upperPhysicalWell('11F',true))]});
  // 호경전's outlined northern edge projects 1.14m beyond the dining plate.
  for(const c of upperGuidePlans['11F'].cells)for(const r of c.model.parts)if(r[1]<56.4)K.slab(rect(r[0],r[1],r[2],Math.min(r[3],56.4)),LV['11F'],{...gardenFloor,mat:floorMat['11F']});
  const isGardenPublic=(u,v)=>v>=56.4||inR(u,v,gardenBar)||inR(u,v,gardenArm)||gardenWalkRects.some(r=>inR(u,v,r));
  K.zone({name:'S GARDEN',floor:'11F',sub:'옥상 정원',poly:gardenCross.map(p=>P(...p)),y0:LV['11F'],y1:LV.RF+3,priority:2});
  for(let i=0;i<gardenCross.length;i++){
    const a=gardenCross[i],b=gardenCross[(i+1)%gardenCross.length];
    let pieces=[[...a,...b]];
    // Open only the 6.1m dining corridor and the 2m corner-lift corridor.
    if(a[1]===gardenBar[3]&&b[1]===gardenBar[3])pieces=[[gardenBar[0],a[1],gardenLink[0],a[1]],[gardenLink[2],a[1],gardenBar[2],a[1]]];
    if(a[0]===gardenBar[0]&&b[0]===gardenBar[0]&&Math.min(a[1],b[1])<13.6&&Math.max(a[1],b[1])>15.6)pieces=[[a[0],Math.min(a[1],b[1]),a[0],13.6],[a[0],15.6,a[0],Math.max(a[1],b[1])]];
    for(const p of pieces)wall(...p,LV['11F'],LV['11F']+1.1,{mat:'glass',thick:.05});
  }
  for(const [a,b]of[[0,gardenBar[0]],[gardenBar[2],UW]])wall(a,gardenBar[3],b,gardenBar[3],LV['11F'],LV['11F']+1.1,{mat:'glass',thick:.05});
  for(const u of[gardenLink[0],gardenLink[2]])wall(u,gardenLink[1],u,gardenLink[3],LV['11F'],LV['11F']+3.2,{mat:0xe7e1d6,thick:.15,
    openings:u===gardenLink[0]?[{at:53.25-gardenLink[1],w:4.1,y0:LV['11F'],y1:LV['11F']+2.7}]:[]});
  hq(...gardenLink,LV['11F']+3.2,CEIL,false);
  for(const p of[[13.1,8.85,13.1,13.6],[11.2,8.85,13.1,8.85],[13.1,13.6,gardenBar[0],13.6],[11.2,15.6,gardenBar[0],15.6],
    [19.6,51.2,30.9,51.2],[19.6,55.3,30.9,55.3],[19.6,51.2,19.6,52.97],
    [5.4,52.97,6.9,52.97],[9.6,52.97,19.6,52.97],[5.4,55.3,19.6,55.3],[5.4,52.97,5.4,55.3],
    [6.9,51.5,6.9,52.97],[9.6,51.5,9.6,52.97],[6.9,51.5,9.6,51.5]])wall(...p,LV['11F'],LV['11F']+2.7,{mat:0xe7e1d6,thick:.15});
  hq(11.2,8.85,13.1,15.6,LV['11F']+2.7,CEIL,false);hq(...cornerLink,LV['11F']+2.7,CEIL,false);
  hq(...gardenLiftLobby,LV['11F']+2.7,CEIL,false);
  hq(...gardenServiceLink,LV['11F']+2.7,CEIL,false);hq(...gardenServiceEntry,LV['11F']+2.7,CEIL,false);
  zone('S GARDEN 연결통로','11F','전문식당가 · 고객 엘리베이터',gardenLink,LV['11F'],LV['11F']+3.2,3);

  // L7: stop at our facade. A through route needs a coordinated y=7 junction
  // and a descent to hotel 1F; no slab or wall projects into the hotel footprint.
  box(59.2,84.62,3,.16,7,3.1,0x484944);
  sign(['JW 메리어트 서울 1층','토즈 · 아뇨나 · 로저비비에'],56.15,84.5,8.6,'N',2.7,.8,{bg:'#e6ddcc',fg:'#4f473b'});
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
  // Round16: finishes and fixtures share the round14 cell transforms, including
  // every retained-core cut. These palettes describe evidence-backed materials;
  // unseen individual fit-outs are category interpretations, not surveyed plans.
  K.texture('ssg_upper_veined',512,512,(g,w,h)=>{
    g.fillStyle='#e9e6df';g.fillRect(0,0,w,h);
    const random=K.rand(19140);
    for(let j=-1;j<7;j++)for(let i=-1;i<7;i++){
      const x=i*85+(j%2)*39+random()*20,z=j*84+random()*17,
        rx=29+random()*31,rz=29+random()*35,points=[];
      for(let k=0;k<9;k++){const a=k*PI*2/9,r=.78+random()*.27;points.push([x+Math.cos(a)*rx*r,z+Math.sin(a)*rz*r]);}
      g.beginPath();g.moveTo((points[8][0]+points[0][0])/2,(points[8][1]+points[0][1])/2);
      for(let k=0;k<9;k++){const p=points[k],q=points[(k+1)%9];g.quadraticCurveTo(...p,(p[0]+q[0])/2,(p[1]+q[1])/2);}
      g.closePath();g.fillStyle=(i+j)%3?'#e9e6df':'#b9b5ad';g.fill();
      g.strokeStyle='#5c5851';g.lineWidth=4+random()*5;g.stroke();
    }
  },[1.8,1.8]);
  K.texture('ssg_moncler_pylon',128,512,(g,w,h)=>{
    g.fillStyle='#ecebe7';g.fillRect(0,0,w,h);
    for(let x=0;x<w;x+=5){g.fillStyle=x%10?'rgba(255,255,255,.38)':'rgba(109,111,111,.16)';g.fillRect(x,0,2,h);}
    for(let i=0;i<90;i++){g.fillStyle='rgba(128,130,128,.08)';g.fillRect(i*17%w,i*53%h,2,18);}
  },[.6,3]);
  const pylonMap=K.T.surface('ssg_moncler_pylon').tex;
  K.material('ssg_moncler_pylon_lit',new K.THREE.MeshLambertMaterial({map:pylonMap,color:0xffffff,emissive:0xecebe7,emissiveMap:pylonMap,emissiveIntensity:.45}));
  K.texture('ssg_upper_quilt',256,256,(g,w,h)=>{
    g.fillStyle='#d9d0c0';g.fillRect(0,0,w,h);
    for(let j=0;j<4;j++)for(let i=0;i<4;i++){
      const x=i*64,y=j*64,gx=g.createRadialGradient(x+29,y+26,4,x+32,y+32,42);
      gx.addColorStop(0,'#f4efe6');gx.addColorStop(.72,'#efe9de');gx.addColorStop(1,'#d9d0c0');
      g.fillStyle=gx;g.fillRect(x+2,y+2,60,60);
    }
  },[1.8,1.8]);
  K.texture('ssg_upper_graphic',256,512,(g,w,h)=>{
    g.fillStyle='#40525b';g.fillRect(0,0,w,h);
    for(let i=0;i<8;i++){
      g.beginPath();g.moveTo(-20,400-i*27);g.lineTo(75,190-i*14);g.lineTo(140,310-i*18);g.lineTo(220,110-i*11);g.lineTo(280,260-i*15);
      g.strokeStyle=i%2?'#b7bda7':'#84968f';g.lineWidth=4;g.stroke();
    }
    g.fillStyle='#e0ddd1';g.beginPath();g.arc(65,70,27,0,PI*2);g.fill();
  },[1,2]);
  function upperPalette(id,c) {
    const n=c.name,k=c.kind;
    const p={wall:0xeee8dd,floor:{tex:'wood',color:0xd4bf9f,gloss:.3},trim:0xa68e65,accent:0x66574a,dark:false};
    if(['fashion','sport','shoe','golf'].includes(k))Object.assign(p,{wall:0xeae9e3,floor:{tex:k==='golf'?'carpet':'ssg_upper_tile',color:k==='golf'?0x939d83:0xdddcd5},trim:0x535957,accent:0x353d40});
    if(k==='sport')Object.assign(p,{wall:0xd7d9d5,accent:0x264653});
    if(k==='home'||k==='kitchen'||k==='elec')Object.assign(p,{wall:0xf3efe6,trim:0x8c8271,accent:0x83745f});
    if(k==='kid'||k==='toy')Object.assign(p,{wall:0xf4eae0,floor:{tex:'wood',color:0xe8d7b8,gloss:.3},trim:0xbda786,accent:0x85a5a1});
    if(k==='lingerie'||/바바라|트라이엄프|비비안/.test(n))Object.assign(p,{wall:0xf0e4df,floor:{tex:'carpet',color:0xd8ccc5},trim:0xba9b89,accent:0xb18989});
    if(k==='rest'||k==='cafe'||k==='lounge')Object.assign(p,{wall:0xe8decc,floor:{tex:'wood',color:0xc8b08b,gloss:.3},trim:0x514331,accent:0x806341});
    if(/샤넬|생 로랑|톰포드|발렌시아가|보스|PXG|CK/.test(n))Object.assign(p,{wall:0xe6e3dc,trim:0x232424,accent:0x181b1c,dark:true});
    if(/에르메스|로로피아나|브루넬로|벨루티|에르노|타임|구호/.test(n))Object.assign(p,{wall:0xe8dfce,trim:0x99754f,accent:0x9b6b42,floor:{tex:'wood',color:0xc3a780,gloss:.3}});
    if(/디올/.test(n))Object.assign(p,{wall:0xf0ede5,trim:0xb6a077,accent:0x9d927d,floor:{tex:'marble',color:0xf1eade,gloss:.5}});
    if(/펜디/.test(n))Object.assign(p,{wall:0xf3f1ec,portal:'ssg_upper_veined',trim:0xcdc4be,accent:0x4a4440,floor:{tex:'marble',color:0xece8e0,gloss:.5}});
    if(/몽클레르/.test(n))Object.assign(p,{wall:0x1e1f20,trim:0x0e0f10,accent:0x2a2c2e,dark:true,floor:{color:0x3b3c3d,gloss:.5}});
    if(/루이비통/.test(n))Object.assign(p,{wall:0xf1ece3,portal:'ssg_upper_quilt',trim:0xa58e6e,accent:0x8d785d,floor:id==='2F'?0xc9bfae:{tex:'carpet',color:0xc9bfae}});
    if(/프라다|미우미우/.test(n))Object.assign(p,{wall:0xd8e0cf,trim:0x9b9f86,accent:0x515d4a});
    if(/구찌/.test(n))Object.assign(p,{wall:0xd8d8c6,trim:0xa28d69,accent:0x4a5e46});
    if(/보테가/.test(n))Object.assign(p,{wall:0xd4d2ba,trim:0x7b805c,accent:0x51694b});
    if(/까르띠에/.test(n))Object.assign(p,{wall:0xe5d8c3,trim:0xb39560,accent:0x783b32});
    if(/티파니/.test(n))Object.assign(p,{wall:0xe9eee9,trim:0x9bac9f,accent:0x75b5b1});
    if(/롤렉스/.test(n))Object.assign(p,{wall:0xdfdfcd,trim:0xac9668,accent:0x375d4c});
    if(/룰루레몬/.test(n))Object.assign(p,{wall:0xf4f1e9,trim:0x252a29,accent:0xad292f,floor:{tex:'wood',color:0xc4aa86,gloss:.3}});
    if(/나이키|아디다스|데상트|다이나핏/.test(n))Object.assign(p,{wall:0xe6e6e0,trim:0x292e2e,accent:0x252b2e});
    if(/파타고니아|스노우피크|노르디스크|헬리녹스|말본/.test(n))Object.assign(p,{wall:0xdedfcf,trim:0x8b744e,accent:0x50614c,floor:{tex:'wood',color:0xb5a17b}});
    if(n==='프리스비 (애플)')Object.assign(p,{wall:0xf8f7f2,trim:0xbfbeb6,accent:0x3c4244,floor:{tex:'tile',color:0xeeeae1,gloss:.3},apple:true});
    if(/레고/.test(n))Object.assign(p,{wall:0xfff3cf,trim:0xe7bd27,accent:0xc92d28});
    if(/아이큐박스|키움하우스|스누피/.test(n))Object.assign(p,{wall:0xf5eee0,trim:0xd5bc85,accent:0x81aaa1});
    if(/호경전|살롱드호우섬/.test(n))Object.assign(p,{wall:0xe3d7c3,trim:0x3c4c41,accent:0x82483c});
    if(/키사라|히바린/.test(n))Object.assign(p,{wall:0xe8e0d0,trim:0x68553b,accent:0x5f4b35});
    return p;
  }
  let upperSeed=0;
  // Round16 stock is category-specific, bounded to the unchanged official cell.
  // a runs along the storefront; b points into the shop. Keep the centre aisle open.
  function furnishUpperMerch(ctx) {
    const {id,name,kind,Wf:W,Dp:D,y,fb,fsign,person,seed,palette:p}=ctx;
    if(W<1.05||D<1.05)return;
    const oak={tex:'wood',color:0xd4bb91},walnut={tex:'wood',color:0x765a43},ivory=0xf1ece1,
      metal={tex:'metal',color:0xb4b7b5},gold={color:0xb6a17a,gloss:.5},dark=0x272a28;
    const brandStock=/막스마라/.test(name)?[0xb8875a,0xefe7d8,0x1d1d1d,0x8a8a88]:/A.P.C./.test(name)?[0x2c3a57,0x1f2a3a,0xe6dfcc,0x8a8463]:/로로피아나/.test(name)?[0xd9cbb3,0xa8957e,0xb98d5f,0xf0e9dc]:/스톤 아일랜드/.test(name)?[0x1b1c1c,0x4f5a3a,0x23304a]:/몽클레르/.test(name)?[0x121314,0x1d2433,0xf2f2ef]:name==='K2'?[0x8c9093,0xc4c8ca,0x1b1b1c,0xeae6d8,0xbb7251,0x514738]:null;
    const stock=brandStock?Array.from({length:6},(_,i)=>brandStock[i%brandStock.length]):[0xe3ddd1,0x303b43,0xb3a18a,0x5c7065,0x9c6571,0xb28b48];
    const toys=[0xe4b827,0xa74232,0x4b7793,0x6b9567,0xd89f9b];
    const staffColor=/프리스비/.test(name)?0x275f92:/레고/.test(name)?0xdaa51c:0x262c2b;
    const B=(a,b,w,d,h,hh,m,o={})=>{
      if(w<=0||d<=0||hh<=0||a-w/2<.2||a+w/2>W-.2||b-d/2<.2||b+d/2>D-.2)return;
      fb(a,b,w,d,y+h,hh,m,{solid:false,...o});
    };
    const shelf=(a,b,w,rows=3,finish=oak)=>{
      B(a,b+.14,w,.16,.1,2.38,finish);
      for(let j=0;j<rows;j++){
        const h=.52+j*.61;B(a,b-.08,w,.46,h,.055,finish);
        B(a,b-.25,w-.08,.025,h+.06,.018,{tex:'emit',color:0xffefd7});
      }
    };
    const bag=(a,b,h,col=stock[seed%stock.length],s=1)=>{
      B(a,b,.31*s,.19*s,h,.25*s,{color:col,gloss:.3});
      B(a,b-.102*s,.28*s,.015,h+.18*s,.05*s,col);
      for(const da of[-.087,.087])B(a+da*s,b,.025*s,.045*s,h+.25*s,.105*s,col);
      B(a,b,.20*s,.045*s,h+.34*s,.025*s,col);
      B(a,b-.115*s,.045*s,.015,h+.15*s,.045*s,gold);
    };
    const shoe=(a,b,h,col=dark,s=1)=>{
      B(a,b,.18*s,.35*s,h,.035*s,ivory);
      B(a,b+.015*s,.17*s,.30*s,h+.035*s,.09*s,col);
      B(a,b+.1*s,.15*s,.13*s,h+.10*s,.095*s,col);
      B(a,b+.10*s,.09*s,.065*s,h+.16*s,.035*s,dark);
      for(let j=0;j<3;j++)B(a,b-.055*s+j*.045*s,.10*s,.012*s,h+.13*s,.012*s,ivory);
    };
    const folded=(a,b,h,col,s=.34)=>{
      for(let j=0;j<3;j++)B(a,b,s,.27,h+j*.055,.05,j===1?ivory:col);
      B(a,b-.14,.10,.015,h+.10,.035,0xe2dbcd);
    };
    const garment=(a,b,h,col,small=false,underwear=false)=>{
      const s=small?.67:1;
      if(underwear){
        for(const da of[-.085,.085])B(a+da,b,.14,.09,h+.3,.13,col);
        B(a,b,.33,.06,h+.29,.035,col);
        for(const da of[-.12,.12])B(a+da,b,.025,.04,h+.43,.15,col);
        B(a,b,.24,.08,h,.16,col);
      }else{
        const coat=/막스마라/.test(name),down=/몽클레르|K2/.test(name),m=down?{color:col,gloss:.3}:col;
        B(a,b,.32*s,(down?.19:.12)*s,h-(coat?.30:0),(.57+(coat?.30:0))*s,m);
        if(down)for(let j=1;j<6;j++)B(a,b-.104*s,.32*s,.012*s,h+j*.09,.018,0x4a4b4b);
        if(/스톤 아일랜드/.test(name))B(a+.20*s,b-.07*s,.06,.014,h+.32,.065,0xe8752a);
        for(const side of[-1,1])B(a+side*.205*s,b,.105*s,.12*s,h+.1*s,.40*s,col);
        B(a,b-.064*s,.012,.01,h+.03*s,.49*s,0xc1b6a2);
        for(const da of[-.06,.06])B(a+da*s,b,.095*s,.13*s,h+.54*s,.06*s,col);
      }
      B(a,b,.24*s,.025,h+.6*s,.025,0xaa9680);
      B(a,b,.02,.02,h+.625*s,.13,metal);
    };
    const rail=(a,b,len,small=false,underwear=false)=>{
      if(len<.65)return;
      const top=small?1.35:1.9;
      B(a,b,len,.04,top,.045,metal);
      for(const da of[-len/2+.035,len/2-.035]){B(a+da,b,.035,.035,.08,top,metal);B(a+da,b,.16,.48,.055,.04,metal);}
      const sparse=kind==='lux'||/몽클레르|로로피아나|막스마라/.test(name),n=Math.max(2,Math.min(sparse?8:16,Math.floor(len/(underwear?.4:sparse?.68:.43))));
      for(let i=0;i<n;i++)garment(a-len/2+.23+i*(len-.46)/Math.max(1,n-1),b,top-(small?.56:.80),stock[(seed+i)%stock.length],small,underwear);
    };
    const table=(a,b,w=1.4,d=.75,h=.83,finish=oak)=>{
      B(a,b,w,d,h,.075,finish);
      for(const da of[-w*.38,w*.38])for(const db of[-d*.34,d*.34])B(a+da,b+db,.055,.055,.07,h-.07,finish);
    };
    const mannequin=(a,b,small=false)=>{
      const s=small?.67:1;
      B(a,b,.60*s,.60*s,.03,.06,ivory);
      for(const da of[-.11,.11]){B(a+da*s,b,.13*s,.15*s,.09,.73*s,0xddd6c8);B(a+da*s,b-.07*s,.14*s,.27*s,.09,.1*s,dark);}
      garment(a,b,.81*s,stock[seed%stock.length],small);
      B(a,b,.10*s,.11*s,1.4*s,.11*s,0xded6c5);
      B(a,b,.21*s,.20*s,1.5*s,.26*s,0xded6c5);
    };
    // Side lanes leave >=1.2 m down the shop centre, even in compressed plan cells.
    const sideWidth=Math.max(0,(W-1.8)/2),islands=sideWidth>1.05?[W*.23,W*.77]:[],
      rear=D-.65,displayWidth=Math.min(4.6,W-.75),rearA=W/2;
    const slots=Math.max(2,Math.min(8,Math.floor(displayWidth/.56)));
    const eachStock=(fn,rows=3)=>{
      const bays=Math.max(1,Math.min(4,Math.floor((W-.4)/4.7)));
      for(let bay=0;bay<bays;bay++){
        const a=.4+(bay+.5)*(W-.8)/bays,w=Math.min(4.6,(W-.8)/bays-.12),n=Math.max(2,Math.min(8,Math.floor(w/.56)));
        shelf(a,rear,w,rows,p.dark?walnut:oak);
        for(let row=0;row<rows;row++)for(let i=0;i<n;i++)fn(a-w/2+.3+i*(w-.6)/Math.max(1,n-1),rear-.15,.59+row*.61,i+bay*n,row);
      }
    };
    const apparel=(small=false,underwear=false)=>{
      // Individual front-facing garments remain readable from the white aisle.
      const len=Math.min(8.8,W-.8);
      rail(W/2,Math.max(1,D-.8),len,small,underwear);
      if(D>4.2&&sideWidth>1.05){
        const lanes=Math.max(1,Math.min(3,Math.floor(sideWidth/2.6))),rows=Math.max(1,Math.min(4,Math.floor((D-2.4)/2.6)));
        for(let side=0;side<2;side++)for(let lane=0;lane<lanes;lane++)for(let row=0;row<rows;row++){
          const a=side===0?.4+(lane+.5)*sideWidth/lanes:W-.4-(lane+.5)*sideWidth/lanes,b=2.8+row*2.6;
          if(b>D-1.65||(a>W*.65&&b>D*.65))continue;
          rail(a,b,Math.min(sideWidth/lanes-.3,2.8),small,underwear);
        }
      }
      if(W>4.6&&D>3.3){
        const a=W*.23,b=Math.min(1.35,D*.25),w=Math.min(sideWidth-.2,1.6);
        table(a,b,w,.72,.76,p.dark?walnut:oak);
        for(const da of[-w*.23,w*.23])folded(a+da,b,.84,stock[(seed+2)%stock.length],Math.min(.34,w*.3));
        if(W>6)mannequin(W*.80,1.05,small);
      }
    };
    const apple=/프리스비/.test(name),bed=/히프노스|템퍼|크리스피바바|앙드솔렌|에이스|시몬스|씰리|돌레란|덕시아나|해스텐스|바세티|리베코|피레넥스|프레쉬 파인드|코지네스트|세사|클라르하임|랄프로렌홈|더 조선/.test(name);
    const tiny=W<1.65||D<1.2;
    if(ctx.special){
      // K2, le coq and Dr. Martens retain their photographed, relocated fixture
      // compositions below; only the staff/customers are supplied here.
    }else if(tiny){
      const w=Math.max(.45,W-.55),b=D-.45;
      B(W/2,b,w,.25,.25,1.7,p.wall);
      B(W/2,b-.12,w,.30,.65,.05,oak);
      if(kind==='bag'||kind==='lux')bag(W/2,b-.13,.7,stock[seed%6],.8);
      else folded(W/2,b-.13,.7,stock[seed%6],Math.min(.34,w*.65));
    }else if(apple){
      const aw=Math.min(W-.6,6.4);
      shelf(W/2,D-.55,aw,3,ivory);
      for(let r=0;r<3;r++)for(let i=0;i<Math.min(10,Math.floor(aw/.42));i++){
        const a=W/2-aw/2+.27+i*.42;
        B(a,D-.68,.25,.12,.59+r*.61,.35,0xf4f3ed);
        B(a,D-.747,.16,.015,.65+r*.61,.18,[0x8fa5b7,0xc3a3b7,0x7e9687][(i+r)%3]);
      }
      const centers=W>10?[W*.16,W*.36,W*.65,W*.85]:W>5.5?[W*.24,W*.76]:[W*.27];
      for(const [ci,a]of centers.entries())for(let r=0;r<Math.min(3,Math.max(1,Math.floor((D-1.8)/2.3)));r++){
        const b=1.45+r*2.3,w=Math.min(2.3,W>10?W*.15:sideWidth-.15);if(w<.8)continue;
        table(a,b,w,1.1,.84,oak);
        for(let i=0;i<3;i++){
          const aa=a+(i-1)*Math.min(.65,w*.27);
          if((ci+r)%3===0){
            B(aa,b,.37,.26,.925,.025,metal);B(aa,b+.10,.37,.025,.95,.24,dark);
            B(aa,b+.083,.34,.012,.97,.19,{tex:'emit',color:0x99b8c8});
          }else if((ci+r)%3===1){
            B(aa,b,.15,.29,.925,.018,dark);B(aa,b-.005,.13,.25,.944,.008,{tex:'emit',color:0xc8a8cf});
          }else{
            B(aa,b,.16,.13,.925,.035,metal);B(aa,b+.025,.04,.06,.96,.16,metal);B(aa,b+.06,.46,.04,1.1,.32,metal);
            B(aa,b+.035,.42,.012,1.12,.27,{tex:'emit',color:0x91c6c0});
          }
          B(aa+.15,b-.34,.11,.10,.925,.012,ivory);
        }
      }
      fsign('액세서리',W/2,D-.78,y+2.58,Math.min(W-.5,3),.22,{bg:null,fg:'#565650',bold:false});
    }else if(kind==='watch'||kind==='jewel'||/주얼리|반클리프|불가리|티파니|까르띠에|그라프/.test(name)){
      eachStock((a,b,h,i)=>{
        B(a,b,.22,.19,h,.08,0xefe5d3);B(a,b-.025,.07,.16,h+.085,.026,gold);
        B(a,b-.025,.10,.08,h+.11,.028,dark);B(a,b-.03,.075,.06,h+.14,.008,ivory);
      },2);
      for(const a of islands){
        const w=Math.min(sideWidth-.2,1.9),b=D*.42;
        B(a,b,w,.8,.1,.84,p.dark?walnut:ivory);B(a,b,w,.8,.94,.3,'glass');B(a,b,w-.12,.65,.945,.025,0xe1d5bd);
        for(let i=0;i<4;i++){const aa=a+(i-1.5)*w*.20;B(aa,b,.12,.22,.98,.025,gold);B(aa,b,.13,.10,1.01,.035,dark);B(aa,b,.10,.08,1.046,.012,ivory);}
      }
    }else if(/몽클레르/.test(name)){
      apparel();for(const a of[W*.28,W*.72])mannequin(a,Math.min(1.2,D*.35));
    }else if(/로로피아나/.test(name)){
      apparel();for(const a of islands){table(a,D*.45,Math.min(1.6,sideWidth-.15),.8,.78,ivory);for(let j=0;j<3;j++)folded(a+(j-1)*.35,D*.45,.86,stock[j]);}
      for(let i=0;i<4;i++)bag(.5+i*(W-1)/3,Math.max(.5,D-.6),.58,stock[i],.8);
    }else if(/루이비통/.test(name)&&id==='2F'){
      for(const a of islands){B(a,D*.5,Math.min(1.65,sideWidth-.1),.8,.05,.75,ivory);B(a,D*.5,Math.min(1.65,sideWidth-.1),.8,.8,.35,'glass');bag(a,D*.5,.85,0xbb9971,.85);}
      for(let i=0;i<4;i++){const a=.6+(W-1.2)*(i+.5)/4;B(a,D-.3,Math.min(1,W/5),.04,1.2,1.2,0xb7a989);B(a,D-.33,Math.min(.84,W/5-.08),.025,1.28,1.04,{tex:'ssg_upper_graphic',color:0xc2c7c1});}
    }else if(/펜디/.test(name)&&id==='2F'){
      const n=Math.max(2,Math.floor((W-.6)/.65));shelf(W/2,rear,W-.6,3,0xf3f1ec);
      for(let j=0;j<3;j++)for(let i=0;i<n;i++)bag(.4+(W-.8)*(i+.5)/n,rear-.17,.59+j*.61,stock[i%6],.82);
    }else if((id==='6F'||id==='3F')&&kind==='lux'){
      apparel();
    }else if(kind==='lux'||kind==='bag'){
      eachStock((a,b,h,i,r)=>bag(a,b,h,stock[(seed+i+r)%6]));
      for(const [i,a]of islands.entries()){
        const b=D*.40,w=Math.min(sideWidth-.25,1.5);
        B(a,b,w,.82,.05,.76,{tex:'marble',color:0xe7ddcb,gloss:.5});bag(a,b,.82,stock[(seed+i+2)%6],1.15);
        if(D>5.8&&i===0)rail(a,D*.68,Math.min(sideWidth-.2,2.3));
      }
      if(/리모와|투미|쌤소나이트|만다리나덕/.test(name))for(let i=0;i<Math.min(4,slots);i++){
        const a=.65+i*(W-1.3)/Math.max(1,Math.min(4,slots)-1),b=D-.75;
        B(a,b,.45,.29,.05,.63,metal);for(let k=0;k<5;k++)B(a-.17+k*.085,b-.15,.025,.018,.10,.52,0x777e80);
        for(const da of[-.12,.12])B(a+da,b,.025,.035,.68,.23,metal);B(a,b,.26,.035,.91,.025,dark);
      }
    }else if(kind==='shoe'||/토박스|트래드후스/.test(name)){
      eachStock((a,b,h,i,r)=>shoe(a,b,h,stock[(i+r+seed)%6]),3);
      for(const [i,a]of islands.entries()){
        const b=Math.max(1.15,D*.35),w=Math.min(1.4,sideWidth-.2);
        B(a,b,w,.68,.04,.45,ivory);shoe(a-.18,b,.5,stock[(i+seed)%6]);shoe(a+.18,b,.5,stock[(i+seed)%6]);
        if(i===0&&D>4)B(a,D*.62,w,.64,.07,.40,0xa3917b);
      }
    }else if(kind==='golf'){
      apparel();
      for(let i=0;i<Math.min(3,Math.floor(W/2));i++){
        const a=.65+i*.58,b=Math.min(D-.7,2.15),col=[0xe5e1d7,0x2d4245,0x9a7750][i];
        B(a,b,.33,.36,.08,.8,col);B(a,b-.19,.27,.12,.25,.34,col);
        for(let j=0;j<4;j++){B(a-.1+j*.065,b,.018,.018,.79,.60+j*.025,metal);B(a-.08+j*.065,b,.095,.07,1.39+j*.025,.045,metal);}
      }
      if(W>7&&D>6){B(W*.75,D*.56,Math.min(2,sideWidth-.2),1.45,.02,.025,{tex:'grass',color:0x65835d});}
    }else if(kind==='home'){
      if(bed){
        const n=W>7?2:1,ww=Math.min(1.75,sideWidth>.9?sideWidth-.1:W-.8);
        for(let i=0;i<n;i++){
          const a=n===2?islands[i]:Math.min(W*.27,ww/2+.3),b=Math.min(D-1.35,2.15);if(b<1.2)continue;
          B(a,b,ww,2,.12,.29,walnut);B(a,b,ww-.04,1.94,.41,.2,0xf1ede1);
          B(a,b-.3,ww-.07,1.23,.62,.06,stock[(seed+i)%6]);B(a,b+.96,ww+.06,.10,.20,1.06,p.trim);
          for(const da of[-ww*.23,ww*.23])B(a+da,b+.58,ww*.38,.39,.64,.13,ivory);
        }
        eachStock((a,b,h,i)=>folded(a,b,h,stock[(seed+i)%6],.4),2);
      }else{
        for(const [i,a]of islands.entries()){
          const w=Math.min(2.1,sideWidth-.2),b=Math.min(D-.9,2.3),col=stock[(seed+i)%6];
          B(a,b,w,.85,.1,.34,col);B(a,b+.36,w,.15,.44,.4,col);
          for(const da of[-w/2+.09,w/2-.09])B(a+da,b,.18,.85,.4,.2,col);
          for(const da of[-w*.22,w*.22])B(a+da,b,.39,.65,.44,.07,col);
          if(D>4){table(a,b-1.15,Math.min(1.15,w),.6,.38,walnut);B(a,b-1.15,.3,.24,.46,.04,ivory);}
        }
        if(W>2.6&&D>3.3)eachStock((a,b,h,i)=>{B(a,b,.16,.16,h,.29,stock[(seed+i)%6]);B(a,b-.12,.26,.08,h,.04,ivory);},2);
      }
    }else if(kind==='kitchen'){
      const glass=/리델|바카라|크리스토플|라리끄|생루이/.test(name),pans=/휘슬러|WMF|즈윌링|모비엘|키친툴|쿠킹/.test(name);
      const dish=(a,b,h,i)=>{
        if(glass){B(a,b,.14,.14,h,.025,ivory);B(a,b,.022,.022,h+.025,.14,'glass');B(a,b,.12,.12,h+.16,.14,'glass');}
        else if(pans){B(a,b,.27,.27,h,.18,metal);B(a,b,.29,.29,h+.18,.035,metal);B(a+.20,b,.18,.045,h+.13,.045,dark);B(a,b,.065,.065,h+.22,.045,dark);}
        else{for(let j=0;j<3;j++)B(a,b,.27-j*.02,.27-j*.02,h+j*.026,.025,ivory);B(a,b,.16,.16,h+.09,.13,i%3?ivory:stock[seed%6]);B(a+.1,b,.04,.075,h+.12,.06,gold);}
      };
      eachStock((a,b,h,i)=>dish(a,b,h,i));
      for(const a of islands){const w=Math.min(1.8,sideWidth-.2),b=D*.42;table(a,b,w,.8,.83,ivory);for(let i=0;i<3;i++)dish(a+(i-1)*w*.28,b,.91,i);}
    }else if(kind==='elec'){
      const camera=/라이카|핫셀블라드|캐논|소니/.test(name),coffee=/유라|라마르조코|드롱기|브레빌/.test(name),big=/LG|삼성|밀레|리페르|가게나우/.test(name);
      if(big){
        const n=Math.min(5,Math.max(2,Math.floor(W/.9)));
        for(let i=0;i<n;i++){
          const a=.6+i*(W-1.2)/Math.max(1,n-1),b=D-.65;
          B(a,b,.64,.64,.04,i%2?1.85:.88,i%3?ivory:metal);
          if(i%2){B(a,b-.33,.025,.02,.1,1.65,dark);B(a+.22,b-.35,.03,.04,.7,.48,metal);}
          else{B(a,b-.335,.43,.035,.24,.44,dark);B(a,b-.36,.30,.015,.31,.30,0x91a8b1);B(a,b-.335,.52,.02,.75,.08,metal);}
        }
      }else eachStock((a,b,h,i)=>{
        if(camera){B(a,b,.27,.18,h,.19,dark);B(a,b-.14,.15,.15,h+.04,.13,metal);B(a,b-.23,.10,.035,h+.055,.10,0x273e43);}
        else if(coffee){B(a,b,.31,.30,h,.32,metal);B(a,b-.16,.26,.015,h+.1,.11,dark);B(a,b-.23,.12,.12,h+.02,.13,ivory);B(a,b,.25,.22,h+.32,.045,dark);}
        else{B(a,b,.23,.21,h,.32,i%2?ivory:dark);B(a,b-.11,.16,.015,h+.05,.20,0x6f7e81);}
      },2);
      for(const a of islands){
        const w=Math.min(1.6,sideWidth-.2),b=D*.4;table(a,b,w,.75,.82,ivory);
        if(big){B(a,b,.86,.045,.97,.56,dark);B(a,b-.026,.80,.012,1,.49,{tex:'emit',color:0x87a6b0});B(a,b,.28,.22,.9,.07,metal);}
        else{B(a,b,.37,.32,.9,.42,metal);B(a,b-.17,.28,.025,1,.20,dark);}
      }
    }else if(kind==='toy'||/레고|완구|야마하|마이크로 킥보드/.test(name)){
      const lego=/레고/.test(name),yamaha=/야마하/.test(name);
      if(yamaha){
        B(W*.3,D*.5,Math.min(1.5,sideWidth),.55,.1,.72,dark);B(W*.3,D*.5-.16,Math.min(1.4,sideWidth-.1),.22,.82,.06,ivory);
        for(let k=0;k<12;k++)B(W*.3-.55+k*.1,D*.5-.1,.035,.12,.88,.025,dark);
      }else{
        const bays=Math.max(1,Math.min(6,Math.floor((W-.4)/4.3)));
        for(let bay=0;bay<bays;bay++){
          const a0=.3+(bay+.5)*(W-.6)/bays,w=Math.min(4,(W-.6)/bays-.1),n=Math.max(2,Math.floor(w/.48));
          shelf(a0,rear,w,3,lego?0xe5b833:ivory);
          for(let r=0;r<3;r++)for(let i=0;i<n;i++){
            const a=a0-w/2+.24+i*(w-.48)/Math.max(1,n-1),h=.59+r*.61,col=toys[(i+r+seed)%5];
            B(a,rear-.15,.36,.19,h,.36,col);B(a,rear-.253,.27,.015,h+.07,.20,ivory);
            B(a,rear-.267,.19,.008,h+.1,.12,lego?0xa84234:col);
          }
        }
        for(const a of islands){
          const w=Math.min(1.7,sideWidth-.2),b=D*.40;table(a,b,w,.85,.65,lego?0xe4ba31:oak);
          for(let i=0;i<6;i++){const aa=a+(i%3-1)*w*.25,bb=b+(i<3?-.19:.19);B(aa,bb,.23,.22,.73,.15,toys[i%5]);for(const da of[-.06,.06])B(aa+da,bb,.05,.05,.88,.035,toys[i%5]);}
        }
      }
    }else if(kind==='rest'||kind==='cafe'||kind==='lounge'){
      const cafe=kind==='cafe',jaju=/JAJU/.test(name);
      const rows=Math.min(4,Math.max(1,Math.floor((D-2)/2.15))),cols=W>7?islands:W>3.8?[W*.24]:[];
      for(const [i,a]of cols.entries())for(let r=0;r<rows;r++){
        const b=1.5+r*2.1,w=Math.min(1.25,sideWidth-.1);table(a,b,w,.8,.72,jaju?oak:cafe?ivory:walnut);
        for(const db of[-.65,.65]){
          B(a,b+db,.43,.43,.08,.35,p.trim);B(a,b+db+(db<0?-.2:.2),.43,.07,.43,.42,p.trim);
          B(a,b+db*.38,.25,.23,.8,.025,ivory);B(a+.20,b+db*.38,.07,.07,.81,.13,ivory);
          B(a-.18,b+db*.38,.025,.2,.81,.018,gold);
          if((r+i+seed)%3===0)person(a,b+db,{sit:true,shirt:stock[(r+i+seed)%6],pants:0x41423d});
        }
        B(a,b,.10,.10,.8,.23,0x76684a);
      }
      // Back counter, open kitchen silhouettes and warm suspended lamps.
      const w=Math.min(4.5,W-.8),b=D-.62;
      B(W/2,b,w,.6,.07,.95,p.dark?walnut:oak);B(W/2,b,w+.05,.65,1.02,.055,ivory);
      for(let i=0;i<Math.min(4,slots);i++){const a=W/2-w/2+.4+i*(w-.8)/Math.max(1,Math.min(4,slots)-1);B(a,b,.24,.25,1.08,.28,metal);}
      if(cafe){B(W*.45,b,.65,.42,1.08,.45,metal);B(W*.45,b-.22,.53,.025,1.20,.17,dark);}
      else if(/일 포노/.test(name)){B(W*.4,b,.9,.65,1.08,.6,0xb6a58b);B(W*.4,b-.34,.50,.025,1.13,.33,dark);}
      for(const a of cols){B(a,D*.5,.025,.025,2.6,.55,gold);B(a,D*.5,.45,.35,2.47,.14,{tex:'emit',color:0xffe1a8});}
    }else if(kind==='service'){
      B(W*.25,D*.4,Math.min(1.4,sideWidth),.7,.04,.78,ivory);B(W*.25,D*.4,.40,.04,.84,.28,dark);
      if(W>4.5){B(W*.76,D*.40,1.2,.6,.06,.38,p.trim);B(W*.76,D*.40+.25,1.2,.1,.44,.4,p.trim);}
    }else{
      const baby=/에그|부가부|스토케|아티포페|바베파파/.test(name),underwear=kind==='lingerie'||/바바라|트라이엄프|비비안/.test(name);
      if(baby){
        for(const a of islands)for(let r=0;r<Math.min(2,Math.floor(D/2.4));r++){
          const b=1.4+r*2.3;B(a,b,.55,.75,.42,.18,stock[(seed+r)%6]);B(a,b+.28,.55,.14,.6,.5,stock[(seed+r)%6]);
          for(const da of[-.26,.26])for(const db of[-.3,.3])B(a+da,b+db,.10,.12,.06,.16,dark);
          for(const da of[-.24,.24])B(a+da,b+.37,.035,.035,.5,.73,metal);B(a,b+.37,.50,.045,1.23,.04,dark);
        }
        eachStock((a,b,h,i)=>folded(a,b,h,stock[(seed+i)%6]),2);
      }else{
        apparel(kind==='kid'||id==='10F',underwear);
        if(/룰루레몬/.test(name)&&W>4.5){
          // Activewear: leggings and folded technical layers beside a yoga mat.
          for(let i=0;i<4;i++){
            const a=.65+i*.42,b=D-.70,col=[0x323a3e,0x6f7e72,0x9a7681,0x303038][i];
            for(const da of[-.07,.07])B(a+da,b,.105,.10,.45,.72,col);
            B(a,b,.27,.1,1.17,.12,col);
          }
          B(W*.22,Math.min(1.4,D*.4),.68,.24,.85,.10,0x6b7c76);
        }
      }
    }
    // Staff remain behind/alongside the counter; customers are clear of the centre aisle.
    // Very small cut fragments are stock niches, not separate staffed shops.
    if(W>2.1&&D>1.2){
      person(Math.min(W-.58,Math.max(.58,W*.78)),D<2?.5:Math.min(D-.5,Math.max(.7,D*.86)),{shirt:staffColor,pants:0x222828});
      if(W*D>55)person(W*.22,Math.max(.7,D*.83),{shirt:staffColor,pants:0x252b2c});
      if(W*D>120)person(W*.76,Math.max(.8,D*.52),{shirt:staffColor,pants:0x252b2c});
      if(kind!=='rest'&&kind!=='cafe'&&kind!=='lounge'){
        person(W*.32,Math.max(.65,Math.min(D-.55,D*.31)),{shirt:stock[(seed+2)%6],pants:0x424747});
        if(W*D>35)person(W*.65,Math.max(.7,Math.min(D-.5,D*.61)),{shirt:stock[(seed+4)%6],pants:0x343c43});
        if(W*D>85)person(W*.33,Math.max(.75,D*.66),{shirt:0xd5c4b0,pants:0x343a3a});
      }
    }
  }
  function fitUpperCell(id,c) {
    const {parts:planParts,face}=c.model,y=LV[id],H=3.65,seed=upperSeed++,palette=upperPalette(id,c);
    // The unchanged facade has a recessed north wall at v=8. Place stock on
    // its room side (not behind that opaque wall), without moving a guide cell.
    const parts=planParts.flatMap(q=>cutRect(q,[22.85,0,44.15,8.35]));
    const largest=parts.reduce((a,b)=>(b[2]-b[0])*(b[3]-b[1])>(a[2]-a[0])*(a[3]-a[1])?b:a,parts[0]||[0,0,0,0]);
    for(const q of parts){
      const [u0,v0,u1,v1]=q,along=face==='N'||face==='S',Wf=along?u1-u0:v1-v0,Dp=along?v1-v0:u1-u0;
      if(Wf<.65||Dp<.65){
        if(parts.some(p=>p[2]-p[0]>=.65&&p[3]-p[1]>=.65))continue;
        // A few retained concessions are shallower than a walk-in fit-out.
        // Keep real stock and the tenant sign entirely inside their source cell.
        const across=u1-u0>=v1-v0,w=across?u1-u0:v1-v0,d=across?v1-v0:u1-u0;
        if(w<.65||d<.30)continue;
        const uc=(u0+u1)/2,vc=(v0+v1)/2,front=across?(face==='N'?'N':'S'):(face==='W'?'W':'E');
        const sb=(at,dep,ww,dd,h,hh,mat)=>{const u=across?u0+at:front==='E'?u1-dep:u0+dep,v=across?(front==='S'?v1-dep:v0+dep):v0+at;box(u,v,across?ww:dd,across?dd:ww,y+h,hh,mat,{solid:false});};
        sb(w/2,d/2,w-.12,d-.12,.04,.72,palette.wall);
        sb(w/2,d/2,w-.10,d-.10,.76,.04,palette.trim);
        sb(w/2,d-.08,w-.14,.035,.80,.80,palette.wall);
        const n=Math.max(2,Math.floor((w-.3)/.65));
        for(let j=0;j<n;j++){
          const at=.22+(w-.44)*(j+.5)/n;
          if(c.name==='지샥'){
            sb(at,d/2,.15,.13,.8,.05,0x262a29);sb(at,d/2,.085,.075,.85,.065,0x777f7e);
            sb(at,d/2,.055,.052,.915,.012,0xc9d2c9);
          }else{
            const color=[palette.accent,0x8b8175,0xc5b7a4,0x4d5754][j%4];
            for(let h=0;h<3;h++)sb(at,d/2,.30,Math.min(.19,d-.18),.80+h*.055,.045,color);
          }
        }
        sign(c.name,uc,vc,y+1.39,front,Math.min(w-.18,3.6),.20,{bg:null,fg:'#3c403c',twoSided:true});
        c.model.renderMode='shallow-display';
        continue;
      }
      const ST=(a,b)=>face==='S'?[u0+a,v1-b]:face==='N'?[u1-a,v0+b]:face==='E'?[u1-b,v1-a]:[u0+b,v0+a];
      const fb=(a,b,w,d,yy,h,mat,o={})=>{
        if(w<=0||d<=0||h<=0)return;
        const [u,v]=ST(a,b),uw=along?w:d,vd=along?d:w;
        const r=[Math.max(u0+.13,u-uw/2),Math.max(v0+.13,v-vd/2),Math.min(u1-.13,u+uw/2),Math.min(v1-.13,v+vd/2)];
        if(r[2]-r[0]<.018||r[3]-r[1]<.018)return;
        box((r[0]+r[2])/2,(r[1]+r[3])/2,r[2]-r[0],r[3]-r[1],yy,h,mat,{solid:false,...o});
      };
      const fsign=(text,a,b,yy,w,h,o={})=>{const[u,v]=ST(a,b);sign(text,u,v,yy,face,Math.min(Math.max(.3,Wf-.28),w),h,{bold:false,...o});};
      const occupied=[];
      const person=(a,b,o={})=>{
        if(a<.38||a>Wf-.38||b<.48||b>Dp-.38||occupied.some(p=>Math.hypot(p[0]-a,p[1]-b)<.55))return;
        const[u,v]=ST(a,b);if(v<8)return;
        occupied.push([a,b]);const[x,z]=P(u,v);K.person(x,y,z,{rotY:FACE[face],...o});
      };
      hq(u0+.13,v0+.13,u1-.13,v1-.13,y+.018,palette.floor);
      const luxury=id==='2F'||id==='3F'||(id==='6F'&&c.kind==='lux');
      // Full-height colour at the back, shallow side returns, open selling front.
      // Never build across a round14 core cut or the white aisle outside a cell.
      if(!c.model.aisleEdges.includes(({N:'S',S:'N',E:'W',W:'E'})[face]))fb(Wf/2,Dp-.20,Wf-.3,.12,y,H-.2,palette.wall);
      const sideDepth=Math.min(Dp*.42,3.4);
      if(id!=='2F'&&id!=='11F')for(const a of [.20,Wf-.20])fb(a,Dp-sideDepth/2-.16,.10,sideDepth,y,H-.2,palette.wall);
      fb(Wf/2,Dp-.29,Wf-.4,.04,y+.10,.055,palette.trim);
      if(luxury||palette.apple){
        const pier=Math.min(.45,Wf*.11),lintel=palette.portal||palette.wall;
        for(const a of [pier/2+.13,Wf-pier/2-.13])fb(a,.29,pier,.34,y,H,lintel);
        fb(Wf/2,.29,Wf-.26,.34,y+3.03,.62,/펜디/.test(c.name)?0xcdc4be:/몽클레르/.test(c.name)?0x0e0f10:lintel);
        fb(Wf/2,.10,Wf-.32,.04,y+3.02,.04,palette.trim);
        // Flanking lit window niches, with a generous central doorway.
        if(!palette.apple&&!/몽클레르|루이비통|펜디/.test(c.name)&&Wf>4.5&&Dp>2.3)for(const a of [Wf*.18,Wf*.82]){
          const ww=Math.min(1.55,Wf*.20);
          fb(a,.62,ww,.65,y+.10,.28,palette.wall);
          fb(a,.93,ww,.055,y+.38,1.9,palette.wall);
          for(const aa of[a-ww/2,a+ww/2])fb(aa,.28,.035,.05,y+.38,2.0,palette.trim);
          fb(a,.28,ww,.035,y+.38,2,'glass');
          fb(a,.6,ww-.06,.48,y+2.38,.035,{tex:'emit',color:0xffeed4});
          // Each window is a real product display, never an opaque empty panel.
          fb(a,.56,.34,.24,y+.45,.27,palette.accent);
          for(const aa of[a-.09,a+.09])fb(aa,.56,.025,.04,y+.72,.11,palette.trim);
          fb(a,.56,.20,.04,y+.82,.025,palette.trim);
          if(!palette.apple)fsign(c.name,a,.23,y+.21,ww*.8,.12,{bg:null,fg:palette.dark?'#e8e0d0':'#51483c'});
        }
        if(/펜디/.test(c.name))fb(Wf/2,.85,Wf-.3,1.5,y+.022,.012,{tex:'ssg_upper_veined',gloss:.5});
        if(/몽클레르/.test(c.name)){
          for(const a of[.5,Wf-.5])fb(a,.18,.6,.12,y,3.0,'ssg_moncler_pylon_lit');
          const door=Math.min(2,Wf*.34);
          for(const [a,w]of [[(Wf-door)/4,(Wf-door)/2],[Wf-(Wf-door)/4,(Wf-door)/2]])fb(a,.22,w-.15,.035,y+.08,2.92,'glass');
          for(const a of[(Wf-door)/2,(Wf+door)/2])fb(a,.19,.08,.07,y,3.03,0x0e0f10);
          for(let h=.2;h<2.8;h+=.14)fb(Wf*.25,Dp-.45,Wf*.35,.055,y+h,.055,0x111314);
        }
        if(/루이비통/.test(c.name)&&id==='2F'&&Wf>3){
          fb(.85,.25,1.2,.05,y+.08,2.8,{tex:'emit',color:0xfff4e0});
          for(let h=.2;h<2.8;h+=.18)for(let a=.34;a<1.45;a+=.18)fb(a+((Math.round(h/.18)%2)*.09),.20,.07,.035,y+h,.07,0xcfc6b6);
        }
      }else{
        // A fascia makes the open concession legible while preserving side aisles.
        if(id!=='8F')fb(Wf/2,.28,Wf-.30,.22,y+2.95,.48,palette.apple?0xf4f4ef:palette.accent);
        else fb(Wf/2,.28,Wf-.30,.12,y+2.56,.38,0x1d1f20);
        fb(Wf/2,.15,Wf-.38,.025,y+2.94,.035,{tex:'emit',color:0xfff1db});
        if(Wf>3&&Dp>3&&['sport','fashion','golf','kid'].includes(c.kind)){
          fb(.65,Dp-.34,.86,.04,y+.55,1.9,{tex:'ssg_upper_graphic',color:0xd7dfd7});
          fsign(c.kind==='golf'?'골프 컬렉션':c.kind==='kid'?'리틀 신세계':'새로운 컬렉션',.65,Dp-.37,y+.70,.72,.14,{bg:'#30413d',fg:'#ffffff'});
        }
      }
      if(q===largest&&!(id==='8F'&&c.name==='K2')){
        const fg=id==='8F'?'#f4f1ea':luxury||palette.apple?'#303536':'#fffaf0',bg=id==='8F'?'#1d1f20':palette.dark?'#202424':null;
        fsign(c.name==='몽클레르'?'MONCLER':c.name==='펜디'?'FENDI':c.name==='루이비통'&&id==='2F'?'LOUIS VUITTON':c.name,Wf/2,.075,y+(id==='8F'?2.75:3.25),Math.min(Wf-.55,8.5),Math.min(id==='8F'?.35:.45,.19+Wf*.035),{bg,fg:palette.dark&&id!=='8F'?'#f4eee0':fg,twoSided:true});
      }
      // A clear counter at the rear side, payment terminal and framed mirror.
      if(Wf>2.3&&Dp>2.8){
        const cw=Math.min(1.4,Wf*.23),a=Wf*.76,b=Dp*.78;
        fb(a,b,cw,.55,y,.93,palette.wall,{solid:true});
        fb(a,b,cw+.04,.59,y+.93,.045,{color:palette.trim,gloss:.5});
        fb(a,b,.30,.25,y+.98,.045,0x444a48);fb(a,b+.07,.26,.06,y+1.02,.24,0x343d3f);
        fb(a,b+.035,.22,.014,y+1.06,.16,{tex:'emit',color:0x9aaeb2});
        if(!['rest','cafe','home','kitchen','elec','service'].includes(c.kind)){
          const ma=Wf-.58;fb(ma,Dp-.3,.62,.04,y+.4,1.92,palette.trim);
          fb(ma,Dp-.33,.53,.025,y+.45,1.82,{color:0xb8c8c7,gloss:.7});
          fb(ma-.12,Dp-.35,.045,.01,y+.57,1.52,0xdde3de);
        }
      }
      const special=id==='8F'&&['K2','르꼬끄','닥터마틴'].includes(c.name);
      const retailKind=/바카라|크리스토플|라리끄|생루이|에르메스 메종|피숀/.test(c.name)?'kitchen':/B&O/.test(c.name)?'elec':/컨시어지/.test(c.name)?'service':/라운지/.test(c.name)?'lounge':c.name==='컴프프로'?'home':c.kind;
      if(!/입점 준비/.test(c.name))furnishUpperMerch({id,name:c.name,kind:retailKind,Wf,Dp,y,H,fb,fsign,person,seed,palette,special});
      else{fb(Wf/2,.3,Wf-.3,.12,y,2.94,palette.wall);fsign('입점 준비 중',Wf/2,.21,y+1.6,Wf*.75,.3,{bg:null,fg:'#5f5b51'});}
      if(id==='11F'||c.name==='JAJU 테이블'){
        const menu=c.name.includes('(')?c.name.split('(')[1].replace(')','').replaceAll('/',' · '):c.name==='JAJU 테이블'?'식사 · 차 · 디저트':'음식 · 음료';
        fsign(menu,Wf*.25,.24,y+1.6,Math.min(1.5,Wf*.38),.5,{bg:'#504b3e',fg:'#fff2da'});
      }
      if(id==='8F'&&c.name==='K2'){
        // D9: 5 curved stainless ribs, cool luminous edges and orange ring hooks.
        const wp=(a,b,h)=>{const[u,v]=ST(a,b),[x,z]=P(u,v);return[x,y+h,z];};
        for(let j=0;j<5;j++){
          const b=.35+j*(Dp-.7)/4;
          for(let i=0;i<20;i++){
            const a=.25+(Wf-.5)*i/20,aa=.25+(Wf-.5)*(i+1)/20,curve=x=>2.05+1.0*Math.sin(PI*(x-.25)/(Wf-.5));
            const q=[wp(a,b,curve(a)),wp(aa,b,curve(aa)),wp(aa,b,curve(aa)+.08),wp(a,b,curve(a)+.08)];
            K.quad(0xb8b5b0,q,[SA,0,CA]);K.quad(0xb8b5b0,[...q].reverse(),[-SA,0,-CA]);
            if(j===0||j===4){const led=[wp(a,b-.03,curve(a)+.025),wp(aa,b-.03,curve(aa)+.025),wp(aa,b-.03,curve(aa)+.05),wp(a,b-.03,curve(a)+.05)];K.quad({tex:'emit',color:0xd8f5ff},led,[SA,0,CA]);}
          }
        }
        fsign('K2',Wf/2,.12,y+2.5,1.4,.6,{bg:null,fg:'#8fd3f4',bold:true});
        for(let a=.6;a<Wf-.4;a+=.65){
          const ring=[];for(let k=0;k<12;k++){const th=k*PI/6,tt=(k+1)*PI/6;ring.push([wp(a+.075*Math.cos(th),Math.min(Dp-.4,1),1.9+.075*Math.sin(th)),wp(a+.075*Math.cos(tt),Math.min(Dp-.4,1),1.9+.075*Math.sin(tt)),wp(a+.1*Math.cos(tt),Math.min(Dp-.4,1),1.9+.1*Math.sin(tt)),wp(a+.1*Math.cos(th),Math.min(Dp-.4,1),1.9+.1*Math.sin(th))]);}for(const q of ring)K.quad(0xe0612a,q,[SA,0,CA]);
        }
        hq(u0+.13,v0+.13,u1-.13,v1-.13,y+.027,{tex:'marble',color:0xc4c8ca,gloss:.3});
      }
      // Warm spots and high, calm store ceilings; no low grid through shop signs.
      const ceilingY=y+3.93;
      if(id!=='8F')hq(u0+.15,v0+.15,u1-.15,v1-.15,ceilingY,CEIL,false);
      for(let a=.9;a<Wf-.3;a+=2.8)for(let b=1;b<Dp-.3;b+=3.4){const[u,v]=ST(a,b);downlight(u,v,ceilingY-.015,.075);}
      // Photographed sports lattice is confined to the rear of those concessions.
      if(false){ // superseded by the shared dark open-grid ceiling
        for(let a=.3;a<Wf-.2;a+=.65)fb(a,Dp*.72,.025,Dp*.50,y+3.70,.10,0xa2aaa9);
        for(let b=Dp*.47;b<Dp-.2;b+=.65)fb(Wf/2,b,Wf-.4,.025,y+3.70,.10,0xa2aaa9);
      }
    }
  }
  function upperCommonDesign(id,guide) {
    const y=LV[id],ceiling=y+4.04,clear=upperKeepClear(id),cells=guide.cells.map(c=>c.model.local);
    const insideCell=(u,v,margin=0)=>cells.some(r=>inR(u,v,r,margin));
    const outline=mainOutlineBottom[id],strip=outline?[0,7.2,upperPlanPoint(id,27,outline)[0],upperPlanPoint(id,1035,outline)[1]]:null;
    const aisle=(u,v,m=.3)=>u>1&&u<66&&v>=8.4&&v<83.7&&!(strip&&inR(u,v,strip,m))&&(id!=='11F'||isGardenPublic(u,v))&&!(id==='11F'&&v<49)&&!(u>22.5&&u<44.5&&v<9.3)&&!insideCell(u,v,m)&&!clear.some(r=>inR(u,v,r,.45));
    // Slab underside already supplies the uninterrupted white ceiling. Long
    // recessed black slots and warm pin lights follow only the actual whitespace.
    for(let u=2;id!=='8F'&&u<66;u+=3.5)for(let v=id==='11F'?49:2;v<84;v+=4.2){
      if(!aisle(u,v,.15))continue;
      if(aisle(u,v-.85,.1)&&aisle(u,v+.85,.1)){
        box(u,v,.09,1.8,ceiling,.065,0x252a28,{solid:false});
        box(u+.32,v,.025,1.68,ceiling-.025,.025,{tex:'emit',color:0xffefd6},{solid:false});
      }
      downlight(u+.45,v,ceiling-.02,.09);
    }
    // Estimate corridor area from the guide's unoccupied 1m cells. Density is
    // one person/25m², with entrances, lift lobbies and escalator landings clear.
    const candidates=[];
    for(let u=1.5;u<66;u+=1)for(let v=1.5;v<83;v+=1)if(aisle(u,v,.6))candidates.push([u,v]);
    const target=Math.floor(candidates.length/25),rng=K.rand(16000+parseInt(id)),placed=[];
    for(let k=0;k<candidates.length;k++){
      const j=Math.floor(rng()*candidates.length),tmp=candidates[k];candidates[k]=candidates[j];candidates[j]=tmp;
    }
    for(const [u,v]of candidates){
      if(placed.length>=target)break;
      if(placed.some(p=>Math.hypot(p[0]-u,p[1]-v)<1.7))continue;
      placed.push([u,v]);const[x,z]=P(u,v),i=placed.length;
      K.person(x,y,z,{rotY:RA+rng()*PI*2,shirt:[0x57646b,0xc8bba5,0x343936,0x96796a,0xd4c9bc,0x788379][i%6],pants:i%3?0x393e3e:0x59626a});
      if(i%3===0){box(u+.24,v,.23,.12,y+.60,.32,0xbea27a,{solid:false});}
    }
  }
  for(const [id,guide]of Object.entries(upperGuidePlans))furnish(id,()=>{
    const y=LV[id],H=clearH(id);
    for(const c of guide.cells)fitUpperCell(id,c);
    // R19 N4: remove obsolete advertising panels; locate slots from this well.
    // D8 supplies the matching corner piers in the structural pass.
    if(id==='2F'||id==='3F'){
      const [a,n,b,s]=upperAtriumRect(id);
      for(const v of[n-1.5,s+1.5]){
        box((a+b)/2,v,b-a,.08,y+H-.1,.06,0x272724,{solid:false});
        for(let u=a+1;u<b;u+=3)downlight(u,v-.4,y+H-.02,.11);
      }
    }
    upperCommonDesign(id,guide);
    if(id==='8F')upperRetailCeiling(id,y);
    sign(id==='2F'?['본관 ↔ 신관','엘리베이터 · 에스컬레이터']: [ `${id} ${upperCats[id]}`,'본관 ↔ 신관'],39.8,51,y+2.8,'N',id==='2F'?2.4:5,id==='2F'?.35:.5,{bg:id==='2F'?'#2f6fb3':'#f1e9da',fg:id==='2F'?'#ffffff':'#4d4133',twoSided:true});
    sign('엘리베이터',24.5,49.44,y+2.55,'N',2.8,.32,{bg:'#36322b',fg:'#e3ceb1'});
    const ar=upperAnnexAtriumRect(id);sign(`${id} · 에스컬레이터`,(ar[0]+ar[2])/2,ar[1]-.6,y+2.3,'N',2.5,.32,{bg:'#35332d',fg:'#f0e7d4'});
  });

  // D6/D7 photo recipes. Exact walk locations are uncertain, so these are
  // assigned to the matching guide junction and side passage, not new tenants.
  furnish('2F',()=>{
    const y=LV['2F'];
    for(const u of[38.6,41]){
      box(u,51,.04,.04,y+2.98,1.0,0xa5a49e,{solid:false});
      box(u,51,.09,6,y+3.87,.06,{tex:'emit',color:0xf3dfb5},{solid:false});
    }
    box(39.8,51,3.1,6,y+4.0,.08,0xe7d7b5,{solid:false});
    for(const v of[50.9,52.6]){
      hq(36.8,v-.15,43,v+.15,y+.025,{color:0x3a3836,gloss:.5});
      for(const d of[-.18,.18])hq(36.8,v+d-.025,43,v+d+.025,y+.027,0xf8f5ef);
    }
    const [u,v]=upperPlanPoint('2F',500,1000);
    for(const side of[-1,1]){
      box(u+3.4,v+side*1.35,2.4,.045,y+.08,3,{tex:'emit',color:side<0?0x245ab7:0xc36d35},{solid:false});
      // Simplified fashion silhouettes stand in for the unavailable campaign art.
      const back=side<0?0x172c57:0x753b25;
      box(u+3.4,v+side*1.32,.65,.02,y+.35,1.2,back,{solid:false});
      upperBall(u+3.4,v+side*1.32,y+1.88,.22,0xd2b8a2,.28);
      box(u+3.4,v+side*1.3,.04,.02,y+.9,.7,0xf0dfcc,{solid:false});
      box(u+3.5,v+side*.65,4.5,.08,y+3.65,.04,0x202324,{solid:false});
    }
    box(u-.75,v,.08,1.35,y+.55,1.75,0xa28c66,{solid:false});
    box(u-.69,v,.025,1.18,y+.63,1.58,{tex:'ssg_upper_graphic',color:0xd7d3c4},{solid:false});
    lightPanel(u+.25,v,y+3.45,1.8,1.3);
  });
  // T1: the photographed winter island belongs in the aisle node by DEUS.
  // Centre (33.5,51.25), 3.0x1.2m: guide cells stay >=1.5m from its perimeter.
  furnish('8F',()=>{
    const y=LV['8F'],u=33.5,v=51.25;
    hq(u-1.5,v-.6,u+1.5,v+.6,y+.012,0x171b1d);
    const wavy=[];
    for(let i=0;i<=16;i++)wavy.push(P(u-.98+i*.12,v-.4+.06*Math.sin(i*PI/4)));
    for(let i=16;i>=0;i--)wavy.push(P(u-.98+i*.12,v+.35+.07*Math.cos(i*PI/4)));
    K.prism(wavy,y+.05,y+.45,{mat:0xf0ede6,solid:true});
    sign('MIGNON',u,v+.42,y+.72,'S',1.6,.32,{bg:null,fg:'#17191a'});
    sign('le coq sportif',u,v+.61,y+.15,'S',1.8,.18,{bg:'#171b1d',fg:'#ffffff'});
    for(const du of[-.48,.42]){
      upperCyl(u+du,v,y+.46,.22,.68,0x49372d);
      box(u+du,v+.12,.42,.48,y+.46,.25,0x49372d,{solid:false});
      for(let i=0;i<6;i++)box(u+du,v+.37,.24,.02,y+.58+i*.065,.02,0x92775c,{solid:false});
    }
    for(const du of[-.65,-.2,.25,.7])upperShoe(u+du,v+.23,y+.46,0xcac5b8,.65);
    for(const du of[-1.18,1.18])upperMannequin(u+du,v-.1,y,du<0?0xece8dd:0x514439);
    upperBall(u+.85,v+.34,y+.9,.18,0xf5f3ec,.26);upperCyl(u+.85,v+.34,y+1.08,.055,.25,0xf5f3ec);upperBall(u+.85,v+.34,y+1.36,.09,0xf5f3ec);
    box(u-1.2,v+.32,.025,.025,y,.9,0x282b2c,{solid:false});
    sign('르꼬끄 방한화 팝업',u-1.2,v+.34,y+1.1,'S',.48,.38,{bg:'#f0e9de',fg:'#342d2b'});
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
        sign(['K2','에어로스피어'],54.2,26.8,y+1.38,'W',1.02,1.5,{bg:'#142b47',fg:'#8acbe3',bold:true});
        const [x,z]=P(48.4,25.1);K.person(x,y,z,{shirt:0x2e383b,rotY:FACE.W});

    });
    inOfficialCell('르꼬끄',[27.5,21.5,39.2,31.5],(f,y)=>{
      const {box,hq,sign,wall,P,rect,upperCyl,upperBall,upperShoe,upperMannequin,coatRack}=f,H=3.2;
        // The wavy plinth, boots and mannequins have moved into the aisle node.
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

  // D10 shell: an enclosed garden installation, with an actual 1.6 m doorway.
  // The 6 × 12.6 m footprint, 3.15 m eave and shallow ridge are estimates; the
  // photos establish the lancets/film/ribbons but do not resolve the roof shape.
  for(const edge of [[25,20,25,32.6],[31,20,31,32.6],[25,20,31,20]])
    wall(...edge,LV['11F'],LV['11F']+3.15,{mat:'glass',thick:.035});
  wall(25,32.6,31,32.6,LV['11F'],LV['11F']+3.15,{mat:'glass',thick:.035,openings:[{at:3,w:1.6,y0:LV['11F'],y1:LV['11F']+2.7}]});
  furnish('11F',()=>{
    const y=LV['11F'],frameMat=0xf4f3ef,colors=[0xd9479a,0xf0a53a,0xf3d34a,0x6fbf5a,0x9a7ad8];
    hq(.8,.8,66.2,56.4,y+.006,{tex:'roofgravel',color:0x9a958c});
    K.hpoly({tex:'tile',color:0xd8d4c9,gloss:.3},gardenCross.map(p=>P(...p)),y+.012,true);
    for(const r of gardenWalkRects)hq(...r,y+.013,{tex:'tile',color:0xd8d4c9,gloss:.3});
    const films=colors.map((color,i)=>{
      const key=`ssg_garden_film_${i}`;
      K.material(key,new K.THREE.MeshPhongMaterial({color,emissive:color,emissiveIntensity:.13,transparent:true,opacity:.60,depthWrite:false,side:K.THREE.DoubleSide,shininess:65}));return key;
    });
    const W=(u,v,h)=>{const[x,z]=P(u,v);return[x,y+h,z];};
    // A lancet comprises a straight lower pane plus a pointed, curved head.
    function lancet(fixed,centre,alongV,half,color){
      const Q=(s,h)=>alongV?W(fixed,centre+s,h):W(centre+s,fixed,h),normal=alongV?[CA,0,-SA]:[SA,0,CA];
      K.quad(color,[Q(-half,.18),Q(half,.18),Q(half,2.07),Q(-half,2.07)],normal);
      const arc=[];
      for(let j=0;j<=8;j++){const t=j/8;arc.push([-half+half*t*t,2.07+.98*t-.02*t*t]);}
      for(let j=7;j>=0;j--){const t=j/8;arc.push([half-half*t*t,2.07+.98*t-.02*t*t]);}
      for(let j=0;j<arc.length-1;j++){
        const p=arc[j],q=arc[j+1],ds=q[0]-p[0],dh=q[1]-p[1],L=Math.hypot(ds,dh),ns=-dh/L*.025,nh=ds/L*.025;
        K.quad(color,[Q(0,2.07),Q(...p),Q(...q),Q(0,2.07)],normal);
        K.quad(frameMat,[Q(p[0]+ns,p[1]+nh),Q(q[0]+ns,q[1]+nh),Q(q[0]-ns,q[1]-nh),Q(p[0]-ns,p[1]-nh)],normal);
      }
      for(const ss of [-half,half]){
        const[u,v]=alongV?[fixed,centre+ss]:[centre+ss,fixed];box(u,v,alongV?.055:.04,alongV?.04:.055,y+.13,1.97,frameMat,{solid:false});
      }
    }
    for(const u of [25,31]){
      for(let j=0;j<=9;j++)box(u,20+j*1.4,.08,.08,y,3.22,frameMat,{solid:false});
      for(const h of [.12,2.08,3.15])box(u,26.3,.08,12.6,y+h,.08,frameMat,{solid:false});
      for(let j=0;j<9;j++)for(const offset of [-.34,.34])lancet(u+(u===25?-.023:.023),20.7+j*1.4+offset,true,.30,films[(j+(offset>0?1:0))%5]);
    }
    for(const v of [20,32.6]){
      for(const u of [25,26.5,28,29.5,31]){
        if(v===32.6&&u===28)continue;
        box(u,v,.08,.08,y,3.22,frameMat,{solid:false});
      }
      for(const h of [3.15])box(28,v,6,.08,y+h,.08,frameMat,{solid:false});
      for(const u of [25.55,26.65,29.35,30.45])lancet(v+(v===20?-.024:.024),u,false,.49,films[Math.floor(u)%5]);
      if(v===20)for(const u of[27.45,28.55])lancet(v-.024,u,false,.49,films[Math.floor(u)%5]);
      if(v===32.6){
        for(const u of[27.2,28.8])box(u,v,.08,.10,y,2.76,frameMat,{solid:false});
        box(28,v,1.68,.10,y+2.7,.08,frameMat,{solid:false});
      }
    }
    // Shallow straight-ridge closure: explicitly estimated, not an observed
    // barrel vault. Saturated panes remain visible through the white frame.
    for(let j=0;j<9;j++)for(const side of [-1,1]){
      const u=28+side*3,v=20+j*1.4;
      K.quad(films[(j+(side>0?2:0))%5],[W(u,v,3.2),W(28,v,3.82),W(28,v+1.4,3.82),W(u,v+1.4,3.2)],[0,1,0]);
      const a=W(u,v,3.2),b=W(28,v,3.82),vv=.04;
      K.quad(frameMat,[[a[0],a[1],a[2]-vv],[b[0],b[1],b[2]-vv],[b[0],b[1],b[2]+vv],[a[0],a[1],a[2]+vv]],[0,1,0]);
    }
    box(28,26.3,.08,12.75,y+3.8,.08,frameMat,{solid:false});
    for(let i=0;i<50;i++){
      const u=25.55+(i%5)*1.21,v=20.7+Math.floor(i/5)*1.18,film=films[i%5];
      for(let k=0;k<7;k++){
        const h=3.02-k*.29,a=.075*Math.sin(k*1.4+i),b=.075*Math.sin((k+1)*1.4+i);
        K.quad(film,[W(u+a-.025,v,h),W(u+a+.025,v,h),W(u+b+.025,v,h-.29),W(u+b-.025,v,h-.29)],[SA,0,CA]);
        if(k%2===0)K.quad(film,[W(u+a,v,h-.05),W(u+a+.18,v+.045,h-.17),W(u+a,v,h-.29),W(u+a-.15,v-.045,h-.17)],[SA,0,CA]);
      }
    }
    function hydrangea(u,v){
      upperBall(u,v,y+.4,.44,0x5f7f45,.32);
      for(let j=0;j<3;j++){
        const a=j*PI*2/3,uu=u+Math.cos(a)*.22,vv=v+Math.sin(a)*.22;
        for(let k=0;k<3;k++)upperBall(uu,vv,y+.72+k*.16,.23-k*.055,k%2?0xdde6b8:0xeef0d6,.20-k*.025);
      }
    }
    // Keep the original three garden beds, relocated from the closed roof
    // corners into the official cross. Panicle heads are lime/white, never blue.
    for(const[a,b,c,d]of[[8,24,17,32],[50,24,60,32],[22,40,29,47]]){
      boxR(a,b,c,d,y,.3,0xc9c5b9);hq(a+.15,b+.15,c-.15,d-.15,y+.31,{tex:'grass',color:0x5a7152});
      for(let u=a+.8;u<c-.5;u+=1.4)for(let v=b+.8;v<d-.5;v+=1.9)hydrangea(u,v);
    }
    for(let v=20.6;v<32.3;v+=.9)for(const u of[24.1,31.9])hydrangea(u,v);
    for(const u of[25,25.9,26.8,29.2,30.1,31])hydrangea(u,33.45);
    wall(23.5,18.65,32.5,18.65,y,y+2.75,{mat:{tex:'brick',color:0x9a8a79},thick:.18});
    for(let j=0;j<6;j++)for(let i=0;i<13;i++)if((i+j)%3){
      upperBall(23.8+i*.68,18.82,y+.4+j*.38,.22,0x627b4d,.26);
    }
    for(const[u,v]of[[22,15],[37,20],[37,34],[30,46]]){
      box(u,v,2.4,.62,y,.45,{tex:'wood',color:0xa89272});box(u,v+.26,2.4,.10,y+.45,.5,{tex:'wood',color:0xa89272},{solid:false});
    }
    sign(['S GARDEN','에스 가든'],40,47.7,y+1.5,'S',3,.65,{bg:'#e3e0d4',fg:'#475745',bold:false});
    const[x,z]=P(35,26);K.person(x,y,z,{shirt:0xc3b5a1,rotY:FACE.W});
    const[a,b]=P(30.6,46);K.person(a,y,b,{shirt:0x59645c,sit:true});
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
  sp('1M 액세서리 · 여행 · 식음료', 12.1, 32.4, LV['1M'], -1, 0);




  sp('8F 겨울 매장 · 에스컬레이터', 40.8, 49.2, LV['8F'], 1, 0);
  sp('4F 그랜드 슈', 41.2, 41, LV['4F'], 0, 1);
  sp('11F 전문식당가 · S GARDEN', 34, 57.5, LV['11F'], 0, 1);
  for(const id of Object.keys(upperGuidePlans))sp(`${id} ${upperCats[id]}`,id==='11F'?34:24.5,id==='11F'?57.5:56.2,LV[id],0,-1);
  K.spawn({ name: 'B1 고투몰 ↔ 신세계 연결통로', x: -70, y: LV.B1, z: -70, yaw: PI });
}


// Round 14: official grey cells, transcribed in the original raster coordinates.
// The sheet is rotated into the retained OSM rectangle: x -> v, y -> -u.
// Round18 fits the usable retail envelope with one scale per axis; see research for residual aspect-ratio and circulation reservations.
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
// Round18: one outline-derived scale on each axis, with no atrium/wing knots.
// Constrained option B: the shared OSM envelope is retained. The residual aspect
// ratio is explicit; a full isotropic annex would overlap the adjoining hotel.
export const upperPlanPoint = (id,px,py) => {
  const p=upperGuidePlans[id];
  return [66.5-66*(py-p.top)/(p.bottom-p.top), 8.7+(px-27)*75.5/1748];
};
export const upperPlanRect=(id,r)=>{const a=upperPlanPoint(id,r[0],r[1]),b=upperPlanPoint(id,r[2],r[3]);return[b[0],a[1],a[0],b[1]];};
export const upperAtriumRect=id=>upperPlanRect(id,upperGuidePlans[id].well);
export const upperAnnexAtriumRect=id=>{
  const r=upperPlanRect(id,upperRightPads[id]),u=(r[0]+r[2])/2,v=(r[1]+r[3])/2;
  // Four alternating lanes need 7m clear; this is an explicit circulation reservation.
  return[u-5.9,v-3.5,u+5.9,v+3.5];
};
// Rectangular swept wells include both incoming/outgoing ramp projections. The
// guide icons shift between floor diagrams; bridges restore the level landings.
export function upperPhysicalWell(id,annex=false){
  const ids=Object.keys(upperGuidePlans),i=ids.indexOf(id),fn=annex?upperAnnexAtriumRect:upperAtriumRect,r=fn(id),points=[[r[0],r[1]],[r[2],r[3]]];
  if(i>0){
    const p=fn(ids[i-1]),rev=(i-1)%2;
    for(const off of upperLaneOffsets(i-1,annex)){
      const a=annex?[rev?p[2]:p[0],(p[1]+p[3])/2+off]:[(p[0]+p[2])/2+off,rev?p[3]:p[1]],b=annex?[rev?r[0]:r[2],(r[1]+r[3])/2+off]:[(r[0]+r[2])/2+off,rev?r[1]:r[3]];
      // Below t=.45 the arriving player's head is below this floor's soffit.
      const dx=b[0]-a[0],dz=b[1]-a[1],len=Math.hypot(dx,dz),nx=-dz/len,nz=dx/len;
      for(const t of[.43,1]){const u=a[0]+dx*t,v=a[1]+dz*t;points.push([u+nx*.82,v+nz*.82],[u-nx*.82,v-nz*.82]);}
    }
  }
  return [Math.min(...points.map(p=>p[0]))-.12,Math.min(...points.map(p=>p[1]))-.12,Math.max(...points.map(p=>p[0]))+.12,Math.max(...points.map(p=>p[1]))+.12];
}
// Cell-only setbacks widen actual white aisles to 2.4m. Raw plan cells and every
// tenant name remain unchanged; boundaries between touching cells do not move.
export function upperBuildRect(id,c) {
  const plan=upperGuidePlans[id],raw=upperPlanRect(id,c.rect),r=raw.slice(),all=plan.cells;
  // Digitised 1–4px divider gaps are shared cell boundaries, not white aisles.
  const dividerU=4*66/(plan.bottom-plan.top),dividerV=4*75.5/1748;
  for(const o of all){if(o===c)continue;const q=upperPlanRect(id,o.rect);
    if(Math.min(raw[2],q[2])-Math.max(raw[0],q[0])>.25){
      const n=raw[1]-q[3],s=q[1]-raw[3];
      if(n>dividerV+1e-6&&n<2.4)r[1]=Math.max(r[1],raw[1]+(2.4-n)/2);
      if(s>dividerV+1e-6&&s<2.4)r[3]=Math.min(r[3],raw[3]-(2.4-s)/2);
    }
    if(Math.min(raw[3],q[3])-Math.max(raw[1],q[1])>.25){
      const w=raw[0]-q[2],e=q[0]-raw[2];
      if(w>dividerU+1e-6&&w<2.4)r[0]=Math.max(r[0],raw[0]+(2.4-w)/2);
      if(e>dividerU+1e-6&&e<2.4)r[2]=Math.min(r[2],raw[2]-(2.4-e)/2);
    }
  }
  for(const axis of[0,1]){
    const width=raw[axis+2]-raw[axis],min=Math.min(width,.85),loss=(r[axis]-raw[axis])+(raw[axis+2]-r[axis+2]);
    if(width-loss<min&&loss>0){const f=(width-min)/loss;r[axis]=raw[axis]+(r[axis]-raw[axis])*f;r[axis+2]=raw[axis+2]-(raw[axis+2]-r[axis+2])*f;}
  }
  // R19 N2: façade shoulders belong to their first-row cells. The structural
  // and fitting passes clip only the recessed u23–44 bay, not the whole row.
  if(c.rect[0]<=79&&id!=='11F')r[1]=.5;
  // L2 scoped fallback: at least 3m of run-off after the first 1F up bank.
  if(id==='2F'&&c.name==='구찌'&&c.rect[0]===372)r[0]=Math.max(r[0],46.6);
  return r;
}


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
