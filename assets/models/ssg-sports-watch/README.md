# 신세계 강남점 가민

8층 레져스포츠 매장의 체험대다. 화면 왼쪽의 흰색·회색 등고선 받침, 세로형 제품 안내판, 오른쪽 체험대의 거푸집 자국과 검정 상호 패널, 뒤쪽의 어두운 벽장과 흰 선반은 2023년 강남점 리뉴얼 사진에서 확인했다. 집기 치수와 간격은 게임 안의 기존 매장 폭에 맞췄다. [신세계 층별 안내](https://www.shinsegae.com/store/floor.do?storCd=SC00002) · [가민코리아 제공 강남점 실사진](https://cdn.kr.aving.net/news/photo/202307/1781313_708609_330.png) · [리뉴얼 기사와 당시 제품군](https://kr.aving.net/news/articleView.html?idxno=1781313) · [가민 공식 입점 공지](https://www.garmin.com/ko-KR/newsroom/press-release/news-2019-feb-7th-gbs/)

포러너 965에는 얇은 베젤과 투톤 밴드, 피닉스 7 Pro에는 두꺼운 베젤과 러그 나사를 넣었다. 스트랩 조절 구멍은 관통하며 버클, 러그 핀, 푸셔는 개별 부품이다. 체험대에 6점, 뒷벽에 10점을 놓았다. 제품별 수량과 배치는 추정이다. 안내판의 확대 도해와 시계 화면은 고정 예시이며, ‘965’는 모델 번호다. [포러너 965 근접 사진](https://res.garmin.com/en/products/010-02809-00/g/cf-lg.jpg) · [앰프 옐로 제품 사양](https://www.garmin.com.sg/products/wearables/forerunner-965-yellow/) · [피닉스 7 Pro 근접 사진](https://res.garmin.com/en/products/010-02777-10/g/cf-lg.jpg)

## 게임에서 보기

[매장 전경](../../../?pos=-55.35544,35.8,60.25677&yaw=11.78183&pitch=-13#/shinsegae/8F) · [일반 게임 캡처](game.jpg) · [체험대 근접 캡처](watches.jpg). 재현 좌표와 상세 메시 이름은 [camera.json](camera.json)에 있다.

## 조립과 내보내기

Blender 3.6.23에서 저장하고 다시 열어 확인한 원본은 `gallery.blend`의 `SSG_8F_Garmin` 컬렉션이다. 개별 편집 메시 1,655개에 체험용 시계와 안내판 도해 1점, 집기와 바닥이 들어 있다. 단위는 미터이며 Blender +X는 체험대 오른쪽, −Y는 손님 방향, +Z는 위쪽이다. glTF 좌표계로 변환한 뒤 월드 +Y축 기준 20.78183° 회전하고 논리 원점 (−55.99413, 35.8, 55.86812)에 놓는다. 전체 월드 지형 보정 후 원점 높이는 34.93814m다. 글자는 Blender 기본 폰트를 사용했다.

저장소 루트에서 실행한다.

```sh
D=assets/models/ssg-sports-watch
"${GTW_BLENDER_BIN:-blender}" -b --factory-startup --gpu-backend opengl --python-exit-code 1 -P "$D/build.py"
node "$D/pack.mjs"
node tests/smoke.mjs shinsegae
node tests/smoke.mjs gotomall shinsegae
```

시계 눈금을 평면으로 만들고 스트랩과 문자 외곽의 분리 정점을 용접한 뒤 meshopt로 압축했다. 최종 GLB는 187,184바이트, 삼각형 49,245개, 재질 3개와 드로콜 3회다. 같은 층 22m 안에서 대체 집기를 한 번에 그리고, 11m 안에서 집기가 시야에 들어오면 상세 파일을 요청한다.
