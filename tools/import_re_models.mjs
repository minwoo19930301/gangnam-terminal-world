// Import apartment models from the user's own seoul-real-estate-map repo (github.com/minwoo19930301/seoul-real-estate-map)
// into this world: picks the models inside our map, compresses them (merge meshes, quantize, meshopt; no visible
// simplification) into assets/re/, and writes js/places/_re_models.json with world placement, footprint and the OSM
// buildings each model replaces (the generic city skips those; their outlines still block walking).
// usage: NODE_PATH=<dir with @gltf-transform/*, meshoptimizer> node tools/import_re_models.mjs <path to seoul-real-estate-map> [--jobs 6]
import { addEstateSilhouettes } from './estate_silhouettes.mjs';
import fs from 'node:fs'; import path from 'node:path'; import url from 'node:url'; import { createRequire } from 'node:module';
const ROOT = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '..');
const SRC = process.argv[2]; if (!SRC) { console.error('usage: node tools/import_re_models.mjs <seoul-real-estate-map dir>'); process.exit(1); }
const jobsIndex = process.argv.indexOf('--jobs');
const JOBS = jobsIndex < 0 ? 6 : Number(process.argv[jobsIndex+1]);
if (!Number.isSafeInteger(JOBS) || JOBS < 1) throw new Error('--jobs requires a positive integer');
const req = createRequire(path.join(process.env.NODE_PATH || ROOT, 'x.js'));
const { NodeIO } = req('@gltf-transform/core'); const { ALL_EXTENSIONS } = req('@gltf-transform/extensions');
const F = req('@gltf-transform/functions'); const { MeshoptDecoder, MeshoptEncoder, MeshoptSimplifier } = req('meshoptimizer');
await Promise.all([MeshoptDecoder.ready, MeshoptEncoder.ready, MeshoptSimplifier.ready]);
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.decoder': MeshoptDecoder, 'meshopt.encoder': MeshoptEncoder });
const osm = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/osm.json'), 'utf8'));
const META = JSON.parse(fs.readFileSync(path.join(ROOT, 'js/places/_meta.json'), 'utf8'));
const { lat: LAT0, lon: LON0, kx: KX, kz: KZ } = osm.origin;
const W = (lon, lat) => [(lon - LON0) * KX, (LAT0 - lat) * KZ];
const [BX0, BZ0, BX1, BZ1] = osm.bbox;
const inMap = (x, z) => x >= BX0 && x <= BX1 && z >= BZ0 && z <= BZ1;
const moduleClaims = new Set(Object.values(META).flatMap(v => v.claims || []));
const SKIP_IDS = new Set(['bespoke-seoul-express-terminal', 'bespoke-banpo-jamsu']); // built by our own modules (gyeongbu, hangang)
const KEEP_CAT = new Set(['apartment', 'residential-apartment', 'major-apartment-complex', 'residential-villa', 'residential-officetel', 'k12-school', 'district-public-office']);

const bespoke = JSON.parse(fs.readFileSync(path.join(SRC, 'public/models/bespoke-manifest.json'), 'utf8')).assets;
const generic = JSON.parse(fs.readFileSync(path.join(SRC, 'public/models/manifest.json'), 'utf8')).assets;
const superseded = new Set(bespoke.flatMap(a => a.supersedes || []));
const cand = [];
for (const a of bespoke) { const c = a.coordinate; if (!c || SKIP_IDS.has(a.id) || !KEEP_CAT.has(a.category)) continue; const [x, z] = W(c.lon, c.lat); if (inMap(x, z)) cand.push({ a, x, z, kind: 'bespoke' }); }
for (const a of generic) { const c = a.coordinate; if (!c || superseded.has(a.id) || !KEEP_CAT.has(a.category)) continue; const [x, z] = W(c.lon, c.lat); if (inMap(x, z)) cand.push({ a, x, z, kind: 'generic' }); }

// footprint of a placed model: its GLB bounds rotated by yaw (CCW from east, seen from above) around the origin
async function boundsOf(file) { const doc = await io.read(file); const b = F.getBounds(doc.getRoot().listScenes()[0]); return { min: b.min, max: b.max, doc }; }
function rectOf(x, z, yawDeg, min, max) {
  const t = yawDeg * Math.PI / 180, c = Math.cos(t), s = Math.sin(t); // three.js rotation.y = +t maps local +x to world (c, -s)
  return [[min[0], min[2]], [max[0], min[2]], [max[0], max[2]], [min[0], max[2]]].map(([u, v]) => [x + u * c + v * s, z - u * s + v * c]);
}
function inPoly(px, pz, P) { let ins = false; for (let i = 0, j = P.length - 1; i < P.length; j = i++) { const [xi, zi] = P[i], [xj, zj] = P[j]; if (((zi > pz) !== (zj > pz)) && px < (xj - xi) * (pz - zi) / (zj - zi) + xi) ins = !ins; } return ins; }
const centroid = poly => { let x = 0, z = 0; for (const p of poly) { x += p[0]; z += p[1]; } return [x / poly.length, z / poly.length]; };
const bcent = osm.buildings.map(b => ({ b, c: centroid(b.poly) }));

