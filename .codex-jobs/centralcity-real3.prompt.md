Module `centralcity` → js/places/centralcity.js (센트럴시티: 호남선 터미널 · 파미에스테이션), round 3. Neighbours for smoke: shinsegae jwmarriott station gotomall.

New 2026 roadview cc_01 shows the real main-gate plaza on 신반포로 (north tip). Match it:
1. Main gate: two short brown-brick pylons with a glass canopy between, a big circular "C" emblem on a glass panel above the entrance, a dark sign "CENTRAL CITY". It must sit between the Shinsegae west tower (left in cc_01) and the glass GOTO MALL entrance canopy (right).
2. Plaza: THREE large dark stone spheres (~2 m diameter, round — use K.dome/sphere-like geometry with a stone colour, not a flat black disc) standing on the granite plaza, trees, granite paving, bench. Compare cmp.png row 2 (current model: one flat black disc, odd grey slab structure on the right — if that grey structure is yours and no reference shows it, remove it).
3. cc_02: the 신반포로 frontage west of the gate — check what of it is yours (terminal block) and match colours/materials (tan/beige block, LED screen on the roof if it is your building per aerial/OSM).
4. Keep the 호남선 bus yard / rooftop parking / boarding hall work from rounds 1–2 that matches the aerial and photos.

## Reference material (ground truth)
- NEW Kakao roadview frames captured 2025-06 / 2026-06 by the operator, described one by one in refs/roadview/manifest.json (read it): refs/roadview/ssg_*.jpg (Shinsegae), gb_*.jpg (경부선 terminal), cc_*.jpg (센트럴시티), bp_*.jpg (반포쇼핑타운 / 신반포로).
- shots/r3cmp/cmp.png: side-by-side comparison, LEFT = roadview, RIGHT = the current model rendered from roughly the same standing point. Camera positions used for the model renders (x, y=feet, z, yawDeg; yaw 0 = looking north/-z, 90 = west, 180 = south, 270 = east):
  ssg06 = (-58, 0, -100, 190)  · cc01 = (-150, 0, -62, 215) · gb04 = (160, 0, -165, 105) · gb03 = (60, 0, -140, 180) · ssg01 = (-93, 0, -52, 180) · gb01 = (200, 0, -185, 180)
- Aerial photos in world coordinates (north up, yellow grid 10 m, labels every 50 m; slightly off-nadir): refs/aerial/shinsegae_centralcity.jpg, refs/aerial/gyeongbu_lots.jpg.
- Older photos and notes: refs/photos/<id>/, data/research/<id>_visual.json (2008–2016; the 2025/2026 roadview wins when they disagree).

## Rules
- Read AGENTS.md, docs/PLACE_API.md, js/kit.js, js/places/_junctions.js and the current module first.
- Everything visible must be justified by a reference. Where nothing shows a detail, keep it plain rather than inventing. Record remaining guesses in data/research/<id>.json → modeling.guesses.
- Korean express-bus terminal complex, not an airport/railway: no GATE/게이트, no English-first DEPARTURES boards, no airport glass lounges.
- Keep floor counts, junctions/wells naming this module, spawns (3–12), elevators listing all floors, zones, OSM claims. ≤ 130k quads.
- Touch ONLY your module file and its data/research json. Other Codex jobs are editing the other modules in this folder at the same time. No git commit. No engine edits.
- Must pass `node tests/smoke.mjs <id> <neighbours>` (OK) and `node tests/walk.mjs` (0 blocked; if a failure is in another module that is mid-edit, say so). tests/shot.mjs cannot run in your sandbox.
- Final answer: what changed, which reference justified each element, remaining guesses.
