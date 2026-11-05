// Procedural textures + text-sign atlas. Works in browser; in node tests a stub canvas is injected.
export const FONT = '"Noto Sans KR","Apple SD Gothic Neo","Malgun Gothic",sans-serif';

export function makeCanvas(w, h) {
  const c = (globalThis.document ? document.createElement('canvas') : globalThis.__makeCanvas(w, h));
  c.width = w; c.height = h;
  return c;
}

function tex(THREE, canvas, { repeat = true, srgb = true } = {}) {
  const t = new THREE.CanvasTexture(canvas);
  if (repeat) t.wrapS = t.wrapT = THREE.RepeatWrapping;
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

// ---- procedural surface textures. Each returns {canvas, scale:[metersU, metersV]} ----
const R = (s => () => (s = (s * 16807) % 2147483647) / 2147483647)(12345);

const PAINTERS = {
  asphalt(g, w, h) {
    g.fillStyle = '#3b3c3f'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 4000; i++) { const v = 45 + R() * 30 | 0; g.fillStyle = `rgb(${v},${v},${v + 2})`; g.fillRect(R() * w, R() * h, 1.5, 1.5); }
    return [6, 6];
  },
  sidewalk(g, w, h) { // 보도블럭 (grey/pink interlocking)
    g.fillStyle = '#9d9790'; g.fillRect(0, 0, w, h);
    const n = 8, s = w / n;
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
      const v = 150 + R() * 25 | 0; g.fillStyle = (x + y) % 5 === 0 ? `rgb(${v},${v - 30},${v - 30})` : `rgb(${v},${v - 4},${v - 10})`;
      g.fillRect(x * s + 1, y * s + 1, s - 2, s - 2);
    }
    return [2.4, 2.4];
  },
  tile(g, w, h) { // light porcelain floor tile 60cm
    g.fillStyle = '#d9d6cf'; g.fillRect(0, 0, w, h);
    const n = 4, s = w / n;
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) { const v = 222 + R() * 14 | 0; g.fillStyle = `rgb(${v},${v - 2},${v - 6})`; g.fillRect(x * s + 1, y * s + 1, s - 2, s - 2); }
    return [2.4, 2.4];
  },
  marble(g, w, h) {
    g.fillStyle = '#ece8e1'; g.fillRect(0, 0, w, h);
    g.strokeStyle = 'rgba(150,140,130,0.25)';
    for (let i = 0; i < 18; i++) { g.lineWidth = R() * 2; g.beginPath(); let x = R() * w, y = R() * h; g.moveTo(x, y); for (let k = 0; k < 6; k++) { x += (R() - 0.5) * 80; y += R() * 50; g.lineTo(x, y); } g.stroke(); }
    g.strokeStyle = 'rgba(120,110,100,0.35)'; g.lineWidth = 2; g.strokeRect(0, 0, w, h);
    return [1.2, 1.2];
  },
  darkstone(g, w, h) {
    g.fillStyle = '#4a4744'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 2000; i++) { const v = 60 + R() * 30 | 0; g.fillStyle = `rgb(${v},${v - 2},${v - 4})`; g.fillRect(R() * w, R() * h, 2, 2); }
    g.strokeStyle = '#2e2c2a'; g.lineWidth = 3; g.strokeRect(0, 0, w, h);
    return [1.2, 1.2];
  },
  wood(g, w, h) {
    for (let x = 0; x < w; x += 16) { const v = 150 + R() * 40 | 0; g.fillStyle = `rgb(${v},${v * 0.72 | 0},${v * 0.45 | 0})`; g.fillRect(x, 0, 16, h); g.fillStyle = 'rgba(0,0,0,0.15)'; g.fillRect(x, 0, 1, h); }
    return [1.6, 1.6];
  },
  carpet(g, w, h) {
    g.fillStyle = '#7a5a4a'; g.fillRect(0, 0, w, h);
    g.strokeStyle = 'rgba(210,180,120,0.35)'; g.lineWidth = 3;
    for (let i = 0; i < w; i += 32) { g.beginPath(); g.arc(i + 16, i % 64 ? 16 : 48, 12, 0, 7); g.stroke(); }
    for (let i = 0; i < 3000; i++) { g.fillStyle = `rgba(${R() * 80 | 0},20,20,0.15)`; g.fillRect(R() * w, R() * h, 2, 2); }
    return [1.5, 1.5];
  },
  concrete(g, w, h) {
    g.fillStyle = '#a9a7a2'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 3000; i++) { const v = 150 + R() * 40 | 0; g.fillStyle = `rgba(${v},${v},${v - 4},0.5)`; g.fillRect(R() * w, R() * h, 2, 2); }
    return [4, 4];
  },
  grass(g, w, h) {
    g.fillStyle = '#5f8f43'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 6000; i++) { g.fillStyle = `rgb(${70 + R() * 40 | 0},${110 + R() * 50 | 0},${40 + R() * 30 | 0})`; g.fillRect(R() * w, R() * h, 1.5, 3); }
    return [5, 5];
  },
  water(g, w, h) {
    const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, '#3d6f94'); gr.addColorStop(1, '#4f83a8');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.strokeStyle = 'rgba(255,255,255,0.12)';
    for (let i = 0; i < 60; i++) { const x = R() * w, y = R() * h; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + 20, y - 4, x + 40, y); g.stroke(); }
    return [20, 20];
  },
  parking(g, w, h) { // painted epoxy parking floor
    g.fillStyle = '#6f8a7a'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 1500; i++) { g.fillStyle = 'rgba(255,255,255,0.05)'; g.fillRect(R() * w, R() * h, 2, 2); }
    return [6, 6];
  },
  ceiling(g, w, h) { // 600 grid ceiling with light panel
    g.fillStyle = '#e9e7e2'; g.fillRect(0, 0, w, h);
    g.strokeStyle = '#c9c6c0'; g.lineWidth = 2;
    for (let i = 0; i <= 4; i++) { g.beginPath(); g.moveTo(i * w / 4, 0); g.lineTo(i * w / 4, h); g.stroke(); g.beginPath(); g.moveTo(0, i * h / 4); g.lineTo(w, i * h / 4); g.stroke(); }
    g.fillStyle = '#fffdf4'; g.fillRect(w / 4 + 3, h / 4 + 3, w / 2 - 6, h / 4 - 6);
    return [2.4, 2.4];
  },
  metal(g, w, h) {
    const gr = g.createLinearGradient(0, 0, w, 0); gr.addColorStop(0, '#9aa0a6'); gr.addColorStop(0.5, '#c8ccd0'); gr.addColorStop(1, '#8e949a');
    g.fillStyle = gr; g.fillRect(0, 0, w, h); return [1, 1];
  },
  brick(g, w, h) {
    g.fillStyle = '#8a8178'; g.fillRect(0, 0, w, h);
    const bh = h / 8, bw = w / 4;
    for (let y = 0; y < 8; y++) for (let x = -1; x < 5; x++) { const v = 120 + R() * 40 | 0; g.fillStyle = `rgb(${v + 40},${v},${v - 30})`; g.fillRect(x * bw + (y % 2) * bw / 2 + 2, y * bh + 2, bw - 4, bh - 4); }
    return [2, 1];
  },
  roofgravel(g, w, h) {
    g.fillStyle = '#8b8a86'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 4000; i++) { const v = 110 + R() * 60 | 0; g.fillStyle = `rgb(${v},${v},${v})`; g.fillRect(R() * w, R() * h, 2, 2); }
    return [6, 6];
  },
};

