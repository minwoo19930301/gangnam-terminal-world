# 신세계 강남점 북측 타워 간판

[Blender 원본](north-signs.blend)의 PIAGET와 CHANEL 컬렉션에는 뒤판, 알루미늄 프레임, 광고 면판과 문자 메시가 들어 있습니다. 상호와 광고판 자리는 프로젝트의 기존 거리뷰 기록을 따랐습니다. 색과 문자 배치는 게임을 위한 디자인입니다. [게임·Blender 비교](review.jpg)

각 컬렉션을 편집해 저장한 뒤 저장소 루트에서 다음 명령을 실행합니다.

```sh
blender --factory-startup -b assets/models/shinsegae-facade/north-signs.blend --python-exit-code 1 -P assets/models/shinsegae-facade/export.py
blender --factory-startup -b assets/models/world/gangnam-terminal.blend --python-exit-code 1 -P assets/models/world/export.py
```

첫 명령은 가까운 거리에서 보이는 signs.glb를, 두 번째는 통합 장면에 연결된 같은 컬렉션을 읽어 원거리 건물 데이터를 갱신합니다. 글자는 윤곽 메시여서 다른 컴퓨터에서도 폰트 설치 없이 편집하고 내보낼 수 있습니다.

## 신반포로에서 본 중앙 유리 외벽

남색 반사가 비치는 중앙 유리와 은빛 가로 프레임은 강남점 운영사 사진을 참고했다. 곡면 중앙과 양쪽에 채도를 달리해 맑은 날의 반사를 근사했다. 2026년 11월 5일자 정면 사진에 보이는 연말 광고와 출입구 장식은 기간이 있는 연출이다. 강남점 공식 안내에 쓰인 외관 사진의 촬영일은 공개되지 않았다. [강남점 공식 사진](https://www.shinsegae.com/upload/storeBase/1553506803597-10332.jpg) · [2026년 11월 강남점 정문 사진과 설명](https://tnnews.co.kr/archives/298378)

비교 사진의 왼쪽은 수정 전, 오른쪽은 수정 후이며 윗줄은 낮, 아랫줄은 밤이다. 백화점 위치 표식은 지붕 위에서 보인다. 호텔 표식은 앞 건물이 가릴 때 사라진다. [거리에서 본 외벽 비교](street-finish.jpg) · [같은 거리 시점 열기](https://minwoo19930301.github.io/gangnam-terminal-world/?pitch=22#/street?p=-95.52,0,-88.10,-159)
