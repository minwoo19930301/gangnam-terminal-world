"""Make the two game meshes from the edited table without resaving the .blend."""

from pathlib import Path
import sys
import bpy

out = Path(__file__).resolve().parent
col = bpy.data.collections["SSG_11F_PyongyangMyeonok"]
if "--rebake-noodles" in sys.argv:
    sys.dont_write_bytecode = True
    sys.path.insert(0, str(out))
    import noodle_bake

    noodle_bake.rebake(col)
# Joining processes the view-layer order. Create export copies in a stable
# name order so a surface regenerated after edits has the same ordering.
export_parts = bpy.data.collections.new("Game export")
bpy.context.scene.collection.children.link(export_parts)
for source in sorted(col.objects, key=lambda obj: obj.name):
    ob = source.copy()
    ob.data = source.data.copy()
    export_parts.objects.link(ob)
col.hide_viewport = True
col.hide_render = True
bpy.context.view_layer.update()
for name in ["MyeonokTable", "MyeonokSteel"]:
    parts = [o for o in export_parts.objects if o.get("displayBatch") == name]
    mat = bpy.data.materials[name + " finish"]
    bpy.ops.object.select_all(action="DESELECT")
    for obj in parts:
        obj.data.materials.clear()
        obj.data.materials.append(mat)
        obj.select_set(True)
    bpy.context.view_layer.objects.active = parts[0]
    bpy.ops.object.join()
    bpy.context.object.name = name
bpy.ops.object.select_all(action="DESELECT")
for name in ["MyeonokTable", "MyeonokSteel"]:
    bpy.data.objects[name].select_set(True)
bpy.ops.export_scene.gltf(
    filepath=str(out / "gallery.glb"),
    export_format="GLB",
    export_animations=False,
    use_selection=True,
)
