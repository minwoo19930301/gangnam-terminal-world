// 신세계백화점 강남점 — detailed place module (B2 주차장 ~ 11F 식당가 + 1M 메자닌 + J1 지하 연결통로)
// Exterior: 적갈색 본관 (신반포로 쪽, 1F~8F) + 2016 증축 신관 (JW 쪽, 회색 석재 1~5F + 유리 6~11F).
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
// Two volumes inside the one OSM rectangle (namu: 적갈색 부분 = 백화점 본체, 그 남쪽 JW 쪽 회색 저층 = 옛 마르퀴스 플라자,
// 2016년 그 위에 6개 층을 올린 유리 증축부 '유리궁전'). 본관 = v 0..VS (신반포로 쪽, 적갈색, 1F~8F),
// 신관 = v VS..VD (JW 쪽, 1~5F 회색 석재 + 6~11F 유리 커튼월). The split proportion is a guess (see research).
const VS = 33;
const BON_TOP = '8F';            // highest floor of the 본관 volume; its roof is the 9F level
const UPPER = new Set(['9F', '10F', '11F']); // floors that exist only in the 신관 volume

export function build(K) {
  const P = (u, v) => [OX + u * CA + v * SA, OZ - u * SA + v * CA];
  const rect = (u0, v0, u1, v1) => [P(u0, v0), P(u1, v0), P(u1, v1), P(u0, v1)];
  const FACE = { S: RA, N: RA + PI, E: RA + PI / 2, W: RA - PI / 2 };
  const yawTo = (du, dv) => { const dx = du * CA + dv * SA, dz = -du * SA + dv * CA; return Math.atan2(-dx, -dz); };
  const rnd = K.rand(20001003);
  const FULL = rect(0, 0, UW, VD);
  // ceilings: slightly self-lit so the downward faces do not go muddy under the sky/ground hemisphere light
  const ceilTex = K.T.surface('ceiling');
  K.material('ssg_ceil', new K.THREE.MeshLambertMaterial({ map: ceilTex.tex, emissive: 0x77736c, emissiveMap: ceilTex.tex }));
  const CEIL = { tex: 'ssg_ceil', scale: ceilTex.scale };

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

  // ------------------------------------------------------------ custom textures
  const lcg = (s => () => (s = (s * 16807) % 2147483647) / 2147483647)(777);
  K.texture('ssg_granite', 256, 256, (g, w, h) => {
    g.fillStyle = '#7c4a3a'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 2600; i++) { const v = lcg(); g.fillStyle = v < 0.5 ? 'rgba(60,30,22,0.35)' : v < 0.8 ? 'rgba(160,110,90,0.3)' : 'rgba(20,10,8,0.4)'; g.fillRect(lcg() * w, lcg() * h, 2, 2); }
    g.fillStyle = 'rgba(40,20,14,0.55)'; for (const f of [0.34, 0.67]) g.fillRect(0, h * f, w, 2); g.fillRect(w / 2 - 1, 0, 2, h);
    g.fillStyle = '#5a3226'; g.fillRect(0, h * 0.9, w, h * 0.1); // floor-line band
    g.fillStyle = 'rgba(255,230,210,0.18)'; g.fillRect(0, h * 0.9 - 2, w, 2);
  }, [3.2, 1], { facade: true });
  K.texture('ssg_glass', 256, 256, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, '#9fb6c6'); gr.addColorStop(0.5, '#6c8395'); gr.addColorStop(1, '#53697a');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(255,255,255,0.12)'; g.beginPath(); g.moveTo(w * 0.1, 0); g.lineTo(w * 0.45, 0); g.lineTo(w * 0.15, h); g.lineTo(0, h); g.fill();
    g.fillStyle = '#39444e'; g.fillRect(0, h * 0.8, w, h * 0.2); // spandrel at the slab line
    g.fillStyle = '#c9ced2'; g.fillRect(0, 0, 6, h); g.fillRect(0, h * 0.8, w, 4);
  }, [1.8, 1], { facade: true });
  // inside face of the curtain wall: bright glazing with mullions and a sill band (reads as windows from the floor)
  K.texture('ssg_glass_in', 256, 256, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#dfeaf2'); gr.addColorStop(0.75, '#b9cbd8'); gr.addColorStop(0.76, '#e9e6e0'); gr.addColorStop(1, '#d9d5ce');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(255,255,255,0.35)'; g.beginPath(); g.moveTo(w * 0.15, 0); g.lineTo(w * 0.4, 0); g.lineTo(w * 0.2, h * 0.75); g.lineTo(0, h * 0.75); g.fill();
    g.fillStyle = '#8f969c'; g.fillRect(0, 0, 8, h); g.fillRect(0, h * 0.74, w, 6); g.fillRect(0, h * 0.97, w, 8);
  }, [1.8, 1], { facade: true });
  // hanging clothes on a rail (tinted per rack)
  K.texture('ssg_rack', 128, 64, (g, w, h) => {
    g.fillStyle = '#bdbdbd'; g.fillRect(0, 0, w, h);
    let x = 0; while (x < w) { const sw = 5 + lcg() * 9, l = 150 + (lcg() * 105 | 0); g.fillStyle = `rgb(${l},${l},${l})`; g.fillRect(x, 4 + lcg() * 6, sw - 1, h - 4 - lcg() * 18); g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(x + sw - 2, 4, 1, h); x += sw; }
    g.fillStyle = '#777'; g.fillRect(0, 0, w, 3);
  }, [1.5, 1]);
  // 1F base (one 4 m x 7 m stone panel; show windows are separate lit quads on top of it)
  const base = (key, c0, dots, joint, plinth) => K.texture(key, 256, 256, (g, w, h) => {
    g.fillStyle = c0; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 1800; i++) { g.fillStyle = dots[(lcg() * dots.length) | 0]; g.fillRect(lcg() * w, lcg() * h, 2, 2); }
    g.fillStyle = joint; for (const f of [0.2, 0.45, 0.7]) g.fillRect(0, h * f, w, 2); g.fillRect(0, 0, 2, h);
    g.fillStyle = plinth; g.fillRect(0, h * 0.93, w, h * 0.07); g.fillRect(0, 0, w, h * 0.04);
  }, [4, 1], { facade: true });
  base('ssg_base', '#7a4636', ['rgba(60,30,22,0.35)', 'rgba(160,110,90,0.3)', 'rgba(20,10,8,0.4)'], 'rgba(40,20,14,0.55)', '#4e2b20');
  base('ssg_base_g', '#a9a59e', ['rgba(80,78,74,0.3)', 'rgba(220,216,208,0.35)', 'rgba(40,40,38,0.25)'], 'rgba(70,68,64,0.45)', '#6f6b65');
  // 신관 2~5F: light grey stone with narrow vertical window slits (옛 마르퀴스 플라자 저층부)
  K.texture('ssg_stone_g', 256, 256, (g, w, h) => {
    g.fillStyle = '#b3afa8'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 2200; i++) { const v = lcg(); g.fillStyle = v < 0.5 ? 'rgba(90,88,84,0.25)' : v < 0.85 ? 'rgba(230,226,218,0.35)' : 'rgba(40,40,38,0.3)'; g.fillRect(lcg() * w, lcg() * h, 2, 2); }
    g.fillStyle = 'rgba(70,68,64,0.45)'; for (const f of [0.33, 0.66]) g.fillRect(0, h * f, w, 2); g.fillRect(w / 2 - 1, 0, 2, h);
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#3b4650'); gr.addColorStop(1, '#5d6b77');
    g.fillStyle = gr; g.fillRect(w * 0.44, h * 0.12, w * 0.12, h * 0.7);
    g.fillStyle = 'rgba(255,255,255,0.18)'; g.fillRect(w * 0.45, h * 0.12, 3, h * 0.7);
    g.fillStyle = '#85817a'; g.fillRect(0, h * 0.9, w, h * 0.1);
    g.fillStyle = 'rgba(255,255,255,0.2)'; g.fillRect(0, h * 0.9 - 2, w, 2);
  }, [4.2, 1], { facade: true });
  // lit shop windows: each brand gets its own display (products painted on a back-lit canvas)
  const WIN = {
    'HERMÈS': { bg: ['#f2a65c', '#c4632a'], kind: 'bag', it: ['#e8742c', '#3a2414', '#f3e2c4'], fg: '#4a2410' },
    'CHANEL': { bg: ['#f6f3ee', '#cdc6bb'], kind: 'dress', it: ['#151515', '#f8f5f0', '#c9b48a'], fg: '#151515' },
    'LOUIS VUITTON': { bg: ['#6a4831', '#2a1d15'], kind: 'trunk', it: ['#7a5432', '#d0a96a', '#3a2a1c'], fg: '#f0dcb0' },
    'DIOR': { bg: ['#ece0d6', '#bba99a'], kind: 'dress', it: ['#d9c2b8', '#22252c', '#f4eee8'], fg: '#2a2a2a' },
    'CARTIER': { bg: ['#8a1824', '#3e0a10'], kind: 'jewel', it: ['#f2d27a', '#ffffff', '#c8102e'], fg: '#f2d27a' },
    'GUCCI': { bg: ['#24442f', '#0e1f16'], kind: 'bag', it: ['#c8102e', '#e3cc8b', '#1d1d1d'], fg: '#e3cc8b' },
    'FENDI': { bg: ['#f3e5bc', '#cdb36e'], kind: 'bag', it: ['#2a2420', '#d9a43a', '#f6f0e2'], fg: '#2a2420' },
    'BURBERRY': { bg: ['#dcc8a4', '#a2865a'], kind: 'dress', it: ['#c8a46a', '#1d1d1d', '#7a1c1c'], fg: '#2a2016' },
    'BOTTEGA VENETA': { bg: ['#2f7a3e', '#123a1c'], kind: 'bag', it: ['#55c060', '#e0cfa8', '#5a3a22'], fg: '#e9f2d8' },
    'MAISON MARGIELA': { bg: ['#f8f8f6', '#d5d5d2'], kind: 'dress', it: ['#ffffff', '#1d1d1d', '#b8b8b8'], fg: '#1d1d1d' },
    'PRADA': { bg: ['#dde6e2', '#98aea7'], kind: 'shoe', it: ['#1d1d1d', '#e6dccb', '#6f8796'], fg: '#1d1d1d' },
    'MIU MIU': { bg: ['#f4d6da', '#c48f98'], kind: 'shoe', it: ['#7a1c2c', '#f6efe8', '#1d1d1d'], fg: '#5a1420' },
    'CELINE': { bg: ['#efe9e0', '#b7ab9a'], kind: 'bag', it: ['#6a3d22', '#1d1d1d', '#d6c3a4'], fg: '#1d1d1d' },
    'TIFFANY & CO.': { bg: ['#9fd8cf', '#5fb2a6'], kind: 'jewel', it: ['#ffffff', '#e8e8e8', '#81d8d0'], fg: '#ffffff' },
  };
  let winSeed = 1;
  function winTex(brand) {
    const key = 'ssg_win_' + Object.keys(WIN).indexOf(brand), st = WIN[brand];
    const rr = (s => () => (s = (s * 16807) % 2147483647) / 2147483647)(winSeed++ * 7919);
    const draw = (g, w, h) => {
      const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, st.bg[0]); gr.addColorStop(1, st.bg[1]); g.fillStyle = gr; g.fillRect(0, 0, w, h);
      for (let k = 0; k < 3; k++) { // spotlights
        const cx = w * (0.2 + k * 0.3), rg = g.createRadialGradient(cx, h * 0.55, 4, cx, h * 0.55, h * 0.45);
        rg.addColorStop(0, 'rgba(255,248,230,0.45)'); rg.addColorStop(1, 'rgba(255,248,230,0)'); g.fillStyle = rg; g.fillRect(0, 0, w, h);
        g.fillStyle = 'rgba(255,250,235,0.95)'; g.fillRect(cx - 9, 4, 18, 6);
      }
      g.fillStyle = 'rgba(0,0,0,0.18)'; g.fillRect(0, h * 0.82, w, h * 0.18); // floor
      g.fillStyle = 'rgba(255,255,255,0.25)'; g.fillRect(0, h * 0.82, w, 2);
      g.font = '500 30px "Times New Roman",serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = st.fg; g.globalAlpha = 0.85; g.fillText(brand, w / 2, h * 0.12); g.globalAlpha = 1;
      const it = st.it, pick = () => it[(rr() * it.length) | 0];
      const plinth = (x, pw, ph) => { g.fillStyle = 'rgba(250,246,238,0.95)'; g.fillRect(x - pw / 2, h * 0.86 - ph, pw, ph); g.fillStyle = 'rgba(0,0,0,0.12)'; g.fillRect(x - pw / 2, h * 0.86 - ph, pw, 4); return h * 0.86 - ph; };
      if (st.kind === 'dress') {
        for (let k = 0; k < 3; k++) {
          const cx = w * (0.22 + k * 0.28) + (rr() - 0.5) * 20, top = h * (0.3 + rr() * 0.05), c = it[k % it.length];
          g.fillStyle = '#e8dccc'; g.beginPath(); g.arc(cx, top, 13, 0, 6.3); g.fill(); g.fillRect(cx - 4, top + 10, 8, 14);
          g.fillStyle = c; g.beginPath(); g.moveTo(cx - 22, top + 24); g.lineTo(cx + 22, top + 24); g.lineTo(cx + 18 + rr() * 30, h * 0.78); g.lineTo(cx - 18 - rr() * 30, h * 0.78); g.closePath(); g.fill();
          g.fillStyle = 'rgba(0,0,0,0.15)'; g.fillRect(cx - 2, top + 30, 4, h * 0.45);
          g.fillStyle = '#3a3230'; g.fillRect(cx - 2, h * 0.78, 4, h * 0.06); g.fillRect(cx - 16, h * 0.84, 32, 5);
        }
      } else if (st.kind === 'bag' || st.kind === 'trunk') {
        for (let k = 0; k < 4; k++) {
          const cx = w * (0.14 + k * 0.24), ph = 30 + rr() * 90, ty = plinth(cx, 90, ph), c = pick();
          if (st.kind === 'trunk' && k % 2 === 0) { g.fillStyle = c; g.fillRect(cx - 40, ty - 52, 80, 52); g.fillStyle = it[1]; g.fillRect(cx - 40, ty - 30, 80, 4); g.fillRect(cx - 40, ty - 52, 6, 52); g.fillRect(cx + 34, ty - 52, 6, 52); g.fillStyle = c; g.fillRect(cx - 32, ty - 92, 64, 40); g.fillStyle = it[1]; g.fillRect(cx - 32, ty - 74, 64, 3); continue; }
          const bw = 44 + rr() * 26, bh = 30 + rr() * 22;
          g.strokeStyle = c; g.lineWidth = 5; g.beginPath(); g.arc(cx, ty - bh, bw * 0.3, PI, 0); g.stroke();
          g.fillStyle = c; g.fillRect(cx - bw / 2, ty - bh, bw, bh);
          g.fillStyle = 'rgba(255,255,255,0.22)'; g.fillRect(cx - bw / 2, ty - bh, bw, 5);
          g.fillStyle = it[1]; g.fillRect(cx - 4, ty - bh + 8, 8, 6);
        }
      } else if (st.kind === 'shoe') {
        for (let k = 0; k < 3; k++) {
          const cx = w * (0.2 + k * 0.3), ty = plinth(cx, 120, 40 + k * 35);
          for (let j = 0; j < 2; j++) { const x = cx - 30 + j * 34; g.fillStyle = pick(); g.beginPath(); g.moveTo(x, ty); g.lineTo(x + 30, ty); g.lineTo(x + 30, ty - 8); g.lineTo(x + 8, ty - 26); g.lineTo(x, ty - 26); g.closePath(); g.fill(); g.fillRect(x + 1, ty - 26, 4, 26); }
        }
      } else { // jewel: velvet busts with necklaces + ring boxes
        for (let k = 0; k < 3; k++) {
          const cx = w * (0.2 + k * 0.3), ty = plinth(cx, 100, 60 + (k % 2) * 40);
          g.fillStyle = '#1d1416'; g.beginPath(); g.moveTo(cx - 34, ty); g.lineTo(cx + 34, ty); g.lineTo(cx + 18, ty - 50); g.lineTo(cx + 10, ty - 90); g.lineTo(cx - 10, ty - 90); g.lineTo(cx - 18, ty - 50); g.closePath(); g.fill();
          g.strokeStyle = it[k % 2]; g.lineWidth = 3; g.beginPath(); g.arc(cx, ty - 72, 18, 0.2, PI - 0.2); g.stroke();
          g.fillStyle = it[2]; g.beginPath(); g.arc(cx, ty - 52, 5, 0, 6.3); g.fill();
        }
      }
      g.fillStyle = 'rgba(255,255,255,0.10)'; g.beginPath(); g.moveTo(w * 0.55, 0); g.lineTo(w * 0.7, 0); g.lineTo(w * 0.45, h); g.lineTo(w * 0.3, h); g.fill(); // glass reflection
    };
    const t = K.T.custom(key, 512, 384, draw, [1, 1], {}).tex;
    K.material(key, new K.THREE.MeshLambertMaterial({ map: t, emissive: 0xc8c8c8, emissiveMap: t }));
    return key;
  }
  function letters(key, text, font, color, cw, ch, shadow = 'rgba(0,0,0,0.35)') {
    const draw = (g, w, h) => {
      g.clearRect?.(0, 0, w, h);
      g.font = font; g.textAlign = 'center'; g.textBaseline = 'middle';
      let fs = 1; const m = g.measureText(text).width; if (m > w * 0.94) fs = (w * 0.94) / m;
      g.save(); g.translate(w / 2, h / 2); g.scale(fs, 1);
      g.fillStyle = shadow; g.fillText(text, 3, 4);
      g.fillStyle = color; g.fillText(text, 0, 0); g.restore();
    };
    K.texture(key, cw, ch, draw, [1, 1], { transparent: true });
    // self-lit variant (back-lit channel letters), so the sign reads in shade and glows at night
    const t = K.T.custom(key, cw, ch, draw, [1, 1], { transparent: true }).tex;
    K.material(key + '_lit', new K.THREE.MeshLambertMaterial({ map: t, emissive: 0xffffff, emissiveMap: t, alphaTest: 0.3, side: K.THREE.FrontSide }));
    return key;
  }
  letters('ssg_logo', 'SHINSEGAE', '600 150px "Times New Roman","Noto Serif KR",serif', '#f6efe2', 1024, 192);
  letters('ssg_logo_kr', '신세계백화점 강남점', '700 120px "Noto Sans KR","Apple SD Gothic Neo",sans-serif', '#f6efe2', 1024, 160);
  letters('ssg_hos', 'HOUSE OF SHINSEGAE', '500 120px "Times New Roman",serif', '#e9dcc0', 1024, 160);
  letters('ssg_logo_kr2', '신세계백화점', '700 130px "Noto Sans KR","Apple SD Gothic Neo",sans-serif', '#f6efe2', 1024, 180);
  // quads on a face: f = 'N' | 'E' | 'W' | 'S', c = position along the face, y = bottom, plane = face line (v for N/S, u for E/W)
  const PLANE = { N: 0, S: VD, E: UW, W: 0 };
  function faceQuad(mat, f, c, y, w, h, off = 0.12, plane = PLANE[f]) {
    let a, b;
    if (f === 'N') { a = P(c + w / 2, plane - off); b = P(c - w / 2, plane - off); }
    else if (f === 'S') { a = P(c - w / 2, plane + off); b = P(c + w / 2, plane + off); }
    else if (f === 'E') { a = P(plane + off, c + w / 2); b = P(plane + off, c - w / 2); }
    else { a = P(plane - off, c - w / 2); b = P(plane - off, c + w / 2); }
    const n = { N: [-SA, -CA], S: [SA, CA], E: [CA, -SA], W: [-CA, SA] }[f];
    K.quad(mat, [[a[0], y, a[1]], [b[0], y, b[1]], [b[0], y + h, b[1]], [a[0], y + h, a[1]]], [n[0], 0, n[1]]);
  }
  const faceLetters = (key, f, c, y, w, h, off, plane) => faceQuad({ tex: key + '_lit' }, f, c, y, w, h, off, plane);
  // a box hugging a face: s = position along the face, t = distance out from the face plane
  function faceBox(f, s, len, t, dep, y, h, mat, plane = PLANE[f]) {
    const o = { solid: false, skip: ['bottom'] };
    if (f === 'N') return box(s, plane - t, len, dep, y, h, mat, o);
    if (f === 'S') return box(s, plane + t, len, dep, y, h, mat, o);
    if (f === 'E') return box(plane + t, s, dep, len, y, h, mat, o);
    return box(plane - t, s, dep, len, y, h, mat, o);
  }
  // exterior wall along one face segment s0..s1 (local u for N/S, v for E/W); `mat` faces outward
  function exWall(f, plane, s0, s1, y0, y1, o) {
    const th = o.thick ?? 0.3, h = th / 2;
    const ab = f === 'N' ? [[s0, plane + h], [s1, plane + h]] : f === 'S' ? [[s0, plane - h], [s1, plane - h]]
      : f === 'E' ? [[plane - h, s0], [plane - h, s1]] : [[plane + h, s0], [plane + h, s1]];
    const A = P(...ab[0]), B = P(...ab[1]);
    const nl = { N: [0, -1], S: [0, 1], E: [1, 0], W: [-1, 0] }[f], nx = nl[0] * CA + nl[1] * SA, nz = -nl[0] * SA + nl[1] * CA;
    const L = Math.hypot(B[0] - A[0], B[1] - A[1]), ux = (B[0] - A[0]) / L, uz = (B[1] - A[1]) / L;
    const plusOut = (-uz * nx + ux * nz) > 0, inner = o.inner ?? IN;
    K.wall(A[0], A[1], B[0], B[1], y0, y1, { thick: th, floorH: o.floorH, vBase: o.vBase ?? y0, solid: o.solid,
      openings: (o.openings || []).map(p => ({ at: p.s - s0, w: p.w, y0: p.y0, y1: p.y1 })),
      mat: plusOut ? o.mat : inner, mat2: plusOut ? inner : o.mat });
  }

  // ------------------------------------------------------------ envelope
  K.groundHole(FULL);
  const doorsN = [18, 50], doorsE = [30, 64];
  const J4V = 42.6, J5U = 33.65;           // J4 (-92,15.5) and J5 (-45.5,43) in local coordinates
  const IN = 0xf2eee7, YB = LV['9F'];       // YB = 본관 roof
  K.polyWalls(FULL, -11, -6, { mat: 'concrete', inner: { tex: 'concrete', color: 0xd8d6d0 }, thick: 0.3 });
  K.polyWalls(FULL, -6, 0, { mat: 'concrete', inner: IN, thick: 0.3, openings: [
    { x: P(39.65, 0)[0], z: P(39.65, 0)[1], w: 9, y0: -6, y1: -2.7 },  // J1 고투몰 연결통로
    { x: -92, z: 15.5, w: 8, y0: -6, y1: -3.0 },                       // J4 B1
  ] });
  const dOp = s => ({ s, w: 6, y0: 0, y1: 4.2 });
  // 1F: stone base (red 본관 / grey 신관); lit show windows are added below
  exWall('N', 0, 0, UW, 0, 7, { mat: 'ssg_base', floorH: 7, openings: doorsN.map(dOp) });
  exWall('E', UW, 0, VS, 0, 7, { mat: 'ssg_base', floorH: 7, openings: [dOp(doorsE[0])] });
  exWall('E', UW, VS, VD, 0, 7, { mat: 'ssg_base_g', floorH: 7, openings: [dOp(doorsE[1])] });
  exWall('W', 0, 0, VS, 0, 7, { mat: 'ssg_base', floorH: 7 });
  exWall('W', 0, VS, VD, 0, 7, { mat: 'ssg_base_g', floorH: 7, openings: [{ s: J4V, w: 8, y0: 0, y1: 3.4 }] });
  exWall('S', VD, 0, UW, 0, 7, { mat: 'ssg_base_g', floorH: 7, openings: [{ s: J5U, w: 6, y0: 0, y1: 3.0 }] });
  // 본관 2F~8F: 적갈색 화강석, windowless (+ parapet)
  exWall('N', 0, 0, UW, 7, YB + 1.8, { mat: 'ssg_granite', floorH: 4.8, vBase: 7 });
  exWall('E', UW, 0, VS, 7, YB + 1.8, { mat: 'ssg_granite', floorH: 4.8, vBase: 7 });
  exWall('W', 0, 0, VS, 7, YB + 1.8, { mat: 'ssg_granite', floorH: 4.8, vBase: 7 });
  // 신관 2F~5F: grey stone (옛 마르퀴스 플라자), 6F~11F: glass curtain wall (2016 증축 '유리궁전') + glass crown
  for (const [f, pl, s0, s1] of [['E', UW, VS, VD], ['W', 0, VS, VD], ['S', VD, 0, UW]]) {
    exWall(f, pl, s0, s1, 7, 26.2, { mat: 'ssg_stone_g', floorH: 4.8, vBase: 7 });
    exWall(f, pl, s0, s1, 26.2, LV.RF + 2.2, { mat: 'ssg_glass', inner: 'ssg_glass_in', floorH: 4.8, vBase: 26.2 });
  }
  exWall('N', VS, 0, UW, YB, LV.RF + 2.2, { mat: 'ssg_glass', inner: 'ssg_glass_in', floorH: 4.8, vBase: 26.2 });
  // grey cornice between the stone podium and the glass box (신관 only)
  boxR(UW - 0.3, VS + 1.2, UW + 0.55, VD + 0.55, 25.9, 0.7, 0x8f8b84, { solid: false });
  boxR(-0.55, VS + 1.2, 0.3, VD + 0.55, 25.9, 0.7, 0x8f8b84, { solid: false });
  boxR(-0.55, VD - 0.3, UW + 0.55, VD + 0.55, 25.9, 0.7, 0x8f8b84, { solid: false });
  // 본관 coping + a bronze band over the 1F show windows
  boxR(-0.5, -0.5, UW + 0.5, 0.3, YB + 1.8, 0.4, 0x5a3226, { solid: false });
  boxR(UW - 0.3, -0.5, UW + 0.5, VS, YB + 1.8, 0.4, 0x5a3226, { solid: false });
  boxR(-0.5, -0.5, 0.3, VS, YB + 1.8, 0.4, 0x5a3226, { solid: false });
  // dark recessed joint where the two volumes meet (east + west faces)
  boxR(UW - 0.2, VS, UW + 0.4, VS + 1.2, 0, YB + 2.2, 0x26211e, { solid: false });
  boxR(-0.4, VS, 0.2, VS + 1.2, 0, YB + 2.2, 0x26211e, { solid: false });
  // corner pilasters
  for (const [u, v] of [[0, 0], [UW, 0]]) box(u, v, 1.3, 1.3, 0, YB + 2.2, 'ssg_granite', { floorH: 4.8, vBase: 7, solid: false, skip: ['bottom'] });
  for (const [u, v] of [[UW, VD], [0, VD]]) box(u, v, 1.3, 1.3, 0, 26.2, { tex: 'ssg_base_g', color: 0xd8d4cc }, { floorH: 7, solid: false, skip: ['bottom'] });
  const MUL = 0xc9ced2;
  for (const [u, v, y0] of [[UW, VD, 26.2], [0, VD, 26.2], [UW, VS + 0.6, YB], [0, VS + 0.6, YB]]) box(u, v, 0.7, 0.7, y0, LV.RF + 2.4 - y0, MUL, { solid: false, skip: ['bottom'] });
  // vertical mullion fins on the glass box
  const GH = LV.RF + 2.2;
  for (let v = VS + 4; v < VD - 1.5; v += 3.6) { faceBox('E', v, 0.14, 0.15, 0.3, 26.2, GH - 26.2, MUL); faceBox('W', v, 0.14, 0.15, 0.3, 26.2, GH - 26.2, MUL); }
  for (let u = 2.2; u < UW - 1.5; u += 3.6) { faceBox('S', u, 0.14, 0.15, 0.3, 26.2, GH - 26.2, MUL); faceBox('N', u, 0.14, 0.15, 0.3, YB, GH - YB, MUL, VS); }
  // glass crown: lit band at the top of the 신관
  for (const [f, s, L, pl] of [['E', (VS + VD) / 2, VD - VS, UW], ['W', (VS + VD) / 2, VD - VS, 0], ['S', UW / 2, UW, VD], ['N', UW / 2, UW, VS]]) faceBox(f, s, L, 0.2, 0.12, GH - 0.35, 0.25, { tex: 'emit', color: 0xdff0ff }, pl);
  // big letters: 본관 top (신반포로 face) + 신관 glass box top on N, E, W
  faceLetters('ssg_logo', 'N', 33.5, YB - 7.6, 42, 7.2, 0.2);
  faceLetters('ssg_logo_kr2', 'E', 15, YB - 6.4, 22, 3.9, 0.2);
  faceLetters('ssg_logo', 'N', 33.5, LV.RF - 7.8, 40, 7.0, 0.45, VS);
  faceLetters('ssg_logo', 'E', (VS + VD) / 2 + 1, LV.RF - 7.8, 40, 7.0, 0.45);
  faceLetters('ssg_logo', 'W', (VS + VD) / 2 + 1, LV.RF - 7.4, 34, 6.0, 0.45);
  faceLetters('ssg_logo_kr', 'N', 33.5, 8.6, 18, 2.8);
  faceLetters('ssg_logo_kr', 'E', 14, 8.6, 18, 2.8);
  // entrance canopies (bronze) with door frames
  const bronze = 0x6b5434;
  for (const u of doorsN) {
    boxR(u - 4.5, -2.8, u + 4.5, 0.1, 4.4, 0.35, bronze, { solid: false });
    sign('SHINSEGAE', u, -2.82, 4.58, 'N', 5, 0.3, { bg: '#6b5434', fg: '#f3e6c8' });
    for (const s of [-3.1, 3.1]) boxR(u + s - 0.1, -0.05, u + s + 0.1, 0.35, 0, 4.2, 0x3a3128, { solid: false });
    K.sign(['신세계백화점 강남점', 'SHINSEGAE GANGNAM'], { x: P(u, -0.06)[0], y: 5.4, z: P(u, -0.06)[1], w: 4.6, h: 0.9, rotY: FACE.N, bg: '#2d241c', fg: '#efe2c6' });
  }
  for (const v of doorsE) {
    boxR(UW - 0.1, v - 4.5, UW + 2.8, v + 4.5, 4.4, 0.35, bronze, { solid: false });
    sign('SHINSEGAE', UW + 2.82, v, 4.58, 'E', 5, 0.3, { bg: '#6b5434', fg: '#f3e6c8' });
    for (const s of [-3.1, 3.1]) boxR(UW - 0.35, v + s - 0.1, UW + 0.05, v + s + 0.1, 0, 4.2, 0x3a3128, { solid: false });
  }
  sign(['신세계백화점 강남점', '경부선 터미널 방면 출입구'], UW + 0.04, 64, 5.4, 'E', 4.6, 0.9, { bg: '#2d241c', fg: '#efe2c6' });
  sign(['신세계백화점 강남점', '고속터미널역 방면 출입구'], UW + 0.04, 30, 5.4, 'E', 4.6, 0.9, { bg: '#2d241c', fg: '#efe2c6' });
  // brand show windows (lit displays, bronze frames, brand letters above), matched to the boutiques behind them
  const winMade = new Set();
  function showWin(f, c, brand) {
    const key = 'ssg_win_' + Object.keys(WIN).indexOf(brand);
    if (!winMade.has(brand)) { winTex(brand); winMade.add(brand); }
    faceQuad({ tex: key }, f, c, 0.6, 5.0, 3.75, 0.1);
    faceBox(f, c, 5.6, 0.12, 0.26, 4.35, 0.22, bronze);
    faceBox(f, c, 5.6, 0.18, 0.36, 0, 0.6, 0x4a3a28);
    for (const d of [-2.65, 2.65]) faceBox(f, c + d, 0.24, 0.12, 0.26, 0.6, 3.75, bronze);
    const [u, v] = f === 'N' ? [c, -0.16] : [UW + 0.16, c];
    sign(brand, u, v, 5.25, f, Math.min(4.6, 0.42 * brand.length + 0.6), 0.62, { bg: '#2a201a', fg: '#f3e6c8', bold: false });
  }
  for (const [c, b] of [[4.2, 'HERMÈS'], [10.4, 'HERMÈS'], [25, 'CHANEL'], [31.4, 'DIOR'], [38.6, 'LOUIS VUITTON'], [57.4, 'FENDI'], [63.3, 'CELINE']]) showWin('N', c, b);
  for (const [c, b] of [[5, 'GUCCI'], [11.4, 'CARTIER'], [17.8, 'TIFFANY & CO.'], [38.4, 'BURBERRY'], [44.8, 'BOTTEGA VENETA'], [51.2, 'MAISON MARGIELA'], [72.6, 'PRADA'], [79, 'MIU MIU']]) showWin('E', c, b);
  // 신관 roof (11F): gravel, mechanical penthouse over the lift bank, cooling towers, SW stair penthouse
  K.slab(rect(0, VS, UW, VD), LV.RF, { mat: 'roofgravel', under: CEIL, thick: TH.RF, edge: false });
  boxR(26, 56, 41, 72, LV.RF, 4.5, 0x9a948c);
  for (const [u, v] of [[48, 52], [55, 52], [48, 59], [55, 59]]) { box(u, v, 5.2, 5.2, LV.RF, 3.6, 0xb7bcc0); box(u, v, 3.6, 3.6, LV.RF + 3.6, 0.6, 0x3a3f44, { solid: false }); }
  for (let i = 0; i < 6; i++) box(46 + i * 3, 76, 1.6, 6, LV.RF, 1.2, 0x7d8388);
  box(10, 80, 0.3, 0.3, LV.RF, 9, 0x666666, { solid: false });
  // 본관 roof (9F level): cooling towers, ducts, NE stair penthouse
  for (const [u, v] of [[8, 10], [15, 10], [8, 17], [15, 17]]) { box(u, v, 5.2, 5.2, YB, 3.6, 0xb7bcc0); box(u, v, 3.6, 3.6, YB + 3.6, 0.6, 0x3a3f44, { solid: false }); }
  for (let i = 0; i < 5; i++) box(30 + i * 3, 16, 1.6, 9, YB, 1.2, 0x7d8388);
  for (const c of CORES) boxR(c.uL, c.v0, c.uR, c.v1, LV[nextOf(c.top)], 3.2, 0x8f8a84);

  // ------------------------------------------------------------ slabs
  const elvHoles = ELV.map(e => rect(e.u - e.w / 2, e.v - e.d / 2, e.u + e.w / 2, e.v + e.d / 2));
  const atrHole = rect(...ATR);
  // stair hole at main-floor index s (B2=0): lane of the flight that arrives from s-1
  const stairLaneU = (c, s) => c.lanes[(s - 1) % 2];
  const stairHole = (c, s) => { const u = stairLaneU(c, s); return rect(u - 0.85, c.v0 + 2.2, u + 0.85, c.v1 - 2.2); };
  const coreTop = c => MAIN.indexOf(c.top);
  const floorMat = { B2: { tex: 'parking', color: 0xd8d8d4 }, B1: { tex: 'tile', color: 0xf4efe6 }, '1F': 'marble', '2F': 'marble', '3F': 'marble', '11F': { tex: 'tile', color: 0xe8dccb } };
  MAIN.forEach((id, s) => {
    const holes = [...elvHoles];
    if (s >= 2) holes.push(atrHole);
    if (s >= 1) for (const c of CORES) if (s <= coreTop(c)) holes.push(stairHole(c, s));
    K.slab(UPPER.has(id) ? rect(0, VS, UW, VD) : FULL, LV[id], { mat: floorMat[id] ?? { tex: 'tile', color: 0xf1ede6 }, thick: thick(id), holes, edge: false, under: id === 'B2' ? false : CEIL });
  });
  K.slab(rect(0, 0, UW, VS), YB, { mat: 'roofgravel', thick: thick('9F'), edge: false, under: CEIL }); // 본관 roof
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
    // floor labels at the foot of the up escalator
    sign(`${MAIN[i + 2]} ↑`, uu, vLo + (even ? -0.6 : 0.6), lo + 2.6, even ? 'N' : 'S', 1.0, 0.36, { bg: '#1e1e1e', fg: '#ffd27a', twoSided: true });
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
  // skylight over the atrium + hanging art mobile
  K.quad({ tex: 'emit', color: 0xeaf4ff }, rect(ATR[0] + 0.3, ATR[1] + 0.3, ATR[2] - 0.3, ATR[3] - 0.3).map(q => [q[0], LV.RF - TH.RF - 0.02, q[1]]), [0, -1, 0]);
  for (let i = 0; i < 5; i++) box(33.5, 41, 0.08, 0.08, 40 + i * 2.6, 2.6, 0xb9a77f, { solid: false });
  for (let i = 0; i < 4; i++) box(32 + (i % 2) * 3, 38.5 + (i >> 1) * 5, 1.6, 1.6, 41 + i * 2.4, 0.08, { tex: 'emit', color: 0xffe6b8 }, { solid: false });

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
  // K.elevator's front wall stacks one opening per floor at the same `at`, which K.wall fills back in (engine), so the
  // car is sealed. Arrive in the lobby just outside the doors instead (dx/dz = 2.2 m in front of the car, local -v).
  const ARR = { dx: -2.2 * SA, dz: -2.2 * CA };
  ELV.forEach((e, i) => {
    const [x, z] = P(e.u, e.v);
    K.elevator({ name: `신세계 강남점 엘리베이터 ${i + 1}호기`, x, z, rotY: RA + PI, w: e.w, d: e.d, floors: ELV_FLOORS.map(f => ({ ...f, ...ARR })), mat: 0xc9c2b4, doorMat: 0xb7a983 });
  });
  const DIRECTORY = ['층별 안내 FLOOR GUIDE', ...ELV_FLOORS.slice().reverse().map(f => `${f.label}  ${f.name}`)];

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
    // (one wall segment per storey: K.wall cannot stack several openings at the same `at`)
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
  let shopCount = 0;
  function shop(o) {
    const { u0, v0, u1, v1, f, y } = o;
    const H = o.H ?? 4.2, kind = o.kind || 'fashion';
    const [signText, koName] = String(o.name).split('|'); const zoneName = koName || signText;
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
    const part = o.partMat ?? { tex: 'marble', color: 0xf6f2ec };
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
    } else if (kind === 'cos' || kind === 'stall' || kind === 'food' || o.sides === false) {
      // hanging brand sign over the open counter front
      fsign(signText, Wf / 2, 0.2, y + 3.2, Math.min(Wf * 0.85, 4.5), 0.55, { bg: sigBg, fg: sigFg, twoSided: true });
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
      fsign(name, Wf / 2, Dp - 0.48, y + 2.45, Math.min(Wf - 0.6, 3.2), 0.4, { bg: seed % 2 ? '#111' : '#f5f1ea', fg: seed % 2 ? '#fff' : '#111' });
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
    hoard({ Wf, Dp, y, H, fsign }) { fsign(['새로운 매장이 곧 오픈합니다', 'COMING SOON · SHINSEGAE'], Wf / 2, 0.02, y + 1.6, Math.min(Wf - 0.4, 5), 1.2, { bg: '#e9e1d2', fg: '#6b5434' }); void Dp; void H; },
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
      if (skip(u, v)) continue;
      box(u, v, 0.9, 0.9, y, h, cm, { skip: ['top', 'bottom'] });
      if (id !== 'B2') { box(u, v, 0.98, 0.98, y, 0.14, lux ? 0xb9a77f : 0x8a8580, { solid: false, skip: ['bottom'] }); if (lux) box(u, v, 0.98, 0.98, y + Math.min(h, 4.6) - 0.5, 0.08, 0xb9a77f, { solid: false, skip: ['bottom'] }); }
    }
  }
  function lights(y, skipRects = [], step = 6) {
    for (let u = 3.5; u < UW - 1; u += step) for (let v = 3.5; v < VD - 1; v += step) {
      if (inR(u, v, ATR, 0.8) || skipRects.some(r => inR(u, v, r, 0.6))) continue;
      lightPanel(u, v, y);
    }
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
    sign(['엘리베이터', 'ELEVATOR'], 38.55, 64.66, y + Math.min(2.4, H - 0.6), 'N', 1.5, 0.5, { bg: '#2d241c', fg: '#f3e6c8' });
    for (const u of [28.5, 38.5]) box(u, 58.5, 2.0, 0.6, y, 0.45, 0x8a6a4a);
    zone('엘리베이터 홀', id, '고객 엘리베이터 1~3호기 · 층별 안내', [24.4, 57.6, 42.6, 64.8], y, y + H, 2);
    if (id !== 'B2') zone('에스컬레이터', id, `중앙 아트리움 에스컬레이터 · ${id}`, ATR, y, y + H, 2);
  }
  function crowdAisles(y, n, seed, extra = [], vMin = 0) {
    let polys = [rect(8.6, 8.6, 58.4, 12.0), rect(8.6, 72.7, 58.4, 76.2), rect(8.6, 12.4, 12.0, 72.4), rect(54.9, 12.4, 58.4, 72.4), rect(12.4, 31.7, 54.6, 34.8), rect(12.4, 47.2, 54.6, 50.3), rect(24.3, 35.2, 27.4, 46.8), rect(39.6, 35.2, 42.7, 46.8), rect(24.4, 50.8, 42.6, 57.5), ...extra];
    if (vMin > 0) polys = polys.filter(p => p.every(q => { const dx = q[0] - OX, dz = q[1] - OZ; return dx * SA + dz * CA >= vMin - 0.01; }));
    polys.forEach((p, i) => K.crowd(p, y, Math.max(1, Math.round(n * (i < 4 ? 1.2 : 0.8) / 4)), { seed: seed * 31 + i }));
  }

  // ------------------------------------------------------------ standard upper floor
  function stdFloor(id, def) {
    const y = LV[id], H = clearH(id);
    const fl = id, sub = def.sub, up = UPPER.has(id), V0 = up ? VS : 0;
    const S = (o = {}) => ({ floor: fl, H, sub: `${def.cat} · 신세계백화점 강남점 ${fl}${up ? ' (신관)' : ''}`, ...o });
    zone('신세계백화점 강남점', fl, up ? `${sub} · 신관` : sub, [0, V0, UW, VD], y, y + H + thick(nextOf(id)), 1);
    if (!up) band(def.N, 'N', 0.25, 66.75, 0.25, 8.25, y, S({ kind: def.kind }));
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
  // 신관 upper floors: aisle along the north glass wall (looks over the 본관 roof toward 신반포로 / 한강 방면)
  function windowAisle(id, y, H, name) {
    zone(name || '전망 라운지', id, '신관 북측 유리창 · 본관 옥상 너머 신반포로 · 반포 방면 전망', [8.25, VS, 58.75, ATR[1]], y, y + H, 2);
    for (const u of [10.2, 56.8]) { box(u, VS + 0.75, 3.0, 0.5, y, 0.42, { tex: 'wood', color: 0xb08a5a }); const [x, z] = P(u - 0.6, VS + 0.75); K.person(x, y, z, { sit: true, rotY: RA + PI }); }
    for (const u of [25.9, 41.1]) { box(u, VS + 0.6, 0.7, 0.7, y, 0.6, 0x6f6a60); box(u, VS + 0.6, 0.6, 0.6, y + 0.6, 0.7, 0x4f7a45, { solid: false }); }
  }

  // ================================================================= B2 주차장
  {
    const y = LV.B2, H = clearH('B2');
    zone('신세계백화점 강남점 주차장', 'B2', '지하주차장 · 센트럴시티·JW 공용 지하주차장과 연결 · 개점 당시 3,650대', [0, 0, UW, VD], y, LV.B1, 1);
    columns('B2', y, H);
    boxR(ATR[0], ATR[1], ATR[2], ATR[3], y, H, 0xbdb8ae); // 기계실 (under the escalator stack)
    sign(['기계실', '관계자 외 출입금지'], 33.5, ATR[1] - 0.02, y + 2.2, 'N', 2.6, 0.7, { bg: '#d8d2c6', fg: '#333' });
    const obstacles = [[ATR[0] - 0.5, ATR[1] - 0.5, ATR[2] + 0.5, ATR[3] + 0.5], [27, 62, 40, 73], [24, 55, 43, 65], ...CORES.map(c => [c.uL - 0.5, c.v0 - 0.5, c.uR + 0.5, c.v1 + 0.5])];
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
    for (const v of [9.5, 29, 49.5, 69.5]) K.floorText('→  출구  EXIT', { x: P(33, v)[0], y: y + 0.02, z: P(33, v)[1], w: 6, h: 1.2, rotY: RA - PI / 2, fg: '#f2f2f2', bg: '#4d5f54' });
    // 차수문 at the vehicle entry (east wall)
    boxR(UW - 1.2, 70, UW - 0.3, 79, y, 4.2, 0x3a3a3a);
    for (let i = 0; i < 7; i++) boxR(UW - 1.3, 70 + i * 1.3, UW - 1.2, 70 + i * 1.3 + 0.65, y, 4.2, 0xf2c200, { solid: false });
    sign(['차수문 (침수 방지)', '차량 출입구 · 신반포로 방면'], UW - 1.35, 74.5, y + 3.0, 'W', 4, 0.9, { bg: '#1d1d1d', fg: '#f2c200' });
    sign(['B2 주차장', '신세계백화점 강남점'], 33.5, 64.78, y + 2.7, 'N', 2.4, 0.7, { bg: '#1f4a8a', fg: '#fff' });
    sign(['엘리베이터 · 백화점 입구'], 33.5, 58.2, y + 3.2, 'N', 3.2, 0.5, { bg: '#1f4a8a', fg: '#fff', twoSided: true });
    lights(y + H - 0.02, [], 7.5);
    K.crowd(rect(24, 58.5, 43, 63.5), y, 4, { seed: 11 });
    // parking sections (map detail) + lift lobby + vehicle gate
    for (const [nm, r] of [['A구역 (신반포로 쪽)', [0, 0, 33.5, 31.5]], ['B구역 (신반포로 · 경부선 쪽)', [33.5, 0, UW, 31.5]], ['C구역 (센트럴시티 쪽)', [0, 31.5, 24, VD]], ['D구역 (JW 메리어트 쪽)', [43, 31.5, UW, VD]]]) {
      zone(`B2 주차장 ${nm.split(' ')[0]}`, 'B2', `신세계백화점 강남점 지하주차장 ${nm}`, r, y, LV.B1, 2);
      const [cu, cv] = [(r[0] + r[2]) / 2, (r[1] + r[3]) / 2];
      box(cu, cv, 0.95, 0.95, y + H - 1.3, 0.9, 0x1f4a8a, { solid: false });
      for (const f of ['N', 'S', 'E', 'W']) { const o = { N: [0, -0.49], S: [0, 0.49], E: [0.49, 0], W: [-0.49, 0] }[f]; sign(nm.split(' ')[0].replace('구역', ''), cu + o[0], cv + o[1], y + H - 0.85, f, 0.8, 0.8, { bg: '#1f4a8a', fg: '#fff' }); }
    }
    zone('엘리베이터 홀 · 백화점 입구', 'B2', '고객 엘리베이터 1~3호기 → B1 식품관 · 1F', [24, 57.6, 43, 64.8], y, LV.B1, 3);
    zone('차량 출입구 · 차수문', 'B2', '서울 최대급 차수문 (2026) · 입출차 램프', [UW - 8, 68, UW, VD], y, LV.B1, 3);
  }

  // ================================================================= B1 식품관
  {
    const id = 'B1', y = LV.B1, H = clearH('B1'), fl = 'B1';
    const sub = (s) => `${s} · 신세계백화점 강남점 B1`;
    const S = (cat, o = {}) => ({ floor: fl, H, sub: sub(cat), ...o });
    zone('신세계백화점 강남점', fl, '식품관 · 신세계 마켓 · 스위트파크 · 델리 전문관 · 하우스 오브 신세계 푸드홀', [0, 0, UW, VD], y, LV['1F'] - TH['1F'], 1);
    zone('신세계 마켓', fl, '신선식품 · 프리미엄 가정식 · 그로서리 (2025.2 리뉴얼, 600평)', [0.25, 0.25, 24.1, 31.5], y, y + H, 2);
    zone('스위트파크', fl, '디저트 전문관 · 국내 최대 디저트 홀', [12.25, 35, 24.1, 72.5], y, y + H, 2);
    zone('델리 전문관', fl, '아시안 · 한식 · 양식 라이브 키친 (2025.8, 3,960㎡)', [42.9, 12.25, UW, 76.5], y, y + H, 2);
    zone('하우스 오브 신세계 푸드홀', fl, 'JW 메리어트 연결 · 프리미엄 푸드홀 (2024.6)', [5.8, 72.5, UW, VD], y, y + H, 2);
    // --- 신세계 마켓 (NW): checkouts, produce, gondolas, service counters
    sign(['SHINSEGAE MARKET', '신세계 마켓'], 12, 8.4, y + 3.6, 'S', 9, 1.1, { bg: '#1f3a2a', fg: '#f3ecd8', twoSided: true });
    for (let i = 0; i < 6; i++) { const u = 3 + i * 3.6; box(u, 5.5, 2.0, 0.8, y, 0.9, 0xe8e2d6); box(u - 0.6, 5.5, 0.4, 0.3, y + 0.9, 0.35, 0x2a2a2a, { solid: false }); sign(`계산대 ${i + 1}`, u, 5.5, y + 2.4, 'S', 1.0, 0.3, { bg: '#1f3a2a', fg: '#fff', twoSided: true }); box(u, 5.5, 0.06, 0.06, y + 0.9, 1.3, 0x888888, { solid: false }); }
    for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) {
      const u = 13 + i * 4, v = 11.5 + j * 3.6;
      box(u, v, 3.0, 1.6, y, 0.75, { tex: 'wood', color: 0xb08a5a });
      for (let k = 0; k < 4; k++) box(u - 1.1 + k * 0.73, v, 0.6, 1.3, y + 0.75, 0.18, [0xd03a2a, 0xf0a020, 0x6ab040, 0xf0d040, 0x9a3a6a][(i + j + k) % 5], { solid: false });
    }
    sign('청과', 17, 10, y + 3.0, 'S', 1.6, 0.45, { bg: '#2f6a2a', fg: '#fff', twoSided: true });
    for (let j = 0; j < 4; j++) { const v = 20 + j * 2.8; box(17.5, v, 10, 0.9, y, 1.7, 0xeeeae2); for (let k = 0; k < 3; k++) box(17.5, v, 9.8, 0.95, y + 0.3 + k * 0.48, 0.2, GARMENT[(j + k) % GARMENT.length], { solid: false }); }
    sign('그로서리 · 가공식품', 17.5, 18.6, y + 3.0, 'S', 3.0, 0.45, { bg: '#2f6a2a', fg: '#fff', twoSided: true });
    band(['정육#food', '수산#food', '프리미엄 가정식#food'], 'W', 8.25, 38, 0.25, 8.25, y, S('신세계 마켓', { back: false }));
    // --- north band (J1 entrance is u 35.2..44.1)
    shop({ u0: 24.1, u1: 35, v0: 0.25, v1: 8.25, f: 'S', name: 'INTELLIGENTSIA COFFEE|인텔리젠시아 커피', kind: 'cafe', y, ...S('카페') });
    shop({ u0: 44.3, u1: 53, v0: 0.25, v1: 8.25, f: 'S', name: 'JOHNNY ROCKETS|조니 로켓', kind: 'rest', y, ...S('버거 다이너'), fascia: 0xb01c24, bg: '#b01c24', fg: '#fff' });
    shop({ u0: 53, u1: 61.4, v0: 0.25, v1: 8.25, f: 'S', name: '오설록', kind: 'cafe', y, ...S('티 하우스') });
    shop({ u0: 61.4, u1: 66.75, v0: 0.25, v1: 9.6, f: 'S', name: '전통주 전문관', kind: 'wine', y, ...S('전통주') });
    sign(['신세계 강남점 식품관', 'SHINSEGAE FOOD HALL'], 39.65, 0.45, y + 3.88, 'S', 5.2, 0.8, { bg: '#2d241c', fg: '#f3e6c8' });
    sign(['고투몰 · 고속터미널역 3·7·9호선'], 39.65, 2.6, y + 2.9, 'S', 5, 0.42, { bg: '#1f4a8a', fg: '#fff', twoSided: true });
    // --- central north island: 웰니스바 / 바위파스타바 (OSM POI)
    shop({ u0: 27.6, u1: 33.5, v0: 16, v1: 28, f: 'W', name: '웰니스바', kind: 'stall', y, ...S('주스 · 샐러드'), back: true });
    shop({ u0: 33.5, u1: 39.4, v0: 16, v1: 28, f: 'E', name: '바위파스타바', kind: 'rest', y, ...S('파스타 · 와인바'), back: true });
    // --- 스위트파크 (W island) + 도쿄밀크치즈팩토리 (OSM POI)
    island(['스위트파크 · 케이크#stall', '스위트파크 · 베이커리#stall', '스위트파크 · 초콜릿#stall', 'TOKYO MILK CHEESE FACTORY|도쿄밀크치즈팩토리#stall', '시화당#stall', '블루 버터플라이#stall'], 12.25, 24.1, 35, 47, y, S('스위트파크'));
    island(['스위트파크 · 아이스크림#stall', '스위트파크 · 마카롱#stall', '스위트파크 · 구움과자#stall', '교토 오니마루#stall'], 12.25, 24.1, 50.5, 72.5, y, S('스위트파크'));
    sign(['SWEET PARK', '스위트파크'], 18.2, 34.8, y + 3.7, 'N', 6, 1.0, { bg: '#f4d7d9', fg: '#7a2a3a', twoSided: true });
    // --- 델리 전문관 (E band + E islands)
    band(['새벽종#food', '수퍼판 델리#food', '해방촌닭#food', '화돈점정#food', '서연#food'], 'E', 24.2, 76.5, 58.75, 66.75, y, S('델리 전문관'));
    island(['보앤미#stall', '와사비 그린#stall', '스시도쿠#food', '베지 스튜디오#stall'], 42.9, 54.75, 12.25, 31.5, y, S('델리 전문관'));
    island(['마켓 레인#stall', '타르투플랑게#stall'], 42.9, 54.75, 35, 47, y, S('델리 전문관 · 프리미엄'));
    island(['프루니에#stall', '와인하우스#wine', '수제 반찬#stall', '즉석 떡 · 한과#stall'], 42.9, 54.75, 50.5, 72.5, y, S('델리 전문관'));
    sign(['DELI', '델리 전문관'], 56.8, 11, y + 3.6, 'S', 5, 0.9, { bg: '#1e1a16', fg: '#ffd9a0', twoSided: true });
    // --- west band south of the 센트럴시티 passage
    band(['와인하우스#wine', '하우스 오브 신세계 와인 바#wine'], 'W', 47, 61.8, 0.25, 8.25, y, S('와인'));
    sign(['← 센트럴시티 · 호남선 터미널', '메가박스 · 영풍문고'], 5, 42.6, y + 3.4, 'E', 4.2, 0.8, { bg: '#1f4a8a', fg: '#fff', twoSided: true });
    // --- 하우스 오브 신세계 푸드홀 (south band, JW side)
    band(['하우스 오브 신세계 · 한식#food', '하우스 오브 신세계 · 일식#food', '하우스 오브 신세계 · 중식#food', '하우스 오브 신세계 · 양식#food', '하우스 오브 신세계 · 베이커리#stall'], 'S', 5.8, 66.75, 76.5, 84.45, y, S('하우스 오브 신세계 푸드홀'));
    faceLetters('ssg_hos', 'N', 33.5, y + 3.6, 8, 1.2, -76.3);
    // --- food court tables in front of the elevators
    for (let i = 0; i < 4; i++) for (let j = 0; j < 2; j++) {
      const u = 26.5 + i * 4.3, v = 52.5 + j * 3.2; box(u, v, 1.2, 0.9, y, 0.74, 0xf2ede4);
      box(u - 0.9, v, 0.42, 0.42, y, 0.45, 0x5a4636, { solid: false }); box(u + 0.9, v, 0.42, 0.42, y, 0.45, 0x5a4636, { solid: false });
      if ((i + j) % 2 === 0) { const [x, z] = P(u - 0.9, v); K.person(x, y, z, { sit: true }); }
    }
    // display island under the C/D escalator lanes (they continue up from 1F)
    boxR(35.8, ATR[1], 39.4, ATR[3], y, 0.9, 0xf3efe8);
    for (let i = 0; i < 4; i++) box(37.6, ATR[1] + 1.5 + i * 3, 2.6, 2.2, y + 0.9, 0.5, [0xd89048, 0xf0d8c0, 0x9a4a2a, 0xe8c070][i], { solid: false });
    sign(['SWEET PARK', '스위트파크 시즌 디저트'], 39.42, 41, y + 1.8, 'E', 3, 0.7, { bg: '#f4d7d9', fg: '#7a2a3a' });
    columns(id, y, H, (u, v) => (u === 24.1 && v === 31.5));
    lights(y + H - 0.02, []);
    restrooms(id, y, H); elevatorHall(id, y, H);
    crowdAisles(y, 26, 99, [rect(35.5, 1, 44, 11), rect(24.3, 12.4, 27.4, 31)]);
  }

  // ================================================================= 1F
  {
    const id = '1F', y = 0, H = clearH('1F'), fl = '1F';
    const S = (cat, o = {}) => ({ floor: fl, H, sub: `${cat} · 신세계백화점 강남점 1F`, ...o });
    zone('신세계백화점 강남점', fl, '화장품 · 해외유명브랜드 · 잡화 (국내 최대 화장품관)', [0, 0, UW, VD], y, LV['2F'], 1);
    // north band boutiques between the two 신반포로 entrances
    shop({ u0: 0.25, u1: 14.6, v0: 0.25, v1: 8.25, f: 'S', name: 'HERMÈS|에르메스', kind: 'lux', y, ...S('해외유명브랜드'), H: 6.5, portal: 0xe8dcc8 });
    shop({ u0: 21.4, u1: 33, v0: 0.25, v1: 8.25, f: 'S', name: 'CHANEL|샤넬', kind: 'lux', y, ...S('해외유명브랜드'), H: 6.5, portal: 0x1d1c1b });
    shop({ u0: 33, u1: 46.6, v0: 0.25, v1: 8.25, f: 'S', name: 'LOUIS VUITTON|루이 비통', kind: 'lux', y, ...S('해외유명브랜드'), H: 6.5, portal: 0x3a2f28 });
    shop({ u0: 53.4, u1: 66.75, v0: 0.25, v1: 9.6, f: 'S', name: 'FENDI|펜디', kind: 'lux', y, ...S('해외유명브랜드'), H: 6.5, portal: 0xd9cbb3 });
    // east band (between 동문 entrances)
    shop({ u0: 58.75, u1: 66.75, v0: 33.4, v1: 47, f: 'W', name: 'BURBERRY|버버리', kind: 'lux', y, ...S('해외유명브랜드'), H: 6.5, portal: 0xcfb894 });
    shop({ u0: 58.75, u1: 66.75, v0: 47, v1: 60.6, f: 'W', name: 'MAISON MARGIELA|메종 마르지엘라', kind: 'lux', y, ...S('해외유명브랜드'), H: 6.5, portal: 0xefe9df });
    shop({ u0: 58.75, u1: 66.75, v0: 67.4, v1: 76.5, f: 'W', name: 'BAG GALLERY|백 갤러리', kind: 'bag', y, ...S('잡화'), H: 6.5, portal: 0x2a2420 });
    shop({ u0: 58.75, u1: 66.75, v0: 24.2, v1: 26.6, f: 'W', name: '고객 라운지', kind: 'service', y, ...S('서비스'), zone: true });
    // west band: 스타벅스, 조 말론, (J4 passage), 르 라보
    shop({ u0: 0.25, u1: 8.25, v0: 8.25, v1: 22, f: 'E', name: 'STARBUCKS|스타벅스 센트럴시티점', kind: 'cafe', y, ...S('카페'), fascia: 0x00704a, bg: '#00704a', fg: '#fff', H: 4.4 });
    shop({ u0: 0.25, u1: 8.25, v0: 22, v1: 38, f: 'E', name: 'JO MALONE LONDON|조 말론 런던', kind: 'cos', y, ...S('향수'), H: 4.4 });
    shop({ u0: 0.25, u1: 8.25, v0: 47, v1: 61.8, f: 'E', name: 'LE LABO|르 라보', kind: 'cos', y, ...S('향수'), H: 4.4 });
    sign(['← 센트럴시티 중앙광장', '호남선 터미널 · 메가박스'], 4.5, 42.6, 3.8, 'E', 4.4, 0.8, { bg: '#1f4a8a', fg: '#fff', twoSided: true });
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
    island(cos.slice(12, 16), 18.2, 24.1, 60, 72.5, y, S('화장품', { kind: 'cos', H: 3.2 }));
    island(cos.slice(16, 20), 42.9, 48.8, 60, 72.5, y, S('화장품', { kind: 'cos', H: 3.2 }));
    shop({ u0: 8.6, u1: 18.2, v0: 64, v1: 72.5, f: 'N', name: 'AESOP|이솝', kind: 'cos', y, ...S('화장품'), H: 3.2 });
    shop({ u0: 48.8, u1: 58.4, v0: 64, v1: 72.5, f: 'N', name: 'HOURGLASS|아워글래스', kind: 'cos', y, ...S('화장품'), H: 3.2 });
    // THE STAGE pop-up (central north)
    shop({ u0: 27.6, u1: 39.4, v0: 14, v1: 29, f: 'S', name: 'THE STAGE|더 스테이지', kind: 'popup', y, ...S('럭셔리 팝업'), sides: false, back: false });
    sign(['THE STAGE', '더 스테이지 · 럭셔리 팝업'], 33.5, 21.5, 4.8, 'N', 6, 1.0, { bg: '#111', fg: '#f3e6c8', twoSided: true });
    // information desks at the 신반포로 entrances
    for (const u of [18, 50]) { box(u, 11.3, 3.2, 0.9, y, 1.05, 0xe8dcc6); sign('안내데스크 INFORMATION', u, 11.3, 2.3, 'N', 2.6, 0.4, { bg: '#2d241c', fg: '#f3e6c8', twoSided: true }); const [x, z] = P(u, 11.95); K.person(x, y, z, { shirt: 0x2a2420 }); }
    // welcome panels on the island ends facing the 신반포로 entrances (entrance axis feature)
    for (const u of [18, 50]) {
      box(u, 12.17, 5.4, 0.08, 1.1, 3.1, 0x6b5434, { solid: false });
      sign(['SHINSEGAE', '신세계백화점 강남점'], u, 12.1, 3.45, 'N', 4.9, 1.2, { bg: '#2d241c', fg: '#f3e6c8' });
      sign(['1F 화장품 · 해외유명브랜드 · 잡화', '1M 하우스 오브 신세계 · B1 식품관'], u, 12.1, 1.5, 'N', 4.9, 0.4, { bg: '#2d241c', fg: '#d9c9a4', bold: false });
    }
    // grand stairs up to the 1M mezzanine
    for (const u of [15.2, 52.2]) { const a = P(u, 50.7), b = P(u, 58); K.stairs(a[0], a[1], b[0], b[1], { w: 3.6, ya: 0, yb: LV['1M'], mat: 'marble', railMat: 0xb9a77f }); }
    sign(['1M 메자닌 ↑', '하우스 오브 신세계 · 버건디& · 퍼퓸'], 15.2, 50.4, 2.9, 'N', 3.4, 0.7, { bg: '#2d241c', fg: '#e9dcc0', twoSided: true });
    sign(['1M 메자닌 ↑', '분더샵 메자닌 · 퍼스널 쇼퍼룸'], 52.2, 50.4, 2.9, 'N', 3.4, 0.7, { bg: '#2d241c', fg: '#e9dcc0', twoSided: true });
    columns(id, y, H, (u, v) => v === 50.5 && (u === 24.1 || u === 42.9) ? false : false);
    lights(y + H - 0.02, []);
    for (let u = 9.5; u < 60; u += 5) for (let v = 60.5; v < 84; v += 5) if (!inR(u, v, [27.6, 64.5, 39.4, 72.5], 0.3)) lightPanel(u, v, LV['1M'] - TH['1M'] - 0.02, 0.9, 0.9);
    restrooms(id, y, 3.2); elevatorHall(id, y, 3.2);
    sign('1F  화장품 · 해외유명브랜드', 25.4, 33, 3.4, 'N', 3.2, 0.5, { bg: '#2d241c', fg: '#f3e6c8', twoSided: true });
    // chandelier strips over the luxury hall
    for (let i = 0; i < 6; i++) box(33.5, 15.5 + i * 2.2, 11, 0.1, 6.1, 0.08, { tex: 'emit', color: 0xffe9c0 }, { solid: false });
    crowdAisles(y, 30, 1, [rect(14.6, 0.5, 21.4, 11.8), rect(46.6, 0.5, 53.4, 11.8), rect(59, 26.8, 66.5, 33.2), rect(59, 60.8, 66.5, 67.2), rect(0.5, 38.8, 12, 46.4), rect(31, 72.8, 36.6, 84)]);
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
    sign(['HOUSE OF SHINSEGAE', '하우스 오브 신세계'], 33.5, 58.3, 6.0, 'N', 7, 0.8, { bg: '#2d241c', fg: '#e9dcc0', twoSided: true });
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
      sign(['EVENT HALL', '8F 이벤트홀 · 시즌 대전'], 48.8, 12.4, y + 3.3, 'N', 5.5, 0.8, { bg: '#7a1c1c', fg: '#fff', twoSided: true });
      for (let i = 0; i < 3; i++) for (let j = 0; j < 8; j++) {
        const u = 45 + i * 3.8, v = 15 + j * 7;
        box(u, v, 1.8, 0.06, y + 1.55, 0.05, 0x9a9a9a, { solid: false });
        box(u, v, 1.6, 0.5, y + 0.55, 1.0, { tex: 'ssg_rack', color: GARMENT[(i * 3 + j) % GARMENT.length] });
        if (j % 2) box(u, v + 3, 1.6, 1.0, y, 0.85, 0xe8e2d8);
      }
      sign(['SALE', '시즌 오프 대전'], 48.8, 42, y + 2.9, 'N', 3, 0.8, { bg: '#c01c1c', fg: '#fff', twoSided: true });
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
    // S GARDEN: indoor garden with planters, trees and benches around the atrium
    zone('S GARDEN', fl, '실내 정원 · 휴게 공간 · 전문식당가 대기석', [12.25, ATR[1], 54.75, 57.5], y, y + H, 2);
    zone('식당가 대기석', fl, '웨이팅 키오스크 · 대기 의자', [24.4, 47.6, 42.6, 57.4], y, y + H, 2.2);
    sign(['S GARDEN', '에스 가든'], 33.5, 48.6, y + 3.3, 'S', 5, 0.8, { bg: '#2f5a35', fg: '#eaf4e0', twoSided: true });
    for (const [u0, v0, u1, v1] of [[13, 36, 23, 46], [44, 36, 54, 46], [13, 50, 23, 56.5], [44, 50, 54, 56.5]]) {
      boxR(u0, v0, u1, v1, y, 0.5, 0x8a7a66);
      hq(u0 + 0.2, v0 + 0.2, u1 - 0.2, v1 - 0.2, y + 0.51, { tex: 'grass', color: 0x7aa060 });
      for (let k = 0; k < 3; k++) { const [x, z] = P(u0 + (u1 - u0) * (0.25 + k * 0.25), (v0 + v1) / 2); K.tree(x, z, { y: y + 0.5, h: 3.4, kind: k % 2 ? 'ginkgo' : 'zelkova' }); }
      box((u0 + u1) / 2, v1 + 0.6, u1 - u0 - 2, 0.5, y, 0.45, { tex: 'wood', color: 0xb08a5a });
    }
    // waiting seats + kiosks in front of the lift lobby
    for (let i = 0; i < 4; i++) { box(27 + i * 4.3, 50.2, 2.6, 0.55, y, 0.45, { tex: 'wood', color: 0x8a6448 }); const [x, z] = P(27 + i * 4.3, 50.2); if (i % 2) K.person(x, y, z, { sit: true }); }
    for (const u of [25.2, 41.8]) { box(u, 53, 0.6, 0.5, y, 1.5, 0x2a2a2a); box(u, 52.74, 0.5, 0.02, y + 0.8, 0.6, { tex: 'emit', color: 0x9ac8f0 }, { solid: false }); sign('웨이팅 접수', u, 52.7, y + 1.75, 'N', 0.9, 0.25, { bg: '#2d241c', fg: '#f3e6c8' }); }
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
    const xs = [-79, -74, -66, -61];
    const env = [[-79, gZ(-79)], [-61, gZ(-61)], [-61, sZ(-61)], [-79, sZ(-79)]];
    K.slab(env, y, { mat: { tex: 'marble', color: 0xf0ebe2 }, thick: 0.4, edge: false, under: false });
    K.hpoly(CEIL, env, top, false);
    K.phys.addCeiling(env, top, {});
    // side walls
    K.wall(-79, gZ(-79), -79, sZ(-79), y, top, { mat: 0xe9e4da, thick: 0.25 });
    K.wall(-61, gZ(-61), -61, sZ(-61), y, top, { mat: 0xe9e4da, thick: 0.25 });
    // end walls beside the 8 m GOTO opening (GOTO's own wall may also be there)
    K.wall(-79, gZ(-79) + 0.3, -74, gZ(-74) + 0.3, y, top, { mat: 0xe9e4da, thick: 0.2 });
    K.wall(-66, gZ(-66) + 0.3, -61, gZ(-61) + 0.3, y, top, { mat: 0xe9e4da, thick: 0.2 });
    // shop units both sides (world frame)
    const unit = (x0, x1, z0, z1, front, name, kind, cat) => {
      const fx = front === 'E' ? x1 : x0;
      K.wall(x0, z1, x1, z1, y, top, { mat: 0xf3efe8, thick: 0.12 }); K.wall(x0, z0, x1, z0, y, top, { mat: 0xf3efe8, thick: 0.12 });
      const rot = front === 'E' ? PI / 2 : -PI / 2;
      K.box({ x: fx, y: top - 0.6, z: (z0 + z1) / 2, w: z1 - z0, h: 0.6, d: 0.25, rotY: rot, mat: 0x2d241c, solid: false });
      K.sign(name, { x: fx + (front === 'E' ? 0.15 : -0.15), y: top - 0.3, z: (z0 + z1) / 2, w: Math.min(5, (z1 - z0) * 0.8), h: 0.42, rotY: rot, bg: '#2d241c', fg: '#f3e6c8' });
      const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
      if (kind === 'counter') { K.box({ x: cx, y, z: cz, w: 1.0, h: 0.95, d: (z1 - z0) * 0.6, mat: 0xe8dcc6 }); }
      else if (kind === 'flower') { for (let k = 0; k < 4; k++) K.box({ x: cx, y, z: z0 + 1.2 + k * (z1 - z0 - 2.4) / 3, w: 1.6, h: 0.8, d: 0.9, mat: [0xd04a6a, 0xf0c040, 0xe8e0f0, 0x6ab060][k] }); }
      else { for (let k = 0; k < 2; k++) K.box({ x: cx, y, z: z0 + (z1 - z0) * (0.33 + k * 0.34), w: 1.4, h: 0.9, d: 1.2, mat: 0xf3efe8 }); }
      K.zone({ name: name.split('|').pop(), floor: 'B1', sub: `${cat} · 신세계 강남점 연결통로`, poly: [[x0, z0], [x1, z0], [x1, z1], [x0, z1]], y0: y, y1: top, priority: 3 });
      K.hpoly({ tex: 'wood', color: 0xd8c4a8 }, [[x0 + 0.1, z0 + 0.1], [x1 - 0.1, z0 + 0.1], [x1 - 0.1, z1 - 0.1], [x0 + 0.1, z1 - 0.1]], y + 0.012);
    };
    const wN = -82.4, wS = -40.2, eN = -87.4, eS = -44.6;
    const W = [['신세계 상품권 · 사은행사', 'counter', '고객 서비스'], ['SSG 팝업 스토어', 'popup', '팝업'], ['플라워 숍', 'flower', '꽃'], ['스위트파크 테이크아웃', 'counter', '디저트']];
    const E = [['신세계 팝업 갤러리', 'popup', '팝업'], ['스위트파크 픽업 존', 'counter', '디저트'], ['델리 테이크아웃', 'counter', '델리'], ['물품 보관함 · 수유실', 'counter', '편의시설']];
    W.forEach(([n, k, c], i) => { const z0 = wN + i * (wS - wN) / W.length, z1 = wN + (i + 1) * (wS - wN) / W.length; unit(xs[0], xs[1], z0, z1, 'E', n, k, c); });
    E.forEach(([n, k, c], i) => { const z0 = eN + i * (eS - eN) / E.length, z1 = eN + (i + 1) * (eS - eN) / E.length; unit(xs[2], xs[3], z0, z1, 'W', n, k, c); });
    // ad light boxes on the walkway side pillars + hanging direction signs
    for (let z = -80; z < -44; z += 9) { K.box({ x: -74, y, z, w: 0.6, h: top - y, d: 0.6, mat: 0xe9e4da }); K.box({ x: -66, y, z: z + 4, w: 0.6, h: top - y, d: 0.6, mat: 0xe9e4da }); }
    K.sign(['신세계백화점 강남점 식품관 ↓', '스위트파크 · 신세계 마켓 · 하우스 오브 신세계'], { x: -70, y: top - 0.55, z: -78, w: 6.5, h: 0.75, rotY: PI, bg: '#2d241c', fg: '#f3e6c8' });
    K.sign(['고투몰 · 고속터미널역 3·7·9호선 ↑'], { x: -70, y: top - 0.45, z: -50, w: 6.0, h: 0.5, rotY: 0, bg: '#1f4a8a', fg: '#fff' });
    K.sign(['SHINSEGAE', '신세계 강남점 연결통로'], { x: -70, y: top - 0.55, z: -50.05, w: 5.0, h: 0.75, rotY: PI, bg: '#2d241c', fg: '#f3e6c8' });
    for (let z = -84; z < -40; z += 3) K.quad({ tex: 'emit', color: 0xfff6e6 }, [[-71.5, top - 0.02, z], [-68.5, top - 0.02, z], [-68.5, top - 0.02, z + 0.5], [-71.5, top - 0.02, z + 0.5]], [0, -1, 0]);
    K.zone({ name: '신세계 강남점 연결통로', floor: 'B1', sub: '고투몰(강남터미널 지하쇼핑몰) ↔ 신세계 식품관', poly: env, y0: y, y1: top, priority: 2 });
    K.crowd([[-73.5, -84], [-66.5, -86.5], [-66.5, -42], [-73.5, -39]], y, 14, { seed: 4141 });
  }

  // ================================================================= spawns
  const sp = (name, u, v, y, du, dv) => { const [x, z] = P(u, v); K.spawn({ name, x, y, z, yaw: yawTo(du, dv) }); };
  sp('신세계 강남점 정문 (신반포로)', 18, -9, 0, 0, 1);
  sp('신세계 강남점 동문 (경부선 터미널 방면)', UW + 8, 30, 0, -1, 0);
  sp('1F 화장품 · 해외유명브랜드', 26, 33, 0, 0, 1);
  sp('1M 하우스 오브 신세계 메자닌', 33.5, 61, LV['1M'], 0, -1);
  sp('B1 식품관 · 스위트파크', 26, 49, LV.B1, 1, 0);
  sp('4F 그랜드 슈', 41.2, 41, LV['4F'], 0, 1);
  sp('11F 전문식당가 · S GARDEN', 26, 41, LV['11F'], 1, 0);
  K.spawn({ name: 'B1 고투몰 ↔ 신세계 연결통로', x: -70, y: LV.B1, z: -70, yaw: PI });
}
