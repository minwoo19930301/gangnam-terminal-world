# 신세계 강남점 프리스비 (애플)

[8층 일반 플레이 카메라](http://127.0.0.1:8765/?pos=-68.76285,35.8,-23.06728&yaw=42.78827&pitch=-26#/shinsegae/8F) · [게임 화면](game.jpg) · [카메라 좌표](camera.json)

신세계 강남점 8층 디지털라이프 매장의 Mac 체험대 두 대를 복원했다. 운영사 사진에서 흰 테두리와 둥근 다리, 밝은 목재 상판, 회색 바닥, 벽면 제품 그래픽과 케이스 선반을 확인했다. 강남점 개점 당시 근접 사진에는 앞뒤로 펼친 MacBook, 제품 옆 안내 카드, 흰 충전선, 파란색·연두색 iMac과 같은 계열의 받침대가 보인다. [신세계 층별 안내](https://www.shinsegae.com/store/floor.do?storeCd=SC00002) · [운영사 매장 안내](https://galainter.com/frisbee) · [강남점 입구](https://cdn.imweb.me/thumbnail/20240524/dc9a532dbb56e.jpg) · [강남점 실내](https://cdn.imweb.me/thumbnail/20240524/4ebdb889597a9.jpg) · [MacBook과 iMac 체험대 근접 사진](https://www.leaderyou.co.kr/8813)

MacBook 다섯 대에는 힌지 배럴과 양끝 캡, 독립 키캡, 트랙패드 틈, 측면 포트와 후면 각인을 넣었다. iMac 두 대에는 얇은 패널과 기울어진 스탠드, 낮은 곡면 마우스와 무선 키보드가 있다. 현장 사진으로 칩·저장 용량·세부 SKU는 식별할 수 없어 Air·Pro와 24형 iMac의 외형만 참고했다. 기기와 집기 치수, 간격, 진열 수량은 추정값이다. 화면 도안과 안내 카드 문구는 직접 그렸다. [Apple MacBook Air 제품 사양](https://support.apple.com/ko-kr/111346) · [Apple iMac 제품 사양](https://support.apple.com/ko-kr/111895)

원본은 `gallery.blend`의 `SSG_8F_Frisbee` 컬렉션이다. 개별 부품 919개와 내장 이미지 한 장이 있다. 단위는 미터이며 원점은 노트북 테이블 중앙 바닥이다. Blender의 +X는 테이블 오른쪽, +Y는 후면 그래픽 쪽, +Z는 위다. 게임 축 변환은 `(X, Z, -Y)`이며 이후 월드 +y축으로 20.78827° 회전하고 `(-69.90282, 35.8, -23.92877)`에 배치한다. 지형을 켜면 높이에 해당 지점의 `relief(x,z)`가 더해진다.

Blender 3.6.23, macOS의 Arial 및 Apple SD Gothic Neo로 확인했다. 저장소 루트에서 다음 명령으로 도안, 편집 원본, 배포용 파일을 다시 만든다.

```sh
D=assets/models/ssg-smart-desk
node "$D/art.mjs"
"${GTW_BLENDER_BIN:-blender}" -b --factory-startup --gpu-backend opengl --python-exit-code 1 -P "$D/build.py"
node "$D/pack.mjs"
node tests/smoke.mjs shinsegae
node tests/smoke.mjs gotomall shinsegae
```

반복되는 포장 모서리의 작은 단차를 줄이고 평면 정점을 공유했다. 최종 GLB는 317,028바이트, 삼각형 42,275개, 재질 3개와 드로콜 3회다. 같은 층 22m 안에서 대체 집기를 한 번에 그리고, 11m 안에서 시야에 들어오면 상세 모델을 요청한다.
