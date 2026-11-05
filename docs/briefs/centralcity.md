# centralcity — 센트럴시티 (호남선 터미널 · 파미에스테이션 · 메가박스)
Engine: Claude. Claims: OSM 356127040 (센트럴시티터미널, complex wrapping polygon), 593858530 (파미에스테이션, round 2-level building at (-47,215)), plus other unnamed OSM buildings/parking inside the Central City site that you model (inspect ids 601356623, 1173096802–1173096806, parking area 1173096801 @(-154,121), 타워주차장 POI @(-213,57)).

## Research questions (data/research/centralcity.json)
- 호남선 터미널 (센트럴시티터미널): floors and uses (매표소, 대합실, 승차홈 count/numbering, 하차장), destinations (광주, 전주, 목포, 여수, 순천, 군산, 익산, 정읍…), operator signage.
- 파미에스테이션: where it is (B1 passage + the round building?), concept (2019 renewal), store list (cafes/restaurants/desserts), opening hours.
- Other tenants: 메가박스 센트럴 (floor), 영풍문고/반디앤루니스, 밀레니엄홀(6F)·웨딩, 신세계면세점(폐점 여부), 은행, 스타벅스, OSM POIs (소이연남, 장터국수, 채선당 샤브보트, 아웃백, 던킨, 순대실록, 101번지남산돈까스, 리김밥, Shake Shack, 더스파 …).
- 호남선 주차장: location/type (tower parking? surface? underground floors) and capacity.
- Exterior look and entrances (사평대로/반포대로 side, 신반포로 side).

## Modeling
- 호남선 terminal hall with ticket counters/kiosks/departure boards, gates and the bus bays with buses (destination signs), 하차장; 호남선 주차장 as researched (with parked cars, ramps/levels if multi-level).
- 파미에스테이션 and other floors with real tenants; Megabox lobby/ticketing/a theatre hall; bookstore.
- Junctions: J3 (you own) B1 corridor from GOTO opening (-150,-57.5) to your B1 at (-128,-5). J4 openings (1F, B1) at (-92,15.5) shared with 신세계. J6 1F opening (-55,111.5) to JW. J7: 파미에스테이션 B1 floor at pb (-45,203) with opening toward the 7호선 concourse (station module builds the corridor).
- Do not build inside the JW (136986976) or 신세계 (159117108) footprints.
