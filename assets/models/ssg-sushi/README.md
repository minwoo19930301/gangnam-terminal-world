# 신세계 강남점 키사라

11층 키사라의 첫 손님상이다. 금색 선을 두른 적갈색 목재 식탁에 열 점 모둠초밥, 사시미, 장국, 간장 종지와 보온 주전자를 올렸다. [일반 게임 시점](http://127.0.0.1:8765/?pos=-40.645615,50.2,95.283441&yaw=35&pitch=-45#/shinsegae/11F) · [게임 촬영본](game.jpg) · [식탁 좌우에서 본 실제 게임](table-walk.jpg) · [초밥과 식기 확대](guest-service.jpg) · [카메라 좌표](camera.json)

신세계 층별 안내와 저장된 11층 도면은 키사라를 초밥·생선회·냄비요리 전문점으로 분류한다. 운영사 아워홈도 신세계 강남점 11층 전문식당가로 안내한다. [신세계 층별 안내](https://www.shinsegae.com/store/floor.do?storeCd=SC00002) · [아워홈 키사라 지점 안내](https://ourhomehospitality.com/brand/brandBranch.do?branchSeq=422&brandSeq=10)

강남점 홀과 모둠초밥 근접 사진에서 상판의 상감선, 휘어진 등받이와 가로대, 사각 도기의 갈색 테, 흰 쟁반 속지와 검은 테, 네 점·세 점·세 점으로 나뉜 초밥 줄, 연어의 지방선과 문어 가장자리, 김을 두른 와규, 초생강과 고추냉이 위치를 참고했다. 방문자가 들어낸 분홍색 생선살 아래의 밥알도 참고해 쌀알이 드러나는 옆면과 말린 살 끝을 만들었다. 새우는 벌린 몸과 두 갈래 꼬리를 구분했다. 국물의 유부와 송송 썬 파, 곁들임 종지의 단무지·가지·마늘은 각자 입체다. 사시미는 별도 방문 사진에서 장어 정식에 곁들인 검은 접시와 무채·깻잎·레몬을 참고했다. 두 방문 때의 음식을 한 상에 모았으며 식기 치수, 의자 간격, 어종별 색은 게임용 근사치다. 표면 무늬와 메시를 직접 제작했다. [홀·식기·모둠초밥 사진](https://lifensook.tistory.com/163) · [사시미 접시 사진](https://anynovak.tistory.com/626)

## 편집과 배치

`kisara.blend`의 `SSG_11F_Kisara` 컬렉션에는 편집 가능한 메시 192개와 내장 UV 이미지 세 장이 있다. 미터 단위로 식탁 중앙 아래 바닥이 원점이며, Blender +Y는 초밥에서 사시미 쪽, +Z는 위다. glTF Y-up 변환 뒤 게임 월드 +Y축으로 20.778469° 회전한다. 배치 원점 (x, y, z)는 (−41.270814, 50.2, 94.390565), 지형 보정 후 y는 49.292다.

## 재생성

저장소 루트에서 Blender 3.6.23과 설치된 Node 패키지로 실행한다. 저장한 원본을 직접 편집한 뒤에는 첫 명령을 `blender -b --gpu-backend opengl "$D/kisara.blend" --python-exit-code 1 -P "$D/export.py"`로 바꿔 내보낼 수 있다.

```sh
D=assets/models/ssg-sushi
"${GTW_BLENDER_BIN:-blender}" -b --factory-startup --gpu-backend opengl --python-exit-code 1 -P "$D/build.py"
node "$D/pack.mjs"
node tests/smoke.mjs shinsegae
node tests/smoke.mjs shinsegae gotomall
```

배포 GLB는 773,152바이트, 삼각형 60,321개, 메시와 재질은 각각 3개다. 생선·그릇·상판의 색과 요철, 거칠기를 하나의 UV 아틀라스 세트로 묶었다. 편집 원본을 다시 열어 내보낸 결과와 처음 만든 배포 파일은 바이트 단위로 일치했다.

이 Mac의 헤드리스 Chromium에서 같은 식탁 앞을 비교했을 때 장면 전체 드로콜은 전후 모두 373회였다. 다른 층, 같은 층 원거리, 식탁 앞에서 천장을 본 상태에서 상세 파일 요청은 각 0건이었다. 식탁을 바라보며 1.05m 걸어갔다 돌아올 때는 한 번 읽었다. 같은 층 22m 안에 간략 집기가 나타나고, 11m 안에서 시야에 들어오면 이 파일을 읽는다. 실제 네트워크·기기에 따라 로딩 시간과 프레임은 달라진다.
