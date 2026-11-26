# 신세계 강남점 모비엘 · 9층 키친웨어

[일반 게임에서 보기](http://127.0.0.1:8765/?pos=-21.18248788928499,40.6,86.78256473676512&yaw=-145.56049559692877&pitch=-21#/shinsegae/9F) · [게임 화면](game.jpg) · [카메라 좌표](camera.json)

2025년 9월 강남점 단독 매장 리뉴얼 때 모비엘이 제공한 사진을 참고했다. 둥근 목재 선반 두 칸, 밝은색 깔판, 왼쪽의 돔 뚜껑 양수냄비와 오른쪽의 편수냄비·프라이팬 배열을 옮겼다. 저장된 신세계 안내 자료의 ‘AMT/모비엘’은 게임 9층의 ‘모비엘’ 구획에 대응한다. [강남점 층별 안내](https://www.shinsegae.com/store/floor.do?storeCd=SC00002) · [리뉴얼 기사와 사진 설명](https://news.nate.com/view/20250916n14656) · [모비엘 제공 진열 사진](https://news.nateimg.co.kr/orgImg/ey/2025/09/16/20250916112500_2226834_556_327.png)

스테인리스 12점에는 안쪽으로 이어지는 말린 테두리, 타출 표면, 몸통에 맞게 휜 손잡이 받침과 리벳을 만들었다. 상단의 구리 편수냄비 4점은 은색 내면, 황동 손잡이와 뚜껑 고리를 비교하기 위한 카탈로그 기반 진열이다. 선반 치수·수량·상단 명패는 추정했으며, 사진만으로 각 냄비의 모델 번호를 식별하기는 어렵다. [M’ELITE 돔 뚜껑과 제조사 치수](https://mauviel-usa.com/products/mauviel-melite-hammered-5-ply-curved-splayed-saute-pan-with-dome-lid-cast-stainless-steel-handles) · [모비엘 타출·리벳 접사](https://www.mauviel-boutique.com/1364-large_default/batterie-3-casseroles-m-elite-b.jpg) · [M’150 B 제조사 컬렉션](https://mauviel-usa.com/collections/m-heritage-m150-b) · [구리 편수냄비 손잡이 접사](https://www.boroughkitchen.com/products/mauviel-m150b-saucepan-with-lid)

## 원본과 배치

`showroom.blend`의 `SSG_9F_Mauviel` 컬렉션은 편집 가능한 메시 225개로 구성된다. 원점은 두 진열장 사이 바닥이다. 미터 단위 Blender +X는 고객의 오른쪽, +Y는 진열장 뒤쪽, +Z는 위다. glTF Y-up 변환 후 게임의 +Y축 회전은 −159.221649°다. 게임 층 기준 원점은 (−20.344407, 40.6, 88.004743), 지형 보정 후 렌더 원점의 y는 39.692000이다.

런타임 GLB는 447,460바이트, 57,404삼각형, 3드로다. 목재에는 원본에 내장한 나뭇결 텍스처를, 금속에는 형상을 따라 구운 반사 명암과 광택 재질을 사용했다. 진열장 바닥 면적에 충돌을 두었다. 같은 층에서 22m 안쪽은 간이 진열을 사용하고, 11m 안에서 진열장을 바라보면 상세 모델을 요청한다.

## 다시 만들기

저장소 루트에서 실행한다. Blender 3.6.23과 내장 Bfont를 사용했다.

```sh
D=assets/models/ssg-cookware
blender -b --factory-startup --gpu-backend opengl --python-exit-code 1 -P "$D/build.py"
node "$D/pack.mjs"
node tests/smoke.mjs shinsegae
```

편집한 원본을 다시 내보낼 때는 다음을 실행한다.

```sh
blender -b --gpu-backend opengl "$D/showroom.blend" --python-exit-code 1 -P "$D/export.py"
node "$D/pack.mjs"
```
