# 신세계 강남점 콜렉트

신관 6층 남성 부티크 층의 패션소품 매장이다. 게임에 있던 콜렉트 구획의 옷걸이를 안경 진열장으로 바꿨다. [신세계 공식 층별 안내](https://www.shinsegae.com/store/floor.do?storeCd=SC00002) · [강남점 6층 안내도](https://www.shinsegae.com/cms12/SC00002/guide/floor/__icsFiles/afieldfile/2026/10/22/ogKqbBuYpuah.png)

[일반 플레이에서 열기](../../../?pos=-8.849971,26.2,82.935094&yaw=-79.137901&pitch=-10#/shinsegae/6F) · [진열장 전경](game.jpg) · [안경테 비교](frames.jpg) · [안경함 근접 화면](case.jpg)

## 사진에서 옮긴 부분

- 강남점 안쪽 벽의 검은 COLLECT 글자, 목재 패널, 주황색 안감과 선반 아래 조명을 옮겼다. 양옆에는 세로 피팅 거울을 달고 유리 쇼케이스 아래에는 서랍과 가는 금속 테를 둘렀다. [콜렉트 강남점 매장 소개](https://collecteyewear.imweb.me/102) · [정면 사진](https://cdn.imweb.me/thumbnail/20240216/d9dc3f2d54296.jpg) · [거울과 서랍 상세](https://cdn.imweb.me/thumbnail/20240216/6e9f9baac5c81.jpg)
- 자주색 안경함에는 크림색 칸막이와 경첩, 거울 뚜껑을 만들고 무테 선글라스 여섯 점을 놓았다. 유리 덮개 아래와 벽 선반까지 합쳐 안경은 50점이다. [강남점 안경함 근접 사진](https://cdn.imweb.me/thumbnail/20240215/70d04523e491d.jpg)
- 카메만넨 99의 원형 금속 림과 낮은 코받침, 3006의 평평한 윗선, 7700의 두꺼운 아세테이트 브리지와 앞면 리벳을 제품 사진에서 비교했다. 다리와 귀팁의 굵기, 패드 암, 경첩 핀에도 차이를 뒀다. NAS World의 판매점 목록에서 콜렉트 강남점을 확인했다. 개별 모델의 당일 재고와 색상, 진열 수량, 가구 치수는 추정이다. [판매점 목록](https://www.nas-world.com/Shops) · [99](https://www.kamemannen.com/en/item/99) · [3006](https://www.kamemannen.com/en/item/30_06) · [7700](https://www.kamemannen.com/en/item/77_00)

거울은 고정 시점에서 모델의 진열장과 안경을 향해 광선을 추적해 구운 이미지다. 무늬목 결, 선반 조명, 거울에 비치는 주변 마감은 절차적으로 생성했다.

## 원본 조립과 재생성

`gallery.blend`의 `SSG_6F_Collect` 컬렉션에 편집 가능한 메시 1,021개와 내장 이미지 2장이 있다. 단위는 미터다. Blender +X는 진열장 오른쪽, −Y는 손님 방향, +Z는 위다. glTF Y-up 변환 뒤 게임 +Y축으로 −69.137901° 회전한다. 실내 논리 원점은 (−5.858730, 26.2, 82.865276)이며 지형 보정을 켠 월드의 원점은 (−5.858730, 25.292, 82.865276)이다.

Blender 3.6.23에서 생성과 원본 재개방을 확인했다. 글자는 Blender 내장 Bfont를 쓴다. 저장소 루트에서 실행한다.

```sh
D=assets/models/ssg-eyewear
"${GTW_BLENDER_BIN:-blender}" -b --factory-startup --gpu-backend opengl --python-exit-code 1 -P "$D/build.py"
node "$D/pack.mjs"
node tests/smoke.mjs shinsegae
node tests/smoke.mjs gotomall shinsegae
```

상세 GLB는 587,216바이트, 50,608삼각형, 메시·재질 각 5개로 드로콜 5회다. 안경의 다리와 코받침에서 중복 면을 줄이는 과정은 내보낸 모델에만 적용한다. 같은 층 22m 안에서는 단순 집기를 한 번에 그리고, 11m 안에서 화면에 들어오면 상세 모델을 요청한다. 일반 플레이에서 같은 좌표의 7층과 멀리 떨어진 6층 브루넬로 쿠치넬리에서는 해당 GLB 요청 0건, 콜렉트 전경에서는 1건을 확인했다. 두 smoke 테스트 모두 OK였다. 재현 좌표와 상세 메시 이름은 [camera.json](camera.json)에 있다.
