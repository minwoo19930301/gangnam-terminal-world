# 센트럴시티 조각 광장의 판석

붉은 원통형 벤치와 세 구체가 있는 광장에는 회색 판석 사이로 옅은 장밋빛 띠가 이어지고, 띠가 만나는 곳에는 어두운 판석이 놓인다. 서울연구원 사진으로 색과 무늬를 대조하고 2022년 보행 거리뷰와 2026년 도로 거리뷰로 장소를 확인했다. 판석과 줄눈의 치수 및 색은 사진을 보고 맞춘 값이다. [서울연구원 사진](https://data.si.re.kr/photo/06o03212db30000) · [2022년 보행 거리뷰](https://map.naver.com/p?c=18.00,0,0,0,adh&p=nuDLz2BbheMIjZ_ZXc2BRg,160,-8,80,Float) · [2026년 도로 거리뷰](https://map.naver.com/p?c=18.00,0,0,0,adh&p=FmNf2XmJtk1RjDP3k0TI7A,163,0,80,Float)

Blender 원본의 PlazaGraniteSwatch 컬렉션에는 판석 64장과 줄눈 바탕이 있다. 판석별 재질과 폭을 편집한 뒤 저장하고 저장소 루트에서 다음 명령을 실행하면 기존 광장 바닥에 적용된다.

```sh
blender -b assets/models/central-plaza-granite/plaza.blend --python-exit-code 1 -P assets/models/central-plaza-granite/build.py -- --export-current
```

게임은 판석 배치를 256×256 재질 하나로 그린다. 광장 기하와 충돌면은 기존 것을 사용한다. [낮·밤 전후 비교](comparison.jpg) · [보행 카메라 네 곳](camera.json)

통합 Blender 파일에서는 **반포 · 도시 전경 → 센트럴시티 광장 · 구체 조형물 → 센트럴시티 정문 · 장밋빛 띠와 회색 판석**에서 광장 전체 포장을 편집할 수 있다. 원본 견본의 재질을 링크하며, 줄눈과 판석이 맞물리는 모서리는 같은 지형 정점을 쓴다. 돌의 색은 원본 재질을 수정하면 반영된다. 견본에서 판재 폭이나 배치를 바꾼 뒤에는 다음 명령으로 도시의 판석을 다시 맞춘다. [통합 Blender에서 본 포장 전후](city.jpg)

```sh
blender -b assets/models/world/gangnam-terminal.blend --python-exit-code 1 -P assets/models/central-plaza-granite/mount.py -- --update-court
```
