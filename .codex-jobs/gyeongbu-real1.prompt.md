You are a senior 3D/web engineer working on a first-person three.js reconstruction of the 고속터미널 area in Seoul (real OpenStreetMap geometry). Module id: `gyeongbu` → js/places/gyeongbu.js (서울고속버스터미널 (경부·영동선)).

The user, who knows the place, reviewed the current build and said (Korean, translated): "a lot of it looks drawn from imagination; the Shinsegae exterior, the bus terminal (고터) exterior and the parking lots are not implemented even roughly; it rather feels like an airport mixed with a railway station." Your job is to make this module match REALITY using the reference imagery below. Prefer the references over the current code and over older research notes.

Read: AGENTS.md, docs/PLACE_API.md, docs/BUILD_BRIEF.md, js/kit.js (know exactly what each K function does), js/places/_junctions.js, the current js/places/gyeongbu.js, data/research/gyeongbu.json.

Reference material (ground truth):
- Aerial photo refs/aerial/gyeongbu_lots.jpg: north up, yellow grid every 10 m labelled every 50 m in THIS world's coordinates (x east, z south), cyan = OSM footprints. It is slightly off-nadir (tall buildings lean and cast long shadows), so judge positions at ground contact; OSM footprints stay authoritative for walls.
- Kakao roadview captures (2025): refs/roadview/gb_*.jpg with descriptions in refs/roadview/manifest.json.
- Photos and visual notes: refs/photos/gyeongbu/ and data/research/gyeongbu_visual.json.
The most important images are attached; open the others with your image viewer tool.

What to do (priority order):
1. Massing per the aerial: the L-shaped complex — the tall west wing (~10 floors) along the access road, the lower north wing along 신반포로; the angled (sawtooth) bus boarding bays with canopies along the west wing's east side (visible in the aerial around x 120..170, z -60..20) with buses parked nose-in; the large bus parking yard inside/east of the L filled with intercity buses in rows exactly like the aerial (OSM parking areas 1173093432, 1173093433, 1173093434, 1173096051, 356129681) and the car park with stall lines and cars (OSM area 1173093431); cars on the rooftop parking of the wing where the aerial shows them, with the ramp if visible. Put these area ids in meta.claimAreas and model them yourself (K.vehicle buses/cars, stall lines, bay markings, canopies, kerbs, lamp posts).
2. Exterior facade per roadview/photos: materials, colours, window rhythm, the real main sign text/position.
3. 1F 대합실 and 승차홈 as a real Korean express-bus terminal per the photos: remove airport/railway idioms (English-first 'DEPARTURES' boards, '게이트', glass gate lounges); use 승차홈 numbers, 매표소/무인발권기, Korean destination boards as photographed.
4. 3F 꽃도매상가 per photos.

Rules:
- Everything visible must be justified by a reference (aerial / roadview / photo / research). Where nothing shows a detail, keep it plain and neutral rather than inventing features. Record every remaining guess in data/research/gyeongbu.json under "modeling.guesses".
- This is a Korean express-bus terminal complex, not an airport or a railway station: no GATE/게이트, no English-first DEPARTURES/ARRIVALS boards, no airport-style glass gate lounges, no railway platform styling, unless a reference shows it.
- Keep: the real floor count, interiors the research supports, every junction/well in js/places/_junctions.js that names this module, 3–12 spawns, elevators that list all floors, zones (they feed the map), the module's OSM building claims.
- Budget: ≤ 130k quads for this module (node tests/smoke.mjs prints quads). Prefer K.box/K.prism/K.vehicle; no per-frame allocation.
- Touch ONLY js/places/gyeongbu.js and data/research/gyeongbu.json. Other agents are editing other modules in this folder right now. No git commit. No engine edits (report engine problems instead).
- Must pass: `node tests/smoke.mjs gyeongbu gotomall` (prints OK) and `node tests/walk.mjs` (it builds every module; 0 blocked — if a failure is clearly caused by another module that is mid-edit, say so). tests/shot.mjs cannot run inside your sandbox; the operator renders screenshots for you between rounds.
Final answer: what you changed, which reference justified each major element, remaining guesses.
