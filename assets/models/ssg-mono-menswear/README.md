# 신세계 강남점 CDG CDG CDG

6층 멘즈 컨템포러리 매장의 원통 진열장을 재현했다. 아래쪽 곡면 칸에는 접힌 셔츠를 쌓고 가운데에는 모자 두 점과 체크 머플러를 건 블루종을 놓았다. [일반 게임 근접 시점](../../../?pos=-6.807877,26.2,70.030058&yaw=-85.160796&pitch=-6#/shinsegae/6F) · [진열장 화면](game.jpg) · [입구에서 본 화면](entry.jpg)

## 사진과 재현 범위

신세계 강남점 6층 안내도의 기존 CDG CDG CDG 구획을 사용했다. 삼성물산은 2024년 2월 개점 당시 매장 면적을 79㎡로 소개했다. 벽의 세로 인쇄와 바닥의 가로 인쇄, 오른쪽 긴 흰 카운터, 입구 양쪽에 걸린 겉옷은 당시 전경에 근거한다. [신세계 층별 안내](https://www.shinsegae.com/store/floor.do?storeCd=SC00002) · [6층 안내도](https://www.shinsegae.com/cms12/SC00002/guide/floor/__icsFiles/afieldfile/2026/10/22/ogKqbBuYpuah.png) · [삼성물산 개점 자료](https://www.samsungfashion.com/newsroomDetail.do?NEWS_ID=RI_20240219111139533) · [강남점 입구 전경](https://www.samsungfashion.com/RENEW/MEDIA/NEWS/FI_20240219111139609.jpg)

원통의 진열칸 안쪽과 선반 두께를 모델링하고, 접힌 옷의 앞단에 인쇄를 따로 입혔다. 입구 올리브색 블루종에는 접힌 후드와 소매 셔링을, 벽면의 줄무늬 긴팔에는 몸판과 별도로 재단한 소매를 만들었다. 검정과 흰색 반팔의 문구 및 겉옷 비례에는 제품 자료도 참고했다. 수납장 치수, 옷의 수량과 간격, 옆벽의 배치는 게임 구획에 맞춘 추정이며 현재 재고를 나타내지 않는다. [강남점 원통 진열장](https://www.samsungfashion.com/RENEW/MEDIA/NEWS/FI_20240219111139896.jpg) · [강남점 의류 벽면](https://www.samsungfashion.com/RENEW/MEDIA/NEWS/FI_20240219111139808.jpg) · [1986 Été 반팔](https://shop.doverstreetmarket.com/products/cdg3-1986-ete-logo-t-shirt-1-carry-over-sz-t028-051) · [CDG 코치 재킷 치수](https://intl.cdgcdgcdg.com/pages/size-guide-sz-j029)

## 원본 조립과 재생성

`gallery.blend`의 `SSG_6F_CDG` 컬렉션에 편집 가능한 메시 603개와 자체 제작한 내장 인쇄 이미지 2장이 있다. 단위는 미터이며 Blender +X는 입구에서 본 오른쪽, −Y는 입구 방향, +Z는 위다. glTF Y-up 변환 후 월드 +Y축으로 −69.160796° 회전한다. 게임 논리 원점은 (−3.519107, 26.2, 70.714889), 지형 보정을 적용한 렌더 원점은 (−3.519107, 25.292, 70.714889)이다.

Blender 3.6.23, Node.js 및 저장소의 npm 패키지를 사용한다. 인쇄 그래픽 서체는 Arial Black이며 대체 서체는 DejaVu Sans다. 저장소 루트에서 실행한다.

```sh
D=assets/models/ssg-mono-menswear
"${GTW_BLENDER_BIN:-blender}" -b --factory-startup --gpu-backend opengl --python-exit-code 1 -P "$D/build.py"
node "$D/pack.mjs"
node tests/smoke.mjs shinsegae
node tests/smoke.mjs gotomall shinsegae
```

게임용 모델에서는 접힌 셔츠의 단면을 32점에서 16점으로 줄이고, 평평한 앞단 인쇄를 사각형 하나로 합쳤다. GLB는 611,644바이트, 삼각형 58,675개, 재질별 드로 호출 4회다. 의류 메시 이름은 `CdgGangnamCutAndSewn`이다. 같은 층에서 11m 안으로 들어와 진열물을 바라보면 상세 메시를 불러오고, 22m까지 간략 집기를 표시한다.
