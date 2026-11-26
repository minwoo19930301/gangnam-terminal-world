# 경부선 승차홈의 고속버스 차창

[편집할 Blender 원본](./cabin.blend)에는 앞쪽 8줄의 2+1 좌석과 뒷줄의 네 좌석, 팔걸이와 접이식 테이블, 선반, 묶은 주름 커튼이 들어 있다. 카메라 두 대로 양쪽 창 바깥에서 각각 렌더해 [차창 이미지](./windows.webp)에 담았다. 정차한 버스마다 승객석 메시를 복제하지 않고 기존 유리 면에서 좌우에 맞는 영상을 사용한다. 처음 차창이 시야에 들어오고 26m 안에 있을 때 한 번 받아 온다.

좌석의 머리 덮개와 측면 볼스터의 색·구조는 현대 유니버스 공개 자료를 참고했다. 게임의 주차 위치와 차체에 맞춰 재구성한 실내이며 각 차량의 연식이나 실제 사업자의 좌석 배치를 확인한 것은 아니다. [현대자동차 유니버스](https://www.hyundai.com/kr/ko/c/products/bus/universe) · [2026년 카탈로그](https://www.hyundai.com/ccontents/carmng/CP00000011/universe-2026-01-catalog.pdf)

[승차홈에서 본 모습](./platform.jpg). 게임 주소는 `/?pos=121.1767,0,27.5406&yaw=-53.552&pitch=8#/gyeongbu/1F`다.

```sh
blender -b --factory-startup -t 2 --python-exit-code 1 -P assets/models/coach-cabin/build.py
node assets/models/coach-cabin/check.mjs
```
