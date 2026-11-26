# 신세계 강남점 레고스토어

10층 완구 매장의 개점 전시를 재현했다. 신세계의 2023년 8월 현장 사진에서 푸빌라의 흰 브릭 몸통, 검은 귀와 코, 색동 모자, 빨간 목수건, 콜벳 완성품과 대형 미니피겨 상자를 확인했다. 레고 공식 매장 안내와 저장된 신세계 층별 안내 모두 이 매장을 10층에 둔다. [신세계 개점 기사](https://www.shinsegaegroupnewsroom.com/shinsegae-lego-store-meet-us/) · [전시 전경](https://images.shinsegaegroupnewsroom.com/wp-content/uploads/2025/08/shinsegae-lego-store-meet-us.jpg) · [푸빌라와 제품 접사](https://images.shinsegaegroupnewsroom.com/wp-content/uploads/2025/08/shinsegae-lego-store-meet-us_2.jpg) · [레고 강남점 안내](https://www.lego.com/en-us/stores/store/gangnam) · [신세계 층별 안내](https://www.shinsegae.com/store/floor.do?storeCd=SC00002)

푸빌라는 높이별로 편집할 수 있고 브릭 단차와 노출된 돌기가 옆면과 뒷면까지 이어진다. 콜벳 10321에는 네 개의 원형 전조등, 크롬 그릴, 흰 타이어 링과 열린 실내를 만들었다. 대형 미니피겨 40649에는 파란 모자 앞챙과 열린 노란 손을 달았다. 미니피겨의 조립 전시, 상자 일러스트, 진열 수량과 간격은 게임용 구성이다. 푸빌라의 실측 치수와 현재 매장 재고는 확인되지 않았다. [콜벳 제품](https://www.lego.com/en-us/product/corvette-10321) · [콜벳 접사](https://www.lego.com/cdn/product-assets/product.img.pri/10321_Prod.png) · [대형 미니피겨 제품](https://www.lego.com/en-us/product/up-scaled-lego-minifigure-40649) · [미니피겨 접사](https://www.lego.com/cdn/product-assets/product.img.pri/40649_Prod.png)

[일반 게임에서 전시 보기](http://127.0.0.1:8765/?pos=-64.12916,45.4,38.82886&yaw=119.3322&pitch=-13#/shinsegae/10F) · [실제 게임 화면](game.jpg) · [카메라](camera.json)

## 편집과 재생성

원본은 `gallery.blend`의 `SSG_10F_LEGO_Gangnam` 컬렉션이다. 개별 메시 363개와 내장 이미지 2개를 포함한다. 원점은 전시 바닥이며 단위는 미터다. Blender +X는 관람자의 오른쪽, +Y는 진열장 쪽, +Z는 위다. glTF Y-up 변환 후 게임 좌표 (-66.29662, 45.4, 40.04678)에 두고 월드 +Y축으로 111.00658° 돌린다. 지형 모드에서는 해당 위치의 지형 높이를 더한다.

저장소 루트에서 실행한다. Blender 3.6.23, AppleGothic과 Arial Bold를 사용했다. 상자 삽화는 저장소의 sharp로 생성한다.

```sh
D=assets/models/ssg-focal-gallery
node "$D/art.mjs"
"${GTW_BLENDER_BIN:-blender}" -b --factory-startup --gpu-backend opengl --python-exit-code 1 -P "$D/build.py"
node "$D/pack.mjs"
node tests/smoke.mjs shinsegae
```

게임 파일은 637,412바이트, 삼각형 49,724개, 드로 콜 4회다. 일반 시점에서 한 픽셀 미만으로 보이는 몸통 돌기는 일부 단에만 남겼다. 원본에는 모든 단의 돌기가 있다. 다른 층과 10층 토박스 앞에서는 이 파일의 요청이 없었고, 레고스토어 내부에서 파일을 요청한 뒤 매장 HUD와 전시를 확인했다.
