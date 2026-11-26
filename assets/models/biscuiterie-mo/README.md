# 스위트 파크 비스퀴테리 M.O

나무 아치와 금빛 물결 간판을 지나면 두 개의 유리 진열장 너머로 스테인리스 벽이 보인다. 손님 쪽에서는 마들렌의 세로 주름, 원형 틴의 숫자 3·4·5, 보라색 상자와 민트색 인쇄 포장을 가까이 볼 수 있다. 게임 지도에서 **비스퀴테리 엠오 → 여기로 이동**을 누르면 통로에서 입구를 바라본다. [게임 전후와 Blender 렌더 비교](comparison.jpg) · [편집용 Blender 원본](biscuiterie.blend)

브랜드의 공식 매장 안내에서 강남점 B1 소재를 확인하고, 2026년 11월 25일 신세계 강남점 층별도에서 점포 전면과 통로를 맞췄다. 2024년 8월 방문 사진에 보이는 목재 몰딩, 주황색 바닥, 반사 벽, 조명 선반과 포장 형태를 모델링했다. 가구 치수는 사진 비례로 추정했고 종류별 수량과 배치는 게임에 맞춰 구성했다. [메종엠오 매장 안내](https://m.maisonmocompany.com/contact.html) · [신세계 지하 1층 안내도](https://www.shinsegae.com/cms12/SC00002/guide/floor/__icsFiles/afieldfile/2026/11/25/GnV7UuBEdq7K.png) · [2024년 방문 사진](https://wirbel.tistory.com/904)

`BiscuiterieMO`에 가구와 상품, `MO glazing`에 유리, `MO lit fittings`에 로고와 조명이 있다. 원본의 손님 카메라로 F12 렌더를 할 수 있다. 게임은 가까이 보이는 매장의 276,748바이트 GLB를 한 번 요청해 불투명 부분, 유리와 조명을 세 번에 그린다. 상세 삼각형은 30,821개다. 로딩 중 보이는 326개 삼각형의 실루엣에도 같은 Blender 로고를 넣었다. 밤에도 선반 반사와 조명이 보이도록 매장 안쪽 재질에 Cycles 조명을 구웠다.

저장소 루트에서 원본을 만들고 게임용 모델을 내보낼 수 있다.

```sh
D=assets/models/biscuiterie-mo
blender --factory-startup -b --python-exit-code 1 -P "$D/build.py"
blender --factory-startup -b "$D/biscuiterie.blend" --python-exit-code 1 -P "$D/export.py"
```
