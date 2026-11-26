# 신세계 강남점 B1 기프트 컨시어지

서울경제 김남명 기자가 2025년 2월 27일 강남점에서 찍은 사진에는 밝은 과일 쇼케이스와 뒤편 두 단의 선반이 보인다. 아래 선반에는 자주색 보자기로 싼 선물 세 개와 작은 병들이, 위 선반에는 리본을 두른 갈색·금색 상자들이 놓여 있다. 선반 뒤 숲 그림은 사진에서 구성을 확인해 새로 그렸다. [현장 기사](https://www.sedaily.com/NewsView/2GQ2QKUDYR) · [기프트 컨시어지 사진](https://t1.daumcdn.net/news/202503/01/seouleconomy/20250301053050117cnlb.jpg)

신세계그룹은 이곳에서 식품관 상품을 골라 선물 세트로 구성하고 포장할 수 있다고 소개했다. 게임의 쇼케이스는 강남점 B1 층별 안내도에 표시된 기프트 컨시어지의 기존 자리와 방향을 따랐다. 쇼케이스 깊이와 뒤쪽 선반 간격은 게임 내 점포 폭에 맞췄다. [신세계그룹 개점 자료](https://www.shinsegaegroupnewsroom.com/shinsegae-market-new-standard-opening/) · [강남점 B1 층별 안내도](https://www.shinsegae.com/cms12/SC00002/guide/floor/__icsFiles/afieldfile/2026/11/25/GnV7UuBEdq7K.png)

[로비와 매대 앞에서 본 변경 전후](comparison.jpg) · [게임 카메라](camera.json)

Blender 원본은 `counter.blend`의 `MarketGiftConcierge` 컬렉션이다. 과일 케이스와 가격표, 유리, 선반, 보자기, 작은 병, 선물 상자를 나누어 편집할 수 있다. 수정 후 이 폴더에서 `blender -b counter.blend -P export.py`로 게임 모델을 내보낸다. 배경 그림은 `garden.mjs`에서 생성한다.

상세형은 불투명 진열대와 투명 유리를 합해 삼각형 9,846개이며 두 번에 그린다. 이용객이 볼 수 있는 거리인 15m 안에서 모델과 배경 그림을 한 번씩만 요청한다.
