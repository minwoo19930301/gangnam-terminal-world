# Blender 차량의 노면 접점

주행 차량의 기울기는 길 위에서 앞·뒤와 좌·우 바퀴 밑의 표고를 읽어 정한다. Blender에서 각 바퀴의 가장 낮은 트레드 정점을 찾아 좌우 바퀴 사이 간격과 축간거리를 내보낸다. 장면이 이 값을 읽으므로 추후 차체 폭이나 휠 위치가 바뀌면 같은 원본에서 갱신할 수 있다. 기존 승용차는 차체 중심에서 0.925m 떨어진 곳을 읽었고, 실제 모형의 타이어 접점은 0.890m였다.

JoltPhysics.js의 Emscripten WebAssembly 빌드에 게임과 같은 삼각형을 넣고, 각 바퀴 바로 아래에서 수직으로 광선을 쏘아 노면 접촉 높이를 확인했다. 승용차·택시·밴·트럭·고속버스·시내버스·마을버스 7종의 접점 28개 모두 2mm 허용 범위 안에 들었다. 기존 차량 주행 경로와 인스턴스 렌더는 Three.js가 계속 담당한다. [JoltPhysics.js](https://github.com/jrouwe/JoltPhysics.js)

```sh
npm ci
node tests/fleet-contact.mjs
node tests/fleet-regressions.mjs
```
