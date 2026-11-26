# 신세계 강남점 러프사이드

[일반 게임 근접 화면](game.jpg) · [일반 플레이 카메라](../../../?pos=-45.16077,31,61.92857&yaw=95.3199&pitch=-12#/shinsegae/7F) · [카메라 좌표와 원본 컬렉션](camera.json)

신세계 강남점 7층 멘즈 캐주얼 매장이다. 신세계 뉴스룸 기사의 **두 번째 사진**에서 기둥 돌출 간판과 안쪽 벽에 ‘rough side’가 보인다. 이 사진에서 둥근 석재 상판의 금속 행거, 낮은 목재 마네킹 단상과 석재 기둥을 읽었다. 브랜드의 강남점 정면 사진에서는 목재 세로 살 아래로 흰 석재 격자와 타공 금속 전시대, 작은 조경석이 보인다. 게임에서는 두 시점의 집기를 한 매장 안에서 볼 수 있게 배치했다. [신세계 층별 안내](https://www.shinsegae.com/store/floor.do?storeCd=SC00002) · [신세계 기사](https://www.shinsegaegroupnewsroom.com/fall-fashion-renewal-shopping-demand-5/) · [기사 두 번째 사진](https://images.shinsegaegroupnewsroom.com/wp-content/uploads/2025/09/ds_02-1.png) · [러프사이드 매장 안내](https://roughside.co.kr/about/store.html) · [브랜드의 강남점 사진](https://roughside.co.kr/foo/image/store_02.jpg)

단상에는 애쉬블랙 BDU 재킷을 열어 베이지 체크 셔츠와 머드색 퍼티그 팬츠가 보이게 했다. 재킷의 접힌 칼라, 덮개 주머니, 소매 여밈은 공식 상세 사진을 따랐다. 앞 행거에는 같은 재킷 아래에 워싱 데님을 걸고, 옆에는 체크 셔츠와 올리브색 크루넥 풀오버를 놓았다. 집기 치수와 상품 조합은 추정이며, 매장 사진 촬영일의 재고를 뜻하지 않는다. 직물과 나뭇결 무늬는 직접 제작했다.

- [BDU 재킷 애쉬블랙](https://roughside.co.kr/product/detail.html?product_no=809) · [26SS 엘라스틱 퍼티그 팬츠 머드](https://roughside.co.kr/product/detail.html?product_no=2791)
- [프라이머리 셔츠 베이지 플레이드](https://roughside.co.kr/product/detail.html?product_no=2646) · [5P 데님 팬츠 유즈드 블루](https://roughside.co.kr/product/detail.html?product_no=1991) · [그레이니 풀오버 다크 올리브](https://roughside.co.kr/product/detail.html?product_no=2763)

## 원본 조립과 재생성

`gallery.blend`의 `SSG_7F_ROUGH_SIDE` 컬렉션에 개별 편집 메시 400개와 내장 UV 이미지 한 장이 있다. 미터 단위로 Blender의 +X는 행거 오른쪽, −Y는 의류 정면, +Z는 위다. glTF Y-up 변환 뒤 게임 +Y축을 기준으로 110.973813° 회전시킨다. 실내 논리 원점은 (−47.839708, 31, 62.076406), 지형 보정 후 월드 원점은 (−47.839708, 30.092000, 62.076406)이다.

Blender 3.6.23에서 생성과 재개방을 확인했다. 매장 간판은 macOS 시스템 글꼴 Georgia Bold를 메시로 변환했다. 재생성할 때 이 글꼴이 없으면 Blender 내장 글꼴을 사용한다. 저장소 루트에서 실행한다.

```sh
D=assets/models/ssg-workwear-island
"${GTW_BLENDER_BIN:-blender}" -b --factory-startup --gpu-backend opengl --python-exit-code 1 -P "$D/build.py"
node "$D/pack.mjs"
node tests/smoke.mjs shinsegae
node tests/smoke.mjs gotomall shinsegae
```

최종 GLB는 504,604바이트, 삼각형 32,797개다. 직물·목공·금속 메시 3개를 재질 2개로 3회 그린다. 앞쪽 재킷의 곡면 분할을 유지하면서 옆으로 겹쳐 걸린 옷의 분할을 줄였고, 런타임 UV 이미지를 768픽셀로 축소했다. 일반 플레이에서는 같은 층 22m 이내에 대체 모형이 보이며, 11m 이내에서 집기가 시야에 들어올 때 상세 파일을 요청한다.
