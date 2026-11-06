Module `gotomall` → js/places/gotomall.js (고투몰 (강남터미널 지하도상가) — this round only its STREET-LEVEL entrance canopies / lifts), round 4. Neighbours for smoke: station shinsegae gyeongbu centralcity banpo_shoppingtown.

Independent reviewers compared the current build with 2025/2026 Kakao roadview frames, aerial photos and older photos (renders in shots/verify/). Fix every issue below, highest priority first, then re-check the rest still holds. The user, who knows the place, complained it looked imagined and airport/railway-like — every visible element must be justified by a reference.

## Issues to fix
- (high) The GOTO MALL sidewalk stair canopy is too short and built differently. In reality it is a long, nearly full-height green-tinted glass enclosure on a low grey stone base, roughly 16-20 m long. The model has an open 9 m stairwell with a 1.0 m beige granite wall, 1.6 m of glass above it, and a flat glass roof at 2.78 m that overhangs the walls.
  where: js/places/gotomall.js lines 775 (HOLE = 9.0), 789 (groundHole), 794 (granite wall to y 1.0), 823-827 (posts, glass 1.0-2.6, roof at 2.78 with 0.3 m overhang and dark edge beams)
  evidence: In bp_02 (zoom: scratchpad bp02_canopy.png), the 8-1 canopy in front of 3동 is glazed from a ~0.4-0.5 m grey stone base to about 2.8 m. It has light-grey steel mullions about every 1.5 m and diagonal steel fins where sections meet. The glass is green-tinted, and the canopy runs from just behind the bus shelter to about 4 building bays west. Estimated from the photo: 17-21 m. Aerial refs/aerial/bp_34.jpg shows the 8-2 glass roof spanning x -34..-18, z -141..-130 (≈16 m), with about 6 cross ribs. Model renders k81.png and m_bp02.png (sheet side_bp02.png) show a short box about half that length with a tall beige stone base.
  FIX: For the mall and metro gates on the 신반포로 north sidewalk (at least 8-1 and 8-2), make the enclosure about 16 m long along the descent direction. That means lengthening the open well to HOLE≈16 with longer flights, or keeping the stair and extending the enclosure over the whole run.
- Walls: lower the stone base to 0.45 m in grey #8e8f8c (not beige granite), then glass from 0.45 m to 2.8 m.
- Mullions: 0.08 m, light grey #a3a8ab, at 1.5 m centres.
- Glass: tint the panes #9fbfae (green), not #a8c6d8.
- Roof: flush with the walls (no 0.3 m overhang, no dark edge beam), with transverse ribs at about 2.5 m.
- Closed end: a raked glazed end panel that slopes down toward the closed end, matching the diagonal fins in bp_02.
- (high) The model is missing the freestanding glass lift box beside exit 8-1 at the east end of 3동. The model's only street-level lift is attached to the 8-2 stair at (-17.7,-135.7) and is only 3.0 m tall. At 8-1 the model has just an inclined wheelchair lift.
  where: js/places/gotomall.js line 91 (8-1 entry has no elevator flag), lines 846-885 (elevator built only when X.elevator; TOPY = 3.0)
  evidence: bp_01 (zoom: scratchpad bp01_right.png) shows the lift box marked by the '고속터미널역 8-…' pin. It is a tall square box of translucent glass (about 2.6 m wide, about 4 m tall, clearly taller than the 2.6 m bus shelter) on a grey stone base. It stands just east of the bus shelter, at the mouth of the plaza between 3동 and 4동, set back from the kerb. In the map inset the pin is north of the camera, between the 8-1 marker and the orange 3호선 line, well west of 8-2. Model renders m_bp01.png and c01c.png (matched camera -84,0,-100) show empty paving at that spot. The model's lift at 8-2 (adv_bp01.png) is 3.0 m tall with a dark roof slab, and the research note marks its exit number as a guess.
  FIX: Add a freestanding glass lift at roughly (-84, 0, -113), plus or minus 4 m: east of the 8-1 canopy and the bus shelter, about 3 m back from the kerb at the south edge of the plaza.
