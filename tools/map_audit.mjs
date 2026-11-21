// Map-fidelity audit: how faithfully the hand-built place modules follow the real (OSM) map.
// usage: node tools/map_audit.mjs [--refresh] [--no-plot]
//   1. node tools/map_audit_extract.mjs        -> docs/map-audit/.cache/built.json (skipped when it exists, unless --refresh)
//   2. analyses (footprints, underground, exits, junctions, roads, landmarks, entrances)
//   3. docs/map-audit/findings.json (+ .cache/draw.json), then python3 tools/map_audit_plot.py for the PNGs
// Read-only with respect to js/ and data/. Writes only under docs/map-audit/.
import fs from 'node:fs'; import path from 'node:path'; import url from 'node:url'; import { spawnSync } from 'node:child_process';
import { analyzeClaims } from './map_audit_fp.mjs';
import { stairHeads, exitsAudit, undergroundAudit, junctionsAudit, roadsAudit, landmarksAudit } from './map_audit_more.mjs';
const ROOT = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'docs/map-audit'), CACHE = path.join(OUT, '.cache'); fs.mkdirSync(CACHE, { recursive: true });
const args = process.argv.slice(2), builtFile = path.join(CACHE, 'built.json');
if (args.includes('--refresh') || !fs.existsSync(builtFile)) { const r = spawnSync('node', [path.join(ROOT, 'tools/map_audit_extract.mjs'), builtFile], { stdio: 'inherit' }); if (r.status) process.exit(r.status); }
const osm = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/osm.json'), 'utf8')), built = JSON.parse(fs.readFileSync(builtFile, 'utf8'));
const META = JSON.parse(fs.readFileSync(path.join(ROOT, 'js/places/_meta.json'), 'utf8'));
const { LANDMARKS } = await import(url.pathToFileURL(path.join(ROOT, 'js/landmarks.js')).href);
const t0 = Date.now(), lap = s => console.log(`[${((Date.now() - t0) / 1000).toFixed(1)}s] ${s}`);
const owner = new Map(); for (const [id, r] of Object.entries(built.places)) for (const c of r.meta?.claims || []) owner.set(c, id);
const OVERLAP_SESSION = new Set(['famille', 'centralcity', 'jwmarriott', 'shinsegae', 'streets', 'landmarks']);   // modules (and landmarks.js) the other session is editing
const seenFp = new Set();
const A = { footprints: [], outsideClaims: [], floors: {}, masks: {} };
for (const id of Object.keys(built.places)) {
  const r = analyzeClaims(id, built.places[id], osm, owner, Object.fromEntries(Object.entries(built.places).filter(([k]) => !['hangang', 'jamwon_hangang', 'streets'].includes(k)))); if (!r) continue;
  for (const b of r.buildings) { const k = b.module + '|' + b.osmArea + '|' + b.osmCentroid?.join(','); if (seenFp.has(k)) continue; seenFp.add(k); A.footprints.push(b); } A.outsideClaims.push(...r.outsideClaims); A.floors[id] = r.floors; A.masks[id] = r._masks; lap('footprint ' + id);
}
const heads = stairHeads(built);
A.exits = exitsAudit(osm, built, heads); A.heads = heads; lap('exits');
A.underground = undergroundAudit(osm, built); lap('underground');
Object.assign(A, { junctions: null }); const J = junctionsAudit(built, osm); A.junctions = J.junctions; A.wells = J.wells; lap('junctions');
A.roads = roadsAudit(osm, built, Object.fromEntries(Object.entries(A.masks).map(([k, v]) => [k, { A: v.A, own: v.own, bb: v.bb }]))); lap('roads');
A.landmarks = landmarksAudit(osm, built, LANDMARKS, META); lap('landmarks');
// outlines for drawing (above-ground built mask edges per module, B1 mask for gotomall)
const draw = { outlines: {}, heads, exits: osm.exits };
for (const [id, m] of Object.entries(A.masks)) { draw.outlines[id] = m.A.edges().map(s => s.map(v => Math.round(v * 2) / 2)); if (id === 'gotomall') draw.outlines.gotomall_b1 = m.U.edges().map(s => s.map(v => Math.round(v * 2) / 2)); }
for (const [k, g] of Object.entries(A.underground.stationMasks)) draw.outlines['station_' + k] = g.edges().map(s => s.map(v => Math.round(v * 2) / 2)); delete A.underground.stationMasks;
fs.writeFileSync(path.join(CACHE, 'draw.json'), JSON.stringify(draw));
const strip = o => JSON.parse(JSON.stringify(o, (k, v) => k === '_masks' || k === 'masks' ? undefined : v));
fs.writeFileSync(path.join(CACHE, 'analysis.json'), JSON.stringify(strip({ ...A, masks: undefined, overlapSession: [...OVERLAP_SESSION] })));
lap('analysis.json written');
const { buildFindings } = await import('./map_audit_rank.mjs');
const F = buildFindings(A, osm, built, OVERLAP_SESSION);
fs.writeFileSync(path.join(OUT, 'findings.json'), JSON.stringify(F, null, 1)); lap(`findings.json: ${F.findings.length} findings`);
if (!args.includes('--no-plot')) { for (const n of fs.readdirSync(OUT)) if (/^(finding_|overview).*\.png$/.test(n)) fs.unlinkSync(path.join(OUT, n)); const r = spawnSync('python3', ['-I', path.join(ROOT, 'tools/map_audit_plot.py')], { stdio: 'inherit', cwd: ROOT }); if (r.status) console.log('plot step failed (status ' + r.status + ')'); }
