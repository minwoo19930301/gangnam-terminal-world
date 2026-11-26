"""Fit the linked public-court swatch to the game's plaza and Seoul terrain."""
from pathlib import Path
import json
import subprocess

import bpy
from mathutils import Vector


def mount_court(city):
    here = Path(__file__).resolve().parent
    source = here / "plaza.blend"
    tile = next((group for group in bpy.data.collections
                 if group.library and group.name == "PlazaGraniteSwatch"
                 and Path(bpy.path.abspath(group.library.filepath)).resolve() == source), None)
    if tile is None:
        with bpy.data.libraries.load(str(source), link=True, relative=True) as (_, load):
            load.collections = ["PlazaGraniteSwatch"]
        tile = load.collections[0]
    materials = []
    pavers = []
    for obj in sorted(tile.objects, key=lambda o: bool(o.get("paver"))):
        material = obj.data.materials[0]
        if material not in materials:
            materials.append(material)
        if obj.get("paver"):
            points = [obj.matrix_world @ Vector(c) for c in obj.bound_box]
            pavers.append([min(p.x for p in points), max(p.x for p in points),
                           min(p.y for p in points), max(p.y for p in points), materials.index(material)])
    if len(materials)<2 or not pavers or materials[0].name != "광장 판석 줄눈":
        raise ValueError("The plaza swatch needs its joint bed and paving.")
    tile_data = {"width":tile["tile_width"], "depth":tile["tile_depth"], "pavers":pavers}
    result = subprocess.run(["node", str(here/"surface.mjs")], input=json.dumps(tile_data),
                            capture_output=True, text=True, check=True)
    layout = json.loads(result.stdout)
    mesh = bpy.data.meshes.new("광장 판석 · 보도 표고에 맞춘 줄눈과 판재")
    mesh.from_pydata(layout["vertices"], [], layout["faces"])
    for material in materials:
        mesh.materials.append(material)
    mesh.polygons.foreach_set("material_index", layout["slots"])
    mesh.update()
    target = next((o for o in city.objects if o.get("central_plaza_paving")), None)
    if target is None:
        target = bpy.data.objects.new("센트럴시티 정문 · 장밋빛 띠와 회색 판석", mesh)
        target["central_plaza_paving"] = True
        group = next((c for c in city.collection.children_recursive
                      if c.get("indoor_group")=="centralcity/plaza-sculptures"), city.collection)
        group.objects.link(target)
        target.location = layout["anchor"]
    else:
        previous = target.data
        target.data = mesh
        if previous.users == 0:
            bpy.data.meshes.remove(previous)
    return target


if __name__ == "__main__":
    import sys
    if "--update-court" in sys.argv:
        mount_court(bpy.data.scenes["반포 · 도시 전경"])
        bpy.ops.wm.save_as_mainfile(filepath=bpy.data.filepath, compress=True)
