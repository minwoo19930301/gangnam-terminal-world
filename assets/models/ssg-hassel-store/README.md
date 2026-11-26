# 신세계 강남점 핫셀블라드

[6층 일반 플레이 카메라](http://127.0.0.1:8765/?pos=-90.77411,26.2,-25.19202&yaw=17.78902&pitch=-21#/shinsegae/6F) · [게임 화면](game.jpg) · [카메라와 원본 정보](camera.json)

신세계 강남점 층별 안내에서 핫셀블라드는 6층 남성 부티크의 가전 매장으로 등재되어 있다. 게이트비젼이 2025년 8월 20일 강남점 개점 때 공개한 두 사진을 기준으로 검은 매대와 회색 패드, 벽의 흰 상호와 제품 모니터를 배치했다. [신세계 6층 안내도](https://www.shinsegae.com/cms12/SC00002/guide/floor/__icsFiles/afieldfile/2026/10/22/ogKqbBuYpuah.png) · [공식 수입사 매장 안내](https://www.gatevision.co.kr/front/page/P2025082853) · [개점 사진 두 장과 설명](https://www.seoul.co.kr/news/economy/2025/08/20/20250820500122) · [게이트비젼 입점 영상](https://www.youtube.com/watch?v=ymJWSCr4eHI)

시연대 앞줄 왼쪽은 X2D 100C다. 깊게 파인 가죽 그립 위에 주황 셔터와 상태창을 두고, 뒤에는 접안부와 기울어진 모니터를 달았다. 가운데 V 시스템 카메라는 열린 허리 높이 파인더와 필름 감기 크랭크로, 오른쪽 907X 계열은 얇은 몸체와 은색 접합부로 구별된다. 뒤에는 교환 렌즈 네 개를 세웠다. 초점 링의 무늬, 거리 눈금, 렌즈 코팅 아래 보이는 조리개 날을 UV에 그렸다. [X2D·XCD 제조사 사진 4–6쪽](https://cdn.hasselblad.com/f/77891/x/9d76b318df/de_x2d-press-release.pdf) · [907X 제조사 자료](https://www.hasselblad.com/v-system/907x-100c/)

집기 치수와 제품 간격은 사진에서 추정했다. V 시스템 본체의 세부 기종과 장초점 렌즈의 초점거리는 특정하지 않았다. 벽면 모니터 영상은 이 모델로 새로 촬영한 정지 화면이며, 매트의 접촉 그림자는 일곱 전시품의 형상으로 구웠다. [매대 정면 원본 사진](https://img.seoul.co.kr/img/upload/2025/08/20/SSC_20250820140522_O2.jpg) · [패드와 모니터 원본 사진](https://img.seoul.co.kr/img/upload/2025/08/20/SSC_20250820140532_O2.jpg)

## 원본 조립과 재생성

편집 원본은 `gallery.blend`의 `SSG_6F_Hasselblad` 컬렉션이다. 개별 메시 217개와 내장 텍스처 2장이 있다. 원점은 시연대 바닥 중심이고 단위는 미터다. Blender +X는 매대 오른쪽, −Y는 고객 쪽, +Z는 위다. glTF Y-up 변환 뒤 게임 +Y축으로 20.789023° 돌린다. 실내 루트의 월드 좌표 (x, y, z)는 (−91.005510, 26.2, −25.970579)이며 지형 보정을 적용하는 전체 월드에서는 y가 29.336706이다.

Blender 3.6.23, Cycles CPU, 내장 Bfont로 확인했다. 표면 각인의 SVG 래스터화에는 Helvetica 또는 Arial을 사용한다. 저장소 루트에서 실행한다.

```sh
D=assets/models/ssg-hassel-store
node "$D/atlas.mjs"
"${GTW_BLENDER_BIN:-blender}" -b --factory-startup --gpu-backend opengl --python-exit-code 1 -P "$D/build.py"
node "$D/pack.mjs"
node tests/smoke.mjs shinsegae
node tests/smoke.mjs gotomall shinsegae
```

최종 GLB는 479,772바이트, 삼각형 35,504개, 메시와 재질 각 4개로 상세 드로콜은 4회다. 일반 플레이에서 HUD가 ‘핫셀블라드 · 6F’인 정면 카메라는 상세 GLB를 한 번 요청했다. 같은 위치에서 뒤를 보거나, 6층 원거리 또는 7층에서 시작했을 때는 요청이 0회였다. 두 스모크 테스트 모두 `OK`를 확인했다.
