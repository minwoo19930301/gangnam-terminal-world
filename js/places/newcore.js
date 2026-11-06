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
    'https://www.elandretail.com/store02.do?BDID=0003003B&branchID=00110001&lang=000600KO',
    'https://www.elandretail.com/store05.do?branchID=00110001&lang=000600KO',
    'https://m.blog.naver.com/cherish37/224465298452',
    'https://m.blog.naver.com/love__lover/224464082861',
    '.codex-jobs/evidence/walk_s1_banpo_newcore.json',
    'https://www.youtube.com/watch?v=qZYgbakp2UA',
    'https://www.youtube.com/watch?v=T92eDMIb3vE'],
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
    // Interlocking 1:2 bricks, not disconnected rectangles. 10 x 20 cm.
    g.fillStyle = '#504f49'; g.fillRect(0, 0, w, h);
    const rand = K.rand(933), pal = ['#86857a', '#a29b89', '#747870', '#969382'];
    for (let row = -8; row < 16; row++) for (let col = -8; col < 16; col++) {
      const x = (col * 2 + row) * 64, yy = row * 64 - col * 2 * 64;
      g.fillStyle = pal[Math.floor(rand() * pal.length)]; g.fillRect(x + 2, yy + 2, 124, 60);
      g.fillStyle = pal[Math.floor(rand() * pal.length)]; g.fillRect(x + 130, yy - 62, 60, 124);
    }
    for (let i = 0; i < 18000; i++) { g.fillStyle = i % 2 ? 'rgba(255,255,242,.07)' : 'rgba(29,29,24,.09)'; g.fillRect(rand() * w, rand() * h, 2, 2); }
  }, [0.8, 0.8]);
  for (const [key, base, scale] of [['newcore-polished-stone', '#b8afa0', 0.6], ['newcore-grey-paving', '#a6a399', 0.3]]) {
    K.texture(key, 256, 256, (g, w, h) => {
      const rand = K.rand(904); g.fillStyle = base; g.fillRect(0, 0, w, h);
      for (let i = 0; i < 6500; i++) { g.fillStyle = i % 2 ? 'rgba(247,241,218,.09)' : 'rgba(63,57,48,.07)'; g.fillRect(rand() * w, rand() * h, 3, 2); }
      g.strokeStyle = '#817e75'; g.lineWidth = 2; g.strokeRect(0, 0, w, h);
    }, [scale, scale]);
  }
  K.texture('newcore-plaster', 256, 256, (g, w, h) => {
    const rand = K.rand(907); g.fillStyle = '#ebe9df'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 9000; i++) { g.fillStyle = i % 2 ? '#dbd9cf' : '#f3f0e8'; g.fillRect(rand() * w, rand() * h, 1, 2); }
  }, [0.8, 0.8]);
  K.texture('newcore-ash', 512, 256, (g, w, h) => {
    const rand = K.rand(913); g.fillStyle = '#d8bb87'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 180; i++) { const yy = rand() * h; g.strokeStyle = i % 3 ? 'rgba(157,120,65,.18)' : 'rgba(247,229,179,.5)'; g.lineWidth = 1; g.beginPath(); g.moveTo(0, yy); g.bezierCurveTo(w / 3, yy - 5, w * 0.7, yy + 5, w, yy); g.stroke(); }
  }, [1.35, 0.8]);
  K.texture('newcore-subway-tile', 512, 256, (g, w, h) => {
    g.fillStyle = '#c0bcac'; g.fillRect(0, 0, w, h);
    for (let row = 0; row < 4; row++) for (let col = -1; col < 4; col++) {
      const x = col * 192 + (row % 2) * 96, yy = row * 64;
      g.fillStyle = '#ede9da'; g.fillRect(x + 2, yy + 2, 188, 60);
      g.fillStyle = '#fcf9ee'; g.fillRect(x + 4, yy + 3, 184, 2);
    }
  }, [0.8, 0.4]);
  K.texture('newcore-market-floor', 256, 256, (g, w, h) => {
    const rand = K.rand(941); g.fillStyle = '#bcbdb7'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 5000; i++) {
      g.fillStyle = i % 2 ? 'rgba(255,255,250,.12)' : 'rgba(52,57,55,.08)';
      g.fillRect(rand() * w, rand() * h, 2, 2);
    }
    g.strokeStyle = '#969b96'; g.lineWidth = 1.5; g.strokeRect(0, 0, w, h);
  }, [0.6, 0.6]);
  K.texture('newcore-shelf-label', 384, 160, (g, w, h) => {
    g.fillStyle = '#e3e5de'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#fafbf4'; g.fillRect(10, 9, w - 20, h - 18);
    g.fillStyle = '#353d3c'; g.font = '26px sans-serif'; g.fillText('상품 안내', 24, 44);
    // Tiny catalogue/barcode marks. Do not invent current grocery prices.
    for (let i = 0; i < 38; i++) g.fillRect(24 + i * 4, 62, i % 3 ? 2 : 3, 37);
    for (let i = 0; i < 3; i++) g.fillRect(24, 113 + i * 9, 122 - i * 17, 3);
    g.font = 'bold 39px sans-serif'; g.fillText('가격표', 195, 110);
  }, [1, 1]);
  K.texture('newcore-condiment-label', 256, 256, (g, w, h) => {
    g.fillStyle = '#e6d7a2'; g.fillRect(0, 0, w, h);
    g.strokeStyle = '#96905b'; g.lineWidth = 3; g.strokeRect(10, 10, w - 20, h - 20);
    g.fillStyle = '#3e432d'; g.textAlign = 'center'; g.font = 'bold 62px sans-serif'; g.fillText('조미료', w / 2, 115);
    for (let i = 0; i < 5; i++) g.fillRect(56, 153 + i * 10, 144 - i * 13, 3);
  }, [1, 1]);
  K.texture('newcore-dry-grocery', 256, 384, (g, w, h) => {
    g.fillStyle = '#e4d6b5'; g.fillRect(0, 0, w, h); g.fillStyle = '#9a3a2e'; g.fillRect(20, 18, 67, 45);
    g.fillStyle = '#3d352c'; g.textAlign = 'center'; g.font = 'bold 43px sans-serif'; g.fillText('무침가루', w / 2, 120);
    g.fillStyle = '#cdb58f'; g.beginPath(); g.ellipse(128, 244, 95, 69, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#786846'; g.font = '24px sans-serif'; g.fillText('간편한 요리', w / 2, 349);
  }, [1, 1]);
  foodTextures(K);
}

