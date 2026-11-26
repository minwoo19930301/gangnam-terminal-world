# 밴루엔 아이스크림 · 신세계 강남점

11월 25일자 스위트 파크 안내도의 밴루엔 셀과 기존 고객 도착점을 그대로 사용한다. 신세계가 2026년 7월 24일 공개한 두 지점 사진에서 통로 쪽 목재 액자 입면과 검은 간판, 매대 위 민트색 로고 패널, 파스텔 아이스크림 컵·파인트·쇼핑백, 작은 밀크셰이크 세 종류와 뒤편 주문판을 확인했다. 포장 원고에는 브랜드가 공개한 글자 로고를 사용했다. 사진에 가려진 뒤쪽 작업실과 개별 가격은 모델에 넣지 않았다. 외곽 면적은 안내도, 높이와 상품 진열 간격은 사진 비례에 따른 근사치다.

- [신세계 강남점 현장 사진 2장 및 판매 상품](https://www.shinsegaegroupnewsroom.com/van-leeuwen-ice-cream-shinsegae-gangnam-first/)
- [Van Leeuwen 공식 로고 원본](https://vanleeuwenicecream.com/wp-content/uploads/2021/02/vanleeuwen-logo.png)

편집 원본은 `display.blend`의 `VanLeeuwen` 컬렉션이다. 작업대·포장 종이·뚜껑·스쿱·패널을 개별 오브젝트로 편집할 수 있다. 원본을 처음부터 재생성할 때는 `blender -b -t 4 -P build.py`, 기존 원본의 편집을 게임에 배포할 때는 `blender -b -t 4 display.blend -P export.py`를 이 폴더에서 실행한다. 브라우저가 불러오는 모델은 112,544바이트, 9,104삼각형, 한 번의 드로다. 통로 전방 12m 안에서 세부 모델을 요청한다.

실제 게임 도착 주소는 `camera.json`에 있다. 기본 지도 도착점에서 촬영한 같은 시점의 낮·밤과 가까운 상품 시점은 [비교 사진](comparison.jpg)에 담았다.
