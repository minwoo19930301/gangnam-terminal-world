# 신세계 강남점 스노우피크

[8층 일반 플레이](http://127.0.0.1:8765/?pos=-13.41918,35.8,53.165057&yaw=10.78105&pitch=-20#/shinsegae/8F) · [게임 화면](game.jpg) · [카메라와 원본 정보](camera.json)

강남점 층별 안내에 실린 ‘스노우피크’는 8층 레져스포츠 매장이다. 게임 속 해당 매장에 2023년 8월 같은 지점 8층에서 열린 스노우피크 캠핑 팝업의 한 장면을 옮겼다. 현장 사진에서 텐트 앞 카키색 의자 두 개, 매달린 랜턴, 대나무색 상판, 왼쪽의 포개진 금속 상자와 오른쪽의 장작·화로를 확인했다. 현재 상설 매장의 집기 배치와 전시품 재고는 확인되지 않았다. [공식 층별 안내](https://www.shinsegae.com/store/floor.do?storeCd=SC00002) · [신세계 팝업 보도자료](https://www.shinsegaegroupnewsroom.com/new-world-snow-peak-camping/) · [진열 전경](https://images.shinsegaegroupnewsroom.com/wp-content/uploads/2025/08/new-world-snow-peak-camping.png) · [주전자·머그·랜턴 근접 사진](https://images.shinsegaegroupnewsroom.com/wp-content/uploads/2025/08/new-world-snow-peak-camping_2.png)

의자의 접이식 프레임, 대나무 팔걸이와 높은 등판 비례는 제조사 카탈로그를 참고했다. 좌판의 처짐과 가장자리 바인딩, 폴 슬리브와 이음쇠, 속이 빈 머그와 접이 손잡이, 주전자 주둥이 및 석쇠는 개별 메시다. 원단에는 자체 제작한 반복 직조 무늬를 입혔다. 텐트 모델명, 보이지 않는 뒷면, 집기 간격과 나뭇결은 사진을 바탕으로 추정했다. [스노우피크 로우체어 제품 사진과 재질](https://www.snowpeak.com/products/low-beach-chair)

## 원본과 재생성

Blender 3.6.23에서 검증했다. 원본은 `gallery.blend`의 `SSG_8F_SnowPeak` 컬렉션으로, 개별 편집 메시 412개와 내장 직조 텍스처 한 장을 담았다. 상호는 Blender 기본 글꼴이다. 단위는 미터이며 Blender +X는 진열 오른쪽, −Y는 관람객 쪽, +Z는 위다. glTF Y-up 변환 뒤 월드 Y축으로 +20.78105° 회전한다. 게임 논리 원점은 (−13.971608, 35.8, 50.187336), 지형 보정 후 렌더 원점은 (−13.971608, 34.892, 50.187336)이다.

저장소 루트에서 다음 순서로 재생성한다.

```sh
D=assets/models/ssg-helinox
"${GTW_BLENDER_BIN:-blender}" -b --factory-startup --gpu-backend opengl --python-exit-code 1 -P "$D/build.py"
node "$D/pack.mjs"
node tests/smoke.mjs shinsegae
node tests/smoke.mjs gotomall shinsegae
```

게임용 GLB는 정점 병합과 meshopt 압축 후 338,056바이트다. 삼각형 34,160개를 직조 원단·일반 표면·금속의 세 드로콜로 그린다. 같은 층 22m 이내에서는 단순화한 진열을 한 번에 그리고, 11m 안에서 시야에 들어오면 상세 모델을 요청한다.
