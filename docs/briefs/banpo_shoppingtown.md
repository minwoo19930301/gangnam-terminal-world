# banpo_shoppingtown — 반포쇼핑타운 1~8동
Engine: Codex. Claims: 413280003 (1동), 131327730 (2동), 131327731 (3동), 413372923 (4동), 413372924 (5동), 413372925 (6동), 413372927 (7동), 413372928 (8동) — row along the north side of 신반포로 opposite the terminal.

## Research questions (data/research/banpo_shoppingtown.json)
- Per 동: floors (OSM 2동 L6 25 m), year built (1970s?), whether upper floors are apartments/offices, what is famous there (반찬가게, 떡집, 정육점, 세탁소, 수선집, 이불가게, 학원, 병원/치과/의원, 부동산, 오래된 식당·카페, 미용실 cluster), 2024–2026 재건축 상황.
- Real shop names (blogs, OSM POIs near each building: many 미용실/식당 POIs at e.g. (-121,-133), (65,-204), (148,-236), (288,-282)).
- Facade/road-view look: tile/brick colour, 간판 density, 1F arcade/pilotis, stairs, signs.

## Modeling
- Each 동 with all its floors: 1F street-facing shops with dense real 간판 (stacked signboards on upper floors too), interior corridors/stairs per floor, shop interiors by type (반찬 진열대, 떡 진열장, 정육 냉장 쇼케이스, 세탁소 hanging clothes, 학원 classrooms, 의원 waiting rooms…), apartment/office floors if real (corridor + doors).
- Stairs in each building + elevator if real. Zones per 동 per floor. Spawns in front of 1동, 4동, 8동 and inside.
