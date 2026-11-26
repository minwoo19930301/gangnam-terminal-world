# 신세계 강남점 브루넬로 쿠치넬리 남성 부티크

[6층 일반 플레이 카메라](http://127.0.0.1:8765/?pos=-70.57201,26.2,10.67837&yaw=113.8545&pitch=-3#/shinsegae/6F) · [게임 촬영 화면](game.jpg) · [카메라 좌표와 메시 이름](camera.json)

신세계는 강남점 본관 6층 남성 단독 매장의 개점 사진을 공개했다. 밝은 벽감 안에 가로로 건 행거, 위 선반의 액자, 원목 바닥과 패브릭 의자가 보인다. 게임에서는 기존 6층 매장 안에 벽감 두 칸을 두고 세 벌은 정면으로, 여섯 벌은 비스듬히 걸었다. 액자 그림, 치수와 진열 순서는 사진을 참고해 구성했다. 당시 사진으로 현재 재고나 가구 배치까지 확인할 수는 없다. [신세계 강남점 층별 안내](https://www.shinsegae.com/store/floor.do?storeCd=SC00002) · [신세계 개점 기사](https://www.shinsegaegroupnewsroom.com/brunello-cucinelli-new-world-gangnam/) · [강남점 실내 원본 사진](https://images.shinsegaegroupnewsroom.com/wp-content/uploads/2025/08/brunello-cucinelli-new-world-gangnam.jpg)

- 카발로 홉색 재킷은 모래색 몸판 위에 노치 라펠을 겹쳤다. 가슴 포켓, 티켓 포켓, 소매의 뿔단추와 뒤트임을 따로 모델링했다. [브루넬로 쿠치넬리 카발로 재킷](https://shop.brunellocucinelli.com/en-us/men/ready-to-wear/blazers/hopsack-deconstructed-blazer-261MZ4037BWDC042.html)
- 캐시미어 크루넥은 목둘레를 낮게 파고 몸판과 소매에 세로 골을 넣었다. 소맷단에는 가는 배색 선을 둘렀다. [브루넬로 쿠치넬리 잉글리시 립 니트](https://shop.brunellocucinelli.com/en-us/men/ready-to-wear/knitwear/cashmere-english-rib-sweater-262M2229510CW42510.html)
- 스웨이드 봄버는 매끈한 몸판에 골지 소매와 후드를 붙였다. 양방향 지퍼의 체인과 위아래 손잡이, 비스듬한 주머니도 입체로 만들었다. [브루넬로 쿠치넬리 스웨이드 봄버](https://shop.brunellocucinelli.com/en-gb/men/ready-to-wear/coats-jackets/suede-bomber-jacket-with-quilting-262MPCLF2053CIW1906.html) · [옆모습과 소매 사진](https://n.nordstrommedia.com/it/d761ec15-ab19-407d-be7e-627d06ae66e9.jpeg)

## 원본 조립과 재생성

`gallery.blend`의 `SSG_6F_Brunello_Cucinelli` 컬렉션에 편집 가능한 메시 오브젝트 528개가 있다. 미터 단위이며 Blender +X는 보조 행거 방향, −Y는 의류 정면, +Z는 위다. glTF Y-up 변환 뒤 게임 +Y축으로 110.992104° 회전한다. 논리 루트 (−72.771492, 26.2, 11.644942)에 지형 보정 3.16m를 적용한 전체 월드 렌더 루트는 (−72.771492, 29.36, 11.644942)다.

Blender 3.6.23 헤드리스에서 제작·재개방을 확인했다. 상호 글자는 Blender 내장 폰트를 사용한다. 저장소 루트에서 실행한다.

```sh
D=assets/models/ssg-designer-menswear
"${GTW_BLENDER_BIN:-blender}" -b --factory-startup --gpu-backend opengl --python-exit-code 1 -P "$D/build.py"
node "$D/pack.mjs"
node tests/smoke.mjs shinsegae
node tests/smoke.mjs gotomall shinsegae
```

옆으로 걸린 옷은 정면 진열보다 골의 수를 줄였다. meshopt 압축 후 GLB는 481,164바이트, 삼각형 50,128개, 불투명 메시·재질 각 4개, 드로콜 4회다. 같은 층 22m 안에서는 대체 진열을 한 번에 그리며 11m 안에서 화면에 들어오면 상세 모델을 요청한다. 일반 플레이에서 7층 같은 위치와 6층 로로피아나에서는 해당 요청이 0건, 촬영 위치에서는 1건이었다. 두 smoke 테스트 모두 OK였다.
