# 경부선 꽃도매상가 3층 생화 진열

동쪽 통로의 기존 3단 진열대 한 면에 놓인 절화 24통을 블렌더로 제작했다. 방문객이 촬영한 사진에서 노란 해바라기의 뾰족한 꽃잎과 넓은 잎, 흰 장미, 보라색 겹꽃과 연둣빛 봉오리, 흰 띠를 두른 필름 속 분홍 꽃다발을 확인했다. 짙은 사각 화통과 군청색 물통, 뒤집은 적갈색 화분 받침, 집게 달린 흰 카드, 겹쳐둔 빈 꽃통과 접은 종이도 함께 보인다. [현장 생화 사진](https://m.blog.naver.com/alouete/224445972609) · [한국관광공사 꽃도매상가 안내](https://access.visitkorea.or.kr/ms/detail.do?cotId=24460f10-a781-42ca-ac33-44dc8b4f82ae)

사진에 나온 계절 상품을 기존 게임의 상호 없는 생화 진열 한 곳에 모았다. 점포의 정확한 호수와 상품 구성, 줄기 수, 치수는 추정이다. 모델 속 카드에는 읽을 수 있는 가격을 적지 않았다. 원본 사진의 픽셀은 게임에 포함하지 않았다.

[편집 원본](./cutflowers.blend)은 꽃송이, 잎, 포장과 용기를 나누어 편집할 수 있다. 게임에서는 종류별로 같은 메시를 공유해 24통과 부속품을 여덟 번에 그린다. 진열대가 보이고 12m 안으로 다가오면 [근접용 GLB](./cutflowers.glb)를 한 번 요청한다. 16m 밖에서는 간략한 형상으로 돌아간다.

게임 주소는 `#/gyeongbu/3F?p=86.285,11,-16.001,-99.85`다.

```sh
blender -b --threads 2 -P assets/models/gyeongbu-cutflowers/build.py
blender -b assets/models/gyeongbu-cutflowers/cutflowers.blend --threads 2 -P assets/models/gyeongbu-cutflowers/export.py
```
