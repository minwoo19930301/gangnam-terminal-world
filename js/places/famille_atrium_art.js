import {placeDomeLining} from '../../assets/models/famille-dome/model.js';
import {placeReserveTimber} from '../../assets/models/famille-reserve-timber/model.js';
import { galleryLights, portraitDisplay } from '../../assets/models/famille-atrium/model.js';

// The roof and upper café follow the OSM drum. The clock and suspended birds
// follow the indoor concourse where the escalators meet.
const TAU = 2 * Math.PI;
const ribs = 16, eave = 11.7;
const roofRings = roofY => [[18.5,eave],[16.85,eave+.81],[12.1,15.1],[11.93,15.48],[4.65,roofY-2.45]];

function glazedRoof(K, { cx, cz, roofY, entryTubeWorld: beam }) {
  const rings = roofRings(roofY);
  const polar = (i, [r, h]) => [cx + r * Math.cos(i * TAU / ribs), h, cz + r * Math.sin(i * TAU / ribs)];
  const polygon = r => Array.from({ length: ribs }, (_, i) => {
    const [x, , z] = polar(i, [r, 0]);
    return [x, z];
  });
  const frame = 0x345e54;
  const timber = { tex: 'wood', color: 0x936f4a };
  const greenGlass = K.material('familleVerdigrisGlazing', new K.THREE.MeshLambertMaterial({
    color: 0x84b6a0, transparent: true, opacity: .48, depthWrite: false, side: K.THREE.DoubleSide
  }));
  // The physical ceiling follows the stepped roof. The central airspace stays
  // clear all the way up to the underside of the lantern.
  for (let k = 1; k < rings.length; k++) {
    const [r0, y0] = rings[k - 1], [r1, y1] = rings[k];
    for (let band = 0; band < 3; band++) {
      const r = t => r0 + (r1 - r0) * t / 3;
      K.phys.addCeiling(polygon(r(band)), y0 + (y1 - y0) * (band + .5) / 3, { holes: [polygon(r(band + 1))] });
    }
  }
  K.phys.addCeiling(polygon(rings.at(-1)[0]), roofY - .4, {});
  K.prism(polygon(18.51), eave - .23, eave, { holes: [polygon(17.95)], mat: frame, solid: false });
  for (let i = 0; i < ribs; i++) {
    const azimuth = (i + .5) * TAU / ribs;
    for (let j = 0; j < rings.length - 1; j++) {
      const lower = rings[j], upper = rings[j + 1];
      const a = polar(i, lower), b = polar(i + 1, lower), c = polar(i + 1, upper), d = polar(i, upper);
      const height = upper[1] - lower[1], run = lower[0] - upper[0], scale = Math.hypot(run, height);
      const normal = [Math.cos(azimuth) * height / scale, run / scale, Math.sin(azimuth) * height / scale];
      const glazed = j === 1 || j === 3;
      const finish = j === 1 ? greenGlass : { tex: 'glass', color: 0xa2cbbe };
      K.quad(glazed ? finish : 0x547f70, [a, b, c, d], normal);
      if (!glazed) {
        K.quad(0xb6beae,[a,b,c,d],normal.map(n=>-n));
        beam(a,d,.095,frame);
        continue;
      }
      beam(a, d, .14, frame);
      beam(a, b, .12, frame);
      for (const frac of [.33, .66]) {
        const band = [lower[0] - run * frac, lower[1] + height * frac];
        beam(polar(i, band), polar(i + 1, band), .07, frame);
      }
      if (j === 3) {
        const below = p => [p[0], p[1] - .20, p[2]];
        const joint = a.map((v, k) => (v + b[k] + c[k] + d[k]) * .25);
        for (const corner of [a, b, c, d]) beam(below(corner), below(joint), .20, timber);
        beam(below(a), below(b), .20, timber);
        beam(below(d), below(c), .20, timber);
      }
    }
    const upper = [4.65, roofY - .6];
    const a = polar(i, upper), b = polar(i + 1, upper);
    K.quad(0x487c6b, [a, b, [cx, roofY, cz], [cx, roofY, cz]], [0, 1, 0]);
    K.quad(0xb2c3b1, [a, b, [cx, roofY, cz], [cx, roofY, cz]], [0, -1, 0]);
    beam(polar(i, rings.at(-1)), a, .14, frame);
  }
  K.polyWalls(polygon(4.65), roofY - 2.45, roofY - .60, { mat: { tex: 'glass', color: 0x7aa897 }, thick: .04, solid: false });
  for (const y of [roofY - 2.45, roofY - .66]) {
    K.prism(polygon(4.72), y, y + .10, { holes: [polygon(4.49)], mat: frame, solid: false });
  }
}

