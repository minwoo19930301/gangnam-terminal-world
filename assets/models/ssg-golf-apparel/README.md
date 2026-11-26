# 신세계 강남점 보스골프

[7층 일반 플레이 카메라](http://127.0.0.1:8765/?pos=-47.5136,31,-18.76366&yaw=-67.61589&pitch=-10#/shinsegae/7F) · [게임 화면](game.jpg) · [카메라와 원본 컬렉션](camera.json)

강남점 본관 7층 층별 안내에는 보스골프가 골프웨어 매장으로 실려 있다. 2024년 강남점 사진에서 샴페인색 금속 행거, 흰옷과 검은옷의 배열, 작은 손가방, 연두색 상호, 검은 바이저와 흰 조끼·플리츠 스커트를 입은 마네킹을 확인했다. 이 진열을 기존 게임 매장의 폭에 맞춰 옮겼다. 치수와 옷 사이 간격은 추정했으며, 거울에는 사진에 보이는 천장선과 행거를 단순화해 고정된 반사상으로 넣었다. [공식 층별 안내](https://www.shinsegae.com/store/floor.do?storeCd=SC00002) · [신세계 개점 자료와 삼색 디자인 설명](https://www.shinsegaegroupnewsroom.com/shinsegae-gangnam-premium-golf-store/) · [신세계 강남점 1주년 사진](https://images.shinsegaegroupnewsroom.com/wp-content/uploads/2025/08/shinsegae-baek-gangnam-golf-special.png) · [보스골프 강남점 전경 원본](https://wimg.mk.co.kr/news/cms/202402/29/20240229_01110307000002_L01.jpg)

행거 두 대에는 상의 여덟 벌과 슬랙스 두 벌을 걸었다. 흰 니트의 큰 아가일 배색, 검은 폴로의 어깨 배색, 버킷햇의 곡선 챙은 공식 아울렛 상품 사진에서 가져온 형태다. 이 세 상품의 지점 재고와 배치는 확인되지 않았다. 마네킹에는 열린 바이저의 머리띠와 테두리, 조끼 목둘레, 치마의 칼주름 24개를 따로 모델링했다. [아가일 니트](https://pxgbossgolf.cafe24.com/product/detail.html?product_no=1202) · [검은 폴로](https://pxgbossgolf.cafe24.com/product/detail.html?product_no=1386) · [패딩 버킷햇](https://pxgbossgolf.cafe24.com/product/detail.html?product_no=1457)

## 원본과 재생성

원본은 `gallery.blend`의 `SSG_7F_BOSS_GOLF` 컬렉션이다. 편집 가능한 메시 221개와 내장 편직 이미지 한 장을 포함한다. 단위는 미터이며 Blender의 +X는 진열대 오른쪽, −Y는 고객 쪽, +Z는 위다. glTF Y-up 변환 뒤 게임 +Y축 기준 −69.140515° 회전한다. 실내 원점은 게임 (−44.226079, 31, −19.909365), 지형 보정이 켜진 전체 월드에서는 (−44.226079, 33.818184, −19.909365)다.

Blender 3.6.23에서 원본을 생성하고 다시 열어 확인했다. 상호는 시스템 Arial Bold를 메시로 변환했다. 다른 환경에서는 `GTW_BOLD_FONT`로 글꼴 파일을 지정할 수 있다. 저장소 루트에서 실행한다.

```sh
D=assets/models/ssg-golf-apparel
"${GTW_BLENDER_BIN:-blender}" -b --factory-startup --gpu-backend opengl --python-exit-code 1 -P "$D/build.py"
node "$D/pack.mjs"
node tests/smoke.mjs shinsegae
node tests/smoke.mjs gotomall shinsegae
```

상세 모델은 385,004바이트, 삼각형 43,544개, 재질 2개와 드로콜 2회다. 같은 층 22m 이내에서 대체 진열을 한 번에 그리고 11m 이내의 시야에 들면 상세 모델을 요청한다. 일반 게임에서 8층과 7층 프레이트 앞의 요청은 각각 0건, 보스골프 카메라에서는 1건이었다. 단독 및 고투몰 인접 smoke 테스트 결과는 모두 OK였다.
