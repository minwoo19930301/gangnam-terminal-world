You are a senior 3D/web engineer working on a first-person three.js reconstruction of the 고속터미널 area in Seoul (real OpenStreetMap geometry). Module id: `centralcity` → js/places/centralcity.js (센트럴시티 (호남선 터미널 · 파미에스테이션)).

The user, who knows the place, reviewed the current build and said (Korean, translated): "a lot of it looks drawn from imagination; the Shinsegae exterior, the bus terminal (고터) exterior and the parking lots are not implemented even roughly; it rather feels like an airport mixed with a railway station." Your job is to make this module match REALITY using the reference imagery below. Prefer the references over the current code and over older research notes.

Read: AGENTS.md, docs/PLACE_API.md, docs/BUILD_BRIEF.md, js/kit.js (know exactly what each K function does), js/places/_junctions.js, the current js/places/centralcity.js, data/research/centralcity.json.

Reference material (ground truth):
- Aerial photo refs/aerial/shinsegae_centralcity.jpg: north up, yellow grid every 10 m labelled every 50 m in THIS world's coordinates (x east, z south), cyan = OSM footprints. It is slightly off-nadir (tall buildings lean and cast long shadows), so judge positions at ground contact; OSM footprints stay authoritative for walls.
- Kakao roadview captures (2025): refs/roadview/cc_*.jpg with descriptions in refs/roadview/manifest.json.
- Photos and visual notes: refs/photos/centralcity/ and data/research/centralcity_visual.json.
The most important images are attached; open the others with your image viewer tool.

What to do (priority order):
1. Exterior of the 호남선 terminal/센트럴시티 per roadview/photos (materials, colours, signage text/position, canopies).
2. The 호남선 bus yard / boarding area per the aerial (OSM parking area 1173096801 around x -209..-99, z 57..185 shows buses parked in rows and bays): bays, canopies, buses (K.vehicle), markings; put the area id in meta.claimAreas and model it yourself.
3. Parking: rooftop car parking (cars on the roof in the aerial), ramps and entrances where the references show them.
4. 1F 대합실: replace airport idioms ('게이트 10/11', English-first boards, glass gate lounges) with what the photos show for the 호남선 terminal (승차홈 numbers, 매표소, Korean boards).
5. 파미에스테이션 round building exterior per references.

Rules:
- Everything visible must be justified by a reference (aerial / roadview / photo / research). Where nothing shows a detail, keep it plain and neutral rather than inventing features. Record every remaining guess in data/research/centralcity.json under "modeling.guesses".
- This is a Korean express-bus terminal complex, not an airport or a railway station: no GATE/게이트, no English-first DEPARTURES/ARRIVALS boards, no airport-style glass gate lounges, no railway platform styling, unless a reference shows it.
- Keep: the real floor count, interiors the research supports, every junction/well in js/places/_junctions.js that names this module, 3–12 spawns, elevators that list all floors, zones (they feed the map), the module's OSM building claims.
- Budget: ≤ 130k quads for this module (node tests/smoke.mjs prints quads). Prefer K.box/K.prism/K.vehicle; no per-frame allocation.
- Touch ONLY js/places/centralcity.js and data/research/centralcity.json. Other agents are editing other modules in this folder right now. No git commit. No engine edits (report engine problems instead).
- Must pass: `node tests/smoke.mjs centralcity shinsegae jwmarriott station gotomall` (prints OK) and `node tests/walk.mjs` (it builds every module; 0 blocked — if a failure is clearly caused by another module that is mid-edit, say so). tests/shot.mjs cannot run inside your sandbox; the operator renders screenshots for you between rounds.
Final answer: what you changed, which reference justified each major element, remaining guesses.
