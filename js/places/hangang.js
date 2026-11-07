// 반포 수변: OSM footprints are the building/deck boundaries, not illustrative circles.
// Floor heights, partitions and furniture layouts are reconstructions, not surveyed plans.
// Tenant labels follow data/research/hangang.json and named OSM POIs. No current-tenant claim.
// Solbit's Mood Seoul and second-floor live performances follow Seoul's 2024 report;
// exact elevations, furniture and current operations remain reconstruction assumptions.
// Assumptions: upper bridge +15m, lower +1.6m (water -1.4m), with a navigation hump;
// the south-bank approach shares the park's +0.10m datum and rises over the river.
// Gabit's retained 0 / 5 / 18 / 23m levels give the convention hall a 13m volume;
// the precise floor elevations and 700-seat theatre arrangement are reconstruction choices.
const PATHS = [305677069,305677070,305677072,305677073,305677074,305692222,305692223,359930728,359930764,532858557,547990902,585895794,697678235,697678236,697678237,697678238,697678239,697678240,697678241,697678250,697678251,697678480,697678481,697678482,697678484,697678486,697678487,697678488,802402467,815547952,815547953,815547954,831122214,838078383,892361591,892361592,892361593,892361594,892361595,892361596,892361597,892361598,892361599,892361600,895877915,895878160,919400909,919400910,919400911,1354859719,1494834732,1494834733,1494834734,1497710480,1497710481,1563032426,1563032427,1563032432,1563032433,1563032434,1563032435,1563032439,1563032440,1563032441,1568503150,1568503151,1568503152,1568503153,1568503154,414267188,697678249,697678489,697678491];
const ISLETS = [305677067,270550732,305677071,305692221];
const PIERS = [848771871,850389024,850389025,850389026,850389027,850389028,851471280];
const LAWNS = [769712603,769712604,769712605,769712606,769712607,919393791];
const SEORAE_PATHS = [320797964,414267185,414267186,414267187,617417296,617417297,617417300,617417302,617417307,617417308,617417309,617417310,617417311,617417312,320797973,414267183,617417299];
export const meta = {
  id: 'hangang', name: '반포한강공원 · 세빛섬',
  claims: [414267182,320797228,320797229,320797969,560449164,1067146733],
  claimRoads: [...PATHS,...SEORAE_PATHS,37928409,674432572,1091571409,1091571410,596516315,560449165,713327919],
  claimAreas: [418249072,769712608,25979109,...LAWNS,...ISLETS,...PIERS,320797972,320797230,1091571021,1085504592,1538963197],
  sources: [
    'https://mediahub.seoul.go.kr/archives/2002598',
    'https://hangang.seoul.go.kr/archives/46727',
    'https://mediahub.seoul.go.kr/archives/2008745',
    'https://www.mt.co.kr/estate/2014/12/27/2014122400441651139',
    'https://www.telltrip.com/domestic-travel/sebitseom-han-river-floating-islands/',
    'https://mediahub.seoul.go.kr/archives/2010487',
    'https://mediahub.seoul.go.kr/archives/2014026',
    'https://mediahub.seoul.go.kr/archives/2019683',
    'https://mediahub.seoul.go.kr/archives/2004701',
    'https://www.somesevit.co.kr/kr/business/gavit/introduce.do',
    'https://www.youtube.com/watch?v=F9MdeqY0Rro',
    'https://www.youtube.com/watch?v=hTkViN9S1vg',
    'https://www.youtube.com/watch?v=MQ3DaFYo2R8',
  ],
};

