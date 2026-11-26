// Offsets from the adidas Golf frontage in NewCore building 2; Blender and the game consume the same rows.
export const catalog = {
  envelope:['회백색 타일과 벽·트랙등',5.72,8.70,3.45,16],shelf:['접은 니트 진열 선반',3.67,.53,1.78,9],
  bench:['피팅 커튼과 참나무 벤치',2.05,.80,2.58,9],
  foldWine:['접은 버건디 니트',.37,.34,.21,3.8],foldIce:['접은 하늘색 니트',.37,.34,.21,3.8],foldBlack:['접은 검정 니트',.37,.34,.21,3.8],
  fascia:['돌출 삼선 간판',4.91,.15,.46,14],back:['후면 행거와 선반',4.10,.81,2.60,13],
  table:['액세서리 테이블',1.98,.79,1.10,8],puffer:['검정 후드 패딩 KR5437',.74,.31,.86,5.8],
  wine:['버건디 자카드 KH4086',.73,.23,.86,5.6],ice:['아이스블루 자카드 KR5424',.73,.23,.86,5.6],
  black:['블랙 자카드 KR5425',.73,.23,.86,5.6],bow:['리본과 흰 챙의 바이저',.24,.33,.12,3.5],
  navy:['남색 챙과 홀로그램 바이저',.24,.33,.12,3.5],
};
export const rows=[
  {key:'envelope',x:0,d:4.42,h:0},{key:'shelf',x:2.62,d:5.43,h:.024,angle:Math.PI/2},
  {key:'bench',x:-2.42,d:6.26,h:.024,angle:-Math.PI/2},
  ...[.63,1.21].flatMap((h,i)=>['foldWine','foldIce','foldBlack'].map((key,j)=>(
    {key,x:2.55,d:4.38+j*1.06,h,angle:Math.PI/2+(i?.028:-.019)}))),
  {key:'fascia',x:0,d:-.23,h:3.02},{key:'back',x:0,d:8.30,h:.008},{key:'table',x:0,d:3.78,h:.008},
  ...['puffer','wine','ice','black'].map((key,i)=>({key,x:(i-1.5)*.98-.026,d:8.047,h:1.25})),
  {key:'bow',x:-.52,d:3.78,h:1.039,angle:.18},{key:'navy',x:0,d:3.78,h:.953,angle:-.14},
  {key:'bow',x:.52,d:3.78,h:1.039,angle:-1.95},
];
export const prefix='아디다스골프 · ';
