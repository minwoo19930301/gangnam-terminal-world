import { upperRestaurant } from './famille_upper_dining.js';

// The facilities open onto the garden level. Visitors can also descend inside the
// Starbucks drum and turn left along the shops, then rejoin the dining corridor.
// Store names follow the operator's 2F plan. The terrace widths are perspective fits.
export function buildGardenGallery(K, kit) {
  const {P,RECT,lbox,lwall,lsign,lcyl,lzone,beam,y}=kit;
  const top=9.6, tile={tex:'tile',color:0xc8bfb0}, stone=0xbeb4a3;
  const rail=0x514e43, paint=0xe3d6c1, lamp={tex:'emit',color:0xffe9bb};
  // These nodes are the actual adjoining OSM wall segment, shared at both levels.
  const west=[-41.52,198.77], east=[-36.47,201.55];
  const apron=(s,t0,t1)=>[P(s,t0),west,east,P(s,t1)];
  const lower=apron(202.60,19,22.69);
  const upper=apron(206.55,19,22.69);
  const deck=(poly,level)=>K.slab(poly,level,{mat:tile,under:0xd3cbbb,thick:.20,edge:stone});
  // Split adjoining faces so no slab cuts through the central atrium or a flight.
  deck(lower,y);
  deck(RECT(202.60,22.69,210.25,38.45),y);
  deck(upper,top);
  deck(RECT(206.55,22.69,210.25,26.2),top);
  const stairCorner=P(210.25,22.69);
  // The terrace alongside the stairs meets the angled edge of the round floor.
  // Both decks end exactly on the OSM facade, without extending into its void.
  // The entire upper approach is open to the sky apart from the terminal eave.
  const guard=(a,b,height)=>{
    if(Math.hypot(a[0]-b[0],a[1]-b[1])<.05)return;
    K.wall(...a,...b,height,height+1.03,{mat:'glass',thick:.045});
    K.wall(...a,...b,height+1.03,height+1.10,{mat:rail,thick:.075,solid:false});
    const count=Math.ceil(Math.hypot(a[0]-b[0],a[1]-b[1])/1.6);
    for(let i=0;i<=count;i++){
      K.cyl({x:a[0]+(b[0]-a[0])*i/count,z:a[1]+(b[1]-a[1])*i/count,
        y:height,r:.027,h:1.07,mat:rail,seg:6,solid:false});
    }
  };
  for(const [a,b,h] of [
    [P(202.60,19),west,y],[stairCorner,east,y],[stairCorner,P(210.25,38.45),y],
    [P(210.25,38.45),P(202.60,38.45),y],[P(202.6,38.45),P(202.6,37.1),y],
    [P(206.55,19),west,top],[stairCorner,east,top],[stairCorner,P(210.25,26.2),top],
    [P(206.55,19),P(206.55,26.2),top],
  ])guard(a,b,h);
  K.stairs(...P(208.4,36.35),...P(208.4,26.2),
    {ya:y,yb:top,w:3.7,mat:tile,railMat:rail,sideMat:stone});
  for(const [poly,level,label] of [[lower,y,'파미에스테이션 정원'],[upper,top,'스타벅스 정원 테라스'],
    [RECT(202.60,22.69,210.25,38.45),y,'파미에스테이션 정원'],
    [RECT(206.55,22.69,210.25,26.2),top,'스타벅스 정원 테라스']]){
    K.zone({place:'famille',name:label,floor:level===y?'2F':'3F',poly,y0:level-.16,y1:level+3.6,priority:10});
  }
  K.zone({place:'famille',name:'파미에스테이션 정원 계단',floor:'2F',poly:RECT(206.55,26.2,210.25,36.35),
    y0:y-.1,y1:top+.1,priority:8});
  // Slim canopy over the public facilities. The upper terrace itself stays open.
  K.material('famGardenPane',new K.THREE.MeshLambertMaterial({color:0x94c6ad,transparent:true,
    opacity:.34,depthWrite:false,side:K.THREE.DoubleSide}));
  const span0=202.62,span1=206.05, c0=8.68,c1=8.42;
  const roofPoint=(s,t,h)=>{const [x,z]=P(s,t);return [x,h,z];};
  for(let t=19;t<37.05;t+=2.6){
    const next=Math.min(t+2.6,37.05);
    K.quad('famGardenPane',[roofPoint(span0,t,c0),roofPoint(span1,t,c1),roofPoint(span1,next,c1),roofPoint(span0,next,c0)],[0,1,0]);
    beam([span0,t,c0],[span1,t,c1],.07,0x39574c);
  }
  for(const [s,h] of [[span0,c0],[span1,c1]])beam([s,19,h],[s,37.05,h],.095,0x39574c);
  beam([span0,37.05,c0],[span1,37.05,c1],.07,0x39574c);
  for(const t of [19.1,27.95,36.95])lbox(205.96,t,.095,.095,y,c1-y,0x39574c);
  for(const t of [19.1,37.65])lbox(205.7,t,.55,.55,.04,y-.22,0xb6ad9c);

  // Two distinct, openable frontages on the same sheltered landing. The
  // childcare centre and academy are named by the Seocho and Shinsegae guides.
  function gardenRoom(name,t0,t1,kind){
    const back=195.85,front=202.52,c=(t0+t1)/2,w=t1-t0;
    lwall(back,t0,back,t1,y,8.48,{mat:paint,thick:.13});
    for(const t of [t0,t1])lwall(back,t,front,t,y,8.48,{mat:paint,thick:.13});
    lwall(front,t0,front,t1,y,7.66,{mat:'glass',thick:.04,openings:[{at:w/2,w:1.55,y0:y,y1:7.66}]});
    for(const t of [t0,c-.82,c+.82,t1])lbox(front,t,.095,.065,y,2.70,0x5c5b4e,{solid:false});
    lbox(front,c,.15,w,7.67,.71,kind==='child'?0x729288:0x76634c,{solid:false});
    lsign(name,front+.09,c,8.03,w-.26,.34,'S',{fg:'#fff5df',bg:null,pxPerM:110});
    const poly=RECT(back,t0,front,t1);
    K.zone({place:'famille',name,floor:'2F',poly,y0:y-.03,y1:8.50,priority:14});
    K.detail({name,floor:'2F',poly,y0:y,y1:8.5},()=>{
      const furn=(s,t,ds,dt,h,dh,mat)=>lbox(s,t,ds,dt,y+h,dh,mat,{solid:false});
      if(kind==='child'){
        // The municipal visitor photos show a check-in tablet, a padded play
        // area, picture books and low cupboards in the playroom.
        K.hpoly({tex:'wood',color:0xb38961},poly,y+.025,true);
        furn(front-.25,t0+.80,.32,1.34,.12,2.51,0x889259);
        lsign(['서초구가족센터','SEOCHO FAMILY CENTER'],front-.078,t0+.80,y+1.90,1.11,.54,'S',
          {bg:'#f4f2e5',fg:'#383833',pxPerM:150});
        furn(front-.56,t1-.65,.67,.95,.02,.78,0xbda384);
        furn(front-.54,t1-.66,.46,.66,.80,.035,0xe2d1b2);
        furn(front-.53,t1-.60,.07,.29,.835,.24,0x494b47);
        furn(front-.485,t1-.60,.015,.25,.86,.17,0xc0dde2);
        furn(back+.20,c,.22,w-1.05,1.24,.92,0xebeee8);
        for(const [j,col] of [0xd7aa80,0x9ab3a2,0xd7bb80,0xaa9385].entries())
          furn(back+.34,t0+1.18+j*.43,.04,.30,1.50,.22,col);
        const wood={tex:'wood',color:0xbf9d77};
        for(const h of [.12,.50,.88])furn(front-1.3,t0+.48,1.55,.75,h,.055,wood);
        for(const s of [front-2.05,front-1.55,front-1.05,front-.55])furn(s,t0+.48,.04,.75,.12,.81,wood);
        furn(back+2.1,c,2.7,w-1.14,.035,.025,0xe2ded2);
        for(const [ds,dt,col] of [[1.7,-.6,0xb99074],[2.18,.4,0x8ea69b],[2.7,-.32,0xcdaf79]])
          furn(back+ds,c+dt,.34,.34,.06,.26,col);
        for(let j=0;j<2;j++)furn(back+.18,c,.27,w-.72,.38+j*.52,.06,wood);
        for(let j=0;j<14;j++)furn(back+.2,t0+.53+j*(w-1.18)/14,.16,.12,.44,.21+(j%3)*.04,[0xcd987c,0x84988a,0xbbaa75][j%3]);
      } else {
        // The Gangnam lounge has a wood louvre ceiling and cream seating.
        // Beyond it the language classroom has a whiteboard and red accent wall.
        for(let t=t0+.15;t<t1-.08;t+=.20)furn(front-1.08,t,2.12,.075,3.18,.16,0xb08a63);
        furn(front-1.08,t1-.44,1.52,.68,.13,.38,0xcaba9c);
        furn(front-1.08,t1-.16,1.52,.16,.49,.36,0xc3b292);
        furn(front-1.02,t1-1.08,.58,.43,.41,.08,0x947453);
        furn(back+1.87,t0+.09,3.65,.11,.05,2.65,0xb75339);
        furn(back+.11,c,.095,w-.7,1.12,1.18,0xb9b8af);
        furn(back+.17,c,.025,w-.83,1.18,1.06,0xe6e5dc);
        for(const s of [back+1.58,back+3.07]) for(const t of [c-.86,c+.86]){
          furn(s,t,.62,1.18,.72,.065,0xbba383);
          furn(s,t,.13,.75,.04,.68,0x747270);
          furn(s+.60,t,.48,.46,.44,.065,0x8e6c52);
          furn(s+.80,t,.055,.46,.49,.35,0x9e7d62);
          furn(s+.60,t,.08,.22,.02,.43,0x6d6660);
        }
      }
    });
  }
  gardenRoom('서초구 열린육아나눔터 키움',24.70,29.10,'child');
  gardenRoom('신세계아카데미',29.35,33.90,'academy');
  const shopFront=184.75, shopBack=181.35;
  upperRestaurant(K,kit,{name:'담꽃',brand:'담장 옆에 국화꽃  CCOT',face:'S',s0:shopBack,s1:shopFront,t0:16.55,t1:23.3,
    wall:0x49473f,floor:0x8e745c,sign:0x393b34,ink:'#f2e6ca',y,level:'2F'});
  for(const [name,t0,t1,nail] of [['빗경',11.86,16.40,false],['루경',-8.58,-3.80,false],['위치네일스',-12.90,-8.75,true]]){
    const center=(t0+t1)/2,w=t1-t0;
    for(const t of [t0,t1])lwall(shopBack,t,shopFront,t,y,8.38,{mat:paint,thick:.10});
    lwall(shopBack,t0,shopBack,t1,y,8.38,{mat:paint,thick:.10});
    lwall(shopFront,t0,shopFront,t1,y,7.68,{mat:'glass',thick:.035,openings:[{at:w/2,w:1.9,y0:y,y1:7.68}]});
    for(const t of [t0,center-.99,center+.99,t1])lbox(shopFront,t,.08,.055,y,2.72,0x635648,{solid:false});
    lbox(shopFront,center,.18,w,7.7,.62,0x514b42,{solid:false});
    lsign(name,shopFront+.11,center,8.00,2.65,.36,'S',{bg:null,fg:'#f8e6c7',pxPerM:105});
    const poly=RECT(shopBack,t0,shopFront,t1);
    K.zone({place:'famille',name,floor:'2F',poly,y0:y-.05,y1:8.5,priority:13});
    K.detail({name,floor:'2F',poly,y0:y,y1:8.5},()=>{
      for(const t of [center-w*.245,center+w*.245]){
        if(nail){
          lbox(shopBack+1.4,t,.72,1.15,y+.74,.07,0xc3b09e,{solid:false});
          lbox(shopBack+1.4,t,.50,.86,y+.04,.70,paint,{solid:false});
          for(let j=0;j<7;j++)lcyl(shopBack+1.20,t-.31+j*.10,y+.81,.036,.15,[0xac746d,0xba9b91,0x85828a][j%3],{solid:false});
        } else {
          lbox(shopBack+.13,t,.16,1.48,y+.79,1.54,0x867461,{solid:false});
          lbox(shopBack+.23,t,.035,1.35,y+.85,1.40,{color:0x9faaa6,gloss:.7},{solid:false});
          lbox(shopBack+.38,t,.48,1.53,y+.78,.085,0x715c4b,{solid:false});
        }
        const chair=shopBack+(nail?2.19:1.55);
        lcyl(chair,t,y+.04,.27,.06,0x696663,{solid:false});
        lcyl(chair,t,y+.10,.07,.34,0x817b75,{solid:false});
        lbox(chair,t,.55,.55,y+.44,.13,0x614e45,{solid:false});
        lbox(chair+.23,t,.10,.54,y+.55,.38,0x614e45,{solid:false});
      }
    });
  }
  // An unbroken floor in the turnover was previously lost in the blank space
  // between the two restaurant rows. Flanking materials lead to Katsu 8.
  const runner={tex:'tile',color:0xcdbfa8};
  const passage=(s0,t0,s1,t1)=>{
    K.hpoly(runner,RECT(s0,t0,s1,t1),y+.017,true);
    lzone(s0,t0,s1,t1,{place:'famille',name:'파미에스테이션 2층 산책로',floor:'2F',y0:y-.06,y1:8.5,priority:10});
  };
  passage(187.78,22.1,202.67,26.5);
  passage(185.10,-16.0,187.78,26.5);
  passage(176.55,-16.0,185.10,-13.04);
  passage(176.28,-34.0,178.35,-16.0);
  for(let t=-14;t<21;t+=4.4){
    lbox(186.45,t,2.92,.105,8.25,.12,0x785d45,{solid:false});
    lbox(186.45,t,1.28,.070,8.23,.022,lamp,{solid:false});
  }
  lsign('카츠8 · 무월식탁',185.45,-14.5,7.55,2.50,.29,'S',{fg:'#f8efd9',bg:'#473e33'});
}
