// Key places shown as pins on the map and as floating pins in 3D (outdoors). x east, z south, y = pin base height
// (roof or a little above street level), place = the module whose page it opens (map "여기로 이동").
// Positions: OSM footprint centroids or the modules' own coordinates (see data/research/<id>.json).
export const LANDMARKS = [
  { name: '고속터미널역', sub: '3·7·9호선', x: -33, z: -128, y: 4, place: 'station', color: '#3b6ea8' },
  { name: '고투몰', sub: '강남터미널 지하도상가', x: -2, z: -121, y: 4, place: 'gotomall', color: '#9a5a2b', under: -6 },
  { name: '신세계백화점 강남점', x: -61, z: 3, y: 36, place: 'shinsegae', color: '#b23a31' },
  { name: 'JW 메리어트 서울', x: -24, z: 100, y: 146, place: 'jwmarriott', color: '#5a4a3a' },
  { name: '센트럴시티 · 호남선', x: -116, z: 83, y: 14, place: 'centralcity', color: '#2f7d6d' },
  { name: '파미에스테이션', x: -47, z: 215, y: 10, place: 'centralcity', color: '#a0522d' },
  { name: '서울고속버스터미널', sub: '경부·영동선', x: 135, z: -38, y: 52, place: 'gyeongbu', color: '#2a5d9f' },
  { name: '꽃시장', sub: '경부선 3F', x: 70, z: 20, y: 26, place: 'gyeongbu', color: '#c2417a', floorY: 11 },
  { name: '다이소', sub: '경부선 B1', x: 205, z: -125, y: 14, place: 'gyeongbu', color: '#d71920', floorY: -6 },
  { name: '반포쇼핑타운', x: 60, z: -190, y: 20, place: 'banpo_shoppingtown', color: '#8a5a44' },
  { name: '반포지구대', x: 25, z: -102, y: 11, place: 'streets', color: '#1f4e9a' },
  { name: '르본시티', sub: '귀금속', x: -232, z: 20, y: 40, place: 'lebon', color: '#b08d3c' },
  { name: '데블스도어', x: 380, z: 8, y: 12, place: 'gyeongbu_east', color: '#7a3b1e' },
  { name: '뉴코아아울렛', x: 270, z: -365, y: 24, place: 'newcore', color: '#4b4b4b' },
  { name: '반원상가', sub: '한신치킨', x: -125, z: -408, y: 17, place: 'banwon', color: '#e07a1f' },
  { name: '세빛섬', x: -850, z: -790, y: 22, place: 'hangang', color: '#2a8fbf' },
  { name: '달빛광장', sub: '반포대교 · 잠수교', x: -628, z: -707, y: 6, place: 'hangang', color: '#2a8fbf' },
  { name: '잠원한강공원', x: 300, z: -1450, y: 6, place: 'jamwon_hangang', color: '#3e8e41' },
];
