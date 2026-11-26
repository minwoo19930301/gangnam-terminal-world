# 신세계 강남점 10층 마이크로 킥보드

[일반 게임에서 전시 보기](http://127.0.0.1:8765/?pos=-72.96725867828303,45.4,35.067675783208614&yaw=107.02896962476049&pitch=-17#/shinsegae/10F) · [게임 화면](game.jpg) · [카메라 좌표](camera.json)

강남점 층별 안내의 10층 아동스포츠 매장이다. 브랜드의 강남점 리뉴얼 사진에서 파란 띠를 두른 흰 원형 전시대, 중앙의 여섯 갈래 데크 전시, 청록색 테두리, 벽걸이 킥보드와 헬멧 선반을 확인했다. 게임에서는 기존 매장 폭에 맞춰 벽면 전시 세 구역을 정면에 모았다. 원형대 위 킥보드 2대, 접힌 견본 3대, 데크 6개, 헬멧 6개는 사진에 보이는 전시의 일부를 옮긴 수량이다. 색 조합과 집기 치수는 근사했다. [강남점 층별 안내](https://www.shinsegae.com/store/floor.do?storeCd=SC00002) · [브랜드 매장 안내](https://microkorea.cafe24.com/deptmall/list.html?board_no=5&page=3) · [강남점 리뉴얼 공지](https://pf.kakao.com/_VGIxdM/113989179) · [강남점 전경 사진](https://k.kakaocdn.net/dn/xXmwO/dJMcahkV88P/omhIK7oIpMeKdoKAxI5mpk/img_l.jpg)

제품 형상은 Mini Micro Deluxe Foldable Aqua의 정면·접은 상태·위쪽 사진을 참고했다. 앞 120 mm와 뒤 80 mm PU 바퀴, 휠 스포크, 발판의 미끄럼 방지 무늬, 뒤 브레이크, 폴딩 힌지와 신축봉 클램프를 모델링했다. 매장 사진만으로 개별 전시품의 세부 모델명이나 헬멧 셸 소재까지 확인하기는 어렵다. [제조사 제원과 제품 사진](https://www.micro-mobility.com/en/products/mini-micro-deluxe-foldable-aqua)

## 원본과 배치

편집 원본은 같은 폴더의 `gallery.blend`, 컬렉션은 `SSG_10F_MicroKickboard`다. 부품 메시 644개이며 원점은 원형대 중앙 바닥이다. 미터 단위로 Blender +X는 헬멧 선반 방향, −Y는 매장 정면, +Z는 위다. glTF Y-up 변환 후 게임 월드 (−74.851978, 45.4, 35.599402)에 배치하고 +Y축으로 111.028970° 회전한다.

GLB는 377,628바이트, 삼각형 59,314개, 재질 3개, 드로콜 3회다. 양면에서 보이는 휠 스포크는 바퀴당 한 벌만 사용하고 작은 볼트와 리브의 모서리 단면을 줄였다. 10층 근접 촬영에서 모델 요청 1건과 매장명 HUD를 확인했다. 층 상세 콜백에서 간이 메시와 상세 메시 슬롯을 등록하며, 공통 로더가 시야와 거리에 따라 상세 메시를 교체한다.

## 재생성

저장소 루트에서 실행한다. Blender 3.6.23에서 검증했고 레터링에는 Blender 내장 서체를 썼다.

```sh
D=assets/models/ssg-microscooter
blender -b --factory-startup --gpu-backend opengl --python-exit-code 1 -P "$D/build.py"
node "$D/pack.mjs"
node tests/smoke.mjs shinsegae
node tests/smoke.mjs gotomall shinsegae
```
