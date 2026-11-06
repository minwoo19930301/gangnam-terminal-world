Module `shinsegae` → js/places/shinsegae.js (신세계백화점 강남점), round 3. Neighbours for smoke: gotomall centralcity jwmarriott.

The user (who knows the place) said the build looked imagined. New 2026 roadview now shows the real 신반포로-side exterior. Make the exterior match it:
1. ssg_06 + ssg_05 + cc_01: the north (신반포로) side is TWO tall, fairly slim SQUARE towers (east and west ends of the north face) clad in brown-red brick-like stone with fine horizontal joints (one even colour — tone down the current contrasty stripes). Each tower has one row of 5–6 small square dark windows just below the top, and the corner faces have small square windows in vertical columns. The towers are clearly taller and narrower than in the current model (compare cmp.png row 1).
2. Between the towers: a recessed curved glass atrium bay (cylinder segment), lower than the towers, with a glass curtain-wall volume behind/above it (the 신관). Not a flat full-height glass bow.
3. Logo: red flower emblem + white "SHINSEGAE" letters near the top of the EAST tower's north face, and on the WEST tower's west face (cc_01). Use a red flower-like emblem, not a star.
4. Giant vertical billboard panels at mid-height: one on each tower's north face and one on the west tower's west face (cc_01). Draw them as generic fashion/portrait posters (no real brand names), framed, not beige blank panels.
5. Main entrance (ssg_01/02): keep the deep black steel-and-glass grid canopy on black columns, glass doors with the small red logo, show windows with RED awnings left and right, granite walls, planters with conifers, the drive-up lane.
6. East side (ssg_03/04): stone east wall with the low dark steel pergola and two red awnings, the surface lot with blue accessible bays, pines.

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
