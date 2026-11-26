# 경부선 본관 10층 육각고기

서울고속버스터미널 운영사는 10층 식당으로 포석정과 ‘육즙이 흐르는 각고기’를 안내한다. 2026년 봄 방문 사진에는 같은 청색 터미널 간판 아래 두 식당이 나란히 보인다. 육각고기는 벽돌 기둥의 흰 돌출 간판, 검은 접이식 유리문, 아이보리색 처마, 흰 배수관 아래 주황색 감싼 부분으로 구별된다. 이 사진에서 보도 쪽에 보이는 빨간 의자와 파란 보조 의자도 옮겼다. [운영사 층별 안내](https://exterminal.co.kr/main_floor/main_floor.html) · [2026년 방문자의 식당 두 곳과 입면 사진](https://kirinos.tistory.com/2124)

먼저 공개된 정면 사진으로 출입문 앞 붉은 매트, 안쪽 목재 식탁, 원형 불판과 천장에서 내려온 구릿빛 배기 후드를 확인했다. 게임에서는 원래 포석정에 붙어 있던 옥상 테라스 끝에 이웃 점포를 배치했다. 점포 경계와 폭, 실내 깊이, 테이블 수와 소품 배치는 두 사진을 기존 게임 구조에 맞춘 근사값이다. [2023년 방문자가 촬영한 정면 입구·식탁](https://oritable.tistory.com/24) · [2025년 7월 방문기](https://www.skyedaily.co.kr/news/news_view.html?ID=278077)

지도에서 ‘육각고기’를 선택해 매트로 직진하면 실내로 들어간다. 야간에는 가게 안과 돌출 간판에 빛이 남고 기존 옥상 정원의 밤하늘이 보인다. [테라스에서 본 정면](../../../index.html#/gyeongbu/10F?p=85.21599,43,1.82098,107.37188,3) · [포석정 쪽에서 본 두 가게](../../../index.html#/gyeongbu/10F?p=84.74680,43,6.69554,51.76926,3) · [낮·밤 게임 비교](comparison.jpg) · [Blender 렌더](native.jpg)

[편집 원본](shop.blend)의 컬렉션은 `GB_YukgakRooftopRestaurant`이고 게임 그룹은 `경부선 육각고기 · 공개 식당 입구`다. 경부선 로컬 좌표 `W(50.70,86.32)`, 모델 기준 높이 43m, 회전 `ROT + π/2`로 둔다. 독립 미리보기용 조명과 카메라는 컬렉션 밖에 있다. 낮은 비용으로 표시하도록 근거리 모델을 재질 하나로 내보냈다. 가까운 같은 층에서 가게가 화면에 들어와야 상세 파일을 읽는다.

```sh
blender -b --factory-startup -t 4 --python-exit-code 1 -P assets/models/gyeongbu-yukgak/build.py
blender -b --factory-startup assets/models/gyeongbu-yukgak/shop.blend -t 4 --python-exit-code 1 -P assets/models/gyeongbu-yukgak/export.py
node assets/models/gyeongbu-yukgak/check.mjs
node assets/models/gyeongbu-rooftop/check.mjs
```
