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
//   south block:  s 151..204, t -98..38   (파미에스테이션 1F/2F, 하차장, 메가박스 B1)
export const meta = {
  id: 'centralcity',
  name: '센트럴시티 (호남선 터미널 · 파미에스테이션)',
  claims: [356127040, 593858530, 601356623, 1173096805],
  claimRoads: [593858534, 593858536, 593858537, 1128012726, 1128012724, 1185035520, 1065783056, 1185035521],
  claimAreas: [1173096801],
  sources: [
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
  K.material('ccPolishedMarble', new K.THREE.MeshStandardMaterial({
    color: 0xe6e6e2, map: K.T.surface('marble').tex, roughness: 0.18, metalness: 0.04,
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
  brickTexture('ccWhiteBrick',['#e0ded5','#cdcfc6','#e8e5dc','#c4c8c0'],'#666b66');
  K.texture('ccGreyTile',256,128,(g,w,h)=>{
    g.fillStyle='#d1cdc6';g.fillRect(0,0,w,h);
    for(let row=0;row<4;row++)for(let col=-1;col<3;col++){
      g.fillStyle=['#d2cfc8','#ccc9c2','#d7d4cc'][(row+col+3)%3];g.fillRect(col*128+(row%2)*64+1,row*32+1,126,30);
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
  // cc_hall05/13/14 show numbered red gateways 13/1/11; older photos show 2–5/12.
  // Existing bay spacing is retained; number9 is the ticket-counter gap. Exact complete ordering is inferred.
  const BOARDING_DOORS = [-3,9,21,33,45,57,69,81,105,117,129,141].map((s,i)=>({p:i<8?i+1:i+2,s}));
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
    for(const upper of [0,1])hallCurve(u=>pt(u,upper),n,0.2);
    for(let i=0;i<n;i++){hallTube(pt(i/n,i%2),pt((i+1)/n,1-i%2),0.11);hallTube(pt(i/n),pt(i/n,1),0.09);}
  };

  // ---- vertical circulation (strip)
  escPair(-15, -4.5, 17.4, YB1, Y1, 'f1', true);          // E1 north: B1 ↔ 1F (신반포로 입구 홀)
  escPair(85, 95.5, 17.4, YB1, Y1, 'f1', true);           // E2 매표소 맞은편: B1(지하철·메가박스 연결) ↔ 1F
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
  const ELEV_FLOORS = [{ label: 'B1', y: YB1, name: '메가박스 · 신세계 · 지하철 연결' }, { label: '1F', y: Y1, name: '호남선 터미널 · 매표소' }, { label: '2F', y: Y2, name: '센트럴시티 식당가' }, { label: 'R', y: YR, name: '옥상 주차장' }];
  elev('센트럴시티 터미널 엘리베이터', 62, 24.7, 'N', ELEV_FLOORS, ['b1', 'f1', 'f2', 'rf']);
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
    lwall(-10,6,149,6,0,HALL_CROWN,{mat:'glass',thick:.04,openings:glassOps});
    lwall(-10,.3,-10,6,0,HALL_CROWN,{mat:'ccBand',thick:.3});
    lwall(149,6,149.6,.6,0,HALL_CROWN,{mat:0xd7d2c8,thick:.3});
    for(const bb of bays){
      const sc=bb.s,width=6.6;
      lwall(sc-width/2,6,sc+width/2,6,0,4.5,{mat:'ccRed',thick:.16,openings:[{at:width/2,w:3.2,y0:0,y1:2.8}]});
      // 13/14: curved red cheeks on the hall side, narrow black horizontal panel joints.
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
      lbox(sc,6.47,6.55,.18,3.40,1.96,0x191c24,{solid:false});
      lsign(String(bb.p),sc+2.56,6.58,4.91,1.0,.82,'E',{bg:null,fg:'#ffffff',pxPerM:100});
      lsign('승차홈',sc+2.6,6.58,5.28,.8,.15,'E',{bg:null,fg:'#ffffff',bold:false});
      hallClock(sc+2.56,6.585,3.99,1.03);
      if(bb.p===1||bb.p===11){
        lsign(['창업의 시간','신용보증기금'],sc-.65,6.58,4.41,4.76,1.70,'E',{bg:'#103244',fg:'#f3fafb',pxPerM:80});
        for(let q=0;q<4;q++)hallFace({tex:'emit',color:0x2588a6},sc-2.55+q*.28,6.585,3.65+q*.08,.18,.12);
      }else{
        lsign('SHINSEGAE CENTRAL',sc-.65,6.58,4.40,4.76,1.70,'E',{bg:'#171c24',fg:'#efeee7',pxPerM:75});
      }
      lsign('비상구',sc,6.61,2.62,.72,.2,'E',{bg:'#20743c',fg:'#ffffff'});
      lsign(String(bb.p),sc,5.86,3.7,1.1,1.4,'W',{bg:null,fg:'#ffffff'});
    }
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
  // ---- 08/16: timber slat TICKETS wall, low charcoal counter, blue departure boards.
  {
    const s0=TICKET.s0,s1=TICKET.s1,sc=(s0+s1)/2;
    lwall(s0,6,s0,12.6,Y1,4.15,{mat:M.wallIn});lwall(s1,6,s1,12.6,Y1,4.15,{mat:M.wallIn});
    lwall(s0,10.8,s1,10.8,Y1,3.25,{mat:0x343b3b,thick:.14});
    for(let s=s0+.1;s<s1;s+=.22)lbox(s,10.92,.055,.05,.2,2.85,0x57605a,{solid:false});
    lbox(sc,12.3,s1-s0,.72,Y1,1.03,0x716a58,{top:0x242b2a});
    for(let s=s0+.1;s<s1;s+=.18)lbox(s,12.68,.045,.025,.1,.78,0xa49b84,{solid:false});
    lbox(sc,12.20,s1-s0,.55,2.98,.72,0xc2a078,{solid:false});
    for(let yy=3.04;yy<3.7;yy+=.14)lbox(sc,12.50,s1-s0,.035,yy,.038,0xe4c99e,{solid:false});
    lsign('TICKETS 표사는곳',sc,12.55,3.33,5.8,.52,'E',{bg:null,fg:'#ffffff',pxPerM:90});
    for(let k=0;k<6;k++){
      const s=s0+1.3+k*(s1-s0-2.6)/5;
      lperson(s,11.4,Y1,{rotY:F.E,shirt:0x202a29});
      lbox(s,11.82,.48,.22,1.03,.36,0x1e2528,{solid:false});
      lbox(s,12.20,.34,.22,1.04,.02,0xece8dd,{solid:false});
      lsign('발권',s,10.96,2.25,.55,.22,'E',{bg:null,fg:'#f8f6ec',bold:false});
      lwall(s-.7,12.48,s+.7,12.48,1.05,1.7,{mat:'glass',thick:.025,solid:false});
    }
    for(const ds of [-5.5,5.5])hallBoard(sc+ds,12.30,4.33,3.85,1.22);
    lbox(sc,11.6,6.0,.20,3.74,2.2,0x222a2c,{solid:false});
    lsign(['창업의 시간','신용보증기금'],sc-.48,11.73,4.87,4.6,1.85,'E',{bg:'#103244',fg:'#f3fafb'});
    hallClock(sc+2.1,11.74,4.90,1.12);
    // Open queue ends; the main E2 escalator at t17.4 is kept clear.
    for(let s=s0+.6;s<s1;s+=2.3){
      lcyl(s,14.3,0,.18,.04,0x252725,{solid:false});lcyl(s,14.3,.04,.035,.94,0x252725,{solid:false});
      if(s+2.3<s1)lbox(s+1.15,14.3,2.3,.045,.82,.065,0x282b28,{solid:false});
    }
    for(const s of [s0+.8,s1-1.1])lperson(s,13.4,0,{shirt:0x605f55});
    lsign('매표소',sc,5.9,3.45,3.6,.5,'W',{bg:'#555b62',fg:'#ffffff',pxPerM:60});
    for(let k=0;k<5;k++){
      const s=s1+1.8+k*1.05;
      lbox(s,12.5,.82,.62,0,1.58,0xe3e0d5,{top:0xc9c6ba});
      hallFace({tex:'emit',color:0x6e9caf},s,12.83,1.17,.59,.54);
      lsign('무인발권',s,12.85,1.72,.78,.17,'E',{bg:'#1c3b57',fg:'#fff'});
      lbox(s,12.84,.35,.06,.65,.07,0x303736,{solid:false});
    }
  }
  // ---- 05/06/15: stone planter islands with timber slat benches and small double lamps.
  {
    for(const [i,s] of [14,34,67,114,136].entries()){
      const t=15.8;
      lbox(s,t,4.1,2.0,.05,.6,{tex:'darkstone',color:0x9d9c92},{top:0x4f5c3d});
      for(const d of [-1.42,1.42]){
        lbox(s,t+d,6.8,.58,.38,.10,0x695144);
        for(let k=0;k<4;k++)lbox(s,t+d-.21+k*.14,6.7,.095,.49,.035,0x8a6b52,{solid:false});
        lbox(s,t+d-Math.sign(d)*.22,6.7,.08,.52,.42,0x695144,{solid:false});
        for(const ss of [-2.7,0,2.7])lbox(s+ss,t+d,.12,.48,0,.39,0x484b47,{solid:false});
        for(let k=0;k<5;k++)if((k+i)%3!==0)lperson(s-2.5+k*1.25,t+d+Math.sign(d)*.1,0,{sit:true,shirt:[0x222b34,0xe6e2d7,0x67674c,0x8e725f][(k+i)%4]});
      }
      const [x,z]=P(s,t);K.tree(x,z,{y:.65,h:4.3,kind:'zelkova'});
      const [lx,lz]=P(s+4.5,15.8);entryDoubleLamp(lx,lz);
    }
    // Red glass-front convenience kiosks in gaps between boarding drums, cc_hall01/06.
    for(const s of [3,51,123]){
      lbox(s,7.15,3.2,1.9,0,.82,0xb62432,{top:0xd0c8bb});
      lbox(s,7.15,3.2,2.0,2.8,.58,0xb62432,{solid:false});
      for(const ss of [s-1.57,s+1.57])lbox(ss,7.15,.08,1.9,.8,2.0,0xb3b9b5,{solid:false});
      lwall(s-1.5,8.12,s+1.5,8.12,.82,2.8,{mat:'glass',thick:.035,solid:false});
      lsign('센트럴시티',s,8.19,3.09,2.6,.32,'E',{bg:null,fg:'#ffffff'});
      for(let k=0;k<7;k++)lbox(s-1.1+k*.34,7.6,.25,.3,.83,.13,[0xc5ac6e,0x8fa899,0x986d64][k%3],{solid:false});
    }
    lbox(4,21,2.4,5,0,1.05,0xf4f1ea,{top:0x2b2d30});
    lsign(['종합안내','센트럴시티터미널'],4,21,3.6,4.6,.9,'N',{bg:'#4c443a',fg:'#fff',twoSided:true});
    lperson(5.6,20.2,0,{shirt:0x1d3557});
    const DIR=['층별 안내','R  옥상 주차장','2F  센트럴시티 식당가','1F  호남선 터미널 · 파미에스테이션','B1  메가박스 · 신세계 · 지하철'];
    for(const s of [-16.5,38.5,83.5])lsign(DIR,s,23.5,1.6,3.4,2.1,'N',{bg:'#f4f1ea',fg:'#393b3a',box:.12,boxMat:0xbab4a8,align:'left',bold:false,pxPerM:90});
    lsign(['지하철 3·7·9호선 · 메가박스','↓ 지하 1층  고투몰 · 신세계'],95.8,18.15,3.3,4.4,.75,'S',{bg:'#514c43',fg:'#ffffff'});
    lsign(['지하철 · 고투몰 ↓','지하 1층 연결통로'],-4.2,18.15,3.3,4.2,.75,'S',{bg:'#514c43',fg:'#ffffff'});
    lsign(['2층 센트럴시티 식당가 ↑','승차홈 · 매표소'],49,24.75,3.3,4.4,.75,'S',{bg:'#514c43',fg:'#ffffff'});
  }
  // ---- 1F east band: retain researched shops; insert only the four photographed small stalls.
  const EAST1=[[-20,-11,'앤드테일 커피바','cafe'],[-11,-2,'신한은행','bank'],[26,36,'스노우폭스','flower'],[46,56,'파리바게뜨','cafe'],[56,66,'리김밥','food'],[86,98,'쉐이크쉑','food'],[98,108,'화장실','toilet']];
  for(const [u0,u1,name,kind]of EAST1)shop({axis:'s',u0,u1,f:28,b:38.2,y:Y1,h:4.1,name,kind,seed:u0,noBack:true});
  const hallCafe=(a,b,name,fascia,letter,neon)=>{
    const c=(a+b)/2;
    lwall(a,28,a,38.2,0,4.1,{mat:0xe9e1d0,thick:.15});lwall(b,28,b,38.2,0,4.1,{mat:0xe9e1d0,thick:.15});
    lwall(a,28,b,28,0,3.25,{mat:'glass',thick:.035,openings:[{at:(b-a)/2,w:3,y0:0,y1:2.8}]});
    for(const s of [a+.3,b-.3])lbox(s,28,.6,.5,0,4.1,'ccHallBrick');
    lbox(c,27.91,b-a-.6,.42,3.12,.63,fascia,{solid:false});
    lsign(name,c,27.65,3.43,b-a-1.2,.47,'W',{bg:null,fg:letter,pxPerM:90});
    const nearEsc=a===36,canopyT=nearEsc?27.3:26.75,canopyD=nearEsc?1.1:2.3;
    lbox(c,canopyT,b-a-.6,canopyD,3.83,.12,0x2b2e2c,{solid:false});
    for(const tt of [canopyT-canopyD/2+.06,canopyT+canopyD/2-.06])lbox(c,tt,b-a-.8,.075,3.81,.045,{tex:'emit',color:neon},{solid:false});
    for(const ss of [a+.7,c,b-.7])lbox(ss,canopyT,.065,canopyD-.16,3.79,.045,{tex:'emit',color:neon},{solid:false});
    lbox(c,32.4,b-a-1.5,.8,0,1.0,{tex:'wood',color:0x9f835f},{top:0xe1d3b4});
    lbox(c+1.2,32.4,.9,.45,1,.6,0x383b38,{solid:false});
    lbox(c-1.6,32.2,1.5,.6,1,.5,'glass',{solid:false});
    for(let k=0;k<7;k++)lbox(c-2.1+k*.17,32.15,.13,.25,1.02,.09,[0xd2a56a,0x8e633c,0xe5caa5][k%3],{solid:false});
    for(const yy of [1.3,1.9]){lbox(c,37.3,b-a-1.5,.4,yy,.06,0x806950,{solid:false});for(let k=0;k<10;k++)lbox(a+1+k*(b-a-2)/10,37.3,.15,.18,yy+.06,.22,[0xf2eee4,0xc4ae89,0x66785b][k%3],{solid:false});}
    for(const ss of [a+1.2,b-1.2]){lcyl(ss,26.7,0,.43,.65,0xe8e5da);const[x,z]=P(ss,26.7);K.tree(x,z,{y:.6,h:2.1});}
    lperson(c,31.3,0,{shirt:0x282e2b});
  };
  hallCafe(7,16,'STARBUCKS',0x453d33,'#f7f3e6',0x00bd62);
  hallCafe(36,46,'EDIYA COFFEE',0x263b4b,'#f1f2ef',0x00bd62);
  hallCafe(66,76,"DUNKIN'",0x6e382c,'#ffd6b4',0xee342e);
  hallCafe(76,86,'공 탕',0x65443a,'#ffffff',0xee342e);
  hallBoard(81,27.62,4.33,8.3,.98,'W');
  lsign('딤딤섬',81,27.6,6.80,8.5,.9,'W',{bg:'#191c20',fg:'#f9f4e9',font:'serif'});
  lwall(-2,28,7,28,0,C1,{mat:0xe9e5da,thick:.15});
  lwall(108,28,119,28,0,C1,{mat:0xc5c4be,thick:.15});
  lwall(129,28,140,28,0,C1,{mat:0xc5c4be,thick:.15});
  // Shared J4/J6 passages are unchanged and left full-width, with brick-clad side walls.
  for(const s of [16,26,119,129])lwall(s,28,s,38.2,0,4.1,{mat:'ccHallBrick',thick:.15});
  lsign('신세계백화점 강남점 →',21,27.8,3.55,5.6,.55,'W',{bg:'#403b33',fg:'#ffffff'});
  lsign('JW 메리어트 호텔 서울 →',124,27.8,3.55,5.6,.55,'W',{bg:'#4b3a2a',fg:'#f3e3c3'});
  // 04: ivory fascia below the existing glass 2F rail; small circular ventilation ports.
  for(const [a,b]of[[-18,39.4],[48.8,150]]){
    lbox((a+b)/2,23.08,b-a,.18,4.12,.85,0xece8de,{solid:false});
    for(let ss=a+.8;ss<b;ss+=2.4)hallFace('ccHallVent',ss,22.97,4.35,.22,.22,'W');
  }
  for(const s of [12,70,132])lsign('지하철 3·7·9호선 타는곳 ↑',s,22.95,4.74,5.8,.30,'W',{bg:null,fg:'#252925'});
  // 05/06: marble piers and sparse white pipe diagonals under grey metal ceiling panels.
  const colS=[];
  for(let s=-7;s<=145;s+=9.5){
    colS.push(s);
    for(const t of [9,20.5]){
      if(s>84&&s<104&&t===9)continue;
      lbox(s,t,1.1,1.1,0,3.65,{tex:'marble',color:0xe9ebe6});
      lbox(s,t,1.14,1.14,0,.15,0x202725,{solid:false});
      const low=RECT(s-.55,t-.55,s+.55,t+.55),high=RECT(s-1.2,t-1.2,s+1.2,t+1.2);
      for(let k=0;k<4;k++){const n=(k+1)%4;K.quad(0xeef0ec,[[low[k][0],3.65,low[k][1]],[low[n][0],3.65,low[n][1]],[high[n][0],4.15,high[n][1]],[high[k][0],4.15,high[k][1]]],[0,-1,0]);}
      K.hpoly(0xeef0ec,high,4.15,true);
      for(const[ds,dt]of[[-4.75,0],[4.75,0],[0,-3],[0,3]])hallTube([s,t,4.18],[s+ds,t+dt,6.60],.23,0xeeeee3);
      for(const dt of [-.8,.8])lcyl(s,t+dt,4.16,.13,.045,{tex:'emit',color:0xfff4d4},{solid:false});
      if(t===20.5&&Math.round(s)%3===0)lsign(['← 화장실','지하철 · 식당가 ↑'],s,19.91,2.65,1.06,.38,'W',{bg:'#353435',fg:'#ffffff',pxPerM:110});
    }
    // Open triangular web, with broad 2.8m subdivisions as in the current photographs.
    for(const yy of [6.6,7.65])hallTube([s,6,yy],[s,23,yy],.19,0xeeeee3);
    for(let k=0;k<6;k++)hallTube([s,6+k*17/6,k%2?7.65:6.6],[s,6+(k+1)*17/6,k%2?6.6:7.65],.14,0xeeeee3);
    lbox(s,27.2,.75,.75,Y2,C2-Y2,{tex:'marble',color:0xe9ebe6});
  }
  for(let i=0;i<colS.length-1;i++)for(const t of [9,20.5]){
    const a=colS[i],b=colS[i+1];
    for(const yy of [6.60,7.65])hallTube([a,t,yy],[b,t,yy],.19,0xeeeee3);
    for(let k=0;k<4;k++)hallTube([a+(b-a)*k/4,t,k%2?7.65:6.6],[a+(b-a)*(k+1)/4,t,k%2?6.6:7.65],.13,0xeeeee3);
  }
  const vaultY=t=>8.5-.62*Math.pow((t-14.5)/8.5,2);
  for(let t=6;t<23;t+=.5){
    const a=P(-10,t),b=P(149,t),c=P(149,t+.5),d=P(-10,t+.5);
    K.quad(0x929698,[[a[0],vaultY(t),a[1]],[b[0],vaultY(t),b[1]],[c[0],vaultY(t+.5),c[1]],[d[0],vaultY(t+.5),d[1]]],[0,-1,0]);
    hallTube([-10,t,vaultY(t)-.025],[149,t,vaultY(t)-.025],.023,0x737b7e);
  }
  for(let s=-6;s<149;s+=9.5)for(const t of [7,22])lcyl(s,t,vaultY(t)-.12,.17,.035,{tex:'emit',color:0xf4f8f5},{solid:false});
  // 06/15/16: dark border bands, large black-and-white diamonds, yellow tactile route.
  const hallFloorClear=(ss,t)=>!H.f1.some(h=>K.pointInPoly(...P(ss,t),h));
  for(const t of [10.65,22.1])for(let s=-10;s<149;s+=.5)if(hallFloorClear(s+.25,t))lbox(s+.25,t,.5,.18,.008,.006,0x414846,{solid:false});
  for(let s=-6;s<149;s+=12)for(let t=6;t<28;t+=.5)if(hallFloorClear(s,t+.25))lbox(s,t+.25,.18,.5,.008,.006,0x414846,{solid:false});
  for(let s=6;s<149;s+=12){
    const t=24.7;
    if([[s-1.65,t],[s+1.65,t],[s,t-1.65],[s,t+1.65]].every(q=>hallFloorClear(...q))){
      K.hpoly(0x303a39,[P(s-1.65,t),P(s,t-1.65),P(s+1.65,t),P(s,t+1.65)],.018,true);
      K.hpoly(0xefeee6,[P(s-1.18,t),P(s,t-1.18),P(s+1.18,t),P(s,t+1.18)],.020,true);
    }
  }
  for(let s=-7;s<149;s+=.5)if((s<85.5||s>=102.5)&&hallFloorClear(s+.25,11.6)){
    lbox(s+.25,11.6,.5,.42,.022,.018,0xd4a34f,{solid:false});
    for(const dt of[-.13,0,.13])lbox(s+.25,11.6+dt,.47,.025,.041,.008,0xe8bd6c,{solid:false});
  }
  // The tactile line turns in front of the counter, avoiding the queue and E2 well.
  lbox(94,15.2,17,.42,.022,.018,0xd4a34f,{solid:false});
  for(const s of [85.5,102.5])lbox(s,13.4,.42,3.6,.022,.018,0xd4a34f,{solid:false});
  for(const bb of bays)if([1,11,13].includes(bb.p))lbox(bb.s,9.0,.42,5.2,.022,.018,0xd4a34f,{solid:false});
  for(const s of [21,124])lbox(s,32.8,.42,9.4,.022,.018,0xd4a34f,{solid:false});
  lcrowd(0,21.7,140,26.4,Y1,63,11);lcrowd(-8,10,146,12.5,Y1,38,12);lcrowd(-20,8,-11,26,Y1,10,13);

  // ================================================================= B1 — Shinsegae / subway / cinema LINK, not Famille's 1F street.
  // cc_famille 22–24: cream marble, paired dark bands, dark timber/marble fronts,
  // gilded rectangular coffers. Store names / bay ordering are not readable, so left plain.
  const b1WellBounds=()=>H.f1.concat(H.b1).map(poly=>{
    const st=poly.map(q=>[(q[0]-OX)*AX+(q[1]-OZ)*AZ,(q[0]-OX)*EX+(q[1]-OZ)*EZ]);
    return [Math.min(...st.map(q=>q[0]))-.18,Math.min(...st.map(q=>q[1]))-.18,Math.max(...st.map(q=>q[0]))+.18,Math.max(...st.map(q=>q[1]))+.18];
  });
  const b1Ceiling=(s0,t0,s1,t1)=>{
    const wells=b1WellBounds().filter(q=>q[0]<s1&&q[2]>s0&&q[1]<t1&&q[3]>t0);
    const sc=[s0,s1,...wells.flatMap(q=>[Math.max(s0,q[0]),Math.min(s1,q[2])])].sort((a,b)=>a-b);
    const tc=[t0,t1,...wells.flatMap(q=>[Math.max(t0,q[1]),Math.min(t1,q[3])])].sort((a,b)=>a-b);
    for(let i=1;i<sc.length;i++)for(let j=1;j<tc.length;j++){
      const a=sc[i-1],b=sc[i],c=tc[j-1],d=tc[j];if(b-a<.01||d-c<.01)continue;
      if(wells.some(q=>(a+b)/2>q[0]&&(a+b)/2<q[2]&&(c+d)/2>q[1]&&(c+d)/2<q[3]))continue;
      const poly=RECT(a,c,b,d);K.hpoly(0xeee6d6,poly,YB1+4.15,false);K.phys.addCeiling(poly,YB1+4.15,{});
    }
  };
  const linkCoffer=(s,t,ds=5.6,dt=6.4)=>{
    if(b1WellBounds().some(q=>s+ds/2>q[0]&&s-ds/2<q[2]&&t+dt/2>q[1]&&t-dt/2<q[3]))return;
    for(const edge of [-1,1]){
      lbox(s+edge*ds/2,t,.23,dt+.23,YB1+3.82,.22,0xd9cfb9,{solid:false});
      lbox(s,t+edge*dt/2,ds,.23,YB1+3.82,.22,0xd9cfb9,{solid:false});
      lbox(s+edge*(ds/2-.15),t,.045,dt-.18,YB1+3.84,.05,0xb39a62,{solid:false});
      lbox(s,t+edge*(dt/2-.15),ds-.3,.045,YB1+3.84,.05,0xb39a62,{solid:false});
    }
    lbox(s,t,ds-.75,dt-.75,YB1+4.05,.035,{tex:'emit',color:0xfff5dc},{solid:false});
    for(let a=-ds/2+.4;a<=ds/2-.3;a+=(ds-.8)/3)lbox(s+a,t,.055,dt-.65,YB1+4.0,.065,0x443a30,{solid:false});
    for(let a=-dt/2+.4;a<=dt/2-.3;a+=(dt-.8)/3)lbox(s,t+a,ds-.65,.055,YB1+4.0,.065,0x443a30,{solid:false});
  };
  const linkFloor=(s0,t0,s1,t1,axis='s')=>{
    K.hpoly('ccLinkMarble',RECT(s0,t0,s1,t1),YB1+.012,true);
    const alongS=axis==='s';
    for(const offset of [.65,.88])for(const side of [-1,1]){
      if(alongS)lbox((s0+s1)/2,side<0?t0+offset:t1-offset,s1-s0,.1,YB1+.016,.008,0x292724,{solid:false});
      else lbox(side<0?s0+offset:s1-offset,(t0+t1)/2,.1,t1-t0,YB1+.016,.008,0x292724,{solid:false});
    }
    K.hpoly('ccLinkMosaic',RECT(s0+(alongS?.2:1.15),t0+(alongS?1.15:.2),s1-(alongS?.2:1.15),t1-(alongS?1.15:.2)),YB1+.018,true);
  };
  {
    linkFloor(-19,13,151,22);b1Ceiling(-19,13,151,22);
    for(const t of [13,22])for(let a=-12;a<149;a+=10){
      const b=Math.min(a+10,149),east=t===22;
      if((!east&&a===-12)||(east&&((a<26&&b>16)||(a<67&&b>57))))continue;
      const face=east?'W':'E',inside=east?1:-1;
      lwall(a,t,b,t,YB1,YB1+3.3,{mat:'glass',thick:.035,openings:[{at:(b-a)/2,w:2.6,y0:YB1,y1:YB1+2.8}]});
      for(const ss of [a,b]){
        lbox(ss,t,.65,.6,YB1,3.7,'ccDarkMarble');
        lbox(ss,t-inside*.34,.25,.12,YB1+1.25,1.25,{tex:'emit',color:0xffe8b2},{solid:false});
      }
      lbox((a+b)/2,t,b-a,.35,YB1+2.95,.65,{tex:'wood',color:0x574231},{solid:false});
      lbox((a+b)/2,t-inside*.2,b-a-.9,.035,YB1+3.04,.025,0xb39a62,{solid:false});
      lbox((a+b)/2,t+inside*3.3,3.6,.75,YB1,.95,{tex:'wood',color:0x72563c},{top:0xebe4d8});
      for(const ds of [-1.6,1.6])lbox((a+b)/2+ds,t+inside*3.3,.16,.18,YB1+.95,.36,0x35332e,{solid:false});
      // Side/back reveals finish the glimpsed shop bays without inventing a tenant roster.
      lwall(a,t,a,t+inside*5,YB1,YB1+3.7,{mat:0xc9bfaa,thick:.15});
      lwall(a,t+inside*5,b,t+inside*5,YB1,YB1+3.7,{mat:{tex:'wood',color:0x4b382c},thick:.15});
      void face;
    }
    for(let ss=-16;ss<149;ss+=8)linkCoffer(ss,17.5);
    linkFloor(16,22,26,38.2,'t');b1Ceiling(16,22,26,38.2);
    for(const t of [27,34])linkCoffer(21,t,7,5);
    // J4: open black-framed glass portal, no leaf across the shared eight-metre route.
    for(const ss of [16.5,25.5])lbox(ss,36.7,.48,.5,YB1,3.4,'ccDarkMarble');
    lbox(21,36.7,9,.35,YB1+3.1,.55,0x292b2a,{solid:false});
    lsign('SHINSEGAE',21,36.47,YB1+3.37,3.4,.35,'W',{bg:null,fg:'#edf1ee'});
    lsign('신세계백화점 연결 →',21,27.7,YB1+2.9,5,.45,'W',{bg:'#3b332b',fg:'#f3e9d1'});
    for(const ss of [5,74,137])lsign(['메가박스 · 지하철 7호선 →','호남선 터미널 · 파미에스테이션 1층 ↑'],ss,17.5,YB1+3.18,5,.58,'S',{bg:'#39342e',fg:'#f4ead1',twoSided:true});
    lcrowd(-18,14,148,21,YB1,42,21);
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
    const m = 0.5; sign(['센트럴시티 · 호남선 터미널 ↓', '파미에스테이션 1층 · 신세계백화점'], { x: ax + ux * 3, z: az + uz * 3, y: YB1 + 2.9, w: 6, h: 0.75, rotY: Math.atan2(-ux, -uz), bg: '#1d3557', fg: '#fff', twoSided: true });
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
    // cc_famille 23–24: link corridor continues to the station and a separate cinema portal.
    // The photos only show a shallow glimpse beyond that doorway: no invented auditoria or concessions.
    linkFloor(149,13,189.2,22);linkFloor(168.4,-89,177.4,13,'t');
    b1Ceiling(149,0,189.3,37.5);b1Ceiling(168.4,-89,177.4,0);
    for(const ss of [154,162,170,186])linkCoffer(ss,17.5);
    for(let tt=-84;tt<10;tt+=8)linkCoffer(172.9,tt,6.5,5.6);
    for(const ss of [168.4,177.4])lwall(ss,-89,ss,-36,YB1,YB1+4.1,{mat:'ccDarkMarble',thick:.18});
    lwall(177.4,-20,177.4,-9,YB1,YB1+4.1,{mat:'ccDarkMarble',thick:.18});
    // Cream arched transom, dark timber portal and diagonal lattice of photo24.
    for(const tt of [-34,-22])lbox(177.8,tt,1,.8,YB1,4.1,'ccLinkMarble');
    for(const tt of [-32.8,-23.2])lbox(177.5,tt,.5,.9,YB1,3.4,{tex:'wood',color:0x392d24});
    lbox(177.5,-28,.6,10.6,YB1+2.8,.55,{tex:'wood',color:0x392d24},{solid:false});
    lbox(177.72,-28,.2,10.5,YB1+3.35,.75,0xe4d9bd,{solid:false});
    for(let i=0;i<16;i++){
      const a=PI*i/16,b=PI*(i+1)/16;
      beam([177.4,-28+5*Math.cos(a),YB1+3.1+.85*Math.sin(a)],[177.4,-28+5*Math.cos(b),YB1+3.1+.85*Math.sin(b)],.12,0x514333);
    }
    lsign('MEGABOX',177.32,-28,YB1+3.55,4.7,.62,'N',{bg:null,fg:'#39bce9',pxPerM:100});
    for(const tt of [-32.2,-23.8])for(let yy=.3;yy<2.5;yy+=.5){
      beam([177.23,tt-.35,YB1+yy],[177.23,tt+.35,YB1+yy+.5],.10,0x392d24);
      beam([177.23,tt+.35,YB1+yy],[177.23,tt-.35,YB1+yy+.5],.10,0x392d24);
    }
    const cinema=RECT(177.9,-33.5,190.4,-22.5);
    K.hpoly({tex:'darkstone',color:0x45433e},cinema,YB1+.015,true);K.hpoly(0x191a1c,cinema,YB1+3.6,false);
    lwall(177.9,-33.5,190.4,-33.5,YB1,YB1+4,{mat:0x292723});lwall(177.9,-22.5,190.4,-22.5,YB1,YB1+4,{mat:0x292723});
    lwall(190.4,-33.5,190.4,-22.5,YB1,YB1+4,{mat:0x252523});
    for(const tt of [-32.7,-23.3])for(const ss of [181.4,185.4]){
      lbox(ss,tt,.8,.12,YB1+.4,1.7,0x17191d,{solid:false});
      lbox(ss,tt+(tt<-28?.08:-.08),.65,.035,YB1+.6,1.3,{tex:'emit',color:0x2466b6},{solid:false});
      lsign('MEGABOX',ss,tt+(tt<-28?.11:-.11),YB1+1.7,.6,.2,tt<-28?'E':'W',{bg:null,fg:'#b2ddff',bold:false});
    }
    for(const tt of [-30.8,-25.2])lbox(182.2,tt,.8,.35,YB1,1,0x55514a);
    for(const ss of [181.4,185.4])lcyl(ss,-28,YB1+3.5,.6,.06,{tex:'emit',color:0xe7b966},{solid:false});
    for(const tt of [4,28]){linkFloor(181,tt-3,189.3,tt+3);lsign('지하철 7호선 →',185,tt,YB1+3.1,4,.5,'S',{bg:'#39342e',fg:'#f4ead1'});}
    lsign(['메가박스 센트럴 ←','파미에스테이션 1층 ↑'],164,10,YB1+3.1,5.2,.65,'S',{bg:'#39342e',fg:'#f4ead1'});
    lzone(177.4,-34,190.4,-22,{name:'메가박스 센트럴',floor:'B1',sub:'영화관 입구',y0:YB1-.5,y1:YB1+4.1,priority:4});
    lcrowd(169,-86,176,8,YB1,16,41);lcrowd(152,4,187,13,YB1,18,42);
  }
  {
    // ---- 1F Famille: separate restaurant facades along a tall indoor street (2026 photos01–21).
    // Exact tenant order is unmeasured. Floor/ceilings/frontage themes follow each individual photo.
    const plant=(s,t,h=2.6)=>{
      lcyl(s,t,0,.55,.65,0xd7d3c6,{seg:12});lcyl(s,t,.65,.07,h-.65,0x67543b,{solid:false});
      for(const [ds,dt,yy] of [[0,0,h],[-.35,.15,h-.4],[.3,-.2,h-.25]]){
        const q=P(s+ds,t+dt);K.dome({x:q[0],z:q[1],y:yy,rx:.65,ry:.5,rz:.7,mat:0x557048,hemi:false,seg:8,rings:4});
      }
    };
    const bench=(s,t,span=2.7)=>{
      lbox(s,t,.48,span,.42,.10,{tex:'wood',color:0xc3935a});
      for(const dt of [-span*.35,span*.35])lbox(s,t+dt,.4,.09,0,.42,0x2b2a28);
    };
    const arch=(s,t,w,y,spring,rise,mat=0xe9dfc9)=>{
      for(const dt of [-w/2,w/2])lbox(s,t+dt,.22,.18,y,spring,mat,{solid:false});
      for(let i=0;i<16;i++){
        const a=PI*i/16,b=PI*(i+1)/16;
        beam([s,t+w/2*Math.cos(a),y+spring+rise*Math.sin(a)],[s,t+w/2*Math.cos(b),y+spring+rise*Math.sin(b)],.2,mat);
      }
    };
    const table=(ss,tt,y,pal,tablet=false)=>{
      lbox(ss,tt,.9,1.1,y+.7,.075,pal[0]);lbox(ss,tt,.12,.14,y,.7,0x35332d);
      for(const dt of [-.83,.83]){
        lbox(ss,tt+dt,.48,.44,y+.43,.075,pal[1]);lbox(ss+.22,tt+dt,.06,.44,y+.5,.45,pal[1],{solid:false});
        for(const ds of [-.17,.17])lbox(ss+ds,tt+dt,.045,.32,y,.43,0x39352e,{solid:false});
      }
      if(tablet){lbox(ss+.18,tt,.08,.25,y+.77,.23,0x282a2b,{solid:false});lbox(ss+.13,tt,.015,.21,y+.8,.16,{tex:'emit',color:0x48889c},{solid:false});}
    };
    const familyShop=({t0,t1,front,back,name,type})=>{
      const dir=Math.sign(front-back),dep=Math.abs(front-back),tc=(t0+t1)/2,w=t1-t0,face=dir>0?'S':'N',y=type==='hoho'?.45:0;
      const at=(v)=>front-dir*v,wallMat=type==='modern'?'ccWhiteBrick':type==='hoho'||type==='florist'?0xe9dfc9:type==='garden'?0xdcbfa9:'ccFamBrick';
      const floor=type==='cha'?'ccSmallCheck':type==='buddha'||type==='modern'?{tex:'tile',color:0x555750}:'ccGreyTile';
      const poly=RECT(Math.min(front,back),t0,Math.max(front,back),t1);
      if(y)K.slab(poly,y,{mat:floor,thick:.45,under:false});else K.hpoly(floor,poly,.014,true);
      for(const t of [t0,t1])lwall(back,t,front,t,y,y+3.65,{mat:wallMat,thick:.16});
      lwall(back,t0,back,t1,y,y+3.65,{mat:type==='cha'?0xc6a04d:type==='buddha'?0x393936:0xe4dccd,thick:.18});
      const clear=type==='modern'?3.2:type==='hoho'?3.8:type==='agra'?3.2:Math.min(4,w-1.2);
      lwall(front,t0,front,t1,y,y+2.85,{mat:'glass',thick:.035,openings:[{at:w/2,w:clear,y0:y,y1:y+2.8}]});
      for(const tt of [t0+.25,t1-.25]){
        lbox(front,tt,.65,.55,0,type==='modern'?6.2:4.45,wallMat);
        if(type==='hoho'||type==='florist')for(const hh of [.15,3.9])lbox(front,tt,.85,.85,hh,.18,0xece3d0,{solid:false});
      }
      lbox(front+dir*.12,tc,.27,w-.5,y+2.85,.68,type==='florist'?0xe9dfc9:0x352d27,{solid:false});
      lsign(name,front+dir*.28,tc,y+3.19,Math.min(w-1,6.3),.43,face,{bg:null,fg:type==='cha'?'#83d4f2':type==='agra'?'#c8e7ff':'#fff2d1',font:type==='garden'?undefined:SERIF,bold:type!=='hoho',pxPerM:105,italic:type==='cha'||type==='agra'});
      // Fascia letters sit on bronze, with a thin warm light under the shop eave.
      lbox(front+dir*.21,tc,.08,w-.6,y+2.8,.035,{tex:'emit',color:0xffe9bb},{solid:false});
      if(type!=='modern'){
        K.hpoly(type==='cha'?0x282b2b:0xebe2d1,poly,y+3.65,false);K.phys.addCeiling(poly,y+3.65,{});
        for(let tt=t0+1;tt<t1;tt+=2.2)for(const v of [2,5.8])lcyl(at(v),tt,y+3.58,.09,.025,{tex:'emit',color:0xffeed2},{solid:false});
      }
      if(['hoho','agra','modern'].includes(type))arch(front+dir*.2,tc,type==='modern'?clear:Math.min(w-1.5,5),y,2.05,type==='modern'?1.2:.8,wallMat);
      if(type==='hoho'){
        for(let v=.4;v<dep;v+=.28)lbox(at(v),tc,.08,w-.4,y+3.42,.18,{tex:'wood',color:0xb98a58},{solid:false});
        // Three broad low steps, leaving the eight-metre street clear beyond the approach.
        for(let i=0;i<3;i++)lbox(front+dir*(.9-i*.3),tc,.3,4.6,0,.15*(i+1),0xb4ad9f);
        lsign('hoho',front+dir*.21,t0+1.3,y+2.02,.75,.75,face,{bg:'#ffca45',fg:'#694626',font:'serif',bold:false});
        for(const tt of [t0+2,t1-2])arch(front+dir*.1,tt,2.2,0,3.65,.65,0xe9dfc9);
      }
      if(type==='cha'){
        for(let tt=t0+.7;tt<t1;tt+=1.5)lbox(front,tt,.14,.08,0,2.8,0x2b3531,{solid:false});
        for(const v of [2.6,6.2]){
          lbox(at(v),t0+1.15,.62,1.8,.42,.18,0x8b3236);lbox(at(v)+.32,t0+1.15,.1,1.8,.6,.7,0x8b3236,{solid:false});
          lbox(at(v)+.33,t0+1.15,.12,1.84,1.27,.055,0x3d7770,{solid:false});
        }
      }
      if(type==='garden'){
        // Photo13: a long water channel with stone/leaf props and parallel timber counters.
        lbox(at(dep/2),tc,dep-2,1.9,0,.4,0x3a3930);
        K.hpoly('water',RECT(Math.min(at(1),at(dep-1)),tc-.78,Math.max(at(1),at(dep-1)),tc+.78),.42,true);
        for(const dt of [-1.4,1.4]){
          lbox(at(dep/2),tc+dt,dep-2,.65,.72,.1,{tex:'wood',color:0xd6b583});
          for(let v=1.6;v<dep-1;v+=1.3){lbox(at(v),tc+dt*1.55,.5,.5,.42,.07,0xc3a376);lbox(at(v),tc+dt,.22,.22,.83,.04,0x262b2b,{solid:false});}
        }
        for(const v of [2,4.5,7]){const q=P(at(v),tc);K.dome({x:q[0],z:q[1],y:.44,rx:.35,ry:.28,rz:.28,mat:0x75766a,seg:8,rings:4});lcyl(at(v)+.35,tc+.4,.45,.3,.02,0x3e865b,{solid:false});}
        for(const tt of [t0+.5,t1-.5])lbox(at(dep/2),tt,dep-.4,.14,3.45,.06,{tex:'emit',color:0xd5f5f1},{solid:false});
      }else{
        const pal=type==='buddha'?[0xb39770,0x263a44]:type==='modern'?[0x976647,0x2c302e]:type==='cha'?[0xbfc0b6,0x372e28]:[0xd1b183,0xc4a16d];
        for(let tt=t0+1.8;tt<t1-1;tt+=2.7)for(const v of [3.3,6.8]){
          if(type==='florist')continue;
          table(at(v),tt,y,pal,type==='hoho');if((Math.round(tt*10)+Math.round(v*10))%3===0)lperson(at(v),tt-.83,y,{sit:true});
        }
      }
      if(type==='agra')for(let tt=t0+1;tt<t1;tt+=2){
        arch(back+dir*.16,tt,1.45,0,1.7,.65,0xf1e5ce);lbox(back+dir*.6,tt,.85,1.55,.4,.14,0xd8cbb4);lbox(back+dir*.23,tt,.14,1.55,.54,.85,0xd8cbb4,{solid:false});
      }
      if(type==='modern'){
        // Photo15–17 glasshouse roof; double-height void is cut from the real 2F slab below.
        const glasshouse=RECT(192,t0+.15,Math.max(front,back)-.15,t1-.15);hole(['f2'],glasshouse);
        for(const ss of [192,201.35])rail(ss,t0+.15,ss,t1-.15,Y2);
        for(const tt of [t0+.15,t1-.15])rail(192,tt,201.35,tt,Y2);
        K.hpoly({tex:'glass',color:0xd5dfdc},glasshouse,6.5,false);
        for(let tt=t0+.6;tt<t1;tt+=2.2){
          hallTube([192,tt,5.8],[back,tt,6.4],.12,0x727c75);
          hallTube([192,tt,5.8],[back,tt,5.8],.1,0x727c75);
          for(let v=3;v<dep-1;v+=2)hallTube([at(v),tt,5.8],[at(v+2),tt,6.4],.07,0x727c75);
          hallTube([at(4),tt,6],[at(4),tt,3.4],.025,0x373d38);
          const q=P(at(4),tt);K.dome({x:q[0],z:q[1],y:3.4,rx:.4,ry:.28,rz:.4,mat:0xb47c46,seg:10,rings:4});
        }
        for(const tt of [t0+.1,t1-.1])for(let v=1;v<dep;v+=1.6)lbox(at(v),tt,.06,.08,3.4,2.9,0x4c5851,{solid:false});
        // A single carriage-like booth visible in photo16, kept behind the main aisle.
        lbox(back+dir*.8,tc,1.3,w-1,.0,.45,0x4a2e28);lbox(back+dir*.25,tc,.2,w-1,.45,1.6,0x243840,{solid:false});
        for(let tt=t0+1;tt<t1;tt+=1.4)lbox(back+dir*.38,tt,.04,.06,.85,1.9,0xc2a16b,{solid:false});
        lsign('MODERN NULANG',front+dir*.36,t1-.8,1.65,1.2,.3,face,{bg:'#252d2b',fg:'#d5bf8a',font:SERIF});
      }
      if(type==='florist'){
        for(let tt=t0+1;tt<t1;tt+=1.5){lbox(back+dir*.5,tt,.8,1.3,0,2.4,0x222c28);lbox(back+dir*.94,tt,.035,1.15,.2,2.05,'glass',{solid:false});if(Math.abs(tt-tc)>1.6)plant(at(2),tt,1.2+(tt-t0)%2*.3);}
        lbox(at(dep/2),tc,dep-1,.055,.12,.05,{tex:'emit',color:0xffe6b5},{solid:false});
      }
      bench(front+dir*.85,t0+1.7,2.4);plant(front+dir*.7,t1-.8,2.5);
      // Menu stand and short queue stay at the façade; centre of street remains open.
      lbox(front+dir*.65,tc+clear/2+.3,.14,.65,0,1.15,0x3d3328);
      lsign('메뉴 안내',front+dir*.75,tc+clear/2+.3,1.08,.6,.75,face,{bg:'#e9e0cc',fg:'#4c4031',bold:false});
      for(const v of [.9,1.8]){lcyl(front+dir*v,tc-2,0,.035,.9,0x3c3934);lperson(front+dir*v,tc-1.3,0);}
      lzone(Math.min(front,back),t0,Math.max(front,back),t1,{name,floor:'1F',sub:'파미에스테이션',y0:-.1,y1:4.5,priority:5});
    };
    // Rectangular tile street, pale skylight ceiling and separate facades.
    K.hpoly('ccGreyTile',RECT(168.5,-89,202.3,17.5),.008,true,H.f1.filter(h=>K.pointInPoly(...h[0],RECT(168.5,-89,202.3,17.5))));
    const streetVoids=[RECT(181.2,-85,188.8,-26),RECT(181.2,-16,188.8,15)];
    for(const poly of streetVoids){hole(['f2'],poly);K.hpoly(0xeee8da,poly,6.2,false);}
    for(const [ta,tb] of [[-85,-26],[-16,15]]){
      for(const ss of [181.2,188.8])rail(ss,ta,ss,tb,Y2);
      rail(181.2,ta,188.8,ta,Y2);rail(181.2,tb,188.8,tb,Y2);
      for(let tt=ta+2;tt<tb-1;tt+=3.4){
        lbox(185,tt,5.8,2.5,6.12,.04,{tex:'emit',color:0xf8f5eb},{solid:false});
        for(const ds of [-2.95,0,2.95])lbox(185+ds,tt,.08,2.6,6.06,.1,0xaca391,{solid:false});
        for(const dt of [-1.3,1.3])lbox(185,tt+dt,6,.08,6.06,.1,0xaca391,{solid:false});
      }
    }
    for(const spec of [
      {t0:-83,t1:-70,front:181,back:172,name:'호호식당',type:'hoho'},
      {t0:-62,t1:-54,front:181,back:172,name:'Cha R',type:'cha'},
      {t0:-45,t1:-35,front:181,back:172,name:"BUDDHA’S BELLY",type:'buddha'},
      {t0:-64,t1:-52,front:189,back:201.5,name:'모던눌랑',type:'modern'},
      {t0:-45,t1:-37,front:189,back:201.5,name:'Agra',type:'agra'},
      {t0:-12,t1:1,front:189,back:201.5,name:'일상정원',type:'garden'},
      {t0:5,t1:14,front:181,back:172,name:'LEJARDIN',type:'florist'},
    ])familyShop(spec);
    // Entry plaque in the brick pier (photo06); no unsupported promotional copy.
    lbox(181,-18,.5,2.3,0,4.4,'ccFamBrick');
    lsign('FAMILLE STATION',181.28,-18,1.7,1.35,.45,'S',{bg:'#332c27',fg:'#d7c69d',font:SERIF,border:'#aa946c'});
    lsign('파미에스테이션',181.3,-18,2.28,1.8,.32,'S',{bg:null,fg:'#e9a1ca',bold:false});
    // cc_hall17/19/20: brick arrival passage with white panels, arches and yellow tactile line.
    for(let tt=-86;tt<-25;tt+=8){
      lbox(172,tt,.55,.6,0,3.8,'ccFamBrick');arch(172.32,tt+3.3,5.5,0,2.6,.8,'ccFamBrick');
      lbox(170,tt,3.2,6.8,3.75,.08,0xeee9df,{solid:false});
      lbox(170,tt,1.2,2.2,3.7,.035,{tex:'emit',color:0xfff0d7},{solid:false});
      for(let v=-3;v<3;v+=.6)lbox(169.6,tt+v,.35,.5,.018,.01,0xc9a64d,{solid:false});
    }
    lsign(['현재 위치 : 하차장','이곳은 버스에서 내리는 곳입니다.','지하철 · 파미에스테이션 →'],172.36,-28,1.75,1.5,2.1,'S',{bg:'#eee9df',fg:'#3d3b37',bold:false,box:.06});
    lsign(['파미에스테이션 1층','호호식당 · 차알 · 일상정원'],185,16,3.45,5,.65,'W',{bg:'#3b322a',fg:'#f5e8c9'});
    lsign(['메가박스 · 지하철 B1 ↓','2층 식당가 ↑'],172,24,3.4,4,.65,'N',{bg:'#3b322a',fg:'#f5e8c9'});
    // Arrival waiting benches and a few street-side terrace seats (photo11).
    for(const tt of [-86,-66,-48,-30]){bench(175,tt,3);plant(175,tt+2.5,2.8);}
    for(const tt of [-33,-30])table(179.5,tt,0,[0x84735c,0x30342e]);
    lcrowd(183.3,-84,186.8,14,0,35,52);lcrowd(152,0,168,36,0,14,53);
    lzone(181.3,-85,188.7,15,{name:'파미에스테이션',floor:'1F',sub:'호호식당 · 차알 · 붓다스벨리 · 모던눌랑 · 아그라 · 일상정원',y0:-.5,y1:C1,priority:4});
    for(const poly of streetVoids)K.zone({poly,name:'파미에스테이션',floor:'1F',sub:'실내 거리',y0:C1,y1:6.2,priority:4});
    lzone(192,-63.85,201.35,-52.15,{name:'모던눌랑',floor:'1F',sub:'유리 지붕 식당',y0:C1,y1:6.5,priority:5});
  }
  {
    // ---- Retained 2F dining galleries. No recent wide photo establishes a complete tenant plan.
    // Keep the earlier researched north row, an open south gallery, and bridges at both ends / t-26..-16.
    const y=Y2,h=C2-Y2;
    for(const [u0,u1,name] of [[-86,-68,'명동교자'],[-66,-44,'아웃백 스테이크하우스'],[-42,-26,'채선당 샤브보트'],[-24,-12,'소이연남'],[-10,2,'팔도국수 면주방'],[2,14,'홍대만뽀']])
      shop({axis:'t',u0,u1,f:181,b:168.5,y,h,name,seed:u0+500});
    // A continuous gallery south of the voids is three metres wide, including past the glasshouse.
    for(let tt=-87;tt<17;tt+=6)lbox(190.4,tt,1,1,C2-.06,.04,{tex:'emit',color:0xfff0d8},{solid:false});
    for(const tt of [-87,-21,17])lbox(185,tt,1.2,1.2,C2-.06,.04,{tex:'emit',color:0xfff0d8},{solid:false});
    lsign(['2층 식당가','명동교자 · 아웃백 · 소이연남'],185,-21,y+2.5,5,.65,'W',{bg:'#3b322a',fg:'#f5e8c9'});
    lcrowd(189.1,-87,191.6,18,y,21,61);lcrowd(182,-25,188,-17,y,5,62);
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
    edge(8, Y1, C1, SOUTH_STONE, M.wallIn, [[...P1(186, -98.6), 4, Y1, 3.0]],{vBase:0});
    const D9 = [[-81, 4], [-10, 6], [2, 8], [14, 4]].map(([t, w]) => { const s = 204.1 - (t + 98.9) * (1.3 / 135.8); const p = P1(s, t); return [p[0], p[1], w, Y1, 3.2]; });
    const southGlass = [-24,-16,-6,6,18,26].map(t => {
      const s=204.1-(t+98.9)*(1.3/135.8); return [...P1(s,t),3.6,0.65,3.25];
    });
    edge(9,Y1,C1,SOUTH_STONE,M.wallIn,[...D9,...southGlass],{vBase:0});
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
      edge(i,C1,YR,(i===8||i===9)?SOUTH_STONE:i===10?0x9a968f:BAND,M.wallIn,windows,(i===8||i===9)?{vBase:0}:{});
      const face=Math.atan2(ns[i][0],ns[i][1]),ux=Math.cos(face),uz=-Math.sin(face);
      for(const [x,z,w,y0,y1] of windows) K.wall(x-ux*w/2,z-uz*w/2,x+ux*w/2,z+uz*w/2,y0,y1,
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
    // Only the visible stair descent is evidenced. Stop at a plain lower closure;
    // no speculative underground corridor, destination label or portal is added.
    const stairHole=RECT(sc-1.5,-18.8,sc+1.5,-12.1);
    K.groundHole(stairHole);
    K.slab(RECT(head.s0,head.t0,head.s1,head.t1),0,{mat:0x9b9d97,holes:[stairHole],thick:.12,under:0x7d8581});
    const sa=P(sc,-17.4),sb=P(sc,-12.1);
    K.stairs(...sa,...sb,{w:2.8,ya:-1.4,yb:0,mat:0x7e8581,railMat:0x66716c});
    K.slab(RECT(sc-1.5,-18.8,sc+1.5,-17.3),-1.4,{mat:0x737d77,thick:.12,ceil:false});
    for(const ss of [sc-1.5,sc+1.5])lwall(ss,-18.8,ss,-12.1,-1.4,.15,{mat:0x626d66,thick:.12});
    lwall(sc-1.5,-18.8,sc+1.5,-18.8,-1.4,2.8,{mat:0x303b34,thick:.12});

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
  // ================================================================= slabs (after all holes are registered)
  K.slab(B1POLY,YB1,{mat:'ccLinkMarble',under:false,ceil:false,holes:H.b1,edge:false});
  K.slab(F1POLY,Y1,{mat:M.hallFloor,under:false,holes:H.f1,thick:.3});
  const localS=q=>(q[0]-OX)*AX+(q[1]-OZ)*AZ;
  const localT=q=>(q[0]-OX)*EX+(q[1]-OZ)*EZ;
  const center=poly=>poly.reduce((a,q)=>[a[0]+q[0]/poly.length,a[1]+q[1]/poly.length],[0,0]);
  // B1 coffer ceiling sits below the structural underside; keep the existing escalator openings.
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

  // ================================================================= zones
  lzone(-22.5, -1, 151, 23, { name: '센트럴시티터미널 (호남선)', floor: '1F', sub: '대합실 · 매표소 · 무인발권기 · 승차홈', y0: -0.5, y1: HALL_CROWN, priority: 2 });
  lzone(-12, -18, 151, 6, { name: '호남선 승차홈', floor: '1F', sub: '광주 · 전주 · 목포 · 여수 · 순천', y0: -0.5, y1: C1, priority: 3 });
  lzone(151, -99, 205, 39, { name: '파미에스테이션 · 하차장', floor: '1F', sub: '호호식당 · 차알 · 붓다스벨리 · 모던눌랑 · 아그라 · 일상정원 · 하차장', y0: -0.5, y1: C1, priority: 2 });
  lzone(-22.5, 23, 151, 39.5, { name: '센트럴시티 식당가', floor: '2F', sub: '순대실록 · 101번지 남산돈까스 · 르사이공 · 우마이도 · 서대문 한옥집', y0: C1, y1: C2, priority: 2 });
  lzone(151, -99, 205, 39, { name: '파미에스테이션 2F', floor: '2F', sub: '아웃백 · 명동교자 · 소이연남 · 팔도국수 면주방 · 홍대만뽀 · 채선당 샤브보트', y0: C1, y1: C2, priority: 2 });
  lzone(-22.5, -1, 151, 39.5, { name: '센트럴시티 지하 연결통로', floor: 'B1', sub: '신세계백화점 · 메가박스 · 지하철 연결', y0: YB1 - 0.5, y1: CB, priority: 2 });
  K.zone({ poly: B1POLY.filter((p, i) => i >= 6 && i <= 16).concat([P(151, 38.5)]), name: '센트럴시티 남측 연결통로', floor: 'B1', sub: '메가박스 입구 · 지하철 7호선 · 1층 파미에스테이션', y0: YB1 - 0.5, y1: CB, priority: 2 });
  lzone(168.4, -89, 177.4, -10, { name: '메가박스 연결통로', floor: 'B1', sub: '메가박스 센트럴 입구', y0: YB1 - 0.5, y1: CB, priority: 3 });
  lzone(163, -94, 168.2, -26, { name: '호남선 하차장', floor: '1F', sub: '도착 · 택시 승강장 · 지하철 방면', y0: -0.5, y1: 4.4, priority: 3 });

  // ================================================================= spawns
  // yaw: facing local +s (south-ish) = R+π, -s = R, +t (east) = R+3π/2, -t (west) = R+π/2
  const YAW = { S: R + PI, N: R, E: R + 1.5 * PI, W: R + PI / 2 };
  const sp = (name, s, t, y, face) => { const [x, z] = P(s, t); K.spawn({ name, x, y, z, yaw: YAW[face] }); };
  sp('센트럴시티 정문 (신반포로)', -30, 19.5, 0, 'S');
  sp('호남선 대합실 · 매표소', 112, 20, 0, 'W');
  sp('호남선 승차홈 (8번)', bays.find(b => b.p === 8).s, 4.6, Y1 + 0.12, 'W');
  sp('신세계 · 메가박스 연결통로 (B1)', 60, 19, YB1, 'S');
  sp('메가박스 센트럴 입구 (B1)', 173.4, -28, YB1, 'S');
  sp('파미에스테이션 1층 · 호호식당', 185, -76, Y1, 'N');
  sp('호남선 하차장 · 택시 승강장', 167.5, -50, 0.15, 'N');
  sp('파미에스테이션 2F 식당가', 190.4, -21, Y2, 'W');
  K.spawn({ name: '센트럴시티 ↔ 고투몰 연결통로 (B1)', x: -140.9, y: YB1, z: -34.6, yaw: Math.atan2(18.2, 40.5) + PI });
  sp('센트럴시티 식당가 2F', 30, 25.2, Y2, 'S');
  sp('센트럴시티 옥상 주차장', 70, 16, YR, 'S');
  K.spawn({ name: '파미에스테이션 원형관 (스타벅스)', x: -47, y: 0, z: 195.6, yaw: PI });
}
