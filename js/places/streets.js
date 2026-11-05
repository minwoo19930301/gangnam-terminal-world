// Detailed public right-of-way. x east / z south; all dimensions in metres.
// Sources and assumptions: OSM centre lines are authoritative over prose research.
// The Central City footbridge crosses SAPYEONG-DAERO, with a northern spiral.
// OSM's two Sapyeong tube widths (20 m each) overlap: use their shared 17 m
// envelope, inferred four lanes, -6 m invert and 4.6 m clearance instead.
// Inferred: street tree species, furnishing styles, flyover 6.5 m deck, footbridge
// 6.2 m deck/pylon silhouette, accessible south lift, taxi queue, bus-lane paint.
// No invented stop IDs or live arrival times. Station/exits remain station-owned.
const ROAD_IDS = [37402467,71105531,71105555,97847428,131326713,131327735,218681382,218722041,218722042,218722043,218870939,218870945,218913526,218913527,301889788,309355890,443523921,473798788,473798790,480856735,480856736,480856737,480856741,480856742,498559927,498559932,498559933,522783547,522946367,522946368,523144216,523341064,523344135,523344137,523344143,525738543,525738544,525738545,525738546,547990887,547990890,547990891,547990895,562661077,623304593,655403256,674432577,674432580,691602197,799014370,799014371,799014372,816395058,816395059,816395060,828782197,828782198,831108561,831108562,831108563,831108564,845497255,868689632,921261337,921681811,1011881496,1033191354,1033191355,1252436243,1263366775,1389238182,1389238183,1389238184,1389238185,1420100037,1420100038,1472739714,1497710490,1497710491,1498239506,1499902350,1499902351,1499902352,1499902353,1499902354,1499902355,1532298610,218722037,218722038,282194887,418110854,799014358,799014359,1252436244];
const WALK_IDS = [301889787,301889789,308003937,606009741,665106093,665106094,665106095,665106096,665106097,816395057,845497271,845497273,1213763241,1213763242,1213763243,1232132158,1232132177,1232132196,1232132199,1481658419,1481658421,1481658423,1481658424,1481658425,1497710483,1497710484,1497710485,1497710486,1497710487,1497710488,1497710489,1497710492,1497710493,1497710494,1497710495,309355888,845497252,845497256,845497259,845497272];
export const meta = {
  id: 'streets', name: '고속터미널 거리 · 신반포로와 사평대로', claims: [],
  claimRoads: [...ROAD_IDS, ...WALK_IDS],
  sources: ['data/osm.json', 'data/research/streets.json',
    'https://mediahub.seoul.go.kr/archives/2005907',
    'https://mediahub.seoul.go.kr/archives/2011689',
    'https://www.seocho.go.kr/site/seocho/ex/bbs/internet/fun/BbsCustomFView.do?bcIdx=367637',
    'https://news.seoul.go.kr/traffic/archives/515178',
    'https://topis.seoul.go.kr/map/openPopBusRoute.do?routId=104000012',
    'https://culture.seoul.go.kr/culture/culture/cultureEvent/view.do?cultcode=136724&menuNo=200010'],
};

