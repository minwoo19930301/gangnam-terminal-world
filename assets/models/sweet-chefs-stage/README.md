# 스위트 파크 · 셰프스 스테이지와 르솔레이

신세계 강남점의 스위트 파크 사진에는 황동 테두리와 두 개의 받침이 있는 CHEF’S STAGE 표지, 아래쪽의 LE SOLEIL 표찰, 녹색 결 대리석과 청동 몰딩, 유리 진열장 안의 작은 디저트가 보인다. 공식 층별 안내도의 ‘깰끄쇼즈 / 르솔레이 / 아우치+터치’ 매대에 배치했다. 치수와 디저트의 종류·수량은 사진을 참고한 근사값이다. [신세계그룹 뉴스룸 기사](https://www.shinsegaegroupnewsroom.com/go-field-life-dessert-renewal-2/) · [매대 사진](https://images.shinsegaegroupnewsroom.com/wp-content/uploads/2025/08/go-field-life-dessert-renewal_17.png) · [두 번째 각도](https://images.shinsegaegroupnewsroom.com/wp-content/uploads/2025/09/ss3_image_68c8e10b997e9.png)

게임 지도에서 **스위트 파크 입구**를 선택하거나 `#/centralcity/B1?destination=sweet-park`를 연다. 유리와 충돌 경계는 기존 매대를 사용한다. 표지·석재 띠·제품 트레이는 별도로 편집할 수 있으며, 가까운 매대가 화면에 들어올 때 한 개의 메시를 불러온다. [같은 시점의 변경 전후](comparison.jpg)

편집 원본은 `counter.blend`의 `SweetPark_ChefsStage` 컬렉션이다. 변환 행렬은 `assets/models/world/indoor-layout.mjs`가 실제 게임 배치에서 추출한다.

```sh
blender -b counter.blend --python-exit-code 1 -P export.py
```
