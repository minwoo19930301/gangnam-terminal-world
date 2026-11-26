# 경부선 1층 승차홈 대기의자

승객이 찍은 2026년 5월 사진 IMG＿9027에서 은색 의자의 일체형 등판, 뒷면에 두 줄씩 눌린 가로 홈, 둥근 팔걸이, 벌어진 회색 다리와 검은 발, 끝에 달린 나무색 선반을 확인했다. 사진을 재배포하지 않고 원본을 참고해 블렌더에서 형상을 제작했다. 폭과 높이, 하부 연결보와 선반 결합 방식은 기존 좌석 간격 57cm에 맞춘 추정이다. [대합실 원본 사진](https://m.blog.naver.com/biinuuuu/224289206124)

기존 승차홈 창가 배치를 따라 두 자리와 네 자리 연결의자를 두었다. 29·30번 사이 창가에는 모델 속 세 줄 위치를 유지하고 겹친 네 자리 한 줄을 정리했다. 보조 선반이 실제 이 창가에 세 개 있는지는 확인하지 못했다. 인접 문과 유리창 사이의 점자블록을 비워 두었고, 30번 문에서 외벽 폴리곤의 경계에 남아 있던 충돌면을 잘랐다.

편집 원본은 [waiting-benches.blend](./waiting-benches.blend)다. 터미널에서 좌석을 바라보고 16m 안으로 접근하면 하나의 [GLB](./waiting-benches.glb)를 요청한다. 20m 밖으로 물러나면 간략한 모델로 되돌아간다. 창가의 같은 의자 세 줄은 인스턴스 한 배치로 그린다.

배치를 게임에서 확인할 수 있는 주소는 `#/gyeongbu/1F?p=190.951,0,-104.713,-116.92`다. 원본을 다시 생성하거나 편집한 파일에서 GLB만 내보낼 수 있다.

```sh
blender -b --threads 2 -P assets/models/gyeongbu-seating/build.py
blender -b assets/models/gyeongbu-seating/waiting-benches.blend --threads 2 -P assets/models/gyeongbu-seating/export.py
```