const outDir = path.join(ROOT, 'assets/re'); fs.mkdirSync(outDir, { recursive: true });
const catalogPath = path.join(ROOT, 'js/places/_re_models.json');
const previous = fs.existsSync(catalogPath) ? JSON.parse(fs.readFileSync(catalogPath, 'utf8')).models : [];
const nativeEdits = new Map(previous.filter(model => model.nativeEdit).map(model => [model.id, model]));
// These five models were separated along the named tower footprints in Blender.
const towers = JSON.parse(fs.readFileSync(path.join(ROOT,'assets/models/banpo-apartments/towers.json'),'utf8'));
const reserved = new Set(Object.values(towers).flat());
const records = [], taken = new Set();
let done = 0;
async function work(item) {
  const { a, x, z, kind } = item;
  const edit = nativeEdits.get(a.id);
  const native = Boolean(edit || towers[a.id]);
  const src = native ? path.join(ROOT, edit?.file ?? `assets/re/${a.id}.glb`) : path.join(SRC, 'public/models', a.model);
  if (native && !fs.existsSync(src)) throw new Error(`Missing edited GLB ${src}; export its Blender collection first`);
  if (!fs.existsSync(src)) { console.log('missing', a.model); return; }
  const { min, max, doc } = await boundsOf(src);
  const yaw = a.yawDegFromEast || 0;
  const placedX = Math.round(x*100)/100, placedZ = Math.round(z*100)/100;
  const rect = rectOf(towers[a.id] ? placedX : x, towers[a.id] ? placedZ : z, yaw, min, max);
  // generic complex models that overlap a bespoke model are dropped (the bespoke one is better)
  const claims = towers[a.id] ?? bcent.filter(({ b, c }) => !reserved.has(b.id) && !moduleClaims.has(b.id) && (inPoly(c[0], c[1], rect) || b.poly.filter(p => inPoly(p[0], p[1], rect)).length * 2 >= b.poly.length)).map(({ b }) => b.id);
  const file = `assets/re/${a.id}.glb`;
  const sourceMaterial = ['apt-a10023673','apt-a13790828','apt-a10024913'].includes(a.id);
  if (!fs.existsSync(path.join(ROOT, file))) {
    await doc.transform(F.dedup(), F.prune(), F.flatten(), F.join({ keepNamed: false }), F.weld(), F.quantize(), F.meshopt({ encoder: MeshoptEncoder, level: 'medium' }));
    await io.write(path.join(ROOT, file), doc);
  }
  records.push({ id: a.id, name: a.nameKo || a.name || '', kind, category: a.category, x: placedX, z: placedZ, y: a.groundOffsetM || 0, yaw, rect: rect.map(p => p.map(v => Math.round(v * 10) / 10)), height: Math.round(max[1] * 10) / 10, claims, file, bytes: fs.statSync(path.join(ROOT, file)).size, ...(sourceMaterial ? { sourceMaterial } : {}), ...(native ? {nativeEdit:true} : {}) });
  if (++done % 20 === 0) console.log(done, '/', cand.length);
}
// bespoke first so overlapping generic complexes can be dropped afterwards
cand.sort((p, q) => (p.kind === 'bespoke' ? 0 : 1) - (q.kind === 'bespoke' ? 0 : 1));
for (let i = 0; i < cand.length; i += JOBS) await Promise.all(cand.slice(i, i + JOBS).map(work));
const bes = records.filter(r => r.kind === 'bespoke');
const overlap = (r, q) => r.rect.some(p => inPoly(p[0], p[1], q.rect)) || q.rect.some(p => inPoly(p[0], p[1], r.rect));
const final = records.filter(r => r.kind === 'bespoke' || towers[r.id] || !bes.some(q => overlap(r, q)));
for (const r of records) if (!final.includes(r)) { try { fs.unlinkSync(path.join(ROOT, r.file)); } catch (e) { } }
// Preserve existing valid owners when approximate rectangles overlap. Model
// decoding completes in parallel; the winning building must not depend on I/O.
const byId = new Map(final.map(model => [model.id, model]));
const bespokeClaims = new Set(bes.flatMap(model=>model.claims));
const retained = new Map();
for (const model of previous) {
  const next = byId.get(model.id);
  if (!next) continue;
  for (const id of model.claims) {
    if (next.claims.includes(id) && (next.kind === 'bespoke' || !bespokeClaims.has(id))) retained.set(id, model.id);
  }
}
const order = new Map(cand.map(({a},index)=>[a.id,index]));
final.sort((p,q)=>order.get(p.id)-order.get(q.id));
for (const r of final) r.claims = r.claims.filter(id =>
  (!retained.has(id) || retained.get(id) === r.id) && !taken.has(id) && taken.add(id));
final.sort((p, q) => p.id.localeCompare(q.id));
await addEstateSilhouettes(final, ROOT);
fs.writeFileSync(path.join(ROOT, 'js/places/_re_models.json'), JSON.stringify({ source: 'github.com/minwoo19930301/seoul-real-estate-map (bespoke-manifest.json, manifest.json)', note: 'sourceMaterial keeps the original glTF materials at runtime. Files may use meshopt compression. Placement from the source manifests.', models: final }));
const MB = final.reduce((s, r) => s + r.bytes, 0) / 1e6;
console.log(`models ${final.length} (bespoke ${final.filter(r => r.kind === 'bespoke').length}, generic ${final.filter(r => r.kind === 'generic').length}), ${MB.toFixed(1)} MB, OSM buildings replaced ${final.reduce((s, r) => s + r.claims.length, 0)}`);
