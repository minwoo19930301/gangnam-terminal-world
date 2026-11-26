# 뉴코아 강남점 바닥 마감

[floor-finishes.blend](floor-finishes.blend)에는 매장층 포세린, 킴스클럽 연마석, 푸드스트리트 헤링본의 반복 견본이 들어 있습니다. 뉴코아 1·2관 B1~5F와 3관 1F가 이 견본을 사용합니다. 색과 패턴은 기존 프로젝트의 실내 자료에 맞춘 제작값입니다.

타일 모양과 모서리는 메시에서, 돌의 색과 입자는 재질 노드에서 편집합니다. 각 컬렉션의 **줄눈 바탕** 가로·세로 크기는 게임에서 무늬가 반복되는 간격입니다. 바탕 최저점에서 타일 윗면까지의 거리가 층판 두께가 됩니다. 당초 게임에서 각 층의 기준 높이에 맞춘 바닥 윗면과 층 외곽은 장소 모듈에서 결정합니다.

저장한 편집본을 게임으로 내보내려면 저장소 루트에서 실행합니다.

```sh
blender -b assets/models/newcore-floor/floor-finishes.blend --python-exit-code 1 -P assets/models/newcore-floor/export.py
```

내보내기는 세 견본을 정면 투영해 JPEG와 samples.js를 만듭니다. 엔진은 이 색상 위에 현재 조명과 연마석 반사를 적용합니다. build.py는 초기 견본을 처음부터 다시 만드는 용도입니다.

[푸드스트리트에 적용한 게임 화면](food-street.jpg)
