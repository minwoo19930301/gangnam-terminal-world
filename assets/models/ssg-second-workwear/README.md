# 신세계 강남점 아워셀브스

[일반 게임 카메라](../../../?pos=-45.338046,31,72.09625&yaw=-152.785189&pitch=-9#/shinsegae/7F) · [게임 화면](game.jpg) · [조립용 카메라 정보](camera.json)

신세계 강남점 7층 멘즈 캐주얼 정규 매장이다. 신세계는 2025년 남성층 리뉴얼 때 이 브랜드를 소개했고, 브랜드도 강남점 7층을 공식 판매처로 안내한다. [신세계 층별 안내](https://www.shinsegae.com/store/floor.do?storeCd=SC00002) · [신세계 리뉴얼 기사](https://www.shinsegaegroupnewsroom.com/fall-fashion-renewal-shopping-demand-5/) · [브랜드 판매처](https://ourselvesstore.com/shopinfo/stockist.html)

집기는 **2024년 같은 지점에서 열린 아워셀브스 팝업**을 참고했다. 사진 왼쪽에는 짙은 목재 틀 안에 외투를 정면으로 내건 전시판 두 개가 있고, 오른쪽에는 낮은 2단 선반과 행거가 있다. 회갈색 카펫과 벽면 상호도 이 사진에서 가져왔다. 게임에서는 이 구성을 정규 매장 칸에 맞춰 축소했다. 집기 치수, 전시판의 축과 결합부, 상품 배치는 추정이다. [강남점 팝업 기사와 현장 사진](https://tnnews.co.kr/archives/206849) · [집기 배치 원본 사진](https://tnnews.co.kr/wp-content/uploads/2024/09/신세계百-강남점-아워셀브스-팝업스토어-사진-2.jpg)

전시판에는 2026년 11월 공식 카탈로그에 실린 올리브·블랙 구스다운 밀 파카를 걸었다. 비스듬한 가슴 주머니, 둥근 아랫주머니, 단추 루프와 후드 안감을 별도 부품으로 만들었다. 올리브에는 탈착식 퍼를 붙이고 블랙은 뗀 상태로 연출했다. 옆 행거에는 차콜 밀 베스트, 선반에는 빈티지 그레이 워시드 울 스카프를 놓았다. 촬영 당시 또는 현재의 지점 재고는 확인하지 않았다. [올리브 파카](https://ourselvesstore.com/product/goose-down-mil-parka-olive/1763/) · [블랙 파카](https://ourselvesstore.com/product/goose-down-mil-parka-black/1764/) · [차콜 베스트](https://ourselvesstore.com/product/goose-down-mil-vest-charcoal/1765/) · [울 스카프](https://ourselvesstore.com/product/re-stock-washed-wool-scarf-vintage-grey/1762/)

## 원본 조립과 재생성

`gallery.blend`의 `SSG_7F_OURSELVES` 컬렉션에 편집 메시 171개와 파일에 내장한 자체 제작 UV 아틀라스가 있다. 단위는 미터이며 Blender +X는 진열대 오른쪽, −Y는 손님 쪽, +Z는 위다. glTF Y-up 변환 후 게임 +Y축으로 −159.219929° 회전한다. 실내 논리 원점은 (−44.291482, 31, 74.544189), 지형 보정 후 월드 원점은 (−44.291482, 30.092, 74.544189)이다.

Blender 3.6.23에서 제작했다. 상호 글자는 시스템 Arial Narrow를 메시로 변환하며 글꼴이 없으면 Blender 내장 글꼴을 쓴다. 저장소 루트에서 실행한다.

```sh
D=assets/models/ssg-second-workwear
"${GTW_BLENDER_BIN:-blender}" -b --factory-startup --gpu-backend opengl --python-exit-code 1 -P "$D/build.py"
node "$D/pack.mjs"
node tests/smoke.mjs shinsegae
node tests/smoke.mjs gotomall shinsegae
```

런타임 파일은 581,576바이트, 삼각형 31,823개, 재질 2개, 상세 드로콜 3회다. 공유 로더가 같은 층 22m 이내에서 대체 진열을 한 번에 그리고 11m 안에서 화면에 들어오면 상세 모델을 요청한다.
