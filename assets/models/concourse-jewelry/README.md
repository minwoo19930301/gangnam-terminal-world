# 고속터미널역 좌석과 르본시티 진열대

편집 파일은 [display-and-seating.blend](display-and-seating.blend)입니다. 역 좌석은 발판·받침 기둥·공용 가로보·성형 좌판·손잡이로 나눴습니다. 르본시티의 진열대에는 버건디색 테두리, 검은 벨벳, 목걸이 받침 두 개와 반지 쿠션을 배치했습니다. 유리장 안의 개별 상품과 좌석의 세부 단면은 사진과 기존 게임 모델의 비례에 맞춘 재현입니다.

[게임 화면](preview.jpg)

저장한 원본을 다시 게임용으로 내보내는 명령입니다.

```sh
blender --factory-startup -b assets/models/concourse-jewelry/display-and-seating.blend -P assets/models/architectural-retail/export.py
```
