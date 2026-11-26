# 신호등과 엘리베이터

[street-and-lift.blend](street-and-lift.blend)에 차량용 4구 신호등과 보행 신호기의 주물 하우징·곡면 차광판, 승강기 문틀·홈이 파인 문턱·호출 버튼판을 담았습니다. 발광 렌즈와 보행 그림, 층별 표시와 승강기 운행은 게임의 현재 상태를 사용합니다. 프레임 너비와 설치 각도는 각 배치에서 정합니다.

```sh
blender --factory-startup -b assets/models/street-and-lift/street-and-lift.blend -P assets/models/architectural-retail/export.py
```
