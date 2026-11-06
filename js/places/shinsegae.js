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

// floor levels (walkable top). 1F is a tall luxury hall with the 1M mezzanine inside it.
const LV = { B2: -11, B1: -6, '1F': 0, '1M': 3.6, '2F': 7, '3F': 11.8, '4F': 16.6, '5F': 21.4, '6F': 26.2, '7F': 31, '8F': 35.8, '9F': 40.6, '10F': 45.4, '11F': 50.2, RF: 55 };
// thickness of the slab whose top is at that level (its underside = ceiling of the floor below)
const TH = { B2: 0.4, B1: 0.5, '1F': 1.0, '1M': 0.4, '2F': 0.5, RF: 0.6 };
const MAIN = ['B2', 'B1', '1F', '2F', '3F', '4F', '5F', '6F', '7F', '8F', '9F', '10F', '11F']; // stacked floors (no 1M)
const thick = id => TH[id] ?? 0.6;
const nextOf = id => { const i = MAIN.indexOf(id); return i < MAIN.length - 1 ? MAIN[i + 1] : 'RF'; };
const clearH = id => LV[nextOf(id)] - thick(nextOf(id)) - LV[id];

// atrium / escalator void (stacked 1F..11F) and the escalator lanes inside it
const ATR = [27.6, 35, 39.4, 47];
const LANE = { A: 28.6, B: 30.2, C: 36.8, D: 38.4 };
// elevator bank (3 cars) south of the atrium, doors facing north
const ELV = [30.5, 33.5, 36.5].map(u => ({ u, v: 66, w: 2.4, d: 2.2 }));
// stair cores: NE (door west) and SW (door east)
const CORES = [
  { uL: 61.4, uR: 66.75, v0: 9.8, v1: 24.2, door: 'W', lanes: [62.6, 64.8], top: '8F' },   // 본관 core
  { uL: 0.25, uR: 5.8, v0: 61.8, v1: 76.2, door: 'E', lanes: [3.6, 1.4], top: '11F' },    // 신관 core
];
const MEZZ = [8, 58, 60, 84.45];
// 01/02/10: separate B1 food-hall void, capped by the retained 1M slab (9.2 m clear).
// The SW plan position is approximate; the shared junctions and main escalator stack stay fixed.
const HOS_VOID = [8.6, 60, 23.5, 74.5];
// Two volumes inside the one OSM rectangle (namu: 적갈색 부분 = 백화점 본체, 그 남쪽 JW 쪽 회색 저층 = 옛 마르퀴스 플라자,
// 2016년 그 위에 6개 층을 증축). 본관 = v 0..VS (신반포로 쪽, 1F~8F), 신관 = v VS..VD (JW 쪽, 1F~11F).
// 2026 ssg_06 resolves the recessed north-facing curtain wall; unseen side/rear cladding stays plain stone.
// Roof55 = 7m ground hall + ten4.8m storeys; exceeds OSM34m/10levels to retain the researched11F. Both heights are unverified.
const VS = 33;
const UPPER = new Set(['9F', '10F', '11F']); // floors that exist only in the 신관 volume

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
  // Plain warm gypsum: the retail interiors have no acoustic-tile grid.
  K.material('ssg_ceil', new K.THREE.MeshLambertMaterial({ color: 0xeee7dd, emissive: 0x554f46 }));
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
  const IN = 0xf2eee7, YB = LV['9F'], STEEL = 0x252c2b;
  K.polyWalls(FULL, LV.B2, LV.B1, { mat: 'concrete', inner: 0xb3b1a7, thick: 0.3, openings: [
    { x: P(UW, 54.5)[0], z: P(UW, 54.5)[1], w: 6.5, y0: LV.B2, y1: -8.2 },
  ] });
  K.polyWalls(FULL, LV.B1, 0, { mat: 'concrete', inner: IN, thick: 0.3, openings: [
    { x: P(39.65, 0)[0], z: P(39.65, 0)[1], w: 9, y0: LV.B1, y1: -2.7 },
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
  exWall('E', UW, VS, VD, 0, 7, { mat: 'ssg_granite' });
  exWall('W', 0, 0, 18.5, 0, 7, { mat: 'ssg_tower_stone' });
  exWall('W', 0, 18.5, VS, 0, 7, { mat: 'ssg_granite' });
  exWall('W', 0, VS, VD, 0, 7, { mat: 'ssg_granite', openings: [{ s: J4V, w: 8, y0: 0, y1: 3.4 }] });
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
  const BAY_BACK = 8, BAY_TOP = YB, GLASS_TOP = 48;
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
  K.prism(rect(TOWER_W, BAY_BACK, UW - TOWER_W, VS), YB, GLASS_TOP, {
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
    exWall(f, pl, s0, s1, 7, LV.RF + 0.65, { mat: 'ssg_granite' });
  exWall('N', VS, 0, UW, YB, LV.RF + 0.65, { mat: 'ssg_glass', floorH: 3.2, vBase: 7 });
  K.slab(rect(0, VS, UW, VD), LV.RF, { mat: 'roofgravel', under: CEIL, thick: TH.RF, edge: false });
  for (const [f, c, len, pl] of [['N', UW / 2, UW, VS], ['E', (VS + VD) / 2, VD - VS, UW], ['W', (VS + VD) / 2, VD - VS, 0], ['S', UW / 2, UW, VD]])
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
  zone('신세계백화점 정문', '1F', '신반포로 · 유리 출입문', [20.5, -7.4, 46.5, 6], 0, 6, 2);
  zone('신세계 정문 승하차장', '1F', '백화점 정문 · 보행 광장', [-10, -22, 77, -7.4], 0, 4, 2);

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
  zone('신세계 동측 지상주차장', '1F', '장애인 주차구역 · 차량 통로 · 백화점 출입구', [70.7, -12, 91.2, 55], 0, 4, 2);

  // ------------------------------------------------------------ B2 vehicle ramp (explicit location guess)
  // 6.5 m two-way switchback: 34.7 m southbound + 19.6 m turn + 20.2 m return.
  // The surface cut stays west of the OSM service road. The lower return may
  // pass below the road, then joins the store at u67/v54.5 on B2.
  const RAMP_W = 6.5, TURN_R = 6.25, TURN_N = 32;
  const rampPath = [[71, 40, 0], [71, 74.7, -5.12]];
  for (let i = 1; i <= TURN_N; i++) {
    const a = PI - PI * i / TURN_N;
    rampPath.push([77.25 + TURN_R * Math.cos(a), 74.7 + TURN_R * Math.sin(a), -5.12 - 2.90 * i / TURN_N]);
  }
  rampPath.push([83.5, 54.5, LV.B2]);
  K.groundHole(rect(67.6, 40, 74.4, 59.8));
  // Side retaining walls stop above the bottom connecting tunnel.
  for (const u of [67.6, 74.4]) wall(u, 40, u, 59.8, -8.15, 0.75, { mat: 'concrete', thick: 0.2 });
  for (let i = 0; i < rampPath.length - 1; i++) {
    const a = rampPath[i], b = rampPath[i + 1], pa = P(a[0], a[1]), pb = P(b[0], b[1]);
    // Slightly overlapping arc chords close the small outer wedge at each bend.
    const dx = pb[0] - pa[0], dz = pb[1] - pa[1], len = Math.hypot(dx, dz), pad = i > 0 && i < rampPath.length - 2 ? 0.23 : 0;
    const dy = b[2] - a[2];
    K.ramp(pa[0] - dx / len * pad, pa[1] - dz / len * pad, pb[0] + dx / len * pad, pb[1] + dz / len * pad,
      { w: RAMP_W, ya: a[2] - dy / len * pad, yb: b[2] + dy / len * pad, mat: { tex: 'concrete', color: 0x888982 }, rails: false });
    // Thin center marking, with no raised divider to obstruct the turn.
    const nx = -dz / len * 0.045, nz = dx / len * 0.045;
    K.quad(0xd5ba64, [[pa[0] + nx, a[2] + 0.015, pa[1] + nz], [pb[0] + nx, b[2] + 0.015, pb[1] + nz], [pb[0] - nx, b[2] + 0.015, pb[1] - nz], [pa[0] - nx, a[2] + 0.015, pa[1] - nz]], [0, 1, 0]);
  }
  // Underground enclosure: surface remains intact over the lower ramp.
  hq(67.5, 59.8, 87, 84.3, -0.35, 'concrete', false);
  hq(74.5, 50.9, 87, 59.8, -0.35, 'concrete', false);
  wall(67.5, 59.8, 67.5, 84.3, -8.2, -0.25, { mat: 'concrete', thick: 0.2 });
  wall(87, 50.9, 87, 84.3, -11.2, -0.25, { mat: 'concrete', thick: 0.2 });
  wall(67.5, 84.3, 87, 84.3, -8.2, -0.25, { mat: 'concrete', thick: 0.2 });
  // Level 6.5m crossing below the outbound leg; keep full height to B2 opening.
  K.slab(rect(65.8, 51.25, 86.8, 57.75), LV.B2, { mat: 'concrete', thick: 0.25, under: false, ceil: false });
  hq(66.8, 51.25, 74.4, 57.75, -8.2, 'concrete', false);
  for (const v of [51.25, 57.75]) wall(66.8, v, 74.4, v, LV.B2, -8.2, { mat: 'concrete', thick: 0.18 });
  // Roof and posts give the entry a visible vehicle address without a guessed gatehouse.
  box(71, 38.3, 7.4, 3.0, 3.35, 0.22, 0x333735, { solid: false });
  for (const u of [67.5, 74.5]) {
    box(u, 38.7, 0.25, 0.25, 0, 3.4, 0x444b46);
    box(u, 40.2, 0.32, 0.42, 0, 1.0, 0x73766d);
  }
  box(71, 39.6, 6.7, 0.16, 2.3, 0.18, 0xd1b659, { solid: false });
  sign('주차장 입구 / 출구', 71, 36.76, 3.46, 'N', 6.8, 0.58, { bg: '#333735', fg: '#f3efe5' });
  sign('높이제한 2.3m', 71, 39.49, 2.4, 'N', 3.2, 0.28, { bg: '#d1b659', fg: '#262b29' });
  // Barrier equipment shown in its raised position, preserving two-way movement.
  for (const u of [67.5, 74.5]) box(u, 40.2, 0.1, 0.1, 1, 2.1, 0xe3ded0, { solid: false });
  zone('신세계 지하주차장 차량 진출입로', 'B2', '지상주차장 ↔ B2 · 높이제한 2.3m', [67.5, 38.5, 87, 84.3], LV.B2, 3.5, 3);

  // ------------------------------------------------------------ slabs
  // Match the upper slab contour to the recessed glazing: no shelves protrude outside it.
  const northOutline = (vSouth, y) => {
    const front = y >= 20 && y < 24 ? [[23, BAY_BACK], [44, BAY_BACK]]
      : [[23, BAY_BACK], ...bay, [44, BAY_BACK]];
    return [P(0, 0), P(23, 0), ...front.map(p => P(...p)), P(44, 0), P(UW, 0), P(UW, vSouth), P(0, vSouth)];
  };
  const elvHoles = ELV.map(e => rect(e.u - e.w / 2, e.v - e.d / 2, e.u + e.w / 2, e.v + e.d / 2));
  const atrHole = rect(...ATR);
  // stair hole at main-floor index s (B2=0): lane of the flight that arrives from s-1
  const stairLaneU = (c, s) => c.lanes[(s - 1) % 2];
  const stairHole = (c, s) => { const u = stairLaneU(c, s); return rect(u - 0.85, c.v0 + 2.2, u + 0.85, c.v1 - 2.2); };
  const coreTop = c => MAIN.indexOf(c.top);
  const floorMat = { B2: { tex: 'concrete', color: 0x8c8d89 }, B1: 'ssg_marble', '1F': 'ssg_marble_polished', '2F': 'ssg_marble', '3F': 'ssg_marble', '11F': { tex: 'darkstone', color: 0xd4c5af } };
  MAIN.forEach((id, s) => {
    const holes = [...elvHoles];
    if (s >= 2) holes.push(atrHole);
    if (id === '1F') holes.push(rect(...HOS_VOID));
    if (s >= 1) for (const c of CORES) if (s <= coreTop(c)) holes.push(stairHole(c, s));
    K.slab(UPPER.has(id) ? rect(0, VS, UW, VD) : LV[id] >= LV['2F'] ? northOutline(VD, LV[id]) : FULL, LV[id], { mat: floorMat[id] ?? 'ssg_marble', thick: thick(id), holes, edge: false, under: id === 'B2' ? false : id === 'B1' ? { tex: 'concrete', color: 0xb4b2a9 } : CEIL });
  });
  K.slab(northOutline(VS, YB), YB, { mat: 0x4a4a4c, thick: thick('9F'), edge: false, under: CEIL }); // 본관 roof
  // Aerial: dark membrane, mechanical penthouse, pale cooling boxes and an AC grid.
  // Roof pixels lean NW in the photograph; these ground-frame placements remain approximate.
  // The north glass enclosure now contains the central roof block; exposed services stay behind the square towers.
  boxR(20, 12, 40, 24, YB, 3.5, 0x85827c, { solid: false, top: 0x99968f });
  for (const [u, v] of [[5.5, 25], [10, 25], [14.5, 25], [50, 25], [54.5, 25], [59, 25], [63, 25]]) {
    box(u, v, 3, 3, YB + 0.2, 3, 0xd8d8d4, { solid: false, top: 0xbfc1bd });
    const [x, z] = P(u, v); K.cyl({ x, z, y: YB + 3.21, r: 0.75, h: 0.12, mat: 0x777d79, seg: 12, solid: false });
    for (const dv of [-1, -0.5, 0, 0.5, 1]) box(u, v + dv, 2.6, 0.055, YB + 2.4, 0.1, 0x8f9693, { solid: false });
  }
  for (let u = 44; u <= 51; u += 2) for (let v = 20; v <= 26; v += 2) {
    box(u, v, 1.2, 1.2, YB + 0.1, 1, 0xc9ccc8, { solid: false, top: 0x7c8581 });
  }
  // mezzanine slab
  K.slab(rect(...MEZZ), LV['1M'], { mat: { tex: 'wood', color: 0xe6d2b8 }, thick: TH['1M'], holes: elvHoles, edge: true, edgeMat: 0xf4efe6, under: CEIL });

  // ------------------------------------------------------------ escalators (zigzag in the stacked atrium)
  const escH = 0.95;
  for (let i = 0; i < MAIN.length - 2; i++) { // pair i: MAIN[i+1] -> MAIN[i+2]  (B1->1F is i=0)
    const lo = LV[MAIN[i + 1]], hi = LV[MAIN[i + 2]];
    const even = i % 2 === 0;
    const [uu, ud] = even ? [LANE.A, LANE.B] : [LANE.C, LANE.D];
    const vLo = even ? ATR[1] : ATR[3], vHi = even ? ATR[3] : ATR[1];
    for (const [u, dir] of [[uu, 'up'], [ud, 'down']]) {
      const a = P(u, vLo), b = P(u, vHi);
      K.escalator(a[0], a[1], b[0], b[1], { ya: lo, yb: hi, w: 1.2, dir, speed: 0.6 });
    }
    // Small destination plaque on the balustrade, below the sightline.
    sign(`${MAIN[i + 2]} ↑`, uu, vLo + (even ? -0.55 : 0.55), lo + 0.85, even ? 'N' : 'S', 0.55, 0.2, { bg: '#d8cbb8', fg: '#504638' });
  }
  // atrium railings + fascia on 1F..11F
  for (let k = 1; k < MAIN.length; k++) {
    const id = MAIN[k], y = LV[id], th = thick(id);
    const gaps = { 35: [], 47: [] };
    const AB = [ATR[0], 31.0], CD = [36.0, ATR[2]];
    // pair k-1 upper end, pair k lower end
    // pair index i runs MAIN[i+1] -> MAIN[i+2]: the pair arriving at MAIN[k] is i=k-2, the departing one is i=k-1
    const arr = k - 2, dep = k - 1;
    if (arr >= 0) { if (arr % 2 === 0) gaps[47].push(AB); else gaps[35].push(CD); }
    if (dep <= MAIN.length - 3) { if (dep % 2 === 0) gaps[35].push(AB); else gaps[47].push(CD); }
    const railSeg = (u0, v0, u1, v1) => {
      wall(u0, v0, u1, v1, y, y + 1.1, { mat: 'glass', thick: 0.04 });
      const L = Math.hypot(u1 - u0, v1 - v0); if (L < 0.05) return;
      box((u0 + u1) / 2, (v0 + v1) / 2, Math.abs(u1 - u0) + 0.06, Math.abs(v1 - v0) + 0.06, y + 1.1, 0.06, 0xb9a77f, { solid: false });
    };
    for (const v of [35, 47]) {
      let cur = ATR[0];
      for (const g of gaps[v].sort((p, q) => p[0] - q[0])) { if (g[0] - cur > 0.15) railSeg(cur, v, g[0], v); cur = Math.max(cur, g[1]); }
      if (ATR[2] - cur > 0.15) railSeg(cur, v, ATR[2], v);
    }
    railSeg(ATR[0], 35, ATR[0], 47); railSeg(ATR[2], 35, ATR[2], 47);
    // white fascia band on the void edges
    boxR(ATR[0], ATR[1], ATR[2], ATR[1] + 0.04, y - th, th, 0xf7f4ee, { solid: false, skip: ['top', 'bottom'] });
    boxR(ATR[0], ATR[3] - 0.04, ATR[2], ATR[3], y - th, th, 0xf7f4ee, { solid: false, skip: ['top', 'bottom'] });
    boxR(ATR[0], ATR[1], ATR[0] + 0.04, ATR[3], y - th, th, 0xf7f4ee, { solid: false, skip: ['top', 'bottom'] });
    boxR(ATR[2] - 0.04, ATR[1], ATR[2], ATR[3], y - th, th, 0xf7f4ee, { solid: false, skip: ['top', 'bottom'] });
  }
  // ------------------------------------------------------------ elevators
  const ELV_FLOORS = [
    { label: 'B2', y: LV.B2, name: '주차장' },
    { label: 'B1', y: LV.B1, name: '식품관 · 스위트파크 · 하우스 오브 신세계' },
    { label: '1F', y: LV['1F'], name: '화장품 · 해외유명브랜드 · 잡화' },
    { label: '1M', y: LV['1M'], name: '메자닌 · 퍼퓸 · 버건디&' },
    { label: '2F', y: LV['2F'], name: '해외유명브랜드' },
    { label: '3F', y: LV['3F'], name: '인터내셔널 디자이너 · 워치&주얼리' },
    { label: '4F', y: LV['4F'], name: '여성 컨템포러리 · 그랜드 슈' },
    { label: '5F', y: LV['5F'], name: '여성 클래식 · 영캐주얼 · 핸드백' },
    { label: '6F', y: LV['6F'], name: '남성 럭셔리 · 남성 컨템포러리' },
    { label: '7F', y: LV['7F'], name: '골프 · 아웃도어 · 남성 정장' },
    { label: '8F', y: LV['8F'], name: '스포츠 · 진 · 이벤트홀' },
    { label: '9F', y: LV['9F'], name: '신세계홈 (가구 · 가전 · 키친)' },
    { label: '10F', y: LV['10F'], name: '리틀 신세계 · 란제리' },
    { label: '11F', y: LV['11F'], name: '전문식당가 · S GARDEN' },
  ];
  // Arrive on the level landing just north of each car, with the full floor list retained.
  const ARR = { dx: -2.2 * SA, dz: -2.2 * CA };
  ELV.forEach((e, i) => {
    const [x, z] = P(e.u, e.v);
    K.elevator({ name: `신세계 강남점 엘리베이터 ${i + 1}호기`, x, z, rotY: RA + PI, w: e.w, d: e.d, floors: ELV_FLOORS.map(f => ({ ...f, ...ARR })), mat: 0xc9c2b4, doorMat: 0xb7a983 });
  });
  const DIRECTORY = ['층별 안내', ...ELV_FLOORS.slice().reverse().map(f => `${f.label}  ${f.name}`)];

  // ------------------------------------------------------------ stair cores (enclosed, alternating lanes)
  for (const c of CORES) {
    const vA = c.v0 + 2.2, vB = c.v1 - 2.2, uDoor = c.door === 'W' ? c.uL : c.uR, top = coreTop(c), FL = MAIN.slice(0, top + 1);
    for (let s = 0; s < top; s++) {
      const ya = LV[MAIN[s]], yb = LV[MAIN[s + 1]], lane = s % 2, u = c.lanes[lane];
      const [v0, v1] = lane === 0 ? [vA, vB] : [vB, vA];
      const a = P(u, v0), b = P(u, v1);
      K.stairs(a[0], a[1], b[0], b[1], { w: 1.6, ya, yb, mat: { tex: 'darkstone', color: 0xb0aaa2 }, railMat: 0x5c6166 });
    }
    // guards around each floor's stair hole
    for (let s = 1; s <= top; s++) {
      const y = LV[MAIN[s]], lane = (s - 1) % 2, u = c.lanes[lane];
      const farV = lane === 0 ? vA : vB; // arriving flight enters from the far (deep) end
      wall(u - 0.85, farV, u + 0.85, farV, y, y + 1.1, { mat: 0x5c6166, thick: 0.05 });
      const uMid = (c.lanes[0] + c.lanes[1]) / 2;
      wall(uMid, vA, uMid, vB, y, y + 1.1, { mat: 0x5c6166, thick: 0.05 });
    }
    // enclosure: door wall with openings at both landings on every floor, end walls
    // One wall segment per storey keeps the landing openings explicit.
    for (const id of FL) {
      const y = LV[id], y1 = LV[nextOf(id)];
      wall(uDoor, c.v0, uDoor, c.v1, y, y1, { mat: 0xe4dfd6, thick: 0.25, openings: [{ at: 1.1, w: 1.8, y0: y, y1: y + 2.3 }, { at: c.v1 - c.v0 - 1.1, w: 1.8, y0: y, y1: y + 2.3 }] });
    }
    wall(c.uL, c.v0, c.uR, c.v0, LV.B2, LV[nextOf(c.top)], { mat: 0xe4dfd6, thick: 0.25 });
    wall(c.uL, c.v1, c.uR, c.v1, LV.B2, LV[nextOf(c.top)], { mat: 0xe4dfd6, thick: 0.25 });
    for (const id of FL) {
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
    const fb = (s, t, ls, lt, yy, h, mat, oo) => { const [u, v] = ST(s, t); return box(u, v, along ? ls : lt, along ? lt : ls, yy, h, mat, oo); };
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
      fsign(signText, Wf / 2, -0.01, y + Math.min(3.4, H - 0.6) + (H - Math.min(3.4, H - 0.6)) / 2, Math.min(Wf * 0.7, 9), Math.min(0.75, (H - Math.min(3.4, H - 0.6)) * 0.7), { bg: portalDark ? '#1d1c1b' : '#efe9df', fg: portalDark ? '#f1e7d2' : '#1d1d1d', bold: false });
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
    fx({ Wf, Dp, y, H, fb, fsign, fwall, person, r, seed, name: signText, koName: zoneName });
    if (o.zone !== false) K.zone({ name: zoneName, floor: o.floor, sub: o.sub ?? '신세계백화점 강남점', poly: rect(Math.min(u0, u1), Math.min(v0, v1), Math.max(u0, u1), Math.max(v0, v1)), y0: y, y1: y + Math.max(2.6, H), priority: 3 });
  }
  const FIXTURES = {
    fashion({ Wf, Dp, y, fb, person, r, seed }) {
      const n = Math.max(1, Math.min(4, Math.floor((Wf - 1) / 2.4)));
      for (let i = 0; i < n; i++) {
        const s = (i + 0.5) * Wf / n, t = Dp * 0.55;
        fb(s, t, 1.7, 0.06, y + 1.55, 0.05, 0x9a9a9a, { solid: false });
        fb(s, t, 1.5, 0.45, y + 0.55, 1.0, { tex: 'ssg_rack', color: GARMENT[(seed + i) % GARMENT.length] });
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
      if (skip(u, v) || (y >= 0 && u > 23 && u < 44 && v < 12)) continue;
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
    sign(DIRECTORY, 25.6, 63.6, y + 1.55, 'E', 1.8, 2.7, { bg: '#2d241c', fg: '#f3e6c8', bold: false, pxPerM: 130, align: 'left' });
    box(25.3, 63.6, 0.3, 2.0, y, 0.25, 0x2d241c, { solid: false });
    sign([id, '신세계 강남점'], 28.45, 64.66, y + Math.min(2.4, H - 0.6), 'N', 1.5, 0.5, { bg: '#2d241c', fg: '#f3e6c8' });
    sign('엘리베이터', 38.55, 64.66, y + Math.min(2.4, H - 0.6), 'N', 1.5, 0.5, { bg: '#2d241c', fg: '#f3e6c8' });
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
    const S = (o = {}) => ({ floor: fl, H, sub: `${def.cat} · 신세계백화점 강남점 ${fl}${up ? ' (신관)' : ''}`, ...o });
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
    lights(y + H - 0.02, up ? [[0, 0, UW, VS]] : []);
    restrooms(id, y, H); elevatorHall(id, y, H);
    // floor number on the atrium column faces
    if (!up) sign(`${fl}  ${def.short}`, 25.4, 33, y + 3.2, 'N', 2.4, 0.5, { bg: '#2d241c', fg: '#f3e6c8', twoSided: true });
    else sign(`${fl}  ${def.short}`, 25.4, 48.4, y + 3.2, 'S', 2.4, 0.5, { bg: '#2d241c', fg: '#f3e6c8', twoSided: true });
    if (up) windowAisle(id, y, H, def.view);
    crowdAisles(y, def.people ?? 16, LV[id] * 7 + 3, [], V0);
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
    const oct=(u,v,w,d,c=.24)=>[[u-w/2+c,v-d/2],[u+w/2-c,v-d/2],[u+w/2,v-d/2+c],[u+w/2,v+d/2-c],[u+w/2-c,v+d/2],[u-w/2+c,v+d/2],[u-w/2,v+d/2-c],[u-w/2,v-d/2+c]];
    function vitrine(u,v,w=2.4,d=1.2,seed=0,name='') {
      const shape=(ww,dd)=>oct(u,v,ww,dd).map(q=>P(...q));
      K.prism(shape(w,d),y,y+.69,{mat:0x63422a});
      K.prism(shape(w+.12,d+.12),y+.69,y+.79,{mat:'ssg_marble',solid:false});
      K.prism(shape(w-.04,d-.04),y+.8,y+1.13,{mat:'glass',solid:false});
      for(const yy of [.08,.66,1.13])K.prism(shape(w+.02,d+.02),y+yy,y+yy+.025,{mat:BRASS,solid:false,top:false,bottom:false});
      for(const [uu,vv] of oct(u,v,w-.04,d-.04))box(uu,vv,.022,.022,y+.79,.36,BRASS,{solid:false});
      for(let i=0;i<Math.floor(w/.24);i++)for(let j=0;j<2;j++){
        const uu=u-w/2+.2+i*.24,vv=v+(j?1:-1)*d*.22;
        box(uu,vv,.20,.22,y+.80,.025,0xe8dec7,{solid:false});
        box(uu,vv,.16,.17,y+.83,.075,[0xd7a05b,0xe4c58b,0x7e452c,0xf0dec0,0xa4bb76][(i+j+seed)%5],{solid:false});
        if(i%3===0)sign('₩',uu,vv-d*.16,y+.94,'N',.08,.07,{bg:'#fffdf4',fg:'#4a3b2c',bold:false});
      }
      for(let i=0;i<Math.floor(w/.18);i++)box(u-w/2+.15+i*.18,v-d/2-.012,.035,.018,y+.16,.43,0x99754b,{solid:false});
      if(name)sign(name,u,v-d/2-.03,y+.48,'N',Math.min(w-.3,2.8),.22,{bg:null,fg:'#e6d5ad',bold:false});
    }
    function queue(u,v,w=3.6,d=3.5) {
      for(const du of [-w/2,w/2])for(const dv of [-d/2,0,d/2]){cyl(u+du,v+dv,y,.14,.035,0x262322);cyl(u+du,v+dv,y,.025,.91,0x242222);}
      for(const du of [-w/2,w/2])box(u+du,v,.025,d,y+.83,.065,0xcfc4ab,{solid:false});
      box(u,v+d/2,w,.025,y+.83,.065,0xcfc4ab,{solid:false});
    }
    function archStall(u,v,name,w=5) {
      // 13: arched timber transom, dark masonry below, inset sign and full counter.
      box(u,v,w,.35,y,2.75,0x3a332b);
      for(const du of [-w/2,w/2])box(u+du,v,.24,.55,y,3.6,HONEY);
      box(u,v-.2,w,.18,y+2.45,.6,HONEY,{solid:false});
      sign(name,u,v-.31,y+2.76,'N',w*.68,.38,{...serif,bg:'#25302b',fg:'#f5e4b5',font:name==='Standard Bread'?'"Comic Sans MS", cursive':serif.font});
      for(let i=0;i<20;i++){
        const a=PI*i/20,b=PI*(i+1)/20;
        const pp=(ang,r)=>{const [x,z]=P(u+Math.cos(ang)*r,v);return[x,y+3.0+Math.sin(ang)*1.1,z];};
        K.quad(0xb5935a,[pp(a,w/2),pp(b,w/2),pp(b,w/2-.15),pp(a,w/2-.15)],[-SA,0,-CA]);
      }
      box(u,v,w-.3,.12,y+3.02,.08,HONEY,{solid:false});
      for(const du of [-1.7,-.85,0,.85,1.7]){const hh=Math.sqrt(Math.max(0,1-du*du/(w*w/4)))*.95;box(u+du,v,.07,.14,y+3.05,hh,HONEY,{solid:false});}
      vitrine(u,v-1.1,w-.7,1.15,2);
      for(let k=0;k<3;k++)box(u-w/2+.6+k*.5,v-.4,.38,.33,y+1.25,.24,[0xb5b19c,0xd1bba3,0xf2e7cd][k],{solid:false});
      zone(name,fl,'스위트파크',[u-w/2,v-2,u+w/2,v+.4],y,y+4.9,3);
    }
    zone('신세계백화점 강남점',fl,'식품관 · 신세계 마켓 · 스위트파크 · 하우스 오브 신세계',[0,0,UW,VD],y,0,1);
    zone('신세계 마켓',fl,'신선식품 · 그로서리 · 델리',[.25,.25,26.8,31.5],y,y+H,2);
    zone('스위트파크',fl,'체크 대리석 · 디저트 쇼케이스',[8.5,32,26.8,51],y,y+H,2);
    zone('델리 전문관',fl,'식품관 · 델리 카운터',[41.5,10,UW,76.5],y,y+H,2);
    zone('하우스 오브 신세계 푸드홀',fl,'라운지 · 바 · 오픈키친',[6.4,59,26.8,84.45],y,3.2,2);
    zone('하우스 오브 신세계 연결 복도',fl,'우드 게이트 · 대리석 파케',[12.7,51,17.3,60],y,y+3.4,3);
    // Unphotographed fresh-food bays: restrained low fixtures, no invented thematic fitout.
    finish([.3,.3,26.8,31.7],y+.013,'ssg_marble',2.4);
    for(const [u,v,w,name] of [[6,6,7,'청과'],[16,6,7,'그로서리'],[6,17,7,'정육'],[16,17,7,'수산'],[6,27,7,'반찬']]){
      box(u,v,w,1.2,y,.84,0x8b7861);box(u,v,w+.08,1.3,y+.84,.08,0xe7dfd0,{solid:false});sign(name,u,v-.67,y+1.18,'N',1.4,.3,{bg:'#ebe3d2',fg:'#534736',bold:false});
    }
    for(const [u,v] of [[6,6],[16,6]])for(let i=0;i<10;i++)box(u-2.7+i*.56,v,.44,.75,y+.92,.16,[0x9d9e68,0xceb17f,0xc2b9a7,0x785d44][i%4],{solid:false});
    for(const u of [6,14]){box(u,2,2,.7,y,.9,0xc3b6a2);box(u-.5,2,.4,.3,y+.9,.3,0x2c2a28,{solid:false});}
    sign('신세계 마켓',12,1.1,y+2.8,'S',4,.5,{bg:null,fg:'#5e503b',bold:false});
    // Keep the J1 northern vestibule at u35.2..44.1 and the J4 cross aisle v38..47 open.
    for(const [u0,u1,name,kind] of [[24.1,35,'INTELLIGENTSIA COFFEE|인텔리젠시아 커피','cafe'],[44.3,53,'JOHNNY ROCKETS|조니 로켓','rest'],[53,61.4,'오설록','cafe']])shop({u0,u1,v0:.25,v1:8.25,f:'S',name,kind,y,H:3.8,floor:fl,sub:'식품관'});
    sign('신세계 강남점 식품관',39.65,.45,y+3.1,'S',5.2,.6,{bg:'#3c3129',fg:'#f3e6c8'});
    sign('고투몰 · 고속터미널역',43.8,4.3,y+1.55,'W',3.6,.4,{bg:'#e4d7c2',fg:'#544536'});
    sign('← 센트럴시티 · 호남선 터미널',.7,46.4,y+1.55,'E',3.8,.4,{bg:'#e4d7c2',fg:'#544536'});
    // 11–18: two linked halls, checker marble, rib coves, low octagonal pastry counters.
    for(const r of [[8.5,31.7,26.8,51],[41.5,10.5,60,47.5]])finish(r,y+.016,'ssg_checker_gloss');
    for(const u0 of [9,17.5])for(const v0 of [32.5,41.5])vault(u0,v0,u0+8.5,v0+9);
    for(const u0 of [42,50.5])for(const v0 of [12,23,34])vault(u0,v0,u0+8.5,v0+11);
    for(const u of [9,17.5,26])for(const v of [32.5,41.5,50.5])if(!(u===9&&v===41.5))pillar(u,v);
    for(const u of [42,50.5,59])for(const v of [12,23,34,45])pillar(u,v);
    archStall(12,49.5,'Standard Bread',5.5);archStall(21.8,49.5,'SEASONIQUE',5.5);
    vitrine(12.3,36.1,4.7,2.0,1,'한정선');vitrine(22.1,36.1,4.7,2.0,3,'시즈니크');
    vitrine(12.2,44.5,2.4,1.2,4);vitrine(22.2,44.5,2.4,1.2,1);
    queue(12.4,39.4,3.8,3.8);queue(22,39.2,3.6,3.6);
    box(14.65,38.3,.09,.55,y,1.18,0x262322,{solid:false});
    sign(['한정선','대기 안내'],14.65,38.0,y+1.1,'N',.64,.74,{bg:'#65493c',fg:'#e1c7a7',bold:false});
    for(const [u,v] of [[10.8,38],[11.3,39],[12.2,40],[13.1,39.2],[20.8,38.7],[21.4,40.1],[23.1,39],[16,44.1],[19,47.1]]){const [x,z]=P(u,v);K.person(x,y,z,{shirt:0x45433d});}
    // Seasonique's small brass stand and green packaging, not a suspended directory sign.
    for(const du of [-.65,.65])cyl(23+du,46.2,y,.025,1.4,BRASS,false,8);
    box(23,46.2,1.4,.07,y+.96,.57,BRASS,{solid:false});
    sign('SEASONIQUE',23,46.14,y+1.25,'N',1.3,.44,{...serif,bg:'#25282a',fg:'#eee9d9'});
    for(let k=0;k<4;k++)box(25.1,48.5,.65,.5,y+k*.26,.24,0x294f3e,{solid:false});
    for(const v of [17.3,28.3,39.3])for(const u of [43.8,57.2])vitrine(u,v,3.2,1.6,Math.round(v));
    // The 6–8 m central market aisle remains open between the two counter rows.
    for(const u of [46.1,54.9])finish([u,12,u+.22,45],y+.022,'ssg_parquet',1.4);
    for(const [u,v] of [[45.4,17.3],[55.6,28.3],[45.4,39.3],[49,19.4],[52,31.5],[48.2,40.8]]){const [x,z]=P(u,v);K.person(x,y,z,{shirt:u===45.4?0xf1eee5:0x454943});}
    // 19: Blue Butterfly dark canopy, brass inlaid mahogany base and illuminated ornament.
    finish([44,51,53,56.3],y+.016,'ssg_checker_gloss');
    // 19: small wine-red/cream tile band immediately in front of the deli base.
    for(let i=0;i<32;i++)for(let j=0;j<2;j++)hq(44.5+i*.25,52.5+j*.25,44.75+i*.25,52.75+j*.25,y+.024,(i+j)%2?0xe7dfc9:0x783d32);
    box(48.5,54,7.6,1.25,y,.94,0x493027);
    for(let i=0;i<4;i++){
      const u=45.65+i*1.9;box(u,53.35,1.65,.035,y+.13,.66,BRASS,{solid:false});box(u,53.32,1.55,.035,y+.19,.54,0x56372c,{solid:false});
    }
    box(48.5,54,7.8,1.4,y+.94,.08,0x272625,{solid:false});
    box(48.5,54,5.7,1.05,y+1.03,.4,'glass',{solid:false});
    for(const yy of [1.04,1.42])box(48.5,53.46,5.75,.025,y+yy,.025,BRASS,{solid:false});
    for(const u of [45.65,48.5,51.35])box(u,53.46,.025,.025,y+1.03,.41,BRASS,{solid:false});
    for(let i=0;i<18;i++)for(let j=0;j<2;j++){
      const u=45.9+i*.3,v=53.77+j*.42;
      box(u,v,.26,.32,y+1.03,.025,0xb19469,{solid:false});
      box(u,v,.21,.25,y+1.055,.13,[0xe1bb6b,0x87a65d,0xb4783f,0xedd29c][(i+j)%4],{solid:false});
    }
    for(const u of [44.65,52.35])box(u,54,.075,.075,y+1.05,1.9,0x423c30,{solid:false});
    box(48.5,54,8.0,1.8,y+2.72,.42,0x292825,{solid:false});
    sign('Blue Butterfly',48.5,53.08,y+2.93,'N',2.3,.28,{bg:null,fg:'#fff4dc',font:'Georgia, serif',italic:true});
    for(const u of [45,45.45,45.9,51.1,51.55,52]){box(u,53.08,.23,.02,y+2.79,.26,glow,{solid:false});box(u,53.06,.10,.02,y+2.86,.12,0x393731,{solid:false});}
    for(const u of [46.7,50.3]){const [x,z]=P(u,55.2);K.person(x,y,z,{shirt:0xf1eee5});cyl(u,55.2,y+1.63,.14,.13,0xfffdf4);}
    zone('블루 버터플라이',fl,'베트남 델리',[44,51,53,56.3],y,y+H,3);
    // Remaining deli bays have low neutral counters; unseen tenant arrangement is not invented.
    for(const [u,v,name] of [[61.8,38,'새벽종'],[61.8,48,'수퍼판 델리'],[61.8,59,'화돈점정'],[48,70,'와인하우스']]){
      vitrine(u,v,3.5,1.3,1,name);sign(name,u,v-.68,y+1.4,'N',2.6,.3,{bg:'#e6dcc9',fg:'#594631',bold:false});
    }
    // 05/06: 4 m connecting passage with wood borders and marble parquet dot inlays.
    finish([12.7,51,17.3,60],y+.025,'ssg_wood_parquet',1.4);
    finish([13.2,51,16.8,60],y+.03,'ssg_parquet',1.4);
    hq(12.7,51,17.3,60,y+3.35,0xf1ece4,false);
    for(const u of [12.7,17.3])wall(u,51,u,59.7,y,y+3.35,{mat:HONEY,thick:.16});
    for(let v=51.2;v<59.5;v+=.7){
      // Rounded shoulders with a flat crown, like the stepped plaster portals in photo 05.
      const path=[[13,y+.45,v],[13,y+2.65,v],[13.05,y+2.88,v],[13.2,y+3.06,v],[13.4,y+3.18,v],[13.7,y+3.23,v],[16.3,y+3.23,v],[16.6,y+3.18,v],[16.8,y+3.06,v],[16.95,y+2.88,v],[17,y+2.65,v],[17,y+.45,v]];
      for(let i=0;i<path.length-1;i++){
        const a=path[i],b=path[i+1],q=(p,dv)=>{const [x,z]=P(p[0],p[2]+dv);return[x,p[1],z];};
        const du=b[0]-a[0],dy=b[1]-a[1],ll=Math.hypot(du,dy)||1;
        K.quad(0xf5eee4,[q(a,-.10),q(a,.10),q(b,.10),q(b,-.10)],[dy*CA/ll,-du/ll,-dy*SA/ll]);
        // Front/back reveals give each plaster rib visible depth, including its vertical legs.
        const outer=p=>[p[0]-dy/ll*.09,p[1]+du/ll*.09,p[2]];
        for(const side of [-1,1])K.quad(0xe8e0d5,[q(a,side*.10),q(b,side*.10),q(outer(b),side*.10),q(outer(a),side*.10)],[side*SA,0,side*CA]);
      }
    }
    for(const v of [52,55.2,58.2])for(const u of [12.95,17.05]){cyl(u,v,y,.22,.32,HONEY);cyl(u,v,y+.32,.075,2.55,HONEY);globe(u,v,y+2.05,.15);}
    for(let v=51.7;v<59;v+=1.4)downlight(15,v,y+3.21,.045);
    // Reeded glazing on the corridor east side, captured in photo 05.
    for(const v of [52.9,55.9]){
      box(17.19,v,.035,2.2,y+.5,2.2,'glass',{solid:false});
      for(let vv=v-1;vv<v+1;vv+=.09)box(17.16,vv,.025,.014,y+.5,2.2,0xd2c0a0,{solid:false});
      for(const yy of [.45,1.5,2.7])box(17.12,v,.08,2.2,y+yy,.07,HONEY,{solid:false});
    }
    // 04: timber gate, gold serif lettering, paired 30 cm white globes and directory.
    for(const u of [12.4,17.6])box(u,59.5,1.2,.55,y,3.65,HONEY);
    box(15,59.5,6.4,.6,y+2.95,.7,HONEY,{solid:false});
    sign('HOUSE OF SHINSEGAE',15,59.17,y+3.2,'N',5.2,.37,{...serif,fg:'#edd4a0'});
    for(const u of [13,17]){cyl(u,59.12,y,.2,.3,HONEY);cyl(u,59.12,y+.3,.075,2.65,HONEY);globe(u,59.02,y+2.1,.15);}
    box(18.5,59.2,.8,.3,y,.1,0x252525,{solid:false});box(18.5,59.2,.055,.055,y,1.7,0x252525,{solid:false});
    sign(['HOUSE OF','SHINSEGAE','식음 공간 안내'],18.5,59.13,y+1.13,'N',.7,1.25,{...serif,bg:'#f0dfbf',fg:'#604b35'});
    // 01/02/03/10: warm wood lounge and real two-level opening to the wine level.
    finish([6.4,60,26.8,84.4],y+.02,'ssg_wood_parquet',1.4);
    finish([9,61,12,74],y+.025,'ssg_parquet',1.4);
    finish([18.6,61,20.4,74],y+.025,'ssg_parquet',1.4);
    // High amber balcony fascia from the photos; no opaque wall across the void.
    for(const [u0,v0,u1,v1] of [[8.6,60,8.6,74.5],[23.5,60,23.5,74.5],[8.6,60,23.5,60],[8.6,74.5,23.5,74.5]]){
      const len=Math.hypot(u1-u0,v1-v0),nx=-(v1-v0)/len,nv=(u1-u0)/len;
      const landingEdge = v0 === 74.5 && v1 === 74.5;
      const endU = landingEdge ? 20.4 : u1;
      wall(u0,v0,endU,v1,-2.5,0,{mat:HONEY,thick:.12,solid:false});
      wall(u0,v0,endU,v1,0,1.03,{mat:'glass',thick:.035});
      box((u0+endU)/2,(v0+v1)/2,Math.max(.06,Math.abs(endU-u0)),Math.max(.06,Math.abs(v1-v0)),1.03,.055,BRASS,{solid:false});
      for(let i=.6;i<len;i+=1.5){
        const u=u0+(u1-u0)*i/len,v=v0+(v1-v0)*i/len;
        if (landingEdge && u > 20.4) continue;
        for(const sg of [-1,1]){
          const [ax,az]=P(u+nx*.075*sg-(u1-u0)/len*.32,v+nv*.075*sg-(v1-v0)/len*.32),[bx,bz]=P(u+nx*.075*sg+(u1-u0)/len*.32,v+nv*.075*sg+(v1-v0)/len*.32);
          K.quad('ssg_uplight',[[ax,-2.48,az],[bx,-2.48,bz],[bx,-.3,bz],[ax,-.3,az]],[nx*sg*CA+nv*sg*SA,0,-nx*sg*SA+nv*sg*CA]);
        }
        cyl(u,v,-2.49,.07,.04,glow,false,8);
      }
    }
    // Ceiling above the void is the underside of 1M, with a white cove perimeter.
    coffer(8.8,60.2,23.3,74.3,3.18);
    for(const [u,v] of [[10,61.2],[10,72.8],[22.1,61.2],[22.1,72.8]])downlight(u,v,3.12,.065);
    // Mirror-clad pier at the lounge's far end; the seating remains visible from the gate.
    box(8.1,67.2,.6,.6,y,9.15,0xc3b89b,{solid:false});
    for(const u of [7.75,8.45])box(u,67.2,.055,.7,y,9.15,BRASS,{solid:false});
    function armchair(u,v,rot,col) {
      const c=Math.cos(rot),s=Math.sin(rot),pt=(a,b)=>[u+a*c+b*s,v-a*s+b*c];
      cyl(u,v,y,.30,.18,0x7b746a);cyl(u,v,y+.18,.35,.28,col,true,14);
      const arc=[];for(let i=0;i<=12;i++){const a=PI*.08+i*PI*.84/12;arc.push(pt(Math.cos(a)*.37,Math.sin(a)*.37));}
      for(let i=0;i<arc.length-1;i++)wall(...arc[i],...arc[i+1],y+.36,y+.82,{mat:col,thick:.12});
      for(const a of [-.31,.31]){const p=pt(a,.03);cyl(p[0],p[1],y+.43,.085,.17,col,false,8);}
    }
    for(const [u,v] of [[14.1,64.8],[14.1,70.5]]){
      finish([u-1.9,v-2.3,u+1.9,v+2.3],y+.035,'ssg_persian',[3.8,4.6]);
      cyl(u,v,y,.13,.52,BRASS);cyl(u,v,y+.52,.42,.045,'ssg_marble');
      for(const [du,dv,ro,col] of [[-1.15,-.7,-PI/2,0xb8452e],[1.15,-.7,PI/2,0x6e7b3a],[-1.15,1.05,-PI/2,0xb86b35],[1.15,1.05,PI/2,0x777744]])armchair(u+du,v+dv,ro,col);
      const [x,z]=P(u-1.15,v-.7);K.person(x,y,z,{sit:true,shirt:0x324c5d});
    }
    // The two glass escalators climb beside the lounge; the upper landings remain on 1F.
    // Terminate before v74.5 so the slab edge becomes the landing at the flight's end.
    for(const [u,dir] of [[21.15,'up'],[22.7,'down']]){
      const a=P(u,60.8),b=P(u,74.7);K.escalator(a[0],a[1],b[0],b[1],{ya:y,yb:0,w:1.15,dir,speed:.6});
    }
    sign(['HOUSE OF','SHINSEGAE'],20.2,60.7,y+.85,'N',.85,.7,{...serif,bg:'#e8d6b8',fg:'#5f4530'});
    // 03: apothecary cabinet with circular pulls, next to the lounge rather than in its path.
    box(18.4,67.5,1.2,2.8,y,.82,HONEY);
    for(let j=0;j<3;j++)for(let i=0;i<2;i++){
      const v=66.65+j*.85,yy=y+.26+i*.33;
      box(19.015,v,.025,.75,y+.12+i*.33,.28,0xb27431,{solid:false});
      for(let k=0;k<12;k++){
        const a=k*PI/6,b=(k+1)*PI/6;
        const q=(t,r)=>{const [x,z]=P(19.04,v+Math.cos(t)*r);return[x,yy+Math.sin(t)*r,z];};
        K.quad(0x6a471f,[q(a,.082),q(b,.082),q(b,.064),q(a,.064)],[CA,0,-SA]);
      }
      box(19.055,v,.03,.045,yy-.015,.03,BRASS,{solid:false});
    }
    box(18.4,67.5,1.3,2.9,y+.82,.06,'ssg_marble',{solid:false});
    // 07/09: two distinct real bar fronts along the southern perimeter.
    function bar(u,v,w,name,superstar=false) {
      box(u,v+2,w,1,y,2.9,superstar?0x302928:HONEY);
      for(let k=0;k<3;k++){
        box(u,v+1.45,w-.4,.18,y+1.1+k*.47,.035,glow,{solid:false});
        for(let i=0;i<Math.floor(w/.18)-2;i++){const uu=u-w/2+.3+i*.18;cyl(uu,v+1.32,y+1.14+k*.47,.045,.22,[0x365440,0x8e532b,0xb09148,0x452e22][(i+k)%4],false,6);cyl(uu,v+1.32,y+1.36+k*.47,.022,.10,0x493924,false,6);}
      }
      box(u,v,w,1.0,y,.95,superstar?0x943e2d:0x513523);
      box(u,v,w+.15,1.12,y+.95,.08,superstar?0xa95635:'ssg_marble',{solid:false});
      for(const du of [-w/2+.4,w/2-.4]){
        box(u+du,v+1,.8,2,y,.95,superstar?0x943e2d:0x513523);
        box(u+du,v+1,.9,2.12,y+.95,.08,superstar?0xa95635:'ssg_marble',{solid:false});
      }
      for(let i=0;i<Math.floor(w/.75);i++){
        const uu=u-w/2+.45+i*.75;
        cyl(uu,v-1.0,y,.07,.68,superstar?0x292624:0x62412b);cyl(uu,v-1,y+.68,.23,.08,superstar?0x9d4936:0x493026,true,12);
        box(uu,v-.20,.42,.28,y+1.035,.015,0x963c31,{solid:false});
        for(let k=0;k<6;k++){
          const a=PI+k*PI/6,b=PI+(k+1)*PI/6;
          wall(uu+Math.cos(a)*.25,v-1+Math.sin(a)*.25,uu+Math.cos(b)*.25,v-1+Math.sin(b)*.25,y+.82,y+1.12,{mat:superstar?0x9d4936:0x493026,thick:.055,solid:false});
        }
      }
      box(u,v,w+.35,1.45,y+2.6,.32,superstar?0xe9dec8:0xe7dcc3,{solid:false});
      if(!superstar)for(let k=0;k<8;k++)box(u,v-.75,w+.25,.025,y+2.62+k*.038,.014,0x413a2e,{solid:false});
      sign(name,u,v-.79,y+2.82,'N',w*.70,.32,{bg:null,fg:superstar?'#fff6dd':'#332d27',font:superstar?'"Brush Script MT", cursive':'Georgia, serif',italic:superstar,bold:false});
      zone(superstar?'Superstar':'KATSU & TAPAS',fl,'하우스 오브 신세계',[u-w/2,v-1.8,u+w/2,v+2.5],y,y+3.6,3);
      const [x,z]=P(u,v+.9);K.person(x,y,z,{shirt:0xf1eee4});
    }
    bar(11.9,80.5,7.6,'Superstar',true);bar(22,80.5,7.6,'KATSU & TAPAS');
    // 08/10 open kitchen under a low pale coffer, timber seats and metal-framed pelmet.
    box(25.6,66.6,1.1,8.8,y,.95,HONEY);box(25.6,66.6,1.25,9,y+.95,.08,'ssg_marble',{solid:false});
    for(const v of [63,64.5,66,67.5,69,70.5]){cyl(24.5,v,y,.08,.65,0x59412e);cyl(24.5,v,y+.65,.24,.08,0x6c4e32,true);}
    box(25.6,66.6,2.2,9.8,y+2.9,.16,0xe9dec5,{solid:false});
    for(const v of [62,66.5,71]){box(26.4,v,.045,.045,y+.95,2,0x3e382e,{solid:false});globe(25.5,v,y+2.45,.13);}
    for(const v of [63.8,68.5]){
      box(26.4,v,.035,3,y+1.85,.72,'glass',{solid:false});
      for(const yy of [1.85,2.57])box(26.4,v,.05,3,y+yy,.035,0x4e493c,{solid:false});
    }
    // Plain surroundings and circulation remain open around the researched features.
    restrooms(fl,y,H);elevatorHall(fl,y,H);
    for(const r of [[.3,.3,26.8,31.5],[27,9,40,31],[40,47,66.5,84]]){
      for(let u=r[0]+3;u<r[2];u+=5)for(let v=r[1]+3;v<r[3];v+=5)if(!inR(u,v,[27,64,40,73]))downlight(u,v,y+H-.04,.075);
    }
    for(const [u,v] of [[32,12],[39,5],[28,30],[31.8,49],[33.5,61],[39,75],[55,60],[15,55.8],[16,62.1],[18,73.5]]){const [x,z]=P(u,v);K.person(x,y,z,{shirt:0x645b4b});}
  }

  // ================================================================= 1F
  {
    const id = '1F', y = 0, H = clearH('1F'), fl = '1F';
    const S = (cat, o = {}) => ({ floor: fl, H, sub: `${cat} · 신세계백화점 강남점 1F`, ...o });
    zone('신세계백화점 강남점', fl, '화장품 · 해외유명브랜드 · 잡화 (국내 최대 화장품관)', [0, 0, UW, VD], y, LV['2F'], 1);
    // Main entrance has a clear 12 m vestibule axis (the old two invented door locations are closed).
    shop({ u0: 0.25, u1: 14.6, v0: 0.25, v1: 8.25, f: 'S', name: 'HERMÈS|에르메스', kind: 'lux', y, ...S('해외유명브랜드'), H: 6.5, portal: 0xe8dcc8 });
    shop({ u0: 14.6, u1: 22.7, v0: 2.2, v1: 8.25, f: 'S', name: 'CHANEL|샤넬', kind: 'lux', y, ...S('해외유명브랜드'), H: 6.5, portal: 0x1d1c1b });
    shop({ u0: 44.3, u1: 53.4, v0: 2.2, v1: 8.25, f: 'S', name: 'LOUIS VUITTON|루이 비통', kind: 'lux', y, ...S('해외유명브랜드'), H: 6.5, portal: 0x3a2f28 });
    shop({ u0: 53.4, u1: 66.75, v0: 0.25, v1: 9.6, f: 'S', name: 'FENDI|펜디', kind: 'lux', y, ...S('해외유명브랜드'), H: 6.5, portal: 0xd9cbb3 });
    // East retail band; the v30 approach to the parking-side entrance stays clear.
    shop({ u0: 58.75, u1: 66.75, v0: 33.4, v1: 47, f: 'W', name: 'BURBERRY|버버리', kind: 'lux', y, ...S('해외유명브랜드'), H: 6.5, portal: 0xcfb894 });
    shop({ u0: 58.75, u1: 66.75, v0: 47, v1: 60.6, f: 'W', name: 'MAISON MARGIELA|메종 마르지엘라', kind: 'lux', y, ...S('해외유명브랜드'), H: 6.5, portal: 0xefe9df });
    shop({ u0: 58.75, u1: 66.75, v0: 67.4, v1: 76.5, f: 'W', name: 'BAG GALLERY|백 갤러리', kind: 'bag', y, ...S('잡화'), H: 6.5, portal: 0x2a2420 });
    shop({ u0: 58.75, u1: 66.75, v0: 24.2, v1: 26.6, f: 'W', name: '고객 라운지', kind: 'service', y, ...S('서비스'), zone: true });
    // west band: 스타벅스, 조 말론, (J4 passage), 르 라보
    shop({ u0: 0.25, u1: 8.25, v0: 8.25, v1: 22, f: 'E', name: 'STARBUCKS|스타벅스 센트럴시티점', kind: 'cafe', y, ...S('카페'), fascia: 0x00704a, bg: '#00704a', fg: '#fff', H: 4.4 });
    shop({ u0: 0.25, u1: 8.25, v0: 22, v1: 38, f: 'E', name: 'JO MALONE LONDON|조 말론 런던', kind: 'cos', y, ...S('향수'), H: 4.4 });
    shop({ u0: 0.25, u1: 8.25, v0: 47, v1: 61.8, f: 'E', name: 'LE LABO|르 라보', kind: 'cos', y, ...S('향수'), H: 4.4 });
    sign(['← 센트럴시티 중앙광장', '호남선 터미널 · 메가박스'], 0.7, 46.4, 1.55, 'E', 3.8, 0.6, { bg: '#e4d7c2', fg: '#544536' });
    // south band (under the mezzanine): 하우스 오브 신세계 와인 셀라, J5 to JW
    shop({ u0: 5.8, u1: 30.6, v0: 76.5, v1: 84.45, f: 'N', name: 'HOUSE OF SHINSEGAE WINE CELLAR|하우스 오브 신세계 와인 셀라', kind: 'wine', y, ...S('하우스 오브 신세계'), H: 3.2 });
    shop({ u0: 36.8, u1: 51, v0: 76.5, v1: 84.45, f: 'N', name: 'BYREDO|바이레도', kind: 'cos', y, ...S('향수'), H: 3.2 });
    shop({ u0: 51, u1: 66.75, v0: 76.5, v1: 84.45, f: 'N', name: 'DIPTYQUE|딥티크', kind: 'cos', y, ...S('향수'), H: 3.2 });
    sign(['JW 메리어트 호텔 서울 →', '하우스 오브 신세계 연결'], 33.7, 76.3, 2.75, 'N', 3.8, 0.7, { bg: '#2d241c', fg: '#e9dcc0', twoSided: true });
    // cosmetics islands
    const cos = ['DIOR BEAUTY|디올 뷰티', 'ESTĒE LAUDER|에스티 로더', 'LANCÔME|랑콤', '설화수', 'SISLEY|시슬리', 'LA MER|라 메르', 'YSL BEAUTY|입생로랑 뷰티', 'TOM FORD BEAUTY|톰 포드 뷰티',
      'GUERLAIN|겔랑', 'ARMANI BEAUTY|아르마니 뷰티', 'CLÉ DE PEAU BEAUTÉ|끌레드뽀 보떼', 'HERA|헤라', 'M·A·C|맥', 'BOBBI BROWN|바비 브라운', 'CHANEL BEAUTY|샤넬 뷰티', 'NARS|나스', '후', 'KIEHL\'S|키엘', 'CLINIQUE|크리니크', 'SHISEIDO|시세이도', 'AESOP|이솝', 'HOURGLASS|아워글래스'];
    island(cos.slice(0, 4), 12.25, 24.1, 12.25, 31.5, y, S('화장품', { kind: 'cos', H: 6.5 }));
    island(cos.slice(4, 6), 12.25, 24.1, 35, 47, y, S('화장품', { kind: 'cos', H: 6.5 }));
    island(cos.slice(6, 10), 42.9, 54.75, 12.25, 31.5, y, S('화장품', { kind: 'cos', H: 6.5 }));
    island(cos.slice(10, 12), 42.9, 54.75, 35, 47, y, S('화장품', { kind: 'cos', H: 6.5 }));
    // 01/02/10: B1 lounge is visible through this 1F opening; no cosmetics over the void.
    island(cos.slice(16, 20), 42.9, 48.8, 60, 72.5, y, S('화장품', { kind: 'cos', H: 3.2 }));
    shop({ u0: 48.8, u1: 58.4, v0: 64, v1: 72.5, f: 'N', name: 'HOURGLASS|아워글래스', kind: 'cos', y, ...S('화장품'), H: 3.2 });
    // Keep the documented pop-up use, but a small neutral display at the side preserves the approach.
    zone('더 스테이지', fl, '팝업 공간', [27.6, 14, 30.5, 26], y, y + H, 2);
    box(29, 22, 1.8, 3.2, y, 0.65, 0xe7e2d9);
    sign('더 스테이지', 29, 20.2, y + 1.2, 'N', 1.8, 0.3, { bg: null, fg: '#36332e' });
    box(26.3, 10.7, 2.2, 0.85, y, 1.0, 0xe8dcc6);
    sign('안내', 26.3, 10.25, 1.3, 'N', 1.1, 0.3, { bg: '#2d241c', fg: '#f3e6c8' });
    // grand stairs up to the 1M mezzanine
    for (const u of [15.2, 52.2]) { const a = P(u, 50.7), b = P(u, 58); K.stairs(a[0], a[1], b[0], b[1], { w: 3.6, ya: 0, yb: LV['1M'], mat: 'marble', railMat: 0xb9a77f }); }
    sign(['1M 메자닌 ↑', '하우스 오브 신세계 · 버건디& · 퍼퓸'], 15.2, 50.4, 2.9, 'N', 3.4, 0.7, { bg: '#2d241c', fg: '#e9dcc0', twoSided: true });
    sign(['1M 메자닌 ↑', '분더샵 메자닌 · 퍼스널 쇼퍼룸'], 52.2, 50.4, 2.9, 'N', 3.4, 0.7, { bg: '#2d241c', fg: '#e9dcc0', twoSided: true });
    columns(id, y, H, (u, v) => inR(u, v, HOS_VOID, .7));
    lights(y + H - 0.02, [HOS_VOID]);
    for (let u = 9.5; u < 60; u += 5) for (let v = 60.5; v < 84; v += 5) if (!inR(u, v, [27.6, 64.5, 39.4, 72.5], 0.3) && !inR(u, v, HOS_VOID)) downlight(u, v, LV['1M'] - TH['1M'] - 0.02);
    aisleBorders(y);
    coffer(9, 32, 58, 34.6, y + H); coffer(9, 47.4, 58, 50, y + H);
    coffer(31, 12.4, 37, 31.3, y + H);
    restrooms(id, y, 3.2); elevatorHall(id, y, 3.2);
    sign('1F  화장품 · 해외유명브랜드', 25.4, 33, 3.4, 'N', 3.2, 0.5, { bg: '#2d241c', fg: '#f3e6c8', twoSided: true });
    // 20/21: quiet bright stone hall, white-lit bag wall and the observed wall-mounted wordmark.
    box(25.1,29.2,.42,5.1,0,4.5,{tex:'marble',color:0xb4afa5});
    sign(['SHINSEGAE','GANGNAM'],25.34,29.2,3.15,'E',3.5,.85,{bg:null,fg:'#f5f4ff',bold:false});
    box(25.38,29.2,.13,4.8,.25,1.75,0xe5dccd,{solid:false});
    for(let j=0;j<3;j++){
      box(25.48,29.2,.08,4.6,.55+j*.48,.025,{tex:'emit',color:0xfff2d8},{solid:false});
      for(let k=0;k<6;k++){
        const v=27.3+k*.72,yy=.58+j*.48;
        box(25.57,v,.22,.38,yy,.25,[0x302e29,0xb79f77,0xe8ddc8,0x75584a][(j+k)%4],{solid:false});
        box(25.57,v,.08,.18,yy+.25,.09,0x9c8a6b,{solid:false});
      }
    }
    for(const r of [[26,12,40,32],[9,32,26,34.6],[40,32,58,34.6]]){
      hq(...r,4.5,CEIL,false);for(let u=r[0]+1;u<r[2];u+=2.5)for(let v=r[1]+1;v<r[3];v+=2.5)downlight(u,v,4.46,.055);
    }
    zone('하우스 오브 신세계 와인 연결 홀',fl,'푸드홀 라운지 보이드 · 와인셀러',[8,58,27,76.5],0,3.2,2);
    for(const r of [[29,6,38,12],[27,13,39,32],[9,32,23,34.5],[40,32,58,34.5],[31,73,36.5,83],[42,48,48,50]])K.crowd(rect(...r),0,3,{seed:Math.round(r[0]*r[1])});
  }

  // ================================================================= 1M mezzanine (하우스 오브 신세계)
  {
    const y = LV['1M'], H = 6.5 - y, fl = '1M';
    const S = (cat, o = {}) => ({ floor: fl, H, sub: `${cat} · 하우스 오브 신세계 메자닌`, ...o });
    zone('하우스 오브 신세계 메자닌', fl, '1.5층 중층 475평 · 퍼퓸 · 버건디 와인 · 분더샵 메자닌 · 퍼스널 쇼퍼룸', MEZZ, y, LV['2F'], 2);
    shop({ u0: 8, u1: 27, v0: 76.5, v1: 84.45, f: 'N', name: 'BOON THE SHOP MEZZANINE|분더샵 메자닌', kind: 'lux', y, ...S('THE ROW · 가브리엘라 허스트 · 체사레 아톨리니'), portal: 0x2a2420 });
    shop({ u0: 27, u1: 40, v0: 76.5, v1: 84.45, f: 'N', name: 'PERSONAL SHOPPER ROOM|퍼스널 쇼퍼룸', kind: 'lounge', y, ...S('PSR 337㎡') });
    shop({ u0: 40, u1: 60, v0: 76.5, v1: 84.45, f: 'N', name: 'BURGUNDY &|버건디&', kind: 'wine', y, ...S('부르고뉴 와인') });
    island(['ACQUA DI PARMA|아쿠아 디 파르마#cos', 'BULY 1803|불리 1803#cos', 'MAISON FRANCIS KURKDJIAN|메종 프란시스 커정#cos', 'ASTIER DE VILLATTE|아스티에 드 빌라트#home'], 12.25, 24.1, 61, 73, y, S('퍼퓸 · 리빙'));
    island(['POIRAY|뽀아레#jewel', 'SWISS PERFECTION|스위스퍼펙션#cos', '다니엘라 그레지스#lux', '하우스 오브 신세계 라운지#cafe'], 42.9, 54.75, 61, 73, y, S('하우스 오브 신세계'));
    // balcony rail along the north edge (gaps at the two grand stairs) and the open sides
    const railY = y;
    const rail = (u0, v0, u1, v1) => { wall(u0, v0, u1, v1, railY, railY + 1.1, { mat: 'glass', thick: 0.04 }); boxR(Math.min(u0, u1) - 0.03, Math.min(v0, v1) - 0.03, Math.max(u0, u1) + 0.03, Math.max(v0, v1) + 0.03, railY + 1.1, 0.06, 0xb9a77f, { solid: false }); };
    rail(8.1, 58.1, 13.3, 58.1); rail(17.1, 58.1, 50.3, 58.1); rail(54.1, 58.1, 59.9, 58.1);
    rail(8.1, 58.1, 8.1, 84.3); rail(59.9, 58.1, 59.9, 84.3);
    sign('하우스 오브 신세계', 33.5, 58.3, 6.0, 'N', 5, 0.5, { bg: '#e7dcc9', fg: '#493c30', bold: false, twoSided: true });
    aisleBorders(y, true);
    coffer(24.9, 59.1, 42.1, 63.9, 6.5); coffer(9, 73.6, 59, 76.2, 6.5);
    for (const u of [26, 41]) { box(u, 70, 2.2, 0.8, y, 0.45, 0x6a5444); }
    sign(['1M', '하우스 오브 신세계'], 28.45, 64.6, y + 2.0, 'N', 1.5, 0.5, { bg: '#2d241c', fg: '#f3e6c8', twoSided: true });
    K.crowd(rect(25, 59, 42, 64), y, 5, { seed: 77 }); K.crowd(rect(9, 74.6, 59, 76.3), y, 5, { seed: 78 });
  }

  // ================================================================= 2F ~ 10F
  stdFloor('2F', {
    cat: '해외유명브랜드', short: '해외유명브랜드', sub: '해외유명브랜드 · 샤넬 · 에르메스 · 루이 비통 · 디올 · 구찌 · 프라다 · VIP 발레 연결', kind: 'lux',
    N: ['CHANEL|샤넬', 'HERMÈS|에르메스', 'LOUIS VUITTON|루이 비통', 'DIOR|디올'],
    S: ['GUCCI|구찌', 'PRADA|프라다', 'BOTTEGA VENETA|보테가 베네타', 'CELINE|셀린느', 'FENDI|펜디'],
    W: ['SAINT LAURENT|생 로랑', 'BALENCIAGA|발렌시아가', 'LOEWE|로에베', 'VALENTINO|발렌티노', 'MIU MIU|미우미우'],
    E: ['CARTIER|까르띠에#jewel', 'VAN CLEEF & ARPELS|반클리프 아펠#jewel', 'BULGARI|불가리#jewel', 'TIFFANY & CO.|티파니#jewel', 'VIP LOUNGE|VIP 라운지 · 발레 파킹 연결#lounge'],
    IW: [['MONCLER|몽클레르', "TOD'S|토즈"], ['COACH|코치', 'FERRAGAMO|페라가모'], ['LORO PIANA|로로피아나', 'MAX MARA|막스마라']],
    IE: [['CHLOÉ|끌로에', 'GOLDEN GOOSE|골든구스'], ['ROGER VIVIER|로저 비비에', 'JIMMY CHOO|지미추'], ['BURBERRY|버버리', 'MAISON MARGIELA|메종 마르지엘라']],
    C: 'LUXURY POP-UP|럭셔리 팝업', people: 16,
  });
  stdFloor('3F', {
    cat: '인터내셔널 디자이너 · 럭셔리 워치&주얼리', short: '디자이너 · 워치&주얼리', sub: '인터내셔널 디자이너 · 럭셔리 워치&주얼리 · 혼수 전문관', kind: 'lux',
    N: ['AUDEMARS PIGUET|오데마 피게#watch', 'PIAGET|피아제#watch', 'IWC|IWC#watch', 'JAEGER-LECOULTRE|예거 르쿨트르#watch'],
    E: ['PANERAI|파네라이#watch', 'A. LANGE & SÖHNE|랑에 운트 죄네#watch', 'TAG HEUER|태그호이어#watch', 'ZENITH|제니스#watch', 'CHAUMET|쇼메#jewel'],
    S: ['GIVENCHY|지방시', 'ALEXANDER McQUEEN|알렉산더 맥퀸', 'THOM BROWNE|톰 브라운', 'JIL SANDER|질 샌더', 'MARNI|마르니'],
    W: ['ISABEL MARANT|이자벨 마랑#fashion', 'SACAI|사카이#fashion', 'LEMAIRE|르메르#fashion', 'STELLA McCARTNEY|스텔라 매카트니#fashion', 'MSGM|MSGM#fashion'],
    IW: [['BOON THE SHOP|분더샵#fashion', 'ACNE STUDIOS|아크네 스튜디오#fashion'], ['AMI|아미#fashion', 'MAISON KITSUNÉ|메종 키츠네#fashion'], ['TOTEME|토템#fashion', 'GANNI|가니#fashion', 'NANUSHKA|나누슈카#fashion', 'A.P.C.|아페쎄#fashion']],
    IE: [['DAMIANI|다미아니#jewel', 'MESSIKA|메시카#jewel'], ['FRED|프레드#jewel', 'DE BEERS|드비어스#jewel'], ['혼수 전문 라운지#lounge', '워치 수리 · AS 센터#service']],
    C: 'WATCH & JEWELRY FAIR|럭셔리 워치&주얼리 페어', Ckind: 'popup', people: 14,
  });
  stdFloor('4F', {
    cat: '여성 컨템포러리 · 슈즈', short: '여성 컨템포러리 · 그랜드 슈', sub: '여성 컨템포러리 · 그랜드 슈(슈즈 전문관 3,300㎡ 43개 브랜드)', kind: 'fashion',
    N: ['THEORY|띠어리', 'SANDRO|산드로', 'MAJE|마쥬', 'TIME|타임', 'MINE|마인', 'SYSTEM|시스템'],
    W: ['LANVIN COLLECTION|랑방컬렉션', 'CLUB MONACO|클럽모나코', 'S.I SELECT|SI 셀렉트샵', 'MY BOON|마이분', 'BLUEFIT|블루핏'],
    E: ['CHRISTIAN LOUBOUTIN|크리스찬 루부탱#shoe', 'MANOLO BLAHNIK|마놀로 블라닉#shoe', 'GIANVITO ROSSI|지안비토 로시#shoe', 'AQUAZZURA|아쿠아주라#shoe', 'S STYLE|S스타일 디자이너 슈즈#shoe'],
    S: ['리앤한 편집샵#shoe', 'GOLDEN GOOSE|골든구스#shoe', 'RIVIERAS|리비에라스#shoe', 'ORPHIC|오르픽#shoe', 'NIKE|나이키#shoe'],
    IW: [['스타일 컨템포러리', 'TOMBOY|톰보이'], ['ON & ON|온앤온', 'OBZEE|오브제'], ['DEW L|듀엘', 'LÄTT|래트']],
    IE: [['ROGER VIVIER|로저 비비에#shoe', 'TOD\'S|토즈 슈즈#shoe'], ['FERRAGAMO|페라가모 슈즈#shoe', 'STUART WEITZMAN|스튜어트 와이츠먼#shoe'], ['GRAND SHOES|그랜드 슈 편집관#shoe', 'REPETTO|레페토#shoe', 'SALVATORE SHOE CARE|구두 수선실#service', 'UGG|어그#shoe']],
    C: 'GRAND SHOES|그랜드 슈', Ckind: 'shoe', people: 16,
    extra: (y, H) => { zone('그랜드 슈', '4F', '슈즈 전문관 · 약 3,300㎡ · 43개 브랜드 (2016 증축)', [34, 0, UW, VD], y, y + H, 2); sign(['GRAND SHOES', '그랜드 슈'], 48.8, 33.2, y + 3.4, 'N', 5, 0.8, { bg: '#2d241c', fg: '#f3e6c8', twoSided: true }); },
  });
  stdFloor('5F', {
    cat: '여성 클래식 · 영캐주얼 · 핸드백', short: '여성 클래식 · 영캐주얼', sub: '여성 클래식 · 영캐주얼 · 핸드백 · 뉴 스테이지(신진 디자이너 팝업)', kind: 'fashion',
    N: ['ST. JOHN|세인트존', 'ESCADA|에스까다', 'DAKS LADIES|닥스 레이디스', '르베이지', '구호', '손정완'],
    W: ['MATIN KIM|마뗑킴', 'RECTO|렉토', 'OUR LEGACY|아워레가시', 'SIE|시에', 'MARGESHERWOOD|마지셔우드#bag'],
    E: ['쿠론#bag', '메트로시티#bag', '빈치스#bag', '분크#bag', 'LONGCHAMP|롱샴#bag'],
    S: ['앤디앤뎁', 'MOGG|모그', 'KUHO PLUS|구호플러스', 'MICHAA|미샤', 'it MICHAA|잇미샤'],
    IW: [['JILL STUART|질스튜어트', 'MARC JACOBS|마크 제이콥스'], ['CLAUDIE PIERLOT|끌로디 피에로', 'VIVIENNE WESTWOOD|비비안 웨스트우드'], ['수선실 · 고객 서비스#service', '포장 서비스#service']],
    IE: [['COS|코스', 'ARKET|아르켓'], ['PLEATS MAMA|플리츠마마', 'STAND OIL|스탠드오일#bag'], ['OSOI|오소이#bag', 'MARHEN.J|마르헨제이#bag']],
    C: 'NEW STAGE|뉴 스테이지', Ckind: 'popup', people: 16,
  });
  stdFloor('6F', {
    cat: '남성 럭셔리 · 남성 컨템포러리', short: '남성 럭셔리 · 컨템포러리', sub: '국내 최대 남성 럭셔리관(2024.6, 2,100평 42개 브랜드) · 분더샵 맨 · 사르토', kind: 'lux',
    N: ['DIOR MEN|디올 옴므', 'LOUIS VUITTON MEN|루이 비통 맨즈', 'CELINE HOMME|셀린느 옴므', 'LOEWE|로에베'],
    W: ['BERLUTI|벨루티', 'ZEGNA|제냐', 'TOM FORD|톰 포드', 'BRIONI|브리오니', 'KITON|키톤'],
    E: ['BRUNELLO CUCINELLI|브루넬로 쿠치넬리', 'FENDI MEN|펜디 맨즈', 'LARDINI|라르디니', 'PRADA MEN|프라다 맨', 'GUCCI MEN|구찌 맨즈'],
    S: ['BOTTEGA VENETA MEN|보테가 베네타 맨', 'BALENCIAGA MEN|발렌시아가 맨', 'MONCLER MEN|몽클레르 맨', 'THOM BROWNE MEN|톰 브라운 맨', 'HERMÈS MEN|에르메스 맨즈'],
    IW: [['BOON THE SHOP MEN|분더샵 맨#fashion', 'SARTO|사르토#fashion'], ['CLUB MONACO BARBERSHOP|클럽모나코 바버샵#service', 'AMI MEN|아미 맨#fashion'], ['ACNE STUDIOS MEN|아크네 맨#fashion', 'STONE ISLAND|스톤 아일랜드#fashion']],
    IE: [['CANALI|까날리', 'ISAIA|이사이아'], ['ERMENEGILDO ZEGNA SHOES|제냐 슈즈#shoe', 'JOHN LOBB|존 롭#shoe'], ['MEN\'S SALON|멘즈 살롱 라운지#lounge', 'TAILOR SHOP|맞춤 수선실#service']],
    C: "MEN'S POP-UP|남성 럭셔리 팝업", people: 12,
  });
  stdFloor('7F', {
    cat: '골프 · 아웃도어 · 남성 정장 · 남성 캐주얼', short: '골프 · 아웃도어 · 남성', sub: '골프 전문관(약 100개 브랜드, 시타실) · 아웃도어 · 남성 정장 · 남성 캐주얼', kind: 'golf',
    N: ['TITLEIST|타이틀리스트', 'TAYLORMADE|테일러메이드', 'CALLAWAY|캘러웨이', 'PING|핑', 'HONMA|혼마', '스크린 시타실#sim'],
    E: ['PEARLY GATES|파리게이츠', 'MARK & LONA|마크앤로나', 'G/FORE|지포어', 'MALBON GOLF|말본 골프', 'J.LINDEBERG|제이린드버그'],
    W: ['GALAXY|갤럭시#fashion', 'CAMBRIDGE MEMBERS|캠브리지멤버스#fashion', 'DAKS|닥스#fashion', 'MAESTRO|마에스트로#fashion', 'HUGO BOSS|휴고 보스#fashion'],
    S: ['THE NORTH FACE|노스페이스#sport', 'KOLON SPORT|코오롱스포츠#sport', "ARC'TERYX|아크테릭스#sport", 'PATAGONIA|파타고니아#sport', 'SNOW PEAK|스노우피크#sport'],
    IW: [['POLO RALPH LAUREN|폴로 랄프로렌#fashion', 'LACOSTE|라코스테#fashion'], ['TOMMY HILFIGER|타미 힐피거#fashion', 'BEANPOLE|빈폴#fashion'], ['BRICKS|브릭스 남성 캐주얼#fashion', 'TIME HOMME|타임옴므#fashion']],
    IE: [['SOUTHCAPE|사우스케이프', 'CASTELBAJAC|까스텔바작'], ['ADIDAS GOLF|아디다스 골프', 'FOOTJOY|풋조이'], ['골프 피팅 센터#sim', 'WAAC|왁']],
    C: 'GOLF FAIR|골프 대전', Ckind: 'golf', people: 12,
    extra: (y, H) => zone('골프 전문관', '7F', '약 100개 골프 브랜드 · 스크린 시타실 (2016 증축)', [0, 0, UW, 31.5], y, y + H, 2),
  });
  stdFloor('8F', {
    cat: '스포츠 · 진 · 스트리트 캐주얼 · 이벤트홀', short: '스포츠 · 진 · 이벤트홀', sub: '스포츠 · 진 · 스트리트 캐주얼 · 이벤트홀(행사장)', kind: 'sport',
    N: ['NIKE|나이키', 'ADIDAS|아디다스', 'NEW BALANCE|뉴발란스', 'ASICS|아식스', 'HOKA|호카', 'ON|온'],
    W: ["LEVI'S|리바이스#fashion", 'CALVIN KLEIN JEANS|캘빈클라인 진#fashion', 'COVERNAT|커버낫#fashion', 'THISISNEVERTHAT|디스이즈네버댓#fashion', 'MLB#fashion'],
    E: ['LULULEMON|룰루레몬', 'DESCENTE|데상트', 'PUMA|푸마', 'SALOMON|살로몬', 'FILA|휠라'],
    S: ['STUSSY|스투시#fashion', 'CARHARTT WIP|칼하트 WIP#fashion', 'MARITHÉ|마리떼#fashion', 'KIRSH|키르시#fashion', 'NERDY|널디#fashion'],
    IW: [['JORDAN|조던', 'CONVERSE|컨버스'], ['VANS|반스', 'REEBOK|리복'], ['UNDER ARMOUR|언더아머', 'MIZUNO|미즈노']],
    IE: [], people: 18,
    extra: (y, H) => {
      zone('이벤트홀', '8F', '행사장 · 시즌 대전(모피·아웃도어·골프 대전)', [42.9, 12.25, 54.75, 72.5], y, y + H, 2);
      sign('8F 이벤트홀 · 시즌 대전', 48.8, 12.4, y + 3.3, 'N', 5.5, 0.8, { bg: '#7a1c1c', fg: '#fff', twoSided: true });
      for (let i = 0; i < 3; i++) for (let j = 0; j < 8; j++) {
        const u = 45 + i * 3.8, v = 15 + j * 7;
        box(u, v, 1.8, 0.06, y + 1.55, 0.05, 0x9a9a9a, { solid: false });
        box(u, v, 1.6, 0.5, y + 0.55, 1.0, { tex: 'ssg_rack', color: GARMENT[(i * 3 + j) % GARMENT.length] });
        if (j % 2) box(u, v + 3, 1.6, 1.0, y, 0.85, 0xe8e2d8);
      }
      sign('시즌 오프 대전', 48.8, 42, y + 2.9, 'N', 3, 0.8, { bg: '#c01c1c', fg: '#fff', twoSided: true });
      K.crowd(rect(43.5, 13, 54, 72), y, 10, { seed: 808 });
    },
  });
  stdFloor('9F', {
    cat: '신세계홈 · 가구 · 홈패션 · 가전 · 키친웨어', short: '신세계홈', sub: '신세계홈 · 가구 · 홈패션 · 가전 · 키친웨어 (2016 증축 신관 리빙관)', kind: 'home', view: '신세계홈 전망 라운지',
    W: ['CASAMIA|까사미아', 'ACE BED|에이스침대', 'SIMMONS|시몬스', 'TEMPUR|템퍼'],
    E: ['SAMSUNG|삼성전자#elec', 'LG ELECTRONICS|LG전자#elec', 'DYSON|다이슨#elec', 'BANG & OLUFSEN|뱅앤올룹슨#elec', 'MIELE|밀레#elec', 'APPLE|애플#elec'],
    S: ['JAJU|자주', 'WMF#kitchen', 'LE CREUSET|르크루제#kitchen', 'FISSLER|휘슬러#kitchen', 'STAUB|스타우브#kitchen', 'ROYAL COPENHAGEN|로얄코펜하겐#kitchen'],
    IW: [['BOLIA|볼리아', 'HOME FASHION|홈패션 · 침구', 'BEDDING|프리미엄 침구', 'CANDLE & DIFFUSER|캔들 · 디퓨저'], ['VILLEROY & BOCH|빌레로이앤보흐#kitchen', 'DENBY|덴비#kitchen', '광주요#kitchen', 'ALESSI|알레시#kitchen']],
    IE: [['BALMUDA|발뮤다#elec', 'SMEG|스메그#elec', 'IT 체험존#elec', 'DELONGHI|드롱기#elec'], ['COWAY|코웨이#elec', 'LIVING ACC|리빙 소품', 'WEDDING GIFT|혼수 상담 라운지#lounge', 'GIFT WRAPPING|포장 서비스#service']],
    people: 12,
  });
  stdFloor('10F', {
    cat: '리틀 신세계 · 란제리', short: '리틀 신세계 · 란제리', sub: '리틀 신세계(유아동 전문관) · 란제리', kind: 'kid', view: '리틀 신세계 키즈 라운지',
    W: ['WACOAL|와코루#lingerie', 'VIVIEN|비비안#lingerie', 'TRIUMPH|트라이엄프#lingerie', 'SIMONE PÉRÈLE|시몬느 페렐#lingerie', 'CALVIN KLEIN UNDERWEAR|캘빈클라인 언더웨어#lingerie'],
    E: ['BONPOINT|봉쁘앙', 'BURBERRY CHILDREN|버버리 칠드런', 'RALPH LAUREN CHILDREN|랄프로렌 칠드런', 'MONCLER ENFANT|몽클레르 앙팡', 'NIKE KIDS|나이키 키즈', 'LEGO|레고', 'STOKKE|스토케'],
    S: ['수유실 · 유아 휴게실#service', 'CYBEX|싸이벡스', 'BUGABOO|부가부', 'PETIT BATEAU|쁘띠바또', 'FENDI KIDS|펜디 키즈', 'GUCCI CHILDREN|구찌 칠드런'],
    IW: [['BLUEDOG|블루독', 'MIKI HOUSE|미키하우스', 'BEANPOLE KIDS|빈폴 키즈', 'TOMMY KIDS|타미 키즈'], ['ADIDAS KIDS|아디다스 키즈', 'NEW BALANCE KIDS|뉴발란스 키즈', 'PLAY MOBIL|플레이모빌', 'TOY KINGDOM|토이킹덤']],
    IE: [['MOOMOO|무무', 'ILOVEPANDA|아이러브판다', 'DIESEL KIDS|디젤 키즈', 'MLB KIDS|MLB 키즈'], ['LINGERIE LOUNGE|란제리 라운지#lingerie', 'HOMEWEAR|홈웨어#lingerie']],
    people: 18,
    extra: (y, H) => { zone('리틀 신세계', '10F', '유아동 전문관 (2016 증축 신관)', [24.2, VS, UW, VD], y, y + H, 1.5); sign(['LITTLE SHINSEGAE', '리틀 신세계'], 48.8, 48.6, y + 3.3, 'S', 6, 0.8, { bg: '#f0c040', fg: '#2a2a2a', twoSided: true }); },
  });

  // ================================================================= 11F 전문식당가 + S GARDEN (신관 only)
  {
    const id = '11F', y = LV['11F'], H = clearH('11F'), fl = '11F';
    const S = (cat, o = {}) => ({ floor: fl, H, sub: `${cat} · 신세계백화점 강남점 11F 전문식당가`, ...o });
    zone('신세계백화점 강남점', fl, '전문식당가 · S GARDEN · 신관', [0, VS, UW, VD], y, LV.RF, 1);
    band(['덕인관|덕인관 (떡갈비)', '평양면옥|평양면옥 (냉면)', '호경전|호경전 (중식)'], 'W', VS + 0.25, 61.8, 0.25, 9.5, y, S('한식 · 중식', { kind: 'rest', glass: true }));
    band(['THE KITCHEN SALVATORE CUOMO|더키친 살바토레쿠오모', '히바린|히바린', '꼴라쥬|꼴라쥬', 'TAMARIND|타마린드'], 'E', VS + 0.25, 76.5, 57.5, 66.75, y, S('이탈리안 · 일식 · 브런치 · 아시안', { kind: 'rest', glass: true }));
    band(['카페 · 디저트#cafe', '와인 바#wine', '베이커리 카페#cafe', '티 하우스#cafe'], 'S', 5.8, 66.75, 76.5, 84.45, y, S('카페 · 바', { glass: true }));
    // southern islands: more dining (category names; current 2026 tenants unconfirmed)
    island(['한식 다이닝#rest', '일식 다이닝#rest'], 12.25, 24.1, 58, 72.5, y, S('레스토랑', { glass: true }));
    island(['딤섬 · 누들#rest', '아시안 누들#rest'], 42.9, 54.75, 58, 72.5, y, S('레스토랑', { glass: true }));
    // S GARDEN is in the floor guide; its layout is unknown. Use modest neutral seating only.
    zone('S GARDEN', fl, '전문식당가 · 휴게 공간', [12.25, ATR[1], 54.75, 57.5], y, y + H, 2);
    sign(['S GARDEN', '에스 가든'], 33.5, 48.6, y + 2.7, 'S', 3.0, 0.55, { bg: '#48483e', fg: '#eae6da', twoSided: true });
    for (const u of [28, 39]) box(u, 53.5, 2.4, 0.6, y, 0.45, { tex: 'wood', color: 0x8a765e });
    // directory of restaurants at the escalator landing
    sign(['11F 전문식당가', '덕인관 · 평양면옥 · 호경전', '더키친 살바토레쿠오모 · 히바린', '꼴라쥬 · 타마린드'], 26.6, 41, y + 1.6, 'W', 2.2, 1.6, { bg: '#2d241c', fg: '#f3e6c8', bold: false, twoSided: true });
    columns(id, y, H, (u, v) => v < VS);
    lights(y + H - 0.02, [[0, 0, UW, VS]]);
    restrooms(id, y, H); elevatorHall(id, y, H);
    windowAisle(id, y, H, '전망 다이닝 라운지');
    sign('11F  전문식당가', 25.4, 48.4, y + 3.2, 'S', 2.4, 0.5, { bg: '#2d241c', fg: '#f3e6c8', twoSided: true });
    crowdAisles(y, 18, 1111, [], VS);
  }

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
    // The project brief calls for a shop-lined connector. Neutral category windows
    // occupy the side bays; the full J1 eight-metre centre passage remains open.
    const categories = ['잡화', '뷰티', '식품', '카페'];
    for (const side of [-1, 1]) for (let i = 0; i < 4; i++) {
      // Station's 3·9 transfer lift at (-76,-82) opens into this bay.
      if (side < 0 && i === 0) continue;
      const z = -78 + i * 9, frontX = side < 0 ? -74.55 : -65.45;
      const backX = side < 0 ? -78.8 : -61.2, centreX = (frontX + backX) / 2;
      const facing = side < 0 ? PI / 2 : -PI / 2;
      K.wall(frontX, z - 3.5, backX, z - 3.5, y, top, { mat: { tex: 'wood', color: 0xae9373 }, thick: 0.12 });
      K.wall(frontX, z + 3.5, backX, z + 3.5, y, top, { mat: { tex: 'wood', color: 0xae9373 }, thick: 0.12 });
      K.wall(frontX, z - 3.5, frontX, z + 3.5, y, y + 2.6, { mat: 'glass', thick: 0.04, openings: [{ at: 3.5, w: 1.8, y0: y, y1: y + 2.6 }] });
      K.box({ x: frontX, y: y + 2.6, z, w: 0.22, h: 0.7, d: 7, mat: 0x6f5c49, solid: false });
      K.sign(categories[(i + (side > 0 ? 1 : 0)) % 4], { x: frontX - side * 0.13, y: y + 2.92, z, w: 2.2, h: 0.32, rotY: facing, bg: '#e8ddc9', fg: '#46382d', bold: false });
      for (const dz of [-3.4, 3.4]) K.box({ x: frontX, y, z: z + dz, w: 0.18, h: 2.6, d: 0.14, mat: 0x6f5c49 });
      K.box({ x: centreX, y, z, w: 1.3, h: 0.85, d: 2.2, mat: { tex: 'wood', color: 0xb39977 } });
      K.box({ x: centreX, y: y + 0.85, z, w: 1.1, h: 0.12, d: 1.9, mat: 0xe4d9c5, solid: false });
      for (const dz of [-1.4, 1.4]) K.box({ x: backX - side * 0.25, y: y + 0.5, z: z + dz, w: 0.4, h: 1.7, d: 1.8, mat: { tex: 'wood', color: 0x8e755c } });
    }
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
  sp('1F 화장품 · 해외유명브랜드', 26, 33, 0, 0, 1);
  sp('1M 하우스 오브 신세계 메자닌', 33.5, 64, LV['1M'], 0, -1);
  sp('B1 스위트파크 · 한정선', 17, 34.8, LV.B1, 0, 1);
  sp('B1 하우스 오브 신세계 라운지', 16.8, 61.3, LV.B1, -.2, 1);
  sp('B1 하우스 오브 신세계 연결 복도', 15, 52, LV.B1, 0, 1);
  sp('B1 식품관 · 블루 버터플라이', 48.5, 50.5, LV.B1, 0, 1);
  sp('4F 그랜드 슈', 41.2, 41, LV['4F'], 0, 1);
  sp('11F 전문식당가 · S GARDEN', 26, 49.5, LV['11F'], 1, 0);
  K.spawn({ name: 'B1 고투몰 ↔ 신세계 연결통로', x: -70, y: LV.B1, z: -70, yaw: PI });
}
