// Hotel podium frame in metres. +u is east across the block and +v points to the arrival doors.
export const prefix='JW 현관 · ';
export const parts={
  dais:['밝은 원형 단과 그늘진 하단',3.84,3.84,.34,18],
  cords:['얇은 보호줄과 금속 기둥',4.65,4.67,.75,13],
  loops:['겹쳐진 아래쪽 유리 고리',1.28,1.14,.69,13],
  lower:['빛깔이 다른 아래 유리알',.98,1.12,3.48,16],
  middle:['공방 자국이 남은 중단',1,1.12,4.23,18],
  upper:['천장으로 오르는 유리알',1,1.12,3.79,20],
  gallery:['윗층까지 이어지는 유리알',1,1.23,2.81,22],
  crowns:['겹쳐 걸린 윗고리',1.14,1.23,1.21,23],
  screen:['호박빛 목재 병풍',.77,1.73,3.80,16],
  vessel:['검은 유약 화병과 돌 탁자',1.33,1.33,1.35,16],
  branches:['화병에서 갈라지는 가지',2.71,2.71,3.75,13],
  leaves:['겹쳐진 녹색 잎',2.83,2.83,3.85,11],
  golden:['금빛으로 핀 작은 꽃',2.76,2.76,3.81,8.7],
  columnShoe:['둥근 화강암 기둥받침',1.36,1.36,.18,15],
  column:['월넛 무늬목을 이은 원주',1.18,1.18,10.96,19],
  paving:['연마 석회석 바닥',4.37,6.48,.022,16],
  fins:['상부 회랑의 청동 세로살',1.69,.18,1.56,23],
  coats:['후면 카트에 걸린 외투',.68,.55,1.03,6.8],
  trolley:['황동 벨 카트와 회전 바퀴',.91,1.13,1.86,13],
  bags:['손잡이와 이름표를 단 가방',.84,.77,.88,6.6],
  handles:['트롤리 고리와 옷걸이',.72,.81,.32,7.1],
};
export const center={u:-29.7+.95*7.3,v:48.5};
export const rows=[
  ...[['dais',0],['loops',.297],['lower',.66],['middle',4.02],['upper',8.13],['gallery',11.68],['crowns',14.05]].map(([key,y])=>({key,...center,y})),
  {key:'cords',...center,y:0},
  ...[45.2,51.8].map(v=>({key:'screen',u:-29.7+9*.95,v,y:0})),
  ...['vessel','branches','leaves','golden'].map(key=>({key,u:-29.7+.95*.3,v:48.50,y:0})),
  ...[4.2,11].flatMap(u=>[44.6,52.4].flatMap(v=>[['columnShoe',0],['column',.17]].map(([key,y])=>({key,u:-29.7+.95*u,v,y,widthScale:u<5?.92:1})))),
  ...[-29.405,-25.035,-20.665,-16.295].flatMap(u=>[45.25,51.73].map(v=>({key:'paving',u,v,y:.013}))),
  ...[-26.26,-24.57,-22.88,-21.19].flatMap(u=>[{key:'fins',u,v:44.335,y:12.0,angle:Math.PI},{key:'fins',u,v:52.69,y:12.0}]),
  {key:'coats',u:-29.7+23.5*.95,v:54.4,y:.66,angle:.09},
  ...[22.2,23.5].flatMap((u,i)=>[['trolley',0],['bags',.246],['handles',1.48]].map(([key,y])=>({key,u:-29.7+u*.95,v:54.4,y,angle:i?.09:-.045}))),
];
// The hotel photograph shows two long looped necklaces. The lower sections bend back on themselves across the square platform.
const paths=[
  [[-.27,-.36,.58],[-.28,-.40,2.75],[-.28,-.39,5.62],[-.27,-.38,7.33],[-.25,-.33,7.64],[-.15,-.17,7.84],[-.08,.05,7.87],[0,.24,7.68],[.02,.34,7.36],[.02,.34,5.6],[.015,.34,2.81],[.04,.34,.65],[.10,.32,.36],[.28,.26,.255],[.47,.08,.244],[.48,-.16,.241],[.29,-.34,.258],[.04,-.41,.268],[-.18,-.40,.34]],
  [[-.13,-.14,.61],[-.14,-.17,2.90],[-.145,-.17,5.73],[-.14,-.18,7.37],[-.09,-.15,7.70],[.01,-.03,7.93],[.09,.15,7.955],[.15,.34,7.78],[.17,.47,7.40],[.18,.47,5.60],[.18,.47,2.90],[.16,.47,.71],[.17,.47,.43],[.20,.44,.315],[.13,.30,.295],[-.04,.11,.286],[-.30,-.03,.279],[-.44,-.23,.278],[-.33,-.32,.317],[-.19,-.22,.38]],
];
function point(list,i,t){
  const p=[-1,0,1,2].map(j=>list[(i+j+list.length)%list.length]);
  return p[0].map((_,j)=>{const [a,b,c,d]=p.map(v=>v[j]);const m=(c-a)*.28,n=(d-b)*.28;
    return b+t*(m+t*(3*(c-b)-2*m-n+t*(2*(b-c)+m+n)));});
}
const groups={loops:[],lower:[],middle:[],upper:[],gallery:[],crowns:[]};
for(const [strand,path] of paths.entries()){
  const samples=[],distance=[0];
  for(let i=0;i<path.length;i++)for(let k=0;k<28;k++){
    const q=point(path,i,k/28),last=samples.at(-1);
    q[2]+=.14;
    if(q[2]>.76)q[2]=.76+(q[2]-.76)*(15.35-.76)/(7.955-.62);if(last)distance.push(distance.at(-1)+Math.hypot(...q.map((v,j)=>v-last[j])));
    samples.push(q);
  }
  samples.push(samples[0]);distance.push(distance.at(-1)+Math.hypot(...samples.at(-1).map((v,j)=>v-samples.at(-2)[j])));
  function along(d){let i=1;while(i<distance.length-1&&distance[i]<d)i++;
    const a=samples[i-1],b=samples[i],f=(d-distance[i-1])/(distance[i]-distance[i-1]);
    return a.map((v,j)=>v+(b[j]-v)*f);
  }
  const count=strand?258:254,total=distance.at(-1);
  const weights=Array.from({length:count},(_,i)=>.87+.16*Math.sin(i*2.41+strand)+.13*Math.cos(i*.76+strand*.6));
  const sum=weights.reduce((a,b)=>a+b);let progress=0;
  for(let i=0;i<count;i++){
    const span=weights[i]*total/sum;
    const [x,d,h]=along(progress+span/2),a=along(progress+span*.22),b=along(progress+span*.78);
    const key=h<.84?'loops':h<4.11?'lower':h<8.22?'middle':h<11.77?'upper':h<14.14?'gallery':'crowns';
    const base=rows.find(r=>r.key===key).y;
    const direction=b.map((z,j)=>z-a[j]),l=Math.hypot(...direction);
    groups[key].push({x,d,z:h-base,rx:Math.max(.040,span*(.49+.09*Math.cos(i*1.7))),ry:Math.max(.040,span*(.48+.083*Math.sin(i*1.3))),rz:span*.49,
      axis:direction.map(v=>v/l),variant:(i*13+strand*3)%11,roll:(i*2.399+strand)});
    progress+=span;
  }
}
export const beads=groups;