function clockFace(K) {
  return K.texture('familleMemorialClock', 384, 1280, (g, w, h) => {
    const x = w / 2;
    g.fillStyle = '#215d55';
    g.fillRect(0, 0, w, h);
    g.fillStyle = '#447c70';
    g.fillRect(13, 0, w - 26, h);
    const circle = (cx, cy, r, fill, stroke, line) => {
      g.beginPath(); g.arc(cx, cy, r, 0, TAU);
      g.fillStyle = fill; g.fill();
      g.strokeStyle = stroke; g.lineWidth = line; g.stroke();
    };
    const segment = (x1, y1, x2, y2, color, line) => {
      g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2);
      g.strokeStyle = color; g.lineWidth = line; g.stroke();
    };
    for (const cy of [228, 800]) {
      const isClock = cy === 228;
      circle(x, cy, 130, '#344a44', '#b39766', 5);
      circle(x, cy, 120, isClock ? '#f9f3de' : '#52899a', '#323f44', 8);
      for (let tick = 0; tick < 60; tick++) {
        const a = tick * TAU / 60 - Math.PI / 2;
        const r = tick % 5 === 0 ? 102 : 110;
        segment(x + r * Math.cos(a), cy + r * Math.sin(a), x + 114 * Math.cos(a), cy + 114 * Math.sin(a), isClock ? '#343a3c' : '#dfc48c', tick % 5 === 0 ? 3 : 1);
      }
      if (isClock) {
        const numerals = ['XII', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'];
        g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = 'bold 22px Georgia, serif'; g.fillStyle = '#303439';
        numerals.forEach((n, i) => {
          const a = i * TAU / 12 - Math.PI / 2;
          g.fillText(n, x + 88 * Math.cos(a), cy + 88 * Math.sin(a));
        });
        segment(x, cy, x - 63, cy - 17, '#22262c', 7);
        segment(x, cy, x - 36, cy + 90, '#22262c', 5);
      } else {
        for (const r of [66, 85]) {
          g.strokeStyle = '#c5ac77'; g.lineWidth = 3;
          g.beginPath(); g.arc(x, cy, r, 0, TAU); g.stroke();
        }
        segment(x - 77, cy + 80, x + 85, cy - 83, '#e3c58a', 6);
      }
      circle(x, cy, 8, '#d5b575', '#3e4843', 2);
    }
    for (const y of [408, 485, 1004, 1183]) {
      segment(18, y, w - 18, y, '#233f3a', 9);
      segment(18, y + 5, w - 18, y + 5, '#b0a079', 2);
      for (let i = 0; i < 7; i++) {
        const xx = x + (i - 3) * 25;
        circle(xx, y - 16 - (3 - Math.abs(i)) * 4, 6, '#486c59', '#bea87d', 2);
      }
    }
    for (const xx of [9, 23, w - 23, w - 9]) segment(xx, 0, xx, h, '#d0c7a1', 4);
  }, [1, 1]);
}

