# 신세계 강남점 북측 타워 간판

[Blender 원본](north-signs.blend)의 PIAGET와 CHANEL 컬렉션에는 뒤판, 알루미늄 프레임, 광고 면판과 문자 메시가 들어 있습니다. 상호와 광고판 자리는 프로젝트의 기존 거리뷰 기록을 따랐습니다. 색과 문자 배치는 게임을 위한 디자인입니다. [게임·Blender 비교](review.jpg)

각 컬렉션을 편집해 저장한 뒤 저장소 루트에서 다음 명령을 실행합니다.

```sh
blender --factory-startup -b assets/models/shinsegae-facade/north-signs.blend --python-exit-code 1 -P assets/models/shinsegae-facade/export.py
blender --factory-startup -b assets/models/world/gangnam-terminal.blend --python-exit-code 1 -P assets/models/world/export.py
```

첫 명령은 가까운 거리에서 보이는 signs.glb를, 두 번째는 통합 장면에 연결된 같은 컬렉션을 읽어 원거리 건물 데이터를 갱신합니다. 글자는 윤곽 메시여서 다른 컴퓨터에서도 폰트 설치 없이 편집하고 내보낼 수 있습니다.
