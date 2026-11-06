Module `gotomall` → js/places/gotomall.js (고투몰, 강남터미널 지하도상가), round 5 — INTERIOR.
Area: refs/interior/gotomall (one 2026-11 visit, 21 photos).
Trace: main aisle ~5–6 m wide, ~3–3.5 m high; speckled grey granite floor (beige-brown polished tile in the apparel stretch); dark ceiling with oval white cove panels and warm downlights; open-front shops 3–5 m wide with no doors, racks and mannequins spilling into the aisle, hand-made sale banners and yellow/pink price placards; black hanging signs with white shop names; the 중앙광장 with round dark-granite bench rings on a black-and-white diagonal inlay floor, curved white cove ceiling, orange info counter, curved ivy planter + water feature, black GOTOMALL gate sign with orange logo; florist/bag stalls. Apply this look along the whole mall (zones keep their real names).

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
- Must pass `node tests/smoke.mjs gotomall station shinsegae gyeongbu centralcity banpo_shoppingtown` (OK) and `node tests/walk.mjs` (0 blocked; if a failure is in another module that is mid-edit, say so). tests/shot.mjs cannot run in your sandbox — the operator will render and compare afterwards.
- Record remaining guesses in data/research/gotomall.json → modeling.guesses. Final answer: which spaces you traced from which photos, and what is still a guess.