function hangingBirds(K, { cx, cz, roofY, memorial, entryTubeWorld: beam }) {
  // Tethers meet the panels of the existing roof. The flock hangs toward the
  // arcade end of the light well while the lantern remains above the pavilion.
  const section=[[0,roofY],[4.65,roofY-.60],...roofRings(roofY).reverse()];
  function ceiling(x,z) {
    const angle=Math.atan2(z-cz,x-cx), rib=TAU/ribs;
    const delta=angle-rib*(Math.floor(angle/rib)+.5);
    const r=Math.hypot(x-cx,z-cz)*Math.cos(delta)/Math.cos(rib/2);
    for(let i=1;i<section.length;i++) {
      const [r0,h0]=section[i-1],[r1,h1]=section[i];
      if(r<=r1)return h0+(h1-h0)*(r-r0)/(r1-r0);
    }
    return eave;
  }
  const random = K.rand(1431);
  for (let i = 0; i < 58; i++) {
    const u = i / 57, a = u * TAU * 2.25 + random() * .75;
    const r = 1.1 + 2.30 * u + (random() - .5) * .90;
    const x = memorial.x+Math.cos(a)*r, z = memorial.birdsZ+Math.sin(a)*r*.60;
    const top=ceiling(x,z)-.12;
    const y=4.55+u*Math.min(12.35,top-5.7)+random()*.38;
    const heading = a + Math.PI / 2 + (random() - .5) * 1.18;
    const scale = .73 + random() * .48, bank = (random() - .5) * .62;
    const point = (along, across, lift) => [
      x + scale * (along * Math.cos(heading) - across * Math.sin(heading)),
      y + scale * (lift + across * bank),
      z + scale * (along * Math.sin(heading) + across * Math.cos(heading))
    ];
    const pearl = i % 3 === 1 ? { color: 0xb6c2c4, gloss: .7 } : 0xf4f1e7;
    const reverse = i % 3 === 1 ? 0x657577 : 0xdcdcd4;
    for (const side of [-1, 1]) {
      // A long, swept primary feather folds back from the rounded elbow.
      // The two surfaces meet along the ridge even when the wing is banked.
      const sections = [[.035,.06,-.17,.005],[.21,.17,-.125,.095],[.36,.16,-.045,.135],
        [.47,.055,-.115,.125],[.64,-.17,-.175,.17+.105*Math.sin(i)]];
      for (let j = 1; j < sections.length; j++) {
        const panel = ([width, lead, trail, lift]) => [point(lead, side * width, lift), point(trail, side * width, lift - .024)];
        const [a,b] = panel(sections[j-1]), [c,d] = panel(sections[j]);
        const wing = [a,c,d,b];
        K.quad(pearl, wing, [0, 1, 0]);
        K.quad(reverse, [b,d,c,a], [0, -1, 0]);
      }
      const spine = [[-.30,.01,.005],[-.14,.064,.022],[.08,.09,.048],[.22,.056,.064],[.31,.035,.061],[.37,.002,.048]];
      for (let j=1;j<spine.length;j++) {
        const [back,w0,h0]=spine[j-1], [front,w1,h1]=spine[j];
        K.quad(pearl, [point(back,0,h0+.04),point(front,0,h1+.04),
          point(front,w1*side,h1),point(back,w0*side,h0)], [0,.85,side*.5]);
        K.quad(reverse, [point(back,w0*side,h0),point(front,w1*side,h1),
          point(front,0,h1-.05),point(back,0,h0-.05)], [0,-.85,side*.5]);
      }
    }
    beam(point(0, 0, .05), [x,top,z], .008, 0x929897);
  }
}

function coffeeForest(K) {
  // Muted layers of coffee branches woven into the tall panels behind the seats.
  return K.texture('familleCoffeeForest', 768, 256, (g,w,h) => {
    g.fillStyle='#cec4a5'; g.fillRect(0,0,w,h);
    const random=K.rand(925);
    for (let row=0;row<3;row++) {
      g.strokeStyle=['#a5aa89','#89957c','#637b68'][row];
      g.fillStyle=['#afb294','#8d9b7d','#758972'][row];
      for(let k=0;k<8;k++){
        const x=k*w/7+random()*29, lean=(random()-.5)*87;
        const tip=h*(.04+.14*row+random()*.18);
        g.lineWidth=1.6+.55*row;
        g.beginPath(); g.moveTo(x,h); g.quadraticCurveTo(x+lean*.16,(h+tip)*.51,x+lean,tip); g.stroke();
        for(let j=1;j<9;j++) {
          const t=j/9, side=j%2?1:-1;
          const px=x+lean*t*t, py=h+(tip-h)*t;
          const ex=px+side*(14+random()*31), ey=py-(8+random()*20);
          g.beginPath(); g.moveTo(px,py); g.quadraticCurveTo((px+ex)/2,ey,ex,ey);
          g.quadraticCurveTo((px+ex)/2,py+1,px,py); g.fill();
        }
      }
    }
    g.fillStyle='rgba(235,224,194,.16)';
    for(let x=0;x<w;x+=4)g.fillRect(x,0,1,h);
  },[1,1]);
}

