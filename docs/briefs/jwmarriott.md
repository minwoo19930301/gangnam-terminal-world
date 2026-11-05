# jwmarriott — JW 메리어트 호텔 서울
Engine: Claude. Claims: OSM 136986976 (L32, H144).

## Research questions (data/research/jwmarriott.json)
- Floors (지상 32/33, 지하 4?), lobby floor, F&B outlets and their floors after the 2023 full renovation (e.g. 플레이버즈 Flavors 뷔페, 더 마고 그릴, 타마유라, 모보 바, JW 라운지/더 라운지, 베이커리), ballrooms (그랜드 볼룸 floor), 수영장, 피트니스/스파 (마키스?), executive lounge floor, guest room floors range, room types, room numbering, total rooms (~379).
- Exterior: tower look (curtain wall colour, crown, signage "JW MARRIOTT" location), main entrance & porte-cochère location (which side; via 센트럴시티?), lobby interior style (2023 redesign).

## Modeling
- Every floor reachable by a guest elevator bank (one K.elevator listing all floors with names) + service stairs.
- Lobby/reception, lounge, each restaurant floor with tables/bar/buffet stations, ballroom with chandeliers, pool deck, gym. Guest-room floors: corridor with carpet, numbered doors (e.g. 1201…), room modules behind doors; model 1–2 rooms fully (bed, desk, window view) and keep the rest as closed rooms (simple boxes) to stay in budget.
- Junctions: J5 1F opening at (-45.5,43) to 신세계; J6 1F opening at (-55,111.5) to 센트럴시티.
