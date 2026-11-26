# 신세계 강남점 신관 9층 TWL

[일반 게임 시점](http://127.0.0.1:8765/?pos=-34.365655264344255,40.6,59.22507672178185&yaw=-131.55067367093923&pitch=-20#/shinsegae/9F) · [게임 화면](game.jpg) · [검증 카메라](camera.json)

신세계 강남점 층별 안내의 저장 항목은 TWL을 9층 테이블웨어로 분류한다. 신세계는 이곳의 크래프트 아뜰리에에서 다기와 아시아 도자기를 소개한다고 설명한다. [강남점 층별 안내](https://www.shinsegae.com/store/floor.do?storeCd=SC00002) · [신세계 생활전문관 소개](https://www.shinsegaegroupnewsroom.com/shinsegae-department-store-gangnam-branch-renovates-high-end-living-specialty-store/)

강남점 개점 사진에서 목재 진열장, 밝은 선반, 검은 다관과 옻칠 받침의 조합을 참고했다. 연둣빛 찻잔은 강남점 날빛 쇼케이스를 참고했다. 다관의 주구와 고리 손잡이, 꽃잎 모양 굽그릇, 황동 거름망의 살과 받침 그릇을 따로 모델링했다. 기물의 치수와 개수, 거름망의 재질과 배치는 추정이다. [TWL 개점 사진](https://twl-shop.com/product/things-we-love-craft-life/7274/) · [날빛 쇼케이스](https://twl-shop.com/product/날빛-쇼케이스/8451/)

## 조립과 검증

편집 원본은 `gallery.blend`, 컬렉션은 `SSG_9F_TWL`이다. 메시 137개와 내장 목재 질감을 담았다. 단위는 미터, 원점은 중앙 진열대 아래 바닥이다. Blender +X는 정면에서 보는 고객의 오른쪽, +Y는 뒤 진열장 방향, +Z는 위다. glTF Y-up 변환 후 월드 +Y축 회전은 −159.219177°다. 게임 평면 좌표의 원점은 (−33.030726, 40.6, 60.408228)이며, 지형 높이를 포함한 THREE 장면의 Y는 39.692다.

게임용 GLB는 메시 5개, 삼각형 62,480개, 436,104바이트다. 간이 진열대와 층별 가시성 제어용 메시를 먼저 등록하고 같은 층 11m 안에서 시야 방향을 확인한 후 GLB를 요청한다. 로딩 실패 후 5초가 지나 조건을 만족하면 다시 시도한다. 감독 렌더러의 카메라에서 TWL 상세 파일 요청 1건과 실제 게임 화면을 확인했다.

저장소 루트에서 실행한다. 확인에 사용한 버전은 Blender 3.6.23이며 아래의 `blender`는 이 버전의 실행 파일을 가리킨다.

```sh
D=assets/models/ssg-twl
blender -b --factory-startup --gpu-backend opengl --python-exit-code 1 -P "$D/build.py"
node "$D/pack.mjs"
node tests/smoke.mjs shinsegae
node tests/smoke.mjs shinsegae gotomall
```

편집한 원본에서 다시 내보낼 때는 첫 Blender 명령을 다음으로 교체한다.

```sh
blender -b --gpu-backend opengl "$D/gallery.blend" --python-exit-code 1 -P "$D/export.py"
```
