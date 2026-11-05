// 반포쇼핑타운: eight independent OSM footprints, one continuous neighbourhood.
// Evidence correction: research's 6–7F/apartment description is explicitly a guess.
// 1981 construction report and 2011 existing-building report both describe B1+5F:
// https://www.mk.co.kr/news/economy/501214
// https://v.daum.net/v/20110829170931770
// Adopt B1+5F for all eight blocks; OSM 2동 levels=6 may count B1 (unresolved).
// Height audit: data/raw/osm-core.json has NO height tag for 2동. Its 25.2m
// in osm.json is tools/osm_process.py's commercial fallback: 6 * 4.2m.
// Do not turn that derived value into two invented floors. Retain the 18m
// main roof (+0.65m parapet / +2.16m plant room) pending a measured survey.
// 18.0m roof, interior room positions, stair/elevator cores, and unlabelled units
// are reconstructions, not surveyed facts. Lifts are accessibility provisions;
// 4동's lift is confirmed by 마루's directions, others/positions unconfirmed. No JUNCTIONS
// or WELLS name this module. Station exits stay owned by the station module.
// OSM POIs without levels are placed by use, not claimed as surveyed locations.
// No guessed proper shop names: unverified units carry their use/room number.
// The 3동/6동 clinic waiting corners and ancillary rooms are plausible layouts,
// not surveyed tenant boundaries. Keep the full central lift/stair route open.
// Additional upper-floor evidence (2026-11-06 audit): 마루 official site confirms
// 4동 5F/510호 and an elevator. 7동4F 샤크에듀 and 8동5F academy names/rooms
// come from the cited education directories; exact partition geometry is inferred.
export const meta = {
  id: 'banpo_shoppingtown',
  name: '반포쇼핑타운 1~8동',
  claims: [413280003, 131327730, 131327731, 413372923, 413372924, 413372925, 413372927, 413372928],
  sources: [
    'https://www.localnaeil.com/News/View/640227',
    'https://www.localnaeil.com/News/View/650226',
    'https://www.goodoc.co.kr/hospitals/22651',
    'https://www.goodoc.co.kr/hospitals/13473',
    'https://realty.daangn.com/biz-profiles/4109041',
    'https://polle.com/place/10gAJu/%ED%95%98%EC%96%80%EC%A7%91',
    'https://v.daum.net/v/20110829170931770',
    'https://www.mk.co.kr/news/economy/501214',
    'https://www.lge.co.kr/support/find-service-center-136',
    'https://bestshop.lge.co.kr/shop/detail-ST00003065',
    'https://lewellclinic.com/',
    'https://marupsy.imweb.me/index',
    'https://www.gangmom.kr/institute/65b7afadb836838137326fa4',
    'https://www.gangmom.kr/institute/65b7af58b8368381372f0c24',
    'https://allhakwon.com/academy/15345',
    'https://www.openstreetmap.org/',
  ],
};

const PI = Math.PI;
const TENANTS = {
  1: { b: [], g: [], h: [] },
  2: { b: ['병천토종순대', '서초전집', '미락', '범주당', '하시무'], g: ['LG전자 베스트샵', 'IBK기업은행'], h: ['LG전자 서초서비스센터', '쎄븐미용실'] },
  3: { b: ['만끽치킨', '배부장찌개', '온유월식당', '우고집', '반포대교', '명불허전 원조골뱅이'], g: ['지니 헤어', '네일스토리 잠원점', '꽃보다 남자'], h: [], clinic: '봄치과의원' },
  4: { b: ['정선 감자탕', '하얀집'], g: ['KFC'], h: ['혜원미용실', '라시앤느헤어'], fifth: ['마루정신건강의학과'] },
  5: { b: ['일번지육개장', '서래곱창', '백채 김치찌개 반포점', '블루'], g: ['뉴스타공인중개사사무소', 'GS25'], h: ['재임헤어', '킴스 헤어', '헤라 스킨앤바디'] },
  6: { b: ['유메', '그집'], g: ['최옥현헤어아뜨리에', '이쌤헤어', '아름다운 선택'], h: ['우리 피부', '안나민 반포점', '명동심 미용실', '김은제헤어', '눈썹쟁이'], clinic: '반포좋은치과의원' },
  7: { b: [], g: ['르웰의원'], h: ['송'], fourth: ['샤크에듀'] },
  8: { b: [], g: [], h: ['명품 피부', '모네'], fourth: ['에꼴드미용실'], fifth: ['반포대학나무학원', '네오스터디학원'] },
};
const PALETTE = ['#174a4b', '#953d32', '#41494e', '#79553a', '#354f70', '#875961'];

