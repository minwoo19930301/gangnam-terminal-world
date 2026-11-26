# 신세계 강남점 로얄코펜하겐

[9층 일반 게임 시점](http://127.0.0.1:8765/?pos=-37.46,40.6,43.72&yaw=113&pitch=-16#/shinsegae/9F) · [게임 화면](game.jpg) · [카메라](camera.json)

신세계 강남점 층별 안내에 ‘로얄 코펜하겐’은 9층 테이블웨어로 등록돼 있다. 신세계가 공개한 리뉴얼 사진의 **오른쪽**이 이 매장이다. 입구의 아이보리 기둥에 걸린 접시, 후면 목재 진열장의 낮은 수납문과 수평 선반, 전면 진열대의 가는 다리와 밝은 서랍 앞판, 흰 꽃을 옮겼다. 치수와 상품별 진열 위치는 사진에 맞춰 추정했다. [강남점 층별 안내](https://www.shinsegae.com/store/floor.do?storeCd=SC00002) · [리뉴얼 기사](https://www.shinsegaegroupnewsroom.com/shinsegae-gangnam-kitchen-tableware-renovation/) · [강남점 매장 사진](https://images.shinsegaegroupnewsroom.com/wp-content/uploads/2025/09/SHINSEGAE_900-3.png)

2025년 리뉴얼 기사에는 프린세스 한식 세트 판매와 250주년 기념 접시 증정 행사가 나온다. 증정품의 품번은 공개되지 않았다. 게임에서는 제조사의 18cm 기념 접시(1074930)를 남색 케이스에 세웠다. 가운데에는 작업대에 앉은 도자기 화가를 그렸다. 옆의 27cm 블루 플루티드 기념 접시(1074934)에는 제조사 카탈로그를 참고해 꽃줄기와 연도를 그렸다. 두 기념판의 현장 배치와 케이스는 재구성이다. [제조사 기념 접시](https://royalcopenhagen.com/products/royal-copenhagen-anniversary-plate-1775-2025-1074930) · [제조사 카탈로그 PDF 102쪽](https://stfuncdiaprod.blob.core.windows.net/catalog-preview-images/7c014542-0031-d157-87e7-abb43c05d117.pdf#page=102)

프린세스 접시 가장자리에는 코발트색 비늘무늬와 네 곳의 레이스 장식을 그렸다. 찻잔의 높은 고리 손잡이, 티포트의 열린 주구와 푸른 뚜껑 꼭지, 공기의 굽과 속면은 입체로 만들었다. UV 무늬는 새로 그렸고 제조사 사진은 텍스처에 넣지 않았다. [프린세스 컬렉션](https://royalcopenhagen.com/collections/princess) · [찻잔과 받침](https://royalcopenhagen.com/en-us/products/princess-high-handle-cup-and-saucer-24-cl-1017248) · [제조사 카탈로그 PDF 60–61쪽](https://stfuncdiaprod.blob.core.windows.net/catalog-preview-images/7c014542-0031-d157-87e7-abb43c05d117.pdf#page=60)

## 조립과 재현

편집 원본은 `display.blend`의 `SSG_9F_RoyalCopenhagen` 컬렉션이다. 텍스처를 내장했고 매장·식기 부품 331개와 보석함 부품 139개를 개별 메시로 보존했다. 원점은 전면 진열대 밑 바닥 중심이며 Blender +X는 진열대를 바라보는 고객의 오른쪽, +Y는 후면장, +Z는 위쪽이다. 단위는 미터다. glTF Y-up으로 바꾼 뒤 게임 월드 +Y축으로 110.92358° 회전한다. 배치 중심은 (−39.328601, 40.6, 44.265520)이며 지형을 적용한 장면에서는 Y=40.138153이다.

Blender 3.6.23에서 확인했다. 입체 글자는 Blender 기본 Bfont, 기념 접시 연도는 SVG의 기본 serif 글꼴을 사용한다. 저장소 루트에서 실행한다.

```sh
D=assets/models/ssg-blue-porcelain
node "$D/paint.mjs"
"${GTW_BLENDER_BIN:-blender}" -b --factory-startup --gpu-backend opengl --python-exit-code 1 -P "$D/build.py"
node "$D/pack.mjs"
node tests/smoke.mjs shinsegae
node tests/smoke.mjs gotomall shinsegae
```

매장과 식기 GLB는 385,084바이트, 삼각형 29,087개, 메시 3개로 상세 진열 전체가 3회에 그려진다. 목재, 유약, 금속 배치가 UV 아틀라스 한 장을 공유한다. 접시의 원주 분할 수를 조정하고 위치와 UV를 양자화했다. 간이 진열은 한 번에 그린다. 같은 층에서 11m 안에 들어와 진열을 바라보면 상세 파일을 요청한다. 8층의 같은 평면 위치와 9층 키친툴에서 시작했을 때 이 파일의 요청은 각각 0건이었다.

## 완두콩 공주 보석함

[9층 진열대 앞 게임 시점](http://127.0.0.1:8765/?pos=-38.595941,40.6,43.840868&yaw=112.76230&pitch=-37.88614#/shinsegae/9F) · [일반 플레이 화면](figurine-game.jpg) · [Blender 접사](princess-portrait.jpg) · [뚜껑과 받침을 분리한 모습](open-bonbonniere.jpg)

신세계는 2025년 9월 강남점 키친·테이블웨어 리뉴얼에서 게르하르트 헤닝의 ‘완두콩 공주’를 선보였다고 밝혔다. 박물관 소장품의 앞·옆·뒤 사진과 연 모습을 참고해 상단 방석과 인물이 함께 들리는 뚜껑, 금박을 두른 받침 안쪽, 뾰족하게 휜 관모의 산호색 뒷면, 진주 장식, 맞댄 손가락, 회화 장식 방석과 태슬을 모델링했다. 팔각 받침의 회화와 옷의 꽃무늬는 새로 그렸다. 높이 43cm와 폭 26cm는 같은 형식의 유통 기록에서 가져왔다. 매장에 전시했던 개체의 세부 채색과 정확한 테이블 위치는 확인되지 않았다. [신세계 리뉴얼 발표](https://www.shinsegaegroupnewsroom.com/shinsegae-gangnam-kitchen-tableware-renovation/) · [로얄코펜하겐 제작 소개](https://floradanica.royalcopenhagen.com/the-craft/) · [덴마크 아메리카 박물관 소장품 사진](https://www.danishmuseum.org/collections-highlight-princess-pea/) · [동형품 치수](https://www.danporantik.de/royal%20copenhagen%20porcelain/gh/gerhard%20henning)

Blender의 `SSG_9F_RoyalCopenhagen` 컬렉션 안에서 `retailPackage=RoyalPea`인 메시가 보석함이다. `bonbonnierePart`가 `Lid`인 메시를 함께 옮기면 안쪽을 볼 수 있다. 게임에서는 닫힌 상태로 진열한다. 진열대 원점 기준 배치는 Blender 미터 단위 (0.115, −0.213, 0.8985)다. 진열대와 보석함은 각각 독립적으로 로딩한다.

보석함 파일은 228,116바이트이며 16,146개 삼각형을 한 번에 그린다. 같은 층에서 3.8m 안에 들어와 쳐다보면 한 번 요청한다. 9m 안의 간이 모형은 한 번에 그린다. 8층·6m 거리·천장을 향한 카메라에서 요청 0건, 3.52m 걸어 접근하고 물러났다가 다시 접근하는 동안 총 1건을 확인했다. 저장한 Blender 원본을 다시 열어 내보낸 보석함 GLB와 빌드 직후 파일의 내용이 일치했다.

식기의 곡률과 푸른 무늬의 좌표를 함께 평가해 진열장·식기 메시를 줄였다. 덕분에 보석함까지 보이는 가까운 곳에서 두 파일의 합계는 45,233개 삼각형이다. 보석함을 추가하기 전의 57,031개보다 11,798개 적다. 두 파일을 모두 받을 때의 크기는 613,200바이트이며, 보석함 시야 밖에서는 진열장 파일 385,084바이트만 필요하다.

일반 플레이 카메라를 진열대 앞·비스듬한 방향·통로·옆에서 고정하고 같은 프레임에서 두 진열장 버전을 바꾸며 색과 윤곽을 확인했다. 깊은 쪽 접시의 플루팅과 가장자리 그림을 포함한 960×640 화면의 RGB PSNR은 46.50–51.06dB였다. 정면 근접 시점에서 전체 장면의 삼각형은 1,235,181개에서 1,207,237개로 줄었고 양쪽 모두 209회에 그려졌다. 다른 기기에서의 프레임 시간은 별도로 측정해야 한다.
