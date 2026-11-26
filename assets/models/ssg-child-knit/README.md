# 신세계 강남점 베이비 디올

[10층 일반 플레이 카메라](http://127.0.0.1:8765/?pos=-51.28,45.4,-2.31&yaw=-159.2&pitch=-9#/shinsegae/10F) · [게임 촬영 화면](game.jpg) · [재현 좌표](camera.json)

신세계가 2022년 3월 공개한 강남점 10층 의류 매장 사진에서 크림색 벽감, 안쪽 조명, 황동 행거, 아동 마네킹, 꽃병을 얹은 원탁을 골랐다. 층별 안내의 매장명은 ‘베이비 디올’, 분류는 ‘수입아동’이다. 게임에서는 아트리움과 겹치는 매장 서쪽을 피해 동쪽 바닥에 두 벽감과 원탁을 배치했다. 집기 크기와 간격은 사진을 바탕으로 추정했다. [신세계 개점 기사](https://www.shinsegaegroupnewsroom.com/babydiol-gangnam-opening-seoul/) · [매장 사진 원본](https://images.shinsegaegroupnewsroom.com/wp-content/uploads/2025/08/babydiol-gangnam-opening-seoul_2.png) · [신세계 강남점 층별 안내](https://www.shinsegae.com/store/floor.do?storeCd=SC00002)

산호색 가디건의 흰 단추 다섯 개와 둥근 목, 아이보리 가디건의 옅은 분홍 줄무늬, 토끼 인형의 늘어진 귀와 자수 코는 디올 상품 사진을 참고했다. 마네킹 두 벌과 행거 열 벌의 코디는 게임용이다. 제품별 색상과 배치가 개점 당시 또는 현재 재고와 일치하는지는 확인되지 않았다. 니트 코와 잔가지 무늬는 직접 그린 반복 패턴이다. [산호색 가디건](https://www.dior.com/en_us/fashion/products/6SBM34CARM_Y712) · [줄무늬 가디건](https://www.dior.com/en_int/fashion/products/5WBM34CARL_Y02B) · [면 새틴 토끼 인형](https://www.dior.com/en_int/fashion/products/9HBG51DDO2_Y353)

## 월드 조립과 검증

편집 원본은 `gallery.blend`의 `SSG_10F_BabyDior` 컬렉션이다. 개별 메시 1,150개와 내장 무늬 이미지 2개를 담았다. 단위는 미터, Blender +X는 토끼 선반 쪽, −Y는 진열 정면, +Z는 위다. glTF Y-up 변환 후 월드 +Y축 회전은 −159.214141°다. 게임 루트 (x, y, z)는 (−50.185852, 45.4, 0.511450), 지형을 더한 렌더 높이는 48.56m다.

일반 플레이 프레임에서 베이비 디올 HUD와 상세 니트를 확인했다. 베이비 디올 앞에서 상세 GLB 요청 1건, 10층 토박스와 8층 비교 위치에서는 해당 GLB 요청 0건을 기록했다. 공용 로더가 같은 층 11m 안에서 화면에 들어온 진열을 읽고 22m까지 간략 진열을 표시한다.

Blender 3.6.23, macOS Times New Roman으로 생성했다. 런타임 파일은 621,524바이트이며 삼각형 54,220개, 메시 5개, 드로콜 5회다. 작은 단추 구멍은 평면으로 만들고, 꽃잎과 봉제 부품은 크기에 따라 곡면 분할 수를 줄였다.

```sh
D=assets/models/ssg-child-knit
"${GTW_BLENDER_BIN:-blender}" -b --factory-startup --gpu-backend opengl --python-exit-code 1 -P "$D/build.py"
node "$D/pack.mjs"
node tests/smoke.mjs shinsegae
node tests/smoke.mjs gotomall shinsegae
```