export function build(K) {
  // Finishes have a small physical grain; windows are actual openings, not
  // pictures of inaccessible floors on a solid exterior prism.
  K.texture('banpo-tile', 256, 256, (g, w, h) => {
    g.fillStyle = '#c9c4b6'; g.fillRect(0, 0, w, h);
    for (let j = 0; j < 8; j++) for (let i = 0; i < 8; i++) {
      g.fillStyle = ['#d5d0c4', '#ccc7ba', '#c4c1b8', '#d1cabb'][(i * 13 + j * 7) % 4];
      g.fillRect(i * 32 + 1, j * 32 + 1, 30, 30);
      g.fillStyle = 'rgba(85,79,66,.08)'; g.fillRect(i * 32 + 2, j * 32 + 27, 28, 3);
    }
  }, [1.6, 1.6]);
  K.texture('banpo-terrazzo', 256, 256, (g, w, h) => {
    g.fillStyle = '#b9b4a5'; g.fillRect(0, 0, w, h);
    const rnd = K.rand(1983);
    for (let i = 0; i < 900; i++) {
      g.fillStyle = ['#d9d3c5', '#8b8e85', '#aca193', '#e6e0d3'][i % 4];
      const x = rnd() * w, y = rnd() * h;
      g.fillRect(x, y, 1 + rnd() * 3, 1 + rnd() * 3);
    }
    g.strokeStyle = '#948f83'; g.strokeRect(0, 0, w, h);
  }, [1.2, 1.2]);
  K.texture('banpo-shutter', 64, 128, (g, w, h) => {
    g.fillStyle = '#a7aaa5'; g.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 8) { g.fillStyle = '#707773'; g.fillRect(0, y, w, 2); g.fillStyle = '#d0d2ca'; g.fillRect(0, y + 2, w, 1); }
  }, [1, 1.4]);

  meta.claims.forEach((id, blockIndex) => {
    const n = blockIndex + 1, b = K.osmBuilding(id)[0];
    if (!b) throw new Error(`반포쇼핑타운 ${n}동 OSM footprint missing`);
    const poly = b.poly, tenant = TENANTS[n];
    // Long axis points east; the positive v axis points toward 신반포로.
    let long = [0, 0], length = 0;
    for (let i = 0; i < poly.length; i++) {
      const a = poly[i], q = poly[(i + 1) % poly.length], dx = q[0] - a[0], dz = q[1] - a[1], len = Math.hypot(dx, dz);
      if (len > length) { long = dx > 0 ? [dx / len, dz / len] : [-dx / len, -dz / len]; length = len; }
    }
    const [c, negS] = long, s = -negS, angle = Math.atan2(s, c);
    const us = poly.map(p => p[0] * c - p[1] * s), vs = poly.map(p => p[0] * s + p[1] * c);
    const u0 = (Math.min(...us) + Math.max(...us)) / 2, v0 = (Math.min(...vs) + Math.max(...vs)) / 2;
    const W = Math.max(...us) - Math.min(...us), D = Math.max(...vs) - Math.min(...vs), front = D / 2, back = -D / 2;
    const P = (u, v) => [(u + u0) * c + (v + v0) * s, -(u + u0) * s + (v + v0) * c];
    const rect = (a, v, q, t) => [P(a, v), P(q, v), P(q, t), P(a, t)];
    const box = (u, y, v, w, h, d, mat, extra = {}) => { const [x, z] = P(u, v); return K.box({ x, y, z, w, h, d, rotY: angle, mat, ...extra }); };
    const sign = (text, u, y, v, w, h, bg = '#294744', extra = {}) => { const [x, z] = P(u, v); K.sign(text, { x, y, z, w, h, rotY: angle, bg, fg: '#fff9ed', offset: 0.10, ...extra }); };
    const wall = (a, v, q, t, ya, yb, opts = {}) => { const p = P(a, v), r = P(q, t); K.wall(...p, ...r, ya, yb, opts); };
    const face = (u, y, v, w, h, mat) => { const a = P(u - w / 2, v), b = P(u + w / 2, v); const pts = [[...a.slice(0, 1), y, a[1]], [b[0], y, b[1]], [b[0], y + h, b[1]], [a[0], y + h, a[1]]]; K.quad(mat, pts, [s, 0, c]); K.quad(mat, pts, [-s, 0, -c]); };
    const person = (u, y, v, extra = {}) => { const [x, z] = P(u, v); K.person(x, y, z, { rotY: angle, ...extra }); };
    const floorYs = [K.LEVELS.B1, 0, 4, 7.5, 11, 14.5], roof = 18;
    const labels = ['지하 1층', '1층', '2층', '3층', '4층', '5층'];
    const uses = ['식당가', '생활상가', '미용실 · 사무실', '의원 · 사무실', '학원 · 사무실', n === 4 ? '의원 · 상담실' : n === 8 ? '학원 · 학습실' : '학원 · 업무시설'];
    const stairHole = rect(-3.65, -6.35, 4.5, -1.85);
    K.groundHole(stairHole);

    function seat(u, y, v, col = 0x584639, face = 1) {
      box(u, y + 0.43, v, 0.45, 0.10, 0.46, col);
      box(u, y + 0.53, v + face * 0.2, 0.45, 0.40, 0.07, col, { solid: false });
      for (const du of [-0.16, 0.16]) box(u + du, y, v, 0.045, 0.43, 0.36, 0x4b5050, { solid: false, skip: ['n', 's'] });
    }
    function table(u, y, v, dining = true) {
      box(u, y + 0.73, v, 1.12, 0.10, 0.74, dining ? 0x927153 : 0xd8d7c9);
      for (const du of [-0.43, 0.43]) box(u + du, y, v, 0.055, 0.73, 0.50, 0x4d4e4a, { solid: false });
      seat(u - 0.28, y, v + 0.72); seat(u + 0.28, y, v - 0.72, 0x584639, -1);
      if (dining) {
        const p = P(u, v); K.cyl({ x: p[0], z: p[1], y: y + 0.84, r: 0.17, h: 0.035, seg: 6, mat: 0xe9e3d4, solid: false });
        for (const du of [-0.35, 0.35]) box(u + du, y + 0.84, v + 0.13, 0.10, 0.15, 0.10, 0xe6e0c9, { solid: false });
        box(u + 0.35, y + 0.84, v - 0.18, 0.09, 0.23, 0.09, 0x557a42, { solid: false });
      }
    }
    function shelves(u, y, v, w, type, direction = 1) {
      box(u, y, v, w, 1.9, 0.18, 0xaaa391);
      for (let row = 0; row < 3; row++) {
        box(u, y + 0.30 + row * 0.60, v + direction * 0.21, w, 0.055, 0.5, 0xd0ccbe, { solid: false });
        for (let j = 0; j < 4; j++) box(u - w * 0.42 + j * w * 0.26, y + 0.36 + row * 0.60, v + direction * 0.21, w / 6, 0.18 + (j % 3) * 0.05, 0.25, [0x627847, 0xb66745, 0xd6be76, 0x687a83][(j + row + type) % 4], { solid: false });
      }
    }
    const fixtureBox = box, fixtureSign = sign, fixtureWall = wall, fixturePerson = person, fixtureTable = table, fixtureShelves = shelves, fixtureSeat = seat;
    function fixtures(kind, a, q, va, vb, y, name, serial, side) {
      // Counters belong at a shop's back, away from its corridor doorway.
      const V = v => side > 0 ? va + vb - v : v;
      const box = (u, y, v, ...args) => fixtureBox(u, y, V(v), ...args);
      const sign = (text, u, y, v, w, h, bg, extra = {}) => fixtureSign(text, u, y, V(v), w, h, bg, { ...extra, rotY: side > 0 ? angle + PI : angle });
      const wall = (a, v, q, t, ...args) => fixtureWall(a, V(v), q, V(t), ...args);
      const person = (u, y, v, extra) => fixturePerson(u, y, V(v), extra);
      const table = (u, y, v) => fixtureTable(u, y, V(v));
      const shelves = (u, y, v, w, type) => fixtureShelves(u, y, V(v), w, type, side > 0 ? -1 : 1);
      const seat = (u, y, v, col, face = 1) => fixtureSeat(u, y, V(v), col, side > 0 ? -face : face);
      const mid = (a + q) / 2, depth = vb - va, rearV = va + 0.45, centerV = (va + vb) / 2;
      if (kind === 'restaurant') {
        for (let u = a + 1.3; u < Math.min(q - 0.8, a + 4); u += 2.1) for (let v = va + 2.0; v < Math.min(vb - 0.7, va + 3); v += 2.25) table(u, y, v);
        const counterW = Math.min((q - a) * 0.34, 2.4), counterU = a + 0.15 + counterW / 2;
        box(counterU, y, rearV, counterW, 0.9, 0.7, 0x918573);
        box(counterU, y + 0.9, rearV, counterW + 0.05, 0.06, 0.8, 0xc9c7bd, { solid: false });
        box(a + 0.65, y, va + 1.1, 0.7, 1.9, 0.65, 0xc5c7c3);
        box(a + 0.65, y + 0.28, va + 1.44, 0.53, 1.35, 0.04, 0x364b4c, { solid: false });
        for (let j = 0; j < 3; j++) box(counterU - 0.45 + j * 0.40, y + 0.96, rearV, 0.32, 0.18, 0.28, [0x8e3c22, 0x75914e, 0xbd9863][j], { solid: false });
        const menu = name === '일번지육개장' ? ['낙곱전골', '소 39,000  ·  대 45,000', '11:00 ~ 23:00'] : name === '하얀집' ? ['치킨 · 떡볶이', '오뎅탕'] : name === '유메' ? ['덮밥 · 일식', '이자카야'] : ['식사 · 안주', '주문은 카운터에서'];
        sign(menu, mid, y + 2.0, va + 0.15, Math.min(2.8, q - a - 0.5), 0.9, '#eee0c8', { fg: '#312d25' });
        if (serial % 3 === 0) person(q - 1.0, y, centerV, { sit: true, shirt: 0x5d6479 });
      } else if (kind === 'salon') {
        for (let u = a + 1.0; u < Math.min(q - 0.6, a + 3); u += 1.65) {
          box(u, y + 0.85, rearV, 1.15, 1.4, 0.10, 0x353c3c, { solid: false });
          box(u, y + 0.95, rearV + 0.06, 0.99, 1.17, 0.025, 0xb4d0d1, { solid: false });
          box(u, y + 0.8, rearV + 0.38, 1.1, 0.08, 0.65, 0xb9aa96);
          seat(u, y, rearV + 1.15, 0x302f31);
          for (let k = 0; k < 3; k++) box(u - 0.3 + k * 0.16, y + 0.88, rearV + 0.3, 0.09, 0.22, 0.09, 0xc6aa83, { solid: false });
        }
        box(q - 0.65, y, vb - 0.8, 0.9, 0.95, 0.8, 0xc5b598);
        box(a + 0.7, y + 0.5, vb - 0.7, 0.65, 0.35, 0.65, 0xe5e3dd);
      } else if (kind === 'clinic') {
        box(mid, y, va + 1.1, Math.min(3.0, q - a - 0.7), 1.04, 0.75, 0xd5cbb9);
        box(mid, y + 1.04, va + 1.1, Math.min(3.05, q - a - 0.6), 0.07, 0.81, 0xf0ece1);
        box(mid + 0.4, y + 1.11, va + 1.0, 0.48, 0.36, 0.07, 0x303c3f, { solid: false });
        // Keep a full-width route from the central door to reception; a chair
        // row across the entire bay would form an impassable capsule barrier.
        for (let u = a + 0.8; u < mid - 0.9; u += 0.8) seat(u, y, vb - 0.8, 0x8eaba5);
        wall(q - 1.7, va + 0.2, q - 1.7, vb - 1.5, y, y + 2.6, { mat: 0xe5e9e4, openings: [{ at: 1.4, w: 1.2, y0: y, y1: y + 2.2 }] });
        if (name.includes('정신건강')) {
          seat(q - 1.05, y, centerV - 0.5, 0xa28b72, -1);
          seat(q - 1.05, y, centerV + 1.2, 0x7c9b90);
          box(q - 1.05, y + 0.42, centerV + 0.35, 0.65, 0.07, 0.6, 0xc6b496);
        } else box(q - 0.9, y + 0.55, centerV, 0.6, 0.2, 1.75, 0xb0cbc3);
        sign('접수 · 진료 안내', mid, y + 2.05, va + 0.12, Math.min(2.5, q - a - 0.5), 0.45, '#f0eee4', { fg: '#48615e' });
        box(a + 0.55, y, va + 0.5, 0.45, 1.05, 0.4, 0xe5e6dd);
        box(a + 0.55, y + 1.05, va + 0.5, 0.23, 0.4, 0.24, { tex: 'glass', color: 0xb6d7e3 }, { solid: false });
        sign('진료실', q - 1.25, y + 2.18, va + 1.6, 1.35, 0.35, '#5b7b76');
      } else if (kind === 'electronics') {
        for (let u = a + 1; u < q - 0.5; u += 1.5) {
          box(u, y, rearV + 0.2, 0.8, 1.9, 0.7, 0xd0d2ce);
          box(u, y + 0.96, rearV + 0.57, 0.72, 0.025, 0.02, 0x4e5352, { solid: false });
          box(u, y + 0.6, rearV + 0.59, 0.035, 0.3, 0.03, 0x747c7c, { solid: false });
          box(u, y + 0.6, vb - 1.1, 1.05, 0.65, 0.08, 0x263a44);
          box(u, y + 0.65, vb - 1.04, 0.96, 0.54, 0.02, 0x7b9fa5, { solid: false });
          box(u, y, vb - 1.1, 1.16, 0.6, 0.45, 0xb2ada2);
        }
      } else if (kind === 'office' || kind === 'classroom' || kind === 'estate' || kind === 'bank') {
        for (let u = a + 1.1; u < Math.min(q - 0.5, a + 3); u += 1.65) for (let v = va + 1.35; v < Math.min(vb - 0.9, va + 2); v += 1.75) {
          box(u, y + 0.72, v, 1.1, 0.08, 0.65, 0xb4a38a);
          box(u, y, v, 0.10, 0.72, 0.1, 0x65706a, { solid: false });
          seat(u, y, v + 0.6, 0x4e5a5a);
          if (kind !== 'classroom') box(u, y + 0.8, v - 0.15, 0.46, 0.33, 0.05, 0x354a51, { solid: false });
          box(u - 0.3, y + 0.8, v + 0.1, 0.22, 0.025, 0.27, 0xe3ded0, { solid: false });
        }
        if (kind === 'classroom') {
          box(mid, y + 1.1, rearV, Math.min(3.2, q - a - 0.6), 1.25, 0.08, 0x34544c, { solid: false });
          sign(['오늘의 학습', '개념 정리 · 문제 풀이'], mid, y + 1.8, rearV + 0.06, 2.4, 0.68, '#34544c');
          // Deeper teaching rooms have a second row, books and a lectern.
          for (let u = a + 1; u < q - 0.7; u += 1.7) {
            box(u, y + 0.72, vb - 1.45, 0.95, 0.07, 0.55, 0xc4b99f);
            seat(u, y, vb - 0.85, 0x506a67);
            box(u, y + 0.79, vb - 1.45, 0.25, 0.04, 0.32, 0x687f96, { solid: false });
          }
          box(q - 0.7, y, va + 1.0, 0.7, 1.02, 0.5, 0xa68c6d);
        }
        else { box(a + 0.5, y, rearV, 0.65, 1.8, 0.45, 0xb9b4a3); for (let k = 0; k < 2; k++) box(a + 0.3 + k * 0.26, y + 1.1, rearV + 0.24, 0.08, 0.3, 0.14, 0x606f60, { solid: false }); }
        if (kind === 'estate') for (let j = 0; j < 5; j++) sign(['매매 · 임대', '상담 안내'], a + 0.6 + j * (q - a - 1.2) / 4, y + 1.7, vb - 0.1, 0.44, 0.55, '#f1ead2', { fg: '#7a3f28' });
      } else if (kind === 'laundry') {
        box(mid, y, va + 1, q - a - 0.5, 0.85, 0.7, 0xb3b6ae);
        box(mid, y + 1.9, va + 1.1, q - a - 0.7, 0.06, 0.06, 0x666a65, { solid: false });
        for (let i = 0; i < 12; i++) box(a + 0.4 + i * (q - a - 0.8) / 12, y + 1.0, va + 1.1, 0.18, 0.85, 0.42, [0x888e9b, 0xd7c8ad, 0x546a82][i % 3], { solid: false });
      } else {
        shelves(a + (q - a) * 0.23, y, rearV, (q - a) * 0.36, serial);
        box(a + (q - a) * 0.24, y, vb - 1.1, (q - a) * 0.38, 0.82, 0.85, 0xaea797);
        box(a + (q - a) * 0.24, y + 0.82, vb - 1.1, (q - a) * 0.38, 0.4, 0.8, 'glass', { solid: false });
        for (let j = 0; j < 3; j++) box(a + 0.35 + j * (q - a) * 0.11, y + 0.86, vb - 1.1, (q - a) / 8, 0.13, 0.5, [0xae6336, 0x76894b, 0xd4bb8b, 0x9c4c43][j % 4], { solid: false });
      }
    }

    // A continuous shopfront forecourt is deliberately confined to the frontage;
    // the station, arterial road and their stairs are not duplicated here.
    const fore = rect(-W / 2 + (n === 1 ? 8 : 0.4), front + 0.15, W / 2 - 1, front + 3.8);
    K.slab(fore, 0.025, { mat: 'sidewalk', thick: 0.06, ceil: false });
    box(-1.3, 3.05, front + 0.55, 9.1, 0.18, 2.0, 0x525952, { solid: false });
    sign(`반포쇼핑타운 ${n}동`, -1.3, 3.58, front + 0.35, 10.3, 0.82, n === 2 ? '#6b7270' : '#284d49');
    sign(`${n}동`, n === 1 ? -1.5 : -W / 2 + 2.3, 16.75, front + 0.24, 2.7, 1.3, '#e5e0d3', { fg: '#324f4d' });
    sign('지하 식당가 ↓', -4.7, 2.5, front + 0.9, 1.5, 0.65, '#985138', { rotY: angle + PI / 2, twoSided: true });
    if (tenant.b.length) sign(tenant.b.slice(0, 4), -W / 2 + (n === 1 ? 8 : 2.2), 2, front + 0.6, 2.0, 2.05, '#f0e7ce', { fg: '#793b2e' });
    // Slender tactile strip and threshold stay flat enough for the player capsule.
    for (let u = -4.8; u < 1.5; u += 0.26) box(u, 0.027, front + 0.9, 0.14, 0.025, 0.6, 0xd2ad54, { solid: false });
    const gutterU = Math.max(...us.filter((_, i) => vs[i] - v0 > front - 0.2)) - u0 - 0.35;
    box(gutterU, 0.1, front + 0.13, 0.09, roof - 0.3, 0.12, 0x777c72, { solid: false });

    floorYs.forEach((y, f) => {
      const next = f === 5 ? roof : floorYs[f + 1], height = next - y;
      const ceiling = f === 0 ? y + 3.15 : next - 0.27;
      K.slab(poly, y, { mat: 'banpo-terrazzo', thick: 0.24, holes: f === 0 ? [] : [stairHole] });
      if (f === 0) K.hpoly('ceiling', poly, ceiling, false, [stairHole]);
      const names = f === 0 ? tenant.b : f === 1 ? tenant.g : f === 2 ? tenant.h : f === 3 && tenant.clinic ? [tenant.clinic] : f === 4 ? tenant.fourth || [] : f === 5 ? tenant.fifth || [] : [];
      K.zone({ name: `반포쇼핑타운 ${n}동`, floor: labels[f], sub: [...names, uses[f]].join(' · '), poly, y0: y, y1: next - 0.03, priority: 2 });

      const openings = [];
      if (f === 1) for (const v of [front, back]) { const p = P(-1.5, v); openings.push({ x: p[0], z: p[1], w: v === front ? 8 : 2.6, y0: y, y1: y + 2.9 }); }
      if (f === 1) {
        const spans = [[-W / 2 + (n === 1 ? 7.8 : 0.65), -6.15], [6.15, W / 2 - (n === 8 ? 2.6 : 0.65)]];
        for (const [a, b] of spans) {
          if (b - a < 2.1) continue;
          const count = Math.max(1, Math.round((b - a) / (n === 5 ? 3.6 : 6.2)));
          for (let j = 0; j < count; j++) {
            const left = a + (b - a) * j / count, right = a + (b - a) * (j + 1) / count, mid = (left + right) / 2;
            if (!rect(left + 0.2, 1.85, right - 0.2, front - 0.45).every(p => K.pointInPoly(...p, poly))) continue;
            const p = P(mid, front);
            openings.push({ x: p[0], z: p[1], w: right - left - 0.2, y0: y, y1: y + 2.7 });
            // Two fixed windows surround a genuinely open 1.5m door.
            for (const sg of [-1, 1]) {
              const paneW = (right - left - 1.7) / 2;
              box(mid + sg * (0.75 + paneW / 2), y, front - 0.08, paneW, 2.7, 0.035, 'glass', { solid: true });
              face(mid + sg * 0.76, y, front + 0.01, 0.06, 2.72, 0x607366);
            }
            face(mid, y + 2.68, front + 0.01, right - left - 0.15, 0.07, 0x607366);
          }
        }
      }
      // Actual glazing apertures, frame and sill on front/back at every upper floor.
      const bays = [];
      for (let u = -W / 2 + 2.1; u < W / 2 - 1.7; u += 4.5) {
        for (const v of [front, back]) {
          // Avoid the truncated west corner of block 1 and east corner of block 8.
          if (!K.pointInPoly(...P(u, v > 0 ? v - 0.45 : v + 0.45), poly)) continue;
          if (f === 1 && (v === front || Math.abs(u + 1.5) < 5.5)) continue;
          const p = P(u, v); const winW = f === 1 ? 2.5 : 2.35;
          if (![u - winW / 2 - 0.1, u + winW / 2 + 0.1].every(t => K.pointInPoly(...P(t, v > 0 ? v - 0.10 : v + 0.10), poly))) continue;
          if (f > 0) {
            openings.push({ x: p[0], z: p[1], w: winW, y0: y + (f === 1 ? 0.18 : 0.95), y1: y + (f === 1 ? 2.65 : 2.65) });
            bays.push({ u, v, w: winW });
          }
        }
      }
      K.polyWalls(poly, y, next, { mat: f === 0 ? 0xa29c8b : n === 2 ? 0xbfc2bc : 'banpo-tile', inner: f === 0 ? 0xd9ccb3 : 0xe6e2d5, thick: 0.24, openings });
      bays.forEach(({ u, v, w }, wi) => {
        const sg = Math.sign(v), low = f === 1 ? 0.18 : 0.95, high = 2.65;
        box(u, y + low, v - sg * 0.09, w, high - low, 0.035, { tex: 'glass', color: 0x88a8a5 }, { solid: true });
        for (const du of [-w / 2, 0, w / 2]) face(u + du, y + low - 0.04, v, 0.06, high - low + 0.08, 0x5b675f);
        for (const h of [low, high]) face(u, y + h - 0.025, v, w + 0.10, 0.05, 0x56615c);
        box(u, y + low - 0.10, v + sg * 0.12, w + 0.22, 0.10, 0.42, 0xa5a79d, { solid: false });
        if (f >= 2 && wi % 3 === 0) {
          // Mount above the window so the sign band below stays unobstructed.
          box(u + 0.7, y + 2.75, v + sg * 0.43, 0.88, 0.55, 0.50, 0xd4d3c6, { solid: false });
          face(u + 0.7, y + 2.82, v + sg * 0.7, 0.7, 0.35, 'banpo-shutter');
        }
      });
      if (f > 0) {
        K.polyWalls(poly.map(([x, z]) => { const o = P(0, 0); return [o[0] + (x - o[0]) * 1.007, o[1] + (z - o[1]) * 1.007]; }), next - 0.16, next - 0.025, { mat: n === 2 ? 0x777f7d : 0x8c9181, thick: 0.38, solid: false });
      }
      // Shared two-sided shopping corridor, with no random crowd on stairs.
      for (let u = -W / 2 + 2; u < W / 2 - 1.5; u += 4.5) {
        if (!K.pointInPoly(...P(u, 0), poly)) continue;
        box(u, ceiling - 0.08, 0, 1.1, 0.055, 0.38, { tex: 'emit', color: 0xfff0cc }, { solid: false });
      }
      // Core: stair lobby on the left, lift opening toward the corridor on the right.
      sign([`${n}동  ${labels[f]}`, f === 0 ? '식당가  ·  출구 ↑' : '계단 ←   승강기 →'], -1.6, y + 2.45, 1.6, 4.2, 0.66, '#30554e', { twoSided: true });
      sign('계단', -4.7, y + 2.15, -1.5, 1.1, 0.4, '#37705e');
      sign('비상구 →', 4.8, y + 2.45, 0, 1.0, 0.30, '#337957', { rotY: angle + PI / 2, twoSided: true });
      box(-5.45, y + 0.2, -1.55, 0.22, 0.56, 0.22, 0xb7332c);
      if (f === 0 && names.length) {
        // Repeat the actual directory at the stair arrival, so named restaurants
        // on the other side of the core remain discoverable from either wing.
        sign(['지하 식당가', ...names], -2.1, y + 1.7, front - 0.35, 3.6, 2.5, '#f0e4cc', { fg: '#613d2b', rotY: angle + PI });
        sign([names.slice(0, 3).join(' · '), '← 식당가'], -8.0, y + 2.55, 0, 4.1, 0.6, '#7b4631', { rotY: angle + PI / 2, twoSided: true });
      }
      if (f === 3 && tenant.clinic) {
        // This front lobby is the formerly empty room in the reviewer view.
        // All fixtures sit beyond v=4.6, clear of the lift at v=1.9..4.3.
        const receptionV = front - 1.7;
        box(-2.15, y, receptionV, 2.7, 1.0, 0.72, 0xa8bdb1);
        box(-2.15, y + 1.0, receptionV, 2.82, 0.08, 0.82, 0xf3eee1);
        box(-1.5, y + 1.08, receptionV + 0.06, 0.48, 0.32, 0.07, 0x3c514f, { solid: false });
        sign('접수 안내', -2.6, y + 0.62, receptionV - 0.4, 1.1, 0.3, '#a8bdb1', { fg: '#244d47', rotY: angle + PI });
        sign([tenant.clinic, n === 3 ? '310호  ·  서쪽 복도' : '진료실  ·  서쪽 복도'], -2.1, y + 2.2, front - 0.2, 4.5, 0.9, '#e6ece3', { fg: '#315e55', rotY: angle + PI });
        for (const u of [-5.15, -4.4, -3.65]) seat(u, y, front - 3.5, 0x7a9d91);
        box(-4.7, y, front - 1.45, 0.65, 0.62, 0.5, 0xd6c9aa);
        for (let j = 0; j < 3; j++) box(-4.9 + j * 0.17, y + 0.62, front - 1.45, 0.14, 0.025, 0.32, [0xd5b17a, 0x7b9993, 0xcda79e][j], { solid: false });
        box(0.0, y, front - 0.7, 0.45, 0.95, 0.42, 0xe3e3d8);
        sign('정수기', 0.0, y + 1.25, front - 0.95, 0.65, 0.23, '#e3e3d8', { fg: '#385a55', rotY: angle + PI });
        person(-5.15, y, front - 3.5, { sit: true, shirt: 0x8d786e });
        box(-2.2, ceiling - 0.07, front - 3.0, 2.1, 0.05, 0.6, { tex: 'emit', color: 0xfff2d8 }, { solid: false });
      } else if (f >= 2) {
        // A quiet shared waiting/study corner differentiates the upper lobbies.
        const noticeV = front - 0.25;
        sign([`${labels[f]}  이용 안내`, f >= 4 ? '상담 · 수업 안내' : '방문 전 호실을 확인해 주세요', '계단 · 승강기  뒤쪽'], -2.2, y + 1.85, noticeV, 3.0, 1.25, '#e9e2ce', { fg: '#435c52', rotY: angle + PI });
        for (const u of [-4.8, -3.95]) seat(u, y, front - 2.0, f % 2 ? 0x8c7460 : 0x617b79);
        box(-2.4, y, front - 1.65, 1.55, 0.65, 0.55, 0xb5a58e);
        box(-2.4, y + 0.65, front - 1.65, 1.6, 0.05, 0.6, 0xe3d9bd);
        box(-2.4, y + 0.7, front - 1.65, 0.35, 0.03, 0.3, 0x768b85, { solid: false });
      }
      if (f > 0) {
        wall(-3.65, -1.82, 4.55, -1.82, y, y + 1.05, { thick: 0.075, mat: 0x6f7d72 });
        // Keep the full-floor landing at u<-3.65 open to BOTH flights.
        wall(-5.75, -6.55, 4.7, -6.55, y, next, { mat: 0xc3c6b6, thick: 0.12 });
      }
      // Toilets have a clear doorway, cubicle, washbasin and mirror on every floor.
      wall(5.1, -1.65, 8.5, -1.65, y, ceiling, { mat: 0xe0ded1, openings: [{ at: 1.1, w: 1.3, y0: y, y1: y + 2.2 }] });
      wall(8.5, back + 0.35, 8.5, -1.65, y, ceiling, { mat: 0xe0ded1 });
      wall(5.1, back + 0.35, 5.1, -1.65, y, ceiling, { mat: 0xe0ded1 });
      sign('화장실', 6.2, y + 2.35, -1.55, 1.2, 0.35, '#5c7168');
      box(7.7, y + 0.7, -2.5, 0.65, 0.17, 0.55, 0xe8e7db);
      box(8.35, y + 1.1, -2.65, 0.04, 0.8, 0.7, 0xa1c0be, { solid: false });
      box(6.1, y, back + 1.1, 0.6, 0.45, 0.8, 0xe8e7db);
      wall(5.2, back + 2.0, 7.25, back + 2.0, y, y + 2.1, { mat: 0xbac5ba, openings: [{ at: 0.9, w: 1.0, y0: y, y1: y + 2.1 }] });

      let serial = 0, namedIndex = 0;
      // Front units first: confirmed street shops retain recognisable frontage.
      for (const side of [1, -1]) {
        const minV = side > 0 ? 1.75 : back + 0.45, maxV = side > 0 ? front - 0.35 : -1.75;
        const spans = [[-W / 2 + (n === 1 ? 7.8 : 0.65), -6.15], [side < 0 ? 9 : 6.15, W / 2 - (n === 8 ? 2.6 : 0.65)]];
        for (const [start, end] of spans) {
          if (end - start < 2.1) continue;
          const count = Math.max(1, Math.round((end - start) / (n === 5 && f === 1 ? 3.6 : f >= 3 ? 12 : f === 2 ? 9 : 6.2)));
          for (let j = 0; j < count; j++) {
            const a = start + (end - start) * j / count, q = start + (end - start) * (j + 1) / count, mid = (a + q) / 2;
            if (!rect(a + 0.2, minV + 0.1, q - 0.2, maxV - 0.1).every(p => K.pointInPoly(...p, poly))) continue;
            let name = names[namedIndex++] || '', kind;
            const hasTenant = !!name;
            if (f === 0) kind = 'restaurant';
            else if (/치과|의원|의학과/.test(name)) kind = 'clinic';
            else if (/베스트샵/.test(name)) kind = 'electronics';
            else if (/기업은행/.test(name)) kind = 'bank';
            else if (/공인중개/.test(name)) kind = 'estate';
            else if (/KFC/.test(name)) kind = 'restaurant';
            else if (/GS25/.test(name)) kind = 'grocery';
            else if (/서비스센터/.test(name)) kind = 'office';
            else if (/학원|어학|에듀/.test(name)) kind = 'classroom';
            else if (name) kind = 'salon';
            else kind = f === 1 ? ['grocery', 'laundry', 'grocery', 'estate'][serial % 4] : f === 3 && tenant.clinic ? 'clinic' : f >= 4 && serial % 2 === 0 ? 'classroom' : 'office';
            if (!name) name = f === 0 ? '식당' : kind === 'grocery' ? ['반찬 · 식품', '떡 · 한과', '정육'][serial % 3] : kind === 'laundry' ? '세탁 · 수선' : kind === 'estate' ? '부동산' : kind === 'classroom' ? '학원' : '사무실';
            const room = f === 0 ? `지하 ${serial + 1}호` : `${f * 100 + serial + 1}호`;
            const use = kind === 'clinic' ? ['상담실', '대기실', '진료실'][serial % 3] : kind === 'classroom' ? ['강의실', '학습실', '상담실'][serial % 3] : ['업무실', '상담실', '회의실'][serial % 3];
            const atCorridor = side > 0 ? minV : maxV, inwardRot = side > 0 ? angle + PI : angle;
            box(a, y, atCorridor, 0.28, ceiling - y, 0.28, 0xc7c5b8);
            box(a, y, atCorridor, 0.32, 0.85, 0.32, 0x8e988b, { solid: false });
            wall(a, minV, a, maxV, y, ceiling, { mat: f === 0 ? 0xcbbaa1 : 0xe0ddd1, thick: 0.12 });
            wall(a, atCorridor, q, atCorridor, y, ceiling, { mat: f <= 2 ? 'glass' : 0xe4dfd1, thick: f <= 2 ? 0.04 : 0.12, openings: [{ at: (q - a) / 2, w: 1.45, y0: y, y1: y + 2.25 }] });
            for (const u of [mid - 0.76, mid + 0.76]) box(u, y, atCorridor, 0.055, 2.25, 0.075, 0x667369, { solid: false });
            box(mid, y + 2.21, atCorridor, 1.55, 0.06, 0.09, 0x667369, { solid: false });
            // Unknown upper tenants get restrained room/use plaques, not large
            // repetitive invented business signs. Verified names stay prominent.
            const signText = !hasTenant && f === 0 ? [room, '식사 · 안주'] : hasTenant || f === 1 ? name : [room, use];
            sign(signText, mid, y + 2.55, atCorridor, hasTenant || f < 2 ? q - a - 0.25 : 1.75, hasTenant || f < 2 ? 0.55 : 0.62, PALETTE[(serial + n + f) % PALETTE.length], { rotY: inwardRot, twoSided: true });
            if (f >= 3) {
              const towardCorridor = side > 0 ? -1 : 1;
              const panelV = atCorridor + towardCorridor * 0.08;
              for (const [ua, ub] of [[a + 0.18, mid - 0.82], [mid + 0.82, q - 0.12]]) {
                box((ua + ub) / 2, y + 0.05, panelV, ub - ua, 0.76, 0.04, [0xa4b6a5, 0xb5a594, 0xa7b5b7][(serial + f) % 3], { solid: false });
                box((ua + ub) / 2, y + 0.81, panelV, ub - ua, 0.045, 0.055, 0x677c70, { solid: false });
              }
              // Notice board alongside the open door, with clear circulation.
              if (q - a > 7) sign(kind === 'clinic' ? ['진료 안내', '접수 후 기다려 주세요'] : kind === 'classroom' ? ['수업 안내', '교재를 준비해 주세요'] : ['방문 안내', '담당자에게 문의해 주세요'], mid + 1.65, y + 1.55, panelV, 1.05, 0.68, '#eee5ce', { fg: '#4d5c51', rotY: inwardRot });
            }
            sign(name === '온유월식당' ? '지하 20호' : name === '봄치과의원' ? '310호' : name === '마루정신건강의학과' ? '510호' : name === '반포대학나무학원' ? '1~4호' : name === '네오스터디학원' ? '18·19호' : name === '뉴스타공인중개사사무소' ? '1층 15호' : name === '정선 감자탕' ? '지하 6~9호' : room, a + 0.5, y + 1.45, atCorridor, 0.75, 0.3, '#e4ddc9', { fg: '#514d40', rotY: inwardRot, twoSided: true });
            fixtures(kind, a + 0.15, q - 0.15, minV + 0.1, maxV - 0.1, y, name, serial, side);
            box(mid, ceiling - 0.07, (minV + maxV) / 2, 0.85, 0.05, 0.45, { tex: 'emit', color: 0xffe8bd }, { solid: false });
            if (side > 0 && f >= 1 && (hasTenant || f === 1)) {
              sign(name, mid, y + (f === 1 ? 3.12 : 0.47), front + 0.2, q - a - 0.18, f === 1 ? 0.65 : 0.69, name === 'LG전자 베스트샵' ? '#727a78' : PALETTE[(serial + n) % PALETTE.length]);
              if (f === 1) {
                // Each storefront has its own open doorway and short canopy.
                box(mid, 2.75, front + 0.35, q - a - 0.12, 0.12, 0.9, 0x6d8074, { solid: false });
              }
            }
            serial++;
          }
          // The east tip of block 8 is chamfered; do not extend an unused
          // rectangular unit boundary through its diagonal exterior wall.
          if ([P(end, minV), P(end, maxV)].every(p => K.pointInPoly(...p, poly)))
            wall(end, minV, end, maxV, y, ceiling, { mat: 0xd7d3c5, thick: 0.12 });
        }
      }
      // Interior directory uses confirmed names even where there are more POIs
      // than available reconstructed units (many OSM pins share one coordinate).
      const guide = [labels[f] + '  층별안내', ...names, uses[f]];
      sign(guide, 4.4, y + 1.65, front - 0.7, 2.1, 2.3, '#ece4cf', { fg: '#31534b', rotY: angle + PI });
      if (f === 1) { sign(['반포쇼핑타운', `${n}동`, '지하 식당가', '2층 미용 · 업무', '3층 의원 · 업무', '4·5층 학원 · 업무'], 3.3, 1.65, front + 0.18, 2.2, 2.3, '#e3decb', { fg: '#34574e' }); }
      for (let u = -W / 2 + 4; u < W / 2 - 2; u += 12) if (Math.abs(u) > 6) person(u, y, 0.7, { shirt: [0x877459, 0x405969, 0x657959][(f + n) % 3] });
    });

    // One continuous switchback stair links every level. Its midpoint landing
    // is inside the floor hole. Near landings are intact pieces of the main slab.
    for (let f = 0; f < floorYs.length - 1; f++) {
      const y = floorYs[f], next = floorYs[f + 1], half = (y + next) / 2;
      const a = P(-3.8, -2.9), b = P(2.55, -2.9), d = P(2.55, -5.25), e = P(-3.8, -5.25);
      K.stairs(...a, ...b, { ya: y, yb: half, w: 1.8, mat: 'banpo-terrazzo', railWalls: false });
      K.slab(rect(2.5, -6.2, 4.48, -1.95), half, { mat: 'banpo-terrazzo', thick: 0.15 });
      K.stairs(...d, ...e, { ya: half, yb: next, w: 1.8, mat: 'banpo-terrazzo', railWalls: false });
      // Closed concrete undersides: kit stairs supply treads/risers but no soffit.
      for (const [ua, ub, v, ya, yb] of [[-3.8, 2.55, -2.9, y, half], [2.55, -3.8, -5.25, half, next]]) {
        const p0 = P(ua, v - 0.9), p1 = P(ub, v - 0.9), p2 = P(ub, v + 0.9), p3 = P(ua, v + 0.9);
        K.quad(0xa9a99b, [[p0[0], ya - 0.2, p0[1]], [p1[0], yb - 0.2, p1[1]], [p2[0], yb - 0.2, p2[1]], [p3[0], ya - 0.2, p3[1]]], [0, -1, 0]);
      }
      // Slim individual guard posts do not create infinitely tall barriers below.
      for (let k = 0; k <= 2; k++) for (const [v, reverse] of [[-2.0, false], [-3.8, false], [-4.35, true], [-6.15, true]]) {
        const u = -3.8 + k * 6.35 / 2, py = reverse ? next - k * (next - half) / 2 : y + k * (half - y) / 2;
        box(u, py, v, 0.045, 0.94, 0.045, 0x748276, { solid: false });
      }
      wall(4.5, -6.25, 4.5, -1.9, half, half + 1.0, { mat: 0x738173, thick: 0.06 });
    }
    const lift = P(2.4, 3.1);
    K.elevator({ name: `${n}동 승강기`, x: lift[0], z: lift[1], rotY: angle + PI, w: 2.25, d: 2.4, shaft: false,
      floors: floorYs.map((y, f) => ({ label: labels[f], y, name: uses[f] })) });
    // K.wall cannot union vertically stacked openings (kit elevator bug).
    // Build one doorway wall per storey; retain K.elevator's real interaction.
    for (let f = 0; f < floorYs.length; f++) {
      const y = floorYs[f], top = f === 5 ? roof : floorYs[f + 1];
      wall(1.275, 4.3, 3.525, 4.3, y, top, { mat: 0xb6beb4, thick: 0.15 });
      wall(1.275, 1.9, 1.275, 4.3, y, top, { mat: 0xb6beb4, thick: 0.15 });
      wall(3.525, 1.9, 3.525, 4.3, y, top, { mat: 0xb6beb4, thick: 0.15 });
      wall(1.275, 1.9, 3.525, 1.9, y, top, { mat: 0x899990, thick: 0.15, openings: [{ at: 1.125, w: 1.35, y0: y, y1: y + 2.2 }] });
      K.slab(rect(1.275, 1.9, 3.525, 4.3), y + 0.005, { mat: 'metal', thick: 0.02, ceil: false, edge: false });
      sign(labels[f], 2.4, y + 2.47, 1.80, 0.75, 0.29, '#20312c', { fg: '#f1c781', rotY: angle + PI });
      box(3.72, y + 1.0, 1.82, 0.12, 0.22, 0.06, 0x5c6a60, { solid: false });
    }
    K.slab(poly, roof, { mat: 'roofgravel', under: 'ceiling', thick: 0.25 });
    K.polyWalls(poly, roof, roof + 0.65, { mat: n === 2 ? 0xb5bab2 : 'banpo-tile', thick: 0.2 });
    box(-0.2, roof, -3.8, 9.7, 2.0, 5.2, 0xa7ada1);
    box(-0.2, roof + 2, -3.8, 10.1, 0.16, 5.6, 0x667465);
    for (let u = -W / 2 + 6; u < W / 2 - 3; u += 8) {
      if (Math.abs(u) < 6) continue;
      box(u, roof + 0.18, 2.2, 1.8, 0.9, 1.2, 0xbac0b6, { solid: false });
      for (let j = 0; j < 4; j++) box(u, roof + 0.3 + j * 0.13, 2.82, 1.6, 0.04, 0.03, 0x606e63, { solid: false });
    }
    // Plant pots, stools and parked delivery clutter stay out of the 3m entry.
    for (const u of [-6.3, 6.5]) {
      box(u, 0, front + 2.7, 0.65, 0.55, 0.6, 0x84775f);
      const p = P(u, front + 2.7); K.dome({ x: p[0], y: 0.54, z: p[1], rx: 0.43, ry: 0.55, rz: 0.4, seg: 8, rings: 3, mat: 0x5e7953 });
    }
    person(-2.6, 0.025, front + 2.7); person(9.8, 0.025, front + 1.7, { shirt: 0x9e7055 });
    const spawn = (name, u, y, v, yaw = angle) => { const p = P(u, v); K.spawn({ name, x: p[0], y, z: p[1], yaw }); };
    if ([1, 4, 8].includes(n)) spawn(`${n}동 앞 · 신반포로`, -1.5, 0.025, front + 3.0);
    if (n === 2) spawn('2동 · LG전자 서비스센터', -6.8, 4, 0, angle + PI / 2);
    if (n === 3) spawn('3동 · 지하 식당가', -6.8, -6, 0, angle + PI / 2);
    if (n === 5) spawn('5동 · 일번지육개장', -6.8, -6, 0, angle + PI / 2);
    if (n === 6) spawn('6동 · 반포좋은치과의원', -6.8, 7.5, 0, angle + PI / 2);
    if (n === 8) spawn('8동 · 5층 학원가', -6.8, 14.5, 0, angle + PI / 2);
  });
}
