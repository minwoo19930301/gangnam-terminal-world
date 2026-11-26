# 상업공간 실내 건축 장식

![게임 안의 호텔 현관과 지하상가 천장, 갤러리, 터미널 전광판](preview.jpg)

| 장소 | Blender에서 편집할 컬렉션 | 모델링 근거 |
| --- | --- | --- |
| JW 메리어트 현관 홀 | `hotel-lattice` | 해안건축의 현관 홀 사진에서 어두운 목재 격자가 도자기 조형물 위를 덮는 모습과 격자 하부의 밝은 모서리를 참고했다. 게임에 있던 목재 살을 1.8m 모듈로 교체했다. [설계사 준공 사진](https://www.haeahn.com/en/project/detail.do?prjctSeq=3123) |
| 고투몰 지하상가 | `mall-ceiling` | 서울시가 게재한 사진의 흰 횡살, 버건디색 천장띠, 흰색 두 겹 꺾쇠, 아래쪽의 세로쓰기 ‘반포한강공원’을 구현했다. 설치점은 모델에 이미 있던 안내판 세 곳을 기준으로 했다. [서울시 기사](https://mediahub.seoul.go.kr/archives/2016771) · [안내띠를 올려다본 원본 사진](https://mediahub.seoul.go.kr/uploads/mediahub/2026/01/OsYBVkpKliTApVoRLgGZKzKlGqMXxcNs.jpg) |
| 파미에스테이션 갤러리 | `gallery-rib` | IDBR의 사진을 기준으로 천창을 가로지르는 밝은 아치, 받침 몰딩, 벽에 고정된 굽은 철제 팔과 종 모양 벽등을 모델링했다. 기존 천장 곡면과 아치 간격에 맞춰 배치했다. [설계사 갤러리 사진](https://cdn.imweb.me/thumbnail/20240802/0f0952339cac9.png) |
| 센트럴시티 호남선 대합실 | `terminal-led` | 공개 광고 매체 안내와 기존 대합실 영상 조사에 등장하는 대형 전광판에 패널 사이 이음매와 테두리, 뒤쪽 지지대를 붙였다. 화면의 색면은 게임용 창작 그래픽이다. [센트럴시티 전광판 매체 안내](https://www.allad1.com/centralcity/) · [기존 대합실 조사 기록](../../../data/research/centralcity.json) |

부재 단면, 금속 표면, 반복 간격과 글자 윤곽은 사진 비례에 맞춘 근사치다. 방문객이 서는 바닥과 가구의 물리 형태는 기존 장소 모델에서 가져온다.

## 파미에스테이션 1층 천창

운영사 사진에는 흰 둥근 천장 가운데에 검은 테두리와 마룻대로 나뉜 밝은 채광면이 보인다. 게임에서는 기존 아치 사이에 경사진 유백색 패널과 접힌 창틀, 양쪽 천장에 길게 이어지는 패널 줄눈을 넣었다. 유리의 투과율과 창틀 치수는 사진에서 확인하기 어려워 기존 경간에 맞췄다. 서울의 해가 지면 채광면이 어두워지며, 기둥에 붙은 전기 벽등은 계속 켜진다. [신세계센트럴 운영사 사진](https://www.shinsegaecentral.com/public/img/famille_block_1_img.png) · [양방향 보행 시점 비교](famille-rooflight.jpg)

게임에서 벽돌 홀과 식당가 양쪽에서 90프레임씩 측정했다. 드로 호출 범위는 각각 332~335회, 430~433회로 변경 전후가 같았고, gallery-rib.glb는 3,032바이트 늘었다. [벽돌 홀에서 식당가 방향](https://minwoo19930301.github.io/gangnam-terminal-world/?pitch=15#/famille/1F?p=4.94576,0,159.42347,111.16126) · [식당가에서 홀 방향](https://minwoo19930301.github.io/gangnam-terminal-world/?pitch=15#/famille/1F?p=-24.89642,0,170.97528,-68.83874)

## 편집과 재출력

`interiors.blend`의 네 컬렉션은 편집 화면에서 서로 떨어져 있다. 컬렉션 내부의 부재는 각각 편집할 수 있으며 재출력 시 각 컬렉션의 로컬 원점으로 되돌린다. 저장소 루트에서 다음 명령을 실행한다.

```sh
npm ci
blender -b assets/models/interior-architecture/interiors.blend -P assets/models/interior-architecture/export.py
```

`export.py`는 표면과 발광면을 나눠 정점 색상으로 내보낸 뒤 glTF Transform과 meshoptimizer를 적용한다. 네 GLB는 해당 장소의 모듈이 불러온다. `build.py`는 처음 구성한 편집 원본을 되살리는 스크립트다. 실행하면 같은 디렉터리의 Blender 파일을 덮어쓴다.

```sh
node tests/smoke.mjs jwmarriott gotomall famille centralcity
node tests/walk.mjs jwmarriott gotomall famille centralcity
```

## 와필레 앞 갤러리의 야간 조명

1층 식당 통로의 회반죽 천장 양쪽 면과 벽등 광원을 Blender 원본에 넣었다. 천창과 회반죽 아래 면에 붙인 `gallery_soffit` 속성으로 내보낸 삼각형이 게임의 천장 높이와 실내 조명 범위를 결정한다. 마지막 짧은 경간에도 같은 비율을 적용한다. 천창은 밤에 어두워지고 기둥 벽등은 계속 켜진다. [같은 식당 통로의 낮·밤 전후](famille-gallery-light.jpg)

`node assets/models/interior-architecture/check-vault.mjs`로 원본의 회반죽과 유리를 메모리에서 65cm 올린 뒤 네 지점의 게임 천장도 65cm 움직이는지 확인할 수 있다. 운영사 사진에서 확인한 것은 천장의 모양과 벽등 위치다. 벽등의 밝기와 마감 두께는 게임 축척에 맞춘 값이다.
