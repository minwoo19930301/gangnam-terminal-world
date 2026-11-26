# 킴스클럽 델리 바이 애슐리

뉴코아 강남점 2관 B1의 목재 매대 여섯 개와 냉장 진열벽 한 곳에 포장식품 331개를 배치했다. 게임의 뉴코아 B1에서 **킴스클럽 지하 델리 · 포장 매대**를 선택하면 매장 앞에 선다. [게임에서 촬영한 냉장벽·새우튀김·새우롤·양장피](play.jpg)

이랜드의 강남점 개장 사진에서 나란히 붙은 목재 FRESH SUSHI 간판과 가운데 DELI by ASHLEY 명판을 확인했다. 2026년 9월 방문 사진을 보고 새우튀김의 종이받침과 소스컵, 두 종류의 롤, 팔각 용기의 새우·달걀·야채채·당면을 만들었다. 스티커 가격은 그때 붙어 있던 표시다. 매대 간격, 개별 포장 치수와 재고 배치는 게임 공간에 맞췄다. [이랜드 강남점 사진](https://www.eland.co.kr/news/viewNews?cate=P&cateIdx=573) · [2026년 9월 방문 사진](https://aria2890.tistory.com/entry/kimsclub-gangnam-express-bus-terminal) · [네이버 지도 킴스클럽 강남점](https://map.naver.com/p/entry/place/31036742)

[Blender 원본](deli.blend)의 여섯 컬렉션에서 쇼케이스, 식재료, 포장과 인쇄물을 편집할 수 있다. 굽은 튀김에 쌓인 빵가루, 구획별 고명과 뚜껑은 각각 입체다. 원본을 Cycles로 두 번 촬영해 스티커 아래 음식과 스티커 윗면을 따로 기록하고, 실제 표면 높이를 추출했다. 게임에서는 가까이 다가간 상품에만 이 표면과 투명 덮개를 그린다. 먼 상품은 종류당 8~14KB짜리 축소 이미지 한 장을 공유한다.

포장 하나에 필요한 가까운 모델은 종류별로 60~107KB, 1,914~2,828삼각형이다. 포장 35개가 보이는 새우롤 매대에서는 표면 샘플 수를 조절해 상품과 뚜껑이 224,875삼각형에서 98,980삼각형으로 줄었다. 1,000×640에서 13.1m 통로를 걷는 동안 프레임 시간 p95는 16.8ms였다. 1층 막힌 바닥 위에서 지하 델리 파일 요청 0건, 포장을 향해 돌아본 뒤 각 근접 파일 요청 1건, 재방문 캐시 사용을 확인했다.

프로젝트 루트에서 Blender, Node.js, cwebp와 설치된 프로젝트 의존성을 사용한다.

```sh
blender -b --factory-startup --python-exit-code 1 -P assets/models/kims-deli/build.py
node assets/models/kims-deli/check.mjs
node tests/newcore-transfers.mjs
```
