// Shared surface textures + text-sign atlas. Headless geometry tests supply their own canvas.
// BEGIN Blender suspended ceiling swatch
// Rebuild with assets/models/shared-ceiling/export.py. Units are pixels in a 256px tile.
const ceilingScale = [2.4, 2.4];
const ceilingBaseColor = "#e9e7e2";
const ceilingSpans = [
  ["#b6b5ae", [201,152,44,1,201,153,1,2,244,153,1,2,201,155,44,1,201,156,1,3,244,156,1,3,201,159,44,1,201,160,1,2,244,160,1,2,201,162,44,1,201,163,1,2,244,163,1,2,201,165,44,1,201,166,1,3,244,166,1,3,201,169,44,1,201,170,1,2,244,170,1,2,201,172,44,1,201,173,1,3,244,173,1,3,201,176,44,1]],
  ["#cbc8c2", [0,0,256,1,0,1,1,62,63,1,2,62,127,1,2,62,191,1,2,62,255,1,1,62,0,63,256,2,0,65,1,62,63,65,2,62,191,65,2,62,255,65,1,62,0,127,256,2,0,129,1,62,63,129,2,62,127,129,2,62,191,129,2,62,255,129,1,62,0,191,256,2,0,193,1,62,63,193,2,62,127,193,2,62,191,193,2,62,255,193,1,62,0,255,256,1]],
  ["#d2d1cb", [202,153,42,2,202,156,42,3,202,160,42,2,202,163,42,2,202,166,42,3,202,170,42,2,202,173,42,3]],
  ["#dad8d1", [65,65,126,2,65,67,2,58,189,67,2,58,65,125,126,2,200,150,46,2,200,152,1,25,245,152,1,25,200,177,46,1]],
  ["#e7e5df", [129,193,62,62]],
  ["#e9e7e1", [67,67,122,1,67,68,1,56,188,68,1,56,67,124,122,1]],
  ["#ebe9e4", [129,1,62,62,1,193,62,62]],
  ["#f8f5eb", [75,69,1,54,83,69,1,54,90,69,1,54,98,69,1,54,105,69,1,54,113,69,1,54,120,69,1,54,127,69,2,54,135,69,1,54,142,69,1,54,150,69,1,54,157,69,1,54,165,69,1,54,172,69,1,54,180,69,1,54]],
  ["#fffdf4", [68,68,120,1,68,69,7,54,76,69,7,54,84,69,6,54,91,69,7,54,99,69,6,54,106,69,7,54,114,69,6,54,121,69,6,54,129,69,6,54,136,69,6,54,143,69,7,54,151,69,6,54,158,69,7,54,166,69,6,54,173,69,7,54,181,69,7,54,68,123,120,1]],
];
// END Blender suspended ceiling swatch
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
  ceiling(g, w, h) {
    g.fillStyle = ceilingBaseColor;
    g.fillRect(0, 0, w, h);
    const sx = w / 256, sy = h / 256;
    for (const [color, spans] of ceilingSpans) {
      g.fillStyle = color;
      for (let i = 0; i < spans.length; i += 4) {
        g.fillRect(spans[i] * sx, spans[i + 1] * sy, spans[i + 2] * sx, spans[i + 3] * sy);
      }
    }
    return [...ceilingScale];
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
export function createSignAtlas(THREE, { size = 2048, quality = 0.72 } = {}) {
  const SIZE = size, GAP = 4;
  // Global resolution policy. Signs are drawn at pxPerM * QUALITY, and one text line never gets more
  // than LINE_PX pixels of height (big rooftop letters do not need 300 px). Identical signs (same text
  // and look, different position) share one atlas slot.
  const QUALITY = quality, LINE_PX = 72;
  const pages = [];
  const cache = new Map();
  function newPage() {
    const c = makeCanvas(SIZE, SIZE); const g = c.getContext('2d');
    g.clearRect(0, 0, SIZE, SIZE); // transparent: bg:null signs are letters only (material uses alphaTest)
    const t = tex(THREE, c, { repeat: false }); t.generateMipmaps = true; t.minFilter = THREE.LinearMipmapLinearFilter;
    const p = { c, g, t, shelves: [], nextY: 0, index: pages.length, dirty: true };
    pages.push(p); return p;
  }
  // shelf best-fit over all pages: put the rect on the shelf whose height wastes least, else open a shelf
  function alloc(w, h) {
    let best = null, bw = Infinity;
    for (const p of pages) for (const sh of p.shelves) {
      if (sh.h < h || sh.h > h * 1.5 + 6 || sh.x + w > SIZE) continue;
      const waste = (sh.h - h) * w; if (waste < bw) { bw = waste; best = { p, sh }; }
    }
    if (!best) {
      let p = pages.find(q => q.nextY + h <= SIZE) || newPage();
      const sh = { y: p.nextY, h, x: 0 }; p.shelves.push(sh); p.nextY += h + GAP; best = { p, sh };
    }
    const { p, sh } = best; const r = { page: p, x: sh.x, y: sh.y, w, h };
    sh.x += w + GAP; p.dirty = true;
    return r;
  }
  // draw text block; returns uv rect + page. The rect is reserved immediately; the pixels are painted by paint(),
  // either right away or later (start() → deferred; flush() paints nearest-first within a time budget) so the
  // world can appear before ~7000 signs are rasterised.
  let deferred = false, sorted = false; const queue = [];
  function draw(lines, o = {}) {
    lines = [].concat(lines).map(String);
    const { w = 2, h = 0.5, bg = '#222', fg = '#fff', bold = true, align = 'center', pxPerM = 96, border = null, italic = false, font = FONT, sub = null, subFg = null, icon = null, padding = 0.08 } = o;
    const key = JSON.stringify([lines, w, h, bg, fg, bold, align, pxPerM, border, italic, font, sub, subFg, icon, padding]);
    const hit = cache.get(key); if (hit) return hit;
    const n = lines.length + (sub ? 0.6 : 0);
    let pw = w * pxPerM * QUALITY, ph = h * pxPerM * QUALITY;
    // one scale for both axes keeps the letters' aspect (clamping each axis separately squashed wide signs)
    const s = Math.min(1, (LINE_PX * n * 1.25 + 8) / ph, 1024 / pw, 512 / ph);
    pw = Math.max(16, Math.round(pw * s)); ph = Math.max(8, Math.round(ph * s));
    const r = alloc(pw, ph);
    const job = { r, pw, ph, lines, n, bg, fg, bold, align, border, italic, font, sub, subFg, padding, x: o.x ?? 0, z: o.z ?? 0 };
    if (deferred) queue.push(job); else paint(job);
    // half-texel inset so mipmaps/filtering do not pull in the neighbour's pixels
    const u0 = (r.x + 0.5) / SIZE, u1 = (r.x + pw - 0.5) / SIZE, v0 = 1 - (r.y + ph - 0.5) / SIZE, v1 = 1 - (r.y + 0.5) / SIZE;
    const out = { page: r.page, uv: [u0, v0, u1, v1] };
    cache.set(key, out); return out;
  }
  function paint({ r, pw, ph, lines, n, bg, fg, bold, align, border, italic, font, sub, subFg, padding }) {
    const g = r.page.g;
    g.save(); g.beginPath(); g.rect(r.x, r.y, pw, ph); g.clip();
    if (bg) { g.fillStyle = bg; g.fillRect(r.x, r.y, pw, ph); }
    if (border) { g.strokeStyle = border; g.lineWidth = Math.max(2, ph * 0.04); g.strokeRect(r.x + 1, r.y + 1, pw - 2, ph - 2); }
    const pad = Math.round(Math.min(pw, ph) * padding);
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
  }
  function start() { deferred = true; }
  function flush(ms, x = 0, z = 0) {
    if (!queue.length) return [];
    if (!sorted) { queue.sort((a, b) => Math.hypot(b.x - x, b.z - z) - Math.hypot(a.x - x, a.z - z)); sorted = true; }
    const t0 = performance.now(), done = [];
    while (queue.length && performance.now() - t0 < ms) { const j = queue.pop(); paint(j); done.push(j); }
    return done; // painted jobs (rect + page) so the caller can upload just those rectangles
  }
  function flushAll() { while (queue.length) paint(queue.pop()); }
  // every character still to be painted, so the page can fetch exactly the web-font subsets it needs first
  function chars() { const set = new Set(); for (const j of queue) for (const t of [...j.lines, j.sub || '']) for (const ch of t) set.add(ch); return [...set].join(''); }
  return { pages, draw, SIZE, start, flush, flushAll, chars, pending: () => queue.length };
}