function arch(F, u, span, label, awning = C.black, height = 9.65, opaque = false) {
  const { K, P, B, S, angle } = F, r = span / 2 - 0.65, spring = height - r;
  const infill = opaque ? 0x777d7d : { color: 0x7b9390, gloss: 0.3 };
  B(u, 3.35, -0.12, span - 1.05, height - 3.25, 0.16, 'newcore-blue-tile', { solid: false });
  B(u, 3.35, -0.24, r * 2, spring - 3.3, 0.08, infill, { solid: false });
  const pt = (uu, y, v) => { const [x, z] = P(uu, v); return [x, y, z]; };
  const normal = [Math.sin(angle + Math.PI), 0, Math.cos(angle + Math.PI)];
  for (let j = 0; j < 24; j++) {
    const a = j * Math.PI / 24, b = (j + 1) * Math.PI / 24;
    K.quad(infill, [pt(u, spring, -0.25), pt(u + Math.cos(a) * r, spring + Math.sin(a) * r, -0.25), pt(u + Math.cos(b) * r, spring + Math.sin(b) * r, -0.25), pt(u, spring, -0.25)], normal);
    for (const [rr, thick, v, mat] of [[r, 0.18, -0.38, C.stone], [r + 0.2, 0.33, -0.48, C.trim], [r + 0.55, 0.12, -0.34, C.stone]]) {
      const q = [pt(u + Math.cos(a) * rr, spring + Math.sin(a) * rr, v), pt(u + Math.cos(a) * (rr + thick), spring + Math.sin(a) * (rr + thick), v), pt(u + Math.cos(b) * (rr + thick), spring + Math.sin(b) * (rr + thick), v), pt(u + Math.cos(b) * rr, spring + Math.sin(b) * rr, v)];
      K.quad(mat, q, normal);
      K.quad(C.cream, [q[1], q[2], pt(u + Math.cos(b) * (rr + thick), spring + Math.sin(b) * (rr + thick), 0), pt(u + Math.cos(a) * (rr + thick), spring + Math.sin(a) * (rr + thick), 0)], normal);
    }
  }
  // Window bars terminate at the arch, rather than stopping in mid glazing.
  if (!opaque) {
    for (const du of [-r * 0.5, 0, r * 0.5]) {
      const top = spring + Math.sqrt(r * r - du * du);
      B(u + du, 3.45, -0.31, 0.045, top - 3.45, 0.055, 0x535b57, { solid: false });
    }
    for (let y = 4.45; y < height - 0.35; y += 1.1) {
      const half = y <= spring ? r : Math.sqrt(Math.max(0, r * r - (y - spring) ** 2));
      B(u, y, -0.31, half * 2, 0.035, 0.055, 0x616861, { solid: false });
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
  const awningTop = opaque ? 4.3 : 3.7;
  K.quad(awning, [pt(u - aw / 2, awningTop, -0.3), pt(u + aw / 2, awningTop, -0.3), pt(u + aw / 2, 2.95, -2), pt(u - aw / 2, 2.95, -2)], [0, 1, 0]);
  B(u, 2.70, -1.98, aw, 0.25, 0.08, awning, { solid: false }); S(label, u, 2.84, -2.04, Math.min(aw - 0.5, 6), 0.29);
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
  if (name === '뉴코아아울렛 1관') stairLanding(F, { a, b, v0, v1, hole });
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
    const label = number === 2 ? ['하나은행', 'NEWCORE', 'FRANGERIE', '폴바셋', 'Black&White', 'luxury gallery', 'DESIGNERS'][i % 7]
      : number === 3 ? ["KIM'S CLUB", '버거킹', 'CAFÉ MAMAS', 'STARBUCKS', '밀도', 'CHAI797 Plus'][i % 6]
      : ['NEWCORE OUTLET', 'OLIVE YOUNG', 'NEWCORE'][i % 3];
    const awning = number === 3 && i === 2 ? 0x3d7873 : number === 3 && i === 1 ? 0xa32e42 : C.black;
    arch(F, u, bay, label, awning, Math.min(9.65, roof - 1.15), number !== 2); doors(F, u, Math.min(4.4, bay - 2.2));
    if (number === 2 && label === 'DESIGNERS') {
      const r = bay * 0.29, y = 4.75, normal = [Math.sin(F.angle + Math.PI), 0, Math.cos(F.angle + Math.PI)];
      const point = (du, yy) => { const [x, z] = P(u + du, -0.38); return [x, yy, z]; };
      for (let j = 0; j < 20; j++) {
        const a = j * Math.PI / 20, b = (j + 1) * Math.PI / 20;
        K.quad(0x62696a, [point(0, y), point(Math.cos(a) * r, y + Math.sin(a) * r), point(Math.cos(b) * r, y + Math.sin(b) * r), point(0, y)], normal);
      }
      S('DESIGNERS', u, 5.05, -0.42, bay - 2.4, 0.55);
    }
    // The source shows raised numerals on the slate infill, not a floating
    // two-line placard or a round medallion. The 3 belongs by the P tower.
    if ((number === 3 && i === 0) || (number === 1 && i === Math.floor(n / 2))) {
      S(String(number), u, 7.15, -0.35, 1.05, 1.22);
      S('뉴코아 ' + number + '관', u, 6.38, -0.35, 1.5, 0.28);
    }
    if (number === 2 && i === Math.floor(n / 2)) S('뉴코아 2관', u + bay / 2 - 0.3, 2.4, -0.69, 0.7, 0.25, '#555b58');
  });
  for (const [y, h, d] of [[9.9, 0.22, 0.5], [10.2, 0.35, 0.7], [roof - 0.75, 0.22, 0.55], [roof - 0.43, 0.3, 0.9]]) {
    if (y > roof - 0.3 || (number === 3 && y < roof - 1)) continue;
    B(0, y, -0.18, L + 0.2, h, d, C.trim, { solid: false });
  }
  if (number === 3) {
    // Slit windows occupy the existing roof-parking parapet; the roof level
    // and all usable floors stay at their established heights.
    B(0, 10.72, -0.20, L, 0.16, 0.55, C.trim, { solid: false });
    for (let u = -L / 2 + 5; u < L / 2 - 1; u += 3.0) {
      B(u, 10.97, -0.13, 2.35, 0.40, 0.13, 0x343d39, { solid: false });
      for (const y of [11.06, 11.19, 11.32]) B(u, y, -0.22, 2.35, 0.025, 0.055, 0x637069, { solid: false });
    }
    B(0, 11.52, -0.2, L + 0.2, 0.16, 0.7, C.trim, { solid: false });
    B(0, 11.69, -0.24, L + 0.35, 0.12, 0.88, C.cream, { solid: false });
  }
  if (number !== 3) {
    // T92eDMIb3vE_50 agrees with photo05: cool grey/off-white upper 1관
    // stripes, separate from the warmer stone arches on the lower floors.
    if (number === 1) B(0, 10.65, -0.025, L - 0.3, roof - 11.2, 0.08, 0xe8e9e4, { solid: false });
    for (let u = -L / 2 + 2.3; u < L / 2 - 2; u += 5.4) {
      B(u, 10.7, -0.05, 2.65, roof - 11.6, 0.15, number === 1 ? 0x92969a : C.cream, { solid: false });
      B(u - 2.45, 10.65, -0.22, 0.27, roof - 11.2, 0.4, C.trim, { solid: false });
    }
    S('NEWCORE', 0.04, roof - 6.05, -0.21, 11, 1.7, null, { fg: '#4d5355' });
    S('NEWCORE', 0, roof - 6, -0.27, 11, 1.7, null, { fg: '#c5c9c6' });
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
  K.slab(Q(-L / 2, -10, L / 2, 0), 0, { mat: 'newcore-grey-paving', thick: 0.08, ceil: false });
  B(0, 0.008, -1.8, L - 1, 0.014, 0.45, 'darkstone', { solid: false });
  for (const u of centers.filter((_, i) => i % 2 === 0)) {
    const [x, z] = P(u + 1.6, -7.8); K.tree(x, z, { h: 7.3, kind: 'zelkova' });
    B(u + 1.6, 0.018, -7.8, 1.6, 0.025, 1.6, 0x545e53, { solid: false });
    for (let j = -0.65; j <= 0.65; j += 0.18) B(u + 1.6 + j, 0.046, -7.8, 0.04, 0.018, 1.45, C.black, { solid: false });
  }
  for (const u of centers) {
    const len = Math.max(2.4, bay - 3.2), v = -9.5;
    for (const du of [-len / 2, 0, len / 2]) B(u + du, 0, v, 0.055, 0.9, 0.055, C.black);
    for (const y of [0.36, 0.85]) B(u, y, v, len, 0.045, 0.05, C.black, { solid: false });
    for (let du = -len / 2 + 0.25; du < len / 2; du += 0.32) B(u + du, 0.36, v, 0.025, 0.49, 0.035, C.black, { solid: false });
  }
}
function southEnd(F, roof) {
  const { K, L, W, P } = F, origin = P(L / 2, W / 2), angle = F.angle - Math.PI / 2;
  const G = localFrame(K, { ...F, angle, P: (u, v) => [origin[0] + Math.cos(angle) * u + Math.sin(angle) * v, origin[1] - Math.sin(angle) * u + Math.cos(angle) * v] });
  for (const u of [-W * 0.23, W * 0.08]) { arch(G, u, W * 0.30, 'NEWCORE OUTLET'); doors(G, u, 4); }
  G.B(0, 10.6, -0.025, W - 0.3, roof - 11.2, 0.08, 0xe8e9e4, { solid: false });
  for (let u = -W / 2 + 2; u < W / 2 - 2; u += 4.8) G.B(u, 10.6, -0.05, 2.4, roof - 11.5, 0.17, 0x92969a, { solid: false });
  for (const y of [10, 10.4, roof - 0.6]) G.B(0, y, -0.2, W, 0.25, 0.65, C.trim, { solid: false });
  G.S('NEWCORE', -2.96, roof - 5.85, -0.23, 8, 1.4, null, { fg: '#434b4c' });
  G.S('NEWCORE', -3, roof - 5.8, -0.29, 8, 1.4, null, { fg: '#c5c9c6' });
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
// Drawn boards retain verified wording, not invented brand logos. Food-only
// photographic insets below reuse the supplied references without new assets.
function foodTextures(K) {
  const dish = (g, x, y, r, variant = 0) => {
    g.fillStyle = '#e5e6df'; g.beginPath(); g.ellipse(x, y, r, r * .78, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = ['#b67637', '#a34d2e', '#a5a26e'][variant % 3]; g.beginPath(); g.ellipse(x, y, r * .82, r * .64, 0, 0, Math.PI * 2); g.fill();
    for (let i = 0; i < 28; i++) { const a = i * 2.4, rr = r * .68 * Math.sqrt((i + 1) / 28); g.fillStyle = ['#edce84', '#516f3c', '#e9e0b7', '#983f29'][i % 4]; g.fillRect(x + Math.cos(a) * rr - 3, y + Math.sin(a) * rr * .7 - 3, 7, 5); }
  };
  K.texture('newcore-food-art', 512, 384, (g, w, h) => { g.fillStyle = '#233337'; g.fillRect(0, 0, w, h); dish(g, w / 2, h / 2, 168); }, [1, 1]);
  K.texture('newcore-food-poster', 512, 768, (g, w, h) => {
    g.fillStyle = '#a7d9e7'; g.fillRect(0, 0, w, h); g.textAlign = 'center';
    g.fillStyle = '#d92b66'; g.font = 'bold 78px sans-serif'; g.fillText('주문 1위', w / 2, 104);
    g.fillStyle = '#497a8f'; g.font = '36px sans-serif'; g.fillText('이유있는 선택', w / 2, 160);
    dish(g, w / 2, 420, 213); g.fillStyle = '#32505c'; g.font = 'bold 46px sans-serif'; g.fillText('대표메뉴', w / 2, 666); g.fillText('장어솥밥', w / 2, 726);
  }, [1, 1]);
  K.texture('newcore-menu-grid', 768, 512, (g, w, h) => {
    g.fillStyle = '#e9f6f2'; g.fillRect(0, 0, w, h); g.fillStyle = '#26856b'; g.fillRect(0, 0, 95, h);
    g.textAlign = 'center'; g.font = 'bold 26px sans-serif'; g.fillStyle = '#fff9e7'; g.fillText('차림표', 47, 50);
    for (let r = 0; r < 4; r++) for (let c = 0; c < 5; c++) { const x = 160 + c * 132, yy = 57 + r * 122; dish(g, x, yy, 43, r + c); g.fillStyle = '#35453f'; g.font = '18px sans-serif'; g.fillText(['솥밥', '국수', '정식', '곁들임', '음료'][c], x, yy + 53); }
  }, [1, 1]);
  K.texture('newcore-pot-symbol', 256, 256, (g, w, h) => {
    g.clearRect(0, 0, w, h); g.fillStyle = '#aa3929'; g.beginPath(); g.arc(128, 128, 120, 0, Math.PI * 2); g.fill();
    g.strokeStyle = '#fff2ce'; g.lineWidth = 7; g.beginPath(); g.arc(128, 128, 113, 0, Math.PI * 2); g.stroke();
    g.beginPath(); g.moveTo(66, 94); g.lineTo(190, 94); g.lineTo(172, 167); g.quadraticCurveTo(128, 191, 84, 167); g.closePath(); g.stroke();
    g.beginPath(); g.ellipse(128, 87, 64, 15, 0, 0, Math.PI * 2); g.stroke(); g.strokeRect(111, 61, 34, 10);
    g.fillStyle = '#fff2ce'; g.font = 'bold 29px sans-serif'; g.textAlign = 'center'; g.fillText('솥내음', 128, 219);
  }, [1, 1], { transparent: true, doubleSide: true });
  K.texture('newcore-exit', 256, 128, (g, w, h) => {
    g.fillStyle = '#138c72'; g.fillRect(0, 0, w, h); g.strokeStyle = '#effff0'; g.lineWidth = 7; g.strokeRect(15, 10, 58, 108);
    g.fillStyle = '#effff0'; g.beginPath(); g.arc(110, 28, 10, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.moveTo(104, 44); g.lineTo(89, 68); g.lineTo(124, 81); g.lineTo(135, 109); g.moveTo(103, 52); g.lineTo(129, 61); g.lineTo(147, 45); g.moveTo(104, 72); g.lineTo(84, 110); g.stroke();
    g.font = 'bold 62px sans-serif'; g.fillText('←', 165, 80);
  }, [1, 1]);
  const tenants = ['오근내 닭갈비', 'RIMINI', 'STEAK US', 'PhởVua', 'PizzaMall', '한성돈까스', '솥내음', '반궁', '봉혜자 별미요릿집', '평양옥', '신룽푸 마라탕', 'Perché no!!', '백미당', '두끼', '육된장', 'CHAI797 Plus', 'CAFÉ MAMAS', 'meal°', 'STARBUCKS', 'FRANGERIE'];
  K.texture('newcore-directory', 1536, 1024, (g, w, h) => {
    g.fillStyle = '#293832'; g.fillRect(0, 0, w, h); g.strokeStyle = '#c5b379'; g.lineWidth = 3; g.strokeRect(56, 42, w - 112, 179); g.strokeRect(63, 49, w - 126, 165);
    g.textAlign = 'center'; g.fillStyle = '#d4be80'; g.font = 'italic 44px serif'; g.fillText('Select Dining', w / 2, 88);
    g.fillStyle = '#f4eee0'; g.font = 'bold 79px serif'; g.fillText("KIM'S FOOD STREET", w / 2, 177);
    g.font = '29px sans-serif'; g.fillText('전세계 9개국, 57개국 맛집으로 떠나는 글로벌 미식여행', w / 2, 273);
    tenants.forEach((name, i) => { const x = 218 + (i % 4) * 366, yy = 373 + Math.floor(i / 4) * 130; g.font = 'bold 34px sans-serif'; g.fillStyle = '#f0ecdc'; g.fillText(name, x, yy, 330); g.font = '23px sans-serif'; g.fillStyle = '#d4b98a'; g.fillText(i === 19 ? '2관 1F' : [12, 15, 16, 17, 18].includes(i) ? '3관 1F' : '1관 B1', x, yy + 40); });
  }, [1, 1]);
  K.texture('newcore-food-map', 1536, 960, (g, w, h) => {
    g.fillStyle = '#f6f2e9'; g.fillRect(0, 0, w, h); g.textAlign = 'center'; g.fillStyle = '#62503f'; g.font = 'italic 52px serif'; g.fillText('Select Dining', w / 2, 82); g.font = 'bold 82px serif'; g.fillText("KIM'S FOOD STREET", w / 2, 174);
    g.strokeStyle = '#263333'; g.lineWidth = 35; g.beginPath(); g.moveTo(80, 335); g.lineTo(410, 335); g.lineTo(410, 690); g.lineTo(1350, 690); g.moveTo(410, 690); g.lineTo(200, 750); g.lineTo(90, 870); g.moveTo(680, 690); g.lineTo(680, 335); g.lineTo(1450, 335); g.moveTo(1160, 335); g.lineTo(1160, 690); g.moveTo(680, 690); g.lineTo(820, 807); g.lineTo(1100, 807); g.lineTo(1310, 690); g.stroke();
    const shops = [['평양옥', 275, 430], ['봉혜자', 525, 540], ['오근내 닭갈비', 270, 620], ['두끼', 525, 342], ['반궁', 600, 630], ['STEAK US', 775, 580], ['한성돈까스', 900, 570], ['솥내음', 1030, 423], ['PhởVua', 1030, 565], ['육된장', 1110, 620], ['STARBUCKS', 1360, 595], ['스시마우', 1235, 595], ['PizzaMall', 380, 850], ['신차이', 610, 840], ['RIMINI', 1320, 850], ['Perché no!!', 875, 754], ['용호낙지', 805, 425], ['명동손칼국수', 940, 284], ['코아손만두', 1180, 284], ['임선생 비빔밥', 1390, 284]];
    shops.forEach(([name, x, yy], i) => { g.fillStyle = ['#914d33', '#355c48', '#403a32'][i % 3]; g.font = 'bold 26px sans-serif'; g.fillText(name, x, yy, 175); });
    g.fillStyle = '#f7f3e6'; g.font = '24px sans-serif'; g.fillText('식당가 통로', 790, 699); g.fillText('킴스클럽 가는 길 →', 1300, 699);
  }, [1, 1]);
  K.texture('newcore-restaurant-guide', 1024, 640, (g, w, h) => {
    g.fillStyle = '#192b30'; g.fillRect(0, 0, w, h); g.fillStyle = '#f5eedf'; g.textAlign = 'center'; g.font = 'italic 32px serif'; g.fillText('The', w / 2, 54); g.font = 'bold 55px serif'; g.fillText('RESTAURANT', w / 2, 112); g.font = 'bold 34px serif'; g.fillText('≪ 5F GUIDE ≪', w / 2, 158);
    ['애슐리 퀸즈', '옥소반', '유천냉면'].forEach((name, i) => { const x = 177 + i * 337; dish(g, x, 337, 147, i); g.fillStyle = '#d6ba7e'; g.font = 'bold 33px sans-serif'; g.fillText(name, x, 516); g.fillStyle = '#f2eddf'; g.font = '24px sans-serif'; g.fillText(['월드와이드뷔페', '샤브샤브 전문점', '냉면 전문점'][i], x, 563); });
  }, [1, 1]);
}
function panel(F, u, y, v, w, h, mat, turn = 0, tilt = 0) {
  const rot = F.angle + turn, [x, z] = F.P(u, v), c = Math.cos(rot), s = Math.sin(rot), ct = Math.cos(tilt), st = Math.sin(tilt);
  const p = (a, b) => [x + c * a - s * st * b, y + ct * b, z - s * a - c * st * b];
  F.K.quad(mat, [p(-w / 2, -h / 2), p(w / 2, -h / 2), p(w / 2, h / 2), p(-w / 2, h / 2)], [s * ct, st, c * ct], [[0, 0], [1, 0], [1, 1], [0, 1]]);
}
const foodPhotoCache = new WeakMap();
function foodPhoto(F, u, y, v, w, h, variant = 0, turn = 0) {
  // Food photographs only, cropped from supplied photo08: no people or logos.
  panel(F, u, y, v, w, h, 'newcore-food-art', turn);
  if (typeof document === 'undefined') return; // node smoke has no image loader
  const T = F.K.THREE; let cache = foodPhotoCache.get(F.K);
  if (!cache) { cache = new Map(); foodPhotoCache.set(F.K, cache); }
  if (!cache.has(variant)) {
    const tex = new T.TextureLoader().load(new URL('../../refs/interior/newcore/08_foodstreet_map.jpg', import.meta.url).href);
    tex.colorSpace = T.SRGBColorSpace;
    const crops = [[.066, .645, .345, .767], [.374, .645, .644, .767], [.68, .645, .968, .767]];
    const [x0, y0, x1, y1] = crops[variant % 3]; tex.offset.set(x0, 1 - y1); tex.repeat.set(x1 - x0, y1 - y0); cache.set(variant, tex);
  }
  const rot = F.angle + turn, [x, z] = F.P(u, v), mesh = new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshBasicMaterial({ map: cache.get(variant) }));
  mesh.rotation.y = rot; mesh.position.set(x + Math.sin(rot) * .006, y, z + Math.cos(rot) * .006); F.K.addMesh(mesh);
}
function guest(F, u, y, v, i = 0, sit = false, rot = F.angle) {
  const h = 1.68, [x, z] = F.P(u, v);
  F.person(u, y, v, { h, sit, rotY: rot, shirt: [0xe5dfd0, 0x374354, 0xa48372, 0x676b5a, 0x273032][i % 5], pants: 0x3e4650 });
  // Match K.person's fixed-height head; hair is a cap, no facial detail.
  const top = y + (sit ? .45 : h * .47) + h * .36 + h * .13;
  F.K.dome({ x, y: top, z, rx: .145, ry: .10, rz: .145, mat: i % 3 ? 0x272725 : 0x554139, seg: 8, rings: 3 });
}
function pendant(F, u, y, v, r = .24, mat = C.black) {
  const [x, z] = F.P(u, v); F.cyl(u, y + .17, v, .018, .55, C.black, 6);
  F.K.dome({ x, y, z, rx: r, ry: .19, rz: r, mat, seg: 12, rings: 4 });
  F.cyl(u, y - .015, v, r * .78, .02, { tex: 'emit', color: 0xffdca0 }, 12);
}
function menuStand(F, u, y, v, text = '차림표') {
  F.B(u, y, v, .66, .055, .55, C.black, { solid: false }); F.B(u, y + .055, v, .045, 1.15, .045, C.metal, { solid: false });
  panel(F, u, y + 1.28, v, .86, .65, C.black, 0, .35);
  panel(F, u, y + 1.29, v + .012, .79, .57, 'newcore-menu-grid', 0, .35);
  F.S(text, u, y + 1.65, v + .05, .85, .13, '#e6eee5', { rotY: F.angle, fg: '#344b40' });
}
function table(F, u, y, v, occupied = false) {
  const { B, cyl } = F;
  B(u, y + 0.72, v, 1.35, 0.075, 0.78, { tex: 'newcore-ash', gloss: .3 });
  for (const du of [-0.5, 0.5]) for (const dv of [-0.25, 0.25]) B(u + du, y, v + dv, 0.04, 0.72, 0.04, 0xe8e7dd, { solid: false });
  for (const du of [-0.36, 0.36]) for (const side of [-1, 1]) {
    const vv = v + side * 0.66;
    B(u + du, y + 0.43, vv, 0.43, 0.065, 0.43, 0xd8cba3);
    for (let j = 0; j < 5; j++) { const a = (j - 2) * .24, uu = u + du + Math.sin(a) * .43, vz = vv + side * (Math.cos(a) * .25); B(uu, y + .67, vz, .105, .16, .045, 'newcore-ash', { rotY: F.angle - side * a, solid: false }); }
    for (const xx of [-0.15, 0.15]) for (const dz of [-.15, .15]) B(u + du + xx, y, vv + dz, 0.028, dz * side > 0 ? .72 : .43, .028, 0xc9aa70, { solid: false });
  }
  B(u + 0.43, y + 0.799, v, 0.22, 0.008, 0.28, 0xf7f2dd, { solid: false });
  for (let j = 0; j < 4; j++) B(u + .43, y + .808, v - .09 + j * .06, .17, .003, .025, j % 2 ? 0xb39269 : 0x9e725f, { solid: false });
  if (occupied) {
    for (const [i, du, dv] of [[0, -.36, .66], [1, .36, -.66], [2, -.36, -.66]]) guest(F, u + du, y, v + dv, Math.abs(Math.round(u)) + i, true, F.angle + (dv > 0 ? Math.PI : 0));
    B(u - .28, y + .8, v, .47, .025, .32, 0x454942, { solid: false });
    cyl(u - .32, y + .825, v, .13, .055, 0xe8e5d8);
    B(u + .45, y + .5, v + .72, .21, .26, .12, 0x374658, { solid: false });
  }
}
function planter(F, u, y, v, w) {
  const { K, B, P } = F;
  B(u, y, v, w, .90, .34, 'newcore-ash');
  for (const side of [-1, 1]) {
    B(u, y + .08, v + side * .18, w - .12, .73, .035, 0xe8e1ca, { solid: false });
    for (let du = -w / 2 + .12; du < w / 2; du += .45) B(u + du, y + .06, v + side * .21, .045, .78, .045, 0xcbae78, { solid: false });
    for (const yy of [.09, .46, .81]) B(u, y + yy, v + side * .21, w, .04, .045, 0xcbae78, { solid: false });
  }
  B(u, y + .86, v, w + .03, .16, .4, 0xf0eadb, { solid: false });
  B(u, y + 1.015, v, w - .1, .008, .29, 0x494937, { solid: false });
  const rand = K.rand(Math.round((u + 100) * 99 + v));
  for (let du = -w / 2 + .18; du < w / 2; du += .24) for (let j = 0; j < 7; j++) {
    const ang = rand() * Math.PI * 2, len = .14 + rand() * .17, root = y + 1.02, tip = root + .13 + rand() * .22;
    const p = (uu, yy, vv) => { const [x, z] = P(uu, vv); return [x, yy, z]; };
    const a = p(u + du, root, v), b = p(u + du + Math.cos(ang) * len, tip, v + Math.sin(ang) * len), m = p(u + du + Math.cos(ang) * len * .5, root + .13, v + Math.sin(ang) * len * .5 + .045);
    const q = [a, m, b, p(u + du + Math.cos(ang) * len * .5, root + .10, v + Math.sin(ang) * len * .5 - .045)];
    K.quad([0x496334, 0x74894c, 0x607c3c][j % 3], q, [0, 1, 0]); K.quad(0x526d38, [...q].reverse(), [0, -1, 0]);
  }
}

function foodRoom(F, ci) {
  const { K, L, W, Q, B, S, wall, cyl, person } = F, y = K.LEVELS.B1;
  const names = ['오근내 닭갈비', '봉혜자 별미요릿집', '솥내음', '한성돈까스', 'PhởVua', '육된장'];
  const us = [-30, -18, -6, 6, 18, 30];
  // Photo08 puts Sotnaeum beside/behind PhởVua, reached from a side aisle.
  // Keep its complete fitted bay, turned into the rear inset; these metre
  // positions remain estimates, not a surveyed interpretation of the map.
  const sot = localFrame(K, { ...F, angle: F.angle + Math.PI,
    P: (u, v) => F.P(9 - u, W + 2 - v) });
  // Keep PhởVua in the same block as Sotnaeum (photo08), two metres less
  // recessed. Its stainless counter/stools are moved intact, not replaced.
  const pho = localFrame(K, { ...F, angle: F.angle + Math.PI,
    P: (u, v) => F.P(22 - u, W - v) });
  wall(-L / 2 + 1, 2, L / 2 - 1, 2, y, y + 3.2, { mat: 0xe7dfca });
  for (const [i, u] of us.entries()) for (const du of [-5.5, 5.5]) {
    // The former Sotnaeum bay now holds the displaced RIMINI fittings.
    wall(u + du, 2, u + du, 11.4, y, y + 3.1, { mat: 0xe3dcc9, thick: 0.12 });
    if (i === 2) sot.wall(u + du, 2, u + du, 11.4, y, y + 3.1, { mat: 0xe3dcc9, thick: 0.12 });
    if (i === 4) pho.wall(u + du, 2, u + du, 11.4, y, y + 3.1, { mat: 0xe3dcc9, thick: 0.12 });
  }
  K.zone({ name: '킴스 푸드 스트리트', floor: 'B1', sub: '솥내음 · 봉혜자 · 공용 좌석', poly: Q(-L / 2 + 1, 1, L / 2 - 1, 21), y0: y, y1: -2.7, priority: 2 });
  K.zone({ name: '킴스 푸드 스트리트', floor: 'B1', sub: '솥내음 · 안쪽 통로', poly: Q(9.5, 21, 20.5, W - 0.1), y0: y, y1: -2.7, priority: 2 });
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
      // Reuse every table, planter, menu and counter in the corrected bay.
      const room = i === 2 ? sot : i === 4 ? pho : F;
      const { B, S, cyl, person } = room;
      const dark = i === 1, front = 11.3;
      B(u, y + 2.3, front, 10.8, 0.75, 0.35, dark ? 0x574c43 : 0xd3c3a3, { solid: false });
      S(names[i], u, y + 2.64, front + 0.21, 8, 0.5, null, { rotY: room.angle, fg: dark ? '#fff9e9' : '#463b2c' });
      B(u, y, 3.3, 9.4, 0.93, 1.2, dark ? 0x66513e : C.wood);
      B(u, y + 0.93, 3.3, 9.6, 0.08, 1.3, 0xd7d8ce, { solid: false });
      for (let j = 0; j < 4; j++) {
        B(u - 3.3 + j * 2.1, y + 1.45, 2.2, 1.75, 0.65, 0.06, 0x263c3d, { solid: false });
        S(['차림표', ['솥밥 · 국수', '정갈한 한 끼', '따뜻한 식사', '오늘의 메뉴'][j]], u - 3.3 + j * 2.1, y + 1.77, 2.27, 1.6, 0.53, '#ede3c5', { rotY: room.angle, fg: '#342e25' });
        cyl(u - 3.3 + j * 2.1, y + 1.04, 3.4, 0.17, 0.17, 0x3d4444);
      }
      if (i === 4) {
        // Photo09: stainless counter with a line of black bar stools.
        B(u, y, 9.8, 8.3, 1.02, 0.8, 0x9aa6a4);
        B(u, y + 1.02, 9.8, 8.5, 0.08, 1.1, 0xd4dcda);
        for (let du = -3.2; du <= 3.2; du += 1.07) { cyl(u + du, y, 11.1, 0.07, 0.65, C.metal); cyl(u + du, y + 0.65, 11.1, 0.23, 0.08, C.black); }
      } else {
        for (const du of [-3.4, 0, 3.4]) table(room, u + du, y, 7.6, (i + Math.round(du)) % 2 === 0);
        planter(room, u - 2.3, y, 10.8, 5.7);
      }
      B(u + 3.9, y, 11.8, 0.85, 0.1, 0.6, C.black, { solid: false });
      B(u + 3.9, y + 0.1, 11.8, 0.075, 1, 0.08, C.metal, { solid: false });
      S(['차림표', names[i], '솥밥 · 면 · 식사'], u + 3.9, y + 1.2, 11.85, 0.95, 0.72, '#e8e7c8', { rotY: room.angle, fg: '#3e4b44' });
      B(u + 5.1, y + 0.8, 11.38, 0.68, 1.45, 0.13, 0x212829, { solid: false });
      S(['추천 메뉴', names[i]], u + 5.1, y + 1.5, 11.46, 0.56, 1.2, '#d3e7dc', { rotY: room.angle, fg: '#515e46' });
      if (i === 2) S(['솥내음', '정갈한 한 끼'], u, y + 2.62, front + 0.23, 4, 0.55, null, { rotY: room.angle, fg: '#4d3b25' });
      if (dark) for (const du of [-3.6, 0, 3.6]) { cyl(u + du, y + 2.55, 7.6, 0.03, 0.5, C.black); cyl(u + du, y + 2.35, 7.6, 0.18, 0.2, { tex: 'emit', color: 0xffdda0 }); }
      person(u + 1, y, 4.4, { shirt: 0x4c4b43 });
    });
    for (let u = -L / 2 + 5; u < L / 2 - 4; u += 3.5) {
      // Open the right turn without dropping the existing seating detail.
      const inBranch = u > 8 && u < 14;
      table(F, inBranch ? u + 25 : u, y, inBranch ? 24 : 19, Math.round(u) % 3 === 0);
    }
    for (const [i, name] of ['PizzaMall', '신차이', 'RIMINI', 'STARBUCKS'].entries()) {
      const moved = i === 1 || i === 2;
      const u = i === 1 ? 18 : i === 2 ? -6 : -7 + i * 11;
      const counterV = moved ? 3.3 : W - 3, tableV = moved ? 7.6 : W - 7.4;
      B(u, y, counterV, 8.6, 0.95, 1.1, C.wood);
      S(name, u, y + 2.35, moved ? 11.3 : W - 3.65, 7.5, 0.6, '#35423c', moved ? { rotY: F.angle } : {});
      for (const du of [-2.4, 1.2]) table(F, u + du, y, tableV, i % 2 === 0);
    }
    S(['솥내음  →', '안쪽 식당가'], 11.5, y + 2.5, 16.8, 2.7, 0.65, '#353b37', { rotY: F.angle - Math.PI / 2 });
    // Keep the directory beside the new opening, not across its sightline.
    S(["KIM'S FOOD STREET", '킴스 푸드 스트리트', '솥내음 · 봉혜자 · 리미니 · 피자몰'], -L / 2 + 1, y + 2.05, 8.5, 5, 1.3, '#353b37', { rotY: F.angle + Math.PI / 2 });
    S(['1관 B1', '킴스 푸드 스트리트', "KIM'S CLUB →"], ci.b + 4, y + 2, W - 1.4, 3.5, 1.15, null, { fg: '#262924' });
    // Small guide on the entry side, with the photographed loop/spine motif.
    B(-L / 2 + 7, y, 12.1, 2.6, 2.5, 0.14, 0xe5dfcb);
    S(["KIM'S FOOD STREET", '← 킴스클럽 가는 길', '식당가 안내'], -L / 2 + 7, y + 1.85, 12.2, 2.3, 0.85, '#eee8d5', { rotY: F.angle, fg: '#524835' });
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
function marketStock(F, u, y, v, row) {
  const { B, cyl } = F;
  for (let k = -5; k <= 5; k++) for (const side of [-1, 1]) {
    const uu = u + side * 0.52, vv = v + k * 0.37, turn = side * Math.PI / 2;
    if (row === 13) {
      // _400: light sesame/seasoning and dark sauce bottles, cream/yellow caps.
      cyl(uu, y, vv, 0.095, 0.22, k < 1 ? 0xc5ad74 : 0x383a22, 8);
      cyl(uu, y + 0.22, vv, 0.048, 0.055, 0x777348, 8);
      cyl(uu, y + 0.275, vv, 0.055, 0.035, k % 3 ? 0xd8b252 : 0xe3d9ae, 8);
      panel(F, uu + side * 0.097, y + 0.12, vv, 0.15, 0.15, 'newcore-condiment-label', turn);
    } else if (row === 24 && k % 2 === 0) {
      // _600: retain the stock count, replace generic cubes by sealed dry-food bags.
      B(uu, y, vv, 0.2, 0.27, 0.22, 0xddd0af, { solid: false });
      B(uu, y + 0.27, vv, 0.12, 0.018, 0.23, 0x9e957e, { solid: false });
      panel(F, uu + side * 0.102, y + 0.135, vv, 0.22, 0.26, 'newcore-dry-grocery', turn);
    } else B(uu, y, vv, 0.23, 0.24, 0.23, [0xdab358, 0x698a60, 0xb95a43, 0xe5d9b0][(k + 5) % 4], { solid: false });
    if (k % 2 === 0) panel(F, u + side * 0.69, y - 0.02, vv, 0.25, 0.105, 'newcore-shelf-label', turn);
  }
}
function shoppingCart(F, u, y, v) {
  // _800's red foreground bar belongs to a cart, not a fixed queue railing.
  const { B, cyl } = F, steel = 0xa7adab;
  B(u, y + 0.36, v, 0.64, 0.025, 0.93, steel, { solid: false });
  for (const du of [-0.31, 0.31]) {
    for (let j = 0; j < 8; j++) B(u + du, y + 0.37, v - 0.43 + j * 0.12, 0.016, 0.45, 0.016, steel, { solid: false });
    for (const yy of [0.48, 0.64, 0.82]) B(u + du, y + yy, v, 0.025, 0.018, 0.95, steel, { solid: false });
    B(u + du, y + 0.17, v + 0.42, 0.035, 0.84, 0.035, steel, { solid: false });
    for (const dv of [-0.38, 0.38]) {
      B(u + du, y + 0.09, v + dv, 0.025, 0.28, 0.025, steel, { solid: false });
      cyl(u + du, y + 0.03, v + dv, 0.065, 0.1, 0x343838, 8);
    }
  }
  for (const dv of [-0.46, 0.46]) for (const yy of [0.48, 0.64, 0.82]) B(u, y + yy, v + dv, 0.64, 0.018, 0.02, steel, { solid: false });
  B(u, y + 0.98, v + 0.43, 0.72, 0.055, 0.06, 0xb53732, { solid: false });
}
function market(F, ci) {
  const { K, L, W, B, S } = F, y = K.LEVELS.B1;
  // qZYgbakp2UA_800 shows an open food hall, not a narrow rack maze.
  // Keep every existing rack/counter. Move the middle/back rack rows to
  // v=13/24 to leave a 6.3m spine centred on the unchanged v=18 B1 link.
  // A second open aisle (v=28..32) serves the low deli counters; dimensions
  // and world orientation are inferred inside the official 2관 B1 footprint.
  const rackRows = [6, 13, 24], deliV = W - 9;
  for (const u of [-L / 2 + 11, -2, L / 2 - 10]) {
    B(u, y, 28.2, 0.65, 3.65, 0.65, 0xe9e8df);
  }
  // _800: grey polished floor, white square columns, dark exposed services.
  // Preserve the real-kit stair void in the lower visual ceiling as well.
  K.hpoly({ tex: 'newcore-market-floor', gloss: 0.5 }, F.p, y + 0.012, true);
  K.hpoly(0x292c2c, F.p, y + 3.65, false, [ci.hole]);
  K.detail({ name: '2관 킴스클럽 델리', floor: 'B1', poly: F.p, y0: y, y1: 0 }, () => {
    for (let u = -L / 2 + 5; u < L / 2 - 4; u += 5.8) for (const v of rackRows) {
      // Retain the old collision footprint, but expose stock between shelves.
      // An opaque full-height cube would bury the bottles and bag fronts.
      B(u, y, v, 1.15, 1.45, 4.7, 0x303434, { skip: ['top', 'bottom', 'n', 's', 'e', 'w'] });
      B(u, y, v, 1.15, 0.18, 4.7, 0x303434, { solid: false });
      B(u, y + 0.18, v, 0.08, 1.27, 4.7, 0x303434, { solid: false });
      for (const dv of [-2.34, 2.34]) B(u, y, v + dv, 0.1, 1.72, 0.06, 0x505757, { solid: false });
      for (let yy = 0.2; yy < 1.4; yy += 0.38) {
        B(u, y + yy, v, 1.35, 0.04, 4.8, 0x646b6b, { solid: false });
        marketStock(F, u, y + yy + 0.05, v, v);
      }
    }
    S(["KIM'S CLUB", '킴스클럽 · 신선식품 · 델리'], 0, y + 2.65, W - 1, 12, 0.8, '#7c322d');
    for (let u = 0; u < L / 2 - 5; u += 5) {
      B(u, y, deliV, 2.8, 0.9, 1.25, 0x9caaa1);
      B(u, y + 0.9, deliV, 2.9, 0.055, 1.3, 0xd4d6ca, { solid: false });
      B(u, y + 0.96, deliV - 0.59, 2.8, 0.32, 0.035, 'glass', { solid: false });
      for (let j = 0; j < 6; j++) {
        const uu = u - 1.1 + j * 0.44;
        B(uu, y + 0.965, deliV, 0.37, 0.035, 0.72, 0x373e39, { solid: false });
        for (const dv of [-0.2, 0, 0.2]) B(uu, y + 1, deliV + dv, 0.27, 0.07, 0.15, [0xb4864b, 0x799054, 0xcfb989][j % 3], { solid: false });
      }
    }
    shoppingCart(F, L / 2 - 3, y, deliV + 1.6);
    for (let u = -L / 2 + 2; u < L / 2 - 1; u += 6) {
      const end = u > ci.a - 0.3 && u < ci.b + 3.1 ? ci.v0 - 1.5 : W - 0.5;
      B(u, y + 3.48, (end + 0.5) / 2, 0.12, 0.16, end - 0.5, 0x161c1d, { solid: false });
    }
    for (const v of [7, 18, 30]) B(0, y + 3.4, v, L - 1, 0.14, 0.1, 0x1c2222, { solid: false });
    for (const v of [10, 31]) {
      B(0, y + 3.19, v, L - 1, 0.31, 0.65, 0x656b6b, { solid: false });
      for (let u = -L / 2 + 2; u < L / 2 - 1; u += 3.2) B(u, y + 3.17, v, 0.035, 0.35, 0.69, 0x969c98, { solid: false });
    }
    for (let u = -L / 2 + 4; u < L / 2 - 3; u += 6) for (const v of [7, 18, 28]) {
      B(u, y + 3.36, v, 2.2, 0.07, 0.12, 0x252c2c, { solid: false });
      B(u, y + 3.34, v, 2.05, 0.02, 0.07, { tex: 'emit', color: 0xf5f7ed }, { solid: false });
      for (const du of [-0.7, 0.7]) {
        F.cyl(u + du, y + 3.12, v, 0.075, 0.22, 0x252a29, 8);
        F.cyl(u + du, y + 3.10, v, 0.065, 0.025, { tex: 'emit', color: 0xfaf9e9 }, 8);
      }
    }
  });
}

// 1/2관 are parts of the same newcore area, not a cross-module junction.
// Blog route text and photo08 support this connection; its width, length
// and wall openings are estimates constrained by the OSM building outlines.
function basementLink(one, two) {
  const K = one.K, y = K.LEVELS.B1, half = 2.8;
  const a0 = two.P(two.L / 2 - 0.6, 18 - half), a1 = two.P(two.L / 2 - 0.6, 18 + half);
  const b0 = one.P(-one.L / 2 + 0.6, 14.7 - half), b1 = one.P(-one.L / 2 + 0.6, 14.7 + half);
  const poly = [a0, b0, b1, a1];
  K.slab(poly, y, { mat: 'newcore-pavers', thick: 0.28 });
  K.slab(poly, y + 3.35, { mat: 'concrete', under: C.black, thick: 0.2, walk: false });
  for (const [a, b] of [[a0, b0], [a1, b1]]) K.wall(...a, ...b, y, y + 3.35, { mat: 0xe1d8c7, thick: 0.18 });
  K.zone({ name: '뉴코아아울렛', floor: 'B1', sub: '1관 푸드스트리트 · 2관 킴스클럽 연결통로', poly, y0: y, y1: y + 3.35 });
  const a = two.P(two.L / 2, 18), b = one.P(-one.L / 2, 14.7);
  const rotY = Math.atan2(a[0] - b[0], a[1] - b[1]);
  for (const t of [0.2, 0.5, 0.8]) {
    const x = a[0] + (b[0] - a[0]) * t, z = a[1] + (b[1] - a[1]) * t;
    K.box({ x, y: y + 3.08, z, w: 2.4, h: 0.08, d: 0.5, rotY, mat: { tex: 'emit', color: 0xffedce }, solid: false });
    if (t === 0.5) {
      K.sign(['1관  킴스 푸드 스트리트', '식당가  ↑'], { x, y: y + 2.45, z, w: 3.8, h: 0.65, rotY, bg: '#353b37', fg: '#f4efdf' });
      K.sign(['2관  킴스클럽', '신선식품 · 델리  ↑'], { x, y: y + 2.45, z, w: 3.8, h: 0.65, rotY: rotY + Math.PI, bg: '#353b37', fg: '#f4efdf' });
    }
  }
}

// Photo07 is a stair view, not the B1 lift lobby. Keep the existing connected
// switchback and dress its lower flight; the landing remains clear for turning.
function stairLanding(F, ci) {
  const { K, B, S, P, Q, wall } = F, { a, b, v0 } = ci, y = K.LEVELS.B1;
  wall(a - 0.1, v0 + 1.34, b + 0.1, v0 + 1.34, y, 0, { mat: 'newcore-plaster', thick: 0.12 });
  K.detail({ name: '1관 지하계단 안내', floor: 'B1', poly: Q(a - 1, v0 - 2, b + 3, v0 + 2), y0: y, y1: 0 }, () => {
    // Eighteen risers match the kit's existing three-metre flight. These are
    // visual nosings only, so the original ramp remains the walking surface.
    for (let j = 0; j < 18; j++) {
      const u = a + (b - a) * j / 18, yy = y + (j + 1) / 6;
      B(u + 0.035, yy + 0.006, v0, 0.07, 0.015, 2.32, 0x252829, { solid: false });
      B(u + 0.035, yy + 0.022, v0, 0.025, 0.005, 2.32, 0x8f9490, { solid: false });
    }
    const su = b - 2.25, sv = v0 + 1.265;
    S('1관  B1  ↘', su, -0.92, sv, 2.5, 0.5, '#202322');
    S(['1관 지하1층', '가는곳'], su, -1.58, sv, 2.5, 0.65, null, { fg: '#202322' });
    S("KIM'S FOOD STREET", su, -2.21, sv, 3.1, 0.34, null, { fg: '#202322' });
    S('킴스 푸드 스트리트', su, -2.54, sv, 2.75, 0.28, null, { fg: '#202322' });
    S("KIM'S CLUB", su, -3.0, sv, 3.0, 0.49, null, { fg: '#202322' });
    S('킴스클럽', su, -3.39, sv, 2.9, 0.23, null, { fg: '#202322' });
    // The reference has a daylight opening and framed food advertisements.
    // A shallow glazed light well suggests this without inventing an exterior
    // tunnel or cutting another hole through the established building shell.
    B(a + 0.1, -3.8, v0 + 1.25, 1.65, 2.5, 0.1, C.metal, { solid: false });
    B(a + 0.1, -3.7, v0 + 1.18, 1.46, 2.28, 0.035, { tex: 'emit', color: 0xdde3d6 }, { solid: false });
    B(a + 0.1, -3.7, v0 + 1.14, 0.055, 2.28, 0.06, C.metal, { solid: false });
    B(a + 0.1, -2.6, v0 + 1.14, 1.46, 0.055, 0.06, C.metal, { solid: false });
    for (const [j, label] of ['RIMINI', '봉혜자', '솥내음'].entries()) {
      const u = a + j * 0.78;
      B(u, -4.94, sv, 0.65, 0.9, 0.075, C.black, { solid: false });
      B(u, -4.87, sv - 0.05, 0.55, 0.72, 0.018, { tex: 'newcore-food-art', scale: [0.55, 0.72] }, { solid: false });
      S(label, u, -4.16, sv - 0.07, 0.55, 0.13, '#ebe5d5', { fg: '#272c29' });
    }
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
  K.detail({ name: '3관 식당가', floor: '1F', poly: F.p, y0: 0, y1: 5.8 }, () => {
    K.hpoly({ tex: 'newcore-polished-stone', gloss: 0.5 }, F.p, 0.012, true, [ci.hole]);
    names.forEach((name, i) => {
      const u = -L / 2 + 4 + (i + 0.5) * span;
      B(u, 3.1, 10.4, span - 0.1, 0.82, 0.2, 0x202523, { solid: false });
      S(name, u, 3.51, 10.55, span - 0.7, i === 0 ? 0.66 : 0.54, null, { rotY: F.angle });
      B(u, 3.93, 10.51, span - 0.35, 0.045, 0.04, { tex: 'emit', color: 0xffe4a8 }, { solid: false });
      for (const du of [-span / 2 + 0.1, span / 2 - 0.1, -1.16, 1.16]) B(u + du, 0, 10.45, 0.085, 3.1, 0.13, C.black);
      B(u, 0, 2.8, span - 1.6, 0.95, 1.2, i === 0 ? 0x5c4f40 : C.wood);
      for (const du of [-span * 0.24, span * 0.24]) table(F, u + du, 0, 6.6, i % 2 === 0);
      S(['차림표', name, '식사 · 음료'], u + 1.9, 1.25, 11.1, 0.8, 1.1, '#d7d0b4', { rotY: F.angle, fg: '#343a32' });
      if (i === 0) {
        // Marble plinths and china shelving behind the photographed black glass.
        for (const du of [-span * 0.3, span * 0.3]) {
          B(u + du, 0, 9.7, 2.15, 0.85, 0.65, { tex: 'marble', color: 0xe0d4bc, gloss: 0.5 });
          for (let yy = 0.95; yy < 2.65; yy += 0.52) {
            B(u + du, yy, 9.7, 2.15, 0.05, 0.55, C.black, { solid: false });
            for (const dd of [-0.65, 0, 0.65]) cyl(u + du + dd, yy + 0.06, 9.7, 0.12, 0.21, 0xd7d6bf);
          }
        }
        for (const du of [-0.97, 0.97]) B(u + du, 1, 10.52, 0.04, 0.52, 0.06, 0xd8ddd7, { solid: false });
        B(u, 0.023, 10, 2.05, 0.015, 1.1, 0x3a3b35, { solid: false });
        B(u, 0.025, 10.57, 2.05, 0.015, 0.08, 0xd6b744, { solid: false });
        for (const du of [2.65, 3.65]) {
          B(u + du, 0, 11.2, 0.7, 0.06, 0.65, C.black, { solid: false });
          B(u + du, 0.06, 11.2, 0.055, 1.15, 0.07, C.black, { solid: false });
          B(u + du, 0.92, 11.2, 0.65, 0.88, 0.07, C.black, { solid: false });
          B(u + du, 0.98, 11.245, 0.56, 0.74, 0.02, { tex: 'newcore-menu-grid', scale: [0.56, 0.74] }, { solid: false });
          S('CHAI797 Plus', u + du, 1.65, 11.27, 0.53, 0.12, '#eee2cf', { rotY: F.angle, fg: '#413c35' });
        }
        S(['영업 안내', '차이797 플러스'], u - 1.7, 1.8, 10.58, 0.75, 0.48, null, { rotY: F.angle });
      }
    });
    for (let u = -L / 2 + 2; u < L / 2 - 1; u += 4) {
      B(u, 5.1, W / 2, 0.14, 0.22, W - 0.5, C.metal, { solid: false });
      for (const v of [5, 13.6, 21]) cyl(u, 4.8, v, 0.12, 0.2, { tex: 'emit', color: 0xffecc8 });
    }
    B(0, 4.95, 13.8, L - 1, 0.26, 0.45, 0x5a6060, { solid: false });
    // Dense wire-mesh trays and lower spot tracks distinguish the indoor arcade.
    for (let u = -L / 2 + 2; u < L / 2 - 1; u += 0.5) B(u, 4.65, 13.1, 0.022, 0.025, 4.6, 0x424741, { solid: false });
    for (let v = 10.9; v < 15.4; v += 0.4) B(0, 4.65, v, L - 2, 0.025, 0.025, 0x424741, { solid: false });
    for (let u = -L / 2 + 3; u < L / 2 - 2; u += 2.4) {
      B(u, 4.28, 11.8, 0.045, 0.38, 0.045, C.black, { solid: false });
      cyl(u, 4.12, 11.8, 0.12, 0.24, C.black);
      cyl(u, 4.10, 11.8, 0.095, 0.03, { tex: 'emit', color: 0xfff0d2 });
    }
    for (const v of [8, 14.8]) B(0, 5.25, v, L - 1, 0.14, 0.14, 0x262b2a, { solid: false });
    S(['↑  2관', '여성전용 주차타워'], -8, 3.15, 13.65, 3.5, 0.5, '#dde7e5', { rotY: F.angle + Math.PI / 2, fg: '#253f4b', twoSided: true });
    // Official 3관 1F is dining. The exterior KIM'S CLUB awning is real,
    // but it does not substantiate the former invented produce islands here.
    S(['3관 식당가', '차이797 · 카페 마마스 · 스타벅스', '밀도 · 백미당 · 버거킹'], 7, 3.1, W - 1, 10, 1, '#2e3c33');
    person(3, 0, 13.5, { shirt: 0x405b61 }); person(14, 0, 23.2, { shirt: 0x8b7265 });
    for (const [u, v, shirt] of [[-7, 14.1, 0x424b58], [-4, 12.9, 0xb9ad93], [2, 14.7, 0x787056], [9, 13.6, 0x564b4b]]) person(u, 0, v, { shirt });
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
  const labels1 = ['킴스 푸드 스트리트 · 킴스클럽', '아웃도어 · 화장품 · 우리은행', '여성 · 마담 · 란제리', '아동 · 유아휴게실', '모던하우스', '전문식당가 · 문화센터 · VIP라운지'];
  const labels2 = ['킴스클럽 · 델리', '수입명품 · 패션잡화', '컨템포러리 · 영캐주얼', '여성', '스포츠 · 캐주얼', '남성 · 골프'];
  const ys = [K.LEVELS.B1, 0, 5, 9.8, 14.2, 18.6], roof = 23;
  for (const [F, num, labels] of [[one, 1, labels1], [two, 2, labels2]]) {
    const floors = ys.map((y, i) => ({ label: i ? i + 'F' : 'B1', y, name: labels[i] }));
    const ci = core(F, floors, '뉴코아아울렛 ' + num + '관', roof);
    streetFront(F, num, roof);
    const [bx, bz] = F.P(num === 1 ? -F.L / 2 : F.L / 2, num === 1 ? 14.7 : 18);
    K.polyWalls(F.p, K.LEVELS.B1, 0, { mat: 0xc8c3b9, inner: 0xe1d8c7, thick: 0.25,
      openings: [{ x: bx, z: bz, w: 5.6, y0: K.LEVELS.B1, y1: K.LEVELS.B1 + 3.35 }] });
    retail(F, num);
    if (num === 1) {
      foodRoom(F, ci); southEnd(F, roof);
      // All existing street doors feed this clear 1F aisle and the adjacent
      // stair/lift lobby. No direct Gotomall or subway tunnel is inferred.
      for (const u of [-20, 8, 33]) F.S(['←  계단 · 엘리베이터', 'B1  킴스 푸드 스트리트'], u, 3.1, 15.3, 4.5, 0.7, '#353b37', { rotY: F.angle });
      F.S(['B1  킴스 푸드 스트리트', '계단 · 엘리베이터'], ci.b + 4, 2.8, F.W - 5.8, 4.1, 0.8, '#353b37');
    } else market(F, ci);
    // User requested upper floors as simple slabs/facade. Circulation remains
    // reachable on foot and by elevator; only verified category signs added.
    for (let i = 2; i < floors.length; i++) K.detail({ name: num + '관 ' + floors[i].label, floor: floors[i].label, poly: F.p, y0: floors[i].y, y1: floors[i].y + 4.5 }, () => {
      for (let u = -F.L / 2 + 5; u < F.L / 2 - 3; u += 8) for (const v of [7, F.W / 2]) F.B(u, floors[i].y + 3.8, v, 2.4, 0.07, 0.45, { tex: 'emit', color: 0xffedc5 }, { solid: false });
      F.S(labels[i], 8, floors[i].y + 2.7, F.W - 1, 11, 0.8, '#66685c');
      // Photo08's 5F guide confirms Ashley; PizzaMall is B1 (also official).
      if (num === 1 && floors[i].label === '5F') F.S(['5F 전문식당가', '애슐리 퀸즈'], ci.b + 10, floors[i].y + 2.3, F.W - 6, 4.1, 0.9, '#353b37');
    });
  }
  basementLink(one, two);
  parkingBlock(park);
  const tc = core(three, [{ label: '1F', y: 0, name: '식당가 · 카페' }, { label: '옥상', y: 10.8, name: '옥상 주차장' }], '뉴코아 3관', 10.8);
  streetFront(three, 3, 10.8); kimsHall(three, tc);
  K.polyWalls(three.p, 10.8, 11.65, { mat: C.cream, thick: 0.2 });
  for (let u = -3; u < three.L / 2 - 3; u += 2.6) three.B(u, 10.82, 20, 0.1, 0.015, 5, 0xf4f1db, { solid: false });
  streetObjects(K, two);
  const spawn = (F, name, u, y, v, yaw = F.angle + Math.PI) => { const [x, z] = F.P(u, v); K.spawn({ name, x, y, z, yaw }); };
  spawn(one, '뉴코아 1관 정문', 12, 0, -5.8);
  spawn(one, '뉴코아 1관 화장품·아웃도어', 4, 0, 16.5, one.angle);
  spawn(one, '킴스 푸드 스트리트', -20, K.LEVELS.B1, 15, one.angle - Math.PI / 2);
  spawn(one, '솥내음 앞', 12, K.LEVELS.B1, 22, one.angle);
  spawn(two, '뉴코아 2관 DESIGNERS', -10, 0, -7);
  spawn(two, '뉴코아 2관 킴스클럽', -8, K.LEVELS.B1, 17.8, two.angle - Math.PI / 2);
  spawn(three, '뉴코아 3관 식당가', 2, 0, -5.8);
  spawn(three, '차이797 앞 복도', -20.41, 0, 13.6, three.angle + Math.PI);
  K.spawn({ name: '뉴코아 로드뷰 정면', x: 257, y: 0, z: -474, yaw: 113 * Math.PI / 180 });
  K.spawn({ name: '잠원로 신반포자이 방향', x: 257, y: 0, z: -474, yaw: 293 * Math.PI / 180 });
  K.spawn({ name: '뉴코아 킴스클럽 앞 따릉이', x: 209.8, y: 0, z: -570, yaw: 113 * Math.PI / 180 });
}