export function build(K) {
  const { THREE } = K, rnd = K.rand(20261106);
  const sceneOptions=new URLSearchParams(globalThis.location?.search||'');
  const festival=sceneOptions.get('festival')==='1',proposal=sceneOptions.get('proposal')==='1';
  // Plain wood/asphalt textures multiply the tint into saturated brown/black.
  // These finishes describe the actual low-contrast, weathered surfaces instead.
  K.texture('hangang_weathered_deck',512,512,(g,w,h)=>{
    g.fillStyle='#948b7e';g.fillRect(0,0,w,h);
    for(let i=0;i<16;i++){g.fillStyle=['#999083','#92897e','#9c9386','#968e82'][i%4];g.fillRect(i*32,0,31,h);g.fillStyle='#827c72';g.fillRect(i*32,0,1,h);}
  },[3.2,5]);
  K.texture('hangang_ochre_paving',512,512,(g,w,h)=>{
    g.fillStyle='#b3a28b';g.fillRect(0,0,w,h);
    for(let j=0;j<4;j++)for(let i=0;i<4;i++){g.fillStyle=['#b9aa94','#b7a58d','#b2a18b','#bcac96'][(i+j*3)%4];g.fillRect(i*128+1,j*128+1,126,126);}
  },[4,4]);
  K.texture('hangang_shore_ochre',256,256,(g,w,h)=>{
    g.fillStyle='#a98e73';g.fillRect(0,0,w,h);g.fillStyle='#ae947a';
    for(let i=0;i<500;i++)g.fillRect((i*37)%w,(i*83)%h,1,1);
  },[3,3]);
  K.texture('hangang_flagstones',512,512,(g,w,h)=>{
    g.fillStyle='#8f887d';g.fillRect(0,0,w,h);
    for(let y=-1;y<6;y++)for(let x=-1;x<6;x++){
      const u=x*108+(y%2)*47,v=y*105;
      g.fillStyle=['#b8aa95','#b0a28e','#c0b29f','#a99d8c'][(x+y+12)%4];
      g.beginPath();g.moveTo(u+5,v+12);g.lineTo(u+72,v+3);g.lineTo(u+105,v+42);g.lineTo(u+85,v+98);g.lineTo(u+13,v+94);g.lineTo(u-4,v+50);g.closePath();g.fill();
    }
  },[3.5,3.5]);
  K.texture('hangang_grey_pavers',256,256,(g,w,h)=>{
    g.fillStyle='#7f7a77';g.fillRect(0,0,w,h);g.strokeStyle='#99948f';g.lineWidth=2;
    for(let y=0;y<8;y++)for(let x=-1;x<8;x++)g.strokeRect(x*48+(y%2)*24,y*32,48,32);
  },[2,2]);
  K.texture('hangang_red_lane',256,256,(g,w,h)=>{
    g.fillStyle='#a45e56';g.fillRect(0,0,w,h);g.fillStyle='#ad6960';
    for(let i=0;i<260;i++)g.fillRect((i*73)%w,(i*113)%h,2,2);
  },[3,3]);
  const area = id => K.osm.areas.find(a => a.id === id);
  const building = id => K.osmBuilding(id)[0];
  const rect = (x0,z0,x1,z1) => [[x0,z0],[x1,z0],[x1,z1],[x0,z1]];
  const metal = 0x8eabb7, dark = 0x253844, warm = 0xc6ab81;
  const box = (x,y,z,w,h,d,mat,solid=false,rotY=0) => K.box({x,y,z,w,h,d,mat,solid,rotY});
  const sign = (text,x,y,z,w=4,h=0.65,rotY=0,bg='#183f4c',fg='#ffffff') => K.sign(text,{x,y,z,w,h,rotY,bg,fg,twoSided:true});
  const inside = (p, poly, pad=1) => K.pointInPoly(p[0],p[1],poly) && [[pad,0],[-pad,0],[0,pad],[0,-pad]].every(o=>K.pointInPoly(p[0]+o[0],p[1]+o[1],poly));
  const distSeg = (x,z,a,b) => { const dx=b[0]-a[0],dz=b[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz||1))); return Math.hypot(x-a[0]-t*dx,z-a[1]-t*dz); };
  function strip(a,b,w,y,mat='sidewalk',yb=y,rails=false) { K.ramp(a[0],a[1],b[0],b[1],{w,ya:y,yb,mat,rails}); }
  function rail(a,b,y,glass=false,col=metal) {
    const L=Math.hypot(b[0]-a[0],b[1]-a[1]); if(L<0.2)return;
    K.wall(...a,...b,y,y+1.12,{thick:0.045,mat:glass?'glass':col,solid:true,openings:glass?[]:[{at:L/2,w:L,y0:y+0.14,y1:y+0.95}]});
    const n=Math.ceil(L/2.1);
    for(let i=0;i<=n;i++)box(a[0]+(b[0]-a[0])*i/n,y,a[1]+(b[1]-a[1])*i/n,0.075,1.17,0.075,col);
    if(!glass)K.wall(...a,...b,y+0.47,y+0.50,{thick:0.035,mat:col,solid:false});
  }
  // Four merged faces per slender structural member; no mesh per cable/rib.
  function rod3(a,b,r,mat) {
    const d=b.map((v,i)=>v-a[i]),L=Math.hypot(...d),H=Math.hypot(d[0],d[2]);
    if(L<.001)return;
    const u=H>.001?[-d[2]/H*r,0,d[0]/H*r]:[r,0,0];
    const v=H>.001?[-d[0]*d[1]/H/L*r,H/L*r,-d[2]*d[1]/H/L*r]:[0,0,r];
    const corners=[u,v,u.map(n=>-n),v.map(n=>-n)];
    for(let i=0;i<4;i++){
      const q=corners[i],s=corners[(i+1)%4],normal=q.map((n,j)=>(n+s[j])/r);
      K.quad(mat,[a.map((n,j)=>n+q[j]),b.map((n,j)=>n+q[j]),b.map((n,j)=>n+s[j]),a.map((n,j)=>n+s[j])],normal);
    }
  }
  function cableRail(a,b,y=0) {
    rail(a,b,y,false,0xd7dcd8);
    for(const h of [.27,.69,.88])K.wall(...a,...b,y+h,y+h+.018,{thick:.018,mat:0xcbd2cf,solid:false});
  }
  function slopeRail(a,b,ya,yb,col=metal) {
    const L=Math.hypot(b[0]-a[0],b[1]-a[1]),nx=-(b[1]-a[1])/L,nz=(b[0]-a[0])/L;
    for(const h of [.5,1.1])K.quad(col,[[a[0],ya+h,a[1]],[b[0],yb+h,b[1]],[b[0],yb+h+.06,b[1]],[a[0],ya+h+.06,a[1]]],[nx,0,nz]);
    // Short collision spans track the deck, leaving the park and lower bridge open below.
    for(let s=0;s<L;s+=2){const t=s/L,u=Math.min(1,(s+2)/L),y0=ya+(yb-ya)*t,y1=ya+(yb-ya)*u;K.phys.addWall(a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[0]+(b[0]-a[0])*u,a[1]+(b[1]-a[1])*u,Math.min(y0,y1),Math.max(y0,y1)+1.16,.04,'hangang');}
  }
  function bench(x,z,rot=0,y=0) {
    for(let i=0;i<4;i++)box(x,y+0.43,z+(i-1.5)*0.12,2,0.065,0.09,'wood',false,rot);
    box(x,y+0.66,z+0.26,2,0.35,0.08,'wood',false,rot);
    for(const dx of [-0.73,0.73])box(x+dx,y,z,0.09,0.45,0.55,dark);
  }
  function lamp(x,z,y=0,h=4.7) {
    K.cyl({x,y,z,r:0.075,h,mat:dark,seg:6,solid:false});
    box(x,y+h,z,0.7,0.1,0.42,metal);
    box(x,y+h-0.04,z,0.56,0.04,0.32,{tex:'emit',color:0xffe9b3});
  }
  function visitor(x,y,z,i=0,rot=0,sit=false) {
    K.person(x,y,z,{h:1.61+(i%5)*.035,rotY:rot,sit,shirt:[0xddd9ce,0x354551,0x9a7567,0x779390,0x272a30][i%5],pants:i%2?0x35424a:0x69685e});
    if(!sit&&i%3===0){
      const bx=x+Math.cos(rot)*.3,bz=z-Math.sin(rot)*.3;
      box(bx,y+.48,bz,.22,.31,.13,[0xb8a388,0x524a42,0xc5c6bd][i%3],false,rot);
      rod3([bx-.07,y+.77,bz],[bx,y+.89,bz],.013,0x5e5a50);rod3([bx,y+.89,bz],[bx+.07,y+.77,bz],.013,0x5e5a50);
    }
  }
  function planter(x,z,y=0,w=2) {
    box(x,y,z,w,0.6,w,0xb7b8af,true);box(x,y+0.6,z,w-0.18,0.06,w-0.18,0x536c3e);
    for(let j=0;j<5;j++)K.dome({x:x+(rnd()-.5)*w*.6,y:y+.64,z:z+(rnd()-.5)*w*.6,rx:.35,ry:.4,rz:.35,mat:0x638348,seg:6,rings:3});
  }
  function chair(x,y,z,rot=0,col=warm) {
    box(x,y+.43,z,.48,.08,.46,col,true,rot);
    const s=Math.sin(rot),c=Math.cos(rot);
    box(x+s*.22,y+.5,z+c*.22,.48,.43,.065,col,false,rot);
    for(const dx of [-.18,.18])for(const dz of [-.16,.16])box(x+dx*c+dz*s,y,z-dx*s+dz*c,.035,.43,.035,dark);
  }
  function table(x,y,z,kind='dining') {
    const round=kind==='banquet',r=round?1.15:.72;
    K.cyl({x,y:y+.73,z,r,h:.09,seg:round?20:12,mat:round?0xeee6d7:0xa4774e,solid:false});
    K.cyl({x,y,z,r:.1,h:.73,mat:dark,seg:6,solid:false});
    const n=round?8:4;
    for(let j=0;j<n;j++) {const a=j/n*Math.PI*2,rr=r+.35;chair(x+Math.sin(a)*rr,y,z+Math.cos(a)*rr,a,round?0xc9bca6:0x75877c);K.cyl({x:x+Math.sin(a)*r*.68,y:y+.825,z:z+Math.cos(a)*r*.68,r:.135,h:.018,seg:8,mat:0xf2f2eb,solid:false});}
    K.cyl({x,y:y+.83,z,r:.08,h:.2,mat:0xc4dad8,seg:6,solid:false});
    K.dome({x,y:y+1.02,z,rx:.16,ry:.14,rz:.16,mat:0xd5b57e,seg:6,rings:3});
  }
  function shelf(x,y,z,w=2.2) {
    box(x,y,z,w,1.85,.45,0xe8e2d5,true);
    for(let j=0;j<4;j++) {box(x,y+.2+j*.43,z+.25,w,.04,.58,metal);for(let i=0;i<8;i++)box(x-w*.44+i*w*.125,y+.24+j*.43,z+.28,.16,.24,.21,[0xd5944a,0xabc1ae,0xa83835,0x365586,0xe6c459][(i+j)%5]);}
  }
  function buffet(x,y,z,w=7) {
    box(x,y,z,w,.87,1.3,0x655041,true);box(x,y+.87,z,w+.1,.12,1.45,0xe5dfcd);
    for(let i=0;i<6;i++){box(x-w*.4+i*w*.16,y+1,z,.74,.07,.58,metal);K.dome({x:x-w*.4+i*w*.16,y:y+1.07,z,rx:.26,ry:.12,rz:.2,mat:[0xbc6548,0xcaa24c,0x70994a][i%3],seg:8,rings:3});}
    for(const dx of [-w*.44,w*.44])box(x+dx,y+1,z,.05,.7,.05,metal);
    box(x,y+1.65,z,w,.04,1.3,'glass');
  }
  function lift(o) {
    // K.wall cannot combine vertically stacked openings at the same horizontal
    // position. The engine elevator otherwise seals its own doors. Register its
    // normal interaction, but build the front one storey at a time here.
    K.elevator({...o,shaft:false});
    const {x,z,w,d,floors}=o,p=rect(x-w/2,z-d/2,x+w/2,z+d/2),bot=floors[0].y,top=floors[floors.length-1].y+3.2;
    for(const [a,b] of [[p[0],p[1]],[p[1],p[2]],[p[3],p[0]]])K.wall(...a,...b,bot,top,{mat:o.mat??0xaebbc1,thick:.15});
    floors.forEach((f,i)=>{
      K.wall(...p[2],...p[3],f.y,i<floors.length-1?floors[i+1].y:top,{mat:0x96a7ad,thick:.15,openings:[{at:w/2,w:Math.min(1.3,w-.3),y0:f.y,y1:f.y+2.3}]});
      K.slab(p,f.y,{mat:'metal',thick:.05,ceil:false});
      sign(f.label,x,f.y+2.6,z+d/2+.1,.65,.3,0,'#172b36','#f3c175');
      box(x+w/2+.18,f.y+1.05,z+d/2,.12,.25,.05,dark);
    });
  }
  function nearestEdge(poly,x,z) {
    let e=0,d=Infinity;
    poly.forEach((a,i)=>{const q=distSeg(x,z,a,poly[(i+1)%poly.length]);if(q<d){d=q;e=i;}});
    const a=poly[e],b=poly[(e+1)%poly.length],L=Math.hypot(b[0]-a[0],b[1]-a[1]);
    const t=Math.max(.15,Math.min(.85,((x-a[0])*(b[0]-a[0])+(z-a[1])*(b[1]-a[1]))/(L*L)));
    return {edge:e,at:t*L,x:a[0]+t*(b[0]-a[0]),z:a[1]+t*(b[1]-a[1]),rot:Math.atan2(...K.orient(poly)[e])};
  }

  // Clip the grass at the open tunnel ramps too: groundHole affects physics and
  // the city ground, but cannot cut these module-owned decorative polygons.
  const cutA=[-213.15,-657.14],cutB=[-297.9343132274,-791.0994577995];
  const cutL=Math.hypot(cutB[0]-cutA[0],cutB[1]-cutA[1]),cutX=(cutB[0]-cutA[0])/cutL,cutZ=(cutB[1]-cutA[1])/cutL;
  const cutDistances=[p=>(p[0]-cutA[0])*cutX+(p[1]-cutA[1])*cutZ+2,p=>cutL+2-(p[0]-cutA[0])*cutX-(p[1]-cutA[1])*cutZ,p=>-(p[0]-cutA[0])*cutZ+(p[1]-cutA[1])*cutX+3.3,p=>3.3+(p[0]-cutA[0])*cutZ-(p[1]-cutA[1])*cutX];
  const facilityPolys=[320797969,560449164,1067146733].map(id=>building(id).poly);
  function grassAroundTunnel(mat,poly,y) {
    const bounds=K.polyBBox(poly),cuts=[cutDistances];
    for(const p of facilityPolys) {
      const b=K.polyBBox(p);if(b[2]<bounds[0]||b[0]>bounds[2]||b[3]<bounds[1]||b[1]>bounds[3])continue;
      const normals=K.orient(p);cuts.push(p.map((a,i)=>q=>-((q[0]-a[0])*normals[i][0]+(q[1]-a[1])*normals[i][1])));
    }
    if(cuts.length===1&&(bounds[2]<-300||bounds[3]<-780)){K.hpoly(mat,poly,y);return;}
    const verts=poly.map(p=>new THREE.Vector2(...p));
    let pieces=THREE.ShapeUtils.triangulateShape(verts,[]).map(face=>face.map(i=>poly[i]));
    for(const distances of cuts) {
      const next=[];
      for(let remainder of pieces)for(const distance of distances) {
        const inn=[],out=[];
        for(let i=0;i<remainder.length;i++) {
          const a=remainder[i],b=remainder[(i+1)%remainder.length],da=distance(a),db=distance(b);
          (da>=0?inn:out).push(a);
          if((da>=0)!==(db>=0)){const t=da/(da-db),p=[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t];inn.push(p);out.push(p);}
        }
        if(out.length>=3)next.push(out);
        remainder=inn;if(remainder.length<3)break;
      }
      pieces=next;
    }
    for(const p of pieces)K.hpoly(mat,p,y);
  }

  // Park ground and the finer OSM lawns, with the river intentionally owned by city.js.
  const park=area(418249072).poly;
  grassAroundTunnel({tex:'grass',color:0xb4c59b},park,.012);
  grassAroundTunnel({tex:'grass',color:0xc2cea9},area(769712608).poly,.025);
  for(const id of LAWNS)grassAroundTunnel({tex:'grass',color:id%2?0xb4cb8d:0xc0cfa2},area(id).poly,.036);
  K.zone({name:'반포한강공원',floor:'수변',sub:'세빛섬 · 달빛광장 · 한강남자전거길',poly:park,y0:-2,y1:8});
  const parkPaths=[];
  // Reserve the bridge approaches before planting. The park uses a flat datum,
  // so this bank profile and the two side approaches are modeling estimates.
  const accessA=[-614,-710],accessB=[-694.02,-920.79],bankDeckY=.1;
  const accessL=Math.hypot(accessB[0]-accessA[0],accessB[1]-accessA[1]);
  const accessU=[(accessB[0]-accessA[0])/accessL,(accessB[1]-accessA[1])/accessL],accessN=[-accessU[1],accessU[0]];
  const accessPoint=(s,off=0)=>[accessA[0]+accessU[0]*s+accessN[0]*off,accessA[1]+accessU[1]*s+accessN[1]*off];
  for(const id of PATHS) {
    const r=K.osm.roads.find(r=>r.id===id);if(!r)continue;
    for(let i=1;i<r.pts.length;i++) {
      const a=r.pts[i-1],b=r.pts[i],m=[(a[0]+b[0])/2,(a[1]+b[1])/2];
      if(!K.pointInPoly(...m,park))continue; // island connections use their exact pier polygons below
      const cycle=r.hw==='cycleway',w=cycle?4.2:Math.max(3.2,r.width||3.2);
      strip(a,b,w,.065,cycle?{tex:'asphalt',color:0xaaa39d}:'sidewalk');parkPaths.push([a,b,w]);
      if(cycle) {
        const L=Math.hypot(b[0]-a[0],b[1]-a[1]);
        for(let s=0;s<L-2;s+=6)strip([a[0]+(b[0]-a[0])*s/L,a[1]+(b[1]-a[1])*s/L],[a[0]+(b[0]-a[0])*(s+2)/L,a[1]+(b[1]-a[1])*(s+2)/L],.1,.071,0xf5e5aa);
      }
    }
  }
  // The edited short does not establish the exact stair-to-river alignment.
  // Keep the shared west-tunnel landing and tie it into the mapped park paths,
  // via the existing service-access apron, rather than moving an island inland.
  const westArrival=[[-592,-625],[-605.62,-619.73],[-613.23,-614.19],[-617.45,-620.59]];
  for(let i=1;i<westArrival.length;i++){
    strip(westArrival[i-1],westArrival[i],3.2,.065,'sidewalk');
    parkPaths.push([westArrival[i-1],westArrival[i],3.2]);
  }
  sign(['세빛섬 · 반포한강공원','강변 산책로 ←'],-611,2,-623,4.8,.9,.9);
  sign(['원베일리 공공보행통로','고투몰 G2 방면 →'],-620,2,-623,4.8,.9,.9);
  // Open lawns, rather than a uniform forest. Keep trees off OSM paths and gathering spaces.
  for(let n=0,g=0;n<155&&g<5000;g++) {
    const x=-1110+rnd()*990,z=-1010+rnd()*570;
    if(x>-742&&x<-668&&z>-756&&z<-704)continue; // hTk_1900 winter-tree pocket, rebuilt bare below
    if(facilityPolys.some(p=>K.pointInPoly(x,z,p)||p.some((a,i)=>distSeg(x,z,a,p[(i+1)%p.length])<5))||!inside([x,z],park,9)||parkPaths.some(([a,b,w])=>distSeg(x,z,a,b)<w/2+4)||distSeg(x,z,accessA,accessPoint(90))<25||Math.hypot(x+628,z+707)<65||ISLETS.some(id=>K.pointInPoly(x,z,area(id).poly)))continue;
    K.tree(x,z,{h:4.5+rnd()*3.7,kind:n%4===0?'ginkgo':'zelkova'});n++;
    if(n%4===0){bench(x+3,z+2);lamp(x-3,z+2);}
  }
  // 달빛광장: an open paved oval, low seat walls and riverside viewing terraces.
  const plaza=[];for(let i=0;i<64;i++){const a=i/64*Math.PI*2;plaza.push([-629+Math.cos(a)*42,-707+Math.sin(a)*45]);}
  K.slab(plaza,.09,{mat:'hangang_ochre_paving',thick:.15,ceil:false});
  // hTk_1900 is west of the bridge on the shoreline path, not under its deck.
  strip([-735,-741],[-677,-774],7,.065,'hangang_grey_pavers');
  // HG-L5: the south-facing winter view has a stone bank and an open pilotis building.
  K.ramp(-700,-744,-694,-729,{w:23,ya:.065,yb:1.85,mat:'hangang_flagstones',rails:false});
  strip([-706,-749],[-680,-755],5,.07,'hangang_grey_pavers');
  K.hpoly(0x9b917e,[[-760,-744],[-706,-775],[-666,-742],[-668,-700],[-748,-693]],.048);
  const winterBuilding=rect(-697,-716,-672,-704);
  K.slab(winterBuilding,4,{mat:0x8a8c8e,under:0x8a8c8e,thick:.25});
  K.polyWalls(winterBuilding,4,8,{mat:0x8a8c8e,thick:.18});
  K.slab(winterBuilding,8,{mat:0x939596,thick:.23});
  for(const x of[-695,-684,-674])for(const z of[-714,-706])box(x,0,z,.55,4,.55,0x8a8c8e,true);
  for(const x of[-692,-684,-676])box(x,5,-716.11,4.7,1.9,.025,{tex:'glass',color:0x6c7c80});
  K.detail({name:'달빛광장 남측 겨울 나무',floor:'수변',y0:0,y1:8,rect:[-714,-751,-668,-710]},K=>{
    for(const [x,z] of[[-709,-733],[-703,-719],[-671,-738],[-685,-748]]){
      rod3([x,0,z],[x,6.6,z],.12,0x645b50);
      for(let j=0;j<8;j++){
        const a=j*.785,q=[x+Math.cos(a)*1.8,4.7+(j%3)*.7,z+Math.sin(a)*1.8];
        rod3([x,3+j*.3,z],q,.04,0x645b50);rod3(q,[q[0]+Math.cos(a)*.9,q[1]+1.1,q[2]+Math.sin(a)*.8],.016,0x645b50);
      }
    }
  });
  K.detail({name:'달빛광장 서측 · 겨울 산책길',floor:'수변',y0:0,y1:5,rect:[-742,-790,-670,-730]},K=>{
    for(let j=0;j<4;j++){
      const x=-732+j*7,z=-750-j*6;
      rod3([x,0,z],[x,6.2,z],.1,0x5a4d3f);
      for(let a=0;a<6;a++){
        const t=a*1.047,q=[x+Math.sin(t)*1.7,4.6+(a%3)*.48,z+Math.cos(t)*1.7];
        rod3([x,3.2+a*.3,z],q,.04,0x5a4d3f);
        rod3(q,[q[0]+Math.sin(t)*.9,q[1]+1.3,q[2]+Math.cos(t)*.8],.018,0x63594c);
      }
      for(let a=0;a<5;a++)box(x-2.1+a*.9,.05,z-2,.8,.4+(a%3)*.25,1.1,[0xa59e90,0x96958b,0xb6ad9d][a%3]);
    }
    lamp(-716,-743);lamp(-687,-763);
    visitor(-699,.065,-750,0,2.9);visitor(-700,.065,-749.5,1,2.6);visitor(-720,.065,-744,2,.5);
  });
  // Viewing steps follow the actual OSM bank, north of the inland plaza POI.
  for(let j=0;j<4;j++) {
    const a=[-670+j*1.25,-817+j*2.5],b=[-605+j*1.25,-849+j*2.5];
    const p=[a,b,[b[0]+1.25,b[1]+2.5],[a[0]+1.25,a[1]+2.5]];
    K.slab(p,j*.28,{mat:{tex:'concrete',color:0xc6c4b8},thick:.29,ceil:false});
  }
  K.stairs(-601,-849,-596,-839,{w:4,ya:0,yb:.84,mat:'concrete',rails:false});
  strip([-629,-744],[-629,-822],4,.07,'sidewalk');
  sign('달빛광장',-627,2.8,-690,8,1.15);
  sign(['달빛무지개분수','양측 1,140m · 노즐 380개'], -649,1.7,-739,5.7,1.5);
  K.zone({name:'달빛광장',floor:'수변',sub:'달빛무지개분수 관람 · 잔디마당',poly:plaza,y0:-1,y1:6,priority:3});
  K.crowd(rect(-646,-744,-616,-715),.09,28,{seed:15});
  for(let x=-656;x<-604;x+=8){bench(x,-688);lamp(x,-684);}
  // Facility positions below are plausible park-layout reconstructions: the
  // research confirms the names, but not surveyed playground/tent/taxi locations.
  const play=[];for(let i=0;i<32;i++){const a=i*Math.PI/16;play.push([-468+Math.cos(a)*17,-832+Math.sin(a)*13]);}
  K.hpoly(0x9bbaa9,play,.075);sign('물방울놀이터',-468,2.2,-818,6,.8);
  for(let i=0;i<7;i++)K.dome({x:-480+i*4,y:.075,z:-836+Math.sin(i)*4,rx:1.1,ry:.4,rz:1.1,mat:[0xdbb963,0x739dba,0xcc917c][i%3],seg:14,rings:5});
  box(-468,.075,-831,3,1.2,3,0xc5ac7f,true);
  K.stairs(-468,-825,-468,-829.5,{w:1.8,ya:.075,yb:1.275,mat:0xadc6b2});
  K.ramp(-469.5,-831,-475,-831,{w:1.2,ya:1.275,yb:.075,mat:0xb5d7d9,rails:true});
  for(let i=0;i<5;i++) {
    const x=-777+(i%3)*10,z=-641+Math.floor(i/3)*10;
    K.quad([0xb9aa85,0x789c96,0xd0b2a2][i%3],[[x-1.7,.06,z-1.7],[x+1.7,.06,z-1.7],[x+1.7,1.8,z],[x-1.7,1.8,z]],[0,1,-1]);
    K.quad([0xb9aa85,0x789c96,0xd0b2a2][i%3],[[x-1.7,1.8,z],[x+1.7,1.8,z],[x+1.7,.06,z+1.7],[x-1.7,.06,z+1.7]],[0,1,1]);
    box(x,.06,z,3.3,.03,3.3,0x798779);K.person(x+.3,.1,z,{sit:true});
  }
  sign('그늘막 쉼터',-764,2,-624,5,.7);
  sign(['한강달빛야시장','행사 운영 시 개방'], -663,2.4,-692,5.2,1.1);
  for(let i=0;i<3;i++){K.vehicle({x:-667-i*7,z:-679,kind:'truck',rotY:Math.PI/2,color:[0xd9d2be,0x89aaa0,0xbdb3a5][i]});}
  // Picnic blankets, parasols, refill taps and shared bicycles.
  for(let i=0;i<20;i++) {
    const x=-721+(i%5)*12,z=-674+Math.floor(i/5)*10;
    if(!inside([x,z],park,4))continue;
    box(x,.05,z,3.2,.025,2.4,[0xaa8876,0x7e9ba5,0xc5b582][i%3]);
    K.person(x+.7,.08,z,{sit:true,shirt:0xe0b07f});K.person(x-.7,.08,z,{sit:true});
    box(x,.1,z,.5,.35,.4,0xc3a477);
  }
  function bicycle(x,z,rot=0) {
    const frame=0x6db76d;
    for(const dx of [-.52,.52]) {const wheel=new THREE.Mesh(new THREE.TorusGeometry(.32,.035,5,14),new THREE.MeshLambertMaterial({color:0x303c3d}));wheel.position.set(x+dx,.36,z);K.addMesh(wheel);}
    K.wall(x-.5,z,x+.48,z,.5,.55,{mat:frame,thick:.045,solid:false});
    box(x,.56,z,.06,.4,.06,frame);box(x,.96,z,.28,.05,.12,dark);box(x+.48,.62,z,.05,.48,.05,frame);box(x+.48,1.1,z,.08,.05,.45,dark);
  }
  for(let i=0;i<12;i++)bicycle(-285+i*1.1,-800);
  sign('따릉이 · 자전거 대여',-278,2.5,-797,7,.8);
  K.floorText('자전거  천천히',{x:-504,y:.08,z:-688,w:4,h:2,rotY:-.9,fg:'#f8f5e8'});
  for(const [x,z] of [[-681,-692],[-806,-661],[-304,-814]]){K.cyl({x,y:0,z,r:.3,h:.85,mat:metal,seg:10});box(x,.85,z,.55,.08,.4,0xd2dce1);sign('음수대',x,1.7,z,1.5,.35);}

  // 서래섬: real long island outline and winding OSM paths, connected at both ends.
  const sr=area(25979109).poly,srPaths=[];
  K.slab(sr,.015,{mat:{tex:'grass',color:0xc3c69e},thick:.35,ceil:false});
  for(const id of [...SEORAE_PATHS,414267188]) {
    const r=K.osm.roads.find(r=>r.id===id);
    for(let i=1;i<r.pts.length;i++){
      const a=r.pts[i-1],b=r.pts[i];strip(a,b,r.bridge?4.3:2.7,.07,r.bridge?'wood':{tex:'sidewalk',color:0xc1b091});srPaths.push([a,b]);
      if(r.bridge){const L=Math.hypot(b[0]-a[0],b[1]-a[1]),nx=-(b[1]-a[1])/L*2.15,nz=(b[0]-a[0])/L*2.15;for(const s of [-1,1])rail([a[0]+nx*s,a[1]+nz*s],[b[0]+nx*s,b[1]+nz*s],.07);}
    }
  }
  for(let n=0,g=0;n<85&&g<2500;g++) {
    const x=-1605+rnd()*540,z=-495+rnd()*295;
    if(!inside([x,z],sr,4)||srPaths.some(([a,b])=>distSeg(x,z,a,b)<3))continue;
    K.tree(x,z,{h:3.8+rnd()*3.8,kind:n%3?'ginkgo':'zelkova'});n++;
  }
  for(const [x,z] of [[-1500,-273],[-1415,-311],[-1224,-407],[-1144,-432]])bench(x,z);
  sign('서래섬',-1130,2.2,-409,5,1);
  K.zone({name:'서래섬',floor:'산책로',sub:'한강 수변 · 나무그늘 쉼터',poly:sr,y0:0,y1:8,priority:3});

  // OSM island/deck outlines and simple connecting footbridges (도교).
  // The source does not establish whether each connecting bridge floats or is fixed.
  const pierPolys=PIERS.map(id=>area(id).poly);
  for(const id of ISLETS) {
    const p=area(id).poly;
    const bp={305677067:414267182,270550732:320797228,305677071:320797229}[id];
    K.prism(p,-1.2,0,{mat:0x9fa5a2,top:false,solid:true});
    // city.js paints grass over every river hole even when the islet is claimed.
    // A 45mm visual finish covers it; collision and connecting piers remain at y=0.
    K.hpoly('hangang_weathered_deck',p,.045,true,bp?[building(bp).poly]:[]);
    const normals=K.orient(p);
    for(let i=0;i<p.length;i++) {
      const a=p[i],b=p[(i+1)%p.length],m=[(a[0]+b[0])/2,(a[1]+b[1])/2];
      if(!pierPolys.some(q=>q.some((v,j)=>distSeg(...m,v,q[(j+1)%q.length])<5)))rail(a,b,0,true);
      if(i%3===0)box(m[0]+normals[i][0]*.08,-.5,m[1]+normals[i][1]*.08,.25,.16,.25,{tex:'emit',color:0xffd7a2});
    }
  }
  for(let pi=0;pi<pierPolys.length;pi++) {
    const p=pierPolys[pi],id=PIERS[pi];
    if(id===850389028){
      // HG-D2: the filmed main span is a five-metre smooth concrete deck.
      const a=[-827.27,-669.485],b=[-855.25,-724.8],L=Math.hypot(b[0]-a[0],b[1]-a[1]),u=[(b[0]-a[0])/L,(b[1]-a[1])/L],n=[-u[1],u[0]];
      const at=(t,o)=>[a[0]+u[0]*t+n[0]*o,a[1]+u[1]*t+n[1]*o];
      K.ramp(...a,...b,{w:5,ya:0,yb:0,mat:0x948c82,rails:false});
      // The rounded envelope's entrance is behind the old bridge endpoint.
      K.ramp(...b,-861,-729,{w:5,ya:0,yb:0,mat:0x948c82,rails:false});
      // Retain only the real branching landing west of the main span.
      K.slab([[-853.01,-708.97],[-854.72,-704.33],[-864.43,-697.86],[-861.24,-692.81],[-851.41,-699.51],[-847.67,-698.39]],0,{mat:0x948c82,thick:.35});
      K.slab([at(35,-2.5),at(46.85,-2.5),at(46.85,-5.2),at(35,-5.2)],0,{mat:0x948c82,thick:.35});
      for(const side of[-1,1]){
        const spans=side===-1?[[0,35],[46.85,L]]:[[0,L]];
        for(const [lo,hi] of spans){
          rail(at(lo,side*2.5),at(hi,side*2.5),0,false,0x9da6a4);
          for(let t=lo;t<hi;t+=.16){const p=at(t,side*2.5);box(p[0],.15,p[1],.028,.86,.028,0x9da6a4);}
        }
      }
      continue;
    }

    if(id===850389026){
      // hTk_1500: narrow tan deck, dark joints, stainless bars and a chain.
      const a=[-880.4,-780.3],b=[-890.3,-813.2],L=Math.hypot(b[0]-a[0],b[1]-a[1]);
      const ux=(b[0]-a[0])/L,uz=(b[1]-a[1])/L,nx=-uz,nz=ux;
      const at=(s,o=0)=>[a[0]+ux*s+nx*o,a[1]+uz*s+nz*o];
      strip(a,b,3,0,0xc9b597);
      for(const off of[-.72,.72])strip(at(0,off),at(L,off),.10,.012,0x5b5851);
      for(const side of[-1,1]){
        rail(at(0,side*1.5),at(L,side*1.5),0,false,0x8b9090);
        for(let s=.16;s<L;s+=.18){const q=at(s,side*1.5);box(q[0],.13,q[1],.025,.9,.025,0x8b9090);}
      }
      K.detail({name:'솔빛 도교 쇠사슬',floor:'수변',y0:0,y1:3,poly:p},K=>{
        for(let s=0;s<L;s+=2.3){
          const q=at(s,-1.56);box(q[0],0,q[1],.065,1.14,.065,0x919594);
          const end=Math.min(L,s+2.3);
          for(let j=0;j<10;j++){
            const t=j/10,u=(j+1)/10,r=at(s+(end-s)*t,-1.56),v=at(s+(end-s)*u,-1.56);
            rod3([r[0],1.1-.30*Math.sin(t*Math.PI),r[1]],[v[0],1.1-.30*Math.sin(u*Math.PI),v[1]],.018,0x828789);
          }
        }
      });
      continue;
    }
    K.slab(p,0,{mat:'hangang_weathered_deck',thick:.45,under:0x777c78});
    for(let i=0;i<p.length;i++){const a=p[i],b=p[(i+1)%p.length],end=(id===850389024&&(i===0||i===16))||(id===850389028&&i===6);if(!end&&Math.hypot(b[0]-a[0],b[1]-a[1])>9)cableRail(a,b);}
  }
  // hTkViN9S1vg_1340: the main Gavit approach has white stay-cable pylons.
  // Axis/width come from pier 850389028; post height and cable spacing are estimates.
  const ga=[-827.27,-669.485],gb=[-855.25,-724.8],gl=Math.hypot(gb[0]-ga[0],gb[1]-ga[1]);
  const gu=[(gb[0]-ga[0])/gl,(gb[1]-ga[1])/gl],gn=[-gu[1],gu[0]],gat=(s,o)=>[ga[0]+gu[0]*s+gn[0]*o,ga[1]+gu[1]*s+gn[1]*o];
  strip([-819,-654],ga,7,.065,'hangang_ochre_paving',0);
  // HG-C3/D3: shore-side camera, ochre apron and dark waterfront mesh.
  K.slab([[-817,-663],[-824,-656],[-836,-659],[-827,-672],[-819,-675]],.09,{mat:'hangang_shore_ochre',thick:.12,ceil:false});
  const shoreA=[-836,-659],shoreB=[-828.5,-667.5];
  rail(shoreA,shoreB,.09,false,0x5c5f56);
  for(let t=0;t<1;t+=.025)box(shoreA[0]+(shoreB[0]-shoreA[0])*t,.2,shoreA[1]+(shoreB[1]-shoreA[1])*t,.025,.9,.025,0x5c5f56);
  for(const h of[.28,.56,.84])K.wall(...shoreA,...shoreB,h,h+.018,{mat:0x5c5f56,thick:.018,solid:false});
  const lightPole=gat(29,3.4);
  K.cyl({x:lightPole[0],y:0,z:lightPole[1],r:.15,h:18,seg:12,mat:0xe8ece9,solid:false});
  // White C-shaped sculpture in the shore-end arrival, clear of the deck centre.
  const sc=gat(2,3.8);
  for(let j=0;j<20;j++){const a=(.28+j/20*1.44)*Math.PI,b=(.28+(j+1)/20*1.44)*Math.PI;rod3([sc[0]+Math.cos(a)*.7,1.4+Math.sin(a)*1.2,sc[1]],[sc[0]+Math.cos(b)*.7,1.4+Math.sin(b)*1.2,sc[1]],.16,0xe8e9e3);}
  for(const side of [-1,1]){
    const p=gat(24,side*2.45);
    K.cyl({x:p[0],y:0,z:p[1],r:.22,h:4.6,seg:12,mat:0xeef0f2,solid:false});
    for(const s of [6,12,18,34,41,48]){
      const q=gat(s,side*2.45);rod3([p[0],4.35,p[1]],[q[0],.75,q[1]],.055,0xdde2dd);
    }
  }
  // F9MdeqY0Rro_21: flags and small white duck boats beside the approach.
  // The edited frame establishes the relationship, not their surveyed berth.
  for(const [i,s] of [3,9,15].entries()){
    const p=gat(-7+i*2,3.8);box(p[0],0,p[1],.065,4.1,.065,0xb5bdb8);
    K.sign(['세빛섬','한강의 빛'],{x:p[0],y:2.65,z:p[1],w:.58,h:2.3,rotY:Math.atan2(gu[0],gu[1]),bg:['#e9dfb6','#abcaa2','#ecece1'][i],fg:'#425e57',twoSided:true,box:false});
  }
  const dockA=[-846,-683],dockB=[-856,-713];
  K.wall(...dockA,...dockB,-.65,-.36,{thick:1.1,mat:{tex:'wood',color:0xaaa69a},solid:false});
  for(let i=0;i<8;i++){
    const x=-849-i*1.2,z=-684-i*3.5,rot=-.48;
    K.dome({x,y:-.65,z,rx:1.05,ry:.4,rz:1.65,mat:0xeeeae1,seg:16,rings:6});
    box(x,-.26,z,1.2,.2,1.3,0xc67b70,false,rot);
    for(const dx of [-.37,.37])box(x+dx,-.06,z+.2,.48,.25,.72,0xd4c7ab,false,rot);
    K.cyl({x:x-.55,y:-.17,z:z-1.1,r:.16,h:1.15,seg:10,mat:0xf1ede4,solid:false});
    K.dome({x:x-.55,y:.8,z:z-1.25,rx:.28,ry:.3,rz:.35,mat:0xf1ede4,seg:12,rings:6});
    box(x-.55,.83,z-1.6,.19,.13,.31,0xda9a43,false,rot);
    for(const side of [-1,1])box(x-.55+side*.235,1,z-1.35,.035,.055,.065,0x263c40);
  }
  K.detail({name:'세빛섬 도교 방문객',floor:'수변',y0:0,y1:5,rect:[-868,-729,-820,-659]},K=>{
    for(let j=0;j<9;j++){
      const s=[4,5.3,19,20.4,35,36.2,44,46,51][j],p=gat(s,j%3===0?1.55:-1.25);
      visitor(p[0],0,p[1],j,j%2?.45:3.5);
    }
  });
  // Building shells: glazing follows the OSM polygon, with closely spaced silver ribs.
  const ledMats=[];
  function shell(poly,heights,top,name,entry,ledColor) {
    const door=nearestEdge(poly,...entry);
    K.polyWalls(poly,0,top,{mat:{tex:'glass',color:name==='가빛섬'?0x6aa996:0x87b5c9},thick:.035,openings:[{edge:door.edge,at:door.at,w:Math.min(5.8,Math.hypot(poly[(door.edge+1)%poly.length][0]-poly[door.edge][0],poly[(door.edge+1)%poly.length][1]-poly[door.edge][1])-.3),y0:0,y1:3.5}]});
    const glow=new THREE.MeshBasicMaterial({color:ledColor,transparent:true,opacity:.12,depthWrite:false});
    const ledKey=K.material('hangang-led-'+name,glow);ledMats.push(glow);
    const ns=K.orient(poly);
    poly.forEach((a,i)=>{
      const b=poly[(i+1)%poly.length],L=Math.hypot(b[0]-a[0],b[1]-a[1]),N=Math.ceil(L/2.35);
      for(let j=0;j<N;j++) {
        const t=j/N,x=a[0]+(b[0]-a[0])*t,z=a[1]+(b[1]-a[1])*t;
        if(i===door.edge&&Math.abs(t*L-door.at)<3)continue;
        box(x,0,z,.13,top,.13,metal);
        box(x+ns[i][0]*.1,.15,z+ns[i][1]*.1,.045,top-.2,.045,ledKey);
      }
      for(const y of [...heights,top])K.wall(...a,...b,y+.02,y+.19,{mat:metal,thick:.19,solid:false});
    });
    sign(name,door.x,4.1,door.z,8,1.2,door.rot,'#274956');
    box(door.x,3.45,door.z,7,.15,2.7,metal,false,door.rot);
    return door;
  }
  function core(cx,cz,ys,names,poly) {
    // Two parallel flights and a full-width far landing. Holes include head clearance.
    const hole=rect(cx-4.1,cz-10,cx+4.1,cz+10);
    for(let i=0;i<ys.length;i++) {
      K.slab(poly,ys[i],{mat:i===ys.length-1?'wood':'marble',holes:i?[hole]:[],thick:.28});
      if(i===0)K.hpoly('marble',poly,.045); // cover city river-hole grass without changing floor datum
      if(i) {
        // close the near landing, keeping both flight ends open to the corridor
        K.slab(rect(cx-4.1,cz+7.5,cx+4.1,cz+10),ys[i],{mat:'tile',thick:.18});
        rail([cx-4.1,cz-10],[cx-4.1,cz+7.4],ys[i],true);
        rail([cx+4.1,cz-10],[cx+4.1,cz+7.4],ys[i],true);
      }
      if(i<ys.length-1) {
        const a=ys[i],b=ys[i+1],m=(a+b)/2;
        K.stairs(cx-2,cz+7.5,cx-2,cz-7.5,{w:3.6,ya:a,yb:m,mat:'darkstone'});
        K.slab(rect(cx-4,cz-10,cx+4,cz-7.5),m,{mat:'tile',thick:.2});
        K.stairs(cx+2,cz-7.5,cx+2,cz+7.5,{w:3.6,ya:m,yb:b,mat:'darkstone'});
      }
      sign(['계단 · 승강기',names[i]],cx,ys[i]+2.2,cz+10.7,5,.8);
    }
    const ex=cx+7.1,ez=cz+4;
    lift({name:'세빛섬 '+names[0]+' 승강기',x:ex,z:ez,w:2.6,d:2.6,floors:ys.map((y,i)=>({label:(i+1)+'층',y,name:names[i]})),mat:0xaebbc1});
    return {hole,avoid:(x,z)=> (x>cx-5&&x<cx+9&&z>cz-11&&z<cz+12)||(x>cx-3&&x<cx+16&&z>cz+7&&z<cz+21)};
  }
  function roomLights(poly,y,spacing=7,avoid=()=>false) {
    const b=K.polyBBox(poly);
    for(let x=b[0]+4;x<b[2]-3;x+=spacing)for(let z=b[1]+4;z<b[3]-3;z+=spacing)if(inside([x,z],poly,1.3)&&!avoid(x,z))box(x,y,z,1.6,.04,.5,{tex:'emit',color:0xffeed2});
  }
  function columns(poly,ys,excluded) {
    const b=K.polyBBox(poly);
    for(let x=b[0]+7;x<b[2]-4;x+=10)for(let z=b[1]+7;z<b[3]-4;z+=11)if(inside([x,z],poly,2)&&!excluded(x,z))K.cyl({x,y:0,z,r:.26,h:ys[ys.length-1],mat:0xced7d7,seg:10});
  }
  function furnishGrid(poly,y,avoid,kind,spacing=4.7) {
    const b=K.polyBBox(poly);let n=0;
    for(let z=b[1]+4;z<b[3]-3;z+=spacing)for(let x=b[0]+4;x<b[2]-3;x+=spacing) {
      if(!inside([x,z],poly,2.3)||avoid(x,z))continue;
      table(x,y,z,kind);if(n++%4===0)K.person(x+.9,y,z+.6,{sit:true});
    }
  }
  // Furniture families deliberately differ: cafe, theatre, restaurant, pub and gallery.
  function sofa(x,y,z,w=3,rot=0) {
    box(x,y+.18,z,w,.3,.9,0x456466,true,rot);
    box(x+Math.sin(rot)*.38,y+.48,z+Math.cos(rot)*.38,w,.55,.17,0x456466,false,rot);
    for(const d of [-1,1])box(x+Math.cos(rot)*d*(w/2-.12),y+.35,z-Math.sin(rot)*d*(w/2-.12),.2,.45,.95,0x456466,false,rot);
  }
  function coffeeTable(x,y,z,w=1.4) {
    box(x,y+.39,z,w,.08,.75,0xb79063,true);box(x,y,z,.65,.39,.45,dark);
    box(x+.2,y+.48,z,.25,.04,.34,0xede7d5);
  }
  function booth(x,y,z,rot=0) {
    for(const side of [-1,1])sofa(x+Math.cos(rot)*side*1.15,y,z-Math.sin(rot)*side*1.15,2.2,rot+side*Math.PI/2);
    box(x,y+.74,z,1.3,.09,1.8,'wood',true,rot);
    for(const d of [-.55,.55])K.cyl({x:x+Math.sin(rot)*d,y:y+.84,z:z+Math.cos(rot)*d,r:.16,h:.025,seg:8,mat:0xf0eee7,solid:false});
  }
  function artPanel(x,y,z,w,h,rot=0,index=0) {
    box(x,y,z,w,h,.12,0xeee9df,true,rot);
    const sin=Math.sin(rot),cos=Math.cos(rot);
    for(let i=0;i<5;i++) {
      const dx=(i-2)*w*.14;
      box(x+cos*dx+sin*.075,y+h*.22,z-sin*dx+cos*.075,w*.1,h*(.28+(i+index)%3*.12),.025,[0x376a80,0xd1ac6d,0x86a8a0][(i+index)%3],false,rot);
    }
  }

  const gp=building(414267182).poly,gy=[0,5,18,23];
  const gc=core(-873,-746,gy,['가빛섬 · 이솔라 · 카페돌체','FIC 컨벤션홀','비스타 레스토랑','비스타 루프탑'],gp);
  // HG-L3: the OSM outline has staircase-like vertices, while the filmed
  // envelope has rounded ends and glazing rolling inward into its crown.
  // Keep the existing floor/core polygons and all furnishings behind this skin.
  const hullPoints=gp.slice().sort((a,b)=>a[0]-b[0]||a[1]-b[1]);
  const cross=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
  const hullHalf=points=>{const h=[];for(const p of points){while(h.length>1&&cross(h.at(-2),h.at(-1),p)<=0)h.pop();h.push(p);}return h;};
  const hullA=hullHalf(hullPoints),hullB=hullHalf(hullPoints.slice().reverse());
  const hull=hullA.slice(0,-1).concat(hullB.slice(0,-1));
  const gCenter=[-880.5,-736],gCurve=new THREE.CatmullRomCurve3(hull.map(p=>new THREE.Vector3(gCenter[0]+(p[0]-gCenter[0])*1.018,0,gCenter[1]+(p[1]-gCenter[1])*1.018)),true,'centripetal');
  const gSkin=Array.from({length:112},(_,i)=>{const p=gCurve.getPoint(i/112);return[p.x,p.z];});
  const gNormals=K.orient(gSkin),gDoor=nearestEdge(gSkin,-855.25,-724.8);
  const gGlass=K.material('hangang_gavit_clear',new THREE.MeshLambertMaterial({color:0x80b5ac,transparent:true,opacity:.23,side:THREE.DoubleSide,depthWrite:false}));
  const gGlow=new THREE.MeshBasicMaterial({color:0xffcf75,transparent:true,opacity:.12,depthWrite:false});
  const gLed=K.material('hangang-led-가빛섬',gGlow);ledMats.push(gGlow);
  K.slab(gSkin,0,{mat:0xb4b8b2,thick:.18});
  for(let i=0;i<gSkin.length;i++){
    const a=gSkin[i],b=gSkin[(i+1)%gSkin.length],n=gNormals[i],door=Math.hypot((a[0]+b[0])/2-gDoor.x,(a[1]+b[1])/2-gDoor.z)<3.6;
    K.wall(...a,...b,door?3.6:0,21,{mat:gGlass,thick:.025});
    if(!door)rod3([a[0],0,a[1]],[a[0],21,a[1]],.045,0x9eafad);
    for(const y of[5,10.6,16.3,21])rod3([a[0],y,a[1]],[b[0],y,b[1]],.045,0xa5b5b3);
    if(i%4===0&&!door)box(a[0]-n[0]*.06,.35,a[1]-n[1]*.06,.035,20,.035,gLed);
    // Six-metre high quarter-ellipse: almost vertical at 21m and a soft roof
    // turn at 27m. The existing 23m terrace remains below the curved crown.
    for(let j=0;j<10;j++){
      const crown=(p,normal,t)=>[p[0]-normal[0]*3.5*(1-Math.cos(t*Math.PI/2)),21+6*Math.sin(t*Math.PI/2),p[1]-normal[1]*3.5*(1-Math.cos(t*Math.PI/2))];
      const t=j/10,u=(j+1)/10,nn=gNormals[(i+1)%gSkin.length],a0=crown(a,n,t),a1=crown(a,n,u),b0=crown(b,nn,t),b1=crown(b,nn,u);
      K.quad(gGlass,[a0,b0,b1,a1],[n[0],t,n[1]]);
      rod3(a0,a1,.045,0xa5b5b3);
      if(j%2===1)rod3(a1,b1,.045,0xa5b5b3);
    }
  }
  sign('가빛섬',gDoor.x,4.2,gDoor.z,7,.85,gDoor.rot,'#274956');
  const arch=t=>[-860+7*Math.sin(t*Math.PI),23.1+5.6*Math.sin(t*Math.PI),-769+44*t];
  for(let i=0;i<36;i++)rod3(arch(i/36),arch((i+1)/36),.30,0xeef0f2);
  // The rotated hall fits the broad southwest wing and leaves the existing core accessible.
  const hr=-.30,hc=Math.cos(hr),hs=Math.sin(hr);
  const hp=(x,z)=>[-888+x*hc+z*hs,-746-x*hs+z*hc];
  const hallPoly=[hp(-10,0),hp(10,0),hp(10,41),hp(-10,41)];
  const hallAt=(x,z,pad=0)=>{const dx=x+888,dz=z+746,u=dx*hc-dz*hs,v=dx*hs+dz*hc;return Math.abs(u)<10+pad&&v>-pad&&v<41+pad;};
  const hb=(x,y,z,w,h,d,mat,solid=false)=>{const p=hp(x,z);box(p[0],y,p[1],w,h,d,mat,solid,hr);};
  const hsign=(text,x,y,z,w,h,bg='#20343e',fg='#f6e7cb')=>{const p=hp(x,z);sign(text,p[0],y,p[1],w,h,hr,bg,fg);};
  columns(gp,gy,(x,z)=>gc.avoid(x,z)||hallAt(x,z,1));
  for(let i=0;i<4;i++)K.zone({name:'가빛섬',floor:(i+1)+'층',sub:['이솔라 · 카페돌체 · 튜브스터 접수 · 편의점','FIC 컨벤션홀 · 기업연회','비스타 레스토랑','비스타 루프탑 · 한강 전망'][i],poly:gp,y0:gy[i],y1:i<3?gy[i+1]-.15:28,priority:6});

  // 1F: cafe service, bakery display, lounge clusters and a marina reception.
  roomLights(gp,4.65,8,gc.avoid);
  K.wall(-900,-722,-883,-722,0,3.6,{mat:0xe5ddd0,thick:.18,openings:[{at:13,w:3,y1:3.2}]});
  sign('카페돌체',-894,2.8,-721.8,7,.85,0,'#57756c');
  box(-895,0,-718,8,.95,1.3,'wood',true);box(-895,.95,-718,8.2,.09,1.5,0xe6e0d3);
  box(-897,1.04,-718,2.4,.65,.8,'glass');
  for(let i=0;i<6;i++)K.dome({x:-898+i*.36,y:1.08,z:-717.9,rx:.13,ry:.09,rz:.16,seg:8,rings:3,mat:0xc49558});
  box(-892,1.04,-718,1,.55,.65,metal);box(-892,1.6,-718,.85,.08,.6,dark);
  sign(['카페돌체','커피 · 음료 · 디저트'], -895,2.65,-722.1,5,1);
  for(const [x,z]of [[-900,-710],[-893,-709],[-901,-726],[-889,-728],[-891,-737]]) {
    sofa(x,0,z,3);coffeeTable(x,0,z-1.5);K.person(x,0,z,{sit:true});
  }
  for(const [x,z]of [[-897,-733],[-889,-716],[-884,-724]])table(x,0,z);
  box(-859,0,-744,1.3,1.05,7,'wood',true);
  sign(['튜브스터 접수','골든블루마리나 · 수상레저 안내'], -858.3,2.6,-744,7,1.1,Math.PI/2);
  for(let i=0;i<5;i++){box(-857.8,.25,-749+i*1.1,.6,1,.12,0xe59949);box(-857.8,.5,-749+i*1.1,.2,.5,.16,0x263b44);}
  sign('GS25',-894,2.5,-704,4,1,0,'#0873b7');shelf(-901,0,-704,3.2);
  box(-895,0,-704,2.2,.95,.8,0x9cbab7,true);
  for(const [x,z]of [[-898,-741],[-860,-756]])planter(x,z,0,1.5);
  // Current operator guide lists Isola on 1F. Preserve existing cafe/marina
  // furnishings; this ground-floor dining corner is an inferred partition.
  sign('이솔라',-870,2.8,-763,5,.85,0,'#d9c4a2','#3d423a');
  for(const [x,z]of [[-867,-764],[-879,-764]])table(x,0,z);

  // 2F: 28 rows × (8 + 9 + 8) = 700 theatre seats; cross and longitudinal aisles.
  K.slab(hallPoly,5.012,{mat:{tex:'carpet',color:0x637780},thick:.008,ceil:false});
  K.polyWalls(hallPoly,5,8.3,{mat:0xa4aaa4,inner:0xd9cab4,thick:.16,openings:[
    {edge:1,at:15,w:2.6,y0:5,y1:8.2},{edge:1,at:39,w:3,y0:5,y1:8.2},
    {edge:2,at:10,w:3,y0:5,y1:8.2},
  ]});
  // A low enclosed hall wall and clear clerestory preserve the room without
  // the former 13m-high beige block obscuring the horizontal floor plates.
  K.polyWalls(hallPoly,8.3,17.7,{mat:gGlass,thick:.04});
  hallPoly.forEach((a,i)=>{const b=hallPoly[(i+1)%hallPoly.length],L=Math.hypot(b[0]-a[0],b[1]-a[1]);for(let s=0;s<L;s+=3.5){const x=a[0]+(b[0]-a[0])*s/L,z=a[1]+(b[1]-a[1])*s/L;box(x,8.3,z,.06,9.4,.06,0xa7afac);}});
  hb(0,5,3.2,16,.45,4.8,0x76604c,true);
  const sa=hp(8.3,7.2),sb=hp(8.3,2.7);
  K.ramp(...sa,...sb,{w:1.8,ya:5,yb:5.45,mat:'wood',rails:false});
  for(const side of [-1,1])for(let i=0;i<12;i++)hb(side*(7.1+i*.22),5.45,.5,.16,9.4,.4,i%2?0x253c4e:0x344c60);
  hb(0,8,.6,12.8,4.9,.25,0x152a3d);
  hsign(['FIC 컨벤션홀','세빛섬 · 한강 위의 만남'],0,10.4,.77,11.5,3.8,'#15394c','#f7e9ce');
  hb(-5.5,5.45,4.1,.9,1.12,.65,0xd1c1a7,true);
  hb(-5.5,6.57,4.1,1.05,.08,.75,dark);
  for(const x of [-7.2,7.2])hb(x,5.45,2.4,.8,1.7,.7,0x27313b);
  const seatXs=[...Array.from({length:8},(_,i)=>-8.05+i*.56),...Array.from({length:9},(_,i)=>-2.24+i*.56),...Array.from({length:8},(_,i)=>4.13+i*.56)];
  for(let row=0;row<28;row++) {
    const z=8+row*1.04+(row>=14?1.4:0);
    for(let seat=0;seat<25;seat++) {
      const x=seatXs[seat],p=hp(x,z);
      // Linked upholstered seats use a shared support, keeping 700 chairs within budget.
      hb(x,5.43,z,.47,.1,.48,0x3f6072,true);hb(x,5.53,z+.21,.47,.5,.075,0x476e81);
      hb(x,5.05,z,.1,.38,.28,dark);
      if(row%5===0&&seat%6===1)K.person(p[0],5.05,p[1],{sit:true,rotY:hr});
    }
    hsign((row+1)+'열',-9.4,5.95,z,.55,.3);
  }
  for(const x of [-3.16,3.16]) {
    hb(x,5.025,23.2,1.25,.012,33,0xa99470);
    for(let z=8;z<39;z+=3)hb(x,5.04,z,.07,.02,.28,{tex:'emit',color:0xe5c891});
  }
  for(const z of [9,19,29,38]) {
    hb(0,16.5,z,19,.18,.3,metal);
    for(const x of [-7,-3,3,7])hb(x,16.25,z,1.9,.06,.6,{tex:'emit',color:0xf5deaf});
    for(const side of [-1,1])hb(side*9.8,7,z,.18,7,.8,0xa18b6c);
  }
  hsign('FIC 컨벤션홀 · 기업연회',0,8.7,40.85,11,1.1);
  K.zone({name:'FIC 컨벤션홀',floor:'가빛섬 2층',sub:'무대 · 중앙통로 · 연회 로비',poly:hallPoly,y0:5,y1:17.85,priority:8});
  roomLights(gp,17.65,8,(x,z)=>gc.avoid(x,z)||hallAt(x,z));
  box(-861,5,-740,4,.98,1.2,'wood',true);sign('FIC 컨벤션홀 · 접수',-861,7.7,-740,6,.75);
  for(const z of [-758,-752]){sofa(-857,5,z,3,Math.PI/2);coffeeTable(-859,5,z);}
  const entry=hp(10.15,15);sign('FIC 컨벤션홀',entry[0],8,entry[1],5,.8,hr+Math.PI/2);

  // 3F: Vista restaurant, a long bar and lounge. Existing furniture is retained.
  roomLights(gp,22.6,9,gc.avoid);
  K.slab([[-895,-747],[-879,-741],[-887,-713],[-907,-721]],18.012,{mat:{tex:'wood',color:0xa77b51},thick:.008,ceil:false});
  K.wall(-882,-759,-854,-759,18,22.6,{mat:0xcfc0a4,thick:.16,openings:[{at:23,w:3,y0:18,y1:21.2}]});
  sign('비스타 레스토랑',-863,20.8,-758.8,6,.85,0,'#d9c4a2','#3d423a');
  for(const [x,z]of [[-863,-765],[-874,-765],[-859,-753]])table(x,18,z);
  booth(-884,18,-753,.3);booth(-894,18,-741,.3);
  box(-889,18,-731,9,1.05,1.4,'wood',true);box(-889,19.05,-731,9.3,.12,1.6,0x253c3c);
  K.wall(-895,-734,-883,-734,18,22.2,{mat:0x52605a,thick:.18});
  sign('비스타',-889,21,-733.8,6,.85,0,'#374a46','#e7d6a9');
  for(let tier=0;tier<3;tier++) {
    box(-889,19.3+tier*.65,-733.6,8,.06,.4,0xae946e);
    for(let j=0;j<17;j++)K.cyl({x:-892.6+j*.45,y:19.36+tier*.65,z:-733.6,r:.065,h:.3+(j%3)*.05,seg:6,mat:[0x345e4a,0x876532,0xbcb98f][j%3],solid:false});
  }
  for(let i=0;i<7;i++){const x=-892.6+i*1.2;K.cyl({x,y:18,z:-729.4,r:.06,h:.76,seg:6,mat:dark,solid:false});K.cyl({x,y:18.76,z:-729.4,r:.27,h:.1,seg:10,mat:0x977a52,solid:false});}
  for(const [x,z]of [[-901,-724],[-897,-714],[-902,-706],[-884,-719]]){sofa(x,18,z,3.5);coffeeTable(x,18,z-1.5,1.8);}
  for(const [x,z]of [[-900,-733],[-889,-707],[-856,-743]])table(x,18,z);
  for(const [x,z]of [[-901,-719],[-889,-745],[-857,-736]])planter(x,z,18,1.6);
  for(const [x,z]of [[-892,-722],[-884,-739],[-898,-711]]) {
    K.slab(rect(x-2.8,z-2.5,x+2.8,z+2),18.025,{mat:{tex:'carpet',color:0x7e8f86},thick:.01,ceil:false});
    sofa(x-1.9,18,z,3,Math.PI/2);sofa(x+1.9,18,z,3,-Math.PI/2);coffeeTable(x,18,z,1.7);
    K.person(x-1.9,18,z,{sit:true});
  }
  for(const [x,z]of [[-881,-726],[-898,-726],[-892,-714]]) {
    K.cyl({x,y:18,z,r:.08,h:1.02,mat:dark,seg:6,solid:false});
    K.cyl({x,y:19.02,z,r:.62,h:.08,mat:0xb28d5c,seg:12,solid:false});
    for(const dx of [-1,1])chair(x+dx,18,z,dx*Math.PI/2,0x937d5e);
  }
  for(const [x,z]of [[-899,-716],[-887,-724],[-887,-740]])planter(x,z,18,1.1);
  // Slatted ceiling islands and warm pendants make the pub read as a separate room.
  for(let i=0;i<11;i++)box(-889+i*.8,22.15,-726,.1,.24,15,0xb69b74);
  for(const x of [-893,-889,-885]){K.cyl({x,y:20.9,z:-731,r:.022,h:1.4,seg:6,mat:dark,solid:false});K.dome({x,y:20.6,z:-731,rx:.4,ry:.3,rz:.4,mat:0xc1a378,seg:12,rings:4});box(x,20.59,-731,.35,.03,.35,'emit');}
  K.zone({name:'비스타',floor:'가빛섬 3층',sub:'펍 · 창가 라운지',poly:[[-904,-742],[-878,-732],[-887,-702],[-911,-710]],y0:18,y1:22.85,priority:7});

  // Rooftop viewing terrace and retained petal canopies, silhouette to 27m.
  gp.forEach((a,i)=>rail(a,gp[(i+1)%gp.length],23,true));
  furnishGrid(gp,23,(x,z)=>gc.avoid(x,z)||x>-884||z<-751,'dining',7.5);
  for(const [x,z]of [[-899,-740],[-884,-714],[-861,-761]])planter(x,z,23,2.6);
  for(const [x,z,rx,rz]of [[-897,-747,7,14],[-887,-720,7,9],[-859,-758,5,9]])K.dome({x,y:23.6,z,rx,ry:3.4,rz,mat:{tex:'glass',color:0xc3d9df},seg:24,rings:6});
  sign('4층 비스타 루프탑 · 한강 전망',-884,25,-727,10,.8);
  sign('튜브스터',-857,2.1,-704,4.8,.8);sign('골든블루마리나',-917,2.2,-718,6,.8,Math.PI/2);
  for(let i=0;i<5;i++) {
    const x=-913-i*3,z=-686-i*2;
    K.cyl({x,y:-.85,z,r:1.55,h:.43,seg:24,mat:[0xecc957,0xd87654,0xf0ede0][i%3],solid:false});
    K.cyl({x,y:-.4,z,r:.7,h:.1,seg:16,mat:0xb38b61,solid:false});
    K.cyl({x,y:-.3,z,r:.04,h:2,seg:6,mat:metal,solid:false});
    K.dome({x,y:1.5,z,rx:1.4,ry:.45,rz:1.4,mat:0xf2e7cc,seg:12,rings:3});
  }

  // 2024 Seoul report: 채빛 1F 비어가든, 2F 채빛퀴진. The retained third-floor
  // banquet partitions, stage, furnishings and terrace seating positions are estimates.
  const cp=building(320797228).poly,cy=[0,7,14];
  const cc=core(-793,-819,cy,['비어가든 · 한강 테라스','채빛퀴진 · 뷔페','채빛섬 · 연회실'],cp);
  shell(cp,cy,19,'채빛섬',[-777,-804],0x599ee8);columns(cp,[0,19],cc.avoid);
  K.slab(cp,19,{mat:'roofgravel',thick:.3});
  for(let i=0;i<3;i++) {
    K.zone({name:'채빛섬',floor:(i+1)+'층',sub:['비어가든 · 한강 테라스','채빛퀴진 · 뷔페 다이닝','채빛섬 · 연회실'][i],poly:cp,y0:cy[i],y1:i===2?19:cy[i+1]-.1,priority:6});
    roomLights(cp,cy[i]+(i===2?4.65:6.65),8,cc.avoid);
  }
  box(-779,0,-813,4,.95,1.2,0xc9b99c,true);sign(['비어가든','맥주 · 한강 테라스'], -779,2.8,-813,6,1.1,0,'#405a45','#f1e2bc');
  box(-779,.95,-813,4.1,.09,1.3,0x596862);
  for(const x of [-780,-779.35]) {
    K.cyl({x,y:1.04,z:-813,r:.045,h:.5,seg:8,mat:metal,solid:false});
    box(x,1.46,-812.9,.08,.09,.24,metal);box(x,1.55,-813,.055,.17,.055,dark);
  }
  for(let i=0;i<5;i++)K.cyl({x:-778.65+i*.25,y:1.04,z:-812.7,r:.075,h:.2,seg:10,mat:0xd6b667,solid:false});
  sign('채빛퀴진 · 2층 ↑',-784,2.5,-808,4,.6);
  for(const [x,z]of [[-806,-815],[-804,-807],[-803,-829]]){sofa(x,0,z,3);coffeeTable(x,0,z-1.5);}
  box(-776,0,-831,9,.35,5,'wood',true);box(-776,.35,-832,2.2,.85,1.8,0x202c32);box(-776,1.2,-831.2,2.2,.08,.4,0xe7e2d7);
  K.slab(rect(-781.5,-828,-770.5,-819),.06,{mat:{tex:'carpet',color:0x8f9b87},thick:.01,ceil:false});
  for(const z of [-826.5,-825.2,-823.9,-822.6])for(const x of [-779.5,-778.3,-777.1,-775.3,-774.1,-772.9])chair(x,0,z,0,0xa98965);
  box(-776,.35,-834,9,3.2,.2,0x64756a);
  for(let i=0;i<7;i++)box(-780+i*1.3,4.8,-828,.12,.22,11,0xaa9775);
  sign('채빛섬 · 공연',-776,3,-833,6,.8);
  buffet(-774,7,-831,7);buffet(-775,7,-821,7);
  sign('채빛퀴진',-774,10,-831,6,1,0,'#6a5741');
  for(const [x,z,t]of [[-774,-831,'따뜻한 요리'],[-775,-821,'샐러드 · 디저트']])sign(t,x,9,z,4,.55);
  for(const [x,z]of [[-806,-816],[-803,-808],[-787,-804],[-803,-826],[-783,-832],[-773,-814],[-776,-807],[-780,-820],[-775,-837]])if(!cc.avoid(x,z))table(x,7,z);
  booth(-780,7,-812,.2);
  for(const [x,z]of [[-780,-825],[-778,-816]])planter(x,z,7,1.1);
  box(-775,12.7,-826,9,.18,14,0xc7b68f);
  for(const z of [-831,-826,-821])box(-775,12.65,z,7,.04,.35,{tex:'emit',color:0xffe3ac});
  K.wall(-782,-838,-782,-815,14,18.7,{mat:0xc6b08a,thick:.16,openings:[{at:18,w:2.6,y0:14,y1:17}]});
  K.wall(-782,-824,-769,-824,14,18.7,{mat:0xc6b08a,thick:.16,openings:[{at:3,w:2.2,y0:14,y1:17}]});
  for(const [x,z]of [[-775,-831],[-776,-818],[-805,-817],[-802,-807]])table(x,14,z,'banquet');
  sign('채빛섬 · 연회실',-779,16.8,-815,6,.8);
  for(const [x,z]of [[-774,-835],[-777,-826]])artPanel(x,15,z,3,1.8);
  for(let i=0;i<8;i++)box(-780+i*1.3,18.45,-831,.12,.18,11,0xb89c78);
  K.dome({x:-789,y:19,z:-820,rx:20,ry:2,rz:17,mat:{tex:'glass',color:0xa1c4d5},seg:40,rings:7});
  for(let i=0;i<7;i++)bench(-821+i*4,-798,0,0);
  // Open-air beer tables occupy the existing river-facing islet deck, clear of its
  // entrance and connecting footbridges. Their exact arrangement is not documented.
  for(const [x,z]of [[-762,-833],[-762,-841],[-773,-847]]) {
    table(x,0,z);
    for(const dx of [-.32,.32]) {
      K.cyl({x:x+dx,y:.83,z,r:.075,h:.2,seg:10,mat:0xcfa34c,solid:false});
      K.cyl({x:x+dx,y:1.03,z,r:.076,h:.035,seg:10,mat:0xf0e8d5,solid:false});
    }
  }
  sign(['비어가든','한강 테라스'],-762,1.9,-828,3.6,.9,Math.PI/2,'#405a45','#f1e2bc');

  // 2024 Seoul report: 솔빛섬 무드서울 wine dining; weekly live music on 2F.
  // Keep the existing shell/core and decorative artwork; bar and stage layouts are estimates.
  const sp=building(320797229).poly,sy=[0,6],sh=rect(-902.6,-835,-899.4,-821.4);
  K.slab(sp,0,{mat:0xd1d8d4});K.hpoly(0xd1d8d4,sp,.045);K.slab(sp,6,{mat:'wood',holes:[sh]});
  K.stairs(-901,-822,-901,-833,{w:2.8,ya:0,yb:6,mat:'darkstone'});
  K.slab(rect(-903,-836,-899,-833),6,{mat:'wood',thick:.2});
  rail([-899.4,-832.8],[-899.4,-821.4],6,true);
  lift({name:'솔빛섬 승강기',x:-897,z:-834,w:2.2,d:2.2,floors:[{label:'1층',y:0,name:'무드서울 · 와인 다이닝'},{label:'2층',y:6,name:'무드서울 · 라이브 공연'}]});
  shell(sp,sy,11,'솔빛섬',[-877,-828],0x72db9e);K.slab(sp,11,{mat:'roofgravel'});
  // HG-L4 / hTk_1500: an oblate bronze shell above a concrete drum. The
  // photographed ~1.5 width/height proportion is fitted around the existing
  // 33m OSM body; a literal 20m shell would cut through its occupied floors.
  // Both floors, restaurant entrance, lift, stairs and furniture are retained.
  const solProfile=[[2.6,1],[6.6,1.03],[10.6,1.03],[15,.97],[20,.78],[24,.45],[26.3,.13],[26.6,.01]];
  const solRadius=y=>{let j=1;while(j<solProfile.length-1&&y>solProfile[j][0])j++;const a=solProfile[j-1],b=solProfile[j];return a[1]+(b[1]-a[1])*(y-a[0])/(b[0]-a[0]);};
  const solPoint=(a,y)=>[-890+17.7*solRadius(y)*Math.cos(a),y,-828+13.2*solRadius(y)*Math.sin(a)];
  for(let i=0;i<64;i++){
    const a=i/64*Math.PI*2,b=(i+1)/64*Math.PI*2;
    // East restaurant door and the south bridge-side entry stay open.
    if(i<3||i>60||i>=14&&i<=17)continue;
    K.quad(0x9a9892,[[-890+17.7*Math.cos(a),-1.1,-828+13.2*Math.sin(a)],[-890+17.7*Math.cos(b),-1.1,-828+13.2*Math.sin(b)],solPoint(b,2.6),solPoint(a,2.6)],[Math.cos(a),0,Math.sin(a)]);
    rod3(solPoint(a,2.6),solPoint(b,2.6),.08,0xafada5);
  }
  box(-907.8,0,-835,.7,16.5,10,0xb8bab7);
  const solWindowGlow=new THREE.MeshBasicMaterial({color:0xffcf75,transparent:true,opacity:.12,depthWrite:false,side:THREE.DoubleSide});
  const solWindow=K.material('hangang_solbit_window',solWindowGlow);ledMats.push(solWindowGlow);
  for(let j=0;j<42;j++)for(let i=0;i<64;i++){
    const a=i/64*Math.PI*2,b=(i+1)/64*Math.PI*2,y=2.6+j*24/42,y1=2.6+(j+1)*24/42;
    if(y<3.6&&(i<3||i>60))continue; // open east entrance to the retained restaurant
    const windowBay=i>=15&&i<=16&&y<5.5;
    K.quad(windowBay?solWindow:0x514a3b,[solPoint(a,y),solPoint(b,y),solPoint(b,y1),solPoint(a,y1)],[Math.cos(a),.2,Math.sin(a)]);
    rod3(solPoint(a,y1),solPoint(b,y1),.062,j%3===0?0xb39865:0x967b4d);
    if(i%2===0)rod3(solPoint(a,y),solPoint(a,y1),.075,0x876d43);
    if(i%4===0)rod3(solPoint(a,y),solPoint(b,y1),.025,0xbca477);
  }
  for(let i=0;i<2;i++)K.zone({name:'솔빛섬',floor:(i+1)+'층',sub:i?'무드서울 · 라이브 공연':'무드서울 · 와인 다이닝',poly:sp,y0:sy[i],y1:i?11:5.9,priority:6});
  sign(['무드서울','와인 · 한강 다이닝'], -888,2.6,-837,7,1.2,0,'#392d33','#e5cba2');
  box(-880,0,-832,3,.9,1,0xc1b69f,true);sign('무드서울 · 안내',-880,1.5,-831.4,2.8,.45,0,'#392d33','#e5cba2');
  function wineBottle(x,y,z,i=0) {
    K.cyl({x,y,z,r:.065,h:.25,seg:8,mat:i%2?0x653e39:0x344c3d,solid:false});
    K.cyl({x,y:y+.25,z,r:.028,h:.12,seg:6,mat:0x344c3d,solid:false});
    box(x,y+.09,z+.065,.085,.11,.012,0xe0d1b1);
  }
  function wineGlass(x,y,z) {
    K.cyl({x,y,z,r:.06,h:.012,seg:10,mat:0xbfcac8,solid:false});
    K.cyl({x,y:y+.012,z,r:.011,h:.12,seg:6,mat:0xbfcac8,solid:false});
    K.dome({x,y:y+.13,z,rx:.065,ry:.09,rz:.065,seg:10,rings:4,mat:{tex:'glass',color:0xd5c5bb}});
  }
  for(let i=0;i<6;i++)wineBottle(-881+i*.3,.9,-832.1,i);
  for(const [x,z,rot,i]of [[-892,-824,0,0],[-886,-832,0,1],[-884,-823,Math.PI/2,2],[-891,-836,0,3]])artPanel(x,.3,z,4,2.5,rot,i);
  for(const [x,z]of [[-894,-829],[-881,-828]]) {
    box(x,0,z,1.6,.65,1.6,0xb9c6c2,true);
    K.dome({x,y:.65,z,rx:.6,ry:1.1,rz:.6,seg:12,rings:6,mat:0xa4c6c1});
  }
  for(const [x,z]of [[-889.5,-828],[-882,-835.5]]) {
    K.cyl({x,y:0,z,r:.07,h:.73,seg:6,mat:dark,solid:false});
    K.cyl({x,y:.73,z,r:.55,h:.08,seg:12,mat:0xa4774e,solid:false});
    wineBottle(x,.81,z);
    for(const dx of [-.3,.3]){wineGlass(x+dx,.81,z);chair(x+dx/ .3,0,z,dx<0?-Math.PI/2:Math.PI/2,0x665347);}
  }
  for(const x of [-892,-885]){box(x,4.8,-829,.08,.08,14,dark);for(const z of [-834,-828,-822])box(x,4.55,z,.3,.2,.4,'emit');}
  sign(['무드서울','라이브 공연'],-887,8.6,-836,8,1.1,0,'#392d33','#e5cba2');
  box(-887,6,-835,6,.95,1.3,'wood',true);
  for(let j=0;j<2;j++) {
    box(-887,7.05+j*.65,-838,6,.06,.38,0x9b7954);
    for(let i=0;i<14;i++)wineBottle(-889.6+i*.4,7.11+j*.65,-837.95,i);
  }
  for(const x of [-889,-888,-886])wineGlass(x,6.95,-834.75);
  for(const [x,z]of [[-891,-822],[-883,-826]]){sofa(x,6,z,3.5);coffeeTable(x,6,z-1.5);}
  // A compact stage, keyboard and microphone face the retained lounge seating.
  box(-885.7,6,-822.8,5.6,.3,2.4,'wood',true);
  box(-887,6.3,-823,1.7,.68,.65,dark);box(-887,6.98,-822.65,1.7,.06,.25,0xeee9de);
  for(let i=0;i<10;i++)box(-887.7+i*.15,7.04,-822.72,.055,.045,.12,0x283238);
  K.cyl({x:-884.8,y:6.3,z:-822.9,r:.035,h:1.35,seg:6,mat:metal,solid:false});
  box(-884.8,7.62,-822.82,.1,.08,.25,dark);
  for(const x of [-888,-883.4])box(x,6.3,-823.5,.45,.75,.4,dark);
  roomLights(sp,10.65,7,(x,z)=>x<-896);
  bench(-894,-828,0,6);planter(-880,-831,6,1.4);
  // 예빛: original 33×24m pontoon, 23×12m screen facing the riverbank audience.
  const ep=area(305692221).poly;
  K.zone({name:'예빛섬',floor:'수상무대',sub:'미디어아트 · 야외공연',poly:ep,y0:0,y1:13,priority:5});
  const er=-.66,ex=-924,ez=-635;
  box(ex,0,ez,24,.5,3,0x384956,true,er);
  for(const dx of [-11.5,11.5])box(ex+dx*Math.cos(er),.5,ez-dx*Math.sin(er),.5,11.5,.65,metal);
  K.texture('hangang-screen',768,384,(g,w,h)=>{
    g.fillStyle='#102e49';g.fillRect(0,0,w,h);
    for(let i=0;i<9;i++){g.strokeStyle=['#588fb6','#78c3ca','#bbd6be'][i%3];g.lineWidth=3;g.beginPath();for(let x=0;x<w;x+=4){const y=h*.6+Math.sin(x/110+i*.44)*55+i*9;x?g.lineTo(x,y):g.moveTo(x,y);}g.stroke();}
    g.fillStyle='#f1ead3';g.font='bold 64px "Noto Sans KR", sans-serif';g.textAlign='center';g.fillText('세빛섬',w/2,125);g.font='28px "Noto Sans KR", sans-serif';g.fillText('한강 위에 피어난 빛',w/2,182);
  },[23,12]);
  box(ex,0,ez,23,12,.25,'hangang-screen',false,er);
  sign('예빛섬 수상무대',-907,1.7,-615,8,.85,er);
  for(let j=0;j<4;j++)for(let i=0;i<6;i++)bench(-908+i*4,-593+j*3,er);

  // Main bridge frame, at the real centerline between the two one-way OSM carriageways.
  const bridge=[[-521.6,-441.74,0],[-552.5,-557.4,15],[-577.9,-624.7,15],[-651.2,-813.2,15],[-779.1,-1140.6,15],[-920.5,-1500.5,15],[-944.5,-1586.4,15],[-1003.65,-1959.55,0]];
  function bridgeSection(a,b) {
    const L=Math.hypot(b[0]-a[0],b[1]-a[1]),ux=(b[0]-a[0])/L,uz=(b[1]-a[1])/L,nx=-uz,nz=ux,rot=Math.atan2(ux,uz);
    K.ramp(...a.slice(0,2),...b.slice(0,2),{w:25,ya:a[2],yb:b[2],mat:{tex:'asphalt',color:0xb4b8b7},under:0xa8a39b,rails:false});
    for(const side of [-1,1]) {
      const off=side*11.4,aa=[a[0]+nx*off,a[1]+nz*off],bb=[b[0]+nx*off,b[1]+nz*off];
      strip(aa,bb,2.05,a[2]+.13,'concrete',b[2]+.13);
      // Guardrail webs follow the ramp heights; collision comes from the slope rails.
      slopeRail([a[0]+nx*side*12.5,a[1]+nz*side*12.5],[b[0]+nx*side*12.5,b[1]+nz*side*12.5],a[2]+.13,b[2]+.13);
      for(let s=0;s<L;s+=2.5) {const t=s/L,x=a[0]+ux*s+nx*side*12.5,z=a[1]+uz*s+nz*side*12.5,y=a[2]+(b[2]-a[2])*t;box(x,y,z,.075,1.35,.075,metal);}
      for(let s=12;s<L;s+=34){const t=s/L;lamp(a[0]+ux*s+nx*side*11.9,a[1]+uz*s+nz*side*11.9,a[2]+(b[2]-a[2])*t,7.5);}
    }
    for(let lane=-3;lane<=3;lane++) {
      const off=lane*3.2;
      for(let s=1;s<L-4;s+=10){const y=a[2]+(b[2]-a[2])*s/L+.02;strip([a[0]+ux*s+nx*off,a[1]+uz*s+nz*off],[a[0]+ux*(s+4)+nx*off,a[1]+uz*(s+4)+nz*off],lane===0?.18:.11,y,lane===0?0xe9bc53:0xe3e4da,y+(b[2]-a[2])*4/L);}
    }
    // Longitudinal steel girders give the lower promenade its characteristic ceiling.
    for(const off of [-9,-3,3,9]) {
      const ax=a[0]+nx*off,az=a[1]+nz*off,bx=b[0]+nx*off,bz=b[1]+nz*off;
      K.quad(0xa8a39b,[[ax,a[2]-.3,az],[bx,b[2]-.3,bz],[bx,b[2]-1.5,bz],[ax,a[2]-1.5,az]],[nx,0,nz]);
      K.quad(0xa8a39b,[[ax,a[2]-.3,az],[bx,b[2]-.3,bz],[bx,b[2]-1.5,bz],[ax,a[2]-1.5,az]],[-nx,0,-nz]);
    }
    // Portal supports are placed once below, on the lower deck axis. The old
    // cylinders at +/-5.6m wrongly stood inside the walking/cycle lanes.
    for(let s=45;s<L;s+=110){const t=s/L;K.vehicle({x:a[0]+ux*s+nx*4.8,y:a[2]+(b[2]-a[2])*t,z:a[1]+uz*s+nz*4.8,rotY:rot,kind:'car',solid:true});}
  }
  for(let i=1;i<bridge.length;i++)bridgeSection(bridge[i-1],bridge[i]);
  // Jamsu Bridge: no cars after 2026-10-26; preserve a pedestrian and cycle route.
  // Keep the river deck/spawn at +1.6m, but provide 3.35m of headroom over
  // both OSM park crossways. Rails and deck fascia never extend to the lawn.
  const lower=[[-590.01,-647.54,0],[...accessA,bankDeckY],[...accessPoint(120),bankDeckY],[...accessB,1.6],[-762.57,-1098.77,1.6],[-800,-1196,5.3],[-831,-1277,5.3],[-866,-1367,1.6],[-912.02,-1486.06,1.6],[-931.69,-1540.58,0]];
  const lowerLengths=lower.slice(1).map((p,i)=>Math.hypot(p[0]-lower[i][0],p[1]-lower[i][1]));
  const lowerStarts=[0];for(const L of lowerLengths)lowerStarts.push(lowerStarts.at(-1)+L);
  function lowerAt(s,off=0) {
    let i=0;while(i<lowerLengths.length-1&&s>lowerStarts[i+1])i++;
    const a=lower[i],b=lower[i+1],L=lowerLengths[i],t=(s-lowerStarts[i])/L,ux=(b[0]-a[0])/L,uz=(b[1]-a[1])/L;
    return {x:a[0]+(b[0]-a[0])*t-uz*off,z:a[1]+(b[1]-a[1])*t+ux*off,y:a[2]+(b[2]-a[2])*t,ux,uz,nx:-uz,nz:ux};
  }
  const point2=p=>[p.x,p.z];
  // These 22 orange bays visualize the published proposal. Construction fences
  // and dated boards keep the planned widened deck distinct from the open lane.
  const viewingBays=proposal?Array.from({length:11},(_,j)=>({s:280+j*48,half:8})):[];
  const glassRanges=proposal?[[lowerStarts[5]+16,lowerStarts[5]+30],[lowerStarts[5]+54,lowerStarts[5]+68]]:[];
  const concrete={tex:'concrete',color:0xe1ddd4};
  K.texture('hangang_work_barrier',256,128,(g,w,h)=>{g.fillStyle='#ece8d6';g.fillRect(0,0,w,h);g.fillStyle='#d36b35';for(let i=-3;i<8;i++){g.beginPath();g.moveTo(i*64,0);g.lineTo(i*64+34,0);g.lineTo(i*64+98,h);g.lineTo(i*64+64,h);g.fill();}},[2.5,1]);
  function barrier(a,b,y,mesh=false) {
    const L=Math.hypot(b[0]-a[0],b[1]-a[1]);
    K.wall(...a,...b,y+.08,y+1.15,{thick:.06,mat:mesh?{tex:'glass',color:0xc6cac4}:'hangang_work_barrier'});
    for(let s=0;s<=L;s+=2.4){const t=s/L,x=a[0]+(b[0]-a[0])*t,z=a[1]+(b[1]-a[1])*t;box(x,y,z,.07,1.25,.07,0xa8ada7);box(x,y,z,.38,.08,.48,0x656a63);}
    if(mesh)for(const h of [.2,.5,.8,1.1])K.wall(...a,...b,y+h,y+h+.018,{mat:0xa4afa9,thick:.025,solid:false});
  }
  for(let i=1;i<lower.length;i++) {
    const a=lower[i-1],b=lower[i],L=lowerLengths[i-1],start=lowerStarts[i-1],nx=-(b[1]-a[1])/L,nz=(b[0]-a[0])/L;
    const point=(s,off=0)=>[a[0]+(b[0]-a[0])*s/L+nx*off,a[1]+(b[1]-a[1])*s/L+nz*off];
    const height=s=>a[2]+(b[2]-a[2])*s/L;
    const cuts=[0,L,...glassRanges.flat().map(s=>s-start).filter(s=>s>0&&s<L)].sort((x,y)=>x-y);
    for(let k=1;k<cuts.length;k++) {
      const s=cuts[k-1],t=cuts[k],glass=glassRanges.some(([u,v])=>start+(s+t)/2>u&&start+(s+t)/2<v);
      if(glass) {
        const poly=[point(s,-9),point(t,-9),point(t,9),point(s,9)];
        K.slab(poly,height(s),{mat:{tex:'glass',color:0x87c6ce},under:'glass',edge:0x788e90,thick:.12});
        // Open water is visible between the slender steel grid. No opaque ramp
        // or cycle ribbon remains beneath either transparent floor patch.
        for(let u=s;u<t+.01;u+=2)K.wall(...point(u,-9),...point(u,9),height(u)-.16,height(u)-.06,{mat:0x607678,thick:.08,solid:false});
        for(const off of[-9,-6,-3,0,3,6,9])K.wall(...point(s,off),...point(t,off),height(s)-.16,height(s)-.06,{mat:0x607678,thick:.06,solid:false});
      } else {
        K.ramp(...point(s),...point(t),{w:18,ya:height(s),yb:height(t),mat:concrete,under:0x566160,rails:false});
        strip(point(s,6),point(t,6),3.5,height(s)+.015,'hangang_red_lane',height(t)+.015);
      }
    }
    for(const side of[-1,1]) {
      const omissions=viewingBays.map(q=>[q.s-q.half-start,q.s+q.half-start]).filter(([s,t])=>t>0&&s<L);
      if(start<200)omissions.push([0,Math.min(L,200-start)]);
      const edges=[0,L,...omissions.flat().filter(s=>s>0&&s<L)].sort((x,y)=>x-y);
      for(let k=1;k<edges.length;k++) {
        const s=edges[k-1],t=edges[k];if(omissions.some(([u,v])=>(s+t)/2>u&&(s+t)/2<v))continue;
        slopeRail(point(s,side*9),point(t,side*9),height(s),height(t),0x7d8285);
        const topA=point(s,side*9-.1),topB=point(t,side*9-.1),topC=point(t,side*9+.1),topD=point(s,side*9+.1);
        K.quad(0x7d8285,[[topA[0],height(s)+1.14,topA[1]],[topB[0],height(t)+1.14,topB[1]],[topC[0],height(t)+1.14,topC[1]],[topD[0],height(s)+1.14,topD[1]]],[0,1,0]);
        for(let u=s;u<t;u+=2){const p=point(u,side*9);box(p[0],height(u),p[1],.095,1.16,.095,0xaaa9a3);}
        const railEnds=[point(s,side*9),point(t,side*9)];
        K.detail({name:'잠수교 물결 난간 '+i+' '+side+' '+k,floor:'하층',y0:Math.min(height(s),height(t)),y1:Math.max(height(s),height(t))+2,rect:[Math.min(...railEnds.map(p=>p[0]))-1,Math.min(...railEnds.map(p=>p[1]))-1,Math.max(...railEnds.map(p=>p[0]))+1,Math.max(...railEnds.map(p=>p[1]))+1]},K=>{
        for(let u=s;u<t;u+=.15) {
          const p=point(u,side*9);
          if(start+u<65||start+u>880)box(p[0],height(u)+.12,p[1],.045,.91,.045,0x7d8285);
          else {
            // The old railing's sinuous vertical rods are prominent in the
            // fountain photo spot. Four bent strips share the deck's slope.
            for(let j=0;j<8;j++) {
              const h0=.13+j*.1125,h1=h0+.1125,d0=Math.sin(j/8*Math.PI*2)*.16,d1=Math.sin((j+1)/8*Math.PI*2)*.16;
              const q=point(u+d0,side*9),r=point(u+d1,side*9),ux=(b[0]-a[0])/L,uz=(b[1]-a[1])/L;
              for(const face of[-1,1])K.quad(0x7d8285,[[q[0]-ux*.022+nx*.014*face,height(u)+h0,q[1]-uz*.022+nz*.014*face],[q[0]+ux*.022+nx*.014*face,height(u)+h0,q[1]+uz*.022+nz*.014*face],[r[0]+ux*.022+nx*.014*face,height(u)+h1,r[1]+uz*.022+nz*.014*face],[r[0]-ux*.022+nx*.014*face,height(u)+h1,r[1]-uz*.022+nz*.014*face]],[nx*face,0,nz*face]);
            }
          }
        }
        });
      }
      const aa=point(0,side*9),bb=point(L,side*9);
      K.quad(0x7b8582,[[aa[0],a[2]-.25,aa[1]],[bb[0],b[2]-.25,bb[1]],[bb[0],b[2],bb[1]],[aa[0],a[2],aa[1]]],[nx*side,0,nz*side]);
      if(a[2]===b[2])K.phys.addCeiling([a.slice(0,2),b.slice(0,2),bb,aa],a[2]-.25);
    }
    // Retained lane edge, low separators and orange bollards match the closure
    // photographs; the middle stays open to walkers for the whole map extent.
    if(start+L>180) {
      const begin=Math.max(0,180-start);
      // The filmed inner walkway edge is a rounded low concrete kerb, not a yellow stripe.
      for(const off of[-4.1,4.1]){
        const a=point(begin,off),b=point(L,off);
        K.ramp(...a,...b,{w:.42,ya:height(begin)+.23,yb:height(L)+.23,mat:0xa9a8a3,rails:false});
        rod3([a[0],height(begin)+.23,a[1]],[b[0],height(L)+.23,b[1]],.1,0xa9a8a3);
      }
    }
    for(let s=9;s<L;s+=2){const p=point(s,4.1),y=height(s);box(p[0],y,p[1],.13,.72,.13,0xdc653e);box(p[0],y+.39,p[1],.15,.14,.15,0xe8e9e2);}
  }
  // Rectangular concrete portals at the margins frame the actual lower-level
  // vista in the city photos. Circular waterline footings remain below them.
  for(let s=85;s<lowerStarts.at(-1)-45;s+=34) {
    const p=lowerAt(s),rot=Math.atan2(p.ux,p.uz);
    box(p.x,12.1,p.z,25,1.6,2.15,concrete,true,rot);
    for(const side of[-1,1]) {
      const q=lowerAt(s,side*10.15),h=p.y-.2;
      K.cyl({x:q.x,y:-2.2,z:q.z,r:1.55,h:h+2.2,seg:16,mat:{tex:'concrete',color:0x929e94}});
      box(q.x,h,q.z,1.55,12.1-h,2.1,concrete,true,rot);
      const a=lowerAt(s,side*9.38),b=lowerAt(s,side*7.65);
      for(const dz of[-1.075,1.075])K.quad(concrete,[[a.x+p.ux*dz,10.45,a.z+p.uz*dz],[b.x+p.ux*dz,12.1,b.z+p.uz*dz],[b.x+p.ux*dz,12.45,b.z+p.uz*dz],[a.x+p.ux*dz,12.45,a.z+p.uz*dz]],[p.ux,0,p.uz]);
      const light=lowerAt(s,side*9.2);box(light.x,11.85,light.z,.45,.12,.45,{tex:'emit',color:0xffcf75});
    }
    // Web stiffeners and bolt plates under the top deck make the repeating
    // structure readable without inventing a separate elevated pedestrian deck.
    for(const off of[-9,-3,3,9]){const q=lowerAt(s,off);box(q.x,13.35,q.z,.23,1.35,2.2,0x99968e,false,rot);}
  }
  for(const [j,bay] of viewingBays.entries())for(const side of[-1,1]) {
    const s=bay.s,t=s-bay.half,u=s+bay.half,a=lowerAt(t,side*10.6),b=lowerAt(u,side*10.6);
    K.ramp(a.x,a.z,b.x,b.z,{w:3.6,ya:a.y,yb:b.y,mat:0xd18c53,under:0x6c7772,rails:false});
    const outerA=lowerAt(t,side*12.4),outerB=lowerAt(u,side*12.4);
    slopeRail(point2(outerA),point2(outerB),a.y,b.y);
    for(const d of[t,u]){const p=lowerAt(d,side*9),q=lowerAt(d,side*12.4);rail(point2(p),point2(q),p.y);}
    // Every third bay remains fenced off; the others are accessible study
    // representations of the planned orange viewing surface and blue seats.
    if(j%3===0){const p=lowerAt(t,side*8.95),q=lowerAt(u,side*8.95);barrier(point2(p),point2(q),Math.min(a.y,b.y));}
    else for(const offset of[-4,1,5]){const p=lowerAt(s+offset,side*11.1);K.dome({x:p.x,y:p.y,z:p.z,rx:.55,ry:.5,rz:.7,mat:[0x8caec1,0x8597b4,0x9cbcbc][j%3],seg:10,rings:5});}
    const p=lowerAt(s,side*12.32);
    for(let n=t;n<u;n+=.65){const q=lowerAt(n,side*12.4);box(q.x,q.y+.1,q.z,.045,1.02,.045,0xe5a36a);}
    if(j===1&&side===1)sign(['전망쉼터 조성 계획','보행전용교 공사 중'],p.x,p.y+1.65,p.z,4.8,.95,Math.atan2(p.nx,p.nz),'#965b32');
  }
  // Local work zones leave more than 7m of clear width at the road closure.
  for(const s of proposal?[34,258,835]:[]) {
    const a=lowerAt(s,-7.1),b=lowerAt(s+12,-7.1);barrier(point2(a),point2(b),Math.min(a.y,b.y),true);
    const p=lowerAt(s+5,-7.8);sign(['차량 통행 금지','2026.10.26부터 · 보행·자전거 통행'],p.x,p.y+1.65,p.z,5.2,1.1,Math.atan2(-p.ux,-p.uz),'#3e493c','#f6d48b');
  }
  // HG-L2: road and plaza meet at grade. No shore-side wave rail or stair enclosure.
  for(const side of [-1,1]) {
    const p=(u,o)=>accessPoint(u,side*o);
    K.slab([p(0,9),p(100,9),p(100,32),p(0,32)],.1,{mat:0xb7b0a4,thick:.15,ceil:false});
    K.ramp(...p(50,32),...p(50,41),{w:100,ya:.1,yb:.065,mat:0xb7b0a4,rails:false});
  }
  // Black fence follows the shore; leave the bridge and mapped east/west path open.
  for(const [a,b] of [[[-705,-791],[-666,-817]],[[-634,-834],[-602,-849]]]){
    rail(a,b,.075,false,0x2b2d2e);
    const L=Math.hypot(b[0]-a[0],b[1]-a[1]);
    for(let t=0;t<L;t+=.18)box(a[0]+(b[0]-a[0])*t/L,.13,a[1]+(b[1]-a[1])*t/L,.025,.94,.025,0x2b2d2e);
  }
  // Paved, lit ground passages follow the actual OSM paths between solid piers.
  const crossways=[
    [[-632.25,-712.99],[-587.76,-721.05]],
    [[-670.45,-786.08],[-647.53,-784.24],[-637.46,-786.19],[-589.48,-798.22]],
  ];
  for(const path of crossways) {
    for(let j=1;j<path.length;j++)strip(path[j-1],path[j],5,.085,{tex:'sidewalk',color:0xc2c5bf});
    const mid=path.length===2?[-616.7,-715.8]:[-642,-785.3];
    for(const off of [-7,0,7]) {
      const x=mid[0]+accessN[0]*off,z=mid[1]+accessN[1]*off;
      box(x,3.22,z,.9,.08,.24,0x263a40);
      box(x,3.19,z,.76,.035,.18,{tex:'emit',color:0xffe4ad});
    }
  }
  sign(['교각 사이 보행통로','세빛섬 · 달빛광장'], -596,2.1,-715,4.8,.9,Math.PI/2);
  sign(['잠수교 · 차량 통행 금지','보행전용교 조성 공사 · 보행·자전거 통행'], -600,2.6,-672,7,1.4,.37);
  sign(['보행전용교 조성 계획','전망쉼터 22곳 · 투명 바닥 2곳 · 2027년 하반기 개장 예정'],-607,1.6,-706,7,1.2,.37,'#96613e');
  sign(['잠원한강공원 · 서울웨이브 →','강변 산책로'], -579,2,-800,5.6,1.0,Math.PI/2);
  sign(['반포대교','용산 · 녹사평 방면'], -621,19,-737,9,1.8,.37,'#18734c');
  K.floorText('보행로',{x:-700,y:1.64,z:-924,w:2.5,h:3.5,rotY:-.37,fg:'#fff4d7'});
  K.zone({name:'잠수교',floor:'하층',sub:'보행전용교 공사 중 · 보행·자전거 통행',poly:area(1091571021).poly,y0:0,y1:7,priority:4});
  K.zone({name:'반포대교',floor:'상층',sub:'달빛무지개분수 · 용산 방면',poly:area(1085504592).poly,y0:12,y1:25,priority:3});
  K.detail({name:'잠수교 산책객',floor:'하층',y0:0,y1:6,rect:[-940,-1548,-578,-640]},K=>{
  for(let i=1;i<lower.length;i++) {
    const a=lower[i-1],b=lower[i],L=Math.hypot(b[0]-a[0],b[1]-a[1]),nx=-(b[1]-a[1])/L,nz=(b[0]-a[0])/L;
    for(let s=15;s<L;s+=32){const t=s/L;visitor(a[0]+(b[0]-a[0])*t+nx*2.6,a[2]+(b[2]-a[2])*t,a[1]+(b[1]-a[1])*t+nz*2.6,i+Math.floor(s/32),i%2?.37:3.51);}
    for(let s=35;s<L;s+=90)for(let n=0;n<2;n++){
      const p=lowerAt(lowerStarts[i-1]+s+n*.5,-7.1+n*.7);visitor(p.x,p.y,p.z,i+n,.37+n*2.5);
    }
  }
  const car=lowerAt(106,2.8);
  K.vehicle({x:car.x,y:car.y,z:car.z,rotY:Math.atan2(car.ux,car.uz),kind:'car',color:0xf1f1eb,solid:false});
  const cyclist=lowerAt(125,5.5);
  for(const d of[-.55,.55]){
    const p=lowerAt(125+d,5.5);
    const wheel=new THREE.Mesh(new THREE.TorusGeometry(.33,.03,5,14),new THREE.MeshLambertMaterial({color:0x333b3c}));
    wheel.rotation.y=Math.atan2(cyclist.ux,cyclist.uz)+Math.PI/2;wheel.position.set(p.x,p.y+.36,p.z);K.addMesh(wheel);
  }
  const wa=lowerAt(124.45,5.5),wb=lowerAt(125.55,5.5);
  rod3([wa.x,wa.y+.36,wa.z],[wb.x,wb.y+.36,wb.z],.03,0x526d77);
  rod3([wa.x,wa.y+.36,wa.z],[cyclist.x,cyclist.y+.86,cyclist.z],.03,0x526d77);
  rod3([wb.x,wb.y+.36,wb.z],[cyclist.x,cyclist.y+.86,cyclist.z],.03,0x526d77);
  visitor(cyclist.x,cyclist.y+.43,cyclist.z,3,.37,true);
  });
  // HG-L2/T1: permanent crossings, cycle markings, signals and pier numbers.
  K.detail({name:'잠수교 상시 도로 시설',floor:'하층',y0:0,y1:7,rect:[-780,-1070,-590,-700]},K=>{
    const redA=lowerAt(114),redB=lowerAt(119);
    strip(point2(redA),point2(redB),8,redA.y+.025,'hangang_red_lane',redB.y+.025);
    K.texture('hangang_yellow_kerb',256,64,(g,w,h)=>{g.fillStyle='#e0b020';g.fillRect(0,0,w,h);g.fillStyle='#292c2c';for(let x=-64;x<w;x+=64){g.beginPath();g.moveTo(x,0);g.lineTo(x+32,0);g.lineTo(x+72,h);g.lineTo(x+40,h);g.closePath();g.fill();}},[2,.25]);
    for(const s of[90,96,102,108]){const a=lowerAt(s,-4.7),b=lowerAt(s+4,-4.7);K.wall(...point2(a),...point2(b),a.y+.02,a.y+.17,{thick:.18,mat:'hangang_yellow_kerb',solid:false});}
    for(let off=-7.2;off<=7.2;off+=1){
      const a=lowerAt(146,off),b=lowerAt(150,off);strip(point2(a),point2(b),.5,a.y+.04,0xf2f2f2,b.y+.04);
    }
    for(const side of [-1,1])for(const s of [141,156]){
      const p=lowerAt(s,side*7.6);K.cyl({x:p.x,y:p.y,z:p.z,r:.14,h:.75,seg:10,mat:0xe0b020,solid:false});
      box(p.x,p.y+.43,p.z,.29,.14,.29,0x252827);
    }
    const speed=lowerAt(143,-8.4);box(speed.x,speed.y,speed.z,.08,4.4,.08,0x5f6d6a);
    sign('40',speed.x,speed.y+3.8,speed.z,.7,.7,Math.atan2(-speed.ux,-speed.uz),'#f4eee4','#a1473b');
    for(let s=84;s<228;s+=12){
      const a=lowerAt(s,-6.3),b=lowerAt(s+12,-6.3);
      strip(point2(a),point2(b),1.6,a.y+.035,0x3f8f6a,b.y+.035);
    }
    const signal=lowerAt(154,8.2),signalEnd=lowerAt(154,-2);
    box(signal.x,signal.y,signal.z,.14,4.4,.14,0x4a4d50);
    rod3([signal.x,signal.y+4.2,signal.z],[signalEnd.x,signalEnd.y+4.2,signalEnd.z],.065,0x4a4d50);
    box(signalEnd.x,signalEnd.y+3.9,signalEnd.z,.65,.25,.28,0x303534,false,Math.atan2(signal.ux,signal.uz));
    for(const [s,label] of [[357,'23'],[425,'16']]){const p=lowerAt(s,9.28);sign(label,p.x,p.y+4,p.z,.8,.9,Math.atan2(-p.nx,-p.nz),null,'#292c2c');}
    K.texture('hangang_bicycle_mark',256,384,(g,w,h)=>{
      g.clearRect(0,0,w,h);g.strokeStyle='#f2f2ed';g.lineWidth=10;
      for(const y of [94,278]){g.beginPath();g.ellipse(128,y,48,50,0,0,Math.PI*2);g.stroke();}
      g.beginPath();g.moveTo(128,94);g.lineTo(103,186);g.lineTo(153,225);g.lineTo(128,278);g.moveTo(103,186);g.lineTo(153,161);g.lineTo(153,225);g.moveTo(153,161);g.lineTo(169,147);g.moveTo(82,185);g.lineTo(123,185);g.stroke();
    },[1.3,2.2],{transparent:true});
    for(const s of [100,130,178,210]){const p=lowerAt(s,-6.3),a=lowerAt(s-1.1,-6.95),b=lowerAt(s-1.1,-5.65),c=lowerAt(s+1.1,-5.65),d=lowerAt(s+1.1,-6.95);K.quad('hangang_bicycle_mark',[a,b,c,d].map(q=>[q.x,q.y+.045,q.z]),[0,1,0]);}
  });
  // The June walk is an event, not the ordinary November scene. Operators can
  // inspect its temporary furniture with ?festival=1 without engine changes.
  if(festival){
    K.detail({name:'잠수교 뚜벅뚜벅축제',floor:'하층',y0:0,y1:7,rect:[-800,-1100,-600,-700]},K=>{
    for(let s=242;s<420;s+=18){
      const a=lowerAt(s,6.5),b=lowerAt(s+13,6.5);
      strip(point2(a),point2(b),3,a.y+.035,0x72a653,b.y+.035);
      for(const off of [4.5,7]){
        const p=lowerAt(s+5,off);K.dome({x:p.x,y:p.y+.05,z:p.z,rx:.6,ry:.45,rz:.75,mat:[0xe2ca7f,0x8cafab,0xc2b291][Math.floor(s/18)%3],seg:10,rings:5});
        K.person(p.x,p.y+.1,p.z,{sit:true,shirt:0xbbbba7});
      }
    }
    for(let j=0;j<8;j++){
      const s=270+j*24,p=lowerAt(s,-6.8),rot=Math.atan2(p.ux,p.uz);
      K.vehicle({x:p.x,y:p.y,z:p.z,kind:'truck',rotY:rot,color:[0xe3cf9e,0x688c86,0xd29c79][j%3],solid:false});
      sign('먹거리',p.x,p.y+3.2,p.z,2.4,.5,rot+Math.PI/2,'#42413a','#ffe6a6');
      box(p.x+p.nx*1.1,p.y+1.15,p.z+p.nz*1.1,.16,1.15,3.7,0xe7d5aa,false,rot);
      for(let n=0;n<4;n++){
        const q=lowerAt(s-1+n*.9,-4.7+n%2*.35);visitor(q.x,q.y,q.z,j+n,Math.atan2(-p.nx,-p.nz));
      }
      visitor(p.x,p.y,p.z,j,Math.atan2(p.nx,p.nz));
    }
    for(let s=220;s<430;s+=7)for(const side of [-1,1]){
      const p=lowerAt(s,side*3.8);
      box(p.x,p.y,p.z,.35,.06,.35,0x464b48);
      K.cyl({x:p.x,y:p.y+.06,z:p.z,r:.11,h:.72,mat:0xe58e48,seg:6,solid:false});
      box(p.x,p.y+.45,p.z,.15,.12,.15,0xf1e9d6);
    }
    for(let j=0;j<160;j++){
      const group=Math.floor(j/3),s=100+(group%18)*18+(j%3)*.8,off=-2.7+(group%4)*1.6+(j%3)*.32,p=lowerAt(s,off);
      visitor(p.x,p.y+.04,p.z,j,j%3===0?3.5:.25+(j%4)*.4);
    }
    for(let j=0;j<52;j++){const p=lowerAt(139+(j%13)*1.25,-5.7+Math.floor(j/13)*3.1);visitor(p.x,p.y+.04,p.z,j,(j%4)*1.57);}
    for(let j=0;j<9;j++){const a=j/8*Math.PI,p=lowerAt(157+Math.cos(a)*1.5,7.2);K.dome({x:p.x,y:p.y+.6+Math.sin(a)*2.4,z:p.z,rx:.38,ry:.4,rz:.38,mat:j%2?0xe29dbd:0xc9739b,seg:10,rings:5});}

    const tent=lowerAt(102,-13.5);
    for(const dx of[-1.8,1.8])for(const dz of[-1.8,1.8])box(tent.x+dx,tent.y,tent.z+dz,.06,2.5,.06,0xc6c9c5);
    for(const side of[-1,1])K.quad(0xf4f4ee,[[tent.x-2,tent.y+2.5,tent.z+side*2],[tent.x+2,tent.y+2.5,tent.z+side*2],[tent.x+2,tent.y+3.5,tent.z],[tent.x-2,tent.y+3.5,tent.z]],[0,1,side]);
    const fp=lowerAt(92,0);sign(['차 없는 잠수교','뚜벅뚜벅축제'],fp.x,fp.y+3,fp.z,6,1,Math.atan2(-fp.ux,-fp.uz),'#2b6854','#fff4c8');
    });
  }

  // MQ_2320: stepped stone bank, seated visitors and moored boats beside Gavit.
  // Preserve the river/ground datum and the mapped lower-deck approaches.
  K.slab([[-689,-811],[-666,-822],[-655,-800],[-678,-790]],.075,{mat:{tex:'concrete',color:0xc3c1b7},thick:.2,ceil:false});
  K.detail({name:'남단 분수 관람 수변',floor:'수변',y0:-1.4,y1:5,rect:[-880,-842,-650,-788]},K=>{
    for(let i=0;i<8;i++){const x=-680+(i%4)*2.2,z=-811+Math.floor(i/4)*2.1;visitor(x,.075,z,i,.3,i%3!==0);}
    for(let j=0;j<3;j++){
      const x=-830-j*17,z=-802-j*4.8,rot=-.37;
      box(x,-1.15,z,5.5,.7,2.6,0xe1e0d3,false,rot);box(x,-.45,z,3.2,1.3,2,0x666b66,false,rot);
      box(x,.85,z,3.4,.1,2.15,0xd2cbb8,false,rot);
      for(let k=0;k<4;k++)box(x-1.3+k*.85,-.13,z+1.03,.54,.6,.03,{tex:'emit',color:0xffcd75},false,rot);
    }
  });

  // 380 fountain nozzles: 190 per side over 570m. Single dynamic ribbon geometry,
  // reused buffers: coherent gravity arcs, slight fan motion, no per-frame allocations.
  const nozzleCount=380,steps=24,verts=nozzleCount*steps*6;
  const positions=new Float32Array(verts*3),colors=new Float32Array(verts*3);
  const fg=new THREE.BufferGeometry();fg.setAttribute('position',new THREE.BufferAttribute(positions,3).setUsage(THREE.DynamicDrawUsage));fg.setAttribute('color',new THREE.BufferAttribute(colors,3));
  const fm=new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.DoubleSide,transparent:true,opacity:.32,depthWrite:false});
  const fountain=K.addMesh(new THREE.Mesh(fg,fm));fountain.frustumCulled=false;
  fountain.visible=sceneOptions.has('night')||sceneOptions.get('fountain')==='1';
  const fux=-.3636,fuz=-.93155,fnx=.93155,fnz=-.3636,fc=new THREE.Color();
  function fountainColors(night) {
    for(let i=0;i<nozzleCount;i++) {
      if(night)fc.setHSL((i%190)/190*.8,.12,.88);else fc.setHex(0xe3edf0);
      for(let j=0;j<steps*6;j++){const k=(i*steps*6+j)*3;colors[k]=fc.r;colors[k+1]=fc.g;colors[k+2]=fc.b;}
    }
    fg.attributes.color.needsUpdate=true;
  }
  function animateWater(t) {
    let k=0;
    for(let i=0;i<nozzleCount;i++) {
      const side=i<190?-1:1,q=i%190,s=24+q*570/189;
      const ox=-651+fux*s+fnx*side*12.7,oz=-813+fuz*s+fnz*side*12.7;
      const reach=16.5+Math.sin(t*.9+q*.09)*1.2;
      for(let j=0;j<steps;j++) {
        const u=j/steps,v=(j+1)/steps;
        const au=u*reach,av=v*reach,ay=14.6+3*u-19*u*u,by=14.6+3*v-19*v*v;
        const ax=ox+fnx*side*au,az=oz+fnz*side*au,bx=ox+fnx*side*av,bz=oz+fnz*side*av;
        const w=.025+u*u*.045,wx=fux*w,wz=fuz*w;
        positions[k++]=ax-wx;positions[k++]=ay;positions[k++]=az-wz;
        positions[k++]=ax+wx;positions[k++]=ay;positions[k++]=az+wz;
        positions[k++]=bx+wx;positions[k++]=by;positions[k++]=bz+wz;
        positions[k++]=ax-wx;positions[k++]=ay;positions[k++]=az-wz;
        positions[k++]=bx+wx;positions[k++]=by;positions[k++]=bz+wz;
        positions[k++]=bx-wx;positions[k++]=by;positions[k++]=bz-wz;
      }
    }
    fg.attributes.position.needsUpdate=true;
  }
  for(let i=0;i<190;i++)for(const side of [-1,1]) {
    const s=24+i*570/189,x=-651+fux*s+fnx*side*12.7,z=-813+fuz*s+fnz*side*12.7;
    box(x,14.4,z,.22,.17,.4,metal);box(x,14.25,z,.18,.1,.22,{tex:'emit',color:[0xe579a3,0x8bb1ef,0xb7dcba][Math.floor(i/20)%3]});
  }
  // HG-L1: a thin eight-metre spray skirt, entirely on the river side of the bank.
  const mistPixels=new Uint8Array(64*64*4);
  for(let y=0;y<64;y++)for(let x=0;x<64;x++){
    const i=(y*64+x)*4,edge=Math.sin(Math.PI*x/63),fade=Math.sin(Math.PI*y/63);
    mistPixels[i]=226;mistPixels[i+1]=234;mistPixels[i+2]=235;
    mistPixels[i+3]=Math.round(110*edge*fade*(.6+.4*Math.sin(x*2.31+y*.59)**2));
  }
  const mistTex=new THREE.DataTexture(mistPixels,64,64,THREE.RGBAFormat);mistTex.needsUpdate=true;
  const mistMat=new THREE.MeshBasicMaterial({map:mistTex,transparent:true,opacity:.38,depthWrite:false,side:THREE.DoubleSide});
  const sprayMist=[];
  for(const side of[-1,1])for(let s=24;s<594;s+=30){
    const p=(u,y)=>new THREE.Vector3(-651+fux*u+fnx*side*28,y,-813+fuz*u+fnz*side*28);
    const a=p(s,-1.35),b=p(Math.min(594,s+34),-1.35),c=p(Math.min(594,s+34),6.65),d=p(s,6.65);
    const g=new THREE.BufferGeometry().setFromPoints([a,b,c,a,c,d]);g.setAttribute('uv',new THREE.Float32BufferAttribute([0,0,1,0,1,1,0,0,1,1,0,1],2));
    const mesh=K.addMesh(new THREE.Mesh(g,mistMat));sprayMist.push(mesh);
  }
  // Warm interior glow and a few actual deck lamps; avoid point lights at pier feet.
  const nightObjects=[],nightLamps=[];
  const warmGlass=new THREE.MeshBasicMaterial({color:0xffcf75,transparent:true,opacity:.22,depthWrite:false,side:THREE.DoubleSide});
  for(const [x,y,z,w,h,r] of[[-870,3,-725,18,3,-.4],[-790,3,-806,22,3,0],[-884,3,-819,10,2,0]]){
    const pane=K.addMesh(new THREE.Mesh(new THREE.PlaneGeometry(w,h),warmGlass));pane.position.set(x,y,z);pane.rotation.y=r;nightObjects.push(pane);
    const light=new THREE.PointLight(0xffcf75,0,26,2);light.position.set(x,y+1,z-2);K.addMesh(light);nightLamps.push(light);
  }
  for(const s of[100,168,236]){
    const p=lowerAt(s,-8);const light=new THREE.PointLight(0xffcf75,0,22,2);light.position.set(p.x,11.7,p.z);K.addMesh(light);nightLamps.push(light);
  }
  const reflectMat=new THREE.MeshBasicMaterial({map:mistTex,color:0xffc66a,transparent:true,opacity:.3,depthWrite:false,side:THREE.DoubleSide});
  for(const [x,z] of[[-871,-796],[-796,-861],[-901,-853]])for(let i=0;i<4;i++){
    const mesh=K.addMesh(new THREE.Mesh(new THREE.PlaneGeometry(1.2+i*.5,12+i*5),reflectMat));mesh.rotation.x=-Math.PI/2;mesh.position.set(x+i*1.1,-1.37,z-i*2);nightObjects.push(mesh);
  }
  const ledDayColors=ledMats.map(m=>m.color.clone());
  fountainColors(false);animateWater(0);
  function setNight(on){
    fountain.visible=on||sceneOptions.get('fountain')==='1';fm.opacity=on?.45:.32;fountainColors(on);
    for(const mist of sprayMist)mist.visible=fountain.visible;
    for(let i=0;i<ledMats.length;i++){const m=ledMats[i];m.opacity=on?.45:.12;if(on)m.color.setHex(0xffcf75);else m.color.copy(ledDayColors[i]);}
    for(const mesh of nightObjects)mesh.visible=on;
    for(const light of nightLamps)light.intensity=on?85:0;
  }
  setNight(sceneOptions.get('night')==='1');
  let registered=false,lastUpdate=-1;
  K.onFrame((dt,t)=>{
    // Engine currently exposes onNight only AFTER place builds. Register on first frame.
    if(!registered&&typeof K.onNight==='function'){K.onNight(setNight);registered=true;setNight((K.scene.fog?.color.r??1)<.05);}
    if(t-lastUpdate>1/30){animateWater(t);lastUpdate=t;}
  });

  // OSM 반포나들목 EAST of Banpo Bridge, NOT the new west-side 세빛섬나들목.
  // Seoul 2014026 distinguishes the two; the audit's rename and 8×3×85m
  // dimensions refer to the west tunnel and must not overwrite this geometry.
  // The article's circular green lookout belongs to 암사초록길, not this park.
  // Retain the mapped axis, extend the bank ramp 28m along
  // its approach cycleway so it emerges beyond all three at-grade road ribbons.
  // Portal elevation/length is inferred; the old bank marker remains underground.
  const ta=[-213.15,-657.14],tb=[-297.9343132274,-791.0994577995],tl=Math.hypot(tb[0]-ta[0],tb[1]-ta[1]),tx=(tb[0]-ta[0])/tl,tz=(tb[1]-ta[1])/tl,tnx=-tz,tnz=tx;
  const tp=(s,off=0)=>[ta[0]+tx*s+tnx*off,ta[1]+tz*s+tnz*off],tr=Math.atan2(tx,tz);
  const tunnelPoly=[tp(-2,-3.3),tp(tl+2,-3.3),tp(tl+2,3.3),tp(-2,3.3)];
  K.groundHole(tunnelPoly);
  strip(tp(-3),tp(0),5.6,0,'sidewalk');strip(tp(tl),tp(tl+3),5.6,0,'sidewalk');
  strip(tp(0),tp(22),5.6,0,'concrete',-4.2,true);strip(tp(22),tp(tl-22),5.6,-4.2,'tile');strip(tp(tl-22),tp(tl),5.6,-4.2,'concrete',0,true);
  for(const side of [-1,1]) {
    K.wall(...tp(0,side*3),...tp(tl,side*3),-4.5,.15,{mat:{tex:'concrete',color:0xb8c9c3},thick:.25});
    K.wall(...tp(22,side*2.86),...tp(tl-22,side*2.86),-3.85,-3.05,{mat:0x588d9b,thick:.035,solid:false});
    K.wall(...tp(22,side*2.86),...tp(tl-22,side*2.86),-3.05,-2.96,{mat:0xb7c9b0,thick:.035,solid:false});
    rail(tp(0,side*3.22),tp(21,side*3.22),.17);
    rail(tp(tl-21,side*3.22),tp(tl,side*3.22),.17);
  }
  const roof=[tp(22,-3.3),tp(tl-22,-3.3),tp(tl-22,3.3),tp(22,3.3)];
  K.slab(roof,-.35,{mat:'asphalt',under:0xe0e6e2,thick:.32,walk:false});
  // Two pedestrian bands, a tactile center strip and repeated approach arrows.
  for(const side of [-1,1])strip(tp(22,side*1.4),tp(tl-22,side*1.4),2.5,-4.185,side<0?0xb7c7c1:0xd8d3c2);
  strip(tp(0),tp(22),.24,.018,0xd7b951,-4.182);
  strip(tp(22),tp(tl-22),.24,-4.17,0xd7b951);
  strip(tp(tl-22),tp(tl),.24,-4.182,0xd7b951,.018);
  K.texture('hangang-tunnel-waves',512,256,(g,w,h)=>{
    g.fillStyle='#dce7df';g.fillRect(0,0,w,h);
    for(let j=0;j<6;j++){g.strokeStyle=['#7aabae','#a1bcb5','#547f94'][j%3];g.lineWidth=6;g.beginPath();for(let x=0;x<=w;x+=8){const y=h*.45+j*15+Math.sin(x/80+j*.6)*22;x?g.lineTo(x,y):g.moveTo(x,y);}g.stroke();}
  },[5.5,1.6]);
  for(let s=28;s<tl-22;s+=9){
    const p=tp(s);box(p[0],-.77,p[1],2.3,.08,.18,{tex:'emit',color:0xfff1cc},false,tr);
    for(const side of [-1,1]){
      const q=tp(s,side*2.84);
      box(q[0],-4.12,q[1],.13,3.35,.16,0x83a4a6,false,tr);
    }
  }
  for(let s=35;s<tl-28;s+=23) {
    for(const side of [-1,1]) {
      const a=tp(s-2.75,side*2.81),b=tp(s+2.75,side*2.81);
      K.quad('hangang-tunnel-waves',[[a[0],-2.85,a[1]],[b[0],-2.85,b[1]],[b[0],-1.25,b[1]],[a[0],-1.25,a[1]]],[-side*tnx,0,-side*tnz]);
    }
    const p=tp(s+6);
    K.sign('반포한강공원 ↑',{x:p[0],y:-1.5,z:p[1],w:3.6,h:.65,rotY:tr+Math.PI,bg:'#174b5d',fg:'#ffffff',offset:.04});
    K.sign('고속터미널역 ↑',{x:p[0],y:-1.5,z:p[1],w:3.6,h:.65,rotY:tr,bg:'#174b5d',fg:'#ffffff',offset:.04});
    const q=tp(s,1.35);K.floorText('↑ 한강공원',{x:q[0],y:-4.16,z:q[1],w:1.7,h:1.3,rotY:tr+Math.PI,fg:'#285665'});
  }
  for(const [s,face] of [[22,tr+Math.PI],[tl-22,tr]]) {
    // Concrete shoulders and a deep lintel reveal the actual tunnel opening.
    for(const side of [-1,1]){const p=tp(s,side*3.08);box(p[0],-4.4,p[1],.52,4.7,1.2,0x839a99,true,tr);}
    const p=tp(s);box(p[0],-.73,p[1],6.7,.95,1.2,0x839a99,true,tr);
    const q=tp(s+(s===22?-.7:.7));
    K.sign(['반포나들목',s===22?'반포한강공원 · 세빛섬':'고속터미널역 방면'],{x:q[0],y:-1.35,z:q[1],w:5.2,h:.75,rotY:face,bg:'#244e58',fg:'#ffffff'});
    const lp=tp(s+(s===22?-1:1));box(lp[0],-.83,lp[1],4.7,.08,.2,{tex:'emit',color:0xffe8b2},false,tr);
  }
  for(const [s,text,face] of [[-1,'반포나들목 · 반포한강공원',tr+Math.PI],[tl+1,'반포나들목 · 고속터미널역',tr]]) {
    const p=tp(s,3.7);box(p[0],0,p[1],.16,3.3,.16,dark);
    K.sign(text,{x:p[0],y:2.6,z:p[1],w:5.5,h:.85,rotY:face,bg:'#244e58',fg:'#ffffff',twoSided:true});
  }
  K.zone({name:'반포나들목',floor:'지하통로',sub:'올림픽대로 하부 · 반포한강공원 연결',poly:tunnelPoly,y0:-4.4,y1:0,priority:8});
  strip(tp(tl+3),[-305.53,-799.57],5,0,'sidewalk');
  const way=tp(tl+4,7.5);
  sign(['고속터미널역 8-1번 출구','세빛섬 · 달빛광장 ←'],way[0],2.2,way[1],5,1.1,tr);

  // CU follows its rotated two-storey OSM footprint. A solid fascia encloses the
  // shop front; the stair is behind an internal wall, with both landings clear.
  const up=building(320797969).poly,uf=[(up[2][0]+up[3][0])/2,(up[2][1]+up[3][1])/2];
  const ul=Math.hypot(up[3][0]-up[2][0],up[3][1]-up[2][1]),ux=(up[3][0]-up[2][0])/ul,uz=(up[3][1]-up[2][1])/ul,ur=Math.atan2(-uz,ux);
  const cup=(a,b)=>[uf[0]+ux*a+uz*b,uf[1]+uz*a-ux*b];
  const cur=(a,b,c,d)=>[cup(a,b),cup(c,b),cup(c,d),cup(a,d)];
  const cub=(a,y,b,w,h,d,mat,solid=false)=>{const p=cup(a,b);box(p[0],y,p[1],w,h,d,mat,solid,ur);};
  const csign=(text,a,y,b,w,h,bg='#63398a',fg='#ffffff')=>{const p=cup(a,b);sign(text,p[0],y,p[1],w,h,ur,bg,fg);};
  const stairHole=cur(-3.65,2.65,-.95,15.4);
  K.slab(up,0,{mat:'tile'});K.slab(up,3.4,{mat:'wood',holes:[stairHole]});
  K.stairs(...cup(-2.3,3),...cup(-2.3,15),{w:2.4,ya:0,yb:3.4,mat:'concrete'});
  K.slab(cur(-3.65,15,-.85,17.3),3.4,{mat:'wood',thick:.18});
  K.wall(...cup(-.8,3),...cup(-.8,14.8),0,3.2,{mat:0xd7dbce,thick:.16});
  rail(cup(-.95,2.65),cup(-.95,14.85),3.4,true);
  rail(cup(-3.65,2.65),cup(-.95,2.65),3.4,true);
  csign('2층 휴게공간 ↑',-2.3,2.2,2.7,2.4,.45,'#f2f0e5','#476244');
  // Opaque rear/side panels, glazed front and clear 2.3m entrance on the south face.
  K.polyWalls(up,0,3.4,{mat:0xe7e6dc,thick:.16,openings:[{edge:2,at:ul*.5+1.15,w:2.3,y0:0,y1:2.7},{edge:2,at:1.7,w:2.7,y0:.65,y1:2.7}]});
  K.wall(...cup(-ul/2+.35,0),...cup(-ul/2+3.05,0),.65,2.7,{mat:'glass',thick:.035});
  K.polyWalls(up,3.4,6.8,{mat:'glass',thick:.035});
  K.slab(up,6.8,{mat:'metal'});
  for(const a of [-ul/2+.12,ul/2-.12]){cub(a,0,10,.18,6.8,20,0x87928c);}
  cub(0,2.72,-.12,ul+.25,.68,.3,0x63398a);
  cub(0,2.66,-.31,ul+.25,.075,.04,0xb5d66f);
  cub(0,3.35,0,ul+.6,.16,1.25,0xd7dcd3);
  csign('CU',-2.3,3.02,-.31,2.6,.54,'#63398a','#b8db79');
  csign('반포한강공원',1.7,3.02,-.31,3.5,.48);
  csign('편의점 · 음료 · 간식',-2.5,1.25,-.23,2.2,.5,'#f3f3e9','#405c43');
  // Door jambs preserve the opening; no transparent collision plane spans it.
  for(const a of [0,2.3])cub(a,0,-.03,.08,2.7,.12,0x718b7d);
  const ce=cup(2.3,17.2);
  lift({name:'CU 승강기',x:ce[0],z:ce[1],w:1.7,d:1.7,floors:[{label:'1층',y:0,name:'편의점'},{label:'2층',y:3.4,name:'휴게공간'}]});
  cub(2.7,0,3.2,1.6,.95,.7,0xc9c9b6,true);cub(2.7,.95,3.2,1.7,.06,.8,0xf0ede0);cub(2.9,1.01,3.25,.35,.32,.2,dark);
  csign('계산대',2.6,2.1,3.3,1.6,.4,'#f0f1e5','#476443');
  for(const b of [7,11]) {
    cub(.8,0,b,2.5,1.55,.52,0xe0dfd0,true);
    for(let j=0;j<4;j++){
      cub(.8,.16+j*.36,b-.1,2.58,.045,.62,0x81968e);
      for(let i=0;i<7;i++)cub(-.26+i*.34,.2+j*.36,b-.22,.22,.25,.2,[0xcaba6e,0x85a9ac,0xb77568,0xb5c88e][(i+j)%4]);
    }
  }
  for(const b of [7,10,13]){
    cub(3.65,0,b,.65,2.25,2.3,0xa8b9ad,true);cub(3.28,.18,b,.04,1.9,2.12,{tex:'glass',color:0xa8d6cc});
    for(let j=0;j<4;j++)for(let i=0;i<6;i++)cub(3.25,.3+j*.43,b-.85+i*.32,.11,.25,.17,[0x90b9a2,0xd8c26f,0x87adc8][i%3]);
  }
  csign('음료 · 냉장',3.0,2.65,11,2.2,.4,'#f0f1e5','#476443');
  cub(3.35,3.4,8,.65,.88,9,0x9d855f,true);
  for(const b of [4.8,7.2,9.6,12]){const p=cup(2.45,b);chair(p[0],3.4,p[1],ur-Math.PI/2,0x819f8c);}
  for(const b of [5,10]){const p=cup(.8,b);table(p[0],3.4,p[1]);}
  csign('2층 휴게공간',0,5.7,18.5,4,.65,'#f0f1e5','#476443');
  for(const y of [3.08,6.48])for(const b of [3,7,11,16])cub(.7,y,b,1.6,.04,.45,{tex:'emit',color:0xfff2d4});
  for(let i=0;i<2;i++)K.zone({name:'CU 반포한강공원',floor:(i+1)+'층',sub:i?'휴게공간':'편의점 · 음료 · 간식',poly:up,y0:i*3.4,y1:(i+1)*3.4,priority:5});
  for(const [id,label] of [[560449164,'화장실'],[1067146733,'자전거 대여']]) {
    const p=building(id).poly,b=K.polyBBox(p),cx=(b[0]+b[2])/2,cz=(b[1]+b[3])/2;
    K.slab(p,0);K.polyWalls(p,0,3,{mat:0xabbcb2,openings:[{x:cx,z:b[3],w:1.6,y0:0,y1:2.5}]});K.slab(p,3,{mat:'metal'});sign(label,cx,2.5,b[3]+.15,3.1,.6);
    if(id===560449164){K.wall(cx,cz,cx,b[1],0,2.6,{mat:0xd0d7ce});for(const x of [cx-1,cx+1])box(x,.7,cz,.6,.15,.4,0xe6ece5);}
  }
  // Park car parks with actual polygon limits, marked stalls and static parked cars.
  for(const id of [320797972,320797230]) {
    const p=area(id).poly,b=K.polyBBox(p);K.hpoly({tex:'parking',color:0xaaaaa3},p,.08);
    for(let z=b[1]+5;z<b[3]-4;z+=12)for(let x=b[0]+4;x<b[2]-4;x+=3) {
      if(!inside([x,z],p,3))continue;
      box(x-1.35,.087,z,.08,.005,5,0xe7e6da);
      if(rnd()<.6)K.vehicle({x,y:.08,z,kind:'car',rotY:0,solid:true});
    }
    sign('반포한강공원 '+(id===320797972?'2':'1')+'주차장',(b[0]+b[2])/2,2.5,b[3],9,.9);
  }
  // Far-bank silhouettes only, beyond the detailed OSM boundary (avoid duplicate city buildings).
  for(let i=0;i<22;i++) {
    const x=-1600+i*72,z=-2260-(i%4)*42,h=45+(i%7)*9;
    box(x,0,z,30,h,23,{tex:'apt',color:0xaab7bd});
    box(x,h,z,21,2,18,0x8c9ba7);
  }
  // HG-T2: the February views have layered blue-grey ridgelines, not a green
  // hemisphere. These distant, non-colliding profiles are an unsurveyed backdrop;
  // retain the existing Namsan tower and its 150m summit anchor.
  const distantRidges=[
    {z:-2860,front:-2640,color:0x9ba9b7,points:[[-1820,32],[-1620,58],[-1440,49],[-1250,103],[-1090,81],[-930,136],[-760,107],[-570,121],[-390,78],[-220,99],[-40,64],[190,73],[390,28]]},
    {z:-2550,front:-2350,color:0x8a98a8,points:[[-1580,18],[-1400,45],[-1260,39],[-1130,69],[-1010,87],[-900,104],[-790,138],[-700,150],[-610,135],[-490,103],[-350,92],[-220,59],[-80,67],[80,31],[220,12]]},
  ];
  for(const ridge of distantRidges)for(let i=1;i<ridge.points.length;i++){
    const a=ridge.points[i-1],b=ridge.points[i];
    K.quad(ridge.color,[[a[0],-5,ridge.front],[b[0],-5,ridge.front],[b[0],b[1],ridge.z],[a[0],a[1],ridge.z]],[0,1,1]);
    K.quad(ridge.color,[[a[0],a[1],ridge.z],[b[0],b[1],ridge.z],[b[0],-5,ridge.z-180],[a[0],-5,ridge.z-180]],[0,1,-1]);
  }
  K.cyl({x:-700,y:150,z:-2550,r:3,h:68,seg:12,mat:0xc4ccd0,solid:false});
  K.cyl({x:-700,y:206,z:-2550,r:12,h:10,seg:16,mat:0xc9d0d3,solid:false});
  K.cyl({x:-700,y:216,z:-2550,r:.65,h:27,seg:8,mat:0xd8dedf,solid:false});

  // Eight intentional arrival points. Upper floors remain reachable by stairs and lifts.
  for(const s of [
    {name:'달빛광장 · 분수 관람',x:-629,y:.09,z:-736,yaw:.35},
    {name:'가빛섬 · 카페돌체',x:-882,y:0,z:-723,yaw:1.3},
    {name:'가빛섬 · 비스타 루프탑 전망',x:-881,y:23,z:-731,yaw:-.9},
    {name:'채빛섬 · 채빛 퀴진',x:-775,y:7,z:-816,yaw:1.2},
    {name:'솔빛섬 · 무드서울',x:-883,y:0,z:-828,yaw:1.57},
    {name:'잠수교 · 한강 산책',x:-700,y:1.6,z:-934,yaw:.37},
    {name:'반포대교 · 상층',x:-689.1,y:15.13,z:-940,yaw:.37},
    {name:'반포나들목 · 공원 입구',x:-297.9343132274,y:0,z:-791.0994577995,yaw:.56},
  ])K.spawn({...s,group:'반포한강공원 · 세빛섬'});
}
