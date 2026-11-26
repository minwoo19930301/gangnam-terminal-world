"""Export one or more edited apartment collections in the game's local coordinate frame."""
import bpy
import json
import os
import sys
import tempfile
from mathutils import Vector
from pathlib import Path

folder = Path(__file__).resolve().parent
repo = folder.parents[2]
index = repo / "js/places/_re_models.json"
catalog = json.loads(index.read_text())
args = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
if not args:
    raise ValueError("Specify an output directory, optionally followed by apartment IDs")
target = Path(args[0]).resolve()
target.mkdir(exist_ok=True, parents=True)
groups = {coll["estate_id"]: coll for coll in bpy.context.scene.collection.children if "estate_id" in coll}
if not groups or set(args[1:]) - groups.keys():
    raise ValueError("Open banpo-apartments.blend and select IDs belonging to this library")
publish = target == (repo / "assets/re").resolve()
rows = []
with tempfile.TemporaryDirectory(dir=target) as temp:
    stage = Path(temp)
    for model_id in args[1:] or groups:
        row = next(m for m in catalog["models"] if m["id"] == model_id)
        parts = list(groups[model_id].all_objects)
        base = Vector((row["x"], -row["z"], row["y"]))
        roots = {obj: obj.location.copy() for obj in parts if obj.parent not in parts}
        keys = {}
        bpy.ops.object.select_all(action="DESELECT")
        try:
            for obj in parts:
                if obj.type == "MESH" and obj.data.shape_keys:
                    key = obj.data.shape_keys.key_blocks.get("게임 지형 높이")
                    if key and key not in keys:
                        keys[key] = key.value
                        key.value = 0
                obj.select_set(True)
            for obj, location in roots.items():
                obj.location = location - base
            bpy.context.view_layer.update()
            path = stage / (model_id + ".glb")
            bpy.ops.export_scene.gltf(
                filepath=str(path), export_format="GLB", use_selection=True, export_apply=True,
                export_morph=False, export_animations=False, export_vertex_color="MATERIAL",
                export_all_vertex_colors=True, export_cameras=False, export_lights=False,
                export_extras=False,
            )
            if publish:
                graph = bpy.context.evaluated_depsgraph_get()
                corners = []
                for obj in parts:
                    if obj.type == "MESH":
                        mesh = obj.evaluated_get(graph)
                        corners.extend(mesh.matrix_world @ Vector(p) for p in mesh.bound_box)
                if row["yaw"] != 0 or not corners:
                    raise ValueError(f"Unexpected model frame or empty collection for {model_id}")
                west, east = [round(row["x"] + f(p.x for p in corners), 1) for f in (min, max)]
                north, south = [round(row["z"] + f(-p.y for p in corners), 1) for f in (min, max)]
                row.update(rect=[[west,north],[east,north],[east,south],[west,south]],
                           height=round(max(p.z for p in corners), 1), bytes=path.stat().st_size,
                           sourceMaterial=True, nativeEdit=True)
            rows.append(path)
        finally:
            for obj, location in roots.items():
                obj.location = location
            for key, value in keys.items():
                key.value = value
            bpy.context.view_layer.update()
    # Finish validating every selected collection before replacing any game file.
    for path in rows:
        os.replace(path, target / path.name)
    if publish:
        with tempfile.NamedTemporaryFile(mode="w", dir=index.parent, delete=False) as stream:
            json.dump(catalog, stream, ensure_ascii=False, separators=(",", ":"))
        os.replace(stream.name, index)
