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
];
// Vertical wells: owner of the surrounding floor leaves a HOLE (no slab, railing on 3 sides, open on `entry` side);
// the well owner builds stairs/escalators inside it going DOWN from y=top.
export const WELLS = [
  { id: 'W3', floorOwner: 'gotomall', wellOwner: 'station', rect: [-82, -104, -76, -90], top: LEVELS.B1, bottom: LEVELS.B2, entry: 'north',
    note: '3호선 platform access. Escalator+stairs descend southward from z=-104 (y=-6) to B2 (y=-11) platform hall.' },
  { id: 'W9', floorOwner: 'gotomall', wellOwner: 'station', rect: [0, -136, 30, -128], top: LEVELS.B1, bottom: LEVELS.B4, entry: 'west',
    note: '9호선 platform access. Long escalators descend eastward from x=0 (y=-6) to B4 (y=-21).' },
];
