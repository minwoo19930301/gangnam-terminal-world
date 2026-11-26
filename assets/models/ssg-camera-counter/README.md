# 신세계 강남점 라이카

[6층 일반 플레이 카메라](http://127.0.0.1:8765/?pos=-54.1772,26.2,-29.57774&yaw=28.7883&pitch=-27#/shinsegae/6F) · [게임 촬영 화면](game.jpg) · [조립 및 검증용 카메라](camera.json)

강남점 층별 안내에 라이카는 6층 남성 부티크로 등재되어 있다. 라이카코리아가 공개한 이 지점의 사진에서는 검은 수납장에 붉은 벽감이 세 줄로 들어가고, 흰 진열장과 스툴을 둔 상담 테이블 옆으로 매트 보드를 댄 사진 액자가 이어진다. 게임에서는 제품에 가까이 다가갈 수 있도록 흰 시연대를 개방형으로 구성했다. 치수, 재고, 작품과 제품 순서는 재구성한 것이다. [신세계 층별 안내](https://www.shinsegae.com/store/floor.do?storeCd=SC00002) · [라이카 공식 매장 안내](https://leica-camera.com/ko-KR/leica-stores/leica-store-seoul-shinsegae-gangnam) · [라이카코리아 강남점 사진 3장](https://www.leica-store.co.kr/store/view.asp?StoreNo=400)

시연대 왼쪽 M11에는 은색 상판, 두 거리계 창, 조리개 링과 가죽 손목 스트랩을 달았다. 가운데 Q3는 사각 후드, 오른쪽 SL3-S는 돌출 그립과 전자 뷰파인더, 꽃잎형 후드로 구분된다. 선반에는 렌즈를 분리해 마운트와 센서가 드러난 견본 6대와 교환 렌즈 12개를 놓았다. [M11 실버와 렌즈 사진](https://leica-camera.com/en-int/photography/m/explore-m11-family) · [Q3 제품 사진](https://leica-camera.com/en-GB/photography/cameras/q/q3-black/shop-now) · [SL3-S 제품 사진](https://leica-camera.com/en-int/photography/cameras/sl/sl3-s-black)

액자에는 공개 사진 세 장을 잘라 사용했다. 왼쪽부터 Lav Varshney의 카메라 사진(CC0), NASA의 아일린 콜린스 초상, SpaceX의 팰컨 9 발사 사진이다. 뒤의 두 사진은 공개 도메인으로 배포되었다. 세 사진을 합친 prints.jpg는 원본 블렌드와 GLB 안에도 들어 있다. [scikit-image 사진별 출처와 이용 조건](https://scikit-image.org/docs/0.24.x/api/skimage.data.html)

## 원본 조립과 재생성

편집 원본은 gallery.blend의 SSG_6F_Leica 컬렉션이다. 메시 오브젝트 313개가 있으며 Blender 좌표는 미터, +X는 시연대 오른쪽, −Y는 고객 쪽, +Z는 위다. glTF Y-up 변환 후 게임 +Y축으로 20.788311° 회전한다. 논리 루트 (−54.581718, 26.2, −30.333363)에 지형 보정을 적용한 전체 월드 루트는 (−54.581718, 29.251199, −30.333363)이다.

Blender 3.6.23 헤드리스와 내장 폰트를 사용했다. 저장소 루트에서 다음을 실행한다.

```sh
D=assets/models/ssg-camera-counter
"${GTW_BLENDER_BIN:-blender}" -b --factory-startup --gpu-backend opengl --python-exit-code 1 -P "$D/build.py"
node "$D/pack.mjs"
node tests/smoke.mjs shinsegae
node tests/smoke.mjs gotomall shinsegae
```

meshopt 압축 후 482,120바이트, 삼각형 40,075개, 메시·재질 각 3개, 상세 드로콜 3회다. 공유 스트리밍 모듈이 같은 층 22m 이내에서 대체 진열을 한 번에 그리고, 11m 안에서 진열이 시야에 들어오면 상세 모델을 요청한다.
