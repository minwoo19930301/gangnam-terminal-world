// 센트럴시티 — 호남선 고속버스터미널(센트럴시티터미널) · 파미에스테이션 · 메가박스 센트럴 · 옥상/타워 주차장
// Real OSM footprints: 356127040 (terminal complex, H9), 593858530 (파미에스테이션 원형관, 2F H8.4),
// 601356623 (타워주차장, H9), 1173096805 (버스 주차장 데크, layer 1), area 1173096801 (호남선 버스 주차장).
// The complex is a long low podium (1F terminal hall + 2F 식당가, 9 m) whose roof is a car deck with a one-way loop road
// (OSM service ways 593858534/536/537, layer 1) linked by bridges to the 타워주차장 and the yard deck (layer 2 roads).
//
// Local frame: the strip runs along OSM's west facade (-135.7,9.9)->(-80.7,150.7).
//   s = distance south along that facade, t = distance east (toward 신세계/JW). P(s,t) -> world [x,z].
//   strip:        s -22..151, t 0..38.5   (1F hall; buses park nose-in under the 2F overhang on the west, t<6)
//   south block:  s 151..204, t -98..38   (파미에스테이션 1F/2F, 하차장, 메가박스 B1)
export const meta = {
  id: 'centralcity',
  name: '센트럴시티 (호남선 터미널 · 파미에스테이션)',
  claims: [356127040, 593858530, 601356623, 1173096805],
  claimRoads: [593858534, 593858536, 593858537, 1128012726, 1128012724, 1185035520, 1065783056, 1185035521],
  claimAreas: [1173096801],
  sources: [
    'https://namu.wiki/w/센트럴시티',
    'https://ko.wikipedia.org/wiki/센트럴시티_(건축물)',
    'https://nuthang.com/센트럴시티-터미널/',
    'https://www.dailian.co.kr/news/view/688291/',
    'https://biz.newdaily.co.kr/site/data/html/2018/01/22/2018012210006.html',
    'https://biz.newdaily.co.kr/site/data/html/2016/05/24/2016052410007.html',
    'https://limeade.kr/센트럴-메가박스-상영시간표/',
    'https://www.kukinews.com/article/view/kuk201807180185',
    'OpenStreetMap (data/osm.json): footprints, service roads, POIs',
  ],
};

