import {eastShoppingArcade} from './arcade.js';
import {publicRotary} from '../cinema-rotary/place.js';
import {angle,normal,origin,point,publicAisle} from './layout.js';
import {cinemaEntrance} from './model.js';

export function boutiqueLobby(K,y){
  const bounds=[[-6.08,-5.0],[6.08,-5.0],[6.08,6.4],[-6.08,6.4]].map(([x,z])=>point(x,z));
  const ceiling=y+4.45;
  K.texture('megabox_plaza_stone',256,256,(g,w,h)=>{
    g.fillStyle='#bfb3a2';g.fillRect(0,0,w,h);
    for(const [x,z,col] of [[0,0,'#d5c9b8'],[128,0,'#d9cdbf'],[0,128,'#cfc4b5'],[128,128,'#dcd0bf']]){
      g.fillStyle=col;g.fillRect(x+1,z+1,127,127);
    }
  },[1.48,1.48]);
  K.texture('megabox_lobby_mosaic',128,128,(g,w,h)=>{
    g.fillStyle='#625947';g.fillRect(0,0,w,h);
    for(let row=-8;row<17;row++)for(let col=-8;col<17;col++){
      const x=col*16,z=row*16;
      g.strokeStyle=(row+col)%3?'#a89478':'#bcaa8e';g.lineWidth=2;
      g.beginPath();g.moveTo(x,z);g.lineTo(x+7,z+7);g.lineTo(x+15,z);g.stroke();
    }
  },[.42,.42]);
  // The B1 guide shows a white diagonal aisle joining the narrow aisle beside
  // the department's food counters. Both lie beyond its above-ground outline.
  K.hpoly('megabox_plaza_stone',publicAisle,y+.008,true);
  K.phys.addSurface(publicAisle,y);
  K.hpoly('ssg_ceil',publicAisle,ceiling+.005,false);
  K.phys.addCeiling(publicAisle,ceiling+.005,{});
  K.zone({name:'메가박스 앞 광장',sub:'신세계백화점 강남점 · 매표 로비 앞',floor:'B1',y0:y-.25,y1:ceiling,poly:publicAisle,priority:4});
  K.hpoly('megabox_plaza_stone',bounds,y+.012,true);
  K.phys.addSurface(bounds,y);
  const interior=[[-6.08,-5],[6.08,-5],[6.08,0],[-6.08,0]].map(([x,z])=>point(x,z));
  K.hpoly('megabox_lobby_mosaic',interior,y+.021,true);
  K.hpoly(0x504a40,interior,ceiling-.015,false);
  K.hpoly('ssg_ceil',bounds,ceiling,false);K.phys.addCeiling(bounds,ceiling,{});
  K.zone({name:'메가박스 센트럴',sub:'더 부티크 · 매표 로비',floor:'B1',y0:y-.25,y1:ceiling,poly:bounds,priority:9});
  const wall=(a,b,mat,top=ceiling)=>K.wall(...point(...a),...point(...b),y,top,{thick:.12,mat});
  wall([-6.08,-5],[6.08,-5],0x55504b);
  for(const x of [-6.08,6.08])wall([x,-5],[x,0],0x635f58);
  for(const sign of [-1,1]){
    K.phys.addWall(...point(sign*1.86,0),...point(sign*6.08,0),y,ceiling,.12);
  }
  const box=(x,z,width,depth,base,height,mat,solid=false)=>{
    const [wx,wz]=point(x,z);K.box({x:wx,z:wz,y:y+base,w:width,d:depth,h:height,rotY:angle,mat,solid});
  };
  // Public ticket/concession counter. Omit changing movie posters and prices.
  box(-.52,-3.94,7.54,.87,0,1.03,0x5c5146,true);
  box(-.52,-3.94,7.68,.98,1.01,.09,0xafa391);
  // A continuous blue menu strip is visible in the branch counter photograph.
  // Draw generic food illustrations so no current film, menu price or promotion is assumed.
  const boards=K.texture('megabox_blue_menu',1024,128,(g,w,h)=>{
    const grad=g.createLinearGradient(0,0,0,h);grad.addColorStop(0,'#086ca0');grad.addColorStop(1,'#15364d');
    g.fillStyle=grad;g.fillRect(0,0,w,h);
    for(let n=0;n<5;n++){
      const left=n*w/5;
      g.fillStyle='#b8d8df';g.font='bold 11px sans-serif';g.fillText(['POPCORN','DRINKS','COMBO','POPCORN','DRINKS'][n],left+12,20);
      for(let j=0;j<3;j++){
        const cx=left+39+j*63;
        if((j+n)%3===1){
          g.fillStyle='#dbe5d6';g.fillRect(cx+2,40,2,12);
          g.fillStyle='#d75c4b';g.beginPath();g.moveTo(cx-9,53);g.lineTo(cx+10,53);g.lineTo(cx+7,81);g.lineTo(cx-6,81);g.fill();
          g.fillStyle='#ece9d0';g.fillRect(cx-10,52,21,3);
        }else{
          g.fillStyle='#dda86d';g.beginPath();g.moveTo(cx-14,59);g.lineTo(cx+15,59);g.lineTo(cx+11,82);g.lineTo(cx-10,82);g.fill();
          for(let k=0;k<14;k++){g.fillStyle=['#f4dea2','#dcc38a','#edcd80'][k%3];g.beginPath();g.arc(cx-12+(k%5)*6,57-Math.floor(k/5)*4+Math.sin(k*3)*2,4.3,0,Math.PI*2);g.fill();}
          for(const off of [-6,0,6]){g.fillStyle='#b26d4f';g.fillRect(cx+off,63,2,15);}
        }
        g.fillStyle='#cbdfdf';g.fillRect(cx-14,92,28,2);g.fillStyle='#80a5b6';g.fillRect(cx-9,99,18,2);
      }
    }
  });
  function panel(key,x,z,width,base,height,left=0,right=1){
    const a=point(x-width/2,z),b=point(x+width/2,z);
    K.quad(key,[[a[0],y+base,a[1]],[b[0],y+base,b[1]],[b[0],y+base+height,b[1]],[a[0],y+base+height,a[1]]],[normal[0],0,normal[1]],[[left,0],[right,0],[right,1],[left,1]]);
  }
  for(const [i,x] of [-3.13,-1.8,-.47,.86,2.19].entries()){
    box(x,-4.86,1.20,.08,1.45,.73,0x23292c);
    panel(boards,x,-4.796,1.12,1.49,.65,i/5,(i+1)/5);
  }
  for(const x of [-1.05,1.08]){
    box(x,-4.07,.43,.23,1.1,.13,0x222623);
    box(x,-4.10,.58,.09,1.22,.31,0x30363a);
  }
  const ordering=K.texture('megabox_speed_order',256,384,(g,w,h)=>{
    const light=g.createLinearGradient(0,0,0,h);
    light.addColorStop(0,'#123645');light.addColorStop(.23,'#23609d');light.addColorStop(.57,'#60b6da');light.addColorStop(1,'#d4e8e5');
    g.fillStyle=light;g.fillRect(0,0,w,h);
    g.textAlign='center';g.fillStyle='#e9f8ff';g.font='bold 20px sans-serif';g.fillText('Speed Order',w/2,36);
    g.fillStyle='#74a8ce';g.fillRect(13,67,w-26,74);g.fillStyle='#e2d5ae';
    for(let k=0;k<12;k++){g.beginPath();g.arc(85+(k%6)*8,96-(k%3)*4,5,0,Math.PI*2);g.fill();}
    g.fillStyle='#b97b59';g.fillRect(84,99,45,23);
    for(let i=0;i<6;i++){
      const px=18+i%3*75,py=186+Math.floor(i/3)*67;
      g.fillStyle=i%2?'#d9e9e7':'#badfe3';g.fillRect(px,py,66,53);
      g.fillStyle='#7199ab';g.fillRect(px+12,py+35,41,3);
    }
  });
  for(const x of [3.15,4]){
    panel(ordering,x,-2.748,.55,1.0,.79);
    const a=point(x-.28,-2.9),b=point(x+.28,-2.9);
    K.phys.addWall(...a,...b,y,y+1.8,.18);
  }
  cinemaEntrance(K,origin[0],y,origin[1],angle);
  eastShoppingArcade(K,y);
  publicRotary(K,y);
}
