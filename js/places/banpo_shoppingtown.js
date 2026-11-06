// 반포쇼핑타운: eight independent OSM footprints, one continuous neighbourhood.
// Evidence correction: research's 6–7F/apartment description is explicitly a guess.
// 1981 construction report and 2011 existing-building report both describe B1+5F:
// https://www.mk.co.kr/news/economy/501214
// https://v.daum.net/v/20110829170931770
// Adopt B1+5F for all eight blocks; OSM 2동 levels=6 may count B1 (unresolved).
// Height audit: data/raw/osm-core.json has NO height tag for 2동. Its 25.2m
// in osm.json is tools/osm_process.py's commercial fallback: 6 * 4.2m.
// Do not turn that derived value into two invented floors. Retain the 18m
// main roof (+0.65m parapet / +2.6m stair penthouse) pending a measured survey.
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
    'refs/roadview/manifest.json',
    'refs/roadview/bp_01_banpo_shoppingtown_exit82_north.jpg',
    'refs/roadview/bp_02_banpo_shoppingtown_gotomall_canopy_west.jpg',
    'refs/roadview/bp_03_sinbanporo_east_banpo_6_8dong_red_brick.jpg',
    'refs/roadview/gb_05_sinbanporo_east_bus_shelters_terminal_side.jpg',
    'refs/roadview/cc_02_sinbanporo_west_from_main_gate_tan_block_led.jpg',
    'refs/aerial/bp_34.jpg', 'refs/aerial/bp_67.jpg',
    'refs/aerial/bp_east.jpg', 'refs/aerial/bp_far.jpg', 'refs/aerial/bp_west.jpg',
    'refs/interior/bp_inside/notes.json',
  ],
};

