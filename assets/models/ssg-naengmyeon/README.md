# 신세계 강남점 히바린

11층 히바린의 첫 식탁에 시그니처 샘플러를 차렸다. 세 칸의 검은 접시에는 마름모 철망과 통새우카츠·유부주머니카츠·트리플 모짜체다카츠·로스카츠가 놓인다. 앞에는 미니커리우동, 뒤에는 깨를 담은 빗살 절구와 소스병 네 개를 배치했다. [일반 게임 시점](http://127.0.0.1:8765/?pos=-45.95628,50.2,81.854602&yaw=29.4168&pitch=-52#/shinsegae/11F) · [게임 촬영본](game.jpg) · [카메라 좌표](camera.json)

신세계 층별 안내의 분류는 11층 식당가 ‘히바린 (카츠/누들)’이다. 운영사 캘리스코도 강남점 신관 11층으로 안내한다. [신세계 강남점 층별 안내](https://www.shinsegae.com/store/floor.do?storeCd=SC00002) · [히바린 공식 매장 안내](https://www.kalisco.co.kr/brand/hibarin/store)

2023년 2월 강남점 방문기에 실린 실내, 메뉴판, 소스병 정면과 샘플러 전체·단면 사진을 참고했다. 치즈 속과 튀김옷, 철망 및 병 라벨은 직접 모델링했다. 식기 치수, 차림지 도안, 식탁과 의자의 위치는 게임 공간에 맞춰 재구성했다. 메뉴 구성은 촬영 당시 기준이다. [강남점 메뉴판과 음식 근접 사진](https://lifensook.tistory.com/43)

## 원본과 배치

편집 원본은 `hibarin.blend`의 `SSG_11F_Hibarin` 컬렉션이다. 개별 메시 402개이며 단위는 미터다. 원점은 식탁 중앙 아래의 바닥, Blender +Y는 소스병 쪽, +Z는 위다. glTF Y-up 변환 뒤 게임 +Y축으로 20.779637° 회전한다. 지형 보정 전 월드 원점은 (−46.394867, 50.2, 81.037019), 보정한 Y는 49.292다.

## 재생성

저장소 루트에서 Blender 3.6.23과 설치된 Node 패키지로 검증했다. 병 라벨은 AppleMyungjo로 조판해 메시로 저장한다. 다른 한글 글꼴을 쓸 때는 `GTW_KOREAN_FONT`에 글꼴 파일 경로를 지정한다.

```sh
D=assets/models/ssg-naengmyeon
"${GTW_BLENDER_BIN:-blender}" -b --factory-startup --gpu-backend opengl --python-exit-code 1 -P "$D/build.py"
node "$D/pack.mjs"
node tests/smoke.mjs shinsegae
node tests/smoke.mjs shinsegae gotomall
```

배포 GLB는 579,744바이트, 삼각형 52,145개, 메시·재질 각 2개로 두 번에 그린다. 일반 게임에서 7층과 11층 평양면옥에서는 이 파일 요청이 0건, 히바린 식탁 앞에서는 1건이었다.
