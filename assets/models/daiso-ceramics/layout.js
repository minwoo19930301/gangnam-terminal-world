export const prefix='다이소 도자기 · ';
export const parts={
  rack:['흰 진열대와 가격표 레일',1.30,.55,1.99,10],
  pots:['610mL 도기밥솥과 손잡이',1.22,.44,.44,6.3],
  cartons:['도기밥솥 3,000원 종이상자',.37,.36,.47,4.9],
  lids:['물방울 홈과 투명 밥솥 뚜껑',.96,.43,.46,5],
  storage:['적층 용기와 날짜 표시 뚜껑',1.23,.48,.47,5.7],
  painted:['청색 꽃무늬 찬 그릇',.95,.43,.31,4.8],
  dinner:['플라워 패턴 전시 접시와 받침',1.23,.48,1.82,7.4],
  bowls:['포개 놓은 백자 공기와 찬기',1.22,.49,.42,5.2],
  ticket:['진열 가격 띠지와 코너 표지',1.28,.07,.24,7.5],
};
export const bays=[{u:257.4,v:10.78,sets:[['rack',0,0,0],['pots',.12,-.01,.97],['cartons',.451,-.02,.966],['lids',.1,-.01,.97],['storage',0,0,.345],['painted',-.15,.025,1.504]]},
  {u:253.0,v:10.78,sets:[['rack',0,0,0],['dinner',0,-.022,.203],['bowls',.025,.016,.975],['ticket',0,.221,1.92]]}];
// Facing the main aisle, Blender +X points toward decreasing station-local u.
export const rows=bays.flatMap((b,index)=>b.sets.map(([key,x,d,h])=>({key,bay:index,u:b.u-x,v:b.v-d,y:-4+h})));
