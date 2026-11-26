# 경부선 3층 꽃시장 바구니 진열

경부선 터미널 3층 꽃시장의 동쪽 화기·바구니 진열대를 보행자 눈높이에서 볼 수 있다. [주간 정면과 야간 측면 전후 비교](comparison.jpg) · [게임 촬영 위치](camera.json)

터미널 운영사의 층별 안내와 한국관광공사의 시장 소개가 꽃시장 위치와 판매 품목을 뒷받침한다. 프로젝트의 현장 사진 기록 Photo09에는 황갈색 바구니 옆에 놓인 적갈색·짙은 갈색 수납 바구니가 나온다. 게임에서는 기존 선반에 맞춰 32점을 배열했다. 짜임, 손잡이 모양, 개별 치수와 수량은 모델러가 해석했다. [터미널 층별 안내](https://exterminal.co.kr/floor.asp) · [한국관광공사 꽃시장 소개](https://english.visitkorea.or.kr/svc/contents/contentsView.do?vcontsId=73754) · [프로젝트 현장 기록](../../../data/research/gyeongbu.json)

## 편집과 배치

[baskets.blend](baskets.blend)의 FlowerMarketWicker 컬렉션에서 각 바구니를 따로 편집할 수 있다. 저장한 원본에서 아래 명령으로 게임 파일을 다시 내보낸다. build.py는 최초 모델을 재생성한다.

```sh
blender -b --factory-startup assets/models/gyeongbu-basket-display/baskets.blend --python-exit-code 1 -P assets/models/gyeongbu-basket-display/export.py
```

도시 배치 이름은 ‘경부선 화기·바구니 · 등바구니 진열’이다. 게임은 가까운 시야에서만 392,792바이트의 메시를 요청한다. 정면과 측면에서 각각 요청 1회와 드로콜 1개 증가를 확인했다. 등진 시야, 9.8m 밖, 같은 위치의 2층에서는 낮과 밤 모두 요청이 없었다. 저화질로 같은 통로를 왕복한 짧은 전후 4회 측정은 모두 3층 바닥 높이를 유지했고 프레임 간격 p95는 16.7~16.8ms, p99는 16.8ms였다.
