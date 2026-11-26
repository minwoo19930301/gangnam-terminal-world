# 공용 흡음 천장 패널

[Blender 원본](suspended-ceiling.blend)에는 600mm 흡음판과 T바, 매입등의 곡면 렌즈 두 줄과 경사 반사판, 사각 급기구의 세 겹 날개가 개별 메시로 들어 있습니다. 등기구와 급기구는 상업시설용 제품의 일반적인 구조를 참고했습니다. 각 지점의 기종과 설치 간격은 미확인입니다. 뉴코아 등에서 기본 천장 재질 `ceiling`을 사용하는 면에는 2.4m × 2.4m 단위로 적용됩니다. [블렌더 원본과 게임의 낮·밤 화면](review.jpg) · [Day-Brite 상업시설 매입등](https://www.assets.signify.com/is/content/Signify/Assets/signify/united-states/20240326-commercial-recessed-product-selection-guide.pdf) · [Titus 사각 급기구](https://www.titus-hvac.com/Products/Diffusers/TMS)

메시를 편집하거나 재질의 뷰포트 표시 색상을 바꾼 뒤 원본 파일을 저장합니다. 저장소 루트에서 다음 명령으로 게임 재질을 갱신할 수 있습니다.

```sh
blender --background assets/models/shared-ceiling/suspended-ceiling.blend \
  --python-exit-code 1 -P assets/models/shared-ceiling/export.py
```

내보내기 스크립트는 천장을 아래에서 정사영하고, 렌즈·반사판·급기구에 표시된 면의 기울기를 색상에 반영합니다. 같은 색의 픽셀 구간을 묶어 공용 재질 코드의 `BEGIN Blender suspended ceiling swatch` 구간에 기록합니다. 게임에서는 이 재질을 처음 사용할 때 256px 캔버스에 한 번 그립니다. 낮과 밤의 조도는 게임의 실내 조명을 따릅니다. [공용 재질 코드](../../../js/textures.js)
