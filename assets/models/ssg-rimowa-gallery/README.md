# 신세계 강남점 리모와

2024년 4월 강남점 촬영 당시의 6층 여행 가방 진열벽을 재현했다. 오크 벽 왼쪽에는 타원 전신 거울이 있고, 선반 세 단에는 위에서부터 올리브색·회색·곤색 시그니처 백이 두 점씩 놓여 있다. 오른쪽에는 오리지널 실버 케이스 네 점을 눕히고 캐빈 한 점을 세웠다. 기존 입구의 소형 크로스백 매대는 별도 집기다. 스티커 캐빈용 유리 진열 공간은 이번 모델 범위 밖에 있다. [일반 게임 화면](game.jpg) · [같은 위치에서 보기](../../../?pos=-17.18059,26.2,92.82488&yaw=-162.672&pitch=-5#/shinsegae/6F)

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

편집 메시 528개를 런타임에서는 금속·직물·부속·오크 네 묶음으로 그린다. 직물 파이핑과 프레스 홈의 직선 구간을 줄이고 오크 텍스처를 축소한 뒤 meshopt로 압축했다. 최종 GLB는 497,536바이트, 삼각형 50,492개, 근접 드로 4회다. 같은 층 11m 이내에서 진열이 시야에 들어올 때 상세 모델을 요청하며, 22m 이내 중거리에서는 간략 모델을 한 번에 그린다.