export function build(K) {
  const PI = Math.PI;
  const YB1 = K.LEVELS.B1, Y1 = 0, Y2 = 5, YR = 9; // B1 -6 · 1F 0 · 2F 5 · 옥상 9
  const C1 = Y2 - 0.3, C2 = YR - 0.4, CB = Y1 - 0.3; // ceiling undersides
  const rnd = K.rand(7311);
  const sign = (text, o) => K.sign(text, { pxPerM: 64, ...o });

  // ---------------------------------------------------------------- frame
  const R = Math.atan2(0.3639, 0.9315);
  const AX = Math.sin(R), AZ = Math.cos(R), EX = Math.cos(R), EZ = -Math.sin(R);
  const OX = -135.7, OZ = 9.9;
  const P = (s, t) => [OX + AX * s + EX * t, OZ + AZ * s + EZ * t];
  const RECT = (s0, t0, s1, t1) => [P(s0, t0), P(s1, t0), P(s1, t1), P(s0, t1)];
  const F = { S: R, N: R + PI, E: R + PI / 2, W: R - PI / 2 };
  const lbox = (s, t, ds, dt, y, h, mat, o = {}) => { const [x, z] = P(s, t); return K.box({ x, z, y, h, w: dt, d: ds, rotY: R, mat, ...o }); };
  const lsign = (text, s, t, y, w, h, face, o = {}) => { const [x, z] = P(s, t); sign(text, { x, z, y, w, h, rotY: F[face], ...o }); };
  const lwall = (s0, t0, s1, t1, y0, y1, o = {}) => { const a = P(s0, t0), b = P(s1, t1); K.wall(a[0], a[1], b[0], b[1], y0, y1, o); };
  const lcyl = (s, t, y, r, h, mat, o = {}) => { const [x, z] = P(s, t); K.cyl({ x, z, y, r, h, mat, seg: 10, ...o }); };
  const lfloorText = (text, s, t, y, w, h, face, o = {}) => { const [x, z] = P(s, t); K.floorText(text, { x, z, y, w, h, rotY: F[face] + PI, ...o }); };
  const lperson = (s, t, y, o = {}) => { const [x, z] = P(s, t); K.person(x, y, z, o); };
  const lcrowd = (s0, t0, s1, t1, y, n, seed) => { // like K.crowd but keeps people out of voids/escalator holes
    const r = K.rand(seed * 101 + 7), hl = y === Y1 ? H.f1 : y === Y2 ? H.f2 : y === YB1 ? H.b1 : [];
    for (let k = 0, g = 0; k < n && g < n * 20; g++) {
      const s = s0 + r() * (s1 - s0), t = t0 + r() * (t1 - t0), [x, z] = P(s, t);
      if (hl.some(h => K.pointInPoly(x, z, h))) continue;
      K.person(x, y, z, { rotY: r() * 6.28 }); k++;
    }
  };
  const lzone = (s0, t0, s1, t1, o) => K.zone({ poly: RECT(s0, t0, s1, t1), ...o });

  // ---------------------------------------------------------------- footprints
  const osmPoly = (id, fb) => { const b = K.osmBuilding(id)[0]; return b ? b.poly.map(p => [p[0], p[1]]) : fb; };
  const TERM = osmPoly(356127040, [[-141.8, -11.4], [-140.9, -9.1], [-142.7, -8.1], [-140.8, -2.7], [-137.7, 4.3], [-135.7, 9.9], [-80.7, 150.7], [-93.3, 174.1], [-166.2, 202.1], [-153.5, 236], [-27.5, 185.3], [-33, 168.1], [-107.1, -24.3]]);
  const ROUND = osmPoly(593858530, null);
  const TOWER = osmPoly(601356623, null);
  const DECK = osmPoly(1173096805, null);
  const yardArea = (K.osm.areas || []).find(a => a.id === 1173096801);
  const YARD = yardArea ? yardArea.poly : [[-137, 57], [-209, 82], [-172, 185], [-99, 157]];
  const T = i => TERM[i];

  // B1 must stay north of the station's 7호선 concourse band (centerline (45,150)->(-175,262), half width 7)
  const bandS = p => (p[0] - 45) * 0.4537 + (p[1] - 150) * 0.8912;
  function clipHalf(poly, f) {
    const out = [];
    for (let i = 0; i < poly.length; i++) {
      const a = poly[i], b = poly[(i + 1) % poly.length], fa = f(a), fb = f(b);
      if (fa <= 0) out.push(a);
      if ((fa <= 0) !== (fb <= 0)) { const k = fa / (fa - fb); out.push([a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k]); }
    }
    return out;
  }
  // station's B1 hall follows (45,150)->(-45,186)->(-68,195)->(-88,220)->(-175,262), 14 m wide: keep ≥7.6 m from it
  const sE9 = t => 204.1 - (t + 98.9) * (1.3 / 135.8);
  const B1POLY = [T(0), T(1), T(2), T(3), T(4), T(5), T(6), T(7), T(8), T(9), P(sE9(-33), -33), P(201.2, -26.5), P(196.3, -18.5), P(191.6, -10.5), P(189.4, -4), P(189.4, 37.8), T(11), T(12)];
  void clipHalf; void bandS;
  // 1F interior outline: the west facade is set back to t=6 between s=-10 and s=149 (bus noses under the 2F overhang)
  const F1POLY = [T(0), T(1), T(2), T(3), P(-10, 0.3), P(-10, 6), P(149, 6), P(149.6, 0.6), T(7), T(8), T(9), T(10), T(11), T(12)];

  // ---------------------------------------------------------------- palette
  const M = {
    hallFloor: { tex: 'marble', color: 0xe9e5dc }, b1Floor: { tex: 'tile', color: 0xc9b9a3 }, f2Floor: { tex: 'tile', color: 0xe2ddd3 },
    ceil: { tex: 'ceiling', color: 0xf4f2ee }, wallIn: 0xeeebe4, wallB1: 0xe4ddd0, part: 0xf3f0ea, dark: 0x2b2d30,
    steel: 0x6f767d, col: 0xe9e6df, glass: 'glass', roof: { tex: 'concrete', color: 0xb9b6ae }, asphalt: { tex: 'asphalt', color: 0x8d8d8f },
    wood: { tex: 'wood', color: 0xc8a27a }, platform: { tex: 'sidewalk', color: 0xd9d4ca },
  };
  K.texture('ccBand', 256, 128, (g, w, h) => {
    g.fillStyle = '#d7d2c8'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#c9c3b8'; g.fillRect(0, h * 0.08, w, 3); g.fillRect(0, h * 0.92, w, 3);
    g.fillStyle = '#3c4a58'; g.fillRect(w * 0.04, h * 0.34, w * 0.92, h * 0.36);
    g.fillStyle = '#6d8193'; g.fillRect(w * 0.04, h * 0.34, w * 0.92, h * 0.06);
    g.fillStyle = '#b8b2a7'; g.fillRect(w * 0.49, h * 0.34, w * 0.02, h * 0.36);
    g.strokeStyle = 'rgba(0,0,0,0.18)'; g.lineWidth = 2; g.strokeRect(0, 0, w, h);
  }, [3.6, 1], { facade: true });
  K.texture('ccRail', 128, 128, (g, w, h) => { // 파미에스테이션 floor: dark planks with an inlaid rail
    g.fillStyle = '#5b4a3c'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? '#625041' : '#574638'; g.fillRect(0, i * h / 8, w, h / 8 - 1); }
    g.fillStyle = '#9da3a8'; g.fillRect(w * 0.18, 0, w * 0.05, h); g.fillRect(w * 0.77, 0, w * 0.05, h);
    g.fillStyle = '#3a2f26'; for (let i = 0; i < 4; i++) g.fillRect(w * 0.1, i * h / 4 + 4, w * 0.8, h * 0.07);
  }, [3.2, 3.2]);
  K.texture('ccLouver', 64, 64, (g, w, h) => { g.fillStyle = '#9aa2a8'; g.fillRect(0, 0, w, h); g.fillStyle = '#5d656c'; for (let i = 0; i < 8; i++) g.fillRect(0, i * 8 + 5, w, 2); }, [1, 1]);

  // ---------------------------------------------------------------- hole registry (slabs are laid last)
  const H = { b1: [], f1: [], f2: [], rf: [] };
  const hole = (levels, poly) => { for (const l of levels) H[l].push(poly); };
  const rail = (s0, t0, s1, t1, y) => { lwall(s0, t0, s1, t1, y, y + 1.05, { mat: 'glass', thick: 0.04 }); const a = P(s0, t0), b = P(s1, t1); const L = Math.hypot(b[0] - a[0], b[1] - a[1]); K.box({ x: (a[0] + b[0]) / 2, z: (a[1] + b[1]) / 2, y: y + 1.02, h: 0.06, w: 0.08, d: L, rotY: Math.atan2(b[0] - a[0], b[1] - a[1]), mat: 0x8a9096, solid: false }); };

  // escalator pair along s. bottom at sb (low y), top at st. up at t, down at t+1.5. returns nothing; cuts hole in `lvl`.
  function escPair(sb, st, t, ya, yb, lvl, groundToo) {
    const dir = Math.sign(st - sb);
    const a1 = P(sb, t), b1 = P(st, t), a2 = P(sb, t + 1.5), b2 = P(st, t + 1.5);
    K.escalator(a1[0], a1[1], b1[0], b1[1], { ya, yb, dir: 'up', w: 1.1 });
    K.escalator(a2[0], a2[1], b2[0], b2[1], { ya, yb, dir: 'down', w: 1.1 });
    const s0 = Math.min(sb - dir * 0.6, st), s1 = Math.max(sb - dir * 0.6, st);
    const hp = RECT(s0, t - 0.75, s1, t + 2.25);
    hole([lvl], hp); if (groundToo) K.groundHole(hp);
    // glass rails around the void on the upper floor (open at the top landing)
    rail(s0, t - 0.75, s1, t - 0.75, yb); rail(s0, t + 2.25, s1, t + 2.25, yb);
    const back = dir > 0 ? s0 : s1; rail(back, t - 0.75, back, t + 2.25, yb);
    // landing comb plates
    for (const [s, y] of [[sb, ya], [st, yb]]) lbox(s - dir * 0.5 * (s === sb ? 1 : -1), t + 0.75, 1.0, 2.7, y, 0.02, 0x9aa0a6, { solid: false });
  }
  // straight stair flight along s from (sa,y0) to (sb,y1) at t (w 2.2); hole cut in `lvl`
  function flight(sa, sb, t, y0, y1, lvl, groundToo) {
    const a = P(sa, t), b = P(sb, t);
    K.stairs(a[0], a[1], b[0], b[1], { w: 2.2, ya: y0, yb: y1, mat: { tex: 'darkstone', color: 0x9a948c } });
    if (lvl) { const hp = RECT(Math.min(sa, sb) - 0.2, t - 1.2, Math.max(sa, sb), t + 1.2); hole([lvl], hp); if (groundToo) K.groundHole(hp); }
  }
  function elev(name, s, t, face, floors, levels) {
    const [x, z] = P(s, t);
    K.elevator({ name, x, z, rotY: F[face], w: 2.2, d: 2.2, floors, mat: 0xb4b8bc, doorMat: 0x9ca4ab });
    const hp = RECT(s - 1.15, t - 1.15, s + 1.15, t + 1.15); hole(levels, hp);
  }

  // ---------------------------------------------------------------- shop generator
  // row along axis 's' (depth along t) or 't' (depth along s). u0..u1 along the row, front at depth f, back at b.
  const BRAND = {
    '스타벅스': ['#00704a', '#ffffff'], '쉐이크쉑': ['#1b1b1b', '#ffffff'], '신한은행': ['#0046ff', '#ffffff'], '파리바게뜨': ['#14316b', '#ffffff'],
    '던킨': ['#ffffff', '#ff671f'], '아웃백 스테이크하우스': ['#4a1a10', '#f3e3c3'], '명동교자': ['#ffffff', '#b3261e'], '앤드테일 커피바': ['#1d1d1d', '#e8d8b0'],
    '리김밥': ['#ffd200', '#222222'], '소이연남': ['#f4efe6', '#1e5631'], '채선당 샤브보트': ['#2f7d32', '#ffffff'], '장터국수': ['#6b3f1d', '#ffffff'],
    '포브 FOURB': ['#f2ece0', '#3a2a1a'], '순대실록': ['#222222', '#ffffff'], '101번지 남산돈까스': ['#c62828', '#ffffff'], '르사이공': ['#0b6e4f', '#ffffff'],
    '우마이도': ['#111111', '#f5f5f5'], '스노우폭스': ['#ffffff', '#e7568d'], '서대문 한옥집': ['#3e2723', '#ffecb3'], '홍대만뽀': ['#ffffff', '#111111'],
    '팔도국수 면주방': ['#8d1e1e', '#ffffff'], '더스파': ['#222222', '#f2d7b0'], '더 살롱': ['#222222', '#f2d7b0'], '더네일바': ['#f2d0d8', '#6a2a3a'],
  };
  const KIND_COL = { food: ['#7a2e22', '#fff'], cafe: ['#2d5a3d', '#fff'], store: ['#2a3a4a', '#fff'], bank: ['#1f4e9c', '#fff'], office: ['#3a3f45', '#fff'], toilet: ['#1d3557', '#fff'], flower: ['#fff', '#c2185b'], beauty: ['#222', '#f2d7b0'] };
  const SHOP_PAL = [
    { top: 0xc8a27a, leg: 0x3b2f27, chair: 0x2f5d50 }, { top: 0xeeeae2, leg: 0x2b2b2b, chair: 0x9a3b30 }, { top: 0x9a7a58, leg: 0x2a2522, chair: 0xd9a441 },
    { top: 0xb9c0c6, leg: 0x55606a, chair: 0x1f3b5a }, { top: 0xe0cfb4, leg: 0x6b4f37, chair: 0x6f7f45 }, { top: 0x3a3330, leg: 0x1b1b1b, chair: 0xc9b38a },
  ];
  // menu lines per real brand (common signature items; prices rounded) and per category keyword (fallback)
  const MENU = {
    '명동교자': ['칼국수  11,000', '만두  11,000', '비빔국수 · 콩국수'], '소이연남': ['소고기 쌀국수  12,000', '뿌팟퐁커리', '팟타이 · 쏨땀'],
    '팔도국수 면주방': ['잔치국수  7,000', '비빔국수  8,000', '전국 팔도 국수'], '아웃백 스테이크하우스': ['투움바 파스타', '블랙라벨 스테이크', '오지 치즈 후라이'],
    '채선당 샤브보트': ['1인 샤브보트', '월남쌈 · 샤브샤브', '샐러드바'], '르사이공': ['쌀국수 · 분짜', '반쎄오', '월남쌈'], '순대실록': ['순대국  10,000', '모둠순대', '순대전골'],
    '101번지 남산돈까스': ['남산 왕돈까스', '치즈돈까스', '생선까스'], '우마이도': ['돈코츠 라멘', '차슈 덮밥', '교자'], '서대문 한옥집': ['김치찜  11,000', '김치찌개', '계란말이'],
    '장터국수': ['장터국수', '비빔국수', '김밥 · 만두'], '리김밥': ['리김밥', '참치 · 치즈 김밥', '떡볶이 · 어묵'], '쉐이크쉑': ['ShackBurger', 'SmokeShack', 'Shake · Fries'],
    '스타벅스': ['아메리카노  4,700', '카페 라떼', '자바 칩 프라푸치노'], '파리바게뜨': ['베이커리 · 샌드위치', '아메리카노', '케이크'], '던킨': ['도넛', '먼치킨', '커피'],
    '포브 FOURB': ['베이글', '크림치즈', '커피'], '앤드테일 커피바': ['에스프레소', '플랫 화이트', '시그니처 라떼'], '홍대만뽀': ['대표 메뉴', '세트 메뉴', '홍대 본점 레시피'],
  };
  const MENU_KW = [
    [/쌀국수|분짜|반미/, ['소고기 쌀국수', '분짜', '월남쌈']], [/버거/, ['클래식 버거', '베이컨 치즈 버거', '감자튀김']], [/타코|부리또/, ['타코 3pcs', '부리또', '나초']],
    [/돈부리|덮밥/, ['규동', '사케동', '가츠동']], [/맥주/, ['IPA · 라거', '피쉬앤칩스', '감자튀김']], [/샐러드/, ['콥 샐러드', '연어 포케', '그레인 볼']], [/냉면/, ['물냉면', '비빔냉면', '만두']],
    [/떡볶이|분식|김밥|튀김/, ['떡볶이', '김밥', '튀김 · 순대']], [/중식|짬뽕/, ['짜장면', '짬뽕', '탕수육']], [/라멘/, ['돈코츠 라멘', '차슈', '교자']], [/칼국수/, ['바지락 칼국수', '만두', '보리밥']],
    [/죽/, ['전복죽', '야채죽', '호박죽']], [/한식|백반|비빔밥|도시락/, ['된장찌개 백반', '제육볶음', '비빔밥']], [/피자/, ['마르게리타', '페퍼로니', '고르곤졸라']], [/파스타/, ['알리오 올리오', '토마토 파스타', '리조또']],
    [/커리/, ['치킨 커리', '버터 커리', '난']], [/딤섬/, ['샤오롱바오', '하가우', '새우 볶음밥']], [/돈카츠/, ['로스카츠', '히레카츠', '카츠동']], [/아이스크림/, ['젤라또', '소프트콘', '파르페']],
    [/스테이크/, ['스테이크 덮밥', '찹스테이크', '갈릭라이스']], [/우동/, ['냉우동', '튀김우동', '규동']], [/베이커리/, ['소금빵', '크루아상', '바게트']], [/와플/, ['크림 와플', '아이스크림 와플', '아메리카노']],
    [/마카롱|디저트/, ['마카롱', '조각 케이크', '밀크티']], [/주스/, ['생과일 주스', '스무디', '착즙 ABC']], [/브런치/, ['에그 베네딕트', '팬케이크', '라떼']],
  ];
  const menuFor = (name, kind) => MENU[name] || (MENU_KW.find(([re]) => re.test(name)) || [0, kind === 'cafe' ? ['아메리카노  4,500', '카페 라떼', '디저트'] : ['대표 메뉴', '세트 메뉴', '사이드']])[1];
  function shop(o) {
    const { axis = 's', u0, u1, f, b, y, h = 4, name, kind = 'food', sub = null, open = false, noBack = false, seed = 1 } = o;
    const pt = (u, v) => axis === 's' ? [u, v] : [v, u];
    const W2 = (ua, va, ub, vb, y0, y1, oo) => { const A = pt(ua, va), B = pt(ub, vb); lwall(A[0], A[1], B[0], B[1], y0, y1, oo); };
    const face = axis === 's' ? (f > b ? 'E' : 'W') : (f > b ? 'S' : 'N');
    const dv = Math.sign(f - b), len = u1 - u0, dep = Math.abs(f - b), um = (u0 + u1) / 2;
    // partitions + back
    W2(u0, b, u0, f, y, y + h, { mat: M.part, thick: 0.15 });
    W2(u1, b, u1, f, y, y + h, { mat: M.part, thick: 0.15 });
    if (!noBack) W2(u0, b, u1, b, y, y + h, { mat: kind === 'food' ? 0xe7dccb : M.part, thick: 0.15 });
    // front
    const dw = open ? len - 1.0 : Math.min(3.2, len * 0.45);
    if (kind === 'office' || kind === 'toilet') {
      const ops = kind === 'toilet' ? [{ at: len * 0.3, w: 1.4, y0: y, y1: y + 2.4 }, { at: len * 0.7, w: 1.4, y0: y, y1: y + 2.4 }] : [{ at: len / 2, w: 1.2, y0: y, y1: y + 2.4 }];
      W2(u0, f, u1, f, y, y + h, { mat: kind === 'toilet' ? 0xdfe3e6 : 0xd9d6cf, thick: 0.15, openings: ops });
    } else {
      W2(u0, f, u1, f, y, y + h, { mat: 'glass', thick: 0.04, openings: [{ at: len / 2, w: dw, y0: y, y1: y + 3.0 }] });
    }
    // fascia band + sign
    const fy = y + Math.min(h - 0.45, 3.55);
    const fp = pt(um, f + dv * 0.12);
    lbox(fp[0], fp[1], axis === 's' ? len - 0.1 : 0.2, axis === 's' ? 0.2 : len - 0.1, fy - 0.4, 0.8, 0x26282b, { solid: false });
    const col = BRAND[name] || KIND_COL[kind] || KIND_COL.food;
    const sp = pt(um, f + dv * 0.24);
    lsign(name, sp[0], sp[1], fy, Math.min(len - 0.6, 7.5), 0.66, face, { bg: col[0], fg: col[1], sub, pxPerM: 80 });
    // interior fixtures
    const R2 = K.rand(seed * 977 + Math.round(u0 * 13));
    const ip = (u, v) => pt(u, v); // local helper
    const inU = (k) => u0 + 0.8 + k * (len - 1.6);
    const vAt = (k) => b + dv * (0.6 + k * (dep - 1.2)); // 0 back .. 1 front
    const boxAt = (u, v, du, dv2, yy, hh, mat, oo = {}) => { const p = ip(u, v); lbox(p[0], p[1], axis === 's' ? du : dv2, axis === 's' ? dv2 : du, yy, hh, mat, oo); };
    if (kind === 'food' || kind === 'cafe') {
      const pal = SHOP_PAL[(((seed * 7 + Math.round(u0)) % SHOP_PAL.length) + SHOP_PAL.length) % SHOP_PAL.length];
      const brandHex = parseInt(col[0].slice(1), 16), darkBrand = (col[0] === '#ffffff' || col[0] === '#f4efe6' || col[0] === '#f2ece0') ? 0x3a3330 : brandHex;
      // counter: brand-coloured front, light top, register + (cafe) pastry case / (food) pickup shelf
      boxAt(um, vAt(0.05), len - 1.6, 0.7, y, 1.05, darkBrand, { top: kind === 'cafe' ? 0x2a2522 : 0xe9e4da });
      { const p = ip(u0 + 1.3, vAt(0.05)); lbox(p[0], p[1], 0.36, 0.36, y + 1.05, 0.3, 0x1b1b1b, { solid: false }); }
      if (kind === 'cafe' && len > 4) { boxAt(um + len * 0.15, vAt(0.05), Math.min(2.4, len * 0.3), 0.6, y + 1.05, 0.5, 'glass', { solid: false }); for (let q = 0; q < 4; q++) boxAt(um + len * 0.15 - 0.75 + q * 0.5, vAt(0.05), 0.3, 0.3, y + 1.1, 0.12, [0xd9a35b, 0xf2e3c6, 0x8a4b2a, 0xe7a0b0][q], { solid: false }); }
      // back kitchen line (stainless) with hood for food, espresso machines for cafes
      if (dep > 3.5) {
        boxAt(um, b + dv * 0.45, len - 0.8, 0.6, y, 0.95, 0xb8bcc0, { top: 0xd0d4d8 });
        if (kind === 'food') boxAt(um, b + dv * 0.5, Math.min(len - 1.2, 4), 0.8, y + 1.75, 0.4, 0xa9aeb3, { solid: false });
        else for (const du of [-0.6, 0.6]) boxAt(um + du, b + dv * 0.45, 0.7, 0.45, y + 0.95, 0.45, 0x8f969c, { solid: false });
      }
      if (dep > 4) {
        const mp = ip(um, b + dv * 0.08), menu = menuFor(name, kind);
        lsign([kind === 'cafe' ? 'MENU  · 음료 · 디저트' : `${name}  메뉴`, ...menu], mp[0], mp[1], y + 2.95, Math.min(len - 1.2, 4.4), 1.15, face, { bg: '#151515', fg: '#f5e6c8', pxPerM: 80, box: 0.05, boxMat: darkBrand });
        { const lp = ip(um, b + dv * 0.12); lbox(lp[0], lp[1], axis === 's' ? Math.min(len - 1.2, 4.4) : 0.05, axis === 's' ? 0.05 : Math.min(len - 1.2, 4.4), y + 2.3, 0.05, 'emit', { color: 0xfff1d0, solid: false }); }
      }
      // standing menu board outside the shop front
      if (!open && len > 5) { const ap = ip(u0 + 0.9, f + dv * 0.6); lsign([name, menuFor(name, kind)[0]], ap[0], ap[1], y + 0.75, 0.8, 1.0, face, { bg: '#262626', fg: '#ffffff', twoSided: true, pxPerM: 70 }); }
      // shop ceiling light panels
      const lp2 = ip(um, (f + b) / 2); lbox(lp2[0], lp2[1], axis === 's' ? Math.max(1, len - 3) : 0.6, axis === 's' ? 0.6 : Math.max(1, len - 3), y + h - 0.12, 0.05, 'emit', { color: 0xfff3dc, solid: false });
      const nT = Math.max(1, Math.floor((len - 1.5) / 2.4)), nV = Math.max(1, Math.floor((dep - 3) / 2.4));
      for (let i = 0; i < nT; i++) for (let j = 0; j < nV; j++) {
        const u = u0 + 1.4 + i * (len - 2.8) / Math.max(1, nT - 1) * (nT > 1 ? 1 : 0) + (nT === 1 ? (len - 2.8) / 2 : 0);
        const v = b + dv * (2.6 + j * 2.4);
        if (Math.abs(v - f) < 1.1) continue;
        boxAt(u, v, 0.8, 0.8, y, 0.74, pal.leg, { top: pal.top });
        for (const du of [-0.62, 0.62]) { boxAt(u + du, v, 0.42, 0.42, y, 0.45, pal.chair, { solid: false }); boxAt(u + du * 1.3, v, 0.08, 0.42, y + 0.45, 0.42, pal.chair, { solid: false }); }
        if (dep > 4 && R2() < 0.6) { const pp = ip(u, v); lbox(pp[0], pp[1], 0.3, 0.3, y + 2.15, 0.18, 'emit', { color: 0xffd9a0, solid: false }); }
        if (R2() < 0.45) { const p = ip(u + 0.62, v); K.person(p[0], y, p[1], { sit: true, rotY: R + (axis === 's' ? 0 : PI / 2) }); }
      }
    } else if (kind === 'store' || kind === 'flower' || kind === 'beauty') {
      boxAt(um, vAt(0), len - 1.2, 0.5, y, 1.9, kind === 'beauty' ? 0xf0e6e0 : 0xd9d2c4);
      if (kind === 'flower') for (let i = 0; i < Math.floor(len / 0.7); i++) { const p = ip(u0 + 0.5 + i * 0.7, f - dv * 0.6); lcyl(p[0], p[1], y, 0.22, 0.45, 0x5d6870, { solid: false, caps: true }); lbox(p[0], p[1], 0.38, 0.38, y + 0.45, 0.35, [0xe7568d, 0xffffff, 0xf2c94c, 0xd84a4a, 0x9b59b6][i % 5], { solid: false }); }
      else if (kind === 'beauty') { boxAt(um - len * 0.2, vAt(0.5), 1.2, 0.7, y, 0.75, 0xffffff); boxAt(um + len * 0.2, vAt(0.5), 0.6, 0.6, y, 1.1, 0x222222); }
      else boxAt(um, vAt(0.55), Math.max(1, len - 4), 1.0, y, 0.9, 0xb9a88f);
    } else if (kind === 'bank') {
      for (let i = 0; i < Math.floor((len - 1) / 1.3); i++) { const u = u0 + 1.0 + i * 1.3; boxAt(u, vAt(0), 0.9, 0.7, y, 1.75, 0x4b5a6a); const p = ip(u, vAt(0) + dv * 0.37); lbox(p[0], p[1], axis === 's' ? 0.55 : 0.02, axis === 's' ? 0.02 : 0.55, y + 1.05, 0.38, 'emit', { color: 0x8fc7ff, solid: false }); }
    }
  }
  // generic B1 stall: open counter front, menu board, two stools
  function stall(o) { shop({ ...o, open: true, h: 3.6 }); }

  // ================================================================= 1F — 호남선 터미널 (strip)
  const GATES = [
    { g: 1, plats: [1, 2, 3] }, { g: 2, plats: [4, 5, 6] }, { g: 3, plats: [7, '예비'] }, { g: 4, plats: [8, 9, 10] },
    { g: 5, plats: [11, 12, 13] }, { g: 6, plats: [14, 15, 16] }, { g: 7, plats: [17, 18, 19] }, { g: 8, plats: [20, 21, 22] },
    { g: 9, plats: [], closed: true }, { g: 10, plats: [23, 24, 25, 26] }, { g: 11, plats: [27, 28, 29, 30, 31] }, { g: 12, plats: [32, 33, 34, 35, 36, 37] },
  ];
  const DEST = { 1: '목포', 2: '목포·무안', 3: '해남', 4: '완도', 5: '진도', 6: '녹동·보성', 7: '강진·장흥', 8: '광주', 9: '광주', 10: '광주 심야', 11: '전주', 12: '전주', 13: '익산', 14: '군산', 15: '정읍', 16: '남원', 17: '순천', 18: '여수', 19: '광양', 20: '고흥', 21: '유성', 22: '대전청사', 23: '공주', 24: '논산', 25: '부여', 26: '서천', 27: '청주', 28: '천안', 29: '아산', 30: '서산', 31: '충주', 32: '제천', 33: '홍성', 34: '당진', 35: '태안', 36: '보령', 37: '대천' };
  const OPS = [{ n: '금호고속', c: 0xf3f3f1 }, { n: '중앙고속', c: 0x1f4f8f }, { n: '천일고속', c: 0xeeeeea }, { n: '한일고속', c: 0x8a1c1c }, { n: '삼화고속', c: 0x2a6e9e }, { n: '동부고속', c: 0x2e7d4f }];
  const GRADE = ['우등', '프리미엄', '우등', '일반', '우등'];
  const PITCH = 3.6;
  const bays = []; const gateInfo = [];
  {
    let s = -8;
    for (const G of GATES) {
      const s0 = s;
      if (G.closed) { s += 9.5; gateInfo.push({ ...G, s0, s1: s }); s += 0.8; continue; }
      for (const p of G.plats) { bays.push({ p, g: G.g, s: s + PITCH / 2 }); s += PITCH; }
      gateInfo.push({ ...G, s0, s1: s }); s += 0.8;
    }
  }
  const TICKET = gateInfo.find(g => g.closed);

  // ---- vertical circulation (strip)
  escPair(-15, -4.5, 17.4, YB1, Y1, 'f1', true);          // E1 north: B1 ↔ 1F (신반포로 입구 홀)
  escPair(85, 95.5, 17.4, YB1, Y1, 'f1', true);           // E2 매표소 맞은편: B1(지하철·파미에스테이션) ↔ 1F
  escPair(40, 48.8, 17.4, Y1, Y2, 'f2', false);          // E3 1F ↔ 2F 식당가
  flight(141, 151, 32.5, YB1, Y1, 'f1', true);            // stair core (east, south end)
  flight(150.2, 141.8, 35.6, Y1, Y2, 'f2');
  flight(142.2, 148.9, 32.5, Y2, YR, 'rf');
  rail(141, 31.3, 151, 31.3, Y1); rail(141, 31.3, 141, 33.7, Y1); rail(141, 33.7, 151, 33.7, Y1);
  rail(141.6, 34.4, 150.2, 34.4, Y2); rail(150.2, 34.4, 150.2, 36.8, Y2);
  rail(142, 31.3, 148.9, 31.3, YR); rail(142, 33.7, 148.9, 33.7, YR); rail(142, 31.3, 142, 33.7, YR);
  const ELEV_FLOORS = [{ label: 'B1', y: YB1, name: '파미에스테이션 · 지하철 연결' }, { label: '1F', y: Y1, name: '호남선 터미널 · 매표소' }, { label: '2F', y: Y2, name: '센트럴시티 식당가' }, { label: 'R', y: YR, name: '옥상 주차장' }];
  elev('센트럴시티 터미널 엘리베이터', 62, 18.2, 'N', ELEV_FLOORS, ['b1', 'f1', 'f2', 'rf']);
  // stair house + elevator penthouse on the roof
  lwall(140.6, 30.8, 151.4, 30.8, YR, YR + 3, { mat: 0xd0ccc4 }); lwall(140.6, 37.4, 151.4, 37.4, YR, YR + 3, { mat: 0xd0ccc4 });
  lwall(140.6, 30.8, 140.6, 37.4, YR, YR + 3, { mat: 0xd0ccc4 }); lwall(151.4, 30.8, 151.4, 37.4, YR, YR + 3, { mat: 0xd0ccc4, openings: [{ at: 1.9, w: 2.4, y0: YR, y1: YR + 2.4 }] });
  lbox(146, 34.1, 11, 6.8, YR + 3, 0.25, 0xbab6ae, { solid: false });
  lsign('계단 · 1F 터미널 · B1', 151.5, 34.1, YR + 2.65, 3.6, 0.45, 'S', { bg: '#1d3557', fg: '#fff' });

  // ---- 1F facade setback: glass wall at t=6 with a door per gate (buses nose-in under the 2F overhang)
  {
    const glassOps = gateInfo.filter(g => !g.closed).map(g => ({ at: (g.s0 + g.s1) / 2 + 10, w: 3.2, y0: Y1, y1: Y1 + 2.8 }));
    lwall(-10, 6, 149, 6, Y1, C1, { mat: 'glass', thick: 0.04, openings: glassOps });
    lwall(-10, 0.3, -10, 6, Y1, C1, { mat: 'ccBand', thick: 0.3 });
    lwall(149, 6, 149.6, 0.6, Y1, C1, { mat: 0xd7d2c8, thick: 0.3 });
    for (let s = -9.5; s < 149; s += 1.85) lbox(s, 6, 0.1, 0.14, Y1, C1 - Y1, 0x3a3f45, { solid: false });
    lbox(69.5, 6.05, 159, 0.2, 2.9, 0.12, 0x3a3f45, { solid: false });
    // overhang: soffit band + pillars between bays, raised platform t 3..6
    lbox(69.5, 4.5, 159, 3, Y1, 0.15, M.platform);
    lbox(69.5, 3.25, 159, 0.12, Y1 + 0.151, 0.005, 0xf2c200, { solid: false });
    K.hpoly(M.asphalt, RECT(-10, 0, 149, 3), 0.013, true);
    for (const bb2 of [[-10, 149]]) lbox((bb2[0] + bb2[1]) / 2, 2.95, bb2[1] - bb2[0], 0.1, 0, 0.16, 0x9a958d, { solid: false });
    for (const bb of bays) { lcyl(bb.s - PITCH / 2, 0.55, Y1, 0.25, C1, 0xdcd8d0); }
    lcyl(bays[bays.length - 1].s + PITCH / 2, 0.55, Y1, 0.25, C1, 0xdcd8d0);
  }
  // bus bays, buses, signs
  {
    for (const [i, bb] of bays.entries()) {
      const dest = DEST[bb.p] || '예비';
      const sp = P(bb.s, 0.8);
      // overhead bay sign hanging from the soffit (visible from the platform and from the yard)
      lsign([`${bb.p}`, dest], bb.s, 4.6, C1 - 0.55, 2.6, 0.8, 'W', { bg: '#1d3557', fg: '#ffffff', twoSided: true, pxPerM: 70 });
      lfloorText(String(bb.p), bb.s, -4.5, 0.03, 2.0, 1.6, 'W', { fg: '#f2c200', bg: '#3f3f42', bold: true });
      lfloorText(String(bb.p), bb.s, 4.6, Y1 + 0.16, 0.9, 0.7, 'W', { fg: '#1d3557', bg: '#d9d4ca' });
      // bay lines
      for (const ds of [-PITCH / 2]) { const a = P(bb.s + ds - 0.06, 0), c = P(bb.s + ds + 0.06, -12); K.quad(0xf2c200, [[a[0], 0.025, a[1]], [P(bb.s + ds + 0.06, 0)[0], 0.025, P(bb.s + ds + 0.06, 0)[1]], [c[0], 0.025, c[1]], [P(bb.s + ds - 0.06, -12)[0], 0.025, P(bb.s + ds - 0.06, -12)[1]]], [0, 1, 0]); }
      // stop bollard
      lcyl(bb.s, 3.45, Y1 + 0.15, 0.12, 0.8, 0xf2c200, { solid: true });
      if (bb.p === '예비' || rnd() < 0.3) continue;
      const op = OPS[Math.floor(rnd() * OPS.length)];
      const [x, z] = P(bb.s, -3.6);
      K.vehicle({ x, y: 0, z, rotY: F.E, kind: 'bus', color: op.c, label: `${dest} ${GRADE[i % GRADE.length]}` });
      // operator name along the bus side (west side faces the yard)
      lsign(op.n, bb.s - 1.28, -3.6, 1.9, 4.2, 0.45, 'N', { bg: '#' + op.c.toString(16).padStart(6, '0'), fg: op.c === 0xf3f3f1 || op.c === 0xeeeeea ? '#c8102e' : '#ffffff', pxPerM: 60 });
      void sp;
    }
    // apron asphalt between the overhang and the yard road
    K.hpoly(M.asphalt, RECT(-12, -18.3, 151, 0), 0.012, true);
    // gate signs inside the hall over each door + LED boards
    for (const g of gateInfo) {
      const sc = (g.s0 + g.s1) / 2;
      if (g.closed) continue;
      lsign(`게이트 ${g.g}`, sc, 6.2, 3.45, 2.6, 0.6, 'E', { bg: '#1d3557', fg: '#ffffff' });
      lsign(`승차홈 ${g.plats.join(' · ')}`, sc, 6.2, 3.95, 3.4, 0.38, 'E', { bg: '#0f1e33', fg: '#ffd84a', pxPerM: 70 });
      const p0 = g.plats.filter(p => p !== '예비');
      const lines = p0.slice(0, 3).map((p, k) => `${String(7 + ((g.g * 7 + k * 3) % 15)).padStart(2, '0')}:${['00', '20', '40', '10', '30', '50'][(g.g + k) % 6]}  ${DEST[p]}  ${p}번`);
      lsign(lines, sc, 6.25, 2.25, 2.8, 0.25 * lines.length + 0.15, 'E', { bg: '#050505', fg: '#ffb000', bold: false, pxPerM: 90 });
      lsign(`게이트 ${g.g}  ${p0.map(p => DEST[p]).filter((v, i, a) => a.indexOf(v) === i).join('·')}`, sc, 5.9, 3.45, 3.2, 0.55, 'W', { bg: '#1d3557', fg: '#ffffff', pxPerM: 60 });
    }
  }
  // concourse direction boards (hanging, both faces) along the boarding concourse
  for (const s of [12, 50, 88, 128]) {
    const n = gateInfo.filter(g => (g.s0 + g.s1) / 2 < s && !g.closed).map(g => g.g), sth = gateInfo.filter(g => (g.s0 + g.s1) / 2 > s && !g.closed).map(g => g.g);
    if (n.length) lsign(`← 게이트 ${n[0]}${n.length > 1 ? '–' + n[n.length - 1] : ''}  ·  신반포로 출구`, s - 0.06, 9.6, C1 - 0.7, 5.2, 0.55, 'N', { bg: '#1d3557', fg: '#fff' });
    if (sth.length) lsign(`게이트 ${sth[0]}${sth.length > 1 ? '–' + sth[sth.length - 1] : ''} →  ·  하차장 · 파미에스테이션`, s + 0.06, 9.6, C1 - 0.7, 5.2, 0.55, 'S', { bg: '#1d3557', fg: '#fff' });
  }
  // ---- 매표소 (gate 9 converted, 2021) + 무인발권기
  {
    const s0 = TICKET.s0, s1 = TICKET.s1, sc = (s0 + s1) / 2;
    lwall(s0, 6, s0, 12.6, Y1, C1, { mat: M.wallIn }); lwall(s1, 6, s1, 12.6, Y1, C1, { mat: M.wallIn });
    lbox(sc, 12.3, s1 - s0, 0.6, Y1, 1.1, 0xe8e1d4, { top: 0x6b5a48 });
    lwall(s0, 12.6, s1, 12.6, Y1 + 1.1, Y1 + 2.5, { mat: 'glass', thick: 0.04 });
    lwall(s0, 12.6, s1, 12.6, Y1 + 2.5, C1, { mat: 0x1d3557 });
    for (let k = 0; k < 6; k++) { const s = s0 + 0.9 + k * (s1 - s0 - 1.8) / 5; lsign(`${k + 1}`, s, 12.7, Y1 + 2.25, 0.4, 0.4, 'E', { bg: '#ffd84a', fg: '#1d3557' }); lperson(s, 11.2, Y1, { rotY: F.E, shirt: 0x1d3557 }); lbox(s, 11.7, 0.5, 0.4, Y1 + 1.1, 0.35, 0x222222, { solid: false }); }
    lsign(['매표소  TICKET', '현장발권 · 예매확인 · 환불'], sc, 12.75, Y1 + 3.35, 6.5, 1.1, 'E', { bg: '#1d3557', fg: '#ffffff' });
    lsign('게이트 9 — 매표소로 운영', sc, 5.9, 3.45, 3.6, 0.5, 'W', { bg: '#555b62', fg: '#ffffff', pxPerM: 60 });
    // kiosks
    for (let k = 0; k < 8; k++) {
      const s = s1 + 2 + k * 1.3;
      lbox(s, 14.6, 0.9, 0.6, Y1, 1.6, 0xf2f2f2, { top: 0xd0d0d0 });
      lbox(s, 14.92, 0.6, 0.03, Y1 + 0.95, 0.5, 'emit', { color: 0x6fb6ff, solid: false });
      lsign('무인발권기', s, 14.94, Y1 + 1.75, 0.85, 0.22, 'E', { bg: '#00a0e9', fg: '#fff', pxPerM: 60 });
    }
    lsign(['무인발권기  SELF TICKETING', '고속버스티머니 · 카드결제'], s1 + 6.5, 14.6, Y1 + 2.9, 5.5, 0.8, 'E', { bg: '#0b4f8a', fg: '#fff' });
  }
  // ---- 대합실: seating, departure boards, info desk, columns
  {
    for (let s = 2; s < 140; s += 14) {
      if (Math.abs(s - 62) < 6 || (s > 82 && s < 100) || (s > 36 && s < 52)) continue;
      for (let r = 0; r < 3; r++) {
        lbox(s + 4, 15.5 + r * 2.2, 8, 0.55, Y1, 0.45, 0x8a6a4c, { top: 0x6b4f37 });
        lbox(s + 4, 15.85 + r * 2.2, 8, 0.12, Y1 + 0.45, 0.45, 0x6b4f37, { solid: false });
        for (let k = 0; k < 6; k++) if (rnd() < 0.4) lperson(s + 0.8 + k * 1.3, 15.4 + r * 2.2, Y1, { sit: true, rotY: F.N + PI });
      }
    }
    for (let s = -6; s < 142; s += 26) for (const t of [3.6]) {
      if (s < -2) continue;
      for (let k = 0; k < 2; k++) lbox(s + 6 + k * 10, t + 3.6, 7, 0.5, Y1, 0.45, 0x5d6d7e, { top: 0x46535f });
    }
    // hanging departure boards (출발 안내)
    const DEP = (k) => ['출발 안내  DEPARTURES', ...[0, 1, 2, 3, 4, 5].map(i => { const p = [8, 11, 1, 18, 17, 14, 13, 6, 21, 31, 34, 16][(k * 5 + i) % 12]; return `${String(8 + Math.floor((k * 6 + i) / 3)).padStart(2, '0')}:${['05', '20', '35', '50'][(k + i) % 4]}   ${DEST[p].padEnd(5, ' ')}  ${GRADE[(k + i) % 5]}   ${p}번 승차홈`; })];
    for (const [k, s] of [[0, 18], [1, 70], [2, 118]].entries()) {
      for (const face of ['N', 'S']) lsign(DEP(s[0]), s[1] + (face === 'N' ? -0.06 : 0.06), 20, 3.0, 7.5, 2.4, face, { bg: '#060606', fg: '#ffb000', bold: false, pxPerM: 110 });
      lbox(s[1], 20, 0.1, 7.6, 1.78, 0.06, 0x222222, { solid: false });
      for (const dt of [-3.4, 3.4]) lbox(s[1], 20 + dt, 0.05, 0.05, 4.2, C1 - 4.2, 0x666666, { solid: false });
      void k;
    }
    // information desk
    lbox(4, 21, 2.4, 5, Y1, 1.05, 0xf4f1ea, { top: 0x2b2d30 });
    lsign(['종합안내  INFORMATION', '센트럴시티터미널'], 4, 21, 3.6, 4.6, 0.9, 'N', { bg: '#1d3557', fg: '#fff', twoSided: true });
    lperson(5.6, 20.2, Y1, { rotY: F.S, shirt: 0x1d3557 }); lperson(5.6, 22, Y1, { rotY: F.S, shirt: 0x1d3557 });
    // floor directory boards at the escalators
    const DIR = ['층별 안내', 'R   옥상 주차장', '2F  센트럴시티 식당가', '1F  호남선 터미널 · 매표소 · 승차홈', 'B1  파미에스테이션 · 메가박스 · 지하철 3·7·9호선'];
    for (const s of [-16.5, 38.5, 83.5]) lsign(DIR, s, 23.5, 1.6, 3.4, 2.1, 'N', { bg: '#f4f1ea', fg: '#1d3557', box: 0.12, boxMat: 0xbab4a8, align: 'left', bold: false, pxPerM: 90 });
    lsign(['지하철 3·7·9호선 · 파미에스테이션', '↓ B1  고투몰 · 신세계 식품관'], 95.8, 18.15, 3.3, 4.4, 0.75, 'S', { bg: '#202a36', fg: '#ffffff' });
    lsign(['지하철 · 파미에스테이션 ↓', 'B1  GOTO MALL'], -4.2, 18.15, 3.3, 4.2, 0.75, 'S', { bg: '#202a36', fg: '#ffffff' });
    lsign(['2F 센트럴시티 식당가 ↑', '명동교자 · 순대실록 · 르사이공'], 49.0, 18.15, 3.3, 4.4, 0.75, 'S', { bg: '#202a36', fg: '#ffffff' });
  }
  // ---- 1F east band shops (front t=28 → facing west)
  const EAST1 = [
    [-20, -11, '앤드테일 커피바', 'cafe'], [-11, -2, '신한은행', 'bank'], [-2, 7, 'ATM 코너', 'bank', 'KB국민 · 신한 · 우리 · 하나'], [7, 16, '편의점', 'store', '24시 · 음료 · 도시락'],
    [26, 36, '스노우폭스', 'flower', 'SNOWFOX FLOWERS'], [36, 46, '약국', 'store'], [46, 56, '파리바게뜨', 'cafe'], [56, 66, '리김밥', 'food', '김밥 · 떡볶이 · 어묵'],
    [66, 76, '여행용품', 'store', '캐리어 · 충전기 · 우산'], [76, 86, '도서 · 잡지', 'store'], [86, 98, '쉐이크쉑', 'food', 'SHAKE SHACK'], [98, 108, '화장실', 'toilet', '남 · 여 · 장애인'],
    [108, 119, '수유실 · 물품보관함', 'office'], [129, 140, '고객센터 · 유실물', 'office'],
  ];
  for (const [u0, u1, name, kind, sub] of EAST1) shop({ axis: 's', u0, u1, f: 28, b: 38.2, y: Y1, h: 4.1, name, kind, sub, seed: u0, noBack: true });
  // J4 / J6 passages through the east band (openings in the shared wall)
  lsign(['신세계백화점 강남점  →', 'SHINSEGAE · 신세계면세점'], 21, 27.8, 3.55, 5.6, 0.8, 'W', { bg: '#2b2b2b', fg: '#ffffff' });
  lsign(['JW 메리어트 호텔 서울  →', 'JW MARRIOTT SEOUL'], 124, 27.8, 3.55, 5.6, 0.8, 'W', { bg: '#4b3a2a', fg: '#f3e3c3' });
  for (const s of [16, 26, 119, 129]) lwall(s, 28, s, 38.2, Y1, 4.1, { mat: M.part, thick: 0.15 });
  // 북측 입구 홀 (신반포로)
  {
    lsign(['센트럴시티터미널', 'CENTRAL CITY TERMINAL · 호남선'], -21.0, 20, 3.9, 9, 1.2, 'S', { bg: '#1d3557', fg: '#ffffff' });
    lbox(-19, 6, 3, 3, Y1, 1.2, 0xb9b3a8, { top: 0x7c8b5a }); lbox(-19, 34, 3, 3, Y1, 1.2, 0xb9b3a8, { top: 0x7c8b5a });
    K.tree(...P(-19, 6), { y: 1.2, h: 3.2, kind: 'ginkgo' }); K.tree(...P(-19, 34), { y: 1.2, h: 3.2, kind: 'ginkgo' });
  }
  // columns (strip): rows t=13.5 and t=27.2, all levels
  for (let s = -12; s <= 146; s += 9.4) for (const t of [13.5, 27.2]) {
    if (Math.abs(s - 62) < 2.5 && t === 13.5) continue;
    lcyl(s, t, Y1, 0.42, C1 - Y1, M.col); lcyl(s, t, Y2, 0.4, C2 - Y2, M.col);
    if (s > -19) lcyl(s, t + (t === 13.5 ? -4.3 : 0), YB1, 0.42, CB - YB1, 0xd6cbb8);
  }
  // light panels 1F (strip)
  for (let s = -18; s < 150; s += 6) for (const t of [3, 9.5, 17.5, 22.5]) {
    if (t === 17.5 && ((s > -17 && s < -3) || (s > 37 && s < 50) || (s > 83 && s < 97) || (s > 59 && s < 65))) continue;
    if (t < 6 && (s < -10 || s > 148)) continue;
    lbox(s, t, 2.4, 0.5, (t < 6 ? C1 : C1) - 0.06, 0.05, 'emit', { color: 0xfffaf0, solid: false });
  }
  lcrowd(0, 14, 140, 26.5, Y1, 70, 11); lcrowd(-8, 6.5, 146, 12.5, Y1, 34, 12); lcrowd(-20, 2, -11, 30, Y1, 10, 13); lcrowd(0, 3.2, 148, 5.8, Y1 + 0.15, 22, 14);

  // ================================================================= B1 — 파미에스테이션 (strip) · 메가박스 센트럴 (south)
  {
    // stalls: west row front t=8.6 (facing east), east row front t=28 (facing west); "PLATFORM n" theme
    const WEST = [[-6, 3, '베이커리'], [3, 12, '수제버거'], [12, 21, '쌀국수'], [21, 30, '딤섬'], [30, 39, '우동 · 덮밥'], [39, 48, '파스타'], [48, 57, '커리'],
      [66, 75, '떡볶이 · 튀김'], [75, 84, '샐러드'], [84, 93, '타코'], [100, 109, '주스 바'], [109, 118, '돈카츠'], [118, 127, '비빔밥'], [127, 136, '디저트 카페'], [136, 146, '아이스크림']];
    WEST.forEach(([u0, u1, name], i) => stall({ axis: 's', u0, u1, f: 8.6, b: 0.4, y: YB1, name, kind: name.includes('카페') || name.includes('바') ? 'cafe' : 'food', sub: `PLATFORM ${String(i + 1).padStart(2, '0')}`, seed: 30 + i }));
    const EAST = [[-20, -4, '팝업스토어', 'store', 'POP-UP STORE'], [-4, 8, '스타벅스', 'cafe', '센트럴시티점'], [26, 36, '마카롱', 'cafe'], [36, 46, '베트남 반미', 'food'],
      [46, 56, '중식 · 짬뽕', 'food'], [56, 66, '라멘', 'food'], [66, 76, '스테이크 덮밥', 'food'], [76, 86, '김밥 · 분식', 'food'], [86, 96, '커피 바', 'cafe'], [96, 106, '와플', 'cafe'],
      [106, 116, '피자', 'food'], [116, 126, '쌀국수 · 분짜', 'food'], [126, 136, '한식 도시락', 'food']];
    EAST.forEach(([u0, u1, name, kind, sub], i) => stall({ axis: 's', u0, u1, f: 28, b: 38.0, y: YB1, name, kind, sub: sub || `PLATFORM ${String(i + 16).padStart(2, '0')}`, seed: 60 + i, noBack: true }));
    for (const s of [8, 26, 136]) lwall(s, 28, s, 38, YB1, YB1 + 3.6, { mat: M.part, thick: 0.15 });
    // J4 B1: passage to 신세계 식품관 / 면세점 (s 16..26 on the east wall)
    lsign(['신세계백화점 식품관 · 신세계면세점  →', 'SHINSEGAE FOOD HALL'], 21, 27.8, YB1 + 3.4, 6, 0.8, 'W', { bg: '#2b2b2b', fg: '#fff' });
    // rail-theme: overhead station boards along the corridor, clock, bench "platforms"
    for (let s = 0; s < 146; s += 24) {
      lbox(s, 18.1, 0.25, 6.4, CB - 1.25, 0.9, 0x1b1b1b, { solid: false });
      lsign(['FAMILLE STATION', `파미에스테이션 · ${['1', '2', '3', '4', '5', '6', '7'][s / 24]}번 플랫폼`], s - 0.14, 18.1, CB - 0.8, 6.2, 0.86, 'N', { bg: '#141414', fg: '#f0e6c8' });
      lsign(['FAMILLE STATION', `← 신세계 · 지하철      메가박스 센트럴 →`], s + 0.14, 18.1, CB - 0.8, 6.2, 0.86, 'S', { bg: '#141414', fg: '#f0e6c8' });
      lbox(s, 18.1, 0.06, 0.06, CB - 0.35, 0.35, 0x444444, { solid: false });
    }
    // inlaid railway track along the corridor (기차역 컨셉): sleepers + two steel rails
    for (const [a0, a1] of [[-12, 84], [97.5, 150]]) {
      for (let s = a0; s < a1; s += 0.9) lbox(s, 12.9, 0.28, 2.3, YB1, 0.012, 0x4a3a2c, { solid: false });
      for (const t of [12.18, 13.62]) lbox((a0 + a1) / 2, t, a1 - a0, 0.08, YB1, 0.03, 0x9da3a8, { solid: false });
    }
    for (const s of [30, 110]) { lcyl(s, 18.1, YB1, 0.12, 3.2, 0x2b2b2b); lbox(s, 18.1, 0.3, 1.2, YB1 + 3.2, 1.2, 0x2b2b2b, { solid: false }); lsign('12:45', s + 0.16, 18.1, YB1 + 3.8, 1.0, 1.0, 'S', { bg: '#f7f2e6', fg: '#1b1b1b' }); lsign('12:45', s - 0.16, 18.1, YB1 + 3.8, 1.0, 1.0, 'N', { bg: '#f7f2e6', fg: '#1b1b1b' }); }
    for (let s = 6; s < 140; s += 20) if (Math.abs(s - 62) > 5 && (s < 82 || s > 100)) { lbox(s, 11.6, 4, 0.5, YB1, 0.45, 0x6b4f37); lbox(s, 24.6, 4, 0.5, YB1, 0.45, 0x6b4f37); }
    // B1 light: warm pendant strips along the corridor
    for (let s = -18; s < 150; s += 4) for (const t of [12, 24]) lbox(s, t, 2.4, 0.3, CB - 0.07, 0.05, 'emit', { color: 0xffe2b0, solid: false });
    for (let s = -18; s < 150; s += 8) for (const t of [4.5, 33]) lbox(s, t, 1.2, 1.2, CB - 0.07, 0.05, 'emit', { color: 0xfff4dc, solid: false });
    lcrowd(-18, 10.5, 148, 26, YB1, 80, 21);
    // north plaza (J3 arrival from GOTO MALL)
    lsign(['GOTO MALL 고투몰 · 지하철 3·7·9호선  ↑', '고속터미널역 · 경부선 터미널'], -19.5, 12.6, YB1 + 3.5, 6.5, 0.9, 'S', { bg: '#202a36', fg: '#fff' });
    lsign(['호남선 터미널 1F ↑', '센트럴시티 · 매표소'], -15.5, 15.2, YB1 + 3.2, 3.6, 0.7, 'N', { bg: '#1d3557', fg: '#fff' });
    lsign(['지하철 3·7·9호선  →', '고투몰 · 경부선 방면'], 86.5, 21, YB1 + 3.4, 4.6, 0.75, 'N', { bg: '#202a36', fg: '#fff' });
  }
  // ---- J3 corridor (owner): GOTO south wall (-150,-54.8) → north tip of the B1 (-128,-5)
  {
    const ax = -150, az = -54.9, bx = -131.8, bz = -14.4;
    const L = Math.hypot(bx - ax, bz - az), ux = (bx - ax) / L, uz = (bz - az) / L, nx = -uz, nz = ux, hw = 5;
    const poly = [[ax + nx * hw, az + nz * hw], [bx + nx * hw, bz + nz * hw], [bx - nx * hw, bz - nz * hw], [ax - nx * hw, az - nz * hw]];
    K.slab(poly, YB1, { mat: { tex: 'tile', color: 0xd7d0c4 }, under: false, ceil: false, edge: false });
    K.hpoly(M.ceil, poly, YB1 + 3.4, false);
    K.phys.addCeiling(poly, YB1 + 3.4, {});
    for (const sg of [1, -1]) K.wall(ax + nx * hw * sg, az + nz * hw * sg, bx + nx * hw * sg, bz + nz * hw * sg, YB1, YB1 + 3.4, { mat: 0xe6e0d4, thick: 0.25 });
    for (let k = 3; k < L - 2; k += 4) { K.box({ x: ax + ux * k, z: az + uz * k, y: YB1 + 3.32, w: 3.2, d: 0.4, h: 0.05, rotY: Math.atan2(ux, uz), mat: 'emit', solid: false }); }
    for (let k = 8; k < L - 6; k += 12) for (const sg of [1, -1]) {
      K.box({ x: ax + ux * k + nx * (hw - 0.6) * sg, z: az + uz * k + nz * (hw - 0.6) * sg, y: YB1, w: 1.0, d: 3.2, h: 2.2, rotY: Math.atan2(ux, uz), mat: 0x2f3338 });
      sign(['센트럴시티', 'CENTRAL CITY'], { x: ax + ux * k + nx * (hw - 1.12) * sg, z: az + uz * k + nz * (hw - 1.12) * sg, y: YB1 + 1.3, w: 2.8, h: 1.6, rotY: Math.atan2(-nx * sg, -nz * sg), bg: '#f2ede2', fg: '#1d3557' });
    }
    const m = 0.5; sign(['센트럴시티 · 호남선 터미널 ↓', '파미에스테이션 · 신세계백화점'], { x: ax + ux * 3, z: az + uz * 3, y: YB1 + 2.9, w: 6, h: 0.75, rotY: Math.atan2(-ux, -uz), bg: '#1d3557', fg: '#fff', twoSided: true });
    sign(['GOTO MALL 고투몰 ↑', '고속터미널역 3·7·9호선'], { x: ax + ux * (L - 3), z: az + uz * (L - 3), y: YB1 + 2.9, w: 6, h: 0.75, rotY: Math.atan2(ux, uz), bg: '#202a36', fg: '#fff', twoSided: true });
    K.crowd(poly, YB1, 10, { seed: 31 }); void m;
    K.zone({ name: '센트럴시티 ↔ 고투몰 연결통로', floor: 'B1', sub: '지하 연결통로 · 고속터미널역 · 경부선 방면', poly, y0: YB1 - 0.5, y1: YB1 + 3.4, priority: 2 });
  }

  // ================================================================= south block — 파미에스테이션 1F/2F, 하차장, 메가박스 B1
  escPair(183, 172.5, 20.4, YB1, Y1, 'f1', true);         // E4 메가박스 B1 ↔ 1F
  escPair(172, 180.8, 25.4, Y1, Y2, 'f2', false);         // E5 1F ↔ 2F
  flight(171.5, 181, -94.6, YB1, Y1, 'f1', true);          // west stair core
  flight(181, 172.7, -91.6, Y1, Y2, 'f2');
  flight(173, 179.7, -94.6, Y2, YR, 'rf');
  rail(171.5, -95.8, 181, -95.8, Y1); rail(171.5, -93.4, 181, -93.4, Y1); rail(171.5, -95.8, 171.5, -93.4, Y1);
  rail(172.5, -92.8, 181, -92.8, Y2); rail(172.5, -90.4, 181, -90.4, Y2); rail(181, -92.8, 181, -90.4, Y2);
  rail(173, -95.8, 179.7, -95.8, YR); rail(173, -93.4, 179.7, -93.4, YR); rail(173, -95.8, 173, -93.4, YR);
  lwall(170.8, -97.4, 182.2, -97.4, YR, YR + 3, { mat: 0xd0ccc4 }); lwall(170.8, -89.4, 182.2, -89.4, YR, YR + 3, { mat: 0xd0ccc4 });
  lwall(170.8, -97.4, 170.8, -89.4, YR, YR + 3, { mat: 0xd0ccc4 }); lwall(182.2, -97.4, 182.2, -89.4, YR, YR + 3, { mat: 0xd0ccc4, openings: [{ at: 4, w: 2.4, y0: YR, y1: YR + 2.4 }] });
  lbox(176.5, -93.4, 11.4, 8, YR + 3, 0.25, 0xbab6ae, { solid: false });
  const SOUTH_FLOORS = [{ label: 'B1', y: YB1, name: '메가박스 센트럴' }, { label: '1F', y: Y1, name: '파미에스테이션 · 하차장' }, { label: '2F', y: Y2, name: '파미에스테이션 2층 식당가' }, { label: 'R', y: YR, name: '옥상 주차장' }];
  elev('파미에스테이션 엘리베이터', 160, -6, 'S', SOUTH_FLOORS, ['b1', 'f1', 'f2', 'rf']);
  {
    // ---- B1 메가박스 센트럴 (전관 부띠끄 M, 8개관). Screens on the corridor (north) wall, door beside the screen,
    // stadium risers climbing south toward the projection wall. 1관 is nearest the lobby.
    const yb = YB1;
    const HALL_IN = 0x4b3a58, HALL_OUT = 0x3a2f45, LEATHER = 0x6a2a2a, LEATHER_D = 0x45191b;
    const SCENES = [
      [[-.5, .5, 0, 1, 0x2e3c74, 0], [-.5, .5, .3, .7, 0x9a5a86, 1], [-.5, .5, .3, .5, 0xf09060, 2], [-.08, .08, .4, .6, 0xfff0b0, 3], [-.5, .5, 0, .33, 0x1b2e4a, 4], [-.03, .03, .05, .33, 0xf6b070, 5]],
      [[-.5, .5, 0, 1, 0x0c1230, 0], [-.5, .5, 0, .45, 0x26346a, 1], [.28, .36, .72, .86, 0xf4f0d8, 2], [-.5, -.36, 0, .55, 0x0a0c16, 3], [-.36, -.2, 0, .38, 0x0a0c16, 3], [-.2, -.05, 0, .68, 0x0a0c16, 3],
        [-.05, .12, 0, .45, 0x0a0c16, 3], [.12, .3, 0, .6, 0x0a0c16, 3], [.3, .5, 0, .4, 0x0a0c16, 3], [-.16, -.13, .4, .45, 0xffd27a, 4], [-.1, -.07, .5, .55, 0xffd27a, 4], [.17, .2, .3, .35, 0xffd27a, 4], [-.44, -.41, .3, .35, 0xffd27a, 4]],
      [[-.5, .5, 0, 1, 0x8fc8ef, 0], [-.3, -.05, .7, .8, 0xffffff, 1], [.1, .32, .78, .86, 0xffffff, 1], [-.5, .1, 0, .42, 0x5aa04e, 2], [-.1, .5, 0, .34, 0x3f8a40, 3], [-.04, .04, 0, .34, 0xc9b48a, 4]],
    ];
    const SHOWS = ['남쪽 바다로', '시간의 터미널', '광주행 막차', '한강의 여름', '괴물의 시간', '센트럴', '마지막 승차홈', '호남선'];
    for (let k = 0; k < 8; k++) {
      const t0 = k < 6 ? -86 + k * 9.5 : (k === 6 ? -29 : -19.5), t1 = t0 + 9.5, tc = (t0 + t1) / 2;
      const se = k < 6 ? 199.2 : 189.8; // halls 1–2 are shallower (station concourse beyond)
      const no = 8 - k;
      // walls: side wall at t0 (shared), last hall also closes t1; back wall; front (corridor) wall with the door beside the screen
      lwall(171.5, t0, k === 6 ? 199.2 : se, t0, yb, CB, { mat: HALL_IN, mat2: HALL_IN, thick: 0.25 });
      if (k === 7) lwall(171.5, t1, se, t1, yb, CB, { mat: HALL_IN, mat2: HALL_IN, thick: 0.25 });
      lwall(se, t0, se, t1, yb, CB, { mat: HALL_IN, mat2: HALL_IN, thick: 0.25 });
      lwall(171.5, t0, 171.5, t1, yb, CB, { mat: HALL_OUT, mat2: HALL_IN, thick: 0.25, openings: [{ at: 1.0, w: 1.5, y0: yb, y1: yb + 2.5 }] });
      // corridor side: hall number over the door + name plate
      lsign(`${no}관`, 171.3, t0 + 1.0, yb + 2.85, 1.2, 0.5, 'N', { bg: '#503396', fg: '#ffffff' });
      lsign([`${no}관  부띠끄 M`, `${SHOWS[k]}  ${['14:10', '14:40', '15:05', '15:30', '16:00', '16:20', '16:45', '17:10'][k]}`], 171.3, tc + 1.6, yb + 2.6, 3.4, 0.9, 'N', { bg: '#1b1530', fg: '#e6dcff', box: 0.08, boxMat: 0x503396 });
      // dark ceiling + carpeted pit
      K.hpoly(0x221c28, RECT(171.6, t0 + 0.1, se - 0.1, t1 - 0.1), CB - 0.05, false);
      K.hpoly({ tex: 'carpet', color: 0x4a2a3a }, RECT(171.65, t0 + 0.15, 176.5, t1 - 0.15), yb + 0.01, true);
      // screen: black masking frame + emissive picture made of flat colour layers
      const SW = 5.8, SH = 3.2, sy0 = yb + 1.4, stc = tc + 0.25;
      lbox(171.72, stc, 0.06, SW + 0.5, sy0 - 0.25, SH + 0.5, 0x060608, { solid: false });
      for (const [a, b, c, d, col, L] of SCENES[k % 3]) lbox(171.79 + L * 0.025, stc + (a + b) / 2 * SW, 0.02, (b - a) * SW, sy0 + c * SH, (d - c) * SH, 'emit', { color: col, solid: false });
      // speakers either side of the screen
      lbox(171.95, stc + SW / 2 + 0.55, 0.4, 0.5, yb + 2.4, 1.2, 0x15151a, { solid: false });
      // stadium risers + recliners (부띠끄 리클라이너)
      const nR = Math.floor((se - 176.5) / 1.9);
      const nS = Math.floor((t1 - 0.6 - (t0 + 2.3)) / 0.95) + 1;
      for (let r = 0; r < nR; r++) {
        const s0 = 176.5 + r * 1.9, s1 = r === nR - 1 ? se - 0.12 : s0 + 1.9, hr = 0.3 * (r + 1), yr = yb + hr;
        lbox((s0 + s1) / 2, tc, s1 - s0, t1 - t0 - 0.25, yb, hr, 0x2a1f2f, { top: { tex: 'carpet', color: 0x55303f } });
        lbox(s0 + 0.03, t0 + 0.9, 0.05, 1.1, yr - 0.1, 0.05, 'emit', { color: 0xffb060, solid: false }); // aisle step light
        for (let c = 0; c < nS; c++) {
          const t = t0 + 2.3 + c * 0.95;
          lbox(s0 + 0.75, t, 0.95, 0.8, yr, 0.42, LEATHER, { top: 0x7a3434, solid: false });
          lbox(s0 + 1.33, t, 0.24, 0.8, yr + 0.42, 0.72, LEATHER_D, { solid: false });
          if (rnd() < 0.28) lperson(s0 + 0.85, t, yr, { sit: true, rotY: F.N });
        }
        for (const dt of [t0 + 1.82, t1 - 0.2]) lbox(s0 + 0.95, dt, 0.9, 0.12, yr + 0.42, 0.2, LEATHER_D, { solid: false }); // row-end armrests
      }
      // side-wall sconces, exit signs, projection window, hall number inside
      for (let s = 175; s < se - 1; s += 4.5) for (const tw of [t0 + 0.16, t1 - 0.16]) lbox(s, tw, 0.35, 0.06, yb + 4.4, 0.45, 'emit', { color: 0xffc890, solid: false });
      lsign('비상구', 171.66, t0 + 1.0, yb + 2.75, 0.9, 0.32, 'S', { bg: '#1f8a3b', fg: '#ffffff' });
      lsign(`${no}관`, 171.66, t0 + 1.0, yb + 3.25, 0.9, 0.42, 'S', { bg: '#503396', fg: '#ffffff' });
      lbox(se - 0.1, tc, 0.06, 1.4, yb + 0.3 * nR + 2.6, 0.5, 'emit', { color: 0xbfd4ff, solid: false });
      K.zone({ poly: RECT(171.5, t0, se, t1), name: `메가박스 센트럴 ${no}관`, floor: 'B1', sub: `부띠끄 M 리클라이너 ${nR * nS}석 · 상영 중 ‘${SHOWS[k]}’`, y0: YB1 - 0.5, y1: CB, priority: 4 });
    }
    // theatre corridor (s 168..171.5): purple carpet, sconces, lit ceiling slots
    for (let t = -94; t < -10; t += 4) lbox(169.9, t, 0.4, 2.4, CB - 0.07, 0.05, 'emit', { color: 0xc8b8ff, solid: false });
    K.hpoly(0x241c2b, RECT(167.5, -98.5, 171.5, -10), CB - 0.02, false);
    K.hpoly({ tex: 'carpet', color: 0x3c2c4e }, RECT(168.3, -97.5, 171.35, -10), yb + 0.012, true);
    for (let t = -92; t < -12; t += 6) lbox(168.35, t, 0.06, 0.3, yb + 2.4, 0.5, 'emit', { color: 0xd9c8ff, solid: false });
    // ticket check (입장) at the corridor mouth
    for (const s of [168.5, 171.2]) lbox(s, -9.6, 0.35, 0.35, yb, 2.9, 0x503396);
    lbox(169.85, -9.6, 3.05, 0.35, yb + 2.9, 0.6, 0x503396, { solid: false });
    lsign(['입장  ENTRANCE', '상영관 1–8관'], 169.85, -9.4, yb + 3.2, 2.9, 0.55, 'E', { bg: '#503396', fg: '#ffffff', pxPerM: 90 });
    lbox(170.6, -8.6, 0.6, 0.5, yb, 1.05, 0x2b2b30, { top: 0x503396 });
    lperson(170.6, -7.9, yb, { rotY: F.W, shirt: 0x503396 });
    // lobby: dark stone floor + dark ceiling with purple cove light
    const LOB = [P(151.3, 0), P(168.2, -19.9), P(168.3, -10), P(189.0, -10), P(189.0, 37.6), P(151.3, 37.6)];
    const LOBH = [RECT(172.5, 19.65, 183.6, 22.65), RECT(158.8, -7.2, 161.2, -4.8)];
    K.hpoly({ tex: 'darkstone', color: 0x9a94a2 }, LOB, yb + 0.008, true, LOBH);
    for (let s = 156; s < 189; s += 4) for (const t of [-4, 2, 8, 16, 24, 30]) if (!(t === 16 && s > 171 && s < 185)) lbox(s, t, 0.9, 0.9, CB - 0.08, 0.04, 'emit', { color: 0xf2ecff, solid: false });
    for (const t of [0, 12, 30]) lbox(170, t, 34, 0.25, CB - 0.09, 0.05, 'emit', { color: 0x8a6cff, solid: false });
    // south wall feature: MEGABOX letters on a backlit purple panel facing the E4 escalator landing
    lbox(188.98, 21, 0.12, 10.5, yb + 2.0, 2.9, 0x2a1d4f, { solid: false });
    lsign(['MEGABOX', '메가박스 센트럴'], 188.88, 21, yb + 3.55, 8.6, 1.9, 'N', { bg: '#352263', fg: '#ffffff' });
    lsign('THE BOUTIQUE · 전관 부띠끄 M · 8개관', 188.88, 21, yb + 2.3, 8.0, 0.5, 'N', { bg: '#1b1530', fg: '#d9c8ff' });
    // 매점 (concession) along the south wall t -3..13: back counter with popcorn machines/drink towers, front counter, menu boards
    lbox(188.85, 5, 0.9, 16, yb, 0.95, 0x2b2b30, { top: 0x9a9ca2 });
    for (const t of [-1.2, 1.4]) { lbox(188.8, t, 0.75, 1.3, yb + 0.95, 1.05, 'glass', { solid: false }); lbox(188.8, t, 0.65, 1.2, yb + 0.97, 0.55, 'emit', { color: 0xffd860, solid: false }); lbox(188.8, t, 0.8, 1.35, yb + 2.0, 0.12, 0xb3261e, { solid: false }); }
    for (const t of [4.2, 6.0, 7.8]) { lbox(188.85, t, 0.6, 1.4, yb + 0.95, 0.85, 0x9aa0a6, { solid: false }); lbox(188.52, t, 0.03, 1.2, yb + 1.35, 0.4, 'emit', { color: [0xd8262e, 0x2a7de1, 0x3fae4a][Math.round(t) % 3], solid: false }); }
    for (const t of [10.2, 11.8]) lbox(188.85, t, 0.6, 1.4, yb + 0.95, 0.6, 0xd8d2c6, { solid: false });
    lbox(186.4, 5, 0.8, 15, yb, 1.05, 0x352263, { top: 0x1b1b1b });
    lbox(186.4, 9.5, 0.7, 2.6, yb + 1.05, 0.55, 'glass', { solid: false }); lbox(186.4, 9.5, 0.6, 2.4, yb + 1.06, 0.2, 'emit', { color: 0xffe2a8, solid: false });
    for (const t of [-1, 3, 7]) { lbox(186.5, t, 0.35, 0.4, yb + 1.05, 0.28, 0x1b1b1b, { solid: false }); lbox(186.3, t, 0.02, 0.32, yb + 1.15, 0.16, 'emit', { color: 0x7fd0ff, solid: false }); lperson(187.5, t, yb, { rotY: F.N, shirt: 0x352263 }); }
    const MENU_MB = [['팝콘  POPCORN', '오리지널 M 5,500', '바질어니언 L 7,500'], ['콤보  COMBO', '싱글콤보 10,500', '러브콤보 13,000'], ['음료  DRINK', '콜라 · 사이다 3,000', '아메리카노 4,500'], ['스낵  SNACK', '나쵸 · 오징어 · 핫도그', '부띠끄 와인 · 맥주']];
    MENU_MB.forEach((m, i) => lsign(m, 188.98, -1.5 + (3 - i) * 4.1, yb + 3.05, 3.8, 1.3, 'N', { bg: '#0f0b1e', fg: '#ffe6a0', pxPerM: 90, box: 0.06, boxMat: 0x503396 }));
    lsign('매점  SNACK BAR', 188.98, 5, yb + 4.2, 7, 0.6, 'N', { bg: '#503396', fg: '#ffffff' });
    // 매표소 (staffed ticket counter) t 27..37 + queue stanchions
    lbox(187.2, 32, 0.9, 9.5, yb, 1.1, 0xf1eee8, { top: 0x352263 });
    lwall(187.7, 27.2, 187.7, 36.8, yb + 1.1, yb + 2.4, { mat: 'glass', thick: 0.04 });
    for (let k = 0; k < 3; k++) { const t = 28.8 + k * 3.2; lperson(188.3, t, yb, { rotY: F.N, shirt: 0x352263 }); lsign(`${k + 1}`, 187.68, t, yb + 2.15, 0.35, 0.35, 'N', { bg: '#ffd84a', fg: '#352263' }); lbox(187.0, t, 0.3, 0.45, yb + 1.1, 0.3, 0x1b1b1b, { solid: false }); }
    lsign(['매표소  TICKET', '현장예매 · 멤버십 · 할인'], 188.98, 32, yb + 3.05, 6.5, 1.1, 'N', { bg: '#352263', fg: '#ffffff' });
    for (let k = 0; k < 5; k++) { const p = [183.6, 27.5 + k * 2.2]; lcyl(p[0], p[1], yb, 0.05, 0.95, 0xb0b4b8); lcyl(p[0] + 1.6, p[1], yb, 0.05, 0.95, 0xb0b4b8); }
    lbox(183.6, 31.9, 0.03, 8.8, yb + 0.85, 0.06, 0x503396, { solid: false }); lbox(185.2, 31.9, 0.03, 8.8, yb + 0.85, 0.06, 0x503396, { solid: false });
    for (let k = 0; k < 4; k++) lperson(184.4, 28.4 + k * 1.7, yb, { rotY: F.S });
    for (let k = 0; k < 5; k++) lperson(184.9, -1.5 + k * 2.6, yb, { rotY: F.S });
    // 무인발권기 along the east wall (facing the lobby) + poster lightboxes above
    for (let k = 0; k < 8; k++) { lbox(158 + k * 1.2, 37.0, 0.9, 0.6, yb, 1.6, 0xffffff); lbox(158 + k * 1.2, 36.68, 0.6, 0.03, yb + 0.95, 0.5, 'emit', { color: 0x9b8cff, solid: false }); }
    lsign('무인발권기  KIOSK', 162.2, 36.66, yb + 1.9, 5, 0.32, 'W', { bg: '#352263', fg: '#fff' });
    const POST = [['남쪽 바다로', '15:20', '#1b2a4a'], ['한강의 여름', '16:05', '#4a1b2a'], ['시간의 터미널', '16:40', '#1b4a3a'], ['광주행 막차', '17:10', '#3a3a1b'], ['센트럴', '18:00', '#2a1b4a'], ['마지막 승차홈', '19:25', '#4a3a1b']];
    POST.forEach(([a, b, c], k) => { const s = 156.5 + k * 2.6; lbox(s, 37.55, 2.2, 0.1, yb + 2.2, 2.4, 'emit', { color: 0xf0ecff, solid: false }); lsign([a, '부띠끄 M', b], s, 37.48, yb + 3.4, 1.9, 2.1, 'W', { bg: c, fg: '#fff' }); });
    [['남쪽 바다로', '#1b2a4a'], ['광주행 막차', '#3a3a1b'], ['시간의 터미널', '#1b4a3a'], ['한강의 여름', '#4a1b2a']].forEach(([a, c], k) => { const s = 174.5 + k * 3.6; lbox(s, -9.82, 2.6, 0.1, yb + 1.0, 3.2, 'emit', { color: 0xf4f0ff, solid: false }); lsign([a, 'NOW SHOWING', '부띠끄 M'], s, -9.76, yb + 2.6, 2.3, 2.9, 'E', { bg: c, fg: '#ffffff' }); });
    lsign('MEGABOX  ·  메가박스 센트럴', 181, -9.76, yb + 4.6, 12, 0.6, 'E', { bg: '#352263', fg: '#ffffff' });
    // 상영시간표 board hanging over the lobby (both faces)
    const TT = ['상영시간표  TODAY', ...SHOWS.map((n, i) => `${i + 1}관  ${n.padEnd(7, ' ')}  ${['11:20', '11:45', '12:10', '12:30', '13:05', '13:20', '13:50', '14:15'][i]}  ${['14:10', '14:40', '15:05', '15:30', '16:00', '16:20', '16:45', '17:10'][i]}  ${['17:00', '17:30', '18:00', '18:20', '18:50', '19:10', '19:40', '20:05'][i]}`)];
    for (const face of ['N', 'S']) lsign(TT, 172 + (face === 'N' ? -0.06 : 0.06), 8, yb + 3.9, 5.6, 2.5, face, { bg: '#0a0814', fg: '#e6dcff', bold: false, align: 'left', pxPerM: 120 });
    for (const dt of [-2.6, 2.6]) lbox(172, 8 + dt, 0.05, 0.05, yb + 5.15, CB - yb - 5.15, 0x444444, { solid: false });
    // 부띠끄 라운지: sofas + low tables
    for (const [s, t] of [[155, 8], [155, 16], [164, 12], [164, 22], [155, 26]]) {
      lbox(s - 1.1, t, 0.8, 3.0, yb, 0.42, 0x3d2c5c, { top: 0x5a4380 }); lbox(s - 1.45, t, 0.25, 3.0, yb + 0.42, 0.5, 0x2f2248);
      lbox(s + 1.1, t, 0.8, 3.0, yb, 0.42, 0x3d2c5c, { top: 0x5a4380 }); lbox(s + 1.45, t, 0.25, 3.0, yb + 0.42, 0.5, 0x2f2248);
      lbox(s, t, 0.9, 1.6, yb, 0.38, 0x1b1b1b, { top: 0xb8a37a });
      if (rnd() < 0.7) lperson(s - 1.1, t - 0.6, yb, { sit: true, rotY: F.S }); if (rnd() < 0.5) lperson(s + 1.1, t + 0.6, yb, { sit: true, rotY: F.N });
    }
    lsign(['부띠끄 라운지', 'BOUTIQUE LOUNGE'], 151.6, 16, yb + 3.3, 4, 0.8, 'S', { bg: '#1b1530', fg: '#d9c8ff', twoSided: true });
    lsign(['상영관 1–8관 ←', 'SCREEN 1–8'], 166.6, -7, yb + 3.2, 3.6, 0.8, 'S', { bg: '#352263', fg: '#fff', twoSided: true });
    lcrowd(166, -6, 182, 18, yb, 18, 41); lcrowd(167, 24, 181, 34, yb, 8, 42);
    lzone(181.5, -4, 189.4, 15, { name: '메가박스 센트럴 매점', floor: 'B1', sub: '팝콘 · 콤보 · 음료 · 스낵', y0: YB1 - 0.5, y1: CB, priority: 3 });
    lzone(181.5, 26, 189.4, 37.8, { name: '메가박스 센트럴 매표소', floor: 'B1', sub: '현장예매 · 무인발권기 · 상영시간표', y0: YB1 - 0.5, y1: CB, priority: 3 });
    lzone(167.5, -98.5, 171.5, -10, { name: '메가박스 센트럴 상영관 복도', floor: 'B1', sub: '1–8관 입장 · 부띠끄 M', y0: YB1 - 0.5, y1: CB, priority: 3 });
    // west end B1: toilets + corridor to stairs
    shop({ axis: 's', u0: 182, u1: 195, f: -89.5, b: -98, y: yb, h: 4, name: '화장실', kind: 'toilet', noBack: true });
  }
  {
    // ---- 1F south block
    const y = Y1;
    // 하차장 대합 (arrivals hall) north-west, open to the corridor; doors on the north face (e7)
    for (let t = -84; t < -30; t += 8) { lbox(176, t, 0.55, 5, y, 0.45, 0x5d6d7e, { top: 0x46535f }); }
    lsign(['하차장  ARRIVALS', '택시 승강장 · 지하철 3·7·9호선 →'], 168.9, -60, 3.6, 8, 1.2, 'S', { bg: '#1d3557', fg: '#ffffff' });
    lsign(['지하철 7호선 · 파미에스테이션 →', '신세계백화점 · JW 메리어트'], 185, -28, 3.6, 5.5, 0.8, 'E', { bg: '#202a36', fg: '#fff', twoSided: true });
    lcrowd(170, -95, 188, -25, y, 26, 51);
    // north row (east part): 장터국수 · 스타벅스 · 던킨, fronts at s=181 facing south
    shop({ axis: 't', u0: -22, u1: -12, f: 181, b: 170, y, h: 4.1, name: '장터국수', kind: 'food', seed: 71 });
    shop({ axis: 't', u0: -10, u1: 4, f: 181, b: 168.5, y, h: 4.1, name: '스타벅스', kind: 'cafe', sub: '센트럴1F점', seed: 72 });
    shop({ axis: 't', u0: 4, u1: 16, f: 181, b: 168.5, y, h: 4.1, name: '던킨', kind: 'cafe', sub: 'DUNKIN · 센트럴시티', seed: 73 });
    // south row: fronts at s=189 facing north
    const S1 = [[-98, -86, '화장실', 'toilet'], [-76, -64, 'ATM 코너', 'bank', 'KB국민 · 신한 · 우리 · 하나'], [-64, -52, '편의점', 'store'], [-52, -40, '포브 FOURB', 'cafe', '베이글 · 커피'],
      [-40, -28, '고객센터', 'office'], [-28, -16, '메가박스 센트럴 B1', 'store', '↓ 에스컬레이터'], [-4, 8, '약국', 'store'], [20, 36, '파리바게뜨', 'cafe', '센트럴시티점']];
    for (const [u0, u1, name, kind, sub] of S1) shop({ axis: 't', u0, u1, f: 189, b: 202.4, y, h: 4.1, name, kind, sub, seed: u0 + 300 });
    lsign(['파미에스테이션', 'FAMILLE STATION · 1F'], 176, 9, 3.9, 6, 1.0, 'S', { bg: '#141414', fg: '#f0e6c8', twoSided: true });
    lsign(['메가박스 센트럴 B1 ↓', 'MEGABOX'], 183.3, 21.15, 3.4, 3.4, 0.8, 'N', { bg: '#352263', fg: '#fff' });
    lsign(['2F 파미에스테이션 식당가 ↑', '아웃백 · 명동교자 · 소이연남'], 171.6, 26.15, 3.4, 4.6, 0.8, 'S', { bg: '#202a36', fg: '#fff' });
    for (let s = 152; s < 203; s += 6) for (const t of [-90, -78, -66, -54, -42, -30, -18, -6, 6, 18, 30]) {
      if (s > 168 && s < 182 && t > -90 && t < 18 && t > -24) continue;
      if (s < 168 && t < -20) continue;
      lbox(s, t, 1.4, 1.4, C1 - 0.06, 0.05, 'emit', { solid: false });
    }
    lcrowd(181.5, -90, 188.5, 36, y, 40, 52); lcrowd(152, 0, 168, 36, y, 18, 53);
    // columns south block
    for (let t = -86; t <= 34; t += 10) for (const s of [181, 189]) { if (Math.abs(t - 21) < 3 || Math.abs(t - 26) < 3) continue; lcyl(s, t, Y1, 0.42, C1 - Y1, M.col); lcyl(s, t, Y2, 0.4, C2 - Y2, M.col); }
  }
  {
    // ---- 2F south block — 파미에스테이션 2층 맛집 (2018.1, 11곳) + 센트럴시티 식당가
    const y = Y2, h = C2 - Y2;
    const N2 = [[-86, -68, '명동교자', 'food', '센트럴시티점'], [-66, -44, '아웃백 스테이크하우스', 'food', 'OUTBACK · 센트럴시티점'], [-42, -26, '채선당 샤브보트', 'food'],
      [-24, -12, '소이연남', 'food', '파미에스테이션점'], [-10, 2, '팔도국수 면주방', 'food'], [2, 14, '홍대만뽀', 'food', '일식 덮밥'], [31, 37.5, '더네일바', 'beauty']];
    for (const [u0, u1, name, kind, sub] of N2) shop({ axis: 't', u0, u1, f: 181, b: 168.5, y, h, name, kind, sub, seed: u0 + 500 });
    const S2 = [[-98, -86, '화장실', 'toilet'], [-86, -72, '쌀국수', 'food'], [-72, -58, '수제버거', 'food'], [-58, -44, '타코 · 부리또', 'food'], [-44, -30, '디저트 카페', 'cafe'],
      [-30, -16, '돈부리', 'food'], [-16, -2, '더 살롱', 'beauty', 'HAIR'], [-2, 12, '더스파', 'beauty', 'SPA'], [12, 24, '크래프트 맥주', 'food'], [24, 36, '브런치 카페', 'cafe']];
    for (const [u0, u1, name, kind, sub] of S2) shop({ axis: 't', u0, u1, f: 189, b: 202.4, y, h, name, kind, sub, seed: u0 + 600, noBack: true });
    lsign(['파미에스테이션 2F', '홍대 · 이태원 맛집 11곳'], 185, 36, y + 2.7, 6, 1.0, 'W', { bg: '#141414', fg: '#f0e6c8' });
    for (let t = -94; t < 36; t += 5) lbox(185, t, 1.2, 1.2, C2 - 0.06, 0.05, 'emit', { color: 0xfff1d8, solid: false });
    lcrowd(181.5, -95, 188.5, 36, y, 34, 61);
  }

  // ================================================================= 2F — 센트럴시티 식당가 (strip)
  {
    const y = Y2, h = C2 - Y2;
    const W2L = [[-20, -2, '호남선 운수사 사무실', 'office', '금호고속 · 중앙고속 · 천일고속 · 한일고속 · 삼화고속'], [-2, 12, '센트럴시티 관리사무소', 'office'], [12, 24, '서대문 한옥집', 'food', '김치찜'],
      [24, 36, '우마이도', 'food', '라멘'], [36, 48, '르사이공', 'food', '베트남 요리'], [48, 60, '순대실록', 'food', '센트럴시티점'], [64, 76, '101번지 남산돈까스', 'food', '센트럴시티점'],
      [76, 88, '한식당', 'food', '백반 · 찌개'], [88, 100, '분식', 'food'], [100, 112, '중식당', 'food'], [112, 124, '칼국수', 'food'], [124, 136, '카페', 'cafe'], [136, 150, '화장실', 'toilet']];
    for (const [u0, u1, name, kind, sub] of W2L) shop({ axis: 's', u0, u1, f: 12, b: 0.4, y, h, name, kind, sub, seed: u0 + 700, noBack: true });
    const E2L = [[-20, -2, '승무원 휴게실', 'office', '관계자 외 출입금지'], [-2, 10, '고객 라운지', 'cafe'], [10, 22, '죽 전문점', 'food'], [22, 34, '돈부리', 'food'], [34, 46, '샐러드', 'food'],
      [46, 58, '베이커리 카페', 'cafe'], [66, 78, '냉면', 'food'], [78, 90, '떡볶이', 'food'], [90, 102, '디저트', 'cafe'], [102, 114, '수제버거', 'food'], [114, 126, '크래프트 맥주', 'food'], [126, 138, '꽃 · 선물', 'flower']];
    for (const [u0, u1, name, kind, sub] of E2L) shop({ axis: 's', u0, u1, f: 26, b: 38.2, y, h, name, kind, sub, seed: u0 + 800, noBack: true });
    lsign(['센트럴시티 식당가', 'CENTRAL CITY DINING · 2F'], 50, 18.15, y + 2.6, 5, 0.9, 'S', { bg: '#202a36', fg: '#fff' });
    lsign(['옥상 주차장 · 엘리베이터 / 계단', '파미에스테이션 2F →'], 138, 19, y + 2.7, 5, 0.8, 'N', { bg: '#202a36', fg: '#fff', twoSided: true });
    for (let s = -18; s < 150; s += 5) if (Math.abs(s - 62) > 3 && (s < 38 || s > 50)) for (const t of [15.5, 22.5]) lbox(s, t, 1.2, 1.2, C2 - 0.06, 0.05, 'emit', { color: 0xfff6e6, solid: false });
    lcrowd(-18, 12.5, 150, 25.5, y, 46, 71);
  }

  // ================================================================= envelope (walls) — terminal complex
  {
    const thick = 0.3;
    const ns = K.orient(TERM);
    const atOn = (a, b, x, z) => { const dx = b[0] - a[0], dz = b[1] - a[1]; return ((x - a[0]) * dx + (z - a[1]) * dz) / Math.hypot(dx, dz); };
    function edge(i, y0, y1, mat, inner, ops = [], extra = {}) {
      const a = TERM[i], b = TERM[(i + 1) % TERM.length];
      const L = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L;
      const ix = -ns[i][0] * thick / 2, iz = -ns[i][1] * thick / 2;
      const plus = (-uz * ns[i][0] + ux * ns[i][1]) > 0;
      const o = { thick, openings: ops.map(p => ({ at: atOn(a, b, p[0], p[1]), w: p[2], y0: p[3] ?? y0, y1: p[4] ?? y0 + 3.2 })), ...extra };
      if (plus) { o.mat = mat; o.mat2 = inner; } else { o.mat = inner; o.mat2 = mat; }
      K.wall(a[0] + ix, a[1] + iz, b[0] + ix, b[1] + iz, y0, y1, o);
    }
    const BAND = { tex: 'ccBand' };
    const P1 = (s, t) => P(s, t);
    // B1 (only where B1POLY follows the TERM edges; the clipped south side gets its own wall below)
    const J4 = [-92, 15.5];
    {
      const nsB = K.orient(B1POLY);
      const J3P = P1(-21.6, 12.6);
      for (let i = 0; i < B1POLY.length; i++) {
        const a = B1POLY[i], b = B1POLY[(i + 1) % B1POLY.length], L = Math.hypot(b[0] - a[0], b[1] - a[1]);
        if (L < 0.05) continue;
        const ops = [];
        // the last two are the open fronts onto the 7호선 B1 concourse (station module opens its wall at the same points)
        for (const [q, w] of [[J4, 8.4], [J3P, 10.4], [[-42.6, 177.2], 8.4], [[-61.3, 184.4], 8.4]]) {
          const at = atOn(a, b, q[0], q[1]); const ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L;
          const d = Math.abs((q[0] - a[0]) * uz - (q[1] - a[1]) * ux);
          if (d < 2.5 && at > -1 && at < L + 1) ops.push({ at, w, y0: YB1, y1: YB1 + 3.4 });
        }
        const ix = -nsB[i][0] * 0.15, iz = -nsB[i][1] * 0.15;
        K.wall(a[0] + ix, a[1] + iz, b[0] + ix, b[1] + iz, YB1, CB, { mat: M.wallB1, thick: 0.3, openings: ops });
      }
    }
    // 1F: north entrance facade (e12) glass with 2 doors; west wiggle edges glass; e11 shared wall solid (J4, J6 openings)
    const N1 = P1(-21.7, 12), N2 = P1(-21.5, 27);
    edge(12, Y1, C1, 'glass', 'glass', [[N1[0], N1[1], 5.5, Y1, 3.4], [N2[0], N2[1], 5.5, Y1, 3.4]], { thick: 0.04 });
    for (const i of [0, 1, 2]) edge(i, Y1, C1, 'glass', 'glass', [], { thick: 0.04 });
    { const a = T(3), b = P(-10, 0.3); K.wall(a[0], a[1], b[0], b[1], Y1, C1, { mat: 'glass', thick: 0.04 }); for (let k = 0; k <= 1; k += 0.25) K.box({ x: a[0] + (b[0] - a[0]) * k, z: a[1] + (b[1] - a[1]) * k, y: Y1, w: 0.12, d: 0.12, h: C1 - Y1, mat: 0x3a3f45, solid: false }); }
    edge(11, Y1, C1, 0xd7d2c8, M.wallIn, [[J4[0], J4[1], 8.4, Y1, Y1 + 3.4], [-55, 111.5, 6.6, Y1, Y1 + 3.4]]);
    // south block 1F: e6 (connector), e7 (하차장 doors), e8 (west end), e9 (사평대로), e10 (JW ramp end)
    const D7 = [-80, -62, -44, -30].map(t => { const p = P1(168.2, t); return [p[0], p[1], 4.2, Y1, 3.0]; });
    edge(6, Y1, C1, 'glass', 'glass', [], { thick: 0.04 });
    edge(7, Y1, C1, 'glass', 'glass', D7, { thick: 0.04 });
    edge(8, Y1, C1, 0xd7d2c8, M.wallIn, [[...P1(186, -98.6), 4, Y1, 3.0]]);
    const D9 = [[-81, 4], [-10, 6], [2, 8], [14, 4]].map(([t, w]) => { const s = 204.1 - (t + 98.9) * (1.3 / 135.8); const p = P1(s, t); return [p[0], p[1], w, Y1, 3.2]; });
    edge(9, Y1, C1, 'glass', 'glass', D9, { thick: 0.04 });
    edge(10, Y1, C1, 0xd7d2c8, M.wallIn);
    // mullions on all glass edges (1F)
    for (const i of [0, 1, 2, 6, 7, 9, 12]) {
      const a = TERM[i], b = TERM[(i + 1) % TERM.length], L = Math.hypot(b[0] - a[0], b[1] - a[1]);
      for (let k = 0; k <= L; k += 1.8) { const x = a[0] + (b[0] - a[0]) * k / L, z = a[1] + (b[1] - a[1]) * k / L; K.box({ x, z, y: Y1, w: 0.12, d: 0.12, h: C1 - Y1, mat: 0x3a3f45, solid: false }); }
      K.wall(a[0], a[1], b[0], b[1], 3.1, 3.25, { mat: 0x3a3f45, thick: 0.1, solid: false });
    }
    // 2F band (aluminium panel + ribbon windows), roof slab edge, parapet
    for (let i = 0; i < TERM.length; i++) edge(i, C1, YR, BAND, M.wallIn, [], { floorH: YR - C1 + 0.0, vBase: C1 });
    for (let i = 0; i < TERM.length; i++) edge(i, YR, YR + 1.1, 0xcfcac1, 0xbab5ad, [], { thick: 0.25 });
    // big signs
    const nf = Math.atan2(ns[12][0], ns[12][1]);
    const nc = P1(-22.35, 20);
    sign('센트럴시티', { x: nc[0], z: nc[1], y: 7.0, w: 15, h: 2.4, rotY: nf, bg: '#d7d2c8', fg: '#1b2a4a', offset: 0.1 });
    sign('CENTRAL CITY TERMINAL · 호남선', { x: nc[0], z: nc[1], y: 5.4, w: 13, h: 0.75, rotY: nf, bg: '#d7d2c8', fg: '#33475b', offset: 0.1 });
    // north entrance canopy
    lbox(-24, 19.5, 5, 22, 3.6, 0.35, 0x40464c, { solid: false, bottom: { tex: 'ceiling', color: 0xe4e1da } });
    for (let t = 10.5; t < 29; t += 2.4) for (const s of [-25.2, -22.8]) lbox(s, t, 0.9, 0.9, 3.585, 0.02, 'emit', { color: 0xfff6e0, solid: false });
    lbox(-26.45, 19.5, 0.1, 22, 3.35, 0.25, 0x40464c, { solid: false }); // drip edge
    // transom above the north doors: aluminium panel band (lighter than the dark interior seen through glass)
    for (const t of [12, 27]) lsign(['센트럴시티터미널', '호남선 · 매표소 · 승차홈'], -21.62, t, 3.0, 4.6, 0.5, 'N', { bg: '#1d3557', fg: '#ffffff', offset: 0.05 });
    lsign('센트럴시티터미널  호남선', -26.5, 19.5, 3.78, 12, 0.32, 'N', { bg: '#40464c', fg: '#ffffff', offset: 0.03 });
    for (const t of [9, 30]) lcyl(-26, t, 0, 0.14, 3.6, 0x40464c);
    for (const s of [20, 70, 120]) lsign(['센트럴시티터미널', 'HONAM LINE  호남선'], s, -0.2, 7.1, 14, 2.3, 'W', { bg: '#d7d2c8', fg: '#1b2a4a', offset: 0.05 });
    // south (사평대로) facade signs
    const sf = Math.atan2(ns[9][0], ns[9][1]);
    const sAt = (t) => { const s = 204.1 - (t + 98.9) * (1.3 / 135.8); return P1(s + 0.25, t); };
    let p = sAt(-55); sign(['파미에스테이션', 'FAMILLE STATION'], { x: p[0], z: p[1], y: 7.0, w: 14, h: 2.6, rotY: sf, bg: '#141414', fg: '#f0e6c8' });
    p = sAt(10); sign('MEGABOX', { x: p[0], z: p[1], y: 7.0, w: 11, h: 2.2, rotY: sf, bg: '#352263', fg: '#ffffff' });
    p = sAt(-12); sign('CENTRAL CITY', { x: p[0], z: p[1], y: 7.0, w: 12, h: 1.6, rotY: sf, bg: '#d7d2c8', fg: '#1b2a4a' });
    p = sAt(-85); sign('센트럴시티', { x: p[0], z: p[1], y: 7.0, w: 10, h: 2, rotY: sf, bg: '#d7d2c8', fg: '#1b2a4a' });
    // 하차장 side (e7) sign + canopy along the arrival curb
    const hf = Math.atan2(ns[7][0], ns[7][1]);
    p = P1(167.6, -60); sign(['하차장  ARRIVALS', '센트럴시티터미널'], { x: p[0], z: p[1], y: 7.0, w: 13, h: 2.2, rotY: hf, bg: '#1d3557', fg: '#ffffff' });
    lbox(164.8, -60, 6.6, 70, 4.4, 0.3, 0x40464c, { solid: false });
    for (let t = -94; t <= -26; t += 8.5) lcyl(161.8, t, 0, 0.16, 4.4, 0x40464c);
    lbox(165.4, -60, 4.8, 74, 0, 0.15, M.platform);
    for (const [t, op] of [[-64, OPS[0]], [-48, OPS[1]], [-32, OPS[3]]]) { const [x, z] = P(158.8, t); K.vehicle({ x, z, rotY: F.E, kind: 'bus', color: op.c, label: '서울 센트럴시티' }); }
    K.crowd(RECT(163.5, -92, 167.4, -28), 0.15, 14, { seed: 91 });
    // 택시 승강장 at the west end of the arrival curb
    for (let k = 0; k < 5; k++) { const [x, z] = P(158.6, -96 + k * 5.4); K.vehicle({ x, z, rotY: F.E, kind: 'taxi' }); }
    lsign(['택시 승강장  TAXI', '하차장 서측'], 163.4, -97, 2.4, 2.4, 0.8, 'N', { bg: '#f2a33a', fg: '#1b1b1b', twoSided: true });
    lcyl(163.4, -97, 0, 0.07, 2.0, 0x555b62);
    // sapyeong side canopies over the doors
    for (const t of [-81, 2]) { const q = sAt(t); K.box({ x: q[0] + Math.sin(sf) * 1.6, z: q[1] + Math.cos(sf) * 1.6, y: 3.4, w: t === 2 ? 14 : 6, d: 3.4, h: 0.25, rotY: sf, mat: 0x40464c, solid: false }); }
  }
  // ================================================================= slabs (after all holes are registered)
  K.slab(B1POLY, YB1, { mat: { tex: 'tile', color: 0xc4b39c }, under: false, ceil: false, holes: H.b1, edge: false });
  K.slab(F1POLY, Y1, { mat: M.hallFloor, under: M.ceil, holes: H.f1, thick: 0.3 });
  K.slab(TERM, Y2, { mat: M.f2Floor, under: M.ceil, holes: H.f2, thick: 0.3 });
  K.slab(TERM, YR, { mat: M.roof, under: M.ceil, holes: H.rf, thick: 0.4 });

  // ================================================================= roof: car deck + one-way loop road (OSM layer-1 ways)
  {
    const yr = YR + 0.02;
    const ribbon = (pts, w, col = 0x5d5f63) => {
      for (let i = 0; i < pts.length - 1; i++) {
        const a = pts[i], b = pts[i + 1], L = Math.hypot(b[0] - a[0], b[1] - a[1]), nx = -(b[1] - a[1]) / L * w / 2, nz = (b[0] - a[0]) / L * w / 2;
        const ext = 1.2, ux = (b[0] - a[0]) / L * ext, uz = (b[1] - a[1]) / L * ext;
        K.quad({ tex: 'asphalt', color: col }, [[a[0] - ux + nx, yr, a[1] - uz + nz], [b[0] + ux + nx, yr, b[1] + uz + nz], [b[0] + ux - nx, yr, b[1] + uz - nz], [a[0] - ux - nx, yr, a[1] - uz - nz]], [0, 1, 0]);
        for (let k = 2; k < L - 2; k += 6) { const x = a[0] + (b[0] - a[0]) * k / L, z = a[1] + (b[1] - a[1]) * k / L; K.box({ x, z, y: yr + 0.004, w: 0.14, d: 2.6, h: 0.004, rotY: Math.atan2(b[0] - a[0], b[1] - a[1]), mat: 0xf4f4f4, solid: false }); }
      }
    };
    ribbon([[-131, 0], [-117, -5], [-55, 149], [-42, 157], [-33, 180]], 6.2);
    ribbon([[-108, 210], [-114, 193], [-81, 180], [-80, 166], [-71, 154], [-129, 5], [-131, 0]], 6.2);
    ribbon([[-31, 179.6], [-108, 210], [-121, 216]], 6.2);
    // direction arrows
    for (const [s, t, face] of [[20, 23.4, 'S'], [80, 23.9, 'S'], [130, 24.4, 'S'], [20, 8, 'N'], [80, 7.9, 'N'], [130, 7.9, 'N']]) lfloorText(face === 'S' ? '출구 ↓' : '↑ 진행', s, t, yr + 0.01, 3.0, 1.2, 'E', { fg: '#ffffff', bg: '#5d5f63' });
    // parking stalls: west strip t 0.8..5.4, centre double row t 11.2..20.8, east row t 28..33, south block rows
    const stall = (s, t0, t1, along) => { // line marking + maybe a car
      const a = P(s, t0), b = P(s, t1); K.quad(0xf4f4f4, [[a[0] - AX * 0.06, yr, a[1] - AZ * 0.06], [a[0] + AX * 0.06, yr, a[1] + AZ * 0.06], [b[0] + AX * 0.06, yr, b[1] + AZ * 0.06], [b[0] - AX * 0.06, yr, b[1] - AZ * 0.06]], [0, 1, 0]);
      void along;
    };
    const rows = [[0.8, 5.4, F.W], [11.2, 15.9, F.E], [16.1, 20.8, F.W], [27.4, 32.0, F.E]];
    for (const [t0, t1, rot] of rows) for (let s = -8; s < 148; s += 2.6) {
      if (s > 139 && t1 > 27) continue; if (s > 59.5 && s < 64.8 && t0 > 10 && t0 < 21) continue;
      stall(s, t0, t1);
      if (rnd() < 0.42 && s + 1.3 < 148) { const [x, z] = P(s + 1.3, (t0 + t1) / 2); K.vehicle({ x, z, y: YR, rotY: rot, kind: rnd() < 0.15 ? 'van' : 'car' }); }
    }
    // south block roof: rows between lanes (s 182..192) and north of north lane (s 169..174) + west lot
    for (let t = -44; t < 30; t += 2.6) for (const [s0, s1, rot] of [[182.2, 186.8, F.S], [187.2, 191.8, F.N]]) {
      const a = P(s0, t), b = P(s1, t); K.quad(0xf4f4f4, [[a[0] - EX * 0.06, yr, a[1] - EZ * 0.06], [a[0] + EX * 0.06, yr, a[1] + EZ * 0.06], [b[0] + EX * 0.06, yr, b[1] + EZ * 0.06], [b[0] - EX * 0.06, yr, b[1] - EZ * 0.06]], [0, 1, 0]);
      if (rnd() < 0.4) { const [x, z] = P((s0 + s1) / 2, t + 1.3); K.vehicle({ x, z, y: YR, rotY: rot, kind: 'car' }); }
    }
    for (let t = -88; t < -50; t += 2.6) for (const [s0, s1, rot] of [[170, 175, F.S], [184, 189, F.N], [189.4, 194.4, F.S]]) {
      const a = P(s0, t), b = P(s1, t); K.quad(0xf4f4f4, [[a[0] - EX * 0.06, yr, a[1] - EZ * 0.06], [a[0] + EX * 0.06, yr, a[1] + EZ * 0.06], [b[0] + EX * 0.06, yr, b[1] + EZ * 0.06], [b[0] - EX * 0.06, yr, b[1] - EZ * 0.06]], [0, 1, 0]);
      if (rnd() < 0.45) { const [x, z] = P((s0 + s1) / 2, t + 1.3); K.vehicle({ x, z, y: YR, rotY: rot, kind: 'car' }); }
    }
    // light poles + signs
    for (let s = 0; s < 150; s += 24) for (const t of [10.5, 21.5]) { lcyl(s, t, YR, 0.1, 7, 0x6d7378, { solid: true }); lbox(s, t, 0.4, 2.2, YR + 6.9, 0.18, 0x5a6066, { solid: false }); lbox(s, t, 0.3, 1.6, YR + 6.86, 0.04, 'emit', { color: 0xfff0d0, solid: false }); }
    for (const [s, t] of [[30, 16], [100, 16]]) lsign(['센트럴시티 옥상 주차장', 'P  신세계백화점 · 파미에스테이션 · JW'], s, t, YR + 2.4, 5.6, 1.2, 'N', { bg: '#1d3557', fg: '#fff', twoSided: true, box: 0.2 });
    // rooftop equipment on the south block
    for (const t of [-70, -60]) lbox(200, t, 3, 6, YR, 2.4, 0xb8bcc0, { top: 0x8f969c });
    lbox(62, 18.2, 2.6, 2.6, YR + 3.2, 0.3, 0xbab6ae, { solid: false });
    lsign('엘리베이터  1F · 2F · B1', 60.6, 18.2, YR + 2.7, 2.4, 0.35, 'N', { bg: '#1d3557', fg: '#fff' });
    // east ramp down to ground (OSM 593858534: (-33,180)->(-29,179)->(-14,173)->(-8,189))
    const rp = [[-30.6, 179.4, YR], [-14, 173, 4.6], [-8, 189, 0]];
    for (let i = 0; i < rp.length - 1; i++) {
      const [ax, az, ya] = rp[i], [bx, bz, yb] = rp[i + 1];
      K.ramp(ax, az, bx, bz, { w: 6.2, ya, yb, mat: { tex: 'asphalt', color: 0x6d6e72 }, railMat: 0xb0aca4 });
      const L = Math.hypot(bx - ax, bz - az), nx = -(bz - az) / L * 3.1, nz = (bx - ax) / L * 3.1;
      for (const sg of [1, -1]) K.quad({ tex: 'concrete', color: 0xc8c4bc }, [[ax + nx * sg, 0, az + nz * sg], [bx + nx * sg, 0, bz + nz * sg], [bx + nx * sg, yb + 1.0, bz + nz * sg], [ax + nx * sg, ya + 1.0, az + nz * sg]], [nx * sg, 0, nz * sg]);
    }
    { const [x, z] = [-14, 173]; K.box({ x, z, y: 0, w: 6.4, d: 1.2, h: 4.6, rotY: Math.atan2(16, 6), mat: { tex: 'concrete', color: 0xc8c4bc } }); }
    sign(['출구 EXIT', '사평대로 · 반포대로'], { x: -12.5, z: 180, y: 5.6, w: 3.6, h: 0.9, rotY: Math.atan2(-6.4 / 17.2, 16 / 17.2) + PI, bg: '#1b5e20', fg: '#fff', twoSided: true });
    K.zone({ name: '센트럴시티 옥상 주차장', floor: 'R', sub: '옥상 주차장 · 일방통행 순환로 · 30분 1,500원 / 일 최대 30,000원', poly: TERM, y0: YR - 0.3, y1: YR + 6, priority: 1 });
  }
  // ---- bridge: roof north tip → 타워주차장 roof (OSM 1128012726), y=9
  const bridge = (pts, w = 6.4, y = YR + 0.01) => {
    for (let i = 0; i < pts.length - 1; i++) {
      const [ax, az] = pts[i], [bx, bz] = pts[i + 1];
      K.ramp(ax, az, bx, bz, { w, ya: y, yb: y, mat: { tex: 'asphalt', color: 0x6d6e72 }, railMat: 0xb0aca4 });
      const L = Math.hypot(bx - ax, bz - az), nx = -(bz - az) / L * w / 2, nz = (bx - ax) / L * w / 2;
      for (const sg of [1, -1]) K.quad({ tex: 'concrete', color: 0xc8c4bc }, [[ax + nx * sg, y - 1.3, az + nz * sg], [bx + nx * sg, y - 1.3, bz + nz * sg], [bx + nx * sg, y + 1.0, bz + nz * sg], [ax + nx * sg, y + 1.0, az + nz * sg]], [nx * sg, 0, nz * sg]);
      K.quad(0x9a968f, [[ax - nx, y - 1.3, az - nz], [bx - nx, y - 1.3, bz - nz], [bx + nx, y - 1.3, bz + nz], [ax + nx, y - 1.3, az + nz]], [0, -1, 0]);
      for (let k = 6; k < L - 3; k += 12) K.cyl({ x: ax + (bx - ax) * k / L, z: az + (bz - az) * k / L, y: 0, r: 0.7, h: y - 1.3, mat: { tex: 'concrete', color: 0xc8c4bc }, seg: 10 });
    }
  };
  bridge([[-136.4, 6.9], [-159, 15], [-172.6, 19.6]]);
  bridge([[-177.3, 54.9], [-170.4, 75.3]]);
  sign(['타워주차장 · 버스주차장 데크', '← P'], { x: -150, z: 12.5, y: YR + 3.2, w: 4.6, h: 0.9, rotY: Math.atan2(22.6, 8.1) + PI / 2, bg: '#1d3557', fg: '#fff', twoSided: true });

  // ================================================================= 파미에스테이션 원형관 (round pavilion, B1 + 1F + 2F)
  if (ROUND) {
    const cx = -47, cz = 214.6, y2 = 4.2, yr2 = 8.4;
    const holes = { b1: [], f1: [], f2: [], rf: [] };
    // escalator pair B1 ↔ 1F along +x
    const ex0 = -56.5, ex1 = -46.0;
    K.escalator(ex0, 219, ex1, 219, { ya: YB1, yb: Y1, dir: 'up' }); K.escalator(ex0, 220.5, ex1, 220.5, { ya: YB1, yb: Y1, dir: 'down' });
    const eh = [[ex0 - 0.6, 218.2], [ex1, 218.2], [ex1, 221.3], [ex0 - 0.6, 221.3]]; holes.f1.push(eh); K.groundHole(eh);
    K.wall(ex0 - 0.6, 218.2, ex1, 218.2, 0, 1.05, { mat: 'glass', thick: 0.04 }); K.wall(ex0 - 0.6, 221.3, ex1, 221.3, 0, 1.05, { mat: 'glass', thick: 0.04 }); K.wall(ex0 - 0.6, 218.2, ex0 - 0.6, 221.3, 0, 1.05, { mat: 'glass', thick: 0.04 });
    // stairs 1F → 2F along -x at z 208
    K.stairs(-40, 207.5, -47, 207.5, { w: 2, ya: 0, yb: y2 });
    const sh = [[-47, 206.4], [-39.8, 206.4], [-39.8, 208.6], [-47, 208.6]]; holes.f2.push(sh);
    K.wall(-47, 206.4, -39.8, 206.4, y2, y2 + 1.05, { mat: 'glass', thick: 0.04 }); K.wall(-47, 208.6, -39.8, 208.6, y2, y2 + 1.05, { mat: 'glass', thick: 0.04 }); K.wall(-39.8, 206.4, -39.8, 208.6, y2, y2 + 1.05, { mat: 'glass', thick: 0.04 });
    // elevator
    K.elevator({ name: '파미에스테이션 원형관 엘리베이터', x: -36.5, z: 216, rotY: -PI / 2, w: 2, d: 2, floors: [{ label: 'B1', y: YB1, name: '파미에스테이션 · 7호선 연결' }, { label: '1F', y: 0, name: '스타벅스' }, { label: '2F', y: y2, name: '스타벅스 2층' }], topH: 3.6 });
    const elh = [[-37.6, 214.9], [-35.4, 214.9], [-35.4, 217.1], [-37.6, 217.1]]; holes.b1.push(elh); holes.f1.push(elh); holes.f2.push(elh);
    K.slab(ROUND, YB1, { mat: { tex: 'tile', color: 0xc4b39c }, under: false, ceil: false, holes: holes.b1, edge: false });
    K.slab(ROUND, Y1, { mat: { tex: 'wood', color: 0xb89470 }, under: M.ceil, holes: holes.f1 });
    K.slab(ROUND, y2, { mat: { tex: 'wood', color: 0xb89470 }, under: M.ceil, holes: holes.f2 });
    K.slab(ROUND, yr2, { mat: M.roof, under: M.ceil });
    // walls: B1 concrete with the J7 opening on the north (edges 7,8,9), 1F/2F glass + mullions, parapet
    const ns = K.orient(ROUND);
    for (let i = 0; i < ROUND.length; i++) {
      const a = ROUND[i], b = ROUND[(i + 1) % ROUND.length], L = Math.hypot(b[0] - a[0], b[1] - a[1]);
      const ix = -ns[i][0] * 0.15, iz = -ns[i][1] * 0.15;
      const mx = (a[0] + b[0]) / 2, mz = (a[1] + b[1]) / 2;
      const north = mz < 202.5; // J7: open the B1 wall facing the 7호선 concourse (≥ 8 m)
      if (!north) K.wall(a[0] + ix, a[1] + iz, b[0] + ix, b[1] + iz, YB1, CB, { mat: M.wallB1, thick: 0.3 });
      else K.wall(a[0] + ix, a[1] + iz, b[0] + ix, b[1] + iz, YB1 + 3.4, CB, { mat: M.wallB1, thick: 0.3 });
      const door = (Math.abs(mx + 47) < 4 && (mz < 202 || mz > 227));
      K.wall(a[0], a[1], b[0], b[1], 0, yr2 - 0.3, { mat: 'glass', thick: 0.04, openings: door ? [{ at: L / 2, w: Math.min(3.2, L - 0.6), y0: 0, y1: 2.8 }] : [] });
      K.box({ x: a[0], z: a[1], y: 0, w: 0.16, d: 0.16, h: yr2 - 0.3, mat: 0x2e3337, solid: false });
      K.wall(a[0], a[1], b[0], b[1], y2 - 0.3, y2 + 0.15, { mat: 0x2e3337, thick: 0.12, solid: false });
      K.wall(a[0], a[1], b[0], b[1], yr2 - 0.3, yr2 + 0.9, { mat: 0xd7d2c8, thick: 0.25 });
      void L;
    }
    // signage
    sign(['파미에스테이션', 'FAMILLE STATION'], { x: cx, z: 197.6, y: yr2 + 0.35, w: 9, h: 1.3, rotY: PI, bg: '#141414', fg: '#f0e6c8', twoSided: true });
    sign('STARBUCKS', { x: cx, z: 231.4, y: yr2 + 0.35, w: 7, h: 1.2, rotY: 0, bg: '#00704a', fg: '#ffffff' });
    sign(['지하철 7호선 고속터미널역 ↓', '센트럴시티 · 신세계 연결'], { x: -51, z: 219.75, y: 3.3, w: 4.4, h: 0.8, rotY: PI / 2, bg: '#747F00', fg: '#fff', twoSided: true });
    // 1F starbucks counter + tables, 2F seating, B1 lounge
    K.box({ x: -40, z: 225, y: 0, w: 7, d: 1, h: 1.05, rotY: -0.6, mat: 0x2a2522, top: 0x3b302a });
    sign(['STARBUCKS', '스타벅스 센트럴시티'], { x: -40.4, z: 225.6, y: 2.4, w: 4.4, h: 0.9, rotY: PI - 0.6, bg: '#00704a', fg: '#fff' });
    const R3 = K.rand(321);
    for (const [y, n] of [[0, 9], [y2, 14], [YB1, 8]]) for (let k = 0; k < n; k++) {
      const a = R3() * PI * 2, r = 5 + R3() * 9; const x = cx + Math.cos(a) * r, z = cz + Math.sin(a) * r;
      if (Math.abs(z - 219.7) < 2.5 && x > -58 && x < -45) continue; if (Math.abs(z - 207.5) < 2 && x > -48 && x < -39) continue; if (Math.hypot(x + 36.5, z - 216) < 2.5) continue;
      K.cyl({ x, z, y, r: 0.4, h: 0.74, mat: 0xe8e2d8, seg: 10 }); for (const d of [-0.7, 0.7]) K.box({ x: x + d, z, y, w: 0.42, d: 0.42, h: 0.45, mat: 0x2e5a3d, solid: false });
      if (R3() < 0.5) K.person(x + 0.7, y, z, { sit: true });
    }
    for (let k = 0; k < 10; k++) { const a = k / 10 * PI * 2; K.box({ x: cx + Math.cos(a) * 6, z: cz + Math.sin(a) * 6, y: CB - 0.06, w: 1.2, d: 1.2, h: 0.05, mat: 'emit', color: 0xffe6c0, solid: false }); K.box({ x: cx + Math.cos(a) * 6, z: cz + Math.sin(a) * 6, y: y2 - 0.36, w: 1.0, d: 1.0, h: 0.05, mat: 'emit', color: 0xffe6c0, solid: false }); }
    sign(['FAMILLE STATION', '파미에스테이션 · 7호선 연결'], { x: -45, z: 200.2, y: YB1 + 3.0, w: 6, h: 0.9, rotY: 0, bg: '#141414', fg: '#f0e6c8' });
    K.zone({ name: '파미에스테이션 원형관', floor: 'B1', sub: '7호선 고속터미널역 연결 · 라운지', poly: ROUND, y0: YB1 - 0.5, y1: CB, priority: 3 });
    K.zone({ name: '파미에스테이션 원형관', floor: '1F', sub: '스타벅스', poly: ROUND, y0: -0.5, y1: y2 - 0.3, priority: 3 });
    K.zone({ name: '파미에스테이션 원형관', floor: '2F', sub: '스타벅스 2층 좌석', poly: ROUND, y0: y2 - 0.3, y1: yr2, priority: 3 });
  }

  // ================================================================= 호남선 버스 주차장 (yard) + 데크 주차장 (1173096805)
  {
    K.hpoly(M.asphalt, YARD, 0.012, true);
    // waiting buses in rows across the open yard (s 40..150, t -97..-19), outside the deck
    let k = 0;
    for (let s = 44; s < 148; s += 3.6) for (const t of [-72.5, -86]) {
      if (!K.pointInPoly(...P(s, t - 6), YARD) || !K.pointInPoly(...P(s, t + 6), YARD)) continue;
      const a = P(s - 1.8, t - 6.5), b = P(s - 1.8, t + 6.5); K.quad(0xf4f4f4, [[a[0] - AX * 0.06, 0.02, a[1] - AZ * 0.06], [a[0] + AX * 0.06, 0.02, a[1] + AZ * 0.06], [b[0] + AX * 0.06, 0.02, b[1] + AZ * 0.06], [b[0] - AX * 0.06, 0.02, b[1] - AZ * 0.06]], [0, 1, 0]);
      if (rnd() < 0.6) { const op = OPS[(k++) % OPS.length]; const [x, z] = P(s, t); K.vehicle({ x, z, rotY: t < -80 ? F.E : F.W, kind: 'bus', color: op.c, label: DEST[1 + (k * 7) % 37] }); }
    }
    K.zone({ name: '호남선 버스 주차장', floor: '1F', sub: '고속버스 대기 주차 · 회차로', poly: YARD, y0: -0.5, y1: 4.2, priority: 0 });
  }
  if (DECK) {
    const yM = 4.5, yT = YR;
    const DH = { m: [], t: [] };
    // stairs + elevator at the north-east corner, ramp mid→top along the west side
    const dsA = 52, dt = -31; // local s,t (inside deck: s 48.5..120, t -64..-27.5)
    flight(dsA, dsA + 7.5, dt, 0, yM, null); flight(dsA + 7.5, dsA, dt - 2.6, yM, yT, null);
    DH.m.push(RECT(dsA - 0.2, dt - 1.2, dsA + 7.5, dt + 1.2)); DH.t.push(RECT(dsA - 0.2, dt - 3.8, dsA + 7.5, dt - 1.4));
    const rampA = P(70, -60.5), rampB = P(102, -60.5);
    K.ramp(rampA[0], rampA[1], rampB[0], rampB[1], { w: 5, ya: yM, yb: yT, mat: { tex: 'concrete', color: 0xa9a59d }, railMat: 0xb0aca4 });
    DH.t.push(RECT(69.5, -63.2, 102, -57.8));
    const [ex, ez] = P(56, -36); K.elevator({ name: '버스주차장 데크 엘리베이터', x: ex, z: ez, rotY: F.S, w: 2, d: 2, floors: [{ label: '1F', y: 0, name: '버스 대기 주차장' }, { label: '2F', y: yM, name: '데크 주차장' }, { label: 'R', y: yT, name: '옥상 데크 · 타워주차장 연결' }] });
    const eh = RECT(54.9, -37.1, 57.1, -34.9); DH.m.push(eh); DH.t.push(eh);
    K.slab(DECK, yM, { mat: { tex: 'concrete', color: 0xa9a59d }, under: { tex: 'concrete', color: 0x9a968f }, holes: DH.m, thick: 0.4 });
    K.slab(DECK, yT, { mat: { tex: 'concrete', color: 0xa9a59d }, under: { tex: 'concrete', color: 0x9a968f }, holes: DH.t, thick: 0.4 });
    for (let i = 0; i < DECK.length; i++) { const a = DECK[i], b = DECK[(i + 1) % DECK.length]; for (const y of [yM, yT]) K.wall(a[0], a[1], b[0], b[1], y, y + 1.05, { mat: { tex: 'ccLouver' }, thick: 0.25 }); K.wall(a[0], a[1], b[0], b[1], yM - 0.9, yM, { mat: 0xc8c4bc, thick: 0.3, solid: false }); K.wall(a[0], a[1], b[0], b[1], yT - 0.9, yT, { mat: 0xc8c4bc, thick: 0.3, solid: false }); }
    for (let s = 50.5; s < 120; s += 8.5) for (const t of [-29.5, -40, -51, -62]) { lcyl(s, t, 0, 0.4, yM - 0.4, 0xc8c4bc); lcyl(s, t, yM, 0.4, yT - yM - 0.4, 0xc8c4bc); }
    // buses under the deck, cars on mid deck & roof, loop road paint on the roof (OSM 1065783056)
    for (let s = 62; s < 118; s += 3.7) if (rnd() < 0.7) { const [x, z] = P(s, -46); const op = OPS[Math.floor(rnd() * OPS.length)]; K.vehicle({ x, z, rotY: F.E, kind: 'bus', color: op.c, label: '회송' }); }
    for (const y of [yM, yT]) for (let s = 50; s < 118; s += 2.6) for (const [t, rot] of [[-30.5, F.W], [-35.5, F.E], [-55.5, F.W]]) {
      if (s > 50 && s < 60 && t > -40) continue; if (y === yT && t < -50 && s > 68 && s < 103) continue; if (y === yM && t < -50 && s > 68 && s < 103) continue;
      if (rnd() < 0.45) { const [x, z] = P(s, t); K.vehicle({ x, z, y, rotY: rot, kind: 'car' }); }
    }
    const loop = [[-167, 86], [-149, 136], [-132, 129], [-151, 80], [-167, 86]];
    for (let i = 0; i < loop.length - 1; i++) { const a = loop[i], b = loop[i + 1]; K.box({ x: (a[0] + b[0]) / 2, z: (a[1] + b[1]) / 2, y: yT + 0.01, w: 5.5, d: Math.hypot(b[0] - a[0], b[1] - a[1]) + 5, h: 0.01, rotY: Math.atan2(b[0] - a[0], b[1] - a[1]), mat: { tex: 'asphalt', color: 0x5d5f63 }, solid: false }); }
    for (const [s, t] of [[90, -27.4], [90, -64.2]]) lsign(['센트럴시티 버스주차장', 'P  데크 주차장'], s, t, yM - 0.45, 8, 0.8, t > -40 ? 'E' : 'W', { bg: '#1d3557', fg: '#fff' });
    K.zone({ name: '버스주차장 데크', floor: '2F', sub: '승용차 주차 · 데크 2층', poly: DECK, y0: yM - 0.3, y1: yT - 0.4, priority: 2 });
    K.zone({ name: '버스주차장 데크', floor: 'R', sub: '옥상 데크 주차 · 타워주차장 연결교', poly: DECK, y0: yT - 0.3, y1: yT + 5, priority: 2 });
    K.zone({ name: '버스주차장 데크 하부', floor: '1F', sub: '고속버스 회송 · 대기', poly: DECK, y0: -0.5, y1: yM - 0.4, priority: 1 });
  }
  // ================================================================= 타워주차장 (601356623): 1F · 2F · 옥상, helix ramp at the east end
  if (TOWER) {
    const y2 = 4.5, y3 = YR;
    const hx = -163.2, hz = 36.6, rIn = 3.0, rOut = 7.0, rMid = 5.0;
    const circ = (r, n = 20) => Array.from({ length: n }, (_, i) => [hx + Math.cos(i / n * PI * 2) * r, hz + Math.sin(i / n * PI * 2) * r]);
    const hHole = circ(rOut + 0.05);
    const TH = { m: [hHole], t: [hHole] };
    // helix: θ = π at each deck level (exit toward the deck, west); 2 turns over 9 m
    const N = 48;
    for (let i = 0; i < N; i++) {
      const a0 = PI + i / N * 4 * PI, a1 = PI + (i + 1) / N * 4 * PI;
      const ya = i / N * y3, yb = (i + 1) / N * y3;
      K.ramp(hx + Math.cos(a0) * rMid, hz + Math.sin(a0) * rMid, hx + Math.cos(a1) * rMid, hz + Math.sin(a1) * rMid, { w: 3.9, ya, yb, rails: false, mat: { tex: 'concrete', color: 0x9e9a92 } });
      const pa = [hx + Math.cos(a0) * rOut, hz + Math.sin(a0) * rOut], pb = [hx + Math.cos(a1) * rOut, hz + Math.sin(a1) * rOut];
      if (i < 24) { // outer wall once, full height, with openings at the 3 levels where the ramp meets the decks
        const am = (a0 + a1) / 2, nearExit = Math.cos(am) < -0.96;
        const ops = nearExit ? [0, y2, y3].map(y => ({ at: 1.1, w: 2.2, y0: y, y1: y + 2.4 })) : [];
        K.wall(pb[0], pb[1], pa[0], pa[1], 0, y3 + 1.1, { mat: { tex: 'ccLouver' }, mat2: 0xc8c4bc, thick: 0.25, openings: ops });
      }
    }
    K.cyl({ x: hx, z: hz, y: 0, r: rIn, h: y3 + 1.2, mat: 0xc8c4bc, seg: 16 });
    // stairs + elevator at the west end
    K.stairs(-229, 55, -221.5, 55, { w: 2, ya: 0, yb: y2 }); K.stairs(-221.5, 57.6, -229, 57.6, { w: 2, ya: y2, yb: y3 });
    TH.m.push([[-229.2, 53.9], [-221.5, 53.9], [-221.5, 56.1], [-229.2, 56.1]]); TH.t.push([[-229.2, 56.5], [-221.5, 56.5], [-221.5, 58.7], [-229.2, 58.7]]);
    K.elevator({ name: '타워주차장 엘리베이터', x: -216, z: 54, rotY: PI / 2, w: 2, d: 2, floors: [{ label: '1F', y: 0, name: '주차장 입구' }, { label: '2F', y: y2, name: '주차 2층' }, { label: 'R', y: y3, name: '옥상 · 센트럴시티 옥상 연결교' }] });
    const teh = [[-217.1, 52.9], [-214.9, 52.9], [-214.9, 55.1], [-217.1, 55.1]]; TH.m.push(teh); TH.t.push(teh);
    K.slab(TOWER, y2, { mat: { tex: 'concrete', color: 0xa9a59d }, under: { tex: 'concrete', color: 0x9a968f }, holes: TH.m, thick: 0.4 });
    K.slab(TOWER, y3, { mat: { tex: 'concrete', color: 0xa9a59d }, under: { tex: 'concrete', color: 0x9a968f }, holes: TH.t, thick: 0.4 });
    K.hpoly({ tex: 'concrete', color: 0xb4b0a8 }, TOWER, 0.015, true);
    // facade: louvre spandrels + parapets (ground level open toward the yard road)
    for (let i = 0; i < TOWER.length; i++) {
      const a = TOWER[i], b = TOWER[(i + 1) % TOWER.length];
      if (Math.hypot(a[0] - hx, a[1] - hz) < rOut + 1.5 && Math.hypot(b[0] - hx, b[1] - hz) < rOut + 1.5) continue;
      for (const y of [y2, y3]) { K.wall(a[0], a[1], b[0], b[1], y, y + 1.1, { mat: { tex: 'ccLouver' }, mat2: 0xc8c4bc, thick: 0.25 }); K.wall(a[0], a[1], b[0], b[1], y - 1.0, y, { mat: 0xc8c4bc, thick: 0.3, solid: false }); }
      K.wall(a[0], a[1], b[0], b[1], y2 + 2.6, y3 - 1.0, { mat: { tex: 'ccLouver' }, thick: 0.08, solid: false });
    }
    // columns + cars
    const bb = K.polyBBox(TOWER);
    for (let x = bb[0] + 4; x < bb[2] - 2; x += 8.4) for (let z = bb[1] + 3; z < bb[3] - 2; z += 8.4) {
      if (!K.pointInPoly(x, z, TOWER) || Math.hypot(x - hx, z - hz) < rOut + 1) continue;
      K.cyl({ x, z, y: 0, r: 0.38, h: y2 - 0.4, mat: 0xc8c4bc, seg: 8 }); K.cyl({ x, z, y: y2, r: 0.38, h: y3 - y2 - 0.4, mat: 0xc8c4bc, seg: 8 });
    }
    for (const y of [0, y2, y3]) for (let x = bb[0] + 3; x < bb[2]; x += 2.6) for (const dz of [0.32, 0.62]) {
      const z = bb[1] + (bb[3] - bb[1]) * dz;
      if (!K.pointInPoly(x, z - 3, TOWER) || !K.pointInPoly(x, z + 3, TOWER) || Math.hypot(x - hx, z - hz) < rOut + 3 || (x > -231 && x < -213 && z > 51 && z < 60)) continue;
      if (rnd() < 0.5) K.vehicle({ x, z, y, rotY: dz < 0.5 ? 0 : PI, kind: rnd() < 0.12 ? 'van' : 'car' });
    }
    // OSM 1185035520 (layer 2 roof road) paint
    const rr = [[-166, 29], [-180, 34], [-184, 36], [-177, 56]];
    for (let i = 0; i < rr.length - 1; i++) { const a = rr[i], b = rr[i + 1]; K.box({ x: (a[0] + b[0]) / 2, z: (a[1] + b[1]) / 2, y: y3 + 0.01, w: 5.5, d: Math.hypot(b[0] - a[0], b[1] - a[1]) + 4, h: 0.01, rotY: Math.atan2(b[0] - a[0], b[1] - a[1]), mat: { tex: 'asphalt', color: 0x5d5f63 }, solid: false }); }
    // signs
    sign(['타워주차장', 'P  센트럴시티 · 신세계 · JW'], { x: -200, z: 24.6, y: 7.2, w: 9, h: 1.8, rotY: Math.atan2(-0.33, -0.94) + PI, bg: '#1d3557', fg: '#ffffff', twoSided: true });
    sign(['P 입구  ENTRANCE', '높이제한 2.3m'], { x: -192, z: 62, y: 3.2, w: 4, h: 1.0, rotY: Math.atan2(0.336, 0.942), bg: '#1d3557', fg: '#fff', twoSided: true });
    K.zone({ name: '타워주차장', floor: '1F', sub: '주차장 입구 · 나선형 램프', poly: TOWER, y0: -0.5, y1: y2 - 0.4, priority: 2 });
    K.zone({ name: '타워주차장', floor: '2F', sub: '승용차 주차', poly: TOWER, y0: y2 - 0.4, y1: y3 - 0.4, priority: 2 });
    K.zone({ name: '타워주차장', floor: 'R', sub: '옥상 주차 · 센트럴시티 옥상/데크 연결교', poly: TOWER, y0: y3 - 0.4, y1: y3 + 5, priority: 2 });
  }

  // ================================================================= zones
  lzone(-22.5, -1, 151, 39.5, { name: '센트럴시티터미널 (호남선)', floor: '1F', sub: '대합실 · 매표소(9번 게이트) · 무인발권기 · 승차홈 1–37 (게이트 1–12)', y0: -0.5, y1: C1, priority: 2 });
  lzone(-12, -18, 151, 6, { name: '호남선 승차홈', floor: '1F', sub: '광주 · 전주 · 목포 · 여수 · 순천 · 녹동 · 유성 · 충주 · 당진', y0: -0.5, y1: C1, priority: 3 });
  lzone(151, -99, 205, 39, { name: '파미에스테이션 · 하차장', floor: '1F', sub: '스타벅스 센트럴1F점 · 장터국수 · 던킨 · 포브 · 하차장 · 메가박스 입구', y0: -0.5, y1: C1, priority: 2 });
  lzone(-22.5, -1, 151, 39.5, { name: '센트럴시티 식당가', floor: '2F', sub: '순대실록 · 101번지 남산돈까스 · 르사이공 · 우마이도 · 서대문 한옥집', y0: C1, y1: C2, priority: 2 });
  lzone(151, -99, 205, 39, { name: '파미에스테이션 2F', floor: '2F', sub: '아웃백 · 명동교자 · 소이연남 · 팔도국수 면주방 · 홍대만뽀 · 채선당 샤브보트', y0: C1, y1: C2, priority: 2 });
  lzone(-22.5, -1, 151, 39.5, { name: '파미에스테이션', floor: 'B1', sub: '기차역 컨셉 다이닝 스트리트 · 스타벅스 · 신세계 식품관/면세점 · 지하철 연결', y0: YB1 - 0.5, y1: CB, priority: 2 });
  K.zone({ poly: B1POLY.filter((p, i) => i >= 6 && i <= 16).concat([P(151, 38.5)]), name: '메가박스 센트럴', floor: 'B1', sub: '전관 부띠끄 M · 8개관 · 매표 · 매점', y0: YB1 - 0.5, y1: CB, priority: 2 });
  lzone(167.5, -89, 200, -10, { name: '메가박스 센트럴 상영관', floor: 'B1', sub: '1–8관 부띠끄 M', y0: YB1 - 0.5, y1: CB, priority: 3 });
  lzone(163, -94, 168.2, -26, { name: '호남선 하차장', floor: '1F', sub: '도착 · 택시 승강장 · 지하철 방면', y0: -0.5, y1: 4.4, priority: 3 });

  // ================================================================= spawns
  // yaw: facing local +s (south-ish) = R+π, -s = R, +t (east) = R+3π/2, -t (west) = R+π/2
  const YAW = { S: R + PI, N: R, E: R + 1.5 * PI, W: R + PI / 2 };
  const sp = (name, s, t, y, face) => { const [x, z] = P(s, t); K.spawn({ name, x, y, z, yaw: YAW[face] }); };
  sp('센트럴시티 정문 (신반포로)', -30, 19.5, 0, 'S');
  sp('호남선 대합실 · 매표소', 112, 20, 0, 'W');
  sp('호남선 승차홈 (8번 · 광주)', bays.find(b => b.p === 8).s, 4.6, Y1 + 0.15, 'W');
  sp('파미에스테이션 B1', 60, 22, YB1, 'S');
  sp('메가박스 센트럴 로비 · 매점 (B1)', 176, 12, YB1, 'S');
  sp('메가박스 센트럴 5관 (상영관)', 188.4, -56.6, YB1 + 2.1, 'N');
  sp('호남선 하차장 · 택시 승강장', 165.5, -50, 0.15, 'N');
  sp('파미에스테이션 2F 식당가', 185, -30, Y2, 'E');
  K.spawn({ name: '센트럴시티 ↔ 고투몰 연결통로 (B1)', x: -140.9, y: YB1, z: -34.6, yaw: Math.atan2(18.2, 40.5) + PI });
  sp('센트럴시티 식당가 2F', 30, 19, Y2, 'S');
  sp('센트럴시티 옥상 주차장', 70, 16, YR, 'S');
  K.spawn({ name: '파미에스테이션 원형관 (스타벅스)', x: -47, y: 0, z: 195.6, yaw: PI });
}
