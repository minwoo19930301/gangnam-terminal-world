// 센트럴시티 — 호남선 고속버스터미널(센트럴시티터미널) · 파미에스테이션 · 메가박스 센트럴 · 옥상/타워 주차장
// Real OSM footprints: 356127040 (terminal complex, H9), 593858530 (파미에스테이션 원형관, 2F),
// 601356623 (타워주차장, H9), 1173096805 (버스 주차장 데크, layer 1), area 1173096801 (호남선 버스 주차장).
// The complex is a long low podium (1F terminal hall + 2F 식당가, 9 m) whose roof is a car deck with a one-way loop road
// (OSM service ways 593858534/536/537, layer 1) linked by bridges to the 타워주차장 and the yard deck (layer 2 roads).
//
// Local frame: the strip runs along OSM's west facade (-135.7,9.9)->(-80.7,150.7).
//   s = distance south along that facade, t = distance east (toward 신세계/JW). P(s,t) -> world [x,z].
//   strip:        s -22..151, t 0..38.5   (1F vaulted hall t6..23; 2F dining east of t23)
// Photo 11 / review supersede the round roof's unreliable OSM H8.4: two tiers and lantern to 22.6m, wall footprint unchanged.
//   south block:  s 151..204, t -98..38   (파미에스테이션 1F/2F, 하차장, 지하철 연결 B1)
export const meta = {
  id: 'centralcity',
  name: '센트럴시티 (호남선 터미널 · 파미에스테이션)',
  claims: [356127040, 593858530, 601356623, 1173096805],
  claimRoads: [593858534, 593858536, 593858537, 1128012726, 1128012724, 1185035520, 1065783056, 1185035521, 816395056, 1262591320],
  claimAreas: [1173096801],
  sources: [
    'refs/user_walk/20261107/manifest.json',
    'refs/user_walk/20261107/places.json',
    'refs/user_walk/20261107/IMG_0560.jpg', // user #526: primary ticket/well evidence (private)
    'refs/official/shinsegae/floor_B1.png',
    'refs/official/shinsegae/sweetpark_B1.png',
    'refs/official/shinsegae/hos_B1.png',
    'refs/official/centralcity/terminal_floor_1_ko.png',
    'refs/official/centralcity/terminal_floor_2.png',
    'refs/official/centralcity/famille_floor_1_ko_map.png',
    'refs/official/centralcity/famille_M1F.png',
    'refs/official/centralcity/famille_floor_2_ko_map.png',
    '.codex-jobs/evidence/walk_s7_central_famille.json',
    'refs/walk/s7_central_famille/FeFx7kfWgdo_181.jpg',
    'refs/walk/s7_central_famille/MMwnXpMqkZ0_65.jpg',
    'refs/walk/s5_ssg_b1/8xxIIvP9uAY_10.jpg',
    'refs/official/centralcity/terminal.html',
    'refs/official/centralcity/famille.html',
    'refs/official/shinsegae/hos_1F.jpg',
    'refs/official/shinsegae/hos_1M.jpg',
    'https://www.segye.com/newsView/20261105510641',
    'refs/aerial/famille_back.jpg',
    'refs/interior/famille_back/notes.json (location corrections in data/research/centralcity.json)',
    'refs/interior/famille_back/16_parking_entrance_booth_pine_sign.jpg',
    'refs/interior/famille_back/23_parking_fee_sign.jpg',
    'refs/interior/cc_hall/notes.json',
    'refs/interior/cc_famille/notes.json',
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
  K.texture('ccQuietMarble',256,256,(g,w,h)=>{
    g.fillStyle='#e7e7df';g.fillRect(0,0,w,h);
    // The trace7 floor read as woodgrain. Soft irregular mineral clouds and a few
    // branching diagonal veins replace the evenly spaced parallel waves.
    const marbleRand=K.rand(8038);
    for(let i=0;i<36;i++){
      const x=marbleRand()*w,y=marbleRand()*h,r=18+marbleRand()*64;
      const shade=g.createRadialGradient(x,y,1,x,y,r);
      shade.addColorStop(0,i%3?'rgba(151,166,155,.085)':'rgba(255,255,250,.34)');shade.addColorStop(1,'rgba(239,239,230,0)');
      g.fillStyle=shade;g.fillRect(x-r,y-r,r*2,r*2);
    }
    for(let i=0;i<5;i++){
      const x=-60+i*76,y=-25+marbleRand()*65;
      g.strokeStyle='rgba(117,142,133,.15)';g.lineWidth=.6+marbleRand()*1.1;
      g.beginPath();g.moveTo(x,y);g.bezierCurveTo(x+55,y+57,x+18,y+109,x+159,y+250);g.stroke();
      if(i%2){g.beginPath();g.moveTo(x+52,y+114);g.bezierCurveTo(x+78,y+129,x+116,y+140,x+153,y+165);g.stroke();}
    }
    g.strokeStyle='rgba(139,146,136,.16)';g.lineWidth=.6;g.strokeRect(0,0,w,h);
  },[1.2,1.2]);
  K.material('ccPolishedMarble', new K.THREE.MeshStandardMaterial({
    color: 0xf4f3ee, map: K.T.surface('ccQuietMarble').tex, roughness: 0.14, metalness: 0.04,
  }));
  const M = {
    hallFloor: { tex: 'ccPolishedMarble', scale: [1.2,1.2] }, b1Floor: { tex: 'tile', color: 0xc9b9a3 }, f2Floor: { tex: 'tile', color: 0xe2ddd3 },
    ceil: { tex: 'ceiling', color: 0xf4f2ee }, wallIn: 0xeeebe4, wallB1: 0xe4ddd0, part: 0xf3f0ea, dark: 0x2b2d30,
    // Aerial medium-grey yard: avoid multiplying the kit's near-black asphalt twice.
    steel: 0x6f767d, col: 0xe9ebe6, glass: 'glass', roof: 0xa9a7a0, asphalt: { tex: 'concrete', color: 0x9a9890, scale: [6,6] },
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

  // Round 5: observed interior materials, independent of the preserved exterior palette.
  const brickTexture=(key,colors,mortar)=>K.texture(key,256,128,(g,w,h)=>{
    g.fillStyle=mortar;g.fillRect(0,0,w,h);
    for(let row=0;row<8;row++)for(let col=-1;col<5;col++){
      g.fillStyle=colors[(row*3+col+9)%colors.length];g.fillRect(col*64+(row%2)*32+1,row*16+1,62,14);
    }
  },[1.04,.52]);
  brickTexture('ccFamBrick',['#b77b55','#be8259','#ab6d47','#c28a62'],'#ded1bb');
  brickTexture('ccFamBuffBrick',['#c3a17c','#c9a27a','#d6b08a','#c6a582'],'#e6dcc8');
  brickTexture('ccBackBrick',['#985c47','#a16b50','#89513e','#b17b5a'],'#b0a18d');
  brickTexture('ccWhiteBrick',['#e0ded5','#cdcfc6','#e8e5dc','#c4c8c0'],'#666b66');
  K.texture('ccGreyTile',256,128,(g,w,h)=>{
    g.fillStyle='#d1cdc6';g.fillRect(0,0,w,h);
    for(let row=0;row<4;row++)for(let col=-1;col<3;col++){
      g.fillStyle=['#d2cfc8','#ccc9c2','#d7d4cc'][(row+col+3)%3];g.fillRect(col*128+(row%2)*64+1,row*32+1,126,30);
    }
  },[1.2,1.2]);
  K.texture('ccBeigeTile',256,256,(g,w,h)=>{
    g.fillStyle='#ddd2bf';g.fillRect(0,0,w,h);
    for(let row=0;row<2;row++)for(let col=0;col<2;col++){
      g.fillStyle=['#e0d6c3','#d8ccb8','#e4dbca'][(row+col*2)%3];g.fillRect(col*128+1,row*128+1,126,126);
    }
  },[1.2,1.2]);
  K.texture('ccSmallCheck',128,128,(g,w,h)=>{g.fillStyle='#e8e4d9';g.fillRect(0,0,w,h);g.fillStyle='#373736';g.fillRect(0,0,w/2,h/2);g.fillRect(w/2,h/2,w/2,h/2);},[.9,.9]);
  K.texture('ccLinkMosaic',128,128,(g,w,h)=>{
    g.fillStyle='#888277';g.fillRect(0,0,w,h);
    for(let r=0;r<16;r++)for(let c=0;c<16;c++){g.fillStyle=['#a9a399','#b6b0a5','#8d887e','#c3bdb0'][(r*13+c*7)%4];g.fillRect(c*8+1,r*8+1,6,6);}
  },[1.2,1.2]);
  K.material('ccLinkMarble',new K.THREE.MeshStandardMaterial({map:K.T.surface('marble').tex,color:0xf1eadc,roughness:.24,metalness:.02}));
  K.material('ccDarkMarble',new K.THREE.MeshStandardMaterial({map:K.T.surface('marble').tex,color:0x47433d,roughness:.24,metalness:.04}));
  const SERIF='"Noto Serif KR","Batang","Times New Roman",serif';

  // ---------------------------------------------------------------- hole registry (slabs are laid last)
  const H = { b1: [], f1: [], f2: [], rf: [] };
  const honamWellR20=[[-71.7,100.8],[-66.2,114.8],[-62.5,113.3],[-68,99.3]];
  H.f1.push(honamWellR20);K.groundHole(honamWellR20);
  const hole = (levels, poly) => { for (const l of levels) H[l].push(poly); };
  // Register the separate HoS descent before hall finishes test their floor holes.
  const hosEntryLobby=RECT(72.1,28.5,80.1,38.2),hosEntryWell=RECT(74.35,16.4,77.65,28.5);
  hole(['f1'],hosEntryWell);K.groundHole(hosEntryWell);
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
    const lift = K.elevator({ name, x, z, rotY: F[face], w: 2.2, d: 2.2, floors, mat: 0xb4b8bc, doorMat: 0x9ca4ab });
    const hp = RECT(s - 1.15, t - 1.15, s + 1.15, t + 1.15); hole(levels, hp);
    return lift;
  }

  // Furnishings are collected by room; walls, floors and circulation remain eager.
  const hallTasks=[];
  const hallFurnish=fn=>hallTasks.push(fn);
  K.detail({floor:'1F',y0:0,y1:8.5,poly:RECT(-22,6,151,38.2),name:'호남선 대합실 · 승차문 · 매표 · 좌석'},()=>{for(const fn of hallTasks)fn();});
  const shopTasks=new Map();
  const shopFurnish=(y,fn)=>{
    if(!shopTasks.has(y)){
      const tasks=[];shopTasks.set(y,tasks);
      K.detail({floor:y===Y2||y===3.6?'1M':y<0?'B1':'1F',y0:y,y1:y+4.1,poly:TERM,name:y===Y2||y===3.6?'중층 매장 집기':'1F 동측 상점 집기'},()=>{for(const task of tasks)task();});
    }
    shopTasks.get(y).push(fn);
  };

  // ---------------------------------------------------------------- shop generator
  // row along axis 's' (depth along t) or 't' (depth along s). u0..u1 along the row, front at depth f, back at b.
  const BRAND = {
    '스타벅스': ['#00704a', '#ffffff'], '쉐이크쉑': ['#1b1b1b', '#ffffff'], '신한은행': ['#0046ff', '#ffffff'], '파리바게뜨': ['#14316b', '#ffffff'],
    '던킨': ['#ffffff', '#ff671f'], '아웃백 스테이크하우스': ['#4a1a10', '#f3e3c3'], '명동교자': ['#ffffff', '#b3261e'], '앤드테일 커피바': ['#1d1d1d', '#e8d8b0'],
    '리김밥': ['#ffd200', '#222222'], '소이연남': ['#f4efe6', '#1e5631'], '채선당 샤브보트': ['#2f7d32', '#ffffff'], '장터국수': ['#6b3f1d', '#ffffff'],
    '포브 FOURB': ['#f2ece0', '#3a2a1a'], '순대실록': ['#222222', '#ffffff'], '101번지 남산돈까스': ['#c62828', '#ffffff'], '르사이공': ['#0b6e4f', '#ffffff'],
    '우마이도': ['#111111', '#f5f5f5'], '스노우폭스': ['#24352c', '#ffffff'], '서대문 한옥집': ['#3e2723', '#ffecb3'], '홍대만뽀': ['#ffffff', '#111111'],
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
    shopFurnish(y,()=>{
    // fascia band + sign
    const fy = y + Math.min(h - 0.45, 3.55);
    const fp = pt(um, f + dv * 0.12);
    lbox(fp[0], fp[1], axis === 's' ? len - 0.1 : 0.2, axis === 's' ? 0.2 : len - 0.1, fy - 0.4, 0.8, 0x26282b, { solid: false });
    const col = BRAND[name] || KIND_COL[kind] || KIND_COL.food;
    const sp = pt(um, f + dv * 0.24);
    lsign(name, sp[0], sp[1], fy, Math.min(len - 0.6, o.famille?4.5:7.5), o.famille?.28:.66, face, { bg: o.famille?'#292b29':col[0], fg: o.famille?'#eee7d9':col[1], sub, pxPerM: 100 });
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
        lsign(o.famille?'메뉴':[name, ...menu], mp[0], mp[1], y + 2.95, Math.min(len - 1.2, o.famille?1.1:4.4), o.famille?.32:1.15, face, { bg: '#151515', fg: '#f5e6c8', pxPerM: 100, box: 0.05, boxMat: darkBrand });
        { const lp = ip(um, b + dv * 0.12); lbox(lp[0], lp[1], axis === 's' ? Math.min(len - 1.2, 4.4) : 0.05, axis === 's' ? 0.05 : Math.min(len - 1.2, 4.4), y + 2.3, 0.05, 'emit', { color: 0xfff1d0, solid: false }); }
      }
      // standing menu board outside the shop front
      if (!open && !o.noBoard && len > 5) { const ap = ip(u0 + 0.9, f + dv * 0.6); lsign([name, menuFor(name, kind)[0]], ap[0], ap[1], y + 0.75, 0.8, 1.0, face, { bg: '#262626', fg: '#ffffff', twoSided: true, pxPerM: 70 }); }
      // shop ceiling light panels
      const lp2 = ip(um, (f + b) / 2); lbox(lp2[0], lp2[1], axis === 's' ? Math.max(1, len - 3) : 0.6, axis === 's' ? 0.6 : Math.max(1, len - 3), y + h - 0.12, 0.05, 'emit', { color: 0xfff3dc, solid: false });
      const nT = Math.max(1, Math.floor((len - 1.5) / 2.4)), nV = o.tableRows??Math.max(1, Math.floor((dep - 3) / 2.4));
      for (let i = 0; i < nT; i++) for (let j = 0; j < nV; j++) {
        const u = u0 + 1.4 + i * (len - 2.8) / Math.max(1, nT - 1) * (nT > 1 ? 1 : 0) + (nT === 1 ? (len - 2.8) / 2 : 0);
        const v = b + dv * (2.6 + j * (o.tableRows?(dep-4.1)/Math.max(1,nV-1):2.4));
        if (Math.abs(v - f) < 1.1) continue;
        boxAt(u,v,.8,.8,y+.70,.055,pal.top);
        for(const du of [-.29,.29])for(const dv3 of [-.29,.29])boxAt(u+du,v+dv3,.045,.045,y,.70,pal.leg,{solid:false});
        for(const du of [-.21,.21]){
          const pp=ip(u+du,v);lcyl(pp[0],pp[1],y+.758,.13,.018,0xece8df,{solid:false,seg:12});
          const cp=ip(u+du,v+.22);lcyl(cp[0],cp[1],y+.758,.045,.10,0xd6d3c9,{solid:false,seg:8});
          boxAt(u+du+.14,v,.018,.26,y+.763,.009,0xc6b79b,{solid:false});
        }
        for (const du of [-0.62, 0.62]) { boxAt(u + du, v, 0.42, 0.42, y, 0.45, pal.chair, { solid: false }); boxAt(u + du * 1.3, v, 0.08, 0.42, y + 0.45, 0.42, pal.chair, { solid: false }); }
        if (dep > 4 && R2() < 0.6) { const pp = ip(u, v); lbox(pp[0], pp[1], 0.3, 0.3, y + 2.15, 0.18, 'emit', { color: 0xffd9a0, solid: false }); }
        if (R2() < 0.45) { const p = ip(u + 0.62, v); K.person(p[0], y, p[1], { sit: true, rotY: R + (axis === 's' ? 0 : PI / 2) }); }
      }
    } else if (kind === 'store' || kind === 'flower' || kind === 'beauty') {
      boxAt(um, vAt(0), len - 1.2, 0.5, y, 1.9, kind === 'beauty' ? 0xf0e6e0 : 0xd9d2c4);
      if (kind === 'flower') for (let i = 0; i < Math.floor(len / 0.7); i++) {
        const p = ip(u0 + 0.5 + i * 0.7, f - dv * 0.6),q=P(...p);
        lcyl(p[0],p[1],y,.18,.35,0x7d7a73,{solid:false});
        for(const [dx,dz] of [[-.08,0],[.08,.04],[0,-.08]]){
          K.dome({x:q[0]+dx,z:q[1]+dz,y:y+.37,rx:.12,ry:.24,rz:.12,mat:0x4a7044,seg:6,rings:3});
          K.dome({x:q[0]+dx,z:q[1]+dz,y:y+.55,rx:.09,ry:.08,rz:.09,mat:[0xe6a0b3,0xe9d9df,0xb96f8a][i%3],seg:6,rings:2});
        }
      }
      else if (kind === 'beauty') { boxAt(um - len * 0.2, vAt(0.5), 1.2, 0.7, y, 0.75, 0xffffff); boxAt(um + len * 0.2, vAt(0.5), 0.6, 0.6, y, 1.1, 0x222222); }
      else boxAt(um, vAt(0.55), Math.max(1, len - 4), 1.0, y, 0.9, 0xb9a88f);
    } else if (kind === 'bank') {
      for (let i = 0; i < Math.floor((len - 1) / 1.3); i++) { const u = u0 + 1.0 + i * 1.3; boxAt(u, vAt(0), 0.9, 0.7, y, 1.75, 0x4b5a6a); const p = ip(u, vAt(0) + dv * 0.37); lbox(p[0], p[1], axis === 's' ? 0.55 : 0.02, axis === 's' ? 0.02 : 0.55, y + 1.05, 0.38, 'emit', { color: 0x8fc7ff, solid: false }); }
    }
    });
  }
  // generic B1 stall: open counter front, menu board, two stools
  function stall(o) { shop({ ...o, open: true, h: 3.6 }); }

  // ================================================================= 1F — 호남선 터미널 (strip)
  // cc_hall05/13/14 show numbered red gateways 13/1/11; older photos show 2–5/12.
  // Round20 #513–#527: 6/8/10/12 increase SSE; gate10 lies at s≈110.
  // The north four reviewed gateways keep their positions; intervening pitches are inferred.
  const BOARDING_DOORS = [-3,9,21,33,50,62,74,86,98,110,122,134,146].map((s,i)=>({p:i+1,s}));
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
  const TICKET = {s0:86.5,s1:101.5};
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
    for(const upper of [0,.8])hallCurve(u=>pt(u,upper),n,0.18);
    for(let i=0;i<n;i++){hallTube(pt(i/n,(i%2)*.8),pt((i+1)/n,(1-i%2)*.8),0.10);hallTube(pt(i/n),pt(i/n,.8),0.08);}
  };

  // ---- vertical circulation (strip)
  escPair(-1, 9.5, 17.4, YB1, Y1, 'f1', true);          // E1 north: B1 ↔ 1F (신반포로 입구 홀)
  escPair(34, 44.5, 17.4, YB1, Y1, 'f1', true);           // E2: inferred mid-hall position, clear of the photographed ticket frontage; B1 landing stays in t13..22 link
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
  // Door-front basement/upper flights were unsupported by either official 1F plan; removed.
  // Existing B1 access remains at the two documented hall cores and the south block core.
  flight(142.2, 148.9, 32.5, Y2, YR, 'rf');

  rail(142, 31.3, 148.9, 31.3, YR); rail(142, 33.7, 148.9, 33.7, YR); rail(142, 31.3, 142, 33.7, YR);
  const ELEV_FLOORS = [{ label: 'B1', y: YB1, name: '메가박스 · 신세계 · 지하철 연결' }, { label: '1F', y: Y1, name: '호남선 터미널 · 매표소' }, { label: '1M', y: Y2, name: '센트럴시티 중층 식당가' }, { label: 'R', y: YR, name: '옥상 주차장' }];
  elev('센트럴시티 터미널 엘리베이터', 14.5, 36.7, 'W', ELEV_FLOORS, ['b1', 'f1', 'f2', 'rf']);
  // Round11: the previous s21,t37.3 shaft stood in the J4 doorway.
  // The complete B1/1F/1M/R bank now occupies a wall-side niche north of the passage.
  lsign('엘리베이터 · 전층 안내',14.5,35.4,3.2,3.6,.45,'W',{bg:'#403b33',fg:'#fff5df'});
  // stair house + elevator penthouse on the roof
  lwall(140.6, 30.8, 151.4, 30.8, YR, YR + 3, { mat: 0xd0ccc4 }); lwall(140.6, 37.4, 151.4, 37.4, YR, YR + 3, { mat: 0xd0ccc4 });
  lwall(140.6, 30.8, 140.6, 37.4, YR, YR + 3, { mat: 0xd0ccc4 }); lwall(151.4, 30.8, 151.4, 37.4, YR, YR + 3, { mat: 0xd0ccc4, openings: [{ at: 1.9, w: 2.4, y0: YR, y1: YR + 2.4 }] });
  lbox(146, 34.1, 11, 6.8, YR + 3, 0.25, 0xbab6ae, { solid: false });
  lsign('계단 · 1F 터미널 · B1', 151.5, 34.1, YR + 2.65, 3.6, 0.45, 'S', { bg: '#1d3557', fg: '#fff' });

  // ---- 2026 cc_hall 01–16: red gate drums, clock/LED heads and the lived-in waiting hall.
  // Drawing the inner lining separately keeps the earlier road-view boarding elevation intact.
  K.texture('ccHallVent',64,64,(g,w,h)=>{
    g.fillStyle='#bcbcb0';g.fillRect(0,0,w,h);
    g.fillStyle='#e3e2d4';g.beginPath();g.arc(w/2,h/2,w*.47,0,2*PI);g.fill();
    g.fillStyle='#5d625c';g.beginPath();g.arc(w/2,h/2,w*.33,0,2*PI);g.fill();
    g.fillStyle='#161c1c';g.beginPath();g.arc(w/2,h/2,w*.23,0,2*PI);g.fill();
  },[1,1]);
  K.texture('ccHallClock',256,256,(g,w,h)=>{
    g.fillStyle='#302b49';g.fillRect(0,0,w,h);g.strokeStyle='#c4ac9a';g.lineWidth=4;
    g.beginPath();g.arc(w/2,h/2,w*.43,0,2*PI);g.stroke();
    for(let i=0;i<60;i++){const a=i*PI/30,r=i%5===0?.34:.38;g.lineWidth=i%5===0?3:1;g.beginPath();g.moveTo(w/2+Math.sin(a)*w*r,h/2-Math.cos(a)*h*r);g.lineTo(w/2+Math.sin(a)*w*.41,h/2-Math.cos(a)*h*.41);g.stroke();}
    g.lineWidth=5;g.beginPath();g.moveTo(w*.5,h*.5);g.lineTo(w*.65,h*.28);g.moveTo(w*.5,h*.5);g.lineTo(w*.25,h*.45);g.stroke();
    g.fillStyle='#e5d1b5';g.beginPath();g.arc(w*.5,h*.5,4,0,2*PI);g.fill();
  },[1,1]);
  K.texture('ccHallBrick',256,128,(g,w,h)=>{
    g.fillStyle='#c9b79c';g.fillRect(0,0,w,h);
    for(let row=0;row<8;row++)for(let col=-1;col<8;col++){
      g.fillStyle=['#a56f4d','#af7855','#b47e58','#a76d4b'][(row+col+9)%4];
      g.fillRect(col*36+(row%2)*18+1,row*16+1,34,14);
    }
  },[2.16,.96]);
  const hallFace=(mat,s,t,y,w,h,face='E')=>{
    const r=F[face],n=[Math.sin(r),0,Math.cos(r)],u=[Math.cos(r),0,-Math.sin(r)],[x,z]=P(s,t);
    K.quad(mat,[[x-u[0]*w/2,y-h/2,z-u[2]*w/2],[x+u[0]*w/2,y-h/2,z+u[2]*w/2],[x+u[0]*w/2,y+h/2,z+u[2]*w/2],[x-u[0]*w/2,y+h/2,z-u[2]*w/2]],n);
  };
  const hallClock=(s,t,y,size,face='E')=>hallFace('ccHallClock',s,t,y,size,size,face);
  const hallBoard=(s,t,y,w,h,face='E')=>{
    lbox(s,t,w,.12,y-h/2,h,0x14181b,{solid:false});
    hallFace({tex:'emit',color:0x153b79},s,t+(face==='E'?.08:-.08),y,w-.12,h-.12,face);
    lsign('버스도착안내',s,t+(face==='E'?.10:-.10),y+h*.36,w-.25,.22,face,{bg:'#151b28',fg:'#ffffff'});
    // Destinations are supported by the research; narrow blank columns stand for unreadable live data.
    for(let row=0;row<5;row++){
      const yy=y+h*.16-row*h*.14;
      lsign(DESTINATIONS[row],s+w*.32,t+(face==='E'?.11:-.11),yy,w*.22,h*.11,face,{bg:null,fg:'#f1f5fb',bold:false});
      for(let col=0;col<4;col++)hallFace({tex:'emit',color:row%2?0x5887b8:0x85a8c7},s+w*.08-col*w*.16,t+(face==='E'?.12:-.12),yy,w*.09,.022,face);
    }
  };
  {
    const glassOps=bays.map(bb=>({at:bb.s+10,w:3.2,y0:0,y1:2.8}));
    // Shopfront glazing is retained only below the opaque transom and in the clerestory.
    lwall(-10,6,149,6,0,4.5,{mat:'glass',thick:.04,openings:glassOps});
    lwall(-10,6,149,6,4.5,6,{mat:0xe9e6de,thick:.16});
    lwall(-10,6,149,6,6,HALL_CROWN,{mat:'glass',thick:.04});
    lwall(-10,.3,-10,6,0,HALL_CROWN,{mat:'ccBand',thick:.3});
    lwall(149,6,149.6,.6,0,HALL_CROWN,{mat:0xd7d2c8,thick:.3});
    for(const bb of bays){
      const sc=bb.s,width=6.6;
      lwall(sc-width/2,6,sc+width/2,6,0,4.5,{mat:'ccRed',thick:.16,openings:[{at:width/2,w:3.2,y0:0,y1:2.8}]});
      hallFurnish(()=>{
      // 13/14: curved red cheeks, small round vents and open sliding-door leaves.
      for(const ds of [-2.45,2.45])for(let j=0;j<8;j++){
        const a=-PI/2+j*PI/8,b=-PI/2+(j+1)*PI/8;
        const at=(q,y)=>{const[x,z]=P(sc+ds+.78*Math.sin(q),6.15+.48*Math.cos(q));return[x,y,z];};
        const m=(a+b)/2;
        for(const [y0,y1] of [[.10,1.12],[1.14,2.20],[2.22,3.14]])K.quad(0xb82035,[at(a,y0),at(b,y0),at(b,y1),at(a,y1)],[AX*Math.sin(m)+EX*Math.cos(m),0,AZ*Math.sin(m)+EZ*Math.cos(m)]);
      }
      lbox(sc,6.38,6.5,.35,2.84,.55,0xa62a36,{solid:false});
      for(let ds=-2.8;ds<=2.81;ds+=.7)hallFace('ccHallVent',sc+ds,6.575,3.10,.27,.27);
      for(const ds of [-1.65,1.65]){
        lbox(sc+ds,6.12,.1,.12,0,2.9,0xc9ccce,{solid:false});
        lwall(sc+ds,6.18,sc+ds,7.15,0,2.7,{mat:'glass',thick:.035,solid:false});
      }
      lbox(sc,6.13,3.4,.14,2.8,.12,0xc9ccce,{solid:false});
      // The low northern lobby (photo21) has smaller heads; gate1 remains in the vaulted bay (photo13).
      const lowLobby=sc>=3&&sc<27,headH=lowLobby?1.6:3.3,cy=3.45+headH/2;
      lbox(sc,6.47,8.8,.18,3.45,headH,0x111418,{solid:false});
      lsign(['GATE',String(bb.p)],sc+3.35,6.58,cy+headH*.23,1.8,lowLobby?.63:1.13,'E',{bg:null,fg:'#ffffff',pxPerM:100});
      hallClock(sc+3.35,6.585,cy-headH*.22,lowLobby?.70:1.5);
      const ad=bb.p===11?['Trip.com','인스파이어 리조트','트립닷컴 국내호텔 특가']:bb.p===1?['창업의 시작','창업기업 지원 · 신용보증기금']:bb.p%3===0?['SHINSEGAE CENTRAL','센트럴시티']:['창업의 시작','창업기업 지원 · 신용보증기금'];
      // HgbY_flKpMI_16: gate 4 has a compact blue terminal name and a red
      // number plate. Its navy advertising head is absent in this dated frame.
      if(bb.p===4){
        lbox(sc,6.60,6.4,.05,3.43,1.65,0xb82035,{solid:false});
        lsign('호남선 고속터미널',sc-.5,6.66,3.76,4.9,.43,'E',{bg:'#206ea4',fg:'#ffffff',pxPerM:140});
        lsign('4',sc+2.38,6.68,4.48,.74,.94,'E',{bg:'#b32635',fg:'#fff0e6',pxPerM:140});
      }else lsign(ad,sc-1,6.58,cy,6.4,headH-.18,'E',{bg:bb.p===11?'#153383':bb.p%3===0?'#171c24':'#103244',fg:'#f3fafb',pxPerM:85});
      lsign('비상구',sc,6.61,2.62,.72,.2,'E',{bg:'#20743c',fg:'#ffffff'});
      });
    }
    // Photo01: low slatted platform canopy, granite piers and two-sided suspended blue numbers.
    const platformRoof=RECT(-10,-1.5,149,6);
    K.hpoly({tex:'metal',color:0x5d6166},platformRoof,5.2,false);K.phys.addCeiling(platformRoof,5.2,{});
    for(let ss=-9;ss<149;ss+=1.8)lbox(ss,2.25,.045,4.6,5.16,.025,{tex:'emit',color:0xf2f4f0},{solid:false});
    // Round 8 / photo01: closely spaced metal seams, granite caps and a glazed
    // boarding elevation remain visible along the platform instead of a blank opening.
    for(let ss=-9.8;ss<149;ss+=.32)lbox(ss,2.25,.017,7.35,5.145,.018,0x454b50,{solid:false});
    for(let ss=-4;ss<149;ss+=6)lcyl(ss,2.4,5.10,.13,.035,0xebe8db,{solid:false});
    for(const bb of bays){
      lbox(bb.s,4.5,4.0,3,0,.12,M.platform);
      if(bb.s+6<149){
        lbox(bb.s+6,.6,1.1,1.1,0,5.2,'ccStone');
        lbox(bb.s+6,.6,1.16,1.16,5.02,.18,0xc5bcb1,{solid:false});
        for(const yy of [1.1,2.2,3.3,4.4])lbox(bb.s+6,.6,1.115,1.115,yy,.018,0x8a8178,{solid:false});
      }
      hallFurnish(()=>{
        // Photo01: open sliding leaves, stainless sill and door handles; the full
        // central 3.2 m walking aperture stays unobstructed.
        for(const side of [-1,1]){
          lbox(bb.s+side*1.87,5.87,.07,.08,.12,2.56,0xa8b0b1,{solid:false});
          lbox(bb.s+side*2.35,5.87,.86,.07,1.02,.055,0xa8b0b1,{solid:false});
          hallTube([bb.s+side*1.84,5.82,.93],[bb.s+side*1.84,5.82,1.62],.032,0xcbd0ce);
        }
        lbox(bb.s,5.88,3.26,.13,.075,.018,0xc6c8c3,{solid:false});
        lsign('승차장',bb.s+2.30,5.80,2.28,.77,.20,'W',{bg:'#80343a',fg:'#f5eee7',pxPerM:100});
      });
      lbox(bb.s-1.5,3.2,.12,.7,3.5,.9,0x1b3b8f,{solid:false});
      for(const tt of [2.96,3.44])hallTube([bb.s-1.5,tt,4.4],[bb.s-1.5,tt,5.2],.035,0x535a61);
      lsign(String(bb.p),bb.s-1.58,3.2,3.95,.6,.72,'N',{bg:'#1b3b8f',fg:'#fff',twoSided:true,offset:.02,pxPerM:100});
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
  // Round20: the complete ticket-counter ensemble is relocated by honamR20().
  // ---- 05/06/15: long granite seating ledges, dense planted beds and hanging bell lanterns.
  const hallLamp=(s,t)=>{
    lcyl(s,t,0,.13,3.85,0x222826);lcyl(s,t,0,.25,.15,0x222826,{solid:false});
    for(const dir of [-1,1]){
      hallCurve(u=>[s+dir*.72*u,t,3.55+.45*Math.sin(u*PI*.85)],7,.065,0x222826);
      hallTube([s+dir*.72,t,3.75],[s+dir*.72,t,3.56],.045,0x222826);
      const[x,z]=P(s+dir*.72,t);
      K.dome({x,z,y:3.48,rx:.24,ry:.18,rz:.24,seg:10,rings:4,mat:0x222826});
      lcyl(s+dir*.72,t,3.38,.15,.10,{tex:'emit',color:0xffe2a8},{solid:false});
    }
  };
  // Kiosk rear partitions must exist before any lazy furnishings are loaded.
  for(let i=0;i<bays.length-1;i++)lwall(bays[i].s+3.3,6.28,bays[i+1].s-3.3,6.28,0,4.5,{mat:0xb62432,thick:.16});
  hallFurnish(()=>{
    let i=0;
    for(let ss=8;ss<=140;ss+=12){
      // Keep ticket frontage and relocated E2 well/landing clear of bed and foliage.
      if((ss>=82&&ss<=106)||(ss>=40&&ss<=78)||ss===32||ss===44)continue;
      const t=15.8;
      lbox(ss,t,8.5,2.6,0,.45,{tex:'darkstone',color:0x4c4f50},{top:0x555958});
      lbox(ss,t,7.6,1.65,.45,.30,0x42473d,{top:0x3f4f30});
      for(const ds of [-2.5,2.5]){const[x,z]=P(ss+ds,t);K.tree(x,z,{y:.75,h:ss<38?4.5:4.9+(i%2)*.5,kind:'zelkova'});}
      for(let k=0;k<6;k++){
        const bs=ss-3+k*1.2,bt=t+(k%2?.42:-.42),h=.8+(k%3)*.25;
        lcyl(bs,bt,.75,.35+(k%3)*.07,h,k%2?0x3e6b37:0x2f5a2e,{solid:false,seg:7});
        const[x,z]=P(bs,bt);K.dome({x,z,y:1.1+h*.3,rx:.55,ry:.25,rz:.35,seg:8,rings:3,mat:0x3a6738});
      }
      for(const side of [-1,1])for(let k=0;k<6;k++)if((k+i)%4!==0)lperson(ss-3.3+k*1.3,t+side*1.15,0,{sit:true,shirt:[0x222b34,0xe6e2d7,0x67674c,0x8e725f][(k+i)%4]});
      if(i%2===0)hallLamp(ss+4.7,t);
      i++;
    }
    // The spaces between drums are continuous red kiosks, not views onto the apron.
    for(let i=0;i<bays.length-1;i++){
      const a=bays[i].s+3.3,b=bays[i+1].s-3.3,ss=(a+b)/2,w=b-a;
      const kw=Math.min(w,5.4),kc=bays[i].s+6;
      lbox(kc,7.15,kw,1.9,0,.78,0xb62432,{top:0xd0c8bb});
      lbox(kc,7.15,kw,2,2.8,.6,0xb62432,{solid:false});
      for(const edge of [-1,1])lbox(kc+edge*(kw/2-.07),7.15,.14,1.9,.78,2.02,0xb62432,{solid:false});
      lwall(kc-kw/2+.15,8.12,kc+kw/2-.15,8.12,.78,2.8,{mat:'glass',thick:.035,solid:false});
      for(const ds of [-.65,.65])lbox(kc+ds,8.16,.045,.05,.8,2,0x4d5553,{solid:false});
      const emart=false,label=i%3===0?'무인발권기':'편의점'; // Round20: emart24 is the photographed island, not these unassigned gate kiosks.
      lsign(label,kc,8.19,3.10,kw-.35,.44,'E',{bg:emart?'#2a2a2a':'#eee9dc',fg:emart?'#ffffff':'#942b32',pxPerM:90});
      if(emart)lbox(kc,8.2,kw-.2,.025,2.80,.10,0xf39a1e,{solid:false});
      for(let k=0;k<9;k++)lbox(kc-kw*.4+k*kw*.09,7.6,.25,.3,.8,.16,[0xc5ac6e,0x8fa899,0x986d64][k%3],{solid:false});
      // Fine shop fittings make the glass read as a lit occupied kiosk.
      for(const yy of [1.25,1.82]){
        lbox(kc,6.65,kw-.48,.30,yy,.045,0xd2c4ad,{solid:false});
        for(let k=0;k<10;k++)lbox(kc-kw*.39+k*kw*.077,6.70,.17,.13,yy+.045,.17+(k%3)*.05,[0xd5ba84,0x7eaa9f,0xb98077,0xd4d2be][k%4],{solid:false});
      }
      lbox(kc,7.2,kw-.4,.45,2.76,.035,{tex:'emit',color:0xffe3b0},{solid:false});
      lbox(kc-kw*.29,7.88,.40,.18,.83,.32,0x303b40,{solid:false});
      hallFace({tex:'emit',color:0x789cb0},kc-kw*.29,7.99,1.03,.32,.19);
      for(const ds of [-kw*.42,kw*.42])lbox(kc+ds,8.19,.018,.025,.83,1.91,0xb9bbb3,{solid:false});
      if(i===9){
        lsign('●',kc+1.5,8.22,2.15,.7,.7,'E',{bg:null,fg:'#c92937',pxPerM:140,padding:0});
        lsign('Lotto',kc+1.5,8.25,2.15,.55,.18,'E',{bg:null,fg:'#ffffff',pxPerM:160});
      }
      void ss;
    }
    lbox(4,21,2.4,5,0,1.05,0xf4f1ea,{top:0x2b2d30});
    lsign(['종합안내','센트럴시티터미널'],4,21,3.6,4.6,.9,'N',{bg:'#4c443a',fg:'#fff',twoSided:true});
    lperson(5.6,20.2,0,{shirt:0x1d3557});
    const DIR=['층별 안내','R  옥상 주차장','1M  센트럴시티 중층 식당가','1F  호남선 터미널','B1  지하철 · 신세계'];
    for(const ss of [-7,40.5,78.5])lsign(DIR,ss,19.91,2.3,1.03,1.55,'W',{bg:'#2b2b2d',fg:'#ffffff',box:.035,boxMat:0x292a2a,align:'left',bold:false,pxPerM:140});
    lsign(['지하철 3·7·9호선 · 메가박스','↓ 지하 1층  고투몰 · 신세계'],45.5,18.15,3.3,4.4,.75,'S',{bg:'#514c43',fg:'#ffffff'});
    lsign(['지하철 · 고투몰 ↓','지하 1층 연결통로'],10.2,18.15,3.3,4.2,.75,'S',{bg:'#514c43',fg:'#ffffff'});
    lsign(['중층 센트럴시티 식당가 ↑','승차홈 · 매표소'],49,24.75,3.3,4.4,.75,'S',{bg:'#514c43',fg:'#ffffff'});
  });
  // Round 7 / cc_hall22: the sculpture bench is the landmark in front of gate 4.
  // Photo shows one standing figure and four seated/cropped figures; no identity is inferred.
  K.material('ccBenchBronze',new K.THREE.MeshStandardMaterial({color:0x897144,metalness:.72,roughness:.42}));
  hallFurnish(()=>{
    const bronze='ccBenchBronze';
    const ell=(s,t,y,rx,ry,rz,mat=bronze)=>{const[x,z]=P(s,t);K.dome({x,z,y,rx,ry,rz,mat,hemi:false,seg:12,rings:8});};
    const limb=(a,b,d)=>hallTube(a,b,d,bronze);
    // Round19: preserve the complete sculpture/coloured seating ensemble in
    // the gate-4 gallery pocket, 7 m east of the clear filmed boarding aisle.
    for(let k=0;k<22;k++){
      const a=-3.6+k*7.2/22,b=-3.6+(k+1)*7.2/22;
      const poly=[P(33+a,24.0+.065*a*a),P(33+b,24.0+.065*b*b),P(33+b,24.62+.065*b*b),P(33+a,24.62+.065*a*a)];
      K.prism(poly,.48,.59,{mat:bronze,solid:false});
    }
    for(const ds of [-3,-1,1,3])lcyl(33+ds,24.3+.065*ds*ds,0,.065,.48,bronze,{solid:false});
    const figure=(ss,tt,standing=false,back=false)=>{
      const dir=back?-1:1,hip=standing?.90:.71,neck=standing?1.49:1.24;
      ell(ss,tt,hip+.24,.235,.34,.145);ell(ss,tt,neck+.19,.15,.20,.16);
      ell(ss,tt-dir*.025,neck+.28,.157,.12,.15,0x665337);
      ell(ss,tt+dir*.15,neck+.18,.035,.043,.045);
      // Subtle cheeks, ears and coat folds retain the full-size bronze silhouettes
      // but avoid the smooth toy-like heads in the round-7 comparison.
      for(const side of [-1,1]){
        ell(ss+side*.145,tt,neck+.17,.035,.065,.045);
        limb([ss+side*.16,tt+dir*.14,hip+.32],[ss+side*.20,tt+dir*.17,hip+.03],.018);
        limb([ss+side*.075,tt+dir*.155,neck+.23],[ss+side*.035,tt+dir*.17,neck+.22],.012);
      }
      limb([ss-.05,tt+dir*.16,neck+.10],[ss+.05,tt+dir*.16,neck+.10],.012);
      lcyl(ss,tt,neck-.06,.075,.14,bronze,{solid:false});
      for(const side of [-1,1]){
        const kneeT=tt+dir*(standing?.04:.42),kneeY=standing?.52:.52;
        limb([ss+side*.105,tt,hip],[ss+side*.15,kneeT,kneeY],.19);
        limb([ss+side*.15,kneeT,kneeY],[ss+side*.16,kneeT+dir*.08,.12],.13);
        ell(ss+side*.16,kneeT+dir*.17,.09,.11,.075,.21);
        limb([ss+side*.22,tt,neck-.07],[ss+side*.29,tt+dir*.08,hip+.12],.12);
        limb([ss+side*.29,tt+dir*.08,hip+.12],[ss+side*.19,tt+dir*.30,hip+.05],.095);
        ell(ss+side*.19,tt+dir*.30,hip+.05,.065,.045,.09);
      }
      // Lapels and restrained raised seams catch highlights on the bronze clothing.
      for(const side of [-1,1])limb([ss+side*.15,tt+dir*.14,neck-.04],[ss+side*.03,tt+dir*.16,hip+.16],.025);
    };
    figure(30.4,24.7,false,true);figure(32,24.13,false,true);
    figure(34,23.45,true,true);figure(35.2,24.5);figure(36.05,24.83);
    for(const [ss,tt,color] of [[31,22.35,0xe47c24],[34.4,22.35,0x83b627],[37.1,23.4,0x8db938]]){
      lbox(ss,tt,2.4,1.15,0,.44,color,{top:color});
      lbox(ss,tt-.4,2.4,.32,.44,.45,color,{solid:false});
      lperson(ss-.3,tt+.36,0,{sit:true,shirt:ss<32?0x34434d:0x333f33,rotY:F.E});
    }
    // cc_hall05/23: perforated metal four-seat rows, open legs and arm rests.
    for(const ss of [73,119,132]){
      lbox(ss,18.65,2.8,.09,.32,.10,0x62696b,{solid:false});
      for(const ds of [-1.12,1.12]){lbox(ss+ds,18.65,.08,.55,0,.36,0x60666a,{solid:false});}
      for(let n=0;n<4;n++){
        const seatS=ss-.99+n*.66;
        lbox(seatS,18.65,.58,.49,.43,.055,0xb2b8b7,{solid:false});
        lbox(seatS,18.40,.58,.055,.48,.46,0x989f9e,{solid:false});
        for(let row=0;row<4;row++)for(let col=0;col<6;col++)hallFace(0x50585a,seatS-.23+col*.09,18.435,.56+row*.09,.018,.022,'E');
        for(const d of [-.3,.3]){hallTube([seatS+d,18.4,.65],[seatS+d,18.9,.65],.038,0xbcc3c2);}
        if(n%3===0)lperson(seatS,18.73,0,{sit:true,rotY:F.E,shirt:0x4d535b});
      }
    }
    // cc_hall23: mustard fascia, scalloped striped awning, ribbed burgundy plinth.
    const ks=113,kt=16; // official unit28, at the far boarding-side end
    lbox(ks,kt,3.15,2.55,0,.94,0x703b2e,{top:0xe1d2aa});
    lbox(ks,kt-1.18,3.15,.15,.94,1.93,0xbf8c2b);
    for(const ds of [-1.49,1.49])lbox(ks+ds,kt,.18,2.55,.94,1.93,0xc89531);
    lbox(ks,kt,3.35,2.75,2.58,.74,0xc3932e,{solid:false});
    for(let ds=-1.45;ds<=1.45;ds+=.085)lbox(ks+ds,kt+1.29,.035,.035,.07,.82,0x4e2e28,{solid:false});
    for(let n=0;n<13;n++){
      const ss=ks-1.48+n*.247,color=n%2?0xe5cf9b:0x705239;
      const a=P(ss-.12,kt+1.36),b=P(ss+.12,kt+1.36),c=P(ss+.12,kt+1.69),d=P(ss-.12,kt+1.69);
      K.quad(color,[[a[0],2.57,a[1]],[b[0],2.57,b[1]],[c[0],2.22,c[1]],[d[0],2.22,d[1]]],[EX,.7,EZ]);
      ell(ss,kt+1.69,2.22,.115,.09,.015,color);
    }
    lsign('팥붕슈붕',ks,kt+1.40,2.96,2.7,.48,'E',{bg:null,fg:'#fff6df',pxPerM:140});
    lbox(ks,kt+.55,2.65,1.05,.95,.05,0xe9ddbf,{solid:false});
    lbox(ks-.75,kt+.8,.4,.28,1,.3,0x272e30,{solid:false});
    hallFace({tex:'emit',color:0x185ca7},ks-.75,kt+.96,1.19,.30,.2);
    for(const ds of [.2,.8]){
      lbox(ks+ds,kt+.05,.5,.65,1,.12,0xc5c5b6,{solid:false});
      for(let q=0;q<4;q++)ell(ks+ds-.15+q*.10,kt+.1,1.14,.04,.026,.10,0xc48a44);
    }
    for(const [ds,dt]of[[1.7,1.35],[-1.6,1.2]])lcyl(ks+ds,kt+dt,0,.08,.24,0xe4e1d8,{solid:false});
    lsign(['팥붕슈붕','따뜻한 붕어빵'],ks+1.60,kt,1.7,1.6,.7,'S',{bg:'#ede0c0',fg:'#693c2d',box:.035});
    lperson(ks+.3,kt-.7,0,{shirt:0xe8d4b0,rotY:F.E});
    // Photo23: the oblique side has a cream menu wrap, ribbed lower panels,
    // preparation trays and a low leaning menu board beside the little kiosk.
    lbox(ks+1.59,kt,.035,2.28,.98,1.48,0xeee0c4,{solid:false});
    lsign(['팥붕슈붕','따뜻한 붕어빵'],ks+1.62,kt,1.85,1.75,.72,'S',{bg:null,fg:'#704439',pxPerM:110});
    for(let tt=kt-1.05;tt<kt+1.08;tt+=.12)lbox(ks+1.60,tt,.035,.04,.07,.82,0x4e2e28,{solid:false});
    for(const ds of [-.2,.35,.8]){
      lcyl(ks+ds,kt-.65,1.02,.07,.21,0xd7cfb8,{solid:false});
      for(let n=0;n<3;n++)hallTube([ks+ds+.025*n,kt-.65,1.22],[ks+ds+.025*n,kt-.65,1.39],.012,0x655143);
    }
    lwall(ks-.25,kt+1.06,ks+1.25,kt+1.06,1.02,1.44,{mat:'glass',thick:.018,solid:false});
    for(const ds of [-.25,1.25])lbox(ks+ds,kt+1.07,.025,.025,1.02,.44,0xb4a58c,{solid:false});
    lbox(ks+2.02,kt+.30,.52,.08,.03,1.05,0xd9cdb2,{solid:false});
    lsign(['팥붕슈붕','붕어빵'],ks+2.02,kt+.355,.63,.43,.73,'E',{bg:'#e8dbc0',fg:'#795443',pxPerM:120});
    lbox(ks+2.02,kt+.30,.65,.48,.015,.035,0x8b7b64,{solid:false});
    // Ticket machines are modelled as four independent terminals, not a painted kiosk wall.
    for(let n=0;n<4;n++){
      const ss=38.1+n*.86;
      lbox(ss,8.65,.58,.47,0,1.64,0xdfe2dc,{top:0xb4bcb8});
      hallFace(0x27343e,ss,8.90,1.22,.44,.57);
      hallFace({tex:'emit',color:0xa2c4de},ss,8.914,1.25,.36,.43);
      lsign('승차권 발매',ss,8.93,1.73,.68,.16,'E',{bg:'#1f4666',fg:'#ffffff',pxPerM:100});
      for(const yy of [1.32,1.20,1.08])hallFace(0xe8eef0,ss,8.93,yy,.27,.04);
      lbox(ss,8.92,.29,.04,.67,.05,0x263132,{solid:false});
      lbox(ss+.19,8.93,.06,.04,.91,.12,0x384b49,{solid:false});
    }
    // Luggage sits beside passengers, keeping both continuous walking aisles clear.
    for(const [ss,tt,col]of[[19,17.7,0x606a77],[70,17.6,0x9a5e51],[113,17.6,0x424d59],[133.5,17.7,0x636a53]]){
      lbox(ss,tt,.4,.28,.06,.55,col,{solid:false});
      for(const d of [-.14,.14]){lcyl(ss+d,tt,.01,.04,.06,0x232626,{solid:false});hallTube([ss+d,tt,.6],[ss+d,tt,.96],.018,0x868d8b);}
      hallTube([ss-.14,tt,.96],[ss+.14,tt,.96],.025,0x303a3a);
    }
  });

  // Round 10 official 1F perimeter, HOS and plaza are built below.
  // 05/06: one column row, dark flared capitals and curved white lattice ribs.
  // Photo21's low lobby starts after gate1; its precise gate boundary remains an inference.
  const colS=[],vaultY=t=>8.5-.62*Math.pow((t-14.5)/8.5,2),hallDarkSlat={tex:'metal',color:0x45484c};
  for(let ss=-7;ss<=145;ss+=9.5){
    colS.push(ss);
    if(ss>=40&&ss<=138)continue; // Round20: honamR20 restores both back-fill and full-width truss bays.
    const t=20.5,lowLobby=ss>=2&&ss<39,entryLobby=ss>=40&&ss<62,screenColumn=ss>=40&&ss<=69;
    lbox(ss,t,screenColumn?1.2:1.0,screenColumn?1.2:1.0,0,screenColumn?5.75:lowLobby?5.2:3.65,screenColumn?0x0d1114:'ccPolishedMarble');
    if(!screenColumn)for(let yy=1.15;yy<(lowLobby?5.1:3.6);yy+=1.15)lbox(ss,t,1.004,1.004,yy,.012,0xd4d5cc,{solid:false});
    lbox(ss,t,1.04,1.04,0,.15,0x202725,{solid:false});
    if(lowLobby){
      for(const side of [-1,1])lbox(ss,t+side*.56,.20,.12,2.6,.35,{tex:'emit',color:0xffd9a0},{solid:false});
    }else if(!entryLobby&&!(ss>=50&&ss<=78)){
      if(!screenColumn){
        const low=RECT(ss-.5,t-.5,ss+.5,t+.5),high=RECT(ss-.9,t-.9,ss+.9,t+.9);
        for(let k=0;k<4;k++){const j=(k+1)%4;K.quad(0x3a3d3f,[[low[k][0],3.65,low[k][1]],[low[j][0],3.65,low[j][1]],[high[j][0],4.45,high[j][1]],[high[k][0],4.45,high[k][1]]],[0,-1,0]);}
        K.hpoly(0x3a3d3f,high,4.45,true);
      }
      twinArch([ss,6.2],[ss,23],4.4,12.5);
      // Curved pickup branches meet the cross rib from the capital rim, rather than straight V struts.
      for(const dir of [-1,1]){const endT=t+dir*1.8,endY=4.4+Math.sqrt(156.25-Math.pow(endT-14.6,2))-Math.sqrt(156.25-16.8*16.8/4);hallCurve(u=>[ss,t+dir*(.72+u*1.08),4.45+(endY-4.45)*Math.sin(u*PI/2)],6,.16,0xeeeee3);}
    }
    if(Math.round(ss)%3===0)lsign(['← 화장실','지하철 · 식당가 ↑'],ss,19.91,2.65,.98,.38,'W',{bg:'#353435',fg:'#ffffff',pxPerM:110});
    if((ss<40||ss>62)&&(ss<76||ss>86))lbox(ss,27.2,.75,.75,Y2,C2-Y2,'ccPolishedMarble');
  }
  hallFurnish(()=>{
    // cc_hall07/12: small black directions wrap the marble pier at eye level.
    for(const ss of [69,107]){
      lsign(['← 승차홈','도착하는 곳 ↑','택배 · 택시 →'],ss,19.94,2.48,.90,.54,'W',{bg:'#39383a',fg:'#f2efea',align:'left',bold:false,pxPerM:150,box:.025});
      lsign(['화장실 ↑','파미에스테이션 →'],ss+.52,20.5,2.48,.87,.36,'S',{bg:'#39383a',fg:'#f2efea',bold:false,pxPerM:130});
    }
    // Round11 HOS square replaces the former s113,t28 blind metal sweep.

  });
  // Gate-line ring beam carries the ribs without a second row of columns in front of the drums.
  for(const [a,b]of [[-10,50],[78,149]])hallTube([a,6.2,4.5],[b,6.2,4.5],.25,0xeeeee3);
  for(let i=0;i<colS.length-1;i++){
    const a=colS[i],b=colS[i+1];if((a<39&&b>3)||(a<78&&b>50))continue; // F18: no steel ribs below the stage coffers.
    twinArch([a,20.5],[b,20.5],4.4,9);
    twinArch([a,6.2],[b,6.2],4.4,9);
    // Photos05/06/08: the upper X lattice and suspended warm lamps carry across
    // the broad roof bays; keep every existing curved rib and its lower branch.
    hallTube([a,6.4,6.4],[b,20.3,7.68],.18,0xe5e2d2);
    hallTube([a,20.3,7.68],[b,6.4,6.4],.18,0xe5e2d2);
    hallTube([a,13.35,8.12],[b,13.35,8.12],.14,0xe5e2d2);
    for(const ss of [a+2.4,a+7.1]){
      hallTube([ss,13.35,8.12],[ss,13.35,7.43],.026,0x9fa397);
      lcyl(ss,13.35,7.30,.17,.10,0xddd8c4,{solid:false});
      lcyl(ss,13.35,7.28,.115,.025,{tex:'emit',color:0xfff1cc},{solid:false});
    }
  }
  for(const [s0,s1]of[[-10,3],[27,149]])for(let tt=6;tt<23;tt+=.5){
    const a=P(s0,tt),b=P(s1,tt),c=P(s1,tt+.5),d=P(s0,tt+.5);
    K.quad(0x777c80,[[a[0],vaultY(tt),a[1]],[b[0],vaultY(tt),b[1]],[c[0],vaultY(tt+.5),c[1]],[d[0],vaultY(tt+.5),d[1]]],[0,-1,0]);
    hallTube([s0,tt,vaultY(tt)-.025],[s1,tt,vaultY(tt)-.025],.023,0x555c60);
  }
  for(let ss=-6;ss<149;ss+=9.5)if(ss<3||ss>=27)for(const tt of [7,22])lcyl(ss,tt,vaultY(tt)-.12,.13,.035,{tex:'emit',color:0xf4f8f5},{solid:false});
  // The former dark slatted northern soffit is superseded by the frame-matched
  // white corridor ceiling below; do not leave a second ceiling hiding it.
  // Close the north lobby's missing roof/wall slot, preserving the exterior pylon only above roof level.
  const northSlot=RECT(-18,.3,-9,7);K.hpoly(hallDarkSlat,northSlot,8.6,false);K.phys.addCeiling(northSlot,8.6,{});
  for(let tt=6;tt<23;tt+=.5){
    const a=P(-10,tt),b=P(-10,tt+.5);
    K.quad(0x4a4d52,[[a[0],C1,a[1]],[b[0],C1,b[1]],[b[0],vaultY(tt+.5),b[1]],[a[0],vaultY(tt),a[1]]],[AX,0,AZ]);
  }
  // Round19 CC-C3: HgbY_flKpMI_16 is the low, white boarding corridor.
  // The existing gallery stays at 5 m. Its soffit/white face is visible below
  // the rail; the corridor ceiling stops short so the glass is not buried.
  const gate4Ceiling=RECT(3,6.2,39,19.9);
  K.hpoly(0xf4f3ef,gate4Ceiling,5.7,false);K.phys.addCeiling(gate4Ceiling,5.7,{});
  K.slab(RECT(3,21.4,39,23.1),Y2,{mat:M.f2Floor,under:0xf3f1e9,thick:.24});
  lbox(21,21.36,36,.22,4.2,.8,0xf5f2e9,{solid:false});
  rail(3,21.36,39,21.36,Y2);
  K.texture('ccGate4BuffBrick',256,128,(g,w,h)=>{
    g.fillStyle='#d5b28b';g.fillRect(0,0,w,h);
    for(let row=0;row<8;row++)for(let col=-1;col<7;col++){
      const x=col*43+(row%2)*21.5,y=row*16;
      g.fillStyle=['#d0ad88','#d9b790','#cba780'][(row+col+7)%3];g.fillRect(x+1,y+1,41,14);
      g.strokeStyle='#e4d6be';g.lineWidth=1;g.strokeRect(x,y,43,16);
    }
  },[1.5,.75]);
  hallFurnish(()=>{
    for(let ss=4.25;ss<39;ss+=2.5)for(let tt=7.4;tt<19.9;tt+=2.5){
      lcyl(ss,tt,5.655,.14,.025,0xd2d1c9,{solid:false,seg:16});
      lcyl(ss,tt,5.65,.10,.012,{tex:'emit',color:0xfff9ec},{solid:false,seg:16});
    }
    // Real shop units remain at t27–28, set back beyond the brick arcade.
    // Keep both 8 m department-store passage apertures free of new piers.
    for(const ss of[3.6,9.4,15.1,26.1,31.9,37.7]){
      lbox(ss,21.55,.55,.62,0,4.2,'ccGate4BuffBrick',{solid:false});
      lbox(ss,21.55,.72,.78,3.92,.28,0xe6dcc8,{solid:false});
      lbox(ss,21.55,.65,.70,0,.18,0xe6dcc8,{solid:false});
      lcyl(ss+.7,22.4,0,.30,.53,0xe9e6df,{solid:false,seg:16});
      for(let k=0;k<7;k++){
        const q=P(ss+.7+.15*Math.sin(k*2.4),22.4+.15*Math.cos(k*2.4));
        K.dome({x:q[0],z:q[1],y:.68+(k%3)*.18,rx:.18,ry:.27,rz:.17,mat:0x536d42,seg:8,rings:4});
      }
    }
    // Broad diagonal stone inlays, clipped before the retained B1 openings.
    for(let ss=4;ss<39;ss+=8)for(let t=6.5;t<20.9;t+=.35){
      const a=ss+(t-6.5)*.48,b=a+.4;
      if(b>39||H.f1.some(h=>K.pointInPoly(...P((a+b)/2,t+.175),h)))continue;
      K.hpoly(0x646663,[P(a,t),P(b,t),P(b+.168,t+.35),P(a+.168,t+.35)],.031,true);
    }
  });
  // 06/15/16: dark border bands, large black-and-white diamonds, yellow tactile route.
  // Photo21: broad, low-contrast chevron marble strips in the low northern lobby.
  K.texture('ccHallChevron',256,256,(g,w,h)=>{
    g.fillStyle='#e8e8e4';g.fillRect(0,0,w,h);
    for(let k=-4;k<8;k++)for(const side of [-1,1]){
      g.fillStyle=k%2?'#d5d6d2':'#e3e4df';g.beginPath();
      const yy=k*h/4;g.moveTo(w/2,yy);g.lineTo(w/2+side*w/2,yy+h/2);g.lineTo(w/2+side*w/2,yy+h/2+h/8);g.lineTo(w/2,yy+h/8);g.closePath();g.fill();
    }
  },[3.2,3.2]);
  for(const poly of [RECT(3,6.5,27,10.4),RECT(3,10.9,27,21.85)])K.hpoly('ccHallChevron',poly,.007,true);
  const hallFloorClear=(ss,t)=>!H.f1.some(h=>K.pointInPoly(...P(ss,t),h));
  for(const t of [10.65,22.1])for(let s=-10;s<149;s+=.5)if(hallFloorClear(s+.25,t))lbox(s+.25,t,.5,.4,.008,.006,0x3d3a36,{solid:false});
  for(let s=-6;s<149;s+=12)for(let t=6;t<28;t+=.5)if(hallFloorClear(s,t+.25))lbox(s,t+.25,.4,.5,.008,.006,0x3d3a36,{solid:false});
  for(let s=6;s<149;s+=12){
    const t=24.7;
    if([[s-1.65,t],[s+1.65,t],[s,t-1.65],[s,t+1.65]].every(q=>hallFloorClear(...q))){
      K.hpoly(0x303a39,[P(s-1.65,t),P(s,t-1.65),P(s+1.65,t),P(s,t+1.65)],.018,true);
      K.hpoly(0xefeee6,[P(s-1.18,t),P(s,t-1.18),P(s+1.18,t),P(s,t+1.18)],.020,true);
    }
  }
  for(let s=-7;s<149;s+=.5)if(hallFloorClear(s+.25,11.6)){
    lbox(s+.25,11.6,.5,.42,.022,.018,0xd4a34f,{solid:false});
    for(const dt of[-.13,0,.13])lbox(s+.25,11.6+dt,.47,.025,.041,.008,0xe8bd6c,{solid:false});
  }
  for(const bb of bays)if([1,11,13].includes(bb.p))lbox(bb.s,9.0,.42,5.2,.022,.018,0xd4a34f,{solid:false});
  for(const s of [21,124])lbox(s,32.8,.42,9.4,.022,.018,0xd4a34f,{solid:false});
  hallFurnish(()=>{lcrowd(0,21.7,38,26.4,Y1,20,11);lcrowd(65,21.7,77,26.4,Y1,8,111);lcrowd(-8,10,146,12.5,Y1,38,12);lcrowd(-20,8,-11,26,Y1,10,13);});

  // Round19: 9GATE is the shared J4 datum; retain a true similarity for Sweet Park.
  const B1_SCALE=.1009;
  const BPst=(px,py)=>[21.1+B1_SCALE*(py-477),38.7-B1_SCALE*(px-1032)];
  // The House guide is schematic, wider than this OSM strip. Keep its tenant
  // adjacency/orientation, but register its three-floor court to the photographed
  // interior court, not the bus apron. These explicit piecewise axes insert the
  // 16x12m void; this local fit is not a surveyed scale (see research round19).
  const hosAxis=(v,knots)=>{
    let i=0;while(i<knots.length-2&&v>knots[i+1][0])i++;
    const[a,b]=[knots[i],knots[i+1]];return a[1]+(v-a[0])*(b[1]-a[1])/(b[0]-a[0]);
  };
  const hosMap=(s,t)=>[hosAxis(s,[[-22.402,78],[-9.56959,89.8],[-7.2483,93.8],[-.836,99],[9.468,115],[45.122,138]]),hosAxis(t,[[-34.845,18],[-22.284,21.5],[-13.084,33.5],[11.435,38.2]])];
  const HPst=(px,py)=>hosMap(21.75+(.092/(1823/2000))*(py-630.30225),18.15-(.092/(1823/2000))*(px-1277.46725));
  const HP=(px,py)=>P(...HPst(px,py));
  const HRect=(x0,y0,x1,y1)=>[HP(x0,y0),HP(x1,y0),HP(x1,y1),HP(x0,y1)];
  const BP=(px,py)=>P(...BPst(px,py));
  const BRect=(x0,y0,x1,y1)=>[BP(x0,y0),BP(x1,y0),BP(x1,y1),BP(x0,y1)];
  // The official HOS plan has real notches, not filled bounding rectangles.
  const B1_WHITE=[[1531,534,1564,551],[1463,502,1488,589],[1521,418,1550,432],[1675,563,1698,589]];
  const BPrism=(r,y,h,mat,solid=true,project=BRect)=>{
    let pieces=[r];
    for(const cut of B1_WHITE){const next=[];for(const q of pieces){
      const a=Math.max(q[0],cut[0]),b=Math.max(q[1],cut[1]),c=Math.min(q[2],cut[2]),d=Math.min(q[3],cut[3]);
      if(a>=c||b>=d){next.push(q);continue;}
      for(const v of [[q[0],q[1],a,q[3]],[c,q[1],q[2],q[3]],[a,q[1],c,b],[a,d,c,q[3]]])if(v[2]-v[0]>.01&&v[3]-v[1]>.01)next.push(v);
    }pieces=next;}
    for(const q of pieces)K.prism(project(...q),y,y+h,{mat,solid,walkTop:solid});
  };
  const BWall=(a,b,mat=0xd8cdb9,project=BP,top=-1.8)=>{
    const qa=project(...a),qb=project(...b),L=Math.hypot(qb[0]-qa[0],qb[1]-qa[1]),n=Math.max(1,Math.ceil(L/.22));
    let run=null;
    for(let i=0;i<=n;i++){
      const u=i/n,q=[qa[0]+(qb[0]-qa[0])*u,qa[1]+(qb[1]-qa[1])*u];
      const blocked=i===n||b1Reserved(...q,.65);
      if(!blocked&&run===null)run=q;
      if(blocked&&run!==null){if(Math.hypot(q[0]-run[0],q[1]-run[1])>.05)K.wall(...run,...q,YB1,top,{mat,thick:.12});run=null;}
    }
  };
  // All cabinet footprints stay inside grey cells. White plan strips remain open passages.
  const BSign=(name,r,front='S',height=2.6)=>{
    const[x0,y0,x1,y1]=r,cx=(x0+x1)/2,cy=(y0+y1)/2;
    const a=front==='N'||front==='S'?BP(x0,front==='N'?y0:y1):BP(front==='W'?x0:x1,y0);
    const b=front==='N'||front==='S'?BP(x1,front==='N'?y0:y1):BP(front==='W'?x0:x1,y1);
    const c=BP(cx,cy),m=[(a[0]+b[0])/2,(a[1]+b[1])/2],L=Math.hypot(b[0]-a[0],b[1]-a[1]);
    let nx=-(b[1]-a[1])/L,nz=(b[0]-a[0])/L;if(nx*(m[0]-c[0])+nz*(m[1]-c[1])<0){nx=-nx;nz=-nz;}
    sign(name,{x:m[0]+nx*.12,z:m[1]+nz*.12,y:YB1+height,w:Math.max(.65,L-.2),h:.42,rotY:Math.atan2(nx,nz),bg:'#43382f',fg:'#fff5dd',bold:true,box:0});
  };
  const sweetLiftST=(px,py)=>{const[s,t]=BPst(px,py);return[s,px===1411?3:t];};
  const B1_KEEP_CLEAR=[[-4,15.7,11,20.6],[31,15.7,46,20.6],[13.25,33.4,15.75,38.15],[157,-8.2,164,-3.4],[19.7,32,22.3,43.5],[-26,10,-6.5,15.5],
    ...[[1054,523],[1411,472]].map(q=>{const[s,t]=sweetLiftST(...q);return q[0]===1411?[s-1.55,t-1.4,s+1.55,t+3.8]:[s-1.55,t-3.8,s+1.55,t+1.4];}),
    (()=>{const[s,t]=HPst(1544,459);return[s-4,t-1.1,s+1.55,t+1.1];})(),[73.6,14.6,78.4,17.5]];
  // A retained through-route starts inside the schematic Kikukawa cell after the gate/core fit.
  // Keep a customer aisle from that arrival to the nearest clear customer aisle; no tenant cell is relocated.
  const B1_ROUTE_START=[-93.4,57.8],B1_ROUTE_END=P(60,19.75);
  const routeDistance=(x,z)=>{
    const a=B1_ROUTE_START,b=B1_ROUTE_END,dx=b[0]-a[0],dz=b[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz)));
    return Math.hypot(x-a[0]-dx*t,z-a[1]-dz*t);
  };
  const routeAxis=[B1_ROUTE_END[0]-B1_ROUTE_START[0],B1_ROUTE_END[1]-B1_ROUTE_START[1]],routeLength=Math.hypot(...routeAxis),routeNormal=[-routeAxis[1]/routeLength,routeAxis[0]/routeLength];
  const routePoly=[[-.8,-1.05],[-.8,1.05],[routeLength+.8,1.05],[routeLength+.8,-1.05]].map(([along,side])=>[B1_ROUTE_START[0]+routeAxis[0]*along/routeLength+routeNormal[0]*side,B1_ROUTE_START[1]+routeAxis[1]*along/routeLength+routeNormal[1]*side]);
  const polygonsOverlap=(a,b)=>{
    for(const poly of [a,b])for(let i=0;i<poly.length;i++){
      const p=poly[i],q=poly[(i+1)%poly.length],nx=-(q[1]-p[1]),nz=q[0]-p[0],aa=a.map(v=>v[0]*nx+v[1]*nz),bb=b.map(v=>v[0]*nx+v[1]*nz);
      if(Math.max(...aa)<Math.min(...bb)||Math.max(...bb)<Math.min(...aa))return false;
    }return true;
  };
  const b1Reserved=(x,z,pad=.35)=>{
    const s=(x-OX)*AX+(z-OZ)*AZ,t=(x-OX)*EX+(z-OZ)*EZ;
    return routeDistance(x,z)<.85+pad||B1_KEEP_CLEAR.some(r=>s>r[0]-pad&&s<r[2]+pad&&t>r[1]-pad&&t<r[3]+pad);
  };
  const b1Safe=(r,project=BPst)=>{
    const[x0,y0,x1,y1]=r,poly=[[x0,y0],[x1,y0],[x1,y1],[x0,y1]].map(q=>project(...q));
    // Polygon clipping catches a long sheared edge crossing a core even if every vertex is outside.
    if(polygonsOverlap(poly.map(q=>P(...q)),routePoly))return false;
    return !B1_KEEP_CLEAR.some(q=>{
      let p=poly;
      for(const f of [v=>q[0]-.4-v[0],v=>v[0]-q[2]-.4,v=>q[1]-.4-v[1],v=>v[1]-q[3]-.4])p=clipHalf(p,f);
      return p.length>2;
    });
  };
  // Round18 D4–D6: independent HOS materials, sampled from the supplied B1 frames.
  K.texture('ccHosHoney',256,512,(g,w,h)=>{
    g.fillStyle='#c98a3e';g.fillRect(0,0,w,h);
    for(let i=0;i<80;i++){const x=i*3.4;g.strokeStyle=i%4?'rgba(107,66,38,.18)':'rgba(255,208,131,.2)';g.lineWidth=.8;g.beginPath();g.moveTo(x,0);g.bezierCurveTo(x+12,160,x-10,330,x+4,h);g.stroke();}
    g.fillStyle='#a76a2d';g.fillRect(0,0,2,h);
  },[1.5,3]);
  K.texture('ccHosParquet',512,512,(g,w,h)=>{
    g.fillStyle='#3b3a3f';g.fillRect(0,0,w,h);
    for(let a=0;a<4;a++)for(let b=0;b<4;b++){
      g.save();g.translate(a*128+64,b*128+64);if((a+b)%2)g.rotate(PI/2);
      for(let n=0;n<4;n++){const yy=-63+n*32;g.fillStyle=['#454147','#555052','#37373b','#696159'][(a+b+n)%4];g.fillRect(-63,yy,125,30);for(let k=0;k<4;k++){g.strokeStyle='rgba(235,225,204,.35)';g.lineWidth=.7;g.beginPath();g.moveTo(-62,yy+4+k*6);g.bezierCurveTo(-20,yy+16+k*2,15,yy-3+k*7,62,yy+7+k*5);g.stroke();}}
      g.restore();g.fillStyle=(a+b)%2?'#d9bd70':'#eee7d8';g.fillRect(a*128-5,b*128-5,10,10);
    }
  },[1.4,1.4]);
  K.texture('ccHosStoneHerringbone',512,512,(g,w,h)=>{
    g.fillStyle='#c3c1b9';g.fillRect(0,0,w,h);
    g.save();g.translate(w/2,h/2);g.rotate(PI/4);
    for(let i=-8;i<8;i++)for(let j=-8;j<8;j++){
      const x=i*64,y=j*64;g.fillStyle=['#b8b8b1','#d0cec6','#bfc0b9','#d9d5cb'][(i+j+32)%4];
      g.fillRect(x,y,62,14);g.fillRect(x+48,y+16,14,46);
      g.strokeStyle='rgba(245,242,229,.35)';g.lineWidth=.8;g.beginPath();g.moveTo(x+2,y+6);g.lineTo(x+58,y+9);g.stroke();
    }g.restore();
  },[2.1,2.1]);
  K.texture('ccHosUplight',128,256,(g,w,h)=>{
    g.clearRect(0,0,w,h);const grad=g.createRadialGradient(w/2,h*.96,2,w/2,h*.9,h*.85);
    grad.addColorStop(0,'rgba(255,239,132,.92)');grad.addColorStop(.24,'rgba(255,196,64,.48)');grad.addColorStop(1,'rgba(255,176,45,0)');g.fillStyle=grad;g.fillRect(0,0,w,h);
  },[1,1],{transparent:true});
  const housePrism=(r,y,h,mat,solid=true)=>BPrism(r,y,h,mat,solid,HRect);
  const houseSafe=r=>b1Safe(r,HPst);
  const hosB1Cell=cell=>{
    const BP=HP,BPst=HPst,BRect=HRect,BPrism=housePrism,b1Safe=houseSafe;
    const r=cell.rect_display,[x0,y0,x1,y1]=r,dx=x1-x0,dy=y1-y0,front=cell.front;
    const superstar=cell.name==='슈퍼스타',kibo=cell.name==='키보 아츠아츠',sushi=cell.name==='김수사',arabica=cell.name==='%아라비카';
    // u follows the shop front, v runs inward; retain every official grey-cell aspect ratio.
    const uv=(u,v)=>front==='N'?[x0+u*dx,y0+v*dy]:front==='S'?[x1-u*dx,y1-v*dy]:front==='W'?[x0+v*dx,y1-u*dy]:[x1-v*dx,y0+u*dy];
    const wr=(u0,v0,u1,v1)=>{const p=uv(u0,v0),q=uv(u1,v1);return[Math.min(p[0],q[0]),Math.min(p[1],q[1]),Math.max(p[0],q[0]),Math.max(p[1],q[1])];};
    const wp=(u,v)=>BP(...uv(u,v)),a=wp(0,0),b=wp(1,0),c=wp(.5,.5),m=wp(.5,0);
    const len=Math.hypot(b[0]-a[0],b[1]-a[1]),dep=Math.hypot(...wp(.5,1).map((v,i)=>v-m[i]));
    const nx=(m[0]-c[0])/Math.hypot(m[0]-c[0],m[1]-c[1]),nz=(m[1]-c[1])/Math.hypot(m[0]-c[0],m[1]-c[1]),rot=Math.atan2(nx,nz);
    const box=(u0,v0,u1,v1,y,h,mat,solid=false)=>{const rr=wr(u0,v0,u1,v1);if(!solid||b1Safe(rr))BPrism(rr,YB1+y,h,mat,solid);};
    const cyl=(u,v,y,rad,h,mat)=>{const q=wp(u,v);K.cyl({x:q[0],z:q[1],y:YB1+y,r:rad,h,mat,seg:12,solid:false});};
    const plinth=superstar?0xc2452d:arabica?0xece6da:{tex:'wood',color:0x6b4226};
    K.hpoly(superstar?{tex:'ccHosParquet',gloss:.5}:{tex:'wood',color:0xd4b17b,gloss:.3},BRect(...r),YB1+.031,true);
    // Honey/charcoal rear wall with an amber wash; every fixture remains within its tenant cell.
    box(.025,.97,.975,.995,0,3.3,superstar?0x2b2b2b:'ccHosHoney');
    for(let u=.08;u<.96;u+=1.5/Math.max(1,len)){
      box(u-.015,.95,u+.015,.968,.08,3.18,0x6b4226);
      const z=wp(u,.945),ux=Math.cos(rot),uz=-Math.sin(rot);
      K.quad('ccHosUplight',[[z[0]-ux*.4,YB1+.06,z[1]-uz*.4],[z[0]+ux*.4,YB1+.06,z[1]+uz*.4],[z[0]+ux*.4,YB1+2.9,z[1]+uz*.4],[z[0]-ux*.4,YB1+2.9,z[1]-uz*.4]],[nx,0,nz]);
    }
    // Recessed golden coffers only over counters; the atrium itself stays completely open.
    box(.03,.12,.97,.96,3.22,.09,{color:0xd7ba7c,gloss:.5});
    box(.09,.2,.91,.89,3.18,.035,0xb19256);
    if(sushi||kibo||superstar)for(let u=.1;u<.9;u+=.2){
      box(u,.24,Math.min(.9,u+.17),.86,3.16,.025,{color:0xc9a35a,gloss:.5});
      cyl(u+.075,.5,3.12,.065,.025,{tex:'emit',color:0xc99862});
    }
    for(const v of [.18,.91])box(.08,v,.92,v+.012,3.17,.025,{tex:'emit',color:0xffc98a});
    const barV=Math.min(.4,1.25/dep),barBack=barV+Math.min(.16,.58/dep),seatV=Math.max(.08,barV-.6/dep);
    if(kibo){
      // Shallow rounded stainless bar following the island's rounded plan front.
      const pts=[[.08,barBack],[.92,barBack],[.92,barV+.03],[.88,barV],[.12,barV],[.08,barV+.03]].map(q=>wp(...q));
      if(b1Safe(wr(.08,barV,.92,barBack))){K.prism(pts,YB1,YB1+.99,{mat:plinth});K.prism(pts,YB1+.99,YB1+1.05,{mat:{tex:'metal',color:0xb1b4b0,gloss:.5},solid:false});}
    }else{
      box(.07,barV,.93,barBack,0,.99,plinth,true);
      box(.065,barV-.012,.935,barBack+.012,.99,.06,arabica?{tex:'marble',color:0xf5f0e5,gloss:.7}:{tex:'wood',color:0x8f5b31,gloss:.5});
    }
    if(sushi){
      // U counter flanks the chefs; its open kitchen faces the B1 lounge on the north edge.
      for(const u of [.07,.84]){box(u,barBack,u+.09,.82,0,.99,plinth,true);box(u-.01,barBack,u+.10,.84,.99,.06,{tex:'wood',color:0x9c693b,gloss:.5});}
      box(.34,.74,.66,.9,0,.87,{tex:'wood',color:0xbc8748},true);
      for(let u=.35;u<.66;u+=.1)for(const y of [.16,.43,.69]){box(u,.731,u+.085,.746,y,.22,0xac703a);cyl(u+.043,.724,y+.11,.035,.025,0x8f5c2d);}
    }
    const n=sushi?10:Math.max(3,Math.floor(len*.84/.68));
    for(let i=0;i<n;i++){
      const u=.1+.8*(i+.5)/n,q=wp(u,seatV);if(b1Reserved(...q,.28))continue;
      cyl(u,seatV,.04,.23,.05,0x3a3129);cyl(u,seatV,.09,.045,.57,0x5b4936);cyl(u,seatV,.66,.23,.08,superstar?0xc2452d:0x795136);
      // Curved timber backs and individual place settings, not the former loose round cafe tables.
      for(let k=0;k<7;k++){const th=rot+PI/2+k*PI/6;K.box({x:q[0]+Math.sin(th)*.23,z:q[1]+Math.cos(th)*.23,y:YB1+.75,w:.11,d:.045,h:.22,rotY:th,mat:superstar?0xa5412f:0x84582e,solid:false});}
      if(i%3!==2)K.person(q[0],YB1+.24,q[1],{sit:true,rotY:rot+PI,shirt:[0xd7c9b6,0x4b5754,0x5a4b45,0x8c8b7a][i%4]});
      if(kibo)box(u-.19/len,barV+.015,u+.19/len,barBack-.015,1.055,.012,0xb34035);
      cyl(u,barV+.07,1.06,.115,.018,0xf1e6d1);cyl(u+.16/len,barV+.07,1.06,.04,.12,0xc5c8c1);
    }
    if(sushi){
      // Six flank stools complete the photographed U, sixteen seats in total.
      for(const u of [.035,.965])for(const v of [barBack+.12,.59,.76]){
        const q=wp(u,v);cyl(u,v,.04,.23,.05,0x3a3129);cyl(u,v,.09,.045,.57,0x5b4936);cyl(u,v,.66,.23,.08,0x795136);
        box(u-.025,v-.024,u+.025,v+.024,.75,.22,0x84582e);
        K.person(q[0],YB1+.24,q[1],{sit:true,rotY:rot+(u<.5?-PI/2:PI/2),shirt:0x8a8374});
      }
      // Glass-topped drawer chest on the lounge-facing side, clear of the centre aisle.
      const chest=wp(.16,-.035),st=[(chest[0]-OX)*AX+(chest[1]-OZ)*AZ,(chest[0]-OX)*EX+(chest[1]-OZ)*EZ];
      lbox(...st,.5,1.6,YB1,.9,'ccHosHoney');
      lbox(...st,.52,1.62,YB1+.9,.28,'glass',{solid:false});
      for(const dt of[-.52,0,.52])for(const yy of [.16,.43,.70]){
        lbox(st[0]-.255,st[1]+dt,.022,.48,YB1+yy,.23,0xb57434,{solid:false});
        const q=P(st[0]-.28,st[1]+dt);K.dome({x:q[0],z:q[1],y:YB1+yy+.1,rx:.035,ry:.035,rz:.035,hemi:false,mat:0x815020,seg:8,rings:4});
      }
    }
    // Open cooking worktop, dishes, taps and supported staff behind the bar.
    box(.17,.79,.83,.92,0,.87,{tex:'metal',color:0xaeb0a8},true);
    for(let i=0;i<Math.max(3,Math.floor(len));i++){const u=.2+.6*i/Math.max(3,Math.floor(len));for(let j=0;j<4;j++)cyl(u,.84,.89+j*.018,.08,.014,0xeee9df);}
    for(const u of [.30,.67]){const q=wp(u,Math.max(barBack+.85/dep,.62));if(!b1Reserved(...q,.32)){K.person(q[0],YB1,q[1],{rotY:rot,shirt:arabica?0xe8e5d8:0xf0ece1});if(!arabica){K.cyl({x:q[0],z:q[1],y:YB1+1.63,r:.12,h:.16,mat:0xf2f0e8,seg:10,solid:false});}}}
    if(superstar){
      // Three densely stocked orange-backlit bottle shelves, as in photo 07.
      box(.07,.925,.93,.95,1.12,1.65,{tex:'emit',color:0xc46e36});
      for(const yy of [1.18,1.72,2.26]){
        box(.07,.87,.93,.94,yy,.045,0x5a3828);
        for(let i=0;i<32;i++){const u=.09+.82*(i+.5)/32;cyl(u,.89,yy+.05,.035,.20,[0x3d4930,0x84502e,0xd0b880,0x382c22][i%4]);cyl(u,.89,yy+.25,.016,.08,0x9c805a);box(u-.022/len,.878,u+.022/len,.894,yy+.10,.075,0xe9dcc2);}
      }
      box(.01,.035,.99,.18,2.92,.25,0xf1eadb);
    }else if(kibo){
      box(.03,.13,.97,.19,2.68,.62,0x2d2822);
      box(.045,.124,.955,.135,2.72,.54,0xece1c6);
      for(let yy=2.74;yy<3.26;yy+=.055)box(.045,.116,.955,.124,yy,.018,0x393027);
    }else if(arabica){
      box(.17,.69,.42,.83,.9,.43,0xe9e9e1);box(.21,.67,.38,.70,1.05,.15,0x303632);
      for(const u of [.55,.67]){cyl(u,.8,.9,.12,.43,0x414b43);cyl(u,.8,1.33,.085,.17,'glass');}
    }
    const label=superstar?'Superstar':kibo?'KATSU & TAPAS':arabica?'% Arabica':cell.name;
    const q=wp(.5,superstar?.03:kibo?.11:.055);
    sign(label,{x:q[0],z:q[1],y:YB1+(superstar?3.04:kibo?2.99:2.83),w:Math.min(len-.3,superstar?4.6:6),h:superstar?.48:.38,rotY:rot,bg:superstar||arabica?null:kibo?'#e7dcc2':'#443122',fg:kibo?'#2d2822':arabica?'#33372f':'#fff3de',font:superstar?'Georgia,serif':SERIF,italic:superstar,pxPerM:120});
  };
  const hosB1Finish=()=>{
    const BP=HP,BPst=HPst,BRect=HRect,BPrism=housePrism;
    // The official schematic neck is only 23 display pixels (~2.32m). Keep it
    // within that white strip instead of moving shops to force the photo's ~4m width.
    const x0=1344,x1=1618,y0=320.5,y1=342.5,ym=(y0+y1)/2;
    for(const r of [[1344,320,1785,343],[1559,343,1580,589],[1698,398,1714,589]])K.hpoly({tex:'ccHosParquet',gloss:.5},BRect(...r),YB1+.033,true);
    for(const y of [y0,y1-2.2])K.hpoly({tex:'wood',color:0xc98a3e,gloss:.3},BRect(x0,y,x1,y+2.2),YB1+.036,true);
    const xyz=(px,py,h)=>{const q=BP(px,py);return[q[0],YB1+h,q[1]];};
    // White fan/rib plaster, flat at crown and gently radiused near each flank.
    const arch=(px,yy=0)=>{
      for(let i=0;i<12;i++){
        const a=i/12,b=(i+1)/12,pa=y0+1+(y1-y0-2)*a,pb=y0+1+(y1-y0-2)*b;
        const h=u=>3.02+.28*Math.pow(Math.sin(PI*u),.22)+yy;
        entryTubeWorld(xyz(px,pa,h(a)),xyz(px,pb,h(b)),.12,0xf4eee2);
      }
      for(const py of [y0+1,y1-1])entryTubeWorld(xyz(px,py,.2),xyz(px,py,3.02+yy),.12,0xf4eee2);
    };
    for(let px=x0;px<x1;px+=12)arch(px);
    for(let px=x0;px<x1;px+=12){
      const next=Math.min(px+12,x1);
      K.quad(0xf0e8d8,[xyz(px,y0+1,3.28),xyz(next,y0+1,3.28),xyz(next,y1-1,3.28),xyz(px,y1-1,3.28)],[0,-1,0]);
    }
    for(let px=x0+5;px<x1;px+=30)for(const py of [y0+.8,y1-.8]){
      const q=BP(px,py);K.cyl({x:q[0],z:q[1],y:YB1,r:.19,h:.38,mat:0xb67831,seg:16,solid:false});
      K.cyl({x:q[0],z:q[1],y:YB1+.38,r:.065,h:2.6,mat:'ccHosHoney',seg:12,solid:false});
      K.dome({x:q[0],z:q[1],y:YB1+1.9,rx:.15,ry:.15,rz:.15,hemi:false,mat:{tex:'emit',color:0xc99862},seg:12,rings:6});
    }
    const entryX=1465; // inset portal leaves a real 2.7m standoff inside the enclosure
    // Honey panel returns anchor the portal to its wall; gaps remain at bar fronts.
    for(const[a,b]of [[1344,1403],[1494,1532]])for(const py of [y0-.6,y1+.6]){
      BPrism([a,py-.45,b,py+.45],YB1,3.28,'ccHosHoney',false);
    }
    for(const rr of [[entryX-1.1,266,entryX+1.1,y0],[entryX-1.1,y1,entryX+1.1,378]])BPrism(rr,YB1,3.44,'ccHosHoney',false);
    BPrism([entryX-1.6,y0-1.5,entryX-1.3,y1+1.5],YB1+2.87,.37,{tex:'emit',color:0xaa743d},false);
    // Entrance portal faces the interior connection at the start of the north passage.
    for(const py of [y0,y1])BPrism([entryX-1.2,py-1.2,entryX+1.2,py+1.2],YB1,3.18,'ccHosHoney',false);
    BPrism([entryX-1.2,y0,entryX+1.2,y1],YB1+2.99,.44,'ccHosHoney',false);
    const q=BP(entryX-1.4,ym),back=BP(entryX-2.4,ym),rot=Math.atan2(back[0]-q[0],back[1]-q[1]);
    sign('HOUSE OF SHINSEGAE',{x:q[0],z:q[1],y:YB1+3.05,w:2.6,h:.30,rotY:rot,bg:null,fg:'#5a3414',font:SERIF,pxPerM:160});
    const st=BPst(entryX-5,y1+4);lbox(st[0],st[1],.42,.12,YB1,1.48,0x4d3926,{solid:false});
    lsign(['하우스 오브 신세계','푸드홀'],st[0],st[1]+.07,YB1+1.04,.38,.6,'E',{bg:'#f1e5cc',fg:'#5c422b',font:SERIF});
    // Reeded glazing appears on the flanks without closing the corridor or any shop entry.
    for(const px of [1404,1504])for(const py of [y0+.25,y1-.25]){
      const a=BP(px,py),b=BP(px+9,py);
      K.wall(...a,...b,YB1+.6,YB1+2.75,{mat:'glass',thick:.025,solid:false});
      for(let k=0;k<=9;k++)entryTubeWorld(xyz(px+k,py,.6),xyz(px+k,py,2.75),.012,0xbaa478);
      for(const yy of [.6,1.65,2.75])entryTubeWorld(xyz(px,py,yy),xyz(px+9,py,yy),.045,0x93612e);
    }
  };
  // Canonical cells, not a generated tenant sequence. Black partitions are traced separately below.
  const B1_CELLS=[
    {"zone":"sweet_north","name":"시코르","rect_display":[1116,266,1237,320],"front":"S","kind":"beauty"},
    {"zone":"sweet_north","name":"팝업","rect_display":[1237,266,1264,320],"front":"S","kind":"bakery"},
    {"zone":"sweet_north","name":"아임도넛","rect_display":[1264,266,1333,320],"front":"S","kind":"bakery"},
    {"zone":"sweet_north","name":"렌위치","rect_display":[1333,266,1400,320],"front":"S","kind":"bakery"},
    {"zone":"sweet","name":"케이스티파이","rect_display":[1033,345,1078,397],"front":"E","kind":"accessory"},
    {"zone":"sweet","name":"S.style ACC","rect_display":[1033,398,1097,453],"front":"S","kind":"accessory"},
    {"zone":"sweet","name":"배스 앤 바디 웍스","rect_display":[1098,398,1164,453],"front":"S","kind":"beauty"},
    {"zone":"sweet","name":"포트넘앤메이슨","rect_display":[1059,509,1164,533],"front":"S","kind":"tea"},
    {"zone":"sweet","name":"후쿠요시 카페 미친맛집","rect_display":[1032,540,1079,595],"front":"E","kind":"cafe"},
    {"zone":"sweet","name":"스탠다드브레드","rect_display":[1032,596,1079,654],"front":"E","kind":"bakery"},
    {"zone":"sweet","name":"비스퀴테리 M.O","rect_display":[1032,655,1079,716],"front":"E","kind":"bakery"},
    {"zone":"sweet","name":"피에르 마르콜리니","rect_display":[1032,717,1079,777],"front":"E","kind":"chocolate"},
    {"zone":"sweet","name":"어나더팜","rect_display":[1136,809,1210,850],"front":"N","kind":"grocery"},
    {"zone":"sweet","name":"폼폼푸린 베이커리 카페","rect_display":[1032,842,1089,894],"front":"N","kind":"cafe"},
    {"zone":"sweet","name":"마리메꼬","rect_display":[1090,842,1134,894],"front":"N","kind":"accessory"},
    {"zone":"sweet","name":"밴루엔 아이스크림","rect_display":[1344,488,1400,544],"front":"W","kind":"icecream"},
    {"zone":"sweet","name":"파이브가이즈","rect_display":[1344,545,1400,624],"front":"W","kind":"food"},
    {"zone":"sweet","name":"치폴레","rect_display":[1344,625,1400,718],"front":"W","kind":"food"},
    {"zone":"sweet","name":"파이브가이즈","rect_display":[1276,550,1328,605],"front":"W","kind":"food"},
    {"zone":"sweet","name":"치폴레","rect_display":[1281,610,1328,718],"front":"W","kind":"food"},
    {"zone":"sweet","name":"차지","rect_display":[1277,731,1332,777],"front":"N","kind":"cafe"},
    {"zone":"sweet","name":"부창제과","rect_display":[1223,732,1265,777],"front":"W","kind":"bakery"},
    {"zone":"sweet_islands","name":"크림한상 / 1994 양과점","rect_display":[1095,551,1120,578],"front":"N","kind":"bakery"},
    {"zone":"sweet_islands","name":"구뜨몽떼","rect_display":[1122,551,1147,564],"front":"N","kind":"bakery"},
    {"zone":"sweet_islands","name":"레브두","rect_display":[1122,565,1147,578],"front":"N","kind":"bakery"},
    {"zone":"sweet_islands","name":"팝업","rect_display":[1095,579,1120,605],"front":"N","kind":"bakery"},
    {"zone":"sweet_islands","name":"마담 피에르 오제","rect_display":[1122,579,1147,605],"front":"N","kind":"bakery"},
    {"zone":"sweet_islands","name":"키친205","rect_display":[1155,551,1178,578],"front":"N","kind":"bakery"},
    {"zone":"sweet_islands","name":"쇼토","rect_display":[1180,551,1206,578],"front":"N","kind":"bakery"},
    {"zone":"sweet_islands","name":"시즈니크","rect_display":[1155,580,1178,605],"front":"N","kind":"bakery"},
    {"zone":"sweet_islands","name":"쉐프조","rect_display":[1180,580,1206,605],"front":"N","kind":"bakery"},
    {"zone":"sweet_islands","name":"깰끄쇼즈 / 르솔레이 / 아우치+터치","rect_display":[1223,551,1264,578],"front":"N","kind":"bakery"},
    {"zone":"sweet_islands","name":"크라눌레","rect_display":[1223,580,1244,605],"front":"N","kind":"bakery"},
    {"zone":"sweet_islands","name":"팝업","rect_display":[1245,580,1264,605],"front":"N","kind":"bakery"},
    {"zone":"sweet_islands","name":"마망갸또","rect_display":[1095,610,1120,636],"front":"N","kind":"bakery"},
    {"zone":"sweet_islands","name":"만나당","rect_display":[1122,610,1147,636],"front":"N","kind":"bakery"},
    {"zone":"sweet_islands","name":"이스트우드","rect_display":[1155,610,1178,636],"front":"N","kind":"bakery"},
    {"zone":"sweet_islands","name":"삐아프","rect_display":[1180,610,1206,636],"front":"N","kind":"bakery"},
    {"zone":"sweet_islands","name":"팝업","rect_display":[1223,610,1264,636],"front":"N","kind":"bakery"},
    {"zone":"sweet_islands","name":"한과미의식","rect_display":[1095,638,1147,662],"front":"N","kind":"bakery"},
    {"zone":"sweet_islands","name":"팝업","rect_display":[1155,638,1178,662],"front":"N","kind":"bakery"},
    {"zone":"sweet_islands","name":"해피해피 케이크","rect_display":[1180,638,1206,662],"front":"N","kind":"bakery"},
    {"zone":"sweet_islands","name":"팝업","rect_display":[1223,638,1264,662],"front":"N","kind":"bakery"},
    {"zone":"sweet_islands","name":"프랑스 루브르바게트","rect_display":[1095,665,1147,691],"front":"N","kind":"bakery"},
    {"zone":"sweet_islands","name":"산스커피","rect_display":[1095,693,1147,718],"front":"N","kind":"bakery"},
    {"zone":"sweet_islands","name":"한정선","rect_display":[1155,665,1206,718],"front":"N","kind":"bakery"},
    {"zone":"sweet_islands","name":"오뜨르 베이커리","rect_display":[1223,665,1264,691],"front":"N","kind":"bakery"},
    {"zone":"sweet_islands","name":"고리","rect_display":[1223,693,1264,718],"front":"N","kind":"bakery"},
    {"zone":"sweet_islands","name":"태극당","rect_display":[1095,730,1124,750],"front":"N","kind":"bakery"},
    {"zone":"sweet_islands","name":"르뱅룰즈","rect_display":[1125,730,1160,750],"front":"N","kind":"bakery"},
    {"zone":"sweet_islands","name":"르빵","rect_display":[1161,730,1206,750],"front":"N","kind":"bakery"},
    {"zone":"sweet_islands","name":"스코프","rect_display":[1095,752,1150,777],"front":"N","kind":"bakery"},
    {"zone":"sweet_islands","name":"장 블랑제리","rect_display":[1152,752,1206,777],"front":"N","kind":"bakery"},
    {"zone":"hos","name":"키쿠카와","rect_display":[1424,285,1493,320],"front":"S","kind":"food"},
    {"zone":"hos","name":"슈퍼스타","rect_display":[1533,285,1618,320],"front":"S","kind":"bar"},
    {"zone":"hos","name":"%아라비카","rect_display":[1344,343,1389,462],"front":"W","kind":"cafe"},
    {"zone":"hos","name":"키쿠카와","rect_display":[1435,343,1493,377],"front":"N","kind":"food"},
    {"zone":"hos","name":"타치바나","rect_display":[1494,343,1548,432],"front":"E","kind":"food"},
    {"zone":"hos","name":"키보 아츠아츠","rect_display":[1600,345,1660,400],"front":"S","kind":"food"},
    {"zone":"hos","name":"미도한우함박","rect_display":[1714,397,1785,443],"front":"W","kind":"food"},
    {"zone":"hos","name":"혼","rect_display":[1714,444,1785,489],"front":"W","kind":"food"},
    {"zone":"hos","name":"자주한상","rect_display":[1714,490,1785,589],"front":"W","kind":"food"},
    {"zone":"hos","name":"김수사","rect_display":[1580,529,1698,589],"front":"N","kind":"food"},
    {"zone":"hos","name":"미가훠궈","rect_display":[1463,444,1531,589],"front":"E","kind":"food"},
    {"zone":"hos","name":"아이스크림 소사이어티","rect_display":[1532,485,1558,589],"front":"E","kind":"icecream"},
    {"zone":"sweet","name":"팝업","rect_display":[1059,487,1164,507],"front":"S","kind":"bakery"}
  ];
  const b1PlanOutline=[[1032,345],[1078,345],[1078,266],[1400,266],[1400,755],[1343,755],[1343,894],[1032,894]].map(q=>BP(...q));
  K.slab(b1PlanOutline,YB1,{mat:{tex:'marble',color:0xe5dacc,gloss:.5},under:false,ceil:false,edge:false,holes:H.b1});
  const B1_STAFF=[]; // Filled by region detail groups; placed after every fixture has been built.
  const B1_REGIONS=[
    ['sweet_north','스위트 파크 북측', [1032,266,1400,488]],
    ['sweet','스위트 파크 외곽 매장',[1032,488,1400,895]],
    ['sweet_islands','스위트 파크 디저트 아일랜드',[1089,540,1268,780]],
    ['hos','하우스 오브 신세계 푸드홀',[1344,266,1786,718]],
  ];
  // FeFx7kfWgdo_181/193: pale marble field with small black diamonds, not
  // the former equal-area dark checkerboard. Cream coves and brass remain.
  K.texture('ccB1Checker',256,256,(g,w,h)=>{
    g.fillStyle='#f3eee4';g.fillRect(0,0,w,h);g.strokeStyle='#cec9c0';g.lineWidth=.8;
    for(let i=-2;i<=3;i++){g.beginPath();g.moveTo(i*128,0);g.lineTo(i*128+256,256);g.stroke();g.beginPath();g.moveTo(i*128,0);g.lineTo(i*128-256,256);g.stroke();}
    g.fillStyle='#202321';for(let r=0;r<=2;r++)for(let c=0;c<=2;c++){const x=c*128,y=r*128;g.beginPath();g.moveTo(x-32,y);g.lineTo(x,y-32);g.lineTo(x+32,y);g.lineTo(x,y+32);g.closePath();g.fill();}
  },[2.4,2.4]);
  K.texture('ccBodyPlaid',128,128,(g,w,h)=>{g.fillStyle='#f1eee6';g.fillRect(0,0,w,h);for(let a=0;a<4;a++)for(let b=0;b<4;b++)if((a+b)%2){g.fillStyle=(a%2)?'#526a7f':'#899ba5';g.fillRect(a*32,b*32,32,32);}},[.8,.8]);
  K.texture('ccBodyScreen',256,160,(g,w,h)=>{
    const wash=g.createLinearGradient(0,0,w,h);wash.addColorStop(0,'#60385e');wash.addColorStop(.55,'#d56fa0');wash.addColorStop(1,'#a67bba');g.fillStyle=wash;g.fillRect(0,0,w,h);
    for(const[x,y,r]of[[213,39,35],[197,112,41],[238,83,29]]){g.strokeStyle='#eeb4ce';g.lineWidth=7;g.beginPath();g.arc(x,y,r,0,PI*2);g.stroke();}
    g.fillStyle='#f1d9e6';g.fillRect(51,46,37,81);g.fillStyle='#c58da9';g.fillRect(55,58,29,54);g.fillStyle='#33203c';g.fillRect(59,36,21,13);
    g.fillStyle='#fff4f7';g.font='bold 17px sans-serif';g.textAlign='center';g.fillText('배스 앤 바디 웍스',123,149);
  },[2.1,1.25]);
  const b1White=0xf0e5d3,b1Brass=0xa78b55,b1Wood={tex:'wood',color:0x806143};
  // FeFx7kfWgdo_181: the little oak house is the near end of the long
  // Bath & Body Works plan cell, not a distant counter across the passage.
  const bodyKiosk=()=>{
    const [ss,tt]=BPst(1131,425.5),front=ss+1.28,oak={tex:'wood',color:0xb39160,gloss:.3};
    // 4 x 2.5 m oak house, centred inside Bath & Body Works and facing plan south.
    lbox(ss,tt,2.5,4,YB1,.12,{color:0x242627,gloss:.5});
    lbox(ss,tt,2.42,3.92,YB1+.12,2.86,oak);
    lbox(front,tt,.055,3.42,YB1+.46,2.05,'ccBodyPlaid',{solid:false});
    for(const dt of [-1.89,1.89]){
      lbox(ss,tt+dt,2.52,.18,YB1+.12,2.86,oak,{solid:false});
      lbox(front+.025,tt+dt,.12,.23,YB1+.25,2.72,0xc4a476,{solid:false});
    }
    for(const yy of [.23,.48,2.52,2.91])lbox(front+.04,tt,.12,3.83,YB1+yy,.10,0x8d6c43,{solid:false});
    for(let dt=-1.45;dt<1.6;dt+=.73){
      lbox(front+.065,tt+dt,.04,.62,YB1+2.66,.18,0x947344,{solid:false});
      lbox(front+.09,tt+dt,.02,.51,YB1+2.69,.12,0xc09b65,{solid:false});
    }
    lbox(ss,tt,2.78,4.25,YB1+3,.13,0x40484b,{solid:false});
    const roof=(s,t,y)=>{const p=P(s,t);return[p[0],YB1+y,p[1]];};
    const e=[roof(ss-1.39,tt-2.13,3.12),roof(ss-1.39,tt+2.13,3.12),roof(ss+1.39,tt+2.13,3.12),roof(ss+1.39,tt-2.13,3.12)];
    const r=[roof(ss,tt-1.65,3.55),roof(ss,tt+1.65,3.55)];
    K.quad(0x4c5355,[e[0],e[1],r[1],r[0]],[-AX,1,-AZ]);K.quad(0x41494c,[e[2],e[3],r[0],r[1]],[AX,1,AZ]);
    K.quad(0x50585a,[e[3],e[0],r[0],r[0]],[-EX,1,-EZ]);K.quad(0x50585a,[e[1],e[2],r[1],r[1]],[EX,1,EZ]);
    lbox(front+.095,tt,.07,2.22,YB1+.96,1.33,0x151b20,{solid:false});
    const a=P(front+.14,tt-1.04),b=P(front+.14,tt+1.04);
    K.quad('ccBodyScreen',[[a[0],YB1+1.01,a[1]],[b[0],YB1+1.01,b[1]],[b[0],YB1+2.21,b[1]],[a[0],YB1+2.21,a[1]]],[AX,0,AZ]);
    lsign('Bath & Body Works',front+.17,tt,YB1+2.44,3,.23,'S',{bg:null,fg:'#e8f8ff',pxPerM:150});
    for(const side of [-1,1]){
      const faceT=tt+side*2.015;
      lbox(ss,faceT,1.17,.025,YB1+.72,1.63,0xe0d6b9,{solid:false});
      for(let i=0;i<12;i++){
        const a=PI*i/12,b=PI*(i+1)/12;
        entryTube([ss+.58*Math.cos(a),faceT,YB1+2.05+.58*Math.sin(a)],[ss+.58*Math.cos(b),faceT,YB1+2.05+.58*Math.sin(b)],.08,0x8d6a3e);
      }
      for(const d of [-.58,0,.58])entryTube([ss+d,faceT,YB1+.72],[ss+d,faceT,YB1+2.05],.055,0x8d6a3e);
      for(const yy of [1.12,1.65])entryTube([ss-.58,faceT,YB1+yy],[ss+.58,faceT,YB1+yy],.04,0x8d6a3e);
      for(const yy of [.75,1.18,1.61])lbox(ss,faceT+side*.035,1.13,.09,YB1+yy,.025,0xd7c7a4,{solid:false});
      for(let level=0;level<3;level++)for(let i=0;i<8;i++){
        const stockS=ss-.47+i*.135;
        lcyl(stockS,faceT+side*.025,YB1+.76+level*.43,.037,.17,[0xc8b174,0xc6a9a5,0xdce1d8][i%3],{seg:8,solid:false});
        lcyl(stockS,faceT+side*.025,YB1+.93+level*.43,.028,.025,b1Brass,{seg:8,solid:false});
      }
    }
    const ps=ss+.3,pt=tt+2.65;
    lcyl(ps,pt,YB1,.40,.60,0x252d27,{seg:16});
    lcyl(ps,pt,YB1+.6,.09,2.25,0x716149,{seg:8,solid:false});
    for(let leaf=0;leaf<12;leaf++){
      const a=leaf*PI/6,dx=Math.cos(a),dz=Math.sin(a),c=P(ps,pt);
      const root=[c[0],YB1+2.8,c[1]],tip=[c[0]+dx*1.20,YB1+2.45,c[1]+dz*1.20],mid=[c[0]+dx*.67,YB1+3.12,c[1]+dz*.67];
      entryTubeWorld(root,mid,.025,0x596247);entryTubeWorld(mid,tip,.018,0x596247);
      for(let j=1;j<6;j++){
        const u=j/6,xx=c[0]+dx*1.2*u,zz=c[1]+dz*1.2*u,yy=YB1+2.8+.35*Math.sin(u*PI)-.35*u;
        for(const side of [-1,1])K.quad(leaf%2?0x4c633b:0x627345,[[xx,yy,zz],[xx-dz*.32*(1-u)*side,yy-.10,zz+dx*.32*(1-u)*side],[xx+dx*.18,yy-.04,zz+dz*.18],[xx,yy,zz]],[0,1,0]);
      }
    }
  };
  // Round 18 Sweet Park: every fixture is expressed in the corrected official-plan frame.
  // The two-square repeat is 1.30 m, so each black/white marble tile is exactly 65 cm.
  K.texture('ccSweetChecker',512,512,(g,w,h)=>{
    for(let a=0;a<2;a++)for(let b=0;b<2;b++){
      const dark=(a+b)%2===0,ox=a*w/2,oy=b*h/2;
      g.save();g.beginPath();g.rect(ox,oy,w/2,h/2);g.clip();
      g.fillStyle=dark?'#1a1a1a':'#f2f0ea';g.fillRect(ox,oy,w/2,h/2);
      for(let i=0;i<10;i++){
        g.strokeStyle=dark?(i%3?'#585356':'#bcb7b0'):(i%3?'#dedbd4':'#bfbcb5');g.lineWidth=i%3?.8:1.6;
        g.beginPath();g.moveTo(ox-30+i*44,oy);g.bezierCurveTo(ox+80+i*31,oy+90,ox-80+i*24,oy+160,ox+70+i*30,oy+h/2);g.stroke();
      }g.restore();
    }
  },[1.3,1.3]);
  K.texture('ccSweetBrick',256,128,(g,w,h)=>{
    g.fillStyle='#e9ddc3';g.fillRect(0,0,w,h);g.strokeStyle='#c2b49c';g.lineWidth=1.6;
    for(let j=0;j<4;j++)for(let i=-1;i<4;i++)g.strokeRect(i*85+(j%2)*42,j*32,85,32);
  },[.45,.28]);
  K.texture('ccSweetFieldstone',256,128,(g,w,h)=>{
    g.fillStyle='#aaa391';g.fillRect(0,0,w,h);
    for(let j=-1;j<4;j++)for(let i=-1;i<5;i++){
      const x=i*61+(j%2)*30,y=j*40;g.fillStyle=['#424746','#393d3c','#555650'][(i+j+12)%3];
      g.beginPath();g.moveTo(x+3,y+8);g.lineTo(x+47,y+2);g.lineTo(x+59,y+27);g.lineTo(x+31,y+38);g.lineTo(x+2,y+31);g.closePath();g.fill();
    }
  },[1.2,.6]);
  const spBounds=r=>{const a=BPst(r[0],r[1]),b=BPst(r[2],r[3]);return[Math.min(a[0],b[0]),Math.min(a[1],b[1]),Math.max(a[0],b[0]),Math.max(a[1],b[1])];};
  const spFinish=(r,y,mat,repeat=1.3)=>{
    const[s0,t0,s1,t1]=spBounds(r);
    K.quad(mat,RECT(s0,t0,s1,t1).map(q=>[q[0],y,q[1]]),[0,1,0],[[0,0],[(s1-s0)/repeat,0],[(s1-s0)/repeat,(t1-t0)/repeat],[0,(t1-t0)/repeat]]);
  };
  const spGlobe=(s,t,y,r=.16)=>{const[x,z]=P(s,t);K.dome({x,z,y,rx:r,ry:r,rz:r,hemi:false,seg:10,rings:6,mat:{tex:'emit',color:0xfff4dd}});};
  const spChandelier=(s,t)=>{
    const y=YB1+3.95;
    lcyl(s,t,y,.028,.9,b1Brass,{solid:false});
    for(let i=0;i<20;i++){const a=i*PI/10,b=(i+1)*PI/10;entryTube([s+.54*Math.cos(a),t+.54*Math.sin(a),y],[s+.54*Math.cos(b),t+.54*Math.sin(b),y],.045,b1Brass);}
    for(let i=0;i<6;i++){const a=i*PI/3,ss=s+.54*Math.cos(a),tt=t+.54*Math.sin(a);lcyl(ss,tt,y-.20,.018,.42,b1Brass,{solid:false});spGlobe(ss,tt,y+(i%2?.22:-.20));}
    spGlobe(s,t,y-.35,.18);
  };
  const spVault=(s0,t0,s1,t1)=>{
    const cs=(s0+s1)/2,ct=(t0+t1)/2,hs=(s1-s0)/2,ht=(t1-t0)/2,n=12;
    const height=(a,b)=>YB1+3.5+1.35*Math.sqrt(Math.max(0,1-Math.min(a*a,b*b)));
    const q=(a,b)=>{const[x,z]=P(cs+a*hs,ct+b*ht);return[x,height(a,b),z];};
    for(let i=0;i<n;i++)for(let j=0;j<n;j++){
      const a=-1+i*2/n,b=-1+j*2/n;K.quad(0xefe5cf,[q(a,b),q(a+2/n,b),q(a+2/n,b+2/n),q(a,b+2/n)],[0,-1,0]);
    }
    const paths=[];
    for(const[ds,dt]of [[-1,-1],[-1,1],[1,-1],[1,1]])paths.push(Array.from({length:13},(_,i)=>{const a=i/12;return[cs+ds*a*hs,ct+dt*a*ht,height(a,a)-.08];}));
    for(const edge of ['n','s','w','e'])paths.push(Array.from({length:21},(_,i)=>{const v=-1+i/10,a=edge==='n'?-1:edge==='s'?1:v,b=edge==='w'?-1:edge==='e'?1:v;return[cs+a*hs,ct+b*ht,height(a,b)-.06];}));
    for(const path of paths)for(let i=0;i<path.length-1;i++){
      const a=path[i],b=path[i+1];entryTube(a,b,.18,0xd1c1a3);
      entryTube([a[0],a[1],a[2]-.10],[b[0],b[1],b[2]-.10],.07,0xf3e9d4);
      entryTube([a[0]+.10,a[1],a[2]+.015],[b[0]+.10,b[1],b[2]+.015],.035,{tex:'emit',color:0xffe5ad});
    }
    spChandelier(cs,ct);
    for(const[a,b]of [[-.5,-.2],[.4,-.6],[-.35,.55],[.5,.3]])lcyl(cs+a*hs,ct+b*ht,height(a,b)-.04,.045,.025,{tex:'emit',color:0xfff2dc},{solid:false});
  };
  const spPillar=(s,t)=>{
    if(b1Reserved(...P(s,t),.7))return;
    lbox(s,t,.58,.58,YB1,3.45,'ccSweetBrick');
    for(const yy of [.08,3.16,3.35])lbox(s,t,.69,.69,YB1+yy,.07,yy===3.16?0x453a2a:b1Brass,{solid:false});
  };
  const spStaff=(s,t,face)=>{
    if(b1Reserved(...P(s,t),.4))return;
    lperson(s,t,YB1,{shirt:0xece8df,pants:0x373b35,h:1.67,rotY:F[face]});
    lcyl(s,t,YB1+1.63,.12,.10,0x3f6b45,{solid:false});
    const ds=face==='N'?-.14:face==='S'?.14:0,dt=face==='E'?.14:face==='W'?-.14:0;
    lbox(s+ds,t+dt,face==='N'||face==='S'?.045:.32,face==='N'||face==='S'?.32:.045,YB1+.49,.58,0x3f6b45,{solid:false});
  };
  const spVitrine=(r,seed=0)=>{
    if(!b1Safe(r))return false;
    const[s0,t0,s1,t1]=spBounds(r),s=(s0+s1)/2,t=(t0+t1)/2,ds=s1-s0,dt=t1-t0,cut=Math.min(.25,ds*.22,dt*.16);
    const shape=(pad=0)=>[[s0+cut-pad,t0-pad],[s1-cut+pad,t0-pad],[s1+pad,t0+cut-pad],[s1+pad,t1-cut+pad],[s1-cut+pad,t1+pad],[s0+cut-pad,t1+pad],[s0-pad,t1-cut+pad],[s0-pad,t0+cut-pad]].map(p=>P(...p));
    // 30 cm white marble apron, then an 8 cm dark outline; no raised collision curb.
    K.hpoly({tex:'marble',color:0x17191a},shape(.38),YB1+.028,true);
    K.hpoly({tex:'marble',color:0xf2eee4},shape(.30),YB1+.030,true);
    K.prism(shape(),YB1,YB1+.70,{mat:{tex:'wood',color:0x63422a}});
    K.prism(shape(.06),YB1+.70,YB1+.80,{mat:{tex:'marble',color:0xece3cf,gloss:.7},solid:false});
    K.prism(shape(-.025),YB1+.81,YB1+1.13,{mat:'glass',solid:false});
    for(const yy of [.08,.66,1.13])K.prism(shape(.015),YB1+yy,YB1+yy+.025,{mat:b1Brass,solid:false,top:false,bottom:false});
    const pp=shape(-.025);for(const[x,z]of pp)entryTubeWorld([x,YB1+.80,z],[x,YB1+1.14,z],.022,b1Brass);
    lbox(s,t,ds-.14,dt-.14,YB1+.96,.012,'glass',{solid:false});
    const rows=Math.max(1,Math.floor((ds-.22)/.27)),cols=Math.max(1,Math.floor((dt-.22)/.27));
    for(let i=0;i<rows;i++)for(let j=0;j<cols;j++){
      const ss=s0+.14+(i+.5)*(ds-.28)/rows,tt=t0+.14+(j+.5)*(dt-.28)/cols;
      lbox(ss,tt,.23,.23,YB1+.81,.018,0xe7ddc5,{solid:false});
      if((i+j+seed)%4===0){
        lbox(ss,tt,.12,.20,YB1+.83,.06,[0xf0dbc0,0xd7c9ad,0x8b5434][seed%3],{solid:false});
        lbox(ss,tt,.125,.035,YB1+.891,.008,0x6c4a32,{solid:false});
      }else{
        // Three tapered lobes read as a croissant instead of a repeated spherical cake.
        for(const[off,rx,rz]of [[-.045,.033,.034],[0,.055,.044],[.045,.033,.034]]){
          const[x,z]=P(ss+off,tt+Math.abs(off)*.35);K.dome({x,z,y:YB1+.84,rx,ry:.030,rz,mat:[0xc88c45,0xdba559,0xb97a38][(i+j)%3],seg:8,rings:3});
        }
      }
      if((i+j)%3===0)lbox(ss,tt,.12,.17,YB1+.98,.075,[0xd9b17a,0xe7cf9b,0x764a31][(seed+i)%3],{solid:false});
    }
    for(let u=t0+.1;u<t1-.08;u+=.17)lbox(s0-.012,u,.02,.035,YB1+.15,.43,0x9b7750,{solid:false});
    return true;
  };
  const spArchFront=(cell)=>{
    const[s0,t0,s1,t1]=spBounds(cell.rect_display),s=(s0+s1)/2,t=t0+.03,w=s1-s0-.35,oak={tex:'wood',color:0xad8151,gloss:.3};
    // The west perimeter's four fronts look into the plan-east aisle (-t).
    for(const ss of [s0+.18,s1-.18])spPillar(ss,t+.15);
    lbox(s,t,.0+w,.30,YB1+2.20,.42,'ccSweetFieldstone',{solid:false});
    lbox(s,t-.10,w,.18,YB1+2.64,.42,oak,{solid:false});
    const text=cell.name==='스탠다드브레드'?'Standard Bread':cell.name;
    lsign(text,s,t-.21,YB1+2.73,w*.76,.26,'W',{bg:'#191e1b',fg:'#f5e5b7',font:text==='Standard Bread'?'"Comic Sans MS",cursive':SERIF,bold:false,pxPerM:150});
    for(let i=0;i<20;i++){
      const a=PI*i/20,b=PI*(i+1)/20;
      entryTube([s+Math.cos(a)*w/2,t,YB1+3.02+1.05*Math.sin(a)],[s+Math.cos(b)*w/2,t,YB1+3.02+1.05*Math.sin(b)],.14,oak);
      const q=(u,y)=>{const[x,z]=P(u,t+.04);return[x,y,z];};
      K.quad('glass',[q(s,YB1+3.02),q(s+Math.cos(a)*w/2,YB1+3.02+1.05*Math.sin(a)),q(s+Math.cos(b)*w/2,YB1+3.02+1.05*Math.sin(b)),q(s,YB1+3.02)],[-EX,0,-EZ]);
    }
    for(let ds=-w/2+.25;ds<w/2;ds+=.40){const h=1.02*Math.sqrt(Math.max(0,1-ds*ds/(w*w/4)));lbox(s+ds,t,.045,.10,YB1+3.04,h,oak,{solid:false});}
    for(const yy of [.32,.66])lbox(s,t,w*Math.sqrt(1-(yy/1.05)**2),.09,YB1+3.02+yy,.045,oak,{solid:false});
    if(cell.name==='스탠다드브레드'){
      // Photo13: a bakery with a dark stone arch, display and oven wall,
      // not a doorway through the shop. J4 is now on the white 9GATE strip.
      lwall(s0+.1,t1-.13,s1-.1,t1-.13,YB1,YB1+3.15,{mat:0x2a2626,thick:.16});
      for(const ss of [s0+.42,s1-.42])lbox(ss,t+.19,.55,.38,YB1,2.2,'ccSweetFieldstone');
      const rear=t1-.42;
      lbox(s,rear,Math.min(3.2,w-.6),.42,YB1+.65,1.75,0x2a2626,{solid:false});
      for(const dy of [.82,1.35,1.88]){
        lbox(s,rear-.24,Math.min(2.6,w-.9),.04,YB1+dy,.36,0x121212,{solid:false});
        lbox(s,rear-.27,Math.min(2.4,w-1.1),.025,YB1+dy+.04,.05,{tex:'emit',color:0xc63332},{solid:false});
        lbox(s,rear-.29,Math.min(2.5,w-1),.035,YB1+dy-.02,.035,0x9c9b8f,{solid:false});
      }
      for(const ss of [s0+.8,s1-.8]){
        lbox(ss,t1-1.05,.72,1.1,YB1,.84,oak);
        for(const dt of [-.3,0,.3]){const[x,z]=P(ss,t1-1.05+dt);K.dome({x,z,y:YB1+.87,rx:.22,ry:.11,rz:.12,mat:0xbd8b51,seg:10,rings:4});}
      }
    }
  };
  const spCounterStand=(cell,r,face)=>{
    // Photos11/15: small brass-framed acrylic cards sit on the cases, leaving
    // the vaults visible. No suspended island fascias across the customer aisle.
    const[a,b,c,d]=spBounds(r),s=(a+c)/2,t=(b+d)/2,alongS=face==='E'||face==='W';
    lbox(s,t,alongS?.49:.035,alongS?.035:.49,YB1+1.18,.34,b1Brass,{solid:false});
    lbox(s,t,.10,.10,YB1+1.12,.06,0x242323,{solid:false});
    const ds=face==='N'?-.026:face==='S'?.026:0,dt=face==='W'?-.026:face==='E'?.026:0;
    lsign(cell.name==='시즈니크'?'SEASONIQUE':cell.name,s+ds,t+dt,YB1+1.35,.45,.30,face,{bg:'#151718',fg:'#f3efe5',font:SERIF,bold:false,pxPerM:320});
  };
  const spQueue=(cell)=>{
    const[s0,t0,s1,t1]=spBounds(cell.rect_display),rows=4,cols=6;
    // Two folded lanes (12 people each) stay inside the official 한정선 cell.
    for(let row=0;row<rows;row++)for(let col=0;col<cols;col++){
      const s=s0+.52+row*.72,t=t0+.60+col*(t1-t0-1.2)/(cols-1);
      if(!b1Reserved(...P(s,t),.36))lperson(s,t,YB1,{shirt:[0x555c59,0x918d84,0x383c3d,0xaaa598,0x64705a,0xc9c1b4][(row+col)%6],pants:0x303334,rotY:col%2?F.S:F.N});
    }
    for(const s of [s0+.18,s0+1.62,s0+3.12]){
      for(const t of [t0+.28,t1-.28]){lcyl(s,t,YB1,.15,.035,0x282728,{solid:false});lcyl(s,t,YB1+.035,.025,.91,0x252426,{solid:false});}
      lbox(s,(t0+t1)/2,.025,t1-t0-.56,YB1+.84,.065,0xcfc4ab,{solid:false});
    }
    lsign(['한정선','대기 안내'],s0+.22,t1-.31,YB1+1.04,.62,.68,'N',{bg:'#754c43',fg:'#f4e9d5',font:SERIF,bold:false});
  };
  const spSafeCounter=(cell,preferred)=>{
    if(b1Safe(preferred))return preferred;
    const r=cell.rect_display,[x0,y0,x1,y1]=r,[s0,t0,s1,t1]=spBounds(r);
    let parts=[[s0+.20,t0+.20,s1-.20,t1-.20]];
    // Keep the tenant in its traced cell. Only its cabinet changes size when a
    // retained core or J4 crosses the guide; never translate the whole shop.
    for(const q of B1_KEEP_CLEAR){
      const cut=[q[0]-.46,q[1]-.46,q[2]+.46,q[3]+.46],next=[];
      for(const p of parts){
        const a=Math.max(p[0],cut[0]),b=Math.max(p[1],cut[1]),c=Math.min(p[2],cut[2]),d=Math.min(p[3],cut[3]);
        if(a>=c||b>=d){next.push(p);continue;}
        for(const v of [[p[0],p[1],a,p[3]],[c,p[1],p[2],p[3]],[a,p[1],c,b],[a,d,c,p[3]]])if(v[2]-v[0]>.42&&v[3]-v[1]>.42)next.push(v);
      }parts=next;
    }
    const toPlan=p=>[x0+(t1-p[3])*(x1-x0)/(t1-t0),y0+(p[0]-s0)*(y1-y0)/(s1-s0),x0+(t1-p[1])*(x1-x0)/(t1-t0),y0+(p[2]-s0)*(y1-y0)/(s1-s0)];
    const candidates=[];
    for(const p of parts){
      const ds=Math.min(.9,p[2]-p[0]),dt=Math.min(.9,p[3]-p[1]);
      const options=cell.front==='N'||cell.front==='S'?[[p[0],p[1],p[0]+ds,p[3]],[p[2]-ds,p[1],p[2],p[3]]]:[[p[0],p[1],p[2],p[1]+dt],[p[0],p[3]-dt,p[2],p[3]]];
      for(const v of options){const plan=toPlan(v);if(b1Safe(plan))candidates.push({plan,area:(v[2]-v[0])*(v[3]-v[1])});}
    }
    candidates.sort((a,b)=>b.area-a.area);
    // A core-covered cell keeps its frontage; only its fitted cabinet is clipped.
    return candidates[0]?.plan??null;
  };
  const spCell=(cell,index)=>{
    const r=cell.rect_display,[x0,y0,x1,y1]=r,[s0,t0,s1,t1]=spBounds(r),front=cell.front,face={N:'N',S:'S',E:'W',W:'E'}[front];
    const retail=['beauty','accessory'].includes(cell.kind),west=x0===1032&&y0>=540&&y1<=777;
    const i=3,depth=Math.min(11,(y1-y0)*.45),sideDepth=Math.min(11,(x1-x0)*.45);
    let caseRect=front==='N'?[x0+i,y0+i,x1-i,y0+i+depth]:front==='S'?[x0+i,y1-i-depth,x1-i,y1-i]:front==='W'?[x0+i,y0+i,x0+i+sideDepth,y1-i]:[x1-i-sideDepth,y0+i,x1-i,y1-i];
    if(['크림한상 / 1994 양과점','마망갸또','만나당'].includes(cell.name))caseRect=[x0+3,y0+3,x1-3,y1-3];
    if(cell.name==='한정선')caseRect=[x0+3,y1-15,x1-3,y1-6];
    caseRect=spSafeCounter(cell,caseRect);
    if(west)spArchFront(cell);else if(cell.zone!=='sweet_islands')BSign(cell.name,r,front,2.65);
    if(retail){
      if(caseRect){BPrism(caseRect,YB1,.9,{tex:'wood',color:0xd3c6af});for(let j=0;j<4;j++)BPrism(caseRect,YB1+.9+j*.4,.04,0xe6dcc9,false);}
    }else if(caseRect)spVitrine(caseRect,index);
    if(cell.zone==='sweet_islands'&&caseRect)spCounterStand(cell,caseRect,face);
    const cs=(s0+s1)/2,ct=(t0+t1)/2;
    const ss=cell.name==='한정선'?s1-.18:front==='N'?Math.min(s1-.35,s0+2):front==='S'?Math.max(s0+.35,s1-2):cs;
    const tt=front==='W'?Math.max(t0+.35,t1-2):front==='E'?Math.min(t1-.35,t0+2):ct;
    if(caseRect&&s1-s0>2.1&&t1-t0>1.6){
      const[a,b,c,d]=spBounds(caseRect);
      if(ss<a-.34||ss>c+.34||tt<b-.34||tt>d+.34)spStaff(ss,tt,face);
    }
    if(cell.name==='팝업'&&caseRect){
      const[a,b,c,d]=spBounds(caseRect),cols=Math.min(3,Math.max(1,Math.floor((d-b-.15)/.24)));
      for(let j=0;j<cols;j++)for(let level=0;level<2;level++)lbox((a+c)/2,(b+d)/2+(j-(cols-1)/2)*.24,.12,.20,YB1+.82+level*.065,.06,level?0xe2cfae:0xc8ac7d,{solid:false});
    }
    if(cell.name==='한정선')spQueue(cell);
  };
  for(const [key,name,area]of B1_REGIONS){
    const poly=key==='hos'?HRect(...area):BRect(...area);
    K.zone({name,floor:'B1',sub:key==='hos'?'푸드홀 · 레스토랑':key==='sweet_islands'?'베이커리 · 디저트 · 팝업':'스위트 파크',poly,y0:YB1,y1:0,priority:7});
    if(key==='sweet')spFinish(area,YB1+.018,{tex:'ccSweetChecker'});
    // Islands are nested inside sweet: one continuous checker surface prevents overlapping UV grids.
    else if(key!=='sweet_islands')K.hpoly(key==='hos'?{tex:'ccHosParquet',gloss:.5}:{tex:'ccB1Checker',gloss:.5},poly,YB1+.018,true);
    K.detail({floor:'B1',y0:YB1,y1:0,poly,name},()=>{
      for(const [index,cell]of B1_CELLS.entries()){
        if(cell.zone!==key)continue;
        const r=cell.rect_display,[x0,y0,x1,y1]=r,dx=x1-x0,dy=y1-y0,cx=(x0+x1)/2,cy=(y0+y1)/2;
        const kind=cell.kind,front=cell.front,food=['food','bar'].includes(kind),retail=['beauty','accessory'].includes(kind);
        if(cell.name==='배스 앤 바디 웍스'){bodyKiosk();B1_STAFF.push({r:[...r],cx,cy});continue;}
        if(key!=='hos'){spCell(cell,index);continue;}
        hosB1Cell(cell);
      }
      if(key==='hos'){hosB1Finish();return;}
      // The photographed cross vaults belong to the southern Sweet Park hall.
      // Build once over the full hall; the islands are nested in this region.
      if(key==='sweet'){
        const[s0,t0,s1,t1]=spBounds(area),ns=Math.ceil((s1-s0)/7.6),nt=Math.ceil((t1-t0)/7.6),ds=(s1-s0)/ns,dt=(t1-t0)/nt;
        for(let i=0;i<ns;i++)for(let j=0;j<nt;j++){
          const a=s0+i*ds,b=t0+j*dt;
          if([P(a+ds/2,b+dt/2),P(a+.3,b+.3),P(a+ds-.3,b+dt-.3)].some(q=>b1Reserved(...q,.65)))continue;
          spVault(a,b,a+ds,b+dt);
        }
      }
      // Northern shopping arcade retains its pale-diamond flooring and simple lighting.
      if(key==='sweet'||key==='sweet_islands')return;
      const isHos=key==='hos';
      for(let py=area[1]+25;py<area[3]-10;py+=70){
        const px=(area[0]+area[2])/2,q=BP(px,py);if(b1Reserved(...q))continue;
        K.cyl({x:q[0],z:q[1],y:YB1+3.7,r:.045,h:.7,mat:b1Brass,seg:8,solid:false});
        for(let a=0;a<8;a++){const angle=a*PI/4,xx=q[0]+Math.cos(angle)*.52,zz=q[1]+Math.sin(angle)*.52;K.cyl({x:xx,z:zz,y:YB1+3.55,r:.07,h:.16,mat:{tex:'emit',color:0xffedce},seg:8,solid:false});}
        if(!isHos)for(let k=0;k<14;k++){
          const a=PI*k/14,b=PI*(k+1)/14;
          entryTubeWorld([q[0]+EX*2.1*Math.cos(a),YB1+3.5+.8*Math.sin(a),q[1]+EZ*2.1*Math.cos(a)],[q[0]+EX*2.1*Math.cos(b),YB1+3.5+.8*Math.sin(b),q[1]+EZ*2.1*Math.cos(b)],.14,b1White);
        }
      }
    });
  }
  // CC-D3: the clean barrel follows the 9GATE white corridor after re-anchoring.
  // No transverse brown beam crosses its cream crown or warm coves.
  K.detail({floor:'B1',y0:YB1,y1:0,poly:BRect(1032,454,1343,488),name:'북측 대리석 연결 통로'},()=>{
    const[s0,t0,s1,t1]=spBounds([1032,454,1343,488]),sc=(s0+s1)/2,hw=(s1-s0)/2;
    spFinish([1032,454,1343,488],YB1+.022,{tex:'ccB1Checker'},2.4);
    for(const ss of [s0+.15,s1-.15])lbox(ss,(t0+t1)/2,.3,t1-t0,YB1+.026,.008,0x202321,{solid:false});
    const roof=(u,t)=>{const[x,z]=P(sc-hw*Math.cos(u*PI),t);return[x,YB1+3.65+.9*Math.sin(u*PI),z];};
    for(let i=0;i<32;i++){
      const a=i/32,b=(i+1)/32;
      K.quad(0xf0e7d6,[roof(a,t0),roof(a,t1),roof(b,t1),roof(b,t0)],[0,-1,0]);
    }
    for(const ss of [s0+.12,s1-.12]){
      lbox(ss,(t0+t1)/2,.15,t1-t0,YB1+3.61,.05,{tex:'emit',color:0xffe6b6},{solid:false});
      lbox(ss,(t0+t1)/2,.23,t1-t0,YB1+3.49,.10,0xd6c7aa,{solid:false});
    }
  });
  // Actual black-line room boundaries in the official east plan. Open grey islands receive no walls.
  for(const[a,b]of [
    [[1116,266],[1400,266]],
    [[1237,266],[1237,320]],[[1264,266],[1264,320]],[[1333,266],[1333,320]],[[1400,266],[1400,320]],
    [[1344,343],[1389,343]],[[1389,343],[1389,462]],[[1344,343],[1344,373]],[[1344,411],[1344,462]],[[1344,462],[1389,462]],
    [[1344,488],[1400,488]],[[1400,488],[1400,718]],[[1344,545],[1400,545]],[[1344,625],[1400,625]],
    [[1424,285],[1493,285]],[[1493,266],[1493,320]],[[1533,285],[1618,285]],
    [[1435,343],[1493,343]],[[1493,343],[1493,432]],[[1435,432],[1493,432]],
    [[1463,444],[1531,444]],[[1463,444],[1463,502]],[[1463,502],[1488,502]],[[1488,502],[1488,589]],
    [[1698,529],[1698,563]],[[1675,563],[1698,563]],
    [[1558,589],[1786,589]],[[1714,397],[1786,397]],[[1714,443],[1786,443]],[[1714,489],[1786,489]],
    [[1032,540],[1079,540]],[[1032,595],[1079,595]],[[1032,654],[1079,654]],[[1032,716],[1079,716]],
    [[1136,809],[1210,809]],[[1210,809],[1210,850]],[[1032,894],[1343,894]],
  ]){
    const isHouse=Math.min(a[0],b[0])>=1424||a[0]===1389||b[0]===1389||(a[0]===1344&&a[1]<=462&&b[1]<=462);
    BWall(a,b,isHouse?'ccHosHoney':0xd8cdb9,isHouse?HP:BP);
  }
  // Full-height House envelope and a four-metre entrance in the east return.
  const hosB1Poly=HRect(1344,266,1786,718);
  K.slab(hosB1Poly,YB1,{mat:'ccHosParquet',under:false,ceil:false,edge:false});
  for(const[a,b]of [[[1344,266],[1786,266]],[[1786,266],[1786,320.5]],[[1786,342.5],[1786,718]],[[1786,718],[1344,718]]])BWall(a,b,'ccHosHoney',HP,CB);
  for(const[a,b]of [[[1344,266],[1344,320.5]],[[1344,342.5],[1344,718]]])BWall(a,b,'ccHosHoney',HP,CB);
  // Plan services: toilet cores, elevator faces and the Sweet Garden waiting island.
  const b1Service=(name,r,front)=>{BSign(name,r,front,2.55);const[x0,y0,x1,y1]=r;for(const[f,a,b]of [['N',[x0,y0],[x1,y0]],['E',[x1,y0],[x1,y1]],['S',[x0,y1],[x1,y1]],['W',[x0,y0],[x0,y1]]])if(f!==front)BWall(a,b);};
  for(const[a,b]of [[[1389,378],[1424,378]],[[1389,378],[1389,437]],[[1424,378],[1424,437]]])BWall(a,b,'ccHosHoney',HP);
  {const q=HPst(1406.5,437);lsign('화장실',...q,YB1+2.55,1,.28,'S',{bg:'#493723',fg:'#fff0d4'});}
  b1Service('화장실',[1254,809,1303,850],'N');
  BSign('스위트 가든',[1174,420,1301,498],'N',2.9);
  K.detail({floor:'B1',y0:YB1,y1:0,poly:BRect(1174,420,1301,498),name:'스위트 가든 · 곡선 벤치와 화분'},()=>{
    for(const[px,py]of [[1210,430],[1284,431]]){
      const q=BP(px,py);if(b1Reserved(...q,1.1))continue;
      K.cyl({x:q[0],z:q[1],y:YB1,r:.45,h:.48,mat:{tex:'marble',color:0xd8c9ad,gloss:.3},seg:24});
      K.cyl({x:q[0],z:q[1],y:YB1+.48,r:.36,h:.035,mat:0x554f3c,seg:24,solid:false});
      for(let n=0;n<18;n++){const a=n*2.4,rr=.27*Math.sqrt((n+.5)/18);K.dome({x:q[0]+Math.cos(a)*rr,z:q[1]+Math.sin(a)*rr,y:YB1+.55+n%3*.07,rx:.14,ry:.20,rz:.11,mat:[0x566f49,0x7c895e,0x415d3c][n%3],seg:8,rings:4});}
      for(let n=0;n<14;n++){const a=PI*.12+n*PI*.76/14,b=a+PI*.76/14;const aa=[q[0]+Math.cos(a)*.72,YB1+.44,q[1]+Math.sin(a)*.72],bb=[q[0]+Math.cos(b)*.72,YB1+.44,q[1]+Math.sin(b)*.72];entryTubeWorld(aa,bb,.17,0xa08458);}
    }
  });

  BSign('호남선 터미널 →',[1238,455,1301,482],'N',3.05);
  BSign('호남선 터미널 →',[1238,773,1343,808],'N',3.05);
  {const q=HPst(1739.5,398);lsign('신세계 아카데미 · 파미에스테이션 2층 →',...q,YB1+3.05,3,.3,'S',{bg:'#493723',fg:'#fff0d4'});}
  BSign('백화점 식품관 · 9게이트',[1032,454,1080,484],'W',3.2);
  BSign('지하철 · 신세계 팩토리 스토어 ↑',[1078,266,1116,343],'W',3.05);
  // Sweet Park cars connect B1 with the existing department-store 1F landing.
  // Upper-floor destinations are not fabricated across the retained shared wall.
  const remoteP=(u,v)=>[-107.07+62.61*u/67+30.43*v/84.7-.32*u*v/(67*84.7),-24.31-23.77*u/67+79.03*v/84.7+.13*u*v/(67*84.7)];
  for(const [name,px,py]of [['스위트 파크 엘리베이터',1054,523],['스위트 파크 동측 엘리베이터',1411,472]]){
    const ss=sweetLiftST(px,py),q=P(...ss);
    K.slab(RECT(ss[0]-2,ss[1]-2,ss[0]+2,ss[1]+2),YB1,{mat:'ccLinkMarble',under:false,ceil:false,edge:false});
    // The west car is on the other side of the retained shared wall: its door
    // opens into the plan-south white aisle, never straight into that wall.
    // At t3 the east car and its apron stay inside the west facade. Its door
    // faces +t into the plan corridor, not -t into the exterior wall.
    const south=px===1054,panels=south?[[ss[0]-.9,ss[1]-.9,ss[0]+.9,ss[1]-.9],[ss[0]-.9,ss[1]+.9,ss[0]+.9,ss[1]+.9],[ss[0]-.9,ss[1]-.9,ss[0]-.9,ss[1]+.9]]:[[ss[0]-.9,ss[1]-.9,ss[0]-.9,ss[1]+.9],[ss[0]+.9,ss[1]-.9,ss[0]+.9,ss[1]+.9],[ss[0]-.9,ss[1]-.9,ss[0]+.9,ss[1]-.9]];
    for(const [a,b,c,d]of panels)lwall(a,b,c,d,YB1,YB1+2.9,{mat:0xbfc2bd,thick:.1});
    lsign('엘리베이터 · 백화점 1층',ss[0]+(south?.96:0),ss[1]+(south?0:.96),YB1+2.55,1.6,.28,south?'S':'E',{bg:'#302c29',fg:'#ffe6ba'});
    const menu=[['B1',YB1],['1F',0]];
    K.elevator({name,x:q[0],z:q[1],rotY:south?F.S:F.E,w:1.6,d:1.7,shaft:false,floors:menu.map(([label,y])=>{
      const p=label==='B1'?q:remoteP(4.15,2);
      return{label,y,name:label==='B1'?'스위트 파크':'신세계백화점',dx:p[0]-q[0],dz:p[1]-q[1]};
    })});
  }
  // Deterministic shoppers stand only in plan white space, outside core approaches and cell interiors.
  K.detail({floor:'B1',y0:YB1,y1:0,poly:BRect(1032,266,1786,895),name:'공식 B1 통로 · 고객과 안내'},()=>{
    const canStand=(q)=>{
      if(b1Reserved(...q,.45))return false;
      const p={x:q[0],z:q[1]};K.phys.resolve(p,.32,YB1,YB1+1.75,.5);
      return Math.hypot(p.x-q[0],p.z-q[1])<.018&&Math.abs(K.phys.support(q[0],q[1],YB1+.5).y-YB1)<.08&&K.phys.ceilingAbove(q[0],q[1],YB1+.1,YB1+2)>YB1+1.8;
    };
    // Search actual remaining floor after counters, tables, walls and garden benches are present.
    for(const staff of B1_STAFF){
      const[x0,y0,x1,y1]=staff.r,candidates=[];
      for(let a=0;a<11;a++)for(let b=0;b<11;b++){
        const px=x0+(a+.5)*(x1-x0)/11,py=y0+(b+.5)*(y1-y0)/11;
        if(B1_WHITE.some(v=>px>v[0]&&px<v[2]&&py>v[1]&&py<v[3]))continue;
        const q=BP(px,py);if(canStand(q))candidates.push({q,d:Math.hypot(px-staff.cx,py-staff.cy)});
      }
      candidates.sort((a,b)=>a.d-b.d);
      if(candidates.length){const q=candidates[0].q;K.person(q[0],YB1,q[1],{shirt:0x303633,rotY:R+PI/2});}
    }
    const r=K.rand(12120);let placed=0;
    for(let tries=0;tries<16000&&placed<175;tries++){
      const px=1040+r()*735,py=275+r()*610;
      if(B1_CELLS.some(c=>px>c.rect_display[0]-4&&px<c.rect_display[2]+4&&py>c.rect_display[1]-6&&py<c.rect_display[3]+6))continue;
      const q=BP(px,py);if(!K.pointInPoly(...q,b1PlanOutline)||!canStand(q))continue;
      K.person(q[0],YB1,q[1],{shirt:[0xb8a797,0x637467,0x858898,0x4e4746][placed%4],rotY:r()*2*PI});placed++;
    }
  });
  // Existing J3/J4/J7 transit circulation continues outside the drawn retail plan.
  // The old unverified GATE8 door and distant cinema were removed: 8GATE belongs to the market north edge.
  K.detail({floor:'B1',y0:YB1,y1:0,poly:RECT(140,0,189,38),name:'호남선 · 7호선 연결 안내'},()=>{
    for(const ss of [150,173,186])lsign('지하철 7호선 · 파미에스테이션 →',ss,17.5,YB1+3.1,5,.55,'S',{bg:'#39342e',fg:'#fff2d8',twoSided:true});
  });
  // ---- J3 corridor (owner): GOTO south wall (-150,-54.8) → north tip of the B1 (-128,-5)
  {
    const ax = -150, az = -54.9, bx = -131.8, bz = -14.4;
    const L = Math.hypot(bx - ax, bz - az), ux = (bx - ax) / L, uz = (bz - az) / L, nx = -uz, nz = ux, hw = 5;
    const poly = [[ax + nx * hw, az + nz * hw], [bx + nx * hw, bz + nz * hw], [bx - nx * hw, bz - nz * hw], [ax - nx * hw, az - nz * hw]];
    K.slab(poly, YB1, { mat: { tex: 'tile', color: 0xd7d0c4 }, under: false, ceil: false, edge: false });
    K.hpoly(M.ceil, poly, YB1 + 3.4, false);
    K.phys.addCeiling(poly, YB1 + 3.4, {});
    for (const sg of [1, -1]) K.wall(ax + nx * hw * sg, az + nz * hw * sg, bx + nx * hw * sg, bz + nz * hw * sg, YB1, YB1 + 3.4, { mat: 0xe6e0d4, thick: 0.25 });
    K.detail({floor:'B1',y0:YB1,y1:YB1+3.4,poly,name:'고투몰 연결통로 · 조명과 안내'},()=>{
    for (let k = 3; k < L - 2; k += 4) { K.box({ x: ax + ux * k, z: az + uz * k, y: YB1 + 3.32, w: 3.2, d: 0.4, h: 0.05, rotY: Math.atan2(ux, uz), mat: 'emit', solid: false }); }
    for (let k = 8; k < L - 6; k += 12) for (const sg of [1, -1]) {
      K.box({ x: ax + ux * k + nx * (hw - 0.6) * sg, z: az + uz * k + nz * (hw - 0.6) * sg, y: YB1, w: 1.0, d: 3.2, h: 2.2, rotY: Math.atan2(ux, uz), mat: 0x2f3338 });
      sign(['센트럴시티', 'CENTRAL CITY'], { x: ax + ux * k + nx * (hw - 1.12) * sg, z: az + uz * k + nz * (hw - 1.12) * sg, y: YB1 + 1.3, w: 2.8, h: 1.6, rotY: Math.atan2(-nx * sg, -nz * sg), bg: '#f2ede2', fg: '#1d3557' });
    }
    const m = 0.5; sign(['센트럴시티 · 호남선 터미널 ↓', '파미에스테이션 1층 · 신세계백화점'], { x: ax + ux * 3, z: az + uz * 3, y: YB1 + 2.9, w: 6, h: 0.75, rotY: Math.atan2(-ux, -uz), bg: '#1d3557', fg: '#fff', twoSided: true });
    sign(['GOTO MALL 고투몰 ↑', '고속터미널역 3·7·9호선'], { x: ax + ux * (L - 3), z: az + uz * (L - 3), y: YB1 + 2.9, w: 6, h: 0.75, rotY: Math.atan2(ux, uz), bg: '#202a36', fg: '#fff', twoSided: true });
    const j3Rand=K.rand(31),j3People=[];
    for(let tries=0;tries<500&&j3People.length<10;tries++){
      const along=2+j3Rand()*(L-4),side=(j3Rand()-.5)*(hw*2-1.6),x=ax+ux*along+nx*side,z=az+uz*along+nz*side,p={x,z};
      K.phys.resolve(p,.32,YB1,YB1+1.75,.5);
      if(Math.hypot(p.x-x,p.z-z)>.018||j3People.some(q=>Math.hypot(q[0]-x,q[1]-z)<.75))continue;
      K.person(x,YB1,z,{rotY:j3Rand()*PI*2});j3People.push([x,z]);
    }void m;
    });
    K.zone({ name: '센트럴시티 ↔ 고투몰 연결통로', floor: 'B1', sub: '지하 연결통로 · 고속터미널역 · 경부선 방면', poly, y0: YB1 - 0.5, y1: YB1 + 3.4, priority: 2 });
  }

  // ================================================================= south block — 파미에스테이션 1F/2F, 하차장, 메가박스 B1
  // Official Famille Gate2 is level and open. Remove unsupported E4B1well/E5flight immediately behind its door.
  // South elevator and officialeastescclusterretainupperaccess; B1remainsreachablefromhallcores.
  // OfficialGate5/6westcornercontainstoilets,notflights:removeoldB1/groundandground/upperstairs.
  // A newplan-backedupperescalatorisprovidedatFamilleGate3/unit32sidebelow.
  flight(173, 179.7, -94.6, Y2, YR, 'rf');

  rail(173, -95.8, 179.7, -95.8, YR); rail(173, -93.4, 179.7, -93.4, YR); rail(173, -95.8, 173, -93.4, YR);
  lwall(170.8, -97.4, 182.2, -97.4, YR, YR + 3, { mat: 0xd0ccc4 }); lwall(170.8, -89.4, 182.2, -89.4, YR, YR + 3, { mat: 0xd0ccc4 });
  lwall(170.8, -97.4, 170.8, -89.4, YR, YR + 3, { mat: 0xd0ccc4 }); lwall(182.2, -97.4, 182.2, -89.4, YR, YR + 3, { mat: 0xd0ccc4, openings: [{ at: 4, w: 2.4, y0: YR, y1: YR + 2.4 }] });
  lbox(176.5, -93.4, 11.4, 8, YR + 3, 0.25, 0xbab6ae, { solid: false });
  const SOUTH_FLOORS = [{ label: 'B1', y: YB1, name: '지하철 7호선 연결통로' }, { label: '1F', y: Y1, name: '파미에스테이션 · 하차장' }, { label: '2F', y: Y2, name: '파미에스테이션 2층 식당가' }, { label: 'R', y: YR, name: '옥상 주차장' }];
  elev('파미에스테이션 엘리베이터', 160, -6, 'S', SOUTH_FLOORS, ['b1', 'f1', 'f2', 'rf']);
  // Round 10 replaces the guessed Famille 1F bay sequence with the official numbered plan below.
  {
    // Round14: official numbered 2F cells replace the former guessed dining row.
    // The main plate uses an independently scaled fit above the preserved 1F; the
    // detached Outback/DimDimSum annex remains the separately drawn M1F below.
    // Shop geometry is built after officialShop is available. Lighting/people follow
    // the original open gallery, not the now superseded tenant positions.
  }

  // ================================================================= 2F — 센트럴시티 식당가 (east mezzanine only)
  {
    const y=Y2,h=C2-Y2;
    // Retain the research-backed dining tenants on the east side, leaving the 1F vault open.
    const dining=[[-17,-12,'이춘복참치'],[-12,-7,'바디프렌즈'],[-7,-2,'온고지신'],[-2,3,'샤브보트'],[3,8,'101번지 남산돈까스'],[8,13,'르사이공'],[13,18,'수라빔'],[25,30,'순대실록'],[30,35,'중화가정'],[35,39,'삼맛종합분식'],[138,145,'놀부보쌈']];
    for(const row of dining)KNOWN.add(row[2]);
    for(const [u0,u1,name] of dining)shop({axis:'s',u0,u1,f:28,b:38.2,y,h,name,kind:name==='화장실'?'toilet':'food',seed:u0+700,noBack:true});
    // Glass mezzanine balustrade, broken at the escalator opening; stainless handrail.
    rail(-18,23,39.4,23,y);rail(48.8,23,76,23,y);rail(138,23,150,23,y);rail(-18,23,-18,38.2,y);
    shopFurnish(y,()=>{
    lsign(['센트럴시티 식당가','중층'],50,25.3,y+2.6,4.6,.9,'S',{bg:'#344b44',fg:'#fff'});
    lsign(['옥상 주차장 · 엘리베이터 / 계단','파미에스테이션 2F →'],138,25.3,y+2.7,5,.8,'N',{bg:'#344b44',fg:'#fff',twoSided:true});
    for(let ss=-18;ss<150;ss+=5)if(Math.abs(ss-62)>3&&(ss<38||ss>50))lbox(ss,25.4,1.2,1.2,C2-.06,.05,{tex:'emit',color:0xfff6e6},{solid:false});
    lcrowd(-18,23.7,150,27.4,y,32,71);
    });
  }

  // cc_famille26: upper-floor restaurant character. Exact tenancy bay/floor is unconfirmed.
  // Fit the photographed warm booths and wave cornice within the existing 2F envelope.
  // The former guessed Modern Shabu bay is replaced by the official HOS1M footprint.

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
    // Photo 11: grey stone courses remain visible across the south podium;
    // four 0.6 m courses per repeat, aligned across both floor envelopes.
    K.texture('ccSouthStone',256,128,(g,w,h)=>{
      g.fillStyle='#a9a8a2';g.fillRect(0,0,w,h);
      for(let row=0;row<4;row++)for(let col=-1;col<5;col++){
        const x=col*64+(row%2)*32,y=row*32;
        g.fillStyle=['#a9a8a2','#aaa9a3','#a5a49e','#adaca6'][(row+col+5)%4];
        g.fillRect(x+1,y+1,63,31);
        g.strokeStyle='#8f8e88';g.lineWidth=1;g.strokeRect(x,y,64,32);
      }
    },[7.2,2.4]);
    const SOUTH_STONE={tex:'ccSouthStone'};
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
        const westA=(a[0]-OX)*EX+(a[1]-OZ)*EZ,westB=(b[0]-OX)*EX+(b[1]-OZ)*EZ;
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
    { const a = T(3), b = P(-10, 0.3);
      K.wall(a[0],a[1],b[0],b[1],Y1,C1,{mat:'glass',thick:.04});
      K.wall(a[0],a[1],b[0],b[1],C1,YR,{mat:'ccBand',mat2:0x4a4d52,thick:.18});
      for(let k=0;k<=1;k+=.25)K.box({x:a[0]+(b[0]-a[0])*k,z:a[1]+(b[1]-a[1])*k,y:Y1,w:.12,d:.12,h:C1-Y1,mat:0x3a3f45,solid:false});
    }
    edge(11, Y1, C1, 0xd7d2c8, M.wallIn, [[J4[0], J4[1], 8.4, Y1, Y1 + 3.4], [-82.640,39.138,8.4,Y1,Y1+3.4], [-55, 111.5, 6.6, Y1, Y1 + 3.4], [-65,81,16,Y1,8.25]]);
    // south block 1F: e6 (connector), e7 (하차장 doors), e8 (west end), e9 (사평대로), e10 (JW ramp end)
    const D7 = [-80, -62, -44, -30, -28].map(t => { const p = P1(168.2, t); return [p[0], p[1], 4.2, Y1, 3.0]; });
    edge(6,Y1,C1,'ccBand',M.wallIn);
    edge(7,Y1,C1,'ccBand',M.wallIn,D7);
    edge(8, Y1, C1, SOUTH_STONE, M.wallIn, [[...P1(186, -98.6), 4, Y1, 3.0]],{vBase:0});
    const D9 = [[-81, 4], [-54, 5], [-10, 6], [2, 8], [14, 4], [25, 5]].map(([t, w]) => { const s = 204.1 - (t + 98.9) * (1.3 / 135.8); const p = P1(s, t); return [p[0], p[1], w, Y1, 3.2]; });
    const southGlass = [-24,-16,-6,6,18,26].map(t => {
      const s=204.1-(t+98.9)*(1.3/135.8); return [...P1(s,t),3.6,0.65,3.25];
    });
    // Round 8: a brick-faced rear entrance stretch inside the existing podium footprint.
    // The supplied brick/glass-roof photos include Devil's Door elsewhere: use their
    // architectural vocabulary only, never move that shop or its separate building here.
    const rearArchTs=[-92,-86.8,-75,-69.8,-64.6,-59.4,-54.2,-49,-43.8,-38.6];
    const rearArches=rearArchTs.map(t=>[...P1(sE9(t),t),2.1,.65,3.9]);
    edge(9,Y1,C1,SOUTH_STONE,M.wallIn,[...D9,...southGlass,...rearArches],{vBase:0});
    const rearA=P(sE9(-96)+.18,-96),rearB=P(sE9(-35)+.18,-35);
    K.wall(...rearA,...rearB,.55,C1,{mat:'ccBackBrick',thick:.14,
      openings:[...rearArches,...D9].map(([x,z,w,y0,y1])=>({at:atOn(rearA,rearB,x,z),w,y0,y1}))});
    for(const t of rearArchTs){
      const c=P(sE9(t)+.27,t),ux=Math.cos(R),uz=-Math.sin(R);
      const at=(u,y,off=0)=>[c[0]+ux*u+AX*off,y,c[1]+uz*u+AZ*off];
      const n=[AX,0,AZ],r=1.05,spring=2.85,top=spring+r;
      K.quad({tex:'glass',color:0x91aaa2},[at(-r,.65),at(r,.65),at(r,spring),at(-r,spring)],n);
      for(let i=0;i<12;i++){
        const a=PI*i/12,b=PI*(i+1)/12;
        const u0=r*Math.cos(a),u1=r*Math.cos(b),y0=spring+r*Math.sin(a),y1=spring+r*Math.sin(b);
        K.quad({tex:'glass',color:0x91aaa2},[at(0,spring),at(u0,y0),at(u1,y1),at(0,spring)],n);
        K.quad('ccBackBrick',[at(u0,y0),at(u1,y1),at(u1,top),at(u0,top)],n);
        entryTubeWorld(at(u0,y0,.035),at(u1,y1,.035),.085,0x263c35);
      }
      for(const u of [-r,0,r])entryTubeWorld(at(u,.65,.035),at(u,u===0?top:spring,.035),.065,0x263c35);
      for(const y of [.65,1.65,2.85])entryTubeWorld(at(-r,y,.035),at(r,y,.035),.065,0x263c35);
      for(const a of [PI/4,3*PI/4])entryTubeWorld(at(0,spring,.035),at(r*Math.cos(a),spring+r*Math.sin(a),.035),.055,0x263c35);
      lbox(sE9(t)+.32,t,.48,2.45,.5,.13,0xbdb29e,{solid:false});
    }
    edge(10, Y1, C1, 0x9a968f, M.wallIn, [[...P(189.5,39),5.8,0,C1]]); // JF2: open gallery east end for famille
    // Photo 11: a dark plinth and glazed shops where the podium faces the round hall.
    for(const i of [8,9,10]) edge(i,0,0.55,0x595955,M.wallIn,i===9?D9:i===10?[[...P(189.5,39),5.8,0,C1]]:[]);
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
    // Photo 11 podium and aerial west band: larger dark south openings and horizontal
    // west glazing. North wings stop at 6m below the separate 11.8m entrance pylons.
    for (let i = 0; i < TERM.length; i++) {
      if(i===12) { edge(i,C1,6,'ccGateBrick',M.wallIn,[[...N1,6.6,0,8.5]]); continue; }
      if(i<3) { edge(i,C1,6,'ccGateBrick',M.wallIn,i===2?[[...P(-16.5,0),6.4,0,6]]:[]); continue; }
      const windows=[];
      if(i===5) for(let s=1.8;s<149;s+=3.6) windows.push([...P(s,0),3.22,5.6,7.6]);
      if([8,9,10].includes(i)) {
        const a=TERM[i],b=TERM[(i+1)%TERM.length],L=Math.hypot(b[0]-a[0],b[1]-a[1]);
        if(i===8||i===9) for(let d=2.8;d<L-1.5;d+=4.5) windows.push([a[0]+(b[0]-a[0])*d/L,a[1]+(b[1]-a[1])*d/L,2.2,5.6,7.2]);
        else for(let d=2.4;d<L-1.5;d+=3.6) windows.push([a[0]+(b[0]-a[0])*d/L,a[1]+(b[1]-a[1])*d/L,1.2,5.25,6.45]);
      }
      if(i===11)windows.push([...P(53.3,38.5),2.8,7,9],[-65,81,16,C1,8.25]);
      edge(i,C1,YR,(i===8||i===9)?SOUTH_STONE:i===10?0x9a968f:BAND,M.wallIn,windows,(i===8||i===9)?{vBase:0}:{});
      const face=Math.atan2(ns[i][0],ns[i][1]),ux=Math.cos(face),uz=-Math.sin(face);
      for(const [x,z,w,y0,y1] of windows) if(!(i===11&&(y0===7||x===-65))) K.wall(x-ux*w/2,z-uz*w/2,x+ux*w/2,z+uz*w/2,y0,y1,
        {mat:(i===8||i===9)?0x303b38:{tex:'glass',color:0x3d4a52},thick:0.04});
    }
    for (let i=0;i<TERM.length;i++) {
      const a=TERM[i],b=TERM[(i+1)%TERM.length],L=Math.hypot(b[0]-a[0],b[1]-a[1]);
      const mouths=[[-136.4,6.9,8,YR,YR+1.2],[-30.6,179.4,8,YR,YR+1.2]].filter(q=>{
        const at=atOn(a,b,q[0],q[1]);return at>-4&&at<L+4&&Math.abs((q[0]-a[0])*(b[1]-a[1])-(q[1]-a[1])*(b[0]-a[0]))/L<2;
      });
      if(i>2&&i!==12) edge(i,YR,YR+1.1,0xc7c3b9,0xbab5ad,mouths,{thick:0.25});
    }
    // cc_01 (June 2026): short brown pylons, a mint glazed lantern and a solid C
    // medallion above the full-width dark entrance. The north-tip opening remains
    // between Shinsegae's west tower (east) and the separate GOTO MALL cover (west).
    const gateStone={tex:'ccGateBrick'};
    const gateS=-23.5,gateT=19.5;
    const gateFront=gateS-3,gateBack=gateS+3,doorS=gateFront+1.7;
    for(const t of [13.2,25.8])lbox(gateS,t,6,6,0,11.8,gateStone);
    // The roadview lettering's first word is blurred; SHINSEGAE is the review's
    // probable transcription, recorded in modeling.guesses rather than confirmed.
    lbox(gateFront+.12,gateT,.24,6.6,3.6,2.4,gateStone,{solid:false});
    lbox(gateFront+.04,gateT,.24,6.6,2.9,.7,0x1c1f1e,{solid:false});
    lsign('SHINSEGAE CENTRAL CITY',gateFront-.10,gateT,3.25,6.1,.32,'N',{bg:null,fg:'#f0eee6',bold:false});
    for(const t of [16.28,22.72])lwall(gateFront,t,gateBack,t,0,3.6,{mat:0x1c1f1e,thick:.16});
    K.hpoly(0x242b28,RECT(gateFront,16.36,gateBack,22.64),2.9,false);
    K.phys.addCeiling(RECT(gateFront,16.36,gateBack,22.64),2.9,{});
    K.hpoly(0x535650,RECT(gateFront,16.36,gateBack,22.64),.021,true);
    K.material('ccEntryDoors',new K.THREE.MeshLambertMaterial({color:0x2a3230,transparent:true,opacity:.88,side:K.THREE.DoubleSide}));
    // Four glazed leaves: the centre pair is held open, preserving the walk-in route.
    for(const [t0,t1] of [[16.36,18.275],[20.725,22.64]]){
      lwall(doorS,t0,doorS,t1,0,2.72,{mat:'ccEntryDoors',thick:.04});
      for(const t of [t0,t1])entryTube([doorS-.04,t,0],[doorS-.04,t,2.72],.06,0x646d66);
    }
    for(const t of [18.275,20.725]){
      lwall(doorS,t,doorS+1.225,t,0,2.72,{mat:'ccEntryDoors',thick:.04});
      entryTube([doorS+1.225,t,0],[doorS+1.225,t,2.72],.055,0x646d66);
      entryTube([doorS+1.08,t,.85],[doorS+1.08,t,1.4],.035,0x9fa6a1);
    }
    for(const y of [.05,2.72,2.9])entryTube([doorS,16.36,y],[doorS,22.64,y],.065,0x646d66);
    lwall(doorS,16.36,doorS,22.64,2.75,2.9,{mat:'ccEntryDoors',thick:.04,solid:false});
    // Three visible glass faces plus a rear closure and sloped roof make a volume.
    K.material('ccEntryRoof',new K.THREE.MeshLambertMaterial({color:0xa8cbbf,transparent:true,opacity:.75,side:K.THREE.DoubleSide,depthWrite:false}));
    const gateRoofY=ss=>10.2+(ss-gateFront)/6*.4;
    const gateAt=(ss,t,yy)=>{const[x,z]=P(ss,t);return[x,yy,z];};
    for(const ss of [gateFront,gateBack]){
      // One pane per face: custom transparent wall materials otherwise get two
      // double-sided faces from K.wall, making opacity .75 accumulate to .94.
      K.quad('ccEntryRoof',[gateAt(ss,16.2,6),gateAt(ss,22.8,6),gateAt(ss,22.8,gateRoofY(ss)),gateAt(ss,16.2,gateRoofY(ss))],ss===gateFront?[-AX,0,-AZ]:[AX,0,AZ]);
      for(const t of [16.2,17.85,21.15,22.8])entryTube([ss,t,6],[ss,t,gateRoofY(ss)],.075,0x3b4d46);
      // The centre upright starts above the emblem; no bar crosses its face.
      entryTube([ss,19.5,9.1],[ss,19.5,gateRoofY(ss)],.075,0x3b4d46);
      for(const yy of [6,7.6,9.2])entryTube([ss,16.2,yy],[ss,22.8,yy],.075,0x3b4d46);
    }
    for(const t of [16.2,22.8]){
      K.quad('ccEntryRoof',[gateAt(gateFront,t,6),gateAt(gateBack,t,6),gateAt(gateBack,t,gateRoofY(gateBack)),gateAt(gateFront,t,gateRoofY(gateFront))],[t<gateT?-EX:EX,0,t<gateT?-EZ:EZ]);
      for(let ss=gateFront;ss<=gateBack+.01;ss+=1.5)entryTube([ss,t,6],[ss,t,gateRoofY(ss)],.075,0x3b4d46);
      for(const yy of [6,7.6,9.2])entryTube([gateFront,t,yy],[gateBack,t,yy],.075,0x3b4d46);
    }
    // Solid dark disc, thick cream C opening to the viewer's right (-t), gold core.
    // Each relief face is ≥0.35 m ahead of the glazing; the centre is never hollow.
    const emblemArc=(outer,inner,a0,a1,mat,depth)=>{
      const n=Math.ceil((a1-a0)*20),at=(r,a,ss)=>{const q=P(ss,gateT-r*Math.cos(a));return[q[0],7.55+r*Math.sin(a),q[1]];};
      const front=gateFront-.35-depth,back=front+.08;
      for(let i=0;i<n;i++){
        const a=a0+(a1-a0)*i/n,b=a0+(a1-a0)*(i+1)/n;
        K.quad(mat,[at(outer,a,front),at(outer,b,front),at(inner,b,front),at(inner,a,front)],[-AX,0,-AZ]);
        for(const [r,side] of [[outer,1],[inner,-1]]){
          if(!r)continue;
          const m=(a+b)/2;
          K.quad(mat,[at(r,a,front),at(r,b,front),at(r,b,back),at(r,a,back)],[-EX*Math.cos(m)*side,Math.sin(m)*side,-EZ*Math.cos(m)*side]);
        }
      }
      if(a1-a0<2*PI-.01)for(const [a,side] of [[a0,-1],[a1,1]])
        K.quad(mat,[at(inner,a,front),at(outer,a,front),at(outer,a,back),at(inner,a,back)],[EX*Math.sin(a)*side,Math.cos(a)*side,EZ*Math.sin(a)*side]);
    };
    emblemArc(1.46,0,0,2*PI,0x262c2a,0);
    emblemArc(1.25,.6,PI*.18,PI*1.82,0xe8e4d6,.09);
    emblemArc(.55,0,0,2*PI,0x7d6d3a,.10);
    // cc_01: visible pale sloped roof remains below the 11.8 m pylon tops.
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
    K.hpoly('ccPlazaGranite',RECT(-50,0,-26.6,38.5),.018,true);
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
    K.texture('ccPlazaBronze',256,128,(g,w,h)=>{
      g.fillStyle='#6e5040';g.fillRect(0,0,w,h);
      const noise=K.rand(919);
      for(let i=0;i<5200;i++){
        g.fillStyle=['#8e6a52','#795641','#59473a','#80604c'][Math.floor(noise()*4)];
        g.fillRect(noise()*w,noise()*h,1+noise()*3,1+noise()*3);
      }
    },[1,1]);
    for(const t of [11,19,27]){
      const [x,z]=P(-45,t),r=1.02;
      K.dome({x,z,y:.018+r,rx:r,ry:r,rz:r,hemi:false,seg:36,rings:20,mat:t===19?'ccPlazaBronze':'ccPlazaStone'});
      // K.dome's collision starts at its equator; register the complete ground-level
      // footprint locally so the lower half also blocks the player.
      const circle=Array.from({length:20},(_,i)=>[x+Math.cos(i*PI/10)*r,z+Math.sin(i*PI/10)*r]);
      K.phys.addPolyWalls(circle,.018,.018+2*r,.02,'centralcity');
    }
    const benchAt=(u,y)=>{const q=P(-31,5+u);return[q[0],y,q[1]];};
    const benchCurve=[[-3,.55],[-1.2,.55],[-.7,.75],[-.25,1.15],[.2,1.22],[.65,.85],[1.1,.55],[3,.55]];
    for(let i=0;i<benchCurve.length-1;i++)entryTubeWorld(benchAt(...benchCurve[i]),benchAt(...benchCurve[i+1]),.24,0xb62436);
    for(const u of [-2.2,2.2])entryTubeWorld(benchAt(u,0),benchAt(u,.55),.16,0xb62436);

    // cc_01: black tubular street railing, with crossing and west entrance gaps.
    const plazaRail=(s0,t0,s1,t1)=>{
      const L=Math.hypot(s1-s0,t1-t0),n=Math.ceil(L/2);
      for(let i=0;i<=n;i++){
        const s=s0+(s1-s0)*i/n,t=t0+(t1-t0)*i/n;
        lcyl(s,t,.018,.035,1,0x25282a,{seg:8});
      }
      for(const y of [.52,1.018])entryTube([s0,t0,y],[s1,t1,y],.055,0x25282a);
      const a=P(s0,t0),b=P(s1,t1);K.phys.addWall(...a,...b,.018,1.018,.06,'centralcity');
    };
    plazaRail(-49.3,0,-49.3,14.5);plazaRail(-49.3,24,-49.3,38.5);
    plazaRail(-49.3,0,-41,0);plazaRail(-33,0,-28.7,0);
    // Inverted-U stands by the western end, clear of the east-facing stair mouth.
    for(const t of [2.5,4,5.5]){
      entryTube([-46.8,t,.05],[-46.8,t,.7],.055,0x454c49);
      entryTube([-45.6,t,.05],[-45.6,t,.7],.055,0x454c49);
      for(let k=0;k<8;k++){
        const a=PI*k/8,b=PI*(k+1)/8;
        entryTube([-46.2+.6*Math.cos(a),t,.7+.25*Math.sin(a)],[-46.2+.6*Math.cos(b),t,.7+.25*Math.sin(b)],.055,0x454c49);
      }
    }
    lcyl(-49.3,15.1,.018,.09,.95,0xe5e4df,{seg:12});
    for(const y of [.2,.58])lcyl(-49.3,15.1,y,.095,.18,0xb82736,{seg:12,solid:false});
    for(const t of [1.5,2.5])entryTube([-29.1,t,0],[-29.1,t,2.2],.065,0x474e4c);
    lbox(-29.1,2,.12,1.2,.4,1.8,0x1e3545,{solid:false});
    // Directory content stays simple: reference confirms board, not a legible map.
    lsign(['센트럴시티','안내'], -29.18,2,1.88,1,.42,'N',{bg:null,fg:'#e6e9e7'});

    // cc_01 right edge + cc_02 + aerial: one separate barrel-vaulted stair head.
    // gotomall.js has no exit at this footprint; do not duplicate the photo03 pavilion.
    const head={s0:-40.56,s1:-33.06,t0:-29.3,t1:-11.3},sc=(head.s0+head.s1)/2;
    K.material('ccStairGlass',new K.THREE.MeshLambertMaterial({color:0x9fbfb4,transparent:true,opacity:.68,side:K.THREE.DoubleSide,depthWrite:false}));
    const headGlass=(s0,t0,s1,t1,y0,y1,normal)=>{
      const a=P(s0,t0),b=P(s1,t1);
      K.quad('ccStairGlass',[[a[0],y0,a[1]],[b[0],y0,b[1]],[b[0],y1,b[1]],[a[0],y1,a[1]]],normal);
      K.phys.addWall(...a,...b,y0,y1,.035,'centralcity');
    };
    for(const ss of [head.s0,head.s1]){
      lwall(ss,head.t0,ss,head.t1,0,1.6,{mat:0x8d9294,thick:.12});
      headGlass(ss,head.t0,ss,head.t1,1.6,3.4,ss===head.s0?[-AX,0,-AZ]:[AX,0,AZ]);
      for(let t=head.t0;t<=head.t1+.01;t+=1.2){
        entryTube([ss,t,0],[ss,t,1.6],.025,0x686f70);
        entryTube([ss,t,1.6],[ss,t,3.5],.055,0x596563);
      }
      for(const y of [1.6,3.4])entryTube([ss,head.t0,y],[ss,head.t1,y],.075,0x687472);
    }
    for(const t of [head.t0,head.t1]){
      const ops=t===head.t1?[{at:3.75,w:3.2,y0:0,y1:2.8}]:[];
      lwall(head.s0,t,head.s1,t,0,1.6,{mat:0x8d9294,thick:.12,openings:ops});
      if(t===head.t0)headGlass(head.s0,t,head.s1,t,1.6,3.5,[-EX,0,-EZ]);
      else{
        headGlass(head.s0,t,sc-1.6,t,1.6,3.5,[EX,0,EZ]);
        headGlass(sc+1.6,t,head.s1,t,1.6,3.5,[EX,0,EZ]);
        headGlass(sc-1.6,t,sc+1.6,t,2.8,3.5,[EX,0,EZ]);
      }
      for(let ss=head.s0;ss<=head.s1+.01;ss+=1.2){
        if(t===head.t1&&Math.abs(ss-sc)<1.6)continue;
        entryTube([ss,t,0],[ss,t,1.6],.025,0x686f70);
        entryTube([ss,t,1.6],[ss,t,3.5],.055,0x596563);
      }
    }
    for(const ss of [sc-1.6,sc+1.6])entryTube([ss,head.t1,0],[ss,head.t1,2.8],.09,0x64716e);
    entryTube([sc-1.6,head.t1,2.8],[sc+1.6,head.t1,2.8],.09,0x64716e);
    const half=4.05,barrelR=(half*half+1)/2;
    const headRoofY=ss=>3.5+Math.sqrt(barrelR*barrelR-(ss-sc)*(ss-sc))-(barrelR-1);
    const headRoofAt=(ss,t)=>{const q=P(ss,t);return[q[0],headRoofY(ss),q[1]];};
    for(let k=0;k<18;k++){
      const sa=sc-half+k*half/9,sb=sc-half+(k+1)*half/9;
      const poly=[headRoofAt(sa,head.t0-.3),headRoofAt(sb,head.t0-.3),headRoofAt(sb,head.t1+.3),headRoofAt(sa,head.t1+.3)];
      const ds=(sa+sb)/2-sc,n=[AX*ds/barrelR,Math.sqrt(barrelR*barrelR-ds*ds)/barrelR,AZ*ds/barrelR];
      K.quad(0xd9dcda,poly,n);K.quad(0xc4ccca,poly,n.map(v=>-v));
    }
    // Glazed gables close the curved ends; the entrance remains open below y2.8.
    for(const t of [head.t0,head.t1]){
      const normal=t===head.t0?[-EX,0,-EZ]:[EX,0,EZ];
      for(let k=0;k<16;k++){
        const sa=head.s0+(head.s1-head.s0)*k/16,sb=head.s0+(head.s1-head.s0)*(k+1)/16;
        const a=P(sa,t),b=P(sb,t);
        K.quad('ccStairGlass',[[a[0],3.5,a[1]],[b[0],3.5,b[1]],headRoofAt(sb,t),headRoofAt(sa,t)],normal);
      }
      for(let ss=head.s0;ss<=head.s1+.01;ss+=1.2)entryTube([ss,t,3.5],[ss,t,headRoofY(ss)],.055,0x596563);
    }
    for(const ss of [head.s0,head.s1])lbox(ss,(head.t0+head.t1)/2,.13,18,3.4,headRoofY(ss)-3.4,0x8d9294,{solid:false});
    for(let t=head.t0;t<=head.t1+.01;t+=1.2)for(let k=0;k<18;k++){
      const sa=sc-half+k*half/9,sb=sc-half+(k+1)*half/9;
      entryTube([sa,t,headRoofY(sa)+.035],[sb,t,headRoofY(sb)+.035],.055,0xe2e5e1);
    }
    for(const ss of [sc-half,sc,sc+half])entryTube([ss,head.t0-.3,headRoofY(ss)],[ss,head.t1+.3,headRoofY(ss)],.10,0xaeb9b5);
    // Round11: no plan-backed down-stair at this pavilion. Flush paving closes the old 1.4m pit.
    K.slab(RECT(head.s0,head.t0,head.s1,head.t1),0,{mat:0x9b9d97,thick:.12,under:0x7d8581});

    // cc_02 / photo09: long translucent kerb cover, clear of OSM service drives.
    canopy(-47,-43,-45,-5,3.5);
    // Leafy 8–10 m trees behind the stair head screen the roof-access bridge.
    lbox(-30,-17,1.6,31,0,.35,gateStone);
    lbox(-30,-17,1.25,30.6,.35,.2,0x40533b,{solid:false});
    for(const [i,t] of [-31,-24,-17,-10,-3].entries())K.tree(...P(-30,t),{y:.4,h:[8.5,9,10,9.4,8.8][i],kind:'zelkova'});

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
    let p=sAt(-55); sign('CENTRAL CITY',{x:p[0],z:p[1],y:8.15,w:17,h:1.15,rotY:sf,bg:null,fg:'#ffffff'});
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
  // ================================================================= Round 10 official ground-floor plans
  // The official guides are schematic and their affine fit crosses the JW footprint.
  // Use explicitly recorded regional transforms; page relations are retained, distances are not surveyed.
  const YM=3.6;
  const planGate=(label,s,t,face='S',w=5,y=0)=>{
    const axis=face==='S'||face==='N';
    for(const d of [-w/2,w/2])lbox(s+(axis?0:d),t+(axis?d:0),.16,.16,y,3.2,0xa7a39a);
    lbox(s,t,axis?.18:w,axis?w:.18,y+2.95,.25,0x39342d,{solid:false});
    lsign(label,s+(face==='S'?.12:face==='N'?-.12:0),t+(face==='E'?.12:face==='W'?-.12:0),y+3.35,w,.5,face,{bg:'#40392e',fg:'#f6eedb',twoSided:true});
    // Door leaves are held open parallel to the jambs, never a glass collider across the passage.
    for(const d of [-w/2+.1,w/2-.1])lbox(s+(axis?.55:d),t+(axis?d:.55),axis?1.1:.035,axis?.035:1.1,y,2.8,'glass',{solid:false});
  };
  const officialShop=(name,s0,t0,s1,t1,face='W',kind='food',y=0,fit={})=>{
    KNOWN.add(name);
    const axis=face==='W'||face==='E'?'s':'t';
    shop({axis,u0:axis==='s'?s0:t0,u1:axis==='s'?s1:t1,
      f:face==='W'?t0:face==='E'?t1:face==='N'?s0:s1,
      b:face==='W'?t1:face==='E'?t0:face==='N'?s1:s0,
      y,h:y===YM?3.5:(y===0&&s1>61.5&&s0<138?3.3:3.9),name,kind,noBoard:true,famille:s0>=168.3&&y<=Y2,seed:Math.abs(Math.round(s0*31+t0)),...fit});
  };
  // Shared department-store openings: both jambs, thresholds and the full 8m passage stay clear.
  for(const [ss,label] of [[21,'신세계백화점 3게이트'],[46.2,'신세계백화점 1게이트 방면 연결']]){
    planGate(label,ss,38.1,'E',8);
    if(ss!==46.2)planGate(label,ss,23.1,'W',8);
    else{
      // CC-D2 / FeFx_233: this is a white open arcade, not a dark fascia
      // across a glass room. Retain the full eight-metre route to 신세계.
      for(const d of[-4.2,4.2]){
        lbox(ss+d,23.1,.36,.42,0,4.55,0xf4efe3,{solid:false});
        lbox(ss+d,23.1,.56,.62,3.18,.19,0xe6dcc8,{solid:false});
      }
      for(let k=0;k<24;k++){
        const a=PI*k/24,b=PI*(k+1)/24;
        entryTube([ss+4.2*Math.cos(a),23.1,3.35+1.45*Math.sin(a)],[ss+4.2*Math.cos(b),23.1,3.35+1.45*Math.sin(b)],.24,0xf1eadc);
      }
      lsign('신세계백화점',ss-3.85,23.03,2.65,.62,.26,'W',{bg:null,fg:'#534c40',pxPerM:130});
    }
    lbox(ss,30.6,.28,14.9,.032,.008,0xb89b64,{solid:false});
    for(const edge of ss===46.2?[]:[-4.25,4.25]){
      lwall(ss+edge,28,ss+edge,37.8,0,2.95,{mat:'glass',thick:.035,solid:false});
      lbox(ss+edge,32.9,.07,9.8,2.95,.08,0x87735b,{solid:false});
    }
    lzone(ss-4.1,22.8,ss+4.1,39.4,{name:'신세계백화점 연결통로',floor:'1F',sub:label,y0:0,y1:4.5,priority:7});
    K.hpoly({tex:'marble',color:0xf2ebe0,gloss:.7},RECT(ss-4,23,ss+4,38.5),.026,true);
  }
  // Official terminal west-side sequence (3,4,6,7,9,10,11), interrupted only by the shared door aisle.
  const terminalUnits=[
    [3,'파리바게트',26,31,'cafe'],[4,'이도곰탕',31,36,'food'],[6,'삼백집',36,41,'food'],
    [7,'북촌손만두',50.5,56,'food'],[9,'플리퍼스',56,62,'cafe'],[10,'비파티세리',62,69,'cafe'],[11,'오슬로',69,77,'cafe']
  ];
  for(const [id,name,a,b,kind]of terminalUnits){
    // The old schematic Oslo cell occupied the newly evidenced B1 descent.
    // Keep the tenant north of that corner as a deep, narrow cafe, with its
    // counter, espresso machines and four supported dining tables retained.
    if(id===11)officialShop(name,69,25.3,71.6,38,'W',kind);
    else officialShop(name,a,a>=50.5?30.5:28,b,38,'W',kind);
  }
  // FeFx_233's left-hand shop row has cream arches. Keep both original
  // occupied cells and their fittings behind the moulded openings.
  shopFurnish(0,()=>{
    for(const [a,b]of[[50.5,56],[56,62]]){
      const mid=(a+b)/2,r=(b-a)/2-.25;
      for(const ss of[a+.12,b-.12]){
        lbox(ss,30.32,.28,.30,0,3.30,0xf2ebdc,{solid:false});
        lbox(ss,30.32,.43,.43,3.08,.20,0xe5dac5,{solid:false});
      }
      for(let k=0;k<18;k++){
        const u=PI*k/18,v=PI*(k+1)/18;
        entryTube([mid+r*Math.cos(u),30.30,3.22+1.18*Math.sin(u)],[mid+r*Math.cos(v),30.30,3.22+1.18*Math.sin(v)],.20,0xf2ebdc);
      }
    }
  });
  shopFurnish(0,()=>{
    lbox(70.3,37.15,.84,.55,1.05,.44,'glass',{solid:false});
    for(const yy of [1.08,1.28]){
      lbox(70.3,37.15,.82,.53,yy,.025,0xb9a382,{solid:false});
      for(const ds of [-.28,-.09,.09,.28])lcyl(70.3+ds,37.15,yy+.03,.065,.07,0xd7b07a,{solid:false,seg:8});
    }
  });
  officialShop('굿모닝약국',-18,9,-13,12.5,'E','store');
  officialShop('이마트24 센트럴1호점',-18,22,-13,27,'E','store');
  // Official 14/15 curved block and 20/21 group are on the RIGHT when leaving J4.
  // Leaving SSG faces local -t; right is -s. No false "호남선 입구" label.
  officialShop('쉐이크쉑',5.5,27,12.2,35,'W');
  officialShop('우리은행',.5,29,5.5,38,'W','bank');
  officialShop('스타벅스',-10,28,.5,38,'W','cafe');
  officialShop('SK텔레콤',-17,28,-10,38,'W','store');
  for(const [name,ss,w]of [['쉐이크쉑',9,6],['우리은행',3,4],['스타벅스',-4.8,8],['SK텔레콤',-13.5,6]])
    lsign(name,ss,27.0,3.2,w,.55,'W',{bg:name==='우리은행'?'#135a9f':'#253e32',fg:'#fff9e6'});
  officialShop('오픈스테이지 스토어',-22,8,-18.5,13,'S','store');
  officialShop('디자인스킨',-22,28,-18.5,37.8,'S','store');
  K.detail({name:'호남선 1F · 쉐이크쉑 주문기와 은행 ATM 안내',floor:'1F',y0:0,y1:4.2,poly:RECT(-10,26,13,38)},()=>{
    lsign('우리은행 ATM',3,27.0,2.45,3.1,.32,'W',{bg:'#135a9f',fg:'#ffffff'});
    lsign('쉐이크쉑 · 119호',8.8,27.0,2.6,4.8,.30,'W',{bg:null,fg:'#f4f1e6'});
    // Blog stated three ordering kiosks; exact positions are an in-cell fit.
    for(const ss of [7,8.7,10.4]){
      lbox(ss,28.0,.35,.35,.03,.07,0x343a37,{solid:false});
      lbox(ss,28.0,.10,.10,.10,1.12,0x313936,{solid:false});
      lbox(ss,28.0,.48,.15,1.15,.65,0x202723,{solid:false});
      lsign(['주문하기','포장 · 매장'],ss,27.91,1.48,.42,.46,'W',{bg:'#e0e8d8',fg:'#2c473b'});
    }
  });
  // Rounded, low planter follows unit14's bowed front, not a solid wall across the sightline.
  for(let i=0;i<10;i++){
    const a=-PI/2+i*PI/20,b=-PI/2+(i+1)*PI/20;
    lwall(12.1+1.8*Math.cos(a),29.5+2.3*Math.sin(a),12.1+1.8*Math.cos(b),29.5+2.3*Math.sin(b),0,.55,{mat:0x52654c,thick:.12});
  }
  // The numbered plan's six hexagonal islands are kept separate from the perimeter stores.
  const hexUnits=[[5,'모스버거',-2],[8,'리김밥',25],[12,'스타벅스센트럴F1',47.5],[13,'델리에또',82],[26,'공탕',100],[29,"DUNKIN'",78.154]];
  K.detail({name:'공식 1층 육각 매장',floor:'1F',y0:0,y1:4,poly:RECT(-8,12,131,26)},()=>{
    for(const [id,name,ss]of hexUnits){
      const tt=id===29?23.9:14.3,poly=id===29?RECT(ss-2.6,tt-1.6,ss+2.6,tt+1.6):Array.from({length:6},(_,i)=>P(ss+1.9*Math.cos(i*PI/3),tt+1.9*Math.sin(i*PI/3)));
      K.prism(poly,0,.94,{mat:{tex:'wood',color:id===12?0x516c54:0xb78b54},top:0xe9e0d0});
      for(let n=0;n<4;n++){lbox(ss-1.05+n*.65,tt+.35,.36,.45,.96,.12,[0xb87b3e,0xe8d6b3,0x906740][n%3],{solid:false});}
      lbox(ss,tt-1.4,2.6,.35,1.0,1.7,0x534431,{solid:false});
      lbox(ss-.8,tt+.9,.37,.3,.94,.35,0x2c3030,{solid:false});
      lsign(name,ss,tt+1.92,2.5,3.8,.53,'E',{bg:'#312f2b',fg:'#ffffff'});
      lwall(ss-1.25,tt+1,ss+1.25,tt+1,1.0,1.45,{mat:'glass',thick:.02,solid:false});
      lperson(ss,tt-.7,0,{shirt:0x364d3f});
      if(id===29){
        // #519: the retained products/register now sit in the rectangular burgundy booth.
        lbox(ss,tt,5.4,3.35,2.80,.42,0x782c3e,{solid:false});
        for(const ds of[-2.5,2.5])lbox(ss+ds,tt+1.55,.12,.12,.94,1.87,0x782c3e,{solid:false});
        lbox(ss,tt-1.55,5.1,.13,.94,1.86,0x782c3e,{solid:false});
        lwall(ss-2.1,tt+1.62,ss+.5,tt+1.62,1.0,1.66,{mat:'glass',thick:.025,solid:false});
        for(const y of[1.05,1.36]){
          lbox(ss-.8,tt+.9,2.5,.9,y,.035,0xc4c5bc,{solid:false});
          for(let n=0;n<8;n++)lcyl(ss-1.85+n*.3,tt+1.1,y+.035,.10,.055,n%2?0xca9b61:0x805240,{solid:false,seg:10});
        }
        lbox(ss,tt+.7,4.6,.8,2.74,.04,{tex:'emit',color:0xffefcf},{solid:false});
      }
    }
  });
  officialShop('디지털기프트샵',104,8.7,109,11.7,'E','store');
  // Unit28 retains the detailed photographed 팥붕슈붕 kiosk, repositioned above to s113,t16.
  // Unmapped east-side plan cells remain plain. Official HTML supplies no36–42 name mapping.
  for(const [id,ss]of [[36,143],[37,149]]){
    lbox(ss,28,4,6,0,.9,0xcfc8ba,{top:0xece5da});
    lsign(id+'번 매장',ss,24.9,2.6,3.2,.45,'W',{bg:'#403c35',fg:'#f5f0e5'});
  }
  planGate('센트럴시티 출입구',-18.2,19.5,'N',4);
  //3/4arewayfindingpassagesbracketingofficial20/21; externaldoorworldpositionsremainunverified.
  planGate('센트럴시티 3게이트 방면',-17.8,25,'N',3);
  planGate('센트럴시티 4게이트 방면',.5,25,'S',3);
  planGate('센트럴시티 1게이트',-12,10.4,'W',4);
  planGate('센트럴시티 2게이트',-12,24,'W',4);
  // Open Stage: photo24 cream coffers, gold cornices, black LED columns and glossy diamond marble.
  // Current 2026-11-05..08 Lexus ES350e display is based on the supplied photograph and Segye article.
  // FeFx7kfWgdo_233 starts at the B1 escalator arrival. The low white coffer
  // ceiling belongs to this foreground, with the high truss hall visible beyond.
  K.hpoly(0xf6f2e9,RECT(42,8,61,23),5.82,false);
  K.phys.addCeiling(RECT(42,8,61,23),5.82,{});
  K.texture('ccEntryLed',128,512,(g,w,h)=>{
    g.fillStyle='#080d13';g.fillRect(0,0,w,h);
    for(let row=0;row<4;row++){
      const y=38+row*119,glow=g.createLinearGradient(0,y,w,y+65);glow.addColorStop(0,'#3b0c1f');glow.addColorStop(.45,'#ba1548');glow.addColorStop(1,'#ed567d');
      g.fillStyle=glow;g.fillRect(0,y,w,66);g.fillStyle='#e9f1f8';g.font='bold 10px sans-serif';g.textAlign='center';g.fillText('신세계센트럴시티',w/2,y+88);
      g.fillStyle='#f5a4b6';g.beginPath();g.arc(97,y+34,22,0,PI*2);g.fill();
    }
  },[1.2,5.55]);
  K.material('ccEntryLedGlow',new K.THREE.MeshBasicMaterial({map:K.T.surface('ccEntryLed').tex,color:0xffffff,side:K.THREE.DoubleSide}));
  K.detail({name:'호남선 1F 에스컬레이터 도착 · 흰 코퍼와 영상 기둥',floor:'1F',y0:0,y1:5.9,poly:RECT(40,8,70,27)},()=>{
    for(let ss=43.25;ss<60.6;ss+=2.5)for(let tt=9.25;tt<23;tt+=2.5){
      lbox(ss,tt,2.37,2.37,5.75,.035,0xe4dfd4,{solid:false});
      for(const d of[-1.22,1.22]){
        lbox(ss+d,tt,.16,2.5,5.37,.45,0xf3efe6,{solid:false});lbox(ss,tt+d,2.5,.16,5.37,.45,0xf3efe6,{solid:false});
        lbox(ss+d*.88,tt,.07,2.18,5.58,.12,0xd7cbb8,{solid:false});lbox(ss,tt+d*.88,2.18,.07,5.58,.12,0xd7cbb8,{solid:false});
      }
      for(const d of[-.88,.88])lcyl(ss+d,tt,5.69,.055,.025,{tex:'emit',color:0xffefce},{solid:false,seg:10});
    }
    for(const ss of[40.5,50,59.5,69]){
      const pts=RECT(ss-.605,19.895,ss+.605,21.105);
      for(let i=0;i<4;i++){
        const a=pts[i],b=pts[(i+1)%4],dx=b[0]-a[0],dz=b[1]-a[1],L=Math.hypot(dx,dz);
        K.quad('ccEntryLedGlow',[[a[0],.15,a[1]],[b[0],.15,b[1]],[b[0],5.70,b[1]],[a[0],5.70,a[1]]],[dz/L,0,-dx/L]);
      }
    }
    // CC-D2: the white lounge is right of the 236-degree camera axis.
    // Its six-by-four-metre pocket stays between the s50 and s59.5 LED piers.
    for(const [ss,tt,reverse]of[[54.8,18.4,false],[54.8,22.5,true]]){
      lbox(ss,tt,2.75,.92,.14,.29,0xefeee7);
      lbox(ss,tt+(reverse?.39:-.39),2.75,.17,.43,.42,0xe4e3dc,{solid:false});
      for(const d of[-1.29,1.29])lbox(ss+d,tt,.17,.92,.43,.24,0xf6f4ee,{solid:false});
      for(const d of[-.83,0,.83])lbox(ss+d,tt,.79,.69,.43,.08,0xfcf8ef,{solid:false});
      lperson(ss-.55,tt+(reverse?-.15:.15),0,{sit:true,rotY:reverse?F.W:F.E,shirt:reverse?0x596565:0xebe5da});
      const tableT=tt+(reverse?-1.1:1.1);
      lbox(ss,tableT,1.3,.72,.48,.07,{tex:'marble',color:0xf2efe6,gloss:.5});
      for(const d of[-.5,.5])lbox(ss+d,tableT,.05,.48,.07,.41,0xbfc0b5,{solid:false});
      lcyl(ss+.3,tableT,.55,.07,.11,0xf5eee2,{solid:false,seg:10});
    }
  });
  lzone(51,9,77,23,{name:'센트럴시티 오픈 스테이지',floor:'1F',sub:'시즌 팝업 · 신세계백화점 연결 광장',y0:0,y1:8.5,priority:6});
  for(const p of[RECT(51,9,74.35,23),RECT(74.35,9,77,16.4)])K.hpoly({tex:'marble',color:0xf0eee4,gloss:.7},p,.028,true);
  for(const ss of [53,59,65,71,77])for(const tt of [10,22])if(!(ss>=74&&tt>16))K.hpoly({color:0x242a27,gloss:.5},[P(ss-.7,tt),P(ss,tt-.7),P(ss+.7,tt),P(ss,tt+.7)],.032,true);
  K.hpoly(0xf1e8d6,RECT(50,8,78,23),8.1,false);K.phys.addCeiling(RECT(50,8,78,23),8.1,{});
  K.detail({name:'오픈 스테이지 건축 · 교체형 행사 바닥',floor:'1F',y0:0,y1:8.3,poly:RECT(50,8,78,23)},()=>{
    // F18: the stage's cream arcade sits above the shop fronts; it stops at the
    // stage boundary, leaving both confirmed department-store gate passages intact.
    for(let ss=53;ss<78;ss+=4.8){
      lbox(ss-2.25,22.8,.28,.35,4.95,2.65,0xe9dfcd,{solid:false});
      for(let k=0;k<18;k++){
        const a=PI*k/18,b=PI*(k+1)/18;
        entryTube([ss+2.1*Math.cos(a),22.8,6.45+1.12*Math.sin(a)],[ss+2.1*Math.cos(b),22.8,6.45+1.12*Math.sin(b)],.18,0xd8c4a0);
      }
      for(let d=-1.9;d<2;d+=.38)lcyl(ss+d,22.8,5.06,.065,.83,0xe5d8bf,{solid:false});
      lbox(ss,22.8,4.3,.36,5.92,.13,0xc5b48e,{solid:false});
    }
    for(const tt of [9.1,22.0])lbox(tt>16?62.4:64,tt,tt>16?23.8:27,.32,.036,.006,0xb5734d,{solid:false});
    for(let ss=51;ss<74;ss+=4.2){
      const end=Math.min(74.2,ss+6.2);
      entryTube([ss,9.4,.041],[end,21.6,.041],.065,0x747470);
      entryTube([ss,21.6,.041],[end,9.4,.041],.065,0x747470);
    }
    for(const ss of [54,73.2])for(const tt of [9.6,22.4]){
      lbox(ss,tt,1.05,1.05,0,5.6,0x101214);
      for(const face of ['E','W','S','N'])lsign(['신세계센트럴시티','오픈 스테이지'],ss,tt,3.15,.96,3.9,face,{bg:'#22495d',fg:'#e3eff3',box:0});
    }
    for(let ss=52;ss<77;ss+=5.5)for(let tt=9.5;tt<23;tt+=5.5){
      for(const d of [-2.5,2.5]){lbox(ss+d,tt,.16,5.2,7.85,.2,0xd5c4a5,{solid:false});lbox(ss,tt+d,5.2,.16,7.85,.2,0xd5c4a5,{solid:false});}
      for(const d of [-1.8,1.8])lcyl(ss+d,tt,7.82,.08,.03,{tex:'emit',color:0xfff0d5},{solid:false});
      lcyl(ss,tt,8.045,.45,.045,0xe0d6c1,{solid:false,seg:20});
    }
  });
  // Separate removable event layer: the official plan supplies the open floor,
  // while this dated installation is the2026-11-05..08 observed Lexus event.
  K.detail({name:'오픈 스테이지 · 2026년 11월5~8일 렉서스 팝업',floor:'1F',y0:0,y1:8.3,poly:RECT(50,8,78,23)},()=>{
    lbox(66,14.2,12,5.5,.03,.12,{tex:'marble',color:0xddd5c7,gloss:.5});
    const q=P(66,14.2);K.vehicle({x:q[0],z:q[1],y:.15,rotY:R,kind:'car',color:0x52687c,label:''});
    for(const [ss,tt]of [[60,11],[72,11],[69,18],[60,18]])lperson(ss,tt,0,{shirt:0x303735});
    for(const ss of [58,72]){lbox(ss,21,1.2,.7,0,.9,0xdad9d2);lwall(ss-.5,21,ss+.5,21,.9,1.45,{mat:'glass',thick:.025,solid:false});}
    lsign(['LEXUS','11월 5일~8일 · 오픈 스테이지'],65,10.3,2.8,6,.8,'W',{bg:'#252d35',fg:'#ffffff'});
  });
  // Two separate rising escalators are visible from the department-store connection.
  // Existing pair at40..48.8 reaches terminal middle floor; new7m flight reaches the SSG2F doorway deck.
  {const a=P(61,28),b=P(48,28);K.escalator(...a,...b,{w:1.2,ya:0,yb:7,dir:'up'});}
  hole(['f2'],RECT(47.5,27.1,61.7,28.9));
  K.slab(RECT(42.3,23,49.8,38.5),7,{mat:{tex:'marble',color:0xe7ded0,gloss:.5},holes:[RECT(48,27.1,50,28.9)],under:0xeee6d8,thick:.12});
  lsign('백화점 2층 ↑',61.5,28,3.1,4,.55,'S',{bg:'#3d382d',fg:'#fff'});
  lsign('중층 ↑',40,24.5,3,3,.5,'N',{bg:'#3d382d',fg:'#fff'});
  K.slab(RECT(47,34.3,55.2,38.6),7,{mat:{tex:'marble',color:0xe7ded0,gloss:.5},thick:.22});
  lzone(47,34.3,55.2,38.6,{name:'백화점 2층 연결',floor:'2F',sub:'신세계백화점 남서측 코어',y0:7,y1:10,priority:8});
  lzone(42.3,23,49.8,38.5,{name:'백화점 2층 연결',floor:'2F',sub:'신세계백화점',y0:7,y1:8.6,priority:8});
  // Round19 CC-L1/D1: the filmed black HoS descent has its own deep 1F
  // lobby; it is not the upper court. Everything remains east of the bus wall.
  // The marble comb pad ends at the heads, with 8.5 m of lobby before camera00.
  for(const [ss,dir]of[[75.15,'up'],[76.85,'down']]){
    K.escalator(...P(ss,17),...P(ss,28.5),{ya:YB1,yb:0,w:1.18,dir,sideMat:0x22272a});
    for(const ds of[-.69,.69]){
      const a=P(ss+ds,17),b=P(ss+ds,28.5);
      entryTubeWorld([a[0],YB1+.94,a[1]],[b[0],.94,b[1]],.075,0x252b2b);
    }
    for(const t of[28.35,28.65])lbox(ss,t,1.18,.24,.018,.014,0xb8c1bc,{solid:false});
  }
  for(const ss of[74.35,77.65])rail(ss,16.4,ss,28.5,0);
  rail(74.35,16.4,77.65,16.4,0);
  K.slab(RECT(73.6,14.6,78.4,17.1),YB1,{mat:0x343637,under:false,ceil:false,edge:false});
  K.texture('ccHosEntryHerringbone',512,512,(g,w,h)=>{
    g.fillStyle='#24282b';g.fillRect(0,0,w,h);
    g.save();g.translate(w/2,h/2);g.rotate(PI/4);
    for(let y=-640;y<640;y+=32)for(let x=-640;x<640;x+=128){
      const off=((y/32)%4)*32;
      g.fillStyle=['#2e3134','#34373a','#292d30','#303437'][Math.abs((x/128+y/32)%4)];
      g.fillRect(x+off+1,y+1,125,29);
      g.strokeStyle='#56595a';g.lineWidth=.75;g.strokeRect(x+off,y,128,32);
      g.fillStyle='#2c3032';g.fillRect(x+off+128,y+1,29,125);
    }
    g.restore();
  },[2.4,2.4]);
  K.hpoly({tex:'ccHosEntryHerringbone',gloss:.3},hosEntryLobby,.039,true);
  K.hpoly({tex:'marble',color:0xe0e0db,gloss:.5},RECT(73.1,28.5,79.1,31.5),.043,true);
  // Low black canopy and an opaque rear baffle conceal the lit terminal beyond.
  // The rear baffle is entirely over the well, above the descending users.
  const hosEntryCeiling=RECT(72.1,22.8,80.1,38.2);
  K.hpoly(0x1d1e20,hosEntryCeiling,4.65,false);K.phys.addCeiling(hosEntryCeiling,4.65,{});
  lwall(74.35,22.8,77.65,22.8,0,4.65,{mat:0x1d1e20,thick:.12,solid:false});
  lwall(72.1,24.5,72.1,38.2,0,4.65,{mat:0x1d1e20,thick:.16});
  lwall(80.1,24.5,80.1,38.2,0,4.65,{mat:{tex:'wood',color:0xb07a50},thick:.16});
  K.detail({name:'하우스 B1 내려가는 곳 · 검은 로비와 격자',floor:'1F',y0:0,y1:4.7,poly:hosEntryLobby},()=>{
    // Black fascia and small letters, with the backlit square screen above.
    lbox(76.1,26.4,6.0,.16,2.62,.42,0x111314,{solid:false});
    lsign('HOUSE OF SHINSEGAE',76.1,26.51,2.82,3,.25,'E',{bg:null,fg:'#f4f3ea',pxPerM:180});
    lbox(76.1,26.4,6.0,.08,3.04,1.55,{tex:'emit',color:0xece2c9},{solid:false});
    for(let ss=73.1;ss<79.12;ss+=.24)lbox(ss,26.46,.022,.025,3.04,1.55,0x25231f,{solid:false});
    for(let yy=3.04;yy<4.61;yy+=.24)lbox(76.1,26.46,6,.025,yy,.022,0x25231f,{solid:false});
    // Warm wood to the left in the west-facing view, matte black to the right.
    for(let t=25;t<38;t+=1.2)lbox(80.005,t,.014,.035,0,4.65,0x805338,{solid:false});
    lcyl(79.94,32.1,2.5,.095,.78,{tex:'emit',color:0xffe7c4},{solid:false,seg:16});
    for(const yy of[2.47,3.28])lcyl(79.94,32.1,yy,.115,.04,0xb9905a,{solid:false,seg:16});
    lsign(['B1 ↘','하우스 오브 신세계'],79.98,30.9,1.77,1.5,.48,'N',{bg:null,fg:'#f4e6ce',pxPerM:140});
    lsign('↑ 1F',79.98,35.9,2.05,.8,.25,'N',{bg:null,fg:'#f4e6ce',pxPerM:140});
    for(const t of[29.5,33.2]){
      const q=P(72.21,t);K.dome({x:q[0],z:q[1],y:2.67,rx:.09,ry:.11,rz:.09,mat:{tex:'emit',color:0xfff0d6},seg:12,rings:6,hemi:false});
    }
    entryTube([72.20,27.5,.44],[72.20,36.9,1.15],.035,{tex:'emit',color:0xffe3ac});
    for(const ss of[74.45,75.85,76.15,77.55]){
      const a=P(ss,27.8),b=P(ss,28.95);
      entryTubeWorld([a[0],.055,a[1]],[b[0],.055,b[1]],.06,{tex:'emit',color:0x50e8cf});
    }
  });
  lzone(72.1,28.5,80.1,38.2,{name:'하우스 오브 신세계',floor:'1F',sub:'지하 1층 내려가는 곳',y0:0,y1:4.65,priority:9});
  // Round18: the former s75 HOS descent was tied to the displaced upper court.
  // The court flights below share the interior B1/1F/1M void.
  // Round18 L1/L2: the same court is registered through all three floors.
  // These official guides are schematic: the east edge of this provisional
  // registration is now explicitly constrained to the existing interior court.
  // Its schematic source cannot supply one exterior-consistent metric scale.
  // Register every retained upper tenant, furnishing and railing to the same
  // interior court as B1. No part of this stack occupies the restored apron.
  const hosOuter={P,lbox,lsign,lwall,lcyl,lperson,rail,elev,lzone};
  {
  const P=(s,t)=>hosOuter.P(...hosMap(s,t));
  const RECT=(s0,t0,s1,t1)=>[P(s0,t0),P(s1,t0),P(s1,t1),P(s0,t1)];
  const lbox=(s,t,ds,dt,y,h,mat,o={})=>{const a=hosMap(s-ds/2,t-dt/2),b=hosMap(s+ds/2,t+dt/2);return hosOuter.lbox((a[0]+b[0])/2,(a[1]+b[1])/2,b[0]-a[0],b[1]-a[1],y,h,mat,o);};
  const lsign=(text,s,t,y,w,h,face,o={})=>{const q=hosMap(s,t);return hosOuter.lsign(text,...q,y,Math.min(w,face==='N'||face==='S'?7:6),h,face,o);};
  const lwall=(a,b,c,d,y0,y1,o={})=>hosOuter.lwall(...hosMap(a,b),...hosMap(c,d),y0,y1,o);
  const lcyl=(s,t,...args)=>hosOuter.lcyl(...hosMap(s,t),...args);
  const lperson=(s,t,...args)=>hosOuter.lperson(...hosMap(s,t),...args);
  const rail=(a,b,c,d,...args)=>hosOuter.rail(...hosMap(a,b),...hosMap(c,d),...args);
  const elev=(name,s,t,...args)=>hosOuter.elev(name,...hosMap(s,t),...args);
  const lzone=(a,b,c,d,o)=>hosOuter.lzone(...hosMap(a,b),...hosMap(c,d),o);
  const entryTube=(a,b,...args)=>{const qa=P(a[0],a[1]),qb=P(b[0],b[1]);entryTubeWorld([qa[0],a[2],qa[1]],[qb[0],b[2],qb[1]],...args);};
  const hosB1Void=RECT(-.836,-22.284,9.468,-13.084);
  const H1=(px,py)=>[4.316+(py-680.5)*(.092*85/126),-17.684-(px-1482.5)*(.092*85/126)];
  const HM=(px,py)=>[4.316+(py-695.5)*.039,-17.684-(px-1204.5)*.039];
  const upperPoly=(coords,fn=H1)=>coords.map(q=>P(...fn(...q)));
  const upperRect=(r,fn=H1)=>upperPoly([[r[0],r[1]],[r[2],r[1]],[r[2],r[3]],[r[0],r[3]]],fn);
  const hosDeck=upperRect([1149,250,1759,1338]);
  // Round20 ccm/L7: upper HOS court, tenants, deck, lift and flights move to cc1f under JW.
  // Keep this B1-owned wrapper/void datum for the ccb1 registration merge.
  K.detail({name:'하우스 보이드 · 허니 우드와 앰버 업라이트',floor:'B1',y0:YB1,y1:7.2,poly:hosDeck},()=>{
    for(const t of [-22.46,-12.91]){
      lbox(4.316,t,10.304,.18,YB1,-YB1,'ccHosHoney',{solid:false});
      for(let ss=-.55;ss<9.4;ss+=.96){
        lbox(ss,t,.045,.20,YB1,-YB1,0x6b4226,{solid:false});
        lbox(ss,t+(t<-17? .13:-.13),.12,.07,YB1+.1,.08,{tex:'emit',color:0xffc98a},{solid:false});
        const a=P(ss-.34,t+(t<-17?.12:-.12)),b=P(ss+.34,t+(t<-17?.12:-.12));
        K.quad('ccHosUplight',[[a[0],YB1+.12,a[1]],[b[0],YB1+.12,b[1]],[b[0],-.02,b[1]],[a[0],-.02,a[1]]],[EX,0,EZ]);
      }
    }
    for(const ss of[-1.0,9.7])for(const tt of[-22.9,-12.4]){
      lbox(ss,tt,.32,.32,YB1,-YB1,{color:0xc7b27c,gloss:.7},{solid:false});
      for(const d of[-.18,.18])lbox(ss+d,tt,.025,.35,YB1,-YB1,0x997537,{solid:false});
    }
    for(const y of [-.25])for(const tt of[-22.8,-12.55])lbox(4.3,tt,17.8,.16,y,.12,0xf1e6d2,{solid:false});
    for(const y of [-.12])for(const tt of[-22.72,-12.63])lbox(4.3,tt,17.8,.045,y,.045,{tex:'emit',color:0xffd69a},{solid:false});
  });
  K.texture('ccHosPersian',384,512,(g,w,h)=>{
    g.fillStyle='#914132';g.fillRect(0,0,w,h);
    for(const [i,c,b]of [[8,'#d8bc88',13],[24,'#243c52',8],[39,'#d6b68a',5]]){g.strokeStyle=c;g.lineWidth=b;g.strokeRect(i,i,w-i*2,h-i*2);}
    for(let y=50;y<h-40;y+=34)for(let x=45;x<w-30;x+=36){g.strokeStyle='#d4af7a';g.lineWidth=2;g.beginPath();g.moveTo(x,y-7);g.lineTo(x+6,y);g.lineTo(x,y+7);g.lineTo(x-6,y);g.closePath();g.stroke();}
  },[2.25,1.95]);
  }
  // Restore the already reviewed sofa/tub-chair islands, now on the correct B1
  // floor beneath the interior court. No terminal furniture is placed outdoors.
  const hosLoungeKit=K,hosLoungeBox=lbox,hosLoungeCyl=lcyl,hosLoungePerson=lperson;
  K.detail({name:'하우스 라운지 · 여섯 러그와 소파 · 28명',floor:'B1',y0:YB1,y1:0,poly:RECT(98.5,21,115.5,34)},()=>{
    const K={...hosLoungeKit,
      box:o=>hosLoungeKit.box({...o,y:(o.y??0)+YB1}),
      cyl:o=>hosLoungeKit.cyl({...o,y:(o.y??0)+YB1}),
      hpoly:(mat,poly,y,...args)=>hosLoungeKit.hpoly(mat,poly,y+YB1,...args)};
    const lbox=(s,t,ds,dt,y,...args)=>hosLoungeBox(s,t,ds,dt,y+YB1,...args);
    const lcyl=(s,t,y,...args)=>hosLoungeCyl(s,t,y+YB1,...args);
    const lperson=(s,t,y,...args)=>hosLoungePerson(s,t,y+YB1,...args);

    // 8xxIIvP9uAY_10: six separate islands; 9.5 m between escalator centre lines.
    // Rugs/furniture fill the court, with stone cross aisles and a central walnut bar.
    const table=(ss,tt,r=.43)=>{
      lcyl(ss,tt,.69,r,.07,{tex:'marble',color:0xf0e9de,gloss:.7},{seg:20});
      lcyl(ss,tt,.10,.075,.59,0x8b7353,{seg:8,solid:false});
      lcyl(ss,tt,.035,.26,.065,0x8c785b,{seg:12,solid:false});
      for(const d of [-.14,.14]){lcyl(ss+d,tt,.764,.105,.015,0xf4eee1,{solid:false,seg:12});lcyl(ss+d,tt+.10,.78,.043,.09,0xe4d9c5,{solid:false,seg:8});}
      lbox(ss,tt-.14,.17,.22,.765,.018,0xc4ad89,{solid:false});
    };
    const visitor=(ss,tt,angle,n)=>lperson(ss,tt,0,{sit:true,rotY:angle,shirt:[0xd7c6ad,0x383c38,0xf0e6d3,0x7d6858,0x88989a,0x544e49][n%6]});
    const tub=(ss,tt,angle,n)=>{
      const q=P(ss,tt),rot=angle;
      K.cyl({x:q[0],z:q[1],y:.14,r:.34,h:.31,mat:0xa7a53c,seg:12,solid:false});
      // Curved back occupies the rear half, with the open side facing the table.
      for(let k=0;k<9;k++){
        const a=rot+PI/2+k*PI/8;
        K.box({x:q[0]+Math.sin(a)*.30,z:q[1]+Math.cos(a)*.30,y:.40,w:.16,d:.12,h:.38,rotY:a,mat:0xa7a53c,solid:false});
      }
      visitor(ss,tt,angle,n);
    };
    for(const [row,ss]of [101.8,106.95,112.1].entries())for(const [col,tt]of [25.7,29.9].entries()){
      K.hpoly('ccHosPersian',RECT(ss-2.1,tt-1.45,ss+2.1,tt+1.45),.057,true);
      const idx=row*2+col;
      if(idx===1||idx===4){
        table(ss,tt,.54);
        tub(ss-1.08,tt,R,idx*4);tub(ss+1.08,tt,R+PI,idx*4+1);
        tub(ss,tt-.95,R+PI/2,idx*4+2);tub(ss,tt+.95,R-PI/2,idx*4+3);
      }else{
        for(const d of [-1.28,1.28]){
          lbox(ss+d,tt,.75,2.3,.10,.13,{tex:'wood',color:0x5c3c2c},{solid:false});
          lbox(ss+d,tt,.73,2.3,.23,.22,0xa34a2f,{solid:false});
          lbox(ss+d+Math.sign(d)*.31,tt,.14,2.3,.43,.48,0xa34a2f,{solid:false});
          for(const side of [-1.06,1.06])lbox(ss+d,tt+side,.73,.17,.43,.24,0xa34a2f,{solid:false});
          for(const side of [-.71,0,.71])lbox(ss+d-.03*Math.sign(d),tt+side,.58,.66,.45,.045,0xb45a3c,{solid:false});
          for(const side of [-.67,.67])visitor(ss+d,tt+side,d<0?R:R+PI,idx*4+(side>0?1:0)+(d>0?2:0));
        }
        table(ss,tt-.56);table(ss,tt+.56);
      }
    }
    lbox(106.95,27.8,3,1.1,0,1.04,{tex:'wood',color:0x805333},{top:{tex:'wood',color:0x9b6e46,gloss:.5}});
    for(const ss of [105.95,106.95,107.95]){lbox(ss,27.25,.7,.035,.18,.68,0x6a442a,{solid:false});lcyl(ss,27.8,1.05,.075,.16,0xc8ae81,{solid:false});}
    for(const [ss,tt]of [[104.85,27.8],[109.05,27.8],[98.1,29.4],[116.4,29.5]])lperson(ss,tt,0,{rotY:R+PI/2,shirt:0xb0a18b});
  });

  // Famille 1F: official raster coordinates. The long street is the south terminal wing;
  // OSM593858530 is its round annex, not the entire32-unit floorplate.
  // Round17: the schematic plans preserve tenancy order; photographed dining
  // fronts use open shells instead of the generic narrow, glazed restaurant cell.
  const famOpenShell=(s0,t0,s1,t1,y,back='ccFamBuffBrick')=>{
    lwall(s0,t0,s1,t0,y,y+3.4,{mat:back,thick:.15});
    lwall(s0,t1,s1,t1,y,y+3.4,{mat:back,thick:.15});
    lwall(s1,t0,s1,t1,y,y+3.4,{mat:back,thick:.15});
  };
  const famDiningTable=(s,t,y,seat=0x4b392b,occupied=2)=>{
    lbox(s,t,.78,.78,y+.72,.06,{color:0xe4d3b3,gloss:.3});
    for(const ds of [-.29,.29])for(const dt of [-.29,.29])lbox(s+ds,t+dt,.045,.045,y,.72,0x292926,{solid:false});
    for(const [i,dt]of [-.64,.64].entries()){
      lbox(s,t+dt,.44,.44,y+.43,.08,seat,{solid:false});
      lbox(s,t+dt+Math.sign(dt)*.2,.44,.06,y+.5,.42,seat,{solid:false});
      for(const a of [-.16,.16])for(const b of [-.16,.16])lbox(s+a,t+dt+b,.035,.035,y,.43,0x2c2924,{solid:false});
      lcyl(s,t+Math.sign(dt)*.22,y+.79,.13,.018,0xf2e8d7,{seg:12,solid:false});
      lcyl(s+.2,t+Math.sign(dt)*.22,y+.79,.045,.12,0xe8dfc9,{seg:8,solid:false});
      if(i<occupied)lperson(s,t+dt,y,{sit:true,rotY:dt<0?F.E:F.W,shirt:[0x514f42,0xb5a28d][i]});
    }
  };
  const FP=(px,py)=>[203-(py-47)*32/233,-96+(px-83)*132/1202];
  const famCells=[
    // Round20 famille/L2,L15: JAJU/아그라 and the east-end node belong to famille.js.
    ['3-1','',904,162,1007,249,'S','store'],['3-2','',1008,162,1141,249,'S','store'],
    [4,'센트럴연세치과',866,99,992,137,'N','office'],[5,'M플라워샵',845,191,902,218,'W','flower'],[6,'이마트24 파미에 1호점',845,219,902,249,'W','store'],
    [7,'크리스피프레시',754,48,862,89,'N','food'],[8,'천진포자',747,161,837,249,'W','food'],[9,'청담미역',720,87,785,131,'N','food'],
    [10,'마르르',706,216,744,248,'S','food'],[11,'한우리',705,161,728,213,'W','food'],[12,'포비',670,87,718,131,'N','cafe'],
    [13,'에토레',632,207,688,249,'W','food'],[14,'이마트24 파미에 2호점',616,161,688,205,'S','store'],[15,'차이797',632,48,668,131,'N','food'],
    [16,'폴바셋',581,87,630,131,'N','cafe'],[17,'일상정원',591,161,630,249,'S','food'],[18,'슈가스컬',553,161,589,249,'S','food'],
    [19,'키커피 컴퍼니',523,87,579,131,'N','cafe'],[20,'씨즈캔디',482,161,551,249,'W','store'],[21,'호호식당',408,92,449,131,'N','food'],
    [22,'젤라띠젤라띠',357,151,405,205,'W','cafe'],[23,'크림라벨',357,208,405,249,'W','cafe'],[24,'입점준비중',466,280,513,311,'S','office'],
    [25,'더블해피니스',515,280,551,314,'S','food'],[26,'오장동 함흥냉면',553,280,628,319,'S','food'],[27,'와라쿠샤샤',631,280,676,324,'S','food'],
    [28,'부다스벨리',354,92,405,131,'N','food'],[29,'와필레',316,49,352,131,'N','food'],
    [30,'',195,151,302,249,'E','food'],[31,'',478,87,521,131,'N','food']
  ];
  const famProjected=[];
  for(const [id,raw,x0,y0,x1,y1,face,kind]of famCells){
    // The bottom annex cells keep a 4.1m clear alley to the main row, within the real south wing.
    const a=FP(x0,y0),b=FP(x1,y1),annex=y0>=280,shift=[22,23].includes(id)?-4.5:0;
    const base0=annex?168.9:Math.max(171.1,Math.min(a[0],b[0]));
    // HgbY_36 shows an open arrival plaza before the north shop row. The plan
    // fixes cell ordering, but its diagrammatic aisle is narrower than the frame.
    // Refit the two facing rooms inside the same south row, preserving both tenants.
    const plazaRoom=[17,18].includes(id),s0=plazaRoom?171.1:base0+shift;
    const s1=plazaRoom?178.7:(annex?171.2:Math.max(base0+2.3,Math.max(a[0],b[0])))+shift;
    const t0=a[1]+.12,t1=b[1]-.12,name=raw||id+'번 매장';
    if(id===28)famOpenShell(s0,t0,s1,t1,0);else officialShop(name,s0,t0,s1,t1,face,kind,0,plazaRoom?{tableRows:3,seed:Math.abs(Math.round(base0*31+t0))}:{});
    famProjected.push({id,name:raw,s0,t0,s1,t1,face});
    // Every plan cell has a floor-rooted framed shopfront, including unassigned units.
    const isS=face==='S'||face==='N',fS=face==='S'?s1:face==='N'?s0:(s0+s1)/2,fT=face==='W'?t0:face==='E'?t1:(t0+t1)/2;
    const width=isS?t1-t0:s1-s0,normalS=face==='S'?1:face==='N'?-1:0,normalT=face==='E'?1:face==='W'?-1:0;
    for(const d of [-width/2+.12,width/2-.12]){
      const ps=fS+(isS?0:d),pt=fT+(isS?d:0);
      lbox(ps,pt,.24,.24,0,3.2,'ccFamBuffBrick');
      lbox(ps,pt,.36,.36,3.06,.16,0xe6dcc8,{solid:false});
    }
    lbox(fS,fT,isS?.26:width,isS?width:.26,3.12,.22,0xe6dcc8,{solid:false});
    // officialShop supplies the single, small charcoal fascia for each cell.
    // Door reveal and sill are flush; the facade glass itself is created by officialShop.
    lbox(fS+normalS*.17,fT+normalT*.17,isS?.45:Math.min(width-1,3),isS?Math.min(width-1,3):.45,.025,.015,0x8d8067,{solid:false});
    lzone(s0,t0,s1,t1,{name:raw||'파미에스테이션',floor:'1F',sub:'파미에스테이션',y0:0,y1:4.6,priority:7});
  }
  // Open circulation cross-aisles and two real terminal-side passages; no generic blocking front wall.
  const famFloor=RECT(171,-96,203,37);
  K.hpoly({tex:'tile',color:0xe2d3b9,gloss:.5},famFloor,.022,true,H.f1.filter(h=>K.pointInPoly(...h[0],famFloor)));
  // The filmed BUDDHA'S BELLY arch needs a double-height viewing bay. Widen
  // only this portion of the existing street void, as a single connected hole.
  const famVoidST=[[187.8,-92],[191.1,-92],[191.1,-68],[191.8,-68],[191.8,-59.8],[191.1,-59.8],
    [191.1,34],[187.8,34],[187.8,-59.8],[184.8,-59.8],[184.8,-68],[187.8,-68]];
  const famVoid=famVoidST.map(([s,t])=>P(s,t));
  hole(['f2'],famVoid);
  for(let i=0;i<famVoidST.length;i++){const a=famVoidST[i],b=famVoidST[(i+1)%famVoidST.length];rail(...a,...b,5);}
  lzone(168.3,-96,203.6,38,{name:'파미에스테이션',floor:'1F',sub:'1층 매장 · 1~7게이트',y0:0,y1:4.65,priority:5});
  lzone(187.8,-92,191.1,34,{name:'파미에스테이션 실내 거리',floor:'1F',sub:'1층 매장 안내',y0:0,y1:8.5,priority:6});
  const famGates=[[1,170.8,-28.7,'N'],[2,170.8,22,'N'],[3,189.3,22,'S'],[4,189.3,-54,'S'],[5,189.3,-96,'W'],[6,178,-86,'W'],[7,171,-70,'N']];
  for(const [id,ss,tt,face]of famGates)planGate('파미에스테이션 '+id+'게이트',ss,tt,face,4.5);
  // The two hall-side portals are genuine framed openings with brick returns and clear glazing.
  for(const [id,tt]of [[1,-28.7],[2,22]]){
    for(const d of [-3.2,3.2]){lbox(170.8,tt+d,1.1,1.55,0,4.3,'ccFamBuffBrick');lbox(170.8,tt+d,1.25,1.7,3.35,.2,0xe6dcc8,{solid:false});}
    lbox(170.8,tt,1.1,8,3.65,.65,'ccFamBuffBrick',{solid:false});
    lsign('파미에스테이션 '+id+'게이트',170.18,tt,3.24,5.7,.55,'N',{bg:'#324639',fg:'#fff1cd'});
    for(const d of [-2.37,2.37])lbox(170.8,tt+d,1.0,.035,.1,3.35,'glass',{solid:false});
    for(let i=0;i<16;i++){const a=i*PI/16,b=(i+1)*PI/16;beam([170.12,tt+2.95*Math.cos(a),3.7+1.1*Math.sin(a)],[170.12,tt+2.95*Math.cos(b),3.7+1.1*Math.sin(b)],.16,0xe9dec8);}
    lbox(179.7,tt,17.8,.16,.033,.006,0x9b8257,{solid:false});
    lfloorText('파미에스테이션 ↑',174,tt,.042,3.3,1.0,'S',{fg:'#4c5c47'});
  }
  // HgbY_flKpMI_29: a few steps down into the brick arcade, not a drop to B1.
  // Its surveyed location is unknown; fit the filmed threshold to Gate2 while
  // retaining a level passage on either side of the small central landing.
  K.slab(RECT(164.4,19.7,169.4,25.5),.72,{mat:{tex:'tile',color:0xd6c4a7,gloss:.3},thick:.18});
  {const a=P(162.3,22),b=P(164.4,22);K.stairs(...a,...b,{w:3,ya:0,yb:.72,mat:0xd8c6a8,steps:4,rails:false});}
  {const a=P(169.4,22),b=P(172.4,22);K.stairs(...a,...b,{w:3,ya:.72,yb:0,mat:0xd8c6a8,steps:4,rails:false});}
  // Keep a level-width ramp beside the stair, as the filmed entrance permits.
  {const a=P(169.4,24.7),b=P(175.4,24.7);K.ramp(...a,...b,{w:1.4,ya:.72,yb:0,mat:0xd8c6a8,rails:false});}
  K.detail({name:'파미에 Gate2 · 영상의 짧은 계단과 구형 가로등',floor:'1F',y0:0,y1:4.8,poly:RECT(162.3,18.5,176,27.8)},()=>{
    for(const t of [18.9,26.5]){
      lbox(166,t,.65,.8,0,4.45,'ccFamBuffBrick');
      lbox(166,t,.85,1,3.5,.22,0xe6dcc8,{solid:false});
    }
    // Two fanlight windows above the recessed shop backs flank the clear Gate2 lane.
    for(const t of [18.1,27.0]){
      lbox(175.1,t,.04,3,2.72,.88,'glass',{solid:false});
      lbox(175.08,t,.12,3.35,2.55,.18,0xe6dcc8,{solid:false});
      for(let i=0;i<18;i++){
        const a=i*PI/18,b=(i+1)*PI/18;
        beam([175.04,t+1.5*Math.cos(a),3.42+.95*Math.sin(a)],[175.04,t+1.5*Math.cos(b),3.42+.95*Math.sin(b)],.16,0xe6dcc8);
      }
      for(const a of [PI/4,PI/2,3*PI/4])entryTube([175.02,t,3.42],[175.02,t+1.42*Math.cos(a),3.42+.88*Math.sin(a)],.025,0x685f50);
    }
    for(const t of [20.35,23.65]){
      for(let i=0;i<7;i++){
        const s=169.4+i*.5,yy=.72*(1-i/6);
        lbox(s,t,.055,.055,yy,1.05,0x3f352d,{solid:false});
      }
      for(const h of [.45,1.05])entryTube([169.4,t,.72+h],[172.4,t,h],.06,0x3f352d);
    }
    // The filmed lamp is on the viewer's right when descending (+s).
    const s=168.75,t=19.85;
    lcyl(s,t,.72,.13,2.8,0x37352c,{seg:10,solid:false});
    lcyl(s,t,.72,.27,.13,0x37352c,{seg:10,solid:false});
    const q=P(s,t);K.dome({x:q[0],z:q[1],y:3.52,rx:.3,ry:.3,rz:.3,hemi:false,mat:{tex:'emit',color:0xf0e4c4},seg:12,rings:8});
    for(const dt of [-.31,.31])entryTube([s,t+dt,3.2],[s,t+dt,3.7],.035,0x39352b);
    lcyl(s,t,3.78,.35,.06,0x37352c,{seg:12,solid:false});
  });
  // Officialterminaldrop-offside36..42:unknownnamesstaynumbered, no guessedbrandbinding.
  for(const [id,a,b]of [[38,153,156],[39,156,159],[40,159,161.5],[41,161.5,164],[42,164,167.5]])officialShop(id+'번 매장',a,29,b,38,'W','store');
  // Door3/4 passages reach the station's already-built street exits; no duplicate unsupported ground hole.
  for(const [n,tt]of [[3,-54],[4,25]]){
    planGate('7호선 '+n+'번 출구 방면',203,tt,'S',4);
    lzone(197,tt-2.5,204,tt+2.5,{name:'파미에스테이션 출구 연결',floor:'1F',sub:'7호선 '+n+'번 출구 방면',y0:0,y1:4.7,priority:8});
  }
  lzone(149,13,172,24,{name:'센트럴시티 ↔ 파미에스테이션',floor:'1F',sub:'파미에 1·2게이트 · 호남선',y0:0,y1:4.7,priority:6});
  lzone(168.1,-30.5,172.3,24,{name:'파미에스테이션 1·2게이트 연결',floor:'1F',sub:'호남선 터미널 · 하차장',y0:0,y1:4.7,priority:6});
  K.detail({name:'파미에 공식 1F 거리와 점포 세부',floor:'1F',y0:0,y1:8.4,poly:famFloor},()=>{
    // HgbY_36: tactile route turns at right angles across the open arrival plaza.
    lbox(181.6,-40.8,4,.3,.034,.012,0xd2af51,{solid:false});
    lbox(183.6,-38.1,.3,5.7,.034,.012,0xd2af51,{solid:false});
    for(let s=179.6;s<183.6;s+=.12)lbox(s,-40.8,.028,.22,.047,.008,0xe7c868,{solid:false});
    for(let t=-40.8;t<-35.4;t+=.12)lbox(183.6,t,.22,.028,.047,.008,0xe7c868,{solid:false});
    for(let tt=-90;tt<35;tt+=7.2){
      for(const ss of [187.4,191.7]){
        if(ss>190&&Math.abs(tt-25.2)<1.1)continue; // keepofficialM1escalatorfreeofdecorativepiers
        if(ss<190&&tt>-71&&tt<-60)continue; // photographed 6.5m stand-off in front of BUDDHA'S BELLY
        if(ss<190&&tt>-45&&tt<-35)continue; // HgbY_36 open plaza, without a pier through its centre.
        lbox(ss,tt,.42,.5,0,4.3,'ccFamBuffBrick');lbox(ss,tt,.65,.7,4.3,.22,0xe6dcc8,{solid:false});
        for(let j=0;j<12;j++){const a=j*PI/12,b=(j+1)*PI/12;beam([ss,tt+3.2*Math.cos(a),5.4+1.6*Math.sin(a)],[ss,tt+3.2*Math.cos(b),5.4+1.6*Math.sin(b)],.15,0xe9dec8);}
      }
      lbox(189.45,tt,4.4,5.6,8.2,.06,{tex:'emit',color:0xf2eddc},{solid:false});
      lbox(189.45,tt,.08,5.8,8.1,.12,0x9c8d73,{solid:false});
    }
    for(const cell of famProjected){
      const {name,s0,s1,t0,t1,face}=cell,ss=(s0+s1)/2,tt=(t0+t1)/2;
      if(!name)continue;
      // Every known unit gets stock/menus/tableware in its own cell, never an inferred neighboring tenant.
      if(name.includes('이마트')||name==='JAJU'||name==='씨즈캔디'){
        // Backboards, upright standards, plinth and actual shelf boards anchor the stock.
        lbox(s0+.65,tt,.42,Math.max(1,t1-t0-1),0,2.25,0xbba98c);
        for(const yy of [.38,.98,1.58]){
          lbox(s0+.98,tt,.62,Math.max(1,t1-t0-1),yy,.055,0xe3d6bb,{solid:false});
          for(let n=0;n<6;n++)lbox(s0+1.0,t0+.6+n*(t1-t0-1.2)/6,.22,.22,yy+.055,.20,[0xcda66b,0x8ca99d,0xd3c4b1,0x9f7776][n%4],{solid:false});
        }
        for(const t of [t0+.55,t1-.55])lbox(s0+1,t,.64,.055,0,2.25,0x9b8868,{solid:false});
        lbox(ss,tt,1.8,Math.max(.8,t1-t0-2),0,.84,0xd4c3a4,{top:0xe9dfcb});
        lperson(s0+1.8,t1-.8,0,{shirt:0x454d3d});
      }
      if(name==='호호식당'||name==='아그라'||name==='일상정원'){
        for(const side of [-1,1]){lbox(ss,tt+side*(t1-t0)*.30,1.3,.38,.43,.11,name==='일상정원'?0xe7cbb8:0x4a3b2b,{solid:false});lbox(ss-.6,tt+side*(t1-t0)*.30,.07,.38,.49,.55,0x866e4e,{solid:false});}
        lcyl(ss,tt,.81,.15,.025,0xeee5d4,{solid:false});lcyl(ss+.25,tt,.81,.045,.12,0xe5dccc,{solid:false});
        lbox(ss,tt,.04,.22,.83,.22,0x2b3338,{solid:false});
      }
      if(name==='일상정원'){lbox(ss,tt,Math.min(4,s1-s0-1),.35,.015,.1,0x887d68,{top:{tex:'water',color:0x77958a}});}
    }
    for(const tt of [-78,-45,-12,16]){lbox(189.45,tt,.4,1.6,.4,.08,0x946e46);for(const d of [-.6,.6])lbox(189.45,tt+d,.32,.06,0,.4,0x292b28,{solid:false});}
    lsign(['파미에스테이션','1층 매장 안내'],189.5,-26,3.15,4.8,.7,'W',{bg:'#383228',fg:'#f4e6c5'});
    const buddh=famProjected.find(q=>q.id===28);
    if(buddh){
      const {s0,s1,t0,t1}=buddh,tt=(t0+t1)/2,w=t1-t0;
      lbox(s0-.05,tt,.28,w,2.65,.64,0x263e50,{solid:false});
      lsign("BUDDHA'S BELLY",s0-.21,tt,2.98,w-.5,.34,'N',{bg:null,fg:'#f2f4f3'});
      lwall(s0,t0+.35,s0,t1-.35,0,2.65,{mat:'glass',thick:.035,openings:[{at:w/2-.35,w:1.8,y0:0,y1:2.65}]});
      for(const t of [t0+.35,tt-.9,tt+.9,t1-.35])lbox(s0,t,.06,.055,0,2.65,0x2d3531,{solid:false});
      lbox(s0-.08,tt,.42,w+.5,3.38,.28,0xe8d9bd,{solid:false});
      lbox(s0-.1,tt,.49,w+.7,3.65,.12,0xf0e3cc,{solid:false});
      for(const t of [t0+.35,t1-.35])lbox(s0-.04,t,.32,.45,3.8,2.65,'ccFamBuffBrick',{solid:false});
      lbox(s0-.03,tt,.08,w-1,3.82,.85,'glass',{solid:false});
      for(let i=0;i<16;i++){const a=i*PI/16,b=(i+1)*PI/16;beam([s0-.2,tt+(w-1)/2*Math.cos(a),4.65+1.65*Math.sin(a)],[s0-.2,tt+(w-1)/2*Math.cos(b),4.65+1.65*Math.sin(b)],.18,0xe8d9bd);}
      for(const t of [tt-1,tt,tt+1])lbox(s0-.13,t,.08,.06,3.82,2.4,0x68645b,{solid:false});
      const badge=(a)=>{const q=P(s0-.22,tt+1.55+.45*Math.cos(a));return[q[0],1.75+.45*Math.sin(a),q[1]];},bc=P(s0-.22,tt+1.55);
      for(let i=0;i<24;i++)K.quad(0x273128,[[bc[0],1.75,bc[1]],badge(i*PI/12),badge((i+1)*PI/12),[bc[0],1.75,bc[1]]],[-AX,0,-AZ]);
      lsign('THAI CUISINE',s0-.25,tt+1.55,1.75,.85,.16,'N',{bg:null,fg:'#f2e4cb'});
      for(const ds of [1.7,3.4])famDiningTable(s0+ds,tt+.9,0,0x423a2a,1);
      lbox(s1-.6,tt,.7,w-.7,0,.96,{tex:'wood',color:0x5f432f},{top:0xb7a487});
      for(let i=0;i<7;i++)lcyl(s1-.6,t0+.5+i*(w-1)/7,.98,.05,.25,[0x4b7555,0xc7a35d,0x7a5b44][i%3],{solid:false});
      lperson(s1-1.2,tt,0,{shirt:0x1e2a29});
      lbox(s0-.7,t0+.5,.06,.06,0,1.1,0x555348,{solid:false});
      lsign(['메뉴','태국 요리'],s0-.75,t0+.5,1.25,.64,.45,'N',{bg:'#e7e1d4',fg:'#353a32'});
      lcyl(s0-.6,t1-.3,0,.42,.55,0x33352d,{seg:12});
      for(let i=0;i<7;i++){const q=P(s0-.6+.26*Math.cos(i),t1-.3+.26*Math.sin(i));K.dome({x:q[0],z:q[1],y:1.15,rx:.3,ry:.65,rz:.3,mat:0x4e6642,seg:7,rings:4});}
    }
    // Frame85's black-framed directory documents the upper restaurants without
    // assigning the unlocated 3F dome to the existing round pavilion.
    K.texture('ccFamDirectory17',1024,640,(g,w,h)=>{
      g.fillStyle='#f4f2e9';g.fillRect(0,0,w,h);g.textAlign='left';g.textBaseline='middle';
      g.fillStyle='#302c28';g.font='25px sans-serif';g.fillText('파미에스테이션 매장 안내',45,42);
      // The frame has dense small wordmarks on 1F/2F, but only a few on 3F
      // and M·2·3. Do not invent tenants merely to fill the unverified positions.
      const rows=[
        ['3F',96,1,['STARBUCKS']],
        ['2F',180,3,['HALF COFFEE','카츠8','매우매오','빈브라더스','ebt PIZZA','무월식탁','빗경','루경','담꽃','위치네일스','KERVAN','신세계아카데미','소이연남','서초구 육아나눔터','차알','딤딤섬']],
        ['M·2·3',337,1,['OUTBACK','딤딤섬']],
        ['1F',415,3,['JAJU','아그라','센트럴연세치과','M플라워샵','이마트24','크리스피프레시','천진포자','청담미역','마르르','한우리','FOURB','에토레','차이797','Paul Bassett','일상정원','슈가스컬','키커피 컴퍼니','씨즈캔디','호호식당','GELATI GELATI','크림라벨','더블해피니스','오장동 함흥냉면','와라쿠샤샤',"BUDDHA’S BELLY",'와필레']]
      ];
      rows.forEach(([floor,yy,count,brands])=>{
        g.textAlign='left';g.fillStyle='#83776a';g.font='21px sans-serif';g.fillText(floor,40,yy);
        const cols=count===1?Math.max(3,brands.length):9,dx=846/cols;
        brands.forEach((brand,i)=>{
          const xx=136+(i%cols+.5)*dx,by=yy+Math.floor(i/cols)*43;
          g.fillStyle=['#a34437','#375c45','#463e32','#987c45','#37435b','#835c7a'][i%6];
          let fs=brand.length>13?11:brand.length>8?13:16;
          g.font=(i%4===1?'bold ':'')+fs+'px '+(i%3===0?'serif':'sans-serif');g.textAlign='center';
          while(g.measureText(brand).width>dx-8&&fs>8){fs--;g.font=fs+'px '+(i%3===0?'serif':'sans-serif');}
          g.fillText(brand,xx,by);
          if(i%3===0){g.fillRect(xx-Math.min(dx*.25,22),by+12,Math.min(dx*.5,44),1);}
        });
        g.strokeStyle='#dedbd2';g.beginPath();g.moveTo(118,yy+count*43-13);g.lineTo(976,yy+count*43-13);g.stroke();
      });
    },[3.04,1.9]);
    // A dedicated flat brick panel is in front of the shop jambs, rather than
    // hanging a directory through an existing pier at t=-44.
    lbox(187.58,-41.5,.18,3.65,.35,2.75,'ccFamBrick',{solid:false});
    lbox(187.71,-41.5,.12,3.2,.62,2.06,0x282522,{solid:false});
    const da=P(187.78,-43.02),db=P(187.78,-39.98);
    K.quad('ccFamDirectory17',[[da[0],.7,da[1]],[db[0],.7,db[1]],[db[0],2.6,db[1]],[da[0],2.6,da[1]]],[AX,0,AZ]);
    lsign('파미에스테이션',187.79,-41.5,2.89,2.1,.25,'S',{bg:'#332b25',fg:'#c9b08b'});
  });
  // Round14: the official 2F main plate, numbered cells 1..13, retains each
  // shop's row/side and the octagonal core gap. Distances are a regional fit;
  // a continuous 2.4m gallery remains between the north and south rows.
  // The diagram's two-pixel aisle at cells4/1 cannot be given a uniform metric
  // scale. A monotone fit reserves 2.4m at each facing storefront row while
  // retaining all source-cell ordering and the complete existing floor outline.
  const F2_BANDS=[[0,187.4],[10,186.6],[37,185],[51,184],[76,182],[78,179.6],
    [95,178.6],[98,178.4],[104,176],[134,174.7],[137,174.5],[177,172.1],[226,168.5]];
  const F2S=py=>{for(let i=1;i<F2_BANDS.length;i++){const[a,b]=F2_BANDS[i-1],[c,d]=F2_BANDS[i];if(py<=c)return b+(py-a)*(d-b)/(c-a);}return 168.5;};
  // Video rooms are broader than the map's five-metre cells. This monotone
  // horizontal fit keeps every numbered unit and its order, including the core.
  const F2_T_BANDS=[[0,-96],[95,-85],[169,-76],[220,-64.5],[245,-61.8],[290,-57],
    [293,-56.7],[342,-47],[421,-39],[492,-31.5],[531,-27.5],[640,-16],[758,-3.5],[900,11.6],[1238,38]];
  const F2T=px=>{for(let i=1;i<F2_T_BANDS.length;i++){const[a,b]=F2_T_BANDS[i-1],[c,d]=F2_T_BANDS[i];if(px<=c)return b+(px-a)*(d-b)/(c-a);}return 38;};
  const F2P=(px,py)=>[F2S(py),F2T(px)];
  const fam2Cells=[
    [1,'하프커피',[777,78,1188,225],'S','cafe'],
    [2,'카츠8',[376,104,596,225],'S','food'],
    [3,'매우매오',[531,10,640,95],'N','food'],
    [4,'빈브라더스',[758,37,900,76],'N','cafe'],
    [5,'이비티 피자',[421,51,492,98],'N','food'],
    [6,'무월식탁',[342,51,421,98],'N','food'],
    [7,'빗경 · 루경 · 담꽃 · 위치네일스',[331,99,375,137],'W','store'],
    [8,'케르반 레스토랑',[293,51,342,98],'N','food'],
    [9,'신세계아카데미',[245,51,290,134],'N','office'],
    [10,'소이연남',[169,51,220,134],'N','food'],
    [11,'서초구 육아나눔터',[202,177,375,225],'S','office'],
    [12,'차알',[95,177,201,215],'S','food'],
    [13,'딤딤섬',[36,177,94,215],'S','food']
  ];
  const fam2Projected=[];
  for(const [id,name,r,front,kind]of fam2Cells){
    const a=F2P(r[0],r[1]),b=F2P(r[2],r[3]);
    // A schematic cell touching the main cross-aisle keeps a customer door facing
    // that aisle; all tenant fronts and furniture stay in their own mapped cell.
    // Soi's back is inset to leave a continuous 1.2m upper gallery around the
    // enlarged 1F viewing bay. The two dining rows retain all ten tables.
    const s0=id===10?177.2:id===5?181.3:Math.min(a[0],b[0]),s1=id===10?183.6:id===5?187.4:Math.max(a[0],b[0]),t0=a[1]+.12,t1=b[1]-.12;
    fam2Projected.push({id,name,s0,s1,t0,t1,front});
    if([5,8,10].includes(id)){
      famOpenShell(s0,t0,s1,t1,Y2,id===5?0xe9ddc6:'ccFamBuffBrick');
      if(id===5){
        // Two glazed display windows flank the open entry, not a glass tunnel.
        lwall(s0,t0,s0,t1,Y2,Y2+2.65,{mat:'glass',thick:.035,openings:[{at:(t1-t0)/2,w:1.6,y0:Y2,y1:Y2+2.65}]});
      }
    }else officialShop(name,s0,t0,s1,t1,front,kind,Y2);
    lzone(s0,t0,s1,t1,{name,floor:'2F',sub:'파미에스테이션 2층',y0:Y2,y1:8.6,priority:9});
  }
  lzone(168.3,-96,187.7,38,{name:'파미에스테이션',floor:'2F',sub:'하프커피 · 카츠8 · 이비티 피자 · 케르반 · 소이연남',y0:Y2,y1:8.6,priority:7});
  K.texture('ccEbtPicturePoster19',256,320,(g,w,h)=>{
    g.fillStyle='#e7b956';g.fillRect(0,0,w,h);
    // MMwn_125 has food photography without the invented Korean advertising copy.
    // Three shaded pizza/bread forms reproduce its image-led yellow posters.
    for(const [cx,cy,rr,bread]of [[.26,.23,.23,true],[.73,.47,.27,false],[.27,.77,.22,true]]){
      const x=cx*w,y=cy*h,r=rr*w;
      g.fillStyle='rgba(104,58,23,.18)';g.beginPath();g.ellipse(x+5,y+7,r,r*(bread?.76:1),0,0,PI*2);g.fill();
      const fill=g.createRadialGradient(x-r*.3,y-r*.35,r*.08,x,y,r);
      fill.addColorStop(0,bread?'#f7dc94':'#f4cf72');fill.addColorStop(.73,bread?'#e1b466':'#ddb465');fill.addColorStop(1,'#b27b3e');
      g.fillStyle=fill;g.beginPath();g.ellipse(x,y,r,r*(bread?.76:1),0,0,PI*2);g.fill();
      if(bread){g.strokeStyle='#f4dcaa';g.lineWidth=5;for(const d of [-.35,0,.35]){g.beginPath();g.moveTo(x+r*d-r*.18,y-r*.35);g.lineTo(x+r*d+r*.18,y+r*.3);g.stroke();}}
      else for(let i=0;i<17;i++){
        const a=i*2.4,rr2=r*.73*Math.sqrt((i+.5)/17);
        g.fillStyle=['#a64d32','#6e7042','#ede0a2'][i%3];g.beginPath();g.ellipse(x+Math.cos(a)*rr2,y+Math.sin(a)*rr2,4+i%3,3+i%2,a,0,PI*2);g.fill();
      }
    }
  },[1.4,1]);
  K.detail({name:'파미에 2F · 소이연남 케르반 이비티 공개 식당 전면',floor:'2F',y0:Y2,y1:8.7,poly:RECT(168.3,-96,187.7,38)},()=>{
    for(const {id,name,s0,s1,t0,t1}of fam2Projected){
      if(![5,8,10].includes(id))continue;
      const tt=(t0+t1)/2,w=t1-t0;
      K.hpoly({tex:'tile',color:id===5?0xe5ddcc:0xc4b49c,gloss:.3},RECT(s0,t0,s1,t1),Y2+.026,true);
      if(id===5){
        lbox(s0-.06,tt,.16,w,7.65,.75,{tex:'marble',color:0xe9ddc6,gloss:.3},{solid:false});
        lsign('ebt PIZZA',s0-.17,tt,8.12,1.9,.23,'N',{bg:null,fg:'#353129'});
        for(const side of [-1,1]){
          const t=tt+side*w*.29,ww=w*.35;
          for(let d=-ww/2;d<ww/2;d+=.18)lbox(s0-.25,t+d,.65,.17,7.54,.08,Math.round((d+ww/2)/.18)%2?0xf0e5cc:0xab4639,{solid:false});
          for(const dt of [-ww/2,0,ww/2])lbox(s0,t+dt,.065,.055,Y2,2.6,0xefe9dc,{solid:false});
          const pa=P(s0-.045,t-ww*.275),pb=P(s0-.045,t+ww*.275);
          K.quad('ccEbtPicturePoster19',[[pa[0],5.85,pa[1]],[pb[0],5.85,pb[1]],[pb[0],6.85,pb[1]],[pa[0],6.85,pa[1]]],[-AX,0,-AZ]);
          // The exterior folding seats have both crossed legs and supported backs.
          for(const ds of [-.55,-1.4]){
            lbox(s0+ds,t,.4,.4,Y2+.43,.035,0xeeeae1,{solid:false});
            lbox(s0+ds+.19,t,.045,.4,Y2+.46,.38,0xeeeae1,{solid:false});
            for(const d of [-.15,.15]){entryTube([s0+ds-.18,t+d,Y2],[s0+ds+.18,t+d,Y2+.43],.025,0xf1eee6);entryTube([s0+ds+.18,t+d,Y2],[s0+ds-.18,t+d,Y2+.43],.025,0xf1eee6);}
          }
          lbox(s0-1,t,.45,.5,Y2+.7,.045,0xf1eee6,{solid:false});
          for(const d of [-.18,.18])entryTube([s0-1.2,t+d,Y2],[s0-.8,t+d,Y2+.7],.025,0xeeeae1);
          for(const dt of [-ww/2,ww/2]){lcyl(s0-1.8,t+dt,Y2,.035,.93,0xb1b6b2,{seg:8,solid:false});lcyl(s0-1.8,t+dt,Y2,.12,.04,0x9da5a0,{seg:10,solid:false});}
          lbox(s0-1.8,t,.045,ww,Y2+.88,.07,0xa42d32,{solid:false});
          famDiningTable(s0+2.6,t,Y2,0x806d4e,1);
        }
        lbox(s1-.55,tt,.7,w-.8,Y2,1.0,0xd7c5a3,{top:0xe9e1d0});
        lperson(s1-1.1,tt,Y2,{shirt:0xf0e5d2});
      }else{
        lbox((s0+s1)/2,tt,s1-s0,w,8.4,.08,0x232726,{solid:false});
        for(let s=s0+.4;s<s1;s+=1.9)lbox(s,tt,.08,w,8.22,.15,0x3a3d39,{solid:false});
        for(let t=t0+.6;t<t1;t+=2.1)lbox((s0+s1)/2,t,s1-s0,.07,8.22,.15,0x3a3d39,{solid:false});
        if(id===8){
          lbox(s0-.08,t0+w*.25,.18,w*.48,7.58,.6,0x222b28,{solid:false});
          lsign('KERVAN',s0-.19,t0+w*.25,7.89,w*.4,.44,'N',{bg:null,fg:'#e8f3ff'});
          const qp=P(s0-.2,t0+.35);K.dome({x:qp[0],z:qp[1],y:7.9,rx:.07,ry:.22,rz:.22,mat:{tex:'emit',color:0xba3638},seg:12,rings:6});
          // Eight tables occupy the broad left dining area; bakery is on the right.
          for(let row=0;row<2;row++)for(let col=0;col<4;col++)famDiningTable(s0+1.3+row*2.2,t0+3.7+col*1.45,Y2,0x584634,row===0||col%2===0?2:1);
          lbox(s0+1.2,t0+1.25,1.9,2.0,Y2,.83,{tex:'wood',color:0x6c4931},{top:0xc5aa79});
          lbox(s0+1.2,t0+1.25,1.9,2.0,Y2+.83,.72,'glass',{solid:false});
          for(const yy of [Y2+.91,Y2+1.2]){
            lbox(s0+1.2,t0+1.25,1.8,1.9,yy,.035,0xb79a64,{solid:false});
            for(let i=0;i<3;i++)for(let j=0;j<4;j++)lcyl(s0+.6+i*.5,t0+.6+j*.4,yy+.05,.12,.09,[0xc9944a,0xd6ac62,0xa36b35][j%3],{seg:8,solid:false});
          }
          for(let t=t0+3;t<t1-.15;t+=.55)lbox(s0-.15,t,.035,.035,Y2,.95,0x292b27,{solid:false});
          for(const yy of [Y2+.25,Y2+.95])lbox(s0-.15,(t0+3+t1)/2,.055,t1-t0-3,yy,.045,0x292b27,{solid:false});
          for(let s=s0+.65,i=0;s<s1-.3;s+=1.2,i++)for(let t=t0+3.2,k=0;t<t1-.3;t+=1.2,k++){
            const lampY=Y2+2.4+((i+k)%3)*.2;
            lcyl(s,t,lampY+.16,.012,8.25-lampY-.16,0x655344,{seg:6,solid:false});
            const q=P(s,t);K.dome({x:q[0],z:q[1],y:lampY,rx:.13,ry:.18,rz:.13,hemi:false,mat:[0x65a4ad,0xdbaa5b,0xa66d6e][(i+k)%3],seg:10,rings:6});
            lcyl(s,t,lampY-.19,.055,.035,0xb4935a,{seg:8,solid:false});
          }
          lperson(s0+2.6,t0+1.3,Y2,{shirt:0x202626});
          lperson(s0+.1,t0+2.6,Y2,{shirt:0x7c7263});
        }else{
          lsign('소이연남',s0-.12,tt,7.98,2.7,.35,'N',{bg:null,fg:'#e7e1d1'});
          // Ten tables and twelve seated diners; all figures have chairs.
          for(let row=0;row<2;row++)for(let col=0;col<5;col++)famDiningTable(s0+2+row*2.6,t0+1.1+col*2.2,Y2,0x3e4034,row===0?2:col<2?1:0);
          for(let s=s0+1;s<s1-.4;s+=2.1)for(let t=t0+.8;t<t1-.3;t+=1.8){
            lcyl(s,t,8.05,.12,.06,{tex:'emit',color:0xffedce},{seg:12,solid:false});
            for(let j=0;j<3;j++){const q=P(s+.25+j*.18,t);K.dome({x:q[0],z:q[1],y:8.05-j*.12,rx:.17,ry:.23,rz:.2,mat:[0x546e49,0x687847,0x789052][j],seg:6,rings:3});}
          }
          lbox(s1-.5,tt,.65,w-1,Y2,.95,0x786548,{top:0xc5b490});
          lperson(s1-1.2,t1-1,Y2,{shirt:0xe9dfc9});
        }
      }
      // Actual back counters, registers, kitchen stock and menus replace the
      // repeated two-line brand board of the generic cell.
      lbox(s1-.55,t0+.8,.3,.4,Y2+1,.35,0x242927,{solid:false});
      for(let t=t0+.5;t<t1-.2;t+=.6){lcyl(s1-.4,t,Y2+1.02,.045,.17,0xded4bc,{solid:false});lbox(s1-.3,t,.16,.2,Y2+1.02,.14,0x785b40,{solid:false});}
      lsign('메뉴',s1-.12,t1-.65,7.3,.6,.35,'N',{bg:'#35392e',fg:'#e9dfca'});
    }
  });
  // Frame HgbY_flKpMI_29 shows a short local step down, not an entire B1 drop.
  // The authoritative 1F guide places both terminal gates on the same floor;
  // keep the two existing level connections and lead onward to the real exit.
  lsign('파미에스테이션 →',167,21.8,2.8,4.7,.5,'N',{bg:'#302d26',fg:'#f7d66a',twoSided:true});
  lsign('파미에스테이션 출입구',197,25.2,2.95,3.5,.5,'N',{bg:'#3a3427',fg:'#ffe280'});

  // Official Famille M1F drawing: Outback long west bar and DimDimSum east corner, not1F shops.
  officialShop('아웃백',193,-48,202,-5,'N','food',5);
  officialShop('딤딤섬',193,2,202,18,'N','food',5);
  lzone(190,-50,203,20,{name:'파미에스테이션 중층',floor:'1M',sub:'아웃백 · 딤딤섬',y0:5,y1:8.6,priority:8});
  // Round20 famille/L2: the paired 2F↔1F flights are rebuilt at (26,166)→(22,156) by famille.
  // No ghost flight, slab hole, landing rails or directional sign at this gallery end.
  lsign(['중층','아웃백 · 딤딤섬'],190.7,-5,7.5,4.8,.6,'N',{bg:'#393327',fg:'#fff0d7'});
  // Round19: retain Bodyfriend's full14×5.5 m shop and fixtures, rotated into
  // the north pocket. The old3.6 m deck covered the filmed black lobby's lattice.
  officialShop('바디프랜드',62,24,67.5,38,'S','store',YM);
  lzone(62,24,67.5,38,{name:'바디프랜드',floor:'1M',sub:'센트럴시티 중층',y0:YM,y1:7.6,priority:9});
  // Use an explicit rectangle, not an edge-touching hole that Earcut could fill.
  K.slab(RECT(61.5,23,72,38.3),YM,{mat:{tex:'marble',color:0xe2dacb,gloss:.5},thick:.2});
  // Inferred short transition preserves physical access after the rotated fit;
  // the top meets the retained5 m gallery, while the lower landing is3.6 m.
  K.stairs(...P(66,23.5),...P(61,23.5),{w:1.2,ya:YM,yb:Y2,mat:{tex:'marble',color:0xe2dacb},rails:true});
  K.slab(RECT(61.5,22.75,66.7,23),YM,{mat:{tex:'marble',color:0xe2dacb},under:false,ceil:false,thick:.12});


  // Round20 — private user walk #512–#532. Keep this replacement separate from
  // the strip-copy deletion (cc1f) and the B1 re-registration (ccb1).
  function honamR20() {
    const marble={tex:'marble',color:0xebebe8,gloss:.7};
    const frame={lbox,lwall,lsign,lcyl,lperson,hallTube,hallFace,hallBoard,hallClock,P};
    const inWell=(s,t)=>K.pointInPoly(...P(s,t),honamWellR20);
    // Freed north-strip cells become the terminal's public waiting/circulation
    // area. The plan is used for its boarding-side relation, never mirrored
    // to place a second Shake Shack/WOORI row here. Exact furniture is inferred.
    const northFill=RECT(-17,27,13,38.1);
    K.hpoly(marble,northFill,.037,true);
    K.hpoly(0xe8e5df,northFill,4.65,false);
    K.detail({name:'호남선 북측 대기 공간',floor:'1F',y0:0,y1:4.65,poly:northFill},()=>{
      for(const ss of[-13,-3,7]){
        lbox(ss,36.7,5.2,.64,.43,.07,0x292e30,{solid:false});
        lbox(ss,37,5.2,.08,.50,.45,0x252a2c,{solid:false});
        for(const d of[-2,2])lbox(ss+d,36.7,.10,.58,0,.43,0x7b8182,{solid:false});
        for(let n=0;n<7;n++)hallTube([ss-2.5+n*.83,36.42,.69],[ss-2.5+n*.83,36.95,.69],.035,0x9aa0a1);
        lperson(ss-1.5,36.55,0,{sit:true,rotY:F.W,shirt:0x4b535b});
      }
      for(let ss=-14;ss<13;ss+=4)lbox(ss,31.5,1.1,1.1,4.56,.035,{tex:'emit',color:0xf3f1e9},{solid:false});
      lsign(['호남선 터미널','승차홈 · 표사는 곳 →'],12.5,37.2,2.65,3.6,.6,'N',{bg:'#343a3c',fg:'#ffffff'});
    });
    const hallPoly=RECT(78,6.25,138,39.5);
    K.hpoly(marble,hallPoly,.045,true,[honamWellR20]);
    // The dropped beam is the hand-off to the coffered passage under JW.
    // Its soffit is high enough to retain the broad uninterrupted 1F opening.
    lbox(91.95,39.72,16.2,.62,7.8,.55,0xe9e5dc,{solid:false});
    lzone(83.8,6.2,138,40.2,{name:'호남선 대합실',floor:'1F',sub:'표사는 곳 · 승차홈 · 스위트 파크 연결',y0:0,y1:8.5,priority:10});

    // Back-fill the former Open Stage/Shake Shack strip. These structures are
    // terminal circulation, not another copy of the central hall under JW.
    const column=(ss,t)=>{
      lbox(ss,t,1.10,1.10,0,3.85,marble);
      lbox(ss,t,1.16,1.16,0,.15,0x242829,{solid:false});
      for(const y of[1.24,2.48,3.70])lbox(ss,t,1.105,1.105,y,.012,0xc5c9c5,{solid:false});
      const lo=RECT(ss-.55,t-.55,ss+.55,t+.55),hi=RECT(ss-.98,t-.98,ss+.98,t+.98);
      for(let k=0;k<4;k++){
        const j=(k+1)%4;
        K.quad(0x4b463f,[[lo[k][0],3.85,lo[k][1]],[lo[j][0],3.85,lo[j][1]],[hi[j][0],4.65,hi[j][1]],[hi[k][0],4.65,hi[k][1]]],[0,-1,0]);
      }
      for(const ds of[-1,1])for(const dt of[-1,1]){
        hallCurve(u=>[ss+ds*(.46+u*1.4),t+dt*(.46+u*1.4),4.55+1.55*Math.sin(u*PI/2)],8,.17,0xeef0ec);
        hallTube([ss+ds*.48,t+dt*.48,3.83],[ss+ds*.88,t+dt*.88,4.72],.14,0x403b36);
      }
    };
    const restoredS=[40.5,50,59.5,69,78.5,88,97.5,107,116.5,126,135.5];
    for(const ss of restoredS){column(ss,20.5);twinArch([ss,6.2],[ss,23],4.4,12.5);}
    // Northern bays already have their slatted roof; supply missing lattice
    // after cc1f removes the incompatible low Open Stage ceiling.
    for(const [a,b]of[[40.5,50],[50,59.5],[59.5,69],[69,78.5]]){
      twinArch([a,20.5],[b,20.5],4.4,9);
      hallTube([a,6.4,6.4],[b,20.3,7.68],.18);
      hallTube([a,20.3,7.68],[b,6.4,6.4],.18);
    }
    for(const ss of restoredS)twinArch([ss,20.5],[ss,39.5],4.4,16);
    for(const ss of[83,96,126.94,136])column(ss,ss===126.94?30.608:30);
    for(let ss=40.5;ss<135;ss+=9.5){
      const end=Math.min(ss+9.5,138);
      twinArch([ss,30],[end,30],5.35,9);
      hallTube([ss,21,6.8],[end,39,7.7],.16);
      hallTube([ss,39,7.7],[end,21,6.8],.16);
    }
    for(let t=23;t<39.5;t+=.5){
      const y=8.49-.18*Math.pow((t-30)/9,2),yy=8.49-.18*Math.pow((t+.5-30)/9,2);
      const a=P(40,t),b=P(138,t),c=P(138,t+.5),d=P(40,t+.5);
      K.quad(0x4f545a,[[a[0],y,a[1]],[b[0],y,b[1]],[c[0],yy,c[1]],[d[0],yy,d[1]]],[0,-1,0]);
      hallTube([40,t,y-.025],[138,t,y-.025],.025,0x6a7075);
    }
    for(const ss of[44,53.5,63,72.5,82,91.5,101,110.5,120,129.5,137])for(const t of[24,34,38]){
      lcyl(ss,t,8.08,.15,.06,0x373b3f,{solid:false,seg:12});
      lcyl(ss,t,8.065,.10,.025,{tex:'emit',color:0xf0f1e9},{solid:false,seg:12});
    }
    // New double charcoal lines: large diamonds, aligned with the terminal
    // grid and clipped segment-by-segment so no finish bridges the open well.
    for(const dir of[-1,1])for(let origin=38;origin<182;origin+=12)for(const offset of[-.24,.24]){
      for(let t=6.35;t<39.15;t+=.4){
        const s=origin+dir*(t-6.35)+offset;
        const poly=[[s-.065,t],[s+.065,t],[s+dir*.4+.065,t+.4],[s+dir*.4-.065,t+.4]];
        if(poly.some(([u,v])=>u<78.1||u>137.9||inWell(u,v)))continue;
        K.hpoly(0x3d4146,poly.map(q=>P(...q)),.049,true);
      }
    }

    // One photographed B1 pair. Slot corners are the shared world contract,
    // independent of any schematic-plan projection or upper HOS void.
    const top=[-64.9,112.8],foot=[-69.2,102.5];
    const es=(dx,dz)=>[dx/Math.hypot(dx,dz),dz/Math.hypot(dx,dz)];
    const along=es(top[0]-foot[0],top[1]-foot[1]),cross=[along[1],-along[0]];
    // The photographed head is 1.4m inside the slot outline: bridge that last
    // flat landing explicitly (K.escalator supplies only the sloping run).
    const headLeft=[top[0]-cross[0]*1.95,top[1]-cross[1]*1.95],headRight=[top[0]+cross[0]*1.95,top[1]+cross[1]*1.95];
    K.slab([headLeft,honamWellR20[1],honamWellR20[2],headRight],0,{mat:marble,under:0xe9e6dd,thick:.18});
    for(const [offset,dir]of[[-.78,'up'],[.78,'down']]){
      K.escalator(foot[0]+cross[0]*offset,foot[1]+cross[1]*offset,top[0]+cross[0]*offset,top[1]+cross[1]*offset,{ya:YB1,yb:0,w:1.22,dir,sideMat:0x161a1b,under:0xc8ccca});
    }
    const wellRail=(a,b)=>{
      K.wall(...a,...b,0,1.10,{mat:'glass',thick:.045});
      entryTubeWorld([a[0],1.11,a[1]],[b[0],1.11,b[1]],.075,{color:0xaeb8b8,gloss:.7});
      const L=Math.hypot(b[0]-a[0],b[1]-a[1]);
      for(let d=0;d<=L;d+=1.5){const u=d/L;K.cyl({x:a[0]+(b[0]-a[0])*u,z:a[1]+(b[1]-a[1])*u,y:.02,r:.025,h:1.03,mat:0xadb6b6,seg:8,solid:false});}
      K.wall(...a,...b,.01,.12,{mat:0x171c1d,thick:.10,solid:false});
    };
    wellRail(honamWellR20[0],honamWellR20[1]);wellRail(honamWellR20[3],honamWellR20[2]);wellRail(honamWellR20[0],honamWellR20[3]);
    // The open SSE edge gives both lanes a level landing; no glass across it.
    lbox(108.20,28.55,.20,3.8,-1.45,1.40,0xf0ece2,{solid:false});
    lsign(['SHINSEGAE | 스위트 파크','신세계 마켓 (식품관)'],108.34,28.70,-.66,3.2,.55,'S',{bg:null,fg:'#3a3c3c',bold:false,pxPerM:130});
    lsign('✿',108.35,26.95,-.64,.32,.38,'S',{bg:null,fg:'#9d3542',pxPerM:140});
    lfloorText('B1',108.8,28.2,YB1+.025,.8,.6,'N',{fg:'#42413d'});
    lsign(['호남선 터미널 (신세계센트럴시티) ↗','파미에스테이션 FAMILLE STATION'],108.1,30.15,YB1+2.15,3.5,.62,'W',{bg:'#eee9dc',fg:'#3d3e39',bold:false});

    // Ticket-office transplant keeps the original staffed desks, microphones,
    // slatted crown, clocks, four screen panels, landscape LED and queues.
    // Local old envelope 15×6.6 m -> freestanding 10×4 m at (-73,106).
    {
      const sx=10/15,tx=4/6.6,hy=.88;
      const pos=(s,t)=>[112.327+(s-94)*sx,23.433+(t-9.3)*tx];
      const P=(s,t)=>frame.P(...pos(s,t));
      const lbox=(s,t,ds,dt,y,h,mat,o={})=>frame.lbox(...pos(s,t),ds*sx,dt*tx,y*hy,h*hy,mat,o);
      const lwall=(a,b,c,d,y0,y1,o={})=>frame.lwall(...pos(a,b),...pos(c,d),y0*hy,y1*hy,o);
      const lsign=(text,s,t,y,w,h,face,o={})=>frame.lsign(text,...pos(s,t),y*hy,w*(face==='N'||face==='S'?tx:sx),h*hy,face,o);
      const lcyl=(s,t,y,r,h,mat,o={})=>frame.lcyl(...pos(s,t),y*hy,r,h*hy,mat,o);
      const lperson=(s,t,y,o={})=>frame.lperson(...pos(s,t),y*hy,o);
      const hallTube=(a,b,d,mat)=>frame.hallTube([...pos(a[0],a[1]),a[2]*hy],[...pos(b[0],b[1]),b[2]*hy],d,mat);
      const hallFace=(mat,s,t,y,w,h,face='E')=>frame.hallFace(mat,...pos(s,t),y*hy,w*sx,h*hy,face);
      const hallBoard=(s,t,y,w,h)=>frame.hallBoard(...pos(s,t),y*hy,w*sx,h*hy);
      const hallClock=(s,t,y,size)=>frame.hallClock(...pos(s,t),y*hy,size*sx);
      lwall(86.5,6,101.5,6,0,3.25,{mat:0xeadcc3,thick:.14});
      // Retained detailed counter from rounds 8–19, transformed into the new island.
      K.texture('ccHallLandscape',512,192,(g,w,h)=>{
        const sky=g.createLinearGradient(0,0,0,h);sky.addColorStop(0,'#5cbbec');sky.addColorStop(1,'#d9e8e1');g.fillStyle=sky;g.fillRect(0,0,w,h);
        // Photo08's scenic LED is soft foliage and flower colour, not geometric city blocks.
        for(const [yy,col]of[[.48,'#9ab9aa'],[.55,'#638c75'],[.65,'#3f745c']]){
          g.fillStyle=col;g.beginPath();g.moveTo(0,h);
          for(let k=0;k<=64;k++)g.lineTo(k*w/64,h*(yy-.055*Math.sin(k*.34)-.025*Math.sin(k*.91)));
          g.lineTo(w,h);g.closePath();g.fill();
        }
        const r=K.rand(2408);
        for(let k=0;k<380;k++){
          const x=r()*w,y=h*(.47+r()*.34),sz=1.3+r()*4;
          g.fillStyle=['#346342','#548252','#70925f','#92a66b'][k%4];g.beginPath();g.arc(x,y,sz,0,2*PI);g.fill();
        }
        g.fillStyle='#86bcc6';g.beginPath();g.moveTo(w*.54,h*.56);g.bezierCurveTo(w*.58,h*.70,w*.49,h*.78,w*.39,h);g.lineTo(w*.75,h);g.bezierCurveTo(w*.59,h*.80,w*.61,h*.69,w*.59,h*.56);g.closePath();g.fill();
        for(let k=0;k<300;k++){
          const x=r()*w,y=h*(.75+r()*.25);if(x>w*.38&&x<w*.76)continue;
          g.fillStyle=['#e9b8cf','#dd89ac','#f2d8de','#cfa1c3','#cdd2a0'][k%5];g.beginPath();g.arc(x,y,1+r()*2.2,0,2*PI);g.fill();
        }
      },[1,1]);
      const ticketArch=(s,t,w)=>{
        const spring=2.2,rise=.9,edge=.17,at=(u,outer)=>{const q=PI*u,[x,z]=P(s+Math.cos(q)*(w/2+outer*edge),t);return[x,(spring+Math.sin(q)*(rise+outer*edge))*hy,z];};
        for(let k=0;k<18;k++)K.quad(0xe9dcc4,[at(k/18,0),at((k+1)/18,0),at((k+1)/18,1),at(k/18,1)],[EX,0,EZ]);
        for(const ds of [-w/2-edge/2,w/2+edge/2])lbox(s+ds,t,edge,.16,1.03,spring-1.03,0xe9dcc4,{solid:false});
      };
      {
        const s0=TICKET.s0,s1=TICKET.s1,sc=(s0+s1)/2;
        lwall(s0,6,s0,12.6,Y1,3.7,{mat:0xeadcc3});lwall(s1,6,s1,12.6,Y1,3.7,{mat:0xeadcc3});
        lwall(s0,10.8,s1,10.8,Y1,3.25,{mat:0x2b2925,thick:.14});
        hallFurnish(()=>{
        for(let s=s0+.1;s<s1;s+=.22)lbox(s,10.92,.055,.05,.2,2.85,0x5b5246,{solid:false});
        for(const c of [s0+2.6,sc,s1-2.6]){ticketArch(c,11.02,4.2);lsign('13:07',c,11.10,2.75,.72,.20,'E',{bg:'#111111',fg:'#ff3b2f',pxPerM:110});}
        lbox(sc,12.3,s1-s0,.72,Y1,1.03,0xa39d91,{top:0x353a38});
        for(let s=s0+.1;s<s1;s+=.18)lbox(s,12.68,.045,.025,.1,.78,0xc4bcac,{solid:false});
        lbox(sc,12.20,s1-s0,.55,2.98,.72,0xc2a078,{solid:false});
        for(let yy=3.04;yy<3.7;yy+=.14)lbox(sc,12.50,s1-s0,.035,yy,.038,0xe4c99e,{solid:false});
        lsign('TICKETS 표사는곳',sc-.35,12.55,3.33,5.5,.52,'E',{bg:null,fg:'#ffffff',pxPerM:90});
        lsign('◎',sc+2.75,12.56,3.34,.56,.56,'E',{bg:null,fg:'#ffffff',pxPerM:120});
        for(let k=0;k<6;k++){
          const ss=s0+1.3+k*(s1-s0-2.6)/5;
          lperson(ss,11.4,Y1,{rotY:F.E,shirt:0x202a29,sit:true});
          lbox(ss,11.82,.48,.22,1.03,.36,0x1e2528,{solid:false});
          lbox(ss,12.20,.34,.22,1.04,.02,0xece8dd,{solid:false});
          hallTube([ss+.42,12.12,1.05],[ss+.42,12.12,1.31],.025,0x6f7771);
          hallTube([ss+.42,12.12,1.31],[ss+.35,12.24,1.35],.025,0x6f7771);
          lsign(String(k+1),ss+.55,12.70,.82,.20,.18,'E',{bg:null,fg:'#454740',pxPerM:150});
          lbox(ss-.35,12.36,.12,.07,1.04,.16,0x536169,{solid:false});
        }
        for(const ds of [-5.5,5.5])for(const off of [-.98,.98])hallBoard(sc+ds+off,12.30,4.33,1.9,1.22);
        lbox(sc-.5,11.6,7.5,.20,4.9,2.4,0x222a2c,{solid:false});
        hallFace('ccHallLandscape',sc-.5,11.73,6.1,7.5,2.4);
        lbox(sc+4.05,11.6,1.4,.2,5.1,2.0,0x302b49,{solid:false});
        hallClock(sc+4.05,11.74,6.1,1.35);
        // The relocated E2 leaves the marble diamond and queue approach unobstructed.
        for(let ss=s0+.6;ss<s1;ss+=2.3){
          lcyl(ss,13.1,0,.18,.04,0x252725,{solid:false});lcyl(ss,13.1,.04,.035,.94,0x252725,{solid:false});
          if(ss+2.3<s1)lbox(ss+1.15,13.1,2.3,.045,.82,.065,0x282b28,{solid:false});
        }
        for(const ss of [s0+.8,s1-1.1])lperson(ss,13.4,0,{shirt:0x605f55});
        lsign('TICKETS 표사는곳',s1+.20,9.3,3.45,5.7,.5,'S',{bg:'#555b62',fg:'#ffffff',pxPerM:60});
        for(let k=0;k<5;k++){
          const ss=s0-2.4-k*1.05;
          lbox(ss,12.5,.82,.62,0,1.58,k%2?0xe3e0d5:0xe7dcc7,{top:0xc9c6ba});
          hallFace({tex:'emit',color:0x6e9caf},ss,12.83,1.17,.59,.54);
          lbox(ss,12.84,.78,.025,1.52,.16,0xe99a48,{solid:false});
          lsign('무인발권',ss,12.85,1.72,.78,.17,'E',{bg:'#1c3b57',fg:'#fff'});
          lbox(ss,12.84,.35,.06,.65,.07,0x303736,{solid:false});
        }
        lsign(['매표소','무인 시스템 운영','무인발권기 이용 안내'],84,10.2,1.2,.85,1.65,'E',{bg:'#7b6d68',fg:'#f4eedf',box:.06,pxPerM:110});
        });
      }

    }

    // Photographed tenant islands: all dimensions are perspective fits; the
    // anchors, orientation and walking gaps follow the approved user poses.
    const emS=98.559,emT=26.664;
    lbox(emS,emT,5.6,3.8,0,.9,0xeee5cc,{top:0x292c2c});
    lbox(emS+2.55,emT,.5,3.8,.9,2.05,0x343330);
    for(const t of[emT-1.84,emT+1.84])lbox(emS,t,5.6,.14,2.82,.55,0xe9ac2e,{solid:false});
    for(const ss of[emS-2.65,emS+2.65])for(const t of[emT-1.84,emT+1.84])lbox(ss,t,.20,.20,0,3.37,0xeab333);
    lbox(emS-2.68,emT,.13,3.8,2.82,.55,0x282b2e,{solid:false});
    lsign('emart24',emS,emT+1.94,3.10,4.4,.52,'E',{bg:null,fg:'#ffffff'});
    lsign('ALLDAY HIGHLIGHT',emS-2.77,emT,3.10,3.55,.32,'N',{bg:'#25282b',fg:'#ffffff'});
    const edS=115.216,edT=34.0;
    // Navy return at t33 leaves a 2.45m walkway beside slot t30.55.
    lbox(edS,edT,4.8,2.0,0,1.0,0x1e2b5e,{top:0xdadbd9});
    lbox(edS+2.28,edT,.24,2.0,1.0,1.55,0x1e2b5e);
    lbox(edS,edT-1,4.8,.1,1,1.1,0x1e2b5e,{solid:false});
    lbox(edS-2.4,edT,.14,2.15,2.55,.60,0x1e2b5e,{solid:false});
    lsign('EDIYA COFFEE',edS-2.50,edT,2.88,2.04,.34,'N',{bg:null,fg:'#ffffff'});
    lsign('EDIYA COFFEE',edS,edT-1.08,2.50,4.2,.45,'W',{bg:'#1e2b5e',fg:'#ffffff'});
    for(const t of[edT-.7,edT,edT+.7])lsign(['이디야커피','커피 · 음료'],edS-1.4,t,2.02,.60,.82,'N',{bg:'#f3eee0',fg:'#233357',box:.035});
    // Full-height UNIQLO advertising pier near the passage entrance.
    lbox(97.177,36.867,2.2,2.2,0,5.2,0x080d12);
    for(const face of['N','S','E','W']){
      const s=97.177+(face==='N'?-1.11:face==='S'?1.11:0),t=36.867+(face==='W'?-1.11:face==='E'?1.11:0);
      hallFace({tex:'emit',color:0x6689aa},s,t,2.65,2.1,4.18,face);
      lsign('UNIQLO',s+(face==='N'?-.01:face==='S'?.01:0),t+(face==='W'?-.01:face==='E'?.01:0),1.05,.92,.58,face,{bg:'#d92532',fg:'#ffffff'});
    }
    // Curved screen under the SE truss, facing NNW into the waiting hall.
    for(let i=0;i<20;i++){
      const t0=9+i,t1=t0+1,sc=t=>133.5+.011*(t-19)*(t-19),a=P(sc(t0),t0),b=P(sc(t1),t1);
      K.quad(0x10151a,[[a[0],4.85,a[1]],[b[0],4.85,b[1]],[b[0],8.00,b[1]],[a[0],8.00,a[1]]],[-AX,0,-AZ]);
      K.quad({tex:'emit',color:i%6<3?0x77b9df:0xb8a9b8},[[a[0]-.02*AX,5.02,a[1]-.02*AZ],[b[0]-.02*AX,5.02,b[1]-.02*AZ],[b[0]-.02*AX,7.83,b[1]-.02*AZ],[a[0]-.02*AX,7.83,a[1]-.02*AZ]],[-AX,0,-AZ]);
    }
    lsign('UNIQLO',133.4,19,6.4,4.2,.70,'N',{bg:'#d72934',fg:'#ffffff'});

    K.detail({name:'호남선 대합실 · 사진 기준 매장과 대기 좌석',floor:'1F',y0:0,y1:8.5,poly:hallPoly},()=>{
      for(const yy of[1.12,1.62,2.12]){
        lbox(emS+2.12,emT,.45,3.15,yy,.05,0xe0dac8,{solid:false});
        for(let n=0;n<12;n++)lbox(emS+2.06,emT-1.4+n*.25,.20,.16,yy+.05,.25,[0xd0aa58,0x9dbeb3,0xb37765,0xe0d3b4][n%4],{solid:false});
      }
      for(const [s,t]of[[emS-1.6,emT+.3],[edS-.5,edT]]){
        lbox(s,t,.38,.26,1,.38,0x222a32,{solid:false});
        hallFace({tex:'emit',color:0x8db7cb},s-.21,t,1.23,.28,.23,'N');
        lperson(s+.65,t,0,{shirt:s<105?0xe4c46c:0x263559,rotY:F.N});
      }
      lbox(edS+1.3,edT,.65,.55,1,.58,0xbbbdb9,{solid:false});
      for(const d of[-.22,.22]){lcyl(edS+1.2,edT+d,1.59,.10,.22,0x282a29,{solid:false});lcyl(edS+.45,edT+d,1.02,.055,.13,0xf0e9d9,{solid:false});}
      // AED/directory on the actual SE column, clear of the well landing.
      lsign(['층별 안내','1F  호남선 터미널','B1  스위트 파크 · 신세계 마켓','파미에스테이션 →'],126.94,30.02,2.0,.95,1.80,'W',{bg:'#494949',fg:'#f1f0e8',bold:false,pxPerM:140});
      lbox(126.94,29.83,.40,.22,0,1.40,0xf0eee7,{solid:false});
      lsign(['AED','자동심장충격기'],126.94,29.68,1.15,.36,.43,'W',{bg:'#ffffff',fg:'#496044'});
      lsign('♥',126.94,30.02,3.12,.28,.28,'W',{bg:'#287347',fg:'#ffffff'});
      const plant=(s,t)=>{
        lcyl(s,t,0,.47,.70,0xeeeae1,{solid:false,seg:18});lcyl(s,t,.70,.40,.04,0x39392d,{solid:false});
        for(let i=0;i<13;i++){
          const angle=i*2.4,dx=Math.sin(angle)*.45,dz=Math.cos(angle)*.45,pt=P(s+dx,t+dz);
          hallTube([s,t,.72],[s+dx,t+dz,1.4+(i%4)*.32],.024,0x635d3b);
          K.dome({x:pt[0],z:pt[1],y:1.4+(i%4)*.32,rx:.32,ry:.49,rz:.24,mat:[0x456440,0x57754a,0x3a583c][i%3],seg:8,rings:5});
        }
      };
      for(const [s,t]of[[83,28.7],[103.5,35.8],[126.94,32],[135.5,22.2]])plant(s,t);
      for(const [s,t]of[[89,23],[102,22],[129,24],[137,26]]){
        lbox(s,t,4.3,.58,.42,.08,0x252b2c,{solid:false});
        lbox(s,t-.28,4.3,.08,.5,.47,0x22282a,{solid:false});
        for(const ds of[-1.75,1.75])lbox(s+ds,t,.08,.5,0,.42,0x747b7d,{solid:false});
        for(let k=0;k<6;k++){hallTube([s-1.8+k*.72,t-.2,.72],[s-1.8+k*.72,t+.3,.72],.035,0x717a7b);if(k%2===0)lperson(s-1.8+k*.72,t+.1,0,{sit:true,rotY:F.E,shirt:[0x3b3e43,0x8e8275,0x263942][k/2]});}
      }
      for(const [s,t]of[[93,32],[103,31],[122.8,34.8],[129,35.5]])lperson(s,t,0,{rotY:F.N,shirt:0x343d45});
    });
  }
  honamR20();

  // ================================================================= slabs (after all holes are registered)
  K.slab(B1POLY,YB1,{mat:'ccLinkMarble',under:false,ceil:false,holes:H.b1,edge:false});
  const terminalF1Holes=H.f1.filter(h=>h.some(q=>K.pointInPoly(...q,F1POLY)));
  K.slab(F1POLY,Y1,{mat:M.hallFloor,under:false,holes:terminalF1Holes,thick:.3});
  const localS=q=>(q[0]-OX)*AX+(q[1]-OZ)*AZ;
  const localT=q=>(q[0]-OX)*EX+(q[1]-OZ)*EZ;
  const center=poly=>poly.reduce((a,q)=>[a[0]+q[0]/poly.length,a[1]+q[1]/poly.length],[0,0]);
  // B1 coffer ceiling sits below the structural underside; keep the existing escalator openings.
  K.hpoly(0xeee6d6,F1POLY,-.3,false,terminalF1Holes);
  // Both B1 regions have enclosed soffits; the House retains its stacked void.
  const planCeilingHoles=H.f1.filter(h=>h.some(q=>K.pointInPoly(...q,b1PlanOutline)));
  K.hpoly(0xf0e5d3,b1PlanOutline,-.31,false,planCeilingHoles);
  K.phys.addCeiling(b1PlanOutline,-.31,{holes:planCeilingHoles});
  const hosRoofHole=RECT(99,21.5,115,33.5);
  K.hpoly(0xe9d9bc,hosB1Poly,-.32,false,[hosRoofHole]);
  K.phys.addCeiling(hosB1Poly,-.32,{holes:[hosRoofHole]});
  // Close the unused southern B1 floorplate. One eight-metre passage skirts
  // the interior House on its west and rejoins the J7/station approach.
  lwall(63.3,0,63.3,14.6,YB1,CB,{mat:0xe3d8c3});
  lwall(63.3,22.6,63.3,39,YB1,CB,{mat:0xe3d8c3});
  const linkRuns=[[63.3,14.6,69.6,22.6],[69.6,8.6,78.4,22.6],[78.4,8.6,138.4,16.6],[138.4,8.6,146.4,22.6],[146.4,14.6,169,22.6]];
  for(const[a,b,c,d]of linkRuns){
    const x0=Math.max(a,74.35),z0=Math.max(b,16.4),x1=Math.min(c,77.65),z1=Math.min(d,28.5);
    const pieces=x0<x1&&z0<z1?[[a,b,x0,d],[x1,b,c,d],[x0,b,x1,z0],[x0,z1,x1,d]]:[[a,b,c,d]];
    for(const[p,q,r,t]of pieces)if(r-p>.01&&t-q>.01){K.hpoly(0xeee4d3,RECT(p,q,r,t),-2.1,false);K.phys.addCeiling(RECT(p,q,r,t),-2.1,{});}
    for(let ss=a+2;ss<c;ss+=4)lbox(ss,(b+d)/2,.8,.35,-2.16,.04,{tex:'emit',color:0xffecc8},{solid:false});
  }
  for(const[a,b,c,d]of [[63.3,22.6,69.6,22.6],[63.3,14.6,69.6,14.6],[69.6,8.6,138.4,8.6],[78.4,16.6,138.4,16.6],[138.4,8.6,146.4,8.6],[146.4,14.6,169,14.6],[146.4,22.6,169,22.6]])
    lwall(a,b,c,d,YB1,CB,{mat:0xe3d8c3,openings:a===78.4?[{at:12,w:5,y0:YB1,y1:-2.1}]:[]});
  for(const[a,b,c,d]of [[69.6,8.6,69.6,14.6],[138.4,16.6,138.4,22.6],[146.4,8.6,146.4,14.6],[78.4,16.6,78.4,22.6],[69.6,22.6,74.35,22.6],[77.65,22.6,78.4,22.6]])
    lwall(a,b,c,d,YB1,CB,{mat:0xe3d8c3});
  // House side branch and descent landing remain fully connected to the main link.
  K.hpoly('ccHosParquet',RECT(87,16.6,94,38.3),YB1+.022,true);
  for(const ss of [70,150,165])lsign('지하철 7호선 · 파미에스테이션 →',ss,18.6,YB1+2.8,4,.35,'S',{bg:'#39342e',fg:'#fff2d8',twoSided:true});
  const east2=clipHalf(clipHalf(clipHalf(TERM,q=>localS(q)-151),q=>-18-localS(q)),q=>23-localT(q));
  const south2=clipHalf(TERM,q=>151-localS(q));
  // Round11: holes touching the outer edge produced an invalid Earcut triangle over HOS at y5,
  // even though physics excluded the hole. Explicit disjoint polygon pieces remove the visual slab too.
  const subtractFloorRects=(poly,holes)=>{
    let pieces=[poly];
    for(const h of holes){
      const ss=h.map(localS),tt=h.map(localT),s0=Math.min(...ss),s1=Math.max(...ss),t0=Math.min(...tt),t1=Math.max(...tt),next=[];
      for(const piece of pieces){
        let rest=piece;
        for(const f of [q=>localT(q)-t0,q=>t1-localT(q),q=>localS(q)-s0,q=>s1-localS(q)]){
          const outside=clipHalf(rest,f);if(outside.length>=3&&Math.abs(K.polyArea(outside))>.001)next.push(outside);
          rest=clipHalf(rest,q=>-f(q));if(rest.length<3)break;
        }
      }
      pieces=next;
    }
    return pieces;
  };
  const eastPieces=[clipHalf(east2,q=>localS(q)-61.5),clipHalf(east2,q=>138.5-localS(q))];
  for(const poly of eastPieces)for(const piece of subtractFloorRects(poly,H.f2))
    K.slab(piece,Y2,{mat:M.f2Floor,under:0xeee6d8,thick:.3});
  K.slab(south2,Y2,{mat:M.f2Floor,under:0xece4d3,holes:H.f2.filter(h=>K.pointInPoly(...center(h),south2)),thick:.3});
  // Shop ceilings also stop explicitly at the HOS court rather than an edge-touching hole.
  for(const poly of [RECT(-18,28,61.5,38.2),RECT(138.5,28,151,38.2)])
    for(const piece of subtractFloorRects(poly,H.f2))K.hpoly(M.ceil,piece,4.68,false);
  // Cut the entrance/pavilion back from the roof so the pylons and glass canopy stand against sky.
  hole(['rf'],RECT(41.5,22.5,62,38.7));
  K.slab(RECT(41.5,22.5,62,38.7),10.4,{mat:M.roof,under:0xece4d6,thick:.3});
  const roofMain=clipHalf(TERM,q=>-9-localS(q));
  const roofNorth=clipHalf(clipHalf(clipHalf(TERM,q=>localS(q)+9),q=>-18-localS(q)),q=>7-localT(q));
  for(const poly of [roofMain,roofNorth])K.slab(poly,YR,{mat:M.roof,under:0xeee6d6,holes:H.rf.filter(h=>K.pointInPoly(...center(h),poly)),thick:.4});
  const northWing=clipHalf(TERM,q=>localS(q)+18);
  for(const poly of [clipHalf(clipHalf(northWing,q=>7-localT(q)),q=>localT(q)-16.2),clipHalf(northWing,q=>22.8-localT(q))]){
    if(poly.length>=3)K.slab(poly,6,{mat:0xa9a7a0,under:0xe9ebe6,thick:.2,walk:false});
  }

  // ================================================================= roof: car deck + one-way loop road (OSM layer-1 ways)
  {
    const yr = YR + 0.02;
    // The modern restaurant skylight replaces this small part of the parking deck.
    // Clip painted road surfaces too, so the view up through the roof stays unobstructed.
    const roofPieces=poly=>{
      const out=[];let rest=poly;
      for(const f of [q=>localS(q)-192,q=>201.35-localS(q),q=>localT(q)+63.85,q=>-52.15-localT(q)]){
        const piece=clipHalf(rest,f);if(piece.length>=3)out.push(piece);
        rest=clipHalf(rest,q=>-f(q));if(rest.length<3)break;
      }
      return out;
    };
    const overGlass=(s,t,pad=0)=>s>=192-pad&&s<=201.35+pad&&t>=-63.85-pad&&t<=-52.15+pad;
    const ribbon = (pts, w, col = 0x8e8c86) => {
      for (let i = 0; i < pts.length - 1; i++) {
        const a = pts[i], b = pts[i + 1], L = Math.hypot(b[0] - a[0], b[1] - a[1]), nx = -(b[1] - a[1]) / L * w / 2, nz = (b[0] - a[0]) / L * w / 2;
        const ext = 1.2, ux = (b[0] - a[0]) / L * ext, uz = (b[1] - a[1]) / L * ext;
        const ribbonPoly=[[a[0]-ux+nx,a[1]-uz+nz],[b[0]+ux+nx,b[1]+uz+nz],[b[0]+ux-nx,b[1]+uz-nz],[a[0]-ux-nx,a[1]-uz-nz]];
        for(const poly of roofPieces(ribbonPoly))K.hpoly(col,poly,yr,true);
        for (let k = 2; k < L - 2; k += 6) { const x = a[0] + (b[0] - a[0]) * k / L, z = a[1] + (b[1] - a[1]) * k / L; if(overGlass(localS([x,z]),localT([x,z]),1.4))continue; K.box({ x, z, y: yr + 0.004, w: 0.14, d: 2.6, h: 0.004, rotY: Math.atan2(b[0] - a[0], b[1] - a[1]), mat: 0xf4f4f4, solid: false }); }
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
      if (s > 39.5 && s < 63.5 && t1 > 22.5) continue; // clear the raised2F link canopy
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
      if(s1>=192&&s0<=201.35&&t+2.6>=-63.85&&t<=-52.15)continue;
      const a = P(s0, t), b = P(s1, t); K.quad(0xf4f4f4, [[a[0] - EX * 0.06, yr, a[1] - EZ * 0.06], [a[0] + EX * 0.06, yr, a[1] + EZ * 0.06], [b[0] + EX * 0.06, yr, b[1] + EZ * 0.06], [b[0] - EX * 0.06, yr, b[1] - EZ * 0.06]], [0, 1, 0]);
      if (rnd() < 0.45) { const [x, z] = P((s0 + s1) / 2, t + 1.3); K.vehicle({ x, z, y: YR, rotY: rot, kind: 'car' }); }
    }
    // Small parking directory at the stair core; omit unverified tall floodlight towers.
    lsign('옥상 주차장',138,29,YR+1.8,3,0.55,'N',{bg:'#354c43',fg:'#ffffff',twoSided:true});
    // rooftop equipment on the south block
    for (const t of [-70]) lbox(200, t, 3, 6, YR, 2.4, 0xb8bcc0, { top: 0x8f969c });
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
      const L = Math.hypot(bx - ax, bz - az), nx = -(bz - az) / L * w / 2, nz = (bx - ax) / L * w / 2;
      // Retain the OSM roof road at y9, but use a 0.65 m slab and Ø0.6 m piers.
      // The separate city-owned footway 1185035515 is not this bridge.
      K.slab([[ax+nx,az+nz],[bx+nx,bz+nz],[bx-nx,bz-nz],[ax-nx,az-nz]],y,
        {mat:0x8e8c86,under:0xa4a69f,thick:.65});
      for(const sg of [-1,1]){
        const a=[ax+nx*sg,az+nz*sg],b=[bx+nx*sg,bz+nz*sg];
        for(const yy of [y+.5,y+1])entryTubeWorld([a[0],yy,a[1]],[b[0],yy,b[1]],.065,0x767d77);
        for(let k=0;k<=L;k+=2)entryTubeWorld([a[0]+(b[0]-a[0])*k/L,y,a[1]+(b[1]-a[1])*k/L],
          [a[0]+(b[0]-a[0])*k/L,y+1,a[1]+(b[1]-a[1])*k/L],.065,0x767d77);
        K.phys.addWall(...a,...b,y,y+1,.05,'centralcity');
      }
      for (let k = 6; k < L - 3; k += 12) K.cyl({ x: ax + (bx - ax) * k / L, z: az + (bz - az) * k / L, y: 0, r: 0.3, h: y - .65, mat: 0xa9aaa4, seg: 12 });
    }
  };
  bridge([[-136.4, 6.9], [-159, 15], [-172.6, 19.6]]);
  bridge([[-177.3, 54.9], [-170.4, 75.3]]);

  // ================================================================= 파미에스테이션 원형관 (round pavilion, B1 + 1F + 2F)
  if (ROUND) {
    const cx = -47, cz = 214.6, y2 = 4.2, yr2 = 22.6;
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
    K.elevator({ name: '파미에스테이션 원형관 엘리베이터', x: -36.5, z: 216, rotY: -PI / 2, w: 2, d: 2, floors: [{ label: 'B1', y: YB1, name: '7호선 연결통로' }, { label: '1F', y: 0, name: '스타벅스' }, { label: '2F', y: y2, name: '스타벅스 2층' }], topH: 2.8 });
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
    const roofRings = [[18.5,5.5],[12,10.5],[12,11.1],[4.6,19.5]];
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
      if(j===1) K.box({x:D[0],z:D[2],y:10.5,w:0.12,d:0.12,h:0.6,mat:0x2f4a40,solid:false});
    }
    // Photo 11: a broad dark glazed drum above the steep upper tier, with a low cap.
    // Its 4.6 m radius is about one quarter of the eave radius; no invented upper floor.
    K.material('ccRoundLanternGlass',new K.THREE.MeshStandardMaterial({color:0x3b4a45,roughness:.28,metalness:.16,side:K.THREE.DoubleSide}));
    K.polyWalls(ring(4.6),19.5,22,{mat:'ccRoundLanternGlass',thick:0.04,solid:false});
    for(const y of [19.5,21.88])K.prism(ring(4.68),y,y+.12,{mat:0x2f4a40,holes:[ring(4.49)],solid:false});
    for(let i=0;i<16;i++) {
      const A=roofPt(i,[4.78,22]),B=roofPt(i+1,[4.78,22]),C=[cx,22.6,cz];
      K.quad(0x5d8a7e,[A,B,C,C],[0,1,0]);
      const [x,z]=ring(4.6)[i];K.box({x,z,y:19.5,w:0.12,d:0.12,h:2.5,mat:0x2f4a40,solid:false});
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
    sign(['지하철 7호선 연결', '파미에스테이션 1층 ↑'], { x: -45, z: 200.2, y: YB1 + 3.0, w: 6, h: 0.9, rotY: 0, bg: '#141414', fg: '#f0e6c8' });
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

  // ================================================================= Round 8 — 파미에 주차장 / 반포천 복개주차장
  {
    // No amenity:parking polygon exists here in this OSM extract. The aerial gives
    // this conservative apron; primary roads, cycleway and sidewalks remain city-owned.
    // All spaces/cars are tested against their full road widths and building footprints.
    const LOT=[[-153,239],[-71,207],[-64,224],[-51,234],[-35,233],[-19,225],[-5,238],
      [-32,255],[-65,270],[-83,291],[-114,305],[-127,309],[-140,282],[-153,261],[-160,247]];
    const roadSurface={tex:'asphalt',color:0xe0dfdb,scale:[5,5]};
    K.hpoly(roadSurface,LOT,.008,true);
    const segDistance=(q,a,b)=>{
      const dx=b[0]-a[0],dz=b[1]-a[1],den=dx*dx+dz*dz;
      const u=den?Math.max(0,Math.min(1,((q[0]-a[0])*dx+(q[1]-a[1])*dz)/den)):0;
      return Math.hypot(q[0]-a[0]-u*dx,q[1]-a[1]-u*dz);
    };
    const groundRoads=K.osm.roads.filter(r=>!r.tunnel&&!r.bridge&&r.layer<=0&&r.hw!=='corridor'&&!String(r.level||'').startsWith('-'));
    const nearbyRoads=groundRoads.filter(r=>r.pts.some(p=>p[0]>-240&&p[0]<100&&p[1]>175&&p[1]<365));
    const nearRoad=(q,pad=.7)=>nearbyRoads.some(r=>r.pts.slice(1).some((b,i)=>segDistance(q,r.pts[i],b)<r.width/2+pad));
    const nearbyBuildings=K.osm.buildings.filter(b=>b.poly.some(p=>p[0]>-180&&p[0]<30&&p[1]>185&&p[1]<325));
    const line=(a,b,w,y,mat)=>{
      const dx=b[0]-a[0],dz=b[1]-a[1],d=Math.hypot(dx,dz),nx=-dz/d*w/2,nz=dx/d*w/2;
      K.quad(mat,[[a[0]+nx,y,a[1]+nz],[b[0]+nx,y,b[1]+nz],[b[0]-nx,y,b[1]-nz],[a[0]-nx,y,a[1]-nz]],[0,1,0]);
    };
    // Replace both claimed service ways over their ENTIRE OSM paths, not just the lot.
    for(const id of [816395056,1262591320]){
      const road=K.osm.roads.find(r=>r.id===id);if(!road)continue;
      for(let i=1;i<road.pts.length;i++){
        const a=road.pts[i-1],b=road.pts[i];line(a,b,road.width,.037,roadSurface);
        const d=Math.hypot(b[0]-a[0],b[1]-a[1]),nx=-(b[1]-a[1])/d,nz=(b[0]-a[0])/d;
        for(const side of [-1,1])line([a[0]+nx*(road.width/2-.15)*side,a[1]+nz*(road.width/2-.15)*side],
          [b[0]+nx*(road.width/2-.15)*side,b[1]+nz*(road.width/2-.15)*side],.09,.044,0xe5d9b3);
      }
    }
    // Inferred short entrance spur: stops at the building-side pedestrian apron.
    line(P(248,-55),P(209,-55),7,.036,roadSurface);
    for(const t of [-58.15,-51.85])line(P(247,t),P(211,t),.10,.045,0xf1ede2);
    lfloorText('입구 ↑',234,-56.6,.049,2.6,2.1,'S',{fg:'#ffffff'});
    lfloorText('출구 ↓',234,-53.4,.049,2.6,2.1,'N',{fg:'#ffffff'});
    // A clear crossing follows the retained public sidewalk; barriers stand north of it.
    for(let t=-58;t<-52;t+=.9)lbox(240.2,t,.46,.55,.055,.005,0xf3f2e8,{solid:false});
    const rearWalkSegments=[[P(206.5,-33),[-69,230]],[[-69,230],[-47,235]],[[-47,235],[-47,230.4]]];
    const slots=[];
    for(const [row,s] of [216.5,221.5,232.5,237.5,253.5,258.5,274.5,279.5].entries()){
      for(let t=-110;t<=40;t+=2.5){
        if(s<250&&Math.abs(t+55)<6.1)continue; // gate lanes, booth and pedestrian gate
        if(s>226&&s<235&&t>-53&&t<-43.5)continue; // booth canopy / directory / mirror
        if(s<224&&t>-86&&t<-77)continue; // direct 4 m rear-door walking link
        const points=[];for(const ds of [-2.5,0,2.5])for(const dt of [-1.25,0,1.25])points.push(P(s+ds,t+dt));
        if(!points.every(q=>K.pointInPoly(...q,LOT)))continue;
        if(points.some(q=>nearRoad(q)||nearbyBuildings.some(b=>K.pointInPoly(...q,b.poly))))continue;
        if(points.some(q=>rearWalkSegments.some(([a,b])=>segDistance(q,a,b)<1.5)))continue;
        for(const dt of [-1.25,1.25])lbox(s,t+dt,5,.10,.024,.005,0xf4f3ec,{solid:false});
        lbox(s+(row%2?2.5:-2.5),t,.1,2.5,.024,.005,0xf4f3ec,{solid:false});
        // Wheel stops and small stall numbers remain even in empty spaces.
        const stopS=s+(row%2?1.85:-1.85);
        lbox(stopS,t,.16,1.4,.03,.1,0x30352f,{solid:false});
        for(const dt of [-.45,.45])lbox(stopS,t+dt,.18,.24,.131,.006,0xe8bc54,{solid:false});
        slots.push({s,t,rot:row%2?F.S:F.N});
      }
    }
    // Deterministic exact occupancy, approximately 70%; no random cars in drive aisles.
    const occupied=Math.round(slots.length*.7),chosen=new Set();
    for(let k=0;k<occupied;k++)chosen.add(Math.floor((k+.5)*slots.length/occupied));
    slots.forEach((q,i)=>{
      if(!chosen.has(i))return;const[x,z]=P(q.s,q.t);
      K.vehicle({x,z,y:.025,rotY:q.rot,kind:'car',color:[0xeeeae2,0x292d30,0xbec5c6,0x4f5961,0xe6e5e0,0x383f49,0x88776b][i%7]});
    });
    // Two accessible spaces on the north apron; a hatched transfer strip stays empty.
    for(const t of [-72,-67.8]){
      lbox(211.1,t,5,3.3,.026,.006,0x28567b,{solid:false});
      for(const dt of [-1.65,1.65])lbox(211.1,t+dt,5,.11,.035,.006,0xf0f0e8,{solid:false});
      for(const ds of [-2.5,2.5])lbox(211.1+ds,t,.11,3.3,.035,.006,0xf0f0e8,{solid:false});
      lfloorText('장애인 전용',211.1,t,.045,2.8,1.6,'N',{fg:'#ffffff'});
    }
    for(let s=209;s<213.5;s+=.7)lbox(s,-69.9,.1,.9,.04,.006,0xeeeeda,{solid:false});
    // Green translucent barrel canopy and white parking office from photo16.
    const boothS=228,boothT=-49.5;
    lbox(boothS,boothT,3.5,2.5,.03,2.6,0xdeddd3,{top:0xa8aaa2});
    for(const t of [boothT-1.26,boothT+1.26]){
      lbox(boothS,t,2.75,.035,1.05,1.1,0x253a38,{solid:false});
      for(const s of [boothS-.8,boothS+.8])lbox(s,t,.06,.05,1.02,1.16,0xd1d6cc,{solid:false});
    }
    lsign('주차 안내',boothS-1.78,boothT,2.1,2.2,.35,'N',{bg:'#314f44',fg:'#ffffff'});
    const canopyY=s=>3.3+.55*Math.sin((s-225.5)/5*PI);
    for(let i=0;i<12;i++){
      const a=225.5+i*5/12,b=225.5+(i+1)*5/12,at=(s,t)=>{const[x,z]=P(s,t);return[x,canopyY(s),z];};
      K.quad({tex:'glass',color:0x6eaea1},[at(a,-51.3),at(b,-51.3),at(b,-47.7),at(a,-47.7)],[0,1,0]);
      for(const t of [-51.3,-47.7])entryTube([a,t,canopyY(a)],[b,t,canopyY(b)],.08,0x2d544b);
    }
    for(const s of [225.5,230.5])for(const t of [-51.3,-47.7])lcyl(s,t,0,.07,3.3,0x294b43);
    lbox(228,-49.5,1.1,.9,2.65,.62,0xc3c6bb,{solid:false});
    lsign(['파미에 주차장','반포천 복개주차장','5분당 550원'],226.2,-47.4,1.65,2.1,1.3,'S',{bg:'#25332c',fg:'#f4ead3',twoSided:true});
    lcyl(226.2,-47.4,0,.075,1.2,0x37453b);
    lbox(232,-45,.32,1.1,0,3.6,0x25382e);
    lsign(['↑','반포천 공영주차장','(파미에)','← 사평대로 방향 출구'],232.18,-45,2.05,1.02,2.6,'S',{bg:'#25382e',fg:'#f0efe5'});
    for(const t of [-58.5,-51.5])for(const s of [235.5,237.5]){
      lcyl(s,t,0,.08,.85,0xc86942);lcyl(s,t,.56,.083,.12,0xe1e0d1,{solid:false});
    }
    const mirror=P(230.8,-45.5);
    K.cyl({x:mirror[0],z:mirror[1],y:0,r:.055,h:2.5,mat:0x6e746a,seg:8});
    K.dome({x:mirror[0],z:mirror[1],y:2.55,rx:.42,ry:.42,rz:.13,hemi:false,seg:16,rings:8,mat:0xb66d3e});
    K.dome({x:mirror[0],z:mirror[1]+.05,y:2.55,rx:.36,ry:.36,rz:.13,hemi:false,seg:16,rings:8,mat:0xafc3bc});
    // Open entrance barrier / closed exit barrier, each confined to its vehicle lane.
    for(const [t,open] of [[-58,true],[-55,false]]){
      lbox(229,t,.55,.45,0,1.05,0xd8d8c9);
      if(open)entryTube([229,t,1.05],[229,t+1.05,3.75],.09,0xeeeade);
      else{
        lbox(229,t+1.35,.10,2.7,1.04,.12,0xe9e8dd,{solid:false});
        for(let dt=.25;dt<2.7;dt+=.55)lbox(229,t+dt,.12,.22,1.04,.13,0xc54738,{solid:false});
      }
      lbox(230.7,t,.4,.32,0,1.05,0x343e38);
      lsign('정산',230.9,t,.8,.28,.16,'S',{bg:'#1c2526',fg:'#e7dbb7'});
    }
    // Preserve an unobstructed walking route from the lot along the south facade.
    const walkMat={tex:'sidewalk',color:0xe7ded0,scale:[2,2]};
    K.slab(RECT(204.6,-97,208.2,-33),.06,{mat:walkMat,thick:.08,ceil:false});
    K.slab(RECT(207,-83,227.4,-79),.06,{mat:walkMat,thick:.08,ceil:false});
    for(const [a,b] of rearWalkSegments){
      line(a,b,2.2,.06,walkMat);
    }
    lsign(['파미에스테이션 ↑','지하철 · 센트럴시티'],217,-80.8,2.2,3.1,.8,'S',{bg:'#324c42',fg:'#ffffff',twoSided:true});
    lcyl(217,-80.8,0,.065,1.8,0x344c40);
    lsign('파미에스테이션',204.45,-81,3.45,5.3,.55,'S',{bg:'#2f493d',fg:'#fff9e8'});
    // A shallow curved glass roof shelters the new brick entrance stretch. Its scale
    // is deliberately a canopy: the existing roof parking and building height remain.
    const roofY=s=>4.72+.82*Math.sin((s-204.2)/4.4*PI);
    for(let i=0;i<14;i++){
      const a=204.2+i*4.4/14,b=204.2+(i+1)*4.4/14,at=(s,t)=>{const[x,z]=P(s,t);return[x,roofY(s),z];};
      K.quad({tex:'glass',color:0xa0bcb2},[at(a,-96),at(b,-96),at(b,-35),at(a,-35)],[0,1,0]);
      for(let t=-96;t<=-35;t+=3.05)entryTube([a,t,roofY(a)],[b,t,roofY(b)],.055,0x8a9a8e);
    }
    for(const s of [204.2,208.6])entryTube([s,-96,roofY(s)],[s,-35,roofY(s)],.13,0x3d584c);
    for(const t of [-94,-88,-74,-62,-50,-36]){
      lcyl(208.5,t,.06,.085,4.6,0x3c5045);
      lbox(204.9,t,.3,.45,3.8,.07,0x2e3d32,{solid:false});
      lbox(205,t,.26,.32,3.76,.035,{tex:'emit',color:0xffdba2},{solid:false});
    }
    // Stone planters, pine and lamps: leave door/gate approaches and public paths clear.
    for(const [s,t] of [[209.4,-92],[209.4,-62],[209.4,-42],[225,-45]]){
      lbox(s,t,1.2,5.5,.02,.45,{tex:'ccStone',color:0xe5d9bd});
      lbox(s,t,1.05,5.25,.47,.48,0x536849,{solid:false});
      K.tree(...P(s,t),{y:.5,h:5.8,kind:'pine'});
    }
    for(const [s,t] of [[225,-90],[225,-72],[225,-38],[230,-17],[268,-94],[268,-69]]){
      const q=P(s,t);if(nearRoad(q,.7))continue;
      lcyl(s,t,0,.09,6.4,0x525b56);
      entryTube([s,t,6.1],[s,t+1.4,6.4],.07,0x525b56);
      lbox(s,t+1.4,.45,.8,6.32,.14,0x35463b,{solid:false});
      lbox(s,t+1.4,.36,.65,6.30,.025,{tex:'emit',color:0xffe4ae},{solid:false});
    }
    K.zone({name:'파미에 주차장',floor:'1F',sub:'반포천 복개주차장 · 파미에스테이션 후문',poly:LOT,y0:-.2,y1:5,priority:3});
    K.spawn({name:'파미에 주차장 · 후문 보행로',x:P(218,-81)[0],z:P(218,-81)[1],y:.06,yaw:R});
  }

  // ================================================================= zones
  lzone(-22.5, -1, 151, 39.5, { name: '센트럴시티터미널 (호남선)', floor: '1F', sub: '대합실 · 매표소 · 무인발권기 · 승차홈', y0: -0.5, y1: HALL_CROWN, priority: 2 });
  lzone(-12, -18, 151, 6, { name: '호남선 승차홈', floor: '1F', sub: '광주 · 전주 · 목포 · 여수 · 순천', y0: -0.5, y1: C1, priority: 3 });
  lzone(151, -99, 205, 39, { name: '파미에스테이션 · 하차장', floor: '1F', sub: '파미에스테이션 1층 매장 · 하차장', y0: -0.5, y1: C1, priority: 2 });
  lzone(-22.5, 23, 151, 39.5, { name: '센트럴시티 식당가', floor: '1M', sub: '이춘복참치 · 온고지신 · 샤브보트 · 순대실록 · 르사이공', y0: C1, y1: C2, priority: 2 });
  lzone(151, -99, 205, 39, { name: '파미에스테이션 2F', floor: '2F', sub: '하프커피 · 카츠8 · 이비티 피자 · 케르반 · 소이연남', y0: C1, y1: C2, priority: 2 });
  lzone(-22.5, -1, 151, 39.5, { name: '센트럴시티 지하 연결통로', floor: 'B1', sub: '신세계백화점 · 메가박스 · 지하철 연결', y0: YB1 - 0.5, y1: CB, priority: 2 });
  K.zone({ poly: B1POLY.filter((p, i) => i >= 6 && i <= 16).concat([P(151, 38.5)]), name: '센트럴시티 남측 연결통로', floor: 'B1', sub: '메가박스 입구 · 지하철 7호선 · 1층 파미에스테이션', y0: YB1 - 0.5, y1: CB, priority: 2 });
  lzone(168.4, -89, 177.4, -10, { name: '센트럴시티 남측 연결통로', floor: 'B1', sub: '지하철 7호선 · 파미에스테이션', y0: YB1 - 0.5, y1: CB, priority: 3 });
  lzone(163, -94, 168.2, -26, { name: '호남선 하차장', floor: '1F', sub: '도착 · 택시 승강장 · 지하철 방면', y0: -0.5, y1: 4.4, priority: 3 });

  // ================================================================= spawns
  // yaw: facing local +s (south-ish) = R+π, -s = R, +t (east) = R+3π/2, -t (west) = R+π/2
  const YAW = { S: R + PI, N: R, E: R + 1.5 * PI, W: R + PI / 2 };
  const sp = (name, s, t, y, face) => { const [x, z] = P(s, t); K.spawn({ name, x, y, z, yaw: YAW[face] }); };
  sp('센트럴시티 정문 (신반포로)', -30, 19.5, 0, 'S');
  sp('호남선 대합실 · 동상 벤치', 33, 22, 0, 'W');
  sp('호남선 승차홈 (8번)', bays.find(b => b.p === 8).s, 4.6, Y1 + 0.12, 'W');
  sp('스위트 파크 · 호남선 연결통로 (B1)', 7, 25, YB1, 'S');
  sp('하우스 오브 신세계 · B1 라운지', 115.9, 27.5, YB1, 'N');
  sp('호남선 대합실 · 매표소와 B1 연결', 124.5, 28.5, 0, 'N');
  sp('지하철 7호선 연결통로 (B1)', 173.4, -28, YB1, 'S');
  sp('파미에스테이션 1층 · 호호식당', 189.5, -58, Y1, 'N');
  sp('호남선 하차장 · 택시 승강장', 167.5, -50, 0.15, 'N');
  sp('파미에스테이션 중층 식당가', 192.1, -21, Y2, 'W');
  K.spawn({ name: '센트럴시티 ↔ 고투몰 연결통로 (B1)', x: -140.9, y: YB1, z: -34.6, yaw: Math.atan2(18.2, 40.5) + PI });
  sp('센트럴시티 중층 식당가', 30, 25.2, Y2, 'S');
  sp('센트럴시티 옥상 주차장', 70, 16, YR, 'S');
  K.spawn({ name: '파미에스테이션 원형관 (스타벅스)', x: -47, y: 0, z: 195.6, yaw: PI });
}
