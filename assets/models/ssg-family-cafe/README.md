# 신세계 강남점 카테고릭

11층 전문식당가 카테고릭의 브루잉 바를 고객석에서 바라본 모습이다. 모서리에서 두 번 꺾이는 원목 상판, 검은 조명 네 개, 가운데 은색 원통, 동색 지주 위 유리병 두 개와 다섯 잔용 브루어를 매장 사진에 맞춰 배치했다. [11층 공식 층별 안내](https://www.shinsegae.com/store/floor.do?storeCd=SC00002) · [2026년 11월 신세계 강남점 사진](https://www.shinsegaegroupnewsroom.com/categoric-ranks-13th-among-asias-top-cafes/)

흰 머그와 검은 테이크아웃 컵은 강남점 개점 사진을 참고했다. 브루어의 열린 프레임과 드리퍼 간격은 제조사의 PS1 자료를 참고했다. 모델 세부 형식, 매장 치수, 간판 높이는 추정했다. 티라미수는 공식 메뉴이며, 석기 접시에 한 사람 몫을 담은 모양과 상판 위 서빙 위치는 게임용 연출이다. [컵 사진](https://www.shinsegaegroupnewsroom.com/enjoy-special-tea-brewing-coffee-at-shinsegae-department-stores-gangnam-branch/) · [매장 전경과 메뉴](https://www.shinsegaegroupnewsroom.com/shinsegae-department-store-launches-new-cafe-brand-categoric/) · [Poursteady PS1 제품 사진과 규격](https://poursteady.com/automated-pourover-coffee-machines/ps1/)

[일반 게임 화면](game.jpg) · [컵과 디저트 근접 화면](service.jpg) · [게임 카메라](../../../?pos=-36.57004935348692,50.2,82.42240413958811&yaw=103.67866211014467&pitch=1#/shinsegae/11F)

## 원본과 배치

`categorique.blend`의 `SSG_11F_Categorique` 컬렉션에 편집 가능한 메시 380개와 파일에 포함한 나뭇결 이미지 한 장이 있다. 바닥 중앙이 원점이며 단위는 미터다. Blender +Y는 바 안쪽, +Z는 위다. glTF Y-up 변환 후 월드 +Y축을 중심으로 110.779277° 회전한다. 월드 원점 (x, y, z)는 (−39.399627, 50.2, 83.111043), 지형을 적용한 높이는 49.292m다.

배포 GLB는 422,440바이트, 삼각형 50,271개, 상세 드로콜 6회다. 원거리용 집기는 1회로 병합한다. 9층 라마르조코와 11층 S GARDEN에서 카테고릭 GLB 요청은 0건, 카테고릭 바 앞에서는 1건이었다. 대표 카메라의 HUD는 ‘카테고릭 (카페) · 11F’다.

## 재생성

저장소 루트에서 실행한다. Blender 3.6.23 및 macOS 시스템 글꼴 Georgia로 검증했다. Georgia가 없는 환경에서는 Blender 내장 글꼴을 사용한다.

```sh
D=assets/models/ssg-family-cafe
node "$D/grain.mjs"
"${GTW_BLENDER_BIN:-blender}" -b --factory-startup --gpu-backend opengl --python-exit-code 1 -P "$D/build.py"
node "$D/pack.mjs"
node tests/smoke.mjs shinsegae
node tests/smoke.mjs shinsegae gotomall
```
