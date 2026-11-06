// Detailed public right-of-way. x east / z south; all dimensions in metres.
// Sources and assumptions: OSM centre lines are authoritative over prose research.
// The Central City footbridge crosses SAPYEONG-DAERO, with a northern spiral.
// OSM's two Sapyeong tube widths (20 m each) overlap: use their shared 17 m
// envelope, inferred four lanes, -6 m invert and 4.6 m clearance instead.
// Inferred: street tree species, furnishing styles, flyover 6.5 m deck, footbridge
// 6.2 m deck/pylon silhouette, accessible south lift, taxi queue, bus-lane paint.
// No invented stop IDs or live arrival times. Exit shafts remain gotomall/station-owned.
const ROAD_IDS = [37402467,71105531,71105555,97847428,131326713,131327735,218681382,218722041,218722042,218722043,218870939,218870945,218913526,218913527,301889788,309355890,443523921,473798788,473798790,480856735,480856736,480856737,480856741,480856742,498559927,498559932,498559933,522783547,522946367,522946368,523144216,523341064,523344135,523344137,523344143,525738543,525738544,525738545,525738546,547990887,547990890,547990891,547990895,562661077,623304593,655403256,674432577,674432580,691602197,799014370,799014371,799014372,816395058,816395059,816395060,828782197,828782198,831108561,831108562,831108563,831108564,845497255,868689632,921261337,921681811,1011881496,1033191354,1033191355,1252436243,1263366775,1389238182,1389238183,1389238184,1389238185,1420100037,1420100038,1472739714,1497710490,1497710491,1498239506,1499902350,1499902351,1499902352,1499902353,1499902354,1499902355,1532298610,218722037,218722038,282194887,418110854,799014358,799014359,1252436244];
const WALK_IDS = [301889787,301889789,308003937,606009741,665106093,665106094,665106095,665106096,665106097,816395057,845497271,845497273,1213763241,1213763242,1213763243,1232132158,1232132177,1232132196,1232132199,1481658419,1481658421,1481658423,1481658424,1481658425,1497710483,1497710484,1497710485,1497710486,1497710487,1497710488,1497710489,1497710492,1497710493,1497710494,1497710495,309355888,845497252,845497256,845497259,845497272];
export const meta = {
  id: 'streets', name: '고속터미널 거리 · 신반포로와 사평대로',
  claims: [886400346, 413367405, 413367408, 1137867801],
  // 831108569 is the footway through the east parking aisle, not service301889794.
  claimRoads: [...ROAD_IDS, ...WALK_IDS, 831108565, 831108569, 1420100042, 1420100043,
    1213763244, 1232132157, 1232132198, 1232132167, 1232132156], // crossing paint replaced here, avoiding city duplicates
  sources: ['data/osm.json', 'data/research/streets.json', 'refs/roadview/manifest.json',
    '.codex-jobs/evidence/audit_streets.json',
    'https://www.asiae.co.kr/en/article/2025121008310383822',
    'https://www.seocho.go.kr/site/seocho/ex/bbs/View.do?bcIdx=406159&cbIdx=61',
    'refs/roadview/cc_02_sinbanporo_west_from_main_gate_tan_block_led.jpg',
    'refs/roadview/gb_03_front_plaza_arch_canopy_shelters.jpg',
    'refs/roadview/gb_05_sinbanporo_east_bus_shelters_terminal_side.jpg',
    'refs/roadview/gb_01_north_wing_plaza_lot_from_sinbanporo.jpg',
    'refs/roadview/ssg_04_east_lot_north_view.jpg',
    'refs/roadview/bp_01_banpo_shoppingtown_exit82_north.jpg',
    'refs/roadview/bp_02_banpo_shoppingtown_gotomall_canopy_west.jpg',
    'refs/roadview/police_01_front.jpg', 'refs/roadview/police_02_box_and_exit3_W.jpg',
    'refs/roadview/street_01_sinbanpo_median_busstop_E.jpg',
    'refs/roadview/junction_01_jamwonro_N.jpg', 'refs/roadview/junction_02_jamwonro_E.jpg',
    'refs/roadview/junction_03_jamwonro_S.jpg', 'refs/aerial/police_islands.jpg',
    'refs/interior/police_box/notes.json', 'refs/interior/taxi/notes.json',
    'https://mediahub.seoul.go.kr/archives/2005907',
    'https://mediahub.seoul.go.kr/archives/2011689',
    'https://www.seocho.go.kr/site/seocho/ex/bbs/internet/fun/BbsCustomFView.do?bcIdx=367637',
    'https://news.seoul.go.kr/traffic/archives/515178',
    'https://topis.seoul.go.kr/map/openPopBusRoute.do?routId=104000012',
    'https://culture.seoul.go.kr/culture/culture/cultureEvent/view.do?cultcode=136724&menuNo=200010'],
};