export function build(K) {
  const PI = Math.PI, ROAD = 0.04, WALK = 0.15, BRIDGE = 6.2;
  const C = { steel: 0x48545d, silver: 0x9daab0, yellow: 0xf2c53b, white: 0xe8e5d7, blue: 0x2387c9, green: 0x075847 };
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
  function arrow(p,s,off,y,reverse=false,turn=false) {
    const q=at(p,s,off),u=q.u*(reverse?-1:1),v=q.v*(reverse?-1:1),P=(t,n)=>[q.x+u*t-v*n,q.z+v*t+u*n];
    const poly=[P(-2,-.13),P(1,-.13),P(.3,-.62),P(.6,-.85),P(2,.0),P(.6,.85),P(.3,.62),P(1,.13),P(-2,.13)];K.hpoly(C.white,poly,y);
    if(turn) {flat(P(-.6,0),P(-.6,1),.22,y,C.white);K.hpoly(C.white,[P(-1,1),P(-.6,1.7),P(-.2,1)],y);}
  }
  function markings(r,p,height=()=>ROAD) {
    const lanes=r.lanes||Math.max(2,Math.min(r.oneway?4:6,Math.round(r.width/3.4)));const laneW=r.width/lanes;
    for(let k=1;k<lanes;k++)for(let s=2;s<p.L-2;s+=9){const off=-r.width/2+k*laneW,center=!r.oneway&&k===Math.floor(lanes/2),len=center?8.8:4;
      const a=at(p,s,off),b=at(p,Math.min(p.L-.5,s+len),off);K.ramp(a.x,a.z,b.x,b.z,{w:center?.12:.14,ya:height(s)+.014,yb:height(Math.min(p.L,s+len))+.014,mat:center?C.yellow:C.white,rails:false});
      if(center){const aa=at(p,s,off+.3),bb=at(p,Math.min(p.L-.5,s+len),off+.3);K.ramp(aa.x,aa.z,bb.x,bb.z,{w:.12,ya:height(s)+.014,yb:height(Math.min(p.L,s+len))+.014,mat:C.yellow,rails:false});}
    }
    for(const off of [-r.width/2+.22,r.width/2-.22])for(let s=0;s<p.L;s+=10){const a=at(p,s,off),b=at(p,Math.min(p.L,s+10),off);K.quad(C.white,[[a.x-.05,height(s)+.012,a.z],[b.x-.05,height(Math.min(p.L,s+10))+.012,b.z],[b.x+.05,height(Math.min(p.L,s+10))+.012,b.z],[a.x+.05,height(s)+.012,a.z]],[0,1,0]);}
    for(let s=22;s<p.L-10;s+=68)for(let k=0;k<lanes;k++) arrow(p,s,-r.width/2+(k+.5)*laneW,height(s)+.026,!r.oneway&&k<lanes/2,k===0);
  }
  // Reusable tactile surface: one material for every raised yellow warning strip.
  K.texture('streets-tactile',64,64,(g,w,h)=>{g.fillStyle='#e1b52e';g.fillRect(0,0,w,h);g.fillStyle='#f5d85c';for(let x=8;x<w;x+=16)for(let y=8;y<h;y+=16){g.beginPath();g.arc(x,y,3,0,PI*2);g.fill();}},[.4,.4]);
  K.texture('streets-grate',64,64,(g,w,h)=>{g.fillStyle='#474e50';g.fillRect(0,0,w,h);g.fillStyle='#181e22';for(let i=5;i<64;i+=8)g.fillRect(i,5,4,54);},[.6,.6]);
  // Ground holes do not clip previously registered road surfaces. Subtract the
  // open cuts from our ground geometry before submitting it to the real kit.
  const cutPaths = [[[-433.45,473.1],[-211.18,362.25]],[[-79.33,301.845],[85.2,217.68]]];
  const cuts=cutPaths.map(([a,b])=>stripPoly(a,b,18));
  const inCut=(x,z)=>cuts.some(q=>K.pointInPoly(x,z,q));
  function half(poly,a,b,inside) {
    const cross=p=>(b[0]-a[0])*(p[1]-a[1])-(b[1]-a[1])*(p[0]-a[0]);
    const out=[];for(let i=0;i<poly.length;i++){const p=poly[i],q=poly[(i+1)%poly.length],dp=cross(p),dq=cross(q),ip=inside?dp>=-1e-8:dp<=1e-8,iq=inside?dq>=-1e-8:dq<=1e-8;if(ip)out.push(p);if(ip!==iq){const t=dp/(dp-dq);out.push([mix(p[0],q[0],t),mix(p[1],q[1],t)]);}}return out;
  }
  function clipped(poly) {
    let pieces=[poly];
    for(const cut of cuts){const area=cut.reduce((sum,p,i)=>{const q=cut[(i+1)%cut.length];return sum+p[0]*q[1]-q[0]*p[1];},0),clip=area>0?cut:[...cut].reverse(),next=[];for(const piece of pieces){let remain=piece;for(let i=0;i<clip.length&&remain.length>2;i++){const a=clip[i],b=clip[(i+1)%clip.length],outside=half(remain,a,b,false);if(outside.length>2&&K.polyArea(outside)>.0001)next.push(outside);remain=half(remain,a,b,true);}}pieces=next;}return pieces;
  }
  const real=K;K=Object.create(real);
  K.slab=(poly,y,o={})=>{if(y>=0&&y<=.2){for(const p of clipped(poly))real.slab(p,y,o);}else real.slab(poly,y,o);};
  K.hpoly=(mat,poly,y,up=true,holes)=>{if(y>=0&&y<=.2){for(const p of clipped(poly))real.hpoly(mat,p,y,up,holes);}else real.hpoly(mat,poly,y,up,holes);};
  K.ramp=(ax,az,bx,bz,o={})=>{if(o.ya>=0&&o.yb>=0&&o.ya<=.2&&Math.abs(o.ya-o.yb)<.001){for(const p of clipped(stripPoly([ax,az],[bx,bz],o.w||2)))real.slab(p,o.ya,{mat:o.mat,thick:.05,under:false,edge:false,ceil:false});}else real.ramp(ax,az,bx,bz,o);};
  // Every claimed ordinary road, including residential branches, is rendered here.
  for(const r of roads) {
    if(r.id===301889788||r.id===301889787||flyIds.has(r.id)||tunnelIds.has(r.id))continue;
    const p=path(r.pts);if(!p.L)continue;
    if(r.footway==='crossing')continue;
    if(foot(r)) {for(let i=1;i<r.pts.length;i++)flat(r.pts[i-1],r.pts[i],r.width||2.5,WALK,'sidewalk',true);continue;}
    const hs=s=>r.bridge?ROAD+3*(r.pts[0][0]>990?1-s/p.L:s/p.L):ROAD;
    for(let i=1;i<r.pts.length;i++)K.ramp(...r.pts[i-1],...r.pts[i],{w:r.width,ya:hs(p.cum[i-1]),yb:hs(p.cum[i]),mat:'asphalt',rails:false});
    markings(r,p,hs);
    for(let s=40;s<p.L-8;s+=70){const q=at(p,s);if(q.x<-650||q.x>650||q.z<-750||q.z>600)continue;const k=Math.floor(rnd()*(r.lanes||3)),off=-r.width/2+(k+.5)*r.width/(r.lanes||3);const v=at(p,s,off);if(inCut(v.x,v.z))continue;K.vehicle({x:v.x,z:v.z,y:hs(s),rotY:v.rot+(r.oneway||k>0?0:PI),kind:rnd()<.14?'taxi':'car'});}
    if(major(r))for(let i=1;i<r.pts.length;i++)K.zone({name:r.name,floor:'지상',sub:r.name==='신반포로'?'고속터미널 · 반포쇼핑타운':r.name==='사평대로'?'서울성모병원 · 서리풀공원':r.name==='잠원로'?'잠원동 · 반포역':'반포대교 · 반포한강공원',poly:stripPoly(r.pts[i-1],r.pts[i],r.width+14),y0:-.2,y1:4,priority:1});
  }
  const crossings=roads.filter(r=>r.footway==='crossing');
  const stops=K.osm.nodes.filter(n=>n.k==='bus_stop'&&n.x>-460&&n.x<620&&n.z>-600&&n.z<560);
  const exits=K.osm.exits||[];
  const bboxes=K.osm.buildings.map(b=>({b,bb:K.polyBBox(b.poly)}));
  function inBuilding(x,z) {return bboxes.some(({b,bb})=>x>bb[0]-1&&x<bb[2]+1&&z>bb[1]-1&&z<bb[3]+1&&K.pointInPoly(x,z,b.poly));}
  function clearFurniture(x,z) {return !inCut(x,z)&&!inBuilding(x,z)&&!stops.some(p=>Math.hypot(p.x-x,p.z-z)<10)&&!exits.some(p=>Math.hypot(p.x-x,p.z-z)<5)&&!crossings.some(r=>nearest(x,z,[r]).d<4);}
  const furniture=[];
  function lamp(x,z,rot,y=WALK) {
    K.cyl({x,z,y,r:.11,h:7.5,seg:8,mat:C.steel});const dx=Math.sin(rot),dz=Math.cos(rot);
    beam([x,y+7.3,z],[x+dx*1.7,y+7.5,z+dz*1.7],.07);
    K.box({x:x+dx*1.8,z:z+dz*1.8,y:y+7.42,w:.5,h:.15,d:1.1,rotY:rot,mat:C.steel,solid:false});
    K.box({x:x+dx*1.8,z:z+dz*1.8,y:y+7.4,w:.4,h:.025,d:.9,rotY:rot,mat:emit(0xffedc2),solid:false});
  }
  function treePit(x,z,y=WALK) {
    K.box({x,z,y:y+.005,w:1.55,h:.08,d:1.55,mat:0x666d64,top:'streets-grate',solid:false});K.tree(x,z,{y:y+.07,h:6.5+rnd()*2,kind:rnd()<.55?'ginkgo':'zelkova'});
    for(const dx of [-.58,.58])for(const dz of [-.58,.58])K.box({x:x+dx,z:z+dz,y:y+.1,w:.045,h:.8,d:.045,mat:C.steel,solid:false});
  }
  // Sidewalks stop across side roads, crossings and building footprints. The
  // inner edge of a paired carriageway is rejected by the road proximity test.
  for(const r of surfaceRoads.filter(major)) {
    const p=path(r.pts);
    for(const side of [-1,1])for(let s=4;s<p.L-2;s+=7) {
      const off=side*(r.width/2+2),q=at(p,s,off),n=nearest(q.x,q.z,surfaceRoads.filter(a=>a!==r));
      if((n.r&&n.d<n.r.width/2+1.5)||inBuilding(q.x,q.z)||inCut(q.x,q.z))continue;
      const a=at(p,Math.max(0,s-3.6),off),b=at(p,Math.min(p.L,s+3.6),off);
      flat([a.x,a.z],[b.x,b.z],3.7,WALK,{tex:'sidewalk',color:0xe4ddd0},true);
      const ca=at(p,Math.max(0,s-3.6),side*(r.width/2+.18)),cb=at(p,Math.min(p.L,s+3.6),side*(r.width/2+.18));
      if(!inCut(ca.x,ca.z)&&!inCut(cb.x,cb.z))K.wall(ca.x,ca.z,cb.x,cb.z,ROAD,WALK,{thick:.28,mat:0xbfc1ba,solid:false});
      if(Math.abs(q.x)<650&&q.z>-750&&q.z<650&&clearFurniture(q.x,q.z)&&furniture.every(a=>Math.hypot(a[0]-q.x,a[1]-q.z)>17)) {
        const f=at(p,s,side*(r.width/2+1.2));treePit(f.x,f.z);furniture.push([q.x,q.z]);
        if(furniture.length%2===0){const l=at(p,s+5,side*(r.width/2+.7));lamp(l.x,l.z,q.rot+side*PI/2);}
        if(furniture.length%4===0)K.person(q.x,WALK,q.z);
      }
    }
  }
  function zebra(pts,w=4.2) {
    const p=path(pts);
    for(let s=.35;s<p.L-.2;s+=1.25){const a=at(p,s),b=at(p,Math.min(p.L,s+.62));flat([a.x,a.z],[b.x,b.z],w,ROAD+.034,C.white);}
    for(const s of [0,p.L]) {const q=at(p,s);K.box({x:q.x,z:q.z,y:WALK+.003,w:w,h:.012,d:.6,rotY:q.rot,mat:'streets-tactile',solid:false});}
  }
  for(const r of crossings)zebra(r.pts,Math.max(3.2,r.width));
  // Crossings represented only as nodes in the extract still receive zebras.
  for(const n of K.osm.nodes.filter(n=>n.k==='crossing')){
    const r=nearest(n.x,n.z);if(!r.r||r.d>r.r.width/2||!major(r.r)||crossings.some(c=>nearest(n.x,n.z,[c]).d<7))continue;
    if(n.x<-620||n.x>650||n.z<-650||n.z>600)continue;
    zebra([[r.x+r.v*(r.r.width/2+1),r.z-r.u*(r.r.width/2+1)],[r.x-r.v*(r.r.width/2+1),r.z+r.u*(r.r.width/2+1)]],4.5);
  }
  function signal(x,z,rot,name) {
    K.cyl({x,z,y:WALK,r:.1,h:5.9,mat:C.steel,seg:8});const u=Math.cos(rot),v=-Math.sin(rot),nx=Math.sin(rot),nz=Math.cos(rot);
    beam([x,5.8,z],[x+u*5.2,5.8,z+v*5.2],.09);const cx=x+u*4,cz=z+v*4;
    K.box({x:cx,z:cz,y:5.24,w:1.7,h:.46,d:.25,rotY:rot,mat:0x181f22,solid:false});
    for(let i=0;i<4;i++)K.box({x:cx+u*(i-1.5)*.37+nx*.14,z:cz+v*(i-1.5)*.37+nz*.14,y:5.32,w:.24,h:.25,d:.03,rotY:rot,mat:i===0?emit(0xf24f3b):0x22332b,solid:false});
    K.box({x:x+nx*.16,z:z+nz*.16,y:2.2,w:.36,h:.68,d:.22,rotY:rot,mat:0x161e23,solid:false});
    K.sign('보행', {x:x+nx*.3,z:z+nz*.3,y:2.5,w:.24,h:.22,rotY:rot,bg:'#11251a',fg:'#53e998'});
    if(name)K.sign(name,{x:x+u*1.5,z:z+v*1.5,y:4.6,w:2.6,h:.55,rotY:rot,bg:'#155b9c',fg:'#fff',twoSided:true,box:.08});
  }
  for(const n of K.osm.nodes.filter(n=>n.k==='traffic_signals')){
    const q=nearest(n.x,n.z);if(!q.r||q.d>q.r.width/2+2||n.x<-600||n.x>650||n.z<-700||n.z>600)continue;
    const x=q.x-q.v*(q.r.width/2+1),z=q.z+q.u*(q.r.width/2+1);signal(x,z,q.rot+PI,q.r.name);
    // Stop line uses the actual local approach tangent.
    flat([q.x-q.v*(q.r.width/2-.4)-q.u*5,q.z+q.u*(q.r.width/2-.4)-q.v*5],[q.x+q.v*(q.r.width/2-.4)-q.u*5,q.z-q.u*(q.r.width/2-.4)-q.v*5],.45,ROAD+.025,C.white);
  }
  // Use a transparent custom stencil: the kit's sign atlas material is opaque.
  K.texture('streets-bus-stencil',256,512,(g,w,h)=>{g.clearRect(0,0,w,h);g.fillStyle='#e8e5d7';g.font='bold 105px "Apple SD Gothic Neo", "Malgun Gothic", sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('버스',128,170);g.fillText('전용',128,340);},[2,5],{transparent:true});
  // Inner blue demarcation on Shinbanpo-ro.

  for(const id of [218913527,828782197,828782198,523344143,218722042,218722043]) {
    const r=byId.get(id),p=path(r.pts),off=-r.width/2+1.7;
    for(let s=0;s<p.L;s+=9){line(p,off-1.5,.16,s,Math.min(p.L,s+8.7),ROAD+.028,C.blue);line(p,off+1.5,.16,s,Math.min(p.L,s+8.7),ROAD+.028,C.blue);}
    for(let s=35;s<p.L;s+=140){const q=at(p,s,off);const r=q.rot+PI,c=Math.cos(r),sn=Math.sin(r),P=(x,z)=>[q.x+x*c+z*sn,ROAD+.031,q.z-x*sn+z*c];K.quad('streets-bus-stencil',[P(-1,2.5),P(1,2.5),P(1,-2.5),P(-1,-2.5)],[0,1,0]);}
  }
  function shelter(x,z,name,id='',island=false) {
    const near=nearest(x,z),rot=near.rot-PI/2,c=Math.cos(rot),s=Math.sin(rot),P=(u,v)=>({x:x+u*c+v*s,z:z-u*s+v*c});
    K.box({x,z,y:ROAD,w:island?26:8,h:WALK-ROAD,d:island?3.2:3.1,rotY:rot,mat:'sidewalk'});
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
    K.zone({name,floor:'지상',sub:id?'버스정류장 · '+id:'버스정류장',poly:rect(x,z,30,10),y0:0,y1:4,priority:4});
    return {rot,P};
  }
  const stopSpecs=[[-70.45,-96,'고속터미널(중)','22020',true],[6.35,-131.03,'고속터미널','',false],[-89.24,-115.7,'고속터미널','',false],[-145.79,-94.99,'호남고속·신세계','',false],[-171.44,-45.71,'고속터미널호남선','22220',false],[137.14,155.74,'고속터미널역 3번출구','',false],[407.01,-117.03,'고속터미널','',false],[559.18,-333.88,'반포역','22018',true],[-400.22,-210.78,'반포대교남단·한강공원입구','',false],[-70.52,518.16,'서울성모병원·서울지방조달청','',false]];
  for(const [x,z,n,id,isl] of stopSpecs) shelter(x,z,n,id,isl===true);
  const busRoad=byId.get(218913527),bq=nearest(-69,-92,[busRoad]);
  K.vehicle({x:bq.x-(-bq.v)*3.0,z:bq.z-bq.u*3.0,y:ROAD,rotY:bq.rot,kind:'cityBus',color:0x2367ac,label:'고속터미널'});
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
    K.box({x:p.x,z:p.z,y:0,w:8.6,h:WALK,d:2.8,rotY:rot,mat:'sidewalk'});
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
  const taxi=nearest(-113,-69.6),tr=taxi.rot-PI/2;
  K.cyl({x:-113,z:-69.6,y:0,r:.07,h:3.1,mat:C.steel});K.sign(['택시','승차장'],{x:-113,z:-69.6,y:2.5,w:.75,h:.8,rotY:tr,bg:'#d99a2c',fg:'#182c32',twoSided:true});
  for(let i=0;i<3;i++)K.vehicle({x:-126+taxi.u*i*6.2,z:-58+taxi.v*i*6.2,y:ROAD,rotY:taxi.rot,kind:'taxi'});
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
      else K.ramp(...a,...b,{w,ya,yb,rails:false,mat:{tex:'sidewalk',color:0xe1d6bf},under:0x7a979d});
      for(const side of [-1,1]){const dx=(b[0]-a[0])/L,dz=(b[1]-a[1])/L,aa=[a[0]-dz*side*w/2,a[1]+dx*side*w/2],bb=[b[0]-dz*side*w/2,b[1]+dx*side*w/2];if(trim){const pad=Math.min(1.45,L*.4),t0=pad/L,t1=1-t0;rail([mix(aa[0],bb[0],t0),mix(aa[1],bb[1],t0)],[mix(aa[0],bb[0],t1),mix(aa[1],bb[1],t1)],mix(ya,yb,t0),mix(ya,yb,t1),'bridge');}else if(i===1&&p===fp&&side===-1){const t=Math.min(.08,2/L);rail([mix(aa[0],bb[0],t),mix(aa[1],bb[1],t)],bb,mix(ya,yb,t),yb,'bridge');}else rail(aa,bb,ya,yb,'bridge');beam([aa[0],ya+.13,aa[1]],[bb[0],yb+.13,bb[1]],.035,emit(0xf2d7a2));}
    }
  }
  walkSpan(fp,fh,2.5,true);
  const sp=path(byId.get(301889787).pts);const bendY=4.7;walkSpan(sp,s=>s<=sp.cum[1]?mix(WALK,bendY,s/sp.cum[1]):mix(bendY,BRIDGE,(s-sp.cum[1])/(sp.L-sp.cum[1])),2.5,true,true);K.slab(rect(104.01,236.33,3.2,3.2),bendY,{mat:'darkstone',thick:.18});
  // Small landings stitch rounded corners and ends without covering the spiral below.
  for(const [x,z,y] of [[103.49,231.64,BRIDGE],[72.92,167.76,WALK],[90.19,236.92,WALK]])K.slab(rect(x,z,2.5,2.5),y,{mat:'sidewalk',thick:.18});
  for(const s of [0,22,48]){const q=at(fp,s);K.cyl({x:q.x,z:q.z,y:0,r:.38,h:BRIDGE-.3,seg:12,mat:0x8a9d9e});}
  // Illuminated structural mast + stays; style is inferred from official 주탑 description.
  const tower=at(fp,34,2);beam([tower.x,0,tower.z],[tower.x-2,17,tower.z-1],.32,0x477b87);
  beam([tower.x-.25,.2,tower.z+.3],[tower.x-2.25,16.8,tower.z-.7],.035,emit(0x8ad7e1));
  for(const s of [4,13,22,43,52,58]){const q=at(fp,s,1.25);beam([tower.x-2,16.6,tower.z-1],[q.x,BRIDGE+.2,q.z],.023,C.silver);}
  const label=at(fp,26,-1.35);K.sign('센트럴씨티보도육교',{x:label.x,z:label.z,y:BRIDGE-.35,w:12,h:.65,rotY:label.rot+PI/2,bg:'#63848a',fg:'#fff'});
  K.sign(['서리풀공원 산책길','미도산  →'],{x:99,z:239,y:2.1,w:2.4,h:.8,rotY:PI,bg:'#375f46',fg:'#fff',box:.1});
  K.sign(['고속터미널역  ←','센트럴시티 · 신세계'],{x:74,z:177,y:2.4,w:2.9,h:.8,rotY:.4,bg:'#273e54',fg:'#fff',box:.1});
  const led=at(fp,5,1.35);K.sign(['센트럴씨티보도육교','서초구 · 함께 걷는 거리'],{x:led.x,z:led.z,y:BRIDGE+1.7,w:3.8,h:.65,rotY:led.rot+PI/2,bg:'#12282a',fg:'#8ddfda',box:.14});
  // Accessible circulation is an explicit approximation: lift existence unresolved.
  K.slab(rect(106.5,232.5,7,3),BRIDGE,{mat:'sidewalk',thick:.28});
  K.slab(rect(109,235,4.4,7),WALK,{mat:'sidewalk',thick:.15});
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
}
