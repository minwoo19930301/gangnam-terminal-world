You are a senior 3D/web engineer building one detailed place module for a first-person three.js reconstruction of the 고속터미널 area in Seoul (real OpenStreetMap geometry).

Module id: `hangang` → write `js/places/hangang.js` (and nothing else except `shots/hangang/`).

Read first, in this order: `AGENTS.md`, `docs/PLACE_API.md`, `docs/BUILD_BRIEF.md`, `docs/briefs/hangang.md`, `data/research/hangang.json` (facts gathered by a research agent — use real names/numbers from it; where it says guess/unresolved, choose the most plausible option and note it), `js/places/_junctions.js`, and look at `docs/overview-core.png` / `docs/overview-park.png` / `docs/overview.png`. Study `js/kit.js` to know exactly what each K function does.

Then build the module to the quality bar in BUILD_BRIEF.md: detailed, recognisable, every real level walkable, real names on signs, junctions honored. Follow the process loop in BUILD_BRIEF.md §9 — run `node tests/smoke.mjs hangang` until it prints OK, take ≥ 6 screenshots with `node tests/shot.mjs --places hangang --city 0 --out shots/hangang --views "…"` (also some with `--city 1` to see it in context, and `--night` if you have night effects), open and inspect every PNG, and iterate until it looks right. Do not edit engine files or other modules; do not git commit. Other agents are building other modules in parallel in this same folder.

Finish with the summary required by BUILD_BRIEF.md §11.


## Reviewer issues to fix (the module already exists — improve it, keep what works)

[
 {
  "severity": "medium",
  "what": "FIC convention hall (700 seats, listed in research) is only a sign. The 2F view just shows rows of round dining tables, with no stage, seating blocks or hall volume.",
  "where": "가빛섬 2층 (zone center -880.8,-735.3, y0=5); shots gabit2.png, gab2c.png, gab2b.png"
 },
 {
  "severity": "medium",
  "what": "Interiors are repetitive. Floors 1-3 of 가빛섬 and the 채빛섬 and 솔빛섬 floors use the same tables, chairs, buffet counter and ceiling. 3F (y=18) is a large empty tiled floor with sparse tables.",
  "where": "가빛섬 3층; shots gabit3.png, chaebit2.png, solbit.png"
 },
 {
  "severity": "low",
  "what": "Tenant names not in research: 빌라 드 노체, 리브 고쉬, 애니버셔리 비어가든, MOOD SEOUL, 비스타 루프탑 바. The research marks 솔빛섬 as guess=true with no tenants. These may be real tenants but are unverified.",
  "where": "zones 가빛섬 2층, 채빛섬 1층, 솔빛섬 1/2층"
 },
 {
  "severity": "low",
  "what": "The 반포나들목 tunnel is a plain tiled corridor with no signage visible along it. The bank-side exit has no clear tunnel mouth and the revetment wall looks blank from outside.",
  "where": "반포나들목 zone (-248,-712); shots nad2.png, nad3.png"
 },
 {
  "severity": "low",
  "what": "With --city 0 the river is a flat grey plane because city.js does not draw water. This is an engine matter and the water is correct with --city 1. Do not count it against the module.",
  "where": "aerial.png, street.png"
 },
 {
  "severity": "low",
  "what": "CU store: the exterior at ground level shows shelves and a stairwell facing the open air, with no clear storefront or sign. I did not check this carefully.",
  "where": "CU 반포한강공원 (-231,-861); shot cu.png"
 }
]
