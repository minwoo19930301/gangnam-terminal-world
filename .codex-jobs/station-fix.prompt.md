You are a senior 3D/web engineer building one detailed place module for a first-person three.js reconstruction of the 고속터미널 area in Seoul (real OpenStreetMap geometry).

Module id: `station` → write `js/places/station.js` (and nothing else except `shots/station/`).

Read first, in this order: `AGENTS.md`, `docs/PLACE_API.md`, `docs/BUILD_BRIEF.md`, `docs/briefs/station.md`, `data/research/station.json` (facts gathered by a research agent — use real names/numbers from it; where it says guess/unresolved, choose the most plausible option and note it), `js/places/_junctions.js`, and look at `docs/overview-core.png` / `docs/overview-park.png` / `docs/overview.png`. Study `js/kit.js` to know exactly what each K function does.

Then build the module to the quality bar in BUILD_BRIEF.md: detailed, recognisable, every real level walkable, real names on signs, junctions honored. Follow the process loop in BUILD_BRIEF.md §9 — run `node tests/smoke.mjs station` until it prints OK, take ≥ 6 screenshots with `node tests/shot.mjs --places station --city 0 --out shots/station --views "…"` (also some with `--city 1` to see it in context, and `--night` if you have night effects), open and inspect every PNG, and iterate until it looks right. Do not edit engine files or other modules; do not git commit. Other agents are building other modules in parallel in this same folder.

Finish with the summary required by BUILD_BRIEF.md §11.


## Reviewer issues to fix (the module already exists — improve it, keep what works)

[
 {
  "severity": "high",
  "what": "A large untextured flat grey block fills the camera at the B4 spawn. Facing north (yaw 0) the whole frame is flat grey. At yaw 69 it covers the right half of the view. With pitch -60 it fills everything above the floor. It looks like an unlit stray box or back-face that is solid on the player's side. It appears with --city 0 and --city 1, so it belongs to station.js and is not a neighbour artifact. The first view of the 9호선 platform is broken.",
  "where": "Spawn 'B4 · 9호선 아치 승강장' (-48.3,-21,-98.1), station.js line 497 (l9.at(100,-9)). Screenshots shots/station-verify/b4.png, s4a.png, p1.png, p2.png, c1b4.png"
 },
 {
  "severity": "medium",
  "what": "The exterior has no recognisable station building. Street level is only six small exit canopies with a dark sign and a stair mouth, which fits the research (all underground). From street eye level the approach is flat ground, with the exits tiny and far away. There is no plaza, pavement or entrance context. With --city 1 the exit-3 entrance reads as a small sign-topped stair box among trees and roads. It is acceptable but thin, and there are no traffic or kiosk props.",
  "where": "Street level around exits 2/3/4 (52,0,172), (-137,0,253). Screenshots exit4.png, e3.png, c1street.png"
 },
 {
  "severity": "low",
  "what": "At the elevator test point (-76,-6,-80) facing south, the camera is pressed against the shaft wall. The tile wall fills half the frame and there is a tooltip 'E · 3·9호선 환승 엘리베이터'. This is probably just my coordinate choice. The shaft door side is not readable from this view. The elevator door and floor panel were not verified.",
  "where": "3·9호선 환승 엘리베이터 (-76,-82). Screenshot ele.png"
 },
 {
  "severity": "low",
  "what": "Underground slabs read as exposed boxes from outside and from the aerial with city 0. This is expected with no ground in isolation. With city 1 the underground is hidden. I did not check for z-fighting or holes between the B1 slab and the city ground plane in the combined run. The 6 groundHoles for exits looked fine in c1aer.png.",
  "where": "Aerial views aer2.png, b4.png (city 0)"
 },
 {
  "severity": "low",
  "what": "Junction J7 opening at (-45,-6,196) shows open sky and distant grey slabs in the station-only run, because the 파미에스테이션 side (centralcity) is not loaded. The combined smoke of station + gotomall + centralcity passes with no junction or well failures. I did not take combined screenshots of the junction or the wells. W3 and W9 were checked in isolation: the escalators descend with correct 3호선/9호선 orange and gold '타는 곳' signs, readable and not mirrored.",
  "where": "J7 (-45,196); W3 (-79,-100); W9 (-5,-132). Screenshots j7.png, w3.png, w9.png"
 }
]
