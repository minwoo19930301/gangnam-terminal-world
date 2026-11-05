You are a senior 3D/web engineer building one detailed place module for a first-person three.js reconstruction of the 고속터미널 area in Seoul (real OpenStreetMap geometry).

Module id: `hangang` → write `js/places/hangang.js` (and nothing else except `shots/hangang/`).

Read first, in this order: `AGENTS.md`, `docs/PLACE_API.md`, `docs/BUILD_BRIEF.md`, `docs/briefs/hangang.md`, `data/research/hangang.json` (facts gathered by a research agent — use real names/numbers from it; where it says guess/unresolved, choose the most plausible option and note it), `js/places/_junctions.js`, and look at `docs/overview-core.png` / `docs/overview-park.png` / `docs/overview.png`. Study `js/kit.js` to know exactly what each K function does.

Then build the module to the quality bar in BUILD_BRIEF.md: detailed, recognisable, every real level walkable, real names on signs, junctions honored. Follow the process loop in BUILD_BRIEF.md §9 — run `node tests/smoke.mjs hangang` until it prints OK, take ≥ 6 screenshots with `node tests/shot.mjs --places hangang --city 0 --out shots/hangang --views "…"` (also some with `--city 1` to see it in context, and `--night` if you have night effects), open and inspect every PNG, and iterate until it looks right. Do not edit engine files or other modules; do not git commit. Other agents are building other modules in parallel in this same folder.

Finish with the summary required by BUILD_BRIEF.md §11.
