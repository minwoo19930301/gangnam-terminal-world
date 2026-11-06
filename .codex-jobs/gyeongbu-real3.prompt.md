Module `gyeongbu` → js/places/gyeongbu.js (서울고속버스터미널, 경부·영동선), round 3. Neighbours for smoke: gotomall.

The user said the bus terminal (고터) exterior and the parking looked imagined / airport-like. New 2026 roadview shows the real 신반포로 side. Match it:
1. gb_01 / gb_02: the NORTH wing along 신반포로 is a LOW, long, 2-storey building (~8–9 m), tan/beige-brown with horizontal bands, a continuous upper balcony/arcade and a ground-floor arcade with shop signs. The current model has a big pale block with a red curved canopy and giant "고속버스터미널" letters there (cmp.png rows 3–4, ssg01_gb01.png right) — replace it with the real low arcade building. Check the aerial for its depth and roof.
2. In front of the north wing (between it and 신반포로): the surface car park "서울고속버스터미널 광장주차장" with stall lines and parked cars, a white railing fence along the sidewalk and a row of big plane trees (gb_01/02, aerial).
3. gb_04 (THE iconic view): the west wing is a big cream/white STEPPED building (tiers set back one by one); a long horizontal Korean tenant sign band along an upper tier; a large LED screen on the roof corner; at its north-west end a tall TERRACOTTA / salmon-brick sloped TRIANGULAR end wall plus a white vertical sign tower with "서울고속버스터미널". Keep/fix these so the view from (160,0,-165) looking west resembles gb_04.
4. gb_03: at the terminal's pedestrian entrance from 신반포로, a white steel ARCH carrying a wing-shaped glass canopy over the walkway. Place it on the terminal's own forecourt (use the aerial to find the walkway); if the 신반포로 bus shelters fall in your area, a row of dark steel shelters with ad lightboxes.
5. Keep the improvements of rounds 1–2 that match the aerial (sawtooth bays, bus yard rows, car park, rooftop cars). Coaches must look like intercity coaches (white/red/blue liveries), not sedans.

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