- Footprint 2.6 × 2.6 m, height about 4.0 m (TOPY 4.0).
- Stone base #8e8f8c, 0.4 m tall.
- Frosted/translucent glass panels (#c9d4d1, low transparency) in a grey frame #6b7075, with a thin flat roof.
- Doors facing the sidewalk (south).

Link it to the B1 landing of the 8-1 passage (set 8-1 to elevator:true, or a separate shaft:false lift as is done for 8-2). Keep the 8-2 lift only if another reference confirms it.
- (low) The canopy frame is dark, almost black, with a dark header band. The real canopy has light-grey steel framing and no dark band.
  where: js/places/gotomall.js lines 823 (posts 0x4c5258), 827 (edge beams 0x4c5258), 828 (header band 0x2b3038)
  evidence: In bp02_canopy.png (from bp_02), the posts, mullions and diagonal fins are light grey and the glass looks green. Model renders k81.png and m_bp02.png show near-black posts and edge beams that outline the box in heavy dark lines.
  FIX: Set the post and beam colour to #a3a8ab (light grey steel). At the closed end, replace the 0.66 m dark header box with a slim 0.15 m light-grey fascia. Keep the exit-number and line-colour signs, but mount them as a compact panel rather than a full-width dark band.

## Reference material (ground truth)
- NEW Kakao roadview frames captured 2025-06 / 2026-06 by the operator, described one by one in refs/roadview/manifest.json (read it): refs/roadview/ssg_*.jpg (Shinsegae), gb_*.jpg (경부선 terminal), cc_*.jpg (센트럴시티), bp_*.jpg (반포쇼핑타운 / 신반포로).
- refs/roadview/viewpoints.json: reviewer-calibrated camera positions [x,y,z,yawDeg,pitchDeg] matching the roadview frames (yaw 0 = north/-z, 90 = west, 180 = south, 270 = east).
- shots/verify/<module>/: the reviewers' renders and side-by-side sheets of the CURRENT build (look at them).
- shots/r3cmp/cmp.png: older side-by-side comparison, LEFT = roadview, RIGHT = the current model rendered from roughly the same standing point. Camera positions used for the model renders (x, y=feet, z, yawDeg; yaw 0 = looking north/-z, 90 = west, 180 = south, 270 = east):
  ssg06 = (-58, 0, -100, 190)  · cc01 = (-150, 0, -62, 215) · gb04 = (160, 0, -165, 105) · gb03 = (60, 0, -140, 180) · ssg01 = (-93, 0, -52, 180) · gb01 = (200, 0, -185, 180)
- Aerial photos in world coordinates (north up, yellow grid 10 m, labels every 50 m; slightly off-nadir): refs/aerial/shinsegae_centralcity.jpg, refs/aerial/gyeongbu_lots.jpg.
- Older photos and notes: refs/photos/gotomall/, data/research/gotomall_visual.json (2008–2016; the 2025/2026 roadview wins when they disagree).

## Rules
- Read AGENTS.md, docs/PLACE_API.md, js/kit.js, js/places/_junctions.js and the current module first.
- Everything visible must be justified by a reference. Where nothing shows a detail, keep it plain rather than inventing. Record remaining guesses in data/research/gotomall.json → modeling.guesses.
- Korean express-bus terminal complex, not an airport/railway: no GATE/게이트, no English-first DEPARTURES boards, no airport glass lounges.
- Keep floor counts, junctions/wells naming this module, spawns (3–12), elevators listing all floors, zones, OSM claims. ≤ 130k quads.
- Touch ONLY your module file and its data/research json. Other Codex jobs are editing the other modules in this folder at the same time. No git commit. No engine edits.
- Must pass `node tests/smoke.mjs gotomall <neighbours>` (OK) and `node tests/walk.mjs` (0 blocked; if a failure is in another module that is mid-edit, say so). tests/shot.mjs cannot run in your sandbox.
- Final answer: what changed, which reference justified each element, remaining guesses.
