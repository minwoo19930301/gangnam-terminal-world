Module `jwmarriott` → js/places/jwmarriott.js (JW 메리어트 호텔 서울), round 5 — INTERIORS.
Area: refs/interior/jw (20 photos, 2026).
Trace: double-height ground entrance hall with two huge round dark-walnut columns (~1.2 m), timber-lattice ceiling, tall hanging white ceramic-bead sculpture over a round plinth, polished honey/cream stone floor; lift lobby clad in beige/rose travertine with dark bronze lift doors and an aubergine floor directory with small white text; 8F lobby lounge 'The Lounge' with a full-height glass wall behind terracotta/copper sheer curtains, a grand piano, a long terracotta L-sofa; Flavors restaurant, Executive Lounge and 5F ballroom foyer per the photos. Keep the tower exterior.

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
- Must pass `node tests/smoke.mjs jwmarriott shinsegae centralcity` (OK) and `node tests/walk.mjs` (0 blocked; if a failure is in another module that is mid-edit, say so). tests/shot.mjs cannot run in your sandbox — the operator will render and compare afterwards.
- Record remaining guesses in data/research/jwmarriott.json → modeling.guesses. Final answer: which spaces you traced from which photos, and what is still a guess.
