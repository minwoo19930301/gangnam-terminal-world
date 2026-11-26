# 신세계 강남점 완구 (아이큐박스/키움하우스)

10층 공동 매장 가운데 아이큐박스가 공개한 브리오 기차 체험대, 목제 주방놀이, 플레이포에버 자동차를 재현했다. 저장된 층별 안내에는 아이큐박스와 키움하우스가 모두 완구로 분류된다. [신세계 강남점 층별 안내](https://www.shinsegae.com/store/floor.do?storeCd=SC00002) · [아이큐박스 매장 안내](https://iqbox.co.kr/offline02)

- 2023년 10월 강남점 리뉴얼 사진에서 흰 테이블 테두리, 초록 다리, 나무 선로의 빨간 아치교, 노란 열차와 뒤쪽의 금색 상품대를 확인했다. 선로에는 바퀴가 굴러가는 홈을 두 줄 냈다. 열차에는 자석 연결기와 차축을, 크레인에는 자석에 달린 화물을 넣었다. [강남점 현장 기사](https://iqbox.co.kr/magazine/?bmode=view&idx=50464771) · [체험대 근접 사진](https://cdn.imweb.me/upload/S20240704f983b61805dd2/d66130cf6ec98.png) · [브리오 중앙역 세트 33989](https://www.ravensburger.co.uk/en-GB/pdp/63398900)
- 주방놀이에는 세탁기 원형 문, 오븐 손잡이, 싱크대와 전자레인지를 넣었다. 오른쪽 자동차 두 대는 노출된 타이어, 헬멧과 뒤 날개가 보이도록 상자 위에 올렸다. [강남점 주방놀이 사진](https://cdn.imweb.me/upload/S20240704f983b61805dd2/87a14e8867da1.png) · [강남점 자동차 사진](https://cdn.imweb.me/upload/S20240704f983b61805dd2/0b1f69596d656.png) · [플레이포에버 Velocita](https://playforever.co.uk/collections/velocita)
- 세 진열의 간격과 방향은 게임에서 세 면을 둘러볼 수 있도록 정했다. 선로 구성, 열차 수, 포장 삽화, 주방놀이 치수는 사진을 바탕으로 단순화했다. 사진은 리뉴얼 당시의 기록이며 현재 재고와 배치는 확인하지 못했다.

## 원본과 게임 화면

편집 원본은 `workshop.blend`의 `SSG_10F_IQBOX` 컬렉션이다. 원점은 기차 테이블 아래 바닥, 단위는 미터다. Blender +X는 자동차 방향, +Y는 상품 상자 방향, +Z는 위다. glTF Y-up 변환 후 월드 원점 (−58.287224, 45.4, 43.338659)에 놓고 +Y축을 기준으로 110.984499° 회전한다. 전체 지형을 켠 화면에서는 공용 지형 보정을 더한다.

[일반 게임 카메라](../../../?pos=-56.513876250201434,45.4,42.57280231407572&yaw=115.10926603897623&pitch=-25#/shinsegae/10F) · [게임 촬영 화면](normal-play.jpg) · [카메라 좌표](camera.json)

편집 메시 366개를 게임용 메시 1개와 재질 1개로 합쳤다. 상세 모델은 213,096바이트, 삼각형 18,529개, 드로콜 1회다. 같은 층에서 11m 안에 접근해 진열을 보면 상세 모델을 읽고, 22m 밖에서는 숨긴다. 일반 게임 촬영에서 상세 모델 요청은 매장 앞에서 1회, 8층과 10층 약 31m 밖에서 각각 0회였다.

## 재생성

저장소 루트에서 실행한다. Blender 3.6.23으로 검증했고 글자는 Blender 내장 서체를 사용한다. 두 스모크 테스트에서 모두 OK를 확인했다.

```sh
D=assets/models/ssg-junior-workshop
"${GTW_BLENDER_BIN:-blender}" -b --factory-startup --gpu-backend opengl --python-exit-code 1 -P "$D/build.py"
node "$D/pack.mjs"
node tests/smoke.mjs shinsegae
node tests/smoke.mjs gotomall centralcity shinsegae
```
