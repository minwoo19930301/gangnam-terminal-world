# 신세계 강남점 10층 파타고니아 키즈

[일반 게임 카메라](http://127.0.0.1:8765/?pos=-88.873144,45.4,4.257634&yaw=119.47946&pitch=-12#/shinsegae/10F) · [게임 화면](game.jpg) · [카메라·조립 정보](camera.json)

강남점 층별 안내에는 10층 아동스포츠의 ‘파타고니아키즈’로 등재돼 있다. 2023년 강남점 개점 사진에서 분홍 후드를 쓴 어린이와 흰 비니를 쓴 어린이의 높이 차, 곡선 목재 진열대의 열린 수납칸, 접은 분홍·민트색 재킷, 붉은 러그와 세로결 상호 벽을 확인했다. 게임에서는 두 마네킹과 패딩 6벌의 행거, 접은 재킷 12벌을 기존 점포 폭에 맞춰 배치했다. 전시 기준은 개점 당시이며 집기 치수, 러그 도안, 산 그림과 현재 재고는 현장에서 확인하지 않았다. [신세계 공식 층별 안내](https://www.shinsegae.com/store/floor.do?storeCd=SC00002) · [강남점 개점 사진 기사](https://tnnews.co.kr/archives/160211) · [매장 전경](https://tnnews.co.kr/wp-content/uploads/2023/11/파타고니아-키즈-모노-스토어-신세계백화점-강남점_010.jpg) · [중앙 진열대 근접 사진](https://tnnews.co.kr/wp-content/uploads/2023/11/파타고니아-키즈-모노-스토어-신세계백화점-강남점_050.jpg)

몸판과 소매의 가로 누빔을 봉제선에서 좁아지는 곡면으로 만들었다. 후드 입구와 안감, 사선 주머니, 지퍼 손잡이, 비니의 골지 접단은 별도 메시다. 점포 사진으로 확인하기 어려운 다운 재킷의 봉제 구조에는 제조사의 키즈 하이로프트 다운 스웨터 후디를 참고했다. 사진 속 개별 상품의 품번은 확인되지 않았다. [파타고니아 제품 사진과 사양](https://www.patagonia.com/product/kids-hi-loft-down-sweater-hoody/68645.html)

## 원본과 배치

편집 원본은 `gallery.blend`의 `SSG_10F_PatagoniaKids` 컬렉션에 들어 있다. 메시 496개와 자체 생성한 UV 목재 결 이미지를 원본에 저장했다. 단위는 미터다. 진열대 아래 바닥을 원점으로 Blender +X는 비니 마네킹 쪽, −Y는 고객 정면, +Z는 위다. glTF Y-up 변환 후 월드 +Y축으로 111.044598° 회전한다. 논리 원점은 (−91.187679, 45.4, 5.566040), 지형 보정 후 렌더 원점은 (−91.187679, 48.56, 5.566040)이다.

근접 모델은 461,980바이트, 삼각형 44,579개, 재질·드로콜 각 3개다. 누빔 내부의 반복 단면을 줄이고 meshopt로 압축했다. 일반 플레이의 매장 안 카메라에서는 모델 요청 1건과 ‘파타고니아 키즈 · 10F’ HUD를 확인했다. 9층 같은 지점과 10층 약 38m 밖에서는 요청이 각각 0건이었다.

## 재생성

저장소 루트에서 실행한다. Blender 3.6.23으로 제작·검증했다. 매장명에는 시스템의 Georgia Bold를 사용하며 서체가 없는 환경에서는 Blender 기본 서체를 사용한다. 저장된 글자는 메시다.

```sh
D=assets/models/ssg-junior-outerwear
"${GTW_BLENDER_BIN:-blender}" -b --factory-startup --gpu-backend opengl --python-exit-code 1 -P "$D/build.py"
node "$D/pack.mjs"
node tests/smoke.mjs shinsegae
node tests/smoke.mjs gotomall shinsegae
```
