You are a senior 3D/web engineer working on a first-person three.js reconstruction of the 고속터미널 area in Seoul (real OpenStreetMap geometry). Module id: `shinsegae` → js/places/shinsegae.js (신세계백화점 강남점).

The user, who knows the place, reviewed the current build and said (Korean, translated): "a lot of it looks drawn from imagination; the Shinsegae exterior, the bus terminal (고터) exterior and the parking lots are not implemented even roughly; it rather feels like an airport mixed with a railway station." Your job is to make this module match REALITY using the reference imagery below. Prefer the references over the current code and over older research notes.

Read: AGENTS.md, docs/PLACE_API.md, docs/BUILD_BRIEF.md, js/kit.js (know exactly what each K function does), js/places/_junctions.js, the current js/places/shinsegae.js, data/research/shinsegae.json.

Reference material (ground truth):
- Aerial photo refs/aerial/shinsegae_centralcity.jpg: north up, yellow grid every 10 m labelled every 50 m in THIS world's coordinates (x east, z south), cyan = OSM footprints. It is slightly off-nadir (tall buildings lean and cast long shadows), so judge positions at ground contact; OSM footprints stay authoritative for walls.
- Kakao roadview captures (2025): refs/roadview/ssg_*.jpg with descriptions in refs/roadview/manifest.json.
- Photos and visual notes: refs/photos/shinsegae/ and data/research/shinsegae_visual.json.
The most important images are attached; open the others with your image viewer tool.

What to do (priority order):
1. Exterior to match the references: facade materials/colours (roadview shows warm brown granite panels and dark steel/glass, NOT red brick), window rhythm, the black steel-and-glass grid canopy on columns over the main 신반포로 entrance, show windows with red SHINSEGAE awnings beside it, glass entrance doors with the small red SHINSEGAE logo; the real massing/heights of the main building and the newer volume (use aerial + photos), roof line and rooftop signage only where photos show it.
2. Remove invented exterior elements that no reference supports (e.g. giant self-lit letters on several faces, made-up show-window brand lists) unless a photo shows them.
3. Parking: model the store's parking entrance(s)/ramps where the references show them.
4. Interiors may stay, but replace anything airport-like or invented-looking you notice.

Rules:
- Everything visible must be justified by a reference (aerial / roadview / photo / research). Where nothing shows a detail, keep it plain and neutral rather than inventing features. Record every remaining guess in data/research/shinsegae.json under "modeling.guesses".
- This is a Korean express-bus terminal complex, not an airport or a railway station: no GATE/게이트, no English-first DEPARTURES/ARRIVALS boards, no airport-style glass gate lounges, no railway platform styling, unless a reference shows it.
- Keep: the real floor count, interiors the research supports, every junction/well in js/places/_junctions.js that names this module, 3–12 spawns, elevators that list all floors, zones (they feed the map), the module's OSM building claims.
- Budget: ≤ 130k quads for this module (node tests/smoke.mjs prints quads). Prefer K.box/K.prism/K.vehicle; no per-frame allocation.
- Touch ONLY js/places/shinsegae.js and data/research/shinsegae.json. Other agents are editing other modules in this folder right now. No git commit. No engine edits (report engine problems instead).
- Must pass: `node tests/smoke.mjs shinsegae gotomall centralcity jwmarriott` (prints OK) and `node tests/walk.mjs` (it builds every module; 0 blocked — if a failure is clearly caused by another module that is mid-edit, say so). tests/shot.mjs cannot run inside your sandbox; the operator renders screenshots for you between rounds.
Final answer: what you changed, which reference justified each major element, remaining guesses.
