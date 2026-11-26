# 경부선 매표기와 다이소 패브릭 진열

[Blender 원본](concourse-fixtures.blend)에는 컬렉션 6개, 편집할 수 있는 메시 77개가 있습니다. 본체·화면·카드 인식부, 쿠션 겉감·자수·파이핑, 진열대 선반과 받침대를 개별적으로 수정할 수 있습니다. 게임은 하나의 컬렉션을 하나의 메시로 묶은 [GLB](fixtures.glb)를 사용합니다. [게임 화면](preview.jpg)

| 컬렉션 | 적용 위치와 수량 |
| --- | --- |
| `TicketKiosk` | 경부선 1층 무인발권기 14대 |
| `CushionLinen`, `CushionSage`, `CushionRose`, `CushionIvory` | 다이소 패브릭 코너의 격자·잎사귀·갈매기·누빔 무늬 쿠션 총 126개 |
| `CushionRack` | 쿠션 세 칸을 받치는 3단 진열대 14조 |

겉감 색과 매표기 외형은 기존 게임의 표현을 따랐습니다. 쿠션 자수와 매표기 세부 부품은 이 장면을 위해 디자인했습니다.

저장소 루트에서 `npm ci`로 의존성을 설치한 뒤 이 폴더에서 실행합니다. 첫 번째 명령은 저장한 모델의 모양과 재질을 웹으로 내보냅니다. 두 번째 명령은 초기 디자인으로 원본과 GLB를 다시 만듭니다.

```sh
blender -b concourse-fixtures.blend --python-exit-code 1 -P export.py
blender --factory-startup -b --python-exit-code 1 -P build.py
```
