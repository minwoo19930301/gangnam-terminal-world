"""Join the three display tiers and labels, retaining linked meshes for the stock."""
from pathlib import Path
import subprocess
import tempfile
import bpy
out=Path(bpy.data.filepath).parent
bpy.ops.object.select_all(action='DESELECT')
collection=bpy.data.collections['FreshFlowerWholesaleBank']
objs=[o for o in collection.objects if o.name.startswith(('목재','집게'))]
for obj in objs:
    obj.select_set(True)
bpy.context.view_layer.objects.active=objs[0]
bpy.ops.object.join()
bpy.context.object.name='Surface'
for obj in collection.objects:obj.select_set(True)
with tempfile.TemporaryDirectory() as tmp:
    raw=Path(tmp)/'flower-bank.glb'
    bpy.ops.export_scene.gltf(filepath=str(raw),use_selection=True,export_materials='NONE',export_vertex_color='ACTIVE',export_yup=True)
    subprocess.run(['node',str(out/'pack.mjs'),str(raw),str(out/'flower-bank.glb')],check=True)
