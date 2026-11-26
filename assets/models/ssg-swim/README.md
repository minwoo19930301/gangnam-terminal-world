# 신세계 강남점 배럴

[8층 일반 플레이 카메라](http://127.0.0.1:8765/?pos=-41.52,35.8,82.88&yaw=284&pitch=-5#/shinsegae/8F) · [게임 화면](game.jpg) · [카메라 좌표](camera.json)

강남점 공식 층별 안내에 실린 8층 베이직스포츠 매장이다. 기존 배럴 칸에 2023년 7월 같은 지점 신관 8층에서 열린 배럴 팝업의 전면 진열을 재구성했다. 사진에서 왼쪽의 검정 스노클 마스크와 주황색 쇼츠, 가운데 페트병 파도와 서프보드, 오른쪽 아동용 마스크와 야자를 확인할 수 있다. 현재 상설점의 집기 배치는 확인되지 않았다. [공식 층별 안내](https://www.shinsegae.com/store/floor.do?storeCd=SC00002) · [배럴 매장 안내](https://socal.cafe24.com/etc/store_info.html) · [강남점 팝업 사진](https://www.ktnews.com/news/photo/202307/129353_95133_650.jpg) · [재활용 페트병 전시 설명](https://www.ktnews.com/news/articleView.html?idxno=129353) · [신관 8층 행사 기록](https://fashionbiz.co.kr/article/201524)

마스크는 바이저 테두리, 코와 입을 덮는 호흡실, 머리 뒤를 감싸는 밴드와 상단 호흡관을 따로 만들었다. 배럴 상품 자료에서 일안식 렌즈와 밴드 소재를 참고했다. 사진 속 상품의 정확한 품번, 병의 수와 전시 치수는 추정이다. 파도 배경은 새로 그렸고, PET와 바이저의 투명감은 불투명 색면과 하이라이트로 표현했다. [배럴 풀 페이스 스노클 마스크 블랙](https://shinsegaemall.ssg.com/item/itemView.ssg?itemId=1000540944170) · [블랙·블루 소재 명세](https://www.ssg.com/item/itemView.ssg?itemId=1000540944137)

## 원본 조립과 재생성

Blender 3.6.23에서 저장 후 다시 열어 확인했다. `gallery.blend`의 `SSG_8F_Barrel` 컬렉션에는 개별 편집 메시 667개가 있다. 마네킹 3개, 마스크 2개, 병 125개와 뚜껑, 행거 의류 12벌을 포함한다. 단위는 미터다. +X는 진열 오른쪽, −Y는 통로 쪽, +Z는 위다. glTF Y-up 변환 후 월드 Y축으로 −69.034397° 회전한다. 게임 원점 (−37.68544, 35.8, 82.04037)에 지형 보정을 적용한 실제 원점은 (−37.68544, 34.892, 82.04037)이다. 상호는 Blender 내장 Bfont를 사용한다.

저장소 루트에서 실행한다.

```sh
D=assets/models/ssg-swim
"${GTW_BLENDER_BIN:-blender}" -b --factory-startup --gpu-backend opengl --python-exit-code 1 -P "$D/build.py"
node "$D/pack.mjs"
node tests/smoke.mjs shinsegae
node tests/smoke.mjs gotomall shinsegae
```

상세 GLB는 390,724바이트, 삼각형 55,527개, 재질 2개, 드로콜 2회다. 같은 층 22m 안에서 간략 진열을 한 번에 그리고, 11m 안에서 진열이 시야에 들어오면 상세 모델을 요청한다. 카메라의 상세 메시 이름은 `BarrelGangnamDisplay`다.
