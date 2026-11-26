# 신세계 강남점 밀화

11층 밀화의 2인용 국수전골 식탁이다. 입구 쪽 첫 식탁에서 황동색 고리 손잡이와 리벳이 달린 냄비, 매립 화구와 조절 손잡이, 칼국수 면과 배추, 네 가지 찬기, 들깨 소스 샐러드, 물잔과 ‘밀화’가 인쇄된 수저 받침을 볼 수 있다. [일반 게임 카메라](http://127.0.0.1:8765/?pos=-14.340953331053893,50.2,71.23044034758838&yaw=17&pitch=-42#/shinsegae/11F) · [게임 촬영본](game.jpg) · [시점과 조립 정보](camera.json)

신세계 강남점 층별 안내와 저장된 안내 자료에는 11층 식당가의 ‘밀화 (샤브샤브/전골)’가 실려 있다. 식탁과 음식은 2022년 2월 공개된 강남점 방문 사진을 참고했다. 11번 사진에 실내 좌석과 물잔, 13번에 냄비의 굽은 손잡이와 화구, 14~19번에 둥근 찬기와 모서리가 둥근 사각 찬기가 보인다. 식탁 치수, 의자 등살의 간격, 무늬목 수종과 반찬 배치는 추정했다. 국수전골은 재료를 넣고 익히는 중간 모습으로 재구성했다. 식기 제조사와 제품 모델명은 확인되지 않았다. [신세계 강남점 층별 안내](https://www.shinsegae.com/store/floor.do?storeCd=SC00002) · [강남점 방문기와 메뉴·상차림 사진](https://www.mimint.co.kr/bbs/view/restaurant/1911?page=21&pageblock=21) · [냄비 근접 사진](https://img.mimint.co.kr/food/bbs/2022/2/21/20220221104702_iaupdpoy.jpg) · [반찬과 수저 받침](https://img.mimint.co.kr/food/bbs/2022/2/21/20220221104702_fqmhrpvi.jpg)

## 원본과 재생성

편집 원본은 `milhwa.blend`의 `SSG_11F_Milhwa` 컬렉션이다. 원점은 식탁 바로 아래 바닥이다. Blender +X는 양쪽 의자를 잇고 +Y는 찬기 쪽을 향하며 +Z는 위다. 단위는 미터다. glTF Y-up 변환 뒤 게임 월드 Y축으로 +20.779555° 회전한다. 게임 배치 좌표는 (−14.691799, 50.2, 70.082875)이고 전체 월드에서 지형 보정을 적용한 원점 높이는 49.292m다.

Blender 3.6.23과 macOS AppleMyungjo로 생성했다. 원본의 글자는 메시이며 무늬목 UV 이미지는 파일에 내장돼 있다. 저장소 루트에서 실행한다.

```sh
D=assets/models/ssg-korean-table
"${GTW_BLENDER_BIN:-blender}" -b --factory-startup --gpu-backend opengl --python-exit-code 1 -P "$D/build.py"
node "$D/pack.mjs"
node tests/smoke.mjs shinsegae
node tests/smoke.mjs gotomall shinsegae
```

원본을 다시 열어 편집 메시 461개를 확인했다. 물에 잠긴 거품 아래쪽과 들깨 밑면을 생략하고 목재 무늬를 JPEG로 압축했다. 배포 GLB는 501,380바이트, 삼각형 56,465개이며 목재·상차림·금속을 3회에 나누어 그린다. 일반 게임에서 밀화 앞의 GLB 요청은 1건, 9층과 11층 히바린 앞에서는 각각 0건이었다. 신세계 단독과 고투몰 연결 smoke 검사를 모두 통과했다.
