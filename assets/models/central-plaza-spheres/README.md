# 센트럴시티 정문 광장의 세 구체

서쪽 구체에는 녹청 위로 긴 띠가 겹치고, 동쪽 구체는 짧은 수평 무늬로 덮여 있다. 가운데 구체는 갈색이며 표면을 따라 세로 결이 내려온다. 정면 거리뷰 두 장에서 인접 중심 사이 거리는 구체 지름의 약 1.8배다. 게임에서는 기존 지름 2.04m와 가운데 위치를 유지하고 중심 간격을 3.65m로 맞췄다. 무늬와 받침 치수는 사진에서 추정했다. [서울연구원 광장 사진](https://data.si.re.kr/photo/06o03212db30000) · [2022년 7월 정면](https://map.naver.com/p?c=18.00,0,0,0,adh&p=nuDLz2BbheMIjZ_ZXc2BRg,160,1,28,Float) · [2026년 1월 정면](https://map.naver.com/p?c=18.00,0,0,0,adh&p=FmNf2XmJtk1RjDP3k0TI7A,160,1,24,Float)

spheres.blend에는 세 구체와 각각의 낮은 받침이 있다. 서쪽 구체의 돌출 띠는 개별 원형 곡선으로 편집한다. 동쪽과 가운데 구체는 각자 다른 재질을 쓴다. 저장 후 다음 명령을 실행하면 띠의 방향·지름·폭과 재질 색을 게임에 반영한다.

```sh
blender -b assets/models/central-plaza-spheres/spheres.blend --python-exit-code 1 -P assets/models/central-plaza-spheres/build.py -- --export-current
```

게임은 둥근 메시 하나를 세 구체가 공유하고, 실제 보행 시야에 들어온 구체의 재질만 그린다. 별도 GLB 다운로드는 없다. 실내 배치 동기화는 기존 게임 구체에서 위치와 크기를 읽어 원본 세 컬렉션을 도시 장면에도 연결한다. [전후 비교](comparison.jpg) · [일반 보행 시점](camera.json)
