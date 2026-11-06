// Local OSM is preserved at its real coordinates; unrecorded facilities are
// separately anchored by source pins. Dimensions/heights are reconstructions.
const PATHS=[305677075,919393789,919393790,697678242,697678244,697678248,892370125,892370126,892370127,408858834,1497710475,1497710499,1497710500,949348575,949348576];
export const meta={id:'jamwon_hangang',name:'잠원한강공원',claims:[],claimRoads:PATHS,claimAreas:[981963451,1532626249],sources:['data/osm.json','refs/aerial/jamwon_park.jpg','refs/interior/jamwon_park/notes.json','https://hangang.seoul.go.kr/www/contents/657.do?mid=454']};
export function build(K){
  const rnd=K.rand(1082026),C={steel:0x71828a,dark:0x293f43,white:0xf1eee3,red:0xa96054,green:0x507c6a,yellow:0xf1cb43};
  const area=id=>K.osm.areas.find(a=>a.id===id),road=id=>K.osm.roads.filter(r=>r.id===id);
  const rect=(x0,z0,x1,z1)=>[[x0,z0],[x1,z0],[x1,z1],[x0,z1]];
  const box=(x,y,z,w,h,d,mat,solid=false,rotY=0)=>K.box({x,y,z,w,h,d,mat,solid,rotY});
  const sign=(t,x,y,z,w=4,h=.65,rotY=0,bg='#214a45',fg='#ffffff')=>K.sign(t,{x,y,z,w,h,rotY,bg,fg,twoSided:true});
  const slab=(p,y=0,mat='sidewalk',holes)=>K.slab(p,y,{mat,holes,thick:.16,ceil:false});
  const zone=(name,p,y=0,floor='1F',sub='',height=4)=>K.zone({name,poly:p,y0:y-.15,y1:y+height,floor,sub,priority:4});
  const spawn=(name,x,y,z,yawDeg=0)=>K.spawn({name,x,y,z,yaw:yawDeg*Math.PI/180});
  const frame=(x,z,a=0)=>{const c=Math.cos(a),s=Math.sin(a);return(u,v)=>[x+u*c+v*s,z-u*s+v*c];};
  const dist=(x,z,a,b)=>{const dx=b[0]-a[0],dz=b[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz||1)));return Math.hypot(x-a[0]-t*dx,z-a[1]-t*dz);};
  const mix=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t];
  function band(a,b,w,off=0){const L=Math.hypot(b[0]-a[0],b[1]-a[1]),nx=-(b[1]-a[1])/L,nz=(b[0]-a[0])/L,P=(p,k)=>[p[0]+nx*(off+k*w/2),p[1]+nz*(off+k*w/2)];return[P(a,-1),P(a,1),P(b,1),P(b,-1)];}
  function strip(a,b,w,y,mat,yb=y){if(Math.hypot(b[0]-a[0],b[1]-a[1])>.01)K.ramp(...a.slice(0,2),...b.slice(0,2),{w,ya:y,yb,mat,rails:false});}
  function paint(a,b,w=.1,y=.085,mat=0xf2eee0){K.hpoly(mat,band(a,b,w),y);}
  function beam(a,b,r=.065,mat=C.steel){const dx=b[0]-a[0],dy=b[1]-a[1],dz=b[2]-a[2],L=Math.hypot(dx,dy,dz)||1;let nx=-dz,nz=dx,nl=Math.hypot(nx,nz);if(nl<.001){nx=1;nz=0;nl=1;}nx=nx/nl*r;nz=nz/nl*r;const v=[-dy*nz/L,(dz*nx-dx*nz)/L,dy*nx/L],p=(q,s,t)=>[q[0]+s*nx+t*v[0],q[1]+t*v[1],q[2]+s*nz+t*v[2]];for(const s of[-1,1]){K.quad(mat,[p(a,s,-1),p(b,s,-1),p(b,s,1),p(a,s,1)],[s*nx,0,s*nz]);K.quad(mat,[p(a,-1,s),p(a,1,s),p(b,1,s),p(b,-1,s)],v.map(n=>n*s));}}
  function rail(a,b,y=0,truss=false){const L=Math.hypot(b[0]-a[0],b[1]-a[1]),n=Math.ceil(L/2.4);K.wall(...a,...b,y,y+1.15,{thick:.06,mat:C.steel,openings:[{at:L/2,w:L,y0:y+.12,y1:y+1.04}]});for(let i=0;i<=n;i++){const p=mix(a,b,i/n);box(p[0],y,p[1],.07,1.2,.07,C.steel);}beam([a[0],y+.5,a[1]],[b[0],y+.5,b[1]],.025);if(truss)for(let i=0;i<n;i++){const p=mix(a,b,i/n),q=mix(a,b,(i+1)/n);beam([p[0],y+.17,p[1]],[q[0],y+1.02,q[1]],.03);beam([p[0],y+1.02,p[1]],[q[0],y+.17,q[1]],.03);}}
  function bench(x,z,a=0,y=0){const P=frame(x,z,a);for(let i=0;i<4;i++){const p=P(0,(i-1.5)*.13);box(p[0],y+.42,p[1],1.9,.07,.10,'wood',false,a);}const p=P(0,.27);box(p[0],y+.55,p[1],1.9,.43,.08,'wood',false,a);for(const u of[-.7,.7]){const q=P(u,0);box(q[0],y,q[1],.09,.44,.55,C.dark,false,a);}}
  function lamp(x,z,banner=false,y=0){K.cyl({x,y,z,r:.075,h:4.8,mat:C.dark,seg:6});box(x,y+4.75,z,.85,.12,.4,C.white);box(x,y+4.7,z,.7,.03,.3,'emit');if(banner)sign(['잠원한강공원','함께 걷는 한강'],x+.43,y+3.35,z,.8,1.4,0,'#305b87','#f4e8bc');}
  function chair(x,y,z,a=0,col=C.yellow){const P=frame(x,z,a);box(x,y+.43,z,.46,.07,.46,col,false,a);const q=P(0,.22);box(q[0],y+.5,q[1],.46,.42,.05,col,false,a);for(const u of[-.18,.18])for(const v of[-.18,.18]){const p=P(u,v);box(p[0],y,p[1],.035,.43,.035,col);}}
  function table(x,y,z){box(x,y+.71,z,1.1,.07,.8,'wood',true);for(const dx of[-.43,.43])for(const dz of[-.28,.28])box(x+dx,y,z+dz,.045,.71,.045,C.dark);}
  function cone(x,z,y=0){box(x,y,z,.42,.06,.42,0x373c3d);box(x,y+.06,z,.24,.51,.24,0xed6e36);box(x,y+.34,z,.25,.12,.25,C.white);}
  function bicycle(x,z,a=0,y=0,col=0x478b77){const P=frame(x,z,a),p=(u,v,h)=>{const q=P(u,v);return[q[0],y+h,q[1]];};for(const u of[-.57,.57])for(let j=0;j<12;j++){const t=j*Math.PI/6,t2=(j+1)*Math.PI/6;beam(p(u+.31*Math.cos(t),0,.35+.31*Math.sin(t)),p(u+.31*Math.cos(t2),0,.35+.31*Math.sin(t2)),.027,0x30383a);if(j%3===0)beam(p(u,0,.35),p(u+.31*Math.cos(t),0,.35+.31*Math.sin(t)),.008,C.steel);}for(const[a1,b1]of[[[-.57,.35],[-.18,.84]],[[-.18,.84],[.1,.35]],[[.1,.35],[-.57,.35]],[[.1,.35],[.45,.85]],[[.45,.85],[-.18,.84]],[[.45,.85],[.57,.35]]])beam(p(a1[0],0,a1[1]),p(b1[0],0,b1[1]),.025,col);beam(p(.45,0,.85),p(.45,0,1.07),.025,C.steel);beam(p(.45,-.25,1.07),p(.45,.25,1.07),.025,C.dark);const q=P(-.18,0);box(q[0],y+.85,q[1],.28,.065,.16,C.dark,false,a);}
  // Convex subtraction handles approach cutouts which straddle park boundaries.
  const cutouts=[];
  function subtract(poly,h){let rem=poly,out=[];const ar=h.reduce((s,p,i)=>{const q=h[(i+1)%h.length];return s+p[0]*q[1]-q[0]*p[1];},0),sg=ar>=0?1:-1;function clip(p,a,b,side){const d=q=>sg*((b[0]-a[0])*(q[1]-a[1])-(b[1]-a[1])*(q[0]-a[0]));let r=[];for(let i=0;i<p.length;i++){const u=p[i],v=p[(i+1)%p.length],du=d(u),dv=d(v),iu=du*side>=-1e-7,iv=dv*side>=-1e-7;if(iu)r.push(u);if(iu!==iv)r.push(mix(u,v,du/(du-dv)));}return r;}for(let i=0;i<h.length&&rem.length>2;i++){const a=h[i],b=h[(i+1)%h.length],p=clip(rem,a,b,-1);if(p.length>2)out.push(p);rem=clip(rem,a,b,1);}return out;}
  function ground(poly,y,mat){let ps=[poly];for(const h of cutouts)ps=ps.flatMap(p=>subtract(p,h));for(const p of ps)K.hpoly(mat,p,y);}
  const park=area(981963451).poly,paths=[],reserved=[];
  // Pedestrian tunnel beside the separately mapped vehicle bore. Ramps start
  // outside both motorway ribbons; all pedestrian coordinates follow the OSM.
  const access=[[344.24,-1268.03,0],[334.76,-1275.72,-4],[297.31,-1315.35,-4],[283.79,-1330.92,0]];
  for(let i=1;i<access.length;i++){const a=access[i-1],b=access[i],p=band(a,b,3.4);cutouts.push(p);K.groundHole(p);strip(a,b,3.25,a[2],i===2?0xaca9a0:'concrete',b[2]);paths.push([a,b,5]);}
  for(const r of road(1497710475)){strip(r.pts[0],r.pts[1],2.5,.025,'sidewalk');paths.push([r.pts[0],r.pts[1],2.5]);}
  tunnel(access[1],access[2],3.25,'신잠원나들목');
  for(const i of[0,2]){const a=access[i],b=access[i+1],p=band(a,b,3.5);for(const[q,r]of[[p[0],p[3]],[p[1],p[2]]]){K.wall(...q,...r,-4.1,.65,{mat:'concrete',thick:.2});rail(q,r,.65);}}
  function tunnel(a,b,w,name){const L=Math.hypot(b[0]-a[0],b[1]-a[1]),ux=(b[0]-a[0])/L,uz=(b[1]-a[1])/L,nx=-uz,nz=ux,P=(s,t,h)=>[a[0]+ux*s+nx*t,h,a[1]+uz*s+nz*t],base=a[2]??-4;
    for(const side of[-1,1]){const p=P(0,side*w/2,0),q=P(L,side*w/2,0);K.wall(p[0],p[2],q[0],q[2],base,base+2.5,{mat:{tex:'metal',color:0xc9ceca},thick:.18});}
    for(let k=0;k<12;k++){const t=k*Math.PI/12,u=(k+1)*Math.PI/12;K.quad({tex:'metal',color:0xc3c8c5},[P(0,Math.cos(t)*w/2,base+2.45+Math.sin(t)*1.1),P(L,Math.cos(t)*w/2,base+2.45+Math.sin(t)*1.1),P(L,Math.cos(u)*w/2,base+2.45+Math.sin(u)*1.1),P(0,Math.cos(u)*w/2,base+2.45+Math.sin(u)*1.1)],[0,-1,0]);}
    K.slab(band(a,b,w+.45),base+3.85,{mat:'concrete',thick:.3});
    for(const s of[0,L]){const p=P(s,0,base+2.82);sign(name,p[0],p[1],p[2],w,.48,Math.atan2(-ux,-uz),'#49696a');}
    zone(name,band(a,b,w+.2),base,'1F','보행 통로 · 한강공원 연결',3.6);
    K.detail({name:name+' 내부',floor:'1F',poly:band(a,b,w+1),y0:base,y1:base+3.8},()=>{const pa=P(0,-.25,0),pb=P(L,-.25,0);paint([pa[0],pa[2]],[pb[0],pb[2]],.1,base+.015,C.yellow);const wa=P(0,.7,0),wb=P(L,.7,0);K.hpoly(C.red,band([wa[0],wa[2]],[wb[0],wb[2]],1.35),base+.009);for(let s=2;s<L;s+=4){const p=P(s,0,base+3.39);box(p[0],p[1],p[2],.25,.06,.9,'emit',false,Math.atan2(ux,uz));for(const side of[-1,1]){const q=P(s,side*(w/2-.015),base+.1);beam(q,P(s,side*(w/2-.015),base+2.45),.018,C.steel);}}for(const s of[6,L-6]){const p=P(s,-.95,base+.025);K.floorText('보행',{x:p[0],y:p[1],z:p[2],w:.8,h:1.2,rotY:Math.atan2(-ux,-uz),fg:'#ffffff'});}});
  }
  zone('잠원한강공원',park,0,'1F','한강 산책로 · 잔디 쉼터',12);
  const manual=new Set([1497710475,1497710499,1497710500,949348575,949348576]);
  for(const id of PATHS)if(!manual.has(id))for(const r of road(id))for(let i=1;i<r.pts.length;i++){const a=r.pts[i-1],b=r.pts[i],cy=r.hw==='cycleway',w=cy?Math.max(2,r.width):Math.max(2.5,r.width);strip(a,b,w,.065,cy?{tex:'asphalt',color:C.red}:'sidewalk');paths.push([a,b,w]);if(cy){const L=Math.hypot(b[0]-a[0],b[1]-a[1]);for(let s=0;s<L-.5;s+=6)paint(mix(a,b,s/L),mix(a,b,Math.min(L,s+2)/L),.09,.074,0xffe5a3);}}
  // Complete ways above preserve the three western paths across the Banpo edge.
  strip([226.35,-1384.83],[238.65,-1389.18],3,.065,{tex:'asphalt',color:C.red});strip([222.75,-1391.13],[238.65,-1389.18],2,.065,{tex:'asphalt',color:C.red});
  const promenade=[[289.49,-1501.82],[321,-1568],[447,-1698],[598,-1872],[687,-1967],[791,-2085]];
  function parkWay(pts){for(let i=1;i<pts.length;i++){const a=pts[i-1],b=pts[i];strip(a,b,3,.065,{tex:'asphalt',color:C.red});slab(band(a,b,2.4,3),.06,{tex:'asphalt',color:C.green});paths.push([a,b,10]);const L=Math.hypot(b[0]-a[0],b[1]-a[1]);for(let s=2;s<L-2;s+=7)paint(mix(a,b,s/L),mix(a,b,Math.min(L,s+2)/L),.1,.08,C.yellow);}}
  parkWay(promenade);strip([238.65,-1389.18],[289.49,-1501.82],3,.065,{tex:'asphalt',color:C.red});
  for(const id of[949348575,949348576])for(const r of road(id)){strip(r.pts[0],r.pts[1],3.2,.12,'wood');const p=band(r.pts[0],r.pts[1],3.2);rail(p[0],p[3],.12);rail(p[1],p[2],.12);}
  const fitness=area(1532626249).poly;slab(fitness,.03,{tex:'sidewalk',color:0xc9c0a7});zone('잠원 체력단련장',fitness,0);
  K.detail({name:'체력단련장',floor:'1F',poly:fitness,y0:0,y1:4},()=>{for(let i=0;i<5;i++){const x=270+i*2.2,z=-1381+i*1.5;for(const dx of[-.65,.65])K.cyl({x:x+dx,z,y:.03,r:.06,h:2.2,mat:C.dark,seg:6});beam([x-.65,2.2,z],[x+.65,2.2,z],.055,0xebb64b);bench(x,z+3);}});
  for(const[a,b]of[[[10,-1330],[29,-1352]],[[51,-1370],[111,-1375]],[[157,-1403],[187,-1434]],[[337,-1602],[414,-1684]]])rail(a,b,.035);
  K.detail({name:'잠원 잔디와 피크닉 쉼터',floor:'1F',rect:[5,-1350,90,-1165],y0:0,y1:5},()=>{for(const[x,z]of[[27,-1200],[39,-1208],[28,-1220],[40,-1308],[57,-1311],[63,-1298]]){const col=[0xc2ae63,0x657c70,0xa7b2b0][Math.floor(rnd()*3)];box(x,.025,z,3.5,.025,2.6,0xabc4b4);K.dome({x,y:.05,z,rx:1.6,ry:1.35,rz:1.1,mat:col,seg:12,rings:5});box(x,.08,z+1.09,.85,.9,.02,0x293e40);K.person(x+2,.05,z,{sit:true,shirt:0xdec29d});box(x+2.7,.04,z,.4,.3,.3,0xc3a77f);}lamp(53,-1226,true);sign('잠원한강공원',65,2.3,-1280,5,.8);});
  buildFacilities();
  // Grass is last so every sunken facility can register its exact cutout.
  ground(park,.012,{tex:'grass',color:0xb9caa0});
  for(let n=0,g=0;n<155&&g<5000;g++){const x=-45+rnd()*975,z=-1110-rnd()*990;if(!K.pointInPoly(x,z,park)||park.some((a,i)=>dist(x,z,a,park[(i+1)%park.length])<7)||paths.some(([a,b,w])=>dist(x,z,a,b)<w/2+6)||cutouts.some(p=>K.pointInPoly(x,z,p))||reserved.some(p=>K.pointInPoly(x,z,p))||K.pointInPoly(x,z,fitness))continue;K.tree(x,z,{h:5+rnd()*5,kind:n%5===0?'ginkgo':'zelkova'});n++;if(n%10===0){bench(x+2,z+2);lamp(x+4,z+3,true);}}
  function buildFacilities(){
    // 서울웨이브: mapped gangway, unrecorded envelope. Open ground floor cafe,
    // event hall above and an accessible roof terrace (heights are estimates).
    floatingHouse({name:'서울웨이브아트센터',tenant:'마레보인 웨이브',x:173,z:-1533,w:38,d:29,levels:3,door:[188.22,-1515.03],style:'wave'});
    floatingHouse({name:'서울로얄마리나',tenant:'SEOUL ROYAL MARINA',x:257.93,z:-1572.23,w:25,d:23,levels:3,door:[265.45,-1563.27],style:'marina'});
    const pier=rect(215,-1621,274,-1600);slab(pier,.12,'wood');rail([215,-1621],[274,-1621],.12);strip([257.93,-1582.5],[251,-1602],3.2,.12,'wood');
    zone('잠원 마리나 계류장',pier,0,'1F','요트 계류 데크');
    for(let i=0;i<5;i++){
      const x=220+i*10,z=-1627;slab(rect(x-1.2,-1642,x+1.2,-1618),.12,'wood');
      const hull=[[x+2,z+7],[x+6,z+7],[x+6.7,z-4],[x+4,z-9],[x+1.5,z-4]];
      K.prism(hull,-.95,.12,{mat:0xf3eee2,side:0xdde4e3,solid:false});box(x+4,.13,z-1,3.3,.65,6,0xf8f6e9);box(x+4,.8,z-1,2.8,1.05,3.8,'glass');box(x+4,1.85,z-1,3,.12,4,0xf4eee1);beam([x+4,.1,z-5],[x+4,7,z-5],.035,C.steel);
    }
    pool();
    // Tall, narrow poplar silhouettes beside the open cycle route, matching17.
    for(let i=0;i<12;i++){const x=335+i*12,z=-1568-i*13;K.cyl({x,z,y:0,r:.14,h:7.5,seg:6,mat:0x8c8977});K.dome({x,z,y:3.2,rx:1.15,ry:6.4,rz:1.15,seg:8,rings:6,mat:i%3===0?0x809249:0x61834d});}
    // Primary paper locates the older 잠원나들목 park portal at this pin.
    // The street-side alignment and ramps are inferred, connecting to 잠원로.
    const old=[[806,-1650,0],[770,-1675,0],[741,-1708,-4],[698,-1779,-4],[678.49,-1805.34,0]];
    strip(old[0],old[1],4,0,'sidewalk');paths.push([old[0],old[1],6]);
    for(let i=2;i<old.length;i++){const a=old[i-1],b=old[i],p=band(a,b,5.6);cutouts.push(p);K.groundHole(p);strip(a,b,5.2,a[2],'concrete',b[2]);paths.push([a,b,7]);if(i!==3){const q=band(a,b,5.5);for(const[u,v]of[[q[0],q[3]],[q[1],q[2]]])K.wall(...u,...v,-4.15,.8,{mat:{tex:'darkstone',color:0xb6afa0},thick:.3});}}
    tunnel(old[2],old[3],5.2,'잠원나들목');
    strip([678.49,-1805.34],[620,-1820],4,.065,'sidewalk');strip([620,-1820],[566,-1835],4,.065,'sidewalk');paths.push([[678.49,-1805.34],[566,-1835],6]);
    const mouth=frame(698,-1779,Math.atan2(43,71));
    for(const side of[-1,1]){
      const a=mouth(side*3.3,0),b=mouth(side*8,6);K.wall(...a,...b,-4,.5,{mat:{tex:'darkstone',color:0x9d9f85},thick:.65});
      const c=mouth(side*5,7),d=mouth(side*5,-5);K.stairs(...c,...d,{ya:0,yb:2.8,w:1.8,mat:'concrete',rails:true});
    }
    for(const dx of[-2,0,2]){const x=678.49+dx*1.5,z=-1805.34-dx;K.cyl({x,y:0,z,r:.13,h:.9,mat:C.dark,seg:8});box(x,.55,z,.28,.18,.28,C.yellow);}
    sign(['잠원나들목','한강공원'],684,2.3,-1807,3.8,1.1,.6);sign('차량 진입금지',681,1.8,-1802,1.3,.5,.6,'#be3b32');
    K.floorText('배달존',{x:687,y:.04,z:-1810,w:3,h:1.7,fg:'#f6e8a3'});
    spawn('잠원나들목 · 거리 입구',770,0,-1674,32);
    spawn('잠원나들목 · 공원 입구',677,0,-1808,212);
    // The local OSM has no geometry past the clipped northern edge. These bank
    // points are a conservative continuation, with facilities at source pins.
    const bank=[[775.9,-2100],[850,-2190],[965,-2318],[1080,-2425],[1200,-2480],[1330,-2610],[1450,-2670]],inland=[[935.67,-2100],[1030,-2180],[1110,-2280],[1230,-2390],[1300,-2440],[1410,-2540],[1500,-2600]],extension=[...bank,...inland.slice().reverse()];
    slab(extension,0,{tex:'grass',color:0xb9caa0});zone('잠원한강공원 · 한남대교',extension,0,'1F','수변 산책로 · 제4주차장',12);
    // Water extension shares only the z=-2100 seam with city-owned river152336.
    const water=[[-198.12,-2100],...bank,[1450,-2850],[-198.12,-2850]];
    // No rendered base terrain exists outside osm.bbox. Remove only its global
    // physics ground here: an out-of-bounds Earcut hole would corrupt that mesh.
    K.phys.addGroundHole(water);K.hpoly('water',water,-1.4);K.phys.addSurface(water,-2.1,{slow:.7,tag:'jamwon_hangang'});
    for(let i=1;i<bank.length;i++)K.wall(...bank[i-1],...bank[i],-2.4,0,{mat:{tex:'concrete',color:0xaaa699},thick:.15,solid:false});
    parkWay([[791,-2085],[869,-2165],[989,-2295],[1100,-2394],[1200,-2445],[1348,-2570],[1450,-2630]]);
    hannam();
    // Photo12's roof explicitly says 잠원1호, not 잠원2호. Its address pin is
    // independently corroborated by an event organizer's Google Maps link.
    // Photo13's yellow terrace is used as an uncertain furnishing reference.
    floatingHouse({name:'세븐일레븐 한강르네상스잠원1호점',tenant:'7-ELEVEN',x:1374.43,z:-2579.16,w:26,d:18,levels:2,door:[1383.5,-2563.8],style:'seven'});
    strip([1383.5,-2563.8],[1383.5,-2553],4,.12,'wood');strip([1383.5,-2553],[1348,-2570],3,.12,'sidewalk');
    const rental=rect(1090,-2373,1126,-2358);zone('잠원 자전거 대여소',rental,0,'1F','한남대교 남단 상류');
    // Public pin anchors the rental area; racks sit to its east so the through
    // promenade, store entrance and rooftop staircase stay unobstructed.
    box(1121,0,-2364,6,2.8,3.8,0x9ca99d,true);sign('자전거 대여소',1121,2.3,-2361.9,5,.65);
    K.detail({name:'잠원 자전거 대여소',floor:'1F',rect:[1090,-2374,1145,-2324],y0:0,y1:5},()=>{for(let row=0;row<2;row++)for(let i=0;i<15;i++)bicycle(1129+i*.7,-2366+row*3,Math.PI/2,.02,[0x9ba66c,0x5b8191,0xc78359][i%3]);});
    for(let i=0;i<11;i++){const x=918+i*18,z=-2180-i*17;K.tree(x,z,{h:7+(i%3),kind:i%2?'ginkgo':'zelkova'});if(i%3===0){bench(x+3,z-2);lamp(x+4,z,true);}}
    spawn('한남대교 · 분리 자전거길',927,.065,-2225,315);
    spawn('제4주차장 · 한남대교 계단',985,0,-2151,0);
    spawn('세븐일레븐 잠원1호 · 선상 데크',1383.5,.12,-2561,0);
  }

  function floatingHouse(o){
    const {x,z,w,d,levels,style,name,tenant,door}=o,y0=.12,floorH=3.8;
    const hull=[[x-w/2,z+d/2],[x+w/2,z+d/2],[x+w/2+3,z],[x+w/2,z-d/2],[x-w/2,z-d/2],[x-w/2-3,z]];
    K.prism(hull,-1.1,y0,{mat:style==='wave'?0xe0e8e5:C.white,side:style==='seven'?0x3d4d43:0x7b8b88,solid:false});
    slab(hull,y0,'wood');reserved.push(rect(x-w/2-5,z-d/2-5,x+w/2+5,z+d/2+5));
    const inner=rect(x-w/2+2,z-d/2+2,x+w/2-2,z+d/2-3),roofY=y0+levels*floorH;
    // A long clear staircase is inside the envelope along the west wall.
    const sx=x-w/2+4,sz=z-d/2+4,ez=sz+10,stairsHole=rect(sx-1.5,sz+.15,sx+1.5,ez+.3);
    for(let f=0;f<levels;f++){
      const y=y0+f*floorH,holes=f?[stairsHole]:[];
      K.slab(inner,y,{mat:f?'wood':'tile',holes,thick:.18});
      K.polyWalls(inner,y,y+floorH,{mat:f===0||style==='wave'||style==='marina'?'glass':C.white,inner:f===0||style==='marina'?'glass':C.white,thick:.18,openings:[{x:x+w/2-2,z:z+3,w:3,y0:y,y1:y+2.9},{x:x+4,z:z+d/2-3,w:4,y0:y,y1:y+2.9}]});
      // Repeated white vertical frames and upper ribbon windows.
      for(let u=-w/2+3;u<w/2-1;u+=4){box(x+u,y,z-d/2+2,.13,floorH,.18,C.white);if(f>0){box(x+u+1.2,y+.8,z+d/2-2.9,2.2,2,.05,'glass');box(x+u,y,z+d/2-3,.14,floorH,.19,C.white);}}
      for(const v of[-d/2+2,d/2-3])box(x,y+floorH-.25,z+v,w-4,.25,.24,style==='marina'?0x447f83:C.white);
      K.stairs(sx,ez,sx,sz,{ya:y,yb:y+floorH,w:2.4,mat:'concrete',rails:true});
      const floorLabel=(f+1)+'F',sub=style==='seven'?(f===0?'편의점 · 라면 조리대':'땅땅치킨'):f===0?'선상 카페':style==='wave'?'웨딩홀 · 연회장':f===2?'모나크 비스트로':'강변 라운지';
      zone(name,inner,y,floorLabel,sub,floorH-.05);
      K.detail({name:name+' '+floorLabel,floor:floorLabel,poly:inner,y0:y,y1:y+floorH},()=>{
        const clear=x-w/2+8;
        if(style==='seven'&&f===0){
          box(x+4,y,z-4,7,.95,.8,0xc5b795,true);sign('계산대',x+4,y+1.8,z-4,2,.4);
          for(let i=0;i<4;i++){const fx=x+w/2-3.1,fz=z-d/2+4+i*2.1;box(fx,y,fz,1,2.25,1.7,C.white,true);box(fx-.53,y+.18,fz,.05,1.85,1.55,'glass');for(let h=0;h<4;h++)for(let j=0;j<4;j++)box(fx-.48,y+.35+h*.41,fz-.55+j*.35,.1,.22,.16,[0xa7be83,0xe3ae69,0xc17a65,0x79afc2][j]);}
          for(const u of[-2,2]){box(x+u,y,z,1,1.35,5.3,0xd6d0bb,true);for(let h=0;h<3;h++)for(let j=0;j<9;j++)box(x+u,y+.2+h*.4,z-2.2+j*.55,1.08,.27,.35,[0x9daf61,0xdd8b66,0xdfbd67][j%3]);}
          box(x+3,y,z+d/2-5,5,.95,.7,C.white,true);for(let i=0;i<3;i++)box(x+1.5+i*1.3,y+.96,z+d/2-5,.65,.4,.45,0x686f69);sign('라면 조리대',x+3,y+1.8,z+d/2-5,3,.4);
        }else{
          box(x+w/2-4,y,z-d/2+4,1.1,1.05,5.5,'wood',true);sign(f===0?'주문하는 곳':style==='wave'?'마레보인 웨이브':style==='seven'?'땅땅치킨':f===2?'모나크 비스트로':'서울로얄마리나',x+w/2-4,y+2.2,z-d/2+4,4,.5,Math.PI/2);
          for(let u=clear;u<x+w/2-6;u+=4)for(let v=z-d/2+7;v<z+d/2-5;v+=4){table(u,y,v);chair(u-1,y,v,Math.PI/2,style==='wave'?0xb8ac8a:C.white);chair(u+1,y,v,-Math.PI/2,style==='wave'?0xb8ac8a:C.white);}
          if(f===1&&style==='wave'){box(x+4,y,z-d/2+5,10,.18,3,0xe6dfd1);sign('마레보인 웨이브',x+4,y+2.3,z-d/2+2.3,8,1);for(let i=0;i<8;i++)K.dome({x:x+i-1,y:y+.4,z:z-d/2+4,rx:.3,ry:.5,rz:.3,mat:0xf5e9dc,seg:8,rings:4});}
        }
        for(let u=x-w/2+10;u<x+w/2-2;u+=6)box(u,y+3.5,z,2.1,.035,.3,'emit');
      });
    }
    K.slab(inner,roofY,{mat:style==='seven'?{tex:'grass',color:0x91ad6b}:'wood',holes:[stairsHole],thick:.2});
    // Elevator is a reconstructed accessibility connection, explicitly documented.
    const elx=x+w/2-4.2,elz=z+1;
    K.elevator({name:name+' 승강기',x:elx,z:elz,w:2.1,d:2.1,rotY:-Math.PI/2,floors:Array.from({length:levels+1},(_,i)=>({label:(i+1)+'F',y:y0+i*floorH,name:i===levels?'옥상 테라스':i===0?'카페 · 매장':'강변 휴게공간'}))});
    for(let i=0;i<inner.length;i++)rail(inner[i],inner[(i+1)%inner.length],roofY,style==='seven');
    zone(name,inner,roofY,(levels+1)+'F','옥상 테라스 · 한강 전망',4);
    K.detail({name:name+' 옥상',floor:(levels+1)+'F',poly:inner,y0:roofY,y1:roofY+4},()=>{
      for(let u=x-w/2+10;u<x+w/2-6;u+=4)for(let v=z-d/2+5;v<z+d/2-4;v+=4){table(u,roofY,v);chair(u-.9,roofY,v,Math.PI/2);chair(u+.9,roofY,v,-Math.PI/2);}
      for(let u=x-w/2+9;u<x+w/2-4;u+=5){beam([u,roofY,z-d/2+3],[u,roofY+3,z-d/2+3],.04,C.white);beam([u,roofY+3,z-d/2+3],[u,roofY+3,z+d/2-4],.015,C.dark);for(let v=z-d/2+4;v<z+d/2-3;v+=2)K.dome({x:u,y:roofY+2.65,z:v,rx:.09,ry:.14,rz:.09,mat:{tex:'emit',color:0xffd993},seg:6,rings:3});}
    });
    sign(tenant,x,y0+levels*floorH-.65,z+d/2-2.8,w*.7,1.1,0,style==='seven'?'#f8f7ed':'#234c52',style==='seven'?'#176843':'#ffffff');
    if(style==='seven'){for(const[col,yy]of[[0xe15d39,2.8],[0xf4a547,2.65],[0x24834c,2.5]])box(x,y0+yy,z+d/2-2.7,w-4,.12,.08,col);sign('잠원1호',x+w/2-5,roofY+1,z+d/2-3,4,.8,0,'#25558a');sign('땅땅치킨',x,4.5,z+d/2-2.7,6,.7,0,'#d87944');}
    // Open deck entry joins the gangway without an enclosing rail at the end.
    strip(door,[x+4,z+d/2-2.8],3.6,.12,'wood');
    if(style==='wave')spawn('서울웨이브 · 선상 카페',x+4,.12,z+7,180);
    if(style==='seven')spawn('세븐일레븐 · 노란 의자 옥상',x+3,roofY,z+2,75);
  }

  function pool(){
    const x=422.79,z=-1576.40,P=frame(x,z,.74),poly=(a,b,c,d)=>[P(a,b),P(c,b),P(c,d),P(a,d)];
    const deck=poly(-43,-38,43,38),basin=poly(-25,-12.5,25,12.5),children=poly(-29,20,-7,31);reserved.push(deck);
    for(const p of[basin,children]){cutouts.push(p);K.groundHole(p);slab(p,-1.25,0x65c6df);K.polyWalls(p,-1.25,.12,{mat:0x83d7ec,thick:.15});}
    K.slab(deck,.035,{mat:{tex:'sidewalk',color:0xe4d7ce},holes:[basin,children],thick:.18,ceil:false});
    for(const p of[basin,children])for(let i=0;i<p.length;i++)paint(p[i],p[(i+1)%p.length],.7,.065,0xe4a6bb);
    for(let i=-3;i<=3;i++){const a=P(-23,i*3),b=P(23,i*3);paint(a,b,.16,-1.23,0x27699b);for(const u of[-23,23]){const a=P(u,i*3-1),b=P(u,i*3+1);paint(a,b,.16,-1.23,0x27699b);}}
    const stairA=P(22,12.3),stairB=P(22,6.4);K.stairs(...stairA,...stairB,{ya:.035,yb:-1.25,w:2,rails:true,mat:0xb2d8dd});
    // Perimeter openings, admissions and changing/shower rooms are walkable.
    for(let i=0;i<deck.length;i++){const a=deck[i],b=deck[(i+1)%deck.length];if(i===2){const m=mix(a,b,.5),u=mix(a,b,.44),v=mix(a,b,.56);rail(a,u);rail(v,b);strip(m,[360,-1565],4,.035,'sidewalk');paths.push([m,[360,-1565],5]);}else rail(a,b);}
    const entry=P(0,38);sign(['잠원수영장','비수기 · 수조 정비'],entry[0],2.8,entry[1],7,1.15,.74);
    zone('잠원수영장',deck,0,'1F','비수기 빈 수조 · 흰 그늘막',5);zone('잠원수영장 수조',basin,-1.25,'1F','정비 중인 수조',1.4);
    for(const side of[-1,1])for(let i=0;i<7;i++){
      const cx=-32+i*10,cz=side*28;
      for(const u of[-4,4])for(const v of[-3,3]){const p=P(cx+u,cz+v);K.cyl({x:p[0],z:p[1],y:.035,r:.055,h:2.5,mat:C.white,seg:6});}
      for(let j=0;j<10;j++){const a=j*Math.PI/10,b=(j+1)*Math.PI/10,A=P(cx-4,cz+Math.cos(a)*3.3),B=P(cx+4,cz+Math.cos(a)*3.3),D=P(cx-4,cz+Math.cos(b)*3.3),E=P(cx+4,cz+Math.cos(b)*3.3);const q=[[A[0],2.5+Math.sin(a)*1.45,A[1]],[B[0],2.5+Math.sin(a)*1.45,B[1]],[E[0],2.5+Math.sin(b)*1.45,E[1]],[D[0],2.5+Math.sin(b)*1.45,D[1]]];K.quad(C.white,q,[0,1,0]);K.quad(0xd9d9ce,q,[0,-1,0]);}
    }
    for(const side of[-1,1]){
      const rp=[P(side*34-4,-11),P(side*34+4,-11),P(side*34+4,10),P(side*34-4,10)];K.slab(rp,.035,{mat:'tile'});K.polyWalls(rp,.035,2.8,{mat:0xe6e5d8,inner:'tile',openings:[{x:P(side*34,10)[0],z:P(side*34,10)[1],w:2,y0:.035,y1:2.5}]});K.slab(rp,2.85,{mat:C.white});const p=P(side*34,10.1);sign(side<0?'여자 탈의실':'남자 탈의실',p[0],2.1,p[1],4,.55,.74);zone(side<0?'잠원수영장 여자 탈의실':'잠원수영장 남자 탈의실',rp,0,'1F','보관함 · 샤워실',2.8);
      K.detail({name:'수영장 탈의실 '+side,floor:'1F',poly:rp,y0:0,y1:2.8},()=>{for(let i=0;i<7;i++){const q=P(side*34-2,-8+i*2.2);box(q[0],0,q[1],1.3,2.1,.55,0x90bfc3,true,.74);for(let j=0;j<2;j++){const p=P(side*34-1.65,-8+i*2.2);box(p[0],.55+j,p[1],.05,.1,.04,C.steel);}}const b=P(side*34+1,0);bench(b[0],b[1],.74);});
    }
    K.detail({name:'잠원수영장 그늘막과 수조',floor:'1F',poly:deck,y0:-1.25,y1:4},()=>{for(let i=0;i<10;i++){const p=P(-24+i*5,-18);box(p[0],.1,p[1],1.6,.3,.65,C.white,false,.74);const q=P(-24+i*5,-18.4);box(q[0],.3,q[1],1.6,.36,.12,C.white,false,.74);}for(const[u,v]of[[-17,-23],[0,-23],[17,-23]]){const p=P(u,v);K.cyl({x:p[0],z:p[1],y:0,r:.04,h:2.6,mat:C.white,seg:6});K.dome({x:p[0],z:p[1],y:2.5,rx:2.3,ry:.45,rz:2.3,mat:C.white,seg:12,rings:3});}for(const u of[-20,-10,0,10,20]){const p=P(u,13.2);sign('수심 1.2m',p[0],.5,p[1],1.2,.25,.74,'#f5ebe3','#245e84');}});
    const cam=P(0,34);spawn('잠원수영장 · 빈 수조',cam[0],.035,cam[1],42.4);
  }

  function hannam(){
    const a=[993,-2110],b=[881,-2365],q=band(a,b,34),L=Math.hypot(b[0]-a[0],b[1]-a[1]),u=[(b[0]-a[0])/L,(b[1]-a[1])/L],n=[-u[1],u[0]],P=(s,o=0)=>[a[0]+u[0]*s+n[0]*o,a[1]+u[1]*s+n[1]*o];
    const stairVoid=rect(958.7,-2160.1,962.1,-2145.95);
    for(const piece of subtract(q,stairVoid))K.slab(piece,8.4,{mat:'asphalt',under:'concrete',thick:1.1});
    rail(q[0],mix(q[0],q[3],38/L),8.4);rail(mix(q[0],q[3],58/L),q[3],8.4);rail(q[1],q[2],8.4);
    for(const off of[-13,-7,0,7,13])for(const[s0,s1]of off===-13?[[0,40],[65,L]]:[[0,L]]){const c=P(s0,off),d=P(s1,off);K.wall(...c,...d,6.55,7.4,{thick:.7,mat:0x79948b,solid:false});}
    for(let s=20;s<L;s+=45){const c=P(s,-13),d=P(s,13);for(const p of[c,d])box(p[0],0,p[1],2,6.6,2,'concrete',true);beam([c[0],6,c[1]],[d[0],6,d[1]],.7,0x939f9e);}
    // Underbridge promenade retains clear 3m cycle + 2.4m walking strips.
    const pa=[900,-2220],pb=[972,-2186],p=band(pa,pb,6.8,1.2);strip(pa,pb,3,.065,{tex:'asphalt',color:C.red});slab(band(pa,pb,2.4,3),.06,{tex:'asphalt',color:C.green});rail(p[0],p[3],.065,true);rail(p[1],p[2],.065,true);paths.push([pa,pb,9]);
    strip([900,-2220],[927,-2225],4,.065,'sidewalk');strip([972,-2186],[989,-2295],3,.065,'sidewalk');
    for(let i=1;i<15;i++){const t=i/15,q=mix(pa,pb,t);cone(q[0]-1,q[1]+1,.065);}
    for(const t of[.2,.6,.9]){const q=mix(pa,pb,t);K.floorText('자전거 ↑',{x:q[0],y:.085,z:q[1],w:2.3,h:3,rotY:Math.atan2(-(pb[0]-pa[0]),-(pb[1]-pa[1])),fg:'#ffffff'});K.floorText('보행',{x:q[0]-2,y:.082,z:q[1]+3,w:1.7,h:2,rotY:-2,fg:'#ffffff'});}
    zone('한남대교 하부',rect(887,-2250,994,-2150),0,'1F','자전거길 · 보행로 · 사방치기',6);
    const park=rect(977,-2190,1041,-2124);slab(park,.025,'asphalt');zone('잠원 제4주차장',park,0,'1F','한남대교 남단 · 계단 연결');
    for(const z of[-2130,-2150,-2170])for(let i=0;i<14;i++){const x=994+i*3;paint([x,z-3],[x,z+3],.1,.045);paint([x,z+3],[x+3,z+3],.1,.045);}
    for(const z of[-2138,-2158,-2180])K.floorText('↑',{x:1008,y:.05,z,w:1.6,h:3,fg:'#ffffff'});
    box(984,.025,-2129,3,2.7,3.4,0xc9d0ca,true);box(984,1.1,-2127.25,2.2,1.1,.05,'glass');sign(['잠원 제4주차장','출구 ←  입구 →'],990,3,-2125,7,1.2,0,'#26568a');
    for(let i=0;i<9;i++)cone(988,-2135-i*5,.025);
    // Official bridge stair pin. Upper landing at deck datum, lower at park.
    const stairs=[[960.36,-2145.90],[960.36,-2159],[980,-2159],[980,-2145.9]];
    slab(rect(958.6,-2145.9,962,-2143),8.4,'sidewalk');K.stairs(...stairs[0],...stairs[1],{ya:8.4,yb:4.2,w:2.7,rails:true,mat:'concrete'});slab(rect(958.6,-2161,981.5,-2159),4.2,'sidewalk');K.stairs(...stairs[2],...stairs[3],{ya:4.2,yb:.025,w:2.7,rails:true,mat:'concrete'});strip(stairs[3],[985,-2145.9],3,.025,'sidewalk');
    K.elevator({name:'한남대교 공원 승강기',x:966,z:-2147,w:2.2,d:2.2,rotY:Math.PI/2,floors:[{label:'1F',y:.025,name:'제4주차장'},{label:'2F',y:8.4,name:'한남대교 보도'}]});slab(rect(962.5,-2150,972,-2144),8.4,'sidewalk');slab(rect(962.5,-2150,978,-2144),.025,'sidewalk');
    zone('한남대교 보도',rect(958,-2151,973,-2142),8.4,'2F','공원 내려가는 계단',4);
    // Clock identity in photo03 is uncertain; it is an interpreted Hannam detail.
    K.texture('jamwon_clock',256,256,(g,w,h)=>{g.clearRect(0,0,w,h);g.fillStyle='#3a5353';g.beginPath();g.arc(128,128,122,0,Math.PI*2);g.fill();g.fillStyle='#f3efdf';g.beginPath();g.arc(128,128,109,0,Math.PI*2);g.fill();g.strokeStyle='#2d4443';g.lineWidth=4;for(let i=0;i<12;i++){const a=i*Math.PI/6;g.beginPath();g.moveTo(128+Math.sin(a)*87,128-Math.cos(a)*87);g.lineTo(128+Math.sin(a)*101,128-Math.cos(a)*101);g.stroke();}g.lineWidth=7;g.beginPath();g.moveTo(128,128);g.lineTo(84,94);g.moveTo(128,128);g.lineTo(166,61);g.stroke();},[1,1],{transparent:true,doubleSide:true});
    K.cyl({x:922,z:-2201,y:0,r:.08,h:5.5,mat:C.dark,seg:8});box(922,3.65,-2201,1.25,1.25,.035,'jamwon_clock');
    K.detail({name:'한남대교 하부와 제4주차장',floor:'1F',rect:[887,-2250,1045,-2120],y0:0,y1:6},()=>{
      for(let i=0;i<8;i++){bicycle(974+i*.8,-2195,Math.PI/2,.03);cone(984+i*2,-2200);}
      for(const z of[-2130,-2150,-2170])for(let i=0;i<13;i++)if((i+Math.round(z))%4!==0)K.vehicle({x:995.5+i*3,z,y:.025,rotY:Math.PI,color:[0xe5e7e2,0x4b5b67,0x263539,0xc5c8c5][i%4]});
      for(let i=0;i<8;i++){const x=941+(i%2)*1.1,z=-2169-Math.floor(i/2)*1.2;for(const[a,b]of[[[x,z],[x+1,z]],[[x,z],[x,z+1.1]],[[x+1,z],[x+1,z+1.1]],[[x,z+1.1],[x+1,z+1.1]]])paint(a,b,.07,.04,[0xe6d06c,0xc97b72,0x8bb7c1][i%3]);K.floorText(String(i+1),{x:x+.5,y:.05,z:z+.55,w:.5,h:.6,fg:'#ffffff'});}
      sign('사방치기',941,1.7,-2167,2.8,.5);bench(944,-2159);bench(949,-2159);sign('한남대교',971,3.8,-2184,4,.8,0,'#205b97');
      // Photo09's panda is interpreted as a small painted mural, not a texture.
      K.dome({x:980,y:1.2,z:-2199,rx:.55,ry:.65,rz:.04,mat:C.white,seg:12,rings:6,hemi:false});for(const dx of[-.3,.3])K.dome({x:980+dx,y:1.6,z:-2198.95,rx:.17,ry:.22,rz:.05,mat:C.dark,seg:8,rings:4,hemi:false});
    });
  }
  spawn('신잠원나들목 · 거리 입구',345,0,-1267,43);
  spawn('신잠원나들목 · 내부',316,-4,-1295.6,43);
  spawn('잠원 잔디 쉼터',48,.065,-1254,0);
  spawn('한강 산책로 · 반포 연결',-13.88,.065,-1163.19,0);
}
