# 신세계 강남점 스노우피크

[8층 일반 플레이](http://127.0.0.1:8765/?pos=-13.41918,35.8,53.165057&yaw=10.78105&pitch=-20#/shinsegae/8F) · [게임 화면](game.jpg) · [카메라와 원본 정보](camera.json)

강남점 층별 안내에 실린 ‘스노우피크’는 8층 레져스포츠 매장이다. 게임 속 해당 매장에 2023년 8월 같은 지점 8층에서 열린 스노우피크 캠핑 팝업의 한 장면을 옮겼다. 현장 사진에서 텐트 앞 카키색 의자 두 개, 매달린 랜턴, 대나무색 상판, 왼쪽의 포개진 금속 상자와 오른쪽의 장작·화로를 확인했다. 현재 상설 매장의 집기 배치와 전시품 재고는 확인되지 않았다. [공식 층별 안내](https://www.shinsegae.com/store/floor.do?storeCd=SC00002) · [신세계 팝업 보도자료](https://www.shinsegaegroupnewsroom.com/new-world-snow-peak-camping/) · [진열 전경](https://images.shinsegaegroupnewsroom.com/wp-content/uploads/2025/08/new-world-snow-peak-camping.png) · [주전자·머그·랜턴 근접 사진](https://images.shinsegaegroupnewsroom.com/wp-content/uploads/2025/08/new-world-snow-peak-camping_2.png)

의자의 접이식 프레임, 대나무 팔걸이와 높은 등판 비례는 제조사 카탈로그를 참고했다. 좌판의 처짐과 가장자리 바인딩, 폴 슬리브와 이음쇠, 속이 빈 머그와 접이 손잡이, 주전자 주둥이 및 석쇠는 개별 메시다. 원단에는 자체 제작한 반복 직조 무늬를 입혔다. 텐트 모델명, 보이지 않는 뒷면, 집기 간격과 나뭇결은 사진을 바탕으로 추정했다. [스노우피크 로우체어 제품 사진과 재질](https://www.snowpeak.com/products/low-beach-chair)

## 원본과 재생성

Blender 3.6.23에서 검증했다. 원본은 `gallery.blend`의 `SSG_8F_SnowPeak` 컬렉션으로, 개별 편집 메시 471개와 내장 이미지 네 장을 담았다. 상호는 Blender 기본 글꼴이다. 단위는 미터이며 Blender +X는 진열 오른쪽, −Y는 관람객 쪽, +Z는 위다. glTF Y-up 변환 뒤 월드 Y축으로 +20.78105° 회전한다. 게임 논리 원점은 (−13.971608, 35.8, 50.187336), 지형 보정 후 렌더 원점은 (−13.971608, 34.892, 50.187336)이다.

저장소 루트에서 다음 순서로 재생성한다.

```sh
D=assets/models/ssg-helinox
"${GTW_BLENDER_BIN:-blender}" -b --factory-startup --gpu-backend opengl --python-exit-code 1 -P "$D/build.py"
node "$D/pack.mjs"
node tests/smoke.mjs shinsegae
node tests/smoke.mjs gotomall shinsegae
```

게임용 GLB는 정점 병합과 meshopt 압축 후 433,276바이트다. 삼각형 31,584개를 직조 원단·일반 표면·금속의 세 드로콜로 그린다. 같은 층 22m 이내에서는 단순화한 진열을 한 번에 그리고, 11m 안에서 시야에 들어오면 상세 모델을 요청한다.

## 텐트 앞에서 볼 수 있는 캠핑용품

백화점 촬영본에서 스테인리스 주전자의 삼각 주둥이와 말린 덮개, 머그의 접이식 손잡이, 아이보리색 랜턴의 행어와 확산통을 확인했다. 앞 테이블에는 닫힌 주전자, 왼쪽 알루미늄 상자 위에는 뚜껑을 열고 들손을 눕힌 견본을 두었다. 주둥이 안쪽 반달 받침 아래에 실제 구멍 21개가 있는 거름판을 넣었다. 제조사 사진의 클래식 1.8L 계열, 티타늄 싱글 450, 홈앤캠프 랜턴을 형상과 치수의 기준으로 삼았다. 이 제품들이 전시된 2023년 팝업의 한 장면이며 개별 품번·설치 치수를 현장 실측한 값은 없다. [강남점 팝업 접사](https://images.shinsegaegroupnewsroom.com/wp-content/uploads/2025/08/new-world-snow-peak-camping_2.png) · [클래식 케틀 공식 정면과 내부](https://ec.snowpeak.co.jp/item/SNP0122A0126) · [티타늄 싱글 450](https://www.snowpeak.com/products/titanium-single-450-cup-mg-043) · [홈앤캠프 랜턴 공식 사진·규격](https://ec.snowpeak.co.jp/item/SNP0121A0129?clr_id=101)

Blender에서 금속 몸통과 각 절곡 부위, 손잡이, 표면 인쇄, 랜턴 갓과 행어를 편집할 수 있다. 금속 마감은 기존 텐트·의자·목재 탁자의 색을 384 × 192로 굽고 시점에 맞춰 샘플링한다. 실시간 화면 캡처 없이 같은 재질 드로에서 처리한다. 베이크는 정적인 전시품과 단순화한 조명을 사용한다. 조명·점포 배치와 표면 광택은 게임용 근사치다. [Blender 제품 접사](camp-equipment.jpg) · [실제 보행 시점과 랜턴의 화면 확대](tent-walk.jpg) · [테이블로 걷기](../../../?pos=-13.69794,35.8,51.92317&yaw=-5.9614&pitch=-53.0441#/shinsegae/8F)

표시된 전체 장소를 같은 기기·카메라에서 전후 세 번씩 비교했다. 렌더 호출은 모두 367회, 전체 삼각형은 1,088,403개에서 1,085,827개로 줄었다. 해당 모델은 34,160개에서 31,584개로 줄고 전송량은 338,056바이트에서 433,276바이트로 늘었다. 다른 층·원거리·천장 요청은 각각 0회였다. 테이블 쪽으로 걸었다가 돌아오고 고개를 다시 돌려도 같은 세션에서 한 번만 요청했다. 프레임 시간과 내려받는 시간은 기기와 네트워크에 따라 달라진다.

저장한 원본을 다시 열어 아래처럼 내보내면 같은 GLB를 생성한다. 처음부터 만드는 명령은 위와 같으며 Node와 sharp가 있어야 한다.

```sh
D=assets/models/ssg-helinox
blender -b --gpu-backend opengl "$D/gallery.blend" --python-exit-code 1 -P "$D/export.py"
node "$D/pack.mjs"
```
