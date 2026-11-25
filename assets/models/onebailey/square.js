import { loadFixtureScene, mountFixture } from './load.js';

// The sales-floor plan is digitised in a 1450-pixel-wide reference frame. Its
// road edge is fitted to the two ends of the OSM retail footprint (1177226165).
const k = .1122, len = Math.hypot(110.96, 42.11), east = 110.96 / len, south = 42.11 / len;
const rot = Math.atan2(south, east);
const p = (x,y) => [-522.44 + k*(east*(x-10) + south*(y-449)),
                      49.31 + k*(-south*(x-10) + east*(y-449))];
const rect = (x0,y0,x1,y1) => [p(x0,y0),p(x1,y0),p(x1,y1),p(x0,y1)];
const points = pairs => pairs.map(([x,y]) => p(x,y));
const fixtures = await loadFixtureScene(new URL('./retail.glb',import.meta.url));
const shops = [
  {id:'B101',name:'빽다방 반포원베일리스퀘어점',mark:'PAIK’S COFFEE',model:'PaikCounter',
   x0:1019,x1:1067,front:375,back:409,mid:1043,depth:23,bg:'#f7c832',fg:'#162e70',wood:0xe3ded3},
  {id:'B110',name:'본크라상 원베일리점',mark:'본크라상',model:'BonCroissant',
   x0:729,x1:773,front:375,back:449,mid:751,depth:38,bg:'#f4e8d7',fg:'#594130',wood:0xe2caa9},
  {id:'B150',name:'베이크드뮬란 원베일리점',mark:'BAKED MÜLAN',model:'BakedMulan',
   x0:816,x1:859,front:259,back:224,mid:837.5,depth:25,bg:'#f5efe3',fg:'#1c3045',wood:0xc0a48c}
];

