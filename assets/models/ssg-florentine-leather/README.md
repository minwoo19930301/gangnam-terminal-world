# 신세계 강남점 벨루티

6층 남성 부티크의 목재 콘솔에 앤디 드메쥐르 로퍼와 앙주르 서류가방을 놓았다. 가까이 다가가면 로퍼의 올리브색 안감, 갑피를 두르는 손바느질과 가죽 띠의 절개, 서류가방 양쪽의 잎 모양 손잡이 받침과 사각 고리를 볼 수 있다. [게임 카메라](../../../?pos=-83.14829759183729,26.2,10.705033043508303&yaw=100.0346730179979&pitch=-15#/shinsegae/6F) · [일반 플레이 화면](game.jpg)

## 사진에서 옮긴 부분

- 신세계 6층 도면의 벨루티 자리와 브랜드의 강남점 안내를 대조했다. 벨루티가 공개한 실내 사진에서 밝은 뒷판을 가로지르는 얇은 선반, 짙은 목재 기둥, 사선으로 잘린 콘솔 앞판을 읽을 수 있다. 선반 폭과 콘솔 위치는 게임 속 방에 맞췄다. [공식 층별 안내](https://www.shinsegae.com/store/floor.do?storeCd=SC00002) · [6층 도면](https://www.shinsegae.com/cms12/SC00002/guide/floor/__icsFiles/afieldfile/2026/10/22/ogKqbBuYpuah.png) · [벨루티 강남점 사진 네 장](https://store.berluti.com/11-berluti-seoul-shinsegae-gangnam) · [구두 벽과 콘솔](https://cdn.thumbor.leadformance.com/1000x/media/clients/615ebb84a09d97da80bcf2f6/56fbf871-56b4-4517-8a16-80b31bc255b5-ssg-gn-2.jpg) · [가방 벽](https://cdn.thumbor.leadformance.com/1000x/media/clients/615ebb84a09d97da80bcf2f6/8f2d5810-2c1f-4de5-99ce-87707dbddc50-ssg-gn-3.jpg)
- 구두는 위·옆·사선 사진을 보고 각진 혀, 가늘어지는 앞코, 낮은 굽과 파티나 색 변화를 모델링했다. 앙주르 몸판은 카탈로그의 40.5 × 29 × 7.5 cm를 따랐다. 손잡이 뒷면, 트롤리 띠와 지퍼도 별도 부품이다. 색조, 진열 수량, 선반별 상품 조합은 재구성했으며 현재 재고는 확인하지 않았다. [앤디 드메쥐르](https://www.berluti.com/en-int/andy-demesure-venezia-calf-leather-loafer/297053.html) · [앙주르](https://www.berluti.com/en-int/un-jour-briefcase/M235684.html)

## 원본과 게임 배치

편집 파일은 `gallery.blend`, 컬렉션은 `SSG_6F_Berluti`다. 개별 메시 557개로 구두 15짝, 가방 8점, 선반과 콘솔을 구성했다. 원점은 벽 진열장 중앙의 바닥이다. Blender +X는 오른쪽, +Y는 진열장 뒤, +Z는 위이며 Three.js 로컬에서는 각각 +X, −Z, +Y에 해당한다. 게임 월드 원점은 (−85.952670, 29.360000, 11.269209) m, Y축 회전은 +111.034673°다. 보행 좌표의 6층 높이 26.2 m에 지형 보정을 더해 메시를 놓는다. [카메라와 메시 이름](camera.json)

Blender 3.6.23과 내장 Bfont를 사용했다. 저장소 루트에서 실행한다.

```sh
d=assets/models/ssg-florentine-leather
blender -b --factory-startup --gpu-backend opengl --python-exit-code 1 -P "$d/build.py"
node "$d/pack.mjs"
node tests/smoke.mjs shinsegae
```

GLB는 524,284바이트, 삼각형 58,199개, 근접 드로 4회다. 선반 견본에서는 미세한 가방 봉제선을 덜어내고 얇은 파이핑의 단면을 줄였다. 콘솔 견본은 봉제선을 유지한다. 호두나무 무늬는 코드로 생성해 원본과 GLB에 포함했다. 공용 로더는 같은 층의 11 m 안에서 진열대가 보일 때 상세 모델을 요청하고, 22 m까지 간략 집기를 표시한다.
