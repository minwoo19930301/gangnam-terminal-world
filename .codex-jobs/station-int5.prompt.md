Module `station` → js/places/station.js (고속터미널역 3·7·9호선), round 5 — INTERIORS.
Area: refs/interior/station (22 photos, 2025-02 … 2026-10).
Trace: transfer passages and concourses with low (~2.6–3 m) white grid ceilings with linear fluorescent lights; beige/grey marble-tile floors with yellow tactile guide lines (some checker/diamond inlays); line-colour round column panels (3호선 orange, 7호선 olive, 9호선 gold); dark grey hanging/wall panels with yellow '나가는 곳' and '갈아타는 곳' signs; marble slabs, stainless finishes and red-brick columns (센트럴시티 link hall); green 3호선 fare gates; walls full of ad lightboxes (~0.87×2.17 m) and LED screens; shop facades (pharmacy, cosmetics, 아트박스, clothes, convenience store) right up to the gates; 9호선 is much deeper — long escalators down to a wide 4–5 m-high branching hall with a curved oval ceiling.

## Reference material
- 2025–2026 Naver-blog photos of the interiors, traced for you: refs/interior/<area>/NN_*.jpg, with refs/interior/<area>/notes.json describing every photo (where it was taken, what it shows: floor/ceiling/wall materials and colours, lights, signage text/style, shop fronts, fixtures, density), plus "layout", "typical_dimensions", "palette", "not_like_airport". The contact sheets refs/interior/<area>/sheet_N.png are attached; open individual photos with your image viewer for detail.
- Older photos (refs/photos/, data/research/*_visual.json) only where no 2025–2026 photo shows that spot.
- Exterior references (refs/roadview/, refs/aerial/) still apply to the outside — do not regress the exterior that previous rounds matched.

## What to do
Trace the interiors from these photos as faithfully as the kit allows: the same floor finish and colour, ceiling type (tile grid, coves, trusses, vaults) and light fixtures, wall/column finishes, signage (real text, colours, mounting style — e.g. hanging panels vs fascias), the kind and density of shop/stall fronts and stock, furniture, and the proportions in notes.typical_dimensions. Lay spaces out per notes.layout. Where the photos show a space only partly, keep the rest plain rather than inventing. A local should recognise each space at a glance; nothing should read like an airport or a railway concourse.

## Rules
- Read AGENTS.md, docs/PLACE_API.md, js/kit.js and js/places/_junctions.js first, then the current module.
- Keep: real floor counts, every junction/well in _junctions.js that names this module (same coordinates and levels), 3–12 spawns (put spawns in the traced spaces), elevators listing all floors, zones (they feed the map), OSM claims, the exterior.
- Budget ≤ 140k quads for this module (smoke prints quads); prefer K.box/K.prism; repeated stock as simple boxes with varied colours; K.sign for signage text.
- Touch ONLY your module file and its data/research json. Other Codex jobs edit other modules in this folder right now. No git commit, no engine edits.
- Must pass `node tests/smoke.mjs station gotomall centralcity` (OK) and `node tests/walk.mjs` (0 blocked; if a failure is in another module that is mid-edit, say so). tests/shot.mjs cannot run in your sandbox — the operator will render and compare afterwards.
- Record remaining guesses in data/research/station.json → modeling.guesses. Final answer: which spaces you traced from which photos, and what is still a guess.
