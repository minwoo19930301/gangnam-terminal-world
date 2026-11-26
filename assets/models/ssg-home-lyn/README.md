# 신세계 강남점 9층 USM

[일반 게임에서 보기](http://127.0.0.1:8765/?pos=-65.46,40.6,-9.57&yaw=44.5&pitch=-17#/shinsegae/9F) · [게임 화면](game.jpg) · [카메라 좌표](camera.json)

강남점 층별 안내의 9층 홈인테리어 항목과 공식 수입원 스페이스로직의 매장 주소를 대조했다. 기존 USM 매장 안에 할러 수납 가구와 이동식 견본대를 배치했다. [신세계 층별 안내](https://www.shinsegae.com/store/floor.do?storeCd=SC00002) · [스페이스로직 매장 목록](https://spacelogic2017.cafe24.com/company/stores.html)

**진열의 근거**는 2025년 12월 1~14일 강남점 **1층 오픈 스테이지**에서 열린 할러 60주년 전시다. 사진 속 흰색 벤치형 프레임 위에는 폭이 다른 네 장의 직물 패널이 걸려 있고, 오른쪽 카트에는 색상 견본들이 비스듬히 꽂혀 있다. 같은 전시의 빨강·회갈색 수납장도 옆에 놓았다. 기물 사이 거리와 탁상 명패는 9층 게임 매장에 맞춰 정했다. 상설점의 실측 배치와 현재 재고는 확인되지 않았다. 주름 갓 조명은 사진 속 소품으로, 제조사는 미상이다. [전시 기록](https://spacelogic.co.kr/news/detail.html?cate_no=48&display_group=1&product_no=9540) · [벤치·트롤리 사진](https://storage.spacelogic.co.kr/wp-content/uploads/2025/12/2025-12-24_15-38-28_747877.jpg) · [수납장 정면](https://storage.spacelogic.co.kr/wp-content/uploads/2025/12/2025-12-24_15-37-37_404129.jpg) · [측면과 패널 결](https://storage.spacelogic.co.kr/wp-content/uploads/2025/12/2025-12-24_15-37-45_565053.jpg)

패널의 500·750 mm 모듈 간격과 350 mm 높이는 제조사 자료를 따랐다. 패널 모서리, 위아래 검은 손잡이, 강관과 구형 연결구, 바퀴 포크와 허브를 각각 모델링했다. 펠트 섬유와 눌린 세로·사선·곡선 무늬는 자체 제작한 UV 텍스처다. 패널은 고정 상태로 표현했다. [USM 제품 사양과 연결부 확대 사진](https://cms.usm.com/media/yqhnyeof/usm_haller_soft_panel_specifications_en.pdf) · [제조사 카탈로그](https://www.usm.com/en/collections/usm-haller-system/usm-haller-soft-panel)

## 원본과 게임 배치

편집 원본은 `haller.blend`의 `SSG_9F_USM_Haller` 컬렉션이다. 메시 오브젝트 321개와 펠트 이미지 1장을 파일에 담았다. 미터 단위로 Blender +X는 진열대 오른쪽, +Y는 뒤, +Z는 위다. glTF Y-up 변환 후 월드 Y축으로 +20.787248° 회전한다. 월드 원점은 (−66.911920, 43.760000, −11.540237)이며 9층 주소 높이 40.6 m에 지형 높이가 더해진 값이다.

게임용 GLB는 375,108바이트, 삼각형 25,872개, 재질 3개, 드로 호출 3회다. 압축한 패널 텍스처와 meshopt를 사용한다. 공용 매장 로더가 간이 모형을 한 번에 그리고, 같은 층 11 m 안에서 화면에 들어올 때 상세 모델을 요청한다. 7층 및 9층 원거리에서 이 파일의 요청은 각각 0건, 기록한 USM 시점에서는 1건이었다.

## 재생성

저장소 루트에서 실행한다. Blender 3.6.23의 헤드리스 OpenGL 백엔드에서 검증했다. 명패에는 Blender 내장 Bfont를 썼다.

```sh
D=assets/models/ssg-home-lyn
"${GTW_BLENDER_BIN:-blender}" -b --factory-startup --gpu-backend opengl --python-exit-code 1 -P "$D/build.py"
node "$D/pack.mjs"
node tests/smoke.mjs shinsegae
node tests/smoke.mjs shinsegae gotomall
```
