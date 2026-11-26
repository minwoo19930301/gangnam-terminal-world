# 신세계 강남점 9층 허먼 밀러

[일반 게임에서 보기](http://127.0.0.1:8765/?pos=-69.6441051296058,40.6,-17.12874492942607&yaw=203&pitch=-15#/shinsegae/9F) · [게임 화면](game.jpg) · [검증 카메라](camera.json)

강남점 공식 층별 안내의 저장 항목은 허먼밀러를 9층 홈인테리어로 분류한다. 에어론 1대와 엠바디 2대, 마감 표본 8점을 배치했다. 강남점의 당일 재고와 실제 집기 위치는 확인되지 않아 의자의 대수, 색상, 표본 벽과 진열대는 추정했다. [강남점 층별 안내](https://www.shinsegae.com/store/floor.do?storeCd=SC00002)

에어론의 좌판과 등판은 휘어진 테두리 안을 가로지르는 망사로 만들었다. 등 뒤에는 허리와 천골을 받치는 두 패드가 있다. 엠바디는 넓은 천 좌판과 어깨 쪽이 좁은 등판을 갖췄다. 한 대를 돌려 세워 백핏 척추와 탄성 지지대를 볼 수 있다. 팔걸이, 좌판 아래 틸트 하우징, 조절 레버, 이중 캐스터도 개별 부품이다. 망사 간격과 링크 형상은 게임 거리에서 보이도록 단순화했으며 조절부는 고정되어 있다. [에어론 제품 시트](https://www.hermanmiller.com/content/dam/hermanmiller/documents/product_literature/product_sheets/aeron_chairs_product_sheet.pdf) · [엠바디 제품 시트](https://www.hermanmiller.com/content/dam/hermanmiller/documents/product_literature/product_sheets/embody_chairs_product_sheet.pdf)

## 원본과 조립

편집 원본은 `seating.blend`, 컬렉션은 `SSG_9F_HermanMiller`다. 444개 메시를 미터 단위로 작성했다. Blender +X는 진열대 정면에서 오른쪽, +Y는 표본 벽 방향, +Z는 위다. glTF Y-up 변환 후 월드 Y축으로 −159.212481° 회전한다. 원점은 게임 좌표 (−68.116391, 40.6, −14.687186)이고 지형 높이를 더한 THREE 장면의 Y는 43.760000이다.

런타임 GLB는 메시 4개, 재질 4개, 삼각형 55,728개, 463,120바이트다. 매장 상세 생성 시 간이 모형과 층별 표시용 메시를 동기 등록한다. 같은 층의 11m 안에서 시야 조건을 만족하면 상세 모델을 요청하며, 실패하면 5초 뒤 재시도한다. 감독 렌더러에서 7층과 9층 원거리의 해당 GLB 요청은 각각 0건, 기록한 매장 시점은 1건이었다.

## 재생성

저장소 루트에서 실행한다. 이 샌드박스에서는 설치된 Blender 4.5.11의 Metal 초기화가 실패해 기존 Blender 3.6.23의 헤드리스 OpenGL 백엔드로 작성과 내보내기를 검증했다.

아래 명령은 `PATH`의 Blender를 사용한다. 별도로 설치했다면 `GTW_BLENDER_BIN`에 해당 실행 파일 경로를 지정한다.

```sh
D=assets/models/ssg-herman-miller
"${GTW_BLENDER_BIN:-blender}" -b --factory-startup --gpu-backend opengl --python-exit-code 1 -P "$D/build.py"
node "$D/pack.mjs"
node tests/smoke.mjs shinsegae
node tests/smoke.mjs shinsegae gotomall
```

편집한 원본에서 다시 내보낼 때는 첫 Blender 명령을 다음 명령으로 바꾼 후 같은 압축 단계를 실행한다.

```sh
"${GTW_BLENDER_BIN:-blender}" -b --gpu-backend opengl "$D/seating.blend" --python-exit-code 1 -P "$D/export.py"
```
