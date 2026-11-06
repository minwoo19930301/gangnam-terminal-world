// 서울고속버스터미널: OSM ground-contact outlines; aerial lots and photographed concrete tiers.
// Reference/inference ledger: data/research/gyeongbu.json. No runtime animation/allocation.
export const meta = {
  id: 'gyeongbu', name: '서울고속버스터미널 (경부·영동선)',
  claims: [309352819, 356129682, 356129683, 1173093435],
  claimRoads: [356129685, 356129687, 356129690, 356130053, 356130054, 715692653, 660731157, 1259394249, 1259394250, 1259394251, 1259394252, 356129974, 655403255, 1115924614, 715692651, 1132460905],
  claimAreas: [1173093431, 1173093432, 1173093433, 1173093434, 1173096051, 356129681, 14188630, 886400350],
  sources: ['refs/aerial/gyeongbu_lots.jpg', 'refs/roadview/manifest.json',
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
    const p=floorPoly(i);K.slab(p,ys[i],{mat:i===2?'concrete':'tile',under:'gb_acoustic',holes:holes(p,ys[i])});
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
  // Photo 05: one broad cyan board for two neighbouring doors, with a black LED
  // departure board between groups. No invented departure times are displayed.
  for(const west of [true,false]){
    const row=bays.filter(b=>b.west===west&&b.n!==null).sort((a,b)=>west?a.v-b.v:a.u-b.u);
    const groups=[];
    for(let i=0;i<row.length;i+=2){
      const pair=row.slice(i,i+2),u=pair.reduce((s,b)=>s+b.u,0)/pair.length-(west?.66:0),v=pair.reduce((s,b)=>s+b.v,0)/pair.length-(west?0:.66),face=west?'-u':'-v';
      groups.push({u,v,pair});
      lbox(u,v,2.58,west?.18:6,west?6:.18,.6,0x354851,{solid:false});
      lsign('',u-(west?.1:0),v-(west?0:.1),2.88,6,.58,face,{bg:'#3bb7e6',fg:'#fff'});
      pair.forEach((b,j)=>{
        const t=pair.length===1?0:j===0?-1.5:1.5,bu=u+(west?-.12:t),bv=v+(west?t:-.12);
        lsign(String(b.n),bu+(west?0:1.14),bv+(west?-1.14:0),2.89,.38,.38,face,{bg:'#f3df26',fg:'#174563',padding:.03,offset:.025});
        lsign(b.dest||'승차홈',bu+(west?0:-.22),bv+(west?.22:0),2.89,2.08,.42,face,{bg:null,fg:'#fff',padding:.01,offset:.025});
      });
    }
    for(let i=1;i<groups.length;i++){
      const a=groups[i-1],b=groups[i],gap=west?b.v-a.v:b.u-a.u;
      if(gap<10||gap>18)continue;
      const u=(a.u+b.u)/2,v=(a.v+b.v)/2,face=west?'-u':'-v';
      lbox(u,v,2.38,west?.2:4.08,west?4.08:.2,.82,0x27312f,{solid:false});
      lsign('출발 안내  승차홈',u-(west?.12:0),v-(west?0:.12),2.98,3.85,.22,face,{bg:'#101612',fg:'#efb34e',padding:.02,offset:.025});
      lsign(a.pair.map(p=>`${p.n} ${p.dest||'승차홈'}`).join('  '),u-(west?.12:0),v-(west?0:.12),2.65,3.85,.31,face,{bg:'#101612',fg:'#ef7d49',padding:.02,offset:.025});
    }
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
  lspawn('1층 대합실',64,88,0,1,0);
  lspawn('승차홈과 버스 마당',86,98,0,-1,0);
  lspawn('3층 꽃도매상가',35,100,11,1,0);
  lspawn('지하 1층 다이소 앞',168,4,-6,1,0);
  lspawn('경부선 주차장',174,110,6,0,-1);
  lspawn('10층 성당 · 옥상정원',38,85,43,0,1);
  lspawn('북측 동 옥상 주차장',138,18,NORTH_ROOF,1,0);

  function buildHall(){
    K.zone({name:'서울고속버스터미널',floor:'1F',sub:'매표소 · 대합실 · 경부·영동선 승차홈',poly:P,y0:0,y1:6,priority:1});
    // Photo 05's low acoustic ceiling; keep the stair and escalator openings unobstructed.
    const hallWest=clip(WEST.map(p=>toL(...p)),1,6,true).map(p=>W(...p));
    for(const poly of [hallWest,NORTH]){K.hpoly('gb_acoustic',poly,3.2,false,holes(poly,6));lights(poly,3.14,6);columns(poly,0,3.18,(u,v)=>u>35&&u<49&&v>146&&v<156);}
    // Shop backs enclose a 20 m-deep boarding corridor. Exact shop boundaries are inferred;
    // wide cross-passages preserve the entrance, ticket hall and vertical circulation routes.
    for(const [v0,v1] of [[22,43],[71,92],[103,126],[132,141]]){
      lwall(55.5,v0,55.5,v1,0,3.2,{mat:0xe5e1d7,thick:.16,openings:[{at:(v1-v0)/2,w:3.4,y0:0,y1:2.6}]});
      lwall(47.5,v0,55.5,v0,0,3.2,{mat:0xe5e1d7,thick:.16});
      lwall(47.5,v1,55.5,v1,0,3.2,{mat:0xe5e1d7,thick:.16});
      for(let v=v0+1.4;v<v1-1;v+=2.2){
        if(Math.abs(v-(v0+v1)/2)<2.6)continue;
        lbox(55.6,v,.5,.025,1.7,1.8,doorGlass,{solid:false});
        lbox(55.64,v-1,.25,.07,.06,2.35,aluminium,{solid:false});
      }
    }
    for(const [u0,u1] of [[152,185],[193,231],[239,259],[286,314]]){
      lwall(u0,10.2,u1,10.2,0,3.2,{mat:0xe5e1d7,thick:.16,openings:[{at:u0===152?163-u0:(u1-u0)/2,w:u0===152?6:u0===286?16:3.4,y0:0,y1:u0===152||u0===286?3.2:2.6}]});
      lwall(u0,1,u0,10.2,0,3.2,{mat:0xe5e1d7,thick:.16});
      lwall(u1,1,u1,10.2,0,3.2,{mat:0xe5e1d7,thick:.16});
    }
    // Photo 05: straight 300 mm tactile tiles, with square right-angle junctions.
    K.hpoly('gb_tactile',rect(69.85,24,70.15,153),.016);
    K.hpoly('gb_tactile',rect(98,24.85,314,25.15),.016);
    for(const b of bays){if(b.west)K.hpoly('gb_tactile',rect(70,b.v-.15,75.4,b.v+.15),.018);else K.hpoly('gb_tactile',rect(b.u-.15,25,b.u+.15,30),.018);}
    function bench(u,v,alongU=false){
      lbox(u,v,.38,alongU?3.6:.52,alongU?.52:3.6,.12,0x927452);
      lbox(u-(alongU?0:.28),v-(alongU?.28:0),.5,alongU?3.6:.08,alongU?.08:3.6,.45,0x7c6249,{solid:false});
      for(const s of [-1,1])lbox(u+(alongU?s*1.3:0),v+(alongU?0:s*1.3),0,.16,.2,.4,0x4c4c47,{solid:false});
    }
    for(let v=30;v<144;v+=6){if(v>56&&v<68)continue;bench(60,v);bench(64,v);}
    for(let u=160;u<315;u+=9){if(blocked(u,18,3))continue;bench(u,18,true);}
    lsign('7:44',68.55,87,2.8,.75,.3,'-u',{bg:'#222721',fg:'#ef5b4d'});
    lsign('7:44',213,23.55,2.8,.75,.3,'-v',{bg:'#222721',fg:'#ef5b4d'});
    // Ticket-counter existence is researched; plain glazing/numbering and exact furniture are inferred.
    for(const [u,v,name] of [[42,146,'제1매표소'],[85,13,'제2매표소'],[300,5,'제3매표소']]){
      lbox(u,v,0,13,2,1.05,0xc8c4bb);lbox(u,v+.87,2.61,13,.22,.55,0xf1eee5,{solid:false});
      lsign('매표소 · 승차권 발매 · 환불',u,v+1.02,2.89,12.5,.46,'+v',{bg:'#f4f1e8',fg:'#205a76',padding:.02});
      for(let i=-2;i<=2;i++){
        lbox(u+i*2.3,v+.88,1.23,2.2,.025,1.33,doorGlass,{solid:false});
        lbox(u+i*2.3-1.13,v+.88,1.05,.055,.09,1.56,aluminium,{solid:false});
        lbox(u+i*2.3,v+.88,2.56,2.3,.09,.055,aluminium,{solid:false});
        lsign(String(i+3),u+i*2.3,v+.96,2.38,.4,.3,'+v',{bg:'#397b95',fg:'#fff'});
        lbox(u+i*2.3,v-.3,1.05,.5,.12,.4,DARK,{solid:false});
      }
      lsign(name,u,v+1.03,.64,3,.35,'+v',{bg:null,fg:'#31596c'});
      lzone(name,'1F','승차권 발매 · 환불',u-7,v-1.2,u+7,v+4,0,4,3);
      for(let i=0;i<4;i++){
        lbox(u+8.1+i*1.15,v,0,.68,.55,1.55,0xd5d6d0);
        lsign('승차권 발권',u+8.1+i*1.15,v+.3,1.2,.48,.4,'+v',{bg:'#216a94',fg:'#fff'});
      }
      lsign('무인발권기',u+9.8,v+.3,2.2,4.2,.4,'+v',{bg:'#e8e4da',fg:'#205a76',twoSided:true});
    }
    // Real tenants from stored OSM POIs/research; neutral partitions and counters.
    for(const [u,v,w,d,name] of [[7,58,9,10,'파리바게뜨'],[42,59,12,10,'백미당'],[42,80,12,12,'노브랜드버거'],[42,31,12,10,'북창동 순두부'],[7,123,9,9,'아트박스'],[137,5,12,8,'버거킹'],[202,5,9,8,'이마트24']]){
      const east=u<75,face=east?'+u':'+v';
      lwall(u-w/2,v-d/2,u-w/2,v+d/2,0,3.2,{mat:0xe3e0d7,thick:.12});
      lwall(u-w/2,v-d/2,u+w/2,v-d/2,0,3.2,{mat:0xe3e0d7,thick:.12});
      lbox(u,v,0,east?1:w-2,east?d-2:1,1.05,0xc8bca8);
      lsign(name,u+(east?w/2:0),v+(east?0:d/2),2.84,east?d-1:w-1,.55,face,{bg:'#ece7dc',fg:'#383e3c'});
      lzone(name,'1F','',u-w/2,v-d/2,u+w/2,v+d/2,0,4,3);
    }
    // Photo 05: tall white backlit advertisements flank each door. Only the
    // blue/white graphic blocks are retained; no advertiser or copy is invented.
    for(const b of bays)for(const side of [-1,1]){
      const west=b.west,dw=b.n===null?3.8:2.4,t=side*(dw/2+.6),u=b.u+(west?-.72:t),v=b.v+(west?t:-.72),face=west?'-u':'-v';
      lbox(u,v,.28,west?.24:1.02,west?1.02:.24,2.02,0x46555d,{solid:false});
      lsign('',u-(west?.14:0),v-(west?0:.14),1.29,.9,1.9,face,{bg:'#f5f5ed',fg:'#fff'});
      lsign('',u-(west?.16:0),v-(west?0:.16),.43,.82,.15,face,{bg:'#2a4e79',fg:'#fff'});
      lsign('',u-(west?.16:0),v-(west?0:.16),1.32,.46,.26,face,{bg:'#a2bbd0',fg:'#fff'});
    }
    for(let v=32;v<141;v+=13)lperson(60,v,0,{sit:true});
    for(const [u,v] of [[66,40],[68,94],[63,132],[102,20],[160,22],[222,20],[285,22],[40,130]])lperson(u,v,0);
    lsign('지하철 · 고투몰 ↓',105,17.5,2.87,4,.5,'+v',{bg:'#28627a',fg:'#fff'});
    lsign('3층 꽃도매상가 ↑',20,59.5,2.87,4,.5,'-v',{bg:'#28604b',fg:'#fff'});
  }

  function buildBasement(){
    const poly=[[30,0],[284,0],[284,22],[58,22],[58,68],[30,68]].map(q=>W(...q)),y=LEVELS.B1;
    K.slab(poly,y,{mat:'tile',under:false,holes:holes(poly,y)});
    const j=W(125.9,0);
    K.polyWalls(poly,y,-.3,{mat:0xd8d4cb,thick:.25,openings:[{x:j[0],z:j[1],w:8.8,y0:y,y1:y+3.6}]});
    K.hpoly('gb_acoustic',poly,y+3.5,false,holes(poly,0));
    lights(poly,y+3.44,6);columns(poly,y,3.48);
    K.zone({name:'터미널 지하상가',floor:'B1',sub:'다이소 · 고투몰 · 고속터미널역 연결',poly,y0:y,y1:0,priority:1});
    // J2's exact shared corridor; no shop partition may cross the landing at (120,-100).
    const zG=x=>-152.37-.3733*(x-107.2)-.3,zF=x=>-59.24-.37993*(x-2.3);
    const cp=[[116,zG(116)],[124,zG(124)],[124,zF(124)],[116,zF(116)]];
    K.slab(cp,y,{mat:'tile',under:false});K.hpoly('gb_acoustic',cp,y+3.6,false);
    for(const x of [116,124])K.wall(x,zG(x),x,zF(x),y,y+3.6,{mat:0xe4e0d6,thick:.22});
    for(let z=zG(120)+4;z<zF(120)-2;z+=6)K.box({x:120,z,y:y+3.55,w:1.2,d:.5,h:.025,mat:'emit',solid:false});
    K.sign(['고속터미널역 · 고투몰','3·7·9호선'],{x:120,z:zF(120)-2,y:y+2.9,w:4,h:.65,rotY:PI,bg:'#275773',fg:'#fff'});
    K.sign('경부·영동선 터미널',{x:120,z:zG(120)+2,y:y+2.9,w:4,h:.55,bg:'#275773',fg:'#fff'});
    K.zone({name:'고투몰 ↔ 경부선 연결통로',floor:'B1',sub:'지하철 연결',poly:cp,y0:y,y1:y+3.6,priority:3});
    // Research + OSM: B1 Daiso and the GOTO MALL connection. The shop boundary
    // and surrounding unnamed shopfronts are schematic, not a surveyed tenant plan.
    lwall(180,8,180,21.5,y,y+3.4,{mat:0xe4e0d6});lwall(246,8,246,21.5,y,y+3.4,{mat:0xe4e0d6});
    lbox(213,7.98,y+2.65,66,.2,.65,0xc52129,{solid:false});
    for(const u of [190,213,236])lsign('다이소',u,7.83,y+2.98,8,.52,'-v',{bg:null,fg:'#fff'});
    for(let u=182;u<245;u+=4){
      if([190,214,238].some(e=>Math.abs(u-e)<2.1))continue;
      lbox(u,8,y+.12,3.8,.045,2.5,doorGlass,{solid:false});
      lbox(u-1.95,8,y,.08,.15,2.65,aluminium,{solid:false});
    }
    lsign('다이소',179.86,11,y+2.3,5,.65,'-u',{bg:'#c52129',fg:'#fff'});
    lsign('생활용품 · 문구 · 주방용품',213,9,y+2.2,11,.4,'-v',{bg:'#f3f0e7',fg:'#4e5350'});
    for(let u=183;u<245;u+=4)for(const v of [12,18]){
      if(blocked(u,v,2))continue;lbox(u,v,y,.9,4,1.7,0xe8e5dc,{side:'gb_shelf'});
    }
    for(let u=191;u<207;u+=4)lbox(u,8.6,y,2.2,.7,1,0xe8e5dc);
    lzone('다이소 강남고속터미널점','B1','생활용품 · 문구 · 주방용품',180,8,246,21.5,y,0,4);
    for(const [u0,u1] of [[68,94],[142,174],[250,262]]){
      for(let u=u0+4;u<u1;u+=8){
        lwall(u-4,10.5,u-4,21.5,y,y+3.4,{mat:0xd9d6cf,thick:.12});
        lwall(u-4,10.5,u+4,10.5,y,y+2.6,{mat:doorGlass,thick:.04,openings:[{at:4,w:2.4,y0:y,y1:y+2.6}]});
        lbox(u,10.4,y+2.6,7.85,.18,.55,0xd7c6ad,{solid:false});
        lbox(u+2.2,15,y,1.1,5,1.65,0xd7d4ca,{side:'gb_shelf'});
        lbox(u-1.5,17,y,2,.9,.95,0xbbaa91);
      }
    }
    for(const u of [150,173,252])lsign('고투몰 · 고속터미널역',u,5,y+2.7,5,.5,'-u',{bg:'#275773',fg:'#fff',twoSided:true});
  }

  function buildUpper(){
    for(let i=1;i<10;i++){
      const p=floorPoly(i),y=ys[i],top=i===9?48:ys[i+1];
      K.zone({name:i===2?'고속터미널 꽃도매상가':'서울고속버스터미널',floor:`${i+1}F`,sub:uses[i],poly:p,y0:y,y1:top,priority:1});
      if(i<9){columns(floorPoly(i+1),y,top-y-.35);lights(floorPoly(i+1),top-.38);}
      lsign(`${i+1}층${i===2?'  꽃도매상가':''}`,42,59,y+2.4,3.5,.5,'+v',{bg:'#e4e0d6',fg:'#3c4747'});
    }
    K.zone({name:'북측 동',floor:'2F',sub:'상가 · 신반포로 아케이드',poly:NORTH,y0:NORTH_2F,y1:NORTH_ROOF,priority:2});columns(NORTH,NORTH_2F,3.85);lights(NORTH,8.02);
    K.zone({name:'북측 동 옥상 주차장',floor:'옥상',sub:'승용차 주차',poly:NORTH,y0:NORTH_ROOF,y1:12,priority:2});
    // Keep the neighbouring 6 m deck reachable after lowering the north shop floor.
    lramp(173,18,173,30.3,{w:4,ya:NORTH_2F,yb:6,mat:'concrete'});
    // Known use only; no invented CCTV centres, dispatch rooms, canteens or tenant offices upstairs.
    lsign('신세계백화점 본사',43,62,23.2,5,.55,'+v',{bg:'#e4e0d6',fg:'#3b3b38'});
    for(const [u,v] of [[30,88],[46,110]])lbox(u,v,20.5,3,1,0.74,0xcac2b3);
    // Round4 reviewer + researched wholesale stock: 3.4 m stalls on a 5.2 m
    // rhythm leave 1.8 m aisles. Exact stall numbers/plan are schematic; no
    // invented shop names or prices. Keep the circulation cores and spawn clear.
    const fy=11,colors=[0xe35568,0xecc2cb,0xf2eadb,0xd9bd42,0x9a628c];
    let stallNo=0;
    for(let u=11.4;u<65;u+=5.2)for(let v=24;v<146;v+=5.2){
      if(blocked(u,v,3.3)||v>63&&v<69)continue;
      if(!rect(u-1.75,v-1.75,u+1.75,v+1.75).every(([x,z])=>K.pointInPoly(x,z,floorPoly(3))))continue;
      stallNo++;
      // A low work table, a raised back row of wrapped bunches, and stock down
      // both sides give the market the piled, compartmented scale in the brief.
      lbox(u-.6,v,fy,2.1,3.4,.64,0x827563);
      lbox(u-.6,v,fy+.64,2.08,3.35,.44,v<128?'gb_flowerbin':'gb_shelf',{solid:false});
      lbox(u-.55,v+1.25,fy+1.08,2.15,.8,.55,v<128?'gb_flowerbin':'gb_shelf',{solid:false});
      for(let k=0;k<3;k++){
        const bv=v-1.1+k*1.05,bh=.74+(k+stallNo)%3*.18;
        lcyl(u+1.12,bv,fy,.24,.5,0x454843,{seg:6,solid:false});
        lbox(u+1.12,bv,fy+.48,.22,.24,bh,0x456c3b,{solid:false});
        lbox(u+1.12,bv,fy+.45+bh,.48,.48,.3,colors[(k+stallNo)%colors.length],{solid:false,side:'gb_flowerbin'});
      }
      lbox(u-1.23,v-1.24,fy+.64,.65,.65,.62,0xb5a58a,{solid:false});
      lbox(u-1.23,v-1.24,fy+1.26,.62,.6,.18,0xd2c5a8,{solid:false});
      // Small number boards and hanging cards, not large retail fascia signs.
      for(const du of [-.32,.32]){
        const a=W(u+du-.009,v+.85),b=W(u+du+.009,v+.85);
        K.quad(0x8b8a80,[[a[0],fy+2.3,a[1]],[b[0],fy+2.3,b[1]],[b[0],15.62,b[1]],[a[0],15.62,a[1]]],[-B[0],0,-B[1]]);
      }
      lsign(String(stallNo).padStart(3,'0'),u,v+.82,fy+2.14,.8,.35,'-v',{bg:'#e6dfcc',fg:'#354c39',twoSided:true});
      if(stallNo%3===0)lsign('가격 문의',u+.85,v-.1,fy+1.85,.58,.32,'-v',{bg:'#f2e8cc',fg:'#534c3b',twoSided:true});
    }
    lzone('생화','3F','생화 도매 · 꽃다발',8,22,67,112,11,16,3);
    lzone('조화 · 부자재','3F','조화 · 화기 · 포장지',8,112,67,148,11,16,3);
    for(const [v,t] of [[35,'생화'],[118,'조화'],[140,'부자재 · 포장지']])lsign(t,35,v,14.5,4,.6,'+v',{bg:'#e8e3d5',fg:'#3a5943',twoSided:true});
    for(const [u,v] of [[23,98],[37,98],[51,98],[16,109],[30,131]])lperson(u,v,11);
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
