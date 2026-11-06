Module `banpo_shoppingtown` → js/places/banpo_shoppingtown.js (반포쇼핑타운 1~8동), round 4. Neighbours for smoke: gotomall.

Independent reviewers compared the current build with 2025/2026 Kakao roadview frames, aerial photos and older photos (renders in shots/verify/). Fix every issue below, highest priority first, then re-check the rest still holds. The user, who knows the place, complained it looked imagined and airport/railway-like — every visible element must be justified by a reference.

## Issues to fix
- (high) 3동 and 4동 have the wrong facade colour. The real buildings are pink/mauve square tile; the model uses one yellow-grey tile ('banpo-tile', base #c9c4b6) on all 8 blocks.
  where: js/places/banpo_shoppingtown.js lines 62-69 (K.texture 'banpo-tile') and line 285 / line 467 (polyWalls mat)
  evidence: Roadview refs/roadview/bp_02_banpo_shoppingtown_gotomall_canopy_west.jpg (zoom: scratchpad bp02_right.png) and bp_01_banpo_shoppingtown_exit82_north.jpg (zoom: bp01_left.png) show a pink/mauve tile in which green and blue are about equal and below red. Sampled under overcast light: #a49597, #a29e9d. Model renders shots/verify/banpo_shoppingtown/m_bp02.png, f4.png and c01c.png show yellow-grey beige. In the side-by-side sheet side_bp02.png the difference is the first thing you see.
  FIX: Recolour 'banpo-tile' as a pink/mauve glazed tile:
- base #cdb7b5
- tile variants #d4bfbd, #c8b0ae, #c1aaa9, #d0bcb8
- grout lines #e3d8d6
- keep the ~0.2 m tile module

Apply it to 3동 and 4동, which are confirmed, and keep it as the default for 1·2·5동 until those are checked. Do not use it on 6~8동 (see the brick issue).
- (high) 7동 and 8동 are orange-red brick in reality but render in the same beige tile as the other blocks. Their windows are also small square punched openings, not 2.35 m wide picture windows.
  where: js/places/banpo_shoppingtown.js line 285 (polyWalls mat), line 467 (parapet), window loop lines 271-297
  evidence: In refs/roadview/bp_03_sinbanporo_east_banpo_6_8dong_red_brick.jpg (zoom: scratchpad bp03_left.png), both blocks on the north side are red brick (sampled #b96c4b). They have darker vertical brick piers and single windows about 1.3 m square with white frames, 4 window rows over a ground-floor sign band. In the aerials refs/aerial/bp_67.jpg and bp_east.jpg, the parapet edges of 7동 (x 181-234) and 8동 (x 254-306) are salmon/orange. Model renders shots/verify/banpo_shoppingtown/m_bp03.png, t03a.png, c03b.png and f8.png show beige tile with wide grey-framed windows. Sheet: side_bp03.png.
  FIX: Add a 'banpo-brick' texture:
- running bond, 0.075 m courses, 0.23 m bricks
- brick colours #b5603f, #a8513a, #bf6a48
- mortar #caa58c

Use it for the walls and parapet of n=7 and n=8 (and n=6 only if a later reference confirms it). Give every ~7 m bay a full-height pier, 0.5 m wide and 0.15 m proud, in darker brick #8e4430.

For n=7 and n=8 on floors 2F-5F:
- windows 1.3 m wide × 1.3 m tall, sill at y+1.0
- white frames #e8e8e2, no protruding sill box
- 2 windows per 7 m bay

The ground floor of 7동 should be a continuous light-grey/white signboard band (y 2.9-4.2) running the full front.
- (high) There are far too few tenant signs, and an invented building-name sign dominates the frontage. In reality, floors 1F-3F (and some of 4F) carry stacked tenant signboards on every bay, edge to edge. The model shows a 10.3 m dark-green 'n동' sign over a 9.1 × 2 m dark canopy above an 8 m central opening, a cream 2.2 × 2.3 m directory board, an 'n동' plaque at 16.75 m, and only a few tenant signs.
  where: js/places/banpo_shoppingtown.js lines 230-232 (canopy box, '반포쇼핑타운 n동' sign, 'n동' plaque), line 409 (per-unit front sign only where the tenant is known or f==1), line 427 (1F directory)
  evidence: In bp02_right.png (from bp_02) and bp01_left.png (from bp_01), the 3동 front has rows of horizontal signboards at 1F, 2F, 3F and 4F, one or more per bay. Colours include an orange band, a navy band reading '생명의말씀사 2F' over a red stripe, a 'JEWELRY' sign at 1F and a '…치과' orange board. There are also vertical blade signs on the east corner. No large dark-green building-name sign or central canopy appears in either frame. Model renders f3.png and f4.png show the green '반포쇼핑타운 3동/4동' band and canopy dominating the frontage, with blank tile at 3F and above. m_bp02.png shows almost no signs along 3동.
  FIX: Remove the 9.1 m canopy box and the 10.3 m dark-green building sign (lines 230-231), or shrink the sign to a 2.5 × 0.5 m plaque beside the door. Drop the 1.3 m 'n동' plaque at 16.75 m (line 232). Give every 4.5 m bay a projecting signbox (0.15 m deep, bay width minus 0.3 m):
- 1F: y 2.85-3.65
- 2F: y 6.55-7.25
- 3F: y 10.05-10.75
- 4F: about one bay in three, 0.6 m tall

Vary the backgrounds (navy #263d8c, orange #e2662c, white #f2f2ee with dark text, green #2e6b46, red #b8322c), using the real names from TENANTS and generic uses (치과, 학원, 미용실, 부동산) for the rest. Put one vertical blade sign (0.6 × 3 m) on each block end at floors 2F-4F. On 3동, put '생명의말씀사 2F' as a navy band with white text at 2F, near the east end.
- (high) All 반포쇼핑타운 blocks are the same grey-beige tile with signs almost only at ground level. In reality 3·4동 are pink/salmon tile, 6~8동 are red brick, and every block has dense stacked shop signboards on floors 1–3 plus rooftop antennae and AC units.
  where: 3동 x-169..-101 z-133..-93; 4동 x-30..21 z-179..-146; 6동 x108..161 z-231..-198; 7동 x182..234 z-258..-225; 8동 x254..306 z-287..-254 (OSM)
  evidence: refs/roadview/bp_01 and bp_02 show 3·4동 in pink tile with rows of signboards across floors 1–3. bp_03 and gb_05 show 6~8동 in red brick with white window frames. cc_02 (right side) shows 1·2동 light grey/white but covered in signs. Model: shots/verify/critic/bp4_close.png, rc2/bp01.png, rc2/bp03.png, s_w_n.png, n_m100_e.png, sheetA.png (n_100_w) and sheetB.png (s_100_n, n_220_e) show uniform grey-beige checker tile and only 1F fascias.
  FIX: Give 3동/4동 a pink tile material (#d9b4ae with lighter grout lines) and 6/7/8동 a red brick material (#a5452f) with white window frames. Keep 1·2동 light grey (#d8d6d0). On each 신반포로 facade add 15–25 signboards on floors 2–3 (≈2.5–4 m × 0.7–0.9 m, mixed white, blue, red and orange backgrounds, Korean shop names such as 안경, 치과, 학원, 부동산, 미용실) plus a few vertical banners at the corners. Add rooftop clutter: antennae, AC units, a water tank.
- (medium) The facade pattern runs the wrong way. Real 3동/4동 facades are organised by projecting full-height piers about every 7 m, with no strong floor-line bands. The model draws a dark horizontal band at every floor, a protruding concrete sill under every window, and a 4.5 m window rhythm.
  where: js/places/banpo_shoppingtown.js line 299 (per-floor band: polyWalls next-0.16..next-0.025, mat 0x8c9181, thick 0.38), line 291 (sill box), line 272 (4.5 m bay step)
  evidence: In bp02_right.png (from bp_02), light tile piers project from the 3동 front and run from ground to parapet. Windows sit between them flush with the tile, and there are no continuous horizontal stripes. Model renders m_bp02.png, f4.png and c01c.png show strong dark lines at each floor and stand-out sills, which reads as horizontal banding.
  FIX: Remove the per-floor 0x8c9181 band, or give it the facade tile colour and set thick to 0.25 so it sits flush. Remove the sill boxes on line 291, or cut them to 0.04 m proud. Add piers at u = -W/2 + k·W/7, for k = 0..7:
- 0.6 m wide, 0.25 m proud
- from y=0 to roof+0.65
- tile a shade lighter (#d8c5c3)

Respace the windows to 2 per pier bay, each about 2.2 m wide, with dark aluminium frames (#4a4f52).
- (medium) Block end walls are blank tile. The real east end of 3동 has windows on every floor, signs wrapping round from the front, and a narrower recessed stair-tower volume. The west end of 8동 has a column of small windows.
  where: js/places/banpo_shoppingtown.js lines 271-285: openings are only generated for v = front/back, so the short ends of each footprint get none
  evidence: bp01_left.png (from bp_01) shows the 3동 east side with windows at 2F-5F, signs at 1F-3F ('생명의말씀사 2F', 'JEWELRY' wrap the corner), and behind it a narrower set-back volume with one small window per floor. bp_03 (bp03_left.png) shows the west end of 8동 with a vertical column of small windows. Model renders c01c.png, m_bp01.png and t03c.png show the same ends as featureless tile with only floor-band lines.
  FIX: On both short edges of every footprint, add 1-2 window columns per floor 1F-5F (1.4 m wide × 1.4 m tall, sill y+1.0), plus 1F/2F signboards that continue the front sign band round the corner for 3 m. At the east end of 3동 and 4동, build the last 4-5 m of the block as a stair-tower volume set back about 1.0 m from the front plane, with one 0.9 × 1.2 m window per floor. Keep the 1.75 m wide toilet and stair cores behind it as they are.
- (medium) The rooftops are wrong. Real roofs carry clusters of white telecom antenna masts at the block ends and are painted green (3·4·6·8동) or light grey (5·7동). The model gives every block grey gravel and the same 9.7 × 5.2 × 2 m plant-room box.
  where: js/places/banpo_shoppingtown.js lines 466-474 (roofgravel slab, plant box at roof, small boxes)
  evidence: bp02_right.png (from bp_02) shows 5-6 white antenna masts with panel antennas on the 3동 east-end roof. bp03_left.png (from bp_03) shows 3 masts on the 7동 roof edge. In the aerials refs/aerial/bp_west.jpg and bp_34.jpg, 3동 and 4동 have green roofs. bp_east.jpg and bp_67.jpg show 6동 and 8동 green, and 5동 and 7동 light grey. Top-down model renders top_w.png and top_e.png show uniform grey roofs, each with a dark plant box.
  FIX: Roof material per block:
- n ∈ {3,4,6,8}: green #5f9a6e
- n ∈ {5,7}: light grey #c9c9c3
- 1·2동 unchanged (the bp_far aerial shows a dark/grey roof for 2동 and a light one for 1동)

Replace the 9.7 × 5.2 m plant box with a 3 × 3 × 2.6 m stair penthouse over the stair core at u≈0, v≈-4. At each block end, put 3-6 antenna masts near the front parapet (u = ±(W/2-3)):
- white poles, 0.1 m diameter × 3 m tall
- each with 1-3 panel antennas (0.3 × 1.3 × 0.1 m, #eeeeea)
- (low) The gap between 6동 and 7동 is a surface parking lot in reality, and a single-storey pavilion stands in front of 7동 between the building and the kerb. The model has bare ground in both places.
  where: Outside the 6동 (413372925) and 7동 (413372927) footprints. It may belong to the streets module, but it frames these blocks.
  evidence: In aerial refs/aerial/bp_67.jpg (zoom: scratchpad bp67_zoom.png), about 8-10 cars are parked at x 159-182, z -242..-224, between the east end of 6동 and the west end of 7동. A dark flat-roofed box with a light front edge, about 15 × 7 m, sits at x 202-217, z -232..-225, in front of 7동. A grey box of matching size appears beside the 7동/8동 frontage in bp_03 (bp03_left.png, centre-left). Top-down model render top_e.png shows empty grey ground in both places.
  FIX: Add an asphalt lot polygon covering about x 160-183, z -245..-222, with nose-in parked cars in 2 rows. Add a 15 × 7 × 3.2 m single-storey box at centre about (209.5, 0, -228.5), rotated to the block angle (long axis parallel to the 7동 front). Give it a dark grey flat roof (#4a4d4f), a light fascia (#d8d8d2) on its south face, and a shop sign band.
- (low) The paving in front of each block is pink/red checkered tile. The real sidewalk in front of the shopping town is plain grey concrete pavers with a darker grey band.
  where: js/places/banpo_shoppingtown.js lines 228-229 (fore slab, mat 'sidewalk' over front+0.15..front+3.8)
  evidence: bp_01 and bp_02 (bp01_right.png, bp02_canopy.png) show light-grey square pavers with a mid-grey band and a yellow tactile strip only at the crossing. Model renders f4.png, f8.png, c03b.png and m_bp03.png show red/pink/grey checker tiling along every frontage.
  FIX: Use a grey paver material for the forecourt slab: 0.3 m squares, #b9b8b2 with #a5a49e variation, plus one 0.6 m darker band (#8f8e89) parallel to the facade. Keep the tactile strip only at the entrance.

## Reference material (ground truth)
- NEW Kakao roadview frames captured 2025-06 / 2026-06 by the operator, described one by one in refs/roadview/manifest.json (read it): refs/roadview/ssg_*.jpg (Shinsegae), gb_*.jpg (경부선 terminal), cc_*.jpg (센트럴시티), bp_*.jpg (반포쇼핑타운 / 신반포로).
- refs/roadview/viewpoints.json: reviewer-calibrated camera positions [x,y,z,yawDeg,pitchDeg] matching the roadview frames (yaw 0 = north/-z, 90 = west, 180 = south, 270 = east).
- shots/verify/<module>/: the reviewers' renders and side-by-side sheets of the CURRENT build (look at them).
- shots/r3cmp/cmp.png: older side-by-side comparison, LEFT = roadview, RIGHT = the current model rendered from roughly the same standing point. Camera positions used for the model renders (x, y=feet, z, yawDeg; yaw 0 = looking north/-z, 90 = west, 180 = south, 270 = east):
  ssg06 = (-58, 0, -100, 190)  · cc01 = (-150, 0, -62, 215) · gb04 = (160, 0, -165, 105) · gb03 = (60, 0, -140, 180) · ssg01 = (-93, 0, -52, 180) · gb01 = (200, 0, -185, 180)
- Aerial photos in world coordinates (north up, yellow grid 10 m, labels every 50 m; slightly off-nadir): refs/aerial/shinsegae_centralcity.jpg, refs/aerial/gyeongbu_lots.jpg.
- Older photos and notes: refs/photos/banpo_shoppingtown/, data/research/banpo_shoppingtown_visual.json (2008–2016; the 2025/2026 roadview wins when they disagree).

## Rules
- Read AGENTS.md, docs/PLACE_API.md, js/kit.js, js/places/_junctions.js and the current module first.
- Everything visible must be justified by a reference. Where nothing shows a detail, keep it plain rather than inventing. Record remaining guesses in data/research/banpo_shoppingtown.json → modeling.guesses.
- Korean express-bus terminal complex, not an airport/railway: no GATE/게이트, no English-first DEPARTURES boards, no airport glass lounges.
- Keep floor counts, junctions/wells naming this module, spawns (3–12), elevators listing all floors, zones, OSM claims. ≤ 130k quads.
- Touch ONLY your module file and its data/research json. Other Codex jobs are editing the other modules in this folder at the same time. No git commit. No engine edits.
- Must pass `node tests/smoke.mjs banpo_shoppingtown <neighbours>` (OK) and `node tests/walk.mjs` (0 blocked; if a failure is in another module that is mid-edit, say so). tests/shot.mjs cannot run in your sandbox.
- Final answer: what changed, which reference justified each element, remaining guesses.
