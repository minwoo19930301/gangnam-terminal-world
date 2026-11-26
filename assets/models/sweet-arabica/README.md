# 스위트 파크 · %아라비카

11월 25일자 신세계 강남점 지하 1층 안내도에서 %아라비카는 스위트 가든을 마주 보고 있다. 게임에서는 스위트 파크 북측 통로에서 매장 전면을 볼 수 있다. [신세계 강남점 B1 안내도](https://www.shinsegae.com/cms12/SC00002/guide/floor/__icsFiles/afieldfile/2026/11/25/GnV7UuBEdq7K.png)

강남점 정면 사진을 따라 목재 패널과 양쪽 진열창, 둥글게 꺾여 안으로 이어지는 흰색 문틀, 발광 간판을 만들었다. 사진에 보이는 ‘% ΔRΔBICΔ’ 글자와 유리문 원형 손잡이 뒤로 곡선 카운터, 중앙 에스프레소 머신과 진열 선반이 보인다. 케멕스 형태의 등은 매장 설계자 설명을 참고했다. 크기와 깊이, 집기 수량은 기존 게임의 출입구에 맞춘 근사값이다. [브랜드의 지점 소개와 설계자 설명](https://arabica.com/location/arabica-seoul-shinsegae-gangnam/) · [정면 사진](https://arabica.com/wp-content/uploads/2025/07/Seoul-Shinsegae_Landing-Page.jpg)

게임 주소는 `#/centralcity/B1?p=-15.634,-6,80.780,-155.741`이다. [일반 게임 시점의 낮·밤 비교](comparison.jpg)

편집 원본은 `entrance.blend`의 `ArabicaGangnamFront` 컬렉션이다. 게임은 가까이서 매장 쪽을 볼 때 `entrance.glb`를 불러온다. 원본을 편집한 후 이 디렉터리에서 내보낼 수 있다.

```sh
blender -b entrance.blend --python-exit-code 1 -P export.py
```
