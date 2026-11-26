# 어나더팜 아톰 에디션

신세계 강남점 지하 1층 스위트 파크의 어나더팜에서 2026년 11월 20일부터 12월 10일까지 열린 전시 판매를 재현했다. 신세계의 11월 24일 현장 사진에는 검은색·오리지널·흰색과 빨간색의 세 가지 피규어 패키지, 부츠 모양 액세서리, 검은 인쇄 상자와 높이 60cm의 피규어가 보인다. 시작일은 매장 공지를 인용한 팝업 일정, 종료일과 매장은 신세계 발표로 확인했다. [신세계그룹 현장 사진과 상품 설명](https://www.shinsegaegroupnewsroom.com/shinsegae-gangnam-unveils-exclusive-astro-boy-edition/) · [어나더팜 공지를 인용한 행사 일정](https://popply.co.kr/popup/6793)

게임에서는 기존 어나더팜 판매대에 경사진 검은 폼 케이스, 구두와 소책자가 놓인 홈, 선 피규어와 뒤쪽 상자를 추가했다. 상대 크기는 사진에 맞췄고, 진열 방향은 기존 계산대에서 손님이 걸어와 볼 수 있는 면을 택했다. 게임 주소는 `#/centralcity/B1?p=-74.986,-6.000,85.361,-68.661`이다. 왼쪽은 시작 전, 오른쪽은 행사 기간의 같은 시점이다. [게임 보행 시점 비교](comparison.jpg)

Blender에서 `display.blend`의 `AnotherPalmAstro` 컬렉션을 편집한다. 내보낸 GLB는 56,356바이트, 7,728삼각형, 드로 콜 1회다. 행사 기간에 판매대를 바라보며 8m 안에 접근할 때 한 번 내려받는다. 서울 시각 12월 11일 0시에는 이미 열어 둔 화면에서도 전시품이 사라진다. 낮·밤 미리 보기와 행사 날짜는 독립적으로 작동한다.

```sh
blender -b assets/models/another-palm-astro/display.blend --python-exit-code 1 \
  -P assets/models/another-palm-astro/export.py
node tests/another-palm.mjs
```
