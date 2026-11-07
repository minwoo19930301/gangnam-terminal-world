// 서울고속버스터미널: OSM ground-contact outlines; aerial lots and photographed concrete tiers.
// Reference/inference ledger: data/research/gyeongbu.json. No runtime animation/allocation.
export const meta = {
  id: 'gyeongbu', name: '서울고속버스터미널 (경부·영동선)',
  claims: [309352819, 356129682, 356129683, 1173093435],
  claimRoads: [356129685, 356129687, 356129690, 356130053, 356130054, 715692653, 660731157, 1259394249, 1259394250, 1259394251, 1259394252, 356129974, 655403255, 1115924614, 715692651, 1132460905],
  claimAreas: [1173093431, 1173093432, 1173093433, 1173093434, 1173096051, 356129681, 14188630, 886400350],
  sources: ['.codex-jobs/evidence/walk_s3_gyeongbu.json', 'refs/walk/s3_gyeongbu/', 'refs/official/gyeongbu/exterminal_directory_parsed.json', 'refs/official/gyeongbu/exterminal_floor/n_floor011.jpg', 'refs/official/gyeongbu/exterminal_floor/n_floorb01.jpg', 'refs/official/gyeongbu/exterminal_floor/n_floorb01_sub.jpg', 'refs/interior/daiso/notes_1.json', '.codex-jobs/evidence/daiso.json', 'refs/interior/gb_hall/notes.json', 'refs/interior/gb_flower/notes.json', 'refs/aerial/gyeongbu_lots.jpg', 'refs/roadview/manifest.json',
    'refs/roadview/gb_01_north_wing_plaza_lot_from_sinbanporo.jpg',
    'refs/roadview/gb_02_north_wing_arcade_plaza_lot_west.jpg',
    'refs/roadview/gb_03_front_plaza_arch_canopy_shelters.jpg',
    'refs/roadview/gb_04_west_wing_stepped_tiers_terracotta_end_from_sinbanporo.jpg',
    'refs/roadview/gb_05_sinbanporo_east_bus_shelters_terminal_side.jpg',
    'refs/photos/gyeongbu/01_exterior_dusk_neon_side.jpg',
    'refs/photos/gyeongbu/02_front_sign_boarding_yard_bus.jpg', 'refs/photos/gyeongbu/03_tower_vertical_sign_front.jpg',
    'refs/photos/gyeongbu/05_gate_hall_departure_boards.jpg', 'refs/photos/gyeongbu/08_diagonal_facade_struts.jpg',
    'data/research/gyeongbu_visual.json', 'https://news.seoul.go.kr/traffic/?p=508344',
    'https://mediahub.seoul.go.kr/archives/1220355', 'https://m.seoul.co.kr/news/2013/01/07/20130107500012'],
};

export function build(K) {
  const { LEVELS } = K, PI = Math.PI;
  const O = [2.3, -59.24], A = [0.9348, -0.3552], B = [0.3552, 0.9348];
  const ROT = Math.atan2(0.3552, 0.9348);
  const W = (u, v) => [O[0] + u * A[0] + v * B[0], O[1] + u * A[1] + v * B[1]];
  const toL = (x, z) => [(x - O[0]) * A[0] + (z - O[1]) * A[1], (x - O[0]) * B[0] + (z - O[1]) * B[1]];
  const rect = (u0, v0, u1, v1) => [W(u0, v0), W(u1, v0), W(u1, v1), W(u0, v1)];
  const FACE = { '+v': ROT, '-v': ROT + PI, '+u': ROT + PI / 2, '-u': ROT - PI / 2 };
  const FDIR = { '+v': [0, 1], '-v': [0, -1], '+u': [1, 0], '-u': [-1, 0] };
  const yawL = (du, dv) => { const dx = du * A[0] + dv * B[0], dz = du * A[1] + dv * B[1]; return Math.atan2(-dx, -dz); };
  const rnd = K.rand(4242);
  const pick = (arr) => arr[Math.floor(rnd() * arr.length) % arr.length];

  function lbox(u, v, y, w, d, h, mat, o = {}) {
    const [x, z] = W(u, v);
    return K.box({ x, z, y, w, h, d, rotY: ROT + (o.rot || 0), mat, ...o });
  }
  // box from a local rect
  function rbox(u0, v0, u1, v1, y, h, mat, o = {}) { return lbox((u0 + u1) / 2, (v0 + v1) / 2, y, Math.abs(u1 - u0), Math.abs(v1 - v0), h, mat, o); }
  function lsign(text, u, v, y, w, h, face, o = {}) { const [x, z] = W(u, v); const ppm = o.pxPerM ?? Math.min(96, 1020 / w, 500 / h); K.sign(text, { x, y, z, w, h, rotY: FACE[face], ...o, pxPerM: ppm }); }
  function lwall(u0, v0, u1, v1, y0, y1, o = {}) { const a = W(u0, v0), b = W(u1, v1); K.wall(a[0], a[1], b[0], b[1], y0, y1, o); }
  function lesc(u0, v0, u1, v1, o) { const a = W(u0, v0), b = W(u1, v1); K.escalator(a[0], a[1], b[0], b[1], o); }
  function lstairs(u0, v0, u1, v1, o) { const a = W(u0, v0), b = W(u1, v1); K.stairs(a[0], a[1], b[0], b[1], o); }
  function lramp(u0, v0, u1, v1, o) { const a = W(u0, v0), b = W(u1, v1); K.ramp(a[0], a[1], b[0], b[1], o); }
  function lzone(name, floor, sub, u0, v0, u1, v1, y0, y1, priority = 1) { K.zone({ name, floor, sub, poly: rect(u0, v0, u1, v1), y0, y1, priority }); }
  function lquadH(u0, v0, u1, v1, y, mat) { const p = rect(u0, v0, u1, v1).map(([x, z]) => [x, y, z]); K.quad(mat, p, [0, 1, 0]); }
  function lfloorText(t, u, v, y, w, h, face, o = {}) { const [x, z] = W(u, v); K.floorText(t, { x, y, z, w, h, rotY: FACE[face] + PI, pxPerM: 36, bg: '#2a2a2a', ...o }); }
  function lperson(u, v, y, o = {}) { const [x, z] = W(u, v); K.person(x, y, z, o); }
  function lcrowd(u0, v0, u1, v1, y, n, seed) { K.crowd(rect(u0, v0, u1, v1), y, n, { seed }); }
  function lcar(u, v, y, rot, kind = 'car', o = {}) { const [x, z] = W(u, v); K.vehicle({ x, y, z, rotY: rot, kind, ...o }); }
  function lcyl(u, v, y, r, h, mat, o = {}) { const [x, z] = W(u, v); K.cyl({ x, y, z, r, h, mat, ...o }); }
  function lelev(name, u, v, face, floors, o = {}) { const [x, z] = W(u, v); K.elevator({ name, x, z, rotY: FACE[face], w: 2.2, d: 2.2, floors, ...o }); }
  function lspawn(name, u, v, y, du, dv) { const [x, z] = W(u, v); K.spawn({ name, x, y, z, yaw: yawL(du, dv) }); }
  // Local-coordinate helpers share the active kit, including during lazy callbacks.
  function ldetail(options, furnish) {
    const owner = K;
    owner.detail(options, detailK => {
      const saved = K; K = detailK;
      try { furnish(); } finally { K = saved; }
    });
  }
  K.texture('gb_shelf', 128, 128, (g, w, h) => {
    g.fillStyle = '#f2f0ea'; g.fillRect(0, 0, w, h);
    const cols = ['#e04545', '#3d7fd6', '#f2c53d', '#4cb06c', '#f08a3c', '#9b59b6', '#ffffff', '#2fb5b5', '#f78fb3', '#7f8c8d'];
    let k = 0;
    for (let r = 0; r < 5; r++) {
      const y0 = r * h / 5; g.fillStyle = '#cfcac0'; g.fillRect(0, y0 + h / 5 - 4, w, 4);
      let x = 0; while (x < w) { const bw = 6 + ((k * 7) % 11); g.fillStyle = cols[(k * 3 + r) % cols.length]; g.fillRect(x + 1, y0 + 4 + (k % 3) * 2, bw - 2, h / 5 - 10 - (k % 3) * 2); x += bw; k++; }
    }
  }, [1.6, 1.9]);
  K.texture('gb_flowerbin', 256, 128, (g, w, h) => {
    const cols = ['#d8263f', '#f4b6c6', '#f7f3ea', '#f2c81c', '#f07a22', '#9b4fc4', '#ee5a96', '#f3dc9c', '#b5174f', '#f9d9e3', '#e8433a', '#c8a2e6'];
    g.fillStyle = '#2f4f2a'; g.fillRect(0, 0, w, h);
    const cw = w / 4, ch = h / 2;
    let k = 0;
    for (let j = 0; j < 2; j++) for (let i = 0; i < 4; i++, k++) {
      const x0 = i * cw, y0 = j * ch, cx = x0 + cw / 2, cy = y0 + ch / 2;
      // wrap (newspaper / kraft paper cone) visible at the bunch edges
      g.fillStyle = k % 3 === 0 ? '#cfc8b4' : k % 3 === 1 ? '#a98455' : '#dcd7cb';
      g.beginPath(); g.moveTo(cx - cw * 0.46, cy + ch * 0.1); g.lineTo(cx + cw * 0.46, cy + ch * 0.1); g.lineTo(cx + cw * 0.12, cy + ch * 0.5); g.lineTo(cx - cw * 0.12, cy + ch * 0.5); g.fill();
      // leaves
      g.fillStyle = '#4f7d3c';
      g.beginPath(); g.ellipse(cx, cy - 1, cw * 0.46, ch * 0.42, 0, 0, 6.283); g.fill();
      // blossoms: one colour per bunch, densely packed heads with a soft darker centre
      const c = cols[(k * 5 + j) % cols.length];
      for (let n = 0; n < 15; n++) {
        const a = n * 2.39996, rr = 2 + Math.sqrt(n) * 6.2;
        const bx = cx + Math.cos(a) * rr * 1.05, by = cy - 2 + Math.sin(a) * rr * 0.72;
        g.fillStyle = c; g.beginPath(); g.arc(bx, by, 6.8, 0, 6.283); g.fill();
        g.fillStyle = 'rgba(0,0,0,0.13)'; g.beginPath(); g.arc(bx + 1, by + 1, 2.6, 0, 6.283); g.fill();
      }
    }
  }, [1.3, 0.65]);

  const CREAM = 0xe3dfd4, BROWN = 0x65473f, DARK = 0x303a3e;
  // Photo02/aerial: use actual mid-grey texels, not a tint multiplied into the kit's dark asphalt.
  for(const [key,base,light,dark] of [['gb_asphalt','#5d5f60','#696b6c','#555758'],['gb_aisle','#6a6c6d','#757778','#626465']]){
    K.texture(key,128,128,(g,w,h)=>{g.fillStyle=base;g.fillRect(0,0,w,h);const r=K.rand(902);
      for(let i=0;i<950;i++){g.fillStyle=i%2?light:dark;g.fillRect(r()*w,r()*h,1,1);}
    },[3,3]);
  }
  const asphalt = 'gb_asphalt', aisle = 'gb_aisle';
  // Photo 05: grey speckled terrazzo, white acoustic tiles and black column skirting.
  K.texture('gb_terrazzo',256,256,(g,w,h)=>{
    g.fillStyle='#a7a397';g.fillRect(0,0,w,h);
    const r=K.rand(509);for(let i=0;i<2800;i++){g.fillStyle=i%3?'#bdb9ac':'#7b7970';g.fillRect(r()*w,r()*h,1+r()*2,1+r()*2);}
    g.fillStyle='#8d897f';g.fillRect(0,0,w,1);g.fillRect(0,0,1,h);
  },[1.2,1.2]);
  K.texture('gb_acoustic',128,128,(g,w,h)=>{
    // T-bars are local-axis geometry in the photographed halls, not world-axis UV lines.
    g.fillStyle='#ecebe6';g.fillRect(0,0,w,h);
    g.fillStyle='#dcdbd6';for(let i=0;i<120;i++)g.fillRect((i*47)%w,(i*71)%h,1,1);
  },[0.6,0.6]);
  K.texture('gb_tactile',96,96,(g,w,h)=>{
    g.fillStyle='#d5ae25';g.fillRect(0,0,w,h);g.fillStyle='#edc642';
    for(let x=9;x<w;x+=19)g.fillRect(x,3,6,h-6);
    g.fillStyle='#bb981e';g.fillRect(0,0,w,2);g.fillRect(0,0,2,h);
  },[.3,.3]);
  K.texture('gb_ribbon',128,128,(g,w,h)=>{
    // gb_04/photo02: cream spandrels dominate; the recessed glass is only 22% of a tier.
    g.fillStyle='#e3dfd4';g.fillRect(0,0,w,h);g.fillStyle='#55646a';g.fillRect(0,h*.42,w,h*.22);
    g.fillStyle='#738187';g.fillRect(2,h*.43,w-4,h*.035);g.fillStyle='#d6d2c8';
    for(let i=0;i<8;i++)g.fillRect(i*w/8,h*.42,2,h*.22);
    g.fillStyle='#e3dfd4';g.fillRect(0,h*.4,w*.13,h*.26);
  },[6,4.5],{facade:true});
  const P = K.osmBuilding(309352819)[0].poly;
  const lp = P.map(([x,z])=>toL(x,z));
  function clip(poly,axis,bound,keepGreater) {
    const out=[];
    for(let i=0;i<poly.length;i++){
      const a=poly[i],b=poly[(i+1)%poly.length],ia=keepGreater?a[axis]>=bound:a[axis]<=bound,ib=keepGreater?b[axis]>=bound:b[axis]<=bound;
      if(ia)out.push(a);
      if(ia!==ib){const t=(bound-a[axis])/(b[axis]-a[axis]);out.push([a[0]+t*(b[0]-a[0]),a[1]+t*(b[1]-a[1])]);}
    }return out;
  }
  const strip=(a,b)=>clip(clip(lp,0,a,true),0,b,false).map(q=>W(...q));
  const WEST=strip(-1,75.7),NORTH=strip(75.7,317);
  const NORTH_2F=4.2,NORTH_ROOF=8.4,TAN=0xb88f66;
  const ys=[0,6,11,16,20.5,25,29.5,34,38.5,43];
  const inset=[0,0,4,8,11,14,17,20,23,25];
  // Photos01/08: inclined lower concrete supports, then projecting upper west tiers.
  // Upper ledges advance 1.6m per level; the east/yard terraces retain their setbacks.
  const westInset=[0,0,4,8,6.4,4.8,3.2,1.6,0,-1.6];
  // Upper end faces are straight with two chamfers, wholly inside the OSM ground wall.
  // Retaining its three shallow south-edge segments on every floor made a rounded stack.
  const floorPoly=i=>{
    if(i<2)return WEST;
    const lo=westInset[i],hi=75.7-inset[i],c=Math.max(2.5,18-(inset[i]-4)*.72);
    return [[lo,0],[hi,0],[hi,154],[hi-c,159],[lo+c,159],[lo,154]].map(q=>W(...q));
  };
  const uses=['대합실 · 매표소 · 승차홈','한복 · 혼수 · 커튼 · 홈패션','꽃도매상가 · 생화 · 조화 · 부자재','혼수 · 커튼 · 홈패션','입점 준비 중','의류 도매','의류 도매','의류 도매','고속사 사무실','포석정 · 육즙이흐르는각고기 · 고속터미널성당'];
  const pent=rect(27,42,50,82);
  const elevs=[
    // Walk Zq_230/1780: real opposing doors, with a continuous corridor between
    // the shafts. Registration to the old core is inferred; all floor holes move together.
    {u:42,v:55,top:9,base:-6,name:'중앙 엘리베이터',face:'+u'},
    {u:48.6,v:55,top:9,base:-6,name:'중앙 엘리베이터 2호기',face:'-u'},
    {u:278,v:7,top:2,base:-6,levels:[0,NORTH_2F,NORTH_ROOF],name:'북측 동 엘리베이터',face:'+v'},
    {u:190,v:118,top:1,base:0,name:'주차장 엘리베이터',face:'-u'},
  ];
  const cores=[{u:35,v:48,levels:[-6,...ys]},{u:267,v:2,levels:[-6,0,NORTH_2F,NORTH_ROOF]}];
  const escs=[{u:20,v:61,ya:0,yb:6,len:12},{u:20,v:78,ya:6,yb:11,len:10},
    {u:105,v:4,ya:-6,yb:0,len:12},{u:20.5,v:131,ya:-6,yb:0,len:12}];
  const coreRect=c=>[c.u,c.v,c.u+4.4,c.v+10];
  const excluded=[...cores.map(coreRect),...elevs.map(e=>{
    const [du,dv]=FDIR[e.face];
    return [e.u-1.4+Math.min(0,du*2.2),e.v-1.4+Math.min(0,dv*2.2),e.u+1.4+Math.max(0,du*2.2),e.v+1.4+Math.max(0,dv*2.2)];
  }),...escs.map(e=>[e.u-2,e.v-1,e.u+2,e.v+e.len+1])];
  excluded.push([35.5,8,40.5,20],[272.3,6.8,275.7,24],[206.5,6.8,214.5,24]);
  excluded.push([108.3,3,111.3,17]); // stair beside the B1 escalator, photos 38/41
  const inRect=(r,u,v,m=0)=>u>r[0]-m&&u<r[2]+m&&v>r[1]-m&&v<r[3]+m;
  const blocked=(u,v,m=0)=>excluded.some(r=>inRect(r,u,v,m));
  function holes(poly,y){
    const out=[];
    for(const c of cores)if(y>c.levels[0]&&y<=c.levels.at(-1))out.push(rect(c.u,c.v,c.u+4.4,c.v+8.4));
    for(const e of escs)if(y===e.yb)out.push(rect(e.u-1.8,e.v,e.u+1.8,e.v+e.len));
    if(y===0)out.push(rect(108.45,4,111.15,16),rect(272.3,7,275.7,21),rect(206.5,7,214.5,21));
    if(y===6)out.push(rect(35.5,8,40.5,20));
    if(y===11)out.push(rect(23,78,25,88)); // beige stair beside the flower-market escalator
    // Elevator car supplies its own floor; keep the shaft clear of intervening slabs.
    for(const e of elevs)if(y>=e.base&&y<=(e.levels||ys)[e.top])out.push(rect(e.u-1.1,e.v-1.1,e.u+1.1,e.v+1.1));
    return out.filter(p=>p.every(([x,z])=>K.pointInPoly(x,z,poly)));
  }
  function lights(poly,y,step=9){
    for(let u=5;u<317;u+=step)for(let v=5;v<158;v+=step){const [x,z]=W(u,v);
      if(!K.pointInPoly(x,z,poly)||blocked(u,v,2))continue;
      lbox(u,v,y,.65,.65,.025,0xc8cac5,{solid:false});
      lbox(u,v,y-.015,.6,.6,.025,'emit',{solid:false});
    }
  }
  function columns(poly,y,h,omit=()=>false){
    for(let u=6;u<317;u+=9)for(let v=6;v<155;v+=9){const [x,z]=W(u,v);
      if(!K.pointInPoly(x,z,poly)||blocked(u,v,1.3)||omit(u,v))continue;
      lbox(u,v,y,.8,.8,h,0xe2ded3);lbox(u,v,y,.83,.83,.16,0x302f2b,{solid:false});
    }
  }

  // gb_01/02: two low north-wing storeys; the west main building keeps B1 + ten floors.
  K.slab(P,0,{mat:'gb_terrazzo',under:'gb_acoustic',holes:holes(P,0)});
  for(const h of holes(P,0))K.groundHole(h);
  const lobbyGalleryVoid=rect(67.4,23.5,73.6,37);
  const hallVoids=[rect(56,54,71.4,84),rect(8,14,32,34),rect(24,146,65,156.5),
    ...[30,40].map(u=>Array.from({length:24},(_,k)=>W(u+2.2*Math.cos(k*PI/12),143+2.2*Math.sin(k*PI/12))))];
  for(let i=1;i<ys.length;i++){
    const p=floorPoly(i);K.slab(p,ys[i],{mat:i===2?'concrete':'tile',under:'gb_acoustic',holes:[...holes(p,ys[i]),...(i===1?[...hallVoids,lobbyGalleryVoid]:[])]});
  }
  // The ticket light wells pass through 2F: their white liners also guard the floor opening.
  for(const p of hallVoids.slice(3))K.polyWalls(p,6,7.5,{mat:0xf4f2ee,inner:0xf4f2ee,thick:.06});
  // Zq_100: the gallery-level wood screen is exposed through this lobby void.
  // Keep a 2.1m-wide supported 2F gallery at u73.6..75.7 and guard all four edges.
  K.polyWalls(lobbyGalleryVoid,6,7.25,{mat:0xe8e3d7,thick:.06});
  K.slab(NORTH,NORTH_2F,{mat:'tile',under:'gb_acoustic',holes:holes(NORTH,NORTH_2F)});
  K.slab(NORTH,NORTH_ROOF,{mat:asphalt,under:'gb_acoustic',holes:holes(NORTH,NORTH_ROOF)});
  K.slab(pent,48,{mat:'roofgravel',under:'gb_acoustic'});
  const doors=[];
  const door=(u,v,w=4)=>{const [x,z]=W(u,v);doors.push({x,z,w,y0:0,y1:3.1});};
  for(const v of [16,48,105,151])door(0,v);
  // Photo01: recessed ground arcade between the west-side slanted concrete supports.
  for(let v=25;v<145;v+=5.2)door(-.1,v,3.7);
  for(const u of [26,122,218,259])door(u,0,5);
  door(163,0,6); // gb_03: bright entrance behind the relocated pair of white arches.
  // Photo01: open north-end arcade under the first cantilever; glazing sits 6 m back.
  {const[x,z]=W(38,0);doors.push({x,z,w:70,y0:0,y1:5.7});}
  // Open the entire street arcade; the shop glazing is recessed behind its columns.
  {const[x,z]=W(196.2,0);doors.push({x,z,w:240.8,y0:0,y1:3.35});}
  door(38.5,161,6);door(316.7,18,4);
  // OSM boarding points set the row rhythm; numbering is the researched correspondence, not surveyed.
  const points=K.osm.pois.filter(p=>p.kind==='platform'&&p.ref==='010').map(p=>toL(p.x,p.z));
  const westPts=points.filter(p=>p[0]<90&&p[1]>25).sort((a,b)=>b[1]-a[1]);
  const northPts=points.filter(p=>p[0]>97&&p[1]<40).sort((a,b)=>a[0]-b[0]);
  const bays=[];
  westPts.forEach((p,i)=>bays.push({n:i+1,u:75.7,v:p[1],west:true}));
  northPts.forEach((p,i)=>bays.push({n:i<8?null:i<15?37+i-8:36-(i-15),u:p[0],v:30.2,west:false}));
  const bayDestinations={1:'부산',2:'부산사상',3:'마산',4:'창원',5:'진주',6:'울산 · 통영 · 김해',7:'동대구',9:'포항 · 경주',10:'구미 · 상주',11:'대전',13:'세종',14:'천안',16:'공주 · 아산',18:'조치원 · 금산',19:'속초 · 양양',20:'삼척 · 동해',23:'강릉',24:'제천 · 정선',25:'원주',27:'용인',28:'이천',29:'여주',30:'영월 · 춘천',31:'안동 · 영주',32:'안성',33:'평택',34:'청주',35:'청주',36:'청주'};
  for(const b of bays)b.dest=bayDestinations[b.n]||'';
  for(const b of bays)door(b.u,b.v,b.west?5.6:b.n===null?4:2.5);
  // Continuous boarding-side window wall; the 0.8m cream piers separate screens.
  const windowSpans=[];
  const westScreens=bays.filter(b=>b.west).sort((a,b)=>a.v-b.v);
  for(let k=0;k<westScreens.length-1;k++){
    const v0=westScreens[k].v+3.2,v1=westScreens[k+1].v-3.2;
    if(v1-v0<.25)continue;
    windowSpans.push([v0,v1,westScreens[k]]);
    const[x,z]=W(75.7,(v0+v1)/2);doors.push({x,z,w:v1-v0,y0:0,y1:3});
  }
  // Photo29: an actual glazed waiting bay beside door30, cut into the same envelope.
  const window30=bays.find(b=>b.n===30),window29=bays.find(b=>b.n===29);
  const waitingWindow=[window30.u+1.45,window29.u-1.45];
  {const[x,z]=W((waitingWindow[0]+waitingWindow[1])/2,30.2);doors.push({x,z,w:waitingWindow[1]-waitingWindow[0],y0:.1,y1:3.15});}
  K.polyWalls(P,0,NORTH_2F,{mat:CREAM,inner:0xe4e0d6,thick:.26,openings:doors});
  K.polyWalls(WEST,NORTH_2F,6,{mat:CREAM,inner:0xe4e0d6,thick:.26,openings:doors});
  buildEntryArcade();
  buildNorthArcade();
  for(let v=22.4;v<146;v+=9){
    const q=(u,y,dv)=>{const[x,z]=W(u,v+dv);return[x,y,z];};
    K.quad(CREAM,[q(-.1,0,-.4),q(-.1,0,.4),q(4,6,.4),q(4,6,-.4)],[-A[0],.6,-A[1]]);
    K.quad(0xb8b4aa,[q(-.1,0,.4),q(.7,0,.4),q(4.8,6,.4),q(4,6,.4)],[B[0],0,B[1]]);
    K.quad(CREAM,[q(.7,0,-.4),q(-.1,0,-.4),q(4,6,-.4),q(4.8,6,-.4)],[-B[0],0,-B[1]]);
    K.quad(CREAM,[q(.7,0,.4),q(.7,0,-.4),q(4.8,6,-.4),q(4.8,6,.4)],[A[0],-.6,A[1]]);
  }
  // Photo 05: aluminium-framed double doors and low cyan boards on the INSIDE face.
  // Leaves are static visual glazing, without a collision barrier through the existing openings.
  K.material('gb_door_glass',new K.THREE.MeshLambertMaterial({color:0xffffff,vertexColors:true,transparent:true,opacity:.35,depthWrite:false,side:K.THREE.DoubleSide}));
  const doorGlass={tex:'gb_door_glass',color:0xbed1d5},aluminium=0xaab4b8;
  lwall(waitingWindow[0],30.13,waitingWindow[1],30.13,.1,3.15,{mat:doorGlass,thick:.035});
  for(let u=waitingWindow[0];u<=waitingWindow[1];u+=.85)lbox(u,30.08,.1,.065,.08,3.05,0x8f979a,{solid:false});
  for(const y of [.1,1.08,2.25,3.12])lbox((waitingWindow[0]+waitingWindow[1])/2,30.08,y,waitingWindow[1]-waitingWindow[0],.08,.06,0x8f979a,{solid:false});
  for(const [i,[v0,v1,bay]] of windowSpans.entries()){
    if(v0<56&&v1>44)continue;
    const frame=v0>80?0x2e3336:0x8f979a;
    lwall(75.58,v0,75.58,v1,0,3,{mat:v0>80?{tex:'gb_door_glass',color:0x2c3a40}:doorGlass,thick:.04});
    for(let v=v0;v<=v1;v+=1.2)lbox(75.52,v,0,.08,.06,3,frame,{solid:false});
    lbox(75.52,v1,0,.08,.06,3,frame,{solid:false});
    for(const y of [.04,1.05,2.2,2.96])lbox(75.52,(v0+v1)/2,y,.08,v1-v0,.06,frame,{solid:false});
    lsign(bay.dest||'승차홈',75.45,v0-.4,3.28,.6,.25,'-u',{bg:'#f5f3eb',fg:'#3c4547'});
    if(i%3===1){
      lbox(75.15,(v0+v1)/2,3.2,.12,1.2,.7,0x111111,{solid:false});
      lsign('출발 안내',75.07,(v0+v1)/2,3.54,1.1,.5,'-u',{bg:'#152635',fg:'#d7e5ea'});
    }
  }
  for(const b of bays){
    const face=b.west?'-u':'-v';
    const dw=b.n===null?3.8:2.4;
    const doorPart=(t,y,w,h,d,mat,offset=0)=>lbox(b.u+(b.west?offset:t),b.v+(b.west?t:offset),y,b.west?d:w,b.west?w:d,h,mat,{solid:false});
    if(!b.west&&b.n!==null){
    for(const t of [-dw/2,0,dw/2])doorPart(t,.04,.055,2.55,.12,aluminium);
    for(const y of [.04,1.06,2.53])doorPart(0,y,dw,.055,.12,aluminium);
    for(const s of [-1,1]){
      const c=s*dw/4,hw=(dw/2-.09)/2;
      const pane=(t,y)=>{const[x,z]=W(b.u+(b.west?0:t),b.v+(b.west?t:0));return[x,y,z];};
      K.quad(doorGlass,[pane(c-hw,.1),pane(c+hw,.1),pane(c+hw,2.49),pane(c-hw,2.49)],b.west?[-A[0],0,-A[1]]:[-B[0],0,-B[1]]);
      doorPart(s*.12,.92,.035,.42,.06,0x727e83,-.09);
    }
    }
    const dest=b.dest;
    b.dest=dest;
    // Explicit inside and yard faces keep both number squares on the readable left edge.
    // Outdoor plates remain per bay; the interior has the paired boards in photo 05.
    for(const inside of [false]){
      const f=inside?face:b.west?'+u':'+v',sgn=inside?1:-1;
      const inset=inside?.63:.23;
      const su=b.u-(b.west?sgn*inset:0),sv=b.v-(b.west?0:sgn*inset);
      lbox(su,sv,2.57,b.west?.12:3.28,b.west?3.28:.12,.62,0x485962,{solid:false});
      const bu=su+(b.west?-sgn*.08:0),bv=sv+(b.west?0:-sgn*.08);
      const plainArrival=b.n===null&&[109.87,116.92].some(u=>Math.abs(b.u-u)<.5);
      lsign('',bu,bv,2.88,3.2,.6,f,{bg:plainArrival?'#4a4d50':'#38b6e8',fg:'#fff'});
      if(!plainArrival)lsign(b.n===null?'하차장':dest||'승차홈',bu+(b.west?0:-sgn*.28),bv+(b.west?sgn*.28:0),2.88,b.n===null?2.9:2.47,.46,f,{bg:null,fg:'#fff',padding:.02,offset:.025});
      if(b.n!==null)lsign(String(b.n),bu+(b.west?0:sgn*1.28),bv+(b.west?-sgn*1.28:0),2.88,.43,.43,f,{bg:'#f3df26',fg:'#174563',padding:.04,offset:.03});
    }
    if(b.n!==null)lzone(`승차홈 ${b.n}번`,'1F',dest,b.u-(b.west?6:2),b.v-(b.west?2:6),b.u+(b.west?5:2),b.v+(b.west?2:5),0,5,5);
  }
  K.polyWalls(NORTH,NORTH_2F,NORTH_ROOF,{mat:TAN,inner:CREAM,thick:.25,openings:[
    {x:W(196.2,0)[0],z:W(196.2,0)[1],w:240.8,y0:NORTH_2F,y1:7.5},
    {x:W(173,30.05)[0],z:W(173,30.05)[1],w:5,y0:NORTH_2F,y1:8.15}
  ]});
  // Photos01/08: inclined panels and struts belong only on the west road facade.
  // Photo02: the east yard facade is vertical glazing beneath white parapets.
  for(let i=1;i<9;i++){
    const y=ys[i],top=ys[i+1],low=inset[i],hi=inset[i+1],p=floorPoly(i+1);
    K.polyWalls(p,y,top,{mat:'gb_ribbon',inner:CREAM,thick:.22,floorH:top-y,
      openings:[{edge:5,at:77,w:154,y0:y,y1:top}]});
    {
      const a=westInset[i],b=westInset[i+1],n=A.map(v=>-v);
      lwall(Math.max(a,b)+.12,0,Math.max(a,b)+.12,154,y,top,{mat:CREAM,thick:.2});
      const at=(t,v)=>{const [x,z]=W(a+(b-a)*t,v);return[x,y+(top-y)*t,z];};
      K.quad(CREAM,[at(0,0),at(0,154),at(1,154),at(1,0)],[n[0],.2,n[1]]);
      // Small windows and short upper groups; cream piers remain between every group.
      for(let v=5;v<152;v+=5.2){
        const ta=.42,tb=ta+.9/(top-y),w=i<4?1.8:3.8;
        const pts=[at(ta,v-w/2),at(ta,v+w/2),at(tb,v+w/2),at(tb,v-w/2)].map(q=>[q[0]+n[0]*.025,q[1],q[2]+n[1]*.025]);
        K.quad(0x55646a,pts,[n[0],.2,n[1]]);
        const mid=at((ta+tb)/2,v);K.box({x:mid[0]+n[0]*.05,z:mid[2]+n[1]*.05,y:mid[1]-.035,w:.08,d:w,h:.07,rotY:ROT,mat:0x777c78,solid:false});
      }
      for(let v=1.4;v<153;v+=5.2){
        const q=[at(0,v-.35),at(0,v+.35),at(1,v+.35),at(1,v-.35)].map(p=>[p[0]+n[0]*.3,p[1],p[2]+n[1]*.3]);
        K.quad(0xf0ece1,q,[n[0],.2,n[1]]);
        // Narrow side faces make the struts read as concrete, including at an oblique view.
        K.quad(0xb8b5ab,[at(0,v+.35),q[1],q[2],at(1,v+.35)],[B[0],0,B[1]]);
      }
      lbox(a-.35,77,y-.5,1.3,154,1.2,CREAM,{solid:false});
    }
    const eu=75.7-hi;
    lbox(eu+.2,77,top-1.25,1.2,154,1.25,0xe8e4da,{solid:false});
    const glassY=y+(top-y)*.39;
    // Short window groups, divided by broad cream piers, avoid an uninterrupted black ribbon.
    for(let v=3;v<152;v+=6){
      lbox(eu+.025,v,glassY,.08,5.1,.9,0x55646a,{solid:false});
      for(const dv of [-1.7,0,1.7])lbox(eu+.085,v+dv,glassY,.09,.065,.9,0xd6d2c8,{solid:false});
    }
    lbox(75.7-low+.25,77,y-.3,1.2,154,.45,CREAM,{solid:false});
    // Photos03/07: straight end parapets, recessed glazing and brown upper slab edges.
    const ns=K.orient(p);
    for(let e=0;e<p.length;e++){
      const a=p[e],b=p[(e+1)%p.length];
      if(toL(...a)[1]<153.9||toL(...b)[1]<153.9)continue;
      const n=ns[e],ax=a[0]+n[0]*.24,az=a[1]+n[1]*.24,bx=b[0]+n[0]*.24,bz=b[1]+n[1]*.24;
      K.wall(ax,az,bx,bz,top-1.15,top,{mat:0xe8e4da,thick:.48,solid:false});
      K.wall(a[0]+n[0]*.025,a[1]+n[1]*.025,b[0]+n[0]*.025,b[1]+n[1]*.025,top-2.15,top-1.25,{mat:0x55646a,thick:.025,solid:false});
      const len=Math.hypot(bx-ax,bz-az);
      for(let d=.8;d<len;d+=2){const t=d/len;K.box({x:ax+(bx-ax)*t-n[0]*.17,z:az+(bz-az)*t-n[1]*.17,y:top-2.15,w:.065,d:.065,h:.9,mat:0xd6d2c8,solid:false});}
      if(i>=6)K.wall(ax+n[0]*.4,az+n[1]*.4,bx+n[0]*.4,bz+n[1]*.4,top-.8,top,{mat:0x7a4a3c,thick:.8,solid:false});
    }
  }
  K.polyWalls(floorPoly(9),43,44,{mat:CREAM,thick:.2});
  const pd=W(38,82);
  K.polyWalls(pent,43,48,{mat:CREAM,thick:.2,openings:[{x:pd[0],z:pd[1],w:3,y0:43,y1:46}]});
  // Applied south facade must be outside the OSM end at v161.28; the former v159 skin was hidden.
  const q=(u,y,v=161.65)=>{const[x,z]=W(u,v);return[x,y,z];};
  K.quad(0xb97a62,[q(17.5,0),q(57.5,0),q(37.5,46),q(37.5,46)],[B[0],0,B[1]]);
  for(const u of [17.5,57.5])K.quad(0xa96b56,[q(u,0),q(u,0,158.8),q(37.5,46,158.8),q(37.5,46)],[u<37.5?-A[0]:A[0],0,u<37.5?-A[1]:A[1]]);
  lbox(30,164.6,0,8,4,44,0xe8e4da,{solid:false});
  for(let y=3;y<44;y+=2)lbox(30,166.615,y,7.95,.025,.035,0xcecabe,{solid:false});
  [...'서울고속버스터미널'].forEach((c,i)=>lsign(c,30,166.67,37.7-i*3.18,3.3,3.2,'+v',{bg:null,fg:'#1f6fc0',padding:0}));
  lsign(['의류도매상가','678층'],30,166.67,9.2,7.5,2.3,'+v',{bg:'#e8e4da',fg:'#1f6fc0',padding:.02});
  aoLogo(30,166.7,41.8,3,'+v');
  // Narrow dark stair glazing and its blue fan-shaped head, visible to the tower's left in 03.
  lbox(24.6,164.6,0,2.6,3.8,40,0x24383c,{solid:false});
  for(let y=1;y<40;y+=2.3)lbox(24.6,166.54,y,2.65,.06,.07,0xc6c5bc,{solid:false});
  const fan=(a,r)=>q(24.6+Math.cos(a)*r,40+Math.sin(a)*r,166.57);
  for(let i=0;i<10;i++){
    const a=i*PI/10,b=(i+1)*PI/10;
    K.quad(0x244d78,[q(24.6,40,166.57),fan(a,2.4),fan(b,2.4),fan(b,2.4)],[B[0],0,B[1]]);
    K.quad(0xd5d6cc,[fan(a,0),fan(a,2.4),fan(a+.018,2.4),fan(a+.018,0)],[B[0],0,B[1]]);
  }
  for(const[t,i,y]of [['생화·조화 꽃 도매상가 3F',3,15.4],['혼수·커텐·홈패션 2·4F',2,10.45]]){
    const p=floorPoly(i),a=p[2],b=p[3],n=K.orient(p)[2],w=Math.hypot(b[0]-a[0],b[1]-a[1])-1;
    K.sign(t,{x:(a[0]+b[0])/2+n[0]*.52,z:(a[1]+b[1])/2+n[1]*.52,y,w,h:1.15,rotY:Math.atan2(n[0],n[1]),bg:'#e8e4da',fg:'#1f6fc0',padding:0});
  }
  lbox(38,153.4,44,15,11,4,0xa5a7a4,{solid:false});
  // gb_04/photo02: one heavy maroon roof-garden edge, not stacked brown pinstripes.
  lbox(52.4,77,40.4,1.6,150,1.9,0x6b2f2a,{solid:false});
  lbox(westInset[9]-.35,77,40.4,1.6,154,1.9,0x7a3a2c,{solid:false});
  for(let v=3;v<152;v+=1.6)lbox(52.15,v,42.3,.9,.9,.8,0x3f5a35,{solid:false});
  for(const v of [18,49,111,143]){const[x,z]=W(51.7,v);K.tree(x,z,{y:42.3,h:2.8,kind:'zelkova'});}
  // Letter pitch and spelling follow the yard photograph. This English line is on the real sign.
  lbox(51.1,77,42.3,.65,150,4.9,0xe8e4da,{solid:false});
  [...'서울고속버스터미날'].forEach((c,i)=>lsign(c,51.48,100-i*4.6,45.6,3,3,'+u',{bg:null,fg:'#2a5fa8',padding:0}));
  lsign('SEOUL EXPRESS BUS TERMINAL',51.49,81.6,43.65,39.8,.9,'+u',{bg:null,fg:'#2a5fa8',padding:0});
  aoLogo(51.51,105.5,45.6,3,'+u');
  // One continuous line below the garden band, using the photographed wording.
  lbox(52.95,77,35.4,.4,150,2.1,0xe8e4da,{solid:false});
  const floorBand=[['생화조화 3층꽃상가',132,26],['2층 4층혼수·커텐·홈패션',102,33],['6.7.8층 의류 도매상가',68,33],['아동 신사 숙녀복 기타',37.5,27],['B1한가람문고',17,13]];
  for(const[t,v,w]of floorBand)lsign(t,53.22,v,36.4,w,1.5,'+u',{bg:null,fg:'#2a5fa8',padding:0});
  // Photo01's west-side LED running text stays on the outside of the revised projecting tiers.
  lbox(.6,78,34.8,.22,82,1.45,0x252d2a,{solid:false});
  for(const[t,v,w,fg]of [['3층 꽃상가',48,20,'#76ed72'],['6.7.8층 의류 도매상가',75,33,'#ff5946'],['아동 신사 숙녀복 B1 한가람문고',106,30,'#76ed72']])lsign(t,.46,v,35.52,w,1.25,'-u',{bg:null,fg,padding:0});
  lbox(3.1,78,28.6,.24,108,1.1,0xe8e4da,{solid:false});
  lsign('생화·조화 꽃상가   혼수·커텐·홈패션   B1 한가람문고',2.95,78,29.15,100,1,'-u',{bg:null,fg:'#1f6fc0',padding:0});
  lbox(37,58,48,10,10,3,0x9b9d98,{solid:false});
  buildNorthEnd();

  function aoLogo(u,v,y,size,face){
    // Photographed AO mark (03/07 and02), a red ring joined to the open triangular A.
    const t=face==='+v'?[1,0]:[0,-1],n=face==='+v'?B:A,s=size/3;
    const p=(x,h)=>{const[xw,zw]=W(u+t[0]*x*s,v+t[1]*x*s);return[xw,y+h*s,zw];};
    const stroke=(ax,ay,bx,by,w)=>{const d=Math.hypot(bx-ax,by-ay),nx=-(by-ay)/d*w/2,ny=(bx-ax)/d*w/2;K.quad(0xd0302a,[p(ax+nx,ay+ny),p(bx+nx,by+ny),p(bx-nx,by-ny),p(ax-nx,ay-ny)],[n[0],0,n[1]]);};
    for(let i=0;i<28;i++){const a=i*2*PI/28,b=(i+1)*2*PI/28;K.quad(0xd0302a,[p(.55+Math.cos(a)*.95,Math.sin(a)*.95),p(.55+Math.cos(b)*.95,Math.sin(b)*.95),p(.55+Math.cos(b)*.63,Math.sin(b)*.63),p(.55+Math.cos(a)*.63,Math.sin(a)*.63)],[n[0],0,n[1]]);}
    stroke(-1.45,-1,-.65,1,.3);stroke(-.65,1,.1,-1,.3);stroke(-1.1,-.1,-.3,-.1,.24);
  }

  function buildNorthEnd(){
    // gb_04 is taken north of the complex: the south-only treatment in round 2
    // could never be seen here. This skin faces the actual Sinbanpo-ro forecourt.
    const p=(u,y,v=-.65)=>{const[x,z]=W(u,v);return[x,y,z];};
    K.texture('gb_salmon_brick',256,128,(g,w,h)=>{
      g.fillStyle='#bc8775';g.fillRect(0,0,w,h);
      for(let j=0;j<16;j++){
        g.fillStyle=j%3?'#b27d6c':'#c18f7c';g.fillRect(0,j*8,w,7);
        g.fillStyle='#d0a18b';g.fillRect(0,j*8,w,1);
        for(let x=(j%2)*16;x<w;x+=32)g.fillRect(x,j*8,1,8);
      }
    },[3.2,1.6]);
    // Asymmetric sloping salmon end, with its vertical edge beside the sign tower.
    K.quad('gb_salmon_brick',[p(28.1,0),p(68,0),p(28.1,45),p(28.1,45)],[-B[0],0,-B[1]],[[0,28],[13,28],[0,0],[0,0]]);
    K.quad(0xa97765,[p(28.1,0,-.65),p(28.1,0,1),p(28.1,45,1),p(28.1,45,-.65)],[-A[0],0,-A[1]]);
    lbox(23.6,-1.7,0,5.8,3,44.6,0xe8e4da,{solid:false});
    // Thin dark stair glazing flanks the white tower, as visible beside the brick slope.
    lbox(27.3,-1.72,0,1.5,3.02,42.4,0x3b4b4a,{solid:false});
    for(let y=1;y<44;y+=2.1){
      lbox(23.6,-3.22,y,5.8,.035,.045,0xcac8bd,{solid:false});
      if(y<42.4)lbox(27.3,-3.25,y,1.5,.04,.07,0xb8beb6,{solid:false});
    }
    const fan=(a,r)=>p(27.3+Math.cos(a)*r,42.4+Math.sin(a)*r,-3.31);
    for(let i=0;i<10;i++){
      const a=i*PI/10,b=(i+1)*PI/10;
      K.quad(0x244d78,[p(27.3,42.4,-3.31),fan(a,2.4),fan(b,2.4),fan(b,2.4)],[-B[0],0,-B[1]]);
      K.quad(0xd5d6cc,[fan(a,0),fan(a,2.4),fan(a+.018,2.4),fan(a+.018,0)],[-B[0],0,-B[1]]);
    }
    [...'서울고속버스터미널'].forEach((c,i)=>lsign(c,23.6,-3.27,39.6-i*3.15,2.6,2.9,'-v',{bg:null,fg:'#3d6e72',padding:0}));
    for(let i=1;i<9;i++){
      const lo=westInset[i+1],hi=75.7-inset[i+1],y=ys[i+1];
      lbox((lo+hi)/2,.1,y-1.25,hi-lo+.8,1.2,1.25,CREAM,{solid:false});
    }
    lbox(25.9,-.85,40.4,54.8,1.6,1.9,0x6b2f2a,{solid:false});
    for(let u=1;u<52;u+=1.6){
      if(u>20&&u<30)continue; // do not plant through the stair/sign tower
      lbox(u,-.55,42.3,.9,.9,.8,0x3f5a35,{solid:false});
    }
    // gb_04's near-square display faces NE; its changing creative remains an unlettered light field.
    const rot=ROT+PI*.75,[cx,cz]=W(46,10),c=Math.cos(rot),s=Math.sin(rot);
    const screenPart=(x,z,y,w,d,h,mat)=>K.box({x:cx+x*c+z*s,z:cz-x*s+z*c,y,w,d,h,rotY:rot,mat,solid:false});
    for(const x of [-5,5])for(const z of [-1,.3])screenPart(x,z,43,.25,.25,4.2,0x555d5c);
    screenPart(0,0,47,12,.55,10,0xe8e6e0);
    screenPart(0,.295,47.3,11.4,.025,9.4,{tex:'emit',color:0x36c8df});
    screenPart(-2,.32,47.7,2.2,.025,8.5,{tex:'emit',color:0x73dbe5});
    screenPart(2.9,.325,48.4,3,.025,5.7,{tex:'emit',color:0x2992bf});
    lbox(39.8,13,47,6,3,8,0xe8e6e0,{solid:false});
  }

  function buildNorthArcade(){
    // gb_01/02: tan horizontal spandrels with TWO shaded, continuous arcades.
    const entries=[80,122,163,218,259];
    for(const y of [0,NORTH_2F]){
      const levelEntries=entries.filter(u=>y===0||u!==163);
      const ops=levelEntries.map(u=>({at:u-76,w:u===163?6:5,y0:y,y1:y+3.05}));
      ops.push({at:268.5-76,w:8,y0:y,y1:y+3.3}); // preserve the north stair flights
      lwall(76,3.7,316.5,3.7,y,y+3.3,{mat:0x827b6c,thick:.12,openings:ops});
      for(let u=79;u<314;u+=6){
        if(levelEntries.some(e=>Math.abs(e-u)<4)||u>264&&u<282)continue;
        lbox(u,3.61,y+.25,4.75,.035,2.55,0x34413e,{solid:false});
        for(const du of [-2.38,0,2.38])lbox(u+du,3.55,y+.15,.065,.07,2.8,0xafa995,{solid:false});
        lbox(u,3.57,y+.96,4.75,.05,.055,0x969e94,{solid:false});
      }
      for(let u=76.2;u<317;u+=6){
        if(y===0&&u>160&&u<166)continue; // 6 m clear ground-floor entrance at the rear arch.
        lbox(u,.35,y,.4,.5,3.3,TAN);
        lbox(u,.35,y+.03,.46,.56,.18,0x9a7656,{solid:false});
      }
      lbox(196.2,1.65,y+3.23,240.8,4,.12,0x6f6859,{solid:false});
      lbox(196.2,-.01,y+3.35,240.8,.34,.85,TAN,{solid:false});
      lbox(196.2,-.2,y+3.39,240.8,.05,.07,0xd1c2a4,{solid:false});
    }
    // Waist-high open balcony rail, backed by dark shop fronts, not a ribbon-glass block.
    for(const y of [NORTH_2F+.13,NORTH_2F+1.05])lbox(196.2,-.1,y,240.8,.065,.065,0xaaa38c,{solid:false});
    for(let u=76.2;u<317;u+=1.2)lbox(u,-.1,NORTH_2F+.13,.045,.065,.92,0xaaa38c,{solid:false});
    for(const [u,t,w,fg]of [[80,'서울고속버스터미널',7,'#ece8d7'],[122,'서울고속버스터미널',9,'#ece8d7'],[137,'버거킹',4,'#b23e31'],[201,'이마트24',4,'#f0d95e'],[259,'서울고속버스터미널',9,'#ece8d7']])
      lsign(t,u,3.38,3.02,w,.45,'-v',{bg:'#494b3f',fg,padding:.02});
    // Tiny, unlettered tenant fascias where the roadview cannot resolve a shop name.
    for(const u of [90,108,181,289,307])lsign('',u,-.22,7.82,3.5,.3,'-v',{bg:u%3?'#b7a581':'#a26950'});
    // gb_01/02 show small red shop marks, but the lettering cannot be resolved.
    for(const u of [157,233])lsign('',u,-.22,7.6,2.5,.5,'-v',{bg:'#c8352b',fg:'#c8352b'});
    lbox(196.2,-.05,8.4,241,.4,.4,TAN,{solid:false});
    // Lift and stair overrun remain set back; there is no invented third-storey hall.
    K.polyWalls(rect(265.8,1.2,280,12.4),8.4,11,{mat:TAN,thick:.16,openings:[
      {x:W(273,12.4)[0],z:W(273,12.4)[1],w:11,y0:8.4,y1:11}
    ]});
    K.slab(rect(265.8,1.2,280,12.4),11,{mat:'roofgravel',walk:false,under:'gb_acoustic'});
  }

  function buildEntryArcade(){
    K.texture('gb_salmon_tile',128,128,(g,w,h)=>{
      g.fillStyle='#c48a6e';g.fillRect(0,0,w,h);g.fillStyle='#ae7962';g.fillRect(0,0,w,2);g.fillRect(0,0,2,h);
    },[.6,.6]);
    // Official #35 remains in place. The walk's portal is BESIDE its north wall,
    // opening onto the clear u66..75.7 hall, not through the UNIQLO stock room.
    const entries=[16,38,60,70];
    lwall(3,6,73,6,0,3.5,{mat:'glass',thick:.045,openings:entries.map(at=>({at:at-3,w:4,y0:0,y1:3.5}))});
    lwall(3,6.08,64,6.08,3.5,5.7,{mat:'gb_salmon_tile',thick:.16});
    lwall(64,6.08,73,6.08,3.5,5.7,{mat:'glass',thick:.045});
    for(let u=4;u<73;u+=2){if(entries.some(e=>Math.abs(u-e)<1.9))continue;lbox(u,5.98,0,.065,.1,3.5,0xaab4b8,{solid:false});}
    for(let u=7;u<72;u+=6){
      if(u>=64)continue;
      lbox(u,5.94,4.1,1.1,.1,1.1,0xaab4b8,{solid:false});lbox(u,5.87,4.15,1,.03,1,DARK,{solid:false});
    }
    for(const u of entries){
      for(const dx of [-2,0,2])lbox(u+dx,5.92,0,.07,.12,3.5,0xaab4b8,{solid:false});
      lbox(u,5.92,3.43,4,.12,.07,0xaab4b8,{solid:false});
      for(const s of [-1,1]){
        lbox(u+s,5.96,.08,1.91,.035,3.3,'glass',{solid:false});
        lbox(u+s*.14,5.82,1.1,.04,.06,.6,0xaab4b8,{solid:false});
      }
      lsign('서울고속버스터미널 경부선',u,5.78,3.85,u===70?4:6,u===70?.24:.5,'-v',{bg:u===70?null:'#286ca1',fg:'#fff',padding:.02});
    }
    // Four-sided slanted white supports, at 6m spacing, land on the open plaza.
    for(let u=9;u<72;u+=6){
      if(u===69)continue; // Zq_80: open door bay beside the UNIQLO pier.
      // Zq_80: the single pale support is between the UNIQLO pier and the
      // slatted wall. Its head leans toward the plaza, opposite the older bays.
      const p=(du,v,y)=>{const[x,z]=W((u===63?65.55:u)+du,u===63?5.55-v:v);return[x,y,z];};
      K.quad(0xe8e4da,[p(-.45,-.4,0),p(.45,-.4,0),p(.45,5.2,5.7),p(-.45,5.2,5.7)],[-B[0],.7,-B[1]]);
      K.quad(0xbab8ae,[p(.45,-.4,0),p(.45,.35,0),p(.45,5.95,5.7),p(.45,5.2,5.7)],[A[0],0,A[1]]);
      K.quad(0xe8e4da,[p(-.45,.35,0),p(-.45,-.4,0),p(-.45,5.2,5.7),p(-.45,5.95,5.7)],[-A[0],0,-A[1]]);
      K.quad(0xe8e4da,[p(-.45,.35,0),p(.45,.35,0),p(.45,5.95,5.7),p(-.45,5.95,5.7)],[B[0],-.7,B[1]]);
      lbox(u===63?65.55:u,u===63?5.55:0,0,1,.9,.15,0xd3d0c4,{solid:false});
    }
    K.hpoly(0xe8e4da,rect(3,0,64,6),5.7,false);
    K.hpoly(0x45494c,rect(64,0,73,6),5.62,false);
    lbox(68.5,-.025,5.05,9,.12,.65,0x45494c,{solid:false});
    lbox(68.5,-.53,5.72,9,.08,.55,0x45494c,{solid:false});
    lbox(66.85,5.8,0,1.25,.3,5.7,0x45494c,{solid:false});
    // Zq_60/80 has an unobstructed portal; retain the fourth tree at the plaza edge.
    for(const u of [8,16,48,59]){const[x,z]=W(u,-4);K.tree(x,z,{h:5.4,kind:'pine'});}
    // Photo01 green-roof entrance kiosk. Requested (35,-60) is inside the OSM wall;
    // use the adjacent plaza at W(36,-11)≈(32,-82), behind the entrance spawn's sightline.
    lbox(36,-11,0,6,3.5,.35,0xb9b7ab,{solid:false});
    for(const u of [33.2,38.8])for(const v of [-12.5,-9.5])lbox(u,v,.35,.12,.12,2.2,0x7c8b80,{solid:false});
    lbox(36,-11,2.55,6.5,4,.18,0x4f6652,{solid:false});
    lbox(36,-11,2.73,6.2,3.8,.12,0x6a8062,{solid:false});
    lsign('고속터미널역',36,-13.05,2.47,4,.3,'-v',{bg:'#35483b',fg:'#eee9d9'});
  }

  // Walking access on every actual floor: two flights with a full-width intermediate landing.
  for(const c of cores){
    for(let i=0;i<c.levels.length-1;i++){
      const y=c.levels[i],t=c.levels[i+1],mid=(y+t)/2;
      lstairs(c.u+1.1,c.v+8.4,c.u+1.1,c.v+1.6,{ya:y,yb:mid,w:1.85,mat:'concrete'});
      K.slab(rect(c.u+.1,c.v+.1,c.u+4.3,c.v+1.6),mid,{mat:'concrete',thick:.18});
      lstairs(c.u+3.3,c.v+1.6,c.u+3.3,c.v+8.4,{ya:mid,yb:t,w:1.85,mat:'concrete'});
    }
    // The only views down through the ground floor are guarded circulation wells.
    for(const y of c.levels.slice(1)){
      for(const u of [c.u,c.u+4.4])lwall(u,c.v,u,c.v+8.4,y,y+1.05,{mat:doorGlass,thick:.06});
      lwall(c.u,c.v,c.u+4.4,c.v,y,y+1.05,{mat:doorGlass,thick:.06});
      for(const u of [c.u,c.u+4.4])lbox(u,c.v+4.2,y+1.02,.07,8.4,.06,0x8c9290,{solid:false});
    }
    for(const y of c.levels){lsign('계단',c.u+2.2,c.v+10.1,y+2.6,1.3,.35,'+v',{bg:'#32634a',fg:'#fff'});}
  }
  for(const e of elevs){
    const floors=(e.base<0?[{label:'지하 1층',y:-6,name:'지하상가 · 다이소'}]:[])
      .concat((e.levels||ys).slice(0,e.top+1).map((y,i)=>({label:e.levels&&i===2?'옥상':`${i+1}층`,y,name:e.u>180&&i===e.top?'주차장':uses[i]})));
    lelev(e.name,e.u,e.v,e.face,floors,e.levels?{topH:2.6}:{});
  }
  for(const e of escs){
    lesc(e.u-.85,e.v,e.u-.85,e.v+e.len,{ya:e.ya,yb:e.yb,w:1.1});
    lesc(e.u+.85,e.v,e.u+.85,e.v+e.len,{ya:e.ya,yb:e.yb,w:1.1,dir:'down'});
    lwall(e.u-1.8,e.v,e.u+1.8,e.v,e.yb,e.yb+1,{mat:0x90948e,thick:.08});
    if(e.yb!==11)lsign(e.yb===0?'매표소 · 승차홈':'2층 · 꽃상가 ↑',e.u,e.v-.3,e.ya+2.82,e.yb===0?2.8:3.3,.36,'-v',{bg:e.yb===0?'#2863a2':'#225a4a',fg:'#fff'});
  }
  buildHall();buildBasement();buildUpper();buildYards();buildWalk13();buildWalk15Public();buildWalk17Interiors();
  lspawn('경부선 터미널 정문',163,-16,0,0,1);
  lspawn('1층 대합실',70.5,89,0,0,-1);
  lspawn('1층 매표·환불',27,145,0,1,0);
  lspawn('1층 무인발권기',20,23,0,0,-1);
  lspawn('1층 할리스 아래 통로',68,68,0,0,-1);
  lspawn('승차홈과 버스 마당',77.2,98,0,0,-1);
  lspawn('3층 꽃도매상가',35,100,11,0,1);
  lspawn('3층 생화 통로',58.7,74,11,0,-1);
  lspawn('지하 1층 다이소 1번 출입구',271.4,5.8,-6,0,1);
  lspawn('다이소 긴 매장 · 2구역',230,24,-6,-1,0);
  lspawn('다이소 고투몰 쪽 4번 출입구',148,3,-6,0,1);
  lspawn('경부선 주차장',174,110,6,0,-1);
  lspawn('10층 성당 · 옥상정원',38,85,43,0,1);
  lspawn('북측 동 옥상 주차장',138,18,NORTH_ROOF,1,0);

  function buildHall(){
    function kiosk(u,v,face='+v'){
      const f=FDIR[face],rot=face==='+v'?0:face==='-v'?PI:face==='+u'?PI/2:-PI/2,at=(d)=>[u+f[0]*d,v+f[1]*d];
      lbox(u,v,0,.64,.55,.09,0x393d3e,{rot});lbox(u,v,.09,.56,.48,1.69,0xeeefec,{rot});lbox(...at(.252),.91,.49,.035,.69,0xe9eaea,{rot,solid:false});
      lsign('',...at(.28),1.25,.42,.55,face,{bg:'#cfe7f7'});lsign('버스승차권 발매기',...at(.29),1.68,.49,.06,face,{bg:null,fg:'#383e40',padding:.01,pxPerM:250});
      for(let k=0;k<3;k++)lsign('',...at(.29),1.43-k*.16,.33,.1,face,{bg:k===1?'#85b6dc':'#e8f3f7'});
      lbox(...at(.27),.73,.4,.035,.12,0x4a4f50,{rot,solid:false});lbox(...at(.27),.4,.3,.035,.055,0x424a4a,{rot,solid:false});lsign('Tmoney',...at(.29),.21,.3,.08,face,{bg:null,fg:'#8f5c49',pxPerM:200});
    }
    const detail = [];
    const furnish = fn => detail.push(fn);
    K.zone({name:'서울고속버스터미널',floor:'1F',sub:'매표소 · 대합실 · 경부·영동선 승차홈',poly:P,y0:0,y1:6,priority:1});
    // Round 6, gb_hall 01/02/10/16: small stone strips, shop units and a window-side aisle.
    K.texture('gb5_hallstone',256,256,(g,w,h)=>{
      const r=K.rand(521),col=['#b8b5ae','#aaa9a2','#c4c1b9','#a6a79f','#b9b9b0'];
      g.fillStyle='#d0cdc5';g.fillRect(0,0,w,h);
      for(let row=0;row<8;row++)for(let c=-1;c<3;c++){
        const x=c*128+(row%2)*64,y=row*32;g.fillStyle=col[Math.floor(r()*col.length)];g.fillRect(x+1,y+1,126,30);
        for(let k=0;k<22;k++){g.fillStyle=k%2?'rgba(255,255,243,.10)':'rgba(65,67,60,.08)';g.fillRect(x+r()*128,y+2+r()*27,8+r()*55,.5+r()*2);}
      }
    },[1.2,1.2]);
    K.texture('gb5_ticket_tile',128,128,(g,w,h)=>{g.fillStyle='#eceae4';g.fillRect(0,0,w,h);g.fillStyle='#c7c5bf';g.fillRect(0,0,w,1);g.fillRect(0,0,1,h);},[1.2,1.2]);
    K.texture('gb5_arrivalbrick',128,128,(g,w,h)=>{g.fillStyle='#b1aa98';g.fillRect(0,0,w,h);for(let y=0;y<h;y+=16)for(let x=-32;x<w;x+=64){g.fillStyle=['#c1af8d','#b9a585','#c9b696'][(y/16+Math.floor((x+32)/64))%3];g.fillRect(x+(y%32?32:0)+1,y+1,62,14);}},[.48,.48]);
    K.texture('gb8_foliage',128,128,(g,w,h)=>{
      const r=K.rand(828);g.fillStyle='#294332';g.fillRect(0,0,w,h);
      for(let i=0;i<350;i++){g.fillStyle=['#55734b','#3e6242','#6b8052','#233f31'][i%4];g.beginPath();g.ellipse(r()*w,r()*h,2+r()*4,1+r()*2,r()*PI,0,PI*2);g.fill();}
    },[.65,.65]);
    K.texture('gb6_countertile',96,96,(g,w,h)=>{g.fillStyle='#f0f0e9';g.fillRect(0,0,w,h);g.fillStyle='#bfc2bd';for(let k=0;k<96;k+=24){g.fillRect(k,0,1,h);g.fillRect(0,k,w,1);}},[.8,.8]);
    const hallWest=clip(WEST.map(p=>toL(...p)),1,6,true).map(p=>W(...p));
    K.hpoly('gb5_hallstone',hallWest,.009,true,holes(hallWest,0));K.hpoly('gb5_hallstone',NORTH,.009,true,holes(NORTH,0));
    const ticketRect=[24,137,65,156.5],trussRect=[8,14,32,34],seatsRect=[8,108,34,130],cafeRect=[56,54,71.4,84],corridorRect=[56,23,75.7,153];
    const doorRect=[67.4,23.5,73.6,37];
    const uniqloRect=[34,6,66,23];
    const pockets=[ticketRect,trussRect,seatsRect,cafeRect,corridorRect,uniqloRect];
    // Split the low ceiling into non-overlapping cells: the cafe intersects the corridor.
    function cover(poly,cuts,y,mat='gb_acoustic'){
      const local=poly.map(p=>toL(...p)),us=[...new Set([...local.map(p=>p[0]),...cuts.flatMap(r=>[r[0],r[2]])])].sort((a,b)=>a-b),vs=[...new Set([...local.map(p=>p[1]),...cuts.flatMap(r=>[r[1],r[3]])])].sort((a,b)=>a-b);
      for(let i=1;i<us.length;i++)for(let j=1;j<vs.length;j++){
        const u=(us[i-1]+us[i])/2,v=(vs[j-1]+vs[j])/2;if(cuts.some(r=>inRect(r,u,v)))continue;
        let q=clip(clip(clip(clip(local,0,us[i-1],true),0,us[i],false),1,vs[j-1],true),1,vs[j],false);
        if(q.length>2)K.hpoly(mat,q.map(p=>W(...p)),y,false);
      }
    }
    const ceilHoles=holes(hallWest,6).map(p=>{const q=p.map(p=>toL(...p));return[Math.min(...q.map(p=>p[0])),Math.min(...q.map(p=>p[1])),Math.max(...q.map(p=>p[0])),Math.max(...q.map(p=>p[1]))];});
    cover(hallWest,[...pockets,...ceilHoles,[66.2,6.2,75.25,23]],3.3);K.hpoly('gb_acoustic',NORTH,3.3,false,holes(NORTH,6));
    cover(rect(...corridorRect),[cafeRect,ticketRect,doorRect,[66.5,108.5,72,111]],4.5,0xefeeea);
    K.hpoly(0xf1efe8,rect(...doorRect),7.4,false);
    const inPocket=(u,v)=>pockets.some(r=>inRect(r,u,v,.2));
    columns(hallWest,0,3.28,(u,v)=>inPocket(u,v)||(u>68&&u<72));columns(NORTH,0,3.28,(u,v)=>v>23&&v<28);
    furnish(() => {
    // 600 mm T-bars align to the terminal, with 1.2 m rows of small downlights.
    const ceilStrip=(u0,v0,u1,v1,y)=>{const p=rect(u0,v0,u1,v1).map(([x,z])=>[x,y,z]);K.quad(0xc4c3bd,p,[0,-1,0]);};
    // Trace7: the north food row and entrance had an unbroken blank soffit.
    for(let u=77;u<316;u+=.6){
      if(blocked(u,10,1.4))continue;
      const q=clip(clip(NORTH.map(p=>toL(...p)),0,u,true),0,u+.018,false);
      if(q.length>2)K.hpoly(0xc4c3bd,q.map(p=>W(...p)),3.285,false);
    }
    for(let v=4.5;v<30;v+=.6){
      const q=clip(clip(NORTH.map(p=>toL(...p)),1,v,true),1,v+.018,false);
      if(q.length>2)K.hpoly(0xc4c3bd,q.map(p=>W(...p)),3.284,false);
    }
    // The walk's oval ceiling replaces the old grid only in this entrance pocket.
    for(let u=133;u<314;u+=9){
      lcyl(u,25,3.23,.085,.025,'emit',{seg:8,solid:false});
      lbox(u+1.8,24,3.24,.6,.6,.03,0xc6c4ba,{solid:false});
      for(let j=0;j<7;j++)lbox(u+1.8,23.76+j*.08,3.232,.51,.018,.015,0x858980,{solid:false});
    }
    for(let u=56;u<66;u+=.6)for(const [a,b] of [[23,26],[35,54],[84,153]])ceilStrip(u,a,u+.018,b,4.49);
    for(let v=23;v<153;v+=.6){if(v>26&&v<35||v>54&&v<84)continue;ceilStrip(56,v,66,v+.018,4.49);}
    for(let u=68.4;u<75.1;u+=1.2)for(let v=30;v<153;v+=1.2){if(inRect(cafeRect,u,v)||inRect(doorRect,u,v)||(u>=71.4&&v>=54&&v<=93))continue;lcyl(u,v,4.46,.08,.025,'emit',{seg:6,solid:false});}
    for(let u=9;u<315;u+=6)for(let v=9;v<156;v+=6){
      const [x,z]=W(u,v);if(!K.pointInPoly(x,z,P)||blocked(u,v,2)||inPocket(u,v))continue;
      lbox(u,v,3.23,.2,1.45,.055,0xd2d1ca,{solid:false});for(const du of [-.055,.055])lbox(u+du,v,3.215,.045,1.3,.018,'emit',{solid:false});
    }
    for(let v=24;v<30;v+=3)for(const u of [68.5,72.8]){lbox(u,v,3.2,.3,1.2,.06,0xbfc2bc,{solid:false});for(const du of [-.07,.07])lbox(u+du,v,3.185,.04,1.1,.025,'emit',{solid:false});}
    });
    // Sealed pocket reveals hide the old ceiling plane and cut-off column heads.
    function bulk(r,y){for(const [a,b,c,d] of [[r[0],r[1],r[2],r[1]],[r[2],r[1],r[2],r[3]],[r[2],r[3],r[0],r[3]],[r[0],r[3],r[0],r[1]]])lwall(a,b,c,d,3.3,y,{mat:0xf4f2ee,thick:.12,solid:false});}
    bulk(ticketRect,5.6);bulk(seatsRect,4);
    for(const [a,b,c,d] of [[8,14,32,14],[32,14,32,34],[32,34,8,34],[8,34,8,14]]){lwall(a,b,c,d,3.3,6.8,{mat:0xf4f2ee,thick:.12});lwall(a,b,c,d,6.8,7.1,{mat:doorGlass,thick:.06});}
    // Cafe reveal faces the corridor above the 4.5m ceiling; its south sightline stays open.
    lwall(56,54,56,84,3.3,6,{mat:0xf4f2ee,thick:.12,solid:false});lwall(56,54,71.4,54,3.3,6,{mat:0xf4f2ee,thick:.12,solid:false});lwall(71.4,54,71.4,84,4.5,6,{mat:0xf4f2ee,thick:.12,solid:false});
    // 02: the west half is a run of real shop units, rather than an open column hall.
    // Official main 1F units, mapped in reverse v order toward platform 16.
    const westNames=['데일리햇','티월드','도시주방','타코벨','신서울깍두기','띤띤익스프레스','파리바게트','연남토마','타쿠미나가사키','만복식당','소녀방앗간','스테이스튜디오','헬스보이짐'];
    const westUnitNos=[17,16,11,10,9,8,7,6,5,4,3,2,1];let wi=0;
    for(let v0=23;v0<137;v0+=6){const v1=Math.min(v0+6,137),v=(v0+v1)/2;
      if(v0<66&&v1>44||v0<110&&v1>102)continue;
      for(const u of [34,56])lwall(u,v0,u,v1,0,3.3,{mat:doorGlass,thick:.035,openings:[{at:(v1-v0)/2,w:1.9,y0:0,y1:2.5}]});
      for(const end of [v0,v1])lwall(34,end,56,end,0,3.3,{mat:0xe7e0d3,thick:.14});
      lwall(44.8,v0,44.8,v1,0,3.3,{mat:0xe5dfd2,thick:.14});
      const unit=westUnitNos[wi],name=westNames[wi++];
    furnish(() => {
      for(const [u,face] of [[34,'-u'],[56,'+u']]){lbox(u,v,2.5,.28,v1-v0,.9,0xd9531e,{solid:false});lsign(name,u+(face==='+u'?.16:-.16),v,2.94,v1-v0-.5,.5,face,{bg:null,fg:'#fff'});}
      for(const u of [36,53.7]){lbox(u,v,0,.65,v1-v0-1,2.1,0xdbd4c4,{side:'gb_shelf'});lbox(u+(u<40?2:-2),v,0,.9,2.2,.95,0xc9baa1);lbox(u,v,3.17,.6,3,.03,'emit',{solid:false});}
    });
      lzone(name,'1F',`본관 ${unit}호`,34,v0,56,v1,0,3.4,3);
    }
    // 10/16: 5–7 m individual fascias. The food counters face the walking aisle.
    const stallRows=[[23,42,['노브랜드 버거','후라토식당','죠 샌드위치']],[73,94,['배스킨라빈스','시그니처랩','앤티앤스']],[109,127,['타이거슈가','석관동떡볶이','라멘짱']],[132,139,['스타벅스']]];
    for(const [v0,v1,names] of stallRows){const step=(v1-v0)/names.length;
      lwall(56,v0,56,v1,0,4.5,{mat:0xe4dfd3,thick:.14});
      for(let j=0;j<names.length;j++){const a=v0+j*step,b=a+step,v=(a+b)/2,name=names[j],food=['노브랜드 버거','후라토식당','죠 샌드위치','시그니처랩','석관동떡볶이','라멘짱'].includes(name);
        for(const end of [a,b])lwall(56,end,66.7,end,0,3.3,{mat:0xdcd7c9,thick:.13});
        lwall(66.65,a,66.65,b,3.4,4.5,{mat:0xd8cdb4,thick:.12,solid:false});
        if(!food&&name!=='DUNKIN’')lwall(66.85,a,66.85,b,0,2.5,{mat:doorGlass,thick:.03,openings:[{at:step/2,w:1.8,y0:0,y1:2.5}]});
        furnish(() => {
        lbox(66.95,v,2.9,.3,step-.08,.4,0x2a2d30,{solid:false});lsign(name,67.13,v,3.1,Math.min(3.2,step-.45),.24,'+u',{bg:null,fg:'#e7f3fc',padding:.015,pxPerM:160});
        for(let vv=a;vv<b;vv+=1.2)lbox(66.73,vv,3.4,.025,.022,1.1,0xbdb39c,{solid:false});
        lbox(58.5,v,.1,.65,step-.8,2.1,0xe2d9c6,{side:'gb_shelf'});lbox(63,v,3.17,.6,step-.8,.025,'emit',{solid:false});
        if(food){
          lbox(66.65,v,0,.6,step-.35,1,'gb6_countertile');lbox(66.7,v,1,.8,step-.3,.055,0xc9cdcf,{solid:false});
          for(let vv=a+.6;vv<b-.4;vv+=1.05){lbox(67.55,vv,.75,.43,.43,.075,0x886848);for(const du of [-.17,.17])lbox(67.55+du,vv,0,.035,.34,.75,0x3c3a35,{solid:false});lbox(67.77,vv,.82,.045,.4,.36,0x646a67,{solid:false});}
          for(let vv=a+.65;vv<b-.3;vv+=1.1){lsign('',66.56,vv,2.17,.99,.59,'+u',{bg:'#c8102e'});lsign([name,'메뉴 안내'],66.59,vv,2.17,.9,.5,'+u',{bg:'#f8f6ee',fg:'#35312b',offset:.035});}
          for(const end of [a,b])lsign(name,62.2,end+(end===a?-.09:.09),2.7,5.2,.5,end===a?'-v':'+v',{bg:'#3a3634',fg:'#fff'});
        }else if(name==='DUNKIN’'){
          for(let k=0;k<3;k++){const vv=a+1.05+k*1.9;lbox(65.8,vv,.05,.95,1.68,1.95,0xbbbdb5,{side:'gb_shelf'});lbox(66.31,vv,.22,.025,1.55,1.65,doorGlass,{solid:false});for(const y of [.28,.74,1.2,1.66])lbox(66.35,vv,y,.04,1.55,.028,'emit',{solid:false});}
          lbox(64.9,v,2.1,.05,step-.5,.05,{tex:'emit',color:0xff3d8b},{solid:false});
          // Photo10: individual drink bottles and pale pastry rows behind the lit glass.
          for(let k=0;k<3;k++)for(let tier=0;tier<4;tier++)for(let item=0;item<7;item++){
            const vv=a+.38+k*1.9+item*.21,yy=.32+tier*.45;
            lbox(66.15,vv,yy,.15,.13,.23,[0xf0bd48,0x7eaf62,0xc84638,0xf0e6cf][(tier+item)%4],{solid:false});
            lbox(66.15,vv,yy+.23,.09,.08,.04,0xf2eee1,{solid:false});
          }

        }else{lbox(64.1,v,0,.75,step-.9,1.7,0xe3e2d8,{side:'gb_shelf'});lbox(65.7,a+.9,0,1,.8,.95,0xc9baa1);}
        });
        lzone(name==='DUNKIN’'?'던킨':name,'1F','대합실 상점',56,a,67,b,0,4.5,4);
      }
    }
    // North-wing glass shop fronts have lit shelves and a counter behind each unit.
    // Annex units retain the photographic counter/cabinet detail. Gate wells and the
    // main street entrance remain clear; numbered-platform order in the old OSM
    // reconstruction is reversed, so the two documented gate neighbours take priority.
    const annexUnits=[
      [77,86,'이디야',36],[86,95,'뚜레쥬르',37],[95,101,'공차',38],
      [112,119,'스킨밴드',39],[119,130,'버거킹',40],[132,140,'칠렉스24',45],
      [140,148,'이마트24 2호점',46],[148,157,'압구정칼국수김밥',47],
      [169,177,'로봇김밥',48],[177,186,'역전우동',49],[188,196,'던킨',51],
      [196,205,'북촌손만두',50],[215,224,'김밥천국',52],[224,232,'약천',53],
      [232,241,'내고향사골순대국',54],[241,249,'청룡각',55],[249,255,'복권/담배',56],
      [255,262,'이마트24 키오스크',57],[280,287,'제주스커피',42],
      [287,294,'청년떡볶이',41],[294,302,'코코이찌방야',43],[302,308,'효도치킨',58],
      [308,315,'이마트24(5호점)',59],
    ];
    for(const [shopIndex,[a,b,name,unit]] of annexUnits.entries()){
        const step=b-a,u=(a+b)/2;
        lwall(a,10.4,b,10.4,0,3.3,{mat:0xe3dfd4,thick:.14});for(const uu of [a,b])lwall(uu,10.4,uu,22,0,3.3,{mat:0xe3dfd4,thick:.14});
        furnish(() => {
        lbox(u,21.9,2.5,step-.08,.25,.8,0x3a3634,{solid:false});lbox(u,22,3.25,step,.4,.15,0xd9531e,{solid:false});
        });
        lzone(name,'1F',`부속상가 ${unit===43?'43·44':unit}호`,a,10.4,b,22,0,3.4,4);
        const openCounter=['버거킹','던킨','북촌손만두','로봇김밥','역전우동','청년떡볶이','김밥천국'].includes(name);
        lwall(a,21.8,b,21.8,0,2.5,{mat:doorGlass,thick:.03,openings:[{at:step/2,w:openCounter?step-.7:1.8,y0:0,y1:2.5}]});
        furnish(() => {
        lbox(u,12,.05,step-.7,.65,2.1,0xded6c4,{side:'gb_shelf'});lbox(u,19,0,step-1,.7,.95,0xc2b8a2);lbox(u,16,3.16,step-1,.5,.04,'emit',{solid:false});
        const color=name==='버거킹'?0xb62329:name==='던킨'?0xde5b22:0x3c362f;
        lbox(u,21.98,2.55,step-.12,.12,.67,color,{solid:false});
        lsign(name,u,22.07,2.9,step-.45,.42,'+v',{bg:null,fg:name==='이마트24 2호점'?'#ffc92c':'#fff',pxPerM:160});
        for(const du of [-step/2+.16,step/2-.16])lbox(u+du,21.85,0,.26,.32,2.5,name==='뚜레쥬르'?'gb5_arrivalbrick':0x655346,{solid:false});
        if(name==='스킨밴드'){
          for(const du of [-1.65,-.55,.55,1.65]){
            lbox(u+du,17.3,0,.9,.8,1.55,0xf0e8dc,{side:'gb_shelf'});
            lbox(u+du,17.75,.68,.88,.05,.12,0xc9988b,{solid:false});
            lsign('상품 안내',u+du,17.73,1.17,.67,.47,'+v',{bg:'#f2e9df',fg:'#634e4a'});
          }
          for(let k=0;k<4;k++)lbox(u-step/2+.7+k*(step-1.4)/3,18,3.17,(step-1.5)/4,4,.04,{tex:'emit',color:k%2?0xffe9d9:0xfff2bf},{solid:false});
        }else if(name==='뚜레쥬르'||name==='던킨'){
          lbox(u,20.3,.5,step-1.2,.8,.8,doorGlass,{solid:false});
          for(const y of [.55,.9,1.25])for(let k=0;k<9;k++){
            lbox(u-step/2+.9+k*(step-1.8)/8,20.32,y,.32,.36,.12,[0xe4b16b,0xc18b46,0xf4d59c][k%3],{solid:false});
          }
        }else if(name==='버거킹'){
          for(const du of [-1.4,0,1.4])lsign('버거킹',u+du,20.9,2.08,1.1,.5,'+v',{bg:'#f4d6a2',fg:'#9e2925'});
        }
        // Food counters have a service face, menu lights and tables instead of
        // reading as empty glass rooms in trace7. Existing stock remains behind.
        if(name==='버거킹'||name==='던킨'){
          lbox(u,20.25,0,step-.9,.65,.98,name==='버거킹'?0x754634:0xe3ded1);
          lbox(u,20.3,.98,step-.82,.8,.055,0x383934,{solid:false});
          lbox(u+.7,20.28,1.04,.38,.2,.32,0x242d2d,{solid:false});
          lsign('주문 · 결제',u+.7,20.41,1.25,.32,.18,'+v',{bg:'#c7d9db',fg:'#243b42'});
          for(const du of [-1.3,0,1.3]){
            lsign(['메뉴 안내','버거 · 음료'],u+du,18.9,2.24,1.16,.65,'+v',{bg:name==='버거킹'?'#b32a2b':'#ec7b31',fg:'#fff'});
            for(const dv of [15.2,17.1]){
              lbox(u+du,dv,.72,.65,.6,.06,0xb88e58);lbox(u+du,dv,.03,.08,.08,.69,0x343a38,{solid:false});
              lbox(u+du,dv+.65,.42,.42,.42,.06,0x785143);lbox(u+du,dv+.83,.48,.42,.06,.4,0x785143,{solid:false});
            }
          }
          for(const du of [-step/2+.3,step/2-.3])lbox(u+du,22.2,0,.06,.06,.98,0x36495e,{solid:false});
          lperson(u-.9,19.35,0,{shirt:0x292c2c,pants:0x26282b});
        }
        if(name==='뚜레쥬르'){
          for(const du of [-step/2+.3,step/2-.3]){
            lbox(u+du,21.82,0,.7,.55,3.3,'gb5_arrivalbrick',{solid:false});
            lbox(u+du,22.12,.05,.72,.045,.11,0x55594e,{solid:false});
          }
          lbox(u,21.78,3.15,step,.55,.15,'gb5_arrivalbrick',{solid:false});
          lsign(['뚜레쥬르','매장 안내'],u-step/2+.3,22.14,1.75,.48,.64,'+v',{bg:'#f1ead8',fg:'#425b44'});
          lperson(u-.8,22.8,0,{shirt:0xc6c2b4,pants:0x545b59});
        }
        if(name==='이마트24 2호점'||name==='스킨밴드'){
          for(let uu=a+.08;uu<b;uu+=.24)lbox(uu,22.045,2.55,.035,.03,.62,0x766553,{solid:false});
          lbox(a+.18,22.12,0,.3,.2,2.5,0xe1c7a2,{solid:false});
          lsign(name==='이마트24 2호점'?'이마트24':'스킨밴드',a+.18,22.24,1.6,.25,.85,'+v',{bg:'#f7eedb',fg:name==='이마트24 2호점'?'#dfac16':'#543d59'});
        }
        if(shopIndex<5)for(const du of [-1.1,1.1])lperson(u+du,24+(shopIndex%2)*.6,0,{shirt:[0x373e46,0x657a68,0xc6b99d][shopIndex%3]});

        });
    }
    K.hpoly('gb_tactile',rect(70.25,23,70.55,153),.024);K.hpoly('gb_tactile',rect(98,25.85,314,26.15),.024);
    for(const b of bays){if(b.west)K.hpoly('gb_tactile',rect(70.4,b.v-.15,75.4,b.v+.15),.026);else K.hpoly('gb_tactile',rect(b.u-.15,26,b.u+.15,30),.026);}
    function bench(u,v,alongU=false,count=4){
      const piece=(a,b,y,w,d,h,mat,o={})=>lbox(u+(alongU?a:b),v+(alongU?b:a),y,alongU?w:d,alongU?d:w,h,mat,o);
      const half=count*.285,leg=Math.max(.23,half-.24);
      for(let s=0;s<count;s++){const a=(s-(count-1)/2)*.57;piece(a,0,.43,.52,.5,.065,0x9aa3a6);for(let k=0;k<6;k++)piece(a,.22,.51+k*.07,.52,.045,.045,0x9aa3a6,{solid:false});}
      for(const a of [-leg,leg])piece(a,0,.04,.09,.55,.4,0x9ca6a4,{solid:false});for(const a of [-half,0,half])piece(a,0,.64,.035,.53,.035,0xbfc5c0,{solid:false});
    }
    furnish(() => {
    const wb=bays.filter(b=>b.west).sort((a,b)=>a.v-b.v);
    // Short modules fit the narrow glazed intervals without covering the door screens.
    for(let i=1;i<wb.length;i++){const a=wb[i-1].v,b=wb[i].v,gap=b-a;if(gap<6.9)continue;const v=(a+b)/2;if(v>42&&v<58)continue;const count=gap>=8?4:2;for(const u of [72.4,73.4,74.4])bench(u,v,false,count);}
    for(let u=155;u<315;u+=8){if([163,218,232.4,259].some(e=>Math.abs(e-u)<4)||blocked(u,28.1,3))continue;bench(u,28.1,true);}
    for(const v of [26.9,28,29.1])bench((waitingWindow[0]+waitingWindow[1])/2,v,true,4);
    // 11: wide paired brown door screens, central black digital-board pier, clear transoms.
    for(const [bi,b] of bays.entries()){
      const west=b.west,face=west?'-u':'-v',dw=b.n===null?3.8:west?5.6:2.4;
      const part=(t,y,w,h,d,mat,off=-.14)=>lbox(b.u+(west?off:t),b.v+(west?t:off),y,west?d:w,west?w:d,h,west&&b.v>80?(mat===0x53483b?0x2e3336:mat===doorGlass?{tex:'gb_door_glass',color:0x2c3a40}:mat):mat,{solid:false});
      if(west&&b.v>43&&b.v<57)continue; // gb-L05: solid white kiosk-corridor enclosure.
      if(b.n===null){
        part(0,.08,dw,2.92,.025,doorGlass,.05);for(const side of [-1,1]){part(side*(dw/2+.18),0,.36,3.4,.36,0x3e4143,.22);part(side*.95,0,.055,2.9,.09,0x3e4143,.08);}
        part(0,2.9,dw+.72,.6,.36,0x3e4143,.22);part(0,1.1,dw,.06,.08,0x3e4143,.08);
        part(0,3.5,dw+1,2,.18,'gb5_arrivalbrick',.22);for(const side of [-1,1])part(side*(dw/2+.58),0,.42,3.5,.16,'gb5_arrivalbrick',.22);
        part(dw/2+.9,.14,.35,.78,.32,0x373a38,.65);lsign('하차장 입구',b.u,b.v-.29,3.17,dw,.28,'-v',{bg:null,fg:'#f4f0e3'});
        lquadH(b.u-2.4,b.v+.2,b.u+2.4,b.v+6,.151,0x9c7a4a);
        K.hpoly('gb_tactile',rect(b.u-.15,b.v+.2,b.u+.15,b.v+4),.16);
        K.hpoly('gb_tactile',rect(b.u-2.35,b.v+.65,b.u+2.35,b.v+.95),.161);continue;
      }
      if(west&&b.n===16){
        const brown=0x493d32;
        part(0,.05,5.5,2.92,.025,doorGlass);
        for(const t of [-2.8,-2,-1,0,1,2,2.8])part(t,.02,.07,2.94,.12,brown);
        for(const y of [.06,1.02,1.75,2.56,2.96])part(0,y,5.6,.065,.12,brown);
        for(const t of [-.9,-.1,.1,.9])part(t,.95,.03,.44,.18,0xc3bcaa,-.22);
        // Project the brick reveal in front of the actual OSM plaster wall.
        // Round7's piers/beam were embedded in that wall and disappeared.
        for(const t of [-3.02,3.02])part(t,0,.56,3.65,.6,0xe6dccb,-.61);
        part(0,3.0,6.6,.65,.6,0xe6dccb,-.61);
        for(const [t,label] of [[-1.05,'‹ 승차홈 17~36'],[1.05,'승차홈 1~16 ›']])lsign(label,74.58,b.v+t,3.35,1.6,.35,'-u',{bg:'#494740',fg:'#fff',offset:.035,pxPerM:180});
        lsign('비상구',75.34,b.v,2.85,.4,.24,'-u',{bg:'#16b18e',fg:'#fff'});
        part(0,3.65,6.6,1.9,.2,0xe6dccb,-.66);
        // Dark vertical fins turn into a deep slatted soffit over the approach.
        for(let t=-3;t<=3;t+=.22)lbox(72.1,b.v+t,5.43,5.9,.065,.2,0x72583f,{solid:false});
        for(const t of [-2.1,2.1]){
          lbox(74.9,b.v+t,3.66,.6,.6,.04,0xb8b7ae,{solid:false});
          for(let k=0;k<6;k++)lbox(74.9,b.v+t-.22+k*.085,3.651,.48,.025,.01,0x737970,{solid:false});
          lcyl(74.25,b.v+t,3.64,.09,.02,'emit',{seg:8,solid:false});
        }
        for(const t of [-3.8,3.8]){
          part(t,.1,.72,2.45,.3,0x303436,-.5);
          lsign(['승차 안내','09:15  세종','09:20  대전','09:30  강릉'],75.02,b.v+t,1.48,.61,1.9,'-u',{bg:'#125891',fg:'#e1f3fb'});
        }
        continue;
      }
      if(west){
        for(const s of [-1,1]){const c=s*1.56;part(c,.06,2.43,2.94,.025,doorGlass);for(const t of [-1.21,-.4,.4,1.21])part(c+t,.02,.06,2.58,.08,0x53483b);for(const y of [.06,1.02,1.72,2.55])part(c,y,2.43,.055,.08,0x53483b);part(c+s*.14,.96,.035,.42,.1,0xb2a99c,-.24);}
        part(0,2.58,dw,.055,.08,0x53483b);part(0,2.98,dw,.055,.08,0x53483b);
      }else{for(const t of [-dw/2,0,dw/2])part(t,.02,.08,2.62,.08,0x53483b);for(const y of [.06,1.02,1.72,2.55])part(0,y,dw,.055,.08,0x53483b);}
      const t=west?0:dw/2+.48,u=b.u+(west?-.13:t),v=b.v+(west?t:-.38);
      lbox(u,v,.04,west?.22:.66,west?.66:.22,2.9,0x1d1f1f,{solid:false});const su=u-(west?.13:0),sv=v-(west?0:.13);
      lsign(['승차홈',`${b.n}  ${b.dest||'출발 안내'}`],su,sv,2.68,.55,.3,face,{bg:'#3e504f',fg:'#dceeea',padding:.02});lsign('09:12',su,sv,2.38,.55,.24,face,{bg:'#102431',fg:'#85dfed',padding:.02});
      for(let k=0;k<6;k++)lsign([['09:15','09:15','09:20','09:20','09:20','09:21'][k],k%2?'승차홈 '+b.n:b.dest||'출발 안내'],su,sv,2.08-k*.29,.55,.28,face,{bg:k%2?'#095b9a':'#126cb5',fg:'#d5eef1',padding:.01});
      if(bi%4===0)lsign('비상구',b.u-(west?.3:0),b.v-(west?0:.3),3.12,.55,.25,face,{bg:'#24ac87',fg:'#fff'});
    }
    // 01/04/05: wide gold bars, readable from both directions, suspended outside their boxes.
    for(const [u,v,face] of [[71.5,62,'-v'],[71.5,106,'-v'],[118,26,'+u'],[254,26,'-u'],[48,151,'+v']]){
      const along=face.includes('u'),top=u===48?6.9:along?3.3:4.5;
      for(const s of [-1,1])lbox(u+(along?0:s*2.6),v+(along?s*2.6:0),3.05,.025,.025,top-3.05,0x827968,{solid:false});
      lsign('',u,v,2.78,5.8,.55,face,{bg:'#9a8061',fg:'#fbf7ee',twoSided:true,box:.06,offset:.08,boxMat:0x7a6650});
      const dir=face==='-v'?-1:face==='+u'?1:face==='-u'?-1:1;
      lsign(['‹ 승차홈 17~36','경부선 · 영동선'],u+(along?0:-dir*1.35),v+(along?dir*1.35:0),2.78,2.6,.45,face,{bg:null,fg:'#fbf7ee',twoSided:true,offset:.09,padding:.01});
      lsign('승차홈 1~16 ›  ● 화장실',u+(along?0:dir*1.4),v+(along?-dir*1.4:0),2.78,2.5,.28,face,{bg:null,fg:'#fbf7ee',twoSided:true,offset:.09,padding:.01});
    }
    for(const v of [24.5,26]){lbox(70.9,v,0,.6,.08,1.6,0x5a3f2e);lsign(['매표소 / 호남선','지하철 3·7·9호선','신세계백화점'],70.9,v-.06,1.05,.54,.9,'-v',{bg:null,fg:'#fff',pxPerM:180});}
    lsign('지하철 · 제로데이 택배 >',70.8,23.2,2.9,4.5,.4,'-v',{bg:'#cdb48c',fg:'#f8f8ed',twoSided:true,offset:.08});
    });
    // 05/06/09: narrow tiled link beneath a glazed balcony, with a separate ticket pocket.
    const ticketPoly=rect(...ticketRect),wells=[30,40].map(u=>Array.from({length:32},(_,i)=>W(u+2.2*Math.cos(i*PI/16),143+2.2*Math.sin(i*PI/16))));
    K.hpoly('gb5_ticket_tile',ticketPoly,.014);
    for(let u=25;u<65;u+=5)lquadH(u,146,u+1.2,156.5,.018,0x8d8f8c);
    K.hpoly(0xf4f2ee,rect(24,137,65,146),4.7,false,wells);K.hpoly(0xf4f2ee,rect(24,146,65,156.5),7.5,false);
    for(const [ix,u] of [30,40].entries()){
      // White vertical light wells, open below, bright round caps 2.8 m above the ceiling.
      for(let k=0;k<32;k++){const a=k*PI/16,b=(k+1)*PI/16;const q=(t,y)=>{const[x,z]=W(u+2.2*Math.cos(t),143+2.2*Math.sin(t));return[x,y,z];};K.quad(0xf4f2ee,[q(a,4.7),q(a,7.5),q(b,7.5),q(b,4.7)],[-Math.cos((a+b)/2)*A[0]-Math.sin((a+b)/2)*B[0],0,-Math.cos((a+b)/2)*A[1]-Math.sin((a+b)/2)*B[1]]);}
      K.hpoly('emit',wells[ix],7.5,false);
    }
    for(let u=26;u<64;u+=3)for(let v=138;v<146;v+=3){if([30,40].some(c=>Math.hypot(u-c,v-143)<2.4))continue;lcyl(u,v,4.66,.08,.025,'emit',{seg:6,solid:false});}
    // Shop display fronts bound the 10.5 m link; passages connect to the ticket desk.
    for(const [v,face,sgn] of [[146,'+v',-1],[156.5,'-v',1]])for(let u=27;u<64;u+=6){
      if(v===146&&(u<48||u>59))continue;
      lwall(u-3,v,u+3,v,0,3.3,{mat:doorGlass,thick:.03,openings:[{at:3,w:1.6,y0:0,y1:2.5}]});lbox(u,v,2.6,5.9,.22,.7,0x3a3634,{solid:false});lbox(u,v+sgn*.6,.05,5.5,.4,2.25,0xd8cfb9,{side:'gb_shelf',solid:false});
      lbox(u,v-sgn*.1,3.28,6,.38,.12,0xd9531e,{solid:false});
    }
    for(const v of [146,156.5]){
      lwall(24,v,65,v,3.3,5.4,{mat:0xf4f2ee,thick:.12,solid:false});
      lwall(24,v,65,v,6,7.1,{mat:doorGlass,thick:.06});lbox(44.5,v,7.08,41,.1,.08,0xf4f2ee,{solid:false});
      // Eight facets soften the balcony's white lower edge into its vertical reveal.
      for(let k=0;k<8;k++){const a=k*PI/16,b=(k+1)*PI/16,s=v===146?1:-1;const q=(t,u)=>{const[x,z]=W(u,v+s*.6*(1-Math.cos(t)));return[x,5.4+.6*Math.sin(t),z];};K.quad(0xf4f2ee,[q(a,24),q(a,65),q(b,65),q(b,24)],[0,-1,0]);}
      lbox(44.5,v+(v===146?.58:-.58),5.96,40.8,.045,.035,'emit',{solid:false});
    }
    for(const u of [24,65])lwall(u,146,u,156.5,6,7.1,{mat:doorGlass,thick:.06});
    lwall(25,140,64,140,0,5.6,{mat:0xe9e3d6,thick:.18});
    lwall(59,144.4,64.5,144.4,0,3.3,{mat:0xc4c2b6,thick:.15});
    furnish(() => {
    for(let u=25;u<64;u+=.3)lbox(u,140.13,3.65,.025,.025,1.95,0xd6cfc0,{solid:false});
    lbox(36,140.2,.1,20,.3,2.75,0x181e22,{solid:false});lbox(36,141.1,0,20,1.25,1.02,0x272b2a);lbox(36,141.2,1.02,20,1.45,.07,0x444641,{solid:false});
    lbox(36,140.9,2.95,20,1.2,.7,0xf4f2ee,{solid:false});
    for(const side of [-1,1])for(let k=0;k<8;k++){const a=k*PI/16,b=(k+1)*PI/16;const q=(t,r)=>{const[x,z]=W(36+side*(9.4+r*Math.cos(t)),141.51);return[x,2.95-r*Math.sin(t),z];};K.quad(0xf4f2ee,[q(a,.6),q(b,.6),q(b,1.3),q(a,1.3)],[B[0],0,B[1]]);}
    lsign('Ⓣ TICKETS 매표소',35.7,141.53,3.3,8,.5,'+v',{bg:null,fg:'#fafbf7',padding:.01});
    lsign('',36,140.42,2.3,20,1.1,'+v',{bg:'#0d2a52'});
    for(let col=0;col<3;col++)for(let row=0;row<6;row++)lsign(['09:15  세종  13   09:20  대전  11','09:20  천안  14   09:20  공주  16','09:21  아산  16   09:25  부산   1','09:30  강릉  23   09:30  원주  25','09:35  청주  34   09:40  창원   4','09:45  울산   6   09:50  진주   5'][row],29.5+col*6.4,140.45,2.73-row*.17,6.2,.14,'+v',{bg:null,fg:'#91c9e7',padding:.005,offset:.035});
    lsign(['승차권 안내','매표소'],45,140.5,2.3,2.5,1.08,'+v',{bg:'#7fb6e6',fg:'#19364b',offset:.04});
    for(let col=0;col<10;col++){const u=27.4+col*1.88;lbox(u,140.7,1.13,.55,.14,.38,0x333a3b,{solid:false});lbox(u,141.4,1.1,1.68,.02,.65,doorGlass,{solid:false});lsign(String(col+1),u,140.43,1.47,.25,.18,'+v',{bg:null,fg:'#eee9da'});if(col%2===0){lbox(u+.8,141.1,1.1,.3,.3,.22,0x6b5b48,{solid:false});lbox(u+.8,141.1,1.32,.43,.4,.34,0x3f6943,{solid:false});}}
    for(const u of [28,32,36,40,44])for(const v of [143.2,145.7]){lcyl(u,v,.02,.14,.035,0x343638,{seg:6,solid:false});lcyl(u,v,.05,.022,.89,0x454a49,{seg:4,solid:false});if(u<44)lbox(u+2,v,.84,4,.035,.055,0x333b3b,{solid:false});}
    lquadH(48.8,140.1,58.7,143.5,.021,0x8d8f8c);lsign('Ⓣ TICKETS 무인발권기',53.3,141.73,3.17,7.8,.4,'+v',{bg:null,fg:'#55585a'});
    for(const u of [49.3,50.6,52.5,54.4,56.3,57.6]){kiosk(u,140.8);lcyl(u,141.3,2.84,.065,.03,'emit',{seg:6,solid:false});}
    for(const side of [-1,1]){const outer=53.3+side*5.05,center=outer-side*.8;lbox(outer,140.9,0,.28,1.6,2.35,0xf2f0e9);for(let i=0;i<8;i++){const a=i*PI/16,b=(i+1)*PI/16;const q=(t,r)=>{const[x,z]=W(center+side*r*Math.cos(t),141.7);return[x,2.35+r*Math.sin(t),z];};K.quad(0xf2f0e9,[q(a,.66),q(b,.66),q(b,.94),q(a,.94)],[B[0],0,B[1]]);}}
    lbox(53.3,140.9,3.01,8.5,1.6,.28,0xf2f0e9,{solid:false});
    for(const [u,col,t] of [[51.55,0x84523d,'매표소 이용안내'],[53.45,0xe2b9c5,'승차권 안내'],[55.35,0xc7834a,'무인발권 안내']]){lbox(u,141.2,.02,.6,.24,1.82,col,{solid:false});lsign(t,u,141.35,1.46,.53,.45,'+v',{bg:null,fg:'#fff'});}
    lquadH(59,144.5,64.5,147.5,.021,0x8d8f8c);lsign('Ⓣ TICKETS 매표·환불',61.5,144.5,2.9,4.7,.34,'+v',{bg:null,fg:'#55585a'});for(const u of [60,61,62,63])kiosk(u,145);
    });
    lzone('매표·환불','1F','매표소 · 무인발권기',24,137,65,157,0,7.5,4);
    // 13: six-sided tube trusses and skylight strips; exact location remains unverified.
    K.hpoly('gb5_ticket_tile',rect(...trussRect),.014);K.hpoly(0x6d7275,rect(...trussRect),6.8,false);
    for(const v of [17,23,29]){const p=rect(8,v-1,32,v+1).map(([x,z])=>[x,6.79,z]);K.quad('emit',p,[0,-1,0]);}
    const beam=(u0,v0,y0,u1,v1,y1,r=.08)=>{
      const aa=W(u0,v0),bb=W(u1,v1),a=new K.THREE.Vector3(aa[0],y0,aa[1]),b=new K.THREE.Vector3(bb[0],y1,bb[1]),d=b.clone().sub(a).normalize(),n=d.clone().cross(Math.abs(d.y)>.95?new K.THREE.Vector3(1,0,0):new K.THREE.Vector3(0,1,0)).normalize(),m=d.clone().cross(n).normalize();
      const p=(v,t)=>v.clone().addScaledVector(n,Math.cos(t)*r).addScaledVector(m,Math.sin(t)*r).toArray();
      for(let k=0;k<6;k++){const t=k*PI/3,tt=(k+1)*PI/3,norm=n.clone().multiplyScalar(Math.cos((t+tt)/2)).addScaledVector(m,Math.sin((t+tt)/2));K.quad(0xf2f1ec,[p(a,t),p(b,t),p(b,tt),p(a,tt)],norm.toArray());}
    };
    for(const v of [17,23,29,33]){beam(8,v,5.4,32,v,5.4);beam(8,v,6.4,32,v,6.4);for(let u=8;u<32;u+=4){beam(u,v,5.4,u+4,v,6.4);beam(u+4,v,5.4,u+4,v,6.4,.065);}}
    for(const u of [9,20,31])for(const [a,b] of [[14,20],[20,26],[26,33]]){beam(u,a,5.4,u,b,5.4);beam(u,a,5.4,u,b,6.4,.065);}
    // Shallow clerestory panes and metal ceiling seams give the truss a backdrop.
    for(let u=9;u<32;u+=1.15){
      lbox(u,14.08,3.5,1.02,.06,1.65,doorGlass,{solid:false});
      lbox(u-.54,14.12,3.45,.055,.1,1.8,0xaaa99e,{solid:false});
    }
    for(let u=8.1;u<32;u+=.38)lbox(u,24,6.74,.035,20,.04,0x979b98,{solid:false});
    lwall(9,16,31,16,0,2.6,{mat:0x8a6a4b,thick:.16});
    furnish(() => {
    lbox(20,16.1,2.32,22,.16,.3,0x2e2f2e,{solid:false});lsign('현금 카드 매표·환불  |  카드 매표',20,16.2,2.47,18,.23,'+v',{bg:null,fg:'#fff'});
    lquadH(10.5,16.4,29.5,19.1,.022,0x8d8f8c);for(let u=11;u<=29;u+=.85)kiosk(u,16.6);
    for(let u=9.4;u<31;u+=.5){lbox(u,16,2.6,.5,.5,.2,0x494940,{solid:false});lbox(u,16,2.8,.5,.5,.35,'gb8_foliage',{solid:false});lbox(u,16.3,2.5+(Math.round(u*10)%3)*.12,.23,.12,.45,'gb8_foliage',{solid:false});}
    for(const u of [15,25])lsign(['승차권 안내','경부선 · 영동선'],u,16.14,3.65,1.6,.9,'+v',{bg:'#1a1d2a',fg:'#d5dfed',box:.08,boxMat:0x292c2b});for(const u of [14,20,26])bench(u,27,true);
    for(const u of [10,14,18,22,28]){lperson(u,17.8,0,{shirt:0x454b50});lbox(u,18.4,.02,.35,.22,.54,0x545961,{solid:false});}
    for(const [u,v] of [[14,27],[20,27],[26,27]])lperson(u,v,0,{sit:true,shirt:0x626b69});
    lsign('Ⓣ TICKETS 무인발권기',20,16.21,2.98,7,.3,'+v',{bg:'#8a6a4b',fg:'#f4eee0'});
    for(const u of [11,17,23,29]){lcyl(u,17,5.24,.11,.08,'emit',{seg:8,solid:false});lbox(u,17,5.32,.04,.04,.2,0x424d4e,{solid:false});}
    });
    lzone('무인발권기','1F','철골 천장 · 대합실',8,14,32,34,0,6.8,4);
    // 15: light oak slats against a white backing, planted columns and upholstered benches.
    K.hpoly('gb5_ticket_tile',rect(...seatsRect),.014);K.hpoly(0xeeebe4,rect(...seatsRect),4,false);
    for(const [u,v] of [[18,113],[30,124]]){lbox(u,v,0,1,1,3.8,0x3f6a3a);for(let y=.2;y<3.8;y+=.4)for(const s of [-1,1]){lbox(u+s*.52,v,y,.08,.95,.32,0x527c45,{solid:false});lbox(u,v+s*.52,y,.95,.08,.32,0x527c45,{solid:false});}}
    furnish(() => {
    for(let u=8.1;u<34;u+=.25)lbox(u,119,3.8,.06,22,.15,0xc9a77c,{solid:false});for(let u=10;u<33;u+=1.6)lbox(u,119,3.77,.06,18,.03,'emit',{solid:false});
    for(const [u,v,col] of [[13,113,0xe8741e],[26,113,0xe8741e],[13,124,0xe8741e],[26,124,0x2c2e2d]]){lbox(u,v,.12,5.4,1,.35,col);lbox(u,v+.4,.47,5.4,.2,.4,col,{solid:false});for(const s of [-1,1])for(let k=0;k<3;k++){const du=s*(2.7+k*.1),d=1-.15*k;lbox(u+du,v,.12,.1,d,.35,col,{solid:false});lbox(u+du,v+.4-.035*k,.47,.1,.2,.4,col,{solid:false});}}
    for(const [u,v] of [[18,113],[30,124]]){
      for(const s of [-1,1]){
        lbox(u+s*.56,v,.2,.06,1.04,3.5,'gb8_foliage',{solid:false});
        lbox(u,v+s*.56,.2,1.04,.06,3.5,'gb8_foliage',{solid:false});
      }
      lbox(u+.6,v+.58,.18,.045,.045,3.5,'emit',{solid:false});
    }
    for(const [u,v] of [[11.4,113],[14.5,113],[24.5,113],[12,124],[27,124]])lperson(u,v-.12,0,{sit:true,shirt:[0x353b49,0x73776b,0xcdb99a][Math.floor(u)%3]});
    for(const [u,v] of [[17,118],[23,121],[29,118]])lperson(u,v,0,{shirt:0x464f5c});
    lbox(9.2,118,.04,.65,.28,1.8,0xe5e3d8,{solid:false});lsign(['대합실 안내','매표소 →'],9.2,118.16,1.36,.53,.65,'+v',{bg:'#ede9de',fg:'#474b45'});
    });
    lzone('대합실 좌석','1F','목재 천장 · 주황 벤치',8,108,34,130,0,4,4);
    // The cafe occupies the two edges of its void; its tables have a real mezzanine floor.
    K.slab(rect(56,54,71.4,58),6,{mat:'tile',under:0xf1ede4,thick:.18});
    K.slab(rect(56,80,71.4,84),6,{mat:'tile',under:0xf1ede4,thick:.18});
    lwall(56,80,71.4,80,6,7.1,{mat:doorGlass,thick:.08});
    furnish(()=>{
      lbox(63.7,80,5.95,15.4,.2,.8,0xefe9dc,{solid:false});
      lsign('FOOD STATION 2F',63.7,79.84,6.35,8,.7,'-v',{bg:null,fg:'#d63e29'});
      lbox(63.7,83.85,7.1,15.2,.12,2.4,0x333934,{solid:false});
      lsign('HOLLYS COFFEE',63.7,80.05,8.45,10,.65,'-v',{bg:null,fg:'#fff'});
      for(let k=0;k<6;k++)lsign('메뉴 안내',58.8+k*1.95,79.82,5.5,1.6,.4,'-v',{bg:'#f4f6f8',fg:'#464d4b'});
      for(const u of [58,61,64,67,70]){
        lbox(u,82,6,.08,.08,.85,0x5a5043,{solid:false});lbox(u,82,6.85,.7,.6,.07,0x8b6a4b,{solid:false});
        lcyl(u,82,7.85,.18,.22,{tex:'emit',color:0xffd699},{seg:6,solid:false});
      }
    });
    // 03: signs and digital menu boxes sit inside the widened void, visible from the aisle.
    K.hpoly('gb_acoustic',rect(...cafeRect),10.55,false);
    for(const u of [56,71.4])lwall(u,54,u,84,6,7.1,{mat:doorGlass,thick:.08});for(const v of [54,84])lwall(56,v,71.4,v,6,7.1,{mat:doorGlass,thick:.08});
    lwall(56,58,71.4,58,6,7.1,{mat:doorGlass,thick:.08});
    furnish(() => {
    lbox(63.7,58,7.08,15.4,.08,.06,aluminium,{solid:false});
    lbox(63.7,58.3,5.95,15.4,.2,.8,0xefe9dc,{solid:false});lsign('FOOD STATION 2F',63.7,58.45,6.35,8,.7,'+v',{bg:null,fg:'#d63e29',padding:.01});
    lbox(63.7,54.2,7.1,15.2,.12,2.4,0x333934,{solid:false});lsign('HOLLYS',61.05,58.42,8.45,4.2,.65,'+v',{bg:null,fg:'#fff'});lsign('COFFEE',66.35,58.42,8.45,4.2,.65,'+v',{bg:null,fg:'#fff'});lsign('●',63.7,58.43,8.46,.65,.6,'+v',{bg:null,fg:'#cd2338',offset:.035});
    for(let k=0;k<6;k++)lsign(k===0?'LEMON':'메뉴 안내',58.8+k*1.95,58.5,5.5,1.6,.4,'+v',{bg:'#f4f6f8',fg:'#464d4b',padding:.01});
    for(const u of [58,61,64,67,70]){lbox(u,56,6.85,.7,.6,.07,0x8b6a4b,{solid:false});lcyl(u,56,7.85,.18,.22,{tex:'emit',color:0xffd699},{seg:6,solid:false});}
    for(let y=.2;y<5.4;y+=.45)lbox(56.2,64,y,.3,2.4,.4,y%1>.5?0x4e6d42:0x35553b,{solid:false});
    // Photo03: glazed cafe, warm pendants and chairs visible above the food sign.
    for(const [v,sgn] of [[58,1],[80,-1]]){
      lwall(56.2,v,71.2,v,7.1,9.7,{mat:doorGlass,thick:.035,solid:false});
      for(const u of [56.3,59.3,62.3,65.3,68.3,71.1])lbox(u,v,6.1,.055,.09,3.6,0xb5b6af,{solid:false});
      for(const u of [58,61,64,67,70]){
        lbox(u,v-sgn*2.1,6,.05,.05,.83,0x5b5147,{solid:false});
        lbox(u,v-sgn*.7,6.43,.52,.5,.08,0x627675,{solid:false});
        lbox(u,v-sgn*.47,6.5,.52,.065,.55,0x627675,{solid:false});
        lbox(u,v-sgn*1.8,8.18,.025,.025,1.36,0x494c46,{solid:false});
        const[x,z]=W(u,v-sgn*1.8);K.dome({x,z,y:8.02,rx:.27,ry:.2,rz:.27,mat:{tex:'emit',color:0xf1c17b},seg:8,rings:3});
      }
      for(const u of [57,70.7])lbox(u,v+sgn*.12,4.65,.22,.22,.9,0x454b4a,{solid:false});
    }
    for(const [u,v] of [[59,56],[65,56],[61,82],[67,82]])lperson(u,v,6,{sit:true,shirt:0x53615b});
    // Vegetated edge and narrow grille frame the clear 1F cafe passage.
    lbox(71.15,68,0,.28,4.2,5.1,0xe4e1d8,{solid:false});
    for(let h=.35;h<4.7;h+=.075)lbox(70.98,67.4,h,.035,1.7,.018,0x939c92,{solid:false});
    lbox(70.98,69.1,.15,.08,1.05,4.6,'gb8_foliage',{solid:false});
    lbox(70.92,69.7,.15,.04,.045,4.6,'emit',{solid:false});
    });
    lzone('할리스 · 푸드스테이션','2F','카페',56,52,71.4,58,6,11,4);
    furnish(() => {
    // Cluster the retained forty travellers away from the trace cameras, with
    // alternating travel directions and bags; the tactile spine stays legible.
    for(let i=0;i<40;i++){
      let v=36+Math.floor(i/4)*9.7+(i%2)*1.2,u=[69,69.6,71.8,72.3][i%4];
      if(v>83&&v<94)v+=10;
      else if([50,53,115].some(c=>Math.abs(v-c)<2.5))v+=3.3;
      if(v>=89&&v<=105&&u<70)u=70;
      lperson(u,v,0,{h:1.68,shirt:[0x374653,0xb4ab98,0x7c625e,0x4d6655][i%4],rotY:FACE[i%2?'+v':'-v']});
      if(i%5===0)lbox(u+.34,v,.52,.24,.14,.33,0xbaa688,{solid:false});
    }
    for(const [u,v] of [[138,24.5],[160,25],[221,24.8],[286,25],[33,143],[51,142.5],[13,113],[26,124]])lperson(u,v,0,{sit:u===13||u===26});
    lsign('지하철 · 고투몰 ↓',105,17.5,2.87,4,.5,'+v',{bg:'#8a755b',fg:'#fff'});lsign('3층 꽃도매상가 ↑',20,59.5,2.87,3,.35,'-v',{bg:'#28604b',fg:'#fff'});
    });
    // Photo21: ticket desk left, curved oak ribs and vertical lamps right.
    // Seat alcoves are open to the 6m-wide ticket aisle; they do not form another shop wall.
    furnish(() => {
      K.hpoly('gb_tactile',rect(25,144.95,59,145.25),.027);
      for(let u=25.2;u<47.5;u+=.48){
        lbox(u,147.15,0,.085,.12,2.6,0x99734e,{solid:false});
        for(let k=0;k<8;k++){
          const a=k*PI/16,b=(k+1)*PI/16;
          const point=(t,du)=>{const[x,z]=W(u+du,147.15+.7*(1-Math.cos(t)));return[x,2.6+.7*Math.sin(t),z];};
          K.quad(0xb18c61,[point(a,-.043),point(a,.043),point(b,.043),point(b,-.043)],[0,-1,0]);
          // Side cheeks make the curved ribs legible along the hall axis.
          for(const du of [-.043,.043]){
            const inner=t=>{const p=point(t,du);p[1]-=.1;return p;};
            K.quad(0x99734e,[point(a,du),point(b,du),inner(b),inner(a)],[du<0?-A[0]:A[0],0,du<0?-A[1]:A[1]]);
          }
        }
        lbox(u,150.1,3.22,.085,4.5,.08,0xb18c61,{solid:false});
      }
      for(const u of [26.7,33.9,41.1,47]){
        lbox(u,147.05,.15,.065,.065,2.48,'emit',{solid:false});
        lbox(u+.13,147.3,.15,.11,.3,2.65,'gb8_foliage',{solid:false});
      }
      lbox(36,140.7,3.62,20,.04,.035,'emit',{solid:false});
      for(const v of [137.1,145.8])lbox(44.5,v,4.63,40.7,.08,.035,'emit',{solid:false});
      for(const u of [30.5,38.5,46.3]){
        lbox(u,146.9,.05,.58,.26,2.65,0x252829,{solid:false});
        lsign(['승차권 예매','경부선 · 영동선','모바일 승차권'],u,146.74,1.47,.48,2.22,'-v',{bg:'#1268ad',fg:'#f0faf8'});
        lbox(u-2,149,.12,3.2,1.15,.36,0x2f3231);lbox(u-2,149.42,.48,3.2,.25,.45,0xc86731,{solid:false});
        lperson(u-1.5,148.85,.12,{sit:true,shirt:0x3b495b});
      }
      for(const [u,v] of [[27,143],[31,144],[35,142.8],[39,144.3],[43,142.9],[46,144],[50,148],[54,147.4]])lperson(u,v,0);
      // Photo32: high white ventilation louvres above the long aisle.
      for(let y=.5;y<3.1;y+=.055)lbox(67.08,98.5,y,.06,7,.018,0xb5b6ad,{solid:false});

    });
    buildOfficialHallRetail();
    ldetail({floor:'1F',y0:0,y1:9.5,poly:P,name:'1F 대합실 · 매표 · 상점 · 좌석'}, () => { for(const draw of detail)draw(); });
  }

  function buildOfficialHallRetail(){
    // Round 10: operator directory numbers are kept separate from platform numbers.
    // Their exact metric locations are a schematic-to-OSM mapping, not a survey.
    const utilityUnits=[
      ['복권/담배',12],['물품보관소',13],['이마트24(1호)',14],['파스쿠찌',15],
      ['드림로또',19],['로또앤담배',20],['아메리칸트레일러',22],
      ['이마트24(4호)',23],['고속터미널약국',24],
    ];
    for(const [i,[name,no]] of utilityUnits.entries()){
      const a=37+i*7,b=a+7,v=(a+b)/2;
      lwall(4,a,17,a,0,3.3,{mat:0xe5dfd2,thick:.12});
      lwall(4,b,17,b,0,3.3,{mat:0xe5dfd2,thick:.12});
      lwall(17,a,17,b,0,3.3,{mat:doorGlass,thick:.04,openings:[{at:3.5,w:2.3,y0:0,y1:2.6}]});
      lzone(name,'1F',`본관 ${no}호`,4,a,17,b,0,3.4,4);
    }
    const ur=[34,6,66,23],stairHole=rect(35.5,8,40.5,20);
    for(const y of [0,6]){
      for(const [u0,v0,u1,v1] of [[34,6,66,6],[34,6,34,23]])lwall(u0,v0,u1,v1,y,y+4.7,{mat:0xf0efeb,thick:.15});
      lwall(66,6,66,23,y,y+4.7,{mat:doorGlass,thick:.045,openings:[{at:9,w:6,y0:y,y1:y+3.2}]});
      lwall(34,23,66,23,y,y+4.7,{mat:0xf0efeb,thick:.12,openings:[{at:16,w:3.6,y0:y,y1:y+3.2}]});
      K.hpoly({tex:'wood',color:0xf0e5ce,gloss:.3},rect(...ur),y+.018,true,y===6?[stairHole]:[]);
      K.hpoly(0xf3f2ef,rect(...ur),y===0?5.7:10.7,false,y===0?[stairHole]:[]);
      lzone('유니클로 서울고속버스터미널점',y===0?'1F':'2F',y===0?'본관 35호 · 남성 · 여성':'매장 내부 2층 · 남성 · 여성 · 키즈 · 베이비',...ur,y,y===0?6:11,6);
    }
    lstairs(38,8,38,20,{ya:0,yb:6,w:4.4,mat:0xe6e2d9,steps:36,rails:true});
    for(const u of [35.5,40.5])lwall(u,8,u,20,6,7.1,{mat:doorGlass,thick:.05});
    lwall(35.5,8,40.5,8,6,7.1,{mat:doorGlass,thick:.05});
    for(const u of [35.5,40.5])lbox(u,14,7.07,.055,12,.055,0x8c9290,{solid:false});
    lspawn('유니클로 1층',62,15,0,-1,0);lspawn('유니클로 매장 2층',61,15,6,-1,0);
    // Restrooms sit at both ends of the main hall, as the official F1 map shows.
    for(const [a,b,c,d] of [[4,6,19,12],[4,130,12,137]]){
      lwall(a,b,c,b,0,3.2,{mat:0xddd9cc,thick:.14});
      lwall(a,b,a,d,0,3.2,{mat:0xddd9cc,thick:.14});
      lwall(a,d,c,d,0,3.2,{mat:0xddd9cc,thick:.14});
      lwall(c,b,c,d,0,3.2,{mat:0xddd9cc,thick:.14,openings:[{at:(d-b)/2,w:2,y0:0,y1:2.6}]});
      lzone('화장실','1F','본관 대합실',a,b,c,d,0,3.3,4);
    }
    ldetail({floor:'1F',y0:0,y1:6,poly:WEST,name:'공식 본관 매장 · 편의시설'},()=>{
      for(const [i,[name,no]] of utilityUnits.entries()){
        const a=37+i*7,v=a+3.5;
        lbox(17.06,v,2.6,.18,6.9,.65,name==='고속터미널약국'?0x33775f:0x48423a,{solid:false});
        lsign(name,17.17,v,2.94,6.2,.42,'+u',{bg:null,fg:'#fff'});
        lsign(`본관 ${no}호`,17.18,a+.65,2.54,.9,.16,'+u',{bg:'#eeeadd',fg:'#514d44'});
        lbox(11,v,0,.85,3.2,.98,0xd5c6ac);lbox(11,v,1,.96,3.25,.05,0x444e4b,{solid:false});
        lbox(11.46,v+.6,1.05,.05,.42,.35,0x313a3d,{solid:false});
        lsign('결제',11.5,v+.6,1.23,.3,.18,'+u',{bg:'#cbdedc',fg:'#263b38'});
        for(const u of [5.1,8]){
          lbox(u,v,0,.65,5.8,2.15,0xe9e4d7,{side:'gb_shelf'});
          for(let h=.4;h<2;h+=.4)lbox(u+.35,v,h,.025,5.7,.04,0xf1ece2,{solid:false});
        }
        if(name==='물품보관소'){
          for(let j=0;j<5;j++)for(let k=0;k<3;k++){
            lbox(5.2,a+.7+j*1.1,.15+k*.65,.7,1.04,.6,0xc5c5ba);
            lbox(5.56,a+.85+j*1.1,.37+k*.65,.025,.12,.065,0x3e4645,{solid:false});
          }
        }
        if(name==='고속터미널약국')lsign('약',17.21,v,1.65,1.1,1.1,'+u',{bg:'#f7f5e9',fg:'#278164'});
        lbox(10,v,3.19,.6,4,.04,'emit',{solid:false});
      }
      for(const [u,v] of [[19,9],[12,133.5]]){
        lsign('화장실',u+.12,v,2.72,2.7,.35,'+u',{bg:'#3e5c6a',fg:'#fff'});
        lbox(u-2.2,v,0,1,.65,.82,0xe9e9e4);lbox(u-2.2,v,.82,1.1,.73,.06,0xd9e2dc,{solid:false});
        lbox(u-2.4,v,1.12,.04,.72,.75,doorGlass,{solid:false});
      }
      // Luggage service is photographed at the UNIQLO door, not inside the B1 store.
      lbox(67.4,8.2,0,1.45,2.6,1.02,0xddd8cd);lbox(67.4,8.2,1.02,1.5,2.7,.06,0x535f64,{solid:false});
      lsign('짐캐리',68.18,8.2,.63,2.2,.4,'+u',{bg:'#294e74',fg:'#fff'});
      for(let k=0;k<4;k++){lbox(67,6.5+k*.43,0,.5,.32,.75,[0x413d48,0x385e73,0xa18663,0x585b55][k]);lbox(67,6.5+k*.43,.75,.08,.12,.15,0x777d7d,{solid:false});}
      for(const [i,name] of ['KB국민은행','신한은행','하나은행','NH농협은행'].entries()){
        const v=139.2+i*1.4;lbox(7.5,v,0,.8,1.1,1.85,0xe5e3d9);lsign(name,7.94,v,1.61,.96,.2,'+u',{bg:'#355e76',fg:'#fff'});lsign('현금자동입출금',7.95,v,1.14,.7,.4,'+u',{bg:'#9ac2cd',fg:'#253b44'});
      }
    });
    for(const y of [0,6])ldetail({floor:y===0?'1F':'2F',y0:y,y1:y===0?6:11,poly:rect(...ur),name:`유니클로 ${y===0?'1층':'2층'} 의류 진열`},()=>{
      const cols=[0xe9e6dc,0x364961,0xc4af96,0x6e7b69,0xb67868,0x2e3236];
      // Low folded-garment tables and slim hanging rails leave a complete central aisle.
      for(const u of [44.5,52,60])for(const v of [9,20]){
        lbox(u,v,y,.85,3.6,.12,0xd5c6ab);lbox(u,v,y+.12,.045,3.45,1.7,0xb7b9b3,{solid:false});
        for(const dv of [-1.7,1.7])lbox(u,v+dv,y+.12,.045,.045,1.75,0x89918f,{solid:false});
        lbox(u,v,y+1.8,.055,3.5,.055,0x89918f,{solid:false});
        for(let k=0;k<12;k++){
          const vv=v-1.53+k*.278;
          lbox(u,vv,y+.7,.58,.18,.95,cols[k%cols.length],{solid:false});
          lbox(u,vv,y+1.64,.42,.018,.035,0x7b7369,{solid:false});
          lbox(u,vv,y+1.68,.025,.025,.12,0x7b7369,{solid:false});
        }
      }
      for(const u of [46,56]){
        lbox(u,16.5,y,3.2,1.4,.74,0xd7c6aa);
        for(let k=0;k<6;k++)for(let h=0;h<4;h++)lbox(u-1.2+k*.48,16.5,y+.75+h*.065,.41,1.05,.06,cols[(k+h)%cols.length],{solid:false});
        lsign(y===0?'남성 · 여성':'키즈 · 베이비',u,17.26,y+1.05,2.1,.3,'+v',{bg:'#f2eee4',fg:'#333832'});
      }
      for(let u=42;u<65;u+=2.4){
        lbox(u,6.5,y,2.2,.5,2.6,0xe7dfd0);
        for(let h=.3;h<2.6;h+=.42){lbox(u,6.8,y+h,2.2,.6,.035,0xbcae93,{solid:false});for(let k=0;k<5;k++)lbox(u-.86+k*.43,6.8,y+h+.04,.38,.43,.23,cols[(k+Math.round(h*10))%cols.length],{solid:false});}
      }
      for(const u of [44,52,60])for(const v of [8,14,21]){
        lbox(u,v,y===0?5.66:10.65,3.8,.12,.045,'emit',{solid:false});
        lbox(u,v,y+3.2,1.25,.035,.4,0xf5f2ea,{solid:false});
      }
      lbox(64.6,10.5,y,1.15,3.4,.95,0xe6e0d4);lbox(64.6,10.5,y+.95,1.2,3.5,.05,0xc4b394,{solid:false});
      for(const v of [9.5,11.5]){lbox(64.1,v,y+1,.16,.5,.35,0x343b3b,{solid:false});lsign('셀프계산대',63.99,v,y+1.22,.45,.2,'-u',{bg:'#d6dfdf',fg:'#334441'});}
      lsign('UNIQLO',66.13,15,y+(y===0?2.72:3.84),y===0?1:3.6,y===0?.8:1.15,'+u',{bg:'#ed1724',fg:'#fff'});
      lsign('유니클로',66.14,19,y+3.7,2.5,.55,'+u',{bg:null,fg:'#242627'});
      lsign(y===0?'매장 2층 ↑  키즈 · 베이비':'매장 1층 ↓  계산대',40.7,14,y+2.5,3.7,.4,'+u',{bg:'#f3f0e8',fg:'#333'});
      for(const [u,v] of [[48,13],[58,14]])lperson(u,v,y,{shirt:0xc5baa6,pants:0x414647});
    });
    // Annex 2F has its own 4.2m floor. The existing eastern core and lift reach it.
    const foodUnits=[['달리나인',1],['온정',2],['고향의 맛',3],['티하우스레몬',4],['군산오징어',5],['샤브촌by계백집',6],['할리스커피',7],['시래마을',8],['청년커피랩',9]];
    for(const [i,[name,no]] of foodUnits.entries()){
      const a=130+i*13,b=a+13;
      for(const u of [a,b])lwall(u,2,u,13,NORTH_2F,7.9,{mat:0xe3ded2,thick:.12});
      lwall(a,13,b,13,NORTH_2F,7.9,{mat:doorGlass,thick:.045,openings:[{at:6.5,w:4,y0:NORTH_2F,y1:7.1}]});
      lzone(name,'2F',`부속상가 ${no}호`,a,2,b,13,NORTH_2F,NORTH_ROOF,4);
    }
    for(const [i,name] of ['금호(속리산)','오피스','천일사무실','천일영업소','동양영업소','브레드가든'].entries()){
      const a=282+i*5.3,b=a+5.3;
      for(const u of [a,b])lwall(u,2,u,13,NORTH_2F,7.9,{mat:0xe6e2da,thick:.12});
      lwall(a,13,b,13,NORTH_2F,7.9,{mat:0xe6e2da,thick:.12,openings:[{at:2.65,w:1.6,y0:NORTH_2F,y1:6.8}]});
      lzone(name,'2F','부속상가',a,2,b,13,NORTH_2F,NORTH_ROOF,4);
    }
    ldetail({floor:'2F',y0:NORTH_2F,y1:NORTH_ROOF,poly:rect(130,2,314,22),name:'공식 부속상가 2층 식당가'},()=>{
      for(const [i,[name,no]] of foodUnits.entries()){
        const a=130+i*13,u=a+6.5,y=NORTH_2F;
        lbox(u,13.08,y+2.7,12.9,.18,.65,0x68533b,{solid:false});lsign(name,u,13.2,y+3.02,10.6,.47,'+v',{bg:null,fg:'#fff'});
        lbox(u,4.1,y,10.5,.85,1,0xc3b08c);lbox(u,4.1,y+1,10.6,1,.06,0x515951,{solid:false});
        for(let k=0;k<4;k++)lsign(['메뉴 안내',name],u-4+k*2.7,3.6,y+2.05,2.5,.72,'+v',{bg:'#e8dfcc',fg:'#39463e'});
        for(const du of [-3.2,3.2])for(const v of [7.1,10.4]){
          lbox(u+du,v,y+.74,1.25,1,.06,0xb79a6b);lbox(u+du,v,y,.08,.08,.74,0x454b48,{solid:false});
          for(const dv of [-.86,.86]){lbox(u+du,v+dv,y+.43,.6,.55,.07,0x7d6251);lbox(u+du,v+dv+(dv<0?-.25:.25),y+.5,.6,.06,.43,0x7d6251,{solid:false});}
        }
        lbox(u,8,y+3.67,4,.25,.04,'emit',{solid:false});
      }
      for(const [i,name] of ['금호(속리산)','오피스','천일사무실','천일영업소','동양영업소','브레드가든'].entries()){
        const u=284.65+i*5.3;lsign(name,u,13.13,NORTH_2F+2.8,4.8,.38,'+v',{bg:'#5e695f',fg:'#fff'});
        lbox(u,5,NORTH_2F,3.3,.8,.75,0xc5baa4);lbox(u,3,NORTH_2F,3.8,.5,2.2,0xdad5c8,{side:'gb_shelf'});
      }
      lsign('2층 식당가 · 할리스커피',259,18,7.05,5.2,.48,'+u',{bg:'#42675d',fg:'#fff',twoSided:true});
    });
  }

  function buildBasement(){
    const poly=[[0,0],[284,0],[284,30],[75.7,30],[75.7,159],[0,159]].map(q=>W(...q)),y=LEVELS.B1;
    const lobby=rect(244,.2,282,8.15),store=rect(142.15,8.15,281.85,29.8);
    K.texture('gb_b1_granite',128,128,(g,w,h)=>{
      g.fillStyle='#b8b6af';g.fillRect(0,0,w,h);const r=K.rand(1818);
      for(let i=0;i<1900;i++){g.fillStyle=i%3?'#d0cec6':'#8c8b84';g.fillRect(r()*w,r()*h,1,1);}
      g.fillStyle='#8e8e87';g.fillRect(0,0,w,1);g.fillRect(0,0,1,h);
    },[.6,.6]);
    K.texture('gb7_daiso_circles',256,256,(g,w,h)=>{
      g.fillStyle='#c8102e';g.fillRect(0,0,w,h);g.strokeStyle='#f5f1e8';g.lineWidth=10;
      for(const [x,z,r] of [[45,30,24],[173,104,32],[69,204,36],[253,235,46]]){g.beginPath();g.arc(x,z,r,0,PI*2);g.stroke();}
    },[2.5,2.5]);
    K.texture('gb8_b1_stone',128,128,(g,w,h)=>{
      g.fillStyle='#b9b6ad';g.fillRect(0,0,w,h);const r=K.rand(8034);
      for(let i=0;i<2100;i++){g.fillStyle=i%3?'#d3d0c8':'#929087';g.fillRect(r()*w,r()*h,1,1);}
    },[.6,.6]);
    K.material('gb_b1_gloss',new K.THREE.MeshPhongMaterial({color:0xffffff,vertexColors:true,shininess:85,specular:0x777777}));
    K.material('gb_daiso_glass',new K.THREE.MeshLambertMaterial({color:0xf2f6f6,transparent:true,opacity:.15,depthWrite:false,side:K.THREE.DoubleSide}));
    const gloss={color:0xe8e7e1,gloss:.7},daisoGlass='gb_daiso_glass';
    const approachDip=rect(244,4.9,262,8);
    K.slab(poly,y,{mat:{tex:'gb_b1_granite',gloss:.5},under:false,holes:[...holes(poly,y),approachDip]});
    lstairs(244,6.45,250,6.45,{ya:y,yb:y-1.5,w:3.1,steps:9,mat:0xb5b0a6,rails:true});
    K.slab(rect(250,4.9,256,8),y-1.5,{mat:{tex:'wood',color:0x75624b,gloss:.5},thick:.15});
    lstairs(256,6.45,262,6.45,{ya:y-1.5,yb:y,w:3.1,steps:9,mat:0xb5b0a6,rails:true});
    for(const v of [4.9,8])lwall(244,v,262,v,y-1.5,y,{mat:0xe5dfd0,thick:.08});
    lzone('한가람문구 · 다이소 연결 복도','B1','단차 계단 · 목재 바닥',244,4.9,262,8,y-1.5,y+3.05,6);
    const j=W(125.9,0),g4=W(148,0);
    K.polyWalls(poly,y,-.3,{mat:0xe8e6df,thick:.25,openings:[{x:j[0],z:j[1],w:8.8,y0:y,y1:y+3.6},{x:g4[0],z:g4[1],w:6,y0:y,y1:y+3.2}]});
    for(const r of [[244,.2,282,4.9],[262,4.9,282,8.15],[244,8,262,8.15]])K.hpoly(gloss,rect(...r),y+.009);K.hpoly(gloss,store,y+.009);
    const cove=Array.from({length:48},(_,k)=>W(134+2.1*Math.cos(k*PI/24),5+1.35*Math.sin(k*PI/24)));
    K.hpoly('gb_acoustic',poly,y+3.05,false,[...holes(poly,0),cove]);
    K.hpoly(0xe6f2f2,cove,y+3.4,false);for(const r of [[244,.2,282,7],[244,7,272.3,8.15],[275.7,7,282,8.15]])K.hpoly(0xf1f0ea,rect(...r),y+3.025,false);
    columns(poly,y,3.03,(u,v)=>u>140||Math.abs(v-6)<1.5||u<26||u>57);
    // J2 is an eight metre corridor at the exact shared world coordinates.
    const zG=x=>-152.37-.3733*(x-107.2)-.3,zF=x=>-59.24-.37993*(x-2.3);
    const cp=[[116,zG(116)],[124,zG(124)],[124,zF(124)],[116,zF(116)]];
    K.slab(cp,y,{mat:'gb_b1_granite',under:false});K.hpoly('gb_acoustic',cp,y+3.6,false);
    for(const x of [116,124])K.wall(x,zG(x),x,zF(x),y,y+3.6,{mat:0xe4e0d6,thick:.22});
    K.zone({name:'터미널 지하상가',floor:'B1',sub:'다이소 · 상가 · 고속터미널역 연결',poly,y0:y,y1:0,priority:1});
    K.zone({name:'고투몰 ↔ 경부선 연결통로',floor:'B1',sub:'지하철 연결',poly:cp,y0:y,y1:y+3.6,priority:3});
    lzone('다이소 강남고속버스터미널점','B1','1 문구·시즌 · 2 미용·인테리어 · 3 주방·욕실',142,8,282,30,y,0,4);
    lzone('다이소 2번 출입구 착지홀','B1','입구전용 · 4단 계단 · 회전문',206.5,.2,220,8,y,y+3.05,5);
    lzone('다이소 4번 출입구','B1','고투몰 방면 · 디즈니',145,0,151,8,y,0,5);
    lzone('다이소 1번 출입구 앞','B1','한가람문구 · 유리문 · 매장입구 안내',244,.2,282,8,y,y+3.05,3);
    lzone('대합실 연결 계단','B1','에스컬레이터 · 경부선 · 영동선',100,2,114,18,y,0,4);
    // Main stair beside the preserved escalator pair, with a real slab opening and guarding.
    lstairs(109.8,4,109.8,16,{w:2.5,ya:y,yb:0,mat:0xbcb5a7,steps:36,rails:true});
    for(const u of [108.4,111.2])lwall(u,4,u,16,y,1.05,{mat:0xa59e8d,thick:.12});
    lwall(108.4,4,111.2,4,0,1.05,{mat:doorGlass,thick:.06});
    for(const u of [103.1,107])lwall(u,4,u,16,y,0,{mat:0xc6bda9,thick:.12});
    // Round 10: a single long room with distinct public approaches; no middle fake shop door.
    lwall(142,8,142,30,y,y+3.04,{mat:0xf0eee8});
    lwall(282,8,282,30,y,y+3.04,{mat:0xf0eee8});
    for(const [a,b] of [[142,145],[151,206.5],[214.5,216],[220,270],[280,282]])
      lwall(a,8,b,8,y,y+3.04,{mat:0xf3f2ee,thick:.14});
    buildRound10BasementRetail(poly,y);
    buildRound10DaisoAccess(y);

    ldetail({floor:'B1',y0:y,y1:0,poly,name:'B1 상가·연결통로'},()=>{
      // Photos34/42: pale central tiles, darker shop-edge bands and short cross strips.
      // These are finish faces only; the existing slab/well/J2 collision geometry is unchanged.
      for(const [a,b] of [[142,179],[64,94]]){
        K.hpoly({color:0xe4e1d8,gloss:.5},rect(a,3,b,8.2),y+.011);
        if(a===142)K.hpoly({tex:'gb_b1_granite',gloss:.7},rect(a,1.88,160,9.23),y+.012);
        for(const [v0,v1] of [[1.88,3],[8.2,9.23]])K.hpoly('gb8_b1_stone',rect(a,v0,b,v1),y+.012);
        for(let u=a;u<b;u+=.6)lquadH(u,3,u+.009,8.2,y+.013,0xb7b3a9);
        for(let v=3;v<8.2;v+=.6)lquadH(a,v,b,v+.009,y+.013,0xb7b3a9);
        for(let u=a+4;u<b-1;u+=9)lquadH(u,3,u+.55,8.2,y+.014,0xaaa79e);
      }
      for(let u=31;u<283;u+=.6){if(blocked(u,5,1)||u>180&&u<246)continue;K.hpoly(0xc5c4bd,rect(u,.25,u+.018,9.2),y+3.035,false);}
      for(let v=.3;v<9;v+=.6)K.hpoly(0xc5c4bd,rect(31,v,179,v+.018),y+3.035,false);
      for(let u=36;u<281;u+=3.6)for(const v of [3,7.9]){
        if(blocked(u,v,1.4)||u>180&&u<246)continue;
        if(u>160&&u<180){
          lbox(u,v,y+3.005,.58,.58,.025,0xbec1bc,{solid:false});
          for(const du of [-.14,.14])for(const dv of [-.14,.14])lbox(u+du,v+dv,y+2.995,.23,.23,.018,'emit',{solid:false});
          continue;
        }
        lbox(u,v,y+2.96,2.2,.26,.055,0xb5b7b0,{solid:false});
        for(const dv of [-.075,.075])lbox(u,v+dv,y+2.945,2.08,.035,.025,'emit',{solid:false});
      }
      for(const [a,b] of [[64,102.7],[111.6,130],[142,160],[246,280]])K.hpoly('gb_tactile',rect(a,5.85,b,6.15),y+.016);
      for(const [a,b] of [[102.8,107.1],[108.5,111.1]])K.hpoly('gb_tactile',rect(a,2.8,b,3.4),y+.02);
      // Photo41 brown/beige stripe tiling, stainless panels, route board and yellow C marker.
      for(let h=0;h<6;h+=.48)for(const u of [103.025,103.175,106.925,107.075,108.325,108.475,111.125,111.275])lwall(u,4,u,16,y+h,y+Math.min(6,h+.48),{mat:Math.round(h/.48)%2?0xd3cbb8:0x816658,thick:.018,solid:false});
      // Photo40: granite opening jambs, rolled shutter housing and stainless escalator noses.
      for(const u of [102.75,111.6]){
        lbox(u,4.05,y,.52,.42,3.04,'gb8_b1_stone',{solid:false});
        lbox(u,3.81,y,.55,.035,.13,0x3b3a36,{solid:false});
      }
      lbox(107.17,4.07,y+2.79,9.35,.46,.23,0xbfc0b9,{solid:false});
      for(const h of [2.83,2.91,2.99])lbox(107.17,3.82,y+h,9.35,.035,.026,0x737a77,{solid:false});
      for(const u of [103.52,104.78,105.22,106.48]){
        lbox(u,3.56,y+.16,.1,.85,.68,0xa8afac,{solid:false});
        for(let k=0;k<10;k++){
          const a=PI/2+k*PI/10,b=PI/2+(k+1)*PI/10;
          const p=(r,t)=>{const[x,z]=W(u,3.62+r*Math.cos(t));return[x,y+.53+r*Math.sin(t),z];};
          K.quad(0x202724,[p(.49,a),p(.49,b),p(.42,b),p(.42,a)],[A[0],0,A[1]]);
          K.quad(0x202724,[p(.49,a),p(.49,b),p(.42,b),p(.42,a)],[-A[0],0,-A[1]]);
        }
      }
      for(const u of [104.15,105.85]){
        lquadH(u-.5,3.05,u+.5,4,y+.025,0xa2a6a1);
        for(let v=3.09;v<3.96;v+=.065)lquadH(u-.48,v,u+.48,v+.018,y+.027,0x6b716e);
        lfloorText(u<105?'↑':'↓',u,2.68,y+.032,.5,.45,'+v',{fg:'#e8cb36'});
      }
      for(const u of [103.1,107,108.4,111.2])lbox(u,10,.99,.06,12,.07,0x8c9393,{solid:false});
      lbox(112.15,4.02,y,.48,.08,2.65,0xdbc72d,{solid:false});
      lsign(['C','1','8','8-1','8-2'],112.15,3.96,y+1.42,.42,2.35,'-v',{bg:'#e9cd27',fg:'#292c25',padding:.04});
      lbox(114.45,4.05,y+1.17,3.45,.12,1.52,0xd5d1c5,{solid:false});
      lsign(['고속버스터미널  ↗','경부선   부산  대구  마산  진주','울산  포항  대전  천안  청주','영동선   속초  강릉  동해  삼척','원주  제천  여주  이천'],114.45,3.96,y+1.93,3.25,1.42,'-v',{bg:'#f5f3ee',fg:'#263f72',padding:.035});
      lsign('비상구 →',111.27,5,y+.48,.72,.3,'+u',{bg:'#168568',fg:'#fff'});
      lbox(102,2.5,y,.58,.5,1.85,0xef762d);lbox(102,2.23,y+.1,.47,.035,1.72,0xf3f1e9,{solid:false});lsign(['상품권','환전 안내'],102,2.22,y+1.4,.48,.56,'-v',{bg:'#f8f4e9',fg:'#c56b32'});
      lbox(102,2.205,y+.75,.4,.035,.52,0x233d57,{solid:false});
      lbox(102,2.18,y+.84,.31,.025,.31,0x8cb6ce,{solid:false});
      lbox(102,2.18,y+.5,.34,.04,.08,0x414946,{solid:false});
      lsign('WOWPASS',102,2.2,y+1.76,.51,.17,'-v',{bg:'#243c68',fg:'#fff',pxPerM:160});
      lbox(101.23,2.5,y,.58,.53,1.93,0x233c6b,{solid:false});
      lsign(['환전','안내'],101.23,2.2,y+1.6,.42,.4,'-v',{bg:'#243c68',fg:'#fff'});
      lbox(101.23,2.21,y+.9,.37,.035,.4,0x99b8ca,{solid:false});
      // Photographed blue/ochre signs hang below a visible stem pair.
      for(const [u,face,text,bg] of [[99,'-u','경부선 · 영동선  고속버스터미널 →','#2863a2'],[131,'+u','← 고투몰 · 고속터미널역','#2863a2'],[159,'-u','다이소 · 경부선 · 영동선 →','#a08d72'],[253,'+u','← 다이소 · 지하철','#2863a2']]){
        for(const v of [4,6])lbox(u,v,y+2.72,.028,.028,.32,0x464a48,{solid:false});
        lsign(text,u,5,y+2.48,3.2,.48,face,{bg,fg:'#fff',twoSided:true,box:.07,offset:.06});
      }
      lsign('나가는 곳 ↑',109.8,2.8,y+2.5,2.1,.42,'-v',{bg:'#e9c630',fg:'#282b23'});
      // Photo42: recessed oval cove, with a white lip and pale liner above the acoustic ceiling.
      for(let k=0;k<48;k++){
        const a=k*PI/24,b=(k+1)*PI/24;
        const at=(ru,rv,t,h)=>{const[x,z]=W(134+ru*Math.cos(t),5+rv*Math.sin(t));return[x,y+h,z];};
        K.quad('emit',[at(2.08,1.33,a,3.15),at(2.08,1.33,b,3.15),at(2.08,1.33,b,3.32),at(2.08,1.33,a,3.32)],[0,-1,0]);
        K.quad(0xf1f0ea,[at(2.1,1.35,a,3.03),at(2.1,1.35,b,3.03),at(2.1,1.35,b,3.4),at(2.1,1.35,a,3.4)],[0,-1,0]);
        K.quad(0xf2f0e9,[at(2.04,1.29,a,3.025),at(2.04,1.29,b,3.025),at(2.3,1.55,b,3.025),at(2.3,1.55,a,3.025)],[0,-1,0]);
      }
      for(const [du,dv] of [[-.7,0],[.7,0],[0,-.6],[0,.6]])lcyl(134+du,5+dv,y+3.36,.1,.02,'emit',{solid:false,seg:10});
      lsign('영동선 | 경부선  →   화장실',130.5,5,y+2.52,4.1,.48,'-u',{bg:'#a3907b',fg:'#fff',twoSided:true});
      for(const v of [3.5,6.5])lbox(130.5,v,y+2.77,.025,.025,.28,0x85867f,{solid:false});
      // The photograph has an angled tactile junction, not a continuous stripe through the shop arcade.
      lquadH(130,5.85,139,6.15,y+.017,'gb_tactile');lquadH(138.7,6.15,139,9.1,y+.017,'gb_tactile');
      for(const u of [133,137,140]){
        lbox(u,9.06,y,.15,.12,3.04,0xf1efea,{solid:false});
        lbox(u,9,y,.18,.15,.12,0x373b39,{solid:false});
      }
      lbox(136.2,8.87,y+.28,1.08,.16,2.27,0x343d43,{solid:false});
      lsign(['경부선 · 영동선','승차홈 안내','부산   대구   대전','강릉   속초   원주'],136.2,8.76,y+1.58,.96,1.63,'-v',{bg:'#d8edf4',fg:'#27455f'});
      for(let u=70;u<176;u+=12){
        if(blocked(u,5,1))continue;
        lbox(u,5,y+3.005,.58,.58,.025,0xb5b6ae,{solid:false});
        for(let d=-.23;d<=.23;d+=.065)lbox(u+d,5,y+2.991,.024,.46,.016,0x7c827c,{solid:false});
        lcyl(u+2,5,y+2.99,.065,.035,0xf1eee5,{solid:false,seg:8});
      }
      // The earlier anonymous repeated shop row occupied the long Daiso room.
      // Its photographed stationery frontage and fixtures are rebuilt beside Gate 1 below.
      for(let z=zG(120)+4;z<zF(120)-2;z+=4.8)K.box({x:120,z,y:y+3.55,w:1.2,d:.5,h:.025,mat:'emit',solid:false});
      K.sign(['고속터미널역 · 고투몰','3·7·9호선'],{x:120,z:zF(120)-2,y:y+2.9,w:4,h:.65,rotY:PI,bg:'#275773',fg:'#fff'});
      K.sign('경부·영동선 터미널',{x:120,z:zG(120)+2,y:y+2.9,w:4,h:.55,bg:'#275773',fg:'#fff'});
      for(const [u,v] of [[153,5.2],[169,6.9],[96,5.2],[128,6.9],[252,5]])lperson(u,v,y,{shirt:0x586869,pants:0x242b30});
    });

    ldetail({floor:'B1',y0:y,y1:y+3.05,poly:rect(142,8,282,30),name:'B1 다이소 긴 매장'},()=>{
      // Round 15: white-grey polished tiles and white steel gondolas in the video aisle.
      K.hpoly({color:0xecebe6,gloss:.5},rect(142.15,8.15,281.85,29.8),y+.0105);
      for(let u=142.15;u<282;u+=.6)lquadH(u,8.15,u+.012,29.8,y+.011,0xb6b6ae);
      for(let v=8.15;v<30;v+=.6)lquadH(142.15,v,281.85,v+.012,y+.011,0xb6b6ae);
      for(let u=142.15;u<282;u+=.6)if(!blocked(u,14,1))K.hpoly(0xc4c3bd,rect(u,8.15,u+.018,29.8),y+3.043,false);
      for(let v=22;v<30;v+=.6)K.hpoly(0xc4c3bd,rect(142.15,v,281.85,v+.018),y+3.043,false);
      // Continuous twin fluorescent tubes and inset round ventilation grilles.
      for(let u=143.5;u<281;u+=2.4)for(const v of [9.3,10.65,12,13.5,15,16.5,18,19.3,20.6,24,27]){
        if(blocked(u,v,.5))continue;
        lbox(u,v,y+2.94,2.28,.25,.045,0xc6cac8,{solid:false,skip:['n','s','e','w','top']});
        for(const dv of [-.075,.075])lbox(u,v+dv,y+2.925,2.2,.035,.025,'emit',{solid:false,skip:['n','s','e','w','top']});
      }
      for(let u=151;u<281;u+=9)for(const v of [11,26])lcyl(u,v,y+3,.38,.025,0x858c87,{seg:16,solid:false});
    });
    // Keep the long store's fittings and two merchandise banks independently lazy.
    const stock=[0xf5f5f0,0xf06aa0,0xd8272d,0x2a7fd4,0x48ac9d,0xf2c200,0xb9dfed];
      // Ten paired gondola runs, 1.8m tall; the long cross-aisle is 3m clear at v13..16.
      function rack(u,v,len,idx){
        lbox(u,v,y,1.1,len,.13,0xf2f2f2);lbox(u,v,y+.13,.06,len-.05,1.85,0xe8ebea);
        for(let t=0;t<5;t++){
          const ty=y+.16+t*.36;lbox(u,v,ty,1.1,len,.04,0xf2f2f2,{solid:false});
          for(const side of [-1,1]){
            lbox(u+side*.54,v,ty+.045,.02,len,.06,0xf5c9d8,{solid:false});
            for(let n=0;n<Math.floor(len/.23);n++){
              const vv=v-len/2+.15+n*.23,col=stock[(idx+t+Math.floor(n/4))%stock.length];
              if((idx+t+n)%5===0){
                lcyl(u+side*.3,vv,ty+.05,.09,.21,0xf1ecdf,{solid:false,seg:8});
                lcyl(u+side*.3,vv,ty+.26,.095,.025,0xb59b72,{solid:false,seg:8});
              }else if((idx+t+n)%5===1){
                lbox(u+side*.3,vv,ty+.05,.39,.2,.2,0xbfa37c,{solid:false});
                for(const hh of [.09,.14,.19])lbox(u+side*.516,vv,ty+hh,.012,.19,.013,0xe1c89e,{solid:false});
              }else{
                lbox(u+side*.3,vv,ty+.05,.42,.2,.2+(n%3)*.025,col,{solid:false,skip:['bottom']});
                if(n%3===0)lbox(u+side*.52,vv,ty+.065,.012,.19,.065,idx%2?0xaec7d3:0xf4f2e8,{solid:false});
              }
              lbox(u+side*.516,vv,ty+.14,.009,.12,.075,0xf4f3ed,{solid:false,skip:['bottom','top']});
            }
          }
        }
      }
    ldetail({floor:'B1',y0:y,y1:y+3.05,poly:rect(183,8,243,30),name:'B1 다이소 중앙 진열'},()=>{
      for(let k=0;k<10;k++){
        const u=186.5+k*6;
        if(!blocked(u,11,1.2))rack(u,11,3.9,k);
        if(!blocked(u,18.7,1.2))rack(u,u===234.5?27:18.7,5.2,k+10);
        lsign(u>248?'문구 · 시즌':u>195?'미용 · 인테리어':'주방 · 욕실',u,24,y+2.48,1.3,.32,'-u',{bg:k%2?'#31778c':'#326846',fg:'#fff',twoSided:true});
        // Photo36: packed pegboard endcaps with yellow price strips and small hanging packages.
        // The PET STREET pegboard replaces the photographed front endcap.
        // Keep its earlier packaged stock on the far end of this same rack.
        for(const v of [12.96,u===234.5?29.62:16.08]){
          if(blocked(u,v,1.2))continue;
          for(let t=0;t<4;t++){
            lbox(u,v,y+.22+t*.36,1.03,.055,.055,0xe7cd54,{solid:false});
            for(let n=0;n<4;n++){
              lbox(u-.38+n*.25,v,y+.3+t*.36,.18,.065,.23,stock[(n+t+k)%stock.length],{solid:false});
              lbox(u-.38+n*.25,v+(v<14?.04:-.04),y+.33+t*.36,.13,.015,.11,0xf5f1e7,{solid:false});
            }
          }
        }
      }
    });
    ldetail({floor:'B1',y0:y,y1:y+3.05,poly:rect(142,8,282,30),name:'B1 다이소 출입구 진열 · 이용객'},()=>{
      for(const [k,u] of [154,160,166,172,178,250,256,262,268].entries()){
        if(!blocked(u,11,1.2))rack(u,11,3.9,k+20);
        if(!blocked(u,18.7,1.2))rack(u,u===256||u===262?19.9:18.7,5.2,k+30);
        rack(u,27,3.8,k+40);
      }
      // Round17: keep the photographed 3m aisle clear; preserve these promotional
      // islands on the rear cross-aisle instead of projecting into v13..16.
      for(const u of [166,202,226.2,238.2]){
        const v=23.2;
        lbox(u,v,y,1.25,.65,.15,0xc4ae87);
        for(let h=0;h<5;h++){
          lbox(u,v,y+.15+h*.34,1.25,.65,.035,0xe7e1d2,{solid:false});
          for(let k=0;k<5;k++){
            lbox(u-.48+k*.24,v,y+.19+h*.34,.21,.56,.26,h%2?0xe8eee8:0xa9c5d4,{solid:false});
            lbox(u-.48+k*.24,v+.32,y+.29+h*.34,.16,.018,.11,0xf1f0e6,{solid:false});
          }
          lbox(u,v+.34,y+.16+h*.34,1.2,.022,.065,h%2?0xf0de7c:0xbc2943,{solid:false});
        }
        lsign('다이소 추천상품',u,v+.36,y+1.96,1.15,.23,'+v',{bg:'#c32742',fg:'#fff'});
      }
      for(const u of [198,220,232]){
        lsign(['봄이 왔나봄','생활용품'],u,14.5,y+2.53,1.1,.65,'-u',{bg:'#e69bb3',fg:'#fff',twoSided:true});
        for(const v of [14.18,14.82])lbox(u,v,y+2.88,.015,.015,.15,0x989d96,{solid:false});
      }
      for(const [u,v] of [[205,15.2],[218,15.1],[227,14.9],[229.5,15.25]]){
        lperson(u,v,y,{shirt:Math.round(u)%2?0x485347:0xc2ad92,pants:0x31393c,rotY:FACE['+u']});
        lbox(u+.35,v,y+.5,.3,.2,.36,0xddc9aa,{solid:false});
        lwall(u+.21,v,u+.49,v,y+.83,y+.91,{mat:0x8b7e6b,thick:.018,solid:false});
      }
      for(const u of [155,159.2]){
        lbox(u+.4,9.7,y+.94,.5,.09,.38,0x282e31,{solid:false});
        lsign('계산대',u,9.7,y+2.3,1.6,.36,'-v',{bg:'#a89143',fg:'#fff'});
      }
      // Photo20's orange flowers and household baskets are displayed on the existing oak endcap.
      lcyl(258.5,12.62,y+1.2,.18,.28,0x8e6c42,{solid:false,seg:8});
      for(let k=0;k<9;k++){
        const u=258.5+.15*Math.cos(k*2.4),v=12.62+.14*Math.sin(k*2.4);
        lcyl(u,v,y+1.45,.012,.2,0x4a7043,{solid:false,seg:4});
        const[x,z]=W(u,v);K.dome({x,y:y+1.66,z,rx:.09,ry:.06,rz:.09,mat:k%2?0xde7429:0xe9aa42});
      }
      for(const u of [204.5,222.5,234.5]){
        lbox(u,19.8,y,.62,.62,3.03,0xc6cbc7,{solid:false});
        for(const du of [-.32,.32])lbox(u+du,19.8,y+.12,.012,.62,2.86,doorGlass,{solid:false});
        for(const dv of [-.32,.32])lbox(u,19.8+dv,y+.12,.62,.012,2.86,doorGlass,{solid:false});
        lbox(u,19.8,y,.65,.65,.1,0x626c65,{solid:false});
        lsign('생활용품',u,19.45,y+2.5,.58,.24,'-v',{bg:'#f3f0e5',fg:'#52645a'});
      }
      for(let u=183;u<245;u+=2.4){lbox(u,21.45,y,2.28,.55,2,0xe9e5da,{side:'gb_shelf'});}
      for(const u of [155,159.2]){lbox(u-.6,9.45,y+.93,.45,.16,.3,0x333a38,{solid:false});}
      lbox(262.6,9.5,y,.55,.48,1.25,0xf5f3eb);lsign(['상품검색','상품을 찾아보세요'],262.6,9.24,y+1.03,.48,.36,'-v',{bg:'#bce5e6',fg:'#26494b'});

      for(const [u,col] of [[183.6,0x4e96c5],[185.1,0xd994b4]]){
        lbox(u,26,y,.9,.9,.75,col);lbox(u,26,y+.75,.9,.9,1.15,daisoGlass,{solid:false});
        for(const du of [-.43,.43])for(const dv of [-.43,.43])lbox(u+du,26+dv,y+.75,.045,.045,1.15,col,{solid:false});
        lsign('인형뽑기',u,25.53,y+1.76,.7,.15,'-v',{bg:col===0x4e96c5?'#4e96c5':'#d994b4',fg:'#fff'});
        for(let k=0;k<6;k++)lbox(u-.26+k%3*.26,25.82+Math.floor(k/3)*.26,y+.77,.2,.2,.22,stock[k],{solid:false});
      }
      for(const [u,v] of [[248,24],[219.5,14.6],[229,14],[240,15.9],[197,14.8],[215,11]])lperson(u,v,y,{shirt:stock[Math.floor(u)%stock.length],pants:0x30383a});
      // Small groups along the 140m aisle, with gaps at gates and the close-up shelves.
      // They face their companions, merchandise and both walking directions.
      const coats=[0x364e6e,0xc84842,0xebe6dc,0x5a6a57,0xc69da6,0x343439];
      for(const [i,base] of [155,167,181,195,217,226,242,248,266,277].entries()){
        for(let n=0;n<3;n++){
          // _12 looks west from u250. Relocate the u248 group to u240 so its
          // closest member clears both the aisle and PET STREET close-up; keep all three people.
          const u=(base===248?240:base)+[0,1.05,1.85][n],v=[13.65,15.25,14.85][(n+i)%3];
          if(blocked(u,v,.45))continue;
          const face=n===1?'+v':i%2?'-u':'+u';
          lperson(u,v,y,{rotY:FACE[face],shirt:coats[(i+n)%coats.length],pants:n===2?0xa5a19b:0x343a40,h:1.64+(i+n)%3*.045});
          if(n===0){
            lbox(u+.27,v,y+.46,.25,.14,.34,0xd9cbb5,{solid:false});
            for(const du of [.2,.34])lbox(u+du,v,y+.8,.018,.018,.1,0x7e776b,{solid:false});
            lbox(u+.27,v,y+.89,.16,.018,.018,0x7e776b,{solid:false});
          }
          if(n===2&&i%2===0){
            const bu=u-.32,bv=v+.08;
            lbox(bu,bv,y+.35,.35,.24,.025,0xc72038,{solid:false});
            for(const du of [-.17,.17])lbox(bu+du,bv,y+.37,.025,.24,.2,0xda2946,{solid:false});
            for(const dv of [-.11,.11])lbox(bu,bv+dv,y+.37,.35,.025,.2,0xda2946,{solid:false});
            lbox(bu,bv,y+.61,.35,.018,.018,0x333b3d,{solid:false});
          }
        }
      }
      // Six red baskets parked at shelf ends, clear of the continuous walking lane.
      for(const u of [174,192.5,222.5,240.5,258,268]){
        lbox(u,16.55,y+.02,.42,.32,.035,0xc91e37,{solid:false});
        for(const du of [-.2,.2])lbox(u+du,16.55,y+.055,.025,.32,.23,0xdf2945,{solid:false});
        for(const dv of [-.15,.15])lbox(u,16.55+dv,y+.055,.42,.025,.23,0xdf2945,{solid:false});
        for(const du of [-.15,.15])lbox(u+du,16.55,y+.29,.015,.28,.015,0x3a3c3d,{solid:false});
      }
    });
  }
  function buildRound10BasementRetail(poly,y){
    // Official unit numbers are independent on each floor. Dimensions are fitted to
    // the retained OSM L, not measured from the operator's non-scale schematic.
    const units=[];
    const add=(name,no,r,face='+u',kind='food')=>units.push({name,no,r,face,kind});
    ['놀부부대찌개','홍수계찜닭','롤링핀','신촌설렁탕'].forEach((n,i)=>add(n,i+1,[4,126+i*7,17,133+i*7]));
    ['오니기리 와이규동','보승회관','얼큰수제비','용호동낙지','북창동 순두부'].forEach((n,i)=>add(n,i+5,[4,70+i*10,22,80+i*10]));
    ['서브웨이','신룽푸마라탕','퍼부어','오한수 우육면가','시마스시'].forEach((n,i)=>add(n,i+10,[31,70+i*10,43,80+i*10],'-u'));
    add('빽스',15,[43,27,56,35],'-u');add('나인블럭',16,[43,35,56,43],'-u');
    add('포레포레헤어 · 웸블리',17,[58,135,74,156],'-u','retail');add('펀비어킹',18,[58,112,74,135],'-u');
    add('신세계 팩토리 스토어',19,[58,47,74,110],'-u','fashion');
    ['밥장인','전주콩나물','놀부주방'].forEach((n,i)=>add(n,i+20,[30,4+i*7,43,11+i*7],'-u'));
    add('노브랜드',23,[4,4,24,32],'+u','market');
    ['입점 준비 중','이니스프리','네일&젤','제주스커피','123김밥','이마트24 5호점','입점 준비 중'].forEach((n,i)=>add(n,[24,25,26,27,28,'29·30',31][i],[58,3+i*6,74,9+i*6],'-u',i>2&&i<5?'food':'retail'));
    // Annex west pocket; a north-side approach runs behind the long Daiso room.
    add('미대오빠',33,[80,.3,96,4.6],'+v','retail');
    [['복권 · 담배',39],['에디슨',40],['진보석',41],['수연',42],['대림보석',43],['가챠샵','44·45']].forEach(([n,no],i)=>add(n,no,[158+i*7.8,.3,165.8+i*7.8,4.6],'+v','retail'));
    add('입점 준비 중','37·38',[100,9.4,102.5,21.5],'-u','retail');
    add('한가람문구','34·35·36',[244,.25,280,4.7],'+v','stationery');
    for(const unit of units){
      const {name,no,r,face}=unit,[a,b,c,d]=r,uc=(a+c)/2,vc=(b+d)/2;
      const isU=face.endsWith('u'),f=FDIR[face],fu=isU?(f[0]>0?c:a):uc,fv=isU?vc:d,span=isU?d-b:c-a;
      for(const [u0,v0,u1,v1,front] of [[a,b,c,b,false],[c,b,c,d,face==='+u'],[c,d,a,d,face==='+v'],[a,d,a,b,face==='-u']])
        lwall(u0,v0,u1,v1,y,y+3.02,{mat:front?doorGlass:name==='신세계 팩토리 스토어'?0x3a332e:0xe7e2d9,thick:front?.035:.13,openings:front?[{at:span/2,w:Math.min(name==='신세계 팩토리 스토어'?8.8:3.2,span-1),y0:y,y1:y+2.5}]:[]});
      lzone(name,'B1',`공식 ${no}호`,a,b,c,d,y,y+3.05,5);
    }
    ldetail({floor:'B1',y0:y,y1:y+3.1,poly,name:'본관 식당가 · 노브랜드 · 팩토리 · 한가람'},()=>{
      for(const unit of units){
        const {name,no,r,face,kind}=unit,[a,b,c,d]=r,uc=(a+c)/2,vc=(b+d)/2,isU=face.endsWith('u'),f=FDIR[face],fu=isU?(f[0]>0?c:a):uc,fv=isU?vc:d,span=isU?d-b:c-a;
        const col=kind==='stationery'?0x542b35:name==='노브랜드'?0xf2cc30:kind==='fashion'?0x282b29:0x674d3b;
        lbox(fu,fv,y+2.45,isU?.22:span,isU?(kind==='fashion'?10:span):.22,.55,col,{solid:false});
        lsign(kind==='fashion'?'SHINSEGAE FACTORY STORE':name,fu+f[0]*.15,fv+f[1]*.15,y+2.73,Math.min(span-.3,kind==='fashion'?8.5:10),.42,face,{bg:null,fg:kind==='fashion'?'#ff7557':name==='노브랜드'?'#222':'#fff',bold:kind!=='fashion',pxPerM:110});
        lsign(`${no}호`,fu+f[0]*.17,fv+(kind==='fashion'?5.2:0)+f[1]*.17,y+2.39,1,.16,face,{bg:'#eee9df',fg:'#4b4540'});
        if(name==='입점 준비 중')continue;
        if(kind==='food'){
          for(let v=b+1.5;v<d-1;v+=2.7)for(let u=a+2;u<c-2;u+=3.5){
            lbox(u,v,y+.73,1.25,.8,.06,{tex:'wood',color:0xad825b});
            for(const du of [-.42,.42])lbox(u+du,v,y,.06,.6,.73,0x48423c,{solid:false});
            for(const dv of [-.75,.75]){lbox(u,v+dv,y+.42,.45,.42,.06,0x775a40);lbox(u,v+dv*1.2,y+.48,.45,.06,.38,0x775a40,{solid:false});}
            lbox(u+.2,v,y+.8,.17,.15,.12,0xe8e2d7,{solid:false});
          }
          lbox(uc,b+.8,y,c-a-1,.7,.95,0xc1ac8a);lsign(['메뉴 안내',name],uc,b+1.2,y+1.9,Math.min(c-a-1,5),.6,'+v',{bg:'#f4eee3',fg:'#46382f'});
        }else if(kind==='fashion'){
          for(let v=b+3;v<d-2;v+=5)for(const railU of [61,70]){
            // Retain every garment rail behind the new photographed shelf frontage.
            const u=v>=70&&v<=85?(railU===61?68:72):railU;
            lbox(u,v,y+.08,.9,2.8,.12,0xb5a58e);lbox(u,v,y+1.55,.07,2.7,.05,0x707674,{solid:false});
            for(let k=0;k<10;k++)lbox(u,v-1.2+k*.26,y+.7,.48,.14,.8,[0xe5d3b6,0x546370,0x9f8d7d,0x242e38][k%4],{solid:false});
          }
        }else{
          const along=kind==='stationery';
          if(along){
            for(let u=a+1;u<c-1;u+=2){lbox(u,1.05,y,1.75,.55,2.15,0xd7d4ca,{side:'gb_shelf'});lbox(u,3.1,y,.75,1.3,1.65,0xd7d4ca,{side:'gb_shelf'});}
            for(let u=a+.5;u<c;u+=1.5){lbox(u,4.67,y,.075,.1,2.4,0xb7a58b,{solid:false});lsign(['문구 · 미술용품','한가람'],u,4.78,y+1.5,.65,.5,'+v',{bg:'#f4efe4',fg:'#623842'});}
            for(const h of [.04,.9,2.24])lbox(uc,4.7,y+h,c-a,.07,h===.9?.16:.055,h===.9?0xf1eee4:0xb7a58b,{solid:false});
            // The photographed rotating stationery stand and green delivery crate.
            lcyl(263.5,5.35,y+.1,.22,1.48,0x75736b,{solid:false,seg:8});
            for(let h=.3;h<1.6;h+=.25)for(let k=0;k<8;k++)lbox(263.5+.28*Math.cos(k*PI/4),5.35+.28*Math.sin(k*PI/4),y+h,.16,.09,.2,0xe2d5c6,{rot:-k*PI/4,solid:false});
            lbox(265,5.1,y,.72,.46,.32,0x235a42,{solid:false});
          }else{
            lbox(uc,b+.5,y,c-a-.5,.5,2.05,0xe5dfcf,{side:'gb_shelf'});
            for(let v=b+2;v<d-1;v+=3)lbox(uc,v,y,.8,1.8,1.5,0xd7cfbd,{side:'gb_shelf'});
          }
        }
        lbox(uc,vc,y+2.96,Math.min(c-a-1,3),.4,.03,'emit',{solid:false});
      }
      // Store directory takes precedence over the audit's station-side retail names.
      lsign(['지하 1층 식당가','놀부부대찌개 · 홍수계찜닭','노브랜드 · 신세계 팩토리 스토어'],20.5,129.4,y+2.5,4.6,.8,'+v',{bg:'#364333',fg:'#fff'});
      lsign(['고속터미널역 · 호남선 방면 →','ENTER-6 FASHION MALL','ABC-MART · ARTBOX · OLIVE YOUNG','타는 곳 9·7·3'],117,5,y+2.42,4.7,.95,'-u',{bg:'#1e3c52',fg:'#fff',twoSided:true});
      for(const [u,v,t] of [[69,48,'노브랜드 · 한가람문구 · 다이소 →'],[132,5,'한가람문구 · 다이소 1번 출입구 →'],[240,6,'한가람문구 →   다이소 1번 출입구 →']])lsign(t,u,v,y+2.55,4,.42,'-u',{bg:'#a08d72',fg:'#fff',twoSided:true});
      for(const u of [16.5,24.5])for(let k=0;k<3;k++)lbox(u,132+k*1.1,0,1.45,1.05,.22+k*.22,{tex:'wood',color:0xb28d62});
      lsign('지하 1층 식당가 ↓',20.5,144,2.55,4,.55,'+v',{bg:'#2d493d',fg:'#fff'});
      for(const [u,v,t] of [[70,86,'승차홈 1–16 · 매표소 ↑'],[22,130,'지하 1층 식당가 ↓'],[26,145,'식당가 · 지하철 연결 →']])lsign(t,u,v,2.75,4.4,.45,'+v',{bg:'#655549',fg:'#fff'});
    });
  }

  function buildRound10DaisoAccess(y){
    // Two ground-floor wells are real holes in both the slab and the city ground.
    for(const g of [{n:1,a:272.3,b:275.7,u:274},{n:2,a:206.5,b:214.5,u:210.5}]){
      for(const u of [g.a,g.b]){
        lwall(u,7,u,21,y,0,{mat:g.n===2?'gb7_daiso_circles':0xf3f1eb,thick:.1});
        lwall(u,7,u,21,0,1.05,{mat:doorGlass,thick:.06});
        lbox(u,14,1.03,.07,14,.06,0x8f9895,{solid:false});
      }
      lwall(g.a,7,g.b,7,0,1.05,{mat:doorGlass,thick:.06});
      if(g.n===1)lstairs(274,7,274,21,{ya:y,yb:0,w:2.9,steps:36,mat:0xc6c0b4,rails:true});
      else{
        lstairs(208.3,7,208.3,21,{ya:y+.6,yb:0,w:2.8,steps:36,mat:0xb4b1aa,rails:true});
        lesc(213.3,7,213.3,21,{ya:y+.6,yb:0,w:1.35,dir:'down'});
      }
      lzone(`다이소 ${g.n}번 출입구 계단`,'B1','대합실 · 지하 1층',g.a,7,g.b,21,y,0,6);
      lzone(`다이소 ${g.n}번 출입구`,'1F',g.n===1?'22번 승차홈 · 제주스커피 옆':'33·34번 승차홈 · 북촌손만두 뒤',g.a,21,g.b,24,0,3.3,6);
    }
    // GATE4 short Disney branch and the exact proposed module junction.
    for(const u of [145,151])lwall(u,0,u,8,y,y+3.05,{mat:0xf2f1e9,thick:.12});
    const x=140.6504,zF=x=>-59.24-.37993*(x-2.3);
    const cp=[[x-2.8,-132],[x+2.8,-132],[x+2.8,zF(x+2.8)],[x-2.8,zF(x-2.8)]];
    K.slab(cp,y,{mat:{tex:'darkstone',gloss:.3},under:false});K.hpoly('ceiling',cp,y+3.15,false);
    for(const xx of [x-2.8,x+2.8])K.wall(xx,-132,xx,zF(xx),y,y+3.15,{mat:0xbab6ab,thick:.15});
    K.zone({name:'고투몰 G11 · 다이소 연결통로',floor:'B1',sub:'다이소 4번 출입구',poly:cp,y0:y,y1:y+3.2,priority:5});
    // Entry-only GATE2: a short upper landing and three photographed tripod housings.
    // The turnstile plane is upstream of the main long aisle; no per-frame allocations.
    let prevV=NaN,prevU=NaN;
    K.onFrame((dt,t,p)=>{
      const u=(p.x-O[0])*A[0]+(p.z-O[1])*A[1],v=(p.x-O[0])*B[0]+(p.z-O[1])*B[1];
      if(!p.fly&&p.y<y+1.4&&p.y>y-.5&&u>206.7&&u<214.3&&prevU>206.7&&prevU<214.3&&prevV<=4&&v>4&&v-prevV<1){
        p.x+=B[0]*(3.97-v);p.z+=B[1]*(3.97-v);
      }
      prevV=v;prevU=u;
    });
    // Granite risers are circulation geometry, present before lazy furnishings load.
    K.slab(rect(206.7,6.5,214.3,7.05),y+.6,{mat:0xa5a49d,thick:.18});
    lstairs(210.5,6.5,210.5,5,{ya:y+.6,yb:y,w:7.6,steps:4,mat:0xa5a49d,rails:false});
    // The solid divider prevents a visual shortcut underneath the two flights.
    lwall(209.7,7,212.54,7,y,y+3.05,{mat:0xf2f0e9,thick:.1});
    ldetail({floor:'B1',y0:y,y1:3.3,poly:rect(142,0,282,30),name:'다이소 출입문 · 안내 · 계산대'},()=>{
      // Photographed 1F portals: service door + side stair at GATE1, patterned GATE2.
      for(const [n,u,a,b] of [[1,274,272.3,275.7],[2,210.5,206.5,214.5]]){
        for(const q of [a,b])lbox(q,21.15,0,.28,.25,2.85,0xc8102e,{solid:false});
        lbox(u,21.15,2.3,b-a,.28,.55,0xf4f2ed,{solid:false});
        lsign('다이소',u,21.32,2.58,Math.min(b-a-.5,3.4),.43,'+v',{bg:null,fg:'#c8102e'});
        lbox(a-.45,21.12,0,.65,.17,2.3,n===2?'gb7_daiso_circles':0xc8102e,{solid:false});
        lsign([`GATE ${n}`,n===1?'↙ B1':'B1 ↘'],a-.45,21.23,1.3,.58,.9,'+v',{bg:null,fg:'#fff'});
        for(const q of [a+.28,b-.28]){lbox(q,21.12,.03,.5,.028,2.2,doorGlass,{solid:false});lbox(q,21.15,.03,.045,.08,2.2,0xa8b0ac,{solid:false});}
        lquadH(a,21.2,b,21.7,.02,'gb_tactile');
        if(n===1){lbox(b+.85,21.05,0,1.2,.1,2.3,0x868c8e);lsign('관계자 외 출입금지',b+.85,21.12,1.5,.85,.3,'+v',{bg:'#eeece5',fg:'#625b51'});}
      }
      // Flush B1 entrance: two glass door sets and lit nameboards, mirror pier between.
      for(const u of [271.5,276.5]){
        for(const du of [-1.5,1.5])lbox(u+du,7.98,y,.15,.2,2.9,0xc8102e,{solid:false});
        lbox(u,7.98,y+2.66,3.15,.24,.28,0xc8102e,{solid:false});
        lbox(u,7.84,y+2.25,3,.17,.52,'emit',{solid:false});
        lsign('다이소',u+.2,7.72,y+2.51,2.3,.43,'-v',{bg:'#fff',fg:'#c8102e'});
        lsign('daiso',u-1.05,7.72,y+2.51,.48,.44,'-v',{bg:'#c8102e',fg:'#fff'});
        for(const du of [-1.25,1.25]){lbox(u+du,7.96,y,.45,.028,2.22,doorGlass,{solid:false});lbox(u+du,7.91,y,.05,.08,2.22,0xaab3b0,{solid:false});}
        for(const du of [-.65,.65])lfloorText('↑ 매장입구',u+du,7.15,y+.025,1.2,.33,'+v',{fg:'#303a36',bg:'#f4f0e8'});
        lfloorText('다이소',u,6.5,y+.021,2.4,.42,'+v',{fg:'#fff',bg:'#bd253c'});
        lsign(['국민가게','다이소'],u-1.8,7.8,y+1.55,.65,.9,'-v',{bg:'#244765',fg:'#fff'});
      }
      lbox(274,5.4,y,.75,.75,3.02,{color:0xb8c1bf,gloss:.7},{solid:false});
      for(const du of [-.38,.38])lbox(274+du,5.4,y+.1,.012,.75,2.87,doorGlass,{solid:false});
      for(const dv of [-.38,.38])lbox(274,5.4+dv,y+.1,.75,.012,2.87,doorGlass,{solid:false});
      // GATE4 rear glass front, oversized red daiso panel, mat and quiet registers.
      for(const u of [145,146.6,149.4,151])lbox(u,.15,y,.065,.1,3.02,0xb9c0bc,{solid:false});
      for(const [a,b] of [[145,146.5],[149.5,151]])lwall(a,.15,b,.15,y+.1,y+2.8,{mat:doorGlass,thick:.025});
      lsign('daiso',150.2,-.02,y+1.7,1.45,1.65,'-v',{bg:'#ba1635',fg:'#fff'});
      lsign(['GATE','4'],145.7,-.02,y+1.15,1,.9,'-v',{bg:null,fg:'#fff'});
      lfloorText('다이소',148,-.65,y+.022,2.7,.85,'+v',{bg:'#a5253c',fg:'#262525'});
      for(const [u,v] of [[145.5,2],[145.5,4],[145.5,6],[150.5,4],[150.5,6]])lbox(u,v,y,.45,1.4,1.4,0xf0d6c8,{side:'gb_shelf'});
      lsign('디즈니',148,6,y+2.35,2.4,.4,'-v',{bg:'#4c8b9f',fg:'#fff'});
      for(let zz=-129;zz<-114;zz+=4.5)K.box({x,z:zz,y:y+3.1,w:1.4,d:.45,h:.03,mat:'emit',solid:false});
      // Three checkout areas, with the most terminals at the terminal-side GATE1.
      for(const [base,count,v] of [[260,6,28.4],[223,3,28.4],[155,3,9.7]]){
        for(let i=0;i<count;i++){
          const u=base+i*2.1;lbox(u,v,y,1.45,.85,.93,0xe7e6df);lbox(u,v,y+.93,1.5,.92,.05,0xb5bbb6,{solid:false});
          lbox(u-.2,v,y+.98,.42,.3,.65,0xf2f1ed,{solid:false});lsign('결제',u-.2,v-.17,y+1.43,.34,.24,'-v',{bg:'#273a4a',fg:'#f1e05c'});
          lsign(String(i+1),u,v,y+2.16,.55,.25,'-v',{bg:'#304052',fg:'#e9d348'});
        }
        lsign('셀프계산대',base+(count-1)*1.05,v-.5,y+2.6,3.2,.45,'-v',{bg:'#428a93',fg:'#fff'});
      }
      // Staff and short checkout clusters occupy the counter pockets, away from gate landings.
      for(const [u,v] of [[260,29.25],[225.1,29.25],[159.2,8.9]]){
        lperson(u,v,y,{rotY:FACE['-v'],shirt:0xbc233c,pants:0x31363c,h:1.66});
        lbox(u,v-.14,y+.72,.31,.05,.48,0xb32238,{solid:false});
      }
      for(const [u,v,shirt] of [[260,26.9,0x505c6b],[260.2,25.8,0xe2d6c2],[264.2,27,0xb99ca4],[223,26.9,0x566c5d],[223.2,25.8,0xd0b293],[158.4,11.5,0x4b5666]]){
        lperson(u,v,y,{rotY:FACE['+v'],shirt,pants:0x353e44,h:1.68});
        lbox(u+.28,v,y+.43,.23,.14,.31,0xc91f3c,{solid:false});
      }
      for(const [u,v] of [[269,9],[149,2.5],[218.2,3.3]]){
        for(let k=0;k<12;k++)lbox(u,v,y+.1+k*.07,.55,.42,.06,0xc72137,{solid:false});
        lbox(u+.9,v,y,.6,.7,.8,0xa4aca8,{side:doorGlass});
      }
      for(const [u,v] of [[265,24],[229,24],[169,24]]){
        lbox(u,v,y,.55,.45,1.45,0xf1efe8);lsign(['상품검색대','상품 위치 · 재고 확인'],u,v-.25,y+1.18,.5,.4,'-v',{bg:'#bce5e6',fg:'#26494b'});
      }
      for(const [u,n,t] of [[262,1,'문구 · 건기식 · 시즌 · 계산대'],[225,2,'미용 · 패션 · 인테리어'],[163,3,'일용 · 주방 · 욕실']]){
        lsign([`${n}구역`,t],u,24,y+2.5,4,.6,'-u',{bg:'#348eaa',fg:'#fff',twoSided:true});
        lsign(['← 고투몰방면 · 뉴코아백화점 방면','GATE 4 ←   GATE 3 · GATE 2   → GATE 1','경부선방면 · 고속터미널역 3·7·9호선 →'],u,23,y+2.6,5.6,.8,'-u',{bg:'#f3f1eb',fg:'#b5243d',twoSided:true});
      }
      lsign(['GATE 3','← 디즈니 · GATE 4 출구'],151.5,14.5,y+2.5,3,.6,'-u',{bg:'#f5f1e8',fg:'#be2038'});
      for(const u of [207.5,210.4,213.3]){
        lbox(u,4,y,.65,.8,1.04,0x242727);lbox(u,4.41,y+.05,.51,.025,.94,0xc0c1b9,{solid:false});
        lsign('입구전용',u,4.44,y+.82,.45,.2,'+v',{bg:'#bf233d',fg:'#fff'});
        lcyl(u,4,y+.7,.12,.15,0xaab3b0,{solid:false,seg:8});
        for(let k=0;k<3;k++)lbox(u+.44,4,y+.4+k*.18,.7,.04,.045,0xbfc4bc,{rot:k*PI/3,solid:false});
      }
      lsign(['GATE 2 입구전용','나가실 때는 GATE 1과 4번을 이용해주세요'],210.5,3.2,y+2.65,5.6,.7,'+v',{bg:'#f6f2ec',fg:'#bf2940'});

    });
  }

  function buildUpper(){
    for(let i=1;i<10;i++){
      const p=floorPoly(i),y=ys[i],top=i===9?48:ys[i+1];
      K.zone({name:i===2?'고속터미널 꽃도매상가':'서울고속버스터미널',floor:`${i+1}F`,sub:uses[i],poly:p,y0:y,y1:top,priority:1});
      if(i<9&&i!==2){
        const voids=[[34,6,66,23],[56,54,71.4,84],[8,14,32,34],[24,146,65,156.5],[16.4,66,25.2,92],[67.4,23.5,73.6,37]];
        const omit=(u,v)=>i===1&&(voids.some(r=>inRect(r,u,v,.35))||[30,40].some(c=>Math.hypot(u-c,v-143)<2.6));
        columns(floorPoly(i+1),y,top-y-.35,omit);
        if(i!==1)lights(floorPoly(i+1),top-.38);
        else for(let u=5;u<72;u+=9)for(let v=5;v<158;v+=9){
          const [x,z]=W(u,v);if(omit(u,v)||blocked(u,v,2)||!K.pointInPoly(x,z,floorPoly(i+1)))continue;
          lbox(u,v,top-.38,.65,.65,.025,0xc8cac5,{solid:false});
          lbox(u,v,top-.395,.6,.6,.025,'emit',{solid:false});
        }
      }
      lsign(`${i+1}층${i===2?'  꽃도매상가':''}`,42,59,y+2.4,3.5,.5,'+v',{bg:'#e4e0d6',fg:'#3c4747'});
    }
    K.zone({name:'북측 동',floor:'2F',sub:'상가 · 신반포로 아케이드',poly:NORTH,y0:NORTH_2F,y1:NORTH_ROOF,priority:2});columns(NORTH,NORTH_2F,3.85);lights(NORTH,8.02);
    K.zone({name:'북측 동 옥상 주차장',floor:'옥상',sub:'승용차 주차',poly:NORTH,y0:NORTH_ROOF,y1:12,priority:2});
    // Keep the neighbouring 6 m deck reachable after lowering the north shop floor.
    lramp(173,18,173,30.3,{w:4,ya:NORTH_2F,yb:6,mat:'concrete'});
    // Known use only; no invented CCTV centres, dispatch rooms, canteens or tenant offices upstairs.
    lsign('입점 준비 중',43,62,23.2,5,.55,'+v',{bg:'#e4e0d6',fg:'#3b3b38'});
    for(const [u,v] of [[30,88],[46,110]])lbox(u,v,20.5,3,1,0.74,0xcac2b3);
    // gb_flower 01–22, round 7: continuous narrow market aisles, photographed
    // stock profiles, suspended shop signs, and a separate tiled entrance lobby.
    const fy=11,fc=13.8,fp=floorPoly(2),cp=floorPoly(3);
    let fr=K.rand(305);
    const colors=[0xf5eee0,0xeeafbd,0xe12b75,0xf4cd47,0xb88bd0,0xf5a995,0x8eafe2,0xd8263f,0xf4b6c6,0xc8a2e6];
    // Repeated visual stock shares four small geometries. Structural furniture
    // stays in the kit; instances are static and create no extra collision walls.
    let instances=new Map();
    const TH=K.THREE;
    const geometries={
      box:new TH.BoxGeometry(1,1,1).translate(0,.5,0),
      pot:new TH.CylinderGeometry(.5,.38,1,6).translate(0,.5,0),
      dome:new TH.SphereGeometry(1,6,3,0,PI*2,0,PI/2),
      tree:new TH.CylinderGeometry(.30,.5,1,8).translate(0,.5,0),
      // Hollow stepped vessels, unlike the capped cut-flower buckets.
      vase:new TH.LatheGeometry([[.16,0],[.42,.12],[.5,.55],[.33,.9],[.34,1],[.28,1],[.27,.88],[.43,.55],[.36,.17]].map(p=>new TH.Vector2(...p)),8),
      bowl:new TH.LatheGeometry([[.16,0],[.38,.16],[.5,.62],[.5,.7],[.44,.7],[.42,.59],[.32,.2],[.16,.08]].map(p=>new TH.Vector2(...p)),8)
    };
    geometries.glassTube=new TH.LatheGeometry([[.46,0],[.5,1],[.45,1],[.41,.06],[0,.06]].map(p=>new TH.Vector2(...p)),8);
    geometries.handle=new TH.TorusGeometry(.5,.035,3,10,PI).rotateY(PI/2);
    geometries.wreath=new TH.TorusGeometry(.4,.13,4,10).rotateY(PI/2);
    // Scalloped flower heads keep a flower silhouette at eye level. The former
    // one-colour rectangular blocks made the artificial displays look like boxes.
    const bloomPositions=[],bloomIndices=[];
    bloomPositions.push(0,.38,0,0,0,0);
    for(let n=0;n<10;n++){const a=n*PI/5,r=n%2?.67:1;bloomPositions.push(Math.cos(a)*r,n%2?.1:.18,Math.sin(a)*r);}
    for(let n=0;n<10;n++){bloomIndices.push(0,2+n,2+(n+1)%10,1,2+(n+1)%10,2+n);}
    geometries.bloom=new TH.BufferGeometry();geometries.bloom.setAttribute('position',new TH.Float32BufferAttribute(bloomPositions,3));geometries.bloom.setIndex(bloomIndices);geometries.bloom.computeVertexNormals();
    // Round 8: the wall bouquets need vertical faces; horizontal heads were
    // edge-on in trace24. Shared geometry keeps the dense stock inexpensive.
    geometries.wallbloom=geometries.bloom.clone().rotateZ(PI/2);
    geometries.round=new TH.OctahedronGeometry(1,0);
    geometries.round.setIndex(Array.from({length:geometries.round.attributes.position.count},(_,i)=>i));
    // Eight triangles per petal/leaf, with radial normals: preserve every visible
    // cluster while keeping each lazy room below the detail geometry budget.
    { const p=geometries.round.attributes.position,n=geometries.round.attributes.normal;
      for(let i=0;i<p.count;i++){const v=new TH.Vector3().fromBufferAttribute(p,i).normalize();n.setXYZ(i,v.x,v.y,v.z);} }
    let stockLimit=Infinity;
    // The retained exterior wall is u=67.7. Its new perimeter row has a shallow
    // 2.05 m footprint ending at67.5; a full4 m stall would cross the facade.
    function clipStock(u,w,radial=false){
      const half=w*(radial?1:.5),lo=u-half,hi=Math.min(u+half,stockLimit);
      return hi<=lo?null:[(lo+hi)/2,(hi-lo)/(radial?2:1)];
    }
    function stockbox(u,v,y,w,d,h,mat,o={}){
      const cut=clipStock(u,w);if(cut)lbox(cut[0],v,y,cut[1],d,h,mat,o);
    }
    function deco(kind,u,v,y,w,d,h,color,glow=false){
      const cut=clipStock(u,w,['dome','bloom','wallbloom','round'].includes(kind));if(!cut)return;u=cut[0];w=cut[1];
      const key=kind+(glow==='glass'?':glass':glow?':emit':'');if(!instances.has(key))instances.set(key,[]);
      instances.get(key).push([u,v,y,w,d,h,color]);
    }
    const db=(u,v,y,w,d,h,col,glow=false)=>deco('box',u,v,y,w,d,h,col,glow);
    const dp=(u,v,y,r,h,col)=>deco('pot',u,v,y,r*2,r*2,h,col);
    const dd=(u,v,y,rx,ry,rz,col)=>deco('dome',u,v,y,rx,rz,ry,col);
    const flower=(u,v,y,r,col)=>deco('bloom',u,v,y,r,r,r,col);
    function cluster(u,v,y,r,col,wall=false){
      deco(wall?'wallbloom':'bloom',u,v,y,r,r,r,col);
      for(let k=0;k<5;k++){
        const a=k*PI*.4,rr=r*.58;
        deco('round',u+(wall?.03:Math.cos(a)*rr),v+Math.sin(a)*rr,y+(wall?Math.cos(a)*rr:r*.18),r*.38,r*.38,r*.29,col);
      }
    }
    function twig(u,v,y,h,col=0x487447){
      db(u,v,y,.018,.018,h,0x6c7250);
      for(let k=0;k<5;k++){
        const s=k%2?1:-1,yy=y+h*(.25+k*.14);
        deco('round',u+s*.1,v+(k%3-1)*.045,yy,.14,.065,.035,col);
      }
    }
    K.texture('gb6_epoxy',256,256,(g,w,h)=>{
      g.fillStyle='#2f8a5c';g.fillRect(0,0,w,h);const er=K.rand(611);
      for(let i=0;i<300;i++){g.fillStyle=['#287b52','#3c9364','#418f66'][i%3];g.globalAlpha=.10+er()*.1;
        g.beginPath();g.ellipse(er()*w,er()*h,5+er()*24,2+er()*17,er()*PI,0,PI*2);g.fill();}
      g.globalAlpha=.18;g.strokeStyle='#b0c6a3';g.lineWidth=1;
      for(let i=0;i<65;i++){const x=er()*w,z=er()*h;g.beginPath();g.moveTo(x,z);g.lineTo(x+er()*9,z+4+er()*20);g.stroke();}g.globalAlpha=1;
    },[8,8]);
    K.texture('gb_wicker',64,64,(g,w,h)=>{
      g.fillStyle='#bc985e';g.fillRect(0,0,w,h);
      for(let n=0;n<64;n+=8){g.fillStyle='#d3b47b';g.fillRect(0,n,w,4);g.fillStyle='#9a7848';g.fillRect(n,0,2,h);}
    },[.24,.24]);
    const flowerHoles=holes(fp,fy);
    K.hpoly({tex:'gb6_epoxy',gloss:.5},fp,fy+.008,true,flowerHoles);
    K.material('gb8_epoxy_glaze',new TH.MeshPhongMaterial({color:0x78aa8f,specular:0xc7d6c4,shininess:72,transparent:true,opacity:.12,depthWrite:false}));
    K.hpoly('gb8_epoxy_glaze',fp,fy+.012,true,flowerHoles);
    K.hpoly({tex:'gb_acoustic',color:0xf5f7f5},cp,fc,false,flowerHoles);
    const aisleUs=[17.1,22.9,28.7,35,41.3,47.1,52.9,58.7,64.5];
    const lobby=[16.4,76.5,23.6,92];
    const omitColumn=(u,v)=>aisleUs.some(a=>Math.abs(u-a)<.8)||inRect(lobby,u,v,.5)||inRect([23,78,25,90],u,v,.5)||(v>85.4&&v<91.5);
    columns(cp,fy,2.8,omitColumn);
    function nearColumn(u,v,margin=.6){
      const cu=6+9*Math.round((u-6)/9),cv=6+9*Math.round((v-6)/9);
      const [cx,cz]=W(cu,cv);return K.pointInPoly(cx,cz,cp)&&!omitColumn(cu,cv)&&!blocked(cu,cv,1.3)&&Math.abs(u-cu)<margin&&Math.abs(v-cv)<margin;
    }
    // 13/14: enclosed 2F approach, tactile line and the beige stair beside the escalator.
    for(const u of [17,23])lwall(u,66,u,77.8,6,11,{mat:0xeeece6,thick:.15});
    K.hpoly('gb_acoustic',rect(17,66,23,77.8),9.2,false);
    K.hpoly('gb_tactile',rect(19.85,66,20.15,77.8),6.015);
    lstairs(24,78,24,88,{w:2,ya:6,yb:11,mat:0xd8c9a8});
    // Full-width glass storefront: the escalator lands BEFORE the green market.
    K.hpoly('tile',[[16.4,76.5],[23.6,76.5],[23.6,78],[23,78],[23,88],[23.6,88],[23.6,92],[16.4,92]].map(q=>W(...q)),fy+.015,true,[rect(18.2,78,21.8,88)]);
    K.hpoly('tile',rect(23,88,25,90),fy+.015);
    K.hpoly('gb_tactile',rect(19.85,88.1,20.15,91.8),fy+.022);
    lwall(16.4,76.5,16.4,92,fy,fc,{mat:0xe8e4d8,thick:.15});
    lwall(23.6,76.5,23.6,92,fy,fc,{mat:0xe8e4d8,thick:.15,openings:[{at:12.4,w:2.4,y0:fy,y1:fc}]});
    lwall(16.4,76.5,23.6,76.5,fy,fc,{mat:0xe8e4d8,thick:.15});
    // Photos06/07 show OPEN timber fronts. Retain the existing glass as
    // internal display partitions behind the stock, leaving the aisle fronts open.
    for(const [u,a,b] of [[42.35,109.65,125.15],[29.65,128.9,133.15]]){
      lwall(u,a,u,b,fy,fy+2.62,{mat:doorGlass,thick:.035,openings:[{at:(b-a)/2,w:1.45,y0:fy,y1:fy+2.42}]});
    }
    for(const [a,b] of [[16.4,18.8],[21.2,23.6]]){
      lwall(a,92,b,92,fy,fy+2.35,{mat:doorGlass,thick:.025});
      lbox((a+b)/2,92.02,fy+.9,b-a,.02,.12,0xe8ece8);
    }
    for(const u of [16.4,18.2,18.8,21.2,21.8,23.6])lbox(u,92,fy,.055,.09,2.35,0x2b2f33);
    for(const u of [18.7,21.3])lbox(u,92.45,fy+.03,.035,.9,2.25,doorGlass,{solid:false});
    lbox(20,92.04,fy+2.35,7.2,.3,.45,0xe3dfd4);
    lbox(20,91.84,fy+2.35,5.08,.17,.43,0x11151a);
    lsign('3  |  꽃 도매상가(생화·조화)',20,91.74,fy+2.58,4.82,.27,'-v',{bg:'#10151c',fg:'#fff',pxPerM:170,padding:.01});
    lbox(20,87,fc-.4,7.15,2,.4,0xb9bcbd);
    lzone('생화','3F','계단식 꽃 양동이 · 생화 도매',8,12,71,86,11,16,3);
    lzone('조화 · 크리스마스','3F','조화 · 트리 · 장식',8,91.45,71,128,11,16,3);
    lzone('식물 · 박테라리움','3F','화분 · 관엽식물',8,128,71,134,11,16,3);
    lzone('화기 · 바구니','3F','화병 · 화분 · 바구니 부자재',8,135,71,153,11,16,3);
    lzone('꽃도매상가 입구','3F','타일 로비 · 생화 · 조화',16.4,76.5,23.6,95,11,16,4);
    function flowerDetail(name,bounds,fn,seedName=name){
      const seed=Array.from(seedName).reduce((n,c)=>(n*31+c.charCodeAt(0))>>>0,305);
      ldetail({floor:'3F',y0:fy,y1:16,poly:rect(...bounds),name},()=>{
        // Visiting one aisle first must not change the next aisle's stock placement.
        fr=K.rand(seed); instances=new Map(); stockLimit=Infinity; fn();
    const matrix=new TH.Matrix4(),quat=new TH.Quaternion().setFromAxisAngle(new TH.Vector3(0,1,0),ROT),pos=new TH.Vector3(),scale=new TH.Vector3(),colour=new TH.Color();
    for(const [key,list] of instances){
      const [kind,mode]=key.split(':'),mat=mode==='glass'?new TH.MeshPhongMaterial({color:0xe1ede7,specular:0xffffff,shininess:85,transparent:true,opacity:.3,depthWrite:false,side:TH.DoubleSide}):mode==='emit'?new TH.MeshBasicMaterial({color:0xffffff}):new TH.MeshLambertMaterial({color:0xffffff});
      const mesh=new TH.InstancedMesh(geometries[kind],mat,list.length);
      mesh.name=`gyeongbu-flower-${name}-${key}`;
      list.forEach(([u,v,y,w,d,h,col],i)=>{const [x,z]=W(u,v);matrix.compose(pos.set(x,y,z),quat,scale.set(w,h,d));mesh.setMatrixAt(i,matrix);mesh.setColorAt(i,colour.setHex(col));});
      mesh.instanceMatrix.needsUpdate=true;if(mesh.instanceColor)mesh.instanceColor.needsUpdate=true;
      mesh.computeBoundingSphere();K.addMesh(mesh);
    }
      });
    }
    flowerDetail('꽃시장 천장·입구',[4,0,71.7,159],()=>{
    for(let v=67;v<78;v+=2.4)lcyl(20,v,9.17,.125,.025,'emit',{seg:8,solid:false});
    // Photo13: tiled approach with inspection panels, downlights and wall skirting.
    for(let u=17.05;u<23;u+=.6)db(u,71.9,9.18,.012,11.8,.015,0xc3c3bb);
    for(let v=66;v<77.8;v+=.6)db(20,v,9.18,5.9,.012,.015,0xc3c3bb);
    for(const u of [17.09,22.91])db(u,71.9,6,.02,11.8,.12,0x5c5d55);
    lsign('3층 꽃도매상가 ↑',20,76.8,8.55,2.4,.32,'-v',{bg:'#8e8068',fg:'#fff'});
    // Photo01: door notices and the frosted safety band remain outside the opening.
    for(const u of [17.4,22.6]){
      lsign(['꽃도매상가','매장 안내'],u,91.965,fy+1.42,.65,.46,'-v',{bg:'#e4d5b6',fg:'#69553e',padding:.05});
      for(let n=0;n<8;n++){
        const q=W(u-.7+n*.2,91.985),r=W(u-.61+n*.2,91.985),t=W(u-.65+n*.2,91.985);
        K.quad(0x34433c,[[q[0],fy+.9,q[1]],[r[0],fy+.9,r[1]],[t[0],fy+1.015,t[1]],[t[0],fy+1.015,t[1]]],[-B[0],0,-B[1]]);
      }
    }
    for(const [u,v] of [[28.7,112],[35,105],[47.1,116],[58.7,70]]){
      db(u,v,fc-.1,.66,.66,.09,0xd6d6cc);
      for(let q=-.25;q<=.25;q+=.07)db(u+q,v,fc-.12,.025,.48,.022,0x7b827a);
      db(u+.7,v+.65,fc-.08,.08,.08,.08,0x4a504a);
    }
    for(const [u,a,b] of [[46.25,109.65,125.15],[33.65,128.9,133.15]]){
      db(u,(a+b)/2,fy+2.55,.12,b-a,.12,0xa78861);
      for(let v=a;v<=b+.01;v+=2.1)if(Math.abs(v-(a+b)/2)>.83)db(u,v,fy,.12,.12,2.65,0xa78861);
      for(const s of [-1,1])db(u,(a+b)/2+s*.75,fy,.1,.1,2.65,0xa78861);
      // White curtains tied to rough timber posts, never across the clear aisle.
      for(const v of [a+.18,b-.18])for(let k=0;k<7;k++)db(u-.11,v+(k-3)*.055,fy+.1,.07,.055,2.35,k%2?0xe4e0d3:0xf3f0e5);
    }
    // Building-aligned 600 mm T-bars, clipped to the perimeter and stair voids.
    const localCeil=cp.map(q=>toL(...q)),ceilCuts=flowerHoles.map(h=>{
      const ps=h.map(q=>toL(...q));return [Math.min(...ps.map(q=>q[0])),Math.min(...ps.map(q=>q[1])),Math.max(...ps.map(q=>q[0])),Math.max(...ps.map(q=>q[1]))];
    });
    ceilCuts.push([8,70,55,158],[48,43,54.3,65]); // Walk17 exposed grey service soffits.
    function gridLine(axis,q){
      const cross=1-axis,ints=[];
      for(let i=0;i<localCeil.length;i++){
        const a=localCeil[i],b=localCeil[(i+1)%localCeil.length];
        if((a[cross]<=q&&b[cross]>q)||(b[cross]<=q&&a[cross]>q))ints.push(a[axis]+(q-a[cross])/(b[cross]-a[cross])*(b[axis]-a[axis]));
      }
      ints.sort((a,b)=>a-b);
      for(let i=0;i+1<ints.length;i+=2){
        let spans=[[ints[i],ints[i+1]]];
        for(const r of ceilCuts)if(q>r[cross]-.02&&q<r[cross+2]+.02){
          const lo=r[axis]-.02,hi=r[axis+2]+.02;
          spans=spans.flatMap(([a,b])=>b<=lo||a>=hi?[[a,b]]:[[a,Math.min(b,lo)],[Math.max(a,hi),b]].filter(t=>t[1]>t[0]));
        }
        for(const [a,b] of spans){const mid=(a+b)/2;
          db(axis===0?mid:q,axis===0?q:mid,fc-.012,axis===0?b-a:.022,axis===0?.022:b-a,.012,0xc4c3bd);
        }
      }
    }
    for(let u=4;u<71.7;u+=.6)gridLine(1,u);
    for(let v=0;v<159;v+=.6)gridLine(0,v);
    // Photo02/10: nearly continuous twin tubes on aisle centrelines.
    function tray(u,v,cross=false){
      db(u,v,fc-.09,cross?1.2:.32,cross?.32:1.2,.065,0xadb5b3);
      for(const s of [-1,1])db(u+(cross?0:s*.075),v+(cross?s*.075:0),fc-.11,cross?1.12:.04,cross?.04:1.12,.03,0xf9fff5,true);
    }
    for(const u of aisleUs)for(let v=8;v<155;v+=2.4){
      if(blocked(u,v,.7)||inRect(lobby,u,v)||inRect([23,78,25,88],u,v))continue;
      if(u<55&&v>=70||u>48&&u<54.3&&v>43&&v<65)continue;
      tray(u,v);
    }
    for(let u=11;u<67;u+=2.4)if(!inRect(lobby,u,88.5))tray(u,88.5,true);
    for(const u of [17.1,35,52.9,64.5])for(const v of [33,76,135]){
      if(blocked(u,v,.5)||inRect(lobby,u,v))continue;
      db(u,v,fc-.22,.42,.04,.17,0x2fbf6a,true);
      db(u,v,fc-.05,.02,.02,.05,0x8a9388);
      lsign('→',u,v,fc-.135,.4,.15,'-v',{bg:'#1f9a5a',fg:'#fff',twoSided:true,offset:.035,pxPerM:240});
    }
    });
    // Continuous 5.8 m pitch; the one broad cross-aisle is v=85.55–91.45.
    const bands=[14.2,20,25.8,31.6,38.4,44.2,50,55.8,61.6,67.4];
    const rows=[14.4,20.2,26,31.8,37.6,43.4,49.2,55,60.8,66.6,72,77.8,83.6,93.4,100,105.8,111.6,117.4,123.2,131.2,137,142.8,148.6];
    const marketBlocked=(u,v)=>blocked(u,v,2.15)||inRect(lobby,u,v,1.95)||inRect([23,78,25,90],u,v,1.95)||elevs.some(e=>e.u<72&&Math.abs(u-e.u)<5.4&&Math.abs(v-e.v)<5.4)||inRect([43.45,47,47.15,65.5],u,v,1.95);
    function bunch(u,v,y,col,blue,tier,hero=false){
      // Zq_260 shows a bare wall here. Do not let the old right-hand bucket
      // fronts protrude through the wall into the photographed narrow aisle.
      if(u>53.85&&u<54.6&&v>43.5&&v<60.2)return;
      if(nearColumn(u,v,.65))return;
      if(tier===0){dp(u,v,y,.16,.3,0xa65a3a);y+=.3;}
      dp(u,v,y,.15,.42,blue?0x2b5c9e:0x22292a);
      const stem=.28+tier*.12;db(u,v,y+.37,.12,.12,stem,0x496a3c);
      dd(u,v,y+.41+stem,.22,.1,.22,0x496a3c);
      flower(u,v,y+.46+stem,.21,col);
      if(hero)for(let k=0;k<5;k++){const a=k*PI*.4;cluster(u+Math.cos(a)*.14,v+Math.sin(a)*.14,y+.49+stem,.09,col);}
      db(u-.12,v,y+.4,.025,.29,stem+.03,0xe0e2d2);
      // Small white price cards clipped to the bucket edge, as in photo02.
      if(tier===0)db(u-.155,v,y+.33,.012,.09,.12,0xf7f6ed);
    }
    function fresh(u,v,n){
      stockbox(u,v,fy,.38,3.8,1.5,0x7d6a52,{skip:['n','s']});
      for(const s of [-1,1]){
        for(let tier=0;tier<3;tier++){
          const bu=u+s*[1.66,1.25,.85][tier],by=fy+tier*.35;
          if(tier)db(bu,v,fy,.4,3.8,tier*.35,0x6b5a46);
          for(let k=0;k<8;k++)bunch(bu,v-1.68+k*.48,by,colors[(n+k+tier*2)%colors.length],(n+k)%4===0,tier,(Math.abs(u-58.7)<4&&v>=66&&v<79)||v===95.8);
        }
        for(let k=0;k<3;k++)db(u+s*1.82,v-1.3+k*1.2,fy+.82,.014,.13,.10,0xf1f0e5);
      }
      db(u,v,fy+1.52,.54,3.6,.05,0x9a8466);
      for(let k=0;k<6;k++){const bv=v-1.48+k*.59;if(!nearColumn(u,bv,.7))dp(u,bv,fy+1.57,.14,.6,0x1e2222);}
      if(n%2===0){db(u+1.5,v+1.55,fy,.6,.4,.3,0x2f6fb4);db(u-1.5,v+1.55,fy,.6,.4,.35,0x6e5640);}
    }
    function artificial(u,v,n){
      stockbox(u,v,fy,3.6,3.8,.75,0x8d7a5e,{skip:['n','s']});
      for(const s of [-1,1]){
        const gu=u+s*1.75;
        db(gu-s*.05,v,fy+.78,.12,3.6,1.92,0x3c5e38);
        for(let h=.75;h<2.76;h+=.15)db(gu,v,fy+h,.03,3.6,.015,0x8c8c76);
        for(let z=-1.8;z<1.81;z+=.15)db(gu,v+z,fy+.75,.03,.015,2,0x8c8c76);
        for(let k=0;k<56;k++){
          const bv=v-1.7+(k%8)*.48+(fr()-.5)*.12,by=fy+.88+Math.floor(k/8)*.25+(fr()-.5)*.1;
          if(nearColumn(gu,bv,.7))continue;
          const sz=.14+fr()*.08;flower(gu+s*.045,bv,by,sz,colors[(k+n)%colors.length]);
          // Retain the old blooms and add upright petal clusters in front of the grid.
          cluster(gu+s*.13,bv,by,sz*.87,colors[(k+n)%colors.length],true);
          db(gu-s*.035,bv,by-.13,.03,.025,.2,0x477346);
        }
        for(let k=0;k<8;k++){
          const z=v-1.6+k*.45;dp(u+s*1.5,z,fy+.75,.19,.32,0x67523d);
          dd(u+s*1.5,z,fy+1.07,.27,.12,.25,0x426742);
          flower(u+s*1.5,z,fy+1.14,.24,colors[(k*3+n)%colors.length]);
        }
      }
      // Photo11/12: hanging floral wreaths, ribbon tails and tall pampas bundles.
      for(const s of [-1,1])for(const dv of [-1.05,1.05]){
        const gu=u+s*1.88;
        deco('wreath',gu,v+dv,fy+2.08,.72,.72,.72,0x315d35);
        for(let k=0;k<12;k++){const a=k*PI/6;cluster(gu+s*.06,v+dv+Math.sin(a)*.3,fy+2.08+Math.cos(a)*.3,.1,colors[(n+k)%colors.length],true);}
        for(const dz of [-.07,.07])db(gu+s*.08,v+dv+dz,fy+1.12,.018,.055,.68,0xeacac1);
      }
      for(let k=0;k<3;k++){
        const bu=u+(k-1)*.9,bv=v+1.45;if(nearColumn(bu,bv,.7))continue;
        dp(bu,bv,fy+.75,.15,.3,0x252b29);dp(bu,bv,fy+1.02,.12,1.4,0xe6dcc0);
        dd(bu,bv,fy+2.3,.17,.2,.17,0xe6dcc0);
        for(let j=0;j<5;j++)twig(bu+(j-2)*.045,bv,fy+1.1,.9+j*.07,0xc7bb96);
      }
    }
    function christmas(u,v,n){
      const face=[38.4,50,61.6,67.4].includes(u)?-1:1,front=u+face*1.85;
      stockbox(u,v,fy,3.9,3.9,.17,0xa8865c,{skip:['n','s']});
      db(u===67.4?67.45:u-face*1.85,v,fy+.18,.08,3.8,2.32,0x921d2e);
      for(const du of [-1.85,1.85])for(const dv of [-1.85,1.85])if(!nearColumn(u+du,v+dv,.7))db(u+du,v+dv,fy,.12,.12,2.65,0x8a6a45);
      for(const dv of [-1.7,1.7])db(front,v+dv,fy+.15,.05,.25,2.4,0xedece0);
      db(u+face*.5,v-.1,fy+.17,1.25,1.1,.66,0xeeeade);
      for(let k=0;k<12;k++)db(u+face*.5+(k%3-1)*.27,v-.55+Math.floor(k/3)*.28,fy+.83,.22,.22,.2,[0xb72033,0xd4b85c,0xe8e8e8][k%3]);
      for(const dv of [-1,1]){
        const tu=u===67.4?66.9:u-face*.4,tv=v+dv;if(nearColumn(tu,tv,.8))continue;
        db(tu,tv,fy+.17,.1,.1,2.2,0x665645);
        for(let k=0;k<4;k++)deco('tree',tu,tv,fy+.4+k*.48,[1.1,.84,.6,.32][k],[1.1,.84,.6,.32][k],.5,k%2?0x365e3d:0x2f5a35);
        for(let k=0;k<16;k++){
          const tier=k%4,r=[.5,.38,.26,.13][tier],a=k*2.3999;
          db(tu+Math.cos(a)*r,tv+Math.sin(a)*r,fy+.48+tier*.48,.07,.07,.07,[0xb72033,0xd4b85c,0xe8e8e8][k%3]);
        }
        for(let k=0;k<20;k++){
          const tier=k%4,r=[.52,.4,.28,.14][tier],a=k*2.3999+.7;
          db(tu+Math.cos(a)*r,tv+Math.sin(a)*r,fy+.53+tier*.48,.03,.03,.03,0xffd27a,true);
        }
      }
      // Photo03/04/06: fine greenery softens the retained large tree/wreath shapes.
      for(let k=0;k<14;k++){
        const vv=v-1.65+k*.25,hh=fy+1.9+(k%3)*.12;
        twig(front-face*.08,vv,hh,.37, k%2?0x527a46:0x315d37);
        if(k%3===0){deco('round',front+face*.08,vv,hh+.1,.045,.045,.045,0xb12236);db(front+face*.06,vv,hh+.3,.025,.025,.025,0xffe0a3,true);}
      }
      // Open front, a garland at the stall edge, and velvet ribbon tails.
      db(front,v,fy+2.22,.22,3.8,.28,0x355c3a);
      for(let k=0;k<9;k++){
        const z=v-1.65+k*.41;
        dd(front,z,fy+2.16,.21,.28,.27,k%2?0x43663b:0x315a35);
        if(k%3===0){dd(front+face*.06,z,fy+1.85,.17,.43,.19,0x52763d);db(front+face*.19,z,fy+2.15,.045,.045,.045,0xffd999,true);}
      }
      for(const dv of [-1.2,0,1.2]){
        deco('wreath',front,v+dv,fy+2.06,.55,.6,.6,0x3d663c);
        db(front+face*.13,v+dv,fy+2.26,.06,.32,.18,0xb01e2d);
        for(const dz of [-.08,.08])db(front+face*.16,v+dv+dz,fy+2.05,.02,.06,.37,0xb01e2d);
        db(front-face*.05,v+dv+.4,fy+2.05,.02,.1,.7,0x921d2e);
      }
      for(const dv of [-1.5,-.75,.75,1.5]){
        dp(front-face*.18,v+dv,fy+.17,.19,.32,0xd2c8b4);
        for(let h=0;h<3;h++)dd(front-face*.18,v+dv,fy+.46+h*.21,.32-h*.035,.3,.28, h%2?0x638348:0x3e6b3f);
      }
      // Drape folds and lower stock fill the empty tabletop between the trees.
      for(let k=0;k<10;k++)db(u+face*.49,v-.58+k*.12,fy+.18,1.28,.018,.62,k%2?0xe9e3d3:0xf7f0df);
      for(let k=0;k<6;k++){
        const vv=v-1.48+k*.58;
        twig(front-face*.15,vv,fy+.42,.58,0x4b7643);
        if(k%2===0)cluster(front-face*.1,vv,fy+1.05,.12,0xc12a40,true);
      }
      // Photo04: cream cloth at the back of an open red-draped stall, two
      // seated bear decorations, wreaths and long velvet ribbons in front.
      if(u===50&&v===100){
        for(let k=0;k<10;k++){
          const a=v-1.7+k*.34,b=a+.34,ua=u-face*1.45;
          const topA=fy+1.55-Math.sin(k*PI/10)*.25,topB=fy+1.55-Math.sin((k+1)*PI/10)*.25;
          const pa=W(ua,a),pb=W(ua,b);
          K.quad(0xeee9d9,[[pa[0],fy+.2,pa[1]],[pb[0],fy+.2,pb[1]],[pb[0],topB,pb[1]],[pa[0],topA,pa[1]]],[-A[0],0,-A[1]]);
        }
        for(const [dv,size] of [[-.65,1],[.45,.7]]){
          const bu=u+face*.55,bv=v+dv;
          dp(bu,bv,fy+.18,.22*size,.46*size,0x7d3542);
          dd(bu,bv,fy+.62*size,.22*size,.3*size,.22*size,0x936c43);
          for(const s of [-1,1])dd(bu,bv+s*.19*size,fy+.82*size,.08*size,.11*size,.08*size,0x936c43);
          for(const s of [-1,1])dd(bu+face*.18,bv+s*.16*size,fy+.18,.13*size,.15*size,.14*size,0x8c633f);
        }
      }
      for(let k=-2;k<=2;k++){db(u+k*.65,v,fy+2.56,.018,3.6,.018,0x8c8c76);db(u,v+k*.65,fy+2.56,3.6,.018,.018,0x8c8c76);}
      for(let k=0;k<48;k++){
        const bu=u-1.55+fr()*3.1,bv=v-1.55+fr()*3.1,by=fy+2.1+fr()*.32;
        db(bu,bv,by,.1,.1,.1,[0xc7353e,0xd9bd6b,0xe9e5d5][k%3]);db(bu,bv,by+.1,.012,.012,fy+2.56-by-.1,0x9c9b88);
      }
    }
    function basket(u,v,y,w=.38){
      stockbox(u,v,y,w,.4,.3,'gb_wicker',{solid:false,skip:['top','bottom']});
      db(u,v,y+.04,w-.045,.35,.025,0x8e713f);
      for(const dv of [-.19,.19])db(u,v+dv,y+.285,w,.02,.025,0xcfac6e);
      deco('handle',u,v,y+.3,.35,.36,.3,0xc3a36d);
    }
    function supplies(u,v,n){
      stockbox(u,v,fy,.04,3.8,2,0xeceae4,{skip:['n','s']});
      for(const s of [-1,1]){
        for(let k=0;k<5;k++){
          const y=fy+.1+k*.42;db(u+s*.25,v,y,.48,3.8,.03,0xf1f0eb);
          for(let j=0;j<8;j++){
            const z=v-1.57+j*.45;if(n%2)basket(u+s*.25,z,y+.03);
            else deco(j%3?'vase':'bowl',u+s*.25,z,y+.03,.3,.3,.33,j%3?0xf0f0e5:0x292e2e);
          }
        }
        for(let dv=-1.85;dv<1.9;dv+=.925)db(u+s*.48,v+dv,fy,.04,.04,2.02,0xf1f0eb);
        // Kraft stock and oversize pots fill the lower edge without blank panels.
        for(let k=0;k<4;k++){
          const z=v-1.4+k*.92;db(u+s*1.35,z,fy,.68,.65,.36+(k%2)*.23,0xbca57b);
          if(n%2)basket(u+s*1.35,z,fy+.61,.45);else deco(k%2?'vase':'bowl',u+s*1.35,z,fy+.61,.47,.47,.55,k%2?0xf3f0e7:0x2b302e);
        }
      }
      // Photo08: clear cylindrical glass vases sit alongside, not instead of,
      // the retained white ceramics; this small hero table stays inside the stall.
      if(u===31.6&&v===142.8){
        db(33.35,v,fy,.36,1.85,.6,0xb39974);
        for(let k=0;k<6;k++){
          const vv=v-.68+k*.28,hh=.24+(k%3)*.1;
          deco('glassTube',33.35,vv,fy+.61,.2,.2,hh,0xe5eee8,'glass');
          if(k===2){db(33.35,vv,fy+.64,.012,.012,.55,0x537148);cluster(33.35,vv,fy+1.2,.07,0xe4aac5);}
        }
      }
      // Photo09: a few dark/red storage baskets break up the photographed tan rack.
      if(u===38.4&&v===142.8)for(let k=0;k<5;k++){
        db(u+.27,v-1.45+k*.7,fy+.96,.43,.55,.2,k%2?0x6b4734:0x8b3044);
        db(u+.49,v-1.45+k*.7,fy+1.09,.025,.4,.035,0xd3b779);
      }
      for(let k=0;k<8;k++){
        const bu=u+(k%2?1.2:-1.2),bv=v-1.4+Math.floor(k/2)*.94,by=fy+2.2+(k%2)*.08;
        basket(bu,bv,by,.45);db(bu,bv,by+.45,.015,.015,Math.max(.04,fc-by-.45),0x8a8a77);
      }
    }
    function plants(u,v,n){
      for(let k=0;k<30;k++){
        const bu=u-1.6+(k%5)*.8+(fr()-.5)*.14,bv=v-1.6+Math.floor(k/5)*.62+(fr()-.5)*.1;
        if(nearColumn(bu,bv,.7))continue;
        const r=.12+fr()*.14,h=.2+fr()*.25;dp(bu,bv,fy,r,h,[0xe8e4d8,0x8a5a3c,0x3a3a36][k%3]);
        const fh=.4+fr()*.6;dd(bu,bv,fy+h,r*1.7,fh,r*1.7,[0x3f754c,0x5f8f45,0x2e5e36][k%3]);
        if(k%3===0)dd(bu,bv,fy+h+fh*.5,r*1.6,.55,r*1.6,0x3f754c);
        if(k%2===0)for(const s of [-1,1])twig(bu+s*r*.65,bv,fy+h,fh+.4,[0x3f754c,0x719254,0x315e40][k%3]);
      }
      for(const dv of [-1.1,1.1]){
        if(nearColumn(u,v+dv,.7))continue;
        dp(u,v+dv,fy,.28,.4,0x8a5a3c);db(u,v+dv,fy+.4,.06,.06,2.2,0x6b5a46);
        for(let k=0;k<3;k++)dd(u+(k-1)*.13,v+dv,fy+1.5+k*.3,.5-k*.08,.5,.48-k*.07,[0x3f754c,0x5f8f45,0x2e5e36][k]);
      }
      for(let k=0;k<3;k++)db(u-1.55,v-1.2+k*1.2,fy,.6,.4,.3,0x7a5434);
    }
    const named=new Map([
      ['31.6,100',['제301호','마티아','T.533-2647']],
      ['38.4,105.8',['제300호','플라워마트','T.594-5331']],
      ['44.2,117.4',['제242호','엠데코디자인','T.02-595-9409','E.025959409@hanmail.net']],
      ['31.6,123.2',['제305호','진흥조화','T.537-6596·537-6588']],
      ['25.8,111.6',['제276호','예림조화','T.596-8547']],
      ['38.4,93.4',['제221호','신세계플라워','HP.010-4499-6580']],
      ['50,100',['현대데코','T.535-1122']],
      ['61.6,123.2',['제289호','로사','T.594-0709']],
      ['38.4,131.2',['제185호','박테라리움','T.535-3058']],
      ['31.6,77.8',['제197호','모어라브르']]
    ]);
    const rooms=[
      ['생화 서편 북쪽',[10,12,34.5,48],(u,v)=>v<48&&u<35],
      ['생화 서편 남쪽',[10,48,34.5,86],(u,v)=>v>=48&&v<=83.6&&u<35],
      ['생화 동편 북쪽',[35,12,67.7,48],(u,v)=>v<48&&u>35],
      ['생화 동편 남쪽',[35,48,67.7,66],(u,v)=>v>=48&&v<66&&u>35],
      ['생화 동편 남단',[35,66,67.7,86],(u,v)=>v>=66&&v<=83.6&&u>35],
      ['조화',[10,91.45,34.5,110],(u,v)=>v>83.6&&v<110&&u<33.6],
      ['조화 남쪽',[10,110,34.5,128],(u,v)=>v>=110&&v<128&&u<33.6],
      ['크리스마스',[35,91.45,67.7,128],(u,v)=>v>83.6&&v<128&&u>33.6],
      ['식물',[10,128,67.7,134],(u,v)=>v===131.2],
      ['화기·바구니 서편',[10,135,34.5,153],(u,v)=>v>=137&&u<35],
      ['화기·바구니 동편',[35,135,67.7,153],(u,v)=>v>=137&&u>35],
    ];
    const splitRooms=new Set(['생화 동편 남단','크리스마스','조화 남쪽','조화','생화 동편 북쪽','화기·바구니 동편','생화 서편 북쪽']);
    // Advance the original room RNG through an unbuilt cell. This mirrors only
    // its random draws, never emits geometry, and retains exact stock placement
    // whichever spatial group loads first. Fresh flowers and supplies are fixed.
    function advanceRoomRandom(u,v){
      if(v>83.6&&v<128&&u<33.6){
        for(const side of [-1,1])for(let k=0;k<56;k++){
          const bv=v-1.7+(k%8)*.48+(fr()-.5)*.12;fr();
          if(!nearColumn(u+side*1.75,bv,.7))fr();
        }
      }else if(v>83.6&&v<128)for(let k=0;k<144;k++)fr();
    }
    for(const [name,bounds,select] of rooms){
      const roomBands=bands.filter(u=>rows.some(v=>select(u,v)&&!marketBlocked(u,v)&&!(v===93.4&&u<27)));
      const parts=[];
      if(splitRooms.has(name)){
        const step=name==='생화 동편 남단'?1:2;
        for(let k=0;k<roomBands.length;k+=step)parts.push(roomBands.slice(k,k+step));
      }else parts.push(roomBands);
      for(const [partIndex,part] of parts.entries()){
        const partBounds=parts.length===1?bounds:[Math.max(bounds[0],part[0]-2.4),bounds[1],Math.min(bounds[2],part.at(-1)+2.4),bounds[3]];
        if(partIndex===0&&name==='조화')partBounds[2]=Math.max(partBounds[2],25.1);
        if(partIndex===0&&name==='크리스마스')partBounds[2]=Math.max(partBounds[2],48.2);
        flowerDetail(parts.length===1?name:`${name} · ${partIndex+1}구역`,partBounds,()=>{
    for(const u of bands)for(const v of rows){
      if(!select(u,v))continue;
      if(marketBlocked(u,v)||(v===93.4&&u<27))continue;
      if(!part.includes(u)){advanceRoomRandom(u,v);continue;}
      const n=bands.indexOf(u)*rows.length+rows.indexOf(v);stockLimit=u===67.4?67.5:Infinity;
      if(v<=83.6)fresh(u,v,n);
      else if(v===131.2)plants(u,v,n);
      else if(v>=137){
        // These fronts are boxes/crated flowers in Zq_1050/1250, not vase towers.
        if(!(u===14.2&&v<=148.6)&&!(u>=35&&u<=45&&v===148.6))supplies(u,v,n);
      }
      else if(u<33.6)artificial(u,v,n);
      else christmas(u,v,n);
      // Every sign is OUTSIDE the stock footprint, visible in both travel directions.
      const su=u===67.4?65.1:u===31.6?33.9:u===38.4?36.1:u<33.6?u+2.25:[50,61.6].includes(u)?u-2.25:u+2.25;
      for(const du of [-.25,.25])db(su+du,v,fy+2.58,.012,.012,.22,0x848c7e);
      lsign(named.get(`${u},${v}`)||(v<=83.6?'생화':v===131.2?'관엽식물':v>=137?(n%2?'바구니':'화기 · 화병'):u<33.6?'조화':'크리스마스 장식'),su,v,fy+2.415,.66,.33,'-v',{bg:'#1d6e55',fg:'#f2f2e6',twoSided:true,offset:.025,pxPerM:300,padding:.015});
      for(const dv of [-.95,.95]){
        db(u,v+dv,fc-.6,.02,.02,.6,0x777b70);
        deco('dome',u,v+dv,fc-.67,.07,.07,.14,0xffe2a8,true);
      }
      for(const side of [-1,1])if(u+side*1.95<stockLimit)lquadH(u+side*1.95-.12,v-1.95,u+side*1.95+.12,v+1.95,fy+.012,0x2b7a6e);
    }
    if(name==='조화'&&partIndex===0){
      // Photo01 looks through glass straight into buckets, not an empty lobby.
      stockLimit=Infinity;fresh(17.1,95.8,3);fresh(22.9,95.8,9);
    }
    if(name==='크리스마스'&&partIndex===0){
      stockLimit=Infinity;
      // Photo20's wire display grid bridges the aisle, with ornaments above
      // head height and long pendants at its sides rather than across the path.
      for(let v=109.8;v<125.2;v+=.65)db(47.1,v,fy+2.67,2.15,.018,.018,0x7c8074);
      for(const u of [46.35,47.1,47.85])db(u,117.5,fy+2.67,.018,15.4,.018,0x7c8074);
      // Photo20: much finer wire lattice, varied round ornaments and white tags.
      for(let v=109.8;v<125.2;v+=.22)db(47.1,v,fy+2.66,2.15,.009,.009,0x777767);
      for(let u=46.15;u<48.1;u+=.22)db(u,117.5,fy+2.66,.009,15.4,.009,0x777767);
      for(let n=0;n<96;n++){
        const s=n%2?1:-1,u=47.1+s*.85,v=110.1+Math.floor(n/2)*.30,by=fy+1.95+(n%5)*.09;
        db(u,v,by+.1,.008,.008,fy+2.66-by-.1,0xb7a47d);
        deco('round',u,v,by,.055+(n%3)*.02,.065,.09,[0xd1ae55,0xc02e3d,0xeee9dc,0x638963][n%4]);
        db(u+s*.065,v+.04,by-.05,.012,.055,.1,0xf4eee1);
      }
      for(let n=0;n<54;n++){
        const u=47.1+(n%3-1)*.72,v=110.1+Math.floor(n/3)*.83,y=fy+2.23+(n%4)*.08;
        db(u,v,y+.12,.012,.012,fy+2.67-y-.12,0x989987);
        deco('bloom',u,v,y,.13,.13,.13,[0xd3bb71,0xb92e3e,0xf1e8ce][n%3]);
      }
    }
        },name);
      }
    }
    flowerDetail('꽃시장 보행자·운반 재고',[4,12,71.7,153],()=>{
    stockLimit=Infinity;
    lcrowd(33.8,20,36.2,44.5,fy,12,881);lcrowd(33.8,62,36.2,145,fy,33,883);
    lcrowd(12,86,15.8,91,fy,2,882);lcrowd(25.6,86,63,91,fy,13,884);
    for(const [u0,u1,seed] of [[40.4,42.2,885],[46.2,48,886],[52,53.8,887]])lcrowd(u0,98,u1,126,fy,10,seed);
    for(const [u,v] of [[8.8,34],[8.8,65],[8.8,108],[67.05,41],[67.05,73],[67.05,112],[67.05,143]]){
      for(let k=0;k<3;k++)db(u+(k%2)*.23,v+Math.floor(k/2)*.3,fy,.35,.25,.45+(k%2)*.12,0xf2f2f0);
    }
    });
    // Research supports the chapel and roof garden, not a particular stained glass/pew design.
    lsign('고속터미널성당',38,82.2,45.7,5,.7,'+v',{bg:'#e4e0d6',fg:'#664a43'});
    lzone('고속터미널성당','10F','성당',27,42,50,82,43,48,3);
    for(const v of [66,70,74])for(const u of [33,44])lbox(u,v,43,5,.6,.45,0x917557);
    lbox(38,62,43,2,.8,1,0xd2c4ac);
    lzone('옥상정원','10F','성당 옆 옥외 공간',26,83,49,150,43,48,2);
    for(const v of [98,126]){
      lbox(28,v,43,2,4,.45,0xb2aa9a);K.hpoly('grass',rect(27.1,v-1.8,28.9,v+1.8),43.46);
      lbox(46,v,43,.6,3,.45,0x8d775d);
    }
  }
  function buildWalk13(){
    // Priority 1: preserve the official tenant footprints and GATE1/2/4. The
    // fresh -> decorative/glass -> packing sequence gains a distinct rear edge.
    // Absolute sizes/registration, unlike the observed adjacency, remain guesses.
    lzone('꽃시장 포장 · 운반','3F','화기·부자재 뒤 포장 작업대',26,153,50,158.5,11,16,4);
    lzone('꽃시장 엘리베이터 복도','3F','마주 보는 승강기 · 생화상가',43.1,47,47.5,65.5,11,16,4);
    // Walk15 Zq_230/1780: the real paired lifts open into an enclosed service
    // corridor. Keep both operational shafts and their thresholds exactly where
    // they were; plaster walls wrap them with recessed, 2.6 m wide door bays.
    for(const u of [42.8,47.8]){
      lwall(u,47,u,65.5,11,13.65,{mat:0xe7e7df,thick:.16,openings:[{at:8,w:2.6,y0:11,y1:13.48}]});
      for(const v of [53.7,56.3])lwall(u,v,u<45?43.1:47.5,v,11,13.48,{mat:0xaab0b4,thick:.035});
    }
    K.hpoly(0xe8e8e4,rect(42.8,47,47.8,65.5),13.65,false);
    // Zq_260 continues beside a white service-room wall, with flowers on the
    // opposite side. The old rows remain behind the wall and both ends are open.
    lwall(54.12,43.5,54.12,60.2,11,13.8,{mat:0xe7e7df,thick:.16});
    // The west perimeter is the LEFT of Zq_1250 when walking north. This liner
    // improves its finish; it does not mirror the building or its shop rows.
    lwall(8.12,135.5,8.12,150.4,11,13.8,{mat:0xe7e7df,thick:.09});
    lzone('하차장 끝 세차구역','1F','버스 세차 · 작업 공간',98.5,37,106,52,0,6,4);
    const arrival=bays.filter(b=>b.n===null)[2];
    // Rq_100: the white round column is on the approach's right, with a stepped capital.
    lcyl(arrival.u+2.65,32,.14,.58,5.4,0xe4e5de,{seg:24});
    for(const [y,r,h] of [[3.6,.64,.18],[3.78,.72,.18],[3.96,.8,.2]])
      lcyl(arrival.u+2.65,32,y,r,h,0xe4e5de,{seg:24,solid:false});
    // Only the photographed inclined piers carry the pale boarding canopy.
    const boarding=bays.filter(b=>b.west).sort((a,b)=>a.v-b.v);
    for(let i=1;i<boarding.length;i+=2){
      const v=(boarding[i-1].v+boarding[i].v)/2;
      lbox(78.65,v,0,1.05,1.05,.42,0x262a2c);
      for(let y=.42;y<5.86;y+=.86){
        const h=Math.min(.86,5.86-y),u=78.65-(y+h/2)/5.55*1.45;
        lbox(u,v,y,.88+h/5.55*1.45,.88,h,0xe9e9e2,{skip:['n','s','e','w','top','bottom']});
      }
      const p=(du,dv,y)=>{const[x,z]=W(78.65+du+(y/5.55)*-1.45,v+dv);return[x,y,z];};
      for(const [a,b,n] of [
        [[-.44,-.44],[.44,-.44],[-B[0],0,-B[1]]],
        [[.44,-.44],[.44,.44],[A[0],.25,A[1]]],
        [[.44,.44],[-.44,.44],[B[0],0,B[1]]],
        [[-.44,.44],[-.44,-.44],[-A[0],-.25,-A[1]]]
      ])K.quad(0xe9e9e2,[p(...a,.42),p(...b,.42),p(...b,5.86),p(...a,5.86)],n);
      lbox(78.55,v,5.67,3.1,.88,.19,0xc9cbc6,{solid:false});
    }
    // Priority 2: the walk's cream stone, grey inlays and curved ceiling belong
    // to the 1F UNIQLO approach. No B1 branch is inferred from the edited shorts.
    K.texture('gb13_cream_tile',128,128,(g,w,h)=>{
      g.fillStyle='#e4ded0';g.fillRect(0,0,w,h);g.fillStyle='#c8c2b5';
      g.fillRect(0,0,w,1);g.fillRect(0,0,1,h);
    },[1.2,1.2]);
    K.texture('gb13_platform_brick',128,64,(g,w,h)=>{
      g.fillStyle='#a8a39a';g.fillRect(0,0,w,h);
      for(let j=0;j<4;j++)for(let i=-1;i<4;i++){
        g.fillStyle=(i+j)%2?'#ada79d':'#96948d';
        g.fillRect(i*43+(j%2)*21.5+1,j*16+1,41,14);
      }
    },[.65,.4]);
    function curveCove(u,a,b,y,width,amp){
      // A continuous faceted white lip with a lit inner edge, not floating
      // disconnected light bars. Existing ceiling/upper circulation stays intact.
      const uv=t=>[u+amp*Math.sin(t*PI*2),(a+(b-a)*t)];
      const p=(t,off,h)=>{const[q,v]=uv(t),[x,z]=W(q+off,v);return[x,h,z];};
      for(let k=0;k<40;k++){
        const a=k/40,b=(k+1)/40;
        const v=uv((a+b)/2)[1];if(v>=54&&v<=119)continue; // Straight disc/slot zone, then the relocated S-cove.
        K.quad(0xf1eee7,[p(a,-width/2,y),p(a,width/2,y),p(b,width/2,y),p(b,-width/2,y)],[0,-1,0]);
        for(const s of [-1,1]){
          K.quad(0xe2ded5,[p(a,s*width/2,y),p(b,s*width/2,y),p(b,s*width/2,y+.16),p(a,s*width/2,y+.16)],[s*A[0],0,s*A[1]]);
          K.quad('emit',[p(a,s*(width/2-.1),y-.015),p(b,s*(width/2-.1),y-.015),p(b,s*(width/2-.045),y-.015),p(a,s*(width/2-.045),y-.015)],[0,-1,0]);
        }
      }
    }
    ldetail({floor:'1F',y0:0,y1:6,poly:WEST,name:'가상보행 정문 · 곡선 코브 · 긴 복도'},()=>{
      // Zq_60/80: a blue guide border accompanies the yellow tactile route.
      K.hpoly({tex:'darkstone',color:0xadb0aa,gloss:.3},rect(65.8,-17,75,-.6),.052);
      for(const u of [67.2,73.2])lquadH(u,-17,u+.12,5.7,.056,0x168bbb);
      lquadH(67.2,-16,73.32,-15.88,.057,0x168bbb);
      K.hpoly('gb_tactile',rect(69.8,-17,70.2,25),.059);
      // The grey portal and exterior UNIQLO mark are beside the new clear door.
      for(const u of [67.7,72.3])lbox(u,5.74,0,.42,.6,5.45,0x4c5050,{solid:false});
      lbox(70,5.74,4.8,5,.6,.65,0x4c5050,{solid:false});
      lsign('UNIQLO',66.85,5.39,2.85,.85,.85,'-v',{bg:'#e51b2c',fg:'#fff'});
      for(let h=.2;h<3.35;h+=.12)lbox(63.5,5.82,h,5,.12,.065,0x755642,{solid:false});
      lsign('서울고속버스터미널',63.5,5.68,1.9,3,.45,'-v',{bg:'#ede9df',fg:'#575b59'});
      for(const [a,b] of [[6.2,25],[35,54],[84,136]]){
        K.hpoly({tex:'gb13_cream_tile',gloss:.3},rect(68.2,a,75.25,b),.037);
        for(let v=a+2;v<b-2;v+=9)lquadH(68.4,v,74.9,v+2.4,.039,0xa9aaa4);
        K.hpoly('gb_tactile',rect(70.25,a,70.55,b),.044);
        const cy=a===6.2?3.09:4.27;
        if(a!==6.2)curveCove(71.4,a+.5,b-.5,cy,4.1,.45);
        for(let v=a+2;v<b-1;v+=3.2){if(a===6.2||v>=54&&v<=93)continue;lcyl(74.65,v,cy-.025,.085,.02,'emit',{seg:10,solid:false});}
      }
      // Zq_100: timber upper frieze around the doorway/corridor transition.
      for(let v=26;v<35;v+=.2)lbox(68.05,v,3.7,.09,.055,1.85,0x8a7050,{solid:false});
      curveCove(70.5,23.6,36.9,7.35,5.3,.35);
      // 69_13: black portrait screens along one side, preserving the clear tactile lane.
      for(const v of [39.5,123.5]){
        lbox(68.35,v,0,.3,.76,2.7,0x24292b,{solid:false});
        lsign(['고속버스터미널','승차 안내'],68.53,v,1.58,.65,1.95,'+u',{bg:'#176794',fg:'#e9f6fa'});
        lbox(68.4,v,.02,.52,.88,.08,0xa3aaa7,{solid:false});
      }
      // Zq_120: four blue-screen machines along one wall; older ticket banks remain.
      for(const v of [45,46.1,47.2,48.3]){
        lbox(67.8,v,0,.58,.67,.1,0x454d50);
        lbox(67.8,v,.1,.5,.59,1.67,0x262b30);
        lsign('승차권 발매',68.065,v,1.63,.52,.16,'+u',{bg:'#f0efe9',fg:'#4b5556'});
        lsign(['승차권 예매','경부선 · 영동선'],68.07,v,1.19,.48,.6,'+u',{bg:'#6398c2',fg:'#f0f6fa'});
        lbox(68.075,v,.67,.03,.36,.07,0x39454a,{solid:false});
      }
      // Zq_145: one potted tree at the side of the long cream passage.
      lbox(68.7,102,0,.85,.85,.62,0xa6a69b);
      const[tx,tz]=W(68.7,102);K.tree(tx,tz,{y:.62,h:3.1,kind:'zelkova'});
      // Raised shutter slats stay above the walkable entries and retained shop stock.
      for(const v of [88,100])for(let h=2.2;h<3.25;h+=.075)lbox(34.08,v,h,.025,4.7,.058,0xa8aaa5,{solid:false});
    });
    ldetail({floor:'B1',y0:-6,y1:-2.8,poly:rect(53,47,74,110),name:'가상보행 팩토리스토어 개방 전면'},()=>{
      K.hpoly({tex:'gb13_cream_tile',gloss:.3},rect(53,71.8,73,85.2),-5.972);
      // The existing side glazing/garment rails remain; only the central mouth is open.
      for(const v of [72.6,84.4]){
        lbox(58.1,v,-6,.18,.18,2.45,0x242829,{solid:false});
        lbox(58.8,v+(v<78? .6:-.6),-6,.18,.5,1.2,0x9ca29d,{solid:false});
      }
      // Retain both earlier stocked gondolas in the deeper sales room, leaving
      // the photographed white dish wall and low entry tables unobstructed.
      for(const v of [88,94]){
        lbox(64,v,-6,2.2,1.3,.14,0xbbb6a9);
        for(const du of [-1.08,1.08])lbox(64+du,v,-5.86,.055,1.26,1.6,0xecece5,{solid:false});
        for(let h=.18;h<1.7;h+=.35){
          lbox(64,v,-6+h,2.2,1.3,.045,0xe9e8df,{solid:false});
          for(let k=0;k<6;k++)lbox(63.12+k*.35,v,-5.95+h,.29,1.05,.21,[0xd5c2a3,0x343c42,0xe4ded2][k%3],{solid:false});
        }
      }
      lbox(55,78.5,-3.11,.8,.8,.05,0xc0c2bc,{solid:false});
      for(let k=0;k<9;k++)lbox(54.67+k*.08,78.5,-3.13,.025,.65,.02,0x7f8580,{solid:false});
      // J0LL_2: the entry ceiling carries a soft red wash, not a projecting lip.
    });
    // Priority 3: observed fixtures supplement the retained stock and furniture.
    // None of the early-morning footage establishes that seasonal stock vanished.
    buildWalk17Daiso();
    ldetail({floor:'B1',y0:-6,y1:-2.8,poly:rect(195,8,272,30),name:'가상보행 다이소 노선도 · 펫 · 여행용품'},()=>{
      // Round 15: the close-ups show different products, not the same generic endcap.
      // Keep the complete gondolas behind these front faces and the v13..16 aisle open.
      K.texture('gb15_pet_street',128,512,(g,w,h)=>{
        // The visible north face of a kit box reverses U. Compensate here only.
        g.translate(w,0);g.scale(-1,1);
        g.fillStyle='#f2aa21';g.fillRect(0,0,w,h);g.fillStyle='#9d3825';
        g.save();g.translate(w*.66,20);g.rotate(PI/2);g.font='bold 35px sans-serif';g.fillText('PET STREET',0,0);g.restore();
        g.fillStyle='#a1392b';g.fillRect(w*.21,h*.59,w*.58,h*.36);
        g.fillStyle='#fff4d8';g.font='bold 18px sans-serif';g.textAlign='center';
        [...'반려동물용품'].forEach((c,i)=>g.fillText(c,w*.5,h*.64+i*22));
      },[.31,2.2]);
      K.texture('gb15_clear_pouch',192,160,(g,w,h)=>{
        g.clearRect(0,0,w,h);
        g.strokeStyle='#a69d71';g.lineWidth=3;g.beginPath();g.moveTo(12,h-12);g.lineTo(12,36);g.quadraticCurveTo(12,12,36,12);g.lineTo(w-36,12);g.quadraticCurveTo(w-12,12,w-12,36);g.lineTo(w-12,h-12);g.closePath();g.stroke();
        for(let i=0;i<6;i++){
          const x=37+i%3*57,y=63+Math.floor(i/3)*45;
          g.fillStyle=['#f699c5','#a2cf65','#ffe261'][i%3];g.beginPath();g.arc(x,y,10,0,PI*2);g.fill();
          g.fillStyle='#56595f';g.fillRect(x-5,y-2,2,3);g.fillRect(x+4,y-2,2,3);
          g.fillStyle='#efbace';g.fillRect(x-9,y+4,5,3);g.fillRect(x+6,y+4,5,3);
        }
        g.fillStyle='rgba(255,255,255,.35)';g.beginPath();g.moveTo(16,20);g.lineTo(45,20);g.lineTo(100,h-12);g.lineTo(72,h-12);g.fill();
      },[.27,.22],{transparent:true});
      K.material('gb17_pvc',new K.THREE.MeshPhongMaterial({color:0xe0f0eb,transparent:true,opacity:.35,shininess:90,specular:0xffffff,depthWrite:false,side:K.THREE.DoubleSide}));
      K.texture('gb15_pink_stripe',96,128,(g,w,h)=>{
        g.fillStyle='#f4e7df';g.fillRect(0,0,w,h);g.fillStyle='#ec9aab';
        for(let k=0;k<7;k++)g.fillRect(0,k*20,w,9);
      },[.42,.6]);
      K.texture('gb15_red_tartan',96,96,(g,w,h)=>{
        g.fillStyle='#b24642';g.fillRect(0,0,w,h);g.fillStyle='#263035';
        for(let k=0;k<4;k++){g.fillRect(k*28,0,10,h);g.fillRect(0,k*28,w,10);}
        g.fillStyle='#d4af8b';for(let k=0;k<4;k++){g.fillRect(k*28+4,0,2,h);g.fillRect(0,k*28+4,w,2);}
      },[.4,.4]);
      const pastel=[0xe8bbcd,0x9dcbd4,0xf0e9c6,0xa8c5a3,0xd8bf82];
      function priceTag(u,v,y){
        lbox(u,v,y,.14,.018,.11,0xf2b7cf,{solid:false});
        lbox(u,v-.012,y+.019,.105,.008,.069,0xfffaf4,{solid:false});
        lbox(u,v-.018,y+.038,.055,.004,.012,0xa16a75,{solid:false});
      }
      function shelfFront(u,width,levels){
        for(const du of [-width/2,width/2]){
          lbox(u+du,16.34,-6,.045,.48,2.1,0xe8eaea,{solid:false});
          for(let h=.15;h<2.02;h+=.08)lbox(u+du,16.085,-6+h,.018,.008,.025,0xa1a5a6,{solid:false});
        }
        for(const h of levels){
          lbox(u,16.32,-6+h,width,.5,.045,0xf3f3f1,{solid:false});
          lbox(u,16.06,-6+h,width,.025,.065,0xe4e6e5,{solid:false});
        }
      }
      // zHON_12: red letters on orange are source-observed; orange upright is at screen left.
      lbox(235.9,19.8,-6,.66,.66,3.03,0x65bdc1,{solid:false});
      lbox(235.45,16.09,-5.98,.31,.08,2.2,'gb15_pet_street',{solid:false});
      shelfFront(234.25,2.03,[.16]);
      lbox(234.25,16.53,-5.8,2.04,.045,2.02,0xc6c9c5,{solid:false});
      for(let row=0;row<17;row++)for(let k=0;k<22;k++)lbox(233.3+k*.09,16.5,-5.68+row*.1,.012,.008,.012,0x777d7b,{solid:false});
      // Forty thin hanging packets, with hook shanks, heat-sealed tops and
      // translucent windows; no shelves cutting across the pegboard face.
      for(let row=0;row<5;row++)for(let k=0;k<8;k++){
        const u=233.4+k*.24,h=.3+row*.35,col=[0xd3667e,0x79bcae,0xd6b84c,0x7b94bf,0xc48ba8][(k+row)%5];
        lbox(u,16.35,-6+h+.28,.015,.27,.018,0x959d9c,{solid:false});
        lbox(u,16.23,-6+h,.15,.025,.25,col,{solid:false});
        lbox(u,16.212,-6+h+.02,.13,.008,.14,'gb17_pvc',{solid:false});
        for(let n=0;n<3;n++)lbox(u-.055+n*.055,16.207,-6+h+.035,.035,.02,.07,0xa98a58,{solid:false});
        lbox(u,16.212,-6+h+.18,.13,.008,.06,0xf7f0df,{solid:false});
        lbox(u,16.205,-6+h+.2,.1,.005,.018,[0xbb4565,0x559c83,0xd89425][k%3],{solid:false});
        lbox(u,16.23,-6+h+.24,.15,.032,.012,col,{solid:false});
        if(k%2===0)priceTag(u,16.18,-6+h+.3);
      }
      // zHON_22: three rows of clear character pouches, white metal shelf and pink tags.
      shelfFront(236.7,1.5,[.4,.84,1.28]);
      for(let row=0;row<3;row++)for(let k=0;k<5;k++)for(let d=0;d<2;d++){
        const u=236.11+k*.29,v=16.19+d*.16,h=.445+row*.44;
        lbox(u,v,-6+h,.265,.075,.24,'gb17_pvc',{solid:false});
        lbox(u,v-.043,-6+h,.265,.006,.24,'gb15_clear_pouch',{solid:false,skip:['bottom','top','e','w','s']});
        // A narrow zipper seam, without the old solid handle-like cap.
        lbox(u,v,-6+h+.24,.24,.025,.006,pastel[(k+row)%pastel.length],{solid:false});
        for(const du of [-.125,.125])lbox(u+du,v,-6+h,.003,.075,.24,0xaaa66f,{solid:false});
        if(d===0)lbox(u+.095,v-.046,-6+h+.13,.04,.006,.055,0xf0bad0,{solid:false});
        if(d===0&&k%2===0)priceTag(u,16.032,-6+h-.05);
      }
      // 69B_28: two hanging dog outfits, with cans and small character tins below.
      shelfFront(256,1.34,[.35,.69,1.02]);
      lbox(256.77,16.18,-6,.2,.09,2.26,0xf0aa24,{solid:false});
      lbox(256,16.5,-4.66,1.3,.045,.92,0xe8c568,{solid:false});
      for(const [du,shirt,skirt] of [[-.32,'gb15_pink_stripe','gb15_pink_stripe'],[.32,0x333438,'gb15_red_tartan']]){
        const u=256+du;
        lbox(u,16.28,-4.68,.42,.11,.38,skirt,{solid:false});
        lbox(u,16.28,-4.32,.34,.1,.37,shirt,{solid:false});
        for(const d of [-.2,.2])lbox(u+d,16.28,-4.19,.13,.11,.18,shirt,{solid:false});
        lbox(u,16.28,-3.97,.15,.13,.035,0xf4e7dc,{solid:false});
        for(const d of [-.13,.13])lbox(u+d,16.28,-3.91,.27,.018,.018,0xf2f1e6,{rot:d<0?-.45:.45,solid:false});
      }
      for(let row=0;row<3;row++)for(let k=0;k<6;k++)for(let depth=0;depth<2;depth++){
        const u=255.47+k*.21,v=16.19+depth*.18,h=.395+row*.335;
        lcyl(u,v,-6+h,.083,.15,[0x77a69b,0xd37b58,0xd5aa55][(k+row)%3],{seg:10,solid:false});
        lcyl(u,v,-5.85+h,.084,.012,0xd9dedb,{seg:10,solid:false});
        lbox(u,v-.085,-5.95+h,.115,.012,.063,0xf2e8d1,{solid:false});
        if(depth===0&&k%2===0)priceTag(u,16.032,-6+h-.045);
      }
      // The front display is a low stepped/sloping table, with trays facing
      // the down-looking phone camera and the retained cans/outfits behind it.
      // Five shallow rows follow a 30-degree rise toward the outfits; the
      // nearest row starts at v15.7 and remains clear of the through aisle.
      for(let step=0;step<5;step++){
        const v=15.7+step*.23,h=.67+step*.23*Math.tan(PI/6);
        lbox(256,v,-6+h,1.35,.235,.045,0xf4f0df,{solid:false});
        for(let k=0;k<8;k++){
          const u=255.44+k*.16;
          lbox(u,v,-5.95+h,.145,.19,.035,0xc3a569,{solid:false});
          lbox(u,v,-5.913+h,.12,.16,.008,[0x489f82,0xf0ca45,0xe29fbd,0xe8ebda][k%4],{solid:false});
          lbox(u,v,-5.904+h,.055,.09,.004,0x343c3c,{solid:false});
          if(k===0||k===7){lcyl(u,v,-5.9+h,.045,.09,[0x77a69b,0xd37b58,0xd5aa55][step%3],{seg:8,solid:false});lcyl(u,v,-5.81+h,.045,.008,0xd9dedb,{seg:8,solid:false});}
        }
      }
      // 69B_33: the legible banner says 수성 페인트; bottles and tubes are craft stock.
      shelfFront(262,1.36,[.22,.74,1.26]);
      lsign('수성 페인트',262,16.45,-3.99,1.26,.23,'-v',{bg:'#edc1d4',fg:'#fff',pxPerM:220});
      for(let step=0;step<4;step++){
        const v=15.78+step*.14,h=1.23+step*.075;
        lbox(262,v,-6+h,1.03,.14,.04,0xe8ecea,{solid:false});
        for(let k=0;k<9;k++){
          const u=261.56+k*.11;
          lcyl(u,v,-5.96+h,.025,.1,0xf7f7f0,{seg:8,solid:false});
          lcyl(u,v,-5.86+h,.027,.018,[0xd8272d,0xb9a3d8,0xf2c200,0x2a7fd4][k%4],{seg:8,solid:false});
        }
      }
      lbox(262,16.11,-5.91,1.23,.48,.08,0xe5e6e1,{solid:false});
      for(const u of [261.39,262.61])lbox(u,16.11,-5.83,.035,.48,.2,0xf3f2e9,{solid:false});
      lbox(262,15.87,-5.83,1.23,.035,.16,0xf3f2e9,{solid:false});
      for(let row=0;row<3;row++)for(let k=0;k<12;k++)lcyl(261.46+k*.098,15.96+row*.12,-5.82,.043,.18,0xf3f3ee,{seg:8,solid:false});
      for(let row=0;row<3;row++)for(let k=0;k<6;k++)for(let depth=0;depth<3;depth++){
        // Keep larger existing craft bottles behind the new 36-bottle lip.
        const u=261.45+k*.21,v=16.72+depth*.13,h=.27+row*.52,col=[0xca424a,0x9da6cc,0xe9d852,0x5e9479,0x4588ae,0xe8e8df][(k+depth)%6];
        lcyl(u,v,-6+h,.083,.27,0xf4f4ec,{seg:10,solid:false});
        lcyl(u,v,-5.73+h,.07,.055,0xeeeeea,{seg:10,solid:false});
        lcyl(u,v,-5.675+h,.043,.006,col,{seg:8,solid:false});
        lbox(u,v-.085,-5.96+h,.12,.012,.12,row===1?0x334b53:col,{solid:false});
        if(depth===0&&k%2===0)priceTag(u,16.032,-6+h-.045);
      }
      // Narrow white tubes beside the paint bottles, with bright red/orange cartons behind.
      for(let row=0;row<2;row++)for(let k=0;k<4;k++){
        const u=262.85+k*.13,h=.78+row*.52;
        lbox(u,16.25,-6+h,.11,.12,.3,0xf2f0e8,{solid:false});
        lbox(u,16.179,-5.95+h,.09,.015,.13,k%2?0xc2383c:0xdf8e3e,{solid:false});
        lbox(u,16.25,-6+h-.035,.07,.1,.035,0xd9ddd9,{solid:false});
      }
    });
    ldetail({floor:'1F',y0:0,y1:6,poly:rect(68,24,145,155),name:'가상보행 승차홈 · 하차장 집기'},()=>{
      K.texture('gb19_bus_pictogram',128,128,(g,w,h)=>{
        g.fillStyle='#244b78';g.fillRect(0,0,w,h);g.fillStyle='#f8faf7';
        g.fillRect(29,19,70,77);g.fillRect(21,36,9,29);g.fillRect(98,36,9,29);
        g.fillRect(32,92,12,17);g.fillRect(84,92,12,17);g.fillStyle='#244b78';
        g.fillRect(37,30,54,39);g.fillRect(39,78,12,8);g.fillRect(77,78,12,8);
      },[.43,.43]);
      for(let i=1;i<boarding.length;i+=2){
        const v=(boarding[i-1].v+boarding[i].v)/2;
        lsign('',78.3,v-.49,2.26,.7,.65,'-v',{bg:'#244b78',fg:'#fff'});
        const icon=(u,y)=>{const[x,z]=W(u,v-.51);return[x,y,z];};
        K.quad('gb19_bus_pictogram',[icon(78.515,2.14),icon(78.085,2.14),icon(78.085,2.57),icon(78.515,2.57)],[-B[0],0,-B[1]]);
        lsign('승차',78.3,v-.515,2.035,.4,.13,'-v',{bg:null,fg:'#fff'});
        // Silver posts and short black belts stop before the clear bay door.
        for(const dv of [-1.35,1.35]){
          lcyl(77.55,v+dv,.14,.13,.035,0xaeb8bc,{seg:10,solid:false});
          lcyl(77.55,v+dv,.175,.025,.91,0xaeb8bc,{seg:8,solid:false});
        }
        lbox(77.55,v,1.02,.035,2.7,.055,0x22282a,{solid:false});
      }
      for(const b of bays){
        if(b.west)K.hpoly('gb13_platform_brick',[[75.75,b.v-3.1],[79.2,b.v-1.5],[77.8,b.v+3],[75.75,b.v+3]].map(q=>W(...q)),.146);
      }
      // Rq_100: six perforated compartments, 2.7 m overall, beside the entrance.
      const a=arrival;
      for(let i=0;i<6;i++){
        const u=a.u-4.65+i*.45,v=31.1;
        lbox(u,v,.14,.43,.62,.88,0x353a3c);
        lbox(u,v,1.02,.45,.66,.07,0x202627,{solid:false});
        lbox(u,v+.331,.87,.3,.018,.08,0x13191b,{solid:false});
        lsign(['일반','종이','캔','병','플라스틱','비닐'][i],u,v+.34,.74,.35,.12,'+v',{bg:null,fg:'#c5c9c6'});
        for(let row=0;row<7;row++)for(let col=0;col<5;col++)
          lbox(u-.15+col*.075,v+.321,.28+row*.055,.024,.015,.021,0x82898a,{solid:false});
      }
      for(const u of [a.u-4.93,a.u-2.13]){
        for(const v of [30.8,31.4])lcyl(u,v,.14,.023,.94,0xc7cccd,{seg:8,solid:false});
        lbox(u,31.1,1.06,.046,.6,.046,0xc7cccd,{solid:false});
      }
      lsign('안내',a.u-1.78,30.48,1.63,.18,.24,'+v',{bg:'#ba3e31',fg:'#eee7dc'});
      for(const u of [a.u-.7,a.u+.6])lperson(u,32,.14,{shirt:u<a.u?0x59646f:0x242c38,pants:0x343a40});
      // Rq_300: the wash lane is under the low concrete overhang, ahead-left.
      K.hpoly({color:0x777f7b,gloss:.5},rect(113.8,34.9,124.6,40.9),.035);
      for(let b=-1;b<=6.2;b+=1.2){
        const u=115-1.9*Math.cos(.61)-b*Math.sin(.61),v=36.15-1.9*Math.sin(.61)+b*Math.cos(.61);
        lbox(u,v,0,.22,1.2,.5,0xe2bd35,{solid:false,rot:-.61});
        lbox(u,v,.04,.23,.45,.45,0x252d31,{solid:false,rot:-.61});
      }
      for(let v=35.5;v<40.5;v+=1.2){
        lbox(124.5,v,0,.22,1.2,.5,0xe2bd35,{solid:false});
        lbox(124.5,v,.04,.23,.45,.45,0x252d31,{solid:false});
      }
      lbox(111.8,36.1,0,.9,.9,2,0x2e6f9a,{solid:false});
      lbox(111.8,36.1,.95,.92,.92,.7,0x9db6bf,{solid:false});
      lsign('세차',111.8,36.58,1.55,.72,.28,'+v',{bg:'#28628d',fg:'#fff'});
      for(let v=37;v<40;v+=.32)lbox(115.1,v,.05,.045,.35,.035,0x313c34,{solid:false});
      for(const [u,v] of [[114.1,40.2],[124.5,40.2]]){
        lcyl(u,v,0,.18,.04,0x333b3a,{seg:8,solid:false});
        K.prism([[u-.11,v-.11],[u+.11,v-.11],[u+.11,v+.11],[u-.11,v+.11]].map(q=>W(...q)),.04,.54,{mat:0xdf6b23,solid:false});
      }
      for(const [u,v] of [[115.6,40.2],[119.4,40.2],[123.1,39.9]]){
        lperson(u,v,0,{shirt:0xc6e03a,pants:0x273d4e,rotY:FACE['-v']});
        lbox(u,v+.16,1.15,.42,.025,.055,0xd3dad5,{solid:false});
      }
      for(const u of [114.5,114.95]){
        lbox(u,41.25,.08,.035,.035,1.78,0xb2b7b8,{solid:false});
        lsign(['출차','주의'],u,41.28,1.15,.38,.9,'+v',{bg:'#c62b2b',fg:'#f9efe4'});
      }
    });
    function furnishFlowerWalk17(section){
      const fy=11;
      function carton(u,v,h=.4,label='포장용품',base=fy,w=.65,d=.5){
        lbox(u,v,base,w,d,h,0xc9a066);
        lbox(u,v,base+h-.015,.075,d+.01,.02,0xd2b98d,{solid:false});
        lsign(label,u,v-d/2-.008,base+h*.58,w*.82,.16,'-v',{bg:null,fg:'#4f6141'});
        for(const dv of [-d*.37,d*.37])lbox(u,v+dv,base+h*.55,w+.006,.012,.035,0x947647,{solid:false});
      }
      function tub(u,v,h=.4,base=fy){
        lbox(u,v,base,.65,.5,h,0x2868b1);
        lbox(u,v,base+h,.69,.54,.045,0x397dc4,{solid:false});
        for(let k=0;k<5;k++)lbox(u-.26+k*.13,v-.257,base+.1,.035,.012,h-.13,0x24578b,{solid:false});
      }
      function trolley(u,v,wrapped=false,loaded=false){
        for(const du of [-.29,.29])for(const dv of [-.42,.42])lcyl(u+du,v+dv,fy,.075,.12,0x323b3a,{seg:8,solid:false});
        lbox(u,v,fy+.12,.8,1.1,.12,0x2868b1);
        for(const du of [-.35,.35])lbox(u+du,v+.49,fy+.24,.045,.045,.85,0x367dc1,{solid:false});
        lbox(u,v+.49,fy+1.06,.72,.045,.045,0x367dc1,{solid:false});
        if(loaded)for(let k=0;k<4;k++)lbox(u,v-.36+k*.22,fy+.24,.65,.18,.55,0xe6e4d7,{solid:false});
        if(wrapped){
          K.prism([[u-.34,v-.45],[u+.34,v-.45],[u+.34,v+.45],[u-.34,v+.45]].map(q=>W(...q)),fy+.26,fy+.87,{mat:0xe3e4e1,solid:false});
          for(let n=0;n<4;n++)lbox(u-.27+n*.18,v,fy+.26,.018,.93,.59,0xc3c9c7,{solid:false});
        }
      }
      function worker(u,v,dir=0,shirt=0x536b79){
        const rotY=ROT+dir;
        lperson(u,v,fy,{rotY,shirt,pants:0x313f40,h:1.68});
        // A practical apron and shopping/stock bag distinguish vendors from walkers.
        const du=Math.sin(dir)*.13,dv=Math.cos(dir)*.13;
        lbox(u+du,v+dv,fy+.55,.28,.035,.66,0x60735d,{rot:dir,solid:false});
      }
      function bouquet(u,v,base,col,size=.24,seed=0){
        const [x,z]=W(u,v);
        K.dome({x,z,y:base,rx:size,ry:size*.7,rz:size,mat:0x4f7f3a,seg:6,rings:3,hemi:false});
        // A dense mound of small spherical blooms hides the cut stems.
        for(let n=0;n<14;n++){
          const a=n*2.39996+seed,rr=Math.sqrt(n/14)*size*.94,r=.04+(n%4)*.012;
          const [bx,bz]=W(u+Math.cos(a)*rr,v+Math.sin(a)*rr);
          K.dome({x:bx,z:bz,y:base+size*.5+Math.sqrt(1-n/16)*size*.36,rx:r,ry:r,rz:r,mat:col,seg:6,rings:3,hemi:false});
        }
      }
      function bucket(u,v,col,h=.74,base=fy){
        lcyl(u,v,base,.15,.4,0x263c33,{seg:8,solid:false});
        bouquet(u,v,base+.36+h*.22,col,.24,u+v);
      }
      if(section==='lift'){
      // Enclosed lift hall: continuous cream walls/black skirting and cool flush
      // lights replace the old view of isolated grey shafts in the open market.
      for(const u of [42.9,47.7])for(const [a,b] of [[47,53.7],[56.3,65.5]])lbox(u,(a+b)/2,fy,.035,b-a,.12,0x303b36,{solid:false});
      for(const u of [43.43,47.17]){
        for(const v of [53.74,56.26])lbox(u,v,fy,.045,.09,2.45,{color:0xaab0b4,gloss:.5},{solid:false});
        lbox(u,55,fy+2.45,.045,2.6,.09,{color:0xaab0b4,gloss:.5},{solid:false});
        lsign('3층',u<45?43.5:47.1,55,fy+2.54,.34,.19,u<45?'+u':'-u',{bg:'#313b3c',fg:'#b5d5c8'});
      }
      for(const v of [49.4,52.8,57.3,61.4,64.7]){
        lbox(45.3,v,13.55,.98,.32,.06,0x9eaeb1,{solid:false});
        for(const dv of [-.1,.1])lbox(45.3,v+dv,13.535,.9,.055,.025,'emit',{solid:false});
      }
      for(const [u,v,h] of [[44,50.9,.48],[44.05,60.4,.52],[46.62,59.1,.58],[46.62,60.1,.45],[46.62,61,.55]]){
        carton(u,v,h,v<60?'진로':'포장용품');
        if(v>59.5)carton(u,v,h*.86,'포장용품',fy+h);
      }
      // Retain the three old tubs beyond the handcarts instead of hiding them.
      for(const [u,v] of [[44,66],[44,66.8],[44,67.6],[46.62,62.6]])tub(u,v,.43);
      // Zq_230: silver beverage machine and blue handcart on the right while
      // approaching +v. Previously both were outside this corridor.
      lbox(43.35,57,fy,.9,.8,1.85,{color:0xd7e1df,gloss:.3});
      lbox(43.35,56.58,fy+.46,.79,.035,1.03,{tex:'emit',color:0x2f648b},{solid:false});
      lbox(43.35,56.575,fy+.09,.78,.035,.3,0x2868b1,{solid:false});
      lsign('음료',43.35,56.56,fy+1.68,.78,.22,'-v',{bg:'#edf9ff',fg:'#235a93'});
      for(let j=0;j<3;j++)for(let k=0;k<5;k++){
        lcyl(43.05+k*.14,56.54,fy+.5+j*.31,.04,.21,[0x9dcedf,0xe9e9e0,0xbc4c3e][(j+k)%3],{seg:6,solid:false});
      }
      for(const v of [59.65,61])trolley(43.35,v);
      trolley(43.4,63.7,false,true);carton(43.4,63.7,.48,'포장용품',fy+.8);
      // Glazing starts beyond the preserved lift opening; the original frame's overlap remains unresolved.
      lbox(42.94,61.45,fy+.5,.045,5.5,1.9,doorGlass,{solid:false});
      for(const v of [58.7,60.1,61.5,62.9,64.2])lbox(43,v,fy,.055,.06,2.45,0xf0f0e8,{solid:false});
      for(const h of [.4,2.4])lbox(43,61.45,fy+h,.055,5.5,.06,0xf0f0e8,{solid:false});
      for(const [u,v,col] of [[44,65.2,0xe9b9cb],[46.6,64.8,0xf0d754],[46.6,65.35,0xaf87c0]])bucket(u,v,col);
      worker(46.4,66.3,PI/2);lperson(44.4,66.9,fy,{rotY:ROT+PI,shirt:0x644c5c,pants:0x25373a,h:1.66});
      }
      if(section==='flower'){
      // Zq_260: packed flower display left, a smooth wall and three wrapped
      // delivery carts right; these sit against the wall, clear of the aisle.
      lbox(54.02,51.85,fy,.035,16.7,.12,0x303b36,{solid:false});
      trolley(53.5,53.5,true);
      lbox(51.15,54,fy,1.1,12,.8,0x80654b);
      for(let n=0;n<81;n++)bouquet(50.72+(n%3)*.33,48.03+Math.floor(n/3)*.44,fy+.88+(n%3)*.17,[0xb9a3d8,0xf4f1e8,0xf2d24a,0xf0a8c0][n%4],.27,n);
      for(let n=0;n<8;n++){
        const u=50.9+(n%2)*.3,v=48.4+n*1.4;
        for(let j=0;j<15;j++){
          const [x,z]=W(u+Math.sin(j*.8)*.045,v);
          K.dome({x,z,y:13.35-j*.066,rx:.05,ry:.055,rz:.05,mat:j%4?0xf4f1e8:0xb9a3d8,seg:6,rings:3,hemi:false});
        }
      }
      lbox(52.6,47.9,fy,.65,.6,1.9,0x8a6f50);
      lbox(53.75,47.9,fy,.55,.6,1.9,0x8a6f50);
      lbox(53.2,47.9,fy+2.05,2.2,.1,.42,0x596b54,{solid:false});
      lsign('생화',53.2,48,fy+2.25,1.1,.25,'+v',{bg:null,fg:'#f3efdf'});
      // 0.35m clock fixed to the bare right wall.
      K.texture('gb17_clock',128,128,(g,w,h)=>{g.fillStyle='#333a3c';g.beginPath();g.arc(64,64,63,0,PI*2);g.fill();g.fillStyle='#f5f4ed';g.beginPath();g.arc(64,64,57,0,PI*2);g.fill();g.strokeStyle='#333';g.lineWidth=4;g.beginPath();g.moveTo(64,64);g.lineTo(64,25);g.moveTo(64,64);g.lineTo(91,72);g.stroke();},[.35,.35]);
      lbox(54.015,52.6,fy+2.12,.035,.35,.35,'gb17_clock',{solid:false});
      worker(52.5,46.7,PI,0x58677b);lperson(53.3,44.8,fy,{rotY:ROT+PI/2,shirt:0x373b42,pants:0x3d4642,h:1.7});
      }
      if(section==='back'){
      // Zq_1250: notices and red service pipe remain on the west wall. Facing
      // north places them on the left and the shop stock/blue crates on the right.
      lbox(8.38,144.35,fy+.1,.48,1.2,1.9,0x747f79);
      lsign('분전함',8.64,144.35,fy+1.58,.8,.23,'+u',{bg:'#c5cac3',fg:'#47554b'});
      lcyl(8.3,145.25,fy+.9,.075,1.8,0xd8302a,{seg:16,solid:false});
      for(let n=0;n<20;n++)lcyl(8.3,145.25+n*.04,fy+.825,.075,.15,0xd8302a,{seg:12,solid:false});
      for(let k=0;k<32;k++){
        const col=k%8,row=Math.floor(k/8),v=145.35+col*.14;
        // Visible wall is u8.2. Keep notes in front of it, clear of the
        // electrical cabinet and below the calendar on the far half.
        const h=.94+row*.26-(col>3?.12:0);
        lsign(k%3===0?'입고 안내':k%3===1?'세일':'가격 문의',8.24,v,fy+h,.125,.22,'+u',{bg:k%3?'#f0eee8':'#e9d5bc',fg:'#434f4b',bold:false,pxPerM:220});
      }
      lsign(['11월','일 월 화 수 목 금 토','1  2  3  4  5  6  7','8  9 10 11 12 13 14','15 16 17 18 19 20 21','22 23 24 25 26 27 28'],8.2,146.1,fy+2.15,.5,.7,'+u',{bg:'#f4f1e8',fg:'#434f4b',bold:false,pxPerM:220});
      for(let n=0;n<22;n++){
        const u=8.55+(n%2)*.22,v=134.3+Math.floor(n/2)*.8,[x,z]=W(u,v);
        lcyl(u,v,fy,.13,.3,n%2?0x2868b1:0x81543e,{seg:10,solid:false});
        K.dome({x,z,y:fy+.65,rx:.23,ry:.4,rz:.25,mat:[0x3f754c,0x5f8f45,0x2e5e36][n%3],seg:8,rings:4});
      }
      for(const v of [137,139,141,143,145,147]){
        lbox(12.6,v,fy+.74,1.3,1.6,.06,0xa8afa7);
        for(const dv of [-.65,.65])lbox(12.6,v+dv,fy,.8,.045,.74,0x7f8985,{solid:false});
        tub(12.6,v,.28,fy+.8);
        for(let k=0;k<6;k++)bucket(12.25+(k%2)*.38,v-.53+Math.floor(k/2)*.48,k%2?0xf2cadc:0xf4f1e8,.45,fy+.95);
      }
      for(const [u,v] of [[11.1,139],[11.1,140],[11.1,141]])tub(u,v,.45);
      for(let n=0;n<8;n++)bucket(11.9,135.9+n*.61,[0xf0d754,0xe9b9cb,0xaf87c0,0xe7eee3][n%4],.8+(n%3)*.14);
      worker(10,133.9,PI,0x4e6c6b);lperson(10.35,131.7,fy,{rotY:ROT,shirt:0x596b82,pants:0x303a36,h:1.65});
      // Zq_1050: retain the rear packing area but bring its cartons to the left
      // edge of the route and extend the steel working bench along the right.
      for(const u of [29,29.8,30.6,34.4,35.2,36,40.1,40.9,46.2]){
        carton(u,152.1,.46,u<31?'진로':'포장용품');
        if(u>33&&u<37){carton(u,152.1,.44,'포장용품',fy+.46);carton(u,152.1,.38,'화기',fy+.9);}
      }
      for(const u of [32,32.8])tub(u,152.3,.5);
      lcyl(45,151.2,fy,.45,2.7,0xededdf,{seg:20});
      for(let k=0;k<8;k++)for(let h=0;h<2+(k%2);h++){
        const u=35+k*1.15;carton(u,151.85,.43,'포장용품',fy+h*.43,.85,.66);
        if(k%2)lbox(u,152.195,fy+h*.43+.05,.72,.015,.3,0x273c58,{solid:false});
      }
      lbox(41.5,156.15,fy+.82,15.2,1.15,.065,{color:0xbcc6c3,gloss:.3});
      lbox(41.5,156.7,fy+.885,15.2,.06,.36,0xd3d7d2,{solid:false});
      for(let u=34.2;u<49;u+=2.4)for(const v of [155.65,156.65])lbox(u,v,fy,.055,.055,.82,0xa3afaa,{solid:false});
      for(const u of [36,39,43,44,45,47.8])lbox(u,156.2,fy+.89,.75,.8,.22,0xe7dfcc,{solid:false});
      trolley(38.8,151.8,false,true);trolley(48.2,154.8,false,true);
      for(const u of [40,40.4]){lcyl(u,157,fy,.16,.55,0x91bdce,{seg:10,solid:false});lcyl(u,157,fy+.55,.07,.12,0x4277b2,{seg:8,solid:false});}
      worker(46.6,155.1,PI/2,0x344e67);worker(39.8,152.9,PI,0x74625d);
      lperson(43.1,154.2,fy,{rotY:ROT+PI/2,shirt:0x6c4863,pants:0x394546,h:1.7});
      lperson(48.9,153.7,fy,{rotY:ROT-PI/2,shirt:0x526b7b,pants:0x323e3f,h:1.65});
      }
    }
    for(const [section,bounds,name] of [['lift',[42.8,47,47.8,68],'승강기 복도'],['flower',[48,43,54.3,65],'생화 벽면'],['back',[8,133,55,158.5],'포장 · 부자재']])
      ldetail({floor:'3F',y0:11,y1:16,poly:rect(...bounds),name:`17차 꽃시장 ${name}`},()=>furnishFlowerWalk17(section));
  }

  function buildWalk17Daiso(){
    // gb-L01: short longitudinal shelf faces join the existing perpendicular
    // gondolas. Leave v13..16 clear and preserve the entry cross-passages.
    const palette=[0xf4f1e8,0xef9dba,0xd8272d,0x2a7fd4,0x48ac9d,0xf2c200,0xc6dce6];
    function run(a,b,v,side,height=1.75){
      const len=b-a,u=(a+b)/2;
      lbox(u,v,-6,len,.62,.12,0xf2f2ee);
      lbox(u,v-side*.27,-5.88,len,.045,height-.12,0xe4e8e6,{solid:false});
      for(const du of [-len/2,len/2])lbox(u+du,v,-5.88,.035,.62,height-.12,0xe5e9e7,{solid:false});
      const count=Math.floor(len/.19);
      for(let row=0;row<5;row++){
        const y=-5.85+row*(height-.2)/5;
        lbox(u,v,y,len,.62,.04,0xf4f4ef,{solid:false});
        lbox(u,v+side*.315,y+.015,len,.02,.055,0xf0bdd0,{solid:false});
        for(let k=0;k<count;k++){
          const q=a+.1+k*(len-.2)/Math.max(1,count-1),col=palette[(k+row+Math.floor(a))%palette.length];
          lbox(q,v+side*.06,y+.045,.16,.4,.19+(k%2)*.035,col,{solid:false});
          lbox(q,v+side*.267,y+.075,.11,.012,.095,0xf8f4e7,{solid:false,skip:['top','bottom','e','w']});
        }
      }
    }
    // Split these dense additions geographically, keeping each group small.
    for(const [lo,hi] of [[182,227],[227,271]])ldetail({floor:'B1',y0:-6,y1:-2.8,poly:rect(lo,8,hi,21),name:`B1 다이소 연속 진열 ${lo}`},()=>{
      const centres=[178,...Array.from({length:10},(_,i)=>186.5+i*6),250,256,262,268];
      for(let i=0;i<centres.length-1;i++){
        let a=Math.max(lo,centres[i]+.6),b=Math.min(hi,centres[i+1]-.6);
        if(b-a<.7||blocked((a+b)/2,14.5,(b-a)/2+.25))continue;
        // Break the longitudinal fronts at every second rack gap for cross access.
        if(i%2===0)b-=1.7;
        if(b-a<.7)continue;
        for(const side of [-1,1]){
          if(side<0&&a<254&&b>241)continue; // dedicated north-pocket runs below
          if(side===1&&[[233,237.6],[255.1,257.1],[261.1,263.5]].some(([x0,x1])=>a<x1&&b>x0))continue;
          run(a,b,side<0?12.65:16.35,-side);
        }
      }
      if(lo===227){
        // The former 13m blank north pocket is stocked from v8.5 to 12.95.
        for(const [a,b] of [[241.1,243.2],[244.8,249.35],[250.65,253.4]]){
          run(a,b,12.65,1);
          run(a,b,9.55,1);
        }
        run(240.8,253.6,8.5,1,2.1);
      }
    });
    ldetail({floor:'B1',y0:-6,y1:-2.8,poly:rect(214,8,270,21),name:'B1 다이소 노선도 · 녹화 · 혼잡도'},()=>{
      function routeTexture(key,east){
        K.texture(key,768,256,(g,w,h)=>{
          g.fillStyle='#f5f4ee';g.fillRect(0,0,w,h);
          g.fillStyle='#c82f44';g.fillRect(0,0,w,8);g.fillRect(0,h-12,w,12);
          g.strokeStyle='#828789';g.lineWidth=4;g.beginPath();g.moveTo(40,116);g.lineTo(716,116);g.stroke();
          const labels=['고투몰','4번 출입구','주방 · 욕실','미용 · 인테리어','2번 출입구','문구 · 시즌','1번 출입구','경부선'];
          for(let i=0;i<labels.length;i++){
            const x=44+i*94;
            g.fillStyle='#f5f4ee';g.beginPath();g.arc(x,116,8,0,PI*2);g.fill();g.stroke();
            g.save();g.translate(x+4,98);g.rotate(-PI/4);g.fillStyle=i===7?'#bf293e':'#39444a';g.font='19px sans-serif';g.fillText(labels[i],0,0);g.restore();
          }
          g.fillStyle='#263b42';g.textAlign='right';g.font='bold 27px sans-serif';g.fillText(east?'경부선방면':'고투몰방면',624,190);
          g.font='15px sans-serif';g.fillText(east?'1번 출입구 · 경부선':'4번 출입구 · 고투몰',624,216);
          g.fillStyle='#cd2e40';g.beginPath();g.arc(679,190,30,0,PI*2);g.fill();
          g.strokeStyle='#fff';g.lineWidth=6;g.beginPath();g.moveTo(679,169);g.lineTo(679,208);g.moveTo(664,192);g.lineTo(679,208);g.lineTo(694,192);g.stroke();
        },[2.2,.74]);
      }
      routeTexture('gb17_route_east',true);routeTexture('gb17_route_west',false);
      for(const u of [215,242,265]){
        for(const v of [13.9,15.1])lbox(u,v,-3.24,.018,.018,.27,0xa9b0ac,{solid:false});
        lbox(u,14.5,-3.98,.06,2.2,.74,0xf4f2eb,{solid:false});
        for(const s of [-1,1]){
          const q=(v,y)=>{const[x,z]=W(u+s*.035,v);return[x,y,z];};
          const left=s<0?13.4:15.6,right=s<0?15.6:13.4;
          K.quad(s<0?'gb17_route_east':'gb17_route_west',[q(left,-3.98),q(right,-3.98),q(right,-3.24),q(left,-3.24)],[s*A[0],0,s*A[1]]);
        }
      }
      // Source-observed summer POP and artificial ivy suspended along shelf tops.
      lsign(['COOL','SUMMER'],246.2,13.1,-3.75,.62,.85,'-u',{bg:'#2e9bd5',fg:'#fff',twoSided:true});
      lbox(246.2,13.1,-3.32,.02,.02,.35,0xa7b0a9,{solid:false});
      for(let u=235;u<254;u+=1.5)for(const v of [12.8,16.2]){
        lbox(u,v,-3.85,.015,.015,.86,0x5e7041,{solid:false});
        for(let k=0;k<6;k++){
          const q=u+(k%2?-.075:.075),[x,z]=W(q,v);
          K.dome({x,z,y:-3.76+k*.12,rx:.11,ry:.065,rz:.04,mat:k%2?0x497343:0x638348,seg:5,rings:2,hemi:false});
        }
      }
      // Twelve extra shoppers in the crowded 69B_18 section; _12 retains a
      // clear central foreground at u248..250 and nobody stands in shelf stock.
      const shirts=[0xd84039,0xe7dfd2,0x364e6e,0x717d58,0xce9cbb,0x303638];
      for(let i=0;i<12;i++){
        const u=i<2?246.3:236.3+Math.floor(i/2)*1.7,v=i%2?15.35:13.55;
        lperson(u,v,-6,{shirt:shirts[i%shirts.length],pants:i%3?0x393d42:0xc2baaa,rotY:FACE[i%2?'-u':'+v']});
      }
      for(const u of [240.4,246.5])for(let n=0;n<6;n++){
        lbox(u,16.25,-5.96+n*.055,.43,.33,.035,0xd22a42,{solid:false});
        for(const du of [-.205,.205])lbox(u+du,16.25,-5.93+n*.055,.02,.33,.13,0xd22a42,{solid:false});
        for(const dv of [-.155,.155])lbox(u,16.25+dv,-5.93+n*.055,.43,.02,.13,0xd22a42,{solid:false});
      }
    });
  }

  function buildWalk15Public(){
    // Round15: poses are stored before geometry edits in modeling.trace.
    // Public-area corrections retain the surveyed envelope, doors and routes.
    K.texture('gb15_wet_paving',128,128,(g,w,h)=>{
      g.fillStyle='#8c8e8d';g.fillRect(0,0,w,h);
      const r=K.rand(1501);for(let i=0;i<650;i++){g.fillStyle=i%2?'#858b8d':'#70797c';g.fillRect(r()*w,r()*h,1,1);}
      g.fillStyle='#697174';g.fillRect(0,0,w,1);g.fillRect(0,0,1,h);
    },[1.2,1.2]);
    K.texture('gb15_hall_tile',128,128,(g,w,h)=>{
      g.fillStyle='#cecac0';g.fillRect(0,0,w,h);g.fillStyle='#b2b0a8';g.fillRect(0,0,w,1);g.fillRect(0,0,1,h);
    },[1.2,1.2]);
    // Rq_300: low working overhang beside the arrival lane, distinct from the
    // high glazed boarding shelter. Its open ends leave the apron continuous.
    lbox(111.5,37.7,4.5,27,6,.36,0x6f6c66,{solid:false});
    lbox(111.5,40.62,4.17,27,.24,.33,0x6f6c66,{solid:false});
    for(const u of [99,108,117,124])lbox(u,39.7,0,.48,.48,4.5,0xa7aaa5);
    lwall(98,34.6,125,34.6,0,4.5,{mat:0xb7bab3,thick:.15,
      openings:[{at:6,w:5,y0:0,y1:3.8},{at:17,w:5,y0:0,y1:3.8}]});
    ldetail({floor:'1F',y0:0,y1:6,poly:rect(58,-29,126,137),name:'15차 광장 · 로비 · 대합실 보행자'},()=>{
      K.hpoly({tex:'gb15_wet_paving',gloss:.3},rect(61,-29,97,-.65),.061);
      // Continuous blue route border, with the photographed turn at the door.
      for(const u of [67.2,73.2])lquadH(u,-28,u+.12,3.2,.065,0x2a8fd0);
      lquadH(67.2,3.08,73.32,3.2,.066,0x2a8fd0);
      K.hpoly('gb_tactile',rect(69.8,-29,70.2,4.8),.067);
      for(const [u,v,w,d] of [[79,-17,5.2,2.1],[87,-11,4,1.7],[64,-23,3,2.4]])
        lbox(u,v,.062,w,d,.002,{color:0x899597,gloss:.7},{solid:false});
      for(const u of [67.7,72.3])lbox(u,5.53,0,.42,.7,4.8,0x454a4c,{solid:false});
      lbox(70,5.5,4.8,5.1,.7,.65,0x454a4c,{solid:false});
      lbox(63.4,5.65,1.45,1.45,.15,.9,0x313a3d,{solid:false});
      lsign('터미널 이용 안내',63.4,5.55,1.9,1.27,.7,'-v',{bg:'#c4d3d7',fg:'#404a4d'});
      for(const v of [1.2,4.1])for(let u=65;u<73;u+=1.6)lcyl(u,v,5.59,.065,.025,'emit',{seg:8,solid:false});
      for(const [u,v,col] of [[73,-6,0x292f36],[80,-11,0x4e5a63],[86,-7,0x7c8277]])
        lperson(u,v,0,{h:1.68,shirt:col,pants:0x2c3338,rotY:FACE['+v']});

      // Zq_100 views bay16 front-on, rather than looking down the food row.
      K.hpoly({tex:'gb13_cream_tile',color:0xf4eee2,gloss:.5},rect(67.4,26,75.25,35),.047);
      for(const v of [26.8,32.1])lquadH(67.5,v,73.8,v+1.6,.049,0x969996);
      K.hpoly('gb_tactile',rect(70.25,26,70.55,35),.052);
      lbox(72,34.66,0,.22,1.05,3.1,0x292c31,{solid:false});
      lbox(71.875,34.66,.16,.025,.95,2.86,{tex:'emit',color:0xd6b2eb},{solid:false});
      lsign('서울고속버스터미널',71.85,34.66,2.74,.9,.22,'-u',{bg:null,fg:'#57516f'});
      for(const [u,v] of [[68.5,23.5],[68.4,36.5],[73.1,38.5],[73.8,20.4],[71.5,40.5],[68.3,19.1]]){
        lperson(u,v,0,{h:1.65+(v%3)*.03,shirt:[0x424951,0xa8a28f,0x60716b][Math.floor(v)%3],rotY:FACE[u>72?'-u':'+v']});
        if(u>72)lbox(u+.3,v,.52,.22,.14,.3,0xcbbca4,{solid:false});
      }
      for(const [i,u,v] of [[0,72.3,27.3],[1,73.1,28.5],[2,72.5,31.4],[3,74.2,32.2],[4,73.9,34.4],[5,74.8,29.6]])
        lperson(u,v,0,{h:1.65+i*.012,shirt:[0x343a3f,0xb9b3a6,0x5e7370][i%3],pants:0x343b40,rotY:FACE[i%2?'+v':'-v']});

      // 69B_8: broad oval coffer above the UNIQLO approach; store stays official #35.
      K.hpoly({tex:'gb13_cream_tile',gloss:.5},rect(66.2,6.2,75.25,23),.047);
      for(const v of [8.5,19.8])lquadH(66.3,v,74.9,v+1.6,.049,0xa5a7a1);
      const oval=(rx,rz,h)=>Array.from({length:64},(_,k)=>{
        const a=k*PI/32,[x,z]=W(68.8+rx*Math.cos(a),15+rz*Math.sin(a));return[x,h,z];
      });
      const outer=oval(2.2,3.4,3.075),inner=oval(2.0,3.2,3.075),lit=oval(1.86,3.06,3.07),fascia=oval(1.86,3.06,3.5);
      const ovalHole=outer.map(([x,y,z])=>[x,z]);
      K.hpoly(0xefeeea,rect(66.2,6.2,75.25,23),3.075,false,[ovalHole]);
      K.hpoly(0xf1efe9,ovalHole,3.5,false);
      for(let k=0;k<64;k++){
        const n=(k+1)%64;K.quad(0xf4f2ec,[outer[k],outer[n],inner[n],inner[k]],[0,-1,0]);
        K.quad('emit',[inner[k],inner[n],lit[n],lit[k]],[0,-1,0]);
        K.quad(0x1b1d1f,[lit[k],lit[n],fascia[n],fascia[k]],[-A[0]*Math.cos(k*PI/32)-B[0]*Math.sin(k*PI/32),0,-A[1]*Math.cos(k*PI/32)-B[1]*Math.sin(k*PI/32)]);
      }
      for(let k=0;k<8;k++)lcyl(68.8+2.4*Math.cos(k*PI/4),15+3.6*Math.sin(k*PI/4),3.045,.07,.02,'emit',{seg:8,solid:false});
      for(const [u,v] of [[67.2,12.7],[68.6,13.5],[69,16.8],[70.8,17.6],[66.8,18.6],[71.2,11.6],[68,10.8],[65.2,15.8]]){
        lperson(u,v,0,{h:1.67,shirt:[0x30383e,0xc4b8a3,0x5a6a68,0x9c7e74][Math.floor(v)%4],rotY:FACE[u<69?'+u':'-u']});
        if(u<69)lbox(u+.29,v,.56,.27,.17,.34,0xc4b394,{solid:false});
      }
      // Zq145/170 are the opposite walking direction to the shorts' ad-screen view.
      for(const [a,b] of [[35,54],[84,136]]){
        K.hpoly({tex:'gb15_hall_tile',gloss:.5},rect(68.2,a,75.25,b),.047);
        for(let v=a+2;v<b-1;v+=9)lquadH(68.4,v,74.9,Math.min(v+2.4,b),.049,0x999d9b);
        K.hpoly('gb_tactile',rect(70.25,a,70.55,b),.052);
        for(let v=a+2;v<b-1;v+=4.2){
          if(v<54||v>93)lcyl(68.5,v,4.24,.6,.026,{tex:'emit',color:0xe8e9e5},{seg:24,solid:false});
          if(v<85||v>110)lbox(74.7,v,4.22,.15,4.2,.035,'emit',{solid:false});
        }
      }
      for(let v=54;v<=92;v+=4.2)lcyl(72.3,v,4.24,.6,.026,{tex:'emit',color:0xe8e9e5},{seg:24,solid:false});
      lbox(74.7,73.5,4.22,.15,39,.035,'emit',{solid:false});
      lbox(68.7,79,0,.85,.85,.62,0xadb1a8);
      const [tx,tz]=W(68.7,79);K.tree(tx,tz,{y:.62,h:3.1,kind:'zelkova'});
      lbox(60.2,109,3.02,2.7,.18,1.05,0x293237,{solid:false});
      lsign('고속버스터미널',60.2,109.11,3.55,2.45,.83,'+v',{bg:'#45689a',fg:'#e0eaf6'});
      lperson(72.9,47.7,0,{h:1.7,shirt:0xd93a2e,pants:0x303138,rotY:FACE['-v']});
      // The closed black umbrella is beside the red jacket, clear of the camera axis.
      lbox(73.22,47.65,.06,.065,.07,.95,0x282d30,{solid:false});
    });

    ldetail({floor:'B1',y0:-6,y1:-2.8,poly:rect(48,70,74,96),name:'15차 팩토리스토어 복도 접근 · 상품 전면'},()=>{
      const y=LEVELS.B1;
      K.hpoly({tex:'gb13_cream_tile',gloss:.5},rect(48,71.8,58,85.2),y+.04);
      // All three frames are outside, with the complete fascia and clear foreground.
      for(const v of [73.95,83.05])lbox(57.92,v,y,.32,.32,2.98,0x1a1a1a,{solid:false});
      for(const v of [74.16,82.84])lbox(57.74,v,y+.08,.035,.035,2.35,{tex:'emit',color:0xbd3b2c},{solid:false});
      K.hpoly(0x241f1c,rect(58.2,72,67,85),y+2.68,false);
      for(const u of [59.2,62.4,65.6])for(const v of [74.8,78.5,82.2]){
        lbox(u,v,y+2.79,.055,2.65,.06,0x313735,{solid:false});
        lcyl(u,v,y+2.62,.065,.04,{tex:'emit',color:0xffebce},{seg:8,solid:false});
      }
      for(const u of [66.5,68.5])for(const v of [88,94]){
        lbox(u,v,y,.75,2.2,.12,0x343b3b);
        for(const dv of [-1.07,1.07])lbox(u,v+dv,y,.045,.045,2.2,0x6a7473,{solid:false});
        for(let tier=0;tier<5;tier++){
          lbox(u,v,y+.22+tier*.4,.8,2.2,.045,0xddd9ca,{solid:false});
          for(let k=0;k<9;k++){
            lbox(u,v-.96+k*.24,y+.27+tier*.4,.61,.2,.28,[0xc7a06a,0x3c4445,0xe4ded0,0x8d634b][(tier+k)%4],{solid:false});
            lbox(u-.315,v-.96+k*.24,y+.31+tier*.4,.012,.14,.08,0xf0e8cc,{solid:false});
          }
        }
      }
      lsign(['30–80%','특별 혜택'],57.66,73.3,y+1.43,1.05,1.8,'-u',{bg:'#eee6d3',fg:'#78462f'});
      lbox(58.4,83.8,y,1.1,1.1,.95,0xad2729);
      lsign('상품 안내',57.66,83.75,y+2.01,.68,1.15,'-u',{bg:'#2466ac',fg:'#edf3f5'});
      lbox(52.9,78.5,y+.044,.58,.73,.012,{color:0x666f70,gloss:.5},{solid:false});
      lbox(52.9,78.5,y+.058,.32,.46,.008,{tex:'emit',color:0xa2dace},{solid:false});
      for(const [u,v,col] of [[54,76.5,0x24282e],[55.7,79.8,0xbaa88c],[55.2,81.3,0x343b46],[62.1,78.6,0x777e6b]]){
        lperson(u,v,y,{h:1.7,shirt:col,pants:0x30353b,rotY:FACE[v<78?'+v':'-v']});
        lbox(u+.3,v,y+.54,.26,.17,.33,0x58535c,{solid:false});
      }
    });

    ldetail({floor:'1F',y0:0,y1:6,poly:rect(76,32,174,145),name:'15차 승차장 줄막이 · 하차 승객 · 세차 차로'},()=>{
      for(const v of [88,96,104,112,120,128]){
        K.hpoly('gb_tactile',rect(76.1,v-2,76.45,v+2),.155);
        lperson(76.6,v+.8,.14,{h:1.7,shirt:0x596570,rotY:FACE['+u']});
        if(v%16===0)lbox(76.92,v+.8,.14,.28,.22,.57,0x826e5c,{solid:false});
      }
      // jp_130: the attendant is beside the bay-6 pier, ahead-left of camera19.
      lperson(80.05,102.4,.14,{h:1.72,shirt:0xc6e03a,pants:0x2a3843,rotY:FACE['+u']});
      const arrival=bays.filter(b=>b.n===null)[2];
      for(const [du,v,col] of [[-.9,30.65,0x303c48],[.1,30.8,0x5f675c],[1.15,31.3,0x39343f]]){
        lperson(arrival.u+du,v,.14,{h:1.7,shirt:col,rotY:FACE['-v']});
        lbox(arrival.u+du+.3,v,.14,.28,.23,.58,0x544e5a,{solid:false});
      }
      // Rq_300: 2 m Jersey sections follow a 20 degree right bend beginning
      // 8 m in front of camera22. The two sloping faces carry diagonal paint.
      const cv=u=>u<=116?42.1:u<=146?128.1-Math.sqrt(86*86-(u-116)*(u-116)):47.502+.372*(u-146);
      for(let u=108;u<151;u+=2.1){
        const v=cv(u),angle=Math.atan2(cv(u+.1)-cv(u-.1),.2),cs=Math.cos(angle),sn=Math.sin(angle);
        const p=(t,s,y)=>{const[x,z]=W(u+t*cs-s*sn,v+t*sn+s*cs);return[x,y,z];};
        lbox(u,v,0,2,.7,.8,0xf2c200,{rot:-angle,skip:['n','s','e','w','top','bottom']});
        const levels=[[.36,.02],[.36,.15],[.13,.55],[.1,.8]];
        for(const side of [-1,1])for(let k=1;k<levels.length;k++){
          const [s0,y0]=levels[k-1],[s1,y1]=levels[k];
          K.quad('gb17_jersey',[p(-1,side*s0,y0),p(1,side*s0,y0),p(1,side*s1,y1),p(-1,side*s1,y1)],[side*B[0],.35,side*B[1]]);
        }
        K.quad(0xf2c200,[p(-1,-.1,.8),p(1,-.1,.8),p(1,.1,.8),p(-1,.1,.8)],[0,1,0]);
        for(const end of [-1,1])for(let k=1;k<levels.length;k++){
          const [s0,y0]=levels[k-1],[s1,y1]=levels[k];
          K.quad(0xf2c200,[p(end,-s0,y0),p(end,s0,y0),p(end,s1,y1),p(end,-s1,y1)],[end*A[0],0,end*A[1]]);
        }
      }
      for(let i=0;i<6;i++){
        const u=110+i*1.2,v=cv(u)-1.05;
        lcyl(u,v,0,.1,1,0xed7a32,{seg:10,solid:false});
        for(const y of [.52,.75])lcyl(u,v,y,.105,.1,0xebe9de,{seg:10,solid:false});
      }
      for(const u of [103,112,121])lbox(u,37.6,4.42,1.3,.25,.055,'emit',{solid:false});
      lperson(113.2,41,0,{h:1.7,shirt:0x3b4d67,pants:0x39434d,rotY:FACE['+u']});
    });
  }

  function buildWalk17Interiors(){
    lwall(34,150.9,46,150.9,11,13.65,{mat:0xe7e7df,thick:.12});
    // Zq_120: a locally enclosed 5.8 m throat; both ends and the tactile spine stay open.
    K.material('gb19_lit_plaster',new K.THREE.MeshLambertMaterial({color:0xeceae4,emissive:0x3a3a36}));
    lwall(67.3,43.5,67.3,56,0,4.4,{mat:'gb19_lit_plaster',thick:.16});
    lwall(73.4,43.5,73.4,56,0,4.4,{mat:0xeceae4,thick:.16});
    for(const [u,face] of [[67.3,1],[73.4,-1]]){
      const plaster=u===67.3?'gb19_lit_plaster':0xeceae4;
      lcyl(u,50.5,0,.6,4.4,plaster,{seg:24});
      for(const v of [43.5,56])lcyl(u,v,0,.35,4.4,plaster,{seg:16});
      if(u===67.3)for(const v of [49.9,51.1])lbox(67.39,v,0,.025,.03,4.4,0xc9c6be,{solid:false});
    }
    // D07: lowered plain service soffit hides the old acoustic tiles only in the verified back rooms.
    K.hpoly(0x8f9498,rect(8,70,55,158),13.76,false,holes(rect(8,70,55,158),11));
    K.hpoly(0x8f9498,rect(48,43,54.3,65),13.76,false);
    ldetail({floor:'1F',y0:0,y1:7.4,poly:rect(65,6,76,137),name:'17차 흰 통로 · 곡선 조명 · 안내 화면'},()=>{
      // A framed landscape and low utility box replace the door-bank appearance here.
      lbox(73.27,49,1.2,.06,2,1.2,0x8d8981,{solid:false});
      lbox(73.23,49,1.25,.025,1.9,1.1,0xf0ede4,{solid:false});
      for(let k=0;k<9;k++)lbox(73.21,48.25+k*.19,1.46+(k%4)*.09,.012,.2,.4,[0x7d9b96,0xcbb995,0xa8b1ad][k%3],{solid:false});
      lbox(72.96,51.2,0,.5,.7,.55,0xf0f0e8);
      for(let v=84;v<137;v+=6)lbox(75.2,v,0,.8,.8,4.4,0x8e9191,{solid:false});
      // L07: portrait blue displays on the west side (camera07's right).
      // Four screens form the photographed row; preserve the fifth behind
      // camera05 so it cannot become another foreground blocker there.
      for(const v of [95,95+8/3,95+16/3,103,126]){
        lbox(69.2,v,0,.4,1,2.6,0x1c2230);
        lbox(69.415,v,.34,.025,.85,2.05,{tex:'emit',color:0x2f6fd0},{solid:false});
        lsign('승차 안내',69.435,v,2.11,.75,.2,'+u',{bg:null,fg:'#edf5ff'});
        for(const dv of [-.6,.6])lcyl(69.7,v+dv,0,.025,.45,0xc4cdcc,{seg:8,solid:false});
        lbox(69.7,v,.42,.045,1.2,.045,0xc4cdcc,{solid:false});
      }
      // Continuous S-shaped LED strip, with white cove lip and a cassette beside it.
      const ribbon=(u,a,b,y,amp,width,mat)=>{
        const p=(t,o)=>{const[x,z]=W(u+amp*Math.sin(t*PI*4)+o,a+(b-a)*t);return[x,y,z];};
        for(let k=0;k<80;k++){
          const t=(k+.5)/80,v=a+(b-a)*t,uu=u+amp*Math.sin(t*PI*4);
          if(y>4&&v>108.5&&v<111&&uu-width/2<72)continue;
          K.quad(mat,[p(k/80,-width/2),p((k+1)/80,-width/2),p((k+1)/80,width/2),p(k/80,width/2)],[0,-1,0]);
        }
      };
      K.hpoly(0xefeeea,rect(69.4,94,75.3,119),4.31,false,[rect(69.4,108.5,72,111)]);
      ribbon(72.2,94,119,4.28,1.5,.45,0xf7f5ed);
      ribbon(72.2,94,119,4.265,1.5,.3,'emit');
      lbox(70.5,97,4.27,.9,.9,.04,0xd1d3cc,{solid:false});
      for(let k=0;k<8;k++)lbox(70.2+k*.085,97,4.255,.025,.7,.02,0x777e7e,{solid:false});
      // C03: dark arc nearest the viewer, separated from the oval's illuminated lip.
      ribbon(71.8,8,22,3.03,.35,.28,0x1b1d1f);
      // D04: gallery frieze spans the whole lobby rather than only a door surround.
      for(let v=23.5;v<37;v+=.18)lbox(73.52,v,4,.1,.06,2,0x8b7455,{solid:false});
      lbox(73.43,30.25,3.85,.38,13.6,.15,0xf3f0e7,{solid:false});
      lbox(73.21,30.25,3.83,.07,13.6,.035,'emit',{solid:false});
      // D03: screen sits IN the curved white bulkhead; dark slats belong to its adjacent pier.
      K.texture('gb17_sea_screen',512,224,(g,w,h)=>{
        const grad=g.createLinearGradient(0,0,0,h);grad.addColorStop(0,'#a2b7dc');grad.addColorStop(.42,'#d4c6de');grad.addColorStop(.43,'#568bb1');grad.addColorStop(1,'#305d88');g.fillStyle=grad;g.fillRect(0,0,w,h);
        g.fillStyle='#16345e';g.fillRect(0,0,w*.22,h);g.fillStyle='#f4f6f4';g.font='20px sans-serif';g.fillText('여행의 시작',12,45);
        for(let k=0;k<18;k++){g.fillStyle=k%2?'#85b3cb':'#437ba7';g.fillRect(w*.23+(k*39)%350,h*.5+k*5,60,2);}
        const map=g.canvas?new K.THREE.CanvasTexture(g.canvas):null;
        if(map)map.colorSpace=K.THREE.SRGBColorSpace;
        K.material('gb17_sea_led',new K.THREE.MeshBasicMaterial({map,color:0xffffff}));
      },[5,2.2]);
      lbox(69.2,109.6,2.55,5.45,.36,2.55,0xf0efea,{solid:false});
      const screen=(u,y)=>{const[x,z]=W(u,109.84);return[x,y,z];};
      K.quad('gb17_sea_led',[screen(66.7,2.7),screen(71.7,2.7),screen(71.7,4.9),screen(66.7,4.9)],[B[0],0,B[1]]);
      K.hpoly(0xf1eee7,rect(66.5,108.5,72,111),5.12,false);
      for(let v=108.6;v<111;v+=.12)lbox(66.3,v,0,.12,.055,4.9,0x3a3a38,{solid:false});
      lbox(66.94,114.2,.25,.08,6,3,{tex:'gb8_foliage',color:0x79a75f},{solid:false});
      for(let k=0;k<360;k++){
        const[x,z]=W(67.03+(k%3)*.025,111.28+(k%30)*.2);
        const r=.08+(k%5)*.017;
        K.dome({x,z,y:.37+Math.floor(k/30)*.23,rx:r,ry:r,rz:r,mat:[0x4f7f3a,0x6c914f,0x315d38][k%3],seg:6,rings:3,hemi:false});
      }
      ribbon(70.8,112,128,4.18,1.05,5,0xf1eee7);
      ribbon(73.2,112,128,4.16,1.05,.1,'emit');
    });
    ldetail({floor:'B1',y0:-6,y1:-2.8,poly:rect(56,72,66,85),name:'17차 팩토리스토어 식기 · 낮은 진열대'},()=>{
      const y=LEVELS.B1;
      // Left wall faces into the entry: five white shelves, stocked with cups and nested bowls.
      lbox(62,72.45,y,7.7,.48,2.2,0xe8e7df);
      for(let tier=0;tier<5;tier++){
        lbox(62,72.76,y+.2+tier*.4,7.7,.64,.05,0xf0eee4,{solid:false});
        for(let k=0;k<23;k++){
          const u=58.5+k*.31,yy=y+.26+tier*.4;
          lcyl(u,72.8,yy,.105,.12,0xf2eee3,{seg:10,solid:false});
          if(k%3===0)lcyl(u,72.8,yy+.12,.1,.035,0xdfdfd4,{seg:10,solid:false});
        }
      }
      for(const [u,v] of [[59.4,77.4],[61.6,78.5],[64,79.2]]){
        lbox(u,v,y,1.6,.9,.8,0x9e7851);
        for(let k=0;k<20;k++)lbox(u-.65+(k%5)*.3,v-.22+(Math.floor(k/5)%2)*.42,y+.8+Math.floor(k/10)*.16,.26,.34,.16,[0xe4d9bb,0xd3b393,0xf2ede0][k%3],{solid:false});
      }
      lbox(59.1,83.55,y,.75,.7,1.9,0xad2729);
      for(let h=.25;h<1.9;h+=.4)lbox(59.1,83.15,y+h,.7,.3,.04,0xe1594d,{solid:false});
      K.material('gb19_factory_wash',new K.THREE.MeshLambertMaterial({color:0xc8402e,emissive:0x38120b}));
      K.hpoly('gb19_factory_wash',rect(56.85,73.8,57.95,83.2),y+3.025,false);
      lsign('비상구',57.0,78.8,y+2.92,.4,.2,'-u',{bg:'#27a883',fg:'#f4fff6'});
      for(const u of [60,63.4,66.8])for(const v of [73.9,77,80.1])lcyl(u,v,y+2.61,.055,.03,{tex:'emit',color:0xffdfb6},{seg:8,solid:false});
      lcyl(65,77,y+2.62,.065,.04,{tex:'emit',color:0xffebce},{seg:8,solid:false});
    });
    ldetail({floor:'3F',y0:11,y1:16,poly:rect(8,43,55,158),name:'17차 꽃시장 회색 설비천장'},()=>{
      for(const u of [12,32,50])lbox(u,114,13.48,.32,85,.22,0x7c8185,{solid:false});
      for(let v=72;v<157;v+=5.1)for(const u of [10,22.8,35,46.5,52.8]){
        if(blocked(u,v,1.2))continue;
        const rot=(Math.round(v)%3-1)*.16;
        lbox(u,v,13.55,.3,1.25,.05,0x757c7e,{solid:false,rot});
        for(const du of [-.075,.075])lbox(u+du,v,13.53,.045,1.2,.025,'emit',{solid:false,rot});
      }
      for(const v of [46,49.5,53,56.5,60]){
        lbox(52.8,v,13.55,.3,1.25,.05,0x757c7e,{solid:false,rot:.12});
        for(const du of [-.075,.075])lbox(52.8+du,v,13.53,.045,1.2,.025,'emit',{solid:false,rot:.12});
      }
      // Zq_1050 looks along +u at v154, between the old light rows. Place
      // eight exposed twin battens in that sightline, below the grey soffit.
      const batten=(u,v,rot)=>{
        lbox(u,v,13.53,1.25,.3,.05,0x757c7e,{solid:false,rot});
        for(const dv of [-.075,.075]){
          const du=dv*Math.sin(rot),vv=dv*Math.cos(rot);
          lbox(u+du,v+vv,13.505,1.2,.045,.025,'emit',{solid:false,rot});
        }
      };
      for(const [u,v,rot] of [[38,153.2,.1],[41,154.8,-.24],[44.8,153.1,.35],[48,155,-.12],[51.5,153.5,.16],[40,156.4,.5],[46,156.6,-.35],[53.1,156.1,.2]])batten(u,v,rot);
      // Matching bare fixtures over the pipe/stock aisle in Zq_1250.
      for(const [i,v] of [143.8,140.2,136.5,132.7].entries())batten(10.5,v,PI/2+(i%2?-.12:.18));
      for(const [u,v] of [[42,154],[10.8,137.8]]){
        lbox(u,v,13.48,.9,.9,.1,0xc1c4bf,{solid:false});
        lbox(u,v,13.465,.6,.6,.015,0x707a79,{solid:false});
        for(let k=0;k<7;k++)lbox(u-.25+k*.083,v,13.45,.027,.55,.016,0xa7aeaa,{solid:false});
      }
    });
  }

  function buildForecourt(){
    // gb_03 + aerial: the arch belongs to the terminal's pedestrian forecourt.
    // Local v=-47 is the south edge of the main road; all roots stay south of it.
    const xyz=(u,v,y)=>{const[x,z]=W(u,v);return new K.THREE.Vector3(x,y,z);};
    function tube(a,b,r,mat,seg=8){
      const d=b.clone().sub(a).normalize(),ref=Math.abs(d.y)>.9?new K.THREE.Vector3(1,0,0):new K.THREE.Vector3(0,1,0);
      const n=d.clone().cross(ref).normalize(),m=d.clone().cross(n).normalize();
      const ring=(p,t)=>p.clone().addScaledVector(n,r*Math.cos(t)).addScaledVector(m,r*Math.sin(t)).toArray();
      for(let i=0;i<seg;i++){
        const t=i*2*PI/seg,nt=(i+1)*2*PI/seg,norm=n.clone().multiplyScalar(Math.cos((t+nt)/2)).addScaledVector(m,Math.sin((t+nt)/2));
        K.quad(mat,[ring(a,t),ring(b,t),ring(b,nt),ring(a,nt)],norm.toArray());
      }
    }
    // gb_03_crossing: the two arches align with the middle north-wing entrance,
    // not the terracotta end. Front W(163,-27)≈(145,-142), rear W(163,-6).
    lquadH(159,-45,167,-1,.035,0xb5b1a3);
    for(let v=-43;v<-1;v+=2.5)lquadH(162.72,v,163.28,v+2.2,.045,0xcfb64c);
    // Preserve the surveyed service lane and stripe its pedestrian crossing.
    const service=K.osm.roads.find(r=>r.id===1065783067);
    for(let i=1;i<service.pts.length;i++){
      const a=service.pts[i-1],b=service.pts[i],dx=b[0]-a[0],dz=b[1]-a[1],len=Math.hypot(dx,dz),nx=-dz/len*2.5,nz=dx/len*2.5;
      K.hpoly(aisle,[[a[0]+nx,a[1]+nz],[b[0]+nx,b[1]+nz],[b[0]-nx,b[1]-nz],[a[0]-nx,a[1]-nz]],.046);
    }
    for(let v=-35.7;v<-30.8;v+=1.15)lquadH(159.1,v,166.9,v+.62,.05,0xe5e2d5);
    for(const v of [-27,-6]){
      for(const s of [-1,1]){
        for(let i=0;i<12;i++){
          const a=i*PI/24,b=(i+1)*PI/24;
          tube(xyz(163+s*3.1*Math.cos(a),v,7*Math.sin(a)),xyz(163+s*3.1*Math.cos(b),v,7*Math.sin(b)),.22,0xe9ece6);
        }
        lcyl(163+s*3.1,v,0,.23,1.5,0xe9ece6,{seg:10});
      }
    }
    K.material('gb_entry_glass',new K.THREE.MeshLambertMaterial({color:0xb6c5c4,transparent:true,opacity:.55,depthWrite:false,side:K.THREE.DoubleSide}));
    const roof=(s,v)=>xyz(163+s*(4.5-(v+28)*.055),v,7.05+Math.abs(s)*1.15-(v+28)*.018);
    for(let v=-28;v<-3;v+=2.5){
      for(const s of [-1,1]){
        K.quad('gb_entry_glass',[roof(0,v).toArray(),roof(s,v).toArray(),roof(s,v+2.5).toArray(),roof(0,v+2.5).toArray()],[0,1,0]);
        tube(roof(0,v),roof(s,v),.055,0x8c9c9b,6);
      }
    }
    for(const s of [-1,0,1])tube(roof(s,-28),roof(s,-3),s===0?.12:.075,0x829491,8);
    lzone('터미널 보행 입구','1F','흰 아치 · 신반포로 연결',158.5,-45,167.5,-1,0,9,3);

    // gb_03/05: low, dark steel shelters; plain ad faces retain the observed lightboxes
    // without inventing ad artwork. A break lines up with the arch and crossing.
    K.material('gb_shelter_glass',new K.THREE.MeshLambertMaterial({color:0x2f3a3c,transparent:true,opacity:.6,depthWrite:false,side:K.THREE.DoubleSide}));
    const shelters=[[52,-36.5],[63.5,-36.5],[75,-36.5],[86.5,-36.5],
      ...[108.25,119.75,131.25,142.75,154.25,171.75,183.25,194.75,206.25].map(u=>[u,-24])];
    for(const [si,[u,v]] of shelters.entries()){
      lbox(u,v,2.92,11.5,3.1,.16,0x23292a,{solid:false});
      lbox(u,v-1.58,2.83,11.5,.12,.18,0x23292a,{solid:false});
      for(const du of [-5.3,0,5.3])lbox(u+du,v+1.2,0,.09,.09,2.92,0x23292a);
      lbox(u,v+1.24,.22,10.6,.035,2.48,'gb_shelter_glass',{solid:false});
      for(const y of [.23,1,2.68])lbox(u,v+1.2,y,10.8,.07,.065,0x23292a,{solid:false});
      // gb_03/04: saturated blue and warm portrait-colour backlit panels; no invented copy.
      for(const [ai,du] of [-4.2,2.5].entries()){
        const warm=(si*2+ai)%3===2;
        lbox(u+du,v+1.09,.21,1.94,.22,2.48,0x1c2223,{solid:false});
        lbox(u+du,v+.965,.25,1.8,.025,2.4,{tex:'emit',color:warm?0x815646:0x1f3f7f},{solid:false});
        lbox(u+du,v+.946,.62,1.38,.018,1.66,{tex:'emit',color:warm?0xd9ac94:0x5d86c6},{solid:false});
      }
      if(si%2===0)lbox(u,v-2.6,0,4,.6,.45,0x1c1f1f);
      lbox(u+2,v+.65,.42,3,.4,.12,0x5a6259);
      for(const du of [1,3])lbox(u+du,v+.65,0,.1,.3,.42,0x3a4540,{solid:false});
      lsign('고속터미널',u,v-1.66,2.91,2.2,.17,'-v',{bg:null,fg:'#e0dfd1',padding:0});
    }
    // gb_01/02: white parking fence, with gaps at real circulation corridors.
    function fence(u0,u1,v,breaks=[]){
      for(let u=u0;u<u1;u+=2){
        if(breaks.some(([a,b])=>u+2>a&&u<b))continue;
        lbox(u,v,0,.07,.07,1.15,0xe1e2d7);
        for(const y of [.2,1.04])lbox(u+1,v,y,2,.045,.045,0xe1e2d7,{solid:false});
        for(let d=.25;d<2;d+=.25)lbox(u+d,v,.2,.026,.035,.84,0xe1e2d7,{solid:false});
      }
    }
    fence(230,318,-45,[[284,290]]);
    // gb_01/02: low steel bollards and sagging chains at the salmon-paved arcade.
    // Leave the photographed entrances unobstructed.
    for(let u=140;u<300;u+=1.6){
      if([163,218,259].some(c=>u+1.6>c-3&&u<c+3))continue;
      lcyl(u,-2,0,.055,.9,0x626b68,{seg:6});
      for(let k=0;k<4;k++){
        const a=k/4,b=(k+1)/4;
        tube(xyz(u+1.6*a,-2,.76-.22*Math.sin(PI*a)),xyz(u+1.6*b,-2,.76-.22*Math.sin(PI*b)),.014,0x636967,4);
      }
    }
    // Plane trees have broad, high crowns and branching pale trunks, not the kit's
    // narrow ginkgo silhouette. Exact branch forms are intentionally schematic.
    K.texture('gb_plane_bark',64,128,(g,w,h)=>{
      g.fillStyle='#9d9d83';g.fillRect(0,0,w,h);
      for(let i=0;i<36;i++){g.fillStyle=['#b7b59d','#7f8871','#d1c8ad'][i%3];g.fillRect((i*23)%w,(i*37)%h,8+i%8,13+i%19);}
    },[1.3,3.5]);
    for(const u of [224,232,240,248,256,264,272,280,296,304,312]){
      const v=-43;
      const[x,z]=W(u,v);
      lbox(u,v,-.02,2.8,2.8,.08,0x777a60,{solid:false});
      lcyl(u,v,0,.25,7.2,'gb_plane_bark',{seg:9});
      for(let i=0;i<4;i++){
        const a=i*PI/2+.4,du=Math.cos(a)*2.4,dv=Math.sin(a)*2.4;
        tube(xyz(u,v,4.8),xyz(u+du,v+dv,9.5),.15,'gb_plane_bark',7);
        const[cx,cz]=W(u+du,v+dv);
        K.dome({x:cx,z:cz,y:10.8,rx:3.4,ry:3.6,rz:3.3,mat:i%2?0x355c29:0x3f6b2e,hemi:false,seg:10,rings:5});
      }
      K.dome({x,z,y:11.7,rx:5.3,ry:3.6,rz:5,mat:0x3f6b2e,hemi:false,seg:12,rings:5});
    }
    lsign(['서울고속버스터미널','광장주차장'],245,-42,2.8,3.7,.9,'-v',{bg:'#e2ddd1',fg:'#444f45'});
    lbox(245,-41.7,0,.1,.1,3.4,0x7d857b,{solid:false});
    lsign('주차',245,-41.9,4,1.2,.7,'-v',{bg:'#457667',fg:'#fff'});
    // gb_hall31: exit 1 pylon, beside the OSM exit at (51.36,-105.73).
    // Mount on the plaza edge, clear of the station module's stair/elevator circulation.
    K.box({x:56.5,z:-104.5,y:0,w:.6,d:.35,h:3.7,mat:0x3d4548,solid:false});
    K.sign('1',{x:56.5,z:-104.69,y:3.22,w:.43,h:.48,rotY:PI,bg:null,fg:'#e5b832'});
    K.sign(['고','속','터','미','널'],{x:56.5,z:-104.69,y:2.1,w:.43,h:1.55,rotY:PI,bg:null,fg:'#e7e6dd',padding:.01});
    for(const [i,col,n] of [[0,'#a99a71','9'],[1,'#e58032','3'],[2,'#71843e','7']])K.sign(n,{x:56.5,z:-104.69,y:.88-i*.24,w:.2,h:.2,rotY:PI,bg:col,fg:'#fff'});
    K.sign(['↑ 경부선 · 영동선','호남선 →'],{x:57.7,z:-104.69,y:1.12,w:1.7,h:.65,rotY:PI,bg:'#64645b',fg:'#f2efe6'});
    // gb_02 green direction gantry, centred at the supplied world position (195,-182).
    const [gu,gv]=toL(195,-182);
    lcyl(gu+3.8,gv+1.8,0,.17,7,0xa4aaa5,{seg:10});
    tube(xyz(gu+3.8,gv+1.8,6.5),xyz(gu-3.8,gv+1.8,6.5),.13,0x9fa8a3,8);
    lsign(['경부고속도로 ↑','잠원로4길 ←','120m'],gu,gv,5.55,7.3,2.2,'-v',{bg:'#28735b',fg:'#eef0df',padding:.05,bold:true});
  }

  function buildYards(){
    const area=id=>K.osm.areas.find(a=>a.id===id).poly;
    K.texture('gb17_jersey',256,128,(g,w,h)=>{
      g.fillStyle='#f2c200';g.fillRect(0,0,w,h);g.fillStyle='#1a1a1a';
      for(let x=-h;x<w+h;x+=100){g.beginPath();g.moveTo(x,0);g.lineTo(x+46,0);g.lineTo(x+46-h,h);g.lineTo(x-h,h);g.closePath();g.fill();}
    },[2,.8]);
    const white=0xdad7cb,yellow=0xcfad39;
    const paint=(u0,v0,u1,v1,y=.035,col=white)=>lquadH(u0,v0,u1,v1,y,col);
    const line=(a,b,y,col=white,w=.12)=>{
      const dx=b[0]-a[0],dz=b[1]-a[1],len=Math.hypot(dx,dz),nx=-dz/len*w/2,nz=dx/len*w/2;
      K.quad(col,[[a[0]+nx,y,a[1]+nz],[b[0]+nx,y,b[1]+nz],[b[0]-nx,y,b[1]-nz],[a[0]-nx,y,a[1]-nz]],[0,1,0]);
    };
    function corners(u,v,rot,w,d){const[x,z]=W(u,v),c=Math.cos(rot),s=Math.sin(rot);return[[-w/2,-d/2],[w/2,-d/2],[w/2,d/2],[-w/2,d/2]].map(([a,b])=>[x+a*c+b*s,z-a*s+b*c]);}
    function vehicle(u,v,y,rot,kind,idx=0,label='',appearance={}){
      if(kind!=='bus'){
        lcar(u,v,y,rot,kind,{color:[0xf1efea,0x353736,0xc2c4bf,0x656b70][idx%4],label});return;
      }
      // Photo02: full-height express coaches, high dark glazing, luggage holds and round wheels.
      // Aerial roof colours and the round3 brief support white/red/blue variants, not fleet assignments.
      const [x,z]=W(u,v),c=Math.cos(rot),s=Math.sin(rot),red=appearance.red??idx%6===0;
      const body=appearance.gold?0xc3ad77:red?0xb72831:appearance.silver?0xc6cacb:idx%6===4?0xe5dfcd:0xeeede6;
      const stripe=appearance.stripe??(red?0xecece5:idx%3===1?0x28639a:idx%3===2?0xb53c42:0x9c967e);
      const p=(a,h,b)=>[x+a*c+b*s,y+h,z-a*s+b*c];
      const part=(a,h,b,w,d,hh,mat)=>{const q=p(a,h,b);K.box({x:q[0],y:q[1],z:q[2],w,d,h:hh,rotY:rot,mat,solid:false});};
      // Keep the kit coach's original 12 × 2.5 × 3.4 m collision envelope and roof support.
      K.box({x,z,y,w:2.5,d:12,h:3.4,rotY:rot,mat:body,ceil:false,skip:['n','s','e','w','top','bottom']});
      // Modern coach nose: bevelled corner cheeks under a wide curved screen,
      // retaining the original collision envelope and rear luggage volume.
      const noseArc=side=>Array.from({length:7},(_,i)=>{
        const a=(side>0?i:6-i)*PI/12;
        return[side*(.85+.4*Math.cos(a)),5.6+.4*Math.sin(a)];
      });
      const shell=[[-1.25,-6],[1.25,-6],...noseArc(1),...noseArc(-1)];
      const rake=(b,h)=>b-(b>5.5?Math.max(0,h-1.05)*.42/2.35:0);
      K.prism(shell.map(([a,b])=>{const q=p(a,0,b);return[q[0],q[2]];}),y+.42,y+1.05,{mat:body,solid:false});
      // The upper body follows the windshield rake; leaving the old full-height
      // prism here would put an opaque flat nose in front of the recessed glass.
      for(let i=0;i<shell.length;i++){
        const a=shell[i],b=shell[(i+1)%shell.length],da=b[0]-a[0],db=b[1]-a[1];
        K.quad(body,[p(a[0],1.05,a[1]),p(b[0],1.05,b[1]),p(b[0],3.4,rake(b[1],3.4)),p(a[0],3.4,rake(a[1],3.4))],[db*c-da*s,0,-db*s-da*c]);
      }
      K.hpoly(body,shell.map(([a,b])=>{const q=p(a,3.4,rake(b,3.4));return[q[0],q[2]];}),y+3.4);
      part(0,3.4,-.6,1.6,2.4,.2,0xd9dad3);
      for(const side of [-1,1]){
        const a=side*1.258,n=[side*c,0,-side*s];
        const face=(mat,y0,y1,z0,z1,offset=0)=>K.quad(mat,[p(a+side*offset,y0,z0),p(a+side*offset,y0,z1),p(a+side*offset,y1,z1),p(a+side*offset,y1,z0)],n);
        face(0x1d3039,1.67,3.12,-5.55,5.15);
        face(0x4a6269,2.9,3.04,-5.52,5.12,.002);
        for(let b=-4.1;b<5;b+=1.38)face(0x465252,1.68,3.11,b,b+.045,.004);
        // Painted lower band and a broad diagonal return, kept free of invented brand marks.
        face(stripe,.53,.84,-5.8,4.8,.006);
        K.quad(stripe,[p(a+side*.008,.83,1.4),p(a+side*.008,.83,3.2),p(a+side*.008,appearance.subtle?1.03:1.65,1.8),p(a+side*.008,appearance.subtle?1.03:1.65,.0)],n);
        for(const b of [-2.7,-.7,1.3,3.3]){
          face(0x7e8583,.85,1.62,b,b+.026,.01);
          face(0x373d3b,1.4,1.46,b+.7,b+1.02,.012);
        }
        // Front passenger door: narrow framed pane below the main glazing line.
        if(side===1){face(0x293d43,.48,1.67,4.65,5.55,.014);face(0x9aa6a5,.48,2.92,4.65,4.7,.016);}
        for(const b of [-3.8,3.85]){
          // Ten-sided tyre and inset steel hub in a vertical plane (kit bus tyres are cubes).
          const outer=side*1.285,inner=side*1.08,rad=.53;
          for(let k=0;k<10;k++){
            const t0=k*PI/5,t1=(k+1)*PI/5;
            const wheel=(a,r,t)=>p(a,.53+Math.sin(t)*r,b+Math.cos(t)*r);
            K.quad(0x181c1c,[p(outer,.53,b),wheel(outer,rad,t0),wheel(outer,rad,t1),p(outer,.53,b)],n);
            K.quad(0x222727,[wheel(inner,rad,t0),wheel(outer,rad,t0),wheel(outer,rad,t1),wheel(inner,rad,t1)],[Math.cos((t0+t1)/2)*s,Math.sin((t0+t1)/2),Math.cos((t0+t1)/2)*c]);
            K.quad(0x8c989b,[p(outer+side*.006,.53,b),wheel(outer+side*.006,.29,t0),wheel(outer+side*.006,.29,t1),p(outer+side*.006,.53,b)],n);
          }
        }
        if(red||appearance.chunil){const q=p(a+side*.025,1.21,-.8);K.sign(appearance.chunil?'CHUNIL EXPRESS':'금호고속',{x:q[0],y:q[1],z:q[2],w:appearance.chunil?4.3:2.5,h:.35,rotY:rot+side*PI/2,bg:null,fg:'#f3eee3'});}
        // Forward rabbit-ear mirrors, as visible on both 9380 and the white coaches.
        part(side*1.3,2.92,5.69,.1,1.12,.11,0x27343b);
        part(side*1.51,2.94,6.25,.36,.1,.09,body);
        part(side*1.66,2.47,6.25,.1,.1,.52,body);
        part(side*1.66,2.28,6.28,.18,.25,.45,0x27343b);
        part(side*1.66,2.31,6.42,.12,.014,.35,0x71838b);
      }
      // Tall coach windscreen above a solid luggage-height nose; narrow rear window and lamps.
      const glassPoint=(a,h,b)=>p(a,h,rake(b,h)+.016);
      K.quad(0x233940,[glassPoint(-.85,1.05,6),glassPoint(.85,1.05,6),glassPoint(.85,3.18,6),glassPoint(-.85,3.18,6)],[s,.18,c]);
      for(const side of [-1,1]){
        const arc=noseArc(side);
        for(let i=1;i<arc.length;i++){
          const a=arc[i-1],b=arc[i];
          K.quad(0x233940,[glassPoint(a[0],1.05,a[1]),glassPoint(b[0],1.05,b[1]),glassPoint(b[0],3.18,b[1]),glassPoint(a[0],3.18,a[1])],[s+side*c,.18,c-side*s]);
        }
      }
      K.quad(0x2f454b,[p(-1.08,2.25,-6.014),p(1.08,2.25,-6.014),p(1.08,3.07,-6.014),p(-1.08,3.07,-6.014)],[-s,0,-c]);
      for(const a of [-.86,.86]){part(a,.7,6.025,.38,.04,.15,0xe2e5d5);part(a,.65,-6.025,.18,.04,.52,0xa9252b);}
      part(0,.39,6.025,2.32,.08,.15,0x4a5354);
      if(label){const q=p(0,2.91,rake(6,2.76)+.035);K.sign(label,{x:q[0],y:q[1],z:q[2],w:1.6,h:.3,rotY:rot,bg:'#17272b',fg:'#f0dfac'});}
      if(appearance.fleet){const q=p(.65,3.04,rake(6,2.98)+.04);K.sign(appearance.fleet,{x:q[0],y:q[1],z:q[2],w:.35,h:.12,rotY:rot,bg:null,fg:'#e2e4e1',pxPerM:180});}
    }
    function stall(poly,u,v,y,rot,kind,idx,occupied=true){
      const bus=kind==='bus',w=bus?3.25:2.6,d=bus?13:5.3,pts=corners(u,v,rot,w,d);
      if(!pts.every(([x,z])=>K.pointInPoly(x,z,poly)))return false;
      for(const [a,b] of [[0,1],[1,2],[3,0]])line(pts[a],pts[b],y+.026);
      if(occupied)vehicle(u,v,y,rot,kind,idx);
      return true;
    }
    function boundary(poly,y,openings=[]){
      // Low kerbs with explicit vehicle entrances, never a solid fence across the entry aisle.
      for(let i=0;i<poly.length;i++){
        const a=poly[i],b=poly[(i+1)%poly.length],L=Math.hypot(b[0]-a[0],b[1]-a[1]);
        if(openings.includes(i))continue;
        K.wall(...a,...b,y,y+.16,{mat:0xb0ada2,thick:.2});
        line(a,b,y+.18,yellow,.11);
      }
    }
    function lamp(u,v,y=0){
      lcyl(u,v,y,.09,6.8,0x848983,{seg:6});lbox(u,v,y+6.7,2.4,.15,.12,0x636963,{solid:false});
      for(const s of [-1,1])lbox(u+s,v,y+6.65,.6,.35,.1,'emit',{solid:false});
    }
    const apron=[[75.7,23],[97.4,23],[97.7,30.3],[353,30.3],[354,146],[196,146],[92,147],[76,155]].map(q=>W(...q));
    K.hpoly(aisle,apron,.014);
    // Retain claimed ground service roads at their real polylines, below parking paint.
    for(const r of K.osm.roads.filter(r=>meta.claimRoads.includes(r.id)&&r.layer!==1)){
      for(let i=1;i<r.pts.length;i++)K.ramp(...r.pts[i-1],...r.pts[i],{w:r.width||5,ya:.018,yb:.018,mat:aisle,rails:false});
    }
    // Photo02: red-paved islands, round pipe curbs and lightly sloped steel/glass shelter.
    K.material('gb_canopy_glass',new K.THREE.MeshLambertMaterial({color:0xb4c4c8,transparent:true,opacity:.48,depthWrite:false,side:K.THREE.DoubleSide}));
    function pipe(a,b,y,r=.12){
      const L=Math.hypot(b[0]-a[0],b[1]-a[1]),nx=-(b[1]-a[1])/L,nz=(b[0]-a[0])/L;
      for(let i=0;i<8;i++){const aa=i*PI/4,ab=(i+1)*PI/4,mid=(aa+ab)/2;
        const at=(p,t)=>[p[0]+nx*r*Math.cos(t),y+r*Math.sin(t),p[1]+nz*r*Math.cos(t)];
        K.quad(0x9da4a6,[at(a,aa),at(b,aa),at(b,ab),at(a,ab)],[nx*Math.cos(mid),Math.sin(mid),nz*Math.cos(mid)]);
      }
    }
    const canopyPanel=(u0,v0,u1,v1,west)=>{
      const q=(u,v)=>{const[x,z]=W(u,v);return[x,west?6-(u-75.2)*.075:6-(v-30)*.075,z];};
      K.quad('gb_canopy_glass',[q(u0,v0),q(u1,v0),q(u1,v1),q(u0,v1)],[0,1,0]);
    };
    for(const b of bays){
      if(b.west){
        const p=[[75.75,b.v-3.1],[79.2,b.v-1.5],[77.8,b.v+3],[75.75,b.v+3]].map(q=>W(...q));
        K.prism(p,0,.14,{mat:0x8a4a3e,top:0x8a4a3e});
        pipe(p[0],p[1],.29);pipe(p[1],p[2],.29);
        paint(79.2,b.v-2.6,89.5,b.v-2.48);
        lfloorText(String(b.n),81,b.v,.03,1.6,1.2,'+u',{bg:null,fg:'#efead9'});
        if(b.n%5!==0){
          // jp_130 has an open view across bay6. Relocate its coach to the
          // empty south apron, preserving the 13m through lane and every bus.
          const u=b.n===6?130:b.n===8?96.3:85.3,v=b.n===6?141:b.v+1.2;
          vehicle(u,v,0,b.n===4?FACE['+v']:FACE['-u']-.45,'bus',b.n,b.dest.split(' · ')[0],
            {red:b.n===4,gold:b.n===7,silver:b.n%3===0,subtle:b.n!==4,stripe:b.n===4?0xeee8dc:0x99896b,fleet:b.n===7?'9380':null});
        }
      }else if(!(b.u>147&&b.u<199)){
        const island=rect(b.u-2.5,30.2,b.u+2.5,34.8);K.prism(island,0,.14,{mat:b.n===null?0x9c7a4a:0x8a4a3e});
        pipe(W(b.u-2.5,34.8),W(b.u+2.5,34.8),.29);
        for(let u=b.u-2.5;u<b.u+2.4;u+=2.5){canopyPanel(u,30.2,u+2.4,35.6,false);lbox(u,32.9,5.58,.14,5.4,.2,0x3a3f44,{solid:false});}
        lcyl(b.u-2.35,34.2,.14,.12,5.45,0x3a3f44,{seg:8});
        if(b.n!==null){
          const rot=FACE['-v']-.5,pts=corners(b.u+1.7,39,rot,3.2,13);
          line(pts[0],pts[3],.035);line(pts[1],pts[2],.035);
          lfloorText(String(b.n),b.u,33.3,.16,1.4,1.4,'+v',{bg:null,fg:'#ede9dc'});
          if(b.n%4!==0)vehicle(b.u+1.7,39,0,rot,'bus',b.n,b.dest.split(' · ')[0]);
        }
      }
    }
    for(let v=24;v<153;v+=3){canopyPanel(75.2,v,80.1,v+2.88,true);lbox(77.65,v,5.55,5.2,.14,.24,0xc9cbc6,{solid:false});}
    for(const u of [75.25,77.65,80])lbox(u,88.5,5.66,.14,129,.2,0xc9cbc6,{solid:false});
    // jp_5/80/130/155 show no thin posts in front of the white inclined piers.
    // gb_hall26/30: white number lanterns on thin rods underneath the preserved canopy.
    for(const b of bays){
      if(b.n===null||b.n>36)continue;
      const u=b.u+(b.west?1.65:0),v=b.v+(b.west?0:2.1),face=b.west?'+v':'-u';
      // Small suspended utility lights repeat between the numbered lanterns.
      const lu=u+(b.west?.35:1.5),lv=v+(b.west?1.5:.35);
      lbox(lu,lv,4.75,.025,.025,.75,0x73756c,{solid:false});
      lcyl(lu,lv,4.56,.16,.2,{tex:'emit',color:0xe9e3c8},{seg:8,solid:false});
      for(const du of [-.17,.17])lbox(lu+du,lv,4.5,.025,.32,.3,0x85877a,{solid:false});
      lbox(u,v,3.92,.035,.035,1.65,0x6b6961,{solid:false});
      lbox(u,v,3.13,.7,.7,.81,0xe3ded0,{solid:false});
      for(const y of [3.1,3.92])lbox(u,v,y,.86,.84,.07,0x9f8563,{solid:false});
      lsign([String(b.n),b.dest||'승차홈'],u+(b.west?0:-.36),v+(b.west?.36:0),3.53,.62,.65,face,{bg:'#f5f1e5',fg:'#3b4547',padding:.03});
      lsign([String(b.n),b.dest||'승차홈'],u+(b.west?0:.36),v+(b.west?-.36:0),3.53,.62,.65,b.west?'-v':'+u',{bg:'#f5f1e5',fg:'#3b4547',padding:.03});
    }
    // Waiting travellers and a high-visibility boarding attendant stay on the platform.
    ldetail({floor:'1F',y0:0,y1:6,poly:apron,name:'1F 승차장 대기'},()=>{
      for(const b of bays.filter(b=>b.n===19||b.n===30||b.n===11)){
        const u=b.u+(b.west?1.5:0),v=b.v+(b.west?-.9:2.1);
        lperson(u,v,.14,{shirt:0xc6cf38,pants:0x253843});
        lperson(u+(b.west?.15:1),v+(b.west?1.1:0),.14,{shirt:0x787b87});
        lbox(u+(b.west?.4:1.35),v+(b.west?1.2:0),.14,.38,.3,.62,0x3b5874,{solid:false});
      }
    });
    // Four ground holding areas, traced to actual polygons. Coach rows run along u, paired along v.
    const lots=[
      {id:1173093432,rows:[225,240,278,293,331,346],v0:56,v1:115},
      {id:1173093433,rows:[370,384],v0:46,v1:98},
      {id:1173093434,rows:[321,337,353,370,385],v0:129,v1:158},
      {id:1173096051,rows:[291,312,329],v0:-37,v1:-12},
    ];
    for(const lot of lots){
      const poly=area(lot.id);K.hpoly(asphalt,poly,.023);boundary(poly,0,[0]);
      let idx=0;
      for(let row=0;row<lot.rows.length;row++)for(let v=lot.v0;v<lot.v1;v+=3.35){
        const u=lot.rows[row];stall(poly,u,v,0,FACE[row%2?'-u':'+u'],'bus',++idx,idx%13!==0);
      }
      K.zone({name:'고속버스 주차장',floor:'1F',sub:'경부·영동선 버스 대기',poly,y0:0,y1:5,priority:2});
    }
    for(const [u,v]of [[211,118],[264,119],[318,119],[359,104],[342,150],[235,-7],[308,-8]])lamp(u,v);
    // Aerial px540..700,830..1080: twenty free-standing coaches parallel to the bay row.
    // Bay noses end at local u91.3; the second row begins at u104.3, leaving a 13 m aisle.
    const cp=area(1173093431);K.hpoly(asphalt,cp,.024);boundary(cp,0,[0]);
    lquadH(91.4,51,104.2,133,.029,aisle);
    // Six of the retained twenty coaches stand nearer the platform, with noses
    // 21-25 m out in jp_130/155; the remaining row still occupies its OSM lot.
    for(let i=0;i<20;i++){
      const near=i>=11&&i<=16;
      stall(cp,near?103.5:i>=17?117:110.5,near?99+(i-11)*3.4:57+i*3.5,0,FACE['-u']-.45,'bus',i,true);
    }
    vehicle(88.5,115.1,0,FACE['+v'],'bus',4,'',{red:false,chunil:true,silver:true,subtle:true,stripe:0x4a535b});
    // jp_155 continues on the camera's right. Three more coaches fit before
    // the holding lot's south kerb at v134.6; a fourth would straddle that kerb.
    for(let i=0;i<3;i++)vehicle(103.5,123.2+i*3.5,0,FACE['-u']-.45,'bus',21+i,'',{red:false,silver:i%2===0,subtle:true});
    // Rq_300 coach queue follows the same curve as the photographed service lane.
    const serviceCurve=u=>u<=116?42.1:u<=146?128.1-Math.sqrt(86*86-(u-116)*(u-116)):47.502+.372*(u-146);
    for(let u=108;u<173;u+=2){
      const a=W(u,serviceCurve(u)+6.4),b=W(u+2,serviceCurve(u+2)+6.4);
      line(a,b,.045,0xe2ca54,.14);
    }
    // Rq_300: nose faces the lane, while its rear passes through the existing
    // wash-bay opening at u112.5..117.5 instead of clipping the concrete wall.
    vehicle(115,36.15,0,FACE['+v']-.61,'bus',1,'',{red:false,silver:true,subtle:true});
    for(let i=0;i<15;i++){
      const u=123+i*3.45,v=serviceCurve(u)+15.5;
      const turn=Math.atan2(serviceCurve(u+.1)-serviceCurve(u-.1),.2);
      vehicle(u,v,0,FACE['-u']-1.0-turn,'bus',i+1,'',{red:false,silver:i%4===0,subtle:true,stripe:[0x284c70,0x8d8170,0x546575][i%3]});
    }
    lzone('승차장 앞 버스 대기열','1F','승차홈 앞 통행로 · 고속버스 대기',86,50,145,135,0,5,2);
    lamp(89,135);lamp(144,52);
    // Sedans move to the central lot (world x150..227); retain the surveyed deck above it.
    const surfaceCars=K.osmBuilding(356129682)[0].poly;K.hpoly(asphalt,surfaceCars,.025);
    lquadH(169,34,177,126,.03,aisle);
    let ci=0,relocatedCars=0;for(const u of [155,165,181,193])for(let v=40;v<124;v+=2.8){
      if(blocked(u,v,3)||Math.abs(v%16-11)<1.8)continue;
      // Keep every car, but move spaces crossed by the newly traced coach queue
      // to the unused 6 m strip between the two eastern sedan banks.
      const moved=u<173&&Math.abs(v-serviceCurve(u)-15.5)<9;
      stall(surfaceCars,moved?187:u,moved?40+relocatedCars++*2.8:v,0,FACE[u<173?'+u':'-u'],'car',++ci,ci%5!==0);
    }
    K.zone({name:'터미널 지상 주차장',floor:'1F',sub:'승용차 주차',poly:surfaceCars,y0:0,y1:5.5,priority:2});
    // Aerial + OSM886400350: this west forecourt patch is a small tree lawn,
    // never a second car park. gb_01/02 show salmon brick in the open areas.
    K.texture('gb_forecourt_brick',128,64,(g,w,h)=>{
      g.fillStyle='#b47a66';g.fillRect(0,0,w,h);
      for(let row=0;row<4;row++)for(let col=-1;col<4;col++){
        const x=col*w/3+(row%2)*w/6,y=row*h/4;
        g.fillStyle=(row+col)%2?'#a86c5a':'#c08a76';g.fillRect(x+1,y+1,w/3-2,h/4-2);
      }
    },[.6,.4]);
    const lawn=area(886400350),track=K.osm.areas.find(a=>a.id===14188630);
    K.hpoly('gb_forecourt_brick',rect(98,-45,230,-1),.022,true,[lawn,track.poly]);
    K.hpoly(0x6d8a45,lawn,.03);
    for(let i=0;i<lawn.length;i++)K.wall(...lawn[i],...lawn[(i+1)%lawn.length],0,.15,{mat:0xb2b0a7,thick:.18});
    for(const [x,z] of [[100,-115],[106,-120],[112,-115],[108,-126],[98,-121],[113,-119],[104,-112]]){
      if(!K.pointInPoly(x,z,lawn))continue;
      K.cyl({x,z,y:0,r:.18,h:4.6,mat:0x77715b,seg:8});
      K.dome({x,z,y:6.1,rx:3.5,ry:3.4,rz:3.3,mat:0x44683b,hemi:false,seg:10,rings:6});
    }
    // The west half of north lot1173096051 is cars in the aerial, with coaches farther east.
    const northSurface=area(1173096051);lquadH(230.8,-36,274,-32,.032,aisle);
    for(let i=0;i<15;i++)for(const v of [-40,-28])stall(northSurface,232+i*2.8,v,0,FACE[v===-40?'+v':'-v'],'car',i+(v===-40?0:15),true);
    lzone('서울고속버스터미널 광장주차장','1F','승용차 주차 · 신반포로',230,-46,274,-14,0,5,3);
    // The aerial pill-shaped outline retains its surveyed hole: red rim, white
    // inset lane and dark centre. Its use/height is not asserted as a new pavilion.
    K.hpoly(0xb8645a,track.poly,.04,true,track.holes);
    for(const hole of track.holes)K.hpoly(0x4a6a48,hole,.039);
    function insetPoly(poly,d){
      const normals=K.orient(poly);
      return poly.map((p,i)=>{
        const a=normals[(i+poly.length-1)%poly.length],b=normals[i],den=1+a[0]*b[0]+a[1]*b[1];
        return[p[0]-d*(a[0]+b[0])/den,p[1]-d*(a[1]+b[1])/den];
      });
    }
    K.hpoly(0xe4dfd3,insetPoly(track.poly,.54),.044,true,[insetPoly(track.poly,.66)]);
    buildForecourt();
    // Central OSM roof356129682: cars, four longitudinal banks and two open drive aisles.
    const deck=K.osmBuilding(356129682)[0].poly;
    K.slab(deck,6,{mat:asphalt,under:'concrete',thick:.4});
    lquadH(169,34,177,126,6.025,aisle);
    for(const u of [151,197])for(let v=43;v<132;v+=16)lbox(u,v,0,.65,.65,5.6,0xbdbbb0);
    // Deck railings exclude the north building connection and the ramp circulation at its south tip.
    K.polyWalls(deck,6,6.95,{mat:0xbbb9ad,thick:.16,openings:[
      {...Object.fromEntries(['x','z'].map((k,i)=>[k,W(173,30)[i]])),w:42,y0:6,y1:7},
      {x:232.34,z:-5.63,w:8,y0:6,y1:7}, {x:195.29,z:22.78,w:8,y0:6,y1:7}]});
    let di=0;
    for(const u of [152,165,181,194])for(let v=38;v<126;v+=2.65){
      if(blocked(u,v,3))continue;stall(deck,u,v,6,FACE[u<173?'+u':'-u'],'car',++di,di%4!==0);
    }
    K.zone({name:'경부선 주차장',floor:'2F',sub:'옥외 승용차 주차',poly:deck,y0:6,y1:11,priority:3});
    lsign('경부선 주차장',197,112,8.2,5,.7,'+u',{bg:'#ece8dc',fg:'#235772'});
    // gb_01/02: a clean warm-tan parapet and pale railing screen the set-back cars.
    K.polyWalls(NORTH,NORTH_ROOF,NORTH_ROOF+.4,{mat:TAN,thick:.18});
    lwall(76,0,245,0,NORTH_ROOF,NORTH_ROOF+1.1,{mat:TAN,thick:.2});
    for(let u=76;u<=245;u+=2)lcyl(u,0,NORTH_ROOF+1.1,.035,1.2,0xc5c7c0,{seg:6,solid:false});
    for(const h of [.42,1.12])lbox(160.5,0,NORTH_ROOF+1.1+h,169,.06,.06,0xc5c7c0,{solid:false});
    for(const u of [110,160,200,240]){
      lcyl(u,14,NORTH_ROOF,.075,6,0x9a9e98,{seg:6,solid:false});
      lbox(u,14,NORTH_ROOF+5.9,1.5,.18,.12,0x9a9e98,{solid:false});
      lbox(u,14,NORTH_ROOF+5.87,.65,.28,.04,'emit',{solid:false});
    }
    lquadH(80,10,245,19,NORTH_ROOF+.025,aisle);
    let ni=0;
    for(let u=91;u<242;u+=2.7)for(const v of [6.5,24]){
      if(blocked(u,v,3)||u>148&&u<205&&v===24)continue;
      stall(NORTH,u,v,NORTH_ROOF,FACE[v===6.5?'+v':'-v'],'car',++ni,ni%4!==0);
    }
    // Aerial east roof stays low and pale; gb_01 rules out the former tall enclosure.
    K.hpoly(0xc4c1b7,rect(248.5,13,315.5,28.5),NORTH_ROOF+.015);
    // Visible OSM bridge + tight curved return, following every survey vertex.
    const bridge=K.osm.roads.find(r=>r.id===715692653).pts;
    K.ramp(...bridge[0],...bridge[1],{w:5,ya:0,yb:6,mat:asphalt,railMat:0xaaa89e});
    const curve=K.osm.roads.find(r=>r.id===356130054).pts;
    const lengths=curve.slice(1).map((p,i)=>Math.hypot(p[0]-curve[i][0],p[1]-curve[i][1]));
    const total=lengths.reduce((a,b)=>a+b,0);let travelled=0;
    for(let i=1;i<curve.length;i++){
      const a=curve[i-1],b=curve[i],ya=6+8*travelled/total;travelled+=lengths[i-1];const yb=6+8*travelled/total;
      K.ramp(...a,...b,{w:5,ya,yb,mat:asphalt,rails:true,railMat:0xaaa89e});
    }
    // Photo06 is accepted provisionally as this annex: four beige-panel storeys and an east glass section.
    // Keep the OSM walls/roof-car outline; the 14 m roof estimate supersedes its old 9 m height tag.
    const annex=K.osmBuilding(356129683)[0].poly,roof=area(356129681);
    K.texture('gb_annex_panel',128,128,(g,w,h)=>{
      g.fillStyle='#cfc6b4';g.fillRect(0,0,w,h);g.fillStyle='#9c998e';g.fillRect(0,0,2,h);g.fillRect(0,0,w,2);
      g.fillStyle='#34423e';g.fillRect(5,h*.46,w-10,h*.34);g.fillStyle='#748079';g.fillRect(7,h*.47,w-14,h*.08);
      g.fillStyle='#aaa89c';g.fillRect(w/2,h*.46,2,h*.34);
    },[3,3.5],{facade:true});
    K.texture('gb_annex_green',128,128,(g,w,h)=>{
      g.fillStyle='#3d5a52';g.fillRect(0,0,w,h);g.fillStyle='#5b7069';g.fillRect(4,4,w-8,h*.24);
      g.fillStyle='#9a9f95';g.fillRect(0,0,2,h);g.fillRect(0,0,w,2);g.fillRect(0,h/2,w,2);
    },[3,3.5],{facade:true});
    const annexFloors=[0,3.5,7,10.5,14],stairVoid=rect(94,150.2,98.4,158.4),liftVoid=rect(101.4,157.9,103.6,160.1);
    for(const y of annexFloors){
      const hs=y>0?[stairVoid,liftVoid]:[];
      K.slab(annex,y,{mat:y===14?asphalt:'tile',under:'gb_acoustic',holes:hs});
      if(y<14){
        K.polyWalls(annex,y,y+3.5,{mat:'gb_annex_panel',inner:CREAM,thick:.25,floorH:3.5,openings:y===0?[{x:W(130,148)[0],z:W(130,148)[1],w:4,y0:0,y1:3}]:[]});
        K.zone({name:'터미널 부속동',floor:`${1+y/3.5}F`,sub:'부속상가',poly:annex,y0:y,y1:y+3.5,priority:2});
        for(let u=108;u<188;u+=12)lbox(u,156,y+3.16,1.2,.5,.04,'emit',{solid:false});
      }
    }
    // West stair/lift tower rises one storey above the parking roof, with a narrow glass strip.
    const tower=rect(93,148.6,105,164.1);
    K.polyWalls(tower,14,17.5,{mat:0xcfc6b4,inner:CREAM,thick:.2,openings:[{x:W(105,160)[0],z:W(105,160)[1],w:3,y0:14,y1:17}]});
    K.slab(tower,17.5,{mat:'roofgravel',under:'gb_acoustic',walk:false});
    lbox(102.5,148.25,0,3,.08,17.3,'gb_annex_green',{solid:false});
    for(let y=0;y<17.5;y+=3.5)lbox(102.5,148.17,y,3.1,.06,.1,0xa6aa9f,{solid:false});
    for(let i=0;i<4;i++){
      const y=annexFloors[i],next=annexFloors[i+1],mid=(y+next)/2;
      lstairs(95.1,158.4,95.1,151.7,{ya:y,yb:mid,w:1.85,mat:'concrete'});
      K.slab(rect(94.1,150.2,98.3,151.7),mid,{mat:'concrete',thick:.18});
      lstairs(97.3,151.7,97.3,158.4,{ya:mid,yb:next,w:1.85,mat:'concrete'});
    }
    lelev('부속동 엘리베이터',102.5,159,'+v',annexFloors.map((y,i)=>({label:i===4?'옥상':`${i+1}층`,y,name:i===4?'주차장':'부속상가'})),{topH:3.3});
    // Green curtain panels follow the surveyed east 35% on all three exposed faces.
    const an=K.orient(annex),al=annex.map(p=>toL(...p));
    for(let i=0;i<al.length;i++){
      let a=al[i],b=al[(i+1)%al.length];if(a[0]<158&&b[0]<158)continue;
      if(a[0]<158){const t=(158-a[0])/(b[0]-a[0]);a=[158,a[1]+(b[1]-a[1])*t];}
      if(b[0]<158){const t=(158-b[0])/(a[0]-b[0]);b=[158,b[1]+(a[1]-b[1])*t];}
      const pa=W(...a),pb=W(...b),n=an[i];
      K.wall(pa[0]+n[0]*.04,pa[1]+n[1]*.04,pb[0]+n[0]*.04,pb[1]+n[1]*.04,0,13.8,{mat:'gb_annex_green',thick:.04,solid:false,floorH:3.5});
    }
    lcyl(193.57,147.15,0,.42,13.8,'gb_annex_green',{seg:12,solid:false});
    // Short curved canopy at the glass end, matching the rounded awning seen in photo06.
    const canopy=[];for(let i=0;i<=12;i++){const a=-PI+i*PI/12;canopy.push(W(187+6*Math.cos(a),148+3*Math.sin(a)));}
    K.prism(canopy,3.15,3.38,{mat:0x9ca89e,solid:false});
    K.slab(roof,14.01,{mat:asphalt,under:false,thick:.01,edge:false,ceil:false,holes:[stairVoid,liftVoid]});
    K.polyWalls(roof,14,14.8,{mat:0xbab8ad,thick:.16,openings:[{x:197.66,z:29.69,w:7,y0:14,y1:15}]});
    let ai=0;for(let u=110;u<190;u+=2.7)stall(roof,u,156.8,14,FACE['-v'],'car',++ai,ai%6!==0);
    K.zone({name:'부속동 옥상 주차장',floor:'옥상',sub:'승용차 주차',poly:roof,y0:14,y1:18,priority:3});
    K.ramp(195.29,22.78,197.66,29.69,{w:5,ya:14,yb:14,mat:aisle,railMat:0xb0ad9f});
    // Photo06: small booth and raised yellow/black barrier; leave the entry lane passable.
    lbox(203.5,137.8,0,2.2,2.2,2.55,0xd0cbbd);lbox(203.5,137.8,1,2.23,2.23,1.2,'gb_annex_green',{solid:false});
    lbox(203.5,137.8,2.55,2.5,2.5,.18,0x7f8b82,{solid:false});
    lbox(200,136.7,0,.42,.42,1.05,0xe4bd30);lbox(200,136.7,1.05,.14,.14,3.6,0xd9b92b,{solid:false});
    for(let y=1.3;y<4.5;y+=.65)lbox(200,136.7,y,.15,.15,.25,0x252928,{solid:false});
    // Photo03 police box: retain the claimed small south footprint but replace the opaque cream block.
    const pavilion=K.osmBuilding(1173093435)[0].poly;
    K.texture('gb_police_glass',128,128,(g,w,h)=>{g.fillStyle='#39574e';g.fillRect(0,0,w,h);g.fillStyle='#55756b';g.fillRect(4,4,w-8,h*.4);g.fillStyle='#a7b2a7';g.fillRect(0,0,3,h);g.fillRect(0,0,w,3);},[2,3.2],{facade:true});
    const policeStair=rect(39.5,166,43.6,172.5),policeLift=rect(34.9,170.9,37.1,173.1);
    K.slab(pavilion,0,{mat:'gb_terrazzo',under:false});
    K.slab(pavilion,3.2,{mat:'tile',under:'gb_acoustic',holes:[policeStair,policeLift]});
    K.polyWalls(pavilion,0,6.4,{mat:'gb_police_glass',inner:CREAM,thick:.2,floorH:3.2,openings:[
      {x:W(38,177)[0],z:W(38,177)[1],w:4,y0:0,y1:2.8},
      {x:W(38,161)[0],z:W(38,161)[1],w:6,y0:0,y1:3}]});
    K.slab(pavilion,6.4,{mat:'roofgravel',under:'gb_acoustic',walk:false});
    lsign('경찰',38,177.25,4.95,9,.75,'+v',{bg:'#1c518d',fg:'#fff'});
    lstairs(40.45,172.5,40.45,167.4,{ya:0,yb:1.6,w:1.6,mat:'concrete'});
    K.slab(rect(39.6,166,43.5,167.4),1.6,{mat:'concrete',thick:.15});
    lstairs(42.65,167.4,42.65,172.5,{ya:1.6,yb:3.2,w:1.6,mat:'concrete'});
    lelev('경찰 안내동 엘리베이터',36,172,'-v',[{label:'1층',y:0,name:'경찰 안내'},{label:'2층',y:3.2,name:'안내동'}],{topH:2.9});
    for(const [floor,y] of [['1F',0],['2F',3.2]])K.zone({name:'경찰 안내동',floor,sub:'',poly:pavilion,y0:y,y1:y+3.2,priority:3});
    // Access-road parked cars and low pines are visible in 01/08; keep doors clear.
    for(let v=24;v<147;v+=6){if([48,105].some(d=>Math.abs(v-d)<6))continue;vehicle(-7,v,0,FACE['+u'], 'car',Math.round(v));}
    for(const v of [31,76,120]){const[x,z]=W(-2.5,v);K.tree(x,z,{h:5.5,kind:'pine'});}
  }
}
