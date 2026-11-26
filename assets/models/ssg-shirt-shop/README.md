# 신세계 강남점 에르노 남성 매장

6층 에르노의 2026년 10월 개점 사진에 나온 목재 선반과 금속 칸막이, 마네킹 착장, 가로로 누빈 패딩, 낮은 유리 진열장을 게임의 기존 매장 안에 재구성했다. 7층 셔츠 매장은 해당 지점의 진열 사진을 확인하지 못해 6층 에르노를 선택했다.

[일반 게임 카메라](../../../?pos=-41.53,26.2,-16.2&yaw=-56&pitch=-5#/shinsegae/6F) · [실제 게임 화면](game.jpg) · [조립 및 카메라 정보](camera.json)

## 자료와 구현 범위

- 신세계인터내셔날의 강남점 개점 사진 두 컷에서 후면과 측면의 행거, 높이가 다른 중앙 선반, 조명 띠, 캡을 쓴 마네킹, 접은 옷을 놓은 진열장의 위치 관계를 읽었다. [개점 기사](https://www.shinsegaegroupnewsroom.com/herno-first-mens-standalone-store-shinsegae-gangnam/) · [강남점 사진 원본](https://images.shinsegaegroupnewsroom.com/wp-content/uploads/2026/10/NR_Press_Details-23.png)
- 공식 층별 안내와 저장된 안내 자료에서 6층 에르노를 확인했다. 남성 전용 매장에는 패딩·셔츠·니트·테일러링이 함께 소개된다. [신세계 강남점 층별 안내](https://deptmapp.shinsegae.com/store/floor.do?storeCd=SC00002)
- HERO 제품의 정면·측면과 소매 확대 사진을 보고 후드 안감, 눌린 퀼팅 봉제선, 사선 주머니와 소매 지퍼를 만들었다. 셔츠형 재킷의 칼라 끝과 소맷단은 라미나 셔켓 자료를 참고했다. 사진 속 개별 상품의 품번, 행거 수량, 실제 집기 치수와 현재 재고는 확인되지 않아 게임 공간에 맞춰 연출했다. [HERO 다운](https://www.herno.com/en-us/men/outerwear/parkas-and-jackets/hero-down-jacket-in-glossy-nylon-PI001416U129733950.html) · [소매 확대](https://www.herno.com/dw/image/v2/BGDG_PRD/on/demandware.static/-/Sites-33/default/dw14c38df8/images/zoom/PI001416U12973_3950_2.jpg) · [라미나 셔켓](https://www.herno.com/en/gadget-men-laminar/laminar-shacket-in-tech-crinkle-olive-green-CM00009UL128277305.html)

## 원본과 배치

Blender 3.6.23에서 작성하고 다시 열어 확인했다. `gallery.blend`의 `SSG_6F_HERNO_MENS` 컬렉션 안에 편집 가능한 메시 400개와 내장 목재 무늬가 있다. 상호는 Blender 기본 글꼴이다. 가로 행거 두 칸과 옆면 행거 한 칸에 겉옷 17벌, 단상에 마네킹 착장 1벌을 배치했다.

컬렉션 원점은 후면 장 하단 중앙이며 단위는 미터다. Blender +X는 선반 오른쪽, −Y는 고객 쪽, +Z는 위다. glTF 축 변환 후 게임 Y축으로 −69.160591° 회전한다. 월드 원점은 (−37.540155, 28.622377, −18.496835)이며 층 기준 높이 26.2m에 지형 보정이 포함돼 있다.

## 재생성 및 검증

저장소 루트에서 실행한다. 3.6 계열 macOS 헤드리스 실행에는 OpenGL 백엔드를 사용했다.

```sh
D=assets/models/ssg-shirt-shop
"${GTW_BLENDER_BIN:-blender}" -b --factory-startup --gpu-backend opengl --python-exit-code 1 -P "$D/build.py"
node "$D/pack.mjs"
node tests/smoke.mjs shinsegae
node tests/smoke.mjs gotomall shinsegae
```

게임용 GLB는 590,004바이트, 삼각형 53,988개, 메시·재질 각 4개로 상세 진열에 4회의 드로콜을 쓴다. 목재 이미지를 JPEG로 저장하고 퀼팅의 중간 단면을 줄여 최종 압축 전 비교본(690,980바이트)보다 100,976바이트 줄였다. 원본의 편집 메시를 보존했다.

공용 진열 로더가 같은 층 22m 안에서 간략 진열을 표시하고 11m 안에서 진열이 시야에 들어올 때 상세 파일을 요청한다. 일반 게임에서 7층과 6층 투미 앞에서는 에르노 GLB 요청이 0건이었고, 위 좌표에서 1건이었다. 최종 화면 HUD는 ‘에르노 · 6F’였다.
