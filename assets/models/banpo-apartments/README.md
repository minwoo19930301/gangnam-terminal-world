# 신반포로 아파트 외관

[Blender 세 단지 열기](banpo-apartments.blend) · [게임의 보도 시점](street-views.jpg) · [Blender의 낮·밤](native-night.jpg)

| 게임 지도 검색 | 게임용 외관 | 원본 삼각형 |
| --- | --- | ---: |
| 신반포4차 | [apt-a13790828.glb](../../re/apt-a13790828.glb) | 5,871 |
| 반포르엘 | [apt-a10023673.glb](../../re/apt-a10023673.glb) | 3,926 |
| 반포센트럴자이 또는 반센자이 | [apt-a10024913.glb](../../re/apt-a10024913.glb) | 6,229 |

세 건물은 원래 서울 부동산 지도에서 건물 외곽선으로 생성해 내보낸 외관입니다. 이 파일은 그 세 GLB에서 만든 편집본입니다. 창과 입면의 배치는 원본의 추정 표현을 따릅니다. 신반포4차와 반포르엘의 게임 파일은 원본과 바이트가 같습니다. 반포센트럴자이는 같은 삼각형과 입면 재질을 유지하는 74,624바이트 meshopt 파일입니다. [원본 저장소와 모델 기록](https://github.com/minwoo19930301/seoul-real-estate-map/blob/ede67d9f3909395d346ab67e492d63fd10142d08/public/models/manifest.json)

## 편집

통합 도시의 **건축 · 외관 → 신반포로 · 아파트 원본**에 세 컬렉션을 연결했습니다. 위 Blender 파일에서 단지 이름의 컬렉션을 열고 건물 메시를 편집합니다. 기본 형상 키인 **Basis**에 외관을 편집하면 게임과 도시에서 같은 수정이 보입니다. **게임 지형 높이** 키를 1로 두면 통합 도시의 서로 다른 지면고를 미리 볼 수 있습니다.

저장소 루트에서 한 단지만 게임용 파일에 반영하는 예입니다. 마지막 인수에 표의 파일 이름에서 확장자를 뺀 ID를 넣습니다.

```sh
blender -b assets/models/banpo-apartments/banpo-apartments.blend --python-exit-code 1 \
  -P assets/models/banpo-apartments/export.py -- assets/re apt-a10024913
```

`assets/re` 대신 임시 출력 폴더를 지정하면 내보낸 파일을 먼저 확인할 수 있습니다. 게임에 반영할 때는 파일 크기와 외관 범위를 등록하고, 이후 원본 지도 데이터를 다시 가져와도 편집한 모델을 보존합니다. 지형 높이와 야간 조명은 게임에서 서울 시각과 각 건물 위치에 맞게 적용합니다.

초기 편집본을 재현할 때는 원본 저장소의 `public/models`를 입력 폴더로 사용합니다. `build.py`는 입력 파일 3개의 SHA-256을 확인한 뒤 그 형상과 선형 정점 색을 읽습니다.

```sh
blender --factory-startup -b --python-exit-code 1 \
  -P assets/models/banpo-apartments/build.py -- /path/to/seoul-real-estate-map/public/models
```

게임의 실제 보도 시점에서 서울 시각 12시 30분과 0시 30분을 비교했다. 창문 발광만 껐을 때와 비교해 밤 화면 상단에서 달라진 픽셀 수는 반포르엘 4,038개, 반포센트럴자이 8,251개, 신반포4차 6,984개였다. 같은 시점의 낮에는 모두 0개였다. 반포센트럴자이 앞 공공 보도에 서울시 가로수 대장의 대왕참나무 10그루를 반영했다. 줄기 위치는 대장 좌표를 따르고 나무 높이는 약 8m로 표현했다. [게임에서 본 세 단지의 낮과 밤](game-night.jpg) · [가로수 전후](../../../docs/map-audit/banpo-central-xi-street-trees.jpg) · [서울시 자치구 가로수 위치정보](https://data.seoul.go.kr/dataList/OA-23040/S/1/datasetView.do)
