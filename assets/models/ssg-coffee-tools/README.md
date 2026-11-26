# 신세계 강남점 9층 유라

[일반 게임에서 유라 매장으로 이동](http://127.0.0.1:8765/?pos=-43.53863,40.6,63.51359&yaw=135.9667&pitch=-15#/shinsegae/9F) · [같은 시점의 게임 화면](game.jpg) · [카메라와 원본 정보](camera.json)

강남점 9층 가전 매장의 전자동 커피 체험 바를 만들었다. 2025년 6월 리뉴얼 사진에서 밝은 나뭇결, 짙은 상판 아래 조명, 삼각형 상감 표식, 다리처럼 뚫린 바, 아치형 찻잔장과 황동 받침 의자를 확인했다. 사진의 두 진열대를 게임 매장 폭에 맞춰 하나의 바로 재구성했다. 진열 간격, 목재 수종과 색상, 잔과 원두 봉투의 배치는 추정이다. [신세계 강남점 층별 안내](https://www.shinsegae.com/store/floor.do?storeCd=SC00002) · [유라 국내 유통사 개점 기록 및 현장 사진](https://blog.alacartemall.com/jura-shinsegae-gangnam-renewal-open-event/)

개점 기록에 전시 기종으로 명시된 ENA 8과 GIGA 10을 각각 두 대 배치했다. ENA 8에는 오른쪽의 다면체 원통 물통, 작은 화면과 단잔 추출구를, GIGA 10에는 원두통 두 개, 넓은 화면과 금속 듀얼 추출구를 모델링했다. 본체 색상 조합과 조작 화면은 전시용 재현이다. [ENA 8 제조사 사진](https://de.jura.com/-/media/germany/pdf/pressemitteilungen/2019/JURA_Pressemitteilung_ENA_8_de.pdf?la=de) · [ENA 8 사양](https://us.jura.com/en/homeproducts/machines/ena-8-full-nordic-white-naa-15451) · [GIGA 10 제조사 사진과 사양](https://gr.jura.com/en/homeproducts/machines/giga-10-diamond-black-ea-15478)

## 원본과 배치

편집 원본은 `gallery.blend`, 컬렉션은 `SSG_9F_JURA`이며 개별 메시 297개가 들어 있다. 단위는 미터다. 바 중앙 바닥이 원점이고 Blender +X는 진열대를 마주 본 고객의 오른쪽, +Y는 찻잔장 방향, +Z는 위다. glTF Y-up 변환 뒤 게임 월드 원점은 **(-44.627216, 40.6, 64.808881)**, 월드 +Y축 회전은 **110.966715°**다.

게임용 파일은 396,240바이트, 삼각형 33,828개, 재질별 드로 5개다. 공용 스트리밍 모듈이 간이 바를 드로 하나로 병합하고 가까운 같은 층 시야에서 상세 모델을 요청한다. 7층과 9층 원거리 시점에서는 유라 GLB 요청이 없었고 지정 카메라에서는 한 번 요청됐다. HUD는 ‘유라 · 9F’였다.

## 다시 만들기

저장소 루트에서 실행한다. Blender 3.6.23, 내장 Bfont, macOS 헤드리스 OpenGL로 검증했다. 원본을 직접 편집했다면 첫 명령의 `--factory-startup`을 `"$D/gallery.blend"`로 바꾸고 `build.py` 대신 `export.py`를 실행한다.

```sh
D=assets/models/ssg-coffee-tools
blender -b --factory-startup --gpu-backend opengl --python-exit-code 1 -P "$D/build.py"
node "$D/pack.mjs"
node tests/smoke.mjs shinsegae
```
