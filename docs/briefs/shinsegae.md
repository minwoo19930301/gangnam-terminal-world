# shinsegae — 신세계백화점 강남점
Engine: Claude. Claims: OSM 159117108 (신세계백화점, OSM says L10 H34 — likely wrong; trust research). Add other footprints only if research proves they are part of the store (check what the 2016 신관 증축 is in OSM).

## Research questions (data/research/shinsegae.json)
- Exact floors (지하 몇 층 ~ 지상 몇 층), floor-to-floor heights, total height; 본관/신관 split; 주차장 floors.
- 층별 안내 (official shinsegae.com floor guide; 2024–2026 blogs): per floor the category and 10–30 representative brands (B1 신세계마켓/식품관, 스위트파크 디저트 홀, 하우스 오브 신세계(델리, 2025), 1F 럭셔리·화장품, 2–3F 여성/해외명품, 4F 슈즈(그랜드 슈), 5F, 6–7F 남성·골프·스포츠, 8F 아동/리빙, 9–11F 리빙·식당가·문화홀…), where escalators/elevators/restrooms are.
- Exterior: facade materials/colours, signage (SHINSEGAE letters, where), entrances (which streets), drop-off, connection bridges/passages to 센트럴시티, 경부선 터미널, JW메리어트, 고속터미널역 7호선/파미에스테이션.

## Modeling
- All floors with real brands on shop fascias; luxury floor with boutique storefronts, cosmetics counters on 1F, B1 food hall with market aisles/deli counters/dessert stalls, restaurant floors with dining tables, central escalator atrium (void with glass railings) and elevator bank listing every floor with names.
- Junctions: J1 (you own) B1 corridor from the GOTO mall opening at (-70,-89) south to your B1 at (-70,-35) — a shop-lined underground passage (OSM POIs Johnny Rockets (-55,-47), Tokyo Milk Cheese Factory (-57,-20) level -1 are around it), with its own ceiling. J4 openings (1F and B1) on the shared edge with 센트럴시티 at (-92,15.5). J5 1F opening to JW at (-45.5,43).
- Exterior signage visible from 신반포로; entrances per research.
