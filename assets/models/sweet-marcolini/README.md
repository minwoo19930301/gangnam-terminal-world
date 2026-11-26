# 스위트 파크 · 피에르 마르콜리니

[편집용 Blender 모델](chocolatier.blend) · [게임의 같은 위치에서 본 낮과 밤](comparison.jpg)

백화점 카페 통로에서 스위트 파크로 들어가는 모퉁이에 있는 초콜릿 매장이다. 강남점 개점 사진에 보이는 구리색 ㄱ자 쇼케이스, 둥근 유리 모서리, 뒤쪽 캐비닛, 길게 매단 조명과 기울어진 메뉴 화면 세 개를 모델링했다. 카운터 위에는 라즈베리 하트와 상자에 담긴 봉봉을 놓았다. 뒷면의 두 줄 간판은 브랜드 공식 벡터 로고로 만들었다. [신세계의 강남점 매장 사진](https://www.shinsegaegroupnewsroom.com/go-field-life-dessert-renewal-2/) · [브랜드 로고](https://www.pierremarcolini.co.kr/resources/img/common/pierre-marcolini.svg) · [피에르 마르콜리니 제품 소개](https://www.pierremarcolini.co.kr/house/ourcreations)

매장 위치는 강남점 고객용 층별 안내도에서 맞췄다. 가구 치수, 조명의 높이와 세기, 진열 수량은 사진을 보고 재구성했다. 메뉴 화면은 그래픽 예시다. [신세계 강남점 고객 안내도](https://www.shinsegae.com/cms12/SC00002/guide/floor/__icsFiles/afieldfile/2026/11/25/GnV7UuBEdq7K.png)

Blender에서 금속과 벽에 닿는 조명을 Cycles로 계산해 게임용 메시의 정점 색에 저장했다. 편집본에는 광원과 반사판이 들어 있다. 카운터, 유리, 조명은 게임에서 세 묶음으로 그린다. 모델 파일은 81,900바이트다. 낮과 밤 각각 두 자리에서 매장을 향했을 때 파일 요청은 한 번이었고, 같은 자리에서 통로 건너편을 향했을 때는 0번이었다.

저장소 루트에서 편집본을 저장한 뒤 아래 명령으로 게임용 파일을 다시 만든다.

```sh
blender --factory-startup -b assets/models/sweet-marcolini/chocolatier.blend \
  --python-exit-code 1 -P assets/models/sweet-marcolini/export.py
```
