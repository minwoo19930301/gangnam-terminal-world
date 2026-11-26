# JW 메리어트 서울 2층 파티세리

호텔 다이닝 안내와 판매 품목을 참고해 쇼케이스 가운데에 바닐라 플랑과 한 조각, 마카롱 선물 상자를 놓았습니다. 윗면의 구움색, 잘린 커스터드 단면, 접시 테두리, 마카롱 껍질과 크림은 Blender에서 따로 편집할 수 있습니다. 케이크 크기, 상자 색, 진열 순서는 게임에 맞춘 구성입니다. [호텔 다이닝 안내](https://www.marriott.com/en-us/hotels/seljw-jw-marriott-hotel-seoul/dining/) · [호텔의 플랑 메뉴](https://www.marriott.com/offers/earn-redeem-dining-OFF-211363/SELJW-seljw-jw-marriott-hotel-seoul) · [방문자의 매장 진열 기록](https://www.diningcode.com/profile.php?rid=MfZOKfQVZzoU)

가까운 플레이어의 시야에 진열대가 들어오면 [웹용 모델](desserts.glb)을 한 번 받습니다. 유리와 선반은 먼저 그려지고, 상품은 한 번에 그립니다. [일반 게임 화면](display.jpg)

원본 생성과 웹용 내보내기는 저장소 루트에서 실행합니다.

```sh
blender -b --python-exit-code 1 -P assets/models/patisserie/build.py
```

이미 편집한 [Blender 파일](patisserie.blend)을 내보낼 때는 아래 명령을 사용합니다.

```sh
blender -b assets/models/patisserie/patisserie.blend --python-exit-code 1 -P assets/models/interior-architecture/export.py
node assets/models/patisserie/pack.mjs assets/models/patisserie/desserts.glb
```
