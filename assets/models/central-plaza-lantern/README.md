# 센트럴시티 조각 광장의 두 갈래 보행등

2022년 7월 보행 거리뷰와 2026년 1월 도로 거리뷰에는 가운데 갈색 구체의 도로 쪽에 어두운 두 갈래 보행등이 보인다. 둥근 받침에서 기둥이 가늘어지고 낮게 휜 팔 양 끝에 금속 살과 버섯 모양 덮개가 있다. 한국조경학회 현장 사진의 우상단에서 살 사이로 배경이 보이는 것도 확인할 수 있다. 높이와 광원 출력은 게임용 추정치다. [한국조경학회 현장연구 그림 2·3](https://www.jkila.org/archive/view_article?pid=jkila-48-5-89) · [2022년 보행 거리뷰](https://map.naver.com/p?c=18.00,0,0,0,adh&p=nuDLz2BbheMIjZ_ZXc2BRg,160,1,28,Float) · [2026년 도로 거리뷰](https://map.naver.com/p?c=18.00,0,0,0,adh&p=FmNf2XmJtk1RjDP3k0TI7A,160,1,24,Float)

lantern.blend의 CentralCityTwinLantern 컬렉션에서 기단, 주물 팔, 세로살, 겹처마, 확산판을 편집할 수 있다. 아래 명령은 금속 부분을 하나의 근거리 GLB로 내보내고 두 확산판의 실제 위치와 지름을 게임에 반영한다. 도시 장면의 발광 재질은 기존 서울 일조 시간표를 따른다.

```sh
blender -b -t 4 assets/models/central-plaza-lantern/lantern.blend --python-exit-code 1 -P assets/models/central-plaza-lantern/build.py -- --export-current
```

게임은 먼저 기둥과 양쪽 등갓의 윤곽을 그린다. 27m 안에서 보고 있을 때만 금속 세부 모델을 요청한다. 야간에는 처마 밑 확산판이 켜지고 보행등 바로 옆 판석과 조형물이 빛을 받는다. [정면·사선 낮밤 비교](comparison.jpg) · [일반 보행 시점](camera.json)
