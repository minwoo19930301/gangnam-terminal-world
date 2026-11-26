# 신반포로 중앙 출입구 옆 이디야·달리나인

경부선 부속상가 정면의 이디야와 달리나인을 거리에서 본 모습이다. 이디야의 흰색 입체 워드마크와 안쪽의 작은 글자, 파란 층간 패널을 따로 만들었다. 달리나인의 남색 강판 간판 아래에는 벽돌 아치창 다섯 개가 있다. 창을 비스듬히 보아도 창틀 안쪽의 깊이, 매달린 조명과 테이블이 보인다. 옥상 주차장의 난간은 두 점포 구간에서 뒤로 물려 철제 스크린과 덮인 연결통로의 윤곽을 살렸다.

[일반 플레이 거리 화면](street.jpg) · [달리나인 아치창](arches.jpg) · [이디야 정면 글자와 창](ediya.jpg) · [같은 시점의 밤](night.jpg) · [변경 전후](comparison.jpg)

## 자료와 해석

- [운영사 부속상가 층별 안내](https://exterminal.co.kr/include/floor_sub.asp?floornum=sf2)에서 1층 36번 이디야, 2층 1번 달리나인을 확인했다. [공식 1층 지도](https://exterminal.co.kr/images/n_floorf1_sub.jpg) · [공식 2층 지도](https://exterminal.co.kr/images/n_floorf2_sub.jpg).
- [네이버지도 신반포로 2026년 1월 거리뷰](https://map.naver.com/p/entry/place/11567199?c=15.00,0,0,0,adh&p=mEuEgCESVhlx5M-gkmmdWQ,145,5,39,Float)와 [두 점포의 확대 화면](https://map.naver.com/p/entry/place/11567199?c=15.00,0,0,0,adh&p=mEuEgCESVhlx5M-gkmmdWQ,150,5,25,Float)에서 아치 개수, 강판과 벽돌의 색, 흰 영문 간판과 로마자 상호, 파란 패널, 위쪽의 철제 실루엣을 확인했다.
- [서울영상위원회 FILM KOREA 경부선 로케이션](https://www.filmkorea.or.kr/location/location_view.jsp?id=10126)의 [점포와 정문을 함께 찍은 사진](https://filmkorea.ecn.cdn.infralab.net/2/dest/202306/11459.png)에서 안으로 들어간 창과 간판의 돌출을 대조했다. 이디야 글자는 [브랜드 CI](https://www.ediya.com/C/contents/company.html)의 대문자 비례를 참고해 편집 가능한 입체 윤곽으로 제작했다.
- 모델 기준점은 경부선 로컬 격자 `u87.5, v−0.05`다. 사진에 보이는 정문과 아치창의 비율로 두 점포의 폭을 정하고, 기존 공개 출입구 `u80`의 3 m 개구부 및 기존 2층 슬래브에 맞췄다. 실내에서 도로 쪽으로 드러나는 가구와 등은 형태의 재현이다. 점포별 상품 목록과 실측 치수, 11월 현장 영업 상태, 스크린 안쪽의 연결 경로는 확인하지 않았다.

## 게임과 블렌더

[cafes.blend](cafes.blend)에는 창틀·창·벽돌·강판·조명·문자 원본·스크린·원거리 메시가 들어 있다. 원본 사진 픽셀은 사용하지 않았다. 벽돌의 줄눈과 구운 색 편차, 접힌 도장 금속, 코발트색 패널을 1024×512 아틀라스 한 장에 넣어 파일 안에 패킹했다.

거리에서 멀리 보면 1 draw와 1,136개 삼각형으로 두 점포와 상부를 그린다. 정면이나 상부가 카메라 시야에 들어오고 거리가 46 m 이내일 때 183,656 B GLB를 요청한다. 근거리에는 재질 4개와 삼각형 9,429개를 사용한다. 같은 게임 페이지에서 다시 접근하면 캐시를 재사용한다.

```sh
blender -b --threads 2 --python-exit-code 2 --python assets/models/gyeongbu-front-cafes/build.py
node assets/models/gyeongbu-front-entrance/pack.mjs assets/models/gyeongbu-front-cafes/cafes.glb
node assets/models/gyeongbu-front-cafes/check.mjs /tmp/gb-front-cafes
```

검사는 일반 게임에서 거리→부속상가 1층→거리 키보드 보행, 개구부 옆 고정 유리 충돌, 지하와 등 뒤의 미요청, 원거리 전환과 재진입, 5개 시간 모드를 확인한다. 점포 차양, 뒤쪽 옥상 주차장, 인접 주차장의 지지면과 난간 충돌도 별도로 검사한다.
