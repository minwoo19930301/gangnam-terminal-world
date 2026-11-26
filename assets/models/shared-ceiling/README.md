# 공용 흡음 천장 패널

[Blender 원본](suspended-ceiling.blend)은 600mm 흡음판, T바, 2칸 매입 조명의 베젤과 프리즘 렌즈, 환기구의 경사 날개를 개별 메시로 보관합니다. 이 패널은 여러 실내에서 함께 쓰는 게임용 마감입니다. 게임은 2.4m × 2.4m 한 판을 기본 천장 재질 `ceiling`로 반복해서 그립니다. [Blender 모델과 뉴코아 게임 화면](review.jpg)

메시를 편집하거나 재질의 뷰포트 표시 색상을 바꾼 뒤 원본 파일을 저장합니다. 저장소 루트에서 다음 명령으로 게임 재질을 갱신할 수 있습니다.

```sh
blender --background assets/models/shared-ceiling/suspended-ceiling.blend \
  --python-exit-code 1 -P assets/models/shared-ceiling/export.py
```

내보내기 스크립트는 천장을 아래에서 정사영하고 같은 색으로 이어지는 픽셀 구간을 묶습니다. 결과는 [공용 재질 코드](../../../js/textures.js)의 `BEGIN Blender suspended ceiling swatch` 구간에 들어갑니다. 게임은 기존 천장 재질을 처음 사용하는 시점에 256px 캔버스에 색상을 채웁니다. 시간대별 조명은 게임 장면의 값을 그대로 사용합니다.
