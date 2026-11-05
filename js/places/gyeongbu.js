// 서울고속버스터미널 (경부·영동선) + 꽃도매상가 + 경부선 주차장 + 다이소 (B1)
// Real OSM footprint 309352819 (L-shape: long bar along 신반포로 + short leg toward 센트럴시티).
// Everything is laid out in a local building frame (u along the long bar, v toward the bus courtyard).
export const meta = {
  id: 'gyeongbu',
  name: '서울고속버스터미널 (경부·영동선)',
  claims: [309352819, 356129682, 356129683, 1173093435],
  claimRoads: [356129685, 356129687, 356129690, 356130053, 356130054, 715692653, 660731157, 1259394249, 1259394250, 1259394251, 1259394252, 356129974, 655403255, 1115924614, 715692651, 1132460905],
  claimAreas: [1173093431, 1173093432, 356129681],
  sources: [
    'https://ko.wikipedia.org/wiki/서울고속버스터미널',
    'https://mediahub.seoul.go.kr/archives/1220355',
    'https://m.seoul.co.kr/news/2013/01/07/20130107500012',
    'https://www.ktriptips.com/kor/shopping/132230',
    'https://www.ktriptips.com/eng/shopping/4031110',
    'https://biz.sbs.co.kr/amp/article/20000274862',
    'https://www.albamon.com/jobs/detail/118221683',
    'https://mediahub.seoul.go.kr/archives/2013620',
    'https://news.seoul.go.kr/traffic/?p=508344',
    'OpenStreetMap: building 309352819, platform nodes ref 010, POIs (파리바게뜨, 백미당, 북창동 순두부, 노브랜드버거, 아트박스, Taco Bell, 다이소 level -1 …)',
  ],
};

