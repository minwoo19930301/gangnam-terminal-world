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
  { id: 'J4', a: 'shinsegae', b: 'centralcity', y: 0, pa: [-88, 14], pb: [-96, 17], width: 8, owner: 'none', alsoY: [LEVELS.B1],
    note: 'Shared edge (-107,-24)->(-77,55). Openings centered at (-92,15.5) on 1F (y=0) and B1 (y=-6).' },
  { id: 'J5', a: 'shinsegae', b: 'jwmarriott', y: 0, pa: [-46, 39], pb: [-44, 47], width: 6, owner: 'none',
    note: 'Shared edge (-14,31)->(-77,55). Opening centered at (-45.5,43) on 1F.' },
  { id: 'J6', a: 'centralcity', b: 'jwmarriott', y: 0, pa: [-60, 113], pb: [-50, 110], width: 6, owner: 'none',
    note: 'Shared edge (-77,55)->(-33,168). Opening centered at (-55,111.5) on 1F.' },
  // ---- 7호선 concourse ↔ 파미에스테이션 ----
  { id: 'J7', a: 'station', b: 'centralcity', y: LEVELS.B1, pa: [-45, 191], pb: [-45, 203], width: 8, owner: 'station',
    note: '7호선 B1 concourse (band from (45,150) to (-175,262)) meets the 파미에스테이션 round building B1 (center (-47,215)).' },
  // Round 10: second ground-floor passage, independent of J4 and with no basement descent.
  // Two connections are supported by the user walkthrough; this shared-edge location is a schematic fit,
  // not a surveyed gate position. Official guide + photo control residuals are recorded in both research files.
  { id: 'J8', a: 'shinsegae', b: 'centralcity', y: 0, pa: [-78.917, 37.725], pb: [-86.362, 40.551], width: 8, owner: 'none',
    note: '1게이트 방면 보조 연결: shared edge at (-82.640,39.138), 신세계 local (u=0,v=68). Open 1F passage only; J4 remains the 3게이트 hall link and the existing B1 link.' },
  { id: 'J9', a: 'shinsegae', b: 'centralcity', y: 7, pa: [-72.647, 42.938], pb: [-83.810, 47.175], width: 1.8, owner: 'centralcity',
    note: '1F 광장 백화점 2층 에스컬레이터의 상부 연결. Shared-edge landing at (-80.089,45.763), 신세계 local (u=0,v=75.1), uses the retained 2F stair-core south landing. Landing alignment is inferred; official floor guide confirms destination, not surveyed dimensions.' },
  // ---- round 10 ----
  { id: 'J_G11_DAISO', a: 'gotomall', b: 'gyeongbu', y: LEVELS.B1, pa: [140.6504, -132], pb: [140.6504, -111.8096], width: 5.6, owner: 'gyeongbu',
    note: '고투몰 중앙광장 G11 문 → 계단 → 다이소 GATE 4 (후문, 고투몰 방면 끝). gotomall builds the G11 door/stair up to pa.' },
  { id: 'J_ONEBAILEY_G2', a: 'gotomall', b: 'onebailey', y: LEVELS.B1, pa: [-287.479, -29.9796], pb: [-290.8408, -38.9565], width: 2.8, owner: 'onebailey',
    note: '고투몰 G2 → 원베일리 공공보행통로 (24시간 벽화 거리). gotomall leaves the G2 wall open.' },
  { id: 'J_ONEBAILEY_PARK', a: 'onebailey', b: 'hangang', y: 0, pa: [-567.9792, -603.6965], pb: [-592, -625], width: 5, owner: 'onebailey',
    note: '보행통로 끝 → 반포나들목 지하차도 → 반포한강공원.' },
];
// Vertical wells: owner of the surrounding floor leaves a HOLE (no slab, railing on 3 sides, open on `entry` side);
// the well owner builds stairs/escalators inside it going DOWN from y=top.
export const WELLS = [
  { id: 'W3', floorOwner: 'gotomall', wellOwner: 'station', rect: [-82, -104, -76, -90], top: LEVELS.B1, bottom: LEVELS.B2, entry: 'north',
    note: '3호선 platform access. Escalator+stairs descend southward from z=-104 (y=-6) to B2 (y=-11) platform hall.' },
  { id: 'W9', floorOwner: 'gotomall', wellOwner: 'station', rect: [0, -136, 30, -128], top: LEVELS.B1, bottom: LEVELS.B4, entry: 'west',
    note: '9호선 platform access. Long escalators descend eastward from x=0 (y=-6) to B4 (y=-21).' },
];
