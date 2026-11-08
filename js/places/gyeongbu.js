// 서울고속버스터미널: OSM ground-contact outlines; aerial lots and photographed concrete tiers.
// Reference/inference ledger: data/research/gyeongbu.json. No runtime animation/allocation.
export const meta = {
  id: 'gyeongbu', name: '서울고속버스터미널 (경부·영동선)',
  claims: [309352819, 356129682, 356129683, 1173093435],
  claimRoads: [356129685, 356129687, 356129690, 356130053, 356130054, 715692653, 660731157, 1259394249, 1259394250, 1259394251, 1259394252, 356129974, 655403255, 1115924614, 715692651, 1132460905],
  claimAreas: [1173093431, 1173093432, 1173093433, 1173093434, 1173096051, 356129681, 14188630, 886400350],
  sources: ['.codex-jobs/evidence/up20_gyeongbu.json', 'refs/user_walk/20261107/manifest.json', 'refs/user_walk/20261107/places.json', '.codex-jobs/evidence/walk_s3_gyeongbu.json', 'refs/walk/s3_gyeongbu/', 'refs/official/gyeongbu/exterminal_directory_parsed.json', 'refs/official/gyeongbu/exterminal_floor/n_floor011.jpg', 'refs/official/gyeongbu/exterminal_floor/n_floorb01.jpg', 'refs/official/gyeongbu/exterminal_floor/n_floorb01_sub.jpg', 'refs/interior/daiso/notes_1.json', '.codex-jobs/evidence/daiso.json', 'refs/interior/gb_hall/notes.json', 'refs/interior/gb_flower/notes.json', 'refs/aerial/gyeongbu_lots.jpg', 'refs/roadview/manifest.json',
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
  // Re-register a complete detailed assembly in the photo-walk coordinate frame.
  // This keeps its counters, stock, glazing and visitors together when it moves.
  let activePlacement = null;
  function placeAssembly(t, draw) {
    const owner=K, previous=activePlacement;
    const {from=[0,0],to=[0,0],angle=0,sx=1,sz=1,sy=1,dy=0}=t;
    const c=Math.cos(angle),sn=Math.sin(angle);
    const pt=(x,z)=>{const [u,v]=toL(x,z),du=(u-from[0])*sx,dv=(v-from[1])*sz;return W(to[0]+c*du-sn*dv,to[1]+sn*du+c*dv);};
    const poly=p=>p.map(q=>pt(...q)), yy=y=>y*sy+dy;
    const opts=o=>{if(!o)return o;const n={...o};if(o.holes)n.holes=o.holes.map(poly);if(o.openings)n.openings=o.openings.map(a=>({...a,y0:yy(a.y0),y1:yy(a.y1)}));return n;};
    const object=o=>{const n={...o};if(o.x!==undefined){[n.x,n.z]=pt(o.x,o.z);}if(o.y!==undefined)n.y=yy(o.y);const r=(o.rotY??ROT)-ROT;
      const sw=Math.hypot(sx*Math.cos(r),sz*Math.sin(r)),sd=Math.hypot(sx*Math.sin(r),sz*Math.cos(r));
      if(o.w!==undefined)n.w=o.w*sw;if(o.d!==undefined)n.d=o.d*sd;if(o.h!==undefined)n.h=o.h*sy;
      if(o.r!==undefined)n.r=o.r*Math.sqrt(sx*sz);if(o.rotY!==undefined)n.rotY=o.rotY-angle;
      if(o.rx!==undefined){n.rx=o.rx*sw;n.rz=o.rz*sd;n.ry=o.ry*sy;}return n;};
    K=new Proxy(owner,{get(target,key){
      if(['box','cyl','dome','vehicle','spawn'].includes(key))return o=>target[key](object(o));
      if(key==='sign'||key==='floorText')return (text,o)=>target[key](text,object(o));
      if(key==='quad')return (mat,p,n)=>target.quad(mat,p.map(([x,y,z])=>{const q=pt(x,z);return[q[0],yy(y),q[1]];}),n?(()=>{const nu=(n[0]*A[0]+n[2]*A[1])/sx,nv=(n[0]*B[0]+n[2]*B[1])/sz,du=c*nu-sn*nv,dv=sn*nu+c*nv,q=[du*A[0]+dv*B[0],n[1]/sy,du*A[1]+dv*B[1]],len=Math.hypot(...q)||1;return q.map(v=>v/len);})():n);
      if(key==='hpoly')return (mat,p,y,up,holes)=>target.hpoly(mat,poly(p),yy(y),up,holes?.map(poly));
      if(key==='slab')return (p,y,o)=>target.slab(poly(p),yy(y),opts(o));
      if(key==='prism')return (p,a,b,o)=>target.prism(poly(p),yy(a),yy(b),opts(o));
      if(key==='wall')return (ax,az,bx,bz,a,b,o)=>{const p=pt(ax,az),q=pt(bx,bz),f=Math.hypot(q[0]-p[0],q[1]-p[1])/Math.hypot(bx-ax,bz-az),n=opts(o);if(n?.openings)n.openings=n.openings.map(a=>({...a,at:a.at*f,w:a.w*f}));return target.wall(...p,...q,yy(a),yy(b),n);};
      if(key==='polyWalls')return (p,a,b,o)=>target.polyWalls(poly(p),yy(a),yy(b),opts(o));
      if(key==='person')return (x,y,z,o)=>{const p=pt(x,z);return target.person(p[0],yy(y),p[1],{...o,rotY:(o?.rotY||0)-angle});};
      if(key==='zone')return o=>target.zone({...o,poly:poly(o.poly),y0:yy(o.y0),y1:yy(o.y1)});
      return target[key];
    }});
    activePlacement=t;
    try {draw();} finally {K=owner;activePlacement=previous;}
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
    {u:280.5,v:6,top:2,base:-4,levels:[0,NORTH_2F,NORTH_ROOF],name:'북측 동 엘리베이터',face:'+v'},
    {u:190,v:118,top:1,base:0,name:'주차장 엘리베이터',face:'-u'},
  ];
  const cores=[{u:35,v:48,levels:[-6,...ys]},{u:282,v:2,levels:[-4,0,NORTH_2F,NORTH_ROOF]}];
  const escs=[{u:20,v:61,ya:0,yb:6,len:12},{u:20,v:78,ya:6,yb:11,len:10}];
  const coreRect=c=>[c.u,c.v,c.u+4.4,c.v+10];
  const excluded=[...cores.map(coreRect),...elevs.map(e=>{
    const [du,dv]=FDIR[e.face];
    return [e.u-1.4+Math.min(0,du*2.2),e.v-1.4+Math.min(0,dv*2.2),e.u+1.4+Math.max(0,du*2.2),e.v+1.4+Math.max(0,dv*2.2)];
  }),...escs.map(e=>[e.u-2,e.v-1,e.u+2,e.v+e.len+1])];
  excluded.push([35.5,8,40.5,20],[265.5,.7,278,5.2],[206.5,9,214.5,24],[30,67,48,84],[54,27,63,84],[66,17,76,28],[164,11,168,21],[102.8,12.2,116,17.25]); // stair beside the B1 escalator, photos 38/41
  const inRect=(r,u,v,m=0)=>u>r[0]-m&&u<r[2]+m&&v>r[1]-m&&v<r[3]+m;
  const blocked=(u,v,m=0)=>excluded.some(r=>inRect(r,u,v,m));
  function holes(poly,y){
    const out=[];
    for(const c of cores)if(y>c.levels[0]&&y<=c.levels.at(-1))out.push(rect(c.u,c.v,c.u+4.4,c.v+8.4));
    for(const e of escs)if(y===e.yb)out.push(rect(e.u-1.8,e.v,e.u+1.8,e.v+e.len));
    if(y===0)out.push(rect(30,67,48,83.8),rect(265.5,.8,278,3),rect(206.5,10.5,214.5,23),rect(164,11,168,21),rect(102.8,12.2,116,17.25));
    if(y===NORTH_2F)out.push(rect(122,16.3,137,18.2),rect(169,20,177,21.8),rect(253,12,258.4,20),rect(265.5,3.2,273,5.2));
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
  const lobbyGalleryVoid=rect(66,17,75.6,28);
  const hallVoids=[rect(54,33,62,48)];
  for(let i=1;i<ys.length;i++){
    const p=floorPoly(i);K.slab(p,ys[i],{mat:i===2?'concrete':'tile',under:'gb_acoustic',holes:[...holes(p,ys[i]),...(i===1?[...hallVoids,lobbyGalleryVoid]:[])]});
  }
  const northVoids=[rect(168,16.7,258,30),rect(118,16.7,140,30)];
  K.slab(NORTH,NORTH_2F,{mat:'tile',under:'gb_acoustic',holes:[...holes(NORTH,NORTH_2F),...northVoids]});
  K.slab(NORTH,NORTH_ROOF,{mat:asphalt,under:'gb_acoustic',holes:[...holes(NORTH,NORTH_ROOF),rect(118,16.7,140,30)]});
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
  const photoBayUs=[118.5,121,123.5,127,133,150,154,158,165,171,178,185,192,199,206,212,218,224,230,237,246,252];
  photoBayUs.forEach((u,i)=>bays.push({n:17+i,u,v:30.2,west:false}));
  bays.push({n:39,u:255,v:30.2,west:false});
  for(let n=40;n<=46;n++)bays.push({n,u:263+(n-40)*7.3,v:30.2,west:false});
  const bayDestinations={1:'부산',2:'부산사상',3:'마산',4:'창원',5:'진주',6:'울산 · 통영 · 김해',7:'동대구',9:'포항 · 경주',10:'구미 · 상주',11:'대전',13:'세종',14:'천안',16:'공주 · 아산',18:'조치원 · 금산',19:'속초 · 양양',20:'삼척 · 동해',23:'강릉',24:'제천 · 정선',25:'원주',27:'용인',28:'이천',29:'여주',30:'영월 · 춘천',31:'안동 · 영주',32:'안성',33:'평택',34:'청주',35:'청주',36:'청주'};
  for(const b of bays)b.dest=b.n>=40?'도착':bayDestinations[b.n]||'';
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
  const waitingWindow=[window29.u+1.45,window30.u-1.45];
  {const[x,z]=W((waitingWindow[0]+waitingWindow[1])/2,30.2);doors.push({x,z,w:waitingWindow[1]-waitingWindow[0],y0:.1,y1:3.15});}
  const northScreens=bays.filter(b=>!b.west).sort((a,b)=>a.u-b.u);
  for(let i=1;i<northScreens.length;i++){
    const a=northScreens[i-1].u+1.4,b=northScreens[i].u-1.4;if(b-a<.2)continue;
    const [x,z]=W((a+b)/2,30.2);doors.push({x,z,w:b-a,y0:.1,y1:3.3});
  }
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
    for(const inside of b.west?[false]:[]){
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
    const openings=[80,122,163,218,230.5,262];
    lwall(76,.5,317,.5,0,3.3,{mat:'glass',thick:.04,openings:openings.map(u=>({at:u-76,w:u===262?7:3,y0:0,y1:3.3}))});
    for(let u=76;u<317;u+=6){if(openings.some(x=>Math.abs(x-u)<2.8)||u>264&&u<273)continue;lbox(u,.5,0,.8,.65,3.3,{tex:'brick',color:0xc49a6a});}
    lbox(196.5,.15,3.3,241,.7,.3,0xf0efea,{solid:false});
    lbox(196.5,.2,3.6,241,.3,.6,{tex:'brick',color:0x8a6250},{solid:false});
    // The recessed upper balcony exists only west of the photographed vestibule.
    lwall(76,3.7,258.5,3.7,4.2,7.5,{mat:'glass',thick:.04,openings:[{at:87,w:4,y0:4.2,y1:7.2}]});
    for(let u=76;u<258;u+=6)lbox(u,.5,4.2,.4,.5,3.3,0x9c7551);
    for(let u=76;u<258;u+=1.2)lbox(u,.2,4.3,.045,.065,1,0xaaa38c,{solid:false});
    lbox(167,.2,5.3,182,.07,.07,0xaaa38c,{solid:false});
    lwall(258.5,.5,280,.5,4.2,7.7,{mat:{tex:'brick',color:0x8a6250},thick:.18});
    for(const u of [264,271,277]){lbox(u,.36,5,4.8,.04,2.1,0xe8d9dd,{solid:false});lsign('B&C MARKET',u,.3,6.1,4.1,.65,'-v',{bg:'#eee4e4',fg:'#6e3d55'});}
    lwall(280,.45,317,.45,0,8.4,{mat:0xc8cacb,thick:.18,openings:[{at:5,w:6,y0:0,y1:3.1},{at:20,w:4,y0:0,y1:3.1}]});
    lsign('제로데이택배',298,.3,5.9,27,1.4,'-v',{bg:'#f5f5f0',fg:'#333b40'});
    lbox(196.5,.3,7.7,241,.5,1.3,{tex:'brick',color:0x8a6250},{solid:false});
    lsign(['고속터미널','부속상가'],250,-.05,5.5,.8,3.7,'-v',{bg:'#6a273b',fg:'#eee8dc'});
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
    const floors=(e.base<0?[{label:'지하 1층',y:e.base,name:e.base===-4?'다이소':'지하상가'}]:[])
      .concat((e.levels||ys).slice(0,e.top+1).map((y,i)=>({label:e.levels&&i===2?'옥상':`${i+1}층`,y,name:e.u>180&&i===e.top?'주차장':uses[i]})));
    if(e.u===42||e.u===48.6){
      lelev(e.name,e.u,e.v,e.face,floors,{shaft:false});
      const shaft=rect(e.u-1.1,e.v-1.1,e.u+1.1,e.v+1.1);
      for(let i=0;i<floors.length;i++){
        const f=floors[i],top=floors[i+1]?.y??f.y+3.2,face=f.y===0?'-v':e.face,dir=FDIR[face],p=W(e.u+dir[0]*1.1,e.v+dir[1]*1.1);
        K.polyWalls(shaft,f.y,top,{mat:0xb9bcc0,thick:.15,openings:[{x:p[0],z:p[1],w:1.2,y0:f.y,y1:f.y+2.4}]});
        K.slab(shaft,f.y,{mat:'metal',thick:.05,ceil:false});
        lsign(f.label,e.u+dir[0]*1.21,e.v+dir[1]*1.21,f.y+2.55,.6,.25,face,{bg:'#252626',fg:'#ffd6a2'});
      }
    }else lelev(e.name,e.u,e.v,e.face,floors,e.levels?{topH:2.6}:{});
  }
  for(const e of escs){
    lesc(e.u-.85,e.v,e.u-.85,e.v+e.len,{ya:e.ya,yb:e.yb,w:1.1});
    lesc(e.u+.85,e.v,e.u+.85,e.v+e.len,{ya:e.ya,yb:e.yb,w:1.1,dir:'down'});
    lwall(e.u-1.8,e.v,e.u+1.8,e.v,e.yb,e.yb+1,{mat:0x90948e,thick:.08});
    if(e.yb!==11)lsign(e.yb===0?'매표소 · 승차홈':'2층 · 꽃상가 ↑',e.u,e.v-.3,e.ya+2.82,e.yb===0?2.8:3.3,.36,'-v',{bg:e.yb===0?'#2863a2':'#225a4a',fg:'#fff'});
  }
  buildHall();buildPhotoWalk20Hall();buildBasement();buildUpper();buildYards();buildWalk13();buildWalk15Public();buildWalk17Interiors();
  lspawn('경부선 터미널 정문',163,-16,0,0,1);
  lspawn('1층 대합실',70.5,89,0,0,-1);
  lspawn('1층 매표·환불',58,38,0,1,0);
  lspawn('1층 무인발권기',166,22,0,0,-1);
  lspawn('1층 할리스 아래 통로',173,25,0,0,-1);
  lspawn('승차홈과 버스 마당',77.2,98,0,0,-1);
  lspawn('3층 꽃도매상가',35,100,11,0,1);
  lspawn('3층 생화 통로',58.7,74,11,0,-1);
  lspawn('지하 1층 다이소 1번 출입구',171,6.5,-4,1,0);
  lspawn('다이소 생활용품 매장',230,6.5,-4,-1,0);
  lspawn('다이소 고투몰 쪽 4번 출입구',250,-13,-4,0,1);
  lspawn('경부선 주차장',174,110,6,0,-1);
  lspawn('10층 성당 · 옥상정원',38,85,43,0,1);
  lspawn('북측 동 옥상 주차장',148,18,NORTH_ROOF,1,0);

  function buildHall(){
    function kiosk(u,v,face='+v'){
      const f=FDIR[face],rot=face==='+v'?0:face==='-v'?PI:face==='+u'?PI/2:-PI/2,at=(d)=>[u+f[0]*d,v+f[1]*d];
      lbox(u,v,0,.64,.55,.09,0x393d3e,{rot});lbox(u,v,.09,.56,.48,1.69,0xeeefec,{rot});lbox(...at(.252),.91,.49,.035,.69,0xe9eaea,{rot,solid:false});
      lsign('',...at(.28),1.25,.42,.55,face,{bg:'#cfe7f7'});lsign('버스승차권 발매기',...at(.29),1.68,.49,.06,face,{bg:null,fg:'#383e40',padding:.01,pxPerM:250});
      for(let k=0;k<3;k++)lsign('',...at(.29),1.43-k*.16,.33,.1,face,{bg:k===1?'#85b6dc':'#e8f3f7'});
      lbox(...at(.27),.73,.4,.035,.12,0x4a4f50,{rot,solid:false});lbox(...at(.27),.4,.3,.035,.055,0x424a4a,{rot,solid:false});lsign('Tmoney',...at(.29),.21,.3,.08,face,{bg:null,fg:'#8f5c49',pxPerM:200});
    }
    const detail = [];
    const furnish = fn => {const t=activePlacement;detail.push(t?()=>placeAssembly(t,fn):fn);};
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
    const ticketRect=[49,27,54,45],trussRect=[118,16.7,140,30],seatsRect=[63,30,75.7,48],cafeRect=[150,16.7,168,30],corridorRect=[54,27,62,153];
    const doorRect=[66,17,75.7,28];
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
    cover(hallWest,[...pockets,...ceilHoles,[66.2,6.2,75.25,23],[30,67,54,84]],3.3);cover(NORTH,[...northVoids,[258,0,280,30],[77,17.5,118,22.6]],3.6);
    K.hpoly('gb_acoustic',rect(168,16.7,258,30),7.3,false);K.hpoly('gb_acoustic',rect(258,7,280,30),3.8,false);
    K.hpoly(0xf2f0eb,rect(77,17.5,118,22.6),3.5,false);
    cover(rect(...corridorRect),[[54,33,62,48],[54,67,62,84]],4.8,0xefeeea);
    K.hpoly(0xf1efe8,rect(...doorRect),10.8,false);
    const inPocket=(u,v)=>pockets.some(r=>inRect(r,u,v,.2));
    columns(hallWest,0,3.28,(u,v)=>inPocket(u,v)||(u>68&&u<72));columns(NORTH,0,3.55,(u,v)=>v>16||u>258&&u<280);
    furnish(() => {
    // 600 mm T-bars align to the terminal, with 1.2 m rows of small downlights.
    const ceilStrip=(u0,v0,u1,v1,y)=>{const p=rect(u0,v0,u1,v1).map(([x,z])=>[x,y,z]);K.quad(0xc4c3bd,p,[0,-1,0]);};
    for(const [a,b,c,d,y] of [[77,118,4,17,3.58],[140,258,4,16.5,3.58],[168,258,16.7,30,7.28],[258,280,7,30,3.78]]){
      for(let u=a;u<b;u+=.6)ceilStrip(u,c,u+.012,d,y);
      for(let v=c;v<d;v+=.6)ceilStrip(a,v,b,v+.012,y);
    }
    for(let u=56;u<66;u+=.6)for(const [a,b] of [[23,26],[35,54],[84,153]])ceilStrip(u,a,u+.018,b,4.49);
    for(let v=23;v<153;v+=.6){if(v>26&&v<35||v>54&&v<84)continue;ceilStrip(56,v,66,v+.018,4.49);}
    for(let u=68.4;u<75.1;u+=1.2)for(let v=30;v<153;v+=1.2){if(inRect(cafeRect,u,v)||inRect(doorRect,u,v)||(u>=71.4&&v>=54&&v<=93))continue;lcyl(u,v,4.46,.08,.025,'emit',{seg:6,solid:false});}
    for(let u=9;u<315;u+=6)for(let v=9;v<156;v+=6){
      const [x,z]=W(u,v);if(!K.pointInPoly(x,z,P)||blocked(u,v,2)||inPocket(u,v)||u>118&&u<258&&v>16.7)continue;
      lbox(u,v,3.23,.2,1.45,.055,0xd2d1ca,{solid:false});for(const du of [-.055,.055])lbox(u+du,v,3.215,.045,1.3,.018,'emit',{solid:false});
    }
    for(let v=24;v<30;v+=3)for(const u of [68.5,72.8]){lbox(u,v,3.2,.3,1.2,.06,0xbfc2bc,{solid:false});for(const du of [-.07,.07])lbox(u+du,v,3.185,.04,1.1,.025,'emit',{solid:false});}
    });
    // 02: the west half is a run of real shop units, rather than an open column hall.
    // Official main 1F units, mapped in reverse v order toward platform 16.
    const westNames=['데일리햇','티월드','도시주방','타코벨','신서울깍두기','띤띤익스프레스','파리바게트','연남토마','타쿠미나가사키','만복식당','소녀방앗간','스테이스튜디오','헬스보이짐'];
    const westUnitNos=[17,16,11,10,9,8,7,6,5,4,3,2,1];let wi=0;
    placeAssembly({to:[-23,0]},()=>{
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
    });
    // 10/16: 5–7 m individual fascias. The food counters face the walking aisle.
    const stallRows=[[23,42,['노브랜드 버거','후라토식당','죠 샌드위치']],[73,94,['배스킨라빈스','시그니처랩','앤티앤스']],[109,127,['타이거슈가','석관동떡볶이','라멘짱']],[132,139,['스타벅스']]];
    for(const [v0,v1,names] of stallRows){const step=(v1-v0)/names.length;

      for(let j=0;j<names.length;j++){const a=v0+j*step,b=a+step,v=(a+b)/2,name=names[j],food=['노브랜드 버거','후라토식당','죠 샌드위치','시그니처랩','석관동떡볶이','라멘짱'].includes(name);
        const moved=name==='노브랜드 버거'||name==='후라토식당'?{from:[61.5,v],to:[60,name==='노브랜드 버거'?59.25:63.75],angle:PI,sx:.56,sz:.68}:{to:[-14,v0===23?69:0]};
        placeAssembly(moved,()=>{
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
        });
      }
    }
    // North-wing glass shop fronts have lit shelves and a counter behind each unit.
    // Annex units retain the photographic counter/cabinet detail. Gate wells and the
    // main street entrance remain clear; numbered-platform order in the old OSM
    // reconstruction is reversed, so the two documented gate neighbours take priority.
    const annexUnits=[
      [86,92,'이디야',36],[94,100,'뚜레쥬르',37],[103,108,'공차',38],
      [112,118,'emart24 / ZZANG GAMES',39],[133,143,'버거킹',40],[143,147,'청년떡볶이',41],
      [157,162,'제주스커피',42],[189,195,'이마트24 2호점',46],[195,200,'압구정칼국수김밥',47],
      [202,207,'요쇼쿠',48],[222,229,'역전우동',49],[214,220,'던킨',51],[232,240,'북촌손만두',50],
      [230,237,'김밥천국',52],[237,244,'약천',53],[244,251,'내고향사골순대국',54],[251,258,'청룡각',55],
      [273,280,'효도치킨',58],
    ];
    for(const [shopIndex,[a,b,name,unit]] of annexUnits.entries()){
        const step=b-a,u=(a+b)/2;
        const street=unit>=52,short=u<118;
        placeAssembly(street?{from:[u,22],to:[u,.5],angle:PI,sx:1,sz:.7}:short?{from:[u,22],to:[u,17.5],sz:.6}: {from:[u,10.4],to:[u,10.4]},()=>{
        lwall(a,10.4,b,10.4,0,3.3,{mat:0xe3dfd4,thick:.14});for(const uu of [a,b])lwall(uu,10.4,uu,22,0,3.3,{mat:0xe3dfd4,thick:.14,...(uu>=102.8&&uu<=118?{openings:[{at:6.98,w:8.45,y0:0,y1:3.3}]}:{})});
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
        });
    }
    K.hpoly('gb_tactile',rect(58.25,27,58.55,153),.024);K.hpoly('gb_tactile',rect(98,25.85,314,26.15),.024);
    for(const b of bays){if(b.west)K.hpoly('gb_tactile',rect(58.4,b.v-.15,75.4,b.v+.15),.026);else K.hpoly('gb_tactile',rect(b.u-.15,26,b.u+.15,30),.026);}
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
        for(const [t,label] of [[-1.05,'‹ 승차홈 17~39'],[1.05,'승차홈 1~16 ›']])lsign(label,74.58,b.v+t,3.35,1.6,.35,'-u',{bg:'#494740',fg:'#fff',offset:.035,pxPerM:180});
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
      if(!west)continue;
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
      lsign(['‹ 승차홈 17~39','경부선 · 영동선'],u+(along?0:-dir*1.35),v+(along?dir*1.35:0),2.78,2.6,.45,face,{bg:null,fg:'#fbf7ee',twoSided:true,offset:.09,padding:.01});
      lsign('승차홈 1~16 ›  ● 화장실',u+(along?0:dir*1.4),v+(along?-dir*1.4:0),2.78,2.5,.28,face,{bg:null,fg:'#fbf7ee',twoSided:true,offset:.09,padding:.01});
    }
    for(const v of [24.5,26]){lbox(70.9,v,0,.6,.08,1.6,0x5a3f2e);lsign(['매표소 / 호남선','지하철 3·7·9호선','신세계백화점'],70.9,v-.06,1.05,.54,.9,'-v',{bg:null,fg:'#fff',pxPerM:180});}
    lsign('지하철 · 제로데이 택배 >',70.8,23.2,2.9,4.5,.4,'-v',{bg:'#cdb48c',fg:'#f8f8ed',twoSided:true,offset:.08});
    });
    placeAssembly({from:[24,137],to:[51.5,44],angle:-PI/2,sx:.4,sz:.4},()=>{
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
    });
    placeAssembly({from:[8,14],to:[118,16.7],sx:22/24,sz:13.3/20,sy:1.2},()=>{
    // 13: six-sided tube trusses and skylight strips; exact location remains unverified.
    K.hpoly('gb5_ticket_tile',rect(8,14,32,34),.014);
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
    });
    placeAssembly({from:[8,108],to:[63,30],sx:12.7/26,sz:18/22},()=>{
    // 15: light oak slats against a white backing, planted columns and upholstered benches.
    K.hpoly('gb5_ticket_tile',rect(8,108,34,130),.014);K.hpoly(0xeeebe4,rect(8,108,34,130),4,false);
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
    });
    placeAssembly({from:[56,54],to:[168,16.7],angle:PI/2,sx:13.3/15.4,sz:.6,dy:-1.8},()=>{
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
    K.hpoly('gb_acoustic',rect(56,54,71.4,84),10.55,false);
    for(const u of [56,71.4])lwall(u,54,u,84,6,7.1,{mat:doorGlass,thick:.08});for(const v of [54,84])lwall(56,v,71.4,v,6,7.1,{mat:doorGlass,thick:.08});
    lwall(56,58,71.4,58,6,7.1,{mat:doorGlass,thick:.08});
    furnish(() => {
    lbox(63.7,58,7.08,15.4,.08,.06,aluminium,{solid:false});
    lbox(63.7,58.3,5.95,15.4,.2,.8,0xefe9dc,{solid:false});lsign('FOOD STATION 2F',63.7,58.45,6.35,8,.7,'+v',{bg:null,fg:'#d63e29',padding:.01});
    lbox(63.7,54.2,7.1,15.2,.12,2.4,0x333934,{solid:false});lsign('HOLLYS',61.05,58.42,8.45,4.2,.65,'+v',{bg:null,fg:'#fff'});lsign('COFFEE',66.35,58.42,8.45,4.2,.65,'+v',{bg:null,fg:'#fff'});lsign('●',63.7,58.43,8.46,.65,.6,'+v',{bg:null,fg:'#cd2338',offset:.035});
    for(let k=0;k<6;k++)lsign(k===0?'LEMON':'메뉴 안내',58.8+k*1.95,58.5,5.5,1.6,.4,'+v',{bg:'#f4f6f8',fg:'#464d4b',padding:.01});
    for(const u of [58,61,64,67,70]){lbox(u,56,6.85,.7,.6,.07,0x8b6a4b,{solid:false});lcyl(u,56,7.85,.18,.22,{tex:'emit',color:0xffd699},{seg:6,solid:false});}

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
    });
    lzone('할리스 · 푸드스테이션','2F','카페',56,52,71.4,58,6,11,4);
    });
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
    placeAssembly({from:[25,147.15],to:[62.5,48],angle:-PI/2,sx:.8,sz:1.4},()=>{
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
    });
    buildOfficialHallRetail();
    ldetail({floor:'1F',y0:0,y1:9.5,poly:P,name:'1F 대합실 · 매표 · 상점 · 좌석'}, () => { for(const draw of detail)draw(); });
  }

  function buildPhotoWalk20Hall(){
    // User photos #0–65 are the primary source for this floor. All values are metres.
    const white={tex:'gb5_ticket_tile',color:0xe6e3dc,gloss:.5},marble={tex:'gb5_hallstone',gloss:.5};
    K.texture('gb20_mosaic',128,128,(g,w,h)=>{g.fillStyle='#6e3b32';g.fillRect(0,0,w,h);g.strokeStyle='#a78d80';g.lineWidth=1;for(let k=0;k<=128;k+=16){g.beginPath();g.moveTo(k,0);g.lineTo(k,h);g.moveTo(0,k);g.lineTo(w,k);g.stroke();}},[.8,.8]);
    K.texture('gb20_art',256,256,(g,w,h)=>{g.fillStyle='#e44e25';g.fillRect(0,0,w,h);for(let i=0;i<18;i++){g.fillStyle=['#1682ca','#40b65e','#d8e6a3','#126f8e'][i%4];g.beginPath();g.moveTo(i*21%w,h);g.lineTo(i*31%w,80+i*7);g.lineTo((i*43+60)%w,h);g.fill();}},[2,3]);
    K.hpoly(white,WEST,.031,true,holes(WEST,0));K.hpoly(white,rect(76,17.5,118,30),.032);
    K.hpoly({tex:'gb_terrazzo',color:0xd6d4ce,gloss:.5},rect(118,16.7,145,30),.033);
    for(let u=80;u<118;u+=8)lquadH(u,17.5,u+1.6,30,.035,0x7c7f82);
    for(let v=30;v<154;v+=8)lquadH(54,v,62,v+1.6,.035,0x7c7f82);
    K.hpoly('gb_tactile',rect(58.25,27,58.55,153),.04,true,[rect(58.25,50,58.55,50.1)]);
    K.hpoly('gb_tactile',rect(77,19.55,118,19.85),.04);
    K.hpoly('gb_tactile',rect(118,25.85,278,26.15),.04);
    // 1F/B1 openings and both banks share exactly the same endpoints.
    K.slab(rect(47,67,49,83.8),0,{mat:white,thick:.15});
    K.slab(rect(115,12.2,118,17.25),0,{mat:white,thick:.15});
    K.slab(rect(136,15.8,138,18.3),4.2,{mat:0xe8e6df,thick:.15});
    K.slab(rect(168,20,170,22),4.2,{mat:0xe8e6df,thick:.15});
    for(const v of [68.8,71,80.8,82.5])lesc(32,v,47,v,{ya:-6,yb:0,w:v===68.8?1.3:1.1,dir:v===71||v===82.5?'down':'up'});
    for(const [a,b] of [[71.9,74.9],[76.4,79.7]])for(let k=0;k<14;k++){
      const u=32+k*15/14,y=-6+(k+1)*6/14;
      rbox(u,a,u+15/14,b,-6,y+6,{tex:'wood',color:0xc9a26b});
      lquadH(u,a,u+.035,b,y+.012,0xead18e);
    }
    lstairs(32,75.65,47,75.65,{ya:-6,yb:0,w:1.5,steps:28,mat:{tex:'wood',color:0xc9a26b},rails:false});
    for(const v of [67.15,83.7])lwall(30,v,48,v,0,1.05,{mat:doorGlass,thick:.05});
    for(const v of [67.15,83.7])lbox(39,v,1.04,18,.06,.06,0x303638,{solid:false});
    lzone('지하 식당가 에스컬레이터','1F','목재 계단식 대합실 · 지하 식당가',30,67,49,84,-6,4,7);
    // B&C: the north flight descends east; the adjacent dark stair rises east.
    lstairs(265.5,1.9,271.4,1.9,{ya:0,yb:-2,w:1.6,steps:12,mat:0x767671,rails:true});
    K.slab(rect(271.4,1.1,272.3,2.7),-2,{mat:0x767671,thick:.15});
    lstairs(272.3,1.9,278,1.9,{ya:-2,yb:-4,w:1.6,steps:12,mat:0x767671,rails:true});
    lstairs(265.5,4.2,273,4.2,{ya:0,yb:4.2,w:1.6,steps:25,mat:0x373638,rails:true});
    for(const v of [.8,3,5.3])lwall(265.5,v,278,v,0,3.3,{mat:v===.8?0xe6ded0:0x2f2f30,thick:.12});
    for(const v of [.85,2.95])lbox(265.45,v,0,.16,.18,2.7,0xd7262b);
    lbox(265.45,1.9,2.4,.18,2.3,.4,0xd7262b,{solid:false});lsign('GATE 3',265.33,1.9,2.6,1.7,.3,'-u',{bg:null,fg:'#fff'});
    lzone('다이소 GATE 3','1F','B&C 현관 · 지하 매장 계단',258.5,0,278,7,-4,4.2,7);
    // GATE 3 vestibule: brick, mosaic, inner door screen and black linear ceiling.
    K.hpoly({tex:'gb20_mosaic',gloss:.35},rect(258.5,0,265.5,7),.042);
    K.hpoly('gb_tactile',rect(261.75,0,262.05,7),.045);
    lwall(258.5,0,258.5,7,0,3.3,{mat:{tex:'brick',color:0x7f7a74},thick:.12});
    lwall(258.5,7,265.5,7,0,3.4,{mat:doorGlass,thick:.04,openings:[{at:5.2,w:2.6,y0:0,y1:2.6}]});
    for(const u of [258.5,262.4,265,265.5])lbox(u,6.96,0,.07,.1,3.4,0x333b3d,{solid:false});
    for(const y of [.05,2.6,3.35])lbox(262,6.95,y,7,.1,.06,0x333b3d,{solid:false});
    for(let u=258.5;u<265.5;u+=.14)lbox(u,3.5,3.3,.075,7,.11,0x33373a,{solid:false});
    lsign('B&C MARKET / Bread Garden',265.31,5.95,2.85,2.2,.7,'-u',{bg:'#fff',fg:'#973e39'});
    lbox(265.2,6.75,0,.45,.5,2.6,0xc08a4a);
    // Nave and arrival hall: a full-height bamboo screen with a clear tactile doorway.
    lwall(258.5,20,258.5,30,0,7.3,{mat:doorGlass,thick:.04,openings:[{at:4.75,w:2.5,y0:0,y1:3.2}]});
    for(const [a,b] of [[20,23.5],[26,30]])for(const u of [258.15,258.85]){
      rbox(u-.28,a,u+.28,b,0,.6,0x2b2b2b);
      for(let v=a+.13;v<b;v+=.23){lcyl(u,v,.6,.025,5.6,0x68794c,{seg:5,solid:false});for(let k=0;k<7;k++)lbox(u+.12*Math.sin(k*3),v,.9+k*.75,.2,.33,.35,'gb8_foliage',{solid:false});}
    }
    lsign('나가는 곳 EXIT',258.38,24.75,2.82,2.2,.45,'-u',{bg:'#e3d6bc',fg:'#3a3831',twoSided:true});
    // Photo #12 dogleg stair / small lotto kiosk at the screen's north end.
    lstairs(254.1,12,254.1,19,{ya:0,yb:2.1,w:1.6,steps:13,mat:0xe8e7e0,rails:true});
    K.slab(rect(253.2,19,258.3,20),2.1,{mat:0xe8e7e0});
    lstairs(257.4,19,257.4,12,{ya:2.1,yb:4.2,w:1.6,steps:13,mat:0xe8e7e0,rails:true});
    lwall(253.1,12,253.1,20,0,3.3,{mat:0xf1f0e9,thick:.13,openings:[{at:2,w:.9,y0:0,y1:2.1}]});
    // Restroom/street cross passage between the two food pavilions.
    K.hpoly({tex:'gb20_mosaic',gloss:.3},rect(229,0,232,20),.041);
    lwall(229,0,229,20,0,3.3,{mat:0xe5e0d4,thick:.12});lwall(232,0,232,20,0,3.3,{mat:0xe5e0d4,thick:.12});
    lsign('화장실',230.5,20.1,2.8,2.6,.45,'+v',{bg:'#554e42',fg:'#d7b56b'});
    // Main hall high slot and atrium, with 2F bridge and safe gallery edge.
    K.hpoly(0xf2f0eb,rect(54,33,62,48),10,false);
    for(const u of [54.4,61.4])lbox(u,40.5,9.94,.4,15,.04,'emit',{solid:false});
    lwall(62,33,62,48,6,7.1,{mat:doorGlass,thick:.05});lbox(62,40.5,5.7,.25,15,.3,0xf1efe9,{solid:false});
    K.slab(rect(54,48,62,50.5),6,{mat:0xece9df,under:0xf5f2eb});
    for(const v of [34,38,42,46]){
      lcyl(53.5,v,0,.45,6.8,0xf4f1e9,{seg:24});
      for(let k=0;k<12;k++){const h=k*.07,rr=.45+.095*k;const[x,z]=W(53.5,v);K.dome({x,z,y:6.7+h,rx:rr*1.18,ry:.09,rz:rr*.76,mat:0xf4f1e9,seg:24,rings:2});}
      const p=Array.from({length:32},(_,k)=>W(53.5+1.65*Math.cos(k*PI/16),v+1.05*Math.sin(k*PI/16)));K.hpoly('emit',p,7.57,false);
    }
    for(let u=66;u<75.7;u+=.16)lbox(u,22.5,10.5,.07,11,.25,0x5a3e2c,{solid:false});
    for(let v=17;v<28;v+=.15)lbox(66.15,v,3.1,.12,.06,7.4,0xd8c4a4,{solid:false});
    lbox(66.24,22.5,4,.08,11,1.5,'gb8_foliage',{solid:false});
    lsign('UNIQLO',66.35,24.9,7.75,2.4,2.4,'+u',{bg:'#e60012',fg:'#fff'});
    lbox(66.35,19.1,1,.12,4.5,9,{tex:'gb20_art',gloss:.3},{solid:false});
    lwall(66,17,75.7,17,0,10.7,{mat:doorGlass,thick:.04});
    lwall(55,26.5,66,26.5,0,3.4,{mat:doorGlass,thick:.04,openings:[{at:6,w:3,y0:0,y1:3.1}]});
    const circle=Array.from({length:32},(_,k)=>W(71.5+2.8*Math.cos(k*PI/16),23+2.8*Math.sin(k*PI/16)));K.hpoly(0x969895,circle,.04);
    lzone('본관 아트리움','1F','유니클로 · 종합안내',66,17,75.7,30,0,11,6);
    for(let u=31;u<54;u+=.12)lbox(u,55,0,.055,.1,3.2,0x55585a,{solid:false});
    for(const u of [42,48.6]){lbox(u,53.88,0,1.65,.05,2.4,0xb6bab9,{solid:false});lsign('엘리베이터',u,53.81,2.65,1.8,.25,'-v',{bg:null,fg:'#4b4f4e'});}
    lwall(29.8,50,29.8,55,0,3.3,{mat:doorGlass,thick:.04,openings:[{at:2.5,w:1.8,y0:0,y1:2.6}]});
    lsign('PARIS BAGUETTE',29.95,52.5,2.85,4.5,.5,'+u',{bg:'#263b53',fg:'#fff'});
    // Front-facing north facade high cream wall and pavilion roofs.
    lwall(168,16.7,258,16.7,3.6,7.3,{mat:0xe6dcb4,thick:.18});
    for(let u=169;u<258;u+=6.5)lbox(u,16.88,3.6,.9,.25,3.7,0xeee5c6,{solid:false});
    for(const [a,b] of [[168,229],[232,253]])K.slab(rect(a,16.7,b,22),3.6,{mat:0xe6dcb4,thick:.12,walk:false,under:0xe9e5db});
    K.slab(rect(150,16.7,168,30),4.2,{mat:0xe3dfd5,thick:.2,under:0xece9e2});
    lwall(168,16.7,168,30,4.4,7.3,{mat:{tex:'gb_door_glass',color:0x333934},thick:.04});
    lbox(168.05,23.35,3.6,.3,13.3,.8,0xf1efea,{solid:false});
    lsign('HOLLYS COFFEE',168.13,23.35,6.4,9.8,.65,'+u',{bg:null,fg:'#fff'});
    lsign('FOOD STATION  2F',168.23,23.35,4.02,9.4,.6,'+u',{bg:null,fg:'#e5332a'});
    for(const [i,t]of ['HOLLYS COFFEE','LEMON','시래마을','군산오징어','샤브촌','dolly 9'].entries())lsign(t,168.26,18+i*2.05,3.35,1.9,.35,'+u',{bg:'#fff',fg:'#46484a'});
    lstairs(177,20.9,169,20.9,{ya:0,yb:4.2,w:1.6,steps:25,mat:0xc6c4bc,rails:true});
    // Roof of the steel hall is pitched; transverse trusses/ducts remain from the moved assembly.
    for(const [va,vb,ya,yb]of [[16.7,23.35,8,9],[23.35,30,9,8]]){
      const q=(u,v,y)=>{const[x,z]=W(u,v);return[x,y,z];};K.quad(0xcbd0cf,[q(118,va,ya),q(140,va,ya),q(140,vb,yb),q(118,vb,yb)],[0,-1,0]);
      for(let u=118;u<140;u+=.4){const a=W(u,va),b=W(u,vb);K.quad(0x939b9a,[[a[0],ya-.03,a[1]],[a[0]+.025,ya-.03,a[1]],[b[0]+.025,yb-.03,b[1]],[b[0],yb-.03,b[1]]],[0,-1,0]);}
    }
    lesc(123,17.2,136,17.2,{ya:0,yb:4.2,w:1.1,dir:'up'});
    // Structural door at the wheelchair bus lounge, clear centre at v26.5.
    lwall(103,23,103,30,0,3.5,{mat:doorGlass,thick:.04,openings:[{at:3.5,w:1.8,y0:0,y1:2.6}]});
    for(let v=23;v<=30;v+=1.2)if(Math.abs(v-26.5)>1)lbox(103,v,0,.08,.07,3.5,0xaab4b8,{solid:false});
    lsign('휠체어 버스 탑승',103.1,26.5,2.85,2.4,.45,'+u',{bg:'#e3d6bc',fg:'#373a38'});
    ldetail({floor:'1F',y0:-6,y1:11,poly:P,name:'20차 사진 보행 · 대합실 가구와 마감'},()=>{
      for(let u=169;u<258;u+=1.2)for(let v=18;v<30;v+=1.2)lcyl(u,v,7.25,.075,.025,'emit',{seg:8,solid:false});
      for(const [a,b,c,d,y] of [[258,280,8,29,3.75],[77,118,18,22,3.44]])for(let u=a+1;u<b;u+=4)for(let v=c;v<d;v+=5){for(const dv of [-.07,.07])lbox(u,v+dv,y,1.2,.045,.025,'emit',{solid:false});lbox(u+.7,v,y+.01,.7,.7,.03,0xd7d8d4,{solid:false});}
      const couch=(u,v,w,color)=>{lbox(u,v,.12,w,1.2,.1,0xa9adae,{solid:false});lbox(u,v,.22,w,1.2,.25,color);lbox(u,v+.48,.47,w,.22,.48,color,{solid:false});for(const du of [-w/2,w/2]){const[x,z]=W(u+du,v);K.dome({x,z,y:.47,rx:.5,ry:.25,rz:.6,mat:color,seg:12,rings:3});}};
      for(const [i,u]of [111,145,181,207,235,269].entries()){couch(u,28.3,u===111?4:6.5,i%2?0x6a2a55:0x2a3a8c);for(let j=-2;j<=2;j++)lperson(u+j,28.1,.02,{sit:true,shirt:[0x343b47,0xb2a99d,0x645756][(j+3)%3]});}
      couch(113.2,24.5,3,0x6a2a55);
      for(let i=1;i<northScreens.length;i++){
        const a=northScreens[i-1].u+1.4,b=northScreens[i].u-1.4;if(b-a<.2)continue;
        lwall(a,30.13,b,30.13,.1,3.3,{mat:doorGlass,thick:.035});
        for(let u=a;u<=b;u+=1.2)lbox(u,30.08,.1,.055,.07,3.2,0xb8bcbc,{solid:false});
        for(const y of [.12,2.3,3.26])lbox((a+b)/2,30.08,y,b-a,.07,.055,0xb8bcbc,{solid:false});
        if(i%3===0)lsign('운행 안내',a-.55,29.85,3.25,1,.6,'-v',{bg:'#162d44',fg:'#e8eff3'});
      }
      for(const b of northScreens){
        lsign([b.dest||'승차홈',String(b.n)],b.u+1.6,29.81,2.75,.9,.8,'-v',{bg:'#f4f4f0',fg:'#1e1e1e',box:.04,boxMat:0x9c9e9e});
        lbox(b.u,31,2.7,.8,.6,.6,0xf4f4f0,{solid:false});for(const y of [2.64,3.3])lbox(b.u,31,y,.86,.66,.07,0xe3b48c,{solid:false});
        lsign([String(b.n),b.dest||'승차홈'],b.u,31.32,3.02,.7,.5,'+v',{bg:null,fg:'#242626'});
      }
      // The photo pod reuses the same detailed ticket-terminal constructor pattern.
      rbox(163,17,169,19.3,0,3,0xf0f0ed);lsign('Ⓣ TICKETS 무인발권기',166,19.46,2.65,5.4,.38,'+v',{bg:null,fg:'#5f6262'});
      for(let k=0;k<5;k++){const u=163.65+k*1.15;lbox(u,19.45,0,.64,.55,1.8,0xf0f1ee);lsign(['승차권 예매','경부선 · 영동선'],u,19.75,1.25,.48,.65,'+v',{bg:'#92bcde',fg:'#213f5b'});lbox(u,19.77,.61,.32,.025,.08,0x30383c,{solid:false});}
      for(const v of [21,26])for(const u of [121,127,133,139]){const[x,z]=W(u,v);K.dome({x,z,y:6.3,rx:.36,ry:.3,rz:.36,mat:0x6d7174,seg:12,rings:4});lcyl(u,v,6.28,.31,.03,{tex:'emit',color:0xf2d23a},{seg:16,solid:false});lbox(u,v,6.6,.025,.025,.9,0x656c70,{solid:false});}
      for(let u=118;u<140;u+=.32){const[x,z]=W(u,25);K.dome({x,z,y:6.7,rx:.2,ry:.3,rz:.3,mat:u%1>.5?0xb9c0c1:0xd0d4d4,seg:10,rings:3,hemi:false});}
      lbox(126,17.7,0,6,.15,2.8,0xf1f0eb,{solid:false});lsign('층별 안내',126,17.81,1.75,1.6,1.2,'+v',{bg:'#e8e7de',fg:'#424943'});
      for(const [u,t]of [[123.5,'샤브촌'],[128.5,'dolly 9']])lsign(t,u,17.82,1.65,.9,1.4,'+v',{bg:'#e7dfd4',fg:'#3a3c42'});
      lsign('emart24 / ZZANG GAMES',118.12,15.3,2.7,4.8,.55,'+u',{bg:'#4a4440',fg:'#ffcc34'});
      for(const u of [113.8,115,116.2]){lbox(u,11.15,0,.9,.7,1.8,0xc52a3b);lbox(u,11.53,.7,.8,.025,.9,doorGlass,{solid:false});}
      lbox(118.1,18.3,0,.16,1.1,3.3,'gb8_foliage',{solid:false});
      for(const [u,t]of [[85,'← 승차홈 1~16'],[105,'← 승차홈 1~16'],[158,'← 승차홈 1~16'],[96,'지하철 >']])lsign(t,u,u<118?19.6:25.2,2.6,3.2,.45,'+u',{bg:'#8d7c62',fg:'#fff',twoSided:true,box:.06});
      lsign('승차홈 11~16 ← | 승차홈 1~10 ↑',58,48,2.6,3.6,.45,'-v',{bg:'#8d7c62',fg:'#fff',twoSided:true});
      lsign('B1 식당가 | 쇼핑',48.3,70,2.65,4,.6,'+u',{bg:'#b59a60',fg:'#fff'});
      lsign('신세계백화점 · 지하철 >',48.3,64.6,2.1,3.8,.45,'+u',{bg:null,fg:'#5d605e'});
      lbox(47,62,.25,.24,4,4.5,'gb20_art',{solid:false});lbox(47.4,62,.42,.06,4.2,.06,0xb5bebf,{solid:false});
      lcyl(52,56,0,1.5,1.05,0xeee9df,{seg:24});for(let k=0;k<32;k++){const a=k*PI/16;lbox(52+1.48*Math.cos(a),56+1.48*Math.sin(a),1.05,.06,.06,1.6,0x1e1e1e,{solid:false});}lsign('Lotto',53.55,56,2.5,1.8,.4,'+u',{bg:'#1e1e1e',fg:'#fff'});
      lbox(52.5,28.8,0,1.2,2.8,1,0xeeeade);lsign('짐캐리',53.13,28.8,1.5,2.3,.45,'+u',{bg:'#f5ce33',fg:'#292d30'});
      lbox(61.5,29.5,0,.6,1.2,2.1,0x24364d);lsign('종합관광안내',61.17,29.5,1.5,1,.55,'-u',{bg:'#24364d',fg:'#fff'});
      lbox(70,29.3,0,3.4,1.5,1.1,{tex:'wood',color:0xcba577});lsign('i  종합안내',70,30.1,.7,2.7,.4,'+v',{bg:null,fg:'#fff'});
      for(let k=0;k<6;k++){const u=34+k*2;for(const v of [73,78])lperson(u,v,-6+(u-32)/15*6+.05,{sit:true,shirt:[0x313841,0xc3b796,0x5e6c4f][k%3]});}
      rbox(258.3,19,260.3,20.5,0,1,0xc49a6c);for(let u=258.3;u<260.3;u+=.12)lbox(u,20.52,0,.045,.04,2.5,0xc49a6c,{solid:false});lsign('복권 · 담배',259.3,20.6,2.7,1.9,.35,'+v',{bg:'#4f4235',fg:'#fff'});
      lbox(264,29.3,0,.75,.4,2.1,0x1f2425);lsign('도착 안내',264,29.05,1.5,.6,1,'-v',{bg:'#213b52',fg:'#d8efff'});lsign('11:58',268,29.55,3.2,1.1,.4,'-v',{bg:'#252424',fg:'#ff3a30'});
      for(let k=0;k<4;k++)for(let row=0;row<3;row++){lbox(231.65,12+k*.65,.2+row*.55,.55,.6,.5,0x9d9e99);lsign(String(1+k+row*4),231.34,12+k*.65,.45+row*.55,.3,.2,'-u',{bg:'#d7d8d3',fg:'#333'});}
      lbox(249,21.9,.3,1.5,.12,2.5,0xd6d7d2,{solid:false});for(let y=.4;y<2.8;y+=.065)lbox(249,22.02,y,1.4,.03,.022,0x8d918b,{solid:false});lsign('층별 안내',252,22.03,1.7,1.5,1.1,'+v',{bg:'#eceade',fg:'#4c504c'});
      lsign('UNIQLO ↑',103,19.7,2.95,1.7,.65,'+u',{bg:'#f2f1eb',fg:'#d82430'});
      for(let k=0;k<5;k++)lsign('서울고속버스터미널',80+k*4,22.52,1.65,1.1,1.9,'-v',{bg:k%2?'#233e5a':'#873b4c',fg:'#fff'});
      // #24 and #28: shared-bank ATM alcove, phone charger and 2F dining standee.
      rbox(164,28.6,167.2,29.6,0,2.3,0xd5d6d2);
      lsign('은행공동365',165.6,28.53,2.08,2.8,.35,'-v',{bg:'#566b8b',fg:'#fff'});
      for(const u of [164.8,166.35]){lbox(u,28.48,.1,.95,.35,1.72,0xe8e9e5);lsign('현금자동입출금',u,28.27,1.35,.7,.5,'-v',{bg:'#9bbdc9',fg:'#23434f'});lbox(u,28.24,.75,.5,.04,.09,0x353c3e,{solid:false});}
      lbox(167.8,29,0,.6,.5,1.9,0xefefeb);lsign('완충e',168.12,29,1.55,.45,.35,'+u',{bg:'#51896a',fg:'#fff'});
      lsign('식당가 안내',123.1,19,1.0,.6,1.7,'+u',{bg:'#5a3a2a',fg:'#fff',box:.06});
      // Oak caps and bright steel undercladding frame the paired escalator banks.
      for(const v of [71.8,79.85])for(let k=0;k<15;k++){
        const u=32+k,y=-6+k*.4;lbox(u+.5,v,y+.75,1,.1,.34,0x262a2d,{solid:false});lbox(u+.5,v,y+1.09,1,.2,.12,0xc9a26b,{solid:false});
      }
      for(const v of [68.8,71,80.8,82.5])for(let k=0;k<15;k++)lbox(32.5+k,v,-6+k*.4-.2,1,1.2,.16,0xb9bcbe,{solid:false});
      for(let v=67.5;v<83.6;v+=.3)lbox(47.05,v,.035,.15,.15,.035,Math.round(v*10)%2?0xf0c832:0x242625,{solid:false});
      lbox(48.3,82,.2,.25,3,5,0x1c3b7a,{solid:false});lsign('서울고속버스터미널',48.13,82,3.2,2.8,3.7,'-u',{bg:'#146ec2',fg:'#e4efff'});
      // S-shaped cove and the wide backlit oval now follow the actual main walkway.
      const oval=(rx,rz,y)=>Array.from({length:64},(_,k)=>{const a=k*PI/32,[x,z]=W(58+rx*Math.cos(a),58+rz*Math.sin(a));return[x,y,z];});
      const outer=oval(3.8,8.8,4.6),inner=oval(3.2,8.2,4.6),lit=oval(3.08,8.08,4.61);
      K.hpoly('emit',lit.map(([x,y,z])=>[x,z]),4.72,false);
      for(let k=0;k<64;k++){const j=(k+1)%64;K.quad(0xf5f3eb,[outer[k],outer[j],inner[j],inner[k]],[0,-1,0]);K.quad('emit',[inner[k],inner[j],lit[j],lit[k]],[0,-1,0]);}
      const ribbon=(t,side,y)=>{const[x,z]=W(58+1.8*Math.sin(t*PI*2)+side,27+t*6);return[x,y,z];};
      for(let k=0;k<40;k++)for(const [a,b,y,mat]of [[-.3,.3,4.6,0xf4f2e9],[-.19,.19,4.585,'emit']])K.quad(mat,[ribbon(k/40,a,y),ribbon((k+1)/40,a,y),ribbon((k+1)/40,b,y),ribbon(k/40,b,y)],[0,-1,0]);
      lbox(56,29,0,2.6,1,1.05,0xf1efe8);for(const u of [54.7,57.3])lcyl(u,29,0,.5,1.05,0xf1efe8,{seg:24});lsign('안내',56,29.53,.7,1.6,.35,'+v',{bg:null,fg:'#555b59'});
      // Photo-specific food pavilion skins retain all the existing counter/stock internals.
      for(let y=2.75;y<3.5;y+=.12)lbox(138,22.1,y,10,.06,.075,0x9a6a45,{solid:false});
      lsign('FLAME GRILLING SINCE 1954',138,22.19,2.65,9.7,.25,'+v',{bg:'#c8102e',fg:'#fff'});
      for(const u of [135,138,141]){lbox(u,20,.15,1.7,.8,.55,0xd87b39);lbox(u,20.35,.7,1.7,.18,.45,0xd87b39,{solid:false});}
      for(let k=0;k<8;k++)lsign('북촌손만두',232.6+k*.9,22.15,2.25,.65,.6,'+v',{bg:'#d23a3a',fg:'#fff'});
      lsign('찐만두 · 튀김만두 · 냉면',236,22.17,2.85,7.4,.4,'+v',{bg:'#fff1d7',fg:'#453d36'});
      for(let k=0;k<12;k++){const u=222+k*.58,h=.6-Math.abs(u-225.5)*.13;lbox(u,22.08,3.3,.6,.8,Math.max(.1,h),0xe9b43a,{solid:false});}
      lsign('YOSYOKU 요쇼쿠',204.5,22.18,2.9,4.6,.5,'+v',{bg:'#3e352c',fg:'#ffe552'});
      for(const [a,b]of [[202,207],[222,229],[232,240]])for(let u=a+.6;u<b;u+=1.2){lcyl(u,22.8,.05,.25,.05,0xb5bdbe,{seg:12,solid:false});lcyl(u,22.8,.1,.035,.63,0xb5bdbe,{seg:8,solid:false});lcyl(u,22.8,.73,.23,.08,a===202?0xeccc24:0xaeb5b5,{seg:12});}
    });
    for(let k=0;k<7;k++){
      const u=235+k*5,v=k%2?-34:-45;
      lquadH(u-1,v-.3,u+1,v+.3,.028,0x4aa8e0);
      const p=[[u+1.5,v],[u+.5,v-.9],[u+.5,v+.9]].map(q=>W(...q));K.hpoly(0x4aa8e0,p,.029);
    }
    K.cyl({x:224,z:-188,y:0,r:.07,h:4,mat:0x8c9498,seg:8});
    K.sign('P',{x:224,z:-188,y:3.6,w:.8,h:.8,rotY:PI,bg:'#2875b5',fg:'#fff'});
    K.sign('주차 가능',{x:224,z:-188.03,y:2.8,w:1.2,h:.5,rotY:PI,bg:'#181e21',fg:'#5cdb7a'});
    // The photographed grove and smoking booth stay clear of the shared street works.
    for(const [x,z,h,kind] of [[206,-181,11,'ginkgo'],[213,-177,11,'ginkgo'],[216,-167,10.5,'ginkgo'],[208,-164,11,'ginkgo'],[207,-172,16,'zelkova'],[216,-184,15,'zelkova']])K.tree(x,z,{h,kind});
    K.box({x:241,z:-167,y:0,w:4,d:3,h:.2,mat:0xb1b2ac});
    K.polyWalls([[239,-168.5],[243,-168.5],[243,-165.5],[239,-165.5]],.2,2.6,{mat:'glass',thick:.04,openings:[{x:241,z:-168.5,w:1.3,y0:.2,y1:2.3}]});
    K.box({x:241,z:-167,y:2.6,w:4.2,d:3.2,h:.18,mat:0x555e63});K.sign('KT&G SMOKING AREA 흡연구역',{x:241,y:2.3,z:-168.55,w:3.8,h:.4,rotY:PI,bg:'#343f45',fg:'#fff'});
    for(let k=0;k<6;k++){const x=238.5+k*.85;for(const z of [-171,-172.1]){K.dome({x,z,y:.35,rx:.32,ry:.32,rz:.055,mat:0x6baf36,hemi:false,seg:12,rings:4});}K.box({x,z:-171.55,y:.38,w:.06,d:1.2,h:.06,mat:0xf0f0e5,solid:false});K.box({x,z:-171.2,y:.35,w:.055,d:.055,h:.6,mat:0xf0f0e5,solid:false});}
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
      const a=name==='할리스커피'?150:name==='시래마을'?168:i===1?208:130+i*13,b=a+(name==='할리스커피'?18:13);
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
        const a=name==='할리스커피'?150:name==='시래마을'?168:i===1?208:130+i*13,u=a+(name==='할리스커피'?9:6.5),y=NORTH_2F;
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
    // Round 20: the approved private photo walk defines this public B1 plan.
    const y=LEVELS.B1, poly=[[0,0],[137.5,0],[137.5,30],[75.7,30],[75.7,159],[0,159]].map(q=>W(...q));
    K.texture('gb_b1_granite',128,128,(g,w,h)=>{g.fillStyle='#b8b6b1';g.fillRect(0,0,w,h);const r=K.rand(1818);for(let i=0;i<1900;i++){g.fillStyle=i%3?'#d0cec6':'#8c8b84';g.fillRect(r()*w,r()*h,1,1);}g.fillStyle='#92918d';g.fillRect(0,0,w,1);g.fillRect(0,0,1,h);},[.6,.6]);
    K.texture('gb8_b1_stone',128,128,(g,w,h)=>{g.fillStyle='#b9b6ad';g.fillRect(0,0,w,h);const r=K.rand(8034);for(let i=0;i<2100;i++){g.fillStyle=i%3?'#d3d0c8':'#929087';g.fillRect(r()*w,r()*h,1,1);}},[.6,.6]);
    K.texture('gb20_b1_porcelain',128,256,(g,w,h)=>{g.fillStyle='#e4e2dd';g.fillRect(0,0,w,h);g.fillStyle='#bebdb7';g.fillRect(0,0,1,h);g.fillRect(0,0,w,1);},[.6,1.2]);
    K.texture('gb20_mesh',64,64,(g,w,h)=>{g.fillStyle='#414343';g.fillRect(0,0,w,h);g.strokeStyle='#171b1b';g.lineWidth=2;for(let i=-64;i<128;i+=12){g.beginPath();g.moveTo(i,0);g.lineTo(i+64,64);g.stroke();g.beginPath();g.moveTo(i,0);g.lineTo(i-64,64);g.stroke();}},[.42,.42]);
    K.texture('gb20_b1_ad',256,256,(g,w,h)=>{const a=g.createLinearGradient(0,0,w,h);a.addColorStop(0,'#ff48b7');a.addColorStop(.5,'#8d4ce2');a.addColorStop(1,'#164bba');g.fillStyle=a;g.fillRect(0,0,w,h);g.fillStyle='#ffd3ee';for(let i=0;i<8;i++){g.beginPath();g.arc(35+i*29,60+(i%3)*60,22,0,PI*2);g.fill();}g.font='bold 26px sans-serif';g.fillStyle='#fff';g.fillText('오늘의 즐거움',36,225);},[3,3]);
    const tile={tex:'gb20_b1_porcelain',gloss:.5};
    K.slab(poly,y,{mat:tile,under:false,holes:holes(poly,y)});
    const j=W(125.9,0),west=W(0,88),east=W(137.5,9.5);
    K.polyWalls(poly,y,-.3,{mat:0xe8e6df,thick:.25,openings:[{x:j[0],z:j[1],w:8.8,y0:y,y1:y+3.6},{x:west[0],z:west[1],w:8,y0:y,y1:y+3.1},{x:east[0],z:east[1],w:5.2,y0:y,y1:y+3.1}]});
    // Smooth plaster follows the actual diagonal, independent of the rectangular shop grid.
    const diagonal=[[44.5,36],[64.5,10],[71.5,14],[51.5,40]].map(q=>W(...q));
    const cove=Array.from({length:48},(_,k)=>W(10+6*Math.cos(k*PI/24),90+3*Math.sin(k*PI/24)));
    K.hpoly('gb_acoustic',poly,y+2.85,false,[...holes(poly,0),diagonal,cove]);
    K.hpoly(0xf1f0eb,diagonal,y+3.12,false);K.hpoly(0xf4f2ee,cove,y+3.2,false);
    // The west connection stays open: the station job owns the hall beyond it.
    K.slab(rect(-2,84,0,92),y,{mat:{tex:'marble',color:0xc9ceca,gloss:.5},under:false});
    for(const v of [84,92]){lbox(-.32,v,y,1.3,.12,2.6,0xc8d0cb);for(let h=.45;h<2.6;h+=.5)lbox(-.32,v-.075,y+h,1.2,.03,.025,0x9daaa7,{solid:false});}
    lbox(0,88,y+2.75,.23,8,.27,0xadb5b7,{solid:false});lbox(-.15,88,y+2.85,.03,8,.07,0xa33a62,{solid:false});lbox(-.15,88,y+2.76,.03,8,.07,0x1f5c96,{solid:false});
    // J2 keeps its exact shared world footprint and -6 m datum.
    const zG=x=>-152.37-.3733*(x-107.2)-.3,zF=x=>-59.24-.37993*(x-2.3),cp=[[116,zG(116)],[124,zG(124)],[124,zF(124)],[116,zF(116)]];
    K.slab(cp,y,{mat:'gb_b1_granite',under:false});K.hpoly('gb_acoustic',cp,y+3.6,false);
    for(const x of [116,124])K.wall(x,zG(x),x,zF(x),y,y+3.6,{mat:0xe4e0d6,thick:.22});
    K.zone({name:'터미널 지하상가',floor:'B1',sub:'식당가 · 한가람 · 지하철 연결',poly,y0:y,y1:0,priority:1});
    K.zone({name:'고투몰 ↔ 경부선 연결통로',floor:'B1',sub:'지하철 연결',poly:cp,y0:y,y1:y+3.6,priority:3});
    for(const u of [121.8,130])lbox(u,.14,y,.45,.4,3.05,0x2e3033);
    lbox(125.9,.14,y+2.68,8.65,.4,.38,0x2e3033,{solid:false});
    // Non-solid glass door leaves are held at the sides of the eight-metre J2 connection.
    for(const u of [122.65,129.15])lbox(u,-.35,y,1.1,.045,2.55,doorGlass,{solid:false});
    K.hpoly({tex:'wood',color:0x5a4636,gloss:.5},rect(121.7,.2,130,2.8),y+.018);
    // The former u103..111 cross-corridor core is rotated into the south side bay.
    for(const v of [13.2,14.8])lesc(103,v,115,v,{ya:y,yb:0,w:1.1,dir:v<14?'up':'down'});
    lstairs(103,16.2,115,16.2,{ya:y,yb:0,w:1.65,steps:36,mat:0xbcb5a7,rails:true});
    for(const v of [12.2,17.2])lwall(103,v,115,v,y,1.05,{mat:0xc6bda9,thick:.12});
    lzone('대합실 연결 계단','B1','경부선 · 영동선',102.5,12,116,17.3,y,0,4);
    // The 8 down / 11 up stair counts are observed. The remaining +1.46 m datum
    // adjustment is an inferred shallow grade in the jewelry approach, not a surveyed slope.
    lstairs(137.5,9.5,140.5,9.5,{ya:y,yb:-7.44,w:5,steps:8,mat:'gb_b1_granite',rails:true});
    K.slab(rect(140.5,7,148,12),-7.44,{mat:{tex:'gb_b1_granite',gloss:.7},under:false});
    lstairs(148,9.5,152,9.5,{ya:-7.44,yb:-5.46,w:5,steps:11,mat:'gb_b1_granite',rails:true});
    lramp(152,13,170,13,{ya:-5.46,yb:-4,w:22,mat:{color:0xf3f3f1,gloss:.7}});
    for(const v of [7,12])lwall(137.5,v,152,v,-7.5,-2.6,{mat:0xf5f3f0,thick:.12});
    K.hpoly(0xf6f4f1,rect(137.5,7,152,12),-2.5,false);
    K.hpoly(0xf6f5f2,rect(152,2,170,24),-.9,false);
    lwall(152,2,170,2,-5.5,-.8,{mat:0xf7f6f2});lwall(152,24,170,24,-5.5,-.8,{mat:0xf7f6f2});
    lzone('다이소 연결 단차 통로','B1','계단주의',137.5,7,152,12,-7.5,-2.4,6);
    lzone('보석 · 잡화 · 다이소 입구','B1','진보석 · 수연 · 대림보석',152,2,170,24,-5.5,-.5,5);
    // Open store shells and all furniture are retained at their corrected addresses.
    buildRound10BasementRetail(poly,y);
    buildRound20B1Details(y,cove,diagonal);
    buildRound20Daiso();
  }

  function buildRound20B1Details(y,cove,diagonal){
    ldetail({floor:'B1',y0:-7.5,y1:0,poly:rect(-2,0,170,118),name:'사진 보행 B1 마감 · 안내 · 한가람 · 단차 · 보석'},()=>{
      // Main B1 tile rhythm, stone edge bands, tactile spines and square LED fittings.
      for(const r of [[9,46,10,84],[14.5,46,15.5,84],[21,46,22.1,80],[0,94,28,95],[0,40,49,41]])K.hpoly({color:0x6c6d6f,gloss:.5},rect(...r),y+.02);
      for(const r of [[24.6,44,24.9,88],[0,87.8,30,88.1],[11.9,42,12.2,84],[12,43.8,51,44.1],[66,8.8,137.5,9.1]])K.hpoly('gb_tactile',rect(...r),y+.023);
      for(let u=3;u<46;u+=3.6)for(let v=35;v<116;v+=3.6){if(u>29&&v>66&&v<84)continue;for(const du of [-.14,.14])for(const dv of [-.14,.14])lbox(u+du,v+dv,y+2.81,.22,.22,.025,'emit',{solid:false});}
      for(let u=0;u<45;u+=.6)K.hpoly(0xc9c9c3,rect(u,33,u+.012,118),y+2.84,false);
      for(let v=33;v<118;v+=.6)K.hpoly(0xc9c9c3,rect(0,v,45,v+.012),y+2.84,false);
      for(let k=0;k<48;k++){const a=k*PI/24,b=(k+1)*PI/24;const p=(r,s,t,h)=>{const[x,z]=W(10+r*Math.cos(t),90+s*Math.sin(t));return[x,y+h,z];};K.quad('emit',[p(6,3,a,2.85),p(6,3,b,2.85),p(6,3,b,3.15),p(6,3,a,3.15)],[0,-1,0]);}
      // LED wall is on the island's east face, directly opposite the descending escalator.
      lbox(21.04,69.5,y+.4,.18,7.3,2.6,0x171b1e,{solid:false});lwall(21.15,66,21.15,73,y+.45,y+2.95,{mat:'gb20_b1_ad',thick:.025,solid:false});
      for(const v of [66,68,70,72,73])lcyl(21.7,v,y,.04,.5,0xb7bdc0,{seg:8,solid:false});lbox(21.7,69.5,y+.48,.06,7,.055,0xc8cccf,{solid:false});
      for(const [u,v] of [[22.5,78.2],[23,91.5]]){lbox(u,v,y,1.7,1.7,2.82,'gb20_b1_ad');lbox(u,v,y+2.75,1.76,1.76,.1,0x161c23,{solid:false});}
      K.hpoly({tex:'wood',color:0xcfb48a,gloss:.5},rect(29.8,67,32.2,83.8),y+.025);
      for(const [t,u,v,w,face,bg] of [['B1 식당가 | 쇼핑  ◉',22.3,69.5,4.5,'+u','#6f5a47'],['← 경부선 · 영동선 | ◉ 호남선 →',25,76.5,6,'+v','#b29191'],['호남선 (신세계 센트럴시티) ↑',12,86,5,'+u','#6f5a47'],['화장실  ·  엘리베이터  →',30,44,4.5,'-u','#6f5a47'],['← 지하철  |  제로데이 택배 ↑',66,9,5,'-u','#6f5a47'],['↑ 지하상가  |  제로데이 택배 · 영동선 →',89,9,5,'-u','#6f5a47'],['호남선 | 지하철 지하상가 ↑',125,9,5,'-u','#6f5a47'],['← 경부선 · 영동선 | 호남선 ◉ 지하상가',125.9,1,7,'+v','#6f5a47']])lsign(t,u,v,y+2.35,w,.48,face,{bg,fg:'#fff',twoSided:true});
      for(const [u,v,arrow] of [[29,47.5,'←'],[48,39,'→']]){lbox(u,v,y,.09,1.1,1.25,0x554536,{solid:false});lsign([arrow,'빌엘수선실 · 에디슨','다모와토토 · 한가람 · 다이소'],u-.07,v,y+.8,1.05,.85,'-u',{bg:'#6f5a47',fg:'#fff'});}
      lsign('BAG’S',29.5,49,y+1.7,1.4,.4,'-v',{bg:'#302b26',fg:'#fff'});for(let k=0;k<4;k++)lbox(28.8+k*.5,49.6,y,.38,.28,.65,0x6a5546,{solid:false});
      lbox(43.6,36.8,y,.7,.35,1.5,0xe5e4de);lsign('방수기구함',43.6,37,y+1,.6,.5,'+v',{bg:'#fff',fg:'#c32e33'});lcyl(44.2,36.7,y,.12,2.9,0xb92d2d,{solid:false});
      // Diagonal shopfront ceiling and round leather seats leave a continuous 7.5 m route.
      for(let k=0;k<9;k++){const u=48+k*2.2,v=38-k*2.85;lcyl(u,v,y+3.08,.08,.025,'emit',{solid:false,seg:10});}
      lwall(46,37,66,11,y+3.07,y+3.105,{mat:'emit',thick:.08,solid:false});
      for(const [u,v] of [[51.8,32.8],[53.8,30.3],[55.9,27.7]])lcyl(u,v,y,.9,.45,{color:0x252326,gloss:.3},{seg:20});
      // HanGaram: both sides, oak window frames, grey hoardings and maroon fascias.
      for(const [side,fv] of [['n',6.4],['s',12.8]])for(let u=70;u<122;u+=6.5){if(side==='n'&&u<81&&u+6.5>76||side==='s'&&u<116&&u+6.5>102.5)continue;
        const face=side==='n'?'+v':'-v',out=side==='n'?1:-1;
        lbox(u+3.2,fv,y+2.35,6.4,.25,.5,0x5a1a28,{solid:false});lsign('한가람문구',u+3.2,fv+out*.16,y+2.59,3.8,.3,face,{bg:null,fg:'#fff'});
        const hoard=side==='n'&&Math.round(u)%2===0;
        lbox(u+3.2,fv,y,6.25,.07,2.35,hoard?0x8f9193:doorGlass,{solid:false});
        for(let x=u;x<u+6.5;x+=1.3)lbox(x,fv,y,.055,.12,2.35,0xc8a26a,{solid:false});
        lbox(u+3.2,fv+out*.06,y+1.05,6.25,.02,.18,0xf3eee5,{solid:false});
        if(hoard)lsign('한가람',u+3.2,fv+out*.08,y+1.14,1.1,.16,face,{bg:null,fg:'#572c35'});
        else{lbox(u+3.2,fv-out*.6,y,5.8,.5,2.05,0xe4dfcf,{side:'gb_shelf'});lbox(u+3.2,fv-out*.42,y+2.2,5.8,.08,.04,'emit',{solid:false});}
        if(Math.round(u)%3===1)lsign(['한가람','미술재료 · 생활 속 예술'],u+3.2,fv+out*.16,y+2.57,2,.4,face,{bg:'#e4eff6',fg:'#3f535f'});
      }
      // Retained photographed rotating stationery fixture and green delivery crate,
      // translated from the old far-east HanGaram frontage into the corrected row.
      lcyl(98.2,7.05,y+.1,.22,1.48,0x75736b,{solid:false,seg:8});
      for(let h=.3;h<1.6;h+=.25)for(let k=0;k<8;k++)lbox(98.2+.28*Math.cos(k*PI/4),7.05+.28*Math.sin(k*PI/4),y+h,.16,.09,.2,0xe2d5c6,{rot:-k*PI/4,solid:false});
      lbox(100.3,6.85,y,.72,.46,.32,0x235a42,{solid:false});
      // Earlier currency kiosks and the route directory stay with the moved side-bay core.
      for(const [v,col] of [[18.2,0xef762d],[19.2,0x233c6b]]){lbox(102,v,y,.55,.6,1.9,col);lbox(101.71,v,y+.85,.03,.4,.42,0x99b8ca,{solid:false});lsign(['환전','안내'],101.69,v,y+1.55,.45,.45,'-u',{bg:'#243c68',fg:'#fff'});}
      lsign('WOWPASS',101.68,18.2,y+1.78,.48,.16,'-u',{bg:'#243c68',fg:'#fff'});
      lsign(['고속버스터미널 ↑','경부선 · 영동선','부산 · 대구 · 대전 · 청주'],102.4,20.6,y+1.9,2.2,.9,'-u',{bg:'#f5f3ee',fg:'#263f72'});
      for(const [u,t] of [[95,'맞춤액자'],[98,'출력센터 Printing']])lsign(t,u,11.4,y+2.18,1.3,.35,'-u',{bg:'#171c23',fg:'#fff',twoSided:true});
      lsign('WARHAMMER',70.4,11.4,y+1.5,1.5,.6,'-v',{bg:'#282421',fg:'#e6d5a0'});
      for(const u of [76,81])lwall(u,0,u,6.4,y,y+2.85,{mat:u===81?doorGlass:0x959799,thick:.06});
      K.hpoly({tex:'gb_b1_granite',gloss:.7},rect(76,0,81,6.4),y+.02);lsign('미대오빠',78.5,.3,y+2.4,3.5,.4,'+v',{bg:'#55473c',fg:'#fff'});
      for(let u=68;u<137;u+=3.6)for(const v of [7.5,10.5])for(const dv of [-.1,.1])lbox(u,v+dv,y+2.8,1.15,.04,.025,'emit',{solid:false});
      for(const v of [6.5,11.4])K.hpoly(0x6c6d6f,rect(66,v,137.5,v+.55),y+.018);
      lbox(90,12.2,y,.6,.4,1.55,0xf7f6f0);lsign(['AED','자동심장충격기'],90,11.98,y+1.2,.5,.45,'-v',{bg:'#f5f5ef',fg:'#c83b3b'});
      // West side dip: granite, pink inlays, red warning bands, rings and stepped flowers.
      K.hpoly({color:0xa9776a,gloss:.7},rect(140.5,8.4,148,10.6),-7.42);
      for(let u=141;u<148;u+=1.2){K.hpoly(0xa9776a,rect(u,7,u+.07,12),-7.415);K.hpoly(0x2a2a2a,rect(u+.12,7,u+.15,12),-7.414);}
      for(const [a,b,ya,yb,n] of [[137.5,140.5,-6,-7.44,8],[148,152,-7.44,-5.46,11]])for(let k=1;k<=n;k++){const u=a+(b-a)*k/n,yy=ya+(yb-ya)*k/n;K.hpoly(0x252525,rect(u-.07,7,u,12),yy+.012);}
      for(const u of [137.45,152.05])lfloorText('계단주의',u,9.5,u<140?-5.976:-5.43,1.05,2.3,'+u',{fg:'#fff',bg:'#c91e30'});
      lbox(137.9,9.5,-3.4,.8,5,.8,0xe6e6e1,{solid:false});lsign('daiso 다이소',137.3,9.5,-3.45,4.5,.55,'-u',{bg:'#fff',fg:'#c8102e'});
      for(const v of [7,12]){lbox(137.45,v,-6,.3,.3,2.6,0xc8102e);lbox(137.45,v,-6,.32,.32,.35,0xf3f1ec,{solid:false});}
      for(const u of [141.5,145.5,150])for(const v of [7.09,11.91]){lsign('○',u,v,-5.3,1.7,1.7,v<9?'+v':'-v',{bg:null,fg:'#cf1f2e',pxPerM:100});}
      for(let k=0;k<8;k++){const u=148+k*.5,yy=-7.44+k*.18;lbox(u,6.5,yy,.55,1.2,.5,0x242625);for(let j=0;j<4;j++)lcyl(u+(j%2)*.16,6.2+Math.floor(j/2)*.4,yy+.5,.18,.35,[0xb2c578,0xedc4ca,0xeae8d7][j%3],{solid:false,seg:6});}
      // Jewelry corridor: height follows the explicitly inferred shallow datum grade.
      const jy=u=>-5.46+(u-152)*1.46/18;
      for(const u of [155,159,163]){const yy=jy(u);lbox(u,12,yy,1.2,1.2,3,{color:0xd4dcda,gloss:.8});lbox(u,12,yy,1.22,1.22,.13,0x9ba6a6,{solid:false});}
      for(const [i,n] of ['진보석','수연','대림보석','가챠샵'].entries()){const u=154+i*4,yy=jy(u);lbox(u,6,yy+2.3,3.8,.18,.5,0x292a2d,{solid:false});lsign(n,u,6.12,yy+2.55,3.2,.32,'+v',{bg:null,fg:'#fff'});lbox(u,5.6,yy,3.5,.7,.8,0xe6e2d8);lbox(u,5.6,yy+.8,3.5,.7,.45,doorGlass,{solid:false});for(let j=0;j<8;j++)lbox(u-1.4+j*.4,5.5,yy+.82,.18,.22,.08,0xead5a2,{solid:false});for(const du of [-1.1,.1,1.1]){lcyl(u+du,6.7,yy,.07,.5,0xc4c8c8,{solid:false});lcyl(u+du,6.7,yy+.5,.25,.09,0x8d364e,{seg:12});}}
      for(const u of [165.1,165.8,166.5,167.2]){const yy=jy(u);lbox(u,4.8,yy,.6,.6,1.45,0xf2eee3);lbox(u,4.8,yy+.85,.54,.56,.55,doorGlass,{solid:false});lcyl(u,5.13,yy+.55,.12,.06,0xccccca,{solid:false,seg:10});for(let k=0;k<6;k++)lcyl(u-.14+(k%2)*.28,4.7+Math.floor(k/2)*.1,yy+.91,.075,.12,[0xdb6a79,0x6fb7ca,0xe4cd60][k%3],{solid:false,seg:8});}
      for(const u of [157.3,158.2,159.1]){const yy=jy(u);lbox(u,4,yy+.12,.7,1.2,.08,0xaaa7a0);lbox(u,4,yy+1.55,.04,1.2,.04,0xc4c8c8,{solid:false});for(let k=0;k<7;k++)lbox(u,3.5+k*.16,yy+.5,.48,.12,.9,[0x282c37,0x65544b,0x838079][k%3],{solid:false});}
      for(const u of [157.6,158.6]){lbox(u,23.91,jy(158),.96,.05,2.45,0xe6e8e5,{solid:false});lbox(u+(u<158?.35:-.35),23.86,jy(158)+1.05,.025,.035,.3,0x929a9b,{solid:false});}
      for(let u=153;u<170;u+=2)for(const v of [7,10,17,22])lcyl(u,v,-.94,.07,.03,'emit',{seg:10,solid:false});
      lbox(160,12,-1.15,18,.38,.25,0xf7f6f3,{solid:false});for(let u=152;u<170;u+=.3)lbox(u,11.78,-1.09,.06,.025,.06,0x74767a,{solid:false});
      // Pink-lit vaulted soffit over the stalls; white hall and stair enclosure stay open.
      for(let k=0;k<10;k++){const v=2+k*.4,h=-1.1+Math.sin(k*PI/10)*.45;K.hpoly(k===9?{tex:'emit',color:0xcbb7e5}:0xf4f2f1,rect(152,v,170,v+.41),h,false);}
      for(const u of [164,168])lwall(u,11,u,15,jy(166),-.7,{mat:doorGlass,thick:.04,solid:false});lwall(164,15,168,15,jy(166),-.7,{mat:doorGlass,thick:.04,solid:false});
      for(const u of [164,168])for(const v of [11,15])lbox(u,v,jy(166),.07,.07,3.1,0x9ca0a6,{solid:false});
      lsign('↗ 승차홈 · 화장실 · 버스·택시',166,11,-1.1,3.7,.38,'-v',{bg:'#b29a78',fg:'#fff'});
      lsign(['안내','승차홈 · 다이소'],162,21,-2.4,1,.8,'-v',{bg:'#eae7df',fg:'#3d454d'});
      for(const [u,v] of [[25.8,58],[12.4,67],[7,89],[29.1,43.2],[57,25],[86,8.5],[118,9.5],[158,9]])lperson(u,v,u>152?jy(u):y,{shirt:0x45464e,pants:0x292d33,rotY:FACE['+u']});
    });
  }
  function buildRound10BasementRetail(poly,y){
    // Original detailed furnishings are moved as complete assemblies, including every
    // restaurant table, chair, menu, shelf, clothing rail and counter from earlier rounds.
    const units=[];
    const add=(name,no,old,r,face='+u',kind='food',angle=0)=>units.push({name,no,old,r,face,kind,angle});
    ['놀부부대찌개','홍수계찜닭','롤링핀','신촌설렁탕'].forEach((n,i)=>add(n,i+1,[4,126+i*7,17,133+i*7],[[0,95,8,118],[8,95,15,118],[15,95,22,118],[22,95,28,118]][i],'-v','food',-PI/2));
    ['오니기리 와이규동','보승회관','얼큰수제비','용호동낙지','북창동 순두부'].forEach((n,i)=>add(n,i+5,[4,70+i*10,22,80+i*10],[[0,76,10,83.5],[0,69,10,76],[0,65,10,69],[0,54,10,65],[0,46,10,54]][i]));
    ['서브웨이','신룽푸마라탕','퍼부어','오한수 우육면가','시마스시'].forEach((n,i)=>add(n,i+10,[31,70+i*10,43,80+i*10],[[14.5,78,20.4,84],[14.5,70,21,78],[14.5,63,21,70],[14.5,54,21,63],[14.5,46,21,54]][i],'-u'));
    add('빽스',15,[43,27,56,35],[33,47,41.5,62],'-u');add('나인블럭',16,[43,35,56,43],[41.5,47,50,62],'+u');
    add('포레포레헤어 · 웸블리',17,[58,135,74,156],[58,135,74,156],'-u','retail');add('펀비어킹',18,[58,112,74,135],[58,112,74,135],'-u');
    ['밥장인','전주콩나물','놀부주방'].forEach((n,i)=>add(n,i+20,[30,4+i*7,43,11+i*7],[[37,33,47.4,40.3],[22,33,30,40.3],[14,33,22,40.3]][i],'+v','food',-PI/2));
    add('노브랜드',23,[4,4,24,32],[0,4,29,33],'+v','market');
    // 24–26 belong behind the factory frontage, not in the diagonal pedestrian strip.
    ['입점 준비 중','이니스프리','네일&젤'].forEach((n,i)=>add(n,24+i,[58,3+i*6,74,9+i*6],[67,42+i*7,75,49+i*7],'-u','retail'));
    add('미대오빠',33,[80,.3,96,4.6],[76,-.01,81,2.5],'+v','retail');
    for(const [i,n] of ['에디슨','다모와토토','스포츠토토 · 담배'].entries())add(n,[40,39,39][i],[158+i*7.8,.3,165.8+i*7.8,4.6],[127+i*3,11.5,130+i*3,15],'-v','retail',PI);
    add('입점 준비 중','37·38',[100,9.4,102.5,21.5],[116,12,122,24],'-v','retail',PI/2);
    const transform=u=>{const a=u.old,b=u.r,turn=Math.abs(Math.sin(u.angle))>.9;return {from:[(a[0]+a[2])/2,(a[1]+a[3])/2],to:[(b[0]+b[2])/2,(b[1]+b[3])/2],angle:u.angle,sx:(turn?b[3]-b[1]:b[2]-b[0])/(a[2]-a[0]),sz:(turn?b[2]-b[0]:b[3]-b[1])/(a[3]-a[1])};};
    function shell(unit){const {name,no,r,face}=unit,[a,b,c,d]=r,fu=face==='+u'?c:face==='-u'?a:(a+c)/2,fv=face==='+v'?d:face==='-v'?b:(b+d)/2,span=face.endsWith('u')?d-b:c-a;
      for(const [u0,v0,u1,v1,side] of [[a,b,c,b,'-v'],[c,b,c,d,'+u'],[c,d,a,d,'+v'],[a,d,a,b,'-u']]){const open=face===side||(no>=10&&no<=14&&side==='+u')||(no===10&&side==='+v');lwall(u0,v0,u1,v1,y,y+2.8,{mat:open?doorGlass:0xe7e2d9,thick:open?.035:.13,openings:open?[{at:Math.hypot(u1-u0,v1-v0)/2,w:Math.min(2.4,span-1),y0:y,y1:y+2.45}]:[]});}
      lzone(name,'B1',`공식 ${no}호`,a,b,c,d,y,y+3.05,5);
      return {fu,fv,span};
    }
    for(const unit of units)shell(unit);
    // NoBrand's south-west arm and KB inset keep the T-junction fully open.
    lwall(0,40,9,40,y,y+2.8,{mat:doorGlass,thick:.04,openings:[{at:4.5,w:4,y0:y,y1:y+2.5}]});lwall(9,33,9,37,y,y+2.8,{mat:0xf1d330});lwall(14,33,14,41,y,y+2.8,{mat:0xf1d330});
    lwall(9,37,14,37,y,y+2.8,{mat:0xe9e5da});lzone('KB국민은행','B1','KB디지털뱅크 강남터미널점',9,37,14,41,y,y+2.85,6);
    // Factory enclosure: a diagonal NW face meets the west entrance at u51/v38.
    const factory=[[51,38],[73,13.5],[75.7,13.5],[75.7,80],[51,80]].map(q=>W(...q));
    K.polyWalls(factory,y,y+2.9,{mat:doorGlass,thick:.08,openings:[{x:W(51,42.5)[0],z:W(51,42.5)[1],w:9,y0:y,y1:y+2.5},{x:W(55,32.8)[0],z:W(55,32.8)[1],w:4,y0:y,y1:y+2.5}]});
    lwall(51,47,51,80,y,y+2.45,{mat:doorGlass,thick:.035});
    lwall(51,38,73,13.5,y,y+2.45,{mat:doorGlass,thick:.035,openings:[{at:6.4,w:4,y0:y,y1:y+2.5}]});
    K.zone({name:'신세계 팩토리 스토어',floor:'B1',sub:'의류 · 생활용품 · 식기',poly:factory,y0:y,y1:y+3.05,priority:5});
    // Diagonal NW-side units face SE. Their old detailed interiors rotate with them.
    const diagonal=[{name:'제주스커피',no:27,from:[66,24],to:[44.5,27.5],kind:'food'},{name:'EGGDROP',no:28,from:[66,30],to:[49.5,21],kind:'food'},{name:'이마트24 5호점',no:'29·30',from:[66,36],to:[54.5,14.5],kind:'retail'},{name:'입점 준비 중',no:31,from:[66,42],to:[59,8.5],kind:'retail'}];
    for(const d of diagonal)placeAssembly({from:d.from,to:d.to,angle:-2.486,sx:.65,sz:.83},()=>{const v=d.from[1];shell({name:d.name,no:d.no,r:[58,v-3,74,v+3],face:'-u'});});
    ldetail({floor:'B1',y0:y,y1:y+3.1,poly:rect(0,0,170,159),name:'이동 보존한 본관 식당가 · 팩토리 상품 · 부속상가'},()=>{
      const stock=(name,r,kind)=>{const[a,b,c,d]=r,uc=(a+c)/2,vc=(b+d)/2;
        if(name==='입점 준비 중')return;
        if(kind==='food'){
          for(let v=b+1.5;v<d-1;v+=2.7)for(let u=a+2;u<c-2;u+=3.5){lbox(u,v,y+.73,1.25,.8,.06,{tex:'wood',color:0xad825b});for(const du of [-.42,.42])lbox(u+du,v,y,.06,.6,.73,0x48423c,{solid:false});for(const dv of [-.75,.75]){lbox(u,v+dv,y+.42,.45,.42,.06,0x775a40);lbox(u,v+dv*1.2,y+.48,.45,.06,.38,0x775a40,{solid:false});}lbox(u+.2,v,y+.8,.17,.15,.12,0xe8e2d7,{solid:false});}
          lbox(uc,b+.8,y,c-a-1,.7,.95,0xc1ac8a);lsign(['메뉴 안내',name],uc,b+1.2,y+1.9,Math.min(c-a-1,5),.6,'+v',{bg:'#f4eee3',fg:'#46382f'});
        }else{lbox(uc,b+.5,y,c-a-.5,.5,2.05,0xe5dfcf,{side:'gb_shelf'});for(let v=b+2;v<d-1;v+=3)lbox(uc,v,y,.8,1.8,1.5,0xd7cfbd,{side:'gb_shelf'});}
        lbox(uc,vc,y+2.76,Math.min(c-a-1,3),.4,.03,'emit',{solid:false});
      };
      for(const unit of units){const{name,no,r,face,kind}=unit,[a,b,c,d]=r,isU=face.endsWith('u'),f=FDIR[face],fu=isU?(f[0]>0?c:a):(a+c)/2,fv=isU?(b+d)/2:(f[1]>0?d:b),span=isU?d-b:c-a;
        placeAssembly(transform(unit),()=>stock(name,unit.old,kind));
        const col=name==='놀부부대찌개'?0x152b46:0x2b2d2f;
        lbox(fu,fv,y+2.42,isU?.2:span,isU?span:.2,.44,col,{solid:false});lsign(name==='서브웨이'?'SUBWAY':name,fu+f[0]*.14,fv+f[1]*.14,y+2.65,Math.min(span-.3,10),.32,face,{bg:null,fg:name==='서브웨이'?'#f2d531':name==='놀부부대찌개'?'#ffb4dd':'#fff',pxPerM:110});
        for(const t of [-span/2+.3,span/2-.3]){const pu=fu+(isU?0:t),pv=fv+(isU?t:0);lbox(pu,pv,y,isU?.3:.8,isU?.8:.3,2.4,0xc9bea8,{solid:false});for(let k=0;k<10;k++)lbox(pu+(isU?f[0]*.17:-.36+k*.08),pv+(isU?-.36+k*.08:f[1]*.17),y,isU?.025:.018,isU?.018:.025,2.4,0xafa28b,{solid:false});}
        if(kind==='food'){lbox(fu+f[0]*.5,fv+f[1]*.5,y,.08,.08,1.05,0x2b3030,{solid:false});lsign(['메뉴',name],fu+f[0]*.51,fv+f[1]*.51,y+1.15,.55,.45,face,{bg:'#f4ece0',fg:'#403b35'});}
        if(no>=10&&no<=14){lsign(name,21.14,(b+d)/2,y+2.63,d-b-.3,.3,'+u',{bg:null,fg:'#fff'});}
        if(no===5){for(const v of [77,79.2,81.5,83.4])lbox(10.04,v,y,.13,.2,2.4,0xe2672a,{solid:false});lsign('가맹문의 598-0290',10.17,80,y+2.35,6,.22,'+u',{bg:'#171c20',fg:'#fff'});}
        if(no===20)lbox(fu,fv,y+2.4,span,.15,.55,'gb20_mesh',{solid:false});
      }
      // Retain all factory clothing rails while moving them into the new store polygon.
      for(let v=50;v<108;v+=5)for(const railU of [61,70]){const oldU=v>=70&&v<=85?(railU===61?68:72):railU;let u=oldU-7,nv=v-34;const edge=51+(38-nv)*20/26;if(nv<38&&u<edge+1)u=edge+1+(railU===70?1.7:0);u=Math.min(u,74);lbox(u,nv,y+.08,.9,2.8,.12,0xb5a58e);lbox(u,nv,y+1.55,.07,2.7,.05,0x707674,{solid:false});for(let k=0;k<10;k++)lbox(u,nv-1.2+k*.26,y+.7,.48,.14,.8,[0xe5d3b6,0x546370,0x9f8d7d,0x242e38][k%4],{solid:false});}
      // Factory mesh fascia, red neon, guards, security gates and repeated arrow banners.
      lbox(50.96,42.5,y+2.4,.2,9.3,.6,0x1b1e1e,{solid:false});lsign('SHINSEGAE FACTORY STORE',50.8,42.5,y+2.73,8.7,.38,'-u',{bg:null,fg:'#ff2a2a'});
      lwall(51,38,73,13.5,y+2.42,y+3.02,{mat:'gb20_mesh',thick:.18,solid:false});
      const frontAngle=Math.atan2(20,-26),frontFace=ROT-PI/2-frontAngle;
      for(let k=0;k<4;k++){const u=54+k*5,v=34.1-k*6.5;const[x,z]=W(u-.13,v-.1);K.sign('SHINSEGAE FACTORY STORE',{x,z,y:y+2.72,w:7.5,h:.35,rotY:frontFace,bg:null,fg:'#ff2a2a'});}
      for(const v of [38.3,46.7])lbox(51.2,v,y,.15,.5,1.2,0xaab0ae,{solid:false});
      lsign(['디즈니','TOY STORY'],50.8,38.8,y+1.35,1.1,2.2,'-u',{bg:'#2387c7',fg:'#f2d83c'});
      for(let k=0;k<5;k++){const u=57+k*3,v=30.2-k*3.9;lcyl(u,v,y,.035,1,0xbec7c7,{seg:8,solid:false});}
      for(const [u,v] of [[51.7,41],[56.4,31],[65.5,19],[68,15.5]])lsign(['▼','FACTORY STORE'],u,v,y+1.55,1.5,1.2,'-u',{bg:'#ab2d2b',fg:'#fff'});
      for(const d of diagonal){placeAssembly({from:d.from,to:d.to,angle:-2.486,sx:.65,sz:.83},()=>{const v=d.from[1];stock(d.name,[58,v-3,74,v+3],d.kind);lbox(58,v,y+2.4,.18,6,.5,d.name==='제주스커피'?'gb20_mesh':0x25292c,{solid:false});lsign(d.name==='제주스커피'?'JEJUICE COFFEE':d.name==='이마트24 5호점'?'emart24':d.name,57.85,v,y+2.63,5.5,.35,'-u',{bg:null,fg:d.name==='이마트24 5호점'?'#f3cf3a':'#fff'});if(d.name==='제주스커피'){lbox(72,v,y,.15,5.5,2.4,0x31827e);lbox(70,v,y,.7,5,.95,0x31827e);}});}
      // KB and NoBrand observed frontage, not the former east-facing generic market.
      lbox(4.5,40,y+2.35,9,.22,.5,0x191b1e,{solid:false});lsign('No Brand 브랜드가 아니다. 소비자다',4.5,40.16,y+2.63,8.4,.32,'+v',{bg:null,fg:'#fff'});lsign('★',8.7,40.2,y+2.62,.45,.4,'+v',{bg:null,fg:'#efcc31'});
      lbox(13.8,40.6,y,.4,.5,2.8,0x191b1e);lsign(['No Brand','영업시간','10:00~22:00'],13.8,40.88,y+1.4,.38,1.2,'+v',{bg:null,fg:'#fff'});
      lsign('KB국민은행',11.5,41,y+2.5,4.5,.45,'+v',{bg:'#f1e7d7',fg:'#4f493f'});
      for(const u of [9.9,11.2,12.5]){lbox(u,37.7,y,.9,.7,1.8,0xd7d4c6);lsign(['KB','현금자동입출금'],u,38.08,y+1.42,.75,.5,'+v',{bg:'#eee5cc',fg:'#5c5142'});lbox(u,38.07,y+.8,.58,.03,.42,0x2f5c76,{solid:false});}
      for(const u of [2.5,7.2])lsign(['No Brand','합리적인 쇼핑'],u,40.65,y+1,.6,1,'+v',{bg:'#efcc31',fg:'#252525'});
      for(let u=30;u<37;u+=.08)lbox(u,40.94,y,.035,.1,2.8,Math.floor(u*100)%3?0xc9bea8:0xb6aa95,{solid:false});
    });
  }
  function buildRound20Daiso(){
    const y=-4, white={color:0xefede8,gloss:.7};
    K.texture('gb7_daiso_circles',256,256,(g,w,h)=>{
      g.fillStyle='#c8102e';g.fillRect(0,0,w,h);g.strokeStyle='#f5f1e8';g.lineWidth=12;
      for(const [x,z,r] of [[45,30,24],[173,104,32],[69,204,36],[253,235,46]]){g.beginPath();g.arc(x,z,r,0,PI*2);g.stroke();}
    },[2.5,2.5]);
    K.material('gb_daiso_glass',new K.THREE.MeshLambertMaterial({color:0xf2f6f6,transparent:true,opacity:.15,depthWrite:false,side:K.THREE.DoubleSide}));
    const store=rect(170,0,284,30),wing=rect(238,-18,264,0),home=rect(264,-3,284,0),dip=rect(244,2.5,247,10.5);
    K.slab(store,y,{mat:white,under:false,holes:[dip]});
    K.slab(wing,y,{mat:white,under:false});K.slab(home,y,{mat:white,under:false});
    for(const p of [store,wing,home])K.hpoly('gb_acoustic',p,y+3,false,[rect(206.5,10.5,214.5,23),rect(265.5,.8,278,3)]);
    // No v=8 divider: this is one open store, with a clear 4 m main aisle at v=6.5.
    lwall(170,0,238,0,y,y+3,{mat:0xf3f2ef,thick:.16});
    lwall(170,30,284,30,y,y+3,{mat:0xf3f2ef,thick:.16});
    lwall(284,-3,284,30,y,y+3,{mat:0xf3f2ef,thick:.16});
    lwall(264,-3,284,-3,y,y+3,{mat:0xf3f2ef,thick:.16});
    lwall(238,-18,238,0,y,y+3,{mat:0xf3f2ef,thick:.16});
    lwall(238,-18,264,-18,y,y+3,{mat:0xf3f2ef,thick:.16});
    lwall(264,-18,264,-3,y,y+3,{mat:0xf3f2ef,thick:.16,openings:[{at:3,w:4.2,y0:y,y1:y+2.7}]});
    lwall(170,0,170,30,y,y+3,{mat:0xf3f2ef,thick:.16,openings:[{at:6,w:4,y0:y,y1:y+2.7},{at:16,w:4,y0:y,y1:y+2.7}]});
    // Five short treads each way: the two ends of #161 remain at the same level.
    lstairs(244,6.5,245.25,6.5,{ya:y,yb:y-.6,w:8,steps:5,mat:0xa9aaa6,rails:false});
    K.slab(rect(245.25,2.5,245.75,10.5),y-.6,{mat:0xa9aaa6,under:false,thick:.12});
    lstairs(245.75,6.5,247,6.5,{ya:y-.6,yb:y,w:8,steps:5,mat:0xa9aaa6,rails:false});
    for(let k=0;k<5;k++){
      lquadH(244+k*.25,2.5,244.04+k*.25,10.5,y-k*.12+.012,0x252a2b);
      lquadH(245.96+k*.25,2.5,246+k*.25,10.5,y-.48+k*.12+.012,0x252a2b);
    }
    for(const u of [243.7,247.3])lfloorText('계단조심',u,6.5,y+.015,1.5,.3,u<245?'+u':'-u',{bg:'#f4e144',fg:'#242725'});
    // GATE2 starts beyond the flat turnstile/door landing; its well stays south of the aisle.
    for(const u of [206.5,214.5])lwall(u,11.5,u,23,y,1.05,{mat:u===206.5?'gb7_daiso_circles':0xf2f1eb,thick:.12});
    lstairs(208.3,11.5,208.3,23,{ya:y,yb:0,w:2.8,steps:24,mat:0xb4b1aa,rails:true});
    lesc(213.25,11.5,213.25,23,{ya:y,yb:0,w:1.35,dir:'down'});
    // The west glass enclosure returns to the 22–24 boarding portion of 1F.
    lstairs(165,11,165,20,{ya:y,yb:-2,w:1.7,steps:12,mat:0xb6b4ae,rails:true});
    K.slab(rect(164,20,168,21.4),-2,{mat:0xb6b4ae,thick:.16});
    lstairs(167,20,167,11,{ya:-2,yb:0,w:1.7,steps:12,mat:0xb6b4ae,rails:true});
    for(const u of [164,168])lwall(u,11,u,21.4,y,1.05,{mat:doorGlass,thick:.05});
    lzone('다이소 강남고속버스터미널점','B1','문구 · 완구 · 식품 · 반려동물 · 뷰티 · 주방 · 생활용품',170,0,284,30,y,y+3.1,5);
    lzone('다이소 디즈니 · 계산하는 곳','B1','GATE 4 · 고투몰 방면',238,-18,264,4,y,y+3.1,6);
    lzone('다이소 1번 출입구','1F','지하 매장 · 승차홈 22~24',164,9,168,12,0,3.3,7);
    lzone('다이소 2번 출입구','1F','지하 매장 입구전용',206.5,22,214.5,25,0,3.3,7);
    lspawn('다이소 GATE 1 매장입구',172,6.5,y,1,0);
    lspawn('다이소 생활용품 긴 매장',218,6.5,y,1,0);
    lspawn('다이소 GATE 4 고투몰 연결',261.5,-15,y,1,0);
    buildRound20DaisoHall(y);
    ldetail({floor:'B1',y0:y,y1:y+3.1,poly:rect(164,-18,284,30),name:'사진 보행 다이소 · 네 출입구 · 계산대'},()=>{
      const stock=[0xf5f5f0,0xf06aa0,0xd8272d,0x2a7fd4,0x48ac9d,0xf2c200,0xb9dfed];
      // Same five-shelf, labelled packaged stock as previous rounds, moved to the new aisles.
      function rack(u,v,len,idx){
        lbox(u,v,y,1.1,len,.13,0xf2f2f2);lbox(u,v,y+.13,.06,len-.05,1.85,0xe8ebea);
        for(let t=0;t<5;t++){
          const ty=y+.16+t*.36;lbox(u,v,ty,1.1,len,.04,0xf2f2f2,{solid:false});
          for(const side of [-1,1]){
            lbox(u+side*.54,v,ty+.045,.02,len,.06,0xf5c9d8,{solid:false});
            for(let n=0;n<Math.floor(len/.23);n++){
              const vv=v-len/2+.15+n*.23,col=stock[(idx+t+Math.floor(n/4))%stock.length];
              if((idx+t+n)%5===0){lcyl(u+side*.3,vv,ty+.05,.09,.21,0xf1ecdf,{solid:false,seg:8});lcyl(u+side*.3,vv,ty+.26,.095,.025,0xb59b72,{solid:false,seg:8});}
              else if((idx+t+n)%5===1){lbox(u+side*.3,vv,ty+.05,.39,.2,.2,0xbfa37c,{solid:false});for(const hh of [.09,.14,.19])lbox(u+side*.516,vv,ty+hh,.012,.19,.013,0xe1c89e,{solid:false});}
              else{lbox(u+side*.3,vv,ty+.05,.42,.2,.2+(n%3)*.025,col,{solid:false,skip:['bottom']});if(n%3===0)lbox(u+side*.52,vv,ty+.065,.012,.19,.065,idx%2?0xaec7d3:0xf4f2e8,{solid:false});}
              lbox(u+side*.516,vv,ty+.14,.009,.12,.075,0xf4f3ed,{solid:false,skip:['bottom','top']});
            }
          }
        }
        for(const end of [-1,1])for(let t=0;t<4;t++){
          const vv=v+end*(len/2+.04);lbox(u,vv,y+.22+t*.36,1.03,.055,.055,0xe7cd54,{solid:false});
          for(let n=0;n<4;n++){lbox(u-.38+n*.25,vv,y+.3+t*.36,.18,.065,.23,stock[(n+t+idx)%stock.length],{solid:false});lbox(u-.38+n*.25,vv+end*.04,y+.33+t*.36,.13,.015,.11,0xf5f1e7,{solid:false});}
        }
      }
      // Retail fixtures are 1.8–2.1 m high on both sides; 4 m is kept clear at v4.5..8.5.
      for(let i=0,u=175;u<242;u+=4.4,i++){
        rack(u,2.4,3.9,i);
        if(u<205||u>215)rack(u,11.2,5.2,i+10);
        if(u<204||u>216)rack(u,19.8,5.2,i+20);
        rack(u,27,3.8,i+30);
      }
      for(let i=0,u=253;u<282;u+=4.4,i++){rack(u,14,6,i+40);rack(u,24,7,i+50);}
      for(let i=0,u=252;u<282;u+=4.4,i++)rack(u,-.9,3.1,i+60);
      for(const u of [245.6,253.8])for(const v of [-3.7,-7.7])rack(u,v,2.8,70+Math.round(u+v));
      for(const u of [238.7,242.7])rack(u,-13,6.8,80+u);
      for(const [u,t] of [[177,'문구 · 사무'],[184,'완구'],[190,'선물 · 포장'],[195,'파티'],[201,'스낵 · 간식'],[215,'인테리어'],[220,'반려동물용품'],[225,'원예'],[230,'스포츠 · 취미'],[234,'패션'],[237,'여행용품'],[241,'뷰티 · 헤어소품']])
        lsign(t,u,3.8,y+2.35,2.5,.36,'+v',{bg:'#4cb8b6',fg:'#fff',twoSided:true});
      for(const [u,t] of [[177,'문구·사무\n매대번호 2~6'],[201,'스낵·간식\n매대번호 11~15'],[219,'반려동물용품\n매대번호 16~19'],[230,'스포츠·취미']]){
        lbox(u,9.8,y,.65,.65,3,u===219?0xeda21d:0xf0eeea,{solid:false});
        lsign(t.split('\n'),u,9.45,y+1.92,.58,1.8,'-v',{bg:'#4cb8b6',fg:'#fff'});
      }
      lbox(239.3,9.2,y+2.5,8.6,.7,.36,0x7ad8bf,{solid:false});
      lsign('Beauty 뷰티용품코너',239.3,8.8,y+2.68,6.5,.35,'-v',{bg:'#7ad8bf',fg:'#fff'});
      for(const [u,t] of [[237,'미용소품'],[241,'헤어소품']])lsign(t,u,8.8,y+2.14,3,.28,'-v',{bg:'#7ad8bf',fg:'#265f56'});
      for(const [u,t] of [[254,'와인용품'],[259,'도자기'],[264,'내추럴용품'],[269,'조리도구'],[274,'일회용품'],[279,'일회·친환']])lsign(t,u,10.7,y+2.35,3,.33,'-v',{bg:'#73a797',fg:'#fff'});
      for(const [u,t] of [[253,'홈데코'],[261,'욕실'],[269,'청소 · 세탁'],[277,'수납']])lsign(t,u,-2.6,y+2.35,4,.33,'+v',{bg:'#b9a5da',fg:'#fff'});
      // Long cushion aisle at the north-east junction.
      for(let u=253;u<282;u+=.65)for(let h=0;h<3;h++)lbox(u,-2.3,y+.28+h*.55,.52,.48,.42,[0xe7d8b4,0xbac4b5,0xd3b8c6,0xd9dbd2][Math.floor(u+h)%4],{solid:false});
      for(const v of [-8.8,-1]){lbox(249.6,v,y+2.45,8.8,.5,.55,0xb9a5da,{solid:false});lsign('디즈니',249.6,v+.26,y+2.7,3.2,.4,'+v',{bg:'#b9a5da',fg:'#fff'});}
      for(const u of [245.7,253.5])for(const v of [-8.8,-1])lbox(u,v,y,.6,.6,3,0xb9a5da,{solid:false});
      // Disney merchandise retains stocked shelves; illustrated character-name panels match the photographed branch.
      for(const [u,t,bg] of [[245.7,'Mickey & Friends','#b9a5da'],[253.5,'Winnie the Pooh','#e7c47a']])lsign(t,u,-4,y+2.2,2.6,.6,u<250?'+u':'-u',{bg,fg:'#433553'});
      function checkout(u,v,n,face='-v',staff=false){
        lbox(u,v,y,staff?1.45:.82,.85,.93,0xf1f0ea);lbox(u,v,y+.93,staff?1.5:.87,.92,.05,0x969c99,{solid:false});
        lbox(u-.08,v,y+.98,.46,.28,.75,0xf6f5ee,{solid:false});lsign('셀프 결제',u-.08,v-.16,y+1.48,.38,.43,face,{bg:n%2?'#205fa6':'#b92f3c',fg:'#fff'});
        lsign(String(n),u,v,y+2.2,.55,.28,face,{bg:'#26333a',fg:'#e5d33b'});
        if(staff){lperson(u,v+.85,y,{rotY:FACE['-v'],shirt:0xbc233c,pants:0x31363c});lsign('₩',u,v,y+2.6,.65,.55,face,{bg:'#252725',fg:'#f5d23f'});}
      }
      for(let i=0;i<10;i++)checkout(246.3+(i%5)*2.8,-11.2-Math.floor(i/5)*4.2,i+1);
      checkout(259.8,-11.2,11,'-v',true);checkout(259.8,-15.4,12);
      for(const [u,n] of [[247,1],[252,2]])checkout(u,-5,n);
      for(let i=0;i<3;i++)checkout(173.3+i*2.1,15.2,i+1,'-v',i===2);
      lwall(245,-17.7,263.6,-17.7,y,y+2.8,{mat:'gb7_daiso_circles',thick:.04,solid:false});
      lsign('계산하는 곳',251.7,-10,y+2.65,5,.4,'+v',{bg:'#292d30',fg:'#f5d23f'});
      lsign('계산하는 곳',176,13.7,y+2.65,3.4,.4,'-v',{bg:'#292d30',fg:'#f5d23f'});
      // Pooh tote rack: two levels, folded stock and handles remain individually modelled.
      for(let row=0;row<2;row++)for(let n=0;n<5;n++){
        const u=261.2+n*.37,v=-16.6;lbox(u,v,y+.25+row*.72,.32,.09,.48,0xf0dfa1,{solid:false});
        for(const du of [-.1,.1])lbox(u+du,v,y+.73+row*.72,.018,.04,.14,0xc2ab6d,{solid:false});
        lsign('Pooh',u,v+.055,y+.48+row*.72,.27,.18,'+v',{bg:null,fg:'#826031'});
      }
      // Flush GATE1: two glazed sets around the recessed public stair enclosure.
      for(const v of [6,16]){
        for(const q of [v-2,v+2])lbox(170,q,y,.22,.15,2.95,0xc8102e,{solid:false});
        lbox(170,v,y+2.5,.25,4.15,.45,0xc8102e,{solid:false});
        lsign('daiso 다이소',169.84,v,y+2.72,3.7,.38,'-u',{bg:'#fff',fg:'#c8102e'});
        for(const q of [v-1.45,v+1.45])lbox(170,q,y+.03,.04,.9,2.36,doorGlass,{solid:false});
        for(const q of [v-.85,v+.85]){lsign('자동문 주의',169.81,q,y+1.15,.6,.17,'-u',{bg:'#f4d927',fg:'#292824'});lbox(171,q,y,.12,.4,1.4,0xc5cbca,{solid:false});}
        lfloorText('매장입구 ↑',169,v,y+.02,3.3,.5,'+u',{bg:'#c8102e',fg:'#fff'});
        lsign('매장입구 ↑',169.78,v,y+1.4,3.5,.22,'-u',{bg:'#f5f4ee',fg:'#30312e'});
      }
      lsign(['국민가게','다이소'],169.8,9,y+1.55,1,1.4,'-u',{bg:'#244765',fg:'#fff'});
      lsign('카트 출입금지',169.78,7.4,y+.82,.8,.23,'-u',{bg:'#fff',fg:'#b7253a'});
      // GATE2 flat entry-only turnstiles; doors are 2 m south of their housings.
      for(const u of [207.6,210.45,213.25]){
        lbox(u,9,y,.65,.8,1.04,0x242727);lbox(u,9.41,y+.05,.51,.025,.94,0xc0c1b9,{solid:false});
        lcyl(u,9,y+.7,.12,.15,0xaab3b0,{solid:false,seg:8});
        for(let k=0;k<3;k++)lbox(u+.43,9,y+.4+k*.18,.7,.04,.045,0xbfc4bc,{rot:k*PI/3,solid:false});
        lsign('입구전용',u,9.44,y+.82,.45,.2,'+v',{bg:'#bf233d',fg:'#fff'});
        lfloorText('진입금지 · 입구전용',u,8.3,y+.018,1.1,.38,'+v',{fg:'#be273c'});
      }
      for(const u of [207,209,212,214])lbox(u,11,y,.07,.07,2.7,0x9ca6a6,{solid:false});
      for(const u of [208,213])lbox(u,11,y+.02,1.8,.025,2.6,doorGlass,{solid:false});
      lsign(['GATE 2 이곳은 입구전용 입니다','나가실 때는 GATE 1번과 4번을 이용해주세요'],210.5,8.7,y+2.65,6.8,.7,'-v',{bg:'#fff',fg:'#c8102e',twoSided:true});
      for(const [u,col,t] of [[205.6,0x2da6a3,['CHECK iN SEOUL','MONEY EXCHANGE']],[215.1,0xf6f5ef,['Anytime Anywhere','daiso']]]){
        lbox(u,10.35,y,.75,.62,2.18,col);lsign(t,u,10.02,y+1.66,.65,.75,'-v',{bg:u<210?'#242e2e':'#fff',fg:u<210?'#f2cd37':'#c8102e'});lbox(u,10.02,y+.8,.45,.04,.35,0x222d35,{solid:false});
      }
      // GATE3 doors lead to the new B&C stair foot through a clear eastward passage.
      for(const v of [3,5,8,10])lbox(248.5,v,y,.07,.07,2.7,0xaab2b0,{solid:false});
      for(const v of [4,9])lbox(248.5,v,y+.02,.025,1.8,2.5,doorGlass,{solid:false});
      for(const v of [5.1,7.9]){lbox(248.1,v,y,.85,.36,1.1,0xaeb9b7);lsign('입구',247.65,v,y+.85,.28,.2,'-u',{bg:'#263132',fg:'#fff'});}
      lsign('나가는 곳',248.45,6.5,y+2.8,1.4,.28,'-u',{bg:'#318b60',fg:'#fff'});
      for(const [n,u,v] of [[1,166.9,10.75],[2,210.5,23.2]]){
        lbox(u,v,2.35,n===1?3.3:7.8,.25,.6,0xc8102e,{solid:false});lsign(`GATE ${n}  다이소`,u,v+.14,2.65,n===1?3:7,.4,'+v',{bg:null,fg:'#fff'});
      }
      for(const u of [172,174.3])for(let n=0;n<12;n++)lbox(u,9.5,y+.08+n*.07,.55,.42,.06,0xc72137,{solid:false});
      for(const [u,v] of [[177,6.5],[256,-9.3]])lsign(['가을맞이','가을이 왔어요'],u,v,y+2.55,1.1,.65,'-u',{bg:'#db7938',fg:'#fff',twoSided:true});
      // 800 mm glossy porcelain and continuous twin-tube fittings, with a dense mineral-tile grid.
      for(const [a,b,c,d] of [[170,0,284,30],[238,-18,264,0],[264,-3,284,0]]){
        for(let u=a;u<c;u+=.8)lquadH(u,b,u+.008,d,y+.012,0xc8c7c1);
        for(let v=b;v<d;v+=.8)lquadH(a,v,c,v+.008,y+.012,0xc8c7c1);
        for(let u=a;u<c;u+=.6)K.hpoly(0xcfcfca,rect(u,b,u+.012,d),y+2.985,false);
        for(let v=b;v<d;v+=.6)K.hpoly(0xcfcfca,rect(a,v,c,v+.012),y+2.985,false);
      }
      for(let u=171;u<283;u+=2.4)for(const v of [2.1,5.9,7.1,10,14,18,22,26]){
        if((u>206&&u<215&&v>10)||(u>265&&u<279&&v<3))continue;
        lbox(u,v,y+2.91,2.28,.25,.045,0xc6cac8,{solid:false});
        for(const dv of [-.075,.075])lbox(u,v+dv,y+2.89,2.2,.035,.025,'emit',{solid:false});
      }
      for(let v=-17;v<0;v+=2.4)for(const u of [242,247.7,250,256,261]){
        lbox(u,v,y+2.91,.25,2.28,.045,0xc6cac8,{solid:false});for(const du of [-.075,.075])lbox(u+du,v,y+2.89,.035,2.2,.025,'emit',{solid:false});
      }
      for(let u=180;u<280;u+=12){lcyl(u,6.5,y+2.97,.3,.025,0x9a9e99,{seg:16,solid:false});const[x,z]=W(u+5,6.5);K.dome({x,y:y+2.86,z,rx:.12,ry:.1,rz:.12,mat:0x20292b});}
      for(let u=175;u<242;u+=4.4)for(const v of [4.15,8.85]){lquadH(u-.7,v,u-.1,v+.035,y+.021,0xe1c53a);lquadH(u-.7,v,u-.665,v+.45,y+.021,0xe1c53a);}
      const coats=[0x364e6e,0xc84842,0xebe6dc,0x5a6a57,0xc69da6,0x343439];
      for(let i=0;i<30;i++){const u=174+(i%15)*4.45,v=i<15?5.1:7.9;lperson(u,v,y,{shirt:coats[i%6],pants:0x343a40,rotY:FACE[i%2?'+u':'-u']});}
      for(const [u,v] of [[249,-2],[250.8,-6.5],[256.5,-13],[260,-14]])lperson(u,v,y,{shirt:coats[Math.floor(u)%6],pants:0x303439});
    });
  }

  function buildRound20DaisoHall(y){
    // World-space registration is intentional: these stairs meet gotomall's independently rotated G11.
    const hall=[[241.4,-173.5],[249.3,-173.5],[249.3,-165.2],[241.4,-165.2]],granite={tex:'gb_b1_granite',color:0xb2aca3,gloss:.3};
    // The down-flight mouth must not be capped by the level hall slab.
    const hallFloor={tex:'gb_b1_granite',color:0x999996,gloss:.5};
    K.slab([[241.4,-171.5],[249.3,-171.5],[249.3,-165.2],[241.4,-165.2]],y,{mat:hallFloor,under:false});
    K.slab([[241.4,-173.5],[243.5,-173.5],[243.5,-171.5],[241.4,-171.5]],y,{mat:hallFloor,under:false});
    K.hpoly(0xdcdbd6,hall,y+3,false);
    K.wall(241.4,-173.5,241.4,-165.2,y,y+3,{mat:granite,thick:.18,openings:[{at:6.1,w:4.5,y0:y,y1:y+2.7}]});
    K.wall(249.3,-173.5,249.3,-165.2,y,y+3,{mat:granite,thick:.18,openings:[{at:4.1,w:5.3,y0:y,y1:y+3}]});
    K.wall(241.4,-165.2,249.3,-165.2,y,y+3,{mat:granite,thick:.18});
    K.wall(241.4,-173.5,249.3,-173.5,y,y+3,{mat:granite,thick:.18,openings:[{at:4.8,w:6,y0:y,y1:y+3}]});
    K.stairs(247,-168,254.5,-171,{ya:y,yb:0,w:4.5,steps:24,mat:granite,rails:true});
    const dx=7.5,dz=-3,len=Math.hypot(dx,dz),nx=-dz/len*2.4,nz=dx/len*2.4;
    const hole=[[247+nx,-168+nz],[254.5+nx,-171+nz],[254.5-nx,-171-nz],[247-nx,-168-nz]];
    K.groundHole(hole);
    // All handrails and the folded yellow wheelchair lift are outside the clear stair lanes.
    K.stairs(246.5,-172,245.5,-178,{ya:y,yb:-6,w:5.6,steps:13,mat:granite,rails:true});
    const lower=[[242.65,-178],[248.35,-178],[247.65,-183],[241.95,-183]];
    K.slab(lower,-6,{mat:granite,under:false});K.hpoly(0xdcdbd6,lower,-3,false);
    for(const s of [-1,1]){
      K.wall(246.5+s*2.95,-172,245.5+s*2.95,-178,-6,-1,{mat:granite,thick:.18});
      K.wall(245.5+s*2.95,-178,244.8+s*2.95,-183,-6,-3,{mat:granite,thick:.18});
    }
    K.quad(0xdcdbd6,[[243.55,-1,-172],[249.45,-1,-172],[248.45,-3,-178],[242.55,-3,-178]],[0,-1,0]);
    K.ramp(246.5,-172,245.5,-178,{ya:y+1,yb:-5,w:.055,mat:0xb9c4c3,solid:false});
    K.box({x:248.6,z:-174.8,y:-4.6,w:.5,d:1.2,h:.95,mat:0xe6c42e,solid:false});
    K.box({x:248.3,z:-174.8,y:-4.5,w:.08,d:1.15,h:.7,mat:0xb2bdbc,solid:false});
    // GATE4 stays ENE-facing, in the store's red and stainless exit frame.
    const [gu,gv]=toL(241.5,-167.3);
    for(const v of [gv-2.1,gv+2.1])lbox(gu,v,y,.1,.08,2.7,0xaeb6b3,{solid:false});
    for(const v of [gv-1.45,gv+1.45])lbox(gu,v,y+.03,.025,1.15,2.6,doorGlass,{solid:false});
    lsign('GATE 4',gu+.07,gv,y+2.6,3.3,.4,'+u',{bg:'#c8102e',fg:'#fff'});
    lfloorText('daiso',gu+1.3,gv,y+.018,3.4,.95,'+u',{bg:'#b7253a',fg:'#fff'});
    lzone('다이소 GATE 4 연결홀','B1','광장주차장 ↑ · 고투몰 G11 ↓',262,-19,272,-10,y,y+3.1,7);
    K.zone({name:'고투몰 G11 · 다이소 계단',floor:'B1',sub:'다이소가 고투몰보다 한 계단 위',rect:[241,-183,250,-171],y0:-6,y1:-.8,priority:7});
    ldetail({floor:'B1',y0:-6,y1:0,poly:[...hall,...lower],name:'GATE4 화강석 홀 · 계단 안내'},()=>{
      for(let x=242;x<249;x+=.6)for(let z=-173;z<-165.2;z+=.6){
        K.box({x,z,y:y+2.91,w:.57,d:.57,h:.05,mat:0xbfc0bd,solid:false});
        K.box({x,z,y:y+2.95,w:.4,d:.4,h:.04,mat:0xe8e7e1,solid:false});
        if(Math.round((x-242)/.6+ (z+173)/.6)%5===0)K.cyl({x,z,y:y+2.89,r:.075,h:.025,mat:'emit',seg:8,solid:false});
      }
      K.box({x:245.7,z:-170.5,y:y+.012,w:.32,d:4,h:.015,mat:'gb_tactile',solid:false});
      K.box({x:247,z:-168.6,y:y+.012,w:3,d:.32,h:.015,mat:'gb_tactile',solid:false});
      K.box({x:245.3,z:-180.3,y:-5.985,w:.32,d:4,h:.015,mat:'gb_tactile',solid:false});
      K.sign(['고속버스터미널 · 다이소','광장주차장 ↑','고투몰 G11 ↓'],{x:248.6,z:-166,y:y+1.8,w:1.4,h:1.5,rotY:-PI/2,bg:'#254f77',fg:'#fff'});
      K.sign('계단주의',{x:246.4,z:-171.7,y:y+1.1,w:1.5,h:.45,rotY:PI,bg:'#e8ca37',fg:'#262c2b'});
    });
  }

  // Preserve the earlier close-up merchandise, translating each complete display
  // into its photographed category instead of replacing detailed products with boxes.
  function retainedDaisoDetail(draw){
    const owner=K;
    const point=(x,z)=>{const[u,v]=toL(x,z),du=u>260?-82:u>250?-36:-17;return W(u+du,v-8);};
    const pos=o=>{const[x,z]=point(o.x,o.z);return {...o,x,z,y:o.y+2};};
    const poly=p=>p.map(q=>q.length===3?(()=>{const[x,z]=point(q[0],q[2]);return[x,q[1]+2,z];})():point(...q));
    K=new Proxy(owner,{get(t,p){
      if(['box','cyl','dome'].includes(p))return o=>t[p](pos(o));
      if(p==='sign'||p==='floorText')return (s,o)=>t[p](s,pos(o));
      if(p==='person')return (x,y,z,o)=>{const[q,r]=point(x,z);return t.person(q,y+2,r,o);};
      if(p==='wall')return (ax,az,bx,bz,ya,yb,o)=>t.wall(...point(ax,az),...point(bx,bz),ya+2,yb+2,o);
      if(p==='quad')return (m,q,n)=>t.quad(m,poly(q),n);
      if(p==='hpoly')return (m,q,y,up,holes)=>t.hpoly(m,poly(q),y+2,up,holes?.map(poly));
      return t[p];
    }});
    try{draw();}finally{K=owner;}
  }

  function buildUpper(){
    for(let i=1;i<10;i++){
      const p=floorPoly(i),y=ys[i],top=i===9?48:ys[i+1];
      K.zone({name:i===2?'고속터미널 꽃도매상가':'서울고속버스터미널',floor:`${i+1}F`,sub:uses[i],poly:p,y0:y,y1:top,priority:1});
      if(i<9&&i!==2){
        const voids=[[34,6,66,23],[54,33,62,48],[66,17,75.7,28],[16.4,66,25.2,92]];
        const omit=(u,v)=>i===1&&voids.some(r=>inRect(r,u,v,.35));
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
    K.zone({name:'북측 동',floor:'2F',sub:'상가 · 신반포로 아케이드',poly:NORTH,y0:NORTH_2F,y1:NORTH_ROOF,priority:2});columns(NORTH,NORTH_2F,3.85,(u,v)=>northVoids.some(p=>K.pointInPoly(...W(u,v),p)));lights(NORTH,8.02);
    K.zone({name:'북측 동 옥상 주차장',floor:'옥상',sub:'승용차 주차',poly:NORTH,y0:NORTH_ROOF,y1:12,priority:2});
    // Keep the neighbouring 6 m deck reachable after lowering the north shop floor.
    lramp(286,17,286,30.3,{w:4,ya:NORTH_2F,yb:6,mat:'concrete'});
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
    const arrival=bays.find(b=>b.n===42);
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
      for(const [a,b] of [[6.2,17],[84,136]]){
        K.hpoly({tex:'gb13_cream_tile',gloss:.3},rect(68.2,a,75.25,b),.037);
        for(let v=a+2;v<b-2;v+=9)lquadH(68.4,v,74.9,v+2.4,.039,0xa9aaa4);
        K.hpoly('gb_tactile',rect(70.25,a,70.55,b),.044);
        const cy=a===6.2?3.09:4.27;
        if(a!==6.2)curveCove(71.4,a+.5,b-.5,cy,4.1,.45);
        for(let v=a+2;v<b-1;v+=3.2){if(a===6.2||v>=54&&v<=93)continue;lcyl(74.65,v,cy-.025,.085,.02,'emit',{seg:10,solid:false});}
      }
      // Zq_100: timber upper frieze around the doorway/corridor transition.
      for(let v=17;v<28;v+=.2)lbox(66.05,v,5.5,.09,.055,4.6,0x8a7050,{solid:false});
      curveCove(58,33,48,9.9,6,.35);
      // 69_13: black portrait screens along one side, preserving the clear tactile lane.
      for(const v of [39.5,123.5]){
        lbox(68.35,v,0,.3,.76,2.7,0x24292b,{solid:false});
        lsign(['고속버스터미널','승차 안내'],68.53,v,1.58,.65,1.95,'+u',{bg:'#176794',fg:'#e9f6fa'});
        lbox(68.4,v,.02,.52,.88,.08,0xa3aaa7,{solid:false});
      }
      placeAssembly({to:[-15,-3]},()=>{
      // Zq_120: four blue-screen machines along one wall; older ticket banks remain.
      for(const v of [45,46.1,47.2,48.3]){
        lbox(67.8,v,0,.58,.67,.1,0x454d50);
        lbox(67.8,v,.1,.5,.59,1.67,0xeeefeb);
        lsign('승차권 발매',68.065,v,1.63,.52,.16,'+u',{bg:'#f0efe9',fg:'#4b5556'});
        lsign(['승차권 예매','경부선 · 영동선'],68.07,v,1.19,.48,.6,'+u',{bg:'#6398c2',fg:'#f0f6fa'});
        lbox(68.075,v,.67,.03,.36,.07,0x39454a,{solid:false});
      }
      });
      // Zq_145: one potted tree at the side of the long cream passage.
      lbox(68.7,102,0,.85,.85,.62,0xa6a69b);
      const[tx,tz]=W(68.7,102);K.tree(tx,tz,{y:.62,h:3.1,kind:'zelkova'});
      // Raised shutter slats stay above the walkable entries and retained shop stock.
      for(const v of [88,100])for(let h=2.2;h<3.25;h+=.075)lbox(34.08,v,h,.025,4.7,.058,0xa8aaa5,{solid:false});
    });
    ldetail({floor:'B1',y0:-6,y1:-2.8,poly:rect(46,19,75,66),name:'가상보행 팩토리스토어 개방 전면'},()=>placeAssembly({from:[58,78.5],to:[51,42.5],sz:.72},()=>{
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
    }));
    // Priority 3: observed fixtures supplement the retained stock and furniture.
    // None of the early-morning footage establishes that seasonal stock vanished.
    buildWalk17Daiso();
    ldetail({floor:'B1',y0:-4,y1:-.8,poly:rect(178,0,242,22),name:'가상보행 다이소 노선도 · 펫 · 여행용품'},()=>retainedDaisoDetail(()=>{
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
    }));
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
    const y=-4,palette=[0xf4f1e8,0xef9dba,0xd8272d,0x2a7fd4,0x48ac9d,0xf2c200,0xc6dce6];
    function run(a,b,v,side,height=1.75){
      const len=b-a,u=(a+b)/2;
      lbox(u,v,y,len,.62,.12,0xf2f2ee);
      lbox(u,v-side*.27,y+.12,len,.045,height-.12,0xe4e8e6,{solid:false});
      for(const du of [-len/2,len/2])lbox(u+du,v,y+.12,.035,.62,height-.12,0xe5e9e7,{solid:false});
      const count=Math.floor(len/.19);
      for(let row=0;row<5;row++){
        const h=y+.15+row*(height-.2)/5;
        lbox(u,v,h,len,.62,.04,0xf4f4ef,{solid:false});
        lbox(u,v+side*.315,h+.015,len,.02,.055,0xf0bdd0,{solid:false});
        for(let k=0;k<count;k++){
          const q=a+.1+k*(len-.2)/Math.max(1,count-1),col=palette[(k+row+Math.floor(a))%palette.length];
          lbox(q,v+side*.06,h+.045,.16,.4,.19+(k%2)*.035,col,{solid:false});
          lbox(q,v+side*.267,h+.075,.11,.012,.095,0xf8f4e7,{solid:false,skip:['top','bottom','e','w']});
        }
      }
    }
    for(const [lo,hi] of [[174,207],[215,243]])ldetail({floor:'B1',y0:y,y1:y+3.1,poly:rect(lo,0,hi,15),name:`다이소 보존 진열 ${lo}`},()=>{
      for(let a=lo;a<hi-2;a+=4.4){
        const b=Math.min(hi,a+3);
        run(a,b,4.05,1);
        // The retained PET/pouch, dog-clothing and paint closeups occupy these south faces.
        if(!((a<221&&b>216)||(a<182&&b>179)))run(a,b,8.95,-1);
      }
      for(const u of [178,192,226,239])if(u>=lo&&u<hi)for(let n=0;n<6;n++){
        lbox(u,10.2,y+.04+n*.055,.43,.33,.035,0xd22a42,{solid:false});
        for(const du of [-.205,.205])lbox(u+du,10.2,y+.07+n*.055,.02,.33,.13,0xd22a42,{solid:false});
        for(const dv of [-.155,.155])lbox(u,10.2+dv,y+.07+n*.055,.43,.02,.13,0xd22a42,{solid:false});
      }
    });
    ldetail({floor:'B1',y0:y,y1:y+3.1,poly:rect(170,-18,284,30),name:'다이소 실제 노선도 · 가을 행사 · 꽃 바구니'},()=>{
      K.texture('gb20_daiso_route',1280,440,(g,w,h)=>{
        g.fillStyle='#fffefa';g.fillRect(0,0,w,h);g.strokeStyle='#c8102e';g.lineWidth=14;g.strokeRect(7,7,w-14,h-14);
        const labels=['GATE3','뷰티용품','여행용품','패션','스포츠','원예','반려동물용품','인테리어','GATE2','식품','파티','선물·포장','완구','문구','계산하는 곳'];
        g.strokeStyle='#68716f';g.lineWidth=3;g.beginPath();g.moveTo(190,195);g.lineTo(1190,195);g.stroke();
        g.fillStyle='#24332f';g.font='19px sans-serif';
        labels.forEach((t,i)=>{const x=190+i*71.4;g.beginPath();g.arc(x,195,5,0,PI*2);g.fill();g.save();g.translate(x,175);g.rotate(-PI/3);g.fillText(t,0,0);g.restore();});
        g.beginPath();g.moveTo(190,195);g.lineTo(190,325);g.moveTo(40,115);g.lineTo(190,115);g.lineTo(190,195);g.moveTo(38,255);g.lineTo(190,255);g.stroke();
        g.font='20px sans-serif';g.fillText('주방 · 도자기 · 일회용품',38,85);g.fillText('홈데코 · 욕실 · 청소 · 수납',36,285);
        g.fillText('디즈니',204,232);g.fillText('계산하는 곳',204,267);g.fillStyle='#c8102e';g.fillText('GATE4 출구',204,312);
        g.fillStyle='#bd263a';g.beginPath();g.arc(762,195,10,0,PI*2);g.fill();g.font='21px sans-serif';g.fillText('현위치',729,234);
        g.fillStyle='#24332f';g.font='bold 25px sans-serif';g.fillText('← 고투몰방면',40,364);g.font='20px sans-serif';g.fillText('뉴코아백화점 방면',40,395);
        g.font='bold 24px sans-serif';g.fillText('GATE1 출구',1060,262);g.fillText('경부선방면',1020,343);g.font='18px sans-serif';g.fillText('고속터미널역 ③⑦⑨',970,375);
        g.fillStyle='#c8102e';g.beginPath();g.arc(1195,361,35,0,PI*2);g.fill();g.fillStyle='#fff';g.font='bold 45px sans-serif';g.fillText('↓',1174,377);
      },[2.6,.9]);
      for(const u of [201,246]){
        for(const v of [5.3,7.7])lbox(u,v,y+2.62,.018,.018,.37,0xa9b0ac,{solid:false});
        lbox(u,6.5,y+1.75,.065,2.6,.9,0xf6f4ed,{solid:false});
        for(const s of [-1,1]){
          const q=(v,h)=>{const[x,z]=W(u+s*.04,v);return[x,h,z];};
          const left=s<0?5.2:7.8,right=s<0?7.8:5.2;
          K.quad('gb20_daiso_route',[q(left,y+1.75),q(right,y+1.75),q(right,y+2.65),q(left,y+2.65)],[s*A[0],0,s*A[1]]);
        }
      }
      for(const [u,v] of [[173,6.5],[251,-8.5]]){
        lsign(['가을이 왔어요','가을맞이'],u,v,y+2.3,1.1,.72,'-u',{bg:'#d77a32',fg:'#fff',twoSided:true});
        lbox(u,v,y+2.66,.02,.02,.33,0xa7b0a9,{solid:false});
        for(const d of [-.7,.7]){const[x,z]=W(u,v+d);K.dome({x,z,y:y+2.5,rx:.18,ry:.045,rz:.22,mat:d<0?0xc8562c:0xe2a443,seg:5,rings:2,hemi:false});}
      }
      for(let i=0;i<12;i++){
        const u=222.3+i%4*.55,v=2.6+Math.floor(i/4)*.55;
        lcyl(u,v,y,.24,.55,0xa98b5c,{seg:10,solid:false});
        for(let n=0;n<8;n++){const q=u+.13*Math.cos(n*2.4),r=v+.13*Math.sin(n*2.4);lcyl(q,r,y+.5,.012,.6,0x4a7043,{solid:false,seg:4});const[x,z]=W(q,r);K.dome({x,z,y:y+1.1,rx:.13,ry:.08,rz:.13,mat:[0xf3ece1,0xe5c54d,0xd77b9e][i%3]});}
      }
      // Retained suspended ivy is confined to the floral aisle, away from route signs.
      for(let u=222;u<227;u+=1.1)for(const v of [3.8,9.2]){
        lbox(u,v,y+2.15,.015,.015,.8,0x5e7041,{solid:false});
        for(let k=0;k<6;k++){const[x,z]=W(u+(k%2?-.075:.075),v);K.dome({x,z,y:y+2.24+k*.12,rx:.11,ry:.065,rz:.04,mat:k%2?0x497343:0x638348,seg:5,rings:2,hemi:false});}
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
      K.hpoly({tex:'gb13_cream_tile',gloss:.5},rect(66.2,6.2,75.25,16.7),.047);
      for(const v of [8.5,15])lquadH(66.3,v,74.9,v+1.6,.049,0xa5a7a1);
      const oval=(rx,rz,h)=>Array.from({length:64},(_,k)=>{
        const a=k*PI/32,[x,z]=W(68.8+rx*Math.cos(a),11.3+rz*Math.sin(a));return[x,h,z];
      });
      const outer=oval(2.2,3.4,3.075),inner=oval(2.0,3.2,3.075),lit=oval(1.86,3.06,3.07),fascia=oval(1.86,3.06,3.5);
      const ovalHole=outer.map(([x,y,z])=>[x,z]);
      K.hpoly(0xefeeea,rect(66.2,6.2,75.25,16.7),3.075,false,[ovalHole]);
      K.hpoly(0xf1efe9,ovalHole,3.5,false);
      for(let k=0;k<64;k++){
        const n=(k+1)%64;K.quad(0xf4f2ec,[outer[k],outer[n],inner[n],inner[k]],[0,-1,0]);
        K.quad('emit',[inner[k],inner[n],lit[n],lit[k]],[0,-1,0]);
        K.quad(0x1b1d1f,[lit[k],lit[n],fascia[n],fascia[k]],[-A[0]*Math.cos(k*PI/32)-B[0]*Math.sin(k*PI/32),0,-A[1]*Math.cos(k*PI/32)-B[1]*Math.sin(k*PI/32)]);
      }
      for(let k=0;k<8;k++)lcyl(68.8+2.4*Math.cos(k*PI/4),11.3+3.6*Math.sin(k*PI/4),3.045,.07,.02,'emit',{seg:8,solid:false});
      for(const [u,v] of [[67.2,12.7],[68.6,13.5],[69,16.8],[70.8,17.6],[66.8,18.6],[71.2,11.6],[68,10.8],[65.2,15.8]]){
        lperson(u,v,0,{h:1.67,shirt:[0x30383e,0xc4b8a3,0x5a6a68,0x9c7e74][Math.floor(v)%4],rotY:FACE[u<69?'+u':'-u']});
        if(u<69)lbox(u+.29,v,.56,.27,.17,.34,0xc4b394,{solid:false});
      }
      // Zq145/170 are the opposite walking direction to the shorts' ad-screen view.
      for(const [a,b] of [[84,136]]){
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

    ldetail({floor:'B1',y0:-6,y1:-2.8,poly:rect(41,36,75,57),name:'15차 팩토리스토어 복도 접근 · 상품 전면'},()=>placeAssembly({from:[58,78.5],to:[51,42.5],sz:.72},()=>{
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
    }));

    ldetail({floor:'1F',y0:0,y1:6,poly:rect(76,32,174,145),name:'15차 승차장 줄막이 · 하차 승객 · 세차 차로'},()=>{
      for(const v of [88,96,104,112,120,128]){
        K.hpoly('gb_tactile',rect(76.1,v-2,76.45,v+2),.155);
        lperson(76.6,v+.8,.14,{h:1.7,shirt:0x596570,rotY:FACE['+u']});
        if(v%16===0)lbox(76.92,v+.8,.14,.28,.22,.57,0x826e5c,{solid:false});
      }
      // jp_130: the attendant is beside the bay-6 pier, ahead-left of camera19.
      lperson(80.05,102.4,.14,{h:1.72,shirt:0xc6e03a,pants:0x2a3843,rotY:FACE['+u']});
      const arrival=bays.find(b=>b.n===42);
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
    placeAssembly({from:[67.3,43.5],to:[30,55],angle:-PI/2,sx:.8,sz:2},()=>{
    // Zq_120: a locally enclosed 5.8 m throat; both ends and the tactile spine stay open.
    K.material('gb19_lit_plaster',new K.THREE.MeshLambertMaterial({color:0xeceae4,emissive:0x3a3a36}));
    lwall(67.3,43.5,67.3,56,0,4.4,{mat:'gb19_lit_plaster',thick:.16,openings:[{at:7.75,w:5.5,y0:0,y1:4.4}]});
    lwall(73.4,43.5,73.4,56,0,4.4,{mat:0xeceae4,thick:.16});
    for(const [u,face] of [[67.3,1],[73.4,-1]]){
      const plaster=u===67.3?'gb19_lit_plaster':0xeceae4;
      if(u!==67.3)lcyl(u,50.5,0,.6,4.4,plaster,{seg:24});
      for(const v of [43.5,56])lcyl(u,v,0,.35,4.4,plaster,{seg:16});
      if(u===67.3)for(const v of [44.5,55.1])lbox(67.39,v,0,.025,.03,4.4,0xc9c6be,{solid:false});
    }
    });
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
      ribbon(71.8,6.5,16.7,3.03,.35,.28,0x1b1d1f);
      placeAssembly({from:[73.52,23.5],to:[62.05,33],sz:15/13.5,dy:2},()=>{
      // D04: gallery frieze spans the whole lobby rather than only a door surround.
      for(let v=23.5;v<37;v+=.18)lbox(73.52,v,4,.1,.06,2,0x8b7455,{solid:false});
      lbox(73.43,30.25,3.85,.38,13.6,.15,0xf3f0e7,{solid:false});
      lbox(73.21,30.25,3.83,.07,13.6,.035,'emit',{solid:false});
      });
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
    ldetail({floor:'B1',y0:-6,y1:-2.8,poly:rect(54,22,69,34),name:'17차 팩토리스토어 식기 · 낮은 진열대'},()=>placeAssembly({from:[62,78.5],to:[61.5,27.7],angle:2.226,sx:.8,sz:.6},()=>{
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
    }));
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
