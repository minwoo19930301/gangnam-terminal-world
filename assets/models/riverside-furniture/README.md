# 잠원한강공원 벤치와 데블스도어 아치창

공원 벤치 37개의 기존 위치와 방향에 1.9m 목재 좌판, 등받이 세 줄, 곡선 팔걸이와 강관 다리를 적용했다. 각 벤치의 위치와 제품 형식은 공원 분위기에 맞춘 재구성이다. [잠원한강공원 조사 기록](../../../data/research/jamwon_hangang.json)

경부선 동측 데블스도어의 기존 아치창 8개에는 벽돌 쐐기, 창 옆 벽돌 턱, 방사형 금속 창살과 돌 창대를 적용했다. 기존 유리와 벽체 개구부를 사용한다. 정면 사진에서 확인한 벽돌 아치와 반복 창을 참고했다. 창틀 단면과 벽돌 줄눈은 모델링 추정값이다. [사진과 조사 기록](../../../data/research/gyeongbu_east.json) · [게임 화면](preview.jpg)

두 형상은 Blender 컬렉션으로 편집할 수 있다. 무대 안에서는 일반 색상·텍스처 타일에 합쳐진다. 편집한 원본에서 웹 형상을 다시 내보내는 명령은 다음과 같다.

```sh
blender -b assets/models/riverside-furniture/riverside-furniture.blend --python assets/models/riverside-furniture/build.py -- --export-current
```

네 장소 `gyeongbu_east gyeongbu jamwon_hangang hangang`를 함께 빌드해 스폰과 보행 연결을 확인했다. 두 담당 모듈의 상세 그룹까지 모두 빌드해 벽·경사·바닥·천장·지면 개구부 등록 인자를 비교했다. 모델을 교체하기 전과 후의 해시가 각각 일치했다.
