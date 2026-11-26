"""Reopen the shipped master, round-trip it, then try edits in memory."""

import gzip
import json
import runpy
import sys
from pathlib import Path
import bpy

here = Path(__file__).resolve().parent
out = Path(sys.argv[sys.argv.index("--") + 1])
city = bpy.data.scenes["반포 · 도시 전경"]
gallery = bpy.data.scenes["시설 · 모델 라이브러리"]
libs = [lib for lib in bpy.data.libraries if lib.parent is None]
assert all(
    lib.filepath.startswith("//")
    and not lib.is_missing
    and Path(bpy.path.abspath(lib.filepath)).is_file()
    for lib in libs
)
assert set(
    p.resolve() for p in here.parent.glob("*/*.blend") if p.parent != here
) == set(Path(bpy.path.abspath(lib.filepath)).resolve() for lib in libs)
for image in bpy.data.images:
    if not image.library and image.source == "FILE":
        assert image.packed_file and image.filepath.startswith("//textures/")
# Refresh must preserve existing placements and must not duplicate shelves.
placements = {o.name: o.matrix_basis.copy() for o in gallery.objects}
refresh = runpy.run_path(str(here / "libraries.py"))["link_asset_gallery"]
assert refresh(here) == gallery
assert len(gallery.objects) == len(placements) >= 80
assert all(o.matrix_basis == placements[o.name] for o in gallery.objects)
# In the shipped gallery each shelf gets a separate row and each item its own column.
bpy.context.window.scene = gallery
graph = bpy.context.evaluated_depsgraph_get()
bounds_for = runpy.run_path(str(here / "libraries.py"))["instance_bounds"]
rows = []
for shelf in gallery.collection.children:
    bounds = [bounds_for(o, graph) for o in shelf.objects if o.instance_collection]
    if not bounds:
        continue
    columns = sorted((lo.x, hi.x) for lo, hi in bounds)
    assert all(b[0] - a[1] > 2.4 for a, b in zip(columns, columns[1:])), shelf.name
    rows.append((min(lo.y for lo, hi in bounds), max(hi.y for lo, hi in bounds)))
rows.sort()
assert all(b[0] - a[1] > 5.9 for a, b in zip(rows, rows[1:]))
bpy.context.window.scene = city
assert len(city.timeline_markers) == 4
sun = city.objects["서울 태양"]
city.frame_set(750)
midday = sun.data.energy
city.frame_set(1320)
assert sun.data.energy < 0.01 and midday > 1
city.frame_set(750)
exporter = runpy.run_path(str(here / "export.py"))["export_buildings"]
roads = runpy.run_path(str(here / "road-axes.py"))["export_axes"]
terrain = runpy.run_path(str(here / "height-controls.py"))["export_controls"]
street = runpy.run_path(str(here / "street-layout.py"))["export_street_layout"]
bpy.context.window.scene = gallery
exporter(out / "original.gz")
with gzip.open(out / "original.gz", "rb") as exported, gzip.open(here / "buildings.json.gz", "rb") as shipped:
    assert exported.read() == shipped.read(), "Blender export differs from the shipped building data"
for fn, name in [
    (roads, "road-edits.js"),
    (terrain, "height-edits.js"),
    (street, "street-edits.js"),
]:
    fn(here, out / name)
    assert (out / name).read_bytes() == (here / name).read_bytes()
target = next(o for o in city.objects if o.get("game_shell") == "city")
target.location.z += 1.25
road = next(
    o for o in city.objects if o.get("way_id") and len(o.data.splines[0].points) > 2
)
road["road_width"] += 0.5
road.data.splines[0].points[1].co.x += 0.75
grid = next(o for o in city.objects if o.get("terrain_grid") == "garden")
index = len(grid.data.vertices) // 2
grid.data.vertices[index].co.z += 0.75
city.view_layers[0].update()
exporter(out / "changed.gz")
roads(here, out / "changed-roads.mjs")
terrain(here, out / "changed-height.mjs")
placement_groups = [o for o in city.objects if o.get("street_layout_kind")]
placement_counts = {
    o["street_layout_kind"]: len(o.data.vertices) for o in placement_groups
}
assert placement_counts.get("roadLamp", 0) > 0 and len(placement_counts) > 1
summary = {
    "roadLamps": placement_counts["roadLamp"],
    "trees": sum(placement_counts.values()) - placement_counts["roadLamp"],
    "libraryFiles": len(libs),
    "galleryInstances": len(gallery.objects),
    "gameShell": target["shell_key"],
    "road": road["way_id"],
    "gardenSample": index,
    "facades": sum(bool(o.get("landmark_facade")) for o in city.objects),
    "roadCurves": sum(bool(o.get("way_id")) for o in city.objects),
    "terrainNodes": sum(
        len(o.data.vertices) for o in city.objects if o.get("terrain_grid")
    ),
    "cityObjects": len(city.objects),
}
(out / "summary.json").write_text(json.dumps(summary))
print(summary)
