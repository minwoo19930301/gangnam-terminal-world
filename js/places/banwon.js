// OSM 413354848; local u=ENE, v=SSE. Road on west, park on north/east.
// Round19: frame-aligned road centreline, hedge opening, shaded entry and open tree crowns.
// Floor heights/core/room plan remain inferred; the OSM footprint is unchanged.
// No JUNCTIONS or WELLS name this module. Park and roads remain city-owned.
export const meta = {
  id: 'banwon', name: '반원상가 · 한신치킨호프', claims: [413354848], claimRoads: [], claimAreas: [],
  sources: ['data/osm.json', 'refs/aerial/newcore_banwon.jpg',
    'refs/roadview/banwon_01_front.jpg', 'refs/roadview/banwon_02_across_towers.jpg',
    'refs/interior/banwon/notes.json', 'refs/interior/streets_islands/notes.json',
    'https://m.blog.naver.com/dockdm12/224444904805', 'https://m.blog.naver.com/fewlove11/224458808662',
    'https://m.blog.naver.com/qkrthwjd655/224448552779', 'https://m.blog.naver.com/chloe_ponggee/224455066913',
    'https://m.blog.naver.com/dktjtidnj/224459455661', 'https://m.blog.naver.com/h99578/224460314042',
    'https://www.youtube.com/watch?v=KFygWqMvrY8'],
};

