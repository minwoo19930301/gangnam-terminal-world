"""Bake an editable native entrance to one vertex-painted, indexed game surface."""
from pathlib import Path
import subprocess
import tempfile
import runpy
import bpy
out=Path(bpy.data.filepath).parent
bpy.ops.object.select_all(action='DESELECT')
objs=list(bpy.data.collections['MarketEastPortal'].objects)
# The proxy letters are baked from these same editable glyphs before the native join.
runpy.run_path(str(out/'export_lettering.py'))['write_label_module'](objs)
for obj in objs:
    obj.select_set(True)
bpy.context.view_layer.objects.active=next(o for o in objs if o.name.startswith('암석'))
bpy.ops.object.join()
bpy.context.object.name='Surface'
with tempfile.TemporaryDirectory() as tmp:
    raw=Path(tmp)/'entrance.glb'
    bpy.ops.export_scene.gltf(filepath=str(raw),use_selection=True,export_materials='NONE',export_vertex_color='ACTIVE',export_yup=True)
    subprocess.run(['node',str(out/'pack.mjs'),str(raw),str(out/'entrance.glb')],check=True)
