// Vector map. Geometry, label metrics and collision storage are prepared once;
// the full-map base is invalidated only by view/layer changes, not player motion.
export function createMap({ THREE, K, osm, player, phys, spawns, places, container, zoneAt }) {
  const link = document.createElement('link');
  link.rel = 'stylesheet'; link.href = new URL('../css/map.css', import.meta.url).href;
  document.head.appendChild(link);
  const FONT = '"Noto Sans KR", "Apple SD Gothic Neo", sans-serif';
  const TAU = Math.PI * 2, MIN_ZOOM = 0.22, MAX_ZOOM = 12;
  const zones = K?._?.zonesList || [], elevators = K?._?.elevators || [];
  spawns = spawns || K?._?.spawns || []; places = places || [];
  const bounds = osm.bbox || [-950, -1450, 1000, 700];
  const pointIn = K?.pointInPoly || function (x, z, poly) {
    let yes = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const a = poly[i], b = poly[j];
      if ((a[1] > z) !== (b[1] > z) && x < (b[0] - a[0]) * (z - a[1]) / (b[1] - a[1]) + a[0]) yes = !yes;
    }
    return yes;
  };
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  const el = (tag, cls, text, parent) => {
    const node = document.createElement(tag); if (cls) node.className = cls;
    if (text) node.textContent = text; if (parent) parent.appendChild(node); return node;
  };
  const icons = {
    map: '<path d="m3 5 6-2 6 2 6-2v16l-6 2-6-2-6 2V5Zm6-2v16m6-14v16"/>',
    search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
    close: '<path d="m6 6 12 12M18 6 6 18"/>',
    locate: '<circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/><path d="M12 2v3m0 14v3M2 12h3m14 0h3"/>',
    arrow: '<path d="m9 5 7 7-7 7"/>',
    pin: '<path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z"/><circle cx="12" cy="10" r="2"/>',
    list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.1M3 12h.1M3 18h.1"/>',
    north: '<path d="m12 3 6 17-6-4-6 4 6-17Z"/>'
  };
  function icon(name) {
    const span = document.createElement('span');
    span.innerHTML = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name]}</svg>`;
    return span.firstChild;
  }
  function button(parent, label, cls, action, glyph) {
    const b = el('button', cls, glyph ? '' : label, parent); b.type = 'button';
    b.setAttribute('aria-label', label); b.title = label; if (glyph) b.appendChild(icon(glyph));
    b.addEventListener('click', action); return b;
  }
  const miniWrap = el('div', 'gt-mini', '', container);
  const mini = el('canvas', '', '', miniWrap); mini.id = 'minimap';
  mini.setAttribute('aria-label', '현재 위치 주변 지도');
  const miniOpen = button(miniWrap, '전체 지도 열기', 'gt-mini-open', toggle);
  miniOpen.replaceChildren();
  const miniFloor = el('span', '', '지상', miniOpen); miniFloor.id = 'map-mini-floor';
  el('span', '', '↗', miniOpen);
  const miniZoom = el('div', 'gt-mini-zoom', '', miniWrap);
  button(miniZoom, '미니맵 확대', '', () => changeMini(1), null).textContent = '+';
  button(miniZoom, '미니맵 축소', '', () => changeMini(-1), null).textContent = '−';
  const miniCaption = el('span', 'gt-mini-caption', '주변 지도', miniWrap);
  const full = el('div', 'gt-map', '', container); full.id = 'map-full'; full.hidden = true;
  full.setAttribute('role', 'dialog'); full.setAttribute('aria-modal', 'true'); full.setAttribute('aria-label', '고속터미널 지도');
  const header = el('header', 'gt-header', '', full);
  const brand = el('div', 'gt-brand', '', header), brandIcon = el('span', 'gt-brand-icon', '', brand); brandIcon.appendChild(icon('map'));
  const brandCopy = el('div', 'gt-brand-copy', '', brand); el('b', '', '고속터미널 지도', brandCopy); el('small', '', '골목부터 실내까지, 한눈에', brandCopy);
  const headerContext = el('div', 'gt-header-context', '서울특별시 서초구 · 반포동', header);
  const closeButton = button(header, '지도 닫기', 'gt-close', toggle, 'close');
  const side = el('aside', 'gt-sidebar', '', full); side.id = 'map-sidebar';
  el('h2', '', '어디로 가볼까요?', side); el('p', 'gt-muted', '장소를 찾아 지도를 둘러보세요.', side);
  const searchWrap = el('div', 'gt-search', '', side); searchWrap.appendChild(icon('search'));
  const search = el('input', '', '', searchWrap); search.id = 'map-search'; search.type = 'search'; search.placeholder = '장소, 매장, 출발 지점 검색'; search.setAttribute('aria-label', '장소 검색'); search.autocomplete = 'off';
  const section = el('div', 'gt-panel-section', '', side);
  const sectionTitle = el('div', 'gt-section-title', '바로 가기', section);
  const results = el('div', 'gt-results', '', side); results.id = 'map-results';
  const panelFoot = el('div', 'gt-panel-foot', '', side); el('b', '', '지도로 먼저 둘러보기', panelFoot); el('span', '', '장소 선택 후 이동할 수 있어요.', panelFoot);
  const work = el('main', 'gt-workspace', '', full);
  const canvas = el('canvas', '', '', work); canvas.id = 'map-canvas'; canvas.tabIndex = 0; canvas.setAttribute('aria-label', '지도. 드래그로 이동, 휠로 확대. 두 번 클릭하면 이동합니다.');
  const live = el('canvas', '', '', work); live.id = 'map-live'; live.setAttribute('aria-hidden', 'true');
  const topbar = el('div', 'gt-topbar', '', work), layerBox = el('div', 'gt-layers', '', topbar); layerBox.setAttribute('aria-label', '지도 레이어');
  const layerButtons = [];
  for (const [id, text] of [['surface', '지상'], ['underground', '지하 B1'], ['floor', '층별']]) {
    const b = button(layerBox, text, '', () => setLayer(id)); b.dataset.layer = id; b.setAttribute('aria-pressed', String(id === 'surface')); layerButtons.push(b);
  }
  const areaPill = el('div', 'gt-area-pill', '고속터미널역 주변', topbar);
  const floorCard = el('div', 'gt-floor-card', '', work); floorCard.hidden = true;
  const buildingName = el('b', '', '건물을 선택하세요', floorCard); buildingName.id = 'map-building-name';
  const floorHint = el('p', '', '지도 위 건물에 마우스를 올리거나 눌러보세요.', floorCard);
  const floorSelect = el('select', '', '', floorCard); floorSelect.id = 'map-floor-select'; floorSelect.setAttribute('aria-label', '층 선택'); floorSelect.hidden = true;
  const compass = button(work, '북쪽 기준 지도', 'gt-compass', () => { announce('북쪽이 위인 지도입니다.'); }, 'north'); el('span', '', 'N', compass);
  const controls = el('div', 'gt-controls', '', work);
  button(controls, '확대', '', () => zoomAt(1.5, view.w / 2, view.h / 2)).textContent = '+';
  button(controls, '축소', '', () => zoomAt(1 / 1.5, view.w / 2, view.h / 2)).textContent = '−';
  button(controls, '현재 위치', '', locate, 'locate');
  const legend = el('div', 'gt-legend', '', work);
  for (const [cls, name] of [['detail', '실내 탐색'], ['park', '공원'], ['exit', '지하철 출구'], ['bus', '버스'], ['food', '음식점'], ['cafe', '카페']]) {
    const item = el('span', '', '', legend); el('i', cls, '', item); item.appendChild(document.createTextNode(name));
  }
  const bottom = el('div', 'gt-bottomline', '', work), scaleBox = el('div', 'gt-scale', '', bottom);
  const scaleText = el('span', '', '', scaleBox); scaleText.id = 'map-scale-text';
  const scaleBar = el('div', '', '', scaleBox); scaleBar.id = 'map-scale-bar';
  const attribution = el('div', 'gt-attribution', '', bottom); attribution.appendChild(document.createTextNode('지도 데이터 © '));
  const osmLink = el('a', '', 'OpenStreetMap', attribution); osmLink.href = 'https://www.openstreetmap.org/copyright'; osmLink.target = '_blank'; osmLink.rel = 'noopener noreferrer';
  const tip = el('div', 'gt-tip', '드래그로 탐색 · 두 번 클릭하여 이동', work);
  const selection = el('div', 'gt-selection', '', work); selection.hidden = true;
  button(selection, '선택 해제', 'gt-dismiss', () => { selected = null; selection.hidden = true; liveDirty = true; }, 'close');
  const selectedType = el('div', 'gt-selection-type', '', selection), selectedTitle = el('h3', '', '', selection), selectedDetail = el('p', '', '', selection);
  const teleportButton = button(selection, '여기로 이동', 'gt-teleport', () => { if (selected) teleportTo(selected, false); });
  const status = el('div', 'gt-status', '', work); status.setAttribute('role', 'status'); status.setAttribute('aria-live', 'polite');
  const panelToggle = button(work, '장소 목록 열기', 'gt-panel-toggle', () => {
    const expanded = full.classList.toggle('panel-open'); panelToggle.setAttribute('aria-expanded', String(expanded));
    panelToggle.setAttribute('aria-label', expanded ? '장소 목록 닫기' : '장소 목록 열기');
  }, 'list'); el('span', '', '장소 찾기', panelToggle); panelToggle.setAttribute('aria-expanded', 'false'); panelToggle.setAttribute('aria-controls', side.id);

  const g = canvas.getContext('2d'), lg = live.getContext('2d'), mg = mini.getContext('2d');
  const metric = document.createElement('canvas').getContext('2d');
  // No Path2D, array, object or text metric creation in the animation loop.
  const makePath = (poly, holes, close = true) => {
    const p = new Path2D();
    function add(points) { if (!points?.length) return; p.moveTo(points[0][0], points[0][1]); for (let i = 1; i < points.length; i++) p.lineTo(points[i][0], points[i][1]); if (close) p.closePath(); }
    add(poly); if (holes) for (const h of holes) add(h); return p;
  };
  function record(poly, holes) {
    let x0 = Infinity, z0 = Infinity, x1 = -Infinity, z1 = -Infinity, area = 0, cx = 0, cz = 0;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const a = poly[j], b = poly[i], cross = a[0] * b[1] - b[0] * a[1]; area += cross; cx += (a[0] + b[0]) * cross; cz += (a[1] + b[1]) * cross;
      x0 = Math.min(x0, b[0]); z0 = Math.min(z0, b[1]); x1 = Math.max(x1, b[0]); z1 = Math.max(z1, b[1]);
    }
    cx = Math.abs(area) > 0.01 ? cx / (3 * area) : (x0 + x1) / 2; cz = Math.abs(area) > 0.01 ? cz / (3 * area) : (z0 + z1) / 2;
    // Concave footprints can have an outside centroid. Prefer a point on an interior scanline.
    if (!pointIn(cx, cz, poly)) { outer: for (let iz = 1; iz < 10; iz++) for (let ix = 1; ix < 10; ix++) { const x = x0 + (x1 - x0) * ix / 10, z = z0 + (z1 - z0) * iz / 10; if (pointIn(x, z, poly)) { cx = x; cz = z; break outer; } } }
    return { path: makePath(poly, holes), poly, x0, z0, x1, z1, x: cx, z: cz, area: Math.abs(area / 2) };
  }
  function label(text, x, z, size = 12, bold = false) {
    const font = `${bold ? 700 : 400} ${size}px ${FONT}`; metric.font = font;
    return { text, x, z, font, width: metric.measureText(text).width, size };
  }
  const placeIndex = new Map();
  for (const p of places) placeIndex.set(p.id, { id: p.id, name: p.name, zones: [], floors: [], spawns: [], x: 0, z: 0 });
  for (const z of zones) if (!placeIndex.has(z.place)) placeIndex.set(z.place, { id: z.place, name: z.name, zones: [], floors: [], spawns: [], x: 0, z: 0 });
  for (const s of spawns) if (!placeIndex.has(s.place)) placeIndex.set(s.place, { id: s.place, name: s.group || s.name, zones: [], floors: [], spawns: [], x: s.x, z: s.z });
  const zoneRecords = zones.filter(z => z.poly?.length >= 3).map(z => {
    const r = Object.assign(record(z.poly), { source: z, place: z.place, floor: z.floor || '1F', y0: z.y0, y1: z.y1 });
    // name only on the plan (the sub line is long; it stays in search results and the HUD)
    r.label = label(z.name, r.x, r.z, 12, true);
    const p = placeIndex.get(z.place); p.zones.push(r);
    if (!p.floors.some(f => f.label === (z.floor || '1F'))) p.floors.push({ label: z.floor || '1F', y: z.y0 });
    return r;
  }).sort((a, b) => b.area - a.area);
  for (const s of spawns) placeIndex.get(s.place)?.spawns.push(s);
  const placeMarks = [];
  for (const p of placeIndex.values()) {
    p.floors.sort((a, b) => b.y - a.y);
    const r = p.zones.find(r => r.y0 >= -1) || p.zones[0]; p.surfaceZone = r; const s = p.spawns[0];
    if (r || s) { p.x = r ? r.x : s.x; p.z = r ? r.z : s.z; p.y = r ? r.y0 : s.y; p.label = label(p.name, p.x, p.z, 14, true); placeMarks.push(p); }
  }
  const claimed = new Set(K?._?.claims || []);
  for (const p of places) for (const id of p.claims || p.meta?.claims || []) claimed.add(id);
  const buildingRecords = (osm.buildings || []).filter(b => (b.layer || 0) >= 0).map(b => {
    const r = Object.assign(record(b.poly, b.holes), { name: b.name, id: b.id, detailed: claimed.has(b.id) });
    for (const p of placeMarks) {
      if ((b.name && (b.name.includes(p.name) || p.name.includes(b.name))) || p.zones.some(z => z.y0 >= -1 && pointIn(z.x, z.z, b.poly))) { r.detailed = true; r.place = p.id; break; }
    }
    r.label = b.name ? label(b.name, r.x, r.z, r.detailed ? 13 : 11, r.detailed) : null; return r;
  }).sort((a, b) => b.area - a.area);
  const areaRecords = (osm.areas || []).filter(a => a.poly?.length).map(a => {
    const r = record(a.poly, a.holes); r.color = /water|river/.test(a.kind) ? '#b8dbeb' : /park|forest|grass|garden|wood/.test(a.kind) ? '#d8e9cf' : /pitch/.test(a.kind) ? '#bddab6' : /parking/.test(a.kind) ? '#e3e5e2' : '#e7eadf';
    r.labelColor = /water|river/.test(a.kind) ? '#648eaa' : /park|forest|grass|garden|wood/.test(a.kind) ? '#56845c' : '#6d8177';
    r.label = a.name ? label(a.name, r.x, r.z, 12, true) : null; return r;
  }).sort((a, b) => b.area - a.area);
  const roadRecords = (osm.roads || []).filter(r => !r.tunnel && r.pts?.length > 1).map(r => {
    const b = record(r.pts); b.path = makePath(r.pts, null, false); b.width = r.width || 5; b.bridge = r.bridge;
    b.rank = /motorway|trunk/.test(r.hw) ? 4 : /primary/.test(r.hw) ? 3 : /secondary/.test(r.hw) ? 2 : /tertiary|residential|unclassified/.test(r.hw) ? 1 : 0;
    b.foot = /footway|path|cycleway|steps|pedestrian/.test(r.hw); b.color = b.rank >= 3 ? '#ffe5a0' : b.rank === 2 ? '#fff0c6' : b.foot ? '#f2eee7' : '#ffffff';
    let longest = 0, middle = 1;
    for (let i = 1; i < r.pts.length; i++) { const d = Math.hypot(r.pts[i][0] - r.pts[i - 1][0], r.pts[i][1] - r.pts[i - 1][1]); if (d > longest) { longest = d; middle = i; } }
    const a = r.pts[middle - 1], c = r.pts[middle]; b.length = longest; b.angle = Math.atan2(c[1] - a[1], c[0] - a[0]);
    b.label = r.name ? label(r.name, (a[0] + c[0]) / 2, (a[1] + c[1]) / 2, b.rank >= 2 ? 12 : 10, false) : null; return b;
  }).sort((a, b) => Number(a.bridge) - Number(b.bridge) || a.rank - b.rank);
  const roadNames = new Map();
  const roadLabels = roadRecords.filter(r => r.label).sort((a, b) => b.rank - a.rank || b.length - a.length);
  for (const r of roadLabels) {
    if (!roadNames.has(r.label.text)) roadNames.set(r.label.text, { frame: 0, x: 0, y: 0 });
    r.labelGroup = roadNames.get(r.label.text);
  }
  let labelFrame = 0;
  const exitRecords = (osm.exits || []).map(p => ({ ...p, text: String(p.ref || '출구'), label: label(`${p.ref || ''}번 출구`, p.x, p.z, 11) }));
  const busRecords = (osm.nodes || []).filter(p => p.k === 'bus_stop').map(p => ({ ...p, label: p.name ? label(p.name, p.x, p.z, 11) : null }));
  const kindNames = { restaurant: '음식점', cafe: '카페', fast_food: '음식점', bakery: '베이커리', convenience: '편의점', pharmacy: '약국', bank: '은행', toilets: '화장실', cinema: '영화관', supermarket: '마트', clothes: '의류', hotel: '호텔' };
  const poiRecords = (osm.pois || []).filter(p => p.name && p.kind !== 'platform' && p.kind !== 'stop_position' && p.kind !== 'subway_entrance').map(p => ({ ...p, color: /cafe|bakery/.test(p.kind) ? '#9b6c43' : /restaurant|food/.test(p.kind) ? '#e38354' : /pharmacy|hospital/.test(p.kind) ? '#418e7a' : '#8b79ac', label: label(p.name, p.x, p.z, 11), type: kindNames[p.kind] || '장소', indoorPlace: placeAt(p.x, p.z)?.id }));
  const elevatorRecords = elevators.map(e => ({ ...e, label: label(e.name, e.x, e.z, 10) }));
  const searchItems = [], searchKeys = new Set();
  function addSearch(item) {
    const key = `${item.name}/${item.x}/${item.z}/${item.y}`; if (searchKeys.has(key)) return; searchKeys.add(key);
    item.match = `${item.name} ${item.group || ''} ${item.floor || ''} ${item.sub || ''}`.normalize('NFKC').toLocaleLowerCase().replace(/\s/g, ''); searchItems.push(item);
  }
  for (const s of spawns) addSearch({ ...s, type: '출발 지점', exact: true });
  for (const p of placeMarks) addSearch({ name: p.name, x: p.x, z: p.z, y: p.y, place: p.id, type: '탐색 장소' });
  for (const r of zoneRecords) addSearch({ name: r.source.name, sub: r.source.sub, floor: r.floor, x: r.x, z: r.z, y: r.y0, place: r.place, type: '층별 공간', group: placeIndex.get(r.place)?.name });
  for (const p of poiRecords) addSearch({ name: p.name, x: p.x, z: p.z, y: p.level == null ? undefined : Number(p.level) < 0 ? (K?.LEVELS?.[`B${Math.abs(Number(p.level))}`] ?? Number(p.level) * 5) : undefined, type: p.type });
  for (const b of buildingRecords) if (b.name) addSearch({ name: b.name, x: b.x, z: b.z, type: '건물', place: b.place });

  const levelLabels = Object.entries(K?.LEVELS || { B1: -6, B2: -11, B3: -16, B4: -21, B5: -26, B6: -31 }).sort((a, b) => b[1] - a[1]);
  let floorLevel = 0;
  let open = false, dirty = true, liveDirty = true, layer = 'surface', floorPlace = null, floorLabel = '', selected = null;
  let previousFocus = null, miniClock = 1, miniZoomIndex = 2, miniFloorText = '', miniPlace = null, lastY = NaN;
  let lastPX = NaN, lastPZ = NaN, lastYaw = NaN, lastScale = NaN, lastHeaderZone = null, statusTimer;
  const miniScales = [0.42, 0.65, 0.95, 1.45, 2.2, 3.4];
  const view = { x: player.x, z: player.z, scale: 1.1, w: 1, h: 1, cos: 1, sin: 0, x0: 0, x1: 0, z0: 0, z1: 0, dpr: 1 };
  const mv = { x: 0, z: 0, scale: 1, w: 200, h: 200, cos: 1, sin: 0, x0: 0, x1: 0, z0: 0, z1: 0, dpr: 1 };
  const flight = { active: false, x: 0, z: 0, scale: 1.1 };
  let velocityX = 0, velocityZ = 0;
  const rects = new Float32Array(16000); let rectCount = 0;
  const arrowPath = new Path2D('M 0 -11 L 8 9 L 0 5 L -8 9 Z');
  const conePath = new Path2D('M 0 0 L -25 -44 Q 0 -56 25 -44 Z');
  const exitFont = `700 9px ${FONT}`, miniExitFont = `700 8px ${FONT}`, liftFont = `700 10px ${FONT}`;
  function elevatorOnFloor(e, isMini) {
    if (!isMini && layer === 'floor' && e.place !== floorPlace?.id) return false;
    for (const f of e.floors) if (isMini ? Math.abs(f.y - player.y) < 1 : layer === 'floor' ? f.label === floorLabel : Math.abs(f.y + 6) < 1) return true;
    return false;
  }
  function sx(v, x, z) { return v.w / 2 + ((x - v.x) * v.cos - (z - v.z) * v.sin) * v.scale; }
  function sy(v, x, z) { return v.h / 2 + ((x - v.x) * v.sin + (z - v.z) * v.cos) * v.scale; }
  function visible(r, v) { return r.x1 >= v.x0 && r.x0 <= v.x1 && r.z1 >= v.z0 && r.z0 <= v.z1; }
  function prepareView(v) {
    const hx = (Math.abs(v.cos) * v.w + Math.abs(v.sin) * v.h) / (2 * v.scale) + 40;
    const hz = (Math.abs(v.sin) * v.w + Math.abs(v.cos) * v.h) / (2 * v.scale) + 40;
    v.x0 = v.x - hx; v.x1 = v.x + hx; v.z0 = v.z - hz; v.z1 = v.z + hz;
  }
  function worldTransform(ctx, v) { ctx.setTransform(v.dpr * v.scale * v.cos, v.dpr * v.scale * v.sin, -v.dpr * v.scale * v.sin, v.dpr * v.scale * v.cos, v.dpr * (v.w / 2 - (v.x * v.cos - v.z * v.sin) * v.scale), v.dpr * (v.h / 2 - (v.x * v.sin + v.z * v.cos) * v.scale)); }
  function pixelTransform(ctx, v) { ctx.setTransform(v.dpr, 0, 0, v.dpr, 0, 0); }
  function reserve(x, y, w, h, v) {
    const a = x - w / 2 - 4, b = y - h / 2 - 3, c = x + w / 2 + 4, d = y + h / 2 + 3;
    if (c < 0 || a > v.w || d < 0 || b > v.h) return false;
    for (let i = 0; i < rectCount; i += 4) if (a < rects[i + 2] && c > rects[i] && b < rects[i + 3] && d > rects[i + 1]) return false;
    if (rectCount + 4 < rects.length) { rects[rectCount++] = a; rects[rectCount++] = b; rects[rectCount++] = c; rects[rectCount++] = d; }
    return true;
  }
  function textLabel(ctx, v, l, color, offset = 0, angle = 0) {
    const x = sx(v, l.x, l.z), y = sy(v, l.x, l.z) + offset;
    if (x < -20 || y < -20 || x > v.w + 20 || y > v.h + 20) return;
    const w = Math.abs(Math.cos(angle)) * l.width + Math.abs(Math.sin(angle)) * l.size;
    const h = Math.abs(Math.sin(angle)) * l.width + Math.abs(Math.cos(angle)) * l.size;
    if (!reserve(x, y, w, h, v)) return;
    ctx.save(); ctx.translate(x, y); if (angle) ctx.rotate(angle);
    ctx.font = l.font; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round'; ctx.lineWidth = 3.5; ctx.strokeStyle = '#ffffff'; ctx.strokeText(l.text, 0, 0); ctx.fillStyle = color; ctx.fillText(l.text, 0, 0); ctx.restore(); return true;
  }
  // bigger rooms claim label space first, so a crowded floor shows its main halls rather than random shop units
  zoneRecords.sort((p, q) => q.area - p.area);
  // a room label is drawn only when the room is at least about as big on screen as its text
  const zoneFits = (r, v) => r.area * v.scale * v.scale > r.label.width * r.label.size * 0.9;
  function activeZone(r, isMini) {
    if (isMini) return player.y < -1 ? r.y0 <= player.y && player.y < r.y1 : miniPlace === r.place && r.y0 <= player.y && player.y < r.y1;
    return layer === 'underground' ? r.y0 <= -6 && -6 < r.y1 : layer === 'floor' && floorPlace?.id === r.place && r.floor === floorLabel;
  }
  function drawBase(ctx, v, isMini) {
    prepareView(v); pixelTransform(ctx, v); ctx.clearRect(0, 0, v.w, v.h); ctx.fillStyle = '#f2f3ee'; ctx.fillRect(0, 0, v.w, v.h);
    worldTransform(ctx, v); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    for (const a of areaRecords) if (visible(a, v)) { ctx.fillStyle = a.color; ctx.fill(a.path, 'evenodd'); }
    for (let pass = 0; pass < 2; pass++) for (const r of roadRecords) {
      if (!visible(r, v) || (r.foot && v.scale < 0.6)) continue;
      ctx.strokeStyle = pass ? r.color : r.bridge ? '#bfc9cc' : r.rank >= 2 ? '#decda1' : '#dce1da';
      ctx.lineWidth = Math.max(r.foot ? 1 : 2, r.width * v.scale) / v.scale + (pass ? 0 : 2 / v.scale); ctx.stroke(r.path);
    }
    for (const b of buildingRecords) if (visible(b, v)) {
      ctx.fillStyle = b.detailed ? '#f4ddc5' : '#e1e5e4'; ctx.strokeStyle = b.detailed ? '#ceac87' : '#cbd3d2'; ctx.lineWidth = 0.8 / v.scale; ctx.fill(b.path, 'evenodd'); ctx.stroke(b.path);
    }
    // Detailed places without an OSM claim still get their real registered footprint.
    for (const p of placeMarks) {
      const r = p.surfaceZone;
      if (r && visible(r, v) && r.y0 >= -1 && p.floors.length > 1) { ctx.fillStyle = '#f4ddc5'; ctx.strokeStyle = '#ceac87'; ctx.lineWidth = 1 / v.scale; ctx.fill(r.path); ctx.stroke(r.path); }
    }
    const indoor = isMini ? player.y < -1 || !!miniPlace : layer !== 'surface';
    if (indoor) {
      pixelTransform(ctx, v); ctx.fillStyle = (isMini ? player.y < -1 : layer === 'underground') ? 'rgba(222,230,230,.76)' : 'rgba(246,247,244,.58)'; ctx.fillRect(0, 0, v.w, v.h); worldTransform(ctx, v);
      for (const r of zoneRecords) if (activeZone(r, isMini) && visible(r, v)) {
        ctx.fillStyle = r.area > 800 ? '#d1eee4' : '#e7f6dd'; ctx.strokeStyle = '#41a493'; ctx.lineWidth = 1.5 / v.scale; ctx.fill(r.path); ctx.stroke(r.path);
      }
    }
    pixelTransform(ctx, v); rectCount = 0; labelFrame++;
    // Reserve the live position marker before placing text.
    reserve(sx(v, player.x, player.z), sy(v, player.x, player.z), 24, 28, v);
    if (indoor) for (const r of zoneRecords) if (activeZone(r, isMini) && visible(r, v) && zoneFits(r, v)) textLabel(ctx, v, r.label, '#176d60');
    for (const p of placeMarks) if (!indoor || v.scale > 1) textLabel(ctx, v, p.label, indoor ? '#637873' : '#98663e');
    for (const e of exitRecords) {
      const x = sx(v, e.x, e.z), y = sy(v, e.x, e.z), radius = isMini ? 8 : 10;
      if (!reserve(x, y, radius * 2, radius * 2, v)) continue;
      ctx.beginPath(); ctx.arc(x, y, radius, 0, TAU); ctx.fillStyle = '#ef9237'; ctx.fill(); ctx.lineWidth = 1.8; ctx.strokeStyle = '#fff'; ctx.stroke(); ctx.font = isMini ? miniExitFont : exitFont; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#fff'; ctx.fillText(e.text, x, y + 0.5);
    }
    if (!indoor || !isMini) for (const a of areaRecords) if (a.label && visible(a, v) && a.area * v.scale * v.scale > 5000) textLabel(ctx, v, a.label, indoor ? '#8b9c90' : a.labelColor);
    for (const r of roadLabels) if (visible(r, v) && r.length * v.scale > r.label.width + 30 && (r.rank >= 2 || v.scale > 1.6)) {
      const lx = sx(v, r.label.x, r.label.z), ly = sy(v, r.label.x, r.label.z);
      if (r.labelGroup.frame === labelFrame && Math.hypot(lx - r.labelGroup.x, ly - r.labelGroup.y) < (isMini ? 180 : 280)) continue;
      let angle = r.angle + (isMini ? player.yaw : 0); angle = Math.atan2(Math.sin(angle), Math.cos(angle)); if (angle > Math.PI / 2) angle -= Math.PI; if (angle < -Math.PI / 2) angle += Math.PI;
      if (textLabel(ctx, v, r.label, indoor ? '#96a19e' : '#8b7d5a', 0, angle)) { r.labelGroup.frame = labelFrame; r.labelGroup.x = lx; r.labelGroup.y = ly; }
    }
    if (v.scale > (isMini ? 0.85 : 0.65) && !indoor) for (const b of buildingRecords) if (b.label && visible(b, v) && (b.area > 300 || v.scale > 2)) textLabel(ctx, v, b.label, b.detailed ? '#98663e' : '#677674');
    if (v.scale > 0.55) for (const b of busRecords) {
      const x = sx(v, b.x, b.z), y = sy(v, b.x, b.z); if (!reserve(x, y, 11, 13, v)) continue;
      ctx.fillStyle = '#4c91c5'; ctx.fillRect(x - 5, y - 6, 10, 12); ctx.fillStyle = '#fff'; ctx.fillRect(x - 3, y - 4, 6, 4); ctx.fillRect(x - 3, y + 3, 2, 1); ctx.fillRect(x + 1, y + 3, 2, 1);
      if (!isMini && v.scale > 1.55 && b.label) textLabel(ctx, v, b.label, '#487a9c', 18);
    }
    if (indoor && v.scale > 1) for (const e of elevatorRecords) {
      if (!elevatorOnFloor(e, isMini)) continue;
      const x = sx(v, e.x, e.z), y = sy(v, e.x, e.z); if (!reserve(x, y, 15, 15, v)) continue;
      ctx.fillStyle = '#308c80'; ctx.fillRect(x - 7, y - 7, 14, 14); ctx.fillStyle = '#fff'; ctx.font = liftFont; ctx.textAlign = 'center'; ctx.fillText('↕', x, y); if (!isMini && v.scale > 3) textLabel(ctx, v, e.label, '#176d60', 18);
    }
    if (!isMini && v.scale > 1.8) for (const p of poiRecords) {
      if (layer !== 'surface' && p.level == null) continue;
      if (p.level != null && ((layer === 'surface' && Number(p.level) < 0) || (layer === 'underground' && Number(p.level) !== -1))) continue;
      if (layer === 'floor') {
        if (Number(p.level) !== floorLevel || p.indoorPlace !== floorPlace?.id) continue;
      }
      const x = sx(v, p.x, p.z), y = sy(v, p.x, p.z); if (x < 0 || y < 0 || x > v.w || y > v.h) continue;
      if (!reserve(x, y, 6, 6, v)) continue;
      ctx.beginPath(); ctx.arc(x, y, 3.5, 0, TAU); ctx.fillStyle = p.color; ctx.fill(); textLabel(ctx, v, p.label, p.color, 18);
    }
  }
  function drawPlayer(ctx, v, isMini) {
    const x = sx(v, player.x, player.z), y = sy(v, player.x, player.z);
    if (x < -25 || y < -25 || x > v.w + 25 || y > v.h + 25) return;
    ctx.save(); ctx.translate(x, y); ctx.rotate(isMini ? 0 : -player.yaw); ctx.fillStyle = 'rgba(15,153,132,.13)'; ctx.fill(conePath);
    ctx.beginPath(); ctx.arc(0, 0, 14, 0, TAU); ctx.fillStyle = '#ffffff'; ctx.fill(); ctx.shadowColor = 'rgba(25,76,68,.3)'; ctx.shadowBlur = 7; ctx.fillStyle = '#07987f'; ctx.fill(arrowPath); ctx.shadowBlur = 0; ctx.lineWidth = 1.5; ctx.strokeStyle = '#fff'; ctx.stroke(arrowPath); ctx.restore();
  }
  function drawLive() {
    pixelTransform(lg, view); lg.clearRect(0, 0, view.w, view.h);
    if (selected) { const x = sx(view, selected.x, selected.z), y = sy(view, selected.x, selected.z); lg.beginPath(); lg.arc(x, y, 9, 0, TAU); lg.fillStyle = '#f08749'; lg.fill(); lg.strokeStyle = '#fff'; lg.lineWidth = 3; lg.stroke(); lg.beginPath(); lg.arc(x, y, 17, 0, TAU); lg.strokeStyle = 'rgba(240,135,73,.35)'; lg.stroke(); }
    drawPlayer(lg, view, false); liveDirty = false;
  }
  function drawMini() {
    mv.x = player.x; mv.z = player.z; mv.cos = Math.cos(player.yaw); mv.sin = Math.sin(player.yaw); mv.scale = miniScales[miniZoomIndex] * (mv.w < 150 ? 0.8 : 1);
    drawBase(mg, mv, true); drawPlayer(mg, mv, true);
    const radius = mv.w / 2 - 16, nx = mv.w / 2 + Math.sin(player.yaw) * radius, ny = mv.h / 2 - Math.cos(player.yaw) * radius;
    mg.beginPath(); mg.arc(nx, ny, 10, 0, TAU); mg.fillStyle = '#fff'; mg.fill(); mg.fillStyle = '#d86355'; mg.font = liftFont; mg.textAlign = 'center'; mg.textBaseline = 'middle'; mg.fillText('N', nx, ny);
  }
  function setScaleBar() {
    if (Math.abs(view.scale - lastScale) < 0.001) return; lastScale = view.scale;
    const desired = 100 / view.scale, power = 10 ** Math.floor(Math.log10(desired)), normalized = desired / power;
    const meters = (normalized >= 5 ? 5 : normalized >= 2 ? 2 : 1) * power;
    scaleText.textContent = meters >= 1000 ? `${meters / 1000} km` : `${meters} m`; scaleBar.style.width = `${meters * view.scale}px`;
  }
  function resize() {
    const dpr = Math.min(devicePixelRatio || 1, 2), size = innerWidth <= 640 ? 120 : 200;
    mv.w = mv.h = size; mv.dpr = dpr; mini.width = mini.height = Math.round(size * dpr); miniClock = 1;
    if (open) { view.w = work.clientWidth; view.h = work.clientHeight; view.dpr = dpr; canvas.width = live.width = Math.round(view.w * dpr); canvas.height = live.height = Math.round(view.h * dpr); dirty = liveDirty = true; }
  }
  const resizeObserver = new ResizeObserver(resize); resizeObserver.observe(work); addEventListener('resize', resize); link.addEventListener('load', resize);
  document.fonts?.ready.then(() => { for (const l of allLabels) { metric.font = l.font; l.width = metric.measureText(l.text).width; } dirty = true; miniClock = 1; });
  const allLabels = [...areaRecords, ...buildingRecords, ...roadRecords, ...zoneRecords, ...placeMarks, ...poiRecords, ...busRecords, ...elevatorRecords].map(r => r.label).filter(Boolean);
  function announce(message) { status.textContent = message; status.classList.add('show'); clearTimeout(statusTimer); statusTimer = setTimeout(() => status.classList.remove('show'), 2600); }
  function changeMini(delta) { miniZoomIndex = clamp(miniZoomIndex + delta, 0, miniScales.length - 1); miniClock = 1; }
  function constrainView() { view.x = clamp(view.x, bounds[0] - 200, bounds[2] + 200); view.z = clamp(view.z, bounds[1] - 200, bounds[3] + 200); }
  function zoomAt(factor, x, y) {
    const target = clamp(view.scale * factor, MIN_ZOOM, MAX_ZOOM); if (target === view.scale) return;
    view.x += (x - view.w / 2) * (1 / view.scale - 1 / target); view.z += (y - view.h / 2) * (1 / view.scale - 1 / target); view.scale = target;
    flight.active = false; velocityX = velocityZ = 0; constrainView(); dirty = liveDirty = true;
  }
  function flyTo(x, z, scale) { flight.x = x; flight.z = z; flight.scale = clamp(scale, MIN_ZOOM, MAX_ZOOM); flight.active = true; velocityX = velocityZ = 0; }
  function locate() { if (layer === 'floor') chooseFloorPlace(placeAt(player.x, player.z)); flyTo(player.x, player.z, Math.max(1.5, view.scale)); announce('현재 위치를 중심으로 표시합니다.'); }
  function setLayer(next) {
    layer = next; for (const b of layerButtons) b.setAttribute('aria-pressed', String(b.dataset.layer === layer));
    floorCard.hidden = layer !== 'floor'; areaPill.textContent = layer === 'underground' ? '지하 1층 · B1' : layer === 'floor' ? '건물별 층 안내' : '고속터미널역 주변';
    if (layer === 'floor' && !floorPlace) chooseFloorPlace(placeAt(view.x, view.z) || placeAt(player.x, player.z));
    dirty = liveDirty = true;
  }
  function placeAt(x, z) {
    let best = null, bestArea = Infinity;
    for (const r of zoneRecords) if (r.area < bestArea && x >= r.x0 && x <= r.x1 && z >= r.z0 && z <= r.z1 && pointIn(x, z, r.poly)) { best = placeIndex.get(r.place); bestArea = r.area; }
    if (!best) for (const b of buildingRecords) if (b.place && pointIn(x, z, b.poly)) { best = placeIndex.get(b.place); break; }
    return best;
  }
  function chooseFloorPlace(p) {
    if (!p || p === floorPlace || !p.floors.length) return;
    floorPlace = p; buildingName.textContent = p.name; floorHint.textContent = '층을 선택해 실내 공간을 살펴보세요.'; floorSelect.replaceChildren();
    for (const f of p.floors) { const option = el('option', '', f.label, floorSelect); option.value = f.label; }
    const current = p.zones.find(r => r.y0 <= player.y && player.y < r.y1); floorLabel = current?.floor || p.floors.find(f => f.y >= 0)?.label || p.floors[0].label;
    floorSelect.value = floorLabel; updateFloorLevel(); floorSelect.hidden = false; dirty = true;
  }
  function updateFloorLevel() { floorLevel = floorLabel.startsWith('B') ? -Number(floorLabel.slice(1)) : Number(floorLabel.replace(/[^0-9]/g, '')) - 1; }
  floorSelect.addEventListener('change', () => { floorLabel = floorSelect.value; updateFloorLevel(); dirty = true; });
  function selectItem(item) {
    selected = item; selectedType.textContent = item.type || '장소'; selectedTitle.textContent = item.name;
    selectedDetail.textContent = [item.group, item.floor, item.sub].filter(Boolean).join(' · ') || '주변을 둘러본 후 이 위치로 이동하세요.'; selection.hidden = false;
    if (item.place && item.floor) { chooseFloorPlace(placeIndex.get(item.place)); setLayer('floor'); floorLabel = item.floor; floorSelect.value = floorLabel; updateFloorLevel(); }
    else if (item.y < -1) setLayer('underground'); else setLayer('surface');
    flyTo(item.x, item.z, Math.max(view.scale, item.floor ? 4 : 2.3)); full.classList.remove('panel-open'); panelToggle.setAttribute('aria-expanded', 'false'); panelToggle.setAttribute('aria-label', '장소 목록 열기'); liveDirty = true;
  }
  function resultButton(parent, item) {
    const b = button(parent, item.name + (item.floor ? ` ${item.floor}` : ''), 'gt-result', () => selectItem(item)); b.replaceChildren();
    const mark = el('span', 'gt-result-icon', '', b); mark.appendChild(icon('pin'));
    const copy = el('span', 'gt-result-copy', '', b); el('b', '', item.name, copy); el('small', '', [item.floor, item.sub || item.type || '출발 지점'].filter(Boolean).join(' · '), copy);
    const arrow = el('span', 'gt-result-arrow', '', b); arrow.appendChild(icon('arrow'));
  }
  function renderResults() {
    const q = search.value.normalize('NFKC').toLocaleLowerCase().replace(/\s/g, ''); results.replaceChildren();
    if (q) {
      const matches = searchItems.filter(s => s.match.includes(q)); sectionTitle.textContent = `검색 결과 ${matches.length}`;
      for (const s of matches.slice(0, 80)) resultButton(results, s);
      if (!matches.length) el('p', 'gt-empty', '검색 결과가 없어요. 장소 이름을 짧게 입력해 보세요.', results);
    } else {
      sectionTitle.textContent = '바로 가기';
      const groups = new Map(); for (const s of searchItems) if (s.exact) { const name = s.group || placeIndex.get(s.place)?.name || '주요 장소'; if (!groups.has(name)) groups.set(name, []); groups.get(name).push(s); }
      if (!groups.size) { const landmarks = searchItems.filter(s => s.type === '건물' && /터미널|신세계|메리어트|파미에/.test(s.name)).slice(0, 8); groups.set('주변 주요 장소', landmarks); }
      for (const [name, items] of groups) { const group = el('div', 'gt-group', '', results), title = el('h3', '', name, group); el('span', '', String(items.length), title); for (const s of items) resultButton(group, s); }
      if (!results.childElementCount) el('p', 'gt-empty', '검색창에서 주변 장소를 찾아보세요.', results);
    }
  }
  search.addEventListener('input', renderResults); search.addEventListener('keydown', e => { if (e.key === 'Enter') results.querySelector('button')?.click(); });
  // Explicit destinations use that floor's ceiling, never the roof above it.
  // Raw double clicks follow the world's highest walkable support at maxY=200.
  function teleportTo(target, ground) {
    const x = clamp(target.x, bounds[0], bounds[2]), z = clamp(target.z, bounds[1], bounds[3]);
    // try the requested floor, then street level, then whatever walkable surface is highest there
    const tries = [];
    if (!ground && Number.isFinite(target.y)) tries.push(target.y);
    if (!tries.includes(0)) tries.push(0);
    tries.push(null);
    let destination = null;
    for (const ty of tries) { destination = findSpot(x, z, ty); if (destination) break; }
    if (!destination) { announce('이 위치에는 걸을 수 있는 바닥이 없어요. 가까운 출발 지점을 선택하세요.'); return; }
    // The engine's teleport snaps again within +1m; compensate to retain the checked floor.
    player.teleport(destination.x, destination.y, destination.z, target.yaw ?? player.yaw); player.y = destination.y; player.vy = 0;
    toggle(); miniClock = 1;
  }
  function findSpot(x, z, ty) {
    const exactFloor = ty != null, maxY = exactFloor ? ty + 0.65 : 200, target = { y: ty };
    function probe(px, pz) {
      const s = phys?.support ? phys.support(px, pz, maxY) : { y: 0, s: true };
      if (!s || !Number.isFinite(s.y) || (Object.hasOwn(s, 's') && !s.s) || (exactFloor && Math.abs(s.y - target.y) > 1)) return null;
      const pos = { x: px, z: pz }; phys?.resolve?.(pos, 0.34, s.y, s.y + 1.75, 0.5);
      const final = phys?.support ? phys.support(pos.x, pos.z, maxY) : s;
      if (!final || !Number.isFinite(final.y) || (Object.hasOwn(final, 's') && !final.s) || (exactFloor && Math.abs(final.y - target.y) > 1)) return null;
      if (phys?.ceilingAbove && phys.ceilingAbove(pos.x, pos.z, final.y + 0.05, final.y + 1.8) < final.y + 1.75) return null;
      return { x: pos.x, z: pos.z, y: final.y };
    }
    let destination = probe(x, z);
    for (let r = 1; !destination && r <= 8; r++) for (let i = 0; !destination && i < 12; i++) destination = probe(x + Math.cos(i * TAU / 12) * r, z + Math.sin(i * TAU / 12) * r);
    return destination;
  }
  function toggle() {
    open = !open; full.hidden = !open; document.body.classList.toggle('gt-map-open', open);
    if (open) {
      previousFocus = document.activeElement; document.exitPointerLock?.();
      for (const code of ['Space', 'KeyC', 'ControlLeft', 'KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']) window.dispatchEvent(new KeyboardEvent('keyup', { code }));
      view.x = player.x; view.z = player.z; view.scale = 1.1; flight.active = false; velocityX = velocityZ = 0;
      setLayer(player.y < -1 ? 'underground' : 'surface');
      if (player.y >= -1) { const p = placeAt(player.x, player.z); if (p?.floors.length > 1 && player.y > 1) { chooseFloorPlace(p); const r = p.zones.find(r => r.y0 <= player.y && player.y < r.y1); if (r) { floorLabel = r.floor; floorSelect.value = floorLabel; updateFloorLevel(); } setLayer('floor'); } }
      resize(); closeButton.focus({ preventScroll: true });
    } else { flight.active = false; pointerA.id = pointerB.id = null; velocityX = velocityZ = 0; previousFocus?.focus?.({ preventScroll: true }); miniClock = 1; }
  }
  const pointerA = { id: null, x: 0, y: 0 }, pointerB = { id: null, x: 0, y: 0 };
  let lastPointerTime = 0, dragDistance = 0, pinched = false;
  function pointerDown(e) {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    const p = pointerA.id === null ? pointerA : pointerB.id === null ? pointerB : null; if (!p) return;
    p.id = e.pointerId; p.x = e.clientX; p.y = e.clientY; canvas.setPointerCapture(e.pointerId); flight.active = false; velocityX = velocityZ = 0; lastPointerTime = e.timeStamp; dragDistance = 0;
    if (pointerB.id !== null) pinched = true; else pinched = false; canvas.classList.add('dragging');
  }
  function pointerMove(e) {
    const p = e.pointerId === pointerA.id ? pointerA : e.pointerId === pointerB.id ? pointerB : null;
    if (!p) { if (layer === 'floor' && e.pointerType !== 'touch') { const box = canvas.getBoundingClientRect(); chooseFloorPlace(placeAt(view.x + (e.clientX - box.left - view.w / 2) / view.scale, view.z + (e.clientY - box.top - view.h / 2) / view.scale)); } return; }
    const dx = e.clientX - p.x, dy = e.clientY - p.y, delta = Math.max(8, e.timeStamp - lastPointerTime) / 1000; lastPointerTime = e.timeStamp; dragDistance += Math.hypot(dx, dy);
    if (pointerA.id !== null && pointerB.id !== null) {
      const oldDistance = Math.hypot(pointerA.x - pointerB.x, pointerA.y - pointerB.y), oldX = (pointerA.x + pointerB.x) / 2, oldY = (pointerA.y + pointerB.y) / 2;
      p.x = e.clientX; p.y = e.clientY; const distance = Math.hypot(pointerA.x - pointerB.x, pointerA.y - pointerB.y), box = canvas.getBoundingClientRect();
      if (oldDistance > 5) zoomAt(distance / oldDistance, oldX - box.left, oldY - box.top);
      view.x -= ((pointerA.x + pointerB.x) / 2 - oldX) / view.scale; view.z -= ((pointerA.y + pointerB.y) / 2 - oldY) / view.scale;
    } else { p.x = e.clientX; p.y = e.clientY; view.x -= dx / view.scale; view.z -= dy / view.scale; velocityX = -dx / view.scale / delta; velocityZ = -dy / view.scale / delta; }
    constrainView(); dirty = liveDirty = true;
  }
  function pointerUp(e) {
    if (e.pointerId !== pointerA.id && e.pointerId !== pointerB.id) return;
    // a tap/click (no drag, no pinch) teleports there: street level on the surface layer, B1 on the underground
    // layer, the shown floor on the floor-plan layer
    if (dragDistance < 8 && !pinched && pointerB.id === null && e.type !== 'pointercancel') {
      const box = canvas.getBoundingClientRect(), wx = view.x + (e.clientX - box.left - view.w / 2) / view.scale, wz = view.z + (e.clientY - box.top - view.h / 2) / view.scale;
      let ty = 0;
      if (layer === 'underground') ty = -6;
      else if (layer === 'floor') { const pl = placeAt(wx, wz); if (pl) chooseFloorPlace(pl); const f = (floorPlace?.floors || []).find(f => f.label === floorLabel); if (f) ty = f.y; }
      pointerA.id = pointerB.id = null; canvas.classList.remove('dragging');
      teleportTo({ x: wx, z: wz, y: ty }, false); return;
    }
    if (e.pointerId === pointerA.id) { pointerA.id = pointerB.id; pointerA.x = pointerB.x; pointerA.y = pointerB.y; pointerB.id = null; } else pointerB.id = null;
    if (pinched || e.timeStamp - lastPointerTime > 100 || e.type === 'pointercancel') velocityX = velocityZ = 0;
    if (pointerA.id === null) canvas.classList.remove('dragging');
  }
  canvas.addEventListener('pointerdown', pointerDown); canvas.addEventListener('pointermove', pointerMove); canvas.addEventListener('pointerup', pointerUp); canvas.addEventListener('pointercancel', pointerUp);
  canvas.addEventListener('wheel', e => { e.preventDefault(); const r = canvas.getBoundingClientRect(); zoomAt(Math.exp(-clamp(e.deltaY * (e.deltaMode === 1 ? 16 : 1), -200, 200) * 0.002), e.clientX - r.left, e.clientY - r.top); }, { passive: false });
  canvas.addEventListener('dblclick', e => { if (pinched || dragDistance > 8) return; const r = canvas.getBoundingClientRect(); teleportTo({ x: view.x + (e.clientX - r.left - view.w / 2) / view.scale, z: view.z + (e.clientY - r.top - view.h / 2) / view.scale }, true); });
  window.addEventListener('keydown', e => {
    if (e.metaKey || e.ctrlKey) return;
    const typing = e.target.isContentEditable || /INPUT|TEXTAREA|SELECT/.test(e.target.tagName);
    if (open && e.code === 'Escape') { e.preventDefault(); e.stopImmediatePropagation(); toggle(); return; }
    if (!typing && (e.code === 'Equal' || e.code === 'NumpadAdd' || e.code === 'Minus' || e.code === 'NumpadSubtract')) {
      e.preventDefault(); e.stopImmediatePropagation(); const dir = e.code === 'Equal' || e.code === 'NumpadAdd' ? 1 : -1;
      if (open) zoomAt(dir > 0 ? 1.35 : 1 / 1.35, view.w / 2, view.h / 2); else changeMini(dir); return;
    }
    if (!open) { if (e.code === 'KeyM' && e.repeat) e.stopImmediatePropagation(); return; }
    if (typing && e.target.tagName !== 'INPUT') { e.stopImmediatePropagation(); return; }
    if (e.code === 'KeyM' && !typing) { e.preventDefault(); e.stopImmediatePropagation(); if (!e.repeat) toggle(); return; }
    if (e.code === 'Tab') {
      const focusable = full.querySelectorAll('button:not([disabled]),input,select,a[href],canvas[tabindex]'); const visible = Array.from(focusable).filter(n => n.getClientRects().length);
      const first = visible[0], last = visible[visible.length - 1]; if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); } else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
    // Capture gameplay keys before main.js. Leave text editing and keyup intact.
    if (!typing && /^(Key[WASDFENRHC]|Arrow\w+|Space|ControlLeft|ShiftLeft)$/.test(e.code)) { if (e.code !== 'Space' || e.target === canvas) e.preventDefault(); e.stopImmediatePropagation(); }
  }, true);
  function update(dt = 0.016) {
    const elapsed = Math.min(Math.max(dt, 0), 0.1); miniClock += elapsed;
    if (player.y !== lastY || miniClock >= 0.05) {
      lastY = player.y; const current = zoneAt?.(); miniPlace = null;
      if (player.y >= -1 && current && (placeIndex.get(current.place)?.floors.length || 0) > 1) miniPlace = current.place;
      if (player.y >= -1 && !miniPlace) for (const r of zoneRecords) if (r.y0 <= player.y && player.y < r.y1 && (placeIndex.get(r.place)?.floors.length || 0) > 1 && player.x >= r.x0 && player.x <= r.x1 && player.z >= r.z0 && player.z <= r.z1 && pointIn(player.x, player.z, r.poly)) { miniPlace = r.place; break; }
      let floor = current?.floor || (player.y < -1 ? '지하' : '지상');
      if (!current?.floor && player.y < -1) for (const level of levelLabels) if (player.y >= level[1] - 0.3) { floor = level[0]; break; }
      if (!current?.floor && player.y < -1) for (const r of zoneRecords) if (r.y0 <= player.y && player.y < r.y1 && pointIn(player.x, player.z, r.poly)) { floor = r.floor || '지하'; break; }
      const caption = current?.name || '주변 지도';
      if (miniCaption.textContent !== caption) miniCaption.textContent = caption;
      if (floor !== miniFloorText) { miniFloorText = floor; miniFloor.textContent = floor; }
      if (open && current !== lastHeaderZone) { lastHeaderZone = current; headerContext.textContent = current ? `${current.name} · ${current.floor || '지상'}` : '서울특별시 서초구 · 반포동'; }
    }
    if (!open) { if (miniClock >= 0.05) { miniClock %= 0.05; drawMini(); } return; }
    if (miniClock >= 0.05) miniClock %= 0.05;
    if (flight.active) {
      const t = 1 - Math.exp(-elapsed * 9); view.x += (flight.x - view.x) * t; view.z += (flight.z - view.z) * t; view.scale += (flight.scale - view.scale) * t;
      if (Math.abs(view.x - flight.x) + Math.abs(view.z - flight.z) < 0.06 && Math.abs(view.scale - flight.scale) < 0.002) { view.x = flight.x; view.z = flight.z; view.scale = flight.scale; flight.active = false; }
      dirty = liveDirty = true;
    } else if (pointerA.id === null && Math.abs(velocityX) + Math.abs(velocityZ) > 0.5) { view.x += velocityX * elapsed; view.z += velocityZ * elapsed; const decay = Math.exp(-elapsed * 7); velocityX *= decay; velocityZ *= decay; constrainView(); dirty = liveDirty = true; }
    if (dirty) { drawBase(g, view, false); setScaleBar(); dirty = false; liveDirty = true; }
    if (player.x !== lastPX || player.z !== lastPZ || player.yaw !== lastYaw) { lastPX = player.x; lastPZ = player.z; lastYaw = player.yaw; liveDirty = true; }
    if (liveDirty) drawLive();
  }
  renderResults(); resize();
  return { update, toggle, isOpen: () => open };
}
