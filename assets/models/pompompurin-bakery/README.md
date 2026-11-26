# 폼폼푸린 베이커리 카페

신세계 강남점 스위트 파크에 2026년 7월 28일 문을 연 매장이다. 신세계가 다음 날 공개한 사진에는 노란 벽돌 오븐 앞의 흰 조리복과 조리모, 국자를 든 폼폼푸린, 왼쪽의 둥근 목재 진열장과 오른쪽의 걸린 그림이 보인다. 사진 속 줄무늬 종이 포장, 얼굴 빵, 식빵에 찍은 갈색 그림, 노란 머그를 골라 매대에 놓았다. 포장 그림과 로고판은 직접 그렸다. 진열의 폭과 물품 간격은 한 장의 사진을 바탕으로 게임 부스에 맞췄다. [신세계 개점 기사와 강남점 상품 사진](https://www.shinsegaegroupnewsroom.com/shinsegae-cafe-unveils/) · [현장 사진 원본](https://images.shinsegaegroupnewsroom.com/wp-content/uploads/2026/07/NR_Press_Details_01-76.png)

11월 25일 강남점 B1 안내도의 기존 카페 자리와 북측 방문자 통로를 사용한다. 지도의 ‘폼폼푸린 베이커리 카페’ 도착점에서 3.25m 앞에 오븐과 판매대가 보인다. 게임 주소는 `#/centralcity/B1?p=-79.58155,-6,71.45519,111.33861`이다. [먼 거리·야간 입구·상품 근접의 같은 시점 비교](comparison.jpg)

Blender의 `display.blend`에는 `PompompurinBakery` 컬렉션과 인쇄 원본 이미지가 들어 있다. 상품 형태, 간판, 오븐 벽돌과 라탄 띠를 개별 편집할 수 있다. `print.svg`는 종이가방, 머그와 빵 도장의 벡터 원본이다. 원본 전체를 다시 만들 때는 프로젝트의 Playwright와 Chromium을 설치한 뒤 다음 명령을 사용한다. 이미 편집한 Blender 파일을 게임으로 내보낼 때는 두 번째 명령을 사용한다.

```sh
blender -b -P assets/models/pompompurin-bakery/build.py
blender -b assets/models/pompompurin-bakery/display.blend -P assets/models/pompompurin-bakery/export.py
```

게임은 인쇄 이미지를 포함한 210,252바이트 GLB 하나를 1회 그린다. 근접 버전은 19,146개 삼각형이다. 같은 층에서 매대를 향한 12m 안에서 요청하고, 멀리서 보이는 노란 오븐과 조리모는 로컬 간략형으로 그린다. 실제 게임에서 입구와 상품 앞 각각 1회, 13.5m 앞·반대 방향·신세계 8층에서 각각 0회 요청을 확인했다. 손님 통로에서 매대까지 키보드로 왕복한 거리는 10.2m였고 바닥 높이는 -6m를 유지했다. 센트럴시티와 신세계 smoke, 원본에서 두 번 내보낸 GLB의 SHA-256 일치도 확인했다.
