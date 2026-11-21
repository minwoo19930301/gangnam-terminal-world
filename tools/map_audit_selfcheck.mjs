// Self-check of the audit's extraction: rasterise the ACTUAL render meshes (upward faces higher than 2 m, top-down)
// of a module and compare with the mask the audit derives from the collision data. usage: node tools/map_audit_selfcheck.mjs banwon lebon gyeongbu_east
import * as THREE from 'three';
import fs from 'node:fs'; import path from 'node:path'; import url from 'node:url';
import { Grid, bboxOf } from './map_audit_lib.mjs';
import { builtMask } from './map_audit_fp.mjs';
const ROOT = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '..');
const ctx = new Proxy({}, { get: (t, k) => k === 'measureText' ? (s => ({ width: String(s).length * 10 })) : k === 'createLinearGradient' || k === 'createRadialGradient' || k === 'createPattern' ? (() => ({ addColorStop() { } })) : k === 'getImageData' ? (() => ({ data: new Uint8ClampedArray(4) })) : (typeof k === 'string' && /^[a-z]/.test(k) && !['canvas', 'font', 'fillStyle', 'strokeStyle', 'lineWidth', 'textAlign', 'textBaseline', 'globalAlpha', 'globalCompositeOperation', 'shadowColor', 'shadowBlur', 'lineCap', 'lineJoin', 'filter', 'imageSmoothingEnabled'].includes(k) ? () => { } : t[k]), set: (t, k, v) => { t[k] = v; return true; } });
globalThis.__makeCanvas = (w, h) => ({ width: w, height: h, getContext: () => ctx, style: {} });
const { createPhysics } = await import('../js/physics.js'); const { createKit } = await import('../js/kit.js');
const osm = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/osm.json'), 'utf8')), built = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/map-audit/.cache/built.json'), 'utf8'));
for (const id of process.argv.slice(2)) {
  const phys = createPhysics(), scene = new THREE.Scene(), K = createKit(THREE, scene, { osm, phys }); K.onNight = () => { };
  const m = await import(url.pathToFileURL(path.join(ROOT, 'js/places', id + '.js')).href); K._.setCurrent(id, m.meta); m.build(K); K._.finalize();
  const claims = m.meta.claims.map(c => osm.buildings.find(b => b.id === c)), bb0 = bboxOf(claims.flatMap(b => b.poly)), bb = [bb0[0] - 30, bb0[1] - 30, bb0[2] + 30, bb0[3] + 30];
  const M = new Grid(bb, 0.5); let tris = 0;
  scene.traverse(o => { if (!o.isMesh || o.isInstancedMesh) return; const g = o.geometry, p = g.attributes.position, idx = g.index; o.updateWorldMatrix(true, false); const v = [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()]; const n = idx ? idx.count : p.count;
    for (let i = 0; i < n; i += 3) { for (let k = 0; k < 3; k++) v[k].fromBufferAttribute(p, idx ? idx.getX(i + k) : i + k).applyMatrix4(o.matrixWorld); if (Math.min(v[0].y, v[1].y, v[2].y) < 2) continue; const e1 = v[1].clone().sub(v[0]), e2 = v[2].clone().sub(v[0]), nn = e1.cross(e2).normalize(); if (Math.abs(nn.y) < 0.9) continue; tris++; M.fillRings([[[v[0].x, v[0].z], [v[1].x, v[1].z], [v[2].x, v[2].z]]]); } });
  const A = builtMask(built.places[id], bb, 'above'), Mf = M.fillHoles(), Af = A.fillHoles();
  const inter = Mf.and(Af).count(), uni = Mf.or(Af).count();
  for (const [lab, D] of [['mesh-only', Mf.minus(Af)], ['collision-only', Af.minus(Mf)]]) console.log('  ' + lab, D.erode(0.6).components(15).sort((a, b) => b.area - a.area).slice(0, 5).map(c => `${Math.round(c.area)} m2 @(${c.cx.toFixed(0)},${c.cz.toFixed(0)})`).join('  '));
  console.log(`${id}: meshRoofTris ${tris}  meshMask ${Mf.area().toFixed(0)} m2  collisionMask ${Af.area().toFixed(0)} m2  IoU ${(inter / uni).toFixed(3)}`);
}
