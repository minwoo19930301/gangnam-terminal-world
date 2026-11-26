# 경부선 1층 대합실 식물 기둥

네이버 지도에서 서울고속버스터미널(경부 영동선) 지점 주소가 서울 서초구 신반포로 194, 1층으로 표시되는 것을 확인했다. 운영사의 층별 안내와 프로젝트 현장 사진 목록을 함께 참고했다. 사진 목록 15번은 목재 슬랫 천장, 주황색과 검은색 소파, 식물 기둥을 기록한다. 잎 모양과 색 조합, 화분 테두리와 관수용 식재 틀의 간격은 게임용으로 구성했다. [네이버 지도](https://map.naver.com/p/entry/place/11567199) · [운영사 층별 안내](https://exterminal.co.kr/main_floor/main_floor.html) · [현장 사진 출처 목록](../../../data/research/gyeongbu.json)

기존 소파 옆 기둥 두 곳의 충돌 영역에 맞춰 화분을 만들었다. 편집용 Blender 파일에는 식재 틀과 네 면의 잎 군락이 개별 메시로 들어 있다. 기둥을 따라 꺾어지는 깃 모양 잎, 밝은 잎맥이 있는 늘어진 덩굴, 화분 받침의 세로 골과 접힌 금속 테두리는 근접 시야를 위해 디자인했다. 게임에서는 가까이에서 바라볼 때 공유 GLB를 한 번 받아 기둥당 7,156개 삼각형을 한 번에 그린다. [주간 플레이 화면](hall.jpg) · [잎과 화분 근접 화면](leaves.jpg)

```sh
blender -b -P assets/models/gyeongbu-planted-columns/build.py
node assets/models/gyeongbu-planted-columns/pack.mjs
node assets/models/gyeongbu-planted-columns/check.mjs
```
