import {jarGlass} from './jar-glass.js';
import {placeMirrors} from './mirrors.js';
import {boxSilhouette} from '../interior-architecture/box-silhouette.js';
import {placeSingleDetail} from '../interior-architecture/single-detail.js';
import {loadBakedSurface} from '../interior-architecture/baked-surface.js';
import {bay,parts,tables,lamps} from './layout.js';
const wood=0x694335,warm=0xece0c8,metal=0xa6a49a,oak=0x865237;
const proxy={
 menu:[[0,.986,.009,.842,.558,.008,0xe9ddc8],[-.21,1.005,.004,.398,.517,.006,0x8f7056]],
 art:[[0,1.30,0,.057,1.38,.82,0x8c7858],[.045,1.35,0,.024,1.24,.714,0x60523d],[.069,1.67,.03,.021,.74,.29,0xcfbe95],[0,1.17,-.88,.062,1.19,.337,wood],[0,1.17,.88,.062,1.19,.337,wood]],
 room:[[0,.012,2.97,12.28,.028,5.94,0x969183],[0,3.414,2.97,12.28,.06,5.94,0xe4cfaa],[0,.04,5.9,12.28,3.42,.09,0xd6ac5d],[-6.10,.04,2.97,.08,3.40,5.94,0x63766b]],
 sign:[[0,2.71,-.035,1.60,.58,.067,0x252725],[-1.27,.045,.04,.08,3.20,.09,0x292925],[1.27,.045,.04,.08,3.2,.09,0x292925],[0,3.216,.04,2.62,.065,.066,0x282726],[0,2.85,-.08,.93,.17,.011,0xf0ead9]],
 host:[[0,.05,0,1.32,.94,.48,oak],[0,.987,-.004,1.41,.055,.546,0x574437],[.2,1.06,-.05,.32,.44,.02,warm],[.83,.04,.37,.38,2.79,.30,wood],[.83,1.47,.20,.32,.79,.023,0xbcae88]],
 seat:[[0,.043,.604,1.51,.37,.45,wood],[0,.413,.58,1.55,.09,.47,0xa44c38],[0,.49,.79,1.56,.56,.093,0xa44c38],[0,1.036,.82,1.566,.052,.127,0x63766b],[0,.716,0,1.48,.037,.77,wood]],
 granite:[[0,.748,0,1.56,.032,.812,0xc8b89c]],
 pickles:[[0,.006,0,.126,.10,.126,0xbd893c],[.112,.005,-.328,.164,.014,.145,metal],[.112,.020,-.328,.09,.021,.085,0xc29554],[.128,.007,-.045,.098,.016,.098,0xa88d62],[-.028,.095,-.008,.013,.154,.016,0xbebcb0]],
 pickleGlass:[[0,.009,0,.129,.127,.129,0xe4cd95]],
 setting:[[-.586,.004,.25,.163,.031,.163,warm],[.05,.006,.28,.26,.023,.11,wood]],
 lamp:[[0,3.00,0,.025,.39,.025,0xab976c],[-.02,2.91,0,.66,.035,.035,0xbfa77e],[.31,2.93,0,.116,.14,.116,warm],[-.35,2.94,0,.13,.14,.13,warm]],
 mala:[[0,.015,0,.26,.11,.26,warm],[0,.114,0,.24,.009,.24,0xaf532d],[0,.125,0,.14,.024,.14,0xbd9d83]],
 rice:[[0,.001,0,.30,.023,.30,0x687b96],[0,.024,0,.24,.034,.21,0xe5c88b]],
 eggplant:[[0,.003,0,.31,.025,.27,warm],[0,.031,0,.22,.039,.17,0xb57b42]],
};
for(const x of [-4.06,-.16,3.75])proxy.room.push([x,1.10,5.833,2.63,1.79,.108,warm],[x,1.24,5.765,2.38,1.39,.035,0x63766b]);
for(const x of [-.39,.39])proxy.seat.push([x,.437,-.64,.39,.056,.35,oak],[x,.648,-.83,.40,.15,.028,wood],[x,.047,0,.047,.663,.047,0x31312e]);
proxy.host.push([1.48,.045,-.138,.436,.029,.297,0x303331],[1.48,.986,-.149,.861,.558,.036,0x393a35]);
for(const dx of [1.275,1.685])proxy.host.push([dx,.07,-.129,.028,.94,.028,0x343632]);
const cache=new Map();let paint,glow,glass;
export function placeCharDining(K,P,orientation){
  const T=K.THREE,angle=orientation+Math.PI,base=5,W=(x,d)=>P(bay.mid+x,bay.front-d);
  const at=(x,d,h)=>{const [a,b]=W(x,d);return[a,base+h,b];};
  const rect=(a,b,c,d)=>[W(a,b),W(c,b),W(c,d),W(a,d)];
  const [ox,oz]=W(0,0),co=Math.cos(angle),si=Math.sin(angle);
  const local=(x,z)=>[(x-ox)*co-(z-oz)*si,(x-ox)*si+(z-oz)*co];
  const sees=(x,z)=>{const [sx,sd]=local(x,z);return sd<bay.depth+.012&&sx>-6.13&&(sd<0||sx<6.17);};
  // Only the rear and west faces are opaque. The east side and the gallery front are open.
  const eyePoly=rect(-6.08,.04,6.09,5.86),eyeMin=base+.08,eyeMax=base+3.36;
  for(const [a,b] of [[W(-6.09,5.90),W(6.09,5.90)],[W(-6.11,.04),W(-6.11,5.90)]]){
    K.occludingWall({a,b,y0:base+.06,y1:base+3.39,eyePoly,eyeMin,eyeMax});
  }
  const block=(x,d,w,length,height)=>K.phys.addPolyWalls(rect(x-w/2,d-length/2,x+w/2,d+length/2),base,base+height,.018,'famille');
  for(const [x,d] of tables){
    block(x,d,1.56,.812,.781);block(x,d+.648,1.55,.476,1.09);
    for(const dx of [-.395,.395]){
      const seat=rect(x+dx-.178,d-.829,x+dx+.178,d-.456);
      K.phys.addSurface(seat,base+.478,{tag:'famille'});K.phys.addPolyWalls(seat,base,base+.478,.015,'famille');
      K.phys.addWall(...W(x+dx-.192,d-.835),...W(x+dx+.192,d-.835),base+.485,base+.836,.018,'famille');
    }
  }
  block(.59,.43,.436,.297,1.04);
  K.phys.addPolyWalls(rect(.165,.36,1.014,.465),base+.98,base+1.55,.012,'famille');
  block(-.89,.57,1.32,.48,1.04);block(-.06,.94,.38,.30,2.79);
  K.zone({name:'차알 파미에스테이션점',floor:'2F',sub:'FP218 · Chinese-American Dining',poly:rect(-6.12,.01,6.12,5.92),y0:base,y1:base+3.45,priority:22});
  K.detail({name:parts.mirrors[0],floor:'2F',poly:rect(-5.23,5.725,4.93,5.758),y0:base,y1:base+3.45,visibleFrom:(x,y,z)=>y>base-.1&&y<base+3.49&&sees(x,z)},()=>{
    placeMirrors(K,parts.mirrors[0],at(0,0,0),angle,sees);
  });
  paint??=new T.MeshLambertMaterial({side:T.DoubleSide,vertexColors:true});glow??=new T.MeshBasicMaterial({side:T.DoubleSide,vertexColors:true});
  glass??=jarGlass(T);
  function put(key,pos,bounds,range,exit,eyeHeight,offsets){
    const label=parts[key][0],shell=key==='room';
    const visible=(x,z)=>sees(x,z)&&(key!=='menu'||local(x,z)[1]<.448);
    K.detail({name:label,floor:'2F',poly:rect(...bounds),y0:base,y1:base+3.48,visibleFrom:(x,y,z)=>y>base-.12&&y<base+3.60&&(shell||visible(x,z))},()=>{
      if(!cache.has(key)){
        const coarse=boxSilhouette(T,proxy[key]);
        // Preserve the jar bounds for visibility scheduling. Its far form needs no glass draw.
        if(key==='pickleGlass')coarse.setIndex([]);
        cache.set(key,coarse);
      }
      const mat=key==='sign'?glow:key==='pickleGlass'?glass:paint;
      placeSingleDetail(K,{name:label,file:'../char-dining/'+key+'.glb',at:at(...pos),angle,fallback:cache.get(key),fallbackMaterial:mat,
        material:shell||key==='granite'||key==='menu'?null:mat,loadSurface:shell?file=>loadBakedSurface(T,file):undefined,
        range,exitRange:exit,floorTolerance:2.55,eyeHeight,translations:offsets,closeVisibleFrom:p=>visible(p.x,p.z)});
    });
  }
  for(const [key,b,r,e,h] of [
    ['room',[-6.14,0,6.14,5.94],16,19,1.55],['sign',[-3.97,.03,-1.31,.83],17,21,2.81],['host',[-1.65,.26,1.05,1.12],8.6,11,1.33],['menu',[.157,.35,1.017,.47],4.8,6,1.29],
    ['art',[-6.07,2.11,-5.94,4.26],8.2,10.0,1.77],
    ['mala',[1.01,2.19,1.33,2.51],3.75,4.65,.10],['rice',[1.56,2.36,1.92,2.70],3.75,4.65,.06],['eggplant',[-4.59,2.30,-4.23,2.60],3.75,4.65,.08],
  ])put(key,parts[key].slice(1),b,r,e,h);
  // Look independently toward each portion of the open bay. Instances retain their native source and one draw.
  for(const [left,right] of [[-6.14,-2.45],[-2.45,2.64],[2.64,6.14]]){
    const rows=tables.filter(([x])=>x>=left&&x<right),[cx,cd]=rows[0];
    for(const [key,r,e,h] of [['seat',9,11,.68],['granite',6.0,7.65,.765],['setting',5.25,6.4,.16]]){
      put(key,[cx,cd,parts[key][3]],[Math.min(...rows.map(([x])=>x))-.80,Math.min(...rows.map(([,d])=>d))-.87,Math.max(...rows.map(([x])=>x))+.80,Math.max(...rows.map(([,d])=>d))+.94],r,e,h,rows.map(([x,d])=>[x-cx,0,d-cd]));
    }
    for(const key of ['pickles','pickleGlass']){
      const moves=rows.map(([x,d])=>[x-cx,0,d-cd]);
      put(key,[cx+.53,cd+.253,.781],[Math.min(...rows.map(([x])=>x))+.44,Math.min(...rows.map(([,d])=>d))-.17,Math.max(...rows.map(([x])=>x))+.746,Math.max(...rows.map(([,d])=>d))+.34],
        3.65,4.65,.105,moves);
    }
  }
  for(const [x,d] of lamps)put('lamp',[x,d,0],[x-.49,d-.48,x+.49,d+.49],9.2,12,2.93);
}
