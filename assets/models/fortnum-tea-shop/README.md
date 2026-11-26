# 스위트 파크 · 포트넘앤메이슨

강남점 B1 고객 안내도에서 엘리베이터 옆 매장의 동쪽 짧은 변이 스위트 가든 쪽 통로와 만난다. 게임에 남아 있던 제과 진열대를 걷어내고 이 통로에서 찻집 안이 보이도록 했다. 공개 도면을 1823 × 1367 기준으로 환산한 매장 영역은 (1081, 509)~(1164, 533)이다. [신세계 강남점 11월 25일 B1 고객 안내도](https://www.shinsegae.com/cms12/SC00002/guide/floor/__icsFiles/afieldfile/2026/11/25/GnV7UuBEdq7K.png) · [포트넘앤메이슨 공식 강남점 안내](https://www.fortnumandmason.com/worldwide-stockists)

방문자가 2026년 2월에 공개한 매장 정면 사진을 기준으로 목재 몰딩, 아이보리색 입체 글자, 양쪽 원형 홍차 진열대, 안쪽의 붉은 카펫과 낮은 탁자, 청록색 화면을 만들었다. 출입구 앞 대리석에는 사진의 검은 사선 무늬가 보인다. 상품 수량과 실내 깊이, 포장 색의 배열은 사진 비례로 맞췄다. 흰색 간판의 글자 윤곽은 브랜드 벡터 원본에서 가져왔다. [방문자가 촬영한 매장 사진](https://www.koreahiddenplace.com/2026/02/sweet-stop-in-gangnam-visiting.html) · [브랜드 워드마크](https://www.fortnumandmason.com/assets/logo-BMbeED5I.svg) · [같은 게임 시점의 수정 전후](comparison.jpg)

지도에서 ‘포트넘앤메이슨’ 또는 ‘Fortnum & Mason’을 검색해 이동한다. Blender의 `tea-shop.blend`에서 `FortnumSweetPark` 컬렉션을 편집할 수 있다. 원형 진열대의 캔은 개별 오브젝트이고, 금색 뚜껑과 라벨은 각각 다른 재질로 지정했다. 웹 모델은 진열대·간판·몰딩을 한 번에 그린다.

```sh
blender -b --factory-startup assets/models/fortnum-tea-shop/tea-shop.blend --python-exit-code 1 -P assets/models/fortnum-tea-shop/export.py
node tests/sweet-park-directory.mjs
```
