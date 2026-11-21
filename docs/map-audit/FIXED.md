## Fixed on this branch (phase 2)

Everything below was built and tested against commit d4be690 only (plus these commits), not against the other session's uncommitted edits. Their junction edits in shinsegae, centralcity, jwmarriott or famille may shift the results. Order of commits: audit tools and report, small mechanical fixes, 3호선 re-plan (own commit, safe to drop), regenerated `_meta.json` (regenerate at merge time, do not hand-merge).

### A. Small mechanical fixes
| item | decision |
|---|---|
| J_ONEBAILEY_PARK | Fixed. `onebailey.js:587` zone '원베일리 · 한강공원 입구' ended at `p(len+5)`, but the junction end point and the exit spawn are `p(len+8)` (`exit`, line 577), so the spawn lay 3 m outside every onebailey zone. Zone now runs to `p(len+8)`. Audit: junction issue gone. |
| banpo_shoppingtown door (210.8,-225.2), 8.2 m outside block 7 | Not an error, left alone. It is the door of the detached 15x7 m single-storey pavilion in front of block 7 (`banpo_shoppingtown.js:1484-1498`, photo bp_67); the pavilion is deliberately outside the OSM footprint. |
| gyeongbu_east door (379.36,-11.21), 4.4 m outside the wall | Not an error, left alone. `gyeongbu_east.js:9` lists it as a street entrance of the "marked north aisle", and the header comment cites the June 2026 roadview showing a continuous deck on the north side (the 382 m² strip). |

### B. 3호선 platform re-plan (`js/places/station.js`)
Derivation (from `data/osm.json`): rails 406947060 and 640473002 pass (-82,-232) (-76.5,-183) (-63,-149), then the two ref-339 stop nodes (-1.77,-0.06) and (1.66,-1.38), then continue SSE to (103..113, 287..292). Mid line of the two ways, 97.5 m either side of the stop centre (-0.06,-0.72) along the rails: `[[-37.23,-90.88],[-0.06,-0.72],[34.08,90.58]]` (195 m, bearing 158.5 deg from north, 1.2 deg bend at the stop). The earlier suggestion's third point (-87.7,36) was wrong; every point used now lies on 3호선 (end points are within 0.1 m of the mid line, 42 m from the 7호선 stop nodes).

| what | old | new |
|---|---|---|
| platform frame `l3` | `station.js:894` `frame([[-90,-225],[-90,-25]])`, straight N-S box x -107..-73 | `station.js:57` `L3PTS`, `:900` `frame(L3PTS)`; platform call `:1183` |
| platform zone centre / stop nodes | (-90,-125) / 75.5 and 78.3 m away | (-1.5,-0.4) / 0 m (inside) |
| 3호선 rail inside the platform zone (within 100 m of stops) | about 20 % (B2 mask) | 98 %, axis difference 0.0 deg |
| lower hall under the B1 concourse | part of the old platform box | `:1186` `lowerHall3`, x -107..-73, z -104..-40 (W3 landing, concourse escalator foot, doors east kept; end walls at z=-104 and z=-40) |
| link to the platform | none (stairs landed on the platform) | `:1190` trapezoid hall from the lower hall door (-73,-96) to the platform's north cross bridge west wall; east door of the bridge opens to the corridor along the east wall |
| transfer corridor to 7호선 | straight east along z=-54 then south along x=40 (would cut the new platform) | stub (-79..-52,-54) kept and capped; `:1496` new corridor around the north bridge, along the platform east wall, to the 7호선 hall door (40,117.7) and (40,151); moving walks at s 35-85 and 135-190 |
| 9호선 flight stone wall | `:1539` full height x -65..-32 | full height to x=-48.7, then capped at B2-0.4 under the platform |
| detail rooms / `later()` | one B2 platform room at x -110..-70, z -235..-15 | lower hall room and a new platform room (`:77`, `nearL3`) |
| spawn '3호선 승강장' | (-79,-151) | (8.54,-3.42) on the east bank |
| ghosts removed | quad at x=-106.88 (z -121..-103), traveler and seam boxes at (-101.6,-136.1) | re-hung on the new west bank (`:2207`, `:2281`) |

