# 신세계 강남점 본관 8층 엘리베이터 층별 안내

공식 8층 도면에서 노메뉴얼·브라운브레스 옆에 표시된 고객 엘리베이터를 골랐다. 게임에서는 두 문 위의 층수가 머리틀에 반쯤 가려져 있었고, 엘리베이터에 다가가도 매장 층별 안내가 보이지 않았다. 두 문의 새 표시창은 현재 층인 8층을 보여 준다. 가운데 안내에서는 본관 뉴스트리트와 다른 층의 주요 매장 분류를 읽을 수 있다. [신세계 강남점 층별안내](https://www.shinsegae.com/store/floor.do?storeCd=SC00002) · [운영사 8층 도면](https://www.shinsegae.com/cms12/SC00002/guide/floor/__icsFiles/afieldfile/2026/08/25/q50Em0NqTGJa.png) · [본관 뉴스트리트 개점 자료](https://www.shinsegaegroupnewsroom.com/new-street-mz-targeting/)

2024년 1월 24일 촬영한 강남점 본관 고객 승강기 영상 끝부분에는 모서리가 둥근 밝은 안내판과 두 열로 나뉜 층별 인쇄, 문 위의 짙은 표시창이 보인다. 촬영자는 같은 지점의 이용 기록에서 본관 승강기 전 층에 두 단으로 접은 문틀이 있다고 적었다. 안내판을 정면에서 촬영한 층은 지하 1층이다. 8층 세트는 이 안내판의 형식과 문틀 단면을 참고했고, 인쇄 문구와 배치 치수는 2026년 11월 27일 확인한 층별 안내와 게임의 문 간격에 맞췄다. [지점 방문 영상 2분 20초](https://www.youtube.com/watch?v=sBU3wLoMKNE&t=140s) · [촬영자의 본관 문틀 설명](https://elevatortrainkim.tistory.com/1546)

일반 보행 시점에서 왼쪽은 변경 전, 오른쪽은 변경 후다. 위는 낮의 대기공간, 아래는 밤에 안내판 앞으로 다가간 화면이다. [게임 화면 비교](comparison.jpg) · [8층 대기공간 시점](https://minwoo19930301.github.io/gangnam-terminal-world/#/shinsegae/8F?p=-32.37409,35.8,21.14732,-79.26665,4)

[Blender 원본](directory.blend)에서 접힌 문틀, 표시기, 인쇄판, 뒤판과 벽 고정대를 따로 편집할 수 있다. 인쇄 이미지는 원본에 포함돼 있다. 게임은 같은 메시를 한 번에 그리며 정면 근접 화면에서 620삼각형이 추가된다. 8층 기본 도착점, 문 뒤, 맞은편을 보는 시점과 9층에서는 전용 파일을 요청하지 않았다. 일반 조작으로 8층에서 7층을 선택한 뒤 다시 8층으로 돌아와 층 표시와 보행 바닥을 확인했다.

인쇄 수정부터 메시 내보내기까지 저장소 루트에서 아래 명령을 실행한다.

```sh
cd assets/models/ssg-lift-directory
node print-native.mjs /tmp/gangnam-lift-directory.png
blender -b -t 4 --python-exit-code 1 -P build.py -- /tmp/gangnam-lift-directory.png
blender -b -t 4 directory.blend --python-exit-code 1 -P export.py
node check.mjs
```
