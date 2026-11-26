# 일반 계단 디딤판과 손스침

`staircase.blend`에 모따기한 디딤코, 챌판, 디딤판과 양 끝이 막힌 팔각 손스침이 들어 있다. Blender에서 메시·재질 슬롯을 수정하고 저장한 뒤 이 디렉터리에서 다시 내보낸다.

```sh
blender -b --factory-startup staircase.blend --python-exit-code 1 -P export.py
```

`profiles.js`에는 평가된 정점·면, 재질 역할과 기준 치수가 들어간다. 소스의 X는 계단 폭, Y는 올라가는 방향, Z는 높이다. `export.py`는 모디파이어와 오브젝트의 회전·배율을 반영한다. 두 모델을 편집할 때 서로 떨어뜨려 놓는 위치는 배치에 포함하지 않는다. 기본 장면을 재생성하는 명령은 `blender -b --factory-startup --python-exit-code 1 -P build.py`다.

게임은 각 계단의 기존 폭, 오름 높이와 디딤깊이에 이 단면을 맞춘다. `mat`, `nosing`, `railMat`으로 각 마감을 정하며 `rails:false`인 계단은 난간을 그리지 않는다. 평활 경사로와 움직이는 에스컬레이터는 각각의 렌더러를 계속 쓴다. 보행용 경사면과 난간 충돌은 기존 `js/kit.js`가 관리한다.

[반원상가 일반 플레이 화면 세 장](preview.jpg)

## 검증

- 전체 장소를 조립해 지연 로딩되는 층을 펼쳤을 때 일반 계단 428개에 디딤판 6,368개가 적용됐고 364개 계단에서 손스침을 그렸다. 변경 전후 장면 메시는 6,992개로 같았다. 해당 검증 빌드의 삼각형은 26,814,677개에서 26,885,813개로 0.265% 늘었다.
- 같은 반원상가 실내 시점에서 Chrome WebGL의 한 프레임 삼각형은 오르막·내리막 모두 276개 늘었다. 일반 플레이 세 시점에서 바닥 높이와 충돌 보정값을 확인했다.
- `node --max-old-space-size=8192 tools/audit_vertical.mjs`에서 계단 단면 428개와 승객 이동 163개가 통과했다. `node tests/newcore-transfers.mjs`에서 승하차 20회 및 간격 표본 2,020개가 통과했다. `node tests/store-floor-regressions.mjs`의 층별 회귀 검사 30개도 통과했다.
