// Local OSM is preserved at its real coordinates; unrecorded facilities are
// separately anchored by source pins. Dimensions/heights are reconstructions.
const PATHS=[305677075,919393789,919393790,697678242,697678244,697678248,892370125,892370126,892370127,408858834,1497710475,1497710499,1497710500,949348575,949348576];
export const meta={id:'jamwon_hangang',name:'잠원한강공원',claims:[],claimRoads:PATHS,claimAreas:[981963451,1532626249],sources:['data/osm.json','refs/aerial/jamwon_park.jpg','refs/interior/jamwon_park/notes.json','https://hangang.seoul.go.kr/www/contents/657.do?mid=454','https://magazine.sfac.or.kr/html/view.asp?PubDate=202004&CateMasterCd=300&CateSubCd=2336','https://www.directwedding.co.kr/weddinghall/marevo-in-wave','https://mediahub.seoul.go.kr/archives/2017290']};
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
  // Direct colours avoid multiplying an already dark asphalt/green grass map.
  for(const[key,col]of[['jamwon_orange','#c58b68'],['jamwon_walk_orange','#cfa181'],['jamwon_wet_path','#555951'],['jamwon_mud','#81735e'],['jamwon_lawn','#78865a']])K.texture(key,256,256,(g,w,h)=>{
    g.fillStyle=col;g.fillRect(0,0,w,h);const r=K.rand(1509);
    for(let i=0;i<4200;i++){g.fillStyle=i%3?'#d9cbb91a':'#25362519';g.fillRect(r()*w,r()*h,1+r()*2,1+r()*2);}
  },[2,2]);
  // Pedestrian tunnel beside the separately mapped vehicle bore. Ramps start
  // outside both motorway ribbons; all pedestrian coordinates follow the OSM.
  K.texture('jamwon_hex_revetment',512,512,(g,w,h)=>{
    g.fillStyle='#969b87';g.fillRect(0,0,w,h);
    for(let row=-1;row<10;row++)for(let col=-1;col<10;col++){
      const x=col*64+(row%2)*32,y=row*55;
      g.beginPath();for(let j=0;j<6;j++){const a=j*Math.PI/3;const xx=x+31*Math.cos(a),yy=y+31*Math.sin(a);j?g.lineTo(xx,yy):g.moveTo(xx,yy);}g.closePath();
      const grad=g.createLinearGradient(x-25,y-28,x+25,y+28);grad.addColorStop(0,'#c8c9b8');grad.addColorStop(.45,'#aeb19d');grad.addColorStop(1,'#767e71');g.fillStyle=grad;g.fill();g.strokeStyle='#6c7368';g.lineWidth=2;g.stroke();
    }
  },[3.2,3.2]);
  K.texture('jamwon_silver_panels',512,256,(g,w,h)=>{
    const gr=g.createLinearGradient(0,0,w,0);for(const [t,c]of[[0,'#7c898b'],[.22,'#b6c3c2'],[.4,'#e5e8dd'],[.6,'#a3b1af'],[.8,'#d2d9d0'],[1,'#7c898b']])gr.addColorStop(t,c);g.fillStyle=gr;g.fillRect(0,0,w,h);g.strokeStyle='#86918c';g.lineWidth=2;g.strokeRect(2,2,w-4,h-4);
  },[2.8,1.15]);
  const access=[[344.24,-1268.03,0],[334.76,-1275.72,-4],[297.31,-1315.35,-4],[283.79,-1330.92,0]];
  for(let i=1;i<access.length;i++){const a=access[i-1],b=access[i],p=band(a,b,3.4);cutouts.push(p);K.groundHole(p);strip(a,b,3.25,a[2],i===2?0xaca9a0:'concrete',b[2]);paths.push([a,b,5]);}
  for(const r of road(1497710475)){strip(r.pts[0],r.pts[1],2.5,.025,'sidewalk');paths.push([r.pts[0],r.pts[1],2.5]);}
  tunnel(access[1],access[2],3.25,'신잠원나들목');
  for(const i of[0,2]){const a=access[i],b=access[i+1],p=band(a,b,3.5);for(const[q,r]of[[p[0],p[3]],[p[1],p[2]]]){K.wall(...q,...r,-4.1,.65,{mat:'concrete',thick:.2});rail(q,r,.65);}}
  // Photo01 is a portal through a levee, not an open stairwell in the lawn.
  function tunnel(a,b,w,name,approach=false){
    // HF1iiczAe6M_65: the OSM Sinjamwon bore is rectangular concrete.
    // The silver arch in the older photo belongs to the other Jamwon access.
    if(name==='신잠원나들목'){concreteTunnel(a,b,w,approach);return;}
    const L=Math.hypot(b[0]-a[0],b[1]-a[1]),ux=(b[0]-a[0])/L,uz=(b[1]-a[1])/L,nx=-uz,nz=ux,base=a[2]??-4,end=b[2]??base;
    const P=(s,t,h)=>[a[0]+ux*s+nx*t,base+(end-base)*s/L+h,a[1]+uz*s+nz*t],yaw=Math.atan2(-ux,-uz),silver={tex:'jamwon_silver_panels',gloss:.5};
    // Collision walls stay behind the wavy facing and glazed openings.
    for(const side of[-1,1]){const p=P(0,side*(w/2+.08),0),q=P(L,side*(w/2+.08),0);K.wall(p[0],p[2],q[0],q[2],Math.min(base,end)-.1,Math.max(base,end)+2.6,{mat:side<0?'glass':silver,thick:.12});}
    const segments=Math.ceil(L/3.2);
    for(let i=0;i<segments;i++){
      const s0=L*i/segments,s1=L*(i+1)/segments;
      for(let k=0;k<16;k++){const t=k*Math.PI/16,u=(k+1)*Math.PI/16,tm=(t+u)/2;
        K.quad(silver,[P(s0,Math.cos(t)*w/2,2.35+Math.sin(t)*1.32),P(s1,Math.cos(t)*w/2,2.35+Math.sin(t)*1.32),P(s1,Math.cos(u)*w/2,2.35+Math.sin(u)*1.32),P(s0,Math.cos(u)*w/2,2.35+Math.sin(u)*1.32)],[-nx*Math.cos(tm),-Math.sin(tm),-nz*Math.cos(tm)]);
      }
      // Two gently convex silver panel courses on the right.
      for(let row=0;row<2;row++)for(let k=0;k<8;k++){
        const t=k/8,v=(k+1)/8,off=u=>w/2-.10-.11*Math.sin(u*Math.PI),h0=.18+row*1.08,h1=h0+1.07;
        K.quad(silver,[P(s0+(s1-s0)*t,off(t),h0),P(s0+(s1-s0)*v,off(v),h0),P(s0+(s1-s0)*v,off(v),h1),P(s0+(s1-s0)*t,off(t),h1)],[-nx,0,-nz]);
      }
      // Left-side white ribs have bowed edges around blue-green glazing.
      const t=-w/2+.06;
      for(let k=0;k<10;k++){const h0=.2+k*.215,h1=h0+.215,shift=h=>.18*Math.sin(h*2.4),center=s0+.18;
        K.quad(0xd8d9cd,[P(center-.14+shift(h0),t,h0),P(center+.14+shift(h0),t,h0),P(center+.14+shift(h1),t,h1),P(center-.14+shift(h1),t,h1)],[nx,0,nz]);
      }
      for(const h of[.12,2.25]){const p=P(s0,t,h),q=P(s1,t,h);beam(p,q,.12,0xc1c8be);}
      const p=P((s0+s1)/2,t-.015,1.15);K.quad({tex:'glass',color:0xa1c5bc},[P(s0+.45,t, .35),P(s1-.18,t,.35),P(s1-.18,t,2.15),P(s0+.45,t,2.15)],[nx,0,nz]);
    }
    // Exterior shell follows the ramp instead of putting a flat cap through it.
    K.quad('concrete',[P(0,-w/2-.22,3.9),P(L,-w/2-.22,3.9),P(L,w/2+.22,3.9),P(0,w/2+.22,3.9)],[0,1,0]);
    zone(name,band(a,b,w+.2),Math.min(base,end),'1F','보행 통로 · 한강공원 연결',Math.abs(end-base)+3.8);
    K.detail({name:name+(approach?' 진입부':' 내부'),floor:'1F',poly:band(a,b,w+1),y0:Math.min(base,end),y1:Math.max(base,end)+3.9},()=>{
      for(const [off,width,mat]of[[.7,1.35,0xa66d4d],[-.25,.12,C.yellow]]){
        const p=P(0,off-width/2,.02),q=P(L,off-width/2,.02),r=P(L,off+width/2,.02),s=P(0,off+width/2,.02);K.quad(mat,[p,q,r,s],[0,1,0]);
      }
      for(let s=1;s<L;s+=.42){for(const off of[-.28,-.23])beam(P(s,off,.035),P(Math.min(L,s+.26),off,.035),.009,0xe9b947);}
      for(let s=2;s<L;s+=5){const p=P(s,0,3.48);box(p[0],p[1],p[2],.28,.055,.75,'emit',false,yaw);for(let k=0;k<16;k++){const t=k*Math.PI/16,u=(k+1)*Math.PI/16;beam(P(s,Math.cos(t)*w/2,2.35+Math.sin(t)*1.29),P(s,Math.cos(u)*w/2,2.35+Math.sin(u)*1.29),.018,0x83918e);}}
      if(!approach){for(const s of[9,L-11]){const a=P(s-.7,-.45,3.58),b=P(s+.7,-.45,3.58),c=P(s+.7,.45,3.58),d=P(s-.7,.45,3.58);K.quad({tex:'emit',color:0xbadce0},[a,b,c,d],[0,-1,0]);for(const[e,f]of[[a,b],[b,c],[c,d],[d,a]])beam(e,f,.045,0xe0e3d8);const q=P(s+1.15,0,3.24);K.dome({x:q[0],y:q[1],z:q[2],rx:.11,ry:.1,rz:.11,mat:C.dark,seg:8,rings:4,hemi:false});}}
      for(const s of[6,L-6]){const p=P(s,-.95,.035);K.floorText('보행',{x:p[0],y:p[1],z:p[2],w:.8,h:1.2,rotY:yaw,fg:'#ffffff'});}
    });
  }
  function concreteTunnel(a,b,w,approach){
    const L=Math.hypot(b[0]-a[0],b[1]-a[1]),ux=(b[0]-a[0])/L,uz=(b[1]-a[1])/L,nx=-uz,nz=ux;
    const P=(s,t,h)=>[a[0]+ux*s+nx*t,a[2]+(b[2]-a[2])*s/L+h,a[1]+uz*s+nz*t];
    const concrete={tex:'concrete',color:0xc6c8bd};
    for(const side of[-1,1]){const p=P(0,side*(w/2+.06),0),q=P(L,side*(w/2+.06),0);
      K.wall(p[0],p[2],q[0],q[2],Math.min(a[2],b[2])-.1,Math.max(a[2],b[2])+3.25,{mat:concrete,thick:.14});}
    for(const h of[3.25,3.48])K.quad(concrete,[P(0,-w/2,h),P(L,-w/2,h),P(L,w/2,h),P(0,w/2,h)],[0,h===3.25?-1:1,0]);
    // Inferred width of the orange strip; surveyed pedestrian centreline stays.
    K.quad(0xbf835c,[P(0,-.75,.015),P(L,-.75,.015),P(L,1.38,.015),P(0,1.38,.015)],[0,1,0]);
    for(let s=2;s<L;s+=5){const p=P(s,.7,3.15);box(p[0],p[1],p[2],.22,.045,.95,'emit',false,Math.atan2(-ux,-uz));}
    zone('신잠원나들목',band(a,b,w+.2),Math.min(a[2],b[2]),'1F','차도 옆 분리 보행 통로',Math.abs(b[2]-a[2])+3.4);
    if(!approach){
      // City skips OSM tunnel roads. Render the mapped neighbouring vehicle bore
      // here without moving it or claiming a new road / changing shared metadata.
      for(const r of road(282194888))for(let i=1;i<r.pts.length;i++){
        const c=r.pts[i-1],d=r.pts[i],p=band(c,d,r.width),ya=i===1?0:-4,yb=i===r.pts.length-1?0:-4;
        cutouts.push(p);K.groundHole(p);strip(c,d,r.width,ya,'asphalt',yb);
        const roof=p.map((q,j)=>[q[0],(j<2?ya:yb)+3.35,q[1]]);K.quad(concrete,roof,[0,-1,0]);K.quad(concrete,roof,[0,1,0]);
        const line=band(c,d,.1);K.quad(C.yellow,line.map((q,j)=>[q[0],(j<2?ya:yb)+.02,q[1]]),[0,1,0]);
        for(const[e,f]of[[p[0],p[3]],[p[1],p[2]]])K.wall(...e,...f,-4,3.35,{mat:concrete,thick:.15});
      }
    }
  }
  function levee(route,w,name){
    const mouth=route[route.length-1],street=route[0],dx=street[0]-mouth[0],dz=street[1]-mouth[1],length=Math.hypot(dx,dz),ux=dx/length,uz=dz/length,nx=-uz,nz=ux;
    const P=(s,t,h=0)=>[mouth[0]+ux*s+nx*t,h,mouth[1]+uz*s+nz*t],plan=(s,t)=>{const p=P(s,t);return[p[0],p[2]];};
    const fade=t=>Math.max(0,Math.min(1,(105-Math.abs(t))/55)),crest=5.85;
    // Broad, tapered earthwork follows the landward edge; holes remain below it.
    const ts=[-105,-75,-50,-16,-w/2,w/2,16,50,75,105];
    for(let i=1;i<ts.length;i++)for(const [s0,s1]of[[0,20],[20,length-18],[length-18,length]]){
      const t0=ts[i-1],t1=ts[i],h=(s,t)=>crest*fade(t)*(s===0||s===length?.84:1);
      K.quad({tex:'grass',color:0x9da47c},[P(s0,t0,h(s0,t0)),P(s1,t0,h(s1,t0)),P(s1,t1,h(s1,t1)),P(s0,t1,h(s0,t1))],[0,1,0],[[t0/5,s0/5],[t0/5,s1/5],[t1/5,s1/5],[t1/5,s0/5]]);
    }
    for(const s of[0,length]){
      const normal=s===0?[-ux,0,-uz]:[ux,0,uz],half=w/2+.18;
      for(const side of[-1,1])for(let i=0;i<8;i++){
        const start=name==='신잠원나들목'&&side===1?12.5:half;
        const t0=side*(start+(105-start)*i/8),t1=side*(start+(105-start)*(i+1)/8);
        const h0=crest*fade(t0)*.84,h1=crest*fade(t1)*.84;
        K.quad('jamwon_hex_revetment',[P(s,t0,0),P(s,t1,0),P(s,t1,h1),P(s,t0,h0)],normal,[[t0/3.2,0],[t1/3.2,0],[t1/3.2,h1/3.2],[t0/3.2,h0/3.2]]);
      }
      // Sinjamwon has a square lintel; retain the separate Jamwon metal arch.
      if(name==='신잠원나들목'){
        K.quad({tex:'concrete',color:0xc5c6bc},[P(s,-half,3.25),P(s,12.5,3.25),P(s,12.5,4.91),P(s,-half,4.91)],normal);
        K.quad({tex:'concrete',color:0xb4b8af},[P(s,half,0),P(s,half+.4,0),P(s,half+.4,3.25),P(s,half,3.25)],normal);
      }else for(let k=0;k<20;k++){const a=k*Math.PI/20,b=(k+1)*Math.PI/20,t0=Math.cos(a)*half,t1=Math.cos(b)*half,h0=2.32+Math.sin(a)*1.38,h1=2.32+Math.sin(b)*1.38;
        K.quad('jamwon_hex_revetment',[P(s,t0,h0),P(s,t1,h1),P(s,t1,4.91),P(s,t0,4.91)],normal,[[k/10,0],[(k+1)/10,0],[(k+1)/10,.5],[k/10,.5]]);
        beam(P(s,t0,h0),P(s,t1,h1),.10,0xc7cac0);const out=s===0?-.7:.7;
        K.quad({tex:'metal',color:0x9ca6a1},[P(s,t0,h0),P(s+out,t0,h0),P(s+out,t1,h1),P(s,t1,h1)],[0,-1,0]);
        beam(P(s+out,t0,h0),P(s+out,t1,h1),.045,C.dark);
      }
      for(const side of[-1,1]){
        const inner=name==='신잠원나들목'&&side===1?12.5:side*(w/2+.3),outer=name==='신잠원나들목'&&side===1?20:side*12;
        K.quad('jamwon_hex_revetment',[P(s-.18,inner,0),P(s-.18,outer,0),P(s-.18,outer,1.0),P(s-.18,inner,4.75)],normal,[[0,0],[3,0],[3,.32],[0,1.48]]);
        beam(P(s-.23,inner,4.75),P(s-.23,outer,1),.09,0xcbd0c6);
      }
      const out=s===0?-1:1;slab([plan(s+out*1,-12),plan(s+out*7,-12),plan(s+out*7,12),plan(s+out*1,12)],0,{tex:'concrete',color:0xc0c0b6});
      // Five posts frame a clear 1.4m walking gap; no centre bollard blocks route.
      for(const t of[-5.4,-3.8,-1.7,1.7,4.1,5.7]){const p=P(s+out*3,t);K.cyl({x:p[0],y:0,z:p[2],r:.14,h:1,mat:0x44534e,seg:10});K.cyl({x:p[0],y:.58,z:p[2],r:.145,h:.18,mat:C.yellow,seg:10});}
      const yaw=Math.atan2(normal[0],normal[2]);
      for(const[t,label]of[[-w/2-.65,'20'],[w/2+.65,'진입금지']]){const p=P(s+out*.4,t,2.15);K.sign(label,{x:p[0],y:p[1],z:p[2],w:label==='20'?.48:.65,h:.5,rotY:yaw,bg:'#f4eee2',fg:'#b42d2d',twoSided:true});}
      const p=P(s+out*.42,0,4.25);sign(name,p[0],p[1],p[2],w,.4,yaw,'#4c605a');
      // Transparent noise screen sits on the crest, above the tunnel opening.
      for(let t=-58;t<58;t+=2.9){const a=P(s,t,crest*fade(t)*.84),b=P(s,t+2.9,crest*fade(t+2.9)*.84);K.quad({tex:'glass',color:0xaabdbb},[a,b,[b[0],b[1]+1.85,b[2]],[a[0],a[1]+1.85,a[2]]],normal);beam(a,[a[0],a[1]+1.95,a[2]],.045,C.steel);beam([a[0],a[1]+1.85,a[2]],[b[0],b[1]+1.85,b[2]],.03,C.steel);}
    }
    // Decks retain the OSM carriageway centre lines and 17.5m width. Their
    // reconstructed height feathers back into the city's y=.03 ribbons.
    for(const id of[46676451,46709879])for(const r of road(id))for(let i=1;i<r.pts.length;i++){
      const a=r.pts[i-1],b=r.pts[i],len=Math.hypot(b[0]-a[0],b[1]-a[1]),n=Math.ceil(len/5);
      for(let j=0;j<n;j++){const c=mix(a,b,j/n),d=mix(a,b,(j+1)/n),local=p=>[(p[0]-mouth[0])*ux+(p[1]-mouth[1])*uz,(p[0]-mouth[0])*nx+(p[1]-mouth[1])*nz],cc=local(c),dd=local(d);
        if(Math.abs((cc[1]+dd[1])/2)>105||cc[0]<12||cc[0]>length-10)continue;
        const ya=.04+crest*fade(cc[1]),yb=.04+crest*fade(dd[1]);strip(c,d,r.width,ya,{tex:'asphalt',color:0xb5b5ad},yb);
        const bd=band(c,d,r.width);for(const[a,b]of[[bd[0],bd[3]],[bd[1],bd[2]]])beam([a[0],ya+.5,a[1]],[b[0],yb+.5,b[1]],.12,0xc9c9bf);
      }
    }
  }
  // Cover the old open ramps while leaving every existing floor endpoint intact.
  tunnel(access[0],access[1],3.25,'신잠원나들목',true);tunnel(access[2],access[3],3.25,'신잠원나들목',true);levee(access,3.25,'신잠원나들목');
  // HF_65: street-side apron and tall acoustic-panel screen, not an invented
  // occupied building. Keep both surveyed bores and their ramp levels intact.
  {
    const u=[.692,.722],n=[-.722,.692],P=(s,t,h=0)=>[344.24+u[0]*s+n[0]*t,h,-1268.03+u[1]*s+n[1]*t],p=(s,t)=>{const q=P(s,t);return[q[0],q[2]];},a=Math.atan2(u[0],u[1]);
    slab([p(.6,-3),p(14,-3),p(14,12.7),p(.6,12.7)],0,{tex:'sidewalk',color:0xd2c7b9});
    for(const side of[-1,1]){const t=side<0?-2.1:12.7;K.quad({tex:'concrete',color:0xc7c9c3},[P(0,t,0),P(8,t,0),P(8,t,1.05),P(0,t,4.91)],[u[0],0,u[1]]);}
    K.detail({name:'신잠원나들목 광장과 방음벽',floor:'1F',rect:[322,-1286,365,-1240],y0:0,y1:12},()=>{
      for(let t=-2;t<13;t+=1.5){
        for(let row=0;row<4;row++)K.quad({tex:'metal',color:row%2?0xa09a8c:0xb4b0a4},[P(-.3,t,4.95+row*1.1),P(-.3,t+1.48,4.95+row*1.1),P(-.3,t+1.48,6.03+row*1.1),P(-.3,t,6.03+row*1.1)],[u[0],0,u[1]]);
        beam(P(-.18,t,4.9),P(-.18,t,10.8),.045,0x776e5c);
        beam(P(-.18,t,10.8),P(-2.3,t,11.3),.035,0x8a8e85);
      }
      for(const h of[5,6.1,7.2,8.3,9.4,10.8])beam(P(-.16,-2,h),P(-.16,13,h),.04,0x7c7b70);
      const s=P(.14,6.2,5.42);sign('신잠원나들목',s[0],s[1],s[2],3,.68,a,'#806150','#f0e7d2');
      const g=P(6.6,.1,.018);box(g[0],g[1],g[2],1.05,.035,.68,0x5c5044,false,a);
      for(let t=-.42;t<=.43;t+=.12)beam(P(6.3,t,.06),P(6.9,t,.06),.012,0x8d8171);
      const sticker=P(.3,-1.58,1.5);sign(['한강공원','보행자 통로'],sticker[0],sticker[1],sticker[2],.5,.45,a,'#327a99');
    });
  }
  zone('잠원한강공원',park,0,'1F','한강 산책로 · 잔디 쉼터',12);
  const manual=new Set([1497710475,1497710499,1497710500,949348575,949348576,408858834]);
  for(const id of PATHS)if(!manual.has(id))for(const r of road(id))for(let i=1;i<r.pts.length;i++){const a=r.pts[i-1],b=r.pts[i],cy=r.hw==='cycleway',w=cy?Math.max(2,r.width):Math.max(2.5,r.width);strip(a,b,w,.065,cy?0x777c78:'sidewalk');paths.push([a,b,w]);if(cy){const L=Math.hypot(b[0]-a[0],b[1]-a[1]);for(let s=0;s<L-.5;s+=6)paint(mix(a,b,s/L),mix(a,b,Math.min(L,s+2)/L),.09,.074,0xffe5a3);}}
  // HF_90/110/130: paired cycle and walking lanes continue out of the tunnel.
  // Their surveyed axis is fixed; widths and the exact crossing paint are inferred.
  for(const r of road(408858834))for(let i=1;i<r.pts.length;i++){
    const a=r.pts[i-1],b=r.pts[i];strip(a,b,3.8,.065,{tex:'jamwon_orange',gloss:.3});
    slab(band(a,b,1.85,2.85),.065,{tex:'jamwon_walk_orange',gloss:.3});paths.push([a,b,9]);
    paint(a,b,.09,.081,0xd8ba70);const p=band(a,b,3.8);paint(p[1],p[2],.12,.081);
  }
  // A separate tree-lined walking path reaches Wave's shore gangway. It never
  // cuts across the water to the cafe (HF_185/215); both ends meet mapped paths.
  const waveWalk=[[253.4,-1385.7],[248,-1404],[247,-1430],[243,-1453],[238.4,-1472.59]];
  for(let i=1;i<waveWalk.length;i++){strip(waveWalk[i-1],waveWalk[i],2.5,.065,i<3?{tex:'jamwon_wet_path',gloss:.3}:'jamwon_mud');paths.push([waveWalk[i-1],waveWalk[i],5.5]);}
  const dirtSpur=[[243,-1453],[236,-1453],[227,-1456],[219,-1453]];
  for(let i=1;i<dirtSpur.length;i++){strip(dirtSpur[i-1],dirtSpur[i],1.6,.07,'jamwon_mud');paths.push([dirtSpur[i-1],dirtSpur[i],3.5]);}
  // Keep trunks outside the whole adjoining walking/cycle width, including bends.
  // Invoked by lazy detail only, after bikeLink below has been initialized.
  function vergePoint(x,z){
    for(let pass=0;pass<5;pass++)for(const[route,w]of[[waveWalk,2.5],[bikeLink,3],[dirtSpur,1.6]])for(let i=1;i<route.length;i++){
      const a=route[i-1],b=route[i],dx=b[0]-a[0],dz=b[1]-a[1],l2=dx*dx+dz*dz,t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/l2)),qx=a[0]+t*dx,qz=a[1]+t*dz,L=Math.hypot(x-qx,z-qz),clear=w/2+.78;
      if(L<clear){const nx=L>.001?(x-qx)/L:-dz/Math.sqrt(l2),nz=L>.001?(z-qz)/L:dx/Math.sqrt(l2);x=qx+nx*clear;z=qz+nz*clear;}
    }
    return[x,z];
  }
  K.detail({name:'신잠원 출구와 서울웨이브 산책길',floor:'1F',rect:[190,-1480,290,-1330],y0:0,y1:7},()=>{
    const a=[259.74,-1376.82],b=[251.9,-1384.26],L=Math.hypot(b[0]-a[0],b[1]-a[1]),nx=-(b[1]-a[1])/L,nz=(b[0]-a[0])/L;
    for(let i=0;i<6;i++){const p=mix(a,b,(3+i*.8)/L);paint([p[0]-nx*1.78,p[1]-nz*1.78],[p[0]+nx*1.78,p[1]+nz*1.78],.46,.09);}
    sign(['한강공원','서울웨이브아트센터 →'],256.8,2,-1389,2.3,.75,.8,'#386b8a');
    cone(256.1,-1382.5,.065);lamp(265,-1378);lamp(278,-1353);
    for(const r of road(408858834))for(let i=1;i<r.pts.length;i++){
      const a=r.pts[i-1],b=r.pts[i],L=Math.hypot(b[0]-a[0],b[1]-a[1]),nx=-(b[1]-a[1])/L,nz=(b[0]-a[0])/L;
      for(let s=3;s<L;s+=5.5)for(const side of[-1,1]){const p=mix(a,b,s/L),off=side<0?-5.1:5.9,[x,z]=vergePoint(p[0]+nx*off,p[1]+nz*off);
        shadeTree(x,z,7.5+(i%2));K.dome({x,y:.1,z,rx:1.6,ry:1.05,rz:1.4,mat:0x687b4d,seg:8,rings:4});}
    }
    // Autumn canopy flanks the walking path; trunks leave its full 2.5 m clear.
    for(let i=0;i<12;i++){const z=-1396-i*5.8,j=waveWalk.findIndex((p,k)=>k>0&&p[1]<=z),a=waveWalk[j-1],b=waveWalk[j],x=a[0]+(b[0]-a[0])*(z-a[1])/(b[1]-a[1]);
      for(const side of[-1,1]){const[xx,zz]=vergePoint(x+side*3.5,z),h=8+(i%3)*.45;K.cyl({x:xx,y:0,z:zz,r:.18,h:h*.75,mat:{tex:'wood',color:0x8d8b7e},seg:8});
        for(let k=0;k<3;k++)K.dome({x:xx+Math.sin(i+k)*.7,y:h*.65+k*.5,z:zz+Math.cos(i+k)*.7,rx:1.65,ry:2.4,rz:2,mat:side>0?[0x947b47,0xb58c4c,0x8c8c4d][i%3]:0x6d8051,seg:10,rings:6,hemi:false});}
    }
    for(const[x,z]of[[253,-1405],[252,-1429],[248,-1451]]){K.tree(x,z,{h:8.7,kind:'ginkgo'});bench(x+3,z,Math.PI/2);}
    shadeTree(222.5,-1452,10.5);
    // HF_285's riverside leaves and temporary striped tape; extent is inferred.
    for(let i=0;i<45;i++){
      const x=196+(i*13%23)*.55,z=-1442-(i*7%17)*.55,y=.12+(i%5)*.1;
      K.dome({x,y,z,rx:.6,ry:.12,rz:.53,mat:[0x46793d,0x608f48,0x739c4c][i%3],seg:6,rings:2,hemi:false});
    }
    for(let i=0;i<18;i++){const x=196+i*.6,z=-1447-i*.43;beam([x,.84,z],[x+.6,.84,z-.43],.025,i%2?0xece3cd:0xdd8b49);}
    for(let i=0;i<240;i++){
      const x=195+(i*17%107)*.12,z=-1441-(i*19%79)*.12,y=.32+(i%7)*.065,a=i*2.4;
      beam([x,.08,z],[x+.16,y,z+.1],.009,0x6c874d);
      const tip=[x+Math.cos(a)*.4,y-.03,z+Math.sin(a)*.4],left=[x+Math.cos(a+1.7)*.3,y-.08,z+Math.sin(a+1.7)*.3],right=[x+Math.cos(a-1.7)*.3,y-.08,z+Math.sin(a-1.7)*.3];
      K.quad([0x518444,0x6c984b,0x83a453][i%3],[[x,y,z],left,tip,right],[0,1,0]);beam([x,y+.01,z],tip,.007,0xa8b877);
    }
    // Rainy walking clip is quiet; populate small pairs, not a festival crowd.
    for(const[x,z,a]of[[250,-1419,0],[250.6,-1420,3.1],[244,-1440,.2],[272,-1359,3.5],[273,-1360,3.2]])K.person(x,.065,z,{rotY:a,shirt:0x7f8b7c,pants:0x3e4745});
  });
  // Complete ways above preserve the three western paths across the Banpo edge.
  strip([226.35,-1384.83],[238.65,-1389.18],3,.065,{tex:'asphalt',color:C.red});strip([222.75,-1391.13],[238.65,-1389.18],2,.065,{tex:'asphalt',color:C.red});
  const promenade=[[289.49,-1501.82],[321,-1568],[350,-1593],[379,-1621],[411,-1658],[447,-1698],[598,-1872],[687,-1967],[791,-2085]];
  function parkWay(pts){for(let i=1;i<pts.length;i++){
    const a=pts[i-1],b=pts[i],poplar=a[0]>=289&&b[0]<=447&&a[1]<=-1500&&b[1]>=-1699;
    // The shaded poplar stretch is grey asphalt with white paint, unlike the
    // separate brick-red/green lanes below Hannam bridge farther upstream.
    strip(a,b,3,.065,poplar?0x989a96:{tex:'asphalt',color:C.red});
    slab(band(a,b,2.4,3),.06,poplar?0xa5aaa0:{tex:'asphalt',color:C.green});paths.push([a,b,10]);
    const L=Math.hypot(b[0]-a[0],b[1]-a[1]);
    for(let s=2;s<L-2;s+=poplar?5:7)paint(mix(a,b,s/L),mix(a,b,Math.min(L,s+2)/L),.1,.08,poplar?0xf3f2e5:C.yellow);
    if(poplar){const e=band(a,b,2.85);paint(e[0],e[3],.07,.08);paint(e[1],e[2],.07,.08);}
  }}
  parkWay(promenade);
  // This inferred connector used to cut diagonally through waveWalk at the
  // same height, producing the brown wedge in HF_185. Follow its west side.
  const bikeLink=[[238.65,-1389.18],[241.2,-1404],[240,-1430],[236,-1453],[238.4,-1472.59],[262,-1486],[289.49,-1501.82]];
  for(let i=1;i<bikeLink.length;i++){strip(bikeLink[i-1],bikeLink[i],3,.05,'jamwon_wet_path');paths.push([bikeLink[i-1],bikeLink[i],4]);}
  for(const id of[949348575,949348576])for(const r of road(id)){strip(r.pts[0],r.pts[1],3.2,.12,id===949348576?{tex:'wood',color:0xa6aba4}:'wood');const p=band(r.pts[0],r.pts[1],3.2);rail(p[0],p[3],.12);rail(p[1],p[2],.12);
    if(id===949348576)for(const[a,b]of[[p[0],p[3]],[p[1],p[2]]]){
      for(const h of[.28,.8,1.27])beam([a[0],h,a[1]],[b[0],h,b[1]],.035,0xe5e8e1);
      beam([a[0],.95,a[1]],[b[0],.95,b[1]],.012,{tex:'emit',color:0xf7d6a0});
      for(const t of[.2,.75]){const q=mix(a,b,t),dx=(b[0]-a[0])/Math.hypot(b[0]-a[0],b[1]-a[1]),dz=(b[1]-a[1])/Math.hypot(b[0]-a[0],b[1]-a[1]);for(let j=0;j<20;j++){const u=j*Math.PI/10,v=(j+1)*Math.PI/10;beam([q[0]+dx*.3*Math.cos(u),.77+.3*Math.sin(u),q[1]+dz*.3*Math.cos(u)],[q[0]+dx*.3*Math.cos(v),.77+.3*Math.sin(v),q[1]+dz*.3*Math.cos(v)],.065,j%5?0xdf713c:0xf1e9d5);}}
    }
  }
  // OSM promenade node to OSM Wave shore bridge: pave the 5.6m joining apron.
  strip([238.4,-1472.59],[234.12,-1476.21],4.4,.065,'sidewalk',.12);
  paths.push([[238.4,-1472.59],[234.12,-1476.21],5]);
  const fitness=area(1532626249).poly;slab(fitness,.03,{tex:'sidewalk',color:0xc9c0a7});zone('잠원 체력단련장',fitness,0);
  K.detail({name:'체력단련장',floor:'1F',poly:fitness,y0:0,y1:4},()=>{for(let i=0;i<5;i++){const x=270+i*2.2,z=-1381+i*1.5;for(const dx of[-.65,.65])K.cyl({x:x+dx,z,y:.03,r:.06,h:2.2,mat:C.dark,seg:6});beam([x-.65,2.2,z],[x+.65,2.2,z],.055,0xebb64b);bench(x,z+3);}});
  for(const[a,b]of[[[10,-1330],[29,-1352]],[[157,-1403],[187,-1434]],[[337,-1602],[414,-1684]]])rail(a,b,.035);
  // Photo10's railing meets paving at the real OSM water edge, not a lawn gap.
  const riverA=[51,-1382],riverB=[111,-1387];
  slab(band(riverA,riverB,4,2.1),.065,{tex:'concrete',color:0xb6b3a5});
  K.wall(...riverA,...riverB,.065,1.18,{mat:0x293938,thick:.055,openings:[{at:30,w:61,y0:.18,y1:1.09}]});
  for(let i=0;i<=25;i++){const p=mix(riverA,riverB,i/25);beam([p[0],.065,p[1]],[p[0],1.24,p[1]],.028,0x293938);}
  for(const y of[.23,.64,1.18])beam([riverA[0],y,riverA[1]],[riverB[0],y,riverB[1]],.025,0x293938);
  K.detail({name:'잠원 수변 산책 쉼터',floor:'1F',rect:[50,-1390,112,-1373],y0:0,y1:4},()=>{
    for(let i=0;i<7;i++){const p=mix(riverA,riverB,.16+i*.095);K.person(p[0],.065,p[1]+.9+(i%2)*1.3,{rotY:i%2?Math.PI:0,shirt:[0xb5d1d4,0xf0d0a2,0xcf713d,0xd5cec2][i%4],pants:0x344345});}
    bicycle(74,-1382,.7,.065);bicycle(88,-1383,-.4,.065,0x626b70);
    for(const x of[96,98.1]){box(x,.065,-1384,.44,.8,.44,0xe9bf3d);box(x,.52,-1384,.45,.16,.45,0x414b43);}
  });
  K.texture('jamwon_dry_lawn',256,256,(g,w,h)=>{g.fillStyle='#919361';g.fillRect(0,0,w,h);const r=K.rand(902);for(let i=0;i<7000;i++){g.fillStyle=['#71824e','#87915c','#b0ab79','#bcb086','#778250'][i%5];g.fillRect(r()*w,r()*h,1+r()*3,1+r()*2);}},[5,5]);
  function shadeTree(x,z,h=9){
    K.cyl({x,z,y:0,r:.28,h:h*.69,mat:{tex:'wood',color:0x989382},seg:9});
    for(let i=0;i<6;i++){const a=i*Math.PI/3,dx=Math.cos(a)*2.5,dz=Math.sin(a)*2.5;beam([x,h*.38,z],[x+dx,h*.73,z+dz],.12,0x646b53);K.dome({x:x+dx*.7,z:z+dz*.7,y:h*.61,rx:2.8,ry:2.25,rz:2.65,seg:9,rings:5,mat:[0x526e3c,0x637d48,0x6d8348][i%3],hemi:false});}
  }
  reserved.push(rect(14,-1244,70,-1182));
  K.hpoly('jamwon_dry_lawn',rect(14,-1244,70,-1182),.018);
  strip([16,-1185],[16,-1245],2.5,.04,{tex:'concrete',color:0xadae9f});
  K.detail({name:'잠원 잔디와 피크닉 쉼터',floor:'1F',rect:[5,-1350,90,-1165],y0:0,y1:10},()=>{
    const tents=[[27,-1200],[39,-1208],[28,-1220],[40,-1308],[57,-1311],[63,-1298],[38,-1199],[46,-1215],[20,-1212],[55,-1204],[34,-1231],[58,-1224],[20,-1236],[43,-1235]];
    for(let i=0;i<tents.length;i++){
      const[x,z]=tents[i],col=[0xe0b127,0x496959,0x363f42,0x469591][i%4];box(x,.025,z,3.5,.025,2.6,0xb3c5ae);
      K.dome({x,y:.05,z,rx:1.6,ry:1.35,rz:1.1,mat:col,seg:16,rings:7});
      K.dome({x,y:.06,z:z+1.045,rx:.78,ry:1.13,rz:.025,mat:0x26302f,seg:12,rings:6});
      for(let k=0;k<14;k++){const a=k*Math.PI/14,b=(k+1)*Math.PI/14;beam([x+.8*Math.cos(a),.08+1.15*Math.sin(a),z+1.075],[x+.8*Math.cos(b),.08+1.15*Math.sin(b),z+1.075],.025,0xb7c4ad);}
      K.person(x+2,.05,z,{sit:true,shirt:[0xe8d3ac,0x778d9e,0xb57761][i%3]});if(i%3===0)K.person(x+2.5,.05,z-1,{sit:true,shirt:0xd6d5c9});
      box(x+2.7,.04,z,.4,.3,.3,0xc3a77f);box(x+1.9,.07,z+1.1,.22,.28,.18,0xbd4237);
    }
    for(const[x,z,h]of[[32,-1203,10],[22,-1225,10],[51,-1210,11],[61,-1234,9],[59,-1231,10]])shadeTree(x,z,h);
    // The close pole has two long blue banners, as in photo02.
    K.cyl({x:53,z:-1226,y:0,r:.15,h:6.1,mat:0x888f8b,seg:12});
    beam([51.95,4.05,-1226],[54.05,4.05,-1226],.035,C.steel);
    for(const x of[52.48,53.52])sign(['한강','달빛축제','잠원한강공원'],x,2.95,-1226,.72,2.1,0,'#284d78','#eee2af');
    bench(18,-1219,.05);bench(18,-1231,.05);bench(61,-1239,Math.PI);
    // Small stroller and kick scooters at the picnic blanket edge.
    box(41,.38,-1211,.55,.32,.7,0x777f80);K.dome({x:41,y:.75,z:-1211.12,rx:.36,ry:.38,rz:.4,mat:0x414e58,seg:8,rings:4});
    for(const dx of[-.3,.3])for(const dz of[-.3,.3])K.dome({x:41+dx,y:.15,z:-1211+dz,rx:.11,ry:.11,rz:.09,mat:0x303738,seg:8,rings:4,hemi:false});
    for(const x of[30,44]){box(x,.1,-1216,.2,.06,.68,0xb9aa8e);beam([x,.12,-1216.3],[x,.82,-1216.3],.025,C.steel);beam([x-.2,.82,-1216.3],[x+.2,.82,-1216.3],.025,C.dark);}
    sign('잠원한강공원',65,2.3,-1280,5,.8);
  });
  buildFacilities();
  // Grass is last so every sunken facility can register its exact cutout.
  ground(park,.012,'jamwon_lawn');
  for(let n=0,g=0;n<155&&g<5000;g++){const x=-45+rnd()*975,z=-1110-rnd()*990;if(!K.pointInPoly(x,z,park)||park.some((a,i)=>dist(x,z,a,park[(i+1)%park.length])<7)||paths.some(([a,b,w])=>dist(x,z,a,b)<w/2+6)||cutouts.some(p=>K.pointInPoly(x,z,p))||reserved.some(p=>K.pointInPoly(x,z,p))||K.pointInPoly(x,z,fitness))continue;K.tree(x,z,{h:5+rnd()*5,kind:n%5===0?'ginkgo':'zelkova'});n++;if(n%10===0){bench(x+2,z+2);lamp(x+4,z+3,true);}}
  function buildFacilities(){
    // One vessel: Seoul Wave's 2020 exterior, Marebo's 2025 2F/3F fit-out.
    // The OSM gangway is surveyed geometry; hull, floor plan and heights are inferred.
    seoulWave();
    floatingHouse({name:'서울로얄마리나',tenant:'SEOUL ROYAL MARINA',x:257.93,z:-1572.23,w:25,d:23,levels:3,door:[265.45,-1563.27],style:'marina'});
    // Narrow cross-pontoon and finger berths replace the oversized solid deck.
    // Existing five berth positions are retained; each finger now has two boats.
    const pier=rect(215,-1621,274,-1617);slab(pier,.12,{tex:'wood',color:0xc2b39a,scale:[2,2]});
    strip([257.93,-1582.5],[251,-1619],3.2,.12,{tex:'wood',color:0xc2b39a});
    rail([215,-1617],[249.4,-1617],.12);rail([252.6,-1617],[274,-1617],.12);
    zone('잠원 마리나 계류장',pier,0,'1F','요트 계류 데크');
    for(let i=0;i<5;i++){
      const fx=220+i*10;slab(rect(fx-.85,-1641,fx+.85,-1618),.12,{tex:'wood',color:0xc2b39a,scale:[2,2]});
      for(const side of[-1,1]){
        const x=fx+side*3.2,z=-1628-(i%2)*2,boat=[[x-1.45,z+4.8],[x+1.45,z+4.8],[x+1.7,z-2.8],[x+.75,z-5.5],[x,z-6],[x-.75,z-5.5],[x-1.7,z-2.8]];
        K.prism(boat,-1.13,-.22,{mat:0xf6f4e9,side:i%2?0xd9e2e3:0xe7e9e2,solid:false});
        K.prism(boat,-.22,-.1,{mat:0x344650,solid:false});K.hpoly(C.white,boat,-.095);
        box(x,-.08,z+.7,2.65,.62,5.2,0xf5f5eb);box(x,.54,z+.1,2.36,.88,3.1,0x1f3c49);
        box(x,1.42,z+.2,2.65,.12,3.6,C.white);box(x,1.55,z+.85,1.95,.45,1.75,C.white);
        box(x,2.08,z+.55,2.3,.12,2.5,0xf8f5e8);
        // Slanted windscreen pillars, cabin portholes, flybridge and antennas.
        for(const side2 of[-1,1]){
          beam([x+side2*1.18,.54,z-1.45],[x+side2*.98,1.43,z-1.1],.045,C.white);
          for(let k=0;k<3;k++)box(x+side2*1.49,-.57,z-2.2+k*1.25,.035,.18,.48,0x22383f);
          for(let k=0;k<6;k++)beam([x+side2*(k<4?1.45:1.05),-.05,z+3.8-k*1.55],[x+side2*(k<4?1.45:1.05),.45,z+3.8-k*1.55],.018,C.steel);
          beam([x+side2*1.45,.45,z+3.8],[x+side2*1.45,.45,z-2.4],.018,C.steel);
          beam([x+side2*1.45,.45,z-2.4],[x,.45,z-5.75],.018,C.steel);
          K.dome({x:x+side2*1.65,y:-.6,z:z+1.5,rx:.13,ry:.4,rz:.13,mat:0xf0f0e6,seg:8,rings:4});
        }
        beam([x+.6,1.52,z+1.2],[x+.6,3.3,z+.9],.022,C.white);box(x,2.15,z+1,.8,.15,.3,C.white);
        // Mooring cleat and rope remain beside the finger, clear of its walkway.
        box(fx+side*.72,.13,z+2.2,.13,.12,.42,C.dark);beam([fx+side*.72,.24,z+2.2],[x-side*1.35,.08,z+3.3],.018,0x9c9275);
      }
      box(fx,-.5,-1619,1.6,.5,3.2,0x3e5558);
    }
    pool();
    // Photo17: tall poplars on the river side, spreading trees on the land side.
    // Clustered foliage, exposed trunks and low ropes keep the route legible.
    const popA=[321,-1568],popB=[447,-1698],popRoute=promenade.slice(1,6);
    const popP=(s,o)=>{for(let i=1;i<popRoute.length;i++){const a=popRoute[i-1],b=popRoute[i],L=Math.hypot(b[0]-a[0],b[1]-a[1]);if(s<=L||i===popRoute.length-1){const ux=(b[0]-a[0])/L,uz=(b[1]-a[1])/L;return[a[0]+ux*s-uz*o,a[1]+uz*s+ux*o];}s-=L;}};
    for(let i=0;i<30;i++){
      const p=popP(i*6,-4.6),h=12+(i%4)*.3;
      K.cyl({x:p[0],z:p[1],y:0,r:.24,h:h-4,seg:8,mat:{tex:'wood',color:0x777a68}});
      for(let j=0;j<5;j++){const yy=4.5+j*1.45,dx=Math.sin(i*2+j)*.25,dz=Math.cos(i+j*2)*.25;K.dome({x:p[0]+dx,z:p[1]+dz,y:yy,rx:1.05+(j===1?.2:0),ry:2.1-(j===4?.4:0),rz:1.15,seg:10,rings:6,hemi:false,mat:[0x6a884a,0x78974e,0x829c51][(i+j)%3]});}
      // The source also has landward trees, set back from the narrow poplar row.
      if(i%2===0){const q=popP(i*6,13.5);if(!reserved.some(r=>K.pointInPoly(q[0],q[1],r))){K.tree(q[0],q[1],{h:7+(i%3),kind:'zelkova'});for(const off of[-1.2,1.2])K.dome({x:q[0]+off,z:q[1],y:5.5,rx:1.6,ry:1.8,rz:1.9,mat:0x627a49,seg:8,rings:5,hemi:false});}}
      const r=popP(i*6,5.1);box(r[0],.02,r[1],.07,.72,.07,0xe1dec8);
      const q=popP((i+1)*6,5.1),m=popP(i*6+3,5.1);beam([r[0],.66,r[1]],[m[0],.44,m[1]],.017,0xd3d2bf);beam([m[0],.44,m[1]],[q[0],.66,q[1]],.017,0xd3d2bf);
      const riverPost=popP(i*6,-3.05),riverNext=popP((i+1)*6,-3.05);box(riverPost[0],.02,riverPost[1],.06,.54,.06,0xbcbba2);beam([riverPost[0],.48,riverPost[1]],[riverNext[0],.48,riverNext[1]],.012,0xe1dfcb);
      if(i>5){const q=popP(i*6,6.5);K.dome({x:q[0],z:q[1],y:.05,rx:2.3,ry:1.05,rz:2,mat:0x55783d,seg:7,rings:3});}
    }
    K.detail({name:'포플러 길 산책객',floor:'1F',poly:band(popA,popB,15),y0:0,y1:5},()=>{for(const[s,o,col]of[[29,.6,0xe5dfcb],[31,-.6,0x324437],[82,.5,0xedd6af],[120,-.7,0x8a9f9a]]){const p=popP(s,o);K.person(p[0],.065,p[1],{rotY:2.37,shirt:col,pants:0x374547});}});
    // Primary paper locates the older 잠원나들목 park portal at this pin.
    // The street-side alignment and ramps are inferred, connecting to 잠원로.
    const old=[[806,-1650,0],[770,-1675,0],[741,-1708,-4],[698,-1779,-4],[678.49,-1805.34,0]];
    strip(old[0],old[1],4,0,'sidewalk');paths.push([old[0],old[1],6]);
    for(let i=2;i<old.length;i++){const a=old[i-1],b=old[i],p=band(a,b,5.6);cutouts.push(p);K.groundHole(p);strip(a,b,5.2,a[2],'concrete',b[2]);paths.push([a,b,7]);if(i!==3){const q=band(a,b,5.5);for(const[u,v]of[[q[0],q[3]],[q[1],q[2]]])K.wall(...u,...v,-4.15,.8,{mat:{tex:'darkstone',color:0xb6afa0},thick:.3});}}
    tunnel(old[2],old[3],5.2,'잠원나들목');
    strip([678.49,-1805.34],[620,-1820],4,.065,'sidewalk');strip([620,-1820],[566,-1835],4,.065,'sidewalk');paths.push([[678.49,-1805.34],[566,-1835],6]);
    tunnel(old[1],old[2],5.2,'잠원나들목',true);tunnel(old[3],old[4],5.2,'잠원나들목',true);levee(old.slice(1),5.2,'잠원나들목');
    sign(['잠원나들목','한강공원'],670,1.9,-1800,2.6,.8,.6);
    K.detail({name:'잠원나들목 입구',floor:'1F',rect:[660,-1820,695,-1788],y0:0,y1:7},()=>{
      for(const[x,z]of[[670,-1804],[686,-1809],[669,-1812]])K.person(x,0,z,{shirt:0xb9b8a6,pants:0x35464a,rotY:.6});
      K.tree(660,-1796,{h:10,kind:'zelkova'});K.tree(689,-1791,{h:11,kind:'zelkova'});
    });
    K.floorText('배달존',{x:687,y:.04,z:-1810,w:3,h:1.7,fg:'#f6e8a3'});
    slab(rect(684,-1816,693,-1807),.035,{tex:'concrete',color:0xc5c1b2});
    zone('잠원나들목 배달존',rect(684,-1816,693,-1807),.035,'1F','배달음식 수령');
    // 2026 audit places this immediately outside the portal, off its through line.
    strip([683,-1806],[688,-1808],2.4,0,'sidewalk',.035);
    sign(['땡겨요 배달존','잠원나들목'],691,1.65,-1813,2.8,1.1,0,'#e4723d');
    K.detail({name:'잠원나들목 배달 수령',floor:'1F',rect:[684,-1816,693,-1807],y0:0,y1:4},()=>{
      for(let i=0;i<3;i++){const x=686+i*1.05;box(x,.035,-1815.2,.8,1.05,.75,[0x526b62,0x657987,0x898e7a][i]);box(x,.88,-1814.81,.45,.15,.025,0x263f3b);sign(['분리수거','종이 · 캔 · 병'][i?1:0],x,.62,-1814.8,.65,.2,0,'#e5e4d5','#31453c');}
    });
    spawn('잠원나들목 · 거리 입구',770,0,-1674,32);
    spawn('잠원나들목 · 공원 입구',677,0,-1808,212);
    // The local OSM has no geometry past the clipped northern edge. These bank
    // points are a conservative continuation, with facilities at source pins.
    const bank=[[775.9,-2100],[850,-2190],[965,-2318],[1080,-2425],[1200,-2480],[1330,-2610],[1450,-2670]],inland=[[935.67,-2100],[1030,-2180],[1110,-2280],[1230,-2390],[1300,-2440],[1410,-2540],[1500,-2600]],extension=[...bank,...inland.slice().reverse()];
    const sevenInlet=rect(1290,-2605,1394,-2573);
    for(const piece of subtract(extension,sevenInlet))slab(piece,0,{tex:'grass',color:0xb9caa0});
    K.phys.addGroundHole(sevenInlet);K.hpoly('water',sevenInlet,-1.4);K.phys.addSurface(sevenInlet,-2.1,{slow:.7,tag:'jamwon_hangang'});
    zone('잠원한강공원 · 한남대교',extension,0,'1F','수변 산책로 · 제4주차장',12);
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
    // Audit: photo13 is CU Apgujeong Cruise's roof, not this vessel's terrace.
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

  function seoulWave(){
    const name='서울웨이브아트센터',ys=[.12,4.92,10.12,15.12],inner=rect(154,-1549,192,-1518),stairHole=rect(156.2,-1545.4,159.4,-1522.6);
    const hull=[[153,-1553],[193,-1553],[196,-1550],[196,-1517],[193,-1514],[153,-1514],[150,-1517],[150,-1550]];
    const roofLight=rect(166,-1548,191,-1524),white=0xeeeede,bronze=0x9c7b42,black=0x242722;
    const marble={tex:'marble',color:0xf1f0e6,gloss:.7},gold={color:0xb5944c,gloss:.5};
    K.texture('wave_terrazzo',512,512,(g,w,h)=>{
      const r=K.rand(1310360);g.fillStyle='#615d54';g.fillRect(0,0,w,h);
      for(let i=0;i<16500;i++){const x=r()*w,z=r()*h,s=1.1+r()*3.2;g.fillStyle=['#d8d2bf','#eee9d8','#aaa493','#383b35'][i%4];g.beginPath();g.moveTo(x,z);g.lineTo(x+s,z+.5);g.lineTo(x+s*.4,z+s);g.closePath();g.fill();}
    },[1.25,1.25]);
    K.texture('wave_exposed_soffit',512,256,(g,w,h)=>{
      g.fillStyle='#d5d2c7';g.fillRect(0,0,w,h);
      for(let x=0;x<w;x+=64){g.fillStyle='#b9bcb6';g.fillRect(x,0,3,h);g.fillStyle='#e8e5da';g.fillRect(x+4,0,5,h);}
      g.strokeStyle='#bebfb7';g.lineWidth=2;g.beginPath();g.moveTo(0,128);g.lineTo(w,128);g.stroke();
    },[4,5]);
    const terrazzo={tex:'wave_terrazzo',gloss:.5};
    K.prism(hull,-1.75,-.45,{mat:0x334f52,solid:false});
    K.prism(hull,-.45,.12,{mat:0x969f98,top:false,solid:false});slab(hull,.12,{tex:'wood',color:0xc6c3ae},[inner]);
    reserved.push(rect(147,-1556,199,-1510));
    // Rubber fenders, tall guide piles and tether cleats make the waterborne base visible.
    for(const [x,z]of[[150,-1546],[150,-1520],[196,-1546],[196,-1522]]){
      K.cyl({x,y:-2,z,r:.28,h:4.5,mat:0x727d76,seg:12});K.cyl({x,y:2.5,z,r:.36,h:.2,mat:0xc3c6ba,seg:12});
      box(x+(x<173?.55:-.55),-.5,z,.5,1.1,1.4,0x343b38);
      beam([x,.8,z],[x+(x<173?1.8:-1.8),.4,z+.7],.045,0x9a9073);
    }
    for(let x=155;x<=191;x+=6){box(x,-.6,-1553.1,1.8,.8,.35,0x2c3431);box(x,.15,-1552,.7,.12,.16,C.steel);}
    // Real south entry remains open. Rails only enclose the other hull edges.
    for(let i=0;i<hull.length;i++){const a=hull[i],b=hull[(i+1)%hull.length];if(a[1]===-1514&&b[1]===-1514){rail([153,-1514],[181.8,-1514],.12);continue;}rail(a,b,.12);}
    // HF_500: a secured white tender on the outer deck, outside cafe circulation.
    K.detail({name:'서울웨이브 외부 갑판',floor:'1F',rect:[150,-1549,154,-1518],y0:0,y1:4},()=>{
      const tender=[[150.55,-1540.8],[151.75,-1540.8],[151.95,-1541.3],[151.94,-1543.2],[151.7,-1543.9],[151.15,-1544.4],[150.6,-1543.9],[150.36,-1543.2],[150.35,-1541.3]];
      K.prism(tender,.18,.65,{mat:0xe7e9df,solid:false});K.hpoly(0x65736f,[[150.65,-1541.2],[151.65,-1541.2],[151.65,-1543.2],[151.15,-1543.9],[150.65,-1543.2]],.655);
      for(const z of[-1541.8,-1542.9])box(151.15,.65,z,1.1,.08,.22,0xdde0d6);
      for(const z of[-1541,-1543.6]){beam([150.2,.25,z],[152,.72,z],.02,0x7f8981);for(let k=0;k<7;k++)beam([150,.8-k*.055,z],[150.12,.77-k*.055,z+.025],.012,0x454f4b);}
      for(const z of[-1540.8,-1544.4]){beam([150.15,.25,z],[150.15,1.05,z],.035,0xdce2da);beam([150.15,1.05,z],[151.65,1.05,z],.035,0xdce2da);}
    });
    strip([188.22,-1515.03],[184,-1518],4.2,.12,'wood');
    for(let f=0;f<3;f++){
      const y=ys[f],top=ys[f+1],h=top-y;
      K.slab(inner,y,{mat:f===0?{tex:'concrete',color:0xd6d0c4,gloss:.5}:f===1?{tex:'darkstone',color:0x4b4b43,gloss:.5}:marble,under:f===1?'wave_exposed_soffit':'ceiling',holes:f?[stairHole]:[],thick:.18});
      K.polyWalls(inner,y,top,{mat:{tex:'glass',color:0xd8e5db},thick:.08,openings:f?[]:[{x:184,z:-1518,w:4,y0:y,y1:y+3.3}]});
      // Closely spaced fins and varying opaque spandrels, not a generic glass box.
      for(let edge=0;edge<4;edge++){
        const a=inner[edge],b=inner[(edge+1)%4],L=Math.hypot(b[0]-a[0],b[1]-a[1]),n=Math.ceil(L/.82),nx=(b[1]-a[1])/L,nz=-(b[0]-a[0])/L;
        const P=(t,yy)=>[a[0]+(b[0]-a[0])*t+nx*.18,yy,a[1]+(b[1]-a[1])*t+nz*.18];
        for(let i=0;i<n;i++){
          const t=i/n,u=(i+1)/n,p=P(t,y),q=P(u,y),middle=(p[0]+q[0])/2,door=f===0&&edge===2&&middle>181.8&&middle<186.2;
          const wave=t=>Math.sin(t*Math.PI*2+(edge%2)*.7+f*.75),lo=t=>y+.32+(f===0?.65:.25)*(wave(t)+1),hi=t=>top-.65-(wave(t)+1)*.65;
          if(!door)K.quad(white,[P(t,y),P(u,y),P(u,lo(u)),P(t,lo(t))],[nx,0,nz]);
          K.quad(white,[P(t,Math.max(hi(t),door?y+3.35:y)),P(u,Math.max(hi(u),door?y+3.35:y)),P(u,top),P(t,top)],[nx,0,nz]);
          if(!door){
            if(f===0&&(edge===1||edge===3)){beam(P(t,y+.12),P(t,3.4),.027,0x303936);beam(P(t,3.4),P(t,top),.048,white);}
            else beam(P(t,y+.12),P(t,top),.048,white);
          }
          beam(P(t,hi(t)),P(u,hi(u)),.035,0xd6d9d0);
        }
        beam(P(0,top-.04),P(1,top-.04),.07,white);
      }
      // West stair/service aisle leaves a clear landing at BOTH ends of each flight.
      if(f===0){
        // HF_360 shows an open upper gallery inside the cafe volume. Its height
        // and return to the existing stair core are reconstructed, not a 2F cafe.
        K.stairs(157.8,-1523,157.8,-1533.4,{w:2.6,ya:y,yb:2.65,mat:'concrete',rails:true});
        K.slab(rect(156.2,-1535.8,166.3,-1533.4),2.65,{mat:'tile',thick:.16});
        K.stairs(157.8,-1535.8,157.8,-1545,{w:2.6,ya:2.65,yb:top,mat:'concrete',rails:true});
      }else K.stairs(157.8,-1523,157.8,-1545,{w:2.6,ya:y,yb:top,mat:{tex:'concrete',color:0xc7c8bb},rails:true});
      K.slab(rect(156.2,-1523,160,-1520),y,{mat:marble,thick:.16});
      K.slab(rect(156.2,-1547,161,-1545),top,{mat:marble,thick:.16});
      K.wall(161,-1546,161,-1525,y,top-.2,{mat:0xd6d6cb,thick:.12,openings:f?[]:[{at:11.4,w:2.4,y0:2.65,y1:4.72}]});
      K.wall(166,-1523,191,-1523,y,top-.2,{mat:f===0?'glass':f===1?0x393b32:0xe7e5da,thick:.12,openings:[{at:12,w:4.4,y0:y,y1:y+3.2},{at:1.8,w:2,y0:y,y1:y+2.6}]});
      const floor=(f+1)+'F',sub=f===0?'스타벅스 · 전시공간':f===1?'마레보 인 웨이브 · 벨라홀':'마레보 인 웨이브 · 루체홀';
      K.zone({name,floor,sub,poly:inner,y0:y,y1:top,priority:5});
      K.zone({name:f===0?'스타벅스 서울웨이브아트센터점':'마레보 인 웨이브',floor,sub:f===0?'카페 · 강변 좌석':f===1?'벨라홀':'루체홀',rect:[166,-1548,191,-1523],y0:y,y1:top,priority:6});
      if(f===0)K.zone({name:'서울웨이브아트센터',floor:'1F',sub:'전시공간',rect:[161.2,-1548,169.2,-1535],y0:y,y1:top,priority:7});
      if(f)sign(f===1?'마레보 인 웨이브 · 벨라홀':'마레보 인 웨이브 · 루체홀',179,y+2.8,-1522.91,9,.55,0,f===1?'#292c26':'#ede9dc',f===1?'#e2cc9b':'#554b35');
      sign('계단 · 승강기',162.5,y+2.1,-1521.5,2.4,.45,0,'#e4e3d6','#4b5346');
    }
    K.slab(inner,ys[3],{mat:{tex:'wood',color:0xbaa58a},holes:[stairHole,roofLight],thick:.18});
    // The exhibition partition belongs beneath the west gallery. Its previous
    // full-height position inside the cafe concealed the observed left mezzanine.
    K.wall(166.15,-1548,166.15,-1534,ys[0],2.49,{mat:0xe1ddcf,thick:.16,openings:[{at:10,w:2,y0:ys[0],y1:2.49}]});
    const gallery=[[161.2,-1548],[191,-1548],[191,-1542],[166,-1542],[166,-1519.35],[161.2,-1519.35]];
    K.slab(gallery,2.65,{mat:terrazzo,under:0xe5e7e2,thick:.16});
    rail([166,-1542],[191,-1542],2.65);rail([166,-1542],[166,-1535.8],2.65);
    rail([166,-1533.4],[166,-1523],2.65);
    K.zone({name:'스타벅스 서울웨이브아트센터점',floor:'1M',sub:'카페 중층 좌석',poly:gallery,y0:2.65,y1:4.74,priority:10});
    for(let i=0;i<inner.length;i++)rail(inner[i],inner[(i+1)%4],ys[3]);
    // The terrace is around, rather than across, Luce's shallow glazed roof.
    for(let i=0;i<roofLight.length;i++)rail(roofLight[i],roofLight[(i+1)%4],ys[3]);
    for(let iz=0;iz<6;iz++)for(const side of[-1,1]){
      const z0=-1548+iz*4,z1=z0+4,x0=178.5,x1=178.5+side*12.4;
      K.quad({tex:'glass',color:0xb9cfc8},[[x0,ys[3]-.24,z0],[x1,ys[3]-.96,z0],[x1,ys[3]-.96,z1],[x0,ys[3]-.24,z1]],[0,1,0]);
      beam([x0,ys[3]-.22,z0],[x1,ys[3]-.94,z0],.07,bronze);
    }
    const waveFloors=ys.map((y,i)=>({label:i<3?(i+1)+'F':'옥상',y,name:['스타벅스 · 전시공간','마레보 인 웨이브 · 벨라홀','마레보 인 웨이브 · 루체홀','옥상 테라스'][i]}));
    waveFloors.splice(1,0,{label:'1M',y:2.65,name:'스타벅스 중층 좌석'});
    K.elevator({name:'서울웨이브아트센터 승강기',x:164,z:-1520.7,w:2.2,d:2.2,rotY:Math.PI,floors:waveFloors});
    K.zone({name,floor:'옥상',sub:'한강 전망 테라스',poly:inner,y0:ys[3],y1:ys[3]+4,priority:5});
    sign('MAREVO IN WAVE',174,13.98,-1517.7,14,1,0,null,'#246572');
    sign('서울웨이브아트센터',174,13.35,-1517.68,5,.35,0,null,'#246572');
    sign('STARBUCKS',178,3.92,-1517.65,8,.72,0,'#eeeede','#205e48');
    // Text-only round brand marker at the observed middle white spandrel.
    for(let i=0;i<32;i++){const a=i*Math.PI/16,b=(i+1)*Math.PI/16;K.quad(0x26634c,[[172,7.05,-1517.65],[172+Math.cos(a)*.58,7.05+Math.sin(a)*.58,-1517.65],[172+Math.cos(b)*.58,7.05+Math.sin(b)*.58,-1517.65],[172,7.05,-1517.65]],[0,0,1]);}
    sign('스타벅스',172,7.05,-1517.62,.9,.22,0,null,'#f0eee1');
    sign(['서울웨이브아트센터','스타벅스 · 마레보 인 웨이브'],235,1.8,-1473.5,4.8,.85,.7);
    // 2025 entrance frame: pale slatted timber fascia, dark shop glazing, then
    // speckled cafe paving beyond the light tiled public vestibule.
    K.hpoly(terrazzo,rect(166.3,-1548.8,191.8,-1523.1),.126);
    box(178.5,3.43,-1522.91,25,1.22,.13,{tex:'wood',color:0xc9a781});
    for(let x=166.2;x<191;x+=.22)box(x,3.43,-1522.82,.035,1.22,.035,0xb59978);
    sign('STARBUCKS',178,4.04,-1522.75,8,.67,0,null,'#f6f4e9');
    for(const x of[166,169.1,172,175.7,180.3,184,188,191])box(x,.12,-1523,.07,3.3,.10,0x252c2b);
    box(178.5,3.33,-1523,25,.09,.1,0x252c2b);
    for(let z=-1541;z<=-1525;z+=1.5){box(191.93,.12,z,.1,4.48,.065,0x2c3331);box(191.85,1.1,z+.045,.06,.24,.03,0x313b37);}
    for(const y of[.2,3.9,4.57])box(191.93,y,-1533,.1,.09,17,0x2c3331);
    // White walls, arched display recesses and varied window tables follow wave_04.
    K.detail({name:'서울웨이브 1F 스타벅스와 전시',floor:'1F',poly:inner,y0:ys[0],y1:ys[1]},()=>{
      const y=ys[0];
      // The round merchandise island stays east of the through aisle x=178.
      K.cyl({x:182,y,z:-1528.2,r:1.35,h:.78,mat:{tex:'wood',color:0xa17d54},seg:24});
      K.cyl({x:182,y:y+.035,z:-1528.2,r:1.38,h:.06,mat:{tex:'emit',color:0xffe7b2},seg:24});
      K.cyl({x:182,y:y+.78,z:-1528.2,r:1.4,h:.06,mat:0xd3b693,seg:24});
      for(let i=0;i<16;i++){const a=i*Math.PI/8,xx=182+Math.cos(a)*.9,zz=-1528.2+Math.sin(a)*.9;box(xx,y+.84,zz,.28,.2+(i%3)*.16,.23,[0xc4bfaf,0xa8b9ba,0xddd1b5,0x605e6a][i%4]);}
      // Tiered seasonal boxes and taller tumbler shelves behind the round table.
      for(let row=0;row<3;row++)for(let col=0;col<6;col++)box(181.15+col*.33,y+.86+row*.22,-1528.8-row*.1,.29,.19,.34,[0xb5a1bb,0xd9b9cb,0xe7c962,0xdfd5bc][(row+col)%4]);
      for(const x of[184.3,185.5]){box(x,y,-1529.6,1.04,1.7,.5,0x3d4039);for(let row=0;row<4;row++){box(x,y+.27+row*.38,-1529.28,1,.045,.5,'wood');for(let col=0;col<4;col++)K.cyl({x:x-.36+col*.24,y:y+.3+row*.38,z:-1529.25,r:.075,h:.24+(col%2)*.06,mat:[0xd7ccad,0xa1b2ad,0xd9c4d4][col%3],seg:8});}}
      for(const x of[171,179,187]){box(x,4.49,-1533,.14,.14,18,0xe1e5e0);for(const z of[-1539,-1533,-1527]){box(x,4.46,z,.22,.055,.22,0x636d68);box(x,4.44,z,.14,.025,.14,'emit');}}
      for(const z of[-1540,-1534,-1527]){box(178,4.38,z,25,.28,.18,0xb9c9c7);beam([166,4.28,z+.3],[191,4.28,z+.3],.055,0xd4dcd6);}
      for(const x of[170.2,173.8,181.3,187.5]){beam([x,4.48,-1541],[x,4.48,-1524],.07,0xb6c3bd);for(const z of[-1537,-1530]){beam([x,4.45,z],[x,4.12,z],.016,0x525c56);K.cyl({x,y:4.02,z,r:.11,h:.14,mat:0x7f8172,seg:10});box(x,4.005,z,.16,.025,.16,{tex:'emit',color:0xffdda3});}}
      for(const x of[173,180]){box(x,y,-1541.05,3.6,.45,.65,{tex:'wood',color:0x9b7954});box(x,y+.45,-1541.3,3.6,.65,.12,0x846b50);}
      for(let i=0;i<3;i++){box(161.4,y+.7,-1545+i*3.2,.12,1.8,2.1,0xd5d0bf);box(161.48,y+.8,-1545+i*3.2,.06,1.6,1.8,[0x879f9d,0xc6ac8e,0x8f927c][i]);}
      sign('전시공간',164,y+2.65,-1535.3,3,.5,0,'#eeede3','#4c6259');
      box(187,y,-1544.5,6.7,1.05,1.3,{tex:'wood',color:0x9b7d59},true);box(187,y+1.05,-1544.5,6.8,.09,1.4,{color:0xd9d7c9,gloss:.5});
      for(let i=0;i<2;i++){box(185+i*2.1,y+1.14,-1544.5,1.2,.55,.65,0x313d39);for(const dx of[-.35,.35])K.cyl({x:185+i*2.1+dx,y:y+1.1,z:-1543.8,r:.09,h:.18,mat:C.white,seg:10});}
      sign('주문 · 픽업',187,y+2.4,-1545.3,4.2,.55,0,'#254d3e','#f3eedb');
      for(const [x,z]of[[173,-1544],[175,-1538],[183,-1538],[189,-1532],[172,-1530]]){table(x,y,z);chair(x-1,y,z,Math.PI/2,0xb8b399);chair(x+1,y,z,-Math.PI/2,0x34534a);}
      // River-facing timber bar and arched white wall frames.
      box(176,y+.98,-1548.2,9,.1,.5,'wood');for(let x=172;x<=180;x+=2)chair(x,y+.18,-1547.2,Math.PI,0xa98e61);
      for(const z of[-1537,-1531]){
        for(const dz of[-1.05,1.05])beam([191.65,y,z+dz],[191.65,y+2.5,z+dz],.065,C.white);
        for(let j=0;j<18;j++){const a=j*Math.PI/18,b=(j+1)*Math.PI/18;beam([191.65,y+2.5+Math.sin(a),z+Math.cos(a)],[191.65,y+2.5+Math.sin(b),z+Math.cos(b)],.065,C.white);}
      }
      for(const x of[169,177,185])for(const z of[-1543,-1535,-1527])box(x,4.61,z,1.3,.045,.3,{tex:'emit',color:0xffefd2});
      K.person(186,.12,-1545.8,{shirt:0x244c39,pants:0x353c33});K.person(174.1,.12,-1538,{sit:true,shirt:0xc2bca3,pants:0x4d5147});
      for(const[x,z,a,sit,col]of[[188.5,-1545.7,.2,false,0x315e46],[185.7,-1542.3,3.1,false,0xe0d2bd],[186.3,-1540.9,3,false,0x8c7464],[181,-1526.8,2,false,0xc1a5a2],[183.9,-1527.6,1.2,false,0x657b79],[174,-1544,1.5,true,0xd8cdb7],[182,-1538,4.7,true,0x717b8b],[188,-1532,1.5,true,0xafa585],[173,-1530,4.7,true,0xd3ba9f],[176,-1547.1,3.1,true,0x7e8e85],[178.2,-1547.1,3.1,true,0xafa0a4],[180,-1534.8,.7,false,0xada38e]]){
        K.person(x,y,z,{rotY:a,sit,shirt:col,pants:0x3e4443});if(!sit&&x<186)box(x+.24,y+.55,z,.19,.3,.1,0xc8b18b,false,a);
      }
      for(const x of[174.6,181.5]){
        box(x,.12,-1522.25,.33,.035,.4,0xe7bb2a);beam([x-.16,.16,-1522.45],[x-.16,.72,-1522.25],.028,0xe7bb2a);beam([x+.16,.16,-1522.45],[x+.16,.72,-1522.25],.028,0xe7bb2a);
        sign(['주의','미끄럼'],x,.45,-1522.2,.33,.35,0,'#edc43b','#34352d');
      }
      sign('←',175.8,1.35,-1522.93,.22,.19,0,'#307b58','#ffffff');
      for(const[x,z,a,col]of[[176.8,-1522,2.7,0xbca891],[179.3,-1524,1.1,0x6b7a73]])K.person(x,y,z,{rotY:a,shirt:col,pants:0x404843});
      box(171.5,.12,-1522,.55,1.3,.08,0xeee8dc);sign(['스타벅스','매장 안내'],171.5,1.15,-1521.94,.5,.45,0,'#eee8dc','#266447');
    });
    K.detail({name:'스타벅스 중층 좌석',floor:'1M',poly:gallery,y0:2.65,y1:4.74},()=>{
      for(const x of[172,178,184,189]){table(x,2.65,-1546.25);chair(x-.95,2.65,-1546.25,Math.PI/2,0x968166);chair(x+.95,2.65,-1546.25,-Math.PI/2,0x968166);}
      for(const[x,a,col]of[[171.05,1.57,0xb7a38c],[178.95,4.71,0xa8aaa1],[183.05,1.57,0x7b8c89],[189.95,4.71,0xd0b8a3]])K.person(x,2.65,-1546.25,{rotY:a,sit:true,shirt:col,pants:0x434a45});
    });
    function floral(x,y,z,tall=false){
      if(tall){box(x,y,z,.75,.8,.75,{color:0xe3e1d5,gloss:.5});for(const dx of[-.18,.18])beam([x+dx,y+.75,z],[x+dx*.8,y+2.3,z],.035,0x899379);}
      for(let j=0;j<(tall?15:8);j++){const a=j*2.4,rr=tall?.7:.48,yy=y+(tall?1.3:.22)+(j%5)*.18;K.dome({x:x+Math.cos(a)*rr*(.5+(j%3)*.23),y:yy,z:z+Math.sin(a)*rr,rx:tall?.38:.25,ry:.25,rz:.28,mat:j%6===0?0xd7a99d:j%3===0?0x71845b:0xf1eee0,seg:6,rings:3,hemi:false});}
    }
    function weddingChair(x,y,z,bella){
      box(x,y+.43,z,.58,.08,.56,0xeee9db);for(const dx of[-.23,.23])for(const dz of[-.2,.2])beam([x+dx,y,z+dz],[x+dx,y+.46,z+dz],.027,bronze);
      for(let j=0;j<12;j++){const a=j*Math.PI/6,b=(j+1)*Math.PI/6;beam([x+Math.cos(a)*.28,y+.85+Math.sin(a)*.34,z+.25],[x+Math.cos(b)*.28,y+.85+Math.sin(b)*.34,z+.25],.026,bronze);}
      if(bella)K.dome({x,y:y+.85,z:z+.25,rx:.255,ry:.31,rz:.045,mat:0xeae5d4,seg:10,rings:5,hemi:false});
      else for(const dx of[-.1,.1])beam([x,y+.58,z+.25],[x+dx,y+1.09,z+.25],.018,bronze);
    }
    function crystal(x,y,z,r=.8,drop=1){
      for(let j=0;j<12;j++){const a=j*Math.PI/6,b=(j+1)*Math.PI/6,xx=x+Math.cos(a)*r,zz=z+Math.sin(a)*r;beam([xx,y,zz],[x+Math.cos(b)*r,y,z+Math.sin(b)*r],.018,gold);beam([xx,y,zz],[xx,y-drop*(.5+(j%4)*.12),zz],.008,0xd8d8bd);for(let k=1;k<=3;k++)K.dome({x:xx,y:y-k*drop/4,z:zz,rx:.035,ry:.09,rz:.035,mat:{tex:'emit',color:0xfff3cf},seg:4,rings:2,hemi:false});}
    }
    for(let f=1;f<=2;f++)K.detail({name:f===1?'마레보 벨라홀':'마레보 루체홀',floor:(f+1)+'F',poly:inner,y0:ys[f],y1:ys[f+1]},()=>{
      const y=ys[f],top=ys[f+1],bella=f===1,aisle=rect(176.3,-1544,179.7,-1524);
      K.hpoly(bella?{tex:'carpet',color:0x38392e}:{tex:'carpet',color:0x33413f},rect(166.1,-1548,191.8,-1523.1),y+.012);
      K.slab(aisle,y+.18,{mat:marble,thick:.18,ceil:false});box(178,y,-1545.3,9,.18,2.2,marble);
      // Rounded aisle toe and narrow brass edging, as photographed in Bella.
      if(bella){K.cyl({x:178,y,z:-1524,r:1.7,h:.18,mat:marble,seg:32});for(let j=0;j<20;j++){const a=j*Math.PI/20,b=(j+1)*Math.PI/20;beam([178+Math.cos(a)*1.7,y+.14,-1524+Math.sin(a)*1.7],[178+Math.cos(b)*1.7,y+.14,-1524+Math.sin(b)*1.7],.025,bronze);}}
      for(let row=0;row<8;row++)for(const x of[168,169.6,171.2,172.8,183.2,184.8,186.4,188])weddingChair(x,y,-1526.5-row*2.1,bella);
      for(const x of[175.4,180.6])for(let j=0;j<10;j++)floral(x,y,-1525.5-j*1.9,j===0||j===5);
      for(const x of[174.1,181.9])floral(x,y,-1545.6,true);
      box(178,y+.18,-1545.5,1.15,.93,.65,{color:0xe7dfca,gloss:.5});floral(178,y+1.05,-1545.5);
      if(bella){
        K.hpoly(black,rect(166,-1548,191,-1523),top-.22,false);
        // Scalloped dark ceiling and a long cascading crystal spine.
        for(const x of[169,187])for(let j=0;j<32;j++){const a=j*Math.PI/16,b=(j+1)*Math.PI/16;beam([x+Math.cos(a)*3.1,top-.48,-1535.5+Math.sin(a)*12],[x+Math.cos(b)*3.1,top-.48,-1535.5+Math.sin(b)*12],.04,{tex:'emit',color:0xdfded8});}
        for(let j=0;j<9;j++){const zz=-1526-j*2;crystal(178,top-.4,zz,.85,1.15+(j%3)*.18);}
        K.wall(166.2,-1547.8,191,-1547.8,y,top-.3,{thick:.08,mat:0xe5e4dc,solid:false});
        for(let x=167;x<191;x+=1)beam([x,y+.25,-1547.65],[x,y+4.5,-1547.65],.012,0xc1c4b9);
      }else{
        // Bright shallow roof, bronze grid and hanging chandeliers from Luce photo.
        for(let iz=0;iz<6;iz++)for(const side of[-1,1]){
          const z0=-1548+iz*4,z1=z0+4,x0=178.5,x1=178.5+side*12.4;
          K.quad({tex:'emit',color:0xf2f0e3},[[x0,top-.28,z0],[x1,top-1,z0],[x1,top-1,z1],[x0,top-.28,z1]],[0,-1,0]);
          beam([x0,top-.32,z0],[x1,top-1.04,z0],.09,bronze);
          for(let j=1;j<5;j++){const xx=x0+(x1-x0)*j/5,hh=top-.32-.72*j/5;beam([xx,hh,z0],[xx,hh,z1],.055,bronze);}
        }
        beam([178.5,top-.32,-1548],[178.5,top-.32,-1524],.12,bronze);
        for(const x of[169,174,183,188])for(const z of[-1528,-1536,-1543])crystal(x,top-.95,z,.7,.65);
        for(const x of[166.3,191.6])for(let j=0;j<6;j++){const z=-1545.5+j*3.7;box(x,y+.3,z,.07,3.3,3.2,0x486040);for(const dz of[-1.6,1.6])beam([x,y+.2,z+dz],[x,y+3.7,z+dz],.04,bronze);beam([x,y+2,z-1.6],[x,y+2,z+1.6],.04,bronze);}
        for(const dx of[-1.5,1.5])beam([178+dx,y+.2,-1547.1],[178+dx,y+3.1,-1547.1],.065,bronze);
        beam([176.5,y+3.1,-1547.1],[178,y+4.2,-1547.1],.065,bronze);beam([178,y+4.2,-1547.1],[179.5,y+3.1,-1547.1],.065,bronze);
      }
      for(const x of[169,187])box(x,y+.7,-1520,2.4,.13,.7,{color:0xd2c6a9,gloss:.5});
      K.person(171,y,-1521.3,{shirt:bella?0xa8b8bb:0xd3b5a5,pants:0x37433d});
    });
    K.detail({name:'서울웨이브 옥상 전망 테라스',floor:'옥상',poly:inner,y0:ys[3],y1:ys[3]+4},()=>{
      for(const x of[171,178,186]){table(x,ys[3],-1520.6);chair(x-1,ys[3],-1520.6,Math.PI/2,0xc9c9ab);chair(x+1,ys[3],-1520.6,-Math.PI/2,0xc9c9ab);}
      for(const z of[-1530,-1538]){bench(163,z,Math.PI/2,ys[3]);box(163,ys[3],z-2,1,.55,1,0xc4c5ae,true);K.dome({x:163,y:ys[3]+.5,z:z-2,rx:.7,ry:.6,rz:.7,mat:0x718551,seg:8,rings:4});}
      sign('한강 전망 테라스',180,ys[3]+1.5,-1518.2,5,.55,0,'#e8e2cf','#4d6254');
    });
    spawn('서울웨이브 · 스타벅스',184,.12,-1520,0);
    spawn('스타벅스 · 중층 좌석',174,2.65,-1543,180);
    spawn('마레보 인 웨이브 · 벨라홀',178,4.92,-1521.4,0);
    spawn('마레보 인 웨이브 · 루체홀',178,10.12,-1521.4,0);
    spawn('서울웨이브 · 옥상 전망',165,15.12,-1526,0);
  }

  function floatingHouse(o){
    const {x,z,w,d,levels,style,name,tenant,door}=o,y0=.12,floorH=3.8;
    const hull=[[x-w/2,z+d/2],[x+w/2,z+d/2],[x+w/2+3,z],[x+w/2,z-d/2],[x-w/2,z-d/2],[x-w/2-3,z]];
    K.prism(hull,-1.1,y0,{mat:style==='wave'?0xe0e8e5:C.white,side:style==='seven'?0x252c2a:style==='marina'?0x28484b:0x7b8b88,solid:false});
    slab(hull,y0,'wood');reserved.push(rect(x-w/2-5,z-d/2-5,x+w/2+5,z+d/2+5));
    const inner=rect(x-w/2+2,z-d/2+2,x+w/2-2,z+d/2-3),roofY=y0+levels*floorH;
    // A long clear staircase is inside the envelope along the west wall.
    const sx=x-w/2+4,sz=z-d/2+4,ez=sz+10,stairsHole=rect(sx-1.5,sz+.15,sx+1.5,ez+.3);
    for(let f=0;f<levels;f++){
      const y=y0+f*floorH,holes=f?[stairsHole]:[];
      K.slab(inner,y,{mat:f?'wood':'tile',holes,thick:.18});
      K.polyWalls(inner,y,y+floorH,{mat:'glass',inner:'glass',thick:.18,openings:[{x:x+w/2-2,z:z+3,w:3,y0:y,y1:y+2.9},{x:x+4,z:z+d/2-3,w:4,y0:y,y1:y+2.9}]});
      // Repeated white vertical frames and upper ribbon windows.
      for(let u=-w/2+3;u<w/2-1;u+=4){box(x+u,y,z-d/2+2,.13,floorH,.18,C.white);if(f>0){box(x+u+1.2,y+.8,z+d/2-2.9,2.2,2,.05,'glass');box(x+u,y,z+d/2-3,.14,floorH,.19,C.white);}}
      for(const v of[-d/2+2,d/2-3])box(x,y+floorH-.25,z+v,w-4,.25,.24,style==='marina'?0x447f83:C.white);
      if(style==='seven'){
        // Narrow ivory frames and ribbed steel spandrels surround actual glazing.
        for(const v of[-d/2+1.92,d/2-2.92]){
          K.wall(x-w/2+2,z+v,x+w/2-2,z+v,y,y+.65,{thick:.15,mat:0xe4e0d3,solid:false,openings:v>0?[{at:w/2+2,w:4,y0:y,y1:y+.65}]:[]});box(x,y+3.13,z+v,w-4,.47,.15,0xe4e0d3);
          for(let u=-w/2+2;u<=w/2-2;u+=1.6){if(v>0&&Math.abs(u-4)<2.1)continue;box(x+u,y+.6,z+v,.105,2.6,.2,0xf5f1e4);box(x+u+.2,y+.04,z+v+.09,.055,.54,.08,0xc4c1b5);}
          for(const h of[.64,3.12])K.wall(x-w/2+2,z+v,x+w/2-2,z+v,y+h,y+h+.08,{thick:.24,mat:C.white,solid:false,openings:v>0&&h<1?[{at:w/2+2,w:4,y0:y+h,y1:y+h+.08}]:[]});
        }
        for(const u of[-w/2+1.92,w/2-1.92]){
          for(const v of[-d/2+2,d/2-3])box(x+u,y,z+v,.2,floorH,.2,C.white);
          for(let v=-d/2+2;v<d/2-3;v+=1.6){
            // Keep the east-side entry clear at every level.
            if(u>0&&Math.abs(v-3)<1.65)continue;
            box(x+u,y+.6,z+v,.2,2.6,.11,C.white);box(x+u,y,z+v,.16,.6,1.5,0xe4e0d3);
          }
        }
      }
      if(style==='marina'){
        for(const u of[-w/2+1.9,w/2-1.9])for(let v=-d/2+2;v<=d/2-3;v+=2.3)box(x+u,y,z+v,.19,3.65,.16,0x4d8585);
        for(const v of[-d/2+1.9,d/2-2.9])for(let u=-w/2+2;u<=w/2-2;u+=2.3)box(x+u,y,z+v,.16,3.65,.19,0x4d8585);
        for(const u of[-w/2+1.9,w/2-1.9])box(x+u,y+3.5,z-.5,.24,.28,d-5,0x30656c);
      }
      if(style!=='seven'||f<levels-1)K.stairs(sx,ez,sx,sz,{ya:y,yb:y+floorH,w:2.4,mat:'concrete',rails:true});
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
    K.slab(inner,roofY,{mat:style==='seven'?'roofgravel':'wood',holes:style==='seven'?[]:[stairsHole],thick:.2,walk:style!=='seven'});
    // Elevator is a reconstructed accessibility connection, explicitly documented.
    const elx=x+w/2-4.2,elz=z+1;
    K.elevator({name:name+' 승강기',x:elx,z:elz,w:2.1,d:2.1,rotY:-Math.PI/2,floors:Array.from({length:style==='seven'?levels:levels+1},(_,i)=>({label:(i+1)+'F',y:y0+i*floorH,name:i===levels?'옥상 테라스':i===0?'카페 · 매장':'강변 휴게공간'}))});
    if(style!=='seven'){
      for(let i=0;i<inner.length;i++)rail(inner[i],inner[(i+1)%inner.length],roofY);
      zone(name,inner,roofY,(levels+1)+'F','옥상 테라스 · 한강 전망',4);
      K.detail({name:name+' 옥상',floor:(levels+1)+'F',poly:inner,y0:roofY,y1:roofY+4},()=>{
        for(let u=x-w/2+10;u<x+w/2-6;u+=4)for(let v=z-d/2+5;v<z+d/2-4;v+=4){table(u,roofY,v);chair(u-.9,roofY,v,Math.PI/2);chair(u+.9,roofY,v,-Math.PI/2);}
        for(let u=x-w/2+9;u<x+w/2-4;u+=5){beam([u,roofY,z-d/2+3],[u,roofY+3,z-d/2+3],.04,C.white);beam([u,roofY+3,z-d/2+3],[u,roofY+3,z+d/2-4],.015,C.dark);for(let v=z-d/2+4;v<z+d/2-3;v+=2)K.dome({x:u,y:roofY+2.65,z:v,rx:.09,ry:.14,rz:.09,mat:{tex:'emit',color:0xffd993},seg:6,rings:3});}
      });
    }
    sign(tenant,x,y0+levels*floorH-.65,z+d/2-2.8,w*.7,1.1,0,style==='seven'?'#f8f7ed':'#234c52',style==='seven'?'#176843':'#ffffff');
    if(style==='seven'){
      const front=z+d/2-2.7;
      for(const[col,yy]of[[0xe15d39,2.8],[0xf4a547,2.65],[0x24834c,2.5]])box(x,y0+yy,front,w-4,.12,.08,col);
      // The dark vessel-like skirt rises above deck level, with an open doorway.
      K.wall(x-w/2+2,front,x+w/2-2,front,y0,y0+1.3,{thick:.18,mat:0x29302e,openings:[{at:w/2+2,w:4,y0:y0,y1:y0+1.3}]});
      K.wall(x+w/2-1.85,z-d/2+2,x+w/2-1.85,z+d/2-3,y0,y0+1.3,{thick:.18,mat:0x29302e,openings:[{at:d/2+1,w:3,y0:y0,y1:y0+1.3}]});
      for(let u=-w/2+2;u<w/2-2;u+=1.5){if(Math.abs(u-4)<2.2)continue;box(x+u,y0+.08,front+.11,.035,1.13,.025,0x4b4e43);}
      sign(['땅땅치킨','잠원1호'],x,roofY+1.15,front,w-5,1.15,0,'#24517e','#fff6dc');
      sign('7-ELEVEN',x+w/2-1.7,roofY+1.12,z-2.3,6.7,1.25,Math.PI/2,'#f6f2e5','#0a793b');
      for(const[col,h]of[[0xf26b35,.08],[0xf4a02f,.21],[0x258a52,.34]])box(x+w/2-1.65,roofY+h,z-2.3,.13,.1,6.7,col);
      sign(['땅땅치킨','치킨 · 커피 · 라면'],x,4.8,front+.12,w-5,.95,0,'#dd9b83','#fff6df');
      for(let u=-w/2+3;u<w/2-1;u+=3.2){beam([x+u,roofY+.9,front],[x+u,roofY+1.7,front+.65],.018,C.steel);box(x+u,roofY+1.65,front+.65,.25,.08,.18,C.white);}
      // Cylindrical sign and picnic parasols stay outside the entrance corridor.
      slab(rect(x-w/2-3,z+d/2,x+w/2+4,z+d/2+6),.03,{tex:'concrete',color:0xc5c5b9});
      const ax=x+w/2+1.8,az=z+d/2+1.3;K.cyl({x:ax,y:y0,z:az,r:.4,h:3.25,mat:0x315348,seg:16});
      K.dome({x:ax,y:y0+3.25,z:az,rx:.4,ry:.32,rz:.4,mat:C.white,seg:16,rings:5});
      sign(['담 배','도시락','커 피'],ax,y0+1.65,az+.405,.65,1.7,0,'#315348');sign('7-ELEVEN',ax,y0+2.95,az+.405,.7,.4,0,'#f4f1e7','#177641');
      K.detail({name:name+' 외부 피크닉 테이블',floor:'1F',rect:[x-w/2-3,z+d/2-2,x+w/2+4,z+d/2+7],y0:0,y1:4},()=>{
        for(let i=0;i<5;i++){
          const tx=x-w/2+2+i*3.4,tz=z+d/2+2;
          box(tx,.82,tz,2.5,.09,.8,'wood');for(const side of[-1,1]){box(tx,.47,tz+side*.8,2.55,.08,.28,'wood');for(const dx of[-.85,.85])beam([tx+dx,.05,tz+side*.9],[tx+dx,.82,tz+side*.3],.065,0x76644b);}
          K.cyl({x:tx,y:.1,z:tz,r:.035,h:2.8,mat:C.steel,seg:8});
          for(let j=0;j<12;j++){const t=j*Math.PI/6,u=(j+1)*Math.PI/6,A=[tx+1.65*Math.cos(t),2.45,tz+1.65*Math.sin(t)],B=[tx+1.65*Math.cos(u),2.45,tz+1.65*Math.sin(u)];K.quad(j%2?0x323846:0x404251,[[tx,2.95,tz],A,B,[tx,2.95,tz]],[0,1,0]);beam([tx,2.94,tz],A,.012,C.steel);}
          sign('7-ELEVEN',tx,2.5,tz+1.55,1.2,.2,0,'#353b4b');
        }
      });
      // White exterior steps add the photo's visible side access; existing
      // internal stairs and lift remain the accessible route between all floors.
      K.stairs(x+w/2+.8,z+d/2-1,x+w/2+.8,z-3,{ya:y0,yb:y0+floorH,w:1.45,mat:0xdedfd6,rails:true});
      slab(rect(x+w/2-2,z-4,x+w/2+1.6,z-2),y0+floorH,'concrete');
      slab(rect(x+w/2-2,z-4,x+w/2-.25,z+4.5),y0+floorH,'concrete');
      rail([x+w/2-.25,z-1.8],[x+w/2-.25,z+4.5],y0+floorH);
    }
    if(style==='marina'){
      // The original sign reads 3F MONARCH BISTRO, so all three levels stay.
      for(const yy of[.4,3.85,7.65]){box(x,yy,z+d/2-2.8,w-4,.25,.22,0x2d6167);box(x+w/2-1.85,yy,z-.5,.22,.25,d-5,0x2d6167);}
      sign('SEOUL ROYAL MARINA',x,roofY+.55,z+d/2-2.85,w-6,.85,0,'#34483d','#d9cc9c');
      sign('MONARCH BISTRO',x+w/2-1.7,8.25,z-2,8.5,.65,Math.PI/2,'#284a4c','#f3efdb');
      sign('MONARCH BISTRO',x,8.25,z+d/2-2.7,w-6,.65,0,'#284a4c','#f3efdb');
      sign('서울로얄마리나',x+w/2-1.7,2.15,z-2,7.5,.9,Math.PI/2,'#d5ded9','#315d69');
      for(const v of[-d/2+2,d/2-3])for(let u=-w/2+3;u<w/2-2;u+=1.4){beam([x+u,4,z+v+.4],[x+u,4.95,z+v+.4],.018,C.white);}
    }
    // Open deck entry joins the gangway without an enclosing rail at the end.
    strip(door,[x+4,z+d/2-2.8],3.6,.12,'wood');
    if(style==='wave')spawn('서울웨이브 · 선상 카페',x+4,.12,z+7,180);
  }

  function pool(){
    const x=422.79,z=-1576.40,P=frame(x,z,.74),poly=(a,b,c,d)=>[P(a,b),P(c,b),P(c,d),P(a,d)];
    K.texture('jamwon_pool_pavers',256,256,(g,w,h)=>{g.fillStyle='#91938c';g.fillRect(0,0,w,h);for(let row=0;row<8;row++)for(let col=-1;col<8;col++){const v=167+((row*13+col*7+40)%12);g.fillStyle=`rgb(${v},${v+1},${v-4})`;g.fillRect(col*36+(row%2)*18+1,row*32+1,34,30);}},[2,2]);
    K.texture('jamwon_pool_basin',256,128,(g,w,h)=>{g.fillStyle='#79bacb';g.fillRect(0,0,w,h);for(let i=0;i<180;i++){const xx=(i*73)%256,yy=82+(i*11)%44;g.fillStyle=i%3?'rgba(74,115,103,.23)':'rgba(221,225,199,.24)';g.fillRect(xx,yy,1+i%3,4+i%16);}g.fillStyle='#8cc4d0';g.fillRect(0,0,w,4);},[4,1.25]);
    const deck=poly(-43,-38,43,38),basin=poly(-25,-12.5,25,12.5),children=poly(-29,20,-7,31);reserved.push(deck);
    for(const p of[basin,children]){cutouts.push(p);K.groundHole(p);slab(p,-1.25,0x79bbcc);K.polyWalls(p,-1.25,.12,{mat:'jamwon_pool_basin',thick:.15});}
    K.slab(deck,.035,{mat:'jamwon_pool_pavers',holes:[basin,children],thick:.18,ceil:false});
    for(const p of[basin,children])for(let i=0;i<p.length;i++)paint(p[i],p[(i+1)%p.length],.8,.065,0xcba2c0);
    for(let i=-3;i<=3;i++){const a=P(-23,i*3),b=P(23,i*3);paint(a,b,.16,-1.23,0x27699b);for(const u of[-23,23]){const a=P(u,i*3-1),b=P(u,i*3+1);paint(a,b,.16,-1.23,0x27699b);}}
    const stairA=P(22,12.3),stairB=P(22,6.4);K.stairs(...stairA,...stairB,{ya:.035,yb:-1.25,w:2,rails:true,mat:0xb2d8dd});
    // 2026 official notice: closed for rebuilding, not a publicly open dry pool.
    // Keep the earlier basin/canopy detail behind the temporary perimeter.
    for(let i=0;i<deck.length;i++){const a=deck[i],b=deck[(i+1)%deck.length];if(i===2){const m=mix(a,b,.5),u=mix(a,b,.44),v=mix(a,b,.56);rail(a,u);rail(v,b);strip(m,[360,-1565],4,.035,'sidewalk');paths.push([m,[360,-1565],5]);}else rail(a,b);}
    K.polyWalls(deck,.035,2.5,{mat:{tex:'metal',color:0xb0b8b3},thick:.1});
    const entry=P(0,38);sign(['잠원수영장','리모델링 공사 중 · 출입금지'],entry[0],2.8,entry[1],7,1.15,.74);
    zone('잠원수영장',deck,0,'1F','리모델링 공사 중 · 미개장',5);zone('잠원수영장 수조',basin,-1.25,'1F','공사 구역',1.4);
    for(const side of[-1,1])for(let i=0;i<7;i++){
      const cx=-32+i*10,cz=side*28;
      for(const u of[-4,4])for(const v of[-3,3]){const p=P(cx+u,cz+v);K.cyl({x:p[0],z:p[1],y:.035,r:.085,h:2.5,mat:C.white,seg:6});}
      for(let j=0;j<10;j++){const a=j*Math.PI/10,b=(j+1)*Math.PI/10,A=P(cx-4,cz+Math.cos(a)*3.3),B=P(cx+4,cz+Math.cos(a)*3.3),D=P(cx-4,cz+Math.cos(b)*3.3),E=P(cx+4,cz+Math.cos(b)*3.3);const q=[[A[0],2.5+Math.sin(a)*1.45,A[1]],[B[0],2.5+Math.sin(a)*1.45,B[1]],[E[0],2.5+Math.sin(b)*1.45,E[1]],[D[0],2.5+Math.sin(b)*1.45,D[1]]];K.quad(side<0&&i%2===0?0x5f99b0:C.white,q,[0,1,0]);K.quad(0xe0e0d4,q,[0,-1,0]);}
    }
    // White tensile masts and perimeter spars sit above the landward canopy.
    for(let i=0;i<7;i++){const u=-32+i*10,a=P(u-4,28),b=P(u+4,28),m=P(u,28);beam([m[0],2.7,m[1]],[m[0],4.45,m[1]],.025,C.white);for(const q of[a,b])beam([q[0],3.85,q[1]],[m[0],4.35,m[1]],.018,C.white);}
    for(const side of[-1,1]){
      const rp=[P(side*34-4,-11),P(side*34+4,-11),P(side*34+4,10),P(side*34-4,10)];K.slab(rp,.035,{mat:'tile'});K.polyWalls(rp,.035,2.8,{mat:0xe6e5d8,inner:'tile',openings:[{x:P(side*34,10)[0],z:P(side*34,10)[1],w:2,y0:.035,y1:2.5}]});K.slab(rp,2.85,{mat:C.white});const p=P(side*34,10.1);sign(side<0?'여자 탈의실':'남자 탈의실',p[0],2.1,p[1],4,.55,.74);zone(side<0?'잠원수영장 여자 탈의실':'잠원수영장 남자 탈의실',rp,0,'1F','보관함 · 샤워실',2.8);
      K.detail({name:'수영장 탈의실 '+side,floor:'1F',poly:rp,y0:0,y1:2.8},()=>{for(let i=0;i<7;i++){const q=P(side*34-2,-8+i*2.2);box(q[0],0,q[1],1.3,2.1,.55,0x90bfc3,true,.74);for(let j=0;j<2;j++){const p=P(side*34-1.65,-8+i*2.2);box(p[0],.55+j,p[1],.05,.1,.04,C.steel);}}const b=P(side*34+1,0);bench(b[0],b[1],.74);});
    }
    // Permanent ladders retain the dry-basin interpretation of photo18.
    for(const[u,v]of[[-18,-12.8],[17,-12.8],[-18,12.8],[17,12.8]]){
      const side=Math.sign(v),cp=(du,dv,h)=>{const p=P(u+du,v+dv);return[p[0],h,p[1]];};
      for(const du of[-.34,.34]){const curve=[[.48*side,.06],[.48*side,.78],[.32*side,.94],[-.2*side,.94],[-.4*side,.76],[-.4*side,-1.12]];for(let j=1;j<curve.length;j++)beam(cp(du,curve[j-1][0],curve[j-1][1]),cp(du,curve[j][0],curve[j][1]),.038,{tex:'metal',color:0xd0dbd7});}
      for(const yy of[-.85,-.5,-.15])beam(cp(-.34,-.4*side,yy),cp(.34,-.4*side,yy),.035,C.steel);
    }
    K.detail({name:'잠원수영장 그늘막과 수조',floor:'1F',poly:deck,y0:-1.25,y1:4.5},()=>{
      // Curved moulded loungers, with the back at the outside of each row.
      function lounger(u,v,side){const shape=[[-1,.23],[-.73,.30],[-.35,.27],[0,.29],[.3,.43],[.62,.72],[.88,.9]],Q=(du,dv,h)=>{const p=P(u+du,v+dv*side);return[p[0],h,p[1]];};
        for(let j=1;j<shape.length;j++){const[a,h]=shape[j-1],[b,k]=shape[j];K.quad(C.white,[Q(-.37,a,h),Q(.37,a,h),Q(.37,b,k),Q(-.37,b,k)],[0,1,0]);K.quad(0xd8ded8,[Q(-.37,b,k-.08),Q(.37,b,k-.08),Q(.37,a,h-.08),Q(-.37,a,h-.08)],[0,-1,0]);for(const off of[-.37,.37])K.quad(C.white,[Q(off,a,.09),Q(off,b,.09),Q(off,b,k),Q(off,a,h)],[off*Math.cos(.74),0,-off*Math.sin(.74)]);}
        for(const dv of[-.65,.5]){const p=P(u,v+dv*side);box(p[0],.045,p[1],.56,.13,.23,C.white,false,.74);}}
      for(const side of[-1,1])for(let i=0;i<12;i++)lounger(-23+i*4.15,side*17,side);
      for(const side of[-1,1])for(let i=0;i<5;i++){
        const u=-20+i*10,v=side*20.5,p=P(u,v);K.cyl({x:p[0],z:p[1],y:.035,r:.045,h:2.55,mat:C.white,seg:8});
        box(p[0],.04,p[1],.6,.08,.6,0xdedfd5,false,.74);
        for(let j=0;j<16;j++){const aa=j*Math.PI/8,bb=(j+1)*Math.PI/8,q=P(u+1.65*Math.cos(aa),v+1.65*Math.sin(aa)),r=P(u+1.65*Math.cos(bb),v+1.65*Math.sin(bb));K.quad(j%2?0xeeeede:C.white,[[p[0],2.77,p[1]],[q[0],2.34,q[1]],[r[0],2.34,r[1]],[p[0],2.77,p[1]]],[0,1,0]);K.quad(0xe1e4d8,[[p[0],2.76,p[1]],[q[0],2.33,q[1]],[r[0],2.33,r[1]],[p[0],2.76,p[1]]],[0,-1,0]);beam([p[0],2.73,p[1]],[q[0],2.31,q[1]],.013,0xd7d7c8);}
        K.dome({x:p[0],z:p[1],y:2.77,rx:.1,ry:.055,rz:.1,mat:C.white,seg:8,rings:3});
      }
      // Foreground canopy edge and dangling bulbs, on both long deck sides.
      for(const side of[-1,1]){const v=side*24.7;for(let i=0;i<6;i++){const aa=P(-36+i*10,v),bb=P(-26+i*10,v);beam([aa[0],2.5,aa[1]],[bb[0],2.5,bb[1]],.04,C.white);for(let j=0;j<4;j++){const p=P(-35+i*10+j*2.5,v);beam([p[0],2.49,p[1]],[p[0],2.24,p[1]],.012,C.dark);K.dome({x:p[0],z:p[1],y:2.12,rx:.065,ry:.11,rz:.065,mat:{tex:'emit',color:0xffe8b5},seg:6,rings:3,hemi:false});}}}
      // A tall rescue chair and its visible climb-up rungs, kept off the aisle.
      const rescue=P(22,18.9),R=(u,v,h)=>{const p=P(22+u,18.9+v);return[p[0],h,p[1]];};
      for(const u of[-.48,.48]){beam(R(u,-.5,.04),R(u,-.2,1.85),.045,C.white);beam(R(u,1.4,.04),R(u,.25,1.85),.045,C.white);}
      for(let j=0;j<5;j++)beam(R(-.48,1.25-j*.22,.22+j*.32),R(.48,1.25-j*.22,.22+j*.32),.035,C.white);
      chair(rescue[0],1.45,rescue[1],.74,0xe9eee5);
      const ring=P(22.65,19);for(let j=0;j<16;j++){const a=j*Math.PI/8,b=(j+1)*Math.PI/8;beam([ring[0]+Math.cos(a)*.28,1.25+Math.sin(a)*.28,ring[1]],[ring[0]+Math.cos(b)*.28,1.25+Math.sin(b)*.28,ring[1]],.06,j%4<2?0xe67952:C.white);}
      // The seasonal lane ropes are wound onto a reel, not suspended over air.
      const reel=P(-27,17.7);for(const u of[-.58,.58]){const p=P(-27+u,17.7);box(p[0],.05,p[1],.07,.78,.9,C.steel,false,.74);}
      for(let turn=0;turn<10;turn++)for(let j=0;j<16;j++){const aa=j*Math.PI/8,bb=(j+1)*Math.PI/8,u=-27-.45+turn*.1,a=P(u,17.7+.35*Math.cos(aa)),b=P(u,17.7+.35*Math.cos(bb));beam([a[0],.52+.35*Math.sin(aa),a[1]],[b[0],.52+.35*Math.sin(bb),b[1]],.045,(j+turn)%4<2?0x36566f:C.white);}
      for(const u of[-20,-10,0,10,20]){const p=P(u,13.2);sign('수심 1.2m',p[0],.5,p[1],1.2,.25,.74,'#f5ebe3','#245e84');}
      // Sparse weeds follow paving joints, never the swimming basin.
      for(let i=0;i<40;i++){const u=-28+(i*17%56),v=i%2?-22.8:33.2;if(v>20&&u<-7)continue;const p=P(u,v);for(let j=0;j<3;j++)beam([p[0],.04,p[1]],[p[0]+(j-1)*.055,.15+j*.025,p[1]+.04],.012,0x7d8454);}
    });
    const kiosk=P(-36,17);box(kiosk[0],.035,kiosk[1],3.4,2.6,3.4,0xe5e3d5,true,.74);box(kiosk[0],2.65,kiosk[1],3.65,.12,3.65,C.white,false,.74);const kp=P(-36,18.75);sign(['잠원수영장','안내소'],kp[0],1.75,kp[1],2.7,.7,.74,'#447c98');
    // The background within this module is planting; surrounding apartment
    // geometry and the electricity pylon belong to the wider city modules.
    for(let i=0;i<15;i++){const u=-39+i*5.5,p=P(u,43);if(Math.abs(u)<5)continue;if(K.pointInPoly(p[0],p[1],park)){K.tree(p[0],p[1],{h:9+(i%4),kind:'zelkova'});const q=P(u,40.5);K.dome({x:q[0],z:q[1],y:0,rx:3,ry:1.5,rz:2,mat:0x56773f,seg:8,rings:4});}}
    const cam=P(0,42);spawn('잠원수영장 · 공사 안내',cam[0],0,cam[1],42.4);
  }

  function hannam(){
    const a=[993,-2110],b=[881,-2365],q=band(a,b,34),L=Math.hypot(b[0]-a[0],b[1]-a[1]),u=[(b[0]-a[0])/L,(b[1]-a[1])/L],n=[-u[1],u[0]],P=(s,o=0)=>[a[0]+u[0]*s+n[0]*o,a[1]+u[1]*s+n[1]*o],axis=Math.atan2(-u[0],-u[1]);
    // Surface colours are authored directly: tinting the near-black generic
    // asphalt hid the red/green lanes and grey entry forecourt in round 8.
    for(const[key,col]of[['jamwon_lane_red','#ad5146'],['jamwon_lane_green','#477c6d'],['jamwon_lot','#777975'],['jamwon_bridge_concrete','#b9bcb7']])K.texture(key,128,128,(g,w,h)=>{const r=K.rand(940);g.fillStyle=col;g.fillRect(0,0,w,h);for(let i=0;i<800;i++){g.fillStyle=i%2?'#ffffff0d':'#1820200c';g.fillRect(r()*w,r()*h,1+r()*2,1+r()*2);}if(key.includes('concrete')){g.strokeStyle='#7b817d60';g.lineWidth=1;g.strokeRect(0,0,w,h);}},[3,3]);
    const concrete='jamwon_bridge_concrete',stairVoid=rect(958.7,-2160.1,962.1,-2145.95);
    for(const piece of subtract(q,stairVoid))K.slab(piece,8.4,{mat:'jamwon_lot',under:concrete,thick:1.1});
    rail(q[0],mix(q[0],q[3],38/L),8.4);rail(mix(q[0],q[3],58/L),q[3],8.4);rail(q[1],q[2],8.4);
    // Deep, light box girders, dark ribs, utility pipes and transverse bents.
    // All deep girders leave the stair and middle-landing headroom clear.
    for(const off of[-13,-7,0,7,13])for(const[s0,s1]of [[0,35],[70,L]]){const c=P(s0,off),d=P(s1,off);K.wall(...c,...d,5.45,7.4,{thick:2.05,mat:concrete,solid:false});for(const edge of[-1.04,1.04]){const e=P(s0,off+edge),f=P(s1,off+edge);beam([e[0],5.43,e[1]],[f[0],5.43,f[1]],.055,0x515f60);}for(let s=s0+3;s<s1;s+=5){const e=P(s,off-1.06),f=P(s,off+1.06);beam([e[0],5.5,e[1]],[f[0],5.5,f[1]],.06,0x4d5858);}}
    for(const off of[-10.4,3.4,10.4]){const c=P(68,off),d=P(L,off);beam([c[0],6.8,c[1]],[d[0],6.8,d[1]],.11,0x414a4a);for(let s=70;s<L;s+=2.4){const c=P(s,off-.6),d=P(s,off+.6);beam([c[0],6.75,c[1]],[d[0],6.75,d[1]],.035,0x414a4a);}}
    for(let s=20;s<L;s+=s===20?45:30){const c=P(s,-13),d=P(s,13);for(const p of[c,d])box(p[0],0,p[1],2.15,6.6,2.8,concrete,true,axis);beam([c[0],5.9,c[1]],[d[0],5.9,d[1]],.7,concrete);for(const off of[-10,3,10]){const p=P(s+8,off);box(p[0],7.1,p[1],.3,.08,1.25,'emit',false,axis);}}
    function delineator(x,z,y=.065){K.cyl({x,y,z,r:.18,h:.045,mat:0xe56f36,seg:10});for(const[h,r,c]of[[.05,.075,0xe9783d],[.27,.078,C.white],[.36,.071,0xe9783d],[.51,.073,C.white],[.60,.066,0xe9783d]])K.cyl({x,y:y+h,z,r,h:h===.6?.09:.12,mat:c,seg:8});}
    function trafficCone(x,z,y=0){box(x,y,z,.42,.05,.42,0xc95127);for(let i=0;i<7;i++){const h=i*.085,r=.16-i*.018;K.cyl({x,y:y+.05+h,z,r,h:.086,mat:i===3||i===4?C.white:0xe65d2a,seg:10});}}
    function ornateRail(c,d,y=.065){const len=Math.hypot(d[0]-c[0],d[1]-c[1]),nn=Math.ceil(len/.45),dx=(d[0]-c[0])/len,dz=(d[1]-c[1])/len;for(const h of[.12,1.05,1.18])beam([c[0],y+h,c[1]],[d[0],y+h,d[1]],h===1.18?.05:.025,0xd6d9d3);for(let i=0;i<=nn;i++){const p=mix(c,d,i/nn);if(i%5===0)box(p[0],y,p[1],.10,1.22,.10,0xe0e1d8);for(let j=0;j<6;j++){const h0=.14+j*.15,h1=h0+.15,s0=Math.sin(j*Math.PI/3)*.11,s1=Math.sin((j+1)*Math.PI/3)*.11;beam([p[0]+dx*s0,y+h0,p[1]+dz*s0],[p[0]+dx*s1,y+h1,p[1]+dz*s1],.018,0xd6d9d3);}}}
    function arrow(x,z,y,rot=0){const F=frame(x,z,rot);K.hpoly(0xf5f2de,[[-.11,1.5],[.11,1.5],[.11,-.3],[.48,-.3],[0,-1.4],[-.48,-.3],[-.11,-.3]].map(p=>F(...p)),y);}
    // Preserve the transverse park connection; add the long bridge-axis vista
    // visible in photo04 instead of making the cross-path masquerade as it.
    const pa=[900,-2220],pb=[972,-2186],p=band(pa,pb,6.8,1.2);strip(pa,pb,3,.065,'jamwon_lane_red');slab(band(pa,pb,2.4,3),.06,'jamwon_lane_green');ornateRail(p[0],p[3]);ornateRail(p[1],p[2]);paths.push([pa,pb,9]);
    strip([900,-2220],[927,-2225],4,.065,'sidewalk');strip([972,-2186],[989,-2295],3,.065,'sidewalk');
    const ca=P(76,-4),cb=P(247,-4);strip(ca,cb,3.4,.065,'jamwon_lane_red');slab(band(ca,cb,2.5,-3.05),.065,'jamwon_lane_green');slab(band(ca,cb,4.7,4.1),.065,{tex:'concrete',color:0xd4c8ab});paths.push([ca,cb,11]);
    const edge=band(ca,cb,11.5,.6);ornateRail(edge[0],edge[3]);ornateRail(edge[1],edge[2]);
    for(const off of[-.2,1.65,-1.68]){const c=P(76,-4+off),d=P(247,-4+off);paint(c,d,off===-.2?.15:.11,.085,off===-.2?0xf2c74d:0xf4eee0);}
    for(let s=78;s<247;s+=3){const p=P(s,-5.8);delineator(...p);}for(const s of[89,117,151,187,225]){const p=P(s,-4);arrow(p[0],p[1],.09,axis);const w=P(s,-7.05);K.floorText('보행로',{x:w[0],y:.09,z:w[1],w:1.5,h:3.4,rotY:axis,fg:'#f4f4e9'});}
    for(const t of[.2,.6,.9]){const p=mix(pa,pb,t);arrow(p[0],p[1],.09,Math.atan2(-(pb[0]-pa[0]),-(pb[1]-pa[1])));const w=band(pa,pb,.01,3)[0],v=band(pa,pb,.01,3)[3],wp=mix(w,v,t);K.floorText('보행로',{x:wp[0],y:.09,z:wp[1],w:1.5,h:2.6,rotY:-2,fg:'#ffffff'});}
    zone('한남대교 하부',rect(875,-2370,994,-2150),0,'1F','자전거길 · 보행로 · 사방치기',6);
    // The old camera was outside the asphalt extent. Extend the actual entry
    // apron and move its equipment east of the bridge, into the visible lane.
    const park=rect(977,-2192,1059,-2106);slab(park,.025,'jamwon_lot');zone('잠원 제4주차장',park,0,'1F','한남대교 남단 · 계단 연결');
    for(const z of[-2130,-2150,-2170])for(let i=0;i<14;i++){const x=994+i*3;paint([x,z-3],[x,z+3],.1,.045);paint([x,z+3],[x+3,z+3],.1,.045);}
    for(const z of[-2138,-2158,-2180]){arrow(1044,z,.05);arrow(1008,z,.05,Math.PI/2);}
    for(const x of[1040.6,1041,1047])paint([x,-2110],[x,-2188],.10,.05);
    for(let z=-2118;z>-2150;z-=2.5)paint([1032,z],[1039.8,z-3.3],.13,.052,0xe6b547);
    for(const z of[-2128,-2144]){K.cyl({x:1044,y:.028,z,r:.38,h:.018,mat:0x555b58,seg:16});for(let k=-2;k<=2;k++)paint([1043.75,z+k*.1],[1044.25,z+k*.1],.025,.05,0x8d8d80);}
    box(1036.4,.025,-2130,2.2,2.65,2.5,0xbcbfb9,true);box(1036.4,1,-2128.72,1.9,1.1,.045,0x435b61);box(1037.53,1,-2130,.045,1.1,1.9,0x435b61);box(1036.4,2.67,-2130,2.5,.17,2.8,0x4e6166);
    sign(['잠원 제4주차장','주차요금 사전정산'],1036.4,2.2,-2128.68,1.9,.65,0,'#285480');sign(['잠원 제4주차장','입구 ↑'],1039,1.35,-2124,1.1,1.7,0,'#285480');
    for(const x of[1032.4,1039.8]){box(x,.025,-2131,.5,1.1,.7,0x263b3f);box(x,1.12,-2131,.54,.18,.25,0x3b585e);}beam([1039.8,1.25,-2131],[1039.8,2.7,-2131],.045,0xe5ebe1);
    for(let i=0;i<12;i++)delineator(1040.3,-2118-i*5,.025);
    rail([1048,-2111],[1048,-2187],.025);for(let z=-2118;z>-2187;z-=9){K.tree(1059,z,{h:9+(Math.abs(z)%3),kind:'zelkova'});lamp(1056,z+2);}
    // Official bridge stair pin and verified stair/elevator route are retained.
    const stairs=[[960.36,-2145.90],[960.36,-2159],[980,-2159],[980,-2145.9]];
    slab(rect(956,-2145.9,963.1,-2140),8.4,{tex:'concrete',color:0xd0cec3});K.stairs(...stairs[0],...stairs[1],{ya:8.4,yb:4.2,w:2.7,rails:true,mat:'concrete'});slab(rect(958.6,-2161,981.5,-2159),4.2,'sidewalk');K.stairs(...stairs[2],...stairs[3],{ya:4.2,yb:.025,w:2.7,rails:true,mat:'concrete'});strip(stairs[3],[985,-2145.9],3,.025,'sidewalk');
    K.elevator({name:'한남대교 공원 승강기',x:966,z:-2147,w:2.2,d:2.2,rotY:Math.PI/2,floors:[{label:'1F',y:.025,name:'제4주차장'},{label:'2F',y:8.4,name:'한남대교 보도'}]});slab(rect(962.5,-2150,972,-2144),8.4,'sidewalk');slab(rect(962.5,-2150,978,-2144),.025,'sidewalk');
    zone('한남대교 보도',rect(955,-2151,973,-2140),8.4,'2F','공원 내려가는 계단',4);
    // Upper-mouth walls follow the descent: they never cap the stair opening.
    for(const x of[958.75,961.97]){box(x,8.4,-2146.3,.3,1.15,1.2,{tex:'concrete',color:0xeeeadd},true);beam([x,9.55,-2145.7],[x,5.35,-2159],.11,0xd4d2c8);for(let i=0;i<13;i++){const z=-2146.3-i*.92,y=8.4-(i*.92+.4)/13.1*4.2;box(x,y,z,.17,.95,.90,{tex:'wood',color:0xa88c70});}beam([x,9.05,-2146],[x,4.95,-2158.8],.04,0x4b5654);}
    box(960.36,8.405,-2145.55,2.65,.03,.55,0xe4b83e);for(let i=0;i<17;i++)for(let j=0;j<3;j++)K.cyl({x:959.13+i*.15,y:8.435,z:-2145.72+j*.16,r:.035,h:.018,mat:0xf3cb58,seg:6});
    K.texture('jamwon_gate_stripe',128,256,(g,w,h)=>{g.fillStyle='#e5b92d';g.fillRect(0,0,w,h);g.strokeStyle='#242824';g.lineWidth=28;for(let y=-180;y<360;y+=70){g.beginPath();g.moveTo(-20,y);g.lineTo(w+20,y+140);g.stroke();}},[.7,1.4]);
    box(958.05,8.4,-2144.8,.62,1.12,.18,'jamwon_gate_stripe');for(const dx of[-.37,.37])beam([958.05+dx,8.4,-2144.8],[958.05+dx,9.62,-2144.8],.05,0xc9cfcb);for(let i=0;i<10;i++){const t=i*Math.PI/10,v=(i+1)*Math.PI/10;beam([958.05+Math.cos(t)*.37,9.62+Math.sin(t)*.37,-2144.8],[958.05+Math.cos(v)*.37,9.62+Math.sin(v)*.37,-2144.8],.05,0xc9cfcb);}
    for(const[x,z]of[[957.5,-2144.8],[962.5,-2145.1],[957.2,-2142.8]])trafficCone(x,z,8.4);
    for(const[x,col]of[[956.3,0x388865],[957.1,0xa7b8ac]]){box(x,8.4,-2144.9,.65,1.02,.65,col);box(x,9.2,-2144.54,.27,.22,.025,0x24332c);sign('분리수거',x,8.94,-2144.54,.55,.16,0,'#f2f1e8','#24453c');}
    K.texture('jamwon_no_motorcycle',128,128,(g,w,h)=>{g.clearRect(0,0,w,h);g.fillStyle='#c9342e';g.beginPath();g.arc(64,64,62,0,Math.PI*2);g.fill();g.fillStyle='#f6f5eb';g.beginPath();g.arc(64,64,49,0,Math.PI*2);g.fill();g.strokeStyle='#232a27';g.lineWidth=5;for(const x of[37,90]){g.beginPath();g.arc(x,83,15,0,Math.PI*2);g.stroke();}g.beginPath();g.moveTo(37,83);g.lineTo(56,56);g.lineTo(73,83);g.lineTo(90,83);g.lineTo(78,48);g.lineTo(68,48);g.moveTo(49,61);g.lineTo(69,61);g.stroke();g.strokeStyle='#c9342e';g.lineWidth=9;g.beginPath();g.moveTo(31,20);g.lineTo(99,108);g.stroke();},[1,1],{transparent:true,doubleSide:true});
    K.cyl({x:957.5,y:8.4,z:-2146.5,r:.045,h:3.1,mat:C.steel,seg:8});box(957.5,10.65,-2146.5,.75,.75,.025,'jamwon_no_motorcycle');sign('오토바이통행금지',957.5,10.4,-2146.48,.9,.22,0,'#efeee7','#202a28');
    // Clock/crossing composition, placed under a box girder rather than lawn.
    K.texture('jamwon_clock',256,256,(g,w,h)=>{g.clearRect(0,0,w,h);g.fillStyle='#55635d';g.beginPath();g.arc(128,128,122,0,Math.PI*2);g.fill();g.fillStyle='#eeeee2';g.beginPath();g.arc(128,128,109,0,Math.PI*2);g.fill();g.strokeStyle='#2d4443';g.lineWidth=4;for(let i=0;i<12;i++){const a=i*Math.PI/6;g.beginPath();g.moveTo(128+Math.sin(a)*87,128-Math.cos(a)*87);g.lineTo(128+Math.sin(a)*101,128-Math.cos(a)*101);g.stroke();}g.lineWidth=7;g.beginPath();g.moveTo(128,128);g.lineTo(84,94);g.moveTo(128,128);g.lineTo(166,61);g.stroke();},[1,1],{transparent:true,doubleSide:true});
    const cp=P(101,-.6),cr=P(101,-1.25);K.cyl({x:cp[0],z:cp[1],y:.065,r:.075,h:5,mat:C.dark,seg:10});box(cr[0],3.2,cr[1],.85,.85,.025,'jamwon_clock',false,axis);const armA=P(101,-1.9),armB=P(101,.7);beam([armA[0],4.75,armA[1]],[armB[0],4.75,armB[1]],.035,C.dark);for(const t of[-1.8,.6]){const p=P(101,t);box(p[0],4.7,p[1],.7,.1,.28,0x78877d,false,axis);box(p[0],4.685,p[1],.58,.025,.2,'emit',false,axis);}
    sign(['횡단보도','속도를 줄이시오'],cp[0],2.5,cp[1],.8,.75,axis,'#2574a6');for(let i=0;i<5;i++){const p=P(93+i*.38,-4);paint(P(93+i*.38,-5.5),P(93+i*.38,-2.5),.18,.091,0xf0e1b1);}
    for(const s of[101,110,121]){const p=P(s,2.4);bench(p[0],p[1],axis);}
    // Rental forecourt and actual painted pier; no freestanding panda sphere.
    K.texture('jamwon_rental_pavers',128,128,(g,w,h)=>{g.fillStyle='#8c8d7e';g.fillRect(0,0,w,h);for(let j=0;j<8;j++)for(let i=0;i<8;i++){g.fillStyle=(i+j)%3?'#aaa18c':'#ae8b7b';g.fillRect(i*18+(j%2)*9-9,j*16+1,16,14);}},[2,2]);
    slab(rect(969,-2209,991,-2189),.07,'jamwon_rental_pavers');box(971,.07,-2203.8,2.8,6.4,2.8,concrete,true);box(982,.07,-2206.8,5.7,2.7,3.5,0x8d9b91,true);box(982,1.1,-2205.02,4.4,1.05,.04,0x405650);box(982,2.77,-2206.8,6.1,.2,4,0x456962);sign('자전거 대여소',982,2.45,-2204.98,4.5,.5,0,'#3a6056');
    K.texture('jamwon_panda_mural',256,256,(g,w,h)=>{g.fillStyle='#a9aca0';g.fillRect(0,0,w,h);g.fillStyle='#73835d';g.fillRect(0,208,w,48);g.fillStyle='#24312d';g.beginPath();g.ellipse(112,170,66,47,-.4,0,Math.PI*2);g.fill();g.fillStyle='#edeee4';g.beginPath();g.ellipse(127,141,59,73,-.35,0,Math.PI*2);g.fill();g.fillStyle='#26302b';g.beginPath();g.ellipse(105,165,67,19,-.5,0,Math.PI*2);g.fill();for(const[x,y]of[[91,69],[157,75]]){g.beginPath();g.arc(x,y,17,0,Math.PI*2);g.fill();}g.fillStyle='#eeeeE5';g.beginPath();g.ellipse(126,99,44,40,0,0,Math.PI*2);g.fill();g.fillStyle='#27312c';for(const[x,y]of[[108,96],[143,100]]){g.beginPath();g.ellipse(x,y,10,15,.4,0,Math.PI*2);g.fill();}g.beginPath();g.ellipse(125,117,10,6,0,0,Math.PI*2);g.fill();},[2.7,2.7]);
    box(971,.25,-2202.38,2.7,2.7,.025,'jamwon_panda_mural');for(const[x,z]of[[969,-2210],[989,-2211]])K.tree(x,z,{h:9,kind:'pine'});
    // A curved green approach deck remains clear above the bike racks.
    const curve=[[985,-2215],[987,-2228],[984,-2240],[978,-2253],[969,-2266]];for(let i=1;i<curve.length;i++){const c=curve[i-1],d=curve[i];K.slab(band(c,d,5.6),8.5,{mat:'jamwon_lot',under:0x91aa94,thick:1.4});const e=band(c,d,5.6);rail(e[0],e[3],8.5);rail(e[1],e[2],8.5);}
    function detailedCar(x,z,rot,col,tall=false){const F=frame(x,z,rot),H=tall?1.55:1.35,v=(xx,yy,zz)=>{const p=F(xx,zz);return[p[0],yy+.025,p[1]];},add=(xx,yy,zz,w,h,d,mat)=>{const p=F(xx,zz);box(p[0],yy+.025,p[1],w,h,d,mat,false,rot);};
      box(x,.325,z,1.82,.57,4.45,col,true,rot);add(0,.87,-.2,1.60,.08,2.35,col);add(0,H,-.35,1.53,.1,1.85,col);K.quad(0x344b55,[v(-.77,.89,1.02),v(.77,.89,1.02),v(.7,H,.56),v(-.7,H,.56)],[0,.4,1]);K.quad(0x344b55,[v(.77,.89,-1.36),v(-.77,.89,-1.36),v(-.7,H,-1.26),v(.7,H,-1.26)],[0,.2,-1]);
      for(const side of[-1,1]){K.quad(0x344b55,[v(side*.81,.9,-1.3),v(side*.81,.9,.98),v(side*.765,H,.55),v(side*.765,H,-1.25)],[side,0,0]);add(side*.82,.9,-.22,.045,H-.82,.08,col);add(side*.83,.77,-.49,.025,.035,.20,0xdddeda);add(side*.98,.9,.7,.22,.12,.24,col);}
      add(0,.38,2.25,1.56,.16,.06,0x4d5756);add(0,.63,2.26,.65,.18,.025,0x2b3435);for(const side of[-1,1]){add(side*.62,.68,2.26,.48,.16,.04,0xe2e8d4);add(side*.68,.68,-2.26,.31,.16,.04,0xb7483a);}add(0,.48,2.29,.43,.12,.02,0xe4e2d7);
      for(const zz of[-1.43,1.43])for(const side of[-1,1]){for(let j=0;j<12;j++){const t=j*Math.PI/6,t2=(j+1)*Math.PI/6;beam(v(side*.93,.35+.32*Math.cos(t),zz+.32*Math.sin(t)),v(side*.93,.35+.32*Math.cos(t2),zz+.32*Math.sin(t2)),.07,0x232928);if(j%2===0)beam(v(side*.99,.35,zz),v(side*.99,.35+.25*Math.cos(t),zz+.25*Math.sin(t)),.022,0xb7beb9);}}
    }
    K.detail({name:'한남대교 하부와 제4주차장',floor:'1F',rect:[875,-2370,1064,-2106],y0:0,y1:6},()=>{
      for(let row=0;row<3;row++)for(let i=0;i<16;i++){const x=973.6+i*.72,z=-2194-row*3.1;bicycle(x,z,Math.PI/2,.07,[0x394240,0x993f37,0xd4d7ca][(i+row)%3]);box(x,.87,z-.6,.36,.25,.36,0x5b6762);box(x,1.12,z-.6,.37,.025,.37,0xa1aaa2);}
      for(const z of[-2130,-2150,-2170])for(let i=0;i<13;i++)if((i+Math.round(z))%4!==0)detailedCar(995.5+i*3,z,z===-2130?0:Math.PI,[0xe1e3d9,0x667783,0x303a3f,0xa8c9bd,0xc6c9c2,0xc4a55d][i%6],i%4===2);
      for(let i=0;i<10;i++)detailedCar(1053,-2119-i*6,Math.PI/2,[0xdfe4dd,0x657480,0x333c3d][i%3],i%3===0);
      for(let i=0;i<8;i++){const x=941+(i%2)*1.1,z=-2169-Math.floor(i/2)*1.2;for(const[a,b]of[[[x,z],[x+1,z]],[[x,z],[x,z+1.1]],[[x+1,z],[x+1,z+1.1]],[[x,z+1.1],[x+1,z+1.1]]])paint(a,b,.07,.04,[0xe6d06c,0xc97b72,0x8bb7c1][i%3]);K.floorText(String(i+1),{x:x+.5,y:.05,z:z+.55,w:.5,h:.6,fg:'#ffffff'});}
      sign('사방치기',941,1.7,-2167,2.8,.5);bench(944,-2159);bench(949,-2159);sign('한남대교',971,3.8,-2184,4,.8,0,'#205b97');
      for(const[s,off,sit]of[[110,2.4,true],[137,-7,false],[161,-7,false],[194,-4,false]]){const p=P(s,off);K.person(p[0],.065,p[1],{sit,rotY:axis,shirt:s%2?0x548293:0xc38b75});}const cy=P(150,-4);bicycle(cy[0],cy[1],axis+Math.PI/2,.065,0x354b4c);K.person(cy[0],.22,cy[1],{sit:true,shirt:0xb64e46,rotY:axis});
    });
  }
  spawn('신잠원나들목 · 거리 입구',345,0,-1267,43);
  spawn('신잠원나들목 · 내부',316,-4,-1295.6,43);
  spawn('잠원 잔디 쉼터',48,.065,-1254,0);
  spawn('한강 산책로 · 반포 연결',-13.88,.065,-1163.19,0);
}
