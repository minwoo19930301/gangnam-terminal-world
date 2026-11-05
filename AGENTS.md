# Agent guide (Claude / Codex)

First-person web reconstruction of the 고속터미널 area (Seoul) on real OpenStreetMap geometry. Static site (three.js r160 via CDN importmap, no build step), deployed to GitHub Pages.

- Read `docs/PLACE_API.md` before writing a place module. It defines the coordinate system (x=east, z=south, y=up, meters, origin = 고속터미널역, street level y=0, `K.LEVELS` for basements) and the whole `K` construction API.
- Real geometry: `data/osm.json` (footprints, roads, POIs, subway exits) and the maps `docs/overview.png`, `docs/overview-core.png`, `docs/overview-park.png` (same coordinates).
- Cross-module connections: `js/places/_junctions.js` (JUNCTIONS + WELLS). Honor every entry naming your module.
- Research notes per place: `data/research/<id>.json`.

Rules for a module task:
- Touch ONLY `js/places/<id>.js`, `data/research/<id>.json`, `shots/<id>/`. Never edit engine files (`js/kit.js`, `js/physics.js`, `js/city.js`, `js/main.js`, `js/textures.js`, `tests/*`). Report engine bugs in your final answer instead.
- Never `git commit` / push.
- Must pass: `node tests/smoke.mjs <id>` (prints OK). Also run it together with neighbours you connect to, e.g. `node tests/smoke.mjs gotomall shinsegae`.
- Look at your work: `node tests/shot.mjs --places <id> --city 0 --out shots/<id> --views "name:x,y,z,yawDeg,pitchDeg;…"` then open the PNGs (yaw 0 = north, 90 = west, 180 = south, 270 = east).
- All in-world text Korean (and brand names as written on real signs). Use real tenant/brand names from research.
