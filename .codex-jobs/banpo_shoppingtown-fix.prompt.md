You are a senior 3D/web engineer building one detailed place module for a first-person three.js reconstruction of the 고속터미널 area in Seoul (real OpenStreetMap geometry).

Module id: `banpo_shoppingtown` → write `js/places/banpo_shoppingtown.js` (and nothing else except `shots/banpo_shoppingtown/`).

Read first, in this order: `AGENTS.md`, `docs/PLACE_API.md`, `docs/BUILD_BRIEF.md`, `docs/briefs/banpo_shoppingtown.md`, `data/research/banpo_shoppingtown.json` (facts gathered by a research agent — use real names/numbers from it; where it says guess/unresolved, choose the most plausible option and note it), `js/places/_junctions.js`, and look at `docs/overview-core.png` / `docs/overview-park.png` / `docs/overview.png`. Study `js/kit.js` to know exactly what each K function does.

Then build the module to the quality bar in BUILD_BRIEF.md: detailed, recognisable, every real level walkable, real names on signs, junctions honored. Follow the process loop in BUILD_BRIEF.md §9 — run `node tests/smoke.mjs banpo_shoppingtown` until it prints OK, take ≥ 6 screenshots with `node tests/shot.mjs --places banpo_shoppingtown --city 0 --out shots/banpo_shoppingtown --views "…"` (also some with `--city 1` to see it in context, and `--night` if you have night effects), open and inspect every PNG, and iterate until it looks right. Do not edit engine files or other modules; do not git commit. Other agents are building other modules in parallel in this same folder.

Finish with the summary required by BUILD_BRIEF.md §11.


## Reviewer issues to fix (the module already exists — improve it, keep what works)

[
 {"severity":"medium","what":"Building height is under-modeled. All 8 동 are B1 plus 5 floors above, about 18 m. The research gives about 24 m, with 7 floors assumed and 7 as the upper figure. OSM gives 25.2 m for 2동. 2동 levels=6 may include B1, so the module's B1+5F reading is defensible but unresolved. Silhouettes are visibly squat next to the 25 m figure.","where":"All zones; y1 tops out at 17.97 in --dump. Visible in ext1.png and ext4.png."},
 {"severity":"medium","what":"The unleased 3F spaces are bare, with no fixtures at all. The room I looked at is the 3동 3F south room at (-135,7.5,-110), facing south. It is a plain box with two windows, no waiting-room furniture, no reception counter and no clinic sign. Research asks for 의원 waiting rooms. Only the 봄치과의원 and 반포좋은치과의원 sign names exist on those floors.","where":"3동 3F around (-135,7.5,-110), shots/banpo_shoppingtown-verify/f3_clinic.png"},
 {"severity":"medium","what":"Upper floors (2F-5F) use generic signs repeated along the corridor: '사무실', '미용실', '학원', '의원'. Real names appear only where research or POIs supply them (about 15 on 2F). The 5F corridor in f5_8.png and the 8동 elevator view are almost entirely '사무실'. This matches the research, which marks those floors as guesses, but it is visually monotonous.","where":"5F corridors, e.g. 8동 at (275,14.5,-268), f5_8.png; 6동 3F, f3_6.png"},
 {"severity":"low","what":"The signs shown for B1, 2F and 6동 3F are legible and unmirrored. 3동 B1 has real names ('우고집') alongside generic '식당' fillers. Some B1 shopfronts therefore read as generic signs rather than the real tenant names listed in research (만끽치킨, 배부장찌개 and so on). I could not confirm they sit in the stretch I looked at.","where":"3동 B1 corridor, b1_3.png"},
 {"severity":"low","what":"I could not check the underground ceiling and stair-to-street opening visually. My b1_stair view, at (-1,-6,-150), is outside the 4동 footprint and renders only sky and haze. The B1 corridor view in b1_3.png shows a proper ceiling with light panels. Stair headhouses are visible at street level in ext1.png and ext4.png.","where":"4동 B1 stair, b1_stair.png (bad camera position)"},
 {"severity":"low","what":"The aerial shot shows the module in isolation on an empty ground plane. Nothing is wrong with the module itself. The 신반포로 road and terminal are absent with --city 0, as expected. With --city 1 the row sits correctly among the apartment towers and trees.","where":"aerial.png, verify-c1/city1.png"}
]
