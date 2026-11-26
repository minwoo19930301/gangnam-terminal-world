# 파미에 메모리얼 광장

에스컬레이터 사이의 세로 전광판, 고리 안에 유백색 갓이 매달린 조명, 1층 포비 앞 빨간 철제 좌석, 관엽수 화분과 어두운 포석을 모델링했습니다. 미디어 운영사가 공개한 광장 사진에서 외형과 색을 참고했고, 치수와 가구 간격은 기존 보행 공간에 맞췄습니다. 광고가 걸린 시기의 사진을 참고해 광장 쪽에 화면을 놓았고 반대 면에는 기존 모형의 시계가 보입니다. 양면이 동시에 운용되는지, 현재 어떤 광고가 나오는지는 확인하지 못했습니다. 사진의 광고 대신 Blender에서 아치와 종이 새로 만든 원화를 화면에 넣었습니다. [매체 운영사의 광장 사진](https://www.stardolad.com/our-mediasangsejepum/famillestation-ds) · [포비 강남 운영사 안내](https://www.shinsegaecentral.com/famille/fourb)

[통합 집기 파일](atrium-fittings.blend)에는 설치 모형, 전광판의 종이 입체 원화, 4×4 포석 마감 견본이 개별 장면으로 들어 있습니다. 실제 게임에서는 화분 네 개, 철제 식탁 세 조와 갓 조명 여섯 개가 각각 같은 메시를 공유합니다. 관엽수의 잎과 줄기, 철제 좌석은 가까이서 볼 때 상세 모델을 내려받습니다. 원화 및 포장 마감은 Blender에서 렌더한 WebP입니다. [게임 화면 전후](court.jpg)

저장소 루트에서 다음 명령을 실행하면 모델과 텍스처를 재생성할 수 있습니다.

```sh
blender -b --factory-startup -t 2 --python-exit-code 1 -P assets/models/famille-atrium/build.py
```