function memorialGallery(K, {memorial, y2, y3, entryTubeWorld: beam}) {
  const {x: cx, wallZ, galleryWidth} = memorial;
  const box = (x,y,z,w,h,d,mat) => K.box({x:cx+x,y,z:wallZ+z,w,h,d,mat,solid:false});
  const post = (x,y,z,r,h,mat) => K.cyl({x:cx+x,y,z:wallZ+z,r,h,mat,solid:false});
  const line = (a,b,width,mat) => beam([cx+a[0],a[1],wallZ+a[2]], [cx+b[0],b[1],wallZ+b[2]],width,mat);
  const steel = 0x343a36, brass = 0xad9671, cream = 0xdfd4bc;
  const walnut = {tex:'wood',color:0xaf8260};
  const half = 1.18, bottom = .72, spring = y3-1.97, crown = spring+half;
  const glaze = clockFace(K);
  // Both approaches see the enamel dial. With the opposite winding, texture
  // coordinates must also reverse so Roman numerals read correctly on each face.
  for (const side of [-1,1]) {
    const zFace = wallZ+side*.15;
    const point = (x,y) => [cx+x,y,zFace];
    const dial = pts => K.quad(glaze,pts,[0,0,side],
      pts.map(([x,y])=>[.5+side*(x-cx)/(2*half),(y-bottom)/(crown-bottom)]));
    const arch = (r,i) => point(r*Math.cos(i*Math.PI/20),spring+r*Math.sin(i*Math.PI/20));
    dial([point(-half,bottom),point(half,bottom),point(half,spring),point(-half,spring)]);
    for(let i=0;i<20;i++) {
      const a=arch(half,i), b=arch(half,i+1), center=point(0,spring);
      dial([a,b,center,center]);
      const outerA=arch(half+.32,i), outerB=arch(half+.32,i+1);
      K.quad(i%4===0?0xcabd9f:cream,[a,b,outerB,outerA],[0,0,side]);
      if(side<0) K.quad(cream,[outerA,outerB,[outerB[0],outerB[1],zFace+.30],[outerA[0],outerA[1],zFace+.30]],
        [Math.cos((i+.5)*Math.PI/20),Math.sin((i+.5)*Math.PI/20),0]);
      beam(a,b,.045,brass);
    }
    for (const sign of [-1,1]) {
      for(let y=1.82;y<spring;y+=.72) box(sign*1.36,y,side*.178,.35,.022,.02,0xafaa93);
    }
  }
  for(const sign of [-1,1]) {
    box(sign*1.36,bottom-.10,0,.36,spring-bottom+.12,.32,cream);
    box(sign*1.36,.36,0,.50,.38,.49,0xc2b196);
  }
  box(0,.35,0,3.17,.21,.55,cream);

  // Two brick bays rise on the solid portion of the middle landing. The
  // outer edges stop before the comb plates of the onward flights.
  const bayWidth = (galleryWidth-3.12)/2;
  for(const side of [-1,1]){
    const x=side*(1.56+bayWidth/2), depth=3.12;
    box(x,y2,depth,bayWidth,3.95,.14,'ccHallBrick');
    const aperture=bayWidth*.61;
    for(const face of [-1,1]){
      box(x,y2+.37,depth+face*.09,aperture,2.18,.09,0x3c342d);
      box(x,y2+.47,depth+face*.15,aperture-.15,1.94,.04,0x705a48);
      box(x,y2+.94,depth+face*.18,aperture*.58,1.13,.04,0xe1cfab);
      const pt=i=>[x+aperture*.55*Math.cos(i*Math.PI/16),y2+2.47+.49*Math.sin(i*Math.PI/16),depth+face*.20];
      for(let i=0;i<16;i++)line(pt(i),pt(i+1),.08,steel);
      for(const edge of [-1,1])box(x+edge*aperture*.55,y2+.05,depth+face*.20,.075,2.45,.10,steel);
    }
    for(let i=0;i<8;i++)box(x+bayWidth*((i+.5)/8-.5),y3-.49,depth-1,.08,.17,2.0,walnut);
    box(x,y2+.18,depth-.32,bayWidth*.66,.36,.38,0x534c3d);
    for(let i=0;i<5;i++)post(x+bayWidth*.13*(i-2),y2+.52,depth-.32,.16,.15+(i%3)*.06,[0x607453,0x4f6949,0x73815b][i%3]);
  }
  // The photographed portrait face overlooks the open court; keep the clock on its reverse.
  portraitDisplay(K,cx,.88,wallZ-.41);
  const lights=[];
  for(const side of [-1,1]) {
    lights.push([cx+side*2.65,y2,wallZ+2.25,0], [cx+side*3.5,y2,wallZ+2.20,.26*side]);
    lights.push([cx+side*3.45,0,wallZ-3.2,-.2*side]);
  }
  galleryLights(K,lights);
  const panels=6;
  for(let i=0;i<panels;i++){
    const w=galleryWidth/panels, x=-galleryWidth/2+(i+.5)*w;
    // The cornice belongs to the brick bays below, within the triple-height
    // opening. Leave a clear view through to the original 3F café rail.
    box(x,y3-1,3.1,w-.02,.87,.14,walnut);
    for(const side of [-1,1])line([x-w*.45,y3-.57-side*.37,3.02],[x+w*.45,y3-.57+side*.37,3.02],.042,0x73523b);
  }
  box(0,y2-.32,.18,galleryWidth,.16,.18,cream);
  box(0,y2-.18,.09,galleryWidth,.045,.035,{tex:'emit',color:0xffdcaa});
}

