# gyeongbu — 서울고속버스터미널 (경부·영동선) + 꽃시장 + 경부선 주차장 + 다이소
Engine: Claude. Claims: OSM 309352819 (L9, H51, L-shaped) plus inner/adjacent terminal structures you model (inspect 356129682, 356129683, 1173093435, 414891732, 1067157374 and parking areas 356129681 @(187,36), 1173093431 @(143,-14), 1173093432 @(290,-78)).

## Research questions (data/research/gyeongbu.json)
- Every floor's use (1F 매표·대합실·승차홈, 2F ?, 3F 꽃도매상가(생화/조화/부자재 구역, 점포 수, 영업시간), 4F~9F ?, 신세계 본사?, 주차?) — reconcile OSM 9 levels/51 m with sources.
- 승차홈 numbering & which destinations (부산, 대구, 대전, 광주? no—경부/영동: 부산, 대구, 대전, 천안, 청주, 강릉, 원주, 속초…), 하차장, 택시 승강장.
- 경부선 주차장: where (rooftop? attached deck? surface lots?), floors/ramps.
- B1: 다이소 강남고속터미널점 (OSM POI level -1 at (208,-131)), other B1 shops, link to GOTO mall; 1F tenants (노브랜드버거 (87,-20), 파리바게뜨, 백미당, 북창동순두부, 아트박스, 타코벨 (30,-53 level 1)…); is there a 노브랜드 마트 nearby (where)?
- Exterior look (1980s building, signage "서울고속버스터미널", canopy over bays).

## Modeling
- 1F: ticket hall (counters, kiosks, departure boards with real destinations), waiting seats, shops; boarding bays along the real OSM platform POIs (~50 nodes, ref 010 — use them for 승차홈 positions/numbering) with canopies, numbered gates, buses with destination signs; 하차장.
- 3F 꽃시장: hundreds of stalls in aisles with buckets of flowers (colourful), 조화 zone, wrapping materials zone, zone signs; night-market atmosphere.
- B1: 다이소 (aisles of shelves), shops; J2 (you own) corridor from GOTO opening (120,-159) south to your B1 at (120,-100), extend B1 to the Daiso position if needed.
- Other floors per research (offices/parking/etc.) with appropriate interiors; 경부선 주차장 as researched.
