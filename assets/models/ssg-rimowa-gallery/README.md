# 신세계 강남점 리모와

2024년 4월 강남점 촬영 당시의 6층 여행 가방 진열벽을 재현했다. 오크 벽 왼쪽에는 타원 전신 거울이 있고, 선반 세 단에는 위에서부터 올리브색·회색·곤색 시그니처 백이 두 점씩 놓여 있다. 오른쪽에는 오리지널 실버 케이스 네 점을 눕히고 캐빈 한 점을 세웠다. 기존 입구의 소형 크로스백 매대는 별도 집기다. 거울 옆 오크 패널에는 별도의 커스터마이징 진열창이 있다. [일반 게임 화면](game.jpg) · [같은 위치에서 보기](../../../?pos=-17.18059,26.2,92.82488&yaw=-162.672&pitch=-5#/shinsegae/6F)

## 사진과 자료

- 강남점 주소와 6층 리모와 구획은 제조사 매장 안내, 신세계 층별 명부와 도면에서 확인했다. [리모와 강남점](https://www.rimowa.com/kr/ko/storedetails/seoul/rimowa-seoul%20%E2%80%93%20shinsegae%20gangnam-1111825) · [신세계 층별 안내](https://www.shinsegae.com/store/floor.do?storeCd=SC00002) · [공식 6층 도면](https://www.shinsegae.com/cms12/SC00002/guide/floor/__icsFiles/afieldfile/2026/10/22/ogKqbBuYpuah.png)
- 선반 높이의 비례, 백팩 두 점·더플 세 점·토트 한 점의 앞면, 케이스의 방향과 손잡이는 두 번째 사진을 기준으로 삼았다. 선반 위의 조명, 금속 상인방과 글자는 첫 번째 사진에서도 볼 수 있다. [스타일조선 현장 기사](https://www.stylechosun.co.kr/online/spirit-journey/) · [두 번째 사진 원본](https://www.stylechosun.co.kr/online/wp-content/uploads/2024/04/2.-BRAK0887-3.jpg) · [매장 전경](https://www.stylechosun.co.kr/online/wp-content/uploads/2024/04/1.-BRAK0922-3.jpg)
- 시그니처 백의 재생 나일론과 입체 무늬, 플랩과 어깨끈, 오리지널의 알루미늄 홈과 모서리 보강재를 참고했다. 개별 품번과 현재 재고는 미확인이다. 치수, 후면 끈과 경첩, 벽걸이 받침 깊이는 사진 비례로 추정했다. 오크 결·직조 노멀맵은 직접 생성했고 거울에는 정적인 반사 그라데이션을 썼다. [시그니처 컬렉션](https://www.rimowa.com/us/en/signature-inspiration) · [오리지널 캐빈](https://www.rimowa.com/kr/ko/luggage-collection-original-cabin/92553044.html)

## 편집과 게임 배치

편집 원본은 `gallery.blend`의 `SSG_6F_RIMOWA_GALLERY` 컬렉션이다. 원점은 오크 벽 아래 중앙이며 단위는 미터다. Blender의 +X는 진열벽 오른쪽, +Y는 벽 뒤, +Z는 위쪽이다. Three.js의 로컬 축으로는 각각 +X, −Z, +Y다. 지형 보정을 포함한 월드 원점은 (−16.33982774, 25.29200001, 95.52203835), 월드 Y축 회전은 −159.2223402°다. [카메라와 조립 좌표](camera.json)

Blender 3.6.23과 내장 Bfont로 제작했다. 저장소 루트에서 다음 명령으로 재생성한다.

```sh
D=assets/models/ssg-rimowa-gallery
blender -b --factory-startup --gpu-backend opengl --python-exit-code 1 -P "$D/build.py"
node "$D/pack.mjs"
node tests/smoke.mjs shinsegae
node tests/smoke.mjs shinsegae gotomall centralcity
```

원래 가방벽의 편집 메시 528개를 런타임에서는 금속·직물·부속·오크 네 묶음으로 그린다. 직물 파이핑과 프레스 홈의 직선 구간을 줄이고 오크 텍스처를 축소한 뒤 meshopt로 압축했다. 최종 GLB는 497,536바이트, 삼각형 50,492개, 근접 드로 4회다. 같은 층 11m 이내에서 진열이 시야에 들어올 때 상세 모델을 요청하며, 22m 이내 중거리에서는 간략 모델을 한 번에 그린다.

## 서울과 쾰른 스티커가 붙은 오리지널 실버

강남점 취재 사진 네 번째 컷에서는 두 스티커를 붙인 실버 캐빈이 투명한 ㄷ자 받침 위에 놓여 있다. 뒤쪽은 무광 알루미늄이고 위아래로 조명이 비친다. 분홍 바탕의 쾰른 대성당과 한강·서울 도심·남산을 묘사한 두 표지를 새로 그려 캐리어의 프레스 홈을 따라 각각 휘게 했다. 편집 원본에서는 스티커 두 장을 개별 선택할 수 있다. [강남점 진열창 사진](https://www.stylechosun.co.kr/online/wp-content/uploads/2024/04/4.-BRAK0916-3.jpg) · [쾰른 스티커](https://www.rimowa.com/us/en/accessories/stickers/city-stickers/cologne/50900300.html) · [서울 스티커](https://www.rimowa.com/pl/en/accessories/stickers/city-stickers/seoul/50900340.html)

기준 치수는 오리지널 캐빈의 55 × 40 × 23cm다. 사진 속 개별 제품의 품번과 현장 설치 치수는 확인되지 않았다. 캐리어 앞·뒤 압연판, 이음 프레임, 세트 잠금장치, 접이식 손잡이, 보강 모서리와 각 축의 한 쌍 휠을 따로 모델링했다. 휠 허브의 여섯 구멍, 작은 상단 명판과 체결부도 블렌더 메시다. 니치와 인접 매대의 상대적 위치는 게임의 기존 영업 공간에 맞췄다. [오리지널 캐빈 제조사 치수](https://www.rimowa.com/gb/en/luggage/colour/silver/cabin/92553004.html) · [Blender에서 본 셸과 스티커](original-cabin.jpg)

같은 편집 컬렉션에 121개 부품을 추가해 총 649개다. 새 니치의 Blender 로컬 원점은 (−2.70, −0.015, 0)m다. 무광·금속·인쇄 표면과 투명 아크릴을 두 번에 그린다. 272,820바이트, 삼각형 18,844개인 `niche.glb` 안에 오크와 조명 반사용 소형 파노라마도 들어 있다. `niche_export.py`를 저장한 원본에서 다시 실행하고 `niche_pack.mjs`로 압축하면 같은 파일이 나온다. 기존 `gallery.glb`의 SHA-256도 보존했다.

같은 층에서 가방벽만 본 보행 시점은 가방벽 한 건, 니치만 본 시점은 니치 한 건을 요청했다. 다른 층, 원거리, 천장을 향한 시야에서는 두 파일 모두 요청 0건이었다. 유리에 다가갔다가 되돌아와 다시 보아도 니치는 한 번만 요청했다. 화면 속 글씨와 표면 광택은 해상도와 그래픽 기기에 따라 달라진다. [일반 보행에서 본 창과 캐리어](customisation-window.jpg) · [게임에서 진열창 보기](../../../?pos=-14.33867,26.2,93.18516&yaw=-159.2223&pitch=-8.9525#/shinsegae/6F)