export function buildRetailSquare(K) {
  const F=K.LEVELS.B1,H=F+3.4;
  const tile={tex:'tile',color:0xd9d5ca},stone={tex:'ob-granite',color:0xc7c5b9};
  const warm={tex:'emit',color:0xfff4d5};
  const zone=(name,sub,poly,priority=4)=>K.zone({name,sub,floor:'B1',poly,priority,y0:F-.15,y1:H+.3});
  const slab=(poly,mat=tile)=>K.slab(poly,F,{mat,edge:false});
  const roof=poly=>K.slab(poly,H+.20,{under:0xe6e3da,thick:.20,walk:false,edge:false});
  const wall=(a,b,y0=F,y1=H,mat=0xcac6bc,options={})=>K.wall(...p(...a),...p(...b),y0,y1,{mat,thick:.12,...options});
  const box=(x,y,base,w,h,d,mat,solid=false,r=rot)=>{const [wx,wz]=p(x,y);K.box({x:wx,z:wz,y:F+base,w,h,d,rotY:r,mat,solid});};
  const sign=(text,x,y,base,w,h,angle,fg,bg=null)=>{const [wx,wz]=p(x,y);K.sign(text,{x:wx,z:wz,y:F+base,w,h,rotY:angle,fg,bg,pxPerM:125});};
  const corridor=(x0,y0,x1,y1)=>{const a=rect(x0,y0,x1,y1);slab(a);roof(a);zone('원베일리 스퀘어 공용 복도','B1 상가',a);};
  // Circulation around the central retail island matches the white route in
  // the B1 plan. B101/B110 face north; B150 faces the cross aisle to the south.
  corridor(687,350,1068,375);corridor(858,258,887,350);corridor(1028,178,1052,350);
  corridor(687,259,1028,282);corridor(687,259,700,350);
  wall([687,375],[729,375]);wall([773,375],[1019,375]);
  wall([687,350],[858,350]);wall([887,350],[1028,350]);wall([1052,350],[1068,350]);
  wall([1068,350],[1068,375]);wall([687,350],[687,375]);
  wall([700,282],[858,282]);wall([887,282],[1028,282]);
  wall([687,259],[816,259]);wall([887,259],[1028,259]);
  wall([858,282],[858,350]);wall([887,282],[887,350]);
  wall([1028,178],[1028,259]);wall([1028,282],[1028,350]);
  wall([700,282],[700,350]);wall([687,259],[687,350]);
  wall([1028,178],[1052,178]);
  for(const [x0,x1] of [[687,729],[773,1019]]) for(let x=x0+12;x<x1-7;x+=25){
    box(x,375.4,0,.055,2.45,.075,0x756f64);box(x,375.3,2.45,1.85,.06,.08,0x938e80);
  }
  for(const [x0,x1,y] of [[706,1066,363],[706,1025,271]])for(let x=x0;x<x1;x+=32){
    box(x,y,3.33,1.78,.045,.16,warm);
  }
  for(const shop of shops){
    const {x0,x1,front,back,mid}=shop, face=back>front?-1:1, inside=-face;
    const angle=rot+(face<0?Math.PI:0),room=rect(x0,Math.min(front,back),x1,Math.max(front,back));
    slab(room,{tex:'tile',color:shop.wood});roof(room);
    wall([x0,front],[x0,back],F,H,shop.wood);wall([x1,front],[x1,back],F,H,shop.wood);
    wall([x0,back],[x1,back],F,H,shop.wood);
    const width=(x1-x0)*k;
    box(mid,front,2.57,width,.56,.17,parseInt(shop.bg.slice(1),16));
    sign(shop.mark,mid,front+face*.90,2.84,width-.30,.42,angle,shop.fg);
    const left=x0+2.4,right=x1-2.4;
    for(const x of [left,right]){
      box(x,front,0,.09,2.58,.10,0x494944,true);
      box(x,front+inside*.9,.08,.31,2.38,.032,'glass');
    }
    const standY=front+inside*shop.depth,[mx,mz]=p(mid,standY);
    K.detail({name:shop.name,floor:'B1',poly:room,y0:F,y1:H},()=>{
      mountFixture(K,fixtures,shop.model,[mx,F+.014,mz],angle);
      // Clear panes, removable displays and menus are separate from the opaque GLB.
      const fy=(d)=>standY+inside*d/k,fx=(a)=>mid+face*a/k;
      if(shop.id!=='B150'){
        const bx=shop.id==='B101'?-1.04:-.44, ww=shop.id==='B101'?1.12:2.08;
        box(fx(bx),fy(-.18),.80,ww,.46,.016,'glass');
        box(fx(bx),fy(.45),.80,ww,.46,.016,'glass');
      }
      if(shop.id==='B101') {
        sign('빽다방',fx(.62),fy(-.317),.55,.59,.15,angle,'#193d77');
      } else if(shop.id==='B150'){
        sign('Bakery',mid,back+face*.8,2.26,1.68,.39,angle,'#ffd2d4','#674b47');
      } else {
        sign('본크라상',mid,back+face*.9,2.18,2.25,.44,angle,'#69543f');
      }
    });
    // The physical counter follows the exported opaque base. Keep customer
    // floor in front, and leave the area behind the counter outside the route.
    // Fixtures continue to the side walls as in open-front mall shops.
    const side=mid+(x1-x0)*.423;
    if(shop.id==='B101'){
      for(let i=0;i<7;i++) box(mid,back+face*.82,.21+i*.22,width-.22,.012,.035,0xcabca9);
      box(side,front+inside*10,0,.52,.91,1.13,0xd4c8ac,true);
      box(side,front+inside*10,.92,.56,.05,1.18,0x7e674c);
    }else if(shop.id==='B110'){
      for(let i=0;i<5;i++) box(mid,back+face*.62,.18+i*.42,width-.25,.026,.033,0xb39773);
      for(const ry of [front+inside*11,front+inside*21]){
        box(side,ry,0,.52,.94,.89,0xa87f5d,true);
        box(side,ry,.955,.60,.036,.91,0xe8decf);
        const [tx,tz]=p(side,ry);
        K.cyl({x:tx,z:tz,y:F+1.0,r:.17,h:.14,mat:0xf3e6d0,seg:16,solid:false});
        for(let b=0;b<5;b++)K.dome({x:tx+.10*Math.cos(b*1.26),z:tz+.10*Math.sin(b*1.26),y:F+1.14,rx:.036,ry:.045,rz:.036,mat:0xa74847});
      }
    }else{
      for(const ry of [front+inside*10,front+inside*18]){
        box(side,ry,0,.42,.81,.77,0x725441,true);box(side,ry,.82,.46,.052,.81,0x967257);
        const [tx,tz]=p(side,ry);K.dome({x:tx,z:tz,y:F+.875,rx:.13,ry:.065,rz:.19,mat:0xcfab79});
      }
    }
    for(const x of [x0+2.7,x1-2.7])box(x,(front+back)/2,.02,.07,.12,Math.abs(back-front)*k,0x8d8b81);
    const counterW=shop.id==='B101'?3.53:shop.id==='B110'?3.04:2.82;
    box(mid,standY+inside*2.2,.02,counterW,.67,.51,shop.wood,true);
    for(const dy of [front+inside*9,standY]) box(mid,dy,3.31,2.12,.04,.13,warm);
    zone(shop.name,shop.id+'호 · 원베일리 스퀘어',room,8);
  }

  // The published floor plan shows a three-wing revolving door in a long
  // glazed vestibule. Double-leaf public doors also flank the drum on the plan.
  // Their clear threshold supports customer traffic on both sides of the hub.
  const lobby=rect(1052,178,1081,345);slab(lobby);roof(lobby);
  zone('원베일리 스퀘어 회전문','B1 상가 · 선큰광장',lobby,6);
  for(const x of [1052,1081]){
    for(const [a,b] of [[178,193],[215,226],[285,302],[325,345]]){
      wall([x,a],[x,b],F,H,'glass',{thick:.035});
      box(x,(a+b)/2,0,.055,2.65,.055,0x54585a);
    }
    wall([x,178],[x,345],F+2.65,H,0x657073);
  }
  wall([1052,178],[1081,178]);wall([1052,345],[1081,345]);
  const [dx,dz]=p(1066.5,258);
  K.cyl({x:dx,z:dz,y:F+2.55,r:1.48,h:.16,mat:0x676d70,seg:32,solid:false});
  K.cyl({x:dx,z:dz,y:F,r:.067,h:2.58,mat:0x69706d,seg:12});
  const wings=new K.THREE.Group(),pane=new K.THREE.MeshLambertMaterial({color:0xb4d5d6,transparent:true,opacity:.37,depthWrite:false});
  const rail=new K.THREE.MeshLambertMaterial({color:0x6a7170});
  for(let i=0;i<3;i++){
    const leaf=new K.THREE.Group();leaf.rotation.y=i*Math.PI*2/3;
    for(const [width,height,base,material] of [[1.31,2.30,.12,pane],[1.33,.042,.14,rail],[1.33,.043,2.40,rail]]){
      const panel=new K.THREE.Mesh(new K.THREE.BoxGeometry(width,height,.028),material);
      panel.position.set(width/2,base+height/2,0);leaf.add(panel);
    }
    const end=new K.THREE.Mesh(new K.THREE.BoxGeometry(.034,2.30,.035),rail);
    end.position.set(1.31,1.27,0);leaf.add(end);wings.add(leaf);
  }
  wings.name='B1 public revolving entrance';wings.position.set(dx,F,dz);K.addMesh(wings);
  K.onFrame((dt,t,player)=>{if(player&&Math.hypot(player.x-dx,player.z-dz)<4)wings.rotation.y+=.48*dt;});
  sign('원베일리 스퀘어',1081.7,258,2.97,3.80,.35,rot+Math.PI/2,'#f4f3e8');
  const courtPlan=[[1081,174],[1238,174],[1238,104],[1292,104],[1292,215],[1338,215],[1338,328],[1395,385],[1370,410],[1081,410]];
  const court=points(courtPlan);slab(court,stone);K.groundHole(court);zone('원베일리 스퀘어 선큰광장','B1 상가 · 공공보행통로',court);
  // Retaining walls preserve the north pedestrian route and the south-eastern
  // approach. Street level is the project's local datum, not a surveyed level.
  for(const [a,b] of [[[1081,174],[1238,174]],[[1238,174],[1238,104]],[[1292,104],[1292,215]],[[1292,215],[1338,215]],[[1338,215],[1338,328]],[[1370,410],[1081,410]]]){
    wall(a,b,F,0,stone);wall(a,b,0,1.06,'glass',{thick:.05});
  }
  for(const [x,y] of [[1111,202],[1111,356],[1243,305]]){
    K.cyl({x:p(x,y)[0],z:p(x,y)[1],y:F,r:.37,h:.55,mat:0xa9aba2,seg:14});
  }
  // A raised pebble-shaped island appears on the plan between the two axes.
  const island=Array.from({length:24},(_,i)=>p(1199+27*Math.cos(i*Math.PI/12),260+8*Math.sin(i*Math.PI/12)));
  K.prism(island,F,F+.38,{mat:0xb1aea3,top:0x798463});
  const guide=(text,x,y,a)=>sign(text,x,y,2.48,4.6,.43,a,'#f8f4ea','#384447');
  guide('공공보행통로 · 한강공원 ↑',1261,143,rot);

  // The west mall edge is oblique. The physical left-side mouth on G2 lands at
  // this surveyed-in-model point. The fit between the two public plans is approximate.
  const mouth=[-365.10823,-13.72263], along=[-.93648,.35072];
  const eastApproach=[mouth,[mouth[0]+12*along[0],mouth[1]+12*along[1]],p(1384,387),p(1315,371)];
  const section=(a,b,wA,wB,covered,label)=>{
    const length=Math.hypot(b[0]-a[0],b[1]-a[1]),nx=-(b[1]-a[1])/length,nz=(b[0]-a[0])/length;
    const cross=(pos,offset)=>[pos[0]+nx*offset,pos[1]+nz*offset];
    const poly=[cross(a,-wA/2),cross(b,-wB/2),cross(b,wB/2),cross(a,wA/2)];
    slab(poly,stone);if(covered)roof(poly);zone(label,'고투몰 G2 · 원베일리 스퀘어',poly);
    if(covered)for(const s of [-1,1]){
      const t=Math.min(.65,length*.08),start=[a[0]+(b[0]-a[0])*t/length,a[1]+(b[1]-a[1])*t/length];
      const end=[b[0]-(b[0]-a[0])*t/length,b[1]-(b[1]-a[1])*t/length];
      K.wall(...cross(start,s*wA/2),...cross(end,s*wB/2),F,H,{mat:stone,thick:.10});
    }
  };
  for(let i=0;i<eastApproach.length-1;i++) section(eastApproach[i],eastApproach[i+1],[2.66,3.2,4.4][i],[3.2,4.4,5][i],i<2,'고투몰 G2 · 상가 접근로');
  // Northern outlet meets the existing public mural hall at its open end.
  section(p(1265,126),p(1265,72),4.2,4.2,false,'선큰광장 · 공공보행통로');
  section(p(1265,72),p(1265,50),4.2,4.2,true,'선큰광장 · 공공보행통로');
  const [sx,sz]=p(1040,363);K.spawn({name:'원베일리 스퀘어 B1 상가',x:sx,y:F,z:sz,yaw:rot+Math.PI});
}
