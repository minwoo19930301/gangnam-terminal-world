// JW 메리어트 호텔 서울 — 센트럴시티 동측 블록 (OSM 136986976), 지상 33층 · 지하 4층.
// Local frame: u = across the block (east, toward the 경부선 service road), v = along the block (south, toward 사평대로).
//   north edge (v≈-60.7) = shared wall with 신세계 강남점 (J5), west edge (u≈-33.3) = shared wall with 센트럴시티 (J6).
// Podium 1F–6F over the whole footprint, 7F = podium roof (JW 가든 + 더 마고 그릴 / 모보 바 pavilion),
// tower 8F (체크인 로비 · 더 라운지) – 33F (펜트하우스), crown to 144 m (= OSM height).
export const meta = {
  id: 'jwmarriott',
  name: 'JW 메리어트 호텔 서울',
  claims: [136986976],
  claimRoads: [],
  claimAreas: [],
  sources: [
    'https://ko.wikipedia.org/wiki/JW_메리어트_호텔_서울',
    'https://www.marriott.com/ko/hotels/seljw-jw-marriott-hotel-seoul/dining/',
    'https://www.etoday.co.kr/news/view/1654095',
    'https://www.stayfolio.com/findstay/jw-marriott-hotel-seoul',
    'https://middleeasttraveller.com/jw-marriott-hotel-seoul-review/',
    'https://commons.wikimedia.org/wiki/File:메리어트호텔.jpg (2009 tower photo: ribbon windows, crown plaque, podium granite)',
    'https://www.trvlogue.com/ko/jw-marriott-seoul-fitness-guide',
    'OSM 136986976 footprint, POIs 12076553105 (THE LOUNGE), 12079262441 (Flavors), 933102389',
  ],
};

// ---------------- frame ----------------
const C0 = [-23.6925, 99.5825];
const SV = [0.359001, 0.933337];          // +v (local south)
const EV = [SV[1], -SV[0]];               // +u (local east)
const R = Math.atan2(SV[0], SV[1]);       // box rotY that aligns local z with +v
const P = (u, v) => [C0[0] + u * EV[0] + v * SV[0], C0[1] + u * EV[1] + v * SV[1]];
const RECT = (u0, v0, u1, v1) => [P(u0, v0), P(u1, v0), P(u1, v1), P(u0, v1)];
const FACE = { S: R, N: R + Math.PI, E: R + Math.PI / 2, W: R - Math.PI / 2 };
const yawTo = (du, dv) => { const fx = du * EV[0] + dv * SV[0], fz = du * EV[1] + dv * SV[1]; return Math.atan2(-fx, -fz); };
// OSM edge lines in local coords (the footprint is a 0.3° skewed rectangle)
const UE = 33.31, UW = -33.31;
const vN = u => -60.73 + 0.0045 * u, vS = u => 60.735 + 0.00465 * u;
const FPOSM = [[29.26, 144.45], [-14.35, 31.08], [-76.64, 54.72], [-33.04, 168.08]];

// ---------------- floors ----------------
const LV = [['B4', -21], ['B3', -16], ['B2', -11], ['B1', -6], ['1F', 0], ['2F', 6], ['3F', 11.5], ['4F', 16.5], ['5F', 21], ['6F', 26], ['7F', 30.5], ['8F', 35.5], ['9F', 41], ['10F', 45], ['11F', 49]];
for (let n = 12; n <= 33; n++) LV.push([n + 'F', +(53 + 3.6 * (n - 12)).toFixed(2)]);
const ROOF = 135.8, CROWN = 144;
const Y = {}; LV.forEach(([k, y]) => { Y[k] = y; });
const NEXT = {}; LV.forEach(([k, y], i) => { NEXT[k] = i + 1 < LV.length ? LV[i + 1][1] : ROOF; });
const ROOMF = []; for (let n = 12; n <= 32; n++) ROOMF.push(n);

// tower + core (local)
const TW = [-8, 6, 16, 58];
const EL = { u: 9.9, v: 32 };                       // guest elevator car centre (2.2 x 2.2), door faces west
const ELH = [8.75, 30.85, 11.05, 33.15];
const STH = [10.4, 24.2, 15.8, 30.65];              // stair void (flights run along u)
const HALL = [-2, 42, 16.5, 55];                   // ground entrance double-height void; photo plan remains approximate
const ESC = {                                       // podium escalator voids (hole in the upper floor)
  '2F': [21.6, 30, 25.2, 41.6], '3F': [26.0, 30.9, 29.6, 41.6], '4F': [21.6, 31.7, 25.2, 41.6], '5F': [26.0, 32.6, 29.6, 41.6],
};
const BALL = [-31, -56, 3, -10];
const POOL = [-28, -50, -13, -25], KIDS = [-8, -50, 0, -42], SCUBA = [-8, -28, 0, -20];  // B3 basins                    // 5F 그랜드 볼룸 (7 m ceiling, through 6F)

// palette
const STONE = 0xd8cab2, STONE_D = 0xb8a68a, BRONZE = 0x7a5f40, WARM = 0xece4d6, WALNUT = 0x6b4a32, IVORY = 0xf3ecdf;
const HEX = n => '#' + n.toString(16).padStart(6, '0');
const GL = { tex: 'glass', color: 0x8fa9b8 }, GLD = { tex: 'glass', color: 0x60798a };