export function build(K) {
  const PI = Math.PI, ROAD = 0.04, WALK = 0.15, BRIDGE = 6.2;
  const C = { steel: 0x48545d, silver: 0x9daab0, yellow: 0xf2c329, white: 0xf4f1e6, blue: 0x238bd2, green: 0x075847 };
  const byId = new Map(K.osm.roads.map(r => [r.id, r]));
  const roads = meta.claimRoads.map(id => byId.get(id)).filter(Boolean);
  const flyIds = new Set([480856735,480856736,1420100037,1420100038]);
  const tunnelIds = new Set([71105531,71105555,1499902351,1499902352,1499902353,1499902354]);
  const foot = r => ['footway','steps','pedestrian','path'].includes(r.hw);
  const surfaceRoads = roads.filter(r => !foot(r) && !r.tunnel && !r.bridge && !flyIds.has(r.id) && !tunnelIds.has(r.id));
  const major = r => ['primary','secondary'].includes(r.hw);
  const rnd = K.rand(7781);
  const rect = (x,z,w,d) => [[x-w/2,z-d/2],[x+w/2,z-d/2],[x+w/2,z+d/2],[x-w/2,z+d/2]];
  const mix = (a,b,t) => a+(b-a)*t;
  const emit = color => ({tex:'emit',color});
  function path(pts) {
    const cum=[0]; for(let i=1;i<pts.length;i++) cum.push(cum[i-1]+Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]));
    return {pts,cum,L:cum[cum.length-1]};
  }
  function at(p,s,off=0) {
    s=Math.max(0,Math.min(p.L,s)); let i=1; while(i<p.pts.length-1&&p.cum[i]<s)i++;
    const a=p.pts[i-1],b=p.pts[i],L=p.cum[i]-p.cum[i-1]||1,u=(b[0]-a[0])/L,v=(b[1]-a[1])/L,t=(s-p.cum[i-1])/L;
    return {x:mix(a[0],b[0],t)-v*off,z:mix(a[1],b[1],t)+u*off,u,v,rot:Math.atan2(u,v)};
  }
  function nearest(x,z,list=surfaceRoads) {
    let best={d:Infinity};
    for(const r of list) for(let i=1;i<r.pts.length;i++) {
      const a=r.pts[i-1],b=r.pts[i],dx=b[0]-a[0],dz=b[1]-a[1],ll=dx*dx+dz*dz;
      if(!ll)continue; const t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/ll)),xx=a[0]+dx*t,zz=a[1]+dz*t,d=Math.hypot(x-xx,z-zz);
      if(d<best.d) {const L=Math.sqrt(ll);best={r,d,x:xx,z:zz,u:dx/L,v:dz/L,rot:Math.atan2(dx,dz)};}
    } return best;
  }
  function stripPoly(a,b,w) { const dx=b[0]-a[0],dz=b[1]-a[1],L=Math.hypot(dx,dz)||1,nx=-dz/L*w/2,nz=dx/L*w/2;return [[a[0]+nx,a[1]+nz],[b[0]+nx,b[1]+nz],[b[0]-nx,b[1]-nz],[a[0]-nx,a[1]-nz]]; }
  function flat(a,b,w,y,mat,walk=false) { const q=stripPoly(a,b,w); if(walk)K.slab(q,y,{mat,thick:0.15,ceil:false});else K.hpoly(mat,q,y);return q; }
  function beam(a,b,r,mat=C.steel) { // solid-looking round bar in arbitrary 3-D orientation, merged faces
    const dx=b[0]-a[0],dy=b[1]-a[1],dz=b[2]-a[2],L=Math.hypot(dx,dy,dz); if(L<0.001)return;
    const u=[dx/L,dy/L,dz/L],n=Math.abs(u[1])>.95?[1,0,0]:[-u[2],0,u[0]],nl=Math.hypot(...n);for(let k=0;k<3;k++)n[k]/=nl;
    const v=[u[1]*n[2]-u[2]*n[1],u[2]*n[0]-u[0]*n[2],u[0]*n[1]-u[1]*n[0]];
    for(let j=0;j<6;j++){const c0=Math.cos(j*PI/3),s0=Math.sin(j*PI/3),c1=Math.cos((j+1)*PI/3),s1=Math.sin((j+1)*PI/3);const p=(o,c,s)=>o.map((q,k)=>q+r*(n[k]*c+v[k]*s));const mid=(j+.5)*PI/3,normal=n.map((q,k)=>q*Math.cos(mid)+v[k]*Math.sin(mid));K.quad(mat,[p(a,c0,s0),p(b,c0,s0),p(b,c1,s1),p(a,c1,s1)],normal);}
  }
  function rail(a,b,ya,yb,style='road') {
    const L=Math.hypot(b[0]-a[0],b[1]-a[1]),fine=style==='bridge',height=fine?1.18:0.85;
    beam([a[0],ya+height,a[1]],[b[0],yb+height,b[1]],fine?.045:.065,C.silver);
    beam([a[0],ya+.48,a[1]],[b[0],yb+.48,b[1]],.035,C.silver);
    const n=Math.max(1,Math.ceil(L/(fine?.85:3)));
    for(let i=0;i<=n;i++){const t=i/n,x=mix(a[0],b[0],t),z=mix(a[1],b[1],t),y=mix(ya,yb,t);K.box({x,z,y,w:.055,h:height,d:.055,mat:C.steel,solid:false});}
    // Short segments prevent sloping rail collision from extending beneath the span.
    for(let s=0;s<L;s+=2){const t=s/L,t1=Math.min(L,s+2)/L;
      K.phys.addWall(mix(a[0],b[0],t),mix(a[1],b[1],t),mix(a[0],b[0],t1),mix(a[1],b[1],t1),Math.min(mix(ya,yb,t),mix(ya,yb,t1)),Math.max(mix(ya,yb,t),mix(ya,yb,t1))+height,.045,'streets');}
  }
  function line(p,offset,width,start,end,y,color) { const a=at(p,start,offset),b=at(p,end,offset);flat([a.x,a.z],[b.x,b.z],width,y,color); }
  function arrow(p,s,off,y,reverse=false,turn='straight') {
    const q=at(p,s,off),u=q.u*(reverse?-1:1),v=q.v*(reverse?-1:1),P=(t,n)=>[q.x+u*t-v*n,q.z+v*t+u*n];
    if(turn===true)turn='left';
    flat(P(-2.3,0),P(turn==='left'||turn==='right'?.4:1.45,0),.22,y,C.white);
    if(turn!=='left'&&turn!=='right')K.hpoly(C.white,[P(.65,-.65),P(2.3,0),P(.65,.65),P(1.1,0)],y);
    if(turn&&turn!=='straight') {const side=turn==='left'?-1:1;
      flat(P(.3,0),P(.3,side*.95),.22,y,C.white);
      K.hpoly(C.white,[P(-.3,side*.65),P(.3,side*1.5),P(.9,side*.65),P(.3,side*.9)],y);
    }
  }
  function markings(r,p,height=()=>ROAD) {
    if(r.hw==='busway')return;
    const lanes=laneCount(r),laneW=r.width/lanes,ground=surfaceRoads.includes(r);
    // Paint is a face, not a walkable ramp. Clip actual polygons at the stop
    // lines, crossing aprons and OSM busways; no asphalt cover-up over old paint.
    function stroke(off,width,s,e,color) {
      for(let t=s;t<e-.001;){const i=p.cum.findIndex(v=>v>t+.001),end=Math.min(e,i<0?e:p.cum[i]);
        const a=at(p,t,off),b=at(p,end,off),poly=stripPoly([a.x,a.z],[b.x,b.z],width);
        if(ground)paint(poly,color,ROAD+.02);else {
          const ny=(height(end)-height(t))/(end-t||1);
          K.quad(color,poly.map(([x,z])=>[x,height(t)+.02+((x-a.x)*a.u+(z-a.z)*a.v)*ny,z]),[0,1,0]);
        }t=end;
      }
    }
    for(let k=1;k<lanes;k++){
      if(!r.oneway&&k===lanes/2)continue;
      const off=-r.width/2+k*laneW;
      for(let s=0;s<p.L;s+=8)stroke(off,.15,s,Math.min(p.L,s+3),C.white);
      if(ground)for(let s=0;s<p.L;s+=1){const q=at(p,Math.min(p.L,s+.5),off);
        if(approaches.some(a=>{const t=(q.x-a.x)*a.u+(q.z-a.z)*a.v,n=-(q.x-a.x)*a.v+(q.z-a.z)*a.u;
          return t>=5.2&&t<=35.2&&Math.abs(n)<a.r.width/2+.2;}))stroke(off,.15,s,Math.min(p.L,s+1),C.white);
      }
    }
    if(!r.oneway)for(const off of [-.15,.15])stroke(off,.15,0,p.L,C.yellow);
    // In Korea traffic keeps right: a one-way carriageway's median is its
    // negative offset side. Use a yellow edge only where an opposing way exists.
    for(const off of [-r.width/2+.22,r.width/2-.22]){
      const q=at(p,p.L/2),paired=ground&&r.oneway&&roadNetwork.some(b=>{if(b.id===r.id||!b.oneway||b.name!==r.name)return false;const n=nearest(q.x,q.z,[b]);return n.d<r.width+12&&n.u*q.u+n.v*q.v<-.65;});
      stroke(off,.15,0,p.L,paired&&off<0?C.yellow:C.white);
      if(paired&&off<0)stroke(off+.3,.15,0,p.L,C.yellow);
    }
  }
  // Reusable tactile surface: one material for every raised yellow warning strip.
  // bp_02 / cc_02: small grey concrete pavers, without the stock pink checker.
  K.texture('streets-pavers',256,256,(g,w,h)=>{
    g.fillStyle='#99968e';g.fillRect(0,0,w,h);
    const colors=['#a9a59c','#aaa69d','#a6a299','#ada99f'];
    for(let j=0;j<4;j++)for(let i=0;i<4;i++){
      g.fillStyle=colors[(i*3+j*5)%4];g.fillRect(i*64+1,j*64+1,62,62);
    }
  },[1.2,1.2]);
  // gb_01: red brick is confined to the terminal fence-side strip.
  K.texture('streets-kerb-brick',256,128,(g,w,h)=>{
    g.fillStyle='#8c796d';g.fillRect(0,0,w,h);
    for(let j=0;j<8;j++)for(let i=-1;i<8;i++){
      g.fillStyle=(i+j)%3?'#9a4a3a':'#9f5141';
      g.fillRect(i*32+(j%2)*16+1,j*16+1,30,14);
    }
  },[1.6,.8]);
  K.texture('streets-tactile',64,64,(g,w,h)=>{g.fillStyle='#e1b52e';g.fillRect(0,0,w,h);g.fillStyle='#f5d85c';for(let x=8;x<w;x+=16)for(let y=8;y<h;y+=16){g.beginPath();g.arc(x,y,3,0,PI*2);g.fill();}},[.4,.4]);
  K.texture('streets-grate',64,64,(g,w,h)=>{g.fillStyle='#474e50';g.fillRect(0,0,w,h);g.fillStyle='#181e22';for(let i=5;i<64;i+=8)g.fillRect(i,5,4,54);},[.6,.6]);
  // Ground holes do not clip previously registered road surfaces. Subtract the
  // open cuts from our ground geometry before submitting it to the real kit.
  const cutPaths = [[[-433.45,473.1],[-211.18,362.25]],[[-79.33,301.845],[85.2,217.68]]];
  // The police-front mouth is line 3's numbered exit 1, built by gotomall.
  // Do not cap its descending stairs with a road or island slab.
  const exitOneHole=[[49.686,-104.971],[53.151,-106.269],[49.960,-114.791],[46.495,-113.493]];
  const cuts=[...cutPaths.map(([a,b])=>stripPoly(a,b,18)),exitOneHole];
  const inCut=(x,z)=>cuts.some(q=>K.pointInPoly(x,z,q));
  function half(poly,a,b,inside) {
    const cross=p=>(b[0]-a[0])*(p[1]-a[1])-(b[1]-a[1])*(p[0]-a[0]);
    const out=[];for(let i=0;i<poly.length;i++){const p=poly[i],q=poly[(i+1)%poly.length],dp=cross(p),dq=cross(q),ip=inside?dp>=-1e-8:dp<=1e-8,iq=inside?dq>=-1e-8:dq<=1e-8;if(ip)out.push(p);if(ip!==iq){const t=dp/(dp-dq);out.push([mix(p[0],q[0],t),mix(p[1],q[1],t)]);}}return out;
  }
  function clipped(poly, exclusions=cuts) {
    let pieces=[poly];
    for(const cut of exclusions){const area=cut.reduce((sum,p,i)=>{const q=cut[(i+1)%cut.length];return sum+p[0]*q[1]-q[0]*p[1];},0),clip=area>0?cut:[...cut].reverse(),next=[];for(const piece of pieces){let remain=piece;for(let i=0;i<clip.length&&remain.length>2;i++){const a=clip[i],b=clip[(i+1)%clip.length],outside=half(remain,a,b,false);if(outside.length>2&&K.polyArea(outside)>.0001)next.push(outside);remain=half(remain,a,b,true);}}pieces=next;}return pieces;
  }
  // ssg_03/04 show an uninterrupted asphalt aisle. Reuse the surveyed store
  // frame to clip only footway paving; leave its service road and parking paint.
  const ssgPoint=(u,v)=>[-107.07+62.61*u/67+30.43*v/84.7-.32*u/67*v/84.7,
    -24.31-23.77*u/67+79.03*v/84.7+.13*u/67*v/84.7];
  const eastLot=[[70.7,-12],[91.2,-12],[91.2,55],[70.7,55]].map(([u,v])=>ssgPoint(u,v));
  const real=K;K=Object.create(real);
  K.slab=(poly,y,o={})=>{if(y>=0&&y<=.2){for(const p of clipped(poly))real.slab(p,y,o);}else real.slab(poly,y,o);};
  K.hpoly=(mat,poly,y,up=true,holes)=>{if(y>=0&&y<=.2){for(const p of clipped(poly))real.hpoly(mat,p,y,up,holes);}else real.hpoly(mat,poly,y,up,holes);};
  K.ramp=(ax,az,bx,bz,o={})=>{if(o.ya>=0&&o.yb>=0&&o.ya<=.2&&Math.abs(o.ya-o.yb)<.001){for(const p of clipped(stripPoly([ax,az],[bx,bz],o.w||2)))real.slab(p,o.ya,{mat:o.mat,thick:.05,under:false,edge:false,ceil:false});}else real.ramp(ax,az,bx,bz,o);};
  const laneCount=r=>r.lanes||Math.max(r.oneway?1:2,Math.min(r.oneway?4:6,Math.round(r.width/3.4/(!r.oneway?2:1))*(!r.oneway?2:1)));
  const roadNetwork=K.osm.roads.filter(r=>['primary','secondary','tertiary','residential','unclassified','service','busway'].includes(r.hw)&&!r.bridge&&!r.tunnel&&r.layer<=0&&!flyIds.has(r.id)&&!tunnelIds.has(r.id));
  const owned=new Set(meta.claimRoads),crossings=roads.filter(r=>r.footway==='crossing');
  const surveyedCrossings=K.osm.roads.filter(r=>r.footway==='crossing');
  const junctions=[],approaches=[],crosswalks=[],paintMasks=[];
  // OSM splits a junction into several ways and several signal nodes. Treat
  // their cluster as ONE junction, including the otherwise unmarked Banpo box.
  const signalGroups=[];
  for(const n of K.osm.nodes.filter(n=>n.k==='traffic_signals')){
    const q=nearest(n.x,n.z);if(!q.r||q.d>q.r.width/2+3)continue;
    const g=signalGroups.find(g=>g.some(a=>Math.hypot(a.x-n.x,a.z-n.z)<52));
    if(g)g.push(n);else signalGroups.push([n]);
  }
  signalGroups.push([{x:-342,z:7,name:'반포대로'}]);
  function frame(j,p){const x=p[0]-j.x,z=p[1]-j.z;return [x*j.u+z*j.v,-x*j.v+z*j.u];}
  function framePoly(j,pad=0){return [[-j.hu-pad,-j.hv-pad],[j.hu+pad,-j.hv-pad],[j.hu+pad,j.hv+pad],[-j.hu-pad,j.hv+pad]].map(([a,b])=>[j.x+j.u*a-j.v*b,j.z+j.v*a+j.u*b]);}
  function insideJ(j,x,z,pad=0){const [a,b]=frame(j,[x,z]);return Math.abs(a)<j.hu+pad&&Math.abs(b)<j.hv+pad;}
  function segmentCross(a,b,c,d){const ux=b[0]-a[0],uz=b[1]-a[1],vx=d[0]-c[0],vz=d[1]-c[1],den=ux*vz-uz*vx;
    if(Math.abs(den)<1e-6)return null;const dx=c[0]-a[0],dz=c[1]-a[1],t=(dx*vz-dz*vx)/den,s=(dx*uz-dz*ux)/den;
    return t>=0&&t<=1&&s>=0&&s<=1?[a[0]+ux*t,a[1]+uz*t]:null;
  }
  for(const g of signalGroups){
    let x=g.reduce((s,n)=>s+n.x,0)/g.length,z=g.reduce((s,n)=>s+n.z,0)/g.length;
    const q=nearest(x,z,surfaceRoads.filter(major));if(!q.r)continue;
    const j={x,z,u:q.u,v:q.v,hu:10,hv:10,name:g.find(n=>n.name)?.name||q.r.name,arms:[]};
    for(const n of g){const [a,b]=frame(j,[n.x,n.z]);j.hu=Math.max(j.hu,Math.abs(a)+4);j.hv=Math.max(j.hv,Math.abs(b)+4);}
    // Round 10: Goter's four-sided crossing opened 2025-12-08. The 2024-12-09
    // Banpo-dong crossing is a separate project (Seocho press release above).
    // Preserve these crossing ends and gotomall's stairs: entrances were not
    // relocated. Right-turn lanes were adjusted; their exact widths are unknown.
    if(Math.hypot(x-360,z+263)<45)Object.assign(j,{x:358,z:-261,u:.934,v:-.357,hu:18,hv:21,name:'고속터미널교차로'});
    if(x===-342)Object.assign(j,{u:.934,v:-.357,hu:25,hv:25,name:'반포대로'});
    // Small signalised crossings still need room for the road width, but the
    // surrounding box never extends into the next block as a giant rectangle.
    const norm=Math.hypot(j.u,j.v);j.u/=norm;j.v/=norm;
    junctions.push(j);paintMasks.push(framePoly(j,4.5));
    const perimeter=framePoly(j,4.5);
    for(const r of roadNetwork.filter(r=>['primary','secondary','tertiary'].includes(r.hw))){
      for(let i=1;i<r.pts.length;i++)for(let e=0;e<4;e++){
        const a=r.pts[i-1],b=r.pts[i],hit=segmentCross(a,b,perimeter[e],perimeter[(e+1)%4]);if(!hit)continue;
        const L=Math.hypot(b[0]-a[0],b[1]-a[1]),tx=(b[0]-a[0])/L,tz=(b[1]-a[1])/L;
        const dir=(hit[0]-j.x)*tx+(hit[1]-j.z)*tz>0?1:-1;
        if(j.arms.some(a=>Math.hypot(a.x-hit[0],a.z-hit[1])<3&&Math.abs(a.u*tx+a.v*tz)>.9))continue;
        const arm={x:hit[0],z:hit[1],u:tx*dir,v:tz*dir,r,j,incoming:!r.oneway||dir<0,owned:owned.has(r.id)};
        const surveyed=surveyedCrossings.map(c=>{const a=c.pts[0],b=c.pts[c.pts.length-1],dx=b[0]-a[0],dz=b[1]-a[1],L=Math.hypot(dx,dz),x=(a[0]+b[0])/2,z=(a[1]+b[1])/2;
          return {c,x,z,L,d:Math.hypot(x-arm.x,z-arm.z),dot:Math.abs((dx*arm.u+dz*arm.v)/L)};})
          .filter(c=>c.L>=r.width*.65&&c.d<13&&c.dot<.4).sort((a,b)=>a.d-b.d)[0];
        if(surveyed){const t=(surveyed.x-arm.x)*arm.u+(surveyed.z-arm.z)*arm.v;arm.x+=arm.u*t;arm.z+=arm.v*t;arm.crossing=surveyed.c.id;}
        j.arms.push(arm);if(!arm.owned)continue;
        // The full crossing strip, the 2.5m clearance and approach stop line
        // form one exclusion for every kind of longitudinal paint.
        const end=[arm.x+arm.u*5.45,arm.z+arm.v*5.45],start=[arm.x-arm.u*2.5,arm.z-arm.v*2.5];
        paintMasks.push(stripPoly(start,end,r.width+.3));
        crosswalks.push({a:[arm.x+arm.v*r.width/2,arm.z-arm.u*r.width/2],b:[arm.x-arm.v*r.width/2,arm.z+arm.u*r.width/2],w:5,arm});
        if(arm.incoming)approaches.push(arm);
      }
    }
  }
  // Node-only and footway crossings are projected square to the road being
  // crossed. Diagonal OSM footway links are pedestrian routing, not paint.
  function addCrossing(pts,w=4.5,allowJunction=false){
    const a=pts[0],b=pts[pts.length-1],x=(a[0]+b[0])/2,z=(a[1]+b[1])/2;
    if(!allowJunction&&junctions.some(j=>insideJ(j,x,z,14)))return;
    if(crosswalks.some(c=>Math.hypot((c.a[0]+c.b[0])/2-x,(c.a[1]+c.b[1])/2-z)<8))return;
    let best=null;
    for(const r of roadNetwork)for(let i=1;i<r.pts.length;i++){
      const hit=segmentCross(a,b,r.pts[i-1],r.pts[i]);if(!hit)continue;
      const n=nearest(hit[0],hit[1],[r]),score=Math.abs(n.u*(b[1]-a[1])-n.v*(b[0]-a[0]));
      if(!best||score>best.score)best={...n,score};
    }
    const q=best||nearest(x,z);if(!q.r)return;
    const length=Math.max(q.r.width,Math.abs(-(b[0]-a[0])*q.v+(b[1]-a[1])*q.u));
    const aa=[x+q.v*length/2,z-q.u*length/2],bb=[x-q.v*length/2,z+q.u*length/2];
    crosswalks.push({a:aa,b:bb,w:Math.max(4,Math.min(6,w))});paintMasks.push(stripPoly(aa,bb,Math.max(4,Math.min(6,w))+.5));
  }
  for(const r of crossings){const a=r.pts[0],b=r.pts[r.pts.length-1],x=(a[0]+b[0])/2,z=(a[1]+b[1])/2;
    // A module-owned zebra may cross a city-owned approach (Samho south).
    // The city reuses this claimed way, so this module must still paint it.
    const shared=junctions.some(j=>j.arms.some(a=>!a.owned&&Math.hypot(a.x-x,a.z-z)<14));
    addCrossing(r.pts,r.width,shared);
  }
  for(const n of K.osm.nodes.filter(n=>n.k==='crossing')){
    const q=nearest(n.x,n.z);if(!q.r||q.d>q.r.width/2||!major(q.r))continue;
    addCrossing([[q.x+q.v*q.r.width/2,q.z-q.u*q.r.width/2],[q.x-q.v*q.r.width/2,q.z+q.u*q.r.width/2]]);
  }
  // The buses' surveyed ribbons replace the overlapping generic car paint.
  const medianBusWays=K.osm.roads.filter(r=>[1420100042,1420100043].includes(r.id));
  const busMasks=medianBusWays.flatMap(r=>r.pts.slice(1).map((b,i)=>stripPoly(r.pts[i],b,6.2)));
  const medianPlatforms=[[-70.27,-95.53,1420100043],[6.55,-132.2,1420100042]].map(([x,z,id])=>{
    const q=nearest(x,z,[byId.get(id)]);return stripPoly([x-q.u*13,z-q.v*13],[x+q.u*13,z+q.v*13],3.2);
  });
  const indexedMasks=[...paintMasks,...busMasks,...medianPlatforms].map(poly=>({poly,bb:K.polyBBox(poly)}));
  function paint(poly,mat,y,includeBus=true){const bb=K.polyBBox(poly),list=includeBus?indexedMasks:indexedMasks.slice(0,paintMasks.length);
    const overlaps=list.filter(({bb:b})=>bb[0]<=b[2]&&bb[2]>=b[0]&&bb[1]<=b[3]&&bb[3]>=b[1]).map(m=>m.poly);
    for(const piece of clipped(poly,overlaps))K.hpoly(mat,piece,y);
  }
  // Every claimed ordinary road, including residential branches, is rendered here.
  for(const r of roads) {
    if(r.id===301889788||r.id===301889787||flyIds.has(r.id)||tunnelIds.has(r.id))continue;
    const p=path(r.pts);if(!p.L)continue;
    if(r.footway==='crossing')continue;
    if(foot(r)) {
      for(let i=1;i<r.pts.length;i++){
        const poly=stripPoly(r.pts[i-1],r.pts[i],r.width||2.5);
        for(const piece of clipped(poly,[eastLot]))K.slab(piece,WALK,{mat:'streets-pavers',thick:.15,ceil:false});
      }
      continue;
    }
    const hs=s=>r.bridge?ROAD+3*(r.pts[0][0]>990?1-s/p.L:s/p.L):ROAD;
    for(let i=1;i<r.pts.length;i++)K.ramp(...r.pts[i-1],...r.pts[i],{w:r.width,ya:hs(p.cum[i-1]),yb:hs(p.cum[i]),mat:'asphalt',rails:false});
    markings(r,p,hs);
    if(r.hw!=='busway')for(let s=40;s<p.L-8;s+=70){const q=at(p,s);if(q.x<-650||q.x>650||q.z<-750||q.z>600)continue;const lanes=laneCount(r),k=Math.floor(rnd()*lanes),off=-r.width/2+(k+.5)*r.width/lanes,v=at(p,s,off);
      if(inCut(v.x,v.z)||indexedMasks.some(m=>K.pointInPoly(v.x,v.z,m.poly))||medianBusWays.some(b=>nearest(v.x,v.z,[b]).d<7))continue;
      K.vehicle({x:v.x,z:v.z,y:hs(s),rotY:v.rot+(r.oneway||k>=lanes/2?0:PI),kind:rnd()<.14?'taxi':'car'});}
    if(major(r))for(let i=1;i<r.pts.length;i++)K.zone({name:r.name,floor:'지상',sub:r.name==='신반포로'?'고속터미널 · 반포쇼핑타운':r.name==='사평대로'?'서울성모병원 · 서리풀공원':r.name==='잠원로'?'잠원동 · 반포역':'반포대교 · 반포한강공원',poly:stripPoly(r.pts[i-1],r.pts[i],r.width+14),y0:-.2,y1:4,priority:1});
  }
  const stops=K.osm.nodes.filter(n=>n.k==='bus_stop'&&n.x>-460&&n.x<620&&n.z>-600&&n.z<560);
  const exits=K.osm.exits||[];
  const bboxes=K.osm.buildings.map(b=>({b,bb:K.polyBBox(b.poly)}));
  const ccStop={x:-171.44,z:-45.71};
  const ccRoad=nearest(ccStop.x,ccStop.z,surfaceRoads.filter(r=>r.name==='신반포로'));
  const ccDir=ccRoad.u<0?-1:1,ccUx=ccRoad.u*ccDir,ccUz=ccRoad.v*ccDir;
  const inWestCanopy=(x,z)=>{
    const dx=x-ccStop.x,dz=z-ccStop.z,along=dx*ccUx+dz*ccUz,across=-dx*ccUz+dz*ccUx;
    return along>-38&&along<2&&across>.2&&across<6.3;
  };
  function inBuilding(x,z) {return bboxes.some(({b,bb})=>x>bb[0]-1&&x<bb[2]+1&&z>bb[1]-1&&z<bb[3]+1&&K.pointInPoly(x,z,b.poly));}
  function clearFurniture(x,z) {return !inCut(x,z)&&!inBuilding(x,z)&&!inWestCanopy(x,z)&&!inTaxiStand(x,z)&&!indexedMasks.some(m=>K.pointInPoly(x,z,m.poly))&&!stops.some(p=>Math.hypot(p.x-x,p.z-z)<10)&&!exits.some(p=>Math.hypot(p.x-x,p.z-z)<5)&&!crossings.some(r=>nearest(x,z,[r]).d<4);}
  const furniture=[];
  function lamp(x,z,rot,y=WALK) {
    if(y===WALK&&(onTerminalMedian(x,z)||inWestCanopy(x,z)||inTaxiStand(x,z)))return;
    K.cyl({x,z,y,r:.11,h:7.5,seg:8,mat:C.steel});const dx=Math.sin(rot),dz=Math.cos(rot);
    beam([x,y+7.3,z],[x+dx*1.7,y+7.5,z+dz*1.7],.07);
    K.box({x:x+dx*1.8,z:z+dz*1.8,y:y+7.42,w:.5,h:.15,d:1.1,rotY:rot,mat:C.steel,solid:false});
    K.box({x:x+dx*1.8,z:z+dz*1.8,y:y+7.4,w:.4,h:.025,d:.9,rotY:rot,mat:emit(0xffedc2),solid:false});
  }
  function treePit(x,z,y=WALK) {
    if(onTerminalMedian(x,z)||inWestCanopy(x,z)||inTaxiStand(x,z))return;
    const mature=Math.hypot(x-358,z+261)<100||(x>-95&&x<50&&z<-110);
    K.box({x,z,y:y+.005,w:1.55,h:.08,d:1.55,mat:0x666d64,top:'streets-grate',solid:false});K.tree(x,z,{y:y+.07,h:(mature?10.5:6.5)+rnd()*2,kind:mature?'zelkova':rnd()<.55?'ginkgo':'zelkova'});
    for(const dx of [-.58,.58])for(const dz of [-.58,.58])K.box({x:x+dx,z:z+dz,y:y+.1,w:.045,h:.8,d:.045,mat:C.steel,solid:false});
  }
  const terminalRoad=byId.get(828782198);
  const onTerminalMedian=(x,z)=>{
    const q=nearest(x,z,[terminalRoad]);
    const off=(x-q.x)*(-q.v)+(z-q.z)*q.u;
    return x>=60&&x<=330&&off>=6.9&&off<=12.5;
  };
  // Offset the actual south carriageway edge. Use final world-x for the arch
  // crossing, so the road's 21-degree angle cannot shift grass into its opening.
  function terminalStrip(x0,x1,offset,width,draw) {
    const p=path(terminalRoad.pts);
    for(let i=1;i<p.pts.length;i++){
      const seg=path([p.pts[i-1],p.pts[i]]),a=at(seg,0,offset),b=at(seg,seg.L,offset);
      const lo=Math.max(x0,a.x),hi=Math.min(x1,b.x);if(hi<=lo)continue;
      const pos=x=>[x,mix(a.z,b.z,(x-a.x)/(b.x-a.x))];
      let poly=stripPoly(pos(lo),pos(hi),width);
      poly=half(half(poly,[x0,1],[x0,-1],true),[x1,-1],[x1,1],true);
      draw(poly,pos(lo),pos(hi));
    }
  }
  // Sidewalks stop across side roads, crossings and building footprints. The
  // inner edge of a paired carriageway is rejected by the road proximity test.
  for(const r of surfaceRoads.filter(major)) {
    const p=path(r.pts);
    for(const side of [-1,1])for(let s=4;s<p.L-2;s+=7) {
      const off=side*(r.width/2+2),q=at(p,s,off),n=nearest(q.x,q.z,surfaceRoads.filter(a=>a!==r));
      if(onTerminalMedian(q.x,q.z))continue;
      if((n.r&&n.d<n.r.width/2+1.5)||inBuilding(q.x,q.z)||inCut(q.x,q.z))continue;
      const a=at(p,Math.max(0,s-3.6),off),b=at(p,Math.min(p.L,s+3.6),off);
      flat([a.x,a.z],[b.x,b.z],3.7,WALK,'streets-pavers',true);
      const ca=at(p,Math.max(0,s-3.6),side*(r.width/2+.18)),cb=at(p,Math.min(p.L,s+3.6),side*(r.width/2+.18));
      if(!inCut(ca.x,ca.z)&&!inCut(cb.x,cb.z))K.wall(ca.x,ca.z,cb.x,cb.z,ROAD,WALK,{thick:.28,mat:0xbfc1ba,solid:false});
      if(Math.abs(q.x)<650&&q.z>-750&&q.z<650&&clearFurniture(q.x,q.z)&&furniture.every(a=>Math.hypot(a[0]-q.x,a[1]-q.z)>17)) {
        const f=at(p,s,side*(r.width/2+1.2));treePit(f.x,f.z);furniture.push([q.x,q.z]);
        if(furniture.length%2===0){const l=at(p,s+5,side*(r.width/2+.7));lamp(l.x,l.z,q.rot+side*PI/2);}
        if(furniture.length%4===0)K.person(q.x,WALK,q.z);
      }
    }
  }
  // gb_03/04/05: low concrete island, 1.2m grass inside a 1.5m kerb envelope;
  // no trees or poles between the through lanes and the terminal service lane.
  for(const [x0,x1] of [[60,137],[148,330]]){
    terminalStrip(x0,x1,7.85,1.5,poly=>K.slab(poly,ROAD+.2,{mat:0xb9b6ad,thick:.2,ceil:false}));
    terminalStrip(x0,x1,7.85,1.2,poly=>K.hpoly(0x6f8f3e,poly,ROAD+.202));
  }
  // Keep the actual road-level crossing open. The terminal module owns its
  // arches, dark shelter run and ad lightboxes (gb_03, local u163 crossing).
  terminalStrip(137,148,7.85,1.5,poly=>K.hpoly('asphalt',poly,ROAD+.008));
  // Outer sidewalk: the roadview red strip sits by the fence, not on the island.
  // Separate runs follow the service-lane side and then the parking-lot edge.
  const gbPoint=(u,v)=>[2.3+.9348*u+.3552*v,-59.24-.3552*u+.9348*v];
  const fenceRuns=[[[75,-33],[95,-33]],[[100,-25],[156,-25]],[[170,-25],[207,-25]],[[236,-44],[260,-44]]]
    .map(pair=>pair.map(([u,v])=>gbPoint(u,v)));
  const serviceCuts=K.osm.roads.filter(r=>[1065783063,1065783064,1065783065,1065783067].includes(r.id))
    .flatMap(r=>r.pts.slice(1).map((b,i)=>stripPoly(r.pts[i],b,r.width+.1)));
  for(const [a,b] of fenceRuns)for(const poly of clipped(stripPoly(a,b,2),serviceCuts))
    K.slab(poly,WALK,{mat:'streets-kerb-brick',thick:.15,ceil:false});
  for(const [x,z] of [[114.2336,-130.6556],[184.344,-157.296]])lamp(x,z,PI+.365);
  // Raised granite-edged island wrapping the existing line-3 exit 1 shaft.
  // The SE mouth remains paved and open; gotomall owns stairs and balustrades.
  const policeIsland=[[39.7,-121.3],[44.7,-124],[48.4,-121.5],[55.7,-108.1],[57.2,-103.6],[53.6,-100],[49.2,-101.9],[44,-113]];
  K.slab(policeIsland,.18,{mat:'streets-pavers',thick:.18,ceil:false}); // proxy clips exitOneHole once
  for(let i=0;i<policeIsland.length;i++){
    if(i===4||i===5)continue; // step-free mouth landing
    const a=policeIsland[i],b=policeIsland[(i+1)%policeIsland.length];K.wall(...a,...b,0,.18,{thick:.22,mat:0xc2c4bd,solid:false});
  }
  K.hpoly({tex:'grass',color:0x81964e},[[40.1,-121],[44.5,-123.4],[47.4,-121.7],[43.6,-119.8]],.186);
  for(const [x,z] of [[41.7,-121.1],[43.4,-121.8],[45.1,-122.1]])K.dome({x,z,y:.18,rx:.65,ry:.45,rz:.48,seg:8,rings:4,mat:0x617a3f});
  flat([52.2,-102],[53.8,-103.2],.6,.19,'streets-tactile');
  // A small slip-road island at Samho Garden. OSM road envelopes leave this
  // corner clear; the crossing's north landing is paving rather than shrubs.
  const slipIsland=[[466,53],[472,52],[476,57],[473,61],[468,58],[464,55]];
  K.slab(slipIsland,.18,{mat:'streets-pavers',thick:.18,ceil:false});
  K.hpoly({tex:'grass',color:0x78944d},[[467,55],[471.8,54],[474,57],[472.5,59],[468.5,57]],.185);
  for(const [x,z] of [[469,55.5],[471.5,56],[472,58]])K.dome({x,z,y:.18,rx:.65,ry:.45,rz:.6,seg:8,rings:4,mat:0x56753e});
  flat([469.8,53],[472.5,53],.6,.19,'streets-tactile');
  const pavement=(x,z)=>medianPlatforms.some(p=>K.pointInPoly(x,z,p))||roadNetwork.every(r=>nearest(x,z,[r]).d>r.width/2+.3);
  function curbSite(x,z,dx,dz){for(let t=0;t<=32;t+=.5){const xx=x+dx*t,zz=z+dz*t;if(pavement(xx,zz)&&!inBuilding(xx,zz)&&!inCut(xx,zz))return [xx,zz];}return null;}
  const pedestrianSites=[];
  function bollard(x,z,y=WALK){
    K.cyl({x,z,y,r:.085,h:.82,seg:8,mat:0x34393a});
    for(const h of [.54,.68])K.cyl({x,z,y:y+h,r:.089,h:.055,seg:8,mat:C.yellow,solid:false});
  }
  function pedestrianSignal(x,z,ux,uz){
    const site=curbSite(x,z,-ux,-uz);if(!site)return;[x,z]=site;
    if(pedestrianSites.some(p=>Math.hypot(p[0]-x,p[1]-z)<1.4))return;pedestrianSites.push(site);
    const rot=Math.atan2(ux,uz),side=[uz,-ux],P=(a,y,b=.135)=>[x+side[0]*a+ux*b,y,z+side[1]*a+uz*b];
    K.cyl({x,z,y:WALK,r:.055,h:2.95,seg:8,mat:C.steel});
    K.box({x,z,y:2.18,w:.32,h:.68,d:.23,rotY:rot,mat:0x171d21,solid:false});
    for(const [cy,green] of [[2.68,false],[2.36,true]]){
      const col=emit(green?0x1f5e48:0xff4a3b),pt=P(0,cy+.072);
      K.dome({x:pt[0],y:pt[1],z:pt[2],rx:.042,ry:.042,rz:.025,seg:8,rings:4,hemi:false,mat:col});
      beam(P(0,cy+.025),P(0,cy-.055),.019,col);
      for(const side of [-1,1]){
        beam(P(0,cy-.05),P(side*.05,cy-.13),.015,col);
        beam(P(0,cy+.015),P(side*(green?.07:.04),cy-.035),.014,col);
      }
    }
  }
  function zebra(a,b,w=5){
    const p=path([a,b]);
    for(let s=.24;s<p.L-.2;s+=.96){const q=at(p,s),r=at(p,Math.min(p.L-.15,s+.48));flat([q.x,q.z],[r.x,r.z],w,ROAD+.034,C.white);}
    for(const [end,sgn] of [[0,-1],[p.L,1]]){
      const q=at(p,end),x=q.x+q.u*sgn*.6,z=q.z+q.v*sgn*.6;
      // Warning tiles follow the walking axis; the 0.15m curb is stepable.
      if(pavement(x,z))K.box({x,z,y:WALK+.003,w:w,h:.012,d:.6,rotY:q.rot,mat:'streets-tactile',solid:false});
      const px=x-q.v*(w/2+.4),pz=z+q.u*(w/2+.4);
      pedestrianSignal(px,pz,-q.u*sgn,-q.v*sgn);
      const bx=x+q.v*(w/2-.2),bz=z-q.u*(w/2-.2);if(pavement(bx,bz))bollard(bx,bz);
    }
  }
  for(const c of crosswalks)zebra(c.a,c.b,c.w);
  function signal(a){
    const far=a.j.arms.filter(b=>b!==a&&b.u*a.u+b.v*a.v<-.55&&(!a.r.oneway||!b.incoming))
      .sort((b,c)=>Number(c.r.name===a.r.name)-Number(b.r.name===a.r.name))[0];
    const base=far||{x:a.j.x-a.u*18,z:a.j.z-a.v*18,r:a.r};
    const nx=a.v,nz=-a.u,rot=Math.atan2(a.u,a.v),reach=Math.max(6,Math.min(12,a.r.width*.65+1));
    let x=base.x+nx*(base.r.width/2+1),z=base.z+nz*(base.r.width/2+1);
    // OSM parallel carriageway widths sometimes overlap: find actual pavement
    // beyond their union before placing the mast's collision base.
    let site=curbSite(x,z,nx,nz);
    if(!site)for(const t of [4,8,12]){site=curbSite(x-a.u*t,z-a.v*t,nx,nz);if(site)break;}
    if(!site)return;[x,z]=site;
    K.cyl({x,z,y:WALK,r:.14,h:6.8,seg:10,mat:C.silver});
    K.box({x,z,y:WALK,w:.42,h:.22,d:.42,mat:0x8d9290});
    beam([x,6.85,z],[x-nx*reach,6.85,z-nz*reach],.105,C.silver);
    beam([x,6.3,z],[x-nx*2,6.85,z-nz*2],.065,C.silver);
    const busy=Math.hypot(a.j.x-358,a.j.z+261)<20;
    for(const offset of busy?[reach-.65,Math.max(3.4,reach*.47)]:[reach-.65]){
      const hx=x-nx*offset,hz=z-nz*offset;
      beam([hx,6.85,hz],[hx,6.27,hz],.045,C.steel);
      K.box({x:hx,z:hz,y:6.03,w:1.35,h:.4,d:.28,rotY:rot,mat:0x20272b,solid:false});
      for(let i=0;i<4;i++){
        const px=hx+nx*(i-1.5)*.31+a.u*.155,pz=hz+nz*(i-1.5)*.31+a.v*.155;
        K.box({x:px,z:pz,y:6.09,w:.245,h:.28,d:.11,rotY:rot,mat:0x10181b,solid:false});
        if(i===2)K.sign('←',{x:px+a.u*.061,z:pz+a.v*.061,y:6.23,w:.19,h:.19,rotY:rot,bg:'#101b18',fg:'#274b37'});
        else K.dome({x:px+a.u*.066,z:pz+a.v*.066,y:6.23,rx:.088,ry:.088,rz:.088,seg:10,rings:5,hemi:false,mat:i===0?emit(0xf73c35):i===1?0x493e22:0x214e38});
      }
    }
    if(busy){
      // The existing mast bases stay on pavement. The closer side repeater,
      // equipment box and camera make the photographed corner legible.
      K.slab(rect(x,z,1.7,1.7),WALK,{mat:'streets-pavers',thick:.15,ceil:false});
      K.box({x:x-nx*.23,z:z-nz*.23,y:3.45,w:.31,h:.9,d:.24,rotY:rot,mat:0x20272b,solid:false});
      for(let i=0;i<3;i++)K.dome({x:x-nx*.23+a.u*.15,z:z-nz*.23+a.v*.15,y:4.18-i*.27,rx:.085,ry:.085,rz:.085,seg:8,rings:4,hemi:false,mat:i===0?emit(0xef4439):0x223b31});
      K.box({x:x+nx*.25,z:z+nz*.25,y:.5,w:.38,h:.65,d:.25,rotY:rot,mat:0x8e9694,solid:false});
      beam([x,7,z],[x+a.u*.8,7.3,z+a.v*.8],.035,C.silver);
      K.box({x:x+a.u*.82,z:z+a.v*.82,y:7.22,w:.18,h:.17,d:.4,rotY:rot,mat:0xd8ddd8,solid:false});
      K.box({x:x+a.u*1.02,z:z+a.v*1.02,y:7.25,w:.13,h:.1,d:.015,rotY:rot,mat:0x202a30,solid:false});
    }
    K.sign(a.r.name||'고속터미널',{x:x-nx*2.5,z:z-nz*2.5,y:6.23,w:3.2,h:.55,rotY:rot,bg:'#155b9c',fg:'#fff',twoSided:true,box:.08});
  }
  for(const a of approaches){
    const r=a.r,lanes=laneCount(r),lw=r.width/lanes;
    // Outward-coordinate normal is the left side of approaching traffic.
    const P=(t,n)=>[a.x+a.u*t-a.v*n,a.z+a.v*t+a.u*n];
    const lo=-r.width/2+.15,hi=r.oneway?r.width/2-.15:-.3;
    flat(P(5.2,lo),P(5.2,hi),.45,ROAD+.036,C.white);
    const count=r.oneway?lanes:lanes/2;
    for(let k=0;k<count;k++)for(const t of [13.2,30.2]){
      const n=r.oneway?-r.width/2+(k+.5)*lw:-r.width/2+(k+.5)*lw;
      const point=P(t,n),q=nearest(point[0],point[1],surfaceRoads);
      if(!q.r||q.d>q.r.width/2||junctions.some(j=>insideJ(j,...point,5))||[...busMasks,...medianPlatforms].some(p=>K.pointInPoly(...point,p)))continue;
      const destinations=a.j.arms.filter(b=>b!==a&&(!b.r.oneway||!b.incoming));
      const hasLeft=destinations.some(b=>a.u*b.v-a.v*b.u>.55),hasRight=destinations.some(b=>a.u*b.v-a.v*b.u<-.55);
      const route=path([P(t+3,n),P(t-3,n)]),turn=k===count-1&&count>1&&hasLeft?'left':k===0&&hasRight?'straightRight':'straight';
      arrow(route,3,0,ROAD+.037,false,turn);
    }
    signal(a);
  }
  // Solid 0.45 m route guidance begins at the stop line, follows one lane and
  // bends into its receiving lane. Do not paint every possible approach: that
  // produced a fictitious pink X through every junction in the round-8 views.
  function guideCurve(a,b,color,left=false){
    const inn=left?(a.r.oneway?a.r.width/2-1.8:-1.8):-a.r.width/2+1.8,out=left?(b.r.oneway?-b.r.width/2+1.8:1.8):b.r.width/2-1.8;
    const start=[a.x+a.u*5.2-a.v*inn,a.z+a.v*5.2+a.u*inn];
    const end=[b.x+b.u*5.2-b.v*out,b.z+b.v*5.2+b.u*out];
    // Straight approach/departure tails keep the curve tangent to the lane.
    const lead=6,sa=[start[0]-a.u*lead,start[1]-a.v*lead],eb=[end[0]-b.u*lead,end[1]-b.v*lead];
    flat(start,sa,.45,ROAD+.031,color);flat(eb,end,.45,ROAD+.031,color);
    const d=Math.hypot(eb[0]-sa[0],eb[1]-sa[1])*(left?.58:.33);
    const c=[sa[0]-a.u*d,sa[1]-a.v*d],e=[eb[0]-b.u*d,eb[1]-b.v*d];let prev=sa;
    for(let i=1;i<=36;i++){const t=i/36,s=1-t,next=[s*s*s*sa[0]+3*s*s*t*c[0]+3*s*t*t*e[0]+t*t*t*eb[0],s*s*s*sa[1]+3*s*s*t*c[1]+3*s*t*t*e[1]+t*t*t*eb[1]];
      flat(prev,next,.45,ROAD+.03,color);prev=next;
    }
  }
  for(const j of junctions.filter(j=>j.arms.length>=4&&j.hu+j.hv>31)){
    const incoming=j.arms.filter(a=>a.owned&&a.incoming),paired=incoming.filter(a=>a.r.oneway);
    const trunk=(paired.length?paired:incoming).sort((a,b)=>b.r.width-a.r.width)[0]?.r.name;
    // junction_01/02/03 show the Sinbanpo route lines continuing across the
    // box. Jamwon's perpendicular movements do not need another coloured X.
    for(const a of incoming.filter(a=>a.r.name===trunk).slice(0,2)){
      const exits=j.arms.filter(b=>b!==a&&(!b.r.oneway||!b.incoming));
      const straight=exits.find(b=>b.r.name===a.r.name&&a.u*b.u+a.v*b.v<-.8);
      const left=exits.find(b=>a.u*b.v-a.v*b.u>.65);
      if(straight)guideCurve(a,straight,0x50cbb1);if(left)guideCurve(a,left,0xe477a1,true);
    }
  }
  K.texture('streets-bus-stencil',256,512,(g,w,h)=>{g.clearRect(0,0,w,h);g.fillStyle='#e8e5d7';g.font='bold 105px "Apple SD Gothic Neo", "Malgun Gothic", sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('버스',128,170);g.fillText('전용',128,340);},[2,5],{transparent:true});
  // Two surveyed busways take precedence at the median stops. Beyond them the
  // innermost lane of each Sinbanpo carriageway continues the bus demarcation.
  const blueRoads=surfaceRoads.filter(r=>r.name==='신반포로'&&major(r)&&r.oneway);
  for(const r of [...blueRoads,...medianBusWays]){
    const p=path(r.pts),bus=r.hw==='busway';
    const lane=bus?0:-r.width/2+r.width/laneCount(r)/2;
    const bounds=bus?[-2.8,2.8]:[-r.width/2+.9,-r.width/2+r.width/laneCount(r)];
    for(const edge of bounds)for(let s=0;s<p.L;s+=8){
      const q=at(p,s),nearStop=[[-70.27,-95.53],[6.55,-132.2],[559.18,-333.88]].some(([x,z])=>Math.hypot(q.x-x,q.z-z)<25);
      for(const delta of nearStop?[-.14,.14]:[0]){
        const end=Math.min(p.L,s+(nearStop?8:3));
        for(let t=s;t<end;t+=2){const a=at(p,t,edge+delta),b=at(p,Math.min(end,t+2),edge+delta);paint(stripPoly([a.x,a.z],[b.x,b.z],.15),C.blue,ROAD+.027,!bus);}
      }
    }
    for(let s=35;s<p.L;s+=100){const q=at(p,s,lane);if(junctions.some(j=>insideJ(j,q.x,q.z,22))||(!bus&&medianBusWays.some(b=>nearest(q.x,q.z,[b]).d<7)))continue;
      const rot=q.rot+PI,c=Math.cos(rot),sn=Math.sin(rot),P=(x,z)=>[q.x+x*c+z*sn,ROAD+.032,q.z-x*sn+z*c];
      K.quad('streets-bus-stencil',[P(-1,2.5),P(1,2.5),P(1,-2.5),P(-1,-2.5)],[0,1,0]);
    }
  }
  function shelter(x,z,name,id='',island=false,roadId) {
    const near=nearest(x,z,roadId?[byId.get(roadId)]:surfaceRoads),rot=near.rot-PI/2+(island?PI:0),c=Math.cos(rot),s=Math.sin(rot),P=(u,v)=>({x:x+u*c+v*s,z:z-u*s+v*c});
    K.box({x,z,y:0,w:island?26:8,h:WALK,d:island?3.2:3.1,rotY:rot,mat:'streets-pavers'});
    const tactile=P(0,1.35);K.box({...tactile,y:WALK+.006,w:island?25:7.7,h:.014,d:.35,rotY:rot,mat:'streets-tactile',solid:false});
    K.box({x,z,y:2.9,w:6.6,h:.16,d:2.7,rotY:rot,mat:C.steel,solid:false});K.box({x,z,y:2.86,w:6.2,h:.025,d:1.9,rotY:rot,mat:emit(0xfff0d2),solid:false});
    for(const u of [-3,0,3]) {const p=P(u,-.95);K.box({...p,y:WALK,w:.1,h:2.77,d:.1,mat:C.steel});}
    for(const u of [-1.5,1.5]) {const p=P(u,-.98);K.box({...p,y:.65,w:2.85,h:2.02,d:.045,rotY:rot,mat:'glass',solid:true});}
    for(const v of [-1.2,1.2]) {const p=P(0,v);K.sign([name,id?'정류소 '+id:'서울 시내버스'],{...p,y:2.61,w:5.5,h:.46,rotY:rot+(v<0?PI:0),bg:'#133b52',fg:'#fff'});}
    const led=P(1.8,-.86);K.sign(['버스 도착 안내','노선 정보 확인'],{...led,y:2.03,w:1.7,h:.56,rotY:rot,bg:'#091718',fg:'#f2bd43',box:.05});
    const map=P(-2.6,-.89);K.sign(['주변 안내','고속터미널역','반포한강공원'],{...map,y:1.52,w:.58,h:1.25,rotY:rot,bg:'#e8e7db',fg:'#254859'});
    const bench=P(-.4,-.6);K.box({...bench,y:.57,w:2.9,h:.09,d:.48,rotY:rot,mat:'wood'});for(const u of [-1.5,.8]){const p=P(u,-.6);K.box({...p,y:WALK,w:.12,h:.42,d:.4,mat:C.steel});}
    for(let i=0;i<4;i++){const p=P(-1.8+i*1.15,.4+(i%2)*.2);K.person(p.x,WALK,p.z,{shirt:[0xf1e3cc,0x283e55,0x914d3d,0x5e7967][i]});}
    const pole=P(4,0);K.cyl({...pole,y:WALK,r:.075,h:3.6,mat:C.steel});K.sign(['버스',id||name],{...pole,y:3.05,w:.9,h:.9,rotY:rot,bg:'#1768a5',fg:'#fff',twoSided:true});
    if(island){
      // street_01: paired narrow dark-steel shelters, upright information
      // screens, granite platform edge and black post-and-rail fencing.
      const second=P(-8.3,0);
      K.box({...second,y:2.9,w:6.6,h:.16,d:2.7,rotY:rot,mat:0x2e383b,solid:false});
      for(const u of [-11.3,-8.3,-5.3]){const a=P(u,-.95);K.box({...a,y:WALK,w:.09,h:2.77,d:.09,mat:C.steel});}
      for(const u of [-9.8,-6.8]){const a=P(u,-.98);K.box({...a,y:.55,w:2.85,h:2.12,d:.035,rotY:rot,mat:'glass',solid:false});}
      const seat=P(-8.3,-.55);K.box({...seat,y:.57,w:3.1,h:.09,d:.48,rotY:rot,mat:'wood'});
      for(const u of [-11.4,2.9]){
        const a=P(u,-.55);K.box({...a,y:.2,w:.8,h:2.45,d:.16,rotY:rot,mat:0x202c31,solid:false});
        const screen=P(u,-.43);K.sign(['서울','버스 안내','고속터미널'],{...screen,y:1.55,w:.65,h:1.9,rotY:rot,bg:'#acd4dd',fg:'#183a50'});
      }
      function fence(start,end,v){const a=P(start,v),b=P(end,v);
        for(const y of [.48,.85,1.12])beam([a.x,y,a.z],[b.x,y,b.z],.028,0x293b3a);
        for(let u=start;u<=end+.01;u+=1.7){const q=P(u,v);K.box({...q,y:WALK,w:.085,h:1.04,d:.085,mat:0x293b3a,solid:false});K.box({...q,y:1.13,w:.16,h:.06,d:.16,mat:0x293b3a,solid:false});}
        K.phys.addWall(a.x,a.z,b.x,b.z,WALK,1.18,.035,'streets');
      }
      fence(-12.7,12.7,-1.49);for(const [a,b] of [[-12.7,-11.9],[-4.7,-3.6],[4.8,12.7]])fence(a,b,1.49);
      for(const v of [-1.6,1.6]){const a=P(-13,v),b=P(13,v);K.wall(a.x,a.z,b.x,b.z,0,WALK,{thick:.18,mat:0xbfc2bc,solid:false});}
    }
    K.zone({name,floor:'지상',sub:id?'버스정류장 · '+id:'버스정류장',poly:rect(x,z,30,10),y0:0,y1:4,priority:4});
    return {rot,P};
  }
  const stopSpecs=[[-70.27,-95.53,'고속터미널(중)','22020',true,1420100043],[6.55,-132.2,'고속터미널','',true,1420100042],[-89.24,-115.7,'고속터미널','',false],[-145.79,-94.99,'호남고속·신세계','',false],[-171.44,-45.71,'고속터미널호남선','22220',false],[137.14,155.74,'고속터미널역 3번출구','',false],[407.01,-117.03,'고속터미널','',false],[559.18,-333.88,'반포역','22018',true],[-400.22,-210.78,'반포대교남단·한강공원입구','',false],[-70.52,518.16,'서울성모병원·서울지방조달청','',false]];
  for(const [x,z,n,id,isl,roadId] of stopSpecs)if(id!=='22220')shelter(x,z,n,id,isl===true,roadId);
  // cc_02: continuous pale-frame glass canopy west of the CC forecourt. The
  // OSM stop is its east end; extend 36m west along the surveyed curb tangent.
  {
    const end=ccStop,ux=ccUx,uz=ccUz,rot=Math.atan2(-uz,ux);
    // OSM stop nodes lie in the carriageway. Move the canopy behind the curb
    // rather than centring its columns on that node (cc_02 south sidewalk).
    const P=(u,v)=>({x:end.x+ux*(u-18)-uz*(v+3.2),z:end.z+uz*(u-18)+ux*(v+3.2)});
    const center=P(0,0),frame=0xb8c1bf;
    K.box({...center,y:ROAD,w:36.4,h:WALK-ROAD,d:3.5,rotY:rot,mat:'streets-pavers'});
    K.box({...center,y:3.17,w:36.4,h:.045,d:3.4,rotY:rot,mat:{tex:'glass',color:0xc7d7d3},solid:false});
    for(const v of [-1.7,1.7]){const p=P(0,v);K.box({...p,y:3.14,w:36.4,h:.12,d:.09,rotY:rot,mat:frame,solid:false});}
    for(let u=-18;u<=18;u+=6){
      const p=P(u,0);K.box({...p,y:3.1,w:.1,h:.12,d:3.4,rotY:rot,mat:frame,solid:false});
      // Slim pale arched supports, limited to the glass roof's 3.2m height.
      for(const side of [-1,1]){
        let prev=P(u,side*1.5),py=WALK;
        for(let k=1;k<=6;k++){
          const t=k/6,point=P(u,side*(1.5-.6*t*t)),y=WALK+(3.1-WALK)*t;
          beam([prev.x,py,prev.z],[point.x,y,point.z],.055,0xd5dad6);prev=point;py=y;
        }
      }
    }
    for(let u=-15;u<=15;u+=6){
      const p=P(u,1.45);K.box({...p,y:.45,w:5.8,h:2.3,d:.035,rotY:rot,mat:{tex:'glass',color:0xc2d0c9},solid:false});
    }
    for(const u of [-14,10]){
      const p=P(u,1.35);K.box({...p,y:.3,w:1.3,h:2.05,d:.15,rotY:rot,mat:frame,solid:false});
      // Only broad green/cream colour blocks are resolved in the photograph.
      const f=P(u,1.25);K.box({...f,y:.4,w:1.16,h:1.8,d:.015,rotY:rot,mat:emit(0x748d84),solid:false});
      const lower=P(u,1.24);K.box({...lower,y:.4,w:1.16,h:.45,d:.015,rotY:rot,mat:emit(0xd6d7c6),solid:false});
    }
    const label=P(14,-1.71);K.sign('고속터미널호남선',{...label,y:2.94,w:4.1,h:.28,rotY:rot+PI,bg:'#56645f',fg:'#eee'});
    K.zone({name:'고속터미널호남선',floor:'지상',sub:'버스정류장 · 22220',poly:stripPoly([P(-18,0).x,P(-18,0).z],[P(18,0).x,P(18,0).z],4),y0:0,y1:4,priority:4});
  }
  const busRoad=byId.get(1420100043),bq=nearest(-69,-96,[busRoad]);
  K.vehicle({x:bq.x,z:bq.z,y:ROAD,rotY:bq.rot,kind:'cityBus',color:0x2367ac,label:'142 고속터미널'});
  const westBus=nearest(8,-132,[byId.get(1420100042)]);K.vehicle({x:westBus.x,z:westBus.z,y:ROAD,rotY:westBus.rot,kind:'cityBus',color:0x2367ac,label:'360 고속터미널'});
  const bus2=at(path(byId.get(523344143).pts),190,-5.3);K.vehicle({x:bus2.x,z:bus2.z,y:ROAD,rotY:bus2.rot,kind:'cityBus',color:0x4d9c50,label:'반포역'});
  // Rental stations retain OSM locations and verified station numbers.
  function bike(x,z,rot) {
    const c=Math.cos(rot),s=Math.sin(rot),P=(u,y,v=0)=>[x+u*c+v*s,y,z-u*s+v*c];
    for(const u of [-.63,.63]){for(let j=0;j<12;j++){const a=j*PI/6,b=(j+1)*PI/6;beam(P(u+Math.cos(a)*.33,.53+Math.sin(a)*.33),P(u+Math.cos(b)*.33,.53+Math.sin(b)*.33),.025,0x263035);}beam(P(u,.53),P(u+.28,.71),.012,C.silver);}
    for(const [a,b] of [[[-.63,.53],[-.17,1.05]],[[-.17,1.05],[.23,.55]],[[.23,.55],[-.63,.53]],[[.23,.55],[.46,1.1]],[[.46,1.1],[-.17,1.05]],[[.46,1.1],[.63,.53]]])beam(P(...a),P(...b),.035,0x86bd4c);
    beam(P(-.17,1.05),P(-.17,1.24),.03,C.silver);beam(P(-.32,1.24),P(.0,1.24),.06,0x202a2b);
    beam(P(.46,1.1),P(.43,1.38),.03,C.silver);beam(P(.43,1.38,-.24),P(.43,1.38,.24),.026,0x222a2b);
    const bag=P(.7,1.05);K.box({x:bag[0],z:bag[2],y:1.05,w:.36,h:.26,d:.38,rotY:rot,mat:'streets-grate',solid:false});
  }
  const bikePois=K.osm.pois.filter(p=>p.kind==='bicycle_rental'&&p.x>-450&&p.x<600&&p.z>-600&&p.z<550);
  for(const p of bikePois) {
    const q=nearest(p.x,p.z),rot=q.rot-PI/2,c=Math.cos(rot),s=Math.sin(rot);
    K.box({x:p.x,z:p.z,y:0,w:8.6,h:WALK,d:2.8,rotY:rot,mat:'streets-pavers'});
    for(let i=0;i<7;i++){const u=(i-3)*1.02,x=p.x+c*u,z=p.z-s*u;K.box({x,z,y:WALK,w:.12,h:.7,d:.5,rotY:rot,mat:0x97bb7b});if(i!==2&&i!==5)bike(x,z,q.rot);}
    const x=p.x-c*4.3,z=p.z+s*4.3;K.box({x,z,y:WALK,w:.65,h:2.2,d:.2,rotY:rot,mat:0x347a43});
    K.sign(['따릉이',p.ref],{x,z,y:1.97,w:.6,h:.62,rotY:rot,bg:'#3b8a49',fg:'#fff',twoSided:true});
    K.sign(p.name.replace('gate','출입구'),{x:p.x,z:p.z,y:.34,w:7.8,h:.23,rotY:rot,bg:'#e5eddf',fg:'#315735'});
  }
  function guide(x,z,rot,lines) {
    const c=Math.cos(rot),s=Math.sin(rot);for(const u of [-5.4,5.4]){K.cyl({x:x+c*u,z:z-s*u,y:0,r:.13,h:7.9,mat:C.silver,seg:8});}
    beam([x-c*5.4,7.7,z+s*5.4],[x+c*5.4,7.7,z-s*5.4],.13,C.silver);
    K.sign(lines,{x,z,y:6.5,w:9.5,h:2.05,rotY:rot,bg:'#086249',fg:'#fff',box:.12});
  }
  guide(-274,-11,PI/2+.36,['↑ 반포대교 · 한강공원','← 동작대교     강남역 →']);
  guide(235,137,PI/2+.46,['↑ 강남역','서초IC · 경부고속도로']);
  guide(-365,-134,-.36,['↑ 반포대교','반포한강공원']);
  // Round 8: photo taxi/06 supplies the white arch, clear roof and dark sign beam.
  // No taxi POI is present in this OSM extract. Both curb positions are inferred;
  // the terminal service-lane stand stays west of the surveyed arch crossing.
  // Hoisted so earlier automatic street furniture can reserve these footprints.
  function inTaxiStand(x,z) {
    for(const [cx,cz,a] of [[-111.887,-61.999,.371006],[103.774,-133.587,-.047950]]) {
      const dx=x-cx,dz=z-cz,c=Math.cos(a),s=Math.sin(a);
      if(Math.abs(dx*c-dz*s)<11&&Math.abs(dx*s+dz*c)<3.6)return true;
    }
    // Reserve the photographed wall/bench approach as well as the smoking booth.
    const dx=x+115.4,dz=z+48.7,t=dx*.254-dz*.967,n=dx*.967+dz*.254;
    return Math.hypot(x+118,z+44)<3.3||(t>-3&&t<12&&Math.abs(n)<3.5);
  }
  K.texture('streets-taxi-granite',256,256,(g,w,h)=>{
    g.fillStyle='#777b7b';g.fillRect(0,0,w,h);
    const noise=K.rand(806);
    for(let i=0;i<3800;i++){const v=94+Math.floor(noise()*62);g.fillStyle=`rgb(${v},${v+2},${v+2})`;g.fillRect(noise()*w,noise()*h,1,1);}
    g.strokeStyle='#555a59';g.lineWidth=1.5;
    for(let j=0;j<=4;j++){g.beginPath();g.moveTo(0,j*64);g.lineTo(w,j*64);g.stroke();for(let i=-1;i<3;i++)g.strokeRect(i*128+(j%2)*64,j*64,128,64);}
  },[2.4,1.6]);
  K.texture('streets-taxi-wall',256,256,(g,w,h)=>{
    g.fillStyle='#805e50';g.fillRect(0,0,w,h);
    const noise=K.rand(805);
    for(let i=0;i<6500;i++){g.fillStyle=['#473e38','#b29679','#a17e64','#6c5044'][i%4];g.fillRect(noise()*w,noise()*h,1+noise()*2,1+noise()*2);}
    g.strokeStyle='#56473f';g.lineWidth=2;g.strokeRect(0,0,w,h);
  },[1.2,.8]);
  function taxiStand(roadId,anchor,name) {
    const r=byId.get(roadId),p=path(r.pts),q=nearest(...anchor,[r]),off=r.width/2+2.2;
    const rot=Math.atan2(-q.v,q.u),cx=q.x-q.v*off,cz=q.z+q.u*off;
    const P=(u,v,y=0)=>[cx+q.u*u-q.v*v,y,cz+q.v*u+q.u*v];
    const B=(u,v,y,w,d,h,mat,solid=false)=>{const a=P(u,v,y);K.box({x:a[0],y,z:a[2],w,d,h,rotY:rot,mat,solid});};
    const poly=[P(-9.4,-1.9),P(9.4,-1.9),P(9.4,2.2),P(-9.4,2.2)].map(a=>[a[0],a[2]]);
    K.slab(poly,WALK,{mat:'streets-pavers',thick:.15,ceil:false});
    K.hpoly('streets-taxi-granite',poly,WALK+.012);
    // Clear 1.4m rear walking aisle; kerb rails break at the boarding opening.
    B(0,.85,WALK+.006,18,.35,.014,'streets-tactile');
    B(5.6,-.35,WALK+.006,.65,2.75,.014,'streets-tactile');
    const roofY=v=>3.15+.36*Math.cos(v/1.85*PI/2);
    for(let u=-9;u<9;u+=1.5)for(let v=-1.85;v<1.84;v+=.925){
      K.quad({tex:'glass',color:0xc7dedf},[P(u,v,roofY(v)),P(u+1.5,v,roofY(v)),P(u+1.5,v+.925,roofY(v+.925)),P(u,v+.925,roofY(v+.925))],[0,1,0]);
      beam(P(u,v,roofY(v)),P(u,v+.925,roofY(v+.925)),.035,0x56656b);
    }
    for(const v of [-1.85,0,1.85])beam(P(-9,v,roofY(v)),P(9,v,roofY(v)),.055,0x536067);
    for(const u of [-9,-4.5,0,4.5,9])for(const side of [-1,1]){
      const base=P(u,side*1.62,WALK);
      K.cyl({x:base[0],z:base[2],y:WALK,r:.19,h:.7,seg:10,mat:0xf0efea});
      let prev=base;
      for(let k=1;k<=12;k++){
        const t=k/12,point=P(u,side*(1.62-.58*t*t),WALK+(3.2-WALK)*t);
        beam(prev,point,.18,0xf0efea);prev=point;
      }
      beam(prev,P(u,0,roofY(0)),.12,0xf0efea);
    }
    // A dark street-facing fascia carries the same sign on both visible faces.
    B(0,-1.88,2.83,18,.14,.35,0x303639);
    const signP=P(0,-1.88,3.015);
    // Photo06: small lettering on the continuous fascia, rather than an
    // oversized separate signboard. The original curved white posts remain.
    for(const face of [rot,rot+PI])K.sign(['TAXI','택시승차'],{x:signP[0],z:signP[2],y:3.015,w:1.2,h:.31,rotY:face,bg:null,fg:'#eeeeea',offset:.085});
    for(const u of [-7.5,-3,1.5,6])B(u,-1.65,2.78,.22,.13,.045,emit(0xe4e4d9));
    function queueRail(a,b,v,glass=false){
      const pa=P(a,v),pb=P(b,v);
      for(let u=a;u<=b+.01;u+=1.8)B(u,v,WALK,.055,.055,1.08,0x303b3e,true);
      for(const y of [.45,1.12])beam(P(a,v,y),P(b,v,y),.035,0x303b3e);
      K.phys.addWall(pa[0],pa[2],pb[0],pb[2],WALK,1.15,.025,'streets');
      if(glass)K.quad({tex:'glass',color:0xc4d3cd},[P(a,v,.47),P(b,v,.47),P(b,v,1.08),P(a,v,1.08)],[-q.v,0,q.u]);
    }
    queueRail(-8.6,3.8,-1.7,true);queueRail(7.4,8.6,-1.7,true);
    queueRail(-6.8,2.5,-.32);
    for(const [u,v,shirt] of [[-5.7,.22,0x303639],[-3.1,.22,0x293034],[-1.1,.7,0x242d31],[.5,.22,0xddd7c7],[3.2,-.7,0x424b50]]){const a=P(u,v,WALK);K.person(a[0],WALK,a[2],{rotY:rot+PI,shirt,pants:0x30373b});}
    for(const u of [-6.4,.05]){
      B(u,.28,WALK,.33,.25,.48,u<0?0x8e2433:0x5f4e59);beam(P(u-.1,.28,.62),P(u-.1,.28,.93),.018,C.silver);beam(P(u+.1,.28,.62),P(u+.1,.28,.93),.018,C.silver);beam(P(u-.1,.28,.93),P(u+.1,.28,.93),.024,C.steel);
    }
    // Decorative twin lantern, as in the canopy photo, set behind the queue.
    const lp=P(-7.5,2.6,WALK);K.cyl({x:lp[0],z:lp[2],y:WALK,r:.105,h:3.7,seg:10,mat:0x303a3e});
    for(const u of [-8.1,-6.9]){
      beam(P(-7.5,2.6,3.35),P(u,2.6,3.55),.06,0x303a3e);
      const a=P(u,2.6,3.75);K.dome({x:a[0],z:a[2],y:a[1],rx:.18,ry:.25,rz:.18,mat:emit(0xe7e9df),hemi:false,seg:8,rings:5});
      beam(P(u,2.6,3.55),P(u,2.6,4.03),.035,0x303a3e);
    }
    let station=0,best=Infinity;
    for(let i=1;i<r.pts.length;i++){
      const a=r.pts[i-1],b=r.pts[i],dx=b[0]-a[0],dz=b[1]-a[1],len=p.cum[i]-p.cum[i-1],t=Math.max(0,Math.min(1,((q.x-a[0])*dx+(q.z-a[1])*dz)/(len*len)));
      const dist=Math.hypot(q.x-a[0]-dx*t,q.z-a[1]-dz*t);if(dist<best){best=dist;station=p.cum[i-1]+len*t;}
    }
    for(let i=0;i<3;i++){
      // Hold cars behind the boarding point on the service lane. The previous
      // three-abreast camera composition was the queue's front, not gb_03's arch.
      const a=at(p,station-21+i*6.6,r.width/2-1.15),col=[0xb7bdbe,0xf1f1e8,0xd7dddc][i];
      K.vehicle({x:a.x,z:a.z,y:ROAD,rotY:a.rot,kind:'taxi',color:col});
      const nx=Math.cos(a.rot),nz=-Math.sin(a.rot);
      for(const side of [-1,1])K.sign(i===2?'카카오 T':'서울 택시',{x:a.x+nx*side*.944,z:a.z+nz*side*.944,y:.78,w:1.25,h:.24,rotY:a.rot+side*PI/2,bg:null,fg:'#25323b',offset:.015});
    }
    K.zone({name,floor:'1F',sub:'택시 승차장',poly,y0:0,y1:4,priority:5});
    const sp=P(5.6,1.45,WALK);K.spawn({name,x:sp[0],z:sp[2],y:WALK,yaw:rot,group:'고속터미널 거리'});
  }
  taxiStand(218913527,[-115,-70],'호남선 · 센트럴시티 택시 승차장');
  taxiStand(1065783063,[104,-138.3],'경부선 터미널 택시 승차장');
  // Photo06's green village bus is across the carriageway, not in the taxi bay.
  {const a=nearest(-112,-84,[byId.get(1420100043)]);K.vehicle({x:a.x,z:a.z,y:ROAD,rotY:a.rot,kind:'cityBus',color:0x3c963d,label:'서초14'});}
  // Photo05: a clear granite promenade past the smoking booth, brown stone
  // planter to the left and two paired red cylindrical benches to the right.
  // Its orientation/length remains inferred from the established curb location.
  {
    const ux=.254,uz=-.967,nx=.967,nz=.254,rot=Math.atan2(ux,uz);
    const P=(t,n,y=.15)=>[-115.4+ux*t+nx*n,y,-48.7+uz*t+nz*n];
    const footprint=[P(-2.5,-2.25),P(11.7,-2.25),P(11.7,2.45),P(-2.5,2.45)].map(p=>[p[0],p[2]]);
    K.slab(footprint,.15,{mat:'streets-taxi-granite',thick:.15,ceil:false});
    const a=P(-2.5,-2.5),b=P(8.2,-2.5);
    K.wall(a[0],a[2],b[0],b[2],.15,1.22,{thick:.34,mat:{tex:'streets-taxi-wall',gloss:.3}});
    beam(P(-2.5,-2.5,1.24),P(8.2,-2.5,1.24),.18,{tex:'streets-taxi-wall',gloss:.3});
    // Planting stays behind the wall; neither a shrub nor a branch blocks the aisle.
    const bed=[P(-2.5,-3.6),P(8.2,-3.6),P(8.2,-2.7),P(-2.5,-2.7)].map(p=>[p[0],p[2]]);
    K.hpoly({tex:'grass',color:0x354b32},bed,1.17);
    for(const t of [0,3.5,7]){const a=P(t,-3.1,1.17);K.dome({x:a[0],y:a[1],z:a[2],rx:.42,ry:.35,rz:.55,mat:0x3f573d,seg:8,rings:4});}
    for(const t of [1.8,6.5]){
      for(const n of [1.52,1.88]){
        const a=P(t-1,n,.69),b=P(t+1,n,.69);beam(a,b,.16,0x9e2832);
        for(const [end,normal] of [[a,[-ux,0,-uz]],[b,[ux,0,uz]]])for(let i=0;i<12;i++){
          const q=ang=>[end[0]+nx*.16*Math.cos(ang),end[1]+.16*Math.sin(ang),end[2]+nz*.16*Math.cos(ang)];
          K.quad(0xa93038,[end,q(i*PI/6),q((i+1)*PI/6),end],normal);
        }
      }
      for(const dt of [-.65,.65]){const a=P(t+dt,1.7,.15);K.box({x:a[0],z:a[2],y:.15,w:.2,d:.4,h:.45,rotY:rot,mat:0x842833});}
    }
    const walker=P(8.8,.3);K.person(walker[0],.15,walker[2],{rotY:rot+PI,shirt:0x5c6265,pants:0x9b978c});
  }
  // taxi/05 shows a glass smoking booth beside the plaza. This small enclosure's
  // position is inferred in the east edge of the existing forecourt, off its door axis.
  {
    const x=-118,z=-44,rot=.3724,c=Math.cos(rot),s=Math.sin(rot),P=(u,v)=>[x+c*u+s*v,z-s*u+c*v];
    const poly=[P(-1.8,-1.2),P(1.8,-1.2),P(1.8,1.2),P(-1.8,1.2)];
    K.slab(poly,.15,{mat:'streets-pavers',thick:.15,ceil:false});
    K.polyWalls(poly,.15,2.55,{mat:{tex:'glass',color:0xa9bfc2},thick:.04,openings:[{x:x+s*1.2,z:z+c*1.2,w:1.15,y0:.15,y1:2.3}]});
    for(const [px,pz] of poly)K.box({x:px,z:pz,y:.15,w:.08,h:2.5,d:.08,rotY:rot,mat:0x5c686e});
    K.box({x,z,y:2.6,w:3.75,h:.15,d:2.55,rotY:rot,mat:0x667278,solid:false});
    K.sign('흡연부스',{x:x+s*1.23,z:z+c*1.23,y:2.4,w:2.6,h:.3,rotY:rot,bg:'#5c686e',fg:'#f3f2ea'});
    for(const u of [-1.35,1.35]){const p=P(u,-.55);K.cyl({x:p[0],z:p[1],y:.15,r:.13,h:.85,seg:10,mat:C.silver});K.cyl({x:p[0],z:p[1],y:1,r:.15,h:.035,seg:10,mat:0x333b3d,solid:false});}
    for(const u of [-1,0,1]){const p=P(u,-.95);K.box({x:p[0],z:p[1],y:2.36,w:.62,h:.16,d:.08,rotY:rot,mat:0x323b3e,solid:false});}
  }
  // G2's mural corridor belongs to the separate onebailey task, not this street
  // sign. Research uses the 2025 report's ~350m Seoul / ~160m Picasso lengths;
  // no corridor or underground connection is fabricated here without a junction.
  K.sign(['반포한강공원 가는 길','← 고투몰 출구 · 반포대로'],{x:-297,z:-30,y:2.1,w:3.1,h:.85,rotY:.36,bg:'#234d40',fg:'#fff',box:.1});

  // Flyover: approach ways tagged layer=0 are real ramps, not flat end stubs.
  for(const id of flyIds) {
    const r=byId.get(id),p=path(r.pts),w=14.2,H=s=>id===1420100038?mix(ROAD,6.5,s/p.L):id===480856736?mix(6.5,ROAD,s/p.L):6.5;
    for(let s=0;s<p.L;s+=5){const e=Math.min(p.L,s+5),a=at(p,s),b=at(p,e),ya=H(s),yb=H(e);
      K.ramp(a.x,a.z,b.x,b.z,{w,ya,yb,mat:'asphalt',rails:false});
      const poly=stripPoly([a.x,a.z],[b.x,b.z],w);
      K.quad(0x9ca7ad,[[poly[3][0],ya-.85,poly[3][1]],[poly[2][0],yb-.85,poly[2][1]],[poly[1][0],yb-.85,poly[1][1]],[poly[0][0],ya-.85,poly[0][1]]],[0,-1,0]);
      for(const side of [-1,1]){const aa=at(p,s,side*(w/2+.05)),bb=at(p,e,side*(w/2+.05));
        K.quad({tex:'concrete',color:0xb2bac0},[[aa.x,ya-.85,aa.z],[bb.x,yb-.85,bb.z],[bb.x,yb+.7,bb.z],[aa.x,ya+.7,aa.z]],[side*-a.v,0,side*a.u]);
        rail([aa.x,aa.z],[bb.x,bb.z],ya,yb);
        if(ya>4.5&&yb>4.5){K.quad('glass',[[aa.x,ya+.7,aa.z],[bb.x,yb+.7,bb.z],[bb.x,yb+2.2,bb.z],[aa.x,ya+2.2,aa.z]],[side*-a.v,0,side*a.u]);beam([aa.x,ya+.65,aa.z],[aa.x,ya+2.2,aa.z],.045,C.silver);beam([aa.x,ya+2.2,aa.z],[bb.x,yb+2.2,bb.z],.045,C.silver);}
      }
    }
    markings({...r,width:w,lanes:4},p,H);
    for(let s=20;s<p.L-8;s+=30){const q=at(p,s),h=H(s);if(h<4.5)continue;K.cyl({x:q.x,z:q.z,y:0,r:.85,h:h-1,seg:12,mat:{tex:'concrete',color:0xc2c2b8}});K.box({x:q.x,z:q.z,y:h-1.2,w:11,h:.55,d:2,rotY:q.rot,mat:'concrete',solid:false});}
    for(let s=28;s<p.L-15;s+=65){const q=at(p,s,2);K.vehicle({x:q.x,z:q.z,y:H(s),rotY:q.rot,kind:'car'});const l=at(p,s,-7.3);lamp(l.x,l.z,q.rot+PI/2,H(s));}
    for(let i=1;i<r.pts.length;i++)K.zone({name:'강남터미널고가도로',floor:'고가',sub:'반포대로 · 반포대교 방면',poly:stripPoly(r.pts[i-1],r.pts[i],16),y0:3.5,y1:10,priority:5});
  }
  K.sign('강남터미널고가도로',{x:-334.4,z:1,y:5.6,w:9,h:.7,rotY:PI/2+.43,bg:'#71858b',fg:'#fff'});

  // Sapyeong underpass: one continuous opening avoids overlapping ground holes.
  const tp=path([[-433.45,473.1],[-374.6,443.745],[-211.18,362.25],[-79.33,301.845],[74.27,222.13],[85.2,217.68]]);
  const west=tp.cum[2],east=tp.cum[3],TW=17;
  const tunnelH=s=>s<west?mix(ROAD,-6,s/west):s>east?mix(-6,ROAD,(s-east)/(tp.L-east)):-6;
  // Single mitered cut; its top is restored over the roofed tunnel only.
  const left=[],right=[];
  for(let i=0;i<tp.pts.length;i++){const a=tp.pts[Math.max(0,i-1)],b=tp.pts[Math.min(tp.pts.length-1,i+1)],dx=b[0]-a[0],dz=b[1]-a[1],L=Math.hypot(dx,dz);left.push([tp.pts[i][0]-dz/L*9,tp.pts[i][1]+dx/L*9]);right.push([tp.pts[i][0]+dz/L*9,tp.pts[i][1]-dx/L*9]);}
  K.groundHole([...left,...right.reverse()]);
  for(let s=0;s<tp.L;s+=4){const e=Math.min(tp.L,s+4),a=at(tp,s),b=at(tp,e),ya=tunnelH(s),yb=tunnelH(e),covered=s>=west&&e<=east;
    K.ramp(a.x,a.z,b.x,b.z,{w:TW,ya,yb,mat:'asphalt',rails:false});
    for(const side of [-1,1]){
      const aa=at(tp,s,side*(TW/2)),bb=at(tp,e,side*(TW/2));
      K.quad({tex:'concrete',color:0xc4c7bf},[[aa.x,ya,aa.z],[bb.x,yb,bb.z],[bb.x,1,bb.z],[aa.x,1,aa.z]],[side*a.v,0,side*-a.u]);
      K.phys.addWall(aa.x,aa.z,bb.x,bb.z,Math.min(ya,yb),1,.15,'streets');
      K.quad(0x747d7b,[[aa.x,ya+.35,aa.z],[bb.x,yb+.35,bb.z],[bb.x,yb+.65,bb.z],[aa.x,ya+.65,aa.z]],[side*a.v,0,side*-a.u]);
      beam([aa.x,1,aa.z],[bb.x,1,bb.z],.06,C.silver);
      if(covered){const p=at(tp,s,side*7.7);K.box({x:p.x,z:p.z,y:-1.55,w:.24,h:.045,d:1.5,rotY:p.rot,mat:emit(0xffedca),solid:false});}
    }
    const aa=at(tp,s),bb=at(tp,e);K.quad(C.yellow,[[aa.x-.12,ya+.016,aa.z],[bb.x-.12,yb+.016,bb.z],[bb.x+.12,yb+.016,bb.z],[aa.x+.12,ya+.016,aa.z]],[0,1,0]);
    
  }
  // Restore roof precisely up to the portal edges (the loop's 4m samples need not align).
  const roofA=at(tp,west),roofB=at(tp,east);K.slab(stripPoly([roofA.x,roofA.z],[roofB.x,roofB.z],TW+.9),0,{mat:'concrete',under:'ceiling',thick:1.4});
  for(const [s,rot] of [[west,at(tp,west).rot+PI],[east,at(tp,east).rot]]){
    const q=at(tp,s);K.sign(['사평지하차도','높이 4.5m'],{x:q.x,z:q.z,y:-.75,w:8.5,h:1.05,rotY:rot,bg:'#405956',fg:'#fff',box:.1});
    for(let u=-8;u<8;u+=.8){const p=at(tp,s,u);K.box({x:p.x,z:p.z,y:-1.4,w:.4,h:.3,d:.15,rotY:rot,mat:Math.round(u/.8)%2?C.yellow:0x282d31,solid:false});}
  }
  markings({width:TW,lanes:4,oneway:false},tp,tunnelH);
  for(const s of [west+24,east-25]){const q=at(tp,s,6.5);K.sign('비상구  →',{x:q.x,z:q.z,y:-4.1,w:1.5,h:.35,rotY:q.rot-PI/2,bg:'#168257',fg:'#fff'});}
  // Short fans make the original west OSM endpoints reachable without a cliff.
  for(const [a,b] of [[[-447.72,471.65],[-433.45,473.1]],[[-419.18,474.56],[-433.45,473.1]]])flat(a,b,12,ROAD,'asphalt',true);
  K.zone({name:'사평지하차도',floor:'지하차도',sub:'사평대로 · 콘크리트 지하 통과 구간',poly:[...left,...right],y0:-7,y1:-.25,priority:8});
  // Raised maintenance ledge; road ramps provide the continuous walking route.
  const maint=at(tp,east-9,7.65);K.box({x:maint.x,z:maint.z,y:-6,w:.8,h:.15,d:3,mat:'concrete'});

  // Central City pedestrian bridge. OSM spiral is retained, not a rectangle.
  const fr=byId.get(301889788),fp=path(fr.pts),descent=fp.cum[2];
  const fh=s=>s<=descent?BRIDGE:mix(BRIDGE,WALK,(s-descent)/(fp.L-descent));
  function walkSpan(p,H,w,steps=false,trim=false) {
    for(let i=1;i<p.pts.length;i++){
      const a=p.pts[i-1],b=p.pts[i],ya=H(p.cum[i-1]),yb=H(p.cum[i]);
      const L=p.cum[i]-p.cum[i-1];if(L<.02)continue;
      if(steps&&Math.abs(ya-yb)>.02)K.stairs(...a,...b,{w,ya,yb,rails:false,mat:{tex:'darkstone',color:0xe5e0d3},sideMat:0x8a999e});
      else K.ramp(...a,...b,{w,ya,yb,rails:false,mat:'streets-pavers',under:0x7a979d});
      for(const side of [-1,1]){const dx=(b[0]-a[0])/L,dz=(b[1]-a[1])/L,aa=[a[0]-dz*side*w/2,a[1]+dx*side*w/2],bb=[b[0]-dz*side*w/2,b[1]+dx*side*w/2];if(trim){const pad=Math.min(1.45,L*.4),t0=pad/L,t1=1-t0;rail([mix(aa[0],bb[0],t0),mix(aa[1],bb[1],t0)],[mix(aa[0],bb[0],t1),mix(aa[1],bb[1],t1)],mix(ya,yb,t0),mix(ya,yb,t1),'bridge');}else if(i===1&&p===fp&&side===-1){const t=Math.min(.08,2/L);rail([mix(aa[0],bb[0],t),mix(aa[1],bb[1],t)],bb,mix(ya,yb,t),yb,'bridge');}else rail(aa,bb,ya,yb,'bridge');beam([aa[0],ya+.13,aa[1]],[bb[0],yb+.13,bb[1]],.035,emit(0xf2d7a2));}
    }
  }
  walkSpan(fp,fh,2.5,true);
  const sp=path(byId.get(301889787).pts);const bendY=4.7;walkSpan(sp,s=>s<=sp.cum[1]?mix(WALK,bendY,s/sp.cum[1]):mix(bendY,BRIDGE,(s-sp.cum[1])/(sp.L-sp.cum[1])),2.5,true,true);K.slab(rect(104.01,236.33,3.2,3.2),bendY,{mat:'darkstone',thick:.18});
  // Small landings stitch rounded corners and ends without covering the spiral below.
  for(const [x,z,y] of [[103.49,231.64,BRIDGE],[72.92,167.76,WALK],[90.19,236.92,WALK]])K.slab(rect(x,z,2.5,2.5),y,{mat:'streets-pavers',thick:.18});
  for(const s of [0,22,48]){const q=at(fp,s);K.cyl({x:q.x,z:q.z,y:0,r:.38,h:BRIDGE-.3,seg:12,mat:0x8a9d9e});}
  // Illuminated structural mast + stays; style is inferred from official 주탑 description.
  const tower=at(fp,34,2);beam([tower.x,0,tower.z],[tower.x-2,17,tower.z-1],.32,0x477b87);
  beam([tower.x-.25,.2,tower.z+.3],[tower.x-2.25,16.8,tower.z-.7],.035,emit(0x8ad7e1));
  for(const s of [4,13,22,43,52,58]){const q=at(fp,s,1.25);beam([tower.x-2,16.6,tower.z-1],[q.x,BRIDGE+.2,q.z],.023,C.silver);}
  const label=at(fp,26,-1.35);K.sign('센트럴씨티보도육교',{x:label.x,z:label.z,y:BRIDGE-.35,w:12,h:.65,rotY:label.rot+PI/2,bg:'#63848a',fg:'#fff'});
  K.sign(['서리풀공원 산책길','미도산  →'],{x:99,z:239,y:2.1,w:2.4,h:.8,rotY:PI,bg:'#375f46',fg:'#fff',box:.1});
  K.sign(['고속터미널역  ←','센트럴시티 · 신세계'],{x:74,z:177,y:2.4,w:2.9,h:.8,rotY:.4,bg:'#273e54',fg:'#fff',box:.1});
  const led=at(fp,5,1.35);K.sign(['센트럴씨티보도육교','서초구 · 함께 걷는 거리'],{x:led.x,z:led.z,y:BRIDGE+1.7,w:3.8,h:.65,rotY:led.rot+PI/2,bg:'#12282a',fg:'#8ddfda',box:.14});
  // Existing accessible circulation is a guess: lift existence unresolved.
  // Round 10's unverified audit describes an older stairs-only model. Preserve
  // the current lift as instructed, without treating it as a verified facility.
  K.slab(rect(106.5,232.5,7,3),BRIDGE,{mat:'streets-pavers',thick:.28});
  K.slab(rect(109,235,4.4,7),WALK,{mat:'streets-pavers',thick:.15});
  K.elevator({shaft:false,name:'보도육교 승강기',x:109,z:235,rotY:PI,w:2.2,d:2.2,mat:'glass',doorMat:0x8dabae,topH:2.9,floors:[{label:'지상',y:WALK,name:'사평대로 보도'},{label:'육교',y:BRIDGE,name:'센트럴씨티보도육교'}]});
  // kit.wall cannot combine vertically stacked door openings: lower lintels
  // cover upper doors. Build each floor's doorway separately; retain K elevator UI.
  const shaft=rect(109,235,2.2,2.2);
  K.wall(107.9,233.9,107.9,236.1,WALK,9.1,{mat:'glass',thick:.12});
  K.wall(110.1,233.9,110.1,236.1,WALK,9.1,{mat:'glass',thick:.12});
  K.wall(107.9,236.1,110.1,236.1,WALK,9.1,{mat:'glass',thick:.12});
  for(const [y,top,label] of [[WALK,BRIDGE,'지상'],[BRIDGE,9.1,'육교']]){
    K.slab(shaft,y,{mat:'metal',thick:.05,ceil:false});
    K.wall(107.9,233.9,110.1,233.9,y,top,{mat:0x8dabae,thick:.12,openings:[{at:1.1,w:1.25,y0:y,y1:y+2.2}]});
    K.sign(label,{x:109,z:233.8,y:y+2.45,w:.6,h:.3,rotY:PI,bg:'#133a41',fg:'#fff'});
  }
  rail([104,231],[110,231],BRIDGE,BRIDGE,'bridge');rail([105,234],[107.8,234],BRIDGE,BRIDGE,'bridge');
  K.zone({name:'센트럴씨티보도육교',floor:'육교',sub:'사평대로 횡단 · 고속터미널역 ↔ 서리풀공원',poly:stripPoly([103.49,231.64],[78.96,177.26],6),y0:5.5,y1:10,priority:10});
  K.zone({name:'센트럴씨티보도육교',floor:'계단',sub:'나선형 계단 · 고속터미널역 3번출구',rect:[65,162,81,179],y0:0,y1:8,priority:10});
  K.person(92.5,BRIDGE,207.8,{shirt:0xe6dac7});K.person(84,BRIDGE,188.9,{shirt:0x477186});

  // Small pavement details are visible from eye level, without wasting geometry
  // on distant residential branches. Street names stay Korean throughout.
  for(const r of surfaceRoads.filter(major)) {
    const p=path(r.pts);for(let s=15;s<p.L-12;s+=23){const q=at(p,s,r.width/2-.4);if(Math.abs(q.x)>650||q.z<-650||q.z>600)continue;
      K.box({x:q.x,z:q.z,y:ROAD+.002,w:.45,h:.008,d:.8,rotY:q.rot,mat:'streets-grate',solid:false});
    }
  }
  const spawn=(name,x,y,z,yaw)=>K.spawn({name,x,y,z,yaw:yaw*PI/180,group:'고속터미널 거리'});
  spawn('신반포로 · 고속터미널 중앙정류장',-75,WALK,-96,290);
  spawn('신반포로 · 호남선 앞',-155,WALK,-92,290);
  spawn('반포대로 · 한강공원 가는 길',-371,WALK,-136,20);
  spawn('사평대로 · 보도육교 남쪽',94,WALK,240,0);
  const deck=at(fp,24);spawn('센트럴씨티보도육교 위',deck.x,BRIDGE,deck.z,24);
  const under=at(tp,(west+east)/2,6.8);spawn('사평지하차도 내부',under.x,-6,under.z,295);
  const over=at(path(byId.get(480856735).pts),80,5.6);spawn('강남터미널고가도로 위',over.x,6.5,over.z,20);
  spawn('잠원로 · 반포쇼핑타운',350,WALK,-303,180);
  buildRoadviewBuildings(K);
}

// Round 4: these formerly unclaimed city-fill buildings are visible landmarks
// in cc_02, ssg_04 and bp_01. Keep their OSM footprints and known floor counts.
// This is exterior streetscape work; unobserved interiors stay unmodelled.
function buildRoadviewBuildings(K) {
  const PI=Math.PI;
  const surface=(poly,edge,t,y,w,h,mat,offset=.035)=>{
    const a=poly[edge],b=poly[(edge+1)%poly.length],L=Math.hypot(b[0]-a[0],b[1]-a[1]);
    const u=[(b[0]-a[0])/L,(b[1]-a[1])/L],n=K.orient(poly)[edge];
    const x=a[0]+u[0]*t+n[0]*offset,z=a[1]+u[1]*t+n[1]*offset;
    K.quad(mat,[[x-u[0]*w/2,y,z-u[1]*w/2],[x+u[0]*w/2,y,z+u[1]*w/2],
      [x+u[0]*w/2,y+h,z+u[1]*w/2],[x-u[0]*w/2,y+h,z-u[1]*w/2]],[n[0],0,n[1]]);
  };
  const band=(poly,y,h,mat)=>{
    for(let i=0;i<poly.length;i++){
      const a=poly[i],b=poly[(i+1)%poly.length],L=Math.hypot(b[0]-a[0],b[1]-a[1]);
      surface(poly,i,L/2,y,L,h,mat);
    }
  };

  // Warm, fine-jointed masonry, not a curtain wall. cc_02's windows are small
  // dark openings separated by broad tan wall piers and pale lintels.
  K.texture('streets-lebon-stone',256,256,(g,w,h)=>{
    g.fillStyle='#c8a77a';g.fillRect(0,0,w,h);
    g.strokeStyle='#bd9e76';g.lineWidth=1;
    for(let y=0;y<=h;y+=64){g.beginPath();g.moveTo(0,y);g.lineTo(w,y);g.stroke();}
    for(let row=0;row<4;row++)for(let x=(row%2)*64;x<w;x+=128){g.beginPath();g.moveTo(x,row*64);g.lineTo(x,(row+1)*64);g.stroke();}
  },[2.4,2.4]);
  for(const b of [] /* 르본시티 413280002 is built by js/places/lebon.js */){
    const p=b.poly;
    K.prism(p,0,38,{mat:'streets-lebon-stone',top:0xd7c7ac});
    // Eight rows, with the first integrated into the street-level shop band.
    for(let e=0;e<p.length;e++){
      const a=p[e],c=p[(e+1)%p.length],L=Math.hypot(c[0]-a[0],c[1]-a[1]);
      const n=Math.max(1,Math.floor((L-8)/3.5)),pitch=(L-8)/n;
      for(let f=0;f<8;f++)for(let j=0;j<n;j++){
        const t=4+(j+.5)*pitch,y=1.7+f*4.6;
        surface(p,e,t,y-.13,1.9,1.66,0xd6bd96);
        surface(p,e,t,y,1.6,1.4,0x343b3a,.05);
        surface(p,e,t,y,.055,1.4,0xaaa895,.065);
      }
      for(let t=3;t<L-2;t+=5.2){
        surface(p,e,t,.35,3.9,3.1,0x344646,.045);
        surface(p,e,t,.35,.09,3.1,0xada999,.07);
      }
    }
    band(p,3.65,.45,0xb89a74);band(p,36.65,.32,0x947e60);band(p,37.65,.35,0xb29b78);
    // Large east / ENE-facing roof LED, set back from the NE roof corner.
    // Only the source's colour masses are legible; no invented advert wording.
    K.texture('streets-lebon-led-art',512,288,(g,w,h)=>{
      g.fillStyle='#111b20';g.fillRect(0,0,w,h);
      g.fillStyle='#dadf34';g.fillRect(14,100,178,148);
      g.fillStyle='#56873b';g.fillRect(205,175,290,100);
      g.fillStyle='#20bd7b';g.fillRect(335,140,145,110);
      g.fillStyle='#d9d7b4';g.fillRect(285,35,105,135);
      g.fillStyle='#3b403b';g.beginPath();g.arc(341,78,31,0,PI*2);g.fill();
      g.fillStyle='#e8bdad';g.beginPath();g.arc(342,85,22,0,PI*2);g.fill();
      g.fillStyle='#ddd9c1';g.beginPath();g.moveTo(310,112);g.lineTo(370,110);g.lineTo(402,210);g.lineTo(279,211);g.closePath();g.fill();
      g.fillStyle='#c74d76';g.fillRect(245,115,38,103);
      g.fillStyle='#f5dd54';for(let i=0;i<4;i++)g.fillRect(30+i*38,55+(i%2)*12,24,31);
      g.fillStyle='rgba(0,0,0,.17)';for(let y=0;y<h;y+=4)g.fillRect(0,y,w,1);
    },[1,1]);
    K.material('streets-lebon-led',new K.THREE.MeshBasicMaterial({map:K.T.surface('streets-lebon-led-art').tex,vertexColors:true}));
    const x=-224,z=6,rot=105*PI/180,u=[Math.cos(rot),-Math.sin(rot)],n=[Math.sin(rot),Math.cos(rot)];
    K.box({x,z,y:39,w:11.6,h:7,d:.45,rotY:rot,mat:0x282b2a,solid:false});
    const P=(s,y)=>[x+u[0]*s+n[0]*.24,y,z+u[1]*s+n[1]*.24];
    K.quad('streets-lebon-led',[P(-5.5,39.25),P(5.5,39.25),P(5.5,45.75),P(-5.5,45.75)],[n[0],0,n[1]]);
    for(const s of [-3.7,3.7])K.box({x:x+u[0]*s,z:z+u[1]*s,y:38,w:.26,h:1.1,d:.4,rotY:rot,mat:0x55534b,solid:false});
    // The sign is legible as a vertical board; use only the verified building
    // name instead of guessing the smaller tenant lettering in the roadview.
    const a=p[1],c=p[2],L=Math.hypot(c[0]-a[0],c[1]-a[1]),normal=K.orient(p)[1];
    const sx=c[0]+(a[0]-c[0])*4.7/L+normal[0]*.12,sz=c[1]+(a[1]-c[1])*4.7/L+normal[1]*.12;
    K.sign(['르','본','시','티'],{x:sx,z:sz,y:24,w:1.8,h:12,rotY:Math.atan2(normal[0],normal[1]),bg:'#c8b18b',fg:'#715148',box:.14});
    K.zone({name:'르본시티',floor:'지상',sub:'신반포로',poly:p,y0:0,y1:38,priority:2});
  }

  // Round 8: the police-specific roadviews supersede the blurred ssg_04
  // checkerboard inference. The OSM footprint stays authoritative. Local u
  // follows the west facade toward the south; v points into the building.
  K.texture('streets-police-stone',256,256,(g,w,h)=>{
    g.fillStyle='#a5aaa2';g.fillRect(0,0,w,h);g.strokeStyle='#707c78';g.lineWidth=2;
    for(let x=0;x<=w;x+=128){g.beginPath();g.moveTo(x,0);g.lineTo(x,h);g.stroke();}
    for(let y=0;y<=h;y+=64){g.beginPath();g.moveTo(0,y);g.lineTo(w,y);g.stroke();}
  },[3,3]);
  K.texture('streets-police-frit',256,256,(g,w,h)=>{
    g.clearRect(0,0,w,h);g.fillStyle='rgba(67,87,89,.55)';
    for(let j=0;j<3;j++)for(let i=0;i<3;i++){g.beginPath();g.arc(42+i*85,42+j*85,34-(i+j)%2*5,0,PI*2);g.fill();}
  },[2.1,2.1],{transparent:true});
  K.texture('streets-police-glazing',256,256,(g,w,h)=>{
    g.fillStyle='#526e69';g.fillRect(0,0,w,h);
    for(let i=0;i<32;i++){g.fillStyle=i%3?'rgba(182,204,186,.06)':'rgba(20,42,41,.12)';g.fillRect(i*8,0,4+(i%5),h);}
    g.fillStyle='rgba(183,201,185,.16)';g.fillRect(0,24,w,25);
    g.fillStyle='rgba(20,39,38,.2)';g.fillRect(0,210,w,46);
  },[1.72,2.0]);
  K.texture('streets-police-taegeukgi',192,128,(g,w,h)=>{
    g.fillStyle='#f1eee6';g.fillRect(0,0,w,h);
    g.fillStyle='#bf3e45';g.beginPath();g.arc(96,64,26,0,PI*2);g.fill();
    g.fillStyle='#344e85';g.beginPath();g.arc(96,64,26,0,PI);g.fill();
    g.beginPath();g.arc(83,64,13,PI,PI*2);g.fill();
    g.fillStyle='#bf3e45';g.beginPath();g.arc(109,64,13,0,PI);g.fill();
    g.fillStyle='#283239';
    for(const [x,y,a,broken] of [[42,30,-.6,0],[150,30,.6,2],[42,98,.6,1],[150,98,-.6,3]]){
      g.save();g.translate(x,y);g.rotate(a);for(let i=0;i<3;i++){
        if((broken===3)||(broken===2&&i!==1)||(broken===1&&i===1)){g.fillRect(-17,-9+i*7,14,4);g.fillRect(3,-9+i*7,14,4);}else g.fillRect(-17,-9+i*7,34,4);
      }g.restore();
    }
  },[1,1]);
  K.texture('streets-police-cctv',384,240,(g,w,h)=>{
    g.fillStyle='#16282b';g.fillRect(0,0,w,h);
    for(let j=0;j<4;j++)for(let i=0;i<6;i++){
      const x=i*64+2,y=j*60+2,k=i+j*6;
      g.fillStyle=['#687879','#738379','#697681'][k%3];g.fillRect(x,y,60,54);
      g.fillStyle='#b5b5a0';g.fillRect(x+3,y+2,14+(k%4)*3,25);g.fillRect(x+40,y+7,17,18);
      g.fillStyle='#3c514e';g.fillRect(x+25,y+3,9,16);
      g.fillStyle='#38464a';g.beginPath();g.moveTo(x+23,y+23);g.lineTo(x+38,y+23);g.lineTo(x+56,y+52);g.lineTo(x+3,y+52);g.closePath();g.fill();
      g.fillStyle='#c5d0c7';g.fillRect(x+28,y+33,7,4);g.fillRect(x+32,y+44,8,4);
      g.fillStyle='#64c5a3';g.fillRect(x+3,y+48,13,2);
    }
  },[1,1]);
  for(const b of K.osmBuilding(886400346)){
    const p=b.poly,L=Math.hypot(p[1][0]-p[0][0],p[1][1]-p[0][1]),D=Math.hypot(p[3][0]-p[0][0],p[3][1]-p[0][1]);
    const ux=(p[1][0]-p[0][0])/L,uz=(p[1][1]-p[0][1])/L,vx=-uz,vz=ux;
    // v is east/northeast, the opposite of the west outward normal.
    const P=(u,v)=>[p[0][0]+ux*u-vx*v,p[0][1]+uz*u-vz*v];
    const pos=(u,v)=>{const q=P(u,v);return {x:q[0],z:q[1]};};
    const rot=Math.atan2(vx,vz),frame=0x394b49,stone='streets-police-stone',glass={tex:'glass',color:0x557d75};
    const localBox=(u,v,y,w,h,d,mat,solid=true)=>K.box({...pos(u,v),y,w,h,d,rotY:rot,mat,solid});
    const localRect=(u0,v0,u1,v1)=>[P(u0,v0),P(u1,v0),P(u1,v1),P(u0,v1)];
    const localWall=(u0,v0,u1,v1,y0,y1,opts)=>{const a=P(u0,v0),c=P(u1,v1);K.wall(...a,...c,y0,y1,opts);};
    const face=(uvys,mat,normal=[vx,0,vz])=>K.quad(mat,uvys.map(([u,v,y])=>{const q=P(u,v);return [q[0],y,q[1]];}),normal);
    const bar=(a,b,r,mat)=>{ // round tubes in the police local frame
      const A=P(a[0],a[1]),B=P(b[0],b[1]),aa=[A[0],a[2],A[1]],bb=[B[0],b[2],B[1]];
      const d=bb.map((v,i)=>v-aa[i]),len=Math.hypot(...d),n=Math.abs(d[1])>len*.95?[1,0,0]:[-d[2],0,d[0]],nl=Math.hypot(...n);
      for(let i=0;i<3;i++)n[i]/=nl;const m=[d[1]*n[2]-d[2]*n[1],d[2]*n[0]-d[0]*n[2],d[0]*n[1]-d[1]*n[0]].map(v=>v/len);
      for(let j=0;j<8;j++){const q=(p,t)=>p.map((v,i)=>v+r*(n[i]*Math.cos(t)+m[i]*Math.sin(t))),t=j*PI/4,t1=(j+1)*PI/4;
        K.quad(mat,[q(aa,t),q(bb,t),q(bb,t1),q(aa,t1)],n.map((v,i)=>v*Math.cos((t+t1)/2)+m[i]*Math.sin((t+t1)/2)));}
    };
    const apron=localRect(-1,-10.6,L+1,0);
    K.slab(apron,.15,{mat:'streets-pavers',thick:.15,ceil:false});
    K.slab(p,0,{mat:{tex:'tile',color:0xd4d4c9},thick:.2});
    const stairHole=localRect(1.1,D-2.15,L-1.3,D-.55);
    K.slab(p,4.05,{mat:0xd3d3ca,under:'ceiling',thick:.22,holes:[stairHole]});
    K.slab(p,8.05,{mat:'roofgravel',under:'ceiling',thick:.23});
    // The door is a genuine 2.2 m opening through the curtain wall, with the
    // glass leaves parked to either side. Nothing spans the entrance at foot level.
    localWall(0,0,L,0,0,8.05,{mat:glass,thick:.06,openings:[{at:9.3,w:2.2,y0:0,y1:2.9}]});
    localWall(0,0,0,D,0,8.05,{mat:'streets-police-glazing',mat2:0xd9d9ce,thick:.06});
    localWall(L,0,L,D,0,8.05,{mat:stone,mat2:0xe0dfd4,thick:.2});
    localWall(0,D,L,D,0,8.05,{mat:stone,mat2:0xe0dfd4,thick:.2});
    const st0=P(1.25,D-1.35),st1=P(L-1.5,D-1.35);
    K.stairs(...st0,...st1,{w:1.45,ya:0,yb:4.05,mat:0xc5c8c1,rails:true});
    // Photo18/23 show a low suspended office ceiling and a partition in front
    // of the stair/service strip. Keep the upper floor and its stairs intact.
    K.slab(localRect(.18,.18,L-.18,D-2.35),2.78,{mat:0xdad9cf,under:'ceiling',thick:.08,walk:false});
    localWall(1.45,10.1,9.45,10.1,0,2.7,{mat:0xd5d5c9,mat2:0xc9cec5,thick:.12});
    localWall(9.45,8.95,9.45,10.1,0,1.4,{mat:0xa38f6a,thick:.1});
    for(const y of [.2,3.05,4.05,5.0,7.98])localBox(L/2,-.065,y,L,.085,.12,frame,false);
    // Frosted upper/lower infills reflect the street; clear lower bays retain
    // the view through the real doorway. This is not an all-clear glass cube.
    for(const [y0,y1] of [[.2,.6],[2.72,3.0],[3.15,4.0],[4.17,5.0],[5.08,7.95]])
      face([[.08,-.045,y0],[L-.08,-.045,y0],[L-.08,-.045,y1],[.08,-.045,y1]],'streets-police-glazing');
    for(let u=.08;u<L;u+=1.72){
      if(u>8.15&&u<10.45){localBox(u,-.07,2.9,.075,5.15,.14,frame,false);continue;}
      localBox(u,-.07,0,.075,8.05,.14,frame,false);
    }
    for(const [start,end] of [[.1,8.15],[10.45,L-.1]])for(let u0=start;u0<end;u0+=1.72){
      const u1=Math.min(end,u0+1.65);
      face([[u0,-.09,.6],[u1,-.09,.6],[u1,-.09,2.7],[u0,-.09,2.7]],'streets-police-frit');
      face([[u0,-.09,4.17],[u1,-.09,4.17],[u1,-.09,5.0],[u0,-.09,5.0]],'streets-police-frit');
    }
    // North road face: broad grey stone panels with dark glass bays, an oblique
    // glass/stone boundary, and slender metal mullions visible in police_01.
    const nn=[-ux,0,-uz];
    face([[-.11,-.02,.2],[-.11,3.1,.2],[-.11,4.55,7.95],[-.11,-.02,7.95]],stone,nn);
    face([[-.11,7.1,.2],[-.11,9.45,.2],[-.11,11.25,7.95],[-.11,8.9,7.95]],stone,nn);
    // Explicit joints keep metre-scale stone tiles visible; quad UVs alone
    // would stretch one four-row texture over the entire eight-metre facade.
    for(let y=1.45;y<7.9;y+=1.28){
      const t=(y-.2)/7.75;
      for(const [a,c] of [[0,3.1+1.45*t],[7.1+1.8*t,9.45+1.8*t]])bar([-.13,a,y],[-.13,c,y],.012,0x6e7b74);
    }
    for(const v of [1.5,2.95,8.9])bar([-.13,v,.25],[-.13,v,7.9],.012,0x6e7b74);
    for(let v=4.7;v<D;v+=1.4){
      const a=P(-.045,v);K.box({x:a[0],z:a[1],y:.2,w:.08,h:7.85,d:.08,mat:frame,solid:false});
    }
    for(const y of [.25,4.03,7.95]){
      const a=P(-.04,0),c=P(-.04,D);K.wall(...a,...c,y,y+.08,{mat:frame,thick:.08,solid:false});
    }
    // Lean the near-corner glass pane back 0.7 m at its top, preserving the
    // footprint below. These faces are decorative over the north envelope.
    face([[-.23,3.15,.25],[-.23,7.07,.25],[-.08,8.87,7.9],[-.08,4.6,7.9]],{tex:'streets-police-glazing',color:0x637f79},nn);
    for(const [a,c] of [[[3.15,.25],[4.6,7.9]],[[7.07,.25],[8.87,7.9]]])bar([-.25,a[0],a[1]],[-.1,c[0],c[1]],.045,0x99aaa1);
    localWall(-.09,0,-.09,D,0,.22,{mat:stone,thick:.16,solid:false});
    // Low east glass annex from the previous model remains, with finer frames.
    const annex=localRect(0,D,L,D+5);
    K.slab(annex,0,{mat:'tile',thick:.18});K.slab(annex,3.8,{mat:0xc4c9c4,thick:.15});
    K.polyWalls(annex,0,3.8,{mat:glass,thick:.06});
    for(let u=.1;u<L;u+=1.7)localBox(u,D+5,.1,.07,3.65,.1,frame,false);
    localBox(L/2,D+5,3.6,L,.14,.1,frame,false);
    // Entrance canopy, blue police sign and small division lettering.
    localBox(9.3,-1.2,3.05,3.7,.15,2.5,0x9ba5a1,false);
    localBox(9.3,-1.2,3.2,3.45,.045,2.2,glass,false);
    for(const u of [7.6,11.0])localBox(u,-2.25,.15,.095,2.9,.095,0xb9c1ba);
    // Work around kit.sign's rotated box offset: put the backing completely
    // behind its text plane in this local frame, including the x offset.
    localBox(9.3,-2.40,3.32,3.81,1.08,.08,0x71837f,false);
    K.sign('경찰 POLICE',{...pos(9.68,-2.48),y:3.78,w:2.75,h:.71,rotY:rot,bg:'#1749a1',fg:'#fff'});
    face([[7.42,-2.46,3.35],[11.18,-2.46,3.35],[11.18,-2.46,4.37],[7.42,-2.46,4.37]],0x1749a1);
    // A small winged crest relief, as visible beside the word 경찰.
    face([[7.63,-2.54,4.08],[8.03,-2.54,3.95],[8.27,-2.54,4.08],[8.14,-2.54,3.75],[7.96,-2.54,3.65],[7.8,-2.54,3.78]],0xcfcca5);
    for(let j=0;j<3;j++)bar([7.66,-2.56,4.04-j*.07],[7.98,-2.56,3.87-j*.06],.014,0x7b8174);
    K.sign('서울서초경찰서 | 반포지구대',{...pos(9.3,-2.54),y:4.24,w:3.48,h:.18,rotY:rot,bg:'#1749a1',fg:'#fff'});
    localBox(L/2,-.10,5.22,L-.94,2.41,.06,0x526363,false);
    K.sign(['잘못 건 112신고전화','긴급출동의 발목을 잡습니다'],{...pos(L/2,-.18),y:6.4,w:L-1,h:2.35,rotY:rot,bg:'#174a9d',fg:'#fff'});
    K.sign('112는 긴급범죄신고 전화입니다',{...pos(L/2,-.22),y:5.48,w:L-2,h:.28,rotY:rot,bg:'#174a9d',fg:'#ffe882'});
    for(const u of [8.1,10.5])localBox(u,.12,.08,.08,2.82,.12,0xb4bfb9,false);
    for(const u of [8.55,10.05])localBox(u,.3,.12,.72,2.55,.035,glass,false);
    for(const u of [8.55,10.05]){
      face([[u-.34,.275,.4],[u+.34,.275,.4],[u+.34,.275,2.3],[u-.34,.275,2.3]],'streets-police-frit');
      bar([u-.22,.23,1.15],[u+.22,.23,1.15],.025,0xc0c7bd);
    }
    for(const u of [8.3,9.3,10.3])localBox(u,-1.3,3.0,.05,.08,2.2,0x5d6863,false);
    K.sign(['2019','우수 지구대'],{...pos(7.91,-.18),y:1.96,w:.31,h:.36,rotY:rot,bg:'#267caf',fg:'#f4e8b0'});
    K.tree(...[pos(12.4,-1.4).x,pos(12.4,-1.4).z],{y:.15,h:3.0,kind:'pine'});
    K.person(pos(11.65,-3.8).x,.15,pos(11.65,-3.8).z,{rotY:rot,shirt:0x29465a,pants:0x202e38});
    localBox(9.3,-.38,.015,2.25,.025,.8,0x545b57,false);
    // Three flags are compact static cloth panels; no guessed agency insignia.
    for(let i=0;i<3;i++){
      const u=11.8+i*.72,q=pos(u,-.85);K.cyl({...q,y:.15,r:.038,h:6.4,seg:8,mat:0xbfc6bf});
      if(i===1)face([[u,-.87,5.3],[u+1.0,-.87,5.3],[u+1.0,-.87,6.0],[u,-.87,6.0]],'streets-police-taegeukgi');
      else K.sign('경찰',{...pos(u+.31,-.85),y:5.7,w:.6,h:1.0,rotY:rot,bg:'#353b74',fg:'#d9bf71',twoSided:true});
    }
    // Forecourt boundary and parking remain fully inside the service-road curb.
    for(let u=0;u<=L;u+=1.8){
      if(u>7.5&&u<11)continue;
      const q=pos(u,-10.1);K.cyl({...q,y:.15,r:.09,h:.73,seg:8,mat:0x323a39});
      K.cyl({...q,y:.64,r:.095,h:.12,seg:8,mat:0xe8be35,solid:false});
    }
    // police_01: low yellow/black steel hoops, not just upright bollards.
    // Their separated spans leave the forecourt entrances and sidewalk open.
    for(const v of [1.0,4.0,7.0,10.0,13.0]){
      const pts=[[-2.2,v-.65,.15],[-2.2,v-.65,.68],[-2.2,v-.54,.82],[-2.2,v+.54,.82],[-2.2,v+.65,.68],[-2.2,v+.65,.15]];
      for(let i=1;i<pts.length;i++)bar(pts[i-1],pts[i],.052,i%2?0x2a302e:0xd9c45d);
      bar([-2.2,v-.65,.43],[-2.2,v-.65,.57],.054,0xd9c45d);bar([-2.2,v+.65,.43],[-2.2,v+.65,.57],.054,0xd9c45d);
    }
    for(let u=1;u<7;u+=2){
      const a=P(u,-3),c=P(u,-5);K.wall(...a,...c,.78,.83,{mat:0x9ba9a6,thick:.05,solid:false});
      for(const v of [-3,-5])K.cyl({...pos(u,v),y:.15,r:.035,h:.68,mat:0x9ba9a6,seg:6});
    }
    for(const u of [2.5,6]){
      const q=pos(u,-7.2),a=rot+PI;
      K.vehicle({...q,y:.15,rotY:a,kind:'car',color:0xf1f2ec});
      const c=Math.cos(a),s=Math.sin(a),CP=(x,z)=>({x:q.x+x*c+z*s,z:q.z-x*s+z*c});
      for(const side of [-1,1]){
        K.box({...CP(side*.94,0),y:.67,w:.025,h:.25,d:3.4,rotY:a,mat:0x164b96,solid:false});
        K.box({...CP(side*.96,0),y:.51,w:.025,h:.11,d:3.8,rotY:a,mat:0xe7db30,solid:false});
        K.sign('경찰',{...CP(side*.97,0),y:.8,w:1.1,h:.22,rotY:a+side*PI/2,bg:'#164b96',fg:'#fff'});
      }
      K.box({...q,y:1.57,w:1.2,h:.1,d:.32,rotY:a,mat:0x9da9ac,solid:false});
      for(const side of [-1,1])K.box({...CP(side*.36,0),y:1.67,w:.45,h:.12,d:.28,rotY:a,mat:{tex:'emit',color:side<0?0xd63b32:0x326fbf},solid:false});
      if(u===6){
        // Photo03 school visit: the raised rear hatch belongs to this patrol
        // car, with its dark cargo opening below; retain both parked cars.
        localBox(u,-9.57,.63,1.48,.55,.03,0x1c292d,false);
        face([[u-.85,-9.6,1.12],[u+.85,-9.6,1.12],[u+.85,-10.12,2.12],[u-.85,-10.12,2.12]],0xe3e7df);
        face([[u-.70,-9.68,1.29],[u+.70,-9.68,1.29],[u+.70,-10.09,2.03],[u-.70,-10.09,2.03]],0x304448);
        for(const side of [-1,1])bar([u+side*.7,-9.45,.92],[u+side*.7,-10.03,1.94],.018,0x727c77);
      }
      const a0=P(u-1.35,-9.8),a1=P(u-1.35,-4.5);K.wall(...a0,...a1,.155,.16,{thick:.1,mat:0xe1e2d5,solid:false});
    }
    localBox(12.75,-3,.15,2.45,1.8,.18,0x7c8f83);
    K.sign('게시판',{...pos(12.75,-3.12),y:1.78,w:2.3,h:.34,rotY:rot,bg:'#eeeadd',fg:'#233c38'});
    for(const u of [12.05,12.8,13.55])K.sign(['주민 안내','생활 안전'],{...pos(u,-3.14),y:1.13,w:.61,h:.83,rotY:rot,bg:'#e4e1c9',fg:'#425c52'});
    for(let i=0;i<8;i++){
      const q=pos(7.55+(i%4)*.73,-7.7-Math.floor(i/4)*.9);
      K.person(q.x,.15,q.z,{rotY:rot-PI/2,h:1.05+(i%3)*.08,shirt:i%3?0x9dd7c8:0xc7e8de,pants:i%2?0x596568:0xd4c1aa});
    }
    const visitingOfficer=pos(7.4,-5.8);K.person(visitingOfficer.x,.15,visitingOfficer.z,{rotY:rot,shirt:0x2c4e61,pants:0x25313c});
    // Running officer: a shallow extruded, two-sided silhouette, as in the
    // rooftop photo, with an extended arm, bent lead knee, cap and dark uniform.
    const silhouette=(poly,mat)=>{
      // Operator measured the figure at roughly 1.3 × life size, about 2.3m.
      // Keep every contour, scaling the old 3.75m silhouette about the roof edge.
      poly=poly.map(([u,y])=>[4.5+(u-4.5)*.6,8.1+(y-7.9)*.6]);
      const vv=-.12,depth=.24,triangles=K.THREE.ShapeUtils.triangulateShape(poly.map(([u,y])=>new K.THREE.Vector2(u,y)),[]);
      for(const [v,normal] of [[vv,[vx,0,vz]],[vv+depth,[-vx,0,-vz]]]){
        for(const [a,b,c] of triangles)face([[poly[a][0],v,poly[a][1]],[poly[b][0],v,poly[b][1]],[poly[c][0],v,poly[c][1]],[poly[c][0],v,poly[c][1]]],mat,normal);
      }
      for(let i=0;i<poly.length;i++){const a=poly[i],c=poly[(i+1)%poly.length];face([[a[0],vv,a[1]],[c[0],vv,c[1]],[c[0],vv+depth,c[1]],[a[0],vv+depth,a[1]]],mat,[uz,0,-ux]);}
    };
    silhouette([[1.2,8.1],[2.2,8.2],[4.0,9.0],[5.4,9.7],[5.9,9.35],[5.7,8.45],[6.6,8.3],[6.65,8.05],[5.2,8.07],[4.95,8.35],[5.05,9.0],[4.0,8.5],[2.0,7.9]],0x27333c);
    silhouette([[3.2,9.1],[3.55,10.2],[4.8,10.85],[5.7,10.48],[5.45,9.7],[4.35,9.3]],0x1d4c67);
    silhouette([[4.8,10.2],[5.5,10.25],[6.0,9.9],[7.6,9.7],[7.7,9.4],[5.8,9.5],[4.8,9.9]],0x235b78);
    silhouette([[3.8,10.2],[2.9,10.55],[2.0,10.2],[1.4,9.8],[1.55,9.5],[2.35,10.0],[3.1,10.0],[3.55,9.8]],0x28546e);
    silhouette([[5.0,10.65],[5.12,11.32],[5.72,11.3],[5.88,11.0],[6.12,10.88],[5.8,10.78],[5.6,10.43]],0xc7a184);
    silhouette([[4.95,11.2],[4.88,11.65],[5.9,11.58],[5.98,11.33],[6.22,11.27],[6.05,11.16],[5.56,11.24]],0x172b3c);
    silhouette([[7.55,9.72],[7.85,9.9],[8.06,10.08],[8.16,9.98],[7.99,9.72],[8.28,9.77],[8.3,9.58],[7.72,9.43]],0xc7a184);
    silhouette([[1.52,9.8],[1.25,9.72],[1.08,9.48],[1.21,9.32],[1.4,9.51],[1.62,9.47]],0xc7a184);
    localBox(4.2,-.1,8.97,.78,.06,.3,0x1d2428,false);
    localBox(5.178,-.16,10.164,.084,.096,.035,0xd6bc64,false);
    K.zone({name:'반포지구대',floor:'1F',sub:'민원 안내',poly:p,y0:0,y1:4.05,priority:8});
    K.zone({name:'반포지구대',floor:'2F',sub:'업무 공간',poly:p,y0:4.05,y1:8.05,priority:8});
    const outside=pos(9.3,-5.2);K.spawn({name:'반포지구대 앞',...outside,y:.15,yaw:rot,group:'고속터미널 거리'});
    // Interior furniture uses the desk/CCTV photos, not the unrelated shopping
    // arcade images in the source folder. Room arrangement is a modest inference.
    K.detail({name:'반포지구대 민원실',floor:'1F',poly:p,y0:0,y1:4.05},K=>{
      const box=(u,v,y,w,h,d,mat,solid=true)=>K.box({...pos(u,v),y,w,h,d,rotY:rot,mat,solid});
      const person=(u,v,o)=>{const q=pos(u,v);K.person(q.x,0,q.z,o);};
      const monitor=(u,v,y,w=.82,h=.5,staff=false)=>{
        box(u,v,y-.12,.08,.15,.08,0x4d5957,false);box(u,v,y-.15,.38,.025,.24,0x343e3b,false);
        box(u,v,y,w,h,.075,0x152429,false);
        K.sign(['업무 안내','서울서초경찰서'],{...pos(u,v+(staff?.045:-.045)),y:y+h/2,w:w-.08,h:h-.075,rotY:rot+(staff?PI:0),bg:'#cddcdb',fg:'#37577d'});
      };
      const chair=(u,v,high=false)=>{
        box(u,v,.4,.58,.12,.58,0x263131);box(u,v+.24,.49,.6,high?.92:.64,.12,0x253034);
        box(u,v,.12,.065,.3,.065,0x6a7370,false);
        for(const du of [-.3,.3])box(u+du,v,.65,.04,.06,.46,0x252e30,false);
        for(const dv of [-.25,.25])box(u,v+dv,.08,.62,.04,.045,0x48524f,false);
        if(high)box(u,v+.24,1.42,.51,.25,.14,0x263135,false);
      };
      box(7,4.4,0,8.6,.95,.8,{tex:'wood',color:0xb1a28a});box(7,4.4,.95,8.7,.06,.95,{color:0x539b61,gloss:.5});
      box(7,3.99,1.01,8.6,.31,.08,{tex:'wood',color:0xc2b191});
      K.sign('민원 안내',{...pos(7,3.94),y:.66,w:2,h:.34,rotY:rot,bg:'#e1dfd1',fg:'#2e4b58'});
      K.sign('반포지구대',{...pos(11.15,10.0),y:2.18,w:1.65,h:.26,rotY:rot,bg:'#e6e2d5',fg:'#2c4958'});
      for(const u of [3.8,6.8,9.8]){
        monitor(u,4.31,1.12,.88,.57,true);box(u,4.64,1.02,.66,.025,.21,0x303f40,false);
        for(let row=0;row<3;row++)for(let col=0;col<10;col++)box(u-.28+col*.06,4.57+row*.06,1.048,.042,.005,.04,0x606b67,false);
        box(u+.43,4.64,1.02,.22,.012,.25,0x3c4141,false);box(u+.43,4.64,1.035,.075,.03,.11,0x1d2628,false);
        chair(u,5.45,u===9.8);
        box(u,8.9,.7,2.0,.1,.85,0xc9c2af);box(u,8.92,.8,1.7,.015,.65,{color:0x5c9264,gloss:.3},false);
        for(const du of [-.5,.5])box(u+du,8.9,0,.06,.7,.65,0x959e96);
        monitor(u-.37,9.0,.91,.73,.47);monitor(u+.43,9.0,.91,.66,.47);
        box(u,8.62,.82,.66,.025,.2,0x3d4847,false);chair(u,8.0);
        // Paper stacks, document holders and upright files stay on the desks.
        for(let n=0;n<4;n++)box(u+.65,8.71,.82+n*.018,.28,.016,.24,n%2?0xe4dfc5:0xf0eee3,false);
        box(u-.69,8.95,.82,.12,.3,.24,0x46728e,false);
      }
      for(const u of [2.4,4.1,5.8]){box(u,1.55,.43,1.35,.12,.55,0x5f6c6d);box(u,1.83,.55,1.35,.62,.08,0x7c8988);}
      for(const u of [2.65,4.85,7.05])for(const y of [1.36,2.06]){
        box(u,9.96,y,1.95,.61,.08,0x19292d,false);
        face([[u-.9,9.905,y+.055],[u+.9,9.905,y+.055],[u+.9,9.905,y+.555],[u-.9,9.905,y+.555]],'streets-police-cctv');
        for(const du of [-.6,.6])bar([u+du,9.96,y],[u+du,9.96,y-.18],.012,0x343c3b);
      }
      box(11.8,7.6,0,.85,2.15,.65,0xe0e1d7);for(let y=1.3;y<1.8;y+=.12)box(11.8,7.24,y,.66,.025,.02,0x84918f,false);
      for(const u of [3,7,11])for(const v of [3,7.5]){
        box(u,v,2.655,1.25,.045,.27,0xa6b1ab,false);box(u,v,2.65,1.15,.012,.22,{tex:'emit',color:0xf4f1e1},false);
      }
      // Ceiling cassette, return slots and cable raceway from photo18/23.
      box(8,6.0,2.63,.95,.07,.95,0xd3d4cb,false);box(8,6.0,2.61,.58,.02,.58,0x8d9792,false);
      for(const side of [-1,1]){box(8+side*.38,6,2.605,.06,.02,.72,0x596c68,false);box(8,6+side*.38,2.605,.72,.02,.06,0x596c68,false);}
      box(5.3,9.8,2.52,7.7,.1,.13,0xbfc6bd,false);
      // Phone with keypad and curled cord, printer and a document stand.
      box(9.07,4.62,1.015,.33,.065,.26,0x1f292b,false);box(9.07,4.51,1.08,.34,.055,.07,0x182326,false);
      for(let i=0;i<3;i++)for(let j=0;j<3;j++)box(9.0+i*.047,4.62+j*.043,1.082,.025,.006,.024,0x7f8f85,false);
      for(let j=0;j<10;j++)bar([8.88+j*.015,4.6+(j%2)*.05,1.075],[8.895+j*.015,4.6+((j+1)%2)*.05,1.075],.009,0x1c2829);
      box(5.5,4.5,1.02,.63,.35,.46,0xd5d9d1,false);box(5.5,4.35,1.34,.48,.04,.26,0x899b94,false);box(5.5,4.65,1.15,.48,.025,.29,0xf0eee1,false);
      K.sign(['민원 업무 안내','반포지구대'],{...pos(8.35,4.57),y:1.36,w:.34,h:.5,rotY:rot+PI,bg:'#f2efe5',fg:'#456774'});
      const table=pos(1.2,6.7);K.cyl({...table,y:.7,r:.65,h:.07,seg:20,mat:0xe2dac2});K.cyl({...table,y:0,r:.07,h:.7,seg:8,mat:0x88948e});
      chair(1.1,5.85);box(1.2,6.7,.78,.42,.02,.28,0xc79a40,false);
      box(11.8,9.1,0,.86,1.7,.45,0xb5b29e);for(let y=.4;y<1.7;y+=.4){box(11.8,9.1,y,.9,.045,.47,0x8b9488,false);for(let i=0;i<5;i++)box(11.46+i*.15,9.04,y+.06,.1,.27,.28,[0x576e7b,0xd4cfbb,0x506d61][i%3],false);}
      K.sign(['관할 안내','반포동 · 고속터미널'],{...pos(10.7,9.96),y:1.85,w:2.0,h:.65,rotY:rot,bg:'#e8e7da',fg:'#546b70'});
      person(6.8,5.45,{rotY:rot,shirt:0x294b61,pants:0x24323a,sit:true});
      person(9.8,5.45,{rotY:rot,shirt:0xd8bc4b,pants:0x444b45,sit:true});
      for(const [u,v,color] of [[4.9,6.9,0x323f4c],[6.4,7.15,0x416c7b],[7.7,7.1,0x81918b],[8.8,8.1,0x34596a]])person(u,v,{rotY:rot+PI,shirt:color,pants:0x303a40});
    });
  }

  // bp_01's older slabs: tan end walls, broad dark balcony openings and white
  // balcony bands. OSM's twelve floors are retained instead of inventing 15.
  for(const id of [413367405,413367408])for(const b of K.osmBuilding(id)){
    const p=b.poly,H=b.height,floors=b.levels,fh=H/floors;
    K.prism(p,0,H,{mat:0xd9a26b,top:0xc6bda9});
    for(let e=0;e<p.length;e++){
      const a=p[e],c=p[(e+1)%p.length],L=Math.hypot(c[0]-a[0],c[1]-a[1]);
      if(L<20)continue;
      for(let f=0;f<floors;f++){
        const y=f*fh+.45;
        surface(p,e,L/2,y,L-.7,1.95,0x40585a);
        surface(p,e,L/2,f*fh+.08,L-.25,.38,0xe9e5d9,.08);
        for(let t=1.9;t<L-1;t+=3.2)surface(p,e,t,y,.13,1.95,0xe5e3d7,.065);
      }
    }
    band(p,H-.35,.35,0xe5e1d5);
  }
  // The manifest corrects bp_01 to 3동. Its modern tower is the existing
  // 34F / 101m OSM 1137867801, not an invented slab immediately behind 4동.
  K.texture('streets-residential-bluegrey',256,256,(g,w,h)=>{
    g.fillStyle='#3c4a5a';g.fillRect(0,0,w,h);
    g.fillStyle='#73888f';g.fillRect(34,24,186,178);
    g.fillStyle='#536b79';g.fillRect(42,33,75,160);g.fillStyle='#637d89';g.fillRect(128,33,83,160);
    g.fillStyle='#a1aaa7';g.fillRect(0,0,20,h);g.fillRect(w-12,0,12,h);g.fillRect(0,h-25,w,25);g.fillRect(119,24,6,178);
  },[3.25,1],{facade:true});
  for(const b of K.osmBuilding(1137867801)){
    K.prism(b.poly,0,b.height,{mat:'streets-residential-bluegrey',floorH:b.height/b.levels,top:0x485563});
    band(b.poly,b.height-.55,.55,0x758083);
  }
}
