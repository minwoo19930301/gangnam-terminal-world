# 신세계 강남점 프레이트

[7층 일반 플레이 카메라](http://127.0.0.1:8765/?pos=-14.82936,31,74.84248&yaw=113.8884&pitch=-7#/shinsegae/7F) · [게임 화면](game.jpg) · [카메라 좌표와 상세 메시](camera.json)

강남점 7층 층별 안내에서 프레이트의 분류는 멘즈퍼니싱이다. 프레이트의 지점 사진에는 금속 행거, 구두를 놓은 낮은 받침, 적갈색 띠가 있는 다면 운동화 진열대가 보인다. 게임에서는 이 세 가지를 기존 매장에 맞춰 배치했다. 행거 간격과 치수, 신발 색상과 상품 순서는 추정했다. 사진 속 정면 티셔츠 자리에는 강남 한정 상품 두 벌을 걸어 가까이서 볼 수 있게 했다. [신세계 층별 안내](https://www.shinsegae.com/store/floor.do?storeCd=SC00002) · [프레이트 강남점 안내와 사진](https://fr8ight.co.kr/about.html#sp8) · [매장 사진 원본](https://cafe24.poxo.com/ec01/fr8ight/FWhqF6EEiriIIrJUL2aQ1+N+DmC6FoAkuha5DXDqAgEdYnaNDKJzmtJHxrTOsbInIBt9gBfKOeW5ti57LjEQbg==/_/images/gangnam.jpg)

- 에어포스 가죽 점퍼에는 양털 칼라, 금속 지퍼, 스냅 덮개 주머니 두 개와 신축성 있는 허릿단을 넣었다. 어깨 뒤쪽 요크와 팔꿈치 주름은 입체로 만들었다. [프레이트 상품 사진](https://fr8ight.co.kr/product/airforce-leather-jumper-black-fr8ight-gangnam-exclusive/13991/category/1899/display/1/)
- 유틸리티 실드 파카에는 블랙워치 체크, 가로 누빔, 후드 안감, 허리 조임끈, 덧주머니를 넣었다. 체크 원단은 직접 만든 반복 무늬다. [이스트로그 상품 사진](https://eastlogue.com/product/utility-shield-parka-blackwatch-check-waxed-fr8ight-gangnam-exclusive/2315/category/305/display/1/)

## 조립과 재생성

원본은 `gallery.blend`의 `SSG_7F_FR8IGHT` 컬렉션이다. 편집 가능한 메시 417개에 행거 3대, 아우터 2벌, 셔츠·티셔츠 16벌, 구두 11개와 운동화 4개가 포함된다. 단위는 미터이며 Blender +X는 행거 오른쪽, −Y는 의류 정면, +Z는 위다. glTF Y-up 변환 뒤 게임 +Y축 기준 110.888447° 회전한다. 실내 논리 원점은 (−16.623532, 31, 75.666334)이며 지형을 적용하는 전체 월드의 원점은 (−16.623532, 30.092, 75.666334)다.

Blender 3.6.23에서 제작하고 저장한 원본을 다시 열어 컬렉션과 내장 체크 이미지를 확인했다. 상호에는 Blender 기본 폰트를 사용했다. 저장소 루트에서 실행한다.

```sh
D=assets/models/ssg-fr8ight
"${GTW_BLENDER_BIN:-blender}" -b --factory-startup --gpu-backend opengl --python-exit-code 1 -P "$D/build.py"
node "$D/pack.mjs"
node tests/smoke.mjs shinsegae
node tests/smoke.mjs gotomall shinsegae
```

meshopt 압축본은 430,140바이트, 삼각형 39,804개, 상세 메시·재질 각 3개로 드로콜은 3회다. 같은 층 22m 안에서는 대체 진열을 한 번에 그리고, 11m 안에서 시야에 들어오면 상세 모델을 요청한다. 두 smoke 테스트 모두 OK였다. 일반 플레이에서 6층과 7층 원거리의 프레이트 GLB 요청은 각각 0건, 위 카메라에서는 1건이었다.