// Photo furnishings only. All room boundaries, circulation and slabs remain in
// the normal build; this helper is called inside the floor's lazy detail group.
function buildPhotoRestaurant(K, C) {
  const { n, y, ceiling, a, q, va, vb, side, name, serial, angle, P, box, sign, person, seat } = C;
  const mid = (a + q) / 2, width = q - a;
  const front = C.atCorridor ?? (side > 0 ? va : vb), depth = side > 0 ? vb - front : front - va, V = d => front + side * d;
  const outRot = angle + (side > 0 ? Math.PI : 0);
  const B = (u, yy, d, w, h, thick, mat, extra = {}) => box(u, yy, V(d), w, h, thick, mat, extra);
  const S = (txt, u, yy, d, w, h, bg, extra = {}) => sign(txt, u, yy, V(d), w, h, bg, { rotY: outRot, ...extra });
  const cyl = (u, yy, d, r, h, mat, seg = 12) => {
    const [x, z] = P(u, V(d)); K.cyl({ x, y: yy, z, r, h, mat, seg, solid: false });
  };
  const damun = /담은/.test(name), fish = /동해/.test(name), galbi = /반포갈비/.test(name);
  const beef = /우고집/.test(name), ilbon = /일번지/.test(name), arisu = /아리수/.test(name);
  const heart = /하트타임/.test(name), hof = /숙이네|하얀집|하림|5092|치킨/.test(name);
  const kimbap = /충무/.test(name), umaru = /우마루|友마루/.test(name);
  const darkBar = /주점|호프|유메|범주당|하시무/.test(name) || serial % 7 === 6;
  const wood = { tex: 'wood', color: damun ? 0x956843 : arisu ? 0x715039 : 0x9f744d };
  const round = beef || hof || heart, seatColor = hof ? 0xa62f32 : ilbon ? 0xc78d3e : 0x453e37;
  // Rear wall treatments and low timber wainscot reproduce the room's palette.
  B(mid, y + 0.05, depth - 0.06, width - 0.12, 2.3, 0.055,
    beef ? 0x77766e : damun ? 0xa9ada4 : galbi || hof ? wood : 0xe9e4d8, { solid: false });
  B(mid, y + 0.04, depth - 0.10, width - 0.15, damun ? 0.9 : 0.72, 0.04,
    beef ? { tex: 'darkstone', color: 0x8a8c87 } : wood, { solid: false });
  for (const u of [a + 0.05, q - 0.05]) B(u, y + 0.05, depth / 2, 0.05, 0.76, depth - 0.1, wood, { solid: false });
  // Kitchen occupies the back edge, leaving both the central door and aisle open.
  const counterW = Math.min(width - 1.5, 3.5), cu = mid - 0.25, cd = depth - 0.48;
  B(cu, y, cd, counterW, 0.87, 0.66, galbi ? 0x35434a : fish ? 0xc6aa80 : wood);
  B(cu, y + 0.87, cd, counterW + 0.08, 0.065, 0.73, beef || fish ? 0xb9bfbc : 0xd7cdb7);
  B(cu + counterW * 0.31, y + 0.94, cd - 0.1, 0.43, 0.28, 0.09, 0x252d32, { solid: false });
  B(cu + counterW * 0.31, y + 0.94, cd - 0.1, 0.12, 0.09, 0.26, 0x30363a, { solid: false });
  for (const yy of [1.25, 1.70]) {
    B(cu - 0.35, y + yy, depth - 0.22, Math.min(counterW - 0.3, 2.5), 0.045, 0.32, 0xc5c4b6, { solid: false });
    for (let j = 0; j < 8; j++) {
      const u = cu - 1.15 + j * 0.23;
      if (u < a + 0.25 || u > q - 0.25) continue;
      if (j % 3 === 0) {
        cyl(u, y + yy + 0.05, depth - 0.23, 0.055, 0.19, 0x427b4d, 8);
        cyl(u, y + yy + 0.24, depth - 0.23, 0.024, 0.065, 0x427b4d, 8);
      } else {
        for (let k = 0; k < 3; k++) cyl(u, y + yy + 0.06 + k * 0.025, depth - 0.23, 0.085, 0.023, 0xe8e7dd, 10);
      }
    }
  }
  cyl(cu - counterW * 0.33, y + 0.94, cd, 0.20, 0.25, 0xc9ceca);
  cyl(cu - counterW * 0.33, y + 1.19, cd, 0.21, 0.035, 0x9caaa6);
  const fu = q - 0.47;
  B(fu, y, depth - 0.45, 0.72, 1.95, 0.67, beef ? 0xd8d7d0 : 0xb9c4c4);
  B(fu, y + 0.25, depth - 0.80, 0.59, 1.38, 0.025, 0x557a7d, { solid: false });
  for (let row = 0; row < 4; row++) {
    B(fu, y + 0.31 + row * 0.31, depth - 0.83, 0.55, 0.025, 0.025, 0xd5dcd5, { solid: false });
    for (let j = 0; j < 4; j++) B(fu - 0.21 + j * 0.14, y + 0.36 + row * 0.31, depth - 0.85, 0.07, 0.19, 0.025, [0x3c6949, 0xa9a665, 0xb8d0c6][(j + row) % 3], { solid: false });
  }
  B(fu + 0.23, y + 0.76, depth - 0.87, 0.028, 0.56, 0.04, 0xd5d9d3, { solid: false });
  // Two table rows on either side of a >=1m centre aisle; depth determines
  // capacity rather than forcing the same oversized dining set into every bay.
  const cols = width >= 4.6 ? [a + 1.08, q - 1.08] : [a + 1.0];
  const rows = depth >= 6.8 ? [1.08, 2.95, 4.82] : depth >= 4.9 ? [1.14, 3.05] : [Math.min(1.55, depth * 0.43)];
  let ti = 0;
  const stool = (u, d, red, back = false) => {
    cyl(u, y + 0.04, d, 0.22, 0.41, beef ? 0x292d2c : 0x858985);
    cyl(u, y + 0.45, d, 0.235, 0.065, red ? 0xb6383a : beef ? 0x9c8465 : 0x835736);
    if (back) B(u, y + 0.53, d + 0.16, 0.40, 0.35, 0.055, 0x292d2b, { solid: false });
  };
  for (const u of cols) for (const d of rows) {
    if (d + 0.85 > depth - 1.0) continue;
    if (round) {
      cyl(u, y + 0.03, d, 0.27, 0.70, 0x353b3b);
      cyl(u, y + 0.73, d, 0.58, 0.065, beef ? 0xc5cbca : 0xb98742, 20);
      B(u, y + 0.5, d, 0.82, 0.3, 0.82, 0x353b3b, { solid: true, skip: ['n','s','e','w','top','bottom'] });
      stool(u, d - 0.74, hof, beef); stool(u, d + 0.74, hof, beef);
      stool(u + (u < mid ? -0.72 : 0.72), d, hof, beef);
    } else {
      B(u, y + 0.72, d, 1.16, 0.08, 0.75, wood);
      for (const du of [-0.45, 0.45]) for (const dv of [-0.24, 0.24]) B(u + du, y, d + dv, 0.045, 0.72, 0.045, 0x353b38, { solid: false });
      for (const dd of [-0.62, 0.62]) for (const du of [-0.28, 0.28]) {
        seat(u + du, y, V(d + dd), seatColor, side * Math.sign(dd));
        if (ilbon || fish) B(u + du, y + 0.58, d + dd + Math.sign(dd) * 0.18, 0.42, 0.25, 0.06, ilbon ? 0xc89446 : wood, { solid: false });
      }
    }
    if (beef || galbi || ilbon) {
      cyl(u, y + 0.805, d, 0.23, 0.024, 0x333939, 16);
      for (let j = -3; j <= 3; j++) B(u + j * 0.055, y + 0.83, d, 0.012, 0.008, 0.36, 0x9fa8a4, { solid: false });
    } else cyl(u, y + 0.805, d, 0.17, 0.035, 0xe9e1ca);
    for (const du of [-0.36, 0.36]) {
      cyl(u + du, y + 0.805, d + 0.20, 0.075, 0.07, damun ? 0xc7ccb8 : 0xe3e2d7);
      cyl(u + du, y + 0.805, d - 0.20, 0.043, 0.12, 0xd7dcce, 8);
      B(u + du + 0.075, y + 0.806, d + 0.03, 0.018, 0.009, 0.21, 0xbdb8a9, { solid: false });
    }
    cyl(u + 0.37, y + 0.805, d - 0.06, 0.04, 0.19, 0x3c7145, 8);
    if ((ti++ + serial) % 3 === 0) person(u, y, V(d + 0.67), { sit: true, rotY: angle + (side > 0 ? 0 : Math.PI), shirt: [0x526371, 0xb3a89a, 0x635b57][serial % 3] });
  }
  // Ordinary dining menus remain compact; the photo-specific rooms get their
  // observed sign, fittings and lighting rather than a single generic template.
  const menu = damun ? ['DAMUN', '담은  ·  팔도막걸리와 전통주'] : fish ? ['동해횟집', '회 · 매운탕'] : beef ? ['소고기구이전문점', '우고집'] : galbi ? ['반포갈비', '갈비 · 식사'] : ilbon ? ['일번지육개장', '육개장 · 낙곱전골'] : arisu ? ['아리수 포차', '안주 · 식사'] : hof ? ['치킨 · 호프 · 닭발', '골뱅이 · 안주'] : [name, '식사 · 안주'];
  if (!arisu) S(menu, mid, y + 2.0, depth - 0.13, Math.min(2.65, width - 1.2), 0.50, beef ? '#222725' : damun ? '#9a673c' : '#eee5d0', { fg: beef ? '#f5eedb' : '#342b23' });
  if (damun) {
    // Wide backlit timber plaque and small framed bottle illustrations (09).
    B(mid, y + 1.62, depth - 0.12, 2.85, 0.78, 0.06, { tex: 'emit', color: 0xf1dba8 }, { solid: false });
    B(mid, y + 1.66, depth - 0.17, 2.75, 0.69, 0.07, wood, { solid: false });
    S('DAMUN', mid, y + 2.01, depth - 0.23, 2.30, 0.50, null, { fg: '#201f1c' });
    for (const u of [a + 0.55, q - 0.55]) {
      S('우리 술', u, y + 1.9, depth - 0.13, 0.40, 0.49, '#eee9da', { fg: '#82876e' });
      B(u, y + 1.18, depth - 0.2, 0.34, 0.31, 0.15, { tex: 'emit', color: 0xffd68a }, { solid: false });
    }
  }
  if (beef || galbi || fish || darkBar) {
    const ductCol = galbi || fish ? 0xaab4b2 : 0x303433;
    for (const u of [a + 0.65, q - 0.65]) {
      B(u, ceiling - 0.31, depth / 2, 0.24, 0.22, depth - 0.3, ductCol, { solid: false });
      for (let d = 0.5; d < depth - 0.2; d += 0.42) B(u, ceiling - 0.32, d, 0.26, 0.24, 0.025, 0x7c8583, { solid: false });
    }
    B(mid, ceiling - 0.34, 0.64, width - 0.3, 0.23, 0.23, ductCol, { solid: false });
    if (galbi) for (let u = a + 0.3; u < q; u += 0.48) B(u, ceiling - 0.06, depth / 2, 0.44, 0.04, depth - 0.15, wood, { solid: false });
  }
  if (ilbon || arisu) {
    const glow = ilbon ? 0x344bff : 0xee424e;
    for (const d of [1.2, Math.max(2.5, depth - 1.45)]) {
      B(mid, ceiling - 0.035, d, width - 0.55, 0.025, 1.25, { tex: 'emit', color: glow }, { solid: false });
      B(mid, ceiling - 0.07, d, width - 0.83, 0.04, 0.95, 0xd9d6cc, { solid: false });
      for (const u of [a + 0.22, q - 0.22]) B(u, ceiling - 0.22, d, 0.25, 0.22, 1.5, 0xe1ddd2, { solid: false });
    }
  }
  if (arisu) {
    for (const u of cols) for (const d of [2.16]) B(u, y, d, 1.60, 1.15, 0.08, wood);
    S(['스포츠', '생중계'], mid, y + 2.05, depth - 0.20, 0.95, 0.53, '#32649a', { fg: '#e8ede4' });
    for (let u = a + 0.6; u < q - 0.35; u += 1.2) for (let k = 0; k < 3; k++) {
      B(u, y + 1.42 + k * 0.11, depth - 0.18, 0.42, 0.025, 0.03, 0x785138, { solid: false });
      B(u - 0.13 + k * 0.13, y + 1.4, depth - 0.18, 0.025, 0.35, 0.03, 0x785138, { solid: false });
    }
  }
  if (fish) {
    // Navy split noren at the service opening; pale wood base cabinets (06).
    for (let j = 0; j < 4; j++) B(a + 0.40 + j * 0.42, y + 1.65, depth - 0.3, 0.39, 0.58, 0.035, 0x284e77, { solid: false });
    S('鮮', a + 1.03, y + 1.97, depth - 0.34, 0.58, 0.43, null, { fg: '#e35e49' });
  }
  // Downlights, pendants and ceiling pipes sit above the walking head envelope.
  for (const u of cols) for (const d of rows) {
    B(u, ceiling - 0.09, d, ilbon || arisu ? 0.19 : 0.55, 0.035, ilbon || arisu ? 0.19 : 0.14, { tex: 'emit', color: galbi || damun || hof ? 0xffd08c : 0xfff4df }, { solid: false });
    if (damun || hof) {
      B(u, ceiling - 0.32, d, 0.018, 0.28, 0.018, 0x393b34, { solid: false });
      cyl(u, ceiling - 0.41, d, 0.07, 0.10, { tex: 'emit', color: 0xffce7e }, 8);
    }
  }
  if (beef || hof) {
    S(beef ? ['소고기구이', '우고집'] : ['치킨 · 호프 · 골뱅이', '치킨 · 호프 · 닭발'], a + 0.8, y + 1.6, depth - 0.18, 1.2, 0.55, '#282d29');
    B(q - 0.7, y + 1.95, depth - 0.19, 0.29, 0.29, 0.08, 0xdbddd2, { solid: false });
    for (const du of [-0.10, 0, 0.10]) B(q - 0.7 + du, y + 1.98, depth - 0.24, 0.015, 0.23, 0.025, 0x929b90, { solid: false });
  }
  // Shopfront panels never cover the open centre doorway. All loose furniture
  // stays in the edge strip, at most 0.45m into the 3.3m shared corridor.
  const panelW = Math.max(0.45, (width - 1.55) / 2), panelUs = [a + panelW / 2, q - panelW / 2];
  if (beef) for (const u0 of panelUs) for (let u = u0 - panelW / 2; u < u0 + panelW / 2; u += 0.085) B(u, y + 0.05, -0.04, 0.045, 2.25, 0.08, 0x3b302b, { solid: false });
  if (arisu) for (const u of panelUs) {
    B(u, y, -0.045, panelW, 0.65, 0.055, 0x9c452b, { solid: false });
    for (let du = -panelW / 2; du < panelW / 2; du += 0.055) B(u + du, y + 0.02, -0.085, 0.012, 0.60, 0.015, 0xc0633b, { solid: false });
    B(u, y + 0.69, -0.035, panelW - 0.08, 1.35, 0.03, { tex: 'glass', color: 0x72aaa3 }, { solid: false });
    B(u, y + 1.25, -0.07, panelW, 0.055, 0.055, 0x604931, { solid: false });
  }
  if (damun || heart) for (const u of panelUs) B(u, y + 0.02, -0.03, panelW, 2.20, 0.04, heart ? 'banpo-brick' : 'banpo-white-brick', { solid: false });
  if (damun) {
    B(mid, y + 2.18, -0.04, width - 0.05, 0.24, 0.24, wood, { solid: false });
    S(['너는 지금', '막걸리가', '땡긴다.', '담 은'], q - panelW / 2, y + 1.25, -0.08, Math.min(0.8, panelW - 0.1), 1.1, '#b68c53', { fg: '#3c3a2d' });
    for (let j = 0; j < 4; j++) S(j % 2 ? '우리 술' : '담은', a + 0.38 + (j % 2) * 0.5, y + 0.97 + Math.floor(j / 2) * 0.55, -0.09, 0.40, 0.45, '#e7e3d7', { fg: '#484b40', box: 0.025, boxMat: 0x343b37 });
  }
  if (fish) {
    B(a + 0.50, y + 0.08, 0.24, 0.85, 0.60, 0.68, 0x9fac9f);
    B(a + 0.50, y + 0.68, 0.24, 0.85, 0.47, 0.68, { tex: 'glass', color: 0x91c0b1 }, { solid: false });
    B(a + 0.50, y + 1.12, 0.24, 0.90, 0.07, 0.72, 0xc5d0bd, { solid: false });
    S(['대방어 개시', '연어 · 광어'], a + 0.48, y + 1.65, -0.1, 0.52, 0.7, '#f3f1e4', { fg: '#b5486b' });
  }
  if (darkBar) {
    B(mid, y + 2.20, -0.045, width, 0.07, 0.08, { tex: 'emit', color: 0xe6b66f }, { solid: false });
    B(a + 0.04, y + 0.02, -0.06, 0.04, 2.27, 0.04, { tex: 'emit', color: 0x63dcca }, { solid: false });
  }
  if (/노래/.test(name)) {
    for (const u of panelUs) {
      B(u, y + 0.55, -0.08, panelW, 0.48, 0.045, 0xb8382d, { solid: false });
      B(u, y + 1.03, -0.08, panelW, 0.72, 0.045, 0xefcc29, { solid: false });
      B(u, y + 0.03, -0.08, panelW, 0.5, 0.045, 0x393c3c, { solid: false });
    }
    S('노래연습장', mid, y + 2.14, -0.10, width - 0.1, 0.4, '#efcf36', { fg: '#252625' });
  }
  const projectingText = damun ? ['DAMUN  담은', '팔도막걸리와 전통주'] : heart ? ['하트타임', '호프  소주', '커피 · 식사'] : arisu ? ['아리수', '포차'] : kimbap ? ['충무할매김밥', '지하 13호'] : hof && /숙이네/.test(name) ? ['숙이네', '골뱅이·호프·닭발'] : [name];
  const signBg = damun ? '#2d438f' : beef ? '#252521' : arisu || heart || kimbap || hof ? '#f1d14f' : '#eee6ce';
  const su = a + 0.56;
  B(su, y + 2.0, -0.26, 0.68, 0.39, 0.11, damun ? 0x354f91 : beef ? 0x34352e : 0xd3b764, { solid: false, rotY: angle + Math.PI / 2 });
  S(projectingText, su, y + 2.19, -0.26, 0.68, 0.39, signBg, { rotY: angle + Math.PI / 2, fg: damun || beef ? '#f5ead5' : '#9b292c', twoSided: true, offset: 0.065 });
  // Blue/green beer crates have open tops, side ribs, bottle necks and labels.
  if (!kimbap && !fish) {
    const crateU = q - 0.35;
    for (let row = 0; row < (beef || darkBar ? 4 : 3); row++) {
      const by = y + row * 0.27, col = [0x205e9f, 0x284a91, 0x236351, 0xc29a2f][row % 4];
      B(crateU, by, -0.21, 0.55, 0.035, 0.40, col, { solid: false });
      for (const dd of [-0.19, 0.19]) B(crateU, by + 0.035, -0.21 + dd, 0.55, 0.21, 0.025, col, { solid: false });
      for (const du of [-0.26, 0.26]) B(crateU + du, by + 0.035, -0.21, 0.025, 0.21, 0.4, col, { solid: false });
      for (let j = 0; j < 4; j++) B(crateU - 0.21 + j * 0.14, by + 0.035, -0.42, 0.025, 0.21, 0.025, 0x193c54, { solid: false });
      S(row % 2 ? '카스' : '테라', crateU, by + 0.14, -0.43, 0.40, 0.14, null, { fg: '#e4e6db', offset: 0.01 });
      if (row === 2) for (const du of [-0.14, 0.07, 0.20]) cyl(crateU + du, by + 0.05, -0.20, 0.034, 0.23, 0x345d39, 7);
    }
    if (darkBar || beef) for (let u = a + 0.28; u < mid - 0.93; u += 0.49) stool(u, -0.23, false);
  }
  if (umaru) {
    B(a + 0.50, y, -0.16, 0.75, 0.92, 0.35, wood);
    cyl(q - 0.4, y, 0.35, 0.19, 0.35, 0x846b50);
    for (let j = 0; j < 7; j++) B(q - 0.4 + Math.sin(j * 1.9) * 0.21, y + 0.45 + j * 0.14, 0.35, 0.35, 0.075, 0.18, 0x3c6d41, { solid: false, rotY: angle + j * 0.7 });
  }
}

