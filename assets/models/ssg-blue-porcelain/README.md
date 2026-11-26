# 신세계 강남점 로얄코펜하겐

[9층 일반 게임 시점](http://127.0.0.1:8765/?pos=-37.46,40.6,43.72&yaw=113&pitch=-16#/shinsegae/9F) · [게임 화면](game.jpg) · [카메라](camera.json)

신세계 강남점 층별 안내에 ‘로얄 코펜하겐’은 9층 테이블웨어로 등록돼 있다. 신세계가 공개한 리뉴얼 사진의 **오른쪽**이 이 매장이다. 입구의 아이보리 기둥에 걸린 접시, 후면 목재 진열장의 낮은 수납문과 수평 선반, 전면 진열대의 가는 다리와 밝은 서랍 앞판, 흰 꽃을 옮겼다. 치수와 상품별 진열 위치는 사진에 맞춰 추정했다. [강남점 층별 안내](https://www.shinsegae.com/store/floor.do?storeCd=SC00002) · [리뉴얼 기사](https://www.shinsegaegroupnewsroom.com/shinsegae-gangnam-kitchen-tableware-renovation/) · [강남점 매장 사진](https://images.shinsegaegroupnewsroom.com/wp-content/uploads/2025/09/SHINSEGAE_900-3.png)

2025년 리뉴얼 기사에는 프린세스 한식 세트 판매와 250주년 기념 접시 증정 행사가 나온다. 증정품의 품번은 공개되지 않았다. 게임에서는 제조사의 18cm 기념 접시(1074930)를 남색 케이스에 세웠다. 가운데에는 작업대에 앉은 도자기 화가를 그렸다. 옆의 27cm 블루 플루티드 기념 접시(1074934)에는 제조사 카탈로그를 참고해 꽃줄기와 연도를 그렸다. 두 기념판의 현장 배치와 케이스는 재구성이다. [제조사 기념 접시](https://royalcopenhagen.com/products/royal-copenhagen-anniversary-plate-1775-2025-1074930) · [제조사 카탈로그 PDF 102쪽](https://stfuncdiaprod.blob.core.windows.net/catalog-preview-images/7c014542-0031-d157-87e7-abb43c05d117.pdf#page=102)

프린세스 접시 가장자리에는 코발트색 비늘무늬와 네 곳의 레이스 장식을 그렸다. 찻잔의 높은 고리 손잡이, 티포트의 열린 주구와 푸른 뚜껑 꼭지, 공기의 굽과 속면은 입체로 만들었다. UV 무늬는 새로 그렸고 제조사 사진은 텍스처에 넣지 않았다. [프린세스 컬렉션](https://royalcopenhagen.com/collections/princess) · [찻잔과 받침](https://royalcopenhagen.com/en-us/products/princess-high-handle-cup-and-saucer-24-cl-1017248) · [제조사 카탈로그 PDF 60–61쪽](https://stfuncdiaprod.blob.core.windows.net/catalog-preview-images/7c014542-0031-d157-87e7-abb43c05d117.pdf#page=60)

## 조립과 재현

편집 원본은 `display.blend`의 `SSG_9F_RoyalCopenhagen` 컬렉션이다. 텍스처를 내장했고 각 부품을 메시 331개로 나누었다. 원점은 전면 진열대 밑 바닥 중심이며 Blender +X는 진열대를 바라보는 고객의 오른쪽, +Y는 후면장, +Z는 위쪽이다. 단위는 미터다. glTF Y-up으로 바꾼 뒤 게임 월드 +Y축으로 110.92358° 회전한다. 배치 중심은 (−39.328601, 40.6, 44.265520)이며 지형을 적용한 장면에서는 Y=40.138153이다.

Blender 3.6.23에서 확인했다. 입체 글자는 Blender 기본 Bfont, 기념 접시 연도는 SVG의 기본 serif 글꼴을 사용한다. 저장소 루트에서 실행한다.

```sh
D=assets/models/ssg-blue-porcelain
node "$D/paint.mjs"
"${GTW_BLENDER_BIN:-blender}" -b --factory-startup --gpu-backend opengl --python-exit-code 1 -P "$D/build.py"
node "$D/pack.mjs"
node tests/smoke.mjs shinsegae
node tests/smoke.mjs gotomall shinsegae
```

게임용 GLB는 563,424바이트, 삼각형 57,031개, 메시 3개로 상세 진열 전체가 3회에 그려진다. 목재, 유약, 금속 배치가 UV 아틀라스 한 장을 공유한다. 접시의 원주 분할 수를 조정하고 위치와 UV를 양자화했다. 간이 진열은 한 번에 그린다. 같은 층에서 11m 안에 들어와 진열을 바라보면 상세 파일을 요청한다. 8층의 같은 평면 위치와 9층 키친툴에서 시작했을 때 이 파일의 요청은 각각 0건이었다.
