# 신세계 강남점 B1 마켓 판매장 바닥

The single nine-corner face traces the market on the [official B1 customer floor guide](https://www.shinsegae.com/cms12/SC00002/guide/floor/__icsFiles/afieldfile/2026/11/25/GnV7UuBEdq7K.png). The registration is approximate. Blender uses metres and the existing city origin. Game coordinates (x, y, z) correspond to Blender (x, −z, y).

Link collection `Shinsegae_B1_Market_Floor` from `market-floor.blend` into the master at identity. In the standalone library select **Market sales floor**, enter Edit Mode and adjust the existing corners in the horizontal plane. Keep the diagonal corner, straight edges, and the two stepped west wings. To shift a straight wall, move its two end vertices together parallel to the adjoining edges. Keep the perimeter at −6 m.

The canonical registered coordinates are `marketOutline` in `js/places/shinsegae-b1-plan.js`. The exporter projects vertex positions back to the nearest operator-guide pixel. The sales-floor surface, room label polygon, and both building owners’ shared west perimeter consume that outline directly.

Run from the repository root with Blender and Node on PATH:

```sh
asset=assets/models/shinsegae-market-floor
blender -b "$asset/market-floor.blend" --python-exit-code 1 -P "$asset/edit.py" -- export
git diff -- js/places/shinsegae-b1-plan.js
blender -b --python-exit-code 1 -P "$asset/edit.py" -- import
node tests/shinsegae-market-floor.mjs
```

Import rebuilds the standalone mesh from the snapped coordinates. To inspect a scratch copy, append an output .blend path after `import`. Commit the refreshed library alongside the coordinate change. Existing entrance artwork and grocery displays retain their own anchors, so check them visually when changing the tracing.
