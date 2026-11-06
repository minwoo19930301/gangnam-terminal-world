Module `gyeongbu` → js/places/gyeongbu.js (서울고속버스터미널 경부·영동선), round 5 — INTERIORS.
Areas: refs/interior/gb_hall (1F 대합실/통로, 매표소 TICKETS 구역, 무인발권기, 승차홈 출입문, 하차장 입구, B1 다이소) and refs/interior/gb_flower (3F 꽃도매상가).
Key facts from the notes (verify in the photos): the 1F hall is mostly a long, fairly narrow concourse with a yellow tactile line down the middle, metal benches, food/shop stalls (던킨, 할리스 …) along the sides, white tile ceiling with downlights and fluorescent strips about 3–3.5 m, grey stone-pattern floor; the renovated ticket zone has white curved ceiling coves, a 'TICKETS 매표·환불' wall, a row of kiosks and a black LED timetable; hanging brown/gold direction panels like '승차홈 1~16 DEPARTURE'; boarding doors are glass double doors each with a tall digital board listing departures. The 3F flower market: glossy green epoxy floor, low flat white acoustic-tile ceiling (~2.6–3 m) with rows of fluorescent strips and green exit signs, narrow aisles (main 2.5–3 m, side 1.5–2 m), dense stalls piled with wrapped bunches in buckets/stepped crates, blue/white shelving, green hanging stall-name boards, the artificial-flower/Christmas and supplies (vases, baskets) sections, the glass entrance with the black '3 | 꽃 도매상가(생화·조화) Flower Wholesaler' sign.

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
- Must pass `node tests/smoke.mjs gyeongbu gotomall` (OK) and `node tests/walk.mjs` (0 blocked; if a failure is in another module that is mid-edit, say so). tests/shot.mjs cannot run in your sandbox — the operator will render and compare afterwards.
- Record remaining guesses in data/research/gyeongbu.json → modeling.guesses. Final answer: which spaces you traced from which photos, and what is still a guess.
