# 신세계 강남점 10층 스토케

[일반 게임에서 진열대 보기](http://127.0.0.1:8765/?pos=-36.217887793962426,45.4,56.51224045974328&yaw=29.783130756195895&pitch=-19#/shinsegae/10F) · [같은 시점의 게임 화면](game.jpg) · [촬영 좌표](camera.json)

저장된 강남점 층별 안내에서 스토케는 10층 신생아 매장으로 분류된다. 수정 전 게임에서 부가부 옆 스토케 구획과 간이 유모차 진열을 확인했다. 의자 두 대의 구성과 색상, 여섯 가지 마감 견본, 진열대 배치는 제품 비교를 위해 정했다. 이 배치를 보여 주는 강남점 현장 사진은 확인하지 못했다. [신세계 강남점 층별 안내](https://www.shinsegae.com/store/floor.do?storeCd=SC00002)

왼쪽 의자는 곡목 등받이 두 장과 높이 조절 홈을 볼 수 있도록 돌려 놓았다. 오른쪽 의자는 가장 높은 홈에 좌판을 끼우고 베이비 세트의 등받이와 앞쪽 가드 위에 트레이를 얹었다. 좌판 높이는 의자 바닥 기준 각각 49.5cm와 56.5cm다. [스토케 의자 자료](https://support.stokke.com/hc/en-us/articles/44348332711825-General-info-Tripp-Trapp-Chair) · [공식 치수](https://support.stokke.com/hc/en-us/articles/47105946138641-Commonly-requested-measurements) · [베이비 세트](https://support.stokke.com/hc/en-us/articles/44352305148433-General-info-Tripp-Trapp-Baby-Set-Harness) · [트레이 결합 방식](https://support.stokke.com/hc/en-us/articles/46240392344593-Tray-is-tilting-Tray-will-not-attach-to-the-Tripp-Trapp-Baby-Set)

## 원본 배치와 검증

편집용 파일은 `gallery.blend`, 컬렉션은 `SSG_10F_Stokke`다. 원점은 진열대 중앙 바닥이고 단위는 미터다. Blender +X는 견본판 방향, −Y는 진열대 정면, +Z는 위다. glTF Y-up 변환 후 일반 게임의 월드 좌표 **(−37.233617, 45.4, 54.737598)** 에 놓고 +Y축으로 **20.781376°** 회전한다.

원본은 메시 101개다. 게임용 GLB는 메시 2개, 드로콜 2회, 삼각형 21,427개, 218,776바이트다. 매장 상세를 생성할 때 간이 진열과 층 필터용 메시를 등록한다. 같은 층에서 진열대 쪽을 보고 11m 이내로 접근하면 상세 모델을 읽는다. 실패하면 간이 진열을 유지하고 5초 뒤 재시도한다.

감독 렌더러의 개별 일반 게임 시작 화면에서 8층 같은 좌표와 10층 35m 밖의 GLB 요청은 각각 0건이었다. 촬영 좌표에서는 1건이었고 HUD에 ‘스토케 · 10F’가 표시됐다. 아래 두 스모크 테스트가 모두 OK를 출력했다.

## 다시 만들기

저장소 루트에서 실행한다. 검증 환경은 macOS, Blender 3.6.23이며 글자 메시는 시스템 서체 AppleGothic과 Arial Bold로 만든다.

```sh
D=assets/models/ssg-stokke
blender -b --factory-startup --gpu-backend opengl --python-exit-code 1 -P "$D/build.py"
node "$D/pack.mjs"
node tests/smoke.mjs shinsegae
node tests/smoke.mjs gotomall shinsegae
```
