// 서울고속버스터미널: OSM ground-contact outlines; aerial lots and photographed concrete tiers.
// Reference/inference ledger: data/research/gyeongbu.json. No runtime animation/allocation.
export const meta = {
  id: 'gyeongbu', name: '서울고속버스터미널 (경부·영동선)',
  claims: [309352819, 356129682, 356129683, 1173093435],
  claimRoads: [356129685, 356129687, 356129690, 356130053, 356130054, 715692653, 660731157, 1259394249, 1259394250, 1259394251, 1259394252, 356129974, 655403255, 1115924614, 715692651, 1132460905],
  claimAreas: [1173093431, 1173093432, 1173093433, 1173093434, 1173096051, 356129681, 14188630, 886400350],
  sources: ['refs/interior/gb_hall/notes.json', 'refs/interior/gb_flower/notes.json', 'refs/aerial/gyeongbu_lots.jpg', 'refs/roadview/manifest.json',
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
  const uses=['대합실 · 매표소 · 승차홈','상가','꽃도매상가 · 생화 · 조화 · 부자재','상가','신세계백화점 본사','상층부','상층부','상층부','상층부','고속터미널성당 · 옥상정원'];
  const pent=rect(27,42,50,82);
  const elevs=[
    {u:44.5,v:55,top:9,base:-6,name:'중앙 엘리베이터',face:'+v'},
    {u:48,v:55,top:9,base:-6,name:'중앙 엘리베이터 2호기',face:'+v'},
    {u:278,v:7,top:2,base:-6,levels:[0,NORTH_2F,NORTH_ROOF],name:'북측 동 엘리베이터',face:'+v'},
    {u:190,v:118,top:1,base:0,name:'주차장 엘리베이터',face:'-u'},
  ];
  const cores=[{u:35,v:48,levels:[-6,...ys]},{u:267,v:2,levels:[-6,0,NORTH_2F,NORTH_ROOF]}];
  const escs=[{u:20,v:61,ya:0,yb:6,len:12},{u:20,v:78,ya:6,yb:11,len:10},
    {u:105,v:4,ya:-6,yb:0,len:12}];
  const coreRect=c=>[c.u,c.v,c.u+4.4,c.v+10];
  const excluded=[...cores.map(coreRect),...elevs.map(e=>[e.u-1.4,e.v-1.4,e.u+1.4,e.v+3.6]),...escs.map(e=>[e.u-2,e.v-1,e.u+2,e.v+e.len+1])];
  excluded.push([108.3,3,111.3,17]); // stair beside the B1 escalator, photos 38/41
  const inRect=(r,u,v,m=0)=>u>r[0]-m&&u<r[2]+m&&v>r[1]-m&&v<r[3]+m;
  const blocked=(u,v,m=0)=>excluded.some(r=>inRect(r,u,v,m));
  function holes(poly,y){
    const out=[];
    for(const c of cores)if(y>c.levels[0]&&y<=c.levels.at(-1))out.push(rect(c.u,c.v,c.u+4.4,c.v+8.4));
    for(const e of escs)if(y===e.yb)out.push(rect(e.u-1.8,e.v,e.u+1.8,e.v+e.len));
    if(y===0)out.push(rect(108.45,4,111.15,16));
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
  const hallVoids=[rect(56,54,71.4,84),rect(8,14,32,34),rect(24,146,65,156.5),
    ...[30,40].map(u=>Array.from({length:24},(_,k)=>W(u+2.2*Math.cos(k*PI/12),143+2.2*Math.sin(k*PI/12))))];
  for(let i=1;i<ys.length;i++){
    const p=floorPoly(i);K.slab(p,ys[i],{mat:i===2?'concrete':'tile',under:'gb_acoustic',holes:[...holes(p,ys[i]),...(i===1?hallVoids:[])]});
  }
  // The ticket light wells pass through 2F: their white liners also guard the floor opening.
  for(const p of hallVoids.slice(3))K.polyWalls(p,6,7.5,{mat:0xf4f2ee,inner:0xf4f2ee,thick:.06});
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
    lwall(75.58,v0,75.58,v1,0,3,{mat:doorGlass,thick:.04});
    for(let v=v0;v<=v1;v+=1.2)lbox(75.52,v,0,.08,.06,3,0x8f979a,{solid:false});
    lbox(75.52,v1,0,.08,.06,3,0x8f979a,{solid:false});
    for(const y of [.04,1.05,2.2,2.96])lbox(75.52,(v0+v1)/2,y,.08,v1-v0,.06,0x8f979a,{solid:false});
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
      lsign('',bu,bv,2.88,3.2,.6,f,{bg:'#38b6e8',fg:'#fff'});
      lsign(b.n===null?'하차장':dest||'승차홈',bu+(b.west?0:-sgn*.28),bv+(b.west?sgn*.28:0),2.88,b.n===null?2.9:2.47,.46,f,{bg:null,fg:'#fff',padding:.02,offset:.025});
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
    const entries=[16,38,60];
    lwall(3,6,73,6,0,3.5,{mat:'glass',thick:.045,openings:entries.map(at=>({at:at-3,w:4,y0:0,y1:3.5}))});
    lwall(3,6.08,73,6.08,3.5,5.7,{mat:'gb_salmon_tile',thick:.16});
    for(let u=4;u<73;u+=2){if(entries.some(e=>Math.abs(u-e)<1.9))continue;lbox(u,5.98,0,.065,.1,3.5,0xaab4b8,{solid:false});}
    for(let u=7;u<72;u+=6){
      lbox(u,5.94,4.1,1.1,.1,1.1,0xaab4b8,{solid:false});lbox(u,5.87,4.15,1,.03,1,DARK,{solid:false});
    }
    for(const u of entries){
      for(const dx of [-2,0,2])lbox(u+dx,5.92,0,.07,.12,3.5,0xaab4b8,{solid:false});
      lbox(u,5.92,3.43,4,.12,.07,0xaab4b8,{solid:false});
      for(const s of [-1,1]){
        lbox(u+s,5.96,.08,1.91,.035,3.3,'glass',{solid:false});
        lbox(u+s*.14,5.82,1.1,.04,.06,.6,0xaab4b8,{solid:false});
      }
      lsign('서울고속버스터미널 경부선',u,5.78,3.85,6,.5,'-v',{bg:'#286ca1',fg:'#fff',padding:.02});
    }
    // Four-sided slanted white supports, at 6m spacing, land on the open plaza.
    for(let u=9;u<72;u+=6){
      const p=(du,v,y)=>{const[x,z]=W(u+du,v);return[x,y,z];};
      K.quad(0xe8e4da,[p(-.45,-.4,0),p(.45,-.4,0),p(.45,5.2,5.7),p(-.45,5.2,5.7)],[-B[0],.7,-B[1]]);
      K.quad(0xbab8ae,[p(.45,-.4,0),p(.45,.35,0),p(.45,5.95,5.7),p(.45,5.2,5.7)],[A[0],0,A[1]]);
      K.quad(0xe8e4da,[p(-.45,.35,0),p(-.45,-.4,0),p(-.45,5.2,5.7),p(-.45,5.95,5.7)],[-A[0],0,-A[1]]);
      K.quad(0xe8e4da,[p(-.45,.35,0),p(.45,.35,0),p(.45,5.95,5.7),p(-.45,5.95,5.7)],[B[0],-.7,B[1]]);
      lbox(u,0,0,1,.9,.15,0xd3d0c4,{solid:false});
    }
    K.hpoly(0xe8e4da,rect(3,0,73,6),5.7,false);
    for(const u of [8,16,48,68]){const[x,z]=W(u,-4);K.tree(x,z,{h:5.4,kind:'pine'});}
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
    if(e.yb!==11)lsign(e.yb===0?'매표소 · 승차홈':'2층 · 꽃상가 ↑',e.u,e.v-.3,e.ya+2.8,3.3,.5,'-v',{bg:'#225a4a',fg:'#fff'});
  }
  buildHall();buildBasement();buildUpper();buildYards();
  lspawn('경부선 터미널 정문',163,-16,0,0,1);
  lspawn('1층 대합실',70.5,89,0,0,-1);
  lspawn('1층 매표·환불',27,145,0,1,0);
  lspawn('1층 무인발권기',20,23,0,0,-1);
  lspawn('1층 할리스 아래 통로',68,68,0,0,-1);
  lspawn('승차홈과 버스 마당',77.2,98,0,0,-1);
  lspawn('3층 꽃도매상가',35,100,11,0,1);
  lspawn('3층 생화 통로',58.7,74,11,0,-1);
  lspawn('지하 1층 다이소 앞',213,4,-6,0,1);
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
    K.texture('gb5_arrivalbrick',128,128,(g,w,h)=>{g.fillStyle='#d9a877';g.fillRect(0,0,w,h);g.fillStyle='#c88e5c';for(let y=0;y<h;y+=16)for(let x=-32;x<w;x+=64)g.fillRect(x+(y%32?32:0)+1,y+1,62,14);},[.48,.48]);
    K.texture('gb6_countertile',96,96,(g,w,h)=>{g.fillStyle='#f0f0e9';g.fillRect(0,0,w,h);g.fillStyle='#bfc2bd';for(let k=0;k<96;k+=24){g.fillRect(k,0,1,h);g.fillRect(0,k,w,1);}},[.8,.8]);
    const hallWest=clip(WEST.map(p=>toL(...p)),1,6,true).map(p=>W(...p));
    K.hpoly('gb5_hallstone',hallWest,.009,true,holes(hallWest,0));K.hpoly('gb5_hallstone',NORTH,.009,true,holes(NORTH,0));
    const ticketRect=[24,137,65,156.5],trussRect=[8,14,32,34],seatsRect=[8,108,34,130],cafeRect=[56,54,71.4,84],corridorRect=[56,23,75.7,153];
    const doorRect=[68,26,75.7,35];
    const pockets=[ticketRect,trussRect,seatsRect,cafeRect,corridorRect];
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
    cover(hallWest,[...pockets,...ceilHoles],3.3);K.hpoly('gb_acoustic',NORTH,3.3,false,holes(NORTH,6));
    cover(rect(...corridorRect),[cafeRect,ticketRect,doorRect],4.5);
    K.hpoly(0xf1efe8,rect(...doorRect),5.7,false);
    const inPocket=(u,v)=>pockets.some(r=>inRect(r,u,v,.2));
    columns(hallWest,0,3.28,(u,v)=>inPocket(u,v)||(u>68&&u<72));columns(NORTH,0,3.28,(u,v)=>v>23&&v<28);
    furnish(() => {
    // 600 mm T-bars align to the terminal, with 1.2 m rows of small downlights.
    const ceilStrip=(u0,v0,u1,v1,y)=>{const p=rect(u0,v0,u1,v1).map(([x,z])=>[x,y,z]);K.quad(0xc4c3bd,p,[0,-1,0]);};
    for(let u=56;u<75.7;u+=.6)for(const [a,b] of [[23,26],[35,54],[84,153]])ceilStrip(u,a,u+.018,b,4.49);
    for(let v=23;v<153;v+=.6){if(v>26&&v<35)continue;if(v>54&&v<84)ceilStrip(71.4,v,75.7,v+.018,4.49);else ceilStrip(56,v,75.7,v+.018,4.49);}
    for(let u=68.4;u<75.1;u+=1.2)for(let v=30;v<153;v+=1.2){if(inRect(cafeRect,u,v)||inRect(doorRect,u,v))continue;lcyl(u,v,4.46,.08,.025,'emit',{seg:6,solid:false});}
    for(let u=9;u<315;u+=6)for(let v=9;v<156;v+=6){
      const [x,z]=W(u,v);if(!K.pointInPoly(x,z,P)||blocked(u,v,2)||inPocket(u,v))continue;
      lbox(u,v,3.23,.2,1.45,.055,0xd2d1ca,{solid:false});for(const du of [-.055,.055])lbox(u+du,v,3.215,.045,1.3,.018,'emit',{solid:false});
    }
    for(let v=15;v<30;v+=3)for(const u of [68.5,72.8]){lbox(u,v,3.2,.3,1.2,.06,0xbfc2bc,{solid:false});for(const du of [-.07,.07])lbox(u+du,v,3.185,.04,1.1,.025,'emit',{solid:false});}
    });
    // Sealed pocket reveals hide the old ceiling plane and cut-off column heads.
    function bulk(r,y){for(const [a,b,c,d] of [[r[0],r[1],r[2],r[1]],[r[2],r[1],r[2],r[3]],[r[2],r[3],r[0],r[3]],[r[0],r[3],r[0],r[1]]])lwall(a,b,c,d,3.3,y,{mat:0xf4f2ee,thick:.12,solid:false});}
    bulk(ticketRect,5.6);bulk(seatsRect,4);
    for(const [a,b,c,d] of [[8,14,32,14],[32,14,32,34],[32,34,8,34],[8,34,8,14]]){lwall(a,b,c,d,3.3,6.8,{mat:0xf4f2ee,thick:.12});lwall(a,b,c,d,6.8,7.1,{mat:doorGlass,thick:.06});}
    // Cafe reveal faces the corridor above the 4.5m ceiling; its south sightline stays open.
    lwall(56,54,56,84,3.3,6,{mat:0xf4f2ee,thick:.12,solid:false});lwall(56,54,71.4,54,3.3,6,{mat:0xf4f2ee,thick:.12,solid:false});lwall(71.4,54,71.4,84,4.5,6,{mat:0xf4f2ee,thick:.12,solid:false});
    // 02: the west half is a run of real shop units, rather than an open column hall.
    const westNames=['북창동 순두부','파리바게뜨','백미당','노브랜드버거'];let wi=0;
    for(let v0=23;v0<137;v0+=6){const v1=Math.min(v0+6,137),v=(v0+v1)/2;
      if(v0<66&&v1>44||v0<110&&v1>102)continue;
      for(const u of [34,56])lwall(u,v0,u,v1,0,3.3,{mat:doorGlass,thick:.035,openings:[{at:(v1-v0)/2,w:1.9,y0:0,y1:2.5}]});
      for(const end of [v0,v1])lwall(34,end,56,end,0,3.3,{mat:0xe7e0d3,thick:.14});
      lwall(44.8,v0,44.8,v1,0,3.3,{mat:0xe5dfd2,thick:.14});
      const name=westNames[wi++%westNames.length];
    furnish(() => {
      for(const [u,face] of [[34,'-u'],[56,'+u']]){lbox(u,v,2.5,.28,v1-v0,.9,0xd9531e,{solid:false});lsign(name,u+(face==='+u'?.16:-.16),v,2.94,v1-v0-.5,.5,face,{bg:null,fg:'#fff'});}
      for(const u of [36,53.7]){lbox(u,v,0,.65,v1-v0-1,2.1,0xdbd4c4,{side:'gb_shelf'});lbox(u+(u<40?2:-2),v,0,.9,2.2,.95,0xc9baa1);lbox(u,v,3.17,.6,3,.03,'emit',{solid:false});}
    });
      lzone(name,'1F','대합실 상점',34,v0,56,v1,0,3.4,3);
    }
    // 10/16: 5–7 m individual fascias. The food counters face the walking aisle.
    const stallRows=[[23,42,['DUNKIN’','김밥천국','이마트24']],[73,94,['기운센 식당','로봇김밥','기운센 식당']],[109,127,['로봇김밥','파리바게뜨','백미당']],[132,139,['이마트24']]];
    for(const [v0,v1,names] of stallRows){const step=(v1-v0)/names.length;
      lwall(56,v0,56,v1,0,4.5,{mat:0xe4dfd3,thick:.14});
      for(let j=0;j<names.length;j++){const a=v0+j*step,b=a+step,v=(a+b)/2,name=names[j],food=name==='기운센 식당'||name==='로봇김밥';
        for(const end of [a,b])lwall(56,end,66.7,end,0,3.3,{mat:0xdcd7c9,thick:.13});
        lwall(66.65,a,66.65,b,3.4,4.5,{mat:0xd8cdb4,thick:.12,solid:false});
        if(!food&&name!=='DUNKIN’')lwall(66.85,a,66.85,b,0,2.5,{mat:doorGlass,thick:.03,openings:[{at:step/2,w:1.8,y0:0,y1:2.5}]});
        furnish(() => {
        lbox(66.95,v,2.5,.3,step-.08,.9,0x3a3634,{solid:false});lsign(name,67.13,v,2.94,step-.45,.5,'+u',{bg:null,fg:'#fff',padding:.015,pxPerM:160});
        // Sloped orange canopy has depth and a visible orange front edge.
        const pt=(u,y,dv)=>{const[x,z]=W(u,v+dv);return[x,y,z];};K.quad(0xd9531e,[pt(66.6,3.42,-step/2),pt(67.25,3.28,-step/2),pt(67.25,3.28,step/2),pt(66.6,3.42,step/2)],[A[0],1,A[1]]);
        lbox(67.22,v,3.25,.08,step,.14,0xd9531e,{solid:false});
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
    let ni=0;
    for(const [u0,u1] of [[132,149],[174,188],[196,210],[230,246],[287,313]]){
      const count=Math.ceil((u1-u0)/6.5),step=(u1-u0)/count;
      for(let j=0;j<count;j++){const a=u0+j*step,b=a+step,u=(a+b)/2;const shopIndex=ni++;
        lwall(a,10.4,b,10.4,0,3.3,{mat:0xe3dfd4,thick:.14});for(const uu of [a,b])lwall(uu,10.4,uu,22,0,3.3,{mat:0xe3dfd4,thick:.14});
        furnish(() => {
        lbox(u,21.9,2.5,step-.08,.25,.8,0x3a3634,{solid:false});lbox(u,22,3.25,step,.4,.15,0xd9531e,{solid:false});
        });
        lwall(a,21.8,b,21.8,0,2.5,{mat:doorGlass,thick:.03,openings:[{at:step/2,w:1.8,y0:0,y1:2.5}]});
        furnish(() => {
        lbox(u,12,.05,step-.7,.65,2.1,0xded6c4,{side:'gb_shelf'});lbox(u,19,0,step-1,.7,.95,0xc2b8a2);lbox(u,16,3.16,step-1,.5,.04,'emit',{solid:false});
        const names=['BURGER KING','DUNKIN’','TOUS les JOURS','emart24','ZZANG GAMES','기운센 식당','로봇김밥'];
        const name=names[shopIndex%names.length],color=name==='BURGER KING'?0xb62329:name==='DUNKIN’'?0xde5b22:0x3c362f;
        lbox(u,21.98,2.55,step-.12,.12,.67,color,{solid:false});
        lsign(name,u,22.07,2.9,step-.45,.42,'+v',{bg:null,fg:name==='emart24'?'#ffc92c':'#fff',pxPerM:160});
        for(const du of [-step/2+.16,step/2-.16])lbox(u+du,21.85,0,.26,.32,2.5,name==='TOUS les JOURS'?'gb5_arrivalbrick':0x655346,{solid:false});
        if(name==='ZZANG GAMES'){
          for(const du of [-1.65,-.55,.55,1.65]){
            lbox(u+du,17.3,0,.9,.8,1.55,0x28262b);lbox(u+du,17.75,.68,.88,.48,.12,0xd62a63,{solid:false});
            lsign('짱게임즈',u+du,17.73,1.17,.67,.47,'+v',{bg:'#344575',fg:'#ffc94a'});
          }
          for(let k=0;k<4;k++)lbox(u-step/2+.7+k*(step-1.4)/3,18,3.17,(step-1.5)/4,4,.04,{tex:'emit',color:k%2?0xf57f47:0xfff2bf},{solid:false});
        }else if(name==='TOUS les JOURS'||name==='DUNKIN’'){
          lbox(u,20.3,.5,step-1.2,.8,.8,doorGlass,{solid:false});
          for(const y of [.55,.9,1.25])for(let k=0;k<9;k++){
            lbox(u-step/2+.9+k*(step-1.8)/8,20.32,y,.32,.36,.12,[0xe4b16b,0xc18b46,0xf4d59c][k%3],{solid:false});
          }
        }else if(name==='BURGER KING'){
          for(const du of [-1.4,0,1.4])lsign('BURGER KING',u+du,20.9,2.08,1.1,.5,'+v',{bg:'#f4d6a2',fg:'#9e2925'});
        }

        });
      }
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
    for(let i=1;i<wb.length;i++){const a=wb[i-1].v,b=wb[i].v,gap=b-a;if(gap<6.9)continue;const v=(a+b)/2,count=gap>=8?4:2;for(const u of [72.4,73.4,74.4])bench(u,v,false,count);}
    for(let u=155;u<315;u+=8){if([163,218,232.4,259].some(e=>Math.abs(e-u)<4)||blocked(u,28.1,3))continue;bench(u,28.1,true);}
    for(const v of [26.9,28,29.1])bench((waitingWindow[0]+waitingWindow[1])/2,v,true,4);
    // 11: wide paired brown door screens, central black digital-board pier, clear transoms.
    for(const [bi,b] of bays.entries()){
      const west=b.west,face=west?'-u':'-v',dw=b.n===null?3.8:west?5.6:2.4;
      const part=(t,y,w,h,d,mat,off=-.14)=>lbox(b.u+(west?off:t),b.v+(west?t:off),y,west?d:w,west?w:d,h,mat,{solid:false});
      if(b.n===null){
        part(0,.08,dw,2.92,.025,doorGlass,.05);for(const side of [-1,1]){part(side*(dw/2+.18),0,.36,3.4,.36,0x3e4143,.22);part(side*.95,0,.055,2.9,.09,0x3e4143,.08);}
        part(0,2.9,dw+.72,.6,.36,0x3e4143,.22);part(0,1.1,dw,.06,.08,0x3e4143,.08);
        part(0,3.5,dw+1,2,.18,'gb5_arrivalbrick',.22);for(const side of [-1,1])part(side*(dw/2+.58),0,.42,3.5,.16,'gb5_arrivalbrick',.22);
        part(dw/2+.9,.14,.35,.78,.32,0x373a38,.65);lsign('하차장 입구',b.u,b.v-.29,3.17,dw,.28,'-v',{bg:null,fg:'#f4f0e3'});
        lquadH(b.u-2.4,b.v+.2,b.u+2.4,b.v+6,.151,0x9c7a4a);continue;
      }
      if(west&&b.n===16){
        const brown=0x493d32;
        part(0,.05,5.5,2.92,.025,doorGlass);
        for(const t of [-2.8,-2,-1,0,1,2,2.8])part(t,.02,.07,2.94,.12,brown);
        for(const y of [.06,1.02,1.75,2.56,2.96])part(0,y,5.6,.065,.12,brown);
        for(const t of [-.9,-.1,.1,.9])part(t,.95,.03,.44,.18,0xc3bcaa,-.22);
        for(const t of [-3.02,3.02])part(t,0,.4,3.65,.28,'gb5_arrivalbrick');
        part(0,3.0,6.4,.65,.24,'gb5_arrivalbrick');
        lsign('‹ 승차홈 17~36  │  승차홈 1~16 ›',75.3,b.v,3.27,5.5,.46,'-u',{bg:'#b29a76',fg:'#fff',box:.04,boxMat:0x9a8061,offset:.06});
        lsign('비상구',75.34,b.v,2.85,.4,.24,'-u',{bg:'#16b18e',fg:'#fff'});
        for(let t=-3;t<=3;t+=.22)part(t,3.65,.055,1.9,.17,0xb59a74,-.25);
        for(let t=-2.9;t<=2.9;t+=.35)part(t,4.3,.3,1.18,.1,t%1>.5?0x405a36:0x2c442d,-.09);
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
    for(const [u,v,face] of [[71.5,45,'-v'],[71.5,106,'-v'],[118,26,'+u'],[254,26,'-u'],[48,151,'+v']]){
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
      const aa=W(u0,v0),bb=W(u1,v1),a=new K.THREE.Vector3(aa[0],y0,aa[1]),b=new K.THREE.Vector3(bb[0],y1,bb[1]),d=b.clone().sub(a).normalize(),n=d.clone().cross(new K.THREE.Vector3(0,1,0)).normalize(),m=d.clone().cross(n).normalize();
      const p=(v,t)=>v.clone().addScaledVector(n,Math.cos(t)*r).addScaledVector(m,Math.sin(t)*r).toArray();
      for(let k=0;k<6;k++){const t=k*PI/3,tt=(k+1)*PI/3,norm=n.clone().multiplyScalar(Math.cos((t+tt)/2)).addScaledVector(m,Math.sin((t+tt)/2));K.quad(0xf2f1ec,[p(a,t),p(b,t),p(b,tt),p(a,tt)],norm.toArray());}
    };
    for(const v of [17,23,29,33]){beam(8,v,5.4,32,v,5.4);beam(8,v,6.4,32,v,6.4);for(let u=8;u<32;u+=4)beam(u,v,5.4,u+4,v,6.4);}
    lwall(9,16,31,16,0,2.6,{mat:0x8a6a4b,thick:.16});
    furnish(() => {
    lbox(20,16.1,2.32,22,.16,.3,0x2e2f2e,{solid:false});lsign('현금 카드 매표·환불  |  카드 매표',20,16.2,2.47,18,.23,'+v',{bg:null,fg:'#fff'});
    lquadH(10.5,16.4,29.5,19.1,.022,0x8d8f8c);for(let u=11;u<=29;u+=.85)kiosk(u,16.6);
    for(let u=9.4;u<31;u+=.5){lbox(u,16,2.6,.5,.5,.2,0x494940,{solid:false});lbox(u,16,2.8,.5,.5,.35,[0x36543a,0x4b6943,0x54714b][Math.round(u*10)%3],{solid:false});}
    for(const u of [15,25])lsign('',u,16.14,3.65,1.6,.9,'+v',{bg:'#1a1d2a',box:.08,boxMat:0x292c2b});for(const u of [14,20,26])bench(u,27,true);
    });
    lzone('무인발권기','1F','철골 천장 · 대합실',8,14,32,34,0,6.8,4);
    // 15: light oak slats against a white backing, planted columns and upholstered benches.
    K.hpoly('gb5_ticket_tile',rect(...seatsRect),.014);K.hpoly(0xeeebe4,rect(...seatsRect),4,false);
    for(const [u,v] of [[18,113],[30,124]]){lbox(u,v,0,1,1,3.8,0x3f6a3a);for(let y=.2;y<3.8;y+=.4)for(const s of [-1,1]){lbox(u+s*.52,v,y,.08,.95,.32,0x527c45,{solid:false});lbox(u,v+s*.52,y,.95,.08,.32,0x527c45,{solid:false});}}
    furnish(() => {
    for(let u=8.1;u<34;u+=.25)lbox(u,119,3.8,.06,22,.15,0xc9a77c,{solid:false});for(let u=10;u<33;u+=1.6)lbox(u,119,3.77,.06,18,.03,'emit',{solid:false});
    for(const [u,v,col] of [[13,113,0xe8741e],[26,113,0xe8741e],[13,124,0xe8741e],[26,124,0x2c2e2d]]){lbox(u,v,.12,5.4,1,.35,col);lbox(u,v+.4,.47,5.4,.2,.4,col,{solid:false});for(const s of [-1,1])for(let k=0;k<3;k++){const du=s*(2.7+k*.1),d=1-.15*k;lbox(u+du,v,.12,.1,d,.35,col,{solid:false});lbox(u+du,v+.4-.035*k,.47,.1,.2,.4,col,{solid:false});}}
    });
    lzone('대합실 좌석','1F','목재 천장 · 주황 벤치',8,108,34,130,0,4,4);
    // The cafe occupies the two edges of its void; its tables have a real mezzanine floor.
    K.slab(rect(56,54,71.4,58),6,{mat:'tile',under:0xf1ede4,thick:.18});
    K.slab(rect(56,80,71.4,84),6,{mat:'tile',under:0xf1ede4,thick:.18});
    lwall(56,80,71.4,80,6,7.1,{mat:doorGlass,thick:.08});
    furnish(()=>{
      lbox(63.7,80,5.95,15.4,.2,.8,0xefe9dc,{solid:false});
      lsign('FOOD STATION 2F',63.7,79.84,6.35,8,.7,'-v',{bg:null,fg:'#d63e29'});
      lbox(63.7,80.16,7.1,15.2,.12,2.4,0x333934,{solid:false});
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
    lbox(63.7,58.3,7.1,15.2,.12,2.4,0x333934,{solid:false});lsign('HOLLYS',61.05,58.42,8.45,4.2,.65,'+v',{bg:null,fg:'#fff'});lsign('COFFEE',66.35,58.42,8.45,4.2,.65,'+v',{bg:null,fg:'#fff'});lsign('●',63.7,58.43,8.46,.65,.6,'+v',{bg:null,fg:'#cd2338',offset:.035});
    for(let k=0;k<6;k++)lsign(k===0?'LEMON':'메뉴 안내',58.8+k*1.95,58.5,5.5,1.6,.4,'+v',{bg:'#f4f6f8',fg:'#464d4b',padding:.01});
    for(const u of [58,61,64,67,70]){lbox(u,56,6.85,.7,.6,.07,0x8b6a4b,{solid:false});lcyl(u,56,7.85,.18,.22,{tex:'emit',color:0xffd699},{seg:6,solid:false});}
    for(let y=.2;y<5.4;y+=.45)lbox(56.2,64,y,.3,2.4,.4,y%1>.5?0x4e6d42:0x35553b,{solid:false});
    });
    lzone('할리스 · 푸드스테이션','2F','카페',56,52,71.4,58,6,11,4);
    furnish(() => {
    lcrowd(68.5,29,71.7,137,0,40,606);for(const [u,v] of [[138,24.5],[160,25],[221,24.8],[286,25],[33,143],[51,142.5],[13,113],[26,124]])lperson(u,v,0,{sit:u===13||u===26});
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
        }
        lbox(u,150.1,3.22,.085,4.5,.08,0xb18c61,{solid:false});
      }
      for(const u of [26.7,33.9,41.1,47]){
        lbox(u,147.05,.15,.065,.065,2.48,'emit',{solid:false});
        lbox(u+.13,147.3,.15,.11,.3,2.65,0x385238,{solid:false});
      }
      for(const u of [30.5,38.5,46.3]){
        lbox(u,146.9,.05,.58,.26,2.65,0x252829,{solid:false});
        lsign(['승차권 예매','경부선 · 영동선','모바일 승차권'],u,146.74,1.47,.48,2.22,'-v',{bg:'#1268ad',fg:'#f0faf8'});
        lbox(u-2,149,.12,3.2,1.15,.36,0x2f3231);lbox(u-2,149.42,.48,3.2,.25,.45,0xc86731,{solid:false});
        lperson(u-1.5,148.85,.12,{sit:true,shirt:0x3b495b});
      }
      for(const [u,v] of [[27,143],[31,144],[35,142.8],[39,144.3],[43,142.9],[46,144],[50,148],[54,147.4]])lperson(u,v,0);
      // Photo32: high white ventilation louvres above the long aisle.
      for(let y=.5;y<3.1;y+=.055)lbox(67.08,98.5,y,.06,7,.018,0xb5b6ad,{solid:false});
      lsign('유니클로  1F ↑',109.8,17.5,2.65,2.1,.5,'+v',{bg:'#f5f3ee',fg:'#bb1731'});
      lsign('다이소  B1 ↓',109.8,17.5,2.08,2.1,.4,'+v',{bg:'#f5f3ee',fg:'#c8102e'});
    });
    ldetail({floor:'1F',y0:0,y1:9.5,poly:P,name:'1F 대합실 · 매표 · 상점 · 좌석'}, () => { for(const draw of detail)draw(); });
  }

  function buildBasement(){
    const poly=[[30,0],[284,0],[284,22],[58,22],[58,68],[30,68]].map(q=>W(...q)),y=LEVELS.B1;
    const lobby=rect(180,.2,246,8.15),store=rect(180.15,8.15,245.85,21.8);
    K.texture('gb_b1_granite',128,128,(g,w,h)=>{
      g.fillStyle='#b8b6af';g.fillRect(0,0,w,h);const r=K.rand(1818);
      for(let i=0;i<1900;i++){g.fillStyle=i%3?'#d0cec6':'#8c8b84';g.fillRect(r()*w,r()*h,1,1);}
      g.fillStyle='#8e8e87';g.fillRect(0,0,w,1);g.fillRect(0,0,1,h);
    },[.6,.6]);
    K.texture('gb7_daiso_circles',256,256,(g,w,h)=>{
      g.fillStyle='#c8102e';g.fillRect(0,0,w,h);g.strokeStyle='#f5f1e8';g.lineWidth=10;
      for(const [x,z,r] of [[45,30,24],[173,104,32],[69,204,36],[253,235,46]]){g.beginPath();g.arc(x,z,r,0,PI*2);g.stroke();}
    },[2.5,2.5]);
    K.material('gb_b1_gloss',new K.THREE.MeshPhongMaterial({color:0xffffff,vertexColors:true,shininess:85,specular:0x777777}));
    K.material('gb_daiso_glass',new K.THREE.MeshLambertMaterial({color:0xf2f6f6,transparent:true,opacity:.15,depthWrite:false,side:K.THREE.DoubleSide}));
    const gloss={tex:'gb_b1_gloss',color:0xe8e7e1},daisoGlass='gb_daiso_glass';
    K.slab(poly,y,{mat:'gb_b1_granite',under:false,holes:holes(poly,y)});
    const j=W(125.9,0);
    K.polyWalls(poly,y,-.3,{mat:0xe8e6df,thick:.25,openings:[{x:j[0],z:j[1],w:8.8,y0:y,y1:y+3.6}]});
    K.hpoly(gloss,lobby,y+.009);K.hpoly(gloss,store,y+.009);
    K.hpoly('gb_acoustic',poly,y+3.05,false,holes(poly,0));K.hpoly(0xf1f0ea,lobby,y+3.025,false);
    columns(poly,y,3.03,(u,v)=>u>180&&u<246||Math.abs(v-6)<1.5);
    for(const u of [198,228])lbox(u,4.4,y,.65,.65,3.02,0xc9cecb);
    // J2 is an eight metre corridor at the exact shared world coordinates.
    const zG=x=>-152.37-.3733*(x-107.2)-.3,zF=x=>-59.24-.37993*(x-2.3);
    const cp=[[116,zG(116)],[124,zG(124)],[124,zF(124)],[116,zF(116)]];
    K.slab(cp,y,{mat:'gb_b1_granite',under:false});K.hpoly('gb_acoustic',cp,y+3.6,false);
    for(const x of [116,124])K.wall(x,zG(x),x,zF(x),y,y+3.6,{mat:0xe4e0d6,thick:.22});
    K.zone({name:'터미널 지하상가',floor:'B1',sub:'다이소 · 상가 · 고속터미널역 연결',poly,y0:y,y1:0,priority:1});
    K.zone({name:'고투몰 ↔ 경부선 연결통로',floor:'B1',sub:'지하철 연결',poly:cp,y0:y,y1:y+3.6,priority:3});
    lzone('다이소 강남고속터미널점','B1','생활용품 · 문구 · 주방용품',180,8,246,21.5,y,0,4);
    lzone('다이소 입구','B1','유리문 · 매장입구 안내',180,.2,246,8,y,y+3.05,3);
    lzone('대합실 연결 계단','B1','에스컬레이터 · 경부선 · 영동선',100,2,114,18,y,0,4);
    // Main stair beside the preserved escalator pair, with a real slab opening and guarding.
    lstairs(109.8,4,109.8,16,{w:2.5,ya:y,yb:0,mat:0xbcb5a7,steps:36,rails:true});
    for(const u of [108.4,111.2])lwall(u,4,u,16,y,1.05,{mat:0xa59e8d,thick:.12});
    lwall(108.4,4,111.2,4,0,1.05,{mat:doorGlass,thick:.06});
    for(const u of [103.1,107])lwall(u,4,u,16,y,0,{mat:0xc6bda9,thick:.12});
    // One white store front with a 2.4m two-leaf entrance, as in photo17.
    lwall(180,8,180,21.8,y,y+3.04,{mat:0xf0eee8});lwall(246,8,246,21.8,y,y+3.04,{mat:0xf0eee8});
    for(const [a,b] of [[180,205],[223,246]])lwall(a,8,b,8,y,y+3.04,{mat:0xf3f2ee,thick:.14});
    for(const [a,b] of [[205.15,212.8],[215.2,222.85]])lwall(a,8,b,8,y+.12,y+2.64,{mat:daisoGlass,thick:.035});
    for(const u of [205,223])lbox(u,7.98,y,.3,.3,3,0xc8102e);
    // Shop fronts/partitions stay available before their fittings load.
    const shops=[];
    for(const [u0,u1] of [[68,94],[142,178],[250,262]])for(let a=u0;a<u1;a+=4.5){
      const b=Math.min(a+4.5,u1);if(b-a<2)continue;shops.push({a,b,u:(a+b)/2});
      lwall(a,9.3,a,21.5,y,y+3.04,{mat:0xe5e0d3,thick:.12});
      lwall(a,9.3,b,9.3,y,y+2.58,{mat:doorGlass,thick:.04,openings:[{at:(b-a)/2,w:1.5,y0:y,y1:y+2.58}]});
    }
    // A short second run creates the two-sided approach in photo34; the J2 mouth stays clear.
    for(const [a,b] of [[142,151],[153,162],[164,177]])lwall(a,1.8,b,1.8,y,y+3.04,{mat:doorGlass,thick:.04,openings:[{at:(b-a)/2,w:1.5,y0:y,y1:y+2.55}]});

    ldetail({floor:'B1',y0:y,y1:0,poly,name:'B1 상가·연결통로'},()=>{
      for(let u=31;u<283;u+=.6){if(blocked(u,5,1)||u>180&&u<246)continue;K.hpoly(0xc5c4bd,rect(u,.25,u+.018,9.2),y+3.035,false);}
      for(let v=.3;v<9;v+=.6)K.hpoly(0xc5c4bd,rect(31,v,179,v+.018),y+3.035,false);
      for(let u=36;u<281;u+=3.6)for(const v of [3,7.9]){
        if(blocked(u,v,1.4)||u>180&&u<246)continue;
        lbox(u,v,y+2.96,2.2,.26,.055,0xb5b7b0,{solid:false});
        for(const dv of [-.075,.075])lbox(u,v+dv,y+2.945,2.08,.035,.025,'emit',{solid:false});
      }
      for(const [a,b] of [[64,102.7],[111.6,180],[246,280]])K.hpoly('gb_tactile',rect(a,5.85,b,6.15),y+.016);
      for(const [a,b] of [[102.8,107.1],[108.5,111.1]])K.hpoly('gb_tactile',rect(a,2.8,b,3.4),y+.02);
      // Photo41 brown/beige stripe tiling, stainless panels, route board and yellow C marker.
      for(let h=0;h<6;h+=.48)for(const u of [103.03,107.07,111.27])lwall(u,4,u,16,y+h,y+Math.min(6,h+.48),{mat:Math.round(h/.48)%2?0xcfc6af:0x715b4f,thick:.018,solid:false});
      for(const u of [103.1,107,108.4,111.2])lbox(u,10,.99,.06,12,.07,0x8c9393,{solid:false});
      lbox(112.3,4,y,.85,.38,3.04,0xdbc72d,{solid:false});
      lsign(['C','1','8','8-1','8-2'],112.3,3.78,y+1.66,.6,2.5,'-v',{bg:'#e9cd27',fg:'#292c25',padding:.04});
      lbox(116.5,4.05,y+.65,5.9,.18,2.08,0xd5d1c5,{solid:false});
      lsign(['고속버스터미널  ↗','경부선   부산  대구  마산  진주','울산  포항  대전  천안  청주','영동선   속초  강릉  동해  삼척','원주  제천  여주  이천'],116.5,3.92,y+1.75,5.6,1.94,'-v',{bg:'#f5f3ee',fg:'#263f72',padding:.035});
      lsign('비상구 →',111.27,5,y+.48,.72,.3,'+u',{bg:'#168568',fg:'#fff'});
      lbox(102,2.5,y,.58,.5,1.85,0xf2f0e9);lsign(['상품권','환전 안내'],102,2.22,y+1.4,.48,.56,'-v',{bg:'#f8f4e9',fg:'#c56b32'});
      // Photographed blue/ochre signs hang below a visible stem pair.
      for(const [u,face,text,bg] of [[99,'-u','경부선 · 영동선  고속버스터미널 →','#2863a2'],[131,'+u','← 고투몰 · 고속터미널역','#2863a2'],[159,'-u','다이소 · 경부선 · 영동선 →','#a08d72'],[253,'+u','← 다이소 · 지하철','#2863a2']]){
        for(const v of [4,6])lbox(u,v,y+2.72,.028,.028,.32,0x464a48,{solid:false});
        lsign(text,u,5,y+2.48,3.2,.48,face,{bg,fg:'#fff',twoSided:true,box:.07,offset:.06});
      }
      lsign('나가는 곳 ↑',109.8,2.8,y+2.5,2.1,.42,'-v',{bg:'#e9c630',fg:'#282b23'});
      // Photo42: circular ceiling cove at a widening in the corridor.
      for(let k=0;k<48;k++){
        const a=k*PI/24,b=(k+1)*PI/24,at=(r,t)=>{const[x,z]=W(134+r*Math.cos(t),5+r*Math.sin(t));return[x,y+3.02,z];};
        K.quad(k%2?'emit':0xd6e6e1,[at(1.5,a),at(1.5,b),at(1.72,b),at(1.72,a)],[0,-1,0]);
      }
      for(const [i,{a,b,u}] of shops.entries()){
        lbox(u,9.05,y+2.3,b-a-.06,.5,.7,0x4b252d,{solid:false});
        for(const du of [a+.04,u-.8,u+.8,b-.04])lbox(du,9.2,y,.07,.09,2.58,0x582931,{solid:false});
        lsign(i===7?'어가람':i===9?'한가람문구':'',u,8.77,y+2.67,b-a-.3,.35,'-v',{bg:null,fg:'#f6f4e9'});
        if(i===7)lsign('마산아구찜',u,8.76,y+2.34,2,.2,'-v',{bg:null,fg:'#f6f4e9'});
        lbox(u,9.15,y+.93,b-a-.12,.025,.16,0xf5f1e8,{solid:false});
        if(i%4===3){for(let yy=.1;yy<2.2;yy+=.11)lbox(u,9.22,y+yy,b-a-.15,.03,.075,0xc3c4be,{solid:false});continue;}
        lbox(u,20.8,y,b-a-.35,.45,2.2,0xd7d4ca,{side:'gb_shelf'});
        lbox(u+.9,13,y,.75,3,1.7,0xd7d4ca,{side:'gb_shelf'});lbox(u-1,15.5,y,.75,.75,1.5,0xbbaa91,{side:'gb_shelf',rot:PI/4});
        lsign(i%2?'생활용품 안내':'메뉴 안내',a+.6,9.08,y+1.65,.8,.75,'-v',{bg:'#f6f2e9',fg:'#b34b43'});
      }
      for(const [a,b] of [[142,151],[153,162],[164,177]]){
        lbox((a+b)/2,1.9,y+2.3,b-a,.25,.68,0x54343c,{solid:false});
        for(let u=a+.5;u<b;u+=1.1)lbox(u,1,y,.75,.5,1.9,0xcac5b5,{side:'gb_shelf'});
      }
      for(let z=zG(120)+4;z<zF(120)-2;z+=4.8)K.box({x:120,z,y:y+3.55,w:1.2,d:.5,h:.025,mat:'emit',solid:false});
      K.sign(['고속터미널역 · 고투몰','3·7·9호선'],{x:120,z:zF(120)-2,y:y+2.9,w:4,h:.65,rotY:PI,bg:'#275773',fg:'#fff'});
      K.sign('경부·영동선 터미널',{x:120,z:zG(120)+2,y:y+2.9,w:4,h:.55,bg:'#275773',fg:'#fff'});
      for(const [u,v] of [[153,5.2],[169,6.9],[96,5.2],[128,6.9],[252,5]])lperson(u,v,y,{shirt:0x586869,pants:0x242b30});
    });

    ldetail({floor:'B1',y0:y,y1:y+3.05,poly:rect(180,.2,246,22),name:'B1 다이소·입구'},()=>{
      for(let u=180;u<246;u+=.6)lquadH(u,.25,u+.012,21.8,y+.011,0xb6b6ae);
      for(let v=.6;v<22;v+=.6)lquadH(180.15,v,245.85,v+.012,y+.011,0xb6b6ae);
      for(let u=180.15;u<245.85;u+=.6)K.hpoly(0xc4c3bd,rect(u,8.15,u+.018,21.8),y+3.043,false);
      for(let v=8.15;v<21.8;v+=.6)K.hpoly(0xc4c3bd,rect(180.15,v,245.85,v+.018),y+3.043,false);
      for(const u of [184,191,198,205,212,219,226,233,240])for(const v of [2.5,6])lcyl(u,v,y+3.006,.105,.018,'emit',{seg:8,solid:false});
      for(const u of [198,228]){for(const du of [-.335,.335])lbox(u+du,4.4,y+.12,.015,.63,2.82,doorGlass,{solid:false});lbox(u,4.4,y,.69,.69,.11,0x414541,{solid:false});}
      lbox(214,7.98,y+2.72,18,.3,.3,0xc8102e,{solid:false});
      for(const [a,b] of [[205.15,212.8],[215.2,222.85]]){
        for(let u=a;u<=b;u+=1.35)lbox(u,7.98,y,.06,.11,2.72,0xbfc1b9,{solid:false});
        lbox((a+b)/2,7.94,y+.94,b-a,.05,.12,0xf1eee7,{solid:false});
      }
      // Photo33's patterned red surround is applied to this composite entrance; branch location is unverified.
      lbox(211.85,7.88,y,1.6,.08,2.7,'gb7_daiso_circles',{solid:false});
      lsign(['다이소','지하 1층 →'],211.85,7.8,y+1.35,1.35,.6,'-v',{bg:'#c8102e',fg:'#fff'});
      for(const du of [-1.2,0,1.2])lbox(214+du,7.94,y,.06,.15,2.72,0xb9bcb6,{solid:false});
      lbox(214,7.9,y+2.23,3.5,.15,.7,0xf6f4ee,{solid:false});
      lsign('다이소',214.2,7.79,y+2.58,2.5,.55,'-v',{bg:null,fg:'#c8102e',padding:.01});
      lsign('daiso',212.65,7.78,y+2.58,.5,.5,'-v',{bg:'#c8102e',fg:'#fff',padding:.03});
      for(const side of [-1,1]){
        lbox(214+side*.6,7.96,y+.1,1.14,.025,2.1,daisoGlass,{solid:false});
        lsign('매장입구 ↑',214+side*.6,7.87,y+1.02,1.15,.21,'-v',{bg:'#f3f1e8',fg:'#242a29',padding:.01});
        lfloorText('↑ 매장입구',214+side*.6,7.25,y+.031,1.15,.32,'+v',{fg:'#303a36',bg:'#f3f1e8',pxPerM:128});
      }
      for(const v of [7,7.5])lquadH(212.7,v,215.3,v+.035,y+.026,0xc8102e);
      for(let k=0;k<9;k++)lbox(216,7.5,y+.1+k*.095,.55,.42,.07,0xb9202b,{solid:false});
      lbox(211.8,7.1,y,.5,.14,1.62,0xf3f2e9,{solid:false});lsign(['국민가게','다이소','매장 안내'],211.8,7,y+1.1,.46,.8,'-v',{bg:null,fg:'#385d71'});
      // Continuous twin fluorescent tubes and inset round ventilation grilles.
      for(let u=181.5;u<245;u+=2.4)for(const v of [9.3,12,15,18,20.6]){
        lbox(u,v,y+2.94,2.28,.25,.045,0xc6cac8,{solid:false,skip:['n','s','e','w','top']});
        for(const dv of [-.075,.075])lbox(u,v+dv,y+2.925,2.2,.035,.025,'emit',{solid:false,skip:['n','s','e','w','top']});
      }
      for(let u=187;u<245;u+=9)for(const v of [11,19])lcyl(u,v,y+3,.38,.025,0x858c87,{seg:16,solid:false});
      const stock=[0xf0eee4,0xe1d1af,0xd94f54,0x6694bc,0x76a079,0xeed477,0xcfd9d9];
      // Ten paired gondola runs, 1.8m tall; the long cross-aisle is 3m clear at v13..16.
      function rack(u,v,len,idx){
        lbox(u,v,y,1.1,len,.13,0xc6af85);lbox(u,v,y+.13,.06,len-.05,1.63,0xf0eee6);
        for(let t=0;t<5;t++){
          const ty=y+.16+t*.34;lbox(u,v,ty,1.1,len,.04,0xe0d8c7,{solid:false});
          for(const side of [-1,1]){
            lbox(u+side*.54,v,ty+.045,.02,len,.06,0xf7f4e9,{solid:false});
            for(let n=0;n<Math.floor(len/.23);n++){
              const vv=v-len/2+.15+n*.23,col=stock[(idx+t+Math.floor(n/4))%stock.length];
              lbox(u+side*.3,vv,ty+.05,.42,.2,.2+(n%3)*.025,col,{solid:false,skip:['bottom']});
              lbox(u+side*.516,vv,ty+.14,.009,.12,.075,0xf4f3ed,{solid:false,skip:['bottom','top']});
            }
          }
        }
      }
      for(let k=0;k<10;k++){
        const u=186.5+k*6;
        if(Math.abs(u-214)>1.7)rack(u,11,3.9,k);
        rack(u,18.7,5.2,k+10);
        lsign(['주방용품','생활용품','문구','수납용품','욕실용품'][k%5],u,14.5,y+2.48,1.3,.32,'-u',{bg:k%2?'#31778c':'#326846',fg:'#fff',twoSided:true});
      }
      for(let u=183;u<245;u+=2.4){lbox(u,21.45,y,2.28,.55,2,0xe9e5da,{side:'gb_shelf'});}
      for(const u of [183.5,244]){lbox(u,10,y,2.2,.8,.92,0xe6e2d7);lbox(u-.6,9.75,y+.93,.45,.16,.3,0x333a38,{solid:false});}
      lbox(216.6,9.5,y,.55,.48,1.25,0xf5f3eb);lsign(['상품검색','상품을 찾아보세요'],216.6,9.24,y+1.03,.48,.36,'-v',{bg:'#bce5e6',fg:'#26494b'});
      for(const u of [211,231])lsign(['← 고투몰 · 지하철','경부선 · 영동선 →'],u,14.5,y+2.73,2.8,.44,'-u',{bg:'#f4f2ec',fg:'#a9333d',twoSided:true,box:.03});
      for(const [u,col] of [[183.6,0x4e96c5],[185.1,0xd994b4]]){
        lbox(u,3,y,.9,.9,.75,col);lbox(u,3,y+.75,.9,.9,1.15,daisoGlass,{solid:false});
        for(const du of [-.43,.43])for(const dv of [-.43,.43])lbox(u+du,3+dv,y+.75,.045,.045,1.15,col,{solid:false});
        lsign('인형뽑기',u,2.53,y+1.76,.7,.15,'-v',{bg:col===0x4e96c5?'#4e96c5':'#d994b4',fg:'#fff'});
        for(let k=0;k<6;k++)lbox(u-.26+k%3*.26,2.82+Math.floor(k/3)*.26,y+.77,.2,.2,.22,stock[k],{solid:false});
      }
      for(const [u,v] of [[208,4],[219.5,14.6],[229,14],[236,17.1],[197,14.8],[215,11]])lperson(u,v,y,{shirt:stock[Math.floor(u)%stock.length],pants:0x30383a});
    });
  }
  function buildUpper(){
    for(let i=1;i<10;i++){
      const p=floorPoly(i),y=ys[i],top=i===9?48:ys[i+1];
      K.zone({name:i===2?'고속터미널 꽃도매상가':'서울고속버스터미널',floor:`${i+1}F`,sub:uses[i],poly:p,y0:y,y1:top,priority:1});
      if(i<9&&i!==2){
        const voids=[[56,54,71.4,84],[8,14,32,34],[24,146,65,156.5],[16.4,66,25.2,92]];
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
    lsign('신세계백화점 본사',43,62,23.2,5,.55,'+v',{bg:'#e4e0d6',fg:'#3b3b38'});
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
    geometries.handle=new TH.TorusGeometry(.5,.035,3,10,PI).rotateY(PI/2);
    geometries.wreath=new TH.TorusGeometry(.4,.13,4,10).rotateY(PI/2);
    // Scalloped flower heads keep a flower silhouette at eye level. The former
    // one-colour rectangular blocks made the artificial displays look like boxes.
    const bloomPositions=[],bloomIndices=[];
    bloomPositions.push(0,.38,0,0,0,0);
    for(let n=0;n<10;n++){const a=n*PI/5,r=n%2?.67:1;bloomPositions.push(Math.cos(a)*r,n%2?.1:.18,Math.sin(a)*r);}
    for(let n=0;n<10;n++){bloomIndices.push(0,2+n,2+(n+1)%10,1,2+(n+1)%10,2+n);}
    geometries.bloom=new TH.BufferGeometry();geometries.bloom.setAttribute('position',new TH.Float32BufferAttribute(bloomPositions,3));geometries.bloom.setIndex(bloomIndices);geometries.bloom.computeVertexNormals();
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
      const cut=clipStock(u,w,kind==='dome'||kind==='bloom');if(!cut)return;u=cut[0];w=cut[1];
      const key=kind+(glow?':emit':'');if(!instances.has(key))instances.set(key,[]);
      instances.get(key).push([u,v,y,w,d,h,color]);
    }
    const db=(u,v,y,w,d,h,col,glow=false)=>deco('box',u,v,y,w,d,h,col,glow);
    const dp=(u,v,y,r,h,col)=>deco('pot',u,v,y,r*2,r*2,h,col);
    const dd=(u,v,y,rx,ry,rz,col)=>deco('dome',u,v,y,rx,rz,ry,col);
    const flower=(u,v,y,r,col)=>deco('bloom',u,v,y,r,r,r,col);
    K.texture('gb6_epoxy',256,256,(g,w,h)=>{
      g.fillStyle='#2f8466';g.fillRect(0,0,w,h);const er=K.rand(611);
      for(let i=0;i<300;i++){g.fillStyle=['#2a7560','#2f7f86','#3f9476'][i%3];g.globalAlpha=.16+er()*.15;
        g.beginPath();g.ellipse(er()*w,er()*h,5+er()*24,2+er()*17,er()*PI,0,PI*2);g.fill();}
      g.globalAlpha=.18;g.strokeStyle='#b0c6a3';g.lineWidth=1;
      for(let i=0;i<65;i++){const x=er()*w,z=er()*h;g.beginPath();g.moveTo(x,z);g.lineTo(x+er()*9,z+4+er()*20);g.stroke();}g.globalAlpha=1;
    },[8,8]);
    K.texture('gb_wicker',64,64,(g,w,h)=>{
      g.fillStyle='#bc985e';g.fillRect(0,0,w,h);
      for(let n=0;n<64;n+=8){g.fillStyle='#d3b47b';g.fillRect(0,n,w,4);g.fillStyle='#9a7848';g.fillRect(n,0,2,h);}
    },[.24,.24]);
    const flowerHoles=holes(fp,fy);
    K.hpoly('gb6_epoxy',fp,fy+.008,true,flowerHoles);
    K.hpoly('gb_acoustic',cp,fc,false,flowerHoles);
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
    // Photos06/07 include a glazed shopfront alongside open plant stalls.
    // This stays structural; display stock and its timber trim load lazily.
    for(const [u,a,b] of [[46.25,109.65,125.15],[33.65,128.9,133.15]]){
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
    function flowerDetail(name,bounds,fn){
      const seed=Array.from(name).reduce((n,c)=>(n*31+c.charCodeAt(0))>>>0,305);
      ldetail({floor:'3F',y0:fy,y1:16,poly:rect(...bounds),name},()=>{
        // Visiting one aisle first must not change the next aisle's stock placement.
        fr=K.rand(seed); instances=new Map(); stockLimit=Infinity; fn();
    const matrix=new TH.Matrix4(),quat=new TH.Quaternion().setFromAxisAngle(new TH.Vector3(0,1,0),ROT),pos=new TH.Vector3(),scale=new TH.Vector3(),colour=new TH.Color();
    for(const [key,list] of instances){
      const [kind,mode]=key.split(':'),mat=mode==='emit'?new TH.MeshBasicMaterial({color:0xffffff}):new TH.MeshLambertMaterial({color:0xffffff});
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
    for(const [u,a,b] of [[46.25,109.65,125.15],[33.65,128.9,133.15]]){
      db(u,(a+b)/2,fy+2.55,.12,b-a,.12,0xa78861);
      for(let v=a;v<=b+.01;v+=2.1)if(Math.abs(v-(a+b)/2)>.83)db(u,v,fy,.12,.12,2.65,0xa78861);
      for(const s of [-1,1])db(u,(a+b)/2+s*.75,fy,.1,.1,2.65,0xa78861);
    }
    // Building-aligned 600 mm T-bars, clipped to the perimeter and stair voids.
    const localCeil=cp.map(q=>toL(...q)),ceilCuts=flowerHoles.map(h=>{
      const ps=h.map(q=>toL(...q));return [Math.min(...ps.map(q=>q[0])),Math.min(...ps.map(q=>q[1])),Math.max(...ps.map(q=>q[0])),Math.max(...ps.map(q=>q[1]))];
    });
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
    const marketBlocked=(u,v)=>blocked(u,v,2.15)||inRect(lobby,u,v,1.95)||inRect([23,78,25,90],u,v,1.95)||elevs.some(e=>e.u<72&&Math.abs(u-e.u)<5.4&&Math.abs(v-e.v)<5.4);
    function bunch(u,v,y,col,blue,tier,hero=false){
      if(nearColumn(u,v,.65))return;
      if(tier===0){dp(u,v,y,.16,.3,0xa65a3a);y+=.3;}
      dp(u,v,y,.15,.42,blue?0x2b5c9e:0x22292a);
      const stem=.28+tier*.12;db(u,v,y+.37,.12,.12,stem,0x496a3c);
      dd(u,v,y+.41+stem,.22,.1,.22,0x496a3c);
      flower(u,v,y+.46+stem,.21,col);
      if(hero)for(let k=0;k<5;k++){const a=k*PI*.4;flower(u+Math.cos(a)*.14,v+Math.sin(a)*.14,y+.49+stem,.09,col);}
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
          for(let k=0;k<8;k++)bunch(bu,v-1.68+k*.48,by,colors[(n+k+tier*2)%colors.length],(n+k)%4===0,tier,Math.abs(u-58.7)<4&&v>=66&&v<79);
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
          db(gu-s*.035,bv,by-.13,.03,.025,.2,0x477346);
        }
        for(let k=0;k<8;k++){
          const z=v-1.6+k*.45;dp(u+s*1.5,z,fy+.75,.19,.32,0x67523d);
          dd(u+s*1.5,z,fy+1.07,.27,.12,.25,0x426742);
          flower(u+s*1.5,z,fy+1.14,.24,colors[(k*3+n)%colors.length]);
        }
      }
      for(let k=0;k<3;k++){
        const bu=u+(k-1)*.9,bv=v+1.45;if(nearColumn(bu,bv,.7))continue;
        dp(bu,bv,fy+.75,.15,.3,0x252b29);dp(bu,bv,fy+1.02,.12,1.4,0xe6dcc0);
        dd(bu,bv,fy+2.3,.17,.2,.17,0xe6dcc0);
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
      ['생화 동편 남쪽',[35,48,67.7,86],(u,v)=>v>=48&&v<=83.6&&u>35],
      ['조화',[10,91.45,34.5,128],(u,v)=>v>83.6&&v<128&&u<33.6],
      ['크리스마스',[35,91.45,67.7,128],(u,v)=>v>83.6&&v<128&&u>33.6],
      ['식물',[10,128,67.7,134],(u,v)=>v===131.2],
      ['화기·바구니 서편',[10,135,34.5,153],(u,v)=>v>=137&&u<35],
      ['화기·바구니 동편',[35,135,67.7,153],(u,v)=>v>=137&&u>35],
    ];
    for(const [name,bounds,select] of rooms)flowerDetail(name,bounds,()=>{
    for(const u of bands)for(const v of rows){
      if(!select(u,v))continue;
      if(marketBlocked(u,v)||(v===93.4&&u<27))continue;
      const n=bands.indexOf(u)*rows.length+rows.indexOf(v);stockLimit=u===67.4?67.5:Infinity;
      if(v<=83.6)fresh(u,v,n);
      else if(v===131.2)plants(u,v,n);
      else if(v>=137)supplies(u,v,n);
      else if(u<33.6)artificial(u,v,n);
      else christmas(u,v,n);
      // Every sign is OUTSIDE the stock footprint, visible in both travel directions.
      const su=u===67.4?65.1:u===31.6?33.9:u===38.4?36.1:u<33.6?u+2.25:[50,61.6].includes(u)?u-2.25:u+2.25;
      for(const du of [-.25,.25])db(su+du,v,fy+2.58,.012,.012,.22,0x848c7e);
      lsign(named.get(`${u},${v}`)||'',su,v,fy+2.415,.66,.33,'-v',{bg:'#1d6e55',fg:'#f2f2e6',twoSided:true,offset:.025,pxPerM:300,padding:.015});
      for(const dv of [-.95,.95]){
        db(u,v+dv,fc-.6,.02,.02,.6,0x777b70);
        deco('dome',u,v+dv,fc-.67,.07,.07,.14,0xffe2a8,true);
      }
      for(const side of [-1,1])if(u+side*1.95<stockLimit)lquadH(u+side*1.95-.12,v-1.95,u+side*1.95+.12,v+1.95,fy+.012,0x2b7a6e);
    }
    if(name==='조화'){
      // Photo01 looks through glass straight into buckets, not an empty lobby.
      stockLimit=Infinity;fresh(17.1,95.8,3);fresh(22.9,95.8,9);
    }
    if(name==='크리스마스'){
      stockLimit=Infinity;
      // Photo20's wire display grid bridges the aisle, with ornaments above
      // head height and long pendants at its sides rather than across the path.
      for(let v=109.8;v<125.2;v+=.65)db(47.1,v,fy+2.67,2.15,.018,.018,0x7c8074);
      for(const u of [46.35,47.1,47.85])db(u,117.5,fy+2.67,.018,15.4,.018,0x7c8074);
      for(let n=0;n<54;n++){
        const u=47.1+(n%3-1)*.72,v=110.1+Math.floor(n/3)*.83,y=fy+2.23+(n%4)*.08;
        db(u,v,y+.12,.012,.012,fy+2.67-y-.12,0x989987);
        deco('bloom',u,v,y,.13,.13,.13,[0xd3bb71,0xb92e3e,0xf1e8ce][n%3]);
      }
    }
    });
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
    const white=0xdad7cb,yellow=0xcfad39;
    const paint=(u0,v0,u1,v1,y=.035,col=white)=>lquadH(u0,v0,u1,v1,y,col);
    const line=(a,b,y,col=white,w=.12)=>{
      const dx=b[0]-a[0],dz=b[1]-a[1],len=Math.hypot(dx,dz),nx=-dz/len*w/2,nz=dx/len*w/2;
      K.quad(col,[[a[0]+nx,y,a[1]+nz],[b[0]+nx,y,b[1]+nz],[b[0]-nx,y,b[1]-nz],[a[0]-nx,y,a[1]-nz]],[0,1,0]);
    };
    function corners(u,v,rot,w,d){const[x,z]=W(u,v),c=Math.cos(rot),s=Math.sin(rot);return[[-w/2,-d/2],[w/2,-d/2],[w/2,d/2],[-w/2,d/2]].map(([a,b])=>[x+a*c+b*s,z-a*s+b*c]);}
    function vehicle(u,v,y,rot,kind,idx=0,label=''){
      if(kind!=='bus'){
        lcar(u,v,y,rot,kind,{color:[0xf1efea,0x353736,0xc2c4bf,0x656b70][idx%4],label});return;
      }
      // Photo02: full-height express coaches, high dark glazing, luggage holds and round wheels.
      // Aerial roof colours and the round3 brief support white/red/blue variants, not fleet assignments.
      const [x,z]=W(u,v),c=Math.cos(rot),s=Math.sin(rot),red=idx%6===0;
      const body=red?0xb72831:idx%6===4?0xe5dfcd:0xeeede6;
      const stripe=red?0xecece5:idx%3===1?0x28639a:idx%3===2?0xb53c42:0x9c967e;
      const p=(a,h,b)=>[x+a*c+b*s,y+h,z-a*s+b*c];
      const part=(a,h,b,w,d,hh,mat)=>{const q=p(a,h,b);K.box({x:q[0],y:q[1],z:q[2],w,d,h:hh,rotY:rot,mat,solid:false});};
      // Keep the kit coach's original 12 × 2.5 × 3.4 m collision envelope and roof support.
      K.box({x,z,y,w:2.5,d:12,h:3.4,rotY:rot,mat:body,ceil:false,skip:['n','s','e','w','top','bottom']});
      part(0,.42,0,2.5,12,2.98,body);
      part(0,3.4,-.6,1.6,2.4,.2,0xd9dad3);
      for(const side of [-1,1]){
        const a=side*1.258,n=[side*c,0,-side*s];
        const face=(mat,y0,y1,z0,z1,offset=0)=>K.quad(mat,[p(a+side*offset,y0,z0),p(a+side*offset,y0,z1),p(a+side*offset,y1,z1),p(a+side*offset,y1,z0)],n);
        face(0x1d3039,1.67,3.12,-5.55,5.58);
        face(0x4a6269,2.9,3.04,-5.52,5.53,.002);
        for(let b=-4.1;b<5;b+=1.38)face(0x465252,1.68,3.11,b,b+.045,.004);
        // Painted lower band and a broad diagonal return, kept free of invented brand marks.
        face(stripe,.53,.84,-5.8,4.8,.006);
        K.quad(stripe,[p(a+side*.008,.83,1.4),p(a+side*.008,.83,3.2),p(a+side*.008,1.65,1.8),p(a+side*.008,1.65,.0)],n);
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
        if(red){const q=p(a+side*.025,1.21,-.8);K.sign('금호고속',{x:q[0],y:q[1],z:q[2],w:2.5,h:.35,rotY:rot+side*PI/2,bg:null,fg:'#f3eee3'});}
      }
      // Tall coach windscreen above a solid luggage-height nose; narrow rear window and lamps.
      K.quad(0x233940,[p(-1.12,1.25,6.014),p(1.12,1.25,6.014),p(1.12,3.12,6.014),p(-1.12,3.12,6.014)],[s,0,c]);
      K.quad(0x2f454b,[p(-1.08,2.25,-6.014),p(1.08,2.25,-6.014),p(1.08,3.07,-6.014),p(-1.08,3.07,-6.014)],[-s,0,-c]);
      for(const a of [-.86,.86]){part(a,.7,6.025,.38,.04,.15,0xe2e5d5);part(a,.65,-6.025,.18,.04,.52,0xa9252b);}
      part(0,.39,6.025,2.32,.08,.15,0x4a5354);
      if(label){const q=p(0,2.91,6.04);K.sign(label,{x:q[0],y:q[1],z:q[2],w:1.8,h:.3,rotY:rot,bg:'#17272b',fg:'#f0dfac'});}
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
        const p=[[75.4,b.v-3.1],[79.2,b.v-1.5],[77.8,b.v+3],[75.4,b.v+3]].map(q=>W(...q));
        K.prism(p,0,.14,{mat:0x8a4a3e,top:0x8a4a3e});
        pipe(p[0],p[1],.29);pipe(p[1],p[2],.29);
        paint(79.2,b.v-2.6,89.5,b.v-2.48);
        lfloorText(String(b.n),81,b.v,.03,1.6,1.2,'+u',{bg:null,fg:'#efead9'});
        if(b.n%5!==0)vehicle(85.3,b.v+1.2,0,FACE['-u']-.45,'bus',b.n,b.dest.split(' · ')[0]);
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
    for(let v=24;v<153;v+=3){canopyPanel(75.2,v,80.1,v+2.88,true);lbox(77.65,v,5.55,5.2,.14,.24,0x3a3f44,{solid:false});}
    for(const u of [75.25,77.65,80])lbox(u,88.5,5.66, .14,129,.2,0x3a3f44,{solid:false});
    for(let v=25;v<153;v+=6)lcyl(78.7,v,.14,.12,5.41,0x3a3f44,{seg:8});
    // gb_hall26/30: white number lanterns on thin rods underneath the preserved canopy.
    for(const b of bays){
      if(b.n===null||b.n>36)continue;
      const u=b.u+(b.west?1.65:0),v=b.v+(b.west?0:2.1),face=b.west?'+v':'-u';
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
    for(let i=0;i<20;i++)stall(cp,110.5,57+i*3.5,0,FACE['-u']-.45,'bus',i,true);
    lzone('승차장 앞 버스 대기열','1F','승차홈 앞 통행로 · 고속버스 대기',86,50,145,135,0,5,2);
    lamp(89,135);lamp(144,52);
    // Sedans move to the central lot (world x150..227); retain the surveyed deck above it.
    const surfaceCars=K.osmBuilding(356129682)[0].poly;K.hpoly(asphalt,surfaceCars,.025);
    lquadH(169,34,177,126,.03,aisle);
    let ci=0;for(const u of [155,165,181,193])for(let v=40;v<124;v+=2.8){
      if(blocked(u,v,3)||Math.abs(v%16-11)<1.8)continue;
      stall(surfaceCars,u,v,0,FACE[u<173?'+u':'-u'],'car',++ci,ci%5!==0);
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
