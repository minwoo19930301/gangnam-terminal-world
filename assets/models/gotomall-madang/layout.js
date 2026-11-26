// Fitted to the G010 bay north of G011 on the zone 1 directory.
export const bay={front:-377.40,mid:-7.385,width:5.53,diningDepth:6.15,registeredArea:53.53};
// The zone 1 plan steps south at the rear of G011. Keep the north wall inside the surveyed mall envelope.
const half=bay.width/2,shoulder=.90,turn=4.20,northDepth=8.22;
const southDepth=2*(bay.registeredArea+shoulder*turn)/(bay.width+shoulder)-northDepth;
export const outline=[[-half,0],[half,0],[half,turn],[half+shoulder,turn],[half+shoulder,southDepth],[-half,northDepth]];
export const parts={
  room:['마당 · 붉은 식당 벽과 사각 천장',0,0,0],
  heart:['마당 · 하얀 하트와 작은 황동 종',2.68,2.87,0],
  front:['마당 · 밝은 전면 명판과 호수',0,0,0],
  menu:['마당 · 벽의 음식 메뉴와 식탁 번호',0,0,0],
  table:['마당 · 불판 식탁과 빨간 방석 의자',0,0,0],
  tools:['마당 · 숟가락·젓가락 통과 포갠 컵',0,0,.759],
  kitchen:['마당 · 조리창과 스테인리스 선반',0,5.22,0],
  cooker:['마당 · 전기밥솥과 보온대',-1.46,4.15,0],
  trolley:['마당 · 스테인리스 배식 수레',.18,3.84,0],
  bibimbap:['마당 · 달걀과 나물을 올린 식사',1.65,1.26,.76],
  plates:['마당 · 배식 수레와 식기의 전',.18,3.84,.824],
};
export const tables=[[-1.74,.86],[-1.72,2.54],[1.63,1.23],[1.67,2.91],[1.67,4.56]];
