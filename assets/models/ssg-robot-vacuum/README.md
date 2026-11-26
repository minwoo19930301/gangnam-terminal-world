# 신세계 강남점 9층 로보락

2025년 2월 신세계백화점 제공 사진을 보면 흰 테두리 안에 나무 시연판이 있고, 왼쪽에는 낮은 도크와 하판을 들어 보인 본체가 있다. 오른쪽에는 손잡이 하나를 세운 물통형 도크가 있다. 물통형 정면에 붙인 붉은 설명 카드 두 장, 낮은 도크 위의 사양표, 둥근 양 끝에 금색 테두리를 댄 상호 표지도 사진을 참고했다. [강남점 층별 안내](https://www.shinsegae.com/store/floor.do?storeCd=SC00002) · [신세계 제공 매장 사진과 설명](https://www.beyondpost.co.kr/view.php?ud=202502101122356665d2326fc69c_30) · [강남점 원본 사진 1,200px](https://img.etoday.co.kr/pto_db/2025/02/20250207173332_2134256_1200_900.jpg)

물통형과 낮은 직배수형의 형상은 제조사 S8 Max Ultra 자료를 참고했다. 사진 속 기기별 정확한 품번은 확인되지 않았다. 시연 하판에 두 색의 나선 롤러, 카세트 잠금 탭, 반달 걸레와 작은 원형 보조 걸레, 구동 바퀴, 캐스터와 접점을 넣었다. 실제 보이는 큰 글자 아래의 아이콘, 시연 사양표, 걸레 직조와 나뭇결은 새로 그렸다. 기존 게임 매대 폭에 맞춰 제품 사이 간격을 정했다. [제품·도크 및 제조사 치수](https://kr.roborock.com/pages/roborock-s8-max-ultra) · [윗면](https://kr.roborock.com/cdn/shop/files/s8maxultrac_section-5_section3_rev.jpg) · [하판](https://kr.roborock.com/cdn/shop/files/s8maxultrac_section-5_section3_the.jpg) · [낮은 직배수형](https://us.roborock.com/products/roborock-s8-max-ultra-with-refill-drainage-system/insideClient)

[일반 게임 진입](../../../?pos=-50.0415,40.6,76.70306&yaw=97.4914&pitch=-31#/shinsegae/9F) · [하판 가까이 보기](../../../?pos=-50.38259,40.6,77.12655&yaw=111.7997&pitch=-43.9851#/shinsegae/9F) · [게임 화면](game.jpg) · [두 자리의 일반 보행 시야](counter-walk.jpg) · [Blender 집기와 시연 하판](dock-and-underbody.jpg) · [카메라 좌표](camera.json)

## 편집과 배치

`gallery.blend`의 `SSG_9F_Roborock`에 편집 메시 402개와 내장 이미지 두 장이 있다. 단위는 미터이며 진열대 중앙 바닥이 원점이다. Blender +X는 손님의 오른쪽, +Y는 매대 뒤쪽, +Z는 위쪽이다. glTF Y-up 변환 뒤 월드 원점은 약 (−51.356, 40.600, 76.879), 월드 +Y 회전은 111.004°이다. 지형 보정을 적용한 원점 높이는 39.692m다.

매대·제품·인쇄물을 3개 메시, 3회 그리기로 합쳤다. 금속 문 두 장의 게임용 표면에는 시연 기기와 매대에서 반사되는 색을 부드럽게 구워 넣었다. Blender 원본에는 실제 금속 재질을 남겼다. 상세 파일은 363,604바이트, 삼각형 23,094개다. 같은 지점의 직전 모델은 23,910개였다. 9층 보행 카메라에서 전체 드로콜은 138회로 같았다. 다른 층, 먼 거리, 천장만 본 상태에서 요청은 각각 0건이었고 매장 앞에서 시선을 내린 뒤에는 다가가고 돌아와도 1건이었다.

## 재생성

저장소 루트에서 Blender 3.6.23, Node.js 및 프로젝트 의존성을 사용한다. 인쇄물 원본을 다시 그릴 때 macOS Apple SD Gothic Neo와 Helvetica Neue를 썼다. 편집한 원본을 재수출할 때는 첫 명령 대신 `blender -b "$D/gallery.blend" --gpu-backend opengl --python-exit-code 1 -P "$D/export.py"`를 사용한다. 원본을 다시 열어 내보내고 압축한 파일이 최초 빌드와 바이트 단위로 일치했다.

```sh
D=assets/models/ssg-robot-vacuum
"${GTW_BLENDER_BIN:-blender}" -b --factory-startup --gpu-backend opengl --python-exit-code 1 -P "$D/build.py"
node "$D/pack.mjs"
node tests/smoke.mjs shinsegae
node tests/smoke.mjs gotomall centralcity shinsegae
```
