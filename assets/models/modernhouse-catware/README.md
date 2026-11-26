# 모던하우스 강남점 고양이 식기 매대

이랜드 층별안내에서 모던하우스는 뉴코아 강남점 1관 4층에 있다. 서울관광재단이 2026년 9월 2일 소개한 지점 사진에는 회색 매대 위로 흰 도기 공기, 귀 모양이 솟은 종지, 검정·갈색 얼룩의 고양이 장식, 분홍색 원접시와 세워 둔 쟁반 두 개가 보인다. 뒤쪽 포장 컵에 찍힌 ‘15,900’과 ‘4P’도 그 사진을 따랐다. 촬영 당시의 상품 표시다. [이랜드 강남점 층별안내](https://www.elandretail.com/store02.do?branchID=00110001&lang=000600KO) · [서울관광재단 강남점 소개](https://korean.visitseoul.net/gangnam/modernhouse-life/KOPw8jvg2) · [네 번째 지점 사진](https://korean.visitseoul.net/comm/getImage?srvcId=MEDIA&parentSn=81852&fileTy=MEDIA&fileNo=2)

게임에서는 주방용품 칸 안쪽에 있던 흰색·녹색 그릇이 놓인 목재 선반 한 개를 교체했다. 매대의 정확한 지점 내 위치와 그릇 수량은 기존 공간에 맞춘 근사값이다. 왼쪽은 변경 전, 오른쪽은 변경 후다. 위는 낮, 아래는 밤의 근접 화면이다. [진열 앞에서 게임 열기](https://minwoo19930301.github.io/gangnam-terminal-world/#/newcore/4F?p=291.87749,14.2,-331.97836,-73.67952,-23) · [게임 비교](comparison.jpg)

4층 기본 도착점에서 공용 통로로 약 38m를 걸은 뒤 주방 칸으로 약 6m 들어가면 진열 앞에 선다. 매대를 등지거나 위층에 있을 때는 상세 파일을 받지 않는다. 옆 선반과 통로 사이에서 앞을 보고 8.5m 안으로 다가가면 87,140바이트 파일을 한 번 받는다. 640삼각형 간략 모델과 13,520삼각형 근접 모델은 각각 한 번에 그린다. 동일한 22시 화면을 잘라 왼쪽에 파일 응답을 보류한 상태, 오른쪽에 상세 파일 표시 후를 담았다. [컵 포장 인쇄 비교](cup-label.jpg)

[Blender 원본](catware.blend)에서 도기의 겹친 테두리, 고양이와 귀의 얼룩, 쟁반, 종이 슬리브와 진열 선반을 따로 편집할 수 있다.

```sh
blender -b assets/models/modernhouse-catware/catware.blend --python-exit-code 1 -P assets/models/modernhouse-catware/export.py
node assets/models/modernhouse-catware/check.mjs
```
