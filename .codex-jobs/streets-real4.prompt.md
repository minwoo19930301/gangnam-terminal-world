Module `streets` → js/places/streets.js (고속터미널 거리 (신반포로·사평대로 streetscape); this round you may also claim and model unclaimed OSM buildings the issues name (add their ids to meta.claims)), round 4. Neighbours for smoke: gotomall.

Independent reviewers compared the current build with 2025/2026 Kakao roadview frames, aerial photos and older photos (renders in shots/verify/). Fix every issue below, highest priority first, then re-check the rest still holds. The user, who knows the place, complained it looked imagined and airport/railway-like — every visible element must be justified by a reference.

## Issues to fix
- (high) The 르본시티 block (OSM 413280002, x-260..-204, z-5..45, h38) south of 신반포로 and west of CC renders as a dark blue glass curtain-wall office tower. In reality it is a tan/beige stone or brick 8-storey block with punched window rows, a large LED screen on the roof and a vertical sign. No place module claims this id, so it falls to the generic city fill.
  where: OSM 413280002; seen from the CC plaza looking west and along the south sidewalk
  evidence: refs/roadview/cc_02 (left half) shows the beige 8F block with a roof LED screen and a vertical red/brown sign on its east side. In the model (shots/verify/critic/rc2/cc02.png, s_w_e.png, cc_canopy.png) a blue glass curtain-wall tower stands there. A grep for 413280002 or 르본 in js/places returns nothing.
  FIX: Claim 413280002 in streets.js. Build a 38 m box in beige masonry (#c8a77a) with 8 rows of punched dark windows and a 1F shopfront band. Add a roof LED billboard about 12 m wide × 7 m tall, emissive with colourful content, on the NE corner facing east along 신반포로. Add a vertical sign about 1.5 m × 12 m on the east facade.
- (medium) Along the terminal frontage, the strip between the 신반포로 main carriageway and the bus service lanes is a 4-5 m brick sidewalk with tall street trees and lamp posts. In reality it is a narrow (about 1-1.5 m) raised grass median with concrete kerbs and no trees. The side lane and shelters therefore sit much closer to the main road.
  where: Strip between OSM 523344143/828782198 (신반포로) and service ways 1065783063/64/65/67 / busway 1420100042, x about 60-190, z about -175..-140
  evidence: refs/roadview/gb_04 and gb_05 show a low grass strip on a kerb immediately beside the main lane, then one side lane with arrows, then the shelters. gb_03 shows the same grass strip across the frame bottom. shots/verify/gyeongbu/gb04.png and gb04_sq.png show the camera on a wide brick walk with trees and a lamp post. shots/verify/gyeongbu/gb05_try.png shows the same.
  FIX: In the streets module, replace this sidewalk segment with a raised island 1.2 m wide and 0.18 m high: concrete kerb 0xb9b6ad with grass top 0x6f8f3e. Remove the trees and lamps on it and move the lamps to the shelter sidewalk. Keep the island continuous apart from the crossing at x about 137-148.
- (medium) Along the terminal front the model has a ~6 m checker-paved median with tall lamps and lollipop trees between the main carriageway and the terminal-side lane. The shelters there are light glass boxes with blank white panels. In reality there is only a narrow grass verge on a low kerb, and a long continuous row of dark charcoal steel shelters with large backlit ad lightboxes.
  where: 신반포로 south side, x≈60..330 (terminal frontage)
  evidence: refs/roadview/gb_04, gb_05 and gb_03 show a grass verge about 1.5 m wide and dark shelters with big eye/face ad panels. Model: shots/verify/critic/gb04.png (cmp_1), rc2/gb05.png (rc2/cmp_1.png), s_100_e.png and gb_led.png.
  FIX: Replace the paved median with a 1.5 m grass strip (#5f7e3b) on a 0.2 m kerb, without trees or lamps (lamps go on the outer kerb). Restyle the terminal-side shelters: frame and roof #2a2a2a, back glass dark-tinted, and a 1.8 × 1.2 m emissive ad lightbox at each bay end. Make the run about 40–60 m continuous starting at the arch crossing (x≈60).
- (medium) The building that dominates the view west along 신반포로 from the CC gate is a generic blue-glass curtain-wall office. In reality it is a tan or beige 8-storey masonry block with rows of punched windows, a large LED screen on the roof and a vertical sign on its east face.
  where: x -260..-204, z -5..45 (OSM 413280002, H38)
  evidence: refs/roadview/cc_02_sinbanporo_west_from_main_gate_tan_block_led.jpg vs the model render in shots/verify/centralcity/cmp_1.png (cc02 row) and w1.png/w2.png. The aerial refs/aerial/cc_all.jpg shows a cream roof with terraces at the same spot.
  FIX: Give it a place override or module. Facade: warm tan stone or tile (#c9a878) with dark punched windows about 1.6x1.4 m in regular bays, and a flat roof. On the roof, a framed LED billboard about 10 m wide x 6 m tall facing ENE, set back from the 신반포로 corner. On the east corner, a narrow vertical sign board (about 2 m x 12 m, beige with dark Korean text).
- (low) 신세계 동측 주차장 통로 한가운데를 분홍·회색 체크 보도 포장 띠가 남북으로 가로지릅니다. 실제는 통로 전체가 아스팔트에 흰 주차선입니다. shinsegae 단독 렌더에는 이 띠가 없으므로 다른 모듈(서비스 도로 보도 생성)에서 그린 것입니다.
  where: 신세계 동측 주차장 u 75~86, v -12~40 근방(월드 약 x -35~-20, z -60~-20). OSM 301889794 서비스 도로의 보도로 보입니다.
  evidence: refs/roadview/ssg_03·ssg_04: 카메라 발밑과 통로 전체가 아스팔트와 흰 선입니다. 모델 shots/verify/shinsegae/v03.png·v04.png·ssg03.png에는 분홍 체크 보도 띠가 보이고, shots/verify/shinsegae/only/v03.png·only/v04.png(shinsegae 단독)에는 없습니다.
  FIX: streets 모듈에서 OSM 301889794(주차장 공용 진입로) 구간의 보도 생성을 끄거나, 신세계 주차장 slab(rect(70.7,-12,91.2,55))과 겹치는 구간을 건너뛰게 합니다.
- (low) On the south side of 신반포로, west of the CC gate, roadview shows long continuous glass bus-stop canopies on slim posts. The model has one short dark shelter there.
  where: South curb of 신반포로, about x -260..-170, z -60..-45
  evidence: refs/roadview/cc_02 left half (long glass canopies with white arched supports, more than 30 m long) vs shots/verify/centralcity/w1.png and the cc02 model row in shots/verify/centralcity/cmp_1.png (a single short shelter).
  FIX: Extend the shelter into a 30-40 m run of flat glass canopies (pale-grey frame, clear glass, about 3.2 m high) with ad boxes, set along the curb so it continues the line from the CC plaza westward.
- (low) The building at the 반포지구대 site renders as a brown brick box. Across the 신세계 east lot the 2025 roadview shows a 3–4 storey building with a blue-and-beige checkerboard panel facade and a glass-fronted lower volume to its right. The identity comes from the roadview minimap label; nothing in js/places names 반포지구대.
  where: OSM 서초경찰서 반포지구대 x16..35 z-112..-93
  evidence: refs/roadview/ssg_04 vs shots/verify/critic/police.png (sheetH.png) and n_0_s.png
  FIX: Clad the box in alternating blue (#2f6db3) and beige (#e2d6bd) square panels (~1.2 m), 3 floors with a flat roof. Add a single-storey glass-fronted volume on its east side.
- (low) Sidewalks everywhere use a pink/tan checkerboard. The roadview sidewalks are plain grey/beige concrete block pavers, with a red brick strip only along the terminal kerb fence.
  where: both sidewalks of 신반포로 x-300..330
  evidence: refs/roadview/bp_02, cc_02 and gb_01 vs shots/verify/critic/s_w_e.png, n_m100_e.png and n_0_e.png (sheetA.png)
  FIX: Use uniform grey 0.3 m pavers (#a9a59c) with subtle variation. Use red brick (#9a4a3a) only for the 2 m strip along the terminal-side fence at x 60..230.
- (low) The apartments behind 반포쇼핑타운 4동 are generic white 12-storey slabs. Behind 4동 the roadview shows a very tall (~35F) dark grey/blue glass residential tower and an orange-tan ~15F older apartment block to its right.
  where: OSM 201동/202동 area x-66..83 z-246..-189 and the new tower behind 4동
  evidence: refs/roadview/bp_01 (and the right background of ssg_05) vs shots/verify/critic/s_w_n.png and rc2/bp01.png
  FIX: Give the older 2xx동 slabs an orange-tan body (#d9a26b) with white balcony bands. Add or retint the tall tower directly north of 4동 to dark blue-grey glass (#3c4a5a), about 100 m tall.

## Reference material (ground truth)
- NEW Kakao roadview frames captured 2025-06 / 2026-06 by the operator, described one by one in refs/roadview/manifest.json (read it): refs/roadview/ssg_*.jpg (Shinsegae), gb_*.jpg (경부선 terminal), cc_*.jpg (센트럴시티), bp_*.jpg (반포쇼핑타운 / 신반포로).
- refs/roadview/viewpoints.json: reviewer-calibrated camera positions [x,y,z,yawDeg,pitchDeg] matching the roadview frames (yaw 0 = north/-z, 90 = west, 180 = south, 270 = east).
- shots/verify/<module>/: the reviewers' renders and side-by-side sheets of the CURRENT build (look at them).
- shots/r3cmp/cmp.png: older side-by-side comparison, LEFT = roadview, RIGHT = the current model rendered from roughly the same standing point. Camera positions used for the model renders (x, y=feet, z, yawDeg; yaw 0 = looking north/-z, 90 = west, 180 = south, 270 = east):
  ssg06 = (-58, 0, -100, 190)  · cc01 = (-150, 0, -62, 215) · gb04 = (160, 0, -165, 105) · gb03 = (60, 0, -140, 180) · ssg01 = (-93, 0, -52, 180) · gb01 = (200, 0, -185, 180)
- Aerial photos in world coordinates (north up, yellow grid 10 m, labels every 50 m; slightly off-nadir): refs/aerial/shinsegae_centralcity.jpg, refs/aerial/gyeongbu_lots.jpg.
- Older photos and notes: refs/photos/streets/, data/research/streets_visual.json (2008–2016; the 2025/2026 roadview wins when they disagree).

## Rules
- Read AGENTS.md, docs/PLACE_API.md, js/kit.js, js/places/_junctions.js and the current module first.
- Everything visible must be justified by a reference. Where nothing shows a detail, keep it plain rather than inventing. Record remaining guesses in data/research/streets.json → modeling.guesses.
- Korean express-bus terminal complex, not an airport/railway: no GATE/게이트, no English-first DEPARTURES boards, no airport glass lounges.
- Keep floor counts, junctions/wells naming this module, spawns (3–12), elevators listing all floors, zones, OSM claims. ≤ 130k quads.
- Touch ONLY your module file and its data/research json. Other Codex jobs are editing the other modules in this folder at the same time. No git commit. No engine edits.
- Must pass `node tests/smoke.mjs streets <neighbours>` (OK) and `node tests/walk.mjs` (0 blocked; if a failure is in another module that is mid-edit, say so). tests/shot.mjs cannot run in your sandbox.
- Final answer: what changed, which reference justified each element, remaining guesses.