const PI = Math.PI;
const TENANTS = {
  1: { b: [], g: [], h: [] },
  2: { b: ['병천토종순대', '서초전집', '미락', '범주당', '하시무'], g: ['LG전자 베스트샵', 'IBK기업은행'], h: ['LG전자 서초서비스센터', '쎄븐미용실'] },
  3: { b: ['만끽치킨', '배부장찌개', '온유월식당', '우고집', '반포대교', '명불허전 원조골뱅이'], g: ['지니 헤어', '네일스토리 잠원점', '꽃보다 남자'], h: ['생명의말씀사'], clinic: '봄치과의원' },
  4: { b: ['정선 감자탕', '하얀집'], g: ['KFC'], h: ['혜원미용실', '라시앤느헤어'], fifth: ['마루정신건강의학과'] },
  5: { b: ['일번지육개장', '서래곱창', '백채 김치찌개 반포점', '블루'], g: ['뉴스타공인중개사사무소', 'GS25'], h: ['재임헤어', '킴스 헤어', '헤라 스킨앤바디'] },
  6: { b: ['유메', '그집'], g: ['최옥현헤어아뜨리에', '이쌤헤어', '아름다운 선택'], h: ['우리 피부', '안나민 반포점', '명동심 미용실', '김은제헤어', '눈썹쟁이'], clinic: '반포좋은치과의원' },
  7: { b: [], g: ['르웰의원'], h: ['송'], fourth: ['샤크에듀'] },
  8: { b: [], g: [], h: ['명품 피부', '모네'], fourth: ['에꼴드미용실'], fifth: ['반포대학나무학원', '네오스터디학원'] },
};
const PALETTE = ['#174a4b', '#953d32', '#41494e', '#79553a', '#354f70', '#875961'];
const SIGN_COLORS = ['#263d8c', '#e2662c', '#f2f2ee', '#2e6b46', '#b8322c'];
// 2025–26 interior photo names. The 4동 directory fixes its cluster; other
// unlocated photo types are assigned to existing bays and documented as guesses.
const PHOTO_B1 = {
  1: ['충무할매김밥'],
  2: ['병천토종순대', '서초전집', '미락', '범주당', '하시무'],
  3: ['온유월식당', '만끽치킨', '배부장찌개', '반포대교', '명불허전 원조골뱅이'],
  4: ['동해횟집', '하얀집', '반포교집', '반포갈비', '정선 감자탕', '담은', '충무할매김밥', '하림'],
  5: ['일번지육개장', '서래곱창', '하트타임', '숙이네', '우고집', '터미널포차', '백채 김치찌개 반포점', '블루'],
  6: ['아리수 포차', '그집', '유메'],
  7: ['우마루'],
  8: [],
};

