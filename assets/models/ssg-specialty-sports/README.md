# 신세계 강남점 뉴발란스 메가숍

[8층 일반 플레이 카메라](http://127.0.0.1:8765/?pos=-7.60218,35.8,70.06929&yaw=0&pitch=-10#/shinsegae/8F) · [일반 게임 화면](game.jpg) · [카메라와 원본 정보](camera.json)

강남점 8층 베이직스포츠의 공식 등록명은 ‘뉴발란스’이며 게임 HUD에는 ‘뉴발란스 메가숍’으로 표시된다. 2023년 7월 신세계백화점이 제공한 강남점 사진에서 낮은 목재 단상, 높이가 다른 흰 각관 받침과 마네킹 두 대, 파스텔색 반팔 행거, 뒤쪽 신발 선반, 검은 조명 레일과 상부 상호를 확인했다. 이 구성을 게임에서 걸어 들어갈 수 있는 기존 매장 폭에 맞췄다. [신세계 강남점 층별 안내](https://www.shinsegae.com/store/floor.do?storeCd=SC00002) · [사진 설명과 리뉴얼 기사](https://news.dealsitetv.com/articles/100275) · [강남점 매장 사진 원본](https://d2k8i5ah8p7h3l.cloudfront.net/news/photo/202307/100275_84598_4135.jpg)

리뉴얼 당시 미국 제작 상품을 취급했다는 기록을 바탕으로 990v6를 견본대에 올렸다. 제조사 사진에 보이는 밝은 중창의 회색 뒤꿈치 지지대, 스웨이드 띠, 편직 갑피 위 반사 N, 교차 끈과 입구 패딩을 입체로 만들었다. 사진 속 개별 신발의 품번과 현재 재고는 확인되지 않았다. 선반의 상품 수와 간격, 옷 색과 뒷면, 단상의 치수는 추정했다. [990v6 소재와 제작 사양](https://www.newbalance.com/pd/made-in-usa-990v6/M990GL6-D-095.html) · [측면](https://nb.scene7.com/is/image/NB/m990gl6_nb_02_i?wid=1000) · [윗면](https://nb.scene7.com/is/image/NB/m990gl6_nb_03_i?wid=1000)

## 편집과 재생성

Blender 3.6.23과 내장 Bfont로 제작했다. `gallery.blend`의 `SSG_8F_NewBalance` 컬렉션에는 개별 메시 오브젝트 1,273개와 내장 편직 이미지 한 장이 있다. 신발은 벽에 20짝, 마네킹에 4짝, 견본대에 1짝이다. Blender +X는 진열 오른쪽, −Y는 관람객 쪽, +Z는 위이며 단위는 미터다. glTF Y-up 변환 뒤 월드 Y축으로 +20.77960° 회전한다. 게임 논리 원점은 (−7.63738, 35.8, 66.82044), 지형 보정 후 원점은 (−7.63738, 34.892, 66.82044)이다.

저장소 루트에서 실행한다.

```sh
D=assets/models/ssg-specialty-sports
"${GTW_BLENDER_BIN:-blender}" -b --factory-startup --gpu-backend opengl --python-exit-code 1 -P "$D/build.py"
node "$D/pack.mjs"
node tests/smoke.mjs shinsegae
node tests/smoke.mjs gotomall shinsegae
```

밑창의 반복 러그를 사선 모서리가 있는 작은 블록으로 바꾸고 편직 UV를 양자화했다. 최종 GLB는 497,028바이트, 삼각형 69,439개, 드로콜 4개다. 같은 층 22m 이내에서 간략 진열을 한 번에 그리고, 11m 이내에서 집기가 시야에 들어오면 상세 모델을 요청한다. 두 스모크 테스트에서 모두 OK를 확인했다.
