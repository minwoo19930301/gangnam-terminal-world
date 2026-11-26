# 경부선 1층 앤티앤스 고속터미널점

2025년 10월 24일 지점 방문자가 공개한 사진에는 스틱 종이컵, 자주·노랑 고구마 포장, 할라피뇨와 블랙페퍼 치즈 핫도그, 상품 카드 두 줄, 스테인리스 망과 쇼케이스 전면 유리가 보인다. 두 번째 사진에는 컵의 옆 접힘과 빵에서 돌출된 베이컨 조각이 보인다. 이 특징과 상품명을 블렌더 모델에 반영했다. [지점 방문 사진](https://polle.com/solubleblue/posts/1467)

본사는 지점을 신반포로 194 본관 1층 쇼케이스 2호로 안내한다. 매장 배치는 게임의 기존 점포 좌표를 사용했다. 쇼케이스와 상판 치수, 상품 개수, 클래식 프레즐의 옆 트레이, 준비 공간과 상호판 위치는 추정이다. [본사 매장 검색](https://auntieannes.co.kr/store-map/index.html?p=3) · [터미널 운영사 층별 안내](https://exterminal.co.kr/floor.asp)

클래식 프레즐은 반죽 한 줄이 서로 다른 높이로 교차하도록 만들고 굵은 소금과 아몬드를 붙였다. 공식 아이덴티티의 금색 매듭 심볼과 파란 글자 윤곽은 편집 가능한 Blender 메시로 제작했다. [클래식 프레즐](https://auntieannes.co.kr/product-all/?s_type=A) · [스틱 프레즐](https://auntieannes.co.kr/product-all/?s_type=C) · [브랜드 및 워드마크](https://auntieannes.co.kr/brandstory/)

- 게임에서 매장 안으로 접근하는 주소는 `#/gyeongbu/1F?p=86.058,0,5.641,110.81`이다. 카운터 앞은 `#/gyeongbu/1F?p=83.347,0,6.671,110.81`이다.
- [편집 원본](./seoul-warmer.blend)은 워머 본체, 개별 빵·컵·카드·집기와 전면·측면 유리를 담고 있다. GLB는 본체와 유리를 두 번에 나눠 그린다. 같은 층의 카메라가 진열대를 보고 10m 안에 들어오면 파일을 요청하고, 14m 밖에서는 간단한 하부장으로 돌아간다.
- `wordmark.json`은 [본사 가로형 상호판](https://auntieannes.co.kr/wp-content/uploads/2019/11/identity-logo01-1.png)에서 금색과 청색 면의 윤곽을 추출한 좌표다. 게임은 이 원본 이미지를 다운로드하지 않는다.

```sh
blender -b --threads 2 -P assets/models/gyeongbu-pretzels/build.py
blender -b assets/models/gyeongbu-pretzels/seoul-warmer.blend --threads 2 -P assets/models/gyeongbu-pretzels/export.py
```