// Facade painters: one tile = one bay (u) x one floor (v). Units: u meters per tile given by scale[0]; v = 1 floor.
const FACADES = {
  apt(g, w, h) { // Korean apartment: white wall, wide balcony window band, rail line
    g.fillStyle = '#ecebe6'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#7f95a8'; g.fillRect(w * 0.06, h * 0.22, w * 0.88, h * 0.58);
    g.fillStyle = 'rgba(255,255,255,0.35)'; for (let i = 1; i < 4; i++) g.fillRect(w * 0.06 + i * w * 0.22, h * 0.22, 3, h * 0.58);
    g.fillStyle = '#d7d5cf'; g.fillRect(0, h * 0.8, w, h * 0.06);
    g.fillStyle = '#c4c2bc'; g.fillRect(0, 0, w, 3);
    return [6, 1];
  },
  office(g, w, h) {
    g.fillStyle = '#5c6f80'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#8fb0c8'; g.fillRect(w * 0.04, h * 0.12, w * 0.92, h * 0.7);
    g.fillStyle = 'rgba(255,255,255,0.25)'; g.fillRect(w * 0.04, h * 0.12, w * 0.3, h * 0.7);
    g.fillStyle = '#4b5a68'; g.fillRect(w / 2 - 2, 0, 4, h);
    return [3, 1];
  },
  shop(g, w, h) { // low-rise commercial: tiled wall + windows
    g.fillStyle = '#c9bfae'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#6d8394'; g.fillRect(w * 0.1, h * 0.2, w * 0.8, h * 0.55);
    g.fillStyle = 'rgba(255,255,255,0.2)'; g.fillRect(w * 0.1, h * 0.2, w * 0.8, 4);
    g.fillStyle = '#b3a998'; g.fillRect(0, h * 0.85, w, 4);
    return [4, 1];
  },
  oldshop(g, w, h) { // 1970s 상가: brown tile, sash windows
    g.fillStyle = '#a58f78'; g.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 8) { g.fillStyle = 'rgba(0,0,0,0.06)'; g.fillRect(0, y, w, 1); }
    g.fillStyle = '#4d5f6b'; g.fillRect(w * 0.12, h * 0.25, w * 0.76, h * 0.5);
    g.fillStyle = '#ddd'; g.fillRect(w * 0.5 - 2, h * 0.25, 4, h * 0.5); g.fillRect(w * 0.12, h * 0.5 - 2, w * 0.76, 4);
    return [3.6, 1];
  },
  hotel(g, w, h) {
    g.fillStyle = '#6a7581'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#a9c0d2'; g.fillRect(w * 0.08, h * 0.08, w * 0.84, h * 0.84);
    g.fillStyle = 'rgba(255,240,210,0.35)'; g.fillRect(w * 0.08, h * 0.5, w * 0.84, h * 0.42);
    g.fillStyle = '#56606b'; g.fillRect(0, 0, 3, h);
    return [3.6, 1];
  },
  blank(g, w, h) { // department-store style blank panel
    g.fillStyle = '#d6d0c6'; g.fillRect(0, 0, w, h);
    g.strokeStyle = 'rgba(0,0,0,0.12)'; g.lineWidth = 2; g.strokeRect(0, 0, w, h);
    return [3, 1];
  },
  school(g, w, h) {
    g.fillStyle = '#c8b9a2'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#6f8899'; g.fillRect(w * 0.08, h * 0.25, w * 0.84, h * 0.5);
    g.fillStyle = '#eee'; g.fillRect(w / 2 - 2, h * 0.25, 4, h * 0.5);
    return [3.6, 1];
  },
};

