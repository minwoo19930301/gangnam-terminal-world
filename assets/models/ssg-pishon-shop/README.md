# 신세계 강남점 9층 피숀

[일반 게임에서 보기](http://127.0.0.1:8765/?pos=-39.52061,40.6,32.74546&yaw=-77.715&pitch=-11#/shinsegae/9F) · [게임 화면](game.jpg) · [카메라 좌표](camera.json)

강남점 9층 홈인테리어 매장 피숀의 기존 구획에 선물 진열을 배치했다. 리뉴얼 때 포인트오브뷰가 숍인숍으로 입점했다. 강남점에서 촬영한 홀리데이 사진의 크림색 석재와 금속 선반, 피숀 공식 브랜드 사진의 파란 포장 상자와 아이보리 리본을 참고했다. 두 진열대의 치수와 위치는 게임 안에서 세 제품군을 걸어 다니며 볼 수 있도록 잡았다. [신세계 층별 안내](https://www.shinsegae.com/store/floor.do?storeCd=SC00002) · [강남점 현장 사진](https://images.shinsegaegroupnewsroom.com/wp-content/uploads/2025/12/ds_01-1.png) · [촬영 장소가 명시된 신세계 제공 사진](https://www.news1.kr/photos/7664255) · [피숀 공식 브랜드 사진](https://www.shinsegae.com/upload/ssgbrand/contents/introduce/1772772094313-31070.png)

- **앞쪽 색유리**. 신세계가 홀리데이 상품으로 소개한 로브제 프리즘 하이볼이다. 제조사 규격인 지름 9cm, 높이 12cm에 맞춰 벌어지는 입구, 세로로 깎은 면, 두꺼운 바닥과 안쪽 벽을 만들었다. 깊이에 따라 달라지는 빛깔은 꼭짓점 색과 반투명 재질로 표현했다. [신세계 상품 소개](https://www.shinsegaegroupnewsroom.com/shinsegae-pishon-christmas-home-party-gift/) · [로브제 상세 사진·규격](https://www.l-objet.com/en-uk/products/prism-highball-glasses-bordeaux-set-of-4)
- **오른쪽 티웨어**. 리뉴얼 화보의 ‘선물하는 일상, 피숀’ 사진에서 흰색 티포트의 각진 금속 손잡이와 위로 휜 주둥이, 찻잔과 받침을 따왔다. 화보에는 티웨어 제조사와 컬렉션명이 없어 형태와 마감만 재현했다. [강남점 리뉴얼 화보](https://www.shinsegae.com/magazine/view.do?magSeq=1204&pSeq=2746)
- **뒤쪽 북엔드**. 뉴맥스 Norm II는 피숀 판매 목록에서 확인했다. 제조사 사진과 9 × 15 × 30cm 규격을 참고해 짙은 갈색 합성 모래 질감, 어긋난 두 벽과 사이의 계단을 만들었다. 책 수와 배치는 추정했다. [피숀 판매 목록](https://www.ssg.com/search.ssg?query=%EC%B1%85%EA%BD%82%EC%9D%B4) · [뉴맥스 Norm II](https://new-mags.com/products/norm-ii)

## 원본과 배치

`gallery.blend`의 `SSG_9F_Pishon` 컬렉션에는 개별 편집 가능한 메시 291개가 있다. 단위는 미터다. Blender +X는 진열장을 마주 본 고객의 오른쪽, +Y는 진열장 뒤쪽, +Z는 위다. glTF Y-up 변환 후 게임 +Y축 회전은 −69.09908°다. 진열장 원점은 게임 층 좌표 (−37.02457, 40.6, 32.18988), 지형 보정 후 높이는 42.94792m다.

게임 파일은 530,432바이트, 삼각형 43,083개, 재질별 메시 5개다. 간이 진열은 한 번에 그린다. 7층과 9층 약 39m 거리에서 피숀 GLB 요청은 각각 0건, 위 카메라에서는 1건이었다. 최종 화면의 HUD는 ‘피숀 · 9F’다.

## 다시 만들기

저장소 루트에서 Blender 3.6.23으로 확인했다. 간판은 시스템의 Times New Roman을 사용하고, 글꼴이 없으면 Blender 기본 글꼴로 생성한다. 배포 원본에는 글자가 메시로 들어 있다.

```sh
D=assets/models/ssg-pishon-shop
blender -b --factory-startup --gpu-backend opengl --python-exit-code 1 -P "$D/build.py"
node "$D/pack.mjs"
node tests/smoke.mjs shinsegae
node tests/smoke.mjs gotomall shinsegae
```
