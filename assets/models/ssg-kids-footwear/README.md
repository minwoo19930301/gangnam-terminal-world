# 강남점 10층 토박스

[일반 플레이 카메라](http://127.0.0.1:8765/?pos=-75.11112,45.4,7.12284&yaw=-61.2825&pitch=-12#/shinsegae/10F) · [촬영 화면](game.jpg) · [감독 카메라 설정](camera.json)

토박스코리아의 2023년 IR 자료 11쪽 오른쪽 가운데에 **신세계백화점(강남)** 매장 사진이 있다. 벽면의 아치형 선반, 앞쪽의 높이가 다른 둥근 진열대, 가느다란 검은 프레임을 모델에 반영했다. 10층 입점은 신세계와 토박스의 매장 안내에서 확인했다. [강남점 사진 11쪽](https://file.alphasquare.co.kr/media/pdfs/company-ir/20230523%ED%86%A0%EB%B0%95%EC%8A%A4%EC%BD%94%EB%A6%AC%EC%95%84_2022%EB%85%84_%EC%8B%A4%EC%A0%81_%EB%B0%8F_%ED%96%A5%ED%9B%84_%EC%A0%84%EB%A7%9D.pdf#page=11) · [신세계 층별 안내](https://www.shinsegae.com/store/floor.do?storeCd=SC00002) · [토박스 매장 안내](https://toebox.com/stockists.html)

- 씨엔타 천 신발은 발등을 여닫는 찍찍이, 둥근 고무 앞코와 낮은 뒤축을 표현했다. [메르세데스 벨크로 틴타도 레드](https://toebox.com/product/detail.html?product_no=11649)
- 미니멜리사 젤리 샌들은 발가락을 감싸는 여러 가닥의 살, 고양이 얼굴 장식과 발목 버클을 표현했다. [포제션 캣 핑크](https://toebox.com/product/detail.html?product_no=14224)
- 헌터 장화는 발을 위에서 넣는 넓은 입구, 고무 몸통과 바닥창의 단차를 표현했다. [키즈 퍼스트 클래식 레드](https://toebox.com/product/detail.html?product_no=14204)

선반 9개에 36짝, 가운데 진열대에 8짝을 놓았다. 선반의 130–180㎜ 표기와 폭 구분은 크기 차이를 보여 주는 게임용 배치다. 실제 강남점의 오늘 재고, 제품별 폭 옵션, 피팅 의자와 발 측정판 위치, 무늬와 치수는 확인되지 않았다.

## 월드 조립과 재생성

편집 원본은 `gallery.blend`의 `SSG_10F_Toebox` 컬렉션이며 메시 오브젝트 1,170개다. 미터 단위로 Blender +X는 헌터 선반 방향, −Y는 진열 정면, +Z는 위다. glTF Y-up 변환 후 월드 +Y축 회전은 −69.016135°다. 게임 논리 좌표는 (−72.570985, 45.4, 5.591659), 지형 높이 3.16m를 더한 렌더 루트 좌표는 (−72.570985, 48.56, 5.591659)다.

검증에 사용한 버전은 macOS용 Blender 3.6.23이다. 기본 설치본 4.5.11은 이 샌드박스에서 기동 중 종료되어 기존 3.6.23 헤드리스 실행 파일을 사용했다. 글자 생성에는 macOS의 AppleGothic과 Arial Bold가 필요하다.

```sh
D=assets/models/ssg-kids-footwear
/tmp/marz-blender36/Blender/Blender.app/Contents/MacOS/Blender -b --factory-startup --gpu-backend opengl --python-exit-code 1 -P "$D/build.py"
node "$D/pack.mjs"
node tests/smoke.mjs shinsegae
node tests/smoke.mjs gotomall shinsegae
```

두 smoke 테스트 모두 OK. 런타임 GLB는 318,368바이트, 메시 2개, 드로콜 2회, 삼각형 52,437개다. 신발의 같은 색 모서리 정점을 합치고 곡면을 단순화했다. 길이와 버클, 샌들의 발등 살, 장화 입구는 편집 원본에 그대로 남아 있다. 감독 렌더러의 일반 플레이 시작 화면에서 8층 같은 위치와 10층 스토케에서는 이 GLB 요청이 0건, 10층 토박스 촬영 위치에서는 1건이었다. 공용 로더가 같은 층 11m 이내에서 화면에 들어온 상세 모델을 요청하며, 대체 진열은 한 번에 그린다.
