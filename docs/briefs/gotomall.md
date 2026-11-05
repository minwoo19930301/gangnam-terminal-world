# gotomall — 강남터미널 지하도상가 (GOTO MALL 고투몰)
Engine: Claude. Claims: OSM building 1354860678 (layer -1 polygon under 신반포로, ~880 m long, two parallel corridors).

## Research questions (data/research/gotomall.json)
- Official layout/배치도: 동편(EAST)/서편(WEST) zones, store numbering, store count (~620), categories per zone (의류·잡화·액세서리·화장품·침구/이불·식기·인테리어 소품·조화/생화·식당), food/rest areas, toilets, 고객센터/물품보관함 positions, 운영시간/휴무. Sources: gotomall.kr, 서울시설공단(sisul.or.kr) 지하도상가 안내, 블로그 후기(2023-2026), 나무위키 대체 자료.
- Entrances/출입구 numbering of the mall (gates ~1-?) and which subway exits (1, 8, 8-1, 8-2) lead into it; connections to 신세계 강남점 B1, 센트럴시티/파미에스테이션, 경부선 터미널 B1(다이소), 반포쇼핑타운 side.
- Ceiling/floor/lighting look after 2012 리모델링 (white ceilings, LED, tiled floor, signage style: hanging zone signs, store fascia).
- 3호선/9호선 개찰구 location inside/next to the mall.
- 10–30 real store names per zone if findable (blogs), plus OSM POIs with level -1 near the polygon.

## Modeling
- Two parallel corridors (~4–5 m wide each) along the polygon spine with shop rows on both sides of each corridor (4 rows), shops ~3×4 m with fascia signs (real names where known, realistic category names otherwise), shutters/glass fronts, merchandise blocks by category (racks of clothes, shoe walls, bedding stacks, flower buckets, interior goods), zone hanging signs (EAST/WEST, category), floor directional signs, pillars, white ceiling with LED strips, cross-passages between the two corridors every ~30–40 m.
- Floor at K.LEVELS.B1 (-6), ceiling ≈ -2.2 (underside), the street plane above at 0.
- Leave well holes W3 [-82,-104,-76,-90] and W9 [0,-136,30,-128] (railings on 3 sides, open on the entry side). Show 3호선(orange)/9호선(gold) fare-gate lines near them with signs ("3호선 타는 곳", "9호선 타는 곳").
- Exits you own: subway exits 1 (51.4,-105.7), 8 (-53.2,-85.0), 8-1 (-97.0,-108.1), 8-2 (-33.1,-131.9) (OSM positions are the street-level entrance points) + mall gates along both sidewalks of 신반포로 every ~60–80 m: street canopy structure (glass/steel, "고속터미널역 8-1번 출구" style sign with line colour dots, GOTO MALL gate number), stairs from y=0 to -6 into the mall, `K.groundHole` over each stairwell.
- Junction openings in the south wall: J1 (x≈-70) → 신세계, J2 (x≈120) → 경부선, J3 (x≈-150) → 센트럴시티; keep floor at their `pa` points.
- Zones: split the mall into sections (e.g. 서편 인테리어·꽃, 중앙 패션, 동편 의류·잡화) each with `sub` naming categories; spawns at center, both ends, near exits.
- Budget up to 150k quads.