export function createTextures(THREE, { maxAniso = 8 } = {}) {
  const cache = new Map();
  function surface(name) {
    if (cache.has(name)) return cache.get(name);
    const p = PAINTERS[name] || FACADES[name];
    if (!p) throw new Error('unknown texture ' + name);
    const c = makeCanvas(256, 256); const g = c.getContext('2d');
    const scale = p(g, 256, 256);
    const t = tex(THREE, c); t.anisotropy = maxAniso;
    const r = { tex: t, scale, facade: !!FACADES[name] };
    cache.set(name, r); return r;
  }
  function custom(key, w, h, draw, scale = [1, 1], opts = {}) {
    if (cache.has(key)) return cache.get(key);
    const c = makeCanvas(w, h); draw(c.getContext('2d'), w, h);
    const t = tex(THREE, c, opts); const r = { tex: t, scale, facade: !!opts.facade };
    cache.set(key, r); return r;
  }
  return { surface, custom, names: [...Object.keys(PAINTERS), ...Object.keys(FACADES)], facades: Object.keys(FACADES) };
}

// ---- text atlas: shelf packer on 2048^2 pages ----
export function createSignAtlas(THREE) {
  const SIZE = 2048;
  const pages = [];
  function newPage() {
    const c = makeCanvas(SIZE, SIZE); const g = c.getContext('2d');
    g.fillStyle = '#000'; g.fillRect(0, 0, SIZE, SIZE);
    const t = tex(THREE, c, { repeat: false }); t.generateMipmaps = true; t.minFilter = THREE.LinearMipmapLinearFilter;
    const p = { c, g, t, x: 0, y: 0, rowH: 0, index: pages.length, dirty: true };
    pages.push(p); return p;
  }
  function alloc(w, h) {
    let p = pages[pages.length - 1] || newPage();
    if (p.x + w > SIZE) { p.x = 0; p.y += p.rowH + 2; p.rowH = 0; }
    if (p.y + h > SIZE) { p = newPage(); }
    const r = { page: p, x: p.x, y: p.y, w, h };
    p.x += w + 2; p.rowH = Math.max(p.rowH, h); p.dirty = true;
    return r;
  }
  // draw text block; returns uv rect + page
  function draw(lines, { w = 2, h = 0.5, bg = '#222', fg = '#fff', bold = true, align = 'center', pxPerM = 96, border = null, italic = false, font = FONT, sub = null, subFg = null, icon = null, padding = 0.08 } = {}) {
    lines = [].concat(lines).map(String);
    let pw = Math.max(16, Math.min(1024, Math.round(w * pxPerM))), ph = Math.max(8, Math.min(512, Math.round(h * pxPerM)));
    const s = Math.min(1024 / pw, 512 / ph, 1); pw = Math.round(pw * s); ph = Math.round(ph * s);
    const r = alloc(pw, ph); const g = r.page.g;
    g.save(); g.beginPath(); g.rect(r.x, r.y, pw, ph); g.clip();
    if (bg) { g.fillStyle = bg; g.fillRect(r.x, r.y, pw, ph); }
    if (border) { g.strokeStyle = border; g.lineWidth = Math.max(2, ph * 0.04); g.strokeRect(r.x + 1, r.y + 1, pw - 2, ph - 2); }
    const pad = Math.round(Math.min(pw, ph) * padding);
    const n = lines.length + (sub ? 0.6 : 0);
    let fs = (ph - pad * 2) / n * 0.82;
    const wt = bold ? '700' : '400';
    g.font = `${italic ? 'italic ' : ''}${wt} ${fs}px ${font}`;
    const maxW = Math.max(...lines.map(l => g.measureText(l).width), 1);
    if (maxW > pw - pad * 2) { fs *= (pw - pad * 2) / maxW; g.font = `${italic ? 'italic ' : ''}${wt} ${fs}px ${font}`; }
    g.fillStyle = fg; g.textBaseline = 'middle'; g.textAlign = align;
    const ax = align === 'left' ? r.x + pad : align === 'right' ? r.x + pw - pad : r.x + pw / 2;
    const lh = (ph - pad * 2) / n;
    lines.forEach((l, i) => g.fillText(l, ax, r.y + pad + lh * (i + 0.5)));
    if (sub) { g.font = `400 ${fs * 0.5}px ${font}`; g.fillStyle = subFg || fg; g.fillText(sub, ax, r.y + pad + lh * (lines.length + 0.3)); }
    g.restore();
    const u0 = r.x / SIZE, u1 = (r.x + pw) / SIZE, v0 = 1 - (r.y + ph) / SIZE, v1 = 1 - r.y / SIZE;
    return { page: r.page, uv: [u0, v0, u1, v1] };
  }
  return { pages, draw, SIZE };
}