export function build(K) {
  const rnd = K.rand(976);
  // ---------- custom textures ----------
  // tower shaft (Commons 메리어트호텔.jpg, 2009): continuous dark-blue glass ribbon per floor between cream spandrel bands
  K.texture('jwTower', 256, 256, (g, w, h) => {
    g.fillStyle = '#e4ded2'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 220; i++) { g.fillStyle = `rgba(${150 + (i * 37) % 50},${140 + (i * 11) % 40},120,0.07)`; g.fillRect((i * 97) % w, (i * 53) % h, 5, 2); }
    const g0 = h * 0.24, g1 = h * 0.7;
    const gr = g.createLinearGradient(0, g0, 0, g1); gr.addColorStop(0, '#6f8aa6'); gr.addColorStop(0.45, '#3d5a7a'); gr.addColorStop(1, '#22374f');
    g.fillStyle = gr; g.fillRect(0, g0, w, g1 - g0);
    g.fillStyle = 'rgba(255,255,255,0.10)'; g.fillRect(w * 0.08, g0, w * 0.3, g1 - g0);
    g.fillStyle = '#1c2a38'; g.fillRect(0, g0, 3, g1 - g0); g.fillRect(w / 2 - 1, g0, 2, g1 - g0);
    g.fillStyle = '#b9b2a4'; g.fillRect(0, g0 - 3, w, 3); g.fillRect(0, g1, w, 3);
    g.fillStyle = 'rgba(90,80,64,0.18)'; g.fillRect(0, h * 0.94, w, 2); g.fillRect(0, h * 0.1, w, 1);
  }, [3.0, 1], { facade: true });
  // tower crown band: cream stone panels with joint lines
  K.texture('jwCrown', 256, 256, (g, w, h) => {
    g.fillStyle = '#e6e0d4'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 300; i++) { g.fillStyle = `rgba(${150 + (i * 13) % 40},${140 + (i * 7) % 40},120,0.08)`; g.fillRect((i * 71) % w, (i * 37) % h, 3, 2); }
    g.strokeStyle = 'rgba(110,98,80,0.25)'; g.lineWidth = 2; g.strokeRect(1, 1, w - 2, h - 2);
  }, [1.5, 1.2]);
  // podium (Commons photo): grey-beige granite, thin rose joint lines, small square punched windows
  K.texture('jwPodium', 256, 256, (g, w, h) => {
    g.fillStyle = '#c9beb2'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 400; i++) { const c = 160 + (i * 13) % 50; g.fillStyle = `rgba(${c},${c - 12},${c - 22},0.2)`; g.fillRect((i * 71) % w, (i * 37) % h, 2 + i % 3, 2); }
    g.strokeStyle = 'rgba(150,110,100,0.35)'; g.lineWidth = 2;
    for (let y = h / 8; y <= h; y += h / 4) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
    g.strokeStyle = 'rgba(90,80,70,0.12)'; g.beginPath(); g.moveTo(w / 2, 0); g.lineTo(w / 2, h); g.stroke();
    g.fillStyle = '#3c4c5a'; g.fillRect(w * 0.38, h * 0.3, w * 0.24, h * 0.27);
    g.fillStyle = 'rgba(255,255,255,0.18)'; g.fillRect(w * 0.38, h * 0.3, w * 0.08, h * 0.27);
    g.fillStyle = '#d8d0c4'; g.fillRect(w * 0.36, h * 0.57, w * 0.28, h * 0.025);
  }, [4.2, 1], { facade: true });
  K.texture('jwStone', 256, 256, (g, w, h) => {
    g.fillStyle = '#d9ccb6'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 900; i++) { const c = 170 + (i * 13) % 50; g.fillStyle = `rgba(${c},${c - 15},${c - 40},0.25)`; g.fillRect((i * 71) % w, (i * 37) % h, 2 + i % 3, 2); }
    g.strokeStyle = 'rgba(80,60,40,0.22)'; g.lineWidth = 2; g.strokeRect(1, 1, w - 2, h - 2); g.beginPath(); g.moveTo(0, h / 2); g.lineTo(w, h / 2); g.stroke();
  }, [1.6, 1.6]);
  K.texture('jwCarpet', 256, 256, (g, w, h) => {
    g.fillStyle = '#6d5646'; g.fillRect(0, 0, w, h);
    g.strokeStyle = 'rgba(214,180,120,0.55)'; g.lineWidth = 3;
    for (let i = 0; i < 4; i++) { g.beginPath(); g.arc(w / 2, h / 2, 20 + i * 26, 0, Math.PI * 2); g.stroke(); }
    g.fillStyle = 'rgba(30,20,15,0.25)'; g.fillRect(0, 0, w, 6); g.fillRect(0, 0, 6, h);
  }, [2.4, 2.4]);
  K.texture('jwBallCarpet', 256, 256, (g, w, h) => {
    g.fillStyle = '#3d4a63'; g.fillRect(0, 0, w, h);
    g.strokeStyle = 'rgba(220,190,120,0.6)'; g.lineWidth = 2;
    for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; g.beginPath(); g.ellipse(w / 2 + Math.cos(a) * 60, h / 2 + Math.sin(a) * 60, 30, 14, a, 0, Math.PI * 2); g.stroke(); }
    g.beginPath(); g.arc(w / 2, h / 2, 26, 0, Math.PI * 2); g.stroke();
  }, [3, 3]);
  K.texture('jwWine', 256, 256, (g, w, h) => {
    g.fillStyle = '#3b2a1e'; g.fillRect(0, 0, w, h);
    for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) {
      g.fillStyle = '#20150e'; g.fillRect(c * 32 + 2, r * 32 + 2, 28, 28);
      g.fillStyle = ['#4a1420', '#2d3a1c', '#5a1a26', '#1d2a14'][(r * 3 + c) % 4]; g.beginPath(); g.arc(c * 32 + 16, r * 32 + 16, 10, 0, Math.PI * 2); g.fill();
      g.fillStyle = 'rgba(255,255,255,0.25)'; g.fillRect(c * 32 + 12, r * 32 + 11, 4, 3);
    }
  }, [1.2, 1.2]);

  // Round 6, refs/interior/jw: horizontal stone grain and warmer walnut.
  // These are material traces, not photographic images projected onto the rooms.
  for (const [key, base] of [['jwHoney', '#ded0b8'], ['jwLoungeStone', '#d4b58d']]) K.texture(key, 512, 256, (g, w, h) => {
    g.fillStyle = base; g.fillRect(0, 0, w, h);
    const r = K.rand(505);
    for (let i = 0; i < 150; i++) {
      g.fillStyle = i % 3 ? 'rgba(150,120,80,.10)' : 'rgba(255,240,210,.18)';
      g.fillRect(r() * w, r() * h, 40 + r() * 160, 1 + r());
    }
    g.strokeStyle = 'rgba(112,96,75,.18)'; g.lineWidth = 1; g.strokeRect(.5, .5, w - 1, h - 1);
  }, [1.2, .6]);
  K.texture('jwTravertine', 512, 256, (g, w, h) => {
    g.fillStyle = '#dfbfa1'; g.fillRect(0, 0, w, h); const r = K.rand(606);
    for (let i = 0; i < 360; i++) {
      g.fillStyle = i % 3 ? 'rgba(120,90,60,.12)' : 'rgba(250,231,208,.22)';
      g.fillRect(r() * w, r() * h, 12 + r() * 130, .4 + r() * 1.1);
    }
    // Wall cladding has explicit staggered 1.2 x .6 m joints in the lift vestibule.
    g.fillStyle = 'rgba(120,90,60,.10)'; g.fillRect(0, 0, w, 1);
  }, [1.2, .6]);
  for (const [key, base] of [['jwWalnut', '#6a4630'], ['jwWalnutLight', '#7a4b30']]) K.texture(key, 256, 512, (g, w, h) => {
    g.fillStyle = base; g.fillRect(0, 0, w, h); const r = K.rand(1313);
    for (let i = 0; i < 250; i++) {
      const x = r() * w; g.strokeStyle = i % 3 ? 'rgba(16,10,7,.08)' : 'rgba(160,110,70,.2)';
      g.lineWidth = .5 + r(); g.beginPath(); g.moveTo(x, 0); g.bezierCurveTo(x + 4, h / 3, x - 3, 2 * h / 3, x + 2, h); g.stroke();
    }
  }, [.65, 3.2]);
  K.texture('jwDarkMarble', 512, 256, (g, w, h) => {
    g.fillStyle = '#282926'; g.fillRect(0, 0, w, h); const r = K.rand(1919);
    for (let i = 0; i < 55; i++) {
      g.strokeStyle = i % 4 ? 'rgba(220,214,197,.32)' : 'rgba(249,243,222,.8)'; g.lineWidth = .6 + r() * 2;
      const yy = r() * h; g.beginPath(); g.moveTo(0, yy);
      for (let x = 0; x <= w; x += 24) g.lineTo(x, yy + Math.sin(x / 42 + i) * 9 + r() * 12); g.stroke();
    }
  }, [2, 1]);
  K.texture('jwGreyMarble', 512, 256, (g, w, h) => {
    g.fillStyle = '#b9b6b0'; g.fillRect(0, 0, w, h); const r = K.rand(1906);
    for (let i = 0; i < 42; i++) {
      g.strokeStyle = i % 3 ? 'rgba(74,72,70,.48)' : 'rgba(243,238,225,.6)'; g.lineWidth = .6 + r() * 2;
      const yy = r() * h; g.beginPath(); g.moveTo(0, yy);
      for (let x = 0; x <= w; x += 24) g.lineTo(x, yy + x * .18 + Math.sin(x / 55 + i) * 12 + r() * 10);
      g.stroke();
    }
  }, [2, 1]);
  for (const [key, base] of [['jwGreyStone', '#a29d96'], ['jwCorridorStone', '#b8afa5']]) K.texture(key, 256, 256, (g, w, h) => {
    g.fillStyle = base; g.fillRect(0, 0, w, h); const r = K.rand(1818);
    for (let i = 0; i < 600; i++) { g.fillStyle = i % 2 ? 'rgba(240,230,212,.08)' : 'rgba(92,83,73,.06)'; g.fillRect(r() * w, r() * h, 1 + r() * 4, 1); }
    g.strokeStyle = 'rgba(72,65,58,.25)'; g.lineWidth = 1; g.strokeRect(.5, .5, w - 1, h - 1);
  }, [.9, .9]);
  K.texture('jwTerrazzo', 256, 256, (g, w, h) => {
    g.fillStyle = '#a7a198'; g.fillRect(0, 0, w, h); const r = K.rand(2020);
    for (let i = 0; i < 5000; i++) { g.fillStyle = ['#c3bdb3', '#807c74', '#d9d4c8', '#989389'][i % 4]; const s = .4 + r() * 1.3; g.fillRect(r() * w, r() * h, s, s); }
  }, [1.4, 1.4]);
  for (const [key, base, colors] of [
    ['jwFoyerCarpet', '#394d66', ['#d0bd98', '#26394f', '#65778a', '#a69f8e']],
    ['jwLoungeRug', '#b9aa94', ['#c9bda8', '#a2998b', '#b4a58e', '#d0c3ae']],
  ]) K.texture(key, 512, 512, (g, w, h) => {
    g.fillStyle = base; g.fillRect(0, 0, w, h); const r = K.rand(1010);
    // Short broken brush tufts in clouds, not the previous long 5 x 7 m streaks.
    for (let i = 0; i < 6800; i++) {
      let x = r() * w, yy = r() * h;
      const cloud = Math.sin(x / 51 + Math.sin(yy / 73)) + Math.cos(yy / 59);
      g.strokeStyle = colors[(i + (cloud > .4 ? 2 : 0)) % colors.length];
      g.globalAlpha = .14 + r() * .34; g.lineWidth = .6 + r() * 1.8;
      g.beginPath(); g.moveTo(x, yy);
      for (let n = 0; n < 3; n++) { x += (r() - .5) * 5; yy += 1 + r() * 4; g.lineTo(x, yy); } g.stroke();
    } g.globalAlpha = 1;
  }, [2.4, 2.4]);
  K.texture('jwChevron', 256, 256, (g, w, h) => {
    g.fillStyle = '#594438'; g.fillRect(0, 0, w, h);
    for (let j = -4; j < 8; j++) for (let i = 0; i < 4; i++) {
      const x = i * 64, yy = j * 64; g.fillStyle = ['#513d2d', '#5e4734', '#49372a', '#69513c'][(i + j + 8) % 4];
      g.beginPath(); g.moveTo(x, yy); g.lineTo(x + 32, yy + 32); g.lineTo(x + 32, yy + 62); g.lineTo(x, yy + 30); g.closePath(); g.fill();
      g.fillStyle = ['#614b37', '#4b392b', '#58422f'][(i + j + 9) % 3];
      g.beginPath(); g.moveTo(x + 32, yy + 32); g.lineTo(x + 64, yy); g.lineTo(x + 64, yy + 30); g.lineTo(x + 32, yy + 62); g.closePath(); g.fill();
    }
  }, [1.2, 1.2]);
  K.texture('jwSheer', 128, 256, (g, w, h) => {
    g.clearRect(0, 0, w, h);
    for (let x = 0; x < w; x++) {
      const fold = .72 + .18 * Math.pow(Math.sin(x / w * Math.PI * 4), 2);
      g.fillStyle = `rgba(239,231,219,${fold})`; g.fillRect(x, 0, 1, h);
    }
    g.fillStyle = 'rgba(239,231,219,.8)';
    for (let x = 0; x < w; x += 9) g.fillRect(x, 0, 1, h);
  }, [.48, 2], { transparent: true });
  // Keep these as texture specs: custom MeshPhong overrides swallowed the kit's gloss
  // flag and repeated the same UV scale twice. Polished surfaces opt into gloss below.
  K.texture('jwFoyerBronze', 128, 128, (g, w, h) => {
    g.fillStyle = '#756653'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < h; i += 2) { g.fillStyle = i % 6 ? 'rgba(225,203,169,.035)' : 'rgba(42,32,21,.04)'; g.fillRect(0, i, w, 1); }
  }, [1.2, 1.2]);
  K.texture('jwWallWash', 128, 256, (g, w, h) => {
    const glow = g.createRadialGradient(w / 2, h * .85, 0, w / 2, h * .85, h * .8);
    glow.addColorStop(0, 'rgba(255,195,104,.55)'); glow.addColorStop(.4, 'rgba(255,181,81,.22)'); glow.addColorStop(1, 'rgba(255,181,81,0)');
    g.fillStyle = glow; g.fillRect(0, 0, w, h);
  }, [1, 1], { transparent: true });

  // ---------- helpers (local frame) ----------
  // Record furnishing commands per visited floor, then let K.detail construct their geometry.
  // Slabs, opaque partitions, columns, rails and circulation execute immediately. The explicit
  // structural flag is for a stage/column/door built with a furniture primitive, not a size heuristic.
  let detailQueue = null;
  const DEC = fn => detailQueue ? detailQueue.push(fn) : fn();
  const STRUCT = fn => { const prev = detailQueue; detailQueue = null; try { return fn(); } finally { detailQueue = prev; } };
  const DETAIL = (floor, rect, name, fn, y1 = NEXT[floor]) => {
    const commands = [], prev = detailQueue;
    detailQueue = commands;
    try { fn(); } finally { detailQueue = prev; }
    K.detail({ floor, y0: Y[floor], y1, poly: RECT(...rect), name }, () => {
      for (const draw of commands) draw();
      commands.length = 0;
    });
  };
  const DK = Object.fromEntries(['quad', 'dome', 'hpoly', 'prism'].map(method => [method, (...args) => DEC(() => K[method](...args))]));
  const B = (o) => { const [x, z] = P(o.u ?? 0, o.v ?? 0); const { u, v, r, structural, ...rest } = o; const draw = () => K.box({ ...rest, x, z, rotY: R + (r || 0) }); return structural ? draw() : DEC(draw); };
  const SG = (text, o) => { const [x, z] = P(o.u, o.v); const { u, v, f, ...rest } = o; DEC(() => K.sign(text, { ...rest, x, z, rotY: FACE[f || 'S'] })); };
  const WL = (u0, v0, u1, v1, y0, y1, o = {}) => { const a = P(u0, v0), b = P(u1, v1); const draw = () => K.wall(a[0], a[1], b[0], b[1], y0, y1, o); return o.solid === false ? DEC(draw) : draw(); };
  const SLAB = (rect, y, o = {}) => K.slab(RECT(...rect), y, { ...o, holes: o.holes ? o.holes.map(h => RECT(...h)) : undefined });
  const PR = (rect, y0, y1, o = {}) => K.prism(RECT(...rect), y0, y1, o);
  const ZN = (name, floor, sub, rect, y0, y1, priority = 0) => K.zone({ name, floor, sub, poly: Array.isArray(rect[0]) ? rect : RECT(...rect), y0, y1, priority });
  const CY = (u, v, y, r, h, mat, o = {}) => { const [x, z] = P(u, v); const { structural, ...rest } = o; const draw = () => K.cyl({ x, y, z, r, h, mat, ...rest }); return structural ? draw() : DEC(draw); };
  const ESCL = (u0, v0, u1, v1, ya, yb, dir) => { const a = P(u0, v0), b = P(u1, v1); K.escalator(a[0], a[1], b[0], b[1], { ya, yb, dir, w: 1.1 }); };
  const STR = (u0, v0, u1, v1, ya, yb, w, o = {}) => { const a = P(u0, v0), b = P(u1, v1); K.stairs(a[0], a[1], b[0], b[1], { ya, yb, w, ...o }); };
  const FT = (text, o) => { const [x, z] = P(o.u, o.v); const { u, v, r, ...rest } = o; K.floorText(text, { ...rest, x, z, rotY: R + (r || 0) }); };
  const CROWD = (rect, y, n, seed) => DEC(() => K.crowd(RECT(...rect), y, n, { seed }));
  const MAN = (u, v, y, o = {}) => { const [x, z] = P(u, v); DEC(() => K.person(x, y, z, o)); };
  const TREE = (u, v, y, o = {}) => { const [x, z] = P(u, v); K.tree(x, z, { y, ...o }); };
  const SUBZ = (name, k, sub, rect, y1) => ZN(name, k, `${meta.name} · ${sub}`, rect, Y[k], y1 ?? NEXT[k], 1);
  const SUBZS = (name, k, sub, rect, y1) => ZN(name, k, sub, rect, Y[k], y1 ?? NEXT[k], 1);   // short label (dense floor plans)
  const HP = (mat, rect, y, up = true, holes) => K.hpoly(mat, Array.isArray(rect[0]) ? rect : RECT(...rect), y, up, holes ? holes.map(h => RECT(...h)) : undefined);
  const SPAWN = (name, u, v, y, du, dv) => { const [x, z] = P(u, v); K.spawn({ name, x, y, z, yaw: yawTo(du, dv) }); };
  // ceiling light panels (emit quads facing down) on a grid inside rect
  const LIGHTS = (rect, yc, sp = 4.2, s = 1.2, col = 0xfff3dc, skip) => {
    const [u0, v0, u1, v1] = rect;
    for (let u = u0 + sp / 2; u < u1; u += sp) for (let v = v0 + sp / 2; v < v1; v += sp) {
      if (skip && skip(u, v)) continue;
      const p = [P(u - s / 2, v - s / 2), P(u + s / 2, v - s / 2), P(u + s / 2, v + s / 2), P(u - s / 2, v + s / 2)];
      DK.quad({ tex: 'emit', color: col }, p.map(q => [q[0], yc - 0.02, q[1]]), [0, -1, 0]);
    }
  };
  const inR = (u, v, r, m = 0) => u > r[0] - m && u < r[2] + m && v > r[1] - m && v < r[3] + m;
  // railing (glass + handrail) along a local segment
  const RAIL = (u0, v0, u1, v1, y, h = 1.1) => STRUCT(() => { WL(u0, v0, u1, v1, y, y + h, { mat: GL, thick: 0.04 }); WL(u0, v0, u1, v1, y + h, y + h + 0.06, { mat: BRONZE, thick: 0.08, solid: false }); });
  const RAILBOX = (r, y, open) => { // glass rail around a void; open: 'n'|'s'|'e'|'w' side left open
    const [u0, v0, u1, v1] = r;
    if (open !== 'n') RAIL(u0, v0, u1, v0, y); if (open !== 's') RAIL(u0, v1, u1, v1, y);
    if (open !== 'w') RAIL(u0, v0, u0, v1, y); if (open !== 'e') RAIL(u1, v0, u1, v1, y);
  };
  // furniture
  const TABLE = (u, v, y, o = {}) => {
    const n = o.chairs ?? 4, rt = o.r ?? 0.55, th = o.h ?? 0.74;
    if (o.square) B({ u, v, y: y + th - 0.04, w: rt * 2, d: rt * 2, h: 0.04, mat: o.top ?? WALNUT, solid: false, skip: ['bottom'] });
    else CY(u, v, y + th - 0.04, rt, 0.04, o.top ?? 0xf6f2ea, { seg: 10, solid: false });
    CY(u, v, y, 0.07, th - 0.04, 0x3a3430, { seg: 6, caps: false });
    for (let i = 0; i < n; i++) {
      const a = (i + 0.5) / n * Math.PI * 2 + (o.rot || 0), cu = u + Math.cos(a) * (rt + 0.38), cv = v + Math.sin(a) * (rt + 0.38);
      B({ u: cu, v: cv, y, w: 0.46, d: 0.46, h: o.cover ? 0.95 : 0.46, mat: o.chair ?? 0x8a6e55, solid: false, skip: ['bottom'], r: -a });
      if (!o.cover) B({ u: u + Math.cos(a) * (rt + 0.6), v: v + Math.sin(a) * (rt + 0.6), y: y + 0.46, w: 0.46, d: 0.06, h: 0.45, mat: o.chair ?? 0x8a6e55, solid: false, skip: ['bottom'], r: Math.PI / 2 - a });
    }
    B({ u, v, y, w: rt * 1.6, d: rt * 1.6, h: th, mat: 0, solid: true, skip: ['top', 'bottom', 'n', 's', 'e', 'w'] }); // collision only
  };
  const SOFA = (u, v, y, w, face, mat = 0xcfc3b0) => { // face: direction the seat looks at
    const along = face === 'N' || face === 'S';
    const W = along ? w : 0.9, D = along ? 0.9 : w;
    B({ u, v, y, w: W, d: D, h: 0.42, mat, skip: ['bottom'] });
    const bu = face === 'E' ? -0.38 : face === 'W' ? 0.38 : 0, bv = face === 'S' ? -0.38 : face === 'N' ? 0.38 : 0;
    B({ u: u + bu, v: v + bv, y: y + 0.42, w: along ? w : 0.16, d: along ? 0.16 : w, h: 0.42, mat, solid: false, skip: ['bottom'] });
  };
  const PLANT = (u, v, y, s = 1) => { CY(u, v, y, 0.3 * s, 0.55 * s, 0x6e5a48, { seg: 8 }); B({ u, v, y: y + 0.55 * s, w: 0.7 * s, d: 0.7 * s, h: 1.1 * s, mat: 0x4c7a3e, solid: false, skip: ['bottom'] }); };
  const FLOWERS = (u, v, y, s = 1) => { CY(u, v, y, 0.9 * s, 0.85, 0x2b2622, { seg: 12 }); CY(u, v, y + 0.85, 0.3 * s, 0.5 * s, 0xe8e2d8, { seg: 8, solid: false }); for (let i = 0; i < 7; i++) { const a = i * 0.9; B({ u: u + Math.cos(a) * 0.35 * s, v: v + Math.sin(a) * 0.35 * s, y: y + 1.2 * s, w: 0.45 * s, d: 0.45 * s, h: 0.5 * s + (i % 3) * 0.2, mat: [0xe9d5c9, 0xc84d5a, 0xf2ead8, 0x6b8f4a, 0xd98ca2][i % 5], solid: false }); } };
  const CHAND = (u, v, yTop, s = 1) => { CY(u, v, yTop - 0.3, 0.05, 0.3, BRONZE, { seg: 4, solid: false, caps: false }); CY(u, v, yTop - 0.3 - 1.0 * s, 0.85 * s, 1.0 * s, { tex: 'glass', color: 0xfff6e0 }, { seg: 12, solid: false }); CY(u, v, yTop - 0.3 - 0.75 * s, 0.55 * s, 0.45 * s, { tex: 'emit', color: 0xffe9b8 }, { seg: 10, solid: false }); };
  const DOORP = (u, v, y, f, w = 1.0, mat = WALNUT, h = 2.25) => { // flat door panel on a wall face, f = facing
    const along = f === 'E' || f === 'W';
    B({ u, v, y, w: along ? 0.06 : w, d: along ? w : 0.06, h, mat, solid: false, skip: ['bottom', 'top'] });
    const hu = f === 'E' ? 0.05 : f === 'W' ? -0.05 : (w * 0.35), hv = f === 'S' ? 0.05 : f === 'N' ? -0.05 : (w * 0.35);
    B({ u: u + hu, v: v + hv, y: y + 1.0, w: 0.05, d: 0.05, h: 0.12, mat: 0xc9a85c, solid: false });
  };
  const BOH = (rect, y, h, mat = WARM) => PR(rect, y, y + h, { mat, top: false, bottom: false, walkTop: false });

  const SLATS = (axis, line, s0, s1, y, h, spacing = .24, section = {}) => {
    // w spans the screen; d is its depth, independent of wall orientation.
    const w = section.w ?? .075, d = section.d ?? .17;
    for (let s = s0; s <= s1; s += spacing) B({ u: axis === 'u' ? line : s, v: axis === 'u' ? s : line, y, w: axis === 'u' ? d : w, d: axis === 'u' ? w : d, h, mat: 'jwWalnut', solid: false });
  };
  const COVE = (rect, yc, finish = 0xe5ded0) => {
    const [a, b, c, d] = rect;
    HP(finish, rect, yc, false);
    for (const u of [a + .12, c - .12]) B({ u, v: (b + d) / 2, y: yc - .1, w: .14, d: d - b - .2, h: .035, mat: { tex: 'emit', color: 0xeec58c }, solid: false });
    for (const v of [b + .12, d - .12]) B({ u: (a + c) / 2, v, y: yc - .1, w: c - a - .2, d: .14, h: .035, mat: { tex: 'emit', color: 0xeec58c }, solid: false });
  };
  const ROUND = (u, v, y, r = .55, h = .72, top = 0xe7dfd0) => {
    CY(u, v, y + h - .055, r, .055, top, { seg: 20, solid: false });
    CY(u, v, y + .04, .065, h - .095, 0x282421, { seg: 8, solid: false });
    CY(u, v, y + .015, r * .48, .035, 0x282421, { seg: 12, solid: false });
    B({ u, v, y, w: r * 1.4, d: r * 1.4, h, mat: 0, solid: true, skip: ['top', 'bottom', 'n', 's', 'e', 'w'] });
  };
  const CONE = (u, v, y, rBottom, rTop, h, mat, o = {}) => {
    const seg = o.seg ?? 12, bottom = [], top = [];
    for (let i = 0; i < seg; i++) {
      const a = i / seg * Math.PI * 2, b = (i + 1) / seg * Math.PI * 2;
      const p = P(u + Math.cos(a) * rBottom, v + Math.sin(a) * rBottom);
      const q = P(u + Math.cos(b) * rBottom, v + Math.sin(b) * rBottom);
      const t = P(u + Math.cos(a) * rTop, v + Math.sin(a) * rTop);
      const s = P(u + Math.cos(b) * rTop, v + Math.sin(b) * rTop);
      const n = P(u + Math.cos((a + b) / 2), v + Math.sin((a + b) / 2)), c = P(u, v);
      const slope = (rBottom - rTop) / h, len = Math.hypot(1, slope);
      DK.quad(mat, [[p[0], y, p[1]], [q[0], y, q[1]], [s[0], y + h, s[1]], [t[0], y + h, t[1]]], [(n[0] - c[0]) / len, slope / len, (n[1] - c[1]) / len]);
      bottom.push(p); top.push(t);
    }
    DK.hpoly(mat, top, y + h, true); DK.hpoly(mat, bottom, y, false);
    if (o.solid) B({ u, v, y, w: Math.max(rBottom, rTop) * 1.4, d: Math.max(rBottom, rTop) * 1.4, h, mat: 0, solid: true, skip: ['top', 'bottom', 'n', 's', 'e', 'w'] });
  };
  const CHAIR = (u, v, y, face = 'S', mat = 0xb9a58a) => {
    const ang = { S: 0, E: Math.PI / 2, N: Math.PI, W: -Math.PI / 2 }[face];
    const at = (a, b) => [u + a * Math.cos(ang) + b * Math.sin(ang), v - a * Math.sin(ang) + b * Math.cos(ang)];
    CY(u, v, y + .36, .34, .14, mat, { seg: 12, solid: false });
    for (let i = 0; i < 10; i++) {
      const a = i / 10 * Math.PI, b = (i + 1) / 10 * Math.PI;
      const p = at(Math.cos(a) * .39, -Math.sin(a) * .34), q = at(Math.cos(b) * .39, -Math.sin(b) * .34);
      WL(...p, ...q, y + .42, y + .72 + .23 * Math.sin((a + b) / 2), { mat, thick: .09, solid: false });
    }
    for (const a of [-.25, .25]) for (const b of [-.23, .23]) { const p = at(a, b); B({ u: p[0], v: p[1], y, w: .035, d: .035, h: .38, mat: 0x272321, solid: false }); }
    B({ u, v, y: y + .18, w: .66, d: .64, h: .62, r: ang, mat: 0, solid: true, skip: ['top', 'bottom', 'n', 's', 'e', 'w'] });
  };
  const FLOWER = (u, v, y, s = 1, palette = [0x6b844b, 0xc36d45, 0xd8af70, 0xe0c6ad], o = {}) => {
    if (o.vase !== false) CY(u, v, y, .19 * s, .4 * s, 0xd4d1c5, { seg: 12, solid: false });
    const r = K.rand(Math.round((u + 90) * 113 + v * 17));
    for (let i = 0; i < (o.stems ?? 34); i++) {
      const a = i * 2.399, reach = (.18 + r() * .55) * s;
      const du = Math.cos(a) * reach, dv = Math.sin(a) * reach, h = (.45 + r() * .9) * s;
      const p = P(u, v), q = P(u + du, v + dv);
      DK.quad(0x596840, [[p[0] - .008, y + .25 * s, p[1]], [p[0] + .008, y + .25 * s, p[1]], [q[0] + .008, y + h, q[1]], [q[0] - .008, y + h, q[1]]], [0, 0, 1]);
      const [x, z] = P(u + du, v + dv);
      DK.dome({ x, y: y + h, z, rx: .08 * s, ry: .06 * s, rz: .09 * s, mat: palette[i % palette.length], seg: 6, rings: 3, hemi: false });
      const leaf = P(u + du * .65, v + dv * .65);
      DK.quad(0x536a3c, [[leaf[0] - .13 * s, y + h * .65, leaf[1]], [leaf[0], y + h * .8, leaf[1] + .1 * s], [leaf[0] + .13 * s, y + h * .65, leaf[1]], [leaf[0], y + h * .55, leaf[1] - .1 * s]], [0, 1, 0]);
    }
  };

  // Thin rods in local (u,y,v) coordinates, with round cross-section from every camera angle.
  const ROD = (a, b, radius, mat, seg = 6) => {
    const V = K.THREE.Vector3, ap = P(a[0], a[2]), bp = P(b[0], b[2]);
    const start = new V(ap[0], a[1], ap[1]), end = new V(bp[0], b[1], bp[1]);
    const axis = end.clone().sub(start).normalize(), across = new V(0, 1, 0);
    if (Math.abs(axis.y) > .95) across.set(1, 0, 0);
    across.cross(axis).normalize(); const other = axis.clone().cross(across);
    const offset = t => across.clone().multiplyScalar(Math.cos(t) * radius).addScaledVector(other, Math.sin(t) * radius);
    for (let i = 0; i < seg; i++) {
      const a0 = i * 2 * Math.PI / seg, a1 = (i + 1) * 2 * Math.PI / seg, p = offset(a0), q = offset(a1);
      DK.quad(mat, [start.clone().add(p).toArray(), end.clone().add(p).toArray(), end.clone().add(q).toArray(), start.clone().add(q).toArray()], offset((a0 + a1) / 2).normalize().toArray());
    }
  };
  const PLACESETTING = (u, v, y, du, dv) => {
    // Two plates, linen, knife/fork, water glass and stemware at a single cover.
    const px = u + du * .28, pz = v + dv * .28, sideU = -dv, sideV = du;
    CY(px, pz, y, .125, .012, 0xeeeae1, { seg: 20, solid: false });
    CY(px, pz, y + .012, .094, .009, 0xfaf5e9, { seg: 18, solid: false });
    B({ u: px, v: pz, y: y + .023, w: .11, d: .16, h: .018, r: du ? Math.PI / 2 : 0, mat: 0xe5ddcc, solid: false });
    for (const s of [-1, 1]) {
      const cu = px + sideU * .16 * s, cv = pz + sideV * .16 * s;
      B({ u: cu, v: cv, y: y + .009, w: du ? .17 : .018, d: du ? .018 : .17, h: .009, mat: 0xa9a79d, solid: false });
      if (s < 0) for (let i = 0; i < 3; i++) B({ u: cu + sideU * (i - 1) * .008 - du * .065, v: cv + sideV * (i - 1) * .008 - dv * .065, y: y + .01, w: .004, d: .028, h: .009, mat: 0xc7c5ba, solid: false });
    }
    const gu = u + sideU * .2 + du * .04, gv = v + sideV * .2 + dv * .04;
    CY(gu, gv, y + .005, .033, .09, { tex: 'glass', color: 0xe2e0d8 }, { seg: 10, caps: false, solid: false });
    CY(gu + du * .09, gv + dv * .09, y + .004, .034, .006, 0xc7c5bc, { seg: 10, solid: false });
    CY(gu + du * .09, gv + dv * .09, y + .01, .006, .07, 0xc7c5bc, { seg: 6, solid: false });
    CONE(gu + du * .09, gv + dv * .09, y + .08, .018, .038, .07, { tex: 'glass', color: 0xe7e4dc }, { seg: 10 });
  };

  // 1F edge walls (OSM line, inset), with openings given in the edge parameter (v for E/W, u for N/S)
  const EW = (edge, s0, s1, y0, y1, o = {}) => {
    const th = o.thick ?? 0.3; let A, Bp, at;
    if (edge === 'E') { A = [UE - th / 2, s1]; Bp = [UE - th / 2, s0]; at = s => s1 - s; }
    if (edge === 'W') { A = [UW + th / 2, s0]; Bp = [UW + th / 2, s1]; at = s => s - s0; }
    if (edge === 'N') { A = [s1, vN(s1) + th / 2]; Bp = [s0, vN(s0) + th / 2]; at = s => s1 - s; }
    if (edge === 'S') { A = [s0, vS(s0) - th / 2]; Bp = [s1, vS(s1) - th / 2]; at = s => s - s0; }
    WL(A[0], A[1], Bp[0], Bp[1], y0, y1, { ...o, thick: th, mat: o.mat, mat2: o.inner ?? o.mat, openings: (o.openings || []).map(p => ({ ...p, at: at(p.s) })) });
  };

  // =====================================================================
  // SLABS (every floor)
  // =====================================================================
  const FPL = FPOSM;
  // podium slabs inset 6 cm from the facade plane (outer wall face sits on the footprint line → slab edge z-fighting)
  const FPLI = FPL.map(([x, z]) => { const dx = x - C0[0], dz = z - C0[1], u = dx * EV[0] + dz * EV[1], v = dx * SV[0] + dz * SV[1]; return P(u - Math.sign(u) * 0.06, v - Math.sign(v) * 0.06); });
  const holesFor = (k) => {
    const h = [ELH];
    if (k !== 'B4') h.push(STH);
    if (ESC[k]) h.push(ESC[k]);
    if (k === '6F') h.push(BALL);
    if (k === 'B3') h.push(POOL, KIDS, SCUBA);
    if (k === '2F') h.push(HALL);
    if (k === '9F') h.push([3.0, 48.8, 5.2, 57]);
    return h;
  };
  const floorMat = { B4: { tex: 'tile', color: 0xc9c5bd }, B3: { tex: 'tile', color: 0xe6e2da }, B2: { tex: 'marble', color: 0xe8dfd0 }, B1: 'parking', '1F': 'jwHoney', '2F': { tex: 'marble', color: 0xeee4d4 }, '3F': 'jwCarpet', '4F': 'jwCarpet', '5F': 'jwCarpet', '6F': { tex: 'concrete', color: 0xcfcac2 }, '7F': { tex: 'sidewalk', color: 0xe2dacb }, '8F': 'jwHoney', '9F': 'jwChevron', '10F': 0xa59b8a, '11F': 0xa59b8a };
  for (const [k, y] of LV) {
    const tower = y >= Y['8F'];
    const poly = tower ? RECT(TW[0] + 0.06, TW[1] + 0.06, TW[2] - 0.06, TW[3] - 0.06) : (y > 1 ? FPLI : FPL);   // inset: keeps the slab edge off the facade plane (z-fighting)
    const holes = holesFor(k).map(h => RECT(...h));
    K.slab(poly, y, { mat: floorMat[k] ?? (tower ? 'jwCarpet' : 'tile'), under: k === 'B4' ? false : { tex: 'ceiling', color: 0xf4efe6 }, thick: 0.3, holes, edgeMat: STONE_D });
  }
  // tower roof + podium roof is the 7F slab
  SLAB([TW[0] + 0.06, TW[1] + 0.06, TW[2] - 0.06, TW[3] - 0.06], ROOF, { mat: 'roofgravel', under: { tex: 'ceiling', color: 0xf4efe6 }, thick: 0.4, holes: [] });

  // =====================================================================
  // ENVELOPE
  // =====================================================================
  // basement retaining walls
  K.polyWalls(FPL, Y.B4, -0.3, { mat: 0x8d8a84, inner: 0xd9d4cb, thick: 0.4 });
  // 1F: shared walls N/W (stone both sides, junction openings), glass storefront E/S
  const H1 = 6;
  EW('N', UW, UE, 0, H1, { mat: { tex: 'jwStone' }, inner: WARM, openings: [{ s: -0.04, w: 6.6, y0: 0, y1: 3.3 }] });               // J5 → 신세계
  EW('W', -60.88, 60.58, 0, H1, { mat: { tex: 'jwStone' }, inner: WARM, openings: [{ s: -0.12, w: 6.6, y0: 0, y1: 3.3 }] });         // J6 → 센트럴시티
  EW('E', -60.58, -30, 0, H1, { mat: { tex: 'jwStone' }, inner: WARM });
  EW('E', -30, 60.89, 0, 4.2, { mat: GL, thick: 0.06, openings: [{ s: 0, w: 5, y0: 0, y1: 3.4 }, { s: 44.5, w: 3.2, y0: 0, y1: 3.4 }, { s: 52.5, w: 3.2, y0: 0, y1: 3.4 }] });
  EW('E', -30, 60.89, 4.2, H1, { mat: { tex: 'jwStone' }, inner: WARM });
  EW('S', UW, -10, 0, H1, { mat: { tex: 'jwStone' }, inner: WARM });
  EW('S', -10, UE, 0, 4.2, { mat: GL, thick: 0.06, openings: [{ s: 8, w: 4, y0: 0, y1: 3.4 }] });
  EW('S', -10, UE, 4.2, H1, { mat: { tex: 'jwStone' }, inner: WARM });
  // 1F stone piers on the glass storefronts
  for (let v = -27; v <= 60; v += 6) if (Math.abs(v - 0) > 3.2 && Math.abs(v - 44.5) > 2.2 && Math.abs(v - 52.5) > 2.2) B({ u: UE - 0.2, v, y: 0, w: 0.7, d: 0.9, h: 4.2, mat: { tex: 'jwStone' } });
  for (let u = -8; u <= 32; u += 6) if (Math.abs(u - 8) > 2.6) B({ u, v: vS(u) - 0.2, y: 0, w: 0.9, d: 0.7, h: 4.2, mat: { tex: 'jwStone' } });
  // 2F–6F podium bands
  for (const k of ['2F', '3F', '4F', '5F', '6F']) K.polyWalls(FPL, Y[k], NEXT[k], { mat: { tex: 'jwPodium' }, inner: WARM, thick: 0.35, floorH: NEXT[k] - Y[k] });
  // podium cornice + 7F parapet (stone base + glass balustrade)
  K.polyWalls(FPL, Y['7F'] - 0.6, Y['7F'] + 0.45, { mat: STONE_D, inner: STONE, thick: 0.5 });
  K.polyWalls(FPL, Y['7F'] + 0.45, Y['7F'] + 1.25, { mat: GL, thick: 0.04 });
  // tower bands
  const twp = RECT(...TW);
  const opW = (u, v, w, y0, y1) => { const [x, z] = P(u, v); return { x, z, w, y0, y1 }; };
  K.polyWalls(twp, Y['7F'], Y['8F'], { mat: GL, thick: 0.05, openings: [opW(4, 6, 3.2, Y['7F'], Y['7F'] + 2.8), opW(-8, 20, 2.4, Y['7F'], Y['7F'] + 2.8), opW(-8, 50, 2.4, Y['7F'], Y['7F'] + 2.8), opW(16, 50, 2.4, Y['7F'], Y['7F'] + 2.8), opW(4, 58, 3.2, Y['7F'], Y['7F'] + 2.8)] });
  K.polyWalls(twp, Y['8F'], Y['12F'], { mat: GLD, thick: 0.05 });
  // room shaft 12F–32F: ribbon-window facade texture; two show rooms get real clear windows (2006 west, 2014 east)
  const SHOWW = [[-8, 33.0, 4.0, Y['20F']], [16, 42.5, 5.4, Y['20F']]];
  K.polyWalls(twp, Y['12F'], Y['33F'], { mat: { tex: 'jwTower' }, inner: 0xe9e1d3, thick: 0.3, floorH: 3.6, openings: SHOWW.map(([u, v, w, y]) => opW(u, v, w, y + 0.95, y + 2.75)) });
  for (const [u, v, w, y] of SHOWW) {
    const uu = u < 0 ? u + 0.05 : u - 0.05;
    WL(uu, v - w / 2, uu, v + w / 2, y + 0.95, y + 2.75, { mat: { tex: 'glass', color: 0xc8dcea }, thick: 0.03 });
    for (let k = 0; k <= 3; k++) B({ u: uu, v: v - w / 2 + k * w / 3, y: y + 0.95, w: 0.12, d: 0.08, h: 1.8, mat: 0x2a3644, solid: false, skip: ['top', 'bottom'] });
    B({ u: u < 0 ? u + 0.3 : u - 0.3, v, y: y + 0.82, w: 0.45, d: w, h: 0.13, mat: 0xefe8dc, skip: ['bottom'] });   // window sill
  }
  K.polyWalls(twp, Y['33F'], ROOF, { mat: GLD, thick: 0.05 });
  // spandrel bands on the glass floors (8F–11F lobby block, 33F penthouse)
  for (const y of [Y['7F'], Y['8F'], Y['9F'], Y['10F'], Y['11F'], Y['12F'], Y['33F'], Y['33F'] + 3.6]) {
    B({ u: -8.12, v: 32, y: y - 0.45, w: 0.24, d: 52.5, h: 0.75, mat: 0xe4ded2, solid: false });
    B({ u: 16.12, v: 32, y: y - 0.45, w: 0.24, d: 52.5, h: 0.75, mat: 0xe4ded2, solid: false });
    B({ u: 4, v: 5.88, y: y - 0.45, w: 24.5, d: 0.24, h: 0.75, mat: 0xe4ded2, solid: false });
    B({ u: 4, v: 58.12, y: y - 0.45, w: 24.5, d: 0.24, h: 0.75, mat: 0xe4ded2, solid: false });
  }
  for (const k of ['9F', '10F', '11F']) {
    const y = Y[k] + 0.3, h = 0.75;
    B({ u: -8.12, v: 32, y, w: 0.24, d: 52.5, h, mat: 0xe4ded2, solid: false }); B({ u: 16.12, v: 32, y, w: 0.24, d: 52.5, h, mat: 0xe4ded2, solid: false });
    B({ u: 4, v: 5.88, y, w: 24.5, d: 0.24, h, mat: 0xe4ded2, solid: false }); B({ u: 4, v: 58.12, y, w: 24.5, d: 0.24, h, mat: 0xe4ded2, solid: false });
  }
  // glass-band mullions
  for (const [y0, y1] of [[Y['8F'], Y['12F']], [Y['33F'], ROOF]]) {
    for (let v = 7.5; v < 58; v += 1.5) { B({ u: -8.07, v, y: y0, w: 0.14, d: 0.08, h: y1 - y0, mat: 0x26323f, solid: false, skip: ['top', 'bottom'] }); B({ u: 16.07, v, y: y0, w: 0.14, d: 0.08, h: y1 - y0, mat: 0x26323f, solid: false, skip: ['top', 'bottom'] }); }
    for (let u = -6.5; u < 16; u += 1.5) { B({ u, v: 5.93, y: y0, w: 0.08, d: 0.14, h: y1 - y0, mat: 0x26323f, solid: false, skip: ['top', 'bottom'] }); B({ u, v: 58.07, y: y0, w: 0.08, d: 0.14, h: y1 - y0, mat: 0x26323f, solid: false, skip: ['top', 'bottom'] }); }
  }
  // crown (135.8 → 144): flat cream stone band, dark window strip at its foot, square plaque + dark slot on the short faces
  K.polyWalls(twp, ROOF, CROWN, { mat: { tex: 'jwCrown' }, inner: STONE_D, thick: 0.5 });
  K.polyWalls(twp, CROWN, CROWN + 0.25, { mat: 0xcfc8ba, thick: 0.7 });
  B({ u: -8.3, v: 32, y: ROOF + 0.5, w: 0.1, d: 51.2, h: 0.9, mat: 0x22374f, solid: false, skip: ['top', 'bottom'] });
  B({ u: 16.3, v: 32, y: ROOF + 0.5, w: 0.1, d: 51.2, h: 0.9, mat: 0x22374f, solid: false, skip: ['top', 'bottom'] });
  for (const [v, f, dv] of [[5.7, 'N', -0.06], [58.3, 'S', 0.06]]) {
    B({ u: 4, v, y: Y['31F'], w: 1.4, d: 0.12, h: ROOF + 2.0 - Y['31F'], mat: 0x22374f, solid: false });
    B({ u: 4, v, y: ROOF + 1.9, w: 5.4, d: 0.16, h: 5.4, mat: 0x2a2018, solid: false });
    SG(['JW'], { u: 4, v: v + dv * 2, y: ROOF + 4.6, w: 4.6, h: 3.0, f, bg: '#b8975a', fg: '#2a2018', bold: true });
    SG(['MARRIOTT'], { u: 4, v: v + dv * 2, y: ROOF + 2.55, w: 4.6, h: 1.0, f, bg: '#b8975a', fg: '#2a2018' });
  }
  B({ u: -4.5, v: 12, y: ROOF, w: 4, d: 3.2, h: 2.6, mat: 0x9a9690 }); B({ u: 12, v: 52, y: ROOF, w: 4, d: 3.2, h: 2.6, mat: 0x9a9690 });
  for (let i = 0; i < 3; i++) CY(12 + (i - 1) * 1.4, 12, ROOF, 0.55, 2.2, 0xa8a49c, { seg: 10 });
  PR([-1, 22, 9, 42], ROOF, ROOF + 4.5, { mat: 0xb9b2a4, top: 0x8a857c });   // machine room / BMU housing
  // JW MARRIOTT letters at the top of the long faces (navy letters, as in the 2009 photo)
  SG(['JW MARRIOTT'], { u: -8.32, v: 32, y: ROOF + 5.6, w: 28, h: 2.8, f: 'W', bg: '#e4ded2', fg: '#1d3566', bold: true });
  SG(['JW MARRIOTT'], { u: 16.32, v: 32, y: ROOF + 5.6, w: 28, h: 2.8, f: 'E', bg: '#e4ded2', fg: '#1d3566', bold: true });

  // =====================================================================
  // CORE: stairs + guest elevator + service blocks (B4 → 33F)
  // =====================================================================
  const coreMat = { tex: 'jwStone', color: 0xe6dccb };
  PR([11.1, 30.75, 15.8, 33.25], Y.B4, ROOF, { mat: coreMat, top: false, bottom: false, walkTop: false });
  PR([8.8, 33.25, 15.8, 39.5], Y.B4, ROOF, { mat: coreMat, top: false, bottom: false, walkTop: false });
  const topStair = Y['33F'] + 3.2;
  WL(8.85, 24.2, 15.85, 24.2, Y.B4, topStair, { mat: coreMat, mat2: 0xd9d4cb, thick: 0.2 });
  WL(8.85, 30.65, 15.85, 30.65, Y.B4, topStair, { mat: 0xd9d4cb, thick: 0.2 });
  WL(15.85, 24.2, 15.85, 30.65, Y.B4, Y['7F'], { mat: coreMat, mat2: 0xd9d4cb, thick: 0.2 });
  WL(8.85, 24.2, 8.85, 30.65, Y.B4, topStair, { mat: coreMat, mat2: 0xd9d4cb, thick: 0.2, openings: LV.map(([, y]) => ({ at: 3.2, w: 1.7, y0: y, y1: y + 2.3 })) });
  for (let i = 0; i < LV.length; i++) {
    const [k, y] = LV[i];
    // decorative elevator doors + floor plate signage at the hall
    for (const dv of [34.9, 37.7]) { if (k === '1F' && dv === 37.7) continue; B({ u: 8.76, v: dv, y, w: 0.05, d: 1.15, h: 2.35, mat: k === '1F' ? 0x3d3028 : 0x8a7458, solid: false, skip: ['top', 'bottom'] }); }
    if (!['1F', '2F', '8F'].includes(k)) SG([k], { u: 8.72, v: 36.3, y: y + 2.75, w: 1.0, h: 0.45, f: 'W', bg: '#2b241d', fg: '#e8d6b0' });
    SG(['비상구'], { u: 8.72, v: 27.4, y: y + 2.55, w: 0.9, h: 0.28, f: 'W', bg: '#1d7a3a', fg: '#ffffff' });
    // Round 10: photos 07/08 establish reception on 8F. The audit requests lift-only
    // visitor access from L; the photographs do not establish exclusive circulation.
    // Close the existing emergency-core portals on every floor reachable by the L–5F
    // escalators, so that those stairs cannot become an invented check-in route.
    // Keep the flights intact; these static door leaves implement visitor circulation,
    // not a claim about surveyed fire-door appearance or real emergency operation.
    if (['1F', '2F', '3F', '4F', '5F'].includes(k)) {
      B({ u: 8.85, v: 27.4, y, w: .1, d: 1.7, h: 2.3, mat: 0x3e342c, structural: true });
      B({ u: 8.79, v: 27.4, y: y + .95, w: .025, d: 1.25, h: .055, mat: BRONZE, solid: false });
      SG(['비상계단', '8층 체크인은 엘리베이터 이용'], { u: 8.78, v: 27.4, y: y + 1.6, w: 1.35, h: .35, f: 'W', bg: '#3e342c', fg: '#ece2db', bold: false });
    }
    if (i === LV.length - 1) break;
    const h = LV[i + 1][1] - y;
    STR(10.4, 25.4, 14.2, 25.4, y, y + h / 2, 1.8);
    B({ u: 15.0, v: 27.425, y: y + h / 2 - 0.2, w: 1.6, d: 6.35, h: 0.2, mat: 0x9a958e });
    STR(14.2, 28.6, 10.4, 28.6, y + h / 2, y + h, 1.8);
  }
  // close the stair eye + south gap so you cannot drop through the shaft (landing edges)
  for (const u of [10.4, 14.2]) for (const [v0, v1] of [[26.3, 27.7], [29.5, 30.55]]) WL(u, v0, u, v1, Y.B4, topStair, { mat: 0xb8b2a8, thick: 0.06 });
  K.groundHole(RECT(...STH));
  const elevFloors = [
    ['B4', '마르퀴스 피트니스 · 농구장 · 스쿼시 · 조깅트랙'], ['B3', '마르퀴스 수영장 · 키즈풀 · 스쿠버풀'], ['B2', '마르퀴스 스파 리셉션 · 라커 · 스파 레스토랑'], ['B1', '호텔 주차장'],
    ['1F', '호텔 현관 · 컨시어지 · 센트럴시티 연결'], ['2F', '플레이버즈 · 타마유라 · 파티세리'], ['3F', '연회장 살롱 1–6'], ['4F', '웨딩 · 연회 사무실'], ['5F', '그랜드 볼룸'], ['6F', '연회 지원 (직원)'],
    ['7F', '더 마고 그릴 · 모보 바 · JW 가든'], ['8F', '로비 · 체크인 · 더 라운지'], ['9F', '이그제큐티브 라운지'], ['10F', '사무실'], ['11F', '호텔 사무실'],
  ];
  for (const n of ROOMF) elevFloors.push([n + 'F', `객실 ${n}01–${n}19`]);
  elevFloors.push(['33F', '펜트하우스']);
  // elevator hall dressing on every stop: bronze portal, call-button plate, floor + use sign, core zone for the map
  const ELNAME = Object.fromEntries(elevFloors);
  for (const [k, y] of LV) {
    for (const dv of [-0.68, 0.68]) B({ u: 8.7, v: EL.v + dv, y, w: 0.1, d: 0.14, h: 2.32, mat: 0x544739, solid: false });
    B({ u: 8.7, v: EL.v, y: y + 2.2, w: 0.1, d: 1.5, h: 0.14, mat: 0x544739, solid: false });
    B({ u: 8.74, v: 33.6, y: y + 0.95, w: 0.04, d: 0.16, h: 0.36, mat: 0x544739, solid: false });
    for (const dy of [1.04, 1.2]) B({ u: 8.71, v: 33.6, y: y + dy, w: 0.03, d: 0.07, h: 0.07, mat: { tex: 'emit', color: 0xffd890 }, solid: false });
    if (!['1F', '2F', '8F'].includes(k)) SG([k, ELNAME[k] || ''], { u: 8.68, v: EL.v, y: y + 2.95, w: 2.0, h: 0.55, f: 'W', bg: '#2b241d', fg: '#e8d6b0' });
    else if (k !== '1F') SG(k, { u: 8.68, v: EL.v, y: y + 2.65, w: .35, h: .18, f: 'W', bg: null, fg: '#c5aa7b', bold: false });
    SUBZS('엘리베이터 · 계단', k, 'B4–33F', [8.8, 24.2, 15.85, 39.5]);
  }
  const [ex, ez] = P(EL.u, EL.v);
  // Keep the kit interaction and all stops; draw its shaft locally so photo 06's flush
  // bronze doors do not inherit the kit's red LED signs and pale wall caps.
  K.elevator({ name: 'JW 메리어트 엘리베이터', x: ex, z: ez, rotY: FACE.W, w: 2.2, d: 2.2, shaft: false, mat: 0x3e342c, doorMat: 0x3e342c, floors: elevFloors.map(([label, name]) => ({ label, y: Y[label], name })) });
  const shaftTop = Y['33F'] + 3.2, shaftStyle = { mat: 0x3e342c, capMat: 0x3e342c, thick: .15 };
  WL(11, 30.9, 11, 33.1, Y.B4, shaftTop, shaftStyle);
  WL(8.8, 30.9, 11, 30.9, Y.B4, shaftTop, shaftStyle);
  WL(11, 33.1, 8.8, 33.1, Y.B4, shaftTop, shaftStyle);
  WL(8.8, 33.1, 8.8, 30.9, Y.B4, shaftTop, { ...shaftStyle, openings: LV.map(([, y]) => ({ at: 1.1, w: 1.2, y0: y, y1: y + 2.4 })) });
  for (const [, y] of LV) SLAB([8.8, 30.9, 11, 33.1], y, { mat: 'jwGreyStone', under: 0x3e342c, thick: .05, edge: false, ceil: false });

  // =====================================================================
  // ZONES (one per floor)
  // =====================================================================
  const NM = meta.name;
  const zf = (k, sub, rect) => ZN(NM, k, sub, rect ?? (Y[k] >= Y['8F'] ? TW : FPL), Y[k], NEXT[k]);
  zf('B4', '마르퀴스 스파 & 피트니스 클럽 · 피트니스 · 농구 코트 · 스쿼시 · 85m 조깅트랙');
  zf('B3', '마르퀴스 스파 & 피트니스 클럽 · 25m 6레인 수영장 · 키즈풀 · 자쿠지 · 스쿠버풀');
  zf('B2', '마르퀴스 스파 & 피트니스 클럽 · 리셉션 · 스파 트리트먼트 · 라커 · 스파 레스토랑');
  zf('B1', '호텔 주차장 · 엘리베이터 홀');
  zf('1F', '호텔 현관 · 컨시어지 · 벨 데스크 · 신세계/센트럴시티 연결 아케이드');
  zf('2F', '플레이버즈(뷔페) · 타마유라(일식) · 파티세리 · 카페 원');
  zf('3F', '연회장 살롱 1–6 · 프리펑션');
  zf('4F', '웨딩 상담 · 연회 사무실');
  zf('5F', '그랜드 볼룸 (천고 7m · 버진로드 21m) · 신부 대기실');
  zf('6F', '연회 지원 · 볼룸 상부 (직원 구역)');
  zf('7F', 'JW 가든 · 더 마고 그릴 · 모보 바', FPL);
  zf('8F', '로비 · 프런트 데스크(체크인) · 더 라운지');
  zf('9F', '이그제큐티브 라운지 · 비즈니스 센터');
  zf('10F', '사무실');
  zf('11F', '사무실');
  for (const n of ROOMF) zf(n + 'F', `객실층 · ${n}01–${n}19호`);
  zf('33F', '펜트하우스 (복층)');

  // =====================================================================
  // SPAWNS
  // =====================================================================
  SPAWN('JW 메리어트 1F 목걸이 조형물', 14.4, 48.5, 0, -1, 0);
  SPAWN('JW 메리어트 1F 승강기 홀', 6.3, 40, 0, .15, -1);
  SPAWN('더 라운지 8F · 피아노와 소파', 1.4, 36.9, Y['8F'], -1, -.05);
  SPAWN('더 라운지 8F · 바', -2.1, 16.4, Y['8F'], 0, -1);
  SPAWN('플레이버즈 2F · 입구', 6.5, 19, Y['2F'], -1, 0);
  SPAWN('플레이버즈 2F · 다이닝', -9, 29, Y['2F'], -1, .4);
  SPAWN('그랜드 볼룸 5F · 포이어', -10, -3.2, Y['5F'], 1, 0);
  SPAWN('이그제큐티브 라운지 9F', 5.5, 22, Y['9F'], .5, -1);
  SPAWN('JW 가든 (7F)', 4, -20, Y['7F'], 0, 1);
  SPAWN('마르퀴스 수영장 (B3)', -6, -10, Y.B3, -.4, -1);
  SPAWN('객실 2006 (20F)', -1.3, 34.5, Y['20F'], -1, -.55);

  // ---------- floors ----------
  // ---------- sub-zones (map search + HUD) ----------

  // shop/restaurant front: axis 'u' = wall along v at u=line, axis 'v' = wall along u at v=line
  const FRONT = (axis, line, s0, s1, y, yc, f, label, o = {}) => {
    const dc = o.door ?? (s0 + s1) / 2, dw = o.dw ?? 2.6, gh = o.gh ?? 3.2;
    const seg = (a, b, y0, y1, opts) => axis === 'u' ? WL(line, a, line, b, y0, y1, opts) : WL(a, line, b, line, y0, y1, opts);
    // 2F restaurant entries: lettering on walnut piers, as at FLAVORS (photo 18).
    if (y === Y['2F']) {
      seg(s0, s1, y, yc, { mat: 'jwWalnut', thick: .2, openings: [{ at: dc - s0, w: dw, y0: y, y1: y + gh }] });
      const off = { E: [.12, 0], W: [-.12, 0], N: [0, -.12], S: [0, .12] }[f];
      let cs = o.signAt ?? (s0 + s1) / 2;
      if (Math.abs(cs - dc) < dw / 2 + 1) cs = dc - dw / 2 - 1.3;
      SG(label, { u: (axis === 'u' ? line : cs) + off[0], v: (axis === 'u' ? cs : line) + off[1], y: y + 2.6, w: 1.8, h: .2, f, bg: null, fg: '#c4a273', font: 'Georgia, serif', bold: false });
      return;
    }
    seg(s0, s1, y, y + gh, { mat: o.glass ?? GL, thick: 0.05, openings: [{ at: dc - s0, w: dw, y0: y, y1: y + gh }] });
    seg(s0, s1, y + gh, yc, { mat: o.fascia ?? 0x2e2925, mat2: o.inner ?? WARM, thick: 0.25 });
    for (let s = s0 + 1.6; s < s1 - 0.2; s += 1.6) if (Math.abs(s - dc) > dw / 2 + 0.15) B(axis === 'u' ? { u: line, v: s, y, w: 0.09, d: 0.09, h: gh, mat: BRONZE, solid: false, skip: ['top', 'bottom'] } : { u: s, v: line, y, w: 0.09, d: 0.09, h: gh, mat: BRONZE, solid: false, skip: ['top', 'bottom'] });
    const off = { E: [0.16, 0], W: [-0.16, 0], N: [0, -0.16], S: [0, 0.16] }[f];
    const cs = o.signAt ?? (s0 + s1) / 2, fh = yc - y - gh;
    SG([label], { u: (axis === 'u' ? line : cs) + off[0], v: (axis === 'u' ? cs : line) + off[1], y: y + gh + fh / 2, w: Math.min((s1 - s0) * 0.75, o.sw ?? 9), h: Math.min(1.15, fh * 0.75), f, bg: o.bg ?? HEX(o.fascia ?? 0x2e2925), fg: o.fg ?? '#f2e6cf', sub: o.sub, subFg: o.subFg });
  };
  // rooms along a wall line with door openings + labels. rooms: [[s0,s1,label]], doorFace = side the doors face
  const ROOMROW = (axis, line, rooms, y, h, f, o = {}) => {
    const s0 = rooms[0][0], s1 = rooms[rooms.length - 1][1];
    const ops = rooms.map(([a, b]) => ({ at: (o.doorAt ? o.doorAt(a, b) : (a + b) / 2) - s0, w: o.dw ?? 1.6, y0: y, y1: y + (o.dh ?? 2.6) }));
    if (axis === 'u') WL(line, s0, line, s1, y, y + h, { mat: o.mat ?? WARM, mat2: o.mat2 ?? o.mat ?? WARM, thick: 0.2, openings: ops });
    else WL(s0, line, s1, line, y, y + h, { mat: o.mat ?? WARM, mat2: o.mat2 ?? o.mat ?? WARM, thick: 0.2, openings: ops });
    const off = { E: [0.12, 0], W: [-0.12, 0], N: [0, -0.12], S: [0, 0.12] }[f];
    for (const [a, b, label] of rooms) {
      const c = o.doorAt ? o.doorAt(a, b) : (a + b) / 2;
      SG([label], { u: (axis === 'u' ? line : c) + off[0], v: (axis === 'u' ? c : line) + off[1], y: y + (o.dh ?? 2.6) + 0.35, w: o.lw ?? 1.6, h: 0.36, f, bg: o.lbg ?? '#3a2f26', fg: o.lfg ?? '#f0e2c4' });
    }
  };
  const PARTS = (axis, at, list, a0, a1, y, h, mat = WARM) => { for (const s of list) axis === 'u' ? WL(s, a0, s, a1, y, y + h, { mat, thick: 0.15 }) : WL(a0, s, a1, s, y, y + h, { mat, thick: 0.15 }); };

  DETAIL('1F', [UW, -60.7, UE, 60.9], '현관 홀 · 승강기 로비 · 아케이드', floor1, 8.32);
  DETAIL('2F', [UW, -60.7, UE, 60.9], '플레이버즈 · 파티세리 · 타마유라', floor2);
  floor3(); floor4();
  DETAIL('5F', [UW, -60.7, UE, 60.9], '그랜드 볼룸 · 포이어', floor5, 28.4);
  floor6(); floor7();
  DETAIL('8F', TW, '더 라운지 · 프런트', floor8);
  floors9to11(); roomFloors(); floor33(); basements(); exterior();

  // =====================================================================
  // 1F — 현관 로비 + 센트럴시티/신세계 연결 아케이드
  // =====================================================================
  function floor1() {
    const y = 0, yc = NEXT['1F'] - 0.3;
    // arcade floor runners
    HP({ tex: 'marble', color: 0xb8ab98 }, [-0.7, -60.4, 0.7, -4], y + 0.012);
    HP({ tex: 'marble', color: 0xb8ab98 }, [-33, -0.7, -4, 0.7], y + 0.012);
    // NW: 쉐이크쉑
    FRONT('u', -4, -60.4, -38, y, yc, 'E', 'SHAKE SHACK', { sub: '쉐이크쉑', fascia: 0x1f1f1f, fg: '#ffffff', subFg: '#9ccf5a' });
    WL(-33.1, -38, -4, -38, y, yc, { mat: WARM });
    HP({ tex: 'wood', color: 0xc49a6a }, [-33, -60.4, -4, -38], y + 0.01);
    B({ u: -30.4, v: -49, y, w: 1.2, d: 13, h: 1.05, mat: 0x2b2b2b, top: 0xd8d2c6 });
    SG(['SHAKE SHACK', '버거 · 핫도그 · 셰이크 · 프라이'], { u: -32.9, v: -49, y: 3.2, w: 9, h: 1.6, f: 'E', bg: '#111', fg: '#ffffff' });
    for (let u = -25; u <= -7; u += 3.6) for (let v = -57.5; v <= -41; v += 3.3) TABLE(u, v, y, { square: true, r: 0.4, chairs: 2, chair: 0x5a5a5a, top: 0x8b6b4a, rot: Math.PI / 2 });
    CROWD([-28, -58, -6, -40], y, 12, 11);
    SUBZ('쉐이크쉑', '1F', '버거 · 센트럴시티 연결 아케이드', [-33, -60.4, -4, -38]);
    // NW middle: closed block with light-box posters + toilets
    BOH([-33.1, -38, -4, -4], y, yc - y);
    const posters = [['JW 메리어트 호텔 서울', '플레이버즈 2F · 올데이 뷔페'], ['마르퀴스 스파 & 피트니스', 'B2 – B4 · 06:00 – 22:00'], ['그랜드 볼룸 5F', '웨딩 · 연회 문의'], ['더 마고 그릴 7F', '우드 파이어 그릴 · JW 가든']];
    posters.forEach((t, i) => { B({ u: -4.08, v: -34 + i * 7.5, y: 0.6, w: 0.12, d: 3.2, h: 2.3, mat: 0x222222, solid: false }); SG(t, { u: -3.97, v: -34 + i * 7.5, y: 1.75, w: 3.0, h: 2.1, f: 'E', bg: '#efe6d6', fg: '#4a3a2a' }); });
    DOORP(-24, -4.03, y, 'S', 1.2, 0xbcae98); DOORP(-18, -4.03, y, 'S', 1.2, 0xbcae98);
    SG(['화장실'], { u: -21, v: -3.95, y: 2.75, w: 2.2, h: 0.45, f: 'S', bg: '#2b241d', fg: '#f0e2c4' });
    // NE: back of house, 순대실록, 101번지남산돈까스
    BOH([4, -60.4, 33.1, -30], y, yc - y, { tex: 'jwStone' });
    DOORP(4.03, -40, y, 'W', 1.8, 0x7d7a74); SG(['직원 출입구 · 하역장'], { u: 3.95, v: -40, y: 2.75, w: 2.6, h: 0.4, f: 'W', bg: '#333', fg: '#fff' });
    FRONT('u', 4, -30, -17, y, yc, 'W', '순대실록', { sub: '센트럴시티점', fascia: 0x5a2a1c, fg: '#f6e7c8' });
    FRONT('u', 4, -17, -4, y, yc, 'W', '101번지남산돈까스', { sub: '센트럴시티점', fascia: 0x1c3a5a, fg: '#ffffff', sw: 10 });
    WL(4, -17, 33.1, -17, y, yc, { mat: WARM, thick: 0.2 });
    WL(4, -4, 33.1, -4, y, yc, { mat: WARM, thick: 0.2 });
    for (const [v0, v1, c] of [[-30, -17, 0xa0522d], [-17, -4, 0x2a5a8a]]) {
      HP({ tex: 'wood', color: 0xb98f63 }, [4, v0, 33, v1], y + 0.01);
      B({ u: 31.6, v: (v0 + v1) / 2, y, w: 1.4, d: v1 - v0 - 2, h: 1.05, mat: 0x4a3a2e, top: 0xe2dccf });
      SG(['주방'], { u: 33.0, v: (v0 + v1) / 2, y: 2.6, w: 2, h: 0.5, f: 'W', bg: '#' + c.toString(16), fg: '#fff' });
      for (let u = 8; u <= 27; u += 3.4) for (let v = v0 + 2.2; v < v1 - 1.5; v += 3.4) TABLE(u, v, y, { square: true, r: 0.45, chairs: 4, rot: Math.PI / 4, chair: 0x6b4a32 });
      CROWD([6, v0 + 1, 28, v1 - 1], y, 7, v0);
    }
    SUBZ('순대실록 센트럴시티점', '1F', '순대국 · 한식', [4, -30, 33, -17]);
    SUBZ('101번지남산돈까스 센트럴시티점', '1F', '돈까스', [4, -17, 33, -4]);
    // SW: hotel back office / luggage / toilets
    BOH([-33.1, 4, -4, 60.4], y, yc - y);
    DOORP(-3.97, 8, y, 'E', 1.2, 0xbcae98); DOORP(-3.97, 12, y, 'E', 1.2, 0xbcae98);
    SG(['화장실'], { u: -3.9, v: 10, y: 2.75, w: 2.2, h: 0.45, f: 'E', bg: '#2b241d', fg: '#f0e2c4' });
    B({ u: -3.6, v: 30, y, w: 0.8, d: 4, h: 1.05, mat: WALNUT, top: 0xe8e0d0 }); SG(['수하물 보관'], { u: -3.9, v: 30, y: 2.4, w: 2.6, h: 0.45, f: 'E', bg: '#2b241d', fg: '#f0e2c4' });
    // ---- ground entrance hall, photos 05/11/12/14/15 ----
    // A local void in 2F makes the photographed ~8 m room without altering facade bands.
    HP('jwHoney', [-4, 4, 33, 60.4], .009, true, [[21.4, 29.5, 29.8, 41.8], [8.8, 24.2, 15.9, 39.5]]);
    HP('jwWalnut', [-4, 4, 33, 60.4], 5.66, false, [HALL, [8.8, 24.2, 15.9, 39.5], [21.4, 29.5, 29.8, 41.8]]);
    PR(HALL, 8.15, 8.32, { mat: { tex: 'emit', color: 0x6b4528 }, top: false, walkTop: false });
    // 11/15: two interlocked L/T strokes per half-cell, with .23 m clear pockets inside each .6 m module.
    for (let u = -1.7, i = 0; u < 16.3; u += .6, i++) for (let v = 42.3, j = 0; v < 54.8; v += .6, j++) {
      const mat = (i + j) % 3 === 0 ? 0x8c6343 : 'jwWalnut';
      for (const offset of [0, .3]) {
        B({ u, v: v + offset, y: 7.93, w: .6, d: .07, h: .22, mat, solid: false, skip: ['top'] });
        B({ u: u + offset - .15, v: v + .15, y: 7.93, w: .07, d: .6, h: .22, mat, solid: false, skip: ['top'] });
      }
    }
    // Upper galleries: inset glazing, walnut blades, continuous warm wash under the screen.
    for (const v of [42.08, 54.92]) {
      WL(-1.9, v, 16.4, v, 6, 8.15, { mat: GL, thick: .045 });
      SLATS('v', v, -1.85, 16.35, 3.45, 4.5, .16, { w: .05, d: .12 });
      B({ u: 7.25, v, y: 3.39, w: 18.2, d: .1, h: .055, mat: { tex: 'emit', color: 0xe8ae65 }, solid: false });
    }
    // Rear elevation is layered, with a lit slatted middle gallery and a recessed glazed upper tier.
    WL(-1.92, 42, -1.92, 55, 0, 3.3, { mat: 'jwWalnut', thick: .1 });
    B({ u: -1.88, v: 48.5, y: 3.3, w: .38, d: 13, h: .45, mat: 0x241c17, solid: false });
    B({ u: -1.67, v: 48.5, y: 3.3, w: .04, d: 12.7, h: .04, mat: { tex: 'emit', color: 0xe8ae65 }, solid: false });
    WL(-2.02, 42.1, -2.02, 54.9, 3.75, 5.6, { mat: { tex: 'emit', color: 0x87572f }, thick: .025, solid: false });
    SLATS('u', -1.8, 42.15, 54.85, 3.75, 1.85, .12, { w: .04, d: .12 });
    B({ u: -1.88, v: 48.5, y: 5.6, w: .32, d: 13, h: .4, mat: 0x241c17, solid: false });
    B({ u: -1.69, v: 48.5, y: 5.6, w: .04, d: 12.7, h: .05, mat: { tex: 'emit', color: 0xe8ae65 }, solid: false });
    WL(-1.92, 42.1, -1.92, 54.9, 6, 8.15, { mat: GL, thick: .045, solid: false });
    WL(-3.65, 42.1, -3.65, 54.9, 6, 8.15, { mat: 'jwWalnut', thick: .08, solid: false });
    HP(0x3b2c22, [-3.65, 42.1, -1.98, 54.9], 6.02);
    HP(0x30241d, [-3.65, 42.1, -1.98, 54.9], 8.14, false);
    for (let v = 42.2; v < 54.9; v += 1.6) B({ u: -1.88, v, y: 6, w: .05, d: .035, h: 2.15, mat: 0x302824, solid: false });
    B({ u: -3.45, v: 48.5, y: 7.98, w: .08, d: 12.6, h: .035, mat: { tex: 'emit', color: 0xd98a4a }, solid: false });
    // 05: an amber walnut screen conceals the entrance-side slab edge and upper white ceiling.
    WL(16.45, 42, 16.45, 55, 5.6, 8.15, { mat: 'jwWalnut', thick: .08, solid: false });
    WL(16.4, 42.2, 16.4, 54.8, 3.6, 8.1, { mat: { tex: 'emit', color: 0xd98a4a }, thick: .025, solid: false });
    SLATS('u', 16.3, 42.2, 54.8, 3.6, 4.5, .15, { w: .05, d: .12 });
    B({ u: 16.27, v: 48.5, y: 5.48, w: .3, d: 13, h: .45, mat: 0x241c17, solid: false });
    B({ u: 16.3, v: 48.5, y: 3.3, w: .35, d: 13, h: .3, mat: 0x241c17, solid: false });
    // Two large dark-walnut cylinders with narrow stone shoes (diameter 1.2 m).
    for (const v of [44.6, 52.4]) {
      CY(11, v, 0, .69, .16, 0x99998c, { seg: 24, structural: true });
      CY(11, v, .16, .6, 7.8, 'jwWalnut', { seg: 36, structural: true });
      for (const yy of [2.8, 5.4]) CY(11, v, yy, .603, .014, 0x38271f, { seg: 28, solid: false });
    }
    for (const v of [44.6, 52.4]) {
      CY(4.2, v, 0, .62, .15, 0xa4a091, { seg: 20, structural: true });
      CY(4.2, v, .15, .55, 7.8, 'jwWalnut', { seg: 32, structural: true });
    }
    for (const v of [45.6, 51.4]) {
      CY(.6, v, 0, .5, 3.4, 'jwWalnut', { seg: 24, structural: true });
      B({ u: .6, v, y: 3.4, w: 1.1, d: 1.15, h: .28, mat: 0x241c17, solid: false });
    }
    for (const v of [45.2, 51.8]) {
      for (const du of [-.31, .31]) for (const dv of [-.71, .71]) B({ u: 9 + du, v: v + dv, y: 0, w: .08, d: .08, h: 4, mat: 0xc2a27c, solid: false });
      for (const yy of [0, 3.92]) {
        B({ u: 9, v, y: yy, w: .7, d: 1.5, h: .08, mat: 0xc2a27c, solid: false });
      }
      for (const dv of [-.4, 0, .4]) B({ u: 9, v: v + dv, y: .08, w: .55, d: .07, h: 3.84, mat: 0xc2a27c, solid: false });
    }
    // A glazed bronze screen with pale layered timber in the lower rear wall (12/14).
    for (let v = 42.7; v < 54.7; v += .62) {
      B({ u: -1.65, v, y: .15, w: .09, d: .33, h: 3.05, mat: [0xb5a18b, 0xc9b9a5, 0x9c846c][Math.round(v * 10) % 3], solid: false });
      B({ u: -1.35, v, y: 0, w: .05, d: .04, h: 3.35, mat: 0x302824, solid: false });
    }
    WL(-1.3, 42.2, -1.3, 54.8, .12, 3.3, { mat: { tex: 'glass', color: 0xc2bba9 }, thick: .03, solid: false });
    for (const yy of [.12, 1.65, 3.3]) B({ u: -1.26, v: 48.5, y: yy, w: .07, d: 12.6, h: .045, mat: 0x302824, solid: false });
    for (const v of [43.2, 45.6, 48, 50.4, 53.6]) B({ u: -1.15, v, y: .12, w: .06, d: .14, h: .06, mat: { tex: 'emit', color: 0xedc58d }, solid: false });
    ROUND(.3, 48.5, 0, .85, .8, 0x272421);
    FLOWER(.3, 48.5, .8, 2.6, [0x4f7a3a, 0x6b8f4a, 0xd98a3a, 0xe0a650], { stems: 104 });
    // 05/15: four irregular strands, joined by two small drooping necklace loops on the plinth.
    CY(7.3, 48.5, 0, 2, .32, 0xa6a493, { seg: 64 });
    CY(7.3, 48.5, .025, 2.008, .035, 0x474239, { seg: 64, solid: false });
    const bead = (u, v, yy, i) => {
      const r = i % 7 === 0 ? .176 : .103 + ((i * 7) % 5) * .011, [x, z] = P(u, v);
      DK.dome({ x, y: yy, z, rx: r, ry: r * .95, rz: r, mat: i % 4 ? 0xf1ead9 : 0xd9c3a0, seg: 16, rings: 8, hemi: false });
      CY(u, v, yy - .007, r * 1.005, .014, i % 4 ? 0xe7dfcb : 0xc5ad8b, { seg: 16, solid: false });
    };
    for (const [strand, du, dv] of [[0, -.07, -.66], [1, .04, -.23], [2, -.03, .23], [3, .06, .66]]) {
      ROD([7.3 + du, .5, 48.5 + dv], [7.3 + du, 8.12, 48.5 + dv], .006, 0x8a8070);
      for (let i = 0; i < 29; i++) bead(7.3 + du, 48.5 + dv, 7.94 - i * .26, i + strand * 3);
    }
    for (const mid of [-.445, .445]) for (let i = 0; i <= 6; i++) {
      const a = i / 6 * Math.PI;
      bead(7.3 + Math.sin(a) * .11, 48.5 + mid + Math.cos(a) * .215, .66 - Math.sin(a) * .2, i + 2);
    }
    for (const u of [5, 9.6]) for (const v of [46.2, 50.8]) { CY(u, v, 0, .1, .035, 0x827f76, { seg: 10, solid: false }); CY(u, v, .035, .012, .7, 0x9a988c, { seg: 6, solid: false }); }
    for (const v of [46.2, 50.8]) ROD([5, .68, v], [9.6, .68, v], .006, 0xb0a994);
    for (const u of [5, 9.6]) ROD([u, .68, 46.2], [u, .68, 50.8], .006, 0xb0a994);
    for (const v of [44.7, 52.3]) B({ u: 3.1, v, y: 0, w: .6, d: 2.4, h: .45, mat: 0xb9b3a6 });
    LIGHTS([-1.4, 42.6, 16.5, 55], 7.92, 3.6, .16, 0xf3d3a1);
    // Low vestibule and concierge remain under the unchanged facade/entrance canopy.
    const [rx, rz] = P(UE - .2, 48.5);
    K.cyl({ x: rx, y: 0, z: rz, r: 1.45, h: 2.9, mat: GL, seg: 16, solid: false, caps: false });
    K.cyl({ x: rx, y: 2.9, z: rz, r: 1.55, h: .35, mat: BRONZE, seg: 16, solid: false });
    for (let i = 0; i < 4; i++) B({ u: UE - .2, v: 48.5, y: 0, w: .04, d: 2.8, h: 2.8, mat: GL, solid: false, r: i * Math.PI / 4 });
    for (const [u, label] of [[25.8, '컨시어지'], [19.8, '벨 데스크']]) {
      B({ u, v: 57.7, y: 0, w: 3.6, d: .9, h: .98, mat: 'jwWalnut', top: 'jwDarkMarble' });
      SG(label, { u, v: 57.22, y: .73, w: .85, h: .17, f: 'N', bg: null, fg: '#dfcfab' });
    }
    MAN(25.8, 58.7, 0, { shirt: 0x292623 });
    // 05: luggage trolleys beside the bell desk, small castors and arched bronze rails.
    for (const [u, v] of [[22.2, 54.4], [23.5, 54.4]]) {
      B({ u, v, y: .13, w: .85, d: 1.12, h: .12, mat: 0x44352a });
      for (const du of [-.36, .36]) for (const dv of [-.44, .44]) CY(u + du, v + dv, .02, .065, .11, 0x302a23, { seg: 12, solid: false });
      for (const dv of [-.44, .44]) {
        for (const du of [-.36, .36]) ROD([u + du, .24, v + dv], [u + du, 1.65, v + dv], .021, 0xaea18b);
        for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI, b = (i + 1) / 12 * Math.PI; ROD([u + Math.cos(a) * .36, 1.65 + Math.sin(a) * .3, v + dv], [u + Math.cos(b) * .36, 1.65 + Math.sin(b) * .3, v + dv], .021, 0xaea18b); }
      }
      for (const du of [-.2, .21]) {
        B({ u: u + du, v, y: .25, w: .34, d: .55, h: du < 0 ? .7 : .51, mat: du < 0 ? 0x292827 : 0x766052 });
        for (let i = 0; i < 6; i++) B({ u: u + du - .14 + i * .055, v: v - .282, y: .29, w: .012, d: .012, h: .44, mat: 0x49433c, solid: false });
      }
    }
    CHAIR(13.8, 52.8, 0, 'W', 0x93836d); MAN(13.8, 52.8, 0, { sit: true, shirt: 0x34302a, rotY: FACE.W });
    // Preserve the 1F/2F escalator and its open landing.
    ESCL(22.6, 40.4, 22.6, 30, 0, 6, 'up'); ESCL(24.2, 40.4, 24.2, 30, 0, 6, 'down');
    B({ u: 27.8, v: 35.65, y: 0, w: 3.5, d: 9.8, h: .6, mat: 'jwTravertine', structural: true });
    // 06/07: warm staggered travertine, three flush bronze portals and one aubergine directory panel.
    COVE([4.2, 24.2, 8.68, 39.6], 3.5);
    WL(4.2, 25, 4.2, 38.7, 0, 3.5, { mat: 'jwTravertine', thick: .12 });
    for (let row = 0; row < 6; row++) {
      const yy = row * .6;
      B({ u: 4.263, v: 31.85, y: yy, w: .004, d: 13.7, h: .006, mat: 0xbca080, solid: false });
      for (let v = 25 + (row % 2) * .6; v < 38.7; v += 1.2) B({ u: 4.264, v, y: yy, w: .004, d: .006, h: Math.min(.6, 3.5 - yy), mat: 0xbca080, solid: false });
    }
    for (const [v0, v1] of [[24.2, 26.5], [28.3, 30.9], [33.15, 39.5]]) B({ u: 8.66, v: (v0 + v1) / 2, y: 0, w: .12, d: v1 - v0, h: 3.5, mat: 'jwTravertine', solid: false });
    for (const v of [32, 34.9]) {
      for (const dv of [-.69, .69]) B({ u: 8.54, v: v + dv, y: 0, w: .06, d: .08, h: 2.42, mat: 0x544739, solid: false });
      B({ u: 8.54, v, y: 2.36, w: .06, d: 1.45, h: .09, mat: 0x544739, solid: false });
      if (v !== 32) {
        B({ u: 8.52, v, y: 0, w: .035, d: 1.27, h: 2.35, mat: 0x3e342c, solid: false });
        B({ u: 8.49, v, y: 0, w: .012, d: .018, h: 2.35, mat: 0x241f1b, solid: false });
      }
      SG('L', { u: 8.48, v, y: 2.69, w: .22, h: .25, f: 'W', bg: null, fg: '#4a3e32' });
      B({ u: 8.49, v: v + .91, y: .97, w: .04, d: .12, h: .3, mat: 0x514234, solid: false });
    }
    // The third photographed portal turns onto a short return, leaving a 2.5 m passage at west.
    WL(6.95, 39.35, 8.72, 39.35, 0, 3.5, { mat: 'jwTravertine', thick: .16 });
    B({ u: 7.82, v: 39.245, y: 0, w: 1.22, d: .035, h: 2.35, mat: 0x3e342c, solid: false });
    B({ u: 7.82, v: 39.219, y: 0, w: .015, d: .01, h: 2.35, mat: 0x241f1b, solid: false });
    for (const u of [7.16, 8.48]) B({ u, v: 39.22, y: 0, w: .07, d: .055, h: 2.42, mat: 0x544739, solid: false });
    B({ u: 7.82, v: 39.22, y: 2.36, w: 1.4, d: .055, h: .08, mat: 0x544739, solid: false });
    SG('L', { u: 7.82, v: 39.21, y: 2.69, w: .22, h: .25, f: 'N', bg: null, fg: '#4a3e32' });
    SG('▲ 8', { u: 8.48, v: 32, y: 2.55, w: .31, h: .1, f: 'W', bg: '#211f1b', fg: '#b8d5cf' });
    B({ u: 4.29, v: 36.3, y: .64, w: .045, d: .72, h: 1.72, mat: 0x594250, solid: false });
    SG('JW MARRIOTT', { u: 4.32, v: 36.3, y: 2.245, w: .43, h: .065, f: 'E', bg: null, fg: '#e4d9df', font: 'Georgia, serif', pxPerM: 700 });
    const directory = [
      ['33', '펜트하우스', '프레지덴셜 펜트하우스'], ['32', '앰배서더 펜트하우스', '객실'], ['12', '객실', '12–31층'],
      ['9', '이그제큐티브 라운지', '비즈니스 센터'], ['8', '리셉션 · 컨시어지', 'THE LOUNGE'], ['7', '더 마고 그릴 · 모보 바', 'JW 가든'],
      ['5', '그랜드 볼룸', '웨딩 센터'], ['3', '살롱 1–6', '연회장'], ['2', 'FLAVORS · TAMAYURA', '플레이버즈 · 파티세리 · 타마유라'],
      ['L', '현관 · 벨 데스크', '신세계백화점 연결'], ['B2', '마르퀴스 피트니스 클럽', '스파 · 주차장'], ['B3', '주차장', '호텔 주차장'],
    ];
    for (const [i, [floor, facility, detail]] of directory.entries()) {
      const yy = 2.1 - i * .12;
      SG(floor, { u: 4.32, v: 36.58, y: yy, w: .1, h: .058, f: 'E', bg: null, fg: '#e4d9df', bold: true, pxPerM: 700 });
      SG(facility, { u: 4.32, v: 36.22, y: yy + .012, w: .55, h: .045, f: 'E', bg: null, fg: '#e4d9df', bold: false, align: 'left', pxPerM: 700 });
      SG(detail, { u: 4.32, v: 36.22, y: yy - .036, w: .55, h: .032, f: 'E', bg: null, fg: '#cfbdc7', bold: false, align: 'left', pxPerM: 700 });
      B({ u: 4.318, v: 36.3, y: yy - .068, w: .006, d: .6, h: .004, mat: 0x8a7380, solid: false });
    }
    // 08: small bronze button plates inside the functional lift; its opening stays clear.
    B({ u: 10.0, v: 30.99, y: .88, w: 1.12, d: .035, h: 1.25, mat: 0x3e342c, solid: false });
    for (const [i, label] of ['12 객실', '11 사무실', '10 사무실', '9 라운지', '8 리셉션', '7 레스토랑', '6 사무실', '5 그랜드 볼룸', '3 살롱', '2 플레이버즈', 'L 현관', 'B2 마르퀴스'].entries()) {
      const u = i % 2 ? 9.73 : 10.27, yy = 1.94 - Math.floor(i / 2) * .16;
      B({ u, v: 31.018, y: yy - .055, w: .47, d: .008, h: .11, mat: i === 7 ? 0xe5ece2 : 0x99886c, solid: false });
      SG(label, { u, v: 31.031, y: yy, w: .44, h: .089, f: 'S', bg: '#3e342c', fg: '#ece5d3', bold: false, pxPerM: 600 });
      B({ u: u + .19, v: 31.05, y: yy - .015, w: .026, d: .012, h: .03, mat: i === 7 ? 0xe8f3ec : 0xb39d78, solid: false });
    }
    SG('◀ ▶     ▶ ◀', { u: 10, v: 31.03, y: .94, w: .66, h: .095, f: 'S', bg: '#3e342c', fg: '#ece5d3' });
    // 13: enclosed 3.9 m hotel passage, bronze display glazing over small walnut relief blocks.
    WL(-1.17, 5, -1.17, 24, 0, 3.5, { mat: 'jwWalnut', thick: .08 });
    WL(3, 5, 3, 24, 0, 3.5, { mat: 'jwTravertine', thick: .12 });
    for (let v0 = 5; v0 < 24; v0 += 1.6) {
      const v1 = Math.min(v0 + 1.6, 24);
      for (let vv = v0 + .2; vv < v1 - .1; vv += .3) for (let yy = .15, row = 0; yy < 3.3; yy += .6, row++) B({ u: -1.11 + (row % 2) * .015, v: vv, y: yy, w: .045, d: .28, h: .57, mat: 'jwWalnut', solid: false, skip: ['w', 'top', 'bottom'] });
      WL(-1, v0 + .03, -1, v1 - .03, .05, 3.44, { mat: { tex: 'glass', color: 0xb5a38b }, thick: .025, solid: false });
      B({ u: -.97, v: v0, y: 0, w: .06, d: .06, h: 3.5, mat: 0x2a2420, solid: false });
      for (const yy of [.025, 1.72, 3.44]) B({ u: -.97, v: (v0 + v1) / 2, y: yy, w: .06, d: v1 - v0, h: .06, mat: 0x2a2420, solid: false });
      for (const dv of [.45, 1.15]) if (v0 + dv < v1) B({ u: -.95, v: v0 + dv, y: .05, w: .1, d: .04, h: .04, mat: { tex: 'emit', color: 0xe6be7d }, solid: false });
    }
    B({ u: -.97, v: 24, y: 0, w: .06, d: .06, h: 3.5, mat: 0x2a2420, solid: false });
    HP('jwCorridorStone', [-.96, 5, 2.94, 24], .018);
    HP('jwWalnut', [-1.05, 5, 3.06, 24], 3.4, false);
    B({ u: 1, v: 14.5, y: 3.36, w: .05, d: 18.6, h: .025, mat: { tex: 'emit', color: 0xefcb91 }, solid: false });
    // 13: broad walnut blades on the opposite side, cream soffit and recessed light apertures.
    for (const [a, b] of [[7.5, 11.4], [16, 20.8]]) {
      for (let v = a; v < b; v += .38) B({ u: 2.76, v, y, w: .3, d: .15, h: 3.35, mat: 'jwWalnut', solid: false });
      B({ u: 2.78, v: (a + b) / 2, y: 1.63, w: .31, d: b - a, h: .045, mat: 0x4b3427, solid: false });
    }
    HP(0xe9e1d3, [1.5, 7, 2.95, 22.6], 3.33, false);
    for (let v = 6; v < 24; v += 2.4) {
      CY(.55, v, 3.365, .045, .015, 0x28221c, { seg: 10, solid: false });
      CY(.55, v, 3.359, .018, .009, { tex: 'emit', color: 0xf0cb92 }, { seg: 8, solid: false });
    }
    WL(-1.1, 5, 3.05, 5, 0, 3.5, { mat: 'jwTravertine', thick: .12 });
    B({ u: 1, v: 5.075, y: 1.25, w: .8, d: .04, h: .85, mat: 0x2a2420, solid: false });
    B({ u: 1, v: 5.101, y: 1.32, w: .66, d: .016, h: .71, mat: 0xc4aa85, solid: false });
    B({ u: .88, v: 5.113, y: 1.42, w: .08, d: .006, h: .47, mat: 0x715a45, solid: false });
    LIGHTS([17, 42, 32, 60], 5.64, 4.2, .14, 0xefcb91);
    SG(['체크인 · 더 라운지 8층', '엘리베이터 ↑'], { u: 4.25, v: 40.2, y: 1.5, w: .8, h: .32, f: 'S', bg: '#594250', fg: '#ece2db' });
    SUBZ('목걸이 조형물 · 현관 홀', '1F', '목재 격자 천장 · 도자기 구슬 조형물', HALL, 8.15);
    SUBZ('엘리베이터 홀', '1F', '트래버틴 벽 · 층별 안내', [4.2, 24.2, 8.8, 39.6]);
    SUBZ('컨시어지 · 벨 데스크', '1F', '짐 보관 · 안내', [17, 55.2, 30, 60.4]);
    SUBZ('호텔 현관 로비', '1F', '리셉션은 8층', [-4, 4, 33, 60.4]);
    // Shared arcade routes, including J5 and J6, keep their coordinates and clear width.
    SG('신세계백화점 강남점 ↑', { u: 0, v: -50, y: 2.6, w: 2.7, h: .3, f: 'S', bg: '#352b25', fg: '#e9dfce' });
    SG('← 센트럴시티 · 호남선', { u: -20, v: 0, y: 2.6, w: 2.7, h: .3, f: 'E', bg: '#352b25', fg: '#e9dfce' });
    LIGHTS([-4, -60, 4, -4], yc, 5, .2); LIGHTS([-33, -4, 33, 4], yc, 5, .2);
    CROWD([-3, -58, 3, -6], y, 4, 101); CROWD([-30, -3, 30, 3], y, 3, 102);
    SUBZ('센트럴시티 연결 아케이드', '1F', '신세계백화점 · 센트럴시티 연결', [-33, -60.4, 33, 4]);
  }

  // =====================================================================
  // 2F — 플레이버즈 · 타마유라 · 파티세리 · 카페 원 · 신세계 연결
  // =====================================================================
  function floor2() {
    const y = Y['2F'], yc = NEXT['2F'] - 0.3;
    // north: closed blocks + link corridor to 신세계 (BVLGARI side)
    BOH([-33.1, -60.4, -3, -6], y, yc - y); BOH([3, -60.4, 33.1, -6], y, yc - y);
    HP({ tex: 'wood', color: 0x9b7a56 }, [-3, -60.4, 3, -6], y + 0.01);
    B({ u: 0, v: -60.1, y, w: 5.4, d: 0.12, h: 3.2, mat: GLD, solid: true, structural: true }); B({ u: 0, v: -60.0, y: y + 3.2, w: 6, d: 0.2, h: 0.3, mat: BRONZE, solid: false });
    SG(['신세계백화점 강남점 연결통로', '불가리(BVLGARI) 매장 옆 · 영업시간 내 개방'], { u: 0, v: -59.85, y: y + 3.85, w: 5.6, h: 0.75, f: 'S', bg: '#2b241d', fg: '#efe2c4' });
    for (let v = -54; v <= -12; v += 7) { for (const s of [-1, 1]) { B({ u: s * 2.95, v, y: y + 1.0, w: 0.08, d: 2.2, h: 1.6, mat: [0x8a5a44, 0x46607a, 0xb8a070, 0x5f7a52][(v / 7 | 0) & 3], solid: false }); } }
    LIGHTS([-3, -60, 3, -6], yc, 3.5, 0.8);
    SUBZ('신세계 연결통로', '2F', '신세계백화점 강남점 (불가리 옆)', [-3, -60.4, 3, -6]);
    // 카페 원
    FRONT('u', -8, -6, 12, y, yc, 'E', 'CAFÉ ONE', { sub: '카페 원', fascia: 0x3b2c22, fg: '#efe2c4' });
    WL(-33.1, -6, -8, -6, y, yc, { mat: WARM });
    HP({ tex: 'wood', color: 0xc8a477 }, [-33, -6, -8, 12], y + 0.01);
    B({ u: -30.8, v: 3, y, w: 1.2, d: 10, h: 1.05, mat: 0x3b2c22, top: 0xefe6d8 });
    for (let v = -1; v <= 7; v += 2) B({ u: -30.6, v, y: y + 1.05, w: 0.7, d: 1.6, h: 0.45, mat: GL, solid: false });
    for (let u = -26; u <= -11; u += 3.5) for (let v = -3.5; v <= 9.5; v += 3.2) TABLE(u, v, y, { r: 0.42, chairs: 2, chair: 0xd8cbb5 });
    CROWD([-27, -4, -10, 10], y, 6, 201);
    SUBZ('카페 원', '2F', '카페 · 델리', [-33, -6, -8, 12]);
    // 플레이버즈: photos 17–20. The unobserved southern extension is screened off.
    WL(-33.1, 12, 4, 12, y, yc, { mat: 'jwWalnut' });
    WL(4, 12, 4, 41.7, y, yc, { mat: 'jwWalnut', thick: .2, openings: [{ at: 6.5, w: 3.4, y0: y, y1: y + 3.45 }] });
    WL(-33, 41.7, 4, 41.7, y, yc, { mat: 'jwWalnut', thick: .12 });
    HP({ tex: 'jwTerrazzo', color: 0x77746d, gloss: .3 }, [-33, 12, 4, 60.4], y + .012, true, [[-2, 42, 4, 55]]);
    // Photo 20 alternates flecked terrazzo aisles with smooth, darker seating bays.
    for (const rect of [[-19.4, 27.3, -12.2, 34.4], [-11.6, 27.3, -4.2, 34.4], [-19.4, 36.3, -4.2, 41.2]]) HP({ tex: 'jwGreyStone', color: 0x77736b, gloss: .3 }, rect, y + .016);
    // 18: medium walnut pier, concealed top wash, celadon vase and dried flowers.
    B({ u: 4.115, v: 14.6, y, w: .025, d: 2.7, h: yc - y - .04, mat: 'jwWalnutLight', solid: false });
    SG('F L A V O R S', { u: 4.16, v: 14.6, y: y + 2.72, w: 1.4, h: .24, f: 'E', bg: null, fg: '#d4b078', bold: false, font: 'Georgia, serif', pxPerM: 260 });
    B({ u: 4.24, v: 14.6, y: yc - .08, w: .3, d: 2.85, h: .12, mat: 0x2a221c, solid: false });
    B({ u: 4.15, v: 14.6, y: yc - .1, w: .06, d: 2.7, h: .025, mat: { tex: 'emit', color: 0xe3af6d }, solid: false });
    CONE(5.25, 14.6, y, .45, .15, .745, { tex: 'jwWalnut', gloss: .5 }, { seg: 28 });
    CY(5.25, 14.6, y + .745, .65, .055, { tex: 'jwWalnut', gloss: .5 }, { seg: 32, solid: false });
    const [vaseX, vaseZ] = P(5.25, 14.6);
    DK.dome({ x: vaseX, y: y + 1.05, z: vaseZ, rx: .25, ry: .28, rz: .25, hemi: false, mat: { color: 0xdcd9c6, gloss: .3 }, seg: 28, rings: 12 });
    CY(5.25, 14.6, y + 1.23, .14, .08, { color: 0xdcd9c6, gloss: .3 }, { seg: 24, solid: false });
    FLOWER(5.25, 14.6, y + .97, 1.1, [0x923323, 0xba4d2e, 0x64704d, 0xb78851, 0xc5b28c], { vase: false, stems: 104, dried: true });
    // 17: cream acoustic ceiling, warm perimeter wash and staggered brass tubes.
    // Its photographed double height remains compressed into the retained 5.2 m floor stack.
    COVE([-32.7, 12.2, 3.8, 26.2], yc - .03, 0xe6dfce);
    CY(-11.5, 20.7, y, .58, yc - y - .02, { tex: 'jwWalnut', color: 0x796c65, gloss: .5 }, { seg: 48, structural: true });
    for (const h of [.1, 2.1, 4.15]) CY(-11.5, 20.7, y + h, .583, .014, 0x30261e, { seg: 36, solid: false });
    SLATS('v', 12.16, -32.7, 3.7, y, yc - y, .10, { w: .035, d: .05 });
    for (let i = 0; i < 48; i++) {
      const u = -18.2 + (i % 8) * .48, v = 17 + Math.floor(i / 8) * .62;
      const h = 1.1 + ((i * 7) % 13) * .13, bot = y + 2.25 + ((i * 3) % 9) * .105;
      const tubeH = Math.min(h, yc - .11 - bot);
      CY(u, v, bot + tubeH, .008, yc - .04 - bot - tubeH, 0x4c4237, { seg: 4, solid: false });
      CY(u, v, bot, .035, tubeH, { color: i % 3 ? 0xb18b52 : 0xd0ad70, gloss: .5 }, { seg: 12, solid: false });
      CY(u, v, bot - .012, .035, .018, { tex: 'emit', color: 0xf8ddb2 }, { seg: 8, solid: false });
    }
    // 19: veined grey marble blocks and a bright, glazed dessert case.
    HP(0x30241d, [-32.8, 26.4, -21, 41.5], yc - .18, false);
    for (let v = 26.5; v < 41.5; v += .3) B({ u: -27, v, y: yc - .38, w: 11.5, d: .08, h: .2, mat: { tex: 'jwWalnut', color: 0xa29182, gloss: .3 }, solid: false });
    // The counter room has horizontal baffles, circular spots, and an illuminated rear screen.
    LIGHTS([-32, 27, -21.8, 40.8], yc - .4, 2.7, .09, 0xffd6a0);
    for (const v of [28.2, 30.9, 33.6, 36.3, 39]) B({ u: -32.9, v, y: y + .18, w: .025, d: 1.2, h: 3.7, mat: { tex: 'emit', color: 0xa58b68 }, solid: false });
    SLATS('u', -32.85, 12.5, 41.5, y, yc - y, .10, { w: .035, d: .05 });
    for (const [u, v, w, d] of [[-29.3, 29.5, 1.25, 6.4], [-29.3, 37.4, 1.25, 5.2], [-24.6, 33.3, 1.5, 6.6]]) {
      B({ u, v, y, w, d, h: 1.05, mat: { tex: 'jwDarkMarble', color: 0xc7c4bd, gloss: .5 } });
      B({ u, v, y: y + 1.05, w: w + .08, d: d + .08, h: .055, mat: { tex: 'jwDarkMarble', gloss: .7 }, solid: false });
      for (let j = 0; j < 24; j++) {
        const su = u + (j % 2 ? .23 : -.23), sv = v - d / 2 + .35 + Math.floor(j / 2) * (d - .7) / 11;
        if (j % 4 === 0) {
          CY(su, sv, y + 1.108, .12 + (j % 3) * .025, .14, j % 8 ? 0x6b3b2a : 0xf2e6d6, { seg: 10, solid: false });
          B({ u: su, v: sv, y: y + 1.25, w: .08, d: .07, h: .05, mat: 0xa74831, solid: false });
        } else if (j % 4 === 1) {
          for (let k = 0; k < 2; k++) {
            B({ u: su + (k - .5) * .12, v: sv, y: y + 1.11, w: .09, d: .09, h: .22, mat: k ? 0xc7a55e : 0x6e8448, solid: false });
            B({ u: su + (k - .5) * .12, v: sv, y: y + 1.33, w: .04, d: .04, h: .08, mat: 0xb8a16c, solid: false });
          }
        } else B({ u: su, v: sv, y: y + 1.11, w: .23, d: .24, h: .12 + (j % 3) * .05, mat: j % 4 === 2 ? 0xad5938 : 0xd9c6a3, solid: false });
      }
    }
    FLOWER(-29.3, 33.65, y + 1.05, 1.25, [0xb64b24, 0xd47c38, 0xc7ad72, 0x75804a], { stems: 90, dried: true });
    B({ u: -29.3, v: 33.65, y, w: 1.5, d: 1.4, h: 1.05, mat: { tex: 'jwDarkMarble', gloss: .5 } });
    B({ u: -21.5, v: 33, y, w: 1, d: 8, h: .95, mat: { tex: 'jwDarkMarble', gloss: .5 } });
    HP({ tex: 'emit', color: 0xf4efe6 }, [-21.94, 29.06, -21.06, 36.94], y + .96);
    B({ u: -21.5, v: 33, y: y + .96, w: 1, d: 8, h: .35, mat: { tex: 'glass', color: 0xdde2db }, solid: false });
    for (const v of [29, 31, 33, 35, 37]) B({ u: -21.5, v, y: y + .96, w: 1.02, d: .035, h: .35, mat: 0xb9b9ad, solid: false });
    for (let j = 0; j < 12; j++) CY(-21.5, 29.35 + j * .66, y + .98, .16, .13, j % 3 ? 0xf2e6d6 : 0x6b3b2a, { seg: 10, solid: false });
    // 20: full-height slender screens, three lit coffers and close-set upholstered booths.
    HP(0xdbd5c6, [-20.4, 26.4, 3.7, 41.6], yc - .02, false);
    for (const rect of [[-19, 27, -12, 34], [-11, 27, -4, 34], [-19, 35, -4, 41]]) COVE(rect, yc - .06, 0xe9dfc9);
    SLATS('u', -20.5, 27.2, 33.4, y, yc - y, .10, { w: .035, d: .05 });
    SLATS('v', 35.8, -18.8, -12, y, yc - y, .10, { w: .035, d: .05 });
    SLATS('v', 35.8, -7.7, -.2, y, yc - y, .10, { w: .035, d: .05 });
    // 20: curved tan backs, upholstered arms, four separate legs and a dark plinth below booths.
    const diningChair = (u, v, du, dv) => {
      const cu = u + du * .88, cv = v + dv * .88, su = -dv, sv = du;
      CY(cu, cv, y + .39, .29, .12, 0xb9aa8d, { seg: 14, solid: false });
      for (let i = 0; i < 9; i++) {
        const a = -.2 + i * (Math.PI + .4) / 9, b = -.2 + (i + 1) * (Math.PI + .4) / 9;
        const at = t => [cu + su * Math.cos(t) * .32 + du * Math.sin(t) * .28, cv + sv * Math.cos(t) * .32 + dv * Math.sin(t) * .28];
        WL(...at(a), ...at(b), y + .46, y + .72 + Math.sin((a + b) / 2) * .22, { mat: 0xb4a186, capMat: 0xc7b69b, thick: .065, solid: false });
      }
      for (const a of [-.2, .2]) for (const b of [-.19, .19]) B({ u: cu + su * a + du * b, v: cv + sv * a + dv * b, y, w: .033, d: .033, h: .4, mat: 0x292522, solid: false });
    };
    const diningSet = (u, v, booth = false) => {
      ROUND(u, v, y, .51, .74, 'jwDarkMarble');
      if (booth) {
        HP(0x514b42, [u - 1.16, v - .5, u + 1.16, v + 1.2], y + .019);
        // A seven-segment curved U, open to the north, with a continuous low seat.
        for (let i = 0; i < 7; i++) {
          const a = -Math.PI * .08 + i * Math.PI * 1.16 / 6, cu = u + Math.cos(a) * .91, cv = v + Math.sin(a) * .91;
          B({ u: cu, v: cv, y, w: .49, d: .25, h: 1.1, r: -a - Math.PI / 2, mat: 0xb4a186, solid: false });
          B({ u: u + Math.cos(a) * .71, v: v + Math.sin(a) * .71, y: y + .32, w: .49, d: .5, h: .16, r: -a - Math.PI / 2, mat: 0xc4b297, solid: false });
        }
        diningChair(u, v, 0, -1);
      } else for (const [du, dv] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) diningChair(u, v, du, dv);
      for (const [du, dv] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) PLACESETTING(u, v, y + .742, du, dv);
      B({ u, v, y: y + .76, w: .09, d: .035, h: .18, mat: 0x493429, solid: false });
      SG('메뉴', { u, v: v + .025, y: y + .87, w: .07, h: .07, f: 'S', bg: '#e5d8bc', fg: '#544135', bold: false, pxPerM: 500 });
      for (const du of [-.1, .1]) CY(u + du, v, y + .745, .022, .065, du < 0 ? 0x33302a : 0xe3ded1, { seg: 8, solid: false });
    };
    let seatIndex = 0;
    for (let u = -18.8; u < 3; u += 2.6) for (const v of [28.4, 31, 33.6, 37.3, 39.9]) {
      if ((u > 1 && v < 33.4) || Math.hypot(u + 18, v - 33) < 1.55 || Math.hypot(u + 1, v - 27.5) < 1.55 || Math.hypot(u + 9, v - 29) < 1.55) continue;
      diningSet(u, v, seatIndex++ % 3 === 0);
    }
    for (let u = -30.8; u <= -9.1; u += 2.4) for (let v = 14; v < 25; v += 2.4) {
      if (Math.abs(u + 21.2) < .2 || Math.hypot(u + 11.5, v - 20.7) < 1.7 || Math.hypot(u + 8, v - 24) < 1.55) continue;
      diningSet(u, v);
    }
    // Tall wine cabinet against the east wall, with five backlit shelves behind glass.
    B({ u: 3.5, v: 30, y, w: .5, d: 6, h: 2.4, mat: 'jwWalnut' });
    B({ u: 3.23, v: 30, y: y + .1, w: .02, d: 5.8, h: 2.2, mat: 0x26221c, solid: false });
    for (let row = 0; row < 5; row++) {
      B({ u: 3.1, v: 30, y: y + .25 + row * .43, w: .28, d: 5.8, h: .035, mat: { tex: 'emit', color: 0xdcc49a }, solid: false });
      for (let j = 0; j < 20; j++) {
        B({ u: 3.1, v: 27.25 + j * .285, y: y + .29 + row * .43, w: .09, d: .1, h: .23, mat: j % 3 ? 0x33402a : 0x542e28, solid: false });
        B({ u: 3.1, v: 27.25 + j * .285, y: y + .52 + row * .43, w: .04, d: .04, h: .07, mat: 0xb29862, solid: false });
      }
    }
    WL(2.94, 27, 2.94, 33, y + .1, y + 2.4, { mat: GL, thick: .025, solid: false });
    // Stemware rack beside the buffet, seen through the slender walnut screen in photo 20.
    B({ u: -19.8, v: 39.3, y, w: .6, d: 3.8, h: 1.02, mat: 'jwWalnut', top: 'jwDarkMarble' });
    for (let row = 0; row < 3; row++) {
      B({ u: -19.8, v: 39.3, y: y + 1.08 + row * .46, w: .58, d: 3.8, h: .03, mat: 0xbab8a9, solid: false });
      for (let i = 0; i < 16; i++) {
        const v = 37.55 + i * .23, yy = y + 1.13 + row * .46;
        CY(-19.8, v, yy, .042, .012, 0xc7c4b7, { seg: 8, solid: false });
        CY(-19.8, v, yy + .012, .006, .09, 0xc7c4b7, { seg: 6, solid: false });
        CONE(-19.8, v, yy + .1, .025, .055, .09, { tex: 'glass', color: 0xe2e0d3 }, { seg: 10 });
      }
    }
    LIGHTS([-32, 13, 3.6, 25], yc - .06, 2.6, .08, 0xf0c98e);
    LIGHTS([-20, 27, 3.6, 41], yc - .12, 3.2, .08, 0xf0c98e);
    MAN(-16, 40.1, y, { sit: true, shirt: 0xddd4c7 }); MAN(-28.1, 37.4, y, { shirt: 0xe5e0d5 });
    // The hall void is kept out of all restaurant/landing surfaces and bounded at 2F.
    RAILBOX(HALL, y);
    SUBZ('플레이버즈', '2F', '뷔페 · 황동 펜던트 · 대리석 카운터', [-33, 12, 4, 41.7]);
    SUBZ('플레이버즈 다이닝', '2F', '월넛 스크린 · 소파 좌석', [-20.4, 26.4, 3.7, 41.6]);
    // 파티세리 · 티 바
    FRONT('u', 17, -6, 26, y, yc, 'W', 'PÂTISSERIE', { sub: '파티세리 · 티 바', door: 20, dw: 4, signAt: 12, fascia: 0x3b2c22, fg: '#efe2c4' });
    WL(17, -6, 33.1, -6, y, yc, { mat: WARM }); WL(17, 26, 33.1, 26, y, yc, { mat: WARM });
    HP({ tex: 'marble', color: 0xf6efe4 }, [17, -6, 33, 26], y + 0.01);
    for (const v of [10, 15, 20]) { B({ u: 21, v, y, w: 1.0, d: 4.2, h: 0.95, mat: 0x2a2420, top: 0xe8e0d0 }); B({ u: 21, v, y: y + 0.95, w: 0.9, d: 4.0, h: 0.5, mat: GL, solid: false }); for (let j = 0; j < 5; j++) B({ u: 21, v: v - 1.6 + j * 0.8, y: y + 0.97, w: 0.35, d: 0.35, h: 0.18, mat: [0xf2d0d8, 0x6b3b2a, 0xf5e6c8, 0xc9425a, 0x9ac07a][j], solid: false }); }
    B({ u: 32.4, v: 10, y, w: 0.9, d: 30, h: 2.4, mat: WALNUT, solid: true });
    for (let k = 0; k < 3; k++) B({ u: 31.9, v: 10, y: y + 0.9 + k * 0.5, w: 0.1, d: 29, h: 0.04, mat: 0xc9a85c, solid: false });
    B({ u: 28, v: -2.5, y, w: 6, d: 1.0, h: 1.05, mat: 0x3b2c22, top: 0xefe6d8 }); SG(['티 바'], { u: 28, v: -1.9, y: y + 2.4, w: 1.8, h: 0.4, f: 'S', bg: '#2b241d', fg: '#efe2c4' });
    for (let u = 24.5; u <= 30; u += 2.8) for (let v = 3; v <= 22; v += 3.2) TABLE(u, v, y, { r: 0.38, chairs: 2, chair: 0xe8dccb });
    CROWD([18, -4, 31, 24], y, 8, 204);
    SUBZ('파티세리 · 티 바', '2F', '케이크 · 베이커리 · 차', [17, -6, 33, 26]);
    // escalator hall
    RAILBOX(ESC['2F'], y, 'n');
    ESCL(27, 40.4, 27, 30.9, y, Y['3F'], 'up'); ESCL(28.6, 40.4, 28.6, 30.9, y, Y['3F'], 'down');
    SG('3F 연회장 · 5F 그랜드 볼룸', { u: 27.8, v: 41.3, y: y + 2.6, w: 1.6, h: .16, f: 'S', bg: null, fg: '#c5aa7b', bold: false });
    // 타마유라 (일식, 룸 7실)
    FRONT('v', 43, 17, 33.1, y, yc, 'N', 'TAMAYURA', { sub: '타마유라 · 일식 · 데판야키', door: 20.5, dw: 2.2, fascia: 0x1f1a16, fg: '#efe2c4' });
    WL(17, 43, 17, 60.4, y, yc, { mat: WARM });
    HP({ tex: 'wood', color: 0xd6b88c }, [17, 43, 33, 60.4], y + 0.01);
    B({ u: 21.6, v: 47.6, y, w: 7, d: 1.0, h: 0.95, mat: 0x2a2018, top: 0x9aa0a6 }); B({ u: 21.6, v: 48.6, y, w: 7, d: 0.6, h: 0.72, mat: 0xc7a77c, solid: false });
    for (let u = 18.6; u <= 24.6; u += 1.0) CY(u, 46.7, y, 0.2, 0.75, 0x3a2a20, { seg: 6 });
    B({ u: 21.6, v: 51.6, y, w: 7, d: 0.8, h: 1.0, mat: 0xd8c3a0, top: 0xe8d6b4 }); B({ u: 21.6, v: 53.2, y, w: 7, d: 0.6, h: 1.6, mat: 0x2a2018, solid: false });
    for (let u = 18.6; u <= 24.6; u += 1.0) CY(u, 50.7, y, 0.2, 0.75, 0x3a2a20, { seg: 6 });
    SG(['데판야키'], { u: 21.6, v: 46.2, y: y + 3.0, w: 2.2, h: 0.4, f: 'N', bg: '#1f1a16', fg: '#efe2c4' });
    ROOMROW('u', 27.5, [[43.3, 47.4, '룸 1'], [47.4, 51.5, '룸 2'], [51.5, 55.5, '룸 3']], y, yc - y, 'W', { dw: 1.4, lw: 1.0, mat: 0xe9dcc4 });
    PARTS('v', 0, [47.4, 51.5], 27.5, 33.1, y, yc - y, 0xe9dcc4);
    ROOMROW('v', 55.5, [[17.2, 21.2, '룸 4'], [21.2, 25.2, '룸 5'], [25.2, 29.2, '룸 6'], [29.2, 33.1, '룸 7']], y, yc - y, 'N', { dw: 1.4, lw: 1.0, mat: 0xe9dcc4 });
    PARTS('u', 0, [21.2, 25.2, 29.2], 55.5, 60.4, y, yc - y, 0xe9dcc4);
    for (const [u, v] of [[30.3, 45.35], [30.3, 49.45], [30.3, 53.5], [19.2, 58], [23.2, 58], [27.2, 58], [31.1, 58]]) TABLE(u, v, y, { square: true, r: 0.7, chairs: 4, h: 0.72, top: 0x3a2a20, chair: 0x8a6e55, rot: Math.PI / 4 });
    SUBZ('타마유라', '2F', '일식 · 데판야키 · 룸 7실', [17, 43, 33, 60.4]);
    // 18 and the gallery views: grey stone and warm plaster, no exposed office ceiling grid.
    HP('jwGreyStone', [4, -6, 17, 41.8], y + .008, true, [[8.8, 24.2, 15.9, 39.5]]);
    HP('jwGreyStone', [4, 55.15, 17, 60.4], y + .008);
    HP(0x4a3e35, [4, -6, 17, 41.8], yc - .02, false, [[8.8, 24.2, 15.9, 39.5]]);
    for (const rect of [[4, 55.15, 17, 60.4], [-33, 41.7, -2, 60.4], [-2, 41.7, 4, 42], [-2, 55, 4, 60.4], [16.5, 41.8, 17, 55.15], [-33, -6, 4, 12], [17, -6, 33, 26], [17, 43, 33, 60.4]]) HP(0x4a3e35, rect, yc - .02, false);
    HP(0x4a3e35, [17, 26, 33, 43], yc - .02, false, [ESC['3F']]);
    // Narrow concealed wall-edge light strips leave both the core and HALL open.
    for (const [u, va, vb] of [[4.25, -5.7, 12], [16.75, -5.7, 41.5], [4.25, 55.4, 60.1], [16.75, 55.4, 60.1]]) B({ u, v: (va + vb) / 2, y: yc - .10, w: .07, d: vb - va, h: .025, mat: { tex: 'emit', color: 0xeec58c }, solid: false });
    for (const v of [55.4, 60.1]) B({ u: 10.5, v, y: yc - .10, w: 12.4, d: .07, h: .025, mat: { tex: 'emit', color: 0xeec58c }, solid: false });
    LIGHTS([4, -6, 17, 41.8], yc - .03, 3.8, .08, 0xffdfac, (u, v) => inR(u, v, [8.8, 24.2, 15.9, 39.5], .6));
    LIGHTS([4, 55.15, 17, 60.4], yc - .03, 3.8, .08, 0xffdfac);
    LIGHTS([17, 26, 33, 43], yc - .03, 3.8, .08, 0xffdfac, (u, v) => inR(u, v, [21, 29, 30, 42]));
    SUBZ('에스컬레이터 홀', '2F', '1F 현관 ↔ 3F 연회장', [17, 26, 33, 43]);
    SUBZ('데판야키 카운터', '2F', '타마유라', [17.5, 45.5, 25.6, 53.8]);
    SUBZ('2F 로비', '2F', '레스토랑 입구', [4, -6, 17, 41.8]);
  }

  // =====================================================================
  // 3F — 연회장 살롱 6개
  // =====================================================================
  function floor3() {
    const y = Y['3F'], yc = NEXT['3F'] - 0.3;
    const bins = [[-31, -19.5], [-19.5, -8], [-8, 3.5]];
    BOH([-33.1, -60.4, 3.5, -58], y, yc - y); BOH([-33.1, -58, -31, -12], y, yc - y); BOH([-33.1, -12, 4.9, 60.4], y, yc - y);
    // row A (north, doors face south), row B (south, doors face north)
    ROOMROW('v', -38, bins.map(([a, b], i) => [a, b, `살롱 ${i + 1}`]), y, yc - y, 'S', { dw: 2.0, lw: 1.6 });
    ROOMROW('v', -32, bins.map(([a, b], i) => [a, b, `살롱 ${i + 4}`]), y, yc - y, 'N', { dw: 2.0, lw: 1.6 });
    PARTS('u', 0, [-19.5, -8], -58, -38, y, yc - y, 0xe2d6c0); PARTS('u', 0, [-19.5, -8], -32, -12, y, yc - y, 0xe2d6c0);
    WL(3.5, -58, 3.5, -38, y, yc, { mat: WARM }); WL(3.5, -32, 3.5, -12, y, yc, { mat: WARM });
    bins.forEach(([a, b], i) => {
      for (const [v0, v1, n] of [[-58, -38, i + 1], [-32, -12, i + 4]]) {
        HP('jwBallCarpet', [a, v0, b, v1], y + 0.01);
        CHAND((a + b) / 2, (v0 + v1) / 2, yc, 1.0);
        for (const du of [-2.8, 2.8]) for (const dv of [-4.5, 0, 4.5]) TABLE((a + b) / 2 + du, (v0 + v1) / 2 + dv, y, { r: 0.75, chairs: 6, cover: true, chair: IVORY });
        LIGHTS([a, v0, b, v1], yc, 3.8, 0.7, 0xfff0d6);
        SUBZ(`살롱 ${n}`, '3F', '연회 · 미팅 · 스몰 웨딩', [a, v0, b, v1]);
      }
    });
    // prefunction (east band + corridor between rows)
    for (const [u, v, f] of [[10, -50, 'E'], [10, -44, 'E'], [26, -20, 'W'], [26, -14, 'W'], [10, 50, 'E']]) SOFA(u, v, y, 3.2, f, 0xbfae92);
    for (const v of [-46, -20]) { B({ u: 12, v, y, w: 1.0, d: 4.2, h: 0.76, mat: 0xf2ede4, solid: true }); MAN(12.9, v, y, { rotY: FACE.W, shirt: 0x1d2433 }); }
    SG(['오늘의 행사 안내', '살롱 1 · 기업 세미나 10:00', '살롱 4 · 돌잔치 12:00', '그랜드 볼룸(5F) · 웨딩 13:00'], { u: 4.9, v: 0, y: y + 1.9, w: 2.8, h: 2.0, f: 'E', bg: '#1c1a18', fg: '#efe2c4' });
    FLOWERS(20, -35, y, 1.2); FLOWERS(20, 10, y, 1.0);
    RAILBOX(ESC['3F'], y, 'n');
    ESCL(22.6, 40.4, 22.6, 31.7, y, Y['4F'], 'up'); ESCL(24.2, 40.4, 24.2, 31.7, y, Y['4F'], 'down');
    SG(['4F · 5F 그랜드 볼룸'], { u: 23.4, v: 41.3, y: y + 2.9, w: 3.6, h: 0.42, f: 'S', bg: '#2b241d', fg: '#efe2c4' });
    DOORP(4.93, 10, y, 'E', 1.2, 0xbcae98); DOORP(4.93, 14, y, 'E', 1.2, 0xbcae98); SG(['화장실'], { u: 5.0, v: 12, y: y + 2.75, w: 2.2, h: 0.45, f: 'E', bg: '#2b241d', fg: '#f0e2c4' });
    LIGHTS([3.5, -60, 33, 60.4], yc, 4.5, 1.0, 0xfff0d6, (u, v) => inR(u, v, [8.8, 24.2, 15.9, 39.5], 0.6) || inR(u, v, [21, 29, 30, 42]) || (u < 4.9 && v > -12));
    LIGHTS([-31, -38, 3.5, -32], yc, 3, 0.8);
    CROWD([6, -55, 32, 25], y, 18, 301); CROWD([-30, -37.5, 3, -32.5], y, 5, 302);
    SUBZ('행사 안내 · 등록 데스크', '3F', '살롱 행사 접수', [10, -48, 14, -18]); SUBZ('화장실', '3F', '연회장 층', [2.5, 8, 4.9, 16]);
    SUBZ('연회장 프리펑션', '3F', '살롱 1–6 로비', [3.5, -60.4, 33, 60.4]);
  }

  // =====================================================================
  // 4F — 웨딩 · 연회 사무실
  // =====================================================================
  function floor4() {
    const y = Y['4F'], yc = NEXT['4F'] - 0.3;
    BOH([-33.1, -60.4, 33.1, -20], y, yc - y); BOH([-33.1, -20, -12, 60.4], y, yc - y); BOH([-12, 14, 4.9, 38], y, yc - y);
    SG(['연회 주방 · 직원 통로'], { u: 10, v: -19.9, y: y + 2.65, w: 2.6, h: 0.35, f: 'S', bg: '#333', fg: '#fff' }); DOORP(10, -19.97, y, 'S', 1.6, 0x8c867c);
    // glass-fronted rooms along u = 4.9 (doors face the east hall)
    const rooms = [[-20, -12, '웨딩 상담실 1'], [-12, -4, '웨딩 상담실 2'], [-4, 4, '연회 예약실'], [4, 14, '연회 사무실'], [38, 46, '신부 메이크업실'], [46, 60.4, '드레스룸']];
    for (const [v0, v1, n] of rooms) {
      FRONT('u', 4.9, v0, v1, y, yc, 'E', n, { door: v0 + 1.8, dw: 1.6, fascia: 0xe8dcc4, fg: '#6b4a32', gh: 2.9, sw: 3.6 });
      HP(n.startsWith('연회') ? { tex: 'carpet', color: 0x8a7a6a } : { tex: 'wood', color: 0xc8a477 }, [-12, v0, 4.9, v1], y + 0.01);
      LIGHTS([-12, v0, 4.9, v1], yc, 3.2, 0.7, 0xfff0d6);
      SUBZ(n, '4F', n.startsWith('웨딩') ? 'JW 웨딩 상담' : n.startsWith('연회') ? '연회 · 행사 문의' : '그랜드 볼룸 웨딩', [-12, v0, 4.9, v1]);
    }
    for (const v of [-12, -4, 4, 14, 38, 46]) WL(-12, v, 4.9, v, y, yc, { mat: 0xefe6da, thick: 0.15 });
    // 웨딩 상담실: round table, sofa, album sideboard, presentation screen
    for (const v0 of [-20, -12]) {
      TABLE(-3, v0 + 4, y, { r: 0.75, chairs: 4, chair: 0xe8dccb, top: 0xf6f2ea });
      FLOWERS(-3, v0 + 4, y + 0.74, 0.35);
      SOFA(-9.5, v0 + 4, y, 2.6, 'E', 0xe6dccb);
      B({ u: -11.6, v: v0 + 4, y, w: 0.5, d: 3.2, h: 0.9, mat: WALNUT, top: 0xefe7da });
      for (let j = 0; j < 6; j++) B({ u: -11.55, v: v0 + 2.7 + j * 0.45, y: y + 0.9, w: 0.3, d: 0.08, h: 0.32, mat: [0xf2ede4, 0xc9a85c, 0x7a5f40][j % 3], solid: false });
      B({ u: -11.85, v: v0 + 4, y: y + 1.4, w: 0.05, d: 2.2, h: 1.25, mat: 0x0d1014, solid: false }); B({ u: -11.8, v: v0 + 4, y: y + 1.45, w: 0.01, d: 2.1, h: 1.15, mat: { tex: 'emit', color: 0xf2e2d8 }, solid: false });
      for (const dv of [1.6, 6.4]) B({ u: -4, v: v0 + dv - (dv < 4 ? 1.48 : -1.48), y: y + 0.9, w: 6, d: 0.04, h: 1.6, mat: 0xd9cbb4, solid: false });
      SOFA(2.2, v0 + 1.4, y, 1.0, 'N', 0xe8dccb); SOFA(3.6, v0 + 1.4, y, 1.0, 'N', 0xe8dccb); TABLE(2.9, v0 + 2.9, y, { r: 0.4, chairs: 0, h: 0.45, top: 0x5a463a });
      CY(1.0, v0 + 6.6, y, 0.35, 0.12, 0xd8cab2, { seg: 12 }); CY(1.0, v0 + 6.6, y + 0.12, 0.38, 1.0, 0xfbf9f4, { seg: 12, solid: false }); B({ u: 1.0, v: v0 + 6.6, y: y + 1.12, w: 0.36, d: 0.26, h: 0.45, mat: 0xfbf9f4, solid: false }); CY(1.0, v0 + 6.6, y + 1.57, 0.1, 0.18, 0xd8c0a8, { seg: 8, solid: false });
      PLANT(4.2, v0 + 7.2, y, 0.8);
      MAN(-1.9, v0 + 4, y, { sit: true, rotY: FACE.W, shirt: 0x1d2433 }); MAN(-4.1, v0 + 3.2, y, { sit: true, rotY: FACE.E }); MAN(-4.1, v0 + 4.8, y, { sit: true, rotY: FACE.E, shirt: 0xe8b8c0 });
    }
    // 연회 예약실 + 연회 사무실: desks with monitors
    const DESK = (u, v, f = 'W') => {
      B({ u, v, y, w: 0.8, d: 1.6, h: 0.75, mat: 0xe8e0d0, top: 0xf2ede4 });
      const du = f === 'W' ? 0.15 : -0.15;
      B({ u: u + du, v, y: y + 0.75, w: 0.05, d: 0.6, h: 0.4, mat: 0x1a1d22, solid: false }); B({ u: u + du - (f === 'W' ? 0.03 : -0.03), v, y: y + 0.8, w: 0.01, d: 0.55, h: 0.32, mat: { tex: 'emit', color: 0xcfe2f2 }, solid: false });
      B({ u: u - (f === 'W' ? 0.75 : -0.75), v, y, w: 0.5, d: 0.5, h: 0.46, mat: 0x2b2b2b, solid: false });
    };
    DESK(-8, -2); DESK(-8, 2); SOFA(1.5, 0, y, 2.2, 'W', 0xcfc3b0); MAN(-8.75, -2, y, { sit: true, rotY: FACE.E, shirt: 0x1d2433 });
    for (const u of [-9.5, -5.5, -1.5]) for (const v of [6.5, 11]) DESK(u, v);
    for (let v = 5; v <= 13; v += 1.2) B({ u: 4.3, v, y, w: 0.6, d: 1.0, h: 1.3, mat: 0x9a968e });
    MAN(-10.25, 6.5, y, { sit: true, rotY: FACE.E }); MAN(-2.25, 11, y, { sit: true, rotY: FACE.E, shirt: 0xf2f2f2 });
    // 신부 메이크업실: vanity mirrors with bulb frames + chairs
    for (let i = 0; i < 3; i++) {
      const v = 39.5 + i * 2.2;
      B({ u: -11.6, v, y, w: 0.6, d: 1.8, h: 0.78, mat: 0xf2ede4 }); B({ u: -11.85, v, y: y + 1.0, w: 0.04, d: 1.4, h: 1.1, mat: { tex: 'glass', color: 0xe8f2f8 }, solid: false });
      for (const dv of [-0.75, 0.75]) B({ u: -11.82, v: v + dv, y: y + 1.0, w: 0.06, d: 0.08, h: 1.1, mat: { tex: 'emit', color: 0xfff2d0 }, solid: false });
      B({ u: -10.6, v, y, w: 0.6, d: 0.6, h: 0.6, mat: 0xd8c3a0, solid: false });
    }
    SOFA(1.5, 42, y, 2.6, 'W', 0xf6f2ea); MAN(-10.6, 41.7, y, { sit: true, rotY: FACE.W, shirt: 0xf8f8f8 });
    // 드레스룸: gown racks, fitting podium, three-way mirror
    for (let i = 0; i < 9; i++) { const v = 47.5 + i * 1.1; CY(-10.9, v, y, 0.42, 1.3, 0xfbf9f4, { seg: 10, solid: false }); B({ u: -10.9, v, y: y + 1.3, w: 0.4, d: 0.3, h: 0.45, mat: 0xfbf9f4, solid: false }); }
    B({ u: -10.9, v: 52, y: y + 1.85, w: 0.06, d: 10.5, h: 0.05, mat: 0xc9a85c, solid: false });
    CY(-4, 54, y, 1.1, 0.25, 0xe8dcc4, { seg: 16 }); CY(-4, 54, y + 0.25, 0.5, 1.2, 0xfbf9f4, { seg: 12, solid: false }); B({ u: -4, v: 54, y: y + 1.45, w: 0.4, d: 0.3, h: 0.4, mat: 0xfbf9f4, solid: false });
    for (const [du, dv, r] of [[-1.6, 0, 0], [-1.2, -1.2, 0.6], [-1.2, 1.2, -0.6]]) B({ u: -4 + du, v: 54 + dv, y, w: 0.06, d: 1.0, h: 2.1, mat: { tex: 'glass', color: 0xe8f2f8 }, solid: false, r });
    SOFA(1.5, 54, y, 2.6, 'W', 0xe8dccb);
    // east hall: wedding showcase table, flower arch, brochure stand, consultants
    for (const [u, v, f] of [[12, -10, 'S'], [12, -5, 'N'], [26, 50, 'W'], [26, 56, 'W']]) SOFA(u, v, y, 3, f, 0xd7c8b0);
    TABLE(12, -7.5, y, { r: 0.7, chairs: 0, h: 0.45, top: 0x5a463a });
    for (let v = -16; v <= 8; v += 6) B({ u: 31.8, v, y: y + 0.6, w: 0.3, d: 4.2, h: 2.6, mat: 0xf0e8de, solid: true });
    SG(['JW 웨딩'], { u: 31.6, v: -4, y: y + 3.4, w: 4, h: 0.6, f: 'W', bg: '#ece4d6', fg: '#7a5f40' });
    TABLE(20, 6, y, { r: 0.95, chairs: 10, cover: true, chair: IVORY, top: 0xf8f5ee }); FLOWERS(20, 6, y + 0.74, 0.45);
    for (let i = 0; i < 10; i++) { const a = i / 9 * Math.PI; B({ u: 26 + Math.cos(a) * 1.6, v: 14, y: y + Math.sin(a) * 2.4, w: 0.55, d: 0.4, h: 0.55, mat: [0xf3f0ea, 0xe6b8c0, 0xd4e4c8][i % 3], solid: false }); }
    for (const du of [-1.6, 1.6]) CY(26 + du, 14, y, 0.08, 2.4, 0xc9a85c, { seg: 6 });
    SG(['웨딩 쇼케이스 · 테이블 세팅 샘플'], { u: 20, v: 3.2, y: y + 2.6, w: 3.2, h: 0.36, f: 'N', bg: '#2b241d', fg: '#efe2c4', twoSided: true });
    B({ u: 10.5, v: 16, y, w: 0.5, d: 1.4, h: 1.4, mat: WALNUT }); for (let j = 0; j < 3; j++) B({ u: 10.78, v: 15.6 + j * 0.4, y: y + 1.0, w: 0.05, d: 0.3, h: 0.4, mat: 0xf2ede4, solid: false });
    B({ u: 18, v: 22, y, w: 3.2, d: 0.9, h: 1.05, mat: WALNUT, top: 0xefe7da }); SG(['웨딩 · 연회 안내'], { u: 18, v: 21.5, y: y + 1.5, w: 2.2, h: 0.32, f: 'N', bg: '#2b241d', fg: '#e8d29a' }); MAN(18, 22.9, y, { shirt: 0x1d2433, rotY: FACE.N });
    RAILBOX(ESC['4F'], y, 'n');
    ESCL(27, 40.4, 27, 32.6, y, Y['5F'], 'up'); ESCL(28.6, 40.4, 28.6, 32.6, y, Y['5F'], 'down');
    SG(['5F 그랜드 볼룸'], { u: 27.8, v: 41.3, y: y + 2.7, w: 3.2, h: 0.42, f: 'S', bg: '#2b241d', fg: '#efe2c4' });
    LIGHTS([4.9, -20, 33, 60.4], yc, 4.5, 1.0, 0xfff0d6, (u, v) => inR(u, v, [8.8, 24.2, 15.9, 39.5], 0.6) || inR(u, v, [21, 29, 30, 42]));
    for (const [u, v] of [[20, 6], [20, 46]]) CHAND(u, v, yc, 0.9);
    CROWD([6, -18, 31, 28], y, 10, 401); CROWD([6, 42, 24, 58], y, 4, 402);
    SUBZ('웨딩 라운지', '4F', '웨딩 쇼케이스 · 상담 대기', [4.9, -20, 33, 60.4]);
  }

  // =====================================================================
  // 5F — 그랜드 볼룸 (천고 7m, 버진로드 21m)
  // =====================================================================
  function floor5() {
    const y = Y['5F'], yc = NEXT['5F'] - 0.3, bc = 28.0;
    const [b0, c0, b1, c1] = BALL;
    WL(b0, c0, b1, c0, y, bc + 0.4, { mat: 0xe8dcc4, mat2: WARM, thick: 0.3 });
    WL(b0, c0, b0, c1, y, bc + 0.4, { mat: WARM, mat2: 0xe8dcc4, thick: 0.3 });
    WL(b1, c0, b1, c1, y, bc + 0.4, { mat: STONE, mat2: 0xe8dcc4, thick: 0.3, openings: [{ at: 11, w: 2.6, y0: y, y1: y + 3.4 }, { at: 31, w: 2.6, y0: y, y1: y + 3.4 }] });
    WL(b1, c1, b0, c1, y, bc + 0.4, { mat: STONE, mat2: 0xe8dcc4, thick: 0.3, openings: [{ at: 7, w: 2.8, y0: y, y1: y + 3.6 }, { at: 17, w: 3.2, y0: y, y1: y + 3.8 }, { at: 27, w: 2.8, y0: y, y1: y + 3.6 }] });
    PR(BALL, bc, bc + 0.4, { mat: STONE_D, bottom: { tex: 'ceiling', color: 0xf6eedd }, top: { tex: 'concrete', color: 0xb9b4ac } });
    HP('jwBallCarpet', BALL, y + 0.01);
    // stage + flower backdrop + screen
    B({ u: -14, v: -53.4, y, w: 20, d: 5, h: 0.75, mat: 0x3a2f28, top: 0xefe6d8, structural: true });
    for (const du of [-4, 4]) STR(-14 + du, -49.6, -14 + du, -50.9, y, y + 0.75, 1.4, { rails: false });
    B({ u: -14, v: -55.8, y, w: 22, d: 0.3, h: 6.5, mat: 0xf3e4e2, solid: false });
    for (let i = 0; i < 40; i++) B({ u: -24.5 + (i % 20) * 1.1, v: -55.55, y: y + 0.9 + Math.floor(i / 20) * 2.2 + rnd() * 1.6, w: 0.7, d: 0.25, h: 0.6, mat: [0xf2f2ee, 0xe6b8c0, 0xd4e4c8, 0xf6e6c8][i & 3], solid: false });
    SG(['JW MARRIOTT', '그랜드 볼룸'], { u: -14, v: -55.5, y: y + 5.4, w: 7, h: 1.4, f: 'S', bg: '#f3e4e2', fg: '#b89a62' });
    // 21 m virgin road with flower stands
    B({ u: -14, v: -40.5, y, w: 3, d: 21, h: 0.12, mat: IVORY, solid: false, skip: ['bottom'] });
    for (let v = -50; v <= -31; v += 3.2) for (const du of [-2.1, 2.1]) { CY(-14 + du, v, y, 0.12, 1.1, 0xd8d0c4, { seg: 6 }); B({ u: -14 + du, v, y: y + 1.1, w: 0.7, d: 0.7, h: 0.5, mat: [0xf3f0ea, 0xe6b8c0][(v | 0) & 1], solid: false }); }
    for (let v = -48; v <= -33; v += 5) CHAND(-14, v, bc, 0.8);
    // round tables (10 seats each)
    for (const u of [-27.5, -23, -18.5, -9.5, -5, -0.5]) for (let v = -47; v <= -14; v += 5) TABLE(u, v, y, { r: 0.9, chairs: 10, cover: true, chair: IVORY, top: 0xf8f5ee });
    for (const u of [-24, -4]) for (const v of [-48, -37, -26, -15]) CHAND(u, v, bc, 1.6);
    LIGHTS(BALL, bc, 3.6, 0.5, 0xffe9c0);
    for (const [a, b] of [[[b0 + 0.3, c0 + 0.3], [b1 - 0.3, c0 + 0.3]], [[b0 + 0.3, c1 - 0.3], [b1 - 0.3, c1 - 0.3]]]) { const p = [P(a[0], a[1]), P(b[0], b[1]), P(b[0], b[1] + (a[1] > -30 ? -0.6 : 0.6)), P(a[0], a[1] + (a[1] > -30 ? -0.6 : 0.6))]; DK.quad({ tex: 'emit', color: 0xffe2b0 }, p.map(q => [q[0], bc - 0.02, q[1]]), [0, -1, 0]); }
    CROWD([-30, -45, 2, -12], y, 26, 501);
    SG(['그랜드 볼룸'], { u: -14, v: -9.75, y: y + 4.3, w: 5, h: 0.8, f: 'S', bg: '#d8cab2', fg: '#7a5f40' });
    SG(['그랜드 볼룸'], { u: 3.2, v: -35, y: y + 4.0, w: 5, h: 0.6, f: 'E', bg: '#d8cab2', fg: '#7a5f40' });
    SUBZ('그랜드 볼룸', '5F', '천고 7m · 버진로드 21m · 웨딩 · 연회', BALL, bc);
    // 09–10: cream stone border, lengthwise blue/cream carpet, bronze ceiling grid,
    // recessed walnut doors and a low black flower console. Unseen adjoining rooms stay plain.
    BOH([-33.1, -60.4, 3, -56], y, yc - y); BOH([-33.1, -56, -31, -10], y, yc - y); BOH([-33.1, 14, 4.9, 60.4], y, yc - y);
    FRONT('u', -18, 0, 14, y, yc, 'E', '신부 대기실', { door: 7, dw: 2.2, fascia: 0x514238, fg: '#e7ddd0', glass: GL, sw: 1.8 });
    WL(-33.1, 0, -18, 0, y, yc, { mat: 0xdcd0bf });
    SOFA(-28, 7, y, 3.6, 'E', 0xe4dbcf);
    SUBZ('신부 대기실', '5F', '그랜드 볼룸 웨딩', [-33, 0, -18, 14]);
    HP({ tex: 'jwHoney', gloss: .7 }, [-31, -10, 3, 0], y + 0.012);
    HP('jwFoyerCarpet', [-29.5, -8.6, 3, -1.4], y + 0.018);
    HP({ tex: 'jwHoney', gloss: .7 }, [3, -56, 32.95, 24.1], y + 0.012);
    HP('jwFoyerCarpet', [5.4, -52.5, 30.5, 23.6], y + 0.018);
    HP({ tex: 'jwHoney', gloss: .7 }, [16, 24.2, 33, 60.4], y + 0.012, true, [ESC['5F']]);
    HP('jwFoyerCarpet', [17.5, 24.2, 24.7, 58.5], y + 0.018);
    const fCeil = y + 3.65;
    // The source ceiling is a dark mirrored bronze grid, not a luminous tile array.
    const bronzeCeiling = (r) => {
      const [u0, v0, u1, v1] = r;
      B({ u: (u0 + u1) / 2, v: (v0 + v1) / 2, y: fCeil, w: u1 - u0, d: v1 - v0, h: 0.08, mat: { tex: 'jwFoyerBronze', gloss: .7 }, solid: false });
      // Individual smoked-bronze coffers have a fine recessed edge, rather than one flat dark roof.
      for (let u = u0, i = 0; u < u1; u += 2.1, i++) for (let v = v0, j = 0; v < v1; v += 2.4, j++) {
        const w = Math.min(2.1, u1 - u), d = Math.min(2.4, v1 - v);
        B({ u: u + w / 2, v: v + d / 2, y: fCeil - .025, w: w - .075, d: d - .075, h: .018, mat: { tex: 'jwFoyerBronze', color: [0xead9c1, 0xd8c2a5, 0xe0cdb4][(i + j * 2) % 3], gloss: .7 }, solid: false });
      }
      for (let u = u0; u <= u1; u += 2.1) B({ u, v: (v0 + v1) / 2, y: fCeil - 0.07, w: 0.045, d: v1 - v0, h: 0.07, mat: 0x241f1a, solid: false });
      for (let v = v0; v <= v1; v += 2.4) B({ u: (u0 + u1) / 2, v, y: fCeil - 0.07, w: u1 - u0, d: 0.045, h: 0.07, mat: 0x241f1a, solid: false });
      for (let u = u0 + 1.05; u < u1; u += 4.2) for (let v = v0 + 1.2; v < v1; v += 2.4) {
        CY(u, v, fCeil - .09, .105, .024, 0x211c18, { seg: 12, solid: false });
        CY(u, v, fCeil - .096, .06, .015, { tex: 'emit', color: 0xffe0ae }, { seg: 12, solid: false });
      }
    };
    bronzeCeiling([3.1, -55.8, 32.9, 24.1]); bronzeCeiling([-31, -10, 3, 0]);
    bronzeCeiling([16.1, 24.2, 32.9, 60.3]);
    // Warm recessed perimeter slots are visible in both foyer photographs.
    for (const u of [16.35, 32.65]) B({ u, v: 42.2, y: fCeil - .105, w: .045, d: 35.7, h: .025, mat: { tex: 'emit', color: 0xffd49b }, solid: false });
    // The photographed approach dresses the core's existing blank east face and the east wall.
    // No new circulation wall or second escalator is introduced.
    for (const [u, a, b] of [[15.98, 24.2, 39.5], [32.98, 24.2, 60.3]]) {
      B({ u, v: (a + b) / 2, y, w: .08, d: b - a, h: 3.58, mat: { tex: 'jwWalnut', color: 0x997e6b, gloss: .3 }, solid: false });
      for (let v = a; v <= b; v += 1.2) B({ u: u < 20 ? u + .045 : u - .045, v, y, w: .012, d: .018, h: 3.58, mat: 0x2f261e, solid: false });
    }
    SLATS('u', 16.09, 24.4, 30.4, y, 3.58, .25, { w: .08, d: .18 });
    SLATS('u', 32.75, 24.4, 31.8, y, 3.58, .25, { w: .08, d: .18 });
    // Timber blades beside the ballroom portals preserve the actual door openings.
    for (const [a, b] of [[-55.3, -46.7], [-43.3, -26.7], [-23.3, -10.4]]) SLATS('u', 3.28, a, b, y, 3.58, 0.22);
    SLATS('u', 32.65, -52.5, 23.4, y, 3.58, 0.24);
    B({ u: 32.58, v: -14.5, y: y + 0.06, w: 0.09, d: 75.8, h: 0.035, mat: { tex: 'emit', color: 0xe7b66d }, solid: false });
    // Recessed ballroom portals: narrow bronze jambs and concealed warm lintel washes.
    for (const v of [-45, -25]) {
      for (const dv of [-1.43, 1.43]) B({ u: 3.32, v: v + dv, y, w: .16, d: .075, h: 3.45, mat: 0x745d43, solid: false });
      B({ u: 3.32, v, y: y + 3.42, w: .16, d: 2.94, h: .075, mat: 0x745d43, solid: false });
      B({ u: 3.43, v, y: y + 3.37, w: .06, d: 2.65, h: .024, mat: { tex: 'emit', color: 0xe5b878 }, solid: false });
      SG('그랜드 볼룸', { u: 3.4, v: v + 2, y: y + 1.53, w: .45, h: .13, f: 'E', bg: null, fg: '#cbb894', bold: false });
    }
    for (const v of [-37, -15, 5]) {
      B({ u: 32.48, v, y: y + 1.5, w: .09, d: .23, h: .58, mat: 0x342920, solid: false });
      B({ u: 32.42, v, y: y + 1.56, w: .026, d: .13, h: .46, mat: { tex: 'emit', color: 0xd9b074 }, solid: false });
    }
    // Photo 10's intimate end bay opens into the existing broad pre-function corridor.
    // These short returns frame the console without reducing the circulation beyond this bay.
    for (const u of [10.5, 25.0]) {
      WL(u, -53.3, u, -46.3, y, fCeil, { mat: { tex: 'jwWalnut', color: 0xb39b86, gloss: .3 }, thick: .18 });
      const faceU = u < 18 ? u + .13 : u - .13;
      SLATS('u', faceU, -53.05, -49.2, y, 3.55, .24, { w: .075, d: .17 });
      B({ u: faceU, v: -51.1, y: y + .055, w: .06, d: 3.85, h: .025, mat: { tex: 'emit', color: 0xffcd85 }, solid: false });
    }
    HP({ tex: 'jwHoney', gloss: .7 }, [10.65, -53.15, 24.85, -46.3], y + .023);
    HP('jwFoyerCarpet', [12.05, -50.75, 23.45, -46.3], y + .027);
    // Champagne framed panels and flower console, with narrow dark joints as in photo 10.
    B({ u: 17.6, v: -53.25, y, w: 14, d: 0.12, h: 3.55, mat: { color: 0xc9b08e, gloss: .5 }, solid: false });
    for (let u = 10.6; u <= 24.6; u += 2) B({ u, v: -53.15, y, w: 0.045, d: 0.08, h: 3.55, mat: 0x3c3028, solid: false });
    for (const dy of [0.55, 2.7]) B({ u: 17.6, v: -53.15, y: y + dy, w: 14, d: 0.08, h: 0.035, mat: 0x5e5144, solid: false });
    B({ u: 18.5, v: -51.9, y, w: 4.32, d: .98, h: .07, mat: { tex: 'jwHoney', gloss: .5 }, solid: false });
    B({ u: 18.5, v: -51.9, y: y + .07, w: 4.2, d: 0.9, h: 0.85, mat: { tex: 'jwDarkMarble', gloss: .7 } });
    B({ u: 16.2, v: -51.9, y: y + 0.82, w: 1.8, d: 0.85, h: 0.05, mat: 0xbda67d, solid: false });
    for (const u of [15.4, 17]) B({ u, v: -51.9, y, w: 0.055, d: 0.85, h: 0.82, mat: 0x9d8764, solid: false });
    for (let i = 0; i < 9; i++) {
      const u = 15.65 + i * .56, v = -51.9 + (i % 3 - 1) * .16, s = .72 + (i % 4) * .055;
      CY(u, v, y + .87, .1 + (i % 2) * .025, .24 + (i % 3) * .07, { tex: 'glass', color: 0xc5d1bd }, { seg: 12, solid: false });
      FLOWER(u, v, y + .97, s, [0xef7e43, 0xd75138, 0xe7a84a, 0x72924b], { vase: false, stems: 42 });
    }
    // Queue ropes and a slender display console at the edge of the photograph, leaving its central carpet clear.
    for (const v of [-52.2, -50.3]) {
      CY(11.5, v, y, .17, .035, 0x8e8067, { seg: 12, solid: false });
      CY(11.5, v, y + .035, .025, .92, 0xb5a17d, { seg: 10, solid: false });
      CY(11.5, v, y + .94, .05, .045, 0xc2ae88, { seg: 10, solid: false });
    }
    for (let i = 0; i < 10; i++) {
      const v = -52.2 + (i + .5) * .19, sag = .2 * Math.sin((i + .5) / 10 * Math.PI);
      B({ u: 11.5, v, y: y + .9 - sag, w: .03, d: .2, h: .035, mat: 0x26211c, solid: false });
    }
    B({ u: 28.4, v: -47.5, y: y + .86, w: .8, d: 2.7, h: .055, mat: 0xc8b898, solid: false });
    for (const du of [-.35, .35]) for (const dv of [-1.25, 1.25]) B({ u: 28.4 + du, v: -47.5 + dv, y, w: .035, d: .035, h: .86, mat: 0xa4916e, solid: false });
    for (const v of [-48.2, -46.8]) FLOWER(28.4, v, y + .915, .8, [0x557441, 0x819b5a, 0xe6d6b7, 0x78984f]);
    // Photo 09 shows two amber event-registration counters at the escalator approach.
    // Preserve them: the audit's proposed removal conflicts with the photo. Hotel check-in is on 8F.
    for (const u of [19, 27]) {
      B({ u, v: 26.8, y, w: 4.0, d: 0.85, h: 0.93, mat: 0xa9693e, top: 0xe1c8a5 });
      B({ u, v: 26.8, y, w: 4.05, d: 0.89, h: 0.2, mat: 0x342c24, solid: false });
      for (const du of [-1.2, 0, 1.2]) B({ u: u + du, v: 27.235, y: y + .2, w: .012, d: .012, h: .68, mat: 0x86532f, solid: false });
      // Guest books, pens, envelope trays and card holders use human-sized dimensions.
      for (const du of [-1.1, .35]) {
        B({ u: u + du, v: 26.93, y: y + .94, w: .4, d: .29, h: .025, mat: 0xece5d8, solid: false });
        B({ u: u + du, v: 26.93, y: y + .969, w: .006, d: .27, h: .003, mat: 0x998f7c, solid: false });
        B({ u: u + du + .27, v: 26.98, y: y + .945, w: .012, d: .14, h: .01, mat: 0x26231f, solid: false });
      }
      B({ u: u + 1.35, v: 26.75, y: y + .94, w: .36, d: .28, h: .06, mat: 0x806346, solid: false });
      B({ u: u + 1.35, v: 26.75, y: y + 1, w: .3, d: .22, h: .014, mat: 0xe6dfd0, solid: false });
      SG('연회 접수', { u: u - .1, v: 26.85, y: y + 1.08, w: .4, h: .12, f: 'S', bg: '#47382c', fg: '#e0d0ab', bold: false });
      B({ u: u + 2.45, v: 26.8, y, w: 0.055, d: 0.055, h: 1.85, mat: 0x362e25, solid: false });
      B({ u: u + 2.45, v: 26.8, y: y + .99, w: .68, d: .08, h: 1.0, mat: 0x272522, solid: false });
      SG(['그랜드 볼룸', '연회 안내'], { u: u + 2.45, v: 26.855, y: y + 1.49, w: .60, h: .92, f: 'S', bg: '#3d91bc', fg: '#e9edf0', bold: false });
      CY(u + 2.45, 26.8, y, .25, .025, 0x66523c, { seg: 12, solid: false });
      MAN(u - .55, 25.85, y, { shirt: 0x29282a, rotY: FACE.S });
    }
    for (let u = 16.4, i = 0; u < 30.2; u += 1.25, i++) {
      B({ u, v: 24.9 + (i % 2) * .13, y, w: 1.23, d: .12, h: 1.95, mat: [0x39352e, 0x4c463a, 0x302f29][i % 3], solid: false });
      B({ u: u + .61, v: 24.92 + (i % 2) * .13, y, w: .025, d: .14, h: 1.95, mat: 0x1c1b18, solid: false });
    }
    // Discreet waiting groups continue the same finish along the full pre-function hall.
    for (const [u, v, face] of [[6.4, -34, 'E'], [30.6, -12, 'W'], [6.4, 5, 'E'], [18.2, 52, 'E']]) {
      const inward = face === 'E' ? 1 : -1;
      CHAIR(u, v - 1.1, y, face, 0xc3b6a0); CHAIR(u, v + 1.1, y, face, 0xc3b6a0);
      ROUND(u + inward * .55, v, y, .42, .48, 'jwDarkMarble');
      FLOWER(u + inward * .55, v, y + .48, .24, [0x75835b, 0xc99468, 0xdfc6ad]);
    }
    B({ u: 30.7, v: 42.8, y, w: .9, d: 3.8, h: .82, mat: 'jwWalnut', top: 'jwDarkMarble' });
    for (let i = 0; i < 7; i++) {
      CY(30.7, 41.6 + i * .37, y + .84, .055, .13, { tex: 'glass', color: 0xe2ddd2 }, { seg: 8, solid: false });
      CY(30.7, 41.6 + i * .37, y + .836, .08, .01, 0xe7e0d4, { seg: 10, solid: false });
    }
    RAILBOX(ESC['5F'], y, 'n');
    // Keep the actual moving escalator; add the photographed green comb/landing indicators.
    for (const u of [26.85, 28.65]) {
      B({ u, v: 32.64, y: y + .035, w: .78, d: .16, h: .018, mat: { tex: 'emit', color: 0x42ce99 }, solid: false });
      for (const du of [-.46, .46]) B({ u: u + du, v: 32.95, y: y + .12, w: .035, d: .6, h: .055, mat: { tex: 'emit', color: 0x42ce99 }, solid: false });
    }
    SG('그랜드 볼룸', { u: 30.3, v: 30.1, y: y + 1.55, w: 0.8, h: 0.32, f: 'S', bg: '#382e28', fg: '#e6dcc7' });
    DOORP(4.93, 20, y, 'E', 1.2, 0x68513c); DOORP(4.93, 24, y, 'E', 1.2, 0x68513c);
    SG('화장실', { u: 5.02, v: 22, y: y + 1.5, w: 0.45, h: 0.23, f: 'E', bg: '#382e28', fg: '#eee5d5' });
    MAN(12, 17.7, y, { shirt: 0x26252a }); MAN(24.5, -28, y, { shirt: 0x5b4d44 });
    SUBZ('방명록 · 축의금 접수', '5F', '웨딩 리셉션', [16.2, 24.6, 30.2, 28.2]);
    SUBZ('웨딩 무대', '5F', '그랜드 볼룸 · 플라워 월', [-24, -56, -4, -51]); SUBZ('버진로드 21m', '5F', '그랜드 볼룸', [-15.5, -51, -12.5, -30]);
    SUBZ('그랜드 볼룸 포이어', '5F', '푸른 추상 카펫 · 브론즈 격자 천장 · 리셉션', [3, -60.4, 33, 60.4]);
    // The removed speculative bridal flower wall consumed 24 random values.
    // Preserve the existing rooftop tree heights and basement vehicle layout downstream.
    for (let i = 0; i < 24; i++) rnd();
  }

  // =====================================================================
  // 6F — 볼룸 상부 · 직원 구역
  // =====================================================================
  function floor6() {
    const y = Y['6F'], yc = NEXT['6F'] - 0.3, WH = 0xe4e0d8;
    BOH([-33.1, -60.4, 3, -56], y, yc - y); BOH([-33.1, -56, -31, -10], y, yc - y); BOH([-33.1, -10, 4.9, 60.4], y, yc - y);
    BOH([21, 20, 33.1, 44], y, yc - y, 0xb9b4ac); BOH([20, 44, 33.1, 60.4], y, yc - y);
    SG(['기계실 · 전기실'], { u: 20.9, v: 32, y: y + 2.6, w: 2.4, h: 0.38, f: 'W', bg: '#333', fg: '#fff' }); DOORP(20.93, 28, y, 'W', 1.6, 0x8c867c);
    SG(['직원 휴게실'], { u: 20.9, v: 52, y: y + 2.6, w: 2.0, h: 0.38, f: 'W', bg: '#333', fg: '#fff' }); DOORP(19.93, 50, y, 'W', 1.2, 0x8c867c);
    HP({ tex: 'concrete', color: 0xd6d2ca }, [3, -56, 33.1, 60.4], y + 0.008);
    // ballroom roof void: catwalk edge + plant sign
    SG(['볼룸 천장 설비 구역'], { u: 3.35, v: -33, y: y + 2.0, w: 3.2, h: 0.4, f: 'E', bg: '#333', fg: '#fff' });
    // room partitions (corridors: u 18–21 north-south, v -30…-24 east-west)
    const room = (u0, v0, u1, v1, name, sub, doorSide, at) => {
      const ops = [{ at, w: 1.6, y0: y, y1: y + 2.4 }];
      if (doorSide === 'E') { WL(u1, v0, u1, v1, y, yc, { mat: WH, thick: 0.15, openings: ops }); SG([name], { u: u1 + 0.1, v: v0 + at, y: y + 2.7, w: 2.2, h: 0.36, f: 'E', bg: '#333', fg: '#fff' }); }
      if (doorSide === 'W') { WL(u0, v0, u0, v1, y, yc, { mat: WH, thick: 0.15, openings: ops }); SG([name], { u: u0 - 0.1, v: v0 + at, y: y + 2.7, w: 2.2, h: 0.36, f: 'W', bg: '#333', fg: '#fff' }); }
      if (doorSide === 'S') { WL(u0, v1, u1, v1, y, yc, { mat: WH, thick: 0.15, openings: ops }); SG([name], { u: u0 + at, v: v1 + 0.1, y: y + 2.7, w: 2.2, h: 0.36, f: 'S', bg: '#333', fg: '#fff' }); }
      if (doorSide === 'N') { WL(u0, v0, u1, v0, y, yc, { mat: WH, thick: 0.15, openings: ops }); SG([name], { u: u0 + at, v: v0 - 0.1, y: y + 2.7, w: 2.2, h: 0.36, f: 'N', bg: '#333', fg: '#fff' }); }
      SUBZ(name, '6F', sub, [u0, v0, u1, v1]);
    };
    // 연회 창고 (NW): stacked banquet chairs, round table tops on dollies, carts
    WL(4.9, -30, 18, -30, y, yc, { mat: WH, thick: 0.15 });
    room(4.9, -60.4, 18, -30, '연회 창고', '연회 의자 · 원탁 · 무대 자재', 'E', 20);
    for (let u = 6.5; u <= 16; u += 1.6) for (let v = -54; v <= -44; v += 2.5) for (let k = 0; k < 6; k++) B({ u, v, y: y + k * 0.22, w: 0.5, d: 0.5, h: 0.2, mat: k % 2 ? IVORY : 0xc9a85c, solid: k === 0 });
    for (let i = 0; i < 5; i++) { B({ u: 7 + i * 2.1, v: -37, y, w: 1.4, d: 0.6, h: 0.12, mat: 0x5a5a5a }); for (let k = 0; k < 4; k++) B({ u: 7 + i * 2.1, v: -37.2 + k * 0.12, y: y + 0.12, w: 1.8, d: 0.06, h: 1.8, mat: 0xa88a62, solid: false }); }
    B({ u: 12, v: -33, y, w: 6, d: 1.2, h: 0.75, mat: 0x6b4a32 }); B({ u: 12, v: -33, y: y + 0.75, w: 5.8, d: 1.0, h: 0.06, mat: 0xd8d0c4, solid: false });
    // 린넨실 (NE): shelving with folded linen + linen carts
    WL(21, -30, 33.1, -30, y, yc, { mat: WH, thick: 0.15 });
    room(21, -60.4, 33.1, -30, '린넨실', '테이블 린넨 · 객실 리넨', 'W', 20);
    for (const u of [24, 28, 32.3]) { B({ u, v: -43, y, w: 0.6, d: 22, h: 2.4, mat: 0x9a968e, skip: ['bottom'] }); for (let k = 0; k < 4; k++) for (let v = -53; v <= -33; v += 1.25) B({ u: u - 0.31, v, y: y + 0.3 + k * 0.55, w: 0.04, d: 1.0, h: 0.3, mat: [0xfbfaf6, 0xf2ede4, 0xe8c8c8, 0xdce4ec][(k + Math.round(v)) & 3], solid: false }); }
    for (const v of [-50, -45, -40]) { B({ u: 22.3, v, y: y + 0.15, w: 0.9, d: 1.4, h: 0.85, mat: 0x5a6a7a, solid: false }); B({ u: 22.3, v, y: y + 1.0, w: 0.8, d: 1.3, h: 0.25, mat: 0xfbfaf6, solid: false }); }
    // 연회 조정실 (W, office) + 직원 탈의실 (E)
    WL(4.9, -4, 18, -4, y, yc, { mat: WH, thick: 0.15 }); WL(4.9, -24, 18, -24, y, yc, { mat: WH, thick: 0.15 }); WL(21, -24, 33.1, -24, y, yc, { mat: WH, thick: 0.15 });
    room(4.9, -24, 18, -4, '연회 조정실', '연회 운영 · 행사 조정', 'E', 10);
    for (const u of [7.5, 11, 14.5]) for (const v of [-20, -15, -10]) { B({ u, v, y, w: 1.4, d: 0.75, h: 0.74, mat: 0xe8e0d0 }); B({ u, v: v - 0.25, y: y + 0.74, w: 0.6, d: 0.05, h: 0.38, mat: 0x1a1d22, solid: false }); B({ u, v: v + 0.65, y, w: 0.5, d: 0.5, h: 0.46, mat: 0x2b2b2b, solid: false }); }
    B({ u: 5.1, v: -14, y: y + 0.9, w: 0.06, d: 4, h: 1.6, mat: 0xf6f6f2, solid: false }); SG(['오늘의 연회 · 그랜드 볼룸 13:00', '살롱 1 10:00 · 살롱 4 12:00'], { u: 5.2, v: -14, y: y + 1.7, w: 3.6, h: 0.9, f: 'E', bg: '#f6f6f2', fg: '#333' });
    MAN(7.5, -19.35, y, { sit: true, rotY: FACE.N, shirt: 0x1d2433 }); MAN(14.5, -9.35, y, { sit: true, rotY: FACE.N, shirt: 0xf2f2f2 });
    WL(21, -4, 33.1, -4, y, yc, { mat: WH, thick: 0.15 });
    room(21, -24, 33.1, -4, '직원 탈의실', '사물함 · 샤워실', 'W', 4);
    for (const v of [-21, -15, -9]) { B({ u: 27, v, y, w: 10, d: 0.6, h: 1.95, mat: 0x7d8a96 }); for (let u = 22.6; u < 32; u += 0.55) B({ u, v: v - 0.31, y: y + 0.1, w: 0.02, d: 0.02, h: 1.75, mat: 0x4a5560, solid: false }); B({ u: 27, v: v + 1.4, y, w: 8, d: 0.4, h: 0.45, mat: 0xb98f63 }); }
    // 세탁물 집하장 (E middle)
    room(21, -4, 33.1, 20, '세탁물 집하장', '객실 · 연회 세탁물', 'W', 12);
    for (let i = 0; i < 8; i++) { const u = 23 + (i % 4) * 2.4, v = 0 + Math.floor(i / 4) * 6; B({ u, v, y: y + 0.15, w: 1.0, d: 1.6, h: 0.9, mat: 0xd0d4d8, solid: false }); B({ u, v, y: y + 1.05, w: 0.9, d: 1.5, h: 0.2, mat: [0xfbfaf6, 0xe8e2d8][i & 1], solid: false }); }
    for (let i = 0; i < 4; i++) { const v = 8 + i * 2.6; B({ u: 32, v, y, w: 1.6, d: 1.4, h: 1.5, mat: 0xc8ccd0 }); CY(31.18, v, y + 0.6, 0.35, 0.05, 0x2b2b2b, { seg: 12, solid: false }); }
    // 직원 식당 (SW)
    WL(4.9, 40, 20, 40, y, yc, { mat: WH, thick: 0.15, openings: [{ at: 9, w: 2.4, y0: y, y1: y + 2.6 }] });
    WL(20, 40, 20, 60.4, y, yc, { mat: WH, thick: 0.15 });
    SG(['직원 식당'], { u: 13.9, v: 39.9, y: y + 2.9, w: 2.2, h: 0.4, f: 'N', bg: '#333', fg: '#fff' });
    HP({ tex: 'tile', color: 0xe6e2da }, [4.9, 40, 20, 60.4], y + 0.012);
    B({ u: 6, v: 50, y, w: 1.0, d: 14, h: 0.95, mat: 0xb8bcc0, top: 0xd8dcdf }); B({ u: 5.6, v: 50, y: y + 0.95, w: 0.5, d: 13, h: 0.45, mat: GL, solid: false });
    for (let j = 0; j < 8; j++) B({ u: 6.1, v: 44 + j * 1.6, y: y + 0.95, w: 0.6, d: 0.9, h: 0.08, mat: [0xd9a46a, 0x9fc06a, 0xe8d6b8, 0xc8553a][j & 3], solid: false });
    for (let u = 9.5; u <= 18; u += 3) for (let v = 43; v <= 58; v += 3.2) TABLE(u, v, y, { square: true, r: 0.55, chairs: 4, chair: 0x8a8a8a, top: 0xf2f2f2 });
    CROWD([8, 42, 19, 59], y, 12, 601); MAN(5.3, 47, y, { shirt: 0xf2f2f2, rotY: FACE.E });
    SUBZ('직원 식당', '6F', '직원 전용 · 조식 · 중식 · 석식', [4.9, 40, 20, 60.4]);
    SG(['STAFF ONLY · 직원 전용'], { u: 6.6, v: 22.0, y: y + 2.6, w: 3.0, h: 0.4, f: 'S', bg: '#333', fg: '#fff' });
    LIGHTS([3, -60.4, 33, 60.4], yc, 4, 0.7, 0xf2f6ff, (u, v) => inR(u, v, [8.8, 24.2, 15.9, 39.5], 0.6) || inR(u, v, [20, 20, 33, 60.4]) || u < 4.9);
    MAN(19.5, -27, y, { shirt: 0x1d2433 }); MAN(19.5, 10, y, { shirt: 0xf2f2f2 }); MAN(26, -27, y, { shirt: 0x2b3a55 });
    SUBZ('직원 복도', '6F', '연회 지원 동선', [18, -30, 21, 40], NEXT['6F']);
  }

  // =====================================================================
  // 7F — JW 가든 (포디움 옥상) · 더 마고 그릴 · 모보 바
  // =====================================================================
  function floor7() {
    const y = Y['7F'], yc = NEXT['7F'] - 0.3;
    // ---- pavilion interior (tower footprint) ----
    WL(-7.85, 22, 15.85, 22, y, yc, { mat: WALNUT, mat2: WALNUT, openings: [{ at: 8, w: 3, y0: y, y1: y + 2.8 }] });
    WL(-7.85, 40, 15.85, 40, y, yc, { mat: WALNUT, mat2: WALNUT, openings: [{ at: 10, w: 3, y0: y, y1: y + 2.8 }] });
    // MOBO bar (north)
    HP({ tex: 'wood', color: 0x5e4330 }, [-7.85, 6.1, 15.85, 22], y + 0.01);
    B({ u: 4, v: 12.6, y, w: 9, d: 0.9, h: 1.1, mat: 0x1f1a16, top: 0x2b2b2b }); B({ u: 4, v: 17.4, y, w: 9, d: 0.9, h: 1.1, mat: 0x1f1a16, top: 0x2b2b2b });
    B({ u: -0.05, v: 15, y, w: 0.9, d: 5.7, h: 1.1, mat: 0x1f1a16, top: 0x2b2b2b });
    B({ u: 6, v: 15, y, w: 4.5, d: 0.7, h: 2.6, mat: 0x2a1e16 });
    for (let k = 0; k < 4; k++) for (const s of [-1, 1]) B({ u: 6, v: 15 + s * 0.38, y: y + 1.2 + k * 0.38, w: 4.2, d: 0.05, h: 0.26, mat: { tex: 'emit', color: [0xe0a050, 0x9fd0e0, 0xd07040, 0xf0e0b0][k] }, solid: false });
    for (let u = 0.5; u <= 8; u += 0.9) { CY(u, 11.6, y, 0.2, 0.8, 0x8a6e55, { seg: 6 }); CY(u, 18.4, y, 0.2, 0.8, 0x8a6e55, { seg: 6 }); }
    for (const [u, v, f] of [[-6.6, 9, 'E'], [-6.6, 14, 'E'], [-6.6, 19, 'E'], [13.5, 9, 'W']]) SOFA(u, v, y, 3.2, f, 0x3a3a44);
    for (const [u, v] of [[-4.6, 9], [-4.6, 14], [-4.6, 19], [11.5, 9]]) TABLE(u, v, y, { r: 0.45, chairs: 0, h: 0.5, top: 0x2b2b2b });
    SG(['MOBO BAR'], { u: 4, v: 21.75, y: y + 3.6, w: 4.5, h: 0.7, f: 'N', bg: '#6b4a32', fg: '#e0b870', sub: '모보 바' });
    LIGHTS([-7.85, 6.1, 15.85, 22], yc, 3.2, 0.3, 0xffc880);
    CROWD([-7, 7, 14, 21], y, 10, 701);
    SUBZ('모보 바', '7F', '바 · 칵테일 · 야외 테라스', [-8, -6, 16, 22]);
    // foyer + wine cellar (approx. 3,500 bottles)
    HP({ tex: 'darkstone', color: 0x7c7064 }, [-7.85, 22, 8.85, 40], y + 0.01);
    WL(-1, 24, -1, 38, y, y + 3.4, { mat: GL, thick: 0.05, openings: [{ at: 7, w: 1.4, y0: y, y1: y + 2.4 }] });
    WL(-7.85, 24, -1, 24, y, y + 3.4, { mat: GL, thick: 0.05 }); WL(-7.85, 38, -1, 38, y, y + 3.4, { mat: GL, thick: 0.05 });
    B({ u: -7.2, v: 31, y, w: 1.0, d: 13.6, h: 3.3, mat: 'jwWine' });
    for (const v of [26.5, 30, 33.5]) B({ u: -4.2, v, y, w: 3.6, d: 0.8, h: 2.2, mat: 'jwWine' });
    B({ u: -4.2, v: 36.2, y, w: 1.4, d: 1.4, h: 1.0, mat: 0x5a3e2a, top: 0x2a2a2a });
    SG(['WINE CELLAR'], { u: -0.9, v: 31, y: y + 3.0, w: 2.6, h: 0.4, f: 'E', bg: '#1f1a16', fg: '#e0b870', sub: '와인 셀러 · 약 3,500병' });
    SUBZ('와인 셀러', '7F', '더 마고 그릴 · 약 3,500병', [-8, 24, -1, 38]);
    B({ u: 4.5, v: 31, y, w: 0.8, d: 1.4, h: 1.15, mat: WALNUT }); MAN(5.3, 31, y, { shirt: 0x1d2433, rotY: FACE.W });
    SG(['← THE MARGAUX GRILL', 'MOBO BAR →'], { u: 8.75, v: 31, y: y + 2.4, w: 2.4, h: 0.9, f: 'W', bg: '#1f1a16', fg: '#e0b870' });
    // The Margaux Grill (south)
    HP({ tex: 'wood', color: 0x8a6446 }, [-7.85, 40, 15.85, 57.9], y + 0.01);
    B({ u: 11.6, v: 49, y, w: 1.2, d: 14, h: 1.0, mat: 0x2a2018, top: 0x4a4a4a });
    B({ u: 14.6, v: 49, y, w: 2.2, d: 14, h: 0.95, mat: 0x5a5a5a, top: 0x3a3a3a });
    B({ u: 14.6, v: 49, y: y + 0.95, w: 1.6, d: 3, h: 0.7, mat: 0x2a2a2a }); B({ u: 14.4, v: 49, y: y + 1.0, w: 1.0, d: 2.6, h: 0.4, mat: { tex: 'emit', color: 0xff8a30 }, solid: false });
    B({ u: 14.6, v: 49, y: y + 2.9, w: 2.4, d: 6, h: 1.4, mat: 0x6a6a6a, solid: false });
    for (const v of [43.5, 47, 51, 54.5]) MAN(13.6, v, y, { shirt: 0xf2f2f2, rotY: FACE.W });
    for (const u of [-5.5, -1.5, 2.5, 6.5]) for (const v of [43.5, 47.5, 51.5, 55.5]) TABLE(u, v, y, { square: true, r: 0.5, chairs: 4, rot: Math.PI / 4, chair: 0x4a3426, top: 0xf6f2ea });
    SG(['THE MARGAUX GRILL'], { u: 3.5, v: 40.3, y: y + 3.6, w: 6.5, h: 0.65, f: 'S', bg: '#6b4a32', fg: '#e0b870', sub: '더 마고 그릴' });
    LIGHTS([-7.85, 40, 10.5, 57.9], yc, 3.0, 0.3, 0xffd8a0);
    CROWD([-7, 41, 9, 57], y, 16, 702);
    SUBZ('더 마고 그릴', '7F', '우드 파이어 그릴 · 스테이크', [-8, 40, 16, 58]);
    // ---- outdoor: JW 가든 on the podium roof ----
    const gy = y + 0.03;
    HP({ tex: 'wood', color: 0x9a7452 }, [-8, -6, 16, 5.9], gy);
    for (const [u, v] of [[-5, -3], [0, 2.5], [5, -3], [10, 2.5], [14, -3]]) { TABLE(u, v, y, { r: 0.5, chairs: 4, top: 0xeeeeee, chair: 0x2b2b2b }); CY(u, v, y + 0.74, 0.04, 1.6, 0xdddddd, { seg: 4, solid: false, caps: false }); CY(u, v, y + 2.3, 1.4, 0.06, 0xf2ede4, { seg: 10, solid: false }); }
    const lawns = [[-31, -58, -7, -10], [7, -58, 31, -10], [-31, 8, -11, 56], [19, 8, 31, 56], [-31, -8, -12, 5]];
    for (const r of lawns) { HP({ tex: 'grass', color: 0x8db86a }, r, gy); const [a, b, c, d] = r; for (const [p, q, s, t] of [[a, b, c, b], [a, d, c, d], [a, b, a, d], [c, b, c, d]]) { const horiz = q === t; B({ u: (p + s) / 2, v: (q + t) / 2, y, w: horiz ? Math.abs(s - p) : 0.5, d: horiz ? 0.5 : Math.abs(t - q), h: 0.55, mat: 0x4e7a3c, top: 0x5a8a44 }); } }
    HP({ tex: 'darkstone', color: 0xc9bfae }, [-5, -60, 5, -6], gy + 0.005);
    B({ u: 0, v: -34, y, w: 9, d: 17, h: 0.5, mat: STONE, top: STONE, solid: true, skip: [] });
    HP('water', [-4, -42, 4, -26], y + 0.52);
    for (let i = 0; i < 6; i++) CY(-2.4 + (i % 3) * 2.4, -38 + Math.floor(i / 3) * 8, y + 0.5, 0.08, 0.9, { tex: 'emit', color: 0xdff2ff }, { seg: 6, solid: false });
    const trees = [];
    for (let u = -28; u <= -10; u += 6) for (let v = -54; v <= -14; v += 8) trees.push([u, v, 'zelkova']);
    for (let u = 10; u <= 28; u += 6) for (let v = -54; v <= -14; v += 8) trees.push([u, v, 'cherry']);
    for (let v = 12; v <= 52; v += 8) { trees.push([-21, v, 'pine']); trees.push([25, v, 'zelkova']); }
    for (const [u, v, kind] of trees) TREE(u, v, y + 0.55, { h: 4.5 + rnd() * 2, kind });
    for (const [u, v, f] of [[-6.2, -48, 'E'], [6.2, -48, 'W'], [-6.2, -20, 'E'], [6.2, -20, 'W'], [-9.3, 30, 'W'], [17.4, 30, 'E']]) { B({ u, v, y, w: f === 'E' || f === 'W' ? 0.6 : 2, d: f === 'E' || f === 'W' ? 2 : 0.6, h: 0.45, mat: { tex: 'wood', color: 0x9a7452 } }); }
    // pergola over the terrace edge
    for (let u = -7; u <= 15; u += 5.5) for (const v of [-6.5, 5.5]) if (!(v > 0 && Math.abs(u - 4) < 2)) CY(u, v, y, 0.12, 3, 0x3b302a, { seg: 6 });
    for (let u = -7.5; u <= 15.5; u += 0.9) B({ u, v: -0.5, y: y + 3, w: 0.12, d: 12.6, h: 0.18, mat: 0x3b302a, solid: false });
    B({ u: 0, v: -59.2, y, w: 4.4, d: 0.6, h: 1.2, mat: { tex: 'jwStone' } }); SG(['JW 가든'], { u: 0, v: -58.85, y: y + 0.8, w: 3.4, h: 0.5, f: 'S', bg: '#d9ccb6', fg: '#5a4630' });
    SG(['JW GARDEN'], { u: 0, v: -9, y: y + 2.4, w: 3.2, h: 0.45, f: 'N', bg: '#2b241d', fg: '#efe2c4', twoSided: true });
    CROWD([-6, -55, 6, -8], y, 10, 703); CROWD([-7, -5, 15, 5], y, 8, 704);
    SUBZ('리플렉팅 풀', '7F', 'JW 가든 수경 시설', [-4.5, -42.5, 4.5, -25.5]); SUBZ('모보 바 테라스', '7F', '파라솔 좌석 · 퍼골라', [-8, -6.5, 16, 5.9]); SUBZ('정원 산책로', '7F', 'JW 가든', [-5, -60.4, 5, -6]); SUBZ('그릴 오픈 키친', '7F', '더 마고 그릴 · 우드 파이어', [10.8, 41, 15.85, 57]);
    SUBZ('JW 가든', '7F', '루프탑 정원 · 모보 바 테라스', [-33, -60.4, 33, 6]);
  }

  // =====================================================================
  // 8F — reception and The Lounge, photos 01–04. No sculpture/15 m atrium here.
  // =====================================================================
  function floor8() {
    const y = Y['8F'], yc = y + 5.2;
    HP({ tex: 'jwLoungeStone', gloss: .5 }, [-7.85, 6.15, 15.85, 57.85], y + .008, true, [ELH, STH]);
    // Separate rug islands preserve the polished honey-stone circulation between seating bays.
    HP('jwLoungeRug', [-7.4, 14.1, 2.3, 24.5], y + .018);
    HP('jwLoungeRug', [-7.4, 30.5, 1.2, 44.2], y + .018);
    HP(0x3a2b24, [-7.85, 6.1, 5.1, 48], yc - .02, false);
    // 01 is a ten-metre copper screen bay; 02 is the adjacent plain sheer-curtain bay.
    // Keeping them separate lets the piano and sofa read together against pale glazing.
    WL(-7.62, 6.5, -7.62, 47.8, y + .04, yc - .07, { mat: 'jwSheer', thick: .012, solid: false });
    // Full-height ribbons already reached this floor's soffit; finer, staggered copper strips
    // and a closer upward trace view recover the tall screen visible in photo 01.
    for (let v = 14.1, i = 0; v < 24.3; v += .052, i++) B({ u: -7.49 + Math.sin(i * 1.73) * .024, v, y: y + .035, w: .024, d: .026, h: 5.095, mat: { color: [0xb65a2c, 0x884023, 0xc3763f, 0x723a27][i % 4], gloss: .3 }, solid: false, skip: ['top', 'bottom'] });
    B({ u: -7.65, v: 27.15, y: yc - .08, w: .1, d: 41.3, h: .06, mat: 0x70513a, solid: false });
    B({ u: -7.3, v: 27.15, y: yc - .1, w: .06, d: 41.3, h: .025, mat: { tex: 'emit', color: 0xe3af6d }, solid: false });
    B({ u: -7.76, v: 27.15, y: y + 2.9, w: .035, d: 41.3, h: .5, mat: 0x3a2b24, solid: false });
    for (let v = 7; v < 48; v += 3) B({ u: -7.77, v, y, w: .03, d: .03, h: 5.1, mat: 0x302824, solid: false });
    // The pale upper curtain has a softly scalloped hem over the dark spandrel.
    for (let v = 6.5; v < 47.8; v += .12) {
      const vn = Math.min(v + .12, 47.8), a = P(-7.6, v), b = P(-7.6, vn);
      const hem = t => y + 3.48 + Math.cos((t - 6.5) * Math.PI * 4) * .065;
      DK.quad('jwSheer', [[a[0], hem(v), a[1]], [b[0], hem(vn), b[1]], [b[0], yc - .08, b[1]], [a[0], yc - .08, a[1]]], [EV[0], 0, EV[1]]);
    }
    const ring = (u, cv, cy, rv, ry, width, mat = 0xd0b78d, seg = 40) => {
      for (let i = 0; i < seg; i++) {
        const a = i / seg * Math.PI * 2, b = (i + 1) / seg * Math.PI * 2;
        const at = (t, rr) => { const p = P(u, cv + Math.cos(t) * (rv + rr)); return [p[0], y + cy + Math.sin(t) * (ry + rr), p[1]]; };
        DK.quad(mat, [at(a, -width / 2), at(b, -width / 2), at(b, width / 2), at(a, width / 2)], [EV[0], 0, EV[1]]);
      }
    };
    for (const v of [16.8, 21.2]) ring(-7.42, v, 3.4, 1.6, 1.6, .025, { color: 0x68402c, gloss: .3 }, 80);
    const rod = (a, b, radius, mat, seg = 5) => {
      const pa = P(a[0], a[2]), pb = P(b[0], b[2]);
      const A = new K.THREE.Vector3(pa[0], a[1], pa[1]), Bp = new K.THREE.Vector3(pb[0], b[1], pb[1]);
      const d = Bp.clone().sub(A).normalize(), ref = Math.abs(d.y) > .92 ? new K.THREE.Vector3(1, 0, 0) : new K.THREE.Vector3(0, 1, 0);
      const n = new K.THREE.Vector3().crossVectors(d, ref).normalize(), m = new K.THREE.Vector3().crossVectors(d, n).normalize();
      for (let i = 0; i < seg; i++) {
        const t = i / seg * Math.PI * 2, tn = (i + 1) / seg * Math.PI * 2;
        const offset = t => n.clone().multiplyScalar(Math.cos(t) * radius).addScaledVector(m, Math.sin(t) * radius);
        const oa = offset(t), ob = offset(tn), N = offset((t + tn) / 2).normalize();
        DK.quad(mat, [A.clone().add(oa).toArray(), Bp.clone().add(oa).toArray(), Bp.clone().add(ob).toArray(), A.clone().add(ob).toArray()], N.toArray());
      }
    };
    const goblet = (u, v, yy, scale = 1, mat = { tex: 'glass', color: 0xe1e7df }) => {
      CY(u, v, yy, .043 * scale, .008 * scale, mat, { seg: 10, solid: false });
      CY(u, v, yy + .008 * scale, .008 * scale, .085 * scale, mat, { seg: 6, solid: false });
      CONE(u, v, yy + .093 * scale, .022 * scale, .054 * scale, .085 * scale, mat, { seg: 12 });
      CY(u, v, yy + .178 * scale, .054 * scale, .048 * scale, mat, { seg: 12, solid: false, caps: false });
      CY(u, v, yy + .225 * scale, .055 * scale, .003 * scale, 0xd9dfd8, { seg: 12, solid: false, caps: false });
    };
    // 03: panelled walnut back wall, three densely stocked illuminated niche shelves.
    WL(-7.75, 6.35, 4.8, 6.35, y, yc, { mat: 'jwWalnut', thick: .1 });
    WL(4.8, 6.35, 4.8, 14, y, yc, { mat: 'jwWalnut', thick: .12 });
    for (let u = -7.7; u < 4.8; u += 1.4) B({ u, v: 6.46, y, w: .055, d: .06, h: 5.1, mat: 0x725139, solid: false });
    for (const yy of [1.4, 3.1, 4.8]) B({ u: -1.45, v: 6.46, y: y + yy, w: 12.4, d: .06, h: .055, mat: 0x725139, solid: false });
    B({ u: -2.1, v: 8.9, y, w: 9.2, d: .8, h: 1.02, mat: 0x242725, top: { tex: 'jwDarkMarble', gloss: .7 } });
    B({ u: -2.1, v: 8.9, y: y + 1.02, w: 9.35, d: .9, h: .075, mat: { tex: 'jwDarkMarble', gloss: .7 }, solid: false });
    for (let u = -6.6; u < 2.5; u += .22) B({ u, v: 9.32, y: y + .08, w: .035, d: .035, h: .9, mat: 0x151a18, solid: false });
    B({ u: -2.1, v: 7.15, y, w: 8.8, d: .9, h: .92, mat: 0x292b27, top: { tex: 'jwDarkMarble', gloss: .7 } });
    B({ u: -2.1, v: 6.51, y: y + 1.25, w: 5, d: .035, h: 1.35, mat: { tex: 'emit', color: 0xf3c98a }, solid: false });
    for (const u of [-4.64, .44]) B({ u, v: 6.69, y: y + 1.22, w: .08, d: .35, h: 1.43, mat: 0x4c3729, solid: false });
    B({ u: -2.1, v: 6.69, y: y + 2.6, w: 5.16, d: .35, h: .06, mat: 0x4c3729, solid: false });
    for (let row = 0; row < 3; row++) {
      const yy = y + 1.35 + row * .4;
      B({ u: -2.1, v: 6.76, y: yy, w: 5, d: .35, h: .035, mat: { tex: 'emit', color: 0xf7d8a0 }, solid: false });
      for (let i = 0; i < 40; i++) {
        const u = -4.5 + i * .123, v = 6.79, h = .26 + ((i * 7 + row) % 5) * .02;
        const bottle = { color: [0xb5842b, 0x687b4b, 0xc0c4b7, 0x77472d, 0xc7a55e][(i + row) % 5], gloss: .5 };
        const rr = .032 + (i % 3) * .005;
        CY(u, v, yy + .035, rr, h - .09, bottle, { seg: 10, solid: false });
        CONE(u, v, yy + h - .055, rr, .016, .025, bottle, { seg: 10 });
        CY(u, v, yy + h - .03, .016, .065, bottle, { seg: 8, solid: false });
        CY(u, v, yy + h + .032, .017, .015, i % 3 ? 0xbba05b : 0x344936, { seg: 8, solid: false });
        B({ u, v: v + .048, y: yy + .08, w: .065, d: .004, h: .075, mat: 0xe4d9b8, solid: false, skip: ['top', 'bottom', 'n', 'e', 'w'] });
      }
    }
    for (const yy of [1.0, 1.2]) B({ u: -2.1, v: 6.83, y: y + yy, w: 5, d: .42, h: .025, mat: { tex: 'glass', color: 0xc5d2c9 }, solid: false });
    for (let i = 0; i < 30; i++) {
      const u = -4.4 + i * .16;
      CY(u, 6.89, y + 1.025, .048, .145, { tex: 'glass', color: 0xe5e0d5 }, { seg: 6, solid: false, caps: false });
    }
    // 03 foreground: full spirit bottles, a wooden tasting tray and stainless service pitchers.
    for (const [i, u] of [-5.55, -4.85, -3.85].entries()) {
      const col = { color: [0x98a675, 0xbca55b, 0x70412b][i], gloss: .5 }, h = [.37, .32, .41][i];
      CY(u, 8.82, y + 1.1, .078, h * .68, col, { seg: 14, solid: false });
      CONE(u, 8.82, y + 1.1 + h * .68, .078, .031, .055, col, { seg: 14 });
      CY(u, 8.82, y + 1.155 + h * .68, .031, h * .32 - .055, col, { seg: 10, solid: false });
      CY(u, 8.82, y + 1.1 + h, .034, .024, i ? 0x312a22 : 0xddd8c7, { seg: 10, solid: false });
      B({ u, v: 8.9, y: y + 1.17, w: .11, d: .007, h: .12, mat: i === 2 ? 0xe8ddc9 : 0xf0ead7, solid: false });
      B({ u, v: 8.905, y: y + 1.19, w: .06, d: .004, h: .016, mat: i === 2 ? 0x6f382b : 0x68848b, solid: false });
    }
    B({ u: -2.1, v: 9.0, y: y + 1.1, w: 1.15, d: .52, h: .035, mat: 0xb68c5e, solid: false });
    for (const u of [-2.67, -1.53]) B({ u, v: 9.0, y: y + 1.135, w: .018, d: .52, h: .025, mat: 0xd0a273, solid: false });
    for (let i = 0; i < 6; i++) {
      const u = -2.48 + (i % 3) * .37, v = 8.85 + Math.floor(i / 3) * .27;
      CY(u, v, y + 1.138, .045, .012, 0xdfd6bc, { seg: 12, solid: false });
      CY(u, v, y + 1.15, .046, .1, { tex: 'glass', color: 0xdce4dc }, { seg: 12, solid: false, caps: false });
      CY(u, v, y + 1.15, .039, .025, 0xc59a4f, { seg: 12, solid: false });
    }
    for (const [i, u] of [.15, .62, 1.16, 1.74].entries()) {
      const h = [.26, .31, .24, .29][i], vv = i % 2 ? 8.82 : 9.04, metal = { tex: 'metal', color: 0xc3c7c3, gloss: .7 };
      CONE(u, vv, y + 1.1, .095, .067, h, metal, { seg: 16 });
      CY(u, vv, y + 1.1 + h, .073, .012, metal, { seg: 16, solid: false, caps: false });
      for (let j = 0; j < 10; j++) {
        const t = -.5 * Math.PI + j / 10 * Math.PI, tn = -.5 * Math.PI + (j + 1) / 10 * Math.PI;
        rod([u + .071 + Math.cos(t) * .07, y + 1.1 + h * .54 + Math.sin(t) * h * .31, vv], [u + .071 + Math.cos(tn) * .07, y + 1.1 + h * .54 + Math.sin(tn) * h * .31, vv], .009, metal, 6);
      }
    }
    for (const u of [-6.05, -5.8, -1.13, -.85]) goblet(u, 9.17, y + 1.1);
    for (const u of [-5.8, -5.52, -5.24]) goblet(u, 7.25, y + .93, .92);
    for (const u of [-5.5, -3.25, -.95, 1.3]) {
      CY(u, 7.3, yc - .09, .1, .045, { color: 0x38271e, gloss: .3 }, { seg: 16, solid: false });
      CY(u, 7.3, yc - .095, .053, .008, { tex: 'emit', color: 0xffd7a1 }, { seg: 16, solid: false });
    }
    MAN(-.4, 8.0, y, { shirt: 0x2c2925, rotY: FACE.S });
    SG('THE LOUNGE', { u: 4.65, v: 12.6, y: y + 1.6, w: .95, h: .22, f: 'S', bg: null, fg: '#c7a573', bold: false });
    // Grand piano with curved tail, tapered legs, a raised lid and individual keys (02).
    const pu = -4.8, pv = 41.0;
    const shape = [[-.82, 1.05], [.82, 1.05], [.82, .15], [.66, -.78], [.33, -1.35], [-.2, -1.45], [-.63, -.92], [-.82, -.3]];
    DK.prism(shape.map(([u, v]) => P(pu + u, pv + v)), y + .67, y + .98, { mat: { color: 0x121314, gloss: .7 }, solid: false });
    const lid = shape.map(([u, v]) => { const p = P(pu + u, pv + v); return [p[0], y + 1.015 + (u + .82) * .2, p[1]]; });
    for (let i = 1; i < lid.length - 1; i++) DK.quad({ color: 0x18191a, gloss: .7 }, [lid[0], lid[i], lid[i + 1], lid[0]], [0, 1, 0]);
    for (const [du, dv] of [[-.64, .8], [.64, .8], [.1, -1.1]]) {
      CY(pu + du, pv + dv, y + .04, .065, .67, 0x151617, { seg: 8, solid: false });
      CY(pu + du, pv + dv, y + .015, .11, .035, 0x1d1d1c, { seg: 10, solid: false });
    }
    B({ u: pu, v: pv + 1.07, y: y + .78, w: 1.48, d: .29, h: .055, mat: 0xe7e2d8, solid: false });
    for (let i = 0; i < 28; i++) B({ u: pu - .7 + i * .05, v: pv + 1.12, y: y + .835, w: .006, d: .22, h: .008, mat: 0x817d75, solid: false });
    for (let i = 0; i < 20; i++) if (i % 7 !== 2 && i % 7 !== 6) B({ u: pu - .67 + i * .067, v: pv + 1.02, y: y + .843, w: .027, d: .15, h: .03, mat: 0x171717, solid: false });
    B({ u: pu, v: pv + 1.8, y: y + .42, w: .85, d: .38, h: .1, mat: 0x201d1b });
    for (const du of [-.32, .32]) B({ u: pu + du, v: pv + 1.8, y, w: .055, d: .25, h: .42, mat: 0x151515, solid: false });
    // 02: the piano and oatmeal L-sofa share one continuous rug, with copper/burgundy cushions.
    SOFA(-6.35, 34.8, y, 7.2, 'E', 0xd8ccb6);
    SOFA(-3.6, 31.35, y, 6.25, 'S', 0xd8ccb6);
    for (let v = 31.8, i = 0; v < 38; v += .82, i++) {
      B({ u: -6.49, v, y: y + .48, w: .26, d: .48, h: .38 + i % 2 * .06, r: i % 2 ? .11 : -.1, mat: [0x84462f, 0x9e6140, 0x613126, 0xb17c53][i % 4], solid: false });
      B({ u: -6.34, v, y: y + .43, w: .74, d: .016, h: .014, mat: 0xb8a993, solid: false });
    }
    for (const u of [-5.7, -4.7, -2.2, -1.2]) B({ u, v: 31.2, y: y + .5, w: .48, d: .24, h: .4, mat: u < -3 ? 0x874c33 : 0x703a2d, solid: false });
    // Photo 02 has an oval pale stone top overlapping a rectangular orange-walnut table.
    // Preserve both pieces, their flowers and the continuous rug beneath the sofa/piano.
    const oval = Array.from({ length: 48 }, (_, i) => { const t = i / 48 * Math.PI * 2; return P(-3.6 + Math.cos(t) * .78, 34.15 + Math.sin(t) * 1.12); });
    DK.prism(oval, y + .385, y + .44, { mat: { tex: 'marble', color: 0xd7c7ae, gloss: .5 }, solid: false });
    CY(-3.6, 34.15, y + .025, .065, .36, { color: 0x403027, gloss: .3 }, { seg: 12, solid: false });
    B({ u: -3.6, v: 34.15, y: y + .025, w: .65, d: 1.1, h: .045, mat: 0x30241e });
    B({ u: -3.45, v: 36.35, y: y + .35, w: 1.85, d: 1.25, h: .075, mat: { tex: 'wood', color: 0xb2713f, gloss: .3 }, solid: false });
    B({ u: -3.45, v: 36.35, y: y + .35, w: 1.87, d: 1.27, h: .018, mat: 0xbd8452, solid: false });
    B({ u: -3.45, v: 36.35, y, w: 1.35, d: .8, h: .35, mat: 0x27201b });
    FLOWER(-3.6, 34.15, y + .44, .32); FLOWER(-3.45, 36.35, y + .45, .23);
    for (const [u, v] of [[-4.0, 34.6], [-3.1, 35.95]]) {
      CY(u, v, y + .447, .1, .014, 0xf1ebde, { seg: 14, solid: false });
      CY(u, v, y + .461, .052, .062, 0xe7dfd1, { seg: 12, solid: false, caps: false });
      B({ u: u + .15, v, y: y + .447, w: .08, d: .16, h: .007, mat: 0xd9d2c4, solid: false });
    }
    // Photo 01's foreground leather is brown; photo 04's small tubs are grey taupe.
    const tub = (u, v, face, brown = false) => {
      const shell = brown ? 0x8b6048 : 0x8a7d80, seat = brown ? 0xa57958 : 0x9a8b8e, piping = brown ? 0x624431 : 0x71686e;
      const ang = face === 'E' ? Math.PI / 2 : -Math.PI / 2;
      const at = (a, r, yy) => { const du = Math.cos(a) * r, dv = Math.sin(a) * r; const p = P(u + du * Math.cos(ang) + dv * Math.sin(ang), v - du * Math.sin(ang) + dv * Math.cos(ang)); return [p[0], y + yy, p[1]]; };
      CY(u, v, y + .025, .42, .37, shell, { seg: 16, solid: true });
      CY(u, v, y + .395, .35, .075, seat, { seg: 16, solid: false });
      for (let i = 0; i < 16; i++) {
        const a = Math.PI * 5 / 6 + i * Math.PI / 12, b = a + Math.PI / 12, mid = (a + b) / 2;
        const nu = Math.cos(mid - ang), nv = Math.sin(mid - ang);
        const n = [nu * EV[0] + nv * SV[0], 0, nu * EV[1] + nv * SV[1]];
        const ha = .72 + .19 * Math.sin(i / 16 * Math.PI), hb = .72 + .19 * Math.sin((i + 1) / 16 * Math.PI);
        DK.quad(shell, [at(a, .42, .35), at(b, .42, .35), at(b, .42, hb), at(a, .42, ha)], n);
        DK.quad(seat, [at(b, .34, .42), at(a, .34, .42), at(a, .34, ha), at(b, .34, hb)], n.map(v => -v));
        DK.quad(seat, [at(a, .34, ha), at(b, .34, hb), at(b, .42, hb), at(a, .42, ha)], [0, 1, 0]);
        for (const base of [.4, .55, .7]) {
          if (base + .14 > Math.min(ha, hb)) continue;
          DK.quad(piping, [at(a, .423, base), at(a + .018, .423, base), at(b, .423, base + .14), at(b - .018, .423, base + .14)], n);
          DK.quad(piping, [at(b, .423, base), at(b - .018, .423, base), at(a, .423, base + .14), at(a + .018, .423, base + .14)], n);
          DK.quad(piping, [at(a, .337, base), at(a + .014, .337, base), at(b, .337, base + .14), at(b - .014, .337, base + .14)], n.map(v => -v));
          DK.quad(piping, [at(b, .337, base), at(b - .014, .337, base), at(a, .337, base + .14), at(a + .014, .337, base + .14)], n.map(v => -v));
        }
      }
    };
    for (const [u, v] of [[-3.8, 20], [.4, 25.7], [.3, 28.6], [.5, 45.7], [1.6, 14.8]]) {
      ROUND(u, v, y, .62, .62, { tex: 'marble', color: 0xe8dcc8, gloss: .5 });
      tub(u - 1.1, v, 'E', v === 20 || v < 18); tub(u + 1.1, v, 'W', v === 20 || v < 18);
      FLOWER(u, v, y + .63, .18, [0x763553, 0xa14f71, 0x567442]);
    }
    // 01/04: four window peacock chairs plus the separate screen-corner chair seen in 04.
    // The rods have actual round sections, so the weave keeps its depth in the oblique close-up.
    for (const [chairIndex, u, v, face] of [[0, -6.6, 15.45, 1], [1, -6.6, 18.1, 1], [2, -6.6, 20.75, 1], [3, -6.6, 23.4, 1], [4, 3.65, 20.5, -1]]) {
      const reed = (a, b, r, mat, seg) => {
        if (face < 0) { a[0] = 2 * u - a[0]; b[0] = 2 * u - b[0]; }
        rod(a, b, r, mat, seg);
      };
      CONE(u, v, y, .35, .2, .45, 0xbd9d71, { seg: 20, solid: false });
      CY(u + .1 * face, v, y + .45, .39, .08, 0xd0b78d, { seg: 24, solid: false });
      const shell = (a, h, depth = 0) => [u - .29 + .29 * Math.pow(a / .63, 2) + .10 * Math.max(0, h - 1.1) + depth, y + h, v + a];
      const outline = (t, inset = 0) => shell(Math.cos(t) * (.63 - inset), 1.24 + Math.sin(t) * (.82 - inset));
      for (let i = 0; i < 64; i++) {
        const t = i / 64 * Math.PI * 2, tn = (i + 1) / 64 * Math.PI * 2;
        reed(outline(t), outline(tn), .018, 0xd0b78d, 6);
        reed(outline(t, .04), outline(tn, .04), .009, 0xd8bd90, 5);
      }
      for (let i = 0; i < 27; i++) {
        const t = i / 27 * Math.PI * 2, edge = outline(t, .07);
        reed(shell(Math.cos(t) * .18, .53), edge, .006, 0xbfa274, 5);
      }
      // Two interlaced rows of six-petal flowers, with smaller loops in the neck of the chair.
      for (const [ac, hc, rr] of [[-.3, 1.04, .19], [.06, 1.04, .2], [.36, 1.34, .18], [-.33, 1.49, .18], [.03, 1.5, .2], [0, 1.84, .13], [-.12, .73, .12]]) {
        for (let i = 0; i < 60; i++) {
          const t = i / 60 * Math.PI * 2, tn = (i + 1) / 60 * Math.PI * 2;
          const petal = t => { const r = rr * (.72 + .28 * Math.cos(6 * t)); return shell(ac + Math.cos(t) * r, hc + Math.sin(t) * r, .016); };
          reed(petal(t), petal(tn), .007, 0xd2b586, 5);
        }
      }
      // Small circle-and-petal infill fills the broad back like the cream floral rattan in 04.
      for (const [ac, hc, rr] of [[-.42, 1.2, .1], [-.14, 1.27, .12], [.23, 1.14, .1], [.39, 1.56, .1], [-.2, 1.72, .12], [.23, 1.75, .11], [-.43, 1.65, .08], [0, .88, .09], [.4, .99, .075], [-.4, .88, .075]]) {
        for (let i = 0; i < 36; i++) {
          const a = i / 36 * Math.PI * 2, b = (i + 1) / 36 * Math.PI * 2;
          const at = t => shell(ac + Math.cos(t) * rr, hc + Math.sin(t) * rr, .023);
          reed(at(a), at(b), .0065, 0xe4cfaa, 5);
          if (i % 6 === 0) reed(shell(ac, hc, .023), at(a), .005, 0xdac39b, 5);
        }
      }
      // Woven pedestal has crossing diagonal reeds and three circular binding courses.
      for (let i = 0; i < 24; i++) {
        const a = Math.PI * 2 * i / 24;
        for (const twist of [-.8, .8]) reed([u + Math.cos(a) * .35, y + .035, v + Math.sin(a) * .35], [u + Math.cos(a + twist) * .205, y + .435, v + Math.sin(a + twist) * .205], .007, 0xa98b61, 5);
      }
      for (const h of [.035, .22, .43]) {
        const rr = .35 - h / .45 * .15;
        for (let j = 0; j < 28; j++) {
          const a = j / 28 * Math.PI * 2, b = (j + 1) / 28 * Math.PI * 2;
          reed([u + Math.cos(a) * rr, y + h, v + Math.sin(a) * rr], [u + Math.cos(b) * rr, y + h, v + Math.sin(b) * rr], .01, 0xc2a373, 5);
        }
      }
      // Loose mauve pillow: round corners and a central seam instead of a tall box cushion.
      const [px, pz] = P(u + .14 * face, v);
      DK.dome({ x: px, y: y + .72, z: pz, rx: .18, ry: .27, rz: .32, hemi: false, mat: chairIndex % 2 ? 0xc18d94 : 0xb67e8b, seg: 28, rings: 16 });
      reed([u + .315, y + .57, v - .02], [u + .315, y + .88, v + .025], .005, 0x8b5965, 4);
      B({ u, v, y, w: .7, d: .8, h: .75, mat: 0, solid: true, skip: ['top', 'bottom', 'n', 's', 'e', 'w'] });
    }
    for (const v of [16.77, 19.42, 22.07]) ROUND(-6.45, v, y, .3, .55, 0x1c1a18);
    // Photo 04's black lacquer screen and tub seats occupy the opposite end-wall corner.
    // This is kept clear of the frontal bar camera and of the central lift approach.
    WL(4.92, 14, 4.92, 24.1, y, yc, { mat: { tex: 'jwWalnut', gloss: .3 }, thick: .12 });
    for (let i = 0; i < 7; i++) {
      const v = 14 + i * .69;
      B({ u: 4.72, v, y, w: .72, d: .07, h: 2.65, r: Math.PI / 2 + (i % 2 ? .16 : -.16), mat: { color: i % 2 ? 0x171b1c : 0x0c1011, gloss: .7 }, solid: false });
      B({ u: 4.65, v: v + .1, y: y + .45, w: .014, d: .075, h: 1.8, mat: { color: i % 3 ? 0xc7c7bc : 0x7e8b8d, gloss: .7 }, solid: false });
    }
    B({ u: 4.0, v: 22.9, y, w: .65, d: 1.5, h: .82, mat: 'jwWalnut', top: { tex: 'jwDarkMarble', gloss: .7 } });
    for (let i = 0; i < 4; i++) goblet(3.95, 22.43 + i * .3, y + .83, .85);
    MAN(-4.9, 20, y, { sit: true, rotY: FACE.E, shirt: 0x65554b });
    MAN(1.5, 45.7, y, { sit: true, rotY: FACE.W, shirt: 0x90837a });
    LIGHTS([-7.4, 7, 4.6, 47], yc - .04, 2.6, .07, 0xf3d4a4);
    // Photos 07/08 confirm reception on 8F, beside The Lounge; exact desk positions remain approximate.
    for (const u of [7.6, 10.6, 13.6]) B({ u, v: 48.2, y, w: 2.5, d: .9, h: 1.08, mat: 'jwWalnut', top: 'jwHoney' });
    SG('체크인 · 체크아웃', { u: 10.6, v: 47.72, y: y + .78, w: 1.1, h: .16, f: 'N', bg: null, fg: '#e4d3b2', bold: false });
    WL(6, 53.5, 15.85, 53.5, y, yc, { mat: 'jwWalnut' });
    BOH([6, 53.6, 15.85, 57.9], y, 5.2);
    SG('JW MARRIOTT', { u: 10.9, v: 53.35, y: y + 2.5, w: 2.5, h: .36, f: 'N', bg: null, fg: '#c5aa7b' });
    MAN(10.6, 49.6, y, { shirt: 0x292623 });
    STR(4.1, 56.2, 4.1, 48.8, y, Y['9F'], 1.8, { railWalls: false });
    COVE([5.2, 6.2, 15.8, 24.1], yc);
    COVE([2.5, 39.6, 8.7, 48.5], yc);
    COVE([5.2, 24.2, 8.7, 39.5], y + 3.5);
    HP(0xe4dccd, [6, 48.5, 15.8, 53.5], yc, false);
    SUBZ('프런트 데스크', '8F', '체크인 · 체크아웃', [5.2, 44, 16, 53.5]);
    SUBZ('그랜드 피아노', '8F', '더 라운지', [-6, 39.3, -3.6, 43.3]);
    SUBZ('더 라운지 바', '8F', '대리석 바 · 월넛 패널', [-7.85, 6.1, 4.8, 13.4]);
    SUBZ('더 라운지', '8F', '구리빛 커튼 · 크림 소파 · 피아노', [-8, 14, 5.2, 48]);
    SUBZ('엘리베이터 홀', '8F', '객실 · 레스토랑 층 연결', [5.2, 24.2, 8.8, 39.5]);
    SUBZ('9F 라운지 계단', '8F', '이그제큐티브 라운지 연결', [3, 48.8, 5.2, 57]);
  }

  // =====================================================================
  // 9F–11F — 이그제큐티브 라운지 · 사무실 (2026 lift directory)
  // =====================================================================
  function floors9to11() {
    for (const k of ['9F', '10F', '11F']) {
      const y = Y[k], yc = NEXT[k] - 0.3;
      LIGHTS([2.5, 24.2, 8.8, 39.6], yc, 3.5, 0.6);
      if (k === '9F') {
        DETAIL(k, TW, '이그제큐티브 라운지 · 비즈니스 센터', () => {
        // 16: herringbone timber, blue rugs, ivory round tables and softly curved bucket chairs.
        RAILBOX([3.0, 48.8, 5.2, 57], y, 'n');
        WL(-7.85, 24.2, 8.85, 24.2, y, yc, { mat: 'jwWalnut', openings: [{ at: 13.55, w: 2.4, y0: y, y1: y + 2.6 }] });
        HP({ tex: 'jwChevron', gloss: .3 }, [-7.85, 6.1, 15.85, 24.2], y + 0.012);
        for (const r of [[-7.2, 7.8, 3.2, 14.2], [6.8, 7.7, 15.2, 13.8], [-7.2, 16.1, 3.2, 22.6], [6.8, 16.1, 15.2, 22.6]]) {
          const [a, b, c, d] = r, cu = (a + c) / 2, cv = (b + d) / 2, poly = [];
          for (let n = 0; n < 48; n++) { const angle = n / 48 * Math.PI * 2; poly.push(P(cu + Math.cos(angle) * (c - a) / 2, cv + Math.sin(angle) * (d - b) / 2)); }
          DK.hpoly('jwFoyerCarpet', poly, y + .018, true);
        }
        COVE([-7.8, 6.15, 15.8, 24.1], y + 3.45, 0xf1eee5);
        // 16: small recessed spots, flat cream ceiling and a continuous amber window cove.
        for (const u of [-7.53, 15.53]) {
          B({ u, v: 15.1, y: y + 3.2, w: .32, d: 17.7, h: .16, mat: 0xe8e1d2, solid: false });
          B({ u: u < 0 ? u + .17 : u - .17, v: 15.1, y: y + 3.32, w: .09, d: 17.65, h: .055, mat: { tex: 'emit', color: 0xffb65c }, solid: false });
          for (let v = 7.3; v < 24; v += 1.5) B({ u, v, y: y + .35, w: .08, d: .045, h: 2.8, mat: 0x8f918b, solid: false });
          B({ u, v: 15.1, y: y + .95, w: .19, d: 17.7, h: .065, mat: 0xe1ded3, solid: false });
        }
        for (const u of [-5.8, 1.9, 8.4, 13.8]) for (const v of [8.3, 13.1, 17.9, 22.7]) {
          CY(u, v, y + 3.405, .085, .018, 0xd8d5cb, { seg: 12, solid: false });
          CY(u, v, y + 3.397, .039, .014, { tex: 'emit', color: 0xffe4bb }, { seg: 10, solid: false });
        }
        // The photo wall is an open fine grid with heavier rails, framed glazed bays and a bronze doorway.
        for (const [a, b] of [[-7.65, 4.35], [7.05, 15.6]]) {
          SLATS('v', 23.95, a, b, y, 3.35, .13, { w: .022, d: .052 });
          for (let dy = .17; dy < 3.35; dy += .21) B({ u: (a + b) / 2, v: 23.9, y: y + dy, w: b - a, d: .035, h: .016, mat: 0x9b7c58, solid: false });
          for (const dy of [.08, .83, 1.58, 2.33, 3.27]) B({ u: (a + b) / 2, v: 23.87, y: y + dy, w: b - a, d: .045, h: .035, mat: 0x8d6f4f, solid: false });
          for (let u = a; u < b; u += 2.3) B({ u, v: 23.84, y, w: .07, d: .06, h: 3.35, mat: 0x73563e, solid: false });
        }
        for (const u of [4.43, 6.97]) B({ u, v: 24.03, y, w: .15, d: .22, h: 2.76, mat: 0x997b4b, solid: false });
        B({ u: 5.7, v: 24.03, y: y + 2.64, w: 2.69, d: .22, h: .12, mat: 0x997b4b, solid: false });
        const executiveChair = (u, v, face, mat) => {
          CHAIR(u, v, y, face, mat);
          const ang = { S: 0, E: Math.PI / 2, N: Math.PI, W: -Math.PI / 2 }[face];
          const at = (du, dv) => [u + du * Math.cos(ang) + dv * Math.sin(ang), v - du * Math.sin(ang) + dv * Math.cos(ang)];
          // Raised inner cushion and fine vertical gathers visible on the leather backs in 16.
          for (let i = -4; i <= 4; i++) {
            const du = i * .064, dv = -.305 + Math.abs(i) * .018, p = at(du, dv);
            B({ u: p[0], v: p[1], y: y + .57, w: .004, d: .008, h: .27 - Math.abs(i) * .028, r: ang, mat: 0xa69b88, solid: false });
          }
          const p = at(0, -.265);
          B({ u: p[0], v: p[1], y: y + .49, w: .38, d: .065, h: .11, r: ang, mat, solid: false });
        };
        const executiveTable = (u, v, r = .69, h = .73) => {
          // Photo tables have a substantial black apron and four legs, not a central pedestal.
          CY(u, v, y + h - .13, r * .96, .115, 0x252421, { seg: 28, solid: false });
          CY(u, v, y + h - .025, r, .035, { color: 0xece6d9, gloss: .5 }, { seg: 32, solid: false });
          for (const du of [-1, 1]) for (const dv of [-1, 1]) B({ u: u + du * r * .54, v: v + dv * r * .54, y: y + .025, w: .05, d: .05, h: h - .07, mat: 0x252421, solid: false });
          B({ u, v, y, w: r * 1.35, d: r * 1.35, h, mat: 0, solid: true, skip: ['top', 'bottom', 'n', 's', 'e', 'w'] });
          CY(u + .23, v - .08, y + h + .012, .09, .012, 0xf0ebe0, { seg: 16, solid: false });
          CY(u + .23, v - .08, y + h + .024, .045, .075, 0xe9e4da, { seg: 12, solid: false, caps: false });
          CY(u + .23, v - .08, y + h + .025, .037, .055, 0x4d3020, { seg: 12, solid: false });
          B({ u: u + .29, v: v - .08, y: y + h + .043, w: .035, d: .026, h: .032, mat: 0xe9e4da, solid: false });
          B({ u: u - .23, v: v + .1, y: y + h + .012, w: .23, d: .15, h: .016, mat: 0x2f302d, solid: false });
          B({ u: u - .23, v: v + .06, y: y + h + .03, w: .23, d: .025, h: .22, mat: 0x2f302d, solid: false });
          SG('라운지 안내', { u: u - .23, v: v + .077, y: y + h + .14, w: .17, h: .085, f: 'S', bg: '#343530', fg: '#dcd7cb', bold: false });
        };
        // Staggered islands reproduce the overlapping seating in 16; u=4.4..6.7 remains the lift aisle.
        const seats = [[-4.8, 9.7], [.25, 10.7], [-4.8, 14.8], [.25, 15.7], [-4.8, 19.9], [.25, 20.6], [9.2, 10.4], [13.4, 10.4], [9.2, 15.1], [13.4, 15.1], [9.2, 19.9], [13.4, 19.9]];
        for (const [i, [u, v]] of seats.entries()) {
          executiveTable(u, v, i % 3 ? .67 : .77);
          executiveChair(u - 1.12, v, 'E', i % 2 ? 0xd9d0bf : 0xb8ad99);
          executiveChair(u + 1.12, v, 'W', i % 2 ? 0xbfb39d : 0xe0d8c9);
          if (i % 3 !== 2) executiveChair(u, v - 1.1, 'S', 0xd8cfbf);
        }
        for (const [u, w, mat] of [[-4.5, 4.5, 0x78604e], [.3, 3.1, 0x8c6f61], [10.8, 4.8, 0x846957]]) {
          SOFA(u, 22.9, y, w, 'N', mat);
          for (let du = -w / 2 + .45; du < w / 2; du += .8) {
            B({ u: u + du, v: 22.88, y: y + .43, w: .73, d: .66, h: .1, mat, solid: false });
            B({ u: u + du, v: 23.17, y: y + .53, w: .42, d: .14, h: .36, r: du < 0 ? -.08 : .08, mat: du < 0 ? 0xd8c7a8 : 0x554439, solid: false });
          }
        }
        // Small service credenza continues the photographed timber and pale-stone palette; position inferred.
        B({ u: 11.4, v: 6.85, y, w: 6.5, d: .75, h: .88, mat: 'jwWalnut', top: 'jwHoney' });
        for (let u = 8.4; u < 14.5; u += .75) B({ u, v: 7.24, y: y + .12, w: .018, d: .02, h: .63, mat: 0x362c24, solid: false });
        B({ u: 12.9, v: 6.87, y: y + .88, w: .65, d: .45, h: .57, mat: 0x292b29, top: 0xa5a69d, solid: false });
        for (const u of [12.73, 13.07]) {
          B({ u, v: 7.12, y: y + 1.15, w: .08, d: .1, h: .08, mat: 0xb5b3a7, solid: false });
          CY(u, 7.12, y + .91, .05, .08, 0xe8e4d9, { seg: 10, solid: false });
        }
        for (let i = 0; i < 12; i++) CY(8.8 + (i % 6) * .19, 6.8 + Math.floor(i / 6) * .23, y + .89, .055, .11, { tex: 'glass', color: 0xdbded4 }, { seg: 10, solid: false, caps: false });
        FLOWER(11.4, 6.8, y + .89, .37, [0x71815b, 0xd6cab7, 0x9c7354]);
        SG('이그제큐티브 라운지', { u: 7.5, v: 24.32, y: y + 1.5, w: 0.9, h: 0.28, f: 'S', bg: '#46382e', fg: '#dfd3bd' });
        // Photo 16: a blue-shirted guest working at the nearer window table.
        MAN(-.87, 10.7, y, { sit: true, rotY: FACE.E, shirt: 0x59758e, pants: 0x403c35 });
        B({ u: .13, v: 10.7, y: y + .775, w: .28, d: .34, h: .018, mat: { color: 0x424642, gloss: .3 }, solid: false });
        B({ u: .25, v: 10.7, y: y + .793, w: .025, d: .34, h: .24, mat: 0x303532, solid: false });
        B({ u: .232, v: 10.7, y: y + .82, w: .006, d: .29, h: .185, mat: 0x6d817e, solid: false });
        MAN(-5.92, 14.8, y, { sit: true, rotY: FACE.E, shirt: 0x59718b });
        MAN(-.87, 20.6, y, { sit: true, rotY: FACE.E, shirt: 0x463c35 });
        MAN(14.52, 10.4, y, { sit: true, rotY: FACE.W, shirt: 0xc6b9a5 });
        SUBZ('이그제큐티브 라운지', '9F', '창가 좌석 · 조식 · 해피아워', [-8, 6, 16, 24.2]);
        SUBZ('라운지 계단 홀', '9F', '8F 로비 연결 계단', [-7.85, 48, 5.2, 57.9]);
        // The directory confirms a business centre; these desks and the south waiting area are inferred.
        WL(5.2, 39.6, 15.85, 39.6, y, yc, { mat: 0xd6cbbb, thick: 0.15 });
        WL(5.2, 39.6, 5.2, 57.9, y, yc, { mat: 0xd6cbbb, thick: 0.15, openings: [{ at: 4.4, w: 1.6, y0: y, y1: y + 2.4 }] });
        SG('비즈니스 센터', { u: 5.07, v: 42.5, y: y + 1.5, w: 0.7, h: 0.25, f: 'W', bg: '#49392e', fg: '#e5dcca' });
        HP({ tex: 'jwChevron', gloss: .3 }, [5.3, 39.7, 15.8, 57.8], y + 0.012);
        COVE([5.3, 39.7, 15.8, 57.8], y + 3.45);
        for (const v of [42, 46.2, 50.4]) {
          B({ u: 14.7, v, y, w: 1.7, d: .8, h: .74, mat: 'jwWalnut', top: 'jwHoney' });
          B({ u: 14.93, v, y: y + .86, w: .055, d: .5, h: .36, mat: 0x333631, solid: false });
          B({ u: 14.89, v, y: y + .9, w: .012, d: .43, h: .28, mat: 0x65716d, solid: false });
          B({ u: 14.48, v, y: y + .75, w: .22, d: .44, h: .022, mat: 0x474944, solid: false });
          CHAIR(13.45, v, y, 'E', 0xb3a38d);
        }
        B({ u: 10.2, v: 55.3, y: y + .7, w: 4.1, d: 1.25, h: .07, mat: 'jwWalnut' });
        for (const u of [8.65, 11.75]) B({ u, v: 55.3, y, w: .1, d: .8, h: .7, mat: 0x3b3028, solid: false });
        for (const u of [9, 11.3]) for (const v of [54.1, 56.5]) CHAIR(u, v, y, v < 55 ? 'S' : 'N', 0xc5b79f);
        SOFA(-6.4, 44.7, y, 4, 'E', 0x877363);
        SOFA(-6.4, 53.9, y, 4, 'E', 0x877363);
        ROUND(-3.8, 44.7, y, .65, .45, 'jwHoney'); ROUND(-3.8, 53.9, y, .65, .45, 'jwHoney');
        for (const v of [44.7, 53.9]) {
          FLOWER(-3.8, v, y + .46, .24, [0x5f774c, 0xe0c4a2, 0x986f50]);
          CHAIR(-2.6, v, y, 'W', 0xc5b79f);
        }
        COVE([-7.8, 39.7, 2.75, 57.8], y + 3.45, 0xf1eee5);
        SUBZ('비즈니스 센터', '9F', '비즈니스 서비스', [5.2, 39.6, 15.85, 57.9]);
        });
        continue;
      }
      // 08 labels both floors as offices. Unphotographed offices stay undecorated.
      for (const [v0, v1] of [[6.2, 24], [39.7, 57.8]]) {
        WL(5.2, v0, 5.2, v1, y, yc, { mat: 0xccc0ac, thick: .15, openings: [{ at: 2, w: 1.4, y0: y, y1: y + 2.3 }] });
        SG('사무실', { u: 5.08, v: v0 + 3.2, y: y + 1.5, w: .42, h: .17, f: 'W', bg: '#514536', fg: '#ece4d6' });
        HP(0xe7dfd1, [5.3, v0, 15.8, v1], yc - .04, false);
      }
      COVE([-7.8, 6.2, 5, 57.8], yc - .05);
      SUBZ('사무실', k, '호텔 사무실', TW);
    }
  }

  // =====================================================================
  // 12F–32F — 객실층 (corridor template) + 객실 2006 (20F) fully modeled
  // =====================================================================
  function roomFloors() {
    const west = [[6.15, 13, 1, true]];
    for (let i = 2; i <= 10; i++) west.push([13 + (i - 2) * 4.444, 13 + (i - 1) * 4.444, i, false]);
    west.push([51, 57.85, 11, true]);
    const east = [[51, 57.85, 12, true], [45.5, 51, 13, false], [39.5, 45.5, 14, false], [18.5, 24.2, 17, false], [13, 18.5, 18, false], [6.15, 13, 19, true]];
    for (const n of ROOMF) {
      const y = Y[n + 'F'], yc = y + 3.3, show = n === 20;
      const dW = (a, b, s) => s ? b - 1.4 : b - 0.8;
      const showRoom = west[5]; // room 06
      WL(3, 6.15, 3, 57.85, y, yc, { mat: 0xdccbb0, thick: 0.15, openings: show ? [{ at: dW(showRoom[0], showRoom[1], false) - 6.15, w: 1.0, y0: y, y1: y + 2.25 }] : [] });
      WL(5.2, 6.15, 5.2, 24.2, y, yc, { mat: 0xdccbb0, thick: 0.15 }); WL(5.2, 39.5, 5.2, 57.85, y, yc, { mat: 0xdccbb0, thick: 0.15, openings: show ? [{ at: 44.7 - 39.5, w: 1.0, y0: y, y1: y + 2.25 }] : [] });
      for (const [a, b, no, suite] of west) {
        const v = dW(a, b, suite), num = `${n}${String(no).padStart(2, '0')}`;
        if (!(show && no === 6)) DOORP(3.09, v, y, 'E', suite ? 1.2 : 0.95, 0x5a3e2a, 2.3);
        SG([num], { u: 3.1, v: v + (suite ? -1.0 : -0.85), y: y + 1.55, w: 0.36, h: 0.17, f: 'E', bg: '#3a2c20', fg: '#e8d29a', pxPerM: 360 });
        if (!(show && no === 6)) SUBZS(`${num}호`, n + 'F', suite ? '스위트' : '디럭스', [-7.85, a, 3, b], y + 3.3);
      }
      for (const [a, b, no, suite] of east) {
        const v = dW(a, b, suite), num = `${n}${String(no).padStart(2, '0')}`;
        if (!(show && no === 14)) DOORP(5.11, v, y, 'W', suite ? 1.2 : 0.95, 0x5a3e2a, 2.3);
        SG([num], { u: 5.1, v: v + (suite ? -1.0 : -0.85), y: y + 1.55, w: 0.36, h: 0.17, f: 'W', bg: '#3a2c20', fg: '#e8d29a', pxPerM: 360 });
        if (!(show && no === 14)) SUBZS(`${num}호`, n + 'F', suite ? '스위트' : '디럭스', [5.2, a, 15.85, b], y + 3.3);
      }
      for (let v = 8; v < 57; v += 4) { const p = [P(3.6, v - 0.35), P(4.6, v - 0.35), P(4.6, v + 0.35), P(3.6, v + 0.35)]; K.quad({ tex: 'emit', color: 0xfff0d0 }, p.map(q => [q[0], yc - 0.02, q[1]]), [0, -1, 0]); }
      SUBZS('객실 복도', n + 'F', `${n}01–${n}19호`, [3, 6.15, 5.2, 57.85], y + 3.3);
      LIGHTS([5.2, 24.2, 8.8, 39.5], yc, 3.5, 0.6);
      SG([`${n}F`], { u: 3.1, v: 32, y: y + 1.9, w: 1.4, h: 0.8, f: 'E', bg: '#d8cab2', fg: '#7a5f40' });
      SG([`${n}01 – ${n}11  /  ${n}12 – ${n}19`], { u: 3.1, v: 32, y: y + 1.2, w: 2.4, h: 0.3, f: 'E', bg: '#dccbb0', fg: '#5a4630' });
      B({ u: 3.25, v: 32, y, w: 0.4, d: 1.6, h: 0.85, mat: WALNUT, top: 0xe8e0d0 });
      if (n % 3 === 0) { B({ u: 4.1, v: 12 + (n % 5) * 7, y, w: 0.8, d: 1.4, h: 1.1, mat: 0xd8d2c6, solid: false }); MAN(4.4, 14 + (n % 5) * 7, y, { shirt: 0x2b3a55 }); }
    }
    // ---- room 2006 (디럭스 킹, west view) — fully furnished ----
    const y = Y['20F'], yc = y + 3.3, [a, b] = west[5];
    const LAMP = (u, v, yy, hgt = 0.62) => { CY(u, v, yy, 0.07, hgt - 0.28, 0x8a7458, { seg: 6, solid: false }); CY(u, v, yy + hgt - 0.3, 0.2, 0.3, { tex: 'emit', color: 0xfff0c8 }, { seg: 10, solid: false }); };
    const PILLOWS = (u, v, w, yy) => { for (let i = 0; i < Math.round(w / 0.7); i++) B({ u: u - w / 2 + 0.35 + i * 0.7, v, y: yy, w: 0.62, d: 0.32, h: 0.2, mat: 0xfbfaf6, solid: false }); };
    WL(-7.85, a, 3, a, y, yc, { mat: 0xe8dfd0, thick: 0.15 }); WL(-7.85, b, 3, b, y, yc, { mat: 0xe8dfd0, thick: 0.15 });
    HP({ tex: 'carpet', color: 0xb8a68c }, [-7.85, a, -0.8, b], y + 0.01); HP({ tex: 'wood', color: 0x9c7a58 }, [-0.8, b - 1.6, 3, b], y + 0.012);
    B({ u: 2.5, v: b - 0.12, y, w: 0.95, d: 0.05, h: 2.25, mat: 0x5a3e2a, solid: false });                      // door leaf (open)
    // bathroom (marble) by the door: tub, vanity + mirror, WC, glass shower
    WL(-0.8, a, -0.8, b - 1.6, y, yc, { mat: 0xefe9de, thick: 0.12 });
    WL(-0.8, b - 1.6, 3, b - 1.6, y, yc, { mat: 0xefe9de, thick: 0.12, openings: [{ at: 1.8, w: 0.9, y0: y, y1: y + 2.2 }] });
    HP({ tex: 'marble', color: 0xf2ede4 }, [-0.8, a, 3, b - 1.6], y + 0.015);
    B({ u: 1.6, v: a + 0.45, y, w: 2.6, d: 0.8, h: 0.55, mat: 0xf8f8f6, top: 0xdfeef4 });
    B({ u: -0.25, v: a + 0.75, y, w: 1.0, d: 1.4, h: 0.04, mat: 0xd8d0c4, solid: false }); WL(0.25, a + 0.05, 0.25, a + 1.5, y, y + 2.1, { mat: { tex: 'glass', color: 0xdff0f6 }, thick: 0.02, solid: false });
    B({ u: 2.55, v: b - 2.45, y, w: 0.8, d: 1.2, h: 0.85, mat: 0x6b4a32, top: 0xf2ede4 }); CY(2.5, b - 2.45, y + 0.85, 0.2, 0.12, 0xffffff, { seg: 10, solid: false });
    B({ u: 2.95, v: b - 2.45, y: y + 1.15, w: 0.04, d: 1.1, h: 0.95, mat: { tex: 'glass', color: 0xe8f2f8 }, solid: false });
    B({ u: 0.2, v: b - 2.15, y, w: 0.5, d: 0.65, h: 0.42, mat: 0xf8f8f6, solid: false }); B({ u: 0.2, v: b - 1.82, y: y + 0.42, w: 0.45, d: 0.15, h: 0.35, mat: 0xf8f8f6, solid: false });
    K.quad({ tex: 'emit', color: 0xfff6e8 }, [P(0.2, a + 0.6), P(2.4, a + 0.6), P(2.4, b - 2.2), P(0.2, b - 2.2)].map(q => [q[0], y + 2.6, q[1]]), [0, -1, 0]);
    HP({ tex: 'ceiling', color: 0xf4efe6 }, [-0.8, a, 3, b - 1.6], y + 2.62, false);
    // entry: wardrobe + minibar
    B({ u: 1.2, v: b - 0.3, y, w: 2.0, d: 0.5, h: 2.4, mat: 0x6b4a32, solid: true }); B({ u: 1.2, v: b - 0.56, y: y + 1.2, w: 2.3, d: 0.02, h: 0.02, mat: 0xc9a85c, solid: false });
    // headboard wall (walnut panel + art) and king bed
    B({ u: -4.3, v: a + 0.1, y, w: 4.6, d: 0.08, h: 2.7, mat: 0x6b4a32, solid: false });
    B({ u: -4.3, v: a + 0.2, y: y + 0.3, w: 2.4, d: 0.12, h: 1.25, mat: 0xd9cbb4, solid: false });                // upholstered headboard
    B({ u: -4.3, v: a + 0.17, y: y + 1.75, w: 1.6, d: 0.04, h: 0.8, mat: 0x8aa0b0, solid: false }); B({ u: -4.3, v: a + 0.16, y: y + 1.7, w: 1.75, d: 0.03, h: 0.9, mat: 0xc9a85c, solid: false });
    B({ u: -4.3, v: a + 1.3, y, w: 2.0, d: 2.1, h: 0.36, mat: 0x4a3a2c, skip: ['bottom'] });
    B({ u: -4.3, v: a + 1.3, y: y + 0.36, w: 1.95, d: 2.05, h: 0.24, mat: 0xf8f6f2, solid: false, skip: ['bottom'] });
    B({ u: -4.3, v: a + 1.75, y: y + 0.6, w: 2.0, d: 1.2, h: 0.06, mat: 0xfdfcf8, solid: false });              // duvet fold
    B({ u: -4.3, v: a + 2.0, y: y + 0.61, w: 2.02, d: 0.42, h: 0.06, mat: 0x7a5f40, solid: false });              // bed runner
    PILLOWS(-4.3, a + 0.48, 1.9, y + 0.6); PILLOWS(-4.3, a + 0.68, 1.4, y + 0.62);
    for (const du of [-1.55, 1.55]) { B({ u: -4.3 + du, v: a + 0.45, y, w: 0.6, d: 0.5, h: 0.55, mat: WALNUT }); LAMP(-4.3 + du, a + 0.45, y + 0.55); }
    B({ u: -4.3, v: a + 2.75, y, w: 1.4, d: 0.45, h: 0.45, mat: 0xb8a68c, solid: false });                    // bench at the foot
    // media wall opposite the bed: credenza + TV
    B({ u: -4.6, v: b - 0.3, y, w: 2.8, d: 0.5, h: 0.6, mat: WALNUT, top: 0x2b241d });
    B({ u: -4.6, v: b - 0.1, y: y + 1.0, w: 1.45, d: 0.05, h: 0.85, mat: 0x0d1014, solid: false }); B({ u: -4.6, v: b - 0.13, y: y + 1.03, w: 1.37, d: 0.01, h: 0.79, mat: { tex: 'emit', color: 0x24384c }, solid: false });
    // writing desk + chair by the window, armchair + floor lamp in the corner
    B({ u: -7.2, v: b - 1.2, y, w: 0.6, d: 1.5, h: 0.75, mat: WALNUT, top: 0x3b2c22 }); B({ u: -6.55, v: b - 1.2, y, w: 0.5, d: 0.5, h: 0.46, mat: 0x5a4636, solid: false }); B({ u: -6.35, v: b - 1.2, y: y + 0.46, w: 0.08, d: 0.48, h: 0.5, mat: 0x5a4636, solid: false });
    LAMP(-7.3, b - 0.65, y + 0.75, 0.5);
    SOFA(-7.05, a + 3.3, y, 0.9, 'E', 0x8a7a6a); LAMP(-7.3, a + 2.6, y, 1.6);
    CY(-6.2, a + 3.3, y, 0.3, 0.5, 0x2b241d, { seg: 10 });
    // drapes, sheer + ceiling cove light + downlights
    for (const v of [a + 0.25, b - 0.25]) B({ u: -7.55, v, y: y + 0.05, w: 0.25, d: 0.35, h: 3.15, mat: 0xd9cdb8, solid: false });
    B({ u: -7.7, v: (a + b) / 2, y: y + 3.15, w: 0.2, d: b - a - 0.2, h: 0.12, mat: 0x6b4a32, solid: false });
    K.quad({ tex: 'emit', color: 0xfff2dc }, [P(-5.4, a + 1.3), P(-2.8, a + 1.3), P(-2.8, b - 1.3), P(-5.4, b - 1.3)].map(q => [q[0], yc - 0.02, q[1]]), [0, -1, 0]);
    SUBZ('객실 2006 · 디럭스 킹', '20F', '킹 베드 · 욕조 · 시티 뷰 (반포 방면)', [-7.85, a, 3, b], yc);
    SUBZ('2006 욕실', '20F', '욕조 · 샤워 · 세면대', [-0.8, a, 3, b - 1.6], yc);
    // ---- room 2014 (디럭스 트윈, east view toward 경부선 터미널) — fully furnished ----
    {
      const a2 = 39.5, b2 = 45.5, bw = 9.0;
      WL(5.2, a2, 8.8, a2, y, yc, { mat: 0xe8dfd0, thick: 0.15 }); WL(5.2, b2, 15.85, b2, y, yc, { mat: 0xe8dfd0, thick: 0.15 });
      WL(8.8, a2 + 0.08, 15.85, a2 + 0.08, y, yc, { mat: 0xe8dfd0, thick: 0.05, solid: false });
      HP({ tex: 'carpet', color: 0xa89a86 }, [bw, a2, 15.85, b2], y + 0.01); HP({ tex: 'wood', color: 0x9c7a58 }, [5.2, b2 - 1.6, bw, b2], y + 0.012);
      B({ u: 5.75, v: b2 - 0.12, y, w: 0.95, d: 0.05, h: 2.25, mat: 0x5a3e2a, solid: false });
      WL(bw, a2, bw, b2 - 1.6, y, yc, { mat: 0xefe9de, thick: 0.12 });
      WL(5.2, b2 - 1.6, bw, b2 - 1.6, y, yc, { mat: 0xefe9de, thick: 0.12, openings: [{ at: 1.9, w: 0.9, y0: y, y1: y + 2.2 }] });
      HP({ tex: 'marble', color: 0xf2ede4 }, [5.2, a2, bw, b2 - 1.6], y + 0.015);
      B({ u: 6.0, v: a2 + 1.4, y, w: 1.2, d: 2.4, h: 0.04, mat: 0xd8d0c4, solid: false }); WL(5.3, a2 + 2.65, 6.7, a2 + 2.65, y, y + 2.1, { mat: { tex: 'glass', color: 0xdff0f6 }, thick: 0.02, solid: false });
      B({ u: 8.0, v: a2 + 0.5, y, w: 1.6, d: 0.55, h: 0.85, mat: 0x6b4a32, top: 0xf2ede4 }); B({ u: 8.0, v: a2 + 0.2, y: y + 1.15, w: 1.5, d: 0.04, h: 0.95, mat: { tex: 'glass', color: 0xe8f2f8 }, solid: false });
      B({ u: 8.4, v: a2 + 2.6, y, w: 0.65, d: 0.5, h: 0.42, mat: 0xf8f8f6, solid: false });
      K.quad({ tex: 'emit', color: 0xfff6e8 }, [P(5.6, a2 + 0.4), P(8.6, a2 + 0.4), P(8.6, b2 - 2.0), P(5.6, b2 - 2.0)].map(q => [q[0], y + 2.6, q[1]]), [0, -1, 0]);
      HP({ tex: 'ceiling', color: 0xf4efe6 }, [5.2, a2, bw, b2 - 1.6], y + 2.62, false);
      B({ u: 7.4, v: b2 - 0.35, y, w: 2.4, d: 0.55, h: 2.4, mat: 0x6b4a32 });
      B({ u: 12.4, v: a2 + 0.18, y, w: 6.6, d: 0.08, h: 2.7, mat: 0x5a4636, solid: false });
      for (const uc of [11.0, 13.9]) {
        B({ u: uc, v: a2 + 0.27, y: y + 0.3, w: 1.3, d: 0.1, h: 1.15, mat: 0xcfc2ad, solid: false });
        B({ u: uc, v: a2 + 1.3, y, w: 1.2, d: 2.05, h: 0.36, mat: 0x4a3a2c, skip: ['bottom'] });
        B({ u: uc, v: a2 + 1.3, y: y + 0.36, w: 1.16, d: 2.0, h: 0.24, mat: 0xf8f6f2, solid: false, skip: ['bottom'] });
        B({ u: uc, v: a2 + 1.95, y: y + 0.61, w: 1.2, d: 0.38, h: 0.06, mat: 0x3d4a63, solid: false });
        PILLOWS(uc, a2 + 0.5, 1.1, y + 0.6);
      }
      B({ u: 12.45, v: a2 + 0.45, y, w: 0.6, d: 0.5, h: 0.55, mat: WALNUT }); LAMP(12.45, a2 + 0.45, y + 0.55);
      B({ u: 9.6, v: a2 + 0.45, y, w: 0.5, d: 0.5, h: 0.55, mat: WALNUT }); LAMP(9.6, a2 + 0.45, y + 0.55);
      B({ u: 12.0, v: b2 - 0.3, y, w: 2.8, d: 0.5, h: 0.6, mat: WALNUT, top: 0x2b241d });
      B({ u: 12.0, v: b2 - 0.1, y: y + 1.0, w: 1.45, d: 0.05, h: 0.85, mat: 0x0d1014, solid: false }); B({ u: 12.0, v: b2 - 0.13, y: y + 1.03, w: 1.37, d: 0.01, h: 0.79, mat: { tex: 'emit', color: 0x24384c }, solid: false });
      SOFA(15.1, b2 - 1.5, y, 0.9, 'W', 0x7a6a5a); CY(14.2, b2 - 1.5, y, 0.3, 0.5, 0x2b241d, { seg: 10 }); LAMP(15.3, b2 - 0.6, y, 1.6);
      for (const v of [a2 + 0.3, b2 - 0.25]) B({ u: 15.55, v, y: y + 0.05, w: 0.25, d: 0.35, h: 3.15, mat: 0xd9cdb8, solid: false });
      K.quad({ tex: 'emit', color: 0xfff2dc }, [P(bw + 1.6, a2 + 1.3), P(14.2, a2 + 1.3), P(14.2, b2 - 1.3), P(bw + 1.6, b2 - 1.3)].map(q => [q[0], yc - 0.02, q[1]]), [0, -1, 0]);
      SUBZ('객실 2014 · 디럭스 트윈', '20F', '트윈 베드 · 샤워 · 경부선 터미널 방면 뷰', [5.2, a2, 15.85, b2], yc);
    }
  }

  // =====================================================================
  // 33F — 펜트하우스 (복층)
  // =====================================================================
  function floor33() {
    const y = Y['33F'], ym = y + 3.6, yc = ROOF - 0.4;
    WL(-7.85, 24.2, 8.85, 24.2, y, yc, { mat: 0xdccbb0, thick: 0.2 });
    WL(-7.85, 39.5, 8.85, 39.5, y, yc, { mat: 0xdccbb0, thick: 0.2, openings: [{ at: 12, w: 1.6, y0: y, y1: y + 2.5 }] });
    WL(3, 24.2, 3, 39.5, y, yc, { mat: 0xdccbb0, thick: 0.15 });
    K.hpoly({ tex: 'ceiling', color: 0xf4efe6 }, RECT(3, 24.2, 8.85, 39.5), y + 3.4, false);
    DOORP(4.1, 24.29, y, 'S', 1.6, 0x3a2c20, 2.5); SG(['펜트하우스 B'], { u: 4.1, v: 24.35, y: y + 2.85, w: 1.6, h: 0.3, f: 'S', bg: '#2b241d', fg: '#e8d29a' });
    SG(['펜트하우스 A'], { u: 4.1, v: 39.35, y: y + 2.85, w: 1.6, h: 0.3, f: 'N', bg: '#2b241d', fg: '#e8d29a' });
    LIGHTS([3, 24.2, 8.8, 39.5], y + 3.4, 3.5, 0.5);
    // penthouse A: double-height living + mezzanine bedroom (east part)
    HP({ tex: 'wood', color: 0x9c7a58 }, [-7.85, 39.6, 15.85, 57.9], y + 0.01);
    SLAB([6, 39.65, 15.85, 57.9], ym, { mat: { tex: 'carpet', color: 0xb8a68c }, thick: 0.25, holes: [] });
    STR(-2, 56.6, 6, 56.6, y, ym, 1.5, { railWalls: false });
    RAIL(6, 39.7, 6, 55.7, ym); RAIL(6, 57.5, 6, 57.85, ym);
    for (const [u, v, f] of [[-5.5, 50, 'S'], [-1.5, 53.5, 'W'], [-5.5, 54, 'N']]) SOFA(u, v, y, 3.2, f, 0xe8e0d2);
    TABLE(-4, 52, y, { r: 0.7, chairs: 0, h: 0.42, top: 0x2b2b2b });
    B({ u: 2.5, v: 50.5, y: y + 0.65, w: 1.5, d: 2.2, h: 0.35, mat: 0x0f0f10 });
    TABLE(-2, 44, y, { square: true, r: 1.0, chairs: 8, top: 0x2b241d, chair: 0xd8cbb5 });
    B({ u: 10.5, v: 45, y, w: 3, d: 1.2, h: 0.95, mat: 0x2b2b2b, top: 0xefe9de }); B({ u: 15.3, v: 48, y, w: 0.9, d: 8, h: 2.3, mat: WALNUT });
    B({ u: 11, v: 51, y: ym, w: 2.0, d: 2.2, h: 0.55, mat: 0x5a4636, top: 0xf8f6f2 }); B({ u: 11, v: 52.2, y: ym, w: 2.6, d: 0.1, h: 1.3, mat: 0x4a3a2c, solid: false });
    SOFA(11, 44, ym, 2.4, 'S', 0x8a7a6a);
    CHAND(-1, 47, yc, 1.6);
    LIGHTS([-7.85, 39.6, 6, 57.9], yc, 3.5, 0.5); LIGHTS([6, 39.6, 15.85, 57.9], ym - 0.25, 3.5, 0.5);
    SUBZ('펜트하우스 A', '33F', '복층 · 최상층 · 전망', [-7.85, 39.5, 15.85, 58], ROOF);
    // penthouse B (closed, furnished behind glass)
    for (const [u, v, f] of [[-4, 12, 'S'], [0, 16, 'W'], [10, 12, 'S']]) SOFA(u, v, y, 3.2, f, 0xe8e0d2);
    HP({ tex: 'wood', color: 0x9c7a58 }, [-7.85, 6.1, 15.85, 24.2], y + 0.01);
    SUBZ('펜트하우스 B', '33F', '복층 · 최상층 (비공개)', [-7.85, 6.1, 15.85, 24.2], ROOF); SUBZ('펜트하우스 홀', '33F', '전용 현관', [3, 24.2, 8.85, 39.5], ROOF);
  }

  // =====================================================================
  // B1–B4 — 주차장 · 마르퀴스 스파 & 피트니스 클럽
  // =====================================================================
  function basements() {
    // ---------- B1 parking ----------
    {
      const y = Y.B1, yc = NEXT.B1 - 0.3;
      BOH([21.4, 29.5, 25.4, 41.8], y, yc - y, 0x9a968e);
      BOH([-33.1, -60.4, -10, -46], y, yc - y, 0x9a968e); SG(['방재실 · 전기실'], { u: -21, v: -45.9, y: y + 2.6, w: 2.6, h: 0.4, f: 'S', bg: '#333', fg: '#fff' });
      WL(4.6, 21, 4.6, 42, y, yc, { mat: GL, thick: 0.05, openings: [{ at: 11, w: 2, y0: y, y1: y + 2.4 }] });
      WL(4.6, 21, 8.85, 21, y, yc, { mat: GL, thick: 0.05 }); WL(4.6, 42, 15.85, 42, y, yc, { mat: GL, thick: 0.05 });
      SG(['JW 메리어트 호텔 엘리베이터', '로비 8F · 객실 · 마르퀴스 B2–B4'], { u: 4.5, v: 32, y: y + 2.9, w: 3.4, h: 0.7, f: 'W', bg: '#2b241d', fg: '#efe2c4' });
      for (let u = -29.4; u <= 30; u += 8.4) for (let v = -54.6; v <= 56; v += 8.4) {
        if (inR(u, v, [-33.1, -60.4, -10, -46], 0.6) || inR(u, v, [4, 20, 16.5, 43], 0.6) || inR(u, v, [21, 29, 26, 42.5], 0.6)) continue;
        B({ u, v, y, w: 0.8, d: 0.8, h: yc - y, mat: 0xcfcac2, skip: ['top', 'bottom'] }); B({ u, v, y, w: 0.84, d: 0.84, h: 1.0, mat: 0xe0b03a, solid: false, skip: ['top', 'bottom'] });
      }
      // two aisles along v with stalls both sides
      for (const [uA, dir] of [[-19, 1], [21.5, 1]]) {
        HP({ tex: 'asphalt', color: 0x6a6a6a }, [uA - 3, -58, uA + 3, 58], y + 0.01);
        for (let v = -57; v <= 57; v += 2.5) for (const side of [-1, 1]) {
          const uc = uA + side * 5.5;
          if (inR(uc, v, [-33.1, -60.4, -10, -46], 1) || inR(uc, v, [4, 20, 16.5, 43], 1.5) || inR(uc, v, [20, 28, 27, 43], 1)) continue;
          const p = [P(uc - 2.5, v - 0.06), P(uc + 2.5, v - 0.06), P(uc + 2.5, v + 0.06), P(uc - 2.5, v + 0.06)];
          K.quad(0xf2f2f2, p.map(q => [q[0], y + 0.02, q[1]]), [0, 1, 0]);
          if (rnd() < 0.6 && v < 56) { const [x, z] = P(uc, v + 1.25); K.vehicle({ x, y, z, rotY: side > 0 ? FACE.E : FACE.W, kind: rnd() < 0.15 ? 'van' : 'car' }); }
        }
        for (let v = -50; v <= 50; v += 20) FT('→', { u: uA, v, y: y + 0.03, w: 2, h: 2, r: Math.PI / 2, fg: '#f2f2f2' });
      }
      HP({ tex: 'asphalt', color: 0x6a6a6a }, [-16, -3, 18.5, 3], y + 0.01);
      SG(['P  B1 호텔 주차장'], { u: 0, v: 2.9, y: y + 3.6, w: 4, h: 0.6, f: 'S', bg: '#1d4f9a', fg: '#ffffff', twoSided: true });
      SG(['출구 →'], { u: 21.5, v: 57, y: y + 3.6, w: 2.4, h: 0.5, f: 'N', bg: '#1d7a3a', fg: '#ffffff' });
      LIGHTS([-33, -60.4, 33, 60.4], yc, 5.6, 0.25, 0xf2f6ff);
      MAN(2, 30, y, {}); MAN(-19, 10, y, {}); MAN(21, -20, y, {});
      SUBZ('주차 구역 A', 'B1', '서측 통로 · 셀프 주차', [-27, -46, -11, 58]); SUBZ('주차 구역 B', 'B1', '동측 통로 · 발렛', [13.5, -58, 30, 58]); SUBZ('방재실 · 전기실', 'B1', '직원 전용', [-33.1, -60.4, -10, -46]); SUBZ('엘리베이터 홀', 'B1', '로비 8F · 객실 · 마르퀴스 B2–B4', [4.6, 21, 15.85, 42]);
      SUBZ('호텔 주차장', 'B1', '발렛 · 셀프 주차', [-33, -60.4, 33, 60.4]);
    }
    // ---------- B2 Marquis reception / spa / lockers / spa restaurant ----------
    {
      const y = Y.B2, yc = NEXT.B2 - 0.3;
      BOH([-33.1, -60.4, 33.1, -6], y, yc - y);
      // locker rooms (west block): 남성 v 14–37, 여성 v 37–60.4
      WL(-6, 14, -6, 60.4, y, yc, { mat: 0xe6dccb, thick: 0.2, openings: [{ at: 3.5, w: 1.8, y0: y, y1: y + 2.5 }, { at: 26, w: 1.8, y0: y, y1: y + 2.5 }] });
      WL(-33.1, 14, -6, 14, y, yc, { mat: 0xe6dccb, thick: 0.2 }); WL(-33.1, 37, -6, 37, y, yc, { mat: 0xe6dccb, thick: 0.2 });
      for (const [v0, v1, name, rows, vanV, col] of [[14, 37, '남성 라커', [18.8, 23.3, 27.8], 36.4, 0x5a4636], [37, 60.4, '여성 라커', [42, 46.5, 51], 59.8, 0x8a6e55]]) {
        HP({ tex: 'wood', color: 0xb8946a }, [-33, v0, -6, v1], y + 0.01);
        for (const v of rows) {
          B({ u: -19.5, v, y, w: 17, d: 1.2, h: 2.1, mat: col, top: 0xe8e0d0 });
          for (let u = -27.6; u < -11; u += 0.6) for (const s of [-1, 1]) { B({ u, v: v + s * 0.61, y: y + 0.1, w: 0.02, d: 0.02, h: 1.9, mat: 0x2b241d, solid: false }); B({ u: u + 0.25, v: v + s * 0.61, y: y + 1.1, w: 0.06, d: 0.02, h: 0.06, mat: 0xc9a85c, solid: false }); }
          B({ u: -19.5, v: v + 2.25, y, w: 14, d: 0.4, h: 0.45, mat: 0xc8a477 });
        }
        B({ u: -20, v: vanV, y, w: 16, d: 0.6, h: 0.8, mat: 0xf2ede4, top: 0x2b241d });
        B({ u: -20, v: vanV + (vanV > 50 ? 0.28 : 0.28), y: y + 1.05, w: 15.6, d: 0.04, h: 1.2, mat: { tex: 'glass', color: 0xe8f2f8 }, solid: false });
        for (let u = -27; u <= -13; u += 2.3) { B({ u, v: vanV - 0.8, y, w: 0.45, d: 0.45, h: 0.55, mat: 0x6b4a32, solid: false }); B({ u, v: vanV + 0.1, y: y + 0.8, w: 0.18, d: 0.12, h: 0.22, mat: 0x1a1a1a, solid: false }); }
        WL(-29, v0, -29, v1, y, yc, { mat: { tex: 'tile', color: 0xdfe8ec }, thick: 0.15, openings: [{ at: (v1 - v0) * 0.3, w: 1.4, y0: y, y1: y + 2.3 }, { at: (v1 - v0) * 0.7, w: 1.4, y0: y, y1: y + 2.3 }] });
        SG(['샤워실'], { u: -28.9, v: v0 + (v1 - v0) * 0.3, y: y + 2.6, w: 1.4, h: 0.32, f: 'E', bg: '#2b241d', fg: '#efe2c4' }); SG(['건식 사우나'], { u: -28.9, v: v0 + (v1 - v0) * 0.7, y: y + 2.6, w: 1.6, h: 0.32, f: 'E', bg: '#2b241d', fg: '#efe2c4' });
        HP({ tex: 'tile', color: 0xdfe8ec }, [-33, v0, -29, v1], y + 0.012);
        for (let v = v0 + 1.5; v < v0 + (v1 - v0) * 0.5; v += 1.6) { B({ u: -32.9, v, y: y + 1.9, w: 0.2, d: 0.2, h: 0.1, mat: 0xc0c0c0, solid: false }); WL(-33.1, v + 0.8, -31.5, v + 0.8, y, y + 2.1, { mat: { tex: 'glass', color: 0xdff0f6 }, thick: 0.03, solid: false }); }
        B({ u: -31, v: v0 + (v1 - v0) * 0.78, y, w: 3.6, d: 3.0, h: 0.45, mat: { tex: 'wood', color: 0xb8865a } }); B({ u: -32.6, v: v0 + (v1 - v0) * 0.78, y: y + 0.45, w: 0.8, d: 3.0, h: 0.45, mat: { tex: 'wood', color: 0xb8865a } });
        LIGHTS([-29, v0, -6, v1], yc, 3.6, 0.8, 0xfff0d6); LIGHTS([-33, v0, -29, v1], yc, 3, 0.5, 0xffe2b8);
        CROWD([-27, v0 + 2, -9, v1 - 2], y, 5, v0 * 7);
        SUBZ(name, 'B2', '사물함 · 파우더룸 · 샤워 · 건식 사우나', [-33.1, v0, -6, v1]);
      }
      HP({ tex: 'marble', color: 0xe9e0d0 }, [-6, 14, 17, 60.4], y + 0.01, true, [[8.8, 24.2, 15.9, 39.5]]);
      B({ u: -3.2, v: 28, y, w: 0.9, d: 7, h: 1.08, mat: 0x2b241d, top: 0xefe7da }); MAN(-4.3, 26.5, y, { shirt: 0x111111, rotY: FACE.E }); MAN(-4.3, 29.5, y, { shirt: 0x111111, rotY: FACE.E });
      B({ u: -5.9, v: 28, y, w: 0.15, d: 12, h: yc - y, mat: WALNUT, solid: false, skip: ['top', 'bottom'] });
      SG(['MARQUIS'], { u: -5.75, v: 28, y: y + 3.2, w: 6, h: 0.9, f: 'E', bg: '#6b4a32', fg: '#d8b878' });
      SG(['마르퀴스 스파 & 피트니스 클럽'], { u: -5.75, v: 28, y: y + 2.3, w: 5.4, h: 0.5, f: 'E', bg: '#6b4a32', fg: '#efe2c4' });
      for (const [v, n] of [[17.5, '남성 라커 · 사우나'], [40, '여성 라커 · 사우나']]) SG([n], { u: -5.85, v, y: y + 2.8, w: 2.8, h: 0.38, f: 'E', bg: '#2b241d', fg: '#efe2c4' });
      SG(['수영장 B3 · 피트니스 B4 →', '엘리베이터 · 계단 이용'], { u: 8.7, v: 20.5, y: y + 2.5, w: 3.0, h: 0.6, f: 'W', bg: '#2b241d', fg: '#efe2c4' });
      SUBZ('마르퀴스 리셉션', 'B2', '회원 · 투숙객 체크인', [-6, 14, 8.8, 44]);
      // spa corridor + treatment rooms (9 + couples)
      const rooms = []; for (let i = 0; i < 10; i++) rooms.push([-30 + i * 6, -24 + i * 6, i < 9 ? `트리트먼트 ${i + 1}` : '커플 스위트']);
      ROOMROW('v', 8, rooms, y, yc - y, 'S', { dw: 1.2, lw: 1.8, mat: 0xe6dccb });
      PARTS('u', 0, rooms.slice(1).map(r => r[0]), -6, 8, y, yc - y, 0xe6dccb);
      WL(-33.1, 8, -30, 8, y, yc, { mat: 0xe6dccb }); WL(30, 8, 33.1, 8, y, yc, { mat: 0xe6dccb });
      WL(-30, -6, -30, 8, y, yc, { mat: 0xe6dccb }); WL(30, -6, 30, 8, y, yc, { mat: 0xe6dccb });
      const MBED = (u, v) => { B({ u, v, y, w: 0.8, d: 2.0, h: 0.7, mat: 0x5a4636, skip: ['bottom'] }); B({ u, v, y: y + 0.7, w: 0.82, d: 2.0, h: 0.06, mat: 0xf8f6f2, solid: false }); B({ u, v: v - 0.75, y: y + 0.76, w: 0.6, d: 0.3, h: 0.1, mat: 0xe8dcc4, solid: false }); B({ u, v: v + 0.4, y: y + 0.76, w: 0.82, d: 0.6, h: 0.05, mat: 0xb89a74, solid: false }); };
      rooms.forEach(([a, b], i) => {
        const c = (a + b) / 2, couple = i === 9;
        HP({ tex: 'wood', color: 0x9a7452 }, [a, 0, b, 8], y + 0.01); HP({ tex: 'tile', color: 0xd8d0c4 }, [a, -6, b, 0], y + 0.012);
        WL(a, 0, b, 0, y, yc, { mat: 0xe6dccb, thick: 0.12, openings: [{ at: 4.6, w: 0.9, y0: y, y1: y + 2.2 }] });
        if (couple) { MBED(c - 1.2, 3.6); MBED(c + 1.2, 3.6); B({ u: c - 1.2, v: -3, y, w: 1.8, d: 2.6, h: 0.6, mat: 0xf8f8f6, top: 0xcfe4ec }); }
        else { MBED(c, 3.6); B({ u: a + 0.9, v: -3.4, y, w: 1.4, d: 1.4, h: 0.04, mat: 0xc8c0b4, solid: false }); WL(a + 0.1, -2.6, a + 1.7, -2.6, y, y + 2.1, { mat: { tex: 'glass', color: 0xdff0f6 }, thick: 0.02, solid: false }); }
        B({ u: b - 0.55, v: 3.6, y, w: 0.5, d: 0.8, h: 0.85, mat: 0x6b4a32, solid: false }); for (let k = 0; k < 3; k++) CY(b - 0.55, 3.3 + k * 0.3, y + 0.85, 0.11, 0.1, 0xfbfaf6, { seg: 8, solid: false });
        B({ u: a + 0.35, v: 6.8, y, w: 0.6, d: 1.6, h: 0.85, mat: 0x6b4a32, top: 0xefe9de }); CY(a + 0.35, 6.8, y + 0.85, 0.18, 0.1, 0xffffff, { seg: 8, solid: false });
        CY(c + 1.4, 6.6, y, 0.22, 0.45, 0x3a2c20, { seg: 8, solid: false }); PLANT(a + 0.6, 1.0, y, 0.7);
        B({ u: (a + a + 4.0) / 2, v: 0.1, y, w: 3.8, d: 0.06, h: 3.0, mat: { tex: 'wood', color: 0x8a6446 }, solid: false });
        B({ u: c, v: 0.15, y: y + 1.2, w: 1.4, d: 0.04, h: 0.9, mat: [0x8aa0b0, 0xb89a74, 0x9fb08a][i % 3], solid: false });
        for (const du of [-1.6, 1.6]) B({ u: c + du, v: 0.2, y: y + 1.7, w: 0.22, d: 0.08, h: 0.4, mat: { tex: 'emit', color: 0xffcf90 }, solid: false });
        for (let k = 0; k < 3; k++) CY(b - 0.5, 1.2 + k * 0.25, y, 0.06, 0.12, { tex: 'emit', color: 0xffc070 }, { seg: 6, solid: false });
        K.quad({ tex: 'emit', color: 0xffd8a8 }, [P(c - 0.8, 2.6), P(c + 0.8, 2.6), P(c + 0.8, 4.6), P(c - 0.8, 4.6)].map(q => [q[0], yc - 0.02, q[1]]), [0, -1, 0]);
        SUBZ(couple ? '커플 스위트' : `트리트먼트 ${i + 1}`, 'B2', couple ? '마르퀴스 스파 · 2인 트리트먼트 · 욕조' : '마르퀴스 스파 · 트리트먼트룸 · 샤워', [a, -6, b, 8]);
        if (i % 3 === 1) MAN(c + 0.8, 4.6, y, { shirt: 0xf2ede4, rotY: FACE.W });
      });
      SUBZ('스파 복도', 'B2', '트리트먼트룸 1–9 · 커플 스위트', [-33, 8, 33, 14]);
      HP({ tex: 'darkstone', color: 0x6d6258 }, [-33, 8, 33, 14], y + 0.012);
      SUBZ('마르퀴스 스파', 'B2', '트리트먼트룸 9 · 커플 스위트', [-30, -6, 30, 8]);
      // spa restaurant
      FRONT('u', 17, 14, 58, y, yc, 'W', '스파 레스토랑', { sub: '마르퀴스 · 한식', door: 22, dw: 2.4, signAt: 30, fascia: 0x2b241d, fg: '#efe2c4' });
      WL(17, 58, 33.1, 58, y, yc, { mat: WARM }); WL(17, 14, 33.1, 14, y, yc, { mat: WARM });
      HP({ tex: 'wood', color: 0xb8946a }, [17, 14, 33, 58], y + 0.01);
      for (let u = 20.5; u <= 30; u += 3.2) for (let v = 17; v <= 55; v += 3.8) TABLE(u, v, y, { square: true, r: 0.45, chairs: 4, rot: Math.PI / 4, chair: 0x8a6e55 });
      CROWD([19, 16, 31, 56], y, 10, 1201);
      SUBZ('마르퀴스 스파 레스토랑', 'B2', '한식 · 건강식', [17, 14, 33, 58]);
      for (const [u, v, f] of [[0, 50, 'S'], [4, 55, 'W'], [-4, 55, 'E'], [12, 18, 'S']]) SOFA(u, v, y, 2.4, f, 0xf0e8dc);
      LIGHTS([-6, 14, 17, 60.4], yc, 4.2, 0.8, 0xfff0d6, (u, v) => inR(u, v, [8.8, 24.2, 15.9, 39.5], 0.6));
      LIGHTS([-33, 8, 33, 14], yc, 3.5, 0.5, 0xffe2b8);
      CROWD([-4, 15, 8, 58], y, 8, 1202);
    }
    // ---------- B3 pool ----------
    {
      const y = Y.B3, yc = NEXT.B3 - 0.3;
      BOH([-33.1, -8, 4.9, 60.4], y, yc - y, 0xdde6ea); BOH([9.2, -8, 33.1, 24.0], y, yc - y, 0xdde6ea); BOH([4.9, 39.6, 33.1, 60.4], y, yc - y); BOH([15.95, 24.0, 33.1, 39.6], y, yc - y);
      BOH([18, -60.4, 33.1, -40], y, yc - y, 0xd8cfc0);
      HP({ tex: 'tile', color: 0xdfe8ec }, [-33, -60.4, 33, -8], y + 0.01, true, [POOL, KIDS, SCUBA]);
      const basin = (r, fy, entry) => {
        const [u0, v0, u1, v1] = r;
        SLAB(r, fy, { mat: { tex: 'tile', color: 0x5fa8cc }, under: false, edge: false });
        const op = entry ? [{ at: entry - u0, w: 1.4, y0: fy, y1: y }] : [];
        WL(u0, v0, u1, v0, fy, y, { mat: { tex: 'tile', color: 0x7fbcd8 }, thick: 0.2 });
        WL(u0, v1, u1, v1, fy, y, { mat: { tex: 'tile', color: 0x7fbcd8 }, thick: 0.2, openings: op });
        WL(u0, v0, u0, v1, fy, y, { mat: { tex: 'tile', color: 0x7fbcd8 }, thick: 0.2 }); WL(u1, v0, u1, v1, fy, y, { mat: { tex: 'tile', color: 0x7fbcd8 }, thick: 0.2 });
        HP('water', r, y - 0.14);
      };
      basin(POOL, y - 1.6, -14.2); STR(-14.2, -28, -14.2, -25.1, y - 1.6, y, 1.2, { rails: false });
      for (let i = 0; i < 6; i++) { const uc = POOL[0] + 1.25 + i * 2.5; K.quad(0x1d3a5a, [P(uc - 0.12, -49), P(uc + 0.12, -49), P(uc + 0.12, -26), P(uc - 0.12, -26)].map(q => [q[0], y - 1.58, q[1]]), [0, 1, 0]); }
      for (let i = 1; i < 6; i++) B({ u: POOL[0] + i * 2.5, v: -37.5, y: y - 0.2, w: 0.08, d: 24.6, h: 0.08, mat: i & 1 ? 0xd23a3a : 0x2a5ad2, solid: false });
      for (let i = 0; i < 6; i++) { FT(String(i + 1), { u: POOL[0] + 1.25 + i * 2.5, v: -51, y: y + 0.03, w: 0.8, h: 0.8, fg: '#1d3a5a' }); B({ u: POOL[0] + 1.25 + i * 2.5, v: -50.6, y, w: 0.7, d: 0.7, h: 0.45, mat: 0xf2f2f2 }); }
      basin(KIDS, y - 0.45); basin(SCUBA, y - 3.5, -7.3); STR(-7.3, -24, -7.3, -20.1, y - 3.5, y, 1.2, { rails: false });
      SG(['키즈풀'], { u: -4, v: -50.3, y: y + 2.4, w: 1.8, h: 0.4, f: 'S', bg: '#1d3a5a', fg: '#fff' });
      SG(['스쿠버 다이빙 풀'], { u: -4, v: -19.8, y: y + 2.4, w: 2.6, h: 0.4, f: 'S', bg: '#1d3a5a', fg: '#fff' });
      // jacuzzi
      for (const [du, dv, w, d] of [[0, -2.6, 5.2, 0.4], [0, 2.6, 5.2, 0.4], [-2.6, 0, 0.4, 5.2], [2.6, 0, 0.4, 5.2]]) B({ u: -4 + du, v: -35 + dv, y, w, d, h: 0.5, mat: { tex: 'tile', color: 0x9fcfe0 } });
      HP('water', [-6.4, -37.4, -1.6, -32.6], y + 0.42); SG(['자쿠지'], { u: -4, v: -32.2, y: y + 2.2, w: 1.6, h: 0.36, f: 'S', bg: '#1d3a5a', fg: '#fff' });
      for (let v = -48; v <= -27; v += 3.5) { B({ u: -31, v, y, w: 0.8, d: 2.0, h: 0.35, mat: 0xf2f2ee, solid: false }); B({ u: -31, v: v - 0.8, y: y + 0.35, w: 0.8, d: 0.5, h: 0.4, mat: 0xf2f2ee, solid: false }); }
      for (let u = 4; u <= 14; u += 3.3) B({ u, v: -12, y, w: 0.8, d: 2.0, h: 0.35, mat: 0xf2f2ee, solid: false });
      for (const [v, n] of [[-57, '건식 사우나'], [-51, '습식 사우나'], [-45, '냉탕 · 온탕']]) { DOORP(17.97, v, y, 'W', 1.0, 0x9a7452); SG([n], { u: 17.9, v, y: y + 2.5, w: 1.8, h: 0.36, f: 'W', bg: '#2b241d', fg: '#efe2c4' }); }
      SG(['MARQUIS POOL'], { u: -20.5, v: -60.2, y: y + 3.2, w: 6, h: 0.8, f: 'S', bg: '#d9d4cb', fg: '#1d3a5a', sub: '마르퀴스 수영장 · 25m 6레인' });
      for (let u = -30; u <= 30; u += 10) for (const v of [-56, -42, -28, -14]) if (!inR(u, v, POOL, 0.8) && !inR(u, v, KIDS, 0.8) && !inR(u, v, SCUBA, 0.8) && !inR(u, v, [18, -60.4, 33.1, -40], 0.6) && !inR(u, v, [-6.6, -37.6, -1.4, -32.4], 0.5)) CY(u, v, y, 0.45, yc - y, 0xeef2f4, { seg: 12 });
      LIGHTS([-33, -60.4, 33, -8], yc, 4, 1.2, 0xeaf6ff, (u, v) => inR(u, v, [18, -60.4, 33.1, -40]));
      HP({ tex: 'tile', color: 0xdfe8ec }, [4.9, -8, 9.2, 39.5], y + 0.01);
      LIGHTS([4.9, -8, 9.2, 39.5], yc, 3.5, 0.6);
      SG(['수영장 ↑'], { u: 7.05, v: 22, y: y + 2.8, w: 1.8, h: 0.4, f: 'S', bg: '#1d3a5a', fg: '#fff' });
      CROWD([-32, -58, -29, -26], y, 4, 1301); CROWD([-12, -48, 16, -10], y, 6, 1302);
      for (let i = 0; i < 5; i++) { const [x, z] = P(POOL[0] + 1.25 + (i % 6) * 2.5, -45 + i * 4); K.person(x, y - 1.25, z, { shirt: 0x2a5ad2 }); }
      SUBZ('25m 6레인 수영장', 'B3', '마르퀴스', POOL); SUBZ('키즈풀', 'B3', '마르퀴스', KIDS); SUBZ('스쿠버 다이빙 풀', 'B3', '수심 3.5m', SCUBA); SUBZ('자쿠지', 'B3', '마르퀴스', [-6.6, -37.6, -1.4, -32.4]); SUBZ('사우나', 'B3', '건식 · 습식 · 냉탕 · 온탕', [18, -60.4, 33.1, -40]); SUBZ('수영장 통로', 'B3', '엘리베이터 ↔ 수영장', [4.9, -8, 9.2, 39.5]);
      SUBZ('마르퀴스 수영장', 'B3', '25m 6레인 · 키즈풀 · 자쿠지 · 스쿠버 다이빙 풀 · 사우나', [-33, -60.4, 33, -8]);
    }
    // ---------- B4 fitness ----------
    {
      const y = Y.B4, yc = NEXT.B4 - 0.3;
      BOH([-33.1, -60.4, 1, -20], y, yc - y, 0x9a968e); SG(['수영장 기계실'], { u: -16, v: -19.9, y: y + 2.6, w: 2.4, h: 0.38, f: 'S', bg: '#333', fg: '#fff' });
      BOH([-33.1, 22, 4.9, 60.4], y, yc - y); BOH([9.2, 39.6, 33.1, 60.4], y, yc - y); BOH([15.95, 24, 33.1, 39.6], y, yc - y); BOH([4.9, 39.6, 9.2, 60.4], y, yc - y);
      // basketball court
      const CT = [2, -58, 32, -43];
      HP({ tex: 'wood', color: 0xd2a26a }, CT, y + 0.012);
      const line = (u0, v0, u1, v1) => K.quad(0xffffff, [P(u0, v0), P(u1, v0), P(u1, v1), P(u0, v1)].map(q => [q[0], y + 0.02, q[1]]), [0, 1, 0]);
      line(2, -58, 32, -57.9); line(2, -43.1, 32, -43); line(2, -58, 2.1, -43); line(31.9, -58, 32, -43); line(16.95, -58, 17.05, -43);
      for (const [u, s] of [[2.6, 1], [31.4, -1]]) { B({ u, v: -50.5, y: y + 2.9, w: 0.08, d: 1.8, h: 1.05, mat: 0xf6f6f6, solid: false }); CY(u + s * 0.45, -50.5, y + 3.05, 0.23, 0.04, 0xe06020, { seg: 10, solid: false, caps: false }); B({ u: u - s * 0.3, v: -50.5, y, w: 0.15, d: 0.15, h: 3.4, mat: 0x333333 }); }
      WL(2, -43, 13, -43, y, y + 3.5, { mat: 0x2b2b2b, thick: 0.05, solid: true }); WL(21, -43, 32, -43, y, y + 3.5, { mat: 0x2b2b2b, thick: 0.05 });
      SG(['농구 코트'], { u: 17, v: -42.9, y: y + 3.9, w: 2.6, h: 0.42, f: 'S', bg: '#2b241d', fg: '#efe2c4' });
      SUBZ('농구 코트', 'B4', '마르퀴스 피트니스', CT);
      // squash + screen golf + GX studio
      for (const u0 of [2, 9]) { WL(u0, -40, u0, -30, y, yc, { mat: 0xf2f2f2, thick: 0.15 }); WL(u0, -40, u0 + 6.4, -40, y, yc, { mat: 0xf2f2f2, thick: 0.15 }); WL(u0 + 6.4, -40, u0 + 6.4, -30, y, yc, { mat: 0xf2f2f2, thick: 0.15 }); WL(u0, -30, u0 + 6.4, -30, y, y + 3, { mat: GL, thick: 0.05, openings: [{ at: 5.4, w: 0.9, y0: y, y1: y + 2.2 }] }); HP({ tex: 'wood', color: 0xe0b888 }, [u0, -40, u0 + 6.4, -30], y + 0.012); line(u0 + 0.1, -39.2, u0 + 6.3, -39.1); }
      SG(['스쿼시'], { u: 8.7, v: -29.9, y: y + 3.4, w: 1.8, h: 0.38, f: 'S', bg: '#2b241d', fg: '#efe2c4' });
      for (let i = 0; i < 3; i++) { const u0 = 17 + i * 5; WL(u0, -40, u0, -30, y, yc, { mat: 0x3a3a3a, thick: 0.15 }); B({ u: u0 + 2.5, v: -39.7, y: y + 0.5, w: 4.2, d: 0.08, h: 2.6, mat: { tex: 'emit', color: 0x6abf5a }, solid: false }); HP({ tex: 'grass', color: 0x4f9a48 }, [u0, -40, u0 + 5, -30], y + 0.012); MAN(u0 + 2.5, -34, y, { rotY: FACE.N }); }
      WL(32, -40, 32, -30, y, yc, { mat: 0x3a3a3a, thick: 0.15 }); WL(17, -40, 32, -40, y, yc, { mat: 0x3a3a3a, thick: 0.15 });
      SG(['스크린 골프'], { u: 24.5, v: -29.9, y: y + 3.4, w: 2.6, h: 0.38, f: 'S', bg: '#2b241d', fg: '#efe2c4' });
      FRONT('v', -4, 17, 33.1, y, yc, 'S', 'GX STUDIO', { sub: '필라테스 · 요가', door: 19, dw: 1.6, fascia: 0x2b2b2b, gh: 3.0 });
      WL(17, -26, 33.1, -26, y, yc, { mat: 0xdfe8ec }); WL(17, -26, 17, -4, y, yc, { mat: 0xdfe8ec });
      HP({ tex: 'wood', color: 0xd6b88c }, [17, -26, 33, -4], y + 0.012);
      for (let u = 19; u <= 31; u += 2.4) for (let v = -24; v <= -8; v += 3.2) B({ u, v, y, w: 0.65, d: 1.8, h: 0.03, mat: 0x6a5aa0, solid: false });
      B({ u: 32.8, v: -15, y: y + 0.3, w: 0.06, d: 20, h: 3.5, mat: 0xcfe0ea, solid: false });
      // 85 m jogging track + gym floor
      const TR = [-31, -17, -5, -0.5];
      HP({ tex: 'concrete', color: 0xb8433a }, TR, y + 0.014, true, [[-29.4, -15.4, -6.6, -2.1]]);
      FT('조깅 트랙 85m', { u: -18, v: -16.2, y: y + 0.03, w: 4, h: 1, fg: '#ffffff' });
      for (let i = 0; i < 6; i++) B({ u: -26 + i * 3.6, v: -9, y, w: 1.0, d: 2.0, h: 0.03, mat: 0x2b5a8a, solid: false });
      HP({ tex: 'tile', color: 0x6a6a6a }, [-32, 0, 4.9, 22], y + 0.012);
      for (let i = 0; i < 8; i++) { const u = -30 + i * 3.4; B({ u, v: 2.4, y, w: 0.9, d: 2.0, h: 0.3, mat: 0x2b2b2b }); B({ u, v: 1.6, y: y + 0.3, w: 0.8, d: 0.12, h: 1.2, mat: 0x3a3a3a, solid: false }); B({ u, v: 1.6, y: y + 1.5, w: 0.6, d: 0.3, h: 0.35, mat: { tex: 'emit', color: 0x5aa0e0 }, solid: false }); }
      for (let i = 0; i < 6; i++) { const u = -29 + i * 4.5; B({ u, v: 7.5, y, w: 0.6, d: 1.4, h: 1.1, mat: 0x3a3a3a }); CY(u, 7.0, y + 0.4, 0.3, 0.06, 0x111111, { seg: 10, solid: false }); }
      for (let i = 0; i < 10; i++) { const u = -30 + (i % 5) * 6, v = 12 + Math.floor(i / 5) * 5.5; B({ u, v, y, w: 1.4, d: 2.0, h: 2.1, mat: [0x2b2b2b, 0x4a4a4a][i & 1] }); B({ u: u + 0.9, v, y: y + 0.4, w: 0.2, d: 1.2, h: 1.2, mat: 0xb8b8b8, solid: false }); }
      for (const v of [10, 16]) B({ u: 2.5, v, y, w: 0.6, d: 3.6, h: 1.6, mat: 0x3a3a3a });
      B({ u: -32.9, v: 11, y: y + 0.3, w: 0.06, d: 21, h: 3.2, mat: 0xcfe0ea, solid: false });
      SG(['MARQUIS FITNESS'], { u: -32.8, v: 11, y: y + 4.1, w: 6, h: 0.6, f: 'E', bg: '#2b241d', fg: '#d8b878', sub: '마르퀴스 피트니스 · 장비 350여 대' });
      CROWD([-31, 1, 3, 21], y, 14, 1401); CROWD([-30, -16.5, -6, -1], y, 5, 1402); CROWD([4, -56, 30, -45], y, 6, 1403);
      LIGHTS([-33, -20, 33, 22], yc, 4, 1.2, 0xf2f6ff, (u, v) => inR(u, v, [17, -40, 32, -30]));
      LIGHTS(CT, yc, 5, 1.6, 0xf8faff);
      // ---- free weights (SE): rubber floor, power racks, benches, dumbbell racks, mirror wall ----
      HP({ tex: 'concrete', color: 0x3a3c40 }, [16.2, -3.6, 33, 22], y + 0.013);
      B({ u: 32.9, v: 9, y: y + 0.2, w: 0.06, d: 22, h: 2.6, mat: { tex: 'glass', color: 0xe8f2f8 }, solid: false });
      for (let i = 0; i < 4; i++) {
        const v = -1 + i * 4.2, u = 19.5;
        for (const [du, dv] of [[-0.6, -0.6], [0.6, -0.6], [-0.6, 0.6], [0.6, 0.6]]) B({ u: u + du, v: v + dv, y, w: 0.1, d: 0.1, h: 2.3, mat: 0x1a1a1a });
        for (const dv of [-0.6, 0.6]) B({ u, v: v + dv, y: y + 2.25, w: 1.3, d: 0.1, h: 0.08, mat: 0x1a1a1a, solid: false });
        B({ u, v, y: y + 1.35, w: 2.2, d: 0.05, h: 0.05, mat: 0xb8b8b8, solid: false }); for (const du of [-0.95, 0.95]) CY(u + du, v, y + 1.12, 0.23, 0.05, 0x111111, { seg: 12, solid: false });
        B({ u, v, y, w: 1.6, d: 1.6, h: 0.04, mat: 0x6a4a2a, solid: false });
      }
      for (let i = 0; i < 4; i++) { const v = 0 + i * 4.2, u = 24.5; B({ u, v, y, w: 0.4, d: 1.3, h: 0.45, mat: 0x1a1a1a }); B({ u, v: v - 0.45, y: y + 0.45, w: 0.4, d: 0.5, h: 0.5, mat: 0x1a1a1a, solid: false, r: 0.5 }); }
      for (const v of [2, 12]) { B({ u: 31.8, v, y, w: 0.9, d: 7, h: 0.75, mat: 0x2b2b2b }); for (let k = 0; k < 12; k++) for (const dy of [0.75, 0.42]) B({ u: 31.8, v: v - 3.2 + k * 0.58, y: y + dy, w: 0.5, d: 0.16, h: 0.16, mat: 0x555555, solid: false }); }
      for (let i = 0; i < 6; i++) CY(28 + (i % 3) * 0.9, 19.5 + Math.floor(i / 3) * 0.9, y, 0.32, 0.12 + (i % 2) * 0.06, 0x202020, { seg: 10 });
      MAN(20.3, 3.2, y, { shirt: 0x2b2b2b }); MAN(24.5, 4.3, y, { shirt: 0x8a1c2a }); MAN(30.6, 12, y, { shirt: 0x2a5ad2, rotY: FACE.E });
      SG(['FREE WEIGHTS'], { u: 32.8, v: 9, y: y + 3.4, w: 4, h: 0.5, f: 'W', bg: '#2b241d', fg: '#d8b878', sub: '프리웨이트 존' });
      SUBZ('프리웨이트 존', 'B4', '파워랙 · 벤치 · 덤벨', [16.2, -3.6, 33, 22]);
      // ---- cardio (centre): treadmills + bikes facing the screens ----
      for (let r = 0; r < 3; r++) for (let i = 0; i < 4; i++) {
        const u = 6.5 + i * 2.2, v = -1.5 + r * 5.4;
        B({ u, v, y, w: 0.8, d: 1.9, h: 0.22, mat: 0x2b2b2b }); B({ u, v: v - 0.75, y: y + 0.22, w: 0.75, d: 0.1, h: 1.1, mat: 0x3a3a3a, solid: false });
        B({ u, v: v - 0.82, y: y + 1.32, w: 0.55, d: 0.08, h: 0.32, mat: { tex: 'emit', color: 0x5aa0e0 }, solid: false });
        for (const du of [-0.34, 0.34]) B({ u: u + du, v: v - 0.4, y: y + 0.22, w: 0.05, d: 0.7, h: 0.9, mat: 0x4a4a4a, solid: false });
      }
      for (let i = 0; i < 4; i++) { const u = 6.5 + i * 2.2, v = 15.5; B({ u, v, y, w: 0.5, d: 1.2, h: 0.55, mat: 0x3a3a3a }); B({ u, v: v - 0.5, y: y + 0.55, w: 0.4, d: 0.2, h: 0.5, mat: 0x3a3a3a, solid: false }); B({ u, v: v + 0.3, y: y + 0.6, w: 0.3, d: 0.4, h: 0.08, mat: 0x111111, solid: false }); }
      for (let i = 0; i < 3; i++) { B({ u: 7.6 + i * 3.3, v: -4.4, y: y + 1.6, w: 1.6, d: 0.06, h: 0.95, mat: 0x0d1014, solid: false }); B({ u: 7.6 + i * 3.3, v: -4.36, y: y + 1.64, w: 1.5, d: 0.01, h: 0.87, mat: { tex: 'emit', color: 0x3a6a9a }, solid: false }); }
      for (const [u, v] of [[6.5, 0.4], [10.9, 5.8], [13.1, -1.5], [8.7, 11.2]]) MAN(u, v, y + 0.22, { shirt: [0x2a5ad2, 0xc84d5a, 0x2b2b2b, 0x6b8f4a][(u | 0) & 3] });
      SUBZ('카디오 존', 'B4', '러닝머신 · 실내 사이클', [4.9, -4, 15.9, 20]);
      // ---- stretching / functional (north-centre): turf lane, mats, plyo boxes, rig ----
      HP({ tex: 'grass', color: 0x4f8a48 }, [-4, -19, 16, -15.5], y + 0.013);
      for (let i = 0; i < 4; i++) B({ u: 2 + i * 3.5, v: -17.2, y, w: 0.9, d: 0.6, h: 0.45 + (i % 2) * 0.15, mat: 0x2b2b2b });
      for (let u = -3; u <= 15; u += 1.8) for (const v of [-12, -9]) B({ u, v, y, w: 0.65, d: 1.8, h: 0.03, mat: [0x6a5aa0, 0x2b5a8a, 0x9a4a5a][((u + 3) / 1.8 | 0) % 3], solid: false });
      for (const u of [-3.5, 1.5, 6.5, 11.5]) B({ u, v: -6, y, w: 0.1, d: 0.1, h: 2.6, mat: 0x1a1a1a }); B({ u: 4, v: -6, y: y + 2.55, w: 15.2, d: 0.12, h: 0.12, mat: 0x1a1a1a, solid: false });
      for (let i = 0; i < 8; i++) CY(-3 + i * 0.6, -14.2, y, 0.13, 0.28, 0x2b2b2b, { seg: 8 });
      MAN(4, -12, y, { shirt: 0x9a4a5a }); MAN(8, -17, y, { shirt: 0x2b2b2b });
      SUBZ('스트레칭 · 기능성 존', 'B4', '터프 레인 · 매트 · 플라이오 박스', [-4, -20, 16, -4.5]);
      // ---- fitness desk at the elevator hall + water station ----
      B({ u: 12.8, v: 21.1, y, w: 5, d: 0.9, h: 1.08, mat: 0x2b241d, top: 0xefe7da }); MAN(12.8, 21.9, y, { shirt: 0x111111, rotY: FACE.N });
      B({ u: 15.4, v: 23.0, y, w: 0.6, d: 1.8, h: 2.0, mat: WALNUT }); for (let k = 0; k < 4; k++) B({ u: 15.08, v: 23, y: y + 0.3 + k * 0.42, w: 0.04, d: 1.6, h: 0.22, mat: 0xfbfaf6, solid: false });
      SG(['MARQUIS FITNESS DESK'], { u: 12.8, v: 20.6, y: y + 2.7, w: 3.6, h: 0.42, f: 'N', bg: '#2b241d', fg: '#d8b878', sub: '마르퀴스 피트니스 데스크' });
      B({ u: 5.4, v: 12, y, w: 0.6, d: 0.6, h: 1.2, mat: 0xd8dcdf }); CY(5.4, 12, y + 1.2, 0.2, 0.45, { tex: 'glass', color: 0xbfe0f0 }, { seg: 10, solid: false });
      SUBZ('피트니스 데스크', 'B4', '수건 · 락커 키 · PT 예약', [9.5, 19.5, 16, 24]);
      SUBZ('GX 스튜디오', 'B4', '필라테스 · 요가 · 그룹 운동', [17, -26, 33, -4]);
      SUBZ('85m 조깅 트랙', 'B4', '마르퀴스 피트니스', [-31, -17, -5, -0.5]);
      SUBZ('마르퀴스 피트니스', 'B4', '장비 350여 대 · 85m 조깅트랙 · GX 스튜디오', [-33, -20, 33, 22]);
      SUBZ('스쿼시 · 스크린 골프', 'B4', '마르퀴스 피트니스', [2, -40, 32, -30]);
    }
  }

  // =====================================================================
  // EXTERIOR — porte-cochère (east), signage, flags, planters
  // =====================================================================
  function exterior() {
    // porte-cochère canopy over the drop-off on the 경부선 service-road side
    B({ u: 36.4, v: 48.5, y: 4.6, w: 6.2, d: 15.5, h: 0.7, mat: BRONZE, bottom: { tex: 'ceiling', color: 0xe8dcc8 }, solid: false });
    for (const v of [41.6, 55.4]) CY(38.9, v, 0, 0.32, 4.6, { tex: 'jwStone' }, { seg: 12 });
    for (let v = 42.5; v <= 54.5; v += 2) K.quad({ tex: 'emit', color: 0xffe8c0 }, [P(34.4, v - 0.3), P(38.4, v - 0.3), P(38.4, v + 0.3), P(34.4, v + 0.3)].map(q => [q[0], 4.58, q[1]]), [0, -1, 0]);
    SG(['JW MARRIOTT'], { u: 39.52, v: 48.5, y: 4.95, w: 7.5, h: 0.55, f: 'E', bg: '#7a5f40', fg: '#e8d29a' });
    SG(['JW MARRIOTT'], { u: 36.4, v: 40.73, y: 4.95, w: 4.6, h: 0.5, f: 'N', bg: '#7a5f40', fg: '#e8d29a' });
    HP({ tex: 'darkstone', color: 0x9c948a }, [33.3, 38, 40, 60], 0.015);
    { const [x, z] = P(36.6, 45.5); K.vehicle({ x, y: 0, z, rotY: FACE.N, kind: 'taxi' }); }
    { const [x, z] = P(36.6, 52.5); K.vehicle({ x, y: 0, z, rotY: FACE.N, kind: 'car', color: 0x16181c }); }
    MAN(34.2, 46.5, 0, { shirt: 0x1d2433, rotY: FACE.E }); MAN(34.2, 50.8, 0, { shirt: 0x1d2433, rotY: FACE.E }); MAN(35.2, 53.6, 0, { rotY: FACE.W });
    // flags
    for (let i = 0; i < 3; i++) { const v = 36.2 + i * 1.6; CY(34.6, v, 0, 0.06, 9, 0xe8e8e8, { seg: 6 }); B({ u: 34.6, v: v + 0.75, y: 7.6, w: 0.03, d: 1.4, h: 0.9, mat: [0xf2f2f2, 0x1d2433, 0x8a1c2a][i], solid: false }); }
    // big podium letters (east + south)
    SG(['JW MARRIOTT'], { u: UE + 0.22, v: 48.5, y: 8.6, w: 15, h: 2.1, f: 'E', bg: '#d3c4aa', fg: '#4a3a28' });
    SG(['JW 메리어트 호텔 서울'], { u: UE + 0.22, v: 48.5, y: 6.95, w: 8.5, h: 0.95, f: 'E', bg: '#d3c4aa', fg: '#4a3a28' });
    SG(['JW MARRIOTT HOTEL SEOUL'], { u: 4, v: vS(4) + 0.22, y: 8.8, w: 22, h: 1.8, f: 'S', bg: '#d3c4aa', fg: '#4a3a28' });
    SG(['센트럴시티 · 신세계백화점 연결'], { u: UE + 0.12, v: 0, y: 3.85, w: 5.6, h: 0.55, f: 'E', bg: '#2b241d', fg: '#f0e4cc' });
    SG(['JW 메리어트 호텔 서울 남측 출입구'], { u: 8, v: vS(8) + 0.12, y: 3.85, w: 4.4, h: 0.5, f: 'S', bg: '#2b241d', fg: '#f0e4cc' });
    // sidewalk planters along the east side
    for (let v = -50; v <= 30; v += 10) { B({ u: 35.0, v, y: 0, w: 1.4, d: 3.6, h: 0.6, mat: { tex: 'jwStone' } }); TREE(35.0, v, 0.6, { h: 6, kind: 'zelkova' }); }
    for (let u = -26; u <= 22; u += 12) { B({ u, v: 62.6, y: 0, w: 3.6, d: 1.2, h: 0.6, mat: { tex: 'jwStone' } }); TREE(u, 62.6, 0.6, { h: 6, kind: 'ginkgo' }); }
    CROWD([33.5, -40, 37.5, 36], 0, 8, 1501);
  }
}
