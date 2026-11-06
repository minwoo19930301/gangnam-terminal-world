// 센트럴시티 — 호남선 고속버스터미널(센트럴시티터미널) · 파미에스테이션 · 메가박스 센트럴 · 옥상/타워 주차장
// Real OSM footprints: 356127040 (terminal complex, H9), 593858530 (파미에스테이션 원형관, 2F),
// 601356623 (타워주차장, H9), 1173096805 (버스 주차장 데크, layer 1), area 1173096801 (호남선 버스 주차장).
// The complex is a long low podium (1F terminal hall + 2F 식당가, 9 m) whose roof is a car deck with a one-way loop road
// (OSM service ways 593858534/536/537, layer 1) linked by bridges to the 타워주차장 and the yard deck (layer 2 roads).
//
// Local frame: the strip runs along OSM's west facade (-135.7,9.9)->(-80.7,150.7).
//   s = distance south along that facade, t = distance east (toward 신세계/JW). P(s,t) -> world [x,z].
//   strip:        s -22..151, t 0..38.5   (1F vaulted hall t6..23; 2F dining east of t23)
// Photo 11 / review supersede the round roof's unreliable OSM H8.4: roof apex 16.5m, wall footprint unchanged.
//   south block:  s 151..204, t -98..38   (파미에스테이션 1F/2F, 하차장, 메가박스 B1)
export const meta = {
  id: 'centralcity',
  name: '센트럴시티 (호남선 터미널 · 파미에스테이션)',
  claims: [356127040, 593858530, 601356623, 1173096805],
  claimRoads: [593858534, 593858536, 593858537, 1128012726, 1128012724, 1185035520, 1065783056, 1185035521],
  claimAreas: [1173096801],
  sources: [
    'refs/roadview/cc_01_main_gate_plaza_spheres_shinsegae_west_tower.jpg',
    'refs/roadview/cc_02_sinbanporo_west_from_main_gate_tan_block_led.jpg',
    'refs/roadview/manifest.json',
    'refs/aerial/shinsegae_centralcity.jpg',
    'refs/photos/centralcity/01_main_gate.jpg',
    'refs/photos/centralcity/02_dropoff.jpg',
    'refs/photos/centralcity/03_cinus_entrance.jpg',
    'refs/photos/centralcity/05_underpass.jpg',
    'refs/photos/centralcity/07_honam_boarding.jpg',
    'refs/photos/centralcity/08_arcade.jpg',
    'refs/photos/centralcity/09_taxi.jpg',
    'refs/photos/centralcity/11_banpo_overview.jpg',
    'https://namu.wiki/w/센트럴시티',
    'https://ko.wikipedia.org/wiki/센트럴시티_(건축물)',
    'https://nuthang.com/센트럴시티-터미널/',
    'https://www.dailian.co.kr/news/view/688291/',
    'https://biz.newdaily.co.kr/site/data/html/2018/01/22/2018012210006.html',
    'https://biz.newdaily.co.kr/site/data/html/2016/05/24/2016052410007.html',
    'https://limeade.kr/센트럴-메가박스-상영시간표/',
    'https://www.kukinews.com/article/view/kuk201807180185',
    'OpenStreetMap (data/osm.json): footprints, service roads, POIs',
  ],
};

