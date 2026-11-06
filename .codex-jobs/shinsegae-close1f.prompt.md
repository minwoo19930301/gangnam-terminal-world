Module `shinsegae` → js/places/shinsegae.js (신세계백화점 강남점). Small, precise fix requested by the user, who knows the store: "신강 1층이 너무 지하랑 뚫려 있다" (the 1F is far too open to the basement).

Current state (verified with tests/visfloor.mjs, which marks where a floor at y=0 lets you see down to a lower level):
1. The 1F slab carries the full escalator atrium hole `atrHole` (ATR = [27.6, 35, 39.4, 47], ~11.8 m × 12 m) — every floor from 1F up gets it (`if (s >= 2) holes.push(atrHole)` in the MAIN.forEach slab loop).
2. The 1F slab and the 1M mezzanine slab also carry `HOS_VOID` ([8.6, 60, 23.5, 74.5], ~15 × 14.5 m) so the B1 House of Shinsegae lounge is a two-storey void open to the 1F.

Wanted:
- On 1F only, the opening to B1 is just the well of the B1→1F escalator pair (lanes A/B, `LANE.A`/`LANE.B`, 1.2 m wide escalators running along v from ATR[1] to ATR[3]): a hole about u 27.8..31.0 × v 35..47 (exact numbers up to you so the escalators and their landings stay walkable and unclipped), with a glass balustrade (same style as the existing atrium railing: glass wall 1.1 m + top rail) around that smaller well, open only at the escalator ends where people step on/off. Remove the 1F railing/fascia segments that surrounded the old, larger 1F opening. Floors 2F and above keep the full stacked atrium exactly as now.
- Close HOS_VOID on 1F and on 1M (no hole). The B1 House of Shinsegae lounge stays a B1 room: give it its own ceiling under the 1F slab (the 1F slab underside is fine) — keep its wood walls, uplights, rugs and armchairs, just within B1 height. Remove now-floating 1F/1M railings, fascia or glass that edged the HOS void, and put normal 1F floor use on the reclaimed area (cosmetics/luxury counters consistent with the surrounding 1F, or plain floor — do not invent new brands).
- Keep junctions J1/J4/J5 and every spawn/zone/elevator working. Keep the exterior unchanged.

Check: `node tests/smoke.mjs shinsegae gotomall centralcity jwmarriott` (OK), `node tests/walk.mjs` (0 blocked), and `node tests/visfloor.mjs 0 -115 -55 -5 62 /tmp/vis_ssg.png shinsegae,centralcity,jwmarriott,gotomall` — the printed "hole m2" for the store should drop to roughly the escalator well + stair holes (it is ~524 m² now). Touch ONLY js/places/shinsegae.js and data/research/shinsegae.json. No git commit. Final answer: what changed and the new hole m2.