export function build(K) {
  const footprint = K.osmBuilding(413354848)[0]?.poly || [[-138.96,-382.48],[-98.27,-396.88],[-111.6,-434.01],[-152.28,-419.62]];
  const R = Math.atan2(14.39,40.68), C = Math.cos(R), S = Math.sin(R), W = 43.15, D = 39.45;
  const G = 1.2, FH = 3.6, roof = 8.4, floors = [1.2,4.8];
  const west = R-Math.PI/2, north = R+Math.PI, east = R+Math.PI/2;
  const P = (u,v) => [-152.28+u*C+v*S,-419.62-u*S+v*C];
  const rect = (a,b,c,d) => [P(a,b),P(c,b),P(c,d),P(a,d)];
  const B = (u,y,v,w,h,d,mat,o={}) => { const [x,z]=P(u,v); K.box({x,y,z,w,h,d,rotY:R,mat,...o}); };
  const wall = (a,b,c,d,y0,y1,o={}) => K.wall(...P(a,b),...P(c,d),y0,y1,o);
  const slab = (a,b,c,d,y,o={}) => K.slab(rect(a,b,c,d),y,o);
  const sign = (t,u,y,v,w,h,rotY=R,bg='#eee8d9',fg='#303d38',o={}) => { const [x,z]=P(u,v); K.sign(t,{x,y,z,w,h,rotY,bg,fg,...o}); };
  const cyl = (u,y,v,r,h,mat,o={}) => { const [x,z]=P(u,v); K.cyl({x,y,z,r,h,mat,seg:12,...o}); };
  const rod=(a,b,r,mat)=>{
    const v=new K.THREE.Vector3(...b).sub(new K.THREE.Vector3(...a)).normalize();
    const n=new K.THREE.Vector3(v.z,0,-v.x).normalize(),q=new K.THREE.Vector3().crossVectors(v,n).normalize();
    const ring=t=>[n.clone().multiplyScalar(r),q.clone().multiplyScalar(r),n.clone().multiplyScalar(-r),q.clone().multiplyScalar(-r)].map(p=>p.add(new K.THREE.Vector3(...t)).toArray());
    const aa=ring(a),bb=ring(b);
    for(let i=0;i<4;i++){const j=(i+1)%4,normal=new K.THREE.Vector3().fromArray(aa[i]).sub(new K.THREE.Vector3(...a)).add(new K.THREE.Vector3().fromArray(aa[j]).sub(new K.THREE.Vector3(...a))).normalize();K.quad(mat,[aa[i],aa[j],bb[j],bb[i]],normal.toArray());}
  };
  const ramp = (a,b,c,d,ya,yb,w,o={}) => K.ramp(...P(a,b),...P(c,d),{ya,yb,w,mat:'concrete',...o});
  const zone = (name,floor,a,b,c,d,y0,y1,sub,priority=18) => K.zone({name,floor,poly:rect(a,b,c,d),y0,y1,sub,priority});
  const person = (u,y,v,o={}) => { const [x,z]=P(u,v); K.person(x,y,z,o); };
  const spawn = (name,u,y,v,yaw) => { const [x,z]=P(u,v); K.spawn({name,x,y,z,yaw}); };
  const stone={tex:'concrete',color:0xc4c3bc}, steel={color:0xc9cdd0,gloss:.5}, trim=0x667577;
  const tile={tex:'tile',color:0xcecabb,scale:[2.4,2.4],gloss:.3};
  const paving='banwon-paving', diningFloor={tex:'concrete',color:0x827d73};
  K.texture('banwon-paving',512,512,(g,w,h)=>{
    g.fillStyle='#99958c';g.fillRect(0,0,w,h);
    for(let row=0;row<8;row++)for(let col=-1;col<5;col++){
      g.fillStyle=['#a39f95','#93918a','#aba79d','#96958e'][(row*3+col+5)%4];
      g.fillRect(col*128+(row%2)*64+2,row*64+2,124,60);
    }
  },[2.4,2.4]);
  K.texture('banwon-panel',256,256,(g,w,h)=>{
    g.fillStyle='#d9dadc';g.fillRect(0,0,w,h);g.strokeStyle='#a2a7aa';g.lineWidth=2;g.strokeRect(0,0,w,h);
    g.strokeStyle='#cdcec8';g.lineWidth=1;g.strokeRect(4,4,w-8,h-8);
  },[2.4,1.2]);
  // The shared gloss uses a warm interior environment, which washed this exterior
  // charcoal stone brown in r15. Local PBR gives a restrained sheen without that map.
  const portalStone=K.material('banwon-charcoal-r17',new K.THREE.MeshStandardMaterial({color:0x0c0d0f,roughness:.5,metalness:.12}));
  const entryGlass=K.material('banwon-entry-glass-r19',new K.THREE.MeshStandardMaterial({color:0x2a2f33,roughness:.2,metalness:.35,transparent:true,opacity:.92,depthWrite:true,side:K.THREE.DoubleSide}));
  K.texture('banwon-grey-road',256,256,(g,w,h)=>{
    g.fillStyle='#55575b';g.fillRect(0,0,w,h);const rnd=K.rand(417);
    for(let i=0;i<2200;i++){g.fillStyle=i%2?'#626467':'#484b4e';g.fillRect(rnd()*w,rnd()*h,1,1);}
  },[3,3]);
  // BW-D2: cladding on the exact OSM walls; city keeps the building mass/collision.
  for(const[key,base,glass,frame]of [
    ['banwon-blue-glass','#8fb1d2','#7698ba','#e1e5e6'],
    ['banwon-deep-glass','#2d4c7c','#233f65','#6e889b'],
    ['banwon-beige-window','#c9c2ad','#6c7977','#d7d5c8'],
    ['banwon-punched-window','#cfd0cf','#405362','#d9dcda']])K.texture(key,256,256,(g,w,h)=>{
      g.fillStyle=base;g.fillRect(0,0,w,h);
      const pad=key==='banwon-punched-window'||key==='banwon-beige-window'?28:5;
      g.fillStyle=glass;g.fillRect(pad,14,w-pad*2,h-40);
      g.fillStyle=frame;g.fillRect(126,14,4,h-40);g.fillRect(pad,132,w-pad*2,4);
      g.fillStyle='rgba(209,225,232,.16)';g.fillRect(pad+4,18,35,h-48);
    },[3,2.95]);
  // Directly coloured aggregate: tinting the dark shared asphalt made the red lane maroon.
  K.texture('banwon-red-road',256,256,(g,w,h)=>{
    g.fillStyle='#c45b4d';g.fillRect(0,0,w,h);
    const rnd=K.rand(415);
    for(let i=0;i<2000;i++){g.fillStyle=i%3?'#d16b5b':'#ad5149';g.fillRect(rnd()*w,rnd()*h,1.2,1.2);}
  },[3,3]);
  K.texture('banwon-vinyl',1024,512,(g,w,h)=>{
    // One cloudy skin, not clear glazing plus floating, mirrored word decals.
    g.fillStyle='rgba(232,224,201,.48)';g.fillRect(0,0,w,h);
    for(let i=0;i<52;i++){
      const x=i*20;g.strokeStyle=i%2?'rgba(255,247,223,.64)':'rgba(128,118,96,.35)';g.lineWidth=i%3+1;
      g.beginPath();g.moveTo(x,0);g.lineTo(x+13,170);g.lineTo(x-7,350);g.lineTo(x+9,h);g.stroke();
    }
    // Marker loops/hearts follow the photographed vinyl; no invented readable slogans.
    g.strokeStyle='rgba(43,40,32,.67)';g.lineWidth=2.1;
    for(let i=0;i<92;i++){
      const x=12+(i*113)%990,y=22+(i*67)%468;
      g.beginPath();g.moveTo(x,y);g.lineTo(x+20,y-9);g.lineTo(x+7,y+18);g.lineTo(x+35,y+10);g.stroke();
      if(i%4===0){g.beginPath();g.moveTo(x,y+10);g.bezierCurveTo(x-24,y-13,x+2,y-23,x+8,y-9);g.bezierCurveTo(x+26,y-27,x+41,y-3,x,y+10);g.stroke();}
    }
  },[2.8,1.6],{transparent:true});
  for(const[key,base,light]of [['banwon-drape','#aa3e22','#d76534'],['banwon-awning','#cc642a','#e7984c']])K.texture(key,512,256,(g,w,h)=>{
    g.fillStyle=base;g.fillRect(0,0,w,h);
    for(let i=0;i<70;i++){g.fillStyle=i%3?light:'#633a27';g.globalAlpha=i%3?.21:.22;g.fillRect(i*7.5,0,2+i%3,h);}
    g.globalAlpha=1;g.strokeStyle='#c99a72';g.lineWidth=2;g.strokeRect(3,4,w-6,h-8);
  },[2.7,.8]);
  // Open steel handrails; the waist-height tube also provides collision.
  const rail=(a,b,c,d,ya,yb,h=1.02)=>{
    const A=P(a,b),Z=P(c,d),L=Math.hypot(c-a,d-b),n=Math.ceil(L/1.2),nx=-(Z[1]-A[1])/L,nz=(Z[0]-A[0])/L;
    for(let i=0;i<=n;i++){const t=i/n;cyl(a+(c-a)*t,ya+(yb-ya)*t,b+(d-b)*t,.025,h,steel,{seg:6,solid:false});}
    for(const hh of [.36,.7,h])for(const s of [1,-1])K.quad(steel,[[A[0],ya+hh,A[1]],[Z[0],yb+hh,Z[1]],[Z[0],yb+hh+.045,Z[1]],[A[0],ya+hh+.045,A[1]]],[nx*s,0,nz*s]);
    for(let i=0;i<n;i++){const t=i/n,q=(i+1)/n,y=ya+(yb-ya)*t,yy=ya+(yb-ya)*q;
      wall(a+(c-a)*t,b+(d-b)*t,a+(c-a)*q,b+(d-b)*q,Math.min(y,yy)+.7,Math.max(y,yy)+.745,{mat:steel,thick:.035});}
  };

  // Raised street-facing plinth; shallow risers between the narrow stair and long ramp.
  K.prism(footprint,-.12,G,{mat:stone});
  slab(-3.1,0,.1,D,G,{mat:'darkstone',thick:.22});
  for(const [a,b]of [[0,17.3],[22.7,D]])wall(-3.1,a,-3.1,b,0,G,{mat:stone});
  ramp(-6.7,20,-3.1,20,0,G,5.4,{steps:true,rails:false,mat:{tex:'concrete',color:0xb7b6b0}});
  rail(-6.7,17.3,-3.1,17.3,0,G,.94);rail(-6.7,22.7,-3.1,22.7,0,G,.94);
  ramp(-4.35,38,-4.35,22.7,0,G,2,{rails:false});
  slab(-5.35,22,-3,23.3,G,{mat:'darkstone',thick:.12});
  rail(-5.35,38,-5.35,22.7,0,G);
  rail(-3.35,37.9,-3.35,24.4,0,G*13.5/15.3);
  rail(-3.15,0,-3.15,17.3,G,G);rail(-3.15,24.5,-3.15,38.8,G,G);
  // BW-L2: road → granite kerb → one planted strip → block paving → stair/ramp.
  slab(-8.3,-2,-5.5,D+2,.08,{mat:paving,thick:.08,ceil:false});
  slab(-9.7,14.8,-6.7,21.7,.08,{mat:paving,thick:.08,ceil:false});
  B(-9.55,0,19.7,.24,.16,43.4,{tex:'concrete',color:0xcacbc7});
  B(-6.99,.082,19.7,.3,.012,41.8,0xd7b344,{solid:false});
  for(let v=-1;v<D+1;v+=.16)B(-6.99,.095,v,.19,.006,.025,0xbca04b,{solid:false});
  // Park-side 1F deck and two gentle approaches ending at y=0.
  slab(0,-3.5,W+3.5,0,G,{mat:paving,thick:.18});
  slab(W,-3.5,W+3.5,35,G,{mat:paving,thick:.18});
  // Two metres of clear circulation outside the vinyl enclosure, at shop level.
  slab(24,-7.4,W+5.2,-3.4,G,{mat:paving,thick:.18});
  ramp(5,-5.1,20.2,-5.1,0,G,2.1,{rails:false});
  slab(19.7,-6.2,24,-3.4,G,{mat:paving,thick:.16});
  ramp(W+1.9,50,W+1.9,35,0,G,2.4,{rails:false});
  rail(W+3.3,50,W+3.3,35,0,G);
  // Permanent open doors in the storefront glazing.
  const doors=[[0,20,3.6],[0,7,2.4],[0,27.5,2.2],[0,33.5,2.4],[21,0,2.8],[31,0,2.8],[39.2,0,6.8],[W,5.2,7.7],[W,13,2.5],[W,20,3.4],[W,29,8.6]];
  const openings=doors.map(([u,v,w])=>{const[x,z]=P(u,v);return{x,z,w,y0:G,y1:G+2.65};});
  K.polyWalls(footprint,G,G+FH,{mat:'glass',inner:'glass',thick:.08,openings});
  for(const v of [0,12.4,17.5,22.5,26,35,D])B(.15,G,v,.36,FH,.32,trim);
  for(const u of [0,17.5,23.5,34.3,W])for(const v of [.14,D-.14])B(u,G,v,.34,FH,.34,trim);
  for(const v of [0,9.3,16,24,35,D])B(W-.15,G,v,.32,FH,.32,trim);
  const stairHole=rect(5.15,8.8,11.25,17.8);
  const uses=['은행 · 약국 · 음식점','비에이블 스터디카페 · 의원 · 학원 · 태권도'];
  floors.forEach((y,f)=>{
    K.slab(footprint,y,{mat:tile,holes:f?[stairHole]:[],thick:.24});
    K.zone({name:'반원상가',floor:`${f+1}F`,sub:uses[f],poly:footprint,y0:y,y1:y+FH,priority:8});
    if(f){
      const windows=[];
      for(const v of [4.8,12.4,27,34.8])for(const u of [0,W]){
        const[x,z]=P(u,v);windows.push({x,z,w:5.7,y0:y+.9,y1:y+2.75});
        wall(u,v-2.85,u,v+2.85,y+.9,y+2.75,{mat:'glass',thick:.035});B(u,y+.9,v,.10,1.85,.055,trim,{solid:false});
      }
      for(const u of [5,13,21,29,37.5])for(const v of [0,D]){
        const[x,z]=P(u,v);windows.push({x,z,w:5.8,y0:y+.9,y1:y+2.75});
        wall(u-2.9,v,u+2.9,v,y+.9,y+2.75,{mat:'glass',thick:.035});B(u,y+.9,v,.055,1.85,.1,trim,{solid:false});
      }
      K.polyWalls(footprint,y,y+FH,{mat:'banwon-panel',inner:0xe5dfd3,thick:.2,openings:windows});
    }
    K.polyWalls(footprint,y+FH-.2,y+FH,{mat:0xc4c6bf,thick:.3,solid:false});
    // A 4m-wide cross corridor, with all shop partitions outside lazy groups.
    const op=(at,w=2.2)=>({at,w,y0:y,y1:y+2.65});
    wall(.25,18,19,18,y,y+3.35,{mat:0xe8e3d7,openings:[op(7.95,6.5),op(15)]});
    wall(.25,22,19,22,y,y+3.35,{mat:0xe8e3d7,openings:f?[op(8)]:[op(3.5),op(8)]});
    wall(23,18,W-.2,18,y,y+3.35,{mat:0xe8e3d7,openings:[op(8,2.6),op(15.2,2.5)]});
    wall(23,22,W-.2,22,y,y+3.35,{mat:0xe8e3d7,openings:[op(8,2.4)]});
    for(const u of [19,23]){
      wall(u,.25,u,18,y,y+3.35,{mat:0xe8e3d7,openings:[op(5.7),op(13)]});
      wall(u,22,u,D-.2,y,y+3.35,{mat:0xe8e3d7,openings:[op(7.8)]});
    }
    sign([`${f+1}층`,uses[f]],f?16.4:12,y+2.7,18.15,4,.8);sign('계단',8.2,y+2.9,18.14,2,.45,R,'#306655','#fff');
    sign('승강기',21,y+2.7,28,1.8,.45,north);
    if(f){rail(5.15,8.8,5.15,17.65,y,y);rail(11.25,8.8,11.25,17.65,y,y);rail(5.15,8.8,11.25,8.8,y,y);}
    if(f<floors.length-1){
      ramp(6.7,17.8,6.7,10.4,y,y+FH/2,2.6,{steps:true});
      slab(5.15,8.85,11.25,10.45,y+FH/2,{mat:'darkstone',thick:.16});
      ramp(9.7,10.4,9.7,17.8,y+FH/2,y+FH,2.6,{steps:true});
    }
  });
  const[ex,ez]=P(21,31.4);
  K.elevator({name:'반원상가 승강기',x:ex,z:ez,rotY:north,w:2.5,d:2.5,floors:floors.map((y,i)=>({label:`${i+1}F`,y,name:uses[i]})),mat:0xc8c7bd});
  // KFygWqMvrY8_5 and the georeferenced aerial show a green roof surface.
  // No playing-field markings or public rooftop sports use are established.
  K.slab(footprint,roof,{mat:{tex:'concrete',color:0x4c8b68},thick:.24});K.polyWalls(footprint,roof,roof+.65,{mat:'banwon-panel',thick:.25});
  B(8.2,roof,13.2,7.3,2.2,10,'banwon-panel');
  for(const u of [17,23,29,35]){B(u,roof+.12,28,2.6,1,1.9,0xbbbdb8);for(let k=0;k<7;k++)B(u-1+k*.33,roof+.9,28,.09,.23,1.5,0x747e7f,{solid:false});}

  // KFygWqMvrY8_60: charcoal square-panel entrance with three light fins.
  wall(-.65,16.6,-.65,23,G,11.2,{mat:portalStone,thick:.7,openings:[{at:3.4,w:3.2,y0:G,y1:G+2.65}]});
  for(let y=G+1.2;y<11.2;y+=1.2){
    if(y<G+2.65){B(-1.015,y,17.5,.02,.016,1.8,0x20232a,{solid:false});B(-1.015,y,22.3,.02,.016,1.4,0x20232a,{solid:false});}
    else B(-1.015,y,19.8,.02,.016,6.4,0x20232a,{solid:false});
  }
  for(let v=17.8;v<23;v+=1.2){const y=v>18.4&&v<21.6?G+2.65:G;B(-1.015,y,v,.02,11.2-y,.016,0x20232a,{solid:false});}
  for(const v of [18.25,19.8,21.35])B(-1.04,9.55,v,.26,1.18,.35,0xd5d4cd,{solid:false});
  sign('BAN WON',-1.03,8.64,19.8,4.8,.59,west,null,'#f5f5f5');
  sign('반원상가',-1.03,4.53,19.8,4.25,.43,west,'#454b48','#e6e0cf');
  sign('인후과 +',-1.03,6.5,19.8,5.95,.94,west,'#f3f3ed','#17464b');
  sign('진료 안내',-1.04,5.66,19.8,4.55,.48,west,'#376a8e','#fff');
  sign('의원 · 약국',-1.04,5.13,19.8,4.55,.32,west,'#497c9b','#fff');
  // BW-D1: dark glass leaves and two offset screens stop the bright corridor sightline.
  // Side liners sit IN FRONT of the cream corridor faces (v18.1/21.9), not inside them.
  // The first screen leaves 1.23m at the south; the second leaves 1.28m at the north.
  slab(-.9,18.3,5,21.7,4.02,{mat:0x191d20,under:0x15191c,thick:.1,walk:false});
  for(const v of [18.13,21.87])wall(-.4,v,5,v,G,G+2.9,{mat:0x262d31,thick:.035,solid:false});
  for(const v of [18.38,21.62])B(-1.05,G,v,.12,2.65,.08,0x202b2a,{solid:false});
  wall(-.84,18.4,-.84,21.6,G,G+2.6,{mat:entryGlass,thick:.035,openings:[{at:1.6,w:1.4,y0:G,y1:G+2.6}]});
  for(const v of [19.3,20.7]){B(-.88,G,v,.055,2.6,.05,0x151c20,{solid:false});B(-.95,G+.8,v,.05,.45,.04,steel,{solid:false});}
  wall(-.81,19.3,.34,19.3,G,G+2.6,{mat:entryGlass,thick:.035});
  for(const y of [G,G+2.55])B(-.235,y,19.3,1.2,.05,.045,0x151c20,{solid:false});
  B(.34,G,19.3,.045,2.6,.045,0x151c20,{solid:false});
  wall(4,18.04,4,20.65,G,G+2.8,{mat:0x1a1d20,thick:.12});
  wall(7,19.4,7,21.96,G,G+2.8,{mat:0x1a1d20,thick:.12});
  K.hpoly({tex:'tile',color:0x555a5c,gloss:.3},rect(-.7,18.1,4,21.9),G+.01,true);
  // Red freestanding board visible beside the door; its small type is unreadable.
  B(-1.3,G,22.7,.11,1.35,.47,0x9e3539,{solid:false});
  // Red-bordered triangular speed-hump warning sign beside, not across, the stairs.
  cyl(-8.3,0,21.3,.035,2.18,steel,{solid:false});
  const triangle=(r,y,mat,off)=>{
    const[x,z]=P(-8.35-off,21.3),dx=Math.cos(west),dz=-Math.sin(west);
    const p=[[x-dx*r,y-r*.55,z-dz*r],[x+dx*r,y-r*.55,z+dz*r],[x,y+r,z]];
    K.quad(mat,[...p,p[0]],[Math.sin(west),0,Math.cos(west)]);
  };
  triangle(.55,2.03,0xb83428,0);triangle(.42,2.03,0xf2ca48,.012);
  sign('과속방지턱',-8.4,1.95,21.3,.62,.16,west,null,'#222222');
  // As seen from the road: black tower, then pharmacy, then the blue bank fascia.
  sign('서초21세기약국',-.25,3.95,26.7,6.4,.8,west,'#256eaf','#fff3cc');
  sign('우리은행 WOORI BANK',-.24,3.95,34.8,9.3,.8,west,'#174b89','#fff');
  sign('반원 태권도 · 줄넘기',-.24,8,33.2,10,.68,west,'#f0f0e9','#20282c');
  sign('이비',-.23,6.5,14.4,2.5,.94,west,'#f3f3ed','#183b4a');sign('조현',-.24,6.5,11.5,2.5,.94,west,'#f3f3ed','#183b4a');
  sign('제일의학과',-.24,8,7.5,11.5,.6,west,'#477eac','#edf1f2');
  // Only the initial 더 is legible on this blue lightbox; do not expand the tenant name.
  sign('더',-.32,7.85,24.8,2.4,.78,west,'#f0f1e9','#3866aa');
  for(const v of [27,33.6,38]){
    B(-.27,5.9,v,.08,1.2,3.5,0x131918,{solid:false});
    // Unreadable white copy remains visual strokes, not invented clinic names.
    for(let row=0;row<3;row++)for(let col=0;col<8;col++)B(-.322,6.09+row*.25,v-1.43+col*.39,.025,.12,.23,0xdedfd5,{solid:false});
  }
  for(const v of [7,20,27.5,33.5])for(const s of [-1,1])B(-.1,G,v+s*(v===20?1.82:v===27.5?1.12:1.22),.14,2.7,.08,0xc2c8c6,{solid:false});
  wall(7.5,22.1,7.5,31,G,G+3.35,{mat:0xe5dfd1});
  wall(.15,31,7.5,31,G,G+3.35,{mat:0xe5dfd1});

  // Basement parking is reported in the audit text; neither roadview shows its entry.
  // Closed shutter at the SW street edge is an explicitly inferred marker, not a B1 route.
  B(-3.12,0,42.4,.20,2.45,3.8,stone);
  B(-3.25,.08,42.4,.08,2.14,3.3,0x858d8b,{solid:false});
  for(let i=0;i<18;i++)B(-3.30,.13+i*.115,42.4,.025,.025,3.28,0x596461,{solid:false});
  sign('지하주차장',-3.34,2.65,42.4,3.1,.4,west,'#405452','#eeeade');

  // Shared toilet: central location is hearsay; this room/door geometry is inferred.
  wall(13.8,14.6,19,14.6,G,G+3.35,{mat:0xe8e3d7});
  wall(13.8,14.6,13.8,18,G,G+3.35,{mat:0xe8e3d7});
  // The existing south-wall opening is centred at u15.25, v18.
  B(14.25,G,17.05,.07,2.35,1.65,0xaab2a6);
  sign('화장실',15.25,G+2.7,18.15,2.1,.45,R,'#ecebe0','#3d514b');
  zone('반원상가 공용 화장실','1F',13.9,14.7,18.9,17.9,G,G+FH,'공용 화장실',25);

  // NE corner wraps north/east: the pin/OSM footprint take precedence over blog directions.
  // One restaurant: a broad opening joins the former Hansikdang bay to Hanshin.
  // Retain the rear shop partition and its old doorway. Exact opening size is inferred.
  wall(34.2,.15,34.2,17.9,G,G+3.35,{mat:0xe5dfd1,openings:[
    {at:4.55,w:7.2,y0:G,y1:G+2.6},{at:12.8,w:1.9,y0:G,y1:G+2.5}]});
  wall(23.1,9.4,34.2,9.4,G,G+3.35,{mat:0xe5dfd1,openings:[{at:7.9,w:1.9,y0:G,y1:G+2.5}]});
  const diningPoly=[P(23.2,0),P(W,0),P(W,13),P(34.3,13),P(34.3,9.3),P(23.2,9.3)];
  K.zone({name:'한신치킨호프 · 반원칼국수 (한 가게)',floor:'1F',poly:diningPoly,y0:G,y1:G+FH,sub:'111호 · 반원식당 · 한식당',priority:24});
  K.hpoly(diningFloor,diningPoly,G+.006,true);
  K.slab(diningPoly,G+2.85,{mat:0xe8e3d7,under:0xe8e3d7,thick:.12,walk:false});
  zone('감미옥','1F',34.3,22.2,W,34,G,G+FH,'참숯돼지갈비',24);
  zone('감미옥 야장','1F',W,24,W+3.5,35,G,G+3.1,'참숯돼지갈비 · 야외 좌석',26);
  zone('한신치킨 야장','1F',24,-3.5,W+3.5,0,G,G+3.1,'북측 천막 · 공원 가장자리',26);
  zone('한신치킨 야장','1F',W,0,W+3.5,16,G,G+3.1,'동측 천막',26);
  sign('반원식당',28.7,G+2.95,-.13,10.4,.9,north);
  sign('한신 치킨호프',38.7,G+2.95,-.14,8.2,.9,north,'#a34030','#e9d486');
  sign('반원 칼국수',W+.13,G+2.95,4.6,8.4,.9,east,'#e5dbbf','#773630');
  sign('한신 치킨호프',W+.13,G+2.95,10.2,3.1,.8,east,'#9c4031','#e7d17f');
  // Photo 224455066913_01: Gammiok → stationery → PICNIC STORAGE → noodles.
  sign('신반포 문구 · 도장 · 열쇠',W+.13,G+2.95,21.5,5.4,.8,east,'#e7e8e2','#275e8c');
  sign('PICNIC STORAGE',W+.13,G+2.95,16.8,3,.65,east,'#3d4a45','#e9e4d2');
  sign('피크닉 대여소',W+.14,G+2.48,16.8,2.8,.23,east,'#3d4a45','#e9e4d2');
  sign('감 미 옥',W+.13,G+2.95,28.8,9,.9,east,'#bd3935','#fff0df');
  sign('비에이블 스터디카페',32.5,6.7,-.13,18.8,1.1,north,'#e9e5da','#795238');
  sign('비 에 이 블  스 터 디 카 페',W+.13,6.7,8.6,17,1.1,east,'#eee7d9','#845b42');
  sign('반원 E&I 피아노',W+.13,6.7,28,11,1.1,east);sign('카페 24시',W+.13,8,14,5.6,.55,east,'#3a4c49','#fff');
  // A circular projecting lightbox on the north alley, readable from either end.
  const disc=(u,v,rot)=>{
    const[x,z]=P(u,v),yy=G+3.35,r=.68,dx=Math.cos(rot),dz=-Math.sin(rot),nx=Math.sin(rot),nz=Math.cos(rot);
    for(const s of [1,-1])for(let i=0;i<32;i++){
      const a=i*Math.PI/16,b=(i+1)*Math.PI/16;
      K.quad('emit',[[x,yy,z],[x+dx*r*Math.cos(a),yy+r*Math.sin(a),z+dz*r*Math.cos(a)],
        [x+dx*r*Math.cos(b),yy+r*Math.sin(b),z+dz*r*Math.cos(b)],[x,yy,z]],[nx*s,0,nz*s]);
    }
    sign(['한신치킨','반원칼국수'],u,yy,v,1.06,.85,rot,null,'#b3342b',{twoSided:true});
  };
  disc(36,-.9,east);B(36,G+3.2,-.5,.065,.065,1.1,0x454b48,{solid:false});
  // Clear vinyl, stitched orange lower panels, poles and overhead valances.
  function tent(a,b,c,d,open=[]){
    const top=G+2.65;K.hpoly(0xb54422,rect(a,b,c,d),top,true);K.hpoly(0x694633,rect(a,b,c,d),top-.05,false);
    [[a,b,c,b],[c,b,c,d],[c,d,a,d],[a,d,a,b]].forEach(([u,v,uu,vv],i)=>{
      wall(u,v,uu,vv,top-.3,top,{mat:0xd46830,thick:.04,solid:false});if(open.includes(i))return;
      wall(u,v,uu,vv,G+.1,G+.72,{mat:0xb94c25,thick:.035});
      wall(u,v,uu,vv,G+.72,top-.3,{mat:'glass',thick:.02});
      wall(u,v,uu,vv,G+.76,top-.33,{mat:'banwon-vinyl',thick:.015,solid:false});
      const n=Math.ceil(Math.hypot(uu-u,vv-v)/3);
      for(let k=0;k<=n;k++)cyl(u+(uu-u)*k/n,G,v+(vv-v)*k/n,.035,2.65,0x454a43,{seg:6});
    });
  }
  tent(24,-3.3,34.1,-.05,[1,2,3]);tent(34.3,-3.3,W+3.3,-.05,[1,2,3]);
  tent(W+.05,0,W+3.3,9.3,[0,2,3]);tent(W+.05,10.3,W+3.3,15.8,[0,2,3]);
  tent(W+.05,24,W+3.3,33.5,[0,2,3]);
  slab(W+3.35,-3.5,W+5.2,35,G,{mat:'sidewalk',thick:.18});
  ramp(30,-6.2,30,-10,G,0,2.4,{steps:true,rails:false,mat:'darkstone'});
  ramp(W+5.2,20,W+9,20,G,0,2.4,{steps:true,rails:false,mat:'darkstone'});
  slab(0,-7.2,W+5.2,-6.25,0,{mat:'sidewalk',thick:.08,ceil:false});
  // Only the immediate edge; OSM park 413360475 is deliberately not claimed.
  for(const [a,b,c,d]of [[3,-8,18,-8],[25,-8,28.5,-8],[31.5,-8,39,-8],[W+6,2,W+6,10],[W+6,15,W+6,18.5],[W+6,21.5,W+6,24]])rail(a,b,c,d,0,0,.95);
  for(const[u,v]of [[7,-11],[19,-11],[31,-11],[W+8,3],[W+8,17]]){const[x,z]=P(u,v);K.tree(x,z,{h:7.4,kind:'zelkova'});}
  sign('반원어린이공원',19.5,1.1,-8.8,3.3,.65,R,'#466950','#f6eee0');
  for(const[u,v]of [[17,-7.5],[W+5.5,18]]){cyl(u,0,v,.075,4,0x464f4c);cyl(u,3.92,v,.28,.18,'emit',{solid:false});}
  // BW-L1: only the tower-side lane is red. The shop-side asphalt stops at its kerb.
  const A=[-145.36,-365.39],Z=[-169.16,-427.87],L=Math.hypot(Z[0]-A[0],Z[1]-A[1]);
  const ux=(Z[0]-A[0])/L,uz=(Z[1]-A[1])/L,rp=(t,o)=>[A[0]+ux*t-uz*o,A[1]+uz*t+ux*o];
  // BW-C1: the common panorama stands 0.75m east of the corrected centreline.
  // Cover the old city paint locally above y.042, without claiming/editing the road.
  // Three-metre end transitions join the unchanged road centreline outside this frontage.
  const centreNodes=[[2,0],[5,-2],[61,-2],[64,0]];
  for(let i=0;i<centreNodes.length-1;i++){
    const [a,oa]=centreNodes[i],[b,ob]=centreNodes[i+1];
    K.hpoly('banwon-grey-road',[rp(a,oa-.28),rp(b,ob-.28),rp(b,.28),rp(a,.28)],.046,true);
    for(const d of [-.15,.15])K.hpoly(0xf2c329,[rp(a,oa+d-.075),rp(b,ob+d-.075),rp(b,ob+d+.075),rp(a,oa+d+.075)],.049,true);
  }
  K.hpoly('banwon-red-road',[rp(8,-2.28),rp(60,-2.28),rp(60,-6.9),rp(8,-6.9)],.045,true);
  // The actual kerb is oblique to the OSM centreline (offset +2.4..+3.34, not +6.9).
  const roadT=p=>(p[0]-A[0])*ux+(p[1]-A[1])*uz;
  const kerb0=P(-9.69,-2),kerb1=P(-9.69,D+2);
  K.hpoly('banwon-grey-road',[rp(roadT(kerb0),.28),rp(roadT(kerb1),.28),kerb1,kerb0],.036,true);
  K.hpoly(0xe1ba35,rect(-10.08,-2,-9.96,D+2),.048,true);
  // BW-T2: '신반…' has the grey fill/black outline of the roadview street-name UI.
  // Neither that overlay nor the illegible far word is painted onto the physical lane.
  // The opposite curb and planting belong to the roadview foreground, not the tower shells.
  K.texture('banwon-far-paving',256,256,(g,w,h)=>{
    g.fillStyle='#9a9a96';g.fillRect(0,0,w,h);g.strokeStyle='#858580';g.lineWidth=2;
    for(let y=0;y<=h;y+=64){g.beginPath();g.moveTo(0,y);g.lineTo(w,y);g.stroke();}
    for(let row=0;row<4;row++)for(let x=(row%2)*64;x<=w;x+=128){g.beginPath();g.moveTo(x,row*64);g.lineTo(x,(row+1)*64);g.stroke();}
  },[1.6,1.6]);
  K.hpoly('banwon-far-paving',[rp(5,-7.15),rp(61,-7.15),rp(61,-9.6),rp(5,-9.6)],.055,true);
  for(const[a,b]of [[5,18],[20.5,45],[48,61]]){
    K.hpoly(0x526343,[rp(a,-9.6),rp(b,-9.6),rp(b,-15.4),rp(a,-15.4)],.06,true);
    const aa=rp(a,-9.7),bb=rp(b,-9.7);
    K.wall(...aa,...bb,.06,.25,{mat:{tex:'concrete',color:0xc3c2ba},thick:.18,solid:false});
    for(let t=a;t<b;t+=3){const[x,z]=rp(t,-7.35);K.cyl({x,y:.055,z,r:.06,h:.9,seg:10,mat:0x1c2325,solid:false});}
  }
  // BW-D3: irregular young planting and three pale support stakes per tree.
  for(const[t,o,h,d]of [[7,-11.2,6.5,3.5],[13.2,-10.8,7.4,4.4],[22,-11.4,5.7,2.5],[28.4,-11,6.9,3.8],[36.1,-11.5,7.7,5],[42.3,-10.9,6.2,3.2],[50.5,-11.2,7.1,4.2],[58,-11.5,5.9,2.8]]){
    const[x,z]=rp(t,o);K.cyl({x,y:.06,z,r:.1,h:h-.8,seg:10,mat:0x685943,solid:false});
    K.dome({x,y:h-d*.26,z,rx:d*.5,ry:d*.34,rz:d*.45,hemi:false,seg:16,rings:8,mat:t<20?0x527546:0x45643c});
    for(let a=0;a<3;a++){const angle=a*2*Math.PI/3,xx=x+Math.cos(angle)*.65,zz=z+Math.sin(angle)*.65;rod([xx,.08,zz],[x,1.8,z],.035,0x9b8c6e);}
  }
  const[lx,lz]=rp(32,-7.85);
  K.cyl({x:lx,y:0,z:lz,r:.065,h:6.3,seg:10,mat:0x4a4d50,solid:false});
  K.wall(lx,lz,...rp(32,-6.4),6.05,6.13,{mat:0x4a4d50,thick:.075,solid:false});
  const[hx,hz]=rp(32,-6.4);K.box({x:hx,y:5.98,z:hz,w:.28,h:.16,d:.7,rotY:R,mat:0x343a3d,solid:false});

  // 107동 is the central beige/blue tower, 201동 the blue glass tower at right.
  // Thin skins avoid claiming/rebuilding city geometry or touching shared metadata.
  for(const[id,style]of [[1137867805,'piers'],[1137867808,'balcony'],[1137867804,'punched'],[1137867807,'punched'],[413354821,'beige']]){
    for(const b of K.osmBuilding(id)){
      const ns=K.orient(b.poly),height=b.height||90,fh=height/(b.levels||30);
      b.poly.forEach((a,i)=>{
        const end=b.poly[(i+1)%b.poly.length],[nx,nz]=ns[i],len=Math.hypot(end[0]-a[0],end[1]-a[1]);
        const point=(t,off=.16)=>[a[0]+(end[0]-a[0])*t+nx*off,a[1]+(end[1]-a[1])*t+nz*off];
        const panel=(t0,t1,y0,y1,mat,off=.16,thick=.035)=>K.wall(...point(t0,off),...point(t1,off),y0,y1,{mat,thick,solid:false});
        if(style==='piers'){
          panel(0,1,0,height,0x9e8a78);
          if(len>7){
            panel(.09,.29,1.1,height-.4,'banwon-blue-glass',.19);
            panel(.36,.61,1.1,height-.4,'banwon-deep-glass',.19);
            panel(.69,.91,1.1,height-.4,'banwon-blue-glass',.19);
            for(const t of [.07,.31,.34,.63,.67,.93])panel(t,t+.018,0,height,0xd0d3cc,.225);
          }
        }else if(style==='balcony'){
          panel(0,1,0,height,'banwon-blue-glass');
          for(let y=2.9;y<height;y+=fh){
            const off=.26+(Math.round(y/fh)%3===0?.22:0);
            panel(0,1,y,y+.22,0xe1e5e4,off,.26);
          }
          const n=Math.max(1,Math.round(len/3));
          for(let k=0;k<=n;k++)panel(Math.max(0,k/n-.004),Math.min(1,k/n+.004),0,height,0xe0e5e6,.205,.05);
        }else panel(0,1,0,height,style==='beige'?'banwon-beige-window':'banwon-punched-window');
      });
    }
  }

  K.detail({name:'반원상가 거리 간판·식재·보행자',floor:'1F',y0:0,y1:G+3.4,poly:rect(-28,-4,1,44)},()=>{
    // BW-L2 / NEW-1: real paving gap ends at v21.7, then individual boxwood clumps.
    // Plain leaf colours avoid the shared grass texture's almost-black green multiplication.
    for(const[a,b]of [[-.8,14.8],[21.7,40]])for(let v=a+.62;v<b-.5;v+=1.3){
      B(-8.9,.12,v,1.16,.05,1.18,0x514c3a,{solid:false});
      const[x,z]=P(-8.9,v),i=Math.abs(Math.round(v*3)),height=.8+(i%3)*.08;
      K.dome({x,y:.35,z,rx:.55,ry:height-.35,rz:.61,hemi:false,seg:16,rings:8,mat:[0x46573c,0x43543a,0x4c6041][i%3]});
      K.dome({x:x+.13,y:height-.17,z:z-.09,rx:.26,ry:.18,rz:.31,seg:12,rings:5,mat:0x5a6e4c});
    }
    // BW-T1: one open 12m ginkgo by the bank, plus the tree at the far left.
    const openGinkgo=(u,v,h)=>{
      const[x,z]=P(u,v);K.cyl({x,y:.16,z,r:.12,h:h*.94,seg:12,mat:0x635b48,solid:false});
      const lobes=[[-1.2,3.35,.1,.62],[1.45,4.6,.35,.74],[-.65,6.1,-.8,.68],[1.35,7.55,-.55,.82],[-1.2,8.95,.4,.76],[.15,11.25,-.1,.72],[.5,9.85,1.35,.64],[-1.65,7.1,1.1,.61]];
      for(const[dx,yy,dz,r]of lobes){
        const y=yy*h/12;rod([x,y-1,z],[x+dx*.9,y,z+dz*.9],.03,0x655d49);
        K.dome({x:x+dx,y,z:z+dz,rx:r,ry:r*h/12,rz:r*.8,hemi:false,seg:16,rings:8,mat:(yy%2<1)?0x4f7a37:0x52763e});
      }
    };
    openGinkgo(-8.9,27.7,12);openGinkgo(-8.9,2.5,9.5);
    // BW-D3: four interlocking rows cover the far bed, retaining its entrance breaks.
    // The low shrubs extend behind the existing staked trees; boulders below remain.
    for(const[a,b]of [[5,18],[20.5,45],[48,61]])for(let row=0;row<4;row++){
      let n=0;for(let t=a+.75+(row%2)*.35;t<b-.6;t+=1.15,n++){
        const o=-10.35-row*1.3,[x,z]=rp(t,o),height=.5+((n+row*2)%5)*.1;
        K.dome({x,y:.12,z,rx:.82,ry:height,rz:.88,seg:12,rings:6,mat:[0x3f5f33,0x4c6a3b,0x5a7a45,0x49683b][(n+row)%4]});
      }
    }
    for(let i=0;i<22;i++){
      const t=6+i*2.45,o=-10.3-(i%3)*.48,[x,z]=rp(t,o);
      K.dome({x,y:.22,z,rx:.45+(i%3)*.17,ry:.22+(i%2)*.15,rz:.38,mat:i%4===0?0xa3a195:0x526b3f});
    }
    // Small window boards and posters use only the names legible in the references.
    for(const[v,w,label,bg,fg]of [[2.1,3,'진료 안내','#eef0e9','#235677'],[6.1,3.8,'이비인후과','#19598b','#fff'],
      [26.6,3.6,'서초21세기약국','#f2eedb','#be3e31'],
      [32.5,3.7,'우리은행','#1758a1','#fff'],[37.1,3.7,'우리은행','#1758a1','#fff']])
      sign(label,-.26,v<20?5.69:2.56,v,w,v<20?.27:.45,west,bg,fg);
    for(const v of [25,28.8,31.6,38.1]){
      sign(v<30?'약국':'우리은행',-.27,1.94,v,.48,.73,west,v<30?'#dfdfc9':'#d8e5ef',v<30?'#c74035':'#275181');
      B(-.29,G+.16,v,.045,.13,.51,v<30?0xb44031:0x226a9b,{solid:false});
    }
    // The original roadviews are quiet: two walkers, with room for the stair/ramp approaches.
    person(-2.1,G,18.1,{rotY:west,shirt:0x333c43,pants:0x25292e});
    person(-7.4,0,25.2,{rotY:R+Math.PI,shirt:0x525a65,pants:0x2b3034});
    B(-7.13,.48,25.2,.19,.31,.13,0xa89774,{solid:false});
    const[cx,cz]=rp(22,-5.5);K.vehicle({x:cx,y:0,z:cz,rotY:Math.atan2(-ux,-uz),kind:'car',color:0x111214});
  });

  // Furnishing helpers; invoked only by the detail groups below.
  function chair(u,y,v,col,angle=R){
    B(u,y+.43,v,.45,.07,.46,col,{rotY:angle});const co=Math.cos(angle-R),si=Math.sin(angle-R);
    for(const dx of [-.17,.17])for(const dz of [-.16,.16])B(u+dx*co+dz*si,y,v-dx*si+dz*co,.045,.43,.045,col,{solid:false});
    B(u+.19*si,y+.5,v+.19*co,.44,.38,.065,col,{rotY:angle,solid:false});
    for(const dx of [-.21,.21])B(u+dx*co,y+.62,v-dx*si,.045,.06,.37,col,{rotY:angle,solid:false});
  }
  function table(u,y,v,round=true,grill=false,hoodTop=3.36){
    if(round){cyl(u,y+.72,v,.56,.055,0x595b57);cyl(u,y,v,.055,.72,0x4a514e,{solid:false});B(u,y+.06,v,.8,.06,.08,steel,{solid:false});B(u,y+.06,v,.08,.06,.8,steel,{solid:false});}
    else{B(u,y+.72,v,1.25,.075,.76,{tex:'wood',color:0xb58955});for(const dx of [-.49,.49])for(const dz of [-.25,.25])B(u+dx,y,v+dz,.045,.72,.045,0x343c3a,{solid:false});}
    if(grill){
      // Actual metal table/charcoal mesh: audit photo 224459455661_05 (not its illustrated cover).
      cyl(u,y+.78,v,.32,.025,steel,{seg:24,solid:false});cyl(u,y+.807,v,.285,.013,0x252825,{seg:24,solid:false});
      for(const[du,dv]of [[-.14,-.1],[.02,-.15],[.14,-.02],[-.09,.09],[.1,.13]]){
        cyl(u+du,y+.822,v+dv,.055,.022,0x93432b,{seg:8,solid:false});cyl(u+du,y+.844,v+dv,.025,.003,0x292d29,{seg:8,solid:false});
      }
      for(let i=-5;i<=5;i++){
        const t=i*.048,len=2*Math.sqrt(.28*.28-t*t);
        B(u+t,y+.853,v,.007,.008,len,steel,{solid:false});B(u,y+.857,v+t,len,.008,.007,steel,{solid:false});
      }
      cyl(u,y+1.65,v,.22,.18,steel,{solid:false});cyl(u,y+1.83,v,.095,hoodTop-1.83,steel,{solid:false});
    }else{
      cyl(u,y+.79,v,.18,.025,0xf2ead6,{solid:false});
      for(let i=0;i<5;i++)cyl(u-.1+(i%3)*.09,y+.815,v-.06+Math.floor(i/3)*.1,.044,.06,0xa46a2e,{seg:6,solid:false});
    }
    for(const dx of grill?[-.43,.43]:[-.34,.34]){cyl(u+dx,y+.79,v+.15,.055,.18,{tex:'glass',color:0xdda64c},{solid:false});cyl(u+dx,y+.79,v-.16,.09,.04,0xe9e8db,{solid:false});}
    cyl(u+.24,y+.79,v-.25,.04,.21,0x3b7759,{solid:false});cyl(u+.24,y+1,v-.25,.018,.075,0x3b7759,{solid:false});
  }
  function fridge(u,y,v){
    B(u,y,v,.78,1.96,.67,0xcbd3d0);B(u,y+.2,v+.343,.64,1.53,.025,0x273d48,{solid:false});
    B(u,y+.25,v+.36,.57,1.4,.025,{tex:'glass',color:0x77bad8},{solid:false});
    for(let row=0;row<4;row++){B(u,y+.35+row*.32,v+.38,.60,.025,.025,steel,{solid:false});for(let n=0;n<4;n++)B(u-.22+n*.145,y+.38+row*.32,v+.38,.07,.19,.035,[0x447956,0xd6bd5b,0xa8d4d8][n%3],{solid:false});}
    B(u,y+1.82,v+.36,.65,.08,.04,{tex:'emit',color:0x96d8ff},{solid:false});sign('음료 · 맥주',u,y+1.8,v+.39,.62,.13,R,'#134065','#d2e8fb');
  }
  function orderTablet(u,y,v,title){
    B(u,y+.8,v,.28,.025,.20,0x252b2b,{solid:false});B(u,y+.82,v,.045,.19,.045,0x252b2b,{solid:false});
    B(u,y+1.01,v,.40,.29,.035,0x151b21,{solid:false});
    sign([title,'주문하기'],u,y+1.155,v+.025,.36,.24,R,'#73b8ee','#163849');
  }
  // Ground floor shop/room zones exist before detail loading.
  zone('서초21세기약국','1F',.3,22.2,7.3,30.9,G,G+FH,'약국',22);
  zone('우리은행','1F',.3,22.2,18.7,D-.3,G,G+FH,'영업점');
  zone('상가 음식점','1F',23.2,9.6,34,17.8,G,G+FH,'파더스 김밥 · 동대문엽기떡볶이');
  K.detail({name:'반원상가 1층 점포와 한신치킨 실내',floor:'1F',y0:G,y1:G+FH,poly:footprint},()=>{
    for(const[name,u,v]of [['우리은행',12,21.86],['파더스 김밥',28.2,18.14],['한신치킨호프 · 111호',38.5,18.14],['감미옥',31,21.86]])
      sign(name,u,G+2.85,v,5.9,.54,v<20?R:north,name.includes('은행')?'#15538b':'#e8e0ca',name.includes('은행')?'#fff':'#49372c');
    sign('아빠의마음',19.15,G+2.85,5.95,3.9,.54,east,'#e8e0ca','#49372c');
    sign('서초21세기약국',3.75,G+2.8,21.86,5.5,.55,north,'#e8e8db','#34766c');
    sign('불닭발땡초 동대문엽기떡볶이 신반포점',22.86,G+2.8,13.2,6.2,.55,west,'#c33332','#fff');
    B(3.7,G,29.9,4.5,.92,.65,0xe0ded0);
    for(let row=0;row<5;row++){
      B(6.8,G+.35+row*.35,26,.48,.035,6.6,0xd8dcce,{solid:false});
      for(let j=0;j<18;j++)B(6.8,G+.39+row*.35,22.8+j*.37,.31,.23,.22,[0xe4d8ba,0x9fc4ba,0xd7afa5,0xadc5dc][(row+j)%4],{solid:false});
    }
    for(const u of [3,7,11,15]){B(u,G,35,2.6,1,.85,0xc6d4d9);B(u,G+1,35,2.65,.06,.9,0xf1f0df,{solid:false});B(u+.7,G+1.08,35,.45,.3,.05,0x22303a,{solid:false});chair(u,G,36.2,0x31495e);}
    for(const u of [11,13.3,15.6]){B(u,G,24,1,1.65,.6,0x4a7d9b);B(u,G+1,24.32,.65,.38,.03,{tex:'emit',color:0x9ddadf},{solid:false});}
    B(12,G+.45,28,4.3,.13,.55,0x466b8a);B(12,G+.58,28.22,4.3,.48,.08,0x466b8a,{solid:false});
    B(17.8,G,15.25,.58,.68,.28,0xe5e6df);cyl(17.8,G+.34,15.75,.27,.13,0xefefe7,{solid:false});
    B(14.6,G+.74,15.3,.62,.16,.48,0xe4e7df);cyl(14.6,G+.9,15.15,.022,.18,steel,{solid:false});
    B(14.6,G+1.35,14.73,.65,.8,.03,{tex:'glass',color:0xbfcac6},{solid:false});
    // Photograph 12: cream interior, tables/black chairs and the back service wall.
    // The two seating bays share the long v4.0 cross-aisle and the u38.5 aisle.
    for(const u of [35.8,41.6])for(const v of [2.2,5.6,8.8]){table(u,G,v,false);chair(u,G,v-.83,0x383a34,north);chair(u,G,v+.83,0x383a34);orderTablet(u+.35,G,v-.18,'한신치킨');}
    for(const u of [26,31.5])for(const v of [2.3,7.2]){table(u,G,v,false);chair(u,G,v-.83,0x383a34,north);chair(u,G,v+.83,0x383a34);orderTablet(u+.35,G,v-.18,'반원&한식당');}
    // Entrance-side self bar; ingredients are documented, location/dimensions inferred.
    B(33.1,G,.75,2,.88,.75,0x9d8564);B(33.1,G+.88,.75,2.06,.055,.79,steel,{solid:false});
    for(const[i,col]of [0xe6d3a0,0x7f994c,0xeee6cc,0xb94927].entries()){
      B(32.35+i*.43,G+.94,.75,.36,.055,.43,steel,{solid:false});
      for(let j=0;j<6;j++)cyl(32.25+i*.43+(j%3)*.09,G+1,.65+Math.floor(j/3)*.15,.045,.03,col,{seg:6,solid:false});
    }
    cyl(34.05,G+.94,.75,.13,.33,steel,{solid:false});
    sign(['셀프바','팝콘 · 샐러드 · 치킨무 · 김치 · 물'],33.1,G+1.45,.35,2.8,.38,R,'#eee5ce','#4e463a');
    B(28.3,G+1.04,9.24,3.5,1.6,.12,0x181f24,{solid:false});
    sign('방송 중',28.3,G+1.84,9.16,3.28,1.38,north,'#315c75','#e5eaf0');
    for(const u of [26,31])for(const v of [3.5,7.8])B(u,G+2.61,v,2.8,.055,.13,'emit',{solid:false});
    B(38.3,G,10.7,3.2,.9,.8,{tex:'wood',color:0x997955});B(38.3,G+.9,10.7,3.3,.07,.88,0xd8d8cc,{solid:false});
    B(37.4,G+1.03,10.6,.5,.33,.06,0x1f292d,{solid:false});
    sign(['메뉴','후라이드치킨   양념치킨','칼국수   골뱅이   생맥주'],37.3,G+2.08,12.85,3.6,1.1,north,'#e7e0c6','#543a2d');
    fridge(42.3,G,10.8);for(const u of [40.6,41.2])cyl(u,G,11.8,.24,.55,0xa3aca6);
    B(41.2,G+1.85,12.6,1.45,.82,.12,0x171e24,{solid:false});sign('야구 중계',41.2,G+2.26,12.51,1.29,.65,north,'#387685','#e8e5cd');
    for(const v of [3.7,7.3,10.4])B(38.5,G+2.61,v,2.8,.07,.17,'emit',{solid:false});
    for(const[u,v]of [[36,2.2],[41.7,5.6],[36,8.8]])person(u,G,v+.83,{sit:true,rotY:north,shirt:0x333d40});person(38.5,G,12,{rotY:north,shirt:0x373633});
    // East-side Gammiok: pork ribs, circular charcoal grills and red chairs.
    for(const u of [35.8,41.5])for(const v of [25,28.4,31.8]){table(u,G,v,true,true);chair(u,G,v-.83,0xbf3430,north);chair(u,G,v+.83,0xbf3430);}
    B(35,G,36.8,5.5,.88,.6,0xb7b9ab);sign(['감미옥 · 참숯돼지갈비','항정살 · 삼겹살 · 돼지목살'],36,G+2.2,38.8,5.5,.9,north,'#f1df9e','#7e2521');
    for(const v of [25,27,31,33])sign(['참숯','돼지갈비'],W+.16,G+1.7,v,1.25,1.3,east,'#edcd7b','#733926');
    for(const[u,v]of [[15.7,4.2],[27.8,15.8],[29,8.7]]){B(u,G,v,3.8,.9,.7,{tex:'wood',color:0xa4865c});for(let i=0;i<9;i++)B(u-1.5+i*.37,G+1,v,.20,.15,.2,[0xe0d19b,0xe1b38e,0xc6c2a1][i%3],{solid:false});}
    for(const v of [6,12,20,26,36])B(21,G+3.22,v,1.8,.055,.65,'emit',{solid:false});
    for(const u of [3,13,29,38])B(u,G+3.22,20,1.8,.055,.65,u===3?0x7e8078:'emit',{solid:false});
    person(17,G,20,{shirt:0xa9b7b0});person(21,G,24.5,{shirt:0x717d9a});
  });
  K.detail({name:'한신치킨 야장과 공원 접면',floor:'1F',y0:0,y1:G+3.4,poly:rect(0,-12,W+10,35)},()=>{
    for(const u of [25.8,29.1,32.3,35.7,39,42.3]){
      table(u,G,-1.65);chair(u-.85,G,-1.65,0x255db4,west);chair(u+.85,G,-1.65,0x255db4,east);B(u,G+2.38,-1.55,1.8,.05,.12,'emit',{solid:false});
    }
    // Unverified Hanshin terrace layout stays as before. Gammiok has five tables.
    for(const v of [1.7,5,8.2,12,15]){
      table(W+1.65,G,v);chair(W+1.65,G,v-.85,0xbf3531,north);chair(W+1.65,G,v+.85,0xbf3531);B(W+1.8,G+2.38,v,.13,.05,1.8,'emit',{solid:false});
    }
    for(const v of [24.9,27.05,29.2,31.35,33.5]){
      table(W+1.65,G,v,true,true,2.6);chair(W+1.65,G,v-.85,0xbf3531,north);chair(W+1.65,G,v+.85,0xbf3531);B(W+1.8,G+2.38,v,.13,.05,1.8,'emit',{solid:false});
    }
    for(let i=0;i<4;i++){chair(33.4,G+i*.14,-.55,0x235a9e);B(32.4,G+i*.3,-.5,.6,.28,.45,0x244c41);}
    // Audit suggested removal, but photo 224459455661_03 clearly shows this exact sign at Gammiok.
    fridge(34.8,G,-.6);sign(['순대국','육칼국수','만두찜'],W+2.8,G+1.15,24.1,.62,1.7,east,'#efe8bf','#303d2b');
    for(const[u,v]of [[29.9,-1.65],[36.55,-1.65],[W+1.65,5.85],[W+1.65,12.85]])person(u,G,v,{sit:true,shirt:0x4a5056});
    for(const[u,v]of [[W+4.2,17.1],[W+4.1,18.3],[W+4.3,19.7]])person(u,G,v,{rotY:R,shirt:0xbcb9aa});
    for(const u of [8,29]){B(u,.43,-9.1,2.1,.1,.48,'wood');B(u,.55,-9.35,2.1,.43,.065,'wood',{solid:false});for(const dx of [-.8,.8])B(u+dx,0,-9.1,.07,.44,.42,0x4a534b,{solid:false});}
  });
  floors.slice(1).forEach(y=>{
    const floor='2F';
    // These signs exist; the four room assignments are a playable inferred plan.
    zone('비에이블 스터디카페',floor,23.2,.3,W-.3,17.8,y,y+FH,'열람석',20);
    zone('이비인후과',floor,.3,22.2,18.7,D-.3,y,y+FH,'대기실 · 상담',20);
    zone('학원 · 교습실',floor,.3,.3,18.7,17.8,y,y+FH,'학습 공간',20);
    zone('반원 태권도',floor,23.2,22.2,W-.3,D-.3,y,y+FH,'수련실',20);
    K.detail({name:'반원상가 2층 실내',floor,y0:y,y1:y+FH,poly:footprint},()=>{
      sign('비에이블 스터디카페',31,y+2.8,18.14,9,.65);
      for(const u of [26,29.6,33.2,36.8,40.4])for(const v of [3,6.5,10,13.5]){
        B(u,y+.73,v,1.35,.07,.72,{tex:'wood',color:0xc5ab7a});for(const dx of [-.55,.55])B(u+dx,y,v,.055,.73,.6,0xa5aca3,{solid:false});
        B(u,y+.8,v-.33,1.35,.6,.04,0xd7d1bb);B(u-.67,y+.8,v,.04,.6,.72,0xd7d1bb);chair(u,y,v+.9,0x4f5a55);
      }
      // Retain the teaching/training furnishings on the actual upper storey.
      // The stair bay and cross-corridor stay clear; room allocations are inferred.
      for(const u of [2,5.4,8.8,12.2,15.6])for(const v of [2.2,5.5]){
        B(u,y+.73,v,1.35,.07,.72,{tex:'wood',color:0xc5ab7a});for(const dx of [-.55,.55])B(u+dx,y,v,.055,.73,.6,0xa5aca3,{solid:false});chair(u,y,v+.9,0x4f5a55);
      }
      for(const u of [13,16.5])for(const v of [9,12.5,16]){
        B(u,y+.73,v,1.35,.07,.72,{tex:'wood',color:0xc5ab7a});for(const dx of [-.55,.55])B(u+dx,y,v,.055,.73,.6,0xa5aca3,{solid:false});chair(u,y,v+.9,0x4f5a55);
      }
      sign('학원 · 교습실',15,y+2.8,18.14,5,.6);
      for(let u=25;u<41;u+=2.1)for(let v=23;v<37.8;v+=2.1)B(u+1,y+.02,v+1,1.97,.025,1.97,Math.round(u+v)%2?0x7795ac:0x87a8b6,{solid:false});
      wall(24,23,24,38.2,y+.3,y+2.6,{mat:'glass',solid:false,thick:.015});
      for(const u of [27,33,39]){cyl(u,y,37.5,.32,1.7,0x35434f);B(u,y+1.2,37.5,.55,.6,.55,0xa35044,{solid:false});}
      sign('반원 태권도',31,y+2.8,21.86,8,.6,north);
      sign('이비인후과',8,y+2.8,21.86,7.2,.6,north,'#e8eee7','#33645d');
      B(9,y,34,5.6,1.02,.8,0xc5d2c7);for(const u of [4,8,12,16]){chair(u,y,27,0x577872);chair(u,y,29,0x577872);}
      for(const u of [4,10,16]){B(u,y+.73,37.1,2,.08,.85,'wood');chair(u,y,38.1,0x55584d);B(u,y,.55,2.7,2.3,.35,0xb4af99);for(let k=0;k<10;k++)B(u-1.1+k*.24,y+1.3,.76,.15,.38,.1,[0x9f6d52,0x718c85,0xc1ae72][k%3],{solid:false});}
      for(const u of [8,16,27,35])for(const v of [5,14,26,35])B(u,y+3.17,v,1.7,.05,.6,'emit',{solid:false});
      for(const v of [5,13,20,26,36])B(21,y+3.17,v,1.5,.05,.6,'emit',{solid:false});person(31,y,20,{shirt:0x9b977e});
    });
  });
  K.spawn({name:'반원상가 정면 · 로드뷰',x:-156.3,y:0,z:-390.6,yaw:289.5*Math.PI/180});
  K.spawn({name:'신반포로23길 · 어린이 보호구역',x:-156.3,y:0,z:-390.6,yaw:80*Math.PI/180});
  spawn('반원상가 1층 통로',16.8,G,20,east);spawn('한신치킨호프 111호',38.5,G,7,R);
  spawn('한신치킨 야장 · 공원 쪽',37.8,G,-1.65,north);spawn('반원어린이공원 접면',21,0,-9.4,R);
  spawn('비에이블 스터디카페',21,floors[1],13,east);spawn('반원상가 2층 교습실',16,floors[1],20,R);spawn('반원 태권도',21,floors[1],29,east);
}
