import {displayCase} from '../gyeongbu/display-case.js';
import {seoulClock} from '../../../js/daylight.js';
import {makeCanvas,FONT} from '../../../js/textures.js';

const placeCase=displayCase({
  url:new URL('./ticket-counter.glb',import.meta.url),
  name:'경부선 · 통합매표소',bodyName:'TicketOffice',lightName:'Lit',
  width:9.62,height:3.26,depth:.18,baseColor:0x666c70,enter:14,leave:20,
  visibleBounds:[[-5.1,0,-.35],[5.1,5.6,1.57]],
});

// The published photograph identifies the window and the boards. These rows are exhibit data.
const sampleTables=[
  {slot:2,title:'경부선',rows:[['09:15','세종','13'],['09:20','대전','11'],['09:20','천안','14'],['09:20','공주','16'],['09:21','아산','16']]},
  {slot:3,title:'경부선',rows:[['09:25','부산','1'],['09:35','동대구','7'],['09:40','창원','4'],['09:45','울산','6'],['09:50','진주','5']]},
  {slot:5,title:'영동선',rows:[['09:30','강릉','23'],['09:30','원주','25'],['09:40','속초','24'],['10:00','강릉','23'],['10:10','원주','25']]},
  {slot:6,title:'탑승 안내',rows:[['01','승차권 확인',''],['02','출발 시각 확인',''],['03','승차홈 확인',''],['04','대합실에서 대기',''],['05','승차권 제시','']]},
];

function type(ctx,text,x,y,size,fg,weight=600,align='left'){
  ctx.font=weight+' '+size+'px '+FONT;ctx.textAlign=align;
  ctx.textBaseline='middle';ctx.fillStyle=fg;ctx.fillText(text,x,y);
}

function faces(T,canvas,quads){
  const positions=[],uv=[],indices=[];
  for(const {x,z,y,w,h,s,t,uw,vh} of quads){
    const start=positions.length/3;
    for(const [dx,dy,du,dv] of [[-.5,-.5,0,0],[.5,-.5,1,0],[.5,.5,1,1],[-.5,.5,0,1]]){
      positions.push(x+dx*w,y+dy*h,z);uv.push(s+du*uw,t+dv*vh);
    }
    indices.push(start,start+1,start+2,start,start+2,start+3);
  }
  const geo=new T.BufferGeometry();
  geo.setAttribute('position',new T.Float32BufferAttribute(positions,3));
  geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geo.setIndex(indices);
  const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;texture.anisotropy=4;
  return new T.Mesh(geo,new T.MeshBasicMaterial({map:texture,toneMapped:false}));
}

function timetable(T){
  const w=448,h=252,c=makeCanvas(w*2,h*2),ctx=c.getContext('2d'),quads=[];
  for(const [i,{slot,title,rows}] of sampleTables.entries()){
    const col=i%2,row=Math.floor(i/2),guide=slot===6;
    ctx.save();ctx.translate(col*w,row*h);
    ctx.fillStyle='#163752';ctx.fillRect(0,0,w,h);
    ctx.fillStyle='#18304b';ctx.fillRect(0,0,w,50);
    type(ctx,title,17,25,26,'#ffdf78',700);
    type(ctx,guide?'이용 순서':'출발 안내 · 예시',w-15,25,17,'#eaf4fc',650,'right');
    ctx.fillStyle='#dcc75e';ctx.fillRect(0,50,w,32);
    type(ctx,guide?'순서':'출발 시각',18,66,17,'#293747',700);
    type(ctx,guide?'내용':'도착지',145,66,17,'#293747',700);
    if(!guide)type(ctx,'승차홈',w-18,66,17,'#293747',700,'right');
    for(const [j,[time,dest,bay]] of rows.entries()){
      const y=82+j*34;
      ctx.fillStyle=j%2?'#1f527a':'#28628d';ctx.fillRect(0,y,w,33);
      type(ctx,time,17,y+17,20,'#f5fbff',650);type(ctx,dest,145,y+17,20,'#edf7fb');
      type(ctx,bay,w-19,y+17,20,'#f7eaae',650,'right');
    }
    ctx.restore();
    quads.push({x:(slot-4.5)*.947,y:2.5,z:.355,w:.929,h:.522,s:col*.5,t:(1-row)*.5,uw:.5,vh:.5});
  }
  const mesh=faces(T,c,quads);mesh.name='창구 상단 · 예시 출발표 및 탑승 안내';return mesh;
}

function clocks(T,read){
  const c=makeCanvas(192,64),ctx=c.getContext('2d');
  const mesh=faces(T,c,[-2.75,1.65].map(x=>({x,y:1.831,z:.125,w:.377,h:.131,s:0,t:0,uw:1,vh:1})));
  mesh.name='통합매표소 · 서울 시각';
  function update(){
    const current=read();
    if(mesh.userData.clock===current)return;
    ctx.fillStyle='#101c2c';ctx.fillRect(0,0,c.width,c.height);
    type(ctx,current,96,32,53,'#d4efff',700,'center');
    mesh.userData.clock=current;mesh.material.map.needsUpdate=true;
  }
  update();mesh.onBeforeRender=update;return mesh;
}

function distantFront(T){
  const w=384,h=128,c=makeCanvas(w,h),ctx=c.getContext('2d');
  ctx.fillStyle='#95978e';ctx.fillRect(0,0,w,h);
  ctx.fillStyle='#3a3e40';ctx.fillRect(0,51,w,43);
  ctx.fillStyle='#e5e1d6';ctx.fillRect(0,0,w,27);
  type(ctx,'Ⓣ TICKETS   표 사는 곳',w/2,15,13,'#4e5354',700,'center');
  for(let i=0;i<10;i++){
    ctx.fillStyle=sampleTables.some(item=>item.slot===i)?'#285779':['#706187','#486f83','#837998'][i%3];
    ctx.fillRect(i*w/10,29,w/10-1,20);
  }
  ctx.fillStyle='#e1dac6';ctx.fillRect(0,93,w,1);
  return faces(T,c,[{x:0,y:1.63,z:.094,w:9.60,h:3.26,s:0,t:0,uw:1,vh:1}]);
}

export function placeTicketOffice(K,x,z,angle){
  const stand=placeCase(K,x,z,angle),[body,glass]=stand.children,select=body.onBeforeRender;
  let screens,far;
  body.onBeforeRender=(...args)=>{
    select(...args);
    if(glass.visible && !screens){
      screens=new K.THREE.Group();
      screens.add(timetable(K.THREE),clocks(K.THREE,K.displayClock??(()=>seoulClock(Date.now()))));
      stand.add(screens);screens.updateMatrixWorld(true);
    }
    if(screens)screens.visible=glass.visible;
    if(!glass.visible && !far){
      far=distantFront(K.THREE);far.name='통합매표소 · 원경 상호';stand.add(far);far.updateMatrixWorld(true);
    }
    if(far)far.visible=!glass.visible;
  };
}
