"""Export the joined game copy; the source .blend holds each editable ingredient tray."""
from pathlib import Path
from subprocess import run
from tempfile import TemporaryDirectory
import bpy

out = Path(bpy.data.filepath).parent
parts = list(bpy.data.collections["PantryBrothWells"].objects)
bpy.ops.object.select_all(action="DESELECT")
for part in parts:
    part.select_set(True)
bpy.context.view_layer.objects.active = parts[0]
bpy.ops.object.join()
bpy.context.object.name = "BrothIngredients"
with TemporaryDirectory() as work:
    file = Path(work) / "trays.glb"
    bpy.ops.export_scene.gltf(filepath=str(file), use_selection=True, export_vertex_color="ACTIVE")
    run(["node", str(out.parents[2]/"tools/pack_display.mjs"), str(file), ".88", ".00035"],check=True)
    run(["node", str(out.parents[2]/"tools/optimize_model.mjs"), str(file), str(out/"broth-wells.glb")],check=True)