export function build(K) {
  const { LEVELS } = K;
  const PI = Math.PI;
  // ---------------------------------------------------------------- local frame
  const O = [2.3, -59.24], A = [0.9348, -0.3552], B = [0.3552, 0.9348];
  const ROT = Math.atan2(0.3552, 0.9348);
  const W = (u, v) => [O[0] + u * A[0] + v * B[0], O[1] + u * A[1] + v * B[1]];
  const toL = (x, z) => [(x - O[0]) * A[0] + (z - O[1]) * A[1], (x - O[0]) * B[0] + (z - O[1]) * B[1]];
  const rect = (u0, v0, u1, v1) => [W(u0, v0), W(u1, v0), W(u1, v1), W(u0, v1)];
  const FACE = { '+v': ROT, '-v': ROT + PI, '+u': ROT + PI / 2, '-u': ROT - PI / 2 };
  const FDIR = { '+v': [0, 1], '-v': [0, -1], '+u': [1, 0], '-u': [-1, 0] };
  const yawL = (du, dv) => { const dx = du * A[0] + dv * B[0], dz = du * A[1] + dv * B[1]; return Math.atan2(-dx, -dz); };
  const rnd = K.rand(4242);
  const pick = (arr) => arr[Math.floor(rnd() * arr.length) % arr.length];

  function lbox(u, v, y, w, d, h, mat, o = {}) {
    const [x, z] = W(u, v);
    return K.box({ x, z, y, w, h, d, rotY: ROT + (o.rot || 0), mat, ...o });
  }
  // box from a local rect
  function rbox(u0, v0, u1, v1, y, h, mat, o = {}) { return lbox((u0 + u1) / 2, (v0 + v1) / 2, y, Math.abs(u1 - u0), Math.abs(v1 - v0), h, mat, o); }
  function lsign(text, u, v, y, w, h, face, o = {}) { const [x, z] = W(u, v); const ppm = o.pxPerM ?? Math.min(96, 1020 / w, 500 / h); K.sign(text, { x, y, z, w, h, rotY: FACE[face], ...o, pxPerM: ppm }); }
  function lwall(u0, v0, u1, v1, y0, y1, o = {}) { const a = W(u0, v0), b = W(u1, v1); K.wall(a[0], a[1], b[0], b[1], y0, y1, o); }
  function lesc(u0, v0, u1, v1, o) { const a = W(u0, v0), b = W(u1, v1); K.escalator(a[0], a[1], b[0], b[1], o); }
  function lstairs(u0, v0, u1, v1, o) { const a = W(u0, v0), b = W(u1, v1); K.stairs(a[0], a[1], b[0], b[1], o); }
  function lramp(u0, v0, u1, v1, o) { const a = W(u0, v0), b = W(u1, v1); K.ramp(a[0], a[1], b[0], b[1], o); }
  function lzone(name, floor, sub, u0, v0, u1, v1, y0, y1, priority = 1) { K.zone({ name, floor, sub, poly: rect(u0, v0, u1, v1), y0, y1, priority }); }
  function lquadH(u0, v0, u1, v1, y, mat) { const p = rect(u0, v0, u1, v1).map(([x, z]) => [x, y, z]); K.quad(mat, p, [0, 1, 0]); }
  function lfloorText(t, u, v, y, w, h, face, o = {}) { const [x, z] = W(u, v); K.floorText(t, { x, y, z, w, h, rotY: FACE[face] + PI, pxPerM: 36, bg: '#2a2a2a', ...o }); }
  function lperson(u, v, y, o = {}) { const [x, z] = W(u, v); K.person(x, y, z, o); }
  function lcrowd(u0, v0, u1, v1, y, n, seed) { K.crowd(rect(u0, v0, u1, v1), y, n, { seed }); }
  function lcar(u, v, y, rot, kind = 'car', o = {}) { const [x, z] = W(u, v); K.vehicle({ x, y, z, rotY: rot, kind, ...o }); }
  function lcyl(u, v, y, r, h, mat, o = {}) { const [x, z] = W(u, v); K.cyl({ x, y, z, r, h, mat, ...o }); }
  function lelev(name, u, v, face, floors, o = {}) { const [x, z] = W(u, v); K.elevator({ name, x, z, rotY: FACE[face], w: 2.2, d: 2.2, floors, ...o }); }
  function lspawn(name, u, v, y, du, dv) { const [x, z] = W(u, v); K.spawn({ name, x, y, z, yaw: yawL(du, dv) }); }
  const westU = (v) => -0.7 * v / 156.6; // west face line (u) at v
  const inR = (r, u, v, m = 0) => u > r[0] - m && u < r[2] + m && v > r[1] - m && v < r[3] + m;
  const overl = (a, b, m = 0) => a[0] < b[2] + m && a[2] > b[0] - m && a[1] < b[3] + m && a[3] > b[1] - m;

  // ---------------------------------------------------------------- textures
  K.texture('gb_office', 128, 128, (g, w, h) => {
    g.fillStyle = '#d5cdbd'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#c4bcab'; g.fillRect(0, 0, w, 4);
    g.fillStyle = '#3f4c58'; g.fillRect(0, h * 0.2, w, h * 0.44);
    g.fillStyle = 'rgba(190,215,235,0.22)'; g.fillRect(0, h * 0.2, w, h * 0.12);
    g.fillStyle = '#b9b1a1'; for (const x of [0, w / 3, 2 * w / 3]) g.fillRect(x, h * 0.2, 4, h * 0.44);
    g.fillStyle = '#9e978a'; g.fillRect(0, h * 0.64, w, 4);
  }, [4.5, 4.5], { facade: true });
  K.texture('gb_deck', 128, 128, (g, w, h) => {
    g.fillStyle = '#cdc6b7'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#2a2e33'; g.fillRect(0, h * 0.14, w, h * 0.42);
    g.fillStyle = '#8f8b84'; for (let i = 0; i < 5; i++) g.fillRect(0, h * 0.17 + i * h * 0.08, w, 3);
    g.fillStyle = '#b5ad9d'; g.fillRect(0, h * 0.14, 5, h * 0.42);
    g.fillStyle = '#a49d90'; g.fillRect(0, h * 0.56, w, 3);
  }, [6, 5], { facade: true });
  K.texture('gb_market', 128, 128, (g, w, h) => {
    g.fillStyle = '#d2cbbb'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#4b5a63'; g.fillRect(0, h * 0.24, w, h * 0.34);
    g.fillStyle = 'rgba(255,240,200,0.18)'; g.fillRect(0, h * 0.24, w, h * 0.34);
    g.fillStyle = '#bab2a2'; for (const x of [0, w / 4, w / 2, 3 * w / 4]) g.fillRect(x, h * 0.24, 4, h * 0.34);
    g.fillStyle = '#9e978a'; g.fillRect(0, h * 0.58, w, 3);
  }, [6, 5], { facade: true });
  K.texture('gb_chapel', 128, 128, (g, w, h) => {
    g.fillStyle = '#e4ddcf'; g.fillRect(0, 0, w, h);
    const cols = ['#b8333a', '#2f5fa8', '#e2b23a', '#3d8a52', '#7a4aa0'];
    const x0 = w * 0.32, ww = w * 0.36;
    for (let i = 0; i < 10; i++) for (let j = 0; j < 3; j++) { g.fillStyle = cols[(i * 3 + j) % 5]; g.fillRect(x0 + j * ww / 3, h * 0.12 + i * h * 0.07, ww / 3 - 2, h * 0.07 - 2); }
    g.fillStyle = '#e4ddcf'; g.beginPath(); g.moveTo(x0, h * 0.12); g.lineTo(x0 + ww / 2, h * 0.02); g.lineTo(x0 + ww, h * 0.12); g.fill();
  }, [5, 5], { facade: true });
  K.texture('gb_shelf', 128, 128, (g, w, h) => {
    g.fillStyle = '#f2f0ea'; g.fillRect(0, 0, w, h);
    const cols = ['#e04545', '#3d7fd6', '#f2c53d', '#4cb06c', '#f08a3c', '#9b59b6', '#ffffff', '#2fb5b5', '#f78fb3', '#7f8c8d'];
    let k = 0;
    for (let r = 0; r < 5; r++) {
      const y0 = r * h / 5; g.fillStyle = '#cfcac0'; g.fillRect(0, y0 + h / 5 - 4, w, 4);
      let x = 0; while (x < w) { const bw = 6 + ((k * 7) % 11); g.fillStyle = cols[(k * 3 + r) % cols.length]; g.fillRect(x + 1, y0 + 4 + (k % 3) * 2, bw - 2, h / 5 - 10 - (k % 3) * 2); x += bw; k++; }
    }
  }, [1.6, 1.9]);
  // flower bunches: a 4 x 2 grid of single-colour bunches (each ~30 cm) wrapped in newspaper/kraft,
  // big soft blobs instead of per-pixel dots (the old 1 cm dots aliased into moire at distance).
  K.texture('gb_flowerbin', 256, 128, (g, w, h) => {
    const cols = ['#d8263f', '#f4b6c6', '#f7f3ea', '#f2c81c', '#f07a22', '#9b4fc4', '#ee5a96', '#f3dc9c', '#b5174f', '#f9d9e3', '#e8433a', '#c8a2e6'];
    g.fillStyle = '#2f4f2a'; g.fillRect(0, 0, w, h);
    const cw = w / 4, ch = h / 2;
    let k = 0;
    for (let j = 0; j < 2; j++) for (let i = 0; i < 4; i++, k++) {
      const x0 = i * cw, y0 = j * ch, cx = x0 + cw / 2, cy = y0 + ch / 2;
      // wrap (newspaper / kraft paper cone) visible at the bunch edges
      g.fillStyle = k % 3 === 0 ? '#cfc8b4' : k % 3 === 1 ? '#a98455' : '#dcd7cb';
      g.beginPath(); g.moveTo(cx - cw * 0.46, cy + ch * 0.1); g.lineTo(cx + cw * 0.46, cy + ch * 0.1); g.lineTo(cx + cw * 0.12, cy + ch * 0.5); g.lineTo(cx - cw * 0.12, cy + ch * 0.5); g.fill();
      // leaves
      g.fillStyle = '#4f7d3c';
      g.beginPath(); g.ellipse(cx, cy - 1, cw * 0.46, ch * 0.42, 0, 0, 6.283); g.fill();
      // blossoms: one colour per bunch, densely packed heads with a soft darker centre
      const c = cols[(k * 5 + j) % cols.length];
      for (let n = 0; n < 15; n++) {
        const a = n * 2.39996, rr = 2 + Math.sqrt(n) * 6.2;
        const bx = cx + Math.cos(a) * rr * 1.05, by = cy - 2 + Math.sin(a) * rr * 0.72;
        g.fillStyle = c; g.beginPath(); g.arc(bx, by, 6.8, 0, 6.283); g.fill();
        g.fillStyle = 'rgba(0,0,0,0.13)'; g.beginPath(); g.arc(bx + 1, by + 1, 2.6, 0, 6.283); g.fill();
      }
    }
  }, [1.3, 0.65]);
  // CCTV / control-room video wall
  K.texture('gb_cctv', 256, 128, (g, w, h) => {
    g.fillStyle = '#111418'; g.fillRect(0, 0, w, h);
    const tints = ['#34495e', '#4a5a48', '#5c5348', '#3d4f63', '#56606a', '#4b4237'];
    for (let j = 0; j < 4; j++) for (let i = 0; i < 8; i++) {
      const x = i * w / 8 + 2, y = j * h / 4 + 2, ww = w / 8 - 4, hh = h / 4 - 4;
      g.fillStyle = tints[(i * 3 + j) % tints.length]; g.fillRect(x, y, ww, hh);
      g.fillStyle = 'rgba(220,230,240,0.35)'; g.fillRect(x + 3, y + hh * 0.55, ww * 0.6, 3); g.fillRect(x + ww * 0.5, y + 4, 4, hh * 0.5);
      g.fillStyle = '#e8f0ff'; g.fillRect(x + 2, y + 2, 10, 3);
    }
  }, [8, 2.5]);
  // archive boxes on metal racks
  K.texture('gb_boxes', 128, 128, (g, w, h) => {
    g.fillStyle = '#3d4249'; g.fillRect(0, 0, w, h);
    for (let r = 0; r < 4; r++) {
      const y0 = r * h / 4; g.fillStyle = '#8b939c'; g.fillRect(0, y0 + h / 4 - 5, w, 5);
      let x = 2, k = r;
      while (x < w - 6) { const bw = 14 + (k * 5) % 9; g.fillStyle = ['#c9a675', '#b8925e', '#d8c39a', '#e9e3d5', '#a9845a'][k % 5]; g.fillRect(x, y0 + 6 + (k % 2) * 3, bw - 2, h / 4 - 13 - (k % 2) * 3); g.fillStyle = 'rgba(255,255,255,0.55)'; g.fillRect(x + 3, y0 + 12, bw - 8, 4); x += bw; k++; }
    }
  }, [2.0, 2.2]);
  K.texture('gb_rolls', 128, 128, (g, w, h) => {
    g.fillStyle = '#f4efe6'; g.fillRect(0, 0, w, h);
    const cols = ['#d63031', '#fdcb6e', '#e84393', '#00b894', '#0984e3', '#ffffff', '#a29bfe', '#fab1a0', '#b2bec3', '#6c5ce7'];
    for (let r = 0; r < 4; r++) for (let i = 0; i < 9; i++) { g.fillStyle = cols[(i + r * 3) % cols.length]; g.fillRect(i * w / 9 + 1, r * h / 4 + 3, w / 9 - 2, h / 4 - 8); }
  }, [1.6, 1.9]);

  // ---------------------------------------------------------------- floors
  const FL = [
    { k: '1F', y: 0, h: 6 }, { k: '2F', y: 6, h: 5 }, { k: '3F', y: 11, h: 5 },
    { k: '4F', y: 16, h: 4.5 }, { k: '5F', y: 20.5, h: 4.5 }, { k: '6F', y: 25, h: 4.5 }, { k: '7F', y: 29.5, h: 4.5 },
    { k: '8F', y: 34, h: 4.5 }, { k: '9F', y: 38.5, h: 4.5 }, { k: '10F', y: 43, h: 5 },
  ];
  const Y = Object.fromEntries(FL.map(f => [f.k, f.y])); Y.B1 = LEVELS.B1;
  const ROOF = 43, PENT = 48;
  const FNAME = {
    B1: '지하상가 연결 · 다이소', '1F': '매표소 · 대합실 · 승차홈', '2F': '경부선 주차장 (옛 승차장)', '3F': '꽃도매상가 (생화·조화·부자재)',
    '4F': '터미널 운영·관리 사무실 (추정)', '5F': '신세계백화점 본사', '6F': '운수사 사무실 · 승무원 휴게실 (추정)', '7F': '창고 · 문서고 (추정)',
    '8F': '임대 사무실 · 공실 (추정)', '9F': '구내식당 · 기계실 (추정)', '10F': '고속터미널성당 · 옥상정원',
  };
  // per-floor accent colour (column bands, lobby wall, corridor stripe)
  // column cladding with the floor number painted on a coloured band (visible from anywhere on the floor)
  function colTex(k, h, base = '#e6e1d6') {
    const key = 'gb_col' + k;
    K.texture(key, 96, 256, (g, w, hh) => {
      const Ym = (m) => (1 - m / h) * hh;
      g.fillStyle = base; g.fillRect(0, 0, w, hh);
      g.fillStyle = '#6f6a62'; g.fillRect(0, Ym(0.12), w, hh - Ym(0.12));
      g.fillStyle = FCOL[k]; g.fillRect(0, Ym(2.35), w, Ym(1.45) - Ym(2.35));
      g.fillStyle = 'rgba(255,255,255,0.85)'; g.fillRect(0, Ym(2.35), w, 3); g.fillRect(0, Ym(1.45) - 3, w, 3);
      g.fillStyle = '#ffffff'; g.font = `bold ${k.length > 2 ? 34 : 44}px sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle';
      // box side faces run their u axis right-to-left as seen from outside, so draw the number mirrored
      g.save(); g.translate(w, 0); g.scale(-1, 1); g.fillText(k, w / 2, (Ym(2.35) + Ym(1.45)) / 2 + 2); g.restore();
    }, [0.8, h]);
    return { tex: key };
  }
  const FCOL = { B1: '#5b6770', '1F': '#14366e', '2F': '#1b4f9c', '3F': '#2f7d3a', '4F': '#1d5f8a', '5F': '#222222', '6F': '#b5582a', '7F': '#6b6f3a', '8F': '#7a4b8c', '9F': '#a3343c', '10F': '#7a1a1a' };

  const bld = K.osmBuilding(309352819)[0];
  const POLY = bld ? bld.poly : rect(0, 0, 316, 30);
  const P10 = [0.6, 0.6, 74.6, 62]; // 10F penthouse (성당) local rect
  // the two wings of the L (exact slab outline split at u = 75.7), used for per-wing floor zones
  const WING_N = [W(75.7, 0), W(316.7, 0), W(316.7, 30.3), W(199.1, 30.2), W(147, 29.9), W(97.7, 30.1), W(97.3, 23), W(75.7, 22.6)];
  const WING_W = [W(0, 0), W(75.7, 0), W(75.7, 22.6), W(75.7, 154.4), W(45.7, 161.3), W(31.6, 161.2), W(-0.7, 156.6)];
  // floor zones: one per wing (never the bounding box) so open-air points in the bus yard stay outside
  function floorZones(k, y0, y1, nameN, nameW, subN, subW) {
    K.zone({ name: nameN, floor: k, sub: subN, poly: WING_N, y0, y1, priority: 1 });
    K.zone({ name: nameW, floor: k, sub: subW ?? subN, poly: WING_W, y0, y1, priority: 1 });
  }

  // ---------------------------------------------------------------- vertical elements (local rects)
  // elevators: car center + range
  const EL = [
    { id: 'EL1', name: '중앙 엘리베이터 1호기', u: 44.6, v: 9, face: '+v', from: 'B1', to: '10F' },
    { id: 'EL2', name: '중앙 엘리베이터 2호기', u: 47.4, v: 9, face: '+v', from: 'B1', to: '10F' },
    { id: 'EL3', name: '남측 엘리베이터 (센트럴시티 쪽)', u: 61.5, v: 140, face: '-v', from: '1F', to: 'R' },
    { id: 'EL4', name: '동측 엘리베이터 (제3매표소 쪽)', u: 278, v: 4.2, face: '+v', from: 'B1', to: 'R' },
    { id: 'EL5', name: '꽃시장 화물 엘리베이터', u: 126, v: 4.2, face: '+v', from: '1F', to: '3F', w: 3 },
  ];
  const elHole = (e) => { const hw = (e.w || 2.2) / 2; return [e.u - hw, e.v - 1.1, e.u + hw, e.v + 1.1]; };
  // stair cores: u0..u0+4 x v0..v1 (9 m), door side 'v1' or 'v0'
  const CORES = [
    { id: 'S1', u0: 37.4, v0: 1, v1: 10, door: +1, ys: ['B1', '1F', '2F', '3F', '4F', '5F', '6F', '7F', '8F', '9F', '10F'] },
    { id: 'S2', u0: 52, v0: 126, v1: 135, door: -1, ys: ['1F', '2F', '3F', '4F', '5F', '6F', '7F', '8F', '9F', 'R'] },
    { id: 'S3', u0: 270, v0: 1, v1: 10, door: +1, ys: ['B1', '1F', '2F', '3F', '4F', '5F', '6F', '7F', '8F', '9F', 'R'] },
    { id: 'S4', u0: 150.5, v0: 1, v1: 10, door: +1, ys: ['1F', '2F', '3F', '4F', '5F', '6F', '7F', '8F', '9F', 'R'] },
  ];
  const yOf = (k) => k === 'R' ? ROOF : Y[k];
  const coreHole = (c) => c.door > 0 ? [c.u0, c.v0, c.u0 + 4, c.v1 - 1.5] : [c.u0, c.v0 + 1.5, c.u0 + 4, c.v1];
  // escalator voids: hole rect in slab at y = top
  const ESC = [
    { id: 'EB1a', r: [58.2, 3.5, 64.6, 14.5], ya: Y.B1, yb: 0, axis: 'v', us: [59.0, 60.6], stairsU: 63.1 },
    { id: 'EB1b', r: [104.2, 3.5, 110.6, 14.5], ya: Y.B1, yb: 0, axis: 'v', us: [105.0, 106.6], stairsU: 109.1 },
    { id: 'EB1d', r: [222.2, 3.5, 228.6, 14.5], ya: Y.B1, yb: 0, axis: 'v', us: [223.0, 224.6], stairsU: 227.1 },
    { id: 'E12', r: [19.2, 58.3, 23.6, 68.7], ya: 0, yb: 6, axis: 'v', us: [20.6, 22.2] },
    { id: 'E23', r: [19.2, 70.2, 23.6, 78.9], ya: 6, yb: 11, axis: 'v', us: [20.6, 22.2] },
    { id: 'E12b', r: [56.2, 104.3, 60.6, 114.7], ya: 0, yb: 6, axis: 'v', us: [57.6, 59.2] },
    { id: 'E23b', r: [56.2, 116.2, 60.6, 124.9], ya: 6, yb: 11, axis: 'v', us: [57.6, 59.2] },
  ];
  const CAR_RAMP = { r: [226, 2.2, 268, 8.8], ya: 6, yb: 11 }; // 2F -> 3F parking ramp (long bar east)

  function holesAt(y) {
    const hs = [];
    for (const e of EL) {
      const ys = elevFloors(e).map(f => f.y);
      if (y >= Math.min(...ys) - 0.01 && y <= Math.max(...ys) + 0.01) hs.push(elHole(e));
    }
    for (const c of CORES) { const ys = c.ys.map(yOf); if (y > ys[0] + 0.01 && y <= ys[ys.length - 1] + 0.01) hs.push(coreHole(c)); }
    for (const e of ESC) if (Math.abs(e.yb - y) < 0.01) hs.push(e.r);
    if (Math.abs(y - CAR_RAMP.yb) < 0.01) hs.push(CAR_RAMP.r);
    return hs;
  }
  function elevFloors(e) {
    const order = ['B1', '1F', '2F', '3F', '4F', '5F', '6F', '7F', '8F', '9F', '10F'];
    const i0 = order.indexOf(e.from); const top = e.to === 'R' ? '9F' : e.to; const i1 = order.indexOf(top);
    const fl = order.slice(i0, i1 + 1).map(k => ({ label: k, y: Y[k], name: FNAME[k] }));
    if (e.to === 'R') fl.push({ label: 'R', y: ROOF, name: e.id === 'EL3' ? '옥상정원' : '옥상' });
    return fl;
  }
  const hp = (r) => rect(r[0], r[1], r[2], r[3]);

  // ---------------------------------------------------------------- slabs per floor
  const floorMat = {
    '1F': { tex: 'marble', color: 0xe4ddd0 }, '2F': { tex: 'parking', color: 0xb8b6b0 }, '3F': { tex: 'concrete', color: 0xc9c2b4 },
    '4F': { tex: 'carpet', color: 0x7f93a8 }, '5F': { tex: 'carpet', color: 0x5f6670 }, '6F': { tex: 'carpet', color: 0xa08a78 }, '7F': { tex: 'concrete', color: 0xb5b1a8 },
    '8F': { tex: 'carpet', color: 0x938aa0 }, '9F': { tex: 'tile', color: 0xc9cec8 },
  };
  for (const f of FL) {
    if (f.k === '10F') continue;
    K.slab(POLY, f.y, { mat: floorMat[f.k], under: f.y === 0 ? { tex: 'concrete', color: 0xd8d4cc } : 'ceiling', thick: f.y === 0 ? 0.3 : 0.35, holes: holesAt(f.y).map(hp) });
  }
  // roof at 43: gravel outside the penthouse, and 10F floor inside it
  {
    const hs = holesAt(ROOF);
    const inP = hs.filter(r => overl(r, P10)), outP = hs.filter(r => !overl(r, P10));
    K.slab(POLY, ROOF, { mat: { tex: 'roofgravel', color: 0xbdb8ae }, under: 'ceiling', thick: 0.4, holes: [hp(P10), ...outP.map(hp)] });
    K.slab(hp(P10), ROOF, { mat: { tex: 'wood', color: 0xb08a62 }, under: 'ceiling', thick: 0.4, edge: false, holes: inP.map(hp) });
    K.slab(hp(P10), PENT, { mat: { tex: 'roofgravel', color: 0xb5b0a6 }, under: 'ceiling', thick: 0.4 });
  }
  // ground holes over every 1F opening that leads down to B1
  for (const r of holesAt(0)) K.groundHole(hp(r));

  // ---------------------------------------------------------------- envelope
  const beige = 0xd5cdbd, beigeD = 0xb9b09f, innerW = 0xece7dd;
  const glass = { tex: 'glass', color: 0x7f9cae };
  // gates (승차홈) from OSM platform nodes
  const plat = K.osm.pois.filter(p => p.kind === 'platform' && p.ref === '010').map(p => toL(p.x, p.z));
  const westG = plat.filter(p => p[0] < 80).sort((a, b) => b[1] - a[1]);
  const longG = plat.filter(p => p[0] >= 80).sort((a, b) => a[0] - b[0]);
  const gates = []; // {n|null, label, u, v, side:'w'|'n', kind:'board'|'arrive'}
  westG.forEach((p, i) => gates.push({ n: i + 1, u: 75.2, v: p[1], side: 'w', kind: 'board' }));
  {
    const nW = westG.length, nArr = 8;
    longG.forEach((p, i) => {
      if (i < nArr) gates.push({ n: null, u: p[0], v: 30.2, side: 'n', kind: 'arrive' });
      else if (i < nArr + 7) gates.push({ n: 37 + (i - nArr), u: p[0], v: 30.2, side: 'n', kind: 'board' });
      else { const k = i - nArr - 7; gates.push({ n: 36 - k, u: p[0], v: 30.2, side: 'n', kind: 'board' }); }
    });
    void nW;
  }
  const DEST = {
    1: '부산·부산사상', 3: '마산', 4: '창원', 5: '진주', 6: '울산·통영·김해', 7: '동대구', 9: '포항·경주·영천', 10: '경산·구미·상주',
    11: '대전·대전청사', 13: '세종시·세종청사', 14: '천안', 16: '공주·아산', 18: '조치원·금산', 19: '속초·양양', 20: '삼척·동해',
    23: '강릉·경포해변', 24: '제천·정선', 25: '원주·문막·혁신도시', 27: '용인', 28: '이천', 29: '여주·프리미엄아울렛', 30: '영월·춘천·철원·부여',
    31: '안동·영덕·영주·태백', 32: '안성', 33: '평택', 34: '청주 (중앙고속)', 35: '청주 (속리산 일반)', 36: '청주 (속리산 우등·프리미엄)',
  };
  const RESERVE = new Set([17, 21, 22, 26, 37, 38, 39, 40, 41, 42, 43]);
  const destOf = (n) => n == null ? '하차장' : RESERVE.has(n) ? '예비' : (DEST[n] || '');

  // 1F: glass storefront 0..4.4 with door openings; beige band above
  const doors1F = [];
  const addDoor = (u, v, w, y1 = 3.0) => { const [x, z] = W(u, v); doors1F.push({ x, z, w, y0: 0, y1 }); };
  // west face (u≈0): 신세계·메리어트 쪽 entrances
  for (const v of [14, 48, 105, 153.5]) addDoor(0, v, 4.5);
  // north face (v=0): 신반포로
  for (const u of [26, 122, 148, 218, 259]) addDoor(u, 0, u === 26 ? 7 : 4.2);
  // south end (toward 센트럴시티·파미에)
  addDoor(38.6, 161, 6); addDoor(64, 156.5, 4);
  // east end
  addDoor(316.7, 18, 4.5);
  // inner faces: one door per gate + wide 하차장 exits
  for (const g of gates) { if (g.side === 'w') addDoor(75.4, g.v + 1.2, 2.4); else addDoor(g.u + 1.2, 30.2, g.kind === 'arrive' ? 4.4 : 2.4); }
  addDoor(86, 22.8, 6); // corner (notch) exit to 하차장·택시
  K.polyWalls(POLY, 0, 4.4, { mat: glass, inner: glass, thick: 0.12, openings: doors1F });
  // 1F storefront detailing on every face: stone pilasters on the 9 m structural grid, dark aluminium
  // mullions every 1.5 m, transom + head rail, granite kick plate. Nothing is placed across a door opening.
  {
    const ns = K.orient(POLY);
    for (let i = 0; i < POLY.length; i++) {
      const a = POLY[i], b = POLY[(i + 1) % POLY.length], L = Math.hypot(b[0] - a[0], b[1] - a[1]);
      if (L < 3) continue;
      const ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L, nx = ns[i][0], nz = ns[i][1], rot = Math.atan2(nx, nz);
      const gaps = [];
      for (const d of doors1F) {
        const t = (d.x - a[0]) * ux + (d.z - a[1]) * uz, off = Math.abs((d.x - a[0]) * nx + (d.z - a[1]) * nz);
        if (off < 1.2 && t > -d.w && t < L + d.w) gaps.push([t - d.w / 2 - 0.2, t + d.w / 2 + 0.2]);
      }
      const free = (t, m = 0) => !gaps.some(([g0, g1]) => t > g0 - m && t < g1 + m);
      const at = (t, o) => [a[0] + ux * t + nx * o, a[1] + uz * t + nz * o];
      const fb = (t, o, y, w, d, h, mat) => { const [x, z] = at(t, o); K.box({ x, z, y, w, d, h, rotY: rot, mat, solid: false, skip: ['bottom'] }); };
      // continuous runs between doors
      let t0 = null;
      for (let t = 0; t <= L + 0.25; t += 0.25) {
        const ok = t <= L && free(t);
        if (ok && t0 === null) t0 = t;
        if (!ok && t0 !== null) {
          const t1 = Math.min(t - 0.25, L), m = (t0 + t1) / 2, w = t1 - t0;
          if (w > 0.4) {
            fb(m, 0.1, 0, w, 0.12, 0.5, { tex: 'darkstone', color: 0x8a8378 });
            fb(m, 0.09, 2.85, w, 0.1, 0.12, 0x343a40);
            fb(m, 0.09, 4.22, w, 0.12, 0.18, 0x343a40);
          }
          t0 = null;
        }
      }
      for (let t = 0.75; t < L - 0.3; t += 1.5) if (free(t, 0.15)) fb(t, 0.09, 0.5, 0.08, 0.12, 3.72, 0x343a40);
      for (let t = 4.5; t < L - 1; t += 9) if (free(t, 0.5)) fb(t, 0.22, 0, 0.9, 0.44, 4.4, { tex: 'concrete', color: 0xd3c9b5 });
    }
  }
  K.polyWalls(POLY, 4.4, 6, { mat: beige, inner: innerW, thick: 0.4 });
  // 2F: parking deck look, wide opening toward the courtyard deck
  {
    const [dx, dz] = W(173, 30.2);
    K.polyWalls(POLY, 6, 11, { mat: { tex: 'gb_deck' }, inner: 0xcac6be, thick: 0.35, floorH: 5, openings: [{ x: dx, z: dz, w: 50, y0: 6, y1: 10.98 }] });
  }
  // 3F market
  K.polyWalls(POLY, 11, 16, { mat: { tex: 'gb_market' }, inner: 0xe8e2d6, thick: 0.35, floorH: 5 });
  // 4F..9F office slab
  K.polyWalls(POLY, 16, ROOF, { mat: { tex: 'gb_office' }, inner: 0xeeeae2, thick: 0.35, floorH: 4.5 });
  // parapet + coping
  K.polyWalls(POLY, ROOF, ROOF + 1.2, { mat: beigeD, inner: 0xa9a294, thick: 0.3 });
  // facade rhythm: vertical concrete fins every 9 m on the office floors, cornice at 3F/4F
  {
    const ns = K.orient(POLY);
    for (let i = 0; i < POLY.length; i++) {
      const a = POLY[i], b = POLY[(i + 1) % POLY.length], L = Math.hypot(b[0] - a[0], b[1] - a[1]);
      if (L < 12) continue;
      const ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L, nx = ns[i][0], nz = ns[i][1];
      const rot = Math.atan2(nx, nz);
      for (let t = 4.5; t < L - 2; t += 9) {
        const x = a[0] + ux * t + nx * 0.3, z = a[1] + uz * t + nz * 0.3;
        K.box({ x, z, y: 16, w: 0.5, d: 0.6, h: ROOF - 16 + 1.2, rotY: rot, mat: 0xcfc7b6, solid: false, skip: ['bottom'] });
      }
      // cornice band between 3F and 4F and a dark base under 1F band
      const mx = (a[0] + b[0]) / 2 + nx * 0.3, mz = (a[1] + b[1]) / 2 + nz * 0.3;
      K.box({ x: mx, z: mz, y: 15.6, w: L, d: 0.7, h: 0.8, rotY: rot, mat: 0xbfb6a4, solid: false, skip: ['bottom'] });
      // 1F/2F signage fascia: bronze metal band with a pale stone sill line under it
      K.box({ x: (a[0] + b[0]) / 2 + nx * 0.2, z: (a[1] + b[1]) / 2 + nz * 0.2, y: 4.4, w: L, d: 0.45, h: 1.6, rotY: rot, mat: { tex: 'metal', color: 0x7d7262 }, solid: false, skip: ['bottom'] });
      K.box({ x: (a[0] + b[0]) / 2 + nx * 0.45, z: (a[1] + b[1]) / 2 + nz * 0.45, y: 4.32, w: L, d: 0.12, h: 0.14, rotY: rot, mat: 0xe0d8c8, solid: false });
    }
  }
  // penthouse (10F) walls + chapel windows
  {
    const [u0, v0, u1, v1] = P10;
    const pp = hp(P10);
    const dG = W(40, v1), dG2 = W(66, v1), dW = W(u1, 10);
    K.polyWalls(pp, ROOF, PENT, { mat: { tex: 'gb_chapel' }, inner: 0xf3efe6, thick: 0.3, floorH: 5, openings: [{ x: dG[0], z: dG[1], w: 3, y0: ROOF, y1: ROOF + 2.8 }, { x: dG2[0], z: dG2[1], w: 3, y0: ROOF, y1: ROOF + 2.8 }, { x: dW[0], z: dW[1], w: 3, y0: ROOF, y1: ROOF + 2.8 }] });
    K.polyWalls(pp, PENT, PENT + 1, { mat: beigeD, thick: 0.3 });
    void u0; void v0;
  }

  // ---------------------------------------------------------------- vertical circulation
  for (const e of EL) {
    const fl = elevFloors(e);
    lelev(e.name, e.u, e.v, e.face, fl, e.w ? { w: e.w } : {});
  }
  // stair cores (switchback, flights along v)
  for (const c of CORES) {
    const ys = c.ys.map(yOf);
    const cu = c.u0 + 2;
    const vd = c.door > 0 ? c.v1 : c.v0, vf = c.door > 0 ? c.v0 : c.v1;
    const L1 = vd - c.door * 1.5, L2 = vf + c.door * 1.5;
    for (let i = 0; i < ys.length - 1; i++) {
      const y = ys[i], y2 = ys[i + 1], ym = (y + y2) / 2;
      lstairs(cu - 1, L1, cu - 1, L2, { w: 1.75, ya: y, yb: ym, mat: { tex: 'darkstone', color: 0xbdb6aa } });
      rbox(c.u0 + 0.1, Math.min(vf, L2), c.u0 + 3.9, Math.max(vf, L2), ym - 0.3, 0.3, { tex: 'tile', color: 0xc9c2b4 });
      lstairs(cu + 1, L2, cu + 1, L1, { w: 1.75, ya: ym, yb: y2, mat: { tex: 'darkstone', color: 0xbdb6aa } });
    }
    const yb = ys[0], yt = ys[ys.length - 1] + 3;
    const wm = { mat: 0xdcd6ca, thick: 0.2 };
    lwall(c.u0, c.v0, c.u0, c.v1, yb, yt, wm);
    lwall(c.u0 + 4, c.v0, c.u0 + 4, c.v1, yb, yt, wm);
    lwall(c.u0, vf, c.u0 + 4, vf, yb, yt, wm);
    lwall(c.u0, vd, c.u0 + 4, vd, yb, yt, { ...wm, openings: ys.map(y => ({ at: 2, w: 3.2, y0: y, y1: y + 2.7 })) });
    // stair penthouse roof above the top floor
    rbox(c.u0 - 0.1, c.v0 - 0.1, c.u0 + 4.1, c.v1 + 0.1, yt, 0.3, 0x9f998e, { solid: false });
    for (let i = 0; i < ys.length; i++) {
      const lbl = c.ys[i] === 'R' ? '옥상' : c.ys[i];
      lsign(['비상계단', lbl], cu, vd + c.door * 0.13, ys[i] + 3.05, 1.6, 0.55, c.door > 0 ? '+v' : '-v', { bg: '#1f6f3a', fg: '#fff', pxPerM: 60 });
    }
  }
  // escalators
  for (const e of ESC) {
    const [u0, v0, u1, v1] = e.r;
    const [ua, ub] = e.us;
    // up escalator and down escalator, low end at v0
    lesc(ua, v0, ua, v1, { ya: e.ya, yb: e.yb, w: 1.05, dir: 'up' });
    lesc(ub, v0, ub, v1, { ya: e.ya, yb: e.yb, w: 1.05, dir: 'down' });
    if (e.stairsU) lstairs(e.stairsU, v0, e.stairsU, v1, { w: 2.3, ya: e.ya, yb: e.yb });
    // railing around the void at the upper floor (open at v1 = arrival side)
    const rail = { mat: glass, thick: 0.06 };
    lwall(u0, v0, u1, v0, e.yb, e.yb + 1.1, rail);
    lwall(u0, v0, u0, v1, e.yb, e.yb + 1.1, rail);
    lwall(u1, v0, u1, v1, e.yb, e.yb + 1.1, rail);
    rbox(u0 - 0.05, v0 - 0.05, u1 + 0.05, v0 + 0.05, e.yb + 1.1, 0.06, 0x8a9096, { solid: false });
  }
  // car ramp 2F -> 3F parking
  {
    const [u0, v0, u1, v1] = CAR_RAMP.r;
    lramp(u0, (v0 + v1) / 2, u1, (v0 + v1) / 2, { w: v1 - v0, ya: 6, yb: 11, mat: { tex: 'parking', color: 0x9a9892 } });
    const rail = { mat: 0xbab4a8, thick: 0.25 };
    lwall(u0, v1, u1, v1, 11, 12.1, rail);
    lwall(u0, v0, u0, v1, 11, 12.1, rail);
    lsign(['주차장 3F ↑', '꽃시장 주차'], u0 + 1, v1 + 0.2, 9.0, 3.4, 0.9, '+v', { bg: '#1b4f9c', fg: '#fff' });
  }

  // ---------------------------------------------------------------- column grid (all floors)
  const excl = [...EL.map(elHole), ...CORES.map(c => [c.u0, c.v0, c.u0 + 4, c.v1]), ...ESC.map(e => e.r), CAR_RAMP.r];
  function columns(y, h, vmin = 0, mat = 0xe2ddd3, skip = null) {
    for (let u = 6; u < 316; u += 9) for (let v = 6 + vmin; v < 158; v += 9) {
      const [x, z] = W(u, v);
      if (!K.pointInPoly(x, z, POLY)) continue;
      const [x2, z2] = W(u, v + 1.5), [x3, z3] = W(u + 1, v);
      if (!K.pointInPoly(x2, z2, POLY) || !K.pointInPoly(x3, z3, POLY)) continue;
      if (excl.some(r => inR(r, u, v, 0.9))) continue;
      if (skip && skip(u, v)) continue;
      lbox(u, v, y, 0.8, 0.8, h, mat, { skip: ['top', 'bottom'] });
    }
  }
  // ceiling light panels
  function lights(y, uStep = 9, vStep = 9, skip = null, mat = { tex: 'emit', color: 0xfffbf0 }) {
    for (let u = 1.5; u < 316; u += uStep) for (let v = 1.5; v < 158; v += vStep) {
      const [x, z] = W(u, v); if (!K.pointInPoly(x, z, POLY)) continue;
      if (excl.some(r => inR(r, u, v, 1.5))) continue;
      if (skip && skip(u, v)) continue;
      lquadDown(u - 1.6, v - 0.3, u + 1.6, v + 0.3, y, mat);
    }
  }
  function lquadDown(u0, v0, u1, v1, y, mat) { const p = rect(u0, v0, u1, v1).map(([x, z]) => [x, y, z]); K.quad(mat, p, [0, -1, 0]); }

  // ================================================================= B1
  buildB1();
  // ================================================================= 1F
  build1F();
  // ================================================================= courtyard: bays, deck, ramps
  buildCourtyard();
  // ================================================================= 2F parking
  build2F();
  // ================================================================= 3F flower market
  build3F();
  // ================================================================= 4F..9F offices
  buildOffices();
  // ================================================================= 10F chapel + roof garden
  build10F();
  // ================================================================= exterior signage
  buildExterior();

  // ---------------------------------------------------------------- spawns
  lspawn('경부선 터미널 신반포로 정문', 26, -7, 0, 0, 1);
  lspawn('1F 대합실 (승차홈 1~16)', 60, 88, 0, 1, 0);
  lspawn('경부선 승차홈 (17~36번 앞)', 246, 47, 0, 0, -1);
  lspawn('3F 꽃도매상가', 35.5, 101.5, 11, 0, -1);
  lspawn('B1 다이소 강남고속터미널점 앞', 168, 3.6, LEVELS.B1, 1, 0);
  lspawn('경부선 주차장 (2F 데크)', 172, 70, 6, 0, -1);
  lspawn('10F 고속터미널성당 · 옥상정원', 44, 64.4, ROOF, 0, 1);

  // ================================================================= sections
  function buildB1() {
    const y = LEVELS.B1;
    const r = [30, 0, 284, 22];
    const poly = hp(r);
    K.slab(poly, y, { mat: { tex: 'tile', color: 0xd9d4ca }, under: false, holes: holesAt(y).map(hp) });
    // walls (outer face on the rect), opening for J2 on the north side at the junction
    const j = W(125.9, 0);
    K.polyWalls(poly, y, -0.3, { mat: { tex: 'concrete', color: 0xa8a49c }, inner: 0xe9e5dc, thick: 0.3, openings: [{ x: j[0], z: j[1], w: 8.8, y0: y, y1: y + 3.4 }] });
    // ceiling lights (1F slab underside is the ceiling at -0.3)
    for (let u = 33; u < 274; u += 6) for (const v of [3.2, 11, 18.5]) { if (excl.some(e => inR(e, u, v, 1.2))) continue; lquadDown(u - 1.4, v - 0.25, u + 1.4, v + 0.25, -0.33, { tex: 'emit', color: 0xfffcf2 }); }
    // drop-soffit band over the corridor
    rbox(30.2, 6.6, 275.8, 7.0, -1.2, 0.9, 0xf2efe8, { solid: false });
    columns(y, 5.7, 0, colTex('B1', 5.7, '#ece8e0'), (u, v) => v > 21);
    K.zone({ name: '경부선 터미널 지하 1층', floor: 'B1', sub: '다이소 강남고속터미널점 · 지하상가(GOTO MALL)·고속터미널역 연결', poly, y0: y, y1: 0, priority: 1 });

    // J2 corridor to GOTO MALL (world axis-aligned, x 116..124)
    {
      const zG = (x) => -152.37 - 0.3733 * (x - 107.2) - 0.3; // GOTO south wall line (+0.3 m overlap)
      const zF = (x) => -59.24 - 0.37993 * (x - 2.3);          // our north face line
      const cp = [[116, zG(116)], [124, zG(124)], [124, zF(124)], [116, zF(116)]];
      K.slab(cp, y, { mat: { tex: 'tile', color: 0xd9d4ca }, under: false });
      K.hpoly('ceiling', cp, y + 3.6, false);
      K.wall(116, zG(116), 116, zF(116), y, y + 3.6, { mat: 0xe9e5dc, thick: 0.25 });
      K.wall(124, zG(124), 124, zF(124), y, y + 3.6, { mat: 0xe9e5dc, thick: 0.25 });
      for (let z = zG(120) + 4; z < zF(120) - 2; z += 6) K.quad({ tex: 'emit', color: 0xfffcf2 }, [[118.5, y + 3.58, z - 0.3], [121.5, y + 3.58, z - 0.3], [121.5, y + 3.58, z + 0.3], [118.5, y + 3.58, z + 0.3]], [0, -1, 0]);
      const ads = ['꽃도매상가 3F · 새벽 꽃시장', '다이소 강남고속터미널점 B1', '서울고속버스터미널 경부·영동선', '고속버스 모바일 예매', '신세계백화점 강남점'];
      for (let i = 0, z = zG(120) + 6; z < zF(120) - 6; z += 9, i++) {
        K.sign([ads[i % ads.length]], { x: 116.16, y: y + 1.7, z, w: 3.4, h: 1.3, rotY: PI / 2, bg: ['#14366e', '#2f7d3a', '#e60012', '#333333', '#7a1a1a'][i % 5], fg: '#ffffff', pxPerM: 60 });
        K.box({ x: 123.88, y: y, z, w: 0.12, h: 0.9, d: 6, mat: 0xb8b4ac, solid: false });
      }
      K.sign(['고속터미널역 · GOTO MALL', '3·7·9호선 ↑'], { x: 120, y: y + 3.1, z: zF(120) - 1.5, w: 4.4, h: 0.7, rotY: PI, bg: '#14366e', fg: '#fff', twoSided: true });
      K.sign(['경부선·영동선 터미널 ↓', '다이소 · 승차홈'], { x: 120, y: y + 3.1, z: zG(120) + 3, w: 4.4, h: 0.7, rotY: 0, bg: '#14366e', fg: '#fff', twoSided: true });
      K.zone({ name: '고투몰 ↔ 경부선 터미널 연결통로', floor: 'B1', sub: '지하상가·고속터미널역 방면', poly: cp, y0: y, y1: y + 3.6, priority: 3 });
      K.crowd(cp, y, 8, { seed: 71 });
    }
    // 다이소 강남고속터미널점 (big store)
    {
      const d = [176, 7.4, 246, 21.7];
      lwall(d[0], d[1], d[0], d[3], y, y + 4.2, { mat: 0xf4f1ea, thick: 0.2 });
      lwall(d[2], d[1], d[2], d[3], y, y + 4.2, { mat: 0xf4f1ea, thick: 0.2 });
      // glass front with 2 entrances
      lwall(d[0], d[1], d[2], d[1], y, y + 3.2, { mat: glass, thick: 0.08, openings: [{ at: 14, w: 5, y0: y, y1: y + 2.8 }, { at: 52, w: 5, y0: y, y1: y + 2.8 }] });
      rbox(d[0], d[1] - 0.25, d[2], d[1] + 0.05, y + 3.2, 1.0, 0xe60012, { solid: false });
      lsign(['DAISO 다이소'], (d[0] + d[2]) / 2, d[1] - 0.27, y + 3.7, 10, 0.95, '-v', { bg: '#e60012', fg: '#ffffff' });
      lsign(['다이소 강남고속터미널점', '영업 10:00 ~ 22:00'], d[0] + 6, d[1] - 0.27, y + 2.5, 3.6, 0.6, '-v', { bg: '#ffffff', fg: '#e60012' });
      // shelves
      for (let u = d[0] + 3; u < d[2] - 2; u += 2.9) {
        for (const [v0, v1] of [[11.4, 15.6], [16.6, 20.6]]) lbox(u, (v0 + v1) / 2, y, 1.0, v1 - v0, 1.9, 0xf4f2ee, { side: { tex: 'gb_shelf' } });
      }
      // wall shelves on the back
      rbox(d[0] + 0.3, d[3] - 0.9, d[2] - 0.3, d[3] - 0.2, y, 2.3, 0xf4f2ee, { side: { tex: 'gb_shelf' } });
      // checkout counters
      for (let k = 0; k < 5; k++) { rbox(d[0] + 22 + k * 3.2, 8.6, d[0] + 24 + k * 3.2, 9.4, y, 1.0, 0xfafafa); lbox(d[0] + 23 + k * 3.2, 9.1, y + 1.0, 0.4, 0.3, 0.3, 0x333333, { solid: false }); }
      lsign('계산대', d[0] + 30, 9.0, y + 3.2, 3, 0.45, '-v', { bg: '#e60012', fg: '#fff', twoSided: true });
      for (const [u, txt] of [[184, '주방·욕실'], [198, '문구·팬시'], [212, '수납·정리'], [226, '뷰티·위생'], [240, '인테리어·원예']]) lsign(txt, u, 16.1, y + 3.0, 3.2, 0.5, '-v', { bg: '#ffffff', fg: '#e60012', twoSided: true });
      lzone('다이소 강남고속터미널점', 'B1', '생활용품 · 주방 · 문구 · 뷰티 (10:00~22:00)', d[0], d[1], d[2], d[3], y, 0, 4);
      lcrowd(d[0] + 1, 8, d[2] - 1, 21, y, 26, 72);
    }
    // smaller B1 shops along the south side
    const shopsB1 = [
      [64, 74, '분식 · 김밥'], [74, 84, '휴대폰 액세서리'], [84, 94, '양말 · 잡화'], [94, 102, '화장품'],
      [112, 121, '커피 · 음료'], [131, 140, '가방 · 여행용품'], [140, 149, '안경'], [149, 158, '꽃 · 화분'], [158, 167, '여성의류'], [167, 175.6, '편의점'],
    ];
    for (const [u0, u1, name] of shopsB1) shopUnit(u0, 7.4, u1, 21.7, y, name, '-v', { h: 3.6, kind: kindFor(name) });
    // 1F connections signage / service rooms
    rbox(246.3, 7.4, 262, 21.7, y, 3.6, 0xdcd8d0, { side: 0xdcd8d0 });
    lsign(['화장실', '남 · 여'], 254, 7.2, y + 2.8, 2.6, 0.6, '-v', { bg: '#2d3e50', fg: '#fff' });
    lsign(['1F 매표소 · 승차홈 ↑'], 61.4, 15, y + 3.2, 3.2, 0.5, '+v', { bg: '#14366e', fg: '#fff' });
    lsign(['1F 하차장 · 택시 ↑'], 107.4, 15, y + 3.2, 3.2, 0.5, '+v', { bg: '#14366e', fg: '#fff' });
    lsign(['1F 승차홈 17~36 ↑'], 225.4, 15, y + 3.2, 3.2, 0.5, '+v', { bg: '#14366e', fg: '#fff' });
    lcrowd(32, 1, 274, 6.5, y, 40, 73);
  }

  function kindFor(name) {
    if (/커피|음료|카페|스타벅스|Tiger|타이거|백미당/.test(name)) return 'cafe';
    if (/분식|김밥|버거|Burger|순두부|부대찌개|국수|만두|Mandu|Taco|타코벨|식당|파리바게뜨|베이커리|호두/.test(name)) return 'food';
    if (/은행|ATM|매표/.test(name)) return 'bank';
    if (/편의점|emart|이마트|약국|아트박스|다이소|문구|잡화|화장품|기념품|양말/.test(name)) return 'shelf';
    if (/의류|가방|안경|eyewear|여행/.test(name)) return 'rack';
    if (/꽃|화분/.test(name)) return 'flower';
    if (/Gym|헬스/.test(name)) return 'gym';
    return 'shelf';
  }
  // a shop unit: rect u0..u1 x v0..v1, front on `face` side. Partition walls on the other sides.
  function shopUnit(u0, v0, u1, v1, y, name, face, o = {}) {
    const h = o.h ?? 4.0, wm = { mat: o.wall ?? 0xf1ede5, thick: 0.15 };
    if (face !== '-u' && !o.noWallU0) lwall(u0, v0, u0, v1, y, y + h, wm);
    if (face !== '+u' && !o.noWallU1) lwall(u1, v0, u1, v1, y, y + h, wm);
    if (face !== '-v' && !o.noWallV0) lwall(u0, v0, u1, v0, y, y + h, wm);
    if (face !== '+v' && !o.noWallV1) lwall(u0, v1, u1, v1, y, y + h, wm);
    const [du, dv] = FDIR[face];
    const fu = du > 0 ? u1 : du < 0 ? u0 : (u0 + u1) / 2, fv = dv > 0 ? v1 : dv < 0 ? v0 : (v0 + v1) / 2;
    const along = du !== 0 ? Math.abs(v1 - v0) : Math.abs(u1 - u0);
    const col = o.color ?? pick([0x2b3a55, 0x7a2430, 0x1f5a3a, 0x3a3a3a, 0x8a5a2a, 0x23415f, 0x5b2d6e]);
    // fascia band + sign
    const fw = du !== 0 ? 0.3 : along, fd = du !== 0 ? along : 0.3;
    lbox(fu + du * 0.1, fv + dv * 0.1, y + h - 0.9, fw, fd, 0.9, col, { solid: false });
    lsign(name, fu + du * 0.27, fv + dv * 0.27, y + h - 0.45, Math.min(along - 0.6, 7.5), 0.62, face, { bg: o.bg ?? '#ffffff', fg: o.fg ?? '#' + col.toString(16).padStart(6, '0') });
    // contents
    const kind = o.kind || kindFor(name);
    const cu = (u0 + u1) / 2, cv = (v0 + v1) / 2;
    const iu = (t) => du !== 0 ? (du > 0 ? u0 + (u1 - u0) * t : u1 - (u1 - u0) * t) : null;
    const iv = (t) => dv !== 0 ? (dv > 0 ? v0 + (v1 - v0) * t : v1 - (v1 - v0) * t) : null;
    // helper: point at depth t (0 = back, 1 = front) and lateral s (0..1)
    const P = (t, s) => du !== 0 ? [iu(t), v0 + (v1 - v0) * s] : [u0 + (u1 - u0) * s, iv(t)];
    if (kind === 'food' || kind === 'cafe') {
      const [cu1, cv1] = P(0.18, 0.5);
      lbox(cu1, cv1, y, du !== 0 ? 0.9 : along * 0.8, du !== 0 ? along * 0.8 : 0.9, 1.05, kind === 'cafe' ? 0x5a4030 : 0xe8e4dc, {});
      const n = Math.max(1, Math.floor(along / 2.4));
      for (let i = 0; i < n; i++) for (const t of [0.5, 0.78]) {
        const [tu, tv] = P(t, (i + 0.5) / n);
        lbox(tu, tv, y, 0.8, 0.8, 0.74, kind === 'cafe' ? 0x7a5a3e : 0xd9cbb5, { solid: false });
        lbox(tu + 0.6, tv, y, 0.42, 0.42, 0.45, 0x333333, { solid: false });
        lbox(tu - 0.6, tv, y, 0.42, 0.42, 0.45, 0x333333, { solid: false });
        if (rnd() < 0.5) lperson(tu + 0.6, tv, y, { sit: true });
      }
      // menu board
      const [mu, mv] = P(0.02, 0.5);
      lsign(['MENU'], mu, mv, y + 2.4, Math.min(3, along * 0.6), 0.7, face, { bg: '#1c1c1c', fg: '#ffd27a', pxPerM: 40 });
    } else if (kind === 'bank') {
      const [cu1, cv1] = P(0.35, 0.5);
      lbox(cu1, cv1, y, du !== 0 ? 0.8 : along * 0.85, du !== 0 ? along * 0.85 : 0.8, 1.1, 0xd8d2c6, {});
      const n = Math.max(1, Math.floor(along / 1.8));
      for (let i = 0; i < n; i++) { const [tu, tv] = P(0.15, (i + 0.5) / n); lperson(tu, tv, y, { sit: true, shirt: 0x24324a }); }
    } else if (kind === 'rack' || kind === 'gym') {
      const n = Math.max(1, Math.floor(along / 2.2));
      for (let i = 0; i < n; i++) {
        const [tu, tv] = P(0.45, (i + 0.5) / n);
        lbox(tu, tv, y, 1.4, 0.5, 1.5, kind === 'gym' ? 0x222222 : 0x777a80, { solid: false });
        if (kind === 'rack') lbox(tu, tv, y + 0.5, 1.3, 0.35, 0.95, pick([0x2f4b7a, 0xb03a48, 0xe8e2d4, 0x3d6e4a, 0x1d1d1d]), { solid: false });
      }
      const [bu, bv] = P(0.06, 0.5);
      lbox(bu, bv, y, du !== 0 ? 0.5 : along * 0.9, du !== 0 ? along * 0.9 : 0.5, 2.2, 0xf4f2ee, { side: { tex: kind === 'gym' ? 'concrete' : 'gb_shelf' } });
    } else if (kind === 'flower') {
      const n = Math.max(1, Math.floor(along / 1.3));
      for (let i = 0; i < n; i++) { const [tu, tv] = P(0.7, (i + 0.5) / n); lbox(tu, tv, y, 0.9, 0.9, 0.55, 0x3d3d3d, { solid: false }); lbox(tu, tv, y + 0.55, 0.95, 0.95, 0.35, { tex: 'gb_flowerbin' }, { solid: false }); }
    } else {
      const n = Math.max(1, Math.floor(along / 2.4));
      for (let i = 0; i < n; i++) { const [tu, tv] = P(0.5, (i + 0.5) / n); lbox(tu, tv, y, du !== 0 ? 2.2 : 0.8, du !== 0 ? 0.8 : 2.2, 1.6, 0xf4f2ee, { side: { tex: 'gb_shelf' } }); }
      const [bu, bv] = P(0.06, 0.5);
      lbox(bu, bv, y, du !== 0 ? 0.5 : along * 0.9, du !== 0 ? along * 0.9 : 0.5, 2.2, 0xf4f2ee, { side: { tex: 'gb_shelf' } });
      const [cu2, cv2] = P(0.88, 0.2);
      lbox(cu2, cv2, y, 1.2, 1.2, 1.0, 0xe8e4dc);
    }
    void cu; void cv;
    if (o.zone !== false) lzone(o.zoneName || name, o.floor || floorLabel(y), o.sub || '', Math.min(u0, u1), Math.min(v0, v1), Math.max(u0, u1), Math.max(v0, v1), y, y + h, 4);
  }
  function floorLabel(y) { if (y < -1) return 'B1'; const f = FL.find(f => Math.abs(f.y - y) < 0.01); return f ? f.k : ''; }

  function build1F() {
    const y = 0, H = 6;
    // ceiling: 2F slab underside at 5.65 ; light panels
    lights(5.6, 6, 6, (u, v) => (u > 75 && v > 23 && u < 98) || false);
    columns(y, 5.65, 0, colTex('1F', 5.65, '#ede8de'));
    // floor zone
    K.zone({ name: '서울고속버스터미널 1층', floor: '1F', sub: '매표소 제1·2·3 · 무인발권기 · 대합실 · 승차홈 1~43 · 하차장', poly: POLY, y0: y, y1: 6, priority: 1 });
    lzone('경부선 대합실 (서측)', '1F', '승차홈 1~16 · 제1매표소 · 식당·카페', 50, 22, 75, 155, y, 6, 2);
    lzone('경부·영동선 대합실 (북측)', '1F', '승차홈 17~43 · 제2·3매표소 · 하차장', 75, 0, 317, 30, y, 6, 2);

    // ---- west face shop band (u 0.4..11), fronts toward +u
    const westShops = [
      [20, 31, 'Taco Bell 타코벨'], [31, 43, '약국'], [52, 64, '파리바게뜨'], [64, 75, '호두과자 · 기념품'], [75, 88, '김밥 · 분식'],
      [88, 100, '놀부부대찌개철판구이'], [110, 120, 'Mandu Restaurant'], [120, 128, '아트박스'], [128, 136, 'staystudio eyewear'],
    ];
    for (const [v0, v1, name] of westShops) shopUnit(0.4, v0, 11, v1, y, name, '+u', { noWallU0: true, h: 4.2 });
    shopUnit(0.4, 136, 11, 150, y, 'Health Boy Gym', '+u', { noWallU0: true, h: 4.2, kind: 'gym', sub: '피트니스' });
    // ---- middle island (u 17..33)
    // escalators to 2F/3F (꽃시장) live at u 19.2..23.6, v 58..79
    lsign(['꽃도매상가 3F', '생화 · 조화 · 부자재'], 21.4, 57.6, 4.5, 4.2, 1.0, '-v', { bg: '#2f7d3a', fg: '#fff' });
    lsign(['주차장 2F ↑', '꽃시장 3F ↑'], 21.4, 57.6, 3.6, 3.2, 0.7, '-v', { bg: '#14366e', fg: '#fff' });
    lzone('꽃시장 에스컬레이터', '1F', '2F 주차장 · 3F 꽃도매상가', 18, 56, 25, 80, y, 6, 3);
    shopUnit(24.5, 40, 33, 56, y, '휴대폰 · 충전 · 여행용품', '+u', { h: 4.2 });
    shopUnit(24.5, 80, 33, 95, y, '편의점', '+u', { h: 4.2, kind: 'shelf' });
    shopUnit(17, 96, 33, 110, y, '만복국수집', '+u', { h: 4.2, kind: 'food' });
    // toilets + 수유실 block
    rbox(17, 112, 33, 126, y, 4.2, 0xdcd8d0);
    lsign(['화장실', '남 ← → 여'], 33.2, 119, 2.9, 3.4, 0.7, '+u', { bg: '#2d3e50', fg: '#fff' });
    lsign(['수유실'], 16.8, 119, 2.9, 2, 0.5, '-u', { bg: '#2d3e50', fg: '#fff' });
    lzone('화장실 · 수유실', '1F', '', 17, 112, 33, 126, y, 6, 3);
    // lockers + kiosks
    for (let i = 0; i < 6; i++) rbox(17.2 + i * 2.6, 128.5, 19.4 + i * 2.6, 129.3, y, 2.0, 0x9aa3ab, { side: 0x9aa3ab });
    lsign('물품보관함', 24, 129.4, 2.4, 3, 0.45, '+v', { bg: '#555', fg: '#fff' });
    // ---- east band (u 36..50) fronts toward +u (hall)
    const eastShops = [[26, 38, '북창동 순두부'], [40, 50, '무인발권기'], [54, 66, '백미당'], [74, 88, '노브랜드버거'], [90, 96, '국민은행 ATM'], [96, 106, 'Tiger Sugar 타이거슈가'], [108, 120, '고속버스 택배 접수'], [140, 152, '스타벅스']];
    for (const [v0, v1, name] of eastShops) {
      if (name === '무인발권기') { kiosks(48.5, v0, v1, '+u'); continue; }
      shopUnit(36, v0, 50, v1, y, name, '+u', { h: 4.2, color: name === '스타벅스' ? 0x00704a : name === '노브랜드버거' ? 0xf5c400 : undefined, fg: name === '노브랜드버거' ? '#222222' : undefined, kind: name.includes('ATM') ? 'bank' : name.includes('택배') ? 'bank' : undefined });
    }
    // 제1매표소 (south, next to gate 1)
    ticketOffice('제1매표소', 36, 144, 50, 153.5, '-v');
    kiosks(52, 140, 150, '-u');
    // west-hall benches (u 52..65) facing +u (gates)
    for (let v = 26; v < 140; v += 4.2) {
      if (v > 101 && v < 126) continue; // E12b void + stair
      bench(57, v, y, '+u', 3.6); bench(62, v, y, '+u', 3.6);
    }
    // information desk
    rbox(55, 18, 61, 20, y, 1.1, 0xf1ece2);
    lsign(['종합안내 i'], 58, 19, 2.6, 3.0, 0.6, '+v', { bg: '#14366e', fg: '#fff', twoSided: true });
    lperson(58, 18.6, y, { sit: true, shirt: 0x1d3f86 });
    lzone('종합안내', '1F', '', 54, 16, 62, 22, y, 6, 3);
    // gate corridor + gate signs (west arm)
    for (const g of gates.filter(g => g.side === 'w')) gateSign(g);
    // departure boards
    for (const v of [44, 92, 132]) departures(66.5, v, 4.0, '-u', 1);
    lsign(['승차홈 1 ~ 16', '부산 · 대구 · 대전 · 경상 방면'], 71, 29, 4.7, 5.5, 1.0, '+v', { bg: '#14366e', fg: '#fff', twoSided: true });

    // ---- north band (long bar) shops v 0.4..9, fronts toward +v
    shopUnit(3, 0.4, 15, 8, y, '신한은행', '+v', { noWallV0: true, h: 4.2, kind: 'bank', color: 0x0046ff });
    ticketOffice('제2매표소', 76, 0.4, 96, 8, '+v');
    kiosks(10.5, 99, 104, '+v');
    shopUnit(90, 12, 97, 21.5, y, 'emart24', '-u', { h: 4.0, color: 0xff9a00, kind: 'shelf' });
    const northShops = [
      [111.5, 121, '호두과자'], [131, 145.5, 'Burger King 버거킹'], [155.5, 166, '김밥 · 우동'], [166, 180, '다이소 강남고속버스터미널2호점'],
      [180, 189, '떡 · 한과 선물'], [189, 197, '약국'], [197, 207, '이마트24'], [207, 216, '커피'], [229, 238, '휴대폰 액세서리'], [238, 248, '도서 · 잡지'],
      [262, 269.5, '기념품'], [281, 288.5, '분식'], [288.5, 295.5, '편의점'],
    ];
    for (const [u0, u1, name] of northShops) {
      const daiso = name.startsWith('다이소');
      shopUnit(u0, 0.4, u1, 9, y, name, '+v', { noWallV0: true, h: 4.2, color: daiso ? 0xe60012 : name.startsWith('Burger') ? 0xd6201f : name === '이마트24' ? 0xff9a00 : undefined, kind: daiso ? 'shelf' : undefined });
    }
    // toilets (long bar)
    rbox(248.5, 0.4, 256, 9, y, 4.2, 0xdcd8d0);
    lsign(['화장실'], 252.2, 9.1, 3.1, 2.4, 0.5, '+v', { bg: '#2d3e50', fg: '#fff' });
    ticketOffice('제3매표소', 296, 0.4, 315.8, 8.5, '+v');
    kiosks(294, 12, 20, '+u');
    // benches along the long bar hall facing +v (gates)
    for (let u = 101; u < 312; u += 3.9) {
      if (u > 104 && u < 147) continue; // 하차장: no seats
      if (excl.some(r => inR(r, u, 15, 2))) continue;
      bench(u, 15, y, '+v', 3.4); bench(u, 19, y, '+v', 3.4);
    }
    for (const g of gates.filter(g => g.side === 'n')) gateSign(g);
    for (const u of [170, 236, 285]) departures(u, 22.3, 4.0, '-v', 2);
    lsign(['승차홈 17 ~ 43', '강원 · 충청 · 경기 · 경북 방면'], 200, 22.4, 4.7, 6, 1.0, '+v', { bg: '#14366e', fg: '#fff', twoSided: true });
    // 하차장 hall
    lzone('하차장 (도착)', '1F', '고속버스 도착 · 택시 · 지하철 방면', 99, 10, 148, 30, y, 6, 3);
    lsign(['하차장 (도착)', 'ARRIVAL'], 125, 22.4, 4.6, 6, 1.1, '-v', { bg: '#ffd400', fg: '#111', twoSided: true });
    lsign(['지하철 3·7·9호선 · 다이소 B1 ↓'], 107.4, 15.2, 3.3, 4.2, 0.5, '+v', { bg: '#14366e', fg: '#fff' });
    lsign(['지하철 · GOTO MALL · 다이소 B1 ↓'], 61.4, 15.2, 3.3, 4.4, 0.5, '+v', { bg: '#14366e', fg: '#fff' });
    lsign(['B1 다이소 · 지하철 ↓'], 225.4, 15.2, 3.3, 3.4, 0.5, '+v', { bg: '#14366e', fg: '#fff' });
    // people
    lcrowd(51, 24, 66, 138, y, 70, 11);
    lcrowd(12, 20, 16.5, 150, y, 25, 12);
    lcrowd(33.5, 24, 35.6, 150, y, 15, 13);
    lcrowd(99, 10, 312, 23, y, 120, 14);
    lcrowd(66.5, 26, 74.2, 150, y, 30, 15);
    lcrowd(2, 1, 52, 18, y, 30, 16);
    // seated waiting passengers
    for (let i = 0; i < 90; i++) {
      const west = i < 40;
      if (west) { const v = 26 + Math.floor(rnd() * 27) * 4.2; if (v > 101 && v < 126) continue; lperson(57 + (rnd() < 0.5 ? 0 : 5) - 0.1, v + (rnd() - 0.5) * 3, y + 0.0, { sit: true, rotY: FACE['+u'] }); }
      else { const u = 101 + Math.floor(rnd() * 54) * 3.9; if (u > 104 && u < 147) continue; if (excl.some(r => inR(r, u, 15, 2))) continue; lperson(u + (rnd() - 0.5) * 3, 15 + (rnd() < 0.5 ? 0 : 4) + 0.1, y, { sit: true, rotY: FACE['+v'] }); }
    }
  }
  function bench(u, v, y, face, len) {
    const along = face === '+u' || face === '-u';
    lbox(u, v, y, along ? 0.55 : len, along ? len : 0.55, 0.45, 0x6b7d8f, { solid: false });
    const [du, dv] = FDIR[face];
    lbox(u - du * 0.3, v - dv * 0.3, y + 0.45, along ? 0.08 : len, along ? len : 0.08, 0.45, 0x5a6b7c, { solid: false });
    lbox(u, v, y, along ? 0.6 : len, along ? len : 0.6, 0.48, 0x6b7d8f, { solid: true, skip: ['top', 'bottom', 'n', 's', 'e', 'w'] });
  }
  function kiosks(u, v0, v1, face) {
    const along = face === '+u' || face === '-u';
    for (let t = v0 + 1; t < v1; t += 1.6) {
      const [ku, kv] = along ? [u, t] : [t, u];
      lbox(ku, kv, 0, 0.7, 0.6, 1.6, 0x2b3440);
      const [du, dv] = FDIR[face];
      lsign(['승차권', '발권'], ku + du * 0.36, kv + dv * 0.31, 1.25, 0.5, 0.45, face, { bg: '#0b5ed7', fg: '#fff', pxPerM: 60 });
    }
    const [mu, mv] = along ? [u, (v0 + v1) / 2] : [(v0 + v1) / 2, u];
    lsign('무인발권기', mu, mv, 2.4, 2.4, 0.45, face, { bg: '#0b5ed7', fg: '#fff', twoSided: true });
    if (along) lzone('무인발권기', '1F', '고속버스 승차권 무인 발권', u - 1, v0, u + 1, v1, 0, 6, 3);
    else lzone('무인발권기', '1F', '고속버스 승차권 무인 발권', v0, u - 1, v1, u + 1, 0, 6, 3);
  }
  function ticketOffice(name, u0, v0, u1, v1, face) {
    const y = 0, along = face === '+v' || face === '-v';
    const [du, dv] = FDIR[face];
    // back office box
    const depth = along ? (v1 - v0) : (u1 - u0);
    if (along) {
      const vf = dv > 0 ? v1 : v0;
      rbox(u0, dv > 0 ? v0 : vf + 0.6, u1, dv > 0 ? vf - 0.6 : v1, y, 1.1, 0xe6e0d4);
      lwall(u0, dv > 0 ? v1 - 0.6 : v0 + 0.6, u1, dv > 0 ? v1 - 0.6 : v0 + 0.6, 1.1, 2.4, { mat: glass, thick: 0.05 });
      const n = Math.floor((u1 - u0) / 2.2);
      for (let i = 0; i < n; i++) { const u = u0 + 1.1 + i * 2.2; lsign(String(i + 1), u, vf - dv * 0.55, 2.6, 0.5, 0.35, face, { bg: '#14366e', fg: '#fff', pxPerM: 60 }); lperson(u, dv > 0 ? vf - 1.6 : vf + 1.6, y, { sit: true, rotY: FACE[face], shirt: 0x1d3f86 }); }
      lsign([name, '승차권 발매 · 환불'], (u0 + u1) / 2, vf + dv * 0.05, 3.6, Math.min(8, u1 - u0 - 1), 1.0, face, { bg: '#14366e', fg: '#fff' });
      lwall(u0, v0, u0, v1, y, 4.2, { mat: 0xe6e0d4, thick: 0.15 }); lwall(u1, v0, u1, v1, y, 4.2, { mat: 0xe6e0d4, thick: 0.15 });
      rbox(u0, dv > 0 ? v1 - 0.3 : v0, u1, dv > 0 ? v1 : v0 + 0.3, 3.0, 1.2, 0x14366e, { solid: false });
      lzone(name, '1F', '고속버스 승차권 발매 · 환불 · 문의', u0, v0, u1, v1 + dv * 3, y, 6, 3);
    } else {
      const uf = du > 0 ? u1 : u0;
      rbox(du > 0 ? u0 : uf + 0.6, v0, du > 0 ? uf - 0.6 : u1, v1, y, 1.1, 0xe6e0d4);
      lsign([name], uf, (v0 + v1) / 2, 3.6, Math.min(8, v1 - v0 - 1), 0.9, face, { bg: '#14366e', fg: '#fff' });
      lzone(name, '1F', '고속버스 승차권 발매', u0, v0, u1, v1, y, 6, 3);
    }
    void depth;
  }
  // gate sign (inside, above the door) + bay number outside
  function gateSign(g) {
    const isW = g.side === 'w';
    const dest = destOf(g.n);
    const num = g.n == null ? '하차' : String(g.n);
    const col = g.n == null ? '#ffd400' : RESERVE.has(g.n) ? '#6b7280' : '#14366e';
    const fg = g.n == null ? '#111' : '#fff';
    if (isW) {
      const v = g.v + 1.2;
      lsign([num], 74.6, v - 1.6, 3.55, 0.9, 0.9, '-u', { bg: col, fg });
      if (dest) lsign([dest], 74.6, v + 0.7, 3.55, 2.6, 0.55, '-u', { bg: '#111', fg: '#ffb000' });
      lsign([num], 75.2 + 0.0038 * (v - 22.6) + 0.45, v, 4.0, 1.0, 0.8, '+u', { bg: col, fg });
      lfloorText(num, 83, v, 0.03, 3, 1.6, '+u', { fg: '#ffffff' });
      lzone(`승차홈 ${num}번`, '1F', dest, 66, v - 2.5, 92, v + 2.5, 0, 5, 5);
    } else {
      const u = g.u + 1.2;
      lsign([num], u - 1.6, 29.6, 3.55, 0.9, 0.9, '-v', { bg: col, fg });
      if (dest && g.n != null) lsign([dest], u + 0.9, 29.6, 3.55, 2.6, 0.55, '-v', { bg: '#111', fg: '#ffb000' });
      lsign([num], u, 30.7, 4.0, 1.0, 0.8, '+v', { bg: col, fg });
      if (g.n != null) { lfloorText(num, u, 39, 0.03, 1.6, 3, '+v', { fg: '#ffffff' }); lzone(`승차홈 ${num}번`, '1F', dest, u - 2.7, 22, u + 2.7, 46, 0, 5, 5); }
    }
  }
  function departures(u, v, y, face, side) {
    const list = side === 1
      ? ['행선지        출발   홈', '부산         14:30    1', '동대구       14:40    7', '대전         14:45   11', '창원         15:00    4', '울산         15:10    6', '천안         15:15   14']
      : ['행선지        출발   홈', '속초·양양    14:35   19', '강릉         14:50   23', '원주         15:00   25', '청주         15:05   34', '여주         15:20   29', '안동         15:30   31'];
    lsign(list, u, v, y, face === '-u' || face === '+u' ? 3.6 : 4.2, 2.0, face, { bg: '#0d0d0d', fg: '#ffb000', bold: false, align: 'left', twoSided: true, pxPerM: 80 });
    lsign(['출발 안내 DEPARTURES'], u, v, y + 1.25, face === '-u' || face === '+u' ? 3.6 : 4.2, 0.45, face, { bg: '#14366e', fg: '#fff', twoSided: true });
  }

  function buildCourtyard() {
    const y = 0;
    // apron (asphalt) covering the courtyard between the arms
    const apron = [W(75.6, 22.9), W(97.4, 23.1), W(97.8, 30.4), W(316.7, 30.4), W(352, 30.5), W(352, 146), W(196, 146.5), W(196, 147), W(91, 148.6), W(76, 155)];
    K.hpoly({ tex: 'asphalt', color: 0x8e8c88 }, apron, 0.015, true);
    // platform curb strip along the gates
    for (const [u0, v0, u1, v1] of [[76.2, 28, 77.9, 154], [97.6, 30.4, 316.7, 32.2]]) rbox(u0, v0, u1, v1, 0, 0.16, { tex: 'sidewalk', color: 0xcfc9bc }, { solid: true });
    // lane markings: bay dividers
    for (const g of gates) {
      if (g.side === 'w') { const v = g.v + 1.2; for (const s of [-2.6, 2.6]) lquadH(77.5, v + s - 0.06, 90, v + s + 0.06, 0.03, { tex: 'emit', color: 0xf2f2f2 }); }
      else { const u = g.u + 1.2; for (const s of [-2.6, 2.6]) lquadH(u + s - 0.06, 32.2, u + s + 0.06, 44.5, 0.03, { tex: 'emit', color: 0xf2f2f2 }); }
    }
    // lane edge lines
    lquadH(91, 32, 91.15, 150, 0.03, { tex: 'emit', color: 0xf7d000 });
    lquadH(91, 45.5, 316, 45.65, 0.03, { tex: 'emit', color: 0xf7d000 });
    // canopies over the bays (outside the deck)
    const canopyMat = { tex: 'metal', color: 0xc9ccd0 };
    const canopy = (u0, v0, u1, v1) => { rbox(u0, v0, u1, v1, 4.9, 0.35, canopyMat, { solid: true }); };
    canopy(75.5, 23, 93, 155);
    canopy(97.5, 30.3, 147.4, 47.5);
    canopy(199.2, 30.3, 316.7, 47.5);
    for (let v = 30; v < 154; v += 12) lcyl(92.3, v, 0, 0.22, 4.9, 0x9aa0a6, { seg: 8 });
    for (let u = 100; u < 147; u += 12) lcyl(u, 46.9, 0, 0.22, 4.9, 0x9aa0a6, { seg: 8 });
    for (let u = 202; u < 316; u += 12) lcyl(u, 46.9, 0, 0.22, 4.9, 0x9aa0a6, { seg: 8 });
    // canopy downlights
    for (let v = 26; v < 154; v += 6) lquadDown(80, v - 0.3, 88, v + 0.3, 4.88, { tex: 'emit', color: 0xfff6e0 });
    for (let u = 100; u < 316; u += 6) { if (u > 147 && u < 199) continue; lquadDown(u - 0.3, 34, u + 0.3, 44, 4.88, { tex: 'emit', color: 0xfff6e0 }); }
    lsign(['경부선 승차홈 1 ~ 16'], 92.6, 90, 5.6, 14, 1.2, '+u', { bg: '#14366e', fg: '#ffffff' });
    lsign(['경부 · 영동선 승차홈 17 ~ 43'], 250, 47.7, 5.6, 18, 1.2, '+v', { bg: '#14366e', fg: '#ffffff' });
    lsign(['하차장'], 122, 47.7, 5.6, 8, 1.2, '+v', { bg: '#ffd400', fg: '#111111' });

    // buses at bays
    const busCols = [0xf3f3f0, 0x1f4e9c, 0xc8102e, 0xf3f3f0, 0x2b7a3d, 0x1b2a4a, 0xe9e4d8, 0x6a1b9a];
    for (const g of gates) {
      const dest = destOf(g.n);
      if (g.kind === 'arrive') continue;
      if (!dest || dest === '예비') continue;
      if (rnd() > 0.72) continue;
      const label = dest.split(/[·(]/)[0].trim();
      if (g.side === 'w') lcar(83.6, g.v + 1.6, 0, FACE['-u'] + 0.3, 'bus', { label, color: pick(busCols) });
      else lcar(g.u + 1.8, 38.6, 0, FACE['-v'] - 0.3, 'bus', { label, color: pick(busCols) });
    }
    // arriving buses at 하차장 (parallel to the curb, heading west)
    for (const u of [112, 128]) lcar(u, 35, 0, FACE['-u'], 'bus', { label: pick(['부산', '대전', '강릉', '동대구']), color: pick(busCols) });
    lcrowd(100, 31, 146, 33.5, 0, 18, 21);
    // taxi stand
    for (let i = 0; i < 6; i++) lcar(102 + i * 6.2, 42.6, 0, FACE['-u'], 'taxi');
    lbox(104, 45.6, 0, 0.15, 0.15, 2.6, 0x555555, { solid: false });
    lsign(['택시 승강장', 'TAXI'], 104, 45.6, 2.9, 1.6, 0.6, '-v', { bg: '#f2a33a', fg: '#111', twoSided: true });
    lzone('택시 승강장', '1F', '하차장 앞 (위치 추정)', 98, 40, 146, 46, 0, 5, 4);
    // waiting buses in the yard lots
    const lot1 = [86.1, 50, 144.8, 134.6];
    lzone('고속버스 대기장 (서측)', '1F', '출발 대기 버스', ...lot1, 0, 6, 2);
    for (let u = 92; u < 144; u += 3.6) for (const v of [58, 74, 96, 112]) if (rnd() < 0.75) lcar(u, v, 0, FACE['-v'], 'bus', { label: pick(['부산', '대구', '대전', '광주', '천안', '강릉', '청주', '원주']), color: pick(busCols) });
    for (let u = 90; u < 144; u += 3.6) for (const v of [65.6, 103.6]) lquadH(u - 0.06, v - 6, u + 0.06, v + 6, 0.03, { tex: 'emit', color: 0xeeeeee });
    const lot2 = [203.4, 48.8, 349, 118];
    lzone('고속버스 대기장 (동측)', '1F', '출발 대기 버스 · 영동선', ...lot2, 0, 6, 2);
    for (let u = 210; u < 345; u += 3.6) for (const v of [60, 80, 104]) if (rnd() < 0.6) lcar(u, v, 0, FACE['-v'] + (v === 80 ? PI : 0), 'bus', { label: pick(['속초', '강릉', '원주', '춘천', '동해', '삼척', '이천', '여주']), color: pick(busCols) });

    // ---- 경부선 주차장 deck (356129682) at 2F level y=6
    const deck = (K.osmBuilding(356129682)[0] || {}).poly || rect(147.6, 30, 199, 140);
    const dy = 6;
    K.slab(deck, dy, { mat: { tex: 'asphalt', color: 0xa8a6a2 }, under: { tex: 'concrete', color: 0xb7b3ab }, thick: 0.45 });
    // parapets: skip the side touching the building (v<=31) and the ramp/bridge openings
    {
      const ns = K.orient(deck);
      for (let i = 0; i < deck.length; i++) {
        const a = deck[i], b = deck[(i + 1) % deck.length];
        const la = toL(a[0], a[1]), lb = toL(b[0], b[1]);
        if (la[1] < 31 && lb[1] < 31) continue;
        const ops = [];
        const L = Math.hypot(b[0] - a[0], b[1] - a[1]);
        // ramp opening on the east edge near v=131, bridge opening on the south edge
        if (Math.abs(la[0] - 199) < 1 && Math.abs(lb[0] - 199) < 1) { const t = (131 - la[1]) / (lb[1] - la[1]); ops.push({ at: t * L, w: 8, y0: dy, y1: dy + 1.2 }); }
        if (la[1] > 139 && lb[1] > 139) { const t = (172 - la[0]) / (lb[0] - la[0]); ops.push({ at: t * L, w: 40, y0: dy, y1: dy + 1.2 }); }
        K.wall(a[0] - ns[i][0] * 0.12, a[1] - ns[i][1] * 0.12, b[0] - ns[i][0] * 0.12, b[1] - ns[i][1] * 0.12, dy, dy + 1.1, { mat: 0xc8c2b6, thick: 0.25, openings: ops });
      }
    }
    // deck columns (buses run below)
    for (let u = 152; u < 197; u += 11) for (let v = 50; v < 139; v += 11) lcyl(u, v, 0, 0.45, 5.55, 0xc8c3b8, { seg: 10 });
    // underside lights
    for (let u = 152; u < 197; u += 6) for (let v = 34; v < 138; v += 8) lquadDown(u - 1, v - 0.25, u + 1, v + 0.25, dy - 0.47, { tex: 'emit', color: 0xfff3dc });
    // pavilion under the deck (restaurants: OSM POIs)
    {
      const r = [158, 64, 184, 98];
      rbox(r[0], r[1], r[2], r[3], 0, 4.4, { tex: 'shop', color: 0xe8e2d6 }, { floorH: 4.4, top: 0x8a8680 });
      const shopsS = [['세븐일레븐', '+v', 166, 0x008061], ['타코벨 서울고속터미널점', '-v', 174, 0x702082], ['펀비어킹 고속터미널점', '-v', 164, 0xd4a017], ['남도일번지 전주콩나물 감자탕', '+u', 86, 0x8b1a1a], ['dolly 9 달리 9', '-u', 80, 0x333333]];
      for (const [name, face, at, col] of shopsS) {
        const [du, dv] = FDIR[face];
        const u = du ? (du > 0 ? r[2] : r[0]) : at, v = dv ? (dv > 0 ? r[3] : r[1]) : at;
        lsign(name, u + du * 0.05, v + dv * 0.05, 3.6, 7, 0.75, face, { bg: '#' + col.toString(16).padStart(6, '0'), fg: '#ffffff' });
        lsign('영업중', u + du * 0.05, v + dv * 0.05, 1.6, 1.6, 0.5, face, { bg: '#222', fg: '#ffd27a' });
      }
      lzone('데크 아래 상가', '1F', '세븐일레븐 · 타코벨 · 펀비어킹 · 남도일번지 · 달리 9', r[0], r[1], r[2], r[3] + 4, 0, 5.5, 3);
    }
    lzone('경부선 주차장 (데크)', '2F', '승용차 주차 · 꽃시장 이용객 주차 (유료)', 147.6, 30.3, 199, 140, dy, dy + 5, 3);
    // parked cars on the deck
    for (let v = 36; v < 138; v += 2.6) for (const u of [152.5, 165, 181, 194]) { if (rnd() < 0.45) lcar(u, v, dy, FACE[u < 170 ? '+u' : '-u']); lquadH(u - 2.6, v - 1.3 - 0.05, u + 2.6, v - 1.3 + 0.05, dy + 0.01, { tex: 'emit', color: 0xdcdcdc }); }
    lsign(['P 경부선 주차장', '꽃시장 · 터미널 2F 연결'], 173, 139, 8.4, 6, 1.2, '-v', { bg: '#1b4f9c', fg: '#fff', twoSided: true });
    lbox(173, 139, dy, 0.2, 0.2, 2.4, 0x555555, { solid: false });

    // ramp: deck (east edge) -> ground, along OSM road 715692653
    {
      const rw = 7.5;
      lramp(199.3, 131, 292, 126.5, { w: rw, ya: dy, yb: 0, mat: { tex: 'asphalt', color: 0x8f8d88 }, railMat: 0xc8c2b6 });
      for (let t = 0.12; t < 0.95; t += 0.16) { const u = 199.3 + (292 - 199.3) * t, v = 131 + (126.5 - 131) * t, h = dy * (1 - t) - 0.3; if (h > 0.5) lbox(u, v, 0, 1.2, 0.6, h, 0xc8c3b8); }
      // side parapets
      const [ax, az] = W(199.3, 131), [bx, bz] = W(292, 126.5);
      const L = Math.hypot(bx - ax, bz - az), nx = -(bz - az) / L, nz = (bx - ax) / L;
      for (const sg of [1, -1]) {
        const ox = nx * sg * (rw / 2 + 0.12), oz = nz * sg * (rw / 2 + 0.12);
        K.quad(0xc8c2b6, [[ax + ox, dy, az + oz], [bx + ox, 0, bz + oz], [bx + ox, 1.0, bz + oz], [ax + ox, dy + 1.0, az + oz]], [nx * sg, 0, nz * sg]);
        K.quad(0xc8c2b6, [[bx + ox, 0, bz + oz], [ax + ox, dy, az + oz], [ax + ox, dy + 1.0, az + oz], [bx + ox, 1.0, bz + oz]], [-nx * sg, 0, -nz * sg]);
      }
      lsign(['경부선 주차장 입구', '꽃시장 주차'], 296, 130.6, 3.2, 4.4, 1.0, '+u', { bg: '#1b4f9c', fg: '#fff', twoSided: true });
      lbox(296, 130.6, 0, 0.2, 0.2, 2.6, 0x555555, { solid: false });
      lzone('주차장 진입 램프', '1F', '데크 주차장 ↔ 지상', 199, 122, 292, 135, 0, 8, 2);
    }
    // ---- 356129683: low service building with rooftop parking (same deck level)
    {
      const sb = (K.osmBuilding(356129683)[0] || {}).poly || rect(92, 147, 194, 165);
      K.slab(sb, 0, { mat: { tex: 'tile', color: 0xd0cabe }, under: false, edge: false });
      const dW = W(130, 147.5), dW2 = W(170, 147.5), dW3 = W(110, 147.5);
      K.polyWalls(sb, 0, dy, { mat: { tex: 'shop', color: 0xe2dccf }, inner: 0xeeeae2, thick: 0.3, floorH: dy, openings: [{ x: dW[0], z: dW[1], w: 4, y0: 0, y1: 3 }, { x: dW2[0], z: dW2[1], w: 4, y0: 0, y1: 3 }, { x: dW3[0], z: dW3[1], w: 4, y0: 0, y1: 3 }] });
      K.slab(sb, dy, { mat: { tex: 'asphalt', color: 0xa8a6a2 }, under: 'ceiling', thick: 0.4 });
      K.polyWalls(sb, dy, dy + 1.1, { mat: 0xc8c2b6, thick: 0.25, openings: [{ x: W(172, 147.2)[0], z: W(172, 147.2)[1], w: 40, y0: dy, y1: dy + 1.2 }] });
      // bridge deck -> rooftop
      K.slab(rect(152, 140.5, 192, 147.3), dy, { mat: { tex: 'asphalt', color: 0xa8a6a2 }, under: { tex: 'concrete', color: 0xb7b3ab }, thick: 0.45, edge: false });
      for (let u = 98; u < 190; u += 2.6) if (rnd() < 0.45) lcar(u, 156, dy, FACE[rnd() < 0.5 ? '+v' : '-v']);
      lsign(['고속버스 택배 · 수하물', '운수사 사무실'], 130, 147.3, 4.3, 7, 1.0, '-v', { bg: '#14366e', fg: '#fff' });
      lsign(['화물 접수'], 170, 147.3, 4.3, 4, 0.8, '-v', { bg: '#14366e', fg: '#fff' });
      K.zone({ name: '터미널 부속동 (택배·운수사, 추정)', floor: '1F', sub: '고속버스 택배 · 운수사 사무실 · 옥상 주차', poly: sb, y0: 0, y1: dy, priority: 2 });
      K.zone({ name: '경부선 주차장 (부속동 옥상)', floor: '2F', sub: '옥상 주차', poly: sb, y0: dy, y1: dy + 5, priority: 2 });
      for (let u = 100; u < 192; u += 8) { rbox(u - 2, 152, u + 2, 156, 0, 1.0, 0xc9c2b4); }
    }
    // ---- 1173093435: south pavilion toward 센트럴시티 / 파미에스테이션
    {
      const pv = (K.osmBuilding(1173093435)[0] || {}).poly || rect(29, 161, 46, 177);
      K.slab(pv, 0, { mat: { tex: 'marble', color: 0xe4ddd0 }, under: false, edge: false });
      const dS = W(37.8, 177), dN = W(38.6, 161.2);
      K.polyWalls(pv, 0, 6, { mat: glass, inner: glass, thick: 0.12, openings: [{ x: dS[0], z: dS[1], w: 4, y0: 0, y1: 3 }, { x: dN[0], z: dN[1], w: 6, y0: 0, y1: 3 }] });
      K.slab(pv, 6, { mat: { tex: 'roofgravel', color: 0xbdb8ae }, under: 'ceiling', thick: 0.4 });
      K.polyWalls(pv, 6, 6.8, { mat: beigeD, thick: 0.25 });
      lsign(['서울고속버스터미널', '경부 · 영동선'], 37.8, 177.4, 4.8, 8, 1.4, '+v', { bg: '#14366e', fg: '#fff' });
      K.zone({ name: '남측 출입구 (센트럴시티·파미에스테이션 방면)', floor: '1F', sub: '호남선·신세계 방면 연결', poly: pv, y0: 0, y1: 6, priority: 3 });
    }
    lcrowd(76, 26, 91, 152, 0, 20, 22);
    lcrowd(100, 32, 316, 45, 0, 40, 23);
  }

  function build2F() {
    const y = 6;
    floorZones('2F', y, 11, '경부선 주차장 2F (북측 동)', '경부선 주차장 2F (서측 동)', '승용차 주차 (옛 승차장 층 · 추정)');
    // parking sectors (map detail)
    for (const [n, r] of [['A', [76, 0, 150, 30]], ['B', [150, 0, 230, 30]], ['C', [230, 0, 316, 30]], ['D', [0, 22, 75, 90]], ['E', [0, 90, 75, 158]]]) {
      lzone(`2F 주차 ${n}구역`, '2F', '승용차 주차면', ...r, y, 11, 2);
      const [cu, cv] = [(r[0] + r[2]) / 2, (r[1] + r[3]) / 2];
      lsign([`P 2F-${n}`], cu, cv, y + 3.6, 1.6, 0.8, r[1] === 0 ? '+v' : '+u', { bg: FCOL['2F'], fg: '#fff', twoSided: true });
    }
    columns(y, 4.65, 0, colTex('2F', 4.65, '#d9d4ca'));
    lights(10.62, 9, 9);
    const line = { tex: 'emit', color: 0xdedede };
    // long bar: two rows of stalls along the walls, aisle in the middle
    for (let u = 80; u < 315; u += 2.6) {
      if (excl.some(r => r[0] < u + 1.5 && r[2] > u - 1.5 && r[1] < 9)) continue;
      if (u > 145 && u < 201) { /* deck opening on the south side */ }
      lquadH(u - 0.05, 0.6, u + 0.05, 5.6, y + 0.01, line);
      if (rnd() < 0.38) lcar(u + 1.3, 3.1, y, FACE['+v']);
      if (!(u > 145 && u < 201)) { lquadH(u - 0.05, 24.6, u + 0.05, 29.6, y + 0.01, line); if (rnd() < 0.38) lcar(u + 1.3, 27.1, y, FACE['-v']); }
    }
    // west arm: rows along v against both walls
    for (let v = 24; v < 150; v += 2.6) {
      if (ESC.some(e => inR(e.r, 21, v, 2)) || ESC.some(e => inR(e.r, 58, v, 2))) { /* keep escalator surroundings clear */ }
      lquadH(0.6, v - 0.05, 5.6, v + 0.05, y + 0.01, line);
      if (rnd() < 0.35) lcar(3.1, v + 1.3, y, FACE['+u']);
      if (!(v > 101 && v < 139)) { lquadH(69.6, v - 0.05, 74.6, v + 0.05, y + 0.01, line); if (rnd() < 0.35) lcar(72.1, v + 1.3, y, FACE['-u']); }
      if (!(v > 54 && v < 82)) { lquadH(29, v - 0.05, 34, v + 0.05, y + 0.01, line); if (rnd() < 0.28) lcar(31.5, v + 1.3, y, FACE['+u']); lquadH(36, v - 0.05, 41, v + 0.05, y + 0.01, line); if (rnd() < 0.28) lcar(38.5, v + 1.3, y, FACE['-u']); }
    }
    // aisle arrows / signs
    for (const u of [100, 180, 260]) lfloorText('→ 출구', u, 15, y + 0.02, 4, 1.2, '+v', { fg: '#ffffff' });
    lsign(['P 2F', '경부선 주차장'], 47, 13, 9.2, 3.2, 1.0, '+v', { bg: '#1b4f9c', fg: '#fff' });
    lsign(['꽃시장 3F ↑ 에스컬레이터'], 21.4, 69.6, 9.5, 3.6, 0.6, '+v', { bg: '#2f7d3a', fg: '#fff', twoSided: true });
    lsign(['꽃시장 3F ↑'], 58.4, 115.6, 9.5, 2.8, 0.6, '+v', { bg: '#2f7d3a', fg: '#fff', twoSided: true });
    lsign(['데크 주차장 →'], 173, 22, 9.5, 4, 0.7, '+v', { bg: '#1b4f9c', fg: '#fff', twoSided: true });
    lsign(['정산소 · 출차'], 300, 15, 9.2, 3.2, 0.7, '+v', { bg: '#1b4f9c', fg: '#fff', twoSided: true });
    rbox(296, 12, 302, 16, y, 2.6, 0xd8d4cc);
    lzone('주차 정산소', '2F', '출차 정산 (추정)', 294, 10, 304, 18, y, 11, 3);
    lcrowd(10, 14, 60, 22, y, 8, 31);
  }

  function build3F() {
    const y = 11, H = 5;
    floorZones('3F', y, y + H, '경부선 터미널 3F (북측 동)', '고속터미널 꽃도매상가', '꽃시장 부자재 · 꽃시장 주차장', '생화 23:30~12:00 · 조화 24:00~18:00 · 일요일 휴무');
    // aisle blocks (map detail): fresh-flower 가동 split by the cross aisles, artificial 다동, materials 나동
    for (const [n, sub, r] of [
      ['생화 가동 1구역', '장미 · 카네이션 · 국화', [0, 22, 75, 61]], ['생화 가동 2구역', '수국 · 튤립 · 프리지아 · 거베라', [0, 65.5, 75, 99]],
      ['생화 가동 3구역', '안개꽃 · 리시안셔스 · 유칼립투스', [0, 103.5, 75, 112]], ['조화 다동 1구역', '조화 · 꽃바구니', [0, 112, 75, 135]],
      ['조화 · 화분 다동 2구역', '화분 · 꽃병 · 프리저브드', [0, 139.5, 75, 158]], ['부자재 나동 1구역', '리본 · 포장지 · 비닐', [76, 0, 111, 24]],
      ['부자재 나동 2구역', '화기 · 바구니 · 플로랄폼', [113, 0, 147.5, 24]],
    ]) lzone(n, '3F', sub, ...r, y, y + H, 3);
    for (const [v0, v1] of [[61, 65.5], [99, 103.5], [135, 139.5]]) lzone('꽃시장 통로', '3F', '생화·조화 구역 사이 횡단 통로', 0, v0, 75, v1, y, y + H, 3);
    lzone('생화 도매 구역', '3F', '장미 · 백합 · 수국 · 튤립 · 카네이션 · 안개꽃 (23:30~12:00)', 0, 22, 75, 112, y, y + H, 3);
    lzone('조화 · 화분 구역', '3F', '조화 · 화분 · 꽃병 · 인테리어 소품 (24:00~18:00)', 0, 112, 75, 158, y, y + H, 3);
    lzone('부자재 · 포장재 구역', '3F', '리본 · 포장지 · 바구니 · 화기 · 플로랄폼', 0, 0, 148, 22, y, y + H, 3);
    lzone('경부선 주차장 3F', '3F', '꽃시장 직결 주차 (추정)', 150, 0, 317, 30.3, y, y + H, 3);
    // wall between market and 3F parking at u≈148 with doors
    lwall(148, 0.4, 148, 30, y, y + H - 0.35, { mat: 0xdcd6ca, thick: 0.25, openings: [{ at: 14, w: 3.4, y0: y, y1: y + 2.8 }, { at: 24, w: 3.4, y0: y, y1: y + 2.8 }] });
    lsign(['꽃시장 주차장 ↔'], 147.8, 19, y + 3.4, 3, 0.6, '-u', { bg: '#1b4f9c', fg: '#fff' });
    columns(y, 4.65, 0, colTex('3F', 4.65));
    // bright market lights (bare bulbs / fluorescents)
    lights(15.62, 4.5, 4.5, (u, v) => u > 148, { tex: 'emit', color: 0xfff8e8 });
    lights(15.62, 9, 9, (u, v) => u < 148);
    // stalls
    const exclM = [...excl.map(r => [r[0] - 1.2, r[1] - 1.2, r[2] + 1.2, r[3] + 1.2]), [17, 56, 26, 82], [54, 102, 63, 128], [42, 6, 51, 14], [30, 0, 44, 13], [123, 0, 129, 11], [58, 133, 66, 143], [50, 120, 58, 127]];
    const aisles = [[61, 65.5], [99, 103.5], [135, 139.5]];
    const flowerCols = [0xe8364f, 0xf7c6d0, 0xffffff, 0xf5d000, 0xff8c2b, 0xb04bd1, 0xff5fa2, 0xfbe3a4, 0xd81b60, 0x8fd3ff, 0xc8102e, 0xf9f1dc];
    const names = ['장미', '백합', '수국', '튤립', '카네이션', '프리지아', '안개꽃', '국화', '거베라', '작약', '라넌큘러스', '리시안셔스', '스타티스', '유칼립투스', '호접란', '해바라기'];
    const fakeNames = ['조화', '조화 · 꽃바구니', '화분', '꽃병 · 화기', '인테리어 소품', '드라이플라워', '프리저브드'];
    const subNames = ['리본 · 포장지', '부자재', '꽃바구니', '플로랄폼', '화기', '포장 비닐', '장식재료'];
    let stallNo = 0;
    function stall(u0, v0, u1, v1, face, zoneKind) {
      const r = [Math.min(u0, u1), Math.min(v0, v1), Math.max(u0, u1), Math.max(v0, v1)];
      if (exclM.some(e => overl(e, r))) return;
      stallNo++;
      const [du, dv] = FDIR[face];
      const cu = (r[0] + r[2]) / 2, cv = (r[1] + r[3]) / 2;
      const along = du !== 0 ? r[3] - r[1] : r[2] - r[0];
      const depth = du !== 0 ? r[2] - r[0] : r[3] - r[1];
      // back stand (tiered) + front buckets
      const back = (t) => [cu - du * depth * (0.5 - t), cv - dv * depth * (0.5 - t)];
      const [bu, bv] = back(0.2);
      const bw = du !== 0 ? depth * 0.4 : along - 0.2, bd = du !== 0 ? along - 0.2 : depth * 0.4;
      if (zoneKind === 'fresh') {
        // tiered back stand covered in bunches
        lbox(bu, bv, y, bw, bd, 0.95, 0x4a4a48, { solid: true, skip: ['bottom'] });
        lbox(bu, bv, y + 0.95, bw * 0.96, bd * 0.96, 0.38, { tex: 'gb_flowerbin' }, { solid: false, skip: ['bottom'] });
        const [mu, mv] = back(0.5);
        lbox(mu, mv, y, du !== 0 ? depth * 0.22 : along - 0.3, du !== 0 ? along - 0.3 : depth * 0.22, 0.5, 0x3a3a38, { solid: false, skip: ['bottom'] });
        lbox(mu, mv, y + 0.5, du !== 0 ? depth * 0.21 : along - 0.35, du !== 0 ? along - 0.35 : depth * 0.21, 0.32, { tex: 'gb_flowerbin' }, { solid: false, skip: ['bottom'] });
        // front buckets on the floor, each with a bunch of one colour
        const [fu, fv] = back(0.8);
        const nb = Math.max(2, Math.floor((along - 0.3) / 0.62));
        for (let k = 0; k < nb; k++) {
          const s = ((k + 0.5) / nb - 0.5) * (along - 0.4);
          const pu = fu + (du === 0 ? s : 0), pv = fv + (dv === 0 ? s : 0);
          lcyl(pu, pv, y, 0.22, 0.42, 0x23272b, { seg: 5, caps: false, solid: false });
          const c = pick(flowerCols), hb = 0.12 + rnd() * 0.22;
          lbox(pu, pv, y + 0.42, 0.4, 0.4, hb, 0x3f7a32, { solid: false, skip: ['bottom', 'top'] });
          lbox(pu, pv, y + 0.42 + hb, 0.48, 0.48, 0.2, c, { solid: false, skip: ['bottom'] });
          if (k % 2 === 0) lbox(pu + 0.08, pv - 0.06, y + 0.62 + hb, 0.24, 0.24, 0.001, pick(flowerCols), { solid: false, skip: ['bottom', 'n', 's', 'e', 'w'] });
        }
        if (stallNo % 3 === 0) { const [tu, tv] = back(0.62); lbox(tu, tv, y, 0.6, 0.6, 0.04, 0xd8d0b8, { solid: false }); }
      } else if (zoneKind === 'fake') {
        lbox(bu, bv, y, bw, bd, 2.0, 0xf2efe8, { side: { tex: 'gb_flowerbin' }, solid: true, skip: ['bottom'] });
        const [fu, fv] = back(0.7);
        lbox(fu, fv, y, du !== 0 ? depth * 0.35 : along - 0.4, du !== 0 ? along - 0.4 : depth * 0.35, 0.8, 0xe6dfd2, { solid: false, skip: ['bottom'] });
        lbox(fu, fv, y + 0.8, du !== 0 ? depth * 0.3 : along - 0.6, du !== 0 ? along - 0.6 : depth * 0.3, 0.35, pick(flowerCols), { solid: false, skip: ['bottom'] });
      } else {
        lbox(bu, bv, y, bw, bd, 2.0, 0xf2efe8, { side: { tex: 'gb_rolls' }, solid: true, skip: ['bottom'] });
        const [fu, fv] = back(0.72);
        lbox(fu, fv, y, du !== 0 ? depth * 0.32 : along - 0.4, du !== 0 ? along - 0.4 : depth * 0.32, 0.85, 0xc9a26b, { solid: false, skip: ['bottom'] });
      }
      // stall sign above the front edge
      const fe = [cu + du * depth * 0.5, cv + dv * depth * 0.5];
      const label = zoneKind === 'fresh' ? names[stallNo % names.length] : zoneKind === 'fake' ? fakeNames[stallNo % fakeNames.length] : subNames[stallNo % subNames.length];
      if (stallNo % 2 === 0) lsign([`${zoneKind === 'sub' ? '나' : zoneKind === 'fake' ? '다' : '가'}-${stallNo}  ${label}`], fe[0] - du * 0.05, fe[1] - dv * 0.05, y + 2.45, Math.min(2.2, along - 0.3), 0.3, face, { bg: zoneKind === 'fresh' ? '#2f7d3a' : zoneKind === 'fake' ? '#8a3b6b' : '#7a5a2a', fg: '#ffffff', pxPerM: 64 });
    }
    // west arm: rows parallel to v
    const blocks = [[0.5, 3.1, 'single+'], [5.6, 10.8], [13.4, 18.6], [21.2, 26.4], [29, 34.2], [36.8, 42], [44.6, 49.8], [52.4, 57.6], [60.2, 65.4], [68, 70.6, 'single-']];
    const sw = 3.4;
    for (const b of blocks) {
      const [ua, ub, kind] = b;
      for (let v = 23; v + sw < 156; v += sw) {
        if (aisles.some(([a, b]) => v < b && v + sw > a)) continue; // cross aisles
        const zk = v < 112 ? 'fresh' : 'fake';
        const [px, pz] = W(ub, v + sw), [qx, qz] = W(ua, v + sw);
        if (!K.pointInPoly(px, pz, POLY) || !K.pointInPoly(qx, qz, POLY)) continue;
        if (kind === 'single+') stall(ua, v, ub, v + sw - 0.15, '+u', zk);
        else if (kind === 'single-') stall(ua, v, ub, v + sw - 0.15, '-u', zk);
        else { const mid = (ua + ub) / 2; stall(ua, v, mid, v + sw - 0.15, '-u', zk); stall(mid, v, ub, v + sw - 0.15, '+u', zk); }
      }
    }
    // long bar (u 52..147): rows parallel to u (부자재)
    const rowsV = [[0.5, 3.1, 'single+'], [5.6, 10.8], [13.4, 18.6], [21.2, 23.6, 'single-']];
    for (const [va, vb, kind] of rowsV) {
      for (let u = 76; u + sw < 147; u += sw) {
        if (u > 110 && u < 114) continue;
        if (kind === 'single+') stall(u, va, u + sw - 0.15, vb, '+v', 'sub');
        else if (kind === 'single-') stall(u, va, u + sw - 0.15, vb, '-v', 'sub');
        else { const mid = (va + vb) / 2; stall(u, va, u + sw - 0.15, mid, '-v', 'sub'); stall(u, mid, u + sw - 0.15, vb, '+v', 'sub'); }
      }
    }
    // market signage
    lsign(['고속터미널 꽃도매상가'], 21.4, 80, y + 3.9, 7, 1.0, '+v', { bg: '#2f7d3a', fg: '#ffffff', twoSided: true });
    lsign(['생화 도매 23:30 ~ 익일 12:00', '조화 24:00 ~ 익일 18:00 · 일요일 휴무'], 30, 55.5, y + 3.6, 6, 1.2, '-v', { bg: '#ffffff', fg: '#2f7d3a', twoSided: true });
    for (const [u, v, t, c] of [[37, 40, '생화', '#2f7d3a'], [37, 85, '생화', '#2f7d3a'], [37, 125, '조화 · 화분', '#8a3b6b'], [100, 12, '부자재 · 포장재', '#7a5a2a']]) lsign([t], u, v, y + 4.1, 5, 0.9, '+v', { bg: c, fg: '#fff', twoSided: true });
    // a few people sleeping/sitting (상인 쪽잠) + shoppers
    lcrowd(4, 23, 73, 150, y, 110, 41);
    lcrowd(76, 3, 146, 28, y, 30, 42);
    for (let i = 0; i < 24; i++) { const pu = [4.3, 12.1, 19.9, 27.7, 35.5, 43.3, 51.1, 58.9, 66.7][i % 9]; lperson(pu, 24 + rnd() * 125, y, { sit: true }); }
    // 3F parking in the long bar (u 150..317)
    const line = { tex: 'emit', color: 0xdedede };
    for (let u = 156; u < 315; u += 2.6) {
      if (excl.some(r => r[0] < u + 1.5 && r[2] > u - 1.5 && r[1] < 9)) continue;
      if (!(u > 224 && u < 270)) { lquadH(u - 0.05, 0.6, u + 0.05, 5.6, y + 0.01, line); if (rnd() < 0.38) lcar(u + 1.3, 3.1, y, FACE['+v']); }
      lquadH(u - 0.05, 24.6, u + 0.05, 29.6, y + 0.01, line); if (rnd() < 0.4) lcar(u + 1.3, 27.1, y, FACE['-v']);
    }
    lsign(['P 3F 꽃시장 주차장'], 200, 14, y + 4.0, 4.4, 0.8, '+v', { bg: '#1b4f9c', fg: '#fff', twoSided: true });
  }
  void lperson;

  // ================================================================= 4F..9F office floors
  // Shell shared by every upper floor: central lift lobby (S1 + EL1/EL2), long-bar corridor v 12.6..17.4,
  // west-arm corridor u 33.6..38.4. Each floor has its own room plan, finish, accent colour and floor-number
  // columns, so floors read differently. Only 5F (신세계백화점 본사) is sourced; the others are 추정.
  function buildOffices() {
    const N_END = 12.6, S_START = 17.4, WC0 = 33.6, WC1 = 38.4;
    const sEnd = (u0) => (u0 < 97 ? 22 : 29.8);
    // room plans: N/S = long bar [u0,u1,type,label], WW/WE = west arm [v0,v1,type,label], C = NW corner room
    const PLAN = {
      '4F': {
        title: '터미널 운영·관리', sub: '운영 사무실 (추정)',
        N: [[56, 92, 'control', '종합상황실 (CCTV)'], [92, 128, 'office', '운송관리팀'], [128, 146, 'machine', '통신·전산실'], [146, 164, 'meeting', '회의실'], [164, 200, 'office', '시설관리팀'], [200, 236, 'office', '안전관리팀'], [236, 248.3, 'pantry', '탕비실'], [256, 268, 'archive', '문서고'], [281, 316.4, 'control', '방재센터']],
        S: [[56, 97.5, 'meeting', '소회의실'], [97.5, 128, 'office', '고객지원팀'], [128, 164, 'office', '영업·임대관리팀'], [164, 200, 'storage', '분실물 보관창고'], [200, 236, 'lounge', '직원 휴게실'], [236, 272, 'storage', '시설 자재창고'], [272, 316.4, 'office', '협력업체 사무실']],
        C: ['exec', '대표이사실 · 임원실'],
        WW: [[22, 58, 'office', '경영지원팀'], [58, 94, 'office', '재무·회계팀'], [94, 130, 'office', '인사·총무팀'], [130, 152, 'meeting', '대회의실']],
        WE: [[22, 58, 'meeting', '접견실'], [58, 94, 'office', 'IT 운영팀'], [94, 124, 'office', '시설 설계실'], [124, 152, 'storage', '비품 창고']],
      },
      '5F': {
        title: '신세계백화점 본사', sub: '본사 (구 웨딩홀)',
        N: [[56, 92, 'office', '본사 사무실 1'], [92, 128, 'office', '본사 사무실 2'], [128, 146, 'meeting', '회의실 A'], [146, 164, 'meeting', '회의실 B'], [164, 200, 'office', '본사 사무실 3'], [200, 236, 'office', '본사 사무실 4'], [236, 248.3, 'pantry', '탕비실'], [256, 268, 'archive', '문서실'], [281, 316.4, 'office', '본사 사무실 5']],
        S: [[56, 97.5, 'pantry', '라운지 카페'], [97.5, 128, 'meeting', '대회의실'], [128, 164, 'office', '본사 사무실 6'], [164, 200, 'office', '본사 사무실 7'], [200, 236, 'meeting', '교육장'], [236, 272, 'office', '본사 사무실 8'], [272, 316.4, 'storage', '샘플 보관실']],
        C: ['exec', '임원실'],
        WW: [[22, 58, 'exec', '임원 회의실'], [58, 94, 'office', '본사 사무실 9'], [94, 130, 'office', '본사 사무실 10'], [130, 152, 'meeting', '회의실 C']],
        WE: [[22, 58, 'lounge', '직원 라운지'], [58, 94, 'office', '본사 사무실 11'], [94, 124, 'office', '본사 사무실 12'], [124, 152, 'storage', '비품 창고']],
      },
      '6F': {
        title: '운수사 사무실 · 승무원 휴게', sub: '운수사 · 승무원 (추정)',
        N: [[56, 74, 'office', '금호고속'], [74, 92, 'office', '동양고속'], [92, 110, 'office', '중앙고속'], [110, 128, 'office', '속리산고속'], [128, 146, 'office', '천일고속'], [146, 164, 'office', '한일고속'], [164, 182, 'office', '동부고속'], [182, 200, 'office', '삼화고속'], [200, 218, 'office', '대원고속'], [218, 236, 'office', '코리아와이드'], [236, 248.3, 'pantry', '탕비실'], [256, 268, 'shower', '샤워실'], [281, 316.4, 'dispatch', '배차실 (경부·영동선)']],
        S: [[56, 97.5, 'meeting', '운수사 공동 회의실'], [97.5, 146, 'lounge', '승무원 휴게실 1'], [146, 182, 'sleep', '승무원 수면실'], [182, 218, 'lounge', '승무원 휴게실 2'], [218, 254, 'meeting', '안전교육장'], [254, 290, 'storage', '유니폼 · 비품 창고'], [290, 316.4, 'office', '차량 정비 관리']],
        C: ['dispatch', '고속버스 운행관리실'],
        WW: [[22, 58, 'lounge', '승무원 대기실'], [58, 94, 'office', '운수사 정산실'], [94, 130, 'office', '고속버스 택배 사무실'], [130, 152, 'sleep', '승무원 수면실 2']],
        WE: [[22, 58, 'meeting', '노사 협의실'], [58, 94, 'office', '예매 고객센터'], [94, 124, 'storage', '분실물 접수 · 보관'], [124, 152, 'shower', '샤워실 · 탈의실']],
      },
      '7F': {
        title: '창고 · 문서고', sub: '창고 (추정)', open: true,
        N: [[56, 128, 'racks', '문서 보존 서고'], [128, 200, 'racks', '물품 창고 A'], [200, 268, 'racks', '물품 창고 B'], [281, 316.4, 'pallets', '자재 하역장']],
        S: [[56, 97.5, 'pallets', '하역 대기'], [97.5, 200, 'racks', '물품 창고 C'], [200, 316.4, 'pallets', '물품 적치장']],
        C: ['office', '창고 관리 사무실'],
        WW: [[22, 76, 'racks', '비품 창고'], [76, 124, 'racks', '폐기 문서 보관'], [124, 152, 'pallets', '시설 자재']],
        WE: [[22, 76, 'racks', '물품 창고 D'], [76, 124, 'pallets', '적치장'], [124, 152, 'racks', '자재 창고']],
      },
      '8F': {
        title: '임대 사무실 · 공실', sub: '임대 · 공실 (추정)',
        N: [[56, 128, 'vacant', '공실 (임대 문의)'], [128, 164, 'vacant', '공실'], [164, 200, 'office', '입주사 사무실 A'], [200, 236, 'office', '입주사 사무실 B'], [236, 248.3, 'pantry', '공용 탕비실'], [256, 268, 'storage', '공용 창고'], [281, 316.4, 'office', '입주사 사무실 C']],
        S: [[56, 97.5, 'vacant', '공실'], [97.5, 164, 'vacant', '공실 (임대 문의)'], [164, 236, 'office', '입주사 사무실 D'], [236, 272, 'meeting', '공용 회의실'], [272, 316.4, 'office', '입주사 사무실 E']],
        C: ['vacant', '공실'],
        WW: [[22, 94, 'vacant', '공실 (임대 문의)'], [94, 152, 'office', '입주사 사무실 F']],
        WE: [[22, 94, 'vacant', '공실'], [94, 152, 'storage', '공용 창고']],
      },
      '9F': {
        title: '구내식당 · 기계실', sub: '식당 · 설비 (추정)',
        N: [[56, 128, 'machine', '공조 기계실'], [128, 164, 'machine', '전기실 · 수변전 설비'], [164, 236, 'machine', '공조 기계실 2'], [236, 248.3, 'storage', '설비 창고'], [256, 268, 'machine', '승강기 기계실'], [281, 316.4, 'machine', '소방 펌프실']],
        S: [[56, 97.5, 'storage', '식자재 창고'], [97.5, 164, 'machine', '냉동기실'], [164, 236, 'storage', '설비 자재 창고'], [236, 316.4, 'machine', '배전반실']],
        C: ['lounge', '직원 휴게 라운지'],
        WFULL: [[22, 112, 'canteen', '직원식당 (구내식당)'], [112, 152, 'kitchen', '조리실 · 배식대']],
      },
    };
    const TYPE_SUB = {
      office: '사무실', meeting: '회의실', exec: '임원실', control: '상황실 · 모니터링', lounge: '휴게실', sleep: '수면실', dispatch: '배차 · 운행관리',
      storage: '창고', archive: '문서 보관', pantry: '탕비실', shower: '샤워실', machine: '설비실 (관계자 외 출입금지)', vacant: '공실 · 임대 문의',
      canteen: '직원식당', kitchen: '조리실', racks: '랙 창고', pallets: '팔레트 적치장',
    };
    const hexN = (h) => parseInt(h.slice(1), 16);
    for (const f of FL.filter(f => PLAN[f.k])) officeFloor(f, PLAN[f.k]);

    function officeFloor(f, plan) {
      const k = f.k, y = f.y, top = y + f.h - 0.37, acc = FCOL[k], accN = hexN(acc);
      const fnum = k.replace('F', '');
      let roomNo = 0;
      const wm = { mat: k === '7F' ? 0xcfcac0 : 0xebe6dc, thick: 0.15 };
      floorZones(k, y, y + f.h, `${k} ${plan.title} (북측 동)`, `${k} ${plan.title} (서측 동)`, plan.sub);
      const vacant = [];
      const all = [];
      for (const r of plan.N) all.push({ u0: r[0], v0: 0.4, u1: r[1], v1: N_END, type: r[2], label: r[3], face: '+v' });
      for (const r of plan.S) all.push({ u0: r[0], v0: S_START, u1: r[1], v1: sEnd(r[0]), type: r[2], label: r[3], face: '-v' });
      for (const r of plan.WW || []) all.push({ u0: 0.4, v0: r[0], u1: WC0, v1: r[1], type: r[2], label: r[3], face: '+u' });
      for (const r of plan.WE || []) all.push({ u0: WC1, v0: r[0], u1: 74.6, v1: r[1], type: r[2], label: r[3], face: '-u' });
      for (const r of plan.WFULL || []) all.push({ u0: 0.4, v0: r[0], u1: 74.6, v1: r[1], type: r[2], label: r[3], face: '+v', full: true });
      if (plan.C) all.push({ u0: 0.4, v0: 0.4, u1: WC0, v1: 22, type: plan.C[0], label: plan.C[1], face: '+u', corner: true });
      for (const r of all) if (r.type === 'vacant') vacant.push([r.u0, r.v0, r.u1, r.v1]);

      // columns with the floor number band, ceiling lights (none over bare vacant space, sparse on 7F)
      columns(y, top - y, 0, colTex(k, top - y));
      const step = plan.open ? 9 : 6;
      lights(top - 0.02, step, step, (u, v) => vacant.some(r => inR(r, u, v)));
      // corridor accent stripe + lobby floor
      if (!plan.open) {
        lquadH(56, 14.85, 316, 15.15, y + 0.012, accN);
        if (!plan.WFULL) lquadH(35.85, 22, 36.15, 152, y + 0.012, accN);
      } else {
        // 7F: painted forklift lanes instead of corridors
        lquadH(56, 12.9, 316, 13.05, y + 0.012, 0xe2b007); lquadH(56, 16.95, 316, 17.1, y + 0.012, 0xe2b007);
        lquadH(33.7, 22, 33.85, 152, y + 0.012, 0xe2b007); lquadH(38.15, 22, 38.3, 152, y + 0.012, 0xe2b007);
      }
      lquadH(33.6, 10.3, 56, 22, y + 0.011, { tex: 'marble', color: 0xe4ddd0 });

      // ---- partitions + corridor walls (not on the open-plan floor)
      const doorsN = [], doorsS = [], doorsWW = [], doorsWE = [];
      for (const r of all) {
        if (plan.open && !r.corner) continue;
        const len = (r.face === '+v' || r.face === '-v') ? r.u1 - r.u0 : r.v1 - r.v0;
        const a0 = (r.face === '+v' || r.face === '-v') ? r.u0 : r.v0;
        r.doors = len > 20 ? [a0 + 3, a0 + len - 3] : [a0 + Math.min(3, len / 2)];
        if (r.corner) continue;
        if (r.full) continue;
        (r.face === '+v' ? doorsN : r.face === '-v' ? doorsS : r.face === '+u' ? doorsWW : doorsWE).push(...r.doors);
      }
      const ops = (list, a) => list.map(d => ({ at: d - a, w: 1.6, y0: y, y1: y + 2.3 }));
      if (!plan.open) {
        const segN = [[56, 248.3], [256, 268], [281, 316.4]];
        for (const [a, b] of segN) lwall(a, N_END, b, N_END, y, top, { ...wm, openings: ops(doorsN.filter(d => d > a && d < b), a) });
        const sMin = Math.min(...plan.S.map(r => r[0])), sMax = Math.max(...plan.S.map(r => r[1]));
        if (plan.S.length) lwall(sMin, S_START, sMax, S_START, y, top, { ...wm, openings: ops(doorsS, sMin) });
        if (!plan.WFULL) {
          lwall(WC0, 22, WC0, 152, y, top, { ...wm, openings: ops(doorsWW, 22) });
          lwall(WC1, 22, WC1, 152, y, top, { ...wm, openings: ops(doorsWE, 22) });
        }
        // boundaries between rooms
        const bN = new Set(), bS = new Set(), bWW = new Set(), bWE = new Set();
        for (const r of plan.N) { bN.add(r[0]); bN.add(r[1]); }
        for (const r of plan.S) { bS.add(r[0]); bS.add(r[1]); }
        for (const r of plan.WW || []) { bWW.add(r[0]); bWW.add(r[1]); }
        for (const r of plan.WE || []) { bWE.add(r[0]); bWE.add(r[1]); }
        for (const r of plan.WFULL || []) { bWW.add(r[0]); bWW.add(r[1]); }
        for (const u of bN) if (u < 316 && !(u > 248 && u < 256.5)) lwall(u, 0.4, u, N_END, y, top, wm);
        for (const u of bS) if (u < 316) lwall(u, S_START, u, u <= 97.5 ? 22 : 29.8, y, top, wm);
        for (const v of bWW) if (plan.WFULL) lwall(0.4, v, 74.6, v, y, top, { ...wm, openings: v === 22 ? [{ at: 35.4, w: 4.6, y0: y, y1: y + 2.6 }] : v === 112 ? [{ at: 20, w: 2, y0: y, y1: y + 2.3 }, { at: 50, w: 2, y0: y, y1: y + 2.3 }] : [] }); else lwall(0.4, v, WC0, v, y, top, wm);
        if (!plan.WFULL) for (const v of new Set([...bWE, 22])) lwall(WC1, v, 74.6, v, y, top, wm);
      } else {
        // fire-shutter walls with wide openings (open-plan warehouse floor)
        for (const u of [128, 200]) lwall(u, 0.4, u, 29.8, y, top, { mat: 0xbdb7aa, thick: 0.25, openings: [{ at: 12.6, w: 4.8, y0: y, y1: y + 3.4 }] });
        lwall(0.4, 76, WC0, 76, y, top, { mat: 0xbdb7aa, thick: 0.25, openings: [{ at: 33.2, w: 4.8, y0: y, y1: y + 3.4 }] });
        lwall(WC1, 22, 74.6, 22, y, top, wm);
      }
      // NW corner room walls (door to the lobby)
      if (plan.C) {
        lwall(WC0, 0.4, WC0, 22, y, top, { ...wm, openings: [{ at: 15.6, w: 1.8, y0: y, y1: y + 2.3 }] });
        if (plan.open) lwall(0.4, 22, WC0, 22, y, top, wm);
      }

      // ---- room contents, door plates, zones
      for (const r of all) {
        roomNo++;
        const num = `${fnum}${String(roomNo).padStart(2, '0')}`;
        furnish(r, y, top, k);
        lzone(r.label, k, `${num}호 ${TYPE_SUB[r.type] || ''}`, r.u0, r.v0, r.u1, r.v1, y, y + f.h, 3);
        if (plan.open && !r.corner) {
          // painted area name on the floor + hanging sign
          const cu = (r.u0 + r.u1) / 2, cv = (r.v0 + r.v1) / 2, lu = r.face === '+v' || r.face === '-v';
          if (lu) lsign([r.label], cu, r.face === '+v' ? 12.7 : 17.3, top - 1.1, 4.6, 0.6, r.face, { bg: '#e2b007', fg: '#222' });
          else lsign([r.label], r.face === '+u' ? WC0 - 0.1 : WC1 + 0.1, cv, top - 1.1, 4.6, 0.6, r.face, { bg: '#e2b007', fg: '#222' });
          continue;
        }
        const plate = (d) => {
          if (r.corner) { lsign([`${num} ${r.label}`], WC0 + 0.12, 17.9, y + 2.0, 2.6, 0.4, '+u', { bg: '#ffffff', fg: acc }); return; }
          if (r.full) return;
          const o = { bg: r.type === 'vacant' ? '#f2f2f2' : '#ffffff', fg: r.type === 'vacant' ? '#777777' : acc };
          const t = [`${num} ${r.label}`];
          if (r.face === '+v') lsign(t, d + 1.9, N_END + 0.1, y + 2.0, 2.4, 0.38, '+v', o);
          else if (r.face === '-v') lsign(t, d + 1.9, S_START - 0.1, y + 2.0, 2.4, 0.38, '-v', o);
          else if (r.face === '+u') lsign(t, WC0 + 0.1, d + 1.9, y + 2.0, 2.4, 0.38, '+u', o);
          else lsign(t, WC1 - 0.1, d + 1.9, y + 2.0, 2.4, 0.38, '-u', o);
        };
        plate(r.doors[0]);
      }

      // ---- lift lobby: big floor number on the back wall, directory board, wayfinding
      rbox(39, 21.6, 55.6, 21.85, y, top - y, accN, { solid: false, skip: ['bottom', 'top'] }); // accent feature wall
      lsign([k], 52.6, 21.55, y + 0.9, 2.6, 1.9, '-v', { bg: '#ffffff', fg: acc });
      lsign([plan.title, k === '5F' ? 'SHINSEGAE' : '서울고속버스터미널 경부선'], 44.6, 21.55, y + 1.3, 9, 1.1, '-v', { bg: acc, fg: '#ffffff' });
      const order = ['10F', '9F', '8F', '7F', '6F', '5F', '4F', '3F', '2F', '1F', 'B1'];
      lsign(['층별 안내', ...order.map(o => `${o === k ? '▶ ' : ''}${o}  ${FNAME[o]}`)], 52.6, 10.45, y + 0.6, 2.4, 2.6, '+v', { bg: '#1f242b', fg: '#ffffff', align: 'left', pxPerM: 110 });
      lbox(52.6, 10.33, y, 2.5, 0.18, 3.25, 0x3a3f46, { solid: true });
      if (!plan.open) {
        lsign([`${k}  북측 동 →`], 56.3, 15, y + 2.55, 3.4, 0.45, '-u', { bg: acc, fg: '#ffffff', twoSided: true });
        if (!plan.WFULL) lsign([`${k}  서측 동 ↓`], 36, 22.3, y + 2.55, 2.8, 0.45, '-v', { bg: acc, fg: '#ffffff', twoSided: true });
      }
      // lobby furniture
      lbox(35.6, 16.5, y, 0.55, 3.2, 0.45, 0x6b7d8f, { solid: false });
      lcyl(54.8, 20.8, y, 0.35, 0.6, 0x9a8a72, { seg: 8 }); lbox(54.8, 20.8, y + 0.6, 0.6, 0.6, 0.9, 0x4f7d3c, { solid: false });
      // toilets block (shared core position, every floor)
      rbox(248.5, 0.4, 256, 12.4, y, f.h - 0.4, 0xdcd8d0);
      lsign(['화장실  남 · 여'], 252.2, 12.5, y + 2.2, 2.6, 0.45, '+v', { bg: '#2d3e50', fg: '#fff' });
      // people in corridors
      if (!plan.open) { lcrowd(57, 13.2, 310, 16.8, y, k === '5F' ? 26 : 10, 50 + f.y); if (!plan.WFULL) lcrowd(34, 22, 38, 150, y, 6, 60 + f.y); }
      lcrowd(34.5, 10.6, 55, 21, y, 4, 70 + f.y);
      if (k === '5F') {
        rbox(42, 14, 52, 15.6, y, 1.05, 0xf4f1ea);
        lsign(['SHINSEGAE', '신세계백화점 본사'], 47, 15.65, y + 1.2, 3.6, 0.8, '+v', { bg: '#111', fg: '#ffffff', twoSided: true });
        lperson(47, 13.6, y, { sit: true });
        lzone('신세계백화점 본사 리셉션', '5F', 'SHINSEGAE Department Store HQ', 40, 12, 56, 18, y, y + f.h, 4);
      }
      lzone(`${k} 엘리베이터 홀`, k, '중앙 엘리베이터 1·2호기 · 비상계단 · 층별 안내', 33.6, 10.1, 56, 22, y, y + f.h, 3);
    }
  }
  // fill one room. r.face points from the room toward its corridor; t = depth from the back wall (0..1), s = lateral (0..1)
  function furnish(r, y, top, k) {
    const alongU = r.face === '+v' || r.face === '-v';
    const latA = alongU ? r.u0 : r.v0, latB = alongU ? r.u1 : r.v1;
    const backD = r.face === '+v' ? r.v0 : r.face === '-v' ? r.v1 : r.face === '+u' ? r.u0 : r.u1;
    const frontD = r.face === '+v' ? r.v1 : r.face === '-v' ? r.v0 : r.face === '+u' ? r.u1 : r.u0;
    const L = latB - latA, D = Math.abs(frontD - backD), sg = Math.sign(frontD - backD);
    const at = (dm, lm) => alongU ? [latA + lm, backD + sg * dm] : [backD + sg * dm, latA + lm]; // depth m from back, lateral m from latA
    // box with lateral size `ls` and depth size `ds`
    const B = (dm, lm, yy, ls, ds, h, mat, o = {}) => { const [u, v] = at(dm, lm); lbox(u, v, yy, alongU ? ls : ds, alongU ? ds : ls, h, mat, { solid: false, skip: ['bottom'], ...o }); };
    const seatCol = [0x2b2f36, 0x3a4a5e, 0x4a3a32][k.charCodeAt(0) % 3];
    const deskCol = k === '5F' ? 0xe9e4da : 0xd5c9b3;
    const monSkip = alongU ? ['bottom', 'top', 'e', 'w'] : ['bottom', 'top', 'n', 's']; // thin screens: only the two big faces
    const faceAway = alongU ? (sg > 0 ? '-v' : '+v') : (sg > 0 ? '-u' : '+u');
    const avoidCore = (dm, lm, pad = 1.2) => { const [u, v] = at(dm, lm); return excl.some(e => inR(e, u, v, pad)) || (u > 248 && u < 256.5 && v < 13); };
    switch (r.type) {
      case 'office': {
        const islands = Math.min(3, Math.floor((D - 3) / 3.6));
        for (let i = 0; i < islands; i++) {
          const dm = 2.2 + i * 3.6;
          for (let s0 = 1.6; s0 + 4 < L - 1.2; s0 += 9.2) {
            const segL = Math.min(8, L - 1.2 - s0);
            if (avoidCore(dm, s0 + segL / 2, 2.5)) continue;
            B(dm, s0 + segL / 2, y, segL, 1.5, 0.74, deskCol, { solid: true });
            B(dm, s0 + segL / 2, y + 0.74, segL, 0.04, 0.4, 0x9aa3a8);
            for (let lm = s0 + 1.1; lm < s0 + segL; lm += 2.3) for (const side of [-1, 1]) {
              B(dm + side * 0.38, lm, y + 0.74, 0.55, 0.05, 0.36, 0x16181b, { skip: monSkip });
              B(dm + side * 1.15, lm, y, 0.5, 0.5, 0.48, seatCol);
              if (rnd() < 0.3) { const [pu, pv] = at(dm + side * 1.15, lm); lperson(pu, pv, y, { sit: true, rotY: FACE[side > 0 ? faceAway : r.face] }); }
            }
          }
        }
        B(0.35, L / 2, y, Math.min(L - 2, 14), 0.5, 1.2, 0xb9b3a6, { solid: true }); // filing cabinets on the back wall
        break;
      }
      case 'meeting': case 'exec': {
        const tl = Math.min(L - 4, r.type === 'exec' ? 5 : 9), dm = Math.min(D / 2, 6);
        let lc = L / 2;
        for (const c of [L / 2, L * 0.75, L * 0.25]) { if (![c - tl / 2, c, c + tl / 2].some(q => avoidCore(dm, q, 1.6))) { lc = c; break; } }
        const L2 = lc * 2; void L2;
        B(dm, lc, y, tl, 1.6, 0.74, r.type === 'exec' ? 0x5a3e2b : 0x7a5a40, { solid: true });
        for (let lm = lc - tl / 2 + 0.6; lm < lc + tl / 2; lm += 1.2) for (const side of [-1, 1]) B(dm + side * 1.2, lm, y, 0.5, 0.5, 0.48, 0x23272d);
        B(0.12, L / 2, y + 0.9, Math.min(4, L - 2), 0.06, 1.3, r.type === 'exec' ? 0x6b4f3a : 0xf6f6f2); // whiteboard / panel
        if (r.type === 'exec') { B(D - 2.5, L / 2, y, 3.0, 0.9, 0.42, 0x7a6a58); B(D - 2.5, L / 2 - 2.2, y, 0.9, 0.9, 0.42, 0x7a6a58); B(0.35, L / 2 + 4, y, 3.2, 0.45, 2.0, { tex: 'gb_boxes' }, { side: { tex: 'gb_boxes' } }); }
        if (L > 25) { const dm2 = D / 2; B(dm2, L * 0.82, y, 6, 1.4, 0.74, 0x7a5a40, { solid: true }); }
        break;
      }
      case 'control': {
        B(0.2, L / 2, y + 0.5, Math.min(L - 3, 16), 0.15, 2.4, 0x111418, { side: { tex: 'gb_cctv' }, solid: true });
        for (let row = 0; row < 3; row++) {
          const dm = 3.2 + row * 2.4; if (dm > D - 1.5) break;
          const cl = Math.min(L - 6, 14 - row * 2);
          B(dm, L / 2, y, cl, 0.9, 0.78, 0x3b4048, { solid: true });
          for (let lm = L / 2 - cl / 2 + 0.7; lm < L / 2 + cl / 2; lm += 1.4) {
            B(dm - 0.2, lm, y + 0.78, 0.6, 0.05, 0.4, 0x0f1216, { skip: monSkip });
            B(dm + 0.9, lm, y, 0.5, 0.5, 0.48, 0x23272d);
            if (rnd() < 0.5) { const [pu, pv] = at(dm + 0.9, lm); lperson(pu, pv, y, { sit: true, rotY: FACE[faceAway], shirt: 0x1d3f86 }); }
          }
        }
        break;
      }
      case 'dispatch': {
        B(D * 0.45, L / 2, y, Math.min(L - 4, 10), 0.8, 1.05, 0xd8d2c6, { solid: true });
        { const [su, sv] = at(0.25, L / 2); lsign(['배차 현황', '부산 06:00 ~ 23:30 · 30분 간격', '동대구 · 대전 · 강릉 · 속초', '승무원 출근 확인'], su, sv, y + 1.3, Math.min(5, L - 2), 1.6, r.face, { bg: '#0d0d0d', fg: '#ffb000', align: 'left' }); }
        for (let lm = 2; lm < Math.min(L - 1, 12); lm += 1.6) { const [pu, pv] = at(D * 0.45 - 0.9, L / 2 - 5 + lm); lperson(pu, pv, y, { sit: true, rotY: FACE[r.face], shirt: 0x24324a }); }
        B(D - 1.4, L * 0.25, y, 3, 0.6, 0.45, 0x6b7d8f);
        break;
      }
      case 'lounge': case 'sleep': {
        if (r.type === 'sleep') {
          for (let lm = 1.5; lm < L - 1.5; lm += 2.4) for (const dm of [1.1, D - 2.4]) { if (dm < 1 || avoidCore(dm, lm, 1.5)) continue; B(dm, lm, y, 0.95, 2.0, 0.45, 0xe9e6df); B(dm, lm, y + 1.35, 0.95, 2.0, 0.12, 0xe9e6df); B(dm, lm - 0.5, y, 0.06, 2.0, 1.5, 0x8a8f96); }
        } else {
          for (let lm = 2; lm < L - 2; lm += 5) {
            if (avoidCore(D / 2, lm, 2)) continue;
            B(D / 2 - 1.2, lm, y, 2.4, 0.85, 0.42, 0x4c5f73); B(D / 2 - 1.6, lm, y + 0.42, 2.4, 0.2, 0.45, 0x4c5f73);
            B(D / 2, lm, y, 1.2, 0.6, 0.38, 0x7a6a58);
            if (rnd() < 0.6) { const [pu, pv] = at(D / 2 - 1.2, lm); lperson(pu, pv, y, { sit: true, rotY: FACE[r.face] }); }
          }
          B(0.15, L / 2, y + 1.0, 2.2, 0.08, 1.25, 0x111111); // TV
          B(D - 0.6, 1.0, y, 0.9, 0.8, 1.85, 0xc8102e); B(D - 0.6, 2.1, y, 0.9, 0.8, 1.85, 0x1d5f8a); // vending machines
        }
        break;
      }
      case 'storage': case 'archive': case 'racks': {
        const gap = r.type === 'archive' ? 1.6 : 2.6;
        for (let lm = 1.2; lm < L - 1; lm += gap) {
          const rl = D - (r.type === 'racks' ? 1.0 : 3.2);
          if (rl < 1.5) break;
          const dm = (r.type === 'racks' ? 0.5 : 0.6) + rl / 2;
          let blocked = false; for (let q = 0.5; q < rl; q += 1.5) if (avoidCore(dm - rl / 2 + q, lm, 2.0)) blocked = true;
          if (blocked) continue;
          B(dm, lm, y, 0.6, rl, r.type === 'archive' ? 2.2 : 2.6, 0x5c636b, { side: { tex: 'gb_boxes' }, solid: true });
        }
        break;
      }
      case 'pallets': {
        for (let lm = 2; lm < L - 2; lm += 3) for (let dm = 2; dm < D - 2; dm += 3) {
          if (avoidCore(dm, lm, 1.5) || rnd() < 0.3) continue;
          B(dm, lm, y, 1.2, 1.0, 0.14, 0x9b7b52); B(dm, lm, y + 0.14, 1.1, 0.95, 0.4 + rnd() * 0.9, pick([0xc9a675, 0xd8d0c0, 0x8f9aa3]));
        }
        break;
      }
      case 'pantry': {
        B(0.4, L / 2, y, Math.min(L - 1.5, 6), 0.65, 0.9, 0xe6e2da, { solid: true });
        B(0.4, L / 2 + Math.min(L - 1.5, 6) / 2 + 0.5, y, 0.8, 0.7, 1.8, 0xd5d8dc, { solid: true });
        for (let lm = 3; lm < L - 2; lm += 3.5) { B(D * 0.6, lm, y, 1.0, 1.0, 0.74, 0xd9cbb5, { solid: true }); B(D * 0.6 + 0.8, lm, y, 0.45, 0.45, 0.45, 0x333333); }
        break;
      }
      case 'shower': {
        for (let lm = 1.2; lm < L - 1; lm += 1.4) B(0.9, lm, y, 0.06, 1.8, 2.1, 0xcfd6da);
        B(D - 0.8, L / 2, y, Math.min(L - 2, 6), 0.5, 1.9, 0x8a929a);
        break;
      }
      case 'machine': {
        lquadH(r.u0 + 0.2, r.v0 + 0.2, r.u1 - 0.2, r.v1 - 0.2, y + 0.008, 0x7f9a86); // epoxy floor
        for (let lm = 3; lm < L - 3; lm += 7) {
          if (avoidCore(D / 2, lm, 3)) continue;
          B(D / 2, lm, y, 4.2, Math.min(D - 3, 3.2), 2.5, { tex: 'metal', color: 0xb9bec4 }, { solid: true });
          B(D / 2, lm + 2.5, y + 2.5, 0.8, 0.8, top - y - 2.5, 0x9aa3ab, { skip: ['bottom', 'top'] }); // duct up
        }
        B(0.4, L / 2, y, Math.min(L - 2, 10), 0.5, 2.0, 0x8d949b, { solid: true }); // electrical panels
        B(D * 0.25, L / 2, top - 0.6, L - 1, 0.35, 0.35, 0xb04a3a, { skip: [] }); // red sprinkler main
        B(D * 0.7, L / 2, top - 0.9, L - 1, 0.5, 0.5, 0xa9aeb3, { skip: [] }); // duct
        break;
      }
      case 'vacant': {
        lquadH(r.u0 + 0.1, r.v0 + 0.1, r.u1 - 0.1, r.v1 - 0.1, y + 0.008, { tex: 'concrete', color: 0xb8b3a9 });
        const [su, sv] = at(D * 0.5, L * 0.5);
        for (let i = 0; i < 4; i++) { const [cu, cv] = at(1.2 + (i % 2) * 0.7, 1.5 + i * 0.8); lbox(cu, cv, y, 0.5, 0.5, 0.45 + 0.2 * (i % 3), 0x3a3a3a, { solid: false }); }
        lcyl(su, sv, y + 0.25, 0.25, 0.3, 0x8a7f72, { seg: 6 });
        // leftovers of the previous tenant: rolled carpet, boxes, stepladder, bare cable trays in the ceiling
        B(D * 0.35, L * 0.3, y, 0.35, 3.2, 0.35, 0x6d6f8a); B(D * 0.65, L * 0.7, y, 0.8, 0.6, 0.5, 0xc9a675); B(D * 0.65 + 0.2, L * 0.7 + 0.9, y, 0.6, 0.6, 0.4, 0xb8925e);
        B(D * 0.5, L * 0.55, y, 0.6, 0.08, 1.8, 0xb7bcc2, { rot: 0.2 });
        B(D * 0.5, L / 2, top - 0.35, L - 2, 0.3, 0.06, 0x8f969c, { skip: [] });
        { const [pu, pv] = at(D + 0.12, r.doors ? r.doors[0] - latA + 4.2 : L / 2); lsign(['임대 문의', '관리사무소 4F'], pu, pv, y + 1.3, 1.8, 0.7, r.face, { bg: '#ffffff', fg: '#a3343c' }); }
        break;
      }
      case 'canteen': {
        // r spans the full west arm: tables in a grid, aisles along v
        for (let u = 4; u < 72; u += 4.2) for (let v = r.v0 + 4; v < r.v1 - 3; v += 3.4) {
          if (u > 31 && u < 41) continue; // central aisle (former corridor line)
          lbox(u, v, y, 1.6, 0.8, 0.74, 0xe8e4dc, { solid: true, skip: ['bottom'] });
          for (const s of [-1, 1]) lbox(u, v + s * 0.75, y, 1.4, 0.4, 0.45, 0xd35b3a, { solid: false, skip: ['bottom'] });
          if (rnd() < 0.35) lperson(u + (rnd() - 0.5), v + 0.75, y, { sit: true, rotY: FACE['-v'] });
        }
        rbox(6, r.v1 - 2.2, 70, r.v1 - 1.2, y, 1.0, 0xc9ccd0, { top: { tex: 'metal', color: 0xd8dade } }); // serving counter
        lsign(['직원식당', '중식 11:30 ~ 13:30 · 석식 17:30 ~ 19:00'], 37.5, r.v1 - 0.4, y + 2.6, 6, 1.0, '-v', { bg: FCOL['9F'], fg: '#ffffff' });
        lsign(['오늘의 메뉴', '제육볶음 · 된장찌개 · 계란말이 · 김치'], 20, r.v1 - 0.45, y + 2.4, 4, 0.9, '-v', { bg: '#1c1c1c', fg: '#ffd27a' });
        lcrowd(32, r.v0 + 2, 41, r.v1 - 4, y, 14, 81);
        break;
      }
      case 'kitchen': {
        // cooking lines stop at u=48: the S2 stair core (u 52-56) and the EL3 elevator door (u 61.5) stay clear
        for (const v of [r.v0 + 6, r.v0 + 16, r.v0 + 26]) { if (v > r.v1 - 2) continue; rbox(6, v - 0.6, 48, v + 0.6, y, 0.9, { tex: 'metal', color: 0xc9ccd0 }); rbox(10, v - 0.7, 46, v + 0.7, top - 0.9, 0.5, { tex: 'metal', color: 0xb5b9be }, { solid: false }); }
        break;
      }
    }
  }

  function build10F() {
    const y = ROOF;
    const [pu0, pv0, pu1, pv1] = P10;
    K.zone({ name: '고속터미널성당', floor: '10F', sub: '천주교 성당 (사제 상주) · 옥상정원', poly: hp(P10), y0: y, y1: PENT, priority: 2 });
    // nave
    const nave = [4, 18, 66, 60];
    lwall(nave[0], nave[1], nave[2], nave[1], y, PENT - 0.4, { mat: 0xf3efe6, thick: 0.2, openings: [{ at: 4, w: 3, y0: y, y1: y + 3 }, { at: 58, w: 3, y0: y, y1: y + 3 }] });
    lwall(nave[2], nave[1], nave[2], nave[3], y, PENT - 0.4, { mat: 0xf3efe6, thick: 0.2, openings: [{ at: 20, w: 3, y0: y, y1: y + 3 }] });
    lwall(nave[0], nave[3], nave[2], nave[3], y, PENT - 0.4, { mat: 0xf3efe6, thick: 0.2, openings: [{ at: 32, w: 3, y0: y, y1: y + 3 }] });
    lwall(nave[0], nave[1], nave[0], nave[3], y, PENT - 0.4, { mat: 0xf3efe6, thick: 0.2 });
    // altar at u≈8 end
    rbox(4.5, 30, 10, 48, y, 0.45, { tex: 'marble', color: 0xe8e2d6 });
    rbox(6, 36, 8, 42, y + 0.45, 1.0, 0xf6f2ea);
    lbox(5.2, 39, y + 0.45, 0.3, 0.3, 4.0, 0x8a6a3a, { solid: false });
    lbox(5.2, 39, y + 3.2, 0.3, 2.2, 0.3, 0x8a6a3a, { solid: false });
    lsign(['고속터미널성당'], 4.4, 39, y + 4.2, 4, 0.6, '+u', { bg: '#f3efe6', fg: '#7a1a1a' });
    // pews
    for (let u = 14; u < 62; u += 1.6) for (const [va, vb] of [[22, 37], [41, 56]]) { lbox(u, (va + vb) / 2, y, 0.5, vb - va, 0.45, 0x8a5a2a, { solid: false }); lbox(u + 0.3, (va + vb) / 2, y + 0.45, 0.08, vb - va, 0.5, 0x7a4a22, { solid: false }); }
    for (let i = 0; i < 26; i++) lperson(14 + Math.floor(rnd() * 30) * 1.6 + 0.1, 22.5 + rnd() * 33, y, { sit: true, rotY: FACE['-u'] });
    // stained glass panels (emit) on the inner nave wall
    for (let u = 14; u < 64; u += 6) { lquadDown(u - 1.5, 38.6, u + 1.5, 39.4, PENT - 0.42, { tex: 'emit', color: 0xfff2d8 }); }
    lzone('고속터미널성당 (대성전)', '10F', '미사 · 고해성사', nave[0], nave[1], nave[2], nave[3], y, PENT, 4);
    // 사제관 / 사무실
    rbox(54, 0.5, 74.4, 12, y, 3.2, 0xe2dccf);
    lsign(['성당 사무실 · 사제관'], 60, 12.1, y + 2.6, 4, 0.5, '+v', { bg: '#7a1a1a', fg: '#fff' });
    lsign(['10F 고속터미널성당 · 옥상정원'], 46, 12.3, y + 2.9, 6, 0.6, '+v', { bg: '#7a1a1a', fg: '#fff' });
    lights(PENT - 0.42, 6, 6, (u, v) => !inR(P10, u, v));
    // roof garden over the west arm (u 1..74, v 62..154) and long-bar roof
    const garden = [1.5, 63, 73.5, 152];
    lzone('옥상정원', '10F', '전망 · 산책 (성당 옆)', ...garden, y, y + 6, 3);
    for (let v = 68; v < 148; v += 12) for (let u = 8; u < 70; u += 14) {
      rbox(u - 3.5, v - 2.5, u + 3.5, v + 2.5, y, 0.5, 0x9b8f7e);
      K.hpoly({ tex: 'grass', color: 0x86a96a }, rect(u - 3.3, v - 2.3, u + 3.3, v + 2.3), y + 0.52, true);
      const [tx, tz] = W(u, v); K.tree(tx, tz, { y: y + 0.5, h: 3.5 + rnd() * 1.5, kind: pick(['zelkova', 'pine', 'cherry']) });
    }
    for (let v = 74; v < 146; v += 12) { bench10(37, v); }
    for (const v of [64, 66]) void v;
    lcrowd(4, 64, 72, 150, y, 18, 91);
    // rooftop equipment on the long bar
    for (let u = 90; u < 300; u += 24) { rbox(u, 4, u + 8, 12, y, 2.6, 0x9ea3a8); lcyl(u + 4, 21, y, 2.0, 3.2, 0xb8bcc0, { seg: 12 }); }
    // fence between garden and service roof
    void pu0; void pv0; void pu1; void pv1;
  }
  function bench10(u, v) { lbox(u, v, ROOF, 0.5, 3, 0.45, 0x8a6a4a, { solid: false }); }

  function buildExterior() {
    // big name sign on the long north facade (신반포로), at 3F band
    lsign(['서울고속버스터미널'], 160, -0.35, 13.6, 46, 4.2, '-v', { bg: '#d2cbbb', fg: '#14366e' });
    lsign(['경부 · 영동선'], 236, -0.35, 13.6, 16, 3.0, '-v', { bg: '#d2cbbb', fg: '#14366e' });
    lsign(['꽃도매상가 3F'], 92, -0.35, 13.6, 18, 3.0, '-v', { bg: '#d2cbbb', fg: '#2f7d3a' });
    // rooftop letters on the penthouse
    lsign(['서울고속버스터미널'], 37.6, 0.42, PENT - 2.4, 34, 3.2, '-v', { bg: '#e4ddcf', fg: '#14366e' });
    lsign(['서울고속버스터미널'], 0.42, 31, PENT - 2.4, 30, 3.0, '-u', { bg: '#e4ddcf', fg: '#14366e' });
    // west face (toward 신세계/메리어트): 꽃시장 banner + terminal name
    lsign(['고속터미널 꽃도매상가 3F'], westU(92) - 0.7, 92, 13.6, 34, 3.4, '-u', { bg: '#d2cbbb', fg: '#2f7d3a' });
    lsign(['서울고속버스터미널'], westU(92) - 0.7, 92, 33, 40, 4.2, '-u', { bg: '#d5cdbd', fg: '#14366e' });
    // inner (courtyard) faces
    lsign(['서울고속버스터미널 경부선'], 75.6, 92, 13.6, 34, 3.2, '+u', { bg: '#d2cbbb', fg: '#14366e' });
    lsign(['경부 · 영동선 승차홈'], 250, 30.6, 13.6, 34, 3.2, '+v', { bg: '#d2cbbb', fg: '#14366e' });
    // entrance canopies + door signs on the north face
    for (const [u, w] of [[26, 10], [122, 6], [148, 6], [218, 6], [259, 6]]) {
      rbox(u - w / 2, -3.2, u + w / 2, 0, 3.8, 0.3, { tex: 'metal', color: 0xb7bcc2 }, { solid: false });
      lsign(u === 26 ? ['서울고속버스터미널', '정문 · 매표소'] : ['출입구'], u, -0.47, 5.2, u === 26 ? 7 : 3, u === 26 ? 1.1 : 0.6, '-v', { bg: '#14366e', fg: '#fff' });
    }
    for (const v of [14, 48, 105, 153.5]) {
      rbox(westU(v) - 3.2, v - 3, westU(v), v + 3, 3.8, 0.3, { tex: 'metal', color: 0xb7bcc2 }, { solid: false });
      lsign(['출입구 · 승차홈'], westU(v) - 0.47, v, 5.2, 3.2, 0.6, '-u', { bg: '#14366e', fg: '#fff' });
    }
    // 1F storefront signs visible from the street (west face)
    for (const [t, v, w, bg, fg] of [['파리바게뜨', 58, 6, '#0a3d91', '#ffffff'], ['놀부부대찌개', 94, 6, '#c8102e', '#ffffff'], ['Taco Bell', 25.5, 5, '#702082', '#ffffff'], ['아트박스', 124, 5, '#e8331c', '#ffffff'], ['약국', 37, 3, '#1a7f3c', '#ffffff'], ['Health Boy Gym', 141, 6, '#222222', '#ffffff']])
      lsign([t], westU(v) - 0.47, v, 5.2, w, 0.9, '-u', { bg, fg });
    for (const [t, u, w, bg, fg] of [['신한은행', 9, 6, '#0046ff', '#ffffff'], ['다이소', 173, 6, '#e60012', '#ffffff'], ['이마트24', 202, 5, '#ff9a00', '#ffffff'], ['BURGER KING', 138, 6, '#d6201f', '#ffd27a'], ['제2매표소', 86, 6, '#14366e', '#ffffff'], ['제3매표소', 306, 6, '#14366e', '#ffffff']])
      lsign([t], u, -0.47, 5.2, w, 0.9, '-v', { bg, fg });
    // fabric awnings over the street-facing shops (sloped quad + valance)
    const awning = (u0, v0, u1, v1, out, col) => {
      // (u0,v0)-(u1,v1) is the wall line, `out` is the outward offset vector in local (du,dv)
      const p = (u, v, o, y) => { const [x, z] = W(u + out[0] * o, v + out[1] * o); return [x, y, z]; };
      const q = [p(u0, v0, 0.5, 4.25), p(u1, v1, 0.5, 4.25), p(u1, v1, 1.9, 3.45), p(u0, v0, 1.9, 3.45)];
      K.quad(col, q, [0, 1, 0]); K.quad(col, [q[1], q[0], q[3], q[2]], [0, -1, 0]);
      const [cu, cv] = [(u0 + u1) / 2 + out[0] * 1.9, (v0 + v1) / 2 + out[1] * 1.9];
      lbox(cu, cv, 3.15, Math.abs(u1 - u0) || 0.05, Math.abs(v1 - v0) || 0.05, 0.3, col, { solid: false });
    };
    for (const [v, w, col] of [[58, 7, 0x0a3d91], [94, 7, 0xc8102e], [25.5, 6, 0x702082], [124, 6, 0xe8331c], [37, 4, 0x1a7f3c], [69.5, 6, 0x8a5a2a], [81, 6, 0x2b3a55]])
      awning(westU(v - w / 2), v - w / 2, westU(v + w / 2), v + w / 2, [-1, 0], col);
    for (const [u, w, col] of [[9, 8, 0x0046ff], [173, 8, 0xe60012], [202, 6, 0xff9a00], [138, 8, 0xd6201f], [116, 6, 0x7a2430], [185, 6, 0x1f5a3a], [243, 6, 0x23415f]])
      awning(u - w / 2, 0, u + w / 2, 0, [0, -1], col);
    // NW corner pier (solid stone bay instead of an empty glass panel) with the terminal name at eye level
    lbox(westU(6) - 0.25, 6, 0, 0.5, 10.6, 4.4, { tex: 'marble', color: 0xd6ccb8 }, { solid: true });
    lsign(['서울고속버스터미널', '경부 · 영동선 승차홈 1~43'], westU(6) - 0.52, 6, 1.5, 8.6, 1.5, '-u', { bg: '#14366e', fg: '#ffffff' });
    lsign(['신반포로 194'], westU(6) - 0.52, 6, 0.55, 3, 0.45, '-u', { bg: '#d6ccb8', fg: '#333333' });
    lbox(5.5, -0.25, 0, 11, 0.5, 4.4, { tex: 'marble', color: 0xd6ccb8 }, { solid: true, skip: [] });
    lsign(['신한은행 고속터미널지점'], 9.5, -0.52, 2.0, 5.4, 0.7, '-v', { bg: '#0046ff', fg: '#ffffff' });
    // street furniture: lamp posts, bollards at the doors, planters
    const lamp = (u, v) => { lcyl(u, v, 0, 0.09, 7.5, 0x4a4f55, { seg: 6 }); lbox(u, v, 7.4, 0.35, 0.35, 0.25, 0x3a3f45, { solid: false }); lquadDown(u - 0.15, v - 0.15, u + 0.15, v + 0.15, 7.39, { tex: 'emit', color: 0xfff1d0 }); };
    for (let u = 20; u < 312; u += 27) lamp(u, -6.6);
    for (let v = 20; v < 156; v += 27) lamp(westU(v) - 6.6, v);
    for (const v of [14, 48, 105, 153.5]) for (const s of [-1.5, -0.5, 0.5, 1.5]) lcyl(westU(v) - 3.2, v + s * 1.6, 0, 0.11, 0.85, 0x5a5f66, { seg: 6 });
    for (const u of [26, 122, 148, 218, 259]) for (const s of [-1.5, -0.5, 0.5, 1.5]) lcyl(u + s * 1.6, -3.4, 0, 0.11, 0.85, 0x5a5f66, { seg: 6 });
    for (const v of [31, 76, 88, 131]) { lbox(westU(v) - 1.4, v, 0, 0.9, 2.4, 0.55, { tex: 'concrete', color: 0xbdb5a5 }); K.hpoly({ tex: 'grass', color: 0x5f8a45 }, rect(westU(v) - 1.8, v - 1.1, westU(v) - 1.0, v + 1.1), 0.56, true); }
    // 성당 cross on the penthouse roof
    lbox(20, 30, PENT, 0.35, 0.35, 3.0, 0xf2f2f2, { solid: false });
    lbox(20, 30, PENT + 2.0, 0.35, 1.6, 0.35, 0xf2f2f2, { solid: false });
    // rooftop equipment on the penthouse
    rbox(48, 30, 60, 42, PENT, 2.4, 0x9ea3a8);
    lcyl(66, 50, PENT, 1.8, 2.6, 0xb8bcc0, { seg: 12 });
    // street trees along 신반포로 frontage and sidewalk crowd
    for (let u = 8; u < 312; u += 14) { const [x, z] = W(u, -5.2); K.tree(x, z, { kind: 'ginkgo', h: 9 }); }
    lcrowd(0, -6, 316, -1.5, 0, 50, 99);
    lcrowd(-6, 0, -1.5, 156, 0, 30, 98);
  }
}