// Photo-furnished upper rooms. Coordinates are the existing block-local frame;
// d is measured inward from the corridor so both sides remain usable.
function buildPhotoUpper(K, C) {
  const { n, f, y, ceiling, a, q, va, vb, side, name, kind, angle, P, rect, box, sign, person } = C;
  const width = q - a, mid = (a + q) / 2, front = C.atCorridor ?? (side > 0 ? va : vb);
  const depth = side > 0 ? vb - front : front - va, V = d => front + side * d;
  const frontRot = side > 0 ? angle + PI : angle;
  const B = (u, h, d, w, hh, dd, mat, extra = {}) => box(u, y + h, V(d), w, hh, dd, mat, extra);
  const S = (text, u, h, d, w, hh, bg, extra = {}) => sign(text, u, y + h, V(d), w, hh, bg, { rotY: frontRot, ...extra });
  const cylinder = (u, h, d, r, hh, mat, seg = 10) => {
    const p = P(u, V(d)); K.cyl({ x: p[0], y: y + h, z: p[1], r, h: hh, mat, seg, solid: false });
  };
  const trim = (col = 0xc9b49a) => {
    B(mid, 0.03, depth - 0.045, width - 0.05, 0.95, 0.035, 0xb8b5b0, { solid: false });
    B(mid, 0.98, depth - 0.065, width - 0.05, 0.065, 0.06, col, { solid: false });
    for (const u of [a + 0.035, q - 0.035]) {
      B(u, 0.03, depth / 2, 0.035, 0.95, depth, 0xb8b5b0, { solid: false });
      B(u, 0.98, depth / 2, 0.06, 0.065, depth, col, { solid: false });
      B(u, 0.02, depth / 2, 0.055, 0.08, depth, col, { solid: false });
    }
  };
  const light = (u, d) => {
    B(u, ceiling - y - 0.08, d, 1.05, 0.055, 0.30, 0xe2e2df, { solid: false });
    for (const off of [-0.095, 0.095]) B(u, ceiling - y - 0.10, d + off, 0.97, 0.025, 0.055, { tex: 'emit', color: 0xf5fff9 }, { solid: false });
  };
  const chair = (u, d, color = 0xdc9a43) => {
    B(u, 0.43, d, 0.42, 0.065, 0.42, 0x353b3f);
    B(u, 0.55, d - 0.18, 0.42, 0.35, 0.05, color, { solid: false });
    B(u, 0.82, d - 0.215, 0.16, 0.035, 0.012, 0x454e52, { solid: false });
    for (const du of [-0.18, 0.18]) for (const dd of [-0.16, 0.16]) B(u + du, 0.02, d + dd, 0.028, 0.44, 0.028, 0xa6a8a5, { solid: false });
    for (const du of [-0.22, 0.22]) B(u + du, 0.40, d - 0.18, 0.025, 0.49, 0.025, 0x4f585a, { solid: false });
  };
  const plant = (u, d) => {
    cylinder(u, 0, d, 0.23, 0.45, 0x333c38);
    B(u, 0.45, d, 0.035, 1.1, 0.035, 0x5d6041, { solid: false });
    for (let j = 0; j < 8; j++) {
      const t = j * 2.4, du = Math.sin(t) * 0.20, dd = Math.cos(t) * 0.20;
      B(u + du, 0.58 + j * 0.11, d + dd, 0.28, 0.07, 0.15, [0x2b553b, 0x44654a, 0x5e7755][j % 3], { solid: false, rotY: angle + t });
    }
  };

  if (name === '장솔학원' && f >= 2) {
    // 03: open white entry leaves, cyan notices and a second glazed portal.
    // Door furniture stays alongside the existing 1.45m opening, never across it.
    B(mid, 0.01, 0.65, 1.42, 0.012, 0.85, 0x191d1c, { solid: false });
    for (const sg of [-1, 1]) {
      B(mid + sg * 0.82, 0, 0.15, 0.08, 2.28, 0.45, 0xf4f3ef, { solid: false });
      B(mid + sg * 0.87, 1.05, 0.23, 0.035, 0.40, 0.035, 0x949b99, { solid: false });
      S(sg < 0 ? ['장솔학원', '수준별 맞춤 수업', '학습 점검 · 상담'] : ['장솔학원', '학생을 사랑합니다'], mid + sg * 1.4, 1.5, -0.06, 0.9, 1.15, '#b8dcda', { fg: '#34524d' });
      B(mid + sg * 1.17, 0.05, 1.25, 0.64, 2.05, 0.035, { tex: 'glass', color: 0xb7ded7 }, { solid: false });
      B(mid + sg * 0.82, 0.05, 1.25, 0.035, 2.15, 0.05, 0xb6bdb9, { solid: false });
    }
    B(mid, 2.19, 1.25, 2.95, 0.055, 0.07, 0xb6bdb9, { solid: false });
    S('장솔학원', mid, 1.6, 1.25, 1.32, 0.4, '#b8dcda', { fg: '#227d78' });
    plant(q - 0.55, 1.55);
    // 04: shallow horizontal student trays, coloured sides, two wall displays.
    const mailW = Math.min(width - 0.8, 5.6), mailU = mid, cols = 10, rows = 14;
    B(mailU, 0.12, depth - 0.3, mailW, 1.39, 0.42, 0xb9bab4);
    B(mailU, 0.25, depth - 0.53, mailW - 0.08, 1.19, 0.02, 0x4d5454, { solid: false });
    for (let c = 0; c <= cols; c++) B(mailU - mailW / 2 + c * mailW / cols, 0.23, depth - 0.5, 0.025, 1.23, 0.32, [0xd3d7c9, 0xadbcca, 0xceada8, 0xb7c7ac][c % 4], { solid: false });
    for (let r = 0; r <= rows; r++) B(mailU, 0.24 + r * 0.085, depth - 0.5, mailW, 0.013, 0.34, 0xc4c7c3, { solid: false });
    for (let c = 0; c < cols; c++) {
      S(String(c + 1), mailU - mailW / 2 + (c + 0.5) * mailW / cols, 1.54, depth - 0.55, 0.19, 0.12, '#e7d45d', { fg: '#515242' });
      for (let r = 0; r < rows; r++) if ((c + r) % 3 !== 0) B(mailU - mailW / 2 + (c + 0.5) * mailW / cols, 0.26 + r * 0.085, depth - 0.52, mailW / cols - 0.07, 0.025, 0.23, [0xd6d1bd, 0xc6d4d4, 0xe4d8bf][r % 3], { solid: false });
    }
    for (const sg of [-1, 1]) {
      const tu = mid + sg * Math.min(1.12, width / 4);
      B(tu, 1.92, depth - 0.14, Math.min(2.1, width / 2 - 0.3), 0.70, 0.07, 0x252c2c, { solid: false });
      S(sg < 0 ? ['등원 안내', '오늘의 수업', '출석 확인'] : ['장솔학원', '복도 · 학습실'], tu, 2.27, depth - 0.20, Math.min(2.0, width / 2 - 0.4), 0.63, sg < 0 ? '#e7d3be' : '#879b9c', { fg: '#384f56' });
    }
    B(a + 0.75, 0, depth / 2, 1.1, 0.88, 0.62, 0xe7e6dc);
    B(a + 0.75, 0.88, depth / 2, 1.15, 0.06, 0.68, 0xf7f4e9, { solid: false });
    person(a + 0.72, y, V(depth / 2 + 0.7), { shirt: 0x222b30 });
    person(q - 1.1, y, V(depth - 1.05), { shirt: 0x8a867b });
    for (const u of [mid - 1.25, mid + 1.25]) light(u, depth / 2);
    return true;
  }

  if (kind === 'classroom') {
    // 25–27: beige frame, aqua stone strip, blank green board and orange chairs.
    K.hpoly({ tex: 'wood', color: 0xc5a477, scale: [2.0, 2.0] }, rect(a, va, q, vb), y + 0.008);
    trim();
    for (const sg of [-1, 1]) {
      B(mid + sg * 0.88, 0, 0.015, 0.18, 2.35, 0.12, 0xd2bca2, { solid: false });
      const span = Math.max(0, width / 2 - 1.04), pu = mid + sg * (1.04 + span / 2);
      if (span > 0.1) {
        B(pu, 0.02, -0.08, span, 0.91, 0.035, 0xa8b7a1, { solid: false });
        for (let row = 0; row < 7; row++) for (let col = 0; col < Math.ceil(span / 0.27); col++) {
          const uu = mid + sg * (1.05 + col * 0.27 + 0.12);
          if (Math.abs(uu - mid) < width / 2 - 0.1) B(uu, 0.08 + row * 0.11, -0.11, 0.23, 0.085, 0.025, [0x89bcb8, 0xc2bd8a, 0x6f9290, 0xcbd6c5][(col + row * 3) % 4], { solid: false });
        }
      }
      B(mid + sg * 1.0, 0.15, 0.19, 0.22, 1.95, 0.035, { tex: 'glass', color: 0xaad2d2 }, { solid: false });
      B(mid + sg * 0.88, 0.87, 0.11, 0.035, 0.75, 0.035, 0x96572c, { solid: false });
    }
    B(mid, 2.32, 0.01, 1.95, 0.22, 0.12, 0xd2bca2, { solid: false });
    S(name === '표준수학' ? ['표준수학', '수업 안내'] : ['강의실', '학습 안내'], mid + 1.55, 1.53, -0.05, 0.83, 0.7, '#e8eee6', { fg: '#489d9d' });
    const boardW = Math.min(3.8, width - 1.0);
    B(mid, 1.04, depth - 0.10, boardW + 0.12, 1.43, 0.09, 0xc4b197, { solid: false });
    B(mid, 1.10, depth - 0.17, boardW, 1.30, 0.025, 0x254e49, { solid: false });
    B(mid, 1.04, depth - 0.23, boardW + 0.12, 0.045, 0.18, 0xcbbda6, { solid: false });
    for (let k = 0; k < 4; k++) B(mid - 0.8 + k * 0.46, 1.09, depth - 0.25, 0.15, 0.045, 0.07, 0xdadbd7, { solid: false });
    const acU = q - 0.78;
    B(acU, 2.38, depth - 0.24, 1.18, 0.35, 0.29, 0xeaeae3, { solid: false });
    for (let k = 0; k < 3; k++) B(acU, 2.41 + k * 0.035, depth - 0.405, 1.04, 0.014, 0.018, 0xb6bcb7, { solid: false });
    B(acU + 0.48, 1.07, depth - 0.12, 0.018, 1.3, 0.025, 0xd9d9d1, { solid: false });
    B(acU + 0.48, 1.02, depth - 0.15, 0.11, 0.13, 0.025, 0xeae9e2, { solid: false });
    // Paired desks separated by a central walking aisle from the doorway.
    const cols = width >= 4.6 ? 2 : 1, rows = depth >= 5.7 ? 4 : depth >= 4.4 ? 3 : 2;
    const colOffset = Math.min(1.65, width / 2 - 0.9), rowStep = Math.min(1.1, (depth - 2.0) / Math.max(1, rows - 1));
    for (let row = 0; row < rows; row++) for (let col = 0; col < cols; col++) {
      const u = cols === 1 ? mid - 0.45 : mid + (col ? 1 : -1) * colOffset, d = 1.32 + row * rowStep;
      B(u, 0.70, d, 1.35, 0.055, 0.55, 0xd9ad6b, { solid: true });
      B(u, 0.67, d, 1.39, 0.025, 0.59, 0x454b4d, { solid: false });
      for (const du of [-0.57, 0.57]) {
        B(u + du, 0.03, d, 0.035, 0.65, 0.035, 0xafb5b2, { solid: false });
        B(u + du, 0.03, d, 0.05, 0.035, 0.48, 0xafb5b2, { solid: false });
        B(u + du, 0.36, d + 0.13, 0.035, 0.04, 0.25, 0x69706e, { solid: false });
      }
      for (const du of [-0.34, 0.34]) chair(u + du, d - 0.52);
      B(u - 0.28, 0.75, d, 0.25, 0.012, 0.30, 0xf2f0e4, { solid: false });
      B(u + 0.31, 0.75, d, 0.23, 0.022, 0.29, [0x8cabb7, 0xb1c6ad, 0xd6c19d][row % 3], { solid: false });
      if (row === 1 && col === 0) for (const du of [-0.34, 0.34]) person(u + du, y, V(d - 0.52), { sit: true, rotY: side > 0 ? angle + PI : angle, shirt: du > 0 ? 0xc3c7c5 : 0x2d3546 });
    }
    for (const u of [mid - Math.min(1.4, width / 4), mid + Math.min(1.4, width / 4)]) for (const d of [1.5, depth - 1.1]) light(u, d);
    cylinder(a + 0.25, 0, depth - 0.4, 0.11, 0.41, 0xbb3430);
    B(a + 0.25, 0.41, depth - 0.4, 0.07, 0.07, 0.07, 0x4d5551, { solid: false });
    return true;
  }

  if (kind === 'optical') {
    // 38: dense eyewear trays in an L of glass cases, five black chrome chairs.
    const caseU = q - 0.63, longStart = 0.8, longEnd = depth - 0.65, longL = longEnd - longStart;
    const glassCase = (u, d, w, dd) => {
      B(u, 0.08, d, w, 0.60, dd, 0xd8d7cb);
      B(u, 0.68, d, w + 0.035, 0.055, dd + 0.035, 0x303c3b, { solid: false });
      B(u, 0.74, d, w, 0.28, dd, { tex: 'glass', color: 0xc5e1dc }, { solid: false });
      for (const du of [-w / 2, w / 2]) B(u + du, 0.73, d, 0.025, 0.30, dd, 0xaeb9b5, { solid: false });
      for (const dp of [-dd / 2, dd / 2]) B(u, 1.01, d + dp, w, 0.025, 0.025, 0xaeb9b5, { solid: false });
      B(u, 0.735, d, w - 0.05, 0.012, dd - 0.05, 0xe4e3d5, { solid: false });
    };
    const glasses = (u, h, d, col = 0x303b3d) => {
      // Each pair has two open rims, a bridge and two temples on the white tray.
      for (const sg of [-1, 1]) {
        const lensU = u + sg * 0.036;
        for (const dd of [-0.024, 0.024]) B(lensU, h, d + dd, 0.058, 0.009, 0.006, col, { solid: false });
        for (const du of [-0.028, 0.028]) B(lensU + du, h, d, 0.006, 0.009, 0.048, col, { solid: false });
        B(u + sg * 0.067, h, d + 0.06, 0.006, 0.009, 0.10, col, { solid: false });
      }
      B(u, h, d, 0.022, 0.009, 0.008, col, { solid: false });
    };
    glassCase(caseU, (longStart + longEnd) / 2, 0.75, longL);
    const rearW = width - 1.3, rearU = a + rearW / 2 + 0.2, rearD = depth - 0.65;
    glassCase(rearU, rearD, rearW, 0.75);
    for (let d = longStart + 0.2; d < longEnd - 0.15; d += 0.23) for (const du of [-0.22, 0, 0.22]) glasses(caseU + du, 0.76, d, [0x343639, 0x775946, 0x777f7a][Math.round(d * 10) % 3]);
    for (let u = a + 0.38; u < q - 1.25; u += 0.22) for (const dd of [-0.20, 0.03, 0.26]) glasses(u, 0.76, rearD + dd);
    for (let i = 0; i < 5; i++) {
      const d = longStart + 0.38 + i * Math.max(0.60, (longL - 0.75) / 4), u = caseU - 0.90;
      // Chairs face the long side counter, with padded black backs and chrome sleds.
      B(u, 0.46, d, 0.46, 0.075, 0.48, 0x2e3333);
      B(u - 0.20, 0.55, d, 0.06, 0.42, 0.46, 0x272e2e, { solid: false });
      for (const dd of [-0.20, 0.20]) {
        B(u, 0.03, d + dd, 0.46, 0.025, 0.028, 0xabb5b4, { solid: false });
        for (const du of [-0.18, 0.18]) B(u + du, 0.04, d + dd, 0.025, 0.41, 0.025, 0xabb5b4, { solid: false });
      }
    }
    // Rear wall shelves and left display islands keep the centre aisle clear.
    B(mid, 0.15, depth - 0.08, width - 0.25, 2.40, 0.10, 0x242d2c, { solid: false });
    for (let row = 0; row < 4; row++) {
      const h = 1.18 + row * 0.29;
      B(mid, h, depth - 0.26, width - 0.45, 0.025, 0.35, 0xbfc9c3, { solid: false });
      for (let u = a + 0.4; u < q - 0.3; u += 0.23) glasses(u, h + 0.03, depth - 0.29, row % 2 ? 0x9c7e51 : 0x313a3a);
    }
    B(a + 0.45, 0.15, depth / 2, 0.55, 0.72, 1.30, 0xd0d3ca);
    B(a + 0.45, 0.87, depth / 2, 0.55, 0.45, 1.30, 'glass', { solid: false });
    for (let k = 0; k < 6; k++) glasses(a + 0.45, 0.91, depth / 2 - 0.50 + k * 0.18);
    S('리스본 안경', mid, 2.70, depth - 0.14, 2.40, 0.35, '#252e2d', { fg: '#eae5ce' });
    S(['정밀 시력검사', '안경 · 콘택트렌즈'], a + 0.8, 1.75, depth - 0.14, 1.2, 0.6, '#f0eee4', { fg: '#39515a' });
    B(rearU - 0.6, 1.04, rearD, 0.47, 0.35, 0.045, 0x333d3e, { solid: false });
    S('안내', rearU - 0.6, 1.2, rearD - 0.04, 0.42, 0.27, '#bfcfc8', { fg: '#395354' });
    for (const u of [a + 1.1, mid, q - 1.0]) for (const d of [0.9, depth / 2, depth - 0.9]) cylinder(u, ceiling - y - 0.04, d, 0.11, 0.025, { tex: 'emit', color: 0xfff5db }, 12);
    person(a + 0.75, y, V(depth - 1.45), { shirt: 0xe1ded4 });
    return true;
  }
  return false;
}

