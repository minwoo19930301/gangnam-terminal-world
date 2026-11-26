# 경부선 본관 2층 침구와 4층 커튼

서울고속버스터미널 운영사가 공개한 층 사진을 보며 각 층의 진열 한 곳을 Blender에서 제작했다. 사진에는 촬영일·실측 치수·판매 수량이 없어 매대 좌표와 상품 크기·수량은 기존 가상 점포의 폭에 맞췄다. [운영사 층별 안내](https://exterminal.co.kr/floor.asp)

| 층 | 사진에서 확인한 것과 모델에 반영한 부분 | 접근 주소 |
| --- | --- | --- |
| 2층 | 앞에는 꽃무늬·연두색·분홍색 이불과 물방울·줄무늬 쿠션이 있다. 뒤에는 흰 침구 더미와 빨간 연희침구 간판이 보인다. 이불 옆의 말린 겹단, 다이아 누빔, 접힌 단, 쿠션의 볼륨과 파이핑을 각각 만들었다. [운영사 사진](https://exterminal.co.kr/images/n_floor02.jpg) | `#/gyeongbu/2F?p=73.647,6,20.841,115.04` |
| 4층 | 무지개장식 간판과 청록색 홈 문선, 묶은 주름 커튼, 무늬 속커튼, 작은 샹들리에와 황동 스탠드, 나무 팔걸이와 줄무늬 쿠션이 있는 의자가 보인다. 커튼의 묶이는 지점, 술, 고리, 속커튼의 작은 구멍과 원단 견본 선반을 제작했다. [사선 사진](https://exterminal.co.kr/images/n_floor04-new-1.jpg) · [정면 사진](https://exterminal.co.kr/images/n_floor04-new-2.jpg) | `#/gyeongbu/4F?p=73.647,16,20.841,115.04` |

[편집 원본](./homewares.blend)은 상품·집기·점포 부재를 각각 선택할 수 있다. 게임에서는 층마다 한 파일과 한 번의 그리기 호출로 표시한다. 같은 층에서 점포가 시야에 들고 중심까지 12m 안으로 접근하면 해당 파일을 요청한다. 16m 밖에서는 원래 가벼운 시장 매대 모델로 돌아간다.

```sh
blender -b --threads 2 -P assets/models/gyeongbu-homewares/build.py
blender -b assets/models/gyeongbu-homewares/homewares.blend --threads 2 -P assets/models/gyeongbu-homewares/export.py
```
