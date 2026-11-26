"""Convert the editable splines in memory and export one vertex-coloured, meshopt-compressed mesh."""
from pathlib import Path
import runpy
import subprocess
import bpy

here = Path(bpy.data.filepath).parent
bpy.ops.object.select_all(action='DESELECT')
for obj in bpy.context.scene.objects:
    obj.select_set(obj.type == 'CURVE')
curves = list(bpy.context.selected_objects)
if curves:
    bpy.context.view_layer.objects.active=curves[0]
    bpy.ops.object.convert(target='MESH')
runpy.run_path(str(here.parent/'interior-architecture'/'export.py'),run_name='__main__')
subprocess.run(['node', str(here/'pack.mjs'), str(here/'peacock.glb')], check=True)