function furnishStarbucks(K, { cx, cz, y3, entryTubeWorld: beam }) {
  placeReserveTimber(K,cx,cz,y3);
  const box = (x, y, z, w, h, d, mat, rotY = 0) => K.box({ x: cx + x, y, z: cz + z, w, h, d, mat, rotY, solid: false });
  const tube = (x, y, z, r, h, mat) => K.cyl({ x: cx + x, z: cz + z, y, r, h, mat, solid: false });
  const steel = 0x2f3936, walnut = { tex: 'wood', color: 0xaf8260 };
  const coffeeTree = (x, y, z, size) => {
    tube(x, y, z, .33 * size, .51 * size, 0x746651);
    tube(x, y + .51 * size, z, .045 * size, 1.15 * size, 0x79664e);
    for (let j = 0; j < 9; j++) {
      const a = j * 2.40, r = size * (.23 + .06 * (j % 3));
      const outer = [cx + x + r * Math.cos(a), y + size * (1.22 + .095 * j), cz + z + r * Math.sin(a)];
      beam([cx + x, outer[1] - size * .31, cz + z], outer, .027 * size, 0x877253);
      for (let k = -1; k < 3; k++) {
        const dir = a + k * .78, dx = Math.cos(dir), dz = Math.sin(dir);
        const pt = (u,v,h) => [outer[0]+size*(dx*u-dz*v),outer[1]+size*h,outer[2]+size*(dz*u+dx*v)];
        const leaf = [pt(0,0,0),pt(.17,.095,.035),pt(.40,0,-.075),pt(.19,-.09,.01)];
        const green = [0x466744,0x688055,0x526d49][j%3];
        K.quad(green,leaf,[0,1,0]); K.quad(green,leaf,[0,-1,0]);
      }
    }
  };
  // The glazed upper ring houses the Reserve café. Shelving and banquettes
  // follow its outer edge, leaving the route along the inner balustrade free.
  const forest = coffeeForest(K);
  for (const [start,end] of [[-150,-110],[52,88]]) {
    for (let deg = start; deg < end; deg += 5) {
      const a = deg * Math.PI / 180, b = Math.min(deg + 5, end) * Math.PI / 180;
      const edge = (theta,r) => [cx + r*Math.cos(theta),cz + r*Math.sin(theta)];
      const p = edge(a,12.55), q = edge(b,12.55);
      K.wall(...p,...q,y3,y3+1.12,{mat:walnut,thick:.12,solid:false});
      K.wall(...p,...q,y3+.48,y3+.59,{mat:0x53624b,thick:.73,solid:false});
      const l=edge(a,13.14),r=edge(b,13.14),mid=(a+b)/2;
      const u=(deg-start)/50, v=(Math.min(deg+5,end)-start)/50;
      K.quad(forest,[[l[0],y3+.72,l[1]],[r[0],y3+.72,r[1]],
        [r[0],y3+3.08,r[1]],[l[0],y3+3.08,l[1]]],[-Math.cos(mid),0,-Math.sin(mid)],
        [[u,0],[v,0],[v,1],[u,1]]);
      K.wall(...l,...r,y3+3.08,y3+3.16,{mat:walnut,thick:.11,solid:false});
      if ((deg-start)%15===0) tube(l[0]-cx,y3+.65,l[1]-cz,.043,2.50,walnut);
    }
  }
  for(const angle of [-144,-126,58,76]){
    const x=11.45*Math.cos(angle*Math.PI/180), z=11.45*Math.sin(angle*Math.PI/180);
    tube(x,y3,z,.075,.72,steel); tube(x,y3+.72,z,.46,.065,walnut);
    K.person(cx+x*1.065,y3,cz+z*1.065,{sit:true,rotY:Math.atan2(-x,-z),shirt:x<0?0xb7a79b:0x515e55});
  }
  // The espresso counter and service aisle fit between the east guardrail
  // (world x=-35.9) and the glazed perimeter. Clear the two comb plates.
  box(14.02, y3, -.90, 1.08, .98, 4.80, walnut);
  box(14.02, y3 + .98, -.90, 1.17, .08, 4.90, 0x514d44);
  box(15.58,y3,-.94,.26,2.58,4.95,walnut);
  box(15.33,y3+.81,-.94,.51,.065,4.80,0x665244);
  for(const [x,z] of [[-8.6,-6.7],[-7.1,-9.1],[4.3,8.3],[-10.85,4.95]])coffeeTree(x,y3,z,1.08);
  K.person(cx+14.85,y3,cz-.62,{rotY:-Math.PI/2,shirt:0x365d48});
  K.sign('STARBUCKS  RESERVE', { x: cx + 13.46, y: y3 + .55, z: cz - .90, rotY: -Math.PI / 2, w: 3.7, h: .41, bg: null, fg: '#f4ddb1' });
  for (const [x, z] of [[-9.65, -5.65], [-10.45, -2.8], [-10.55, 4.5], [-5.35, 8.9], [-2.15, 10.25], [2.2, 10.25], [5.45, 8.9], [8.45, 7.65]]) {
    tube(x, y3, z, .09, .71, steel);
    tube(x, y3 + .71, z, .50, .065, walnut);
    for (const side of [-1, 1]) {
      box(x + side * .76, y3 + .40, z, .44, .09, .45, 0x907457);
      box(x + side * .94, y3 + .48, z, .06, .35, .45, walnut);
      for (const leg of [-1, 1]) box(x + side * .76, y3, z + leg * .16, .24, .40, .045, steel);
    }
  }
}

export function buildAtriumArt(K, layout) {
  glazedRoof(K, layout);
  placeDomeLining(K,layout.cx,layout.cz);
  const {x,wallZ} = layout.memorial;
  K.phys.addWall(x-1.58,wallZ,x+1.58,wallZ,0,layout.y2-.12,.18,'centralcity');
  K.detail({name:'메모리얼 광장 시계와 전광판',floor:'1F',
    rect:[x-4.1,wallZ-3.7,x+4.1,wallZ+3.5],y0:0,y1:layout.y3},()=>memorialGallery(K,layout));
  K.detail({name:'메모리얼 광장 새 조형물',floor:'2F',
    rect:[x-4.3,layout.memorial.birdsZ-3,x+4.3,layout.memorial.birdsZ+3],
    y0:4.2,y1:layout.roofY},()=>hangingBirds(K,layout));
  K.detail({name:'스타벅스 파미에파크R',floor:'3F',poly:layout.cafeDeck,
    y0:layout.y3,y1:layout.roofY},()=>furnishStarbucks(K,layout));
}
