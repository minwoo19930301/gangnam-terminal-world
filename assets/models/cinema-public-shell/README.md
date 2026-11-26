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

The east aisle’s floor, ceiling, room label, north partition, shop lintels, signs and central connection follow this edit. The south coffee bar and the backs of Wine House and Osulloc retain their positions. Other items in the library are reference meshes recaptured from their production builders. The adjacent shopfront models keep their own editable collections.
