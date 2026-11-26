# 신세계 강남점 9층 로라스타/리터로봇

강남점 게이트비젼 부띠끄 개점 때 촬영한 첫 사진을 바탕으로 리터로봇 시연대를 만들었다. 검정·흰색 두 기기 사이에는 작은 삼색 고양이 모형이 있고, 오른쪽에는 세로 안내 화면과 책자꽂이가 있다. 흰 타원형 매대 왼쪽 아래는 비어 있고 오른쪽은 수납장이다. 두 번째 사진에서 뒷면의 상호와 밝은 바닥의 짙은 사각 무늬를 확인했다. 신세계 층별 안내의 공동 점포명은 **로라스타/리터로봇**이며 이번 편집 모델의 대상은 **리터로봇**이다. [신세계 층별 안내](https://www.shinsegae.com/store/floor.do?storeCd=SC00002) · [로라스타 매장 안내](https://laurastar.co.kr/front/storeinfo) · [공식 수입사 현장 기사](https://www.gatevision.co.kr/front/boardCont/A7HL8VMRFVESKWLHE1F9XBWHNDB1AKV2?catecode=304C9EDD&code=B20190916125138) · [두 대를 함께 찍은 사진](https://erp.gatevision.co.kr/media/data/board/image/f/f82aab36f748d9cb4af4956abf22826a.png) · [옆에서 본 행사장](https://erp.gatevision.co.kr/media/data/board/image/1/106a8aab51cca389fa9f4113398c70da.png)

기기는 Litter-Robot 4의 제조사 치수와 설명서 8–9쪽 정면·측면도를 참고했다. 둥근 입구 위쪽의 센서 세 개, 오른쪽 위 조작부, 앞쪽으로 나온 고무 발판, 속통의 타공망과 뒤쪽 경첩을 개별 부품으로 만들었다. 매대 치수와 부품 간격은 사진에 맞춰 추정했다. 안내 화면과 인쇄물은 새로 그렸고, 뒤쪽 상호 패널과 바닥 무늬는 게임 매장 폭에 맞게 줄였다. [제조사 제품 페이지](https://www.whisker.com/litter-robot-4) · [Whisker 제품 설명서](https://www.litter-robot.com/manual_pdf/Litter-Robot-4-Manual-English-International.pdf)

[일반 게임에서 시연대 보기](../../../?pos=-53.8076,40.6,66.94512&yaw=105.0048&pitch=-22#/shinsegae/9F) · [실제 게임 화면](game.jpg) · [카메라 좌표](camera.json)

## 원본과 게임 배치

`boutique.blend`의 `SSG_9F_Gatevision` 컬렉션에는 편집 가능한 메시 192개가 있다. 단위는 미터, 원점은 매대 중앙 바닥이다. Blender +X는 매대 오른쪽, +Y는 뒷면, +Z는 위쪽이다. glTF의 Y-up 변환 후 게임 월드 원점은 약 (−55.284, 40.600, 67.340)이고 +Y축 회전은 111.0048°다. 지형을 적용한 실제 원점 높이는 39.692m다.

런타임 파일은 306,988바이트, 삼각형 33,255개, 재질 3개, 드로콜 3회다. 작은 렌즈와 장식의 분할 수를 줄이고, 타일과 상감은 평면으로 만들었다. 정상 보행 화면에서 매대 앞 GLB 요청 1건, 9층의 약 29m 떨어진 매장과 같은 수평 좌표의 7층에서 각각 0건을 확인했다. 매대 앞 HUD는 ‘로라스타/리터로봇 · 9F’로 표시된다.

## 재생성

저장소 루트에서 Blender 3.6.23과 프로젝트의 Node.js 패키지로 확인했다. 한글 조판에는 macOS Apple SD Gothic Neo, 영문에는 Blender 내장 글꼴을 사용했다. 원본을 직접 편집한 경우 첫 명령 대신 `blender -b "$D/boutique.blend" --gpu-backend opengl --python-exit-code 1 -P "$D/export.py"`를 실행한다.

```sh
D=assets/models/ssg-gatevision-appliances
blender -b -t 1 --factory-startup --gpu-backend opengl --python-exit-code 1 -P "$D/build.py"
node "$D/pack.mjs"
node tests/smoke.mjs shinsegae
node tests/smoke.mjs gotomall centralcity shinsegae
```
