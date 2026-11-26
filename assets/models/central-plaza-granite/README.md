# 센트럴시티 조각 광장의 판석

붉은 원통형 벤치와 세 구체가 있는 광장에는 회색 판석 사이로 옅은 장밋빛 띠가 이어지고, 띠가 만나는 곳에는 어두운 판석이 놓인다. 서울연구원 사진으로 색과 무늬를 대조하고 2022년 보행 거리뷰와 2026년 도로 거리뷰로 장소를 확인했다. 판석과 줄눈의 치수 및 색은 사진을 보고 맞춘 값이다. [서울연구원 사진](https://data.si.re.kr/photo/06o03212db30000) · [2022년 보행 거리뷰](https://map.naver.com/p?c=18.00,0,0,0,adh&p=nuDLz2BbheMIjZ_ZXc2BRg,160,-8,80,Float) · [2026년 도로 거리뷰](https://map.naver.com/p?c=18.00,0,0,0,adh&p=FmNf2XmJtk1RjDP3k0TI7A,163,0,80,Float)

Blender 원본의 PlazaGraniteSwatch 컬렉션에는 판석 64장과 줄눈 바탕이 있다. 판석별 재질과 폭을 편집한 뒤 저장하고 저장소 루트에서 다음 명령을 실행하면 기존 광장 바닥에 적용된다.

```sh
blender -b assets/models/central-plaza-granite/plaza.blend --python-exit-code 1 -P assets/models/central-plaza-granite/build.py -- --export-current
```

게임은 판석 배치를 256×256 재질 하나로 그린다. 광장 기하와 충돌면은 기존 것을 사용한다. [낮·밤 전후 비교](comparison.jpg) · [보행 카메라 네 곳](camera.json)
