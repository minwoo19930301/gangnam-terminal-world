# 신세계 강남점 가민

8층 레져스포츠 매장의 체험대다. 화면 왼쪽의 흰색·회색 등고선 받침, 세로형 제품 안내판, 오른쪽 체험대의 거푸집 자국과 검정 상호 패널, 뒤쪽의 어두운 벽장과 흰 선반은 2023년 강남점 리뉴얼 사진에서 확인했다. 집기 치수와 간격은 게임 안의 기존 매장 폭에 맞췄다. [신세계 층별 안내](https://www.shinsegae.com/store/floor.do?storCd=SC00002) · [가민코리아 제공 강남점 실사진](https://cdn.kr.aving.net/news/photo/202307/1781313_708609_330.png) · [리뉴얼 기사와 당시 제품군](https://kr.aving.net/news/articleView.html?idxno=1781313) · [가민 공식 입점 공지](https://www.garmin.com/ko-KR/newsroom/press-release/news-2019-feb-7th-gbs/)

포러너 965에는 얇은 베젤과 투톤 밴드, 피닉스 7 Pro에는 두꺼운 베젤과 러그 나사를 넣었다. 스트랩 조절 구멍은 관통하며 버클, 러그 핀, 푸셔는 개별 부품이다. 체험대에 6점, 뒷벽에 10점을 놓았다. 제품별 수량과 배치는 추정이다. 안내판에는 피닉스의 짙은 화면과 등고선 기단의 높이 표기 세 곳을 넣었다. 포러너의 푸른색 AMOLED 화면과 피닉스의 반사형 LCD는 직접 그린 고정 예시다. 밴드 고리와 베젤의 각인, 나사 머리는 디테일 컷에서 볼 수 있다. [포러너 965 근접 사진](https://res.garmin.com/en/products/010-02809-00/g/cf-lg.jpg) · [앰프 옐로 제품 사양](https://www.garmin.com.sg/products/wearables/forerunner-965-yellow/) · [피닉스 7 Pro 근접 사진](https://res.garmin.com/en/products/010-02777-10/g/cf-lg.jpg)

가민코리아의 매장 사진에서 안내판 뒤에 실내 자전거의 낮은 프레임, 안장과 두 개의 팬이 보인다. Tacx NEO Bike Smart 제품 사진과 설명서를 참고해 발 받침, 크랭크, 페달, 물병과 케이지, 아래로 굽은 핸들바, 팬의 날개와 그릴을 만들었다. 게임 안 모델은 길이 1.449m, 폭 0.750m, 높이 1.315m다. 안장 높이와 안내판에 대한 각도는 매장 사진 한 장으로 정할 수 없어 게임에서 조절했다. 화면 속 코스와 운동 수치도 재구성했다. [가민 공식 NEO Bike 사진](https://res.garmin.com/en/products/T8000/g/cf-lg-f262891f-ff28-4341-b11d-2b7c4faab728.jpg) · [사용 설명서와 크기](https://static.garmin.com/pumac/NEOBIKE_ML1.pdf) · [제조사 제품 소개](https://www.garmin.com/en-US/newsroom/press-release/sports-fitness/2019-revolutionary-tacx-neo-bike-smart-begins-shipping/)

## 게임에서 보기

[매장 전경](../../../?pos=-55.35544,35.8,60.25677&yaw=11.78183&pitch=-13#/shinsegae/8F) · [자전거 앞쪽](../../../?pos=-55.78531,35.8,57.17934&yaw=86.5726&pitch=-36.5891#/shinsegae/8F) · [시계 체험대](../../../?pos=-55.52979,35.8,58.16266&yaw=16.3262&pitch=-48.0742#/shinsegae/8F) · [실제 플레이 화면](game.jpg) · [트레이너 주위에서 본 두 방향](trainer-walk.jpg) · [자전거와 팬의 Blender 근접 사진](tacx-display.jpg) · [두 시계의 Blender 근접 사진](watches.jpg).

## 조립과 내보내기

Blender 3.6.23 원본의 편집 컬렉션은 `SSG_8F_Garmin`이다. 개별 메시 1,396개 중 174개가 자전거 부품이다. 시계·운동 화면의 색과 발광 이미지는 원본에 내장했다. 단위는 미터이며 Blender +X는 체험대 오른쪽, −Y는 손님 방향, +Z는 위쪽이다. glTF 좌표계로 변환한 뒤 월드 +Y축 기준 20.78183° 회전하고 논리 원점 (−55.99413, 35.8, 55.86812)에 놓는다. 전체 월드 지형 보정 후 원점 높이는 34.93814m다.

저장소 루트에서 실행한다. 원본을 직접 편집했다면 첫 명령을 `blender -b "$D/gallery.blend" --gpu-backend opengl --python-exit-code 1 -P "$D/export.py"`로 바꾼다. 편집 원본에서 다시 내보내고 압축한 결과와 빌드 결과의 바이트 일치를 확인했다.

```sh
D=assets/models/ssg-sports-watch
"${GTW_BLENDER_BIN:-blender}" -b --factory-startup --gpu-backend opengl --python-exit-code 1 -P "$D/build.py"
node "$D/pack.mjs"
node tests/smoke.mjs shinsegae
node tests/smoke.mjs gotomall centralcity shinsegae
```

금속·무광 집기·화면을 포함한 제품 표면으로 합쳐 3회에 그린다. 후면 선반에서 구분할 수 없는 1~2mm 밴드 홈과 작은 나사만 내보내기 단계에서 생략했다. 고정 카메라에서 기존과 같은 421회로 그렸으며 상세 파일은 753,820바이트, 삼각형 57,654개다. 같은 층 22m 안에서 간이 집기를 보이고, 11m 안에서 시야에 들어왔을 때 상세 파일을 한 번 요청했다. 다른 층, 먼 거리, 천장을 본 시작점의 요청은 각각 0건이었다. 자전거 옆 통로에서 1.75m의 실제 키 입력 보행도 확인했다.
