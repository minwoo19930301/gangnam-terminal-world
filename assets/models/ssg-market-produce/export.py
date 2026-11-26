"""Run from the editable library with Blender -b fruit-island.blend -P export.py."""
from pathlib import Path
import subprocess,tempfile
import bpy
out=Path(bpy.data.filepath).parent
objs=list(bpy.data.collections['MarketProduceIsland'].objects)
bpy.ops.object.select_all(action='DESELECT')
for o in objs:o.select_set(True)
bpy.context.view_layer.objects.active=objs[0]
bpy.ops.object.join()
bpy.context.object.name='Surface'
with tempfile.TemporaryDirectory() as tmp:
    source=Path(tmp)/'raw.glb'
    bpy.ops.export_scene.gltf(filepath=str(source),use_selection=True,export_materials='NONE',export_vertex_color='ACTIVE',export_yup=True)
    subprocess.run(['node',str(out/'pack.mjs'),str(source),str(out/'fruit-island.glb')],check=True)
