import {damccotRoom} from '../../assets/models/damccot/room.js';

// Local s is the building's long axis; each storefront opens toward the shared aisle.
export function upperRestaurant(K, kit, spec) {
  if(spec.name==='담꽃')return damccotRoom(K,kit,spec);
  const { P, RECT, lbox, lwall, lsign, lcyl, lzone } = kit;
  const { name, brand, s0, s1, t0, t1, face, wall, floor, sign, ink, y, level } = spec;
  const depth = s1 - s0, width = t1 - t0;
  const signFace = face === 'S' ? 'S' : 'N';
  const ds = face === 'S' ? -1 : 1;
  const s = d => ds === 1 ? s0 + d : s1 - d;
  const t = d => t0 + d;
  const B = (d, w, bottom, dx, dw, h, mat, opts = {}) =>
    lbox(s(d), t(w), dx, dw, y + bottom, h, mat, { solid: false, ...opts });
  const C = (d, w, bottom, r, h, mat) => lcyl(s(d), t(w), y + bottom, r, h, mat, { solid: false, seg: 12 });
  const label = (str, d, w, center, sw, sh, color) =>
    lsign(str, s(d), t(w), y + center, sw, sh, signFace, { fg: color, bg: null });
  const lit = { tex: 'emit', color: 0xffe5ba };
  const wood = { tex: 'wood', color: 0x917152 };
  const back = s(depth);
  lwall(s(0), t0, back, t0, y, y + 3.35, { mat: wall, thick: .11 });
  lwall(s(0), t1, back, t1, y, y + 3.35, { mat: wall, thick: .11 });
  lwall(back, t0, back, t1, y, y + 3.35, { mat: wall, thick: .11 });
  K.hpoly({ tex: 'tile', color: floor }, RECT(s0,t0,s1,t1), y + .024, true);
  B(0, width / 2, 2.67, .18, width, .55, sign);
  label(brand, -.105, width / 2, 2.96, Math.min(5, width - .3), .36, ink);
  lzone(s0,t0,s1,t1,{name,place:'famille',floor:level,sub:'파미에스테이션',y0:y,y1:y+3.5,priority:12});
  // Shopfront glazing flanks the open middle, while the coffee counters and
  // the semi-open Korean dining rooms meet the aisle directly.
  if(['카츠8','아웃백 스테이크하우스','딤딤섬'].includes(name)){
    const halfDoor=name==='아웃백 스테이크하우스'?1.65:1.2;
    for(const [a,b] of [[.12,width/2-halfDoor],[width/2+halfDoor,width-.12]]) {
      lwall(s(.02),t(a),s(.02),t(b),y,y+2.64,{mat:'glass',thick:.035});
      for(let w=a;w<b;w+=1.7) B(.02,w,0,.095,.065,2.65,0x413a32);
      B(.02,(a+b)/2,.1,.1,b-a,.16,0x413a32);
      B(.02,(a+b)/2,2.29,.1,b-a,.055,0x413a32);
    }
  }

  K.detail({name, floor:level, poly:RECT(s0,t0,s1,t1), y0:y, y1:y+3.5}, () => {
    function table(d,w,top,seats) {
      B(d,w,.73,.82,1.05,.06,top);
      C(d,w,.04,.08,.69,0x45413a);
      for (const side of [-1,1]) {
        B(d,w + side * .72,.43,.44,.43,.075,seats);
        B(d,w + side * .90,.5,.44,.055,.33,seats);
        for (const dd of [-.16,.16]) for (const dt of [-.15,.15])
          B(d+dd,w+side*.72+dt,0,.035,.035,.43,0x5a5247);
      }
    }
    function tables(start,end,spacing,top,seats) {
      for (let w=start; w<end; w+=spacing) table(depth*.44,w,top,seats);
    }
    function coffeeBar(d, w, span, color) {
      B(d,w,0,.78,span,.99,color);
      B(d,w,.99,.87,span+.08,.075,0xd7cdc0);
      B(d,w-.2*span,1.07,.5,1.05,.47,0x494c4c);
      B(d,w+.18*span,1.07,.56,1.04,.42,'glass');
      for(let i=0;i<4;i++) C(d,w+.2*span-.36+i*.2,1.09,.08,.09,0xc59659);
      C(d,w-.2*span+.66,1.07,.13,.35,0x373936);
    }
    function pendants(d,start,end,shade) {
      for(let w=start;w<end;w+=2.35){
        C(d,w,2.65,.012,.63,0x4f4840);
        C(d,w,2.48,.18,.17,shade);
        C(d,w,2.465,.14,.018,lit);
      }
    }
    if(name==='하프커피'){
      B(depth-.12,width*.32,0,.12,width*.62,2.6,0x22536d);
      coffeeBar(depth-.9,width*.34,width*.46,0xe2e0d6);
      label('halff',depth-.21,width*.31,2.14,2.3,.47,'#e7c88a');
      for(let w=width*.6;w<width-1;w+=2.6){
        C(depth*.46,w,.61,.49,.06,0xd2b99b);
        C(depth*.46,w,.02,.14,.59,0x857358);
        for(const side of [-1,1]) C(depth*.46,w+side*.84,.02,.29,.44,side<0?0x357778:0x21475b);
      }
    } else if(name==='카츠8'){
      B(depth-.14,width/2,.3,.11,width-.4,2.05,0x242626);
      for(let w=.45;w<width-.3;w+=.34) B(depth-.23,w,.3,.07,.05,2.09,0x493f35);
      // Two illuminated panoramic landscape screens above the black booths.
      for(const w of [width*.25,width*.75]){
        const span=width*.4;
        B(depth-.31,w,1.36,.07,span,1.11,0xe5cda5);
        B(depth-.35,w,2.44,.105,span,.035,lit);
        for(let n=0;n<12;n++){
          const q=P(s(depth-.36),t(w-span*.44+n*span*.077)),h=.16+.30*(.5+.5*Math.sin(n*1.17));
          K.dome({x:q[0],z:q[1],y:y+1.39,rx:.06,rz:Math.min(span*.08,.28),ry:h,mat:n%2?0x7e705c:0x918267,seg:7,rings:3});
        }
        B(depth-.66,w,.45,.88,span,.13,0x242525);
        B(depth-.27,w,.58,.14,span,.57,0x31302f);
      }
      tables(1.35,width-1.2,3,0x28292a,0x4c4036);
      pendants(depth*.48,1.35,width-1,0x39332c);
      for(let w=.7;w<width-1;w+=3) {
        B(depth*.44,w+.65,.807,.16,.22,.02,0x332b26);
        C(depth*.44,w+.7,.83,.045,.12,0x776044);
      }
    } else if(name==='매우매오'){
      tables(1.3,width-1.3,2.6,wood,0xa98151);
      for(let w=.6;w<width/2-.8;w+=.32) B(.12,w,.12,.09,.10,.81,wood);
      B(depth-.43,width*.62,.38,.64,width*.55,.12,0xb98e58);
      for(let w=width*.39;w<width*.87;w+=1.5) B(depth-.19,w,.50,.12,.62,.62,wood);
      const p=P(s(depth-.12),t(width*.28));
      for(let j=0;j<12;j++){
        const angle=j*Math.PI/6;
        const q=P(s(depth-.15),t(width*.28+Math.cos(angle)*.43));
        K.dome({x:q[0],z:q[1],y:y+2.12+Math.sin(angle)*.43,rx:.13,rz:.13,ry:.13,mat:0xe2ae48,seg:8,rings:4});
      }
      K.dome({x:p[0],z:p[1],y:y+2.12,rx:.24,rz:.24,ry:.24,mat:0x6d5029,seg:10,rings:5});
    } else if(name==='빈브라더스'){
      coffeeBar(depth*.71,width*.27,width*.47,0x303432);
      B(depth*.71,width*.27,2.82,.8,.14, .15,0x333531);
      for(const w of [width*.04,width*.51]) B(depth*.68,w,0,.10,.10,3.21,0x343632);
      B(depth*.72,width*.28,3.11,depth*.54,width*.48,.08,{tex:'emit',color:0xfff5df});
      B(depth-.19,width*.73,1,.32,width*.34,.055,wood);
      for(let w=width*.59;w<width*.86;w+=.46) {
        B(depth-.20,w,1.06,.15,.23,.25,0xd4bda0);
        B(depth-.29,w,1.09,.018,.13,.11,0x41413a);
      }
      B(depth*.57,width*.74,.75,.78,width*.32,.07,wood);
      for(let w=width*.62;w<width*.87;w+=1.2) C(depth*.57-.62,w,.02,.18,.46,0x54554c);
    } else if(name==='무월식탁'){
      B(depth-.12,width*.66,.8,.10,width*.6,1.12,0xa5b5ad);
      for(let w=width*.37;w<width*.95;w+=.30) B(depth-.181,w,.8,.018,.012,1.12,0xe1ded0);
      for(let h=.8;h<1.92;h+=.28) B(depth-.182,width*.66,h,.018,width*.59,.014,0xe1ded0);
      B(depth-.61,width*.23,.02,.7,width*.34,.9,wood);
      B(depth-.61,width*.23,.92,.78,width*.35,.06,0xc3b39b);
      for(let w=width*.12;w<width*.34;w+=.51){
        C(depth-.6,w,.985,.14,.04,0xede3cf);
        C(depth-.6,w,1.025,.085,.06,0x596a49);
      }
      B(depth-.53,width*.70,.43,.77,width*.49,.16,0x675343);
      B(depth-.22,width*.70,.59,.16,width*.49,.45,0x4e5245);
      tables(width*.48,width-.85,2.4,0xe1d8c5,0x44382f);
      pendants(depth*.42,width*.47,width-.8,0xc89e64);
    } else if(name==='아웃백 스테이크하우스'){
      for(let w=2;w<width-1;w+=4.1){
        B(depth-.98,w,.42,1.2,2.58,.15,0x985d3e);
        B(depth-.42,w,.55,.19,2.58,.70,0x7e4935);
        B(depth-1.85,w,.74,1.04,1.82,.07,wood);
        B(depth-1.85,w,.04,.18,.6,.70,0x3b322d);
      }
      tables(2,width-1,4.1,wood,0x715340);
      pendants(depth-1.6,2,width-1,0xb29568);
      B(.7,width*.13,0,1.05,1.85,1.06,0x68513d);
      label('OUTBACK',.13,width*.13,.72,1.50,.29,'#e6d6bd');
    } else if(name==='딤딤섬'){
      B(depth-.9,width*.5,0,.8,width*.86,1.02,0x443a33);
      B(depth-.9,width*.5,1.02,.85,width*.86,.60,'glass');
      for(let w=width*.12;w<width*.86;w+=.63)
        for(let row=0;row<2;row++) C(depth-.87,w,1.08+row*.12,.23,.11,0xcba36e);
      tables(1.3,width-1.1,2.7,0xe3d5c1,0x4a4037);
      pendants(depth*.46,1.32,width-1,0x714636);
      label('點點心',depth-.15,width*.5,2.3,2.55,.5,'#edc989');
    }
  });
}
