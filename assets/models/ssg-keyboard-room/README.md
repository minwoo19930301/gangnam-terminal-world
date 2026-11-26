# 신세계 강남점 스누피 플레이스

10층 스누피 플레이스의 굿즈 매장이다. 신세계가 2024년 10월 공개한 개점 사진에서 빨간 개집, 지붕 끝에 걸친 스누피의 발, 파란 진열대를 확인했다. 층별 안내의 매장명은 ‘스누피 플레이스’다. 같은 층 야마하 구획은 게임의 에스컬레이터와 겹쳐 진열 가능한 면적이 0㎡여서 이 매장을 선택했다. [신세계 강남점 층별 안내](https://www.shinsegae.com/store/floor.do?storeCd=SC00002) · [신세계 개점 기사](https://www.shinsegaegroupnewsroom.com/shinsegae-baek-gangnam-store-snoopy/) · [강남점 개집 정면 사진](https://images.shinsegaegroupnewsroom.com/wp-content/uploads/2025/08/shinsegae-baek-gangnam-store-snoopy_2.png)

개집 측면 사진에서 지붕의 판재와 검은 나뭇결 선, 아래로 늘어진 귀, 위로 든 코와 발, 머리맡의 우드스탁을 따왔다. 굿즈 벽과 계단형 진열대에는 방문 사진에 보이는 머플러·패딩 인형, 머그, 가방, 문구를 배치했다. 사진을 찍는 조형물과 판매용 인형은 크기와 자세가 다르다. 치수, 상품 수량과 진열 간격은 게임에 맞춘 근사치다. 오로라 카탈로그는 봉제 인형의 코와 귀 형태를 참고하는 데 썼으며 강남점 판매 품번은 확인되지 않았다. [강남점 굿즈 벽·인형·개집 측면 근접 사진](https://blade90.tistory.com/1589) · [피너츠 캐릭터 자료](https://www.peanuts.com/about/snoopy) · [오로라 봉제 인형](https://auroragift.com/products/floppy-snoopy)

## 원본과 배치

편집 원본은 `snoopy-place.blend`의 `SSG_10F_SnoopyPlace` 컬렉션이다. 메시 781개와 내장 모자이크 텍스처를 포함한다. 단위는 미터이며 원점은 개집과 파란 진열대 사이 바닥이다. Blender +X는 파란 진열대 쪽, +Y는 굿즈 벽 쪽, +Z는 위다. glTF Y-up 변환 후 게임 월드 원점 (−35.226383, 45.4, 32.158255)에 놓고 월드 +Y축으로 −159.216967° 회전한다. 전체 지형을 켠 게임에서는 공용 지형 높이를 더한다.

[일반 게임 카메라](../../../?pos=-36.414842,45.4,28.491354&yaw=-159.21697&pitch=-6#/shinsegae/10F) · [실제 게임 화면](normal-play.jpg) · [카메라와 컬렉션 정보](camera.json)

게임 파일은 450,076바이트, 삼각형 54,711개, 재질 2개, 드로콜 2회다. 작은 인형의 둥근 부품을 출력할 때만 성기게 나누고 글자와 곡면의 겹치는 꼭짓점을 줄였다. 타일은 반복 UV를 쓴다. 같은 층 11m 안에서 진열을 볼 때 상세 모델을 요청하고 22m 밖에서는 숨긴다. 촬영 시 매장 앞에서는 GLB 요청 1회, 같은 좌표의 9층과 10층 토박스 앞에서는 각각 0회를 확인했다.

## 재생성

저장소 루트에서 실행한다. Blender 3.6.23과 내장 서체 Bfont를 사용했다.

```sh
D=assets/models/ssg-keyboard-room
"${GTW_BLENDER_BIN:-blender}" -b --factory-startup --gpu-backend opengl --python-exit-code 1 -P "$D/build.py"
node "$D/pack.mjs"
node tests/smoke.mjs shinsegae
node tests/smoke.mjs gotomall centralcity shinsegae
```
