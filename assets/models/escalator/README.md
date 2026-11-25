# 공통 에스컬레이터

![파미에스테이션 1층 게임 화면](preview.jpg)

`escalator.blend`에는 디딤판(Tread), 빗살판과 바닥판(Comb), 측판과 손잡이(Skirt), 손잡이 반환부(Return) 컬렉션이 있다. 디딤판의 앞코 곡면, 홈, 가장자리 선과 빗살판의 이는 각각 선택해 편집할 수 있다. 일반 승객용 에스컬레이터의 부품 구분과 실루엣을 참고해 제작했으며 현장 기종과 치수는 확인되지 않았다. [Schindler 9300 제품 안내](https://www.schindler.com/content/dam/website/us/docs/escalators/schindler-9300/schindler-9300-escalator-brochure.pdf/_jcr_content/renditions/original./schindler-9300-escalator-brochure.pdf) · [Schindler 소유자 안내](https://www.schindler.com/content/dam/website/us/docs/safety/schindler-owners-guide.pdf/_jcr_content/renditions/original./schindler-owners-guide.pdf)

## 게임 연결

`K.escalator`가 받는 두 끝점, 층고, 폭, 방향과 속도로 네 부품을 배치한다. 디딤판은 한 구간에 한 번씩 인스턴싱하며, 빗살판에 닿을 때 양 끝의 디딤면이 수평이 된다. 게임 시계와 모터의 수평 속도로 디딤판을 이동시키고 승하차 경계에서 메시를 자른다. 측판과 손잡이 단면은 연장 방향으로만 기울여 곡률과 높이를 유지한다. 기존 유리, 장소별 외장재, 하부 트러스와 승객 물리는 키트가 처리한다. 개별 장소에서 별도로 제작한 경사로·무빙워크는 각각의 모듈이 그린다.

## Blender에서 다시 내보내기

프로젝트 루트에서 `npm ci` 후 설치한 Blender 실행 파일을 사용한다. 편집본 재수출은 한 명령으로 이뤄진다.

```sh
blender -b assets/models/escalator/escalator.blend -P assets/models/escalator/export.py
```

기본 설계로 원본을 다시 만들 때는 `blender -b -P assets/models/escalator/build.py`를 먼저 실행한다. 내보내기는 컬렉션에 기록한 기준점을 기준으로 부품별 메시와 정점색을 취합하고 프로젝트의 glTF Transform 및 meshoptimizer를 거쳐 `parts.glb`를 쓴다.

## 확인

- 모든 장소와 지연 로딩 층을 생성하면 공통 부품을 쓰는 에스컬레이터가 8개 모듈에서 123개 생성된다. 모델 폭은 0.82~1.65m, 평면 길이는 5~30m다.
- `node --max-old-space-size=8192 tools/audit_vertical.mjs`로 승객 이동과 계단을 점검한다. `node tests/newcore-transfers.mjs`는 뉴코아의 서서 타기와 양끝 승하차까지 검사한다.
- 파미에 1층(폭 1.10m)과 뉴코아 1층(폭 1.26m)에 일반 게임 URL로 입장해 상행·하행을 촬영했다. 두 페이지에서 GLB HTTP 200과 Chrome 콘솔 오류 0건을 확인했다.
- 위 사진은 파미에 1층 게임 화면이다. 같은 카메라·조명에서 디딤판 시각만 0.247초 바꿔 900×610 픽셀 중 39,875픽셀의 RGB 채널 하나 이상이 8단계 넘게 바뀌는 것을 확인했다.
