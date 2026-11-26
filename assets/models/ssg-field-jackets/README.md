# 신세계 강남점 7층 바버

[일반 게임 카메라](../../../?pos=-50.12264751,31,75.04551243&yaw=-174.21997097&pitch=-12#/shinsegae/7F) · [같은 자리의 게임 화면](game.jpg) · [재현용 좌표](camera.json)

신세계 층별 안내의 7층 멘즈 컨템포러리 매장이다. 강남점 바버가 공개한 사진을 보고 세이지색 벽 몰딩, 황동 행거, 다리 세 개가 벌어진 높낮이 다른 원형 테이블, 체크 러그, 모자와 목도리를 착용한 마네킹 두 구를 배치했다. 집기 치수와 간격은 게임 매장 폭에 맞춰 추정했다. [신세계 강남점 층별 안내](https://www.shinsegae.com/store/floor.do?storeCd=SC00002) · [지점이 제공한 사진과 주소](https://m.shopma.net/m_content.asp?id=2419972) · [사진 원본](https://date.shopma.net/images/cosajin/202608/20260812131057ppunny.jpg)

사진 앞줄의 패딩 자리에 올리브색 클래식 비데일(MWX0010OL71)을 걸었다. 카탈로그의 앞·뒤·목깃·주머니 사진을 따라 라글란 절개선, 골덴 칼라, 타탄 안깃, 황동 링 지퍼, 비스듬한 손주머니와 스냅 두 개로 닫는 벨로즈 주머니를 만들었다. 주머니 옆폭, 앞판과 덮개는 각각 편집할 수 있다. 옆 행거의 색상 순서와 테이블 위 소품은 사진을 바탕으로 단순화했다. [바버 공식 제품 사진과 사양](https://www.barbour.com/gb/classic-bedale%C2%AE-waxed-jacket-MWX0010OL7148.html)

## 원본 조립과 빌드

원본은 `gallery.blend`의 `SSG_7F_Barbour` 컬렉션이며 편집 가능한 메시 409개와 내장 재질 이미지 한 장을 담았다. 단위는 미터다. Blender의 +X는 진열대 오른쪽, −Y는 손님 쪽, +Z는 위다. glTF Y-up 변환 후 게임 Y축으로 −159.219971° 회전한다. 실내 배치 원점은 (−50.268063, 31, 77.368195), 지형이 적용되는 전체 월드의 원점은 (−50.268063, 30.092, 77.368195)다.

Blender 3.6.23과 저장소의 Node 패키지로 제작했다. 상호는 macOS의 Georgia Bold를 메시로 바꿔 저장했다. 해당 글꼴이 없는 환경에서 다시 제작하면 Blender 기본 글꼴을 사용한다. 저장소 루트에서 실행한다.

```sh
D=assets/models/ssg-field-jackets
"${GTW_BLENDER_BIN:-blender}" -b --factory-startup --gpu-backend opengl --python-exit-code 1 -P "$D/build.py"
node "$D/pack.mjs"
node tests/smoke.mjs shinsegae
node tests/smoke.mjs gotomall shinsegae
```

런타임 GLB는 512,164바이트, 삼각형 32,502개, 상세 드로콜 3회다. 원본 아틀라스는 무손실로 보관하고 게임용 아틀라스는 JPEG 4:4:4로 압축했다. 일반 게임에서 9층 같은 좌표와 7층 원거리의 GLB 요청은 각각 0건, 위 카메라에서는 1건이었다. 대체 진열은 공유 로더의 22m 범위에서 한 번에 그리며, 11m 안에서 시야에 들어오면 상세 모델을 요청한다.
