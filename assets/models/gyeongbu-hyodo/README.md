# 경부선 부속상가 1층 효도치킨

서울고속버스터미널 운영사의 부속상가 1층 안내에 효도치킨이 58번으로 실려 있다. 지점 방문자가 2024년 11월 25일 게시한 사진에는 다이소 옆에서 보이는 유리문과 검은 처마, 빛나는 효도치킨 글자, 초록 테두리의 둥근 돌출 간판이 함께 나온다. 이 사진에서 보이는 작은 진열장과 창문 글씨, 벽돌 위에 비치는 간접등을 게임 속 기존 효도치킨 자리에 맞췄다. [터미널 공식 부속상가 1층 안내](https://exterminal.co.kr/include/floor_sub.asp?floornum=sf1) · [방문자가 촬영한 지점 입구와 홀](https://freedom-8282.tistory.com/entry/반포-고속버스터미널-고터-치맥-맛집-추천-효도치킨-강남고속버스터미널점)

식당 안에는 사진에서 확인되는 목재 테이블, 검은 금속 의자, 주문 태블릿, 반점 바닥, 천장 트랙과 프로젝터를 배치했다. 탁자의 수, 입구 너비, 처마 깊이, 벽돌 크기는 기존 게임의 점포와 옆 계단 사이에 맞춘 근사값이다. 메뉴 화면은 직접 그린 음식 형태로 구성했다.

지도에서 ‘효도치킨’을 선택하면 가게 앞 처마 아래에 서서 간판과 유리문을 바라본다. 기존 도착점은 옆 다이소 계단 칸막이에 걸려 세 방향이 같은 어두운 면으로 보였다. 식당 안쪽과 분리된 원래 계단은 옆의 GATE 3 현관에서 그대로 내려갈 수 있다. [낮·밤과 지도 도착 비교](comparison.jpg) · [Blender 렌더](native.jpg)

편집 파일은 [shop.blend](shop.blend), 컬렉션 이름은 `GB_HyodoDiningFront`, 게임 그룹 이름은 `경부선 효도치킨 · 유리 입구와 식당`이다. 게임 좌표 `(260.92494, 0, -157.05084)`에 기존 동의 회전 `ROT + π`로 붙이고 지형 높이는 한 번 적용한다. 독립 카메라와 미리보기 조명은 이 컬렉션 밖에 있다.

```sh
blender -b --factory-startup assets/models/gyeongbu-hyodo/shop.blend -t 4 --python-exit-code 1 -P assets/models/gyeongbu-hyodo/export.py
node assets/models/gyeongbu-hyodo/check.mjs
node assets/models/gyeongbu-hyodo/check.mjs --mobile
node assets/models/gyeongbu-hyodo/check.mjs --webkit
```

같은 보도에서 낮과 밤을 바꿔 볼 수 있다. [보도에서 본 간판과 유리문](../../../index.html#/street?p=259.46828,0,-162.57362,-161.684,4) · [안쪽 홀에서 본 출입문](../../../index.html#/gyeongbu/1F?p=263.370428,0,-152.10704,169.08837,8)

상세 모델은 236,828바이트다. 보도 정면에서는 한 번 요청했고, 같은 자리에서 뒤를 보거나 옆 계단과 위층으로 직접 입장했을 때는 요청이 없었다. 데스크톱 Chromium과 모바일 화면을 재현한 Chromium·WebKit에서 지도로 들어가 5.88~6.02m를 걸은 다음 같은 출입문으로 돌아왔다. 별도 지도 항목인 GATE 3에서는 계단을 약 2m 내려갔다. WebKit의 길게 누르기는 게임의 화면 조이스틱에 DOM 이벤트를 보내 검사했다.
