// Send the Blender faces to the kit's normal terrain-aware, per-tile colour batch.
import { furniture } from './meshes.js';

const templates = new Map();
const plainUV = [[0, 0], [1, 0], [0, 1]];
function timberGrain(g, width, height) {
  g.fillStyle = '#f9f6ee'; g.fillRect(0, 0, width, height);
  for (let i = 0; i < 54; i++) {
    g.strokeStyle = i % 3 ? 'rgba(106,71,43,.15)' : 'rgba(113,74,48,.27)';
    g.lineWidth = i % 4 ? .55 : .9;
    g.beginPath();
    for (let x = 0; x <= width; x += 4) {
      const y = (i * 37 % height) + Math.sin(x / width * 2 * Math.PI + i) * (1.2 + i % 3 * .5);
      if (x) g.lineTo(x, y); else g.moveTo(x, y);
    }
    g.stroke();
  }
}
export function drawFurniture(K, name, x, y, z, yaw) {
  if (name === 'bench') K.texture('riverside-bench-grain', 256, 64, timberGrain, [1.9, .22]);
  if (!templates.has(name)) {
    const [colors, mm, triangles, timber] = furniture[name];
    const vertices = [], faces = [];
    for (let i = 0; i < mm.length; i += 3) vertices.push([mm[i] / 1000, mm[i + 1] / 1000, mm[i + 2] / 1000]);
    for (let i = 0; i < triangles.length; i += 4) {
      const [ia, ib, ic, slot] = triangles.slice(i, i + 4);
      const a = vertices[ia], b = vertices[ib], c = vertices[ic];
      const dx = b[0] - a[0], dy = b[1] - a[1], dz = b[2] - a[2];
      const ex = c[0] - a[0], ey = c[1] - a[1], ez = c[2] - a[2];
      const nx = dy * ez - dz * ey, ny = dz * ex - dx * ez, nz = dx * ey - dy * ex;
      const length = Math.hypot(nx, ny, nz);
      if (!length) continue;
      const wood = timber.includes(slot);
      const mat = wood ? { tex: 'riverside-bench-grain', color: colors[slot] } : colors[slot];
      const uv = wood ? [a,b,c].map(([x,y,z]) => [x / 1.9, (Math.abs(ny) > Math.abs(nz) ? z : y) / .22]) : plainUV;
      faces.push([ia, ib, ic, mat, nx / length, ny / length, nz / length, uv]);
    }
    templates.set(name, { vertices, faces });
  }
  const { vertices, faces } = templates.get(name);
  const s = Math.sin(yaw), c = Math.cos(yaw);
  const world = vertices.map(([u, h, v]) => [x + u * c + v * s, y + h, z - u * s + v * c]);
  for (const [a, b, d, color, nx, ny, nz, uv] of faces)
    K.triangle(color, [world[a], world[b], world[d]], [nx * c + nz * s, ny, -nx * s + nz * c], uv);
}
