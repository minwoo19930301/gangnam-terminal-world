# hangang — 반포한강공원 · 세빛섬 · 반포대교/잠수교 · 달빛무지개분수
Engine: Codex. Claim what you render in detail: roads 37928409 & 674432572 (반포대로 layer-2 = 반포대교 upper deck), 596516315 (잠수교), others near the bridge as needed; areas 418249072 / 769712608 (반포한강공원), 919393791, islets 305692221 (예빛섬), 270550732 (채빛섬), 305677067 (가빛섬), 305677071 (솔빛섬), piers 848771871 850389024 850389025 850389026 850389027 850389028 851471280, bridges 1091571021 (잠수교), 1085504592 (반포대교), 1538963197. The Han river water surface itself is rendered by city.js (y≈-1.4); you add everything else. See docs/overview-park.png.

## Research questions (data/research/hangang.json)
- 세빛섬: the islands (가빛섬, 채빛섬, 솔빛섬, 예빛섬) — floors, what is inside each (restaurants/cafes/convention/exhibition), shape (petal/flower glass shells), connecting bridges, LED night colours.
- 달빛무지개분수: on 반포대교 both sides, length (~1,140 m), nozzles, operating season/times, look.
- 반포대교/잠수교: deck heights above water, widths, 잠수교 pedestrian/cyclist use, piers.
- Park facilities near: 달빛광장, 반포 나들목(s) under 올림픽대로 (OSM '반포나들목' at (-202,-672) & (-272,-783)), 편의점(CU), 자전거 대여, 수상택시 승강장, 피크닉장, 서래섬, 무지개 놀이터, 텐트존, 밤도깨비 야시장(시기), lawn, steps to the water.
- Route from 고속터미널 (8-1번 출구) to the park.

## Modeling
- Two-level bridge: 잠수교 lower deck just above water (pedestrian+cyclist+cars), 반포대교 upper deck with piers, railings, street lamps, and fountain nozzles along both sides; animated fountain arcs (`K.onFrame`), rainbow LED colours at night (`K.onNight`).
- 세빛섬 islands as floating petal-shaped glass buildings with interiors per research (restaurant floors, convention hall, cafe), pontoon bridges between them and to the bank.
- Park: paths following OSM footways/cycleways, lawns, trees, benches, CU store, kiosks, 나들목 tunnels under 올림픽대로 connecting to the city side, riverside steps/revetment, 달빛광장, parking.
- Simplified north-bank skyline (용산/이촌 apartments, 남산타워 silhouette far north).
- Zones and spawns: 달빛광장, 세빛섬 each island (floors), 잠수교 middle, 반포대교 upper deck, 나들목.
