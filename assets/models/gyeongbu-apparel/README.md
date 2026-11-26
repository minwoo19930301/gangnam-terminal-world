# 경부선 6–8층 도매 의류

운영사가 게시한 각 층의 사진을 참고해 입구 쪽 한 점포씩 상품을 모델링했다. 점포 외곽과 행거·매대 위치는 기존 모델을 이용했고, 사진으로 판독할 수 없는 상호·호수·브랜드는 추가하지 않았다. 사진의 촬영일, 실제 점포와 모델 좌표의 대응, 의류 치수와 수량은 확인되지 않았다.

| 층 | 사진에서 확인한 상품과 모델에 반영한 특징 | 운영사 사진 |
| --- | --- | --- |
| 6층 | 밝은 아동 드레스, 배색 상하복, 선반에 묶어 쌓은 상품. 주름 치마, 퍼프소매, 둥근 칼라, 나비 리본과 원단의 접힌 모서리를 제작했다. | [6층 아동복](https://exterminal.co.kr/images/floor06.jpg) |
| 7층 | 짙은 재킷과 빨간 넥타이·흰 포켓치프, 줄무늬 넥타이 진열. 양복의 겹친 앞섶·노치 라펠·소매와 넥타이 걸이를 제작했다. | [7층 신사복](https://exterminal.co.kr/images/floor07.jpg) |
| 8층 | 목이 보이는 마네킹의 회색 털 칼라 외투, 붉은 외투와 주황색 카디건, 프린트 옷과 집게 바지. 후드 털, 누빔, 지퍼와 옆주머니를 제작했다. | [8층 여성복](https://exterminal.co.kr/images/floor08.jpg) |

[편집 원본](./apparel.blend)에는 세 점포가 나란히 있다. 게임은 카메라가 같은 층의 진열을 바라보며 12m 안으로 접근할 때 그 층의 GLB만 요청한다. 16m 바깥에서는 기존 매대 메시를 재사용한다.

| 층 | 게임 주소 |
| --- | --- |
| 6층 | `#/gyeongbu/6F?p=73.647,25,20.841,115.04` |
| 7층 | `#/gyeongbu/7F?p=73.647,29.5,20.841,115.04` |
| 8층 | `#/gyeongbu/8F?p=73.647,34,20.841,115.04` |

```sh
blender -b --threads 2 -P assets/models/gyeongbu-apparel/build.py
blender -b assets/models/gyeongbu-apparel/apparel.blend --threads 2 -P assets/models/gyeongbu-apparel/export.py
```
