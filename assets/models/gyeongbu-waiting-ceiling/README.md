# 경부선 1층 대합실 좌석 위 목재 천장

2026년 9월 18일 승객 방문기에 실린 대합실 사진 두 장을 참고했다. 주황색 벤치 위에는 가는 목재 루버가 나란히 이어진다. 줄 사이의 흰 매입등은 서로 다른 지점에서 끊어지고, 사각 환기구가 두드러진다. 식물 기둥 위에서는 일부 루버가 둥글게 꺾여 내려온다. 운영사 층별 안내에서 대합실과 승차홈을 1층으로 확인했다. 사진에 없는 치수와 등기구의 정확한 수량·간격은 기존 게임의 좌석과 기둥 위치에 맞춰 추정했다. [승객이 촬영한 대합실 사진](https://m.blog.naver.com/cami_nante/224414827655) · [운영사 층별 안내](https://exterminal.co.kr/main_floor/main_floor.html)

[같은 좌석 통로의 낮·밤 변경 전후](waiting-lounge.jpg) · [게임에서 대합실 보기](https://minwoo19930301.github.io/gangnam-terminal-world/?pitch=15#/gyeongbu/1F?p=80.140,0,-39.073,-5.299)

Blender 원본에 루버 묶음과 등기구 열, 환기구, 천장 바탕이 개별 메시로 들어 있다. 12.7 × 18 m 좌석 구역에 한 번 배치한다. 1층에서 이 구역을 바라보고 중심에서 24 m 안으로 접근하면 GLB를 불러온다. 29 m 밖에서는 12개 삼각형의 원거리 모델을 표시한다. 근접 모델은 1,856개 삼각형과 한 개의 재질을 사용한다. 흰 확산판에만 발광 마스크가 적용된다.

저장소 루트에서 원본과 게임용 모델을 다시 만들고 확인할 수 있다.

```sh
blender -b -t 2 -P assets/models/gyeongbu-waiting-ceiling/build.py
node assets/models/gyeongbu-waiting-ceiling/pack.mjs
node assets/models/gyeongbu-waiting-ceiling/check.mjs
```