export function build(K) {
  const PI = Math.PI;
  const YB1 = K.LEVELS.B1, Y1 = 0, Y2 = 5, YR = 9; // B1 -6 · 1F 0 · 2F 5 · 옥상 9
  const C1 = Y2 - 0.3, C2 = YR - 0.4, CB = Y1 - 0.3; // ceiling undersides
  const rnd = K.rand(7311);
  const sign = (text, o) => K.sign(text, { pxPerM: 64, ...o });

  // ---------------------------------------------------------------- frame
  const R = Math.atan2(0.3639, 0.9315);
  const AX = Math.sin(R), AZ = Math.cos(R), EX = Math.cos(R), EZ = -Math.sin(R);
  const OX = -135.7, OZ = 9.9;
  const P = (s, t) => [OX + AX * s + EX * t, OZ + AZ * s + EZ * t];
  const RECT = (s0, t0, s1, t1) => [P(s0, t0), P(s1, t0), P(s1, t1), P(s0, t1)];
  const F = { S: R, N: R + PI, E: R + PI / 2, W: R - PI / 2 };
  const lbox = (s, t, ds, dt, y, h, mat, o = {}) => { const [x, z] = P(s, t); return K.box({ x, z, y, h, w: dt, d: ds, rotY: R, mat, ...o }); };
  const lsign = (text, s, t, y, w, h, face, o = {}) => { const [x, z] = P(s, t); sign(text, { x, z, y, w, h, rotY: F[face], ...o }); };
  const lwall = (s0, t0, s1, t1, y0, y1, o = {}) => { const a = P(s0, t0), b = P(s1, t1); K.wall(a[0], a[1], b[0], b[1], y0, y1, o); };
  const lcyl = (s, t, y, r, h, mat, o = {}) => { const [x, z] = P(s, t); K.cyl({ x, z, y, r, h, mat, seg: 10, ...o }); };
  const lfloorText = (text, s, t, y, w, h, face, o = {}) => { const [x, z] = P(s, t); K.floorText(text, { x, z, y, w, h, rotY: F[face] + PI, ...o }); };
  const lperson = (s, t, y, o = {}) => { const [x, z] = P(s, t); K.person(x, y, z, o); };
  const lcrowd = (s0, t0, s1, t1, y, n, seed) => { // like K.crowd but keeps people out of voids/escalator holes
    const r = K.rand(seed * 101 + 7), hl = y === Y1 ? H.f1 : y === Y2 ? H.f2 : y === YB1 ? H.b1 : [];
    for (let k = 0, g = 0; k < n && g < n * 20; g++) {
      const s = s0 + r() * (s1 - s0), t = t0 + r() * (t1 - t0), [x, z] = P(s, t);
      if (hl.some(h => K.pointInPoly(x, z, h))) continue;
      K.person(x, y, z, { rotY: r() * 6.28 }); k++;
    }
  };
  const lzone = (s0, t0, s1, t1, o) => K.zone({ poly: RECT(s0, t0, s1, t1), ...o });
  // Static square-section struts. Raw faces avoid collision planes across the open hall.
  const beam = (a, b, width = 0.16, mat = 0xd8ded9) => {
    const pa = P(a[0], a[1]), pb = P(b[0], b[1]);
    const A = new K.THREE.Vector3(pa[0], a[2], pa[1]), B = new K.THREE.Vector3(pb[0], b[2], pb[1]);
    const D = B.clone().sub(A).normalize();
    const U = new K.THREE.Vector3(0, 1, 0).cross(D);
    if (U.lengthSq() < 0.01) U.set(1, 0, 0); else U.normalize();
    const V = D.clone().cross(U).normalize();
    const corners = C => [[-1,-1],[1,-1],[1,1],[-1,1]].map(([u,v]) => C.clone().addScaledVector(U,u*width/2).addScaledVector(V,v*width/2).toArray());
    const aa = corners(A), bb = corners(B);
    for (let i = 0; i < 4; i++) { const j = (i+1)%4, n = [V.clone().negate(), U, V, U.clone().negate()][i]; K.quad(mat,[aa[i],aa[j],bb[j],bb[i]],n.toArray()); }
    K.quad(mat,aa,D.clone().negate().toArray()); K.quad(mat,bb,D.toArray());
  };
  // Photo 01/03/09 round steel tubes; static octagonal faces merge with the rest of the module.
  const entryTubeWorld = (a,b,d=0.15,mat=0xf0f1ee) => {
    const A=new K.THREE.Vector3(...a),B=new K.THREE.Vector3(...b),D=B.clone().sub(A).normalize();
    const U=new K.THREE.Vector3(0,1,0).cross(D); if(U.lengthSq()<0.01)U.set(1,0,0);else U.normalize();
    const V=D.clone().cross(U).normalize();
    const ring=C=>Array.from({length:8},(_,i)=>C.clone().addScaledVector(U,Math.cos(i*PI/4)*d/2).addScaledVector(V,Math.sin(i*PI/4)*d/2).toArray());
    const aa=ring(A),bb=ring(B);
    for(let i=0;i<8;i++){const j=(i+1)%8,n=U.clone().multiplyScalar(Math.cos((i+.5)*PI/4)).addScaledVector(V,Math.sin((i+.5)*PI/4));K.quad(mat,[aa[i],aa[j],bb[j],bb[i]],n.toArray());}
  };
  const entryTube=(a,b,d,mat)=>{const aa=P(a[0],a[1]),bb=P(b[0],b[1]);entryTubeWorld([aa[0],a[2],aa[1]],[bb[0],b[2],bb[1]],d,mat);};
  const entryDoubleLamp=(x,z,y=0)=>{
    K.cyl({x,z,y,r:.13,h:3.9,mat:0x242a28,seg:10});
    K.cyl({x,z,y,r:.26,h:.16,mat:0x242a28,seg:10,solid:false});
    for(const d of [-.6,.6]){
      entryTubeWorld([x,y+3.45,z],[x+d,y+3.65,z],.08,0x242a28);
      entryTubeWorld([x+d,y+3.65,z],[x+d,y+4.08,z],.07,0x242a28);
      K.dome({x:x+d,z,y:y+4.12,rx:.26,ry:.34,rz:.26,hemi:false,seg:12,rings:8,mat:{tex:'emit',color:0xe5e5d7}});
      K.dome({x:x+d,z,y:y+4.35,rx:.35,ry:.12,rz:.35,seg:12,rings:4,mat:0x242a28});
    }
  };
  // Photo 09: 4 m barrel, 0.6 m rise, white V pairs every 4 m (about 20 degrees).
  const canopy = (s0,s1,t0,t1,y) => {
    const at=(s,t,yy)=>{const[x,z]=P(s,t);return[x,yy,z];},roofY=u=>y+.6*Math.sin(u*PI),sc=(s0+s1)/2;
    K.material('ccDropRoof',new K.THREE.MeshLambertMaterial({color:0xb8c4c6,transparent:true,opacity:.6,side:K.THREE.DoubleSide,depthWrite:false}));
    for(let k=0;k<12;k++){
      const u=k/12,v=(k+1)/12,a=s0+(s1-s0)*u,b=s0+(s1-s0)*v;
      K.quad('ccDropRoof',[at(a,t0,roofY(u)),at(b,t0,roofY(v)),at(b,t1,roofY(v)),at(a,t1,roofY(u))],[0,1,0]);
    }
    for(let t=t0;t<=t1+.01;t+=4){
      for(let k=0;k<12;k++)entryTube([s0+(s1-s0)*k/12,t,roofY(k/12)],[s0+(s1-s0)*(k+1)/12,t,roofY((k+1)/12)],.08,0xedefe9);
      for(const d of [-1,1])entryTube([sc+d*.05,t,.15],[sc+d*1.25,t,y+.4],.15,0xf0f1ee);
    }
    for(const ss of [s0,sc,s1])entryTube([ss,t0,roofY((ss-s0)/(s1-s0))],[ss,t1,roofY((ss-s0)/(s1-s0))],.10,0xd9dfdc);
  };

  // ---------------------------------------------------------------- footprints
  const osmPoly = (id, fb) => { const b = K.osmBuilding(id)[0]; return b ? b.poly.map(p => [p[0], p[1]]) : fb; };
  const TERM = osmPoly(356127040, [[-141.8, -11.4], [-140.9, -9.1], [-142.7, -8.1], [-140.8, -2.7], [-137.7, 4.3], [-135.7, 9.9], [-80.7, 150.7], [-93.3, 174.1], [-166.2, 202.1], [-153.5, 236], [-27.5, 185.3], [-33, 168.1], [-107.1, -24.3]]);
  const ROUND = osmPoly(593858530, null);
  const TOWER = osmPoly(601356623, null);
  const DECK = osmPoly(1173096805, null);
  const yardArea = (K.osm.areas || []).find(a => a.id === 1173096801);
  const YARD = yardArea ? yardArea.poly : [[-137, 57], [-209, 82], [-172, 185], [-99, 157]];
  const T = i => TERM[i];

  // B1 must stay north of the station's 7호선 concourse band (centerline (45,150)->(-175,262), half width 7)
  const bandS = p => (p[0] - 45) * 0.4537 + (p[1] - 150) * 0.8912;
  function clipHalf(poly, f) {
    const out = [];
    for (let i = 0; i < poly.length; i++) {
      const a = poly[i], b = poly[(i + 1) % poly.length], fa = f(a), fb = f(b);
      if (fa <= 0) out.push(a);
      if ((fa <= 0) !== (fb <= 0)) { const k = fa / (fa - fb); out.push([a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k]); }
    }
    return out;
  }
  // station's B1 hall follows (45,150)->(-45,186)->(-68,195)->(-88,220)->(-175,262), 14 m wide: keep ≥7.6 m from it
  const sE9 = t => 204.1 - (t + 98.9) * (1.3 / 135.8);
  const B1POLY = [T(0), T(1), T(2), T(3), T(4), T(5), T(6), T(7), T(8), T(9), P(sE9(-33), -33), P(201.2, -26.5), P(196.3, -18.5), P(191.6, -10.5), P(189.4, -4), P(189.4, 37.8), T(11), T(12)];
  void clipHalf; void bandS;
  // 1F interior outline: the west facade is set back to t=6 between s=-10 and s=149 (bus noses under the 2F overhang)
  const F1POLY = [T(0), T(1), T(2), T(3), P(-10, 0.3), P(-10, 6), P(149, 6), P(149.6, 0.6), T(7), T(8), T(9), T(10), T(11), T(12)];

  // ---------------------------------------------------------------- palette
  // Photo 07: a polished, pale marble surface; custom material keeps specular response
  // instead of the kit's default matte Lambert material (all geometry still merged).
  K.material('ccPolishedMarble', new K.THREE.MeshStandardMaterial({
    color: 0xe6e6e2, map: K.T.surface('marble').tex, roughness: 0.18, metalness: 0.04,
  }));
  const M = {
    hallFloor: { tex: 'ccPolishedMarble', scale: [1.2,1.2] }, b1Floor: { tex: 'tile', color: 0xc9b9a3 }, f2Floor: { tex: 'tile', color: 0xe2ddd3 },
    ceil: { tex: 'ceiling', color: 0xf4f2ee }, wallIn: 0xeeebe4, wallB1: 0xe4ddd0, part: 0xf3f0ea, dark: 0x2b2d30,
    steel: 0x6f767d, col: 0xe9ebe6, glass: 'glass', roof: 0xa9a7a0, asphalt: { tex: 'asphalt', color: 0x8d8d8f },
    wood: { tex: 'wood', color: 0xc8a27a }, platform: { tex: 'sidewalk', color: 0xd9d4ca },
  };
  // Photo 01: granite pylon panels, 1.0 x 0.5 m (four courses per repeat).
  K.texture('ccStone', 256, 128, (g,w,h) => {
    g.fillStyle='#a98e84'; g.fillRect(0,0,w,h);
    for(let row=0;row<4;row++) for(let col=-1;col<5;col++) {
      const x=col*64+(row%2)*32, y=row*32;
      g.fillStyle=['#a98f85','#ad9389','#a58c82','#b0978c'][(row+col+5)%4]; g.fillRect(x+1,y+1,62,30);
      g.strokeStyle='#7f716a'; g.lineWidth=1; g.strokeRect(x,y,64,32);
    }
  },[4,2]);
  // June 2026 cc_01: brown brick-like stone courses at the north entrance.
  // Keep the older podium/pavilion palette independent of this frontage update.
  K.texture('ccGateBrick',256,128,(g,w,h)=>{
    g.fillStyle='#79665e';g.fillRect(0,0,w,h);
    for(let row=0;row<8;row++)for(let col=-1;col<5;col++){
      const x=col*64+(row%2)*32,y=row*16;
      g.fillStyle=['#9c8175','#94796d','#a0877b','#977d72'][(row*3+col+9)%4];
      g.fillRect(x+1,y+1,62,14);
    }
  },[3.2,1.6]);
  K.texture('ccBand',256,128,(g,w,h)=>{
    g.fillStyle='#a5a09a';g.fillRect(0,0,w,h);g.strokeStyle='#7b7771';g.lineWidth=1;
    for(let y=0;y<h;y+=32){g.beginPath();g.moveTo(0,y);g.lineTo(w,y);g.stroke();}
    for(let x=0;x<w;x+=64){g.beginPath();g.moveTo(x,0);g.lineTo(x,h);g.stroke();}
  },[3.2,1.6]);
  K.texture('ccCheck',128,128,(g,w,h)=>{g.fillStyle='#dedbd4';g.fillRect(0,0,w,h);g.fillStyle='#595b58';g.fillRect(0,0,w/2,h/2);g.fillRect(w/2,h/2,w/2,h/2);},[2.4,2.4]);
  K.texture('ccRed',128,128,(g,w,h)=>{g.fillStyle='#933b32';g.fillRect(0,0,w,h);g.strokeStyle='#432925';g.lineWidth=2;g.strokeRect(0,0,w,h);g.beginPath();g.moveTo(0,h/2);g.lineTo(w,h/2);g.stroke();},[1.2,1.2]);
  K.texture('ccLouver', 64, 64, (g, w, h) => { g.fillStyle = '#9aa2a8'; g.fillRect(0, 0, w, h); g.fillStyle = '#5d656c'; for (let i = 0; i < 8; i++) g.fillRect(0, i * 8 + 5, w, 2); }, [1, 1]);

  // ---------------------------------------------------------------- hole registry (slabs are laid last)
  const H = { b1: [], f1: [], f2: [], rf: [] };
  const hole = (levels, poly) => { for (const l of levels) H[l].push(poly); };
  const rail = (s0, t0, s1, t1, y) => { lwall(s0, t0, s1, t1, y, y + 1.05, { mat: 'glass', thick: 0.04 }); const a = P(s0, t0), b = P(s1, t1); const L = Math.hypot(b[0] - a[0], b[1] - a[1]); K.box({ x: (a[0] + b[0]) / 2, z: (a[1] + b[1]) / 2, y: y + 1.02, h: 0.06, w: 0.08, d: L, rotY: Math.atan2(b[0] - a[0], b[1] - a[1]), mat: 0x8a9096, solid: false }); };

  // escalator pair along s. bottom at sb (low y), top at st. up at t, down at t+1.5. returns nothing; cuts hole in `lvl`.
  function escPair(sb, st, t, ya, yb, lvl, groundToo) {
    const dir = Math.sign(st - sb);
    const a1 = P(sb, t), b1 = P(st, t), a2 = P(sb, t + 1.5), b2 = P(st, t + 1.5);
    K.escalator(a1[0], a1[1], b1[0], b1[1], { ya, yb, dir: 'up', w: 1.1 });
    K.escalator(a2[0], a2[1], b2[0], b2[1], { ya, yb, dir: 'down', w: 1.1 });
    const s0 = Math.min(sb - dir * 0.6, st), s1 = Math.max(sb - dir * 0.6, st);
    const hp = RECT(s0, t - 0.75, s1, t + 2.25);
    hole([lvl], hp); if (groundToo) K.groundHole(hp);
    // glass rails around the void on the upper floor (open at the top landing)
    rail(s0, t - 0.75, s1, t - 0.75, yb); rail(s0, t + 2.25, s1, t + 2.25, yb);
    const back = dir > 0 ? s0 : s1; rail(back, t - 0.75, back, t + 2.25, yb);
    // landing comb plates
    for (const [s, y] of [[sb, ya], [st, yb]]) lbox(s - dir * 0.5 * (s === sb ? 1 : -1), t + 0.75, 1.0, 2.7, y, 0.02, 0x9aa0a6, { solid: false });
  }
  // straight stair flight along s from (sa,y0) to (sb,y1) at t (w 2.2); hole cut in `lvl`
  function flight(sa, sb, t, y0, y1, lvl, groundToo) {
    const a = P(sa, t), b = P(sb, t);
    K.stairs(a[0], a[1], b[0], b[1], { w: 2.2, ya: y0, yb: y1, mat: { tex: 'darkstone', color: 0x9a948c } });
    if (lvl) { const hp = RECT(Math.min(sa, sb) - 0.2, t - 1.2, Math.max(sa, sb), t + 1.2); hole([lvl], hp); if (groundToo) K.groundHole(hp); }
  }
  function elev(name, s, t, face, floors, levels) {
    const [x, z] = P(s, t);
    K.elevator({ name, x, z, rotY: F[face], w: 2.2, d: 2.2, floors, mat: 0xb4b8bc, doorMat: 0x9ca4ab });
    const hp = RECT(s - 1.15, t - 1.15, s + 1.15, t + 1.15); hole(levels, hp);
  }

  // ---------------------------------------------------------------- shop generator
  // row along axis 's' (depth along t) or 't' (depth along s). u0..u1 along the row, front at depth f, back at b.
  const BRAND = {
    '스타벅스': ['#00704a', '#ffffff'], '쉐이크쉑': ['#1b1b1b', '#ffffff'], '신한은행': ['#0046ff', '#ffffff'], '파리바게뜨': ['#14316b', '#ffffff'],
    '던킨': ['#ffffff', '#ff671f'], '아웃백 스테이크하우스': ['#4a1a10', '#f3e3c3'], '명동교자': ['#ffffff', '#b3261e'], '앤드테일 커피바': ['#1d1d1d', '#e8d8b0'],
    '리김밥': ['#ffd200', '#222222'], '소이연남': ['#f4efe6', '#1e5631'], '채선당 샤브보트': ['#2f7d32', '#ffffff'], '장터국수': ['#6b3f1d', '#ffffff'],
    '포브 FOURB': ['#f2ece0', '#3a2a1a'], '순대실록': ['#222222', '#ffffff'], '101번지 남산돈까스': ['#c62828', '#ffffff'], '르사이공': ['#0b6e4f', '#ffffff'],
    '우마이도': ['#111111', '#f5f5f5'], '스노우폭스': ['#ffffff', '#e7568d'], '서대문 한옥집': ['#3e2723', '#ffecb3'], '홍대만뽀': ['#ffffff', '#111111'],
    '팔도국수 면주방': ['#8d1e1e', '#ffffff'], '더스파': ['#222222', '#f2d7b0'], '더 살롱': ['#222222', '#f2d7b0'], '더네일바': ['#f2d0d8', '#6a2a3a'],
  };
  const KIND_COL = { food: ['#7a2e22', '#fff'], cafe: ['#2d5a3d', '#fff'], store: ['#2a3a4a', '#fff'], bank: ['#1f4e9c', '#fff'], office: ['#3a3f45', '#fff'], toilet: ['#1d3557', '#fff'], flower: ['#fff', '#c2185b'], beauty: ['#222', '#f2d7b0'] };
  const SHOP_PAL = [
    { top: 0xc8a27a, leg: 0x3b2f27, chair: 0x2f5d50 }, { top: 0xeeeae2, leg: 0x2b2b2b, chair: 0x9a3b30 }, { top: 0x9a7a58, leg: 0x2a2522, chair: 0xd9a441 },
    { top: 0xb9c0c6, leg: 0x55606a, chair: 0x1f3b5a }, { top: 0xe0cfb4, leg: 0x6b4f37, chair: 0x6f7f45 }, { top: 0x3a3330, leg: 0x1b1b1b, chair: 0xc9b38a },
  ];
  const KNOWN = new Set([...Object.keys(BRAND), '화장실', '메가박스 센트럴 B1']);
  const menuFor = name => [name];
  function shop(o) {
    const { axis = 's', u0, u1, f, b, y, h = 4, name, kind = 'food', sub = null, open = false, noBack = false, seed = 1 } = o;
    if (!KNOWN.has(name)) return; // No invented tenants/category storefronts in unverified bays.

    const pt = (u, v) => axis === 's' ? [u, v] : [v, u];
    const W2 = (ua, va, ub, vb, y0, y1, oo) => { const A = pt(ua, va), B = pt(ub, vb); lwall(A[0], A[1], B[0], B[1], y0, y1, oo); };
    const face = axis === 's' ? (f > b ? 'E' : 'W') : (f > b ? 'S' : 'N');
    const dv = Math.sign(f - b), len = u1 - u0, dep = Math.abs(f - b), um = (u0 + u1) / 2;
    // partitions + back
    W2(u0, b, u0, f, y, y + h, { mat: M.part, thick: 0.15 });
    W2(u1, b, u1, f, y, y + h, { mat: M.part, thick: 0.15 });
    if (!noBack) W2(u0, b, u1, b, y, y + h, { mat: kind === 'food' ? 0xe7dccb : M.part, thick: 0.15 });
    // front
    const dw = open ? len - 1.0 : Math.min(3.2, len * 0.45);
    if (kind === 'office' || kind === 'toilet') {
      const ops = kind === 'toilet' ? [{ at: len * 0.3, w: 1.4, y0: y, y1: y + 2.4 }, { at: len * 0.7, w: 1.4, y0: y, y1: y + 2.4 }] : [{ at: len / 2, w: 1.2, y0: y, y1: y + 2.4 }];
      W2(u0, f, u1, f, y, y + h, { mat: kind === 'toilet' ? 0xdfe3e6 : 0xd9d6cf, thick: 0.15, openings: ops });
    } else {
      W2(u0, f, u1, f, y, y + h, { mat: 'glass', thick: 0.04, openings: [{ at: len / 2, w: dw, y0: y, y1: y + 3.0 }] });
    }
    // fascia band + sign
    const fy = y + Math.min(h - 0.45, 3.55);
    const fp = pt(um, f + dv * 0.12);
    lbox(fp[0], fp[1], axis === 's' ? len - 0.1 : 0.2, axis === 's' ? 0.2 : len - 0.1, fy - 0.4, 0.8, 0x26282b, { solid: false });
    const col = BRAND[name] || KIND_COL[kind] || KIND_COL.food;
    const sp = pt(um, f + dv * 0.24);
    lsign(name, sp[0], sp[1], fy, Math.min(len - 0.6, 7.5), 0.66, face, { bg: col[0], fg: col[1], sub, pxPerM: 80 });
    // interior fixtures
    const R2 = K.rand(seed * 977 + Math.round(u0 * 13));
    const ip = (u, v) => pt(u, v); // local helper
    const inU = (k) => u0 + 0.8 + k * (len - 1.6);
    const vAt = (k) => b + dv * (0.6 + k * (dep - 1.2)); // 0 back .. 1 front
    const boxAt = (u, v, du, dv2, yy, hh, mat, oo = {}) => { const p = ip(u, v); lbox(p[0], p[1], axis === 's' ? du : dv2, axis === 's' ? dv2 : du, yy, hh, mat, oo); };
    if (kind === 'food' || kind === 'cafe') {
      const pal = SHOP_PAL[(((seed * 7 + Math.round(u0)) % SHOP_PAL.length) + SHOP_PAL.length) % SHOP_PAL.length];
      const brandHex = parseInt(col[0].slice(1), 16), darkBrand = (col[0] === '#ffffff' || col[0] === '#f4efe6' || col[0] === '#f2ece0') ? 0x3a3330 : brandHex;
      // counter: brand-coloured front, light top, register + (cafe) pastry case / (food) pickup shelf
      boxAt(um, vAt(0.05), len - 1.6, 0.7, y, 1.05, darkBrand, { top: kind === 'cafe' ? 0x2a2522 : 0xe9e4da });
      { const p = ip(u0 + 1.3, vAt(0.05)); lbox(p[0], p[1], 0.36, 0.36, y + 1.05, 0.3, 0x1b1b1b, { solid: false }); }
      if (kind === 'cafe' && len > 4) { boxAt(um + len * 0.15, vAt(0.05), Math.min(2.4, len * 0.3), 0.6, y + 1.05, 0.5, 'glass', { solid: false }); for (let q = 0; q < 4; q++) boxAt(um + len * 0.15 - 0.75 + q * 0.5, vAt(0.05), 0.3, 0.3, y + 1.1, 0.12, [0xd9a35b, 0xf2e3c6, 0x8a4b2a, 0xe7a0b0][q], { solid: false }); }
      // back kitchen line (stainless) with hood for food, espresso machines for cafes
      if (dep > 3.5) {
        boxAt(um, b + dv * 0.45, len - 0.8, 0.6, y, 0.95, 0xb8bcc0, { top: 0xd0d4d8 });
        if (kind === 'food') boxAt(um, b + dv * 0.5, Math.min(len - 1.2, 4), 0.8, y + 1.75, 0.4, 0xa9aeb3, { solid: false });
        else for (const du of [-0.6, 0.6]) boxAt(um + du, b + dv * 0.45, 0.7, 0.45, y + 0.95, 0.45, 0x8f969c, { solid: false });
      }
      if (dep > 4) {
        const mp = ip(um, b + dv * 0.08), menu = menuFor(name, kind);
        lsign([name, ...menu], mp[0], mp[1], y + 2.95, Math.min(len - 1.2, 4.4), 1.15, face, { bg: '#151515', fg: '#f5e6c8', pxPerM: 80, box: 0.05, boxMat: darkBrand });
        { const lp = ip(um, b + dv * 0.12); lbox(lp[0], lp[1], axis === 's' ? Math.min(len - 1.2, 4.4) : 0.05, axis === 's' ? 0.05 : Math.min(len - 1.2, 4.4), y + 2.3, 0.05, 'emit', { color: 0xfff1d0, solid: false }); }
      }
      // standing menu board outside the shop front
      if (!open && len > 5) { const ap = ip(u0 + 0.9, f + dv * 0.6); lsign([name, menuFor(name, kind)[0]], ap[0], ap[1], y + 0.75, 0.8, 1.0, face, { bg: '#262626', fg: '#ffffff', twoSided: true, pxPerM: 70 }); }
      // shop ceiling light panels
      const lp2 = ip(um, (f + b) / 2); lbox(lp2[0], lp2[1], axis === 's' ? Math.max(1, len - 3) : 0.6, axis === 's' ? 0.6 : Math.max(1, len - 3), y + h - 0.12, 0.05, 'emit', { color: 0xfff3dc, solid: false });
      const nT = Math.max(1, Math.floor((len - 1.5) / 2.4)), nV = Math.max(1, Math.floor((dep - 3) / 2.4));
      for (let i = 0; i < nT; i++) for (let j = 0; j < nV; j++) {
        const u = u0 + 1.4 + i * (len - 2.8) / Math.max(1, nT - 1) * (nT > 1 ? 1 : 0) + (nT === 1 ? (len - 2.8) / 2 : 0);
        const v = b + dv * (2.6 + j * 2.4);
        if (Math.abs(v - f) < 1.1) continue;
        boxAt(u, v, 0.8, 0.8, y, 0.74, pal.leg, { top: pal.top });
        for (const du of [-0.62, 0.62]) { boxAt(u + du, v, 0.42, 0.42, y, 0.45, pal.chair, { solid: false }); boxAt(u + du * 1.3, v, 0.08, 0.42, y + 0.45, 0.42, pal.chair, { solid: false }); }
        if (dep > 4 && R2() < 0.6) { const pp = ip(u, v); lbox(pp[0], pp[1], 0.3, 0.3, y + 2.15, 0.18, 'emit', { color: 0xffd9a0, solid: false }); }
        if (R2() < 0.45) { const p = ip(u + 0.62, v); K.person(p[0], y, p[1], { sit: true, rotY: R + (axis === 's' ? 0 : PI / 2) }); }
      }
    } else if (kind === 'store' || kind === 'flower' || kind === 'beauty') {
      boxAt(um, vAt(0), len - 1.2, 0.5, y, 1.9, kind === 'beauty' ? 0xf0e6e0 : 0xd9d2c4);
      if (kind === 'flower') for (let i = 0; i < Math.floor(len / 0.7); i++) { const p = ip(u0 + 0.5 + i * 0.7, f - dv * 0.6); lcyl(p[0], p[1], y, 0.22, 0.45, 0x5d6870, { solid: false, caps: true }); lbox(p[0], p[1], 0.38, 0.38, y + 0.45, 0.35, [0xe7568d, 0xffffff, 0xf2c94c, 0xd84a4a, 0x9b59b6][i % 5], { solid: false }); }
      else if (kind === 'beauty') { boxAt(um - len * 0.2, vAt(0.5), 1.2, 0.7, y, 0.75, 0xffffff); boxAt(um + len * 0.2, vAt(0.5), 0.6, 0.6, y, 1.1, 0x222222); }
      else boxAt(um, vAt(0.55), Math.max(1, len - 4), 1.0, y, 0.9, 0xb9a88f);
    } else if (kind === 'bank') {
      for (let i = 0; i < Math.floor((len - 1) / 1.3); i++) { const u = u0 + 1.0 + i * 1.3; boxAt(u, vAt(0), 0.9, 0.7, y, 1.75, 0x4b5a6a); const p = ip(u, vAt(0) + dv * 0.37); lbox(p[0], p[1], axis === 's' ? 0.55 : 0.02, axis === 's' ? 0.02 : 0.55, y + 1.05, 0.38, 'emit', { color: 0x8fc7ff, solid: false }); }
    }
  }
  // generic B1 stall: open counter front, menu board, two stools
  function stall(o) { shop({ ...o, open: true, h: 3.6 }); }

  // ================================================================= 1F — 호남선 터미널 (strip)
  // Photos 02/07 show one red doorway for each numbered 승차홈; no grouped gate layer.
  // Only 2/3/4/5/12 are legible in the references. The continuous sequence and spacing are inferred.
  const BOARDING_DOORS = [-3,9,21,33,45,57,69,81,105,117,129,141].map((s,i)=>({p:i+1,s}));
  const DESTINATIONS=['광주','전주','목포','순천','여수']; // Research supports routes, not a bay-by-bay assignment.
  const OPS = [
    { n: '금호고속', c: 0xf2f1ec, stripe: 0xd2232a }, { n: '중앙고속', c: 0xe9e4d4, stripe: 0x263d60 },
    { n: '천일고속', c: 0xf2f1ec, stripe: 0x9c292e }, { n: '한일고속', c: 0xe9e4d4, stripe: 0x722534 },
    { n: '삼화고속', c: 0xf2f1ec, stripe: 0x30577e }, { n: '동부고속', c: 0xe9e4d4, stripe: 0x347b51 },
  ];
  // Aerial / photos 03,09: mostly ivory coaches with operator stripes, occasional
  // premium charcoal and red/white tour coaches. Exact allocations are inferred.
  const coach = (s,t,face,index,label='회송') => {
    const op=OPS[index%OPS.length], variant=index%20, premium=variant===16||variant===17, tour=variant>=18;
    const body=premium?0x2e3135:op.c, stripe=tour?0xd2232a:op.stripe;
    const [x,z]=P(s,t);
    K.vehicle({x,z,rotY:face,kind:'bus',color:body,label});
    for(const side of [-1,1]) {
      lbox(s+side*1.263,t,0.026,11.65,tour?0.72:0.96,tour?0.7:0.4,premium?0xaaa69b:stripe,{solid:false});
      lsign(tour?'은하수고속관광':op.n,s+side*1.29,t,0.69,4.3,0.26,side<0?'N':'S',
        {bg:null,fg:premium?'#efeee8':'#373d3e',pxPerM:70});
    }
    lbox(s,t,2.46,11.7,3.16,0.25,body,{solid:false});
  };
  const PITCH = 3.6;
  const bays = BOARDING_DOORS;
  const TICKET = {s0:89,s1:99};
  const HALL_CROWN = 8.5;
  // Round-section steel tubes merged into the kit, with no runtime allocations.
  const hallTube=(a,b,d=0.2,mat=0xeef0ec)=>{
    const pa=P(a[0],a[1]),pb=P(b[0],b[1]);
    const A=new K.THREE.Vector3(pa[0],a[2],pa[1]),B=new K.THREE.Vector3(pb[0],b[2],pb[1]);
    const D=B.clone().sub(A).normalize(),U=new K.THREE.Vector3(0,1,0).cross(D);
    if(U.lengthSq()<0.01)U.set(1,0,0);else U.normalize();
    const V=D.clone().cross(U).normalize();
    for(let i=0;i<8;i++){
      const a0=i*PI/4,a1=(i+1)*PI/4,n=U.clone().multiplyScalar(Math.cos((a0+a1)/2)).addScaledVector(V,Math.sin((a0+a1)/2));
      const at=(C,q)=>C.clone().addScaledVector(U,Math.cos(q)*d/2).addScaledVector(V,Math.sin(q)*d/2).toArray();
      K.quad(mat,[at(A,a0),at(A,a1),at(B,a1),at(B,a0)],n.toArray());
    }
  };
  const hallCurve=(fn,n=10,d=0.2,mat=0xeef0ec)=>{for(let k=0;k<n;k++)hallTube(fn(k/n),fn((k+1)/n),d,mat);};
  const twinArch=(a,b,base,radius=9)=>{
    const L=Math.hypot(b[0]-a[0],b[1]-a[1]),n=Math.ceil(L),root=Math.sqrt(radius*radius-L*L/4);
    const pt=(u,upper=0)=>[a[0]+(b[0]-a[0])*u,a[1]+(b[1]-a[1])*u,base+Math.sqrt(radius*radius-Math.pow((u-.5)*L,2))-root+upper];
    for(const upper of [0,1])hallCurve(u=>pt(u,upper),n,0.2);
    for(let i=0;i<n;i++){hallTube(pt(i/n,i%2),pt((i+1)/n,1-i%2),0.11);hallTube(pt(i/n),pt(i/n,1),0.09);}
  };

  // ---- vertical circulation (strip)
  escPair(-15, -4.5, 17.4, YB1, Y1, 'f1', true);          // E1 north: B1 ↔ 1F (신반포로 입구 홀)
  escPair(85, 95.5, 17.4, YB1, Y1, 'f1', true);           // E2 매표소 맞은편: B1(지하철·파미에스테이션) ↔ 1F
  // E3 sits in the retained east mezzanine. Thin steel treads avoid the kit's full-height stair skirt.
  for(const [t,move] of [[24,0.6],[25.5,-0.6]]){
    const a=P(40,t),b=P(48.8,t);
    K.ramp(...a,...b,{w:1.1,ya:Y1,yb:Y2,mat:0xa5aaad,under:0xc9ccce,rails:false,move});
    for(let i=0;i<30;i++)lbox(40+(i+.5)*8.8/30,t,8.8/30,1.08,(i+.5)*5/30,0.035,0x9ba1a5,{solid:false});
    for(const edge of [-.63,.63]){
      const pa=P(40,t+edge),pb=P(48.8,t+edge);
      K.quad('glass',[[pa[0],0.05,pa[1]],[pb[0],5.05,pb[1]],[pb[0],5.95,pb[1]],[pa[0],.95,pa[1]]],[EX,0,EZ]);
      hallTube([40,t+edge,.98],[48.8,t+edge,5.98],.07,{tex:'metal',color:0xc9ccce});
    }
  }
  hole(['f2'],RECT(39.4,23.25,48.8,26.25));
  rail(39.4,23.25,48.8,23.25,Y2);rail(39.4,26.25,48.8,26.25,Y2);rail(39.4,23.25,39.4,26.25,Y2);
  lbox(48.4,24.75,.6,3.0,0,.55,{tex:'marble',color:0xe9ebe6});
  flight(141, 151, 32.5, YB1, Y1, 'f1', true);            // stair core (east, south end)
  flight(150.2, 141.8, 35.6, Y1, Y2, 'f2');
  flight(142.2, 148.9, 32.5, Y2, YR, 'rf');
  rail(141, 31.3, 151, 31.3, Y1); rail(141, 31.3, 141, 33.7, Y1); rail(141, 33.7, 151, 33.7, Y1);
  rail(141.6, 34.4, 150.2, 34.4, Y2); rail(150.2, 34.4, 150.2, 36.8, Y2);
  rail(142, 31.3, 148.9, 31.3, YR); rail(142, 33.7, 148.9, 33.7, YR); rail(142, 31.3, 142, 33.7, YR);
  const ELEV_FLOORS = [{ label: 'B1', y: YB1, name: '파미에스테이션 · 지하철 연결' }, { label: '1F', y: Y1, name: '호남선 터미널 · 매표소' }, { label: '2F', y: Y2, name: '센트럴시티 식당가' }, { label: 'R', y: YR, name: '옥상 주차장' }];
  elev('센트럴시티 터미널 엘리베이터', 62, 24.7, 'N', ELEV_FLOORS, ['b1', 'f1', 'f2', 'rf']);
  // stair house + elevator penthouse on the roof
  lwall(140.6, 30.8, 151.4, 30.8, YR, YR + 3, { mat: 0xd0ccc4 }); lwall(140.6, 37.4, 151.4, 37.4, YR, YR + 3, { mat: 0xd0ccc4 });
  lwall(140.6, 30.8, 140.6, 37.4, YR, YR + 3, { mat: 0xd0ccc4 }); lwall(151.4, 30.8, 151.4, 37.4, YR, YR + 3, { mat: 0xd0ccc4, openings: [{ at: 1.9, w: 2.4, y0: YR, y1: YR + 2.4 }] });
  lbox(146, 34.1, 11, 6.8, YR + 3, 0.25, 0xbab6ae, { solid: false });
  lsign('계단 · 1F 터미널 · B1', 151.5, 34.1, YR + 2.65, 3.6, 0.45, 'S', { bg: '#1d3557', fg: '#fff' });

  // ---- Recessed red boarding doorways: one platform number, repeated only on its own bay.
  {
    const glassOps=bays.map(bb=>({at:bb.s+10,w:3.2,y0:0,y1:2.8}));
    lwall(-10,6,149,6,0,HALL_CROWN,{mat:'glass',thick:.04,openings:glassOps});
    lwall(-10,.3,-10,6,0,HALL_CROWN,{mat:'ccBand',thick:.3});
    lwall(149,6,149.6,.6,0,HALL_CROWN,{mat:0xd7d2c8,thick:.3});
    for(const bb of bays){
      const sc=bb.s,width=6.6;
      lwall(sc-width/2,6,sc+width/2,6,0,4.5,{mat:'ccRed',thick:.16,openings:[{at:width/2,w:3.2,y0:0,y1:2.8}]});
      // Open glass leaves allow the player through the real doorway.
      for(const ds of [-1.65,1.65]){
        lbox(sc+ds,6.12,.1,.12,0,2.9,0xc9ccce,{solid:false});
        lwall(sc+ds,6.18,sc+ds,7.15,0,2.7,{mat:'glass',thick:.035,solid:false});
      }
      lbox(sc,6.13,3.4,.14,2.8,.12,0xc9ccce,{solid:false});
      lsign(String(bb.p),sc+2.4,6.2,3.65,1.15,1.4,'E',{bg:null,fg:'#ffffff'});
      lbox(sc-.5,6.14,2.65,.12,2.95,1.55,0x202828,{solid:false});
      lsign(['센트럴시티','CENTRAL CITY'],sc-.5,6.23,3.73,2.5,1.45,'E',{bg:'#287c86',fg:'#ffffff'});
      lsign('비상구',sc,6.22,2.58,.7,.2,'E',{bg:'#20743c',fg:'#ffffff'});
      // A small soffit-edge numeral is sufficient on the yard side.
      lsign(String(bb.p),sc,5.86,3.7,1.1,1.4,'W',{bg:null,fg:'#ffffff'});
    }
    // Low curb and short individual boarding aprons; no continuous rail-style platform edge.
    for(const bb of bays){
      lbox(bb.s,4.5,4.0,3,0,.12,M.platform);
      for(const ds of [-2,2])lcyl(bb.s+ds,.55,0,.16,4.5,0xe9ebe6);
    }
    K.hpoly(M.asphalt,RECT(-10,0,149,3),.013,true);
  }
  {
    for(const [i,bb] of bays.entries()){
      const dest=DESTINATIONS[i%DESTINATIONS.length];
      lfloorText(String(bb.p),bb.s,-4.5,.03,2,1.6,'W',{fg:'#ffffff',bold:true});
      lfloorText(String(bb.p),bb.s,4.6,.13,.9,.7,'W',{fg:'#4a4d4f'});
      for(const ds of [-PITCH/2,PITCH/2])lbox(bb.s+ds,-6,.1,12,.025,.006,0xf2e7b1,{solid:false});
      if(i%5===2)continue;
      coach(bb.s,-3.6,F.E,i,dest);
    }
    K.hpoly(M.asphalt,RECT(-12,-18.3,151,0),.012,true);
  }
  for (const s of [12,50,128]) {
    lsign('← 매표소 · 승차홈    지하철 · 파미에스테이션 →',s,23.5,C1-0.5,6.6,0.45,'S',{bg:'#24473f',fg:'#ffffff',twoSided:true});
  }
  // ---- 매표소 (boarding doorway 9 converted, 2021) + 무인발권기
  {
    const s0 = TICKET.s0, s1 = TICKET.s1, sc = (s0 + s1) / 2;
    lwall(s0, 6, s0, 12.6, Y1, C1, { mat: M.wallIn }); lwall(s1, 6, s1, 12.6, Y1, C1, { mat: M.wallIn });
    lbox(sc, 12.3, s1 - s0, 0.6, Y1, 1.1, 0xe8e1d4, { top: 0x6b5a48 });
    lwall(s0, 12.6, s1, 12.6, Y1 + 1.1, Y1 + 2.5, { mat: 'glass', thick: 0.04 });
    lwall(s0, 12.6, s1, 12.6, Y1 + 2.5, C1, { mat: 0x344b44 });
    for (let k = 0; k < 6; k++) { const s = s0 + 0.9 + k * (s1 - s0 - 1.8) / 5; lsign(`${k + 1}`, s, 12.7, Y1 + 2.25, 0.4, 0.4, 'E', { bg: '#ffd84a', fg: '#1d3557' }); lperson(s, 11.2, Y1, { rotY: F.E, shirt: 0x1d3557 }); lbox(s, 11.7, 0.5, 0.4, Y1 + 1.1, 0.35, 0x222222, { solid: false }); }
    lsign(['매표소', '현장발권 · 예매확인 · 환불'], sc, 12.75, Y1 + 3.35, 6.5, 1.1, 'E', { bg: '#344b44', fg: '#ffffff' });
    lsign('매표소', sc, 5.9, 3.45, 3.6, 0.5, 'W', { bg: '#555b62', fg: '#ffffff', pxPerM: 60 });
    // kiosks
    for (let k = 0; k < 8; k++) {
      const s = s1 + 2 + k * 1.3;
      lbox(s, 14.6, 0.9, 0.6, Y1, 1.6, 0xf2f2f2, { top: 0xd0d0d0 });
      lbox(s, 14.92, 0.6, 0.03, Y1 + 0.95, 0.5, 'emit', { color: 0x6fb6ff, solid: false });
      lsign('무인발권기', s, 14.94, Y1 + 1.75, 0.85, 0.22, 'E', { bg: '#00a0e9', fg: '#fff', pxPerM: 60 });
    }
    lsign(['고속버스 무인발권기', '고속버스티머니 · 카드결제'], s1 + 6.5, 14.6, Y1 + 2.9, 5.5, 0.8, 'E', { bg: '#0b4f8a', fg: '#fff' });
  }
  // ---- 대합실: seating, departure boards, info desk, columns
  {
    for (let s = 2; s < 140; s += 14) {
      if (Math.abs(s - 62) < 6 || (s > 82 && s < 100) || (s > 36 && s < 52)) continue;
      for (let r = 0; r < 3; r++) {
        lbox(s + 4,14.6+r*2.2,7.6,.62,.38,.12,0x3b3f42);
        lbox(s + 4,14.95+r*2.2,7.6,.09,.5,.35,0x3b3f42,{solid:false});
        for(const ds of [1,4,7])lbox(s+ds,14.6+r*2.2,.12,.5,0,.4,{tex:'metal',color:0xc9ccce});
        for (let k = 0; k < 6; k++) if (rnd() < 0.4) lperson(s + 0.8 + k * 1.3, 14.5 + r * 2.2, Y1, { sit: true, rotY: F.N + PI });
      }
    }
    for (let s = -6; s < 142; s += 26) for (const t of [3.6]) {
      if (s < -2) continue;
      for (let k = 0; k < 2; k++) lbox(s + 6 + k * 10, t + 3.6, 7, 0.5, Y1, 0.45, 0x5d6d7e, { top: 0x46535f });
    }
    // No fabricated timetable: a modest Korean information panel beside the ticket counter.
    lsign(['고속버스 운행 안내','광주 · 전주 · 목포 · 여수 · 순천'],101,25.5,3.1,5.2,0.85,'W',{bg:'#172c2b',fg:'#f1ecd2'});
    // information desk
    lbox(4, 21, 2.4, 5, Y1, 1.05, 0xf4f1ea, { top: 0x2b2d30 });
    lsign(['종합안내', '센트럴시티터미널'], 4, 21, 3.6, 4.6, 0.9, 'N', { bg: '#344b44', fg: '#fff', twoSided: true });
    lperson(5.6, 20.2, Y1, { rotY: F.S, shirt: 0x1d3557 }); lperson(5.6, 22, Y1, { rotY: F.S, shirt: 0x1d3557 });
    // floor directory boards at the escalators
    const DIR = ['층별 안내', 'R   옥상 주차장', '2F  센트럴시티 식당가', '1F  호남선 터미널 · 매표소 · 승차홈', 'B1  파미에스테이션 · 메가박스 · 지하철 3·7·9호선'];
    for (const s of [-16.5, 38.5, 83.5]) lsign(DIR, s, 23.5, 1.6, 3.4, 2.1, 'N', { bg: '#f4f1ea', fg: '#1d3557', box: 0.12, boxMat: 0xbab4a8, align: 'left', bold: false, pxPerM: 90 });
    lsign(['지하철 3·7·9호선 · 파미에스테이션', '↓ B1  고투몰 · 신세계 식품관'], 95.8, 18.15, 3.3, 4.4, 0.75, 'S', { bg: '#202a36', fg: '#ffffff' });
    lsign(['지하철 · 파미에스테이션 ↓', 'B1  GOTO MALL'], -4.2, 18.15, 3.3, 4.2, 0.75, 'S', { bg: '#202a36', fg: '#ffffff' });
    lsign(['2F 센트럴시티 식당가 ↑', '명동교자 · 순대실록 · 르사이공'], 49.0, 24.75, 3.3, 4.4, 0.75, 'S', { bg: '#202a36', fg: '#ffffff' });
  }
  // ---- 1F east band shops (front t=28 → facing west)
  const EAST1 = [
    [-20, -11, '앤드테일 커피바', 'cafe'], [-11, -2, '신한은행', 'bank'], [-2, 7, 'ATM 코너', 'bank', 'KB국민 · 신한 · 우리 · 하나'], [7, 16, '편의점', 'store', '24시 · 음료 · 도시락'],
    [26, 36, '스노우폭스', 'flower', 'SNOWFOX FLOWERS'], [36, 46, '약국', 'store'], [46, 56, '파리바게뜨', 'cafe'], [56, 66, '리김밥', 'food', '김밥 · 떡볶이 · 어묵'],
    [66, 76, '여행용품', 'store', '캐리어 · 충전기 · 우산'], [76, 86, '도서 · 잡지', 'store'], [86, 98, '쉐이크쉑', 'food', 'SHAKE SHACK'], [98, 108, '화장실', 'toilet', '남 · 여 · 장애인'],
    [108, 119, '수유실 · 물품보관함', 'office'], [129, 140, '고객센터 · 유실물', 'office'],
  ];
  for (const [u0, u1, name, kind, sub] of EAST1) shop({ axis: 's', u0, u1, f: 28, b: 38.2, y: Y1, h: 4.1, name, kind, sub, seed: u0, noBack: true });
  // J4 / J6 passages through the east band (openings in the shared wall)
  lsign(['신세계백화점 강남점  →', 'SHINSEGAE · 신세계면세점'], 21, 27.8, 3.55, 5.6, 0.8, 'W', { bg: '#2b2b2b', fg: '#ffffff' });
  lsign(['JW 메리어트 호텔 서울  →', 'JW MARRIOTT SEOUL'], 124, 27.8, 3.55, 5.6, 0.8, 'W', { bg: '#4b3a2a', fg: '#f3e3c3' });
  for (const s of [16, 26, 119, 129]) lwall(s, 28, s, 38.2, Y1, 4.1, { mat: M.part, thick: 0.15 });
  // Photo 07: white marble piers, flared capitals, curved four-arm supports and twin-chord trusses.
  const colS=[];
  for(let s=-7;s<=145;s+=9.5){
    colS.push(s);
    for(const t of [9,20.5]){
      if(s>87&&s<101&&t===9)continue;
      lbox(s,t,1.1,1.1,0,3.65,{tex:'marble',color:0xe9ebe6});
      lbox(s,t,1.14,1.14,0,.15,0x202725,{solid:false});
      const low=RECT(s-.55,t-.55,s+.55,t+.55),high=RECT(s-1.2,t-1.2,s+1.2,t+1.2);
      for(let k=0;k<4;k++){const n=(k+1)%4;K.quad(0xeef0ec,[[low[k][0],3.65,low[k][1]],[low[n][0],3.65,low[n][1]],[high[n][0],4.15,high[n][1]],[high[k][0],4.15,high[k][1]]],[0,-1,0]);}
      K.hpoly(0xeef0ec,high,4.15,true);
      for(const [ds,dt] of [[.75,.75],[.75,-.75],[-.75,.75],[-.75,-.75]])lcyl(s+ds,t+dt,4.17,.16,.06,{tex:'emit',color:0xf4ffef},{solid:false});
      for(const [ds,dt] of [[-4.75,0],[4.75,0],[0,-3],[0,3]])hallCurve(u=>[s+ds*u,t+dt*u,4.2+2.5*Math.sin(u*PI/2)],10,.2);
    }
    // Cross-hall curved truss. 9 m chord radius; vertical twin tubes one metre apart.
    twinArch([s,9],[s,20.5],5.2,9);
    for(const t of [27.2]){lbox(s,t,.75,.75,Y2,C2-Y2,{tex:'marble',color:0xe9ebe6});}
  }
  for(let i=0;i<colS.length-1;i++)for(const t of [9,20.5])twinArch([colS[i],t],[colS[i+1],t],5.65,9);
  // Pale grey-blue linear metal panels, arching up to 8.5 m above the open hall.
  const vaultY=t=>8.5-.85*Math.pow((t-14.5)/8.5,2);
  for(let t=6;t<23;t+=.5){
    const a=P(-10,t),b=P(149,t),c=P(149,t+.5),d=P(-10,t+.5);
    K.quad(0xbfcdd0,[[a[0],vaultY(t),a[1]],[b[0],vaultY(t),b[1]],[c[0],vaultY(t+.5),c[1]],[d[0],vaultY(t+.5),d[1]]],[0,-1,0]);
    hallTube([-10,t,vaultY(t)-.025],[149,t,vaultY(t)-.025],.025,0x96a9ad);
  }
  // Photo 07 polished marble grid, 6 m pitch. Do not paint across the open B1 escalator wells.
  for(let t=6;t<=30;t+=6)for(let s=-10;s<149;s+=1){
    const q=P(s+.5,t);if(!H.f1.some(h=>K.pointInPoly(...q,h)))lbox(s+.5,t,1,.2,.008,.006,0x4a4d4f,{solid:false});
  }
  for(let s=-6;s<149;s+=6)for(let t=6;t<28;t+=1){
    const q=P(s,t+.5);if(!H.f1.some(h=>K.pointInPoly(...q,h)))lbox(s,t+.5,.2,1,.008,.006,0x4a4d4f,{solid:false});
  }
  for(let s=-6;s<149;s+=9.5)for(const t of [7,22])lcyl(s,t,vaultY(t)-.12,.17,.035,{tex:'emit',color:0xf4f8f5},{solid:false});
  lcrowd(0,14,140,22,Y1,55,11);lcrowd(-8,6.5,146,12.5,Y1,34,12);lcrowd(-20,8,-11,26,Y1,10,13);

  // ================================================================= B1 — 파미에스테이션 (strip) · 메가박스 센트럴 (south)
  {
    // Photo 05: 9 m retail arcade, marble pilasters and glazed shops behind both sides.
    // Unknown shop names stay blank; the previously researched Starbucks is retained.
    const crossPassage=(a,b,east)=>east&&((a<26&&b>16)||(a<66&&b>58));
    for(const t of [13,22])for(let a=-12;a<149;a+=6){
      const b=Math.min(a+6,149),east=t===22;
      if((!east&&a===-12)||crossPassage(a,b,east))continue; // pavilion B1 landing / cross aisle
      const depth=east?38:0.4,front=t,face=east?'W':'E';
      lwall(a,depth,a,front,YB1,YB1+3.4,{mat:0xe6e2da,thick:.15});
      lwall(a,front,b,front,YB1,YB1+3.0,{mat:'glass',thick:.035,openings:[{at:(b-a)/2,w:2.2,y0:YB1,y1:YB1+2.6}]});
      lbox(a,front,.52,.65,YB1,3.4,{tex:'marble',color:0xe6e2da});
      lbox((a+b)/2,front,b-a,.35,YB1+2.95,.5,0xd9d7d0,{solid:false});
      if(east&&a>=-6&&a<6)lsign('스타벅스',(a+b)/2,front-.21,YB1+3.2,4.8,.42,face,{bg:'#00704a',fg:'#ffffff'});
      // Neutral counters establish retail depth without fabricating tenants or menus.
      lbox((a+b)/2,front+(east?3.6:-3.6),3.4,.7,YB1,.95,0xd7d1c6,{top:0x7b7b75});
    }
    lsign(['신세계백화점 식품관 · 신세계면세점  →','신세계백화점 연결'],21,27.8,YB1+3.4,6,.8,'W',{bg:'#2b2b2b',fg:'#fff'});
    K.hpoly('ccCheck',RECT(-20,13,149,22),YB1+.008,true);
    const archHeight=t=>YB1+3.4+2.2*(1-Math.pow(Math.abs((t-17.5)/4.5),1.3));
    // Trim the vault around E1/E2 floor openings so the escalators emerge into the 1F hall.
    const vaultWells=H.f1.map(poly=>{
      const st=poly.map(q=>[(q[0]-OX)*AX+(q[1]-OZ)*AZ,(q[0]-OX)*EX+(q[1]-OZ)*EZ]);
      return [Math.min(...st.map(q=>q[0]))-.2,Math.min(...st.map(q=>q[1]))-.2,Math.max(...st.map(q=>q[0]))+.2,Math.max(...st.map(q=>q[1]))+.2];
    }).filter(q=>q[0]<149&&q[2]>-20&&q[1]<22&&q[3]>13);
    const inWell=(ss,t)=>vaultWells.some(q=>ss>q[0]&&ss<q[2]&&t>q[1]&&t<q[3]);
    const sCuts=[...new Set([-20,149,...vaultWells.flatMap(q=>[Math.max(-20,q[0]),Math.min(149,q[2])])])].sort((a,b)=>a-b);
    const tCuts=[...new Set([...Array.from({length:19},(_,i)=>13+i*.5),...vaultWells.flatMap(q=>[Math.max(13,q[1]),Math.min(22,q[3])])])].sort((a,b)=>a-b);
    // Pale curved panels replace the flat acoustic ceiling, with real gaps at the wells.
    for(let i=0;i<sCuts.length-1;i++)for(let j=0;j<tCuts.length-1;j++){
      const sa=sCuts[i],sb=sCuts[i+1],ta=tCuts[j],tb=tCuts[j+1];
      if(inWell((sa+sb)/2,(ta+tb)/2))continue;
      const a=P(sa,ta),b=P(sb,ta),c=P(sb,tb),d=P(sa,tb);
      K.quad(0xebece8,[[a[0],archHeight(ta)+.14,a[1]],[b[0],archHeight(ta)+.14,b[1]],[c[0],archHeight(tb)+.14,c[1]],[d[0],archHeight(tb)+.14,d[1]]],[0,-1,0]);
    }
    const arcadeRib=(fn,n,d)=>{
      for(let k=0;k<n;k++){
        const a=fn(k/n),b=fn((k+1)/n);
        // Conservative segment clipping also keeps diagonal cross ribs away from the void edges.
        if(vaultWells.some(q=>Math.max(a[0],b[0])+d/2>q[0]&&Math.min(a[0],b[0])-d/2<q[2]&&Math.max(a[1],b[1])+d/2>q[1]&&Math.min(a[1],b[1])-d/2<q[3]))continue;
        hallTube(a,b,d,0xf2f2ee);
      }
    };
    for(let ss=-18;ss<148;ss+=3){
      // The two curved halves meet in a pointed crown at B1+5.6.
      for(const side of [-1,1])arcadeRib(u=>[ss,17.5+side*4.5*(1-u),archHeight(17.5+side*4.5*(1-u))],9,.25);
      if(ss+3<149)for(const side of [-1,1])arcadeRib(u=>[ss+3*u,17.5+side*4.5*Math.cos(PI*u),archHeight(17.5+side*4.5*Math.cos(PI*u))-.06],16,.16);
    }
    // Simple white perimeter edging finishes each interruption in the vaulted retail ceiling.
    for(const [sa,ta,sb,tb] of vaultWells){
      for(const t of [ta,tb])hallTube([sa,t,archHeight(t)],[sb,t,archHeight(t)],.14,0xf2f2ee);
      for(const ss of [sa,sb])hallCurve(u=>[ss,ta+(tb-ta)*u,archHeight(ta+(tb-ta)*u)],8,.14,0xf2f2ee);
    }
    for(let i=0;i<sCuts.length-1;i++){
      const a=sCuts[i],b=sCuts[i+1];
      if(!inWell((a+b)/2,17.5))lbox((a+b)/2,17.5,b-a,.5,YB1+5.45,.08,{tex:'emit',color:0xf7f8f1},{solid:false});
    }
    for(const ss of [0,72,132])lsign(['파미에스테이션','지하철 · 신세계백화점 · 메가박스'],ss,17.5,YB1+3.05,5.5,.65,'S',{bg:'#243b37',fg:'#ffffff',twoSided:true});
    for(let ss=-18;ss<150;ss+=8)for(const t of [4.5,33])lbox(ss,t,1.2,1.2,CB-.07,.05,{tex:'emit',color:0xfff4dc},{solid:false});
    lcrowd(-18,14,148,21,YB1,65,21);
    // North junction and east cross aisles remain clear of the shopfront rhythm.
    lsign(['고투몰 · 지하철 3·7·9호선 ↑','고속터미널역 · 경부선 터미널'],-19.5,12.6,YB1+3.5,6.5,.9,'S',{bg:'#202a36',fg:'#fff'});
    lsign(['호남선 터미널 1F ↑','센트럴시티 · 매표소'],-15.5,15.2,YB1+3.2,3.6,.7,'N',{bg:'#344b44',fg:'#fff'});
    lsign(['지하철 3·7·9호선 →','고투몰 · 경부선 방면'],86.5,21,YB1+3.4,4.6,.75,'N',{bg:'#202a36',fg:'#fff'});
  }
  // ---- J3 corridor (owner): GOTO south wall (-150,-54.8) → north tip of the B1 (-128,-5)
  {
    const ax = -150, az = -54.9, bx = -131.8, bz = -14.4;
    const L = Math.hypot(bx - ax, bz - az), ux = (bx - ax) / L, uz = (bz - az) / L, nx = -uz, nz = ux, hw = 5;
    const poly = [[ax + nx * hw, az + nz * hw], [bx + nx * hw, bz + nz * hw], [bx - nx * hw, bz - nz * hw], [ax - nx * hw, az - nz * hw]];
    K.slab(poly, YB1, { mat: { tex: 'tile', color: 0xd7d0c4 }, under: false, ceil: false, edge: false });
    K.hpoly(M.ceil, poly, YB1 + 3.4, false);
    K.phys.addCeiling(poly, YB1 + 3.4, {});
    for (const sg of [1, -1]) K.wall(ax + nx * hw * sg, az + nz * hw * sg, bx + nx * hw * sg, bz + nz * hw * sg, YB1, YB1 + 3.4, { mat: 0xe6e0d4, thick: 0.25 });
    for (let k = 3; k < L - 2; k += 4) { K.box({ x: ax + ux * k, z: az + uz * k, y: YB1 + 3.32, w: 3.2, d: 0.4, h: 0.05, rotY: Math.atan2(ux, uz), mat: 'emit', solid: false }); }
    for (let k = 8; k < L - 6; k += 12) for (const sg of [1, -1]) {
      K.box({ x: ax + ux * k + nx * (hw - 0.6) * sg, z: az + uz * k + nz * (hw - 0.6) * sg, y: YB1, w: 1.0, d: 3.2, h: 2.2, rotY: Math.atan2(ux, uz), mat: 0x2f3338 });
      sign(['센트럴시티', 'CENTRAL CITY'], { x: ax + ux * k + nx * (hw - 1.12) * sg, z: az + uz * k + nz * (hw - 1.12) * sg, y: YB1 + 1.3, w: 2.8, h: 1.6, rotY: Math.atan2(-nx * sg, -nz * sg), bg: '#f2ede2', fg: '#1d3557' });
    }
    const m = 0.5; sign(['센트럴시티 · 호남선 터미널 ↓', '파미에스테이션 · 신세계백화점'], { x: ax + ux * 3, z: az + uz * 3, y: YB1 + 2.9, w: 6, h: 0.75, rotY: Math.atan2(-ux, -uz), bg: '#1d3557', fg: '#fff', twoSided: true });
    sign(['GOTO MALL 고투몰 ↑', '고속터미널역 3·7·9호선'], { x: ax + ux * (L - 3), z: az + uz * (L - 3), y: YB1 + 2.9, w: 6, h: 0.75, rotY: Math.atan2(ux, uz), bg: '#202a36', fg: '#fff', twoSided: true });
    K.crowd(poly, YB1, 10, { seed: 31 }); void m;
    K.zone({ name: '센트럴시티 ↔ 고투몰 연결통로', floor: 'B1', sub: '지하 연결통로 · 고속터미널역 · 경부선 방면', poly, y0: YB1 - 0.5, y1: YB1 + 3.4, priority: 2 });
  }

  // ================================================================= south block — 파미에스테이션 1F/2F, 하차장, 메가박스 B1
  escPair(183, 172.5, 20.4, YB1, Y1, 'f1', true);         // E4 메가박스 B1 ↔ 1F
  escPair(172, 180.8, 25.4, Y1, Y2, 'f2', false);         // E5 1F ↔ 2F
  flight(171.5, 181, -94.6, YB1, Y1, 'f1', true);          // west stair core
  flight(181, 172.7, -91.6, Y1, Y2, 'f2');
  flight(173, 179.7, -94.6, Y2, YR, 'rf');
  rail(171.5, -95.8, 181, -95.8, Y1); rail(171.5, -93.4, 181, -93.4, Y1); rail(171.5, -95.8, 171.5, -93.4, Y1);
  rail(172.5, -92.8, 181, -92.8, Y2); rail(172.5, -90.4, 181, -90.4, Y2); rail(181, -92.8, 181, -90.4, Y2);
  rail(173, -95.8, 179.7, -95.8, YR); rail(173, -93.4, 179.7, -93.4, YR); rail(173, -95.8, 173, -93.4, YR);
  lwall(170.8, -97.4, 182.2, -97.4, YR, YR + 3, { mat: 0xd0ccc4 }); lwall(170.8, -89.4, 182.2, -89.4, YR, YR + 3, { mat: 0xd0ccc4 });
  lwall(170.8, -97.4, 170.8, -89.4, YR, YR + 3, { mat: 0xd0ccc4 }); lwall(182.2, -97.4, 182.2, -89.4, YR, YR + 3, { mat: 0xd0ccc4, openings: [{ at: 4, w: 2.4, y0: YR, y1: YR + 2.4 }] });
  lbox(176.5, -93.4, 11.4, 8, YR + 3, 0.25, 0xbab6ae, { solid: false });
  const SOUTH_FLOORS = [{ label: 'B1', y: YB1, name: '메가박스 센트럴' }, { label: '1F', y: Y1, name: '파미에스테이션 · 하차장' }, { label: '2F', y: Y2, name: '파미에스테이션 2층 식당가' }, { label: 'R', y: YR, name: '옥상 주차장' }];
  elev('파미에스테이션 엘리베이터', 160, -6, 'S', SOUTH_FLOORS, ['b1', 'f1', 'f2', 'rf']);
  {
    // ---- B1 메가박스 센트럴 (전관 부띠끄 M, 8개관). Screens on the corridor (north) wall, door beside the screen,
    // stadium risers climbing south toward the projection wall. 1관 is nearest the lobby.
    const yb = YB1;
    const HALL_IN = 0x4b3a58, HALL_OUT = 0x3a2f45, LEATHER = 0x6a2a2a, LEATHER_D = 0x45191b;
    for (let k = 0; k < 8; k++) {
      const t0 = k < 6 ? -86 + k * 9.5 : (k === 6 ? -29 : -19.5), t1 = t0 + 9.5, tc = (t0 + t1) / 2;
      const se = k < 6 ? 199.2 : 189.8; // halls 1–2 are shallower (station concourse beyond)
      const no = 8 - k;
      // walls: side wall at t0 (shared), last hall also closes t1; back wall; front (corridor) wall with the door beside the screen
      lwall(171.5, t0, k === 6 ? 199.2 : se, t0, yb, CB, { mat: HALL_IN, mat2: HALL_IN, thick: 0.25 });
      if (k === 7) lwall(171.5, t1, se, t1, yb, CB, { mat: HALL_IN, mat2: HALL_IN, thick: 0.25 });
      lwall(se, t0, se, t1, yb, CB, { mat: HALL_IN, mat2: HALL_IN, thick: 0.25 });
      lwall(171.5, t0, 171.5, t1, yb, CB, { mat: HALL_OUT, mat2: HALL_IN, thick: 0.25, openings: [{ at: 1.0, w: 1.5, y0: yb, y1: yb + 2.5 }] });
      // corridor side: hall number over the door + name plate
      lsign(`${no}관`, 171.3, t0 + 1.0, yb + 2.85, 1.2, 0.5, 'N', { bg: '#503396', fg: '#ffffff' });
      lsign([`${no}관`, '부띠끄 M'], 171.3, tc + 1.6, yb + 2.6, 3.4, 0.9, 'N', { bg: '#1b1530', fg: '#e6dcff', box: 0.08, boxMat: 0x503396 });
      // dark ceiling + carpeted pit
      K.hpoly(0x221c28, RECT(171.6, t0 + 0.1, se - 0.1, t1 - 0.1), CB - 0.05, false);
      K.hpoly({ tex: 'carpet', color: 0x4a2a3a }, RECT(171.65, t0 + 0.15, 176.5, t1 - 0.15), yb + 0.01, true);
      // screen: black masking frame + emissive picture made of flat colour layers
      const SW = 5.8, SH = 3.2, sy0 = yb + 1.4, stc = tc + 0.25;
      lbox(171.72, stc, 0.06, SW + 0.5, sy0 - 0.25, SH + 0.5, 0x060608, { solid: false });
      lbox(171.79, stc, 0.02, SW, sy0, SH, 0x999b9b, { solid: false });
      // speakers either side of the screen
      lbox(171.95, stc + SW / 2 + 0.55, 0.4, 0.5, yb + 2.4, 1.2, 0x15151a, { solid: false });
      // stadium risers + recliners (부띠끄 리클라이너)
      const nR = Math.floor((se - 176.5) / 1.9);
      const nS = Math.floor((t1 - 0.6 - (t0 + 2.3)) / 0.95) + 1;
      for (let r = 0; r < nR; r++) {
        const s0 = 176.5 + r * 1.9, s1 = r === nR - 1 ? se - 0.12 : s0 + 1.9, hr = 0.3 * (r + 1), yr = yb + hr;
        lbox((s0 + s1) / 2, tc, s1 - s0, t1 - t0 - 0.25, yb, hr, 0x2a1f2f, { top: { tex: 'carpet', color: 0x55303f } });
        lbox(s0 + 0.03, t0 + 0.9, 0.05, 1.1, yr - 0.1, 0.05, 'emit', { color: 0xffb060, solid: false }); // aisle step light
        for (let c = 0; c < nS; c++) {
          const t = t0 + 2.3 + c * 0.95;
          lbox(s0 + 0.75, t, 0.95, 0.8, yr, 0.42, LEATHER, { top: 0x7a3434, solid: false });
          lbox(s0 + 1.33, t, 0.24, 0.8, yr + 0.42, 0.72, LEATHER_D, { solid: false });
          if (rnd() < 0.28) lperson(s0 + 0.85, t, yr, { sit: true, rotY: F.N });
        }
        for (const dt of [t0 + 1.82, t1 - 0.2]) lbox(s0 + 0.95, dt, 0.9, 0.12, yr + 0.42, 0.2, LEATHER_D, { solid: false }); // row-end armrests
      }
      // side-wall sconces, exit signs, projection window, hall number inside
      for (let s = 175; s < se - 1; s += 4.5) for (const tw of [t0 + 0.16, t1 - 0.16]) lbox(s, tw, 0.35, 0.06, yb + 4.4, 0.45, 'emit', { color: 0xffc890, solid: false });
      lsign('비상구', 171.66, t0 + 1.0, yb + 2.75, 0.9, 0.32, 'S', { bg: '#1f8a3b', fg: '#ffffff' });
      lsign(`${no}관`, 171.66, t0 + 1.0, yb + 3.25, 0.9, 0.42, 'S', { bg: '#503396', fg: '#ffffff' });
      lbox(se - 0.1, tc, 0.06, 1.4, yb + 0.3 * nR + 2.6, 0.5, 'emit', { color: 0xbfd4ff, solid: false });
      K.zone({ poly: RECT(171.5, t0, se, t1), name: `메가박스 센트럴 ${no}관`, floor: 'B1', sub: '부띠끄 M 상영관', y0: YB1 - 0.5, y1: CB, priority: 4 });
    }
    // theatre corridor (s 168..171.5): purple carpet, sconces, lit ceiling slots
    for (let t = -94; t < -10; t += 4) lbox(169.9, t, 0.4, 2.4, CB - 0.07, 0.05, 'emit', { color: 0xc8b8ff, solid: false });
    K.hpoly(0x241c2b, RECT(167.5, -98.5, 171.5, -10), CB - 0.02, false);
    K.hpoly({ tex: 'carpet', color: 0x3c2c4e }, RECT(168.3, -97.5, 171.35, -10), yb + 0.012, true);
    for (let t = -92; t < -12; t += 6) lbox(168.35, t, 0.06, 0.3, yb + 2.4, 0.5, 'emit', { color: 0xd9c8ff, solid: false });
    // ticket check (입장) at the corridor mouth
    for (const s of [168.5, 171.2]) lbox(s, -9.6, 0.35, 0.35, yb, 2.9, 0x503396);
    lbox(169.85, -9.6, 3.05, 0.35, yb + 2.9, 0.6, 0x503396, { solid: false });
    lsign(['상영관 입구', '상영관 1–8관'], 169.85, -9.4, yb + 3.2, 2.9, 0.55, 'E', { bg: '#503396', fg: '#ffffff', pxPerM: 90 });
    lbox(170.6, -8.6, 0.6, 0.5, yb, 1.05, 0x2b2b30, { top: 0x503396 });
    lperson(170.6, -7.9, yb, { rotY: F.W, shirt: 0x503396 });
    // lobby: dark stone floor + dark ceiling with purple cove light
    const LOB = [P(151.3, 0), P(168.2, -19.9), P(168.3, -10), P(189.0, -10), P(189.0, 37.6), P(151.3, 37.6)];
    const LOBH = [RECT(172.5, 19.65, 183.6, 22.65), RECT(158.8, -7.2, 161.2, -4.8)];
    K.hpoly({ tex: 'darkstone', color: 0x9a94a2 }, LOB, yb + 0.008, true, LOBH);
    for (let s = 156; s < 189; s += 4) for (const t of [-4, 2, 8, 16, 24, 30]) if (!(t === 16 && s > 171 && s < 185)) lbox(s, t, 0.9, 0.9, CB - 0.08, 0.04, 'emit', { color: 0xf2ecff, solid: false });
    for (const t of [0, 12, 30]) lbox(170, t, 34, 0.25, CB - 0.09, 0.05, 'emit', { color: 0x8a6cff, solid: false });
    // south wall feature: MEGABOX letters on a backlit purple panel facing the E4 escalator landing
    lbox(188.98, 21, 0.12, 10.5, yb + 2.0, 2.9, 0x2a1d4f, { solid: false });
    lsign(['MEGABOX', '메가박스 센트럴'], 188.88, 21, yb + 3.55, 8.6, 1.9, 'N', { bg: '#352263', fg: '#ffffff' });
    lsign('THE BOUTIQUE · 전관 부띠끄 M · 8개관', 188.88, 21, yb + 2.3, 8.0, 0.5, 'N', { bg: '#1b1530', fg: '#d9c8ff' });
    // 매점 (concession) along the south wall t -3..13: back counter with popcorn machines/drink towers, front counter, menu boards
    lbox(188.85, 5, 0.9, 16, yb, 0.95, 0x2b2b30, { top: 0x9a9ca2 });
    for (const t of [-1.2, 1.4]) { lbox(188.8, t, 0.75, 1.3, yb + 0.95, 1.05, 'glass', { solid: false }); lbox(188.8, t, 0.65, 1.2, yb + 0.97, 0.55, 'emit', { color: 0xffd860, solid: false }); lbox(188.8, t, 0.8, 1.35, yb + 2.0, 0.12, 0xb3261e, { solid: false }); }
    for (const t of [4.2, 6.0, 7.8]) { lbox(188.85, t, 0.6, 1.4, yb + 0.95, 0.85, 0x9aa0a6, { solid: false }); lbox(188.52, t, 0.03, 1.2, yb + 1.35, 0.4, 'emit', { color: [0xd8262e, 0x2a7de1, 0x3fae4a][Math.round(t) % 3], solid: false }); }
    for (const t of [10.2, 11.8]) lbox(188.85, t, 0.6, 1.4, yb + 0.95, 0.6, 0xd8d2c6, { solid: false });
    lbox(186.4, 5, 0.8, 15, yb, 1.05, 0x352263, { top: 0x1b1b1b });
    lbox(186.4, 9.5, 0.7, 2.6, yb + 1.05, 0.55, 'glass', { solid: false }); lbox(186.4, 9.5, 0.6, 2.4, yb + 1.06, 0.2, 'emit', { color: 0xffe2a8, solid: false });
    for (const t of [-1, 3, 7]) { lbox(186.5, t, 0.35, 0.4, yb + 1.05, 0.28, 0x1b1b1b, { solid: false }); lbox(186.3, t, 0.02, 0.32, yb + 1.15, 0.16, 'emit', { color: 0x7fd0ff, solid: false }); lperson(187.5, t, yb, { rotY: F.N, shirt: 0x352263 }); }
    lsign('매점',188.98,5,yb+3.1,6,0.8,'N',{bg:'#343038',fg:'#ffffff'});
    // 매표소 (staffed ticket counter) t 27..37 + queue stanchions
    lbox(187.2, 32, 0.9, 9.5, yb, 1.1, 0xf1eee8, { top: 0x352263 });
    lwall(187.7, 27.2, 187.7, 36.8, yb + 1.1, yb + 2.4, { mat: 'glass', thick: 0.04 });
    for (let k = 0; k < 3; k++) { const t = 28.8 + k * 3.2; lperson(188.3, t, yb, { rotY: F.N, shirt: 0x352263 }); lsign(`${k + 1}`, 187.68, t, yb + 2.15, 0.35, 0.35, 'N', { bg: '#ffd84a', fg: '#352263' }); lbox(187.0, t, 0.3, 0.45, yb + 1.1, 0.3, 0x1b1b1b, { solid: false }); }
    lsign(['매표소', '현장예매 · 멤버십 · 할인'], 188.98, 32, yb + 3.05, 6.5, 1.1, 'N', { bg: '#352263', fg: '#ffffff' });
    for (let k = 0; k < 5; k++) { const p = [183.6, 27.5 + k * 2.2]; lcyl(p[0], p[1], yb, 0.05, 0.95, 0xb0b4b8); lcyl(p[0] + 1.6, p[1], yb, 0.05, 0.95, 0xb0b4b8); }
    lbox(183.6, 31.9, 0.03, 8.8, yb + 0.85, 0.06, 0x503396, { solid: false }); lbox(185.2, 31.9, 0.03, 8.8, yb + 0.85, 0.06, 0x503396, { solid: false });
    for (let k = 0; k < 4; k++) lperson(184.4, 28.4 + k * 1.7, yb, { rotY: F.S });
    for (let k = 0; k < 5; k++) lperson(184.9, -1.5 + k * 2.6, yb, { rotY: F.S });
    // 무인발권기 along the east wall (facing the lobby) + poster lightboxes above
    for (let k = 0; k < 8; k++) { lbox(158 + k * 1.2, 37.0, 0.9, 0.6, yb, 1.6, 0xffffff); lbox(158 + k * 1.2, 36.68, 0.6, 0.03, yb + 0.95, 0.5, 'emit', { color: 0x9b8cff, solid: false }); }
    lsign('무인발권기', 162.2, 36.66, yb + 1.9, 5, 0.32, 'W', { bg: '#352263', fg: '#fff' });
    lsign(['메가박스 센트럴','상영관 1–8관 ←'],172,8,yb+3.9,5.6,1.0,'S',{bg:'#302b38',fg:'#ffffff',twoSided:true});
    // 부띠끄 라운지: sofas + low tables
    for (const [s, t] of [[155, 8], [155, 16], [164, 12], [164, 22], [155, 26]]) {
      lbox(s - 1.1, t, 0.8, 3.0, yb, 0.42, 0x3d2c5c, { top: 0x5a4380 }); lbox(s - 1.45, t, 0.25, 3.0, yb + 0.42, 0.5, 0x2f2248);
      lbox(s + 1.1, t, 0.8, 3.0, yb, 0.42, 0x3d2c5c, { top: 0x5a4380 }); lbox(s + 1.45, t, 0.25, 3.0, yb + 0.42, 0.5, 0x2f2248);
      lbox(s, t, 0.9, 1.6, yb, 0.38, 0x1b1b1b, { top: 0xb8a37a });
      if (rnd() < 0.7) lperson(s - 1.1, t - 0.6, yb, { sit: true, rotY: F.S }); if (rnd() < 0.5) lperson(s + 1.1, t + 0.6, yb, { sit: true, rotY: F.N });
    }
    lsign(['부띠끄 라운지', '메가박스 센트럴'], 151.6, 16, yb + 3.3, 4, 0.8, 'S', { bg: '#1b1530', fg: '#d9c8ff', twoSided: true });
    lsign(['상영관 1–8관 ←', '부띠끄 M'], 166.6, -7, yb + 3.2, 3.6, 0.8, 'S', { bg: '#352263', fg: '#fff', twoSided: true });
    lcrowd(166, -6, 182, 18, yb, 18, 41); lcrowd(167, 24, 181, 34, yb, 8, 42);
    lzone(181.5, -4, 189.4, 15, { name: '메가박스 센트럴 매점', floor: 'B1', sub: '팝콘 · 콤보 · 음료 · 스낵', y0: YB1 - 0.5, y1: CB, priority: 3 });
    lzone(181.5, 26, 189.4, 37.8, { name: '메가박스 센트럴 매표소', floor: 'B1', sub: '현장예매 · 무인발권기 · 상영시간표', y0: YB1 - 0.5, y1: CB, priority: 3 });
    lzone(167.5, -98.5, 171.5, -10, { name: '메가박스 센트럴 상영관 복도', floor: 'B1', sub: '1–8관 입장 · 부띠끄 M', y0: YB1 - 0.5, y1: CB, priority: 3 });
    // west end B1: toilets + corridor to stairs
    shop({ axis: 's', u0: 182, u1: 195, f: -89.5, b: -98, y: yb, h: 4, name: '화장실', kind: 'toilet', noBack: true });
  }
  {
    // ---- 1F south block
    const y = Y1;
    // 하차장 대합 (arrivals hall) north-west, open to the corridor; doors on the north face (e7)
    for (let t = -84; t < -30; t += 8) { lbox(176, t, 0.55, 5, y, 0.45, 0x5d6d7e, { top: 0x46535f }); }
    lsign(['하차장', '택시 승강장 · 지하철 3·7·9호선 →'], 168.9, -60, 3.6, 8, 1.2, 'S', { bg: '#1d3557', fg: '#ffffff' });
    lsign(['지하철 7호선 · 파미에스테이션 →', '신세계백화점 · JW 메리어트'], 185, -28, 3.6, 5.5, 0.8, 'E', { bg: '#202a36', fg: '#fff', twoSided: true });
    lcrowd(170, -95, 188, -25, y, 26, 51);
    // north row (east part): 장터국수 · 스타벅스 · 던킨, fronts at s=181 facing south
    shop({ axis: 't', u0: -22, u1: -12, f: 181, b: 170, y, h: 4.1, name: '장터국수', kind: 'food', seed: 71 });
    shop({ axis: 't', u0: -10, u1: 4, f: 181, b: 168.5, y, h: 4.1, name: '스타벅스', kind: 'cafe', sub: '센트럴1F점', seed: 72 });
    shop({ axis: 't', u0: 4, u1: 16, f: 181, b: 168.5, y, h: 4.1, name: '던킨', kind: 'cafe', sub: 'DUNKIN · 센트럴시티', seed: 73 });
    // south row: fronts at s=189 facing north
    const S1 = [[-98, -86, '화장실', 'toilet'], [-76, -64, 'ATM 코너', 'bank', 'KB국민 · 신한 · 우리 · 하나'], [-64, -52, '편의점', 'store'], [-52, -40, '포브 FOURB', 'cafe', '베이글 · 커피'],
      [-40, -28, '고객센터', 'office'], [-28, -16, '메가박스 센트럴 B1', 'store', '↓ 에스컬레이터'], [-4, 8, '약국', 'store'], [20, 36, '파리바게뜨', 'cafe', '센트럴시티점']];
    for (const [u0, u1, name, kind, sub] of S1) shop({ axis: 't', u0, u1, f: 189, b: 202.4, y, h: 4.1, name, kind, sub, seed: u0 + 300 });
    lsign(['파미에스테이션', 'FAMILLE STATION · 1F'], 176, 9, 3.9, 6, 1.0, 'S', { bg: '#141414', fg: '#f0e6c8', twoSided: true });
    lsign(['메가박스 센트럴 B1 ↓', 'MEGABOX'], 183.3, 21.15, 3.4, 3.4, 0.8, 'N', { bg: '#352263', fg: '#fff' });
    lsign(['2F 파미에스테이션 식당가 ↑', '아웃백 · 명동교자 · 소이연남'], 171.6, 26.15, 3.4, 4.6, 0.8, 'S', { bg: '#202a36', fg: '#fff' });
    for (let s = 152; s < 203; s += 6) for (const t of [-90, -78, -66, -54, -42, -30, -18, -6, 6, 18, 30]) {
      if (s > 168 && s < 182 && t > -90 && t < 18 && t > -24) continue;
      if (s < 168 && t < -20) continue;
      lbox(s, t, 1.4, 1.4, C1 - 0.06, 0.05, 'emit', { solid: false });
    }
    lcrowd(181.5, -90, 188.5, 36, y, 40, 52); lcrowd(152, 0, 168, 36, y, 18, 53);
    // columns south block
    for (let t = -86; t <= 34; t += 10) for (const s of [181, 189]) { if (Math.abs(t - 21) < 3 || Math.abs(t - 26) < 3) continue; lcyl(s, t, Y1, 0.42, C1 - Y1, M.col); lcyl(s, t, Y2, 0.4, C2 - Y2, M.col); }
  }
  {
    // ---- 2F south block — 파미에스테이션 2층 맛집 (2018.1, 11곳) + 센트럴시티 식당가
    const y = Y2, h = C2 - Y2;
    const N2 = [[-86, -68, '명동교자', 'food', '센트럴시티점'], [-66, -44, '아웃백 스테이크하우스', 'food', 'OUTBACK · 센트럴시티점'], [-42, -26, '채선당 샤브보트', 'food'],
      [-24, -12, '소이연남', 'food', '파미에스테이션점'], [-10, 2, '팔도국수 면주방', 'food'], [2, 14, '홍대만뽀', 'food', '일식 덮밥'], [31, 37.5, '더네일바', 'beauty']];
    for (const [u0, u1, name, kind, sub] of N2) shop({ axis: 't', u0, u1, f: 181, b: 168.5, y, h, name, kind, sub, seed: u0 + 500 });
    const S2 = [[-98, -86, '화장실', 'toilet'], [-86, -72, '쌀국수', 'food'], [-72, -58, '수제버거', 'food'], [-58, -44, '타코 · 부리또', 'food'], [-44, -30, '디저트 카페', 'cafe'],
      [-30, -16, '돈부리', 'food'], [-16, -2, '더 살롱', 'beauty', 'HAIR'], [-2, 12, '더스파', 'beauty', 'SPA'], [12, 24, '크래프트 맥주', 'food'], [24, 36, '브런치 카페', 'cafe']];
    for (const [u0, u1, name, kind, sub] of S2) shop({ axis: 't', u0, u1, f: 189, b: 202.4, y, h, name, kind, sub, seed: u0 + 600, noBack: true });
    lsign(['파미에스테이션 2F', '홍대 · 이태원 맛집 11곳'], 185, 36, y + 2.7, 6, 1.0, 'W', { bg: '#141414', fg: '#f0e6c8' });
    for (let t = -94; t < 36; t += 5) lbox(185, t, 1.2, 1.2, C2 - 0.06, 0.05, 'emit', { color: 0xfff1d8, solid: false });
    lcrowd(181.5, -95, 188.5, 36, y, 34, 61);
  }

  // ================================================================= 2F — 센트럴시티 식당가 (east mezzanine only)
  {
    const y=Y2,h=C2-Y2;
    // Retain the research-backed dining tenants on the east side, leaving the 1F vault open.
    const dining=[[12,24,'서대문 한옥집'],[24,36,'우마이도'],[36,48,'르사이공'],[48,58,'순대실록'],[66,78,'101번지 남산돈까스'],[136,150,'화장실']];
    for(const [u0,u1,name] of dining)shop({axis:'s',u0,u1,f:28,b:38.2,y,h,name,kind:name==='화장실'?'toilet':'food',seed:u0+700,noBack:true});
    // Glass mezzanine balustrade, broken at the escalator opening; stainless handrail.
    rail(-18,23,39.4,23,y);rail(48.8,23,150,23,y);rail(-18,23,-18,38.2,y);
    lsign(['센트럴시티 식당가','2층 식당가'],50,25.3,y+2.6,4.6,.9,'S',{bg:'#344b44',fg:'#fff'});
    lsign(['옥상 주차장 · 엘리베이터 / 계단','파미에스테이션 2F →'],138,25.3,y+2.7,5,.8,'N',{bg:'#344b44',fg:'#fff',twoSided:true});
    for(let ss=-18;ss<150;ss+=5)if(Math.abs(ss-62)>3&&(ss<38||ss>50))lbox(ss,25.4,1.2,1.2,C2-.06,.05,{tex:'emit',color:0xfff6e6},{solid:false});
    lcrowd(-18,23.7,150,27.4,y,32,71);
  }

  // ================================================================= envelope (walls) — terminal complex
  {
    const thick = 0.3;
    const ns = K.orient(TERM);
    const atOn = (a, b, x, z) => { const dx = b[0] - a[0], dz = b[1] - a[1]; return ((x - a[0]) * dx + (z - a[1]) * dz) / Math.hypot(dx, dz); };
    function edge(i, y0, y1, mat, inner, ops = [], extra = {}) {
      const a = TERM[i], b = TERM[(i + 1) % TERM.length];
      const L = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L;
      const ix = -ns[i][0] * thick / 2, iz = -ns[i][1] * thick / 2;
      const plus = (-uz * ns[i][0] + ux * ns[i][1]) > 0;
      const o = { thick, openings: ops.map(p => ({ at: atOn(a, b, p[0], p[1]), w: p[2], y0: p[3] ?? y0, y1: p[4] ?? y0 + 3.2 })), ...extra };
      if (plus) { o.mat = mat; o.mat2 = inner; } else { o.mat = inner; o.mat2 = mat; }
      K.wall(a[0] + ix, a[1] + iz, b[0] + ix, b[1] + iz, y0, y1, o);
    }
    const BAND = { tex: 'ccBand' };
    const P1 = (s, t) => P(s, t);
    // B1 (only where B1POLY follows the TERM edges; the clipped south side gets its own wall below)
    const J4 = [-92, 15.5];
    {
      const nsB = K.orient(B1POLY);
      const J3P = P1(-21.6, 12.6);
      for (let i = 0; i < B1POLY.length; i++) {
        const a = B1POLY[i], b = B1POLY[(i + 1) % B1POLY.length], L = Math.hypot(b[0] - a[0], b[1] - a[1]);
        if (L < 0.05) continue;
        const ops = [];
        // the last two are the open fronts onto the 7호선 B1 concourse (station module opens its wall at the same points)
        for (const [q, w] of [[J4, 8.4], [J3P, 10.4], [[-42.6, 177.2], 8.4], [[-61.3, 184.4], 8.4]]) {
          const at = atOn(a, b, q[0], q[1]); const ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L;
          const d = Math.abs((q[0] - a[0]) * uz - (q[1] - a[1]) * ux);
          if (d < 2.5 && at > -1 && at < L + 1) ops.push({ at, w, y0: YB1, y1: YB1 + 3.4 });
        }
        const ix = -nsB[i][0] * 0.15, iz = -nsB[i][1] * 0.15;
        K.wall(a[0] + ix, a[1] + iz, b[0] + ix, b[1] + iz, YB1, CB, { mat: M.wallB1, thick: 0.3, openings: ops });
      }
    }
    // Stone north entry with recessed doors; retain shared J4/J6 openings on east wall
    const N1 = P1(-21.7, 19.5);
    edge(12,Y1,C1,'ccGateBrick',M.wallIn,[[N1[0],N1[1],6.6,Y1,8.5]]);
    for (const i of [0,1]) edge(i,Y1,C1,'ccGateBrick',M.wallIn);
    // The photo 03 pavilion supplies the plinth/glazing here; keep its bowed struts visible from the curb.
    edge(2,Y1,C1,'ccStone',M.wallIn,[[...P(-16.5,0),6.4,0,6]]);
    { const a = T(3), b = P(-10, 0.3); K.wall(a[0], a[1], b[0], b[1], Y1, C1, { mat: 'glass', thick: 0.04 }); for (let k = 0; k <= 1; k += 0.25) K.box({ x: a[0] + (b[0] - a[0]) * k, z: a[1] + (b[1] - a[1]) * k, y: Y1, w: 0.12, d: 0.12, h: C1 - Y1, mat: 0x3a3f45, solid: false }); }
    edge(11, Y1, C1, 0xd7d2c8, M.wallIn, [[J4[0], J4[1], 8.4, Y1, Y1 + 3.4], [-55, 111.5, 6.6, Y1, Y1 + 3.4]]);
    // south block 1F: e6 (connector), e7 (하차장 doors), e8 (west end), e9 (사평대로), e10 (JW ramp end)
    const D7 = [-80, -62, -44, -30].map(t => { const p = P1(168.2, t); return [p[0], p[1], 4.2, Y1, 3.0]; });
    edge(6,Y1,C1,'ccBand',M.wallIn);
    edge(7,Y1,C1,'ccBand',M.wallIn,D7);
    edge(8, Y1, C1, 0x9a968f, M.wallIn, [[...P1(186, -98.6), 4, Y1, 3.0]]);
    const D9 = [[-81, 4], [-10, 6], [2, 8], [14, 4]].map(([t, w]) => { const s = 204.1 - (t + 98.9) * (1.3 / 135.8); const p = P1(s, t); return [p[0], p[1], w, Y1, 3.2]; });
    const southGlass = [-24,-16,-6,6,18,26].map(t => {
      const s=204.1-(t+98.9)*(1.3/135.8); return [...P1(s,t),3.6,0.65,3.25];
    });
    edge(9,Y1,C1,0x9a968f,M.wallIn,[...D9,...southGlass]);
    edge(10, Y1, C1, 0x9a968f, M.wallIn);
    // Photo 11: a dark plinth and glazed shops where the podium faces the round hall.
    for(const i of [8,9,10]) edge(i,0,0.55,0x595955,M.wallIn,i===9?D9:[]);
    const southFace=Math.atan2(ns[9][0],ns[9][1]);
    for(const [x,z,w] of southGlass) {
      const ux=Math.cos(southFace),uz=-Math.sin(southFace);
      K.wall(x-ux*w/2,z-uz*w/2,x+ux*w/2,z+uz*w/2,0.65,3.25,{mat:'glass',thick:0.04});
      for(const d of [-w/2,0,w/2]) K.box({x:x+ux*d,z:z+uz*d,y:0.6,w:0.1,h:2.7,d:0.12,rotY:southFace,mat:0x656d6c,solid:false});
    }
    // Discrete glazed door recesses within stone walls, not an uninterrupted curtain wall.
    for(const [edgeNo,doors] of [[7,D7],[9,D9]]) {
      const n=ns[edgeNo],face=Math.atan2(n[0],n[1]);
      for(const [x,z,w] of doors) {
        K.box({x:x-n[0]*0.18,z:z-n[1]*0.18,y:2.7,w,h:0.35,d:0.12,rotY:face,mat:0x47615b,solid:false});
        for(const d of [-w/2,w/2]) K.box({x:x+Math.cos(face)*d,z:z-Math.sin(face)*d,y:0,w:0.13,h:2.8,d:0.16,rotY:face,mat:0xaeb5b1,solid:false});
      }
    }
    // Photo 11 podium and aerial west band: square south windows and horizontal
    // west glazing. North wings stop at 6m below the separate 11.8m entrance pylons.
    for (let i = 0; i < TERM.length; i++) {
      if(i===12) { edge(i,C1,6,'ccGateBrick',M.wallIn,[[...N1,6.6,0,8.5]]); continue; }
      if(i<3) { edge(i,C1,6,'ccGateBrick',M.wallIn,i===2?[[...P(-16.5,0),6.4,0,6]]:[]); continue; }
      const windows=[];
      if(i===5) for(let s=1.8;s<149;s+=3.6) windows.push([...P(s,0),3.22,5.6,7.6]);
      if([8,9,10].includes(i)) {
        const a=TERM[i],b=TERM[(i+1)%TERM.length],L=Math.hypot(b[0]-a[0],b[1]-a[1]);
        for(let d=2.4;d<L-1.5;d+=3.6) windows.push([a[0]+(b[0]-a[0])*d/L,a[1]+(b[1]-a[1])*d/L,1.2,5.25,6.45]);
      }
      edge(i,C1,YR,[8,9,10].includes(i)?0x9a968f:BAND,M.wallIn,windows);
      const face=Math.atan2(ns[i][0],ns[i][1]),ux=Math.cos(face),uz=-Math.sin(face);
      for(const [x,z,w,y0,y1] of windows) K.wall(x-ux*w/2,z-uz*w/2,x+ux*w/2,z+uz*w/2,y0,y1,
        {mat:{tex:'glass',color:0x3d4a52},thick:0.04});
    }
    for (let i=0;i<TERM.length;i++) {
      const a=TERM[i],b=TERM[(i+1)%TERM.length],L=Math.hypot(b[0]-a[0],b[1]-a[1]);
      const mouths=[[-136.4,6.9,8,YR,YR+1.2],[-30.6,179.4,8,YR,YR+1.2]].filter(q=>{
        const at=atOn(a,b,q[0],q[1]);return at>-4&&at<L+4&&Math.abs((q[0]-a[0])*(b[1]-a[1])-(q[1]-a[1])*(b[0]-a[0]))/L<2;
      });
      if(i>2&&i!==12) edge(i,YR,YR+1.1,0xc7c3b9,0xbab5ad,mouths,{thick:0.25});
    }
    // cc_01 (June 2026): short brown pylons, transparent canopy and a circular C
    // above a dark CENTRAL CITY fascia. The inherited north-tip opening remains
    // between Shinsegae's west tower (east) and the separate GOTO MALL cover (west).
    const gateStone={tex:'ccGateBrick'};
    const gateS=-23.5,gateT=19.5;
    for(const t of [13.2,25.8])lbox(gateS,t,6,6,0,11.8,gateStone);
    // Recessed entry: stone spandrel, compact black sign, metal-framed glass doors.
    lbox(gateS,gateT,.3,6.6,3.3,2.7,gateStone,{solid:false});
    lbox(gateS-.2,gateT,.16,4.9,2.92,.58,0x1d2523,{solid:false});
    lsign('CENTRAL CITY',gateS-.3,gateT,3.2,4.1,.27,'N',{bg:null,fg:'#f0eee6'});
    for(const t of [16.75,22.25])lbox(gateS,t,.35,.18,0,3.3,0x7e8580,{solid:false});
    // Four glazed leaves: the centre pair is held open, preserving the walk-in route.
    for(const [t0,t1] of [[17.05,18.275],[20.725,21.95]]){
      lwall(gateS,t0,gateS,t1,0,2.72,{mat:'glass',thick:.04});
      for(const t of [t0,t1])entryTube([gateS-.04,t,0],[gateS-.04,t,2.72],.06,0x9fa6a1);
    }
    for(const t of [18.275,20.725]){
      lwall(gateS,t,gateS+1.225,t,0,2.72,{mat:'glass',thick:.04});
      entryTube([gateS+1.225,t,0],[gateS+1.225,t,2.72],.055,0x9fa6a1);
      entryTube([gateS+1.08,t,.85],[gateS+1.08,t,1.4],.035,0x9fa6a1);
    }
    for(const y of [.05,2.72,2.9])entryTube([gateS,17.05,y],[gateS,21.95,y],.065,0x9fa6a1);
    lwall(gateS,17.05,gateS,21.95,2.75,2.92,{mat:'glass',thick:.04,solid:false});
    // The emblem sits on a gridded glass panel, not on the superseded green directory.
    lwall(gateS,16.2,gateS,22.8,6,9.3,{mat:{tex:'glass',color:0xa9c1b9},thick:.04,solid:false});
    for(const t of [16.2,17.85,19.5,21.15,22.8])entryTube([gateS,t,6],[gateS,t,9.3],.075,0x3b4d46);
    for(const y of [6,7.1,8.2,9.3])entryTube([gateS,16.2,y],[gateS,22.8,y],.075,0x3b4d46);
    // Shallow annular relief: dark circular rim and pale C with its opening to the
    // viewer's right. Explicit arc thickness makes the letter legible at oblique angles.
    const emblemArc=(outer,inner,a0,a1,mat,depth)=>{
      const n=Math.ceil((a1-a0)*20),at=(r,a,ss)=>{const q=P(ss,gateT-r*Math.cos(a));return[q[0],7.55+r*Math.sin(a),q[1]];};
      const front=gateS-.28-depth,back=gateS-.18;
      for(let i=0;i<n;i++){
        const a=a0+(a1-a0)*i/n,b=a0+(a1-a0)*(i+1)/n;
        K.quad(mat,[at(outer,a,front),at(outer,b,front),at(inner,b,front),at(inner,a,front)],[-AX,0,-AZ]);
        for(const [r,side] of [[outer,1],[inner,-1]]){
          const m=(a+b)/2;
          K.quad(mat,[at(r,a,front),at(r,b,front),at(r,b,back),at(r,a,back)],[-EX*Math.cos(m)*side,Math.sin(m)*side,-EZ*Math.cos(m)*side]);
        }
      }
      if(a1-a0<2*PI-.01)for(const [a,side] of [[a0,-1],[a1,1]])
        K.quad(mat,[at(inner,a,front),at(outer,a,front),at(outer,a,back),at(inner,a,back)],[EX*Math.sin(a)*side,Math.cos(a)*side,EZ*Math.sin(a)*side]);
    };
    emblemArc(1.46,1.1,0,2*PI,0x252e2b,.02);
    emblemArc(1.1,.77,PI*.23,PI*1.85,0xd5d4c5,.09);
    K.material('ccEntryRoof',new K.THREE.MeshLambertMaterial({color:0xb7cfca,transparent:true,opacity:.38,side:K.THREE.DoubleSide,depthWrite:false}));
    // cc_01 shows a shallow pitched glass canopy, below the two pylon tops.
    const gateRoofY=ss=>9.3+(ss+26.5)/6*.65;
    const roofAt=(ss,t)=>{const[x,z]=P(ss,t);return[x,gateRoofY(ss),z];};
    for(let ss=-26.5;ss<-20.51;ss+=1.5)for(let t=16.2;t<22.79;t+=1.65)
      K.quad('ccEntryRoof',[roofAt(ss,t),roofAt(ss,t+1.65),roofAt(ss+1.5,t+1.65),roofAt(ss+1.5,t)],[0,1,0]);
    for(const ss of [-26.5,-25,-23.5,-22,-20.5])entryTube([ss,16.2,gateRoofY(ss)],[ss,22.8,gateRoofY(ss)],.085,0x879c94);
    for(const t of [16.2,17.85,19.5,21.15,22.8])entryTube([-26.5,t,gateRoofY(-26.5)],[-20.5,t,gateRoofY(-20.5)],.085,0x879c94);

    // cc_01 forecourt: light granite paving, leafy trees, three dark stone spheres
    // and the red tubular bench at the west side. Keep the door approach clear.
    K.texture('ccPlazaGranite',256,256,(g,w,h)=>{
      g.fillStyle='#b1aea5';g.fillRect(0,0,w,h);
      const noise=K.rand(431);
      for(let i=0;i<2300;i++){const v=145+Math.floor(noise()*56);g.fillStyle=`rgb(${v},${v},${v-5})`;g.fillRect(noise()*w,noise()*h,1,1);}
      g.strokeStyle='#8b8981';g.lineWidth=1;
      for(let q=0;q<=256;q+=64){g.beginPath();g.moveTo(q,0);g.lineTo(q,h);g.moveTo(0,q);g.lineTo(w,q);g.stroke();}
    },[2.4,2.4]);
    K.hpoly('ccPlazaGranite',RECT(-45,0,-26.6,38.5),.018,true);
    for(const [t0,t1] of [[0,14],[25,38]]){
      lbox(-27.5,(t0+t1)/2,1.8,t1-t0,0,.42,gateStone);
      lbox(-27.5,(t0+t1)/2,1.4,t1-t0-.4,.43,.22,0x40533b,{solid:false});
      for(const [f,h] of [[.2,5.8],[.7,6.4]]){
        const q=P(-27.5,t0+(t1-t0)*f);K.tree(...q,{y:.45,h,kind:'zelkova'});
      }
    }
    // A mottled stone texture without a second dark tint retains shading on all
    // sides; the previous near-black wire texture hid the original sphere's volume.
    K.texture('ccPlazaStone',256,128,(g,w,h)=>{
      g.fillStyle='#4c5855';g.fillRect(0,0,w,h);
      const noise=K.rand(918);
      for(let i=0;i<7000;i++){
        const v=48+Math.floor(noise()*68);g.fillStyle=`rgb(${v},${v+8},${v+5})`;
        g.fillRect(noise()*w,noise()*h,1+noise()*2,1+noise()*2);
      }
    },[1,1]);
    for(const t of [19,23,27]){
      const [x,z]=P(-38,t),r=1.02;
      K.dome({x,z,y:.018+r,rx:r,ry:r,rz:r,hemi:false,seg:36,rings:20,mat:'ccPlazaStone'});
      // K.dome's collision starts at its equator; register the complete ground-level
      // footprint locally so the lower half also blocks the player.
      const circle=Array.from({length:20},(_,i)=>[x+Math.cos(i*PI/10)*r,z+Math.sin(i*PI/10)*r]);
      K.phys.addPolyWalls(circle,.018,.018+2*r,.02,'centralcity');
    }
    const benchAt=(u,y)=>{const q=P(-31,5+u);return[q[0],y,q[1]];};
    const benchCurve=[[-3,.55],[-1.2,.55],[-.7,.75],[-.25,1.15],[.2,1.22],[.65,.85],[1.1,.55],[3,.55]];
    for(let i=0;i<benchCurve.length-1;i++)entryTubeWorld(benchAt(...benchCurve[i]),benchAt(...benchCurve[i+1]),.24,0xb62436);
    for(const u of [-2.2,2.2])entryTubeWorld(benchAt(u,0),benchAt(u,.55),.16,0xb62436);

    // Photo 03 street escalator pavilion. Position is a documented approximation near (-140,-5).
    // The OSM footprint stays authoritative; openings are cut in existing slabs, not stacked over them.
    const pavilionHole=RECT(-20,2.55,-8.9,5.55);
    hole(['f1'],pavilionHole);K.groundHole(pavilionHole);
    hole(['f2','rf'],RECT(-21,.2,-9,7));
    for(const [t,dir] of [[3.3,'down'],[4.8,'up']]){
      const aa=P(-9.5,t),bb=P(-20,t);
      K.escalator(aa[0],aa[1],bb[0],bb[1],{ya:YB1,yb:Y1,w:1.1,dir,sideMat:{tex:'marble',color:0xe9ebe6}});
    }
    for(const t of [2.55,5.55])rail(-20,t,-8.9,t,0);
    rail(-8.9,2.55,-8.9,5.55,0);
    lwall(-20.5,6.5,-9.5,6.5,0,1,{mat:0xb48f88,thick:.3});
    lwall(-20.5,6.5,-9.5,6.5,1,4.2,{mat:{tex:'glass',color:0x5f9c9a},thick:.04});
    for(let yy=1.15;yy<4.2;yy+=.18)lbox(-15,6.5,11,.12,yy,.055,0x5f9c9a,{solid:false});
    // Pink plinth along the street-facing side leaves a 2.6 m opening onto the top landing.
    lwall(-16.6,.5,-9.5,.5,0,1,{mat:0xb48f88,thick:.3});
    lbox(-10.7,1.1,3,1.2,0,6,0xe8e9e3);
    for(let yy=.2;yy<5.9;yy+=.22)lbox(-10.7,.46,2.85,.12,yy,.10,0xffffff,{solid:false});
    const pavilionRoofY=t=>4.5+.7*Math.sin((t-.5)/6*PI);
    for(let k=0;k<12;k++){
      const t0=.5+k*.5,t1=t0+.5,at=(ss,t)=>{const[x,z]=P(ss,t);return[x,pavilionRoofY(t),z];};
      K.quad(0xd5d8da,[at(-20.5,t0),at(-20.5,t1),at(-9.5,t1),at(-9.5,t0)],[0,1,0]);
      K.quad(0xc5cbcc,[at(-20.5,t0),at(-20.5,t1),at(-9.5,t1),at(-9.5,t0)],[0,-1,0]);
    }
    for(const ss of [-19.8,-10.2])for(const tt of [.7,6.3]){
      const inward=tt<3?1:-1,pts=Array.from({length:7},(_,k)=>[ss,tt+inward*.65*Math.sin(k/6*PI/2),1+k/6*3.6]);
      for(let k=0;k<6;k++)entryTube(pts[k],pts[k+1],.15,0xc9ccce);
    }
    lsign('센트럴',-15,.28,3.3,5,1,'W',{bg:'#171c1e',fg:'#ffffff'});

    lsign('센트럴시티터미널',70,-0.2,7.8,20,1.4,'W',{bg:null,fg:'#ffffff'});
    const sf=Math.atan2(ns[9][0],ns[9][1]);
    const sAt=t=>{const ss=204.1-(t+98.9)*(1.3/135.8);return P1(ss+0.25,t);};
    let p=sAt(-55); sign('CENTRAL CITY',{x:p[0],z:p[1],y:7.2,w:17,h:1.4,rotY:sf,bg:null,fg:'#ffffff'});
    p=sAt(2);sign('파미에스테이션',{x:p[0],z:p[1],y:3.6,w:7,h:0.65,rotY:sf,bg:'#27423b',fg:'#ffffff'});
    // Photo 09: translucent barrel shelter, inclined round struts, curb rails and double-globe lamps.
    const hf = Math.atan2(ns[7][0], ns[7][1]);
    p=P1(167.6,-60);sign('하차장',{x:p[0],z:p[1],y:3.05,w:5,h:.65,rotY:hf,bg:'#314a43',fg:'#ffffff'});
    canopy(162.9,166.9,-94,-26,3.55);
    // Rail openings align with boarding points; no continuous barrier across the passenger route.
    for(const [t0,t1] of [[-94,-66],[-62,-50],[-46,-34],[-30,-26]]){
      for(let t=t0;t<=t1+.01;t+=2)entryTube([162.9,t,.15],[162.9,t,1.15],.05,0xc9ccce);
      for(const yy of [.65,1.15])entryTube([162.9,t0,yy],[162.9,t1,yy],.055,0xc9ccce);
    }
    for(const t of [-92,-72,-52,-32])entryDoubleLamp(...P(167.5,t),.15);
    lbox(165.4,-60,4.8,74,0,.15,M.platform);
    for(const [i,t] of [-64,-48,-32].entries())coach(158.8,t,F.E,i,'서울 센트럴시티');
    K.crowd(RECT(163.5,-92,167.4,-28),.15,14,{seed:91});
    for(let k=0;k<5;k++){const[x,z]=P(158.6,-96+k*5.4);K.vehicle({x,z,rotY:F.E,kind:'taxi'});}
    lsign(['택시 승강장','하차장 서측'],163.4,-97,2.4,2.4,.8,'N',{bg:'#f2a33a',fg:'#1b1b1b',twoSided:true});
    lcyl(163.4,-97,0,.07,2,0x555b62);
    // sapyeong side canopies over the doors
    for (const t of [-81, 2]) {
      const q=sAt(t),w=t===2?30:6;
      K.box({x:q[0]+Math.sin(sf)*1.6,z:q[1]+Math.cos(sf)*1.6,y:3.4,w,d:3.4,h:0.12,rotY:sf,mat:{tex:'glass',color:0xd7e2df},solid:false});
      for(let d=-w/2;d<=w/2;d+=3) K.box({x:q[0]+Math.cos(sf)*d+Math.sin(sf)*1.6,z:q[1]-Math.sin(sf)*d+Math.cos(sf)*1.6,y:3.3,w:0.08,d:3.4,h:0.12,rotY:sf,mat:0xc9ccce,solid:false});
    }
  }
  // ================================================================= slabs (after all holes are registered)
  K.slab(B1POLY,YB1,{mat:{tex:'tile',color:0xc4b39c},under:false,ceil:false,holes:H.b1,edge:false});
  K.slab(F1POLY,Y1,{mat:M.hallFloor,under:false,holes:H.f1,thick:.3});
  const localS=q=>(q[0]-OX)*AX+(q[1]-OZ)*AZ;
  const localT=q=>(q[0]-OX)*EX+(q[1]-OZ)*EZ;
  const center=poly=>poly.reduce((a,q)=>[a[0]+q[0]/poly.length,a[1]+q[1]/poly.length],[0,0]);
  // B1 vault replaces the tile underside; omit nested escalator holes within that ceiling opening.
  const arcadeOpening=RECT(-20,13,149,22);
  K.hpoly(M.ceil,F1POLY,-.3,false,[arcadeOpening,...H.f1.filter(h=>!K.pointInPoly(...center(h),arcadeOpening))]);
  const east2=clipHalf(clipHalf(clipHalf(TERM,q=>localS(q)-151),q=>-18-localS(q)),q=>23-localT(q));
  const south2=clipHalf(TERM,q=>151-localS(q));
  for(const poly of [east2,south2])K.slab(poly,Y2,{mat:M.f2Floor,under:M.ceil,holes:H.f2.filter(h=>K.pointInPoly(...center(h),poly)),thick:.3});
  // Cut the entrance/pavilion back from the roof so the pylons and glass canopy stand against sky.
  const roofMain=clipHalf(TERM,q=>-9-localS(q));
  const roofNorth=clipHalf(clipHalf(clipHalf(TERM,q=>localS(q)+9),q=>-18-localS(q)),q=>7-localT(q));
  for(const poly of [roofMain,roofNorth])K.slab(poly,YR,{mat:M.roof,under:M.ceil,holes:H.rf.filter(h=>K.pointInPoly(...center(h),poly)),thick:.4});
  const northWing=clipHalf(TERM,q=>localS(q)+18);
  for(const poly of [clipHalf(clipHalf(northWing,q=>7-localT(q)),q=>localT(q)-16.2),clipHalf(northWing,q=>22.8-localT(q))]){
    if(poly.length>=3)K.slab(poly,6,{mat:0xa9a7a0,under:0xe9ebe6,thick:.2,walk:false});
  }

  // ================================================================= roof: car deck + one-way loop road (OSM layer-1 ways)
  {
    const yr = YR + 0.02;
    const ribbon = (pts, w, col = 0x8e8c86) => {
      for (let i = 0; i < pts.length - 1; i++) {
        const a = pts[i], b = pts[i + 1], L = Math.hypot(b[0] - a[0], b[1] - a[1]), nx = -(b[1] - a[1]) / L * w / 2, nz = (b[0] - a[0]) / L * w / 2;
        const ext = 1.2, ux = (b[0] - a[0]) / L * ext, uz = (b[1] - a[1]) / L * ext;
        K.quad(col, [[a[0] - ux + nx, yr, a[1] - uz + nz], [b[0] + ux + nx, yr, b[1] + uz + nz], [b[0] + ux - nx, yr, b[1] + uz - nz], [a[0] - ux - nx, yr, a[1] - uz - nz]], [0, 1, 0]);
        for (let k = 2; k < L - 2; k += 6) { const x = a[0] + (b[0] - a[0]) * k / L, z = a[1] + (b[1] - a[1]) * k / L; K.box({ x, z, y: yr + 0.004, w: 0.14, d: 2.6, h: 0.004, rotY: Math.atan2(b[0] - a[0], b[1] - a[1]), mat: 0xf4f4f4, solid: false }); }
      }
    };
    ribbon([[-131, 0], [-117, -5], [-55, 149], [-42, 157], [-33, 180]], 6.2);
    ribbon([[-108, 210], [-114, 193], [-81, 180], [-80, 166], [-71, 154], [-129, 5], [-131, 0]], 6.2);
    ribbon([[-31, 179.6], [-108, 210], [-121, 216]], 6.2);
    // direction arrows
    for (const [s, t, face] of [[20, 23.4, 'S'], [80, 23.9, 'S'], [130, 24.4, 'S'], [20, 8, 'N'], [80, 7.9, 'N'], [130, 7.9, 'N']]) lfloorText(face === 'S' ? '출구 ↓' : '↑ 진행', s, t, yr + 0.01, 3.0, 1.2, 'E', { fg: '#ffffff', bg: '#8e8c86' });
    // parking stalls: west strip t 0.8..5.4, centre double row t 11.2..20.8, east row t 28..33, south block rows
    const stall = (s, t0, t1, along) => { // line marking + maybe a car
      const a = P(s, t0), b = P(s, t1); K.quad(0xf4f4f4, [[a[0] - AX * 0.06, yr, a[1] - AZ * 0.06], [a[0] + AX * 0.06, yr, a[1] + AZ * 0.06], [b[0] + AX * 0.06, yr, b[1] + AZ * 0.06], [b[0] - AX * 0.06, yr, b[1] - AZ * 0.06]], [0, 1, 0]);
      void along;
    };
    const rows = [[0.8,5.4,F.W],[27.4,32.0,F.E]];
    for (const [t0, t1, rot] of rows) for (let s = -8; s < 148; s += 2.6) {
      if (s > 139 && t1 > 27) continue; if (s > 59.5 && s < 64.8 && t0 < 26 && t1 > 23.4) continue;
      stall(s, t0, t1);
      if (rnd() < 0.32 && s + 1.3 < 148) { const [x, z] = P(s + 1.3, (t0 + t1) / 2); K.vehicle({ x, z, y: YR, rotY: rot, kind: rnd() < 0.15 ? 'van' : 'car' }); }
    }
    // south block roof: rows between lanes (s 182..192) and north of north lane (s 169..174) + west lot
    for (let t = -44; t < 30; t += 2.6) for (const [s0, s1, rot] of [[182.2, 186.8, F.S], [187.2, 191.8, F.N]]) {
      const a = P(s0, t), b = P(s1, t); K.quad(0xf4f4f4, [[a[0] - EX * 0.06, yr, a[1] - EZ * 0.06], [a[0] + EX * 0.06, yr, a[1] + EZ * 0.06], [b[0] + EX * 0.06, yr, b[1] + EZ * 0.06], [b[0] - EX * 0.06, yr, b[1] - EZ * 0.06]], [0, 1, 0]);
      if (rnd() < 0.4) { const [x, z] = P((s0 + s1) / 2, t + 1.3); K.vehicle({ x, z, y: YR, rotY: rot, kind: 'car' }); }
    }
    for (let t = -88; t < -50; t += 2.6) for (const [s0, s1, rot] of [[170, 175, F.S], [184, 189, F.N], [189.4, 194.4, F.S]]) {
      const a = P(s0, t), b = P(s1, t); K.quad(0xf4f4f4, [[a[0] - EX * 0.06, yr, a[1] - EZ * 0.06], [a[0] + EX * 0.06, yr, a[1] + EZ * 0.06], [b[0] + EX * 0.06, yr, b[1] + EZ * 0.06], [b[0] - EX * 0.06, yr, b[1] - EZ * 0.06]], [0, 1, 0]);
      if (rnd() < 0.45) { const [x, z] = P((s0 + s1) / 2, t + 1.3); K.vehicle({ x, z, y: YR, rotY: rot, kind: 'car' }); }
    }
    // Small parking directory at the stair core; omit unverified tall floodlight towers.
    lsign('옥상 주차장',138,29,YR+1.8,3,0.55,'N',{bg:'#354c43',fg:'#ffffff',twoSided:true});
    // rooftop equipment on the south block
    for (const t of [-70, -60]) lbox(200, t, 3, 6, YR, 2.4, 0xb8bcc0, { top: 0x8f969c });
    lbox(62, 24.7, 2.6, 2.6, YR + 3.2, 0.3, 0xbab6ae, { solid: false });
    lsign('엘리베이터  1F · 2F · B1', 60.6, 24.7, YR + 2.7, 2.4, 0.35, 'N', { bg: '#1d3557', fg: '#fff' });
    // east ramp down to ground (OSM 593858534: (-33,180)->(-29,179)->(-14,173)->(-8,189))
    const rp = [[-30.6, 179.4, YR], [-14, 173, 4.6], [-8, 189, 0]];
    for (let i = 0; i < rp.length - 1; i++) {
      const [ax, az, ya] = rp[i], [bx, bz, yb] = rp[i + 1];
      K.ramp(ax, az, bx, bz, { w: 6.2, ya, yb, mat: 0x8e8c86, railMat: 0xb0aca4 });
      const L = Math.hypot(bx - ax, bz - az), nx = -(bz - az) / L * 3.1, nz = (bx - ax) / L * 3.1;
      for (const sg of [1, -1]) K.quad({ tex: 'concrete', color: 0xc8c4bc }, [[ax + nx * sg, 0, az + nz * sg], [bx + nx * sg, 0, bz + nz * sg], [bx + nx * sg, yb + 1.0, bz + nz * sg], [ax + nx * sg, ya + 1.0, az + nz * sg]], [nx * sg, 0, nz * sg]);
    }
    { const [x, z] = [-14, 173]; K.box({ x, z, y: 0, w: 6.4, d: 1.2, h: 4.6, rotY: Math.atan2(16, 6), mat: { tex: 'concrete', color: 0xc8c4bc } }); }
    sign(['출구', '사평대로 · 반포대로'], { x: -12.5, z: 180, y: 5.6, w: 3.6, h: 0.9, rotY: Math.atan2(-6.4 / 17.2, 16 / 17.2) + PI, bg: '#1b5e20', fg: '#fff', twoSided: true });
    K.zone({ name: '센트럴시티 옥상 주차장', floor: 'R', sub: '옥상 주차장 · 일방통행 순환로 · 승용차 주차', poly: TERM, y0: YR - 0.3, y1: YR + 6, priority: 1 });
  }
  // ---- bridge: roof north tip → 타워주차장 roof (OSM 1128012726), y=9
  const bridge = (pts, w = 6.4, y = YR + 0.01) => {
    for (let i = 0; i < pts.length - 1; i++) {
      const [ax, az] = pts[i], [bx, bz] = pts[i + 1];
      K.ramp(ax, az, bx, bz, { w, ya: y, yb: y, mat: 0x8e8c86, railMat: 0xb0aca4 });
      const L = Math.hypot(bx - ax, bz - az), nx = -(bz - az) / L * w / 2, nz = (bx - ax) / L * w / 2;
      for (const sg of [1, -1]) K.quad({ tex: 'concrete', color: 0xc8c4bc }, [[ax + nx * sg, y - 1.3, az + nz * sg], [bx + nx * sg, y - 1.3, bz + nz * sg], [bx + nx * sg, y + 1.0, bz + nz * sg], [ax + nx * sg, y + 1.0, az + nz * sg]], [nx * sg, 0, nz * sg]);
      K.quad(0x9a968f, [[ax - nx, y - 1.3, az - nz], [bx - nx, y - 1.3, bz - nz], [bx + nx, y - 1.3, bz + nz], [ax + nx, y - 1.3, az + nz]], [0, -1, 0]);
      for (let k = 6; k < L - 3; k += 12) K.cyl({ x: ax + (bx - ax) * k / L, z: az + (bz - az) * k / L, y: 0, r: 0.7, h: y - 1.3, mat: { tex: 'concrete', color: 0xc8c4bc }, seg: 10 });
    }
  };
  bridge([[-136.4, 6.9], [-159, 15], [-172.6, 19.6]]);
  bridge([[-177.3, 54.9], [-170.4, 75.3]]);
  sign(['타워주차장 · 버스주차장 데크', '← P'], { x: -150, z: 12.5, y: YR + 3.2, w: 4.6, h: 0.9, rotY: Math.atan2(22.6, 8.1) + PI / 2, bg: '#1d3557', fg: '#fff', twoSided: true });

  // ================================================================= 파미에스테이션 원형관 (round pavilion, B1 + 1F + 2F)
  if (ROUND) {
    const cx = -47, cz = 214.6, y2 = 4.2, yr2 = 16.5;
    const ring = (r, n = 16) => Array.from({ length: n }, (_, i) => [cx + Math.cos(i * PI * 2 / n) * r, cz + Math.sin(i * PI * 2 / n) * r]);
    // Keep the OSM contact outline; the upper gallery sits inward where the sloped roof has headroom.
    const GALLERY = ring(14), ATRIUM = ring(6);
    const holes = { b1: [], f1: [], f2: [], rf: [] };
    // escalator pair B1 ↔ 1F along +x
    const ex0 = -56.5, ex1 = -46.0;
    K.escalator(ex0, 219, ex1, 219, { ya: YB1, yb: Y1, dir: 'up' }); K.escalator(ex0, 220.5, ex1, 220.5, { ya: YB1, yb: Y1, dir: 'down' });
    const eh = [[ex0 - 0.6, 218.2], [ex1, 218.2], [ex1, 221.3], [ex0 - 0.6, 221.3]]; holes.f1.push(eh); K.groundHole(eh);
    K.wall(ex0 - 0.6, 218.2, ex1, 218.2, 0, 1.05, { mat: 'glass', thick: 0.04 }); K.wall(ex0 - 0.6, 221.3, ex1, 221.3, 0, 1.05, { mat: 'glass', thick: 0.04 }); K.wall(ex0 - 0.6, 218.2, ex0 - 0.6, 221.3, 0, 1.05, { mat: 'glass', thick: 0.04 });
    // stairs 1F → 2F along -x at z 208
    K.stairs(-40, 207.5, -47, 207.5, { w: 2, ya: 0, yb: y2 });
    const sh = [[-47, 206.4], [-39.8, 206.4], [-39.8, 208.6], [-47, 208.6]]; holes.f2.push(sh);
    K.wall(-47, 206.4, -39.8, 206.4, y2, y2 + 1.05, { mat: 'glass', thick: 0.04 }); K.wall(-47, 208.6, -39.8, 208.6, y2, y2 + 1.05, { mat: 'glass', thick: 0.04 }); K.wall(-39.8, 206.4, -39.8, 208.6, y2, y2 + 1.05, { mat: 'glass', thick: 0.04 });
    // elevator
    K.elevator({ name: '파미에스테이션 원형관 엘리베이터', x: -36.5, z: 216, rotY: -PI / 2, w: 2, d: 2, floors: [{ label: 'B1', y: YB1, name: '파미에스테이션 · 7호선 연결' }, { label: '1F', y: 0, name: '스타벅스' }, { label: '2F', y: y2, name: '스타벅스 2층' }], topH: 2.8 });
    const elh = [[-37.6, 214.9], [-35.4, 214.9], [-35.4, 217.1], [-37.6, 217.1]]; holes.b1.push(elh); holes.f1.push(elh); holes.f2.push(elh);
    K.slab(ROUND, YB1, { mat: { tex: 'tile', color: 0xc4b39c }, under: false, ceil: false, holes: holes.b1, edge: false });
    K.slab(ROUND, Y1, { mat: { tex: 'wood', color: 0xb89470 }, under: M.ceil, holes: holes.f1 });
    K.slab(GALLERY, y2, { mat: { tex: 'wood', color: 0xb89470 }, under: 0xe7e6df, holes: [...holes.f2, ATRIUM] });
    for (const poly of [GALLERY, ATRIUM]) K.polyWalls(poly, y2, y2 + 1.05, { mat: 'glass', thick: 0.04 });
    // J7 B1 opening; low stone/glazed pavilion below the green roof
    const ns = K.orient(ROUND);
    for (let i = 0; i < ROUND.length; i++) {
      const a = ROUND[i], b = ROUND[(i + 1) % ROUND.length], L = Math.hypot(b[0] - a[0], b[1] - a[1]);
      const ix = -ns[i][0] * 0.15, iz = -ns[i][1] * 0.15;
      const mx = (a[0] + b[0]) / 2, mz = (a[1] + b[1]) / 2;
      const north = mz < 202.5; // J7: open the B1 wall facing the 7호선 concourse (≥ 8 m)
      if (!north) K.wall(a[0] + ix, a[1] + iz, b[0] + ix, b[1] + iz, YB1, CB, { mat: M.wallB1, thick: 0.3 });
      else K.wall(a[0] + ix, a[1] + iz, b[0] + ix, b[1] + iz, YB1 + 3.4, CB, { mat: M.wallB1, thick: 0.3 });
      const door = (Math.abs(mx + 47) < 4 && (mz < 202 || mz > 227));
      K.wall(a[0],a[1],b[0],b[1],0,5.5,{mat:{tex:'glass',color:0xb7c9c1},thick:0.04,openings:door?[{at:L/2,w:Math.min(3.2,L-0.6),y0:0,y1:2.8}]:[]});
      if(!door) K.wall(a[0],a[1],b[0],b[1],0,0.35,{mat:'ccStone',thick:0.24});
      K.wall(a[0],a[1],b[0],b[1],4.1,4.3,{mat:0x2f4a40,thick:0.12,solid:false});
      void L;
    }
    // Photo 11: deep eave skirt and two steep verdigris roof tiers, independent of OSM's low height tag.
    const EAVE = ring(18.5);
    K.prism(EAVE, 5.18, 5.5, { mat: 0x3f5d52, holes: [ring(16.65)], solid: false });
    // Sixteen equal facet seams and dark green mullions at 22.5-degree intervals.
    for (let i = 0; i < 16; i++) {
      const a = i * PI / 8, dx = Math.cos(a), dz = Math.sin(a);
      // Intersect radial mullion with the authoritative, slightly irregular OSM wall.
      let r = 0;
      for (let rr = 0; rr < 18; rr += 0.025) if (K.pointInPoly(cx + dx * rr, cz + dz * rr, ROUND)) r = rr;
      K.box({ x: cx + dx * r, z: cz + dz * r, y: 0.35, w: 0.16, d: 0.16, h: 5.15, rotY: -a, mat: 0x2f4a40, solid: false });
    }
    const roofRings = [[18.5,5.5],[9,11],[9,11.8],[2,15.5]];
    const roofPt = (i, r) => [cx + Math.cos(i * PI / 8) * r[0], r[1], cz + Math.sin(i * PI / 8) * r[0]];
    for (let j = 0; j < roofRings.length - 1; j++) for (let i = 0; i < 16; i++) {
      const A = roofPt(i,roofRings[j]), B = roofPt(i+1,roofRings[j]), C = roofPt(i+1,roofRings[j+1]), D = roofPt(i,roofRings[j+1]);
      const mid = (i + 0.5) * PI / 8, dr = roofRings[j][0] - roofRings[j+1][0], dy = roofRings[j+1][1] - roofRings[j][1];
      const normal = [Math.cos(mid)*dy,dr,Math.sin(mid)*dy];
      K.quad(j === 1 ? {tex:'glass',color:0x7b9e93} : 0x5d8a7e,[A,B,C,D],normal);
      // Visible sloped interior instead of the previous flat tile lid.
      if (j !== 1) K.quad(0xd4ded8,[A,B,C,D],normal.map(v=>-v));
      const nx = -Math.sin(i*PI/8)*0.055, nz = Math.cos(i*PI/8)*0.055;
      K.quad(0x3c6558,[[A[0]-nx,A[1]+0.035,A[2]-nz],[A[0]+nx,A[1]+0.035,A[2]+nz],[D[0]+nx,D[1]+0.035,D[2]+nz],[D[0]-nx,D[1]+0.035,D[2]-nz]],normal);
      if(j===1) K.box({x:D[0],z:D[2],y:11,w:0.12,d:0.12,h:0.8,mat:0x2f4a40,solid:false});
    }
    // Small glazed lantern with a shallow metal cap at y=16.5.
    K.polyWalls(ring(2),15.5,16.15,{mat:{tex:'glass',color:0xb4c8bc},thick:0.04,solid:false});
    for(let i=0;i<16;i++) {
      const A=roofPt(i,[2.2,16.15]),B=roofPt(i+1,[2.2,16.15]),C=[cx,16.5,cz];
      K.quad(0x5d8a7e,[A,B,C,C],[0,1,0]);
      const [x,z]=ring(2)[i];K.box({x,z,y:15.5,w:0.1,d:0.1,h:0.65,mat:0x2f4a40,solid:false});
    }
    sign('파미에스테이션',{x:cx,z:197.65,y:3.8,w:6.6,h:0.65,rotY:PI,bg:'#385147',fg:'#f0eee3'});
    sign(['지하철 7호선 고속터미널역 ↓', '센트럴시티 · 신세계 연결'], { x: -51, z: 219.75, y: 3.3, w: 4.4, h: 0.8, rotY: PI / 2, bg: '#747F00', fg: '#fff', twoSided: true });
    // 1F starbucks counter + tables, 2F seating, B1 lounge
    K.box({ x: -43, z: 225, y: 0, w: 7, d: 1.05, h: 1.05, rotY: -0.25, mat: 0x35584a, top: 0x393b36 });
    K.box({ x: -43.3, z: 227, y: 0, w: 7.5, d: 0.6, h: 2.6, rotY: -0.25, mat: {tex:'wood',color:0xb79b76} });
    // Espresso equipment, till and glass pastry cabinet; their precise layout is unmeasured.
    for(const dx of [-1.4,0.6]) K.box({x:-43+dx,z:225.2,y:1.05,w:0.9,d:0.6,h:0.5,rotY:-0.25,mat:0xb8bfbe,solid:false});
    K.box({x:-40.7,z:225.6,y:1.05,w:1.5,d:0.8,h:0.65,rotY:-0.25,mat:'glass',solid:false});
    K.box({x:-45.5,z:224.5,y:1.05,w:0.4,d:0.35,h:0.32,rotY:-0.25,mat:0x303631,solid:false});
    sign('스타벅스', { x: -43, z: 226.5, y: 2.2, w: 4.6, h: 0.8, rotY: PI-0.25, bg: '#00704a', fg: '#fff' });
    sign('STARBUCKS', { x: -43, z: 224.43, y: 0.6, w: 4.2, h: 0.36, rotY: PI-0.25, bg: '#00704a', fg: '#fff' });
    const R3 = K.rand(321);
    for (const [y, n] of [[0, 9], [y2, 14], [YB1, 8]]) for (let k = 0; k < n; k++) {
      const a = R3() * PI * 2, r = y === y2 ? 7.5 + R3() * 5 : 5 + R3() * 9; const x = cx + Math.cos(a) * r, z = cz + Math.sin(a) * r;
      if(y===0&&z>222&&x>-48&&x<-38)continue;
      if (Math.abs(z - 219.7) < 2.5 && x > -58 && x < -45) continue; if (Math.abs(z - 207.5) < 2 && x > -48 && x < -39) continue; if (Math.hypot(x + 36.5, z - 216) < 2.5) continue;
      K.cyl({ x, z, y, r: 0.4, h: 0.74, mat: 0xe8e2d8, seg: 10 }); for (const d of [-0.7, 0.7]) K.box({ x: x + d, z, y, w: 0.42, d: 0.42, h: 0.45, mat: 0x2e5a3d, solid: false });
      if (R3() < 0.5) K.person(x + 0.7, y, z, { sit: true });
    }
    for (let k = 0; k < 10; k++) { const a = k / 10 * PI * 2; K.box({ x: cx + Math.cos(a) * 6, z: cz + Math.sin(a) * 6, y: CB - 0.06, w: 1.2, d: 1.2, h: 0.05, mat: 'emit', color: 0xffe6c0, solid: false }); K.box({ x: cx + Math.cos(a) * 6, z: cz + Math.sin(a) * 6, y: y2 - 0.36, w: 1.0, d: 1.0, h: 0.05, mat: 'emit', color: 0xffe6c0, solid: false }); }
    sign(['FAMILLE STATION', '파미에스테이션 · 7호선 연결'], { x: -45, z: 200.2, y: YB1 + 3.0, w: 6, h: 0.9, rotY: 0, bg: '#141414', fg: '#f0e6c8' });
    K.zone({ name: '파미에스테이션 원형관', floor: 'B1', sub: '7호선 고속터미널역 연결 · 라운지', poly: ROUND, y0: YB1 - 0.5, y1: CB, priority: 3 });
    K.zone({ name: '파미에스테이션 원형관', floor: '1F', sub: '스타벅스', poly: ROUND, y0: -0.5, y1: y2 - 0.3, priority: 3 });
    K.zone({ name: '파미에스테이션 원형관', floor: '2F', sub: '스타벅스 2층 좌석', poly: GALLERY, y0: y2 - 0.3, y1: yr2, priority: 3 });
  }

  // ================================================================= 호남선 버스 주차장 (yard) + 데크 주차장 (1173096805)
  {
    K.hpoly(M.asphalt, YARD, 0.012, true);
    // Aerial: dense light-roofed coach rows west of the car deck, and a nose-in row at its east edge.
    // Geometry stays inside the claimed yard; eastern noses stop short of the circulation lane.
    let k=0;
    for(const [t,s0,s1,face] of [[-85,71,148,F.E],[-65,74,148,F.W],[-25.8,53,146,F.W]]) {
      for(let ss=s0;ss<s1;ss+=3.65) {
        if(t>-30&&ss<64)continue; // Keep the deck stair/elevator approach clear.
        if(!RECT(ss-1.4,t-6.25,ss+1.4,t+6.25).every(q=>K.pointInPoly(...q,YARD))) continue;
        for(const ds of [-1.65,1.65]) lbox(ss+ds,t,0.10,12.7,0.025,0.006,0xe7e5d8,{solid:false});
        lbox(ss,t+6.3,3.4,0.1,0.025,0.006,0xe7e5d8,{solid:false});
        if(k++%7===3) continue;
        coach(ss,t,face,k,'회송');
      }
    }
    // Clear central approach and south turning space; aerial shows paved service circulation.
    for(let ss=49;ss<146;ss+=10) lbox(ss,-93,3.6,0.12,0.026,0.006,0xd7c66b,{solid:false});
    K.zone({ name: '호남선 버스 주차장', floor: '1F', sub: '고속버스 대기 주차 · 회차로', poly: YARD, y0: -0.5, y1: 4.2, priority: 0 });
  }
  if (DECK) {
    const yM = 4.5, yT = YR;
    const DH = { m: [], t: [] };
    // stairs + elevator at the north-east corner, ramp mid→top along the west side
    const dsA = 52, dt = -31; // local s,t (inside deck: s 48.5..120, t -64..-27.5)
    flight(dsA, dsA + 7.5, dt, 0, yM, null); flight(dsA + 7.5, dsA, dt - 2.6, yM, yT, null);
    DH.m.push(RECT(dsA - 0.2, dt - 1.2, dsA + 7.5, dt + 1.2)); DH.t.push(RECT(dsA - 0.2, dt - 3.8, dsA + 7.5, dt - 1.4));
    const rampA = P(70, -60.5), rampB = P(102, -60.5);
    K.ramp(rampA[0], rampA[1], rampB[0], rampB[1], { w: 5, ya: yM, yb: yT, mat: 0xa9a7a0, railMat: 0xb0aca4 });
    DH.t.push(RECT(69.5, -63.2, 102, -57.8));
    const [ex, ez] = P(56, -36); K.elevator({ name: '버스주차장 데크 엘리베이터', x: ex, z: ez, rotY: F.S, w: 2, d: 2, floors: [{ label: '1F', y: 0, name: '버스 대기 주차장' }, { label: '2F', y: yM, name: '데크 주차장' }, { label: 'R', y: yT, name: '옥상 데크 · 타워주차장 연결' }] });
    const eh = RECT(54.9, -37.1, 57.1, -34.9); DH.m.push(eh); DH.t.push(eh);
    K.slab(DECK, yM, { mat: 0xa9a7a0, under: { tex: 'concrete', color: 0x9a968f }, holes: DH.m, thick: 0.4 });
    K.slab(DECK, yT, { mat: 0xa9a7a0, under: { tex: 'concrete', color: 0x9a968f }, holes: DH.t, thick: 0.4 });
    for(const y of [yM,yT]) K.polyWalls(DECK,y,y+1.05,{mat:0xcbd0c9,thick:0.25,openings:y===yT?[{x:-170.4,z:75.3,w:8,y0:y,y1:y+1.1}]:[]});
    for(let i=0;i<DECK.length;i++) {const a=DECK[i],b=DECK[(i+1)%DECK.length];for(const y of [yM,yT])K.wall(a[0],a[1],b[0],b[1],y-0.6,y,{mat:0xd0d2ca,thick:0.3,solid:false});}
    for (let s = 50.5; s < 120; s += 8.5) for (const t of [-35, -55]) { lcyl(s, t, 0, 0.4, yM - 0.4, 0xc8c4bc); lcyl(s, t, yM, 0.4, yT - yM - 0.4, 0xc8c4bc); }
    // Aerial: four longitudinal stall rows, 2.5 x 5 m; the two paired rows face a 6 m central aisle.
    // Preserve the bridge, stairs, lift and west ramp. Stalls behind the ramp are omitted.
    const deckRows = [[-60.5,F.W],[-55.5,F.E],[-44.5,F.W],[-39.5,F.E]];
    for(const y of [yM,yT]) {
      const voids = y === yM ? DH.m : DH.t;
      // Paint aisles first, then stall lines above them so no road overlay erases the markings.
      lbox(84,-50,67,6,y+0.006,0.004,0x8e8c86,{solid:false});
      lbox(86,-32.2,60,5.4,y+0.006,0.004,0x8e8c86,{solid:false});
      lbox(64,-46,5.5,31,y+0.006,0.004,0x8e8c86,{solid:false});
      lbox(114,-46,5.5,31,y+0.006,0.004,0x8e8c86,{solid:false});
      const slots=[];
      for(let ss=51.5;ss<111;ss+=2.5) for(const [t,rot] of deckRows) {
        const corners=RECT(ss-1.25,t-2.5,ss+1.25,t+2.5);
        if(!corners.every(q=>K.pointInPoly(...q,DECK)))continue;
        if(ss>60&&ss<68)continue;
        if(ss<60&&t>-41)continue; // north stair/lift landing
        if(ss<58&&t<-51)continue; // clear the tower bridge landing and its turning area
        if(t<-58&&ss>67&&ss<105)continue; // west ramp and its approach
        if(corners.some(q=>voids.some(h=>K.pointInPoly(...q,h))))continue;
        for(const ds of [-1.25,1.25])lbox(ss+ds,t,0.09,5,y+0.018,0.005,0xffffff,{solid:false});
        lbox(ss,t+(rot===F.W?2.5:-2.5),2.5,0.09,y+0.018,0.005,0xffffff,{solid:false});
        slots.push({s:ss,t,rot});
      }
      // Fourteen cars per deck, eleven in the northern half, sampled without randomness in the total.
      const north=slots.filter(q=>q.s<85), south=slots.filter(q=>q.s>=85);
      const occupied=[];
      for(const [pool,count] of [[north,11],[south,3]])for(let i=0;i<Math.min(count,pool.length);i++)occupied.push(pool[Math.floor(i*pool.length/count)]);
      for(const [i,q] of occupied.entries()) {const [x,z]=P(q.s,q.t);K.vehicle({x,z,y,rotY:q.rot,kind:'car',color:[0xf2f1ec,0xc7ccce,0x3f4445,0xa7aba8][i%4]});}
    }
    for (const [s, t] of [[90, -27.4], [90, -64.2]]) lsign(['센트럴시티 버스주차장', 'P  데크 주차장'], s, t, yM - 0.45, 8, 0.8, t > -40 ? 'E' : 'W', { bg: '#1d3557', fg: '#fff' });
    K.zone({ name: '버스주차장 데크', floor: '2F', sub: '승용차 주차 · 데크 2층', poly: DECK, y0: yM - 0.3, y1: yT - 0.4, priority: 2 });
    K.zone({ name: '버스주차장 데크', floor: 'R', sub: '옥상 데크 주차 · 타워주차장 연결교', poly: DECK, y0: yT - 0.3, y1: yT + 5, priority: 2 });
    K.zone({ name: '버스주차장 데크 하부', floor: '1F', sub: '고속버스 회송 · 대기', poly: DECK, y0: -0.5, y1: yM - 0.4, priority: 1 });
  }
  // ================================================================= 타워주차장 (601356623): 1F · 2F · 옥상, helix ramp at the east end
  if (TOWER) {
    const y2 = 4.5, y3 = YR;
    const hx = -163.2, hz = 36.6, rIn = 3.0, rOut = 7.0, rMid = 5.0;
    const circ = (r, n = 20) => Array.from({ length: n }, (_, i) => [hx + Math.cos(i / n * PI * 2) * r, hz + Math.sin(i / n * PI * 2) * r]);
    const hHole = circ(rOut + 0.05);
    const TH = { m: [hHole], t: [hHole] };
    // helix: θ = π at each deck level (exit toward the deck, west); 2 turns over 9 m
    const N = 48;
    for (let i = 0; i < N; i++) {
      const a0 = PI + i / N * 4 * PI, a1 = PI + (i + 1) / N * 4 * PI;
      const ya = i / N * y3, yb = (i + 1) / N * y3;
      K.ramp(hx + Math.cos(a0) * rMid, hz + Math.sin(a0) * rMid, hx + Math.cos(a1) * rMid, hz + Math.sin(a1) * rMid, { w: 3.9, ya, yb, rails: false, mat: { tex: 'concrete', color: 0x9e9a92 } });
      const pa = [hx + Math.cos(a0) * rOut, hz + Math.sin(a0) * rOut], pb = [hx + Math.cos(a1) * rOut, hz + Math.sin(a1) * rOut];
      if (i < 24) { // outer wall once, full height, with openings at the 3 levels where the ramp meets the decks
        const am = (a0 + a1) / 2, nearExit = Math.cos(am) < -0.96;
        const ops = nearExit ? [0, y2, y3].map(y => ({ at: 1.1, w: 2.2, y0: y, y1: y + 2.4 })) : [];
        K.wall(pb[0], pb[1], pa[0], pa[1], 0, y3 + 1.1, { mat: { tex: 'ccLouver' }, mat2: 0xc8c4bc, thick: 0.25, openings: ops });
      }
    }
    K.cyl({ x: hx, z: hz, y: 0, r: rIn, h: y3 + 1.2, mat: 0xc8c4bc, seg: 16 });
    // stairs + elevator at the west end
    K.stairs(-229, 55, -221.5, 55, { w: 2, ya: 0, yb: y2 }); K.stairs(-221.5, 57.6, -229, 57.6, { w: 2, ya: y2, yb: y3 });
    TH.m.push([[-229.2, 53.9], [-221.5, 53.9], [-221.5, 56.1], [-229.2, 56.1]]); TH.t.push([[-229.2, 56.5], [-221.5, 56.5], [-221.5, 58.7], [-229.2, 58.7]]);
    K.elevator({ name: '타워주차장 엘리베이터', x: -216, z: 54, rotY: PI / 2, w: 2, d: 2, floors: [{ label: '1F', y: 0, name: '주차장 입구' }, { label: '2F', y: y2, name: '주차 2층' }, { label: 'R', y: y3, name: '옥상 · 센트럴시티 옥상 연결교' }] });
    const teh = [[-217.1, 52.9], [-214.9, 52.9], [-214.9, 55.1], [-217.1, 55.1]]; TH.m.push(teh); TH.t.push(teh);
    K.slab(TOWER, y2, { mat: 0xa9a7a0, under: { tex: 'concrete', color: 0x9a968f }, holes: TH.m, thick: 0.4 });
    K.slab(TOWER, y3, { mat: 0xa9a7a0, under: { tex: 'concrete', color: 0x9a968f }, holes: TH.t, thick: 0.4 });
    K.hpoly(0xa9a7a0, TOWER, 0.015, true);
    // facade: louvre spandrels + parapets (ground level open toward the yard road)
    for (let i = 0; i < TOWER.length; i++) {
      const a = TOWER[i], b = TOWER[(i + 1) % TOWER.length];
      if (Math.hypot(a[0] - hx, a[1] - hz) < rOut + 1.5 && Math.hypot(b[0] - hx, b[1] - hz) < rOut + 1.5) continue;
      for(const y of [y2,y3]) {
        const dx=b[0]-a[0],dz=b[1]-a[1],L=Math.hypot(dx,dz),ops=[];
        if(y===y3) for(const [x,z] of [[-172.6,19.6],[-177.3,54.9]]) {
          const at=((x-a[0])*dx+(z-a[1])*dz)/L,d=Math.abs((x-a[0])*dz-(z-a[1])*dx)/L;
          if(d<2&&at>-4&&at<L+4)ops.push({at,w:8,y0:y,y1:y+1.2});
        }
        K.wall(a[0],a[1],b[0],b[1],y,y+(y===y3?0.3:1.1),{mat:0xd8d5cc,mat2:0xd8d5cc,thick:y===y3?0.45:0.25,openings:ops});
        K.wall(a[0],a[1],b[0],b[1],y-0.7,y,{mat:0xc8c4bc,thick:0.3,solid:false});
      }
      K.wall(a[0], a[1], b[0], b[1], y2 + 2.6, y3 - 1.0, { mat: { tex: 'ccLouver' }, thick: 0.08, solid: false });
    }
    // Complete the pale curb around the rounded east end as well as the west semicircle.
    for(let i=0;i<TOWER.length;i++) {
      const a=TOWER[i],b=TOWER[(i+1)%TOWER.length];
      if(Math.hypot(a[0]-hx,a[1]-hz)<rOut+1.5&&Math.hypot(b[0]-hx,b[1]-hz)<rOut+1.5)
        K.wall(a[0],a[1],b[0],b[1],y3,y3+0.3,{mat:0xd8d5cc,thick:0.45});
    }
    // columns + cars
    const bb = K.polyBBox(TOWER);
    for (let x = bb[0] + 4; x < bb[2] - 2; x += 8.4) for (let z = bb[1] + 3; z < bb[3] - 2; z += 8.4) {
      if (!K.pointInPoly(x, z, TOWER) || Math.hypot(x - hx, z - hz) < rOut + 1) continue;
      K.cyl({ x, z, y: 0, r: 0.38, h: y2 - 0.4, mat: 0xc8c4bc, seg: 8 }); K.cyl({ x, z, y: y2, r: 0.38, h: y3 - y2 - 0.4, mat: 0xc8c4bc, seg: 8 });
    }
    // Aerial roof rows follow the long axis of the parking structure (not the world grid).
    const pr=Math.atan2(0.336,0.942),pc=Math.cos(pr),ps=Math.sin(pr);
    const park=(u,v)=>[-232+pc*u+ps*v,54-ps*u+pc*v];
    let towerSlot=0;
    for(const y of [0,y2,y3]) for(let u=2;u<54;u+=2.7) for(const v of [-5.2,5.2]) {
      const [x,z]=park(u,v);
      if(![[-1.4,-2.6],[1.4,-2.6],[1.4,2.6],[-1.4,2.6]].every(([du,dv])=>K.pointInPoly(...park(u+du,v+dv),TOWER)))continue;
      if(Math.hypot(x-hx,z-hz)<rOut+4||(x>-231&&x<-213&&z>51&&z<60))continue;
      for(const du of [-1.3,1.3]){const [lx,lz]=park(u+du,v);K.box({x:lx,z:lz,y:y+0.018,w:0.09,d:4.9,h:0.005,rotY:pr,mat:0xefeee6,solid:false});}
      if((towerSlot++*7)%20<11)K.vehicle({x,z,y,rotY:pr+(v<0?PI:0),kind:'car',color:[0xecece7,0xbfc2c1,0x343838,0x666e72][Math.floor(rnd()*4)]});
    }
    // OSM 1185035520 (layer 2 roof road) paint
    const rr = [[-166, 29], [-180, 34], [-184, 36], [-177, 56]];
    for (let i = 0; i < rr.length - 1; i++) { const a = rr[i], b = rr[i + 1]; K.box({ x: (a[0] + b[0]) / 2, z: (a[1] + b[1]) / 2, y: y3 + 0.01, w: 5.5, d: Math.hypot(b[0] - a[0], b[1] - a[1]) + 4, h: 0.01, rotY: Math.atan2(b[0] - a[0], b[1] - a[1]), mat: 0x8e8c86, solid: false }); }
    // signs
    sign(['타워주차장', 'P  센트럴시티 · 신세계 · JW'], { x: -200, z: 24.6, y: 7.2, w: 9, h: 1.8, rotY: Math.atan2(-0.33, -0.94) + PI, bg: '#1d3557', fg: '#ffffff', twoSided: true });
    sign(['주차장 입구', '센트럴시티'], { x: -192, z: 62, y: 3.2, w: 4, h: 1.0, rotY: Math.atan2(0.336, 0.942), bg: '#1d3557', fg: '#fff', twoSided: true });
    K.zone({ name: '타워주차장', floor: '1F', sub: '주차장 입구 · 나선형 램프', poly: TOWER, y0: -0.5, y1: y2 - 0.4, priority: 2 });
    K.zone({ name: '타워주차장', floor: '2F', sub: '승용차 주차', poly: TOWER, y0: y2 - 0.4, y1: y3 - 0.4, priority: 2 });
    K.zone({ name: '타워주차장', floor: 'R', sub: '옥상 주차 · 센트럴시티 옥상/데크 연결교', poly: TOWER, y0: y3 - 0.4, y1: y3 + 5, priority: 2 });
  }

  // ================================================================= zones
  lzone(-22.5, -1, 151, 23, { name: '센트럴시티터미널 (호남선)', floor: '1F', sub: '대합실 · 매표소 · 무인발권기 · 승차홈', y0: -0.5, y1: HALL_CROWN, priority: 2 });
  lzone(-12, -18, 151, 6, { name: '호남선 승차홈', floor: '1F', sub: '광주 · 전주 · 목포 · 여수 · 순천', y0: -0.5, y1: C1, priority: 3 });
  lzone(151, -99, 205, 39, { name: '파미에스테이션 · 하차장', floor: '1F', sub: '스타벅스 센트럴1F점 · 장터국수 · 던킨 · 포브 · 하차장 · 메가박스 입구', y0: -0.5, y1: C1, priority: 2 });
  lzone(-22.5, 23, 151, 39.5, { name: '센트럴시티 식당가', floor: '2F', sub: '순대실록 · 101번지 남산돈까스 · 르사이공 · 우마이도 · 서대문 한옥집', y0: C1, y1: C2, priority: 2 });
  lzone(151, -99, 205, 39, { name: '파미에스테이션 2F', floor: '2F', sub: '아웃백 · 명동교자 · 소이연남 · 팔도국수 면주방 · 홍대만뽀 · 채선당 샤브보트', y0: C1, y1: C2, priority: 2 });
  lzone(-22.5, -1, 151, 39.5, { name: '파미에스테이션', floor: 'B1', sub: '지하상가 · 연결통로 · 스타벅스 · 신세계 식품관/면세점 · 지하철 연결', y0: YB1 - 0.5, y1: CB, priority: 2 });
  K.zone({ poly: B1POLY.filter((p, i) => i >= 6 && i <= 16).concat([P(151, 38.5)]), name: '메가박스 센트럴', floor: 'B1', sub: '전관 부띠끄 M · 8개관 · 매표 · 매점', y0: YB1 - 0.5, y1: CB, priority: 2 });
  lzone(167.5, -89, 200, -10, { name: '메가박스 센트럴 상영관', floor: 'B1', sub: '1–8관 부띠끄 M', y0: YB1 - 0.5, y1: CB, priority: 3 });
  lzone(163, -94, 168.2, -26, { name: '호남선 하차장', floor: '1F', sub: '도착 · 택시 승강장 · 지하철 방면', y0: -0.5, y1: 4.4, priority: 3 });

  // ================================================================= spawns
  // yaw: facing local +s (south-ish) = R+π, -s = R, +t (east) = R+3π/2, -t (west) = R+π/2
  const YAW = { S: R + PI, N: R, E: R + 1.5 * PI, W: R + PI / 2 };
  const sp = (name, s, t, y, face) => { const [x, z] = P(s, t); K.spawn({ name, x, y, z, yaw: YAW[face] }); };
  sp('센트럴시티 정문 (신반포로)', -30, 19.5, 0, 'S');
  sp('호남선 대합실 · 매표소', 112, 20, 0, 'W');
  sp('호남선 승차홈 (8번)', bays.find(b => b.p === 8).s, 4.6, Y1 + 0.12, 'W');
  sp('파미에스테이션 B1', 60, 20.5, YB1, 'S');
  sp('메가박스 센트럴 로비 · 매점 (B1)', 176, 12, YB1, 'S');
  sp('메가박스 센트럴 5관 (상영관)', 188.4, -56.6, YB1 + 2.1, 'N');
  sp('호남선 하차장 · 택시 승강장', 167.5, -50, 0.15, 'N');
  sp('파미에스테이션 2F 식당가', 185, -30, Y2, 'E');
  K.spawn({ name: '센트럴시티 ↔ 고투몰 연결통로 (B1)', x: -140.9, y: YB1, z: -34.6, yaw: Math.atan2(18.2, 40.5) + PI });
  sp('센트럴시티 식당가 2F', 30, 25.2, Y2, 'S');
  sp('센트럴시티 옥상 주차장', 70, 16, YR, 'S');
  K.spawn({ name: '파미에스테이션 원형관 (스타벅스)', x: -47, y: 0, z: 195.6, yaw: PI });
}
