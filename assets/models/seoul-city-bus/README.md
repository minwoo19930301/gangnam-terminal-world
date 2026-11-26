# 신반포로 142번·360번 간선버스

고속터미널 중앙정류소 양쪽에 정차한 두 대를 모델링했다. 창을 통해 좌석, 손잡이, 단말기와 반대편 승강장이 보인다. 가까이 걸어가면 휠의 환기공, 전조등의 프로젝터 렌즈, 두 출입문의 유리, 평행 와이퍼와 미러가 보인다. [진행 전후 게임 화면](play.jpg) · [Blender 스튜디오 렌더](studio.jpg) · [편집 원본](city-bus.blend)

## 차체와 좌석

2026년 1월 네이버 거리뷰에서 파란 간선버스의 긴 흰 지붕 덮개와 창 하단의 가로 광고 면을 확인했다. 차체와 실내의 기준 차종은 현대 일렉시티 일반형이다. 전장 10.995 m, 전폭 2.490 m, 전고 3.400 m, 축간 거리 5.400 m와 전·후륜 윤거 2.080/1.855 m를 기준으로 삼았다. 거울과 작은 장식은 외판보다 돌출된다. 게임에 있던 142번과 360번 노선을 유지했으며 두 실제 차량의 연식·등록 번호는 확인하지 못했다. 달빛무지개분수 그림은 바뀌는 측면 광고에 넣은 자체 제작 도안이다. [현대자동차 모델과 제원](https://www.hyundai.com/kr/ko/c/products/bus/elec-city) · [신반포로 네이버 거리뷰](https://map.naver.com/p?p=lHsXW6lxT97x-yAj0PFdXA,0,0,80,Float) · [서울시 정류소 정보](https://data.seoul.go.kr/dataList/OA-21288/S/1/datasetView.do)

Blender 원본에는 승객석 27개와 운전석, 입석 손잡이, 휠하우스의 빈 아치, 교통카드 단말기, 후면 원형 미등이 있다. 차량을 편집하는 장면과 조명·카메라가 있는 스튜디오 장면을 함께 저장했다. 142번·360번 표시를 각기 다른 컬렉션에서 편집할 수 있다.

게임에서는 좌석 프레임과 색상이 들어가는 두 면을 모든 좌석이 공유한다. 객실 파일은 단일 메시로 내보낸 첫 버전의 약 350 kB에서 공용 객실 106 kB와 좌석 원형 8 kB로 줄었다. 금속·플라스틱 모서리의 원본 베벨은 편집 파일에 유지된다. 보행 시점의 차체는 22,497삼각형이다.

## 시간과 가시 범위

방향을 돌렸을 때 건너편 아파트와 승강장이 차창을 따라 움직인다. 게임 안에서 각 정류소의 낮과 밤을 여섯 방향으로 촬영한 반사 원본을 재사용하며 해가 지면 야간 반사로 넘어간다. 차대 아래의 잔그림자는 실제 차륜에 대한 반구 광선 검사로, 앞쪽 두 하향등의 배광은 Blender Cycles로 구웠다. 두 물체가 보이지 않는 지하에서는 차량 상세 파일 요청이 없었다.

차체는 40 m, 객실은 20 m 안에서 보일 때 상세 모델로 바뀐다. 야간 광원 파일은 낮에 받지 않는다. 정류소 구역을 떠나지 않고 두 대 사이를 오가면 공통 유리·차체·객실·광원 파일을 한 번만 받는다. 네 타이어와 기준면의 Jolt 교차 오차는 최대 0.45 mm, 게임 도로 위 접지 높이 차이는 두 차량에서 최대 약 2.1 mm였다. 이는 게임과 Blender 모델 간의 검증이다.

```sh
blender -b --factory-startup -P assets/models/seoul-city-bus/build.py
node assets/models/seoul-city-bus/check-mesh.mjs
node assets/models/seoul-city-bus/check.mjs
```

주변 건물을 다시 모델링한 뒤에는 게임 서버를 실행하고 반사 원본도 갱신할 수 있다. 두 명령이 생성한 지도를 사용해 Blender 원본을 다시 저장하면 된다.

```sh
node assets/models/seoul-city-bus/record-reflections.mjs http://127.0.0.1:8765 /tmp/seoul-city-bus-reflections
python3 assets/models/seoul-city-bus/reflections.py /tmp/seoul-city-bus-reflections assets/models/seoul-city-bus/reflections.webp
```
