# 신세계 강남점 B1 청과 매대 위 장식 천장

신세계그룹이 공개한 강남점 마켓 개점 사진에는 청과 매대 바로 위에 모서리를 깎은 천장이 보인다. 금빛 갈색 바탕의 장식화를 밝은 몰딩이 여덟 칸으로 나누고, 가운데에는 원형 장식이 있다. 게임에서는 동측 입구에서 보이는 두 과일 매대 위 한 구간에만 이 구성을 적용했다. 꽃과 잎무늬는 사진을 참고해 새로 그렸으며 천장 폭은 게임 속 매대와 통로에 맞췄다. [신세계그룹 뉴스룸](https://www.shinsegaegroupnewsroom.com/shinsegae-market-new-standard-opening/) · [매장 사진](https://images.shinsegaegroupnewsroom.com/wp-content/uploads/2025/08/shinsegae-market-new-standard-opening.png)

[동측 로비와 문턱에서 본 변경 전후](comparison.jpg) · [게임 카메라](camera.json)

원본은 `ceiling.blend`의 `MarketProduceCeiling` 컬렉션이다. 여덟 장식화와 리브, 중앙 원형 장식, 간접조명 테두리를 따로 편집할 수 있다. `panel.mjs`로 그림을 다시 만들고 `build.py`로 Blender 원본을 생성한다. 원본을 직접 편집한 뒤에는 `blender -b ceiling.blend -P export.py`로 게임 메시를 내보낸다.

근거리 상세형은 삼각형 608개로 한 번에 그린다. 문턱에서 천장을 보고 있을 때만 메시와 이미지를 한 번씩 요청하며 같은 로비에서 반대 방향을 보고 시작하면 두 요청이 모두 생략된다. 모델의 최저점은 바닥에서 4.136m이며 이동 및 충돌 지형은 기존 것을 유지한다.
