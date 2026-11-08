// Shared connection points between place modules. BOTH modules must honor each entry.
// y is the walkable floor height at the junction. pa lies inside module a's space, pb inside module b's.
// owner = module that builds the connecting corridor / opening frame between pa and pb (the other one only
// leaves a >= width-wide, >= 2.6m-tall opening in its own wall and keeps floor at y up to its boundary).
// Smoke test (tests/smoke.mjs) checks there is a walkable floor at y on both pa and pb when both modules load.
import { LEVELS } from '../kit.js';
export const JUNCTIONS = [
  // ---- B1 (y = -6) underground network ----
  { id: 'J1', a: 'gotomall', b: 'shinsegae', y: LEVELS.B1, pa: [-70, -89], pb: [-70, -35], width: 8, owner: 'shinsegae',
    note: 'GOTO south wall opening near x=-70 → corridor south (under 신반포로 sidewalk) → 신세계 B1 north wall (식품관 entrance).' },
  { id: 'J2', a: 'gotomall', b: 'gyeongbu', y: LEVELS.B1, pa: [120, -159], pb: [120, -100], width: 8, owner: 'gyeongbu',
    note: 'GOTO south wall opening near x=120 → corridor south → 경부선 터미널 B1 (다이소 강남고속터미널점 B1 is here).' },
  { id: 'J3', a: 'gotomall', b: 'centralcity', y: LEVELS.B1, pa: [-150, -57.5], pb: [-128, -5], width: 8, owner: 'centralcity',
    note: 'GOTO south wall opening near x=-150 → corridor → 센트럴시티 B1 (north tip of the complex).' },
  // ---- shared walls between adjacent buildings (openings both sides, no corridor) ----
  { id: 'J4', a: 'shinsegae', b: 'centralcity', y: 0, pa: [-88, 14], pb: [-96, 17], width: 8, owner: 'none',
    note: 'Retained unnumbered west-side 1F opening at (-91.73,15.53). The rotated plan has no numbered gate here; round20 moves the former B1 link to J_CC_9GATE.' },
  { id: 'J5', a: 'shinsegae', b: 'centralcity', y: 0, pa: [-46, 39], pb: [-44, 47], width: 6, owner: 'centralcity', alsoY: [3.6],
    note: 'Real 3GATE crosses the south wall at (-45.96,43.08), into the Central City corridor under JW. The 1M bridge is level at y3.6 above this connection (photos #479–481).' },
  { id: 'J_CC_9GATE', a: 'shinsegae', b: 'centralcity', y: LEVELS.B1, pa: [-43.82,37.99], pb: [-38.67,51.495], width: 6.5, owner: 'centralcity',
    note: 'Unmirrored B1 9GATE: south-wall crossing (-42.384,41.72), actual portal (-38.67,51.495), from ssg_r20_gates.json. Central City carries the corridor south to Sweet Park.' },
  // Former J6 at (-55,111.5) is now internal Central City public circulation.
  // It is no longer an entrance to the hotel's invented ground-floor rooms.
  // ---- 7호선 concourse ↔ 파미에스테이션 ----
  { id: 'J7', a: 'station', b: 'centralcity', y: LEVELS.B1, pa: [-45, 191], pb: [-45, 203], width: 8, owner: 'station',
    note: '7호선 B1 concourse (band from (45,150) to (-175,262)) meets the 파미에스테이션 round building B1 (center (-47,215)).' },
  // Round 10: second ground-floor passage, independent of J4 and with no basement descent.
  // Two connections are supported by the user walkthrough; this shared-edge location is a schematic fit,
  // not a surveyed gate position. Official guide + photo control residuals are recorded in both research files.
  { id: 'J8', a: 'shinsegae', b: 'centralcity', y: 0, pa: [-78.917, 37.725], pb: [-86.362, 40.551], width: 8, owner: 'none',
    note: 'Retained unnumbered west-side 1F auxiliary connection at (-82.640,39.138), 신세계 local (u=0,v=68). No numbered gate appears here on the rotated plan. Real 3GATE is J5; B1 9GATE is J_CC_9GATE.' },
  { id: 'J9', a: 'shinsegae', b: 'centralcity', y: 7, pa: [-72.647, 42.938], pb: [-83.810, 47.175], width: 1.8, owner: 'centralcity',
    note: '1F 광장 백화점 2층 에스컬레이터의 상부 연결. Shared-edge landing at (-80.089,45.763), 신세계 local (u=0,v=75.1), uses the retained 2F stair-core south landing. Landing alignment is inferred; official floor guide confirms destination, not surveyed dimensions.' },
  // ---- round 10 ----
  { id: 'J_G11_DAISO', a: 'gotomall', b: 'gyeongbu', y: LEVELS.B1, pa: [244.8, -181.5], pb: [245.3, -179.5], width: 4.5, owner: 'gyeongbu',
    note: '고투몰 중앙광장 G11 문 → 다이소 GATE 4: 양 끝점은 B1 -6m 문과 계단 아래참. 이후 경부 모듈 계단을 올라 GATE 4와 다이소 -4m 홀로 연결된다.' },
  { id: 'J_ONEBAILEY_G2', a: 'gotomall', b: 'onebailey', y: LEVELS.B1, pa: [-287.479, -29.9796], pb: [-290.8408, -38.9565], width: 2.8, owner: 'onebailey',
    note: '고투몰 G2 → 원베일리 공공보행통로 (24시간 벽화 거리). gotomall leaves the G2 wall open.' },
  { id: 'J_ONEBAILEY_PARK', a: 'onebailey', b: 'hangang', y: 0, pa: [-567.9792, -603.6965], pb: [-592, -625], width: 5, owner: 'onebailey',
    note: '보행통로 끝 → 반포나들목 지하차도 → 반포한강공원.' },
  // ---- famille (round 20) ----
  { id: 'JF1', a: 'famille', b: 'centralcity', y: 0, pa: [20.033,148.919], pb: [18.517,145.002], width: 4, owner: 'famille',
    note: '사진 #273 HOUSE OF SHINSEGAE 문 (19.6,147.8): 파미에 벽돌 홀 → 문 안 3 m 로비. 홀 바닥 y0; HOS 1F y+2.1 계단은 centralcity 소유.' },
  { id: 'JF2', a: 'famille', b: 'centralcity', y: 0, pa: [-32.206,172.918], pb: [-37.794,175.082], width: 4.5, owner: 'famille',
    note: 'JW 남면 평행 v≈5 갤러리 이음 (-35,174). 동쪽은 famille, 서쪽은 centralcity. 11.5 m 볼트 갤러리 내 보행 중심선.' },
];
// Vertical wells: owner of the surrounding floor leaves a HOLE (no slab, railing on 3 sides, open on `entry` side);
// the well owner builds stairs/escalators inside it going DOWN from y=top.
export const WELLS = [
  { id: 'W3', floorOwner: 'gotomall', wellOwner: 'station', rect: [-82, -104, -76, -90], top: LEVELS.B1, bottom: LEVELS.B2, entry: 'north',
    note: '3호선 platform access. Escalator+stairs descend southward from z=-104 (y=-6) to B2 (y=-11) platform hall.' },
  { id: 'W9', floorOwner: 'gotomall', wellOwner: 'station', rect: [0, -136, 30, -128], top: LEVELS.B1, bottom: LEVELS.B4, entry: 'west',
    note: '9호선 platform access. Long escalators descend eastward from x=0 (y=-6) to B4 (y=-21).' },
];
