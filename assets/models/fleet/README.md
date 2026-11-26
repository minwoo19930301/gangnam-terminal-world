# 거리의 차량

주차 차량과 도로를 달리는 차량은 같은 Blender 원본을 쓴다. `taxi` 컬렉션에서는 펜더와 트렁크의 굴곡, 유리 기둥, 5쌍의 휠 스포크, 노란 번호판, 앞뒤 램프와 지붕 표시등을 편집할 수 있다. 표시등 앞면에는 서울시가 안내한 사업구역명 **서울**을 넣었다. 분할 전조등과 가로 주간주행등은 2025년형 쏘나타 택시의 제작사 자료를 참고했다. 차체 형태와 갓등 치수는 게임 속 서울 세단을 위해 그렸다. [Blender 원본](terminal-fleet.blend) · [게임 낮·밤 및 원본 비교](taxi-comparison.jpg) · [서울시 택시 표시등 안내](https://news.seoul.go.kr/traffic/archives/34980) · [현대자동차 영업용 쏘나타 자료](https://www.hyundai.com/contents/repn-car/catalog/sonata-taxi-25-price.pdf)

갓등·주간주행등·후미등의 발광색과 세기는 Blender의 Principled BSDF에서 읽어 기존 외장재 그리기에 합친다. 게임의 조명은 연출 값이다. 택시 한 대는 삼각형 1,328개이며, 멀리 보이는 바퀴에는 기존의 낮은 상세도를 적용한다. 전 차종의 바퀴 접점과 차체 크기는 이전과 같다.

`meshes.js`는 색과 치수, 바퀴 위치를 바로 제공한다. 정점과 면은 차종별로 처음 사용할 때 복원한다. 밀리미터 정수와 삼각형 순서, 재질 인덱스를 원래 배열과 전수 비교했다. 7개 차종 자료와 복원 코드를 합한 크기는 69,820바이트다. gzip으로 11,050바이트, Brotli로 8,986바이트였다. 실제 전송량은 호스트 압축 설정에 따른다.

저장한 원본에서 게임 메시를 내보내고 바퀴의 Jolt 접점을 확인하려면 저장소 루트에서 실행한다.

```sh
D=assets/models/fleet
blender --factory-startup -b "$D/terminal-fleet.blend" --python-exit-code 1 -P "$D/build_fleet.py" -- --export-current
node tests/fleet-regressions.mjs
node tests/fleet-contact.mjs
```
