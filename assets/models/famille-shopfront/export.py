from pathlib import Path
import bpy
import tempfile
import subprocess
out=Path(bpy.data.filepath).parent
objects=[]
for key in ['FamilleShopfrontBay','FamilleLimestonePier']:
    bpy.ops.object.select_all(action='DESELECT')
    parts=list(bpy.data.collections[key].objects)
    for o in parts:o.select_set(True)
    bpy.context.view_layer.objects.active=parts[0]
    bpy.ops.object.join();o=bpy.context.object;o.name=key;objects.append(o)
for o in objects:o.select_set(True)
with tempfile.TemporaryDirectory() as tmp:
    raw=Path(tmp)/'unpacked.glb'
    bpy.ops.export_scene.gltf(filepath=str(raw),use_selection=True,export_materials='NONE',export_vertex_color='ACTIVE',export_yup=True)
    subprocess.run(['node',str(out/'pack.mjs'),str(raw),str(out/'arcade.glb')],check=True)
