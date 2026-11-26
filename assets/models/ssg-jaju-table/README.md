# 신세계 강남점 자주 테이블

신관 9층 식당가 자주 테이블에서 2026년 11월에 선보인 빌레로이앤보흐 협업 상차림이다. 게임에서는 흰 식탁보 앞에 서면 세워 둔 뉴문 접시의 초승달 모양 가장자리와 매뉴팩처 락의 검은 슬레이트 무늬를 가까이 볼 수 있다. 저장된 공식 층별 안내에서 ‘자주 테이블’은 식당가, ‘빌레로이 앤 보흐’는 별도 테이블웨어 매장이다. 카메라와 HUD에는 행사가 열린 식당 이름을 사용했다. [일반 게임 카메라](http://127.0.0.1:8765/?pos=-12.630526,40.6,56.569529&yaw=-80&pitch=-37#/shinsegae/9F) · [게임 촬영본](game.jpg) · [카메라와 원본 정보](camera.json) · [강남점 층별 안내](https://www.shinsegae.com/store/floor.do?storeCd=SC00002)

11월 13일 신세계 보도자료는 두 컬렉션으로 메뉴를 제공하는 행사를 2027년 1월 31일까지 진행한다고 안내한다. 첨부 사진 네 장에서 흰 단상에 기대 세운 접시, 흑백 찬기와 받침, 화병, 컷 글라스, 남색 안내 카드, 뒤편 카운터의 세로 목재 살을 확인했다. 촬영용 상차림에 보이는 빈 식기를 재구성했다. 식기 수와 간격, 식탁·카운터 치수, 안내지 삽화는 사진에 맞춘 추정이다. [공식 현장 기사와 사진 묶음](https://www.shinsegaegroupnewsroom.com/shinsegae-gangnam-jaju-table-premium-german-tableware/) · [강남점 정면 사진](https://images.shinsegaegroupnewsroom.com/wp-content/uploads/2026/11/shinsegae-gangnam-jaju-table-premium-german-tableware-1-1.jpg)

뉴문은 접시 안쪽 중심을 옆으로 옮기고 가장자리 한쪽을 높여 흰 유약 위의 반사 폭이 달라지도록 했다. 매뉴팩처 락은 넓고 평평한 테두리와 낮은 안쪽 턱을 만들고, 검은 자기 표면에 갈라진 돌결을 색·노멀 맵으로 입혔다. 잔과 화병은 현장 사진으로 형태를 잡았다. [뉴문 제조사 설명](https://pro.villeroy-boch.com/us/ca/dining-lifestyle/hospitality/products/premium-porcelain/newmoon) · [뉴문 공식몰 제품 사진](https://m.villeroy-boch.co.kr/data/skin/villeroyboch2023/assets/img/brand/collection/new-moon.jpg) · [매뉴팩처 락 공식몰 제품 사진](https://m.villeroy-boch.co.kr/data/skin/villeroyboch2023/assets/img/brand/collection/manufacture.jpg)

## 원본 조립과 재생성

편집 원본은 `jaju-table.blend`의 `SSG_9F_JajuTable` 컬렉션이다. 원점은 행사 식탁 중심 바로 아래 바닥이다. 단위는 미터이며 Blender +X는 식탁 오른쪽, +Y는 카운터 방향, +Z는 위다. glTF Y-up 변환 뒤 월드 Y축으로 −69.151690° 회전한다. 게임 배치 좌표는 (−11.734737, 40.6, 56.420997), 지형 보정 뒤 월드 원점 높이는 39.692m다.

Blender 3.6.23, macOS 글꼴 AppleGothic·Georgia, 저장소의 Node 패키지로 생성했다. 원본에는 개별 편집 메시 187개와 이미지 3장이 들어 있다. 글자는 메시로 저장했다. 저장소 루트에서 실행한다.

```sh
D=assets/models/ssg-jaju-table
"${GTW_BLENDER_BIN:-blender}" -b --factory-startup --gpu-backend opengl --python-exit-code 1 -P "$D/build.py"
node "$D/pack.mjs"
node tests/smoke.mjs shinsegae
node tests/smoke.mjs gotomall shinsegae
```

카운터 목재 살의 작은 모따기를 생략하고 작은 찬기와 받침의 원주 분할 수를 줄였다. 배포 GLB는 525,088바이트, 삼각형 54,514개, 재질별 메시 6개다. 원거리 대체 집기는 한 번에 그린다. 일반 게임에서 8층 프리스비와 9층 라마르조코 앞의 이 GLB 요청은 각각 0건, 자주 테이블 식탁 앞에서는 1건이었다. 단독 및 고투몰 연결 smoke 검사를 통과했다.
