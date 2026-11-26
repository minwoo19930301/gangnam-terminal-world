# 신세계 강남점 키사라

11층 키사라의 첫 손님상이다. 금색 선을 두른 적갈색 목재 식탁에 열 점 모둠초밥, 사시미, 장국, 간장 종지와 보온 주전자를 올렸다. [일반 게임 시점](http://127.0.0.1:8765/?pos=-40.645615,50.2,95.283441&yaw=35&pitch=-45#/shinsegae/11F) · [게임 촬영본](game.jpg) · [카메라 좌표](camera.json)

신세계 층별 안내와 저장된 11층 도면은 키사라를 초밥·생선회·냄비요리 전문점으로 분류한다. 운영사 아워홈도 신세계 강남점 11층 전문식당가로 안내한다. [신세계 층별 안내](https://www.shinsegae.com/store/floor.do?storeCd=SC00002) · [아워홈 키사라 지점 안내](https://ourhomehospitality.com/brand/brandBranch.do?branchSeq=422&brandSeq=10)

강남점 홀과 모둠초밥 근접 사진에서 상판의 상감선, 휘어진 등받이와 가로대, 사각 도기의 갈색 테, 생선살의 결, 장어의 김 띠, 초생강과 고추냉이 위치를 참고했다. 사시미는 별도 방문 사진에서 장어 정식에 곁들인 검은 접시와 무채·깻잎·레몬을 참고했다. 두 방문 때의 음식을 한 상에 모았으며 식기 치수, 의자 간격, 어종별 색은 게임용 근사치다. 표면 무늬와 메시를 직접 제작했다. [홀·식기·모둠초밥 사진](https://lifensook.tistory.com/163) · [사시미 접시 사진](https://anynovak.tistory.com/626)

## 편집과 배치

`kisara.blend`의 `SSG_11F_Kisara` 컬렉션에는 편집 가능한 메시 183개와 내장 UV 이미지 한 장이 있다. 미터 단위로 식탁 중앙 아래 바닥이 원점이며, Blender +Y는 초밥에서 사시미 쪽, +Z는 위다. glTF Y-up 변환 뒤 게임 월드 +Y축으로 20.778469° 회전한다. 배치 원점 (x, y, z)는 (−41.270814, 50.2, 94.390565), 지형 보정 후 y는 49.292다.

## 재생성

저장소 루트에서 Blender 3.6.23과 설치된 Node 패키지로 실행한다. 외부 글꼴은 사용하지 않는다.

```sh
D=assets/models/ssg-sushi
"${GTW_BLENDER_BIN:-blender}" -b --factory-startup --gpu-backend opengl --python-exit-code 1 -P "$D/build.py"
node "$D/pack.mjs"
node tests/smoke.mjs shinsegae
node tests/smoke.mjs shinsegae gotomall
```

배포 GLB는 293,780바이트, 삼각형 33,672개, 메시·재질 각 3개다. 일반 게임에서 7층과 11층 평양면옥 시점은 이 파일 요청이 각각 0건, 키사라 식탁 앞은 1건이었다. 같은 층 22m 안에서는 간략 집기를 표시하고, 11m 안에서 집기가 시야에 들어오면 상세 모델을 불러온다.
