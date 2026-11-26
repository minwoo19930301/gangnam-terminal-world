# 신세계 강남점 9층 로보락

[일반 게임에서 시연대 보기](http://127.0.0.1:8765/?pos=-50.0415,40.6,76.70306&yaw=97.4914&pitch=-31#/shinsegae/9F) · [게임 화면](game.jpg) · [카메라 좌표](camera.json)

로보락은 저장된 강남점 신관 9층 층별안내에서 가전으로 분류된다. 2025년 2월 신세계백화점 제공 사진에는 흰 테두리를 두른 목재 시연판, 물통 손잡이를 들어 보이는 흰 도크, 센서탑이 달린 청소기와 하부를 노출한 비교 견본이 보인다. 사진 설명은 촬영 장소를 강남점 신관 9층으로 명시한다. [신세계 층별 안내](https://www.shinsegae.com/store/floor.do?storeCd=SC00002) · [사진과 설명](https://www.beyondpost.co.kr/view.php?ud=202502101122356665d2326fc69c_30)

본체 앞뒤와 하판은 S8 Max Ultra의 센서창, 사이드 브러시, 나선형 듀얼 롤러와 걸레판을 참고했다. 도크 옆에 본체를 하나 더 두어 도킹 상태와 상판을 함께 볼 수 있게 했다. 도크의 치수와 기기 간격, 안내 문구는 재구성했으며, 사진 속 모든 제품의 정확한 모델명이나 현재 재고는 확인되지 않았다. 목재 무늬는 절차적으로 생성해 원본에 내장했다. [제조사 카탈로그](https://kr.roborock.com/pages/roborock-s8-max-ultra) · [도크](https://kr.roborock.com/cdn/shop/files/s8maxultrac_section-35_Album8.jpg) · [상판](https://kr.roborock.com/cdn/shop/files/s8maxultrac_section-5_section3_rev.jpg) · [하판](https://kr.roborock.com/cdn/shop/files/s8maxultrac_section-5_section3_the.jpg)

## 편집과 배치

원본은 `gallery.blend`의 `SSG_9F_Roborock` 컬렉션이다. 개별 메시 194개를 편집할 수 있다. 단위는 미터이며 진열대 중앙 바닥이 원점이다. Blender의 +X는 매대를 바라보는 고객의 오른쪽, +Y는 매대 뒤쪽, +Z는 위쪽이다. glTF Y-up 변환 후 게임 기준 원점은 약 `(-51.356, 40.600, 76.879)`, 월드 +Y 회전은 `111.004°`다. 지형 보정까지 적용해 조립하는 경우 원점 높이는 `39.692 m`다.

게임용 GLB는 246,732바이트, 삼각형 23,910개, 메시·드로콜 각 3개다. 목재에만 UV를 남기고 작은 모서리의 분할 수를 줄였다. 충돌은 매대 본체에 맞췄다. 공용 로더가 간이 매대와 상세 메시를 등록하며, 같은 층 11m 이내에서 매대가 시야에 들어올 때 제품을 읽는다. 7층과 9층 원거리에서 각각 새로 시작했을 때 이 GLB 요청은 0건, 위 카메라에서는 1건이었다.

## 재생성

저장소 루트에서 Blender 3.6.23과 macOS 기본 글꼴 Apple SD Gothic Neo로 검증했다. 원본을 수정한 뒤에는 첫 명령 대신 `blender -b --gpu-backend opengl "$D/gallery.blend" --python-exit-code 1 -P "$D/export.py"`를 실행하고 같은 압축 단계를 거친다.

```sh
D=assets/models/ssg-robot-vacuum
blender -b --factory-startup --gpu-backend opengl --python-exit-code 1 -P "$D/build.py"
node "$D/pack.mjs"
node tests/smoke.mjs shinsegae
node tests/smoke.mjs gotomall shinsegae
```