export function build(K) {
  // Finishes have a small physical grain; windows are actual openings, not
  // pictures of inaccessible floors on a solid exterior prism.
  const tile = (key, base, colors, grout) => K.texture(key, 256, 256, (g, w, h) => {
    g.fillStyle = base; g.fillRect(0, 0, w, h);
    for (let j = 0; j < 8; j++) for (let i = 0; i < 8; i++) {
      g.fillStyle = colors[(i * 13 + j * 7 + i * j) % colors.length];
      g.fillRect(i * 32, j * 32, 32, 32);
      g.fillStyle = grout; g.fillRect(i * 32, j * 32, 32, 1); g.fillRect(i * 32, j * 32, 1, 32);
    }
  }, [1.6, 1.6]);
  // bp01/bp02: 20cm pink glazed squares, not beige checkerboard. cc02
  // separately confirms light western blocks; 5 retains the unverified default.
  tile('banpo-tile', '#cdb7b5', ['#d4bfbd', '#c8b0ae', '#c1aaa9', '#d0bcb8'], '#e3d8d6');
  tile('banpo-tile-pier', '#d8c5c3', ['#d8c5c3', '#d7c3c1'], '#e3d8d6');
  tile('banpo-light-tile', '#d8d6d0', ['#d8d6d0', '#d3d2cd', '#deddd7'], '#e8e7e1');
  const brick = (key, colors, mortar) => K.texture(key, 368, 120, (g, w, h) => {
    g.fillStyle = mortar; g.fillRect(0, 0, w, h);
    // Four 230mm bricks by four 75mm courses, half-brick running bond.
    for (let row = 0; row < 4; row++) for (let col = -1; col < 4; col++) {
      g.fillStyle = colors[((col + 1) * 7 + row * 5) % colors.length];
      g.fillRect(col * 92 + (row % 2) * 46 + 2, row * 30 + 2, 88, 26);
    }
  }, [0.92, 0.30]);
  brick('banpo-brick', ['#b5603f', '#a8513a', '#bf6a48'], '#caa58c');
  brick('banpo-brick-pier', ['#8e4430', '#914832', '#89422f'], '#ad8067');
  K.texture('banpo-pavers', 240, 240, (g, w, h) => {
    g.fillStyle = '#92918c'; g.fillRect(0, 0, w, h);
    for (let j = 0; j < 4; j++) for (let i = 0; i < 4; i++) {
      g.fillStyle = (i * 3 + j * 7) % 5 === 0 ? '#a5a49e' : '#b9b8b2';
      g.fillRect(i * 60 + 1, j * 60 + 1, 58, 58);
    }
  }, [1.2, 1.2]);
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

  // Interior finishes traced independently of the retained exterior textures.
  K.texture('banpo-b1-tile', 256, 256, (g, w, h) => {
    g.fillStyle = '#d6d3c7'; g.fillRect(0, 0, w, h);
    const rnd = K.rand(6025);
    for (let i = 0; i < 3000; i++) { g.fillStyle = ['#999e95', '#e9e7df', '#b8b8ad', '#c9c7bc'][i % 4]; g.fillRect(rnd() * w, rnd() * h, 1, 1); }
    g.strokeStyle = '#a7a79e'; g.lineWidth = 1; g.strokeRect(0, 0, w, h);
  }, [0.6, 0.6]);
  K.texture('banpo-upper-tile', 128, 128, (g, w, h) => {
    g.fillStyle = '#e1dcd0'; g.fillRect(0, 0, w, h); g.strokeStyle = '#b3afa7'; g.strokeRect(0, 0, w, h);
  }, [0.6, 0.6]);
  K.texture('banpo-acoustic', 128, 128, (g, w, h) => {
    g.fillStyle = '#eeeee7'; g.fillRect(0, 0, w, h); g.strokeStyle = '#c5c5bd'; g.strokeRect(0, 0, w, h);
    const rnd = K.rand(2400); g.fillStyle = '#d3d3cb'; for (let i = 0; i < 200; i++) g.fillRect(rnd() * w, rnd() * h, 1, 1);
  }, [0.6, 0.6]);
  brick('banpo-white-brick', ['#e7e5df', '#f3f0e8', '#d8d8d2'], '#c2c2ba');
  K.texture('banpo-plan', 768, 336, (g, w, h) => {
    g.fillStyle = '#282e38'; g.fillRect(0, 0, w, h); g.fillStyle = '#f4f3e8'; g.font = 'bold 24px sans-serif'; g.fillText('반포쇼핑타운 지하상가 안내', 28, 40);
    g.fillStyle = '#eeeeeb'; g.fillRect(35, 163, 698, 23);
    for (let i = 0; i < 24; i++) {
      const x = 36 + i * 29; g.fillStyle = ['#f6df59', '#f4b8b6', '#a4d7e9'][Math.floor(i / 8)];
      g.fillRect(x, 122, 25, 38); g.fillRect(x, 189, 25, 39);
    }
    g.fillStyle = '#e14b4f'; g.beginPath(); g.arc(375, 176, 14, 0, PI * 2); g.fill();
    g.fillStyle = '#ffffff'; g.font = '18px sans-serif'; g.fillText('현위치', 352, 263); g.fillText('← 출구', 37, 294); g.fillText('출구 →', 650, 294);
  }, [2.4, 1.05]);

  meta.claims.forEach((id, blockIndex) => {
    const n = blockIndex + 1, b = K.osmBuilding(id)[0];
    if (!b) throw new Error(`반포쇼핑타운 ${n}동 OSM footprint missing`);
    let poly = b.poly;
    const tenant = TENANTS[n], isBrick = n >= 6;
    const facadeMat = isBrick ? 'banpo-brick' : n <= 2 ? 'banpo-light-tile' : 'banpo-tile';
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
    const local = p => [p[0] * c - p[1] * s - u0, p[0] * s + p[1] * c - v0];
    const recessedEnd = n === 3 || n === 4, recessU = W / 2 - 4.5;
    // bp01: narrow east stair volume behind the main shopfront. The OSM
    // envelope stays the source; only this 1m inward notch is reconstructed.
    if (recessedEnd) {
      const [a, b] = poly.slice(0, 2).map(local);
      const v = a[1] + (b[1] - a[1]) * (recessU - a[0]) / (b[0] - a[0]);
      poly = [poly[0], P(recessU, v), P(recessU, v - 1), P(b[0], b[1] - 1), ...poly.slice(2)];
    }
    const frontAt = u => front - (recessedEnd && u > recessU ? 1 : 0);
    const rect = (a, v, q, t) => [P(a, v), P(q, v), P(q, t), P(a, t)];
    const box = (u, y, v, w, h, d, mat, extra = {}) => { const [x, z] = P(u, v); return K.box({ x, y, z, w, h, d, rotY: angle, mat, ...extra }); };
    const sign = (text, u, y, v, w, h, bg = '#294744', extra = {}) => { const [x, z] = P(u, v); K.sign(text, { x, y, z, w, h, rotY: angle, bg, fg: '#fff9ed', offset: 0.10, ...extra }); };
    const wall = (a, v, q, t, ya, yb, opts = {}) => { const p = P(a, v), r = P(q, t); K.wall(...p, ...r, ya, yb, opts); };
    const face = (u, y, v, w, h, mat) => { const a = P(u - w / 2, v), b = P(u + w / 2, v); const pts = [[...a.slice(0, 1), y, a[1]], [b[0], y, b[1]], [b[0], y + h, b[1]], [a[0], y + h, a[1]]]; K.quad(mat, pts, [s, 0, c]); K.quad(mat, pts, [-s, 0, -c]); };
    const edges = poly.map((a, i) => {
      const b = poly[(i + 1) % poly.length], L = Math.hypot(b[0] - a[0], b[1] - a[1]);
      const [nx, nz] = K.orient(poly)[i];
      return { a, b, L, nx, nz, rotY: Math.atan2(nx, nz), tx: (b[0] - a[0]) / L, tz: (b[1] - a[1]) / L, edge: i };
    });
    const endEdges = edges.filter(e => Math.abs(e.nx * c - e.nz * s) > 0.65 && e.L > 2);
    const edgePoint = (e, at, out = 0) => [e.a[0] + e.tx * at + e.nx * out, e.a[1] + e.tz * at + e.nz * out];
    function endWindow(e, at, y, w, h) {
      const [x, z] = edgePoint(e, at), frame = isBrick ? 0xe8e8e2 : 0x4a4f52;
      K.box({ x, y, z, w, h, d: 0.035, rotY: e.rotY, mat: { tex: 'glass', color: 0x91aaa7 }, solid: true });
      for (const du of [-w / 2, w / 2]) K.box({ x: x + Math.cos(e.rotY) * du, y: y - 0.035, z: z - Math.sin(e.rotY) * du, w: 0.065, h: h + 0.07, d: 0.06, rotY: e.rotY, mat: frame, solid: false });
      for (const yy of [y, y + h]) K.box({ x, y: yy - 0.035, z, w: w + 0.07, h: 0.07, d: 0.06, rotY: e.rotY, mat: frame, solid: false });
    }
    const person = (u, y, v, extra = {}) => { const [x, z] = P(u, v); K.person(x, y, z, { rotY: angle, ...extra }); };
    const floorYs = [K.LEVELS.B1, 0, 4, 7.5, 11, 14.5], roof = 18;
    const labels = ['B1', '1F', '2F', '3F', '4F', '5F'];
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
    // 4동's entrance sits between piers; do not draw a pier through the door.
    const entryU = n === 4 ? -0.5 : -1.5;
    const fore = rect(-W / 2 + (n === 1 ? 8 : 0.4), front + 0.15, W / 2 - 1, front + 3.8);
    K.slab(fore, 0.025, { mat: 'banpo-pavers', uvRot: angle, thick: 0.06, ceil: false });
    K.hpoly(0x8f8e89, rect(-W / 2 + (n === 1 ? 8 : 0.4), front + 2.4, W / 2 - 1, front + 3.0), 0.028);
    sign(`반포쇼핑타운 ${n}동`, entryU + 2.9, 2.1, front + 0.15, 2.5, 0.5, '#eeebe5', { fg: '#484746' });
    // Slender tactile strip and threshold stay flat enough for the player capsule.
    for (let u = entryU - 0.9; u < entryU + 1; u += 0.26) box(u, 0.027, front + 0.9, 0.14, 0.025, 0.6, 0xd2ad54, { solid: false });
    if (n === 4 || n === 5) {
      // Photos11/18: metallic portal and paired open glass leaves within the existing entrance.
      box(entryU, 2.9, front + 0.15, 5.8, 0.48, 0.45, 0xbfc0b9, { solid: false });
      sign(`반포쇼핑타운${n}동`, entryU, 3.1, front + 0.4, 4.8, 0.32, '#d3d2c8', { fg: '#9b8353', offset: 0.01 });
      for (const du of [-1.25, 1.25]) {
        box(entryU + du, 0, front + 0.1, 0.07, 2.9, 0.12, 0xb7babc, { solid: false });
        box(entryU + du, 0.05, front - 0.5, 0.04, 2.6, 1, 'glass', { solid: false });
        box(entryU + du, 0.85, front - 0.6, 0.045, 0.65, 0.045, 0x777d7c, { solid: false });
      }
      for (let j = 0; j < 3; j++) box(entryU, 0.025 + j * 0.025, front + 0.25 + (2 - j) * 0.28, 2.7, 0.025, 0.28, 0xa7aaa3, { solid: false });
    }
    const gutterU = Math.max(...us.filter((_, i) => vs[i] - v0 > front - 0.2)) - u0 - 0.35;
    box(gutterU, 0.1, frontAt(gutterU) + 0.07, 0.09, roof - 0.3, 0.12, 0x777c72, { solid: false });

    // Full-height piers establish the vertical rhythm visible in bp01/bp02.
    // The brick blocks use the same approximately 7m structural bays, with
    // narrower dark brick piers (bp03). Windows sit in pairs between them.
    const mainRight = recessedEnd ? recessU : W / 2;
    const pierCount = Math.max(3, Math.round((mainRight + W / 2) / 7));
    const pierStep = (mainRight + W / 2) / pierCount;
    for (let k = 0; k <= pierCount; k++) {
      const u = -W / 2 + k * pierStep;
      if (!K.pointInPoly(...P(u + (k === 0 ? 0.35 : -0.35), front - 0.4), poly)) continue;
      const width = isBrick ? 0.5 : 0.6, depth = isBrick ? 0.15 : 0.25;
      box(u, 0, front + depth / 2, width, roof + 0.65, depth,
        isBrick ? 'banpo-brick-pier' : n <= 2 ? 'banpo-light-tile' : 'banpo-tile-pier', { solid: false });
    }

    floorYs.forEach((y, f) => {
      const next = f === 5 ? roof : floorYs[f + 1], height = next - y;
      const ceiling = f === 0 ? y + 2.4 : f >= 2 ? y + 2.75 : next - 0.27;
      const furnish = [];
      const corridorHalf = f >= 2 ? 1.05 : f === 0 ? 1.6 : 1.75;
      K.slab(poly, y, { mat: f === 0 ? 'banpo-b1-tile' : 'banpo-upper-tile', thick: 0.24, edge: false, holes: f === 0 ? [] : [stairHole] });
      if (f === 0 || f >= 2) K.hpoly('banpo-acoustic', poly, ceiling, false, [stairHole]);
      const names = f === 0 ? (PHOTO_B1[n] || tenant.b) : f === 1 ? tenant.g : f === 2 ? (n === 4 ? ['장솔학원', '표준수학', ...tenant.h] : tenant.h) : f === 3 && tenant.clinic ? [tenant.clinic] : f === 4 ? tenant.fourth || [] : f === 5 ? tenant.fifth || [] : [];
      K.zone({ name: `반포쇼핑타운 ${n}동`, floor: labels[f], sub: [...names, uses[f]].join(' · '), poly, y0: y, y1: next - 0.03, priority: 2 });

      const openings = [];
      if (f === 1) for (const v of [front, back]) { const p = P(v === front ? entryU : -1.5, v); openings.push({ x: p[0], z: p[1], w: 2.6, y0: y, y1: y + 2.9 }); }
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
      // Actual apertures: paired flush windows, without continuous floor stripes
      // or projecting concrete sills. Brick windows are small punched squares.
      const bays = [];
      const windowUs = [];
      for (let k = 0; k < pierCount; k++) for (const t of [0.25, 0.75]) windowUs.push(-W / 2 + (k + t) * pierStep);
      for (const u of windowUs) {
        for (const v of [front, back]) {
          // Avoid the truncated west corner of block 1 and east corner of block 8.
          if (!K.pointInPoly(...P(u, v > 0 ? v - 0.45 : v + 0.45), poly)) continue;
          if (f === 1 && (v === front || Math.abs(u + 1.5) < 5.5)) continue;
          const p = P(u, v); const winW = f === 1 ? 2.5 : isBrick ? 1.3 : 2.2;
          if (![u - winW / 2 - 0.1, u + winW / 2 + 0.1].every(t => K.pointInPoly(...P(t, v > 0 ? v - 0.10 : v + 0.10), poly))) continue;
          if (f > 0) {
            const low = f === 1 ? 0.18 : 1, high = f === 1 ? 2.65 : isBrick ? 2.3 : 2.5;
            openings.push({ x: p[0], z: p[1], w: winW, y0: y + low, y1: y + high });
            bays.push({ u, v, w: winW, low, high });
          }
        }
      }
      if (f > 0 && recessedEnd) {
        const u = W / 2 - 2.25, v = frontAt(u), p = P(u, v);
        openings.push({ x: p[0], z: p[1], w: 0.9, y0: y + 1, y1: y + 2.2 });
        bays.push({ u, v, w: 0.9, low: 1, high: 2.2 });
      }
      if (f > 0) for (const e of endEdges) {
        const count = e.L > 11 ? 2 : 1;
        for (let j = 0; j < count; j++) {
          const at = e.L * (j + 1) / (count + 1);
          openings.push({ edge: e.edge, at, w: 1.4, y0: y + 1, y1: y + 2.4 });
          endWindow(e, at, y + 1, 1.4, 1.4);
        }
      }
      K.polyWalls(poly, y, next, { mat: f === 0 ? 0xa29c8b : facadeMat, inner: f === 0 ? 0xd9ccb3 : 0xe6e2d5, thick: 0.24, openings });
      bays.forEach(({ u, v, w, low, high }, wi) => {
        const sg = Math.sign(v), frame = isBrick ? 0xe8e8e2 : 0x4a4f52;
        box(u, y + low, v - sg * 0.04, w, high - low, 0.035, { tex: 'glass', color: 0x88a8a5 }, { solid: true });
        for (const du of (isBrick || w < 1 ? [-w / 2, w / 2] : [-w / 2, 0, w / 2])) face(u + du, y + low - 0.04, v + sg * 0.015, 0.065, high - low + 0.08, frame);
        for (const h of [low, high]) face(u, y + h - 0.035, v + sg * 0.015, w + 0.10, 0.07, frame);
        if (f >= 2 && wi % 7 === 0) {
          // Sparse condensers beside the window, below the upper signbox.
          box(u + w / 2 + 0.43, y + 1.05, v + sg * 0.21, 0.64, 0.50, 0.40, 0xd4d3cc, { solid: false });
          face(u + w / 2 + 0.43, y + 1.12, v + sg * 0.42, 0.53, 0.33, 'banpo-shutter');
        }
      });
      // bp01/bp02: stacked individual signboxes dominate floors 1–3; the
      // building name is only a small door plaque. Unknown lettering uses the
      // reviewer-approved shop categories, never invented proper names.
      if (f >= 1 && f <= 4) {
        const left = -W / 2 + (n === 1 ? 7.8 : 0.3), right = mainRight - (n === 8 ? 5.6 : 0.3);
        const count = Math.max(1, Math.round((right - left) / 4.5)), step = (right - left) / count;
        const sy = [0, 3.25, 6.9, 10.4, 13.8][f], sh = f === 1 ? 0.8 : f === 4 ? 0.6 : 0.7;
        const generic = f === 1 ? ['안경', '미용실', '부동산', '생활상가'] : ['치과', '학원', '미용실', '부동산'];
        if (n === 7 && f === 1) box((left + right) / 2, 2.9, front + 0.225, right - left, 1.3, 0.15, 0xf2f2ee, { solid: false });
        for (let j = 0; j < count; j++) {
          if (f === 4 && j % 3 !== 0) continue;
          const u = left + (j + 0.5) * step;
          if (![u - step / 2 + 0.2, u + step / 2 - 0.2].every(t => K.pointInPoly(...P(t, front - 0.15), poly))) continue;
          let text = names[j] || generic[(j + n + f) % generic.length];
          let bg = n === 7 && f === 1 ? '#f2f2ee' : SIGN_COLORS[(j * 3 + n + f) % SIGN_COLORS.length];
          // The legible east-corner bands in bp01/bp02 are deliberately placed
          // here instead of repeating the bookshop on a guessed western bay.
          if (n === 3 && f === 2) {
            text = j === count - 1 ? '생명의말씀사 2F' : generic[j % generic.length];
            if (j === count - 1) bg = '#263d8c';
          }
          if (n === 3 && f === 1 && j === count - 1) { text = 'JEWELRY'; bg = '#2e6b46'; }
          if (n === 3 && f === 3 && j === 0) bg = '#e2662c';
          const standOff = isBrick ? 0.15 : 0.25, signV = front + standOff + 0.075;
          for (const du of [-1, 1]) box(u + du * (step - 0.55) / 2, sy - 0.04, front + standOff / 2, 0.05, 0.08, standOff, 0x666867, { solid: false });
          if (!(n === 7 && f === 1)) box(u, sy - sh / 2, signV, step - 0.3, sh, 0.15, Number(bg.replace('#', '0x')), { solid: false });
          sign(text, u, sy, signV + 0.085, step - 0.3, sh, bg, { fg: bg === '#f2f2ee' ? '#303638' : '#ffffff', offset: 0.01 });
          if (n === 3 && f === 2 && j === count - 1) box(u, sy - sh / 2 - 0.12, signV, step - 0.3, 0.12, 0.15, 0xb8322c, { solid: false });
        }
        // Short-edge signs use actual OSM edge normals, including the 8동
        // chamfer. These wrap the first 3m of each end at floors 1 and 2.
        if (f <= 2) for (const e of endEdges) {
          const frontStart = local(e.a)[1] > local(e.b)[1], at = frontStart ? 1.65 : e.L - 1.65;
          const [x, z] = edgePoint(e, at, 0.23), bg = n === 3 && f === 2 ? '#263d8c' : f === 1 ? '#f2f2ee' : '#2e6b46';
          const text = n === 3 ? f === 2 ? '생명의말씀사 2F' : 'JEWELRY' : names[0] || (f === 1 ? '생활상가' : '미용실');
          for (const du of [-1.3, 1.3]) {
            const [bx, bz] = edgePoint(e, at + du, 0.0775);
            K.box({ x: bx, y: sy - 0.04, z: bz, w: 0.05, h: 0.08, d: 0.155, rotY: e.rotY, mat: 0x666867, solid: false });
          }
          K.box({ x, y: sy - sh / 2, z, w: 3, h: sh, d: 0.15, rotY: e.rotY, mat: Number(bg.replace('#', '0x')), solid: false });
          K.sign(text, { x, y: sy, z, w: 3, h: sh, rotY: e.rotY, bg, fg: bg === '#f2f2ee' ? '#303638' : '#ffffff', offset: 0.085 });
        }
      }
      // Structural cores, partitions and guarded wells exist before lazy furnishing.
      if (f > 0) {
        wall(-3.65, -1.82, 4.55, -1.82, y, y + 1.05, { thick: 0.055, mat: 0xa2a4a2 });
        wall(4.55, -6.35, 4.55, -1.82, y, y + 1.05, { thick: 0.055, mat: 0xa2a4a2 });
      }
      wall(-5.75, -6.55, 4.7, -6.55, y, next, { mat: 0xf0efea, thick: 0.12 });
      wall(4.72, -6.55, 4.72, -1.8, y, next, { mat: 0xf0efea, thick: 0.12 });
      wall(5.1, -1.65, 8.5, -1.65, y, ceiling, { mat: 0xe8e6df, openings: [{ at: 1.1, w: 1.3, y0: y, y1: y + 2.15 }] });
      wall(8.5, back + 0.35, 8.5, -1.65, y, ceiling, { mat: 0xe8e6df });
      wall(5.1, back + 0.35, 5.1, -1.65, y, ceiling, { mat: 0xe8e6df });
      wall(5.2, back + 2, 7.25, back + 2, y, y + 2.1, { mat: 0xc7ccc9, openings: [{ at: 0.9, w: 1, y0: y, y1: y + 2.1 }] });

      let serial = 0, namedIndex = 0;
      const rooms = [];
      for (const side of [1, -1]) {
        const minV = side > 0 ? corridorHalf : back + 0.45, maxV = side > 0 ? front - 0.35 : -corridorHalf;
        const spans = [[-W / 2 + (n === 1 ? 7.8 : 0.65), -6.15], [side < 0 ? 9 : 6.15, W / 2 - (n === 8 ? 2.6 : 0.65)]];
        for (const [start, end] of spans) {
          if (end - start < 2.1) continue;
          const targetW = f === 0 ? 5.6 : n === 5 && f === 1 && side < 0 ? 3.6 : f >= 2 ? 6.4 : 6.2;
          const count = Math.max(1, Math.round((end - start) / targetW));
          for (let j = 0; j < count; j++) {
            const a = start + (end - start) * j / count, q = start + (end - start) * (j + 1) / count, mid = (a + q) / 2;
            if (!rect(a + 0.2, minV + 0.1, q - 0.2, maxV - 0.1).every(p => K.pointInPoly(...p, poly))) continue;
            let name = names[namedIndex++] || '', kind;
            // Photo37 positively places this cluster in 4동; preserve its facing pair.
            if (f === 0 && n === 4 && end === -6.15) {
              const sequence = side > 0 ? ['동해횟집', '반포교집', '반포갈비'] : ['5092 치킨&호프', '4동 노래연습장', '담은'];
              name = sequence[j] || name;
            }
            if (f === 0 && n === 4 && start > 0) name = (side > 0 ? ['하얀집', '정선 감자탕', '식당'] : ['충무할매김밥', '하림', '장터순대국'])[j] || name;
            if (f === 0 && n === 5 && side < 0 && start > 0 && j === 0) name = '주점';
            if (f === 1 && n === 5 && side > 0 && j === 0 && start < 0) name = '리스본 안경';
            const hasTenant = !!name;
            if (f === 0) kind = /노래/.test(name) ? 'karaoke' : 'restaurant';
            else if (/안경/.test(name)) kind = 'optical';
            else if (/치과|의원|의학과/.test(name)) kind = 'clinic';
            else if (/베스트샵/.test(name)) kind = 'electronics';
            else if (/기업은행/.test(name)) kind = 'bank';
            else if (/공인중개/.test(name)) kind = 'estate';
            else if (/KFC/.test(name)) kind = 'restaurant';
            else if (/GS25/.test(name)) kind = 'grocery';
            else if (/서비스센터/.test(name)) kind = 'office';
            else if (/학원|어학|에듀|수학/.test(name)) kind = 'classroom';
            else if (/말씀사/.test(name)) kind = 'bookshop';
            else if (name) kind = 'salon';
            else kind = f === 1 ? ['grocery', 'laundry', 'grocery', 'estate'][serial % 4] : f === 3 && tenant.clinic ? 'clinic' : f >= 2 ? 'classroom' : 'office';
            if (!name) name = f === 0 ? '식당' : kind === 'grocery' ? ['반찬 · 식품', '떡 · 한과', '정육'][serial % 3] : kind === 'laundry' ? '세탁 · 수선' : kind === 'estate' ? '부동산' : kind === 'classroom' ? '강의실' : '사무실';
            const room = f === 0 ? `지하 ${serial + 1}호` : `${f * 100 + serial + 1}호`;
            const atCorridor = side > 0 ? minV : maxV, inwardRot = side > 0 ? angle + PI : angle;
            const frontMat = f === 0 ? name === '담은' ? 'banpo-white-brick' : name === '하트타임' ? 'banpo-brick' : name === '우고집' ? 0x25282a : /노래/.test(name) ? 0x403d3b : 'glass' : kind === 'classroom' ? 0xeeeae3 : 'glass';
            wall(a, minV, a, maxV, y, ceiling, { mat: f === 0 ? 0xd5c8b6 : 0xeceae5, thick: 0.12 });
            wall(a, atCorridor, q, atCorridor, y, ceiling, { mat: frontMat, thick: 0.08, openings: [{ at: (q - a) / 2, w: kind === 'classroom' ? 1.8 : 1.5, y0: y, y1: y + 2.15 }] });
            if (kind === 'clinic') wall(q - 1.7, minV + 0.2, q - 1.7, maxV - 1.5, y, ceiling, { mat: 0xe5e9e4, openings: [{ at: 1.4, w: 1.2, y0: y, y1: y + 2.2 }] });
            const C = { n, f, y, ceiling, a: a + 0.15, q: q - 0.15, va: minV + 0.1, vb: maxV - 0.1, side, name, kind, serial, angle, P, rect, box, sign, person, seat };
            rooms.push({ ...C, room, mid, atCorridor, inwardRot, hasTenant });
            if (kind === 'optical') {
              box(mid, 2.6, front + 0.06, q - a - 0.12, 0.4, 0.1, 0xe7e7df, { solid: false });
              sign('리스본 안경', mid, 2.8, front + 0.13, q - a - 0.3, 0.32, '#ecece6', { fg: '#313739', offset: 0.02 });
              for (const du of [-0.14, 0.14]) { const pp = P(mid - (q-a)/2 + 0.55 + du, front + 0.19); K.dome({ x: pp[0], y: 2.81, z: pp[1], rx: 0.12, ry: 0.1, rz: 0.02, mat: 0xb52632, seg: 10, rings: 4 }); }
            }
            // Interior floor finish and low ceiling are structural, not lazy.
            if (f === 0) {
              const timber = /아리수|담은|숙이네|동해/.test(name);
              K.hpoly(timber ? { tex: 'wood', color: 0xb79363 } : 'banpo-b1-tile', rect(a + 0.12, minV + 0.1, q - 0.12, maxV - 0.1), y + 0.008);
            }
            serial++;
          }
          if ([P(end, minV), P(end, maxV)].every(p => K.pointInPoly(...p, poly))) wall(end, minV, end, maxV, y, ceiling, { mat: 0xe7e4dc, thick: 0.12 });
        }
      }

      furnish.push(() => {
        // 60cm speckled floor, low acoustic ceiling and strip fittings at 3m rhythm.
        for (let u = -W / 2 + 2; u < W / 2 - 1.5; u += 3) {
          if (!K.pointInPoly(...P(u, 0), poly)) continue;
          box(u, ceiling - 0.085, 0, 0.32, 0.055, f >= 2 ? 1.1 : 1.35, 0xbfc2be, { solid: false });
          for (const du of [-0.085, 0.085]) box(u + du, ceiling - 0.1, 0, 0.045, 0.025, f >= 2 ? 0.95 : 1.2, { tex: 'emit', color: 0xf9fff5 }, { solid: false });
          if (f === 0) {
            box(u, ceiling - 0.02, 0, 0.025, 0.018, 3.15, 0xbdbdb5, { solid: false });
            if (Math.round(u) % 2 === 0) box(u + 0.75, ceiling - 0.16, 0.8, 0.07, 0.13, 0.07, 0x3a3b3c, { solid: false });
          }
        }
        sign([`${n}동  ${f === 0 ? '지하 1층' : f + '층'}`, f === 0 ? '식당가  ·  출구 ↑' : '계단 ←   승강기 →'], -1.6, y + 2.13, 1.6, 3.4, 0.34, '#f2f0e8', { fg: '#344e46', twoSided: true });
        sign('비상구 →', 4.8, y + 2.17, 0, 0.85, 0.24, '#318c68', { rotY: angle + PI / 2, twoSided: true });
        sign('화장실', 6.2, y + 2.2, -1.55, 1.05, 0.25, '#394d51');
        box(-5.45, y + 0.1, -1.55, 0.22, 0.56, 0.22, 0xb7332c);
        box(7.7, y + 0.7, -2.5, 0.65, 0.17, 0.55, 0xe8e7db);
        box(8.35, y + 1.1, -2.65, 0.04, 0.8, 0.7, 0xa1c0be, { solid: false });
        box(6.1, y, back + 1.1, 0.6, 0.45, 0.8, 0xe8e7db);
        for (const R of rooms) {
          const { a, q, mid, side, name, kind, room, atCorridor, inwardRot, hasTenant, serial } = R;
          const facing = { rotY: inwardRot, twoSided: true };
          for (const u of [mid - 0.8, mid + 0.8]) box(u, y, atCorridor, 0.05, 2.15, 0.08, f === 0 ? 0x504638 : 0xb8bab6, { solid: false });
          box(mid, y + 2.12, atCorridor, 1.65, 0.045, 0.08, 0xb6b7af, { solid: false });
          if (!(f === 0 || kind === 'optical' || kind === 'classroom')) sign(hasTenant ? name : [room, name], mid, y + 2.4, atCorridor, q - a - 0.15, 0.45, PALETTE[(serial + n) % PALETTE.length], facing);
          sign(room, a + 0.42, y + 1.4, atCorridor, 0.6, 0.22, '#e5e1d7', { fg: '#494b48', ...facing });
          if (f === 0) buildPhotoRestaurant(K, R);
          else if (!buildPhotoUpper(K, R)) fixtures(kind, a, q, R.va, R.vb, y, name, serial, side);
          if (f !== 0 && kind !== 'classroom') box(mid, ceiling - 0.08, (R.va + R.vb) / 2, 0.8, 0.05, 0.4, { tex: 'emit', color: 0xfff4df }, { solid: false });
        }
        if (f >= 2) {
          sign([`${f}층 안내`, ...names, '계단 · 승강기'], -2.3, y + 1.65, front - 0.2, 2.4, 1.4, '#f2f0e8', { fg: '#364953', rotY: angle + PI });
          for (const u of [-4.8, -4.05]) seat(u, y, front - 1.5, 0x696e6a);
          box(-2.3, y, front - 1.4, 1.5, 0.7, 0.55, 0xbca98c);
          for (let j = 0; j < 4; j++) box(-2.8 + j * 0.3, y + 0.7, front - 1.4, 0.23, 0.025, 0.3, [0xc4b088, 0x99acb8][j % 2], { solid: false });
        }
        if (f === 1) {
          // Photo10: six individually ruled storeys; known names only, not filler text.
          const guideNames = n === 4 ? [ ['5F', '마루정신건강의학과'], ['4F', '학원 · 사무실'], ['3F', '학원 · 사무실'], ['2F', '장솔학원'], ['1F', 'KFC  ·  라시앤느헤어'], ['B1', '동해횟집  ·  담은  ·  반포갈비', '하얀집  ·  반포교집  ·  하림'] ] : [['5F', ...(tenant.fifth || [])], ['4F', ...(tenant.fourth || [])], ['3F', tenant.clinic || '학원 · 사무실'], ['2F', ...tenant.h], ['1F', ...tenant.g], ['B1', ...names]];
          box(-2.15, y + 0.2, front - 0.2, 2.25, 2.6, 0.07, 0xd7d9d7, { solid: false });
          sign(`${n}동 층별 안내`, -2.15, y + 2.64, front - 0.25, 2.12, 0.26, '#efefeb', { fg: '#243971', rotY: angle + PI });
          guideNames.forEach((row, i) => sign(row, -2.15, y + 2.3 - i * 0.37, front - 0.26, 2.12, 0.34, i % 2 ? '#e6e9e7' : '#f7f7f1', { fg: '#293a50', rotY: angle + PI }));
          box(-2.15, y + 2.85, front - 0.6, 1, 0.05, 0.3, { tex: 'emit', color: 0xfcfff1 }, { solid: false });
        }
        if (f === 0) {
          const dirNames = n === 4 ? ['동해횟집', '4동노래방', '장터순대국', '5092호프', '반포교집', '담은', '하얀집', '하림', '반포갈비'] : n === 6 ? ['아리수포차', '그집', '기린부동산', '아리수포차', '싼타페', '미용실'] : n === 5 ? ['노래방', '하트타임', '숙이네', '우고집', '서래곱창', '터미널포차', '일번지'] : ['충무할매김밥', '만끽치킨', '배부장찌개', '온유월식당', '우고집', '반포대교', '명불허전'];
          // At the stair turn, panels face the descending flight. The wall is 4.25m wide.
          sign('지하상가 안내', 4.37, -0.95, -4.12, 4.1, 0.28, '#b65340', { rotY: angle - PI / 2 });
          const panels = n === 4 ? dirNames : [...dirNames, ...dirNames].slice(0, n === 6 ? 7 : 12);
          panels.forEach((text, j) => sign(Array.from(text), 4.37, -1.68, -6.12 + (j + 0.5) * 4 / panels.length, 4 / panels.length - 0.015, 1.12, '#f6f3e9', { fg: ['#a9332e', '#233d71', '#285a42'][j % 3], rotY: angle - PI / 2 }));
          sign('← 나가는 곳', 4.35, -2.62, -4.15, 1.1, 0.22, '#28795d', { rotY: angle - PI / 2 });
          // Additional low arrival directory gives each basement an identifiable landing.
          if (n !== 7) sign([`${n}동 지하상가 안내`, ...dirNames], -2.25, y + 1.45, front - 0.22, 2.6, 1.8, '#edece4', { fg: '#343d40', rotY: angle + PI });
          if (n === 7) {
            box(-4.65, y, front - 0.2, 1.9, 2.4, 0.12, 'banpo-b1-tile', { solid: false });
            sign(['반포쇼핑 7동 지하상가 안내', '01  지하상가', '02  우마루', '03  식당가'], -4.65, y + 1.65, front - 0.29, 1.7, 0.95, '#2b3135', { rotY: angle + PI });
            sign('← 출구', -4.65, y + 0.35, front - 0.3, 0.4, 0.16, '#32886e', { rotY: angle + PI });
            face(-1.7, y + 0.85, front - 0.3, 2.4, 1.05, 'banpo-plan');
          }
        }
        for (let u = -W / 2 + 5; u < W / 2 - 2; u += 14) if (Math.abs(u) > 8 && K.pointInPoly(...P(u, 0.55), poly)) person(u, y, 0.55, { shirt: [0xe5e0d7, 0x445a6b, 0x313438][(f + n) % 3] });
      });
      K.detail({ floor: labels[f], y0: y, y1: next, poly, name: `${n}동 ${labels[f]} 실내` }, () => furnish.forEach(fn => fn()));
    });

    for (const end of [-1, 1]) {
      const u = end < 0 ? -W / 2 + (n === 1 ? 8 : 0.7) : mainRight - (n === 8 ? 5.8 : 0.7);
      const v = front + 0.65;
      for (const yy of [8, 10.5]) box(u, yy, front + 0.3, 0.05, 0.06, 0.6, 0x666867, { solid: false });
      box(u, 7.8, v, 0.15, 3, 0.6, 0xf2f2ee, { solid: false });
      sign(end < 0 ? ['미', '용', '실'] : ['치', '과'], u, 9.3, v, 0.6, 3, end < 0 ? '#2e6b46' : '#e2662c', { rotY: angle + PI / 2, offset: 0.09, twoSided: true });
    }

    // One continuous switchback stair links every level. Its midpoint landing
    // is inside the floor hole. Near landings are intact pieces of the main slab.
    for (let f = 0; f < floorYs.length - 1; f++) {
      const y = floorYs[f], next = floorYs[f + 1], half = (y + next) / 2;
      const a = P(-3.8, -2.9), b = P(2.55, -2.9), d = P(2.55, -5.25), e = P(-3.8, -5.25);
      K.stairs(...a, ...b, { ya: y, yb: half, w: 1.8, mat: 'banpo-terrazzo', railWalls: false });
      K.slab(rect(2.5, -6.2, 4.48, -1.95), half, { mat: 'banpo-terrazzo', thick: 0.15 });
      K.stairs(...d, ...e, { ya: half, yb: next, w: 1.8, mat: 'banpo-terrazzo', railWalls: false });
      for (const [ua, ub, v, ya, yb] of [[-3.8, 2.55, -2.9, y, half], [2.55, -3.8, -5.25, half, next]]) {
        const steps = Math.ceil((yb - ya) / 0.17);
        for (let k = 1; k <= steps; k++) box(ua + (ub - ua) * k / steps, ya + (yb - ya) * k / steps + 0.005, v, 0.045, 0.012, 1.77, 0x34393a, { solid: false });
      }
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
    // Retain the existing per-storey doorways and K.elevator interaction.
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
    // Roof paint is read from bp_west/bp_34/bp_67/bp_east. 1/2 retain
    // their existing roof finish, pending an unambiguous closer aerial.
    const roofMat = [3, 4, 6, 8].includes(n) ? 0x5f9a6e : [5, 7].includes(n) ? 0xc9c9c3 : 'roofgravel';
    K.slab(poly, roof, { mat: roofMat, under: 'ceiling', thick: 0.25, edge: false });
    K.polyWalls(poly, roof, roof + 0.65, { mat: facadeMat, thick: 0.2 });
    box(0, roof, -4, 3, 2.6, 3, 0xd0ceca);
    box(0, roof + 2.6, -4, 3.15, 0.10, 3.15, roofMat, { solid: false });
    // Plain condensers and a compact tank: fixture identities/positions cannot
    // be resolved in the aerials, so their repeated layout remains a guess.
    for (const [u, v] of [[-W / 2 + 5, -1.8], [W / 2 - 6, -2.7], [W / 2 - 8, -2.7]]) {
      if (!rect(u - 0.7, v - 0.5, u + 0.7, v + 0.5).every(p => K.pointInPoly(...p, poly))) continue;
      box(u, roof, v, 1.1, 0.1, 0.7, 0xa8aaa5, { solid: false });
      box(u, roof + 0.1, v, 1.25, 0.7, 0.85, 0xd8d8d1, { solid: false });
      face(u, roof + 0.21, v + 0.43, 1.05, 0.42, 'banpo-shutter');
    }
    const tank = P(3.1, -4);
    K.cyl({ x: tank[0], y: roof, z: tank[1], r: 0.65, h: 1.15, seg: 10, mat: 0xb7bdbb, solid: false });
    for (const end of [-1, 1]) {
      const count = n === 3 && end > 0 ? 6 : 3;
      const endU = end * (W / 2 - (n === 1 && end < 0 ? 8 : n === 8 && end > 0 ? 7 : 3));
      for (let j = 0; j < count; j++) {
        const u = endU - end * (j % 3) * 1.1, v = frontAt(u) - 1.2 - Math.floor(j / 3) * 1.1;
        const p = P(u, v);
        if (!K.pointInPoly(...p, poly)) continue;
        K.cyl({ x: p[0], y: roof, z: p[1], r: 0.05, h: 3, seg: 6, mat: 0xeeeeea, solid: false });
        for (let k = 0; k < 1 + j % 3; k++) {
          const a = angle + k * 2 * PI / 3, px = p[0] + Math.sin(a) * 0.18, pz = p[1] + Math.cos(a) * 0.18;
          K.box({ x: px, y: roof + 1.55, z: pz, w: 0.3, h: 1.3, d: 0.1, rotY: a, mat: 0xeeeeea, solid: false });
        }
      }
    }

    if (n === 7) {
      // bp_67: detached 15×7m single-storey pavilion in front of 7동.
      // The 1.19m passage behind it is left clear; signage is unreadable.
      const [pu, pv] = local([209.5, -228.5]);
      K.slab(rect(pu - 7.5, pv - 3.5, pu + 7.5, pv + 3.5), 0.025, { mat: 0xb9b8b2, thick: 0.06, ceil: false });
      const door = P(pu, pv + 3.5);
      K.polyWalls(rect(pu - 7.5, pv - 3.5, pu + 7.5, pv + 3.5), 0, 3.05,
        { mat: 0xb9bbb7, thick: 0.15, openings: [{ x: door[0], z: door[1], w: 1.8, y0: 0, y1: 2.45 }] });
      box(pu, 3.05, pv, 15, 0.15, 7, 0x4a4d4f, { solid: false });
      box(pu, 2.5, pv + 3.6, 15, 0.55, 0.15, 0xd8d8d2, { solid: false });
      // Light sign band only; no invented shop name or canopy.
      const lotCenter = local([171.5, -233.5]), [lu, lv] = lotCenter;
      K.slab(rect(lu - 9.5, lv - 9, lu + 9.5, lv + 9), 0.02, { mat: 'asphalt', thick: 0.05, ceil: false });
      for (const side of [-1, 1]) {
        for (let j = 0; j <= 5; j++) box(lu + side * 6.5, 0.024, lv - 6.75 + j * 2.7, 5, 0.008, 0.07, 0xe1dfd4, { solid: false });
        for (let j = 0; j < 5; j++) {
          const p = P(lu + side * 6.5, lv - 5.4 + j * 2.7);
          K.vehicle({ x: p[0], y: 0.02, z: p[1], kind: 'car', rotY: angle + side * PI / 2,
            color: [0xe4e4e1, 0x303438, 0xb1b3b3, 0xeeeeea, 0x6c7478][(j + (side > 0 ? 1 : 0)) % 5] });
        }
      }
    }
    person(-2.6, 0.025, front + 2.7); person(9.8, 0.025, front + 1.7, { shirt: 0x9e7055 });
    const spawn = (name, u, y, v, yaw = angle) => { const p = P(u, v); K.spawn({ name, x: p[0], y, z: p[1], yaw }); };
    if ([1, 4, 8].includes(n)) spawn(`${n}동 앞 · 신반포로`, -1.5, 0.025, front + 3.0);
    if (n === 2) spawn('2동 · LG전자 서비스센터', -6.8, 4, 0, angle + PI / 2);
    if (n === 3) spawn('3동 · 지하 식당가', -6.8, -6, 0, angle + PI / 2);
    if (n === 5) spawn('5동 · 일번지육개장', -6.8, -6, 0, angle + PI / 2);
    if (n === 6) spawn('6동 · 반포좋은치과의원', -6.8, 7.5, 0, angle + PI / 2);
    if (n === 8) spawn('8동 · 5층 학원가', -6.8, 14.5, 0, angle + PI / 2);
    if (n === 4) { spawn('4동 · 담은 앞 지하통로', -7.4, -6, 0, angle + PI / 2); spawn('4동 · 장솔학원 복도', -W / 2 + 4, 4, 0, angle + PI); }
    if (n === 6) spawn('6동 · 아리수포차 지하통로', -W / 2 + 4, -6, 0, angle + PI);
    if (n === 7) spawn('7동 · 지하 안내판', -4.7, -6, front - 3, angle + PI);
  });
}
