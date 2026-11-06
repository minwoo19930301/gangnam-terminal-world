Module `shinsegae` → js/places/shinsegae.js (신세계백화점 강남점), round 5 — INTERIORS (+ one exterior colour fix).
Area: refs/interior/ssg_food (B1 하우스 오브 신세계 푸드홀, 스위트파크, 신세계 마켓/식품관; some 1F).
Trace: House of Shinsegae — honey-orange wood-panel walls with uplights every ~1.5 m, round velvet armchairs on Persian-style rugs in a ~2-storey void, connecting corridor ~4 m wide with a stepped white plaster rib ceiling and dark marble parquet with dot inlays, wood gate with gold serif 'HOUSE OF SHINSEGAE' plaque and white globe lamps. Sweet Park — cream ribbed groin-vault ceiling ~4.5–5 m with cove LED along every rib, white-globe-cluster chandeliers on black rings, black-and-white checker marble floor (~60–70 cm squares), octagonal island vitrines (marble top, dark-wood skirt, brass-framed glass) with queue stanchions, arched wooden stall fronts. Use notes.json for the rest (food market aisles etc.).
Exterior colour fix (from the latest roadview comparison): the two north towers are now too LIGHT PINK. The roadview stone is a deeper brown-mauve / red-brown (around #8a6560 to #7a5550) with visible brick-like horizontal joint lines — darken it accordingly (keep everything else of the exterior).

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
- Must pass `node tests/smoke.mjs shinsegae gotomall centralcity jwmarriott` (OK) and `node tests/walk.mjs` (0 blocked; if a failure is in another module that is mid-edit, say so). tests/shot.mjs cannot run in your sandbox — the operator will render and compare afterwards.
- Record remaining guesses in data/research/shinsegae.json → modeling.guesses. Final answer: which spaces you traced from which photos, and what is still a guess.
