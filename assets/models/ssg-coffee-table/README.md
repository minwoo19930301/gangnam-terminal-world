# 신세계 강남점 9층 몰테니&C

[일반 게임 카메라](http://127.0.0.1:8765/?pos=-69.5,40.6,12.92&yaw=117&pitch=-19#/shinsegae/9F) · [실제 게임 화면](game.jpg) · [카메라 좌표](camera.json)

강남점 층별 안내에 저장된 ‘몰테니’는 9층 홈인테리어 매장이며, 게임 도면의 표기는 ‘몰테니&C’다. 넥서스가 공개한 2025년 11월 개점 자료와 넥서스 제공 현장 사진을 기준으로 크림색 에밀 소파 앞에 흰색·녹색 낮은 탁자를 놓았다. 사진 오른쪽의 가죽 의자 두 개, 왼쪽의 짙은 보조 탁자, 뒤쪽 책장과 러그도 함께 만들었다. [강남점 층별 안내](https://www.shinsegae.com/store/floor.do?storeCd=SC00002) · [넥서스 개점 공지](https://nexus-official.com/news/detail.php?id=67) · [개점 사진과 에밀 전시 설명](https://v.daum.net/v/20251126172247614) · [넥서스 제공 사진 원본](https://t1.daumcdn.net/news/202511/26/newsis/20251126172247362bcrk.jpg)

에밀은 왼쪽으로 굽는 모듈 좌판, 안으로 들어간 받침, 봉제선, 기울어진 등받이를 따로 모델링했다. 낮은 탁자는 사진 속 상판 윤곽과 다리 형태가 닮은 메이리스 제품 자료를 참고했다. 각 상판 아래에 알루미늄 다리와 결합부, 바닥 글라이드가 있다. 사진에서는 탁자 품번과 가죽 의자 모델명을 확인할 수 없다. 가구 간격과 치수는 사진에 맞춘 추정치이며 원단 짜임과 석재 무늬는 직접 생성했다. [에밀 제품](https://www.molteni.it/en/deat/product/emile) · [메이리스 제품](https://www.molteni.it/en/it/product/maylis) · [메이리스 마감·구조 자료](https://molteni.it/en/download/document/cef6953c88d7c8f462fbdef943fc6be68d941e4d)

## 원본 조립과 검증

편집 파일은 `lounge.blend`, 컬렉션은 `SSG_9F_Molteni`다. 독립 메시 132개와 내장 텍스처 3장을 담았다. Blender 단위는 미터, +X는 정면에서 오른쪽, +Y는 책장 방향, +Z는 위다. glTF Y-up 변환 후 월드 Y축 회전은 +110.993302°다. 게임 원점은 (−72.103110, 40.6, 14.342642)이며 지형을 적용한 장면에서 원점 높이는 43.760000m다.

압축 GLB는 542,148바이트, 삼각형 39,836개, 메시·재질 각 5개다. 일반 게임에서 8층과 9층 원거리에서는 이 파일의 요청이 없었고, 매장 카메라에서는 1회 요청됐다. 화면 저장 시 위치 표기는 ‘몰테니&C · 9F’였다.

저장소 루트에서 실행한다. Blender 3.6.23의 헤드리스 OpenGL로 작성·재개방·내보내기를 검증했다. 로고는 Blender 내장 Bfont를 사용한다.

```sh
D=assets/models/ssg-coffee-table
"${GTW_BLENDER_BIN:-blender}" -b --factory-startup --gpu-backend opengl --python-exit-code 1 -P "$D/build.py"
node "$D/pack.mjs"
node tests/smoke.mjs shinsegae
node tests/smoke.mjs shinsegae gotomall
```

원본을 직접 편집한 경우 아래 두 명령으로 게임 파일만 다시 만든다.

```sh
D=assets/models/ssg-coffee-table
"${GTW_BLENDER_BIN:-blender}" -b --gpu-backend opengl "$D/lounge.blend" --python-exit-code 1 -P "$D/export.py"
node "$D/pack.mjs"
```
