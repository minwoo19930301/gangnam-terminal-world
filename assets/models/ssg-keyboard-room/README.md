# 신세계 강남점 스누피 플레이스

10층 스누피 플레이스의 굿즈 매장이다. 신세계가 2024년 10월 공개한 개점 사진에서 빨간 개집, 지붕 끝에 걸친 스누피의 발, 파란 진열대를 확인했다. 층별 안내의 매장명은 ‘스누피 플레이스’다. 같은 층 야마하 구획은 게임의 에스컬레이터와 겹쳐 진열 가능한 면적이 0㎡여서 이 매장을 선택했다. [신세계 강남점 층별 안내](https://www.shinsegae.com/store/floor.do?storeCd=SC00002) · [신세계 개점 기사](https://www.shinsegaegroupnewsroom.com/shinsegae-baek-gangnam-store-snoopy/) · [강남점 개집 정면 사진](https://images.shinsegaegroupnewsroom.com/wp-content/uploads/2025/08/shinsegae-baek-gangnam-store-snoopy_2.png)

개집 측면 사진에서 지붕의 판재와 검은 나뭇결 선, 아래로 늘어진 귀, 위로 든 코와 발, 머리맡의 우드스탁을 따왔다. 굿즈 벽과 계단형 진열대에는 방문 사진에 보이는 머플러·패딩 인형, 머그, 가방, 문구를 배치했다. 사진을 찍는 조형물과 판매용 인형은 크기와 자세가 다르다. 치수, 상품 수량과 진열 간격은 게임에 맞춘 근사치다. 오로라 카탈로그는 봉제 인형의 코와 귀 형태를 참고하는 데 썼으며 강남점 판매 품번은 확인되지 않았다. [강남점 굿즈 벽·인형·개집 측면 근접 사진](https://blade90.tistory.com/1589) · [피너츠 캐릭터 자료](https://www.peanuts.com/about/snoopy) · [오로라 봉제 인형](https://auroragift.com/products/floppy-snoopy)

## 원본과 배치

편집 원본은 `snoopy-place.blend`의 `SSG_10F_SnoopyPlace` 컬렉션이다. 메시 오브젝트 957개와 내장 원단·타일 텍스처를 포함한다. 단위는 미터이며 원점은 개집과 파란 진열대 사이 바닥이다. Blender +X는 파란 진열대 쪽, +Y는 굿즈 벽 쪽, +Z는 위다. glTF Y-up 변환 후 게임 월드 원점 (−35.226383, 45.4, 32.158255)에 놓고 월드 +Y축으로 −159.216967° 회전한다. 전체 지형을 켠 게임에서는 공용 지형 높이를 더한다.

[일반 게임 카메라](../../../?pos=-36.414842,45.4,28.491354&yaw=-159.21697&pitch=-6#/shinsegae/10F) · [실제 게임 화면](normal-play.jpg) · [카메라와 컬렉션 정보](camera.json)

방문 사진에 나란히 보이는 살구색·아이보리색 집 모양 진열함에 둥근 문과 안쪽 테두리를 넣었다. 두 인형은 각자 편집할 수 있다. 목도리의 뜨개 코와 술, 검은 귀와 발가락 자수, 패딩의 볼록한 누빔과 소매 바인딩을 모델링했다. 짧은 털과 나일론의 미세한 결에는 별도로 제작한 색·법선·거칠기 맵을 썼다. [일반 보행 시점의 진열함](winter-niches.jpg) · [Blender 근접 렌더](native-plush.jpg)

입구 사진에서 왼쪽을 보는 흑백 얼굴과 SNOOPYPLACE 글자를 읽어 타일 격자에 다시 그렸다. Blender에서 75×44개 타일의 표면 재질을 각각 바꿀 수 있다. 내보낼 때 타일 윗면의 재질을 읽어 그림과 줄눈을 하나의 면에 굽는다. 한 칸을 검정 유약으로 바꿔 내보낸 시험에서 해당 셀의 텍스처 색과 사각 면 한 개 출력을 확인했다. 무늬와 테두리 비율은 사진을 따른 근사치다. [입구의 일반 게임 화면](entrance-floor.jpg)

게임 파일은 883,984바이트, 삼각형 71,983개, 재질 2개로 진열 전체를 두 번에 그린다. 작은 인형은 출력할 때 원본 꼭짓점의 색과 위치에서 더 성긴 곡면을 만든다. 11m 안에서 진열이 시야에 들어오면 모델을 요청하고 22m 밖에서는 숨긴다. 같은 층의 원거리, 다른 층, 천장을 올려다본 시점은 요청 0회였다. 매장을 보고 1.05m 걸은 뒤 고개를 돌렸다가 돌아와도 최초 요청 1회가 유지됐다.

## 재생성

저장소 루트에서 실행한다. Blender 3.6.23과 내장 서체 Bfont를 사용했다.

```sh
D=assets/models/ssg-keyboard-room
"${GTW_BLENDER_BIN:-blender}" -b --factory-startup --gpu-backend opengl --python-exit-code 1 -P "$D/build.py"
node "$D/pack.mjs"
node tests/smoke.mjs shinsegae
node tests/smoke.mjs gotomall centralcity shinsegae
```

원본을 직접 고쳤을 때는 생성 단계 대신 다음 명령을 쓴다. 3,300개 타일의 색은 각 타일 윗면에 지정한 Blender 재질의 뷰포트 색을 사용한다.

```sh
"${GTW_BLENDER_BIN:-blender}" -b --gpu-backend opengl "$D/snoopy-place.blend" --python-exit-code 1 -P "$D/export.py"
node "$D/pack.mjs"
```
