# 신반포로 신세계 정문 앞 전정수목

정문 서쪽 도로 경계에는 회색 사각 화분과 낮게 전정한 상록수가 줄지어 있다. 2024년 5월과 2026년 1월 거리뷰에서 같은 형태를 확인했다. 위로 벌어진 줄기, 납작한 잎 묶음, 화분 상단의 돌출 테두리와 흙을 Blender에서 따로 편집할 수 있다. 네 그루를 게임에 이미 있는 보도 경계에 맞췄다. 수종과 실제 규격은 확인되지 않아 사진 속 비례로 모델링했다. [2024년 5월 거리뷰](https://map.naver.com/p?c=18.00,0,0,0,adh&p=C3Z8qXjbbb48umBnud5YMw,-170,8,80,Float) · [2026년 1월 거리뷰](https://map.naver.com/p?c=18.00,0,0,0,adh&p=lHsXW6lxT97x-yAj0PFdXA,-125,0,80,Float)

[게임 낮·밤 비교](comparison.jpg) · [근거리 시점](https://minwoo19930301.github.io/gangnam-terminal-world/?pitch=-5#/street?p=-95.9,0,-65.4,43.958) · [보도를 따라 보는 시점](https://minwoo19930301.github.io/gangnam-terminal-world/#/street?p=-91.7,0,-68,101.848,0)

네 화분은 한 번에 그린다. 먼 형상은 그루당 144면, 가까운 형상은 1,729면이다. 열의 중심에서 29m 안으로 접근해 화면에 들어오면 48,904바이트 GLB 한 개를 읽고, 돌아오는 길에는 같은 모델을 재사용한다. 지하와 백화점 8층에서는 전용 모듈과 GLB의 요청이 모두 0건이었다. 석재와 잎은 장면의 조명을 받고 낮과 밤 모두 같은 재료를 쓴다.

편집 원본은 [planter.blend](planter.blend)의 `SinbanpoPlazaPlanter` 컬렉션이다. 석재의 잔골재 무늬도 원본에 들어 있다. 편집 후 다음 명령으로 게임용 모델을 내보낸다.

```sh
blender -b assets/models/sinbanpo-plaza-planters/planter.blend --python-exit-code 1 -P assets/models/sinbanpo-plaza-planters/build.py -- --export-current
```
