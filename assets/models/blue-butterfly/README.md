# 블루버터플라이 · 신세계 강남점 B1

2025년 8월 29일 강남점에서 촬영한 사진에는 코발트색 나비 간판, 흰 스프링롤 그림판, 둥근 투명 덮개를 올린 나무 진열함, 아래 단 검은 포장 접시, 끝의 공이와 과일 그릇이 보인다. 기존 검은 키오스크와 바닥을 유지하고 손님 눈앞의 매대를 새로 만들었다. 브랜드명과 매장 운영은 [신세계그룹](https://www.shinsegaegroupnewsroom.com/premium-deli-section-opened-sinsegae-gangnam/), 진열과 제품은 [아시아타임즈 강남점 현장 사진](https://asiatime.co.kr/article/20250829500337)을 참고했다.

절단면의 채소와 서로 다른 속 색, 쌀피 안으로 비치는 새우와 연어, 파란 상품 카드, 나비 글자판은 게임용으로 그렸다. 매대 너비와 접시 개수는 기존 게임 평면에 맞춘 근사값이다. 가격이나 행사 기간을 적은 메뉴는 넣지 않았다.

원본은 `counter.blend`의 `BlueButterfly` 컬렉션이다. 저장소 루트에서 `blender -b -t 4 assets/models/blue-butterfly/counter.blend -P assets/models/blue-butterfly/export.py`로 편집본을 내보낸다. `build.py`는 기본 진열을 다시 생성한다.

151,752바이트 GLB에 매대·제품과 유리 2개 표면, 삼각형 10,970개가 들어 있다. 상세 모델은 9m 안에서 보일 때 요청하며 12m 밖에서는 외형만 그린다. 정면·상품 앞에서 각 1회, 등 뒤와 13m 거리에서 각각 0회 요청했다. 일반 W 보행으로 매대를 따라 9.8m 왕복해 -6m 층을 유지했다. [낮·밤 같은 위치 게임 비교](comparison.jpg)
