# 신세계 강남점 컴프프로

10층 홈인테리어 매장의 성장 책상 체험 진열이다. 강남점 사진에서 앞줄의 청회색·분홍색 경사 상판, 오른쪽 이동 서랍, 고리형 등받이와 낮은 바퀴 프레임을 확인할 수 있다. 사진 속 기하무늬 러그와 뒤쪽 녹색 이층침대의 원목 난간도 함께 모델링했다. [제조사 강남점 안내](https://comfpro.co.kr/article/store/20/6089/) · [강남점 매장 사진 원본](https://comfpro.co.kr/web/upload/NNEditor/20260401/1.jpg) · [신세계 강남점 층별 안내](https://www.shinsegae.com/store/floor.do?storeCd=SC00002)

두 책상의 고정 날개와 경사판 사이에는 틈이 있다. 옆에서 보면 회전축, 지지 링크, 높이 눈금과 이중 기둥이 보인다. 흰 타공판과 문구 걸이, 공책과 색연필은 제품 사진을 참고해 배치했다. 의자는 등판 사이로 배경이 보이도록 모델링했고 발판과 쌍바퀴도 개별 부품으로 만들었다. 제품별 치수, 조절 기구 내부, 안내판 문구와 진열 간격은 재구성했다. 사진 속 제품의 정확한 모델명과 현재 재고는 확인되지 않았다. [슈퍼 1200 오토 데스크](https://comfpro.co.kr/product/detail.html?product_no=4385) · [심플 스카이 1400 데스크](https://comfpro.co.kr/product/detail.html?product_no=4377) · [Y639 플러스 체어](https://comfpro.co.kr/product/detail.html?product_no=2003) · [MS 울트라 체어](https://comfpro.co.kr/product/detail.html?product_no=634)

[일반 플레이 카메라](http://127.0.0.1:8765/?pos=-70.60905,45.4,18.92683&yaw=-61.5169&pitch=-13#/shinsegae/10F) · [촬영 화면](game.jpg) · [카메라와 조립 정보](camera.json)

## 조립과 재생성

편집 원본은 `gallery.blend`의 `SSG_10F_ComfPro` 컬렉션이다. 미터 단위이며 진열을 정면에서 볼 때 Blender +X가 오른쪽, −Y가 고객 쪽, +Z가 위다. glTF Y-up 변환 후 게임 월드 Y축 회전은 −69.01686°다. 게임 좌표는 (−67.81991, 45.4, 17.40257), 지형 보정이 적용되는 월드에서의 루트 높이는 48.56m다.

Blender 3.6.23에서 생성하고 원본을 다시 열어 개별 메시 793개를 확인했다. 글자를 생성할 때 macOS의 AppleGothic과 Arial Bold를 쓴다. 저장된 원본에서는 글자도 메시로 편집할 수 있다.

```sh
D=assets/models/ssg-kids-table
"${GTW_BLENDER_BIN:-blender}" -b --factory-startup --gpu-backend opengl --python-exit-code 1 -P "$D/build.py"
node "$D/pack.mjs"
node tests/smoke.mjs shinsegae
node tests/smoke.mjs gotomall shinsegae
```

런타임 GLB는 180,068바이트, 삼각형 53,007개, 재질 2개, 드로콜 2회다. 작은 문구와 서랍 테두리의 모서리 분할을 줄였고 평면 음영의 같은 색 정점을 공유해 압축했다. 가까이에서 보일 때 공용 로더가 상세 모델을 요청한다. 원거리 대체 모형은 한 번에 그린다.

일반 플레이 확인 결과 컴프프로 앞에서는 GLB를 한 번 요청했고, 같은 좌표의 8층과 10층 미키하우스 앞에서는 요청이 없었다. 단독 및 고투몰 연결 smoke 테스트 모두 OK였다.
