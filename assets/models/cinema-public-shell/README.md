# 신세계 B1 원형 광장과 식품관 카페 통로

`public-shell.blend` contains the existing game’s rotary, public ticket lobby, diagonal approach, cross-aisle, café and bookstore thresholds, and the shallow adjoining retail bays. The tracing uses the department store’s 25 November B1 customer guide. Positions, walls and soffits follow the game’s approximate registration. [Operator floor guide](https://www.shinsegae.com/cms12/SC00002/guide/floor/__icsFiles/afieldfile/2026/11/25/GnV7UuBEdq7K.png)

The source collection is `Shinsegae_B1_Cinema_Public_Shell`. Link it at identity. Each vertex already contains the game terrain offset at that corner, with Blender axes `(game x, −game z, game elevation + relief)` in metres. The concave floors and ceilings use the game’s triangles. The standalone view opens from above with the ceiling collection hidden. Toggle **Ceilings and soffits** to inspect the overhead faces. The game continues to construct the shell directly from its kit calls.

## Edit the café cross-aisle width

1. In the standalone file, enter Edit Mode on **East cross-aisle floor**, deselect all vertices and select the **North edge** vertex group. Move its three vertices horizontally along their respective guide axes. The middle vertex follows the corner of the coffee bar where the two plan fits meet. One guide pixel spans about 0.145 m on the department side and 0.130 m on the Sweet Park side.
2. Save the edited file. Run the export from the repository root. It snaps the edge to the nearest guide pixel. The supported range is guide rows 770–783, between the fixed backs of the north shops and the south shopfronts.
3. Reimport the shell so the dependent ceilings, partitions and threshold meshes receive the edited contour and terrain height. Commit the refreshed standalone library and the guide coordinate together.

```sh
asset=assets/models/cinema-public-shell
blender -b "$asset/public-shell.blend" --python-exit-code 1 -P "$asset/edit.py" -- export
git diff -- assets/models/megabox-central/layout.js
blender -b --python-exit-code 1 -P "$asset/edit.py" -- import
node tests/cinema-native-shell.mjs
```

An optional path after `export` writes a scratch copy of the game layout. An optional path after `import` saves the capture as a separate Blender file. Set `BLENDER` to the executable path for the test if Blender is outside `PATH`.

The east aisle’s floor, ceiling, room label, north partition, shop lintels, signs and central connection follow this edit. The south coffee bar and the backs of Wine House and Osulloc retain their positions. Other items outside the editable boundaries are reference meshes recaptured from their production builders. The adjacent shopfront models keep their own editable collections.


## 행사장 옆 원형 광장 통로

**원형 광장 옆 통로 · floor**의 **Event wall corner** 버텍스 그룹에는 행사장 쪽 직선 벽과 광장이 만나는 꼭짓점이 있다. 이 점을 수평으로 옮기고 파일을 저장하면 바닥과 천장, 같은 선을 따르는 보행 충돌벽을 함께 조정할 수 있다. 편집값은 층도에서 읽은 원래 모서리 기준의 미터 단위 이동량으로 기록한다.

```sh
asset=assets/models/cinema-public-shell
blender -b "$asset/public-shell.blend" --python-exit-code 1 -P "$asset/edit.py" -- export-west
blender -b --python-exit-code 1 -P "$asset/edit.py" -- import
```

모델은 공식 도면의 서쪽 지하철 방향 개구부를 보존한다. 게임에서 그 경계 너머로 연결되는 바닥은 현재 확인되지 않았다. [강남점 지하 1층 고객용 안내도](https://www.shinsegae.com/cms12/SC00002/guide/floor/__icsFiles/afieldfile/2026/11/25/GnV7UuBEdq7K.png)