Not moved: gate and exit stair heads (all 10 exits still within 1.8 m of OSM), W3 well and the B1 concourse (they stay at the arcade where they open onto the gotomall south wall and the gotomall W3 hole). The coordinator's wish that the concourse sit above the platform is therefore not met: the real alignment runs 50 m east of the concourse, under 신세계/센트럴 east edge, so the platform is reached by the new B2 link instead. Moving the concourse would also move W3 and the J1 corridor.

Tests (node tests against d4be690 + onebailey fix as baseline, same command, same machine):
| test | before | after |
|---|---|---|
| `node tests/smoke.mjs station` | OK | OK |
| `node tests/smoke.mjs station gotomall gyeongbu shinsegae centralcity` | 1 problem (shinsegae 5F spawn, pre-existing) | same 1 problem |
| `node tests/smoke.mjs` (all modules) | not run before | same 1 problem |
| `node tests/walk.mjs` | 960 ok, 12 blocked | 959 ok, 13 blocked |
| `node tests/route-regressions.mjs` | 15 OK, 0 blocked | 15 OK, 0 blocked, output identical |
| `tools/pose_floor.mjs` on refs/user_walk/20261107 (562 poses) | no floor 46, blocked 31 | identical, 0 poses changed |
| `tools/map_audit_walk3.mjs` (3호선 routes, own test) | 6 ok, 4 blocked | 10 ok, 0 blocked |

The one route that went from ok to blocked: `tests/walk.mjs:85` '고투몰→3호선 B2' `[[-68.1,-102.9,-6],[-79,-151,-11]]`. Its target (-79,-151) is the centre of the OLD platform, which no longer exists; the route still starts and the stairs still land, but nothing is at the end. Nothing else changed: the blocked set is otherwise identical (11 shinsegae/centralcity routes plus the shinsegae 5F spawn). Because the rule is that no ok route may become blocked, this re-plan is kept as its own commit at the tip of the branch and is a proposal: it needs that test route retargeted to (8.5,-11,-3.4) (tests are engine files, not edited here). The approved photo poses are unaffected: no pose lies in the old 3호선 box (x -112..-68, z -240..-20) or its concourse zone, there are no B2 poses of the 3호선 platform at all (so no GPS/pose evidence of the platform exists in the walk), and the five B1 poses above the new strip (#74-78, 엔터식스/경부선 서문 hall) keep their floor (y -6) and stay free.

Audit after the change (`node tools/map_audit.mjs --refresh`): finding 'platform 75.5 m from the stop nodes' is gone; no junction, well, exit or zone finding appeared (J_ONEBAILEY_PARK also cleared). W3 is still 34.5 m from the OSM 3호선 rail, which is fine: W3 is only the access well to the lower hall.

Known conflicts left for the owners of the other modules (report only): the 신세계 B2 floor has a 20x6 m bump at (-27.4,0.2)..(-5.5,-1.1) (`shinsegae.js:812`) that cuts across the new west bank at s 88-95, and 신세계's B2 parking east wall runs 6-8 m from the platform west wall. Nothing of JW's basements overlaps.

Images: `line3_before.png` / `line3_after.png` (OSM + built overlay, station levels and the OSM rail). Aerial side-by-sides exist only locally (`docs/map-audit/_local/`, git-ignored; imagery is never committed).

### Still open (judgement items)
G15 gate position (indirect evidence: bike dock '고투몰 gate 15옆'), gyeongbu_east north strip (382 m², probably the documented deck), 반포역 / 신반포역 exits (no module builds those stations), everything in famille, centralcity, jwmarriott, shinsegae, streets and landmarks.js (other session's files).
