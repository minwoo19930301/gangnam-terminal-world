"""Export the editable mesh with its painted-panel UVs; the game shares one material."""
from pathlib import Path
import bpy
import tempfile
import subprocess
out=Path(bpy.data.filepath).parent
bpy.ops.object.select_all(action='DESELECT')
objects=list(bpy.data.collections['MarketGiftConcierge'].objects)
glass=next(o for o in objects if o.name=='케이스 유리')
objects.remove(glass)
for o in objects:o.select_set(True)
bpy.context.view_layer.objects.active=objects[0]
bpy.ops.object.join()
bpy.context.object.name='Surface'
glass.name='Glazing';glass.select_set(True)
with tempfile.TemporaryDirectory() as tmp:
    raw=Path(tmp)/'unpacked.glb'
    bpy.ops.export_scene.gltf(filepath=str(raw),use_selection=True,export_materials='NONE',export_vertex_color='ACTIVE',export_yup=True)
    subprocess.run(['node',str(out/'pack.mjs'),str(raw),str(out/'counter.glb')],check=True)
