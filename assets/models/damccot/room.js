import {boxSilhouette} from '../interior-architecture/box-silhouette.js';
import {placeSingleDetail} from '../interior-architecture/single-detail.js';

let models;
function simpleModels(T) {
  if(models)return models;
  const shelves=[[0,.10,.17,3.06,2.72,.05,0xdedbd1]];
  for(const y of [.32,.84,1.35,1.87,2.39,2.82])
    shelves.push([0,y,-.018,3.11,.038,.42,0x947155]);
  for(const x of [-1.55,-.936,-.312,.312,.936,1.55])
    shelves.push([x,.08,0,.033,2.77,.40,0x795d46]);
  shelves.push([1.15,.355,-.01,.70,.18,.29,0xc0948a]);
  const room=[[-2.21,.035,1.73,1.55,.86,2.17,0x51483e],[-2.21,.896,1.73,1.66,.064,2.27,0xf2f1e7],
    [.84,1.008,3.02,4.97,.059,.47,0x997253],[.84,.04,3.21,4.97,.99,.07,0x554b43]];
  for(const [x,d] of [[-.035,1.21],[1.48,2.17]]){
    room.push([x,.711,d,.81,.047,.81,0x9e7757]);
    for(const sd of [-.612,.612]){
      room.push([x,.43,d+sd,.37,.05,.37,0x383734],
                [x,.47,d+sd+Math.sign(sd)*.14,.31,.33,.05,0x383734]);
    }
  }
  const meal=[[-.068,.015,.018,.235,.122,.223,0xe7dfcc],[-.068,.144,.018,.206,.077,.194,0x70483e],
    [.141,.020,-.099,.185,.027,.150,0xc9996b],[.131,.022,.13,.078,.05,.072,0x9ca99c]];
  models={cabinet:boxSilhouette(T,shelves),room:boxSilhouette(T,room),meal:boxSilhouette(T,meal),
    paint:new T.MeshLambertMaterial({vertexColors:true})};
  return models;
}

export function damccotRoom(K,{P,RECT,lbox,lwall,lsign,lzone},{s0,s1,t0,t1,y,level}){
  const w=t1-t0,depth=s1-s0,mid=(t0+t1)/2,poly=RECT(s0,t0,s1,t1);
  const position=(x,d)=>P(s1-d,mid-x);
  const [fx,fz]=position(0,0),[bx,bz]=position(0,1);
  const angle=Math.atan2(bx-fx,bz-fz);
  for(const t of [t0,t1]) lwall(s0,t,s1,t,y,y+3.35,{mat:0x494743,thick:.11});
  lwall(s0,t0,s0,t1,y,y+3.35,{mat:0x55514a,thick:.11,
    openings:[{at:2.52,w:4.86,y0:y+1.08,y1:y+2.83}]});
  lwall(s0,t0+.09,s0,t0+4.95,y+1.08,y+2.83,{mat:'glass',thick:.020,solid:false});
  K.hpoly({tex:'tile',color:0x747571},poly,y+.024,true);
  K.hpoly(0x282827,poly,y+3.20,false);
  // The two narrow glazed ends frame the broad entrance from the garden gallery.
  for(const [a,b] of [[t0+.02,t0+.98],[t1-1.07,t1-.02]]){
    lwall(s1,a,s1,b,y,y+2.64,{mat:'glass',thick:.025});
    for(const t of [a,b])lbox(s1,t,.079,.055,y,2.65,0x333432,{solid:false});
  }
  lbox(s1,mid,.16,w,y+2.65,.48,0x403b35,{solid:false});
  for(let t=t0+.05;t<t1-.03;t+=.13)lbox(s1+.085,t,.032,.045,y+2.68,.42,0x987656,{solid:false});
  lbox(s1+.114,mid,.045,3.15,y+2.67,.44,0x353532,{solid:false});
  lsign(['담장옆에국화꽃','C C O T'],s1+.143,mid,y+2.89,2.64,.398,'S',
    {fg:'#fff7df',bg:null,pxPerM:180});
  lzone(s0,t0,s1,t1,{name:'담꽃',place:'famille',floor:level,sub:'담장옆에국화꽃 · 파미에 204호',y0:y,y1:y+3.5,priority:12});
  const contact=(x,d,sx,sd,h)=>lbox(s1-d,mid-x,sd,sx,y,h,0,{skip:['top','bottom','n','s','e','w']});
  contact(3.12,1.68,.43,3.12,2.83);
  contact(-2.21,1.73,1.55,2.17,.96);
  for(const [x,d] of [[-.035,1.21],[1.48,2.17]]){
    contact(x,d,.62,.62,.76);
    for(const side of [-1,1])contact(x,d+side*.612,.34,.35,.68);
  }
  const withinFront=(cx,cy,cz)=>{
    if(cy<y-.25 || cy>y+3.5)return false;
    const dx=cx-fx,dz=cz-fz,d=dx*Math.sin(angle)+dz*Math.cos(angle),x=dx*Math.cos(angle)-dz*Math.sin(angle);
    if(d<.12 || (d<depth+.06 && Math.abs(x)<w/2+.06))return true;
    // The photographed rear windows look into the adjoining indoor gallery.
    // A shopper on that side can see both the display and the seating.
    const beyond=d-depth, spread=Math.min(1.75,.22*Math.max(0,beyond));
    return beyond>=0 && beyond<10 && cy>y+1.02 && cy<y+2.91 &&
      x> -1.64-spread && x<3.34+spread;
  };
  K.detail({name:'담꽃',floor:level,poly,y0:y,y1:y+3.5,visibleFrom:withinFront},()=>{
    const f=simpleModels(K.THREE);
    function place(name,file,shape,x,d,h,rotation,range,exitRange,eyeHeight){
      const [px,pz]=position(x,d);
      placeSingleDetail(K,{name,file:'../damccot/'+file+'.glb',at:[px,y+h,pz],angle:rotation,
        fallback:shape,fallbackMaterial:f.paint,material:f.paint,range,exitRange,eyeHeight,floorTolerance:2.40});
    }
    place('담꽃 · 다기와 보자기 진열장','tea-cabinet',f.cabinet,3.12,1.68,0,angle+Math.PI/2,10,13,1.4);
    place('담꽃 · 백색 주문대와 검은 의자','furniture',f.room,0,0,0,angle,15,18,1.45);
    place('담꽃 · 밤대추팥빙수 한 상','bingsu',f.meal,-.035,1.21,.759,angle,6.0,8.0,.25);
    lsign(['담꽃','블렌딩차'],s1-2.546,mid+1.68,y+1.246,.255,.159,'S',
      {fg:'#574a3c',bg:null,pxPerM:380});
  });
}
