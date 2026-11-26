// World x points east and z south. The roadview observations are from public sidewalks and a carriageway.
export const origin=[381.367,-254.883],angle=Math.atan2(.341743,.939793),walk=.15;
export const prefix='고터사거리 · ';
export const parts={
 stone:['둥근 화강석 연석과 보도 포장',12.10,11.18,.19],
 tactile:['황색 점자블록과 유도선',10.1,8.40,.044],
 mast:['갈색 신호주와 기단 링',.43,.43,7.04],
 booms:['두 방향 강관 암과 장력선',12.08,10.78,2.44],
 walker:['세 칸 보행등과 차광판',.37,.47,1.08],
 pixels:['보행 그림의 점광원과 숫자면',.306,.09,.96],
 sound:['음향안내기와 황색 누름단추',.16,.125,.52],
 sinbanpo:['228 신반포로 232 도로명판',1.10,.12,.37],
 jamwon:['34 잠원로 30 도로명판',.94,.12,.33],
 four:['매달린 사색 차량 신호기',1.55,.57,.49],
 lens:['적색 렌즈와 직진·좌회전 렌즈',1.41,.10,.32],
 bollard:['흰 반사띠 두 줄의 검은 볼라드',.14,.14,.86],
};
export function toWorld(x,d){const c=Math.cos(angle),s=Math.sin(angle);return [origin[0]+c*x+s*d,origin[1]-s*x+c*d];}
export const rows=[];
function at(key,x,d,y,yaw=0){rows.push({key,x,d,y,yaw});}
at('stone',4.65,4.95,-.135);at('tactile',.82,1.32,.014);
at('mast',0,0,0);at('booms',-5.71,-5.10,4.61);
for(const [x,d,rot] of [[-.222,.04,Math.PI/2],[-.04,-.224,0]]){
  at('walker',x,d,2.49,rot);
  at('pixels',x-Math.sin(rot)*.119,d-Math.cos(rot)*.119,2.545,rot);
}
at('sound',-.106,.17,.82,2.46);
at('sinbanpo',-.19,-.53,3.75,Math.PI/2);
at('jamwon',-.57,.05,4.07,Math.PI);
for(const t of [4.29,7.23,10.67]){
  at('four',-t,.012,5.99,0);at('lens',-t,-.108,6.059,0);
}
for(const t of [3.05,8.08]){
  at('four',.012,-t,6.04,Math.PI/2);at('lens',-.108,-t,6.109,Math.PI/2);
}
for(const [x,d] of [[.32,1.26],[2.14,.84],[4.11,.44],[6.15,.45],[8.17,.45],[-.51,4.11],[-.45,6.22],[-.36,8.37],[4.14,5.40],[5.41,4.02]])at('bollard',x,d,0);
// This cap on the photographed corner overlaps the nominal OSM road edge by less than half a metre.
export const apron=[[-.82,.48],[-.72,.015],[-.46,-.205],[-.11,-.273],[.68,-.26],[2.88,-.19],
  [6.14,-.14],[9.52,-.10],[10.18,.005],[10.30,.20],[10.26,.37],[10.01,.61],[8.05,2.57],
  [5.48,4.99],[2.58,7.81],[.59,9.69],[.21,10.06],[-.042,10.32],[-.34,10.22],[-.54,9.86],
  [-.75,7.20],[-.97,4.42],[-1.08,2.90],[-1.0,1.42]];
