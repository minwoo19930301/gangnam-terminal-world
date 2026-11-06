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
    g.fillStyle='#ecebe6';g.fillRect(0,0,w,h);g.fillStyle='#cececa';g.fillRect(0,0,w,1);g.fillRect(0,0,1,h);
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
  const inRect=(r,u,v,m=0)=>u>r[0]-m&&u<r[2]+m&&v>r[1]-m&&v<r[3]+m;
  const blocked=(u,v,m=0)=>excluded.some(r=>inRect(r,u,v,m));
  function holes(poly,y){
    const out=[];
    for(const c of cores)if(y>c.levels[0]&&y<=c.levels.at(-1))out.push(rect(c.u,c.v,c.u+4.4,c.v+8.4));
    for(const e of escs)if(y===e.yb)out.push(rect(e.u-1.8,e.v,e.u+1.8,e.v+e.len));
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
  for(let i=1;i<ys.length;i++){
    const p=floorPoly(i);K.slab(p,ys[i],{mat:i===2?'concrete':'tile',under:'gb_acoustic',holes:[...holes(p,ys[i]),...(i===1?[rect(56,58,71.4,70)]:[])]});
  }
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
  for(const b of bays)door(b.u,b.v,b.n===null?4:2.5);
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
  for(const b of bays){
    const face=b.west?'-u':'-v';
    const dw=b.n===null?3.8:2.4;
    const doorPart=(t,y,w,h,d,mat,offset=0)=>lbox(b.u+(b.west?offset:t),b.v+(b.west?t:offset),y,b.west?d:w,b.west?w:d,h,mat,{solid:false});
    for(const t of [-dw/2,0,dw/2])doorPart(t,.04,.055,2.55,.12,aluminium);
    for(const y of [.04,1.06,2.53])doorPart(0,y,dw,.055,.12,aluminium);
    for(const s of [-1,1]){
      const c=s*dw/4,hw=(dw/2-.09)/2;
      const pane=(t,y)=>{const[x,z]=W(b.u+(b.west?0:t),b.v+(b.west?t:0));return[x,y,z];};
      K.quad(doorGlass,[pane(c-hw,.1),pane(c+hw,.1),pane(c+hw,2.49),pane(c-hw,2.49)],b.west?[-A[0],0,-A[1]]:[-B[0],0,-B[1]]);
      doorPart(s*.12,.92,.035,.42,.06,0x727e83,-.09);
    }
    const dest=({1:'부산',2:'부산사상',3:'마산',4:'창원',5:'진주',6:'울산 · 통영 · 김해',7:'동대구',9:'포항 · 경주',10:'구미 · 상주',11:'대전',13:'세종',14:'천안',16:'공주 · 아산',18:'조치원 · 금산',19:'속초 · 양양',20:'삼척 · 동해',23:'강릉',24:'제천 · 정선',25:'원주',27:'용인',28:'이천',29:'여주',30:'영월 · 춘천',31:'안동 · 영주',32:'안성',33:'평택',34:'청주',35:'청주',36:'청주'})[b.n]||'';
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
    lsign(e.yb===11?'3층 꽃도매상가':e.yb===0?'매표소 · 승차홈':'2층 · 꽃상가 ↑',e.u,e.v-.3,e.ya+2.8,3.3,.5,'-v',{bg:'#225a4a',fg:'#fff'});
  }
  buildHall();buildBasement();buildUpper();buildYards();
  lspawn('경부선 터미널 정문',163,-16,0,0,1);
  lspawn('1층 대합실',70.5,89,0,0,-1);
  lspawn('1층 매표·환불',48,150,0,0,-1);
  lspawn('1층 무인발권기',20,23,0,0,-1);
  lspawn('1층 할리스 아래 통로',68,68,0,0,-1);
  lspawn('승차홈과 버스 마당',86,98,0,-1,0);
  lspawn('3층 꽃도매상가',35,100,11,0,1);
  lspawn('3층 생화 통로',35,74,11,0,1);
  lspawn('지하 1층 다이소 앞',213,4,-6,0,1);
  lspawn('경부선 주차장',174,110,6,0,-1);
  lspawn('10층 성당 · 옥상정원',38,85,43,0,1);
  lspawn('북측 동 옥상 주차장',138,18,NORTH_ROOF,1,0);

  function buildHall(){
    K.zone({name:'서울고속버스터미널',floor:'1F',sub:'매표소 · 대합실 · 경부·영동선 승차홈',poly:P,y0:0,y1:6,priority:1});
    // gb_hall 01/02/10: staggered grey stone strips, rather than square terrazzo.
    K.texture('gb5_hallstone',256,256,(g,w,h)=>{
      const r=K.rand(521),col=['#b8b5ae','#aaa9a2','#c4c1b9','#a6a79f','#b9b9b0'];
      g.fillStyle='#d0cdc5';g.fillRect(0,0,w,h);
      for(let row=0;row<8;row++)for(let c=-1;c<3;c++){
        const x=c*128+(row%2)*64,y=row*32;g.fillStyle=col[Math.floor(r()*col.length)];g.fillRect(x+1,y+1,126,30);
        for(let k=0;k<22;k++){g.fillStyle=k%2?'rgba(255,255,243,.10)':'rgba(65,67,60,.08)';g.fillRect(x+r()*128,y+2+r()*27,8+r()*55,.5+r()*2);}
      }
    },[1.2,1.2]);
    K.texture('gb5_ticket_tile',128,128,(g,w,h)=>{g.fillStyle='#e0dcd1';g.fillRect(0,0,w,h);g.fillStyle='#c2beb5';g.fillRect(0,0,w,1);g.fillRect(0,0,1,h);},[.8,.8]);
    K.texture('gb5_arrivalbrick',128,128,(g,w,h)=>{g.fillStyle='#d9c9a6';g.fillRect(0,0,w,h);g.fillStyle='#b89c73';for(let y=0;y<h;y+=16)for(let x=-32;x<w;x+=64)g.fillRect(x+(y%32?32:0)+1,y+1,62,14);},[.48,.48]);
    const hallWest=clip(WEST.map(p=>toL(...p)),1,6,true).map(p=>W(...p));
    K.hpoly('gb5_hallstone',hallWest,.009,true,holes(hallWest,0));K.hpoly('gb5_hallstone',NORTH,.009,true,holes(NORTH,0));
    // Tall pockets stay under the existing 6m west-wing storey; the north wing stays low.
    const ticketRect=[24,137,65,156.5],trussRect=[8,14,32,34],seatsRect=[8,108,34,130],cafeRect=[56,58,71.4,70];
    const pockets=[ticketRect,trussRect,seatsRect,cafeRect];
    K.hpoly('gb_acoustic',hallWest,3.3,false,[...holes(hallWest,6),...pockets.map(r=>rect(...r))]);
    K.hpoly('gb_acoustic',NORTH,3.3,false,holes(NORTH,6));
    const inPocket=(u,v)=>pockets.some(r=>inRect(r,u,v,.2));
    columns(hallWest,0,3.28,(u,v)=>inPocket(u,v)||(u>68&&u<72));
    columns(NORTH,0,3.28,(u,v)=>v>23&&v<28);
    for(let u=9;u<315;u+=6)for(let v=9;v<156;v+=6){
      const [x,z]=W(u,v);if(!K.pointInPoly(x,z,P)||blocked(u,v,2)||inPocket(u,v))continue;
      lbox(u,v,3.23,.2,1.45,.055,0xd2d1ca,{solid:false});
      for(const du of [-.055,.055])lbox(u+du,v,3.215,.045,1.3,.018,'emit',{solid:false});
      if(u>64||v<31)lcyl(u+2,v,3.21,.075,.03,'emit',{seg:8,solid:false});
    }
    // 02/10/16: stalls form the wall of a 7.9m corridor. Broad cross-passages
    // keep all existing entrances, the escalators and the 2F cafe view open.
    const stallRows=[[23,42],[73,94],[109,127],[132,139]];
    const named=[['DUNKIN’',0x363430],['기운센 식당',0xe7dfce],['로봇김밥',0xe9e6dd],['이마트24',0x343c42]];
    stallRows.forEach(([v0,v1],idx)=>{
      lwall(56,v0,56,v1,0,3.3,{mat:0xe4dfd3,thick:.14});
      for(const v of [v0,v1])lwall(56,v,67,v,0,3.3,{mat:0xdcd7c9,thick:.14});
      const mid=(v0+v1)/2,name=named[idx][0];
      lbox(66.9,mid,2.87,.35,v1-v0,.28,0xd9531e,{solid:false});
      lbox(66.85,mid,2.4,.22,v1-v0-.12,.46,named[idx][1],{solid:false});
      lsign(name,67.03,mid,2.64,Math.min(6,v1-v0-.6),.38,'+u',{bg:null,fg:idx===1||idx===2?'#342421':'#ffffff',padding:.02});
      lbox(64.9,mid,0,.75,v1-v0-1.4,.91,idx===0?0xa19079:0xe0ddd3);
      lbox(65.8,mid,.93,1.9,v1-v0-1.3,.08,idx===0?0x746451:0xc7c7c0,{solid:false});
      if(idx===0){
        for(let v=v0+1;v<v1-1;v+=2.1){
          lbox(66,v,1.02,.72,1.8,.72,doorGlass,{solid:false});
          for(const y of [1.04,1.36,1.7])lbox(66,v,y,.76,1.85,.035,aluminium,{solid:false});
          for(let k=0;k<4;k++)lbox(66.05,v-.65+k*.4,1.39,.37,.29,.12,[0xd69a52,0xc8a375,0xe3c4a4,0x926743][k],{solid:false});
        }
      }else if(idx<3){
        for(let v=v0+.8;v<v1-.4;v+=1.1){
          lbox(67.5,v,.69,.43,.43,.08,0x886848);
          for(const du of [-.17,.17])lbox(67.5+du,v,0,.035,.33,.7,0x3c3a35,{solid:false});
        }
        lsign(idx===1?'기운센 식당':'건강한줄 로봇김밥',64.85,mid,2.04,7,.32,'+u',{bg:'#f2e9d6',fg:'#723b2a'});
      }else{
        for(let v=v0+.7;v<v1-.5;v+=1.3)lbox(64,v,0,.7,1.1,1.8,0xe3e2d8,{side:'gb_shelf'});
      }
      lzone(name==='DUNKIN’'?'던킨':name,'1F','대합실 상점',56,v0,67,v1,0,3.3,4);
    });
    for(const [u0,u1] of [[132,149],[174,188],[196,210],[230,246],[287,313]]){
      lwall(u0,10.4,u1,10.4,0,3.3,{mat:0xe3dfd4,thick:.14});
      for(const u of [u0,u1])lwall(u,10.4,u,22,0,3.3,{mat:0xe3dfd4,thick:.14});
      lbox((u0+u1)/2,21.9,2.87,u1-u0,.25,.28,0xcb572a,{solid:false});
      lbox((u0+u1)/2,21.9,2.43,u1-u0-.12,.15,.44,0x676155,{solid:false});
      for(let u=u0+1;u<u1-.5;u+=2.1){
        lbox(u,21.8,.14,1.95,.025,2.25,doorGlass,{solid:false});
        lbox(u-.99,21.75,.1,.055,.09,2.35,aluminium,{solid:false});
      }
      lbox((u0+u1)/2,19,0,u1-u0-2,.8,.95,0xc2b8a2);
      // Exact unidentified shop lettering is left blank, as in the photographic notes.
    }
    // Preserve researched tenants away from the traced aisle without fabricating stock.
    for(const [u,v,w,d,name] of [[7,58,9,10,'파리바게뜨'],[42,59,12,10,'백미당'],[42,80,12,12,'노브랜드버거'],[42,31,12,10,'북창동 순두부'],[7,123,9,9,'아트박스']]){
      lbox(u,v,0,1,d-2,1,0xc8bca8);lsign(name,u+w/2,v,2.7,d-1,.45,'+u',{bg:'#e4dfd1',fg:'#383e3c'});
      lzone(name,'1F','',u-w/2,v-d/2,u+w/2,v+d/2,0,4,3);
    }
    // The 300mm ribbed line follows the centre of the narrow walking corridor.
    K.hpoly('gb_tactile',rect(70.25,23,70.55,153),.024);
    K.hpoly('gb_tactile',rect(98,25.85,314,26.15),.024);
    for(const b of bays){if(b.west)K.hpoly('gb_tactile',rect(70.4,b.v-.15,75.4,b.v+.15),.026);else K.hpoly('gb_tactile',rect(b.u-.15,26,b.u+.15,30),.026);}
    function bench(u,v,alongU=false){
      const piece=(a,b,y,w,d,h,mat,o={})=>lbox(u+(alongU?a:b),v+(alongU?b:a),y,alongU?w:d,alongU?d:w,h,mat,o);
      for(let s=0;s<4;s++){
        const a=(s-1.5)*.57;
        piece(a,0,.43,.52,.5,.065,0xb6bfbe);piece(a,.22,.49,.52,.06,.43,0xa5afae,{solid:false});
        for(const dy of [.56,.67,.78,.89])piece(a,.185,dy,.46,.012,.012,0x788582,{solid:false});
      }
      for(const a of [-.9,.9])piece(a,0,.04,.09,.55,.4,0x9ca6a4,{solid:false});
      for(const a of [-1.16,0,1.16])piece(a,0,.64,.035,.53,.035,0xbfc5c0,{solid:false});
    }
    for(let v=27;v<139;v+=5.5){if(v>43&&v<73||v>98&&v<108)continue;bench(73.3,v);}
    for(let u=155;u<315;u+=8){if([163,218,259].some(e=>Math.abs(e-u)<4)||blocked(u,28.1,3))continue;bench(u,28.1,true);}
    // Latest photographed brown grid doors sit on the inner face of the preserved outer frames.
    for(const b of bays){
      const west=b.west,face=west?'-u':'-v',dw=b.n===null?3.8:2.4;
      const part=(t,y,w,h,d,mat,off=-.14)=>lbox(b.u+(west?off:t),b.v+(west?t:off),y,west?d:w,west?w:d,h,mat,{solid:false});
      for(const t of [-dw/2,0,dw/2])part(t,.02,.08,2.62,.08,0x53483b);
      for(const y of [.06,.51,1.02,1.72,2.55])part(0,y,dw,.055,.08,0x53483b);
      for(const s of [-1,1])part(s*.14,.94,.025,.46,.1,0xb2a99c,-.24);
      if(b.n===null){
        for(const side of [-1,1])part(side*(dw/2+.28),0,.42,3.28,.16,'gb5_arrivalbrick',-.22);
        part(0,3.12,dw+.9,.16,.16,'gb5_arrivalbrick',-.22);
        part(dw/2+.9,0,.35,.78,.32,0x373a38,-.65);
        part(0,2.65,dw+.8,.48,.16,0x5c5750);
        lsign('하차장 입구',b.u-(west?.25:0),b.v-(west?0:.25),2.87,dw,.32,face,{bg:null,fg:'#f4f0e3'});
        if(west)lquadH(b.u-2,b.v-2,b.u-.2,b.v+2,.018,0xb39a7a);else lquadH(b.u-2,b.v-2,b.u+2,b.v-.2,.018,0xb39a7a);
        continue;
      }
      const t=dw/2+.48,u=b.u+(west?-.38:t),v=b.v+(west?t:-.38);
      lbox(u,v,.06,west?.22:.66,west?.66:.22,2.58,0x222422,{solid:false});
      const su=u-(west?.13:0),sv=v-(west?0:.13);
      lsign(['승차홈',`${b.n}  ${b.dest||'출발 안내'}`],su,sv,2.4,.55,.32,face,{bg:'#3e504f',fg:'#dceeea',padding:.02});
      // These are fixed photographic display samples, not live schedules.
      lsign('09:12',su,sv,2.11,.55,.24,face,{bg:'#102431',fg:'#85dfed',padding:.02});
      for(let k=0;k<6;k++)lsign([['09:15','09:15','09:20','09:20','09:20','09:21'][k],k%2?'승차홈 '+b.n:b.dest||'출발 안내'],su,sv,1.83-k*.265,.55,.25,face,{bg:k%2?'#095b9a':'#126cb5',fg:'#d5eef1',padding:.01});
      lsign('비상구',b.u-(west?.3:0),b.v-(west?0:.3),3.02,.55,.25,face,{bg:'#24ac87',fg:'#fff'});
    }
    // 04/05: suspended brown/gold direction panels with thin rods.
    for(const [u,v,face,text] of [[70.4,45,'-v','↑ 승차홈 1~16'],[70.4,106,'-v','↑ 승차홈 1~16'],[118,26,'+u','↑ 승차홈'],[254,26,'-u','↑ 승차홈'],[48,151,'+v','↑ 승차홈 1~16']]){
      const along=face.includes('u');
      for(const s of [-1,1])lbox(u+(along?0:s*1.1),v+(along?s*1.1:0),2.99,.025,.025,inPocket(u,v)?1.71:.31,0x827968,{solid:false});
      lsign([text,'매표소 · 지하철'],u,v,2.76,3,.43,face,{bg:'#8a755b',fg:'#f5f2e8',twoSided:true,box:.06});
    }
    // 09/12/14: a black ticket wall and curved white alcove with actual kiosk proportions.
    const ticketPoly=rect(...ticketRect);
    K.hpoly('gb5_ticket_tile',ticketPoly,.014);
    for(const u of [26,48,63])lquadH(u,137,u+.6,157,.018,0x92918a);
    K.hpoly(0xf4f2ee,ticketPoly,5.6,false);
    const coveHoles=[29,39,49,59].map(u=>Array.from({length:24},(_,i)=>W(u+4.7*Math.cos(i*PI/12),147+6*Math.sin(i*PI/12))));
    K.hpoly(0xf4f2ee,ticketPoly,4.7,false,coveHoles);
    // Shallow elliptical ceiling coves: faceted curved recess, with luminous inner rim.
    function cove(u,v,rx,rz){
      const rings=[[rx,rz,4.7],[rx*.91,rz*.86,4.77],[rx*.77,rz*.69,5.35]];
      for(let j=0;j<2;j++)for(let k=0;k<24;k++){
        const a=k*PI/12,b=(k+1)*PI/12;
        const pt=(r,t)=>{const[x,z]=W(u+r[0]*Math.cos(t),v+r[1]*Math.sin(t));return[x,r[2],z];};
        K.quad(j?'emit':0xf4f2ee,[pt(rings[j],a),pt(rings[j],b),pt(rings[j+1],b),pt(rings[j+1],a)],[0,-1,0]);
      }
    }
    for(const u of [29,39,49,59])cove(u,147,4.7,6);
    for(const v of [137.3,156.7])lbox(44.5,v,5.32,40,.12,.06,'emit',{solid:false});
    lwall(25,140,64,140,0,5.6,{mat:0xe5e2d9,thick:.18});
    lbox(36,140.2,.1,20,.3,2.75,0x181e22,{solid:false});
    lbox(36,141.1,0,20,1.25,1.02,0x272b2a);
    lbox(36,141.2,1.02,20,1.45,.07,0x444641,{solid:false});
    lsign('TICKETS 매표·환불',35.7,140.42,3.12,8,.5,'+v',{bg:null,fg:'#fafbf7'});
    lsign('출발시간       행선지       승차홈',36,140.42,2.67,19,.2,'+v',{bg:'#101923',fg:'#91bfd4',padding:.02});
    for(let col=0;col<6;col++){
      const u=27.7+col*3.3;
      for(let row=0;row<5;row++)lsign(['09:15  세종   13','09:20  대전   11','09:20  천안   14','09:20  공주   16','09:21  아산   16'][row],u,140.43,2.4-row*.17,3.05,.14,'+v',{bg:row%2?'#14283c':'#102131',fg:'#8dc3dd',padding:.015});
      lbox(u,140.7,1.13,.55,.14,.38,0x333a3b,{solid:false});
      lbox(u,141.4,1.1,2.65,.02,.65,doorGlass,{solid:false});
      lsign(String(col+1),u,140.43,1.47,.25,.18,'+v',{bg:null,fg:'#eee9da'});
    }
    for(const u of [28,32,36,40,44])for(const v of [143.2,145.7]){
      lcyl(u,v,.02,.14,.035,0x343638,{seg:8,solid:false});lcyl(u,v,.05,.022,.89,0x454a49,{seg:6,solid:false});
      if(u<44)lbox(u+2,v,.84,4,.035,.055,0x333b3b,{solid:false});
    }
    function kiosk(u,v,face='+v'){
      const f=FDIR[face],rot=face==='+v'?0:face==='-v'?PI:face==='+u'?PI/2:-PI/2;
      lbox(u,v,0,.64,.55,.09,0x393d3e,{rot});
      lbox(u,v,.09,.56,.48,1.69,0xd9dcd8,{rot});
      lbox(u+f[0]*.252,v+f[1]*.252,.84,.57,.035,.94,0x252b2d,{rot,solid:false});
      lsign('승차권 발매',u+f[0]*.28,v+f[1]*.28,1.58,.45,.18,face,{bg:'#92d4ef',fg:'#174b72',padding:.02});
      lsign(['승차권 구입','예매 승차권'],u+f[0]*.28,v+f[1]*.28,1.31,.45,.32,face,{bg:'#0873c4',fg:'#fff',padding:.02});
      lsign('발권',u+f[0]*.29,v+f[1]*.29,1.13,.35,.1,face,{bg:'#ed8b35',fg:'#fff',padding:.01});
      lbox(u+f[0]*.27,v+f[1]*.27,.79,.43,.035,.095,0x262c2e,{rot,solid:false});
      lbox(u+f[0]*.27,v+f[1]*.27,.39,.3,.035,.055,0x424a4a,{rot,solid:false});
    }
    // Photo14: five machines, with three poster stands separating them.
    lquadH(48.8,140.1,58.7,143.2,.021,0x989a95);
    lsign('TICKETS 무인발권기',53.3,141.73,3.17,7.8,.4,'+v',{bg:null,fg:'#fafbf7'});
    for(const u of [49.8,51.1,53,54.9,56.8]){kiosk(u,140.8);lcyl(u,141.3,2.84,.065,.03,'emit',{seg:8,solid:false});}
    // Eight-segment quarter circles round the white recess's upper corners.
    for(const side of [-1,1]){
      const outer=53.3+side*5.05,center=outer-side*.8;
      lbox(outer,140.9,0,.28,1.6,2.35,0xf2f0e9);
      for(let i=0;i<8;i++){
        const a=i*PI/16,b=(i+1)*PI/16;
        const q=(angle,r)=>{const[x,z]=W(center+side*r*Math.cos(angle),141.7);return[x,2.35+r*Math.sin(angle),z];};
        K.quad(0xf2f0e9,[q(a,.66),q(b,.66),q(b,.94),q(a,.94)],[B[0],0,B[1]]);
      }
    }
    lbox(53.3,140.9,3.01,8.5,1.6,.28,0xf2f0e9,{solid:false});
    for(const [u,col,t] of [[52.05,0x84523d,'매표소 이용안내'],[53.95,0xe2b9c5,'승차권 안내'],[55.85,0xc7834a,'무인발권 안내']]){
      lbox(u,141.2,.02,.6,.24,1.82,col,{solid:false});lsign(t,u,141.35,1.46,.53,.45,'+v',{bg:null,fg:'#fff'});
    }
    // Photo12's separate four-machine row on a greige wall.
    lwall(59,144.4,64.5,144.4,0,3.3,{mat:0xc4c2b6,thick:.15});
    lquadH(59,144.5,64.5,147.3,.021,0x92958f);
    lsign('TICKETS 매표·환불',61.5,144.5,2.9,4.7,.34,'+v',{bg:null,fg:'#f9faf4'});
    for(const u of [60,61,62,63])kiosk(u,145);
    lzone('매표·환불','1F','매표소 · 무인발권기',24,137,65,157,0,6,4);
    // 13: compact exposed-truss kiosk bay. Its placement is inferred; no new roof opening.
    K.hpoly('gb5_ticket_tile',rect(...trussRect),.014);K.hpoly(0xc9cac2,rect(...trussRect),5.6,false);
    const beam=(u0,v0,y0,u1,v1,y1,w=.07)=>{
      const a=W(u0,v0),b=W(u1,v1);const vec=new K.THREE.Vector3(b[0]-a[0],y1-y0,b[1]-a[1]);
      const n=new K.THREE.Vector3(-vec.z,0,vec.x).normalize().multiplyScalar(w/2);
      const p=(x,y,z,s)=>[x+n.x*s,y,z+n.z*s];
      K.quad(0xe7e3d6,[p(a[0],y0,a[1],-1),p(b[0],y1,b[1],-1),p(b[0],y1+w,b[1],1),p(a[0],y0+w,a[1],1)],[0,-1,0]);
    };
    for(const v of [17,23,29,33]){
      beam(8,v,4.3,32,v,4.3,.15);beam(8,v,5.5,32,v,5.5,.12);
      for(let u=8;u<32;u+=4)beam(u,v,4.3,u+4,v,5.5,.12);
    }
    lwall(9,16,31,16,0,3.2,{mat:0xc5b294,thick:.16});
    lsign('TICKETS 무인발권기',20,16.12,2.65,8,.42,'+v',{bg:null,fg:'#fff'});
    for(let u=10.5;u<30;u+=2.15)kiosk(u,16.6);
    for(let u=9.4;u<31;u+=.45)lbox(u,16,3.18,.4,.55,.34, [0x36543a,0x4b6943,0x54714b][Math.round(u*10)%3],{solid:false});
    for(const u of [14,20,26])bench(u,27,true);
    lzone('무인발권기','1F','철골 천장 · 대합실',8,14,32,34,0,6,4);
    // 15: local wood-slat waiting pocket with orange/dark sofas and planted piers.
    K.hpoly('gb5_ticket_tile',rect(...seatsRect),.014);K.hpoly(0x5a5245,rect(...seatsRect),3.15,false);
    for(let u=8.1;u<34;u+=.3)lbox(u,119,3.07,.1,22,.08,0xb39c7b,{solid:false});
    for(const u of [11,17,23,29])lbox(u,119,3.04,.06,18,.03,'emit',{solid:false});
    for(const [u,v,col] of [[13,113,0xe8741e],[26,113,0xe8741e],[13,124,0xe8741e],[26,124,0x404643]]){
      lbox(u,v,.12,6,1,.35,col);lbox(u,v+.4,.47,6,.2,.4,col,{solid:false});
    }
    for(const [u,v] of [[18,113],[30,124]]){
      lbox(u,v,0,.8,.8,3.08,0xe1dccb);
      for(let y=.3;y<3;y+=.35)lbox(u-.43,v,y,.1,.75,.3,y%1>.5?0x4e6843:0x38583c,{solid:false});
    }
    lzone('대합실 좌석','1F','목재 천장 · 주황 벤치',8,108,34,130,0,4,4);
    // 03: 2F HOLLYS frontage seen above the existing floor's small open void.
    K.hpoly('gb_acoustic',rect(...cafeRect),10.55,false);
    lwall(56,58,71.4,58,6,7.1,{mat:doorGlass,thick:.08});
    for(const u of [56,71.4])lwall(u,58,u,70,6,7.1,{mat:doorGlass,thick:.08});
    lwall(56,70,71.4,70,6,7.1,{mat:doorGlass,thick:.08});
    lbox(63.7,58,7.08,15.4,.08,.06,aluminium,{solid:false});
    lbox(63.7,57.8,6.05,15.4,.15,.5,0xa4a49c,{solid:false});
    lsign('FOOD STATION 2F',63.7,58.1,6.3,10,.48,'+v',{bg:null,fg:'#d63e29'});
    lbox(63.7,55.7,7.1,15.2,.1,2.4,0x474c45,{solid:false});
    lsign('HOLLYS COFFEE',63.7,55.9,8.45,9,.55,'+v',{bg:null,fg:'#ffffff'});
    for(const u of [58,61,64,67,70]){lbox(u,56,6.85,.7,.6,.07,0x8b6a4b,{solid:false});lcyl(u,56,7.85,.18,.22,{tex:'emit',color:0xffd699},{seg:8,solid:false});}
    for(let y=.2;y<5.4;y+=.45)lbox(56.2,64,y,.3,2.4,.4,y%1>.5?0x4e6d42:0x35553b,{solid:false});
    lzone('할리스 · 푸드스테이션','2F','카페',56,52,71.4,58,6,11,4);
    for(let v=29;v<137;v+=11){if(v>43&&v<73)continue;lperson(73.1,v,0,{sit:true});lperson(69,v+1.5,0);}
    for(const [u,v] of [[71,81],[68.8,89],[72,97],[138,24.5],[160,25],[221,24.8],[286,25],[33,143],[51,142.5],[13,113],[26,124]])lperson(u,v,0,{sit:u===13||u===26});
    lsign('지하철 · 고투몰 ↓',105,17.5,2.87,4,.5,'+v',{bg:'#8a755b',fg:'#fff'});
    lsign('3층 꽃도매상가 ↑',20,59.5,2.87,4,.5,'-v',{bg:'#28604b',fg:'#fff'});
  }

  function buildBasement(){
    const poly=[[30,0],[284,0],[284,22],[58,22],[58,68],[30,68]].map(q=>W(...q)),y=LEVELS.B1;
    // gb_hall 18: small grey granite squares, burgundy shop frames and yellow guidance.
    K.texture('gb_b1_granite',128,128,(g,w,h)=>{
      g.fillStyle='#b8b6af';g.fillRect(0,0,w,h);const r=K.rand(1818);
      for(let i=0;i<1900;i++){g.fillStyle=i%3?'#d0cec6':'#8c8b84';g.fillRect(r()*w,r()*h,1,1);}
      g.fillStyle='#8e8e87';g.fillRect(0,0,w,1);g.fillRect(0,0,1,h);
    },[.6,.6]);
    K.material('gb_b1_gloss',new K.THREE.MeshPhongMaterial({color:0xffffff,vertexColors:true,shininess:85,specular:0x777777}));
    const gloss={tex:'gb_b1_gloss',color:0xe8e7e1};
    K.slab(poly,y,{mat:'gb_b1_granite',under:false,holes:holes(poly,y)});
    const j=W(125.9,0);
    K.polyWalls(poly,y,-.3,{mat:0xe8e6df,thick:.25,openings:[{x:j[0],z:j[1],w:8.8,y0:y,y1:y+3.6}]});
    // The white entrance lobby in 17/19 is distinct from the older tile-grid corridor.
    const lobby=rect(180,.2,246,8.15),store=rect(180.15,8.15,245.85,21.8);
    K.hpoly(gloss,lobby,y+.009);K.hpoly(gloss,store,y+.009);
    for(let u=180;u<246;u+=.6)lquadH(u,.25,u+.012,21.8,y+.011,0xb6b6ae);
    for(let v=.6;v<22;v+=.6)lquadH(180.15,v,245.85,v+.012,y+.011,0xb6b6ae);
    K.hpoly('gb_acoustic',poly,y+3.05,false,holes(poly,0));
    K.hpoly(0xf1f0ea,lobby,y+3.025,false);
    columns(poly,y,3.03,(u,v)=>u>180&&u<246);
    for(let u=36;u<281;u+=4.8)for(const v of [5,15]){
      if(blocked(u,v,2)||u>180&&u<246&&v===5)continue;
      lbox(u,v,y+2.96,2.2,.26,.055,0xb5b7b0,{solid:false});
      for(const dv of [-.075,.075])lbox(u,v+dv,y+2.945,2.08,.035,.025,'emit',{solid:false});
    }
    for(const u of [184,191,198,205,212,219,226,233,240])for(const v of [2.5,6]){
      lcyl(u,v,y+3.006,.105,.018,'emit',{seg:8,solid:false});
    }
    for(const u of [198,228]){
      lbox(u,4.4,y,.65,.65,3.02,0xc9cecb);
      for(const du of [-.335,.335])lbox(u+du,4.4,y+.12,.015,.63,2.82,doorGlass,{solid:false});
      lbox(u,4.4,y,.69,.69,.11,0x414541,{solid:false});
    }
    K.hpoly('gb_tactile',rect(64,5.85,178,6.15),y+.016);
    K.hpoly('gb_tactile',rect(247,5.85,280,6.15),y+.016);
    K.zone({name:'터미널 지하상가',floor:'B1',sub:'다이소 · 고투몰 · 고속터미널역 연결',poly,y0:y,y1:0,priority:1});
    // J2's exact shared corridor; no shop partition may cross the landing at (120,-100).
    const zG=x=>-152.37-.3733*(x-107.2)-.3,zF=x=>-59.24-.37993*(x-2.3);
    const cp=[[116,zG(116)],[124,zG(124)],[124,zF(124)],[116,zF(116)]];
    K.slab(cp,y,{mat:'gb_b1_granite',under:false});K.hpoly('gb_acoustic',cp,y+3.6,false);
    for(const x of [116,124])K.wall(x,zG(x),x,zF(x),y,y+3.6,{mat:0xe4e0d6,thick:.22});
    for(let z=zG(120)+4;z<zF(120)-2;z+=6)K.box({x:120,z,y:y+3.55,w:1.2,d:.5,h:.025,mat:'emit',solid:false});
    K.sign(['고속터미널역 · 고투몰','3·7·9호선'],{x:120,z:zF(120)-2,y:y+2.9,w:4,h:.65,rotY:PI,bg:'#275773',fg:'#fff'});
    K.sign('경부·영동선 터미널',{x:120,z:zG(120)+2,y:y+2.9,w:4,h:.55,bg:'#275773',fg:'#fff'});
    K.zone({name:'고투몰 ↔ 경부선 연결통로','floor':'B1',sub:'지하철 연결',poly:cp,y0:y,y1:y+3.6,priority:3});
    // 17/19: red perimeter trim, white lightbox with RED text, stainless sliding doors.
    // Three entrances and the retained shop extent are layout guesses, not a measured plan.
    lwall(180,8,180,21.5,y,y+3.04,{mat:0xf0eee8});lwall(246,8,246,21.5,y,y+3.04,{mat:0xf0eee8});
    lbox(213,7.98,y+2.72,66,.16,.17,0xb51e2b,{solid:false});
    for(let u=182;u<246;u+=4){
      if([190,214,238].some(e=>Math.abs(u-e)<2.2))continue;
      lbox(u,8,y+.12,3.86,.035,2.52,doorGlass,{solid:false});
      lbox(u-1.97,7.98,y,.06,.11,2.72,0xbfc1b9,{solid:false});
      lbox(u,7.94,y+.94,3.86,.05,.12,0xf1eee7,{solid:false});
    }
    for(const u of [190,214,238]){
      for(const du of [-2.1,0,2.1])lbox(u+du,7.94,y,.075,.15,2.72,0xb9bcb6,{solid:false});
      lbox(u,7.92,y+2.26,4.22,.18,.1,0xb9bcb6,{solid:false});
      lbox(u,7.8,y+2.36,3.15,.14,.47,0xf3f2ed,{solid:false});
      lsign('다이소',u+.22,7.70,y+2.60,2.45,.4,'-v',{bg:'#f6f6f2',fg:'#c8102e',padding:.01});
      lsign('daiso',u-1.23,7.69,y+2.59,.42,.37,'-v',{bg:'#c8102e',fg:'#fff',padding:.04});
      for(const side of [-1,1]){
        lbox(u+side*1.03,7.96,y+.1,1.98,.025,2.14,doorGlass,{solid:false});
        lsign('매장입구 ↑',u+side*1.03,7.87,y+1.02,1.96,.22,'-v',{bg:'#f3f1e8',fg:'#242a29',padding:.015});
        lfloorText('↑ 매장입구',u+side*1.03,7.25,y+.025,1.8,.3,'-v',{fg:'#303a36',bg:'#efede4',pxPerM:96});
      }
      lbox(u+2.55,7.55,y,.65,.48,.12,0x696a61,{solid:false});
      for(let k=0;k<7;k++)lbox(u+2.55,7.55,y+.12+k*.105,.6,.43,.085,0xb9202b,{solid:false});
    }
    // 20: white metal uprights, honey-coloured shelves, cream and kraft storage stock.
    // Keep generous end/cross aisles; repeated boxes are stock, never solid obstructions.
    const stock=[0xe5e1d5,0xc2a67d,0xf0ece0,0xb79a6b,0xd6c7aa,0xeee9dc];
    let rack=0;
    for(let u=185;u<245;u+=6)for(const v of [12.2,18.2]){
      if(blocked(u,v,2))continue;rack++;
      lbox(u,v,y,1.05,3.8,.13,0xb69763);
      lbox(u,v,y+.13,.06,3.72,1.48,0xe9e8df);
      for(const dv of [-1.84,1.84])lbox(u,v+dv,y+.13,1,.055,1.5,0xe9e8df,{solid:false});
      for(let tier=0;tier<4;tier++){
        const ty=y+.14+tier*.43;
        lbox(u,v,ty,1.02,3.75,.045,0xc8aa77,{solid:false});
        if(tier===3)continue;
        for(let k=0;k<3;k++){
          lbox(u,v-1.2+k*1.2,ty+.045,.85,1.02,.25+(k+tier)%2*.08,stock[(rack+k+tier)%stock.length],{solid:false});
        }
        lbox(u-.44,v,ty+.12,.012,3.4,.06,0xf4f2e9,{solid:false});
      }
    }
    for(const u of [193,221]){
      lbox(u,10,y,2.3,.8,.92,0xe6e2d7);
      lbox(u-.6,9.75,y+.93,.45,.16,.3,0x333a38,{solid:false});
    }
    lzone('다이소 강남고속터미널점','B1','생활용품 · 문구 · 주방용품',180,8,246,21.5,y,0,4);
    lzone('다이소 입구','B1','유리문 · 매장입구 안내',180,.2,246,8,y,y+3.05,3);
    // 18: adjacent shop fronts. Only the legible 한가람 name is retained.
    for(const [u0,u1] of [[68,94],[142,174],[250,262]]){
      for(let u=u0+4;u<u1;u+=8){
        lwall(u-4,9.3,u-4,21.5,y,y+3.04,{mat:0xe5e0d3,thick:.12});
        lwall(u-4,9.3,u+4,9.3,y,y+2.58,{mat:doorGlass,thick:.04,openings:[{at:4,w:2.4,y0:y,y1:y+2.58}]});
        lbox(u,9.22,y+2.58,7.85,.18,.43,0x4b252d,{solid:false});
        for(const du of [-3.9,-1.2,1.2,3.9])lbox(u+du,9.2,y,.07,.09,2.58,0x582931,{solid:false});
        lbox(u+2.2,13,y,1.1,4,1.65,0xd7d4ca,{side:'gb_shelf'});
        lbox(u-1.5,17,y,2,.9,.95,0xbbaa91);
      }
    }
    lsign('한가람',154,9.09,y+2.79,2.4,.32,'-v',{bg:null,fg:'#f6f4e9'});
    lbox(151,8.75,y,.65,.5,.32,0x224f39,{solid:false});
    for(const u of [150,173,252])lsign('고투몰 · 고속터미널역',u,5,y+2.65,4,.4,'-u',{bg:'#275773',fg:'#fff',twoSided:true});
    for(const [u,v] of [[208,4],[226,13.5],[232,18.1],[157,7.7]])lperson(u,v,y);
  }

  function buildUpper(){
    for(let i=1;i<10;i++){
      const p=floorPoly(i),y=ys[i],top=i===9?48:ys[i+1];
      K.zone({name:i===2?'고속터미널 꽃도매상가':'서울고속버스터미널',floor:`${i+1}F`,sub:uses[i],poly:p,y0:y,y1:top,priority:1});
      if(i<9&&i!==2){columns(floorPoly(i+1),y,top-y-.35,(u,v)=>i===1&&u>55&&u<76&&v>57&&v<71);lights(floorPoly(i+1),top-.38);}
      lsign(`${i+1}층${i===2?'  꽃도매상가':''}`,42,59,y+2.4,3.5,.5,'+v',{bg:'#e4e0d6',fg:'#3c4747'});
    }
    K.zone({name:'북측 동',floor:'2F',sub:'상가 · 신반포로 아케이드',poly:NORTH,y0:NORTH_2F,y1:NORTH_ROOF,priority:2});columns(NORTH,NORTH_2F,3.85);lights(NORTH,8.02);
    K.zone({name:'북측 동 옥상 주차장',floor:'옥상',sub:'승용차 주차',poly:NORTH,y0:NORTH_ROOF,y1:12,priority:2});
    // Keep the neighbouring 6 m deck reachable after lowering the north shop floor.
    lramp(173,18,173,30.3,{w:4,ya:NORTH_2F,yb:6,mat:'concrete'});
    // Known use only; no invented CCTV centres, dispatch rooms, canteens or tenant offices upstairs.
    lsign('신세계백화점 본사',43,62,23.2,5,.55,'+v',{bg:'#e4e0d6',fg:'#3b3b38'});
    for(const [u,v] of [[30,88],[46,110]])lbox(u,v,20.5,3,1,0.74,0xcac2b3);
    // gb_flower 01–22: low wholesale hall, not a tall retail floor. The photos
    // establish finishes and aisle widths, but not the relative plan of sections.
    const fy=11,fc=13.8,fp=floorPoly(2),cp=floorPoly(3),fr=K.rand(305);
    const colors=[0xf5eee0,0xeeafbd,0xe12b75,0xf4cd47,0xb88bd0,0xf5a995,0x8eafe2];
    K.material('gb_epoxy',new K.THREE.MeshPhongMaterial({color:0x328668,specular:0x748d7d,shininess:48}));
    K.texture('gb_wicker',64,64,(g,w,h)=>{
      g.fillStyle='#bc985e';g.fillRect(0,0,w,h);
      for(let n=0;n<64;n+=8){g.fillStyle='#d3b47b';g.fillRect(0,n,w,4);g.fillStyle='#9a7848';g.fillRect(n,0,2,h);}
    },[.24,.24]);
    K.hpoly('gb_epoxy',fp,fy+.008,true,holes(fp,fy));
    K.hpoly('gb_acoustic',cp,fc,false,holes(cp,fy));
    columns(cp,fy,2.8);
    // Rows of exposed twin fluorescent tubes in shallow metal trays (02/10/12).
    for(const u of [11.3,17.1,22.9,28.7,35,41.3,47.1,52.9,58.7,64.5])for(let v=20;v<149;v+=5.8){
      if(blocked(u,v,1.6))continue;
      lbox(u,v,fc-.09,.34,1.4,.075,0xadb5b3,{solid:false});
      for(const du of [-.085,.085])lbox(u+du,v,fc-.11,.045,1.28,.035,'emit',{solid:false});
    }
    for(const v of [35,72,106,140]){
      lbox(35,v,fc-.16,.9,.8,.12,0xd8d8cd,{solid:false});
      for(let j=-3;j<=3;j++)lbox(35+j*.09,v,fc-.17,.028,.65,.018,0xa3a99f,{solid:false});
      lsign('← 비상구',35,v+1.2,fy+2.42,.72,.26,'-v',{bg:'#28795e',fg:'#f3f8ef',twoSided:true});
    }
    // Photo13/14 landing and photo01's black fascia over steel-framed glass.
    K.hpoly('tile',rect(16.6,88.05,23.4,92),fy+.015);
    K.hpoly('gb_tactile',rect(19.85,88.1,20.15,91.8),fy+.02);
    for(const u of [17.5,19.25,20.75,22.5])lbox(u,92,fy,.055,.09,2.35,0x4a4a45,{solid:false});
    for(const u of [18.37,21.63]){
      lbox(u,92,fy+.06,1.68,.035,2.26,doorGlass,{solid:false});
      lbox(u,91.97,fy+.95,1.68,.045,.09,0xe7e6d9,{solid:false});
    }
    // Door leaves are parked open against sidelights; the central opening is clear.
    for(const u of [19.22,20.78])lbox(u,92.5,fy+.05,.035,1,2.25,doorGlass,{solid:false});
    lbox(20,92,fy+2.35,5.08,.17,.43,0x11151a,{solid:false});
    lsign('3  |  꽃 도매상가(생화·조화)',20,91.89,fy+2.58,4.82,.27,'-v',{bg:'#10151c',fg:'#fff',pxPerM:170,padding:.01});
    // A label visible in the actual entrance photograph is retained at small scale.
    lsign('Flower Wholesaler',20.3,91.88,fy+2.41,2.5,.12,'-v',{bg:null,fg:'#fff',pxPerM:160,padding:.01});
    // Four-metre open stalls, 1.8m side aisles and the 2.8m spine u=33.6–36.4.
    // Wider four-metre cross passages separate the traced stock sections.
    const bands=[14.2,20,25.8,31.6,38.4,44.2,50,55.8,61.6];
    function bunch(u,v,y,col,blue=false){
      lbox(u,v,y,.34,.36,.48,blue?0x295a9b:0x303b35,{solid:false});
      lbox(u,v,y+.47,.31,.32,.39,0x56794b,{solid:false});
      lbox(u,v,y+.8,.49,.5,.22,col,{solid:false,top:'gb_flowerbin'});
      // Pale sleeves are thin strips, allowing coloured heads and stems to read.
      lbox(u-.22,v,y+.54,.025,.42,.36,0xd4d9c4,{solid:false});
    }
    function fresh(u,v,n){
      lbox(u,v,fy,2.6,3.9,.56,n%3?0x927b60:0x3e70a0);
      lbox(u,v,fy+.56,1.5,3.9,.4,0x8d8f7d,{solid:false});
      lbox(u,v,fy+.96,1.48,3.86,.45,'gb_flowerbin',{solid:false});
      for(const s of [-1,1])for(let k=0;k<3;k++)bunch(u+s*1.66,v-1.25+k*1.25,fy,colors[(n+k)%colors.length],(n+k)%4===0);
      // Upper stacked blue buckets and kraft cartons (photo02).
      lbox(u-.35,v+1.45,fy+1.4,.48,.48,.65,n%2?0x3471b5:0x343b37,{solid:false});
      lbox(u+.35,v+1.45,fy+1.4,.52,.48,.42,0xb0a17f,{solid:false});
    }
    function artificial(u,v,n){
      lbox(u,v,fy,3.9,3.9,.55,0x9a8669);
      lbox(u,v,fy+.55,2.4,3.85,1.8,'gb_flowerbin',{solid:false});
      for(const s of [-1,1]){
        lbox(u+s*1.6,v,fy+.55,.55,3.8,.58,'gb_flowerbin',{solid:false});
        for(let k=0;k<3;k++)lbox(u+s*1.4,v-1.25+k*1.25,fy+1.25,.63,.72,.75,colors[(n+k)%colors.length],{solid:false,side:'gb_flowerbin'});
      }
    }
    function christmas(u,v,n){
      lbox(u,v,fy,3.9,3.9,.17,0xb8986e);
      // One red velvet back and white curtain posts, as in photos04–06.
      lbox(u,v+.9,fy+.18,3.8,.08,2.32,0x921d2e,{solid:false});
      for(const du of [-1.8,1.8]){
        lbox(u+du,v,fy,.1,3.8,2.65,0xb29e83,{solid:false});
        lbox(u+du*.93,v-1.6,fy+.12,.25,.12,2.4,0xedece0,{solid:false});
      }
      lbox(u+.55,v-.5,fy+.17,1.7,1.4,.66,0xeeeade);
      for(let k=0;k<3;k++)lbox(u+.05+k*.5,v-.65,fy+.83,.36,.43,.22,k%2?0xd2b35a:0xb72033,{solid:false});
      // Stepped, compact tree stock with sparse gold/red ornament cubes.
      for(const du of [-1.1,.8]){
        lbox(u+du,v+.3,fy+.17,.12,.12,1.9,0x665645,{solid:false});
        for(let k=0;k<4;k++){
          const w=.95-k*.18;lbox(u+du,v+.3,fy+.45+k*.43,w,w,.46,k%2?0x345d3c:0x486d43,{solid:false});
          lbox(u+du+w*.38,v+.3-w*.48,fy+.6+k*.43,.085,.085,.085,k%2?0xd4b85c:0xb72337,{solid:false});
        }
      }
      for(const du of [-1.35,0,1.35]){
        lbox(u+du,v-1.75,fy+2.28,.65,.3,.29,0x365b37,{solid:false});
        lbox(u+du,v-1.96,fy+2.2,.42,.045,.15,0xb01e2d,{solid:false});
        lbox(u+du,v-1.96,fy+1.96,.1,.045,.36,0xb01e2d,{solid:false});
      }
    }
    function supplies(u,v,n){
      lbox(u,v,fy,3.9,3.9,.18,0x8f8067);
      for(const du of [-1.75,1.75])lbox(u+du,v,fy,.07,3.85,2.35,0xb8c1be,{solid:false});
      for(let row=0;row<3;row++){
        const y=fy+.2+row*.7;
        lbox(u,v,y,3.8,3.8,.06,n%2?0xb6a180:0xd7ddd6,{solid:false});
        for(let k=0;k<5;k++)for(const s of [-1,1]){
          const bv=v-1.42+k*.7;
          if(n%2){
            lbox(u+s*1.35,bv,y+.06,.48,.5,.35,'gb_wicker',{solid:false});
            // Basket handles remain open, formed by three thin pieces.
            for(const dv of [-.2,.2])lbox(u+s*1.35,bv+dv,y+.41,.045,.045,.2,0xa9854e,{solid:false});
            lbox(u+s*1.35,bv,y+.6,.045,.45,.035,0xa9854e,{solid:false});
          }else{
            const vaseMat=k%4===0?doorGlass:k%3===0?0x292e2e:0xf0f0e5;
            lcyl(u+s*1.35,bv,y+.06,.18,.39,vaseMat,{seg:6,solid:false});
            lcyl(u+s*1.35,bv,y+.45,.12,.12,vaseMat,{seg:6,solid:false});
          }
        }
      }
    }
    let si=0;
    for(const u of bands)for(const v of [26,31.8,37.6,43.4,72,77.8,83.6,100,105.8,111.6,117.4,123.2,137,142.8]){
      if(blocked(u,v,2.9))continue;
      si++;
      if(v<90)fresh(u,v,si);
      else if(v>132)supplies(u,v,si);
      else if(u<33.6)artificial(u,v,si);
      else christmas(u,v,si);
    }
    // Photo07's plant stock stays at the edge of the cross aisle.
    for(let k=0;k<9;k++){
      const u=40+k*2.7,v=130;
      lcyl(u,v,fy,.23,.42,k%2?0xe8e4d8:0x795c43,{seg:6,solid:false});
      lbox(u,v,fy+.42,.09,.09,.8,0x5e6842,{solid:false});
      for(let j=0;j<3;j++)lbox(u+(j-1)*.13,v,fy+.62+j*.3,.48,.48,.27,j%2?0x72914c:0x3f754c,{solid:false});
    }
    // Only legible photographed stall names/numbers, without invented tenants.
    for(const [u,v,lines] of [
      [31.6,101,['제301호','마티아','T.533-2647']],
      [38.4,106.8,['제300호','플라워마트','T.594-5331']],
      [44.2,118.4,['제242호','엠데코디자인','T.02-595-9409']],
      [31.6,124.2,['제305호','진흥조화','T.537-6596·537-6588']],
      [25.8,112.6,['예림조화']]
    ]){
      for(const du of [-.25,.25])lbox(u+du,v,fy+2.53,.012,.012,.27,0x848c7e,{solid:false});
      lsign(lines,u,v,fy+2.35,.72,.36,'-v',{bg:'#205f49',fg:'#f2f2e6',twoSided:true,pxPerM:220,padding:.01});
    }
    // Small hanging wire grid and ornaments are confined to Christmas stock,
    // preserving clearance above every circulation aisle (03/04/20/22).
    for(const u of [38.4,44.2,50,55.8,61.6])for(const v of [101,112.6,124.2]){
      for(let k=-2;k<=2;k++)lbox(u+k*.6,v,fy+2.56,.018,3.6,.018,0x8c8c76,{solid:false});
      for(let k=-2;k<=2;k++)lbox(u,v+k*.6,fy+2.56,3.6,.018,.018,0x8c8c76,{solid:false});
      for(let k=0;k<6;k++)lbox(u-1.4+fr()*2.8,v-1.4+fr()*2.8,fy+2.23+fr()*.14,.1,.1,.1,k%2?0xc7353e:0xd9bd6b,{solid:false});
    }
    lzone('생화','3F','계단식 꽃 양동이 · 생화 도매',8,20,67,87,11,16,3);
    lzone('조화 · 크리스마스','3F','조화 · 트리 · 장식',8,96,67,129,11,16,3);
    lzone('화기 · 바구니','3F','화병 · 화분 · 바구니 부자재',8,134,67,148,11,16,3);
    lzone('꽃도매상가 입구','3F','생화 · 조화',16.6,88,23.4,95,11,16,4);
    for(const [u,v] of [[35,39],[35,78],[35,109],[35,123],[41.3,114],[52.9,139],[22.9,101]])lperson(u,v,11);
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
        const island=rect(b.u-2.5,30.2,b.u+2.5,34.8);K.prism(island,0,.14,{mat:0x8a4a3e});
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
