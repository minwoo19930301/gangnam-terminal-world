"""Bake an editable native entrance to one vertex-painted, indexed game surface."""
from pathlib import Path
import subprocess
import tempfile
import bpy
out=Path(bpy.data.filepath).parent
bpy.ops.object.select_all(action='DESELECT')
objs=list(bpy.data.collections['MegaboxBoutiquePublicFront'].objects)
for obj in objs:
    obj.select_set(True)
bpy.context.view_layer.objects.active=objs[0]
bpy.ops.object.join()
bpy.context.object.name='Surface'
with tempfile.TemporaryDirectory() as tmp:
    raw=Path(tmp)/'entrance.glb'
    bpy.ops.export_scene.gltf(filepath=str(raw),use_selection=True,export_materials='NONE',export_vertex_color='ACTIVE',export_yup=True)
    subprocess.run(['node',str(out.parent/'ssg-market-entrance'/'pack.mjs'),str(raw),str(out/'entrance.glb')],check=True)
