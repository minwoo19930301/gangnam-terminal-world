# 신세계 강남점 9층 셰에라자드

[게임에서 청음대 보기](http://127.0.0.1:8765/?pos=-49.63539,40.6,54.57063&yaw=118.1762&pitch=-7#/shinsegae/9F) · [게임 화면](game.jpg) · [카메라 좌표](camera.json)

신관 9층 가전 매장의 드비알레·보스·셰에라자드·제네바 공동 구획에 청음대 하나를 배치했다. 입점과 청음 운영은 [신세계 층별 안내](https://www.shinsegae.com/store/floor.do?storeCd=SC00002), [셰에라자드 매장 안내](https://www.schezade.co.kr/map.html), [신세계 오디오파일 개점 보도자료](https://www.shinsegaegroupnewsroom.com/shinsegae-department-store-opens-audio-editing-store-audiophile/)에서 확인할 수 있다.

[강남점 헤드폰 진열 사진](https://images.shinsegaegroupnewsroom.com/wp-content/uploads/2025/11/NR_Press_Details_Dep01.png)에 보이는 목재 격자, 밝은 무늬 패널, 헤드폰 위 제품 카드를 옮겼다. [같은 매장의 근접 사진](https://images.shinsegaegroupnewsroom.com/wp-content/uploads/2025/11/NR_Press_Details_Dep02.png)은 작은 목재 받침의 마감 참고자료다. 벽걸이 12개와 상판 청음용 2개는 [Audeze LCD-2 Classic](https://www.audeze.com/products/lcd-2-classic)의 이중 밴드·개방형 그릴과 [Bose QuietComfort Ultra](https://www.bose.com/pressroom/bose-unveils-the-next-generation-of-the-quietcomfort-ultra-headphones)의 밀폐형 컵·밝은 색상을 참고했다. 상판 중앙의 DAC는 [Chord Mojo 2](https://chordelectronics.co.uk/product/mojo-2)의 네 개 조작구를 본뜬 소품이다. DAC 기종의 지점 전시 여부는 미확인이다. 제품 수량, 하부장 치수, 케이블 경로와 자개빛 무늬는 게임용으로 구성했다.

## 편집과 배치

`gallery.blend`의 `SSG_9F_Scheherazade` 컬렉션에 개별 메시 409개가 들어 있다. 단위는 미터이며 원점은 하부장 중앙 바닥이다. Blender +X는 고객의 오른쪽, +Y는 배면, +Z는 위다. glTF Y-up 변환 후 게임 좌표 **(-51.3229, 40.6, 55.4766)** 부근에 두고 월드 +Y축으로 **110.97694°** 돌린다. 지형 모드에서는 엔진의 해당 지점 지형 높이를 더한다.

게임 자산은 **291,036바이트, 삼각형 41,186개, 드로 콜 2회**다. 간이 진열대는 1회로 묶이며 인접 시야에서 상세 모델을 불러온다. 8층과 9층 원거리 시작 화면에서 이 GLB 요청이 없었고 청음대 앞에서 요청을 확인했다.

## 다시 만들기

저장소 루트에서 실행한다. Blender 3.6.23과 내장 Bfont를 사용했다. macOS 헤드리스 환경에서는 OpenGL 백엔드로 검증했다.

```sh
D=assets/models/ssg-audio
blender -b --factory-startup --gpu-backend opengl --python-exit-code 1 -P "$D/build.py"
node "$D/pack.mjs"
node tests/smoke.mjs shinsegae
node tests/smoke.mjs gotomall shinsegae
```
