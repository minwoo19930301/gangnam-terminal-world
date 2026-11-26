# 방문객

[visitors.blend](visitors.blend)에는 서 있는 사람, 앉은 사람, 쇼핑백이 들어 있습니다. 재킷, 바지, 머리, 피부, 신발, 가방을 분리해 옷과 소품의 색을 게임에서 개별 적용합니다. 원거리 버전은 동일 메시를 참조하는 Blender 단순화 모디파이어를 사용합니다. 게임은 거리 40m 밖의 배치 묶음에 원거리 모델을 사용합니다.

```sh
blender --factory-startup -b assets/models/visitors/visitors.blend -P assets/models/architectural-retail/export.py
```
