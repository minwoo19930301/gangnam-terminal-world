# 파미에와 호남선 사이 반계단

편집 가능한 [Blender 원본](steps.blend)에 윗참, 호남선 쪽 완만한 접속부, 여덟 단의 계단, 반원 철물 난간, 양쪽의 점형 경고판을 따로 넣었다. 비교 사진의 윗줄은 Blender, 아랫줄은 같은 계단을 거니는 게임 화면이다. [올라가는 게임 시점](../../../index.html#/famille/1F?p=-51.96601,0,163.78002,21.33861,-10.31) · [내려가는 게임 시점](../../../index.html#/famille/1F?p=-54.18568,1.36,158.09819,201.33861,-10.31) · [양방향 화면 비교](preview.jpg)

서울성모병원 영상 29.90초 장면에 돌 바닥의 짙은 디딤코, 황색 경고판, 반원 철물과 구형 보행등이 보인다. 보행등은 기존 별도 원본에서 이미 연결한다. 운영사 안내도와 기존 모델의 계단 해석, 추정 치수는 [기존 제작 기록](../famille/honam-stairs.md)에 있다. [서울성모병원 공식 영상](https://www.youtube.com/watch?v=HgbY_flKpMI&t=29s) · [운영사 안내도](https://www.shinsegaecentral.com/famille)

게임은 디딤코 폭을 보존한 채 그 뒤의 돌을 늘린다. 게임이 그리는 최종 정점에서 Blender 메시를 만들어 같은 단면과 윗참을 보존했다. 가로 3.30m, 한 단 높이 0.17m, 디딤깊이 0.36m, 총 높이 1.36m는 게임 치수다. 원본은 FamilleHonamSteps 컬렉션에 있으며, 편집용 도시에서 centralcity/FamilleHonamSteps/1로 연결된다. 게임의 바닥 재질색과 UV를 가져왔고, Blender 재질의 거칠기는 별도로 정했다.

아래 명령으로 현재 게임 형상에서 원본을 다시 생성한다. 원본에서 직접 수정한 메시를 보관할 때는 별도 사본을 저장한다.

~~~sh
blender -b --factory-startup -t 4 --python-exit-code 1 -P assets/models/famille-honam-steps/build.py
blender -b --factory-startup assets/models/world/gangnam-terminal.blend -t 4 --python-exit-code 1 -P assets/models/famille-honam-steps/check.py
node tests/famille-grade.mjs
node tests/famille-stair-view.mjs
~~~
