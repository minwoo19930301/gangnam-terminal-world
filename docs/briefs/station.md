# station — 고속터미널역 (서울 지하철 3·7·9호선)
Engine: Codex. Claims: none (all underground; exits are new structures).

## Research questions (data/research/station.json)
- Platform depth/levels for each line (3호선, 7호선, 9호선), platform type (섬식/상대식), platform length, screen doors, transfer routes (3↔7, 3↔9, 7↔9) and their lengths.
- Exit numbers 1–8-2 and which line/concourse each serves; 7호선 concourse layout and its link to 파미에스테이션/센트럴시티/신세계.
- Station sign design: 3호선 orange (#EF7C1C), 7호선 olive (#747F00), 9호선 gold (#BDB092); 역명판 '고속터미널 Express Bus Terminal 高速터미널' with station numbers (339 / 734 / 923); adjacent stations: 3호선 잠원↔교대, 7호선 반포↔내방, 9호선 신반포↔사평.
- Train exterior looks per line (3호선 stainless with orange stripe, 7호선 olive stripe, 9호선 gold/metallic).

## Modeling
- Exits you own (OSM street-level points): 2 (55.1,124.2), 7 (37.5,131.2), 3 (52.1,179.0), 4 (-130.5,250.1), 5 (-185.6,276.9), 6 (-195.3,261.5): canopy + sign + stairs (and escalator where real) down to the 7호선 B1 concourse, `K.groundHole` over each stairwell.
- 7호선 B1 concourse (y=-6): band ≈14 m wide from (45,150) to (-175,262); must NOT overlap JW footprint ((-77,55),(-14,31),(29,144),(-33,168)) or the 파미에스테이션 circle (center (-47,215), r≈17). Fare gates, ticket machines, 역무실, 화장실, signage. Junction J7 (you own): corridor/opening from pa (-45,191) to pb (-45,203) into 파미에스테이션 B1.
- 7호선 platform at B3 (y=-16) under the concourse, following the OSM 7호선 track direction; escalators/stairs/elevator from concourse.
- 3호선 platform at B2 (y=-11): N–S along x≈-79 between z≈-190 and z≈-60 (under the mall). Well W3 [-82,-104,-76,-90]: build escalator + stairs descending southward from z=-104 (y=-6) to the B2 platform hall.
- 9호선 platform at B4 (y=-21): along the 9호선 track line (42,-142)→(-171,-62) under the mall. Well W9 [0,-136,30,-128]: long escalators descending eastward from x=0 (y=-6) to x=30 (y=-21), landing into the 9호선 platform hall.
- Transfer passages between platforms (at least 3↔9 and 3↔7) with signage, long corridors/escalators.
- Trains standing at each platform (simplified 6–10 car consists with line colour stripes, windows, doors) behind platform screen doors; tunnels at ends; 역명판 on walls/pillars, line maps, exit guide boards ("1·8·8-1·8-2 출구 → 고투몰/경부선", "2–7 출구 → 센트럴시티/신세계/JW메리어트").
- Zones per level ("고속터미널역 3호선 승강장" floor 'B2', etc.), spawns on each platform and concourse, elevator per line.
